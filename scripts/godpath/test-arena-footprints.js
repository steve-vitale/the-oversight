'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),K=require('./lib'),T=K.reporter('Arena world isolation and footprints');
(async()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
 const G=await K.load({seed:52});K.newRun(G);
 const sample=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-23/calendar-merchant99-combat-r1-trace.json.gz')))).starts[0];
 K.restoreCombatCapture(G,{state:sample.state,fight:sample.runtime.tbfight,bearer:sample.state.scholar.villagerId,map:sample.runtime.map,location:sample.state.run.location,dayPart:sample.runtime.dayPart,people:[]});
 function overlap(f){const seen=new Set();let n=0;for(const a of f.fighters.filter(x=>x.alive&&!x.fled))for(const [x,y]of G.fighterTiles(a)){if(seen.has(x+','+y))n++;seen.add(x+','+y);}return n;}
 const home=JSON.stringify(G.tileAt(4,4)),bodies=G.tbfight.fighters.map(x=>({key:x.key,hp:x.hp,maxHp:x.maxHp}));
 T.ok('the actual retained arena capture reproduces overlapping giant footprints',overlap(G.tbfight)>0);
 G.save();const key=G.state.runKey;G.load(key);
 T.ok('Continue repairs whole legacy bodies without dropping or healing anyone',overlap(G.tbfight)===0&&JSON.stringify(G.tbfight.fighters.map(x=>({key:x.key,hp:x.hp,maxHp:x.maxHp})))===JSON.stringify(bodies));
 T.ok('repaired actors fit actual battle collision and bounds',G.tbfight.fighters.every(a=>G.tbCanOccupy(a,a.mx,a.my)));
 T.ok('the arena has separate bare ground instead of the Haven gardens and house',G.genDetail(G.map.px,G.map.py).every(row=>row.every(cell=>cell==='dirt'))&&JSON.stringify(G.tileAt(4,4))===home);
 const positions=G.tbfight.fighters.map(a=>[a.key,a.mx,a.my]),size=G.tbGridSize();G.save();G.load(key);
 T.ok('a second Continue preserves repaired geometry instead of reshuffling it',JSON.stringify(G.tbfight.fighters.map(a=>[a.key,a.mx,a.my]))===JSON.stringify(positions)&&G.tbGridSize()===size);
 for(let i=0;i<10;i++)G.campaignInjectMonster('strike');
 T.ok('shared campaign and rerun injection expands a dense grid rather than stacking giants',G.tbGridSize()>9&&G.tbfight.fighters.length===15&&overlap(G.tbfight)===0);
 T.ok('every injected full footprint remains legal',G.tbfight.fighters.every(a=>G.tbCanOccupy(a,a.mx,a.my)));
 G.save();const large=G.tbGridSize();G.load(key);T.ok('expanded arena and full actor count survive native Continue',G.tbGridSize()===large&&G.tbfight.fighters.length===15&&overlap(G.tbfight)===0);
 T.ok('density repair and all save cycles leave the actual Haven unchanged',JSON.stringify(G.tileAt(4,4))===home);
 G.tbEnd('fled');T.ok('leaving the arena returns the actual saved Haven ground',!G.state.arenaContest&&!G.tbfight&&G.genDetail(G.map.px,G.map.py).some(row=>row.includes('lodge')));

 K.restoreCombatCapture(G,{state:sample.state,fight:sample.runtime.tbfight,bearer:sample.state.scholar.villagerId,map:sample.runtime.map,location:sample.state.run.location,dayPart:sample.runtime.dayPart,people:[]});G.tbArrangeFootprints();
 let turns=0;while(G.tbfight&&turns++<125)G.tbPlayerWait();
 T.ok('the real zero-damage guard ends a stalemate without a contest prize win',!G.tbfight&&K.teleEvents(G,'contest_end').at(-1)?.outcome==='lost');
 K.newRun(G);G.exitBuilding();G.state.scholar.day=20;
 const world={id:'hummice',tx:G.map.px,ty:G.map.py,mx:1,my:1,hp:7,maxHp:40,veteran:true};G.worldMonsters().push(world);
 const origin={bearer:G.villagerId,mx:G.state.scholar.mx,my:G.state.scholar.my,insideHaven:G.state.scholar.insideHaven,location:G.location};
 const ac=structuredClone(sample.state.activeContest);ac.arenaSuspended=true;G.state.activeContest=ac;G.state.arenaContest={contestId:'pit',waves:['strike'],waveIdx:0};
 G.startCombat('strike');
 T.ok('fresh arena entry neither consumes nor inherits the wounded world beast',G.worldMonsters().includes(world)&&world.hp===7&&G.tbfight.fighters.filter(x=>x.kind==='monster').every(m=>!m.veteran&&m.hp>=1000));
 const people=JSON.stringify(G.state.village.positions),ally=G.tbfight.fighters.find(x=>x.kind==='villager');
 if(ally){ally.mx=G.tbGridMax();ally.my=G.tbGridMax();G.tbVillagerSyncPos(ally);}
 T.ok('arena ally coordinates never overwrite residents standing at home',JSON.stringify(G.state.village.positions)===people);
 const p=G.tbFighter('p');let moved=false;for(const [dx,dy]of [[0,1],[1,0],[0,-1],[-1,0]])if(G.tbCanOccupy(p,p.mx+dx,p.my+dy)){moved=!!G.tbPlayerMove(p.mx+dx,p.my+dy);break;}
 T.ok('the prepared contestant can really move within the separate arena',moved);
 G.save();const movedKey=G.state.runKey;G.load(movedKey);
 T.ok('the pre-arena return location survives the real save',JSON.stringify(G.state.arenaContest.origin)===JSON.stringify(origin));
 G.tbEnd('fled');
 T.ok('arena teardown returns this bearer to their original world position and scene',G.villagerId===origin.bearer&&G.state.scholar.mx===origin.mx&&G.state.scholar.my===origin.my&&G.state.scholar.insideHaven===origin.insideHaven&&G.location===origin.location);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
