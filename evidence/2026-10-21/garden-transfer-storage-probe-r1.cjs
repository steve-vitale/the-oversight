'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process'),assert=require('assert/strict');
const B=require('../../scripts/balance-panel'),gear=require('../../scripts/gear-usage-audit');
const roots=require('./garden-transfer-roots-r1.json'),prefix='evidence/2026-10-21/garden-transfer-',read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f)));
async function child(){
 const [arm,policy,seedText,capText]=process.argv.slice(3),root=roots[arm].root,S=require(path.join(root,'scripts/sweep-compare')),H=require(path.join(root,'scripts/sim-harness'));
 let G,observer;const events=[],base=S.POLICY_REGISTRY[policy];
 S.POLICY_REGISTRY[policy]={...base,setup(g,c){G=g;observer=B.install(g);const original=g.donateToPantry;g.donateToPantry=function(idx,...args){
  const s=this.state.scholar,v=this.state.village,id=s.villagerId,item=s.inventory[idx],before={day:s.day,actor:id,reserve:s.kcal,pack:JSON.parse(JSON.stringify(s.inventory)),pantry:JSON.parse(JSON.stringify(v.pantry||[])),gift:(v.gives||{})[id]||0,idx};
  const result=original.call(this,idx,...args);events.push({before,removed:!!item&&!s.inventory.includes(item),credit:((v.gives||{})[id]||0)-before.gift});return result;
 };return base.setup?.(g,c);},daily(g,c){const r=base.daily?.(g,c);observer.sample();return r;}};
 const r=await H.quietLog(()=>S.runComparison({seeds:[Number(seedText)],policies:[policy],days:Number(capText),origin:'Columbus, Ohio'}));
 const row=r.runs[0];process.stdout.write('@@STORAGE@@'+JSON.stringify({arm,policy,seed:Number(seedText),cap:Number(capText),sources:B.manifest(root),row,metrics:observer.finish(row).metrics,stateHash:gear.gameplayHash(G.state),events,finalState:G.state})+'\n');
}
async function main(){
 const plans=[['maker',4,150],['caregiver',9,150],['caregiver',10004,600],['caregiver',10008,600]],jobs=plans.flatMap(p=>['before','after'].map(arm=>[arm,...p]));
 const retained={before:read(prefix+'long-before-r1.json.gz'),after:read(prefix+'long-after-r1.json.gz')},results=[];let next=0;
 async function worker(){while(next<jobs.length){const job=jobs[next++];const r=await new Promise((resolve,reject)=>{const p=cp.spawn(process.execPath,[__filename,'--child',...job.map(String)],{env:process.env});let out='',err='';p.stdout.setEncoding('utf8');p.stderr.setEncoding('utf8');p.stdout.on('data',x=>out+=x);p.stderr.on('data',x=>err+=x);p.on('error',reject);p.on('close',code=>{try{if(code)throw Error(err||out);resolve(JSON.parse(out.split('@@STORAGE@@').pop()));}catch(e){reject(e);}});});
  const old=retained[r.arm].results.find(x=>x.job.observe&&x.job.policy===r.policy&&x.job.seed===r.seed&&x.job.days===r.cap);
  assert.deepEqual(r.sources,retained[r.arm].plan.sources);assert.equal(r.stateHash,old.stateHash);assert.deepEqual(r.row,old.row);assert.deepEqual(r.metrics,old.metrics);assert.equal(gear.gameplayHash(r.finalState),r.stateHash);
  results.push(r);process.stdout.write('.');
 }}await Promise.all([worker(),worker()]);
 fs.writeFileSync(prefix+'storage-probe-r1.json.gz',z.gzipSync(JSON.stringify({scope:'Four high-transfer/disagreement cases on both roots; passive full pre-donation pack/pantry snapshots, independently matched Game hash/row/all23 and raw final-state integrity. Selection is diagnostic, not population coverage.',jobs,results})+'\n'),{flag:'wx'});console.log('\nVerified '+results.length+' storage replays.');
}
(process.argv.includes('--child')?child():main()).catch(e=>{console.error(e.stack);process.exitCode=1;});
