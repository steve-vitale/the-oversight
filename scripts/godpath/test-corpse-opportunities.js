'use strict';
const assert=require('assert/strict'),K=require('./lib'),{install}=require('../lib/corpse-opportunities');
(async()=>{
  const G=await K.load({seed:812,narration:true}),T=K.reporter('corpse-opportunities');
  const early=install(G);T.ok('pre-run harness installation waits for native setup',early.finish().observations===0);early.uninstall();K.newRun(G);
  G.state.scholar.insideHaven=false;G.state.scholar.mx=4;G.state.scholar.my=5;G.state.corpses=[];
  const recorder=install(G),native=G.registerDeath;
  const before=JSON.stringify({state:G.state,map:G.map});recorder.finish();
  T.ok('sampling reads fields without modifying the game',JSON.stringify({state:G.state,map:G.map})===before);
  const c=G.registerDeath({kind:'animal',name:'Declared test body',mx:4,my:7,
    items:[{name:'Declared test ration',plantId:'blueberry',units:2,kg:.01,safe:true,edible:true,kcalEach:10}]});c.deathKnown=true;
  assert(G.enterBuilding());assert.equal(G._corpseCheckRange(c,true),false);
  let row=recorder.finish().bodies.find(x=>x.id===c.id);
  T.ok('same-node bodies in a different room are not local observations',row.localObservations===1&&row.adjacentObservations===0);
  T.ok('actual native range refusal is distinct from geometric coverage',row.rangeCalls===1&&row.rangeRefused===1&&row.rangeAccepted===0);
  T.ok('known death does not invent location knowledge',row.deathKnownObserved&&row.locationKnowledge===null);
  assert(G.exitBuilding());G.state.scholar.my=6;assert(G._corpseCheckRange(c,true));
  row=recorder.finish().bodies.find(x=>x.id===c.id);
  T.ok('actual native exit and adjacent range acceptance are recorded',row.rangeAccepted===1&&row.firstAdjacent!==null);
  const taken=G.corpseTakeItem(c.id,0);row=recorder.finish().bodies.find(x=>x.id===c.id);
  T.ok('native transfer preserves the original stack count before source depletion',!!taken&&row.transfers.length===1&&row.transfers[0].itemBefore.units===2&&row.transfers[0].itemAfter.units===0);
  const originalFight=G.tbfight;G.tbfight={id:'declared-frame',gridSize:12,fighters:[{key:'p',mx:11,my:11}]};
  const frame=G.registerDeath({kind:'animal',name:'Declared projected body',node:{x:G.map.px,y:G.map.py},mx:4,my:6,items:[]});
  const frameRow=recorder.finish().bodies.find(x=>x.id===frame.id);
  T.ok('scholar proximity during combat is not counted as quiet action coverage',frameRow.firstAdjacent!==null&&frameRow.firstQuietAdjacent===null&&frameRow.firstAdjacent.position.combat.gridSize===12);
  G.tbfight=originalFight;
  recorder.uninstall();T.ok('instrumentation can be removed',G.registerDeath!==native);
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
