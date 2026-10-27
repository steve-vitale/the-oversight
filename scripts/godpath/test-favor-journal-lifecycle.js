'use strict';
const K=require('./lib'),T=K.reporter('Favor journal lifecycle');
(async()=>{
 const G=await K.load({seed:7002});
 const storage=new Map();
 globalThis.localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>[...storage.keys()][i]??null,get length(){return storage.size;}};
 function scene(kind='food_share'){
  K.newRun(G);const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);
  v.promises={};v.favorLedger={};s.day=5;s.insideHaven=false;s.mx=4;s.my=4;G.map.px=v.px??4;G.map.py=v.py??4;
  v.nodePos={...v.nodePos,[vid]:{nx:G.map.px,ny:G.map.py}};v.positions={...v.positions,[vid]:{mx:4,my:5}};v.npcInside={...v.npcInside,[vid]:false};v.away={};v.health={...v.health,[vid]:40};v.sick={};
  if(kind==='sick_help')v.sick[vid]={daysLeft:4,severity:2,id:'cold'};
  const favor=G.convoBuildFavor(vid,{kind,hunger:90,health:40,severity:2,water:0});G.convoStoreFavor(favor);
  return{v,s,vid,favor};
 }
 {
  const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);s.day=favor.deadline;
  G.checkPromises('fight',vid);
  T.ok('an unrelated deed on the due day does not expire a favor before nightfall',v.promises[vid].kept===false);
 }
 {
  const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);s.day=favor.deadline+1;
  G.checkPromises('food',vid,{food:true});
  T.ok('a late matching receipt cannot earn kept-promise credit',v.promises[vid].kept==='broken'&&favor.state==='broken');
 }
 {
  const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);s.day=favor.deadline;
  G.checkPromises('food',vid,{food:true});T.ok('a matching deed during the due day still keeps the favor',v.promises[vid].kept===true);
 }
 {
  const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);s.day=favor.deadline;G.checkPromises();
  T.ok('the nightly check expires an unfinished favor at the end of its due day',v.promises[vid].kept==='broken');
 }
 {
  const {v,vid,favor}=scene();favor.state='fulfilled';
  T.ok('a closed favor cannot be committed again',G.convoFavorCommit(vid,favor).ok===false&&!v.promises[vid]);
 }
 {
  const {v,vid,favor}=scene();G.convoFavorCommit(vid,favor);G.checkPromises('food',vid,{food:true});
  const next={...favor,id:favor.id+'-repeat',state:'asked'};G.convoStoreFavor(next);G.convoFavorCommit(vid,next);
  const entries=G.journalPerson(vid).promises.filter(p=>p.text===favor.task);
  T.ok('identically worded repeat favors retain separate task identities',entries.length===2&&entries.some(p=>p.favorId===favor.id&&p.status==='kept')&&entries.some(p=>p.favorId===next.id&&p.status==='open'),JSON.stringify(entries));
 }
 T.ok('the journal exposes a read-only favor projection',typeof G.journalPromises==='function');
 if(typeof G.journalPromises==='function'){
  {
   const {v,vid,favor}=scene();G.convoFavorCommit(vid,favor);G.checkPromises('food',vid,{food:true});
   const legacy=G.journalPerson(vid).promises.find(p=>p.favorId===favor.id);delete legacy.favorId;
   T.ok('a completed legacy note is projected once without duplicating the task',G.journalPromises(vid).filter(p=>p.text===favor.task).length===1);
  }
  {
   const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);s.day=favor.deadline+1;s.inventory=[{id:'favor-rations',name:'Rations',units:4,kcalEach:500}];
   const helped=G.convoPerformFavor(vid,favor);
   T.ok('late physical help still costs real food',helped.ok&&s.inventory[0].units===1);
   T.ok('late physical help preserves the expired promise and honest favor state',v.promises[vid].kept==='broken'&&favor.state==='broken'&&G.journalPromises(vid).find(p=>p.favorId===favor.id).status==='expired');
   T.ok('late help explains the missed deadline',/deadline|promise.*broken/i.test(helped.line),helped.line);
  }
  {
   const {v,s,vid,favor}=scene('heal_help');G.convoFavorCommit(vid,favor);s.day=favor.deadline;s.dayTicks=G.TIME.TICKS_PER_DAY-1;
   const result=G.convoPerformFavor(vid,favor);
   T.ok('care crossing nightfall does not turn an expired promise into success',v.promises[vid].kept==='broken'&&favor.state==='broken'&&/deadline/.test(result.line),JSON.stringify({promise:v.promises[vid],state:favor.state,result}));
  }
  for(const kind of ['snare_mend','watch_shift']){
   const {v,s,vid,favor}=scene(kind);favor.state='promised';
   v.promises[vid]={goal:favor.goal,day:s.day,kept:false,maker:G.villagerId,favorId:favor.id,favorTask:favor.task,favorDeadline:favor.deadline};s.day+=100;G.checkPromises();
   const row=G.journalPromises(vid).find(p=>p.favorId===favor.id);
   T.ok(kind+' remains explicitly unavailable without a misleading expired deadline',!v.promises[vid].kept&&row.status==='unavailable'&&/no penalty/i.test(row.deadlineLabel),JSON.stringify(row));
  }
  {
   // JOINT OUTING (tackle-outing 2026-10-27): forage_help is PLAYABLE now,
   // so an ignored outing rots like any real job instead of sitting
   // unavailable forever. The full outing is proved in
   // scripts/test-joint-outing-20261027.js.
   const {v,s,vid,favor}=scene('forage_help');favor.state='promised';
   v.promises[vid]={goal:favor.goal,day:s.day,kept:false,maker:G.villagerId,favorId:favor.id,favorTask:favor.task,favorDeadline:favor.deadline};s.day+=100;G.checkPromises();
   const row=G.journalPromises(vid).find(p=>p.favorId===favor.id);
   T.ok('forage_help playable job expires on its deadline like other real jobs',v.promises[vid].kept==='broken'&&row.status==='expired',JSON.stringify(row));
  }
  for(const kind of ['food_share','heal_help','sick_help']){
   const {v,s,vid,favor}=scene(kind);G.convoFavorCommit(vid,favor);const before=JSON.stringify(G.state);
   const row=G.journalPromises(vid).find(p=>p.favorId===favor.id);
   T.ok(kind+' has a concrete task, due day and live requirements',row&&row.text===favor.task&&row.dueDay===favor.deadline&&row.deadlineLabel.includes('day '+favor.deadline)&&!!row.requirements,JSON.stringify(row));
   T.ok(kind+' projection does not mutate save state',JSON.stringify(G.state)===before);
   T.ok(kind+' ordinary save succeeds',G.save()===true);const key=G.state.runKey;v.promises={};
   T.ok(kind+' Continue restores the task and deadline',G.load(key)===true&&G.journalPromises(vid).some(p=>p.favorId===favor.id&&p.dueDay===favor.deadline&&p.status==='open'));
  }
  const {v,s,vid,favor}=scene();s.day=favor.deadline;G.convoFavorCommit(vid,favor);const row=G.journalPromises(vid).find(p=>p.favorId===favor.id);
  T.ok('legacy late acceptance displays the resolver actual minimum day window',row.dueDay===s.day+1);
  T.ok('spoken deadline agrees with the actual saved obligation',/tomorrow/i.test(G.convoFavorDeadlineNote(favor)));
  v.promises[vid].kept='unavailable';
  T.ok('an unavailable job is cancelled, not labelled broken',G.journalPromises(vid).find(p=>p.favorId===favor.id).status==='cancelled');
 }
 {
  const {vid,favor}=scene('heal_help');G.convoFavorCommit(vid,favor);
  const c=G.convoGet(vid);c.active=true;c.thread='want';c.want={id:'repay',stage:0,favor};
  c.pendingQ=null;c.reactiveQ=null;c.pendingTrade=null;c.pendingHawk=null;c.genericQ=null;c.choosingSubject=false;
  G.convoGenericQ(vid,'"About this wound — have you had a chance? By the end of tomorrow."');
  T.ok('an accepted favor reminder preserves real action options instead of generic yes/no',!c.genericQ&&G.buildMenu(vid,true).some(o=>o.id==='dlg:favor_action'));
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1});
