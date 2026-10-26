# Clash Party / Mihomo Lite Override

保留三个策略组，集中维护分流、DNS 与海外 AI 连接保护。默认使用严格 WebRTC 模式，优先覆盖未知客户端、未知域名及直接 IP 连接。

本版验证环境为 **Clash Party v2.0.4 的脚本执行流程、Mihomo v1.19.33**。导入前更新内核。普通 Mihomo 也可使用手动选择模式；`party-smart` 模式需要 Clash Party 的 Smart 内核。

## 导入与客户端设置

覆写链接：

```text
https://raw.githubusercontent.com/xiaoksks/Smart-Clash-Party-Override/main/dist/Lite-Override.js
```

1. 在 Clash Party 的普通订阅模式中，添加 JavaScript 覆写并绑定订阅。**v2.0.4 简易模式有独立的配置生成流程，会跳过这类 JavaScript 覆写，不能用来运行本脚本。**
2. 默认 `foreignSelection: 'select'`：关闭客户端的**内置 Smart 覆写**。否则客户端会在本脚本之后创建 Smart Group 并重写国内及非日规则。仅选择 Smart 内核不等于必须开启内置 Smart 覆写。
3. 使用本脚本管理 DNS：关闭客户端的 **DNS 覆写**，保留 DNS 覆写保护。新版保护只检查原始订阅，不能阻止 JavaScript 改写 DNS；开启客户端 DNS 覆写又可能在脚本之后覆盖脚本配置。
4. 应用配置，确认 **TUN 已实际运行**、严格路由启用，DNS 劫持包含 UDP/TCP 53。仅开启系统代理无法保护不遵循代理设置的应用。
5. 在最终运行配置中确认只有三个策略组，存在 `lite-ai`，规则开头为 Dota 2 / Steam 进程例外，随后是 DNS 代理和 `NETWORK,UDP,REJECT`。不要同时启用会在之后改写 DNS、TUN 或规则目标的其他覆写。

脚本不会修改客户端设置、操作系统防火墙或浏览器策略。保存脚本也不代表上述应用开关已经设置正确。

## 三个策略组

| 策略组 | 行为 |
| --- | --- |
| 🌐 国外节点 | 手动选择境外节点；海外 AI、开发服务及最终兜底走此组。没有可用节点时拒绝，避免自动直连。 |
| 🚫 日本禁用 | 根据节点名称过滤日本及国内回国节点。静态节点与动态代理集合均生效；无非日节点时才使用 DIRECT 兜底，不再重新加入日本节点。 |
| 🇨🇳 国内节点 | 默认 DIRECT，可选国外组及识别到的国内回国节点。迅雷 TCP 进程规则和大陆 IP 的显式 DIRECT 不跟随组切换。 |

支持只有 `proxy-providers` 的订阅，通过 `use`、名称过滤及 `empty-fallback` 动态构建组。节点地区由名称判断，需要机场正确标注；无法根据名称验证真实出口国家。代理集合引用的旧策略组会被修正，只有代理集合时通过 DIRECT 引导下载订阅。

## Steam 代理与 Dota 2 国服直连

默认在 `processTargetOverrides` 中设置以下进程例外，优先于 UDP 拦截、CDN 域名和大陆 IP 规则；strict、compatible 及关闭保护时均生效：

- `dota2.exe` / `dota2` 的 TCP、UDP 固定走 `DIRECT`，不跟随「🇨🇳 国内节点」选择。此配置按进程整体直连，适用于国服使用场景，不自动识别游戏内选择的服务器地区。
- `steam.exe` / `steam`、`steamwebhelper.exe` / `steamwebhelper`、`SteamService.exe` 的 TCP、UDP 走「🌐 国外节点」，包括 Steam 客户端下载。Steam 主进程的连接与 Dota 2 游戏进程分别匹配。
- 未识别到 Steam 进程时，`steampowered.com`（包括 CM 登录服务器）、`steamcommunity.com`、`steam-chat.com` 的 TCP 仍优先代理；原有 CDN 域名继续按国内规则处理。

需要运行 TUN 并使用规则模式，确保内核能识别发起连接的进程。更新后重新应用覆写并重启 Steam / Dota 2，清除旧连接；在客户端连接面板确认 `dota2.exe → DIRECT`、`steam.exe / steamwebhelper.exe → 🌐 国外节点`。Steam UDP 需要所选代理节点支持 UDP。其他程序仍受原有 WebRTC 保护约束，不按游戏端口全局放行。

