import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { loadCustomSpec, ROOT } from './custom-spec.mjs'

const DIST_PATH = path.join(ROOT, 'dist', 'Lite-Override.js')
const BUILTINS = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS'])

function fixtureConfig() {
  const names = [
    '🇭🇰 香港 01 | BGP专线',
    '🇸🇬 新加坡 01 | 优质流媒体',
    '🇺🇸 美国 01 | 原生住宅',
    '🇯🇵 日本 01 | 低延迟',
    '🇨🇳 国内中转-上海电信',
    '流量信息：剩余 888GB',
    '套餐到期：2028-12-31',
  ]
  return {
    proxies: names.map((name, index) => ({
      name,
      type: 'ss',
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

  // 1. Assert exactly 2 proxy groups
  const groups = result['proxy-groups'] || []
  assert(groups.length === 2, `Expected exactly 2 proxy groups, found ${groups.length}`)

  const foreignGroup = groups.find(g => g.name === '🌐 国外节点')
  const domesticGroup = groups.find(g => g.name === '🇨🇳 国内节点')
  assert(foreignGroup, 'Missing "🌐 国外节点" group')
  assert(domesticGroup, 'Missing "🇨🇳 国内节点" group')
  assert(foreignGroup.type === 'select', '"🌐 国外节点" must be select type')
  assert(domesticGroup.type === 'select', '"🇨🇳 国内节点" must be select type')

  // Check node classification
  assert(foreignGroup.proxies.includes('🇭🇰 香港 01 | BGP专线'), 'Foreign group missing HK node')
  assert(foreignGroup.proxies.includes('🇺🇸 美国 01 | 原生住宅'), 'Foreign group missing US node')
  assert(!foreignGroup.proxies.includes('🇨🇳 国内中转-上海电信'), 'Foreign group must not include CN node')
  assert(!foreignGroup.proxies.some(n => n.includes('流量信息')), 'Foreign group must filter out info nodes')

  assert(domesticGroup.proxies[0] === 'DIRECT', '"🇨🇳 国内节点" first proxy must be DIRECT')
  assert(domesticGroup.proxies[1] === '🌐 国外节点', '"🇨🇳 国内节点" second proxy must be "🌐 国外节点"')
  assert(domesticGroup.proxies.includes('🇨🇳 国内中转-上海电信'), '"🇨🇳 国内节点" must include CN transit node')

  // 2. Assert Rule Targets
  const validTargets = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS', '🌐 国外节点', '🇨🇳 国内节点'])
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

  // 3. Assert WebRTC Leak Protection
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

    // WebRTC rules must come BEFORE China IP direct rule
    const chinaIpIndex = result.rules.indexOf('RULE-SET,scki-fused-075-cn-site-ipcidr-no-resolve,🇨🇳 国内节点,no-resolve')
    assert(chinaIpIndex > 0, 'China IP direct rule not found')
    const stunPortIndex = result.rules.indexOf('DST-PORT,3478,REJECT')
    assert(stunPortIndex >= 0 && stunPortIndex < chinaIpIndex, 'WebRTC STUN port rule must precede China IP direct rule')
  }

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

  console.log(`Lite override audit passed: 2 proxy groups, ${result.rules.length} rules, ${Object.keys(providers).length} rule-providers`)
}

if (process.argv[1] && process.argv[1].endsWith('audit.mjs')) {
  auditLiteOverride().catch(err => {
    console.error(err.message)
    process.exit(1)
  })
}
