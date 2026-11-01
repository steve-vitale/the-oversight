'use strict';
const C=require('./competent'),I=require('./gardener-intent');
const RULES=Object.freeze({version:1,health:60,reserveKcal:1800,dayPart:0,lastTickExclusive:128,receiptLimit:4000});
const key=G=>G.villagerId+':'+G.state.scholar.day;
const snapshot=G=>{const s=G.state.scholar;return{bearer:G.villagerId,day:s.day,part:G.dayPart,tick:s.dayTicks,kcal:s.kcal,health:s.health,world:[G.map.px,G.map.py]};};
function record(ctx,row){const rows=ctx.gardenDaystart||(ctx.gardenDaystart=[]);if(rows.length<RULES.receiptLimit)rows.push(row);else ctx.gardenDaystartDropped=(ctx.gardenDaystartDropped||0)+1;}
function reason(G,ctx){
 if(G.over||G.inCombat()||G.pendingEncounter)return'interrupted';
 if(G.map.px!==4||G.map.py!==4)return'away';
 const s=G.state.scholar;
 if(G.dayPart!==RULES.dayPart||s.dayTicks>=RULES.lastTickExclusive)return'outside-dawn';
 if(s.health<RULES.health||s.kcal<RULES.reserveKcal)return'personal-reserve';
 if(C.recovering(G,ctx))return'recovery';
 return null;
}
function dayStartGarden(G,ctx){
 const initial=snapshot(G),original=key(G),state=G.state,scholar=G.state.scholar;
 const refused=ctx._gardenDaystartConsidered===original?'already-considered':reason(G,ctx);
 if(refused){record(ctx,{phase:'dawn',reason:refused,initial,before:initial,after:initial});return false;}
 ctx._gardenDaystartConsidered=original;
 C.keepPromises(G,ctx);
 const before=snapshot(G),changed=G.state!==state||G.state.scholar!==scholar||key(G)!==original;
 const blocked=changed?'obligation-changed-actor-day':reason(G,ctx);
 if(blocked){record(ctx,{phase:'dawn',reason:blocked,initial,before,after:before});return false;}
 ctx._gardenDaystartWorked=original;
 C.workGarden(G,ctx);
 record(ctx,{phase:'dawn',reason:'session',initial,before,after:snapshot(G)});return true;
}
function lateGarden(G,ctx,phase){
 if(phase==='early')return false; // This profile's dawn hook owns early work.
 const before=snapshot(G);
 if(ctx._gardenDaystartWorked===key(G)){record(ctx,{phase:'late',reason:'already-worked-dawn',initial:before,before,after:before});return false;}
 C.workGarden(G,ctx);record(ctx,{phase:'late',reason:'session',initial:before,before,after:snapshot(G)});return true;
}
const profiles=I.profiles.filter(p=>['garden-invest','garden-invest-expand'].includes(p.id)).map(base=>({
 ...base,id:base.id+'-daystart',desc:base.desc+'; actual dawn garden session before driver Wait',
 setup(G,ctx){const r=base.setup(G,ctx);ctx.gardenWork=lateGarden;ctx.capBeforeHunt=function(g,c){try{return dayStartGarden(g,c);}catch(e){(c.gardenDaystartErrors||(c.gardenDaystartErrors=[])).push(e.message);console.warn('[garden-daystart] '+e.message);throw e;}};return r;},
 diagnostics(ctx){const d=base.diagnostics(ctx);return{...d,errors:[...d.errors,...(ctx.gardenDaystartErrors||[])],profile:base.id+'-daystart',daystart:{rules:RULES,receipts:ctx.gardenDaystart||[],dropped:ctx.gardenDaystartDropped||0}};}
}));
module.exports={profiles,RULES,dayStartGarden,lateGarden};
