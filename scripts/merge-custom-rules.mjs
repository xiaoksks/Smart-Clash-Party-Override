import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { buildRuleSetOverrideRules, buildWebRtcProtectionRules, loadCustomSpec, ROOT } from './custom-spec.mjs'
import {
  createGraphSandbox,
  fetchNormalSource,
  fetchRoutingGraph,
  fetchTrafficOptions,
  parseNormalVersion,
} from './upstream-source.mjs'

const DIST_DIR = path.join(ROOT, 'dist')
const BUILD_DIR = path.join(ROOT, '.build')

const TARGETS = [
  {
    id: 'normal',
    name: 'Normal override',
    outputFile: 'Normal-Override.js',
    mode: 'normal',
  },
  {
    id: 'lite',
    name: 'Lite override',
    outputFile: 'Lite-Override.js',
    mode: 'lite',
  },
]

async function readCurrentVersion(target) {
  try {
    return parseNormalVersion(await readFile(path.join(DIST_DIR, target.outputFile), 'utf8'))
  } catch {
    return null
  }
}

function buildHeader(spec, upstream, providerBundle, mode = 'normal') {
  return [
    '// This file is generated automatically. Do not edit dist output directly.',
    `// Edition: ${mode === 'lite' ? 'Lite (Minimal Dual-Group: Foreign & Domestic)' : 'Normal (Standard url-test)'}`,
    `// Upstream source: ${upstream.url}`,
    `// Upstream version: ${upstream.version}`,
    `// Upstream SHA-256: ${upstream.sha256}`,
    '// Edit custom-overrides.js, then run: npm run check',
    '',
    `const CUSTOM_REMOVE_AD_BLOCKING = ${JSON.stringify(spec.removeAdBlocking)}`,
    `const CUSTOM_FORCE_CHINA_IP_DIRECT = ${JSON.stringify(spec.forceChinaIpDirect)}`,
    `const CUSTOM_PREVENT_WEBRTC_LEAK = ${JSON.stringify(spec.preventWebRtcLeak)}`,
    `const CUSTOM_WEBRTC_BROWSER_PROCESSES = ${JSON.stringify(spec.webRtcBrowserProcesses)}`,
    `const CUSTOM_WEBRTC_PORTS = ${JSON.stringify(spec.webRtcPorts)}`,
    `const CUSTOM_WEBRTC_DOMAINS = ${JSON.stringify(spec.webRtcDomains || [])}`,
    `const CUSTOM_TUN_EXCLUDE_PROCESSES = ${JSON.stringify(spec.tunExcludeProcesses, null, 2)}`,
    `const CUSTOM_WEBRTC_RULES = ${JSON.stringify(buildWebRtcProtectionRules(spec), null, 2)}`,
    `const CUSTOM_RULE_SET_TARGET_OVERRIDES = ${JSON.stringify(spec.ruleSetTargetOverrides, null, 2)}`,
    `const CUSTOM_RULE_SET_RULES = ${JSON.stringify(buildRuleSetOverrideRules(spec), null, 2)}`,
    `const CUSTOM_RULE_SET_PROVIDER_BASE = ${JSON.stringify(providerBundle.base)}`,
    `const CUSTOM_RULE_SET_PROVIDER_SPECS = ${JSON.stringify(providerBundle.specs, null, 2)}`,
    `const CUSTOM_PRE_RULES = ${JSON.stringify(spec.preRules, null, 2)}`,
    `const CUSTOM_FOREIGN_DNS_DOMAINS = ${JSON.stringify(spec.foreignDnsDomains, null, 2)}`,
    '',
  ].join('\n')
}

function renameUpstreamMain(upstream) {
  const marker = 'function main(config) {'
  const count = upstream.split(marker).length - 1
  if (count !== 1) throw new Error(`Expected exactly one upstream main(config), found ${count}`)
  return upstream.replace(marker, 'function upstreamMain(config) {')
}

