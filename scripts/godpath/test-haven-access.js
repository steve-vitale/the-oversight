'use strict';
const K=require('./lib'),T=K.reporter('Haven entrance access');
(async()=>{
 const G=await K.load({seed:7002}),storage=new Map();
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>[...storage.keys()][i]??null,get length(){return storage.size;}};
 K.newRun(G);const originalSeed=G.detailSeed,s=G.state.scholar,t=G.playerTile();
 const walkable=(cells,x,y)=>!!cells[y]?.[x]&&cells[y][x]!=='lodge'&&!G.cellProps(cells[y][x]).blocks;
 function reach(cells,x,y){const seen=new Set(),q=[[x,y]];while(q.length){const[cx,cy]=q.shift(),k=cx+','+cy;if(seen.has(k)||!walkable(cells,cx,cy))continue;seen.add(k);for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])q.push([cx+dx,cy+dy]);}return seen;}
 const blocked=[],isolated=[],missing=[];
 for(let seed=0;seed<256;seed++){
  G.detailSeed=()=>seed;s.insideHaven=false;delete t.detail;delete t.groundsDetail;
  const cells=G.genDetail(G.map.px,G.map.py),r=reach(cells,4,5);
  if(!walkable(cells,4,5))blocked.push(seed);
  if(![...r].some(k=>k.endsWith(',8'))||![...r].some(k=>k.startsWith('0,'))||![...r].some(k=>k.startsWith('8,')))isolated.push(seed);
  if(cells.flat().filter(c=>c==='lodge').length!==6||cells[4][2]!=='fire'||!cells.flat().includes('tent'))missing.push(seed);
 }
 T.ok('256 private terrain seeds keep the south doorstep walkable after all placement',blocked.length===0,JSON.stringify(blocked.slice(0,16)));
 T.ok('the south approach reaches the south, east and west rims without crossing the lodge',isolated.length===0,JSON.stringify(isolated.slice(0,16)));
 T.ok('reservation preserves the hall, fire and a real camp shelter',missing.length===0,JSON.stringify(missing.slice(0,16)));
 G.detailSeed=originalSeed;
 K.newRun(G);let hall=G.playerTile(),body=G.state.scholar;
 const beforeKcal=body.kcal;
 T.ok('normal Step outside succeeds',G.exitBuilding()===true);
 T.ok('the hall door emerges south of the hall, not in the northern garden',body.mx===4&&body.my===5&&G.gardenCellAt(body.mx,body.my)===null,JSON.stringify({x:body.mx,y:body.my}));
 T.ok('door transit has not invented a walking charge',body.kcal===beforeKcal);
 const savedExit=JSON.parse(storage.get(G.state.runKey));
 T.ok('the completed exit is already saved before unload or a later action',savedExit.scholar.insideHaven===false&&savedExit.scholar.mx===4&&savedExit.scholar.my===5);
 const walkBefore=body.kcal;
 T.ok('a real paid step takes the player from the door toward the world',G.microMove(4,6)!==false&&body.mx===4&&body.my===6&&body.kcal<walkBefore);
 G.enterBuilding();
 T.ok('the sibling hall entry is also saved immediately',JSON.parse(storage.get(G.state.runKey)).scholar.insideHaven===true);
 G.exitBuilding();
 const grounds=G.genDetail(G.map.px,G.map.py);
 grounds[5][4]='tent';grounds[5][3]='fire';grounds[5][5]='tent';
 hall.secrets={...(hall.secrets||{}),'4,5':{yours:true,packedFrom:'actual player kit'}};
 const preserved=JSON.stringify({grid:grounds,secrets:hall.secrets});
 G.enterBuilding();
 T.ok('an older player-built doorstep obstruction has a usable alternate door landing',G.exitBuilding()===true&&walkable(grounds,body.mx,body.my)&&!G.gardenCellAt(body.mx,body.my)&&reach(grounds,body.mx,body.my).size>10,JSON.stringify({x:body.mx,y:body.my}));
 T.ok('using that alternate landing neither deletes nor repairs player structures',JSON.stringify({grid:hall.groundsDetail,secrets:hall.secrets})===preserved);
 const key=G.state.runKey;G.save();
 T.ok('Continue actually loads the saved legacy-yard run',G.load(key)===true);
 hall=G.playerTile();body=G.state.scholar;
 T.ok('Continue retains the actual grounds and player ownership metadata',JSON.stringify({grid:hall.groundsDetail,secrets:hall.secrets})===preserved);
 G.enterBuilding();G.exitBuilding();
 T.ok('door use after Continue still preserves those structures',JSON.stringify({grid:hall.groundsDetail,secrets:hall.secrets})===preserved&&walkable(hall.groundsDetail,body.mx,body.my));
 // Old saves had one grounds cache: adopt it, never regenerate over a tent.
 body.insideHaven=false;hall.detail=hall.groundsDetail;delete hall.groundsDetail;
 T.ok('legacy single-cache grounds are adopted without terrain replacement',JSON.stringify({grid:G.genDetail(G.map.px,G.map.py),secrets:hall.secrets})===preserved);
 // A sealed, adversarial saved yard cannot be escaped by claiming a door
 // transit happened. Refuse without deleting structures or ending a fight.
 G.enterBuilding();hall.groundsDetail=Array.from({length:9},()=>Array(9).fill('wall'));
 for(let y=3;y<=4;y++)for(let x=3;x<=5;x++)hall.groundsDetail[y][x]='lodge';
 const sealed=JSON.stringify(hall.groundsDetail),pos=[body.mx,body.my];
 T.ok('a completely sealed saved exterior refuses a normal exit',G.exitBuilding()===false&&body.insideHaven===true&&body.mx===pos[0]&&body.my===pos[1]);
 T.ok('refusal preserves all saved obstruction cells',JSON.stringify(hall.groundsDetail)===sealed);
 if(!body.insideHaven)G.enterBuilding();
 G.state.doorFledMonsters=null;K.fight(G,'hushwolf');const f=G.tbfight,p=G.tbFighter('p');
 p.mx=4;p.my=5;p.moveLeft=3;p.acted=false;body.mx=4;body.my=5;
 for(const enemy of f.fighters.filter(x=>x.kind==='monster')){enemy.mx=1;enemy.my=1;}
 G.tbPlayerMove(4,6);
 T.ok('a failed combat door transit does not grant flight or end the fight',G.inCombat()&&body.insideHaven===true&&!p.fled&&!G.state.doorFledMonsters);
 K.newRun(G);body=G.state.scholar;K.fight(G,'hushwolf',{px:4,py:5,mx:1,my:1});
 const escaping=G.tbFighter('p');escaping.moveLeft=3;escaping.acted=false;
 G.tbPlayerMove(4,6);
 T.ok('a real combat door crossing still escapes onto the south approach',!G.inCombat()&&!body.insideHaven&&body.mx===4&&body.my===5);
 T.ok('successful door flight retains the actual monster and bearer ownership',G.state.doorFledMonsters?.some(m=>m.id==='hushwolf'&&m.bearer===G.villagerId));
 const savedFlight=JSON.parse(storage.get(G.state.runKey));
 T.ok('combat door persistence contains the finished transition and actual pursuer',!savedFlight.run.tbfight&&savedFlight.scholar.insideHaven===false&&savedFlight.doorFledMonsters?.some(m=>m.id==='hushwolf'));
 const pocket=Array.from({length:9},()=>Array(9).fill('wall'));
 for(let y=3;y<=4;y++)for(let x=3;x<=5;x++)pocket[y][x]='lodge';
 pocket[5][4]='dirt';pocket[6][4]='dirt';
 for(let y=4;y<9;y++)pocket[y][6]='dirt';
 const snapshot=JSON.stringify(pocket),point=G.havenDoorLanding(pocket);
 T.ok('a walkable pocket is rejected for a connected alternate landing',point?.x===6&&point.y===4);
 T.ok('landing inspection never alters the saved terrain',JSON.stringify(pocket)===snapshot);
 K.newRun(G);body=G.state.scholar;const village=G.state.village;
 const followed=village.roster.find(id=>id!==G.villagerId),bystander=village.roster.find(id=>id!==G.villagerId&&id!==followed);
 village.followers=[followed];G.npcSetInside(followed,true);G.npcSetInside(bystander,true);
 G.exitBuilding();
 T.ok('a real follower crosses to the same exterior as the player',!G.npcInside(followed)&&!!village.positions[followed]&&Math.max(Math.abs(village.positions[followed].mx-body.mx),Math.abs(village.positions[followed].my-body.my))<=1);
 T.ok('a resident who is not following remains on their own side of the door',G.npcInside(bystander));
 G.enterBuilding();
 T.ok('the follower also crosses the sibling entry without changing world node',G.npcInside(followed)&&G.npcNode(followed).nx===G.map.px&&G.npcNode(followed).ny===G.map.py);
 G.map.px=0;G.map.py=0;const wrongNodePos=[body.mx,body.my];
 T.ok('a stale inside flag cannot open a Haven door on a wild tile',G.exitBuilding()===false&&body.insideHaven&&body.mx===wrongNodePos[0]&&body.my===wrongNodePos[1]);
 K.newRun(G);body=G.state.scholar;body.kcal=6000;G.exitBuilding();body.mx=4;body.my=6;
 body.inventory.push({kind:'tent',name:'Packed tent',units:1,kg:2.5},{kind:'tool',itemId:'lighter',name:'Lighter',units:1});G.addMaterial('branch',3);
 const ownGrounds=G.genDetail(G.map.px,G.map.py),kitBefore=body.inventory.filter(i=>i.kind==='tent').reduce((n,i)=>n+i.units,0);
 G.pitchTent(4,5);
 const fireSpot=[[3,5],[5,5],[3,6],[5,6]].find(([x,y])=>['dirt','grass'].includes(ownGrounds[y][x]));
 if(!fireSpot)throw Error('Prepared real construction scene has no fire ground');
 G.makeFire(...fireSpot);G.setUpCamp();
 T.ok('canonical paid construction creates a real doorstep tent and tracked campfire',G.playerTile().secrets['4,5']?.yours&&body.inventory.filter(i=>i.kind==='tent').reduce((n,i)=>n+i.units,0)===kitBefore-1&&G.state.fires.some(f=>f.cx===fireSpot[0]&&f.cy===fireSpot[1])&&!!G.state.camp);
 const ownSnapshot=JSON.stringify({grounds:ownGrounds,fires:G.state.fires,camp:G.state.camp,secrets:G.playerTile().secrets});
 G.enterBuilding();G.exitBuilding();
 T.ok('door round-trip preserves the paid camp, actual fuel ledger and tent',JSON.stringify({grounds:G.playerTile().groundsDetail,fires:G.state.fires,camp:G.state.camp,secrets:G.playerTile().secrets})===ownSnapshot);
 T.ok('paid-camp Continue actually loads a persisted run',G.load(G.state.runKey)===true);
 T.ok('native door persistence retains the paid camp and fuel through Continue',JSON.stringify({grounds:G.playerTile().groundsDetail,fires:G.state.fires,camp:G.state.camp,secrets:G.playerTile().secrets})===ownSnapshot);
 // A dense, legitimately built camp must not turn a short preferred-spot
 // list into a new save softlock when the rest of the yard is still open.
 K.newRun(G);body=G.state.scholar;body.kcal=6000;body.inventory.push({kind:'tent',name:'Packed tent',units:9,kg:2.5});G.exitBuilding();
 function walk(goal,adjacent){
  const cells=G.genDetail(G.map.px,G.map.py),end=(x,y)=>adjacent?Math.max(Math.abs(x-goal[0]),Math.abs(y-goal[1]))<=1&&(x!==goal[0]||y!==goal[1]):x===goal[0]&&y===goal[1];
  const q=[[body.mx,body.my,[]]],seen=new Set();let route=null;
  while(q.length){const[x,y,path]=q.shift(),key=x+','+y;if(seen.has(key)||!walkable(cells,x,y))continue;seen.add(key);if(end(x,y)){route=path;break;}for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])q.push([x+dx,y+dy,[...path,[x+dx,y+dy]]]);}
  if(!route)throw Error('No real construction route');for(const[x,y]of route)if(G.microMove(x,y)!==true)throw Error('Actual construction movement refused');
 }
 for(const[x,y]of [[4,5],[5,5],[3,5],[6,4],[6,3],[2,3],[6,5],[6,2],[2,2]]){
  if(G.genDetail(G.map.px,G.map.py)[y][x]==='tent')continue;
  walk([x,y],true);G.pitchTent(x,y);if(!G.playerTile().secrets[x+','+y]?.yours)throw Error('Canonical tent construction failed');
 }
 walk([4,2],false);const ring=JSON.stringify({grounds:G.playerTile().groundsDetail,secrets:G.playerTile().secrets});G.enterBuilding();const left=G.exitBuilding();
 T.ok('a real dense camp uses clear connected ground beyond blocked preferred spots',left===true&&!body.insideHaven&&walkable(G.playerTile().groundsDetail,body.mx,body.my)&&!G.gardenCellAt(body.mx,body.my));
 T.ok('escaping that camp preserves every paid tent and ownership record',JSON.stringify({grounds:G.playerTile().groundsDetail,secrets:G.playerTile().secrets})===ring);
 G.gardenCellAt(3,1);const stableState=JSON.stringify(G.state),badLayouts=[];
 for(let seed=0;seed<128;seed++){
  const random=G.detailRand(seed+8800),cells=Array.from({length:9},()=>Array.from({length:9},()=>random()<0.3?'tent':'grass'));
  for(let y=3;y<=4;y++)for(let x=3;x<=5;x++)cells[y][x]='lodge';
  if(seed%2===0)for(let y=2;y<=5;y++)for(let x=2;x<=6;x++)if((x===2||x===6||y===5)&&cells[y][x]!=='lodge')cells[y][x]='tent';
  const possible=new Set();
  for(let n=0;n<9;n++)for(const[x,y]of [[n,0],[n,8],[0,n],[8,n]])for(const key of reach(cells,x,y))possible.add(key);
  const allowed=new Set([...possible].filter(key=>{const[x,y]=key.split(',').map(Number);return !G.gardenCellAt(x,y);}));
  const unchanged=JSON.stringify(cells),landing=G.havenDoorLanding(cells);
  if((allowed.size>0&&!landing)||(landing&&!allowed.has(landing.x+','+landing.y))||JSON.stringify(cells)!==unchanged)badLayouts.push(seed);
 }
 T.ok('128 saved-obstruction layouts find clear connected land whenever it exists',badLayouts.length===0,JSON.stringify(badLayouts));
 T.ok('landing inspection changes neither the saved world nor plot state',JSON.stringify(G.state)===stableState);
 T.done();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
