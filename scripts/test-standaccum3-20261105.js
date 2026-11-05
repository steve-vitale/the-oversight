// test-standaccum3-20261105.js — proof for arm sim-standaccum3-b.
// Fixtures (flat-20 rule, decomposition sums, verdict rules) + live
// harness smoke + determinism + off/on neutrality leg. Pure node, no
// src/js changes. Run: node scripts/test-standaccum3-20261105.js
// Exit 0 iff all PASS.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'standaccum3-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- Fixture helpers -------------------------------------------------
function snap(day, o) {
  const s = { day: day, raw: 0, gated: 0, capped: 0, peak: 0,
    war: 0, diplomacy: 0, plenty: 0, warPts: 0, w3pts: 0, w4pts: 0, w5pts: 0,
    links: 0, linksSeasoned: 0, linksRegionalDirect: 0, feasts: 0, feastLogLen: 0,
    defer4: { deferred: false, ready: false, short: [], raw: 0, threshold: 100, grandfathered: false },
    defer5: { deferred: false, ready: false, short: [], raw: 0, capped: 0, threshold: 200, grandfathered: false },
    readiness5: { wave: 5, ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: null, short: [] } };
  return Object.assign(s, o || {});
}
function row(seed, daily, fights, killLog, fallen) {
  return { seed: seed, run: 'standaccum3-pilot', days: daily.length ? daily[daily.length - 1].day : 0,
    endReason: 'village-lost', won: false, scaleRank: 'village', unlockedWave: 3, maxWave: 3,
    fights: fights || [], daily: daily, waveKillLog: killLog || [], fallen: fallen || [],
    wavesFaced: {}, instrumentErrors: [] };
}
function flatDaily(days, raw) {
  const out = [];
  for (let d = 1; d <= days; d++) out.push(snap(d, { raw: raw, gated: raw, capped: raw, plenty: raw, feasts: raw / 20, feastLogLen: raw / 20 }));
  return out;
}
function w2fights(n, startDay) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ day: startDay + i, channel: 'field', fighter: 'v1', mid: 'moderator', wave: 2, optsKeys: [], outcome: 'vKill' });
  return out;
}

// --- Fixture 1: canonical flat-20 (anchor shape) --------------------
(function () {
  const daily = flatDaily(68, 20);
  const fights = w2fights(16, 10).concat(w2fights(18, 30).map(function (f) { f.wave = 3; f.mid = 'hydra'; return f; }));
  const r = row(99145, daily, fights, [], []);
  const s = AN.analyzeSeed(r);
  check('flat20-canonical', s.flat20 === true && s.sameShape === true, { flat20: s.flat20, sameShape: s.sameShape, failed: s.failedClauses });
  check('flat20-endRaw-20', s.endRaw === 20 && s.endGated === 20, { endRaw: s.endRaw });
  check('flat20-w3-0-kills', s.w3kills === 0 && s.w3fights === 18, { w3kills: s.w3kills, w3fights: s.w3fights });
})();

// --- Fixture 2: clause A fails (standing rose) ----------------------
(function () {
  const daily = flatDaily(60, 20);
  daily[59] = snap(60, { raw: 120, gated: 99, capped: 120, war: 100, warPts: 4, w3pts: 4, plenty: 20, feasts: 1, feastLogLen: 1 });
  const s = AN.analyzeSeed(row(99191, daily, w2fights(20, 5), [], []));
  check('clauseA-fails', s.flat20 === false && s.failedClauses.join(' ').indexOf('A(') === 0, { failed: s.failedClauses });
})();

// --- Fixture 3: clause B fails (too few fights) ---------------------
(function () {
  const daily = flatDaily(40, 20);
  const s = AN.analyzeSeed(row(99192, daily, w2fights(5, 5), [], []));
  check('clauseB-fails', s.flat20 === false && s.failedClauses.some(function (c) { return c.indexOf('B(') === 0; }), { failed: s.failedClauses });
})();

