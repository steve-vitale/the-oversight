'use strict';
// Diagnose retained endpoints without replaying or advancing a campaign.
// Each endpoint loads its exact Game root in a separate process.
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process');
const arg=n=>process.argv[process.argv.indexOf(n)+1];
if(process.argv.includes('--child')){
 (async()=>{
  const file=path.resolve(arg('--report')),index=Number(arg('--index'));
  const audit=JSON.parse(z.gunzipSync(fs.readFileSync(file))),r=audit.results[index];
  const root=audit.plan.root,B=require('./balance-panel'),gear=require('./gear-usage-audit');
  if(JSON.stringify(B.manifest(root))!==JSON.stringify(r.sources))throw Error('Retained Game root changed');
  const {Game:G}=await require(path.join(root,'scripts/sim-harness')).loadGame({seed:r.seed});
  G.state=r.finalState;
  const before=gear.gameplayHash(G.state),pg=G.progState(),s=G.state.scholar;
  const seat=G.tableSeat(),stage=G.integrationStage(),reactor=!!G.fusionReactorOnline();
  const d=seat.detail,missing=[];
  if(d.w1<4)missing.push('wave1');if(d.w2<4)missing.push('wave2');if(d.w3<3)missing.push('wave3');
  if(d.contestsN<2)missing.push('contests');if(d.crisesN<2)missing.push('crises');
  if(!['regional','national','global'].includes(d.rank))missing.push('standing rank');
  if(stage<2)missing.push('integration');if(!pg.sentimentTaught)missing.push('sentiment taught');
  if(!pg.feastSurgeUsed)missing.push('feast combat use');
  const perDay=r.row.pacing?.perDay||[],calls={};
  for(const p of perDay)for(const[k,v]of Object.entries(p.acts||{}))if(/hostFeast|channelSentiment|faceFeastDraw|chooseTableOption/.test(k))calls[k]=(calls[k]||0)+v;
  const deaths=r.row.deaths||{},playerDeaths=Object.entries(deaths).filter(([k])=>k.startsWith('player:')).reduce((n,[,v])=>n+v,0);
  const checkpoint=audit.results.find(x=>x.cap===600&&x.seed===r.seed&&x.job.trace===0);
  const lateKills={};
  for(const e of G.state.waveKillLog||[]){const w=(G.data.monsters.find(m=>m.id===e.mid)||{}).wave||e.w||1;if(w<4)continue;const key=w+':'+e.via,q=lateKills[key]||(lateKills[key]={count:0,firstDay:e.d,lastDay:e.d});q.count++;q.firstDay=Math.min(q.firstDay,e.d);q.lastDay=Math.max(q.lastDay,e.d);}
  const result={report:path.basename(file),seed:r.seed,policy:r.policy,sourceRoot:root,sourceIdentity:r.sources,terminal:r.terminal,seat,missing,stage,reactor,feastArmed:!!pg.feastSurge,feastUsed:!!pg.feastSurgeUsed,at600:{feastUsed:!!checkpoint?.finalState.scholar.prog.feastSurgeUsed,table:checkpoint?.row.table},waveReach:r.row.waveReach,waveKills:G.state.waveKills,lateKills,calls,playerDeaths,deathCauses:deaths,observationMutated:before!==gear.gameplayHash(G.state)};
  if(result.observationMutated)throw Error('Gate observation mutated endpoint');
  process.stdout.write('@@GATES@@'+JSON.stringify(result));
 })().catch(e=>{console.error(e.stack);process.exitCode=1;});
}else{
 const files=process.argv.slice(2);if(!files.length)throw Error('Provide retained terminal audit .json.gz files');
 const results=[];
 for(const file of files){const a=JSON.parse(z.gunzipSync(fs.readFileSync(file)));if(!a.stable||a.neutral.some(n=>!n.match)||a.prefixes.some(p=>!p.ok))throw Error('Invalid campaign control');
  const side=path.basename(file).includes('-before-')?'before':'after',panelFile=path.join(path.dirname(file),'merge520-main-'+side+'-r5/panel.json.gz');
  const panel=JSON.parse(z.gunzipSync(fs.readFileSync(panelFile)));
  for(let index=0;index<a.results.length;index++){const r=a.results[index];if(r.cap!==Math.max(...a.plan.jobs.map(j=>j.cap))||r.job.trace!==0)continue;
   const checkpoint=a.results.find(x=>x.cap===600&&x.seed===r.seed&&x.job.trace===0),old=panel.rows.find(p=>p.row.seed===r.seed&&p.row.policy===r.policy);
   if(!old||!checkpoint)throw Error('Original 600-day panel case missing');
   const canonical600={row:JSON.stringify(old.row)===JSON.stringify(checkpoint.row),state:old.stateHash===checkpoint.stateHash,all29:JSON.stringify(old.metrics)===JSON.stringify(checkpoint.observation.metrics),wholeGear:JSON.stringify(old.gear)===JSON.stringify(checkpoint.observation.gear)};
   if(Object.values(canonical600).some(v=>!v))throw Error('Original 600-day panel differs');
   const output=cp.execFileSync(process.execPath,[__filename,'--child','--report',path.resolve(file),'--index',String(index)],{encoding:'utf8',maxBuffer:4*1024*1024});results.push({...JSON.parse(output.split('@@GATES@@').pop()),canonical600});
  }
 }
 console.log(JSON.stringify({version:1,scope:'Selected exact terminal snapshots; no timing or causal claim',results},null,2));
}
