import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUTPUT_PATH = path.join(ROOT, 'dist', 'Smart-Override.js')

const REQUIRED_PRE_RULES = [
  'DOMAIN,ip.cip.cc,DIRECT',
  'DOMAIN,myip.ipip.net,DIRECT',
  'DOMAIN-SUFFIX,mail.qq.com,DIRECT',
  'DOMAIN-SUFFIX,mail.163.com,DIRECT',
  'DOMAIN-SUFFIX,mail.126.com,DIRECT',
  'DOMAIN-SUFFIX,mail.sina.com.cn,DIRECT',
  'DOMAIN-SUFFIX,mail.aliyun.com,DIRECT',
  'DOMAIN-SUFFIX,feishu.cn,DIRECT',
  'DOMAIN-SUFFIX,dingtalk.com,DIRECT',
  'DOMAIN-SUFFIX,welink.huaweicloud.com,DIRECT',
  'DOMAIN-SUFFIX,bbys.app,DIRECT',
  'DOMAIN-SUFFIX,steamcdn-a.akamaihd.net,DIRECT',
  'DOMAIN-SUFFIX,steampipe.akamaized.net,DIRECT',
  'DOMAIN-SUFFIX,steamcontent.com,DIRECT',
  'DOMAIN-SUFFIX,steamserver.net,DIRECT',
  'DOMAIN-SUFFIX,steamstatic.com,DIRECT',
  'DOMAIN-SUFFIX,juequling.com,DIRECT',
]

const REQUIRED_OUTPUT_SNIPPETS = [
  "const LOW_LATENCY_REGION_ORDER = ['GLOBAL', 'HK', 'SG', 'TW', 'JPKR', 'APAC', 'US', 'EU', 'AMERICAS', 'OTHER', 'AFRICA']",
  "const SMART_CHECK_URL = 'https://www.gstatic.com/generate_204'",
  "collectdata: true",
  'lazy: false',
  "'max-failed-times': 2",
  "config.profile['store-selected'] = false",
  'buildStandardProxies()',
  'withResidential(LOW_LATENCY_REGION_ORDER)',
  "else if (g.name !== 'GLOBAL') { otherGroups.push(g) }",
  "var domesticPlainDns = ['223.5.5.5', '223.6.6.6', '119.29.29.29']",
  "config.dns['direct-nameserver'] = domesticDoH.concat(domesticPlainDns)",
  "config.dns['direct-nameserver-follow-policy'] = false",
]

function getCustomPreRulesBlock(text) {
  const start = text.indexOf('const CUSTOM_PRE_RULES = [')
  if (start === -1) throw new Error('Could not find CUSTOM_PRE_RULES in generated output')

  const end = text.indexOf(']\n// Clash Smart', start)
  if (end === -1) throw new Error('Could not find end of generated CUSTOM_PRE_RULES block')

  return text.slice(start, end)
}

async function main() {
  const output = await readFile(OUTPUT_PATH, 'utf8')
  const preRules = getCustomPreRulesBlock(output)
  const required = REQUIRED_PRE_RULES
  const missing = required.filter(rule => !preRules.includes(`'${rule}'`))

  if (missing.length) {
    throw new Error(`Missing high-priority pre-rules:\n${missing.join('\n')}`)
  }

  if (/`GEOIP,ID,/.test(output)) {
    throw new Error('Generated output still contains the unsupported Indonesia GeoIP fallback')
  }

  const missingSnippets = REQUIRED_OUTPUT_SNIPPETS.filter(snippet => !output.includes(snippet))
  if (missingSnippets.length) {
    throw new Error(`Missing Smart stability patches:\n${missingSnippets.join('\n')}`)
  }

  console.log(`Priority audit passed (${required.length} guarded rules)`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
