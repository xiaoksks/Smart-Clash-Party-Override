import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { loadCustomSpec, ROOT } from './custom-spec.mjs'
import { fetchRoutingGraph } from './upstream-source.mjs'

const SNAPSHOT_PATH = path.join(ROOT, '.build', 'routing-graph.js')

async function readGraphSource() {
  try {
    return await readFile(SNAPSHOT_PATH, 'utf8')
  } catch {
    return (await fetchRoutingGraph()).body
  }
}

function evaluateRoutingGraph(source) {
  const module = { exports: {} }
  const sandbox = { module, exports: module.exports, process: { env: {} }, console: { log() {} } }
  vm.runInNewContext(source, sandbox, { filename: SNAPSHOT_PATH, timeout: 5000 })
  if (typeof module.exports.getRawRoutingGraph !== 'function') {
    throw new Error('Routing graph does not export getRawRoutingGraph()')
  }
  return module.exports.getRawRoutingGraph()
}

function findCoveredCustomRules(rules) {
  const parsed = rules.map((rule, index) => {
    const [type, domain, policy] = rule.split(',')
    return { index, rule, type, domain, policy }
  })
  const covered = []
  for (const candidate of parsed) {
    for (const parent of parsed) {
      if (candidate.index === parent.index || candidate.policy !== parent.policy || parent.type !== 'DOMAIN-SUFFIX') continue
      if (candidate.domain === parent.domain || candidate.domain.endsWith(`.${parent.domain}`)) {
        covered.push({ candidate: candidate.rule, parent: parent.rule })
        break
      }
    }
  }
  return covered
}

function ruleTarget(rule) {
  const parts = String(rule).split(',')
  return parts[parts.length - 1] === 'no-resolve' ? parts[parts.length - 2] : parts[parts.length - 1]
}

function assertRuleSetTargetOverrides(graph, overrides) {
  const upstreamRules = Array.from(graph.rules || [])
  const providers = graph['rule-providers'] || {}
  for (const [name, target] of Object.entries(overrides)) {
    if (!providers[name]) {
      throw new Error(`Upstream rule provider is missing: ${name}`)
    }
    const matches = upstreamRules.filter(rule => {
      const parts = String(rule).split(',')
      return parts[0] === 'RULE-SET' && parts[1] === name
    })
    if (matches.length !== 1) {
      throw new Error(`Expected exactly one upstream RULE-SET for ${name}, found ${matches.length}`)
    }
    if (ruleTarget(matches[0]) === target) {
      throw new Error(`Redundant rule-set target override: ${name} already targets ${target}`)
    }
  }
}

async function main() {
  const [spec, graphSource] = await Promise.all([loadCustomSpec(), readGraphSource()])
  const graph = evaluateRoutingGraph(graphSource)
  const upstreamRules = Array.from(graph.rules || [])
  const upstreamSet = new Set(upstreamRules)
  const exactMatches = spec.preRules.filter(rule => upstreamSet.has(rule))
  const covered = findCoveredCustomRules(spec.preRules)
  assertRuleSetTargetOverrides(graph, spec.ruleSetTargetOverrides)

  if (exactMatches.length) {
    throw new Error(`Custom rules already provided by upstream:\n${exactMatches.join('\n')}`)
  }

  if (covered.length) {
    throw new Error(`Redundant custom rules detected:\n${covered.map(item => `${item.candidate}\n  covered by ${item.parent}`).join('\n')}`)
  }

  console.log(`Routing graph ${graph.version}: ${upstreamRules.length} inline rules`)
  console.log(`Custom rules: ${spec.preRules.length}; exact upstream duplicates: 0`)
  console.log(`Rule-set target overrides: ${Object.keys(spec.ruleSetTargetOverrides).length}`)
  console.log('Upstream graph audit passed (provider payload contents are intentionally outside this text-level audit)')
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
