'use strict';
const K=require('./lib'),T=K.reporter('Alien beam response window');
(async()=>{
 const memory=new Map();global.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size}};
 const G=await K.load({seed:Number(process.env.SEED||7),narration:true}),random=Math.random;let s,p,alien;
 function fixed(fn){try{Math.random=()=>0;return fn()}finally{Math.random=random}}
 function fresh(){G.tbfight=null;G.over=false;K.newRun(G);s=G.state.scholar;s.health=100;s.abilities=[];s.backgroundAbilities=[];s.equipped={};s.godhood={active:[]};G.state.systemArrived=true;K.fight(G,'hushwolf',{px:2,py:4,mx:7,my:4,party:true});p=G.tbFighter('p');p.hp=p.maxHp=s.health=100;p.alive=true;p.mx=s.mx=4;p.my=s.my=4;p.moveLeft=3;p.acted=false;G.genDetail(G.map.px,G.map.py).forEach(row=>row.fill('grass'));G.tbfight.fighters=G.tbfight.fighters.filter(f=>f.kind==='player'||f.kind==='monster');alien=G.apBuildFighter('vex_marlowe');alien.mx=2;alien.my=4;alien.apTurns=2;alien.hp=alien.maxHp;G.tbfight.fighters.push(alien);G.tbfight.order=['p',...G.tbfight.fighters.filter(f=>f!==p).map(f=>f.key)];G.tbfight.turnIdx=0;}
 fresh();const start=p.hp;fixed(()=>G.apMaybeBeamAttack(alien));T.ok('beam selection spends a full turn aiming without damage',p.hp===start&&alien._beamAim?.x===4&&alien._beamAim?.y===4);
 const source={x:alien.mx,y:alien.my},moves=p.moveLeft;G.tbPlayerMove(4,3);T.ok('ordinary tactical movement pays its real movement budget and leaves the lock',p.my===3&&p.moveLeft===moves-1);
 fixed(()=>G.tbAlienTurn(alien));T.ok('pending discharge cannot chase the player or become a heavy strike',p.hp===start&&!alien._beamAim&&alien.mx===source.x&&alien.my===source.y&&!alien.telegraph);
 fresh();fixed(()=>G.apMaybeBeamAttack(alien));G.save();const key=G.state.runKey,aim=alien._beamAim;G.load(key);alien=G.tbfight?.fighters.find(f=>f.alienPid==='vex_marlowe');p=G.tbFighter('p');T.ok('actual mid-charge Continue preserves the pending aim',!!aim&&JSON.stringify(alien?._beamAim)===JSON.stringify(aim));
 const hp=p.hp;fixed(()=>G.tbAlienTurn(alien));T.ok('remaining on the aimed tile takes the unchanged minimum90-percent beam',p.hp===hp-90&&!alien._beamAim,JSON.stringify({before:hp,after:p.hp}));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1});
