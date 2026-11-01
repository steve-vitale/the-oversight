'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),F=require('./phone-frame-proof-update');
const recipe='evidence/2026-10-21/carry-phone-r1.cjs';
function validate(root,r){
 assert([736,844].includes(r.height));assert.deepEqual(r.errors,[]);
 assert.equal(r.recipeSha256,F.normalized(path.join(root,recipe)));
 const expected=F.expectedInputs(root);
 for(const[k,v]of Object.entries(expected))assert.equal(r.loadedResponseHashes[k],v,k);
 assert(r.touches.length>=12&&r.touches.every(t=>t.trusted));
 const by=Object.fromEntries(r.trace.map(t=>[t.label,t]));
 const packed=by['native two-ration pickup crosses nominal capacity'],stop=by['trusted Stop checkpoints only landed paid squares'],continued=by['native Continue retains carried food and real burden'];
 assert(packed&&stop&&continued);assert.equal(packed.weight,30);assert.equal(packed.capacity,20);assert.equal(packed.limit,40);assert.equal(packed.burden.name,'straining');assert.equal(packed.step,4);
 assert.equal(r.packedBytes.scholar.inventory.find(i=>i.name==='Declared travel rations').units,2);assert.equal(r.packedBytes.village.pantry[0].units,3);
 for(const t of r.trace){assert.equal(t.scroll,0);assert(Object.values(t.rects).every(b=>b.y>=0&&b.bottom<=r.height+1));}
 for(const[k,v]of Object.entries(r.committed))assert.deepEqual(stop[k],v);
 for(const k of ['position','world','kcal','tick','weight','capacity','limit','inside','inventory','pantry'])assert.deepEqual(stop[k],continued[k]);
 return r.height;
}
function update(root,files){
 const receipts=files.map(file=>{const absolute=path.resolve(file),rel=path.relative(root,absolute);assert(!rel.startsWith('..')&&!path.isAbsolute(rel));const r=JSON.parse(fs.readFileSync(absolute));return{path:rel.replace(/\\/g,'/'),sha256:F.normalized(absolute),height:validate(root,r)};});
 assert.deepEqual(receipts.map(r=>r.height).sort(),[736,844]);
 const proof={schemaVersion:1,scope:'Prepared heavy-load Chromium touch pickup, quote, paid steps/path, trusted Stop, immediate saved bytes and Continue. Not physical-device or publication clearance.',receipts,sources:Object.fromEntries([...Object.keys(F.expectedInputs(root)),recipe,'scripts/carry-phone-proof-update.js'].map(f=>[f,F.normalized(path.join(root,f))]))};
 const out=path.join(root,'scripts/carry-phone-proof.json');fs.writeFileSync(out+'.tmp',JSON.stringify(proof,null,2)+'\n');fs.renameSync(out+'.tmp',out);return{heights:receipts.map(r=>r.height),inputs:Object.keys(proof.sources).length};
}
module.exports={validate,update};
if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'..'),process.argv.slice(2))));}catch(e){console.error(e.stack);process.exitCode=1;}
