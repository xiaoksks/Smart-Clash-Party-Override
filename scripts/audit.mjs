import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { buildChinaIpDirectRules, buildRuleSetOverrideRules, loadCustomSpec, ROOT } from './custom-spec.mjs'

const DIST_PATH = path.join(ROOT, 'dist', 'Lite-Override.js')
const BUILTINS = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS'])

function fixtureConfig() {
  const nodes = [
    { name: '🇭🇰 香港 01 | BGP专线', type: 'ss' },
    { name: '🇸🇬 新加坡 01 | 优质流媒体', type: 'ss' },
    { name: '🇺🇸 美国 01 | 原生住宅', type: 'ss' },
    { name: '🇯🇵 日本 01 | 低延迟', type: 'ss' },
    { name: '🇨🇳 国内中转-上海电信', type: 'ss' },
    { name: 'JP01 | Tokyo IPLC', type: 'ss' },
    { name: 'Japan02 | Premium', type: 'ss' },
    { name: '🇯🇵 Osaka03', type: 'ss' },
    { name: 'JPX 01 | Test', type: 'ss' },
    { name: '🇨🇦 Canada 01', type: 'ss' },
    { name: '流量信息：剩余 888GB', type: 'ss' },
    { name: '套餐到期：2028-12-31', type: 'ss' },
    { name: '🇺🇸 Direct placeholder', type: 'direct' },
    { name: '🇯🇵 Reject placeholder', type: 'reject' },
  ]
  return {
    proxies: nodes.map((node, index) => ({
      ...node,
      server: `198.51.100.${index + 1}`,
      port: 443,
      cipher: 'aes-128-gcm',
      password: 'test',
    })),
    'proxy-groups': [],
    rules: [],
  }
}

