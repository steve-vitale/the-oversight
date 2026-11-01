'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),P=require('../carry-phone-proof-update'),F=require('../phone-frame-proof-update'),root=path.resolve(__dirname,'../..');
const proof=require('../carry-phone-proof.json');
assert.equal(proof.schemaVersion,1);assert.deepEqual(proof.receipts.map(r=>r.height).sort(),[736,844]);
for(const[f,h]of Object.entries(proof.sources))assert.equal(F.normalized(path.join(root,f)),h,'Repeat the actual carry phone journey after changing '+f);
for(const r of proof.receipts){const f=path.join(root,r.path);assert.equal(F.normalized(f),r.sha256);assert.equal(P.validate(root,JSON.parse(fs.readFileSync(f))),r.height);}
console.log('Source-bound heavy pickup / paid walk / Stop / immediate checkpoint / Continue receipts pass at both phone heights.');
