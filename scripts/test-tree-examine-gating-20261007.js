// Tree knowledge: one shared Game, explicit region, actual inspect/forage verbs.
'use strict';
const K=require('./godpath/lib');
const T=K.reporter('tree-examine-gating');
(async()=>{
  const G=await K.load({seed:Number(process.env.SEED||20261007),narration:true});
  function fresh(region='na_eastern_woodlands'){
    G.debugRegion=region;K.newRun(G,'Columbus, Ohio');
    T.ok('explicit landing region: '+region,G.state.region===region);
    return G.state.scholar;
  }
  function invoke(fn){const at=G.log.length,result=fn();return {result,text:G.log.slice(at).map(l=>typeof l==='string'?l:l.text).join('\n')};}
  // Prepare a local clearing and one adjacent tree in the actual detail array.
  // No travel search, copied coordinates, or genDetail override.
  function tree(species,cell='tree'){
    const s=G.state.scholar;if(s.insideHaven)G.exitBuilding();
    const tile=G.playerTile(),detail=G.genDetail(G.map.px,G.map.py);
    s.mx=4;s.my=4;s.inventory=[];s.monster=null;s.animal=null;
    tile.type='forest_floor';tile.stock=20;tile.maxStock=20;
    for(let y=2;y<=6;y++)for(let x=2;x<=6;x++)detail[y][x]='grass';
    detail[4][5]=cell;
    tile.modifiers=tile.modifiers||{};tile.secrets=tile.secrets||{};
    tile.modifiers['5,4']={species,health:'healthy',ivy:false,known:false};
    tile.secrets['5,4']={yield:3,known:false};tile.detailRegrow={};
    G.state.codex.examined={};G.state.codex.treeStudy={};
    T.ok('prepared actual adjacent '+cell,detail[4][5]===cell&&G.playerTile()===tile&&Math.max(Math.abs(s.mx-5),Math.abs(s.my-4))===1);
    return {s,tile,secret:tile.secrets['5,4']};
  }
  let s=fresh();
  T.ok('NA common trees are authored oak/hickory',G.treeLevel('oak')===1&&G.treeLevel('hickory')===1);
  T.ok('NA rare pine starts unnamed',G.treeLevel('pine')===0&&G.treeName('pine')===null);
  fresh('africa_sahel_savanna');
  T.ok('Sahel common trees are baobab/acacia',G.treeLevel('baobab')===1&&G.treeLevel('acacia')===1);
  T.ok('Sahel does not acquire NA common trees',G.treeLevel('oak')===0&&G.treeLevel('hickory')===0);
  for(const species of ['oak','hickory']){
    s=fresh();const f=tree(species),pid=G.regionTreeNut(species),plant=G.data.plants.find(p=>p.id===pid);
    T.ok(species+': real authored nut exists',!!plant&&G.cellPlantSpecies(f.tile,5,4,'tree')===pid);
    G.state.codex.plants={};
    T.ok(species+': tree known, nut explicitly unknown',G.treeName(species)===species&&!G.plantKnown(pid));
    const inspected=invoke(()=>G.cellInteract(5,4));
    T.ok(species+': surface inspect names known tree',new RegExp('this '+species,'i').test(inspected.text)&&!/don.t recognize|not sure what kind/i.test(inspected.text),inspected.text);
    T.ok(species+': inspect offers separate forage',/Forage nuts/i.test(inspected.text)&&f.secret.known);
    T.ok(species+': surface inspect takes no nuts',s.inventory.length===0&&f.secret.yield===3&&!f.tile.detailRegrow['5,4']);
    const examined=invoke(()=>G.examineCell(5,4));
    T.ok(species+': live examine names known tree',new RegExp('\\b'+species+'\\b','i').test(examined.text),examined.text);
    T.ok(species+': live examine takes no nuts or plant knowledge',s.inventory.length===0&&f.secret.yield===3&&!G.plantKnown(pid));
    const gathered=invoke(()=>G.cellInteract(5,4));
    const lumps=s.inventory.filter(i=>i.foodState==='unknown'&&i.lump&&i.lump[pid]?.units>0);
    T.ok(species+': separate real forage harvests unknown nuts',lumps.length>0&&!!f.tile.detailRegrow['5,4'],gathered.text);
    T.ok(species+': hidden lump does not leak nut identity',lumps.length>0&&lumps.every(i=>!i.name.toLowerCase().includes(plant.name.toLowerCase())));
    T.ok(species+': harvesting unknown nuts does not identify them',!G.plantKnown(pid));
    fresh();const known=tree(species);G.state.codex.plants={};
    T.ok(species+': actual identification succeeds',G.identifyPlant(pid,'taught','Mara')===true&&G.plantKnown(pid));
    invoke(()=>G.cellInteract(5,4));const named=invoke(()=>G.cellInteract(5,4));
    T.ok(species+': learned nut becomes named inventory',known.s.inventory.some(i=>i.plantId===pid&&i.foodState!=='unknown'),named.text);
  }
  for(const cell of ['tree','bigtree']){
    fresh();const f=tree('pine',cell);
    const inspected=invoke(()=>G.cellInteract(5,4));
    T.ok(cell+': surface inspection hides unknown species',/don.t recognize/i.test(inspected.text)&&!/\bpine\b/i.test(inspected.text),inspected.text);
    for(let study=0;study<3;study++){
      const examined=invoke(()=>G.examineCell(5,4));
      T.ok(cell+': unknown species stays hidden before third deep study '+study,!/\bpine\b/i.test(examined.text)&&!G.treeName('pine'),examined.text);
    }
    const learned=invoke(()=>G.examineCell(5,4));
    T.ok(cell+': third deep study actually teaches species',G.treeName('pine')==='pine'&&G.treeLevel('pine')===1&&/\bpine\b/i.test(learned.text),learned.text);
    T.ok(cell+': studies never harvest',f.s.inventory.length===0&&f.secret.yield===3);
  }
  delete G.debugRegion;T.done();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
