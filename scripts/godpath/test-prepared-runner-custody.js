'use strict';
// Exercise orchestration on disposable source fixtures; never mutate the checkout.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),z=require('zlib'),K=require('./lib'),T=K.reporter('prepared proof custody');
const runner=path.resolve(__dirname,'../run-god-restoration-prepared.js');
async function exercise(change){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-prepared-custody-'));
 try{
  const write=(f,s)=>{fs.mkdirSync(path.dirname(path.join(root,f)),{recursive:true});fs.writeFileSync(path.join(root,f),s);};
  for(const f of ['src/js/probe.js','scripts/policies/probe.js','index.html','scripts/sim-harness.js','scripts/sweep-compare.js','scripts/godpath/lib.js','scripts/gear-usage-audit.js','scripts/balance-panel.js','scripts/balance-metrics.json','scripts/lib/balance-scorecard.js','scripts/lib/simulation-flags.js','scripts/lib/balance-cohorts.js'])write(f,'// fixture\n');
  const ready=path.join(root,'ready');
  write('scripts/godpath/test-delayed.js',"require('fs').writeFileSync("+JSON.stringify(ready)+",'ready');setTimeout(()=>console.log('fixture: 1 passed, 0 failed'),500);\n");
  const out=path.join(root,'proof');let stdout='',stderr='';
  const child=cp.spawn(process.execPath,[runner,'--root',root,'--suites','test-delayed.js','--seeds','7','--jobs','1','--out',out],{env:process.env});
  const ended=new Promise((resolve,reject)=>{child.on('error',reject);child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('close',code=>resolve(code));});
  const start=Date.now();while(!fs.existsSync(ready)){if(Date.now()-start>10000){child.kill();await ended;throw Error('Fixture did not start: '+stdout+stderr);}await new Promise(r=>setTimeout(r,20));}
  if(change)fs.appendFileSync(path.join(root,'scripts/gear-usage-audit.js'),'// changed collector dependency\n');
  const exit=await ended,report=JSON.parse(z.gunzipSync(fs.readFileSync(out+'.json.gz')));return {exit,report};
 }finally{if(path.dirname(path.resolve(root))!==path.resolve(os.tmpdir())||!path.basename(root).startsWith('oversight-prepared-custody-'))throw Error('Refuse cleanup outside owned fixture');fs.rmSync(root,{recursive:true});}
}
(async()=>{
 const stable=await exercise(false),changed=await exercise(true);
 T.ok('unchanged selected suite accepts one isolated passing process',stable.exit===0&&stable.report.passed===1&&stable.report.failed===0&&stable.report.sourcesStable);
 T.ok('proof pins collector, contract, shared kit and orchestrator sources',stable.report.schemaVersion===3&&typeof stable.report.runnerDigest==='string'&&['scripts/gear-usage-audit.js','scripts/balance-metrics.json','scripts/godpath/lib.js'].every(f=>typeof stable.report.supportSources[f]==='string'));
 T.ok('changing a collector dependency rejects otherwise passing child output',changed.exit===1&&changed.report.passed===1&&changed.report.failed===0&&changed.report.sourcesStable===false);
 T.ok('source drift never erases the actual child result or selection',changed.report.rows[0].exit===0&&changed.report.suites.join(',')==='test-delayed.js'&&changed.report.seeds.join(',')==='7');
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
