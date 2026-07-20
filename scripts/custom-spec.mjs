import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'

export const ROOT = process.cwd()
export const CUSTOM_SPEC_PATH = path.join(ROOT, 'custom-overrides.js')

function assertUniqueStrings(values, label) {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array`)
  const seen = new Set()
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} entries must be non-empty strings`)
    if (seen.has(value)) throw new Error(`Duplicate ${label} entry: ${value}`)
    seen.add(value)
  }
}

export async function loadCustomSpec() {
  const source = (await readFile(CUSTOM_SPEC_PATH, 'utf8')).replace(/^\uFEFF/, '')
  const spec = vm.runInNewContext(`${source}\n;CUSTOM_OVERRIDE_SPEC`, Object.create(null), {
    filename: CUSTOM_SPEC_PATH,
    timeout: 1000,
  })

  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new Error('CUSTOM_OVERRIDE_SPEC must be an object')
  }
  if (typeof spec.removeAdBlocking !== 'boolean') {
    throw new Error('removeAdBlocking must be a boolean')
  }
  assertUniqueStrings(spec.preRules, 'preRules')
  assertUniqueStrings(spec.foreignDnsDomains, 'foreignDnsDomains')
  return {
    removeAdBlocking: spec.removeAdBlocking,
    preRules: Array.from(spec.preRules),
    foreignDnsDomains: Array.from(spec.foreignDnsDomains),
  }
}
