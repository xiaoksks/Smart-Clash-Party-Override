import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { zstdDecompressSync } from 'node:zlib'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROOT } from './custom-spec.mjs'

const exec = promisify(execFile)
const SNAPSHOT = path.join(ROOT, 'scripts/upstream-snapshot.json')
const SCKI = 'IvanSolis1989/Smart-Config-Kit'
const META = 'MetaCubeX/meta-rules-dat'
const DIRECTORY = 'rulesets/generated/fused/mihomo'
export const digest = data => createHash('sha256').update(data).digest('hex')

export async function fetchBytes(url) {
  let last
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(25000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`)
      const bytes = Buffer.from(await response.arrayBuffer())
      if (!bytes.length || bytes.length > 32 * 1024 * 1024) throw new Error(`Invalid size: ${url}`)
      return bytes
    } catch (error) { last = error }
  }
  throw last
}

export function parsePayload(text) {
  if (!/^payload:\s*\r?\n/.test(text)) throw new Error('Expected YAML payload array')
  return text.split(/\r?\n/).slice(1).filter(line => line.trim() && !line.trimStart().startsWith('#')).map(line => {
    const match = line.match(/^\s+-\s+(.+?)\s*$/)
    if (!match) throw new Error(`Unsupported payload line: ${line}`)
    const item = match[1]
    const value = item.startsWith('"') ? JSON.parse(item) : item.startsWith("'") ? item.slice(1, -1).replace(/''/g, "'") : item
    if (typeof value !== 'string' || !value.includes(',')) throw new Error(`Invalid classical rule: ${item}`)
    return value
  })
}

async function revision(repo, branch) {
  const { stdout } = await exec('git', ['ls-remote', '--refs', `https://github.com/${repo}.git`, `refs/heads/${branch}`], { windowsHide: true, timeout: 60000 })
  const sha = stdout.split(/\s+/)[0]
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error(`Cannot resolve ${repo}@${branch}`)
  return sha
}

async function sourceTopology(sha) {
  const dir = path.join(ROOT, '.build/upstream-scki.git')
  await exec('git', ['init', '--bare', dir], { windowsHide: true })
  await exec('git', ['-C', dir, 'fetch', '--depth=1', '--filter=blob:none', `https://github.com/${SCKI}.git`, sha], { windowsHide: true, timeout: 120000, maxBuffer: 4 * 1024 * 1024 })
  const { stdout } = await exec('git', ['-C', dir, 'ls-tree', '-r', '--name-only', 'FETCH_HEAD', DIRECTORY], { windowsHide: true })
  const files = stdout.trim().split(/\r?\n/).filter(file => /\/scki-fused-.*\.(mrs|yaml)$/.test(file)).map(file => path.posix.basename(file))
  // Upstream ships both YAML and MRS for domain/IP sets. Track the preferred
  // format once, and preserve this project's explicit no-ad-blocking policy.
  return files.filter(file => !/-ad-/.test(file) &&
    !(file.endsWith('.yaml') && files.includes(file.replace(/\.yaml$/, '.mrs')))).sort()
}

export async function syncUpstream({ check = false } = {}) {
  const base = JSON.parse(await readFile(path.join(ROOT, 'scripts/base-data.json'), 'utf8'))
  const previous = await readFile(SNAPSHOT, 'utf8').then(JSON.parse).catch(error => { if (error.code !== 'ENOENT') throw error; return null })
  const [scki, meta] = await Promise.all([revision(SCKI, 'main'), revision(META, 'meta')])
  const topology = await sourceTopology(scki)
  const expected = Object.keys(base.ruleProviders).filter(name => name.startsWith('scki-fused-')).map(name => name + (base.ruleProviders[name].format === 'mrs' ? '.mrs' : '.yaml')).sort()
  const added = topology.filter(name => !expected.includes(name))
  const removed = expected.filter(name => !topology.includes(name))
  await mkdir(path.join(ROOT, '.build'), { recursive: true })
  await writeFile(path.join(ROOT, '.build/upstream-diff.json'), JSON.stringify({ revisions: { scki, meta }, added, removed }, null, 2) + '\n')
  if (added.length || removed.length) throw new Error(`Upstream provider topology changed; review routing precedence before publishing. Added: ${added.join(', ') || 'none'}; removed: ${removed.join(', ') || 'none'}. See .build/upstream-diff.json`)
  if (check && !previous) throw new Error('No upstream snapshot; run npm run sync:upstream')
  const revisions = check ? previous.revisions : { scki, meta }
  const result = { revisions, files: {}, aiDomains: [] }
  const entries = Object.entries(base.ruleProviders)
  let cursor = 0
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < entries.length) {
      const [name, provider] = entries[cursor++]
      const sourcePath = name === 'local-douyu' ? 'rulesets/generated/mihomo-mrs/douyu.mrs' : `${DIRECTORY}/${name}.${provider.format}`
      const url = `https://raw.githubusercontent.com/${SCKI}/${revisions.scki}/${sourcePath}`
      const bytes = await fetchBytes(url)
      const record = { url, sha256: digest(bytes), bytes: bytes.length }
      if (provider.format === 'mrs') {
        const data = zstdDecompressSync(bytes, { maxOutputLength: 64 * 1024 * 1024 })
        if (data.subarray(0, 3).toString() !== 'MRS') throw new Error(`Invalid MRS header: ${name}`)
      } else record.payload = parsePayload(bytes.toString('utf8'))
      if (check && previous.files[name]?.sha256 !== record.sha256) throw new Error(`Snapshot hash mismatch: ${name}`)
      if (check && JSON.stringify(previous.files[name]?.payload) !== JSON.stringify(record.payload)) throw new Error(`Classical payload differs from pinned source: ${name}`)
      result.files[name] = record
      const cacheDir = path.join(ROOT, '.build/provider-cache')
      await mkdir(cacheDir, { recursive: true })
      await writeFile(path.join(cacheDir, record.sha256 + '.' + provider.format), bytes)
    }
  }))
  const aiUrl = `https://raw.githubusercontent.com/${META}/${revisions.meta}/geo/geosite/category-ai-!cn.list`
  const aiBytes = await fetchBytes(aiUrl)
  result.aiSource = { url: aiUrl, sha256: digest(aiBytes), bytes: aiBytes.length }
  result.aiDomains = [...new Set(aiBytes.toString('utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')))].sort()
  if (result.aiDomains.length < 100 || result.aiDomains.some(d => !/^(?:\+\.)?[a-z0-9_.-]+$/i.test(d))) throw new Error('Invalid upstream AI domain list')
  result.files = Object.fromEntries(Object.entries(result.files).sort(([a], [b]) => a.localeCompare(b)))
  if (check) {
    if (previous.aiSource.sha256 !== result.aiSource.sha256) throw new Error('AI snapshot hash mismatch')
    if (JSON.stringify(previous.aiDomains) !== JSON.stringify(result.aiDomains)) throw new Error('AI payload differs from pinned source')
    console.log(`Verified ${entries.length} upstream files + ${result.aiDomains.length} AI patterns (SHA256).`)
    if (scki !== revisions.scki || meta !== revisions.meta) console.log('New upstream revision available; run npm run sync:upstream to review/update the complete snapshot.')
  } else {
    await writeFile(SNAPSHOT, JSON.stringify(result, null, 2) + '\n')
    console.log(`Locked ${entries.length} providers + ${result.aiDomains.length} AI patterns at ${scki.slice(0, 12)} / ${meta.slice(0, 12)}`)
  }
  return result
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncUpstream({ check: process.argv.includes('--check') }).catch(error => { console.error(error.message); process.exitCode = 1 })
}
