'use strict';
const fs=require('node:fs'),path=require('node:path'),K=require('./lib'),T=K.reporter('Legacy map nightfall');
(async()=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-18/installed-update-old-save-r1.json'),'utf8'));
 const store=new Map(Object.entries(fixture.storage));
 globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const G=await K.load({seed:7002}),key=[...store.keys()].find(k=>k.startsWith('scattering-save-v1-'));
 T.ok('the retained played legacy expedition loads',G.load(key)===true);
 const widths=G.map.tiles.map(row=>row.length),day=G.state.scholar.day;
 T.ok('this is the historical seven-square map, not a regenerated substitute',widths.length===7&&widths.every(n=>n===7));
 G.dayPart=3;G.state.scholar.dayTicks=G.TIME.TICKS_PER_DAY-1;
 let failure=null;try{G.doAction('wait');}catch(e){failure=e.stack;}
 T.ok('actual Wait crosses legacy midnight without throwing',!failure,failure);
 T.ok('nightfall advances the saved day',G.state.scholar.day===day+1);
 T.ok('nightfall preserves the existing map dimensions',JSON.stringify(G.map.tiles.map(row=>row.length))===JSON.stringify(widths));
 G.state.scholar.day=7;G.dayPart=3;G.state.scholar.dayTicks=G.TIME.TICKS_PER_DAY-1;
 failure=null;try{G.doAction('wait');}catch(e){failure=e.stack;}
 T.ok('the weekly depletion sibling also completes on the saved map',!failure&&G.state.scholar.day===8,failure);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1});