// --- Fixture 4: clause C fails (standing moved in the window) -------
(function () {
  const daily = flatDaily(60, 20);
  for (let i = 50; i < 60; i++) daily[i] = snap(i + 1, { raw: 45, gated: 45, capped: 45, war: 25, warPts: 1, w3pts: 1, plenty: 20, feasts: 1, feastLogLen: 1 });
  const s = AN.analyzeSeed(row(99193, daily, w2fights(20, 5), [], []));
  check('clauseC-fails', s.flat20 === false && s.failedClauses.some(function (c) { return c.indexOf('C(') === 0; }), { flatBand: s.flatBand, failed: s.failedClauses });
})();

// --- Fixture 5: clause D fails (gated != raw: a hold binds) ---------
(function () {
  const daily = flatDaily(60, 20);
  daily[59] = snap(60, { raw: 20, gated: 19, capped: 20, plenty: 20, feasts: 1, feastLogLen: 1 });
  const s = AN.analyzeSeed(row(99194, daily, w2fights(20, 5), [], []));
  check('clauseD-fails', s.flat20 === false && s.failedClauses.some(function (c) { return c.indexOf('D(') === 0; }), { failed: s.failedClauses });
})();

// --- Fixture 6: flat-20 but DIFFERENT decomposition (plenty road) ---
(function () {
  const daily = [];
  for (let d = 1; d <= 60; d++) daily.push(snap(d, { raw: 20, gated: 20, capped: 20, war: 0, w3pts: 0, diplomacy: 0, plenty: 20, feasts: 1, feastLogLen: 1 }));
  // Same end shape as canonical... make it different: war 50 via w3 kills.
  const daily2 = [];
  for (let d = 1; d <= 60; d++) daily2.push(snap(d, { raw: 25, gated: 25, capped: 25, war: 25, warPts: 1, w3pts: 1, diplomacy: 0, plenty: 0, feasts: 0, feastLogLen: 0 }));
  const s = AN.analyzeSeed(row(99195, daily2, w2fights(20, 5), [{ d: 40, mid: 'hydra', w: 3, by: 'v1', via: 'wild', trick: null }], []));
  check('flat20-diff-decomp', s.flat20 === true && s.sameShape === false && s.endW3pts === 1, { flat20: s.flat20, sameShape: s.sameShape });
})();

// --- Fixture 7: verdict GO (anchor + one fresh same-shape flat) -----
(function () {
  const anchorDaily = flatDaily(68, 20);
  const anchorFights = w2fights(34, 5);
  const freshDaily = flatDaily(80, 20);
  const freshFights = w2fights(20, 55); // inside the final-50d window (days 31-80), so clause C can pass
  const otherDaily = [];
  for (let d = 1; d <= 90; d++) otherDaily.push(snap(d, { raw: 150, gated: 150, capped: 150, war: 150, warPts: 6, w3pts: 6, plenty: 0, feasts: 0, feastLogLen: 0 }));
  const rows = [
    row(99145, anchorDaily, anchorFights, [], []),
    row(99191, freshDaily, freshFights, [], []),
    row(99192, otherDaily, w2fights(20, 5), [], []),
    row(99193, otherDaily, w2fights(20, 5), [], []),
    row(99194, otherDaily, w2fights(20, 5), [], []),
    row(99195, otherDaily, w2fights(20, 5), [], []),
    row(99196, otherDaily, w2fights(20, 5), [], []),
    row(99197, otherDaily, w2fights(20, 5), [], []),
    row(99198, otherDaily, w2fights(20, 5), [], []),
  ];
  const v = AN.analyzeRows(rows);
  check('verdict-GO', v.verdict === 'DIAG-GO' && v.anchorReproduces === true && v.flatSameShapeSeeds.indexOf(99191) >= 0, { verdict: v.verdict });
})();

// --- Fixture 8: verdict NO (no flat, tracking everywhere) -----------
(function () {
  const anchorDaily = flatDaily(68, 20);
  const rising = [];
  for (let d = 1; d <= 90; d++) rising.push(snap(d, { raw: 150, gated: 150, capped: 150, war: 150, warPts: 6, w3pts: 6, plenty: 0, feasts: 0, feastLogLen: 0 }));
  const rows = [row(99145, anchorDaily, w2fights(34, 5), [], [])];
  for (let s2 = 99191; s2 <= 99198; s2++) rows.push(row(s2, rising, w2fights(20, 5), [], []));
  const v = AN.analyzeRows(rows);
  check('verdict-NO', v.verdict === 'DIAG-NO', { verdict: v.verdict });
})();

