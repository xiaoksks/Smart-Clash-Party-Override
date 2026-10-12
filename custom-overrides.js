// Single source of truth for local behavior layered on top of Smart-Config-Kit.
// Rules are prepended in order; foreignDnsDomains are resolved with overseas DoH.
const CUSTOM_OVERRIDE_SPEC = {
  // Keep upstream routing intact, but omit its ad-blocking policy, rules and providers.
  removeAdBlocking: true,

  // Route authoritative mainland China IP ranges directly before service-specific IP rules.
  // no-resolve is preserved so domain-based routing does not trigger an extra DNS lookup.
  forceChinaIpDirect: true,

  // Capture browser traffic in TUN, reject overseas browser UDP (non-cn) and block common STUN/TURN ports while allowing domestic DIRECT traffic.
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

  // Processes excluded from TUN virtual network adapter at the kernel driver level.
  // P2P downloaders establish massive concurrent direct connections; bypassing TUN directly
  // eliminates virtual adapter protocol stack overhead and reduces CPU utilization.
  // Note: WebRTC browser processes are strictly forbidden here to maintain leak protection.
  tunExcludeProcesses: [
    'Thunder.exe',
    'ThunderPlatform.exe',
    'DownloadService.exe',
    'XLServicePlatform.exe',
    'xllite.exe',
    'DownloadSDKServer.exe',
  ],

  // Reuse complete upstream providers and only change their routing target.
  // These explicit overrides take priority over generic WebRTC UDP blocking.
  // This stays current when upstream adds domains and avoids duplicate inline rules.
  ruleSetTargetOverrides: {
    douyu: 'DIRECT',
  },

  preRules: [
    // Desktop clients that may call unlisted domains or direct IPs; keep fully direct.
    'PROCESS-NAME,QQ.exe,DIRECT',
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
    'DOMAIN,ip.cip.cc,DIRECT',
    'DOMAIN,myip.ipip.net,DIRECT',

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
    '+.patreon.com',
    '+.patreonusercontent.com',
    '+.patreoncommunity.com',
    '+.transcend-cdn.com',
    '+.transcend.io',
    'patreon-media.s3-accelerate.amazonaws.com',
    '+.mux.com',
    '+.stream-io-api.com',
    '+.stream-io-video.com',
  ],
}
