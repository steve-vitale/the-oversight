// test-staypolicy-20261105.js — proof for the flee-when-losing policy
// variant, the staypolicy instrument, driver, and analyzer (arm
// sim-staypolicy-a). Fixture tests (fake Game: trigger boundaries,
// delegation, stuck/sealed fallbacks, stats) + instrument/analyzer
// fixtures + live harness smoke + off/on neutrality leg + variant-vs-
// baseline neutrality leg (driver subprocesses into /tmp, never into
// evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-staypolicy-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'staypolicy-analyze-20261105'));
const INST = require(path.join(REPO, 'scripts', 'staypolicy-instrument-20261105'));
const STAY = require(path.join(REPO, 'scripts', 'policies', 'flee-when-losing'));
const BASE = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---- variant wrapping: only fight is overridden, no env gates ----
(function () {
  const v = STAY.fleeWhenLosing;
  check('wrap-daily-identical', v.daily === BASE.competent.daily);
  check('wrap-fight-overridden', v.fight !== BASE.competent.fight);
  check('wrap-id', v.id === 'flee-when-losing');
  check('wrap-eat-reexport', STAY.competentEat === BASE.competentEat);
  const gates = ['COMPETENT_DPS_RACE', 'COMPETENT_DIRECTIONAL_FLEE', 'COMPETENT_EXIT_VERIFIED_FLEE', 'COMPETENT_FLEE_REPAIR', 'COMPETENT_FIGHT_ASSESS', 'COMPETENT_W2DISENGAGE'];
  check('no-env-gates', gates.every(function (k) { return process.env[k] !== '1'; }), JSON.stringify(gates.map(function (k) { return [k, process.env[k]]; })));
  check('trigger-constants', STAY.SWL_SCHOLAR_HP === 0.50 && STAY.SWL_MONSTER_HP === 0.50 && STAY.SWL_STUCK_TURNS === 3);
})();

// ---- fake TB Game for the policy fixtures ----
function fakeTb(opts) {
  const o = opts || {};
  const p = { key: 'p', kind: 'player', hp: (o.php != null ? o.php : 100), maxHp: (o.pmax != null ? o.pmax : 100), mx: 4, my: 4, moveLeft: 2, acted: false };
  const m = { key: 'm_0', kind: 'monster', alive: true, fled: false, monsterId: o.mid || 'w4a',
    mdef: { id: o.mid || 'w4a', wave: (o.wave != null ? o.wave : 4) },
    hp: (o.mhp != null ? o.mhp : 600), maxHp: (o.mmax != null ? o.mmax : 1000), mx: 6, my: 4 };
  const f = { id: 'fight1', over: false, round: 1, gridSize: 9, fighters: [p, m] };
  const calls = { moves: [], pushes: 0, waits: 0, endTurns: 0, baseCalls: 0 };
  const G = {
    villagerId: 'leader',
    data: { monsters: [{ id: 'w4a', wave: 4 }, { id: 'w3a', wave: 3 }, { id: 'w5a', wave: 5 }], items: [], villagers: [], background_survivors: [] },
    state: { scholar: { day: 50 }, waveKillLog: [], village: { fallen: [], roster: ['leader'], health: {} } },
    map: { px: 4, py: 4 },
    tbfight: f,
    tbFighter: function (k) { return k === 'p' ? p : null; },
    tbIsPlayerTurn: function () { return true; },
    tbPlayerMove: function (x, y) {
      calls.moves.push([x, y]);
      if (o.moveStuck) return false;
      p.mx = x; p.my = y;
      return true;
    },
    tbBarrierExit: function (dx, dy) {
      calls.pushes += 1;
      if (o.pushConsumed) return true; // consumed WITHOUT exiting
      f.over = true; // exited the fight
      return true;
    },
    tbPlayerWait: function () { calls.waits += 1; },
    tbAfterPlayerAction: function () { calls.endTurns += 1; },
    equippedWeapon: function () { return { range: 1 }; },
  };
  return { G: G, p: p, m: m, f: f, calls: calls };
}

// Stub the base fight so delegation is observable (restored after the
// fixtures — the live legs below must see the real base policy).
const origBaseFight = BASE.competent.fight;
let baseCalls = 0;
BASE.competent.fight = function () { baseCalls += 1; return 'base-handled'; };

function runPolicy(fake, ctx) {
  // ctx persists across the turns of one fight, as the harness provides
  // it — a fresh ctx per call would reset the per-fight state.
  ctx = ctx || {};
  const r = STAY.fleeWhenLosing.fight(fake.G, ctx);
  return { r: r, ctx: ctx };
}

