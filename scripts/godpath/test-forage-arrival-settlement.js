'use strict';
// Prepared scarcity, actual native gathered cargo. This engine proof exercises
// the caller-owned travel checkpoint; it does not stand in for phone movement.
const K=require('./lib'),fs=require('fs'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const crashes=['after-arrival','commit-before','commit-after'];
function storage(initial){
 const blobs=new Map(Object.entries(initial));let phase='',armed=false,writes=0;
 const disk=()=>console.log('ARRIVAL_DISK '+JSON.stringify(Object.fromEntries(blobs)));
 globalThis.localStorage={getItem:k=>blobs.get(k)??null,removeItem:k=>blobs.delete(k),key:i=>[...blobs.keys()][i]??null,get length(){return blobs.size;},setItem(k,v){
  const run=k.startsWith('scattering-save-v1-');if(armed&&run&&phase==='commit-before')process.exit(77);
  blobs.set(k,String(v));if(armed&&run){writes++;disk();if(phase==='commit-after')process.exit(77);}
 }};return{blobs,disk,arm(p){phase=p;armed=true;},count:()=>writes};
}
async function act(phase){
 const fixture=JSON.parse(fs.readFileSync(K.ROOT+'/evidence/2026-10-27/forage-outcomes-cargo-736-r1.json','utf8'));
 const G=await K.load({seed:7}),store=storage(fixture.storage);assert(G.load(fixture.setup.key));
 const id=fixture.setup.npc,v=G.state.village,f=G.convoGetFavor(id),source=rows=>rows.reduce((n,i)=>n+(i.units||0)*(i.kcalEach||0)*(i.forageShares?.[f.id]||0),0);
 v.pantry=[];v.pantryKcal=0;v.hungryStreak=3;
 assert(f.forageRun.gatheredUnits>0);assert.equal(f.forageRun.returned,false);assert.equal(source(G.state.scholar.inventory),1300);
 assert.equal(G.save(),true);const prior=store.blobs.get(G.state.runKey);store.disk();const initialWrites=store.count();store.arm(phase);
 let gross=0;const deposit=G.depositPantryPieces;
 G.depositPantryPieces=function(village,item){if(village===v)gross+=source([item]);return deposit.apply(this,arguments);};
 const beforePack=source(G.state.scholar.inventory),checkpoint=G.captureTravelCheckpoint();G.travelTo(v.px,v.py);
 assert.equal(store.count(),initialWrites,'arrival itself never saves an unpaid crossing');assert.equal(store.blobs.get(G.state.runKey),prior);
 const afterPack=source(G.state.scholar.inventory),delivered=source(v.pantry);
 assert.equal(gross,715);assert.equal(delivered,gross);assert.equal(beforePack-afterPack,gross);assert.equal(f.forageRun.deliveredKcal,gross);
 assert.equal(f.forageRun.returned,true);assert.equal(v.promises[id].kept,true);
 if(phase==='after-arrival')process.exit(77);
 assert.equal(G.commitTravelCheckpoint(checkpoint),true);assert.equal(store.count()-initialWrites,1);
 const saved=JSON.parse(store.blobs.get(G.state.runKey));assert.deepEqual(saved.village.favorLedger[id],f);
 assert.deepEqual(saved.scholar.inventory,JSON.parse(JSON.stringify(G.state.scholar.inventory)));
 assert.deepEqual(saved.village.pantry,JSON.parse(JSON.stringify(v.pantry)));
 assert.equal(saved.scholar.dayTicks,G.state.scholar.dayTicks);
 assert.equal(G.commitTravelCheckpoint(G.captureTravelCheckpoint()),null,'no crossing creates no second receipt');
 assert.equal(store.count()-initialWrites,1);
 console.log('Arrival settlement '+phase+' passed');
}
async function recover(){
 const input=JSON.parse(fs.readFileSync(0,'utf8')),G=await K.load({seed:7}),store=storage(input.disk),key=[...store.blobs.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=store.blobs.get(key),saved=JSON.parse(raw);
 assert(G.load(key));assert.equal(store.blobs.get(key),raw,'Continue does not replay or rewrite the transfer');
 const id=Object.keys(saved.village.favorLedger).find(id=>saved.village.favorLedger[id].kind==='forage_help'),complete=input.phase==='commit-after';
 assert.equal(G.state.village.favorLedger[id].forageRun.returned,complete);assert.equal(G.state.village.promises[id].kept,complete);
 assert.equal(G.state.village.favorLedger[id].forageRun.deliveredKcal,complete?715:0);
 for(const field of ['inventory','dayTicks','kcal'])assert.deepEqual(JSON.parse(JSON.stringify(G.state.scholar[field])),saved.scholar[field]);
 assert.deepEqual(JSON.parse(JSON.stringify(G.state.village.pantry)),saved.village.pantry);
 assert.deepEqual([G.map.px,G.map.py],[saved.run.map.px,saved.run.map.py]);
 console.log('Fresh arrival recovery '+input.phase+' passed');
}
(async()=>{
 if(process.argv[2]==='recover')return recover();if(process.argv[2])return act(process.argv[2]);
 for(const phase of ['normal',...crashes]){
  const run=spawnSync(process.execPath,[__filename,phase],{encoding:'utf8',maxBuffer:20e6,timeout:120000});assert.equal(run.status,crashes.includes(phase)?77:0,run.stderr+run.stdout.slice(-1200));
  if(crashes.includes(phase)){
   const rows=run.stdout.split('\n').filter(x=>x.startsWith('ARRIVAL_DISK '));assert(rows.length);
   const resumed=spawnSync(process.execPath,[__filename,'recover'],{input:JSON.stringify({phase,disk:JSON.parse(rows.at(-1).slice(13))}),encoding:'utf8',maxBuffer:20e6,timeout:120000});assert.equal(resumed.status,0,resumed.stderr);console.log(resumed.stdout.trim());
  }else console.log(run.stdout.split('\n').filter(x=>x.startsWith('Arrival settlement')).join('\n'));
 }
 console.log('Forage automatic arrival: 4 scenarios and 3 fresh recoveries passed');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
