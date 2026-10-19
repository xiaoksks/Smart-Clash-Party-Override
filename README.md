# Clash Party / Mihomo Override - Lite 极简版

简洁、清爽且高性能的 Clash / Mihomo 覆写脚本。专注于**极致的「三核心策略组」分流体验**，彻底摒弃繁琐多余的几十个子分流组与测速组，全本地自主构建与维护。

---

## 策略组设计

- **🌐 国外节点**（`select`）：汇总订阅中的所有境外可用节点，平铺自选，接管绝大多数海外网站与服务流量。
- **🚫 日本禁用**（`select`）：**专为访问「屏蔽日本 IP / 日本无法使用」的站点打造**。
  - **自动排除所有日本节点**，智能筛选出香港、台湾、新加坡、美国、欧洲等非日节点供自由选择。
  - **解决 403 痛点**：许多 ACG 资源站、生肉漫画、同人分享与成人流媒体（如 `hgamefree.info`、`missav.ai`、`rawkuma.com`、`18comic.vip` 等）为了规避日本严苛的《著作权法》追诉或防取证，会在 Cloudflare WAF 端主动屏蔽日本 IP（直接返回 403 Forbidden）。本策略组将此类流量精准导向非日节点，彻底消除打不开的问题。
  - 尾部附带 `DIRECT` 选项，即使机场没有非日节点也能兜底直连。
- **🇨🇳 国内节点**（`select`）：接管中国大陆网站、国内音视频、游戏与权威 IP 流量。
  - **`DIRECT`（首项默认）**：日常状态下国内流量高速本地直连。
  - **`🌐 国外节点`（内嵌选项）**：只需将国内节点切换至国外节点，即可**一键实现全流量走代理（全局翻墙）**，无需修改规则。
  - （若订阅含有国内专线或回国节点，亦会自动列入国内可选列表）。

---

## 核心特性

- **三组极简，界面清爽**：告别客户端里翻不完的业务组（Netflix、YouTube、Spotify 等），境外通用、避日专用、国内直连分工明确。
- **全链路 WebRTC 防泄漏**：
  - 拦截所有常见 STUN/TURN 探测端口（`3478`, `3479`, `5349`, `19302`, `19305`, `19307`）。
  - 针对含 `stun` 域名的 UDP 探测全网拦截，并专门阻断包括 `ippure.com` 以及国内 STUN 服务器（哔哩哔哩、芒果TV、小米）的穿透探测。
  - 仅对境外浏览器 UDP 进行阻断，国内音视频（Bilibili、抖音等）HTTP/3 (QUIC) 享受原生极速直连。
- **迅雷全生态极速直连与 TUN 内核级旁路**：针对迅雷客户端生态（`Thunder.exe` 等）强制前置直连；同时在内核级 `tun['exclude-process']` 进行进程旁路，P2P 海量并发直接走系统物理网卡，消除虚拟网卡内存流和 CPU 协议栈转换开销，彻底杜绝满速下载时的卡顿。
- **国内人机验证码与滑块服务秒级直连**：腾讯验证码、极验、顶象等国内验证码基础设施前置直连，消除登录鉴权时的死循环与超时。
- **Windows NCSI 联网探针秒级直连**：微软系统连通性检测（`msftconnecttest.com`、`msftncsi.com`）前置强制直连，开机 5ms 即可获取连通响应，立即标记网络正常。
- **国内权威 IP 与域名秒解**：中国大陆权威 IP 集合强制直连；国内域名（`geosite:cn`）与引导 DNS 采用纯 UDP `223.5.5.5`（阿里 DNS），彻底移除容易超时的 `doh.pub`。
- **Fake-IP 缓存持久化**：开启 `store-fake-ip`，防止重启客户端后浏览器缓存的虚拟 IP 映射丢失。
- **AI / ChatGPT 生态链出口统一**：ChatGPT、OpenAI、Sora、Claude、Arkose 人机验证、Statsig 特性标志等前置统一归流至海外节点，消除第三方 CDN 与人机验证 IP 分裂导致的验证死循环。
- **不包含广告拦截规则**：生成配置不注入广告拦截规则组。

---

## 客户端导入链接

> 导入前请确认客户端为 Mihomo / Clash.Meta 内核（如 Mihomo Party、Clash Verge Rev 等）。

- **GitHub Raw 订阅覆写链接**：
  ```text
  https://raw.githubusercontent.com/xiaoksks/Smart-Clash-Party-Override/main/dist/Lite-Override.js
  ```

---

## 客户端导入指南

### Mihomo Party

1. 左侧菜单 → **覆写（Override）** → 右上角 ➕。
2. 类型选择 **JavaScript（.js）**。
3. 名称填写：`Lite-Override`。
4. 内容：填入上方 GitHub Raw 导入链接（或直接复制 `dist/Lite-Override.js` 全文粘贴）。
5. 保存。
6. 返回「订阅」页面，右键你的订阅 → **编辑** → **启用覆写** → 勾选 `Lite-Override` → 保存。
7. 切换到该订阅，点击「**连接**」。

### Clash Verge Rev

1. 左侧 → **脚本（Scripts）** → ➕ **新建脚本** → **在线脚本**（或本地脚本）。
2. 填入上方 GitHub Raw 导入链接，保存。
3. **订阅（Profiles）** → 右上角 ⋯ → **扩展管理（Extensions）** → 勾选刚才添加的脚本。
4. 重启内核（Ctrl/Cmd + R）。

---

## 本地构建与审计

修改 `custom-overrides.js` 自定义配置后，可直接在本地编译与审计：

```bash
# 构建 Lite 覆写文件
npm run build

# 执行结构断言与合规审计
npm run audit

# 输出当前规则与分流概要
npm run report

# 全量一键编译与审计检查
npm run check
```

---

## 常见问题

### Clash Party 获取当前 IP 失败
若「网络信息」里的 IPSB 等查询源显示获取失败，通常是查询域名被误分流或 DNS 超时。本项目已在 `custom-overrides.js` 前置处理常见 IP 查询域名：国外查询源走国外代理，国内兜底查询源走国内直连。

### ChatGPT / OpenAI 网页加载或操作卡顿
ChatGPT 网页高度依赖 Cloudflare 边缘节点、实时 HTTP/3 (QUIC) 竞态探测、Statsig 特性标志和 Arkose 人机安全验证。本项目已在规则层完成了全链条统一出口。若在部分网络环境下仍偶发卡顿，推荐：
1. **关闭浏览器 QUIC 协议**：在 Chrome / Edge 浏览器地址栏打开 `chrome://flags`，搜索 `Experimental QUIC protocol` 设置为 `Disabled`，强制使用稳定的 TCP 隧道加载，可彻底消除静态资源与打字卡顿。
2. **清理浏览器旧 Host 缓存**：访问 `chrome://net-internals/#sockets` 点击 `Flush socket pools`，重置可能遗留的旧连接。
