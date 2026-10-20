(()=>{
 const warning="Copyfeed's on-device transcription supports English speech only. This video's spoken language could not be confirmed. Non-English audio may produce inaccurate results.";
 function check(p){const evidence=String(p.audioLanguage||p.originalAudioLanguage||'').toLowerCase();const caption=p.caption||'';if(evidence&&!['und','unknown','auto'].includes(evidence)){if(!/^en(?:-|$)|^english$/.test(evidence))return {state:'non-English',reason:'Original audio metadata indicates '+evidence};return {state:'English',reason:'Original audio language metadata indicates English.'};}
 // Scripts or known Hinglish phrases are conservative warning signals, never English proof.
 if(/[\u0900-\u097f\u0600-\u06ff\u0b80-\u0bff]/.test(caption)||/\b(hai|nahi|kaise|kya|aap|karna|kyun|yeh)\b/i.test(caption))return {state:'uncertain',reason:'Caption language may differ from audio; multilingual or non-English cues were found.',warning};return {state:'uncertain',reason:'Original spoken language has not been established. Caption tracks and Latin script alone do not prove English audio.',warning};}
 function assert(p,confirmed=false){const result=check(p);if(result.state==='non-English')throw Error('English-only local transcription disabled. '+result.reason+' Use accessible native captions.');if(result.state==='uncertain'&&!confirmed)throw Error(warning);return result;}
 globalThis.CopyfeedLanguage={check,assert,warning};
})();
