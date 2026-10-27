import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import vm from 'node:vm'
import { loadBuildInputs } from './build.mjs'
import { compileOverride } from './compile.mjs'
import { ROOT } from './custom-spec.mjs'
import { fixtureConfig, runOverride } from './test-helpers.mjs'
import { fetchBytes, digest } from './sync-upstream.mjs'
import { validateRouting } from './validate-routing.mjs'

const exec = promisify(execFile)
const binary = process.env.MIHOMO_BIN
if (!binary) throw new Error('Set MIHOMO_BIN to an official Mihomo v1.19.33+ binary before running check:core.')
const inputs = await loadBuildInputs()
const directory = path.join(ROOT, '.build/core-validation')
await mkdir(directory, { recursive: true })
// Reuse warm geodata if available. This never reads the user's Party profile.
for (const file of ['geoip.metadb', 'ASN.mmdb']) {
  await copyFile(path.join(ROOT, '.build/core-test', file), path.join(directory, file)).catch(error => { if (error.code !== 'ENOENT') throw error })
}
const version = await exec(binary, ['-v'], { windowsHide: true })
console.log(version.stdout.trim())

const compiled = compileOverride(inputs)
const prepared = new Set()
async function prepareProviders(config) {
  const result = structuredClone(config)
  for (const [name, provider] of Object.entries(result['rule-providers'])) {
    if (provider.type !== 'http') continue
    const locked = inputs.snapshot.files[name]
    const target = path.join(directory, name + '.mrs')
    if (!prepared.has(name)) {
      const cache = path.join(ROOT, '.build/provider-cache', locked.sha256 + '.mrs')
      let bytes = await readFile(cache).catch(error => { if (error.code !== 'ENOENT') throw error; return null })
      if (!bytes || digest(bytes) !== locked.sha256) bytes = await fetchBytes(locked.url)
      assert.equal(digest(bytes), locked.sha256, `Provider hash mismatch: ${name}`)
      await writeFile(target, bytes)
      prepared.add(name)
    }
    provider.type = 'file'
    provider.path = target
    delete provider.url
    delete provider.proxy
    delete provider.interval
  }
  return result
}

const fixture = fixtureConfig()
const cases = [
  ['strict-static', inputs.spec, fixture],
  ['compatible-static', { ...inputs.spec, webRtcMode: 'compatible' }, fixture],
  ['protection-off', { ...inputs.spec, preventWebRtcLeak: false }, fixture],
  ['provider-only', inputs.spec, { 'proxy-providers': { airport: { type: 'inline', payload: fixture.proxies } } }],
  ['provider-only-jp', inputs.spec, { 'proxy-providers': { airport: { type: 'inline', payload: fixture.proxies.filter(p => /JP01|Japan02|Osaka03/.test(p.name)) } } }],
  ['static-only-jp', inputs.spec, { proxies: fixture.proxies.filter(p => /JP01|Japan02|Osaka03/.test(p.name)) }],
  ['party-smart-prepared', { ...inputs.spec, foreignSelection: 'party-smart' }, fixture],
]
for (const [name, spec, base] of cases) {
  const code = compileOverride({ ...inputs, spec }).code
  const config = await prepareProviders(runOverride(code, base))
  const file = path.join(directory, name + '.json')
  await writeFile(file, JSON.stringify(config, null, 2) + '\n')
  try {
    // -t parses only: it never activates TUN, changes routes or opens proxy ports.
    const result = await exec(binary, ['-t', '-d', directory, '-f', file], { windowsHide: true, timeout: 60000, maxBuffer: 4 * 1024 * 1024 })
    await writeFile(path.join(directory, name + '.log'), result.stdout + result.stderr)
    console.log(`Core config passed: ${name}`)
  } catch (error) {
    await writeFile(path.join(directory, name + '.log'), (error.stdout || '') + (error.stderr || ''))
    throw new Error(`Core config failed: ${name}\n${error.stdout || ''}\n${error.stderr || ''}`)
  }
}

// Verify against the exact official Party script, including its execution after
// the user override. Fetching pinned, hashed code is restricted to this test.
const partyUrl = 'https://raw.githubusercontent.com/mihomo-party-org/clash-party/ac294fed972c0c25c641abe603c3a6fe709dfdb3/src/main/config/smartOverride.ts'
const source = await fetchBytes(partyUrl)
assert.equal(digest(source), '2e56aa50f5960d18dcd82678ff06a6375c9866a740a79634c7e8ee35fd8cdfbc')
const text = source.toString('utf8')
const start = text.indexOf('  return `') + '  return '.length
let end = start + 1
for (; end < text.length; end++) if (text[end] === '`' && text[end - 1] !== '\\') break
assert.ok(start > 0 && end < text.length)
const smartCode = vm.runInNewContext(text.slice(start, end + 1), { collectorSize: 100, useLightGBM: false, collectData: false }, { timeout: 1000 })
for (const [label, base] of [['static', fixture], ['provider-only', cases[3][2]]]) {
  const config = runOverride(compileOverride({ ...inputs, spec: { ...inputs.spec, foreignSelection: 'party-smart' } }).code, base)
  const after = runOverride(smartCode, config)
  assert.equal(after['proxy-groups'].length, 3)
  assert.equal(after['proxy-groups'][0].type, 'smart')
  assert.equal(after['proxy-groups'][1].type, 'select')
  assert.equal(after['proxy-groups'][2].type, 'select')
  assert.deepEqual(after.rules, config.rules)
  assert.deepEqual(after.dns, config.dns)
  assert.deepEqual(after['rule-providers'], config['rule-providers'])
  assert.ok(after.dns.nameserver.every(ns => ns.endsWith('#' + after['proxy-groups'][0].name)))
  console.log(`Party v2.0.4 Smart execution order passed: ${label}`)
}
// The default select configuration requires the built-in Smart override OFF.
const manual = runOverride(compiled.code, fixture)
const unsafeManual = runOverride(smartCode, manual)
assert.notDeepEqual(unsafeManual.rules, manual.rules)
console.log('Confirmed: manual select mode requires built-in Smart override OFF (documented).')
await validateRouting({ binary, directory, inputs, prepareProviders })
console.log('Core/Party validation complete. Actual browser ICE and OS TUN capture still require on-device testing.')