(function () {
  // 1. Trigger fires at 49/100 vs 600/1000: walk to the edge, then push
  // through and exit. 4 steps (4,4)->(0,4) + 1 push = 5 turns.
  STAY.resetStayStats();
  const fake = fakeTb({ php: 49, mhp: 600 });
  baseCalls = 0;
  let r;
  const ctx = {};
  for (let i = 0; i < 5; i++) { r = runPolicy(fake, ctx); }
  check('trigger-fires-walk-push-exit', r.r === true && fake.calls.moves.length === 4 && fake.calls.pushes === 1 && fake.f.over === true,
    JSON.stringify({ moves: fake.calls.moves, pushes: fake.calls.pushes, over: fake.f.over }));
  check('trigger-stats', (function () { const s = STAY.stayStats(); return s.triggerFires === 1 && s.fights === 1 && s.fleeTurns === 5 && s.exits === 1 && s.events.length === 1 && s.events[0].scholarHpFrac === 0.49 && s.events[0].monsterHpFrac === 0.6 && s.events[0].result === 'exited'; })(),
    JSON.stringify(STAY.stayStats()));
  check('trigger-no-base-call', baseCalls === 0, 'baseCalls=' + baseCalls);
})();

(function () {
  // 2. Boundaries: scholar exactly 50% does NOT fire; monster exactly
  // 50% does NOT fire; scholar 49% + monster 51% DOES fire.
  STAY.resetStayStats();
  let fake = fakeTb({ php: 50, mhp: 900 });
  baseCalls = 0;
  let r = runPolicy(fake);
  check('boundary-scholar-50-nofire', r.r === 'base-handled' && baseCalls === 1 && STAY.stayStats().triggerFires === 0,
    JSON.stringify({ r: r.r, baseCalls: baseCalls }));
  fake = fakeTb({ php: 49, mhp: 500 });
  baseCalls = 0;
  r = runPolicy(fake);
  check('boundary-monster-50-nofire', r.r === 'base-handled' && baseCalls === 1 && STAY.stayStats().triggerFires === 0,
    JSON.stringify({ r: r.r, baseCalls: baseCalls }));
  fake = fakeTb({ php: 49, mhp: 510 });
  baseCalls = 0;
  r = runPolicy(fake);
  check('boundary-49-51-fires', r.r === true && baseCalls === 0 && STAY.stayStats().triggerFires === 1,
    JSON.stringify({ r: r.r, baseCalls: baseCalls }));
})();

(function () {
  // 3. Non-wave-4 fights delegate untouched: wave 3, wave 5, unknown.
  STAY.resetStayStats();
  const cases = [
    { wave: 3, mid: 'w3a', php: 10 },
    { wave: 5, mid: 'w5a', php: 10 },
    { wave: null, mid: 'mystery', php: 10 },
  ];
  let ok = true;
  cases.forEach(function (c) {
    const fake = fakeTb({ php: c.php, mid: c.mid, wave: c.wave });
    // Unknown monster: strip mdef.wave so the roster lookup also fails.
    if (c.wave == null) { fake.m.mdef = { id: 'mystery' }; }
    baseCalls = 0;
    const r = runPolicy(fake);
    if (!(r.r === 'base-handled' && baseCalls === 1)) ok = false;
  });
  check('non-wave4-delegates', ok && STAY.stayStats().triggerFires === 0 && STAY.stayStats().fleeTurns === 0,
    JSON.stringify(STAY.stayStats()));
})();

(function () {
  // 4. Stuck flee: the step moves nowhere 3 turns in a row (monster out
  // of range, so no strike fall-through) -> unfleeable, base fights it
  // out from then on. The 4th call delegates straight to base.
  STAY.resetStayStats();
  const fake = fakeTb({ php: 20, mhp: 900, moveStuck: true });
  fake.m.mx = 8; fake.m.my = 8; // out of range (Chebyshev 4 > 1)
  baseCalls = 0;
  const ctx = {};
  let r1 = runPolicy(fake, ctx), r2 = runPolicy(fake, ctx), r3 = runPolicy(fake, ctx);
  const s3 = STAY.stayStats();
  const r4 = runPolicy(fake, ctx);
  check('stuck-3-fallback', r1.r === true && r2.r === true && r3.r === 'base-handled' && baseCalls === 2 &&
    s3.stuckFallbacks === 1 && r4.r === 'base-handled',
    JSON.stringify({ r1: r1.r, r2: r2.r, r3: r3.r, r4: r4.r, baseCalls: baseCalls, stats: s3 }));
})();

