/* Additive schema migration: legacy posts/settings are never replaced by defaults. */
(()=>{
 const empty=()=>({schema:4,sessions:[],hooks:[],briefs:[],topicEdits:{}});
 async function migrate(storage){const s=await storage.get(['research','posts','dataSchema']);if(s.research?.schema>4)throw Error('This library was created by a newer Copyfeed. Update the extension before writing.');if(!s.research)await storage.set({research:empty(),dataSchema:4});else if(s.dataSchema!==4)await storage.set({dataSchema:4});return s.research||empty();}
 function observe(prior,next,at){const old=(prior?.snapshots||[]).filter(x=>x.at);const sample={at,...Object.fromEntries(['views','likes','comments','shares','saves'].map(k=>[k,typeof next[k]==='number'&&Number.isFinite(next[k])&&next[k]>=0?next[k]:null]))};const last=old.at(-1);if(last&&Date.parse(at)-Date.parse(last.at)<60000)return [...old.slice(0,-1),{...sample,at:last.at}];return [...old,sample].slice(-120);}
 function session(research,current,posts){const old=research.sessions.find(x=>x.id===current.id),next={...old,...current,postIds:[...new Set([...(old?.postIds||[]),...posts.map(p=>p.id)])]};return {...research,sessions:[...research.sessions.filter(x=>x.id!==current.id),next].slice(-200)};}
 function exportData(posts,research){return {product:'Copyfeed',schema:4,exportedAt:new Date().toISOString(),posts,research};}
 globalThis.CopyfeedStore={empty,migrate,observe,session,exportData};
})();
