import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildWebRtcProtectionRules, loadCustomSpec, ROOT } from './custom-spec.mjs'

const DIST_PATH = path.join(ROOT, 'dist', 'Lite-Override.js')
const BASE_DATA_PATH = path.join(ROOT, 'scripts', 'base-data.json')

function normalizeRuleTarget(rule) {
  const parts = rule.split(',')
  const hasNoResolve = parts[parts.length - 1] === 'no-resolve'
  const oldTarget = hasNoResolve ? parts[parts.length - 2] : parts[parts.length - 1]

  let newTarget
  if (['REJECT', 'REJECT-DROP', 'PASS'].includes(oldTarget)) {
    newTarget = oldTarget
  } else if (['DIRECT', '🇨🇳 常用网站', '📺 国内媒体', '🕹️ 国内游戏', '🏠 国内网站', '📺 国内流媒体', '🇨🇳 国内节点'].includes(oldTarget)) {
    newTarget = '🇨🇳 国内节点'
  } else {
    newTarget = '🌐 国外节点'
  }

  if (hasNoResolve) {
    parts[parts.length - 2] = newTarget
  } else {
    parts[parts.length - 1] = newTarget
  }
  return parts.join(',')
}

export async function buildLiteOverride() {
  const [spec, baseDataRaw] = await Promise.all([
    loadCustomSpec(),
    readFile(BASE_DATA_PATH, 'utf8'),
  ])
  const baseData = JSON.parse(baseDataRaw)

  // 1. Build WebRTC protection rules
  const webRtcRules = buildWebRtcProtectionRules(spec)

  // 2. Pre-rules (separated by direct vs non-direct)
  const directPreRules = spec.preRules
    .filter(r => {
      const parts = r.split(',')
      const target = parts[parts.length - 1] === 'no-resolve' ? parts[parts.length - 2] : parts[parts.length - 1]
      return target === 'DIRECT' || target === '🇨🇳 国内节点'
    })
    .map(normalizeRuleTarget)

  const nonDirectPreRules = spec.preRules
    .filter(r => {
      const parts = r.split(',')
      const target = parts[parts.length - 1] === 'no-resolve' ? parts[parts.length - 2] : parts[parts.length - 1]
      return target !== 'DIRECT' && target !== '🇨🇳 国内节点'
    })
    .map(normalizeRuleTarget)

  // 3. Douyu local override rule
  const localRuleSetRules = ['RULE-SET,local-douyu,🇨🇳 国内节点']

  // 4. China IP authoritative direct rule
  const chinaIpRules = ['RULE-SET,scki-fused-075-cn-site-ipcidr-no-resolve,🇨🇳 国内节点,no-resolve']

  // 5. Baseline rules from base-data (excluding duplicate douyu / chinaIp)
  const seenRules = new Set()
  const assembledRules = []

  const priorityRules = [
    ...localRuleSetRules,
    ...directPreRules,
    ...webRtcRules,
    ...chinaIpRules,
    ...nonDirectPreRules,
  ]

  for (const rule of priorityRules) {
    if (!seenRules.has(rule)) {
      seenRules.add(rule)
      assembledRules.push(rule)
    }
  }

  for (const rule of baseData.baselineRules) {
    const normalized = normalizeRuleTarget(rule)
    if (!seenRules.has(normalized)) {
      seenRules.add(normalized)
      assembledRules.push(normalized)
    }
  }

  // Ensure MATCH is at the end
  const nonMatchRules = assembledRules.filter(r => !r.startsWith('MATCH,'))
  const finalRules = [...nonMatchRules, 'MATCH,🌐 国外节点']

  // 6. Rule Providers: base providers + local douyu
  const ruleProviders = {
    'local-douyu': {
      type: 'http',
      behavior: 'domain',
      format: 'mrs',
      url: 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/douyu.mrs?scki=v6.0.20',
      path: './ruleset/local/v6.0.20/douyu.mrs',
      interval: 86400,
      proxy: '🌐 国外节点',
    },
    ...baseData.ruleProviders,
  }
  // Ensure all rule providers have proxy set to '🌐 国外节点'
  for (const p of Object.values(ruleProviders)) {
    if (p.proxy && p.proxy !== 'DIRECT') {
      p.proxy = '🌐 国外节点'
    }
  }

  // 7. Assemble the standalone Lite-Override.js script
  const content = `// Clash Party / Mihomo Override - Lite 极简版
// 仅保留「🌐 国外节点」与「🇨🇳 国内节点」两大策略组，全本地自主维护
// 自定义规则与配置请编辑 custom-overrides.js，然后运行 npm run check

const LITE_RULES = ${JSON.stringify(finalRules, null, 2)}
const LITE_RULE_PROVIDERS = ${JSON.stringify(ruleProviders, null, 2)}
const LITE_DNS_CONFIG = ${JSON.stringify(baseData.dns, null, 2)}
const LITE_FOREIGN_DNS_DOMAINS = ${JSON.stringify(spec.foreignDnsDomains, null, 2)}
const LITE_TUN_EXCLUDE_PROCESSES = ${JSON.stringify(spec.tunExcludeProcesses || [], null, 2)}

// 节点分类辅助工具：精准识别国内回国节点与说明节点
var INFO_REGEX = /流量|到期|过期|重置|官网|通知|订阅|套餐|客服|QQ群|TG频道|网址|剩余|官方/i
var CN_NODE_REGEX = /中国(?:电信|联通|移动|铁通|中转|专线)|(?:^|[^a-zA-Z])(?:CN|China|Mainland|回国|国内|北京|上海|广州|深圳|杭州|南京|武汉|成都|重庆|天津|西安|苏州|郑州|长沙|沈阳|青岛|济南|大连|厦门|福州|合肥)(?:[^a-zA-Z]|$)/i

function isInfoNode(name) {
  if (typeof name !== 'string') return false
  return INFO_REGEX.test(name)
}

function isCnNode(name) {
  if (typeof name !== 'string') return false
  return CN_NODE_REGEX.test(name)
}

function applyLiteDns(config) {
  if (!config.dns || typeof config.dns !== 'object') config.dns = {}
  var base = LITE_DNS_CONFIG
  for (var key in base) {
    if (base[key] !== undefined) config.dns[key] = base[key]
  }

  var domesticPlain = ['223.5.5.5', '223.6.6.6', '119.29.29.29']
  var domesticDoH = ['https://dns.alidns.com/dns-query']
  var foreignDoH = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query']

  config.dns['use-hosts'] = true
  config.dns.nameserver = ['223.5.5.5'].concat(domesticDoH)
  config.dns['default-nameserver'] = domesticPlain.slice()
  config.dns['proxy-server-nameserver'] = ['223.5.5.5', '223.6.6.6'].concat(domesticDoH, foreignDoH)
  config.dns['direct-nameserver'] = domesticPlain.concat(domesticDoH)
  config.dns['direct-nameserver-follow-policy'] = false

  if (!config.dns['nameserver-policy'] || typeof config.dns['nameserver-policy'] !== 'object' || Array.isArray(config.dns['nameserver-policy'])) {
    config.dns['nameserver-policy'] = {}
  }

  // 国内域名与探针强制秒解
  config.dns['nameserver-policy']['geosite:cn'] = ['223.5.5.5'].concat(domesticDoH)
  config.dns['nameserver-policy']['+.msftconnecttest.com'] = ['223.5.5.5'].concat(domesticDoH)
  config.dns['nameserver-policy']['+.msftncsi.com'] = ['223.5.5.5'].concat(domesticDoH)

  // 海外指定域名强制走海外 DoH 防污染
  LITE_FOREIGN_DNS_DOMAINS.forEach(function(host) {
    config.dns['nameserver-policy'][host] = foreignDoH.slice()
  })
}

function applyLiteTun(config) {
  if (!config.tun || typeof config.tun !== 'object') config.tun = {}
  config.tun.enable = true
  config.tun['auto-route'] = true
  config.tun['strict-route'] = false
  config.tun['auto-detect-interface'] = true

  var exclude = [
    'GCUService.exe',
    'GCUBridge.exe',
    'GSCService.exe',
    'gsupservice.exe',
    'gchsvc.exe',
  ]
  var userExclude = LITE_TUN_EXCLUDE_PROCESSES || []
  var excludeSet = new Set(exclude.map(function(s) { return s.toLowerCase() }))
  userExclude.forEach(function(proc) {
    if (!excludeSet.has(proc.toLowerCase())) {
      exclude.push(proc)
      excludeSet.add(proc.toLowerCase())
    }
  })
  config.tun['exclude-process'] = exclude
}

function main(config) {
  if (!config || typeof config !== 'object') return config
  if (!Array.isArray(config.proxies) || config.proxies.length === 0) return config

  // 1. 节点分类：分离有效国外代理与国内回国节点，剔除流量说明节点
  var foreignNodes = []
  var cnNodes = []

  for (var i = 0; i < config.proxies.length; i++) {
    var p = config.proxies[i]
    if (!p || typeof p !== 'object' || !p.name) continue
    var pType = String(p.type || '').toLowerCase()
    if (pType === 'direct' || pType === 'reject') continue
    var name = String(p.name)
    if (isInfoNode(name)) continue

    if (isCnNode(name)) {
      cnNodes.push(name)
    } else {
      foreignNodes.push(name)
    }
  }

  // 2. 策略组极简双组：仅「🌐 国外节点」与「🇨🇳 国内节点」
  var foreignGroup = {
    name: '🌐 国外节点',
    type: 'select',
    proxies: foreignNodes.length > 0 ? foreignNodes : ['REJECT'],
  }

  var domesticGroup = {
    name: '🇨🇳 国内节点',
    type: 'select',
    proxies: ['DIRECT', '🌐 国外节点'].concat(cnNodes),
  }

  config['proxy-groups'] = [foreignGroup, domesticGroup]

  // 3. 规则集与提供商注入
  config['rule-providers'] = LITE_RULE_PROVIDERS
  config.rules = LITE_RULES

  // 4. DNS、TUN、混合端口与运行配置
  applyLiteDns(config)
  applyLiteTun(config)

  if (!config.profile || typeof config.profile !== 'object') config.profile = {}
  config.profile['store-selected'] = false
  config.profile['store-fake-ip'] = true

  config.listeners = [
    { name: 'MIXED-PROXY', type: 'mixed', port: 50000, proxy: '🌐 国外节点' },
    { name: 'MIXED-DIRECT', type: 'mixed', port: 10086, proxy: 'DIRECT' },
  ]

  console.log('[Lite-Override] Loaded successfully: 2 proxy groups (' + foreignNodes.length + ' foreign proxies, ' + domesticGroup.proxies.length + ' domestic options), ' + config.rules.length + ' rules, ' + Object.keys(config['rule-providers']).length + ' rule-providers')
  return config
}
`

  await writeFile(DIST_PATH, content, 'utf8')
  console.log(`Generated dist/Lite-Override.js (${finalRules.length} rules, ${Object.keys(ruleProviders).length} providers)`)
}

if (process.argv[1] && process.argv[1].endsWith('build.mjs')) {
  buildLiteOverride().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
