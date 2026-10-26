import { buildWebRtcProtectionRules } from './custom-spec.mjs'

export const FOREIGN = '🌐 国外节点'
export const DOMESTIC = '🇨🇳 国内节点'
export const NON_JP = '🚫 日本禁用'
const THUNDER = /^(thunder(?:\.exe)?|thunderplatform\.exe|downloadservice\.exe|xlserviceplatform\.exe|xllite\.exe|downloadsdkserver\.exe)$/i

export function targetOf(rule) {
  const parts = rule.split(',')
  return parts.at(-1) === 'no-resolve' ? parts.at(-2) : parts.at(-1)
}

function normalize(rule, preserveThunder = false) {
  const parts = rule.split(',')
  const index = parts.at(-1) === 'no-resolve' ? parts.length - 2 : parts.length - 1
  const target = parts[index]
  if (preserveThunder && parts[0] === 'PROCESS-NAME' && THUNDER.test(parts[1]) && target === 'DIRECT') return rule
  if (['DIRECT', DOMESTIC, '🇨🇳 常用网站', '📺 国内媒体', '🕹️ 国内游戏', '🏠 国内网站', '📺 国内流媒体'].includes(target)) parts[index] = DOMESTIC
  else if ([NON_JP, '日本禁用', '🚫 非日节点', '非日节点'].includes(target)) parts[index] = NON_JP
  else if (!['REJECT', 'REJECT-DROP', 'PASS'].includes(target)) parts[index] = FOREIGN
  return parts.join(',')
}

function noResolve(rule) {
  return /^(GEOIP|IP-ASN|IP-CIDR|IP-CIDR6),/.test(rule) && !rule.endsWith(',no-resolve') ? rule + ',no-resolve' : rule
}

