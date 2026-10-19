// Clash Party / Mihomo Override - Lite 极简版
// 核心三策略组：「🌐 国外节点」、「🚫 日本禁用」、「🇨🇳 国内节点」，全本地自主维护
// 自定义规则与配置请编辑 custom-overrides.js，然后运行 npm run check

const LITE_RULES = [
  "RULE-SET,local-douyu,🇨🇳 国内节点",
  "PROCESS-NAME,QQ.exe,🇨🇳 国内节点",
  "PROCESS-NAME,Thunder.exe,🇨🇳 国内节点",
  "PROCESS-NAME,ThunderPlatform.exe,🇨🇳 国内节点",
  "PROCESS-NAME,DownloadService.exe,🇨🇳 国内节点",
  "PROCESS-NAME,XLServicePlatform.exe,🇨🇳 国内节点",
  "PROCESS-NAME,xllite.exe,🇨🇳 国内节点",
  "PROCESS-NAME,DownloadSDKServer.exe,🇨🇳 国内节点",
  "PROCESS-NAME,Thunder,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,msftconnecttest.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,msftncsi.com,🇨🇳 国内节点",
  "DOMAIN,ip.cip.cc,🇨🇳 国内节点",
  "DOMAIN,myip.ipip.net,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steamcdn-a.akamaihd.net,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steampipe.akamaized.net,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steampipe-kr.akamaized.net,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steampipe-partner.akamaized.net,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steamcontent.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steamcontent.tnkjmec.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steamserver.net,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steamstatic.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,cdn-ali.content.steamchina.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,cdn-qc.content.steamchina.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,cdn-ws.content.steamchina.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,cm.steampowered.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,dl.steam.clngaa.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,dl.steam.ksyna.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,st.dl.bscstorage.net,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,st.dl.eccdnx.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,st.dl.pinyuncloud.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steampowered.com.8686c.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,steamstatic.com.8686c.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,wmsjsteam.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,xz.pphimalayanrt.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,mihoyo.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,miyoushe.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,yuanshen.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,bhsr.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,zenlesszonezero.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,juequling.com,🇨🇳 国内节点",
  "DOMAIN,game.163.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,gm.163.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,ds.163.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,nie.163.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,netease.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,wegame.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,wegame.com.cn,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,perfect-world.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,wanmei.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,xd.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,taptap.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,taptap.io,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,papegames.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,hypergryph.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,gryphline.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,lilith.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,gitee.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,xunlei.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,xunlei.cn,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,xunleix.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,sandai.net,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,thunderurl.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,thundercdn.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,kanimg.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,kankan.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,00cdn.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,88cdn.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,p2cdn.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,8uri.cn,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,xycloud.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,xycdn.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,xlpan.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,tcsecq.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,007.qq.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,tcaptcha.qq.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,captcha.qq.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,tcaptcha.gtimg.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,captcha.gtimg.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,geetest.com,🇨🇳 国内节点",
  "DOMAIN-SUFFIX,dingxiang-inc.com,🇨🇳 国内节点",
  "AND,((PROCESS-NAME,chrome.exe),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT",
  "AND,((PROCESS-NAME,msedge.exe),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT",
  "AND,((PROCESS-NAME,firefox.exe),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT",
  "AND,((PROCESS-NAME,brave.exe),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT",
  "AND,((PROCESS-NAME,opera.exe),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT",
  "AND,((PROCESS-NAME,vivaldi.exe),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT",
  "AND,((PROCESS-NAME,chromium.exe),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT",
  "DST-PORT,3478,REJECT",
  "DST-PORT,3479,REJECT",
  "DST-PORT,5349,REJECT",
  "DST-PORT,19302,REJECT",
  "DST-PORT,19305,REJECT",
  "DST-PORT,19307,REJECT",
  "AND,((DOMAIN-KEYWORD,stun),(NETWORK,UDP)),REJECT",
  "AND,((DOMAIN-SUFFIX,ippure.com),(NETWORK,UDP)),REJECT",
  "AND,((DOMAIN-SUFFIX,stun.chat.bilibili.com),(NETWORK,UDP)),REJECT",
  "AND,((DOMAIN-SUFFIX,stun.hitv.com),(NETWORK,UDP)),REJECT",
  "AND,((DOMAIN-SUFFIX,stun.miwifi.com),(NETWORK,UDP)),REJECT",
  "DOMAIN-SUFFIX,hgamefree.info,🚫 日本禁用",
  "DOMAIN-SUFFIX,erogames.top,🚫 日本禁用",
  "DOMAIN-SUFFIX,gg-games.org,🚫 日本禁用",
  "DOMAIN-SUFFIX,gg-games.net,🚫 日本禁用",
  "DOMAIN-SUFFIX,anime-sharing.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,2djgame.net,🚫 日本禁用",
  "DOMAIN-SUFFIX,acgngame.net,🚫 日本禁用",
  "DOMAIN-SUFFIX,zodgame.xyz,🚫 日本禁用",
  "DOMAIN-SUFFIX,south-plus.net,🚫 日本禁用",
  "DOMAIN-SUFFIX,south-plus.org,🚫 日本禁用",
  "DOMAIN-SUFFIX,rawkuma.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,weloma.art,🚫 日本禁用",
  "DOMAIN-SUFFIX,weloma.net,🚫 日本禁用",
  "DOMAIN-SUFFIX,klmanga.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,klmanga.net,🚫 日本禁用",
  "DOMAIN-SUFFIX,klmanga.co,🚫 日本禁用",
  "DOMAIN-SUFFIX,manga1000.top,🚫 日本禁用",
  "DOMAIN-SUFFIX,manga1001.top,🚫 日本禁用",
  "DOMAIN-SUFFIX,manga1000.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,manga1001.in,🚫 日本禁用",
  "DOMAIN-SUFFIX,senmanga.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,synobamangas.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,sakuramanga.org,🚫 日本禁用",
  "DOMAIN-SUFFIX,rawdevart.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,bato.to,🚫 日本禁用",
  "DOMAIN-SUFFIX,mangakakalot.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,mangakakalot.tv,🚫 日本禁用",
  "DOMAIN-SUFFIX,manganato.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,chapmanganato.to,🚫 日本禁用",
  "DOMAIN-SUFFIX,comick.io,🚫 日本禁用",
  "DOMAIN-SUFFIX,comick.app,🚫 日本禁用",
  "DOMAIN-SUFFIX,18comic.vip,🚫 日本禁用",
  "DOMAIN-SUFFIX,18comic.org,🚫 日本禁用",
  "DOMAIN-SUFFIX,wnacg.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,wnacg.org,🚫 日本禁用",
  "DOMAIN-SUFFIX,hitomi.la,🚫 日本禁用",
  "DOMAIN-SUFFIX,nhentai.net,🚫 日本禁用",
  "DOMAIN-SUFFIX,asmhentai.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,kemono.su,🚫 日本禁用",
  "DOMAIN-SUFFIX,kemono.party,🚫 日本禁用",
  "DOMAIN-SUFFIX,coomer.su,🚫 日本禁用",
  "DOMAIN-SUFFIX,coomer.party,🚫 日本禁用",
  "DOMAIN-SUFFIX,nyaa.si,🚫 日本禁用",
  "DOMAIN-SUFFIX,missav.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,missav.ai,🚫 日本禁用",
  "DOMAIN-SUFFIX,missav.ws,🚫 日本禁用",
  "DOMAIN-SUFFIX,jable.tv,🚫 日本禁用",
  "DOMAIN-SUFFIX,supjav.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,tktube.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,7mmtv.tv,🚫 日本禁用",
  "DOMAIN-SUFFIX,7mmtv.sx,🚫 日本禁用",
  "DOMAIN-SUFFIX,netflav.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,hpjav.tv,🚫 日本禁用",
  "DOMAIN-SUFFIX,javlibrary.com,🚫 日本禁用",
  "DOMAIN-SUFFIX,cableav.tv,🚫 日本禁用",
  "RULE-SET,scki-fused-075-cn-site-ipcidr-no-resolve,🇨🇳 国内节点,no-resolve",
  "DOMAIN-SUFFIX,ip.sb,🌐 国外节点",
  "DOMAIN-SUFFIX,ipify.org,🌐 国外节点",
  "DOMAIN-SUFFIX,ipinfo.io,🌐 国外节点",
  "DOMAIN-SUFFIX,ipapi.co,🌐 国外节点",
  "DOMAIN-SUFFIX,ip-api.com,🌐 国外节点",
  "DOMAIN-SUFFIX,ipwho.is,🌐 国外节点",
  "DOMAIN-SUFFIX,ident.me,🌐 国外节点",
  "DOMAIN-SUFFIX,icanhazip.com,🌐 国外节点",
  "DOMAIN-SUFFIX,ifconfig.me,🌐 国外节点",
  "DOMAIN-SUFFIX,ippure.com,🌐 国外节点",
  "DOMAIN-SUFFIX,chatgpt.com,🌐 国外节点",
  "DOMAIN-SUFFIX,oaistatic.com,🌐 国外节点",
  "DOMAIN-SUFFIX,oaiusercontent.com,🌐 国外节点",
  "DOMAIN-SUFFIX,openai.com,🌐 国外节点",
  "DOMAIN-SUFFIX,ai.com,🌐 国外节点",
  "DOMAIN-SUFFIX,sora.com,🌐 国外节点",
  "DOMAIN-SUFFIX,chat.com,🌐 国外节点",
  "DOMAIN-SUFFIX,api.statsig.com,🌐 国外节点",
  "DOMAIN-SUFFIX,events.statsigapi.net,🌐 国外节点",
  "DOMAIN-SUFFIX,featuregates.org,🌐 国外节点",
  "DOMAIN-SUFFIX,client-api.arkoselabs.com,🌐 国外节点",
  "DOMAIN-SUFFIX,openai-api.arkoselabs.com,🌐 国外节点",
  "DOMAIN-SUFFIX,challenges.cloudflare.com,🌐 国外节点",
  "DOMAIN-SUFFIX,turnstile.cloudflare.com,🌐 国外节点",
  "DOMAIN-SUFFIX,patreon.com,🌐 国外节点",
  "DOMAIN-SUFFIX,patreonusercontent.com,🌐 国外节点",
  "DOMAIN-SUFFIX,patreoncommunity.com,🌐 国外节点",
  "DOMAIN-SUFFIX,transcend-cdn.com,🌐 国外节点",
  "DOMAIN-SUFFIX,transcend.io,🌐 国外节点",
  "DOMAIN,patreon-media.s3-accelerate.amazonaws.com,🌐 国外节点",
  "DOMAIN-SUFFIX,mux.com,🌐 国外节点",
  "DOMAIN-SUFFIX,stream-io-api.com,🌐 国外节点",
  "DOMAIN-SUFFIX,stream-io-video.com,🌐 国外节点",
  "RULE-SET,scki-fused-001-direct-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-002-intl-site-domain,🌐 国外节点",
  "RULE-SET,scki-fused-003-payments-domain,🌐 国外节点",
  "RULE-SET,scki-fused-004-ai-domain,🌐 国外节点",
  "RULE-SET,scki-fused-005-cnmedia-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-006-cn-site-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-007-stream-jpkr-domain,🌐 国外节点",
  "RULE-SET,scki-fused-008-social-domain,🌐 国外节点",
  "RULE-SET,scki-fused-008-social-residual,🌐 国外节点",
  "RULE-SET,scki-fused-009-tiktok-domain,🌐 国外节点",
  "RULE-SET,scki-fused-009-tiktok-residual,🌐 国外节点",
  "RULE-SET,scki-fused-011-tools-domain,🌐 国外节点",
  "RULE-SET,scki-fused-012-intl-site-domain,🌐 国外节点",
  "RULE-SET,scki-fused-013-ai-domain,🌐 国外节点",
  "RULE-SET,scki-fused-014-game-cn-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-015-microsoft-domain,🌐 国外节点",
  "RULE-SET,scki-fused-015-microsoft-residual,🌐 国外节点",
  "RULE-SET,scki-fused-017-cn-site-domain,🇨🇳 国内节点",
  "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,youtube)),🌐 国外节点",
  "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,google)),🌐 国外节点",
  "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,microsoft)),🌐 国外节点",
  "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,apple)),🌐 国外节点",
  "AND,((DST-PORT,443),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT",
  "DST-PORT,7680,REJECT",
  "RULE-SET,scki-fused-018-direct-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-018-direct-ipcidr-no-resolve,🇨🇳 国内节点,no-resolve",
  "RULE-SET,scki-fused-018-direct-residual,🇨🇳 国内节点",
  "RULE-SET,scki-fused-019-work-residual,🌐 国外节点",
  "DST-PORT,26880,🇨🇳 国内节点",
  "DST-PORT,6540,🇨🇳 国内节点",
  "DST-PORT,33068,🇨🇳 国内节点",
  "DST-PORT,123,🇨🇳 国内节点",
  "RULE-SET,scki-fused-020-crypto-domain,🌐 国外节点",
  "RULE-SET,scki-fused-021-gfw-domain,🌐 国外节点",
  "RULE-SET,scki-fused-022-youtube-domain,🌐 国外节点",
  "RULE-SET,scki-fused-023-ai-domain,🌐 国外节点",
  "RULE-SET,scki-fused-024-google-domain,🌐 国外节点",
  "RULE-SET,scki-fused-024-google-residual,🌐 国外节点",
  "RULE-SET,scki-fused-025-work-domain,🌐 国外节点",
  "RULE-SET,scki-fused-026-ai-domain,🌐 国外节点",
  "RULE-SET,scki-fused-026-ai-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-026-ai-residual,🌐 国外节点",
  "RULE-SET,scki-fused-027-intl-site-domain,🌐 国外节点",
  "RULE-SET,scki-fused-028-im-domain,🌐 国外节点",
  "RULE-SET,scki-fused-029-work-domain,🌐 国外节点",
  "RULE-SET,scki-fused-030-download-domain,🌐 国外节点",
  "RULE-SET,scki-fused-030-download-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-030-download-residual,🌐 国外节点",
  "RULE-SET,scki-fused-031-google-domain,🌐 国外节点",
  "RULE-SET,scki-fused-031-google-ipcidr-no-resolve,🌐 国外节点,no-resolve",
  "AND,((PROCESS-NAME,Code Helper),(DOMAIN,api.github.com)),🌐 国外节点",
  "AND,((PROCESS-NAME,Code Helper (Plugin)),(DOMAIN,api.github.com)),🌐 国外节点",
  "RULE-SET,scki-fused-032-tools-domain,🌐 国外节点",
  "RULE-SET,scki-fused-033-ai-domain,🌐 国外节点",
  "RULE-SET,scki-fused-033-ai-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-033-ai-ipcidr-no-resolve,🌐 国外节点,no-resolve",
  "RULE-SET,scki-fused-033-ai-residual,🌐 国外节点",
  "RULE-SET,scki-fused-034-google-domain,🌐 国外节点",
  "RULE-SET,scki-fused-035-ai-domain,🌐 国外节点",
  "RULE-SET,scki-fused-035-ai-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-035-ai-residual,🌐 国外节点",
  "RULE-SET,scki-fused-036-crypto-domain,🌐 国外节点",
  "RULE-SET,scki-fused-036-crypto-residual,🌐 国外节点",
  "RULE-SET,scki-fused-037-payments-domain,🌐 国外节点",
  "RULE-SET,scki-fused-037-payments-residual,🌐 国外节点",
  "RULE-SET,scki-fused-039-intl-site-domain,🌐 国外节点",
  "RULE-SET,scki-fused-040-direct-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-041-im-domain,🌐 国外节点",
  "RULE-SET,scki-fused-041-im-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-041-im-ipcidr-no-resolve,🌐 国外节点,no-resolve",
  "RULE-SET,scki-fused-041-im-residual,🌐 国外节点",
  "RULE-SET,scki-fused-042-social-domain,🌐 国外节点",
  "RULE-SET,scki-fused-042-social-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-042-social-ipcidr-no-resolve,🌐 国外节点,no-resolve",
  "RULE-SET,scki-fused-042-social-residual,🌐 国外节点",
  "RULE-SET,scki-fused-043-cn-site-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-044-social-domain,🌐 国外节点",
  "RULE-SET,scki-fused-045-work-domain,🌐 国外节点",
  "RULE-SET,scki-fused-045-work-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-045-work-residual,🌐 国外节点",
  "RULE-SET,scki-fused-046-direct-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-047-cnmedia-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-048-tiktok-domain,🌐 国外节点",
  "RULE-SET,scki-fused-049-youtube-domain,🌐 国外节点",
  "RULE-SET,scki-fused-050-netflix-domain,🌐 国外节点",
  "RULE-SET,scki-fused-050-netflix-ipcidr-no-resolve,🌐 国外节点,no-resolve",
  "RULE-SET,scki-fused-051-disney-domain,🌐 国外节点",
  "RULE-SET,scki-fused-051-disney-residual,🌐 国外节点",
  "RULE-SET,scki-fused-052-hbo-max-domain,🌐 国外节点",
  "RULE-SET,scki-fused-052-hbo-max-residual,🌐 国外节点",
  "RULE-SET,scki-fused-053-hulu-domain,🌐 国外节点",
  "RULE-SET,scki-fused-053-hulu-residual,🌐 国外节点",
  "RULE-SET,scki-fused-054-prime-video-domain,🌐 国外节点",
  "RULE-SET,scki-fused-054-prime-video-residual,🌐 国外节点",
  "RULE-SET,scki-fused-055-intl-site-domain,🌐 国外节点",
  "RULE-SET,scki-fused-055-intl-site-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-055-intl-site-residual,🌐 国外节点",
  "RULE-SET,scki-fused-056-music-domain,🌐 国外节点",
  "RULE-SET,scki-fused-056-music-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-057-stream-hk-domain,🌐 国外节点",
  "RULE-SET,scki-fused-057-stream-hk-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-057-stream-hk-residual,🌐 国外节点",
  "RULE-SET,scki-fused-058-stream-tw-domain,🌐 国外节点",
  "RULE-SET,scki-fused-058-stream-tw-residual,🌐 国外节点",
  "RULE-SET,scki-fused-059-stream-jpkr-domain,🌐 国外节点",
  "RULE-SET,scki-fused-059-stream-jpkr-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-059-stream-jpkr-residual,🌐 国外节点",
  "RULE-SET,scki-fused-060-stream-eu-domain,🌐 国外节点",
  "RULE-SET,scki-fused-060-stream-eu-residual,🌐 国外节点",
  "RULE-SET,scki-fused-061-stream-other-domain,🌐 国外节点",
  "RULE-SET,scki-fused-061-stream-other-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-061-stream-other-residual,🌐 国外节点",
  "RULE-SET,scki-fused-062-tools-domain,🌐 国外节点",
  "RULE-SET,scki-fused-063-google-domain,🌐 国外节点",
  "RULE-SET,scki-fused-064-tools-domain,🌐 国外节点",
  "RULE-SET,scki-fused-064-tools-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-064-tools-residual,🌐 国外节点",
  "RULE-SET,scki-fused-065-microsoft-domain,🌐 国外节点",
  "RULE-SET,scki-fused-065-microsoft-residual,🌐 国外节点",
  "RULE-SET,scki-fused-066-apple-domain,🌐 国外节点",
  "RULE-SET,scki-fused-066-apple-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-066-apple-residual,🌐 国外节点",
  "RULE-SET,scki-fused-067-download-domain,🌐 国外节点",
  "RULE-SET,scki-fused-067-download-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-067-download-residual,🌐 国外节点",
  "RULE-SET,scki-fused-068-tracker-domain,🌐 国外节点",
  "RULE-SET,scki-fused-068-tracker-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-068-tracker-residual,🌐 国外节点",
  "RULE-SET,scki-fused-069-gfw-domain,🌐 国外节点",
  "RULE-SET,scki-fused-069-gfw-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-069-gfw-residual,🌐 国外节点",
  "RULE-SET,scki-fused-070-game-cn-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-071-game-intl-domain,🌐 国外节点",
  "RULE-SET,scki-fused-071-game-intl-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-071-game-intl-residual,🌐 国外节点",
  "RULE-SET,scki-fused-072-intl-site-domain,🌐 国外节点",
  "RULE-SET,scki-fused-072-intl-site-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-072-intl-site-residual,🌐 国外节点",
  "RULE-SET,scki-fused-073-payments-domain,🌐 国外节点",
  "RULE-SET,scki-fused-074-cnmedia-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-074-cnmedia-ipcidr,🇨🇳 国内节点",
  "RULE-SET,scki-fused-074-cnmedia-residual,🇨🇳 国内节点",
  "RULE-SET,scki-fused-075-cn-site-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-076-direct-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-077-cn-site-domain,🇨🇳 国内节点",
  "RULE-SET,scki-fused-077-cn-site-residual,🇨🇳 国内节点",
  "RULE-SET,scki-fused-078-intl-site-domain,🌐 国外节点",
  "RULE-SET,scki-fused-078-intl-site-ipcidr,🌐 国外节点",
  "RULE-SET,scki-fused-078-intl-site-ipcidr-no-resolve,🌐 国外节点,no-resolve",
  "RULE-SET,scki-fused-078-intl-site-residual,🌐 国外节点",
  "RULE-SET,scki-fused-079-im-residual,🌐 国外节点",
  "RULE-SET,scki-fused-080-netflix-residual,🌐 国外节点",
  "RULE-SET,scki-fused-081-social-residual,🌐 国外节点",
  "RULE-SET,scki-fused-082-google-residual,🌐 国外节点",
  "MATCH,🌐 国外节点"
]
const LITE_RULE_PROVIDERS = {
  "local-douyu": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/douyu.mrs?scki=v6.0.20-normal.20",
    "path": "./ruleset/local/v6.0.20-normal.20/douyu.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-001-direct-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-001-direct-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-001-direct-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-002-intl-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-002-intl-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-002-intl-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-003-payments-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-003-payments-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-003-payments-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-004-ai-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-004-ai-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-004-ai-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-005-cnmedia-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-005-cnmedia-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-005-cnmedia-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-006-cn-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-006-cn-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-006-cn-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-007-stream-jpkr-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-007-stream-jpkr-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-007-stream-jpkr-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-008-social-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-008-social-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-008-social-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-008-social-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-008-social-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-008-social-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-009-tiktok-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-009-tiktok-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-009-tiktok-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-009-tiktok-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-009-tiktok-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-009-tiktok-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-011-tools-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-011-tools-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-011-tools-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-012-intl-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-012-intl-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-012-intl-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-013-ai-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-013-ai-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-013-ai-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-014-game-cn-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-014-game-cn-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-014-game-cn-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-015-microsoft-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-015-microsoft-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-015-microsoft-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-015-microsoft-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-015-microsoft-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-015-microsoft-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-017-cn-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-017-cn-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-017-cn-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-018-direct-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-018-direct-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-018-direct-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-018-direct-ipcidr-no-resolve": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-018-direct-ipcidr-no-resolve.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-018-direct-ipcidr-no-resolve.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-018-direct-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-018-direct-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-018-direct-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-019-work-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-019-work-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-019-work-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-020-crypto-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-020-crypto-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-020-crypto-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-021-gfw-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-021-gfw-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-021-gfw-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-022-youtube-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-022-youtube-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-022-youtube-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-023-ai-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-023-ai-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-023-ai-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-024-google-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-024-google-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-024-google-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-024-google-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-024-google-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-024-google-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-025-work-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-025-work-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-025-work-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-026-ai-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-026-ai-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-026-ai-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-026-ai-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-026-ai-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-026-ai-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-026-ai-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-026-ai-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-026-ai-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-027-intl-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-027-intl-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-027-intl-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-028-im-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-028-im-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-028-im-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-029-work-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-029-work-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-029-work-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-030-download-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-030-download-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-030-download-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-030-download-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-030-download-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-030-download-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-030-download-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-030-download-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-030-download-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-031-google-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-031-google-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-031-google-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-031-google-ipcidr-no-resolve": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-031-google-ipcidr-no-resolve.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-031-google-ipcidr-no-resolve.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-032-tools-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-032-tools-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-032-tools-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-033-ai-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-033-ai-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-033-ai-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-033-ai-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-033-ai-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-033-ai-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-033-ai-ipcidr-no-resolve": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-033-ai-ipcidr-no-resolve.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-033-ai-ipcidr-no-resolve.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-033-ai-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-033-ai-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-033-ai-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-034-google-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-034-google-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-034-google-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-035-ai-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-035-ai-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-035-ai-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-035-ai-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-035-ai-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-035-ai-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-035-ai-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-035-ai-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-035-ai-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-036-crypto-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-036-crypto-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-036-crypto-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-036-crypto-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-036-crypto-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-036-crypto-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-037-payments-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-037-payments-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-037-payments-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-037-payments-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-037-payments-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-037-payments-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-039-intl-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-039-intl-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-039-intl-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-040-direct-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-040-direct-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-040-direct-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-041-im-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-041-im-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-041-im-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-041-im-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-041-im-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-041-im-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-041-im-ipcidr-no-resolve": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-041-im-ipcidr-no-resolve.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-041-im-ipcidr-no-resolve.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-041-im-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-041-im-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-041-im-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-042-social-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-042-social-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-042-social-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-042-social-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-042-social-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-042-social-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-042-social-ipcidr-no-resolve": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-042-social-ipcidr-no-resolve.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-042-social-ipcidr-no-resolve.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-042-social-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-042-social-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-042-social-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-043-cn-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-043-cn-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-043-cn-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-044-social-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-044-social-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-044-social-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-045-work-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-045-work-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-045-work-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-045-work-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-045-work-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-045-work-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-045-work-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-045-work-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-045-work-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-046-direct-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-046-direct-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-046-direct-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-047-cnmedia-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-047-cnmedia-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-047-cnmedia-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-048-tiktok-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-048-tiktok-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-048-tiktok-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-049-youtube-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-049-youtube-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-049-youtube-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-050-netflix-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-050-netflix-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-050-netflix-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-050-netflix-ipcidr-no-resolve": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-050-netflix-ipcidr-no-resolve.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-050-netflix-ipcidr-no-resolve.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-051-disney-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-051-disney-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-051-disney-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-051-disney-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-051-disney-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-051-disney-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-052-hbo-max-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-052-hbo-max-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-052-hbo-max-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-052-hbo-max-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-052-hbo-max-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-052-hbo-max-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-053-hulu-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-053-hulu-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-053-hulu-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-053-hulu-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-053-hulu-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-053-hulu-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-054-prime-video-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-054-prime-video-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-054-prime-video-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-054-prime-video-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-054-prime-video-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-054-prime-video-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-055-intl-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-055-intl-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-055-intl-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-055-intl-site-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-055-intl-site-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-055-intl-site-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-055-intl-site-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-055-intl-site-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-055-intl-site-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-056-music-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-056-music-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-056-music-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-056-music-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-056-music-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-056-music-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-057-stream-hk-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-057-stream-hk-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-057-stream-hk-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-057-stream-hk-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-057-stream-hk-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-057-stream-hk-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-057-stream-hk-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-057-stream-hk-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-057-stream-hk-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-058-stream-tw-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-058-stream-tw-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-058-stream-tw-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-058-stream-tw-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-058-stream-tw-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-058-stream-tw-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-059-stream-jpkr-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-059-stream-jpkr-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-059-stream-jpkr-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-059-stream-jpkr-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-059-stream-jpkr-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-059-stream-jpkr-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-059-stream-jpkr-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-059-stream-jpkr-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-059-stream-jpkr-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-060-stream-eu-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-060-stream-eu-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-060-stream-eu-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-060-stream-eu-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-060-stream-eu-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-060-stream-eu-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-061-stream-other-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-061-stream-other-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-061-stream-other-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-061-stream-other-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-061-stream-other-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-061-stream-other-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-061-stream-other-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-061-stream-other-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-061-stream-other-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-062-tools-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-062-tools-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-062-tools-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-063-google-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-063-google-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-063-google-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-064-tools-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-064-tools-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-064-tools-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-064-tools-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-064-tools-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-064-tools-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-064-tools-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-064-tools-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-064-tools-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-065-microsoft-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-065-microsoft-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-065-microsoft-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-065-microsoft-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-065-microsoft-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-065-microsoft-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-066-apple-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-066-apple-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-066-apple-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-066-apple-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-066-apple-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-066-apple-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-066-apple-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-066-apple-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-066-apple-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-067-download-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-067-download-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-067-download-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-067-download-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-067-download-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-067-download-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-067-download-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-067-download-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-067-download-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-068-tracker-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-068-tracker-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-068-tracker-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-068-tracker-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-068-tracker-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-068-tracker-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-068-tracker-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-068-tracker-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-068-tracker-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-069-gfw-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-069-gfw-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-069-gfw-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-069-gfw-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-069-gfw-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-069-gfw-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-069-gfw-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-069-gfw-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-069-gfw-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-070-game-cn-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-070-game-cn-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-070-game-cn-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-071-game-intl-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-071-game-intl-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-071-game-intl-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-071-game-intl-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-071-game-intl-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-071-game-intl-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-071-game-intl-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-071-game-intl-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-071-game-intl-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-072-intl-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-072-intl-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-072-intl-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-072-intl-site-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-072-intl-site-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-072-intl-site-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-072-intl-site-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-072-intl-site-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-072-intl-site-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-073-payments-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-073-payments-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-073-payments-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-074-cnmedia-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-074-cnmedia-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-074-cnmedia-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-074-cnmedia-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-074-cnmedia-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-074-cnmedia-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-074-cnmedia-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-074-cnmedia-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-074-cnmedia-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-075-cn-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-075-cn-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-075-cn-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-075-cn-site-ipcidr-no-resolve": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-075-cn-site-ipcidr-no-resolve.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-075-cn-site-ipcidr-no-resolve.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-076-direct-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-076-direct-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-076-direct-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-077-cn-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-077-cn-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-077-cn-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-077-cn-site-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-077-cn-site-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-077-cn-site-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-078-intl-site-domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-078-intl-site-domain.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-078-intl-site-domain.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-078-intl-site-ipcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-078-intl-site-ipcidr.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-078-intl-site-ipcidr.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-078-intl-site-ipcidr-no-resolve": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-078-intl-site-ipcidr-no-resolve.mrs?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-078-intl-site-ipcidr-no-resolve.mrs",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-078-intl-site-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-078-intl-site-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-078-intl-site-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-079-im-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-079-im-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-079-im-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-080-netflix-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-080-netflix-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-080-netflix-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-081-social-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-081-social-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-081-social-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  },
  "scki-fused-082-google-residual": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "url": "https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/rulesets/generated/fused/mihomo/scki-fused-082-google-residual.yaml?scki=v6.0.20",
    "path": "./ruleset/v6.0.20/scki-fused-082-google-residual.yaml",
    "interval": 86400,
    "proxy": "🌐 国外节点"
  }
}
const LITE_DNS_CONFIG = {
  "enable": true,
  "listen": "0.0.0.0:1053",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "ipv6": false,
  "prefer-h3": false,
  "respect-rules": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "fake-ip-filter-mode": "blacklist",
  "fake-ip-filter": [
    "+.lan",
    "+.local",
    "+.localdomain",
    "+.home.arpa",
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    "localhost.work.weixin.qq.com",
    "+.in-addr.arpa",
    "+.ip6.arpa",
    "time.*.com",
    "time.*.gov",
    "ntp.*.com",
    "pool.ntp.org",
    "+.ntp.org",
    "+.pool.ntp.org",
    "+.market.xiaomi.com",
    "+.stun.*.*",
    "+.stun.*.*.*",
    "+.turn.*.*",
    "+.turn.*.*.*",
    "+.n.n.srv.nintendo.net",
    "+.stun.playstation.net",
    "+.xboxlive.com",
    "stun.l.google.com",
    "stun1.l.google.com",
    "stun2.l.google.com",
    "stun3.l.google.com",
    "stun4.l.google.com",
    "global.turn.twilio.com",
    "auth.docker.io",
    "registry-1.docker.io",
    "index.docker.io",
    "hub.docker.com",
    "production.cloudflare.docker.com",
    "+.push.apple.com",
    "+.pub.3gppnetwork.org",
    "+.bing.com",
    "+.rustdesk.com",
    "+.todesk.com",
    "+.oray.com",
    "+.sunlogin.com",
    "+.teamviewer.com",
    "+.anydesk.com",
    "+.battlenet.com.cn",
    "+.wotgame.cn",
    "+.wggames.cn",
    "+.wowsgame.cn",
    "+.mcdn.bilivideo.cn",
    "+.miwifi.com",
    "+.courier.push.apple.com",
    "+.miui.com",
    "+.xiaomi.com",
    "+.xiaomi.net",
    "+.mijia.tech",
    "+.gotui.com"
  ],
  "fallback-filter": {
    "geoip": true,
    "geoip-code": "CN",
    "geosite": [
      "gfw",
      "geolocation-!cn"
    ],
    "ipcidr": [
      "240.0.0.0/4",
      "0.0.0.0/32",
      "127.0.0.0/8",
      "10.0.0.0/8",
      "192.168.0.0/16"
    ],
    "domain": []
  }
}
const LITE_FOREIGN_DNS_DOMAINS = [
  "+.chatgpt.com",
  "+.oaistatic.com",
  "+.oaiusercontent.com",
  "+.openai.com",
  "+.ai.com",
  "+.sora.com",
  "+.chat.com",
  "+.statsig.com",
  "+.statsigapi.net",
  "+.featuregates.org",
  "+.arkoselabs.com",
  "+.patreon.com",
  "+.patreonusercontent.com",
  "+.patreoncommunity.com",
  "+.transcend-cdn.com",
  "+.transcend.io",
  "patreon-media.s3-accelerate.amazonaws.com",
  "+.mux.com",
  "+.stream-io-api.com",
  "+.stream-io-video.com",
  "+.ippure.com"
]
const LITE_JAPAN_BLOCKED_DOMAINS = [
  "hgamefree.info",
  "erogames.top",
  "gg-games.org",
  "gg-games.net",
  "anime-sharing.com",
  "2djgame.net",
  "acgngame.net",
  "zodgame.xyz",
  "south-plus.net",
  "south-plus.org",
  "rawkuma.com",
  "weloma.art",
  "weloma.net",
  "klmanga.com",
  "klmanga.net",
  "klmanga.co",
  "manga1000.top",
  "manga1001.top",
  "manga1000.com",
  "manga1001.in",
  "senmanga.com",
  "synobamangas.com",
  "sakuramanga.org",
  "rawdevart.com",
  "bato.to",
  "mangakakalot.com",
  "mangakakalot.tv",
  "manganato.com",
  "chapmanganato.to",
  "comick.io",
  "comick.app",
  "18comic.vip",
  "18comic.org",
  "wnacg.com",
  "wnacg.org",
  "hitomi.la",
  "nhentai.net",
  "asmhentai.com",
  "kemono.su",
  "kemono.party",
  "coomer.su",
  "coomer.party",
  "nyaa.si",
  "missav.com",
  "missav.ai",
  "missav.ws",
  "jable.tv",
  "supjav.com",
  "tktube.com",
  "7mmtv.tv",
  "7mmtv.sx",
  "netflav.com",
  "hpjav.tv",
  "javlibrary.com",
  "cableav.tv"
]
const LITE_TUN_EXCLUDE_PROCESSES = [
  "Thunder.exe",
  "ThunderPlatform.exe",
  "DownloadService.exe",
  "XLServicePlatform.exe",
  "xllite.exe",
  "DownloadSDKServer.exe"
]

