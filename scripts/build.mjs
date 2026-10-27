import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCustomSpec, ROOT } from './custom-spec.mjs'
import { compileOverride } from './compile.mjs'

export async function loadBuildInputs() {
  const [spec, base, snapshot, catalog, domestic, runtime] = await Promise.all([
    loadCustomSpec(),
    readFile(path.join(ROOT, 'scripts/base-data.json'), 'utf8').then(JSON.parse),
    readFile(path.join(ROOT, 'scripts/upstream-snapshot.json'), 'utf8').then(JSON.parse),
    readFile(path.join(ROOT, 'scripts/ai-services.json'), 'utf8').then(JSON.parse),
    readFile(path.join(ROOT, 'scripts/domestic-services.json'), 'utf8').then(JSON.parse),
    readFile(path.join(ROOT, 'scripts/runtime.js'), 'utf8').then(text => text.replace(/\r\n/g, '\n')),
  ])
  return { spec, base, snapshot, catalog, domestic, runtime }
}

export async function buildLiteOverride() {
  const { code, report } = compileOverride(await loadBuildInputs())
  await mkdir(path.join(ROOT, 'dist'), { recursive: true })
  await writeFile(path.join(ROOT, 'dist/Lite-Override.js'), code)
  await writeFile(path.join(ROOT, 'dist/build-report.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(`Generated Lite-Override.js: ${report.rules} rules, ${report.providers} providers, ${report.aiDomains} AI domain patterns`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildLiteOverride().catch(error => { console.error(error); process.exitCode = 1 })
}
