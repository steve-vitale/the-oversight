'use strict';
const path=require('path'),K=process.argv[2]?require(path.join(path.resolve(process.argv[2]),'scripts/godpath/lib')):require('./lib'),T=K.reporter('reply priorities');
(async()=>{const G=await K.load({seed:221022});K.newRun(G);const v=G.data.villagers.find(v=>v.id!==G.villagerId),c=G.convoGet(v.id);G.state.village.trust[v.id]=20;c.escalated=true;
const ids=a=>a.map(x=>x.id),labels=a=>Object.fromEntries(a.map(x=>[x.id,x.label]));
for(const disposition of[-1,0,1]){
 G.state.scholar.disposition=disposition;Object.assign(c,{pendingQ:null,reactiveQ:null,genericQ:null,spent:{}});
 const original=[{id:'goon',label:'"Go on."'},{id:'gentle',label:'"I can help."',temper:'kind'},{id:'recap',label:'"Remind me."'},{id:'harsh',label:'"That is your problem."',temper:'cruel'},{id:'dlg:subject',label:'"Something else?"'},{id:'leave',label:'"Goodbye."'}],out=G.finalizeMenu(v.id,original);
 const withoutRecap=original.filter(ch=>ch.id!=='recap');
 T.ok('structural choices keep non-recap slots at disposition '+disposition,[0,3,4].every(i=>out[i].id===withoutRecap[i].id));
 T.ok('personality still orders actual content at disposition '+disposition,out[1].id===(disposition<0?'harsh':'gentle'));
 T.ok('offered labels and input menu remain intact at disposition '+disposition,original.every(ch=>labels(out)[ch.id]===ch.label)&&ids(original).join(',')==='goon,gentle,recap,harsh,dlg:subject,leave');
 for(const[pending,prefix]of[['pendingQ','ans:'],['reactiveQ','react:'],['genericQ','gq:']]){
  Object.assign(c,{pendingQ:null,reactiveQ:null,genericQ:null,[pending]:{id:'declared-question'}});
  const menu=[{id:'deflect_q',label:'(change the subject)',temper:'cruel'},{id:prefix+'yes',label:'"Yes."',temper:'kind'},{id:prefix+'no',label:'"No."',temper:'neutral'},{id:'leave',label:'"I should go."'}],result=G.finalizeMenu(v.id,menu);
  T.ok(pending+' answers precede the dodge at disposition '+disposition,result.slice(0,2).every(ch=>ch.id.startsWith(prefix))&&result[2].id==='deflect_q');
  T.ok(pending+' still offers every original reply at disposition '+disposition,menu.every(ch=>labels(result)[ch.id]===ch.label));
 }
 Object.assign(c,{pendingQ:null,reactiveQ:null,genericQ:null,thread:'small',spokenBeat:{tag:'small',topic:'small',line:'"I heard something last night."'},lastBeat:null,want:null,heldBeats:[{tag:'small',topic:'small',line:'"I checked the door."'}],threadLog:[{topic:'small'},{topic:'small'}],spent:{}});
 const beat=G.beatMenuResponses(v.id),result=G.finalizeMenu(v.id,beat),index=id=>result.findIndex(ch=>ch.id===id);
 T.ok('queued continuation stays first at disposition '+disposition,result[0].id==='goon');
 T.ok('recap follows subject and exit at disposition '+disposition,index('recap')>index('dlg:subject')&&index('recap')>index('leave'));
 c.spent.recap=true;T.ok('recap spend-out remains effective at disposition '+disposition,!G.finalizeMenu(v.id,beat).some(ch=>ch.id==='recap'));
 c.spent={};c.replyMenu=null;const fresh=G.buildMenu(v.id,true),recap=fresh.find(ch=>ch.id==='recap');
 T.ok('real builder supplies the recap migration case at disposition '+disposition,!!recap);
 c.replyMenu.choices=[recap,...fresh.filter(ch=>ch.id!=='recap')].map(ch=>({...ch}));
 const cachedWords=JSON.stringify(c.replyMenu.choices),pick=G.convoPickCycle;let draws=0;
 G.convoPickCycle=function(...args){draws++;return pick.apply(this,args);};let cached;
 try{cached=G.buildMenu(v.id,true);}finally{G.convoPickCycle=pick;}
 T.ok('an older saved cache receives the same correct order at disposition '+disposition,ids(cached).join(',')===ids(fresh).join(','));
 T.ok('cache repair preserves original words without drawing another voice variant at disposition '+disposition,draws===0&&JSON.stringify(c.replyMenu.choices)===cachedWords&&fresh.every(ch=>labels(cached)[ch.id]===ch.label));
}
T.done();})().catch(e=>{console.error(e.stack);process.exitCode=1;});
