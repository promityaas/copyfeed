/* One streaming capture: discover, enrich and persist concurrently. */
(()=>{
 async function collect({target=100,signal,scan,scroll,sleep,waitForPosts,emit,enrich,visible=()=>true,blocked=()=>false,now=()=>Date.now(),timeout=15*60*1000,stall=30000,concurrency=2,maxBacklog=12}){
  const E=globalThis.CopyfeedExtractors,posts=new Map(),observations=new Map(),dirty=new Set(),jobs=new Map(),attempted=new Set(),pending=[];
  const started=now(),events=[],timings={firstDetailStartedAtCount:null,firstDetailCompletedAtCount:null,maxDetailsActive:0};let progressAt=now(),cycles=0,enriched=0,reason='target',failure='',phase='collecting',finished=false,discoveryDone=false,feed={},publishTail=Promise.resolve();
  target=Math.max(1,Math.min(2000,Math.floor(target)));concurrency=Math.max(1,Math.min(2,concurrency));
  const stopped=()=>!!signal?.aborted;
  const event=(type,extra={})=>{events.push({ms:Math.max(0,now()-started),type,count:posts.size,...extra});if(events.length>100)events.shift()};
  const missing=p=>(!p.caption&&!p.captionKnown)||p.likes==null||p.comments==null||(p.mediaType==='video'&&p.views==null)||(p.platform!=='youtube'&&p.mediaType==='video'&&!p.mediaUrl);
  function snapshot(extra={}){const rows=[...posts.values()];return {phase,count:rows.length,target,cycles,enriched,elapsedMs:now()-started,captionCount:rows.filter(p=>p.caption||p.captionKnown).length,metricsCount:rows.filter(p=>p.likes!=null&&p.comments!=null&&(p.mediaType!=='video'||p.views!=null)).length,mediaReady:rows.filter(p=>p.mediaUrl).length,detailsActive:jobs.size,detailsQueued:pending.filter(id=>missing(posts.get(id))).length,detailErrors:rows.filter(p=>p.metadataError).length,partialCount:rows.filter(missing).length,feedPages:feed.pages||0,discoveryDone,diagnostics:{schema:1,...timings,events:[...events]},...extra}}
  function put(p){const id=E.identity(p?.url);if(!id||(!posts.has(id)&&posts.size>=target))return;const old=posts.get(id),next=E.merge(old,{...p,id});if(p.metadataError==='')next.metadataError='';if(!missing(next)){next.metadataStatus='ready';next.metadataError=''}if(JSON.stringify(old)===JSON.stringify(next))return;posts.set(id,next);dirty.add(id);if(!old)progressAt=now()}
  function abortJobs(){for(const job of jobs.values())job.controller.abort()}
  const onAbort=()=>{reason='stopped';event('stop');abortJobs()};signal?.addEventListener('abort',onAbort,{once:true});
  function interrupted(){const b=blocked();if(b){reason=typeof b==='string'?b:'page-changed';return true}if(stopped()){reason='stopped';return true}if(failure||['platform-limit','sign-in-required'].includes(reason))return true;if(now()-started>=timeout){reason='time-limit';return true}return false}
  function publish(extra={},final=false){const run=async()=>{if(finished&&!final)return;const batch=[...dirty].map(id=>posts.get(id));dirty.clear();try{await emit(snapshot(extra),batch)}catch(e){for(const p of batch)dirty.add(p.id);failure=e?.message||String(e);reason='error';abortJobs();throw e}};const result=publishTail.then(run,run);publishTail=result.catch(()=>{});return result}
  const publishJob=()=>{void publish().catch(()=>{})};
  function pump(){if(finished||interrupted()||!visible()||!enrich)return;
   while(jobs.size<concurrency&&pending.length){const id=pending.shift(),before=posts.get(id);if(!missing(before)||attempted.has(id))continue;attempted.add(id);const controller=new AbortController(),job={controller};jobs.set(id,job);put({...before,metadataStatus:'reading'});timings.firstDetailStartedAtCount??=posts.size;timings.maxDetailsActive=Math.max(timings.maxDetailsActive,jobs.size);event('detail-start',{active:jobs.size});
    Promise.resolve().then(()=>enrich(before,{signal:controller.signal})).then(result=>{
     if(finished||controller.signal.aborted||stopped()||blocked())return;
     // Apply only fields changed by the detail response. Do not restore stale
     // metrics captured before a newer feed response arrived during this job.
     const patch={id,url:before.url},currentBefore=posts.get(id);for(const [k,v] of Object.entries(result||{}))if(JSON.stringify(v)!==JSON.stringify(before[k])){
      if(['views','likes','comments','shares','saves'].includes(k)&&currentBefore[k]!==before[k]&&['api','structured'].includes(currentBefore.metricSources?.[k]))continue;
      patch[k]=v;
     }
     if(['views','likes','comments','shares','saves'].some(k=>k in patch))patch.metricSources=result.metricSources||before.metricSources;
     if('caption' in patch||'title' in patch)patch.captionSource=result.captionSource||before.captionSource;
     put(patch);const current=posts.get(id);put({...current,metadataStatus:missing(current)?'partial':'ready',metadataError:''});timings.firstDetailCompletedAtCount??=posts.size;event('detail-done');
    }).catch(e=>{
     if(finished||controller.signal.aborted||stopped())return;
     const message=e?.message||String(e);if(/PLATFORM_LIMIT|SIGN_IN_REQUIRED/.test(message)){reason=message.includes('PLATFORM_LIMIT')?'platform-limit':'sign-in-required';abortJobs()}
     put({...posts.get(id),metadataStatus:'partial',metadataError:message});event('detail-error',{code:/PLATFORM_LIMIT|SIGN_IN_REQUIRED/.test(message)?message:'DETAIL_UNAVAILABLE'});
    }).finally(()=>{jobs.delete(id);if(finished)return;enriched++;pump();publishJob()});
   }
  }
  function accept(result){const incoming=Array.isArray(result)?result:result?.posts||[];feed=Array.isArray(result)?feed:result?.feed||feed;if(feed.restriction)reason=feed.restriction;let changes=0;
   for(const p of incoming){const id=E.identity(p?.url);if(!id)continue;const prior=observations.get(id);if(JSON.stringify(prior)===JSON.stringify(p))continue;
    // Re-scanning a cached batch must not overwrite newer detail results.
    const patch={id,url:p.url};for(const [k,v] of Object.entries(p))if(!prior||JSON.stringify(v)!==JSON.stringify(prior[k]))patch[k]=v;
    if(['views','likes','comments','shares','saves'].some(k=>k in patch))patch.metricSources=p.metricSources;
    if('caption' in patch||'title' in patch)patch.captionSource=p.captionSource;
    observations.set(id,p);put(patch);changes++;
   }
   for(const [id,p] of posts)if(enrich&&missing(p)&&!attempted.has(id)&&!pending.includes(id))pending.push(id);if(changes)event('batch',{feedPages:feed.pages||0});pump()}
  try{
   event('start');
   while(!interrupted()){
    if(!visible()){phase='paused';await publish({message:'Capture paused. Return to the source profile to continue.'});await sleep(500);progressAt=now();continue}
    phase='collecting';const batch=await scan();if(interrupted())break;accept(batch);
    if(feed.restriction){reason=feed.restriction;break}
    if(posts.size>=target)discoveryDone=true;
    if(feed.hasNextPage===false&&feed.pages>0){discoveryDone=true;if(posts.size<target)reason='end-of-feed'}
    if(!discoveryDone&&now()-progressAt>=stall){discoveryDone=true;reason='no-more-posts'}
    pump();await publish({message:`${posts.size}/${target} collected · ${snapshot().captionCount} captions · ${snapshot().mediaReady} media links · ${jobs.size} reading details`});
    if(interrupted())break;
    // End-of-feed is separate from field availability. Never call a partial
    // record complete just because the requested number of links was found.
    if(discoveryDone&&!jobs.size&&!pending.length)break;
    if(discoveryDone||pending.length>=maxBacklog){await sleep(120);continue}
    await scroll();cycles++;await (waitForPosts||sleep)(Math.min(2500,650+Math.floor((now()-progressAt)/6000)*350));
   }
  }catch(e){reason='error';failure=e?.message||String(e)}
  finally{finished=true;abortJobs();signal?.removeEventListener('abort',onAbort)}
  jobs.clear();pending.length=0;for(const p of posts.values())if(p.metadataStatus==='reading')put({...p,metadataStatus:'partial'});
  phase='finished';event('finish',{reason});
  const complete=snapshot();const endings={target:'Requested posts collected.','end-of-feed':'Reached the end of the loaded profile feed.','no-more-posts':posts.size?'No new posts appeared before the waiting limit.':'No profile posts appeared. Refresh the creator’s Posts or Reels tab and retry.',stopped:'Stopped. Collected posts are kept.','page-changed':'The source page changed. Collected posts are kept.','platform-limit':'The platform limited requests. Collected posts are kept; try later.','sign-in-required':'The platform requires sign-in. Collected posts are kept.','time-limit':'Session time limit reached. Collected posts are kept.',error:`Capture stopped: ${failure}. ${posts.size?'Collected posts are kept.':'No posts were captured.'}`};
  const final={reason,error:failure,missingCaptions:[...posts.values()].filter(p=>!p.caption&&!p.captionKnown).length,message:`${endings[reason]||reason} ${complete.partialCount?`${complete.partialCount} posts have unavailable fields.`:''}`.trim()};
  try{await publish(final,true)}catch(e){dirty.clear();await emit(snapshot({...final,reason:'error',error:e.message,message:e.message}),[])}
  return {posts:[...posts.values()],reason};
 }
 globalThis.CopyfeedSession={collect};
})();
