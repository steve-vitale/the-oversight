'use strict';
const assert=require('assert'),K=require('./lib');
(async()=>{
 const G=await K.load({seed:4242});K.newRun(G);
 const s=G.state.scholar,v=G.state.village;s.day=30;G.state.systemArrived=true;
 const npc=v.roster.find(id=>id!==G.villagerId);v.trust[npc]=90;
 G.startConvo(npc);const c=G.convoGet(npc);
 c.pendingQ=null;c.reactiveQ=null;c.genericQ=null;c.thread=null;c.choosingSubject=true;c.want=null;
 const raw=G.buildMenu(npc,true),required=new Set(raw.map(ch=>ch.id));
 assert(raw.length>8,'real generated subject/earned-verb menu must overflow');
 const seen=new Set(),pages=new Set(),before={exchanges:c.exchanges,kcal:s.kcal,day:s.day,part:G.dayPart,trust:v.trust[npc],transcript:JSON.stringify(c.transcript)};
 let menu=G.convoChoices(npc),hops=0;
 while(true){
   assert(menu.length<=8,'actual wrapped menu stays bounded');
   assert.equal(new Set(menu.map(ch=>ch.id)).size,menu.length,'no duplicate choices');
   assert(menu.some(ch=>ch.id==='leave'),'exit is present on every page');
   const key=menu.map(ch=>ch.id).join(',');if(pages.has(key))break;pages.add(key);
   for(const ch of menu)if(ch.id!=='menu:more')seen.add(ch.id);
   if(!menu.some(ch=>ch.id==='menu:more'))break;
   const result=G.convoTurn(npc,'menu:more');assert(result.navigation && !result.ended);
   assert(++hops<=20,'pager returns to the first page');menu=G.convoChoices(npc);
 }
 for(const id of required)assert(seen.has(id),'offered raw choice remains reachable: '+id);
 assert(pages.size>1,'actual wrapper exposes multiple pages');
 assert.deepEqual({exchanges:c.exchanges,kcal:s.kcal,day:s.day,part:G.dayPart,trust:v.trust[npc],transcript:JSON.stringify(c.transcript)},before,'browsing pages pays no trust, transcript, clock, calorie or exchange reward');
 // The budget applies after urgent injected choices as well. This fixture
 // changes only the injector input; the actual wrappers and pager run.
 const inject=G.agencyChoices;G.agencyChoices=()=>[{id:'agency:prepared_a',label:'Prepared urgency A'},{id:'agency:prepared_b',label:'Prepared urgency B'}];
 try{
   c.menuPage=0;menu=G.convoChoices(npc);assert(menu.length<=8);assert.deepEqual(menu.slice(0,2).map(ch=>ch.id),['agency:prepared_a','agency:prepared_b']);
   assert(menu.some(ch=>ch.id==='leave'));assert(menu.some(ch=>ch.id==='menu:more'));
 }finally{G.agencyChoices=inject;}
 // Question answers retain their authored contract; paging cannot silently
 // remove an answer or pretend that navigating is an answer.
 const answers=Array.from({length:9},(_,i)=>({id:'ans:'+i,label:'Answer '+i}));
 assert.deepEqual(G.convoMenuPage(npc,answers),answers);
 G.endConvo(npc,'left');const stale=G.convoTurn(npc,'menu:more');assert(stale.ignored && stale.ended);assert(!c.active);
 console.log('conversation overflow: all real offered choices reachable, bounded pages, urgent leads, no navigation rewards, question contract and stale closure pass');
})().catch(e=>{console.error(e);process.exitCode=1;});
