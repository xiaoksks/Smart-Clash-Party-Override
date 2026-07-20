// Single source of truth for local behavior layered on top of Smart-Config-Kit.
// Rules are prepended in order; foreignDnsDomains are resolved with overseas DoH.
const CUSTOM_OVERRIDE_SPEC = {
  // Keep upstream routing intact, but omit its ad-blocking policy, rules and providers.
  removeAdBlocking: true,

  preRules: [
    // QQ Favorites may call unlisted domains or direct IPs; keep the desktop client fully direct.
    'PROCESS-NAME,QQ.exe,DIRECT',

    // Clash Party network info / current IP lookup.
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
