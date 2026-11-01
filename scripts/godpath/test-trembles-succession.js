'use strict';
const cp=require('child_process'),path=require('path'),K=require('./lib'),T=K.reporter('Real terminal tremor succession');
const run=cp.spawnSync(process.execPath,[path.join(K.ROOT,'evidence/2026-10-23/trembles-mantle-probe-r1.cjs')],{encoding:'utf8',maxBuffer:4*1024*1024});if(run.status!==0)throw Error(run.stderr||run.stdout);const r=JSON.parse(run.stdout);
T.ok('unknown terminal tremor records one real death with an honest generic cause',r.records.length===1&&r.records[0].cause==='sickness');
T.ok('the expired status kills the original bearer',r.records[0]?.before.id===r.old);
T.ok('actual succession produces another living bearer',r.after.id!==r.old&&r.after.health>0&&!r.after.over);
T.ok('the terminal body condition does not transfer to the successor',r.after.trembles===false);T.done();
