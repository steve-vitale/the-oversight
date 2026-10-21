'use strict';
const fs=require('fs'),{chromium}=require('playwright');
const recipe=fs.readFileSync('evidence/2026-10-20/favor-phone-r1.js','utf8'),end=recipe.indexOf('\n\n for(const kind');
const prefix=recipe.slice(0,end).replaceAll('.playwright-mcp/coherence-','.playwright-mcp/caregiver-terminal-table-probe-r2-').replaceAll('await page.goto(base);','await page.goto(base);await page.waitForLoadState("networkidle");');
const body=String.raw`
 const setup=await load('/evidence/2026-10-20/caregiver-terminal-persist-r2-on-table.json');await snap('natural day267 Table Continue');
 for(let i=0;i<12&&await page.locator('.arrival-next').count();i++){
  for(let s=0;s<8;s++){const b=await page.locator('.arrival-next').boundingBox();if(b.y>=0&&b.y+b.height<=height)break;
   const cd=await page.context().newCDPSession(page);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:height-90}]});for(let j=1;j<=6;j++)await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:300,y:height-90-(height-180)*j/6}]});await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
  }await tap('.arrival-next');
 }await drain();await snap('late Table invitation after actual presentation');
 await tap('[data-field-panel="place"]');await snap('Place shows the Table entry');console.log(await page.locator('[data-table-seat]').evaluate(e=>{const parents=[];for(let p=e;p;p=p.parentElement){const r=p.getBoundingClientRect();parents.push({tag:p.tagName,cls:p.className,rect:r.toJSON(),scroll:p.scrollTop,client:p.clientHeight,total:p.scrollHeight,overflow:getComputedStyle(p).overflowY});if(parents.length>9)break;}return{disabled:e.disabled,parents};}));
 return{trace,errors,visible:await page.evaluate(()=>({body:document.body.innerText,buttons:[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().height).map(e=>({text:e.innerText,html:e.outerHTML.slice(0,350),rect:e.getBoundingClientRect().toJSON()})),fight:Scattering.Game.tbfight&&{round:Scattering.Game.tbfight.round,turn:Scattering.Game.tbfight.turn,player:Scattering.Game.tbfight.fighters.find(p=>p.key==='p')}}))};
`;
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{const context=await browser.newContext({viewport:{width:390,height:736},isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage();await page.goto('http://127.0.0.1:8921');const result=await eval('('+prefix+body+'\n})')(page);fs.writeFileSync('evidence/2026-10-20/caregiver-terminal-table-probe-r2.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({body:result.visible.body,buttons:result.visible.buttons.map(b=>({text:b.text,html:b.html})),errors:result.errors},null,2));await context.close();}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
