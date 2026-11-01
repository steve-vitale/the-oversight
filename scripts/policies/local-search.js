'use strict';
// Experimental controller, never a Game patch. Same adjacency/path order as
// app.js walkCloser; the human can tap that adjacent square, then Search.
// A direct tap on a distant body instead walks onto it. Contents cannot
// influence target selection or travel.
const RULES=Object.freeze({version:1,maxSteps:8,maxStacks:3,receiptLimit:256});
const neighbors=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
const token=G=>({state:G.state,scholar:G.state.scholar,bearer:G.villagerId,key:G.state.runKey,
  day:G.state.scholar.day,x:G.map.px,y:G.map.py,inside:G.state.scholar.insideHaven,tent:G.state.scholar.insideTent});
function interrupted(G,t){
  if(G.state!==t.state||G.state.scholar!==t.scholar||G.villagerId!==t.bearer||G.state.runKey!==t.key)return'actor-changed';
  if(G.over||G.state.scholar.health<=0)return'ended';
  if(G.state.scholar.day!==t.day)return'day-changed';
  if(G.map.px!==t.x||G.map.py!==t.y||G.state.scholar.insideHaven!==t.inside||G.state.scholar.insideTent!==t.tent)return'scene-changed';
  if(G.inCombat()||G.pendingEncounter||G.state.activeContest)return'encounter';
  return null;
}
function snap(G){const s=G.state.scholar;return{bearer:G.villagerId,node:[G.map.px,G.map.py],at:[s.mx??4,s.my??4],
  inside:!!s.insideHaven,day:s.day,tick:s.dayTicks,kcal:s.kcal};}
