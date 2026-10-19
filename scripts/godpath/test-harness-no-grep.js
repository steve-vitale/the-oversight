'use strict';
const cp=require('child_process'),original=cp.execSync;
cp.execSync=function(command,options){if(/\bgrep\b/.test(command))throw Error('Prepared host has no grep');return original(command,options)};
const K=require('./lib'),T=K.reporter('Portable shared harness');
(async()=>{try{
 const {Game,loadFails}=await K.H.loadGame({seed:7});
 T.ok('shared harness boots without grep',!!Game);T.ok('every ordered non-DOM module loads',loadFails.length===0,loadFails.join('; '));
 T.ok('modules beyond the historical80-script cap load',typeof Game.recognizeClass==='function'&&typeof Game.tableTakeSeat==='function');
 K.newRun(Game);T.ok('real expedition starts under the portable harness',!!Game.state.scholar&&!Game.over);
}catch(e){T.ok('shared harness boots without grep',false,e.message)}finally{cp.execSync=original;T.done()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
