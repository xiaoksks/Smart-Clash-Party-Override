import { readFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { buildWebRtcProtectionRules, loadCustomSpec, ROOT } from './custom-spec.mjs'

function inspectLiteOverride(code) {
  const sandbox = {
    __config: { proxies: [{ name: 'Test', type: 'ss', server: '1.1.1.1', port: 443, cipher: 'aes-128-gcm', password: 'p' }] },
    console: { log() {}, error() {} },
  }
  const result = vm.runInNewContext(`${code}\n;main(__config)`, sandbox, { timeout: 5000 })
  const allGroups = result['proxy-groups'] || []
  const visibleGroups = allGroups.filter(g => !g.hidden)
  return {
    groups: visibleGroups.length,
    rules: (result.rules || []).length,
    providers: Object.keys(result['rule-providers'] || {}).length,
  }
}

async function main() {
  const [liteCode, spec] = await Promise.all([
    readFile(path.join(ROOT, 'dist', 'Lite-Override.js'), 'utf8'),
    loadCustomSpec(),
  ])
  const summary = inspectLiteOverride(liteCode)

  console.log('## Clash Party / Mihomo Override - Lite 极简版')
  console.log('')
  console.log('### 策略组配置 (Triple-Group)')
  console.log(`- 核心策略组数: ${summary.groups} (🌐 国外节点 / 🚫 日本禁用 / 🇨🇳 国内节点)`)
  console.log(`- 日本禁用策略组: 自动排除所有日本节点，提供港/台/美/新等非日节点备选，直连保底`)
  console.log(`- 国内节点出站: 首项默认 DIRECT，内嵌「🌐 国外节点」支持一键全局翻墙`)
  console.log('')
  console.log('### 规则与分流配置')
  console.log(`- 总规则数: ${summary.rules}`)
  console.log(`- 规则提供商 (MRS): ${summary.providers}`)
  console.log(`- 日本禁用分流网站数: ${(spec.japanBlockedDomains || []).length} (含 hgamefree.info, 生肉漫画, ACG 资源, 成人流媒体等)`)
  console.log(`- 自定义前置规则: ${spec.preRules.length}`)
  console.log(`- 大陆权威 IP 强制直连: ${spec.forceChinaIpDirect ? '开启' : '关闭'}`)
  console.log('- 广告拦截规则: 未包含')
  console.log('')
  console.log('### 安全与 DNS 优化')
  console.log(`- WebRTC 防泄漏: ${spec.preventWebRtcLeak ? `开启 (${buildWebRtcProtectionRules(spec).length} 条规则，覆盖国内 STUN 与海外 UDP)` : '关闭'}`)
  if (spec.webRtcDomains && spec.webRtcDomains.length > 0) {
    console.log(`- WebRTC 重点防御域名: ${spec.webRtcDomains.join(', ')}`)
  }
  console.log(`- 海外 DoH 防污染域名数: ${spec.foreignDnsDomains.length + (spec.japanBlockedDomains || []).length}`)
  console.log(`- TUN 内核旁路进程数: ${(spec.tunExcludeProcesses || []).length}`)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
