'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process'),assert=require('assert/strict'),K=require('./lib');
async function scenario(kind){
 const sample=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-24/ad-sponsor-legacy-paid-save-r1.json.gz')))),stored=new Map([[sample.key,JSON.stringify(sample.payload)]]);
 globalThis.localStorage={get length(){return stored.size;},key:i=>[...stored.keys()][i]??null,getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,String(v)),removeItem:k=>stored.delete(k)};
 const G=await K.load({seed:73}),prior=sample.payload.run.tbfight;
 if(kind==='missing-def')delete G.data.monsterBehaviors.summons.ad_sponsor;
 if(kind==='missing-migration')G.restoreAdSponsors=undefined;
 assert.equal(G.load(sample.key),true);
 const f=G.tbfight,sponsors=f.fighters.filter(x=>x.monsterId==='ad_sponsor');
 if(kind==='missing-def'){assert(sponsors.length<3,'Control reproduces phantom rider removal');return;}
 if(kind==='missing-migration'){assert(new Set(f.fighters.map(x=>x.key)).size<f.fighters.length,'Control reproduces duplicate rider IDs');return;}
 assert.equal(sponsors.length,3);assert.equal(new Set(f.fighters.map(x=>x.key)).size,f.fighters.length);
 assert.equal(f.turnIdx,prior.turnIdx);assert.equal(f.round,prior.round);assert.equal(G.tbFighter('p').acted,true);assert.equal(G.tbFighter('p').moveLeft,prior.fighters.find(x=>x.key==='p').moveLeft);
 for(let i=0;i<prior.fighters.length;i++)for(const prop of ['hp','maxHp','alive','fled','mx','my','acted','moveLeft'])assert.equal(f.fighters[i][prop],prior.fighters[i][prop],prop+' for original body '+i);
 for(const host of f.fighters.filter(x=>x.adActive)){
  assert(f.fighters.some(x=>x.key===host.adSponsorKey&&x.monsterId==='ad_sponsor'));
  assert.equal(f.order[f.order.indexOf(host.key)+1],host.adSponsorKey);
 }
 assert.deepEqual(G.restoreAdSponsors(G.restoreAdSponsors(prior)),G.restoreAdSponsors(prior),'Migration is idempotent');
 const corrupt={...prior,fighters:[...prior.fighters,'broken-entry']};assert.equal(G.restoreAdSponsors(corrupt).fighters.at(-1),'broken-entry','Migration must preserve corrupt entries for the existing load guard to reject');
 if(kind==='names'){
  assert.equal(G.monsterDisplayName('ad_sponsor'),'Sponsor-creature');G.state.systemArrived=false;
  assert.equal(G.monsterDisplayName('ad_sponsor'),'a little rider with a fixed smile');assert.equal(G.monsterDisplayName('__proto__'),'something');return;
 }
 if(kind==='host-fled'){
  const host=f.fighters.find(x=>x.adActive),rider=G.tbFighter(host.adSponsorKey);assert(!rider.fled);host.fled=true;G.tbMonsterTurn(rider);assert(rider.fled);return;
 }
 if(kind==='retreat'){
  const r=G.runCombatInput(()=>G.tbBarrierExit(1,0));assert.equal(r.value,true);assert(!G.tbfight,'Attached riders do not chase after the Ads disengage');assert.equal(r.save,true);assert.deepEqual(JSON.parse(stored.get(sample.key)),JSON.parse(JSON.stringify(G.state)));return;
 }
 if(kind==='pending'){
  const old=structuredClone(prior),slot=old.order.findIndex(k=>k==='ad_sponsor_1');old.turnIdx=slot;old.pendingTurnKey='ad_sponsor_1';
  const repaired=G.restoreAdSponsors(old);assert.equal(repaired.pendingTurnKey,repaired.order[slot]);assert(repaired.fighters.some(x=>x.key===repaired.pendingTurnKey));return;
 }
 if(kind==='new-pack'){
  for(const host of f.fighters.filter(x=>x.mdef?.id==='ad_break')){host.adActive=null;host.adCd=1;G.tbMonsterTurn(host);}
  assert.equal(new Set(f.fighters.map(x=>x.key)).size,f.fighters.length);assert.equal(new Set(f.order).size,f.order.length);
  for(const host of f.fighters.filter(x=>x.adActive))assert.equal(G.tbFighter(host.adSponsorKey).mdef.id,'ad_sponsor');
 }
 assert.equal(G.save(),true);const paid=JSON.parse(stored.get(sample.key));assert.equal(G.load(sample.key),true);assert.equal(G.save(),true);const resumed=JSON.parse(stored.get(sample.key));delete paid.saveSeq;delete resumed.saveSeq;assert.deepEqual(resumed,paid,'Whole native storage roundtrip after canonical migration');
}
(async()=>{if(process.argv[2])return scenario(process.argv[2]);const cases=['legacy','pending','new-pack','names','host-fled','retreat','missing-def','missing-migration'];for(const kind of cases){const r=cp.spawnSync(process.execPath,[__filename,kind],{encoding:'utf8',maxBuffer:2e6});assert.equal(r.status,0,kind+': '+r.stdout+r.stderr);console.log('Ad sponsor '+kind+' passed');}console.log('Ad sponsor continuity: '+cases.length+' passed, 0 failed');})().catch(e=>{console.error(e.stack);process.exitCode=1;});
