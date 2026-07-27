import { createHash } from 'node:crypto'
import https from 'node:https'

const DEFAULT_RETRIES = Number(process.env.FETCH_RETRIES || 3)
const DEFAULT_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 30000)

const SMART_PATH = 'Clash%20Party/ClashParty(mihomo-smart).js'
const GRAPH_PATH = 'rulesets/source/routing-graph.js'

const SMART_URLS = (process.env.UPSTREAM_URLS || process.env.UPSTREAM_URL || [
  `https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/${SMART_PATH}`,
  `https://cdn.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/${SMART_PATH}`,
].join(','))
  .split(',').map(value => value.trim()).filter(Boolean)

const GRAPH_URLS = (process.env.UPSTREAM_GRAPH_URLS || [
  `https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/${GRAPH_PATH}`,
  `https://cdn.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/${GRAPH_PATH}`,
].join(','))
  .split(',').map(value => value.trim()).filter(Boolean)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function fetchText(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'user-agent': 'smart-clash-party-override' } }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume()
        fetchText(new URL(response.headers.location, url).toString(), timeoutMs).then(resolve, reject)
        return
      }
      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`HTTP ${response.statusCode} ${response.statusMessage}`))
        return
      }
      response.setEncoding('utf8')
      let body = ''
      response.on('data', chunk => { body += chunk })
      response.on('end', () => resolve(body))
    })
    request.on('error', reject)
    request.setTimeout(timeoutMs, () => request.destroy(new Error(`timeout after ${timeoutMs}ms`)))
    request.end()
  })
}

function parseVersionParts(version) {
  const match = String(version || '').match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/)
  if (!match) return null
  return {
    base: match.slice(1, 4).map(Number),
    suffix: match[4] ? match[4].split('.') : [],
  }
}

export function compareBaseVersions(left, right) {
  const a = parseVersionParts(left)
  const b = parseVersionParts(right)
  if (!a || !b) return String(left || '').localeCompare(String(right || ''))
  for (let index = 0; index < 3; index += 1) {
    if (a.base[index] !== b.base[index]) return a.base[index] - b.base[index]
  }
  return 0
}

export function compareVersions(left, right) {
  const baseComparison = compareBaseVersions(left, right)
  if (baseComparison !== 0) return baseComparison

  const a = parseVersionParts(left)
  const b = parseVersionParts(right)
  if (!a || !b) return 0
  if (a.suffix.length === 0 || b.suffix.length === 0) return a.suffix.length - b.suffix.length

  const length = Math.max(a.suffix.length, b.suffix.length)
  for (let index = 0; index < length; index += 1) {
    if (a.suffix[index] === undefined) return -1
    if (b.suffix[index] === undefined) return 1
    const leftPart = a.suffix[index]
    const rightPart = b.suffix[index]
    const leftNumber = /^\d+$/.test(leftPart) ? Number(leftPart) : null
    const rightNumber = /^\d+$/.test(rightPart) ? Number(rightPart) : null
    if (leftNumber !== null && rightNumber !== null && leftNumber !== rightNumber) return leftNumber - rightNumber
    const partComparison = leftPart.localeCompare(rightPart)
    if (partComparison !== 0) return partComparison
  }
  return 0
}

export function sha256(body) {
  return createHash('sha256').update(body).digest('hex')
}

class SourceValidationError extends Error {}

async function fetchValidated(urls, label, getVersion, options = {}) {
  const retries = options.retries || DEFAULT_RETRIES
  const errors = []
  for (const url of Array.from(new Set(urls))) {
    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        if (attempt > 1) console.log(`Fetching ${label} from ${url} (attempt ${attempt}/${retries})`)
        const body = (await fetchText(url)).replace(/^\uFEFF/, '')
        const version = getVersion(body)
        if (!version) throw new SourceValidationError(`could not parse ${label} version`)
        if (options.minimumVersion && compareVersions(version, options.minimumVersion) < 0) {
          throw new SourceValidationError(`refusing downgrade ${version} < ${options.minimumVersion}`)
        }
        if (options.requiredBaseVersion && compareBaseVersions(version, options.requiredBaseVersion) !== 0) {
          throw new SourceValidationError(`base version mismatch ${version} != ${options.requiredBaseVersion}`)
        }
        return { url, body, version, sha256: sha256(body) }
      } catch (error) {
        errors.push(`${url} attempt ${attempt}: ${error.message}`)
        if (error instanceof SourceValidationError) break
        if (attempt < retries) await sleep(attempt * 1000)
      }
    }
  }
  throw new Error(`Failed to fetch ${label}:\n${errors.join('\n')}`)
}

export function parseSmartVersion(body) {
  return body.match(/const VERSION = '([^']+)'/)?.[1] || null
}

export function parseGraphVersion(body) {
  return body.match(/const SOURCE_GRAPH_VERSION = '([^']+)'/)?.[1] || null
}

export function fetchSmartSource(options = {}) {
  return fetchValidated(SMART_URLS, 'Smart override', parseSmartVersion, options)
}

export function fetchRoutingGraph(options = {}) {
  return fetchValidated(GRAPH_URLS, 'routing graph', parseGraphVersion, options)
}
