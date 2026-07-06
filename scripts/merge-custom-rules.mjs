import { mkdir, readFile, writeFile } from 'node:fs/promises'
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
const FETCH_RETRIES = Number(process.env.FETCH_RETRIES || 3)
const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 30000)

const ROOT = process.cwd()
const CUSTOM_RULES_PATH = path.join(ROOT, 'custom-pre-rules.js')
const OUTPUT_PATH = path.join(ROOT, 'dist', 'Smart-Override.js')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'user-agent': 'smart-config-kit-custom-merge',
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
    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt += 1) {
      try {
        if (url !== UPSTREAM_URL || attempt > 1) {
          console.log(`Fetching upstream from ${url} (attempt ${attempt}/${FETCH_RETRIES})`)
        }
        return await fetchText(url)
      } catch (error) {
        errors.push(`${url} attempt ${attempt}: ${error.message}`)
        if (attempt < FETCH_RETRIES) await sleep(1000 * attempt)
      }
    }
  }

  throw new Error(`Failed to fetch upstream from all sources:\n${errors.join('\n')}`)
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function ensureCustomRulesDeclaration(customRules) {
  if (!/\bconst\s+CUSTOM_PRE_RULES\s*=/.test(customRules)) {
    throw new Error('custom-pre-rules.js must define: const CUSTOM_PRE_RULES = [...]')
  }

  const sandbox = Object.create(null)
  const rules = vm.runInNewContext(`${stripBom(customRules)}\n;CUSTOM_PRE_RULES`, sandbox, {
    filename: CUSTOM_RULES_PATH,
    timeout: 1000,
  })

  if (!Array.isArray(rules)) {
    throw new Error('CUSTOM_PRE_RULES must be an array')
  }

  const seen = new Set()
  for (const rule of rules) {
    if (typeof rule !== 'string' || !rule.trim()) {
      throw new Error('Every CUSTOM_PRE_RULES entry must be a non-empty string')
    }
    if (seen.has(rule)) {
      throw new Error(`Duplicate custom rule: ${rule}`)
    }
    seen.add(rule)
  }
}

function injectCustomRules(upstream, customRules) {
  const marker = 'function injectRules(config) {'
  const markerIndex = upstream.indexOf(marker)

  if (markerIndex === -1) {
    throw new Error('Could not find function injectRules(config) in upstream file')
  }

  const rulesStart = upstream.indexOf('config.rules = [', markerIndex)

  if (rulesStart === -1) {
    throw new Error('Could not find config.rules = [ inside injectRules(config)')
  }

  const insertAt = upstream.indexOf('\n', rulesStart)

  if (insertAt === -1) {
    throw new Error('Could not find insertion point after config.rules = [')
  }

  const header = [
    '// This file is generated automatically. Do not edit dist output directly.',
    `// Upstream: ${UPSTREAM_URL}`,
    '// Edit custom-pre-rules.js, then run: npm run build',
    '',
    stripBom(customRules).trim(),
    '',
  ].join('\n')

  return header
    + stripBom(upstream).slice(0, insertAt + 1)
    + '    ...CUSTOM_PRE_RULES,\n'
    + stripBom(upstream).slice(insertAt + 1)
}

function applyCompatibilityPatches(merged) {
  let patched = merged

  // Clash Party can fail to load when the active geoip.dat does not contain
  // the Indonesia country-code entry. The upstream script already has exact
  // Indonesian domain rules before this line, so removing this GeoIP fallback
  // is safer than breaking the whole override at parse time.
  const before = patched
  patched = patched.replace(
    /    `GEOIP,ID,\$\{BIZ\.INTL_SITE\},no-resolve`,\r?\n/,
    '    // Compatibility: removed Indonesia GeoIP fallback because some geoip.dat builds do not expose its country-code entry.\n',
  )

  if (patched !== before) {
    console.log('Applied compatibility patch: removed unsupported Indonesia GeoIP fallback')
  }

  patched = applySmartStabilityPatch(patched)
  patched = applyDirectDnsStabilityPatch(patched)

  return patched
}

function replaceOrThrow(text, pattern, replacement, label) {
  const next = text.replace(pattern, replacement)
  if (next === text) {
    throw new Error(`Failed to apply compatibility patch: ${label}`)
  }
  console.log(`Applied compatibility patch: ${label}`)
  return next
}

