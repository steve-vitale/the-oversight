'use strict';
// Native mobile-equivalent crossing plus declared interruption/blocked fixtures.
// Fresh shared harness in each child; no copied eval boot or written outputs.
const assert=require('assert/strict'),cp=require('child_process'),K=require('./lib'),P=require('../policies/public-travel'),gear=require('../gear-usage-audit');
const outside=require('../../evidence/2026-10-21/public-travel-fixture-r1.json'),inside=require('../../evidence/2026-10-21/walk-cadence-interior-fixture-r1.json');
async function child(kind){
 const fixture=kind==='hall'?inside:outside,blobs=new Map(Object.entries(fixture.storage));
 global.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,setItem:(k,v)=>blobs.set(k,String(v)),removeItem:k=>blobs.delete(k)};
 const G=await K.load({seed:7002});assert(G.load(fixture.key));if(G.state.scholar.knackChoices?.length)G.chooseKnack(G.state.scholar.knackChoices[0].id);
 const ctx={},s=G.state.scholar,actor=P.token(G),target=outside.route.target,originalTravel=G.travelTo,crossings=[];
 G.travelTo=function(x,y,...args){const ex=this.edgeExit(this.state.scholar.mx,this.state.scholar.my);crossings.push({from:[this.map.px,this.map.py],to:[x,y],ex,args});return originalTravel.call(this,x,y,...args);};
 const start={world:[G.map.px,G.map.py],position:[s.mx,s.my],kcal:s.kcal,tick:s.dayTicks};
 if(kind==='reference'||kind==='edge')for(const step of G.beginPathWalk(...outside.route.edge))assert(G.pathStep(...step));
 if(kind==='reference'){const c=G.captureTravelCheckpoint();G.tryNodeExit(target[0]-G.map.px,target[1]-G.map.py);G.commitTravelCheckpoint(c);}
 else if(kind==='native'||kind==='edge')P.within(G,ctx,()=>P.travel(G,...target));
 else if(kind==='poor'){s.kcal=0;P.within(G,ctx,()=>P.travel(G,...target));assert.equal(ctx.publicTravelCounters.landedSteps||0,0);assert.equal(ctx.publicTravelReceipts[0].reason,'unaffordable-or-no-path');assert.equal(s.kcal,0);assert.equal(s.dayTicks,start.tick);}
 else if(kind==='blocked'){G.tileAt(...target).blockFrom={dx:0,dy:-1,type:'fallen_tree'};const r=P.within(G,ctx,()=>P.travel(G,...target));assert.equal(r.kind,'blockage');assert.equal(ctx.publicTravelReceipts[0].reason,'blocked');assert.equal(ctx.publicTravelCounters.landedSteps,outside.route.path.length);assert.equal(crossings.length,0);assert.deepEqual([G.map.px,G.map.py],start.world);}
 else if(kind==='combat'||kind==='contest'){if(kind==='combat')K.fight(G,'hushwolf');else G.state.activeContest={fixture:true};P.within(G,ctx,()=>P.travel(G,...target));assert.equal(ctx.publicTravelCounters.landedSteps||0,0);assert.equal(crossings.length,0);}
 else if(['death','scene','state','pending'].includes(kind)){
  const original=G.monsterTurn;let injected=false,after;
  G.monsterTurn=function(...args){const r=original.apply(this,args);if(!injected){injected=true;if(kind==='death')this.playerDeath('prepared public-grid walking death');if(kind==='scene')this.map.px=3;if(kind==='state')this.state={...this.state};if(kind==='pending')this.pendingEncounter=true;after={bearer:this.villagerId,kcal:this.state.scholar.kcal,tick:this.state.scholar.dayTicks,position:[this.state.scholar.mx,this.state.scholar.my]};}return r;};
  // Pending choices stop the next controller command. The already-landed
  // native pathStep still completes its own NPC/clock response; the adapter
  // must not replace that real response with a partial simulated step.
  if(kind==='pending'){const step=G.pathStep;G.pathStep=function(...args){const r=step.apply(this,args);after={bearer:this.villagerId,kcal:this.state.scholar.kcal,tick:this.state.scholar.dayTicks,position:[this.state.scholar.mx,this.state.scholar.my]};return r;};}
  P.within(G,ctx,()=>{P.travel(G,...target);P.travel(G,...target);});
  assert.equal(ctx.publicTravelCounters.landedSteps,1);assert.equal(crossings.length,0);assert.deepEqual({bearer:G.villagerId,kcal:G.state.scholar.kcal,tick:G.state.scholar.dayTicks,position:[G.state.scholar.mx,G.state.scholar.my]},after);
 }else if(kind==='hall'){
  assert(s.insideHaven);const exit=G.exitBuilding;let doorCalls=0;
  G.exitBuilding=function(...args){const d=this.genDetail(this.map.px,this.map.py);assert(d.some((row,y)=>row.some((c,x)=>c==='door'&&Math.max(Math.abs(x-s.mx),Math.abs(y-s.my))<=1)));doorCalls++;return exit.apply(this,args);};
  P.within(G,ctx,()=>P.travel(G,...target));assert.equal(doorCalls,1);assert.equal(ctx.publicTravelCounters.hallExits,1);assert(!s.insideHaven);
 }else if(kind==='error'){
  G.beginPathWalk=()=>{throw Error('prepared native path failure');};const warnings=[],warn=console.warn;console.warn=(...args)=>warnings.push(args.join(' '));
  try{assert.throws(()=>P.within(G,ctx,()=>P.travel(G,...target)),/prepared native path failure/);}finally{console.warn=warn;}
  assert.deepEqual(ctx.publicTravelErrors,['prepared native path failure']);assert.equal(warnings.length,1);assert(warnings[0].includes('prepared native path failure'));assert.equal(crossings.length,0);
 }else if(kind==='fallback'){
  const calls=[];G.travelTo=(...args)=>{calls.push(args);return 17;};assert.equal(P.travel(G,1,2,true,'fourth'),17);assert.deepEqual(calls,[[1,2,true,'fourth']]);
  assert.throws(()=>P.within(G,ctx,()=>{throw Error('declared scope error');}),/declared scope error/);assert.equal(P.travel(G,4,5),17);assert.deepEqual(calls[1],[4,5]);return;
 }else throw Error('Unknown '+kind);
 for(const c of crossings){assert.equal(Math.abs(c.to[0]-c.from[0])+Math.abs(c.to[1]-c.from[1]),1);assert.equal(c.ex.dx,c.to[0]-c.from[0]);assert.equal(c.ex.dy,c.to[1]-c.from[1]);assert(c.args.every(x=>!x),'no force or combat-exit override');}
 if(kind==='edge'){assert.equal(ctx.publicTravelCounters.landedSteps||0,0);assert.equal(ctx.publicTravelCounters.crossedNodes,1);}
 if(kind==='native'){assert.equal(ctx.publicTravelCounters.landedSteps,outside.route.path.length);assert.deepEqual(ctx.publicTravelReceipts[0].hops[0].edge,outside.route.edge);assert.equal(ctx.publicTravelCounters.crossedNodes,1);}
 if(kind==='native'||kind==='reference')return{hash:gear.gameplayHash(G.state),world:[G.map.px,G.map.py],position:[G.state.scholar.mx,G.state.scholar.my],kcal:s.kcal,tick:s.dayTicks,random:[Math.random(),Math.random(),Math.random()]};
}
(async()=>{
 if(process.argv[2]){const result=await child(process.argv[2]);console.log('@@GRID@@'+JSON.stringify(result||{}));return;}
 const native=[];let cases=0;for(const kind of ['reference','native','edge','poor','blocked','combat','contest','death','scene','state','pending','hall','fallback','error']){
  const r=cp.spawnSync(process.execPath,[__filename,kind],{encoding:'utf8',maxBuffer:8e6});assert.equal(r.status,0,kind+': '+r.stdout+r.stderr);if(['reference','native'].includes(kind))native.push(JSON.parse(r.stdout.split('@@GRID@@').pop()));cases++;console.log('Public grid '+kind+' passed');
 }
 assert.deepEqual(native[0],native[1],'native direct phone verbs and controller have identical Game hash/resources/position/RNG');console.log('Public grid travel: '+cases+' passed, 0 failed');
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
