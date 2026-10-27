// These overlays contain reviewed service domains, not country-wide/public
// suffix catch-alls. The large existing CN fallback remains in its original place.
const PUBLIC_SCOPES = new Set(['cn', 'com', 'net', 'org', 'edu', 'gov', 'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn'])

export function parseDomainList(text) {
  const patterns = [...new Set(text.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')))].sort()
  if (patterns.some(pattern => !/^(?:\+\.)?[a-z0-9_.-]+$/i.test(pattern))) throw new Error('Unsupported domain list syntax')
  return patterns
}

export function domainCovered(pattern, host) {
  return pattern.startsWith('+.') ? host === pattern.slice(2) || host.endsWith('.' + pattern.slice(2)) : host === pattern
}

export function buildDomesticPolicy(definition, sources) {
  if (!definition || !sources) throw new Error('Missing mainland policy/snapshot; run npm run sync:upstream')
  const direct = [], services = []
  const add = (role, patterns) => {
    if (!['direct', 'services'].includes(role)) throw new Error(`Invalid mainland policy role: ${role}`)
    for (const pattern of patterns) {
      const host = pattern.replace(/^\+\./, '')
      if (!host.includes('.') || PUBLIC_SCOPES.has(host)) continue
      ;(role === 'direct' ? direct : services).push(pattern)
    }
  }
  for (const entry of definition.sources) {
    const source = sources[entry.category]
    if (!source || !Array.isArray(source.patterns) || !source.patterns.length) throw new Error(`Missing mainland source: ${entry.category}`)
    add(entry.role, source.patterns)
  }
  for (const entry of definition.services) add(entry.role, entry.domains)
  const foreignExceptions = [...new Set(definition.foreignExceptions)].sort()
  return {
    direct: [...new Set(direct)].sort(),
    services: [...new Set(services)].sort(),
    foreignExceptions,
  }
}
