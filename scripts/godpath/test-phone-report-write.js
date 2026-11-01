'use strict';
const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
const R=require('../refresh-phone-proofs'),T=require('./lib').reporter('phone report replacement');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-report-')),file=path.join(dir,'report.json');
try{
 const old={status:'running',steps:[1]},next={status:'complete',steps:[1,2]};
 fs.writeFileSync(file,JSON.stringify(old));
 let attempts=0,writes=0;const pauses=[],payloads=[];
 R.write(file,next,{platform:'win32',pause:ms=>pauses.push(ms),fs:{
  writeFileSync(...args){writes++;return fs.writeFileSync(...args);},
  renameSync(...args){attempts++;payloads.push(JSON.parse(fs.readFileSync(file+'.tmp')));
   if(attempts<3){assert.deepEqual(JSON.parse(fs.readFileSync(file)),old);throw Object.assign(Error('temporary sharing conflict'),{code:attempts===1?'EPERM':'EBUSY'});}
   return fs.renameSync(...args);
  }
 }});
 T.ok('transient Windows denial retries the same atomic replacement',attempts===3&&writes===1&&pauses.join(',')==='10,20');
 T.ok('one complete payload survives every attempt',payloads.every(p=>JSON.stringify(p)===JSON.stringify(next)));
 T.ok('successful replacement is exact JSON and consumes its temp file',JSON.stringify(JSON.parse(fs.readFileSync(file)))===JSON.stringify(next)&&!fs.existsSync(file+'.tmp'));
 for(const [platform,code,expected]of [['win32','EPERM',6],['win32','EBUSY',6],['win32','EACCES',1],['linux','EPERM',1],['win32','ENOENT',1]]){
  fs.writeFileSync(file,JSON.stringify(old));attempts=0;pauses.length=0;
  const failure=Object.assign(Error('retained actual failure'),{code});
  assert.throws(()=>R.write(file,next,{platform,pause:ms=>pauses.push(ms),fs:{writeFileSync:fs.writeFileSync,
   renameSync(){attempts++;throw failure;}}}),e=>e===failure);
  T.ok(platform+'/'+code+' remains bounded and propagates its original error',attempts===expected&&pauses.length===expected-1);
  T.ok(platform+'/'+code+' preserves the old report and recoverable new bytes',JSON.stringify(JSON.parse(fs.readFileSync(file)))===JSON.stringify(old)&&JSON.stringify(JSON.parse(fs.readFileSync(file+'.tmp')))===JSON.stringify(next));
 }
 assert.equal(T.done().fail,0);
}finally{
 for(const name of ['report.json','report.json.tmp'])if(fs.existsSync(path.join(dir,name)))fs.unlinkSync(path.join(dir,name));
 fs.rmdirSync(dir);
}