export function compileOverride({ spec, base, snapshot, catalog, runtime }) {
  const providers = structuredClone(base.ruleProviders)
  // Immutable URLs and classical payloads are validated/updated as one snapshot.
  for (const [name, provider] of Object.entries(providers)) {
    const locked = snapshot.files[name]
    if (!locked) throw new Error(`Missing upstream lock: ${name}`)
    if (provider.behavior === 'classical') {
      if (!Array.isArray(locked.payload)) throw new Error(`Missing classical payload: ${name}`)
      providers[name] = { type: 'inline', behavior: 'classical', format: 'yaml', payload: [...new Set(locked.payload.map(noResolve))] }
    } else {
      provider.url = locked.url
      // Keep unchanged files cached when the upstream commit advances.
      provider.path = `./ruleset/lite/${name}-${locked.sha256.slice(0, 12)}.mrs`
      provider.interval = 604800
      provider.proxy = FOREIGN
    }
  }
  const aiDomains = [...new Set([...snapshot.aiDomains, ...catalog.services.flatMap(s => s.domains), ...spec.foreignDnsDomains])].sort()
  providers['lite-ai'] = { type: 'inline', behavior: 'domain', format: 'yaml', payload: aiDomains }
  providers['lite-non-jp'] = { type: 'inline', behavior: 'domain', format: 'yaml', payload: spec.japanBlockedDomains.map(d => '+.' + d) }
  const subsumedDomainRules = new Set()
  function retainDomainRule(rule) {
    const parts = rule.split(',')
    if (targetOf(rule) !== FOREIGN || !['DOMAIN', 'DOMAIN-SUFFIX'].includes(parts[0])) return true
    const covered = aiDomains.some(pattern => {
      if (pattern.startsWith('+.')) return parts[1] === pattern.slice(2) || parts[1].endsWith('.' + pattern.slice(2))
      return parts[0] === 'DOMAIN' && parts[1] === pattern
    })
    if (covered) subsumedDomainRules.add(rule)
    return !covered
  }

  const directPreRules = spec.preRules.filter(r => ['DIRECT', DOMESTIC].includes(targetOf(r))).map(r => normalize(r, true))
  const foreignPreRules = spec.preRules.filter(r => !['DIRECT', DOMESTIC].includes(targetOf(r))).map(r => normalize(r)).filter(retainDomainRule)
  const aiProcesses = [...new Set(catalog.services.flatMap(s => s.processes || []))]
  const privacy = buildWebRtcProtectionRules({ ...spec, aiProcesses })
  const localRules = Object.entries(spec.ruleSetTargetOverrides).map(([name, target]) => {
    if (!providers[`local-${name}`]) throw new Error(`Missing rule-set override provider: local-${name}`)
    return `RULE-SET,local-${name},${target}`
  })
  const chinaIp = spec.forceChinaIpDirect ? ['RULE-SET,scki-fused-075-cn-site-ipcidr-no-resolve,DIRECT,no-resolve'] : []
  const processRules = aiProcesses.length ? [`PROCESS-NAME-REGEX,(?i)^(?:${aiProcesses.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$,${FOREIGN}`] : []
  // Keep literal DIRECT targets and emit before all privacy/domain/IP rules.
  // Normalizing these app overrides would make Dota depend on domestic selection.
  const appRules = Object.entries(spec.processTargetOverrides || {}).map(([name, target]) => `PROCESS-NAME,${name},${target}`)
  const priority = [
    ...appRules,
    ...privacy,
    `RULE-SET,lite-ai,${FOREIGN}`,
    ...processRules,
    `RULE-SET,lite-non-jp,${NON_JP}`,
    ...localRules,
    ...directPreRules,
    ...foreignPreRules,
    // WebRTC TCP/TURN may dial public IPs without a hostname. Do not let those
    // unknown clients fall through to mainland-IP DIRECT in strict mode. Keep
    // LAN access and explicit user process overrides such as Thunder intact.
    ...(spec.preventWebRtcLeak && spec.webRtcMode === 'strict'
      ? [`AND,((NETWORK,TCP),(DOMAIN-REGEX,^$),(NOT,((GEOIP,PRIVATE,no-resolve)))),${FOREIGN}`] : []),
    ...chinaIp,
  ]
  // Remove legacy QUIC rules: privacy mode is the sole owner of UDP blocking.
  const baseline = base.baselineRules.filter(r => !r.startsWith('MATCH,') &&
    !(r.includes('(DST-PORT,443)') && r.includes('(NETWORK,UDP)'))).map(r => {
    const normalized = normalize(r)
    const parts = normalized.split(',')
    return parts[0] === 'RULE-SET' && providers[parts[1]]?.behavior === 'ipcidr' && !normalized.endsWith(',no-resolve')
      ? normalized + ',no-resolve' : normalized
  }).filter(retainDomainRule)
  const unique = [...new Set([...priority, ...baseline])]
  let trimmed = 0
  while (unique.length && targetOf(unique.at(-1)) === FOREIGN) { unique.pop(); trimmed++ }

  // Merge classical matchers only inside consecutive runs with the SAME target.
  // There are no intervening exceptions; domain/IP MRS files remain compressed.
  let merged = 0
  const rules = []
  for (let i = 0; i < unique.length;) {
    if (!unique[i].startsWith('RULE-SET,')) { rules.push(unique[i++]); continue }
    const target = targetOf(unique[i])
    const run = []
    while (i < unique.length && unique[i].startsWith('RULE-SET,') && targetOf(unique[i]) === target) run.push(unique[i++])
    const classical = run.filter(r => providers[r.split(',')[1]]?.behavior === 'classical')
    if (classical.length < 2) { rules.push(...run); continue }
    const name = `lite-classical-${++merged}`
    providers[name] = { type: 'inline', behavior: 'classical', format: 'yaml', payload: [...new Set(classical.flatMap(r => providers[r.split(',')[1]].payload))] }
    rules.push(...run.filter(r => !classical.includes(r)), `RULE-SET,${name},${target}`)
  }
  rules.push(`MATCH,${FOREIGN}`)

  // Reuse ordered route classifications for DNS. IP-only rules never enter DNS.
  const dnsPolicy = []
  const seenDnsProviders = new Set()
  for (const rule of rules) {
    if (!rule.startsWith('RULE-SET,')) continue
    const name = rule.split(',')[1]
    const provider = providers[name]
    if (seenDnsProviders.has(name) || provider.behavior === 'ipcidr') continue
    if (provider.behavior === 'classical' && !provider.payload.some(r => /^DOMAIN(?:-SUFFIX|-KEYWORD|-REGEX|-WILDCARD)?,/.test(r))) continue
    seenDnsProviders.add(name)
    dnsPolicy.push({ name, domestic: ['DIRECT', DOMESTIC].includes(targetOf(rule)) })
  }
  const used = new Set(rules.filter(r => r.startsWith('RULE-SET,')).map(r => r.split(',')[1]))
  dnsPolicy.forEach(p => used.add(p.name))
  const finalProviders = Object.fromEntries(Object.entries(providers).filter(([name]) => used.has(name)))
  const removedProviders = Object.keys(base.ruleProviders).filter(name => !used.has(name))
  const options = { ...spec, aiProcesses }
  // Pre-name Smart groups so Party does not rename them after DNS #group
  // references have been generated. Its converter only updates selected fields.
  const foreignGroupName = spec.foreignSelection === 'party-smart' ? FOREIGN + ' (Smart Group)' : FOREIGN
  const outputRules = rules.map(rule => rule.replace(/,🌐 国外节点(?=,no-resolve$|$)/, ',' + foreignGroupName))
  for (const p of Object.values(finalProviders)) if (p.proxy === FOREIGN) p.proxy = foreignGroupName
  const data = { LITE_FOREIGN_GROUP: foreignGroupName, LITE_RULES: outputRules, LITE_RULE_PROVIDERS: finalProviders, LITE_DNS_CONFIG: base.dns, LITE_DNS_POLICY: dnsPolicy, LITE_OPTIONS: options }
  const code = '// Generated by npm run build. Edit custom-overrides.js / scripts instead.\n' +
    Object.entries(data).map(([name, value]) => `const ${name} = ${JSON.stringify(value, null, 2)}\n`).join('\n') + '\n' + runtime
  const report = {
    rules: rules.length, providers: Object.keys(finalProviders).length,
    providerFormats: Object.values(finalProviders).reduce((counts, p) => { const k = p.type === 'inline' ? 'inline' : p.format; counts[k] = (counts[k] || 0) + 1; return counts }, {}),
    aiServices: catalog.services.length, aiDomains: aiDomains.length, aiProcesses: aiProcesses.length,
    webRtcMode: spec.preventWebRtcLeak ? spec.webRtcMode : 'off', foreignSelection: spec.foreignSelection, foreignGroupName,
    trimmedTailRules: trimmed, mergedClassicalRuns: merged, subsumedDomainRules: subsumedDomainRules.size, removedProviders,
    dnsProviderPolicies: dnsPolicy.length, revisions: snapshot.revisions,
  }
  return { code, report, rules: outputRules, providers: finalProviders, dnsPolicy }
}
