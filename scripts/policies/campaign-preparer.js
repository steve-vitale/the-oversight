'use strict';
// Separate campaign experiment: finish a bounded amount of the food actually
// carried/counter food, using the native stage/sort/shell/put-away sequence.
// No hidden lump species, free stock, technique, time or contribution grants.
const base=require('./campaigner')['campaigner-rations'];
const rations=require('./campaign-rations');
function available(G){const s=G.state.scholar;return !G.over&&!G.tbfight&&!G.pendingEncounter&&!G.state.activeContest&&s.kcal>=1800&&s.health>=50&&(s.dayTicks||0)<=384;}
function preparePack(G,ctx,options={}){
 if(!available(G))return;
 const s=G.state.scholar,person=G.villagerId,day=s.day;
 let budget=ctx._campaignPrep;
 if(!budget||budget.person!==person||budget.day!==day)budget=ctx._campaignPrep={person,day,sorted:false,shelled:false,staged:false,stored:false};
 const stillHere=()=>available(G)&&G.villagerId===person&&s.day===day;
 const inv=s.inventory||[];
 const shell=container=>{
  if(!stillHere()||budget.shelled)return;
  const ix=container.findIndex(it=>it.foodKind==='nut'&&it.foodState==='in_shell'&&(it.units||0)>0&&!it.bonded&&!G.isSpoiled(it));
  if(ix<0)return;
  const item=container[ix],before=(item.kcalEach||0)*(item.units||0);
  budget.shelled=true;G.shellNuts(ix,container);
  if(container.includes(item)&&item.foodState==='shelled'){
   ctx.campaignPrepShells=(ctx.campaignPrepShells||0)+1;
   ctx.campaignPrepKcal=(ctx.campaignPrepKcal||0)+Math.max(0,(item.kcalEach||0)*(item.units||0)-before);
  }
 };
 shell(inv); // Native Pack > Shell keeps this batch carried.
 if(!stillHere()||!G.atCamp()||G.havenStoresAccess()==='none')return;
 if(!budget.staged&&inv.some(it=>it.lump&&!it.bonded&&!G.isSpoiled(it))&&!inv.some(it=>it.bonded&&G.isUnprocessed(it))){
  budget.staged=true;G.stageForPrep();ctx.campaignPrepStages=(ctx.campaignPrepStages||0)+1;
 }
 if(!stillHere())return;
 const stash=s.prepStash||[];
 if(!budget.sorted){
  const ix=stash.findIndex(it=>it.lump&&(it.units||0)>0&&!G.isSpoiled(it)&&!it.bonded);
  if(ix>=0){
   // Choose by public general knowledge, never the opaque bag's species.
   const people=G.villagePeople().filter(p=>p.id!==person&&!p.dead);
   const sorter=people.map(p=>({id:p.id,n:G.villagerKnowsPlants(p.id).length})).sort((a,b)=>b.n-a.n)[0];
   budget.sorted=true;G.sortBag(sorter?.n?sorter.id:null,ix,stash);
   ctx.campaignPrepSorts=(ctx.campaignPrepSorts||0)+1;
  }
 }
 shell(stash);
 if(!stillHere()||budget.stored||G.havenStoresAccess()==='none')return;
 const finished=stash.filter(it=>G.isFinishedFood(it)&&!G.isSpoiled(it));
 // Native put-away is bulk: do not slip a dangerous neighboring batch in.
 if(finished.length&&!finished.some(it=>it.bonded||it.safe===false||it.undercooked||it.poisonRisk||it.parasiteRisk||it.diseaseRisk||/human/i.test(String(it.plantId||'')+' '+String(it.name||'')))){
  budget.stored=true;
  const retain=Number.isFinite(options.retainKcal)?Math.max(0,options.retainKcal):0;
  if(retain>0)for(const item of finished){
   if(!stillHere()||rations.food(G)>=retain)break;
   const ix=stash.indexOf(item);if(ix<0)continue;
   const before=rations.food(G);G.takePrepFood(ix); // Same whole-batch button as the native Pack sheet.
   const gained=Math.max(0,rations.food(G)-before);
   if(gained){ctx.campaignPrepPickups=(ctx.campaignPrepPickups||0)+1;ctx.campaignPrepPackedKcal=(ctx.campaignPrepPackedKcal||0)+gained;}
   else ctx.campaignPrepPackRefusals=(ctx.campaignPrepPackRefusals||0)+1;
  }
  if(retain>0&&!stillHere())return;
  if(retain===0||stash.some(it=>G.isFinishedFood(it)&&!G.isSpoiled(it))){
   const before=G.pantryKcal();G.putAwayFinished();
   ctx.campaignPrepStoredKcal=(ctx.campaignPrepStoredKcal||0)+Math.max(0,G.pantryKcal()-before);
  }
 }
}
const preparer={...base,id:'campaigner-preparer',desc:'campaigner-rations plus bounded native Pack/counter sorting, shelling and shelving per person/day'};
for(const hook of ['daily','upkeep'])preparer[hook]=(G,ctx)=>{preparePack(G,ctx);return base[hook]?.(G,ctx);};
module.exports={preparer,preparePack};
