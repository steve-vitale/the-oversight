'use strict';
const K=require('./lib'),T=K.reporter('Release survival boundaries');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||7)}),random=Math.random;let s,p;
 function roll(n,fn){try{Math.random=()=>n;return fn()}finally{Math.random=random}}
 function fresh(){G.tbfight=null;G.over=false;K.newRun(G);s=G.state.scholar;s.abilities=[];s.backgroundAbilities=[];s.godhood={active:[]};s.equipped={};K.fight(G,'hushwolf',{px:2,py:4,mx:7,my:4});p=G.tbFighter('p');p.alive=true;p.hp=p.maxHp=s.health=100;}
 fresh();s.equipped={torso:{itemId:'riot_gear'}};T.ok('human full-body armor grants no beam resistance',G.apBeamResistPieces().length===0);
 p.hp=p.maxHp=s.health=240;s.maxHp=100;const capacity=roll(0,()=>G.apBeamHit('p',0,'prepared capacity beam',{}));T.ok('beam uses actual fighter capacity rather than stale scholar capacity',capacity===216&&p.hp===24&&s.health===24);
 fresh();s.equipped={torso:{itemId:'worldroot_plate'},hands:{itemId:'alien_gauntlets'}};T.ok('advanced full-body armor and hands protect five real slots',G.apBeamResistPieces().length===5);
 const protectedHit=roll(0.999,()=>G.apBeamHit('player',0,'prepared protected beam',{}));T.ok('five resistant slots reduce the unchanged maximum beam to18',protectedHit===18&&p.hp===82&&s.health===82);
 s.equipped={};s.inventory=[{itemId:'worldroot_plate',units:1}];T.ok('carried advanced armor provides no beam protection',G.apBeamResistPieces().length===0);
 function sleepCase(sleeping){G.tbfight=null;G.over=false;K.newRun(G);s=G.state.scholar;G.state.village.px=3;G.state.village.py=3;G.state.village.havenTier=2;G.map.px=3;G.map.py=3;s.insideHaven=false;s.mx=s.my=4;s.abilities=[];s.backgroundAbilities=[];s.equipped={};const m=G.spawnWorldMonster({id:'hushwolf'},3,3,{mx:4,my:5});m.stance='hungry';let starts=0;const start=G.startCombat;G.startCombat=function(){starts++;return start.apply(this,arguments)};G._sleeping=sleeping?{quality:'bed'}:null;try{roll(0,()=>{for(let i=0;i<3&&!starts;i++)G.monsterTurn()})}finally{G.startCombat=start;G._sleeping=null}return{starts,m};}
 const safe=sleepCase(true);T.ok('sleep protection follows relocated Haven and blocks a real adjacent raider',safe.starts===0&&safe.m.mx===4&&safe.m.my===5);
 const awake=sleepCase(false);T.ok('relocated Haven awake control still permits actual contact',awake.starts>0);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1});
