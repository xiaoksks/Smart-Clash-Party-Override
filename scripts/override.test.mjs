import test from 'node:test'
import assert from 'node:assert/strict'
import { loadBuildInputs } from './build.mjs'
import { compileOverride, FOREIGN, DOMESTIC, NON_JP } from './compile.mjs'
import { fixtureConfig, runOverride, route, matchesDomain } from './test-helpers.mjs'
import { parsePayload } from './sync-upstream.mjs'

const inputs = await loadBuildInputs()
const compile = patch => compileOverride({ ...inputs, spec: { ...inputs.spec, ...patch } })
const strict = compile({ webRtcMode: 'strict', preventWebRtcLeak: true, foreignSelection: 'select' })
const fixture = runOverride(strict.code, fixtureConfig())
const cn = { 'scki-fused-075-cn-site-ipcidr-no-resolve': { behavior: 'classical', payload: ['IP-CIDR,223.5.5.0/24,no-resolve'] } }

test('strict blocks unknown clients, CN destinations, arbitrary ports and IPv6 before direct rules', () => {
  for (const process of ['chrome.exe', 'Codex.exe', 'node.exe', 'renamed-ai.exe', 'Thunder.exe', '']) {
    for (const ip of ['223.5.5.5', '192.168.1.1', '203.0.113.20', '2001:db8::1']) {
      for (const port of [443, 3478, 5349, 27015, 61000]) {
        assert.equal(route(fixture, { process, network: 'UDP', host: 'unlisted-ai.test', ip, port }, cn), 'REJECT')
      }
    }
  }
  assert.equal(route(fixture, { network: 'UDP', ip: '223.5.5.5', port: 53 }, cn), FOREIGN)
})

test('AI endpoints and native clients outrank mainland-IP DIRECT; AI DNS cannot inherit domestic policies', () => {
  const hosts = ['chatgpt.com', 'api.openai.com', 'gemini.google.com', 'generativelanguage.googleapis.com',
    'claude.ai', 'api.anthropic.com', 'api.githubcopilot.com', 'grok.com', 'perplexity.ai',
    'api.mistral.ai', 'api.cursor.com', 'notebooklm.google.com', 'api.elevenlabs.io']
  for (const host of hosts) assert.equal(route(fixture, { host, network: 'TCP', port: 443, ip: '223.5.5.5' }, cn), FOREIGN, host)
  for (const process of ['codex.exe', 'Codex.exe', 'claude', 'Cursor.exe', 'Windsurf.exe']) {
    assert.equal(route(fixture, { host: 'custom-ai-endpoint.test', process, network: 'TCP', port: 443, ip: '223.5.5.5' }, cn), FOREIGN, process)
  }
  const result = runOverride(strict.code, { ...fixtureConfig(), dns: { 'nameserver-policy': {
    '+.google.com': ['10.0.0.53'], 'api.openai.com': ['223.5.5.5'], '+.corp.test': ['10.0.0.53'],
  } } })
  const policy = result.dns['nameserver-policy']
  assert.deepEqual(policy['+.corp.test'], ['10.0.0.53'])
  assert.ok(policy['api.openai.com'].every(ns => ns.endsWith('#' + FOREIGN)))
  assert.ok(policy['+.gemini.google.com'].every(ns => ns.endsWith('#' + FOREIGN)))
  assert.deepEqual(runOverride(strict.code, result), result)
})

test('all catalog service patterns participate in both routing and DNS', () => {
  for (const service of inputs.catalog.services) {
    for (const pattern of service.domains) {
      const host = pattern.replace(/^\+\./, '')
      assert.ok(fixture['rule-providers']['lite-ai'].payload.some(p => matchesDomain(p, host)), service.name)
      assert.ok(fixture.dns['nameserver-policy'][pattern]?.every(ns => ns.endsWith('#' + FOREIGN)), pattern)
    }
  }
})