(function () {
  // 5. Consumed push: scholar already on the edge, push does not exit ->
  // wait the turn out, mark unfleeable, next turn delegates to base.
  STAY.resetStayStats();
  const fake = fakeTb({ php: 20, mhp: 900, pushConsumed: true });
  fake.p.mx = 0; fake.p.my = 4;
  baseCalls = 0;
  const ctx = {};
  const r1 = runPolicy(fake, ctx);
  const s1 = STAY.stayStats();
  const r2 = runPolicy(fake, ctx);
  check('consumed-push-fallback', r1.r === true && fake.calls.waits === 1 && fake.calls.pushes === 1 &&
    s1.sealedFallbacks === 1 && s1.events[0].result === 'sealed-fallback' &&
    r2.r === 'base-handled' && baseCalls === 1,
    JSON.stringify({ r1: r1.r, r2: r2.r, waits: fake.calls.waits, stats: s1 }));
})();

(function () {
  // 6. monsterHpFrac sums across live wave-4 fighters; stats reset + copy.
  const w4 = [{ hp: 300, maxHp: 1000 }, { hp: 100, maxHp: 500 }];
  check('monsterHpFrac-sums', Math.abs(STAY.monsterHpFrac(w4) - 400 / 1500) < 1e-9, String(STAY.monsterHpFrac(w4)));
  STAY.resetStayStats();
  const a = STAY.stayStats();
  a.triggerFires = 99;
  check('stats-copy-isolated', STAY.stayStats().triggerFires === 0);
  // fightWaves: unknown monster is never wave 4.
  const G = { tbfight: { over: false, fighters: [{ kind: 'monster', alive: true, monsterId: 'mystery', mdef: { id: 'mystery' }, hp: 10 }] }, data: { monsters: [{ id: 'w4a', wave: 4 }] } };
  check('fightWaves-unknown-not-w4', STAY.fightWaves(G).w4.length === 0 && STAY.fightWaves(G).unknown.length === 1);
})();

// Restore the real base fight before any live leg.
BASE.competent.fight = origBaseFight;

// ---- instrument fixtures (staypolicy instrument = finishhold record shape) ----
function fakeGame() {
  const persons = {
    leader: { equipped: { melee: { itemId: 'shard_spear' }, torso: { itemId: 'bark_armor' } } },
    ally1: { equipped: { melee: { itemId: 'shard_spear' }, armor: null } },
    k1: { equipped: {} },
  };
  const G = {
    villagerId: 'leader',
    data: {
      monsters: [{ id: 'w4a', wave: 4 }, { id: 'w3a', wave: 3 }],
      items: [{ id: 'bark_armor', armor: { protection: 10 } }, { id: 'shard_spear', weapon: { bonus: 25 } }],
      villagers: [], background_survivors: [],
    },
    state: { scholar: { day: 50 }, waveKillLog: [{ d: 10, mid: 'w4a', w: 4, by: 'k1', via: 'field' }], village: { fallen: [], roster: ['leader', 'ally1', 'k1'], health: {} } },
    map: { px: 4, py: 4 },
    getPerson: function (id) { return persons[id] || null; },
    playerAtHaven: function () { return true; },
    tbfight: null,
    fieldFight: function (vid, mdef, m, opts) {
      return { outcome: 'mFlee', rounds: 6, mDealt: 300, allyDealt: 50, vTaken: 20, mHpLeft: 650, packCount: 1, log: [], partySize: 2, allyVid: 'ally1', intent: 'engage', intentWhy: 'party', trickLog: ['shout'] };
    },
    startCombat: function (mid) { G.tbfight = { round: 1, fighters: [{ kind: 'villager', villagerId: 'leader', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 900 }] }; return true; },
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
  G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000 }, { allies: 1, allyVids: ['ally1'] });
  check('field-wave4-recorded', inst.t.fights.length === 1, 'n=' + inst.t.fights.length);
  const f = inst.t.fights[0];
  check('field-record', f.partySize === 2 && f.damageDealt === 350 && f.ending === 'flee' && f.secondCandidatePresent === true,
    JSON.stringify({ partySize: f.partySize, damageDealt: f.damageDealt, ending: f.ending }));
  G.startCombat('w4a');
  G.tbPlayerStrike('m_0');
  G.tbfight.fighters[1].hp = 400; G.tbfight.round = 3;
  G.tbEnd('won');
  check('tb-recorded-not-kill', inst.t.fights.length === 2 && inst.t.fights[1].ending === 'kill-or-rout' && inst.t.fights[1].damageDealt === 500,
    JSON.stringify(inst.t.fights[1]));
  inst.uninstall();
  check('uninstall-restores', G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000 }, {}).outcome === 'mFlee' && inst.t.fights.length === 2);
})();

