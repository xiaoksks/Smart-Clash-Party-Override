# 来源
https://github.com/IvanSolis1989/Smart-Config-Kit

# Clash Party Custom Override

这个仓库会定时拉取上游 [Smart-Config-Kit](https://github.com/IvanSolis1989/Smart-Config-Kit) 的规则配置，**同步构建并生成两款覆写文件**（Smart 内核版与 Normal 普通版），在完整执行上游路由配置后，自动应用 `custom-overrides.js` 中的本地规则、DNS 和策略偏好：

- **Smart 内核版 (`dist/Smart-Override.js`)**：基于上游 `ClashParty(mihomo-smart).js`，区域组采用 Mihomo 专属的 **Smart 机器学习算法**（基于 LightGBM 决策树，结合 RTT、历史可用率、丢包与权重综合评估优选节点）。需要客户端支持 Smart 内核（如 Mihomo Party 内置，或 Clash Verge Rev 开启 Alpha 内核）。
- **Normal 普通版 (`dist/Normal-Override.js`)**：基于上游 `ClashParty(mihomo).js`，区域组采用标准的 **`url-test` 延迟测速选路**（测试地址 `gstatic.com/generate_204`，检测间隔 300s，容差 10ms），**不依赖 Smart 特殊内核**，兼容所有主流 Mihomo / Clash.Meta / Clash Verge / Mihomo Party 客户端。

两个版本**完全共享相同的本地定制层与优化**，规则集、分流业务组、前置直连与 DNS 防护等特性 100% 保持一致。

---

## 核心特性与定制

- **双版本同步构建与持续交付**：一套规则源同时产出 Smart 与 Normal 双版本，自动化流程包含上游版本追踪、降级拦截与全量结构契约审计。
- **构建后自动移除广告拦截**：自动移除上游广告拦截策略组、指向该策略的规则及其专用 provider，避免误杀正常页面资源；其他非广告用途的 `REJECT` 规则保持原样。
- **WebRTC 防泄露优化**：阻断常见浏览器的 UDP，并拒绝常见 STUN/TURN 端口，同时自动移除上游对这些端口的 `DIRECT` 规则；移除了 Windows 下引发冷启动网络黑洞的 `strict-route`，兼顾隐私安全与系统网络稳定性。
- **Windows NCSI 联网探针秒级直连**：将微软系统连通性检测（`msftconnecttest.com`、`msftncsi.com`）前置强制直连，开机 5ms 即可获取连通响应，立即标记网络正常。
- **国内权威 IP 与域名秒解**：中国大陆权威 IP 集合强制直连并前置（保留 `no-resolve`）；国内域名（`geosite:cn`）与引导 DNS 采用纯 UDP `223.5.5.5`（阿里 DNS），彻底移除容易超时的 `doh.pub`。
- **Fake-IP 缓存持久化**：开启 Fake-IP 缓存持久化（`store-fake-ip`），防止重启客户端后浏览器缓存的虚拟 IP 映射丢失。
- **冷启动无需手动刷新**：原生支持开机/冷启动联网，彻底解决旧版配置可能因悬空引用导致的冷启动 DNS 报错，开机自启无需任何多余操作。
- **高优先级前置规则补强**：
  - Windows QQ 客户端进程直连，覆盖收藏详情、编辑等未公开接口和直接 IP 请求。
  - 常用 IP 查询源（IPSB 等走代理出口，国内兜底走直连）。
  - Steam 下载/CDN 域名直连。
  - Gitee（`gitee.com`）强制直连，避免被上游下载更新规则误分流至代理。
  - 斗鱼复用上游完整 `douyu` provider 并整体直连。
  - Patreon 媒体、视频与聊天依赖链及专属海外 DNS 策略。
  - Hulu 默认优先美国家宽/美国节点。

---

## 版本选型与导入链接

> ⚠️ **二选一使用**：请根据你的客户端内核支持情况与个人偏好**选择其中一个版本导入**即可，**请勿在客户端中同时勾选两份覆写**！

### 1. Smart 内核版（推荐配合 Mihomo Party 使用）
适合追求智能选路、使用 Mihomo Party 或已开启 Mihomo Alpha 内核的用户。
- **GitHub Raw**：
  ```text
  https://raw.githubusercontent.com/xiaoksks/Smart-Clash-Party-Override/main/dist/Smart-Override.js
  ```
- **jsDelivr CDN**：
  ```text
  https://cdn.jsdelivr.net/gh/xiaoksks/Smart-Clash-Party-Override@main/dist/Smart-Override.js
  ```

### 2. Normal 普通版（标准 url-test 版）
适合标准 Mihomo/Clash.Meta 内核、Clash Verge Rev 正式版，或偏好经典低延迟自动测速选路的用户。
- **GitHub Raw**：
  ```text
  https://raw.githubusercontent.com/xiaoksks/Smart-Clash-Party-Override/main/dist/Normal-Override.js
  ```
- **jsDelivr CDN**：
  ```text
  https://cdn.jsdelivr.net/gh/xiaoksks/Smart-Clash-Party-Override@main/dist/Normal-Override.js
  ```

---

## 本地构建与审计

```bash
# 构建 Smart 与 Normal 两款产物
npm run build

# 执行全量自动化合规检查与语法校验
npm run check

# 查看当前生成的构建版本与规则概要
npm run report
```

`npm run check` 包含严密的双版本质量守卫：
- 上游与路由图基础版本一致性校验、完整版本防降级检测
- 重复规则检测、广告内容与 WebRTC 直连规则精准移除断言
- Smart 契约校验（机器学习参数合法、无废弃 `strategy` 字段、禁用数据收集）
- Normal 契约校验（精准识别并生成区域 `url-test` 组，严禁引入 smart 类型组）
- 规则 / 策略组 / provider 交叉引用完整性
- DNS 契约、Hulu 区域偏好、运行幂等性及 JavaScript 语法检查

---

## 客户端导入指南

### Mihomo Party

1. 左侧菜单 → **覆写（Override）** → 右上角 ➕。
2. 类型选择 **JavaScript（.js）**。
3. 名称建议：`Smart-Override`（或 `Normal-Override`）。
4. 内容：填入对应版本的 Raw 或 jsDelivr 地址，或者复制对应文件的全文粘贴进去。
5. 保存。
6. 返回「订阅」页面，右键你的订阅 → **编辑** → **启用覆写** → 勾选刚才添加的脚本 → 保存（**仅勾选一份**）。
7. 切换到该订阅，点击「**连接**」。

### Clash Verge Rev

1. 左侧 → **脚本（Scripts）** → ➕ **新建脚本** → **在线脚本**（或本地脚本）。
2. 填入上方对应的 `.js` 订阅链接，保存。
3. **订阅（Profiles）** → 右上角 ⋯ → **扩展管理（Extensions）** → 勾选刚才的脚本。
4. 重启内核（Ctrl/Cmd + R）。

---

## 关于客户端设置

无论使用 `Smart-Override.js` 还是 `Normal-Override.js`，脚本均已接管了分流、DNS、嗅探与自适应路由配置，因此：

1. **无需在 UI 开启「DNS 覆写」**：
   脚本内部已写入完整的 Fake-IP、国内纯 UDP 极速解析（阿里 DNS `223.5.5.5`）与海外 DoH 防污染策略。保持客户端 UI 的「DNS 覆写」为关闭即可。
2. **无需在 UI 配置「嗅探覆写」**：
   脚本已内置对 TLS/QUIC (HTTP/3) 的 SNI 嗅探以及 Telegram/Apple Push 排除白名单，保证复杂规则集的命中率。
3. **外部数据（GeoX URL，可选）**：
   如需自定义 GeoX 规则数据库源，可在客户端「设置 → 外部资源」中按需配置：

```yaml
geox-url:
  geoip: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/geoip.dat
  mmdb: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb
  asn: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb
  geosite: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat
geo-auto-update: true
```

---

## 常见问题

### Clash Party 获取当前 IP 失败
若「网络信息」里的 IPSB 等查询源显示获取失败，通常是查询域名被误分流或 DNS 超时。本项目已在 `custom-overrides.js` 前置处理常见 IP 查询域名：国外查询源走 `🌐 国外网站`，国内兜底查询源走 `DIRECT`。

### country code id not found in geoip.dat
如果客户端报 `[GeoIP] failed to decode geodata file: geoip.dat, base error: country code id not found in geoip.dat`，说明当前客户端使用的 `geoip.dat` 不包含上游脚本里的印尼 GeoIP 国家码规则。本项目会在生成阶段自动移除该不兼容兜底规则，保留前面已有的印尼域名规则，避免整份覆写加载失败。
