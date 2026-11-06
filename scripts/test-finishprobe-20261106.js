// test-finishprobe-20261106.js — proof for the finishprobe instrument,
// driver, and analyzer (arm sim-finishprobe-a). Fixture tests (fake Game
// wrappers + analyzer ending classification + P1–P5 rule evaluation) +
// live harness smoke + off/on neutrality leg (driver subprocesses into
// /tmp, never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-finishprobe-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'finishprobe-analyze-20261106'));
const INST = require(path.join(REPO, 'scripts', 'finishprobe-instrument-20261106'));

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
    _fieldRec: null,
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
    fieldFight: function (vid, mdef, m, opts) { return G._fieldRec; },
    startCombat: function (mid) { G.tbfight = { round: 1, fighters: [{ key: 'p', kind: 'villager', villagerId: 'leader', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 900, maxHp: 900 }] }; return true; },
    tbPlayerStrike: function () { return true; },
    useAbility: function () { return true; },
    tbEnd: function () { return true; },
    recordWaveKill: function () { return true; },
    playerDeath: function () { return true; },
  };
  return G;
}
function fieldRec(o) {
  return Object.assign({ outcome: 'mFlee', rounds: 6, mDealt: 300, allyDealt: 50, vTaken: 20, mHpLeft: 650, vHpLeft: 60,
    packCount: 1, log: ['leader stares it down.'], partySize: 2, allyVid: 'ally1', intent: 'engage', intentWhy: 'party',
    trickLog: ['shout'], focusFire: true, gearFull: true, committedFinish: false, committedRounds: 0,
    committedHold: 0, chorusHoldRounds: 0, twoblowLastTwo: null, twoblowSum: null,
    staredDown: false, peaceful: false, contactFinishAttempted: false, contactFinishKill: false,
    volley: null, judges: false, fleeWise: false, corneredHold: false,
    fleeHopeless: false, fleeHpFrac: null, fleeLearn: false,
    shoutRound: 2, everWinning: false, everHopeless: true }, o || {});
}

(function () {
  const G = fakeGame();
  const inst = INST.install(G);
  check('install-no-errors', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  // Stare-down mFlee: ending stays SPLIT (mFlee, not collapsed 'flee').
  G._fieldRec = fieldRec({ outcome: 'mFlee', staredDown: true, trickLog: [] });
  G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000, maxHp: 850, tx: 4, ty: 4, mx: 3, my: 5 }, { allies: 1, allyVids: ['ally1'] });
  check('field-wave4-recorded', inst.t.fights.length === 1, 'n=' + inst.t.fights.length);
  const f = inst.t.fights[0];
  check('field-ending-split-mflee', f.ending === 'mFlee' && f.outcomeRaw === 'mFlee' && f.staredDown === true,
    JSON.stringify({ ending: f.ending, staredDown: f.staredDown }));
  check('field-mech-flags', f.committedHold === 0 && f.committedFinish === false && f.volley === null &&
    f.contactFinishAttempted === false && f.log && f.log.length === 1 && f.isScholar === true,
    JSON.stringify({ ch: f.committedHold, log: f.log, scholar: f.isScholar }));
  check('field-party-damage', f.partySize === 2 && f.allyVid === 'ally1' && f.damageDealt === 350 && Math.abs(f.damageFrac - 0.35) < 1e-9,
    JSON.stringify({ partySize: f.partySize, damageDealt: f.damageDealt, damageFrac: f.damageFrac }));
  // Round-cap vFlee: 15 rounds, no bypass flag, fighter walks away.
  G._fieldRec = fieldRec({ outcome: 'vFlee', rounds: 15, mHpLeft: 100, vHpLeft: 20, staredDown: false, log: [] });
  G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000, maxHp: 850 }, { allies: 1, allyVids: ['ally1'] });
  const f2 = inst.t.fights[1];
  check('field-roundcap-vflee', f2.ending === 'vFlee' && f2.roundCap === true && f2.mHpLeft === 100,
    JSON.stringify({ ending: f2.ending, roundCap: f2.roundCap, mHpLeft: f2.mHpLeft }));
  // Arena fight: recorded with the arena flag (analyzer splits it out).
  G._fieldRec = fieldRec({ outcome: 'vKill', rounds: 3, mHpLeft: 0, log: [] });
  G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000, maxHp: 850 }, { noFlee: true });
  const f3 = inst.t.fights[2];
  check('field-arena-flag', f3.arena === true && f3.ending === 'kill', JSON.stringify({ arena: f3.arena, ending: f3.ending }));
  // Wave-3 fight must NOT be recorded (full records are wave-4+ only).
  G._fieldRec = fieldRec({ outcome: 'vKill' });
  G.fieldFight('leader', { id: 'w3a', wave: 3 }, { id: 'w3a', hp: 300 }, {});
  check('field-wave3-skipped', inst.t.fights.length === 3, 'n=' + inst.t.fights.length);
  // TB won with the monster fled: rout, not kill.
  G.startCombat('w4a');
  G.tbPlayerStrike('m_0');
  G.useAbility('bird_strike', 'strike');
  G.tbfight.fighters[1].hp = 400; G.tbfight.fighters[1].fled = true; G.tbfight.round = 3;
  G.tbEnd('won');
  check('tb-recorded', inst.t.fights.length === 4, 'n=' + inst.t.fights.length);
  const tb = inst.t.fights[3];
  check('tb-rout-fields', tb.channel === 'player-tb' && tb.ending === 'kill-or-rout' && tb.monFled === true &&
    tb.monFledCount === 1 && tb.mHpLeftPrimary === 400 && tb.endScholarHp === 80 &&
    tb.abilitiesUsed.indexOf('bird_strike') >= 0,
    JSON.stringify(tb));
  inst.uninstall();
  check('uninstall-restores', G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000 }, {}).outcome === 'vKill' && inst.t.fights.length === 4);
})();

