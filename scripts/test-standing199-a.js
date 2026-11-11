// test-standing199-a.js — proof for the standing-199 plateau read instrument
// (arm sim-standing199-a). Fixture tests for every trajectory class +
// hold-kind recomputation + decay/veteran-death derivation +
// reconciliation, a determinism leg, and a live harness smoke leg
// (1 seed, 30d, competent verbatim: the instrument runs, snapshots
// reconcile, 0 instrument errors). No repo writes. Zero src/js.
// Usage: node scripts/test-standing199-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'standing199-instrument-20261110'));
const ANALYZE = require(path.join(REPO, 'scripts', 'standing199-analyze-20261110'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// --- fixture builders -------------------------------------------------
function rd5(o) {
  return Object.assign({ wave: 5, ready: false, armored: 4, armed: 6, tricks: 5, veterans: 0, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }, short: ['veterans'] }, o || {});
}
function rd4(o) {
  return Object.assign({ wave: 4, ready: false, armored: 3, armed: 5, tricks: 3, veterans: 0, demand: { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 }, short: ['veterans'] }, o || {});
}
function snap(day, o) {
  const s = {
    day: day,
    standing: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    capped: 0, gated: 0, readiness4: rd4({ ready: true, short: [] }), readiness5: rd5(),
    veteranVids: [], peakWave: 0, ledger: { 3: 0, 4: 0, 5: 0 },
    feasts: { total: 0, qualifying: 0, subquality: 0 }, links: [], standingLine: 'Standing 0',
  };
  if (o) {
    if (o.standing) Object.assign(s.standing, o.standing);
    if ('capped' in o) s.capped = o.capped;
    if ('gated' in o) s.gated = o.gated;
    if (o.readiness5) s.readiness5 = Object.assign({}, s.readiness5, o.readiness5);
    if (o.readiness4) s.readiness4 = Object.assign({}, s.readiness4, o.readiness4);
    if (o.veteranVids) s.veteranVids = o.veteranVids;
    if ('peakWave' in o) s.peakWave = o.peakWave;
    if (o.ledger) s.ledger = o.ledger;
  }
  return s;
}
function seedData(seed, daily, extra) {
  return Object.assign({ seed: seed, days: daily.length, endReason: 'horizon', won: false, scaleRank: 'regional', maxWave: 4, unlockedWave: 4, memorial: [], daily: daily, instrumentErrors: [] }, extra || {});
}

// --- E1: holdKind recomputation ---------------------------------------
check('E1a cap: raw>=200 capped<200 -> cap',
  INST.holdKind(snap(10, { standing: { total: 240, war: 150, diplomacy: 0, plenty: 90 }, capped: 150, gated: 199 })) === 'cap');
check('E1b defer5: capped>=200 rd5 not ready -> defer5',
  INST.holdKind(snap(10, { standing: { total: 250, war: 200, diplomacy: 0, plenty: 50 }, capped: 200, gated: 199 })) === 'defer5');
check('E1c defer4: raw>=100 rd4 not ready peak<4 -> defer4',
  INST.holdKind(snap(10, { standing: { total: 150, war: 150, diplomacy: 0, plenty: 0 }, capped: 150, gated: 99, readiness4: rd4({}) })) === 'defer4');
check('E1d none: raw<100 -> none',
  INST.holdKind(snap(10, { standing: { total: 50, war: 50, diplomacy: 0, plenty: 0 }, capped: 50, gated: 50 })) === 'none');
check('E1e peak-gated: peak>=5 kills the hold',
  INST.holdKind(snap(10, { standing: { total: 250, war: 200, diplomacy: 0, plenty: 50 }, capped: 200, gated: 250, peakWave: 5 })) === 'none');
check('E1f cap and defer5 mutually exclusive on one day',
  INST.holdKind(snap(10, { standing: { total: 240, war: 150, diplomacy: 0, plenty: 90 }, capped: 150, gated: 199 })) !== 'defer5');

// --- E2: classification fixtures --------------------------------------
(function () {
  // defer5: pins at 199, veterans the only short bar, never releases.
  const daily = [];
  for (let d = 1; d <= 20; d++) {
    daily.push(snap(d, { standing: { total: 210, war: 150, diplomacy: 0, plenty: 60 }, capped: 210, gated: d < 5 ? 150 : 199 }));
  }
  const r = ANALYZE.analyzeSeed(seedData(1, daily));
  check('E2a defer5 class', r.class === 'defer5', 'got ' + r.class);
  check('E2b defer5 binding names veterans', /veterans/.test(r.binding), r.binding);
  check('E2c defer5 pin days', r.pin199Days === 16, 'got ' + r.pin199Days);
  check('E2d defer5 first-pin bars', eq(r.firstPinBars, { armored: 4, armed: 6, tricks: 5, veterans: 0 }), JSON.stringify(r.firstPinBars));
})();
(function () {
  // plenty-cap: raw 240, capped 150 (plenty 140, cap 100) -> 199 via cap.
  const daily = [];
  for (let d = 1; d <= 10; d++) {
    daily.push(snap(d, { standing: { total: 240, war: 100, diplomacy: 0, plenty: 140 }, capped: 150, gated: 199 }));
  }
  const r = ANALYZE.analyzeSeed(seedData(2, daily));
  check('E2e plenty-cap class', r.class === 'plenty-cap', 'got ' + r.class);
  check('E2f plenty-cap first-pin kind', r.firstPin199Kind === 'cap', 'got ' + r.firstPin199Kind);
})();
(function () {
  // mixed-199: cap days then defer5 days (plenty falls, war rises).
  const daily = [];
  for (let d = 1; d <= 5; d++) daily.push(snap(d, { standing: { total: 240, war: 100, diplomacy: 0, plenty: 140 }, capped: 150, gated: 199 }));
  for (let d = 6; d <= 10; d++) daily.push(snap(d, { standing: { total: 250, war: 200, diplomacy: 0, plenty: 50 }, capped: 200, gated: 199 }));
  const r = ANALYZE.analyzeSeed(seedData(3, daily));
  check('E2g mixed-199 class', r.class === 'mixed-199', 'got ' + r.class);
  check('E2h mixed-199 day split', r.capDays === 5 && r.defer5Days === 5, 'cap ' + r.capDays + ' defer5 ' + r.defer5Days);
})();
(function () {
  // released: pins at 199, then rd5 ready, gated 220, peakWave 5.
  const daily = [];
  for (let d = 1; d <= 5; d++) daily.push(snap(d, { standing: { total: 210, war: 150, diplomacy: 0, plenty: 60 }, capped: 210, gated: 199 }));
  for (let d = 6; d <= 10; d++) daily.push(snap(d, { standing: { total: 220, war: 200, diplomacy: 0, plenty: 20 }, capped: 220, gated: 220, peakWave: 5, readiness5: rd5({ ready: true, veterans: 2, short: [] }), veteranVids: ['vA', 'vB'] }));
  const r = ANALYZE.analyzeSeed(seedData(4, daily, { maxWave: 5, unlockedWave: 5 }));
  check('E2i released class', r.class === 'released', 'got ' + r.class);
  check('E2j released day', r.releaseDay === 6, 'got ' + r.releaseDay);
  check('E2k released still reports pin days', r.pin199Days === 5, 'got ' + r.pin199Days);
})();
(function () {
  // standing-short: peak raw 150, never pins.
  const daily = [];
  for (let d = 1; d <= 10; d++) daily.push(snap(d, { standing: { total: 150, war: 150, diplomacy: 0, plenty: 0 }, capped: 150, gated: 150, readiness4: rd4({ ready: true, short: [] }) }));
  const r = ANALYZE.analyzeSeed(seedData(5, daily));
  check('E2l standing-short class', r.class === 'standing-short', 'got ' + r.class);
  check('E2m standing-short binding names the split', /war 150/.test(r.binding), r.binding);
})();
(function () {
  // defer4-pin: pins at 99, never reaches 100+ gated.
  const daily = [];
  for (let d = 1; d <= 10; d++) daily.push(snap(d, { standing: { total: 125, war: 125, diplomacy: 0, plenty: 0 }, capped: 125, gated: 99 }));
  const r = ANALYZE.analyzeSeed(seedData(6, daily));
  check('E2n defer4-pin class', r.class === 'defer4-pin', 'got ' + r.class);
  check('E2o defer4-pin days', r.pin99Days === 10, 'got ' + r.pin99Days);
})();
(function () {
  // unclassified: inconsistent input (raw >= 200, gated jumps past 199,
  // peakWave stuck at 4) — the analyzer must flag it, not crash or force
  // a class.
  const daily = [];
  for (let d = 1; d <= 5; d++) daily.push(snap(d, { standing: { total: 150, war: 150, diplomacy: 0, plenty: 0 }, capped: 150, gated: 150, readiness4: rd4({ ready: true, short: [] }) }));
  for (let d = 6; d <= 10; d++) daily.push(snap(d, { standing: { total: 250, war: 200, diplomacy: 0, plenty: 50 }, capped: 250, gated: 250, peakWave: 4, readiness5: rd5({ ready: true, veterans: 2, short: [] }) }));
  const r = ANALYZE.analyzeSeed(seedData(7, daily));
  check('E2p unclassified on inconsistent input', r.class === 'unclassified', 'got ' + r.class);
})();

// --- E3: near-miss + veteran-death + decay derivation -------------------
(function () {
  const daily = [];
  // d1-3: 3/4 bars met, veterans 1 (one away). d4: veteran vA dies.
  for (let d = 1; d <= 3; d++) daily.push(snap(d, { standing: { total: 210, war: 150, diplomacy: 0, plenty: 60 }, capped: 210, gated: 199, readiness5: rd5({ veterans: 1, short: ['veterans'] }), veteranVids: ['vA'] }));
  daily.push(snap(4, { standing: { total: 210, war: 150, diplomacy: 0, plenty: 60 }, capped: 210, gated: 199, readiness5: rd5({ veterans: 0, short: ['veterans'] }), veteranVids: [] }));
  // d5-10: raw decays 210 -> 160 (war falls: the killer's ledger points go).
  // Armor also collapses there, so bars-met drops to 2 — the 3/4 window is
  // exactly d1-3.
  for (let d = 5; d <= 10; d++) daily.push(snap(d, { standing: { total: 160, war: 100, diplomacy: 0, plenty: 60 }, capped: 160, gated: 160, readiness5: rd5({ armored: 2, short: ['armor', 'veterans'] }) }));
  const r = ANALYZE.analyzeSeed(seedData(8, daily));
  check('E3a days with 3/4 bars', r.days3of4 === 4, 'got ' + r.days3of4); // d1-4: d4 is the death day, armor/armed/tricks still met
  check('E3b days one veteran away', r.daysVet1 === 3, 'got ' + r.daysVet1);
  check('E3c max bars met', r.maxBars5 === 3, 'got ' + r.maxBars5);
  check('E3d veteran death derived', r.veteranDeaths.length === 1 && r.veteranDeaths[0].vid === 'vA' && r.veteranDeaths[0].day === 4, JSON.stringify(r.veteranDeaths));
  check('E3e decay case found', !!r.decay && r.decay.drop === 50, JSON.stringify(r.decay));
  check('E3f decay attributed to war', !!r.decay && r.decay.warDelta === -50 && r.decay.plentyDelta === 0, JSON.stringify(r.decay));
})();
(function () {
  // Reconciliation: a snapshot whose parts do not sum must be flagged.
  const daily = [snap(1, { standing: { total: 999, war: 100, diplomacy: 0, plenty: 0 }, capped: 100, gated: 100 })];
  const r = ANALYZE.analyzeSeed(seedData(9, daily));
  check('E3g raw-sum mismatch flagged', r.reconcileErrors.length >= 1, JSON.stringify(r.reconcileErrors));
})();
(function () {
  // Determinism: same corpus object analyzed twice -> identical JSON.
  const daily = [snap(1, { standing: { total: 210, war: 150, diplomacy: 0, plenty: 60 }, capped: 210, gated: 199 })];
  const a = ANALYZE.analyzeSeed(seedData(10, daily));
  const b = ANALYZE.analyzeSeed(seedData(10, daily));
  check('E3h determinism', JSON.stringify(a) === JSON.stringify(b));
})();

// --- E4: live harness smoke (1 seed, 30d, competent verbatim) ---------
(async function () {
  try {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
    const { Game } = await loadGame({ seed: 170233, mode: 'competent-standing199-smoke', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    let lastSnapDay = -1;
    function gday(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        }
      },
    });
    await quietLog(async function () { await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    inst.snapshot();
    const t = inst.t;
    check('E4a smoke ran, snapshots present', t.daily.length >= 29, 'got ' + t.daily.length);
    check('E4b smoke 0 instrument errors', t.instrumentErrors.length === 0, JSON.stringify(t.instrumentErrors));
    let bad = 0;
    for (const s of t.daily) {
      if (!s.standing) { bad++; continue; }
      const sum = (s.standing.war | 0) + (s.standing.diplomacy | 0) + (s.standing.plenty | 0);
      if (sum !== (s.standing.total | 0)) bad++;
      if (s.capped != null) {
        const capSum = (s.standing.war | 0) + (s.standing.diplomacy | 0) + Math.min(s.standing.plenty | 0, 100);
        if (capSum !== (s.capped | 0)) bad++;
      }
      if ((s.gated | 0) === 199 && INST.holdKind(s) !== 'cap' && INST.holdKind(s) !== 'defer5') bad++;
      if ((s.gated | 0) === 99 && INST.holdKind(s) !== 'defer4') bad++;
    }
    check('E4c smoke reconciliation on every snapshot', bad === 0, bad + ' bad snapshots');
    check('E4d smoke readiness bars present', t.daily.every(function (s) { return s.readiness4 && s.readiness5; }));
    check('E4e smoke veteran-vid list consistent with rd5 veterans count', t.daily.every(function (s) {
      return s.veteranVids && s.readiness5 && s.veteranVids.length === (s.readiness5.veterans | 0);
    }));
  } catch (e) {
    fail++;
    console.log('FAIL E4 live smoke threw — ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join('\n') : String(e)));
  }
  console.log('---');
  console.log('standing199 proof: ' + pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
})();
