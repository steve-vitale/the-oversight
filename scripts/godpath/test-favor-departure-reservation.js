'use strict';
const assert=require('assert/strict'),fs=require('fs'),cp=require('child_process'),crypto=require('crypto'),K=require('./lib');
const mode=process.argv[2]||'all';
async function run(){
 const read=fs.readFileSync;if(['removed-budget','removed-companion','expedition-order','removed-ammo-order'].includes(mode))fs.readFileSync=function(file,...args){let b=read.call(this,file,...args),s=String(b),old=s;
  if(mode==='removed-budget'&&String(file).endsWith('convo-wants.js'))s=s.replace('blocked:!valid||arrival>meeting','blocked:false');
  if(mode==='removed-companion'&&String(file).endsWith('villager-objectives.js'))s=s.replace('if(this.convoFavorDepartureReservation?.(id,obj.partsLeft)?.blocked)continue;','');
  if(['expedition-order','removed-ammo-order'].includes(mode)&&String(file).endsWith('villager-agency.js')){
   const lottery='      var dist = 1 + Math.floor(R() * maxD);';assert(s.includes(lottery));s=s.replace(lottery,"      globalThis.__appointmentOrder.push('target');\n"+lottery);
   if(mode==='removed-ammo-order'){const ammo="      try { if (this.villagerPocketAmmo) this.villagerPocketAmmo(vid); } catch (e) {}";assert(s.includes(ammo));s=s.replace(ammo,'');const duration='      var duration = minDuration + Math.floor(R() * durationChoices);';assert(s.includes(duration));s=s.replace(duration,duration+'\n'+ammo);}
  }
  if(s!==old)b=typeof b==='string'?s:Buffer.from(s);return b;};
 let G;try{G=await K.load({seed:7002,narration:true});}finally{fs.readFileSync=read;}K.newRun(G);
 const v=G.state.village,s=G.state.scholar,[vid,leader]=v.roster.filter(id=>id!==G.villagerId&&G.getPerson(id).age>=18);assert(vid&&leader);
 Object.assign(s,{day:19,dayTicks:256,kcal:3000,health:100,hydration:100,insideHaven:false,mx:4,my:5});G.dayPart=2;
 const hx=v.px??4,hy=v.py??4;G.map.px=hx;G.map.py=hy;v.away={};v.engaged={};v.promises={};v.favorLedger={};v.assignments={};v.health=v.health||{};v.trust=v.trust||{};v.positions=v.positions||{};v.water={clean:20,dirty:0};
 v.roster=[G.villagerId,vid,leader];v.pantry=[{name:'Prepared food',safe:true,edible:true,kcalEach:500,units:100,spoilDay:99}];
 for(const id of [vid,leader]){const p=G.getPerson(id);p.goal='belong';p.age=30;G.npcSetNode(id,hx,hy);G.npcSetInside(id,false);v.positions[id]={mx:5,my:5};v.health[id]=100;Object.assign(G.npcNeeds(id),{hunger:10,fear:0,energy:100,social:90});v.trust[id]=80;}
 const favor=G.convoBuildFavor(vid,{kind:'water_haul',water:2});G.convoStoreFavor(favor);assert(G.convoFavorCommit(vid,favor).ok);const promise=v.promises[vid];
 const reservation=n=>G.convoFavorDepartureReservation(vid,n);
 if(mode.startsWith('neutral')){const before=JSON.stringify(G.state);if(mode==='neutral-on')for(const n of[1,2,8,0,NaN])reservation(n);assert.equal(JSON.stringify(G.state),before);console.log(JSON.stringify({state:crypto.createHash('sha256').update(before).digest('hex'),next:Math.random()}));return;}
 if(mode==='projection'){
  const before=JSON.stringify(G.state),random=Math.random;Math.random=()=>{throw Error('A roster projection must not draw RNG');};let rows;try{rows=G.villageRoster();}finally{Math.random=random;}
  assert.equal(JSON.stringify(G.state),before,'opening the roster does not alter the complete canonical state');
  const row=rows.find(p=>p.id===vid);assert.equal(row.presence,'On the Haven grounds');assert.match(row.appointment,/day 20 at dawn/);
  v.away[vid]={nx:hx+1,ny:hy,purpose:'forage',sinceDay:19,sincePart:2,duration:2};G.npcSetNode(vid,hx+1,hy);
  assert.equal(G.villageRoster().find(p=>p.id===vid).presence,'Away from Haven','an away requester is never described as here');delete v.away[vid];G.npcSetNode(vid,hx,hy);G.npcSetInside(vid,true);
  assert.equal(G.villageRoster().find(p=>p.id===vid).presence,'Inside the Haven hall');delete v.nodePos[vid];
  assert.equal(G.villageRoster().find(p=>p.id===vid).presence,'Location not known','missing location stays unknown');return;
 }
 if(mode==='windows'){
  assert.equal(reservation(1).blocked,false,'one-part trip at outgoing dusk returns at the agreed dawn');assert.equal(reservation(2).blocked,true,'two-part trip returns at midday after the appointment');
  assert.equal(reservation(0).blocked,true,'unknown return budget cannot claim to fit');
  s.dayTicks=128;G.dayPart=1;assert.equal(reservation(2).blocked,false,'two parts departing after midday can return at dawn');
  for(const kind of ['water_haul','forage_help']){favor.kind=kind;assert.equal(reservation(3).blocked,true,kind+' shares the actual next-dawn budget');}
  favor.kind='stay_close';favor.companyNight=19;promise.companyNight=19;favor.deadline=19;promise.favorDeadline=19;assert.equal(reservation(1).blocked,true,'same-night company must be available by the existing dusk waiting window');
  favor.state='fulfilled';assert.equal(reservation(4),null);favor.state='promised';promise.maker=leader;assert.equal(reservation(4),null,'a previous bearer promise is not reserved');promise.maker=G.villagerId;
  v.assignments[vid]={task:'patrol'};assert.equal(reservation(4),null,'explicit work orders keep their existing priority');return;
 }
 if(mode==='companion-fit'){
  s.dayTicks=128;G.dayPart=1;const trip={kind:'EXPLORE',purpose:'explore',partsLeft:2,tx:hx+1,ty:hy,tightness:1};
  assert.equal(G.objAskCompanion(leader,trip,hx,hy),vid,'a fitting companion trip remains eligible');assert.equal(G.objOf(vid).kind,'GUARD');
  assert.equal(G.objDepart(vid,G.objOf(vid),hx,hy,false),true,'a fitting real companion departure still runs');assert(v.away[vid]);return;
 }
 if(mode==='companion'||mode==='removed-companion'){
  const trip={kind:'EXPLORE',purpose:'explore',partsLeft:2,tx:hx+1,ty:hy,tightness:1};assert.equal(G.objAskCompanion(leader,trip,hx,hy),null,'a conflicting meeting cannot be overwritten by joining someone else as guard');assert.notEqual(G.objOf(vid).kind,'GUARD');return;
 }
 if(mode==='expedition'){
  const before=JSON.stringify(G.state);const random=Math.random;Math.random=()=>{throw Error('No expedition lottery before the appointment refusal');};try{G.startExpedition(vid,hx,hy,false);}finally{Math.random=random;}assert.equal(JSON.stringify(G.state),before,'declined expedition spends no gear, ammo, food or activity state');return;
 }
 if(mode==='expedition-order'||mode==='removed-ammo-order'){
  delete v.promises[vid];delete v.favorLedger[vid];globalThis.__appointmentOrder=[];
  const person=G.getPerson(vid),recipe=G.data.recipes.find(r=>r.id==='arrow');assert(recipe);person.items=[{itemId:'crude_bow',units:1}];person.stashed=[];person.equipped={ranged:{itemId:'crude_bow'}};const materials=G.stashState().materials;for(const [id,n]of Object.entries(recipe.materials))materials[id]=n;let ammoResult;
  const original=G.villagerPocketAmmo;G.villagerPocketAmmo=function(...args){globalThis.__appointmentOrder.push('ammo');ammoResult=original.apply(this,args);return ammoResult;};
  try{G.startExpedition(vid,hx,hy,false);assert(v.away[vid],'real no-obligation expedition departs');assert.equal(ammoResult?.crafted,1,'the real owned bow consumes actual ammo materials and draws its craft lottery');assert.equal(ammoResult.ammoId,'arrow');assert.deepEqual(globalThis.__appointmentOrder,['ammo','target'],'ammunition preparation must retain its original position before the destination lottery');}
  finally{G.villagerPocketAmmo=original;delete globalThis.__appointmentOrder;}return;
 }
 if(mode==='leave'){
  const obj=G.objOf(vid);Object.assign(obj,{kind:'LEAVE',purpose:'leave',state:'ready',tx:hx+1,ty:hy,partsLeft:999});assert.equal(G.objDepart(vid,obj,hx,hy,false),true,'a commitment does not imprison an escaping resident');assert(v.away[vid]);return;
 }
 // Reproduce the real outgoing-dusk work decision. Its existing objective is
 // ready and takes two parts; only public Wait and Sleep advance the clock.
 const obj=G.objOf(vid);Object.assign(obj,{kind:'FORAGE',purpose:'forage',state:'ready',indoor:false,tx:hx+1,ty:hy,partsLeft:2,tightness:1});
 const beforePromise=JSON.stringify(promise);G.doAction('wait');assert.equal(s.day,19);assert.equal(G.dayPart,3);G.sleep();
 assert.equal(s.day,20);assert.equal(G.dayPart,0);assert(!v.away[vid],'ordinary work must not take the requester past the agreed dawn');assert.deepEqual(v.nodePos[vid],{nx:hx,ny:hy});assert.equal(v.promises[vid].favorId,promise.favorId);assert.equal(v.promises[vid].kept,false,'being present is not completing the favor');assert.equal(JSON.stringify(v.promises[vid]),beforePromise,'no deadline or promise edit repairs the appointment');assert.equal(G.waterFavorWaiting(vid),true,'actual existing dawn waiting predicate sees the returned person');
 console.log(JSON.stringify({mode,day:s.day,part:G.dayPart,away:v.away[vid]||null,promise:v.promises[vid]}));
}
(async()=>{if(mode!=='all')return run();let neutral=[];for(const m of['windows','integration','companion','companion-fit','expedition','expedition-order','leave','projection','neutral-off','neutral-on']){const r=cp.spawnSync(process.execPath,[__filename,m],{encoding:'utf8',timeout:120000});assert.equal(r.status,0,m+'\n'+r.stderr+r.stdout);if(m.startsWith('neutral'))neutral.push(JSON.parse(r.stdout.trim().split('\n').at(-1)));}assert.deepEqual(neutral[0],neutral[1]);for(const m of['removed-budget','removed-companion','removed-ammo-order']){const r=cp.spawnSync(process.execPath,[__filename,m],{encoding:'utf8',timeout:120000});assert.notEqual(r.status,0,m+' must reject the actual missing executor guard');assert(/agreed dawn|joining someone else as guard|ammunition preparation/.test(r.stderr),r.stderr);}console.log('Joint appointment return budget: public Wait/Sleep dawn, water/forage/company windows, counterpart eligibility, expedition no-cost refusal, escape priority and whole-state/next-RNG query neutrality pass; actual removed guards rejected.');})().catch(e=>{console.error(e.stack);process.exitCode=1});
