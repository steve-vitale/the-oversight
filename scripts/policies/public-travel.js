'use strict';
// Explicit policy-side movement experiment. Never replaces a Game method.
// Calls the same committed walk, door and orthogonal exit verbs as the phone.
const scopes=new WeakMap(),RULES=Object.freeze({version:1,maxHops:18,receiptLimit:256});
const token=G=>({state:G.state,scholar:G.state.scholar,bearer:G.villagerId,key:G.state.runKey});
const same=(G,t)=>G.state===t.state&&G.state.scholar===t.scholar&&G.villagerId===t.bearer&&G.state.runKey===t.key;
const busy=G=>G.over||G.inCombat()||G.pendingEncounter||!!G.state.activeContest;
const scene=G=>({x:G.map.px,y:G.map.py,inside:G.state.scholar.insideHaven,tent:G.state.scholar.insideTent});
const sameScene=(G,s)=>G.map.px===s.x&&G.map.py===s.y&&G.state.scholar.insideHaven===s.inside&&G.state.scholar.insideTent===s.tent;
function snap(G){const s=G.state.scholar;return{bearer:G.villagerId,world:[G.map.px,G.map.py],position:[s.mx??4,s.my??4],inside:!!s.insideHaven,kcal:s.kcal,day:s.day,tick:s.dayTicks};}
function bump(ctx,key,n=1){const c=ctx.publicTravelCounters||(ctx.publicTravelCounters={});c[key]=(c[key]||0)+n;}
function record(ctx,row){const a=ctx.publicTravelReceipts||(ctx.publicTravelReceipts=[]);if(a.length===RULES.receiptLimit){a.shift();bump(ctx,'olderReceiptsDropped');}a.push(row);}
function within(G,ctx,fn){const previous=scopes.get(G),scope={ctx,actor:previous?.actor||token(G),interrupted:!!previous?.interrupted};scopes.set(G,scope);try{return fn();}finally{if(previous){previous.interrupted=previous.interrupted||scope.interrupted;scopes.set(G,previous);}else scopes.delete(G);}}
function walk(G,ctx,actor,point){
 const start=scene(G),s=G.state.scholar,path=G.beginPathWalk(point[0],point[1]);
 if(!path)return'unaffordable-or-no-path';
 for(const[x,y]of path){
  if(!same(G,actor)||busy(G)||!sameScene(G,start))return'interrupted';
  if(!G.pathStep(x,y))return'walk-refused';
  bump(ctx,'landedSteps');
  if(!same(G,actor)||busy(G)||!sameScene(G,start))return'interrupted';
  if(s.mx!==x||s.my!==y)return'position-changed';
 }
 return null;
}
function points(G,predicate){
 const s=G.state.scholar,detail=G.genDetail(G.map.px,G.map.py),out=[];
 for(let y=0;y<9;y++)for(let x=0;x<9;x++){
  if(G.cellProps(detail[y]?.[x]).blocks||!predicate(x,y,detail))continue;
  const path=G.findPath(s.mx??4,s.my??4,x,y);if(path)out.push({point:[x,y],steps:path.length});
 }
 return out.sort((a,b)=>a.steps-b.steps||a.point[1]-b.point[1]||a.point[0]-b.point[0]);
}
function leaveInterior(G,ctx,actor){
 if(G.state.scholar.insideTent){G.exitTent();bump(ctx,'tentExitAttempts');if(!same(G,actor)||busy(G))return'interrupted';if(G.state.scholar.insideTent)return'tent-exit-refused';}
 if(!G.state.scholar.insideHaven)return null;
 const doors=G.genDetail(G.map.px,G.map.py).flatMap((row,y)=>row.flatMap((cell,x)=>cell==='door'?[[x,y]]:[]));
 const approach=points(G,(x,y)=>doors.some(([dx,dy])=>Math.max(Math.abs(x-dx),Math.abs(y-dy))<=1))[0];
 if(!approach)return'no-door-path';
 const stopped=walk(G,ctx,actor,approach.point);if(stopped)return stopped;
 if(!G.exitBuilding())return'door-exit-refused';bump(ctx,'hallExits');
 return !same(G,actor)||busy(G)?'interrupted':null;
}
function move(G,ctx,actor,x,y){
 const before=snap(G),row={target:[x,y],before,hops:[],reason:null};bump(ctx,'requests');
 const finish=(reason,value=null)=>{row.reason=reason;row.after=snap(G);record(ctx,row);if(reason!=='arrived')bump(ctx,reason);return value;};
 if(!same(G,actor)||busy(G))return finish('interrupted');
 if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=G.map.tiles[0].length||y>=G.map.tiles.length)return finish('invalid-target');
 if(G.map.px===x&&G.map.py===y)return finish('already-there');
 const interior=leaveInterior(G,ctx,actor);if(interior)return finish(interior);
 let result=null;
 for(let hop=0;hop<RULES.maxHops;hop++){
  if(!same(G,actor)||busy(G))return finish('interrupted');
  if(G.map.px===x&&G.map.py===y)return finish('arrived',result);
  // Only an adjacent cardinal crossing; no diagonal or revealed-node jump.
  const candidates=(G.travelTargets()||[]).filter(t=>Math.abs(t.x-G.map.px)+Math.abs(t.y-G.map.py)===1)
   .sort((a,b)=>(Math.abs(a.x-x)+Math.abs(a.y-y))-(Math.abs(b.x-x)+Math.abs(b.y-y))||a.y-b.y||a.x-b.x);
  const next=candidates[0];if(!next||Math.abs(next.x-x)+Math.abs(next.y-y)>=Math.abs(G.map.px-x)+Math.abs(G.map.py-y))return finish('no-next-node');
  const dx=next.x-G.map.px,dy=next.y-G.map.py;
  const edge=points(G,(cx,cy)=>{const e=G.edgeExit(cx,cy);return e?.dx===dx&&e?.dy===dy;})[0];
  if(!edge)return finish('no-edge-path');
  const stopped=walk(G,ctx,actor,edge.point);if(stopped)return finish(stopped);
  const ex=G.edgeExit(G.state.scholar.mx??4,G.state.scholar.my??4);
  if(ex?.dx!==dx||ex?.dy!==dy)return finish('edge-changed');
  const block=G.travelBlockage(next.x,next.y);if(block)return finish('blocked',block);
  // Older published roots have the same native crossing verbs but no explicit
  // durable checkpoint API. Do not install a shim or change their save rules.
  const canCheckpoint=typeof G.captureTravelCheckpoint==='function'&&typeof G.commitTravelCheckpoint==='function';
  const checkpoint=canCheckpoint?G.captureTravelCheckpoint():null,from=[G.map.px,G.map.py];
  result=G.tryNodeExit(dx,dy);
  const crossed=G.map.px===next.x&&G.map.py===next.y;
  row.hops.push({from,to:[next.x,next.y],edge:edge.point,approachSteps:edge.steps,crossed});
  if(crossed)bump(ctx,'crossedNodes');
  if(crossed&&same(G,actor)&&!G.over){
   if(canCheckpoint)G.commitTravelCheckpoint(checkpoint);
   else bump(ctx,'checkpointUnavailable');
  }
  if(!same(G,actor)||busy(G))return finish('interrupted',result);
  if(!crossed)return finish(result?.blocked?'blocked':'crossing-refused',result?.blocked||result);
 }
 return finish(G.map.px===x&&G.map.py===y?'arrived':'hop-limit',result);
}
function travel(G,...args){
 const scope=scopes.get(G);if(!scope)return G.travelTo(...args);
 if(scope.interrupted)return null;
 try{const result=move(G,scope.ctx,scope.actor,args[0],args[1]);
  if(['interrupted','position-changed','edge-changed'].includes(scope.ctx.publicTravelReceipts?.at(-1)?.reason))scope.interrupted=true;
  return result;
 }catch(error){
  (scope.ctx.publicTravelErrors||(scope.ctx.publicTravelErrors=[])).push(error.message);
  console.warn('[public-travel] '+error.message);throw error;
 }
}
function diagnostics(ctx){return{rules:RULES,counters:ctx.publicTravelCounters||{},receipts:ctx.publicTravelReceipts||[]};}
module.exports={within,travel,move,token,diagnostics,RULES};