test('TCP STUN and AI TURN cannot bypass protection using CN ranges', () => {
  for (const port of [3478, 3479, 3480, 3481, 5349, 19302, 19309]) {
    assert.equal(route(fixture, { host: 'relay.test', network: 'TCP', port, ip: '223.5.5.5' }, cn), 'REJECT')
  }
  assert.equal(route(fixture, { host: 'turn.livekit.cloud', network: 'TCP', port: 443 }), 'REJECT')
  assert.equal(route(fixture, { host: '', process: 'unknown-ai.exe', ip: '223.5.5.5', network: 'TCP', port: 443 }, cn), FOREIGN)
  assert.equal(route(fixture, { host: '', process: 'Thunder.exe', ip: '223.5.5.5', network: 'TCP', port: 443 }, cn), 'DIRECT')
  assert.equal(route(fixture, { host: '', process: 'chrome.exe', ip: '192.168.1.1', network: 'TCP', port: 80 }, cn), DOMESTIC)
})

test('compatible mode blocks AI/browser UDP while unlisted apps retain QUIC', () => {
  const result = runOverride(compile({ webRtcMode: 'compatible' }).code, fixtureConfig())
  assert.equal(route(result, { process: 'CHROME.EXE', host: 'unknown.test', network: 'UDP', port: 443 }), 'REJECT')
  assert.equal(route(result, { host: 'gemini.google.com', network: 'UDP', port: 443 }), 'REJECT')
  assert.equal(route(result, { host: 'unknown.test', process: 'game.exe', network: 'UDP', port: 443 }), FOREIGN)
})

test('turning protection off removes every privacy/legacy QUIC reject', () => {
  const result = runOverride(compile({ preventWebRtcLeak: false }).code, fixtureConfig())
  assert.equal(route(result, { process: 'chrome.exe', host: 'unknown.test', network: 'UDP', port: 443 }), FOREIGN)
  assert.equal(route(result, { host: 'gemini.google.com', network: 'UDP', port: 443 }), FOREIGN)
  assert.ok(!result.rules.some(r => r.includes('NETWORK,UDP') && r.endsWith(',REJECT')))
})

test('provider-only subscriptions get all groups, with filters matching static classification', () => {
  const result = runOverride(strict.code, { 'proxy-providers': { airport: { type: 'inline', proxy: 'Old Subscription Group', payload: fixtureConfig().proxies } } })
  assert.equal(result['proxy-providers'].airport.proxy, 'DIRECT')
  assert.equal(result['proxy-groups'].length, 3)
  for (const group of result['proxy-groups']) assert.deepEqual(group.use, ['airport'])
  const [foreign, nonJp, domestic] = result['proxy-groups']
  const regex = pattern => new RegExp(pattern.replace(/^\(\?i\)/, ''), 'i')
  for (const node of fixtureConfig().proxies) {
    const name = node.name
    assert.equal(!regex(foreign['exclude-filter']).test(name), fixture['proxy-groups'][0].proxies.includes(name), name)
    assert.equal(!regex(nonJp['exclude-filter']).test(name), fixture['proxy-groups'][1].proxies.includes(name), name)
    assert.equal(regex(domestic.filter).test(name) && !regex(domestic['exclude-filter']).test(name), fixture['proxy-groups'][2].proxies.includes(name), name)
  }
  assert.deepEqual(nonJp.proxies, [])
  assert.equal(nonJp['empty-fallback'], 'DIRECT')
  assert.equal(foreign['empty-fallback'], 'REJECT')
})

