'use strict';
// Prepared solo encounters; one fresh shared runtime per process. Real terrain,
// public Wait/Strike, and the original bearer/item are retained through teardown.
const K=require('./godpath/lib'),a=require('assert/strict'),cp=require('child_process');
async function encounter(mode,seed){
 const G=await K.load({seed,narration:true}),s=K.newRun(G),bearer=G.villagerId;
 const catalog=K.readJSON('src/data/items.json').find(x=>x.id==='hand_saw');a(catalog);
 const item={itemId:catalog.id,name:catalog.name,units:1,kcalEach:0,kg:catalog.kg},before=JSON.parse(JSON.stringify(item));
 s.inventory=mode==='empty'?[]:[item];s.equipped.melee=null;s.equipped.weapon=null;
 // Explicit diagnostic ground, not a natural acquisition/campaign claim.
 const ground=G.genDetail(G.map.px,G.map.py);for(const row of ground)row.fill('dirt');
 let ended;const end=G.tbEnd;G.tbEnd=function(...args){ended=this.tbfight;return end.apply(this,args);};
 let m=K.fight(G,'lockpick_raccoon',{px:3,py:4,mx:4,my:4});const f=G.tbfight||ended;a(f);m=m||f.fighters.find(x=>x.kind==='monster');const p=f.fighters.find(x=>x.key==='p');a(m&&p);
 const solo=f.fighters.filter(x=>x.kind!=='monster').length===1;
 let waits=0;function wait(){a.equal(G.tbfight,f);a(!f.over&&p.alive&&G.villagerId===bearer&&G.tbIsPlayerTurn());G.tbPlayerWait();waits++;}
 while(!f.over&&!m.stolen&&waits<4)wait();
 const stole=m.stolen?.kind==='inv'&&m.stolen.item===item&&s.inventory.length===0;
 const phase=m.beamPhase,position={x:m.mx,y:m.my};let blocked=false,firstBlocked=null,strike=null;
 if(mode!=='empty')a(stole,'Actual owned canonical stack must be stolen before counterplay');
 if(mode==='blocked'){
  const grid=G.genDetail(G.map.px,G.map.py);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&!(m.mx+dx===p.mx&&m.my+dy===p.my))grid[m.my+dy][m.mx+dx]='wall';
  const moves=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)moves.push(G.tbCanOccupy(m,m.mx+dx,m.my+dy));
  blocked=moves.every(v=>!v)&&!G.cellProps(grid[p.my][p.mx]).blocks;
  wait();firstBlocked={over:f.over,stuck:m.boltStuck,owned:m.stolen?.item===item,x:m.mx,y:m.my};
 }
 if(mode==='hit'){
  const adjacent=Math.max(Math.abs(p.mx-m.mx),Math.abs(p.my-m.my))===1,hp=m.hp;
  a(adjacent,'Counterplay starts on a legal adjacent tile');G.tbPlayerStrike(m.key);
  strike={adjacent,damage:hp-m.hp,alive:m.alive,hit:m.lockpickHit};
 }
 let tail=0;while(G.tbfight===f&&!f.over&&tail++<6)wait();
 return{mode,seed,solo,stole,phase,position,blocked,firstBlocked,strike,waits,over:f.over,result:f.result,fled:m.fled,stuck:m.boltStuck,finalPosition:{x:m.mx,y:m.my},sameBearer:G.villagerId===bearer&&G.state.scholar===s&&p.alive&&p.hp>0,inventory:s.inventory,stolenCleared:m.stolen==null,returnedSameObject:s.inventory.length===1&&s.inventory[0]===item,exactMetadata:JSON.stringify(s.inventory[0])===JSON.stringify(before),lines:G.log.map(String)};
}
if(process.argv[2]==='--child')encounter(process.argv[3],+process.argv[4]).then(r=>console.log('LOCKPICK_RESULT '+JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 const T=K.reporter('Lockpick theft and escape');
 for(const[mode,seed]of [['blocked',31001],['hit',31002],['open',31003],['empty',31004]]){
  const child=cp.spawnSync(process.execPath,[__filename,'--child',mode,String(seed)],{cwd:K.ROOT,encoding:'utf8',maxBuffer:4*1024*1024});a.equal(child.status,0,child.stderr+'\n'+child.stdout);
  const markers=child.stdout.split('\n').filter(x=>x.startsWith('LOCKPICK_RESULT '));a.equal(markers.length,1);const r=JSON.parse(markers[0].slice(16));console.log(JSON.stringify(r));
  T.ok(mode+': actual solo player remains the same living bearer',r.solo&&r.sameBearer);
  T.ok(mode+': actual encounter ends routed, raccoon fled and theft state cleared',r.over&&r.result==='routed'&&r.fled&&r.stolenCleared);
  if(mode!=='empty')T.ok(mode+': canonical owned stack is removed into bolt custody',r.stole&&r.phase==='bolt');
  if(mode==='blocked'){
   T.ok('real walls and occupied player tile block all eight escape steps',r.blocked);
   T.ok('first blocked turn retains item and counterplay window',r.firstBlocked&&!r.firstBlocked.over&&r.firstBlocked.stuck===1&&r.firstBlocked.owned&&r.firstBlocked.x===r.position.x&&r.firstBlocked.y===r.position.y);
   T.ok('second blocked turn ends without movement or duplicated item',r.stuck===2&&r.waits===2&&r.inventory.length===0&&r.finalPosition.x===r.position.x&&r.finalPosition.y===r.position.y);
   T.ok('blocked escape honestly names the treeline gap',r.lines.some(x=>x.includes('gap in the treeline')));
  }else if(mode==='hit'){
   T.ok('public adjacent Strike actually hurts the living thief and marks counterplay',r.strike.adjacent&&r.strike.damage>0&&r.strike.alive&&r.strike.hit);
   T.ok('counterplay returns exactly the original item object and all metadata',r.returnedSameObject&&r.exactMetadata);
   T.ok('counterplay honestly narrates the dropped Hand Saw',r.lines.some(x=>x.includes('drops your Hand Saw')));
  }else if(mode==='open'){
   T.ok('real pathfinding reaches an edge within the bound',r.waits>0&&r.waits<=6&&[0,8].some(v=>r.finalPosition.x===v||r.finalPosition.y===v));
   T.ok('normal escape loses the item and names the ridge, not a fake blocked gap',r.inventory.length===0&&r.lines.some(x=>x.includes('over the ridge'))&&!r.lines.some(x=>x.includes('gap in the treeline')));
  }else T.ok('empty pack produces honest empty-handed exit without invented loot',!r.stole&&r.inventory.length===0&&r.lines.some(x=>x.includes('come up empty')));
 }
 T.done();
}
