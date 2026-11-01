'use strict';
// Validate retained browser evidence against today's runtime. This does not run
// a browser or claim physical-device/release approval. Regenerate after changes.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),zlib=require('zlib'),V=require('../verify-installed-cache');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function read(root){const dir=path.join(root,'evidence/2026-10-21');return{
 pin:JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'evidence/2026-10-31/published-lifecycle-dc66-npc-weapon-r1.json.gz')))),
 recipe:fs.readFileSync(path.join(dir,'published-lifecycle-r1.cjs'),'utf8').replace(/\r\n/g,'\n'),
 panels:[736,844].map(h=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir,'published-lifecycle-'+h+'-pubdc66-joint-budget-r2.json.gz')))))
};}
function verify(root,data=read(root)){
 const errors=[],check=(ok,message)=>{if(!ok)errors.push(message);},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),{pin,recipe,panels}=data;
 check(pin.commit==='dc66b41364d448816f8f292f58575f723456305a','Published baseline identity');
 check(same(panels.map(p=>p.height),[736,844]),'Both phone heights required');
 for(const p of panels){
  const tag=p.height+': ';check(p.recipeSha256===sha(recipe),tag+'Recipe changed');check(p.oldVersion===pin.version,tag+'Baseline stamp');
  check(Array.isArray(p.errors)&&p.errors.length===0,tag+'Browser errors');check(p.touches?.length>=18&&p.touches.every(t=>t.trusted),tag+'Trusted touch coverage');
  check(same(p.cachesRead.map(c=>c.stage),['published','candidate','candidate-cold','rollback','rollback-cold']),tag+'Cache lifecycle coverage');
  for(const c of p.cachesRead){
   const candidate=c.stage.startsWith('candidate'),build=candidate?p.proofBuild:c.stage==='published'?p.oldVersion:p.rollbackBuild;
   if(candidate){const v=V.verify(c.receipt,root,build);check(v.ok,tag+c.stage+': '+v.errors.join('; '));}
   else{
    const expected={};for(const[key,v]of Object.entries(pin.inputs))expected[key.split(pin.version).join(build)]=v.text?sha(v.text.split(pin.version).join(build)):v.normalizedSha256;
    check(same(Object.keys(c.receipt.inputs).sort(),Object.keys(expected).sort()),tag+c.stage+' historical cache coverage');
    for(const[key,hash]of Object.entries(expected))check(c.receipt.inputs[key]?.normalizedSha256===hash,tag+c.stage+' stale '+key);
    check(c.receipt.controller===true&&c.receipt.build===build,tag+c.stage+' historical worker');
    check(c.receipt.dataRequests?.length>0&&c.receipt.dataRequests.every(k=>new URL(k,'https://proof.invalid').searchParams.get('v')===build),tag+c.stage+' historical boot data');
   }
   const icons=candidate?Object.fromEntries(Object.keys(pin.icons).map(f=>[f,sha(fs.readFileSync(path.join(root,f)))])):pin.icons;
   check(same(c.icons,icons),tag+c.stage+' icon bytes');
  }
  const trace=p.trace,get=label=>trace.find(t=>t.label===label);check(trace.length===13,tag+'State checkpoint coverage');
  for(const mode of ['candidate','rollback']){
   const t=get('native '+mode+' update preserves final hook bytes');check(!!t&&t.afterRaw===t.events?.at(-1)?.raw,tag+mode+' final native checkpoint');
   for(const event of ['beforeunload','pagehide','visibilitychange'])check(t?.events?.some(e=>e.event===event),tag+mode+' missing native '+event);
  }
  const migration=get('candidate loaded full legacy payload')?.fullPayloadDiff;
  check(same(migration,[{path:'corpses.0.scene',beforePresent:false,afterPresent:true,before:null,after:'outside'},{path:'corpses.0.sceneInferred',beforePresent:false,afterPresent:true,before:null,after:'legacy-outside'}]),tag+'Only declared legacy migration may change payload');
  for(const label of ['candidate cold full payload','rollback loaded full candidate payload','rollback cold full payload'])check(same(get(label)?.fullPayloadDiff,[]),tag+label);
  const physical=(a,b)=>['position','world','inside','bearer','kcal','tick','day','inventory','equipment','corpses'].every(k=>same(a?.[k],b?.[k]));
  const candidate=get('candidate physical saw pickup and paid move'),old=get('actual published-build paid movement and pickup'),rolled=get('rollback actual paid movement');
  check(physical(candidate,get('candidate cold offline Continue'))&&physical(candidate,get('published gameplay rollback Continue')),tag+'Candidate ownership/clock continuity');
  check(physical(rolled,get('rollback cold offline Continue')),tag+'Rollback cold continuity');
  check(old?.inventory.some(i=>i.name==='Declared lifecycle ration')&&candidate?.inventory.some(i=>i.itemId==='hand_saw'),tag+'Physical pickup receipts');
  const body=state=>state?.corpses.find(c=>c.name==='Declared published-build carcass');
  check(body(old)?.items[0].units===0&&body(candidate)?.items[1].units===0,tag+'Picked cargo depleted at source');
  check(old?.kcal===2996&&old.tick===10&&candidate?.kcal===2994&&candidate.tick===11&&rolled?.kcal===2992&&rolled.tick===12,tag+'Native paid movement');
 }
 return{ok:errors.length===0,errors};
}
module.exports={read,verify};