// ---- analyzer fixtures ----
function arow(seed, opts) {
  const r = { seed: seed, run: 'fixture', days: 100, endReason: 'horizon', won: false,
    fights: [], daily: [{ day: 1, gated: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [], deadMap: {},
    scaleRank: 'village', unlockedWave: 1, maxWave: 1, stayStats: { fights: 0, triggerFires: 0, fleeTurns: 0, exits: 0, stuckFallbacks: 0, sealedFallbacks: 0, events: [] } };
  return Object.assign(r, opts || {});
}
function ffight(o) {
  return Object.assign({ day: 20, channel: 'field', fighter: 'leader', fighters: ['leader'], mid: 'w4a', wave: 4,
    entryHp: 1000, damageDealt: 200, damageFrac: 0.2, rounds: 5, swingsAttempted: 5, partySize: 1,
    firstKiller: 'k1', firstKillerAliveAtStart: true, firstKillerInFight: false,
    secondCandidatePresent: true, secondCandidates: ['leader'], ending: 'flee', outcomeRaw: 'mFlee',
    gear: { weaponBonus: 25, armorP: 10 },
    focusFire: false, committedFinish: false, committedRounds: 0, shoutRound: null, everWinning: false, everHopeless: false }, o || {});
}
(function () {
  const r = arow(1, {
    fights: [ffight({ day: 20 }), ffight({ day: 21, partySize: 2, fighters: ['leader', 'ally1'], ending: 'kill', outcomeRaw: 'vKill' }), ffight({ day: 22, channel: 'player-tb', ending: 'kill-or-rout', outcomeRaw: 'won' })],
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
  // Legs: one dir holding a baseline + an armed row splits by row.run,
  // and the stay join flags the matching TB fight.
  const dir = '/tmp/staypolicy-analyzer-' + process.pid;
  fs.mkdirSync(dir, { recursive: true });
  const base = arow(99241, { run: 'staypolicy-baseline',
    fights: [ffight({ day: 20, channel: 'player-tb', ending: 'death', outcomeRaw: 'lost' })], waveKillLog: [] });
  const armed = arow(99241, { run: 'staypolicy-armed',
    fights: [ffight({ day: 20, channel: 'player-tb', ending: 'flee', outcomeRaw: 'fled' })], waveKillLog: [],
    stayStats: { fights: 1, triggerFires: 1, fleeTurns: 5, exits: 1, stuckFallbacks: 0, sealedFallbacks: 0,
      events: [{ day: 20, mid: 'w4a', turn: 2, scholarHpFrac: 0.49, monsterHpFrac: 0.6, result: 'exited' }] } });
  fs.writeFileSync(dir + '/staypolicy-s99241-staypolicy-baseline.json', JSON.stringify(base));
  fs.writeFileSync(dir + '/staypolicy-s99241-staypolicy-armed.json', JSON.stringify(armed));
  const out = AN.analyzeDir(dir);
  check('analyzer-legs-split', out.legs['staypolicy-baseline'] && out.legs['staypolicy-armed'] &&
    out.legs['staypolicy-baseline'].tbDeaths === 1 && out.legs['staypolicy-armed'].tbFlees === 1,
    JSON.stringify(out.legs));
  check('analyzer-stay-join', out.legs['staypolicy-armed'].tbFired === 1 && out.legs['staypolicy-armed'].tbFiredFlees === 1 &&
    out.legs['staypolicy-armed'].stayTotals.exits === 1 && out.legs['staypolicy-baseline'].stayTotals.exits === 0,
    JSON.stringify({ armed: out.legs['staypolicy-armed'] }));
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();

async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 99241, mode: 'competent-staypolicy-proof', fullTelemetry: false });
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

  const tmp = '/tmp/staypolicy-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99241', OUTDIR: tmp });
  // Off/on neutrality (instrument must not move the run).
  execSync('node scripts/staypolicy-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', STAYPOLICY_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/staypolicy-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'staypolicy-s99241-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'staypolicy-s99241-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));
  // Variant-vs-baseline neutrality (no wave-4 fight exists in 10 days, so
  // the variant must be byte-identical in outcome to competent verbatim).
  execSync('node scripts/staypolicy-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-base', POLICY: 'baseline' }), stdio: 'pipe' });
  execSync('node scripts/staypolicy-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-armed', POLICY: 'staypolicy' }), stdio: 'pipe' });
  const pb = JSON.parse(fs.readFileSync(path.join(tmp, 'staypolicy-s99241-proof-base.json'), 'utf8'));
  const pa = JSON.parse(fs.readFileSync(path.join(tmp, 'staypolicy-s99241-proof-armed.json'), 'utf8'));
  check('neutrality-variant-baseline', pb.days === pa.days && pb.endReason === pa.endReason &&
    (pb.waveKillLog || []).length === (pa.waveKillLog || []).length &&
    pb.fights.length === pa.fights.length &&
    (pb.stayStats.triggerFires | 0) === 0 && (pa.stayStats.triggerFires | 0) === 0 &&
    pa.instrumentErrors.length === 0,
    'base=' + pb.days + '/' + pb.endReason + '/' + pb.fights.length +
    ' armed=' + pa.days + '/' + pa.endReason + '/' + pa.fights.length +
    ' errs=' + JSON.stringify(pa.instrumentErrors));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
