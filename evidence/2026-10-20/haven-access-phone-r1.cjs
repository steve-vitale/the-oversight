'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{chromium}=require('playwright'),B=require('../../scripts/balance-panel'),{expectedInputs}=require('../../scripts/phone-frame-proof-update');
const tag=process.argv[2]||'probe-r1',hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
const source=fs.readFileSync('evidence/2026-10-20/favor-phone-r1.js','utf8'),end=source.indexOf('\n\n for(const kind');if(end<0)throw Error('Missing retained touch helper');
const helper=source.slice(0,end).replaceAll('.playwright-mcp/coherence-','.playwright-mcp/haven-access-'+tag+'-').replaceAll('await page.goto(base);','await page.goto(base);await page.waitForLoadState("networkidle");');
const body=String.raw`
 async function inspect(label,setup){await snap(label);const state=await page.evaluate(key=>{const G=Scattering.Game,s=G.state.scholar,t=G.map.tiles[G.map.py][G.map.px],saved=JSON.parse(localStorage.getItem(key));return{live:{inside:s.insideHaven,x:s.mx,y:s.my,kcal:s.kcal},saved:saved&&{inside:saved.scholar.insideHaven,x:saved.scholar.mx,y:saved.scholar.my},grounds:JSON.stringify({grid:t.groundsDetail,secrets:t.secrets||{}})}},setup.key);trace.at(-1).state=state;return state;}
 async function context(label){let sel='.phone-primary-actions [data-ctx]:has-text('+JSON.stringify(label)+')';if(!await page.locator(sel).count()){await tap('[data-field-panel="actions"]');sel='.field-tool-body [data-ctx]:has-text('+JSON.stringify(label)+')';}if(await page.locator(sel).count()!==1)throw Error('One visible '+label+' required');await tap(sel);}
 async function walk(goal){for(let i=0;i<35;i++){const step=await page.evaluate(goal=>{const G=Scattering.Game,s=G.state.scholar,c=G.map.tiles[G.map.py][G.map.px].detail;if(s.mx===goal[0]&&s.my===goal[1])return null;const q=[[s.mx,s.my,[]]],seen=new Set();while(q.length){const[x,y,path]=q.shift(),k=x+','+y;if(seen.has(k))continue;seen.add(k);if(x===goal[0]&&y===goal[1])return path[0];for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const cell=c[y+dy]?.[x+dx];if(cell&&!['wall','water','tree','bigtree','fire','tent','rubble','lodge'].includes(cell))q.push([x+dx,y+dy,[...path,[dx,dy]]]);}}throw Error('No visible walking route');},goal);if(!step)return;await tap('.dpbtn[data-dx="'+step[0]+'"][data-dy="'+step[1]+'"]');}throw Error('Walk did not finish');}
 for(const kind of ['fresh','legacy']){
  const setup=await load('/evidence/2026-10-20/haven-access-'+kind+'-fixture-r1.json');
  if(await page.locator('[data-sheetbtn="0"]').isVisible())await tap('[data-sheetbtn="0"]');
  await inspect(kind+' actual hall door',setup);await context('Step outside');const outside=await inspect(kind+' actual door exit',setup);
  if(outside.live.inside||outside.saved.inside||outside.live.x!==outside.saved.x||outside.live.y!==outside.saved.y)throw Error('Exit must already be persisted before unload');
  if(kind==='fresh'&&(outside.live.x!==4||outside.live.y!==5))throw Error('Fresh south doorstep expected');
  if(outside.grounds!==setup.preserved)throw Error('Door exit changed saved structures');
  await walk([8,5]);const rim=await inspect(kind+' paid walk from hall to the world rim',setup);if(rim.live.kcal>=outside.live.kcal)throw Error('Actual walk must cost food');
  await walk(kind==='fresh'?[4,5]:[6,5]);await context('Go inside');const entered=await inspect(kind+' native hall re-entry',setup);
  if(!entered.live.inside||!entered.saved.inside)throw Error('Entry must already be persisted');
  if(entered.grounds!==setup.preserved)throw Error('Entry changed player structures');
  await context('Step outside');await inspect(kind+' repeat door exit',setup);
  await page.goto(base);await page.waitForLoadState('networkidle');await tap('[data-load="'+setup.key+'"]');const continued=await inspect(kind+' native Continue preserves exit and grounds',setup);
  if(continued.live.inside||continued.live.x!==continued.saved.x||continued.live.y!==continued.saved.y||continued.grounds!==setup.preserved)throw Error('Continue lost completed transition');
 }
 return{height,trace,errors,scope:'Declared prepared fresh/legacy Haven. All game mutations through trusted visible touch controls; plain read-only state/serialized save inspection. Browser emulation, not physical device or natural campaign.'};
`;
const journey=eval('('+helper+body+'\n})');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const height of [736,844]){
  const initial=B.manifest(process.cwd()),inputs={},pending=[],failures=[];
  const ctx=await browser.newContext({viewport:{width:390,height},hasTouch:true,isMobile:true,deviceScaleFactor:1}),page=await ctx.newPage();
  page.on('response',r=>{const u=new URL(r.url());if(u.origin!=='http://127.0.0.1:8921'||r.status()!==200||u.pathname.startsWith('/evidence/')||!(u.pathname==='/'||/\.(html|js|css|json)$/.test(u.pathname)))return;const file=u.pathname.slice(1)||'index.html';pending.push(r.text().then(text=>{const sha=hash(text);if(inputs[file]&&inputs[file]!==sha)throw Error('Mixed source '+file);inputs[file]=sha;}).catch(e=>failures.push({file,error:e.message})));});
  await page.goto('http://127.0.0.1:8921');await page.waitForLoadState('networkidle');const receipt=await journey(page);await Promise.all(pending);
  assert.deepEqual(receipt.errors,[]);assert.deepEqual(failures,[]);assert.deepEqual(B.manifest(process.cwd()),initial);
  for(const[f,sha]of Object.entries(expectedInputs(process.cwd())))assert.equal(inputs[f],sha,'Served source '+f);
  Object.assign(receipt,{sources:initial,networkInputs:inputs,helperSha256:hash(source),runnerSha256:hash(fs.readFileSync(__filename,'utf8'))});
  fs.writeFileSync('evidence/2026-10-20/haven-access-phone-'+height+'-'+tag+'.json',JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({height,checkpoints:receipt.trace.length,pageErrors:receipt.errors.length}));await ctx.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
