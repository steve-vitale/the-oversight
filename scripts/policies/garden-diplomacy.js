'use strict';
// Opt-in controller experiment. Same Game and garden brain in both arms.
// X: maintain known neighboring relations to protect actual garden investment.
// Y: endless trust visits or spending dinner to optimize a crop counter.
// Z: weekly attempts, visible cards, real grid travel, reserves, interruption
// guards and all-domain measurement. This is not a pacifist policy or tuning.
const I=require('./gardener-intent'),P=require('./public-travel');
const RULES=Object.freeze({version:1,intervalDays:7,minHealth:60,minKcal:1800,lastTick:128,pantryReserveDays:3,mealKcal:2400,receiptLimit:2000});
const WATER_RULES=Object.freeze({version:1,minHydration:70,minCleanLiters:1,scope:'Optional departure and offered-action safety, not a guarantee of hydration throughout transit.'});
const token=G=>({state:G.state,person:G.state.scholar,bearer:G.villagerId,run:G.state.runKey});
const same=(G,t)=>G.state===t.state&&G.state.scholar===t.person&&G.villagerId===t.bearer&&G.state.runKey===t.run;
const busy=G=>G.over||G.inCombat()||G.pendingEncounter||!!(G.state.activeContest&&G.state.activeContest.phase!=='done');
const snap=G=>({bearer:G.villagerId,day:G.state.scholar.day,tick:G.state.scholar.dayTicks,world:[G.map.px,G.map.py],kcal:G.state.scholar.kcal,health:G.state.scholar.health});
function record(ctx,row){const a=ctx.gardenDiplomacy||(ctx.gardenDiplomacy=[]);if(a.length<RULES.receiptLimit)a.push(row);else ctx.gardenDiplomacyDropped=(ctx.gardenDiplomacyDropped||0)+1;}
function targets(G,ctx){
 return(G.state.otherVillages||[]).filter(v=>v.generated&&(G.mapSeen(v.x,v.y)||G.villageSighting?.(v.id))&&G.villageCard(v.id))
  .map(v=>({id:v.id,x:v.x,y:v.y,distance:Math.abs(v.x-G.map.px)+Math.abs(v.y-G.map.py),last:ctx.gardenDiplomacyVisits?.[v.id]??-Infinity}))
  .sort((a,b)=>a.last-b.last||a.distance-b.distance||String(a.id).localeCompare(String(b.id)));
}
function waterStatus(G){
 const s=G.state.scholar,hydration=Number.isFinite(s.hydration)?s.hydration:null;
 const cleanLiters=(s.water||[]).reduce((n,b)=>n+(b?.quality==='clean'&&Number.isFinite(b.liters)&&b.liters>0?b.liters:0),0);
 return{hydration,cleanLiters,reason:hydration===null||hydration<WATER_RULES.minHydration?'hydration':cleanLiters<WATER_RULES.minCleanLiters?'clean-water':null};
}
function waterCheck(G,ctx,stage){
 const water=waterStatus(G),rows=ctx.gardenWaterDecisions||(ctx.gardenWaterDecisions=[]);
 if(rows.length<RULES.receiptLimit)rows.push({stage,...snap(G),water});else ctx.gardenWaterDecisionsDropped=(ctx.gardenWaterDecisionsDropped||0)+1;
 return water.reason;
}
function guard(G,ctx,waterSafe=false){
 if(busy(G))return'interrupted';const s=G.state.scholar;
 if(!G.gardenPlots().some(p=>p.pid&&!p.dead))return'no-live-garden';
 if(s.health<RULES.minHealth||s.kcal<RULES.minKcal)return'personal-reserve';
 if(s.dayTicks>RULES.lastTick)return'late';
 if(ctx.gardenDiplomacyAttemptDay!=null&&s.day-ctx.gardenDiplomacyAttemptDay<RULES.intervalDays)return'weekly-budget';
 if(waterSafe&&waterCheck(G,ctx,'departure'))return'water-reserve';
 return null;
}
function choose(card,pantryKcal,people){
 const offered=id=>card.actions.find(a=>a.id===id);
 // The UI exposes trust tiers, not the hidden exact value. "Trust you"
 // starts at30, safely above the printed20 requirement; "know your face"
 // covers10..29 and cannot establish an affordable split.
 if(/they trust you/.test(card.sub)&&offered('deal_split'))return offered('deal_split');
 if(pantryKcal>=2000+RULES.mealKcal*Math.max(1,people)*RULES.pantryReserveDays&&offered('deal_tribute'))return offered('deal_tribute');
 return null;
}
function visit(G,ctx,waterSafe=false){
 const refused=guard(G,ctx,waterSafe);if(refused)return false;
 const observe=()=>waterSafe?{...snap(G),water:waterStatus(G)}:snap(G);
 const target=targets(G,ctx)[0];if(!target)return false;
 const actor=token(G),before=observe(),home=[G.map.px,G.map.py];
 ctx.gardenDiplomacyAttemptDay=before.day;
 (ctx.gardenDiplomacyVisits||(ctx.gardenDiplomacyVisits={}))[target.id]=before.day;
 const row={before,target,actions:[],reason:null};
 const outcome=()=>{const v=(G.state.otherVillages||[]).find(v=>v.id===target.id);return v?{trust:v.trust??0,deal:v.commons?.deal??null,tension:v.commons?.tension??null,offerOpen:!!v.commonsTalkOpen}:null;};
 row.observedBefore=outcome();
 const finish=reason=>{row.reason=reason;row.after=observe();row.observedAfter=outcome();record(ctx,row);return true;};
 const interrupted=()=>!same(G,actor)||busy(G);
 const near=()=>Math.abs(target.x-G.map.px)+Math.abs(target.y-G.map.py)<=1;
 const card=()=>!interrupted()&&near()?G.villageCard(target.id):null;
 const perform=id=>{
  const live=card(),action=live?.actions.find(a=>a.id===id);if(!action)return false;
  if(waterSafe&&waterCheck(G,ctx,'action:'+id))return false;
  const prior=observe(),pantry=G.pantryKcalLive(G.state.village);
  const result=G.villageCardAction(target.id,id,{giftKcal:action.giftKcal||0});
  row.actions.push({id,before:prior,after:observe(),pantryBefore:pantry,pantryAfter:G.pantryKcalLive(G.state.village),accepted:typeof result==='boolean'?result:result?.ok??null});
  return true;
 };
 if(!near())P.within(G,ctx,()=>P.travel(G,target.x,target.y));
 row.arrival=observe();
 if(interrupted())return finish('travel-interrupted');
 if(!near())return finish('not-reached');
 if(G.state.scholar.day!==before.day)return finish('travel-crossed-day');
 if(G.state.scholar.health<RULES.minHealth||G.state.scholar.kcal<RULES.minKcal)return finish('arrival-reserve');
 if(waterSafe&&waterCheck(G,ctx,'arrival'))return finish('arrival-water-reserve');
 // One paid conversation builds actual trust and knowledge. No raw trust
 // read, grant, fake visit or repeated same-day conversation.
 perform('talk');
 if(interrupted())return finish('conversation-interrupted');
 if(G.state.scholar.day!==before.day)return finish('conversation-crossed-day');
 if(waterSafe&&waterCheck(G,ctx,'after-conversation'))return finish('conversation-water-reserve');
 const live=card();if(!live)return finish('card-unavailable');
 if(!live.actions.some(a=>a.id.startsWith('deal_')))perform('territory');
 if(interrupted())return finish('discussion-interrupted');
 const offer=card();if(offer){
  const people=1+[...new Set(G.state.village.roster||[])].filter(id=>id!==G.villagerId&&!G.getPerson(id)?.dead).length;
  const decision=choose(offer,G.pantryKcalLive(G.state.village),people);
  if(decision)perform(decision.id);
 }
 if(interrupted())return finish('deal-interrupted');
 // The reader's Close is free: do not select Leave merely because food or
 // trust is insufficient. Persist the real offer for a later visit.
 if(G.map.px!==home[0]||G.map.py!==home[1])P.within(G,ctx,()=>P.travel(G,...home));
 return finish(interrupted()?'return-interrupted':G.map.px===home[0]&&G.map.py===home[1]?'returned':'return-not-reached');
}
const base=I.profiles.find(p=>p.id==='garden-invest-expand');
function profile(enabled,waterSafe=false){return{
 ...base,id:waterSafe?'garden-diplomacy-water-safe':'garden-diplomacy-'+(enabled?'visit':'control'),desc:base.desc+'; declared diplomacy controller arm '+enabled+(waterSafe?'; water guard':''),
 setup(G,ctx){const result=base.setup(G,ctx),previous=ctx.capBeforeHunt;
  if(enabled)ctx.capBeforeHunt=(g,c)=>{if(previous)previous(g,c);try{return visit(g,c,waterSafe);}catch(e){(c.gardenDiplomacyErrors||(c.gardenDiplomacyErrors=[])).push(e.message);console.warn('[garden-diplomacy] '+e.message);throw e;}};
  return result;
 },
 diagnostics(ctx){const d=base.diagnostics(ctx);return{...d,profile:this.id,errors:[...d.errors,...(ctx.gardenDiplomacyErrors||[])],diplomacy:{enabled,rules:RULES,receipts:ctx.gardenDiplomacy||[],dropped:ctx.gardenDiplomacyDropped||0,travel:P.diagnostics(ctx),...(waterSafe?{water:{rules:WATER_RULES,decisions:ctx.gardenWaterDecisions||[],dropped:ctx.gardenWaterDecisionsDropped||0}}:{})}};}
};}
const profiles=[profile(false),profile(true),profile(true,true)];
module.exports={profiles,RULES,WATER_RULES,waterStatus,waterCheck,targets,guard,choose,visit};
