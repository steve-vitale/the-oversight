#!/usr/bin/env node
'use strict';
// Historical, default-OFF controller experiment; this is not a campaign buff.
// Each arm boots one shared Game in a fresh process (AGENTS.md).
// The retained A replay loses its bearer despite !Game.over: succession is
// not survival. B's wounded lead intentionally routs; K separately proves a
// real kill. No monster behavior, random draw, policy verb or reward is stubbed.
const assert = require('assert/strict');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const K=require('./godpath/lib');
const arms = {
  A: { seed: 13, hp: 400, gate: '1', monster: 'hushwolf' },
  B: { seed: 23, hp: 20, gate: '1', monster: 'hushwolf' },
  K: { seed: 23, hp: 10, gate: '1', monster: 'hushwolf', weapon:'stone_knife' },
  E: { seed:13,hp:240,gate:'1',monster:'belltoad',armor:true,weapon:'sharpened_stick' },
  C: { seed: 13, hp: 200, gate: '0', monster: 'hushwolf' },
  U: { seed: 13, hp: 200, gate: null, monster: 'hushwolf' },
  D: { seed: 46, hp: 150, health: 30, gate: '1', monster: 'belltoad', edge: true },
};
function digest(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
async function child(kind) {
  const arm = arms[kind]; assert(arm, 'known arm');
  // Do not let unrelated shell experiments redefine this historical proof.
  for (const name of ['COMPETENT_DIRECTIONAL_FLEE', 'COMPETENT_FIGHT_ASSESS','COMPETENT_EXIT_VERIFIED_FLEE']) delete process.env[name];
  if (arm.gate === null) delete process.env.COMPETENT_DPS_RACE;
  else process.env.COMPETENT_DPS_RACE = arm.gate;
  const { competent }=require('./policies/competent');
  const G=await K.load({seed:arm.seed,narration:true}),scholar=K.newRun(G),originalVid=G.villagerId,ctx={},sayings=[];
  Object.assign(scholar,{health:arm.health||G.maxHealth(),kcal:2600,hydration:80,energy:100,trauma:0});scholar.equipped={};
  const equip=id=>{const def=K.readJSON('src/data/items.json').find(x=>x.id===id);assert(def);scholar.inventory.push({itemId:id,name:def.name,units:1,kg:def.kg});G.equip(scholar.inventory.length-1,def.armor?'armor':'weapon');assert(Object.values(scholar.equipped).some(x=>x.itemId===id),'Actual owned gear is worn');};
  if(arm.armor)equip('hide_armor');if(arm.weapon)equip(arm.weapon);
  const startGear=JSON.parse(JSON.stringify(scholar.equipped)),startWeapon=G.equippedWeapon().itemId,startProtection=G.armorBonus();
  const originalSay=G.say;G.say=function(...args){sayings.push(String(args[0]));return originalSay.apply(this,args);};
  const killsBefore=(G.state.waveKillLog||[]).length,roster=G.state.village.roster;
  const grid=G.genDetail(G.map.px,G.map.py);for(const row of grid)row.fill('dirt');
  const m=K.fight(G,arm.monster,{px:arm.edge?8:3,py:arm.edge?8:4,mx:4,my:4}),f=G.tbfight,p=G.tbFighter('p');assert(m&&f&&p);
  // Preserve real living successor candidates outside this prepared solo fight.
  // K.fight excluded them from the encounter; their canonical bodies still live.
  G.state.village.roster=roster;
  m.hp=m.maxHp=arm.hp;
  assert.equal(f.fighters.filter(x=>x.kind!=='monster').length,1);assert.equal(p.hp,scholar.health);assert.equal(p.maxHp,G.maxHealth());
  const damage=G.tbDamage,playerStrike=G.tbPlayerStrike,strikes=[];let ownedStrike=false;
  G.tbPlayerStrike=function(...args){const prior=ownedStrike;ownedStrike=this.tbFighter('p')===p&&this.villagerId===originalVid;try{return playerStrike.apply(this,args);}finally{ownedStrike=prior;}};
  G.tbDamage=function(key,...args){const before=m.hp,result=damage.call(this,key,...args);if(key===m.key&&before>m.hp)strikes.push({debit:before-m.hp,ownedStrike});return result;};
  const startMap = [G.map.px, G.map.py], initialClock={day:scholar.day,tick:scholar.dayTicks}, initialMovement=p.moveLeft, steps = [];
  while (G.tbfight===f && !f.over && !G.over && p.alive && G.villagerId===originalVid && steps.length < 80) {
    assert(G.tbIsPlayerTurn(), 'synchronous engine returns a live player turn');
    const before = { php: p.hp, mhp: m.hp, round: f.round, turn: f.turnIdx, mx: p.mx, my: p.my,acted:p.acted };
    const handled = competent.fight(G, ctx);
    steps.push({ before, handled, after: { php: p.hp, mhp: m.hp, round: f.round, turn: f.turnIdx, mx: p.mx, my: p.my,acted:p.acted }, dpsFled: ctx.dpsFled || 0 });
    assert(handled, 'policy handles every live turn');
  }
  assert(steps.length && steps.length < 80 && f.over, 'fight resolves without a driver bailout');
  const village = G.state.village;
  const result = {
    kind, seed: arm.seed, preparedHp: arm.hp, steps,
    dpsFled: ctx.dpsFled || 0, dpsWindows: ctx.dpsWindows || 0,
    firstDetail: ctx.dpsFledFirstDetail || null, barrierPushes: ctx.barrierPushes || 0,
    result: f.result, fightOver: !!f.over, gameOver: !!G.over,
    originalVid, finalVid: G.villagerId, playerHp: p.hp, playerAlive: p.alive,
    originalDead: !!G.vpOf(originalVid).dead, fallen: (village.fallen || []).filter(x => x.villagerId === originalVid),
    monsterHp: m.hp, monsterAlive: m.alive, monsterFled: !!m.fled,
    kills: (G.state.waveKillLog || []).slice(killsBefore),
    startMap, finalMap: [G.map.px, G.map.py], initialClock,
    finalClock:{day:G.state.scholar.day,tick:G.state.scholar.dayTicks}, initialMovement, finalMovement:p.moveLeft, sayings,
    stateHash: digest(G.state), finalActed:p.acted, startGear,startWeapon,startProtection,strikes,fleeAt:m.mdef.fleeAt,solo:f.fighters.filter(x=>x.kind!=='monster').length===1, followers:f.fighters.filter(x=>x.kind==='monster'&&x!==m).map(x=>({hp:x.hp,alive:x.alive,fled:x.fled})),
  };
  console.log('DPS_RESULT ' + JSON.stringify(result));
}
function parent() {
  let checks = 0;
  const check = (name, value) => { assert(value, name); checks++; console.log('PASS ' + name); };
  const rows = Object.fromEntries(Object.keys(arms).map(kind => {
    const output = execFileSync(process.execPath, [__filename, '--child', kind], { cwd: path.join(__dirname, '..'), env: process.env, encoding: 'utf8', maxBuffer: 2e6 });
    const lines = output.split('\n').filter(x => x.startsWith('DPS_RESULT '));
    assert.equal(lines.length, 1, 'exactly one child receipt');
    const row = JSON.parse(lines[0].slice(11)); assert.equal(row.kind, kind);
    console.log(lines[0]); return [kind, row];
  }));
  for (const r of Object.values(rows)) {
    check(r.kind+': no companion substitutes for the original actor',r.solo);
    check(r.kind + ': real turns resolve the encounter', r.steps.length > 0 && r.fightOver && r.steps.every(s => s.handled));
    if(r.kind==='D'){
      // An immediate successful exit closes the fight without another battle
      // round. The actual barrier price is remaining battle movement, not an
      // invented world-clock debit. Require payment and real displacement.
      check('D: immediate escape closes the original fight and pays remaining movement',r.steps.length===1&&r.result==='fled'&&r.barrierPushes===1&&r.initialMovement>0&&r.finalMovement===0&&JSON.stringify(r.startMap)!==JSON.stringify(r.finalMap));
    }else check(r.kind + ': turn advances or closes with actual act payment', r.steps.some(s => s.after.round !== s.before.round || s.after.turn !== s.before.turn) || (r.fightOver&&r.steps.some(s=>!s.before.acted&&s.after.acted)));
  }
  const { A, B, K, E, C, U, D } = rows;
  check('A: lost-race assessment fires', A.dpsFled >= 1 && A.dpsWindows >= 2);
  check('A: first flee is early, above legacy 35% HP', A.firstDetail && A.firstDetail.php > 35);
  check('A: measured projection is losing', A.firstDetail && A.firstDetail.takenPerTurn > 0 && A.firstDetail.dealtPerStrike > 0 && A.firstDetail.roundsToDie < A.firstDetail.roundsToKill);
  check('A: historical nearest-edge experiment loses the bearer', A.result === 'lost' && A.playerHp <= 0 && !A.playerAlive && A.originalDead);
  check('A: succession must not masquerade as survival', !A.gameOver && A.originalVid !== A.finalVid && A.fallen.length === 1);
  check('B: no DPS retreat from a nearly finished race', B.dpsFled === 0);
  check('B: wounded lead flees through actual monster behavior', B.result === 'routed' && B.monsterHp > 0 && B.monsterHp <= B.preparedHp*B.fleeAt && B.strikes.length>0 && B.monsterHp===B.preparedHp-B.strikes.reduce((n,h)=>n+h.debit,0) && B.strikes.every(h=>h.ownedStrike) && B.monsterAlive && B.monsterFled && B.sayings.some(s => /breaks and runs/.test(s)));
  check('B: original bearer survives the rout', B.playerHp > 0 && B.playerAlive && !B.originalDead && B.originalVid === B.finalVid && !B.gameOver);
  check('B: routing a living monster awards no kill', B.kills.length === 0);
  check('K: separate winning race kills through real strikes', K.dpsFled === 0 && K.result === 'won' && K.monsterHp <= 0 && !K.monsterAlive && !K.monsterFled);
  check('K: actual player Strikes supply the kill',K.strikes.length>0&&K.strikes.every(h=>h.ownedStrike)&&K.strikes.reduce((n,h)=>n+h.debit,0)>=K.preparedHp);
  check('K: kill is attributed to original player', K.kills.length === 1 && K.kills[0].mid === 'hushwolf' && K.kills[0].by === K.originalVid);
  check('K: original bearer survives the kill', K.playerHp > 0 && K.playerAlive && !K.originalDead && K.originalVid === K.finalVid && !K.gameOver);
  check('E: canonical prepared loadout is actually worn',E.startWeapon==='sharpened_stick'&&E.startProtection===20);
  check('E: measured losing race retreats early then exits alive',E.dpsFled>0&&E.firstDetail.php>35&&E.firstDetail.dealtPerStrike>0&&E.firstDetail.takenPerTurn>0&&E.firstDetail.roundsToDie<E.firstDetail.roundsToKill&&E.result==='fled'&&E.playerHp>0&&E.playerAlive&&!E.originalDead&&E.originalVid===E.finalVid&&E.barrierPushes>0&&JSON.stringify(E.startMap)!==JSON.stringify(E.finalMap));
  check('C/U: disabled gate has no assessment or DPS flee', [C, U].every(r => r.dpsFled === 0 && r.dpsWindows === 0));
  check('C/U: explicit zero and default match full state and actual turns', C.stateHash === U.stateHash && JSON.stringify(C.steps) === JSON.stringify(U.steps) && JSON.stringify(C.sayings) === JSON.stringify(U.sayings));
  check('D: real barrier push changes world position', D.barrierPushes >= 1 && JSON.stringify(D.startMap) !== JSON.stringify(D.finalMap));
  check('D: barrier replay ends fled with original bearer alive', D.result === 'fled' && D.playerHp > 0 && D.playerAlive && !D.originalDead && D.originalVid === D.finalVid && !D.gameOver);
  console.log(`dps-race proof green: ${checks} checks, seven fresh shared Games`);
}
(async () => { if (process.argv[2] === '--child') await child(process.argv[3]); else parent(); })().catch(e => { console.error(e.stack); process.exitCode = 1; });
