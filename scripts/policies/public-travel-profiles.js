'use strict';
const P=require('./public-travel'),{capable}=require('./capable'),L=require('./livelihood'),C=require('./competent'),H=require('./human-combat');
const bases=[capable,L.maker,L.merchant,L.caregiver];
function retreatStandoff(G,ctx,f,p){
 if(f.noFlee||G.state.arenaContest||p.acted||p.moveLeft<=0)return false;
 const goals=new Map(),max=G.tbGridMax(),key=d=>d.dx+','+d.dy;
 const dir=C.chooseFleeDir(G,G.map.px,G.map.py,d=>{const goal=H.edgeGoal(G,p,d,max);if(goal)goals.set(key(d),goal);return !!goal;});
 if(!dir)return false;
 const turn=H.token(G,f),goal=goals.get(key(dir));
 let spent=0,last=null;for(const step of goal.path){const cost=G.tbTerrainCost(...step);if(spent+cost>p.moveLeft)break;spent+=cost;last=step;}
 if(last)G.tbPlayerMove(...last);
 const on=(dir.dx<0&&p.mx===0)||(dir.dx>0&&p.mx===max)||(dir.dy<0&&p.my===0)||(dir.dy>0&&p.my===max);
 if(H.sameTurn(G,f,p,turn)&&on)G.tbBarrierExit(dir.dx,dir.dy);
 H.finishTurn(G,f,p,turn);ctx.gridStandoffRetreatTurns=(ctx.gridStandoffRetreatTurns||0)+1;return true;
}
const profiles=bases.map(base=>{
 const policy={...base,id:'grid-'+base.id,desc:base.desc+'; experimental native grid approaches and cardinal exits'};
 for(const method of ['setup','upkeep','daily','fight','contest','pending'])if(typeof base[method]==='function')policy[method]=function(G,ctx,...args){return P.within(G,ctx,()=>base[method](G,ctx,...args));};
 policy.fight=function(G,ctx){try{return P.within(G,ctx,()=>{
  const f=G.tbfight,p=f&&G.tbFighter('p'),humanOnly=!!f&&f.fighters.some(H.liveHuman)&&!f.fighters.some(x=>x.kind==='monster'&&x.alive!==false&&!x.fled&&x.hp>0);
  if(ctx._gridStandoff?.fight!==f)ctx._gridStandoff={fight:f,blockedTurns:0};
  if(humanOnly&&p&&G.tbIsPlayerTurn()&&ctx._gridStandoff.blockedTurns>=2&&retreatStandoff(G,ctx,f,p))return true;
  const blocked=ctx.humanCombatBlockedTurns||0,moves=ctx.humanCombatMoveAttempts||0,strikes=ctx.humanCombatStrikeAttempts||0,budget=p?.moveLeft||0;
  const result=base.fight(G,ctx);
  if(humanOnly&&budget>0&&G.tbfight===f&&(ctx.humanCombatBlockedTurns||0)>blocked&&(ctx.humanCombatMoveAttempts||0)===moves&&(ctx.humanCombatStrikeAttempts||0)===strikes)ctx._gridStandoff.blockedTurns++;
  else ctx._gridStandoff.blockedTurns=0;
  return result;
 });}catch(error){(ctx.gridStandoffErrors||(ctx.gridStandoffErrors=[])).push(error.message);console.warn('[public-grid-fight] '+error.message);throw error;}};
 policy.diagnostics=ctx=>{
  const d=base.diagnostics?.(ctx)||{version:1,errors:[],counters:{}},travel=P.diagnostics(ctx);
  return{...d,profile:policy.id,mode:'experimental-public-grid-travel',errors:[...(d.errors||[]),...(ctx.publicTravelErrors||[]),...(ctx.gridStandoffErrors||[])],
   counters:{...d.counters,gridStandoffRetreatTurns:ctx.gridStandoffRetreatTurns||0,...Object.fromEntries(Object.entries(travel.counters).map(([key,value])=>['publicTravel_'+key,value]))},publicTravel:travel};
 };
 return policy;
});
module.exports={profiles};