test('classical merging and tail pruning preserve precedence across domestic exceptions', () => {
  const providers = {
    first: { type: 'inline', behavior: 'classical', format: 'yaml', payload: ['DOMAIN-SUFFIX,overlap.test', 'PROCESS-NAME,example.exe'] },
    domain: { type: 'http', behavior: 'domain', format: 'mrs' },
    second: { type: 'inline', behavior: 'classical', format: 'yaml', payload: ['DOMAIN-KEYWORD,foreign'] },
    domestic: { type: 'inline', behavior: 'classical', format: 'yaml', payload: ['DOMAIN-SUFFIX,overlap.test', 'DOMAIN-SUFFIX,domestic.test'] },
    last: { type: 'inline', behavior: 'classical', format: 'yaml', payload: ['DOMAIN-SUFFIX,tail.test'] },
  }
  const baselineRules = [`RULE-SET,first,${FOREIGN}`, `RULE-SET,domain,${FOREIGN}`, `RULE-SET,second,${FOREIGN}`, `RULE-SET,domestic,${DOMESTIC}`, `RULE-SET,last,${FOREIGN}`]
  const snapshot = { revisions: inputs.snapshot.revisions, aiDomains: inputs.snapshot.aiDomains,
    files: Object.fromEntries(Object.entries(providers).map(([name, provider]) => [name, { payload: provider.payload, sha256: '0'.repeat(64), url: 'https://example.test/file.mrs' }])) }
  const optimized = compileOverride({ ...inputs, spec: { ...inputs.spec, preventWebRtcLeak: false, preRules: [], ruleSetTargetOverrides: {}, forceChinaIpDirect: false },
    base: { ...inputs.base, ruleProviders: providers, baselineRules }, snapshot })
  const result = runOverride(optimized.code, fixtureConfig())
  const extra = { domain: { behavior: 'domain', payload: ['+.domain.test'] } }
  const reference = { rules: [...baselineRules, `MATCH,${FOREIGN}`], 'rule-providers': providers }
  for (const host of ['overlap.test', 'sub.overlap.test', 'domestic.test', 'foreign.domestic.test', 'domain.test', 'tail.test', 'unknown.test']) {
    for (const process of ['example.exe', 'other.exe']) {
      const connection = { host, process, network: 'TCP', port: 443 }
      assert.equal(route(result, connection, extra), route(reference, connection, extra), `${host} / ${process}`)
    }
  }
  assert.equal(optimized.report.mergedClassicalRuns, 1)
})

test('Japan-only and CN-only subscriptions never restore Japanese nodes into non-JP group', () => {
  for (const names of [['JP01', 'Japan02', '🇯🇵 Osaka03'], ['🇨🇳 国内中转-上海电信']]) {
    const result = runOverride(strict.code, { proxies: names.map(name => ({ name, type: 'ss' })) })
    assert.deepEqual(result['proxy-groups'][1].proxies, ['DIRECT'])
  }
  assert.equal(route(fixture, { host: 'hgamefree.info', network: 'TCP', port: 443, ip: '223.5.5.5' }, cn), NON_JP)
})

test('strict removes inherited TUN exclusions and DIRECT listeners, preserves TCP Thunder DIRECT', () => {
  const result = runOverride(strict.code, { ...fixtureConfig(), tun: {
    'route-exclude-address': ['0.0.0.0/0'], 'exclude-interface': ['Ethernet'],
  }, listeners: [{ name: 'custom', type: 'mixed', port: 12345, proxy: 'DIRECT' }] })
  assert.ok(!result.tun['route-exclude-address'] && !result.tun['exclude-interface'])
  assert.equal(result.listeners.find(l => l.name === 'custom').proxy, undefined)
  assert.ok(!result.listeners.some(l => l.port === 10086))
  assert.equal(route(result, { process: 'Thunder.exe', host: 'download.test', network: 'TCP', port: 443 }), 'DIRECT')
  assert.equal(route(result, { process: 'QQ.exe', host: 'qq.com', network: 'TCP', port: 443 }), DOMESTIC)
})

test('IP supplements use no-resolve and no foreign-only tail is left before MATCH', () => {
  for (const rule of fixture.rules) {
    const name = rule.split(',')[1]
    if (rule.startsWith('RULE-SET,') && fixture['rule-providers'][name].behavior === 'ipcidr') assert.ok(rule.endsWith(',no-resolve'), rule)
  }
  assert.ok(!fixture.rules.at(-2).endsWith(',' + FOREIGN))
  assert.equal(strict.report.trimmedTailRules, 8)
  assert.ok(strict.report.providers < 144)
})

test('Smart integration keeps a stable DNS group name for Party conversion', () => {
  const result = runOverride(compile({ foreignSelection: 'party-smart' }).code, fixtureConfig())
  assert.equal(result['proxy-groups'][0].type, 'url-test')
  const name = result['proxy-groups'][0].name
  assert.ok(name.includes('(Smart Group)'))
  assert.equal(result.rules.at(-1), 'MATCH,' + name)
  assert.ok(result.dns.nameserver.every(ns => ns.endsWith('#' + name)))
})

test('upstream payload parser rejects HTML and unexpected YAML instead of publishing it', () => {
  assert.throws(() => parsePayload('<html>not a rule list</html>'))
  assert.throws(() => parsePayload('payload:\n  unexpected: true\n'))
  assert.deepEqual(parsePayload('payload:\n  - "PROCESS-NAME,Claude.exe"\n'), ['PROCESS-NAME,Claude.exe'])
})
