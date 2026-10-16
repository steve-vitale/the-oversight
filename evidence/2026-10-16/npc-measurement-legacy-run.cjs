'use strict';
// Pre-seed the existing unseeded legacy script before its captured RNGs load.
// No rewritten eval or assertion changes. One test per child process.
const path=require('path'),root=path.resolve(process.argv[2]),file=process.argv[3],seed=Number(process.argv[4]);
if(!['scripts/test-blocked-travel-feedback.js','scripts/test-past-deflect-gate.js','scripts/test-drifter-presence.js','scripts/test-enter-building-guard.js','scripts/test-miser.js'].includes(file)||!Number.isSafeInteger(seed))throw Error('Expected a named legacy test and integer seed');
const H=require(path.join(root,'scripts/sim-harness'));
Math.random=H.mulberry32(seed);let tick=0;Date.now=()=>1760400000000+tick++;
require(path.join(root,file));
