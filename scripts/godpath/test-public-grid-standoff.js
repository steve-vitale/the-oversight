'use strict';
const fs=require('fs'),z=require('zlib'),K=require('./lib'),assert=require('assert/strict'),profiles=require('../policies/public-travel-profiles').profiles;
(async()=>{
 const G=await K.load({seed:6});K.newRun(G);
 const capture=JSON.parse(z.gunzipSync(fs.readFileSync(require('path').join(__dirname,'../../evidence/2026-10-21/public-grid-recovery-replay-r1.json.gz')))).results[0].trace.routes[0];
 K.restoreCombatCapture(G,capture);assert.equal(capture.day,31);assert.equal(capture.fight.round,21200);
 const policy=profiles.find(p=>p.id==='grid-maker'),ctx={},calls=[],f=G.tbfight;
 for(const name of ['tbPlayerMove','tbPlayerWait','tbBarrierExit','tbPlayerStrike']){const original=G[name];G[name]=function(...args){calls.push({name,args});return original.apply(this,args);};}
 let turns=0;while(G.tbfight===f&&!f.over&&!G.over&&turns++<8){if(G.tbIsPlayerTurn())policy.fight(G,ctx);else G.tbAdvance();}
 assert(G.tbfight!==f||f.over||G.over,'captured standoff must resolve through public actions');
 assert(calls.some(c=>c.name==='tbBarrierExit'),'reachable native barrier is actually attempted');assert(ctx.gridStandoffRetreatTurns>0);
 assert.equal(ctx.timeFreezeCleared||0,0);assert.deepEqual(policy.diagnostics(ctx).errors,[]);
 console.log('Public grid captured standoff passed: '+JSON.stringify({turns,retreatTurns:ctx.gridStandoffRetreatTurns,calls,result:f.result,world:[G.map.px,G.map.py]}));
 K.restoreCombatCapture(G,capture);G.tbfight.noFlee=true;const sealed=G.tbfight,sealedContext={};calls.length=0;
 for(let i=0;i<8&&!G.over&&G.tbfight===sealed;i++){if(G.tbIsPlayerTurn())policy.fight(G,sealedContext);else G.tbAdvance();}
 assert.equal(sealedContext.gridStandoffRetreatTurns||0,0);assert(!calls.some(c=>c.name==='tbBarrierExit'),'sealed fights never gain a new escape');assert.equal(sealedContext.timeFreezeCleared||0,0);
 console.log('Public grid sealed standoff retains the authored barrier');
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
