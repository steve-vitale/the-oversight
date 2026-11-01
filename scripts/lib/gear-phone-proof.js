'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),{isDeepStrictEqual:same}=require('util'),F=require('../phone-frame-proof-update');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),clean=s=>{const c=structuredClone(s);delete c.saveSeq;return c;};
function read(root){const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/gear-phone-proof.json')));return{pointer,receipts:pointer.receipts.map(r=>{const b=fs.readFileSync(path.join(root,r.path));return{...r,actualHash:hash(b),data:JSON.parse(z.gunzipSync(b))};})};}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(ok,m)=>{if(!ok)errors.push(m);},expected=F.expectedInputs(root),fixtureFile='evidence/2026-10-23/gear-phone-fixtures-r1.json',fixture=JSON.parse(fs.readFileSync(path.join(root,fixtureFile))),keys=[736,844].flatMap(h=>['weapon','armor','stack'].map(s=>h+':'+s));
 check(pointer.schemaVersion===1&&same(receipts.map(r=>r.data.height+':'+r.data.scene),keys),'Both phone heights and all conservation cases');
 const metadata=(item,reference)=>!!item&&Object.entries(reference).filter(([k])=>k!=='units').every(([k,v])=>same(item[k],v));
 for(const r of receipts){const d=r.data,p=d.height+':'+d.scene+': ',scene=fixture.scenes.find(s=>s.name===d.scene),get=l=>d.trace.find(t=>t.label===l),before=get('native prepared Continue'),worn=get('native gear equipped'),removed=get('native gear taken off'),loaded=get('native committed Continue');
  check(r.actualHash===r.sha256,p+'retained bytes');check(d.mode==='after'&&d.errors?.length===0,p+'actual error-free candidate');
  for(const[f,h]of Object.entries(expected))check(d.sourceWitness.networkInputs[f]===h,p+'stale runtime '+f);
  for(const f of ['evidence/2026-10-23/gear-phone-r1.cjs',fixtureFile,'evidence/2026-10-22/combat-turn-network-r1.cjs'])check(d.sourceWitness.recipeInputs[f]===F.normalized(path.join(root,f)),p+'stale recipe/fixture/helper '+f);
  check(d.touches?.length>=7&&d.touches.every(t=>t.trusted)&&d.sourceWitness.trustedTouches?.every(t=>t.trusted),p+'trusted native controls');
  if(!scene||!before||!worn||!removed||!loaded){check(false,p+'complete declared journey');continue;}
  const b=before.state.scholar,w=worn.state.scholar,a=removed.state.scholar,total=s=>(s.inventory||[]).reduce((n,i)=>n+(i.units??1),0)+Object.values(s.equipped||{}).filter(Boolean).length;
  check(metadata(w.equipped[scene.slot],scene.incoming)&&w.equipped[scene.slot].units===1,p+'one whole incoming instance is worn');
  if(scene.old)check(w.inventory.some(i=>metadata(i,scene.old)&&i.units===1),p+'displaced whole instance returns to Pack');
  check(total(b)===total(w)&&total(w)===total(a),p+'physical units conserved through both actions');
  check(!a.equipped[scene.slot]&&a.inventory.filter(i=>i.itemId===scene.incoming.itemId).every(i=>metadata(i,scene.incoming)),p+'Take off retains real mass/ownership/reveals');
  check([w,a].every(s=>s.kcal===b.kcal&&s.dayTicks===b.dayTicks),p+'free equipment moves do not charge food or time');
  check(same(clean(loaded.state),clean(d.checkpoint))&&same(loaded.state.scholar.inventory,a.inventory)&&same(loaded.state.scholar.equipped,a.equipped),p+'whole committed native Continue');
  check(d.trace.every(t=>t.scroll[0]===0&&t.scroll[1]===0&&t.scroll[2]<=d.height+1),p+'one main phone frame');
 }return{ok:!errors.length,errors};
}
function update(root,directory){const receipts=[736,844].flatMap(h=>['weapon','armor','stack'].map(scene=>{const file=path.relative(root,path.resolve(directory,h+'-'+scene+'.json.gz')).replace(/\\/g,'/');if(file.startsWith('..')||path.isAbsolute(file))throw Error('Retain actual receipts inside repository');const b=fs.readFileSync(path.join(root,file)),sha256=hash(b);return{path:file,sha256,actualHash:sha256,data:JSON.parse(z.gunzipSync(b))};})),pointer={schemaVersion:1,scope:'Prepared actual Pack/You replacement, stack, mass/metadata retention and full committed native Continue at both phone heights. Not natural acquisition, succession, whole campaigns or physical-device clearance.',receipts:receipts.map(({path,sha256})=>({path,sha256}))},v=verify(root,{pointer,receipts});if(!v.ok)throw Error(v.errors.join('\n'));fs.writeFileSync(path.join(root,'scripts/gear-phone-proof.json'),JSON.stringify(pointer,null,2)+'\n');return{receipts:receipts.length};}
module.exports={read,verify,update};if(require.main===module)try{console.log(update(path.resolve(__dirname,'../..'),process.argv[2]));}catch(e){console.error(e.stack);process.exitCode=1;}
