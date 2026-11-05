// test-grindfinish-20261105.js — proof for the grindfinish instrument,
// driver, and analyzer (arm sim-grindfinish-b). Fixture tests (fake Game
// wrappers + analyzer chain decomposition) + live harness smoke + off/on
// neutrality leg (driver subprocesses into /tmp, never into evidence/).
// Exit non-zero on any failure.
// Usage: node scripts/test-grindfinish-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'grindfinish-analyze-20261105'));
const INST = require(path.join(REPO, 'scripts', 'grindfinish-instrument-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---- fake-Game instrument fixtures ----
function fakeGame() {
  const persons = {
    leader: { equipped: { melee: { itemId: 'shard_spear' }, torso: { itemId: 'bark_armor' } } },
    ally1: { equipped: { melee: { itemId: 'shard_spear' }, armor: null } },
    k1: { equipped: {} },
  };
  const G = {
    villagerId: 'leader',
    data: {
      monsters: [{ id: 'w4a', wave: 4, hp: [850, 1050] }, { id: 'w3a', wave: 3, hp: [240, 420] }],
      items: [{ id: 'bark_armor', armor: { protection: 10 } }, { id: 'shard_spear', weapon: { bonus: 25 } }],
      villagers: [], background_survivors: [],
    },
    state: { scholar: { day: 50, monster: null }, waveKillLog: [{ d: 10, mid: 'w4a', w: 4, by: 'k1', via: 'field' }], village: { fallen: [], roster: ['leader', 'ally1', 'k1'], health: {} } },
    map: { px: 4, py: 4 },
    getPerson: function (id) { return persons[id] || null; },
    playerAtHaven: function () { return true; },
    tbfight: null,
    fieldFight: function (vid, mdef, m, opts) {
      return { outcome: 'mFlee', rounds: 6, mDealt: 300, allyDealt: 50, vTaken: 20, mHpLeft: 650, packCount: 1, log: [], partySize: 2, allyVid: 'ally1', intent: 'engage', intentWhy: 'party', trickLog: ['shout'], focusFire: true, gearFull: true, committedFinish: true, committedRounds: 2, shoutRound: 2, everWinning: false, everHopeless: true };
    },
    startCombat: function (mid) { G.tbfight = { round: 1, fighters: [{ kind: 'villager', villagerId: 'leader', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 900, maxHp: 900 }] }; return true; },
    tbPlayerStrike: function () { return true; },
    useAbility: function () { return true; },
    tbEnd: function () { return true; },
    recordWaveKill: function () { return true; },
    playerDeath: function () { return true; },
  };
  return G;
}

(function () {
  const G = fakeGame();
  const inst = INST.install(G);
  check('install-no-errors', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000, maxHp: 850, tx: 4, ty: 4, mx: 3, my: 5 }, { allies: 1, allyVids: ['ally1'] });
  check('field-wave4-recorded', inst.t.fights.length === 1, 'n=' + inst.t.fights.length);
  const f = inst.t.fights[0];
  check('field-party-damage', f.partySize === 2 && f.allyVid === 'ally1' && f.damageDealt === 350 && Math.abs(f.damageFrac - 0.35) < 1e-9,
    JSON.stringify({ partySize: f.partySize, damageDealt: f.damageDealt, damageFrac: f.damageFrac }));
  check('field-grindfinish-fields', f.defHpLo === 850 && f.defHpHi === 1050 &&
    Math.abs(f.entryFracHi - 1000 / 1050) < 1e-9 && Math.abs(f.entryFracLo - 1000 / 850) < 1e-9 &&
    f.entryMaxHp === 850 && f.entityLoc && f.entityLoc.tx === 4 && f.entityLoc.mx === 3,
    JSON.stringify({ lo: f.defHpLo, hi: f.defHpHi, efh: f.entryFracHi, efl: f.entryFracLo, maxHp: f.entryMaxHp, loc: f.entityLoc }));
  check('field-second-candidate', f.secondCandidatePresent === true && f.secondCandidates.indexOf('leader') >= 0 && f.firstKiller === 'k1' && f.firstKillerAliveAtStart === true && f.firstKillerInFight === false,
    JSON.stringify({ sc: f.secondCandidates, fk: f.firstKiller, alive: f.firstKillerAliveAtStart }));
  check('field-gear', f.gear && f.gear.weaponId === 'shard_spear' && f.gear.weaponBonus === 25 && f.gear.armorP === 10,
    JSON.stringify(f.gear));
  check('field-ending', f.ending === 'flee' && f.outcomeRaw === 'mFlee' && f.swingsAttempted === 6);
  // Wave-3 fight must NOT be recorded (full records are wave-4+ only).
  G.fieldFight('leader', { id: 'w3a', wave: 3 }, { id: 'w3a', hp: 300 }, {});
  check('field-wave3-skipped', inst.t.fights.length === 1, 'n=' + inst.t.fights.length);
  // TB fight, no tile-monster alias: fresh roll, not lifted.
  G.startCombat('w4a');
  G.tbPlayerStrike('m_0'); G.tbPlayerStrike('m_0');
  G.useAbility('bird_strike', 'strike');
  G.tbfight.fighters[1].hp = 400; G.tbfight.round = 3;
  G.tbEnd('won');
  check('tb-recorded', inst.t.fights.length === 2, 'n=' + inst.t.fights.length);
  const tb = inst.t.fights[1];
  check('tb-fields', tb.channel === 'player-tb' && tb.ending === 'kill-or-rout' && tb.swingsAttempted === 2 &&
    tb.damageDealt === 500 && Math.abs(tb.damageFrac - 500 / 900) < 1e-9 &&
    tb.abilitiesUsed.indexOf('bird_strike') >= 0 && tb.secondCandidatePresent === true,
    JSON.stringify(tb));
  check('tb-fresh-not-lifted', tb.lifted === false && tb.worldHpAtLift == null && tb.entryHpPrimary === 900 &&
    tb.entryMaxHpPrimary === 900 && Math.abs(tb.entryFracHiPrimary - 900 / 1050) < 1e-9 && tb.mHpLeftPrimary === 400,
    JSON.stringify({ lifted: tb.lifted, ehp: tb.entryHpPrimary, efh: tb.entryFracHiPrimary, mleft: tb.mHpLeftPrimary }));
  inst.uninstall();
  check('uninstall-restores', G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000 }, {}).outcome === 'mFlee' && inst.t.fights.length === 2);
})();

