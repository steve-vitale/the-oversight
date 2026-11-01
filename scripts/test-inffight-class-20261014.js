#!/usr/bin/env node
'use strict';
// One shared seeded runtime per child. Real terrain makes the whiff class;
// explicit on/off cases retain the 3,000-turn control without private inputs.
const H=require('./policies/human-combat'),K=require('./godpath/lib'),a=require('assert/strict'),cp=require('child_process'),crypto=require('crypto');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function duel(id,mode){
 if(mode==='off')process.env.WHIFFGUARD='0';else delete process.env.WHIFFGUARD;
 const G=await K.load({seed:44,narration:true}),s=K.newRun(G),bearer=G.villagerId,wall=id==='wall-hushwolf',whiff=wall||id==='focus_group';
 s.equipped={};if(!wall){const def=K.readJSON('src/data/items.json').find(x=>x.id==='fire_hardened_spear');s.inventory.push({itemId:def.id,name:def.name,units:1,kg:def.kg});G.equip(s.inventory.length-1,'weapon');a.equal(G.equippedWeapon().itemId,def.id);}
 const grid=G.genDetail(G.map.px,G.map.py);for(const row of grid)row.fill('dirt');if(wall)for(let y=0;y<grid.length;y++)grid[y][4]='wall';
 const pos=wall?{px:1,py:4,mx:6,my:4}:id==='focus_group'?{px:8,py:2,mx:6,my:1}:{px:4,py:4,mx:6,my:4};
 const monster=K.fight(G,wall?'hushwolf':id,pos),f=G.tbfight,p=G.tbFighter('p');a(monster&&f&&p);const monsters=f.fighters.filter(x=>x.kind==='monster'),startHp=p.hp,startMonsters=monsters.map(x=>({key:x.key,hp:x.hp})),wins=G.state.combatWins||0,killCount=(G.state.waveKillLog||[]).length,hits=[];
 const damage=G.tbDamage;G.tbDamage=function(key,...args){const target=f.fighters.find(x=>x.key===key),before=target?.hp,result=damage.call(this,key,...args);if(target&&before>target.hp)hits.push({key,debit:before-target.hp});return result;};
 const limit=whiff?(mode==='off'?3000:600):500;let calls=0,opening=null;
 while(G.tbfight===f&&!f.over&&!G.over&&p.alive&&G.villagerId===bearer&&calls<limit){
  a(G.tbIsPlayerTurn(),'Synchronous engine must return the original player turn');
  const token=H.token(G,f);const target=f.fighters.filter(x=>x.kind==='monster'&&x.alive&&!x.fled).sort((a,b)=>a.hp-b.hp)[0];if(target)G.tbPlayerStrike(target.key);
  if(H.sameTurn(G,f,p,token))G.tbPlayerWait();calls++;
  if(!opening&&f.round>=5)opening={hp:p.hp,monsters:monsters.map(x=>({key:x.key,hp:x.hp})),hitCount:hits.length};
 }
 const endMonsters=monsters.map(x=>({key:x.key,hp:x.hp,alive:x.alive,fled:!!x.fled})),guardLine=G.log.map(String).find(x=>x.includes('comes apart'))||'';
 const outcome={calls,round:f.round,result:f.result,over:f.over,playerHp:p.hp,playerAlive:p.alive,sameBearer:G.villagerId===bearer,monsters:endMonsters,hits,wins:[wins,G.state.combatWins||0],kills:(G.state.waveKillLog||[]).slice(killCount),gameOver:!!G.over,lines:G.log.map(String),stateHash:hash(G.state)};
 return{id,actualMonster:monster.mdef.id,mode,opening,guardOn:G.tbWhiffGuardOn(),fired:!!f._whiffFired,whiffs:f._whiffRounds,startHp,startMonsters,guardLine,wall:whiff&&grid.every(row=>!!G.cellProps(row[4]).blocks),sameScholar:G.state.scholar===s,synchronized:G.villagerId===bearer&&s.health===p.hp,solo:f.fighters.filter(x=>x.kind!=='monster').length===1,outcome,nextRandom:Math.random()};
}
if(process.argv[2]==='--child')duel(process.argv[3],process.argv[4]).then(r=>console.log('WHIFF_RESULT '+JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 const T=K.reporter('General no-damage combat guard'),read=(id,mode)=>{const r=cp.spawnSync(process.execPath,[__filename,'--child',id,mode],{cwd:K.ROOT,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});a.equal(r.status,0,r.stderr+'\n'+r.stdout);const lines=r.stdout.split('\n').filter(x=>x.startsWith('WHIFF_RESULT '));a.equal(lines.length,1);const row=JSON.parse(lines[0].slice(13));a.equal(row.actualMonster,id==='wall-hushwolf'?'hushwolf':id,'Actual encounter species must match preparation');return row;};
 const on=read('wall-hushwolf','on'),off=read('wall-hushwolf','off');console.log(JSON.stringify({on,off}));
 T.ok('real full-height terrain wall separates both actors',on.wall&&off.wall&&on.solo&&off.solo);
 T.ok('default-on guard resolves at120 harmless public turns within600 budget',on.guardOn&&on.fired&&on.whiffs===120&&on.outcome.calls===120&&on.outcome.over&&on.outcome.result==='routed');
 T.ok('disabled control remains a live stall through3000 public turns',!off.guardOn&&!off.fired&&off.outcome.calls===3000&&!off.outcome.over&&off.outcome.result===null);
 for(const r of [on,off]){
  T.ok(r.mode+': original bearer lives at unchanged synchronized HP',r.sameScholar&&r.synchronized&&r.outcome.sameBearer&&r.outcome.playerAlive&&r.outcome.playerHp===r.startHp&&r.outcome.hits.length===0);
  T.ok(r.mode+': every monster retains its actual initial HP',r.outcome.monsters.length===r.startMonsters.length&&r.outcome.monsters.every((m,i)=>m.alive&&m.hp===r.startMonsters[i].hp));
  T.ok(r.mode+': no free kill or combat win',r.outcome.wins[0]===r.outcome.wins[1]&&r.outcome.kills.length===0);
 }
 T.ok('only resolved guard scatters living monsters',on.outcome.monsters.every(m=>m.fled)&&off.outcome.monsters.every(m=>!m.fled));
 T.ok('honest disengagement names reach, pursuit and where they go',/no one in reach, no one chasing/.test(on.guardLine)&&/melt back into the wilds/.test(on.guardLine));
 T.ok('disengagement invents no victory or kill',!/WINNER|trophy|slain/i.test(on.guardLine)&&off.guardLine==='');
 const fx=read('focus_group','on'),fy=read('focus_group','off');console.log(JSON.stringify({focusOn:fx,focusOff:fy}));
 T.ok('Focus Group original geometry actually disengages under the guard',fx.fired&&fx.whiffs===120&&fx.outcome.over&&fx.outcome.result==='routed'&&fx.outcome.calls<600);
 T.ok('Focus Group disabled control remains live through3000 original turns',!fy.fired&&!fy.outcome.over&&fy.outcome.calls===3000);
 for(const r of [fx,fy]){T.ok('Focus '+r.mode+': original bearer survives opening and subsequent whiff',r.opening&&r.sameScholar&&r.synchronized&&r.outcome.sameBearer&&r.outcome.playerAlive&&r.outcome.playerHp===r.opening.hp);T.ok('Focus '+r.mode+': no damage past the actual opening',r.opening&&r.outcome.hits.length===r.opening.hitCount&&r.outcome.monsters.every(m=>m.alive&&m.hp===r.opening.monsters.find(x=>x.key===m.key)?.hp));T.ok('Focus '+r.mode+': no free kill or combat win',r.outcome.kills.length===0&&r.outcome.wins[0]===r.outcome.wins[1]);}
 T.ok('Focus guard uses the honest no-victory resolution',fx.guardLine===on.guardLine&&fy.guardLine==='');
 for(const id of ['bulldozer','hushwolf','mirror_stag']){
  const x=read(id,'on'),y=read(id,'off');console.log(JSON.stringify({id,on:x,off:y}));
  T.ok(id+': both real damaging duels actually resolve',x.outcome.over&&y.outcome.over&&x.outcome.calls<500&&y.outcome.calls<500&&x.outcome.hits.length>0&&y.outcome.hits.length>0);
  T.ok(id+': guard never turns actual damage into disengagement',!x.fired&&!y.fired&&x.guardLine===''&&y.guardLine==='');
  T.ok(id+': on/off outcomes, all actual hits, narration and full state match',JSON.stringify(x.outcome)===JSON.stringify(y.outcome));
  T.ok(id+': no hidden RNG change',x.nextRandom===y.nextRandom);
 }
 T.done();
}
