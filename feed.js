/* Profile feed adapter. Accepts data already loaded by the page; makes no API requests. */
(()=>{
 const E=globalThis.CopyfeedExtractors;
 function scope(href){try{const u=new URL(href),parts=u.pathname.split('/').filter(Boolean);if(u.hostname!=='www.instagram.com'||!parts.length||['p','reel','reels','explore','accounts','direct','stories','saved'].includes(parts[0]))return null;if(parts.length>2||(parts[1]&&!['reels','tagged'].includes(parts[1])))return null;return {key:u.origin+u.pathname,creator:parts[0].toLowerCase(),kind:parts[1]==='reels'?'reels':parts[1]==='tagged'?'tagged':'posts'}}catch{return null}}
 function decode(text){if(typeof text!=='string'||text.length>16000000)return [];const clean=text.replace(/^\s*for\s*\(\s*;;\s*\);\s*/,'').replace(/^\s*\)\]\}',?\s*/,'');try{return [JSON.parse(clean)]}catch{const values=[];for(const line of clean.split('\n').slice(0,1500)){try{values.push(JSON.parse(line))}catch{}}return values}}
 function fromObject(data,href){const active=scope(href);if(!active||active.kind==='tagged')return null;
  // Initial page data can wrap the same connections inside bootstrap arrays.
  // Recognize only profile connection keys, never arbitrary recommendation edges.
  const keys=active.kind==='reels'?['xdt_api__v1__clips__user__connection_v2','clips_connection']:['xdt_api__v1__feed__user_timeline_graphql_connection','edge_owner_to_timeline_media'];
  const stack=[data],seen=new WeakSet(),connections=[];let visited=0;
  while(stack.length&&visited++<30000){const x=stack.pop();if(!x||typeof x!=='object'||seen.has(x))continue;seen.add(x);for(const [key,value] of Object.entries(x)){if(keys.includes(key)&&Array.isArray(value?.edges))connections.push(value);else if(value&&typeof value==='object')stack.push(value)}}
  if(!connections.length)return null;
  const rows=new Map();let pageInfo=null;
  for(const connection of connections){let matched=0;for(const edge of connection.edges){const raw=edge?.node?.media||edge?.node;if(!raw)continue;for(const post of E.walk(raw,'instagram')){
   if((raw.code||raw.shortcode)&&post.id!=='instagram:'+(raw.code||raw.shortcode))continue;
   const creator=(post.creator||'').toLowerCase();const collaborators=[...(Array.isArray(raw.coauthor_producers)?raw.coauthor_producers:[])].map(x=>String(x?.username||'').toLowerCase());
   if(creator&&creator!==active.creator&&!collaborators.includes(active.creator))continue;
   rows.set(post.id,E.merge(rows.get(post.id),{...post,creator:post.creator||active.creator,source:'profile-response',sourceProfile:href}));matched++;
  }}if(matched||!connection.edges.length)pageInfo=connection.page_info;}
  // A response containing only another creator must not end this profile's run.
  if(!rows.size&&connections.every(c=>c.edges.length))return null;
  const pi=pageInfo;return {posts:[...rows.values()],hasNextPage:typeof pi?.has_next_page==='boolean'?pi.has_next_page:null,cursor:typeof pi?.end_cursor==='string'?pi.end_cursor:'',scope:active.key};
 }
 function fromText(text,href){return decode(text).map(data=>fromObject(data,href)).filter(Boolean)}
 globalThis.CopyfeedFeed={scope,fromObject,fromText,decode};
})();
