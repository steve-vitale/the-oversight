'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('playwright'),B=require('../../scripts/balance-panel'),{expectedInputs}=require('../../scripts/phone-frame-proof-update');
const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex'),runnerSha256=hash(fs.readFileSync(__filename,'utf8'));
const tag=process.argv[2]||'r1',source=fs.readFileSync('evidence/2026-10-20/favor-phone-r1.js','utf8'),end=source.indexOf('\n\n for(const kind');if(end<0)throw Error('Retained helper changed');
const helper=source.slice(0,end).replaceAll('.playwright-mcp/coherence-','.playwright-mcp/water-favor-'+tag+'-').replaceAll('await page.goto(base);','await page.goto(base);await page.waitForLoadState("networkidle");');
const body=String.raw`
 const setup=await load('/evidence/2026-10-20/water-favor-phone-fixture-r2.json');
 async function shot(label){await snap(label);trace.at(-1).state=await page.evaluate(id=>({day:Scattering.Game.state.scholar.day,ticks:Scattering.Game.state.scholar.dayTicks,part:Scattering.Game.dayPart,node:[Scattering.Game.map.px,Scattering.Game.map.py],pos:[Scattering.Game.state.scholar.mx,Scattering.Game.state.scholar.my],water:Scattering.Game.state.scholar.water,cistern:Scattering.Game.state.village.water,favor:Scattering.Game.convoGetFavor(id),promise:Scattering.Game.state.village.promises?.[id],tools:document.querySelector('.field-tool-body')?.innerText,inline:document.querySelector('#inlineslot')?.innerText}),setup.npc);fs.writeFileSync('.playwright-mcp/water-favor-partial.json',JSON.stringify({trace,errors},null,2));}
 async function endTalk(){if(await page.locator('#dlg-end').isVisible())await tap('#dlg-end');}
 async function context(label){
  let selector='.phone-primary-actions [data-ctx]:has-text('+JSON.stringify(label)+')';
  if(!await page.locator(selector).count()){await tap('[data-field-panel="actions"]');selector='.field-tool-body [data-ctx]:has-text('+JSON.stringify(label)+')';}
  if(await page.locator(selector).count()!==1)throw Error('Expected one real context action '+label);await tap(selector);
 }
 async function walk(goal,nearPartner){
  for(let i=0;i<45;i++){
   const next=await page.evaluate(({goal,id,nearPartner})=>{
    const G=Scattering.Game,s=G.state.scholar,v=G.state.village,t=G.map.tiles[G.map.py][G.map.px],grid=t.detail;
    const target=nearPartner?v.positions[id]:{mx:goal[0],my:goal[1]};if(!target)throw Error('Partner is not on this visible grid');
    const end=(x,y)=>nearPartner?Math.max(Math.abs(x-target.mx),Math.abs(y-target.my))<=1:x===target.mx&&y===target.my;
    if(end(s.mx,s.my))return null;
    const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],q=[[s.mx,s.my,[]]],seen=new Set([s.mx+','+s.my]);
    while(q.length){const[x,y,path]=q.shift();for(const[dx,dy]of dirs){const nx=x+dx,ny=y+dy,key=nx+','+ny,cell=grid?.[ny]?.[nx];if(!cell||seen.has(key)||['wall','water','tree','bigtree','tent','fire','rubble','lodge'].includes(cell))continue;seen.add(key);const steps=[...path,[dx,dy]];if(end(nx,ny))return steps[0];q.push([nx,ny,steps]);}}
    throw Error('No visible walkable route '+JSON.stringify({start:[s.mx,s.my],target,grid}));
   },{goal,id:setup.npc,nearPartner});
   if(!next)return;await tap('.dpbtn[data-dx="'+next[0]+'"][data-dy="'+next[1]+'"]');
  }throw Error('Walking did not reach the visible destination');
 }
 async function meet(){
  const sides=await page.evaluate(id=>({inside:Scattering.Game.state.scholar.insideHaven!==false,partner:Scattering.Game.state.village.npcInside?.[id]!==false,home:Scattering.Game.playerTile().type==='haven'}),setup.npc);
  if(sides.home&&sides.inside!==sides.partner){await walk(sides.inside?[4,7]:[6,5],false);await context(sides.partner?'Go inside':'Step outside');}
  await walk(null,true);
 }
 async function outside(){if(await page.evaluate(()=>Scattering.Game.state.scholar.insideHaven!==false)){await walk([4,7],false);await context('Step outside');}}
 async function continued(label){await page.goto(base);await page.waitForLoadState('networkidle');await tap('[data-load="'+setup.key+'"]');await shot(label);}
 async function journal(status,label){
  await tap('[data-field-panel="menu"]');await tap('#x-codex');const row=page.locator('[data-favor-id="'+setup.favorId+'"]'),cd=await page.context().newCDPSession(page);
  if(await row.count()!==1)throw Error('One canonical task row required');
  for(let n=0;n<24;n++){const r=await row.boundingBox(),v=await page.locator('.journal-reader-body').boundingBox();if(r.y>=v.y&&r.y+r.height<=v.y+v.height)break;const up=r.y>=v.y,dist=Math.min(v.height*.5,up?r.y+r.height-v.y-v.height+24:v.y-r.y+24),x=v.x+v.width*.8,from=up?v.y+v.height-45:v.y+45,to=from+(up?-dist:dist);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:from}]});for(let i=1;i<=8;i++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:from+(to-from)*i/8}]});await page.waitForTimeout(25);}await page.waitForTimeout(180);await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);}
  const text=await row.innerText(),r=await row.boundingBox(),v=await page.locator('.journal-reader-body').boundingBox();if(!text.includes('('+status+')')||r.y<v.y||r.y+r.height>v.y+v.height)throw Error('Readable '+status+' task required: '+text);await shot(label);trace.at(-1).journal=text;await tap('#b-back');
 }
 await shot('prepared expedition loaded');
 if(await page.locator('[data-sheetbtn="0"]').isVisible()){await tap('[data-sheetbtn="0"]');await shot('native starting knack selected');}
 await talk(setup);await reply('dlg:commit');await drain();await shot('accepted real creek request');await endTalk();
 await journal('Accepted','accepted trip requirements in Journal');
 await tap('[data-field-panel="menu"]');await tap('[data-lm="wait"]');await shot('actual Wait reaches first light');
 await meet();await shot('walk to the agreed partner');
 await talk(setup);await reply('dlg:favor_action');await drain();await shot('set out together');await endTalk();
 await continued('departure survives Continue');
 await outside();await walk([8,5],false);await tap('.dpbtn[data-dx="1"][data-dy="0"]');await shot('walked east into the actual creek');
 if(trace.at(-1).state.node.join(',')!=='5,4')throw Error('Native creek crossing failed');
 await meet();await talk(setup);await reply('dlg:favor_action');await drain();await shot('both holders collect creek water');await endTalk();
 await continued('both cargoes survive Continue');
 let state=trace.at(-1).state;if(state.water.filter(b=>b.favorId===setup.favorId).length!==2||state.favor.waterRun.partnerWater.length!==2)throw Error('Real collected cargo missing');
 await walk([0,5],false);await tap('.dpbtn[data-dx="-1"][data-dy="0"]');await shot('walked west home with the water');
 await meet();await talk(setup);await shot('home conversation before handoff');const dirty=await page.evaluate(()=>Scattering.Game.state.village.water.dirty);await reply('dlg:favor_action');await drain();await shot('unloaded real water into the cistern');await endTalk();
 state=trace.at(-1).state;if(state.cistern.dirty!==dirty+4||state.promise.kept!==true||state.water.some(b=>b.favorId===setup.favorId))throw Error('Physical handoff failed');
 await journal('Completed','completed trip in Journal');await continued('completed trip survives Continue');
 return{height,scope:'Prepared opportunity; trusted touch and actual controls for all game mutations, read-only Game inspection; not natural encounter, balanced campaign or physical-device coverage.',trace,errors};
`;
const journey=eval('('+helper+body+'\n})');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const height of [736,844]){
  const initial=B.manifest(process.cwd()),inputs={},jobs=[],failures=[];
  const context=await browser.newContext({viewport:{width:390,height},isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage();
  page.on('response',res=>{const u=new URL(res.url());if(u.origin!=='http://127.0.0.1:8921'||res.status()!==200||u.pathname.startsWith('/evidence/')||!(u.pathname==='/'||/\.(js|json|css|html)$/.test(u.pathname)))return;
   const file=u.pathname.slice(1)||'index.html';jobs.push(res.text().then(text=>{const sha=hash(text);if(inputs[file]&&inputs[file]!==sha)throw Error('Mixed served source '+file);inputs[file]=sha;}).catch(e=>failures.push({file,error:e.message})));});
  await page.goto('http://127.0.0.1:8921');await page.waitForLoadState('networkidle');const r=await journey(page);await Promise.all(jobs);assert.deepEqual(r.errors,[]);assert.deepEqual(failures,[]);
  for(const[file,sha]of Object.entries(expectedInputs(process.cwd())))assert.equal(inputs[file],sha,'Actual served boot source '+file);
  assert.deepEqual(B.manifest(process.cwd()),initial,'Game source stayed fixed during native play');r.sources=initial;r.networkInputs=inputs;r.helperSha256=hash(source);r.runnerSha256=runnerSha256;
  fs.writeFileSync('evidence/2026-10-20/water-favor-phone-'+height+'-'+tag+'.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({height,checkpoints:r.trace.length,errors:r.errors.length,inputs:Object.keys(expectedInputs(process.cwd())).length}));await context.close();
 }
 }finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
