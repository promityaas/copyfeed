/* Only owner-scoped records enter profile research. No private API calls. */
(()=>{
 const E=globalThis.CopyfeedExtractors,F=globalThis.CopyfeedFeed,igScope=F.scope,igObject=F.fromObject;
 function scope(href){try{const u=new URL(href),p=u.pathname.split('/').filter(Boolean),host=u.hostname;if(u.protocol!=='https:'||u.username||u.password)return null;
 if(host==='www.instagram.com'){const s=igScope(href);return s&&s.kind!=='tagged'?{...s,platform:'instagram',key:u.origin+'/'+s.creator+'/',profile:u.origin+'/'+s.creator+'/'}:null;}
 if(host==='www.tiktok.com'&&/^@[\w.]+$/.test(p[0]||'')&&p.length===1)return {platform:'tiktok',creator:p[0].slice(1).toLowerCase(),key:u.origin+'/'+p[0],kind:'videos'};
 if(host==='www.youtube.com'){let creator='',n=0;if(/^@[\w.\-\p{L}\p{N}]+$/u.test(p[0]||'')){creator=p[0];n=1}else if(['channel','c','user'].includes(p[0])&&p[1]){creator=p[1];n=2}if(creator&&p.length<=n+1&&(!p[n]||['videos','shorts','streams','featured'].includes(p[n])))return {platform:'youtube',creator,key:u.origin+'/'+p.slice(0,n).join('/'),kind:p[n]||'videos'};}
 if(host==='www.facebook.com'){const excluded=['watch','reel','reels','videos','groups','marketplace','stories','messages','login','share','search','gaming'];if(p[0]==='profile.php'&&/^\d+$/.test(u.searchParams.get('id')||''))return {platform:'facebook',creator:u.searchParams.get('id'),key:u.origin+'/profile.php?id='+u.searchParams.get('id'),kind:'posts'};if(p[0]&&!excluded.includes(p[0])&&p.length<=2&&(!p[1]||['videos','reels','posts'].includes(p[1])))return {platform:'facebook',creator:p[0],key:u.origin+'/'+p[0],kind:p[1]||'posts'};}
 return null;}catch{return null}}
 const normalized=s=>String(s||'').replace(/^@/,'').toLowerCase();
 function belongs(p,s){if(!s||p.platform!==s.platform)return false;if(p.sourceProfile){const own=scope(p.sourceProfile);if(own?.key===s.key)return true;}return !!p.creator&&normalized(p.creator)===normalized(s.creator);}
 function owner(x){const runs=x.ownerText?.runs||x.shortBylineText?.runs||x.longBylineText?.runs||[];const ep=runs[0]?.navigationEndpoint?.browseEndpoint;return ep?.canonicalBaseUrl?.split('/').filter(Boolean).at(-1)||ep?.browseId||'';}
 function fromObject(data,href){const s=scope(href);if(!s)return null;if(s.platform==='instagram')return igObject(data,href);
 const rows=new Map();let hasNextPage=null,cursor='',stack=[data],seen=new WeakSet(),n=0;
 while(stack.length&&n++<50000){const x=stack.pop();if(!x||typeof x!=='object'||seen.has(x))continue;seen.add(x);
 // TikTok ItemModule / itemList records contain explicit author identity.
 if(s.platform==='tiktok'&&x.video&&(x.stats||x.statsV2)){for(const p of E.walk(x,'tiktok'))if(belongs(p,s))rows.set(p.id,{...p,sourceProfile:href,format:'short'});}
 // A channel's rich-grid or tab continuation provides membership even for Shorts without bylines.
 if(s.platform==='youtube'){
 const contents=x.richGridRenderer?.contents||x.gridRenderer?.items||x.onResponseReceivedActions?.flatMap(a=>a.appendContinuationItemsAction?.continuationItems||[])||x.onResponseReceivedEndpoints?.flatMap(a=>a.appendContinuationItemsAction?.continuationItems||[]);
 if(contents&&contents.length){for(const item of contents){if(item.richSectionRenderer||item.shelfRenderer||item.adSlotRenderer)continue;for(const p of E.walk(item,'youtube')){const explicit=p.creatorId;if(explicit&&normalized(explicit)!==normalized(s.creator))continue;rows.set(p.id,{...p,creator:explicit||s.creator,sourceProfile:href,format:p.url.includes('/shorts/')?'short':'long'});}}}
 if(x.videoRenderer||x.gridVideoRenderer){const raw=x.videoRenderer||x.gridVideoRenderer,id=owner(raw);if(id&&normalized(id)===normalized(s.creator))for(const p of E.walk(raw,'youtube'))rows.set(p.id,{...p,creator:s.creator,creatorId:id,sourceProfile:href,format:'long'});}
 }
 if(s.platform==='facebook'&&(x.__typename==='Video'||x.__typename==='Story')){const actor=x.owner||x.actors?.[0];const id=actor?.username||actor?.url?.split('/').filter(Boolean).at(-1)||actor?.id;if(id&&normalized(id)===normalized(s.creator))for(const p of E.walk(x,'facebook'))rows.set(p.id,{...p,creator:s.creator,sourceProfile:href,format:p.url.includes('/reel/')?'short':'video'});}
 for(const v of Object.values(x))if(v&&typeof v==='object')stack.push(v);
 }
 return rows.size?{posts:[...rows.values()],hasNextPage,cursor,scope:s.key}:null;
 }
 F.scope=scope;F.fromObject=fromObject;F.fromText=(t,h)=>F.decode(t).map(d=>fromObject(d,h)).filter(Boolean);
 globalThis.CopyfeedAdapters={scope,belongs,normalized,explain:href=>scope(href)?'Ready to collect this profile.':'Open a creator profile, channel Videos/Shorts tab, or public Facebook page. Home feeds, search, tagged posts, private messages and individual video pages cannot start profile collection.'};
})();
