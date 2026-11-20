import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { stripTypeScriptTypes } from 'node:module'
import { isIP } from 'node:net'
import vm from 'node:vm'
import { compileOverride } from './compile.mjs'
import { digest, fetchBytes } from './sync-upstream.mjs'
import { fixtureConfig, runOverride } from './test-helpers.mjs'

const PARTY_VERSION = 'v2.0.5'
const PARTY_COMMIT = '74c3d65e67b615013d0ec0ab870b43964fa07673'
const PARTY_SOURCES = {
  'main/core/factory.ts': '2981fb0ab6f6cda45540a6cd18005d163d9872e7b855d4b82a15f9e2392a2a42',
  'main/core/dnsOverrideGuard.ts': '8acec9599ad35538a23220fb477f3df28d557cf1f62c47c069f5c729e9cc9060',
  'main/utils/merge.ts': '1231ca43387875b63f960e2dd9374bb8e80148725cf8b09ac0566a0ccdcd9117',
  'main/config/smartOverride.ts': '2e56aa50f5960d18dcd82678ff06a6375c9866a740a79634c7e8ee35fd8cdfbc',
  'shared/local-config.ts': '79522aa7912ec9937b15a5e85614651d762715beef49fbd6e2ec93a5b5d6fbb6',
  'shared/appConfig.ts': '7b3947e78711e4d9f831f4d61346f22d89d2c579861797858941b7a0af8a4ab5',
}

async function loadPartySources() {
  const files = await Promise.all(Object.entries(PARTY_SOURCES).map(async ([file, hash]) => {
    const url = `https://raw.githubusercontent.com/mihomo-party-org/clash-party/${PARTY_COMMIT}/src/${file}`
    const bytes = await fetchBytes(url)
    assert.equal(digest(bytes), hash, `Clash Party source hash mismatch: ${file}`)
    const source = bytes.toString('utf8').replace(/^import\s+[\s\S]*?\sfrom\s+['"][^'"]+['"]\r?\n/gm, '')
    const javascript = stripTypeScriptTypes(source).replace(/^export\s+/gm, '')
    return [file, javascript]
  }))
  return Object.fromEntries(files)
}

// Run the official generator with in-memory application state, profile input,
// and config output. The fixture objects use JSON as a subset of YAML.
function loadPartyModule(sources, file, exports, bindings = {}) {
  return vm.runInNewContext(`${sources[file]}\n;({ ${exports.join(', ')} })`, bindings, { filename: file, timeout: 1000 })
}

function assertRuntime(config, expected, foreignType, label) {
  const groups = config['proxy-groups']
  assert.deepEqual(groups.map(group => group.type), [foreignType, 'select', 'select'], label)
  assert.deepEqual(groups.map(group => group.name), expected['proxy-groups'].map(group => group.name), label)
  assert.equal(config.mode, 'rule', label)
  assert.ok(config['rule-providers']['lite-ai'].payload.length, label)
  assert.deepEqual(config['rule-providers'], expected['rule-providers'], label)
  assert.deepEqual(config.rules, expected.rules, label)
  assert.deepEqual(config.dns, expected.dns, label)
  assert.deepEqual(config.hosts, expected.hosts, label)
  assert.ok(config.dns.nameserver.every(server => server.endsWith('#' + groups[0].name)), label)
  assert.equal(config.tun.enable, true, label)
  assert.equal(config.tun['auto-route'], true, label)
  assert.equal(config.tun['strict-route'], true, label)
  assert.deepEqual(config.tun['dns-hijack'], ['any:53', 'tcp://any:53'], label)
}

