'use strict';
// The legacy trust diagnostic must remain passive. One harness per process.
const cp=require('child_process'),path=require('path');
const K=require('./lib'),T=K.reporter('trust observer neutrality');
(async()=>{
 if(process.argv.includes('--child')){
  const seed=Number(process.argv[process.argv.indexOf('--seed')+1]),on=process.argv.includes('--observe');
  const H=require('../sim-harness'),C=require('../sweep-compare'),gear=require('../gear-usage-audit');
  const {installTrustCensus}=require('../trustgain-20261014'),base=C.POLICY_REGISTRY.leadcourt;let G,c;
  C.POLICY_REGISTRY.leadcourt={...base,setup(g,ctx){G=g;if(on)c=installTrustCensus(g);if(c)c.reproxy();if(base.setup)return base.setup(g,ctx);},daily(g,ctx){if(c){c.reproxy();c.sampleDay();}return base.daily&&base.daily(g,ctx);}};
  const r=await H.quietLog(()=>C.runComparison({seeds:[seed],policies:['leadcourt'],days:20,origin:'Columbus, Ohio'}));
  if(c)c.sampleDay();
  console.log('@@TRUST@@'+JSON.stringify({hash:gear.gameplayHash(G.state),row:r.runs[0],random:Array.from({length:16},()=>Math.random()),sampleBoundaries:on?c.daySamples.every((s,i)=>Number.isInteger(s.writeIndex)&&s.writeIndex>=0&&s.writeIndex<=c.writes.length&&(i===0||s.writeIndex>=c.daySamples[i-1].writeIndex)):null}));return;
 }
 for(const seed of [11,42]){
  const pair=[false,true].map(on=>{const r=cp.spawnSync(process.execPath,[__filename,'--child','--seed',String(seed),...(on?['--observe']:[])],{cwd:path.resolve(__dirname,'../..'),env:process.env,encoding:'utf8',timeout:60000,maxBuffer:4e6});if(r.status!==0)throw Error(r.stderr||r.stdout);return JSON.parse(r.stdout.split('@@TRUST@@').pop());});
  T.ok('seed '+seed+' actual full state and outcome stay exact',pair[0].hash===pair[1].hash&&JSON.stringify(pair[0].row)===JSON.stringify(pair[1].row));
  T.ok('seed '+seed+' random continuation stays exact',JSON.stringify(pair[0].random)===JSON.stringify(pair[1].random));
  T.ok('seed '+seed+' samples retain monotonic exact write boundaries',pair[1].sampleBoundaries===true);
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
