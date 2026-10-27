// Configuration spec for Clash Party / Mihomo Lite override.
// Designed for users with stable nodes: manual selection (select) keeps a fixed
// exit IP to avoid AI/developer account risk controls and unnecessary probes.
// Rules are prepended in order; foreignDnsDomains are resolved with overseas DoH.
const CUSTOM_OVERRIDE_SPEC = {
  // Mainland IP direct routing follows AI/browser guards and service exceptions,
  // but precedes the remaining strict UDP and hostname-less TCP fallback.
  // no-resolve is preserved so domain-based routing does not trigger an extra DNS lookup.
  forceChinaIpDirect: true,

  // strict: block remaining UDP after domestic games/downloads and China IP DIRECT.
  // compatible: block AI/browser UDP and STUN/TURN, allow other apps' QUIC.
  preventWebRtcLeak: true,
  webRtcMode: 'strict',
  // Process supplements for games using unlisted hosts or direct overseas IPs.
  // Domestic game domains/providers and mainland IPs are handled as a category.
  processTargetOverrides: {
    'dota2.exe': 'DIRECT',
    dota2: 'DIRECT',
    'ZenlessZoneZero.exe': 'DIRECT',
    'YuanShen.exe': 'DIRECT',
    'StarRail.exe': 'DIRECT',
  },
  // Entire upstream mainland-game categories remain DIRECT, independent of UI selection.
  directRuleSets: ['scki-fused-014-game-cn-domain', 'scki-fused-070-game-cn-domain'],
  // select requires Party's built-in Smart override OFF. party-smart lets Party
  // convert only the foreign url-test group, preserving domestic/non-JP targets.
  foreignSelection: 'select',
  webRtcBrowserProcesses: [
    'chrome.exe',
    'msedge.exe',
    'firefox.exe',
    'brave.exe',
    'opera.exe',
    'vivaldi.exe',
    'chromium.exe',
    'arc.exe',
    'zen.exe',
    'dia.exe',
    'comet.exe',
    'atlas.exe',
    'chrome',
    'msedge',
    'firefox',
    'brave',
    'Brave Browser',
    'Google Chrome',
    'Microsoft Edge',
    'Safari',
    'Arc',
    'Zen',
    'Dia',
    'Comet',
  ],
  webRtcPorts: ['3478', '3479', '3480', '3481', '5349', '19302', '19303', '19304', '19305', '19306', '19307', '19308', '19309'],
  // Probe destinations have no CN exemption. Strict mode also blocks their TCP.
  webRtcDomains: [
    'ippure.com',
    'stun.chat.bilibili.com',
    'stun.hitv.com',
    'stun.miwifi.com',
  ],

  // Reuse complete upstream providers and only change their routing target.
  // These explicit overrides follow the selected privacy protections.
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

    // Login/community are explicitly proxied, including CM (not a download CDN).
    'DOMAIN-SUFFIX,steampowered.com,🌐 国外节点',
    'DOMAIN-SUFFIX,steamcommunity.com,🌐 国外节点',
    'DOMAIN-SUFFIX,steam-chat.com,🌐 国外节点',
    'DOMAIN-SUFFIX,steamusercontent.com,🌐 国外节点',
    'DOMAIN-SUFFIX,steamuserimages-a.akamaihd.net,🌐 国外节点',
    // Downloads stay DIRECT even when requested by steam.exe / steamwebhelper.exe.
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

  // Additional overseas domains folded into lite-ai + proxied DoH (AI services are maintained in scripts/ai-services.json).
  foreignDnsDomains: [
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
