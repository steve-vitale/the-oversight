'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),F=require('../phone-frame-proof-update');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function read(root){const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/activation-preview-proof.json')));return{pointer,receipts:pointer.receipts.map(r=>{const bytes=fs.readFileSync(path.join(root,r.path));return{...r,actualHash:digest(bytes),data:JSON.parse(z.gunzipSync(bytes))};})};}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(ok,message)=>{if(!ok)errors.push(message);},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),keys=new Set(),expected=F.expectedInputs(root);
 check(pointer.schemaVersion===1&&receipts.length===10,'Ten current phone activation witnesses');
 for(const r of receipts){const d=r.data,label=d.height+':'+d.scene,w=d.sourceWitness,get=name=>d.trace.find(t=>t.label===name),before=get('native prepared Continue'),paid=get('native activation'),loaded=get('native full-payload Continue'),cancel=get('cancelled reader');
  check(!keys.has(label),'Duplicate '+label);keys.add(label);check(r.sha256===r.actualHash,label+' retained bytes');check(d.errors.length===0,label+' browser errors');
  check(w?.trustedTouches?.length>=3&&w.trustedTouches.every(t=>t.trusted),label+' trusted touch');
  for(const[file,hash]of Object.entries(expected))check(w?.networkInputs?.[file]===hash,label+' stale network '+file);
  for(const file of ['evidence/2026-10-22/activation-preview-phone-r1.cjs','evidence/2026-10-22/activation-preview-fixtures-r2.json','evidence/2026-10-22/combat-turn-network-r1.cjs'])check(w?.recipeInputs?.[file]===F.normalized(path.join(root,file)),label+' stale preparation/recipe');
  check(same(before.state,cancel.state),label+' reader is free');check(same(loaded.state,d.checkpoint),label+' full native Continue');
  const kcal=Number(/Cost: (\d+) kcal/.exec(d.card)?.[1]);check(Number.isFinite(kcal)&&before.state.scholar.kcal-paid.state.scholar.kcal===kcal,label+' actual food bill');
  check(!d.card.includes('OVERCHARGED')&&(d.scene==='stoke'?!d.card.includes('1 action'):d.card.includes('1 action')),label+' truthful action/bonus label');
  const player=state=>state.fight.fighters.find(f=>f.key==='p');check(player(paid).acted===(d.scene!=='stoke')&&player(loaded).acted===player(paid).acted,label+' action preserved');
  check(d.trace.every(s=>s.scroll[0]===0&&s.scroll[1]===0&&s.scroll[2]<=d.height+1&&s.rects.every(b=>b.y>=0&&b.bottom<=d.height)),label+' one phone frame');
  const foe=before.fight.fighters.find(f=>f.kind==='monster');check(paid.fight.fighters.find(f=>f.key===foe.key).hp===foe.hp,label+' activation does not secretly strike');
  if(d.scene!=='stoke'){const b=d.blocked;check(b?.visible===true&&typeof b.expected==='string'&&!!b.expected&&b.text?.includes(b.expected)&&b.font>=12&&b.rect?.y>=0&&b.rect.y+b.rect.height<=d.height,label+' canonical readable blocked reason');}
  if(d.scene==='stoke')check(player(get('Strike after native free cast')).acted,label+' free cast leaves actual Strike usable');
  if(d.scene==='aim')check(paid.state.scholar.aimBonus?.mult===2.5&&same(paid.state.scholar.aimBonus,loaded.state.scholar.aimBonus)&&!get('native aimed Strike').state.scholar.aimBonus,label+' stored aim used by actual next Strike');
  if(d.scene==='medicine')check(paid.state.scholar.health>before.state.scholar.health,label+' real healing');
 }
 for(const h of [736,844])for(const scene of ['stance-unknown','stance-known','aim','medicine','stoke'])check(keys.has(h+':'+scene),'Missing '+h+scene);
 return{ok:errors.length===0,errors};
}
function update(root,revision){if(!/^[a-zA-Z0-9-]+$/.test(revision||''))throw Error('A retained replay revision is required');const receipts=[];for(const h of [736,844])for(const scene of ['stance-unknown','stance-known','aim','medicine','stoke']){const file=`evidence/2026-10-22/activation-preview-${h}-${scene}-${revision}.json.gz`,bytes=fs.readFileSync(path.join(root,file)),hash=digest(bytes);receipts.push({path:file,sha256:hash,actualHash:hash,data:JSON.parse(z.gunzipSync(bytes))});}const pointer={schemaVersion:1,scope:'Prepared native touch activations and native pagehide/Continue, not immediate force-kill durability or natural attainment.',receipts:receipts.map(({path,sha256})=>({path,sha256}))},result=verify(root,{pointer,receipts});if(!result.ok)throw Error(result.errors.join('\n'));const file=path.join(root,'scripts/activation-preview-proof.json');fs.writeFileSync(file+'.tmp',JSON.stringify(pointer,null,2)+'\n');fs.renameSync(file+'.tmp',file);return{receipts:receipts.length};}
module.exports={read,verify,update};
if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'../..'),process.argv[2])));}catch(e){console.error(e.message);process.exitCode=1;}
