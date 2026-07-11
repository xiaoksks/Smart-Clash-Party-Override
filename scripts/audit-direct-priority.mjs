import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUTPUT_PATH = path.join(ROOT, 'dist', 'Smart-Override.js')

const REQUIRED_PRE_RULES = [
  'DOMAIN,ip.cip.cc,DIRECT',
  'DOMAIN,myip.ipip.net,DIRECT',
  'DOMAIN-SUFFIX,mail.qq.com,DIRECT',
  'DOMAIN-SUFFIX,mail.163.com,DIRECT',
  'DOMAIN-SUFFIX,mail.126.com,DIRECT',
  'DOMAIN-SUFFIX,mail.sina.com.cn,DIRECT',
  'DOMAIN-SUFFIX,mail.aliyun.com,DIRECT',
  'DOMAIN-SUFFIX,feishu.cn,DIRECT',
  'DOMAIN-SUFFIX,dingtalk.com,DIRECT',
  'DOMAIN-SUFFIX,welink.huaweicloud.com,DIRECT',
  'DOMAIN-SUFFIX,bbys.app,DIRECT',
  'DOMAIN-SUFFIX,steamcdn-a.akamaihd.net,DIRECT',
  'DOMAIN-SUFFIX,steampipe.akamaized.net,DIRECT',
  'DOMAIN-SUFFIX,steampipe-kr.akamaized.net,DIRECT',
  'DOMAIN-SUFFIX,steampipe-partner.akamaized.net,DIRECT',
  'DOMAIN-SUFFIX,steamcontent.com,DIRECT',
  'DOMAIN-SUFFIX,steamcontent.tnkjmec.com,DIRECT',
  'DOMAIN-SUFFIX,steamserver.net,DIRECT',
  'DOMAIN-SUFFIX,steamstatic.com,DIRECT',
  'DOMAIN-SUFFIX,cdn-ali.content.steamchina.com,DIRECT',
  'DOMAIN-SUFFIX,cdn-qc.content.steamchina.com,DIRECT',
  'DOMAIN-SUFFIX,cdn-ws.content.steamchina.com,DIRECT',
  'DOMAIN-SUFFIX,cm.steampowered.com,DIRECT',
  'DOMAIN-SUFFIX,dl.steam.clngaa.com,DIRECT',
  'DOMAIN-SUFFIX,dl.steam.ksyna.com,DIRECT',
  'DOMAIN-SUFFIX,st.dl.bscstorage.net,DIRECT',
  'DOMAIN-SUFFIX,st.dl.eccdnx.com,DIRECT',
  'DOMAIN-SUFFIX,st.dl.pinyuncloud.com,DIRECT',
  'DOMAIN-SUFFIX,steampowered.com.8686c.com,DIRECT',
  'DOMAIN-SUFFIX,steamstatic.com.8686c.com,DIRECT',
  'DOMAIN-SUFFIX,wmsjsteam.com,DIRECT',
  'DOMAIN-SUFFIX,xz.pphimalayanrt.com,DIRECT',
  'DOMAIN-SUFFIX,mihoyo.com,DIRECT',
  'DOMAIN-SUFFIX,miyoushe.com,DIRECT',
  'DOMAIN-SUFFIX,yuanshen.com,DIRECT',
  'DOMAIN-SUFFIX,bhsr.com,DIRECT',
  'DOMAIN-SUFFIX,zenlesszonezero.com,DIRECT',
  'DOMAIN-SUFFIX,juequling.com,DIRECT',
  'DOMAIN,game.163.com,DIRECT',
  'DOMAIN-SUFFIX,gm.163.com,DIRECT',
  'DOMAIN-SUFFIX,ds.163.com,DIRECT',
  'DOMAIN-SUFFIX,nie.163.com,DIRECT',
  'DOMAIN-SUFFIX,nie.netease.com,DIRECT',
  'DOMAIN-SUFFIX,update.netease.com,DIRECT',
  'DOMAIN-SUFFIX,netease.com,DIRECT',
  'DOMAIN-SUFFIX,wegame.com,DIRECT',
  'DOMAIN-SUFFIX,wegame.com.cn,DIRECT',
  'DOMAIN-SUFFIX,perfect-world.com,DIRECT',
  'DOMAIN-SUFFIX,wanmei.com,DIRECT',
  'DOMAIN-SUFFIX,xd.com,DIRECT',
  'DOMAIN-SUFFIX,taptap.com,DIRECT',
  'DOMAIN-SUFFIX,taptap.io,DIRECT',
  'DOMAIN-SUFFIX,papegames.com,DIRECT',
  'DOMAIN-SUFFIX,hypergryph.com,DIRECT',
  'DOMAIN-SUFFIX,gryphline.com,DIRECT',
  'DOMAIN-SUFFIX,lilith.com,DIRECT',
]

const REQUIRED_OUTPUT_SNIPPETS = [
  "const LOW_LATENCY_REGION_ORDER = ['GLOBAL', 'HK', 'SG', 'TW', 'JPKR', 'APAC', 'US', 'EU', 'AMERICAS', 'OTHER', 'AFRICA']",
  "const SMART_CHECK_URL = 'https://www.gstatic.com/generate_204'",
  "collectdata: true",
  'lazy: false',
  "'max-failed-times': 2",
  "config.profile['store-selected'] = false",
  'buildStandardProxies()',
  'withResidential(LOW_LATENCY_REGION_ORDER)',
  'if (homeKey && SMART[homeKey]) result.push(SMART[homeKey])',
  'if (SMART[key]) result.push(SMART[key])',
  "else if (g.name !== 'GLOBAL') { otherGroups.push(g) }",
  "var domesticPlainDns = ['223.5.5.5', '223.6.6.6', '119.29.29.29']",
  "config.dns['direct-nameserver'] = domesticDoH.concat(domesticPlainDns)",
  "config.dns['direct-nameserver-follow-policy'] = false",
]

function getCustomPreRulesBlock(text) {
  const start = text.indexOf('const CUSTOM_PRE_RULES = [')
  if (start === -1) throw new Error('Could not find CUSTOM_PRE_RULES in generated output')

  const end = text.indexOf('\n]\n', start)
  if (end === -1) throw new Error('Could not find end of generated CUSTOM_PRE_RULES block')

  return text.slice(start, end)
}

async function main() {
  const output = await readFile(OUTPUT_PATH, 'utf8')
  const preRules = getCustomPreRulesBlock(output)
  const required = REQUIRED_PRE_RULES
  const missing = required.filter(rule => !preRules.includes(`'${rule}'`))

  if (missing.length) {
    throw new Error(`Missing high-priority pre-rules:\n${missing.join('\n')}`)
  }

  if (output.includes('function applyMihomoFusedRuleSets(config) {')) {
    const requiredFusedSnippets = [
      'function prependCustomPreRules(config) {',
      'config.rules = CUSTOM_PRE_RULES.concat(rest)',
      'prependCustomPreRules(config)',
    ]
    const missingFusedSnippets = requiredFusedSnippets.filter(snippet => !output.includes(snippet))
    if (missingFusedSnippets.length) {
      throw new Error(`Missing fused-rule custom pre-rule injection:\n${missingFusedSnippets.join('\n')}`)
    }
  }

  const missingSnippets = REQUIRED_OUTPUT_SNIPPETS.filter(snippet => !output.includes(snippet))
  if (missingSnippets.length) {
    throw new Error(`Missing Smart stability patches:\n${missingSnippets.join('\n')}`)
  }

  console.log(`Priority audit passed (${required.length} guarded rules)`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
