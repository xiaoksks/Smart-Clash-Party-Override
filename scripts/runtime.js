// Concatenated after generated LITE_* constants. No network or Node APIs at runtime.
var INFO_REGEX = /流量|到期|过期|重置|官网|通知|订阅|套餐|客服|QQ群|TG频道|网址|剩余|官方/i
var CN_NODE_REGEX = /中国(?:电信|联通|移动|铁通|中转|专线)|(?:^|[^a-zA-Z])(?:CN|China|Mainland|回国|国内|北京|上海|广州|深圳|杭州|南京|武汉|成都|重庆|天津|西安|苏州|郑州|长沙|沈阳|青岛|济南|大连|厦门|福州|合肥)(?:[^a-zA-Z]|$)/i
var JP_NODE_REGEX = /(?:^|[^a-zA-Z])(?:JP|JPN|Japan|Tokyo|Osaka|Nagoya|Fukuoka|Yokohama|Saitama|Chiba|Hokkaido|Okinawa|Kyoto|Kobe)\d*(?:[^a-zA-Z]|$)|日本|东京|大阪|名古屋|福冈|横滨|埼玉|千叶|北海道|冲绳|京都|神户|🇯🇵/i
var FOREIGN_KEYWORD_REGEX = /(?:^|[^a-zA-Z])(?:HK|HongKong|TW|Taiwan|JP|Japan|SG|Singapore|US|USA|KR|Korea|UK)(?:[^a-zA-Z]|$)|香港|台湾|日本|新加坡|美国|韩国|英国|德国|法国|🇭🇰|🇹🇼|🇯🇵|🇸🇬|🇺🇸|🇰🇷|🇬🇧|🇩🇪|🇫🇷/i

function liteClone(value) { return JSON.parse(JSON.stringify(value)) }
function liteObject(value) { return value && typeof value === 'object' && !Array.isArray(value) }
function isCnNode(name) { return !FOREIGN_KEYWORD_REGEX.test(name) && CN_NODE_REGEX.test(name) }
function isJpNode(name) { return JP_NODE_REGEX.test(name) }

