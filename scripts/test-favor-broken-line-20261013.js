'use strict';
// Expiry is authored narration, never a quoted Journal task or first-person label.
const K=require('./godpath/lib'),T=K.reporter('Broken favor narration');
(async()=>{
 const G=await K.load({seed:4242});
 for(const trust of[40,7,0]){
  K.newRun(G);const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);
  T.ok('living recipient exists',!!vid);if(!vid)continue;
  s.day=4;s.dayTicks=0;v.trust[vid]=trust;
  const f={id:'broken-line-'+trust,vid,kind:'heal_help',goal:'heal',state:'asked',askedDay:4,deadline:5,task:'help Testy with their injury',short:'this wound'};
  G.convoStoreFavor(f);const accepted=G.convoFavorCommit(vid,f),p=v.promises[vid];
  T.ok('actual commitment records recipient, maker, task and deadline',accepted.ok&&p.favorId===f.id&&p.maker===G.villagerId&&p.favorTask===f.task&&p.favorDeadline===5);
  const said=[],say=G.say;G.say=function(line){said.push(String(line));return say.apply(this,arguments);};
  try{
   s.day=5;G.checkPromises('__no_such_kind__',vid,{});
   T.ok('due-day action does not expire an open favor',p.kept===false&&f.state==='promised'&&v.trust[vid]===trust&&said.length===0);
   s.day=6;G.checkPromises('__no_such_kind__',vid,{});
   const line=said[0]||'',loss=trust-v.trust[vid],mem=G.lastPromiseWord(vid).mem;
   T.ok('expiry is one authored wound-care notice for the actual recipient',said.length===1&&line.includes(G.displayName(vid))&&/promised to tend the wound/.test(line));
   T.ok('notice neither quotes labels nor invents a silent NPC performance',!line.includes(f.task)&&!line.includes(f.short)&&!/["“”]/.test(line)&&!/doesn.t say anything|silence|won.t meet your eye/.test(line));
   T.ok('promise, favor and memory retain the exact broken obligation',p.kept==='broken'&&f.state==='broken'&&p.closedReason==='deadline'&&p.closedDay===6&&mem.favorId===f.id&&mem.maker===G.villagerId&&mem.note===f.task&&mem.trustAtBreak===trust);
   T.ok('trust'+trust+' pays and reports only the actual floored penalty',loss===Math.min(trust,15)&&(loss>0?line.endsWith('(-'+loss+' trust)'):!line.includes('trust)')));
   const count=said.length;G.checkPromises();T.ok('expired obligation cannot charge or speak twice',said.length===count&&v.trust[vid]===trust-loss);
  }finally{G.say=say;}
 }
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