// TB lift: tile-monster alias present with matching id.
(function () {
  const G = fakeGame();
  G.state.scholar.monster = { id: 'w4a', hp: 500, maxHp: 850, veteran: false, lingering: false, titan: false, tx: 4, ty: 4 };
  G.startCombat = function (mid) { G.tbfight = { round: 1, fighters: [{ key: 'p', kind: 'player', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 500, maxHp: 850 }] }; return true; };
  const inst = INST.install(G);
  G.startCombat('w4a');
  G.tbfight.fighters[1].hp = 100; G.tbfight.round = 4;
  G.tbEnd('fled');
  const tb = inst.t.fights[0];
  check('tb-lift-detected', tb && tb.lifted === true && tb.worldHpAtLift && tb.worldHpAtLift.hp === 500 &&
    tb.entryHpPrimary === 500 && tb.ending === 'flee' && tb.outcomeRaw === 'fled',
    JSON.stringify(tb && { lifted: tb.lifted, wh: tb.worldHpAtLift, ehp: tb.entryHpPrimary }));
  inst.uninstall();
})();

// ---- gearOf fix (2026-11-06): the scholar's equipped slots live in
// state.scholar.equipped / Game.equippedWeapon(), NOT in
// getPerson(vid).equipped — the judged corpus read weaponId null 40/40
// while the engine showed the scholar armed 37/40. These tests pin the
// scholar path and the getPerson divergence that caused it.
(function () {
  const G = fakeGame();
  // The stale path: getPerson returns EMPTY equipped for the scholar.
  G.getPerson = function (id) { return { equipped: {} }; };
  // The live path: the engine's own reader + state.scholar.equipped.
  G.state.scholar.equipped = { melee: { itemId: 'shard_spear' }, torso: { itemId: 'bark_armor' } };
  G.equippedWeapon = function () { return { name: 'Shard spear', bonus: 25, range: 2, type: 'melee', unarmed: false, itemId: 'shard_spear' }; };
  const inst = INST.install(G);
  const sg = inst._helpers.gearOf('leader');
  check('gearof-scholar-armed', sg.weaponId === 'shard_spear' && sg.weaponBonus === 25,
    JSON.stringify(sg));
  check('gearof-scholar-armor', sg.armorP === 10 && sg.armorId === 'bark_armor',
    JSON.stringify(sg));
  // Non-scholar fighters still read the getPerson path (villager gear).
  G.getPerson = function (id) { return { equipped: { melee: { itemId: 'shard_spear' }, torso: { itemId: 'bark_armor' } } }; };
  const vg = inst._helpers.gearOf('ally1');
  check('gearof-villager-getperson', vg.weaponId === 'shard_spear' && vg.weaponBonus === 25 && vg.armorP === 10,
    JSON.stringify(vg));
  // Unarmed scholar: unarmed engine profile + empty slots -> nulls.
  G.equippedWeapon = function () { return { name: 'your hands', bonus: 0, type: 'melee', range: 1, ammo: null, unarmed: true, itemId: null }; };
  G.state.scholar.equipped = {};
  const ug = inst._helpers.gearOf('leader');
  check('gearof-scholar-unarmed', ug.weaponId === null && ug.weaponBonus === null && ug.armorP === null,
    JSON.stringify(ug));
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
  return Object.assign({ day: 20, channel: 'field', arena: false, fighter: 'leader', fighters: ['leader'], mid: 'w4a', wave: 4,
    entryHp: 1000, entryMaxHp: 850, defHpLo: 850, defHpHi: 1050,
    entryFracHi: 1000 / 1050, entryFracLo: 1000 / 850,
    damageDealt: 200, damageFrac: 0.2, rounds: 5, swingsAttempted: 5, roundCap: false, partySize: 1, allyVid: null,
    firstDay: null, firstKiller: null, firstKillerAliveAtStart: null, firstKillerInFight: false,
    secondCandidatePresent: true, secondCandidates: ['leader'], ending: 'vFlee', outcomeRaw: 'vFlee',
    mHpLeft: 800, vHpLeft: 60,
    gear: { weaponBonus: 25, armorP: 10 }, abilitiesUsed: [],
    focusFire: false, gearFull: false, committedFinish: false, committedRounds: 0, committedHold: 0,
    staredDown: false, peaceful: false, contactFinishAttempted: false, volley: null,
    judges: false, fleeWise: false, fleeHpFrac: null, intent: 'engage' }, o || {});
}
function tfight(o) {
  return Object.assign({ day: 30, channel: 'player-tb', arena: false, fighter: 'leader', fighters: ['leader'], mid: 'w4a', wave: 4,
    entryHp: 900, entryHpPrimary: 900, entryMaxHpPrimary: 850, defHpLo: 850, defHpHi: 1050,
    entryFracHi: 900 / 1050, entryFracHiPrimary: 900 / 1050, entryFracLoPrimary: 900 / 850,
    damageDealt: 500, damageFrac: 500 / 900, rounds: 4, swingsAttempted: 3, roundCap: false, partySize: 1, allyVid: null,
    firstDay: null, firstKiller: null, firstKillerAliveAtStart: null, firstKillerInFight: false,
    secondCandidatePresent: true, secondCandidates: ['leader'], ending: 'kill-or-rout', outcomeRaw: 'won',
    mHpLeft: 400, mHpLeftPrimary: 400, monFled: false, monFledCount: 0,
    lifted: false, worldHpAtLift: null, pendingLive: false, doorFledAtEntry: null,
    primaryVeteran: false, worldOriginPresent: false,
    gear: { weaponBonus: 25, armorP: 10 }, abilitiesUsed: [],
    endScholarHp: 80, endScholarMaxHp: 100 }, o || {});
}
function writeDir(tag, rows) {
  const dir = '/tmp/finishprobe-analyzer-' + tag + '-' + process.pid;
  fs.mkdirSync(dir, { recursive: true });
  rows.forEach(function (r, i) { fs.writeFileSync(dir + '/finishprobe-s' + r.seed + '-fixture.json', JSON.stringify(r)); });
  return dir;
}
function cleanup(dir) { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }

(function () {
  // Strict kill matching + TB won is a rout without a kill-log row.
  const r = arow(1, {
    fights: [ffight({ day: 20 }), ffight({ day: 21, partySize: 2, fighters: ['leader', 'ally1'], ending: 'kill', outcomeRaw: 'vKill', mHpLeft: 0 }), tfight({ day: 22 })],
    waveKillLog: [{ d: 21, mid: 'w4a', w: 4, by: 'leader', via: 'field' }],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-match-one-kill', s.w4killsMatched === 1 && s.unmatchedKills === 0 && Math.abs(s.killRateWild - 1 / 3) < 1e-9,
    JSON.stringify({ matched: s.w4killsMatched, unmatched: s.unmatchedKills, rate: s.killRateWild }));
  check('analyzer-tb-won-is-rout', s.fights[2].mech === 'rout-dismissed' && s.fights[2].matchedKillBy == null && s.fights[1].mech === 'kill' && s.fights[1].matchedKillBy === 'leader',
    JSON.stringify(s.fights.map(function (f) { return f.mech + ':' + f.matchedKillBy; })));
  const s2 = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-determinism', JSON.stringify(s) === JSON.stringify(s2));
})();
(function () {
  // mFlee mechanism classification from flags, never SAY lines.
  check('classify-stare-down', AN.classifyField({ ending: 'mFlee', staredDown: true }) === 'mflee-stare-down');
  check('classify-peacemaker', AN.classifyField({ ending: 'mFlee', peaceful: true }) === 'mflee-peacemaker');
  check('classify-eater-poison', AN.classifyField({ ending: 'mFlee', abilitiesUsed: ['poison'] }) === 'mflee-eater-poison');
  check('classify-contact-finish', AN.classifyField({ ending: 'mFlee', contactFinishAttempted: true }) === 'mflee-contact-finish');
  check('classify-volley-driveoff', AN.classifyField({ ending: 'mFlee', volley: { shots: 2, hits: 2, dmg: 20 }, rounds: 0 }) === 'mflee-volley-driveoff');
  check('classify-roundcap-mflee', AN.classifyField({ ending: 'mFlee', rounds: 15 }) === 'mflee-round-cap');
  check('classify-roundcap-vflee', AN.classifyField({ ending: 'vFlee', rounds: 15 }) === 'vflee-round-cap');
  check('classify-floor-flee', AN.classifyField({ ending: 'vFlee', fleeHpFrac: 0.2 }) === 'vflee-floor-flee');
  check('classify-suburb-walkout', AN.classifyField({ ending: 'vFlee', fleeWise: true }) === 'vflee-suburb-walkout');
  check('classify-kill-no-log', AN.classifyField({ ending: 'kill' }) === 'kill-no-log-match');
  check('classify-tb-rout-fled', AN.classifyTb({ outcomeRaw: 'won', monFled: true }) === 'rout-monster-fled');
  check('classify-tb-scholar-flee', AN.classifyTb({ outcomeRaw: 'fled' }) === 'scholar-flee');
  check('classify-tb-scholar-death', AN.classifyTb({ outcomeRaw: 'lost' }) === 'scholar-death');
  check('endfrac-field', Math.abs(AN.endFrac({ channel: 'field', mHpLeft: 100, entryMaxHp: 850 }) - 100 / 850) < 1e-9);
  check('endfrac-tb', Math.abs(AN.endFrac({ channel: 'player-tb', mHpLeftPrimary: 100, entryMaxHpPrimary: 850 }) - 100 / 850) < 1e-9);
})();
(function () {
  // P1 fires: 3 of 4 wild fights end non-kill with the beast below 0.15.
  const dir = writeDir('p1', [arow(11, {
    fights: [
      ffight({ day: 20, mHpLeft: 100, ending: 'vFlee', outcomeRaw: 'vFlee', rounds: 15, roundCap: true }),
      ffight({ day: 21, mHpLeft: 80, ending: 'vDie', outcomeRaw: 'vDie', rounds: 8 }),
      tfight({ day: 22, mHpLeft: 120, mHpLeftPrimary: 120, ending: 'flee', outcomeRaw: 'fled' }),
      ffight({ day: 23, mHpLeft: 0, ending: 'kill', outcomeRaw: 'vKill' }),
    ],
    waveKillLog: [{ d: 23, mid: 'w4a', w: 4, by: 'leader', via: 'field' }],
  })]);
  const out = AN.analyzeDir(dir);
  check('p1-fires', out.p1.fires === true && out.p1.nearMissBelowBreak === 3 && Math.abs(out.p1.share - 0.75) < 1e-9 && out.diagGo === true,
    JSON.stringify(out.p1));
  cleanup(dir);
})();
(function () {
  // P2 fires (game-code-only): 2 of 10 field fights end mFlee via
  // stare-down, and NO policy pattern fires, so diagGo stays false.
  const fights = [];
  for (let d = 20; d < 30; d++) {
    fights.push(d === 20 || d === 21
      ? ffight({ day: d, mHpLeft: 900, ending: 'mFlee', outcomeRaw: 'mFlee', staredDown: true, rounds: 2 })
      : ffight({ day: d, mHpLeft: 900, ending: 'vFlee', outcomeRaw: 'vFlee', rounds: 5 }));
  }
  const dir = writeDir('p2', [arow(12, { fights: fights, waveKillLog: [] })]);
  const out = AN.analyzeDir(dir);
  check('p2-fires-diag-no', out.p2.fires === true && Math.abs(out.p2.share - 0.2) < 1e-9 &&
    out.p1.fires === false && out.p3.fires === false && out.diagGo === false,
    JSON.stringify({ p2: out.p2, p1: out.p1, p3: out.p3, go: out.diagGo }));
  cleanup(dir);
})();
(function () {
  // P3 fires: TB kill rate 0, most losses leave the beast above half HP,
  // abilities used in 1/10 fights.
  const fights = [];
  for (let d = 20; d < 30; d++) {
    fights.push(tfight({ day: d, mHpLeft: 600, mHpLeftPrimary: 600, ending: 'death', outcomeRaw: 'lost',
      abilitiesUsed: d === 20 ? ['war_cry'] : [] }));
  }
  const dir = writeDir('p3', [arow(13, { fights: fights, waveKillLog: [] })]);
  const out = AN.analyzeDir(dir);
  check('p3-fires', out.p3.fires === true && out.p3.tbKillRate === 0 &&
    Math.abs(out.p3.tbLostHighHpShare - 1) < 1e-9 && Math.abs(out.p3.tbAbilityShare - 0.1) < 1e-9 && out.diagGo === true,
    JSON.stringify(out.p3));
  cleanup(dir);
})();
(function () {
  // P4 fires: pending-live TB kills 2/5, lifted TB kills 0/5.
  const fights = [];
  for (let d = 20; d < 25; d++) fights.push(tfight({ day: d, mHpLeft: 500, mHpLeftPrimary: 500, ending: 'death', outcomeRaw: 'lost', lifted: true }));
  for (let d = 25; d < 30; d++) {
    const kill = d < 27;
    fights.push(tfight({ day: d, mHpLeft: kill ? 0 : 500, mHpLeftPrimary: kill ? 0 : 500,
      ending: 'kill-or-rout', outcomeRaw: 'won', pendingLive: true }));
  }
  const dir = writeDir('p4', [arow(14, { fights: fights,
    waveKillLog: [{ d: 25, mid: 'w4a', w: 4, by: 'leader', via: 'player' }, { d: 26, mid: 'w4a', w: 4, by: 'leader', via: 'player' }] })]);
  const out = AN.analyzeDir(dir);
  check('p4-fires', out.p4.fires === true && out.p4.pendingLive.killRate === 0.4 && out.p4.lifted.killRate === 0 && out.diagGo === true,
    JSON.stringify(out.p4));
  cleanup(dir);
})();
(function () {
  // P4 unjudgeable on thin buckets (lifted 3, pending-live 2).
  const fights = [];
  for (let d = 20; d < 23; d++) fights.push(tfight({ day: d, lifted: true }));
  for (let d = 23; d < 25; d++) fights.push(tfight({ day: d, pendingLive: true }));
  const dir = writeDir('p4thin', [arow(15, { fights: fights, waveKillLog: [] })]);
  const out = AN.analyzeDir(dir);
  check('p4-thin-unjudgeable', out.p4.unjudgeable === true && out.p4.fires === false,
    JSON.stringify(out.p4));
  cleanup(dir);
})();

async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 55001, mode: 'competent-finishprobe-proof', fullTelemetry: false });
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

  const tmp = '/tmp/finishprobe-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '55001', OUTDIR: tmp });
  execSync('node scripts/finishprobe-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', FINISHPROBE_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/finishprobe-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'finishprobe-s55001-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'finishprobe-s55001-proof-on.json'), 'utf8'));
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
