// Recognition: prepared unknown/known states through the actual shared runtime.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('examine-recognition');
(async () => {
  const G = await K.load({ seed:Number(process.env.SEED || 20261017), narration:true });
  const Ex = globalThis.Scattering.Examine;
  T.ok('examine module and live verb loaded', !!Ex && typeof G.examineCell === 'function');
  function freshUnknown() {
    K.newRun(G);
    G.state.codex.plants = {};
    G.state.codex.observations = {};
    G.state.codex.encounters = {};
    return G.state.scholar;
  }
  function invoke(fn) { const at=G.log.length; const result=fn(); return { result, text:G.log.slice(at).map(l=>typeof l==='string'?l:l.text).join('\n') }; }
  let s = freshUnknown();
  const pid='jewelweed', plant=G.data.plants.find(p=>p.id===pid);
  T.ok('prepared species exists and is unknown', !!plant && !G.plantKnown(pid));
  T.ok('unobserved depth zero', Ex.plantVisualDepth(pid)===0 && !Ex.observedPlant(pid));
  const q1=Ex.examineDescription(pid,1),q3=Ex.examineDescription(pid,3);
  T.ok('vague description exists', q1.length>10);
  T.ok('quality1 hides unknown species name', !q1.toLowerCase().includes(plant.name.toLowerCase()),q1);
  T.ok('quality3 hides unknown species name', !q3.toLowerCase().includes(plant.name.toLowerCase()),q3);
  T.ok('quality3 adds detail', q3.length>q1.length);

  // Prepare a real reachable plant cell; do not call the superseded
  // examinePlantCell helper to stand in for the live carexplore verb.
  if (s.insideHaven) G.exitBuilding();
  const tile=G.playerTile(),detail=G.genDetail(G.map.px,G.map.py);
  s.mx=4; s.my=4; s.inventory=[];tile.stock=10;
  for(let y=3;y<=5;y++)for(let x=3;x<=5;x++)detail[y][x]='grass';
  detail[4][5]='plant';tile.plantSpecies=tile.plantSpecies||{};tile.plantSpecies['5,4']=pid;
  delete (tile.detailRegrow||{})['5,4'];
  const examined=invoke(()=>G.examineCell(5,4));
  const observation=Ex.observationOf(pid);
  T.ok('live examination records actual observation', !!observation && observation.count===1 && observation.via.includes('examine'));
  T.ok('observed depth is one', Ex.observedPlant(pid) && Ex.plantVisualDepth(pid)===1);
  T.ok('live examination emits description without name', examined.text.length>0 && !examined.text.toLowerCase().includes(plant.name.toLowerCase()),examined.text);
  T.ok('prepared patch is actually forageable', globalThis.Scattering.forage.canForage(tile));
  const harvested=invoke(()=>G.doAction('forage'));
  const afterHarvest=Ex.observationOf(pid);
  T.ok('real harvest merges forage observation', !!afterHarvest && afterHarvest.count===2 && afterHarvest.via.includes('forage'),harvested.text);
  T.ok('unknown harvest is tracked in a hidden lump', s.inventory.some(i=>i.foodState==='unknown' && i.lump && i.lump[pid] && i.lump[pid].units>0));
  T.ok('unknown harvest label hides its species', s.inventory.filter(i=>i.lump).every(i=>!i.name.toLowerCase().includes(plant.name.toLowerCase())));
  const learned=invoke(()=>G.identifyPlant(pid,'taught','Mara'));
  T.ok('identification succeeds', learned.result===true);
  T.ok('identification is actually announced', /IDENTIFIED/.test(learned.text));
  T.ok('observed species gets emitted recognition beat', /clicks like a key|never unsee|words land/i.test(learned.text),learned.text);
  T.ok('identified depth is two', G.plantKnown(pid) && Ex.plantVisualDepth(pid)===2);

  freshUnknown();
  T.ok('control species is unobserved and unknown', !G.plantKnown('dandelion') && !Ex.observedPlant('dandelion'));
  const control=invoke(()=>G.identifyPlant('dandelion','taught','Mara'));
  T.ok('unobserved control really identifies', control.result===true && /IDENTIFIED/.test(control.text));
  T.ok('unobserved identification has no recognition beat', !/clicks like a key|never unsee|words land/i.test(control.text));
  T.ok('known description includes the learned name', Ex.examineDescription('dandelion',1).toLowerCase().includes('dandelion'));

  s=freshUnknown();
  s.abilities=[];s.backgroundAbilities=[];G.state.codex.skills={};
  const person=G.vpOf(G.villagerId);person.formerOccupation='electrician';
  const base=Ex.examineQuality();
  T.ok('prepared nonexpert quality is one', base===1,base);
  person.formerOccupation='botanist';
  T.ok('botanist improves actual quality', Ex.examineQuality()>base);
  let leaks=[];
  for (const p of G.data.plants) {
    T.ok('sweep species is unknown: '+p.id,!G.plantKnown(p.id));
    if(Ex.examineDescription(p.id,3).toLowerCase().includes(p.name.toLowerCase()))leaks.push(p.id);
  }
  T.ok('full unknown-plant sweep has no name leaks', G.data.plants.length>0 && leaks.length===0,JSON.stringify(leaks));
  console.log('Plant sweep species: '+G.data.plants.length);
  T.done();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
