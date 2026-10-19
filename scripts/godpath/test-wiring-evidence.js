'use strict';
const fs=require('fs'),os=require('os'),path=require('path'),{spawnSync}=require('child_process'),K=require('./lib'),T=K.reporter('Wiring evidence guard');
const tempRoot=path.resolve(os.tmpdir()),dir=fs.mkdtempSync(path.join(tempRoot,'oversight-wiring-'));
try{
 fs.mkdirSync(path.join(dir,'src/js'),{recursive:true});fs.mkdirSync(path.join(dir,'src/data'));fs.writeFileSync(path.join(dir,'index.html'),'');
 fs.writeFileSync(path.join(dir,'src/js/power.js'),'// provides: raiseEcho\nfunction raiseEcho() { return 1; }\nS.Godhood = { raiseEcho };\n');
 fs.writeFileSync(path.join(dir,'src/js/consumer.js'),'// TODO: call raiseEcho here.\n');
 const run=()=>spawnSync(process.execPath,[path.join(K.ROOT,'scripts/check-wired.js'),'--strict','src/js/power.js'],{env:{...process.env,CHECK_WIRED_ROOT:dir},encoding:'utf8'});
 let r=run();T.ok('comments and own exports cannot prove a caller',r.status===1&&/UNWIRED raiseEcho/.test(r.stdout),r.stdout+r.stderr);
 fs.writeFileSync(path.join(dir,'src/js/consumer.js'),'S.Godhood.raiseEcho();\n');r=run();T.ok('an actual external call clears the same guard',r.status===0&&/0 unwired/.test(r.stdout),r.stdout+r.stderr);
 fs.writeFileSync(path.join(dir,'src/js/consumer.js'),'');fs.writeFileSync(path.join(dir,'src/data/actions.json'),'{"action":"raiseEcho"}');r=run();T.ok('an explicit data dispatch counts as a reference',r.status===0&&/0 unwired/.test(r.stdout),r.stdout+r.stderr);
}finally{
 const resolved=path.resolve(dir);if(!resolved.startsWith(tempRoot+path.sep)||!path.basename(resolved).startsWith('oversight-wiring-'))throw Error('Unexpected scratch target');fs.rmSync(resolved,{recursive:true,force:true});
}
T.done();
