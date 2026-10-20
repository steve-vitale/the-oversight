'use strict';
// Reuse retained trusted-touch helpers; all gameplay is driven by real buttons.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('playwright');
const runTag=process.argv[2]||'r1';
const runnerSha256=crypto.createHash('sha256').update(fs.readFileSync(__filename,'utf8').replace(/\r\n/g,'\n')).digest('hex');
const helperFile='evidence/2026-10-20/favor-phone-r1.js',source=fs.readFileSync(helperFile,'utf8');
const end=source.indexOf('\n\n for(const kind');if(end<0)throw Error('Retained phone helper boundary changed');
const helper=source.slice(0,end).replaceAll('.playwright-mcp/coherence-','.playwright-mcp/favor-journal-'+runTag+'-').replaceAll('.playwright-mcp/coherence-partial.json','.playwright-mcp/favor-journal-'+runTag+'-partial.json');
const body=String.raw`
 const assert=process.getBuiltinModule('assert/strict'),cd=await page.context().newCDPSession(page);
 async function journal(setup,wanted,label){
  await tap('[data-field-panel="menu"]');await tap('#x-codex');
  const row=page.locator('[data-favor-id="'+setup.favorId+'"]');
  assert.equal(await row.count(),1,'One canonical favor row');
  for(let n=0;n<24;n++){
   const r=await row.boundingBox(),view=await page.locator('.journal-reader-body').boundingBox();
   if(r&&r.y>=view.y&&r.y+r.height<=view.y+view.height)break;
   const up=r.y>=view.y,distance=Math.min(view.height*.5,up?r.y+r.height-view.y-view.height+24:view.y-r.y+24);
   const x=view.x+view.width*.8,from=up?view.y+view.height-45:view.y+45,to=from+(up?-distance:distance);
   await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:from}]});
   for(let j=1;j<=8;j++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:from+(to-from)*j/8}]});await page.waitForTimeout(25);}
   await page.waitForTimeout(180);await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
  }
  const text=await row.innerText(),r=await row.boundingBox(),view=await page.locator('.journal-reader-body').boundingBox();
  if(!(r.y>=view.y&&r.y+r.height<=view.y+view.height)){await page.screenshot({path:'.playwright-mcp/favor-journal-scroll-failure.png'});throw Error('Favor row outside reader '+JSON.stringify({row:r,reader:view,text,scrollTop:await page.locator('.journal-reader-body').evaluate(e=>e.scrollTop)}));}
  assert(text.includes('('+wanted+')'),text);assert(text.includes('day '+setup.dueDay),text);
  const back=await page.locator('#b-back').boundingBox();assert(back.y>=0&&back.y+back.height<=height);
  if(wanted==='Accepted'&&setup.scenario==='food')assert(/pack.*pantry/i.test(text),text);
  await snap(label);trace.at(-1).journal={text,scrollTop:await page.locator('.journal-reader-body').evaluate(e=>e.scrollTop),back};
  await tap('#b-back');assert.equal(await page.locator('.journal-reader').count(),0);
 }
 async function endTalk(){if(await page.locator('#dlg-end').isVisible())await tap('#dlg-end');}
 for(const scenario of (process.env.FAVOR_ONLY==='expiry'?[]:['food','wound','illness'])){
  const setup=await load('/evidence/2026-10-20/favor-journal-'+scenario+'-fixture-r1.json');
  await talk(setup);await reply('dlg:commit');await drain();await snap(scenario+' accepted via actual conversation');
  await endTalk();await journal(setup,'Accepted',scenario+' saved task and deadline');
  if(scenario!=='food'){
   await talk(setup);await snap(scenario+' return to accepted favor');await reply('dlg:favor_action');await drain();await snap(scenario+' real physical care');await endTalk();
   await journal(setup,'Completed',scenario+' completed task');
  }
  await page.goto(base);await page.waitForLoadState('networkidle');await tap('[data-load="'+setup.key+'"]');
  await journal(setup,scenario==='food'?'Accepted':'Completed',scenario+' task survives native Continue');
 }
 const setup=await load('/evidence/2026-10-20/favor-journal-expiry-fixture-r1.json');
 await journal(setup,'Accepted','due today remains open while reading');
 await tap('[data-field-panel="menu"]');await tap('[data-lm="wait"]');await snap('real Wait at day boundary');
 await journal(setup,'Expired','nightfall expires the saved task');
 await page.goto(base);await page.waitForLoadState('networkidle');await tap('[data-load="'+setup.key+'"]');
 await journal(setup,'Expired','expiry survives native Continue');
 return{scope:'Prepared needs/clock in retained played saves; trusted touch, actual promise/help/Wait/Continue controls; journal scrolling only, no browser gameplay-helper calls or outcome grants.',height,trace,errors,helperFile:'evidence/2026-10-20/favor-phone-r1.js'};
`;
const journey=eval('('+helper+body+'\n})');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 fs.mkdirSync('.playwright-mcp',{recursive:true});
 for(const height of (process.env.FAVOR_ONLY?[736]:[736,844])){const context=await browser.newContext({viewport:{width:390,height},isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage();await page.goto('http://127.0.0.1:8921/');
  const result=await journey(page);assert.equal(result.errors.length,0,JSON.stringify(result.errors));result.sources=require('../../scripts/balance-panel').manifest(process.cwd());result.helperSha256=crypto.createHash('sha256').update(source.replace(/\r\n/g,'\n')).digest('hex');result.runnerSha256=runnerSha256;
  const file='evidence/2026-10-20/favor-journal-phone-'+height+'-'+runTag+'.json';fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({height,checkpoints:result.trace.length,errors:result.errors.length}));await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1});