function readRuleSetProviderBundle(graph, spec, trafficOptions) {
  const sandbox = createGraphSandbox({}, trafficOptions?.body)
  const metadata = vm.runInNewContext(
    `${graph.body}\n;({ base: MIHOMO_MRS_RULESET_BASE, providers: MIHOMO_MRS_PROVIDER_MAP })`,
    sandbox,
    { filename: 'routing-graph.js', timeout: 5000 },
  )
  const specs = {}
  for (const name of Object.keys(spec.ruleSetTargetOverrides)) {
    const provider = metadata.providers?.[name]
    if (!provider?.file || !provider?.behavior) {
      throw new Error(`Routing graph has no standalone Mihomo MRS provider: ${name}`)
    }
    specs[name] = { behavior: provider.behavior, file: provider.file }
  }
  return { base: metadata.base, specs }
}



function buildLocalRuntime(mode = 'normal') {
  return `

// ================================================================
//  Local post-processing layer
// ================================================================

function localPreferHuluUs(config) {
  var group = (config['proxy-groups'] || []).find(function(item) {
    return item && item.name === BIZ.HULU
  })
  if (!group || !Array.isArray(group.proxies)) return

  var preferred = [SMART.US_HOME, SMART.US]
  group.proxies = preferred.filter(function(name) {
    return group.proxies.indexOf(name) !== -1
  }).concat(group.proxies.filter(function(name) {
    return preferred.indexOf(name) === -1
  }))
}

function localPreferAiSupported(config) {
  var group = (config['proxy-groups'] || []).find(function(item) {
    return item && item.name === BIZ.AI
  })
  if (!group || !Array.isArray(group.proxies)) return

  // Preferred supported regions for OpenAI / ChatGPT:
  // US is native home with lowest rate limits; Singapore, Japan/Korea, Americas and Europe have full official support.
  // HK is explicitly NOT supported by OpenAI and causes Cloudflare loops / 403 blocks; demote to tail.
  var preferred = [
    SMART.US_HOME, SMART.US,
    SMART.SG_HOME, SMART.SG,
    SMART.JPKR_HOME, SMART.JPKR,
    SMART.AMERICAS_HOME, SMART.AMERICAS,
    SMART.EU_HOME, SMART.EU,
  ]
  var hkProxies = [SMART.HK_HOME, SMART.HK]

  var existing = group.proxies.slice()
  var prioritized = preferred.filter(function(name) {
    return existing.indexOf(name) !== -1
  })
  var middle = existing.filter(function(name) {
    return preferred.indexOf(name) === -1 && hkProxies.indexOf(name) === -1
  })
  var tail = hkProxies.filter(function(name) {
    return existing.indexOf(name) !== -1
  })

  group.proxies = prioritized.concat(middle, tail)
}

function localRuleTarget(rule) {
  var parts = String(rule).split(',')
  return parts[parts.length - 1] === 'no-resolve' ? parts[parts.length - 2] : parts[parts.length - 1]
}

function localIsChinaIpProvider(provider) {
  return provider && provider.behavior === 'ipcidr' && /-cn-site-ipcidr(?:-no-resolve)?\\.mrs(?:\\?|$)/.test(String(provider.url || ''))
}

function localPromoteChinaIpDirect(config) {
  if (!CUSTOM_FORCE_CHINA_IP_DIRECT) return []
  var providers = config['rule-providers'] || {}
  var matches = []

  config.rules = (config.rules || []).filter(function(rule) {
    var parts = String(rule).split(',')
    if (parts[0] !== 'RULE-SET' || !localIsChinaIpProvider(providers[parts[1]])) return true
    parts[2] = 'DIRECT'
    if (parts.indexOf('no-resolve') === -1) parts.push('no-resolve')
    matches.push(parts.join(','))
    return false
  })

  if (matches.length !== 1) {
    throw new Error('Expected exactly one authoritative China IP rule, found ' + matches.length)
  }
  return matches
}

function localRemoveAdBlocking(config) {
  if (!CUSTOM_REMOVE_AD_BLOCKING) return
  var adPolicy = typeof BIZ !== 'undefined' && BIZ.AD ? BIZ.AD : '🛑 广告拦截'
  var removedProviders = new Set()

  config.rules = (config.rules || []).filter(function(rule) {
    if (localRuleTarget(rule) !== adPolicy) return true
    var parts = String(rule).split(',')
    if (parts[0] === 'RULE-SET' && parts[1]) removedProviders.add(parts[1])
    return false
  })

  config['proxy-groups'] = (config['proxy-groups'] || []).filter(function(group) {
    if (!group || group.name === adPolicy) return false
    if (Array.isArray(group.proxies)) {
      group.proxies = group.proxies.filter(function(target) { return target !== adPolicy })
    }
    return true
  })

  var referencedProviders = new Set()
  config.rules.forEach(function(rule) {
    var parts = String(rule).split(',')
    if (parts[0] === 'RULE-SET' && parts[1]) referencedProviders.add(parts[1])
  })
  var providers = config['rule-providers'] || {}
  removedProviders.forEach(function(name) {
    if (!referencedProviders.has(name)) delete providers[name]
  })
}

function localInstallRuleSetTargetOverrides(config) {
  var names = Object.keys(CUSTOM_RULE_SET_TARGET_OVERRIDES)
  names.forEach(function(name) {
    if (!CUSTOM_RULE_SET_PROVIDER_SPECS[name] || !CUSTOM_RULE_SET_PROVIDER_SPECS[name].file) {
      throw new Error('Upstream MRS provider is unavailable: ' + name)
    }
  })

  var providers = config['rule-providers'] || {}
  names.forEach(function(name) {
    var providerName = 'local-' + name
    var spec = CUSTOM_RULE_SET_PROVIDER_SPECS[name]
    providers[providerName] = {
      type: 'http',
      behavior: spec.behavior,
      format: 'mrs',
      url: CUSTOM_RULE_SET_PROVIDER_BASE + '/' + spec.file + '?scki=' + encodeURIComponent(VERSION),
      path: './ruleset/local/' + VERSION + '/' + spec.file,
      interval: 86400,
      proxy: BIZ.GFW,
    }
  })
  config['rule-providers'] = providers
}

function localRuleUsesWebRtcPort(rule) {
  var source = String(rule)
  return CUSTOM_WEBRTC_PORTS.some(function(port) {
    return source.indexOf('DST-PORT,' + port) !== -1
  })
}

function localPreventWebRtcLeak(config) {
  if (CUSTOM_PREVENT_WEBRTC_LEAK) {
    // Upstream currently sends common STUN/TURN ports DIRECT; remove future variants too.
    config.rules = (config.rules || []).filter(function(rule) {
      return !(localRuleTarget(rule) === 'DIRECT' && localRuleUsesWebRtcPort(rule))
    })

    if (!config.tun) config.tun = {}
    config.tun.enable = true
    config.tun['auto-route'] = true
    config.tun['strict-route'] = false
    config.tun['auto-detect-interface'] = true
  }

  if (Array.isArray(CUSTOM_TUN_EXCLUDE_PROCESSES) && CUSTOM_TUN_EXCLUDE_PROCESSES.length > 0) {
    if (!config.tun) config.tun = {}
    var excludeList = Array.isArray(config.tun['exclude-process']) ? config.tun['exclude-process'].slice() : []
    var excludeSet = new Set(excludeList.map(function(name) { return String(name).toLowerCase() }))
    CUSTOM_TUN_EXCLUDE_PROCESSES.forEach(function(name) {
      var lower = String(name).toLowerCase()
      if (!excludeSet.has(lower)) {
        excludeList.push(name)
        excludeSet.add(lower)
      }
    })
    config.tun['exclude-process'] = excludeList
  }

  if (CUSTOM_PREVENT_WEBRTC_LEAK && config.tun && Array.isArray(config.tun['exclude-process'])) {
    var browsers = new Set(CUSTOM_WEBRTC_BROWSER_PROCESSES.map(function(name) { return name.toLowerCase() }))
    config.tun['exclude-process'] = config.tun['exclude-process'].filter(function(name) {
      return !browsers.has(String(name).toLowerCase())
    })
  }
}

function localApplyDns(config) {
  if (!config.dns) config.dns = {}
  config.dns['use-hosts'] = true
  // Remove doh.pub (119.29.29.29:443) which causes 20s connectex timeouts on many broadband lines
  var domesticDoH = ['https://dns.alidns.com/dns-query']
  var domesticPlain = ['223.5.5.5', '223.6.6.6', '119.29.29.29']
  var foreignDoH = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query']

  config.dns.nameserver = ['223.5.5.5'].concat(domesticDoH)

  // Bootstrap DNS: Plain IP UDP 53 first to eliminate cold-start TLS handshake timeout.
  config.dns['default-nameserver'] = domesticPlain.slice()

  // Node server domain resolution: Domestic plain IP first so airport nodes resolve instantly in 2ms on cold start before proxy is established.
  config.dns['proxy-server-nameserver'] = ['223.5.5.5', '223.6.6.6'].concat(domesticDoH, foreignDoH)

  config.dns['direct-nameserver'] = domesticPlain.concat(domesticDoH)
  config.dns['direct-nameserver-follow-policy'] = false
  if (!config.dns['nameserver-policy'] || typeof config.dns['nameserver-policy'] !== 'object' || Array.isArray(config.dns['nameserver-policy'])) {
    config.dns['nameserver-policy'] = {}
  }

  // Strip unreachable doh.pub from all upstream nameserver-policy entries (e.g. geosite:cn)
  Object.keys(config.dns['nameserver-policy']).forEach(function(key) {
    var val = config.dns['nameserver-policy'][key]
    if (Array.isArray(val)) {
      config.dns['nameserver-policy'][key] = val.filter(function(server) {
        return String(server).indexOf('doh.pub') === -1
      })
      if (config.dns['nameserver-policy'][key].length === 0) {
        config.dns['nameserver-policy'][key] = ['223.5.5.5'].concat(domesticDoH)
      }
    }
  })

  // Ensure geosite:cn always includes plain UDP 223.5.5.5 for instant cold-start resolution
  if (config.dns['nameserver-policy']['geosite:cn']) {
    config.dns['nameserver-policy']['geosite:cn'] = ['223.5.5.5'].concat(domesticDoH)
  }

  // Purge dead doh.pub (119.29.29.29:443) from hosts mapping
  if (config.hosts && typeof config.hosts === 'object') {
    delete config.hosts['doh.pub']
  }

  // Windows NCSI probes must resolve immediately via domestic DNS on cold start so Windows marks internet active
  config.dns['nameserver-policy']['+.msftconnecttest.com'] = ['223.5.5.5'].concat(domesticDoH)
  config.dns['nameserver-policy']['+.msftncsi.com'] = ['223.5.5.5'].concat(domesticDoH)

  CUSTOM_FOREIGN_DNS_DOMAINS.forEach(function(host) {
    config.dns['nameserver-policy'][host] = foreignDoH.slice()
  })
}

function localPrependRules(config, chinaIpRules) {
  if (!Array.isArray(config.rules)) config.rules = []
  var directPreRules = CUSTOM_PRE_RULES.filter(function(rule) {
    return localRuleTarget(rule) === 'DIRECT'
  })
  var nonDirectPreRules = CUSTOM_PRE_RULES.filter(function(rule) {
    return localRuleTarget(rule) !== 'DIRECT'
  })
  var priorityRules = CUSTOM_RULE_SET_RULES.concat(
    directPreRules,
    chinaIpRules,
    CUSTOM_WEBRTC_RULES,
    nonDirectPreRules
  )
  var custom = new Set(priorityRules)
  config.rules = priorityRules.concat(config.rules.filter(function(rule) { return !custom.has(rule) }))
}

function applyLocalOverrides(config) {
  if (!config || typeof config !== 'object') return config
  if (!Array.isArray(config.proxies) || config.proxies.length === 0) return config
  if (!config.profile || typeof config.profile !== 'object') config.profile = {}
  config.profile['store-selected'] = false
  // Persist Fake-IP mapping to disk so restarts don't drop browser cached 198.18.x.x IPs
  config.profile['store-fake-ip'] = true
  localPreferHuluUs(config)
  localPreferAiSupported(config)
  localRemoveAdBlocking(config)
  localInstallRuleSetTargetOverrides(config)
  localPreventWebRtcLeak(config)
  localApplyDns(config)
  var chinaIpRules = localPromoteChinaIpDirect(config)
  localPrependRules(config, chinaIpRules)
  console.log('[local] Applied China IP direct routing, WebRTC leak protection, ad-blocking preference, rule-set targets, custom rules, proxy-group preferences, DNS policy, Hulu US preference and AI service region preference')
  return config
}
` + (mode === 'lite' ? `
function localApplyLiteSimplification(config) {
  if (!config || typeof config !== 'object') return config
  if (!Array.isArray(config.proxies) || config.proxies.length === 0) return config

  var nodeClass = classifyAllNodes(config.proxies || [])
  var cnNodes = Array.isArray(nodeClass.CN) ? nodeClass.CN : []
  var allNodes = Array.isArray(nodeClass.ALL) ? nodeClass.ALL : []
  var cnSet = new Set(cnNodes)
  var foreignNodes = allNodes.filter(function(name) { return !cnSet.has(name) })

  var foreignGroup = {
    name: '🌐 国外节点',
    type: 'select',
    proxies: foreignNodes.length > 0 ? foreignNodes : ['REJECT'],
  }
  var domesticGroup = {
    name: '🇨🇳 国内节点',
    type: 'select',
    proxies: ['DIRECT'].concat(cnNodes),
  }
  config['proxy-groups'] = [foreignGroup, domesticGroup]

  var DOMESTIC_TARGETS = new Set([
    'DIRECT',
    typeof BIZ !== 'undefined' && BIZ.CN_SITE ? BIZ.CN_SITE : '🏠 国内网站',
    typeof BIZ !== 'undefined' && BIZ.CNMEDIA ? BIZ.CNMEDIA : '📺 国内流媒体',
    typeof BIZ !== 'undefined' && BIZ.GAME_CN ? BIZ.GAME_CN : '🕹️ 国内游戏',
    '🇨🇳 常用网站',
    '📺 国内媒体',
    '🕹️ 国内游戏',
    '🇨🇳 国内节点',
  ])
  var REJECT_TARGETS = new Set(['REJECT', 'REJECT-DROP', 'PASS'])

  var seenRules = new Set()
  var newRules = []
  ;(config.rules || []).forEach(function(rule) {
    var parts = String(rule).split(',')
    var hasNoResolve = parts[parts.length - 1] === 'no-resolve'
    var oldTarget = hasNoResolve ? parts[parts.length - 2] : parts[parts.length - 1]

    var newTarget
    if (REJECT_TARGETS.has(oldTarget)) {
      newTarget = oldTarget
    } else if (DOMESTIC_TARGETS.has(oldTarget)) {
      newTarget = '🇨🇳 国内节点'
    } else {
      newTarget = '🌐 国外节点'
    }

    if (hasNoResolve) {
      parts[parts.length - 2] = newTarget
    } else {
      parts[parts.length - 1] = newTarget
    }
    var transformed = parts.join(',')
    if (!seenRules.has(transformed)) {
      seenRules.add(transformed)
      newRules.push(transformed)
    }
  })
  config.rules = newRules

  var providers = config['rule-providers'] || {}
  Object.keys(providers).forEach(function(key) {
    var p = providers[key]
    if (p && typeof p === 'object' && p.proxy && p.proxy !== 'DIRECT') {
      p.proxy = '🌐 国外节点'
    }
  })

  config.listeners = [
    { name: 'MIXED-PROXY', type: 'mixed', port: 50000, proxy: '🌐 国外节点' },
    { name: 'MIXED-DIRECT', type: 'mixed', port: 10086, proxy: 'DIRECT' },
  ]
  console.log('[local-lite] Simplified to 2 proxy groups: "🌐 国外节点" (' + foreignNodes.length + ' proxies) and "🇨🇳 国内节点" (' + (1 + cnNodes.length) + ' proxies)')
  return config
}

function main(config) {
  var upstreamResult = upstreamMain(config)
  try {
    var withLocal = applyLocalOverrides(upstreamResult)
    return localApplyLiteSimplification(withLocal)
  } catch (error) {
    console.error('[local-lite] Post-processing failed:', error)
    return upstreamResult
  }
}
` : `
function main(config) {
  var upstreamResult = upstreamMain(config)
  try {
    return applyLocalOverrides(upstreamResult)
  } catch (error) {
    console.error('[local] Post-processing failed:', error)
    return upstreamResult
  }
}
`) + `
`
}

