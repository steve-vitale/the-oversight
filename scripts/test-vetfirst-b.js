// test-vetfirst-b.js — proof for the veterans first-numbers instrument
// (arm sim-vetfirst-b, run fleshout-loop-b-20261111T0835Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-vetfirst-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const VF = require(path.join(REPO, 'scripts', 'vetfirst-instrument-20261111'));
const AN = require(path.join(REPO, 'scripts', 'vetfirst-analyze-20261111'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 400) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

// ---- A. Pure fixtures: livingVeterans kill-time keying (no game load) ----
(function () {
  function fakeGame(log, roster, scholarId, deadSet) {
    return {
      villagerId: scholarId,
      state: {
        waveKillLog: log,
        village: { roster: roster },
      },
      vpOf: function (vid) { return { dead: !!(deadSet && deadSet[vid]) }; },
      getPerson: function (vid) { return { name: 'P-' + vid }; },
      data: { villagers: [] },
    };
  }
  const log = [
    { d: 10, mid: 'redactor', w: 3, by: 'alice', via: 'player', trick: null },
    { d: 20, mid: 'gavel', w: 3, by: 'bob', via: 'companion', trick: null },
    { d: 30, mid: 'congregation', w: 4, by: 'alice', via: 'wild', trick: null },
    { d: 40, mid: 'spool', w: 3, by: 'carol', via: 'player', trick: null, pyrrhic: true },
  ];
  // A1: living killers only — bob dead, carol alive (pyrrhic still counts).
  const g1 = fakeGame(log, ['alice', 'bob', 'carol', 'scholar1'], 'scholar1', { bob: true });
  const v3 = VF.livingVeterans(g1, 3, { 10: 'scholar1', 20: 'scholar1', 30: 'scholar1', 40: 'scholar1' });
  eq(v3.count, 2, 'A1 living w3 veterans = alice + carol (bob dead)');
  ok(v3.killers.some(function (k) { return k.by === 'carol' && k.pyrrhicKills === 1; }),
    'A1b pyrrhic kill counts toward veteran identity', v3.killers);
  // A2: wave-4 bar needs wave-4+ kills — only alice.
  const v4 = VF.livingVeterans(g1, 4, {});
  eq(v4.count, 1, 'A2 living w4 veterans = alice only');
  eq(v4.killers[0].by, 'alice', 'A2b the w4 veteran is alice');
  // A3: scholar counts — a kill by the current scholar's vid counts.
  const logS = [{ d: 5, mid: 'gavel', w: 3, by: 'scholar1', via: 'player', trick: null }];
  const g3 = fakeGame(logS, ['scholar1', 'alice'], 'scholar1', {});
  eq(VF.livingVeterans(g3, 3, { 5: 'scholar1' }).count, 1, 'A3 scholar kill counts (Steve 2026-11-10 ruling)');
  ok(VF.livingVeterans(g3, 3, { 5: 'scholar1' }).killers[0].scholarAtKill,
    'A3b scholar-at-kill flagged from the scholarIdByDay map');
  // A4: off-roster killer never counts.
  const logO = [{ d: 5, mid: 'gavel', w: 3, by: 'outsider', via: 'player', trick: null }];
  const g4 = fakeGame(logO, ['scholar1', 'alice'], 'scholar1', {});
  eq(VF.livingVeterans(g4, 3, {}).count, 0, 'A4 off-roster killer never counts');
  // A5: old-scholar kill survives succession — alice killed while scholar,
  // then succession made bob the scholar; alice is now a living villager.
  const g5 = fakeGame(
    [{ d: 5, mid: 'gavel', w: 3, by: 'alice', via: 'player', trick: null }],
    ['alice', 'bob'], 'bob', {});
  const v5 = VF.livingVeterans(g5, 3, { 5: 'alice' });
  eq(v5.count, 1, 'A5 old-scholar kill still counts after succession');
  ok(v5.killers[0].scholarAtKill, 'A5b old-scholar kill flagged scholar-at-kill (kill-time keying)');
  // A6: analyzer reconcile — counters vs non-pyrrhic log.
  const rec = AN.reconcileWave(
    { 1: 2, 2: 1, 3: 1, 4: 2 },
    [{ w: 1 }, { w: 1 }, { w: 2 }, { w: 3 }, { w: 4, pyrrhic: true }, { w: 4 }]);
  ok(rec[1].agree && rec[2].agree && rec[3].agree, 'A6 reconcile agrees where log==counter');
  ok(!rec[4].agree && rec[4].counter === 2 && rec[4].log === 1,
    'A6b reconcile DISAGREES when the counter counts a pyrrhic the log excludes (counter 2 vs log 1)', rec[4]);
})();

// ---- B. Live wrap fixtures (one game load, direct calls) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 190301, mode: 'vetfirst-proof-b', fullTelemetry: false });
  await setupGame(Game);
  const orig = {};
  ['recordWaveKill', 'recordPyrrhicKill', 'castMonster', 'spawnWorldMonster',
   'startCombat', 'tele', 'registerDeath'].forEach(function (n) { orig[n] = Game[n]; });
  const vf = VF.install(Game);
  const t = vf.t;
  const s = Game.state.scholar;

  // B1: recordWaveKill recorded with wave/by/via; first call is not a dup.
  const kcBefore = t.killCalls.length;
  const logBefore = (Game.state.waveKillLog || []).length;
  Game.recordWaveKill('gavel', Game.villagerId, 'player', null);
  eq(t.killCalls.length, kcBefore + 1, 'B1 recordWaveKill call recorded');
  const k1 = t.killCalls[t.killCalls.length - 1];
  ok(k1.mid === 'gavel' && k1.wave === 3 && k1.by === Game.villagerId && k1.via === 'player' && k1.dup === false,
    'B1b kill call fields (wave 3 gavel, scholar, player, not dup)', k1);
  ok((Game.state.waveKillLog || []).length === logBefore + 1, 'B1c engine log grew by one entry');

  // B2: the identical second call IS a dup (same day/mid/by/via/trick).
  Game.recordWaveKill('gavel', Game.villagerId, 'player', null);
  const k2 = t.killCalls[t.killCalls.length - 1];
  ok(k2.dup === true, 'B2 identical re-fire is a dup', k2);
  ok((Game.state.waveKillLog || []).length === logBefore + 1, 'B2b engine log did NOT grow on the re-fire (one body = one entry)');

  // B3: recordPyrrhicKill recorded (pyrrhic stamp path).
  const pyBefore = t.pyrrhicCalls.length;
  Game.recordPyrrhicKill('spool', Game.villagerId, 'player');
  eq(t.pyrrhicCalls.length, pyBefore + 1, 'B3 recordPyrrhicKill call recorded');
  ok(t.pyrrhicCalls[t.pyrrhicCalls.length - 1].mid === 'spool' && t.pyrrhicCalls[t.pyrrhicCalls.length - 1].wave === 3,
    'B3b pyrrhic call fields', t.pyrrhicCalls[t.pyrrhicCalls.length - 1]);

  // B4: castMonster returns {id, veteran} and is recorded.
  const castBefore = t.casts.length;
  const cast = Game.castMonster();
  ok(t.casts.length === castBefore + 1, 'B4 castMonster call recorded');
  ok(cast && typeof cast === 'object' && typeof cast.id === 'string' && typeof cast.veteran === 'boolean',
    'B4b castMonster returns {id, veteran}', cast);

  // B6: startCombat, non-veteran control first (hummice, wave 1) — BEFORE
  // any veteran spawn exists on the tile, so the mirror cannot lift one.
  const defHum = (Game.data.monsters || []).find(function (m) { return m.id === 'hummice'; });
  const fBefore = t.fights.length;
  try { Game.state.scholar.monster = null; } catch (e) {}
  Game.startCombat('hummice');
  const fCtl = t.fights.filter(function (f) { return f.mid === 'hummice'; }).pop();
  ok(!!fCtl, 'B6 non-veteran fight recorded', { fights: t.fights.length - fBefore });
  ok(fCtl && fCtl.veteran === false, 'B6b control fighter is not a veteran', fCtl);
  ok(fCtl && fCtl.hp >= defHum.hp[0] && fCtl.hp <= defHum.hp[1] && fCtl.speed === (defHum.speed || 3),
    'B6c control fighter hp/speed are the plain def roll', fCtl);
  try { if (typeof Game.tbEnd === 'function') Game.tbEnd('fled'); else Game.tbfight = null; } catch (e) { try { Game.tbfight = null; } catch (e2) {} }

  // B5: spawnWorldMonster recorded, veteran flag carried.
  const spBefore = t.spawns.length;
  const mon = Game.spawnWorldMonster({ id: 'hummice', veteran: true }, 4, 4, { mx: 4, my: 4 });
  ok(t.spawns.length === spBefore + 1, 'B5 spawnWorldMonster call recorded');
  const sp = t.spawns[t.spawns.length - 1];
  ok(sp.id === 'hummice' && sp.veteran === true, 'B5b veteran flag carried on the spawn', sp);
  ok(mon && mon.veteran === true, 'B5c returned world monster carries veteran=true', mon && { veteran: mon.veteran, wave: mon.wave });

  // B7: startCombat, veteran (world monster with veteran:true on the tile).
  const monV = Game.spawnWorldMonster({ id: 'hummice', veteran: true }, 4, 4, { mx: 4, my: 4 });
  try { Game.state.scholar.monster = monV; } catch (e) {}
  Game.startCombat('hummice');
  const fVet = t.fights.filter(function (f) { return f.mid === 'hummice' && f.veteran; }).pop();
  ok(!!fVet, 'B7 veteran fight recorded', { fights: t.fights.length });
  ok(fVet && fVet.veteran === true, 'B7b fighter carries veteran=true', fVet);
  ok(fVet && ['scarred', 'elder', 'pack-leader'].indexOf(fVet.veteranVariant) >= 0,
    'B7c veteran variant is one of scarred/elder/pack-leader', fVet && fVet.veteranVariant);
  ok(fVet && fVet.hp >= Math.round(defHum.hp[0] * 1.5) && fVet.hp <= Math.round(defHum.hp[1] * 1.5),
    'B7d veteran hp is def hp x1.5', fVet && { hp: fVet.hp, defHp: fVet.defHp });
  ok(fVet && fVet.speed === (defHum.speed || 3) + 1,
    'B7e veteran speed is def speed +1', fVet && { speed: fVet.speed, defSpeed: fVet.defSpeed });
  // B7f: the +3 damage question — veteran and non-veteran fighters of the
  // same species carry IDENTICAL def damage ranges and no fighter-level
  // damage modifier exists on either row. If the engine applied +3, the
  // veteran row would carry it; it does not.
  ok(fCtl && fVet && JSON.stringify(fCtl.defDamage) === JSON.stringify(fVet.defDamage),
    'B7f veteran defDamage identical to non-veteran (no +3 carried)', { ctl: fCtl && fCtl.defDamage, vet: fVet && fVet.defDamage });
  ok(fVet && !('dmgBonus' in fVet) && !('damageBonus' in fVet),
    'B7g veteran fighter row carries no damage-bonus field');
  try { if (typeof Game.tbEnd === 'function') Game.tbEnd('fled'); else Game.tbfight = null; } catch (e) { try { Game.tbfight = null; } catch (e2) {} }

  // B8: tele counts + veteran-relevant rows.
  const teleBefore = (t.teleCounts.teach || 0);
  Game.tele('teach', { vid: Game.villagerId, skill: 'test_skill' });
  Game.tele('npc_trap', { vid: 'x', caught: true });
  eq(t.teleCounts.teach, teleBefore + 1, 'B8 tele teach counted');
  ok(t.teleRows.some(function (r) { return r.type === 'teach'; }), 'B8b teach tele row recorded');
  ok(!t.teleRows.some(function (r) { return r.type === 'npc_trap'; }), 'B8c non-veteran tele types counted but not rowed');

  // B9: registerDeath recorded.
  const dBefore = t.deaths.length;
  Game.registerDeath({ kind: 'villager', villagerId: 'test_vid_xyz', name: 'Test Person', cause: 'combat', killerId: null });
  eq(t.deaths.length, dBefore + 1, 'B9 registerDeath call recorded');
  ok(t.deaths[t.deaths.length - 1].cause === 'combat' && t.deaths[t.deaths.length - 1].villagerId === 'test_vid_xyz',
    'B9b death row fields', t.deaths[t.deaths.length - 1]);

  // B10: snapshot — log copy, counters, veteran recompute, roster, ready.
  const snap = vf.snapshot();
  ok(Array.isArray(snap.waveKillLog) && snap.waveKillLog.length >= 1, 'B10 snapshot carries the kill log copy', { logLen: snap.waveKillLog && snap.waveKillLog.length });
  ok(snap.waveKills && typeof snap.waveKills === 'object', 'B10b snapshot carries waveKills counters', snap.waveKills);
  ok(snap.vetsW3 && snap.vetsW3.count >= 1, 'B10c snapshot recompute finds the scholar veteran (gavel d1)', snap.vetsW3);
  ok(Array.isArray(snap.roster) && snap.roster.length > 0, 'B10d snapshot carries roster liveness', { roster: snap.roster && snap.roster.length });
  ok(snap.ready4 && typeof snap.ready4.veterans === 'number', 'B10e snapshot carries waveUnlockReady(4) pure read', snap.ready4);
  ok(Array.isArray(snap.veteranRows), 'B10f snapshot carries per-veteran behavior rows', { rows: snap.veteranRows && snap.veteranRows.length });

  // B11: uninstall restores the originals.
  vf.uninstall();
  let restored = true;
  ['recordWaveKill', 'recordPyrrhicKill', 'castMonster', 'spawnWorldMonster',
   'startCombat', 'tele', 'registerDeath'].forEach(function (n) { if (Game[n] !== orig[n]) restored = false; });
  ok(restored, 'B11 uninstall restores all wrapped methods');
  ok(Object.keys(t.wrapLive).length === 7, 'B11b all 7 wraps went live', Object.keys(t.wrapLive));
  ok(t.instrumentErrors.length === 0, 'B11c zero instrument errors', t.instrumentErrors);
}

liveFixtures().then(function () {
  console.log('\n' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' | ') : ''));
  if (fail) process.exitCode = 1;
}).catch(function (e) {
  console.error(e.stack);
  process.exitCode = 1;
});
