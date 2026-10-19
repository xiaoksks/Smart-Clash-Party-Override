import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { buildWebRtcProtectionRules, loadCustomSpec, ROOT } from './custom-spec.mjs'

function inspectOverride(code) {
  return vm.runInNewContext(`${code}\n;({
    version: VERSION,
    providers: Object.keys(MIHOMO_FUSED_RULE_PROVIDERS || {}).length,
    upstreamRules: (MIHOMO_FUSED_RULES || []).length,
  })`, { console: { log() {}, error() {} } }, { timeout: 5000 })
}

async function main() {
  const [normalCode, liteCode, metadata, spec] = await Promise.all([
    readFile(path.join(ROOT, 'dist', 'Normal-Override.js'), 'utf8'),
    readFile(path.join(ROOT, 'dist', 'Lite-Override.js'), 'utf8'),
    readFile(path.join(ROOT, '.build', 'metadata.json'), 'utf8').then(JSON.parse),
    loadCustomSpec(),
  ])
  const normalSummary = inspectOverride(normalCode)
  const liteSummary = inspectOverride(liteCode)

  console.log('## Clash Party override build')
  console.log('')
  console.log('### Normal Edition (`dist/Normal-Override.js`)')
  console.log(`- Upstream: \`${normalSummary.version}\``)
  console.log(`- SHA-256: \`${metadata.normal?.sha256 || metadata.upstream?.sha256 || 'n/a'}\``)
  console.log(`- Type: Latency Auto-Select (url-test, 42 groups)`)
  console.log('')
  console.log('### Lite Edition (`dist/Lite-Override.js`)')
  console.log(`- Upstream: \`${liteSummary.version}\``)
  console.log(`- Type: Minimal Dual-Group (select: 🌐 国外节点 / 🇨🇳 国内节点)`)
  console.log('')
  console.log('### Custom Rules & Adjustments (Shared)')
  console.log(`- Fused providers: ${normalSummary.providers}`)
  console.log(`- Upstream rules: ${normalSummary.upstreamRules}`)
  console.log(`- Ad blocking removed: ${spec.removeAdBlocking ? 'yes' : 'no'}`)
  console.log(`- China IP forced direct: ${spec.forceChinaIpDirect ? 'yes' : 'no'}`)
  console.log(`- WebRTC leak protection: ${spec.preventWebRtcLeak ? `yes (${buildWebRtcProtectionRules(spec).length} rules)` : 'no'}`)
  console.log(`- Rule-set target overrides: ${Object.keys(spec.ruleSetTargetOverrides).length}`)
  console.log(`- Custom priority rules: ${spec.preRules.length}`)
  console.log(`- Custom foreign-DNS domains: ${spec.foreignDnsDomains.length}`)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
