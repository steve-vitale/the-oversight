'use strict';
const K=require('./lib'),fs=require('fs'),assert=require('assert/strict'),T=K.reporter('Forage partner guards');
(async()=>{
 const fixture=JSON.parse(fs.readFileSync(K.ROOT+'/evidence/2026-10-27/forage-phone-fixture-r1.json'));
 const phone=JSON.parse(fs.readFileSync(K.ROOT+'/evidence/2026-10-27/forage-phone-immediate-r3/receipt-736.json'));
 const raw=phone.trace.find(t=>t.label==='field gathering offered 0').state.committed;
 const G=await K.load({seed:7}),store=new Map();
 globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 function scene(){store.clear();for(const[k,v]of Object.entries(fixture.storage))store.set(k,v);store.set(fixture.setup.key,raw);assert(G.load(fixture.setup.key));const id=fixture.setup.npc;return{id,s:G.state.scholar,v:G.state.village,f:G.convoGetFavor(id)};}
 function resources(){return JSON.stringify({pack:G.state.scholar.inventory,ticks:G.state.scholar.dayTicks,pantry:G.state.village.pantry});}
 {const{id,f}=scene();T.ok('actual field checkpoint has a ready public gather and one actual temporary partner',G.convoFavorAction(id,f).ready&&G.forageFavorCompanions().includes(id));}
 {const{id,f}=scene();G.hurtVillager(id,10000,'prepared guard proof');
  T.ok('canonical incoming damage actually kills the partner',G.getPerson(id)?.dead||!G.state.village.roster.includes(id));
  const before=resources(),r=G.convoPerformFavor(id,f);T.ok('dead partner cannot gather, spend effort or fabricate food',!r.ok&&resources()===before);
  T.ok('dead partner is removed from temporary companion exposure',!G.forageFavorCompanions().includes(id));
 }
 {const{id,v,f}=scene();v.away[id]={days:2,kind:'prepared-away-signal'};const before=resources(),r=G.convoPerformFavor(id,f);
  T.ok('prepared away partner is truthfully unavailable with no paid work',!r.ok&&/actual map tile/.test(r.line)&&resources()===before);
  T.ok('away partner is not a temporary traveling companion',!G.forageFavorCompanions().includes(id));
 }
 {const{id,f}=scene();G.npcSetNode(id,0,0);const before=resources(),r=G.convoPerformFavor(id,f);
  T.ok('actual different-node partner cannot receive imaginary gather work',!r.ok&&/actual map tile/.test(r.line)&&resources()===before);
 }
 {const{id,v,f}=scene();v.positions[id]={mx:8,my:8};const before=resources(),r=G.convoPerformFavor(id,f);
  T.ok('distant partner gives an adjacent-position instruction without charging',!r.ok&&/beside/.test(r.line)&&resources()===before);
  const units=f.forageRun.gatheredUnits;G.doAction('forage');
  T.ok('actual ordinary foraging while separated never borrows joint credit',f.forageRun.gatheredUnits===units&&!G.state.scholar.inventory.some(i=>i.forageShares?.[f.id]));
 }
 {const{id,s,v,f}=scene();G.travelTo(v.px,v.py);G.exitBuilding();s.mx=6;s.my=5;G.npcSetInside(id,true);v.positions[id]={mx:6,my:4};const before=resources(),r=G.convoPerformFavor(id,f);
  T.ok('opposite Haven door sides require an actual indoor meeting',!r.ok&&/inside the Haven hall/.test(r.line)&&resources()===before);
 }
 {const{id,s,v}=scene();G.travelTo(v.px,v.py);const other=v.roster.find(x=>x!==id&&x!==G.villagerId&&!G.getPerson(x).dead);assert(other);
  const f=G.convoBuildFavor(other,{kind:'water_haul',water:0});G.convoStoreFavor(f);assert(G.convoFavorCommit(other,f).ok);
  s.day=f.meetDay;G.dayPart=0;s.insideHaven=false;s.mx=7;s.my=5;G.npcSetNode(other,v.px,v.py);G.npcSetInside(other,false);v.positions[other]={mx:6,my:5};
  const before=resources(),r=G.convoPerformFavor(other,f);
  T.ok('an active actual foraging outing blocks a second water expedition',!r.ok&&/current foraging outing/.test(r.line)&&!f.waterRun&&resources()===before,JSON.stringify(r));
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