// 节点分类辅助工具：精准识别国内回国节点、说明节点与日本节点
var INFO_REGEX = /流量|到期|过期|重置|官网|通知|订阅|套餐|客服|QQ群|TG频道|网址|剩余|官方/i
var CN_NODE_REGEX = /中国(?:电信|联通|移动|铁通|中转|专线)|(?:^|[^a-zA-Z])(?:CN|China|Mainland|回国|国内|北京|上海|广州|深圳|杭州|南京|武汉|成都|重庆|天津|西安|苏州|郑州|长沙|沈阳|青岛|济南|大连|厦门|福州|合肥)(?:[^a-zA-Z]|$)/i
var JP_NODE_REGEX = /(?:^|[^a-zA-Z])(?:JP|JPN|Japan|Tokyo|Osaka|Nagoya|Fukuoka|Yokohama|Saitama|Chiba|Hokkaido|Okinawa|Kyoto|Kobe)(?:[^a-zA-Z]|$)|(?:日本|东京|大阪|名古屋|福冈|横滨|埼玉|千叶|北海道|冲绳|京都|神户)|🇯🇵/i
var FOREIGN_KEYWORD_REGEX = /(?:^|[^a-zA-Z])(?:HK|HongKong|TW|Taiwan|JP|Japan|SG|Singapore|US|USA|KR|Korea|UK)(?:[^a-zA-Z]|$)|(?:香港|台湾|日本|新加坡|美国|韩国|英国|德国|法国)|(?:🇭🇰|🇹🇼|🇯🇵|🇸🇬|🇺🇸|🇰🇷|🇬🇧|🇩🇪|🇫🇷)/i

