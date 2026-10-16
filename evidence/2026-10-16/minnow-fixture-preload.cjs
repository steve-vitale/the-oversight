'use strict';
const path=require('path'),root=path.resolve(process.env.HUNTER_FIXTURE_ROOT||path.join(__dirname,'../..'));
Math.random=require(path.join(root,'scripts/sim-harness')).mulberry32(Number(process.env.HUNTER_FIXTURE_SEED||75));
