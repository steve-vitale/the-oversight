#!/usr/bin/env node
// scripts/test-hunttable-a.js — proof test for sim-hunttable-a
// (scale-onramp axis, 2026-10-26: decompose the hunt-band table
// collapse. DIAG ONLY — this test READS the stored corpus in
// evidence/2026-10-26/perseed-sim-hunttable-a/ and recomputes
// every verdict leg from it. It runs no sims and writes nothing
// into the repo. Exit 1 on any failure.)
//
// Legs proven here (each maps to a section of
// evidence/2026-10-26/sim-hunttable-a.md):
//   1. det-gates: both columns' recorder-neutrality det-gates
//      MATCH on pilot seed 73901 (days/gameDays/won/deaths/
//      tsNationalDay, from the detgate artifacts).
//   2. control reproduction: the anchor column reproduces
//      transient2's anchor headlines and the hunt column its
//      hunt headlines, computed from the 16 stored rows
//      (invited/entered/wins/natEver/median/draws-driven).
//   3. per-step divergence: on the 5 collapsed seeds
//      (anchor-invited, hunt-not: 73903, 73904, 73906, 73907,
//      73908) the feast-surge bar diverges 5/5, the
//      downstream steps (seat/invitation/preview/preview-
//      ready/entered/Arc IV) diverge 5/5, the wave-3 bar
//      diverges 2/5, and every other bar diverges 0/5.
//   4. sole-bar proof: on 73906, 73907, 73908 every
//      lesser-seat bar except the surge is met on BOTH arms
//      (same bar days where both met), so the surge alone
//      blocks the seat on those seeds.
//   5. mechanism legs (from the hunt corpora): every
//      collapsed seed has >= 1 granted feast, all its draws
//      driven off, and ZERO turn-based fights starting
//      inside any true feast window (grant dusk day D or
//      the next day D+1 — the buff buys the night plus the
//      full next day, then expires at the D+2 dawn); the
//      hunt winner 73902 DOES have in-window fights and
//      DOES mark the surge; on every collapsed seed the
//      anchor's surge day equals the hunt's first grant day.
//   6. DIAG-GO computation: a table-chain step divergent on
//      >= 3 collapsed seeds (the surge bar, 5/5) with the
//      code path cited in the evidence file.
//   7. corpus integrity: 16 rows, days > 0, firsts present,
//      tableTrace day-monotonic.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-hunttable-a');
const SEEDS = [73901, 73902, 73903, 73904, 73905, 73906, 73907, 73908];
const COLLAPSED = [73903, 73904, 73906, 73907, 73908];
const STEP_KEYS = ['arc4Day', 'barW1Day', 'barW2Day', 'barW3Day', 'barContestsDay', 'barCrisesDay', 'barStageDay', 'barSentimentDay', 'barSurgeDay', 'seatFirstDay', 'invitationDay', 'previewDay', 'previewReadyDay', 'enteredDay'];

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`  PASS ${name}`); }
  else { failed++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function medianOf(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function load(pid, seed) {
  return JSON.parse(fs.readFileSync(path.join(DIR, `s${seed}-${pid}.json`), 'utf8'));
}

console.log('sim-hunttable-a proof: corpus recomputation');
const anchor = {}, hunt = {};
for (const seed of SEEDS) { anchor[seed] = load('hunttable-anchor', seed); hunt[seed] = load('hunttable-hunt', seed); }

// Leg 1: det-gates.
for (const [arm, file] of [['anchor', 'detgate-anchor.json'], ['hunt', 'detgate-hunt.json']]) {
  const dg = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
  check(`detgate-${arm} MATCH (seed ${dg.seed})`, dg.match === true,
    `base=${JSON.stringify(dg.base)} wrapped=${JSON.stringify(dg.wrapped)}`);
  const fields = ['days', 'gameDays', 'won', 'deaths'];
  const ok = fields.every(f => dg.base[f] === dg.wrapped[f])
    && (dg.base.ts != null ? dg.base.ts : null) === dg.wrapped.ts;
  check(`detgate-${arm} five fields identical`, ok);
}

// Leg 2: control reproduction vs transient2 headlines.
function band(rows) {
  return {
    won: rows.reduce((t, r) => t + r.won, 0),
    median: medianOf(rows.map(r => r.days)),
    natEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    starv: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deaths: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
}
const aBand = band(SEEDS.map(s => anchor[s]));
const hBand = band(SEEDS.map(s => hunt[s]));
check('control anchor invited 6/8', aBand.table === 6, `got ${aBand.table}`);
check('control anchor entered 6/8', aBand.entered === 6, `got ${aBand.entered}`);
check('control anchor wins 6/8', aBand.won === 6, `got ${aBand.won}`);
check('control anchor natEver 7/8', aBand.natEver === 7, `got ${aBand.natEver}`);
check('control anchor median 109d', aBand.median === 109, `got ${aBand.median}`);
check('control hunt invited 1/8', hBand.table === 1, `got ${hBand.table}`);
check('control hunt entered 1/8', hBand.entered === 1, `got ${hBand.entered}`);
check('control hunt wins 1/8', hBand.won === 1, `got ${hBand.won}`);
check('control hunt natEver 7/8', hBand.natEver === 7, `got ${hBand.natEver}`);
check('control hunt median 170d', hBand.median === 170, `got ${hBand.median}`);
let huntDraws = 0, huntDriven = 0;
for (const seed of SEEDS) {
  const fd = hunt[seed].feastdraw || {};
  huntDraws += (fd.draws || []).length;
  huntDriven += (fd.driveoffs || []).length;
}
check('control hunt 46 draws all driven off', huntDraws === 46 && huntDriven === 46, `draws=${huntDraws} driven=${huntDriven}`);
// Collapsed-seed definition itself, from the stored rows.
for (const seed of COLLAPSED) {
  check(`collapsed s${seed}: anchor invited, hunt not`, anchor[seed].table === 1 && hunt[seed].table === 0);
}
check('non-collapsed s73902 invited both arms', anchor[73902].table === 1 && hunt[73902].table === 1);
check('non-collapsed s73901 invited neither arm', anchor[73901].table === 0 && hunt[73901].table === 0);

// Leg 3: per-step divergence counts.
const divCounts = {};
for (const k of STEP_KEYS) {
  let n = 0;
  for (const seed of COLLAPSED) {
    if ((anchor[seed].firsts[k] != null) !== (hunt[seed].firsts[k] != null)) n++;
  }
  divCounts[k] = n;
}
console.log(`  divergence counts: ${JSON.stringify(divCounts)}`);
check('divergence surge bar 5/5', divCounts.barSurgeDay === 5);
check('divergence seat/invitation/preview/ready/entered/arc4 5/5',
  ['seatFirstDay', 'invitationDay', 'previewDay', 'previewReadyDay', 'enteredDay', 'arc4Day'].every(k => divCounts[k] === 5));
check('divergence wave-3 bar 2/5', divCounts.barW3Day === 2);
check('divergence all other bars 0/5',
  ['barW1Day', 'barW2Day', 'barContestsDay', 'barCrisesDay', 'barStageDay', 'barSentimentDay'].every(k => divCounts[k] === 0));

// Leg 4: sole-bar proof on 73906/73907/73908.
for (const seed of [73906, 73907, 73908]) {
  const a = anchor[seed].firsts, h = hunt[seed].firsts;
  const othersMetBoth = ['barW1Day', 'barW2Day', 'barW3Day', 'barContestsDay', 'barCrisesDay', 'barStageDay', 'barSentimentDay']
    .every(k => a[k] != null && h[k] != null);
  check(`sole-bar s${seed}: all non-surge bars met both arms`, othersMetBoth);
  check(`sole-bar s${seed}: surge anchor-only`, a.barSurgeDay != null && h.barSurgeDay == null);
  check(`sole-bar s${seed}: hunt final foodDeeds false, anchor true`,
    hunt[seed].finalSnap.seatDetail.foodDeeds === false && anchor[seed].finalSnap.seatDetail.foodDeeds === true);
}

// Leg 5: mechanism legs.
for (const seed of COLLAPSED) {
  const h = hunt[seed];
  const grants = (h.feastdraw.grants || []).filter(g => g.granted).map(g => g.day);
  const starts = (h.nonworldkill.starts || []);
  const inWindow = starts.filter(s => grants.some(d => s.day === d || s.day === d + 1));
  check(`mechanism s${seed}: >=1 granted feast`, grants.length >= 1, `grants=${grants.length}`);
  check(`mechanism s${seed}: all draws driven`, (h.feastdraw.draws || []).length === (h.feastdraw.driveoffs || []).length);
  check(`mechanism s${seed}: 0 TB starts in true feast window`, inWindow.length === 0, `inWindow=${inWindow.length}`);
  check(`mechanism s${seed}: anchor surge day == hunt first grant day`,
    anchor[seed].firsts.barSurgeDay === grants[0], `anchorSurge=${anchor[seed].firsts.barSurgeDay} firstGrant=${grants[0]}`);
}
{
  const h = hunt[73902];
  const grants = (h.feastdraw.grants || []).filter(g => g.granted).map(g => g.day);
  const inWindow = (h.nonworldkill.starts || []).filter(s => grants.some(d => s.day === d || s.day === d + 1));
  check('mechanism winner s73902: in-window fights exist and surge marked',
    inWindow.length >= 1 && h.firsts.barSurgeDay != null, `inWindow=${inWindow.length} surge=${h.firsts.barSurgeDay}`);
}

// Leg 6: DIAG-GO computation.
const goSteps = STEP_KEYS.filter(k => divCounts[k] >= 3);
check('DIAG-GO: a step divergent on >=3 collapsed seeds', goSteps.length >= 1, `steps=${goSteps.join(',')}`);
check('DIAG-GO: surge bar is such a step', goSteps.indexOf('barSurgeDay') >= 0);

// Leg 7: corpus integrity.
let integrityOk = true;
for (const seed of SEEDS) {
  for (const [pid, row] of [['anchor', anchor[seed]], ['hunt', hunt[seed]]]) {
    const ok = row.days > 0 && row.firsts && Array.isArray(row.tableTrace)
      && row.tableTrace.every((t, i) => i === 0 || t.day >= row.tableTrace[i - 1].day);
    if (!ok) integrityOk = false;
  }
}
check('corpus integrity: 16 rows, days > 0, firsts present, tableTrace day-monotonic', integrityOk);

console.log(`\nRESULT: ${passed} passed / ${failed} failed`);
if (failed) { console.error('PROOF GATE FAILURE'); process.exit(1); }
