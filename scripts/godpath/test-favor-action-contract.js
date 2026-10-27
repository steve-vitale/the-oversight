'use strict';
const K=require('./lib'),P=require('../lib/conversation-playtest'),T=K.reporter('Favor action contract');
(async()=>{
 const G=await K.load({seed:7001});
 function scene(kind){
  K.newRun(G);const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);
  G.map.px=v.px??4;G.map.py=v.py??4;s.mx=4;s.my=4;s.insideHaven=false;
  v.nodePos={...v.nodePos,[vid]:{nx:G.map.px,ny:G.map.py}};v.positions={...v.positions,[vid]:{mx:4,my:5}};v.npcInside={...v.npcInside,[vid]:false};v.away={};
  v.water={clean:0,dirty:0};v.pantry=[];v.promises={};v.health=v.health||{};v.health[vid]=40;v.sick={};Object.assign(G.npcNeeds(vid),{hunger:90,fear:90,energy:20});
  if(kind==='sick_help')v.sick[vid]={daysLeft:4,severity:2,id:'cold'};
  const favor=G.convoBuildFavor(vid,{kind,hunger:90,health:40,severity:2,water:0});G.convoStoreFavor(favor);G.convoPlantSeed(vid,{wantId:'ask_favor',favorId:favor.id,note:favor.short});
  const selected=G.convoSelectWant(vid);G.startConvo(vid);const c=G.convoGet(vid);
  c.want={id:'ask_favor',def:selected.def,stage:2,favor};c.thread='want';c.pendingQ=null;c.genericQ=null;c.reactiveQ=null;c.windingDown=false;c.choosingSubject=false;G.sayLine(vid,favor.line,{diegeticAct:true});c.replyMenu=null;
  return {v,s,vid,favor,c};
 }
 for(const kind of ['snare_mend','watch_shift']){
  const {v,vid,favor}=scene(kind),choices=P.offers(G,vid);
  T.ok(kind+' explains unavailable execution and does not offer a hollow promise',choices.some(o=>o.id==='dlg:favor_requirements')&&!choices.some(o=>['dlg:favor_action','dlg:commit'].includes(o.id)),JSON.stringify(choices));
  const r=P.choose(G,vid,'dlg:favor_requirements');T.ok(kind+' explanation names the missing action',/no playable|no playable|no.*playable/i.test(r.line),r.line);
  T.ok(kind+' cannot create an unkeepable new promise',!G.convoFavorCommit(vid,favor).ok);
  // Prepared old-save obligation: ensure sibling generic events cannot keep it.
  v.promises[vid]={goal:favor.goal,day:G.state.scholar.day,kept:false,favorId:favor.id};
  G.checkPromises(favor.keepKind,vid,{food:true,words:true});T.ok(kind+' unrelated event never completes the old specific job',!v.promises[vid].kept&&favor.state!=='fulfilled');
  favor.state='promised';G.state.scholar.day+=10;G.checkPromises();
  T.ok(kind+' impossible old job has no deadline penalty',!v.promises[vid].kept&&favor.state==='promised');
  const trust=v.trust[vid];G.convoGet(vid).replyMenu=null;
  T.ok(kind+' old promise offers an explicit no-penalty close',P.offers(G,vid).some(o=>o.id==='dlg:favor_cancel'));
  P.choose(G,vid,'dlg:favor_cancel');
  T.ok(kind+' closing grants neither completion nor penalty',v.promises[vid].kept==='unavailable'&&favor.state==='moot'&&v.trust[vid]===trust&&G.convoGet(vid).want.resolution==='moot');
 }
 {
  // JOINT OUTING (tackle-outing 2026-10-27): forage_help is PLAYABLE now —
  // the pantry outing behind it exists, so it leaves the unavailable set.
  // A playable job commits, rots on its deadline like other real jobs, and
  // gets no no-penalty close. The full outing is proved in
  // scripts/test-joint-outing-20261027.js; here only the contract flips.
  const {v,vid,favor}=scene('forage_help'),choices=P.offers(G,vid);
  T.ok('forage_help is playable now: requirements plus a real commitment',choices.some(o=>o.id==='dlg:favor_requirements')&&choices.some(o=>o.id==='dlg:commit')&&!choices.some(o=>o.id==='dlg:favor_action'),JSON.stringify(choices));
  const r=P.choose(G,vid,'dlg:favor_requirements');T.ok('forage_help explanation names the real next step',/Accept the forage request|dawn/i.test(r.line),r.line);
  T.ok('forage_help can now be committed',G.convoFavorCommit(vid,favor).ok);
  G.checkPromises(favor.keepKind,vid,{food:true,words:true});T.ok('forage_help unrelated event never completes the old specific job',!v.promises[vid].kept&&favor.state!=='fulfilled');
  G.state.scholar.day+=10;G.checkPromises();
  T.ok('forage_help playable job rots on its deadline like other real jobs',v.promises[vid].kept==='broken'&&favor.state==='broken');
  G.convoGet(vid).replyMenu=null;
  T.ok('forage_help broken job offers no no-penalty close',!P.offers(G,vid).some(o=>o.id==='dlg:favor_cancel'));
 }
 {
  const {s,vid,favor,c}=scene('food_share');s.inventory=[];
  T.ok('no food hides physical action but explains and allows a later commitment',!P.offers(G,vid).some(o=>o.id==='dlg:favor_action')&&P.offers(G,vid).some(o=>o.id==='dlg:commit'));
  T.ok('requirements explain pack versus pantry',/pack.*pantry/i.test(P.choose(G,vid,'dlg:favor_requirements').line));
  s.inventory.push({id:'favor-rations',name:'Rations',units:4,kcalEach:500});
  T.ok('resources changing invalidates the same spoken menu cache',P.offers(G,vid).some(o=>o.id==='dlg:favor_action'));
  const before=s.inventory[0].units;const result=P.choose(G,vid,'dlg:favor_action');
  T.ok('offered food action really removes portions and settles the request',before-s.inventory[0].units===3&&favor.state==='fulfilled'&&/3 portions/.test(result.line));
  T.ok('completed request cannot be replayed',!P.offers(G,vid).some(o=>o.id==='dlg:favor_action')&&!G.convoPerformFavor(vid,favor).ok);
 }
 for(const kind of ['heal_help','sick_help']){
  const {v,vid,favor}=scene(kind);T.ok(kind+' physical care is offered',P.offers(G,vid).some(o=>o.id==='dlg:favor_action'));
  const hp=v.health[vid],days=v.sick[vid]?.daysLeft;P.choose(G,vid,'dlg:favor_action');
  T.ok(kind+' canonical care works despite its null success return',favor.state==='fulfilled'&&(kind==='heal_help'?v.health[vid]===hp+25:v.sick[vid].daysLeft<days));
 }
 {
  const {v,vid,favor,s}=scene('heal_help');G.convoFavorCommit(vid,favor);G.checkPromises('heal',vid,{words:true});T.ok('comforting cannot keep a wound-care promise',!v.promises[vid].kept);
  const before=v.health[vid];v.positions[vid].mx=s.mx+4;
  T.ok('stale action rechecks distance without healing',!G.convoPerformFavor(vid,favor).ok&&v.health[vid]===before);
  v.positions[vid].mx=s.mx;G.over=true;T.ok('death blocks physical execution',!G.convoPerformFavor(vid,favor).ok&&v.health[vid]===before);G.over=false;
 }
 {
  const {v,vid,favor,s}=scene('heal_help');
  const before=JSON.stringify(G.state);G.convoFavorAction(vid,favor);G.convoFavorAction(vid,favor);
  T.ok('readiness query does not mutate game state',JSON.stringify(G.state)===before);
  G.convoFavorCommit(vid,favor);G.convoPerformFavor(vid,favor);
  T.ok('real wound care keeps exactly the promised obligation',v.promises[vid].kept===true&&favor.state==='fulfilled');
 }
 {
  const {v,vid,favor}=scene('heal_help');const hp=v.health[vid];K.fight(G,'hushwolf');
  T.ok('actual combat blocks both dispatch and canonical tending',!!G.inCombat()&&!G.convoPerformFavor(vid,favor).ok&&G.tendVillager(vid)===null&&v.health[vid]===hp);
 }
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1});
