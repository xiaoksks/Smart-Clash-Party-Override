import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'

export const ROOT = process.cwd()
export const CUSTOM_SPEC_PATH = path.join(ROOT, 'custom-overrides.js')
const PORT_PATTERN = /^\d{1,5}$/
const RULE_SET_OVERRIDE_TARGETS = new Set([
  'DIRECT',
  'REJECT',
  'REJECT-DROP',
  'PASS',
  '🌐 国外节点',
  '🚫 日本禁用',
  '🇨🇳 国内节点',
])

const VALID_RULE_TYPES = new Set([
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'DOMAIN-REGEX',
  'GEOSITE',
  'IP-CIDR',
  'IP-CIDR6',
  'IP-SUFFIX',
  'IP-ASN',
  'GEOIP',
  'SRC-GEOIP',
  'SRC-IP-CIDR',
  'SRC-IP-SUFFIX',
  'SRC-IP-ASN',
  'DST-PORT',
  'SRC-PORT',
  'IN-PORT',
  'IN-TYPE',
  'IN-USER',
  'IN-NAME',
  'PROCESS-NAME',
  'PROCESS-PATH',
  'PROCESS-NAME-REGEX',
  'PROCESS-PATH-REGEX',
  'NETWORK',
  'DSCP',
  'RULE-SET',
  'AND',
  'OR',
  'NOT',
  'SUB-RULE',
  'MATCH',
])

function assertUniqueStrings(values, label) {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array`)
  const seen = new Set()
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} entries must be non-empty strings`)
    if (seen.has(value)) throw new Error(`Duplicate ${label} entry: ${value}`)
    seen.add(value)
  }
}

function validatePreRules(rules) {
  assertUniqueStrings(rules, 'preRules')
  for (const rule of rules) {
    const trimmed = rule.trim()
    if (trimmed !== rule) {
      throw new Error(`preRules entry contains leading or trailing whitespace: "${rule}"`)
    }
    const parts = rule.split(',')
    if (parts.some(part => !part.trim())) {
      throw new Error(`preRules entry contains empty segment: "${rule}"`)
    }
    const type = parts[0].toUpperCase()
    if (!VALID_RULE_TYPES.has(type)) {
      throw new Error(`preRules entry uses invalid or unsupported rule type "${parts[0]}": "${rule}"`)
    }
    if (type === 'MATCH') {
      if (parts.length !== 2) throw new Error(`MATCH rule must have exactly 2 segments: "${rule}"`)
      continue
    }
    if (parts.length < 3) {
      throw new Error(`preRules entry has too few segments (expected at least 3): "${rule}"`)
    }
    const last = parts[parts.length - 1]
    const target = last === 'no-resolve' ? parts[parts.length - 2] : last
    if (!target || !target.trim()) {
      throw new Error(`preRules entry has empty target: "${rule}"`)
    }
  }
}

function normalizeStringMap(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  const normalized = {}
  for (const [key, target] of Object.entries(value)) {
    if (!key.trim() || typeof target !== 'string' || !target.trim()) {
      throw new Error(`${label} entries must map non-empty names to non-empty targets`)
    }
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      throw new Error(`Invalid ${label} key: ${key}`)
    }
    normalized[key] = target
  }
  return normalized
}

export function buildWebRtcProtectionRules(spec) {
  if (!spec.preventWebRtcLeak) return []
  const ports = `OR,(${spec.webRtcPorts.map(p => `(DST-PORT,${p})`).join(',')}),REJECT`
  // Explicit app routes are emitted before these guards. All other clients have
  // no destination, process or CN exemptions in strict mode. Hijacked DNS is
  // handled by TUN first; remaining explicit DNS connections stay proxied.
  if (spec.webRtcMode === 'strict') return [
    'AND,((NETWORK,UDP),(DST-PORT,53)),🌐 国外节点',
    'NETWORK,UDP,REJECT',
    ports,
    'AND,((RULE-SET,lite-ai),(DOMAIN-KEYWORD,turn)),REJECT',
    'DOMAIN-KEYWORD,stun,REJECT',
    ...(spec.webRtcDomains || []).map(domain => `DOMAIN-SUFFIX,${domain},REJECT`),
  ]
  return [
    'AND,((NETWORK,UDP),(RULE-SET,lite-ai)),REJECT',
    `AND,((NETWORK,UDP),(PROCESS-NAME-REGEX,(?i)^(?:${[...new Set([...spec.webRtcBrowserProcesses, ...(spec.aiProcesses || [])])].map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$)),REJECT`,
    ports,
    'AND,((NETWORK,UDP),(DOMAIN-KEYWORD,stun)),REJECT',
    'AND,((NETWORK,UDP),(DOMAIN-KEYWORD,turn)),REJECT',
    ...(spec.webRtcDomains || []).map(domain => `AND,((NETWORK,UDP),(DOMAIN-SUFFIX,${domain})),REJECT`),
  ]
}

