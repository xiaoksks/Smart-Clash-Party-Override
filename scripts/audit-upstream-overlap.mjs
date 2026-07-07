import { readFile } from 'node:fs/promises'
import https from 'node:https'
import path from 'node:path'
import vm from 'node:vm'

const UPSTREAM_URL = process.env.UPSTREAM_URL
  || 'https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/Clash%20Party/ClashParty(mihomo-smart).js'
const UPSTREAM_URLS = (process.env.UPSTREAM_URLS || UPSTREAM_URL)
  .split(',')
  .map(url => url.trim())
  .filter(Boolean)
const FALLBACK_UPSTREAM_URLS = [
  'https://cdn.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/Clash%20Party/ClashParty(mihomo-smart).js',
]
const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 30000)

const ROOT = process.cwd()
const CUSTOM_RULES_PATH = path.join(ROOT, 'custom-pre-rules.js')

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'user-agent': 'smart-config-kit-upstream-audit',
      },
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume()
        fetchText(new URL(response.headers.location, url).toString()).then(resolve, reject)
        return
      }

      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`Failed to fetch upstream: ${response.statusCode} ${response.statusMessage}`))
        return
      }

      response.setEncoding('utf8')
      let body = ''
      response.on('data', chunk => { body += chunk })
      response.on('end', () => resolve(body))
    })

    request.on('error', reject)
    request.setTimeout(FETCH_TIMEOUT_MS, () => {
      request.destroy(new Error(`Request timed out after ${FETCH_TIMEOUT_MS}ms`))
    })
    request.end()
  })
}

async function fetchUpstream() {
  const urls = Array.from(new Set(UPSTREAM_URLS.concat(FALLBACK_UPSTREAM_URLS)))
  const errors = []

  for (const url of urls) {
    try {
      return { url, body: await fetchText(url) }
    } catch (error) {
      errors.push(`${url}: ${error.message}`)
    }
  }

  throw new Error(`Failed to fetch upstream from all sources:\n${errors.join('\n')}`)
}

function readCustomRules(customRulesText) {
  const rules = vm.runInNewContext(`${stripBom(customRulesText)}\n;CUSTOM_PRE_RULES`, Object.create(null), {
    filename: CUSTOM_RULES_PATH,
    timeout: 1000,
  })

  if (!Array.isArray(rules)) throw new Error('CUSTOM_PRE_RULES must be an array')
  return rules
}

function getRuleDomain(rule) {
  const parts = rule.split(',')
  return parts.length >= 2 ? parts[1] : rule
}

function countOccurrences(text, needle) {
  if (!needle) return 0
  return text.split(needle).length - 1
}

async function main() {
  const [{ url, body: upstream }, customRulesText] = await Promise.all([
    fetchUpstream(),
    readFile(CUSTOM_RULES_PATH, 'utf8'),
  ])
  const customRules = readCustomRules(customRulesText)
  const version = upstream.match(/const VERSION = '([^']+)'/)?.[1] || 'unknown'

  console.log(`Upstream: ${url}`)
  console.log(`Upstream version: ${version}`)
  console.log(`Custom pre-rules: ${customRules.length}`)
  console.log('')

  let covered = 0
  let unique = 0
  for (const rule of customRules) {
    const domain = getRuleDomain(rule)
    const count = countOccurrences(upstream, domain)
    const status = count > 0 ? 'UPSTREAM' : 'CUSTOM'
    if (count > 0) covered += 1
    else unique += 1
    console.log(`${status}\t${String(count).padStart(2, ' ')}\t${domain}\t${rule}`)
  }

  console.log('')
  console.log(`Summary: ${covered} appear in upstream, ${unique} are custom-only.`)
  console.log('Rules that appear in upstream may still be useful here when priority must be higher.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
