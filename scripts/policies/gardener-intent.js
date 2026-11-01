'use strict';
// Declared mixed-survival methodology, not a Game lever or pacifist claim.
const {capable,chooseOffers}=require('./capable');
const PRIORITY=['green_thumb','green_whisper','cornucopia','rain_dancer','photosynthesis'];
const CORE=PRIORITY.slice(0,2);
const RULES=Object.freeze({version:1,reserveKcal:1800,health:60,lastBuildTick:320,mealKcal:2400,stockDays:3,practiceBeds:2});
function entries(G){return(G.state.scholar.abilities||[]).map(a=>typeof a==='string'?{id:a,base:a,level:1}:{id:a.id,base:a.evolvedFrom||a.id,level:a.level||1});}
function error(ctx,where,e){const message=where+': '+e.message;(ctx.gardenerErrors||(ctx.gardenerErrors=[])).push(message);console.warn('[gardener-policy] '+message);}
function record(ctx,key,row){const rows=ctx[key]||(ctx[key]=[]);if(rows.length<2000)rows.push(row);else ctx[key+'Dropped']=(ctx[key+'Dropped']||0)+1;}
function usableKcal(G,rows){return(rows||[]).reduce((n,it)=>{
 if(!it||it.edible===false||it.safe===false||it.needsCooking||it.diseaseRisk||it.poisonRisk||it.parasiteRisk||it.foodState==='unknown'||!Number.isFinite(it.units)||!Number.isFinite(it.kcalEach)||it.units<=0||it.kcalEach<=0)return n;
 if(it.plantId&&!it.foodKind&&!(G.state.codex.plants?.[it.plantId]?.level>=1))return n;
 return n+(G.isFinishedFood(it)&&!G.isSpoiled(it)?it.units*it.kcalEach:0);
},0);}
function resolveGardenOffers(G,ctx){
 if(!ctx.gardenerInvest)return false;
 const s=G.state.scholar,ch=s.abilityChoices;if(!ch?.length)return false;
 const held=entries(G),rank=id=>{const base=held.find(a=>a.id===id)?.base||id;return PRIORITY.includes(base)?PRIORITY.indexOf(base):Infinity;};
 const preferred=PRIORITY.find(id=>ch.some(c=>c.id===id)&&!held.some(a=>a.base===id));
 const full=held.length>=G.abilitySlots(),level=String(ch[0].src||'').startsWith('level_up:');
 let replace;
 if(preferred&&full&&level)replace=held.filter(a=>a.id!=='fusion_reactor'&&rank(a.id)>rank(preferred)).sort((a,b)=>rank(b.id)-rank(a.id)||held.indexOf(a)-held.indexOf(b))[0]?.id;
 // Keep an earned core build if the normal brain would discard it. Other
 // actual choices still use capable's normal scoring/replacement machinery.
 const normal=!preferred&&full&&level&&G.buildDecide&&CORE.some(id=>held.some(a=>a.base===id))?G.buildDecide('player',ch.map(c=>c.id)):null;
 const protect=CORE.includes(held.find(a=>a.id===normal?.replace)?.base);
 if(!preferred&&!protect)return false;
 const before=held.map(a=>a.id),day=s.day,bearer=G.villagerId;
 if(protect||(full&&level&&!replace))G.keepAbilities();
 else if(!full||replace)G.chooseAbility(preferred,replace);
 else return false; // non-level sheet has no replacement permission
 const after=entries(G).map(a=>a.id);
 record(ctx,'gardenerChoices',{day,bearer,offered:ch.map(c=>({id:c.id,src:c.src||null})),preferred:preferred||null,replace:replace||null,before,after,acquired:!!preferred&&!before.includes(preferred)&&after.includes(preferred),kept:protect||!!(full&&level&&!replace)});
 return true;
}
function planExpansion(G,ctx){
 const s=G.state.scholar,plots=G.gardenPlots(),v=G.state.village;
 const row={day:s.day,bearer:G.villagerId,plots:plots.length,capacity:G.gardenCapacity(),target:plots.length,reason:null};
 const stop=reason=>({...row,reason});
 if(G.over||G.inCombat()||G.pendingEncounter)return stop('interrupted');
 if(plots.length>=row.capacity)return stop('capacity');
 if(plots.some(p=>!p.pid||p.dead))return stop('use-existing-bed');
 const gate=G.gardenGate('make');row.makeGate={ok:gate.ok===true,reason:gate.reason||null};
 if(!gate.ok)return stop('make-gate');
 if(s.kcal<RULES.reserveKcal||s.health<RULES.health||s.dayTicks>RULES.lastBuildTick)return stop('personal-reserve');
 if(ctx._gardenerBuildDay===s.day+':'+G.villagerId)return stop('one-bed-per-day');
 const seeds=G.sowOptions().filter(o=>Number.isFinite(o.kcalEach)&&o.kcalEach>0).sort((a,b)=>a.growthDays-b.growthDays||(b.kcalEach||0)-(a.kcalEach||0));
 if(!seeds.length)return stop('known-seed-value');
 const seed=seeds[0],profile=G.gardenProfile(seed.pid),magic=G.gardenMagicPlan();
 row.seed=seed.pid;row.magic=magic?{growth:magic.growth,yield:magic.yield,costKcal:magic.costKcal}:null;
 // Nominal space is the actual pantry capacity budget, not edible intake.
 const pantryUsed=G.pantryKcal(),space=Math.max(0,G.pantryCapKcal()-pantryUsed);
 const residentIds=[...new Set(v.roster||[])].filter(id=>{const p=G.getPerson(id);return p&&!p.dead&&id!==G.villagerId;});
 const need=RULES.mealKcal*(1+residentIds.length),level=G.state.codex.plants?.[seed.pid]?.level||1;
 const batch=profile.units*seed.kcalEach*(1+.25*(level-1))*(magic?.yield||1);
 row.storageRoom=space;row.plannedBatchKcal=batch;row.planningDailyNeed=need;row.nominalPantryKcal=pantryUsed;
 row.usablePantryKcal=usableKcal(G,v.pantry);row.usablePackKcal=usableKcal(G,s.inventory);
 if(!Number.isFinite(batch)||batch<=0||space<Math.min(batch,need*2))return stop('storage');
 const projected=plots.reduce((n,p)=>{
  const known=G.state.codex.plants?.[p.pid]?.level>=1,plant=known&&G.data.plants.find(x=>x.id===p.pid);
  if(!plant||!Number.isFinite(plant.caloriesPerUnit))return n;
  // Explicit planning estimate: owned magic may be used daily, but is never
  // granted or settled here. Actual costs/intake remain measured separately.
  const days=Math.max(1,G.gardenGrowthLeft(p)/(1+(magic?.growth||0)));
  return n+G.gardenHarvestUnits(p)*plant.caloriesPerUnit/Math.max(7,days);
 },0);
 row.projectedDailyKcal=projected;
 const practice=entries(G).some(a=>CORE.includes(a.base)&&a.level<3)&&plots.length<RULES.practiceBeds;
 row.practice=practice;
 const usable=row.usablePantryKcal+row.usablePackKcal;
 if(usable>=need*RULES.stockDays)return stop('stored-surplus');
 if(projected+usable/7>=need&&!practice)return stop('projected-demand-covered');
 return{...row,target:Math.min(row.capacity,plots.length+1),reason:practice?'practice-and-food':'food-demand'};
}
function gardenTarget(G,ctx){
 try{
  const plan=planExpansion(G,ctx);record(ctx,'gardenerPlans',plan);
  if(plan.target>plan.plots)ctx._gardenerBuildDay=plan.day+':'+plan.bearer;
  return plan.target;
 }catch(e){error(ctx,'expansion',e);return G.gardenPlots().length;}
}
function profile(invest,expand){
 const id='garden-'+(invest?'invest':'control')+(expand?'-expand':'');
 return{...capable,id,desc:'Declared garden intent factorial; priority='+invest+', demand expansion='+expand,
  setup(G,ctx){ctx.gardenerInvest=invest;ctx.gardenerExpand=expand;ctx.capResolveOffers=resolveGardenOffers;ctx.resolvePendingOffers=chooseOffers;if(expand)ctx.gardenTarget=gardenTarget;return capable.setup(G,ctx);},
  diagnostics(ctx){const d=capable.diagnostics(ctx);return{...d,profile:id,mode:'declared-gardener-mixed',errors:[...d.errors,...(ctx.gardenerErrors||[])],gardener:{rules:RULES,invest,expand,choices:ctx.gardenerChoices||[],plans:ctx.gardenerPlans||[],choicesDropped:ctx.gardenerChoicesDropped||0,plansDropped:ctx.gardenerPlansDropped||0}};}
 };
}
const profiles=[profile(false,false),profile(true,false),profile(false,true),profile(true,true)];
module.exports={profiles,RULES,PRIORITY,resolveGardenOffers,planExpansion,gardenTarget};
