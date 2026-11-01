'use strict';
const K=require('./lib'),{runJobs}=require('../lib/check-scheduler'),T=K.reporter('Check queue isolation');
(async()=>{
 const jobs=[{id:'a'},{id:'b'},{id:'clock',tags:['exclusive']},{id:'second',tags:['exclusive']},{id:'c'},{id:'d'}],active=new Set(),events=[],releases=new Map(),published=[];
 const pending=runJobs(jobs,{concurrency:2,run:job=>{events.push({id:job.id,active:[...active]});active.add(job.id);return new Promise(resolve=>releases.set(job.id,()=>{active.delete(job.id);resolve({id:job.id,code:job.id==='clock'?1:0});}));},onResult:r=>published.push(r)});
 const tick=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};await tick();
 T.ok('ordinary work starts with bounded parallelism',active.size===2&&active.has('a')&&active.has('b'));
 releases.get('a')();await tick();T.ok('exclusive work waits for every earlier running job',active.size===1&&active.has('b')&&!releases.has('clock'));
 releases.get('b')();await tick();T.ok('exclusive work starts alone after the queue drains',active.size===1&&active.has('clock')&&events.find(e=>e.id==='clock').active.length===0&&!releases.has('c'));
 releases.get('clock')();await tick();T.ok('a failing exclusive result stays failed and the next exclusive job is isolated',published.some(r=>r.id==='clock'&&r.code===1)&&active.size===1&&active.has('second')&&events.find(e=>e.id==='second').active.length===0);
 releases.get('second')();await tick();T.ok('parallel work resumes after exclusive completion',active.size===2&&active.has('c')&&active.has('d'));
 releases.get('c')();releases.get('d')();const result=await pending;
 T.ok('every job and failure is retained exactly once',result.length===jobs.length&&new Set(result.map(r=>r.id)).size===jobs.length&&result.filter(r=>r.code!==0).length===1&&published.length===jobs.length&&active.size===0);
 const empty=await runJobs([],{concurrency:2,run:()=>{throw Error('empty queue ran');}});T.ok('empty filtered queues run nothing',empty.length===0);
 for(const concurrency of [0,-1,1.5,NaN]){let rejected=false;try{await runJobs(jobs,{concurrency,run:()=>{throw Error('must validate first');}});}catch(e){rejected=/positive integer/.test(e.message);}T.ok('invalid concurrency '+concurrency+' cannot silently skip checks',rejected);}
 let rejected=false;try{await runJobs([{tags:['exclusive']}],{concurrency:2,run:()=>{throw Error('runner failure');}});}catch(e){rejected=e.message==='runner failure';}T.ok('a runner exception rejects the gate instead of producing green',rejected);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
