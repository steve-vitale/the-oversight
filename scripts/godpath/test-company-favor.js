'use strict';
const path=require('path'),K=require(path.join(process.env.COMPANY_ROOT||path.resolve(__dirname,'../..'),'scripts/godpath/lib')),P=require('../lib/conversation-playtest'),T=K.reporter('Night company favor');
(async()=>{
 const G=await K.load({seed:7002}),store=new Map();globalThis.localStorage={get length(){return store.size;},key:i=>[...store.keys()][i]??null,getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 function scene(inside=true){
  K.newRun(G);const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);
  G.map.px=v.px??4;G.map.py=v.py??4;G.location='haven';s.insideHaven=inside;s.day=4;s.dayTicks=384;s.actionClock=0;G.dayPart=3;s.kcal=6000;s.health=80;s.energy=40;s.hydration=100;G.pendingEncounter=false;s.monster=null;
  v.away={};v.assignments={};v.taskLeads={};v.gardenKeeper=null;v.promises={};v.favorLedger={};v.engaged={};
  const grid=G.genDetail(G.map.px,G.map.py),fire=grid.flatMap((row,y)=>row.map((cell,x)=>cell==='fire'?{mx:x,my:y}:null)).find(Boolean);
  if(!fire)throw Error('Generated hall has no actual hearth');
  const slots=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=fire.mx+dx,y=fire.my+dy;if(grid[y]?.[x]&&!G.cellProps(grid[y][x]).blocks)slots.push({mx:x,my:y});}
  const a=slots.find(a=>slots.some(b=>b!==a&&Math.max(Math.abs(a.mx-b.mx),Math.abs(a.my-b.my))<=1)),b=slots.find(b=>b!==a&&Math.max(Math.abs(a.mx-b.mx),Math.abs(a.my-b.my))<=1);
  Object.assign(s,a);G.npcSetNode(vid,G.map.px,G.map.py);G.npcSetInside(vid,inside);v.positions={[vid]:{...b}};v.health={...v.health,[vid]:100};Object.assign(G.npcNeeds(vid),{fear:90,hunger:10,social:60,energy:80});
  const favor=G.convoBuildFavor(vid,{kind:'stay_close',fear:90});G.convoStoreFavor(favor);return{v,s,vid,favor,grid,fire,a,b};
 }
 let c=scene();T.ok('the real request exposes supported company instead of an impossible job',!G.convoFavorAction(c.vid,c.favor).unsupported);
 if(typeof G.performCompanyFavor!=='function'){T.ok('the real implementation is loaded',false);T.done();return;}
 T.ok('a new ask names tonight rather than tomorrow',c.favor.companyNight===c.s.day&&c.favor.deadline===c.s.day);
 T.ok('acceptance creates the exact same-night obligation',G.convoFavorCommit(c.vid,c.favor).ok&&G.promiseDueDay(c.v.promises[c.vid])===c.s.day);
 G.checkPromises('social',c.vid,{words:true,companyFavorId:c.favor.id});T.ok('generic social work and a forged receipt cannot keep it',!c.v.promises[c.vid].kept);
 const before=JSON.stringify(G.state);for(let n=0;n<3;n++){G.convoFavorAction(c.vid,c.favor);G.journalPromises(c.vid);}T.ok('readiness and journal projections leave the entire state unchanged',JSON.stringify(G.state)===before);
 const kcal=c.s.kcal,ticks=c.s.dayTicks,joined=G.convoPerformFavor(c.vid,c.favor);
 T.ok('joining starts company without pretending the night is done',joined.ok&&joined.incomplete&&c.favor.company.active&&!c.v.promises[c.vid].kept);
 T.ok('joining alone grants neither fear relief nor free time/food',G.npcNeeds(c.vid).fear===90&&c.s.kcal===kcal&&c.s.dayTicks===ticks);
 const saved=JSON.parse(store.get(G.state.runKey));T.ok('the active company is immediately durable',saved.village.favorLedger[c.vid].company.active&&saved.village.promises[c.vid].companyNight===4);
 G.tickAction(32);T.ok('one real batch records attendance but cannot finish before dawn',c.favor.company.presentTicks===32&&!c.v.promises[c.vid].kept);
 const key=G.state.runKey;T.ok('the actual paid interval saves progress before any explicit save or unload',JSON.parse(store.get(key)).village.favorLedger[c.vid].company.presentTicks===32);
 T.ok('Continue restores the recorded stretch',G.load(key)&&G.convoGetFavor(c.vid).company.presentTicks===32&&G.convoGetFavor(c.vid).company.active);
 const f=G.convoGetFavor(c.vid),v=G.state.village;const completed=G.convoPerformFavor(c.vid,f);
 T.ok('real clock time through dawn keeps the exact promise',completed.ok&&!completed.incomplete&&v.promises[c.vid].kept===true&&f.state==='fulfilled'&&G.state.scholar.day===5,JSON.stringify({completed,p:v.promises[c.vid],r:f.company}));
 T.ok('the company receipt records meaningful paid presence',f.company.completed&&f.company.presentTicks>=32&&f.company.completedAt===5*G.TIME.TICKS_PER_DAY);
 T.ok('awake company does not grant sleeping recovery',G.state.scholar.health<=80&&G.state.scholar.energy<100);
 const final=JSON.parse(store.get(key));T.ok('completion and actual waking costs are saved before unload',final.village.promises[c.vid].kept===true&&final.scholar.day===5&&final.scholar.kcal===G.state.scholar.kcal);
 const trust=v.trust[c.vid],fear=G.npcNeeds(c.vid).fear,day=G.state.scholar.day;T.ok('repeat completion cannot duplicate reward or time',!G.convoPerformFavor(c.vid,f).ok&&v.trust[c.vid]===trust&&G.npcNeeds(c.vid).fear===fear&&G.state.scholar.day===day);
 {
  c=scene();c.s.dayTicks=501;const state=JSON.stringify(G.state),menu=G.convoFavorActionMenu(c.vid,c.favor,true);
  T.ok('a last-second commitment is neither offered nor accepted',!menu.some(x=>x.id==='dlg:commit')&&!G.convoFavorCommit(c.vid,c.favor).ok&&!c.v.promises[c.vid]);
  T.ok('late refusal costs and changes nothing',JSON.stringify(G.state)===state);
 }
 {
  c=scene();G.convoFavorCommit(c.vid,c.favor);G.tickAction(128);
  T.ok('missing the actual night breaks at its dawn, without an extra day',c.v.promises[c.vid].kept==='broken'&&c.v.promises[c.vid].closedReason==='deadline'&&c.favor.state==='broken');
 }
 {
  c=scene();G.convoFavorCommit(c.vid,c.favor);G.convoPerformFavor(c.vid,c.favor);G.tickAction(32);c.s.mx=0;c.s.my=0;G.tickAction(32);
  T.ok('separation pauses company rather than keeping a distant promise',!c.favor.company.active&&!c.v.promises[c.vid].kept&&/next|left/i.test(c.favor.company.reason));
  Object.assign(c.s,c.a);const rejoined=G.convoPerformFavor(c.vid,c.favor);T.ok('rejoining requires a new continuous stretch and retains spent history',rejoined.ok&&c.favor.company.presentTicks===0&&c.favor.company.totalTicks===32);
  T.ok('the new real stretch can finish within the same night',G.convoPerformFavor(c.vid,c.favor).ok&&c.v.promises[c.vid].kept===true);
 }
 {
  c=scene();G.convoFavorCommit(c.vid,c.favor);c.v.npcInside[c.vid]=false;
  T.ok('being on the other side of the hall door is a real blocker',!G.convoFavorAction(c.vid,c.favor).ready&&/outside|grounds/i.test(G.convoFavorAction(c.vid,c.favor).reason));c.v.npcInside[c.vid]=true;
  c.v.assignments[c.vid]={task:'forage'};T.ok('an assigned worker cannot simultaneously promise attendance',!G.convoFavorAction(c.vid,c.favor).ready&&!G.companyFavorHolding(c.vid));delete c.v.assignments[c.vid];
  c.v.gardenKeeper=c.vid;G.convoPerformFavor(c.vid,c.favor);T.ok('company reserves a caretaker without silently removing their standing role',G.companyFavorHolding(c.vid)&&!G.gardenKeeperReady(c.vid)&&c.v.gardenKeeper===c.vid);
  const old=G.villagerId;G.villagerId=c.vid;T.ok('a successor cannot inherit or self-fulfill attendance',!G.companyFavorHolding(c.vid)&&!G.convoFavorAction(c.vid,c.favor).ready);G.villagerId=old;
 }
 {
  c=scene();G.convoFavorCommit(c.vid,c.favor);G.convoPerformFavor(c.vid,c.favor);
  const turn=G.monsterTurn;let triggered=false;G.monsterTurn=function(){if(!triggered){triggered=true;K.fight(this,'gallowdeer',{px:3,py:4,mx:5,my:4});}return undefined;};
  const result=G.convoPerformFavor(c.vid,c.favor);G.monsterTurn=turn;
  T.ok('a real encounter interrupts company without auto-resolution or credit',!!G.tbfight&&!c.favor.company.active&&!c.v.promises[c.vid].kept&&result.incomplete);
 }
 {
  c=scene();G.convoFavorCommit(c.vid,c.favor);delete c.favor.companyVersion;delete c.favor.companyNight;delete c.v.promises[c.vid].companyVersion;delete c.v.promises[c.vid].companyNight;
  c.favor.deadline=1;c.v.promises[c.vid].favorDeadline=1;c.s.dayTicks=501;
  G.save();const k=G.state.runKey;T.ok('legacy unavailable obligations load without retroactive punishment',G.load(k)&&!G.state.village.promises[c.vid].kept&&G.promiseDueDay(G.state.village.promises[c.vid])===5);
  G.save();const due=G.promiseDueDay(G.state.village.promises[c.vid]);G.load(k);T.ok('the migration deadline is pinned rather than refreshed on every Continue',G.promiseDueDay(G.state.village.promises[c.vid])===due);
 }
 {
  c=scene();G.convoFavorCommit(c.vid,c.favor);G.convoPerformFavor(c.vid,c.favor);G.sleep();
  T.ok('real nearby Sleep can keep a presence promise without becoming a watch shift',c.v.promises[c.vid].kept===true&&G.state.scholar.day===5&&G.state.scholar.energy===100&&G.state.scholar.health>80);
 }
 {
  c=scene();G.convoFavorCommit(c.vid,c.favor);G.convoPerformFavor(c.vid,c.favor);G.tickAction(32);const ticks=c.s.dayTicks;G.exitBuilding();
  T.ok('a free door crossing interrupts attendance immediately and durably',!c.favor.company.active&&c.s.dayTicks===ticks&&!JSON.parse(store.get(G.state.runKey)).village.favorLedger[c.vid].company.active);
 }
 {
  c=scene(false);G.convoFavorCommit(c.vid,c.favor);G.convoPerformFavor(c.vid,c.favor);const ticks=c.s.dayTicks,x=G.map.px+1,y=G.map.py;Object.assign(G.map.tiles[y][x],{needsBridge:false,blockage:null});G.travelTo(x,y);
  T.ok('free map travel cannot preserve a fireside attendance streak',!c.favor.company.active&&c.s.dayTicks===ticks&&!c.v.promises[c.vid].kept);
 }
 {
  c=scene();G.convoFavorCommit(c.vid,c.favor);const far=c.grid.flatMap((row,y)=>row.map((cell,x)=>!G.cellProps(cell).blocks&&Math.max(Math.abs(x-c.fire.mx),Math.abs(y-c.fire.my))>2?{mx:x,my:y}:null)).find(Boolean);
  c.v.positions[c.vid]={...far};const grid=JSON.stringify(c.grid),energy=G.npcNeeds(c.vid).energy;G.tickAction(32);const pos=c.v.positions[c.vid];
  T.ok('the requester walks a real paid batch step toward the fire',Math.abs(pos.mx-far.mx)+Math.abs(pos.my-far.my)===1&&G.npcNeeds(c.vid).energy===energy-1);
  T.ok('meeting movement preserves the actual map and door side',JSON.stringify(c.grid)===grid&&c.v.npcInside[c.vid]===true);
 }
 {
  c=scene();G.convoFavorCommit(c.vid,c.favor);const p={pid:null};G.gardenPlant(p,'lambs_quarters',c.s.day-30);p.weeds=3;p.lastTend=c.s.day-1;G.playerTile().plots=[p];c.v.gardenKeeper=c.vid;
  G.convoPerformFavor(c.vid,c.favor);G.gardenKeeperTurn();G.resolveOneAssignment(c.vid,{task:'garden'});
  T.ok('active company prevents real caretaker work rather than duplicating labor',p.weeds===3&&p.lastTend===c.s.day-1);
  G.performCompanyFavor(c.vid,c.favor,true);G.gardenKeeperTurn();
  T.ok('ending company restores the unchanged standing caretaker role',c.v.gardenKeeper===c.vid&&G.gardenKeeperReady(c.vid)&&p.weeds===0&&p.lastTend===c.s.day);
 }
 {
  c=scene(false);G.convoFavorCommit(c.vid,c.favor);const dawn=(c.s.day+1)*G.TIME.TICKS_PER_DAY;
  G.state.fires=[{tx:G.map.px,ty:G.map.py,cx:c.fire.mx,cy:c.fire.my,till:dawn-1,burn0:128,lastTax:G._absTick()}];
  T.ok('a player fire that cannot cover the night requires actual feeding',!G.convoFavorAction(c.vid,c.favor).ready&&/feed/i.test(G.convoFavorAction(c.vid,c.favor).reason));
  G.state.fires[0].till=dawn;G.convoPerformFavor(c.vid,c.favor);const proximity=G.checkVillageProximity;G.checkVillageProximity=function(){this.sweepDeadFires();return proximity.apply(this,arguments);};
  G.convoPerformFavor(c.vid,c.favor);G.checkVillageProximity=proximity;
  T.ok('a fire burning exactly until dawn counts even when the real sweep clears it at dawn',c.v.promises[c.vid].kept===true,JSON.stringify({company:c.favor.company,p:c.v.promises[c.vid]}));
 }
 {
  c=scene();c.v.favorLedger={};G.convoPlantSeed(c.vid,{wantId:'ask_favor',note:'prepared urgent fear; no fabricated favor or reply'});G.startConvo(c.vid);
  const f=G.convoGetFavor(c.vid);T.ok('real conversation opening authors the live company request',f?.kind==='stay_close'&&f.companyNight===4,JSON.stringify({f,choices:P.offers(G,c.vid).map(x=>x.id)}));
  const commitment=P.reach(G,c.vid,['dlg:commit']);T.ok('a real offered acceptance is reachable without clearing question state',!!commitment);
  if(commitment){P.choose(G,c.vid,'dlg:commit');T.ok('the dialogue acceptance creates the exact obligation',c.v.promises[c.vid]?.favorId===f.id&&!c.v.promises[c.vid].kept);
   const offered=P.reach(G,c.vid,['dlg:favor_action']);T.ok('the real post-acceptance menu exposes the next physical action',!!offered,JSON.stringify(P.offers(G,c.vid).map(x=>x.id)));
   if(offered){P.choose(G,c.vid,'dlg:favor_action');T.ok('the real dialogue Join starts rather than falsely completes company',f.company?.active&&!c.v.promises[c.vid].kept);
    const continued=P.reach(G,c.vid,['dlg:favor_action']);T.ok('the actual Continue-company action remains reachable',!!continued);
    if(continued){P.choose(G,c.vid,'dlg:favor_action');T.ok('the actual dialogue time action reaches dawn and keeps the promise',c.v.promises[c.vid].kept===true&&G.state.scholar.day===5);}
   }
  }
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
