'use strict';
// Read only actual save completions during an unchanged seeded campaign.
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),H=require('../../scripts/sim-harness'),S=require('../../scripts/sweep-compare'),B=require('../../scripts/balance-panel'),gear=require('../../scripts/gear-usage-audit'),sidecar=require('../../scripts/lib/garden-usage');
(async()=>{
 const storage=new Map();global.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>[...storage.keys()][i]??null,get length(){return storage.size;}};
 const capture=process.argv[2]!=='off';const policy='capable',seed=5,base=S.POLICY_REGISTRY[policy],sources=B.manifest(process.cwd()),trace=[];let G,observer,garden,captured=null;
 S.POLICY_REGISTRY[policy]={...base,setup(g,ctx){G=g;observer=B.install(g);garden=sidecar.install(g);
  const save=g.save;g.save=function(...args){const result=save.apply(this,args),s=this.state.scholar,plots=this.map.tiles[4][4].plots||[];
   if(capture&&!captured&&this.map.px===4&&this.map.py===4&&!this.over&&s.day>=30&&plots.some(p=>p.lastHarvest>0)&&storage.has(this.state.runKey)){
    captured={scope:'Natural capable seed5 campaign; read from an actual completed save, no granted resources, abilities, ages or terrain. Selected after the first day30+ garden harvest. Deterministic replay validation below.',setup:{key:this.state.runKey},storage:Object.fromEntries(storage),observed:{day:s.day,tier:this.state.village.havenTier,keeper:this.state.village.gardenKeeper,plots:JSON.parse(JSON.stringify(plots)),bearer:this.villagerId}};
   }
   return result;
  };
  for(const name of ['cultivateGarden','havenTierUp']){const original=g[name];g[name]=function(...args){const before={day:this.state.scholar.day,tier:this.state.village.havenTier,kcal:this.state.scholar.kcal};const result=original.apply(this,args);trace.push({name,args,before,after:{day:this.state.scholar.day,tier:this.state.village.havenTier,kcal:this.state.scholar.kcal},result:result!==false});return result;};}
  return base.setup?.(g,ctx);
 },daily(g,ctx){const result=base.daily?.(g,ctx);observer.sample();garden.sample();return result;}};
 const report=await H.quietLog(()=>S.runComparison({seeds:[seed],policies:[policy],days:150})),row=report.runs[0],observed=observer.finish(row);garden.sample();
 const actual={row,stateHash:gear.gameplayHash(G.state),metrics:observed.metrics,garden:garden.report,rngTail:[Math.random(),Math.random(),Math.random()]};
 const retained=JSON.parse(z.gunzipSync(fs.readFileSync('evidence/2026-10-20/garden-cultivation-natural-r1.json.gz'))).results.find(r=>r.job.policy===policy&&r.job.seed===seed&&r.job.days===150&&r.job.observe===1);
 for(const key of ['row','metrics','garden','rngTail'])assert.deepEqual(actual[key],retained[key],key);fs.writeFileSync('evidence/2026-10-20/garden-cultivation-natural-save-r3-'+(capture?'on':'off')+'.json.gz',z.gzipSync(JSON.stringify(actual)),{flag:'wx'});
 assert.deepEqual(B.manifest(process.cwd()),sources);if(!capture)return;assert.ok(captured,'No naturally harvested living save');
 fs.writeFileSync('evidence/2026-10-20/garden-cultivation-natural-save-r3.json',JSON.stringify({...captured,sources,replay:{policy,seed,days:150,auditMatched:['row','metrics','garden','rngTail'],auditStateHashMatched:actual.stateHash===retained.stateHash,persistenceScope:'Real storage advances the shared harness clock through index lastPlayed calls. This persistent replay requires its own capture-on/off exact state comparison; it is not the original audit state.',trace}},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({day:captured.observed.day,tier:captured.observed.tier,auditOutcomeMetricsMatch:true,events:trace.length}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
