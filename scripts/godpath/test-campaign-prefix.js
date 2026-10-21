'use strict';
const K=require('./lib'),P=require('../lib/campaign-prefix'),gear=require('../gear-usage-audit'),T=K.reporter('Campaign prefix evidence');
(async()=>{
 const entropy=P.entropyObserver();
 try{
  const G=await K.load({seed:7002});K.newRun(G);G.state.scholar.kcal=6000;
  global.__policyRandom=K.H.mulberry32(1234);entropy.attachPolicy();
  const initial=entropy.snapshot(),again=entropy.snapshot();
  T.ok('entropy snapshots draw no game, policy or clock values',JSON.stringify(initial)===JSON.stringify(again));
  const ctx={policyId:'prepared-prefix-proof',notes:[]};ctx.self=ctx;
  const trace=P.traceObserver(G,entropy,1),before=gear.gameplayHash(G.state),context=P.contextHash(ctx);
  trace.record('setup','before',ctx);trace.record('setup','after',ctx);
  T.ok('observing full game and cyclic policy context changes neither',before===gear.gameplayHash(G.state)&&context===P.contextHash(ctx)&&trace.errors.length===0);
  const from=entropy.snapshot();global.__policyRandom();G.doAction('wait');const to=entropy.snapshot();
  T.ok('real gameplay RNG and the separate policy RNG are counted without probes',to.game.count>from.game.count&&to.policy.count===from.policy.count+1);
  trace.record('daily','before',ctx);trace.record('daily','after',ctx);
  const stateHash=gear.gameplayHash(G.state),rows=JSON.parse(JSON.stringify(trace.rows));
  trace.record('upkeep','before',ctx);
  T.ok('the continued checkpoint retains actual complete state',trace.bridge.stateHash===stateHash&&gear.gameplayHash(trace.bridge.state)===stateHash);
  const short={trace:rows,stateHash,terminal:{engineOver:false}},long={trace:trace.rows,stateHash:'later',terminal:{engineOver:false},bridge:trace.bridge};
  T.ok('an identical observed prefix plus its final boundary is accepted',P.comparePrefix(short,long).ok);
  const copy=x=>JSON.parse(JSON.stringify(x));
  for(const [name,mutate] of [
   ['Game change',r=>r.trace[1].stateHash='other'],
   ['policy-context change',r=>r.trace[1].contextHash='other'],
   ['Game RNG history change',r=>r.trace[1].entropy.game.sha256='other'],
   ['Game RNG draw count change',r=>r.trace[1].entropy.game.count++],
   ['policy RNG history change',r=>r.trace[1].entropy.policy.sha256='other'],
   ['clock history change',r=>r.trace[1].entropy.clock.sha256='other'],
   ['missing observed phase',r=>r.trace.splice(1,1)],
   ['changed end-of-cap sampling state',r=>r.bridge.stateHash='other']
  ]){const bad=copy(long);mutate(bad);T.ok(name+' is rejected instead of normalized away',!P.comparePrefix(short,bad).ok);}
  const live=P.terminalStatus(G,{endReason:'village-dead'},{});
  T.ok('a harness liveness stop cannot stand in for an engine ending',!live.engineOver&&live.status==='not_terminal');
  const capped=P.terminalStatus(G,{endReason:'survived'},{});
  T.ok('a completed observation cap is not completion of a live campaign',capped.status==='not_terminal');
  const ended={over:true,won:true,villageLost:false,state:{scholar:{day:190}},villagerId:'prepared-ending'};
  T.ok('an actual engine terminal flag is required for a winning classification',P.terminalStatus(ended,{endReason:'over-other'},{}).status==='won');
  T.ok('forced watchdog recovery remains explicit even when the engine later wins',P.terminalStatus(ended,{endReason:'over-other'},{timeFreezeCleared:1}).status==='terminal_with_harness_recovery');
  const endedShort={trace:rows,stateHash,terminal:{engineOver:true}},endedLong={trace:rows,stateHash,terminal:{engineOver:true}};
  T.ok('an early actual ending remains the same when the cap grows',P.comparePrefix(endedShort,endedLong).ok);
  endedLong.terminal.engineOver=false;T.ok('a simulated terminal-to-live contradiction is rejected',!P.comparePrefix(endedShort,endedLong).ok);
  T.ok('observer error channels remain empty',entropy.errors.length===0&&trace.errors.length===0);
 }finally{entropy.restore();}
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
