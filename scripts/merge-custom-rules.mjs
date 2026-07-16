import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadCustomSpec, ROOT } from './custom-spec.mjs'
import { fetchRoutingGraph, fetchSmartSource, parseSmartVersion } from './upstream-source.mjs'

const OUTPUT_PATH = path.join(ROOT, 'dist', 'Smart-Override.js')
const BUILD_DIR = path.join(ROOT, '.build')

async function readCurrentVersion() {
  try {
    return parseSmartVersion(await readFile(OUTPUT_PATH, 'utf8'))
  } catch {
    return null
  }
}

function buildHeader(spec, upstream) {
  return [
    '// This file is generated automatically. Do not edit dist output directly.',
    `// Upstream source: ${upstream.url}`,
    `// Upstream version: ${upstream.version}`,
    `// Upstream SHA-256: ${upstream.sha256}`,
    '// Edit custom-overrides.js, then run: npm run check',
    '',
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

function stripDeprecatedSmartStrategy(upstream) {
  const smartGroupStrategy = /(function upsertSmartGroup\(config, name, proxies\)\s*\{[\s\S]*?var group\s*=\s*\{[^}\n]*?),\s*strategy\s*:\s*(['"])[^'"]+\2/
  return upstream.replace(smartGroupStrategy, (_match, prefix) => prefix)
}

function buildLocalRuntime() {
  return `

// ================================================================
//  Local post-processing layer
// ================================================================

const LOCAL_REGION_ORDER = ['GLOBAL', 'HK', 'SG', 'TW', 'JPKR', 'APAC', 'US', 'EU', 'AMERICAS', 'OTHER', 'AFRICA']

function localExistingProxyNames(config) {
  var names = new Set(['DIRECT', 'REJECT'])
  ;(config['proxy-groups'] || []).forEach(function(group) {
    if (group && group.name) names.add(group.name)
  })
  return names
}

function localWithResidential(keys) {
  var result = []
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var homeKey = typeof REGION_HOME_MAP !== 'undefined' ? REGION_HOME_MAP[key] : null
    if (homeKey && SMART[homeKey]) result.push(SMART[homeKey])
    if (SMART[key]) result.push(SMART[key])
  }
  return result
}

function localHomeFirst(keys) {
  var homes = []
  var full = []
  for (var i = 0; i < keys.length; i++) {
    var homeKey = typeof REGION_HOME_MAP !== 'undefined' ? REGION_HOME_MAP[keys[i]] : null
    if (homeKey && SMART[homeKey]) homes.push(SMART[homeKey])
    if (SMART[keys[i]]) full.push(SMART[keys[i]])
  }
  return homes.concat(full, ['DIRECT'])
}

function localFilterExisting(values, existing) {
  var seen = new Set()
  return values.filter(function(value) {
    if (!existing.has(value) || seen.has(value)) return false
    seen.add(value)
    return true
  })
}

function localSetGroupProxies(groupIndex, groupName, proxies, existing) {
  var group = groupIndex.get(groupName)
  if (group) group.proxies = localFilterExisting(proxies, existing)
}

function localApplyBusinessGroupOrder(config) {
  var existing = localExistingProxyNames(config)
  var groupIndex = new Map()
  ;(config['proxy-groups'] || []).forEach(function(group) {
    if (group && group.name) groupIndex.set(group.name, group)
  })
  var standard = localWithResidential(LOCAL_REGION_ORDER).concat('DIRECT')
  var directFirst = ['DIRECT'].concat(localWithResidential(LOCAL_REGION_ORDER))
  var ai = localHomeFirst(LOCAL_REGION_ORDER)
  var tracker = ['REJECT', 'DIRECT'].concat(localWithResidential(['HK', 'SG', 'GLOBAL', 'APAC']))
  function region(primary) {
    return localWithResidential([primary].concat(LOCAL_REGION_ORDER.filter(function(key) { return key !== primary }))).concat('DIRECT')
  }

  ;[
    BIZ.CRYPTO, BIZ.PAYMENTS, BIZ.IM, BIZ.SOCIAL, BIZ.WORK, BIZ.TOK,
    BIZ.NFLX, BIZ.DSNP, BIZ.HBO, BIZ.PRIME, BIZ.YT, BIZ.MUSIC,
    BIZ.STREAM_OTHER, BIZ.GAME_INTL, BIZ.GOOGLE, BIZ.TOOLS, BIZ.MS,
    BIZ.DOWNLOAD, BIZ.GFW, BIZ.INTL_SITE, BIZ.FINAL,
  ].forEach(function(name) { localSetGroupProxies(groupIndex, name, standard, existing) })

  ;[BIZ.CNMEDIA, BIZ.GAME_CN, BIZ.APPLE, BIZ.CN_SITE].forEach(function(name) {
    localSetGroupProxies(groupIndex, name, directFirst, existing)
  })

  localSetGroupProxies(groupIndex, BIZ.AI, ai, existing)
  localSetGroupProxies(groupIndex, BIZ.HULU, region('US'), existing)
  localSetGroupProxies(groupIndex, BIZ.STREAM_HK, region('HK'), existing)
  localSetGroupProxies(groupIndex, BIZ.STREAM_TW, region('TW'), existing)
  localSetGroupProxies(groupIndex, BIZ.STREAM_JP, region('JPKR'), existing)
  localSetGroupProxies(groupIndex, BIZ.STREAM_EU, region('EU'), existing)
  localSetGroupProxies(groupIndex, BIZ.TRACKER, tracker, existing)
}

function localApplyProxyGroupOverrides(config) {
  config['proxy-groups'] = (config['proxy-groups'] || []).filter(function(group) {
    return group && group.name !== 'GLOBAL'
  })
  localApplyBusinessGroupOrder(config)
}

function localApplyDns(config) {
  if (!config.dns) config.dns = {}
  var domesticDoH = ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query']
  var domesticPlain = ['223.5.5.5', '223.6.6.6', '119.29.29.29']
  var foreignDoH = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query']
  config.dns['direct-nameserver'] = domesticDoH.concat(domesticPlain)
  config.dns['direct-nameserver-follow-policy'] = false
  if (!config.dns['nameserver-policy'] || typeof config.dns['nameserver-policy'] !== 'object' || Array.isArray(config.dns['nameserver-policy'])) {
    config.dns['nameserver-policy'] = {}
  }
  CUSTOM_FOREIGN_DNS_DOMAINS.forEach(function(host) {
    config.dns['nameserver-policy'][host] = foreignDoH.slice()
  })
}

function localPrependRules(config) {
  if (!Array.isArray(config.rules)) config.rules = []
  var custom = new Set(CUSTOM_PRE_RULES)
  config.rules = CUSTOM_PRE_RULES.concat(config.rules.filter(function(rule) { return !custom.has(rule) }))
}

function applyLocalOverrides(config) {
  if (!config || typeof config !== 'object') return config
  if (!Array.isArray(config.proxies) || config.proxies.length === 0) return config
  if (!config.profile || typeof config.profile !== 'object') config.profile = {}
  config.profile['store-selected'] = false
  localApplyProxyGroupOverrides(config)
  localApplyDns(config)
  localPrependRules(config)
  console.log('[local] Applied custom rules, proxy-group preferences, DNS policy and Hulu US preference')
  return config
}

function main(config) {
  var upstreamResult = upstreamMain(config)
  try {
    return applyLocalOverrides(upstreamResult)
  } catch (error) {
    console.error('[local] Post-processing failed:', error)
    return upstreamResult
  }
}
`
}

function generateOutput(upstream, spec) {
  const source = stripDeprecatedSmartStrategy(upstream.body.replace(/^\uFEFF/, ''))
  if (!source.includes('function applyMihomoFusedRuleSets(config) {')) {
    throw new Error('Upstream no longer exposes the fused Mihomo ruleset contract')
  }
  return buildHeader(spec, upstream) + renameUpstreamMain(source) + buildLocalRuntime()
}

async function persistBuildSnapshot(upstream, graph) {
  await mkdir(BUILD_DIR, { recursive: true })
  await Promise.all([
    writeFile(path.join(BUILD_DIR, 'upstream-smart.js'), upstream.body, 'utf8'),
    writeFile(path.join(BUILD_DIR, 'routing-graph.js'), graph.body, 'utf8'),
    writeFile(path.join(BUILD_DIR, 'metadata.json'), `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      upstream: { url: upstream.url, version: upstream.version, sha256: upstream.sha256 },
      routingGraph: { url: graph.url, version: graph.version, sha256: graph.sha256 },
    }, null, 2)}\n`, 'utf8'),
  ])
}

async function mainBuild() {
  const [spec, currentVersion] = await Promise.all([loadCustomSpec(), readCurrentVersion()])
  const upstream = await fetchSmartSource({ minimumVersion: currentVersion || undefined })
  const graph = await fetchRoutingGraph({ requiredVersion: upstream.version })
  const output = generateOutput(upstream, spec)

  await Promise.all([
    mkdir(path.dirname(OUTPUT_PATH), { recursive: true }),
    persistBuildSnapshot(upstream, graph),
  ])
  await writeFile(OUTPUT_PATH, output, 'utf8')
  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)} from ${upstream.version} (${upstream.sha256.slice(0, 12)})`)
}

mainBuild().catch(error => {
  console.error(error)
  process.exit(1)
})