function applyLiteDns(config) {
  var previous = liteObject(config.dns) ? config.dns : {}
  var domestic = ['223.5.5.5', '223.6.6.6']
  // Force encrypted overseas DNS through the SAME selected foreign exit. These
  // explicit routes cannot accidentally follow a mainland CDN IP direct rule.
  var foreign = [
    'https://cloudflare-dns.com/dns-query#' + LITE_FOREIGN_GROUP,
    'https://dns.google/dns-query#' + LITE_FOREIGN_GROUP,
  ]
  var nonJpDns = ['https://cloudflare-dns.com/dns-query#🚫 日本禁用', 'https://dns.google/dns-query#🚫 日本禁用']
  var policy = {}
  var explicit = {}
  // Preserve user/corporate policies while reserved AI routes always take priority.
  var previousPolicy = liteObject(previous['nameserver-policy']) ? previous['nameserver-policy'] : {}
  policy['rule-set:lite-ai'] = foreign.slice()
  policy['rule-set:lite-non-jp'] = nonJpDns
  Object.keys(previousPolicy).forEach(function(key) {
    // Rebuild our entries in deterministic order on every invocation.
    if (key.indexOf('rule-set:lite-') !== 0 && !LITE_DNS_POLICY.some(function(p) { return key === 'rule-set:' + p.name })) {
      explicit[key] = liteClone(previousPolicy[key])
    }
  })
  LITE_OPTIONS.preRules.forEach(function(rule) {
    var parts = rule.split(',')
    if (parts[0] !== 'DOMAIN' && parts[0] !== 'DOMAIN-SUFFIX') return
    var host = (parts[0] === 'DOMAIN-SUFFIX' ? '+.' : '') + parts[1]
    // Existing user policies for an exact host remain authoritative.
    if (Object.prototype.hasOwnProperty.call(previousPolicy, host)) return
    explicit[host] = ['DIRECT', '🇨🇳 国内节点'].indexOf(parts[parts.length - 1]) >= 0 ? domestic.slice() : foreign.slice()
  })
  LITE_OPTIONS.foreignDnsDomains.forEach(function(host) { explicit[host] = foreign.slice() })
  // An inherited exact-host policy must not outrank AI's rule-set/suffix policy.
  var aiPatterns = LITE_RULE_PROVIDERS['lite-ai'].payload
  Object.keys(explicit).forEach(function(key) {
    var host = key.replace(/^[+*]\./, '')
    if (aiPatterns.some(function(pattern) {
      var domain = pattern.replace(/^\+\./, '')
      return host === domain || (pattern.indexOf('+.') === 0 && host.slice(-domain.length - 1) === '.' + domain)
    })) explicit[key] = foreign.slice()
  })
  aiPatterns.forEach(function(pattern) { explicit[pattern] = foreign.slice() })
  // Stable placement avoids moving generated literal policies on repeat runs.
  Object.keys(explicit).sort().forEach(function(key) { policy[key] = explicit[key] })
  LITE_DNS_POLICY.forEach(function(entry) {
    var key = 'rule-set:' + entry.name
    if (!Object.prototype.hasOwnProperty.call(policy, key)) policy[key] = entry.domestic ? domestic.slice() : foreign.slice()
  })
  // Explicitly listed overseas endpoints are never sent to a domestic resolver,
  // including endpoints resolving to CN CDN addresses.
  var dns = Object.assign({}, previous, liteClone(LITE_DNS_CONFIG))
  dns.nameserver = foreign.slice()
  dns['default-nameserver'] = domestic.slice()
  dns['proxy-server-nameserver'] = domestic.slice()
  dns['direct-nameserver'] = domestic.slice()
  dns['direct-nameserver-follow-policy'] = false
  dns['nameserver-policy'] = policy
  dns['use-hosts'] = true
  dns.ipv6 = false
  dns['prefer-h3'] = false
  // All unknown domains use proxied DoH, so fallback racing/geodata is unnecessary.
  delete dns.fallback
  delete dns['fallback-filter']
  // Only genuine protocol exceptions receive real IPs. Do not broadly exempt
  // AI, Docker, Bing or remote-access sites from fake-IP domain attribution.
  dns['fake-ip-filter-mode'] = 'rule'
  dns['fake-ip-filter'] = [
    'RULE-SET,lite-ai,fake-ip',
    'DOMAIN-SUFFIX,lan,real-ip',
    'DOMAIN-SUFFIX,local,real-ip',
    'DOMAIN-SUFFIX,localdomain,real-ip',
    'DOMAIN-SUFFIX,home.arpa,real-ip',
    'DOMAIN,localhost,real-ip',
    'DOMAIN,localhost.ptlogin2.qq.com,real-ip',
    'DOMAIN,localhost.sec.qq.com,real-ip',
    'DOMAIN,localhost.work.weixin.qq.com,real-ip',
    'DOMAIN-SUFFIX,in-addr.arpa,real-ip',
    'DOMAIN-SUFFIX,ip6.arpa,real-ip',
    'DOMAIN-SUFFIX,msftconnecttest.com,real-ip',
    'DOMAIN-SUFFIX,msftncsi.com,real-ip',
    'MATCH,fake-ip',
  ]
  config.dns = dns
}

