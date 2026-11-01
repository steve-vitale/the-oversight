'use strict';
// Optional timing methodology. No Game patch or extra late garden session.
const C=require('./competent'),I=require('./gardener-intent');
const RULES=Object.freeze({version:1,health:60,reserveKcal:1800,lastTick:320,receiptLimit:4000});
function key(G){return G.villagerId+':'+G.state.scholar.day;}
function snapshot(G){const s=G.state.scholar;return{bearer:G.villagerId,day:s.day,tick:s.dayTicks,kcal:s.kcal,health:s.health,world:[G.map.px,G.map.py]};}
function record(ctx,row){const rows=ctx.gardenSchedule||(ctx.gardenSchedule=[]);if(rows.length<RULES.receiptLimit)rows.push(row);else ctx.gardenScheduleDropped=(ctx.gardenScheduleDropped||0)+1;}
function scheduledGarden(G,ctx,phase){
 const before=snapshot(G),original=key(G);let reason=null;
 if(ctx._gardenEarlyDone===original)reason='already-worked-early';
 else if(phase==='early'){
  if(G.over||G.inCombat()||G.pendingEncounter)reason='interrupted';
  else if(G.map.px!==4||G.map.py!==4)reason='away';
  else if(before.health<RULES.health||before.kcal<RULES.reserveKcal||before.tick>RULES.lastTick)reason='personal-reserve';
 }
 if(reason){record(ctx,{phase,reason,before,after:before});return false;}
 // Mark only the original bearer/day. A dawn or mantle does not inherit this
 // session, and an unsafe early refusal leaves the original late routine free.
 if(phase==='early')ctx._gardenEarlyDone=original;
 C.workGarden(G,ctx);
 record(ctx,{phase,reason:'session',before,after:snapshot(G)});return true;
}
const profiles=I.profiles.filter(p=>['garden-invest','garden-invest-expand'].includes(p.id)).map(base=>({
 ...base,id:base.id+'-early',desc:base.desc+'; safe garden session before outings',
 setup(G,ctx){const r=base.setup(G,ctx);ctx.gardenWork=scheduledGarden;return r;},
 diagnostics(ctx){const d=base.diagnostics(ctx);return{...d,profile:base.id+'-early',scheduling:{rules:RULES,receipts:ctx.gardenSchedule||[],dropped:ctx.gardenScheduleDropped||0}};}
}));
module.exports={profiles,RULES,scheduledGarden};
