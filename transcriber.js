import {audible,transcriptProblem} from './speech-quality.js';
import {pipeline,env} from './whisper/transformers.web.min.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.wasmPaths=new URL('./whisper/',self.location.href).href;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
let transcriber;
self.onmessage=async({data})=>{
 try{
  if(!(data.audio instanceof Float32Array)||data.audio.length>16000*300)throw Error('Choose audio up to five minutes.');
  if(data.language&&!['english','en'].includes(data.language))throw Error('Free transcription supports English only. Hindi and Hinglish are not supported in this release.');
  if(!audible(data.audio))throw Error('No audible speech was found. Try a clip with clear spoken audio.');
  transcriber??=await pipeline('automatic-speech-recognition','Xenova/whisper-tiny.en',{device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress')self.postMessage({type:'progress',text:`Downloading speech model: ${p.file} · ${Math.round(p.progress)}%`});else if(p.status==='initiate')self.postMessage({type:'progress',text:'Preparing the speech model. The first use requires a model download.'})}});
  self.postMessage({type:'progress',text:'Transcribing on this device. Keep this tab open.'});
  const result=await transcriber(data.audio,{chunk_length_s:30,stride_length_s:5,return_timestamps:true,chunk_callback:()=>self.postMessage({type:'progress',text:'Processing the next audio segment on this device…'})});
  const problem=transcriptProblem(result.text);if(problem)throw Error(problem);
  self.postMessage({type:'result',text:result.text,chunks:result.chunks});
 }catch(e){self.postMessage({type:'error',text:e?.message||String(e)})}
};
