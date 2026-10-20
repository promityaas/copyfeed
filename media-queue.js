/* Durable, bounded media work. Browser downloads are complete only after Chrome confirms it. */
(()=>{
 function create({chrome,resolve,save,clean}){
  let lock=Promise.resolve(),running=false,controllers=new Set();
  const serial=fn=>{const p=lock.then(fn,fn);lock=p.catch(()=>{});return p};
  const read=async()=> (await chrome.storage.local.get('mediaQueue')).mediaQueue||{id:'',items:[],cancelled:false};
  const write=async q=>{try{await chrome.storage.local.set({mediaQueue:{...q,updatedAt:Date.now()}})}catch{throw Error('Browser storage is full. Export and clear old references, then retry a smaller media batch.')}};
  async function patch(id,key,delta){return serial(async()=>{const q=await read();if(q.id!==id)return false;const item=q.items.find(x=>x.key===key);if(!item)return false;Object.assign(item,delta);await write(q);return !q.cancelled})}
  async function reconcile(){await serial(async()=>{const q=await read();for(const item of q.items){if(item.state==='resolving')item.state=q.cancelled?'cancelled':'queued';if(item.state==='downloading'){if(item.downloadId!=null){const [d]=await chrome.downloads.search({id:item.downloadId});if(d?.state==='complete')item.state='complete';else if(!d||d.state==='interrupted'){item.state='error';item.error=d?.error||'Chrome interrupted the download. Retry this item.'}}else{item.state='error';item.error='Download start was interrupted. Check Chrome downloads before retrying.'}}}await write(q)})}
  async function start(posts,mode='download'){
   if(!Array.isArray(posts)||!posts.length||posts.length>2000)throw Error('Choose 1–2,000 posts.');
   const q=await serial(async()=>{const old=await read();if(old.items.some(x=>['queued','resolving','downloading'].includes(x.state)))throw Error('Finish or cancel the current media queue first.');const unique=new Map();for(const p of posts){const {notes,transcript,board,saved,...n}=clean(p);unique.set(n.id,n)}if(!unique.size)throw Error('Select supported video reels.');const q={id:crypto.randomUUID(),mode:mode==='prepare'?'prepare':'download',cancelled:false,items:[...unique.values()].flatMap(post=>Array.from({length:post.mediaType==='carousel'?Math.max(1,post.mediaAssets?.length||0):1},(_,assetIndex)=>({key:post.id+':'+assetIndex,assetIndex,post,state:'queued',attempts:0,error:''})))};await write(q);return q});
   await chrome.alarms.create('copyfeed-media',{periodInMinutes:0.5});void pump();return q;
  }
  async function work(q,item){const controller=new AbortController();controllers.add(controller);let changed=false;
   try{if(!await patch(q.id,item.key,{state:'resolving',attempts:item.attempts+1,error:''}))return;
    const post=await resolve(item.post,{signal:controller.signal});
    const current=await read();if(controller.signal.aborted||current.id!==q.id||current.cancelled)return;
    await save(post,async()=>{const c=await read();return c.id===q.id&&!c.cancelled});
    if(!await patch(q.id,item.key,{post,state:q.mode==='prepare'?'ready':'downloading'}))return;
    if(q.mode==='prepare')return;
    const name=String(post.creator||'creator').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,60)+'-'+post.id.replace(/[^a-zA-Z0-9_-]/g,'_');
    const asset=post.mediaAssets?.[item.assetIndex],url=asset?.url||post.mediaUrl||(post.mediaType==='image'?post.thumbnail:'');if(!url)throw Error('No accessible asset URL. Open the original post.');const ext=(asset?.type||post.mediaType)==='image'?'jpg':'mp4';const id=await chrome.downloads.download({url,filename:'Copyfeed/'+name+'-'+(item.assetIndex+1)+'.'+ext,saveAs:false,conflictAction:'uniquify'});changed=true;
    const allowed=await patch(q.id,item.key,{downloadId:id});if(!allowed){await chrome.downloads.cancel(id).catch(()=>{});return}
    const [d]=await chrome.downloads.search({id});if(d?.state==='complete')await patch(q.id,item.key,{state:'complete'});if(d?.state==='interrupted')throw Error(d.error||'Download interrupted');
   }catch(e){if(controller.signal.aborted)return;await patch(q.id,item.key,{state:'error',error:e?.message||String(e),post:changed?{...item.post,mediaUrl:''}:item.post});
    if(/PLATFORM_LIMIT|SIGN_IN_REQUIRED/.test(e?.message||'')){await serial(async()=>{const c=await read();if(c.id!==q.id)return;c.cancelled=true;for(const x of c.items)if(['queued','resolving'].includes(x.state)){x.state='cancelled';x.error='Platform paused the queue. Sign in or wait before retrying.'}await write(c)});for(const c of controllers)c.abort()}
   }finally{controllers.delete(controller)}
  }
  async function pump(){if(running)return;running=true;try{while(true){const q=await read();if(q.cancelled)break;const active=q.items.filter(x=>x.state==='downloading').length;const jobs=q.items.filter(x=>x.state==='queued').slice(0,Math.max(0,2-active));if(!jobs.length)break;await Promise.all(jobs.map(x=>work(q,x)))}const q=await read();if(!q.items.some(x=>['queued','resolving','downloading'].includes(x.state)))await chrome.alarms.clear('copyfeed-media')}finally{running=false}}
  async function cancel(){for(const c of controllers)c.abort();await serial(async()=>{const q=await read();q.cancelled=true;for(const x of q.items){if(x.state==='downloading'&&x.downloadId!=null)await chrome.downloads.cancel(x.downloadId).catch(()=>{});if(['queued','resolving','downloading'].includes(x.state))x.state='cancelled'}await write(q)});await chrome.alarms.clear('copyfeed-media');return read()}
  async function retry(){if(running)throw Error('The queue is still stopping. Retry in a moment.');await serial(async()=>{const q=await read();q.cancelled=false;for(const x of q.items)if(['error','cancelled'].includes(x.state)){x.state='queued';x.error='';x.post.mediaUrl='';delete x.downloadId}await write(q)});await chrome.alarms.create('copyfeed-media',{periodInMinutes:0.5});void pump();return read()}
  chrome.downloads.onChanged.addListener(delta=>{if(!delta.state)return;void serial(async()=>{const q=await read(),item=q.items.find(x=>x.downloadId===delta.id&&x.state==='downloading');if(!item)return;if(delta.state.current==='complete'){item.state='complete';item.error=''}else if(delta.state.current==='interrupted'){item.state='error';item.error=delta.error?.current||'Download interrupted';item.post.mediaUrl=''}await write(q)}).then(()=>pump())});
  chrome.alarms.onAlarm.addListener(a=>{if(a.name==='copyfeed-media')void (running?Promise.resolve():reconcile()).then(()=>pump())});
  return {start,cancel,retry,read,resume:async()=>{await reconcile();void pump()},pump};
 }
 globalThis.CopyfeedMediaQueue={create};
})();
