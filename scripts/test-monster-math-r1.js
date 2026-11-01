#!/usr/bin/env node
'use strict';
// Prepared machete melee audit, not natural balance or mobile proof.
// One seeded shared harness per child. Caps remain unresolved, never wins.
const path=require('path'),cp=require('child_process'),assert=require('assert/strict');
const monsters=require('../src/data/monsters.json');
const cohort=process.env.MIDS?process.env.MIDS.split(','):['bulldozer','hushwolf','gallowdeer','mirrormoth','belltoad','lockpick_raccoon','white_noise_heron','hummice','speedbump_turtle','nightlight_catfish','ducks_in_a_row','sunbasker','nightcourt'];
const trials=6,limit=80;
async function duel(mid,index){
 const seed=1000+cohort.indexOf(mid)*37+index,K=require('./godpath/lib'),G=await K.load({seed});K.newRun(G);
 G.map.px=1;G.map.py=1;const s=G.state.scholar;s.insideHaven=false;s.insideTent=false;s.health=100;s.kcal=2400;s.hydration=100;s.energy=100;
 // Explicit open-ground fixture: not a claim this species spawns here.
 const detail=G.genDetail(1,1);for(const row of detail)row.fill('dirt');
 G.state.village.roster=[];G.state.village.positions={};s.mx=3;s.my=4;G.worldMonsters().length=0;
 // A real prepared world instance survives syncMonsterAlias. Adjacent contact
 // keeps stationary range-limited species engaged; no post-start HP/position reset.
 const spawned=G.spawnWorldMonster(mid,1,1,{mx:4,my:4});assert(spawned);
 s.equipped=process.env.UNARMED==='1'?{}:{melee:{itemId:'machete',name:'Machete'}};
 if(process.env.UNARMED!=='1')assert.equal(G.equippedWeapon().bonus,35);
 const lines=[],say=G.say;G.say=function(m){lines.push(String(m));return say.call(this,m);};
 let dealt=0,taken=0;const damage=G.tbDamage;
 G.tbDamage=function(key,...args){const body=this.tbFighter(key),before=Math.max(0,body?.hp||0),r=damage.call(this,key,...args),loss=Math.max(0,before-Math.max(0,body?.hp||0));if(key==='p')taken+=loss;else dealt+=loss;return r;};
 G.startCombat(mid);const monster=G.tbfight?.fighters.find(m=>m.kind==='monster');assert(monster,'Actual requested fight must start: '+mid+' | '+lines.join(' | '));assert.equal(monster.mdef.id,mid);
 const f=G.tbfight,initialHp=monster.maxHp;let turns=0,moves=0,tele=0,refusedStrikes=0;
 while(G.tbfight===f&&!f.over&&turns<limit){
  const player=G.tbFighter('p');if(!player?.alive)break;
  assert(G.tbIsPlayerTurn(),'Unsettled enemy turn; do not force private completion');
  const round=f.round,turnIdx=f.turnIdx,sameTurn=()=>G.tbfight===f&&!f.over&&G.tbIsPlayerTurn()&&f.round===round&&f.turnIdx===turnIdx;
  const foes=f.fighters.filter(m=>m.kind==='monster'&&m.alive&&!m.fled).sort((a,b)=>a.hp-b.hp);if(!foes.length)break;
  const target=foes[0],distance=(x,y)=>G.fighterDistTo(target,x,y);turns++;const beforeDamage=taken;lines.length=0;
  while(sameTurn()&&!player.acted&&player.moveLeft>0&&distance(player.mx,player.my)>1){
   const options=[];for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(!dx&&!dy)continue;const x=player.mx+dx,y=player.my+dy;if(x<0||y<0||x>G.tbGridMax()||y>G.tbGridMax()||!G.tbCanOccupy(player,x,y))continue;options.push({x,y,d:distance(x,y)});}
   options.sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);const step=options[0];if(!step||step.d>=distance(player.mx,player.my))break;
   const before=[player.mx,player.my];G.tbPlayerMove(step.x,step.y);if(player.mx===before[0]&&player.my===before[1])break;moves++;
  }
  if(sameTurn()&&!player.acted&&distance(player.mx,player.my)<=1){const was=player.acted;G.tbPlayerStrike(target.key);if(sameTurn()&&!was&&!player.acted)refusedStrikes++;}
  if(sameTurn())G.tbPlayerWait(); // real public turn ending, never budget writes
  if(taken===beforeDamage&&/aim|wind|gather|charge|flash|stomp|rear|draw|coil|paw|freez|light|circle/i.test(lines.join(' ')))tele++;
 }
 const p=f.fighters.find(x=>x.key==='p'),left=f.fighters.filter(x=>x.kind==='monster'&&x.alive&&!x.fled).length,fled=f.fighters.filter(x=>x.kind==='monster'&&x.fled).length;
 return{mid,index,seed,turns,moves,dealt,taken,tele,refusedStrikes,initialHp,playerAlive:!!p?.alive,playerHp:p?.hp??null,monstersLeft:left,monstersFled:fled,ended:!!f.over,endReason:f.endReason||null,capped:!f.over&&turns===limit};
}
async function main(){
 if(process.argv[2]==='--duel'){const r=await duel(process.argv[3],Number(process.argv[4]));console.log('@@DUEL@@'+JSON.stringify(r));return;}
 assert(cohort.length&&new Set(cohort).size===cohort.length&&cohort.every(id=>monsters.some(m=>m.id===id)),'Known distinct requested species');
 console.log('Prepared melee audit v2: isolated seeded games, public move/Strike/Wait, actual HP debits; no natural/mobile/balance verdict.');
 console.log('Legacy MONSTER_MATH_R4 request: '+(process.env.MONSTER_MATH_R4||'off')+'; actual cycle-def assertions remain in test-monster-math-premise-20261013.js.');
 const queue=cohort.flatMap(mid=>Array.from({length:trials},(_,index)=>({mid,index}))),rows=[];let failed=false;
 async function work(){while(queue.length&&!failed){const {mid,index}=queue.shift();try{const row=await new Promise((resolve,reject)=>{
   const p=cp.spawn(process.execPath,[__filename,'--duel',mid,String(index)],{cwd:path.resolve(__dirname,'..'),windowsHide:true,timeout:20000});let out='',err='';p.stdout.on('data',b=>out+=b);p.stderr.on('data',b=>err+=b);p.on('error',reject);p.on('close',(code,signal)=>{if(code!==0)return reject(Error(mid+' seed '+index+' failed '+code+'/'+signal+': '+err+' '+out.slice(-1500)));try{const line=out.split('\n').find(l=>l.startsWith('@@DUEL@@'));assert(line,'actual child result required');resolve(JSON.parse(line.slice(8)));}catch(e){reject(e);}});
  });rows.push(row);}catch(e){failed=true;throw e;}}}
 await Promise.all([work(),work()]);assert.equal(rows.length,cohort.length*trials);assert.equal(new Set(rows.map(r=>r.mid+':'+r.index)).size,rows.length);
 for(const mid of cohort){const rs=rows.filter(r=>r.mid===mid),sum=k=>rs.reduce((n,r)=>n+r[k],0),turns=sum('turns');assert.equal(rs.length,trials);console.log(JSON.stringify({mid,trials,meanInitialHp:sum('initialHp')/trials,meanTurns:turns/trials,enemyHpDebitedPerTurn:turns?sum('dealt')/turns:null,playerHpDebitedPerTurn:turns?sum('taken')/turns:null,wins:rs.filter(r=>r.ended&&r.monstersLeft===0&&r.monstersFled===0&&r.playerAlive).length,deaths:rs.filter(r=>!r.playerAlive).length,fled:rs.filter(r=>r.monstersFled>0).length,capped:rs.filter(r=>r.capped).length,refusedStrikes:sum('refusedStrikes')}));}
 rows.sort((a,b)=>cohort.indexOf(a.mid)-cohort.indexOf(b.mid)||a.index-b.index);
 console.log('@@DUEL_ROWS@@'+JSON.stringify(rows));
 console.log('All '+rows.length+' requested prepared duels actually ran. Unresolved caps are reported; no errors or missing fights were skipped. Nevermore/glasswing remain outside this melee cohort.');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
