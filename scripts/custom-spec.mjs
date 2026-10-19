import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'

export const ROOT = process.cwd()
export const CUSTOM_SPEC_PATH = path.join(ROOT, 'custom-overrides.js')
const PORT_PATTERN = /^\d{1,5}$/

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
  return [
    ...spec.webRtcBrowserProcesses.map(process => `AND,((PROCESS-NAME,${process}),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT`),
    ...spec.webRtcPorts.map(port => `DST-PORT,${port},REJECT`),
    'AND,((DOMAIN-KEYWORD,stun),(NETWORK,UDP)),REJECT',
    ...((spec.webRtcDomains || []).map(domain => `AND,((DOMAIN-SUFFIX,${domain}),(NETWORK,UDP)),REJECT`)),
  ]
}

export function buildRuleSetOverrideRules(spec) {
  return Object.entries(spec.ruleSetTargetOverrides).map(([name, target]) => `RULE-SET,local-${name},${target}`)
}

export function buildJapanBlockedRules(spec) {
  return (spec.japanBlockedDomains || []).map(domain => `DOMAIN-SUFFIX,${domain},🚫 日本禁用`)
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
  if (typeof spec.removeAdBlocking !== 'boolean') {
    throw new Error('removeAdBlocking must be a boolean')
  }
  if (typeof spec.forceChinaIpDirect !== 'boolean') {
    throw new Error('forceChinaIpDirect must be a boolean')
  }
  if (typeof spec.preventWebRtcLeak !== 'boolean') {
    throw new Error('preventWebRtcLeak must be a boolean')
  }
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
  const tunExcludeProcesses = Array.isArray(spec.tunExcludeProcesses) ? spec.tunExcludeProcesses : []
  assertUniqueStrings(tunExcludeProcesses, 'tunExcludeProcesses')
  const browserSet = new Set(spec.webRtcBrowserProcesses.map(p => String(p).toLowerCase()))
  for (const proc of tunExcludeProcesses) {
    if (browserSet.has(proc.toLowerCase())) {
      throw new Error(`tunExcludeProcesses entry "${proc}" cannot be a browser process (breaks WebRTC leak protection)`)
    }
  }
  const ruleSetTargetOverrides = normalizeStringMap(spec.ruleSetTargetOverrides, 'ruleSetTargetOverrides')
  validatePreRules(spec.preRules)
  assertUniqueStrings(spec.foreignDnsDomains, 'foreignDnsDomains')
  return {
    removeAdBlocking: spec.removeAdBlocking,
    forceChinaIpDirect: spec.forceChinaIpDirect,
    preventWebRtcLeak: spec.preventWebRtcLeak,
    webRtcBrowserProcesses: Array.from(spec.webRtcBrowserProcesses),
    webRtcPorts: Array.from(spec.webRtcPorts),
    webRtcDomains: cleanWebRtcDomains,
    japanBlockedDomains: cleanJapanBlockedDomains,
    tunExcludeProcesses: Array.from(tunExcludeProcesses),
    ruleSetTargetOverrides,
    preRules: Array.from(spec.preRules),
    foreignDnsDomains: Array.from(spec.foreignDnsDomains),
  }
}
