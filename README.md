# Clash Party / Mihomo Lite Override

保留三个策略组，集中维护分流、DNS 与海外 AI 连接保护。国内游戏和 Steam 下载固定直连；默认严格 WebRTC 模式优先保护 AI 与浏览器，再限制未命中直连规则的 UDP。

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
5. 在最终运行配置中确认只有三个策略组，存在 `lite-ai`。规则开头为 DNS 代理、AI/浏览器保护；国内游戏、下载域名和大陆 IP 的 `DIRECT` 规则位于 `NETWORK,UDP,REJECT` 之前。不要同时启用会在之后改写 DNS、TUN 或规则目标的其他覆写。

脚本不会修改客户端设置、操作系统防火墙或浏览器策略。保存脚本也不代表上述应用开关已经设置正确。

## 三个策略组

| 策略组 | 行为 |
| --- | --- |
| 🌐 国外节点 | 手动选择境外节点；海外 AI、开发服务及最终兜底走此组。没有可用节点时拒绝，避免自动直连。 |
| 🚫 日本禁用 | 根据节点名称过滤日本及国内回国节点。静态节点与动态代理集合均生效；无非日节点时才使用 DIRECT 兜底，不再重新加入日本节点。 |
| 🇨🇳 国内节点 | 默认 DIRECT，可选国外组及识别到的国内回国节点。国内游戏、Steam 下载、本地显式 DIRECT 和大陆 IP 直连不跟随组切换。 |

支持只有 `proxy-providers` 的订阅，通过 `use`、名称过滤及 `empty-fallback` 动态构建组。节点地区由名称判断，需要机场正确标注；无法根据名称验证真实出口国家。代理集合引用的旧策略组会被修正，只有代理集合时通过 DIRECT 引导下载订阅。

## 国内游戏直连与 Steam 分流

strict、compatible 及关闭保护时均保持以下业务分流，直连目标固定为 `DIRECT`，不受「🇨🇳 国内节点」切换影响：

- `directRuleSets` 将上游两套完整国内游戏分类（`014-game-cn-domain`、`070-game-cn-domain`）前置直连，覆盖腾讯/WeGame、米哈游、网易、完美世界等。上游分类随固定快照更新，不只为单个游戏添加例外。
- `lite-domestic-direct` 补充真实国内游戏分类和国内下载覆盖，共 271 条匹配项；4399、九游、叠纸、网易国服及补丁服务不再被混杂的 `071-game-intl` 集合抢先代理，腾讯 `down.qq.com` / `dldir1.qq.com` 也固定直连。
- 本地国内游戏域名（包括 `mihoyo.com`、`juequling.com`）保留字面 `DIRECT`，不再转换成国内策略组；未登记游戏直接连接大陆服务器 IP 时，也在剩余 UDP 拦截和无域名 TCP 代理之前直连。
- `processTargetOverrides` 为 `dota2.exe` / `dota2`、`ZenlessZoneZero.exe`、`YuanShen.exe`、`StarRail.exe` 补充进程直连，覆盖未知域名及其他服务器 IP。这些进程按整体直连，适用于国服使用场景，不自动识别游戏内选择的服务器地区。
- Steam 根据目的域名分流，不为 `steam.exe`、`steamwebhelper.exe` 或 `SteamService.exe` 设置全进程代理：`steamcontent.com`、SteamPipe、国内下载 CDN 等走直连；社区、用户图片、聊天、商店与 CM 登录服务走国外代理。CM 和社区图片的显式代理优先于上游国内游戏集合中重叠的域名。
- 国内游戏和下载域名的 DNS 使用国内解析；社区等代理域名使用代理 DoH。域名与 IP 集合只能覆盖已登记或已识别的服务器，新增域名可补充到本地规则或更新上游快照。

需要运行 TUN 并使用规则模式，确保内核能识别发起连接的进程。更新后重新应用覆写并重启游戏及 Steam，清除旧连接；在连接面板确认游戏与 Steam 下载命中 `DIRECT`、Steam 社区命中国外组。AI/浏览器的 UDP 保护仍优先于国内游戏/CDN 规则，不按游戏端口对所有程序全局放行。

