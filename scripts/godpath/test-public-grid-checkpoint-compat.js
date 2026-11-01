'use strict';
// Same native verbs on current and declared older API shapes; optional --root
// additionally exercises a real frozen historical runtime with the common kit.
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');
const current=path.resolve(__dirname,'../..'),arg=process.argv.indexOf('--root'),root=arg<0?current:path.resolve(process.argv[arg+1]);
const K=require(path.join(root,'scripts/godpath/lib')),P=require('../policies/public-travel'),fixture=require('../../evidence/2026-10-21/public-travel-fixture-r1.json');
async function child(){
 const mode=process.argv[3],legacy=process.argv[4]==='legacy',blobs=new Map(Object.entries(fixture.storage));
 global.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,setItem:(k,v)=>blobs.set(k,String(v)),removeItem:k=>blobs.delete(k)};
 const G=await K.load({seed:7002});assert(G.load(fixture.key));if(G.state.scholar.knackChoices?.length)G.chooseKnack(G.state.scholar.knackChoices[0].id);
 if(legacy){delete G.captureTravelCheckpoint;delete G.commitTravelCheckpoint;}
 const capture=G.captureTravelCheckpoint,commit=G.commitTravelCheckpoint,canCheckpoint=typeof capture==='function'&&typeof commit==='function',ctx={},s=G.state.scholar,target=fixture.route.target,before={kcal:s.kcal,tick:s.dayTicks};
 if(mode==='manual'){
  const route=G.beginPathWalk(...fixture.route.edge);assert(route);for(const step of route)assert(G.pathStep(...step));
  const checkpoint=canCheckpoint?G.captureTravelCheckpoint():null;G.tryNodeExit(target[0]-G.map.px,target[1]-G.map.py);if(checkpoint)G.commitTravelCheckpoint(checkpoint);
 }else P.within(G,ctx,()=>P.travel(G,...target));
 assert.equal(G.captureTravelCheckpoint,capture,'Controller cannot install or replace Game hooks');assert.equal(G.commitTravelCheckpoint,commit);
 assert.deepEqual([G.map.px,G.map.py],target,'Native crossing completes');assert(s.kcal<before.kcal&&s.dayTicks>before.tick,'Walking/crossing retains real cost');
 if(mode==='policy')assert.equal(ctx.publicTravelCounters.checkpointUnavailable||0,canCheckpoint?0:1,'Missing durability capability is recorded, not invented');
 const state={state:G.state,map:G.map,dayPart:G.dayPart,bearer:G.villagerId,nextRandom:Math.random()};process.stdout.write('@@COMPAT@@'+JSON.stringify({state,canCheckpoint,ctx}));
}
if(process.argv[2]==='--child')child().catch(e=>{console.error(e.stack);process.exitCode=1;});else{
 let passed=0;
 for(const shape of ['current','legacy']){
  const rows=['manual','policy'].map(mode=>{const r=cp.spawnSync(process.execPath,[__filename,'--child',mode,shape,'--root',root],{encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(r.status,0,r.stderr||r.stdout.slice(-2000));return JSON.parse(r.stdout.split('@@COMPAT@@').pop());});
  assert.deepEqual(rows[1].state,rows[0].state,'Whole state/map/resources/RNG match actual native verbs: '+shape);passed++;console.log('Native crossing parity '+shape+' passed');
 }
 console.log('Public checkpoint compatibility: '+passed+' passed, 0 failed');
}
