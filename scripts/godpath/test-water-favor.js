'use strict';
const K=require('./lib'),P=require('../lib/conversation-playtest'),T=K.reporter('Joint water favor');
(async()=>{
 const G=await K.load({seed:7002}),store=new Map();
 globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 function scene(){
  K.newRun(G);const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);
  s.day=4;s.dayTicks=0;G.dayPart=0;s.kcal=6000;s.health=100;s.hydration=100;s.mx=4;s.my=4;s.insideHaven=false;
  v.px=v.px??4;v.py=v.py??4;G.map.px=v.px;G.map.py=v.py;v.away={};v.engaged={};v.promises={};v.favorLedger={};v.water={clean:2,dirty:0};
  G.npcSetNode(vid,v.px,v.py);G.npcSetInside(vid,false);v.positions[vid]={mx:4,my:5};v.health={...v.health,[vid]:100};
  const x=v.px+1,y=v.py,t=G.map.tiles[y][x];t.type='creek';t.revealed=true;t.needsBridge=false;t.blockage=null;
  t.detail=Array.from({length:9},()=>Array(9).fill('dirt'));t.detail[0][0]='water';
  G.markSeen(x,y,'visited');
  const favor=G.convoBuildFavor(vid,{kind:'water_haul',water:2});G.convoStoreFavor(favor);
  return{v,s,vid,favor,x,y};
 }
 const c=scene();
 T.ok('water requests offer a real supported lifecycle',!G.convoFavorAction(c.vid,c.favor).unsupported);
 T.ok('water progress has an executable contract',typeof G.waterFavorAction==='function'&&typeof G.performWaterFavor==='function');
 if(typeof G.performWaterFavor!=='function'){T.done();return;}
 T.ok('an asked request requires acceptance before starting',!G.convoFavorAction(c.vid,c.favor).ready&&/accept/i.test(G.convoFavorAction(c.vid,c.favor).reason));
 T.ok('a supported water favor can be accepted',G.convoFavorCommit(c.vid,c.favor).ok);
 T.ok('acceptance grants no water or completion',c.v.water.dirty===0&&!c.v.promises[c.vid].kept&&!c.favor.waterRun);
 T.ok('the promised first light is not the same afternoon',!G.convoFavorAction(c.vid,c.favor).ready&&/day 5/i.test(G.convoFavorAction(c.vid,c.favor).reason));
 c.s.day=5;G.dayPart=1;
 T.ok('the departure window requires dawn',!G.convoFavorAction(c.vid,c.favor).ready&&/dawn/i.test(G.convoFavorAction(c.vid,c.favor).reason));
 G.dayPart=0;const start=G.convoPerformFavor(c.vid,c.favor);
 T.ok('dawn starts an outing without completing the promise',start.ok&&start.incomplete&&c.favor.waterRun&&!c.v.promises[c.vid].kept);
 T.ok('the real requester accompanies this life without permanent party membership',G.travelingWith().includes(c.vid)&&!G.partyMembers().includes(c.vid));
 const trip=c.favor.waterRun,day=c.s.day,key=G.state.runKey;G.save();G.load(key);
 let f=G.convoGetFavor(c.vid);
 T.ok('Continue preserves the active companion and collection target',f.waterRun.target.x===c.x&&G.travelingWith().includes(c.vid));
 G.checkPromises('task',c.vid,{food:true,water:true});
 T.ok('unrelated task or delegated water receipts cannot complete a joint run',!G.state.village.promises[c.vid].kept);
 const moved=G.travelTo(c.x,c.y);
 T.ok('actual travel reaches the selected creek with the requester',G.map.px===c.x&&G.map.py===c.y&&G.npcNode(c.vid).nx===c.x&&!!G.state.village.positions[c.vid],JSON.stringify({moved,fight:!!G.tbfight,node:G.npcNode(c.vid)}));
 let s=G.state.scholar,v=G.state.village;v.positions[c.vid]={mx:s.mx,my:Math.min(8,s.my+1)};
 const before=s.kcal,weight=G.packWeight(),fill=G.convoPerformFavor(c.vid,f);
 T.ok('creek collection fills two real liters per person',fill.ok&&fill.incomplete&&s.water.filter(b=>b.favorId===f.id).length===2&&f.waterRun.partnerWater.length===2,JSON.stringify({fill,water:s.water,run:f.waterRun}));
 T.ok('collection pays four canonical fills and carries real player mass',before-s.kcal===40&&Math.abs(G.packWeight()-weight-2)<.001);
 T.ok('wild water stays risky and the cistern has not increased remotely',f.waterRun.partnerWater.every(b=>b.quality==='risky')&&s.water.filter(b=>b.favorId===f.id).every(b=>b.quality==='risky')&&v.water.dirty===0);
 G.save();G.load(key);f=G.convoGetFavor(c.vid);s=G.state.scholar;v=G.state.village;
 T.ok('Continue preserves collected cargo on both actual holders',f.waterRun.partnerWater.length===2&&s.water.filter(b=>b.favorId===f.id).length===2);
 G.travelTo(v.px,v.py);v.positions[c.vid]={mx:s.mx,my:Math.min(8,s.my+1)};
 const dirty=v.water.dirty,clean=v.water.clean;const delivered=G.convoPerformFavor(c.vid,f);
 T.ok('home handoff moves exactly four liters into dirty cistern stock',delivered.ok&&!delivered.incomplete&&v.water.dirty===dirty+4&&v.water.clean===clean,JSON.stringify(delivered));
 T.ok('handoff consumes both cargoes and keeps this exact obligation',!s.water.some(b=>b.favorId===f.id)&&f.waterRun.partnerWater.length===0&&v.promises[c.vid].kept===true&&f.state==='fulfilled');
 T.ok('temporary escort ends without changing permanent party',!G.travelingWith().includes(c.vid)&&!G.partyMembers().includes(c.vid));
 const stock=v.water.dirty;T.ok('completed handoff cannot duplicate water or rewards',!G.convoPerformFavor(c.vid,f).ok&&v.water.dirty===stock);
 {
  const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);s.day=5;G.convoPerformFavor(vid,favor);
  const before=JSON.stringify(G.state);G.convoFavorAction(vid,favor);G.journalPromises(vid);
  T.ok('readiness and journal progress do not mutate the expedition',JSON.stringify(G.state)===before);
  const maker=G.villagerId;G.villagerId=vid;s.villagerId=vid;
  T.ok('a successor cannot inherit the dead bearer escort as a free companion',!G.waterFavorCompanions().includes(vid));G.villagerId=maker;s.villagerId=maker;
 }
 {
  const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);s.day=5;
  s.seenTiles={[v.px+','+v.py]:{k:'v'}};
  T.ok('an unknown creek is neither revealed nor offered as a destination',!G.convoFavorAction(vid,favor).ready&&/known creek/i.test(G.convoFavorAction(vid,favor).reason));
  G.markSeen(v.px+1,v.py,'visited');s.inventory.push({name:'Prepared heavy load',units:1,kg:100});
  const before=JSON.stringify(G.state),result=G.convoPerformFavor(vid,favor);
  T.ok('insufficient carrying room gives a truthful no-cost refusal',!result.ok&&/room/.test(result.line)&&JSON.stringify(G.state)===before);
 }
 {
  const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);s.day=5;G.convoPerformFavor(vid,favor);
  G.checkPromises('task',vid,{waterFavorId:favor.id});
  T.ok('a claimed receipt without delivered physical cargo earns no credit',!v.promises[vid].kept);
  const before=v.trust[vid],result=G.performWaterFavor(vid,favor,true);
  T.ok('an unfinished trip can end at home without a fake completion',result.ok&&result.promiseMissed&&favor.waterRun.returned&&v.promises[vid].kept==='broken'&&v.water.dirty===0&&v.trust[vid]<before);
  T.ok('ending the trip releases only its temporary escort',!G.waterFavorCompanions().includes(vid));
 }
 {
  const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);s.day=5;G.convoPerformFavor(vid,favor);
  const water=JSON.stringify(v.water);G.resolveOneAssignment(vid,{task:'water'});
  T.ok('the partner cannot produce remote water-duty stock during the actual outing',JSON.stringify(v.water)===water);
  const node=JSON.stringify(G.npcNode(vid));G.npcNodeTravel();
  T.ok('an ongoing joint outing prevents an unrelated autonomous departure',JSON.stringify(G.npcNode(vid))===node&&!v.away?.[vid]);
 }
 {
  const {v,s,vid,favor,x,y}=scene();G.convoFavorCommit(vid,favor);s.day=5;G.convoPerformFavor(vid,favor);G.travelTo(x,y);
  v.positions[vid]={mx:s.mx,my:Math.min(8,s.my+1)};G.convoPerformFavor(vid,favor);
  s.day=favor.deadline+1;G.checkPromises();const trust=v.trust[vid];
  T.ok('a missed clock expires the task while the real cargo and return escort remain',v.promises[vid].kept==='broken'&&favor.state==='broken'&&G.waterFavorCompanions().includes(vid)&&favor.waterRun.partnerWater.length===2);
  const row=G.journalPromises(vid).find(p=>p.favorId===favor.id);
  T.ok('an expired journal still explains real carried water and the return',row.status==='expired'&&/carry|Walk back/.test(row.requirements),JSON.stringify(row));
  G.travelTo(v.px,v.py);v.positions[vid]={mx:s.mx,my:Math.min(8,s.my+1)};
  const result=G.convoPerformFavor(vid,favor);
  T.ok('late unloading transfers real water without restoring kept-promise credit',result.ok&&result.promiseMissed&&v.water.dirty===4&&v.promises[vid].kept==='broken'&&v.trust[vid]===trust);
 }
 {
  const {v,s,vid,favor,x,y}=scene(),person=G.getPerson(vid);s.languages={english:2};person.languages={native:'english',levels:{english:2}};
  G.convoPlantSeed(vid,{wantId:'ask_favor',favorId:favor.id,note:favor.short});G.startConvo(vid);
  if(!P.reach(G,vid,['dlg:commit']))throw Error('Actual request did not offer acceptance');P.choose(G,vid,'dlg:commit');G.endConvo(vid,'left');s.day=5;
  G.startConvo(vid);if(!P.reach(G,vid,['dlg:favor_action']))throw Error('Actual dawn did not offer departure');P.choose(G,vid,'dlg:favor_action');
  T.ok('the offered departure keeps the promise open instead of falsely completing it',favor.state==='promised'&&!v.promises[vid].kept);G.endConvo(vid,'left');
  G.travelTo(x,y);v.positions[vid]={mx:s.mx,my:Math.min(8,s.my+1)};G.startConvo(vid);P.choose(G,vid,'dlg:favor_action');G.endConvo(vid,'left');
  const key=G.state.runKey;G.save();G.load(key);G.travelTo(G.state.village.px,G.state.village.py);
  const s2=G.state.scholar;G.state.village.positions[vid]={mx:s2.mx,my:Math.min(8,s2.my+1)};
  for(let n=0;n<3;n++){G.startConvo(vid);T.ok('home visit '+n+' retains the offered physical handoff despite repeated/consumed opening seeds',P.offers(G,vid).some(o=>o.id==='dlg:favor_action'),JSON.stringify(P.offers(G,vid)));if(n<2)G.endConvo(vid,'left');}
  P.choose(G,vid,'dlg:favor_action');T.ok('the offered home handoff actually completes this saved request',G.state.village.promises[vid].kept===true&&G.state.village.water.dirty===4);
  T.ok('the finished transaction offers exit/silence instead of a confused recap',G.convoGet(vid).windingDown&&P.offers(G,vid).some(o=>o.id==='leave')&&P.offers(G,vid).every(o=>['leave','silence'].includes(o.id)),JSON.stringify(P.offers(G,vid)));
 }
 {
  const {v,s,vid,favor}=scene();G.convoFavorCommit(vid,favor);delete v.promises[vid].waterHaulVersion;s.day=40;
  const key=G.state.runKey;G.save();G.load(key);let p=G.state.village.promises[vid];
  T.ok('Continue gives old unplayable promises a one-time fair execution window',p.waterHaulVersion===1&&p.favorDeadline===42&&!p.kept&&G.convoGetFavor(vid).meetDay===41);
  G.state.scholar.day=41;G.save();G.load(key);p=G.state.village.promises[vid];
  T.ok('further Continue cannot keep extending that grace window',p.favorDeadline===42);
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
