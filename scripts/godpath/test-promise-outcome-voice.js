'use strict';
const K=require('./lib'),P=require('../lib/conversation-playtest'),T=K.reporter('Promise outcome narration');
(async()=>{
 // Count the seeded generator BEFORE eval, including module-captured RNG.
 const descriptor=Object.getOwnPropertyDescriptor(Math,'random');let draws=0,rng=descriptor.value,G;
 Object.defineProperty(Math,'random',{configurable:true,get:()=>rng,set:value=>{rng=function(){draws++;return value.apply(this,arguments);};}});
 try{G=await K.load({seed:7002});}finally{Object.defineProperty(Math,'random',{...descriptor,value:rng});}
 function scene(kind,trust=40){
  K.newRun(G);const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);
  s.day=4;s.dayTicks=0;v.trust[vid]=trust;
  const f={id:'outcome-proof',vid,kind,state:'promised',short:'FIRST_PERSON_SPOKEN_LABEL',task:'THIRD_PERSON_JOURNAL_LABEL'};
  const p={goal:kind==='food_share'?'feed':kind==='heal_help'||kind==='sick_help'?'heal':'prove',favorId:f.id,favorTask:f.task,day:3,favorDeadline:5,maker:G.villagerId,kept:false};
  if(kind==='water_haul')f.waterRun={returned:true,deliveredLiters:4,bearer:G.villagerId};
  v.favorLedger={[vid]:f};v.promises={[vid]:p};return{v,s,vid,f,p};
 }
 function capture(fn){const lines=[],say=G.say;G.say=function(line){lines.push(line);return say.apply(this,arguments);};try{fn();return lines;}finally{G.say=say;}}
 for(const [kind,trigger,opts,meaning]of[
  ['food_share','food',{food:true},/shared the food/],
  ['heal_help','heal',{care:'wound'},/tended the wound/],
  ['sick_help','heal',{care:'illness'},/care you promised/],
  ['water_haul','task',{waterFavorId:'outcome-proof'},/water is home/]
 ]){
  const c=scene(kind),name=G.displayName(c.vid),lines=capture(()=>G.checkPromises(trigger,c.vid,opts));
  T.ok(kind+' actual settlement keeps its receipt and names the deed without a quoted task',c.p.kept===true&&c.f.state==='fulfilled'&&lines.some(l=>meaning.test(l)&&l.includes(name))&&lines.every(l=>!/["“”]/.test(l)&&!l.includes(c.f.task)&&!l.includes(c.f.short)));
  T.ok(kind+' retains original Journal and memory labels',c.p.favorTask===c.f.task&&c.f.short==='FIRST_PERSON_SPOKEN_LABEL'&&G.lastPromiseWord(c.vid).mem?.note===c.f.task);
  const count=G.log.length,trust=c.v.trust[c.vid];G.checkPromises(trigger,c.vid,opts);
  T.ok(kind+' completion is still idempotent',G.log.length===count&&c.v.trust[c.vid]===trust);
 }
 {
  const c=scene('water_haul');c.f.waterRun.returned=false;const lines=capture(()=>G.checkPromises('task',c.vid,{waterFavorId:c.f.id}));
  T.ok('unfinished cargo cannot produce an optimistic completion notice',!c.p.kept&&c.f.state==='promised'&&lines.length===0);
 }
 for(const kind of['food_share','heal_help','sick_help','water_haul','stay_close']){
  const c=scene(kind),name=G.displayName(c.vid),before=JSON.stringify(G.state),beforeDraws=draws;
  const line=G.promiseOutcomeLine(c.vid,c.p,c.f,'fulfilled');
  T.ok(kind+' narration is read-only and draws no RNG',before===JSON.stringify(G.state)&&draws===beforeDraws);
  T.ok(kind+' authored narrator copy cannot turn labels into speech or invent a location',line.includes(name)&&!/["“”]/.test(line)&&!line.includes(c.f.task)&&!line.includes(c.f.short)&&!/across the fire|catches your eye/.test(line));
 }
 for(const trust of[40,7,0]){
  const c=scene('food_share',trust);c.s.day=6;const name=G.displayName(c.vid),lines=capture(()=>G.checkPromises());
  const loss=trust-c.v.trust[c.vid],notice=lines.find(l=>l.includes(name)&&l.includes('promised'))||'';
  T.ok('expiry at trust'+trust+' preserves deadline/penalty/memory and never narrates a first-person label',c.p.kept==='broken'&&c.f.state==='broken'&&loss===Math.min(trust,15)&&G.lastPromiseWord(c.vid).mem?.trustAtBreak===trust&&notice&&!notice.includes(c.f.short)&&!notice.includes(c.f.task)&&!/["“”]/.test(notice));
  T.ok('expiry at trust'+trust+' reports only actual trust lost',loss>0?notice.includes('(-'+loss+' trust)'):!notice.includes('trust)'));
 }
 {
  const c=scene('water_haul');const fallback=G.promiseOutcomeLine(c.vid,c.p,{...c.f,id:'someone-else'},'fulfilled');
  T.ok('a different favor cannot lend its specific outcome to this promise',fallback==='You kept your word to '+G.displayName(c.vid)+'.');
  delete c.p.favorId;const lines=capture(()=>G.checkPromises('task',c.vid));
  T.ok('ordinary promises have the same narration boundary',c.p.kept===true&&lines.some(l=>l==='You kept your word to '+G.displayName(c.vid)+'.')&&lines.every(l=>!/["“”]/.test(l)));
 }
 {
  const c=scene('food_share');c.f.short='the food I needed';
  const before=JSON.stringify(G.state),n=draws;
  T.ok('recipient and bearer references have distinct grammatical roles',G.promiseSpeechAbout(c.vid,c.p,'recipient')==='the food I needed'&&G.promiseSpeechAbout(c.vid,c.p,'bearer')==='the food you asked me for');
  T.ok('a third-party witness has an independently authored reference',G.promiseSpeechAbout(c.vid,c.p,'witness')==='a meal');
  T.ok('speech references neither mutate the expedition nor draw captured RNG',JSON.stringify(G.state)===before&&draws===n);
  T.ok('legacy notes and different favor identities cannot borrow current context',G.promiseSpeechAbout(c.vid,{note:c.f.task},'recipient')===null&&G.promiseSpeechAbout(c.vid,{favorId:'another-favor'},'bearer')===null);
  c.s.day=6;G.checkPromises();const memory=G.lastPromiseWord(c.vid).mem;
  T.ok('expiry preserves the exact favor identity with the old note and maker',memory.favorId===c.f.id&&memory.note===c.f.task&&memory.maker===G.villagerId);
  c.v.bgGoals={...c.v.bgGoals,[c.vid]:'feed'};
  const authored=(G.data.villagers||[]).find(person=>person.id===c.vid),originalGoal=authored?.goal;
  if(authored)authored.goal='feed'; // npcGoal gives authored goals priority.
  T.ok('prepared renewed vow has a real executable goal',G.npcGoal(c.vid)==='feed');
  let refused;try{refused=capture(()=>G.promiseHelp(c.vid));}finally{if(authored){if(originalGoal===undefined)delete authored.goal;else authored.goal=originalGoal;}}
  T.ok('actual broken-word refusal speaks the recipient reference, never the Journal label',refused.some(l=>l.includes(c.f.short))&&refused.every(l=>!l.includes(c.f.task))&&!c.v.promises[c.vid]);
  let result;const apologized=capture(()=>{result=G.makeAmends(c.vid);});
  T.ok('actual apology uses the bearer reference and retains the amends route',result?.ok&&result.axis==='broken word'&&apologized.some(l=>l.includes('the food you asked me for'))&&apologized.every(l=>!l.includes(c.f.task)&&!l.includes(c.f.short))&&G.lastPromiseWord(c.vid).word==='amends');
 }
 {
  const c=scene('food_share');G.convoFavorRenounce(c.vid);
  T.ok('renunciation stores the same identity boundary as deadline expiry',G.lastPromiseWord(c.vid).mem?.favorId===c.f.id);
 }
 {
  const c=scene('food_share'),{v,s,vid}=c;v.promises={};
  G.map.px=v.px??4;G.map.py=v.py??4;s.mx=4;s.my=4;s.insideHaven=false;
  v.nodePos={...v.nodePos,[vid]:{nx:G.map.px,ny:G.map.py}};v.positions={...v.positions,[vid]:{mx:4,my:5}};v.npcInside={...v.npcInside,[vid]:false};v.away={};
  Object.assign(G.npcNeeds(vid),{hunger:90});
  const favor=G.convoBuildFavor(vid,{kind:'food_share',hunger:90});G.convoStoreFavor(favor);G.convoPlantSeed(vid,{wantId:'ask_favor',favorId:favor.id,note:favor.short});
  const selected=G.convoSelectWant(vid);G.startConvo(vid);const active=G.convoGet(vid);
  // Explicit prepared legacy active ask: an obligation already exists, but
  // its saved ask still says asked. Use only an actually offered reply.
  active.want={id:'ask_favor',def:selected.def,stage:2,favor};active.thread='want';active.pendingQ=null;active.genericQ=null;active.reactiveQ=null;active.windingDown=false;active.choosingSubject=false;G.sayLine(vid,favor.line,{diegeticAct:true});active.replyMenu=null;
  const original={goal:favor.goal,day:s.day,kept:false,favorId:favor.id,favorTask:favor.task,maker:G.villagerId};v.promises[vid]=original;
  const offered=P.offers(G,vid);T.ok('prepared blocked ask exposes its real commitment choice',offered.some(o=>o.id==='dlg:commit'));
  if(offered.some(o=>o.id==='dlg:commit')){const r=P.choose(G,vid,'dlg:commit');T.ok('offered blocked commitment preserves the obligation and speaks first-person context',v.promises[vid]===original&&!original.kept&&r.line.includes(favor.short)&&!r.line.includes(favor.task));}
 }
 {
  const c=scene('food_share'),other=c.v.roster.find(id=>id!==c.vid&&id!==G.villagerId);
  c.p.kept='broken';c.v.promises[other]={goal:'feed',day:1,kept:'broken',maker:G.villagerId};
  G.progState().ledger={exposed:4,protected:0,killed:0};
  const people=(G.data.villagers||[]).filter(p=>p.id&&p.id!==G.villagerId).slice(0,2),previous=people.map(p=>p.personality);
  try{
   // Explicit prepared temperaments select the debt-specific authored line;
   // keep the real registry and actual offered beat routing.
   for(const p of people){p.personality={...p.personality,temperament:'quiet'};c.v.trust[p.id]=50;}
   G.tableStartPath('witness');const offered=G.state.scholar.tableChoices?.options||[];
   T.ok('prepared Witness chapter exposes its real opening choice',offered.some(o=>o.id==='beat:cold'));
   if(offered.some(o=>o.id==='beat:cold')){
    G.chooseTableOption('beat:cold');const prompt=G.state.scholar.tableChoices?.prompt||'';
    T.ok('registered court testimony speaks third-party context, never an imperative Journal label',prompt.includes('their word about a meal')&&!prompt.includes(c.f.task)&&!prompt.includes(c.f.short));
   }
  }finally{people.forEach((p,i)=>{p.personality=previous[i];});}
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
