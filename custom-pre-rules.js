// Rules inserted at the very beginning of injectRules(config).
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

  // Patreon is Cloudflare-fronted and can be flaky when it falls through to
  // DIRECT/final routing or gets caught by the generic overseas QUIC reject.
  'DOMAIN-SUFFIX,patreon.com,🌐 国外网站',
  'DOMAIN-SUFFIX,patreonusercontent.com,🌐 国外网站',
  'DOMAIN-SUFFIX,patreoncommunity.com,🌐 国外网站',

  // Chrome Gemini is more region-sensitive than the normal Gemini web app.
  // Prefer a supported US exit instead of the generic AI group, which may pick EU.
  'DOMAIN,gemini.google.com,🇺🇸 美国节点',
  'DOMAIN,bard.google.com,🇺🇸 美国节点',
  'DOMAIN,content-push.googleapis.com,🇺🇸 美国节点',
  'DOMAIN-SUFFIX,generativelanguage.googleapis.com,🇺🇸 美国节点',
  'DOMAIN-SUFFIX,aistudio.google.com,🇺🇸 美国节点',
  'DOMAIN-SUFFIX,ai.google.dev,🇺🇸 美国节点',
  'DOMAIN-SUFFIX,makersuite.google.com,🇺🇸 美国节点',

  // Steam download/CDN domains: keep downloads and static assets DIRECT,
  // while community/store/account domains continue to follow upstream rules.
  'DOMAIN-SUFFIX,steamcdn-a.akamaihd.net,DIRECT',
  'DOMAIN-SUFFIX,steampipe.akamaized.net,DIRECT',
  'DOMAIN-SUFFIX,steamcontent.com,DIRECT',
  'DOMAIN-SUFFIX,steamserver.net,DIRECT',
  'DOMAIN-SUFFIX,steamstatic.com,DIRECT',

  // Zenless Zone Zero mainland China site. Upstream HoYoverse rules classify
  // juequling.com as overseas game, but CN service should stay DIRECT.
  'DOMAIN-SUFFIX,juequling.com,DIRECT',
]
