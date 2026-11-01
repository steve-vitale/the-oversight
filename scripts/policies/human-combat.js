'use strict';
// Controller decisions only. Movement, damage, escape and turn settlement stay
// in the public Game actions; never edit fighters to force progress.
const liveHuman=f=>!!f&&f.kind==='hostile'&&f.alive!==false&&f.hp>0&&!f.fled&&!f.yielded;
const liveMonster=f=>!!f&&f.kind==='monster'&&f.alive!==false&&f.hp>0&&!f.fled;
function token(G,f){return{round:f.round,index:f.turnIdx,bearer:G.villagerId};}
function sameTurn(G,f,p,t){return G.tbfight===f&&!f.over&&G.villagerId===t.bearer&&f.round===t.round&&f.turnIdx===t.index&&G.tbIsPlayerTurn()&&G.tbFighter('p')===p;}
function finishTurn(G,f,p,t){if(sameTurn(G,f,p,t))return G.tbPlayerWait();return false;}
function edgeGoal(G,p,dir,max){
 const on=(dir.dx<0&&p.mx===0)||(dir.dx>0&&p.mx===max)||(dir.dy<0&&p.my===0)||(dir.dy>0&&p.my===max);
 if(on)return{x:p.mx,y:p.my,path:[]};
 const tx=dir.dx<0?0:dir.dx>0?max:p.mx,ty=dir.dy<0?0:dir.dy>0?max:p.my;
 const direct=!G.tbBlocked(tx,ty)&&G.findPath(p.mx,p.my,tx,ty);
 if(direct?.length)return{x:tx,y:ty,path:direct};
 let best=null;
 for(let i=0;i<=max;i++){
  const x=dir.dx?(dir.dx<0?0:max):i,y=dir.dy?(dir.dy<0?0:max):i;
  if(G.tbBlocked(x,y))continue;const path=G.findPath(p.mx,p.my,x,y);
  if(path?.length&&(!best||path.length<best.path.length))best={x,y,path};
 }
 return best;
}
function bump(ctx,key){ctx[key]=(ctx[key]||0)+1;}
function note(ctx,e){const a=ctx.humanCombatErrors||(ctx.humanCombatErrors=[]);if(a.length<30)a.push(e.message);else bump(ctx,'humanCombatErrorsDropped');console.warn('[human-combat-policy] '+e.message);}
function combatTurn(G,ctx,isLive,prefix,options={}){
 const f=G.tbfight;if(!f||f.over||!G.tbIsPlayerTurn())return false;
 const humans=f.fighters.filter(h=>isLive(h)&&(!options.target||h===options.target));if(!humans.length)return false;
 const p=G.tbFighter('p');if(!p||!p.alive||p.fled)return false;
 const turn=token(G,f);bump(ctx,prefix+'Turns');
 try{
  if(p.acted){if(finishTurn(G,f,p,turn))bump(ctx,prefix+'Waits');return true;}
  const range=G.equippedWeapon()?.range||1,dist=(x,y,h)=>G.fighterDistTo(h,x,y);
  let target=humans.filter(h=>dist(p.mx,p.my,h)<=range).sort((a,b)=>a.hp-b.hp)[0],best=null;
  if(!target&&p.moveLeft>0){
   const max=G.tbGridMax(),min=options.interior?1:0,limit=options.interior?max-1:max;
   for(const h of humans)for(let y=min;y<=limit;y++)for(let x=min;x<=limit;x++){
    if(dist(x,y,h)>range||!G.tbCanOccupy(p,x,y))continue;
    const path=G.findPath(p.mx,p.my,x,y);if(!path?.length)continue;
    const cost=path.reduce((n,[px,py])=>n+G.tbTerrainCost(px,py),0);
    if(!best||cost<best.cost||(cost===best.cost&&h.hp<best.h.hp))best={h,path,cost};
   }
   if(best){
    let spent=0,last=null;for(const step of best.path){const cost=G.tbTerrainCost(step[0],step[1]);if(spent+cost>p.moveLeft)break;spent+=cost;last=step;}
    if(last){bump(ctx,prefix+'MoveAttempts');G.tbPlayerMove(last[0],last[1]);}
   }
   if(!sameTurn(G,f,p,turn))return true;
   target=humans.filter(h=>isLive(h)&&dist(p.mx,p.my,h)<=range).sort((a,b)=>a.hp-b.hp)[0];
  }
  if(target&&sameTurn(G,f,p,turn)&&!p.acted){bump(ctx,prefix+'StrikeAttempts');G.tbPlayerStrike(target.key);if(p.acted||!sameTurn(G,f,p,turn))bump(ctx,prefix+'StrikeActions');}
  else if(!target)bump(ctx,prefix+'BlockedTurns');
  if(finishTurn(G,f,p,turn))bump(ctx,prefix+'Waits');return true;
 }catch(e){note(ctx,e);return false;}
}
function humanTurn(G,ctx){return combatTurn(G,ctx,liveHuman,'humanCombat');}
function monsterTurn(G,ctx,options){
 if(ctx.publicCounterplay&&require('./counter-aware').play(G,ctx))return true;
 return combatTurn(G,ctx,liveMonster,'monsterCombat',options);
}
function diagnostics(ctx){return{errors:ctx.humanCombatErrors||[],counters:Object.fromEntries(Object.entries(ctx).filter(([k,v])=>/^(human|monster)Combat/.test(k)&&Number.isFinite(v)))};}
module.exports={liveHuman,liveMonster,token,sameTurn,finishTurn,edgeGoal,humanTurn,monsterTurn,diagnostics};
