'use strict';
// Passive replay evidence. This never draws a probe RNG value at a checkpoint.
const crypto=require('crypto'),gear=require('../gear-usage-audit');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function contextHash(ctx){
 const seen=new WeakMap();
 return sha(JSON.stringify(ctx,function(key,value){
  if(!value||typeof value!=='object')return value;
  if(seen.has(value))return {$ref:seen.get(value)};
  const parent=seen.get(this)||'';seen.set(value,parent+'/'+key);return value;
 }));
}
function entropyObserver(){
 const errors=[],restore=[],streams={};
 for(const [name,owner,key] of [['game',Math,'random'],['clock',Date,'now']]){
  const descriptor=Object.getOwnPropertyDescriptor(owner,key);let current=owner[key],count=0,assignments=0;
  const hash=crypto.createHash('sha256');
  Object.defineProperty(owner,key,{configurable:true,enumerable:descriptor.enumerable,get:()=>current,set(fn){
   assignments++;current=function(...args){const value=Reflect.apply(fn,this,args);
    try{const bytes=Buffer.allocUnsafe(8);bytes.writeDoubleLE(value);hash.update(bytes);count++;}catch(e){errors.push(name+': '+e.message);}
    return value;
   };
  }});
  streams[name]=()=>({count,assignments,sha256:hash.copy().digest('hex')});
  restore.push(()=>Object.defineProperty(owner,key,descriptor));
 }
 let policyCount=0;const policyHash=crypto.createHash('sha256');
 return {errors,attachPolicy(){
  const original=global.__policyRandom;
  if(typeof original!=='function')throw Error('Policy RNG was not seeded before setup');
  global.__policyRandom=function(...args){const value=Reflect.apply(original,this,args);const bytes=Buffer.allocUnsafe(8);bytes.writeDoubleLE(value);policyHash.update(bytes);policyCount++;return value;};
 },snapshot(){return {game:streams.game(),clock:streams.clock(),policy:{count:policyCount,sha256:policyHash.copy().digest('hex')}};},restore(){for(const fn of restore.reverse())fn();}};
}
function traceObserver(G,entropy,prefixCap){
 const rows=[],errors=[];let daily=0,bridge=null;
 return {rows,errors,get bridge(){return bridge;},record(hook,phase,ctx){
  try{
   const stateHash=gear.gameplayHash(G.state);
   rows.push({hook,phase,day:G.state.scholar.day,bearer:G.villagerId,daily,stateHash,contextHash:contextHash(ctx),entropy:entropy.snapshot()});
   if(hook==='upkeep'&&phase==='before'&&daily===prefixCap&&!bridge)
    bridge={stateHash,state:JSON.parse(JSON.stringify(G.state)),day:G.state.scholar.day};
   if(hook==='daily'&&phase==='after')daily++;
  }catch(e){errors.push(hook+'.'+phase+': '+e.message);}
 }};
}
function comparePrefix(short,long){
 const errors=[];
 if(!short.trace?.length||!long.trace?.length)return {ok:false,errors:['Missing observed policy boundaries']};
 if(short.trace.length>long.trace.length)errors.push('Extended run has fewer boundaries');
 for(let i=0;i<short.trace.length;i++)if(JSON.stringify(short.trace[i])!==JSON.stringify(long.trace[i])){errors.push('Boundary differs at '+i);break;}
 // The last short loop still includes sleep, contests and cadence sampling.
 // Match its full final state to the next extended upkeep BEFORE its work.
 const finalMatches=short.terminal.engineOver
  ?short.stateHash===long.stateHash&&long.terminal.engineOver
  :short.stateHash===long.bridge?.stateHash;
 if(!finalMatches)errors.push('Final short state does not match the continued boundary');
 return {ok:!errors.length,errors,boundaries:short.trace.length,finalMatches,
  scope:'Same-source rerun prefix, including observed policy context and RNG/clock streams; no checkpoint restore or hidden closure serialization claim.'};
}
function terminalStatus(G,row,ctx){
 const engineOver=!!G.over,watchdogRoutes=ctx?.timeFreezeCleared||0;
 return {engineOver,won:!!G.won,villageLost:!!G.villageLost,harnessEnd:row.endReason,watchdogRoutes,
  status:!engineOver?'not_terminal':watchdogRoutes?'terminal_with_harness_recovery':G.won?'won':G.villageLost?'community_lost':'ended',
  day:G.state.scholar.day,bearer:G.villagerId};
}
module.exports={contextHash,entropyObserver,traceObserver,comparePrefix,terminalStatus};
