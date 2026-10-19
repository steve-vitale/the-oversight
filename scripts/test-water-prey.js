#!/usr/bin/env node
'use strict';
// Production module order and methods; only state/grid fixtures are prepared.
const path=require('path'),assert=require('assert/strict');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const {loadGame,setupGame}=require(path.join(root,'scripts/sim-harness'));
const seed=Number(process.env.SEED||20261017);let checks=0;
function check(name,value){assert(value,name);checks++;console.log('PASS '+name);}
(async()=>{
 const {Game:G,loadFails}=await loadGame({seed,narration:true});check('complete shared module load',loadFails.length===0);await setupGame(G);
 const s=G.state.scholar,t=G.playerTile(),detail=G.genDetail(G.map.px,G.map.py);
 function prepare(id,wet=true){
  for(const row of detail)row.fill('dirt');if(wet)detail[4][5]='water';
  s.mx=4;s.my=4;s.kcal=2400;s.health=100;s.inventory=[];s.tools=[];s.famTier='stranger';s.originTags=['mars'];
  t.type='creek';t.wildlife={[id]:5};t.detailRegrow={};G.log=[];
  const cfg=G.encPreyCfg(id);s.animal={id,mx:5,my:4,aware:0,hunger:30,stamina:cfg.stamina,pstate:'graze',edgeTurns:0,wild:true};return s.animal;
 }
 // Baseline fails on the actual defect before any new API expectation.
 for(const id of ['common_carp','crucian_carp','japanese_eel']){
  const a=prepare(id);G.encMissReact(a,G.encAnimalDef(id));
  check(id+' missed strike submerges instead of land bolt',a.pstate==='hiding');
  check(id+' miss keeps exact water position',a.mx===5&&a.my===4);
  G.animalTurn();check(id+' hiding stays underwater',a.pstate==='hiding'&&a.mx===5&&a.my===4);
  const kcal=s.kcal,inventory=JSON.stringify(s.inventory);G.huntAnimal();
  check(id+' hidden public strike awards nothing and spends no strike calories',s.kcal===kcal&&JSON.stringify(s.inventory)===inventory&&s.animal===a);
  check(id+' hidden public strike explains refusal',G.log.some(x=>/under the water/.test(x.text||x)));
  G.animalTurn();G.animalTurn();check(id+' resurfaces after three actual turns',a.pstate==='graze');
 }
 const fish=G.data.animals.filter(a=>a.waterAffinity==='in');check('all17 explicit fish habitats present',fish.length===17);
 const amphibious=new Set(['bullfrog','snapping_turtle']);
 check('line-method fauna declare water habitat or documented amphibious exception',G.data.animals.filter(a=>a.method.includes('line')).every(a=>['in','near'].includes(a.waterAffinity)||amphibious.has(a.id)));
 for(const def of fish){
  let a=prepare(def.id);s.animal=null;for(let n=0;n<80&&!s.animal;n++)G.checkAnimals();a=s.animal;
  check(def.id+' actual spawn uses visible interior water',a&&a.id===def.id&&a.mx===5&&a.my===4&&t.wildlife[def.id]===4);
  for(let n=0;n<8&&s.animal;n++)G.animalTurn();
  check(def.id+' ordinary turns remain on water',s.animal&&G.encWaterCell(detail,a.mx,a.my));
  a=prepare(def.id,false);s.animal=null;for(let n=0;n<12;n++)G.checkAnimals();
  check(def.id+' absent water prevents spawn without population loss',!s.animal&&t.wildlife[def.id]===5);
 }
 // Exercise actual calm-water movement away from the player, not just hiding.
 let swimmer=prepare('common_carp');s.mx=0;s.my=0;detail[4][6]='water';let moved=false,stayedWet=true;
 for(let n=0;n<160;n++){G.animalTurn();moved=moved||swimmer.mx!==5||swimmer.my!==4;stayedWet=stayedWet&&G.encWaterCell(detail,swimmer.mx,swimmer.my);}
 check('actual calm swimming moves within water and never onto shore',moved&&stayedWet);
 swimmer=prepare('common_carp');s.mx=0;s.my=0;swimmer.hunger=90;detail[4][6]='plant';
 for(let n=0;n<60;n++)G.animalTurn();
 check('fish do not graze terrestrial plants or leave water for food',detail[4][6]==='plant'&&G.encWaterCell(detail,swimmer.mx,swimmer.my));
 // Saved invalid positions are reconciled without generating a catch.
 let a=prepare('common_carp');a.mx=6;G.animalTurn();check('dry saved fish moves to nearest existing water',a.mx===5&&a.my===4&&s.inventory.length===0);
 a=prepare('common_carp',false);G.animalTurn();check('dry saved fish with no water returns to wildlife',!s.animal&&t.wildlife.common_carp===6&&s.inventory.length===0);
 a=prepare('common_carp');a.pstate='bolt';a.aware=1;G.animalTurn();check('old saved bolt submerges in place',a.pstate==='hiding'&&a.mx===5&&a.my===4);
 // The actual generic flee roll must pay the existing50 kcal and never step on land.
 let evaded=false;
 for(let n=0;n<60&&!evaded;n++){
  a=prepare('common_carp');a.aware=1;const kcal=s.kcal,stamina=a.stamina;
  if(G.encStrikeReact(a)){
   evaded=true;check('strike evasion hides without moving',a.pstate==='hiding'&&a.mx===5&&a.my===4);
   check('strike evasion retains paid50 calorie cost',s.kcal===kcal-50);
   check('water evasion does not invent a land stamina chase',a.stamina===stamina);
   check('water evasion remains an encounter',s.animal===a);
  }
 }
 check('actual seeded strike-evasion branch reached',evaded);
 // Public hunt still has a reachable kill/carcass outcome; hiding is not immunity.
 let caught=false;
 for(let n=0;n<80&&!caught;n++){
  a=prepare('common_carp');a.aware=0;G.huntAnimal();caught=s.inventory.some(it=>it.animalId==='common_carp'||it.plantId==='meat_common_carp');
 }
 check('actual surfaced public hunt can produce a fish carcass',caught);
 a=prepare('cottontail_rabbit');G.encMissReact(a,G.encAnimalDef(a.id));check('land prey still bolts on a miss',a.pstate==='bolt');G.animalTurn();check('land prey keeps ordinary land movement',!G.encWaterCell(detail,a.mx,a.my));
 a=prepare('bullfrog');G.encMissReact(a,G.encAnimalDef(a.id));check('amphibian keeps its existing water miss reaction',a.pstate==='hiding'&&!G.encWaterPrey(a.id));
 let bedCatch=false;for(let n=0;n<80&&!bedCatch;n++){prepare('bluegill');s.animal.pstate='hiding';G.huntAnimal();bedCatch=s.inventory.some(it=>it.plantId==='meat_bluegill');}
 check('hidden bed-guarder remains catchable through actual public hunt',bedCatch);
 let sameTileEvaded=false;for(let n=0;n<60&&!sameTileEvaded;n++){a=prepare('common_carp');s.mx=5;s.my=4;a.aware=1;if(G.encStrikeReact(a)){sameTileEvaded=true;check('same-tile fish evasion skips land panic-scatter',a.mx===5&&a.my===4&&a.pstate==='hiding');}}
 check('same-tile evasion reached through actual flee roll',sameTileEvaded);
 for(const def of G.data.animals){
  G.state.codex.animals={};G.state.codex.animalEncounters={};
  check(def.id+' unknown cue gated',!G.encAnimalKnown(def.id)&&G.encAnimalCue(def.id)===null);
  G.encIdentifyAnimal(def.id);check(def.id+' learned cue is substantive',G.encAnimalKnown(def.id)&&typeof G.encAnimalCue(def.id)==='string'&&G.encAnimalCue(def.id).length>30);
 }
 s.inventory=[];s.tools=[];check('unimplemented net is not a free ready method',G.encMethodToolReady('net')===false);
 check('unknown method is not silently ready',G.encMethodToolReady('nonexistent_method')===false);
 check('known free methods remain ready',G.encMethodToolReady('hands')&&G.encMethodToolReady('chase')&&G.encMethodToolReady('stick'));
 check('fishing line absent is unprepared',!G.encMethodToolReady('line'));s.inventory=[{name:'Fishing line'}];check('actual named fishing line prepares method',G.encMethodToolReady('line'));
 console.log('WATER_PREY_RESULT '+JSON.stringify({seed,checks,fish:fish.length,caught,evaded}));
})().catch(error=>{console.error(error.stack);process.exitCode=1});
