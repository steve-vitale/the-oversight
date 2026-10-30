#!/usr/bin/env node
// test-woodwarm-b.js — proof for sim-woodwarm-b
// (prereg: evidence/2026-10-30/sim-woodwarm-b-prereg.md,
// pinned base c795e7e2535921c21fd0c27d5cd180f34d0fb40a,
// committed BEFORE any judged leg). Proves, from the
// committed corpora plus a fresh determinism re-run, the
// GO verdict: 7 honestly-staged wood-short creek evenings
// on the 10-seed bank (all seed 15215, after warmth-fire
// log spends, no intervening haven-morning refill), the
// exact ON census, the guard census reproducing the
// ledger run's ON census exactly (15/4/11, wood 4 on all
// 15 — base has NOT drifted on this bank), the OFF guard
// (0 wood-short, 0 warmth acted), and byte-identical
// determinism. Measurement only: one policy-side wrapper
// + driver + analyzer, zero src/js changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const ev = (p) => path.join(root, 'evidence', '2026-10-30', p);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) failures++;
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const QUALIFIERS = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439];

// 0. Unit: warmDecision gate (act case + every miss reason).
// Warmth needs NO food: there is no rawCookable input at all.
const { warmDecision } = require('./policies/woodwarm');
const base = { outcome: 'travel-refused', bucket: 'creek', rescued: false, gameOver: false,
  combat: false, inTent: false, atHaven: false, branches: 0, wood: 4,
  nearFire: false, groundFound: true, ticksLeft: 200, fireCost: 48 };
check('warmDecision acts on the full trigger (no food input)', warmDecision(base).act === true);
check('warmDecision acts with 1 branch (log still spent, branches < 2)', warmDecision({ ...base, branches: 1 }).act === true);
check('warmDecision misses rescued', warmDecision({ ...base, rescued: true }).miss === 'rescued');
check('warmDecision misses at-haven', warmDecision({ ...base, atHaven: true }).miss === 'at-haven');
check('warmDecision misses in-tent', warmDecision({ ...base, inTent: true }).miss === 'in-tent');
check('warmDecision misses branches-available', warmDecision({ ...base, branches: 2 }).miss === 'branches-available');
check('warmDecision misses no-wood', warmDecision({ ...base, wood: 0 }).miss === 'no-wood');
check('warmDecision misses fire-near', warmDecision({ ...base, nearFire: true }).miss === 'fire-near');
check('warmDecision misses no-ground', warmDecision({ ...base, groundFound: false }).miss === 'no-ground');
check('warmDecision misses ticks-short (57 < 48+10)', warmDecision({ ...base, ticksLeft: 57 }).miss === 'ticks-short');
check('warmDecision acts at exactly fireCost+10 (58)', warmDecision({ ...base, ticksLeft: 58 }).act === true);
check('warmDecision misses non-creek', warmDecision({ ...base, bucket: 'other-refused' }).miss === 'not-creek-refused');
check('warmDecision misses game-over', warmDecision({ ...base, gameOver: true }).miss === 'game-over');
check('warmDecision misses combat', warmDecision({ ...base, combat: true }).miss === 'combat');