function runOverride(code, config) {
  const runtimeErrors = []
  const sandbox = {
    __config: config,
    console: {
      log() {},
      error(...args) { runtimeErrors.push(args.map(v => String(v?.message || v)).join(' ')) },
    },
  }
  const result = vm.runInNewContext(`${code}\n;main(__config)`, sandbox, { timeout: 5000 })
  if (runtimeErrors.length) throw new Error(`Generated override failed at runtime:\n${runtimeErrors.join('\n')}`)
  return result
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function ruleTarget(rule) {
  const parts = String(rule).split(',')
  return parts[parts.length - 1] === 'no-resolve' ? parts[parts.length - 2] : parts[parts.length - 1]
}

export async function auditLiteOverride() {
  const [code, spec] = await Promise.all([
    readFile(DIST_PATH, 'utf8'),
    loadCustomSpec(),
  ])

  const initial = fixtureConfig()
  const result = runOverride(code, initial)

  // 1. Assert exactly 3 visible proxy groups + 1 hidden GLOBAL group
  const groups = result['proxy-groups'] || []
  const visibleGroups = groups.filter(g => !g.hidden)
  assert(visibleGroups.length === 3, `Expected exactly 3 visible proxy groups, found ${visibleGroups.length}`)

  const foreignGroup = groups.find(g => g.name === '🌐 国外节点')
  const nonJpGroup = groups.find(g => g.name === '🚫 日本禁用')
  const domesticGroup = groups.find(g => g.name === '🇨🇳 国内节点')
  const globalGroup = groups.find(g => g.name === 'GLOBAL')

  assert(foreignGroup, 'Missing "🌐 国外节点" group')
  assert(nonJpGroup, 'Missing "🚫 日本禁用" group')
  assert(domesticGroup, 'Missing "🇨🇳 国内节点" group')
  assert(globalGroup, 'Missing "GLOBAL" group')

  assert(foreignGroup.type === 'select', '"🌐 国外节点" must be select type')
  assert(nonJpGroup.type === 'select', '"🚫 日本禁用" must be select type')
  assert(domesticGroup.type === 'select', '"🇨🇳 国内节点" must be select type')
  assert(globalGroup.type === 'select', '"GLOBAL" must be select type')
  assert(globalGroup.hidden === true, '"GLOBAL" group must have hidden: true')
  assert(globalGroup.proxies[0] === '🌐 国外节点', '"GLOBAL" first proxy must be "🌐 国外节点"')

  // Check node classification
  assert(foreignGroup.proxies.includes('🇭🇰 香港 01 | BGP专线'), 'Foreign group missing HK node')
  assert(foreignGroup.proxies.includes('🇺🇸 美国 01 | 原生住宅'), 'Foreign group missing US node')
  assert(foreignGroup.proxies.includes('🇯🇵 日本 01 | 低延迟'), 'Foreign group missing JP node')
  assert(foreignGroup.proxies.includes('🇨🇦 Canada 01'), 'Foreign group missing unlisted-country node')
  assert(foreignGroup.proxies.includes('JPX 01 | Test'), 'Foreign group must not treat JPX as a Japan marker')
  assert(!foreignGroup.proxies.includes('🇨🇳 国内中转-上海电信'), 'Foreign group must not include CN node')
  assert(!foreignGroup.proxies.includes('🇺🇸 Direct placeholder'), 'Foreign group must exclude DIRECT proxy entries')
  assert(!foreignGroup.proxies.includes('🇯🇵 Reject placeholder'), 'Foreign group must exclude REJECT proxy entries')
  assert(!foreignGroup.proxies.some(n => /流量信息|套餐到期/.test(n)), 'Foreign group must filter out info nodes')

  // Check Japan blocked group classification
  assert(nonJpGroup.proxies.includes('🇭🇰 香港 01 | BGP专线'), 'Non-JP group missing HK node')
  assert(nonJpGroup.proxies.includes('🇺🇸 美国 01 | 原生住宅'), 'Non-JP group missing US node')
  assert(nonJpGroup.proxies.includes('🇨🇦 Canada 01'), 'Non-JP group missing unlisted-country node')
  assert(nonJpGroup.proxies.includes('JPX 01 | Test'), 'Non-JP group must not treat JPX as a Japan marker')
  assert(!nonJpGroup.proxies.includes('🇯🇵 日本 01 | 低延迟'), 'Non-JP group must NOT include JP node')
  for (const name of ['JP01 | Tokyo IPLC', 'Japan02 | Premium', '🇯🇵 Osaka03']) {
    assert(!nonJpGroup.proxies.includes(name), `Non-JP group must exclude Japan node variant: ${name}`)
  }
  assert(nonJpGroup.proxies.includes('DIRECT'), 'Non-JP group should include DIRECT fallback')

  assert(domesticGroup.proxies[0] === 'DIRECT', '"🇨🇳 国内节点" first proxy must be DIRECT')
  assert(domesticGroup.proxies[1] === '🌐 国外节点', '"🇨🇳 国内节点" second proxy must be "🌐 国外节点"')
  assert(domesticGroup.proxies.includes('🇨🇳 国内中转-上海电信'), '"🇨🇳 国内节点" must include CN transit node')

  // 2. Assert Rule Targets
  const validTargets = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS', '🌐 国外节点', '🇨🇳 国内节点', '🚫 日本禁用'])
  const seenRules = new Set()
  const referencedProviders = new Set()

  ;(result.rules || []).forEach(rule => {
    assert(!seenRules.has(rule), `Duplicate rule found: ${rule}`)
    seenRules.add(rule)
    const target = ruleTarget(rule)
    assert(validTargets.has(target), `Rule references invalid target "${target}": ${rule}`)

    const parts = rule.split(',')
    if (parts[0] === 'RULE-SET') {
      referencedProviders.add(parts[1])
    }
  })

  // Check Japan blocked rules
  assert(result.rules.includes('DOMAIN-SUFFIX,hgamefree.info,🚫 日本禁用'), 'Missing rule for hgamefree.info -> 🚫 日本禁用')
  ;(spec.japanBlockedDomains || []).forEach(domain => {
    assert(result.rules.includes(`DOMAIN-SUFFIX,${domain},🚫 日本禁用`), `Missing rule for ${domain} -> 🚫 日本禁用`)
  })

  // 3. Assert WebRTC Leak Protection and optional authoritative China IP routing.
  const chinaIpIndex = result.rules.indexOf('RULE-SET,scki-fused-075-cn-site-ipcidr-no-resolve,DIRECT,no-resolve')
  if (spec.preventWebRtcLeak) {
    spec.webRtcBrowserProcesses.forEach(proc => {
      const expected = `AND,((PROCESS-NAME,${proc}),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT`
      assert(result.rules.includes(expected), `Missing browser WebRTC protection rule: ${expected}`)
    })
    spec.webRtcPorts.forEach(port => {
      const expected = `DST-PORT,${port},REJECT`
      assert(result.rules.includes(expected), `Missing port WebRTC protection rule: ${expected}`)
    })
    assert(result.rules.includes('AND,((DOMAIN-KEYWORD,stun),(NETWORK,UDP)),REJECT'), 'Missing STUN keyword UDP rejection rule')
    ;(spec.webRtcDomains || []).forEach(domain => {
      const expected = `AND,((DOMAIN-SUFFIX,${domain}),(NETWORK,UDP)),REJECT`
      assert(result.rules.includes(expected), `Missing domain WebRTC protection rule: ${expected}`)
    })

    const stunPortIndex = result.rules.indexOf('DST-PORT,3478,REJECT')
    assert(stunPortIndex >= 0, 'WebRTC STUN port rule not found')
    if (spec.forceChinaIpDirect) {
      assert(stunPortIndex < chinaIpIndex, 'WebRTC STUN port rule must precede China IP direct rule')
    }
  }

  if (spec.forceChinaIpDirect) {
    assert(chinaIpIndex >= 0, 'forceChinaIpDirect is enabled but China IP direct rule is missing')
  } else {
    assert(chinaIpIndex === -1, 'forceChinaIpDirect is disabled but China IP direct rule is present')
  }
  assert(buildChinaIpDirectRules(true).length === 1, 'Enabling forceChinaIpDirect must generate one China IP direct rule')
  assert(buildChinaIpDirectRules(false).length === 0, 'Disabling forceChinaIpDirect must generate no China IP direct rule')

  // Rule-set target overrides must generate rules with the configured target.
  Object.entries(spec.ruleSetTargetOverrides).forEach(([name, target]) => {
    assert(result.rules.includes(`RULE-SET,local-${name},${target}`), `Missing rule-set target override: ${name} -> ${target}`)
    assert(Boolean(result['rule-providers']?.[`local-${name}`]), `Missing provider for rule-set target override: local-${name}`)
  })
  assert(
    JSON.stringify(buildRuleSetOverrideRules({ ruleSetTargetOverrides: { douyu: 'REJECT', sample: 'DIRECT' } })) ===
      JSON.stringify(['RULE-SET,local-douyu,REJECT', 'RULE-SET,local-sample,DIRECT']),
    'Rule-set overrides must honor changed targets and additional mappings',
  )

  // 4. Assert Rule Providers
  const providers = result['rule-providers'] || {}
  assert(Object.keys(providers).length > 0, 'No rule providers found')
  referencedProviders.forEach(name => {
    assert(Boolean(providers[name]), `Referenced provider not defined: ${name}`)
  })
  Object.entries(providers).forEach(([name, p]) => {
    assert(p.format === 'mrs' || p.format === 'yaml', `Provider ${name} format must be mrs or yaml, got ${p.format}`)
    if (p.proxy && p.proxy !== 'DIRECT') {
      assert(p.proxy === '🌐 国外节点', `Provider ${name} proxy must be "🌐 国外节点", got ${p.proxy}`)
    }
  })

  // 5. Assert DNS
  assert(result.dns?.['use-hosts'] === true, 'DNS use-hosts must be enabled')
  assert(result.dns?.nameserver?.includes('223.5.5.5'), 'DNS nameserver must include 223.5.5.5')
  spec.foreignDnsDomains.forEach(domain => {
    const policy = result.dns?.['nameserver-policy']?.[domain]
    assert(Array.isArray(policy) && policy.length > 0, `Missing foreign DNS policy for ${domain}`)
  })
  ;(spec.japanBlockedDomains || []).forEach(domain => {
    const policy = result.dns?.['nameserver-policy']?.['+.' + domain]
    assert(Array.isArray(policy) && policy.length > 0, `Missing foreign DNS policy for japan-blocked domain ${domain}`)
  })

  // 6. Assert TUN
  assert(result.tun?.enable === true, 'TUN must be enabled')
  assert(result.tun?.['auto-route'] === true, 'TUN auto-route must be true')
  assert(result.tun?.['strict-route'] === false, 'TUN strict-route must be false')
  const excluded = new Set((result.tun?.['exclude-process'] || []).map(p => p.toLowerCase()))
  spec.tunExcludeProcesses.forEach(proc => {
    assert(excluded.has(proc.toLowerCase()), `Expected process excluded from TUN: ${proc}`)
  })
  spec.webRtcBrowserProcesses.forEach(proc => {
    assert(!excluded.has(proc.toLowerCase()), `Browser process must not be excluded from TUN: ${proc}`)
  })

  // 7. Assert Profile & Listeners
  assert(result.profile?.['store-fake-ip'] === true, 'store-fake-ip must be true')
  assert(result.profile?.['store-selected'] === false, 'store-selected must be false')
  assert(Array.isArray(result.listeners) && result.listeners.length === 2, 'Listeners must be configured')

  // 8. Assert Idempotency
  const second = runOverride(code, result)
  assert(JSON.stringify(second) === JSON.stringify(result), 'Lite override execution is not idempotent')

  console.log(`Lite override audit passed: 3 proxy groups, ${result.rules.length} rules, ${Object.keys(providers).length} rule-providers`)
}

if (process.argv[1] && process.argv[1].endsWith('audit.mjs')) {
  auditLiteOverride().catch(err => {
    console.error(err.message)
    process.exit(1)
  })
}