function isInfoNode(name) {
  if (typeof name !== 'string') return false
  return INFO_REGEX.test(name)
}

function isCnNode(name) {
  if (typeof name !== 'string') return false
  if (FOREIGN_KEYWORD_REGEX.test(name)) return false
  return CN_NODE_REGEX.test(name)
}

function isJpNode(name) {
  if (typeof name !== 'string') return false
  return JP_NODE_REGEX.test(name)
}

function applyLiteDns(config) {
  if (!config.dns || typeof config.dns !== 'object') config.dns = {}
  var base = LITE_DNS_CONFIG
  for (var key in base) {
    if (base[key] !== undefined) config.dns[key] = base[key]
  }

  var domesticPlain = ['223.5.5.5', '223.6.6.6', '119.29.29.29']
  var domesticDoH = ['https://dns.alidns.com/dns-query']
  var foreignDoH = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query']

  config.dns['use-hosts'] = true
  config.dns.nameserver = ['223.5.5.5'].concat(domesticDoH)
  config.dns['default-nameserver'] = domesticPlain.slice()
  config.dns['proxy-server-nameserver'] = ['223.5.5.5', '223.6.6.6'].concat(domesticDoH, foreignDoH)
  config.dns['direct-nameserver'] = domesticPlain.concat(domesticDoH)
  config.dns['direct-nameserver-follow-policy'] = false

  if (!config.dns['nameserver-policy'] || typeof config.dns['nameserver-policy'] !== 'object' || Array.isArray(config.dns['nameserver-policy'])) {
    config.dns['nameserver-policy'] = {}
  }

  // 国内域名与探针强制秒解
  config.dns['nameserver-policy']['geosite:cn'] = ['223.5.5.5'].concat(domesticDoH)
  config.dns['nameserver-policy']['+.msftconnecttest.com'] = ['223.5.5.5'].concat(domesticDoH)
  config.dns['nameserver-policy']['+.msftncsi.com'] = ['223.5.5.5'].concat(domesticDoH)

  // 海外指定域名强制走海外 DoH 防污染
  LITE_FOREIGN_DNS_DOMAINS.forEach(function(host) {
    config.dns['nameserver-policy'][host] = foreignDoH.slice()
  })

  // 日本禁用站点同样走海外 DoH 防污染
  LITE_JAPAN_BLOCKED_DOMAINS.forEach(function(domain) {
    config.dns['nameserver-policy']['+.' + domain] = foreignDoH.slice()
  })
}

