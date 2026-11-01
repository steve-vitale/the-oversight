'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert/strict'),F=require('../phone-frame-proof-update');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const clean=s=>{const x=JSON.parse(JSON.stringify(s));delete x.saveSeq;return x;};
const profiles={
 late:{recipe:'evidence/2026-10-22/late-table-phone-r3.cjs',fixture:'evidence/2026-10-22/late-table-phone-checkpoint-r1.json.gz',day:660,doors:7},
 nongod:{recipe:'evidence/2026-10-22/nongod-table-phone-r1.cjs',fixture:'evidence/2026-10-22/nongod-table-phone-checkpoint-r1.json.gz',day:148,doors:6},
};
function read(root){
 const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/late-table-phone-proof.json')));
 return {pointer,receipts:pointer.receipts.map(r=>{const b=fs.readFileSync(path.join(root,r.path));return {...r,actualHash:hash(b),data:JSON.parse(z.gunzipSync(b))};})};
}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(v,m)=>{if(!v)errors.push(m);},expected=F.expectedInputs(root);
 check(pointer.schemaVersion===2&&receipts.map(r=>r.case+':'+r.data.height).join(',')==='late:736,late:844,nongod:736,nongod:844','Both phone heights for both earned campaign cases are required');
 for(const r of receipts){
  const d=r.data,p=r.case+':'+d.height+': ',m=d.meta,profile=profiles[r.case];
  if(!profile){check(false,p+'unknown campaign case');continue;}
  const {recipe,fixture}=profile;
  check(r.sha256===r.actualHash,p+'retained receipt bytes');
  check(m.recipeSha256===F.normalized(path.join(root,recipe)),p+'actual current replay recipe');
  check(m.fixtureSha256===hash(fs.readFileSync(path.join(root,fixture))),p+'original unmodified simulated checkpoint');
  check(d.baseDriverSha256===F.normalized(path.join(root,'evidence/2026-10-22/natural-phone-driver-r3.cjs')),p+'actual base input driver');
  check(hash(fs.readFileSync(path.join(root,d.rawTrace.path)))===d.rawTrace.sha256,p+'original complete browser trace retained');
  for(const[f,h]of Object.entries(expected))check(d.network[f]===h,p+'stale or missing loaded source '+f);
  check(d.errors.length===0&&d.commandErrors.length===0,p+'no browser or input failure');
  check(d.touches.length>=10&&d.touches.every(t=>t.trusted)&&m.trustedTouches===d.touches.length,p+'actual trusted phone touches');
  check(d.doors.length===profile.doors&&d.doors.map(o=>o.index).join(',')===Array.from({length:profile.doors},(_,i)=>i).join(','),p+'every offered door reached');
  for(const door of d.doors){
   check(door.rect&&door.rect.y>=0&&door.rect.y+door.rect.h<=d.height&&door.rect.h>=44,p+'reachable door '+door.index);
   check(door.stateHash===d.beforeBrowsing,p+'door browsing changes no saved gameplay '+door.index);
  }
  check(d.beforeBrowsing===d.afterBrowsing,p+'reading all doors is free');
  check((r.case==='late'?m.allSevenDoorsReachable:m.allOfferedDoorsReachable)&&m.browsingFree&&m.midResume,p+'actual complete flow');
  try{assert.deepEqual(clean(d.committed),clean(d.resumed));}catch(e){errors.push(p+'full committed mid-act Continue changed');}
  check(d.resumed.scholar.tableChoices?.options?.length===4,p+'same pending act is usable after Continue');
  check(d.ending.day===profile.day&&/THE BELOVED/.test(d.ending.text)&&!d.ending.tableChoices,p+'actual late-game ending');
  check(!d.afterEnding.hasContinue&&d.afterEnding.tombstoned,p+'completed save cannot resurrect');
  check(d.records.legend?.wins===1&&d.records.unlocked?.['mt-f-beloved']&&d.records.unlocked?.['mt-choice'],p+'win and choice persist after reload');
  if(r.case==='nongod'){
   const empty=v=>Array.isArray(v)&&v.length===0;
   check(empty(m.playerGodsAtEntry),p+'replay observes known empty player godhood');
   for(const stage of ['before','atSeat','ending'])check(empty(d.godhood?.[stage]?.active),p+'known non-god player at '+stage);
   check(empty(d.committed.scholar.godhood?.active)&&empty(d.resumed.scholar.godhood?.active),p+'Continue preserves non-god identity');
  }
  check(d.frames.length>=25&&d.frames.filter(t=>t.playing).length>=20,p+'complete actual play observations');
  check(d.frames.every(t=>!t.playing||(t.scroll[0]===0&&t.scroll[1]===0&&t.scroll[2]<=d.height+1)),p+'one main phone frame');
 }
 return {ok:errors.length===0,errors};
}
function updateMany(root,groups){
 const entries=Object.entries(groups);if(!entries.length)throw Error('At least one campaign pair is required');
 for(const [profile,files]of entries)if(!Object.hasOwn(profiles,profile)||!Array.isArray(files)||files.length!==2)throw Error('Provide two retained receipts for each known campaign case');
 const replaced=new Set(entries.map(([profile])=>profile));
 const receipts=fs.existsSync(path.join(root,'scripts/late-table-phone-proof.json'))?read(root).receipts.map(r=>({...r,case:r.case||'late'})).filter(r=>!replaced.has(r.case)):[];
 for(const [profile,files]of entries)for(const file of files){
  const rel=path.relative(root,path.resolve(file)).replace(/\\/g,'/');if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Retain inside repository');
  const b=fs.readFileSync(path.join(root,rel));receipts.push({case:profile,path:rel,sha256:hash(b),actualHash:hash(b),data:JSON.parse(z.gunzipSync(b))});
 }
 receipts.sort((a,b)=>Object.keys(profiles).indexOf(a.case)-Object.keys(profiles).indexOf(b.case)||a.data.height-b.data.height);
 const pointer={schemaVersion:2,scope:'Two unmodified naturally simulated campaigns at both phone heights: day660 seven doors and day148 non-god six doors, actual Beloved finales, full mid-act Continue and persistent Records. Not all finales, pacifist viability, natural phone campaigns or physical-device clearance.',receipts:receipts.map(({case:campaign,path,sha256})=>({case:campaign,path,sha256}))};
 const result=verify(root,{pointer,receipts});if(!result.ok)throw Error(result.errors.join('\n'));
 const destination=path.join(root,'scripts/late-table-phone-proof.json'),temporary=destination+'.tmp';
 fs.writeFileSync(temporary,JSON.stringify(pointer,null,2)+'\n');fs.renameSync(temporary,destination);return {receipts:receipts.length};
}
function update(root,files,profile='late'){return updateMany(root,{[profile]:files});}
module.exports={read,verify,update,updateMany};
if(require.main===module){const files=process.argv.slice(2);if(files.length!==4)throw Error('Provide late736 late844 nongod736 nongod844 retained receipts');console.log(updateMany(path.resolve(__dirname,'../..'),{late:files.slice(0,2),nongod:files.slice(2)}));}
