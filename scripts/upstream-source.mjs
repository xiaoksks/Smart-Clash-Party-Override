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
  const match = String(version || '').match(/^v?(\d+)\.(\d+)\.(\d+)/)
  return match ? match.slice(1).map(Number) : null
}

export function compareVersions(left, right) {
  const a = parseVersionParts(left)
  const b = parseVersionParts(right)
  if (!a || !b) return String(left || '').localeCompare(String(right || ''))
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index]
  }
  return 0
}

export function sha256(body) {
  return createHash('sha256').update(body).digest('hex')
}

async function fetchValidated(urls, label, getVersion, options = {}) {
  const retries = options.retries || DEFAULT_RETRIES
  const errors = []
  for (const url of Array.from(new Set(urls))) {
    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        if (attempt > 1) console.log(`Fetching ${label} from ${url} (attempt ${attempt}/${retries})`)
        const body = (await fetchText(url)).replace(/^\uFEFF/, '')
        const version = getVersion(body)
        if (!version) throw new Error(`could not parse ${label} version`)
        if (options.minimumVersion && compareVersions(version, options.minimumVersion) < 0) {
          throw new Error(`refusing downgrade ${version} < ${options.minimumVersion}`)
        }
        if (options.requiredVersion && version !== options.requiredVersion) {
          throw new Error(`version mismatch ${version} != ${options.requiredVersion}`)
        }
        return { url, body, version, sha256: sha256(body) }
      } catch (error) {
        errors.push(`${url} attempt ${attempt}: ${error.message}`)
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
