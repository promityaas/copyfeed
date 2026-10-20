import {chromium} from 'playwright';import {readFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage();
const svg=await readFile(new URL('../icons/bolt.svg',import.meta.url),'utf8');
for(const size of [16,32,48,128]){await page.setViewportSize({width:size,height:size});await page.setContent('<style>body{margin:0}svg{display:block;width:100vw;height:100vh}</style>'+svg);await page.screenshot({path:new URL(`../icons/icon-${size}.png`,import.meta.url).pathname});}await browser.close();
