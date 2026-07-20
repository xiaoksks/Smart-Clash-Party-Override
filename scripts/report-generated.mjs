import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { loadCustomSpec, ROOT } from './custom-spec.mjs'

async function main() {
  const [output, metadata, spec] = await Promise.all([
    readFile(path.join(ROOT, 'dist', 'Smart-Override.js'), 'utf8'),
    readFile(path.join(ROOT, '.build', 'metadata.json'), 'utf8').then(JSON.parse),
    loadCustomSpec(),
  ])
  const summary = vm.runInNewContext(`${output}\n;({
    version: VERSION,
    providers: Object.keys(MIHOMO_FUSED_RULE_PROVIDERS || {}).length,
    upstreamRules: (MIHOMO_FUSED_RULES || []).length,
  })`, { console: { log() {}, error() {} } }, { timeout: 5000 })

  console.log('## Clash Party override build')
  console.log('')
  console.log(`- Upstream: \`${summary.version}\``)
  console.log(`- Upstream SHA-256: \`${metadata.upstream.sha256}\``)
  console.log(`- Fused providers: ${summary.providers}`)
  console.log(`- Upstream rules: ${summary.upstreamRules}`)
  console.log(`- Ad blocking removed: ${spec.removeAdBlocking ? 'yes' : 'no'}`)
  console.log(`- Custom priority rules: ${spec.preRules.length}`)
  console.log(`- Custom foreign-DNS domains: ${spec.foreignDnsDomains.length}`)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
