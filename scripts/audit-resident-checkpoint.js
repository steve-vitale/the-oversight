#!/usr/bin/env node
'use strict';
// Complement the continuous-process panels with an actual saved admission
// checkpoint and an independent cold process. No new action, kit or person.
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),crypto=require('crypto'),assert=require('assert/strict');
const B=require('./balance-panel'),gear=require('./gear-usage-audit');
const arg=(key,fallback)=>{const i=process.argv.indexOf('--'+key);return i<0?fallback:process.argv[i+1];};
const root=path.resolve(arg('root',path.join(__dirname,'..'))),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
function storage(entries=[]){const map=new Map(entries);globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),key:i=>[...map.keys()][i]??null,get length(){return map.size;}};return map;}
function census(G){const v=G.state.village;return(v.roster||[]).filter(id=>id!==G.villagerId&&id!==G.state.scholar.villagerId&&(v.health?.[id]??100)>0).map(id=>{const person=(G.data.villagers||[]).find(p=>p.id===id);return{id,body:person&&!person.dead?clone(person):null};});}
async function child(){
 const mode=arg('child',null),seed=Number(arg('seed',7)),policy=arg('policy','maker'),iterations=Number(arg('iterations',80)),file=arg('checkpoint',null),store=storage();
 if(mode==='cold'){
  const input=JSON.parse(z.gunzipSync(fs.readFileSync(file)));for(const[k,v]of input.storage)store.set(k,v);
  const{Game:G}=await require(path.join(root,'scripts/sim-harness')).loadGame({seed,fullTelemetry:false});assert(G.load(input.key),'Actual saved admission must load');
  const actual=census(G),byId=new Map(actual.map(p=>[p.id,p.body]));
  const changes=input.people.map(p=>({id:p.id,warmKnown:p.body!==null,coldKnown:byId.get(p.id)!=null,equal:JSON.stringify(p.body)===JSON.stringify(byId.get(p.id)??null)}));
  console.log('@@CHECKPOINT@@'+JSON.stringify({changes,scope:'Exact canonical bodies at one actual committed admission checkpoint; not future survival or complete save equivalence.'}));return;
 }
 assert(['on','off'].includes(mode));const observed=mode==='on',H=require(path.join(root,'scripts/sim-harness')),S=require(path.join(root,'scripts/sweep-compare')),base=S.POLICY_REGISTRY[policy];assert(base,'Known policy required');let G,checkpoint=null,initial;
 const source=B.manifest(root),wrapped={...base};wrapped.setup=function(g,ctx){G=g;initial=new Set(g.state.village.roster||[]);if(observed){const save=g.save;g.save=function(...args){const result=save.apply(this,args);if(!checkpoint&&result===true&&!g.over&&!g.tbfight){const people=census(g),admitted=people.filter(p=>!initial.has(p.id)&&p.body);const key=g.state.runKey,raw=store.get(key);if(admitted.length&&raw){const saved=JSON.parse(raw);if(admitted.every(p=>(saved.village.roster||[]).includes(p.id)))checkpoint={key,storage:[...store],people,admitted:admitted.map(p=>p.id),day:saved.scholar.day,part:saved.run?.dayPart};}}return result;};}return base.setup?.call(this,g,ctx);};S.POLICY_REGISTRY[policy]=wrapped;
 const report=await H.quietLog(()=>S.runComparison({seeds:[seed],policies:[policy],days:iterations,origin:'Columbus, Ohio'}));assert(G);assert.deepEqual(B.manifest(root),source,'Source changed');
 const neutral={row:report.runs[0],stateHash:gear.gameplayHash(G.state),rngTail:[Math.random(),Math.random(),Math.random()]};
 if(checkpoint)fs.writeFileSync(file,z.gzipSync(JSON.stringify(checkpoint)),{flag:'wx'});
 console.log('@@CHECKPOINT@@'+JSON.stringify({neutral,checkpoint:checkpoint?{day:checkpoint.day,part:checkpoint.part,admitted:checkpoint.admitted,people:checkpoint.people.length}:null}));
}
async function main(){
 if(arg('child',null))return child();const output=arg('out',null);assert(output,'Use --out <fresh directory>');assert(!fs.existsSync(output),'Fresh output required');fs.mkdirSync(output,{recursive:true});
 const seeds=arg('seeds','7,42').split(',').map(Number),policies=arg('policies','maker,caregiver').split(','),iterations=Number(arg('iterations',80));assert(seeds.length&&seeds.every(Number.isSafeInteger)&&new Set(seeds).size===seeds.length);assert(Number.isSafeInteger(iterations)&&iterations>0);assert(policies.length&&new Set(policies).size===policies.length);
 const source=B.manifest(root),report={schemaVersion:1,root,sources:source,auditSha256:sha(fs.readFileSync(__filename)),options:{seeds,policies,iterations},cases:[],scope:'One first committed admission checkpoint per natural policy case. No admission means unexposed, not a pass. Continuous terminal row/state/RNG neutrality checked independently. Not balance, mobile or ending clearance.'};
 async function run(mode,policy,seed,file){return new Promise((resolve,reject)=>{const args=[__filename,'--child',mode,'--root',root,'--seed',String(seed),'--policy',policy,'--iterations',String(iterations),'--checkpoint',file],child=cp.spawn(process.execPath,args,{cwd:root,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',reject);child.on('close',code=>{fs.writeFileSync(path.join(output,policy+'-'+seed+'-'+mode+'.log.gz'),z.gzipSync(stdout+'\nSTDERR\n'+stderr));if(code!==0)return reject(Error(mode+' failed: '+stderr.slice(-4000)));const line=stdout.split('\n').find(l=>l.startsWith('@@CHECKPOINT@@'));assert(line,'Missing result');resolve(JSON.parse(line.slice('@@CHECKPOINT@@'.length)));});});}
 for(const policy of policies)for(const seed of seeds){const file=path.resolve(output,policy+'-'+seed+'-actual-save.json.gz'),on=await run('on',policy,seed,file),off=await run('off',policy,seed,file);assert.deepEqual(on.neutral,off.neutral,'Checkpoint observer altered real campaign');const cold=on.checkpoint?await run('cold',policy,seed,file):null;report.cases.push({policy,seed,neutral:true,checkpoint:on.checkpoint,cold,coverage:cold?'observed':'no_admission_checkpoint'});fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(policy+':'+seed+' '+(cold?cold.changes.filter(p=>p.warmKnown&&!p.equal).length+' changed known bodies':'unexposed'));}
 assert.deepEqual(B.manifest(root),source);report.sourceStable=true;fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
