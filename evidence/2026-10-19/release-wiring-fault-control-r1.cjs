'use strict';
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process'),assert=require('assert');
const tempRoot=path.resolve(os.tmpdir()),dir=fs.mkdtempSync(path.join(tempRoot,'oversight-wiring-fault-'));
try{
 fs.mkdirSync(path.join(dir,'src/js'),{recursive:true});fs.mkdirSync(path.join(dir,'src/data'));fs.mkdirSync(path.join(dir,'scripts'));fs.writeFileSync(path.join(dir,'index.html'),'');
 fs.writeFileSync(path.join(dir,'src/js/power.js'),'// provides: raiseEcho\nfunction raiseEcho() { return 1; }\nS.Godhood = { raiseEcho };\n');fs.writeFileSync(path.join(dir,'src/js/consumer.js'),'// TODO: call raiseEcho here.\n');
 const actual=path.resolve('scripts/check-wired.js'),source=fs.readFileSync(actual,'utf8'),fault=source.replace('return { f, txt: commentless(txt), self: selfText(txt) };','return { f, txt, self: txt };');assert.notStrictEqual(fault,source);const mutant=path.join(dir,'scripts/check-wired.js');fs.writeFileSync(mutant,fault);
 const run=file=>cp.spawnSync(process.execPath,[file,'--strict','src/js/power.js'],{env:{...process.env,CHECK_WIRED_ROOT:dir},encoding:'utf8'}),good=run(actual),bad=run(mutant);
 assert.strictEqual(good.status,1);assert.match(good.stdout,/UNWIRED raiseEcho/);assert.strictEqual(bad.status,0);assert.match(bad.stdout,/0 unwired/);
 fs.writeFileSync(path.join(dir,'src/js/consumer.js'),'S.Godhood.raiseEcho();\n');const called=run(actual);assert.strictEqual(called.status,0);assert.match(called.stdout,/0 unwired/);
 console.log(JSON.stringify({scope:'Same fixture and ROOT routing; only comment/self-export filtering removed in the fault. No Game edits.',fixed:{exit:good.status,output:good.stdout},fault:{exit:bad.status,output:bad.stdout},realCall:{exit:called.status,output:called.stdout}}));
}finally{
 const resolved=path.resolve(dir);if(!resolved.startsWith(tempRoot+path.sep)||!path.basename(resolved).startsWith('oversight-wiring-fault-'))throw Error('Unexpected scratch target');fs.rmSync(resolved,{recursive:true,force:true});
}
