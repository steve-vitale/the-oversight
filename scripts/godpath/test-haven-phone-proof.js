'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),P=require('../haven-phone-proof-update'),root=path.resolve(__dirname,'../..'),proof=require('../haven-phone-proof.json');
assert.equal(proof.schemaVersion,1);assert.deepEqual(Object.keys(proof.sources).sort(),P.inputs.slice().sort());assert.deepEqual(proof.receipts.map(r=>r.height).sort(),[736,844]);
for(const[name,hash]of Object.entries(proof.sources))assert.equal(P.hash(path.join(root,name)),hash,'Stale Haven phone evidence: replay lodge-mobile-r1.cjs and run haven-phone-proof-update.js');
for(const receipt of proof.receipts){const file=path.join(root,receipt.path);assert.equal(P.hash(file),receipt.sha256);const r=JSON.parse(fs.readFileSync(file));assert.equal(r.height,receipt.height);P.shape(r);}
console.log('Haven phone proof: both heights, native rest/warmth/exit/Continue, visible room, outdoor-only garden, one lodge and gated management');