function generateOutput(upstream, spec, graph, trafficOptions, mode = 'normal') {
  const source = upstream.body.replace(/^\uFEFF/, '')
  if (!source.includes('function applyMihomoFusedRuleSets(config) {')) {
    throw new Error('Upstream no longer exposes the fused Mihomo ruleset contract')
  }
  const providerBundle = readRuleSetProviderBundle(graph, spec, trafficOptions)
  return buildHeader(spec, upstream, providerBundle, mode) + renameUpstreamMain(source) + buildLocalRuntime(mode)
}

async function persistBuildSnapshot(normalUpstream, graph, trafficOptions) {
  await mkdir(BUILD_DIR, { recursive: true })
  await Promise.all([
    writeFile(path.join(BUILD_DIR, 'upstream-normal.js'), normalUpstream.body, 'utf8'),
    writeFile(path.join(BUILD_DIR, 'routing-graph.js'), graph.body, 'utf8'),
    writeFile(path.join(BUILD_DIR, 'traffic-options.json'), trafficOptions.body, 'utf8'),
    writeFile(path.join(BUILD_DIR, 'metadata.json'), `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      upstream: { url: normalUpstream.url, version: normalUpstream.version, sha256: normalUpstream.sha256 },
      normal: { url: normalUpstream.url, version: normalUpstream.version, sha256: normalUpstream.sha256 },
      routingGraph: { url: graph.url, version: graph.version, sha256: graph.sha256 },
      trafficOptions: { url: trafficOptions.url, version: trafficOptions.version, sha256: trafficOptions.sha256 },
    }, null, 2)}\n`, 'utf8'),
  ])
}

