'use strict';
// Execute the real map renderer against the shared Game. Node omits the
// DOM/sprite adapter: actual menu/touch/layout proof is the retained browser
// edge-camp journey. This check covers nullable world-window inputs only.
const K=require('./lib'),fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const T=K.reporter('Map empty-window boundary');
(async()=>{
 const G=await K.load({seed:7});K.newRun(G);
 // The ordinary field paints before Map can open. Its presentation query
 // initializes the saved cosmetic maxStage record; do that real setup here
 // before measuring the map read, rather than excluding saved fields.
 G.presentationStage();
 const source=fs.readFileSync(K.ROOT+'/src/js/app.js','utf8'),start=source.indexOf('  function knownMapVillage('),end=source.indexOf('  // ---------- codex ----------',start);
 assert(start>0&&end>start);const body=source.slice(start,end),escape=source.match(/  function esc\(s\) \{[^\n]+\}/)?.[0];assert(escape);
 const renderer=text=>vm.runInNewContext(escape+'\n'+text+'\nrenderMap',{Game:G,Scattering:globalThis.Scattering,console});
 const render=renderer(body);
 for(const [x,y]of [[4,4],[5,0],[0,5],[8,5],[5,8]]){
  G.map.px=x;G.map.py=y;
  const before=JSON.stringify({state:G.state,map:G.map});
  const html=render(G.state,new Set());
  T.ok('world window at '+x+','+y+' renders all81 cells', [...html.matchAll(/data-x="/g)].length===81);
  T.ok('viewing '+x+','+y+' cannot generate terrain or change saved state',JSON.stringify({state:G.state,map:G.map})===before);
 }
 G.map.px=5;G.map.py=0;
 const old=body.replace('tl?.wornPath','tl.wornPath');assert.notEqual(old,body);
 let rejected=false;try{renderer(old)(G.state,new Set());}catch(e){rejected=/wornPath/.test(e.message);}
 T.ok('restoring the actual unsafe renderer read is rejected at the north edge',rejected);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
