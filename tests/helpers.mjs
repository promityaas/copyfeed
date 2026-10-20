import vm from 'node:vm';import {readFileSync} from 'node:fs';
export function load(files,extra={}){const context=vm.createContext({URL,TextEncoder,TextDecoder,Uint8Array,DataView,Blob,AbortController,AbortSignal,setTimeout,clearTimeout,console,crypto,...extra});for(const file of files)vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),context,{filename:file});return context;}
export const core=['extractors.js','feed.js','adapters.js','research.js','intelligence.js','language.js','research-store.js','captions.js','xlsx.js'];
export const post=(i,extra={})=>({id:'youtube:video_'+i,url:'https://www.youtube.com/shorts/video_'+i,creator:'@alice',platform:'youtube',mediaType:'video',views:100,createdAt:'2026-10-01T00:00:00Z',...extra});
