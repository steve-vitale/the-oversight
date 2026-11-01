'use strict';
// Canonical scene flags through native load, exile and physical departure.
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process'),assert=require('assert/strict'),K=require('./lib'),P=require('../policies/public-travel');
const capture=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'../../evidence/2026-10-21/public-grid-exile-capture-r1.json.gz'))));
async function child(kind){
 const state=structuredClone(capture.state),s=state.scholar;
 if(kind==='legacy-home'||kind==='legacy-away'||kind==='legacy-exiled'){delete s.insideHaven;s.exiled=kind==='legacy-exiled';if(kind==='legacy-away'){state.run.map.px=5;state.run.map.py=4;}}
 if(kind==='inside')s.insideHaven=true;if(kind==='outside')s.insideHaven=false;
 const key=state.runKey,blobs=new Map([[key,JSON.stringify(state)]]);global.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,setItem:(k,v)=>blobs.set(k,String(v)),removeItem:k=>blobs.delete(k)};
 const G=await K.load({seed:5});assert(G.load(key));const actor=G.state.scholar,inside=kind==='inside'||kind==='legacy-home';
 assert.equal(actor.insideHaven,inside,'normal load must give every consumer one boolean scene');
 if(kind==='legacy-away'){assert.equal(G.shelteredFromSky(),false);return;}
 const t=G.playerTile(),grounds=structuredClone(t.groundsDetail),hall=structuredClone(t.hallDetail),board=G.genDetail(G.map.px,G.map.py);
 assert.equal(board.some(row=>row.includes('hall')),inside);
 assert.equal(!!G.gardenCellAt(3,1),!inside,'garden interactions belong to the visible grounds, never the hall');
 assert.equal(!!G.gardenMarkerAt(3,1),!inside,'garden markers agree with the displayed scene');assert.equal(board,t[inside?'hallDetail':'groundsDetail']);assert.deepEqual(t.groundsDetail,grounds);assert.deepEqual(t.hallDetail,hall);
 if(kind==='natural'){
  assert.equal(actor.day,602);assert(actor.exiled);assert.equal(actor.hydration,capture.state.scholar.hydration);assert.equal(actor.kcal,capture.state.scholar.kcal);
  const ctx={},from=[G.map.px,G.map.py];P.within(G,ctx,()=>P.travel(G,4,5));assert(ctx.publicTravelCounters.landedSteps>0);assert.equal(ctx.publicTravelCounters.crossedNodes,1);assert.notDeepEqual([G.map.px,G.map.py],from);
  assert(G.save());const before={world:[G.map.px,G.map.py],position:[actor.mx,actor.my],bearer:G.villagerId,kcal:actor.kcal,tick:actor.dayTicks};assert(G.load(key));assert.equal(G.state.scholar.insideHaven,false);assert.deepEqual({world:[G.map.px,G.map.py],position:[G.state.scholar.mx,G.state.scholar.my],bearer:G.villagerId,kcal:G.state.scholar.kcal,tick:G.state.scholar.dayTicks},before);
 }
 if(kind==='exile'){
  K.newRun(G);assert.equal(G.state.scholar.insideHaven,true);G.exilePlayer('prepared scene test');assert.equal(G.state.scholar.insideHaven,false);assert(G.state.scholar.exiled);assert(!G.genDetail(G.map.px,G.map.py).some(row=>row.includes('hall')));
  const dest=G.travelTargets().find(t=>t.d===1&&!G.travelBlockage(t.x,t.y));assert(dest);const ctx={};P.within(G,ctx,()=>P.travel(G,dest.x,dest.y));assert.equal(ctx.publicTravelCounters.crossedNodes,1,'a newly exiled bearer can walk away through the actual grid');
 }
 if(kind==='direct-null'){
  actor.insideHaven=null;assert(!G.genDetail(G.map.px,G.map.py).some(row=>row.includes('hall')),'defensive runtime renderer treats explicit null as outdoors');
 }
}
(async()=>{if(process.argv[2]){await child(process.argv[2]);return;}
 let count=0;for(const kind of ['natural','inside','outside','legacy-home','legacy-away','legacy-exiled','exile','direct-null']){const r=cp.spawnSync(process.execPath,[__filename,kind],{encoding:'utf8',maxBuffer:8e6});assert.equal(r.status,0,kind+': '+r.stdout+r.stderr);count++;console.log('Exile scene '+kind+' passed');}console.log('Exile Haven scene: '+count+' passed, 0 failed');
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
