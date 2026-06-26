import { mkdir, readFile, writeFile } from 'node:fs/promises'
import https from 'node:https'
import path from 'node:path'

const UPSTREAM_URL = process.env.UPSTREAM_URL
  || 'https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/Clash%20Party/ClashParty(mihomo-smart).js'

const ROOT = process.cwd()
const CUSTOM_RULES_PATH = path.join(ROOT, 'custom-pre-rules.js')
const OUTPUT_PATH = path.join(ROOT, 'dist', 'Smart-Override.js')

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
    request.end()
  })
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function ensureCustomRulesDeclaration(customRules) {
  if (!/\bconst\s+CUSTOM_PRE_RULES\s*=/.test(customRules)) {
    throw new Error('custom-pre-rules.js must define: const CUSTOM_PRE_RULES = [...]')
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

async function main() {
  const [upstream, customRules] = await Promise.all([
    fetchText(UPSTREAM_URL),
    readFile(CUSTOM_RULES_PATH, 'utf8'),
  ])

  ensureCustomRulesDeclaration(customRules)

  const merged = injectCustomRules(upstream, customRules)

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, merged, 'utf8')

  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