Steam 游戏流量使用 UDP，参见 [Steam 官方端口说明](https://help.steampowered.com/en/faqs/view/2EA8-4D75-DA21-31EB)；规则按优先顺序匹配，参见 [Mihomo 进程规则](https://wiki.metacubex.one/config/rules/#process-name)。

## AI 与 WebRTC 保护

`scripts/ai-services.json` 维护 52 个产品及服务类别，包括 OpenAI / ChatGPT / Codex / Sora、Gemini / AI Studio / Gemini CLI / NotebookLM、Claude / Claude Code、Microsoft / GitHub Copilot、Grok、Perplexity、Mistral、Meta AI、Poe、Cursor、Windsurf、Kiro、Junie、Hugging Face、OpenRouter，以及主流图像、视频和音频 AI 服务。

清单合并固定提交的 MetaCubeX `category-ai-!cn` 数据与自定义依赖，目前生成 **296 个 AI 及关联服务域名匹配项**。此数字不等于全部底层分流域名数，也不代表每一个未来域名都已登记。社区的境外 AI 分类可能包含中国厂商的海外服务。

AI 网页、API、认证与资源域名共用同一 `lite-ai` 集合及海外出口。已知原生客户端进程也前置代理，保护它们使用的自定义服务地址；Gemini CLI 等共享 `node` 运行时无法靠进程名准确区分，未知域名仍由海外 `MATCH` 和代理 DoH 承接。

### 默认 strict 模式

```js
preventWebRtcLeak: true,
webRtcMode: 'strict',
```

- Dota 2 / Steam 显式进程例外优先，其余流量在普通进程直连、国内域名及大陆 IP 规则之前阻断所有剩余 UDP；没有通用的国内目的地址豁免。直接 IP、改名客户端、未知应用与未知端口同样受限。
- UDP 53 由 TUN DNS 劫持处理；除显式进程例外外，落入路由的 UDP 53 只能走海外组，不允许直连。
- 合并限制常见 STUN/TURN 的 TCP/UDP 端口，阻断 STUN 域名及已登记 AI TURN 域名。
- 未知程序直接连接公网 IP 的 TCP 流量也优先代理，防止未携带域名的 TCP TURN 落入大陆 IP 直连；局域网和显式进程直连例外保留。
- 开启严格 TUN 路由，移除订阅中的 TUN 路由/进程排除项；内核和 DNS 关闭 IPv6。客户端仍可能在脚本之后添加内核自身的必要路由排除项。
- 删除生成配置的强制 DIRECT 10086 监听入口，其他监听器移除强制出口，让流量经过规则。

**代价：浏览器 QUIC、迅雷 UDP/P2P、其他游戏、会议及部分 AI 实时语音会受到影响。** HTTPS/TCP 通常仍可使用；语音能否回退 TCP 取决于产品自身。严格模式仅按上述显式进程例外放行，不为国内软件普遍放行 UDP。

### compatible 模式

将 `webRtcMode` 改为 `'compatible'` 后重新构建：仍阻断登记 AI 域名、浏览器和已知 AI 进程的 UDP，以及已知 STUN/TURN；其他应用可以使用 QUIC。此模式对未登记客户端和非常规端口没有严格模式相同的覆盖范围。

`preventWebRtcLeak: false` 会移除这些限制，也会移除旧基线中残留的 UDP/443 拦截。请勿把该模式当成防泄漏模式。

### 浏览器端配置与验证边界

Clash 无法判断一个 STUN 请求由哪个网页发起，也不能阻止网页在本机生成或读取 ICE host candidate。要限制网页看到本地地址，需要配合浏览器端设置：

- Chrome：`WebRtcIPHandling = disable_non_proxied_udp`。
- Edge：`WebRtcLocalhostIpHandling = disable_non_proxied_udp`。
- Windows 可手动检查并导入 [浏览器策略文件](docs/browser-webrtc-policy.reg)，完全退出并重启浏览器，再在 `chrome://policy` / `edge://policy` 检查策略是否被当前配置文件接受。已有按网址设置或组织策略可能影响结果。
- Firefox 可在 `about:config` 将 `media.peerconnection.enabled` 设为 `false`，彻底关闭 WebRTC；这会停用依赖它的通话功能。其他浏览器需要使用各自有效的 WebRTC 限制设置。

策略值来源：[Chrome 隐私 API](https://developer.chrome.com/docs/extensions/reference/api/privacy)、[Microsoft Edge 策略文档](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/WebRtcLocalhostIpHandling)。[撤销文件](docs/browser-webrtc-policy-undo.reg) 只移除这两个值；如果原来已有值，应恢复自己的备份。

这些配置降低受控路径上的泄漏风险，**不承诺任何环境中绝对零泄漏**。TUN 未启动、应用强制绑定物理网卡、系统 IPv6 绕过、其他 VPN/排除路由、浏览器忽略策略或内核退出，都需要操作系统防火墙或额外网络隔离处理。本项目不安装系统级 kill switch。

更新后，应关闭旧连接并测试：网页访问出口、ICE host/srflx/relay 候选、直接 IPv4/IPv6、TCP/UDP 的 STUN/TURN。测试时同时观察客户端连接匹配和物理网卡抓包；没有收集到候选也可能只是测试服务器不可达，不能单独证明零泄漏。

## DNS 与规则性能

- 默认未知域名使用加密 DoH，并通过选中的国外组连接；AI 显式域名覆盖继承的国内解析策略，避免大陆 CDN 地址导致直连或 DNS 出口分裂。
- 国内域名集合复用于 DNS policy，规则集之间保持分流顺序；原有企业/内网 DNS 策略保留，AI 保留域名除外。
- 代理节点域名使用独立国内 DNS 引导解析，避免“先有代理才能解析代理节点”的依赖循环。
- 非日站点的 DNS 使用非日策略组；网站及资源依赖应同时登记在 `japanBlockedDomains`，不会自动把第三方 CDN 的所有租户都划到非日组。
- Fake-IP 使用 `rule` 模式。AI 优先返回 Fake-IP；局域网、NCSI 等协议例外返回真实 IP。移除 Docker、Bing 等宽泛的真实 IP 豁免。
- 保留 MRS 的域名/IP 紧凑表示；将已校验的 classical 规则内联，并只在**相邻且出口相同**的区段合并，保留国内外例外顺序。
- 对 IP 补充规则使用 `no-resolve`，避免仅为匹配 IP 规则额外解析域名；删除最后一条国内规则之后与最终 MATCH 同出口的 8 条规则及闲置 provider。
- 开启选择与 Fake-IP 持久化。不注入广告拦截规则。

本次生成结果：**232 条入口规则、114 个规则集，其中 101 个远程 MRS、13 个内联集合**，最新统计见 [build-report.json](dist/build-report.json)。原版为 342 条入口规则、144 个远程规则文件。这些是结构与请求数量的减少，不能直接换算成网速或延迟提升百分比。

## 构建、审计与上游同步

需要 Node.js 24+ 和 Git；运行覆写本身不需要 Node、Git 或外部模块。

```bash
npm run build            # 离线、可重复构建 JS 和 build-report.json
npm run audit            # 检查生成文件、引用、DNS、TUN 和幂等性
npm test                 # 隐私与分流回归测试
npm run report           # 输出真实格式统计与上游版本
npm run check            # 完整离线检查
npm run sync:upstream    # 同步整份固定提交快照，校验内容并记录 SHA256
npm run check:upstream   # 联网验证固定文件及最新上游清单结构
npm run check:core       # 设置 MIHOMO_BIN 后执行真实内核与 Party 兼容验证
```

PowerShell 内核校验示例：

```powershell
$env:MIHOMO_BIN = 'D:\tools\mihomo.exe'
npm run check:core
```

`scripts/upstream-snapshot.json` 同时记录两个上游提交、远程文件 SHA256、classical 内容和 AI 域名列表。构建阶段不依赖网络；运行配置不再使用带版本查询参数的漂移 `main` URL。

GitHub Actions 在推送/PR 时验证，在每周及手动触发时更新快照；全量审计和内核检查通过后才提交产物。若上游增加、删除或改名规则集，任务输出 `.build/upstream-diff.json` 并停止发布，必须审查新规则的类别与优先级后更新 `base-data.json`。不会依据编号猜测分流策略。上游继续提供 YAML/MRS 双格式以及广告集合，不视为需要新增的业务集合。

新增 AI 产品或依赖请修改 `scripts/ai-services.json`，记录来源及精确域名。自建网关可加入 `foreignDnsDomains`，它也会进入前置海外集合。非日镜像、认证与 CDN 域名加入 `japanBlockedDomains`。所有修改后运行 `npm run check`；文件推送到仓库后，在线导入链接才会取得新版本。

## 可选 Party Smart 模式

将 `foreignSelection` 改为 `'party-smart'`，重新构建并启用客户端 Smart 内核及内置 Smart 覆写。脚本只将国外组预设为 `url-test`，并提前固定其 Smart 名称；Party 随后的转换只处理该组，不会把国内或非日规则重定向过去，也不会破坏 DNS 中的 `#组名` 引用。

已通过官方 v2.0.4 脚本的静态节点与代理集合执行顺序测试。其他客户端或后续 Party 版本需要重新校验；默认手动模式始终保留 `select`。

## 数据来源

- [Smart-Config-Kit](https://github.com/IvanSolis1989/Smart-Config-Kit)：基础规则与斗鱼域名集合。
- [MetaCubeX/meta-rules-dat](https://github.com/MetaCubeX/meta-rules-dat)：境外 AI 域名分类。
- [Mihomo 文档](https://wiki.metacubex.one/config/dns/)：DNS、Fake-IP 与规则集合语法。
- [Clash Party v2.0.4 配置流程](https://github.com/mihomo-party-org/clash-party/blob/v2.0.4/src/main/core/factory.ts)及 [Smart 覆写实现](https://github.com/mihomo-party-org/clash-party/blob/v2.0.4/src/main/config/smartOverride.ts)：客户端兼容验证依据。
