#!/usr/bin/env node
// test-vet2-20261031.js — sim-vet2-a proof test.
//
// Synthetic checks (no game loaded): vet2 layer delegation + snapshot
// rules, kill-time classification, dedupe, census join, and a full
// synthetic analyzeSeed (trajectory, deaths, replacement, cross-checks).
// Corpus leg (runs only when the judged corpus exists): re-derives the
// instrument gates from the judged corpus — errors 0, cross-checks
// (i)-(iv) pass on every seed, key table computable on all 9 key seeds.
// Verdict-dependent numbers (how many seeds reach vet2) are NOT asserted
// here: a zero is a valid finding, not an instrument failure.
//
// Usage: node scripts/test-vet2-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok: ${name}`); }
  else { fail++; console.log(`  FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
}

delete process.env.VET2;
const V2 = require(path.join(__dirname, 'policies', 'vet2-diag'));
const AN = require(path.join(__dirname, 'vet2-analyze-20261031'));

// 1. Delegation when VET2 unset: inner daily runs, no rows recorded.
{
  let innerCalls = 0;
  const inner = { daily() { innerCalls++; return 'r'; } };
  const w = V2.withVet2Diag(inner, 't', 't');
  const fake = { state: { scholar: { day: 1 } }, villagerId: 'x' };
  const r = w.daily(fake, {});
  check('vet2-off delegates byte-identically', r === 'r' && innerCalls === 1 && w.vet2Store.rows.length === 0);
}

// 2. Snapshot rules on a fake Game (VET2=1).
process.env.VET2 = '1';
{
  const vp = { va: { dead: false, name: 'Alice A' }, vb: { dead: true, name: 'Bob B' }, vc: { dead: false, name: 'Carol C' } };
  const fake = {
    villagerId: 'vs',
    state: {
      scholar: { day: 10, villagerId: 'vs' },
      waveKillLog: [
        { d: 5, mid: 'm3', w: 3, by: 'va', via: 'wild', trick: null },
        { d: 6, mid: 'm4', w: 4, by: 'vb', via: 'wild', trick: null },
        { d: 7, mid: 'm4', w: 4, by: 'vs', via: 'player', trick: null },
        { d: 8, mid: 'm2', w: 2, by: 'vc', via: 'wild', trick: null },
      ],
    },
    vpOf: (vid) => vp[vid] || null,
    getPerson: (vid) => (vp[vid] ? { name: vp[vid].name } : null),
  };
  const row = V2.snapVet2(fake);
  check('snapshot vet4 = living w3+ killers incl scholar', JSON.stringify(row.vet4) === JSON.stringify(['va', 'vs']), JSON.stringify(row.vet4));
  check('snapshot vet5 excludes dead killer', JSON.stringify(row.vet5) === JSON.stringify(['vs']), JSON.stringify(row.vet5));
  check('snapshot scholar vids agree, no errs', row.scholarVid === 'vs' && row.scholarStateVid === 'vs' && row.errs.length === 0, JSON.stringify(row.errs));
  check('snapshot logLen', row.logLen === 4);
  // Scholar-vid mismatch flagged.
  const fake2 = Object.assign({}, fake, { state: { scholar: { day: 10, villagerId: 'other' }, waveKillLog: [] } });
  const row2 = V2.snapVet2(fake2);
  check('snapshot flags scholarVid mismatch', row2.errs.includes('scholarVidMismatch'), JSON.stringify(row2.errs));
}

// 3. Kill-time classification + dedupe + census join.
{
  check('classify: by=player is scholar', AN.isCaptureScholar({ by: 'player', scholarVid: 'z' }) === true);
  check('classify: by==scholarVid is scholar', AN.isCaptureScholar({ by: 's1', scholarVid: 's1' }) === true);
  check('classify: other by is villager', AN.isCaptureScholar({ by: 'v9', scholarVid: 's1' }) === false);
  const d = AN.dedupeKills([
    { d: 5, mid: 'm', w: 4, by: 'a', via: 'wild', trick: null },
    { d: 5, mid: 'm', w: 4, by: 'a', via: 'wild', trick: null },
    { d: 6, mid: 'm', w: 4, by: 'a', via: 'wild', trick: null },
  ]);
  check('dedupe exact repeats', d.kills.length === 2 && d.dupes === 1);
  const rows = [{ day: 2, scholarVid: 'a' }, { day: 4, scholarVid: 'b' }];
  check('census join before first row uses initial', AN.scholarVidOfDay(rows, 1, 'init') === 'init');
  check('census join uses latest row <= day', AN.scholarVidOfDay(rows, 3, 'init') === 'a');
  check('census join on row day', AN.scholarVidOfDay(rows, 4, 'init') === 'b');
}

// 4. Full synthetic analyzeSeed: trajectory, death, replacement, cross-checks.
{
  const wgRow = (day, extra) => Object.assign({
    day, rank: 'national', uw: 4, gated: 199, raw: 250, hold: 'defer5', holds: ['defer5'],
    w4faced: true, p1: 5, p2: 4, w3rung: true, tableWaiting: false, tableDone: false, won: false,
    rd4: { veterans: 1 }, rd5: { veterans: 1 },
  }, extra || {});
  const seed = {
    seed: 99999, anchorCommit: 'test', instrument: 'vet2-v1',
    national: 1, table: 0, won: 0, maxWave: 4, gameDays: 30, endReason: 'test', endScaleRank: 'national',
    derivedFinalUw: 4, engineFinalUw: 4, recorderErrs: 0, vetErrs: 0, captureErrs: 0, scholarVidMismatches: 0,
    initialScholarVid: 's1',
    rows: [wgRow(10), wgRow(20, { rd4: { veterans: 2 }, rd5: { veterans: 2 } }), wgRow(30, { rd4: { veterans: 1 }, rd5: { veterans: 1 } })],
    vetRows: [
      { day: 10, scholarVid: 's1', scholarStateVid: 's1', vet4: ['s1'], vet5: ['s1'], names: { s1: 'Sch' } },
      { day: 20, scholarVid: 's1', scholarStateVid: 's1', vet4: ['s1', 'v9'], vet5: ['s1', 'v9'], names: { s1: 'Sch', v9: 'Vic' } },
      { day: 30, scholarVid: 's1', scholarStateVid: 's1', vet4: ['s1'], vet5: ['s1'], names: { s1: 'Sch' } },
    ],
    kills: [
      { d: 9, mid: 'm4', w: 4, by: 's1', via: 'player', trick: null, scholarVid: 's1', scholarStateVid: 's1' },
      { d: 19, mid: 'm4', w: 4, by: 'v9', via: 'wild', trick: null, scholarVid: 's1', scholarStateVid: 's1' },
    ],
    finalWaveKillLog: [
      { d: 9, mid: 'm4', w: 4, by: 's1', via: 'player', trick: null },
      { d: 19, mid: 'm4', w: 4, by: 'v9', via: 'wild', trick: null },
    ],
  };
  const a = AN.analyzeSeed(seed);
  check('synthetic maxVet5', a.maxVet5 === 2, String(a.maxVet5));
  check('synthetic firstVet2Day', a.firstVet2Day === 20, String(a.firstVet2Day));
  check('synthetic endVet5', a.endVet5.length === 1 && a.endVet5[0].vid === 's1');
  check('synthetic veteran death recorded', a.deaths.length === 1 && a.deaths[0].vid === 'v9' && a.deaths[0].lostDay === 30, JSON.stringify(a.deaths));
  check('synthetic scholar/villager w4 split', a.scholarKills4 === 1 && a.villagerKills4 === 1, `${a.scholarKills4}/${a.villagerKills4}`);
  check('synthetic cc1 clean', a.cc1.mismatches.length === 0, JSON.stringify(a.cc1.mismatches));
  check('synthetic cc2 clean', a.cc2.equal === true);
  check('synthetic cc3 clean', a.cc3.mismatches.length === 0, JSON.stringify(a.cc3.mismatches));
  check('synthetic cc4 clean', a.cc4.equal === true);
  check('synthetic blocker5 DEFER5', a.blocker5 === 'DEFER5', a.blocker5);
}

// 5. Corpus leg (only when the judged corpus exists).
{
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-vet2');
  const lead = path.join(dir, 'leadfeast');
  if (fs.existsSync(lead)) {
    const a = AN.analyzeDir(dir);
    check('corpus: >=9 usable seeds', a.summary.seeds >= 9, String(a.summary.seeds));
    check('corpus: all 9 key seeds present', a.summary.keySeeds === 9, String(a.summary.keySeeds));
    check('corpus: key completeness 9/9 with the one explained cc3 exception', a.summary.keyCompleteExplained === 9, `${a.summary.keyCompleteExplained}/9 (strict ${a.summary.keyComplete}/9)`);
    let bad = 0, badDetail = '';
    for (const s of a.seeds) {
      if (s.recorderErrs !== 0 || s.vetErrs !== 0 || s.captureErrs !== 0) { bad++; badDetail += ` seed ${s.seed} errs;`; }
      if (s.cc1.mismatches.length || !s.cc2.equal || !s.cc4.equal) { bad++; badDetail += ` seed ${s.seed} cc1/cc2/cc4;`; }
      if (s.cc3.mismatches.some(m => !m.successionShaped)) { bad++; badDetail += ` seed ${s.seed} unexplained cc3;`; }
    }
    check('corpus: every seed errors 0 + cc (i)(ii)(iv) pass + cc3 only succession-shaped', bad === 0, badDetail);
    const s87135 = a.seeds.find(s => s.seed === 87135);
    check('corpus: 87135 cc3 exception is exactly one succession-shaped mismatch',
      !!s87135 && s87135.cc3.mismatches.length === 1 && s87135.cc3.mismatches[0].successionShaped === true,
      s87135 ? JSON.stringify(s87135.cc3.mismatches) : 'seed missing');
    const keyMissingTable = a.seeds.filter(s => AN.KEY_SEEDS.includes(s.seed) && (!s.perVillager || !Array.isArray(s.deaths)));
    check('corpus: key tables computable', keyMissingTable.length === 0);
    console.log(`  corpus: ${a.summary.seeds} seeds, everVet2 ${a.summary.everVet2}, maxVet5 ${a.summary.maxVet5Overall}`);
  } else {
    console.log('  corpus leg skipped (no judged corpus yet)');
  }
}

console.log(`vet2 proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
