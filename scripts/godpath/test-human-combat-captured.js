'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),K=require('./lib'),T=K.reporter('Captured human fight');
const policyRoot=process.env.HUMAN_COMBAT_POLICY_ROOT||path.join(__dirname,'../..'),A=require(path.join(policyRoot,'scripts/policies/capable'));
(async()=>{
 const G=await K.load({seed:9});K.newRun(G);const saved=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'../../evidence/2026-10-21/gardener-intent-freeze-replay-r2.json.gz')))).trace.routes[0];
 K.restoreCombatCapture(G,saved);
 const restoredState=G.state;let rejected=false;try{K.restoreCombatCapture(G,{...saved,bearer:'wrong captured bearer'});}catch(e){rejected=/Incomplete/.test(e.message);}
 T.ok('invalid bearer capture is rejected before mutating the active scene',rejected&&G.state===restoredState&&G.villagerId===saved.bearer);
 T.ok('prepared replay uses a copy rather than editing retained evidence',G.state!==saved.state&&G.map!==saved.map&&G.tbfight!==saved.fight);
 const f=G.tbfight,before={world:[G.map.px,G.map.py],bearer:G.villagerId,round:f.round},calls=[];
 for(const name of ['tbPlayerMove','tbBarrierExit','tbPlayerWait','tbPlayerStrike']){const fn=G[name];G[name]=function(...args){calls.push({name,args});return fn.apply(this,args);};}
 const ctx={};let turns=0;while(G.tbfight===f&&!f.over&&!G.over&&turns++<12){if(G.tbIsPlayerTurn())A.capable.fight(G,ctx);else G.tbAdvance();}
 T.ok('fixture restores the captured bearer and day76 human betrayal',G.villagerId===saved.bearer&&saved.day===76&&saved.fight.round===21201&&saved.fight.fighters.some(p=>p.kind==='hostile')&&!saved.fight.fighters.some(p=>p.kind==='monster'));
 T.ok('captured standoff resolves through real public combat actions without harness recovery',G.tbfight!==f||f.over||G.over);
 T.ok('controller actually attempts a reachable public barrier exit',calls.some(c=>c.name==='tbBarrierExit')&&(!G.tbfight||G.map.px!==before.world[0]||G.map.py!==before.world[1]||G.villagerId!==before.bearer));
 T.ok('combat action errors remain observable and absent',!(ctx.capErrors||[]).length&&!(ctx.humanCombatErrors||[]).length,JSON.stringify(ctx.capErrors||ctx.humanCombatErrors));
 console.log('HUMAN_CAPTURED_RESULT '+JSON.stringify({scope:'Prepared captured state/map/person reconstruction; natural full-campaign replay is separate.',before,after:{world:[G.map.px,G.map.py],bearer:G.villagerId,round:G.tbfight?.round,result:f.result,over:G.over},turns,calls}));T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
