'use strict';
// Prepared real-engine boundaries. These are not estimates of natural exposure.
const cp=require('child_process'),path=require('path'),K=require('./lib'),P=require('../policies/human-combat'),C=require('../policies/competent'),T=K.reporter('Live monster policy');
for(const mode of ['competent','capable','default'])for(const kind of ['fled','dead']){
 const run=cp.spawnSync(process.execPath,[path.join(K.ROOT,'evidence/2026-10-23/live-combat-target-probe-r1.cjs'),'--child',mode,kind],{encoding:'utf8',maxBuffer:8*1024*1024});
 if(run.status!==0)throw Error(run.stderr||run.stdout.slice(-1000));
 const row=JSON.parse(run.stdout.split('@@TARGET@@').pop());
 T.ok(mode+' ignores '+kind+' positive-HP decoy; real engine accepts first Strike',row.passed,JSON.stringify(row.calls));
}
(async()=>{
 const G=await K.load({seed:7002});let f,p,m,calls,ctx;
 const originals={};
 for(const name of ['tbPlayerMove','tbPlayerStrike','tbPlayerWait']){
  originals[name]=G[name];G[name]=function(...args){
   const before={round:f.round,x:p.mx,y:p.my,moves:p.moveLeft,acted:p.acted};
   const route=name==='tbPlayerMove'?G.findPath(p.mx,p.my,...args):null;
   const cost=route?.reduce((n,[x,y])=>n+G.tbTerrainCost(x,y),0);
   const result=originals[name].apply(this,args);
   calls.push({name,args,result,cost,route,before,after:{round:f.round,x:p.mx,y:p.my,moves:p.moveLeft,acted:p.acted}});return result;
  };
 }
 function fresh(size,px,py,mx,my,battleSize=1){
  K.newRun(G);G.state.scholar.abilities=[];G.state.scholar.backgroundAbilities=[];
  m=K.fight(G,'hushwolf',{px,py,mx,my,hp:1000});f=G.tbfight;p=G.tbFighter('p');
  f.fighters=[p,m];f.order=[p.key,m.key];f.turnIdx=0;f.round=1;f.over=false;f.noFlee=true;f.gridSize=size;f.terraform={};
  Object.assign(p,{mx:px,my:py,hp:10000,maxHp:10000,alive:true,fled:false,acted:false,moveLeft:3});G.state.scholar.health=10000;
  Object.assign(m,{mx,my,battleSize,hp:1000,maxHp:1000,alive:true,fled:false,threatQueue:[]});
  for(const row of G.genDetail(G.map.px,G.map.py))for(let x=0;x<row.length;x++)row[x]='dirt';calls=[];ctx={};
 }
 fresh(12,9,1,11,1);C.competent.fight(G,ctx);
 T.ok('12-cell board approach uses legal destinations beyond the old 0..8 bounds',calls.some(c=>c.name==='tbPlayerMove'&&c.args[0]>8&&c.result===true),JSON.stringify(calls));
 T.ok('approach then accepted Strike uses one original turn',calls.some(c=>c.name==='tbPlayerStrike'&&c.result===true&&c.before.round===1)&&f.round===2&&calls.filter(c=>c.name==='tbPlayerWait').length===1,JSON.stringify(calls));
 fresh(24,14,8,4,4,10);C.competent.fight(G,ctx);
 T.ok('24-cell arena targets the nearest edge of a 10-cell footprint',G.fighterDistTo(m,14,8)<=1&&calls.some(c=>c.name==='tbPlayerStrike'&&c.args[0]===m.key&&c.result===true)&&!calls.some(c=>c.name==='tbPlayerMove'),JSON.stringify(calls));
 fresh(9,1,1,7,1);for(let y=0;y<9;y++)for(let x=0;x<9;x++)f.terraform[x+','+y]='trample';C.competent.fight(G,ctx);
 const move=calls.find(c=>c.name==='tbPlayerMove');
 T.ok('rough terrain pays only the affordable weighted path prefix',move?.result===true&&move.route.length===1&&move.cost===2&&move.after.moves===1,JSON.stringify(calls));
 T.ok('unreachable target is not struck and remaining original turn ends publicly',!calls.some(c=>c.name==='tbPlayerStrike')&&calls.filter(c=>c.name==='tbPlayerWait').length===1&&f.round===2,JSON.stringify(calls));
 fresh(12,9,1,11,1);const result=C.beastStrikeTarget(G,f,ctx,p,p.mx,p.my,m,()=>{throw Error('obsolete finisher called');});
 T.ok('named beast counter shares dynamic-board movement and accepted Strike',result==='struck'&&calls.some(c=>c.name==='tbPlayerMove'&&c.result===true)&&calls.some(c=>c.name==='tbPlayerStrike'&&c.result===true),JSON.stringify(calls));
 fresh(9,1,1,2,1);m.fled=true;const snapshot=JSON.stringify(G.state),handled=P.monsterTurn(G,ctx);
 T.ok('a roster containing only escaped monsters is not attacked or altered',handled===false&&calls.length===0&&JSON.stringify(G.state)===snapshot);
 T.ok('new combat routes report no action errors',!(ctx.humanCombatErrors||[]).length);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
