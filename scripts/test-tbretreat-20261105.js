// test-tbretreat-20261105.js — proof for the TB retreat-and-refind arm
// (sim-tbretreat-b). Per local-proof-of-effect: the proof artifact IS the
// observable effect — a real wave-4 tile monster, wounded in a real TB
// fight, put back wounded on its own tile after the fighter withdraws,
// and re-found there — with an old-code-fails control (flag OFF restores
// nothing). Fixture tests (fake Game: instrument detection + analyzer
// re-find + GO/NO-GO rules) + live harness legs (real game.js: restore
// on 'fled', no restore on 'lost', wave-3 never restored, door-stash
// skip, lingering separation, monster-flee unchanged) + flag-neutrality
// legs (10d, baseline policy, flag OFF vs ON: identical outcomes) +
// driver smoke (both legs, 10d, seed 99721, to /tmp, 0 errors).
// Exit non-zero on any failure.
// Usage: node scripts/test-tbretreat-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'tbretreat-analyze-20261105'));
const INST = require(path.join(REPO, 'scripts', 'tbretreat-instrument-20261105'));

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
  const _wm = [];
  const G = {
    villagerId: 'leader',
    data: {
      monsters: [{ id: 'w4a', wave: 4, hp: [850, 1050] }, { id: 'w3a', wave: 3, hp: [240, 420] }],
      items: [{ id: 'bark_armor', armor: { protection: 10 } }, { id: 'shard_spear', weapon: { bonus: 25 } }],
      villagers: [], background_survivors: [],
    },
    state: { scholar: { day: 50, monster: null }, waveKillLog: [{ d: 10, mid: 'w4a', w: 4, by: 'k1', via: 'field' }], village: { fallen: [], roster: ['leader', 'ally1', 'k1'], health: {} }, doorFledMonsters: null },
    map: { px: 4, py: 4 },
    getPerson: function (id) { return persons[id] || null; },
    playerAtHaven: function () { return true; },
    tbfight: null,
    worldMonsters: function () { return _wm; },
    monsterAt: function (tx, ty) { return _wm.filter(function (m) { return m.tx === tx && m.ty === ty; })[0] || null; },
    syncMonsterAlias: function () { return null; },
    touchTileScene: function () { return true; },
    tbFighter: function (key) {
      if (!G.tbfight) return null;
      return (G.tbfight.fighters || []).filter(function (x) { return x.key === key; })[0] || null;
    },
    fieldFight: function (vid, mdef, m, opts) {
      return { outcome: 'mFlee', rounds: 6, mDealt: 300, allyDealt: 50, vTaken: 20, mHpLeft: 650, packCount: 1, log: [], partySize: 2, allyVid: 'ally1', intent: 'engage', intentWhy: 'party', trickLog: ['shout'], focusFire: true, gearFull: true, committedFinish: true, committedRounds: 2, shoutRound: 2, everWinning: false, everHopeless: true };
    },
    startCombat: function (mid) { G.tbfight = { round: 1, fighters: [{ kind: 'player', key: 'p', villagerId: 'leader', hp: 80, maxHp: 100 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a', wave: 4 }, hp: 900, maxHp: 900 }] }; return true; },
    tbPlayerStrike: function () { return true; },
    useAbility: function () { return true; },
    tbEnd: function () { return true; },
    recordWaveKill: function () { return true; },
    playerDeath: function () { return true; },
    _wm: _wm,
  };
  return G;
}

(function () {
  // Instrument records a fled TB fight with a tile origin and detects a
  // restore the (fake) game put back after tbEnd returns.
  const G = fakeGame();
  G.state.scholar.monster = { id: 'w4a', hp: 500, maxHp: 850, veteran: false, lingering: false, titan: false, tx: 4, ty: 4 };
  process.env.TBRETREAT_RESTORE = '1';
  // Fakes must be in place BEFORE install wraps them.
  G.startCombat = function (mid) {
    G.tbfight = { round: 1, fighters: [{ kind: 'player', key: 'p', villagerId: 'leader', hp: 40, maxHp: 100 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a', wave: 4 }, hp: 500, maxHp: 850 }],
      tbRetreatOrigin: { id: 'w4a', hp: 500, maxHp: 850, tx: 4, ty: 4 } };
    return true;
  };
  // The fake game restores the origin after tbEnd, exactly like the real
  // game does (min(preHp 500, fighter end HP 300) = 300, same tile).
  G.tbEnd = function () { G._wm.push({ id: 'w4a', hp: 300, maxHp: 850, tx: 4, ty: 4 }); return true; };
  const inst = INST.install(G);
  check('install-no-errors', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  G.startCombat('w4a');
  G.tbfight.fighters[1].hp = 300; G.tbfight.round = 4;
  G.tbEnd('fled');
  const tb = inst.t.fights[0];
  check('tb-retreat-origin-recorded', tb && tb.tileOrigin && tb.tileOrigin.id === 'w4a' && tb.tileOrigin.hp === 500 &&
    tb.tileOrigin.tx === 4 && tb.retreatOriginRecorded === true && tb.flagOn === true,
    JSON.stringify(tb && { tileOrigin: tb.tileOrigin, recorded: tb.retreatOriginRecorded, flagOn: tb.flagOn }));
  check('tb-restore-detected', tb && tb.restored === true && tb.restoredHp === 300 &&
    tb.restoredTile && tb.restoredTile.tx === 4 && tb.restoreFidelity === true &&
    tb.ending === 'flee' && Math.abs(tb.scholarHpFracAtExit - 0.40) < 1e-9,
    JSON.stringify(tb && { restored: tb.restored, hp: tb.restoredHp, fidelity: tb.restoreFidelity, sfrac: tb.scholarHpFracAtExit }));
  inst.uninstall();
  delete process.env.TBRETREAT_RESTORE;
})();

(function () {
  // Flag OFF: same fled fight, no origin in the world after tbEnd —
  // the instrument reports flag-off, never a phantom restore.
  const G = fakeGame();
  G.state.scholar.monster = { id: 'w4a', hp: 500, maxHp: 850, veteran: false, lingering: false, titan: false, tx: 4, ty: 4 };
  delete process.env.TBRETREAT_RESTORE;
  const inst = INST.install(G);
  G.startCombat('w4a');
  G.tbfight.fighters[1].hp = 300; G.tbfight.round = 4;
  G.tbEnd('fled');
  const tb = inst.t.fights[0];
  check('tb-flag-off-no-restore', tb && tb.restored === false && tb.restoreSkippedReason === 'flag-off' &&
    tb.retreatOriginRecorded === false && tb.flagOn === false,
    JSON.stringify(tb && { restored: tb.restored, reason: tb.restoreSkippedReason, recorded: tb.retreatOriginRecorded }));
  inst.uninstall();
})();

(function () {
  // Door-stash skip: a stashed entry for the mid means the stash owns
  // preservation — the instrument reports door-stash, not a miss.
  const G = fakeGame();
  G.state.scholar.monster = { id: 'w4a', hp: 500, maxHp: 850, veteran: false, lingering: false, titan: false, tx: 4, ty: 4 };
  G.state.doorFledMonsters = [{ id: 'w4a', hp: 300, bearer: 'leader' }];
  process.env.TBRETREAT_RESTORE = '1';
  // Fake in place BEFORE install wraps it.
  G.startCombat = function (mid) {
    G.tbfight = { round: 1, fighters: [{ kind: 'player', key: 'p', villagerId: 'leader', hp: 40, maxHp: 100 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a', wave: 4 }, hp: 500, maxHp: 850 }],
      tbRetreatOrigin: { id: 'w4a', hp: 500, maxHp: 850, tx: 4, ty: 4 } };
    return true;
  };
  const inst = INST.install(G);
  G.startCombat('w4a');
  G.tbfight.fighters[1].hp = 300;
  G.tbEnd('fled');
  const tb = inst.t.fights[0];
  check('tb-door-stash-skip', tb && tb.restored === false && tb.restoreSkippedReason === 'door-stash' &&
    tb.doorStashAtEnd === true,
    JSON.stringify(tb && { restored: tb.restored, reason: tb.restoreSkippedReason, stash: tb.doorStashAtEnd }));
  inst.uninstall();
  delete process.env.TBRETREAT_RESTORE;
})();

// ---- analyzer fixtures ----
function arow(seed, opts) {
  const r = { seed: seed, run: 'fixture', days: 100, endReason: 'horizon', won: false,
    fights: [], daily: [{ day: 1, gated: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [], deadMap: {},
    scaleRank: 'village', unlockedWave: 1, maxWave: 1, stayStats: null };
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
    tileOrigin: null, retreatOriginRecorded: false, flagOn: false,
    restored: null, restoredHp: null, restoredTile: null, restoreSkippedReason: null,
    restoreFidelity: null, scholarHpFracAtExit: null, doorStashAtEnd: null,
    gear: { weaponBonus: 25, armorP: 10 }, abilitiesUsed: [] }, o || {});
}
(function () {
  // Re-find: a restored beast (fled TB, restoredHp 300) re-met by a field
  // fight at exactly 300 HP 3 days later counts; a later TB entry at 300
  // counts too; a fight at any other HP does not.
  const r = arow(1, {
    fights: [
      tfight({ day: 20, ending: 'flee', outcomeRaw: 'fled', mHpLeft: 300, mHpLeftPrimary: 300,
        entryHp: 500, entryHpPrimary: 500, entryFracHiPrimary: 500 / 1050,
        lifted: true, worldHpAtLift: { hp: 500, maxHp: 850 },
        tileOrigin: { id: 'w4a', hp: 500, maxHp: 850, tx: 4, ty: 4 }, retreatOriginRecorded: true, flagOn: true,
        restored: true, restoredHp: 300, restoredTile: { tx: 4, ty: 4 }, restoreFidelity: true, scholarHpFracAtExit: 0.4 }),
      ffight({ day: 23, entryHp: 300, mHpLeft: 100, entryFracHi: 300 / 1050 }),
      tfight({ day: 40, entryHp: 850, entryHpPrimary: 850, entryFracHiPrimary: 850 / 1050, ending: 'death', outcomeRaw: 'lost' }),
    ],
    waveKillLog: [],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-retreat-refind-7d', s.retreat.retreatedBeasts === 1 && s.retreat.refound7d === 1 &&
    Math.abs(s.retreat.refound7dShare - 1) < 1e-9 && s.retreat.restoredShare === 1 &&
    s.retreat.restoreFidelityShare === 1 && s.retreat.refindDetail[0].channel === 'field' &&
    s.retreat.refindDetail[0].gapDays === 3,
    JSON.stringify(s.retreat));
})();
(function () {
  // No re-find: restored beast never re-met at its restored HP.
  const r = arow(2, {
    fights: [
      tfight({ day: 20, ending: 'flee', outcomeRaw: 'fled', mHpLeft: 300, mHpLeftPrimary: 300,
        entryHp: 500, entryHpPrimary: 500, lifted: true, worldHpAtLift: { hp: 500, maxHp: 850 },
        tileOrigin: { id: 'w4a', hp: 500, maxHp: 850, tx: 4, ty: 4 }, retreatOriginRecorded: true, flagOn: true,
        restored: true, restoredHp: 300, restoredTile: { tx: 4, ty: 4 }, restoreFidelity: true }),
      ffight({ day: 25, entryHp: 850, mHpLeft: 700 }),
    ],
    waveKillLog: [],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-retreat-no-refind', s.retreat.retreatedBeasts === 1 && s.retreat.refound === 0 &&
    s.retreat.refound7dShare === 0, JSON.stringify(s.retreat));
})();
(function () {
  // GO rule: exits/firings 1/2, re-find 1/2, kill rate held, survival held.
  const base = { overallKillRate: 0.10, wall: { medianDays: 80 }, retreat: { stayTotals: { triggerFires: 0, exits: 0 } } };
  const armed = { overallKillRate: 0.06, wall: { medianDays: 70 },
    retreat: { stayTotals: { triggerFires: 4, exits: 2, exitRate: 0.5 }, retreatedBeasts: 2, refound7d: 1, refound7dShare: 0.5 } };
  const v = AN.compareLegs(base, armed);
  check('verdict-go', v.go === true && v.g1.holds === true && v.g2.holds === true &&
    v.g3.holds === true && v.g4.holds === true, JSON.stringify(v));
  const armedNoRefind = { overallKillRate: 0.06, wall: { medianDays: 70 },
    retreat: { stayTotals: { triggerFires: 4, exits: 2, exitRate: 0.5 }, retreatedBeasts: 2, refound7d: 0, refound7dShare: 0 } };
  const v2 = AN.compareLegs(base, armedNoRefind);
  check('verdict-no-refind-no-go', v2.go === false && v2.g2.holds === false && v2.g1.holds === true,
    JSON.stringify(v2));
  const armedKillHalved = { overallKillRate: 0.04, wall: { medianDays: 70 },
    retreat: { stayTotals: { triggerFires: 4, exits: 2, exitRate: 0.5 }, retreatedBeasts: 2, refound7d: 1, refound7dShare: 0.5 } };
  const v3 = AN.compareLegs(base, armedKillHalved);
  check('verdict-kill-halved-no-go', v3.go === false && v3.g3.holds === false, JSON.stringify(v3));
  const thin = { overallKillRate: 0.06, wall: { medianDays: 70 },
    retreat: { stayTotals: { triggerFires: 4, exits: 1, exitRate: 0.25 }, retreatedBeasts: 2, refound7d: 1, refound7dShare: 0.5 } };
  const v4 = AN.compareLegs(base, thin);
  check('verdict-thin-g2-flagged', v4.g2.thin === true && v4.g1.holds === true, JSON.stringify(v4.g2));
})();

// ---- live harness: the real game restores on 'fled' (flag ON) ----
async function liveRestoreLeg(opts) {
  const flagOn = !!opts.flagOn;
  if (flagOn) process.env.TBRETREAT_RESTORE = '1'; else delete process.env.TBRETREAT_RESTORE;
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 99721, mode: 'competent-tbretreat-proof', fullTelemetry: false });
  await setupGame(Game);
  const tx = Game.map.px, ty = Game.map.py;
  const origin = { id: opts.mid || 'influencer', tx: tx, ty: ty, mx: 4, my: 4,
    hp: opts.originHp != null ? opts.originHp : 500, maxHp: 850,
    lingering: !!opts.lingering, titan: !!opts.titan };
  Game.worldMonsters().push(origin);
  try { Game.syncMonsterAlias(); } catch (e) {}
  if (opts.doorStash) {
    try { Game.state.doorFledMonsters = [{ id: origin.id, hp: 300, bearer: Game.villagerId }]; } catch (e) {}
  }
  const aliasBefore = (function () { try { return Game.playerMonster(); } catch (e) { return null; } })();
  Game.startCombat(origin.id);
  const f = Game.tbfight;
  const mon = f && (f.fighters || []).filter(function (x) { return x && (x.kind === 'monster' || x.kind === 'hostile'); })[0];
  const entryHp = mon ? mon.hp : null;
  const entryMaxHp = mon ? mon.maxHp : null;
  if (mon) mon.hp = (opts.endHp != null ? opts.endHp : 300);
  const recorded = !!(f && f.tbRetreatOrigin);
  const worldOrigin = !!(f && f.worldOrigin);
  Game.tbEnd(opts.result || 'fled');
  const back = (function () {
    try {
      return Game.worldMonsters().filter(function (m) { return m && m.id === origin.id && m.tx === tx && m.ty === ty; })[0] || null;
    } catch (e) { return null; }
  })();
  return { aliasWasOrigin: !!(aliasBefore && aliasBefore.id === origin.id), entryHp: entryHp, entryMaxHp: entryMaxHp,
    recorded: recorded, worldOrigin: worldOrigin, back: back ? { hp: back.hp, tx: back.tx, ty: back.ty } : null,
    monsterFledFlag: mon ? !!mon.fled : null };
}

async function liveLegs() {
  // Main leg: flag ON, ordinary wave-4 tile monster, fled at 300 HP.
  // The beast must come back at exactly 300 HP on its own tile, and the
  // monster fighter must not have been marked fled by the game.
  // ENTRY-HP NOTE (pre-existing engine behavior, not this lever):
  // startCombat runs OPENING TURNS synchronously before it returns, so
  // a fast companion can strike the lifted fighter first (here 500 ->
  // 489). The lift's signature is hp < maxHp with maxHp = world maxHp
  // (a fresh roll builds hp === maxHp); the origin object itself is
  // untouched at 500. The restore below is judged on the fighter's end
  // HP (300, set explicitly), which is the formula's input.
  const on = await liveRestoreLeg({ flagOn: true });
  check('live-restore-on-fled', on.aliasWasOrigin === true && on.entryHp != null && on.entryHp > 0 &&
    on.entryHp <= 500 && on.entryMaxHp === 850 && on.entryHp < on.entryMaxHp &&
    on.recorded === true &&
    on.worldOrigin === false && on.back && on.back.hp === 300 && on.back.tx != null &&
    on.monsterFledFlag === false,
    JSON.stringify(on));
  // Old-code control: flag OFF, identical setup — nothing comes back.
  const off = await liveRestoreLeg({ flagOn: false });
  check('live-restore-off-control', off.aliasWasOrigin === true && off.entryHp != null && off.entryHp > 0 &&
    off.entryHp <= 500 && off.entryMaxHp === 850 && off.recorded === false && off.back === null,
    JSON.stringify(off));
  // 'lost' does NOT restore, even with the flag on.
  const lost = await liveRestoreLeg({ flagOn: true, result: 'lost' });
  check('live-no-restore-on-lost', lost.recorded === true && lost.back === null,
    JSON.stringify(lost));
  // Wave-3 never restores, even with the flag on.
  const w3 = await liveRestoreLeg({ flagOn: true, mid: 'spool', originHp: 300, endHp: 200 });
  check('live-no-restore-wave3', w3.recorded === true && w3.back === null,
    JSON.stringify(w3));
  // Door-stash skip: the stash owns preservation, no world restore.
  const door = await liveRestoreLeg({ flagOn: true, doorStash: true });
  check('live-door-stash-skip', door.recorded === true && door.back === null,
    JSON.stringify(door));
  // Lingering separation: a lingering origin is never recorded on the
  // new field (its own worldOrigin path owns it).
  const ling = await liveRestoreLeg({ flagOn: true, lingering: true });
  check('live-lingering-separation', ling.recorded === false && ling.worldOrigin === true,
    JSON.stringify(ling));

  // Flag neutrality: 10 days, baseline policy, flag OFF vs ON must be
  // identical (no retreat is driven by the baseline policy, and the
  // flag adds no monster behavior).
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  async function neutralityLeg(flagOn) {
    if (flagOn) process.env.TBRETREAT_RESTORE = '1'; else delete process.env.TBRETREAT_RESTORE;
    const { Game } = await loadGame({ seed: 99721, mode: 'competent-tbretreat-proof', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async function () { result = await runDays(Game, competent, { days: 10, manifest: undefined, sampleEvery: 30 }); });
    return { days: result.days, endReason: result.endReason,
      kills: (((Game.state || {}).waveKillLog) || []).length };
  }
  const nOff = await neutralityLeg(false);
  const nOn = await neutralityLeg(true);
  check('live-neutrality-off-on', nOff.days === nOn.days && nOff.endReason === nOn.endReason &&
    nOff.kills === nOn.kills,
    'off=' + JSON.stringify(nOff) + ' on=' + JSON.stringify(nOn));
  delete process.env.TBRETREAT_RESTORE;

  // Driver smoke: both legs, 10d, seed 99721, to /tmp, 0 errors.
  const tmp = '/tmp/tbretreat-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99721', OUTDIR: tmp });
  delete envBase.TBRETREAT_RESTORE;
  execSync('node scripts/tbretreat-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-baseline', POLICY: 'baseline' }), stdio: 'pipe' });
  execSync('node scripts/tbretreat-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-armed', POLICY: 'tbretreat' }), stdio: 'pipe' });
  const b = JSON.parse(fs.readFileSync(path.join(tmp, 'tbretreat-s99721-proof-baseline.json'), 'utf8'));
  const a = JSON.parse(fs.readFileSync(path.join(tmp, 'tbretreat-s99721-proof-armed.json'), 'utf8'));
  check('driver-smoke', b.policy === 'baseline' && b.flagOn === false && a.policy === 'tbretreat' && a.flagOn === true &&
    b.instrumentErrors.length === 0 && a.instrumentErrors.length === 0 &&
    b.days === a.days && b.endReason === a.endReason,
    'baseline=' + b.days + '/' + b.endReason + '/flagOn=' + b.flagOn + ' armed=' + a.days + '/' + a.endReason + '/flagOn=' + a.flagOn +
    ' errs=' + b.instrumentErrors.length + '/' + a.instrumentErrors.length);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
