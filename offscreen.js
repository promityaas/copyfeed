/* Local audio processing and archive assembly live outside Instagram's CSP. */
let active=null,worker=null,controller=null,heartbeat=null,audioContext=null;const blobUrls=new Map();
async function message(m){const r=await chrome.runtime.sendMessage(m);if(r?.error)throw Error(r.error);return r}
async function progress(job,patch){if(active===job.id)await message({type:'engine-event',jobId:job.id,patch})}
const media=(url,signal,progress)=>CopyfeedMediaFetch.read(url,signal,progress);
async function speech(blob,job,signal){CopyfeedLanguage.assert(job.items[0].post,job.languageConfirmed);const context=new AudioContext();audioContext=context;let decoded;try{decoded=await context.decodeAudioData(await blob.arrayBuffer())}catch{throw Error('Could not decode this reel’s audio. MP4 with AAC, MP3 and WAV are supported.')}finally{await context.close().catch(()=>{});if(audioContext===context)audioContext=null}if(active!==job.id)throw Error('Cancelled');if(decoded.duration>300)throw Error('Local transcription supports clips up to five minutes.');const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*16000),16000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();const buffer=await offline.startRendering(),audio=buffer.getChannelData(0);if(active!==job.id)throw Error('Cancelled');worker??=new Worker('transcriber.js',{type:'module'});return new Promise((resolve,reject)=>{const w=worker;let settled=false;const finish=(error,result)=>{if(settled)return;settled=true;clearTimeout(timer);signal.removeEventListener('abort',abort);w.onmessage=w.onerror=null;if(error){w.terminate();if(worker===w)worker=null;reject(error)}else resolve(result)};const abort=()=>finish(Error('Cancelled'));const timer=setTimeout(()=>finish(Error('Transcription took too long. Retry a shorter reel.')),15*60*1000);w.onerror=e=>finish(Error(e.message||'The speech engine could not start. Reload Copyfeed and retry.'));w.onmessage=({data})=>{if(active!==job.id)return;if(data.type==='progress')void progress(job,{message:data.text}).catch(()=>{});if(data.type==='result')finish(null,data);if(data.type==='error')finish(Error(data.text))};signal.addEventListener('abort',abort,{once:true});if(signal.aborted)return abort();w.postMessage({audio,language:job.language||''},[audio.buffer])})}

async function run(job){active=job.id;const control=new AbortController();controller=control;const files=[];let totalBytes=0;const jobHeartbeat=setInterval(()=>void progress(job,{heartbeat:Date.now()}).catch(()=>{}),15000);heartbeat=jobHeartbeat;try{for(let i=0;i<job.items.length&&active===job.id;i++){const item=job.items[i];try{await progress(job,{index:i,state:'resolving',message:`Reading ${i+1} of ${job.items.length}…`});const r=await message({type:'engine-resolve',jobId:job.id,post:item.post});if(active!==job.id)break;let post=r.post;job.items[i].post=post;await progress(job,{index:i,state:'processing',post,message:job.kind==='archive'?`Adding ${i+1} of ${job.items.length} to ZIP…`:`Transcribing ${i+1} of ${job.items.length} on this device…`});
 if(job.kind==='transcribe'){if(post.mediaType==='image'||post.mediaType==='carousel')throw Error('Select a video with speech.');let blob;const readAudio=()=>media(post.mediaUrl,control.signal,(size,total)=>void progress(job,{message:`Loading reel audio… ${Math.round(size/1024/1024)} MB${total?' of '+Math.round(total/1024/1024)+' MB':''}`}).catch(()=>{}));
 await progress(job,{message:'Loading reel audio…'});
 try{blob=await readAudio()}catch(error){if(!error.refreshMedia||control.signal.aborted)throw error;await progress(job,{message:'Refreshing the reel’s media link…'});post=(await message({type:'engine-resolve',jobId:job.id,post,refresh:true})).post;blob=await readAudio()}
 await progress(job,{message:'Reading the audio track…'});const result=await speech(blob,job,control.signal);if(active!==job.id)break;if(!result.text.trim())throw Error('No speech was recognized. Try a clip with clear spoken audio.');await progress(job,{index:i,state:'complete',post:{...post,transcript:result.text.trim(),transcriptSegments:result.chunks||[]}})}
 else{
  // Retry the complete post once so a carousel never mixes expired and fresh assets.
  const readAssets=async()=>{
   const result=[];let size=0;
   const assets=post.mediaAssets?.length?post.mediaAssets:[{url:post.mediaUrl||post.thumbnail,type:post.mediaType==='video'?'video':'image'}];
   for(let j=0;j<assets.length;j++){
    const blob=await media(assets[j].url,control.signal);if(active!==job.id)throw Error('Cancelled');
    size+=blob.size;if(totalBytes+size>300*1024*1024)throw Error('ZIP reached 300 MB. Download a smaller selection.');
    const ext=blob.type.startsWith('image/')?(blob.type.includes('png')?'png':'jpg'):'mp4';
    result.push({name:CopyfeedResearch.filename(post,i)+(assets.length>1?'-'+(j+1):'')+'.'+ext,bytes:new Uint8Array(await blob.arrayBuffer())});
   }
   return {files:result,size};
  };
  let result;
  try{result=await readAssets()}catch(error){
   if(!error.refreshMedia||control.signal.aborted)throw error;
   await progress(job,{message:'Refreshing the post’s media links…'});
   post=(await message({type:'engine-resolve',jobId:job.id,post,refresh:true})).post;
   result=await readAssets();
  }
  if(active===job.id){totalBytes+=result.size;files.push(...result.files);await progress(job,{index:i,state:'complete',post})}
 }
 }catch(e){if(active!==job.id)break;await progress(job,{index:i,state:'error',error:e.message});if(/PLATFORM_LIMIT|SIGN_IN_REQUIRED|300 MB/.test(e.message))break}}
 if(active===job.id){if(job.kind==='archive'&&files.length){const url=URL.createObjectURL(CopyfeedZip.zip(files));blobUrls.set(job.id,url);await message({type:'engine-archive',jobId:job.id,url})}await progress(job,{finished:true,message:job.kind==='archive'?'Archive prepared. Check the download status.':'Transcription finished. Review the text before using it.'})}
 }catch(e){await progress(job,{finished:true,error:e.message,message:e.message}).catch(()=>{})}finally{clearInterval(jobHeartbeat);worker?.terminate();worker=null;if(active===job.id)active=null;if(controller===control)controller=null}}
chrome.runtime.onMessage.addListener((m,s,reply)=>{if(m.target!=='copyfeed-offscreen'||s.id!==chrome.runtime.id)return;if(m.type==='run'){if(active){reply({error:'Another processing job is running.'});return}reply({ok:true});void run(m.job);return}if(m.type==='cancel'){active=null;controller?.abort();worker?.terminate();worker=null;void audioContext?.close().catch(()=>{});clearInterval(heartbeat);reply({ok:true});return}if(m.type==='status'){reply({jobId:active});return}if(m.type==='release'){const url=blobUrls.get(m.jobId);if(url)URL.revokeObjectURL(url);blobUrls.delete(m.jobId);reply({ok:true})}});
