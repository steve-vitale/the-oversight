// test-pairoverlap-20261107.js — proof for the yield-the-blow
// wrapper (arm sim-pairoverlap-b). Fixture tests for the yield
// condition (one fixture per frozen condition, plus the cap), the
// wrapper's stats, source-level checks that the policy never calls
// the shared hostFeast verb itself and never reads the kill log,
// an old-code-fails control (the frozen feastdrive policy strikes
// the killing blow on the same fixture where the wrapper waits),
// and live legs via the driver in /tmp (structural invariants
// only, per the prereg): a neutrality leg (feastdrive vs
// pairoverlap on one seed — daily rows exact before the first yield
// day, first divergence >= first yield day) and an armed leg
// (0 instrument errors; yields fire in live sims; companion kills
// on yield days are reported, not gated — the proof asserts the
// mechanism ENGAGES, the pilot judges whether it CONVERTS). Exit
// non-zero on any failure. The live legs write nothing into the
// repo.
// Usage: node scripts/test-pairoverlap-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const REPO = path.join(__dirname, '..');
const PO = require(path.join(REPO, 'scripts', 'policies', 'competent-pairoverlap-b'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'competent-feastdrive-b'));
const COMP = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const ANALYZE = require(path.join(REPO, 'scripts', 'pairoverlap-analyze-20261107'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- fake-Game policy fixtures ----------
// The pairoverlap policy delegates to feastdrive.fight, which is the
// rally policy's fight, which delegates to competent.fight — looked
// up on the shared competent object at call time. The fixture phase
// stubs it there (restored afterwards) to observe delegation without
// running the real fight logic. The old-code control phase restores
// the real fight.
const realFight = COMP.competent.fight;
let baseCalls = 0;
let strikeCalls = [];
COMP.competent.fight = function (Game) {
  baseCalls++;
  try { if (Game && Game._strikeSpy) Game._strikeSpy('m0'); } catch (e) {}
  return false;
};

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
  const scholarHp = (opts.scholarHp == null) ? 100 : opts.scholarHp;
  const p = fighter('p', 'player', { hp: scholarHp, maxHp: 100, mx: 4, my: 4 });
  const fighters = [p].concat(allies, monsters);
  const waitCalls = [];
  const rallyCalls = [];
  const g = {
    data: { monsters: roster() },
    state: { scholar: { day: opts.day || 50, prog: {}, abilities: [] }, codex: {} },
    villagerId: 'alice',
    tbfight: { id: 1, fighters: fighters, round: 1, over: !!opts.over },
    tbIsPlayerTurn: function () { return opts.notPlayerTurn ? false : true; },
    tbFighter: function (k) { return fighters.find(function (f) { return f.key === k; }) || null; },
    tbPlayerRally: function () { rallyCalls.push(1); return !opts.rallyFalse; },
    tbPlayerWait: function () { waitCalls.push(1); return true; },
    tbPlayerStrike: function (k) { strikeCalls.push(k); return true; },
    tbAfterPlayerAction: function () { return true; },
    equippedWeapon: function () { return { range: 1 }; },
    _waitCalls: waitCalls, _rallyCalls: rallyCalls,
  };
  if (opts.poisonLog) {
    Object.defineProperty(g.state, 'waveKillLog', { get: function () { throw new Error('poisoned log read'); } });
  }
  return g;
}
function w4monster(key, mid, hp) {
  return fighter(key, 'monster', { monsterId: mid || 'w4a', mdef: { id: mid || 'w4a', wave: 4 },
    hp: (hp == null) ? 40 : hp, maxHp: 1000, mx: 5, my: 5 });
}
function w3monster(key) {
  return fighter(key, 'monster', { monsterId: 'w3a', mdef: { id: 'w3a', wave: 3 }, hp: 40, maxHp: 300, mx: 5, my: 5 });
}
function w1monster(key) {
  return fighter(key, 'monster', { monsterId: 'w1a', mdef: { id: 'w1a', wave: 1 }, hp: 20, maxHp: 60, mx: 5, my: 5 });
}
function ally(key) {
  return fighter(key, 'ally', { villagerId: 'vil_' + key, mx: 5, my: 4 });
}
// Drive the wrapper's fight twice on a fresh ctx: turn 1 delegates
// (rally), turn 2 is the first yield-eligible turn.
function twoTurns(g, ctx) {
  PO.pairoverlap.fight(g, ctx);
  return PO.pairoverlap.fight(g, ctx);
}

(function () {
  // 1. All seven conditions hold -> the scholar waits, base never runs.
  PO.resetPairoverlapStats();
  baseCalls = 0; strikeCalls = [];
  const g1 = fakeGame({ monsters: [w4monster('m0')], allies: [ally('a1')] });
  const ctx1 = {};
  twoTurns(g1, ctx1);
  const s1 = PO.pairoverlapStats();
  check('yield-fires-all-conditions', g1._waitCalls.length === 1 && g1._rallyCalls.length === 1 && baseCalls === 0 &&
    s1.yields === 1 && s1.yieldFights === 1 && s1.firstYieldDay === 50,
    'waits=' + g1._waitCalls.length + ' rally=' + g1._rallyCalls.length + ' base=' + baseCalls + ' yields=' + s1.yields);
  // 2. Monster at 51 HP (above the killing-blow proxy) -> delegates.
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const g2 = fakeGame({ monsters: [w4monster('m0', 'w4a', 51)], allies: [ally('a1')] });
  twoTurns(g2, {});
  check('hp51-delegates', g2._waitCalls.length === 0 && baseCalls === 1 &&
    PO.pairoverlapStats().yields === 0, 'waits=' + g2._waitCalls.length);
  // 3. Wave-3 monster at 40 HP -> delegates (pairs need wave 4+).
  // Turn 1 cannot rally (no w4+ monster), so both turns reach base.
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const g3 = fakeGame({ monsters: [w3monster('m0')], allies: [ally('a1')] });
  twoTurns(g3, {});
  check('wave3-delegates', g3._waitCalls.length === 0 && baseCalls === 2 &&
    PO.pairoverlapStats().yields === 0, 'base=' + baseCalls);
  // 4. No ally present -> delegates (turn 1 cannot rally either).
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const g4 = fakeGame({ monsters: [w4monster('m0')], allies: [] });
  twoTurns(g4, {});
  check('no-ally-delegates', g4._waitCalls.length === 0 && baseCalls === 2 &&
    PO.pairoverlapStats().yields === 0, 'base=' + baseCalls);
  // 5. Scholar at 40% HP -> delegates (hurt fighters fight or flee).
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const g5 = fakeGame({ monsters: [w4monster('m0')], allies: [ally('a1')], scholarHp: 40 });
  twoTurns(g5, {});
  check('hurt-scholar-delegates', g5._waitCalls.length === 0 && baseCalls === 1 &&
    PO.pairoverlapStats().yields === 0);
  // 6. Scholar out of strike range -> delegates (the next action is
  // a move, not the killing blow).
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const far = w4monster('m0', 'w4a', 40); far.mx = 7; far.my = 7;
  const g6 = fakeGame({ monsters: [far], allies: [ally('a1')] });
  twoTurns(g6, {});
  check('out-of-range-delegates', g6._waitCalls.length === 0 && baseCalls === 1 &&
    PO.pairoverlapStats().yields === 0);
  // 7. First turn of the fight -> delegates (the round-1 rally is
  // never intercepted, even for a pre-wounded beast).
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const g7 = fakeGame({ monsters: [w4monster('m0')], allies: [ally('a1')] });
  PO.pairoverlap.fight(g7, {});
  check('first-turn-delegates', g7._waitCalls.length === 0 && g7._rallyCalls.length === 1 &&
    PO.pairoverlapStats().yields === 0, 'rally=' + g7._rallyCalls.length);
  // 8. A weaker wave-1 monster is the strike target -> delegates
  // (the scholar's next blow is not the wave-4 kill).
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const g8 = fakeGame({ monsters: [w4monster('m0'), w1monster('m1')], allies: [ally('a1')] });
  twoTurns(g8, {});
  check('weakest-is-wave1-delegates', g8._waitCalls.length === 0 && baseCalls === 1 &&
    PO.pairoverlapStats().yields === 0);
  // 9. Cap: two yields on the same monster, then the cap binds —
  // the third and fourth turns delegate, and the cap is counted once.
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const g9 = fakeGame({ monsters: [w4monster('m0')], allies: [ally('a1')] });
  const ctx9 = {};
  PO.pairoverlap.fight(g9, ctx9); // turn 1: rally
  PO.pairoverlap.fight(g9, ctx9); // turn 2: yield 1
  PO.pairoverlap.fight(g9, ctx9); // turn 3: yield 2
  PO.pairoverlap.fight(g9, ctx9); // turn 4: cap -> delegate
  PO.pairoverlap.fight(g9, ctx9); // turn 5: cap -> delegate (counted once)
  const s9 = PO.pairoverlapStats();
  check('cap-binds-once', g9._waitCalls.length === 2 && s9.yields === 2 &&
    s9.yieldsCapped === 1 && baseCalls === 2,
    'waits=' + g9._waitCalls.length + ' yields=' + s9.yields + ' capped=' + s9.yieldsCapped + ' base=' + baseCalls);
  // 10. A dead ally does not count (fled ally likewise).
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const deadAlly = ally('a1'); deadAlly.alive = false;
  const g10 = fakeGame({ monsters: [w4monster('m0')], allies: [deadAlly] });
  twoTurns(g10, {});
  check('dead-ally-delegates', g10._waitCalls.length === 0 && PO.pairoverlapStats().yields === 0);
  // 11. The policy NEVER reads state.waveKillLog (poisoned getter).
  PO.resetPairoverlapStats();
  baseCalls = 0;
  const g11 = fakeGame({ monsters: [w4monster('m0')], allies: [ally('a1')], poisonLog: true });
  let threw = false;
  try { twoTurns(g11, {}); } catch (e) { threw = true; }
  check('never-reads-kill-log', threw === false && g11._waitCalls.length === 1,
    'threw=' + threw + ' waits=' + g11._waitCalls.length);
  // 12. Not the player's turn / fight over -> delegates, no wait.
  PO.resetPairoverlapStats();
  const g12 = fakeGame({ monsters: [w4monster('m0')], allies: [ally('a1')], notPlayerTurn: true });
  PO.pairoverlap.fight(g12, {});
  check('not-player-turn-delegates', g12._waitCalls.length === 0 &&
    PO.pairoverlapStats().yields === 0);
})();

// ---------- wrapper stats fixtures ----------
(function () {
  PO.resetPairoverlapStats();
  const s0 = PO.pairoverlapStats();
  check('postats-reset', s0.yields === 0 && s0.yieldFights === 0 && s0.yieldsCapped === 0 &&
    s0.firstYieldDay === null && s0.errors === 0 && Array.isArray(s0.events) && s0.events.length === 0,
    JSON.stringify(s0));
  s0.yields = 99;
  check('postats-copy', PO.pairoverlapStats().yields === 0, 'stats getter returns a copy');
  check('po-constants', PO.YIELD_HP === 50 && PO.YIELD_MIN_SCHOLAR_HP === 0.5 && PO.YIELD_CAP_PER_MONSTER === 2,
    'frozen gate constants moved');
})();

// ---------- source-level checks ----------
(function () {
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent-pairoverlap-b.js'), 'utf8');
  const code = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  check('policy-no-hostfeast-call', !/Game\.hostFeast\s*\(/.test(code), 'the wrapper must never call the shared verb itself');
  check('policy-no-killlog-read', code.indexOf('waveKillLog') === -1, 'waveKillLog appears in policy CODE (comments exempt)');
  check('policy-delegates-fight', code.indexOf('feastdrive.fight') !== -1, 'wrapper must delegate fight to the feastdrive layer');
  check('policy-waits-not-strikes', code.indexOf('tbPlayerWait') !== -1 && code.indexOf('tbPlayerStrike') === -1,
    'the wrapper holds with a wait; it never strikes itself');
  check('policy-composes-drive', code.indexOf("require('./competent-feastdrive-b')") !== -1 &&
    code.indexOf('Object.assign({}, feastdrive') !== -1, 'wrapper must compose onto the frozen drive file');
})();

// ---------- analyzer guardRows fixtures ----------
(function () {
  const rows = function (days) { return days.map(function (d) { return { day: d, pairDay: d >= 5, feasts: d >= 3 ? 1 : 0 }; }); };
  const g1 = ANALYZE.guardRows(rows([1, 2, 3, 4, 5, 6]), rows([1, 2, 3, 4, 5, 6]), 5);
  check('guard-identical', g1.pass === true && g1.firstDiffDay == null && g1.firstDiffDayOverall == null, JSON.stringify(g1));
  const g2 = ANALYZE.guardRows(rows([1, 2, 3, 4, 5, 6]), [{ day: 1, pairDay: false, feasts: 0 }, { day: 2, pairDay: false, feasts: 0 }, { day: 3, pairDay: false, feasts: 1 }, { day: 4, pairDay: false, feasts: 1 }, { day: 5, pairDay: true, feasts: 1 }, { day: 6, pairDay: true, feasts: 5 }], 5);
  check('guard-post-yield-divergence-ignored', g2.pass === true && g2.firstDiffDayOverall === 6, JSON.stringify(g2));
  const g3 = ANALYZE.guardRows(rows([1, 2, 3, 4, 5, 6]), [{ day: 1, pairDay: false, feasts: 0 }, { day: 2, pairDay: false, feasts: 0 }, { day: 3, pairDay: false, feasts: 1 }, { day: 4, pairDay: false, feasts: 9 }, { day: 5, pairDay: true, feasts: 1 }, { day: 6, pairDay: true, feasts: 1 }], 5);
  check('guard-pre-yield-divergence-caught', g3.pass === false && g3.firstDiffDay === 4 && g3.firstDiffDayOverall === 4 && /d4\.feasts/.test(g3.diffs[0] || ''), JSON.stringify(g3));
  const g4 = ANALYZE.guardRows(rows([1, 2, 3]), rows([1, 2, 3]), null);
  check('guard-no-yield-whole-run', g4.pass === true, JSON.stringify(g4));
  const g5 = ANALYZE.guardRows([], [], null);
  check('guard-empty-rows', g5.pass === true, JSON.stringify(g5));
  const g6 = ANALYZE.guardRows(rows([1, 2, 3, 4, 5]), [{ day: 1, pairDay: false, feasts: 0 }, { day: 2, pairDay: false, feasts: 0 }, { day: 3, pairDay: false, feasts: 1 }, { day: 4, pairDay: false, feasts: 1 }, { day: 5, pairDay: false, feasts: 1 }], 5);
  check('guard-yield-day-row-itself-may-differ', g6.pass === true && g6.firstDiffDayOverall === 5, JSON.stringify(g6));
})();

// ---------- old-code-fails control (real competent.fight) ----------
(function () {
  COMP.competent.fight = realFight; // restore the real base fight
  try {
    // OLD code on the yield fixture: turn 1 rallies, turn 2 strikes
    // the 40-HP wave-4 monster (the killing blow is the scholar's).
    // Fixture note: the control monster's maxHp is 100, not 1000 —
    // the real fight's start-of-fight assessment flees any fight
    // whose total monster max-HP exceeds 2.5x the scholar's max HP,
    // and the assessment (not the strike) is what this control is
    // not testing. HP 40 / max 100 keeps the killing-blow geometry
    // (weakest, in range, full-HP scholar) while staying winnable.
    strikeCalls = [];
    const go = fakeGame({ monsters: [w4monster('m0')], allies: [ally('a1')] });
    go.tbfight.fighters.find(function (f) { return f.key === 'm0'; }).maxHp = 100;
    go._strikeSpy = function (k) { strikeCalls.push(k); };
    const ctxo = {};
    FD.feastdrive.fight(go, ctxo);
    FD.feastdrive.fight(go, ctxo);
    check('old-code-strikes', strikeCalls.length >= 1 && go._waitCalls.length === 0,
      'strikes=' + JSON.stringify(strikeCalls) + ' waits=' + go._waitCalls.length);
    // NEW code on the identical fixture: turn 1 rallies, turn 2 waits.
    strikeCalls = [];
    const gn = fakeGame({ monsters: [w4monster('m0')], allies: [ally('a1')] });
    gn._strikeSpy = function (k) { strikeCalls.push(k); };
    PO.resetPairoverlapStats();
    const ctxn = {};
    PO.pairoverlap.fight(gn, ctxn);
    PO.pairoverlap.fight(gn, ctxn);
    check('new-code-waits', gn._waitCalls.length === 1 && strikeCalls.length === 0 &&
      PO.pairoverlapStats().yields === 1,
      'waits=' + gn._waitCalls.length + ' strikes=' + JSON.stringify(strikeCalls));
  } finally {
    COMP.competent.fight = function () { baseCalls++; return false; };
  }
})();

// ---------- live legs via the driver (in /tmp) ----------
async function liveLegs() {
  const tmpBase = '/tmp/pairoverlap-proof-baseline';
  const tmpArmed = '/tmp/pairoverlap-proof-armed';
  const tmpArmed4 = '/tmp/pairoverlap-proof-armed4';
  const tmpArmed6 = '/tmp/pairoverlap-proof-armed6';
  [tmpBase, tmpArmed, tmpArmed4, tmpArmed6].forEach(function (d) { try { cp.execSync('rm -rf ' + d); } catch (e) {} });
  function runDriver(outdir, run, policy, seeds) {
    const env = Object.assign({}, process.env, { DAYS: '150', SEEDS: seeds, RUN: run, POLICY: policy, OUTDIR: outdir });
    cp.execSync('node scripts/pairoverlap-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 900000 });
  }
  // Neutrality leg: 53001 feastdrive vs pairoverlap — daily rows
  // exact before the first yield day (whole run if no yield).
  try {
    runDriver(tmpBase, 'pairoverlap-proof-baseline', 'feastdrive', '53001');
    runDriver(tmpArmed, 'pairoverlap-proof-armed', 'pairoverlap', '53001');
  } catch (e) {
    check('live-neutrality-runs', false, 'driver failed: ' + String((e && e.stdout) || (e && e.message) || e).slice(0, 400));
  }
  try {
    const b = JSON.parse(fs.readFileSync(tmpBase + '/pairoverlap-s53001-pairoverlap-proof-baseline.json', 'utf8'));
    const a = JSON.parse(fs.readFileSync(tmpArmed + '/pairoverlap-s53001-pairoverlap-proof-armed.json', 'utf8'));
    check('live-neutrality-runs', b.days > 0 && a.days > 0 && (b.instrumentErrors || []).length === 0 &&
      (a.instrumentErrors || []).length === 0,
      'days=' + b.days + '/' + a.days + ' errs=' + JSON.stringify(b.instrumentErrors) + '/' + JSON.stringify(a.instrumentErrors));
    const aFirstYield = (a.pairoverlapStats || {}).firstYieldDay;
    const g = ANALYZE.guardRows(b.daily || [], a.daily || [], aFirstYield);
    const overallOk = (g.firstDiffDayOverall == null) || (aFirstYield == null) ||
      ((g.firstDiffDayOverall | 0) >= (aFirstYield | 0));
    check('live-neutrality-pre-yield-exact', g.pass === true && overallOk,
      'firstDiff=' + g.firstDiffDay + ' overall=' + g.firstDiffDayOverall + ' firstYield=' + aFirstYield +
      ' diffs=' + JSON.stringify(g.diffs));
    check('live-neutrality-same-anchor', b.anchorCommit === a.anchorCommit && b.anchorCommit !== 'unknown',
      'anchors ' + b.anchorCommit + ' / ' + a.anchorCommit);
    console.log('NEUTRALITY 53001: firstYieldDay=' + aFirstYield + ' yields=' +
      ((a.pairoverlapStats || {}).yields | 0) + ' pairDays=' +
      (a.daily || []).filter(function (d) { return d.pairDay; }).length + ' (baseline ' +
      (b.daily || []).filter(function (d) { return d.pairDay; }).length + ')');
  } catch (e) {
    check('live-neutrality-reads', false, 'neutrality corpus unreadable: ' + String((e && e.message) || e).slice(0, 200));
  }
  // Armed leg: 53004 + 53006 pairoverlap — 0 instrument errors and
  // the yield FIRES in live sims (the mechanism engages). Companion
  // kills on yield days are reported, not gated: the proof asserts
  // engagement, the pilot judges conversion.
  let totalYields = 0, totalConv = 0;
  for (const seed of [53004, 53006]) {
    const dir = (seed === 53004) ? tmpArmed4 : tmpArmed6;
    try {
      runDriver(dir, 'pairoverlap-proof-armed' + seed, 'pairoverlap', String(seed));
    } catch (e) {
      check('live-armed-runs-' + seed, false, 'driver failed: ' + String((e && e.stdout) || (e && e.message) || e).slice(0, 400));
      continue;
    }
    try {
      const a = JSON.parse(fs.readFileSync(dir + '/pairoverlap-s' + seed + '-pairoverlap-proof-armed' + seed + '.json', 'utf8'));
      const po = a.pairoverlapStats || {};
      const y = (po.yields | 0);
      totalYields += y;
      const conv = ((a.waveKillLog || []).filter(function (e2) {
        return ((e2.w | 0) >= 4) && e2.via === 'companion' && (po.yieldDays || {})[(e2.d | 0)] != null;
      }).length);
      totalConv += conv;
      check('live-armed-runs-' + seed, a.days > 0 && (a.daily || []).length >= 40 && (a.instrumentErrors || []).length === 0,
        'days=' + a.days + ' snaps=' + (a.daily || []).length + ' errs=' + JSON.stringify(a.instrumentErrors));
      console.log('ARMED ' + seed + ': yields=' + y + ' yieldFights=' + (po.yieldFights | 0) +
        ' capped=' + (po.yieldsCapped | 0) + ' firstYield=' + po.firstYieldDay +
        ' companionKillsOnYieldDays=' + conv + ' pairDays=' +
        (a.daily || []).filter(function (d) { return d.pairDay; }).length);
    } catch (e) {
      check('live-armed-reads-' + seed, false, 'armed corpus unreadable: ' + String((e && e.message) || e).slice(0, 200));
    }
  }
  check('live-armed-yields-fire', totalYields > 0,
    'total yields across 53004+53006 = ' + totalYields + ' (mechanism must engage in live sims)');
  console.log('CONVERSIONS (reported, not gated): companion wave-4 kills on yield days = ' + totalConv);

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
