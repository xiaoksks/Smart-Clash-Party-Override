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
  assert.ok(result.dns.nameserver.every(ns => ns.endsWith('#' + expected.report.foreignGroupName)))
  if (inputs.spec.preventWebRtcLeak) {
    assert.ok(result.listeners.every(listener => listener.proxy !== 'DIRECT'))
    if (inputs.spec.webRtcMode === 'strict') assert.equal(result.rules[1], 'NETWORK,UDP,REJECT')
  }
  assert.deepEqual(runOverride(code, result), result, 'Override must be idempotent')
  console.log(`Audit passed: 3 groups, ${result.rules.length} rules, ${Object.keys(providers).length} referenced providers`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  auditLiteOverride().catch(error => { console.error(error); process.exitCode = 1 })
}