export async function loadCustomSpec() {
  const source = (await readFile(CUSTOM_SPEC_PATH, 'utf8')).replace(/^\uFEFF/, '')
  const spec = vm.runInNewContext(`${source}\n;CUSTOM_OVERRIDE_SPEC`, Object.create(null), {
    filename: CUSTOM_SPEC_PATH,
    timeout: 1000,
  })

  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new Error('CUSTOM_OVERRIDE_SPEC must be an object')
  }
  if (typeof spec.forceChinaIpDirect !== 'boolean') {
    throw new Error('forceChinaIpDirect must be a boolean')
  }
  if (typeof spec.preventWebRtcLeak !== 'boolean') {
    throw new Error('preventWebRtcLeak must be a boolean')
  }
  if (!['strict', 'compatible'].includes(spec.webRtcMode)) throw new Error('webRtcMode must be strict or compatible')
  if (!['select', 'party-smart'].includes(spec.foreignSelection)) throw new Error('foreignSelection must be select or party-smart')
  assertUniqueStrings(spec.webRtcBrowserProcesses, 'webRtcBrowserProcesses')
  assertUniqueStrings(spec.webRtcPorts, 'webRtcPorts')
  spec.webRtcPorts.forEach(port => {
    if (!PORT_PATTERN.test(port) || Number(port) < 1 || Number(port) > 65535) {
      throw new Error(`Invalid webRtcPorts entry: ${port}`)
    }
  })
  const webRtcDomains = Array.isArray(spec.webRtcDomains) ? spec.webRtcDomains : []
  assertUniqueStrings(webRtcDomains, 'webRtcDomains')
  const cleanWebRtcDomains = webRtcDomains.map(d =>
    d.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase().trim()
  )
  cleanWebRtcDomains.forEach(domain => {
    if (!domain || domain.includes(' ') || domain.includes(',')) {
      throw new Error(`Invalid webRtcDomains entry: ${domain}`)
    }
  })
  const japanBlockedDomains = Array.isArray(spec.japanBlockedDomains) ? spec.japanBlockedDomains : []
  assertUniqueStrings(japanBlockedDomains, 'japanBlockedDomains')
  const cleanJapanBlockedDomains = japanBlockedDomains.map(d =>
    d.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase().trim()
  )
  cleanJapanBlockedDomains.forEach(domain => {
    if (!domain || domain.includes(' ') || domain.includes(',')) {
      throw new Error(`Invalid japanBlockedDomains entry: ${domain}`)
    }
  })
  const ruleSetTargetOverrides = normalizeStringMap(spec.ruleSetTargetOverrides, 'ruleSetTargetOverrides')
  const processTargetOverrides = normalizeStringMap(spec.processTargetOverrides || {}, 'processTargetOverrides')
  for (const [name, target] of Object.entries(processTargetOverrides)) {
    if (name !== name.trim() || /[,\r\n/\\]/.test(name)) {
      throw new Error(`Invalid processTargetOverrides process name: ${name}`)
    }
    if (!['DIRECT', '🌐 国外节点'].includes(target)) {
      throw new Error(`Invalid processTargetOverrides target "${target}" for "${name}"`)
    }
  }
  for (const [name, target] of Object.entries(ruleSetTargetOverrides)) {
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(name)) {
      throw new Error(`Invalid ruleSetTargetOverrides name "${name}" (expected letters, digits, or hyphens)`)
    }
    if (!RULE_SET_OVERRIDE_TARGETS.has(target)) {
      throw new Error(`Invalid ruleSetTargetOverrides target "${target}" for "${name}"`)
    }
  }
  validatePreRules(spec.preRules)
  assertUniqueStrings(spec.foreignDnsDomains, 'foreignDnsDomains')
  return {
    forceChinaIpDirect: spec.forceChinaIpDirect,
    preventWebRtcLeak: spec.preventWebRtcLeak,
    webRtcMode: spec.webRtcMode,
    foreignSelection: spec.foreignSelection,
    webRtcBrowserProcesses: Array.from(spec.webRtcBrowserProcesses),
    webRtcPorts: Array.from(spec.webRtcPorts),
    webRtcDomains: cleanWebRtcDomains,
    japanBlockedDomains: cleanJapanBlockedDomains,
    ruleSetTargetOverrides,
    processTargetOverrides,
    preRules: Array.from(spec.preRules),
    foreignDnsDomains: Array.from(spec.foreignDnsDomains),
  }
}
