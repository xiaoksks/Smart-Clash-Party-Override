import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { loadBuildInputs } from './build.mjs'
import { compileOverride } from './compile.mjs'
import { ROOT } from './custom-spec.mjs'
import { fixtureConfig, runOverride } from './test-helpers.mjs'
import { fetchBytes, digest, readMrsPayload } from './sync-upstream.mjs'
import { validateParty } from './validate-party.mjs'
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
async function prepareMrs(name) {
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
  return target
}

for (const [name, provider] of Object.entries(inputs.base.ruleProviders)) {
  if (!provider.inlineAtBuild) continue
  const payload = await readMrsPayload(binary, provider.behavior, await prepareMrs(name))
  assert.deepEqual(compiled.providers[name].payload, payload, `Embedded payload differs from pinned MRS: ${name}`)
}

async function prepareProviders(config) {
  const result = structuredClone(config)
  for (const [name, provider] of Object.entries(result['rule-providers'])) {
    if (provider.type !== 'http') continue
    provider.type = 'file'
    provider.path = await prepareMrs(name)
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

await validateParty(inputs)
await validateRouting({ binary, directory, inputs, prepareProviders })
await validateRouting({ binary, directory, inputs, prepareProviders, coldStart: true })
console.log('Core/Party validation complete. Actual browser ICE and OS TUN capture still require on-device testing.')
