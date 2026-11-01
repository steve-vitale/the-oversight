// @ontology
// system: favor-forage
// description: Joint pantry outings using actual field gathers, food provenance and canonical donations.
// provides:
//   - forageFavorCompanions(), forageFavorWaiting(vid)
//   - forageFavorTarget(), forageFavorOpening(vid)
//   - forageFavorAction(vid, favor, ending), forageFavorCommitGate(vid, favor)
//   - performForageFavor(vid, favor, ending)
//   - forageFavorTalkReady(vid, favor), performForageTalk(vid, favor)
//   - forageFavorHarvestShares(units), forageFavorDeposit(item, kcal)
//   - forageFavorReceipt(vid, favor, opts), migrateForageFavors()
// consumes:
//   - state.village, state.scholar, data.favorRules
//   - doAction(), donateToPantry(), blendForageShares(), checkPromises()
// rules:
//   - physical_origin: only actual joint field harvests create outing shares (code: forageFavorHarvestShares, game.js live sweep)
//   - actual_delivery: only canonical pantry transfers can produce a completion receipt (code: forageFavorDeposit, game.js donateToPantry)
//   - neutral_readiness: no lazy detail/species generation or RNG draws in readiness (code: forageFavorTarget, forageFavorAction)
//   - actual_bearer: a successor cannot inherit a prior bearer's outing (code: forageFavorCompanions, forageFavorAction)
//   - shared_cargo: one actual harvest is split into the bearer's pack and the partner's canonical items; saved haul arrays are views, never a second stock (code: performForageFavor)
(function(){
 'use strict';
 const G=globalThis.Scattering.Game,green=new Set(['plant','bush','tree','bigtree']);
 const active=f=>f?.kind==='forage_help'&&f.forageRun&&!f.forageRun.returned;
 const home=g=>({x:g.state.village.px??4,y:g.state.village.py??4});
 const atHome=g=>{const h=home(g);return g.map.px===h.x&&g.map.py===h.y;};
 const required=(g,f)=>f?.forageRequiredKcal??g.data.favorRules?.forage?.minimumDeliveryKcal;
 const validAmount=n=>Number.isSafeInteger(n)&&n>0;
 const block=reason=>({ready:false,reason});
 let receipt=null,donation=null,deliveryBatch=null;
 const ready=(g,item)=>Number.isFinite(item.kcalEach)&&item.kcalEach>0&&Number.isSafeInteger(item.units)&&item.units>0&&item.edible!==false&&!g.isUnprocessed(item)&&!g.isSpoiled(item);
 const kcal=items=>items.reduce((n,item)=>n+item.units*item.kcalEach,0);
 function partnerItems(g,f){return(g.getPerson(f.vid)?.items||[]).filter(item=>item&&item.units>0&&((g.blendForageShares([{item,weight:1}])[f.id]||0)>0||item.legacyForageFavor===f.id));}
 function partnerFood(g,f){return partnerItems(g,f).filter(item=>ready(g,item));}
 function syncHauls(g,f){
  const r=f.forageRun;
  r.partnerHaul=partnerItems(g,f).map(item=>({...item}));
  r.playerHaul=(g.state.scholar.inventory||[]).filter(item=>(g.blendForageShares([{item,weight:1}])[f.id]||0)>0).map(item=>({...item}));
 }
 function sameLegacyFood(a,b){return a.name===b.name&&a.plantId===b.plantId&&a.kcalEach===b.kcalEach&&a.spoilDay===b.spoilDay&&a.foodState===b.foodState&&a.edible===b.edible;}
 function legacyPlan(g,f){
  const r=f.forageRun;if(!r.legacyPlayerBudget)return[];
  const available=new Map(g.state.scholar.inventory.map((item,index)=>[index,item.units||0])),out=[];
  for(let budget=0;budget<r.legacyPlayerBudget.length;budget++){
   const saved=r.legacyPlayerBudget[budget];let remaining=saved.units||0;
   for(let index=0;index<g.state.scholar.inventory.length&&remaining>0;index++){
    const item=g.state.scholar.inventory[index];if(!ready(g,item)||!sameLegacyFood(item,saved))continue;
    const units=Math.min(remaining,available.get(index));if(units>0){out.push({index,item,budget,units,kcal:units*item.kcalEach});remaining-=units;available.set(index,available.get(index)-units);}
   }
  }return out;
 }
 function completeDelivery(g,vid,f){
  const r=f.forageRun;
  if(r.returned||deliveryBatch?.favor===f||partnerFood(g,f).length||!Number.isFinite(r.deliveredKcal)||r.deliveredKcal+1e-8<required(g,f))return false;
  r.returned=true;r.returnedDay=g.state.scholar.day;
  const prior=receipt;receipt={game:g,state:g.state,favor:f,bearer:g.villagerId};
  try{g.checkPromises('food',vid,{forageFavorId:f.id});}finally{receipt=prior;}
  return true;
 }
 function pantrySource(g,id){return(g.state.village.pantry||[]).reduce((n,item)=>n+(item.units||0)*(item.kcalEach||0)*(g.blendForageShares([{item,weight:1}])[id]||0),0);}
 function packSource(g,id){return(g.state.scholar.inventory||[]).reduce((n,item)=>n+(item.units||0)*(item.kcalEach||0)*(g.blendForageShares([{item,weight:1}])[id]||0),0);}
 function splitHarvest(g,vid,f,before){
  const person=g.getPerson(vid),r=f.forageRun;
  const fresh=g.state.scholar.inventory.filter(item=>!before.has(item)&&ready(g,item)&&(g.blendForageShares([{item,weight:1}])[f.id]||0)>0);
  const target=Math.floor(kcal(fresh)/2);let moved=0;person.items=person.items||[];
  for(const item of fresh){
   const units=Math.min(item.units,Math.max(0,Math.ceil((target-moved)/item.kcalEach)));
   if(!units)continue;
   person.items.push({...item,units});item.units-=units;moved+=units*item.kcalEach;
  }
  g.state.scholar.inventory=g.state.scholar.inventory.filter(item=>item.units!==0);
  r.forageCount=(r.forageCount||0)+1;r.talked=true;syncHauls(g,f);return moved;
 }
 function depositHeld(g,vid,f,item,owner){
  const r=f.forageRun,total=item.units*item.kcalEach,share=g.blendForageShares([{item,weight:1}])[f.id]||0,source=pantrySource(g,f.id),before=g.pantryKcalLive(g.state.village);
  const given=g.depositPantryPieces(g.state.village,{...item},500);
  if(given!==total||g.pantryKcalLive(g.state.village)-before!==given)throw Error('Forage handoff did not settle the actual carried food');
  item.units=0;
  const i=owner.indexOf(item);if(i>=0)owner.splice(i,1);
  const legacy=item.legacyForageFavor===f.id;
  if(legacy)r.legacyFoodDelivered=(r.legacyFoodDelivered||0)+given;
  const credit=legacy?given:Math.min(given*share,Math.max(0,pantrySource(g,f.id)-source));
  creditDelivery(g,vid,f,credit,legacy?'legacy-carried-delivery':'partner-delivery');
  return given;
 }
 function depositLegacyPlayer(g,vid,f){
  const r=f.forageRun;let total=0;
  for(const pick of legacyPlan(g,f)){
   const item=pick.item,before=g.pantryKcalLive(g.state.village),given=g.depositPantryPieces(g.state.village,{...item,units:pick.units},500);
   if(given!==pick.kcal||g.pantryKcalLive(g.state.village)-before!==given)throw Error('Legacy forage handoff did not settle the actual carried food');
   item.units-=pick.units;r.legacyPlayerBudget[pick.budget].units-=pick.units;
   if(item.units===0)g.state.scholar.inventory.splice(g.state.scholar.inventory.indexOf(item),1);
   r.legacyFoodDelivered=(r.legacyFoodDelivered||0)+given;creditDelivery(g,vid,f,given,'legacy-player-delivery');total+=given;
  }return total;
 }
 function trailLine(g,vid,f){
  const r=f.forageRun,who=g.firstRef?g.firstRef(vid):g.displayName(vid),temper=g.npcTemper?g.npcTemper(vid):'steady';
  const partner=kcal(partnerFood(g,f)),total=Math.floor(haul(g,f)+legacyPlan(g,f).reduce((n,p)=>n+p.kcal,0)+partner);
  const pools={
   bold:[`${who} grins. "Good ground — keep your eyes up, the good stuff hides."`,`"${total>0?'We are carrying '+total+' kcal between us already. ':''}Not bad for two pairs of hands."`],
   warm:['"This is the part I like. Just us and the green."',`"${partner>0?'I have got '+partner+' kcal in my pack so far. ':''}Tell me what you see that I missed."`],
   cautious:['"Slow. The patch gives more when you do not rush it."','"Keep together out here. The green is generous; the rest of the wild is not."']
  };
  const pool=pools[temper]||['"Two pairs of eyes, twice the ground. That was the deal, and it is working."',`"${total>0?'Between us we are carrying '+total+' kcal. ':''}Onward — there is more green ahead."`];
  return pool[(r.talkCount||0)%pool.length];
 }
 function creditDelivery(g,vid,f,kcal,route){
  const r=f.forageRun,p=g.state.village.promises?.[vid];
  if(!Number.isFinite(kcal)||kcal<=0||(!r.gatheredUnits&&!r.legacyFoodDelivered)||p?.favorId!==f.id)return false;
  r.deliveredKcal=(r.deliveredKcal||0)+kcal;
  completeDelivery(g,vid,f);
  g.tele('favor_forage_return',{favorId:f.id,partner:vid,kcal,totalKcal:r.deliveredKcal,kept:p.kept===true,closed:!!r.returned,route});g.journalFavorPromise?.(vid,p);return true;
 }
 function person(g,vid,near){
  const v=g.state.village,s=g.state.scholar,p=g.getPerson(vid),h=home(g),node=v.nodePos?.[vid]||{nx:h.x,ny:h.y},pos=v.positions?.[vid];
  if(vid===g.villagerId||!(v.roster||[]).includes(vid)||!p||p.dead)return 'Your partner is no longer available for this outing.';
  if(v.away?.[vid]||node.nx!==g.map.px||node.ny!==g.map.py)return 'Meet your partner on their actual map tile.';
  if(near&&atHome(g)&&(v.npcInside?.[vid]!==false)!==(s.insideHaven!==false))return v.npcInside?.[vid]!==false?'Your partner is inside the Haven hall. Go inside to meet them.':'Your partner is on the Haven grounds. Step outside to meet them.';
  if(near&&(!pos||![pos.mx,pos.my,s.mx,s.my].every(Number.isFinite)||Math.max(Math.abs(pos.mx-s.mx),Math.abs(pos.my-s.my))>1))return 'Move beside your partner to work together.';
  return null;
 }
 function site(g,target){if(!target)return'not yet recorded; find a known food patch';const h=home(g),dx=target.x-h.x,dy=target.y-h.y;return[dy?Math.abs(dy)+' '+(dy<0?'north':'south'):'',dx?Math.abs(dx)+' '+(dx<0?'west':'east'):''].filter(Boolean).join(', ')+' of Haven';}
 function scorched(g,x,y,cx,cy){return (g.state.scorch?.[x+','+y]?.[cx+','+cy]??-1)>g.state.scholar.day;}
 function ediblePatch(g,t,x,y,local){
  if(!t?.detail||t.type==='haven'||t.type==='ruin'||!(t.stock>0))return false;
  const s=g.state.scholar;
  for(let cy=0;cy<9;cy++)for(let cx=0;cx<9;cx++){
   if(local&&Math.max(Math.abs(cx-s.mx),Math.abs(cy-s.my))>1)continue;
   const c=t.detail[cy]?.[cx],key=cx+','+cy;
   if(!green.has(c)||t.detailRegrow?.[key]||scorched(g,x,y,cx,cy))continue;
   // Never call cellPlantSpecies here: missing entries initialize species/RNG.
   const pid=c==='bush'?t.bushSpecies?.[key]:c==='plant'?t.plantSpecies?.[key]:g.regionTreeNut(t.modifiers?.[key]?.species);
   const p=pid&&(g.data.plants||[]).find(p=>p.id===pid);
   if(p&&p.caloriesPerUnit>0&&p.edibility!=='avoid'&&g.plantKnown(pid))return true;
  }
  return false;
 }
 function haul(g,f){
  return(g.state.scholar.inventory||[]).reduce((n,item)=>n+(Number.isFinite(item.kcalEach)&&item.kcalEach>0&&item.edible!==false&&!g.isSpoiled(item)?(item.units||0)*item.kcalEach*(g.blendForageShares([{item,weight:1}])[f.id]||0):0),0);
 }
 function plan(g,f,all=false){
  const out=[];let remaining=all?Infinity:Math.max(0,required(g,f)-(f.forageRun?.deliveredKcal||0));
  for(let i=g.state.scholar.inventory.length-1;i>=0&&remaining>1e-8;i--){
   const item=g.state.scholar.inventory[i],share=g.blendForageShares([{item,weight:1}])[f.id]||0;
   if(!share)continue;
   const choice=g.pantryDonationOptions(i);if(!choice.ok)continue;
   const units=Math.min(choice.units,choice.maxUnits,Math.ceil(remaining/(item.kcalEach*share)-1e-10));if(units>0){out.push({index:i,units,kcal:units*item.kcalEach,jointKcal:units*item.kcalEach*share});remaining-=units*item.kcalEach*share;}
  }return out;
 }
 Object.assign(G,{
  forageFavorCompanions(){
   const v=this.state.village;
   return Object.values(v.favorLedger||{}).filter(f=>active(f)&&f.forageRun.bearer===this.villagerId&&f.vid!==this.villagerId&&(v.roster||[]).includes(f.vid)&&this.getPerson(f.vid)&&!this.getPerson(f.vid).dead&&!v.away?.[f.vid]).map(f=>f.vid);
  },
  forageFavorWaiting(vid){
   const v=this.state.village,f=v.favorLedger?.[vid],p=v.promises?.[vid],s=this.state.scholar,h=home(this),node=v.nodePos?.[vid]||{nx:h.x,ny:h.y};
   return !!(f?.kind==='forage_help'&&!f.forageRun&&p?.favorId===f.id&&!p.kept&&p.maker===this.villagerId&&this.dayPart===0&&s.day>=(f.meetDay??f.promisedDay+1)&&s.day<=this.promiseDueDay(p)&&node.nx===h.x&&node.ny===h.y&&!v.away?.[vid]);
  },
  forageFavorTarget(){
   const h=home(this),found=[];
   for(let y=0;y<this.map.tiles.length;y++)for(let x=0;x<this.map.tiles[y].length;x++)if(this.mapSeen(x,y)==='visited'&&ediblePatch(this,this.map.tiles[y][x],x,y,false))found.push({x,y});
   return found.sort((a,b)=>(Math.abs(a.x-h.x)+Math.abs(a.y-h.y))-(Math.abs(b.x-h.x)+Math.abs(b.y-h.y))||a.y-b.y||a.x-b.x)[0]||null;
  },
  forageFavorCommitGate(vid,f){
   if(!validAmount(required(this,f)))return{ok:false,reason:'We cannot plan this outing yet.'};
   if((this.state.scholar.day||0)+1>f.deadline)return{ok:false,reason:'There is no dawn left before this request expires. This promise cannot be accepted now.'};
   return{ok:true};
  },
  forageFavorOpening(vid){
   if(!this.forageFavorCompanions().includes(vid)||this.state.activeContest||this.tableActive?.())return null;
   const f=this.convoGetFavor(vid),r=f.forageRun,full=r.deliveredKcal+haul(this,f)+kcal(partnerFood(this,f))>=required(this,f);
   return{line:f.state==='broken'?'"We missed the promise. Let’s get home with what we have."':atHome(this)?'"Let’s put what we gathered in the pantry."':full?'"We have enough food. Let’s get it home."':'"Keep together. We still need food for the pantry."',thread:'want',wantId:'repay',structural:true};
  },
  forageFavorAction(vid,f,ending){
   const s=this.state.scholar,v=this.state.village,r=f?.forageRun,amount=required(this,f);
   if(f?.kind!=='forage_help'||f.vid!==vid)return block('There is no current foraging request.');
   if(r?.returned||(!active(f)&&!['asked','promised'].includes(f.state)))return block('This outing is closed.');
   if(this.over||s.dead)return block('This life has ended.');
   if(this.inCombat()||this.state.activeContest||this.tableActive?.())return block('Finish the current fight or event before the outing.');
   if(r&&r.bearer!==this.villagerId)return block('This outing belonged to the previous bearer. It is not your promise.');
   if(ending?.keepCargo&&r)return{ready:true,action:'forage_end',label:'End the outing and keep our carried shares',reason:'Each of you keeps the food you carry. An unfinished promise will be broken.'};
   if(ending&&r&&!atHome(this))return block('Return to Haven together before unloading both shares. You can instead end the outing and each keep your carried food.');
   const why=person(this,vid,true);if(why)return block(why);
   if(!validAmount(amount))return block('We cannot plan this outing yet.');
   const p=v.promises?.[vid];
   if(!r){
    if(!p||p.favorId!==f.id||p.kept){const gate=this.forageFavorCommitGate(vid,f);return{...block(gate.ok?'Accept the request first. Meet at Haven at dawn tomorrow; bring '+amount+' kcal of newly gathered food home.':gate.reason),canPromise:gate.ok};}
    if(p.maker!==this.villagerId)return block('This promise belonged to the previous bearer.');
    if(s.day>this.promiseDueDay(p))return block('The deadline passed. Starting now cannot keep the promise.');
    if(s.day<f.meetDay)return block('Meet at Haven at dawn on day '+f.meetDay+'.');
    if(!atHome(this)||this.dayPart!==0)return block('Meet at Haven at dawn before the deadline, on the same side of the door.');
    if(this.waterFavorCompanions().length||this.forageFavorCompanions().length||Object.values(v.favorLedger||{}).some(q=>q.kind==='stay_close'&&q.company?.active))return block('Finish your current joint activity before starting another.');
    const target=this.forageFavorTarget();if(!target)return block('Visit and recognize a real food patch first. No known, unpicked patch can be named yet.');
    return{ready:true,action:'forage_start',target,label:'Set out together to forage',reason:'The known food patch is '+site(this,target)+'. Gather normally, prepare food if needed, and return '+amount+' kcal of this outing’s food to the pantry.'};
   }
   const partnerKcal=kcal(partnerFood(this,f)),legacyKcal=legacyPlan(this,f).reduce((n,p)=>n+p.kcal,0);
   const progress=Math.floor(r.deliveredKcal||0)+'/'+amount+' kcal delivered; '+Math.floor(haul(this,f)+legacyKcal)+' kcal of ready food from this trip in your pack; '+partnerKcal+' kcal carried by your partner. ';
   if(atHome(this)){
    if(ending&&this.havenStoresAccess?.()==='none'&&haul(this,f)+partnerKcal+legacyKcal>0)return block(progress+'Go inside the Haven hall before unloading both shares.');
    const picks=plan(this,f,true),total=picks.reduce((n,p)=>n+p.kcal,0)+legacyKcal+partnerKcal,joint=Math.floor(picks.reduce((n,p)=>n+p.jointKcal,0)+legacyKcal+partnerKcal);
    if(ending)return{ready:true,action:'forage_unload_end',label:'Unload both shares and end the outing',reason:progress+'Unload the usable food you both still carry. The unfinished promise will be broken.'};
    if(total>0){
     if(this.havenStoresAccess?.()==='none')return block(progress+'The pantry is inside the Haven hall. Go inside together, then unload the actual food.');
     return{ready:true,action:'forage_deliver',label:'Unload both shares ('+total+' kcal food; '+joint+' outing)',reason:progress+'This gives '+total+' kcal of actual food; '+joint+' kcal count toward this outing. Mixed stacks retain their proportions. Both actual carried shares are selected.'};
    }
    if(haul(this,f)>0&&this.havenStoresAccess?.()==='none')return block(progress+'The pantry is inside the Haven hall. Go inside together, then unload the actual food.');
    return block(progress+'Gather together outside Haven, then prepare and bring usable food home. Unknown or unshelled food does not count as ready food. The first known patch is '+site(this,r.target)+'.');
   }
   if(r.deliveredKcal+haul(this,f)+partnerKcal+legacyKcal>=amount)return block(progress+'Walk home together and give the actual food to the pantry.');
   if(!ediblePatch(this,this.playerTile(),this.map.px,this.map.py,true))return block(progress+'Walk beside a known, unpicked food patch with your partner. The planned patch is '+site(this,r.target)+'.');
   return{ready:true,action:'forage_gather',label:'Forage together',reason:progress+'Search the patch around you together. This takes the usual foraging effort and time. Leave room in your pack for the food.'};
  },
  forageFavorHarvestShares(units){
   if(!Number.isFinite(units)||units<=0||this.over||this.state.scholar.dead||this.inCombat()||atHome(this)||this.playerTile()?.type==='ruin')return undefined;
   for(const vid of this.forageFavorCompanions()){
    if(person(this,vid,true))continue;
    const f=this.convoGetFavor(vid),r=f.forageRun;r.gatheredUnits=(r.gatheredUnits||0)+units;r.lastWorkSite={x:this.map.px,y:this.map.py};
    this.tele('favor_forage_gather',{favorId:f.id,partner:vid,units,x:this.map.px,y:this.map.py});return{[f.id]:1};
   }return undefined;
  },
  forageFavorDeposit(item,kcal){
   const frame=donation;
   if(!frame||frame.used||frame.game!==this||frame.state!==this.state||frame.bearer!==this.villagerId||item.forageShares!==frame.item?.forageShares)return false;
   const left=this.state.scholar.inventory.includes(frame.item)?(frame.item.units??1):0;
   if(frame.units-left<item.units||kcal!==item.units*item.kcalEach)return false;
   if(!atHome(this)||this.over||this.state.scholar.dead||!Number.isFinite(kcal)||kcal<=0)return false;
   frame.used=true;
   const shares=this.blendForageShares([{item,weight:1}]);let changed=false;
   for(const vid of this.forageFavorCompanions()){
    if(person(this,vid,false))continue;
    const f=this.convoGetFavor(vid),credit=Math.min(kcal*(shares[f.id]||0),Math.max(0,pantrySource(this,f.id)-(frame.before[f.id]||0)));
    if(creditDelivery(this,vid,f,credit,'donation'))changed=true;
   }if(changed)this.save();return changed;
  },
  forageFavorReceipt(vid,f,opts){return !!(receipt?.game===this&&receipt.state===this.state&&receipt.favor===f&&receipt.bearer===this.villagerId&&f.vid===vid&&opts?.forageFavorId===f.id&&f.forageRun?.returned);},
  forageFavorTalkReady(vid,f){
   f=f||this.convoGetFavor(vid);return !!(active(f)&&f.forageRun.bearer===this.villagerId&&!this.over&&!this.state.scholar.dead&&!this.inCombat()&&!this.state.activeContest&&!this.tableActive?.()&&!person(this,vid,true));
  },
  performForageTalk(vid,f){
   f=f||this.convoGetFavor(vid);if(!this.forageFavorTalkReady(vid,f))return{ok:false,line:'You are not out together right now, so there is no trail to talk on.'};
   const r=f.forageRun,line=trailLine(this,vid,f);r.talked=true;r.talkCount=(r.talkCount||0)+1;
   this.tele('favor_forage_talk',{favorId:f.id,partner:vid,talkCount:r.talkCount});this.save();return{ok:true,line};
  },
  performForageFavor(vid,f,ending){
   const status=this.forageFavorAction(vid,f,ending);if(!status.ready)return{ok:false,line:status.reason};
   if(status.action==='forage_start'){
    f.forageRun={bearer:this.villagerId,startedDay:this.state.scholar.day,target:status.target,gatheredUnits:0,deliveredKcal:0,returned:false,partnerInventory:true,playerHaul:[],partnerHaul:[],forageCount:0,talkCount:0,talked:false};this.setEngaged(vid,3);
    this.tele('favor_forage_depart',{favorId:f.id,partner:vid,target:status.target});this.save();return{ok:true,incomplete:true,line:'You set out together. '+status.reason};
   }
   const r=f.forageRun;
   if(status.action==='forage_end'){
    r.returned=true;r.cancelled=true;if(this.state.village.promises?.[vid]&&!this.state.village.promises[vid].kept)this.convoFavorRenounce(vid);
    this.tele('favor_forage_end',{favorId:f.id,partner:vid,deliveredKcal:r.deliveredKcal});this.journalFavorPromise?.(vid,this.state.village.promises?.[vid]);this.save();
    return{ok:true,close:true,promiseMissed:true,line:'You part ways. Each of you keeps the food you carry, but the unfinished promise is broken.'};
   }
   if(status.action==='forage_gather'){
    const before=r.gatheredUnits,pack=new Set(this.state.scholar.inventory);this.doAction('forage');
    if(this.over||this.villagerId!==r.bearer)return{ok:false,incomplete:true,line:'This life ended before the food came home.'};
    if(r.gatheredUnits>before&&!person(this,vid,true))splitHarvest(this,vid,f,pack);
    this.save();return{ok:r.gatheredUnits>before,incomplete:true,line:(r.gatheredUnits>before?'You pick through the patch together. ':'You find nothing to bring back. ')+Math.floor(haul(this,f))+' kcal from this trip in your pack; '+kcal(partnerFood(this,f))+' kcal carried by '+this.displayName(vid)+'. Bring both shares home; cook or shell anything that still needs it.'};
   }
   const state=this.state,bearer=this.villagerId,prior=deliveryBatch;deliveryBatch={game:this,state,favor:f};let playerGiven=0,partnerGiven=0;
   try{
    playerGiven+=depositLegacyPlayer(this,vid,f);
    for(const pick of plan(this,f,true).sort((a,b)=>b.index-a.index)){
     if(this.state!==state||this.villagerId!==bearer||this.over||this.state.scholar.dead)break;
     const item=this.state.scholar.inventory[pick.index],units=item.units;this.donateToPantry(pick.index,pick.units);
     playerGiven+=(units-(this.state.scholar.inventory.includes(item)?item.units:0))*item.kcalEach;
    }
    if(this.state!==state||this.villagerId!==bearer||this.over||this.state.scholar.dead)return{ok:false,incomplete:true,line:'This life ended before both shares could be unloaded.'};
    const partner=this.getPerson(vid);
    for(const item of partnerFood(this,f))partnerGiven+=depositHeld(this,vid,f,item,partner.items);
   }finally{deliveryBatch=prior;}
   r.deliveredPlayerKcal=(r.deliveredPlayerKcal||0)+playerGiven;r.deliveredPartnerKcal=(r.deliveredPartnerKcal||0)+partnerGiven;syncHauls(this,f);
   if(status.action==='forage_unload_end'){
    r.returned=true;r.cancelled=true;if(this.state.village.promises?.[vid]&&!this.state.village.promises[vid].kept)this.convoFavorRenounce(vid);
   }else completeDelivery(this,vid,f);
   this.journalFavorPromise?.(vid,this.state.village.promises?.[vid]);this.save();const given=playerGiven+partnerGiven;
   return{ok:given>0||status.action==='forage_unload_end',incomplete:!r.returned,close:!!r.returned,promiseMissed:this.state.village.promises?.[vid]?.kept!==true,line:'You unload '+playerGiven+' kcal from you and '+partnerGiven+' kcal from '+this.displayName(vid)+' — '+given+' kcal into the pantry. '+Math.floor(r.deliveredKcal)+'/'+required(this,f)+' kcal from this outing have reached the pantry.'+(r.returned&&this.state.village.promises?.[vid]?.kept!==true?' The food is welcome, but the promise was broken.':'')};
  },
  migrateForageFavors(){
   let changed=false;const v=this.state.village,day=this.state.scholar.day;
   for(const f of Object.values(v.favorLedger||{})){
    const r=f.kind==='forage_help'&&f.forageRun;if(!r||r.returned||r.partnerInventory)continue;
    const partner=this.getPerson(f.vid);if(!partner||partner.dead)continue;
    if(Array.isArray(r.partnerHaul)){
     // Public v1 carried the partner's actual food on the outing record.
     // Move it once into that person's canonical inventory. Old player
     // snapshots remain explicitly untraced budgets, never new-origin tags.
     r.legacyUntracedForage=true;r.legacyPlayerBudget=(r.playerHaul||[]).map(item=>({...item}));
     partner.items=partner.items||[];
     for(const item of r.partnerHaul)if(Number.isSafeInteger(item.units)&&item.units>0&&Number.isFinite(item.kcalEach)&&item.kcalEach>0)partner.items.push({...item,legacyForageFavor:f.id});
     f.forageRequiredKcal=f.forageRequiredKcal??1;
    }
    r.partnerInventory=true;r.deliveredKcal=r.deliveredKcal||0;syncHauls(this,f);changed=true;
   }
   for(const[vid,p]of Object.entries(v.promises||{})){const f=v.favorLedger?.[vid];if(p.kept||p.forageVersion||f?.kind!=='forage_help'||p.favorId!==f.id)continue;
    p.forageVersion=1;p.favorDeadline=Math.max(this.promiseDueDay(p)||0,day+2);f.deadline=p.favorDeadline;f.meetDay=day+1;f.forageRequiredKcal=required(this,f);this.journalFavorPromise?.(vid,p);changed=true;
   }return changed;
  },
 });
 const traveling=G.travelingWith;G.travelingWith=function(){return[...new Set([...traveling.apply(this,arguments),...this.forageFavorCompanions()])];};
 const engaged=G.isEngaged;G.isEngaged=function(vid){return this.forageFavorCompanions().includes(vid)||this.forageFavorWaiting(vid)||engaged.apply(this,arguments);};
 const place=G.placePartyAtPlayer;G.placePartyAtPlayer=function(){for(const vid of this.forageFavorCompanions())this.npcSetNode(vid,this.map.px,this.map.py);return place.apply(this,arguments);};
 const load=G.load;G.load=function(){const ok=load.apply(this,arguments);if(ok&&this.migrateForageFavors())this.save();return ok;};
 // Haven may pool the returning haul before the player opens a conversation.
 // Observe that actual transfer, after the ordinary companion travel finishes;
 // never require the same food to be donated twice. Both retained origin in
 // the pantry and a matching debit from this bearer's pack bound the receipt.
 const travel=G.travelTo;G.travelTo=function(){
  const state=this.state,bearer=this.villagerId,wasHome=atHome(this),before=this.forageFavorCompanions().map(vid=>{const f=this.convoGetFavor(vid);return{vid,f,pack:packSource(this,f.id),pantry:pantrySource(this,f.id)};});
  const result=travel.apply(this,arguments);
  if(!wasHome&&state===this.state&&bearer===this.villagerId&&!this.over&&!this.state.scholar.dead&&atHome(this))for(const row of before){
   if(this.convoGetFavor(row.vid)!==row.f||!this.forageFavorCompanions().includes(row.vid)||person(this,row.vid,false))continue;
   const kcal=Math.min(Math.max(0,row.pack-packSource(this,row.f.id)),Math.max(0,pantrySource(this,row.f.id)-row.pantry));
   creditDelivery(this,row.vid,row.f,kcal,'arrival');
  }return result;
 };
 const donate=G.donateToPantry;G.donateToPantry=function(idx){
  const prior=donation,item=this.state.scholar.inventory[idx],before={};
  if(item?.forageShares)for(const id of Object.keys(item.forageShares))before[id]=pantrySource(this,id);
  donation=item?.forageShares?{game:this,state:this.state,bearer:this.villagerId,item,units:item.units??1,before,used:false}:null;
  try{return donate.apply(this,arguments);}finally{donation=prior;}
 };
})();