// Shared recomputation helper (walk-back staged linkage, prereg definition).
function recompute(corpusDir) {
  let creek = 0, still = 0, rescued = 0, wcErrs = 0, wwErrs = 0;
  let wood = [], stillSkip = {}, warmActed = 0, warmLogSpent = 0, warmFireFailed = 0, missReasons = {};
  let staged = [], spendNights = [], havenMornings = 0, pileMinAfterDay1 = null, pileFloorAfterDay1 = 0;
  for (const s of QUALIFIERS) {
    const j = read(ev(`${corpusDir}/woodwarm-b-nighttravel-s${s}.json`));
    wcErrs += j.woodcarryStore.errs || 0;
    wwErrs += (j.warmthStore || {}).errs || 0;
    const byDay = {};
    for (const e of j.evenings) byDay[e.loopDay] = e;
    for (const e of j.evenings) {
      const wc = e.woodcarry || {}, ww = e.warmth || null;
      if (ww) {
        if (ww.acted) { warmActed++; if (ww.fireLit && ww.logSpent >= 1) { warmLogSpent++; spendNights.push([s, e.loopDay]); } else if (!ww.fireLit) warmFireFailed++; }
        else if (ww.miss && ww.miss !== 'lever-off') missReasons[ww.miss] = (missReasons[ww.miss] || 0) + 1;
      }
      const cr = e.woodcarryCarry || null;
      if (cr && cr.skip && ['not-at-haven', 'game-over', 'combat', 'lever-off'].indexOf(cr.skip) < 0 && cr.pileBefore !== null && cr.pileBefore !== undefined) {
        havenMornings++;
        if (e.loopDay > 1) {
          if (pileMinAfterDay1 === null || cr.pileBefore < pileMinAfterDay1) pileMinAfterDay1 = cr.pileBefore;
          if (cr.skip === 'pile-floor') pileFloorAfterDay1++;
        }
      }
      if (wc.bucket !== 'creek') continue;
      creek++;
      wood.push((wc.classification || {}).woodPlayer);
      if (wc.rescued) rescued++;
      else { still++; const sk = (wc.bridge || {}).skip; stillSkip[sk] = (stillSkip[sk] || 0) + 1; }
      if (wc.bridge && wc.bridge.skip === 'wood-short') {
        for (let d = e.loopDay - 1; d >= 1; d--) {
          const pw = byDay[d] ? byDay[d].warmth : null;
          if (!(pw && pw.acted && pw.fireLit && pw.logSpent >= 1)) continue;
          let refill = null;
          for (let m = d + 1; m <= e.loopDay; m++) {
            const mc = byDay[m] ? byDay[m].woodcarryCarry : null;
            if (mc && mc.acted) { refill = m; break; }
          }
          if (refill === null) staged.push([s, d, e.loopDay, (wc.classification || {}).woodPlayer]);
          break;
        }
      }
    }
  }
  return { creek, still, rescued, wcErrs, wwErrs, wood, stillSkip, warmActed, warmLogSpent, warmFireFailed, missReasons, staged, spendNights, havenMornings, pileMinAfterDay1, pileFloorAfterDay1 };
}

// 1. ON census recomputation.
const on = recompute('sim-woodwarm-b-corpus-on');
check('ON bank is the 10 pre-registered qualifiers, errs 0 / 0', on.wcErrs === 0 && on.wwErrs === 0, 'wcErrs=' + on.wcErrs + ' wwErrs=' + on.wwErrs);
check('ON census: 21 creek / 11 still / 10 rescued', on.creek === 21 && on.still === 11 && on.rescued === 10, on.creek + '/' + on.still + '/' + on.rescued);
check('ON still skip breakdown kcal 3 / ticks 1 / wood-short 7', eq(on.stillSkip, { 'kcal-short': 3, 'ticks-short': 1, 'wood-short': 7 }), JSON.stringify(on.stillSkip));
check('ON wood values on creek evenings (4s, then the 15215 drain 3/3/2/1/0/0/0)', eq(on.wood, [4, 4, 4, 4, 4, 4, 4, 3, 3, 2, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4]), JSON.stringify(on.wood));
check('ON warmth acted 6, log-spent 4, fire-failed 2', on.warmActed === 6 && on.warmLogSpent === 4 && on.warmFireFailed === 2, 'acted=' + on.warmActed + ' spent=' + on.warmLogSpent + ' failed=' + on.warmFireFailed);
check('ON warmth spend nights are 15215 days 9/11/12/13 only', eq(on.spendNights, [[15215, 9], [15215, 11], [15215, 12], [15215, 13]]), JSON.stringify(on.spendNights));
check('ON warmth miss reasons: not-creek 279 / rescued 10 / branches 1 / ticks 1 / no-wood 3',
  eq(on.missReasons, { 'not-creek-refused': 279, rescued: 10, 'branches-available': 1, 'ticks-short': 1, 'no-wood': 3 }), JSON.stringify(on.missReasons));
check('STAGED wood-short evenings = 7 (>= 2 GO bar)', on.staged.length === 7, JSON.stringify(on.staged));
check('STAGED mapping is exactly 15215 (9->10, 9->11, 11->12, 12->13, 13->14, 13->15, 13->16)',
  eq(on.staged, [[15215, 9, 10, 3], [15215, 9, 11, 3], [15215, 11, 12, 2], [15215, 12, 13, 1], [15215, 13, 14, 0], [15215, 13, 15, 0], [15215, 13, 16, 0]]), JSON.stringify(on.staged));
