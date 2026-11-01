'use strict';
const K=require('./lib'),T=K.reporter('Explicit ledger-aware pursuit'),P=require('../policies/ledger-aware');
(async()=>{
 const G=await K.load({seed:12});K.newRun(G);
 const s=G.state.scholar;s.day=60;s.health=100;s.kcal=G.kcalCap();s.prog=s.prog||{};s.prog.sentimentTaught=true;s.prog.feastSurgeUsed=true;s.insideHaven=false;s.insideTent=false;
 G.ledgerState()[1].points=5;G.ledgerState()[2].points=2;G.ledgerState()[2].perType.voice_mimic_radio=2;
 for(const def of G.data.monsters.filter(d=>d.wave===2).slice(0,6))G.deedState().wavesFaced[def.id]=2;
 const need=P.need(G);T.ok('actual wave2 unlock deficit remains after the face bar is complete',need.wave===2&&G.unlockedWave()===2&&G.deedGateReady().w2>=4);
 const def=G.data.monsters.find(d=>d.wave===2&&d.id!=='voice_mimic_radio');
 T.ok('an uncapped wave2 type can pay the actual remaining unlock points',P.canCredit(G,need,{id:def.id}));
 T.ok('repeating a capped type and fighting a different wave cannot fill this deficit',!P.canCredit(G,need,{id:'voice_mimic_radio'})&&!P.canCredit(G,need,{id:'hummice'}));
 const snapshot=JSON.stringify(G.state);P.need(G);P.canCredit(G,need,{id:def.id});T.ok('planning does not mutate the ledger or invent credit',JSON.stringify(G.state)===snapshot);
 G.ledgerState()[2].points=4;T.ok('completed ledger no longer requests these hunts',P.need(G)===null);G.ledgerState()[2].points=2;
 // Prepared current field: actual public combat and costs, never a kill grant.
 const tile=G.playerTile(),m=G.spawnWorldMonster({id:def.id},G.map.px,G.map.py,{mx:5,my:4});s.mx=4;s.my=4;
 const beforePoints=G.waveLedgerPoints(2),ctx={};P.play(G,ctx);
 T.ok('eligible current-field monster starts a real fight through shared public approach',!!G.tbfight&&ctx.ledgerAwareness.approaches===1);
 T.ok('starting a fight does not grant kill points or a Table deed',G.waveLedgerPoints(2)===beforePoints&&!G.won);
 const state=JSON.stringify(G.state),fight=G.tbfight;P.play(G,ctx);T.ok('busy combat is left to normal parent fight decisions',JSON.stringify(G.state)===state&&G.tbfight===fight&&ctx.ledgerAwareness.reasons.busy===1);
 // Parent hook composition remains independent of the prepared live fight.
 const parent={id:'endgame-counter-aware-probe',desc:'probe',setup(g,c){c.setup=true;},upkeep(g,c){c.upkeep=true;},daily(g,c){c.daily=true;},fight(){return'parent-fight';},diagnostics(){return{parent:true};}};
 const wrapped=P.wrap(parent),c={};wrapped.setup(G,c);wrapped.upkeep(G,c);wrapped.daily(G,c);
 T.ok('all parent hooks, fight policy and diagnostics survive the added upkeep',c.setup&&c.upkeep&&c.daily&&wrapped.fight()=== 'parent-fight'&&wrapped.diagnostics(c).parent);
 T.ok('new mixed hunts cannot inherit a misleading non-hunter label',wrapped.diagnostics(c).profile==='ledger-aware-probe'&&wrapped.diagnostics(c).mode==='ledger-seeking-mixed');
 c.ledgerAwareness.errors.push('prepared ledger error');c.publicTravelErrors=['prepared movement error'];
 T.ok('both new layer and movement errors reach the shared census',wrapped.diagnostics(c).errors.includes('prepared ledger error')&&wrapped.diagnostics(c).errors.includes('prepared movement error'));
 T.ok('four clearly named variants leave original non-hunter IDs intact',P.profiles().map(p=>p.id).join(',')==='ledger-aware-capable,ledger-aware-maker,ledger-aware-merchant,ledger-aware-caregiver');
 G.tbfight=null;G.state.run.tbfight=null;
 for(const [kind,value,reason]of[['health',G.maxHealth()*0.69,'hurt'],['kcal',G.kcalCap()*0.39,'food_reserve']]){
  const old=s[kind];s[kind]=value;const state=JSON.stringify(G.state),c={};P.play(G,c);T.ok('actual '+reason+' guard spends nothing',JSON.stringify(G.state)===state&&c.ledgerAwareness.reasons[reason]===1);s[kind]=old;
 }
 const already={_ledgerSortieKey:G.villagerId+':'+s.day+':'+G.dayPart},untouched=JSON.stringify(G.state);P.play(G,already);
 T.ok('a repeated upkeep cannot buy another sortie in the same day part',JSON.stringify(G.state)===untouched&&already.ledgerAwareness.reasons.sortie_already_attempted===1);
 const guardState=JSON.stringify(G.state);require('../policies/capable').approachHuntTarget(G,{}, {m},'ledger',()=>false);
 T.ok('invalid bearer or target ownership aborts before any shared approach action',JSON.stringify(G.state)===guardState&&!G.tbfight);
 G.ledgerState()[2].perType[def.id]=2;
 const exploration={};P.play(G,exploration);
 T.ok('a capped local monster leads to an actual scoped public crossing attempt',exploration.ledgerAwareness.sorties===1&&exploration.publicTravelCounters?.requests===1&&exploration.publicTravelReceipts?.length===1);
 T.ok('exploration retains actual movement or an explicit refusal and reports no swallowed errors',!!exploration.publicTravelReceipts[0].reason&&exploration.ledgerAwareness.errors.length===0&&!(exploration.publicTravelErrors||[]).length);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
