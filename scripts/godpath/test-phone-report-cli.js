'use strict';
const assert=require('assert/strict'),cp=require('child_process'),path=require('path'),K=require('./lib');
for(const name of ['evolved-garden','walk-home','earned-evolution']){
  const file=path.join(K.ROOT,'scripts/lib/'+name+'-phone-proof.js');
  const result=cp.spawnSync(process.execPath,[file],{encoding:'utf8',windowsHide:true});
  assert.equal(result.status,1,'a validator CLI must not silently succeed without a report: '+name);
  assert.match(result.stderr,/Actual retained report path required/);
  const library=require(file),report=library.read(K.ROOT);
  assert(library.verify(K.ROOT,report).ok,'canonical actual report must pass real verifier: '+name);
}
console.log('Phone report CLI: 3 missing-report rejections and 3 actual canonical verifications passed');
