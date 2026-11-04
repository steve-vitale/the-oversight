// test-killconv-20261104.js — proof test for the killconv instrument
// (arm sim-killconv-a). Stub-Game checks for the killconv additions
// over tbfinish: round-1 opening capture, field-fight decomposition,
// kill/death stamping with field-call id, monster-def stamping —
// plus a live-harness smoke (short run, zero instrument errors).
// Usage: node scripts/test-killconv-20261104.js
'use strict';
const path = require('path');
const assert = require('assert');
const INST = require(path.join(__dirname, 'killconv-instrument-20261104'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

ok('stub: opening capture + def stamp + field decomposition + kill/death stamping', function () {
  const p = { key: 'p', kind: 'player', villagerId: 'v_s', alive: true, hp: 80, maxHp: 100, mx: 4, my: 4, moveLeft: 3, acted: false, stunned: 0, stunFull: false, blindTurns: 0, speed: 3 };
  const m0 = { key: 'm_0', kind: 'monster', mdef: { id: 'm4' }, alive: true, hp: 1000, maxHp: 1000, mx: 4, my: 7, telegraph: null };
  const fighters = [p, m0];
  const stub = {
    state: { scholar: { day: 5, monster: null, health: 80, energy: 70, inventory: [] }, village: { roster: ['v_s', 'v_x'], health: { v_x: 100 } }, waveKillLog: [] },
    data: { monsters: [{ id: 'm4', wave: 4, hp: [900, 1100], armor: 10, attack: { name: 'X', damage: [50, 70] } }], items: [], villagers: [{ id: 'v_x' }] },
    villagerId: 'v_s', pendingMonsterId: null, tbfight: null,
    armorBonus: function () { return 20; },
    equippedWeapon: function () { return { unarmed: false, name: 'Spear', range: 1 }; },
    fighterDistTo: function (m, px, py) { return Math.max(Math.abs(m.mx - px), Math.abs(m.my - py)); },
    tbGridSize: function () { return 9; },
    vpOf: function (vid) { return vid === 'v_x' ? { id: 'v_x', dead: false, items: [] } : {}; },
    monsterCounterKnown: function () { return false; },
    tbFighter: function (k) { return fighters.find(function (f) { return f.key === k; }) || null; },
    tbCurrent: function () { return null; },
    spawnWorldMonster: function () { return { id: 'm4', wave: 4 }; },
    startCombat: function () {
      this.tbfight = { id: 'f1', round: 1, fighters: fighters, over: false };
      this.tbPlayerMove(4, 5); // opening pass: closing move inside startCombat
      return null;
    },
    tbBeginTurn: function () { return null; },
    tbAdvance: function () { return null; },
    tbEnd: function () { this.tbfight.over = true; return null; },
    tbPlayerMove: function (dx, dy) { p.mx = dx; p.my = dy; p.moveLeft -= 1; return true; },
    tbPlayerStrike: function () { return true; },
    tbPlayerWait: function () { return true; },
    tbPlayerStudy: function () { return true; },
    tbPlayerShout: function () { return true; },
    tbPlayerOfferFood: function () { return true; },
    tbPlayerTalk: function () { return true; },
    tbPlayerRally: function () { return true; },
    tbPlayerWarCry: function () { return true; },
    tbPlayerFlip: function () { return true; },
    tbPlayerEndTurn: function () { return true; },
    tbBarrierExit: function () { return true; },
    useAbility: function () { return true; },
    tbMonsterTurn: function () { return null; },
    tbVillagerTurn: function () { return null; },
    tbDamage: function (key, dmg) { const t = this.tbFighter(key); if (t) t.hp -= dmg; return dmg; },
    say: function () { return null; },
    sysSay: function () { return null; },
    recordWaveKill: function (mid, vid, via) { this.state.waveKillLog.push({ mid: mid, by: vid, via: via }); return null; },
    recordPyrrhicKill: function () { return null; },
    tele: function () { return null; },
    fieldFight: function (vid, mdef, m, opts) {
      this.say('field narration line');
      this.recordWaveKill('m4', vid, 'wild');
      this.tele('death', { who: vid, cause: 'monster', kind: 'villager' });
      return { outcome: 'vKill', rounds: 3, vTaken: 20, mDealt: 900, vHpLeft: 80, mHpLeft: 0,
        packCount: 1, partySize: 1, intent: 'engage', intentWhy: 'party',
        allyDealt: 0, calledHelp: false, allyVid: null, log: ['blow one', 'blow two'] };
    },
  };
  const inst = INST.install(stub);
  const t = inst.t;
  stub.startCombat('m4');
  assert.strictEqual(t.exposures.length, 1, 'exposure created');
  assert.strictEqual(t.exposures[0].openingActions.length, 1, 'opening move captured');
  assert.strictEqual(t.exposures[0].openingActions[0].fn, 'tbPlayerMove', 'opening fn');
  assert.strictEqual(t.exposures[0].def.armor, 10, 'def armor stamped');
  assert.deepStrictEqual(t.exposures[0].def.hp, [900, 1100], 'def hp stamped');
  stub.tbEnd('died');
  assert.ok(t.exposures[0].end, 'tb end attached');
  stub.fieldFight('v_x', { id: 'm4' }, { hp: 1000 }, {});
  assert.strictEqual(t.fieldFights.length, 1, 'field fight decomposed');
  const ff = t.fieldFights[0];
  assert.strictEqual(ff.outcome, 'vKill', 'field outcome');
  assert.strictEqual(ff.mDealt, 900, 'field mDealt');
  assert.strictEqual(ff.killsDuring.length, 1, 'kill during field call captured');
  assert.strictEqual(ff.killsDuring[0].fieldCall, ff.callId, 'kill stamped with field call');
  assert.strictEqual(ff.deathsDuring.length, 1, 'death during field call captured');
  assert.strictEqual(ff.deathsDuring[0].fieldCall, ff.callId, 'death stamped with field call');
  assert.strictEqual(ff.deathsDuring[0].cause, 'monster', 'death cause');
  assert.strictEqual(ff.sayLines.length, 1, 'field say line captured');
  assert.strictEqual(t.killRows.length, 1, 'one kill row');
  assert.strictEqual(t.killRows[0].via, 'wild', 'kill via wild');
  assert.strictEqual(t.instrumentErrors.length, 0, 'no instrument errors: ' + JSON.stringify(t.instrumentErrors));
  inst.uninstall();
});

(async function () {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
  const { competent } = require(path.join(__dirname, 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 99101, mode: 'competent-killconv-smoke', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: 40, manifest: undefined, sampleEvery: 30 }); });
  inst.uninstall();
  assert.strictEqual(inst.t.instrumentErrors.length, 0, 'smoke instrument errors: ' + JSON.stringify(inst.t.instrumentErrors));
  assert.ok(Array.isArray(inst.t.fieldFights) && Array.isArray(inst.t.deathEvents), 'field/death arrays present');
  pass++;
  console.log('ok ' + pass + ' - live-harness smoke: 40d seed 99101, zero instrument errors');
  console.log('   smoke: days ' + result.days + ' end ' + result.endReason + ' tb ' + inst.t.exposures.length + ' fieldW4 ' + inst.t.fieldCallsW4 + ' fieldDecomp ' + inst.t.fieldFights.length + ' deaths ' + inst.t.deathEvents.length);
  console.log('killconv proof: ' + pass + '/2 passed');
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