// --- Fixture 9: verdict UNDERPOWERED (thin activity floor) ----------
(function () {
  const anchorDaily = flatDaily(68, 20);
  const rows = [row(99145, anchorDaily, w2fights(34, 5), [], [])];
  for (let s2 = 99191; s2 <= 99198; s2++) rows.push(row(s2, flatDaily(40, 20), w2fights(5, 5), [], []));
  const v = AN.analyzeRows(rows);
  check('verdict-UNDER', v.verdict === 'UNDERPOWERED', { verdict: v.verdict, activityFloor: v.activityFloorCount });
})();

// --- Fixture 10: verdict INSUFFICIENT-DATA (>2 error seeds) --------
(function () {
  const rows = [row(99145, flatDaily(68, 20), w2fights(34, 5), [], [])];
  for (let s2 = 99191; s2 <= 99198; s2++) { const r = row(s2, flatDaily(40, 20), w2fights(20, 5), [], []); r.instrumentErrors = ['x']; rows.push(r); }
  const v = AN.analyzeRows(rows);
  check('verdict-INSUFF', v.verdict === 'INSUFFICIENT-DATA', { verdict: v.verdict });
})();

// --- Fixture 11: premise counted separately --------------------------
(function () {
  const daily = flatDaily(90, 150);
  const killLog = [{ d: 50, mid: 'm1', w: 4, by: 'k1', via: 'wild', trick: null }, { d: 55, mid: 'm2', w: 4, by: 'k2', via: 'wild', trick: null }];
  const s = AN.analyzeSeed(row(99191, daily, w2fights(20, 5), killLog, []));
  check('premise-L2', s.living2Days.length > 0 && s.maxLiving === 2, { living2Days: s.living2Days.length, maxLiving: s.maxLiving });
})();

// --- Fixture 12: peaks init 0 (true 0-peak reports 0) ---------------
(function () {
  const daily = [];
  for (let d = 1; d <= 30; d++) daily.push(snap(d, { raw: 0, gated: 0, capped: 0, war: 0, plenty: 0, feasts: 0, feastLogLen: 0 }));
  const s = AN.analyzeSeed(row(99191, daily, [], [], []));
  check('peak-zero-not-null', s.rawPeak === 0 && s.gatedPeak === 0, { rawPeak: s.rawPeak, gatedPeak: s.gatedPeak });
})();

// --- Fixture 13: anchor reproduces WITHOUT being flat-20 (the real
// 99145 shape: raw 0 for 35 days, one feast step to 20 inside the
// 50-day window, band 20) + one fresh flat-20 same-shape -> GO.
// This is the prereg's letter: anchor reproduction is the
// decomposition, not clause C. -------------------------------
(function () {
  const anchorDaily = [];
  for (let d = 1; d <= 68; d++) {
    const raw = d < 38 ? 0 : 20;
    anchorDaily.push(snap(d, { raw: raw, gated: raw, capped: raw, war: 0, w3pts: 0, diplomacy: 0, plenty: raw, feasts: raw / 20, feastLogLen: raw / 20 }));
  }
  const anchorFights = w2fights(16, 5).concat(w2fights(18, 30).map(function (f) { f.wave = 3; f.mid = 'hydra'; return f; }));
  const anchorRow = row(99145, anchorDaily, anchorFights, [], []);
  const a = AN.analyzeSeed(anchorRow);
  check('anchor-step-not-flat20', a.flat20 === false && a.sameShape === true && a.endRaw === 20, { flat20: a.flat20, failed: a.failedClauses });
  const freshDaily = flatDaily(41, 0);
  const rows = [anchorRow, row(99196, freshDaily, w2fights(26, 5), [], [])];
  for (let s2 = 99191; s2 <= 99195; s2++) rows.push(row(s2, flatDaily(60, 20), w2fights(20, 5), [], []));
  rows.push(row(99197, flatDaily(60, 20), w2fights(20, 5), [], []));
  rows.push(row(99198, flatDaily(60, 20), w2fights(20, 5), [], []));
  const v = AN.analyzeRows(rows);
  check('verdict-GO-anchor-step', v.verdict === 'DIAG-GO' && v.anchorReproduces === true, { verdict: v.verdict, anchorReproduces: v.anchorReproduces });
})();

