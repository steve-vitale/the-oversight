'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert/strict'),R=require('../../scripts/garden-longplay-audit'),B=require('../../scripts/balance-panel');
const prefix='evidence/2026-10-21/garden-controller-',read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f))),key=r=>r.row.policy+':'+r.row.seed,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const arms=[{arm:'before',panel:read('evidence/2026-10-21/garden-food-safety-after-r3.json.gz'),long:read(prefix+'long-before-r1.json.gz'),root:require('./garden-controller-baseline-root-r1.json').root},{arm:'after',panel:read(prefix+'after-r3.json.gz'),long:read(prefix+'long-after-r3.json.gz'),root:require('./garden-controller-candidate-root-r3.json').root}];
(async()=>{
 const jobs=[];for(const a of arms){assert.deepEqual(a.panel.sources,B.manifest(a.root));for(const p of a.panel.rows)if(!a.long.results.some(r=>r.job.observe&&r.job.days===150&&key(r)===key(p)))jobs.push({arm:a.arm,policy:p.row.policy,seed:p.row.seed,days:150,observe:1});}
 const plan={scope:'Fill only screen seeds absent from the separately declared1..16 long cohort. Actual fresh shared child replays; original panel rows and source identities remain unchanged.',jobs,sources:Object.fromEntries(arms.map(a=>[a.arm,a.panel.sources])),observer:B.observerIdentity(process.cwd()),toolSha256:sha(fs.readFileSync('scripts/garden-longplay-audit.js'))};
 fs.writeFileSync(prefix+'fill-replays-plan-r1.json',JSON.stringify(plan,null,2)+'\n',{flag:'wx'});
 const results=[];let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<jobs.length){const j=jobs[next++],a=arms.find(a=>a.arm===j.arm),job={policy:j.policy,seed:j.seed,days:j.days,observe:j.observe};const r=await R.readChild([path.resolve('scripts/garden-longplay-audit.js'),'--child','--root',a.root,...Object.entries(job).flatMap(([k,v])=>['--'+k,String(v)])],a.root),result={job,...r};R.validateResult(result,job,a.panel.sources);results.push({arm:j.arm,result});process.stdout.write('.');}}));
 for(const a of arms)assert.deepEqual(a.panel.sources,B.manifest(a.root));
 fs.writeFileSync(prefix+'fill-replays-r1.json.gz',z.gzipSync(JSON.stringify({plan,results})+'\n'),{flag:'wx'});console.log('\nSaved '+results.length+' missing-seed replays.');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
