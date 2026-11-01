'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),P=require('../arrival-phone-proof-update'),root=path.resolve(__dirname,'../..'),proof=require('../arrival-phone-proof.json');
assert.equal(proof.schemaVersion,1);assert.deepEqual(Object.keys(proof.sources).sort(),P.inputs.slice().sort());assert.deepEqual(proof.receipts.map(r=>r.height).sort(),[736,844]);
for(const[name,hash]of Object.entries(proof.sources))assert.equal(P.hash(path.join(root,name)),hash,'Stale arrival inputs: replay exile-scene-mobile-r1.cjs at both heights and run arrival-phone-proof-update.js');
for(const receipt of proof.receipts){const file=path.join(root,receipt.path);assert.equal(P.hash(file),receipt.sha256);const r=JSON.parse(fs.readFileSync(file));assert.equal(r.height,receipt.height);P.shape(r);assert.equal(r.recipeSha256,proof.sources[P.inputs[3]]);}
console.log('Arrival phone proof: both heights, seven visible beats, zero resource/scroll side effects, canonical scene, actual departure and Continue');
