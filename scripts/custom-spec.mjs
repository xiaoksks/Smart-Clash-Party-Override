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
  return [
    ...spec.webRtcBrowserProcesses.map(process => `AND,((PROCESS-NAME,${process}),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT`),
    // Preserve TCP/UDP STUN/TURN blocking for non-CN destinations in all apps.
    ...spec.webRtcPorts.map(port => `AND,((DST-PORT,${port}),(NOT,((GEOSITE,cn)))),REJECT`),
    'AND,((DOMAIN-KEYWORD,stun),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT',
    ...((spec.webRtcDomains || []).map(domain => `AND,((DOMAIN-SUFFIX,${domain}),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT`)),
  ]
}

export function buildRuleSetOverrideRules(spec) {
  return Object.entries(spec.ruleSetTargetOverrides).map(([name, target]) => `RULE-SET,local-${name},${target}`)
}

export function buildChinaIpDirectRules(enabled) {
  return enabled
    ? ['RULE-SET,scki-fused-075-cn-site-ipcidr-no-resolve,DIRECT,no-resolve']
    : []
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
  const ruleSetTargetOverrides = normalizeStringMap(spec.ruleSetTargetOverrides, 'ruleSetTargetOverrides')
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
    webRtcBrowserProcesses: Array.from(spec.webRtcBrowserProcesses),
    webRtcPorts: Array.from(spec.webRtcPorts),
    webRtcDomains: cleanWebRtcDomains,
    japanBlockedDomains: cleanJapanBlockedDomains,
    ruleSetTargetOverrides,
    preRules: Array.from(spec.preRules),
    foreignDnsDomains: Array.from(spec.foreignDnsDomains),
  }
}
