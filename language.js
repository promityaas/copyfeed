/* Audio metadata is evidence, not a substitute for listening to the source. */
(()=>{
 const warning="Automatic language detection may be imperfect for Hindi-English mixed speech. Check the transcript against the original audio.";
 const normalize=value=>{const s=String(value||"").trim().toLowerCase();if(["hi","hi-in","hindi","हिन्दी","हिंदी"].includes(s))return "hindi";if(["en","en-us","en-in","english"].includes(s))return "english";return "auto"};
 function check(post={}){const raw=post.audioLanguage||post.originalAudioLanguage||"";const lang=normalize(raw);return lang==="auto"?{state:"uncertain",reason:"Spoken language not verified; choose Auto, Hindi or English.",warning}:{state:lang==="hindi"?"Hindi":"English",reason:"Original audio metadata indicates "+String(raw)};}
 function assert(post={},requested="auto",confirmed=false){if(typeof requested==="boolean")requested="auto";const lang=normalize(requested);if(!["auto","hindi","english"].includes(lang))throw Error("Unsupported transcription language.");const state=check(post);if(lang==="english"&&state.state==="Hindi")throw Error("This audio is labelled Hindi. Select Hindi or Automatic instead.");return {state:state.state,language:lang,warning};}
 globalThis.CopyfeedLanguage={check,assert,warning,normalize};
})();
