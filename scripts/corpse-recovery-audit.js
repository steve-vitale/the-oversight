#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),assert=require('assert/strict');
const {install}=require('./lib/corpse-opportunities');
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];};
const read=f=>JSON.parse(f.endsWith('.gz')?z.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f,'utf8'));
if (process.env.CORPSE_RECOVERY_TRACE_OUT && require.main!==module) {
  // The standard balance child loads its own unchanged harness from cwd.
  const H=require(path.join(process.cwd(),'scripts/sim-harness')),load=H.loadGame;
  let recorder;
  H.loadGame=async function (...args) {const r=await load.apply(this,args);recorder=install(r.Game);return r;};
  process.on('exit',()=>{if(recorder)fs.writeFileSync(process.env.CORPSE_RECOVERY_TRACE_OUT,z.gzipSync(JSON.stringify(recorder.finish())+'\n'),{flag:'wx'});});
} else if (require.main===module) {
  (async()=>{
    assert(arg('panel',null)&&arg('out',null),'--panel <retained panel.json.gz> --out <new directory> required');
    const root=path.resolve(arg('root','.')),panel=read(arg('panel')),B=require('./balance-panel');
    assert.equal(process.version,panel.options.nodeVersion,'Replay Node version differs from retained panel');
    for(const [name,value] of Object.entries(panel.options.flags || {}))
      assert.equal(process.env[name] ?? null,value,'Replay flag differs: '+name);
    const selected=arg('cases','capable:2,caregiver:7,grid-capable:2,grid-caregiver:7').split(',').map(x=>{
      const [policy,seed]=x.split(':');assert(policy&&Number.isSafeInteger(Number(seed)));return{policy,seed:Number(seed)};
    });
    assert.deepEqual(B.manifest(root),panel.sources,'Retained panel must match current root');
    assert.equal(B.observerIdentity(root).observerDigest,panel.observerDigest);
    assert.equal(B.observerIdentity(root).contractDigest,panel.contractDigest);
    const out=path.resolve(arg('out'));fs.mkdirSync(out,{recursive:false});
    const results=[];
    for(const job of selected){
      const expected=panel.rows.find(x=>x.row.policy===job.policy&&x.row.seed===job.seed);assert(expected,'Missing selected case');
      const trace=path.join(out,job.policy+'-'+job.seed+'.json.gz');
      const args=['-r',__filename,path.join(root,'scripts/balance-panel.js'),'--child','--root',root,
        '--policy',job.policy,'--seed',String(job.seed),'--observe','1','--days',String(panel.options.days),
        '--origin',panel.options.origin];
      if(panel.options.region)args.push('--region',panel.options.region);
      if(panel.options.occupation!=null)args.push('--occupation',panel.options.occupation);
      const result=await new Promise((resolve,reject)=>{
        const child=cp.spawn(process.execPath,args,{cwd:root,env:{...process.env,CORPSE_RECOVERY_TRACE_OUT:trace}});
        let stdout='',stderr='';child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);
        child.on('error',reject);child.on('close',code=>{try{assert.equal(code,0,stderr||stdout.slice(-2000));resolve(JSON.parse(stdout.split('@@BALANCE@@').pop()));}catch(e){reject(e);}});
      });
      for(const key of ['row','stateHash','metrics'])assert.deepEqual(result[key],expected[key],job.policy+job.seed+key);
      assert.deepEqual(result.warnings,[]);assert.deepEqual(result.observerErrors,[]);
      const raw=read(trace);
      results.push({job,stateHash:result.stateHash,rowMetricsExact:true,trace:path.basename(trace),observations:raw.observations,
        bodies:raw.bodies.map(b=>({id:b.id,person:b.person,deathKnownObserved:b.deathKnownObserved,locationKnowledge:b.locationKnowledge,
          birth:b.firstObserved,firstLocal:b.firstLocal,firstAdjacent:b.firstAdjacent,localObservations:b.localObservations,
          adjacentObservations:b.adjacentObservations,rangeCalls:b.rangeCalls,rangeAccepted:b.rangeAccepted,rangeRefused:b.rangeRefused,
          quietAdjacentObservations:b.quietAdjacentObservations,firstQuietAdjacent:b.firstQuietAdjacent,
          transfers:b.transfers.length,last:b.last}))});
      console.log(job.policy+':'+job.seed+' exact row/state/all23; '+raw.bodies.length+' bodies');
    }
    assert.deepEqual(B.manifest(root),panel.sources,'Source changed during replay');
    fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({scope:'Selected diagnostic replays only; repeated boundary observations are not independent opportunities. Known death does not imply known body location. No numerical tuning or policy promotion.',
      sourceDigest:panel.sourceDigest,observerDigest:panel.observerDigest,contractDigest:panel.contractDigest,options:panel.options,results},null,2)+'\n',{flag:'wx'});
  })().catch(e=>{console.error(e.stack);process.exitCode=1;});
}
