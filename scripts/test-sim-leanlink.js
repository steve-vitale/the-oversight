#!/usr/bin/env node
// test-sim-leanlink.js — proof for the sim-leanlink arm.
//
// T1 (source pairing/delta proof, no sim needed): leanlink.js stripped of
//   comments contains NO tend verb call and NO tended counter; cap is 3;
//   propose-from 25; tribute 4000; LEANLINK gate '1'; default-off path
//   delegates to competent.daily; competent.js contains NO scale verbs.
// T2 (corpus completeness, after the pilot sweep): 16 per-seed JSONs for
//   73501–73508 x {control, armed} in perseed-leanlink/, all valid, one
//   anchor, daysRequested 180, zero sweep errors, armed tends all 0.
// T3 (recomputation): recompute national/table/wins/starvation/median
//   survival from the corpus JSONs and print them for the evidence file;
//   T3 FAILS if the recomputation disagrees with the evidence table the
//   runner pastes (checked by eye against the printed block) — the test
//   itself asserts the recomputed numbers are well-formed and that the
//   armed tends are 0 (the design invariant).
// If the corpus dir is absent, T2/T3 SKIP (not fail): the test is run
// pre-sweep for T1 and post-sweep for the full suite.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
let fails = 0;
function ok(cond, label) {
  console.log((cond ? 'PASS ' : 'FAIL ') + label);
  if (!cond) fails++;
}
function stripComments(src) {
  return src.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

const leanSrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leanlink.js'), 'utf8');
const lean = stripComments(leanSrc);
ok(!/tendLink\s*\(/.test(lean), 'T1 leanlink source has no tendLink() call (comment-stripped)');
ok(!/tended/.test(lean), 'T1 leanlink source has no tended counter (comment-stripped)');
ok(/subCap\s*=\s*3/.test(lean), 'T1 leanlink subordinate cap is 3');
ok(/proposeFrom\s*=\s*25/.test(lean), 'T1 leanlink propose-from is day 25');
ok(/tributeKcalPerWeek\s*:\s*4000/.test(lean), 'T1 leanlink tribute is 4000 kcal/week');
ok(/LEANLINK/.test(leanSrc) && /v\s*===\s*'1'/.test(lean), 'T1 leanlink env gate is LEANLINK=1');
ok(/if\s*\(mode\s*===\s*0\)\s*return\s*competent\.daily/.test(lean), 'T1 leanlink default-off delegates to competent.daily');
ok(/answerCounter/.test(lean) && /answerAccord/.test(lean) && /answerNationalChoice/.test(lean) && /answerGlobalChoice/.test(lean), 'T1 leanlink answers counters/accords/national/global');
ok(/answerDefenseCall/.test(lean), 'T1 leanlink answers defense calls');

const compSrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8');
const comp = stripComments(compSrc);
for (const verb of ['proposeLink', 'tendLink', 'answerCounter', 'answerAccord', 'answerNationalChoice', 'answerGlobalChoice', 'hierarchyState']) {
  ok(!new RegExp(verb + '\\s*\\(').test(comp) && !new RegExp(verb + '\\b').test(comp), 'T1 competent.js contains no scale verb ' + verb);
}
// leanlink.js must be the ONLY new policy file of this arm; linkform/leadcourt untouched by construction (checked by git status in the run, not here).

const EVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-leanlink');
const SEEDS = [73501, 73502, 73503, 73504, 73505, 73506, 73507, 73508];
if (!fs.existsSync(EVID)) {
  console.log('SKIP T2/T3: corpus dir absent (pre-sweep run — T1 only)');
  console.log(fails === 0 ? 'TEST-OK (T1 only)' : 'TEST-FAIL');
  process.exit(fails === 0 ? 0 : 1);
}
const rows = [];
for (const s of SEEDS) {
  for (const arm of ['control', 'armed']) {
    const fn = path.join(EVID, `s${s}-${arm}.json`);
    ok(fs.existsSync(fn), `T2 corpus file exists s${s}-${arm}`);
    if (!fs.existsSync(fn)) continue;
    const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
    ok(d.seed === s && d.arm === arm && d.daysRequested === 180, `T2 corpus file valid s${s}-${arm}`);
    ok(Array.isArray(d.deaths) && Array.isArray(d.errors) && d.errors.length === 0, `T2 corpus file clean s${s}-${arm}`);
    rows.push(d);
  }
}
const anchors = new Set(rows.map(r => r.anchorCommit));
ok(anchors.size === 1, 'T2 single anchor across corpus (' + [...anchors].join(',') + ')');
const armed = rows.filter(r => r.arm === 'armed');
ok(armed.every(r => (r.court.tended || 0) === 0), 'T2 armed tends all 0 (design invariant)');
function median(xs) { const s = [...xs].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; }
function sum(xs) { return xs.reduce((a, b) => a + b, 0); }
const by = (arm) => rows.filter(r => r.arm === arm);
const recompute = {};
for (const arm of ['control', 'armed']) {
  const rs = by(arm);
  recompute[arm] = {
    national: sum(rs.map(r => r.national)), regional: sum(rs.map(r => r.regional)),
    global: sum(rs.map(r => r.global)), table: sum(rs.map(r => r.table)),
    won: sum(rs.map(r => r.won)), exiled: sum(rs.map(r => r.exiled)),
    medianGameDays: median(rs.map(r => r.gameDays)), maxGameDays: Math.max(...rs.map(r => r.gameDays)),
    starvation: sum(rs.map(r => (r.deathTotals.byCause.starvation || 0))),
    villagerCombat: sum(rs.map(r => r.deathTotals.villagerCombat)),
    formed: sum(rs.map(r => r.links.formed)), dissolved: sum(rs.map(r => r.links.dissolved)),
    dissolvedBroken: sum(rs.map(r => r.links.dissolvedBroken || 0)),
    accords: sum(rs.map(r => r.court.courtAccords)), counters: sum(rs.map(r => r.court.courtCounters)),
    nationalAnswers: sum(rs.map(r => r.court.courtNational)), globalAnswers: sum(rs.map(r => r.court.courtGlobal)),
    proposed: sum(rs.map(r => r.court.proposedLead)), tends: sum(rs.map(r => r.court.tended)),
    defenseCalls: sum(rs.map(r => r.court.defenseCalls)),
  };
}
console.log('T3 RECOMPUTED ' + JSON.stringify(recompute, null, 1));
ok(recompute.armed.tends === 0, 'T3 armed tends recompute to 0');
console.log(fails === 0 ? 'TEST-OK' : 'TEST-FAIL');
process.exit(fails === 0 ? 0 : 1);
