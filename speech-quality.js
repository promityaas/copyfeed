// Reject obvious decoding loops; do not silently remove real repeated speech.
export function transcriptProblem(text){
 const words=String(text||'').toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
 if(!words.length)return 'No speech was recognized. Try a clip with clear spoken audio.';
 for(let width=1;width<=16;width++){
  const repeats=width===1?8:width===2?6:4;
  for(let i=0;i+width*repeats<=words.length;i++){
   let same=true;for(let j=width;j<width*repeats;j++)if(words[i+j]!==words[i+j%width]){same=false;break}
   if(same)return 'The speech model repeated a phrase and could not produce a reliable transcript. Try a shorter clip with clearer speech.';
  }
 }
 return '';
}
export function audible(audio){let sum=0;for(const x of audio)sum+=x*x;return audio.length>0&&Math.sqrt(sum/audio.length)>=0.0005}
export function pcmWav(audio){
 const bytes=new Uint8Array(44+audio.length*2),v=new DataView(bytes.buffer);
 const text=(i,s)=>{for(let j=0;j<s.length;j++)bytes[i+j]=s.charCodeAt(j)};
 text(0,'RIFF');v.setUint32(4,bytes.length-8,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,audio.length*2,true);
 for(let i=0;i<audio.length;i++){const x=Math.max(-1,Math.min(1,audio[i]));v.setInt16(44+i*2,x<0?x*32768:x*32767,true)}return bytes;
}
