'use strict';
// Prepared historical field checkpoint; conservation and migration proof,
// not another naturally played outing. Each seed uses a separate process.
const K=require('./lib'),fs=require('fs'),assert=require('assert/strict');
const {spawnSync}=require('child_process');
const P=require('../lib/conversation-playtest');
const T=K.reporter('Shared forage cargo');
(async()=>{
 const fixture=JSON.parse(fs.readFileSync(K.ROOT+'/evidence/2026-10-27/forage-phone-fixture-r1.json'));
 const phone=JSON.parse(fs.readFileSync(K.ROOT+'/evidence/2026-10-27/forage-phone-immediate-r3/receipt-736.json'));
 const raw=phone.trace.find(t=>t.label==='field gathering offered 0').state.committed;
 const originalRead=fs.readFileSync,control=process.argv[3];
 if(control==='removed-split'||control==='removed-handoff')fs.readFileSync=function(file,...args){
  let value=originalRead.call(this,file,...args);
  if(String(file).replace(/\\/g,'/').endsWith('/src/js/favor-forage.js')){
   const before=String(value),needle=control==='removed-split'?'splitHarvest(this,vid,f,pack);':'partnerGiven+=depositHeld(this,vid,f,item,partner.items);';
   const after=before.replace(needle,control==='removed-split'?'void 0;':'partnerGiven+=0;');
   assert.notEqual(after,before,'Actual production hook must exist');value=typeof value==='string'?after:Buffer.from(after);
  }return value;
 };
 let G;try{G=await K.load({seed:Number(process.argv[2]||7)});}finally{fs.readFileSync=originalRead;}
 const store=new Map();
 globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 if(control==='recover-choice'){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));
  for(const[k,v]of Object.entries(input.disk))store.set(k,v);
  const raw=store.get(fixture.setup.key),saved=JSON.parse(raw);assert(G.load(fixture.setup.key));
  assert.equal(store.get(fixture.setup.key),raw);
  // Existing Continue deliberately settles an active conversation as a
  // walk-away. Compare the whole scholar to an explicit real endConvo
  // control; do not drop progression fields or call that close neutral.
  assert.deepEqual(G.state.scholar,input.afterCloseScholar);
  assert.deepEqual(G.state.village.favorLedger[input.id],saved.village.favorLedger[input.id]);
  assert.deepEqual(G.state.village.pantry,saved.village.pantry);
  const old=saved.village.conv[input.id].transcript,now=G.state.village.conv[input.id].transcript;
  assert.deepEqual(JSON.parse(JSON.stringify(now.slice(0,old.length))),old);
  console.log('Fresh dialogue cargo recovery passed');return;
 }
 if(process.argv[3]==='recover'){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));
  for(const[k,v]of Object.entries(input.disk))store.set(k,v);
  const key=fixture.setup.key;assert(G.load(key));
  const partner=JSON.stringify(G.getPerson(input.id).items);
  assert(G.load(key));assert.equal(JSON.stringify(G.getPerson(input.id).items),partner,'Continue must not import the old partner stock again');
  const c={id:input.id,f:G.convoGetFavor(input.id),s:G.state.scholar,v:G.state.village,p:G.getPerson(input.id)};
  home(c);const before=G.pantryKcalLive(c.v),result=G.convoPerformFavor(c.id,c.f);
  assert(result.ok);assert.equal(G.pantryKcalLive(c.v)-before,input.expected);
  assert.equal(c.f.forageRun.deliveredKcal,input.expected);
  assert.equal(c.v.promises[c.id].kept,true);
  const after=G.pantryKcalLive(c.v);assert(!G.convoPerformFavor(c.id,c.f).ok);assert.equal(G.pantryKcalLive(c.v),after);
  console.log('Fresh legacy cargo recovery and one actual delivery passed');return;
 }
 function scene(){
  store.clear();for(const[k,v]of Object.entries(fixture.storage))store.set(k,v);
  store.set(fixture.setup.key,raw);assert(G.load(fixture.setup.key));
  const id=fixture.setup.npc,f=G.convoGetFavor(id);
  assert(G.convoPerformFavor(id,f).ok);return{id,f,s:G.state.scholar,v:G.state.village,p:G.getPerson(id)};
 }
 const tagged=(items,f)=>items.filter(i=>i&&i.units>0&&i.forageShares?.[f.id]);
 const energy=items=>items.reduce((n,i)=>n+i.units*i.kcalEach,0);
 function home(c){G.map.px=c.v.px;G.map.py=c.v.py;G.enterBuilding();G.npcSetNode(c.id,c.v.px,c.v.py);G.npcSetInside(c.id,true);c.v.positions[c.id]={mx:c.s.mx,my:c.s.my};}
 {
  const c=scene(),actual=tagged(c.p.items||[],c.f),own=tagged(c.s.inventory,c.f);
  T.ok('one real sweep puts ready food in both canonical inventories',energy(actual)>0&&energy(own)>0);
  T.ok('partner saved haul is a view of real units, not additional stock',energy(c.f.forageRun.partnerHaul)===energy(actual)&&c.f.forageRun.partnerHaul.every(i=>!actual.includes(i)));
  const total=energy(actual)+energy(own),units=[...actual,...own].reduce((n,i)=>n+i.units,0);
  T.ok('both carried shares equal the actual harvest units',units===c.f.forageRun.gatheredUnits);
  const before=JSON.stringify({state:G.state,map:G.map}),rng=Math.random;let draws=0;
  Math.random=function(){draws++;return rng();};
  try{G.convoFavorAction(c.id,c.f);G.forageFavorTalkReady(c.id,c.f);}finally{Math.random=rng;}
  T.ok('shared readiness does not mutate inventory, views or RNG',draws===0&&JSON.stringify({state:G.state,map:G.map})===before);
  G.save();assert(G.load(G.state.runKey));
  const f=G.convoGetFavor(c.id),p=G.getPerson(c.id);
  T.ok('Continue retains exactly one stock per person',energy(tagged(p.items,f))+energy(tagged(G.state.scholar.inventory,f))===total);
  // Prepared depletion contrast: remove the actual partner stock while
  // deliberately retaining its stale view. A view cannot become food.
  p.items=p.items.filter(i=>!i.forageShares?.[f.id]);
  const current={...c,f,s:G.state.scholar,v:G.state.village,p};home(current);
  const pantry=G.pantryKcalLive(current.v),r=G.convoPerformFavor(c.id,f);
  T.ok('a stale partner view cannot be deposited after real cargo is gone',r.ok&&f.forageRun.deliveredPartnerKcal===0&&G.pantryKcalLive(current.v)-pantry===energy(own));
 }
 {
  const c=scene(),before=JSON.stringify({player:c.s.inventory,partner:c.p.items,pantry:c.v.pantry}),r=G.performForageFavor(c.id,c.f,{keepCargo:true});
  T.ok('keep-cargo cancellation conserves both inventories and pantry',r.ok&&JSON.stringify({player:c.s.inventory,partner:c.p.items,pantry:c.v.pantry})===before&&c.v.promises[c.id].kept==='broken');
 }
 {
  const c=scene();home(c);const total=energy(tagged(c.s.inventory,c.f))+energy(tagged(c.p.items,c.f)),before=G.pantryKcalLive(c.v);
  const r=G.performForageFavor(c.id,c.f,true);
  T.ok('unload-and-end moves both real shares exactly once',r.ok&&G.pantryKcalLive(c.v)-before===total&&!tagged(c.s.inventory,c.f).length&&!tagged(c.p.items,c.f).length);
  const after=G.pantryKcalLive(c.v);G.performForageFavor(c.id,c.f,true);
  T.ok('repeating an ended unload cannot mint food',G.pantryKcalLive(c.v)===after);
 }
 if(!control)for(const choice of ['dlg:forage_talk','dlg:forage_unload_end']){
  const c=scene();if(choice==='dlg:forage_unload_end')home(c);
  G.startConvo(c.id);assert(P.reach(G,c.id,[choice]),'Actual menu must offer '+choice);
  const result=P.choose(G,c.id,choice),saved=JSON.parse(store.get(G.state.runKey));
  T.ok(choice+' saves its actual effect and final spoken transcript together',!!result&&JSON.stringify(saved.village.favorLedger[c.id])===JSON.stringify(c.f)&&JSON.stringify(saved.village.conv[c.id])===JSON.stringify(G.convoGet(c.id)));
  const disk=Object.fromEntries(store);G.endConvo(c.id,'left');
  const recovery=spawnSync(process.execPath,[__filename,String(process.argv[2]||7),'recover-choice'],{input:JSON.stringify({disk,id:c.id,afterCloseScholar:G.state.scholar}),encoding:'utf8',timeout:60000,maxBuffer:20e6});
  T.ok(choice+' survives a fresh-process Continue without another transfer',recovery.status===0,recovery.stderr+recovery.stdout.slice(-800));
 }
 {
  const c=scene(),r=c.f.forageRun;
  // Construct the exact older public representation from actual harvested
  // units: its partner stock lived only in partnerHaul, without provenance.
  const removeOrigin=i=>{const copy={...i};delete copy.forageShares;return copy;};
  const own=tagged(c.s.inventory,c.f),partner=tagged(c.p.items,c.f);
  const expected=energy(own)+energy(partner);
  r.playerHaul=own.map(removeOrigin);r.partnerHaul=partner.map(removeOrigin);
  c.s.inventory=c.s.inventory.map(i=>i.forageShares?.[c.f.id]?removeOrigin(i):i);
  c.p.items=c.p.items.filter(i=>!i.forageShares?.[c.f.id]);
  delete r.partnerInventory;delete c.f.forageRequiredKcal;
  const playerBefore=JSON.stringify(c.s.inventory);
  T.ok('older public stock migrates into actual partner inventory',G.migrateForageFavors()&&energy(c.p.items.filter(i=>i.legacyForageFavor===c.f.id))===energy(r.partnerHaul));
  T.ok('migration does not invent player-origin tags or replace player food',JSON.stringify(c.s.inventory)===playerBefore&&!c.s.inventory.some(i=>i.forageShares?.[c.f.id]));
  const migrated=JSON.stringify({run:r,items:c.p.items});
  T.ok('a repeated migration is idempotent',!G.migrateForageFavors()&&JSON.stringify({run:r,items:c.p.items})===migrated);
  G.save();const disk=Object.fromEntries(store);
  const recovery=spawnSync(process.execPath,[__filename,String(process.argv[2]||7),'recover'],{input:JSON.stringify({disk,id:c.id,expected}),encoding:'utf8',timeout:60000,maxBuffer:20e6});
  // Recovery is a distinct harness/process, never a second harness here.
  T.ok('fresh-process legacy Continue and delivery conserve actual stock',recovery.status===0,recovery.stderr+recovery.stdout.slice(-1000));
 }
 if(!control)for(const mode of ['removed-split','removed-handoff']){
  const result=spawnSync(process.execPath,[__filename,String(process.argv[2]||7),mode],{encoding:'utf8',timeout:60000,maxBuffer:20e6});
  T.ok('actual '+mode+' control is rejected by conservation assertions',result.status!==0&&/FAIL|AssertionError/.test(result.stdout+result.stderr),result.stdout.slice(-900)+result.stderr.slice(-500));
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
