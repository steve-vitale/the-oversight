'use strict';
const K=require('./lib'),P=require('../lib/conversation-playtest'),fs=require('fs'),assert=require('assert/strict'),T=K.reporter('Expired forage conversation');
(async()=>{
 const fixture=JSON.parse(fs.readFileSync(K.ROOT+'/evidence/2026-10-27/forage-expired-phone-fixture-r1.json')),G=await K.load({seed:7}),store=new Map(Object.entries(fixture.storage));
 globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const key=fixture.setup.key,id=fixture.setup.npc;assert(G.load(key));assert.equal(G.state.village.promises[id].kept,'broken');
 const opening=G.startConvo(id),choices=P.offers(G,id),pack=JSON.stringify(G.state.scholar.inventory);
 T.ok('actual expired native checkpoint speaks the missed promise, not a fresh ask',/missed.*promise/.test(opening.line)&&G.convoGet(id).want.id==='repay'&&G.convoGet(id).want.stage>=1);
 T.ok('whole live menu retains requirements and ending after deadline',choices.some(x=>x.id==='dlg:favor_requirements')&&choices.some(x=>x.id==='dlg:favor_cancel')&&!choices.some(x=>x.id==='dlg:help'));
 const result=P.choose(G,id,'dlg:favor_cancel'),saved=JSON.parse(store.get(key));
 T.ok('actual offered late ending keeps real cargo and does not repair the promise',result.favorSave===true&&JSON.stringify(saved.scholar.inventory)===pack&&saved.village.promises[id].kept==='broken'&&saved.village.favorLedger[id].forageRun.cancelled);
 store.clear();for(const[k,v]of Object.entries(fixture.storage))store.set(k,v);assert(G.load(key));
 const hook=G.convoJointFavorOpening;G.convoJointFavorOpening=function(vid){const r=hook.call(this,vid);return r?{...r,jointFavor:false}:r;};
 let old;try{G.startConvo(id);old=P.offers(G,id);}finally{G.convoJointFavorOpening=hook;}
 T.ok('removing actual spoken-phase signal reproduces hidden late controls',!old.some(x=>x.id==='dlg:favor_requirements')&&!old.some(x=>x.id==='dlg:favor_cancel')&&old.some(x=>x.id==='dlg:help'));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
