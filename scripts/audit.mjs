import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadBuildInputs } from './build.mjs'
import { compileOverride, targetOf } from './compile.mjs'
import { ROOT } from './custom-spec.mjs'
import { runOverride, fixtureConfig } from './test-helpers.mjs'

export async function auditLiteOverride() {
  const inputs = await loadBuildInputs()
  const expected = compileOverride(inputs)
  const code = (await readFile(path.join(ROOT, 'dist/Lite-Override.js'), 'utf8')).replace(/\r\n/g, '\n')
  assert.equal(code, expected.code, 'Generated override is stale; run npm run build')
  assert.deepEqual(JSON.parse(await readFile(path.join(ROOT, 'dist/build-report.json'), 'utf8')), expected.report)
  const result = runOverride(code, fixtureConfig())
  const groups = result['proxy-groups']
  assert.equal(groups.length, 3)
  const names = new Set(groups.map(g => g.name))
  const builtins = ['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS']
  const providers = result['rule-providers']
  const foreignCategoryIndex = result.rules.findIndex(r => r === `RULE-SET,scki-fused-002-intl-site-domain,${expected.report.foreignGroupName}`)
  for (const name of ['lite-domestic-direct', 'lite-domestic-services']) {
    const index = result.rules.findIndex(r => r.startsWith(`RULE-SET,${name},`))
    assert.ok(index > 0 && index < foreignCategoryIndex, 'Mainland overlay must precede mixed business categories')
    assert.ok(!providers[name].payload.some(p => ['+.cn', '+.com', '+.com.cn', '+.edu.cn'].includes(p)))
  }
  const used = new Set()
  assert.equal(new Set(result.rules).size, result.rules.length, 'Duplicate entry rules')
  assert.equal(result.rules.at(-1), `MATCH,${expected.report.foreignGroupName}`)
  assert.equal(result.rules.filter(r => r.startsWith('MATCH,')).length, 1)
  for (const rule of result.rules) {
    assert.ok([...names, ...builtins].includes(targetOf(rule)), `Undefined target: ${rule}`)
    for (const match of rule.matchAll(/RULE-SET,([^,)]+)/g)) {
      assert.ok(providers[match[1]], `Missing provider: ${match[1]}`)
      used.add(match[1])
    }
  }
  for (const key of Object.keys(result.dns['nameserver-policy'])) {
    if (!key.startsWith('rule-set:')) continue
    const name = key.slice(9)
    used.add(name)
    assert.ok(providers[name], `DNS references missing provider: ${name}`)
    assert.notEqual(providers[name].behavior, 'ipcidr')
  }
  for (const [name, p] of Object.entries(providers)) {
    assert.ok(used.has(name), `Unused provider: ${name}`)
    if (p.type === 'http') {
      assert.equal(p.format, 'mrs')
      assert.match(p.url, /\/Smart-Config-Kit\/[a-f0-9]{40}\//)
      assert.equal(p.proxy, expected.report.foreignGroupName)
    } else {
      assert.equal(p.type, 'inline')
      assert.ok(Array.isArray(p.payload))
      assert.equal(new Set(p.payload).size, p.payload.length)
    }
  }
  assert.equal(result.profile['store-selected'], true)
  assert.equal(result.profile['store-fake-ip'], true)
  assert.equal(result.tun.enable, true)
  assert.equal(result.tun['strict-route'], true)
  assert.deepEqual(result.tun['dns-hijack'], ['any:53', 'tcp://any:53'])
  assert.equal(result.ipv6, false)
  assert.equal(result.dns.ipv6, false)
  assert.equal(result.dns['fake-ip-filter-mode'], 'rule')
  assert.ok(!result.dns.fallback && !result.dns['fallback-filter'])
  assert.deepEqual(result.dns['default-nameserver'], ['https://223.5.5.5/dns-query', 'https://223.6.6.6/dns-query', '223.5.5.5'])
  assert.deepEqual(result.hosts['cloudflare-dns.com'], ['1.1.1.1', '1.0.0.1'])
  assert.deepEqual(result.hosts['dns.google'], ['8.8.8.8', '8.8.4.4'])
  assert.ok(result.dns.nameserver.every(ns => ns.endsWith('#' + expected.report.foreignGroupName)))
  if (inputs.spec.preventWebRtcLeak) {
    assert.ok(result.listeners.every(listener => listener.proxy !== 'DIRECT'))
    if (inputs.spec.webRtcMode === 'strict') {
      assert.equal(result.rules[0], `AND,((NETWORK,UDP),(DST-PORT,53)),${expected.report.foreignGroupName}`)
      const rejectIndex = result.rules.indexOf('NETWORK,UDP,REJECT')
      assert.ok(rejectIndex > result.rules.indexOf('RULE-SET,scki-fused-075-cn-site-ipcidr-no-resolve,DIRECT,no-resolve'))
      for (const name of inputs.spec.directRuleSets) {
        const directIndex = result.rules.indexOf(`RULE-SET,${name},DIRECT`)
        assert.ok(directIndex >= 0 && directIndex < rejectIndex)
        assert.ok(!result.rules.includes(`RULE-SET,${name},🇨🇳 国内节点`))
      }
    }
  }
  assert.deepEqual(runOverride(code, result), result, 'Override must be idempotent')
  console.log(`Audit passed: 3 groups, ${result.rules.length} rules, ${Object.keys(providers).length} referenced providers`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  auditLiteOverride().catch(error => { console.error(error); process.exitCode = 1 })
}
