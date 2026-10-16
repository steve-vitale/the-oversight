'use strict';
// An opt-in quartermaster preference. All food stays in the real inventory;
// access, transfers, travel and social costs use the ordinary public verbs.
const C=require('./competent');
const bump=(ctx,key,n=1)=>{ctx['campaignRation'+key]=(ctx['campaignRation'+key]||0)+n;};
const idle=G=>!G.over&&!G.tbfight&&!G.pendingEncounter&&!G.state.activeContest;
const food=G=>(G.state.scholar.inventory||[]).reduce((n,i)=>n+(!i.bonded&&(i.units||0)>0&&G.isFinishedFood(i)&&!G.isSpoiled(i)?i.units*i.kcalEach:0),0);
function allowance(G){const s=G.state.scholar,v=G.state.village,id=G.villagerId;return Math.min((v.gives?.[id]||0)-(v.takes?.[id]||0)-1,Math.max(0,G.fullLine()-(v.takeHist?.[id]||[]).filter(x=>x.day===s.day).reduce((n,x)=>n+(x.kcal||0),0)));}
function reserve(G,ctx,baseline){
 const p=ctx.campaignRationPlan;
 if(!p||p.person!==G.villagerId||(G.state.titans?.slain||{})[p.titan])return baseline;
 // Keeping an army's ration must not take the village's last meals.
 return G.pantryKcalLive()>=2*G.villageDailyNeed()?Math.max(baseline,p.target):baseline;
}
function provision(G,ctx,target){
 const s=G.state.scholar,v=G.state.village;
 ctx.campaignRationPlan={person:G.villagerId,titan:ctx.campaignTarget,target};
 if(!idle(G)||food(G)>=target)return;
 if(s.exiled){bump(ctx,'AccessBlocked');return;}
 if(allowance(G)<=0){bump(ctx,'BudgetBlocked');return;}
 if(G.havenStoresAccess()==='none'){
  if(G.playerTile()?.type!=='haven'&&ctx._campaignSupplyTripDay!==s.day&&(s.dayTicks||0)<=384){ctx._campaignSupplyTripDay=s.day;C.walkTo(G,v.px??4,v.py??4);bump(ctx,'SupplyTrips');}
  if(!idle(G))return;
  if(G.playerTile()?.type==='haven'&&!s.insideHaven){G.enterBuilding();bump(ctx,'HallEntries');}
  if(G.havenStoresAccess()==='none'){bump(ctx,'AccessBlocked');return;}
 }
 for(let n=0;n<80&&idle(G)&&food(G)<target;n++){
  // The player's own ledger is known. Never cross back through zero gift
  // credit, and do not take more than one ordinary fed line in a day.
  const available=allowance(G);
  const stock=G.pantryKcal(),villageReserve=2*G.villageDailyNeed();
  // Match the transfer's real weight check, including water, rather than
  // assuming a differently modified HUD weight guarantees a withdrawal.
  const carried=(s.inventory||[]).reduce((n,i)=>n+(i.kg||0)*(i.units||1),0)+G.waterWeight(),room=G.carryCapacity()-carried;
  const choices=(v.pantry||[]).map((item,index)=>({item,index})).filter(({item:i})=>!i.bonded&&(i.units||0)>0&&G.isFinishedFood(i)&&!G.isSpoiled(i)&&i.kcalEach<=available&&stock-i.kcalEach>=villageReserve&&(i.kg||0)<=room);
  choices.sort((a,b)=>b.item.kcalEach/Math.max(0.001,b.item.kg||0)-a.item.kcalEach/Math.max(0.001,a.item.kg||0));
  if(!choices.length){bump(ctx,'BudgetBlocked');break;}
  const before=food(G);G.takeFromPantry(choices[0].index);const gained=food(G)-before;
  if(gained<=0){bump(ctx,'TransferRefused');break;}
  ctx.campaignProvisionKcal=(ctx.campaignProvisionKcal||0)+gained;bump(ctx,'TakenKcal',gained);
 }
}
function prepare(G,ctx){const p=ctx.campaignRationPlan;if(p&&p.person===G.villagerId&&!(G.state.titans?.slain||{})[p.titan])provision(G,ctx,p.target);}
module.exports={food,reserve,provision,prepare};
