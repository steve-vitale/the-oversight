#!/usr/bin/env node
'use strict';
// Presence contracts through the complete production harness. State fixtures
// isolate episodes; real Game methods/RNG/cost/death/knowledge paths stay live.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1]};
const root=path.resolve(arg('root',path.join(__dirname,'..'))),H=require(path.join(root,'scripts/sim-harness'));
const seed=Number(process.env.SEED||3),receipt={seed,episodes:[]};let checks=0;
function ok(name,value){assert(value,name);checks++;console.log('PASS '+name);}
const NARR=[/day of their life/,/came back with .* kcal of something edible/,/The pantry breathes/,/is hurt — a fall/,/brought you a sample/,/traded something with someone/,/staring into the fire like it owes them answers/,/paces the hall/,/Quiet mending sounds/,/comparing scars like trading cards/,/told a joke by the fire/,/showing .* how to tie a snare/,/got the fire going big/,/Fireside lesson/,/is showing everyone .* by the fire/,/drew .* in the dirt for the others/,/KNOWLEDGE COMBINES/,/You were listening/,/Nobody's talking much/,/arguing about the watch rotation/,/laugh — a real one/,/notice you listening/,/passes .* around the fire/,/IDENTIFIED \(maybe\)/];
(async()=>{
 const {Game:G,loadFails}=await H.loadGame({seed,narration:true});ok('complete shared production module load',loadFails.length===0);
 let s,v;
 const lines=()=>G.log.map(x=>String(x.text??x));
 const narrated=()=>lines().some(l=>NARR.some(rx=>rx.test(l)));
 async function fresh(){await H.quietLog(()=>H.setupGame(G));s=G.state.scholar;v=G.state.village;s.abilities=[];s.inventory=[];G.log.length=0;}
 function home(){G.map.px=v.px??4;G.map.py=v.py??4;}
 function away(){G.map.px=(v.px??4)>=3?(v.px??4)-3:(v.px??4)+3;G.map.py=v.py??4;}
 await fresh();home();ok('actual home is in narration range',G.playerAtHaven());
 const homePantry=G.pantryKcalLive(v);for(let n=0;n<24;n++)G.villageLives();
 ok('fixed home episode emits actual village narration',narrated());
 ok('fixed home episode brings real food to the pantry',G.pantryKcalLive(v)>homePantry);
 receipt.episodes.push({kind:'home',calls:24,pantryBefore:homePantry,pantryAfter:G.pantryKcalLive(v),lines:lines()});
 await fresh();home();const hx=G.map.px,hy=G.map.py;
 G.map.px=hx+1;ok('one-node home neighborhood retains presence',G.playerAtHaven());
 G.map.px=hx+2;ok('two nodes away is outside home presence',!G.playerAtHaven());
 away();ok('prepared remote episode is actually away',!G.playerAtHaven());
 const awayPantry=G.pantryKcalLive(v),rosterBefore=v.roster.slice();
 for(let n=0;n<60;n++)G.villageLives();
 ok('all60 real remote village calls complete without swallowing exceptions',!G.over&&G.state.village===v);
 ok('remote autonomous foraging actually increases pantry food',G.pantryKcalLive(v)>awayPantry);
 ok('remote simulation never emits home-only narration',!narrated());
 receipt.episodes.push({kind:'away',calls:60,pantryBefore:awayPantry,pantryAfter:G.pantryKcalLive(v),rosterBefore,rosterAfter:v.roster.slice(),lines:lines()});
 // Teaching cases do not inherit the24+60 simulation calls' lesson pool.
 for(const present of [false,true]){
  await fresh();present?home():away();
  const people=v.roster.filter(id=>id!==G.villagerId);ok('teaching has real living teacher and learner',people.length>=2);
  const teacher=people[0],learner=people[1],known=G.plantsKnownBy(learner),wrong=G.villagerWrongAbout(teacher)||{};
  const plants=G.data.plants.filter(p=>!known.includes(p.id)&&!wrong[p.id]).slice(0,2);ok('two real initially unknown lessons are available',plants.length===2);
  for(const p of plants)G.villagerLearnsPlant(teacher,p.id,'prepared presence proof');
  let learned=0;const lessons=[];
  // Eight fixed sessions, never stop on a favorable player learn roll.
  for(let n=0;n<8;n++){
   for(const p of plants)delete G.state.codex.plants[p.id];
   v.sharedKnowledge=Object.fromEntries(plants.map(p=>[p.id,{taughtAround:false,discoveredBy:teacher,level:2,taughtDay:0}]));
   G.log.length=0;G.firesideTeaching();
   const taught=plants.filter(p=>v.sharedKnowledge[p.id].taughtAround),player=plants.filter(p=>G.plantKnown(p.id));
   ok((present?'home':'away')+' lesson'+n+' marks exactly the actual selected village lesson',taught.length===1&&v.sharedKnowledge[taught[0].id].taughtDay===s.day);
   ok((present?'home':'away')+' lesson'+n+' teaches the real resident learner',G.plantsKnownBy(learner).includes(taught[0].id));
   if(!present){ok('away lesson'+n+' grants no player knowledge',player.length===0);ok('away lesson'+n+' emits no fireside narration',!narrated());}
   else{ok('home lesson'+n+' is actually narrated',narrated());learned+=player.length;}
   lessons.push({taught:taught.map(p=>p.id),player:player.map(p=>p.id),lines:lines()});
  }
  if(present)ok('player actually learns during the fixed eight home sessions',learned>0);
  receipt.episodes.push({kind:present?'teaching-home':'teaching-away',teacher,learner,lessons});
 }
 // Explicit false-knowledge cases: remote residents still learn a wrong claim,
 // but the absent player's Codex and narration must remain untouched.
 for(const present of [false,true]){
  await fresh();present?home():away();const people=v.roster.filter(id=>id!==G.villagerId),teacher=people[0],learner=people[1];
  const plant=G.data.plants.find(p=>!G.plantsKnownBy(learner).includes(p.id)),wrongPlant=G.data.plants.find(p=>p.id!==plant.id);
  G.villagerLearnsPlant(teacher,plant.id,'prepared false-knowledge proof');
  G.villagerWrongAbout(teacher)[plant.id]={wrongPid:wrongPlant.id,deliberate:false};
  delete G.state.codex.plants[plant.id];v.sharedKnowledge={[plant.id]:{taughtAround:false,discoveredBy:teacher,level:1}};G.log.length=0;
  ok('bad teacher '+(present?'home':'away')+' has an actual stored false claim',G.villagerWrongAbout(teacher)[plant.id].wrongPid===wrongPlant.id);
  G.firesideTeaching();
  ok('bad teacher '+(present?'home':'away')+' still marks the village lesson',v.sharedKnowledge[plant.id].taughtAround===true);
  ok('bad teacher '+(present?'home':'away')+' actually passes the false claim to a resident',G.plantsKnownBy(learner).includes(plant.id)&&G.villagerWrongAbout(learner)[plant.id]?.wrongPid===wrongPlant.id);
  ok('bad teacher '+(present?'home':'away')+(present?' teaches the attending player the false label':' grants no player Codex knowledge'),present?G.state.codex.plants[plant.id]?.wrongPid===wrongPlant.id:!G.state.codex.plants[plant.id]);
  ok('bad teacher '+(present?'home':'away')+' narration respects presence',present?narrated():!narrated());
  receipt.episodes.push({kind:present?'false-teaching-home':'false-teaching-away',teacher,learner,plant:plant.id,wrongPid:wrongPlant.id,player:G.state.codex.plants[plant.id]||null,resident:G.villagerWrongAbout(learner)[plant.id],lines:lines()});
 }
 // A fresh injured-village episode feeds the real death/news/homecoming chain.
 await fresh();away();s.awayNews=[];const population=v.roster.slice();v.health=v.health||{};
 for(const id of population.filter(id=>id!==G.villagerId))v.health[id]=1;
 // A fixed autonomy episode, not a retry-until-death loop. Low health alone
 // does not force the random injury branch on every call.
 for(let n=0;n<64;n++)G.villageLives();
 const dead=population.filter(id=>!v.roster.includes(id)),news=(s.awayNews||[]).slice();
 ok('remote injury episode actually removes living villagers',dead.length>0);
 ok('remote deaths use actual dead-person records',dead.every(id=>G.getPerson(id)?.dead));
 ok('remote deaths queue bounded away news',news.length>0&&news.length<=8&&news.every(l=>/died while you were gone/.test(l)));
 ok('remote deaths do not narrate a home skull line',!lines().some(l=>/💀/.test(l)));
 receipt.episodes.push({kind:'away-death',calls:64,dead,news,lines:lines()});
 s.day=12;s.lastHavenDay=5;G.log.length=0;G.returnToVillage();
 ok('real return pins the player to home',G.map.px===(v.px??4)&&G.map.py===(v.py??4)&&G.playerAtHaven());
 ok('seven-day return emits its actual homecoming beat',lines().some(l=>/days gone|Knew you'd walk back in|come home after/.test(l)&&/7 days/.test(l)));
 ok('actual queued death news is delivered on return',lines().some(l=>/While you were gone/.test(l))&&news.slice(0,5).every(l=>lines().includes(l)));
 ok('delivered away news is consumed',s.awayNews.length===0);
 ok('return resets actual last-Haven day',s.lastHavenDay===12);
 receipt.episodes.push({kind:'homecoming',lines:lines()});
 s.day=13;s.lastHavenDay=12;G.log.length=0;G.returnToVillage();
 ok('one-day trip does not emit a long-absence homecoming',!lines().some(l=>/days gone|Knew you'd walk back in|come home after/.test(l)));
 // Real travel into another generated fire; assertions require actual arrival.
 for(const trust of [15,0]){
  await fresh();const other=G.state.otherVillages[0];ok('another real village exists',!!other);
  other.generated=true;other.trust=trust;const nx=other.x>0?other.x-1:other.x+1;
  G.map.px=nx;G.map.py=other.y;s.monster=null;s.animal=null;G.log.length=0;
  G.reveal(other.x,other.y);G.travelTo(other.x,other.y,true);
  ok('actual travel arrives at the '+(trust?'trusted':'stranger')+' village',G.map.px===other.x&&G.map.py===other.y);
  ok(trust?'trusted clearing recognizes the player':'stranger clearing preserves guest wording',lines().some(l=>trust?/know your face here/.test(l):/act like it/.test(l)));
  receipt.episodes.push({kind:trust?'trusted-travel':'stranger-travel',trust,lines:lines()});
 }
 if(arg('out',null))fs.writeFileSync(arg('out'),JSON.stringify(receipt,null,2)+'\n');
 console.log('\n'+checks+' passed, 0 failed');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
