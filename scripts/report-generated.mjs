import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT } from './custom-spec.mjs'

const report = JSON.parse(await readFile(path.join(ROOT, 'dist/build-report.json'), 'utf8'))
console.log(`Lite Override: 3 groups / ${report.rules} entry rules / ${report.providers} providers`)
console.log(`Remote MRS: ${report.providerFormats.mrs || 0}; inline sets: ${report.providerFormats.inline || 0}`)
console.log(`AI catalog: ${report.aiServices} services / ${report.aiDomains} domain patterns / ${report.aiProcesses} process names`)
console.log(`Mainland overlay: ${report.domesticDirectDomains} game/download patterns / ${report.domesticServiceDomains} service patterns`)
console.log(`WebRTC: ${report.webRtcMode}; selection: ${report.foreignSelection}; DNS policies: ${report.dnsProviderPolicies} ordered provider references`)
console.log(`Pruned tail rules: ${report.trimmedTailRules}; subsumed domain rules: ${report.subsumedDomainRules}; merged classical runs: ${report.mergedClassicalRuns}`)
console.log(`Pinned upstream: ${report.revisions.scki.slice(0, 12)} / ${report.revisions.meta.slice(0, 12)}`)
console.log('Privacy requires active TUN and browser WebRTC policy. Domain counts are not a zero-leak guarantee.')