async function mainBuild() {
  const [spec, normalCurrentVersion] = await Promise.all([
    loadCustomSpec(),
    readCurrentVersion(TARGETS[0]),
  ])
  const [normalUpstream, trafficOptions] = await Promise.all([
    fetchNormalSource({ minimumVersion: normalCurrentVersion || undefined }),
    fetchTrafficOptions(),
  ])
  const graph = await fetchRoutingGraph({ requiredBaseVersion: normalUpstream.version })

  const normalOutput = generateOutput(normalUpstream, spec, graph, trafficOptions, 'normal')
  const liteOutput = generateOutput(normalUpstream, spec, graph, trafficOptions, 'lite')

  await Promise.all([
    mkdir(DIST_DIR, { recursive: true }),
    persistBuildSnapshot(normalUpstream, graph, trafficOptions),
  ])

  const normalPath = path.join(DIST_DIR, TARGETS[0].outputFile)
  const litePath = path.join(DIST_DIR, TARGETS[1].outputFile)

  await Promise.all([
    writeFile(normalPath, normalOutput, 'utf8'),
    writeFile(litePath, liteOutput, 'utf8'),
  ])

  console.log(`Generated ${path.relative(ROOT, normalPath)} from ${normalUpstream.version} (${normalUpstream.sha256.slice(0, 12)})`)
  console.log(`Generated ${path.relative(ROOT, litePath)} from ${normalUpstream.version} (${normalUpstream.sha256.slice(0, 12)})`)
}

mainBuild().catch(error => {
  console.error(error)
  process.exit(1)
})
