'use strict';
// Controlled source fault, one real shared harness in each child process.
const fs=require('fs'),path=require('path'),cp=require('child_process'),K=require('./lib'),root=path.resolve(process.argv.includes('--child')?process.argv[3]:process.argv[2]||path.join(__dirname,'../..'));
if(process.argv.includes('--child')){
 const H=require(path.join(root,'scripts/sim-harness')),read=fs.readFileSync,game=path.join(H.ROOT,'src/js/game.js'),broken=path.join(H.ROOT,'src/js/titans.js');
 fs.readFileSync=function(file,...args){const absolute=typeof file==='string'?path.resolve(file):null;if(absolute===broken)return 'throw new Error("controlled module-load sentinel");';const result=read.call(this,file,...args);if(absolute===game)return String(result)+'\n{ const g=globalThis.Scattering.Game,init=g.init; g.init=function(...a){globalThis.__namespaceInitRan=true;return init.apply(this,a);}; }';return result;};
 H.loadGame({seed:221032}).then(()=>console.log(JSON.stringify({resolved:true,initialized:!!globalThis.__namespaceInitRan})),error=>console.log(JSON.stringify({resolved:false,initialized:!!globalThis.__namespaceInitRan,message:error.message}))).finally(()=>{fs.readFileSync=read;});
}else{
 const T=K.reporter('harness-load-failure'),child=cp.spawnSync(process.execPath,[__filename,'--child',root],{encoding:'utf8'});T.ok('controlled fault child terminates normally',child.status===0,child.stderr);const row=JSON.parse(child.stdout.trim().split('\n').at(-1));T.ok('a broken module cannot return a partial runtime',!row.resolved);T.ok('the refusal names the failed file and original error',row.message?.includes('src/js/titans.js')&&row.message.includes('controlled module-load sentinel'));T.ok('partial runtime never reaches initialization',!row.initialized);T.done();
}
