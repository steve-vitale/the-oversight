'use strict';
// Actual committed pre-handoff phone checkpoint; real offered delivery through
// the initialized dialogue/physical donation chain, then abrupt process loss.
const K=require('./lib'),P=require('../lib/conversation-playtest'),fs=require('fs'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const crash=['after-delivery','commit-before','commit-after'];
function storage(initial={}){
 const blobs=new Map(Object.entries(initial));let phase='',armed=false,writes=0;
 const disk=()=>console.log('DELIVERY_DISK '+JSON.stringify(Object.fromEntries(blobs)));
 globalThis.localStorage={getItem:k=>blobs.get(k)??null,removeItem:k=>blobs.delete(k),key:i=>[...blobs.keys()][i]??null,get length(){return blobs.size;},setItem(k,v){
  const run=k.startsWith('scattering-save-v1-');if(armed&&run&&phase==='commit-before')process.exit(77);
  blobs.set(k,String(v));if(armed&&run){writes++;disk();if(phase==='commit-after')process.exit(77);}
 }};return{blobs,disk,arm(p){phase=p;armed=true;},count:()=>writes};
}
async function act(phase){
 const fixture=JSON.parse(fs.readFileSync(K.ROOT+'/evidence/2026-10-27/forage-delivery-quota-fixture-736-r1.json','utf8'));
 const G=await K.load({seed:7}),store=storage(fixture.storage);assert(G.load(fixture.setup.key));
 const id=fixture.setup.npc;G.startConvo(id);assert(P.offers(G,id).some(c=>c.id==='dlg:favor_action'));
 assert.equal(G.convoFavorAction(id).action,'forage_deliver');assert.equal(G.save(),true);
 const key=G.state.runKey,prior=store.blobs.get(key);store.disk();let nested;
 const journal=G.journalFavorPromise;G.journalFavorPromise=function(...args){const value=journal.apply(this,args);
  if(this.state.village.promises[id]?.kept===true){this.state.deliverySettlementProbe=true;nested=this.save();if(phase==='after-delivery')process.exit(77);if(phase==='throw-after-delivery')throw Error('prepared post-delivery journal failure');}
  return value;
 };
 store.arm(phase);
 if(phase==='throw-after-delivery'){
  assert.throws(()=>P.choose(G,id,'dlg:favor_action'),/prepared post-delivery journal failure/);
  assert.equal(store.blobs.get(key),prior);assert.equal(store.count(),0);assert.equal(G.save(),'settlement_failed');
 }else{
  const result=P.choose(G,id,'dlg:favor_action'),saved=JSON.parse(store.blobs.get(key));assert.equal(result.favorSave,true);assert.equal(store.count(),1);
  assert.equal(saved.deliverySettlementProbe,true);assert.equal(saved.village.promises[id].kept,true);
  assert.deepEqual(saved.village.favorLedger[id],G.state.village.favorLedger[id]);
  assert.deepEqual(saved.village.pantry,JSON.parse(JSON.stringify(G.state.village.pantry)));
  assert.deepEqual(saved.scholar.inventory,JSON.parse(JSON.stringify(G.state.scholar.inventory)));
  assert.deepEqual(saved.village.conv[id],JSON.parse(JSON.stringify(G.state.village.conv[id])));
 }
 assert.equal(nested,'deferred');console.log('Delivery settlement '+phase+' passed');
}
async function recover(){
 const input=JSON.parse(fs.readFileSync(0,'utf8')),G=await K.load({seed:7}),store=storage(input.disk),key=[...store.blobs.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=store.blobs.get(key),saved=JSON.parse(raw);
 assert(G.load(key));assert.equal(store.blobs.get(key),raw,'Fresh Continue never replays/replaces transfer bytes');
 const id=Object.keys(saved.village.favorLedger).find(id=>saved.village.favorLedger[id].kind==='forage_help');assert(id);
 const completed=input.phase==='commit-after';assert.equal(!!G.state.deliverySettlementProbe,completed);assert.equal(G.state.village.promises[id].kept,completed);
 assert.equal(G.state.village.favorLedger[id].forageRun.returned,completed);
 assert.deepEqual(JSON.parse(JSON.stringify(G.state.scholar.inventory)),saved.scholar.inventory,'Pack debit exactly once');
 assert.deepEqual(JSON.parse(JSON.stringify(G.state.village.pantry)),saved.village.pantry,'Pantry gain exactly once');
 assert.equal(G.state.scholar.dayTicks,saved.scholar.dayTicks);assert.equal(G.dayPart,saved.run.dayPart);
 console.log('Fresh delivery recovery '+input.phase+' passed');
}
(async()=>{
 if(process.argv[2]==='recover')return recover();if(process.argv[2])return act(process.argv[2]);
 for(const phase of ['normal','throw-after-delivery',...crash]){
  const r=spawnSync(process.execPath,[__filename,phase],{encoding:'utf8',maxBuffer:20e6,timeout:120000});assert.equal(r.status,crash.includes(phase)?77:0,r.stderr+r.stdout.slice(-1200));
  if(crash.includes(phase)){const rows=r.stdout.split('\n').filter(x=>x.startsWith('DELIVERY_DISK '));assert(rows.length);const disk=JSON.parse(rows.at(-1).slice(14));const resumed=spawnSync(process.execPath,[__filename,'recover'],{input:JSON.stringify({phase,disk}),encoding:'utf8',maxBuffer:20e6,timeout:120000});assert.equal(resumed.status,0,resumed.stderr);console.log(resumed.stdout.trim());}
  else console.log(r.stdout.split('\n').filter(x=>x.startsWith('Delivery settlement')).join('\n'));
 }
 console.log('Forage delivery settlement: 5 scenarios and 3 fresh recoveries passed');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