function main(config) {
  if (!liteObject(config)) return config
  var nodes = Array.isArray(config.proxies) ? config.proxies : []
  var providerNames = liteObject(config['proxy-providers']) ? Object.keys(config['proxy-providers']) : []
  if (!nodes.length && !providerNames.length) return config
  var foreignNodes = [], nonJpNodes = [], cnNodes = []
  var seen = Object.create(null)
  nodes.forEach(function(p) {
    if (!liteObject(p) || !p.name || /^(direct|reject)$/i.test(p.type || '')) return
    var name = String(p.name)
    if (INFO_REGEX.test(name) || seen[name]) return
    seen[name] = true
    if (isCnNode(name)) cnNodes.push(name)
    else { foreignNodes.push(name); if (!isJpNode(name)) nonJpNodes.push(name) }
  })
  // regexp2 supports lookahead. Provider filtering follows the same CN/JP logic
  // as static nodes; unknown countries are retained and flags are recognized.
  var cnOnly = '^(?!.*(?:' + FOREIGN_KEYWORD_REGEX.source + ')).*(?:' + CN_NODE_REGEX.source + ')'
  var excludeCn = '(?i)(?:' + INFO_REGEX.source + ')|(?:' + cnOnly + ')'
  var foreignGroup = {
    name: LITE_FOREIGN_GROUP, type: 'select', proxies: foreignNodes.slice(),
    'empty-fallback': 'REJECT',
  }
  var nonJpGroup = {
    name: '🚫 日本禁用', type: 'select', proxies: nonJpNodes.slice(),
    'empty-fallback': 'DIRECT',
  }
  var domesticGroup = { name: '🇨🇳 国内节点', type: 'select', proxies: ['DIRECT', LITE_FOREIGN_GROUP].concat(cnNodes) }
  if (providerNames.length) {
    foreignGroup.use = providerNames.slice()
    foreignGroup['exclude-filter'] = excludeCn
    foreignGroup['exclude-type'] = 'direct|reject'
    nonJpGroup.use = providerNames.slice()
    nonJpGroup['exclude-filter'] = excludeCn + '|(?:' + JP_NODE_REGEX.source + ')'
    nonJpGroup['exclude-type'] = 'direct|reject'
    domesticGroup.use = providerNames.slice()
    domesticGroup.filter = '(?i)' + cnOnly
    domesticGroup['exclude-filter'] = '(?i)' + INFO_REGEX.source
    domesticGroup['exclude-type'] = 'direct|reject'
  }
  if (!foreignNodes.length && !providerNames.length) foreignGroup.proxies = ['REJECT']
  if (nonJpNodes.length || !providerNames.length) nonJpGroup.proxies.push('DIRECT')
  if (LITE_OPTIONS.foreignSelection === 'party-smart') {
    foreignGroup.type = 'url-test'
    foreignGroup.url = 'https://www.gstatic.com/generate_204'
    foreignGroup.interval = 600
    foreignGroup.lazy = true
    foreignGroup.tolerance = 50
  }
  config['proxy-groups'] = [foreignGroup, nonJpGroup, domesticGroup]
  // Provider downloads cannot refer to old subscription groups that we replace,
  // or to the very provider-backed group they must populate during bootstrap.
  providerNames.forEach(function(name) {
    var provider = config['proxy-providers'][name]
    if (!liteObject(provider) || !provider.proxy || provider.proxy === 'DIRECT') return
    if (nodes.some(function(node) { return node && node.name === provider.proxy })) return
    provider.proxy = foreignNodes.length ? LITE_FOREIGN_GROUP : 'DIRECT'
  })
  config['rule-providers'] = liteClone(LITE_RULE_PROVIDERS)
  config.rules = LITE_RULES.slice()
  applyLiteDns(config)
  config.tun = Object.assign({}, liteObject(config.tun) ? config.tun : {}, {
    enable: true, 'auto-route': true, 'strict-route': true,
    'auto-detect-interface': true, 'dns-hijack': ['any:53', 'tcp://any:53'],
  })
  if (LITE_OPTIONS.preventWebRtcLeak && LITE_OPTIONS.webRtcMode === 'strict') {
    // A subscription's route exclusions would bypass every rule above.
    ;['route-exclude-address', 'route-exclude-address-set', 'route-address', 'route-address-set',
      'include-interface', 'exclude-interface', 'include-uid', 'exclude-uid',
      'include-uid-range', 'exclude-uid-range', 'include-android-user',
      'include-package', 'exclude-package'].forEach(function(key) { delete config.tun[key] })
  }
  config.ipv6 = false
  config['find-process-mode'] = 'strict'
  config.profile = Object.assign({}, liteObject(config.profile) ? config.profile : {}, {
    'store-selected': true, 'store-fake-ip': true,
  })
  // Keep user listeners but remove forced routing while protection is enabled.
  // Omit our old DIRECT port 10086 because it would bypass the rules.
  var listeners = Array.isArray(config.listeners) ? config.listeners.filter(function(l) {
    return l && l.name !== 'MIXED-PROXY' && l.name !== 'MIXED-DIRECT'
  }) : []
  if (LITE_OPTIONS.preventWebRtcLeak) listeners = listeners.map(function(listener) {
    var guarded = liteClone(listener)
    delete guarded.proxy
    return guarded
  })
  listeners.push({ name: 'MIXED-PROXY', type: 'mixed', port: 50000 })
  if (!LITE_OPTIONS.preventWebRtcLeak) listeners.push({ name: 'MIXED-DIRECT', type: 'mixed', port: 10086, proxy: 'DIRECT' })
  config.listeners = listeners
  console.log('[Lite-Override] ' + config.rules.length + ' rules; WebRTC=' +
    (LITE_OPTIONS.preventWebRtcLeak ? LITE_OPTIONS.webRtcMode : 'off') + '; selection=' + LITE_OPTIONS.foreignSelection)
  if (LITE_OPTIONS.foreignSelection === 'select') console.log('[Lite-Override] Party: disable built-in Smart override; use script-owned DNS (client DNS override OFF).')
  return config
}
