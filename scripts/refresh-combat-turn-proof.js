#!/usr/bin/env node
'use strict';
// Real existing phone fights/reloads/readers, with an owned preview and fresh
// evidence. No fixture grants, assertion rewrites or receipt relabeling.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),http=require('http'),R=require('./refresh-phone-proofs'),F=require('./phone-frame-proof-update'),B=require('./balance-panel');
const ROOT=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),folder='evidence/2026-10-22/';
const recipes=['play','resume','reader'].map(kind=>folder+'combat-turn-'+kind+'-r1.cjs');
const inputs=[...recipes,folder+'combat-turn-network-r1.cjs',folder+'combat-turn-fixtures-r4.json','scripts/refresh-combat-turn-proof.js','scripts/refresh-phone-proofs.js','scripts/phone-frame-proof-update.js','scripts/combat-turn-proof-update.js','scripts/lib/combat-turn-proof.js','scripts/godpath/test-combat-turn-proof.js','sw.js','manifest.json','version.json'];
function snapshot(root){return{runtime:B.manifest(root),browser:F.expectedInputs(root),workflow:Object.fromEntries(inputs.map(f=>[f,F.normalized(path.join(root,f))]))};}
function plan(root,revision,out){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(revision||''))throw Error('A fresh simple revision is required');
 if(!out)throw Error('A new evidence job directory is required');
 const directory=R.ownedOutput(root,out);if(fs.existsSync(directory))throw Error('Existing output cannot be adopted');
 for(const f of fs.readdirSync(path.join(root,folder)))if(/^combat-turn-(play|resume|reader)-/.test(f)&&f.includes('-'+revision))throw Error('Revision already has retained combat artifacts: '+f);
 const steps=[...recipes.map((script,i)=>({id:['play','resume','reader'][i],script,args:[revision]})),{id:'update',script:'scripts/combat-turn-proof-update.js',args:[revision]},{id:'gate',script:'scripts/godpath/test-combat-turn-proof.js',args:[]}];
 return{root,revision,out:directory,steps,source:snapshot(root),scope:'Six actual prepared phone fights through endings, four native announced/resolved reloads and two asynchronous selected readers at390x736/844. Does not establish physical devices, all enemies, natural acquisition, a same-body Deer win or installed lifecycle.'};
}
const probe=origin=>new Promise(resolve=>{const u=new URL(origin),q=http.get({hostname:u.hostname,port:u.port,path:'/version.json',agent:false},res=>{res.resume();res.on('end',()=>resolve({code:'still_serving',status:res.statusCode}));});q.on('error',e=>resolve({code:e.code}));});
async function run(p){
 const identity=JSON.stringify(p.source),guard=()=>{if(JSON.stringify(snapshot(p.root))!==identity)throw Error('Combat proof inputs changed during execution');},pointer=path.join(p.root,'scripts/combat-turn-proof.json'),oldPointer=hash(fs.readFileSync(pointer)),report={schemaVersion:1,status:'running',started:new Date().toISOString(),revision:p.revision,sourceDigest:hash(identity),steps:[],scope:p.scope};
 guard();R.createJobDirectory(p.out);const save=()=>fs.writeFileSync(path.join(p.out,'report.json'),JSON.stringify(report,null,2)+'\n');save();let preview;
 try{
  guard();preview=await R.createPreview(p.root);report.origin=preview.origin;save();
  for(const step of p.steps){guard();const log=path.join(p.out,step.id+'.log'),fd=fs.openSync(log,'wx'),row={...step,started:new Date().toISOString(),log:path.relative(p.root,log).replace(/\\/g,'/')};report.steps.push(row);
   const ending=await new Promise((resolve,reject)=>{const child=cp.spawn(process.execPath,[step.script,...step.args],{cwd:p.root,env:{...process.env,PHONE_PROOF_ORIGIN:preview.origin},stdio:['ignore',fd,fd]});fs.closeSync(fd);row.pid=child.pid;save();process.stdout.write(JSON.stringify({id:step.id,pid:child.pid,log:row.log})+'\n');child.on('error',reject);child.on('close',(code,signal)=>resolve({code,signal}));});
   Object.assign(row,ending,{finished:new Date().toISOString()});save();if(ending.code!==0)throw Error('Actual combat '+step.id+' failed; retain its pilot and log');guard();
  }
  report.status='complete';report.sourceStable=true;
 }catch(e){report.status='failed';report.error=e.stack;report.sourceStable=JSON.stringify(snapshot(p.root))===identity;}
 finally{if(preview){await preview.close();report.previewProbe=await probe(preview.origin);if(report.previewProbe.code!=='ECONNREFUSED'){report.status='failed';report.error=(report.error||'')+'\nOwned preview did not close';}}report.pointerChanged=hash(fs.readFileSync(pointer))!==oldPointer;report.finished=new Date().toISOString();save();}
 return report;
}
module.exports={plan,run,snapshot};
if(require.main===module)(async()=>{const args=process.argv.slice(2);if(args[0]==='--help'){console.log('node scripts/refresh-combat-turn-proof.js <fresh-revision> evidence/<date>/<fresh-job> [--plan | --run]\nDefault plans without writing. Run requires configured Playwright/msedge. Existing recipes, all12 cases, source guards and real updater/gate are mandatory.');return;}if(args.length<2||args.length>3||args[2]&&!['--run','--plan'].includes(args[2]))throw Error('Expected revision, new evidence output, and optional --run/--plan');const p=plan(ROOT,args[0],args[1]);if(args[2]!=='--run'){console.log(JSON.stringify({...p,root:undefined,source:undefined,sourceDigest:hash(JSON.stringify(p.source)),action:'plan only'},null,2));return;}const result=await run(p);console.log(JSON.stringify({status:result.status,sourceStable:result.sourceStable,steps:result.steps.length,previewProbe:result.previewProbe}));if(result.status!=='complete')process.exitCode=1;})().catch(e=>{console.error(e.stack);process.exitCode=1;});