// TB lift: tile-monster alias present with matching id — the fighter enters
// at world HP and the record says lifted with the alias HP.
(function () {
  const G = fakeGame();
  G.state.scholar.monster = { id: 'w4a', hp: 500, maxHp: 850, veteran: false, lingering: false, titan: false, tx: 4, ty: 4 };
  G.startCombat = function (mid) { G.tbfight = { round: 1, fighters: [{ kind: 'player', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 500, maxHp: 850 }] }; return true; };
  const inst = INST.install(G);
  G.startCombat('w4a');
  G.tbfight.fighters[1].hp = 100; G.tbfight.round = 4;
  G.tbEnd('fled');
  const tb = inst.t.fights[0];
  check('tb-lift-detected', tb && tb.lifted === true && tb.worldHpAtLift && tb.worldHpAtLift.hp === 500 &&
    tb.entryHpPrimary === 500 && tb.entryMaxHpPrimary === 850 && Math.abs(tb.entryFracHiPrimary - 500 / 1050) < 1e-9 &&
    tb.mHpLeftPrimary === 100 && tb.ending === 'flee',
    JSON.stringify(tb && { lifted: tb.lifted, wh: tb.worldHpAtLift, ehp: tb.entryHpPrimary, mleft: tb.mHpLeftPrimary }));
  inst.uninstall();
})();

// TB lift must NOT fire when the alias is a different monster (bystander).
(function () {
  const G = fakeGame();
  G.state.scholar.monster = { id: 'w3a', hp: 300, maxHp: 240, veteran: false, lingering: false, titan: false, tx: 4, ty: 4 };
  const inst = INST.install(G);
  G.startCombat('w4a');
  G.tbEnd('won');
  const tb = inst.t.fights[0];
  check('tb-bystander-not-lifted', tb && tb.lifted === false && tb.worldHpAtLift == null,
    JSON.stringify(tb && { lifted: tb.lifted, wh: tb.worldHpAtLift }));
  inst.uninstall();
})();

