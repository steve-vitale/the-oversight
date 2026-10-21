'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{chromium}=require('playwright'),B=require('../../scripts/balance-panel'),{expectedInputs}=require('../../scripts/phone-frame-proof-update');
const tag=process.argv[2]||'r1',hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex'),source=fs.readFileSync('evidence/2026-10-20/favor-phone-r1.js','utf8'),end=source.indexOf('\n\n for(const kind');if(end<0)throw Error('Retained helper absent');
const helper=source.slice(0,end).replaceAll('.playwright-mcp/coherence-','.playwright-mcp/haven-access-combat-'+tag+'-').replaceAll('await page.goto(base);','await page.goto(base);await page.waitForLoadState("networkidle");');
const body=String.raw`
 async function scene(label,setup){await snap(label);const state=await page.evaluate(key=>{const G=Scattering.Game,f=G.tbfight,p=f?.fighters?.find(x=>x.key==='p'),saved=JSON.parse(localStorage.getItem(key));return{inside:G.state.scholar.insideHaven,x:G.state.scholar.mx,y:G.state.scholar.my,inCombat:!!(f&&!f.over),round:f?.round,fled:p?.fled,moveLeft:p?.moveLeft,pursuers:G.state.doorFledMonsters,saved:{inside:saved.scholar.insideHaven,x:saved.scholar.mx,y:saved.scholar.my,fight:!!saved.run.tbfight,pursuers:saved.doorFledMonsters},buttons:document.querySelector('.phone-primary-actions')?.innerText}},setup.key);trace.at(-1).state=state;return state;}
 for(const kind of ['open','sealed']){
  const setup=await load('/evidence/2026-10-20/haven-access-combat-'+kind+'-fixture-r2.json');await page.waitForTimeout(900);await scene(kind+' prepared actual player turn',setup);
  await tap('.dpbtn[data-dx="0"][data-dy="1"]');await page.waitForTimeout(1000);const moved=await scene(kind+' trusted touch onto the hall door',setup);
  if(kind==='open'){
   if(moved.inCombat||moved.inside||moved.x!==4||moved.y!==5||moved.saved.inside||moved.saved.fight||!moved.saved.pursuers?.some(m=>m.id==='hushwolf'))throw Error('Actual door flee must settle and persist');
  }else{
   if(!moved.inCombat||!moved.inside||moved.fled||moved.pursuers)throw Error('Sealed yard granted a false combat escape');
   await tap('.phone-primary-actions button:has-text("Wait")');await page.waitForTimeout(1800);const waited=await scene('refused door still permits a real Wait and enemy turn',setup);if(!waited.inCombat||!waited.inside)throw Error('Refused door broke subsequent combat');
  }
  await page.goto(base);await page.waitForLoadState('networkidle');await tap('[data-load="'+setup.key+'"]');await page.waitForTimeout(1000);const continued=await scene(kind+' actual Continue after the door attempt',setup);
  if(kind==='open'?(continued.inCombat||continued.inside):(!continued.inCombat||!continued.inside))throw Error('Continue changed the door outcome');
 }
 return{height,trace,errors,scope:'Prepared indoor fight with ordinary starting player health; all mutations through trusted visible touch, actual Wait/enemy turn and Continue. Proves door input boundary, not natural scene, victory, balance or physical device.'};
`;
const journey=eval('('+helper+body+'\n})');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{for(const height of [736,844]){
 const initial=B.manifest(process.cwd()),inputs={},pending=[],failures=[],ctx=await browser.newContext({viewport:{width:390,height},hasTouch:true,isMobile:true,deviceScaleFactor:1}),page=await ctx.newPage();
 page.on('response',r=>{const u=new URL(r.url());if(u.origin!=='http://127.0.0.1:8921'||r.status()!==200||u.pathname.startsWith('/evidence/')||!(u.pathname==='/'||/\.(html|js|css|json)$/.test(u.pathname)))return;const file=u.pathname.slice(1)||'index.html';pending.push(r.text().then(s=>{const sha=hash(s);if(inputs[file]&&inputs[file]!==sha)throw Error('Mixed source '+file);inputs[file]=sha;}).catch(e=>failures.push({file,error:e.message})));});
 await page.goto('http://127.0.0.1:8921');await page.waitForLoadState('networkidle');const receipt=await journey(page);await Promise.all(pending);assert.deepEqual(receipt.errors,[]);assert.deepEqual(failures,[]);assert.deepEqual(B.manifest(process.cwd()),initial);for(const[f,sha]of Object.entries(expectedInputs(process.cwd())))assert.equal(inputs[f],sha,'Served source '+f);
 Object.assign(receipt,{sources:initial,networkInputs:inputs,helperSha256:hash(source),runnerSha256:hash(fs.readFileSync(__filename,'utf8'))});fs.writeFileSync('evidence/2026-10-20/haven-access-combat-phone-'+height+'-'+tag+'.json',JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({height,checkpoints:receipt.trace.length,pageErrors:receipt.errors.length}));await ctx.close();
 }}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
