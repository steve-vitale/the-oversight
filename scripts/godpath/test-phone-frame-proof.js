'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),K=require('./lib'),P=require('../phone-frame-proof-update'),T=K.reporter('Phone frame proof');
try{
 const proof=JSON.parse(fs.readFileSync(path.join(K.ROOT,'scripts/phone-frame-proof.json'),'utf8'));
 T.ok('the actual executed adapter, journey and original fixtures are declared',proof.schemaVersion===2&&Object.entries(P.replayInputs(K.ROOT)).every(([rel,hash])=>proof.sources[rel]===hash));
 T.ok('both actual target phone sizes are retained',proof.receipts.length===2&&proof.receipts.map(r=>r.height).sort().join(',')==='736,844');
 const stale=Object.keys(proof.sources).filter(rel=>P.normalized(path.join(K.ROOT,rel))!==proof.sources[rel]);
 T.ok('every retained browser input matches current source',stale.length===0,stale);
 T.ok('all current boot inputs are covered',Object.keys(P.expectedInputs(K.ROOT)).every(rel=>proof.sources[rel]));
 T.ok('receipt identity declares portable text normalization',proof.receiptHashNormalization==='lf-v1');
 for(const receipt of proof.receipts){
  const bytes=fs.readFileSync(path.join(K.ROOT,receipt.path));
  T.ok('retained receipt hash '+receipt.height,P.normalized(path.join(K.ROOT,receipt.path))===receipt.sha256);
  T.ok('actual touch, frame, stable choices and Wait/escape '+receipt.height,P.validateReceipt(K.ROOT,JSON.parse(bytes))===receipt.height);
 }
 const actual=JSON.parse(fs.readFileSync(path.join(K.ROOT,proof.receipts[0].path),'utf8'));
 function rejects(change){const bad=structuredClone(actual);change(bad);try{P.validateReceipt(K.ROOT,bad);return false;}catch(e){return true;}}
 T.ok('missing executed-recipe identity cannot pass',rejects(r=>{delete r.replayInputs;}));
 T.ok('changed executed journey cannot pass',rejects(r=>{r.replayInputs['evidence/2026-10-19/release-contact2-frame-replay-r3.js']='0'.repeat(64);}));
 T.ok('a substituted original combat save cannot pass',rejects(r=>{r.replayInputs['evidence/2026-10-18/mobile-combat-pagehide-r2.json']='0'.repeat(64);}));
 T.ok('the old long scrolling layout cannot pass this gate',rejects(r=>{r.trace[0].scroll[2]=3693;}));
 T.ok('a board clipped behind the message area cannot pass this gate',rejects(r=>{r.trace[0].rects['.detail'].bottom=r.trace[0].rects['.ord-narration'].y+25;}));
 T.ok('stale browser code cannot pass by showing a new build label',rejects(r=>{const key=Object.keys(r.networkInputs).find(k=>k.startsWith('/src/js/app.js'));r.networkInputs[key].normalizedSha256='0'.repeat(64);}));
 T.ok('reply paging cannot quietly consume resources',rejects(r=>{r.trace.find(t=>t.label==='paged choices').kcal--;}));
}catch(e){T.ok('current phone evidence is required; follow MOBILE-PLAYTEST.md',false,e.message);}
T.done();
