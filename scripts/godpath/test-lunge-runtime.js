'use strict';
const K=require('./lib'),T=K.reporter('committed lunge');
(async()=>{const G=await K.load({seed:7,narration:true}),S=globalThis.Scattering;
T.ok('lunge geometry hits its one committed aim cell at range3',JSON.stringify(S.combat.patternCells({type:'lunge',range:3},5,4,2,4))===JSON.stringify([{cx:2,cy:4}]));
T.ok('lunge geometry refuses a target beyond its declared range',S.combat.patternCells({type:'lunge',range:3},6,4,2,4).length===0);
function fight(){K.newRun(G);const m=K.fight(G,'sunback',{px:2,py:4,mx:5,my:4,hp:500});m.telegraph=null;return{m,p:G.tbFighter('p')};}
let{m,p}=fight();const hp=p.hp;G.tbMonsterTurn(m);
T.ok('actual Sunback declares its player target with the data windup',m.telegraph?.turnsLeft===2&&m.telegraph.cells.some(c=>c.cx===2&&c.cy===4));
G.tbMonsterTurn(m);T.ok('the first windup turn does not land damage',p.hp===hp);
G.tbMonsterTurn(m);T.ok('a stationary player can actually be hit by the lunge',p.hp<hp);
T.ok('a landed lunge stops beside its living target rather than overlapping',m.mx===3&&m.my===4&&p.mx===2&&p.my===4);
({m,p}=fight());G.tbMonsterTurn(m);const locked=JSON.stringify(m.telegraph?.cells),hpDodge=p.hp;p.my=5;G.tbMonsterTurn(m);G.tbMonsterTurn(m);
T.ok('stepping away from the declared square avoids its damage',p.hp===hpDodge);
T.ok('a missed lunge advances safely to the vacated committed target',m.mx===2&&m.my===4);
({m,p}=fight());G.tbMonsterTurn(m);const detail=G.genDetail(G.map.px,G.map.py);detail[4][4]='wall';const hpCover=p.hp;G.tbMonsterTurn(m);G.tbMonsterTurn(m);
T.ok('cover introduced during windup blocks the physical lunge',p.hp===hpCover&&m.mx===5&&m.my===4);
function alliedFight(){K.newRun(G);const monster=K.fight(G,'sunback',{px:1,py:6,mx:5,my:4,hp:500,party:true}),allies=G.tbfight.fighters.filter(f=>f.kind==='villager');if(!allies.length)throw Error('No actual villager joined the shared-Game fight');for(const a of allies){a.mx=1;a.my=1;}const ally=allies[0];ally.mx=2;ally.my=4;monster.threatQueue=[ally.key];monster.telegraph=null;return{monster,ally};}
let{monster,ally}=alliedFight(),allyHp=ally.hp;G.tbMonsterTurn(monster);G.tbMonsterTurn(monster);G.tbMonsterTurn(monster);
T.ok('the same committed attack can damage an actual allied villager',ally.hp<allyHp);
({monster,ally}=alliedFight());allyHp=ally.hp;G.tbMonsterTurn(monster);ally.my=5;G.tbMonsterTurn(monster);G.tbMonsterTurn(monster);
T.ok('an allied villager can avoid the same committed square by moving',ally.hp===allyHp&&monster.mx===2&&monster.my===4);
T.ok('melee geometry is one nearby square, not an empty attack or ranged hit',JSON.stringify(S.combat.patternCells({type:'melee',reach:1},5,4,4,4))===JSON.stringify([{cx:4,cy:4}])&&S.combat.patternCells({type:'melee',reach:1},5,4,2,4).length===0);
for(const id of ['sunback','dustboar']){K.newRun(G);const close=K.fight(G,id,{px:4,py:4,mx:5,my:4,hp:500}),player=G.tbFighter('p'),before=player.hp;close.telegraph=null;G.tbMonsterTurn(close);const kind=close.telegraph?.pattern?.type;G.tbMonsterTurn(close);T.ok(id+' actually resolves its authored adjacent melee move',kind==='melee'&&player.hp<before);}
const app=K.readSrc('src/js/app.js'),cs=app.indexOf('  function tbAllTelegraphCells()'),ce=app.indexOf('  // PLAYER-COINCIDENT TELEGRAPH ALERTS',cs),collect=new Function('Game',app.slice(cs,ce)+'\nreturn tbAllTelegraphCells;')(G);
({m,p}=fight());G.tbMonsterTurn(m);T.ok('actual UI collector hides an unlearned lunge marker',collect().single.size===0);
G.tbMonsterTurn(m);G.tbMonsterTurn(m);m.mx=5;m.my=4;p.mx=2;p.my=4;m.telegraph=null;G.tbMonsterTurn(m);
T.ok('surviving the lunge earns the actual UI single-target marker',G.tbPatternKnown('sunback','Sunflash Lunge')&&collect().single.has('2,4'));
({m,p}=fight());const floor=G.genDetail(G.map.px,G.map.py);for(let y=1;y<8;y++)for(let x=1;x<8;x++)floor[y][x]='hall';let bearings=true;
if(typeof G.tbLungePath!=='function')bearings=false;else for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])for(let range=1;range<=3;range++){m.mx=4;m.my=4;p.mx=4+dx*range;p.my=4+dy*range;const leap=G.tbLungePath(m,{type:'lunge',range:3},{x:p.mx,y:p.my});if(JSON.stringify(leap.cells)!==JSON.stringify([{cx:p.mx,cy:p.my}])||leap.landing.cx!==4+dx*(range-1)||leap.landing.cy!==4+dy*(range-1)||!G.tbCanOccupy(m,leap.landing.cx,leap.landing.cy))bearings=false;}
T.ok('all eight bearings at ranges1–3 hit the committed square and stop without actor overlap on a prepared floor',bearings);
({monster,ally}=alliedFight());const blocker=G.tbfight.fighters.find(f=>f.kind==='villager'&&f!==ally);if(!blocker)throw Error('No actual second ally for the body-block fixture');G.tbMonsterTurn(monster);const declaredLunge=monster.telegraph?.pattern?.type==='lunge';blocker.mx=4;blocker.my=4;const allyBefore=ally.hp,blockerBefore=blocker.hp;G.tbMonsterTurn(monster);G.tbMonsterTurn(monster);
T.ok('a fighter entering an already-declared lunge route blocks it without clipping through or hitting the distant target',declaredLunge&&ally.hp===allyBefore&&blocker.hp===blockerBefore&&monster.mx===5&&monster.my===4);
T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