function applyLiteTun(config) {
  if (!config.tun || typeof config.tun !== 'object') config.tun = {}
  config.tun.enable = true
  config.tun['auto-route'] = true
  config.tun['strict-route'] = false
  config.tun['auto-detect-interface'] = true

  var exclude = [
    'GCUService.exe',
    'GCUBridge.exe',
    'GSCService.exe',
    'gsupservice.exe',
    'gchsvc.exe',
  ]
  var userExclude = LITE_TUN_EXCLUDE_PROCESSES || []
  var excludeSet = new Set(exclude.map(function(s) { return s.toLowerCase() }))
  userExclude.forEach(function(proc) {
    if (!excludeSet.has(proc.toLowerCase())) {
      exclude.push(proc)
      excludeSet.add(proc.toLowerCase())
    }
  })
  config.tun['exclude-process'] = exclude
}

function main(config) {
  if (!config || typeof config !== 'object') return config
  if (!Array.isArray(config.proxies) || config.proxies.length === 0) return config

  // 1. 节点分类：分离有效国外代理、非日本节点与国内回国节点，剔除流量说明节点
  var foreignNodes = []
  var nonJpNodes = []
  var cnNodes = []

  for (var i = 0; i < config.proxies.length; i++) {
    var p = config.proxies[i]
    if (!p || typeof p !== 'object' || !p.name) continue
    var pType = String(p.type || '').toLowerCase()
    if (pType === 'direct' || pType === 'reject') continue
    var name = String(p.name)
    if (isInfoNode(name)) continue

    if (isCnNode(name)) {
      cnNodes.push(name)
    } else {
      foreignNodes.push(name)
      if (!isJpNode(name)) {
        nonJpNodes.push(name)
      }
    }
  }

  // 2. 策略组配置：三大核心策略组
  // 「🌐 国外节点」：全部海外节点
  // 「🚫 日本禁用」：自动排除日本节点（用于访问因日本著作权法/WAF对日本IP返回403的站点）
  // 「🇨🇳 国内节点」：默认 DIRECT 直连，内嵌国外节点支持一键全局翻墙
  var foreignGroup = {
    name: '🌐 国外节点',
    type: 'select',
    proxies: foreignNodes.length > 0 ? foreignNodes : ['REJECT'],
  }

  var nonJpProxies = nonJpNodes.length > 0 ? nonJpNodes.slice() : (foreignNodes.length > 0 ? foreignNodes.slice() : ['DIRECT'])
  if (!nonJpProxies.includes('DIRECT')) {
    nonJpProxies.push('DIRECT')
  }

  var nonJpGroup = {
    name: '🚫 日本禁用',
    type: 'select',
    proxies: nonJpProxies,
  }

  var domesticGroup = {
    name: '🇨🇳 国内节点',
    type: 'select',
    proxies: ['DIRECT', '🌐 国外节点'].concat(cnNodes),
  }

  config['proxy-groups'] = [foreignGroup, nonJpGroup, domesticGroup]

  // 3. 规则集与提供商注入
  config['rule-providers'] = LITE_RULE_PROVIDERS
  config.rules = LITE_RULES

  // 4. DNS、TUN、混合端口与运行配置
  applyLiteDns(config)
  applyLiteTun(config)

  if (!config.profile || typeof config.profile !== 'object') config.profile = {}
  config.profile['store-selected'] = false
  config.profile['store-fake-ip'] = true

  config.listeners = [
    { name: 'MIXED-PROXY', type: 'mixed', port: 50000, proxy: '🌐 国外节点' },
    { name: 'MIXED-DIRECT', type: 'mixed', port: 10086, proxy: 'DIRECT' },
  ]

  console.log('[Lite-Override] Loaded successfully: 3 proxy groups (' + foreignNodes.length + ' foreign proxies, ' + nonJpProxies.length + ' non-JP proxies, ' + domesticGroup.proxies.length + ' domestic options), ' + config.rules.length + ' rules, ' + Object.keys(config['rule-providers']).length + ' rule-providers')
  return config
}
