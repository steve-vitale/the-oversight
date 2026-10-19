#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),B=require('./build-offline-assets');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const normalized=file=>sha(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'));
const stages=['ordinary','Pack open','refused drink','Menu','Place','movement closes tools','replacement controls','person card','conversation choices','paged choices','real reply','resumed Deer','combat actions open','zero moves one action','Wait resolved','actual edge escape'];
function expectedInputs(root){
 const rels=B.collect(root).assets.filter(u=>/\.(js|css)(?:\?|$)/.test(u)).map(u=>u.split('?')[0].replace(/^\.\//,''));
 const game=fs.readFileSync(path.join(root,'src/js/game.js'),'utf8'),init=game.slice(game.indexOf('    async init()'),game.indexOf('    // ============ REGIONS'));
 for(const m of init.matchAll(/['"]([^'"]+\.json)['"]/g))rels.push('src/data/'+m[1]);
 rels.push('index.html');
 return Object.fromEntries([...new Set(rels)].sort().map(rel=>[rel,normalized(path.join(root,rel))]));
}
function validateReceipt(root,r){
 if(![736,844].includes(r.height)||r.trace?.length!==stages.length||!r.networkInputs)throw Error('Expected real phone frame receipts at both target heights');
 const observed={};
 for(const[url,value]of Object.entries(r.networkInputs)){
  const rel=new URL(url,'https://receipt.invalid/').pathname.slice(1)||'index.html';
  if(observed[rel]&&observed[rel]!==value.normalizedSha256)throw Error('Mixed source responses: '+rel);
  observed[rel]=value.normalizedSha256;
 }
 for(const[rel,hash]of Object.entries(expectedInputs(root)))if(observed[rel]!==hash)throw Error('Phone receipt source is stale or missing: '+rel);
 for(let i=0;i<stages.length;i++){
  const row=r.trace[i];
  if(row.label!==stages[i]||row.viewport[0]!==390||row.viewport[1]!==r.height||row.scroll[0]||row.scroll[1]||row.scroll[2]>r.height+1)throw Error('Scroll/frame failure: '+stages[i]);
  if(row.phone?.touch<1||!row.phone.coarse||row.phone.hover||!row.touches?.length||row.touches.some(t=>!t.trusted))throw Error('Real touch emulation evidence missing');
  if(Object.values(row.rects).some(b=>b.y<0||b.bottom>r.height+1||b.width<=0||b.height<=0))throw Error('Offscreen board/controls/messages');
  if(row.rects['.detail'].bottom>row.rects['.ord-narration'].y+1||row.rects['.ord-narration'].bottom>row.rects['.ord-controls'].y+1)throw Error('Board/messages/controls overlap');
  if(row.floating.some(Boolean))throw Error('Scattered floating messages');
 }
 const byLabel=Object.fromEntries(r.trace.map(t=>[t.label,t]));
 const a=byLabel['conversation choices'],b=byLabel['paged choices'];
 if(a.kcal!==b.kcal||a.ticks!==b.ticks||a.message!==b.message||JSON.stringify(a.controls)!==JSON.stringify(b.controls))throw Error('Choice paging changed gameplay or choices');
 const zero=byLabel['zero moves one action'],wait=byLabel['Wait resolved'];
 if(zero.player?.moves!==0||zero.player?.acted||wait.player?.moves!==3||wait.player?.acted||!wait.fight||byLabel['actual edge escape'].fight)throw Error('Real combat did not complete its Wait/escape journey');
 return r.height;
}
function update(root,files){
 const receipts=files.map(file=>{const absolute=path.resolve(file),rel=path.relative(root,absolute);if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Retain receipts inside the repo first');const bytes=fs.readFileSync(absolute),r=JSON.parse(bytes);return{path:rel.replace(/\\/g,'/'),sha256:normalized(absolute),height:validateReceipt(root,r)};});
 if(receipts.length!==2||receipts.map(r=>r.height).sort().join(',')!=='736,844')throw Error('One receipt for each phone height required');
 const sources=expectedInputs(root);
 for(const rel of ['scripts/phone-frame-proof-update.js','evidence/2026-10-18/phone-frame-replay-r1.js'])sources[rel]=normalized(path.join(root,rel));
 const proof={schemaVersion:1,receiptHashNormalization:'lf-v1',scope:'Chromium touch phone frame; not physical iOS/Android or installed lifecycle clearance',receipts,sources};
 const destination=path.join(root,'scripts/phone-frame-proof.json'),temporary=destination+'.tmp';
 fs.writeFileSync(temporary,JSON.stringify(proof,null,2)+'\n');fs.renameSync(temporary,destination);
 return{receipts:receipts.map(r=>r.height),inputs:Object.keys(sources).length};
}
module.exports={expectedInputs,validateReceipt,update,normalized};
if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'..'),process.argv.slice(2))));}catch(e){console.error(e.message);process.exitCode=1;}
