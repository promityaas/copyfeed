/* Browser Fetch returns status 0 for manual redirects. Follow CDN redirects,
   constrain requests with extension CSP and validate the final media origin. */
(()=>{
 const hosts=['cdninstagram.com','fbcdn.net','tiktokcdn.com','tiktokcdn-us.com','tiktokcdn-eu.com','tiktok.com'];
 const allowed=url=>{try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&hosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h))}catch{return false}};
 async function read(url,signal,onProgress=()=>{}){
  if(!allowed(url))throw Error('This reel has no supported media link. Open its original post and retry.');
  const control=new AbortController(),abort=()=>control.abort(signal?.reason),timer=setTimeout(()=>control.abort(Error('Fetching the reel took too long. Check your connection and retry.')),90000);
  if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
  let response;
  try{
   try{response=await fetch(url,{signal:control.signal,credentials:'omit',redirect:'follow',referrerPolicy:'no-referrer'})}catch(e){if(control.signal.aborted)throw control.signal.reason||Error('Cancelled');throw Object.assign(Error('Could not fetch this reel. Check your connection, then retry.'),{refreshMedia:true})}
   if(!allowed(response.url||url))throw Error('The reel redirected to an unsupported media address.');
   if(!response.ok){const expired=[0,401,403,404,410].includes(response.status);throw Object.assign(Error(expired?'The reel’s media link is no longer available. Open the original post and retry.':`The media server returned ${response.status}. Please retry shortly.`),{refreshMedia:expired})}
   const type=response.headers.get('content-type')||'';
   if(!/^(audio|video|image)\//.test(type)&&!/^application\/octet-stream/.test(type))throw Error('The reel returned a page instead of an audio or video file. Open its original post and retry.');
   const total=Number(response.headers.get('content-length')),limit=100*1024*1024;
   if(total>limit)throw Error('This clip exceeds 100 MB.');
   if(!response.body)throw Error('The media response was empty. Retry this reel.');
   const reader=response.body.getReader(),parts=[];let size=0,last=0;
   try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit)throw Error('This clip exceeds 100 MB.');parts.push(value);if(Date.now()-last>500){last=Date.now();onProgress(size,total)}}}finally{await reader.cancel().catch(()=>{})}
   if(!size)throw Error('The reel has no media data.');
   return new Blob(parts,{type:type||'application/octet-stream'});
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);if(response?.body&&!response.body.locked)await response.body.cancel().catch(()=>{})}
 }
 globalThis.CopyfeedMediaFetch={read,allowed};
})();
