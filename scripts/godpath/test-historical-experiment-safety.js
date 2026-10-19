'use strict';
const K=require('./lib'),B=require('../balance-panel'),cp=require('child_process'),T=K.reporter('historical experiment safety');
const before=JSON.stringify(B.manifest(K.ROOT)),env={...process.env};delete env.SMOKE;
const r=cp.spawnSync(process.execPath,['scripts/test-gengap-b.js'],{cwd:K.ROOT,env,encoding:'utf8',timeout:30000});
T.ok('the historical experiment refuses its actual default source swap',r.status!==0&&/Historical source-swapping experiment/.test(r.stderr));
T.ok('default refusal leaves every Game/controller source input unchanged',JSON.stringify(B.manifest(K.ROOT))===before);
T.done();
