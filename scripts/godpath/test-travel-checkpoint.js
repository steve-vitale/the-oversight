'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict'),K=require('./lib');
const kinds=['cross','refused','micro-only','swim','quota','stale','tombstone','state','key','mantle','ended','throw'];
async function scenario(kind){
 const fixture=JSON.parse(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-21/public-travel-fixture-r1.json'))),blobs=new Map(Object.entries(fixture.storage)),writes=[];let quota=false;
 global.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,removeItem:k=>blobs.delete(k),setItem(k,v){if(quota&&k.startsWith('scattering-save-v1-'))throw Error('prepared travel quota');blobs.set(k,String(v));if(k.startsWith('scattering-save-v1-'))writes.push(JSON.parse(v));}};
 const G=await K.load({seed:7002});assert.equal(G.load(fixture.key),true);if(G.state.scholar.knackChoices?.length)G.chooseKnack(G.state.scholar.knackChoices[0].id);assert.equal(G.save(),true);writes.length=0;
 const before=G.captureTravelCheckpoint(),kcal=G.state.scholar.kcal,tick=G.state.scholar.dayTicks,key=G.state.runKey,prior=blobs.get(key),[x,y]=fixture.route.edge,route=G.beginPathWalk(x,y);assert(route);for(const step of route)assert.equal(G.pathStep(...step),true);
 assert.equal(kcal-G.state.scholar.kcal,fixture.route.cost);assert.equal(G.state.scholar.dayTicks-tick,route.length);assert.equal(writes.length,0,'ordinary approach does not write every square');
 if(kind==='micro-only'){assert.equal(G.commitTravelCheckpoint(before),null);assert.equal(writes.length,0);return;}
 if(kind==='refused')G.tileAt(...fixture.route.target).blockFrom={dx:0,dy:-1,type:'rubble'};
 if(kind==='swim'){G.tileAt(...fixture.route.target).blockFrom={dx:0,dy:-1,type:'creek'};G.travelTo(...fixture.route.target,true);assert.equal(writes.length,0,'engine crossing does not commit before UI toll');G.state.scholar.kcal-=20;}
 else G.tryNodeExit(0,1);
 if(kind==='refused'){assert.equal(G.commitTravelCheckpoint(before),null);assert.equal(writes.length,0);assert.equal(blobs.get(key),prior);return;}
 assert.deepEqual([G.map.px,G.map.py],fixture.route.target);
 if(kind==='quota')quota=true;
 if(kind==='stale'){const newer=JSON.parse(prior);newer.saveSeq+=50;newer.scholar.kcal=1777;blobs.set(key,JSON.stringify(newer));}
 if(kind==='tombstone')global.Scattering.state.wipe(key,'prepared ended elsewhere');
 if(kind==='state')G.state={...G.state};
 if(kind==='key')G.state.runKey+='-prepared-other';
 if(kind==='ended')G.over=true; // Explicit ended-context fault, not a death-mechanics claim.
 if(kind==='mantle'){const actor=G.captureTravelCheckpoint();G.playerDeath('prepared completed-travel death');const ended=blobs.get(key);writes.length=0;assert(G.over||G.villagerId!==actor.bearer);assert.equal(G.commitTravelCheckpoint(actor),null);assert.equal(writes.length,0);assert.equal(blobs.get(key),ended);return;}
 const save=G.save;if(kind==='throw')G.save=()=>{throw Error('prepared travel save throw');};const expected=blobs.get(key),warnings=[],warn=console.warn;console.warn=(...args)=>warnings.push(args.map(String).join(' '));let result;try{result=G.commitTravelCheckpoint(before);}finally{console.warn=warn;G.save=save;}
 if(['state','key','ended'].includes(kind)){assert.equal(result,null);assert.equal(writes.length,0);assert.equal(blobs.get(key),expected);}
 else if(['quota','throw'].includes(kind)){assert.equal(result,false);assert.equal(blobs.get(key),expected);if(kind==='throw')assert(warnings.some(w=>w.includes('prepared travel save throw')));quota=false;assert.equal(G.save(),true);assert.deepEqual([JSON.parse(blobs.get(key)).run.map.px,JSON.parse(blobs.get(key)).run.map.py],fixture.route.target);}
 else if(['stale','tombstone'].includes(kind)){assert.equal(result,kind==='stale'?'stale':'tombstoned');assert.equal(blobs.get(key),expected);}
 else{assert.equal(result,true);assert.equal(writes.length,1);assert.equal(writes[0].scholar.kcal,kcal-fixture.route.cost-(kind==='swim'?20:0));assert.equal(G.load(key),true);assert.deepEqual([G.map.px,G.map.py],fixture.route.target);assert.equal(G.state.scholar.dayTicks,tick+route.length);assert.equal(G.state.scholar.kcal,kcal-fixture.route.cost-(kind==='swim'?20:0));}
}
async function main(){if(process.argv[2])return scenario(process.argv[2]);for(const kind of kinds){const r=cp.spawnSync(process.execPath,[__filename,kind],{encoding:'utf8',maxBuffer:2e6});assert.equal(r.status,0,kind+': '+r.stdout+r.stderr);console.log('Travel checkpoint '+kind+' passed');}console.log('Travel checkpoint: '+kinds.length+' passed, 0 failed');}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
