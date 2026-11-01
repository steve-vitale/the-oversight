'use strict';
// Auxiliary passive evidence. Never ask a permission, knowledge, needs or build
// helper while observing: several of those hydrate saved state or draw RNG.
const CORE=['green_thumb','green_whisper'];
const GARDEN=[...CORE,'cornucopia','rain_dancer','photosynthesis'];
const held=(rows,practice)=>Array.isArray(rows)?rows.map(a=>typeof a==='string'?{id:a,level:practice?.[a]?.level??1}:{id:a.id,level:a.level??1,...(a.evolvedFrom?{evolvedFrom:a.evolvedFrom}:{})}):null;
function eligibility(G,id){
 const s=G.state.scholar,v=G.state.village;
 if(id===s.villagerId)return 'currentBearer';
 if(!(v.roster||[]).includes(id))return 'notResident';
 const p=(G.data.villagers||[]).find(p=>p?.id===id)||
  (v.rosterChars?.[id]?.id===id?v.rosterChars[id]:null)||
  (G.data.background_survivors||[]).find(p=>p?.id===id);
 return !p?'unknownPerson':p.dead?'deadPerson':null;
}
function snapshot(G){
 const s=G.state.scholar,v=G.state.village,plots=G.map?.tiles?.[4]?.[4]?.plots||[],tier=v.havenTier||0;
 const capacity=G.data.gardening?.capacityByTier?.[Math.max(0,Math.min(3,tier))]??null;
 const npcs=[],excluded={currentBearer:[],deadPerson:[],unknownPerson:[]};
 for(const id of new Set(v.roster||[])){
  const reason=eligibility(G,id);if(reason){(excluded[reason]||(excluded[reason]=[])).push(id);continue;}
  npcs.push({id,held:held(v.npcAbilities?.[id],v.npcAbilityPractice?.[id]),hunger:Number.isFinite(v.needs?.[id]?.hunger)?v.needs[id].hunger:null,
   class:v.npcGodpath?.[id]?{path:v.npcGodpath[id].path,subclass:v.npcGodpath[id].subclass,lapsed:!!v.npcGodpath[id].lapsed}:null});
 }
 const stages=plots.map((p,index)=>{
  let phase=!p.pid?'empty':p.dead?'dead':'unknown';
  if(p.pid&&!p.dead&&p.cultivation?.version===1){
   const days=p.lastHarvest?p.cultivation.regrowDays:p.cultivation.maturityDays;
   if(Number.isFinite(days))phase=days-(s.day-(p.lastHarvest||p.plantedDay||0))-(p.magicGrowth||0)<=0?'ripe':'growing';
  }
  return{index,pid:p.pid||null,phase,magicDay:p.magicDay??null,magicOwner:p.magicOwner??null};
 });
 const sum=rows=>(rows||[]).reduce((n,i)=>n+(Number.isFinite(i.units)&&Number.isFinite(i.kcalEach)?Math.max(0,i.units)*Math.max(0,i.kcalEach):0),0);
 return{day:s.day,bearer:s.villagerId,tier,capacity,plots:stages,unusedCapacity:capacity===null?null:Math.max(0,capacity-plots.length),
  atHaven:G.map?.px===4&&G.map?.py===4,inside:!!s.insideHaven,dayTicks:s.dayTicks??null,reserveKcal:s.kcal??null,
  held:held(s.abilities),class:s.godpath?{path:s.godpath.path,subclass:s.godpath.subclass,lapsed:!!s.godpath.lapsed}:null,
  pantryNominalKcal:sum(v.pantry),packNominalKcal:sum(s.inventory),
  gardenKeeper:v.gardenKeeper??null,npcs,excluded,duplicateRosterEntries:(v.roster||[]).length-new Set(v.roster||[]).size};
}
function install(G){
 const report={version:1,scope:'Observed pending sheets, actual choices and gate queries; sampled holder-days and unused capacity are coverage, not available/useful actions. Initial holdings and unlinked grants have unknown acquisition history.',
  gardenIds:GARDEN,coreIds:CORE,observedMethods:[],missingMethods:[],offers:[],playerChoices:[],npcOffers:[],npcGrants:[],actorDays:[],gates:[],builds:[],casts:[],errors:[]};
 const originals=new Map(),sheets=new WeakMap(),days=new Map(),gateRows=new Map();let npcScope=null;
 const error=(at,e)=>report.errors.push({at,message:e.message});
 const safe=(at,fn)=>{try{return fn();}catch(e){error(at,e);return null;}};
 const at=()=>({day:G.state.scholar.day,bearer:G.state.scholar.villagerId});
 const own=id=>id===G.state.scholar.villagerId?held(G.state.scholar.abilities):held(G.state.village.npcAbilities?.[id],G.state.village.npcAbilityPractice?.[id]);
 function observeOffer(){
  const ch=G.state.scholar.abilityChoices;if(!Array.isArray(ch)||!ch.length)return null;
  const choices=ch.map(c=>({id:c.id,src:c.src??null,level:c.level??null})),signature=JSON.stringify(choices),old=sheets.get(ch);
  if(old?.signature===signature&&old.bearer===G.state.scholar.villagerId)return old.seq;
  const seq=report.offers.length,rec={seq,...at(),choices,held:own(G.state.scholar.villagerId)};
  report.offers.push(rec);sheets.set(ch,{seq,signature,bearer:rec.bearer});return seq;
 }
 function wrap(name,before,after){
  const original=G[name];if(typeof original!=='function'){report.missingMethods.push(name);return;}
  report.observedMethods.push(name);originals.set(name,original);
  G[name]=function(...args){const old=safe(name+' before',()=>before?.(args));const result=original.apply(this,args);safe(name+' after',()=>after?.(old,args,result));return result;};
 }
 const count=(rows,id)=>(rows||[]).filter(a=>a.id===id).length;
 const level=(rows,id)=>Math.max(0,...(rows||[]).filter(a=>a.id===id).map(a=>a.level));
 wrap('chooseAbility',args=>({seq:observeOffer(),...at(),held:own(G.state.scholar.villagerId),id:args[0],replace:args[1]??null}),old=>{
  const after=own(old.bearer),sheet=old.seq===null?null:report.offers[old.seq];
  report.playerChoices.push({...old,onSheet:!!sheet?.choices.some(c=>c.id===old.id),after,
   acquired:old.held===null||after===null?null:count(after,old.id)>count(old.held,old.id),upgraded:old.held===null||after===null?null:level(after,old.id)>level(old.held,old.id)&&count(old.held,old.id)>0});observeOffer();
 });
 wrap('keepAbilities',()=>({seq:observeOffer(),...at(),held:own(G.state.scholar.villagerId)}),old=>{report.playerChoices.push({...old,id:null,kept:true,after:own(old.bearer)});observeOffer();});
 // Link NPC grants to an actual sheet only inside the live resolution call.
 const resolve=G.villagerResolveLevelUps;
 if(typeof resolve==='function'){
  report.observedMethods.push('villagerResolveLevelUps');originals.set('villagerResolveLevelUps',resolve);
  G.villagerResolveLevelUps=function(id,...args){const parent=npcScope;npcScope={id,sheet:null};try{return resolve.call(this,id,...args);}finally{npcScope=parent;}};
 }else report.missingMethods.push('villagerResolveLevelUps');
 wrap('villagerLevelUpOffers',()=>null,(_,args,result)=>{
  const rec={seq:report.npcOffers.length,...at(),actor:args[0],eligibility:eligibility(G,args[0]),track:args[1],level:args[2],ids:Array.isArray(result)?result.map(x=>typeof x==='string'?x:x.id):null};
  report.npcOffers.push(rec);if(npcScope?.id===rec.actor)npcScope.sheet=rec.seq;
 });
 wrap('npcGrantAbility',args=>({id:args[1],actor:args[0],eligibility:eligibility(G,args[0]),...at(),held:own(args[0]),sheet:npcScope?.id===args[0]?npcScope.sheet:null}),old=>{
  const after=own(old.actor),sheet=old.sheet===null?null:report.npcOffers[old.sheet];
  report.npcGrants.push({...old,after,onSheet:!!sheet?.ids?.includes(old.id),acquired:old.held===null||after===null?null:count(after,old.id)>count(old.held,old.id),upgraded:old.held===null||after===null?null:level(after,old.id)>level(old.held,old.id)&&count(old.held,old.id)>0});
 });
 for(const name of ['pumpLevelUps','maybeOfferPurify','tickAction','advancePart','endDay','sleep'])wrap(name,()=>{if(name==='tickAction')settleCast(castContext,'before-time');return observeOffer();},()=>observeOffer());
 for(const name of ['gardenMakeGate','gardenMagicGate'])wrap(name,args=>({actor:name==='gardenMakeGate'?G.state.scholar.villagerId:args[0]??G.state.scholar.villagerId,...at(),tier:G.state.village.havenTier||0,plots:(G.map?.tiles?.[4]?.[4]?.plots||[]).length}), (old,_,result)=>{
  const row={...old,gate:name,eligibility:old.actor===old.bearer?'player':eligibility(G,old.actor),ok:result?.ok===true,known:typeof result?.ok==='boolean',why:result?.reason||result?.why||result?.short||null};
  const key=JSON.stringify(row);let i=gateRows.get(key);if(i===undefined){i=report.gates.length;gateRows.set(key,i);report.gates.push({...row,calls:0});}report.gates[i].calls++;
 });
 wrap('makePlot',()=>({...at(),state:G.state,count:(G.map?.tiles?.[4]?.[4]?.plots||[]).length,reserve:G.state.scholar.kcal}),old=>{
  report.builds.push({day:old.day,bearer:old.bearer,before:old.count,after:(G.map?.tiles?.[4]?.[4]?.plots||[]).length,sameBearer:G.state===old.state&&G.state.scholar.villagerId===old.bearer});
 });
 const cultivate=G.cultivateGarden;let castContext=null;
 function settleCast(context,boundary){
  if(!context||context.settled||!context.old)return;
  const old=context.old,p=G.map?.tiles?.[4]?.[4]?.plots||[],changed=p.filter((x,i)=>(x.magicGrowth||0)>(old.plots[i]?.magicGrowth||0)).length;
  if(changed&&!context.nestedChanged){context.record={day:old.day,actor:old.actor,bearer:old.bearer,eligibility:old.eligibility,held:old.held,plotsChanged:changed,returnedTrue:null,boundary};report.casts.push(context.record);}
  if(changed&&context.parent?.actor===context.actor)context.parent.nestedChanged=true;
  context.settled=true;
 }
 if(typeof cultivate==='function'){
  report.observedMethods.push('cultivateGarden');originals.set('cultivateGarden',cultivate);
  G.cultivateGarden=function(...args){
   const parent=castContext,actor=args[0]??G.state.scholar.villagerId;
   const old=safe('cast before',()=>({actor,...at(),held:own(actor),eligibility:actor===G.state.scholar.villagerId?'player':eligibility(G,actor),plots:(G.map?.tiles?.[4]?.[4]?.plots||[]).map(p=>({magicGrowth:p.magicGrowth||0}))}));
   castContext={actor,old,parent,nestedChanged:false,settled:false};const context=castContext;let result;
   try{result=cultivate.apply(this,args);return result;}finally{
    safe('cast after',()=>{settleCast(context,'return');if(context.record)context.record.returnedTrue=result===true;});castContext=parent;
   }
  };
 }else report.missingMethods.push('cultivateGarden');
 function sample(){safe('sample',()=>{observeOffer();const row=snapshot(G),key=row.day+':'+row.bearer;let i=days.get(key);if(i===undefined){i=report.actorDays.length;days.set(key,i);report.actorDays.push(row);}else report.actorDays[i]=row;});}
 sample();return{report,sample,restore(){for(const [name,fn]of originals)G[name]=fn;}};
}
module.exports={install,snapshot,eligibility,CORE,GARDEN};
