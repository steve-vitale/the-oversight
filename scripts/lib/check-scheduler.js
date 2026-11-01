'use strict';
// Exclusive jobs retain their normal timeout but get an otherwise idle queue.
async function runJobs(jobs,{concurrency,run,onResult=()=>{}}){
 if(!Array.isArray(jobs)||!Number.isSafeInteger(concurrency)||concurrency<1||typeof run!=='function'||typeof onResult!=='function')throw Error('Valid jobs, positive integer concurrency and callbacks required');
 const results=[];
 async function execute(job){const result=await run(job);results.push(result);onResult(result);}
 async function parallel(segment){let next=0;await Promise.all(Array.from({length:Math.min(concurrency,segment.length)},async()=>{while(next<segment.length)await execute(segment[next++]);}));}
 let segment=[];
 for(const job of jobs){
  if(job.tags?.includes('exclusive')){await parallel(segment);segment=[];await execute(job);}
  else segment.push(job);
 }
 await parallel(segment);return results;
}
module.exports={runJobs};