check('ON pile ledger: min pile days 2+ is 8, pile-floor mornings after day 1 = 0', on.pileMinAfterDay1 === 8 && on.pileFloorAfterDay1 === 0, 'min=' + on.pileMinAfterDay1 + ' floor=' + on.pileFloorAfterDay1);

// 1b. Sense-read anchor: the first staged evening's tail carries the live-count line.
const j15215 = read(ev('sim-woodwarm-b-corpus-on/woodwarm-b-nighttravel-s15215.json'));
const day10 = j15215.evenings.find((e) => e.loopDay === 10);
check('sense anchor: day-10 tail carries "pack holds 3 logs, and a bridge needs 4."',
  !!day10 && (day10.eveningSayTail || []).some((l) => typeof l === 'string' && l.indexOf('the pack holds 3 logs, and a bridge needs 4.') >= 0));
check('sense anchor: day-10 warmth record is a failed fire (no spend), so the line is not self-staged',
  !!day10 && day10.warmth && day10.warmth.acted === true && day10.warmth.fireLit === false && day10.warmth.logSpent === 0);

// 2. GUARD census recomputation (= pinned-base census re-derivation).
const gd = recompute('sim-woodwarm-b-corpus-guard');
check('GUARD census reproduces ledger ON census exactly: 15 creek / 4 still / 11 rescued (NO base drift)', gd.creek === 15 && gd.still === 4 && gd.rescued === 11, gd.creek + '/' + gd.still + '/' + gd.rescued);
check('GUARD still skip breakdown kcal 3 / ticks 1 (ledger run, exact)', eq(gd.stillSkip, { 'kcal-short': 3, 'ticks-short': 1 }), JSON.stringify(gd.stillSkip));
check('GUARD woodPlayer = 4 on every creek evening', gd.wood.length === 15 && gd.wood.every((v) => v === 4), JSON.stringify(gd.wood));
check('GUARD: 0 wood-short evenings, 0 warmth acted, errs 0 / 0', gd.staged.length === 0 && gd.warmActed === 0 && gd.warmLogSpent === 0 && gd.wcErrs === 0 && gd.wwErrs === 0, 'staged=' + gd.staged.length + ' acted=' + gd.warmActed);
check('GUARD pile ledger: min pile days 2+ is 8, pile-floor mornings after day 1 = 0', gd.pileMinAfterDay1 === 8 && gd.pileFloorAfterDay1 === 0, 'min=' + gd.pileMinAfterDay1 + ' floor=' + gd.pileFloorAfterDay1);

// 3. Determinism: re-run first qualifier seed ON+warmth, byte-compare.
const staging = path.join(root, '.test-woodwarm-det');
try {
  fs.rmSync(staging, { recursive: true, force: true });
  const env = { ...process.env, SEEDS: '15003', POLICY: 'nighttravel', COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1', DAYS: '30', WOODCARRY: '1', WOODWARM: '1', OUTDIR: staging };
  execFileSync('node', [path.join(root, 'scripts', 'woodwarm-trace-b.js')], { env, cwd: root, stdio: 'pipe' });
  const orig = fs.readFileSync(ev('sim-woodwarm-b-corpus-on/woodwarm-b-nighttravel-s15003.json'), 'utf8');
  const rerun = fs.readFileSync(path.join(staging, 'woodwarm-b-nighttravel-s15003.json'), 'utf8');
  check('determinism re-run of 15003 ON+warmth is byte-identical to judged corpus', rerun === orig);
} catch (e) {
  check('determinism re-run of 15003 ON+warmth is byte-identical to judged corpus', false, String((e && e.message) || e).slice(0, 200));
} finally {
  try { fs.rmSync(staging, { recursive: true, force: true }); } catch (e) {}
}
check('determinism staging dir deleted', !fs.existsSync(staging));

console.log(failures === 0 ? 'ALL PROOF CHECKS GREEN' : failures + ' PROOF CHECKS FAILED');
process.exit(failures === 0 ? 0 : 1);
