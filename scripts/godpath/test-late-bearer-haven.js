'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),K=require('./lib'),T=K.reporter('Late bearer Haven identity');
(async()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
 const G=await K.load({seed:12}),checkpoint='evidence/2026-10-23/ending-aware-merchant6-action-r1-checkpoint.json.gz';
 const state=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(K.ROOT,checkpoint)))).receipts[0].before.state;
 memory.set(state.runKey,JSON.stringify(state));T.ok('historical natural day464 checkpoint loads',G.load(state.runKey)&&G.state.scholar.day===464);
 const person=G.data.villagers.find(p=>p.id===G.villagerId),seed=G.data.background_survivors.find(p=>p.id===G.villagerId);
 T.ok('legacy background bearer now has one canonical authored identity',G.villagerId==='thabo_maseko'&&!!person&&person===G.state.village.rosterChars[G.villagerId]&&person.name===seed?.name);
 T.ok('legacy identity recovery does not invent starter possessions',person?.legacyPersonRecovery?.possessions==='unknown'&&person.items.length===0&&person.stashed.length===0&&Object.keys(person.equipped).length===0);
 let info,error,randomCalls=0;const random=Math.random;
 Math.random=()=>{randomCalls++;return random();};
 try{info=G.villageInfo();}catch(e){error=e.message;}finally{Math.random=random;}
 T.ok('Haven summary resolves the actual saved background bearer identity',!error&&info?.scholarName===G.data.background_survivors.find(p=>p.id===G.villagerId).name,error);
 T.ok('reading the Haven name does not hydrate and reroll a character',randomCalls===0,randomCalls);
 // The same stale static-cast dereference used to make initial departure
 // throw for a background survivor, despite its computed first name unused.
 let departureError;try{G.depart();}catch(e){departureError=e.message;}
 T.ok('background bearer departure does not dereference the static cast',!departureError,departureError);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
