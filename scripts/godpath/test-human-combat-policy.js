'use strict';
const K=require('./lib'),H=require('../sim-harness'),C=require('../policies/competent'),P=require('../policies/human-combat'),T=K.reporter('Human combat policy');
(async()=>{
 const G=await K.load({seed:7002});let f,p,h,calls,ctx;
 const originals={};for(const name of ['tbPlayerMove','tbPlayerStrike','tbPlayerWait','tbBarrierExit']){originals[name]=G[name];G[name]=function(...args){calls?.push({name,args});return originals[name].apply(this,args);};}
 function fresh(distance=2){
  K.newRun(G);G.debugScenario('uprising');f=G.tbfight;p=G.tbFighter('p');h=f.fighters.find(x=>x.kind==='hostile');
  const other=f.fighters.find(x=>x.kind==='hostile'&&x!==h),friend={...other,key:'v_'+other.villagerId,kind:'villager',hp:1,maxHp:100,alive:true,fled:false,mx:8,my:8};
  f.fighters=[p,h,friend];f.order=[p.key,h.key,friend.key];f.turnIdx=0;f.round=1;f.over=false;f.noFlee=true;
  Object.assign(p,{mx:1,my:1,hp:1000,maxHp:1000,alive:true,fled:false,acted:false,moveLeft:3});G.state.scholar.health=1000;
  Object.assign(h,{mx:1+distance,my:1,hp:1000,maxHp:1000,alive:true,fled:false,yielded:false,varmor:0});
  for(const row of G.genDetail(G.map.px,G.map.py))for(let x=0;x<row.length;x++)row[x]='dirt';calls=[];ctx={};return friend;
 }
 fresh();const start=f.round;P.humanTurn(G,ctx);
 T.ok('controller closes distance through actual public movement',calls.some(c=>c.name==='tbPlayerMove')&&p.mx!==1);
 T.ok('public strike targets the hostile, never the weaker friendly fighter',calls.some(c=>c.name==='tbPlayerStrike'&&c.args[0]===h.key)&&calls.filter(c=>c.name==='tbPlayerStrike').every(c=>c.args[0]===h.key));
 T.ok('move and strike finish through one public Wait without spending the next turn',calls.filter(c=>c.name==='tbPlayerWait').length===1&&f.round===start+1&&ctx.humanCombatStrikeActions===1);
 fresh(1);p.moveLeft=0;P.humanTurn(G,ctx);
 T.ok('zero-move one-action strike resolves without waiting away a fresh turn',calls.some(c=>c.name==='tbPlayerStrike')&&!calls.some(c=>c.name==='tbPlayerWait')&&f.round===2&&!p.acted&&p.moveLeft>0);
 fresh(1);p.acted=true;P.humanTurn(G,ctx);
 T.ok('already-spent action ends publicly without another strike',calls.length===1&&calls[0].name==='tbPlayerWait'&&f.round===2);
 const invalids=[{kind:'villager',alive:true,hp:2},{kind:'hostile',alive:false,hp:2},{kind:'hostile',alive:true,hp:2,fled:true},{kind:'hostile',alive:true,hp:2,yielded:true},{kind:'hostile',alive:true,hp:0}];
 T.ok('friends, downed, fled and yielded bodies are never human combat targets',invalids.every(x=>!P.liveHuman(x)));
 fresh(1);C.competent.fight(G,ctx);
 T.ok('actual competent fallback handles a human-only fight',calls.some(c=>c.name==='tbPlayerStrike'&&c.args[0]===h.key));
 fresh(2);h.hp=h.maxHp=20;H.driveFights(G,{fight(){return false;}},ctx);
 T.ok('shared driver fallback resolves an unhandled human fight with public actions',(!G.tbfight||f.over)&&calls.some(c=>c.name==='tbPlayerMove')&&calls.some(c=>c.name==='tbPlayerStrike'));
 T.ok('controller reports no suppressed action errors',!(ctx.humanCombatErrors||[]).length);
 fresh();f.fighters=f.fighters.filter(x=>x.kind!=='hostile');const before=JSON.stringify(G.state);const none=P.humanTurn(G,ctx);
 T.ok('no human target means no extra public action or state change',none===false&&calls.length===0&&JSON.stringify(G.state)===before);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