function applySmartStabilityPatch(merged) {
  let patched = merged

  patched = replaceOrThrow(
    patched,
    /const REGION_ORDER = \['GLOBAL', 'HK', 'TW', 'SG', 'JPKR', 'APAC', 'US', 'EU', 'AMERICAS', 'AFRICA', 'OTHER'\]\r?\n/,
    [
      "const REGION_ORDER = ['GLOBAL', 'HK', 'TW', 'SG', 'JPKR', 'APAC', 'US', 'EU', 'AMERICAS', 'AFRICA', 'OTHER']",
      "// Personal stability patch: business groups default to the global Smart pool,",
      "// then keep the existing nearby-region fallback order unchanged.",
      "const LOW_LATENCY_REGION_ORDER = ['GLOBAL', 'HK', 'SG', 'TW', 'JPKR', 'APAC', 'US', 'EU', 'AMERICAS', 'OTHER', 'AFRICA']",
      "const SEA_REGION_ORDER = ['SG', 'HK', 'TW', 'JPKR', 'APAC', 'US', 'EU', 'GLOBAL']",
      "const SMART_CHECK_URL = 'https://www.gstatic.com/generate_204'",
      'const SMART_CHECK_INTERVAL = 180',
      'const SMART_CHECK_TIMEOUT = 3000',
      '',
    ].join('\n'),
    'prefer global Smart group for business group defaults',
  )

  patched = replaceOrThrow(
    patched,
    /function buildStandardProxies\(\) \{\r?\n  return withResidential\(REGION_ORDER\)\.concat\('DIRECT'\)\r?\n\}/,
    "function buildStandardProxies() {\n  return withResidential(LOW_LATENCY_REGION_ORDER).concat('DIRECT')\n}",
    'make standard business groups prefer nearby regions',
  )

  patched = replaceOrThrow(
    patched,
    /function buildRegionPreferredProxies\(primaryKey\) \{\r?\n  var order = \[primaryKey\]\.concat\(REGION_ORDER\.filter\(function\(key\) \{ return key !== primaryKey \}\)\)\r?\n  return withResidential\(order\)\.concat\('DIRECT'\)\r?\n\}/,
    "function buildRegionPreferredProxies(primaryKey) {\n  var order = [primaryKey].concat(LOW_LATENCY_REGION_ORDER.filter(function(key) { return key !== primaryKey }))\n  return withResidential(order).concat('DIRECT')\n}",
    'make region-preferred groups fall back to nearby regions',
  )

  patched = replaceOrThrow(
    patched,
    /function buildDirectFirstProxies\(\) \{\r?\n  return \['DIRECT'\]\.concat\(withResidential\(REGION_ORDER\)\)\r?\n\}/,
    "function buildDirectFirstProxies() {\n  return ['DIRECT'].concat(withResidential(LOW_LATENCY_REGION_ORDER))\n}",
    'make direct-first fallbacks prefer nearby regions',
  )

  patched = replaceOrThrow(
    patched,
    /function buildTrackerProxies\(\) \{\r?\n  return \['REJECT', 'DIRECT'\]\.concat\(withResidential\(\['GLOBAL', 'HK', 'SG', 'APAC'\]\)\)\r?\n\}/,
    "function buildTrackerProxies() {\n  return ['REJECT', 'DIRECT'].concat(withResidential(['HK', 'SG', 'GLOBAL', 'APAC']))\n}",
    'make tracker fallback order deterministic',
  )

  patched = replaceOrThrow(
    patched,
    /function buildSeaProxies\(\) \{\r?\n  return withResidential\(\['SG', 'APAC', 'GLOBAL', 'HK', 'JPKR', 'US'\]\)\.concat\('DIRECT'\)\r?\n\}/,
    "function buildSeaProxies() {\n  return withResidential(SEA_REGION_ORDER).concat('DIRECT')\n}",
    'make SEA business groups prefer nearby regions',
  )

  patched = replaceOrThrow(
    patched,
    /var aiProxies = filterActive\(buildHomeFirstProxies\(REGION_ORDER\)\)/,
    'var aiProxies = filterActive(buildHomeFirstProxies(LOW_LATENCY_REGION_ORDER))',
    'make AI home-IP defaults prefer nearby regions',
  )

  patched = replaceOrThrow(
    patched,
    /var group = \{ name: name, type: 'smart', uselightgbm: true, collectdata: false, strategy: 'sticky-sessions', interval: 300, tolerance: 30, proxies: proxies\.slice\(\) \}/,
    "var group = { name: name, type: 'smart', uselightgbm: true, collectdata: true, strategy: 'sticky-sessions', url: SMART_CHECK_URL, interval: SMART_CHECK_INTERVAL, tolerance: 20, timeout: SMART_CHECK_TIMEOUT, lazy: false, 'max-failed-times': 2, proxies: proxies.slice() }",
    'enable active Smart health checks and local data collection',
  )

  patched = replaceOrThrow(
    patched,
    /config\.profile\['store-selected'\] = true/,
    "config.profile['store-selected'] = false",
    'disable stale selected-group persistence',
  )

  return patched
}

function applyDirectDnsStabilityPatch(merged) {
  let patched = merged

  patched = replaceOrThrow(
    patched,
    /var domesticDoH = \['https:\/\/dns\.alidns\.com\/dns-query', 'https:\/\/doh\.pub\/dns-query'\]/,
    "var domesticDoH = ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query']\n  var domesticPlainDns = ['223.5.5.5', '223.6.6.6', '119.29.29.29']",
    'add plain DNS fallback for DIRECT resolution',
  )

  patched = replaceOrThrow(
    patched,
    /config\.dns\['direct-nameserver'\] = domesticDoH\.slice\(\)/,
    "config.dns['direct-nameserver'] = domesticDoH.concat(domesticPlainDns)",
    'give DIRECT resolution DoH plus plain domestic DNS',
  )

  patched = replaceOrThrow(
    patched,
    /config\.dns\['direct-nameserver-follow-policy'\] = true/,
    "config.dns['direct-nameserver-follow-policy'] = false",
    'keep DIRECT resolution off foreign nameserver-policy',
  )

  return patched
}

async function main() {
  const [upstream, customRules] = await Promise.all([
    fetchUpstream(),
    readFile(CUSTOM_RULES_PATH, 'utf8'),
  ])

  ensureCustomRulesDeclaration(customRules)

  const merged = applyCompatibilityPatches(injectCustomRules(upstream, customRules))

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, merged, 'utf8')

  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
