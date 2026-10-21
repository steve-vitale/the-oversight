'use strict';
const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),{chromium}=require('playwright'),{expectedInputs}=require('../../scripts/phone-frame-proof-update');
const expected=expectedInputs(process.cwd()),fixture='evidence/2026-10-20/caregiver-terminal-persist-r2-on-table.json';
const recipe=fs.readFileSync('evidence/2026-10-20/favor-phone-r1.js','utf8'),end=recipe.indexOf('\n\n for(const kind'),prefix=recipe.slice(0,end).replaceAll('.playwright-mcp/coherence-','.playwright-mcp/caregiver-terminal-table-r3-').replaceAll('await page.goto(base);','await page.goto(base);await page.waitForLoadState("networkidle");');
const body=String.raw`
 const setup=await load('/FIXTURE');
 for(let i=0;i<12&&await page.locator('.arrival-next').count();i++){
  for(let s=0;s<8;s++){const b=await page.locator('.arrival-next').boundingBox();if(b.y>=0&&b.y+b.height<=height)break;const cd=await page.context().newCDPSession(page);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:height-90}]});for(let j=1;j<=6;j++)await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:300,y:height-90-(height-180)*j/6}]});await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);}await tap('.arrival-next');
 }await drain();await snap('natural settled day267 Continue');
 const state=()=>page.evaluate(()=>{const G=Scattering.Game,s=G.state.scholar;return{day:s.day,ticks:s.dayTicks,kcal:s.kcal,part:G.dayPart,monster:!!s.monster,tableWaiting:G.state.village.tableWaiting,tableDone:G.state.village.tableDone};});
 const before=await state();if(before.day!==267||before.part!==3)throw Error('Expected coherent natural decision boundary');
 await tap('[data-field-panel="place"]');await snap('Table is first in Place');
 const entry=await page.locator('[data-table-seat]').evaluate(e=>{const p=e.closest('.field-tool-body'),r=e.getBoundingClientRect(),pr=p.getBoundingClientRect();return{count:document.querySelectorAll('[data-table-seat]').length,disabled:e.disabled,html:e.closest('.field-table-entry').innerText,rect:r.toJSON(),panel:pr.toJSON(),scroll:p.scrollTop};});
 if(entry.count!==1||!entry.disabled||!/Finish the current encounter/i.test(entry.html))throw Error('Table state/reason missing or duplicated');
 if(entry.scroll||entry.rect.y<entry.panel.y||entry.rect.bottom>entry.panel.bottom)throw Error('Table needs scrolling');
 await tap('[data-field-panel="place"]');await snap('Place closes without spending resources');
 if(JSON.stringify(before)!==JSON.stringify(await state()))throw Error('Opening Place spent game resources');
 await page.goto(base);await page.waitForLoadState('networkidle');await tap('[data-load="'+setup.key+'"]');await drain();await snap('native Continue keeps coherent clock and encounter');
 const continued=await state();if(JSON.stringify(before)!==JSON.stringify(continued))throw Error('Continue lost natural boundary');
 if(errors.length)throw Error(errors.join('\n'));return{height,trace,errors,before,continued,entry,scope:'Unedited naturally reached settled day267 save, Table entry and truthful encounter gate immediately visible in Place; no Table win or physical-device clearance.'};
`;
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{for(const height of [736,844]){const context=await browser.newContext({viewport:{width:390,height},isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage(),inputs={},pending=[];
 page.on('response',r=>{const u=new URL(r.url()),rel=u.pathname.slice(1)||'index.html';if(u.origin==='http://127.0.0.1:8921'&&r.status()===200&&expected[rel])pending.push(r.text().then(s=>inputs[rel]=crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex')));});
 await page.goto('http://127.0.0.1:8921');const result=await eval('('+prefix+body.replace('FIXTURE',fixture)+'\n})')(page);await Promise.all(pending);assert.deepEqual(inputs,expected);assert.deepEqual(expectedInputs(process.cwd()),expected);
 fs.writeFileSync('evidence/2026-10-20/caregiver-terminal-table-phone-'+height+'-r3.json',JSON.stringify({...result,fixture,fixtureSha256:crypto.createHash('sha256').update(fs.readFileSync(fixture)).digest('hex'),networkInputs:inputs},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({height,stages:result.trace.length,entry:result.entry.rect,errors:result.errors}));await context.close();}}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
