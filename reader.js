/* Isolated-world reader: visible posts never depend on the page bridge. */
(()=>{
 const E=globalThis.CopyfeedExtractors,D=globalThis.CopyfeedDOM,F=globalThis.CopyfeedFeed;
 const scriptCache=new WeakMap();
 const platform=()=>location.hostname.includes('instagram')?'instagram':location.hostname.includes('tiktok')?'tiktok':location.hostname.includes('youtube')?'youtube':'facebook';
 function scan(doc=document,href=location.href){
  if(/\/(direct|messages|messenger|inbox)(\/|$)/.test(new URL(href).pathname))throw Error('Open a creator profile. Copyfeed does not capture inbox pages.');
  const rows=new Map();for(const p of D.grid(doc,href))rows.set(p.id,p);
  const detail=D.detail(doc,href,platform());if(detail)rows.set(detail.id,E.merge(rows.get(detail.id),detail));
  for(const script of doc.querySelectorAll('script[type="application/json"],script[type="application/ld+json"],script#__NEXT_DATA__,script#SIGI_STATE,script#__UNIVERSAL_DATA_FOR_REHYDRATION__')){
   let parsed=scriptCache.get(script);if(!parsed||parsed.text!==script.textContent||parsed.href!==href){parsed={text:script.textContent,href,posts:E.parsePayload(script.textContent,platform()),batches:F.fromText(script.textContent,href)};scriptCache.set(script,parsed)}
   for(const batch of parsed.batches)for(const p of batch.posts)rows.set(p.id,E.merge(rows.get(p.id),p));
   for(const p of parsed.posts)if(rows.has(p.id))rows.set(p.id,E.merge(rows.get(p.id),p));
  }
  return [...rows.values()];
 }
 async function enrich(post,{signal}={}){
  const url=new URL(post.url);if(url.origin!==location.origin||E.identity(url.href)!==post.id)throw Error('Invalid reference');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);const abort=()=>controller.abort();if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
  try{
   // Use the media identifier actually observed in the feed. A structured
   // response must match this reference before any of its fields are merged.
   if(platform()==='instagram'&&/^\d{1,30}$/.test(post.mediaId||'')){
    const info=await fetch(new URL('/api/v1/media/'+post.mediaId+'/info/',url.origin).href,{credentials:'same-origin',redirect:'follow',signal:controller.signal,headers:{'x-ig-app-id':'936619743392459'}});
    if(info.status===429||info.status===403)throw Error('PLATFORM_LIMIT');if(info.status===401)throw Error('SIGN_IN_REQUIRED');
    if(/\/(accounts\/login|challenge)\//.test(new URL(info.url||url.href).pathname))throw Error('SIGN_IN_REQUIRED');
    if(info.ok){const text=await info.text();if(text.length>16000000)throw Error('Post detail response was too large.');let data;try{data=JSON.parse(text)}catch{};
     if(data){if(data.message==='login_required'||data.challenge)throw Error('SIGN_IN_REQUIRED');const match=E.walk(data,'instagram').find(p=>p.id===post.id);if(!match)throw Error('The returned details did not match this post.');return {...E.merge(post,match),metadataStatus:'read'};}
    }
    // Unsupported response formats/404s can still expose page metadata.
   }
   const response=await fetch(url.href,{credentials:'same-origin',redirect:'follow',signal:controller.signal});
   if(response.status===403||response.status===429)throw Error('PLATFORM_LIMIT');
   if(response.status===401)throw Error('SIGN_IN_REQUIRED');
   if(!response.ok)throw Error(`Post details returned HTTP ${response.status}.`);
   if(/\/(accounts\/login|challenge)\//.test(new URL(response.url||url.href).pathname))throw Error('SIGN_IN_REQUIRED');
   if(E.identity(response.url||url.href)!==post.id)throw Error('The returned page did not match this post.');
   const html=await response.text();if(html.length>16000000)throw Error('Post detail response was too large.');
   const doc=new DOMParser().parseFromString(html,'text/html');
   if(doc.querySelector('form[action*="challenge"],form[action*="login"]'))throw Error('SIGN_IN_REQUIRED');
   const declared=doc.querySelector('meta[property="og:url"]')?.getAttribute('content')||doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
   if(declared&&E.identity(new URL(declared,url.href).href)!==post.id)throw Error('The returned page did not match this post.');
   let result=post;
   for(const script of doc.querySelectorAll('script[type="application/json"],script[type="application/ld+json"]'))for(const p of E.parsePayload(script.textContent,platform()))if(p.id===post.id)result=E.merge(result,p);
   const detail=D.detail(doc,url.href,platform());if(detail)result=E.merge(result,detail);
   return {...result,metadataStatus:result.caption?'complete':'partial'};
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort)}
 }
 globalThis.CopyfeedReader={scan,enrich};
})();
