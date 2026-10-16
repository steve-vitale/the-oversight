'use strict';
// Freeze setup RNG before the unchanged legacy script captures Math.random.
const path=require('path'),root=path.resolve(process.argv[2]),seed=Number(process.argv[3]);
if(!Number.isSafeInteger(seed))throw Error('Expected root and integer seed');
Math.random=require(path.join(root,'scripts/sim-harness')).mulberry32(seed);
let tick=0;Date.now=()=>1760400000000+tick++;
require(path.join(root,'scripts/test-hunter-ecology-20261008.js'));
