// Rules inserted at the beginning of the generated rule list.
// Keep this file small and personal; rules here override all upstream rules.
const CUSTOM_PRE_RULES = [
  // Clash Party network info / current IP lookup.
  // Keep foreign IP check APIs on proxy so the result reflects the selected exit IP.
  'DOMAIN-SUFFIX,ip.sb,🌐 国外网站',
  'DOMAIN-SUFFIX,api.ipify.org,🌐 国外网站',
  'DOMAIN-SUFFIX,ipify.org,🌐 国外网站',
  'DOMAIN-SUFFIX,ipinfo.io,🌐 国外网站',
  'DOMAIN-SUFFIX,ipapi.co,🌐 国外网站',
  'DOMAIN-SUFFIX,ip-api.com,🌐 国外网站',
  'DOMAIN-SUFFIX,ipwho.is,🌐 国外网站',
  'DOMAIN-SUFFIX,ident.me,🌐 国外网站',
  'DOMAIN-SUFFIX,icanhazip.com,🌐 国外网站',
  'DOMAIN-SUFFIX,ifconfig.me,🌐 国外网站',
  // Keep China-friendly IP check APIs direct as a fallback.
  'DOMAIN,ip.cip.cc,DIRECT',
  'DOMAIN,myip.ipip.net,DIRECT',

  // High-priority DIRECT guards promoted from upstream's later rule sections.
  // These avoid being shadowed by broad mail/work/foreign-site rules or QUIC handling.
  'DOMAIN-SUFFIX,mail.qq.com,DIRECT',
  'DOMAIN-SUFFIX,mail.163.com,DIRECT',
  'DOMAIN-SUFFIX,mail.126.com,DIRECT',
  'DOMAIN-SUFFIX,mail.sina.com.cn,DIRECT',
  'DOMAIN-SUFFIX,mail.aliyun.com,DIRECT',
  'DOMAIN-SUFFIX,feishu.cn,DIRECT',
  'DOMAIN-SUFFIX,dingtalk.com,DIRECT',
  'DOMAIN-SUFFIX,welink.huaweicloud.com,DIRECT',
  'DOMAIN-SUFFIX,bbys.app,DIRECT',

  // Patreon is Cloudflare-fronted and loads consent, media, video, and
  // community data from third-party CDNs. Keep the whole critical request
  // chain ahead of upstream ad rules and the generic overseas QUIC reject.
  'DOMAIN-SUFFIX,patreon.com,🌐 国外网站',
  'DOMAIN-SUFFIX,patreonusercontent.com,🌐 国外网站',
  'DOMAIN-SUFFIX,patreoncommunity.com,🌐 国外网站',
  'DOMAIN-SUFFIX,transcend-cdn.com,🌐 国外网站',
  'DOMAIN-SUFFIX,transcend.io,🌐 国外网站',
  'DOMAIN,patreon-media.s3-accelerate.amazonaws.com,🌐 国外网站',
  'DOMAIN-SUFFIX,mux.com,🌐 国外网站',
  'DOMAIN-SUFFIX,stream-io-api.com,🌐 国外网站',
  'DOMAIN-SUFFIX,stream-io-video.com,🌐 国外网站',

  // Steam download/CDN domains: keep downloads and static assets DIRECT,
  // while community/store/account domains continue to follow upstream rules.
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

  // Mainland China game services. Upstream v6 fused rules route these through
  // the selectable "domestic games" policy; pin core CN game domains to DIRECT.
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
