// test-bankkiller-20261105.js — proof for the rally-the-line policy,
// instrument, and analyzer (arm sim-bankkiller-b). Fixture tests + staged
// live rally + live harness smoke + determinism + off/on neutrality legs
// (driver subprocesses into /tmp, never into evidence/). Exit non-zero on
// any failure.
// Usage: node scripts/test-bankkiller-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'bankkiller-analyze-20261105'));
const KD = require(path.join(REPO, 'scripts', 'killerdeath-analyze-20261105'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const COMP = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- fake-Game policy fixtures ----------
// The rally policy delegates to competent.fight, looked up on the shared
// competent object at call time — so the fixtures stub it there (restored
// afterwards) to observe delegation without running the real fight logic.
const realFight = COMP.competent.fight;
let baseCalls = 0;
COMP.competent.fight = function () { baseCalls++; return false; };

function roster() {
  return [
    { id: 'w4a', wave: 4 }, { id: 'w4b', wave: 4 }, { id: 'w5a', wave: 5 },
    { id: 'w3a', wave: 3 }, { id: 'w1a', wave: 1 },
  ];
}
function fighter(key, kind, opts) {
  return Object.assign({ key: key, kind: kind, alive: true, fled: false,
    hp: 100, maxHp: 100, mx: 4, my: 4 }, opts || {});
}
function fakeGame(opts) {
  opts = opts || {};
  const monsters = opts.monsters || [];
  const allies = opts.allies || [];
  const p = fighter('p', 'player', { hp: 100, maxHp: 100, mx: 4, my: 4 });
  const fighters = [p].concat(allies, monsters);
  const rallyCalls = [];
  const g = {
    data: { monsters: roster() },
    state: { scholar: { day: opts.day || 50 } },
    villagerId: 'alice',
    tbfight: { id: 1, fighters: fighters, round: 1, over: false },
    tbIsPlayerTurn: function () { return true; },
    tbFighter: function (k) { return fighters.find(function (f) { return f.key === k; }) || null; },
    tbPlayerRally: function () {
      rallyCalls.push(1);
      if (opts.rallyFalse) return false;
      const f = g.tbfight;
      f.rallyUsed = true;
      fighters.forEach(function (o) { if ((o.kind === 'ally' || o.kind === 'villager') && o.key !== 'p') o.rallied = 3; });
      return true;
    },
    _rallyCalls: rallyCalls,
  };
  if (opts.arena) g.state.arenaContest = true;
  if (opts.poisonLog) {
    Object.defineProperty(g.state, 'waveKillLog', { get: function () { throw new Error('poisoned log read'); } });
  }
  return g;
}
function w4monster(key, mid) {
  return fighter(key, 'monster', { monsterId: mid || 'w4a', mdef: { id: mid || 'w4a', wave: 4 }, hp: 1000, maxHp: 1000, mx: 5, my: 5 });
}
function ally(key) {
  return fighter(key, 'ally', { villagerId: 'vil_' + key, mx: 1, my: 1 });
}

(function () {
  // 1. waveOfMonster: known waves resolve, unknown ids are null (never w4+).
  check('wave-of-monster', RALLY.waveOfMonster({ data: { monsters: roster() } }, 'w4a') === 4 &&
    RALLY.waveOfMonster({ data: { monsters: roster() } }, 'w5a') === 5 &&
    RALLY.waveOfMonster({ data: { monsters: roster() } }, 'nope') === null);
  // 2. fightSides splits monsters / allies / unknown.
  const g2 = fakeGame({ monsters: [w4monster('m1')], allies: [ally('a1')] });
  const sides = RALLY.fightSides(g2);
  check('fight-sides', sides.w4plus.length === 1 && sides.allies.length === 1 && sides.unknown.length === 0,
    JSON.stringify({ w4: sides.w4plus.length, allies: sides.allies.length }));
  // 3. Rally fires on round 1 with a live w4+ monster + a living ally.
  baseCalls = 0;
  const g3 = fakeGame({ monsters: [w4monster('m1')], allies: [ally('a1')] });
  const ctx3 = {};
  const r3 = RALLY.rallyPolicy.fight(g3, ctx3);
  check('rally-fires-round1', r3 === true && g3._rallyCalls.length === 1 && baseCalls === 0 &&
    g3.tbfight.rallyUsed === true && ctx3.bkRallyFires === 1,
    'ret=' + r3 + ' calls=' + g3._rallyCalls.length + ' base=' + baseCalls);
  // 4. No ally -> delegates to base, no rally.
  baseCalls = 0;
  const g4 = fakeGame({ monsters: [w4monster('m1')], allies: [] });
  RALLY.rallyPolicy.fight(g4, {});
  check('no-ally-delegates', g4._rallyCalls.length === 0 && baseCalls === 1);
  // 5. Wave-3 only -> delegates, no rally.
  baseCalls = 0;
  const w3 = fighter('m1', 'monster', { monsterId: 'w3a', mdef: { id: 'w3a', wave: 3 }, hp: 100, maxHp: 100 });
  const g5 = fakeGame({ monsters: [w3], allies: [ally('a1')] });
  RALLY.rallyPolicy.fight(g5, {});
  check('wave3-delegates', g5._rallyCalls.length === 0 && baseCalls === 1);
  // 6. Second turn of the same fight -> no second rally, delegates.
  baseCalls = 0;
  const g6 = fakeGame({ monsters: [w4monster('m1')], allies: [ally('a1')] });
  const ctx6 = {};
  RALLY.rallyPolicy.fight(g6, ctx6);
  RALLY.rallyPolicy.fight(g6, ctx6);
  check('once-per-fight', g6._rallyCalls.length === 1 && baseCalls === 1 && ctx6.bkRallyFires === 1);
  // 7. Rally returns false -> falls through to base.
  baseCalls = 0;
  const g7 = fakeGame({ monsters: [w4monster('m1')], allies: [ally('a1')], rallyFalse: true });
  const ctx7 = {};
  RALLY.rallyPolicy.fight(g7, ctx7);
  check('rally-false-falls-through', g7._rallyCalls.length === 1 && baseCalls === 1 && ctx7.bkRallyFalse === 1);
  // 8. The policy NEVER reads state.waveKillLog (poisoned getter).
  baseCalls = 0;
  const g8 = fakeGame({ monsters: [w4monster('m1')], allies: [ally('a1')], poisonLog: true });
  let threw = false;
  try { RALLY.rallyPolicy.fight(g8, {}); } catch (e) { threw = true; }
  check('never-reads-kill-log', threw === false && g8._rallyCalls.length === 1, 'threw=' + threw);
  // 9. Sealed arena fight still rallies (rally is not a flee).
  const g9 = fakeGame({ monsters: [w4monster('m1')], allies: [ally('a1')], arena: true });
  RALLY.rallyPolicy.fight(g9, {});
  check('arena-still-rallies', g9._rallyCalls.length === 1);
  // 10. Wave-5 monster rallies (w4+ scope).
  const w5 = fighter('m1', 'monster', { monsterId: 'w5a', mdef: { id: 'w5a', wave: 5 }, hp: 1500, maxHp: 1500 });
  const g10 = fakeGame({ monsters: [w5], allies: [ally('a1')] });
  RALLY.rallyPolicy.fight(g10, {});
  check('wave5-rallies', g10._rallyCalls.length === 1);
  // 11. Unknown-wave monster never counts as wave 4+.
  const unk = fighter('m1', 'monster', { monsterId: 'mystery', mdef: {}, hp: 100, maxHp: 100 });
  const g11 = fakeGame({ monsters: [unk], allies: [ally('a1')] });
  baseCalls = 0;
  RALLY.rallyPolicy.fight(g11, {});
  check('unknown-wave-delegates', g11._rallyCalls.length === 0 && baseCalls === 1);
  // 12. Module stats reset/accumulate per seed (driver contract).
  RALLY.resetBankkillerStats();
  const st0 = RALLY.bankkillerStats();
  const g12 = fakeGame({ monsters: [w4monster('m1')], allies: [ally('a1')] });
  RALLY.rallyPolicy.fight(g12, {});
  const st1 = RALLY.bankkillerStats();
  RALLY.resetBankkillerStats();
  const st2 = RALLY.bankkillerStats();
  check('module-stats-contract', st0.rallyFires === 0 && st1.rallyFires === 1 && st1.w4plusFights === 1 &&
    st1.alliesPresentFights === 1 && st2.rallyFires === 0,
    JSON.stringify({ st0: st0.rallyFires, st1: st1.rallyFires, st2: st2.rallyFires }));
})();
COMP.competent.fight = realFight;

// ---------- analyzer fixtures ----------
function row(seed, opts) {
  const r = {
    seed: seed, policy: 'baseline', run: 'fixture', days: 100, endReason: 'horizon', won: false, fights: [],
    daily: [{ day: 1, gated: 0, raw: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [],
    killsLive: [], scholarDeaths: [], killerTrack: [], rallyCalls: [],
    bankkillerStats: { w4plusFights: 0, alliesPresentFights: 0, rallyFires: 0, rallyOk: 0, rallyFalse: 0, rallyErrors: 0, events: [] },
    deadMap: {}, scaleRank: 'village', unlockedWave: 1, maxWave: 1,
  };
  return Object.assign(r, opts || {});
}
function kill(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via || 'player', trick: null }; }
function liveKill(d, mid, w, by) {
  return { day: d, mid: mid, wave: w, by: by, via: 'player', scholarAtKill: by, scholarChannel: true };
}
function mkLeg(policy, productionSeeds, fires, killRate) {
  // 8 synthetic rows: `productionSeeds` of them carry >= 2 killers ever;
  // each row carries 50 w4 fights and enough kills to hit the requested
  // kill rate (kills alternate alice/bob on production rows, so a prod
  // row with >= 2 kills has 2 killers ever; a non-prod row's kills all
  // credit alice). `fires` rally calls on the armed leg.
  const rows = [];
  for (let i = 0; i < 8; i++) {
    const prod = i < productionSeeds;
    const fights = [];
    for (let f = 0; f < 50; f++) fights.push({ day: 50 + f, channel: f < 25 ? 'player-tb' : 'field', mid: 'w4a', wave: 4 });
    const nkills = Math.round(50 * killRate);
    const log = [];
    const live = [];
    for (let k = 0; k < nkills; k++) {
      const by = prod ? (k % 2 === 0 ? 'alice' : 'bob') : 'alice';
      log.push(kill(60 + k, 'w4a', 4, by));
      live.push(liveKill(60 + k, 'w4a', 4, by));
    }
    const calls = [];
    for (let c = 0; c < fires; c++) calls.push({ day: 55 + c, round: 1, allies: 1, w4monsters: 1, w4mids: ['w4a'], result: true });
    rows.push(row(98811 + i, {
      policy: policy,
      fights: fights, waveKillLog: log, killsLive: live,
      rallyCalls: policy === 'rally' ? calls : [],
      bankkillerStats: { w4plusFights: 50, alliesPresentFights: 40, rallyFires: policy === 'rally' ? fires : 0, rallyOk: policy === 'rally' ? fires : 0, rallyFalse: 0, rallyErrors: 0, events: [] },
      daily: [{ day: 100, gated: 150, raw: 180, readiness5: { veterans: prod ? 1 : 0 } }],
    }));
  }
  return rows;
}
(function () {
  // 13. THIN: armed fires < 8 in total across the leg (boundary: 1 fire).
  const thinRows = mkLeg('rally', 2, 1, 0.1);
  thinRows.slice(1).forEach(function (r) { r.bankkillerStats.rallyFires = 0; r.bankkillerStats.rallyOk = 0; r.rallyCalls = []; });
  const vThin = AN.verdictFor(mkLeg('baseline', 0, 0, 0.1), thinRows);
  check('verdict-thin', vThin.verdict === 'THIN', vThin.verdict + ' ' + vThin.reason);
  // 14. GO: production 2 vs 0, guards hold.
  const vGo = AN.verdictFor(mkLeg('baseline', 0, 0, 0.1), mkLeg('rally', 2, 2, 0.1));
  check('verdict-go', vGo.verdict === 'GO', vGo.verdict + ' ' + vGo.reason);
  // 15. NO-GO: primary missed (armed production 1).
  const vMiss = AN.verdictFor(mkLeg('baseline', 0, 0, 0.1), mkLeg('rally', 1, 2, 0.1));
  check('verdict-nogo-primary', vMiss.verdict === 'NO-GO', vMiss.verdict);
  // 16. NO-GO: guard fails (kill rate halved: armed 0.05 vs baseline 0.1).
  const vGuard = AN.verdictFor(mkLeg('baseline', 0, 0, 0.1), mkLeg('rally', 2, 2, 0.04));
  check('verdict-nogo-guard', vGuard.verdict === 'NO-GO', vGuard.verdict + ' ' + vGuard.reason);
  // 17. Baseline nonzero needs +2: baseline 1, armed 2 -> NO-GO; armed 3 -> GO.
  const vPlus1 = AN.verdictFor(mkLeg('baseline', 1, 0, 0.1), mkLeg('rally', 2, 2, 0.1));
  const vPlus2 = AN.verdictFor(mkLeg('baseline', 1, 0, 0.1), mkLeg('rally', 3, 2, 0.1));
  check('verdict-plus2-rule', vPlus1.verdict === 'NO-GO' && vPlus2.verdict === 'GO',
    vPlus1.verdict + '/' + vPlus2.verdict);
  // 18. TB survival + post-blood splits on a synthetic row.
  const extra = AN.perSeedExtra(row(98811, {
    fights: [
      { day: 50, channel: 'player-tb', mid: 'w4a', wave: 4 },
      { day: 60, channel: 'player-tb', mid: 'w4a', wave: 4 },
      { day: 70, channel: 'field', mid: 'w4a', wave: 4 },
    ],
    waveKillLog: [kill(55, 'w4a', 4, 'alice'), kill(65, 'w4a', 4, 'bob')],
    killsLive: [liveKill(55, 'w4a', 4, 'alice'), liveKill(65, 'w4a', 4, 'bob')],
    scholarDeaths: [{ day: 60, scholarId: 'alice', causeArg: 'injuries', atHaven: true, inCombat: true, pendingEncounter: false }],
  }));
  check('tb-survival-split', extra.tbFights === 2 && extra.tbDeaths === 1 && Math.abs(extra.tbSurvival - 0.5) < 1e-9 &&
    extra.firstBloodDay === 55 && extra.postBloodFights === 2 && extra.postBloodKills === 1,
    JSON.stringify({ tb: extra.tbFights + '/' + extra.tbDeaths, first: extra.firstBloodDay, post: extra.postBloodFights + '/' + extra.postBloodKills }));
  // 19. Rally-mismatch flag: stats vs instrument calls disagree.
  const mm = AN.perSeedExtra(row(98811, {
    rallyCalls: [{ day: 55, round: 1, allies: 1, w4monsters: 1, w4mids: ['w4a'], result: true }],
    bankkillerStats: { w4plusFights: 1, alliesPresentFights: 1, rallyFires: 2, rallyOk: 2, rallyFalse: 0, rallyErrors: 0, events: [] },
  }));
  check('rally-mismatch-flag', mm.rallyMismatch === true, 'mismatch=' + mm.rallyMismatch);
})();

async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const INST = require(path.join(REPO, 'scripts', 'bankkiller-instrument-20261105'));
  const RALLYMOD = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));

  // 20. Live harness smoke: 5 days, rally policy, instrument on, 0 errors.
  const { Game } = await loadGame({ seed: 98811, mode: 'competent-bankkiller-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let last = -1;
  const wrapped = Object.assign({}, RALLYMOD.rallyPolicy, {
    daily: function (Gm, ctx) {
      try { return RALLYMOD.rallyPolicy.daily(Gm, ctx); } finally {
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
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 &&
    Array.isArray(inst.t.rallyCalls) && Array.isArray(fin.waveKillLog),
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));

  // 21. Staged live rally: a real wave-4 monster + a real ally in a real
  // TB fight — the policy's fight hook calls the real tbPlayerRally and
  // the engine marks the allies rallied (turn cascade stubbed, as in the
  // blitz test's rally isolation).
  const w4def = (Game.data.monsters || []).find(function (m) { return m && (m.wave | 0) === 4; });
  check('staged-setup-w4def', !!w4def, 'no wave-4 def in roster');
  if (w4def) {
    const realAfter = Game.tbAfterPlayerAction;
    Game.tbAfterPlayerAction = function () {};
    try {
      const p = { key: 'p', kind: 'player', name: 'You', hp: 200, maxHp: 200, mx: 4, my: 4, alive: true, fled: false, speed: 3, moveLeft: 3, acted: false };
      const a1 = { key: 'a_1', kind: 'ally', villagerId: 'vil_a', name: 'Ally One', hp: 100, maxHp: 100, speed: 3, mx: 1, my: 1, alive: true, fled: false, ai: 'brave', moveLeft: 3, acted: false };
      const m1 = { key: 'm1', kind: 'monster', monsterId: w4def.id, mdef: w4def, name: w4def.id, hp: 1000, maxHp: 1000, mx: 5, my: 4, alive: true, fled: false, speed: 2, moveLeft: 2, acted: false };
      Game.tbfight = { id: 99, fighters: [p, a1, m1], order: ['p', 'a_1', 'm1'], turnIdx: 0, round: 1, over: false };
      Game.tbFighter = function (k) { return Game.tbfight.fighters.find(function (f) { return f.key === k; }) || null; };
      Game.tbGridMax = function () { return 8; };
      const inst2 = INST.install(Game);
      const ctx = {};
      const ret = RALLYMOD.rallyPolicy.fight(Game, ctx);
      const calls = inst2.t.rallyCalls;
      inst2.uninstall();
      check('staged-rally-fires', ret === true && calls.length === 1 && calls[0].result === true &&
        calls[0].w4monsters === 1 && a1.rallied === 3 && Game.tbfight.rallyUsed === true,
        'ret=' + ret + ' calls=' + JSON.stringify(calls) + ' rallied=' + a1.rallied);
      Game.tbfight = null;
    } finally {
      Game.tbAfterPlayerAction = realAfter;
    }
  }

  // 22. Neutrality off/on: driver, rally policy, 10d, seed 98811, /tmp.
  const tmp = '/tmp/bankkiller-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '98811', OUTDIR: tmp, POLICY: 'rally' });
  execSync('node scripts/bankkiller-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', BANKKILLER_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/bankkiller-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'bankkiller-s98811-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'bankkiller-s98811-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));

  // 23. Neutrality rally-vs-baseline, 10d: no wave-4+ ally fight can occur
  // this early (wave 4 needs standing 100), so the trajectories must match
  // and rally fires must be 0.
  execSync('node scripts/bankkiller-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-base', POLICY: 'baseline' }), stdio: 'pipe' });
  const base = JSON.parse(fs.readFileSync(path.join(tmp, 'bankkiller-s98811-proof-base.json'), 'utf8'));
  check('neutrality-rally-vs-baseline', base.days === on.days && base.endReason === on.endReason &&
    (base.waveKillLog || []).length === (on.waveKillLog || []).length &&
    (on.bankkillerStats ? on.bankkillerStats.rallyFires : -1) === 0,
    'base=' + base.days + '/' + base.endReason + ' on=' + on.days + '/' + on.endReason +
    ' fires=' + JSON.stringify(on.bankkillerStats && on.bankkillerStats.rallyFires));

  // 24. Determinism: same driver leg twice, identical judged fields.
  execSync('node scripts/bankkiller-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-det1' }), stdio: 'pipe' });
  execSync('node scripts/bankkiller-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-det2' }), stdio: 'pipe' });
  const d1 = JSON.parse(fs.readFileSync(path.join(tmp, 'bankkiller-s98811-proof-det1.json'), 'utf8'));
  const d2 = JSON.parse(fs.readFileSync(path.join(tmp, 'bankkiller-s98811-proof-det2.json'), 'utf8'));
  check('determinism', d1.days === d2.days && d1.endReason === d2.endReason &&
    JSON.stringify(d1.waveKillLog) === JSON.stringify(d2.waveKillLog) &&
    JSON.stringify(d1.fights) === JSON.stringify(d2.fights),
    'd1=' + d1.days + ' d2=' + d2.days);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