// --- Live legs -------------------------------------------------------
async function live() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const INST = require(path.join(REPO, 'scripts', 'standaccum3-instrument-20261105'));

  function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
  async function run30(seed, useInst) {
    const { Game } = await loadGame({ seed: seed, mode: 'competent-standaccum3-test', fullTelemetry: false });
    await setupGame(Game);
    let inst = null;
    if (useInst) inst = INST.install(Game);
    const t = inst ? inst.t : { fights: [], daily: [], instrumentErrors: [] };
    let lastSnapDay = -1;
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally {
          try { const d = gday(Game); if (inst && d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); } } catch (e) {}
        }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    if (inst) { try { inst.snapshot(); } catch (e) {} }
    let fin = null;
    if (inst) { try { fin = inst.finalize(); } catch (e) {} }
    const out = {
      days: result.days, endReason: result.endReason, maxWave: result.maxWaveUnlocked || 1,
      snapshots: t.daily.length, errors: t.instrumentErrors.length,
      lastSnap: t.daily.length ? t.daily[t.daily.length - 1] : null,
      fights: t.fights.length,
      w3pts: fin ? fin.w3pts : null,
      killLogLen: fin ? (fin.waveKillLog || []).length : (((Game.state || {}).waveKillLog) || []).length,
    };
    if (inst) { try { inst.uninstall(); } catch (e) {} }
    return out;
  }

  // Live smoke: instrument snapshots carry the decomposition and it sums.
  const a = await run30(99191, true);
  check('live-smoke-runs', a.days > 0 && a.snapshots > 0 && a.errors === 0, { days: a.days, snapshots: a.snapshots, errors: a.errors });
  const ls = a.lastSnap || {};
  check('live-decomp-sums', ls.raw != null && ls.war != null && (ls.war + ls.diplomacy + ls.plenty) === ls.raw, { raw: ls.raw, war: ls.war, diplomacy: ls.diplomacy, plenty: ls.plenty });
  check('live-gated-eq-raw-below-100', ls.raw == null || ls.raw >= 100 || (ls.peak | 0) > 0 || ls.gated === ls.raw, { raw: ls.raw, gated: ls.gated, peak: ls.peak });
  check('live-capped-formula', ls.raw == null || ls.capped === ((ls.war | 0) + (ls.diplomacy | 0) + Math.min(ls.plenty | 0, 100)), { capped: ls.capped, war: ls.war, diplomacy: ls.diplomacy, plenty: ls.plenty });
  check('live-decomp-fields', ls.w3pts != null && ls.perType3 != null && ls.linksTotal != null && ls.feastQualityHist != null && ls.defer4 != null && ls.defer5 != null, { keys: Object.keys(ls).filter(function (k) { return k.indexOf('w3') === 0 || k.indexOf('link') === 0 || k.indexOf('defer') === 0; }) });

  // Determinism: same seed twice, same summary.
  const b = await run30(99191, true);
  check('live-determinism', a.days === b.days && a.endReason === b.endReason && a.maxWave === b.maxWave &&
    a.snapshots === b.snapshots && a.fights === b.fights &&
    ((a.lastSnap || {}).raw === (b.lastSnap || {}).raw) && ((a.lastSnap || {}).gated === (b.lastSnap || {}).gated),
    { a: { days: a.days, fights: a.fights, raw: (a.lastSnap || {}).raw }, b: { days: b.days, fights: b.fights, raw: (b.lastSnap || {}).raw } });

  // Off/on neutrality: instrument-off run does not change the trajectory.
  const c = await run30(99191, false);
  check('live-neutrality', a.days === c.days && a.endReason === c.endReason && a.maxWave === c.maxWave && a.killLogLen === c.killLogLen,
    { on: { days: a.days, end: a.endReason, maxWave: a.maxWave, kills: a.killLogLen }, off: { days: c.days, end: c.endReason, maxWave: c.maxWave, kills: c.killLogLen } });

  console.log('RESULT ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

live().catch(function (e) { console.error(e.stack); process.exit(1); });
