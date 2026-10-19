'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),assert=require('assert'),B=require('../../scripts/balance-panel'),gear=require('../../scripts/gear-usage-audit');
(async()=>{
 const[side,region,policy,seedArg,out]=process.argv.slice(2),seed=Number(seedArg),common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim());
 if(!['before','after'].includes(side)||!['na','eu'].includes(region)||!out)throw Error('Pass before/after na/eu policy seed fresh-output');
 const root=side==='before'?path.join(common,'release-regional-after-r1'):path.join(common,'release-survival-after-r1'),H=require(path.join(root,'scripts/sim-harness')),{runComparison,POLICY_REGISTRY:registry}=require(path.join(root,'scripts/sweep-compare')),base=registry[policy],trace=[];let G,observer;
 registry[policy]={...base,setup(g,ctx){G=g;observer=B.install(g);
  const raid=G.havenRaidTick;G.havenRaidTick=function(){const day=G.state.scholar.day,wave=G.unlockedWave(),live=G.worldMonsters().filter(m=>(m.hp||0)>0).map(m=>({id:m.id,wave:(G.data.monsters.find(d=>d.id===m.id)||{}).wave})),r=raid.apply(this,arguments);if(trace.filter(x=>x.kind==='raid').length<100)trace.push({kind:'raid',day,wave,live,current:live.filter(m=>m.wave===wave).length,result:r,posted:G.worldMonsters().filter(m=>m.raidPost).map(m=>({id:m.id,post:m.raidPost}))});return r};
  const beam=G.apMaybeBeamAttack;G.apMaybeBeamAttack=function(f){const before=G.state.scholar.health,aim=!!f._beamAim,r=beam.apply(this,arguments);if(r)trace.push({kind:'beam',day:G.state.scholar.day,before,after:G.state.scholar.health,hadAim:aim,hasAim:!!f._beamAim});return r};
  if(base.setup)return base.setup(g,ctx)},daily(g,ctx){const r=base.daily&&base.daily(g,ctx);observer.sample();return r}};
 const report=await H.quietLog(()=>runComparison({seeds:[seed],policies:[policy],days:150,...(region==='eu'?{region:'eu_temperate',origin:'Berlin, Germany'}:{origin:'Columbus, Ohio'})}));registry[policy]=base;
 const row=report.runs[0],observed=observer.finish(row),stateHash=gear.gameplayHash(G.state),file=side==='before'?'release-regional-'+region+'-after-r1.json.gz':'release-loot-'+region+'-after-r1.json.gz',panel=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,file)))),expected=panel.rows.find(r=>r.row.policy===policy&&r.row.seed===seed);
 assert.equal(stateHash,expected.stateHash,'Tracing changed the exact final state');assert.deepStrictEqual(observed.metrics,expected.metrics,'Tracing changed the metric vector');
 fs.writeFileSync(out,JSON.stringify({side,region,policy,seed,stateHash,metrics:observed.metrics,trace,matched:true})+'\n',{flag:'wx'});console.log(JSON.stringify({side,region,policy,seed,matched:true,events:trace.length}));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
