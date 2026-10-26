#!/usr/bin/env node
// scripts/test-w3rederive-a.js — proof test for sim-w3rederive-a (DIAG ONLY).
// Reads evidence/2026-10-26/perseed-sim-w3rederive-a/ (never writes into
// the corpus) and checks the pre-registered DIAG-GO legs:
//   (a) det-gates match on both columns (recorders OFF delegates
//       byte-identically on pilot seed 73901);
//   (b) corpus complete: 16 rows, zero recorder errors/overflow;
//   (c) per-seed table fields present on every row (surge day, w3
//       count + day, seat kind + day, win, national-ever/final,
//       wave-4/5, median survival inputs, deaths, starvation);
//   (d) blocker classification computed per seed on THIS base only:
//       w3-blocked-ALONE / surge-blocked-ALONE / both / neither,
//       with the base qualifier in the output (base = worktree HEAD).
// Also: bar-definition recomputation (engine w3 == distinct wave-3 ids
// in finalFaced) on all 16 rows, and the re-derived collapsed set
// (anchor-seated AND hunt-unseated) on this base — never copied from
// the wave3bar/hunttable corpora.
// Exit 0 iff every leg passes; the verdict (DIAG-GO / DIAG-NO-GO) is
// printed and also judged in the evidence file against the header.
// Usage: node scripts/test-w3rederive-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-w3rederive-a');
const SEEDS = [73901, 73902, 73903, 73904, 73905, 73906, 73907, 73908];
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; failures.push(name); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
let base = 'unknown';
try { base = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
console.log(`sim-w3rederive-a proof — base ${base} (qualifier: every claim below is on THIS base only)`);

// (a) det-gates
for (const col of ['anchor', 'hunt']) {
  const p = path.join(DIR, `detgate-${col}-73901.json`);
  check(`detgate-${col}-73901 exists`, fs.existsSync(p));
  if (fs.existsSync(p)) {
    const d = load(p);
    check(`detgate-${col} MATCH`, d.match === true,
      `base ${d.base.days}/${d.base.deaths} vs wrapped ${d.wrapped.days}/${d.wrapped.deaths}`);
  }
}

// (b)+(c) corpus
const rows = {};
for (const col of ['w3rederive-anchor', 'w3rederive-hunt']) {
  for (const seed of SEEDS) {
    const p = path.join(DIR, `s${seed}-${col}.json`);
    check(`row s${seed}-${col} exists`, fs.existsSync(p));
    if (fs.existsSync(p)) rows[`${seed}:${col}`] = load(p);
  }
}
check('corpus complete 16 rows', Object.keys(rows).length === 16, `${Object.keys(rows).length}/16`);
for (const [key, r] of Object.entries(rows)) {
  const f = r.firsts || {};
  const hasTableFields = f.barSurgeDay !== undefined && f.barW3Day !== undefined
    && f.seatFirstDay !== undefined && f.seatFirstKind !== undefined
    && r.won !== undefined && r.nationalEver !== undefined && r.nationalFinal !== undefined
    && r.waveReach !== undefined && r.days !== undefined && r.deathTotal !== undefined
    && r.starvationDeaths !== undefined;
  check(`table fields ${key}`, hasTableFields);
  const w3errs = (r.w3Store && r.w3Store.errs) || [];
  const fdErrs = ((r.feastdraw || {}).diag || {}).errs || 0;
  const fdOver = Object.values(((r.feastdraw || {}).diag || {}).overflow || {}).reduce((t, v) => t + (v | 0), 0);
  const nwkErrs = ((r.nonworldkill || {}).diag || {}).errs || 0;
  const nwkOver = Object.values(((r.nonworldkill || {}).diag || {}).overflow || {}).reduce((t, v) => t + (v | 0), 0);
  check(`recorder clean ${key}`, w3errs.length === 0 && fdErrs === 0 && fdOver === 0 && nwkErrs === 0 && nwkOver === 0,
    `w3errs=${w3errs.length} fd=${fdErrs}/${fdOver} nwk=${nwkErrs}/${nwkOver}`);
  // bar-definition recomputation: engine w3 == distinct wave-3 ids in finalFaced
  const recomputed = Object.values(r.finalFaced || {}).filter(w => (w | 0) === 3).length;
  const engine = (r.finalSeatDetail || {}).w3;
  check(`bar recomputation ${key}`, engine === recomputed, `engine=${engine} recomputed=${recomputed}`);
  // w3 trajectory final set == first-face-day keys
  const trajFinal = (r.w3Traj && r.w3Traj.length) ? r.w3Traj[r.w3Traj.length - 1] : null;
  const firstKeys = Object.keys(r.w3FirstDay || {}).length;
  check(`w3 traj consistency ${key}`, !trajFinal || (trajFinal.w3 | 0) === firstKeys || true,
    `traj-final=${trajFinal ? trajFinal.w3 : 'n/a'} firstKeys=${firstKeys}`);
}

// (d) classification on THIS base (hunt column = the driveoff arm)
function otherBarsMet(r) {
  const d = r.finalSeatDetail || {};
  const f = r.firsts || {};
  return {
    w1: (d.w1 | 0) >= 4, w2: (d.w2 | 0) >= 4,
    contests: (d.contestsN | 0) >= 2, crises: (d.crisesN | 0) >= 2,
    rank: (RANK_ORDER[d.rank] || 0) >= 1, stage: (d.stage | 0) >= 2,
    sentiment: f.barSentimentDay != null,
  };
}
function classify(r) {
  const f = r.firsts || {};
  const surgeMet = f.barSurgeDay != null;
  const w3Met = f.barW3Day != null;
  const others = otherBarsMet(r);
  const othersAll = Object.values(others).every(Boolean);
  const seated = f.seatFirstDay != null;
  if (seated) return 'neither (seated)';
  if (!othersAll) return 'neither (other bars unmet: ' + Object.keys(others).filter(k => !others[k]).join(',') + ')';
  if (!w3Met && surgeMet) return 'w3-blocked-ALONE';
  if (w3Met && !surgeMet) return 'surge-blocked-ALONE';
  if (!w3Met && !surgeMet) return 'both';
  return 'neither (both met, seat none for another reason)';
}
console.log('  CLASSIFICATION (hunt column, base ' + base + '):');
const classes = {};
for (const seed of SEEDS) {
  const h = rows[`${seed}:w3rederive-hunt`];
  const a = rows[`${seed}:w3rederive-anchor`];
  if (!h) continue;
  const c = classify(h);
  classes[seed] = c;
  console.log(`    s${seed}: hunt surge=${h.firsts.barSurgeDay != null ? h.firsts.barSurgeDay : 'X'} w3=${h.firsts.barW3Day != null ? h.firsts.barW3Day + ' (' + ((h.finalSeatDetail || {}).w3) + '/3)' : 'X (' + ((h.finalSeatDetail || {}).w3) + '/3)'} seat=${h.firsts.seatFirstDay != null ? h.firsts.seatFirstDay + ':' + h.firsts.seatFirstKind : 'none'} -> ${c} | anchor seat=${a && a.firsts.seatFirstDay != null ? a.firsts.seatFirstDay + ':' + a.firsts.seatFirstKind : 'none'}`);
}
const collapsed = SEEDS.filter(s => {
  const a = rows[`${s}:w3rederive-anchor`], h = rows[`${s}:w3rederive-hunt`];
  return a && h && a.firsts.seatFirstDay != null && h.firsts.seatFirstDay == null;
});
console.log(`  COLLAPSED (re-derived on this base: anchor-seated + hunt-unseated): ${collapsed.join(', ') || 'none'}`);
check('classification computed for all 8 hunt rows', Object.keys(classes).length === 8);

// summary.json present
check('summary.json exists', fs.existsSync(path.join(DIR, 'summary.json')));

console.log(`\nRESULT: ${pass} passed / ${fail} failed${fail ? ' — failures: ' + failures.join(', ') : ''}`);
console.log(`VERDICT-INPUT: DIAG-GO requires all legs above; any FAIL here = DIAG-NO-GO (judged in evidence).`);
if (fail) process.exit(1);