export async function validateParty(inputs) {
  const sources = await loadPartySources()
  const { generateSmartOverrideTemplate } = loadPartyModule(sources,
    'main/config/smartOverride.ts', ['generateSmartOverrideTemplate'])
  const smartOverride = generateSmartOverrideTemplate(false, false, 100)
  const factoryDependencies = {
    ...loadPartyModule(sources, 'main/utils/merge.ts', ['deepMerge']),
    ...loadPartyModule(sources, 'shared/local-config.ts', ['isLocalProfile']),
    ...loadPartyModule(sources, 'shared/appConfig.ts', ['DEFAULT_CONTROL_DNS', 'DEFAULT_CONTROL_SNIFF']),
  }
  const spec = { ...inputs.spec, preventWebRtcLeak: true, webRtcMode: 'strict' }
  const manual = compileOverride({ ...inputs, spec: { ...spec, foreignSelection: 'select' } }).code
  const smart = compileOverride({ ...inputs, spec: { ...spec, foreignSelection: 'party-smart' } }).code
  const staticProfile = fixtureConfig()
  const providerProfile = { 'proxy-providers': { airport: { type: 'inline', payload: staticProfile.proxies } } }

  async function generate({ base = staticProfile, type = 'remote', binding = 'profile', script = manual,
    enableSmart = false, app = {}, controlled = {} } = {}) {
    const { evaluateDnsOverrideGuard } = loadPartyModule(sources, 'main/core/dnsOverrideGuard.ts',
      ['evaluateDnsOverrideGuard'], { createHash, createLogger: () => ({}) })
    const profile = { id: type === 'local' ? 'local' : 'fixture', type, override: binding === 'profile' ? ['lite'] : [] }
    const overrides = new Map([['lite', { id: 'lite', ext: 'js', global: binding === 'global', source: script }]])
    if (enableSmart) overrides.set('smart-core-override', {
      id: 'smart-core-override', ext: 'js', global: true, source: smartOverride,
    })
    let written
    const { generateProfile } = loadPartyModule(sources, 'main/core/factory.ts', ['generateProfile'], {
      ...factoryDependencies, evaluateDnsOverrideGuard, isIP, vm,
      createLogger: () => ({ info() {} }),
      getProfileConfig: async () => ({ current: profile.id }),
      getProfileItem: async () => profile,
      getProfile: async () => { assert.equal(type, 'remote'); return structuredClone(base) },
      compileLocalRuntime: async () => { assert.equal(type, 'local'); return { errors: [], yaml: JSON.stringify(base) } },
      getAppConfig: async () => app,
      getControledMihomoConfig: async () => ({ mode: 'rule', ...structuredClone(controlled) }),
      getOverrideConfig: async () => ({ items: [...overrides.values()] }),
      getOverrideItem: async id => overrides.get(id),
      getOverride: async id => overrides.get(id).source,
      existsSync: () => false,
      rulePath: () => 'fixture-rules.yaml',
      overridePath: () => 'fixture-override.log',
      writeFileSync: (_file, line) => assert.ok(!line.startsWith('[exception]'), line),
      parse: JSON.parse,
      stringify: JSON.stringify,
      atomicWriteFile: async (_file, content) => { written = JSON.parse(content) },
    })
    const { dnsGuard } = await generateProfile(undefined, { outputPath: 'fixture-core.yaml' })
    assert.ok(written, 'Clash Party did not generate a final core config')
    return { config: written, dnsGuard }
  }

  for (const [label, base] of [['static', staticProfile], ['provider-only', providerProfile]]) {
    const { config: manualConfig } = await generate({ base })
    assertRuntime(manualConfig, runOverride(manual, base), 'select', label)
    const { config: smartConfig } = await generate({ base, script: smart, enableSmart: true })
    assertRuntime(smartConfig, runOverride(smart, base), 'smart', label)
  }
  const manualExpected = runOverride(manual, staticProfile)
  const { config: mismatchedSmart } = await generate({ enableSmart: true })
  assert.notDeepEqual(mismatchedSmart.rules, manualExpected.rules, 'Manual selection requires Party Smart override off')
  console.log(`Clash Party ${PARTY_VERSION}: subscription (static/provider-only) and Smart override order passed`)

  const local = { ...staticProfile, rules: ['MATCH,DIRECT'] }
  const localExpected = runOverride(manual, local)
  const app = { controlDns: true }
  const controlledDns = { dns: { nameserver: ['127.0.0.1'] } }
  for (const binding of ['profile', 'global']) {
    const { config, dnsGuard } = await generate({ base: local, type: 'local', binding, app, controlled: controlledDns })
    assert.equal(dnsGuard.controlDns, false, `local ${binding} override`)
    assertRuntime(config, localExpected, 'select', `local ${binding} override`)
  }
  const { config: unbound } = await generate({ base: local, type: 'local', binding: 'none' })
  assert.deepEqual(unbound.rules, local.rules, 'Unbound local config keeps its own rules')
  console.log(`Clash Party ${PARTY_VERSION}: local config with bound, global, and absent JavaScript override passed`)

  const { config: dnsOverridden } = await generate({ app, controlled: controlledDns })
  assert.deepEqual(dnsOverridden.dns.nameserver, controlledDns.dns.nameserver)
  const originalDns = { 'nameserver-policy': { 'corp.test': '127.0.0.1' } }
  const protectedProfile = { ...staticProfile, dns: originalDns }
  const { config: dnsProtected, dnsGuard } = await generate({ base: protectedProfile, app, controlled: controlledDns })
  assert.equal(dnsGuard.autoDisabled, true)
  assertRuntime(dnsProtected, runOverride(manual, protectedProfile), 'select', 'subscription DNS guard')

  const tun = {
    enable: false,
    'auto-route': false,
    'strict-route': false,
    'dns-hijack': ['any:53'],
    'route-exclude-address': ['203.0.113.20/32'],
  }
  for (const type of ['remote', 'local']) {
    const { config } = await generate({ type, controlled: { mode: 'global', tun } })
    assert.equal(config.mode, 'global', type)
    for (const [field, value] of Object.entries(tun)) assert.deepEqual(config.tun[field], value, `${type} TUN ${field}`)
    assert.deepEqual(config.rules, manualExpected.rules, type)
  }
  console.log(`Clash Party ${PARTY_VERSION}: final DNS guard, TUN and routing mode precedence passed`)
}
