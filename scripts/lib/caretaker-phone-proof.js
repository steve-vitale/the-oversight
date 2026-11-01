'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),F=require('../phone-frame-proof-update');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),clean=s=>{const c=structuredClone(s);delete c.saveSeq;return c;},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function read(root){const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/caretaker-phone-proof.json')));return{pointer,receipts:pointer.receipts.map(r=>{const b=fs.readFileSync(path.join(root,r.path));return{...r,actualHash:hash(b),data:JSON.parse(z.gunzipSync(b))};})};}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(v,m)=>{if(!v)errors.push(m);},expected=F.expectedInputs(root),keys=[736,844].flatMap(h=>['growing','hungry','used'].map(s=>h+':'+s));
 check(pointer.schemaVersion===1&&same(receipts.map(r=>r.data.height+':'+r.data.scene),keys),'Both phone heights and three eligibility cases');
 for(const r of receipts){const d=r.data,p=d.height+':'+d.scene+': ',get=l=>d.trace.find(t=>t.label===l),before=get('native prepared Continue'),paid=get('native paid caretaker appointment'),visible=get('visible crop progress'),loaded=get('native committed Continue');
  check(r.sha256===r.actualHash,p+'retained receipt bytes');check(d.mode==='after'&&d.errors?.length===0,p+'actual candidate with no browser errors');
  for(const[f,h]of Object.entries(expected))check(d.sourceWitness.networkInputs[f]===h,p+'stale source '+f);
  for(const f of ['evidence/2026-10-23/caretaker-phone-r1.cjs','evidence/2026-10-23/caretaker-phone-fixtures-r1.json','evidence/2026-10-22/combat-turn-network-r1.cjs'])check(d.sourceWitness.recipeInputs[f]===F.normalized(path.join(root,f)),p+'actual recipe/fixture/helper '+f);
  check(d.touches?.length>=8&&d.touches.every(t=>t.trusted)&&d.sourceWitness.trustedTouches?.every(t=>t.trusted),p+'trusted native controls');
  if(!before||!paid||!visible||!loaded){check(false,p+'actual complete journey');continue;}
  const growth=d.scene==='hungry'?0:4,xp=d.scene==='hungry'?0:2;
  check(paid.state.village.gardenKeeper===d.actor&&loaded.state.village.gardenKeeper===d.actor,p+'actual standing caretaker persists');
  check(paid.state.scholar.dayTicks-before.state.scholar.dayTicks===16&&paid.state.scholar.kcal===before.state.scholar.kcal,p+'native appointment pays16 ticks, not player food');
  check(paid.plots[0].magicGrowth===growth&&(paid.practice?.green_whisper?.xp||0)===xp,p+'own growth and practice, hungry/used limits');
  if(d.scene==='growing'){
   check(paid.state.village.trust[d.actor]===before.state.village.trust[d.actor]+1,p+'normal garden cooperation credit');
   check((paid.state.village.memory?.[d.actor]||[]).some(m=>m.t==='task'&&m.note==='garden (assigned)'&&m.day===paid.state.scholar.day),p+'completed work history');
  }
  check((d.scene==='growing'?before.plots[0].magicGrowth===0:before.plots[0].magicGrowth===growth),p+'original prepared eligibility');
  check(visible.text?.includes('Crop details and costs')&&visible.text?.includes('ripe in'),p+'actual crop progress is shown');
  check(loaded.plots[0].magicGrowth===growth&&same(clean(loaded.state),clean(d.checkpoint)),p+'whole native committed Continue');
  check(d.trace.every(t=>t.scroll[0]===0&&t.scroll[1]===0&&t.scroll[2]<=d.height+1&&t.rects.every(r=>r.y>=0&&r.bottom<=d.height)),p+'single main phone frame');
 }return{ok:!errors.length,errors};
}
function update(root,directory){const receipts=[736,844].flatMap(h=>['growing','hungry','used'].map(scene=>{const file=path.relative(root,path.resolve(directory,h+'-'+scene+'.json.gz')).replace(/\\/g,'/');if(file.startsWith('..')||path.isAbsolute(file))throw Error('Retain actual receipts inside repository');const b=fs.readFileSync(path.join(root,file)),sha256=hash(b);return{path:file,sha256,actualHash:sha256,data:JSON.parse(z.gunzipSync(b))};})),pointer={schemaVersion:1,scope:'Prepared native appointment at both phone heights: growing/hungry/used duty, visible crop progress and full committed Continue. NPC spell payment is separately proven by shared core test; appointment also advances ordinary metabolism. Not natural acquisition/campaign/device clearance.',receipts:receipts.map(({path,sha256})=>({path,sha256}))},v=verify(root,{pointer,receipts});if(!v.ok)throw Error(v.errors.join('\n'));fs.writeFileSync(path.join(root,'scripts/caretaker-phone-proof.json'),JSON.stringify(pointer,null,2)+'\n');return{receipts:receipts.length};}
module.exports={read,verify,update};if(require.main===module)try{console.log(update(path.resolve(__dirname,'../..'),process.argv[2]));}catch(e){console.error(e.stack);process.exitCode=1;}
