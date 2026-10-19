'use strict';
const assert=require('assert'),K=require('./lib'),C=require('../policies/competent');
let {chooseConversationChoice:pick,conversationDiagnostics}=require('../policies/conversation-pages');
(async()=>{
 assert.equal(C.pickTalkChoice([{id:'menu:more'}],{}),null,'navigation is never an action');
 let reads=0,choices=0;
 const legacy={convoChoices(){reads++;return[{id:'ask'}];},convoTurn(){throw Error('legacy navigation');}};
 assert.equal(pick(legacy,'x',menu=>{choices++;return menu[0];},{}).id,'ask');
 assert.equal(reads,1);assert.equal(choices,1,'legacy path calls chooser exactly once');
 const closed={convoChoices:()=>[{id:'old'},{id:'menu:more'}],convoTurn:()=>({ended:true})},closedCtx={};
 assert.equal(pick(closed,'x',menu=>menu[0],closedCtx),null,'closed navigation cannot return stale action');
 assert.equal(closedCtx.convoPageClosed,1);
 // Changing availability between discovery and reacquisition must not force
 // an ID that was once offered. These are protocol faults, not Game mocks
 // offered as proof of the actual pager (covered below).
 let calls=0;const staleCtx={};
 const stale={convoChoices:()=>[{id:'a'},{id:'menu:more'}],convoTurn:()=>({navigation:true,choices:++calls===1?[{id:'target'},{id:'menu:more'}]:[{id:'a'},{id:'menu:more'}]})};
 assert.equal(pick(stale,'x',menu=>menu.find(c=>c.id==='target'),staleCtx),null);
 assert.equal(staleCtx.convoPageMisses,1);
 const badCtx={},warn=console.warn;const warnings=[];console.warn=(...x)=>warnings.push(x.join(' '));
 try{assert.equal(pick({convoChoices:()=>[{id:'menu:more'}],convoTurn:()=>({ignored:true})},'x',x=>x[0],badCtx),null);}
 finally{console.warn=warn;}
 assert.equal(badCtx.convoPageErrorCount,1);assert.equal(warnings.length,1);assert.equal(conversationDiagnostics(badCtx).errors.length,1);
 const G=await K.load({seed:4242});K.newRun(G);
 if(process.env.POLICY_PAGES_FAULT==='skip')pick=(G,id,choose)=>choose(G.convoChoices(id));
 const s=G.state.scholar,v=G.state.village;s.day=30;G.state.systemArrived=true;
 const npc=v.roster.find(id=>id!==G.villagerId);v.trust[npc]=90;
 G.startConvo(npc);const c=G.convoGet(npc);
 if(process.env.POLICY_PAGES_FAULT==='paid'){const turn=G.convoTurn;G.convoTurn=function(...args){const r=turn.apply(this,args);if(r?.navigation)c.exchanges++;return r;};}
 Object.assign(c,{pendingQ:null,reactiveQ:null,genericQ:null,thread:null,choosingSubject:true,want:null});
 const initial=G.convoChoices(npc),raw=G.buildMenu(npc,true);
 const hidden=raw.find(ch=>!initial.some(x=>x.id===ch.id)&&ch.id!=='menu:more');assert(hidden,'real generated menu has a hidden choice');
 const snapshot=()=>JSON.stringify({exchanges:c.exchanges,kcal:s.kcal,day:s.day,part:G.dayPart,trust:v.trust[npc],transcript:c.transcript});
 const before=snapshot(),ctx={};let discovered;
 const chosen=pick(G,npc,menu=>{discovered=new Set(menu.map(x=>x.id));return menu.find(x=>x.id===hidden.id);},ctx);
 assert(chosen&&chosen.id===hidden.id,'hidden offered choice reacquired');
 assert(G.convoChoices(npc).some(x=>x.id===chosen.id),'returned action is on the actual current page');
 for(const ch of raw)assert(discovered.has(ch.id),'all real offered choices discovered: '+ch.id);
 assert.equal(snapshot(),before,'browsing earns no exchange, resource, time, trust or transcript');
 assert(ctx.convoPageNavigation>0&&ctx.convoPageHiddenSelections===1);assert(!ctx.deepTurns);
 const response=G.convoTurn(npc,chosen.id);assert(response&&!response.ignored&&!response.navigation,'actual hidden handler responds');
 G.endConvo(npc,'left');
 // Exercise the wired held-sitting controller through the real pager. A
 // prepared subject menu supplies opportunity; all action handlers are real.
 const talk=G.talkTo,turn=G.convoTurn;let real=0,nav=0;
 G.talkTo=function(id){const r=talk.call(this,id);const cc=G.convoGet(id);Object.assign(cc,{pendingQ:null,reactiveQ:null,genericQ:null,thread:null,choosingSubject:true,want:null});return r;};
 G.convoTurn=function(id,choice){assert(G.convoChoices(id).some(x=>x.id===choice),'controller only submits currently offered IDs');const r=turn.call(this,id,choice);if(r?.navigation)nav++;else if(r&&!r.ignored)real++;return r;};
 const held={};try{C.holdConversation(G,held,npc);}finally{G.talkTo=talk;G.convoTurn=turn;}
 assert(nav>0,'wired controller browses real pages');assert(real>0&&real<=5,'up to five real actions');assert.equal(held.deepTurns,real,'navigation never inflates turn count');assert(!G.convoGet(npc).active,'finally closes sitting');
 for(const policy of [require('../policies/capable').capable,require('../policies/socialite').socialite,...Object.values(require('../policies/livelihood')).filter(x=>x?.diagnostics)]){
   const d=policy.diagnostics({...held,...badCtx});assert.equal(d.version,1);assert(d.errors.length);assert(d.counters.convoPageNavigation>0);
 }
 console.log('policy conversation pages: legacy path, stale/closed/refused handling, all real offered pages, real action response, wired five-action budget and shared diagnostics pass');
})().catch(e=>{console.error(e);process.exitCode=1;});
