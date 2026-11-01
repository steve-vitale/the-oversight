'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),P=require('../loot-phone-proof-update'),F=require('../phone-frame-proof-update'),root=path.resolve(__dirname,'../..'),proof=require('../loot-phone-proof.json');
assert.equal(proof.schemaVersion,3);assert.deepEqual(proof.receipts.map(r=>r.case+':'+r.height).sort(),['approach:736','approach:844','scene:736','scene:844','underfoot:736','underfoot:844']);
for(const[f,h]of Object.entries(proof.sources))assert.equal(F.normalized(path.join(root,f)),h,'Repeat the actual Loot phone journey after changing '+f);
for(const r of proof.receipts){const f=path.join(root,r.path);assert.equal(F.normalized(f),r.sha256);const data=JSON.parse(fs.readFileSync(f));assert.equal(data.case,r.case);assert.equal(P.validate(root,data),r.height);}
const scene=JSON.parse(fs.readFileSync(path.join(root,proof.receipts.find(r=>r.case==='scene').path)));
for(const mutate of [r=>r.trace[0].available.push(r.ids.outside),r=>r.checkpoints.final.corpses.find(c=>c.id===r.ids.hall).items[1]._left=false,r=>r.trace.find(t=>t.label==='paid outdoor step exposes two actual outside bodies').kcal--,r=>r.trace.at(-1).corpses.find(c=>c.id===r.ids.outside).scene='hall']){const copy=JSON.parse(JSON.stringify(scene));mutate(copy);assert.throws(()=>P.validate(root,copy),'Reject leaked room, lost checkpoint, wrong paid step or changed Continue');}
console.log('Source-bound actual direct Search/paid approach/multiple bodies/loot/refusal/Leave, no grid taps, touch scroll, immediate checkpoint and Continue pass at both phone heights.');
