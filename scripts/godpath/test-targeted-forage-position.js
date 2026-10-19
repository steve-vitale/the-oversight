'use strict';
const K=require('./lib'),T=K.reporter('targeted-forage-position');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||20261017),narration:true});
 function prepare(cell){
  G.debugRegion='na_eastern_woodlands';K.newRun(G);const s=G.state.scholar;if(s.insideHaven)G.exitBuilding();
  const tile=G.playerTile(),d=G.genDetail(G.map.px,G.map.py);tile.type='forest_floor';tile.stock=20;tile.maxStock=20;tile.detailRegrow={};
  for(let y=2;y<=6;y++)for(let x=2;x<=6;x++)d[y][x]='grass';
  d[4][5]=cell;s.mx=4;s.my=4;s.inventory=[];s.monster=null;s.animal=null;s.kcal=6000;
  tile.modifiers=tile.modifiers||{};tile.secrets=tile.secrets||{};tile.plantSpecies=tile.plantSpecies||{};tile.bushSpecies=tile.bushSpecies||{};
  tile.modifiers['5,4']={species:'oak',health:'healthy',ivy:false,known:false};tile.secrets['5,4']={yield:3,known:false};
  tile.plantSpecies['5,4']='dandelion';tile.bushSpecies['5,4']='blackberry';G.state.codex.plants={};
  return{s,tile,d};
 }
 const clock=()=>G.state.scholar.day*512+G.state.scholar.dayTicks;
 for(const cell of ['tree','bigtree']){
  const {s,tile,d}=prepare(cell);const pid=G.regionTreeNut('oak');
  T.ok(cell+': actual authored target blocks movement',!!G.cellProps(d[4][5]).blocks);
  const inspect=G.cellInteract(5,4);
  T.ok(cell+': inspect really marks tree known',!!inspect&&tile.secrets['5,4'].known&&s.inventory.length===0);
  const before={clock:clock(),kcal:s.kcal};const harvested=G.cellInteract(5,4);
  T.ok(cell+': explicit public forage succeeds',!!harvested&&!!tile.detailRegrow['5,4']);
  T.ok(cell+': harvest remains on original legal ground',s.mx===4&&s.my===4&&!G.cellProps(d[s.my][s.mx]).blocks);
  T.ok(cell+': actual nuts reach unknown lump',s.inventory.some(i=>i.foodState==='unknown'&&i.lump?.[pid]?.units>0));
  T.ok(cell+': unknown nut identity remains gated',!G.plantKnown(pid)&&s.inventory.filter(i=>i.lump?.[pid]).every(i=>!i.name.toLowerCase().includes(G.data.plants.find(p=>p.id===pid).name.toLowerCase())));
  T.ok(cell+': forage still pays time and food',clock()>before.clock&&s.kcal<before.kcal);
 }
 for(const cell of ['plant','bush','grass']){
  const {s,tile,d}=prepare(cell);
  if(cell==='grass'){d[4][6]='plant';tile.plantSpecies['6,4']='dandelion';}
  const before={clock:clock(),kcal:s.kcal};G.doAction('forage',{cx:5,cy:4});
  T.ok(cell+': passable target still recenters forage',s.mx===5&&s.my===4&&!G.cellProps(d[s.my][s.mx]).blocks);
  T.ok(cell+': real adjacent plants harvested',s.inventory.some(i=>i.lump&&Object.values(i.lump).some(p=>p.units>0)));
  T.ok(cell+': passable forage still pays time and food',clock()>before.clock&&s.kcal<before.kcal);
 }
 for(const [label,target]of [['far',{cx:8,cy:8}],['outside',{cx:-1,cy:4}],['fraction',{cx:4.5,cy:4}],['missing',{cx:undefined,cy:4}]]){
  const {s}=prepare('plant');G.doAction('forage',target);
  T.ok(label+': invalid target cannot relocate player',s.mx===4&&s.my===4);
 }
 delete G.debugRegion;T.done();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
