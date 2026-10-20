(()=>{const utf8 = new TextEncoder();
function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) {
    c ^= b;
    for (let j = 0; j < 8; j++)
        c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
} return (c ^ 0xffffffff) >>> 0; }
function header(size, fields) { const b = new Uint8Array(size), v = new DataView(b.buffer); for (const [o, n, value] of fields)
    n === 2 ? v.setUint16(o, value, true) : v.setUint32(o, value, true); return b; }
function join(chunks) { const all = new Uint8Array(chunks.reduce((s, a) => s + a.length, 0)); let o = 0; for (const c of chunks) {
    all.set(c, o);
    o += c.length;
} return all; }
function zip(files) { const local = [], central = []; let offset = 0; for (const [name, text] of Object.entries(files)) {
    const n = utf8.encode(name), b = utf8.encode(text), crc = crc32(b);
    const h = header(30, [[0, 4, 0x04034b50], [4, 2, 20], [14, 4, crc], [18, 4, b.length], [22, 4, b.length], [26, 2, n.length]]);
    local.push(h, n, b);
    central.push(header(46, [[0, 4, 0x02014b50], [4, 2, 20], [6, 2, 20], [16, 4, crc], [20, 4, b.length], [24, 4, b.length], [28, 2, n.length], [42, 4, offset]]), n);
    offset += h.length + n.length + b.length;
} const directory = join(central); return join([...local, directory, header(22, [[0, 4, 0x06054b50], [8, 2, Object.keys(files).length], [10, 2, Object.keys(files).length], [12, 4, directory.length], [16, 4, offset]])]); }
function xlsx(posts) {
 const I=globalThis.CopyfeedIntelligence,ranked=I?I.rank(posts):posts;
 const sheets=[['Posts and metrics',['id','url','platform','creator','title','caption','createdAt','capturedAt','views','likes','comments','shares','saves','duration','metricAvailability'],ranked.map(p=>({...p,metricAvailability:['views','likes','comments','shares','saves'].map(k=>k+':'+(p[k]==null?'unavailable':'available')).join('; ')}))],['Outlier rankings',['id','url','format','views','outlier','baseline','baselineSample','baselineMethod'],[...ranked].sort((a,b)=>(b.outlier??-1)-(a.outlier??-1))],['Hook analysis',['postId','url','text','source','categories','confidence'],ranked.map(p=>({postId:p.id,url:p.url,...(I?I.hooks(p):{})}))],['Content pillars',['topic','count','medianViews','medianOutlier','topHook','strongest','postIds'],I?I.clusters(ranked):[]],['Audience questions',['topic','kind','comments','interpretation'],I?I.questions(posts.flatMap(p=>p.audienceComments||[])):[]],['Opportunity Scores',['id','url','opportunityScore','opportunity','engagementRate','engagementActions','engagementDenominator','shareabilityRate','saveRate','viewsPerDay','growthVelocity'],ranked],['Research notes',['id','url','platform','creator','notes','tags','transcript'],ranked]];
 const esc=x=>String(x??'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').slice(0,32767).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s};
 const ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main',rel='http://schemas.openxmlformats.org/package/2006/relationships';
 const files={'[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')+'</Types>', '_rels/.rels':`<Relationships xmlns="${rel}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`, 'xl/workbook.xml':`<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>`+sheets.map((s,i)=>`<sheet name="${esc(s[0])}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')+'</sheets></workbook>', 'xl/_rels/workbook.xml.rels':`<Relationships xmlns="${rel}">`+sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')+'</Relationships>'};
 for(const [i,[name,keys,posts]] of sheets.entries()){const rows=[keys,...posts.map(p=>keys.map(k=>typeof p[k]==='object'&&p[k]!==null?JSON.stringify(p[k]):p[k]))];const xml=rows.map((row,i)=>`<row r="${i+1}">`+row.map((v,j)=>v==null?`<c r="${col(j)}${i+1}"/>`:typeof v==='number'&&Number.isFinite(v)?`<c r="${col(j)}${i+1}"><v>${v}</v></c>`:`<c r="${col(j)}${i+1}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`).join('')+'</row>').join('');files[`xl/worksheets/sheet${i+1}.xml`]=`<worksheet xmlns="${ns}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>${xml}</sheetData><autoFilter ref="A1:${col(keys.length-1)}${rows.length}"/></worksheet>`;}
 return zip(files);
}
globalThis.CopyfeedXlsx={xlsx};})();
