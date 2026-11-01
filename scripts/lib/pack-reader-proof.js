'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),F=require('../phone-frame-proof-update');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const gameplay=s=>{const c=structuredClone(s);delete c.saveSeq;return c;};
function read(root){const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/pack-reader-proof.json')));return{pointer,receipts:pointer.receipts.map(r=>{const b=fs.readFileSync(path.join(root,r.path));return{...r,actualHash:hash(b),data:JSON.parse(z.gunzipSync(b))};})};}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(ok,m)=>{if(!ok)errors.push(m);},expected=F.expectedInputs(root);
 check(pointer.schemaVersion===2&&receipts.length===2,'Two actual pack witnesses with authored outcome evidence');check(same(receipts.map(r=>r.data.height),[736,844]),'Both phone heights');
 for(const r of receipts){const d=r.data,get=l=>d.trace.find(t=>t.label===l),start=get('unmodified natural checkpoint Continue'),opened=get('Pack open'),before=get('deep unknown item before native test'),after=get('native cautious test'),loaded=get('native pagehide and Continue'),label=d.height+': ';
  check(r.actualHash===r.sha256,label+'retained bytes');check(d.mode==='after'&&d.errors.length===0,label+'browser result');check(d.touches.length>3&&d.touches.every(t=>t.trusted),label+'trusted touches');
  for(const[f,h]of Object.entries(expected))check(d.responses[f]===h,label+'stale runtime '+f);
  check(d.recipeSha256===F.normalized(path.join(root,'evidence/2026-10-22/pack-reader-phone-r1.cjs')),label+'changed recipe');check(d.fixtureSha256===hash(fs.readFileSync(path.join(root,'evidence/2026-10-22/natural-phone-discovery-r1-checkpoint.json.gz'))),label+'changed original checkpoint');
  check(same(start.state,opened.state)&&same(start.state,before.state),label+'free browsing');check(before.body.scroll>0&&after.body.scroll>0,label+'deep reader context survives');
  const elapsed=after.state.scholar.dayTicks-before.state.scholar.dayTicks;
  const sick=(after.log||[]).some(t=>/^Your stomach knots an hour later\.|^By evening you are thoroughly, educationally sick\./.test(t));
  const clean=(after.log||[]).some(t=>/^The meal sits fine\./.test(t));
  check([16,24,40,64].includes(elapsed)&&sick!==clean&&(sick||elapsed===64)&&before.state.scholar.kcal-after.state.scholar.kcal===(sick?200:0)&&after.state.codex.plants.jewelweed.tested==='avoid',label+'real authored stopping stage, sickness outcome and exact payment');
  check(d.buttons.every(b=>b.width>=44&&b.height>=44)&&d.buttons.some(b=>b.width<180),label+'compact touch targets');
  check(same(gameplay(loaded.state),gameplay(d.checkpoint))&&same(loaded.state.scholar,after.state.scholar)&&loaded.bearer===after.bearer,label+'native committed Continue');
  check(d.trace.every(t=>t.scroll[0]===0&&t.scroll[1]===0&&t.scroll[2]<=d.height+1),label+'one main phone frame');
 }return{ok:errors.length===0,errors};
}
function update(root,revision='r1'){if(!/^[a-z0-9-]+$/i.test(revision))throw Error('Fresh retained revision required');const receipts=[736,844].map(h=>{const file=`evidence/2026-10-22/pack-reader-${h}-${revision}.json.gz`,b=fs.readFileSync(path.join(root,file)),sha256=hash(b);return{path:file,sha256,actualHash:sha256,data:JSON.parse(z.gunzipSync(b))};}),pointer={schemaVersion:2,scope:'Actual natural checkpoint replay: deep Pack test, compact targets, free browsing, authored sickness200kcal or completed symptom-free0kcal outcome and native pagehide/Continue. No campaign completion/balance equivalence.',receipts:receipts.map(({path,sha256})=>({path,sha256}))},result=verify(root,{pointer,receipts});if(!result.ok)throw Error(result.errors.join('\n'));const f=path.join(root,'scripts/pack-reader-proof.json');fs.writeFileSync(f+'.tmp',JSON.stringify(pointer,null,2)+'\n');fs.renameSync(f+'.tmp',f);return{receipts:receipts.length};}
module.exports={read,verify,update};if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'../..'),process.argv[2]||'r1')));}catch(e){console.error(e.stack);process.exitCode=1;}
