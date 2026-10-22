// Configuration spec for Clash Party / Mihomo Lite override.
// Rules are prepended in order; foreignDnsDomains are resolved with overseas DoH.
const CUSTOM_OVERRIDE_SPEC = {
  // Route authoritative mainland China IP ranges directly before service-specific IP rules.
  // no-resolve is preserved so domain-based routing does not trigger an extra DNS lookup.
  forceChinaIpDirect: true,

  // Explicit direct pre-rules and mainland IPs take priority over WebRTC protection.
  // Remaining non-CN traffic: reject browser UDP and known STUN/TURN ports in all apps.
  preventWebRtcLeak: true,
  webRtcBrowserProcesses: [
    'chrome.exe',
    'msedge.exe',
    'firefox.exe',
    'brave.exe',
    'opera.exe',
    'vivaldi.exe',
    'chromium.exe',
  ],
  webRtcPorts: ['3478', '3479', '5349', '19302', '19305', '19307'],
  // Reject UDP probes to these domains unless an earlier direct rule or GEOSITE cn exempts them.
  webRtcDomains: [
    'ippure.com',
    'stun.chat.bilibili.com',
    'stun.hitv.com',
    'stun.miwifi.com',
  ],

  // Reuse complete upstream providers and only change their routing target.
  // These explicit overrides take priority over generic WebRTC UDP blocking.
  // This stays current when upstream adds domains and avoids duplicate inline rules.
  ruleSetTargetOverrides: {
    douyu: 'DIRECT',
  },

  // 无法使用日本节点访问的网站（由于日本《著作权法》反盗版严格执法、WAF 盾或网站主动封锁日本 IP 返回 403 Forbidden）
  // 流量将自动路由至「🚫 日本禁用」策略组（自动排除所有日本节点，优先使用港/台/新/美等节点）
  // 同时自动注入海外 DoH 加密解析，防止本地 DNS 污染
  japanBlockedDomains: [
    // 用户指定站点
    'hgamefree.info',

    // 主流 H-Game / ACG 破解与讨论站（规避日本版权调查与取证）
    'erogames.top',
    'gg-games.org',
    'gg-games.net',
    'anime-sharing.com',
    '2djgame.net',
    'acgngame.net',
    'zodgame.xyz',
    'south-plus.net',
    'south-plus.org',

    // 主流生肉/盗版漫画平台（CODA 及各大日本出版社重点打击对象，针对日本 IP 返回 403）
    'rawkuma.com',
    'weloma.art',
    'weloma.net',
    'klmanga.com',
    'klmanga.net',
    'klmanga.co',
    'manga1000.top',
    'manga1001.top',
    'manga1000.com',
    'manga1001.in',
    'senmanga.com',
    'synobamangas.com',
    'sakuramanga.org',
    'rawdevart.com',
    'bato.to',
    'mangakakalot.com',
    'mangakakalot.tv',
    'manganato.com',
    'chapmanganato.to',
    'comick.io',
    'comick.app',

    // 同人漫画/本子资源站（主动屏蔽日本 IP 规避侵权诉讼）
    '18comic.vip',
    '18comic.org',
    'wnacg.com',
    'wnacg.org',
    'hitomi.la',
    'nhentai.net',
    'asmhentai.com',

    // 创作者赞助扒取平台（Fanbox / Fantia 镜像，高频封锁日本 IP）
    'kemono.su',
    'kemono.party',
    'coomer.su',
    'coomer.party',

    // BT 种子发布站（日本境内 ISP/DNS 强制阻断）
    'nyaa.si',

    // 成人视频流媒体（为规避 DMM / Fanza 法律诉讼，主动屏蔽日本 IP 返回 403）
    'missav.com',
    'missav.ai',
    'missav.ws',
    'jable.tv',
    'supjav.com',
    'tktube.com',
    '7mmtv.tv',
    '7mmtv.sx',
    'netflav.com',
    'hpjav.tv',
    'javlibrary.com',
    'cableav.tv',
  ],

  preRules: [
    // Desktop process rules also cover unlisted domains and direct IP connections.
    'PROCESS-NAME,QQ.exe,DIRECT',
    // Thunder processes stay DIRECT even when the domestic group uses a proxy.
    // Connections still pass through TUN; these rules do not bypass the adapter.
    'PROCESS-NAME,Thunder.exe,DIRECT',
    'PROCESS-NAME,ThunderPlatform.exe,DIRECT',
    'PROCESS-NAME,DownloadService.exe,DIRECT',
    'PROCESS-NAME,XLServicePlatform.exe,DIRECT',
    'PROCESS-NAME,xllite.exe,DIRECT',
    'PROCESS-NAME,DownloadSDKServer.exe,DIRECT',
    'PROCESS-NAME,Thunder,DIRECT',

    // Clash Party network info / current IP lookup.
    'DOMAIN-SUFFIX,msftconnecttest.com,DIRECT',
    'DOMAIN-SUFFIX,msftncsi.com,DIRECT',
    'DOMAIN-SUFFIX,ip.sb,🌐 国外网站',
    'DOMAIN-SUFFIX,ipify.org,🌐 国外网站',
    'DOMAIN-SUFFIX,ipinfo.io,🌐 国外网站',
    'DOMAIN-SUFFIX,ipapi.co,🌐 国外网站',
    'DOMAIN-SUFFIX,ip-api.com,🌐 国外网站',
    'DOMAIN-SUFFIX,ipwho.is,🌐 国外网站',
    'DOMAIN-SUFFIX,ident.me,🌐 国外网站',
    'DOMAIN-SUFFIX,icanhazip.com,🌐 国外网站',
    'DOMAIN-SUFFIX,ifconfig.me,🌐 国外网站',
    'DOMAIN-SUFFIX,ippure.com,🌐 国外网站',
    'DOMAIN,ip.cip.cc,DIRECT',
    'DOMAIN,myip.ipip.net,DIRECT',

    // OpenAI / ChatGPT ecosystem: ensure web UI, API, static assets, telemetry, feature flags, and anti-bot challenges route to AI service consistently.
    'DOMAIN-SUFFIX,chatgpt.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,oaistatic.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,oaiusercontent.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,openai.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,ai.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,sora.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,chat.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,api.statsig.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,events.statsigapi.net,🤖 AI 服务',
    'DOMAIN-SUFFIX,featuregates.org,🤖 AI 服务',
    'DOMAIN-SUFFIX,client-api.arkoselabs.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,openai-api.arkoselabs.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,challenges.cloudflare.com,🤖 AI 服务',
    'DOMAIN-SUFFIX,turnstile.cloudflare.com,🤖 AI 服务',

    // Patreon page bootstrap: first party, consent, media, video and chat CDNs.
    'DOMAIN-SUFFIX,patreon.com,🌐 国外网站',
    'DOMAIN-SUFFIX,patreonusercontent.com,🌐 国外网站',
    'DOMAIN-SUFFIX,patreoncommunity.com,🌐 国外网站',
    'DOMAIN-SUFFIX,transcend-cdn.com,🌐 国外网站',
    'DOMAIN-SUFFIX,transcend.io,🌐 国外网站',
    'DOMAIN,patreon-media.s3-accelerate.amazonaws.com,🌐 国外网站',
    'DOMAIN-SUFFIX,mux.com,🌐 国外网站',
    'DOMAIN-SUFFIX,stream-io-api.com,🌐 国外网站',
    'DOMAIN-SUFFIX,stream-io-video.com,🌐 国外网站',

    // Steam download/CDN domains stay DIRECT; store/account/community follow upstream.
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

    // Core mainland game services are intentionally stricter than GAME_CN.
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

    // Mainland code hosting service.
    'DOMAIN-SUFFIX,gitee.com,DIRECT',

    // Xunlei / Thunder services, download infrastructure and login verification.
    'DOMAIN-SUFFIX,xunlei.com,DIRECT',
    'DOMAIN-SUFFIX,xunlei.cn,DIRECT',
    'DOMAIN-SUFFIX,xunleix.com,DIRECT',
    'DOMAIN-SUFFIX,sandai.net,DIRECT',
    'DOMAIN-SUFFIX,thunderurl.com,DIRECT',
    'DOMAIN-SUFFIX,thundercdn.com,DIRECT',
    'DOMAIN-SUFFIX,kanimg.com,DIRECT',
    'DOMAIN-SUFFIX,kankan.com,DIRECT',
    'DOMAIN-SUFFIX,00cdn.com,DIRECT',
    'DOMAIN-SUFFIX,88cdn.com,DIRECT',
    'DOMAIN-SUFFIX,p2cdn.com,DIRECT',
    'DOMAIN-SUFFIX,8uri.cn,DIRECT',
    'DOMAIN-SUFFIX,xycloud.com,DIRECT',
    'DOMAIN-SUFFIX,xycdn.com,DIRECT',
    'DOMAIN-SUFFIX,xlpan.com,DIRECT',

    // Domestic captcha / verification code services used during login (e.g. Tencent Captcha, Geetest).
    'DOMAIN-SUFFIX,tcsecq.com,DIRECT',
    'DOMAIN-SUFFIX,007.qq.com,DIRECT',
    'DOMAIN-SUFFIX,tcaptcha.qq.com,DIRECT',
    'DOMAIN-SUFFIX,captcha.qq.com,DIRECT',
    'DOMAIN-SUFFIX,tcaptcha.gtimg.com,DIRECT',
    'DOMAIN-SUFFIX,captcha.gtimg.com,DIRECT',
    'DOMAIN-SUFFIX,geetest.com,DIRECT',
    'DOMAIN-SUFFIX,dingxiang-inc.com,DIRECT',
  ],

  foreignDnsDomains: [
    '+.chatgpt.com',
    '+.oaistatic.com',
    '+.oaiusercontent.com',
    '+.openai.com',
    '+.ai.com',
    '+.sora.com',
    '+.chat.com',
    '+.statsig.com',
    '+.statsigapi.net',
    '+.featuregates.org',
    '+.arkoselabs.com',
    '+.patreon.com',
    '+.patreonusercontent.com',
    '+.patreoncommunity.com',
    '+.transcend-cdn.com',
    '+.transcend.io',
    'patreon-media.s3-accelerate.amazonaws.com',
    '+.mux.com',
    '+.stream-io-api.com',
    '+.stream-io-video.com',
    '+.ippure.com',
  ],
}