// ---- analyzer fixtures ----
function arow(seed, opts) {
  const r = { seed: seed, run: 'fixture', days: 100, endReason: 'horizon', won: false,
    fights: [], daily: [{ day: 1, gated: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [], deadMap: {},
    scaleRank: 'village', unlockedWave: 1, maxWave: 1 };
  return Object.assign(r, opts || {});
}
function ffight(o) {
  return Object.assign({ day: 20, channel: 'field', fighter: 'leader', fighters: ['leader'], mid: 'w4a', wave: 4,
    entryHp: 1000, entryMaxHp: 850, defHpLo: 850, defHpHi: 1050,
    entryFracHi: 1000 / 1050, entryFracLo: 1000 / 850,
    damageDealt: 200, damageFrac: 0.2, rounds: 5, swingsAttempted: 5, partySize: 1,
    firstKiller: 'k1', firstKillerAliveAtStart: true, firstKillerInFight: false,
    secondCandidatePresent: true, secondCandidates: ['leader'], ending: 'flee', outcomeRaw: 'mFlee',
    mHpLeft: 800,
    gear: { weaponBonus: 25, armorP: 10 },
    focusFire: false, gearFull: false, committedFinish: false, committedRounds: 0, shoutRound: null, everWinning: false, everHopeless: false }, o || {});
}
function tfight(o) {
  return Object.assign({ day: 30, channel: 'player-tb', fighter: 'leader', fighters: ['leader'], mid: 'w4a', wave: 4,
    entryHp: 900, entryHpPrimary: 900, entryMaxHpPrimary: 850, defHpLo: 850, defHpHi: 1050,
    entryFracHi: 900 / 1050, entryFracHiPrimary: 900 / 1050, entryFracLoPrimary: 900 / 850,
    damageDealt: 500, damageFrac: 500 / 900, rounds: 4, swingsAttempted: 3, partySize: 1,
    firstKiller: 'k1', firstKillerAliveAtStart: true, firstKillerInFight: false,
    secondCandidatePresent: true, secondCandidates: ['leader'], ending: 'kill-or-rout', outcomeRaw: 'won',
    mHpLeft: 400, mHpLeftPrimary: 400,
    lifted: false, worldHpAtLift: null, pendingLive: false, doorFledAtEntry: null,
    primaryVeteran: false, worldOriginPresent: false,
    gear: { weaponBonus: 25, armorP: 10 }, abilitiesUsed: [] }, o || {});
}
(function () {
  const r = arow(1, {
    fights: [ffight({ day: 20 }), ffight({ day: 21, partySize: 2, fighters: ['leader', 'ally1'], ending: 'kill', outcomeRaw: 'vKill' }), tfight({ day: 22 })],
    waveKillLog: [{ d: 21, mid: 'w4a', w: 4, by: 'leader', via: 'field' }],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-match-one-kill', s.w4killsMatched === 1 && s.unmatchedKills === 0 && s.killRate === 1 / 3,
    JSON.stringify({ matched: s.w4killsMatched, unmatched: s.unmatchedKills, rate: s.killRate }));
  check('analyzer-tb-won-not-kill', s.fights[2].matchedKillBy == null && s.fights[1].matchedKillBy === 'leader',
    JSON.stringify(s.fights.map(function (f) { return f.matchedKillBy; })));
  const s2 = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-determinism', JSON.stringify(s) === JSON.stringify(s2));
})();
(function () {
  // Strict kill matching: same-day same-monster kill belongs to the fight
  // whose fighters include the killer, not an earlier losing fight.
  const r = arow(2, {
    fights: [ffight({ day: 20, fighters: ['jesse'], fighter: 'jesse', ending: 'death', outcomeRaw: 'lost' }),
      tfight({ day: 20, fighters: ['boris'], fighter: 'boris', ending: 'kill-or-rout', outcomeRaw: 'won' })],
    waveKillLog: [{ d: 20, mid: 'w4a', w: 4, by: 'boris', via: 'player' }],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('strict-kill-matching', s.fights[0].matchedKillBy == null && s.fights[1].matchedKillBy === 'boris' && s.w4killsMatched === 1,
    JSON.stringify(s.fights.map(function (f) { return f.matchedKillBy; })));
})();
// Chain (a): lifted TB entry equals the most recent prior field exit
// (strict field->TB link) and lift fidelity holds.
(function () {
  const r = arow(3, {
    fights: [ffight({ day: 20, entryHp: 850, mHpLeft: 500, entryFracHi: 850 / 1050 }),
      tfight({ day: 21, entryHp: 500, entryHpPrimary: 500, entryFracHiPrimary: 500 / 1050,
        lifted: true, worldHpAtLift: { hp: 500, maxHp: 850 } })],
    waveKillLog: [],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('chainA-strict-field-tb-link', s.chainA.strictFieldTbLinks === 1 && s.chainA.liftFidelityMatch === 1 &&
    s.chainA.liftFidelityChecked === 1 && s.chainA.liftedShare === 1,
    JSON.stringify(s.chainA));
})();
// Chain (b): successive TB fights, entry above previous exit with no field
// fight between = reset.
(function () {
  const r = arow(4, {
    fights: [tfight({ day: 20, mHpLeft: 400, mHpLeftPrimary: 400 }),
      tfight({ day: 25, entryHp: 900, entryHpPrimary: 900, entryFracHiPrimary: 900 / 1050 })],
    waveKillLog: [],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('chainB-reset-pair', s.chainB.pairs === 1 && s.chainB.reset === 1 && s.chainB.resetShare === 1 &&
    s.chainB.resetShareNoFieldBetween === 1 && s.chainB.continuation === 0,
    JSON.stringify(s.chainB));
})();
// Chain (b) continuation: entry equals previous exit.
(function () {
  const r = arow(5, {
    fights: [tfight({ day: 20, mHpLeft: 400, mHpLeftPrimary: 400 }),
      tfight({ day: 22, entryHp: 400, entryHpPrimary: 400, entryFracHiPrimary: 400 / 1050 })],
    waveKillLog: [],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('chainB-continuation-pair', s.chainB.pairs === 1 && s.chainB.continuation === 1 && s.chainB.reset === 0,
    JSON.stringify(s.chainB));
})();
// Chain (c): wounded field exit re-met at exactly that HP within 7 days.
(function () {
  const r = arow(6, {
    fights: [ffight({ day: 20, entryHp: 850, mHpLeft: 300, entryFracHi: 850 / 1050 }),
      ffight({ day: 25, entryHp: 300, mHpLeft: 100, entryFracHi: 300 / 1050 }),
      ffight({ day: 40, entryHp: 850, mHpLeft: 200, entryFracHi: 850 / 1050 })],
    waveKillLog: [],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('chainC-refind-7d', s.chainC.woundedExits === 3 && s.chainC.refound === 1 &&
    s.chainC.refound7d === 1 && Math.abs(s.chainC.refound7dShare - 1 / 3) < 1e-9 &&
    s.chainC.refoundByChannel.field === 1,
    JSON.stringify(s.chainC));
})();
// Chain (d) + DIAG rule: 3 wounded-entry TB kills, fresh rate 0, reset
// material => DIAG-GO. (Band-level: analyzeDir over one seed row.)
(function () {
  const dir = '/tmp/grindfinish-analyzer-' + process.pid;
  fs.mkdirSync(dir, { recursive: true });
  const mkWoundedKill = function (day) {
    return tfight({ day: day, entryHp: 200, entryHpPrimary: 200, entryFracHiPrimary: 200 / 1050,
      mHpLeft: 0, mHpLeftPrimary: 0, ending: 'kill-or-rout', outcomeRaw: 'won' });
  };
  const mkWoundedMiss = function (day) {
    return tfight({ day: day, entryHp: 200, entryHpPrimary: 200, entryFracHiPrimary: 200 / 1050,
      mHpLeft: 100, mHpLeftPrimary: 100, ending: 'flee', outcomeRaw: 'fled' });
  };
  const r = arow(7, {
    fights: [
      mkWoundedKill(20), mkWoundedKill(30), mkWoundedKill(40),
      mkWoundedMiss(45), mkWoundedMiss(48),
      tfight({ day: 50, entryHp: 900, entryHpPrimary: 900, entryFracHiPrimary: 900 / 1050, ending: 'flee', outcomeRaw: 'fled' }),
      tfight({ day: 55, entryHp: 950, entryHpPrimary: 950, entryFracHiPrimary: 950 / 1050, ending: 'flee', outcomeRaw: 'fled' }),
      tfight({ day: 60, mHpLeft: 400, mHpLeftPrimary: 400, ending: 'flee', outcomeRaw: 'fled' }),
      tfight({ day: 70, entryHp: 900, entryHpPrimary: 900, entryFracHiPrimary: 900 / 1050, ending: 'flee', outcomeRaw: 'fled' }),
    ],
    waveKillLog: [
      { d: 20, mid: 'w4a', w: 4, by: 'leader', via: 'player' },
      { d: 30, mid: 'w4a', w: 4, by: 'leader', via: 'player' },
      { d: 40, mid: 'w4a', w: 4, by: 'leader', via: 'player' },
    ],
  });
  fs.writeFileSync(dir + '/grindfinish-s7-fixture.json', JSON.stringify(r));
  const out = AN.analyzeDir(dir);
  check('chainD-diag-go', out.diag.d4.gapHolds === true && out.diag.d4.woundedKills === 3 &&
    out.diag.d4.woundedKillRate === 0.6 && out.diag.d4.freshKillRate === 0 &&
    out.diag.loss.d2material === true && out.diag.go === true,
    JSON.stringify(out.diag));
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();
// DIAG-NO when the wounded gap does not hold (fresh kills too).
(function () {
  const dir = '/tmp/grindfinish-analyzer-no-' + process.pid;
  fs.mkdirSync(dir, { recursive: true });
  const r = arow(8, {
    fights: [
      tfight({ day: 20, entryHp: 200, entryHpPrimary: 200, entryFracHiPrimary: 200 / 1050, ending: 'kill-or-rout', outcomeRaw: 'won' }),
      tfight({ day: 30, entryHp: 900, entryHpPrimary: 900, entryFracHiPrimary: 900 / 1050, ending: 'kill-or-rout', outcomeRaw: 'won' }),
      tfight({ day: 40, entryHp: 950, entryHpPrimary: 950, entryFracHiPrimary: 950 / 1050, ending: 'kill-or-rout', outcomeRaw: 'won' }),
    ],
    waveKillLog: [
      { d: 20, mid: 'w4a', w: 4, by: 'leader', via: 'player' },
      { d: 30, mid: 'w4a', w: 4, by: 'leader', via: 'player' },
      { d: 40, mid: 'w4a', w: 4, by: 'leader', via: 'player' },
    ],
  });
  fs.writeFileSync(dir + '/grindfinish-s8-fixture.json', JSON.stringify(r));
  const out = AN.analyzeDir(dir);
  check('chainD-diag-no-fresh-kills', out.diag.d4.gapHolds === false && out.diag.go === false,
    JSON.stringify(out.diag));
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();

async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 99309, mode: 'competent-grindfinish-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let last = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        const d = ((Game.state || {}).scholar || {}).day || 0;
        if (d !== last) { last = d; inst.snapshot(); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 5, manifest: undefined, sampleEvery: 30 }); });
  inst.snapshot();
  const fin = inst.finalize();
  inst.uninstall();
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 && Array.isArray(fin.waveKillLog),
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));

  const tmp = '/tmp/grindfinish-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99309', OUTDIR: tmp });
  execSync('node scripts/grindfinish-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', GRINDFINISH_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/grindfinish-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'grindfinish-s99309-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'grindfinish-s99309-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
