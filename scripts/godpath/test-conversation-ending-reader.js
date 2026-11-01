'use strict';
const assert=require('assert/strict'),K=require('./lib'),{chooseConversationChoice}=require('../policies/conversation-pages');
// Public conversation inputs now checkpoint their completed state. This UI
// fixture needs real storage rather than an implicit unavailable-storage error.
const disk=new Map();globalThis.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,String(v)),removeItem:k=>disk.delete(k)};
(async()=>{
 const T=K.reporter('conversation terminal reader'),G=await K.load({seed:7,narration:true});K.newRun(G);
 const vid=G.state.village.roster.find(id=>id!==G.villagerId);G.startConvo(vid);
 for(let n=0;n<64&&!G.convoGet(vid).windingDown;n++){
  const pick=chooseConversationChoice(G,vid,choices=>choices.find(x=>/^(ans:|gq:|react:)/.test(x.id))||choices.find(x=>x.id==='goon')||choices.find(x=>x.id==='dlg:more')||choices.find(x=>x.id==='dlg:react')||choices.find(x=>/^ask:/.test(x.id))||choices.find(x=>['subject','dlg:subject'].includes(x.id))||choices.find(x=>x.id==='silence'));
  assert(pick,'Real offered path to winddown');G.convoTurn(vid,pick.id);
 }
 assert(G.convoGet(vid).active&&G.convoGet(vid).windingDown);
 const app=K.readSrc('src/js/app.js'),slice=(start,end)=>{const a=app.indexOf(start),b=app.indexOf(end,a);assert(a>=0&&b>a);return app.slice(a,b);};
 const source=slice('  function closeChat(', '  // DIALOGUE BOX')+slice('  function chatAdvance()', '  // personAct:')+slice('  function dialogueBoxHTML(', '  // NARRATION (Steve');
 let settled=0,turns=0;const end=G.endConvo,turn=G.convoTurn;G.endConvo=function(...args){settled++;return end.apply(this,args);};G.convoTurn=function(...args){turns++;return turn.apply(this,args);};
 const reader=new Function('Game','refresh','setTimeout','esc', 'let chatView=null;'+source+';return {set:v=>chatView=v,get:()=>chatView,choice:chatChoice,advance:chatAdvance,close:closeChat,render:()=>dialogueBoxHTML(chatView)};')(G,()=>{},f=>f(),s=>String(s));
 reader.set({vid,msgIndex:G.convoGet(vid).transcript.length-1,thinkingToken:0});reader.choice(vid,'silence');
 assert(!G.convoGet(vid).active);assert(reader.get()?.ended);assert.equal(settled,1);const at=reader.get().msgIndex;assert.equal(G.convoGet(vid).transcript[at].who,'them');
 assert.equal(reader.get().saveWarning,null);assert.deepEqual(JSON.parse(disk.get(G.state.runKey)).village.conv[vid],JSON.parse(JSON.stringify(G.convoGet(vid))),'complete final words are committed before reading');
 T.ok('Actual NPC winddown settles once and the real app retains the first new final reply',true);
 const snapshot=JSON.stringify(G.state),log=JSON.stringify(G.log);let html,pages=0;
 do{html=reader.render();if(html.includes('id="dlg-done"'))break;reader.advance();assert(++pages<40);}while(true);
 assert(!html.includes('data-cid='));assert.equal(JSON.stringify(G.state),snapshot);assert.equal(JSON.stringify(G.log),log);
 T.ok('Real app rendering and advance expose all final pages and free Done without new choices or Game writes',true);
 const prior=turns;reader.choice(vid,'silence');assert.equal(turns,prior);assert.equal(settled,1);
 T.ok('Stale choice dispatch cannot run another turn against a completed reader',true);
 reader.close(false);assert.equal(reader.get(),null);assert.equal(settled,1);assert.equal(JSON.stringify(G.state),snapshot);
 T.ok('Done dismisses only the view without a second endConvo or reward',true);
 reader.set({vid,ended:true});reader.close(true);assert.equal(settled,1);
 T.ok('Closing the terminal reader with its header also cannot settle twice',true);
 reader.set({vid,msgIndex:0});reader.choice(vid,'silence');assert.equal(reader.get(),null);assert.equal(settled,1);
 T.ok('An already inactive no-reply turn closes instead of replaying old transcript',true);
 G.startConvo(vid);reader.set({vid,msgIndex:0});reader.close(true);assert.equal(settled,2);assert(!G.convoGet(vid).active);
 T.ok('Cancelling an active sitting retains the actual normal end behavior',true);
 G.startConvo(vid);const beforeLeave=G.convoGet(vid).transcript.length;
 reader.set({vid,msgIndex:Math.max(0,beforeLeave-1),thinkingToken:0});reader.choice(vid,'leave');
 assert(!G.convoGet(vid).active);assert(reader.get()?.ended);assert.equal(settled,3);
 assert(G.convoGet(vid).transcript.slice(beforeLeave).some(e=>e.who==='them'));
 assert.equal(G.convoGet(vid).transcript[reader.get().msgIndex].who,'them');
 const leaveState=JSON.stringify(G.state),leaveLog=JSON.stringify(G.log);
 for(let n=0;!reader.render().includes('id="dlg-done"');n++){assert(n<40);reader.advance();}
 reader.close(false);assert.equal(settled,3);assert.equal(JSON.stringify(G.state),leaveState);assert.equal(JSON.stringify(G.log),leaveLog);
 T.ok('An explicit Leave choice retains actual farewell pages until free Done, without a second settlement',true);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
