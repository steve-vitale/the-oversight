'use strict';
const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright'),B=require('../../scripts/balance-panel');
const recipe=fs.readFileSync('evidence/2026-10-20/favor-phone-r1.js','utf8'),end=recipe.indexOf('\n\n for(const kind');
const prefix=recipe.slice(0,end).replaceAll('.playwright-mcp/coherence-','.playwright-mcp/garden-cultivation-natural-r2-').replaceAll('await page.goto(base);','await page.goto(base);await page.waitForLoadState("networkidle");');
const body=String.raw`
 const setup=await load('/evidence/2026-10-20/garden-cultivation-natural-save-r3.json');await snap('natural day73 Continue');for(let i=0;i<12&&await page.locator('.arrival-next').count();i++){await tap('.arrival-next');}await snap('native arrival presentation completed');
 async function gardenState(){return page.evaluate(()=>{const G=Scattering.Game;return{day:G.state.scholar.day,kcal:G.state.scholar.kcal,inside:G.state.scholar.insideHaven,plots:JSON.parse(JSON.stringify(G.map.tiles[4][4].plots)),saved:JSON.parse(localStorage.getItem(G.state.runKey)),keeper:G.state.village.gardenKeeper};});}
 const loaded=await gardenState();if(loaded.day!==73||!loaded.plots.some(p=>p.lastHarvest===59))throw Error('Natural garden history lost');
 await tap('[data-field-panel="place"]');await tap('[data-open-garden]');await snap('natural hall Garden explains outside work');
 await tap('[data-garden="outside"]');await snap('normal door reaches actual garden grounds');
 const before=await gardenState();if(before.inside)throw Error('Outside action did not leave hall');
 await tap('[data-garden="cultivate"]');await snap('natural held ability paid cultivation');const paid=await gardenState();
 if(paid.kcal!==before.kcal-200||paid.plots[0].magicGrowth<=before.plots[0].magicGrowth||paid.saved.scholar.kcal!==paid.kcal)throw Error('Natural paid cast failed');
 await tap('.inline-head [data-x]');await snap('natural garden grid after paid action');
 await page.goto(base);await page.waitForLoadState('networkidle');await tap('[data-load="'+setup.key+'"]');await snap('native Continue retains natural garden and new cost');
 const continued=await gardenState();if(continued.kcal!==paid.kcal||continued.plots[0].magicGrowth!==paid.plots[0].magicGrowth)throw Error('Natural garden Continue lost action');
 if(errors.length)throw Error(errors.join('\n'));return{height,trace,errors,before,paid:{...paid,saved:undefined},continued:{...continued,saved:undefined},scope:'Unedited natural persistent capable seed5 save at day73, actual garden harvest history day59. Native touch controls and Continue. Not independent gardener viability, ordinary-only farming or physical-device proof.'};
`;
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{for(const height of [736,844]){
 const source=B.manifest(process.cwd()),context=await browser.newContext({viewport:{width:390,height},isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage();await page.goto('http://127.0.0.1:8921');
 const journey=eval('('+prefix+body+'\n})'),result=await journey(page);assert.deepEqual(B.manifest(process.cwd()),source);
 fs.writeFileSync('evidence/2026-10-20/garden-cultivation-natural-phone-'+height+'-r2.json',JSON.stringify({...result,source},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({height,stages:result.trace.length,errors:result.errors}));await context.close();
 }}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
