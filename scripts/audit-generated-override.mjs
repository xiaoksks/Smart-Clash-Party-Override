import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { loadCustomSpec, ROOT } from './custom-spec.mjs'

const OUTPUT_PATH = path.join(ROOT, 'dist', 'Smart-Override.js')
const BUILTINS = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS'])

function fixtureConfig() {
  const names = [
    '\u9999\u6e2f-\u5ba1\u8ba1',
    '\u65b0\u52a0\u5761-\u5ba1\u8ba1',
    '\u7f8e\u56fd\u5bb6\u5bbd-\u5ba1\u8ba1',
    'AWS\u65e5\u672c01 | \u7535\u4fe1\u79fb\u52a8\u8054\u901a\u63a8\u8350',
  ]
  return {
    proxies: names.map((name, index) => ({
      name,
      type: 'ss',
      server: `198.51.100.${index + 1}`,
      port: 443,
      cipher: 'aes-128-gcm',
      password: 'audit',
    })),
    'proxy-groups': [],
    rules: [],
  }
}

function runOverride(output, config, entrypoint = 'main') {
  const runtimeErrors = []
  const sandbox = {
    __config: config,
    console: {
      log() {},
      error(...args) { runtimeErrors.push(args.map(value => String(value?.message || value)).join(' ')) },
    },
  }
  const result = vm.runInNewContext(`${output}\n;${entrypoint}(__config)`, sandbox, { timeout: 10000 })
  if (runtimeErrors.length) throw new Error(`Generated override failed at runtime:\n${runtimeErrors.join('\n')}`)
  return result
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertRulePrefix(config, expected) {
  assert(Array.isArray(config.rules), 'Generated override produced no rules')
  assert(config.rules.length >= expected.length, 'Generated rule list is shorter than custom prefix')
  expected.forEach((rule, index) => assert(config.rules[index] === rule, `Custom rule lost priority at index ${index}: ${rule}`))
}

function assertReferences(config) {
  const groups = config['proxy-groups'] || []
  const groupNames = new Set(groups.map(group => group.name))
  const proxyNames = new Set((config.proxies || []).map(proxy => proxy.name))
  const validTargets = new Set([...BUILTINS, ...groupNames, ...proxyNames])

  groups.forEach(group => {
    ;(group.proxies || []).forEach(target => assert(validTargets.has(target), `Group ${group.name} references missing target: ${target}`))
  })

  const providers = config['rule-providers'] || {}
  ;(config.rules || []).forEach(rule => {
    const parts = rule.split(',')
    if (parts[0] === 'RULE-SET') assert(Boolean(providers[parts[1]]), `Rule references missing provider: ${parts[1]}`)
    const target = parts[parts.length - 1] === 'no-resolve' ? parts[parts.length - 2] : parts[parts.length - 1]
    assert(BUILTINS.has(target) || groupNames.has(target), `Rule references missing policy: ${target} (${rule})`)
  })
}

function comparableSmartSettings(group) {
  const settings = {}
  Object.keys(group).sort().forEach(key => {
    if (key !== 'proxies' && key !== 'strategy') settings[key] = group[key]
  })
  return settings
}

function assertSmartContract(config, upstreamConfig) {
  const smartGroups = (config['proxy-groups'] || []).filter(group => group.type === 'smart')
  const upstreamGroups = new Map(
    (upstreamConfig['proxy-groups'] || [])
      .filter(group => group.type === 'smart')
      .map(group => [group.name, group]),
  )
  assert(smartGroups.length > 0, 'Generated override produced no Smart groups')
  smartGroups.forEach(group => {
    const upstreamGroup = upstreamGroups.get(group.name)
    assert(upstreamGroup, `Generated Smart group is missing upstream counterpart: ${group.name}`)
    assert(!Object.prototype.hasOwnProperty.call(group, 'strategy'), `${group.name} still contains the removed Smart strategy option`)
    assert(group.collectdata === false, `${group.name} must keep upstream Smart data collection disabled`)
    assert(
      JSON.stringify(comparableSmartSettings(group)) === JSON.stringify(comparableSmartSettings(upstreamGroup)),
      `${group.name} Smart settings drifted from upstream`,
    )
  })
  assert(!(config['proxy-groups'] || []).some(group => group.name === 'GLOBAL'), 'Legacy GLOBAL group was not removed')
  assert(config.profile?.['store-selected'] === false, 'store-selected must be disabled')
}

function assertDnsContract(config, domains) {
  const policy = config.dns?.['nameserver-policy'] || {}
  domains.forEach(domain => assert(Array.isArray(policy[domain]) && policy[domain].length > 0, `Missing foreign DNS policy: ${domain}`))
  const direct = config.dns?.['direct-nameserver'] || []
  ;['223.5.5.5', '223.6.6.6', '119.29.29.29'].forEach(server => assert(direct.includes(server), `Missing DIRECT DNS fallback: ${server}`))
  assert(config.dns?.['direct-nameserver-follow-policy'] === false, 'DIRECT DNS must not follow foreign policy')
}

function assertProviderVersioning(config, version) {
  const providers = Object.values(config['rule-providers'] || {})
  assert(providers.length > 0, 'Generated override produced no rule providers')
  providers.forEach(provider => {
    if (!String(provider.url || '').includes('/rulesets/generated/fused/')) return
    assert(String(provider.url).includes(`scki=${version}`), `Provider URL is not versioned: ${provider.url}`)
    assert(String(provider.path || '').includes(`/rule`), `Provider has no local path: ${provider.url}`)
    assert(String(provider.path).includes(`/${version}/`), `Provider path is not versioned: ${provider.path}`)
  })
}

function assertHuluPreference(config) {
  const hulu = (config['proxy-groups'] || []).find(group => group.name === '\ud83d\udcfa Hulu')
  assert(hulu && hulu.proxies.length > 0, 'Hulu group is missing')
  assert(hulu.proxies[0] === '\ud83c\udfe1 \u7f8e\u56fd\u5bb6\u5bbd', `Hulu must prefer US residential group, got ${hulu.proxies[0]}`)
}

async function main() {
  const [output, spec] = await Promise.all([readFile(OUTPUT_PATH, 'utf8'), loadCustomSpec()])
  const version = output.match(/const VERSION = '([^']+)'/)?.[1]
  assert(version, 'Could not parse generated upstream version')

  const first = runOverride(output, fixtureConfig())
  const upstream = runOverride(output, fixtureConfig(), 'upstreamMain')
  assertRulePrefix(first, spec.preRules)
  assertReferences(first)
  assertSmartContract(first, upstream)
  assertDnsContract(first, spec.foreignDnsDomains)
  assertProviderVersioning(first, version)
  assertHuluPreference(first)

  const firstJson = JSON.stringify(first)
  const second = runOverride(output, first)
  assert(JSON.stringify(second) === firstJson, 'Generated override is not idempotent')

  console.log(`Generated override audit passed: ${spec.preRules.length} custom rules, ${first['proxy-groups'].length} groups, ${first.rules.length} rules, ${Object.keys(first['rule-providers']).length} providers`)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
