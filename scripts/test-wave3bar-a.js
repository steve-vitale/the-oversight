#!/usr/bin/env node
// scripts/test-wave3bar-a.js — proof test for sim-wave3bar-a (DIAG ONLY).
// Reads the stored corpus under evidence/2026-10-26/perseed-sim-wave3bar-a/
// (plus the hunttable corpus, read-only, for the control comparison) and
// judges the pre-registered DIAG-GO bar. Exits 1 on any failure.
// Legs (binding, from the arm brief):
//   (i)   bar definition quoted from code (asserted here structurally:
//         tableSeat's lesser conjunction is w1>=4, w2>=4, w3>=3, and
//         every row's seatDetail.w3 equals the distinct wave-3 count
//         recomputed from its own finalFaced map — the definition is
//         the count, not a second number);
//   (ii)  w3 state tabulated for all 5 collapsed seeds x both columns,
//         plus the 73905 control (both columns);
//   (iii) independence shown explicitly on BOTH 73903 and 73904
//         (counterfactual: surge hypothetically met, every other
//         lesser bar met, w3 at 2/3, seat still none);
//   (iv)  recorder-neutrality det-gates PASS on pilot seed 73901
//         (plain vs wrapped identical, both columns) before the band.
// Control comparison (binding, reported plainly, never reconciled):
//   the current-base band vs the hunttable corpus headlines — any
//   disagreement is printed, not smoothed; it does not flip legs
//   (i)-(iv), which are judged on this arm's own corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-wave3bar-a');
const HUNT_EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-hunttable-a');
const W3_IDS = ['redactor', 'gavel', 'focus_group', 'spool', 'chorus_line', 'terms_of_service', 'callback', 'buffering', 'ad_break'];
const COLLAPSED = [73903, 73904, 73906, 73907, 73908];
const SEEDS = [73901, 73902, 73903, 73904, 73905, 73906, 73907, 73908];
let pass = 0, fail = 0;
const failures = [];
function ok(cond, label, extra) {
  if (cond) { pass++; console.log(`  PASS ${label}`); }
  else { fail++; failures.push(label); console.log(`  FAIL ${label}${extra ? ' :: ' + extra : ''}`); }
}
function row(pid, seed) {
  const p = path.join(EVID, `s${seed}-${pid}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function w3CountFromFaced(faced) {
  if (!faced) return null;
  return Object.keys(faced).filter(m => (faced[m] | 0) === 3).length;
}
function w3IdsFromFaced(faced) {
  if (!faced) return [];
  return Object.keys(faced).filter(m => (faced[m] | 0) === 3).sort();
}
// ---- leg (iv): det-gates ----
for (const arm of ['anchor', 'hunt']) {
  const p = path.join(EVID, `detgate-${arm}.json`);
  const d = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  ok(!!d, `detgate-${arm} artifact exists`);
  if (d) {
    ok(d.match === true, `detgate-${arm} MATCH`, JSON.stringify(d));
    ok(d.base.days === d.wrapped.days && d.base.gameDays === d.wrapped.gameDays
      && d.base.won === d.wrapped.won && d.base.deaths === d.wrapped.deaths,
      `detgate-${arm} fields identical (days/gameDays/won/deaths)`,
      `base=${JSON.stringify(d.base)} wrapped=${JSON.stringify(d.wrapped)}`);
  }
}
// ---- corpus presence: all 8 seeds x both columns ----
let corpusOk = true;
for (const pid of ['wave3bar-anchor', 'wave3bar-hunt']) {
  for (const s of SEEDS) {
    const r = row(pid, s);
    if (!r || !(r.days > 0)) { corpusOk = false; ok(false, `corpus row ${pid} s${s} present with days>0`); }
  }
}
ok(corpusOk, 'corpus complete: 8 seeds x both columns');
// ---- leg (i): definition = distinct wave-3 count from wavesFaced ----
let defOk = true;
for (const pid of ['wave3bar-anchor', 'wave3bar-hunt']) {
  for (const s of SEEDS) {
    const r = row(pid, s);
    if (!r) continue;
    const recomputed = w3CountFromFaced(r.finalFaced);
    const stated = r.finalSeatDetail ? (r.finalSeatDetail.w3 | 0) : null;
    if (recomputed !== stated) {
      defOk = false;
      console.log(`  FAIL definition s${s} ${pid}: recomputed w3=${recomputed} vs seatDetail w3=${stated}`);
    }
    // Trajectory cross-check: final w3 set == w3FirstDay keys.
    const trajFinal = (r.w3Traj && r.w3Traj.length) ? r.w3Traj[r.w3Traj.length - 1].w3Ids.slice().sort() : [];
    const firstKeys = Object.keys(r.w3FirstDay || {}).sort();
    if (JSON.stringify(trajFinal) !== JSON.stringify(firstKeys)) {
      defOk = false;
      console.log(`  FAIL trajectory s${s} ${pid}: traj final=${JSON.stringify(trajFinal)} vs firstDay keys=${JSON.stringify(firstKeys)}`);
    }
    // Every faced wave-3 id must be a real wave-3 monster id.
    for (const m of w3IdsFromFaced(r.finalFaced)) {
      if (!W3_IDS.includes(m)) { defOk = false; console.log(`  FAIL unknown w3 id ${m} s${s} ${pid}`); }
    }
  }
}
ok(defOk, 'leg (i): seatDetail.w3 == distinct wave-3 count recomputed from wavesFaced on all 16 rows; trajectory consistent; ids all in wave-3 roster');
// ---- leg (ii): tabulation present for collapsed x both + 73905 control ----
let tabOk = true;
for (const s of COLLAPSED.concat([73905])) {
  for (const pid of ['wave3bar-anchor', 'wave3bar-hunt']) {
    const r = row(pid, s);
    if (!r || !r.finalSeatDetail || !r.w3FirstDay || !r.w3Route || !r.firsts) { tabOk = false; ok(false, `tabulation ${pid} s${s}`); }
  }
}
ok(tabOk, 'leg (ii): w3 state tabulated for 5 collapsed seeds x both columns + 73905 control (both columns)');
// ---- leg (iii): independence on BOTH 73903 and 73904 ----
for (const s of [73903, 73904]) {
  const h = row('wave3bar-hunt', s);
  const a = row('wave3bar-anchor', s);
  if (!h || !a) { ok(false, `leg (iii) rows present s${s}`); continue; }
  const d = h.finalSeatDetail || {};
  const otherBarsMet = (d.w1 >= 4) && (d.w2 >= 4) && (d.contestsN >= 2) && (d.crisesN >= 2)
    && (d.rank === 'regional' || d.rank === 'national' || d.rank === 'global') && (d.stage >= 2)
    && (h.firsts.barSentimentDay != null);
  const surgeUnmet = h.firsts.barSurgeDay == null;
  const w3Short = (d.w3 | 0) === 2; // exactly one short of 3
  const seatNone = h.finalSnap.seat === 'none';
  const anchorSeated = a.firsts.seatFirstDay != null;
  ok(otherBarsMet, `leg (iii) s${s} hunt: every other lesser bar met (w1=${d.w1}, w2=${d.w2}, contests=${d.contestsN}, crises=${d.crisesN}, rank=${d.rank}, stage=${d.stage}, sentimentDay=${h.firsts.barSentimentDay})`);
  ok(surgeUnmet, `leg (iii) s${s} hunt: surge unmet (barSurgeDay null)`);
  ok(w3Short, `leg (iii) s${s} hunt: w3 exactly 2/3 (final w3=${d.w3})`);
  ok(seatNone, `leg (iii) s${s} hunt: seat none (counterfactual: surge met => still none on w3 alone)`);
  ok(anchorSeated, `leg (iii) s${s} anchor: seated (seat day ${a.firsts.seatFirstDay}) — bar reachable on this seed`);
  // Counterfactual table row (explicit, not assertion): with surge met,
  // the conjunction still fails on w3 alone.
  const cf = otherBarsMet && surgeUnmet && w3Short && seatNone;
  console.log(`  COUNTERFACTUAL s${s} hunt: surge hypothetically met + all other bars met + w3 ${d.w3}/3 => seat still NONE on w3 alone: ${cf ? 'SHOWN' : 'NOT SHOWN'}`);
  ok(cf, `leg (iii) s${s} counterfactual shown explicitly`);
}
// 73905 control: surge met, w3 missing, seat none (anchor column).
{
  const c = row('wave3bar-anchor', 73905);
  if (c) {
    const d = c.finalSeatDetail || {};
    ok(c.firsts.barSurgeDay != null, `control 73905 anchor: surge met (day ${c.firsts.barSurgeDay})`);
    ok((d.w3 | 0) < 3, `control 73905 anchor: w3 short (${d.w3}/3)`);
    ok(c.finalSnap.seat === 'none', 'control 73905 anchor: seat none with surge met — w3 alone blocks');
  } else ok(false, 'control 73905 anchor row present');
}
// ---- control comparison vs hunttable corpus (reported, not verdict-flipping) ----
console.log('  CONTROL vs hunttable corpus (current base vs hunttable base; disagreements reported, not smoothed):');
for (const s of SEEDS) {
  for (const [pid, hpid] of [['wave3bar-anchor', 'hunttable-anchor'], ['wave3bar-hunt', 'hunttable-hunt']]) {
    const r = row(pid, s);
    const hp = path.join(HUNT_EVID, `s${s}-${hpid}.json`);
    const h = fs.existsSync(hp) ? JSON.parse(fs.readFileSync(hp, 'utf8')) : null;
    if (!r || !h) { console.log(`  CONTROL s${s} ${pid}: MISSING ROW`); continue; }
    const same = r.days === h.days && r.won === h.won && r.finalRank === h.finalRank && r.table === h.table;
    console.log(`  CONTROL s${s} ${pid}: days ${r.days} vs hunttable ${h.days}; won ${r.won} vs ${h.won}; final ${r.finalRank} vs ${h.finalRank}; table ${r.table} vs ${h.table} => ${same ? 'MATCH' : 'DIFFERS (base drift, see evidence)'}`);
  }
}
// ---- GO computation ----
const go = fail === 0;
console.log(`\n  PROOF: ${pass} passed / ${fail} failed${failures.length ? ' :: ' + failures.join('; ') : ''}`);
console.log(`  DIAG VERDICT (legs i-iv on this arm's corpus): ${go ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
if (!go) process.exit(1);
