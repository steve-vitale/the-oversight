'use strict';
const path=require('path'),root=path.resolve(process.argv[2]||path.join(__dirname,'../..')),K=require(path.join(root,'scripts/godpath/lib')),T=K.reporter('table-entry');
(async()=>{
 const store=new Map();global.localStorage={getItem:k=>store.get(String(k))??null,setItem:(k,v)=>store.set(String(k),String(v)),removeItem:k=>store.delete(String(k)),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const G=await K.load({seed:7});let s,v,pg;
 function fresh(){G.tbfight=null;G.over=false;G.won=false;K.newRun(G);s=G.state.scholar;v=G.state.village;pg=G.progState();s.day=100;s.kcal=1800;s.health=100;s.integration=40;s.insideHaven=true;s.monster=null;G.playerTile().type='haven';G.state.systemArrived=true;G.state.networkLive=true;pg.arc=4;pg.tableWaiting=true;pg.tableDone=false;pg.table={};pg.sentimentTaught=true;pg.feastSurgeUsed=true;pg.crises={raid:true,illness:true};pg.deeds={wavesFaced:{},contestsSurvived:2};for(const[w,n]of [[1,4],[2,4],[3,3]])for(const m of G.data.monsters.filter(m=>m.wave===w).slice(0,n))pg.deeds.wavesFaced[m.id]=w;G.tablePreview();}
 const source=K.readSrc('src/js/app.js'),start=source.indexOf('              try {',source.indexOf('// THE TABLE SEAT (Steve 2026-10-14)')),end=source.indexOf('              if (Game.state.pendingGlobal)',start);if(start<0||end<0)throw Error('Missing actual Haven Table block');
 const render=new Function('Game','esc','let html="";\n'+source.slice(start,end)+'\nreturn html;'),handler=source.split('\n').find(l=>l.includes("document.querySelectorAll('[data-table-seat]')"));if(!handler)throw Error('Missing actual seat binding');
 function bind(button){new Function('Game','document','refresh',handler)(G,{querySelectorAll:()=>[button]},()=>{});}
 function reload(){const ok=G.load(G.state.runKey);s=G.state.scholar;v=G.state.village;pg=G.progState();return ok;}
 function blocked(label,reason){const ac=G.state.activeContest,f=G.tbfight,kcal=s.kcal,day=s.day,r=G.tableTakeSeat();T.ok(label,r?.ok===false&&reason.test(r.msg||''));T.ok(label+' preserves scene ownership and paid state',!pg.tableDone&&!pg.table.endingKey&&!s.tableChoices&&G.state.activeContest===ac&&G.tbfight===f&&s.kcal===kcal&&s.day===day);}
 fresh();T.ok('real earned lesser seat is available inside the Haven panel',G.tableSeat().seat==='lesser'&&G.havenStoresAccess()==='inside'&&G.tablePreview()?.ready===true);
 T.ok('actual Haven renderer offers an enabled seat',/data-table-seat>/.test(render(G,String)));
 T.ok('actual public seating commits paths and Table pause',G.tableTakeSeat().ok===true&&pg.tableDone&&G.tableState().phase==='paths'&&G.tableActive());
 const locked=G.tableState().endingKey;T.ok('second seat attempt cannot re-enter the committed story',G.tableTakeSeat().ok===false&&pg.tableDone&&locked&&G.tableState().endingKey===locked);
 G.save();const key=G.state.runKey;T.ok('real save/load retains committed Table ownership',G.load(key)&&G.progState().tableDone&&G.tableActive());
 fresh();s.day=89;T.ok('no preview or explanatory ending leak before day90',G.tablePreview()===null&&G.tableTakeSeat().ok===false&&G.tableTakeSeat().msg==='');
 fresh();pg.feastSurgeUsed=false;T.ok('food-use requirement remains a real entry gate',G.tablePreview()===null&&G.tableTakeSeat().ok===false&&!pg.tableDone);
 fresh();pg.tableWaiting=false;T.ok('ready deeds alone do not synthesize an invitation',G.tablePreview()===null&&G.tableTakeSeat().ok===false);
 fresh();s.insideHaven=false;T.ok('outside neural-stage bearer keeps a priced but unavailable preview',G.tablePreview()?.seat==='lesser'&&G.tablePreview()?.ready===false);blocked('outside native Haven access cannot seat',/Haven/);
 fresh();s.insideHaven=false;s.integration=80;T.ok('existing full-integration remote panel access stays valid',G.havenStoresAccess()==='remote'&&G.tablePreview()?.ready===true&&G.tableTakeSeat().ok===true);
 fresh();s.exiled=true;s.integration=100;blocked('exile cannot bypass the actual panel access rule',/Haven/);
 fresh();G.over=true;blocked('ended expedition cannot begin another story',/ended/);
 fresh();G.won=true;blocked('won expedition cannot take another seat',/ended/);
 fresh();s.monster={id:'review_drone',mx:5,my:4};blocked('pending encounter cannot be skipped by seating',/encounter/);
 fresh();const roster=v.roster.slice();K.fight(G,'review_drone',{px:3,py:4,mx:4,my:4,hp:100});v.roster=roster;const f=G.tbfight;
 T.ok('live real tactical fight disables the priced preview',G.inCombat()&&G.tablePreview()?.ready===false);blocked('live tactical fight retains ownership',/encounter/);
 T.ok('actual Haven renderer disables combat entry and explains why',/data-table-seat disabled/.test(render(G,String))&&/Finish the current encounter/.test(render(G,String)));
 G.save();T.ok('actual tactical save/load retains the entry refusal',reload()&&G.inCombat()&&G.tablePreview()?.ready===false);blocked('loaded fight cannot be overwritten',/encounter/);
 G.tbEnd('fled');T.ok('actual encounter settlement restores ordinary seating',!G.inCombat()&&G.tablePreview()?.ready===true&&G.tableTakeSeat().ok===true);
 fresh();const baseContest=G.data.contests.find(c=>c.id==='moot');if(!baseContest)throw Error('Missing moot');
 // Prepared optional entry; the refusal proof must not depend on a random offer.
 const contest={...baseContest,givesChoice:true};G.contestInterruption(contest,['player']);const ac=G.state.activeContest;
 T.ok('prepared real optional contest offers a refusal',ac?.phases?.[0]?.choices?.[1]?.next==='REFUSE');
 T.ok('actual player contest disables entry without cancelling its choice',ac?.participant==='player'&&G.tablePreview()?.ready===false);blocked('actual current contest retains ownership',/contest/);
 const html=render(G,String);T.ok('actual Haven renderer explains contest ownership',/data-table-seat disabled/.test(html)&&/Finish the current contest/.test(html));
 G.save();T.ok('actual active-contest save/load retains the refusal',reload()&&G.state.activeContest?.participant==='player'&&G.tablePreview()?.ready===false);blocked('loaded contest cannot be overwritten',/contest/);
 G.contestChoose(1);T.ok('actual contest refusal settles before a later seat can be taken',!G.state.activeContest&&G.tablePreview()?.ready===true&&G.tableTakeSeat().ok===true);
 fresh();const button={};bind(button);G.contestInterruption(contest,['player']);const staleContest=G.state.activeContest;button.onclick();T.ok('previously enabled native handler rechecks actual contest at click time',!pg.tableDone&&G.state.activeContest===staleContest&&!s.tableChoices);
 fresh();G.state.activeContest={contestId:'moot',participant:v.roster.find(id=>id!==G.villagerId),phase:'watch'};blocked('persisted watched contest cannot be overwritten',/contest/);
 fresh();const scene=G.tableScene;G.tableScene=()=>{};try{T.ok('success receipt requires actual scene commitment',G.tableTakeSeat().ok===false&&!pg.tableDone);}finally{G.tableScene=scene;}
 fresh();G.tableTakeSeat();G.tableTrialByCombat();T.ok('Table-owned champion trial remains a real playable fight',G.tableActive()&&G.inCombat()&&G.tableTrialFight());
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
