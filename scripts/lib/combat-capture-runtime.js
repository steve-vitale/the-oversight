'use strict';
// Read only the runtime aliases projected by Game.syncRun. Never call a Game
// helper, advance a turn, save, or infer a live alias from stale state.run.
const assert=require('assert/strict');
const SCHEMA_VERSION=2;
function capture(G){
 return {dayPart:G.dayPart,ap:G.ap,over:G.over,won:G.won,villageLost:G.villageLost,map:G.map,departed:G.departed,tbfight:G.tbfight,
  runProjection:{map:G.map,dayPart:G.dayPart,location:G.location,departed:G.departed,log:G.log.slice(-40),homeRegion:G.homeRegion,villagerId:G.villagerId,
   encounterDone:G.encounterDone,wanderer:G.wanderer||null,pendingEncounter:!!G.pendingEncounter,pendingMonsterId:G.pendingMonsterId||null,pendingInTent:!!G.pendingInTent}};
}
function restore(G,runtime){
 assert(runtime&&runtime.runProjection,'A complete live run projection is required; do not infer aliases from state.run');
 const p=runtime.runProjection;
 assert(p.map&&p.villagerId===G.state.scholar.villagerId,'Actual bearer/world aliases');
 assert(Object.hasOwn(p,'wanderer')&&Object.hasOwn(p,'pendingEncounter')&&Object.hasOwn(p,'pendingMonsterId')&&Object.hasOwn(p,'pendingInTent'),'Explicit actual world/encounter aliases');
 for(const key of ['map','dayPart','location','departed','log','homeRegion','villagerId','encounterDone','wanderer','pendingEncounter','pendingMonsterId','pendingInTent'])
  G[key]=Object.hasOwn(p,key)?structuredClone(p[key]):undefined;
 G.ap=runtime.ap;G.over=runtime.over;G.won=runtime.won;G.villageLost=runtime.villageLost;
 assert.equal(G.villagerId,G.state.scholar.villagerId,'Prepared bearer remains actual');
}
module.exports={SCHEMA_VERSION,capture,restore};
