'use strict';
// Controller capability, not an observer: browse only offered navigation,
// choose with the caller's existing preference, return a currently offered ID.
function bump(ctx,key){ctx[key]=(ctx[key]||0)+1;}
function conversationDiagnostics(ctx){
 return {errors:(ctx?.convoPageErrors||[]).slice(),counters:Object.fromEntries(Object.entries(ctx||{}).filter(([k,v])=>k.startsWith('convo')&&Number.isFinite(v)))};
}
function chooseConversationChoice(Game,vid,choose,ctx={}){
 try{
   let current=Game.convoChoices?Game.convoChoices(vid)||[]:[];
   bump(ctx,'convoPageReads');
   // Preserve the old path exactly on games without overflow: one read,
   // one chooser call, no synthetic navigation or extra Game helper.
   if(!current.some(ch=>ch?.id==='menu:more'))return choose(current);
   const initial=new Set(current.map(ch=>ch?.id)),all=[],ids=new Set(),pages=new Set();
   let closed=false;
   const signature=menu=>menu.map(ch=>ch?.id).join(',');
   function next(){
     if(!current.some(ch=>ch?.id==='menu:more'))return false;
     const r=Game.convoTurn(vid,'menu:more');
     if(r?.ended){closed=true;current=[];bump(ctx,'convoPageClosed');return false;}
     if(!r?.navigation||r.ignored){bump(ctx,'convoPageRefused');throw Error('Offered menu:more did not navigate');}
     if(!Array.isArray(r.choices))throw Error('Navigation omitted offered choices');
     bump(ctx,'convoPageNavigation');bump(ctx,'convoPageReads');current=r.choices;return true;
   }
   let bounded=false;
   for(let n=0;n<32;n++){
     const key=signature(current);if(pages.has(key)){bounded=true;break;}pages.add(key);
     for(const ch of current)if(ch?.id&&ch.id!=='menu:more'&&!ids.has(ch.id)){ids.add(ch.id);all.push(ch);}
     if(!next()){bounded=true;break;}
   }
   if(!bounded)throw Error('Conversation pages did not wrap within32 steps');
   if(closed)return null;
   const chosen=choose(all);if(!chosen){bump(ctx,'convoPageMisses');return null;}
   if(chosen.id==='menu:more')throw Error('Chooser selected navigation as an action');
   const searched=new Set();
   for(let n=0;n<32;n++){
     const fresh=current.find(ch=>ch?.id===chosen.id);
     if(fresh){if(!initial.has(fresh.id))bump(ctx,'convoPageHiddenSelections');return fresh;}
     const key=signature(current);if(searched.has(key)||!next())break;searched.add(key);
   }
   // Availability can change while menus are rebuilt. Never force the old ID.
   bump(ctx,'convoPageMisses');return null;
 }catch(e){
   bump(ctx,'convoPageErrorCount');ctx.convoPageErrors=ctx.convoPageErrors||[];
   if(ctx.convoPageErrors.length<20)ctx.convoPageErrors.push(e.message);
   console.warn('[policy/conversation-pages]',e.message);return null;
 }
}
module.exports={chooseConversationChoice,conversationDiagnostics};
