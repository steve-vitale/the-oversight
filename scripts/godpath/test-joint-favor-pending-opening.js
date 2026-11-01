'use strict';
const K=require('./lib'),P=require('../lib/conversation-playtest'),fs=require('fs'),assert=require('assert/strict'),T=K.reporter('Pending joint favor opening');
(async()=>{
 const G=await K.load({seed:7}),store=new Map();
 globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 for(const[kind,file]of [['forage_help','evidence/2026-10-27/forage-phone-fixture-r1.json'],['water_haul','evidence/2026-10-20/water-favor-phone-fixture-r2.json']]){
  const fixture=JSON.parse(fs.readFileSync(K.ROOT+'/'+file));store.clear();for(const[k,v]of Object.entries(fixture.storage))store.set(k,v);assert(G.load(fixture.setup.key));
  const id=fixture.setup.npc;G.startConvo(id);assert(P.offers(G,id).some(c=>c.id==='dlg:commit'));P.choose(G,id,'dlg:commit');const key=G.state.runKey,accepted=store.get(key);assert(accepted);
  assert(G.load(key));const before=JSON.stringify({state:G.state,map:G.map}),random=Math.random;let draws=0;Math.random=function(){draws++;return random();};let phase;
  try{phase=G.convoJointFavorOpening(id);}finally{Math.random=random;}
  T.ok(kind+' pending opening observes actual accepted meeting without mutation or RNG',draws===0&&before===JSON.stringify({state:G.state,map:G.map})&&phase?.wantId==='repay');
  const opening=G.startConvo(id),offers=P.offers(G,id);
  T.ok(kind+' spoken physical phase establishes the actual want stage',G.convoGet(id).want?.stage>=1);
  T.ok(kind+' actual reopened conversation leads with dawn instead of clipped acceptance recall',/dawn/.test(opening.line)&&!/never finished|got cut off|No point pretending/.test(opening.line));
  T.ok(kind+' accepted task exposes requirements without accepting the same promise again',offers.some(c=>c.id==='dlg:favor_requirements')&&!offers.some(c=>c.id==='dlg:commit'));
  const cost=()=>JSON.stringify({pack:G.state.scholar.inventory,kcal:G.state.scholar.kcal,ticks:G.state.scholar.dayTicks,water:G.state.scholar.water}),old=cost(),explained=P.choose(G,id,'dlg:favor_requirements');
  T.ok(kind+' actual offered requirement explains the meeting for free',/dawn|day 5/.test(explained.line)&&cost()===old&&!G.state.village.promises[id].kept);
  // Actual capability removal recreates the old native failure on the exact
  // accepted bytes, rather than just asserting a helper returns a new string.
  store.set(key,accepted);const hook=G.convoJointFavorOpening;G.convoJointFavorOpening=()=>null;
  let oldOpening,oldOffers;try{assert(G.load(key));oldOpening=G.startConvo(id);oldOffers=P.offers(G,id);}finally{G.convoJointFavorOpening=hook;}
  T.ok(kind+' removed shared priority loses the actual meeting requirement controls',!oldOffers.some(c=>c.id==='dlg:favor_requirements'),JSON.stringify({line:oldOpening.line,ids:oldOffers.map(c=>c.id)}));
  if(kind==='forage_help')T.ok('removed priority recreates the exact forage clipped-acceptance recall',/never finished|got cut off/.test(oldOpening.line));
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