function bump(ctx,key,n=1){const a=ctx.localSearchCounters||(ctx.localSearchCounters={});a[key]=(a[key]||0)+n;}
function record(ctx,row){const a=ctx.localSearchReceipts||(ctx.localSearchReceipts=[]);if(a.length===RULES.receiptLimit){a.shift();bump(ctx,'receiptsDropped');}a.push(row);}
function approach(G,c){
  const s=G.state.scholar,px=s.mx??4,py=s.my??4;
  if(Math.max(Math.abs(c.mx-px),Math.abs(c.my-py))<=1)return{point:[px,py],steps:0};
  const detail=G.genDetail(G.map.px,G.map.py);let best=null;
  for(const [dx,dy] of neighbors){
    const nx=c.mx+dx,ny=c.my+dy;if(nx<0||ny<0||nx>8||ny>8||G.cellProps(detail[ny]?.[nx]).blocks)continue;
    const path=G.findPath(px,py,nx,ny);
    if(path?.length&&(!best||path.length<best.steps))best={point:[nx,ny],steps:path.length};
  }
  return best;
}
function searchLocal(G,ctx){
  const t=token(G);if(interrupted(G,t))return{stop:false,reason:'busy-at-entry'};
  let seen=ctx._localSearchSeen;
  if(!seen||seen.state!==G.state||seen.bearer!==t.bearer||seen.day!==t.day)
    seen=ctx._localSearchSeen={state:G.state,bearer:t.bearer,day:t.day,ids:new Set()};
  // Query precisely the local board cells used by the renderer. Do not inspect
  // the global corpse list or cargo while choosing a destination.
  const visible=[],s=G.state.scholar,mon=s.insideHaven?null:G.playerMonster(),ani=s.animal;
  const uncovered=c=>{
    if(Math.max(Math.abs(c.mx-(s.mx??4)),Math.abs(c.my-(s.my??4)))<=1)return true; // actual Search strip discloses nearby bodies
    if(Object.entries(G.state.village.positions||{}).some(([id,p])=>id!==G.villagerId&&p.mx===c.mx&&p.my===c.my))return false;
    if(ani&&ani.mx===c.mx&&ani.my===c.my)return false;
    return !(mon&&G.targetCovers({cx:mon.mx,cy:mon.my,tiles:G.fighterTiles(mon)},c.mx,c.my));
  };
  for(let y=0;y<9;y++)for(let x=0;x<9;x++)for(const c of G.corpseAt(x,y))
    if(!c.looted&&!seen.ids.has(c.id)&&uncovered(c))visible.push(c);
  visible.sort((a,b)=>Math.max(Math.abs(a.mx-(s.mx??4)),Math.abs(a.my-(s.my??4)))-
    Math.max(Math.abs(b.mx-(s.mx??4)),Math.abs(b.my-(s.my??4)))||a.my-b.my||a.mx-b.mx||String(a.id).localeCompare(String(b.id)));
  const c=visible[0];if(!c)return{stop:false,reason:'no-local-body'};
  const row={body:c.id,target:[c.mx,c.my],before:snap(G),steps:0,takes:[],reason:null};
  const finish=reason=>{row.reason=reason;row.after=snap(G);record(ctx,row);bump(ctx,reason);return{stop:reason==='position-changed'||!!interrupted(G,t),reason};};
  const route=approach(G,c);if(!route)return finish('no-path');
  if(route.steps>RULES.maxSteps)return finish('step-budget');
  seen.ids.add(c.id);bump(ctx,'sessions');
  if(route.steps){
    const path=G.beginPathWalk(...route.point);if(!path)return finish('walk-refused');
    for(const [x,y] of path){
      const reason=interrupted(G,t);if(reason)return finish(reason);
      if(!G.pathStep(x,y))return finish('step-refused');
      row.steps++;bump(ctx,'landedSteps');
      const after=interrupted(G,t);if(after)return finish(after);
      if(s.mx!==x||s.my!==y)return finish('position-changed');
    }
  }
  if(!G.corpseAt(c.mx,c.my).includes(c)||!G._corpseCheckRange(c,true))return finish('body-unavailable');
  // Reaching the native Loot reader reveals the remaining contents. No food
  // identification, exact item value or remote death knowledge is invented.
  const items=c.items||[];
  for(let i=0;i<items.length&&row.takes.length<RULES.maxStacks;i++){
    const reason=interrupted(G,t);if(reason)return finish(reason);
    if(!G.corpseAt(c.mx,c.my).includes(c)||c.buried)return finish('body-unavailable');
    const it=items[i];if(!it||(it.units??1)<=0||it._left||it.plantId==='meat_human')continue;
    const beforeUnits=it.units??1,result=G.corpseTakeItem(c.id,i),afterUnits=it.units??1;
    row.takes.push({index:i,beforeUnits,afterUnits,returnedTruthy:!!result});
    bump(ctx,'takeCalls');if(afterUnits<beforeUnits)bump(ctx,'depletedStacks');
    const after=interrupted(G,t);if(after)return finish(after);
  }
  return finish('completed');
}
function withLocalSearch(base){
  const policy={...base,id:base.id+'-search',desc:base.desc+'; experimental paid local approach/search before upkeep'};
  policy.upkeep=function(G,ctx){
    try{const r=searchLocal(G,ctx);if(!r.stop&&base.upkeep)return base.upkeep(G,ctx);}
    catch(error){(ctx.localSearchErrors||(ctx.localSearchErrors=[])).push(error.message);console.warn('[local-search] '+error.message);throw error;}
  };
  policy.diagnostics=ctx=>{const d=base.diagnostics?.(ctx)||{version:1,errors:[],counters:{}};
    return{...d,profile:policy.id,mode:'experimental-local-search',errors:[...(d.errors||[]),...(ctx.localSearchErrors||[])],
      counters:{...d.counters,...Object.fromEntries(Object.entries(ctx.localSearchCounters||{}).map(([k,v])=>['localSearch_'+k,v]))},
      localSearch:{rules:RULES,counters:ctx.localSearchCounters||{},receipts:ctx.localSearchReceipts||[]}};};
  return policy;
}
module.exports={searchLocal,approach,withLocalSearch,RULES};
