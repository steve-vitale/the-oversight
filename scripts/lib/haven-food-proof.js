'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),F=require('../phone-frame-proof-update');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),gameplay=s=>{const x=structuredClone(s);delete x.saveSeq;return x;};
function read(root){const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/haven-food-proof.json')));return{pointer,receipts:pointer.receipts.map(r=>{const b=fs.readFileSync(path.join(root,r.path));return{...r,actualHash:hash(b),data:JSON.parse(z.gunzipSync(b))};})};}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(c,m)=>{if(!c)errors.push(m);},expected=F.expectedInputs(root),cases=[736,844].flatMap(h=>['recorded','empty','zero-draw','no-history'].map(k=>k+':'+h));
 check(pointer.schemaVersion===1&&same(receipts.map(r=>r.data.kind+':'+r.data.height),cases),'All four actual record cases at both phone heights');
 const fixtureHash=hash(fs.readFileSync(path.join(root,'evidence/2026-10-22/natural-phone-d64-r2-checkpoint.json.gz'))),recipeHash=F.normalized(path.join(root,'evidence/2026-10-22/haven-food-phone-r1.cjs'));
 for(const r of receipts){const d=r.data,p=d.kind+':'+d.height+': ',get=l=>d.trace.find(t=>t.label===l),closed=get('pantry record visible'),before=get('before opening record'),opened=get('record opened with touch'),title=get('native pagehide then title'),loaded=get('native Continue'),reopened=get('saved food record reopened'),readable=get('record readable after native swipe'),rv=readable?.recordView;
  check(r.actualHash===r.sha256,p+'retained receipt bytes');check(d.mode==='after'&&d.errors.length===0,p+'actual browser success');check(d.touches.length>=5&&d.touches.every(t=>t.trusted),p+'trusted touch');
  for(const[f,h]of Object.entries(expected))check(d.responses[f]===h,p+'stale runtime '+f);
  check(d.recipeSha256===recipeHash&&d.fixtureSha256===fixtureHash,p+'current recipe and original natural checkpoint');
  check(!/feeds itself|shortfall|mouths need/.test(closed.text),p+'no invented sufficiency or shortfall');
  if(d.kind==='recorded')check(/39\.7 Mcal/.test(closed.stock)&&/about 5 days/.test(closed.stock)&&/1 recorded day/.test(closed.record)&&/23\.4 Mcal/.test(opened.record)&&/89 kcal/.test(opened.record)&&/6\.8 Mcal/.test(opened.record)&&/includes private food/.test(opened.record),p+'actual private food and pantry accounting remain distinct');
  if(d.kind==='empty')check(/empty/.test(closed.stock)&&/HUNGRY day 4/.test(closed.stock)&&/0 kcal/.test(opened.record)&&!/800 kcal/.test(opened.record),p+'empty and zero consumption are honest');
  if(d.kind==='zero-draw')check(/no net meal use recorded/.test(closed.stock)&&!/about|infinite|999/.test(closed.stock),p+'zero draw cannot prove food security');
  if(d.kind==='no-history')check(/meal history not recorded/.test(closed.stock)&&!/about/.test(closed.stock)&&/not recorded/.test(opened.record)&&!/8 Mcal|100 Mcal/.test(opened.record),p+'missing history stays unknown');
  check(same(gameplay(before.state),gameplay(opened.state)),p+'record disclosure costs no resources or time');
  check(rv&&rv.height>0&&rv.top>=Math.max(0,rv.readerTop)&&rv.bottom<=Math.min(d.height,rv.readerBottom),p+'whole meal record is actually visible inside its phone reader');
  check(readable&&same(gameplay(before.state),gameplay(readable.state)),p+'reading after native swipe remains free');
  const key=Object.keys(title.storage).find(k=>k.startsWith('scattering-save-v1-'));
  check(key&&same(gameplay(JSON.parse(title.storage[key])),gameplay(loaded.state)),p+'full committed native Continue');
  check(reopened.stock===closed.stock,p+'saved record renders consistently');
  check(d.trace.filter(t=>t.state).every(t=>t.scroll[0]===0&&t.scroll[1]===0&&t.scroll[2]<=d.height+1),p+'one main phone frame');
 }
 return{ok:errors.length===0,errors};
}
function update(root,revision){if(!/^[a-z0-9-]+$/i.test(revision||''))throw Error('Fresh retained revision required');const receipts=[736,844].flatMap(h=>['recorded','empty','zero-draw','no-history'].map(k=>{const file=`evidence/2026-10-22/haven-food-native-${revision}/${k}-${h}.json.gz`,b=fs.readFileSync(path.join(root,file)),sha256=hash(b);return{path:file,sha256,actualHash:sha256,data:JSON.parse(z.gunzipSync(b))};})),pointer={schemaVersion:1,scope:'Actual natural checkpoint plus prepared empty/zero/missing-history counterexamples; native record touch, no payment, full committed Continue and current source bytes. Not a natural famine or physical-device clearance.',receipts:receipts.map(({path,sha256})=>({path,sha256}))},v=verify(root,{pointer,receipts});if(!v.ok)throw Error(v.errors.join('\n'));fs.writeFileSync(path.join(root,'scripts/haven-food-proof.json'),JSON.stringify(pointer,null,2)+'\n');return{receipts:receipts.length};}
module.exports={read,verify,update};

if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'../..'),process.argv[2])));}catch(e){console.error(e.stack);process.exitCode=1;}
