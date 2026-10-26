import vm from 'node:vm'
import { isIP } from 'node:net'

export function fixtureConfig() {
  return {
    proxies: ['🇭🇰 香港 01', 'US01', 'JP01 | Tokyo IPLC', 'Japan02 | Premium', '🇯🇵 Osaka03',
      '🇨🇳 国内中转-上海电信', 'JPX 01', '🇨🇦 Canada 01', '剩余流量 888GB'].map((name, i) => ({
      name, type: 'ss', server: `198.51.100.${i + 1}`, port: 443,
      cipher: 'aes-128-gcm', password: 'test',
    })),
  }
}

export function runOverride(code, config) {
  return JSON.parse(JSON.stringify(vm.runInNewContext(code + '\n;main(__config)', {
    __config: structuredClone(config), console: { log() {}, error() {} },
  }, { timeout: 5000 })))
}

// A small evaluator for regression scenarios, not a replacement for core tests.
// Unknown remote sets are deliberately unmatched; fixtures supply any relevant
// IP/domain sets so priority tests cannot accidentally rely on live network data.
function split(value) {
  let depth = 0, start = 0
  const result = []
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++
    else if (value[i] === ')') depth--
    else if (value[i] === ',' && depth === 0) { result.push(value.slice(start, i)); start = i + 1 }
  }
  result.push(value.slice(start))
  return result
}

function ipv4Cidr(ip, cidr) {
  if (isIP(ip) !== 4) return false
  const [network, bits] = cidr.split('/')
  const number = value => value.split('.').reduce((n, part) => (n * 256 + Number(part)) >>> 0, 0)
  const mask = Number(bits) === 0 ? 0 : (0xffffffff << (32 - Number(bits))) >>> 0
  return ((number(ip) & mask) >>> 0) === ((number(network) & mask) >>> 0)
}

export function matchesDomain(pattern, host) {
  return pattern.startsWith('+.') ? host === pattern.slice(2) || host.endsWith('.' + pattern.slice(2)) : host === pattern
}

export function matches(rule, connection, providers) {
  const [type, payload] = split(rule)
  const host = connection.host || ''
  switch (type) {
    case 'MATCH': return true
    case 'NETWORK': return connection.network === payload
    case 'DST-PORT': return String(connection.port) === payload
    case 'DOMAIN': return host === payload
    case 'DOMAIN-SUFFIX': return host === payload || host.endsWith('.' + payload)
    case 'DOMAIN-KEYWORD': return host.includes(payload)
    case 'DOMAIN-REGEX': return new RegExp(payload).test(host)
    case 'PROCESS-NAME': return (connection.process || '').toLowerCase() === payload.toLowerCase()
    case 'PROCESS-NAME-REGEX': return new RegExp(payload.replace(/^\(\?i\)/, ''), 'i').test(connection.process || '')
    case 'IP-CIDR': return ipv4Cidr(connection.ip || '', payload)
    case 'GEOIP': return payload === 'PRIVATE' && ['10.0.0.0/8', '127.0.0.0/8', '169.254.0.0/16', '172.16.0.0/12', '192.168.0.0/16']
      .some(cidr => ipv4Cidr(connection.ip || '', cidr))
    case 'RULE-SET': {
      const provider = providers[payload]
      if (!provider?.payload) return false
      return provider.payload.some(item => provider.behavior === 'domain' ? matchesDomain(item, host) : matches(item, connection, providers))
    }
    case 'AND': case 'OR': case 'NOT': {
      const children = split(payload.slice(1, -1)).map(child => matches(child.slice(1, -1), connection, providers))
      return type === 'AND' ? children.every(Boolean) : type === 'OR' ? children.some(Boolean) : !children[0]
    }
    default: return false
  }
}

export function route(config, connection, extraProviders = {}) {
  const rule = config.rules.find(rule => matches(rule, connection, { ...config['rule-providers'], ...extraProviders }))
  const parts = split(rule)
  return parts.at(-1) === 'no-resolve' ? parts.at(-2) : parts.at(-1)
}