Steam 游戏流量使用 UDP，参见 [Steam 官方端口说明](https://help.steampowered.com/en/faqs/view/2EA8-4D75-DA21-31EB)；规则按优先顺序匹配，参见 [Mihomo 进程规则](https://wiki.metacubex.one/config/rules/#process-name)。

## 国内普通网站与本地化服务

`lite-domestic-services` 使用 MetaCubeX 固定提交的 `geolocation-cn`、`category-companies@cn`，结合 `scripts/domestic-services.json` 的人工修正，提供 6212 条国内业务匹配项。万方、iCloud 中国、Azure 中国、AWS 中国、Unity 中国、Tesla 中国等域名在混杂的国外业务集合之前进入「🇨🇳 国内节点」，默认 DIRECT；该组被用户切换到代理时，普通业务仍遵循用户选择。游戏、下载的固定 DIRECT 保持独立。

覆盖层不包含整个 `.cn`、`.com.cn` 等公共后缀，不将整个 Google、Apple、Microsoft 或国际游戏集合改为直连。Google 搜索的 `google.cn` / `g.cn`、Apple 国际门户和 App Store 保留既有代理策略；Steam 社区、海外 AI 和非日站点也优先于国内覆盖层。浏览器和已知 AI 客户端的 UDP 保护仍在这些例外之前生效。

路由与 DNS 使用相同的覆盖集合及顺序。大陆 IP 的 `no-resolve` 仅匹配已知目标 IP，Fake-IP/按域名请求未必已有真实 IP；国内业务因此靠前置域名集合识别，不依赖取消 `no-resolve` 或额外解析每个未知域名。未登记业务仍可能需要后续更新，不能由匹配项数量推导完全覆盖。

## AI 与 WebRTC 保护

`scripts/ai-services.json` 维护 52 个产品及服务类别，包括 OpenAI / ChatGPT / Codex / Sora、Gemini / AI Studio / Gemini CLI / NotebookLM、Claude / Claude Code、Microsoft / GitHub Copilot、Grok、Perplexity、Mistral、Meta AI、Poe、Cursor、Windsurf、Kiro、Junie、Hugging Face、OpenRouter，以及主流图像、视频和音频 AI 服务。

清单合并固定提交的 MetaCubeX `category-ai-!cn` 数据与自定义依赖，目前生成 **296 个 AI 及关联服务域名匹配项**。此数字不等于全部底层分流域名数，也不代表每一个未来域名都已登记。社区的境外 AI 分类可能包含中国厂商的海外服务。

AI 网页、API、认证与资源域名共用同一 `lite-ai` 集合及海外出口。已知原生客户端进程也前置代理，保护它们使用的自定义服务地址；Gemini CLI 等共享 `node` 运行时无法靠进程名准确区分，未知域名仍由海外 `MATCH` 和代理 DoH 承接。

### 默认 strict 模式

```js
preventWebRtcLeak: true,
webRtcMode: 'strict',
```

- 先阻断登记 AI 域名、浏览器及已知 AI 进程的 UDP，即使目的地址在国内或属于游戏/CDN 域名也不豁免；这些客户端的常见 STUN/TURN TCP 端口同样拦截。
- UDP 53 由 TUN DNS 劫持处理；落入路由的 UDP 53 走海外组。
- 国内游戏分类、显式直连域名/进程及大陆 IP 先直连，随后阻断其他 UDP。常见 STUN/TURN 端口只对未命中上述业务直连的其他连接拦截；已登记探测域名、STUN 域名和 AI TURN 域名仍前置限制。
- 未携带域名的大陆服务器 TCP 允许直连；其他未知公网 IP 的 TCP 优先代理。已知 AI 进程仍优先代理自定义服务地址。
- 开启严格 TUN 路由，移除订阅中的 TUN 路由/进程排除项；内核和 DNS 关闭 IPv6。客户端仍可能在脚本之后添加内核自身的必要路由排除项。
- 删除生成配置的强制 DIRECT 10086 监听入口，其他监听器移除强制出口，让流量经过规则。

**代价：浏览器 QUIC、未匹配直连的境外游戏/会议 UDP 及部分 AI 实时语音会受到影响。** HTTPS/TCP 通常仍可使用；语音能否回退 TCP 取决于产品自身。允许国内游戏和大陆服务器直连，也意味着未知程序直接连接大陆 IP 时不会获得旧版“全 UDP 拒绝”的覆盖范围。

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

本次生成结果：**236 条入口规则、115 个规则集，其中 101 个远程 MRS、14 个内联集合**，最新统计见 [build-report.json](dist/build-report.json)。原版为 342 条入口规则、144 个远程规则文件。这些是结构与请求数量的减少，不能直接换算成网速或延迟提升百分比。

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
npm run check:core       # 真实 MRS 路由/DNS 矩阵、内核配置和 Party 兼容验证
```

PowerShell 内核校验示例：

```powershell
$env:MIHOMO_BIN = 'D:\tools\mihomo.exe'
npm run check:core
```

`scripts/upstream-snapshot.json` 同时记录两个上游提交、远程文件 SHA256、classical 内容、AI 域名列表及三套国内分类的原始匹配项/校验值。构建阶段不依赖网络；运行配置不再使用带版本查询参数的漂移 `main` URL。

`check:core` 不只检查 YAML 能否解析：它使用经 SHA256 验证的真实 MRS，启动仅监听回环地址的独立内核，按 `scripts/routing-cases.json` 验证 39 个国内业务与海外对照域名的 TCP 出口和 DNS 分类。目标服务器、代理和 DNS 都是本地测试服务，不访问这些网站，不启用 TUN，不修改正在运行的 Party 或系统路由。此验证不能代替实机浏览器 ICE / TUN 抓包检查。

GitHub Actions 在推送/PR 时验证，在每周及手动触发时更新快照；全量审计和内核检查通过后才提交产物。若上游增加、删除或改名规则集，任务输出 `.build/upstream-diff.json` 并停止发布，必须审查新规则的类别与优先级后更新 `base-data.json`。不会依据编号猜测分流策略。上游继续提供 YAML/MRS 双格式以及广告集合，不视为需要新增的业务集合。

新增 AI 产品或依赖请修改 `scripts/ai-services.json`，记录来源及精确域名。国内分类修正请修改 `scripts/domestic-services.json`，并在 `routing-cases.json` 增加回归用例；不要直接编辑生成 JS。自建网关可加入 `foreignDnsDomains`，它也会进入前置海外集合。非日镜像、认证与 CDN 域名加入 `japanBlockedDomains`。所有修改后运行 `npm run check`；涉及分流时同时运行 `check:core`。文件推送到仓库后，在线导入链接才会取得新版本。

## 可选 Party Smart 模式

将 `foreignSelection` 改为 `'party-smart'`，重新构建并启用客户端 Smart 内核及内置 Smart 覆写。脚本只将国外组预设为 `url-test`，并提前固定其 Smart 名称；Party 随后的转换只处理该组，不会把国内或非日规则重定向过去，也不会破坏 DNS 中的 `#组名` 引用。

已通过官方 v2.0.4 脚本的静态节点与代理集合执行顺序测试。其他客户端或后续 Party 版本需要重新校验；默认手动模式始终保留 `select`。

## 数据来源

- [Smart-Config-Kit](https://github.com/IvanSolis1989/Smart-Config-Kit)：基础规则与斗鱼域名集合。
- [MetaCubeX/meta-rules-dat](https://github.com/MetaCubeX/meta-rules-dat)：境外 AI、国内服务、国内游戏及国际厂商中国业务分类。
- [Mihomo 文档](https://wiki.metacubex.one/config/dns/)：DNS、Fake-IP 与规则集合语法。
- [Clash Party v2.0.4 配置流程](https://github.com/mihomo-party-org/clash-party/blob/v2.0.4/src/main/core/factory.ts)及 [Smart 覆写实现](https://github.com/mihomo-party-org/clash-party/blob/v2.0.4/src/main/config/smartOverride.ts)：客户端兼容验证依据。
