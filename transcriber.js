/* On-device multilingual Whisper. Model is downloaded on first transcription. */
import {audible,transcriptProblem} from './speech-quality.js';
import {pipeline,env} from './whisper/transformers.web.min.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.wasmPaths=new URL('./whisper/',self.location.href).href;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
let modelPromise;
function getModel(){
 modelPromise??=pipeline('automatic-speech-recognition','Xenova/whisper-base',{
  device:'wasm',dtype:'q8',progress_callback:p=>{
   if(p.status==='progress')self.postMessage({type:'progress',text:`Downloading multilingual model: ${p.file} · ${Math.round(p.progress)}%`});
   else if(p.status==='initiate')self.postMessage({type:'progress',text:'Preparing Hindi/English Whisper model (first use downloads the model).'});
  }
 }).catch(error=>{modelPromise=null;throw error});
 return modelPromise;
}
self.onmessage=async({data})=>{
 try{
  if(!(data.audio instanceof Float32Array)||data.audio.length>16000*300)throw Error('Choose audio up to five minutes.');
  if(!audible(data.audio))throw Error('No audible speech was found. Try a clip with clear spoken audio.');
  const value=String(data.language||'auto').toLowerCase();
  const mode=({hi:'hindi',hindi:'hindi',en:'english',english:'english',auto:'auto'})[value];
  if(!mode)throw Error('Choose Automatic, Hindi or English.');
  const transcriber=await getModel();
  self.postMessage({type:'progress',text:'Transcribing locally in '+(mode==='auto'?'detected language':mode)+'…'});
  const args={task:'transcribe',chunk_length_s:30,stride_length_s:5,return_timestamps:true,
   chunk_callback:()=>self.postMessage({type:'progress',text:'Processing the next audio segment on this device…'})};
  if(mode!=='auto')args.language=mode;
  const result=await transcriber(data.audio,args);
  const problem=transcriptProblem(result.text);if(problem)throw Error(problem);
  self.postMessage({type:'result',text:result.text,chunks:result.chunks||[],language:mode});
 }catch(e){self.postMessage({type:'error',text:e?.message||String(e)})}
};
