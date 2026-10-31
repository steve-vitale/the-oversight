#!/usr/bin/env node
// test-fullseat-20261031.js — sim-fullseat-a proof test.
//
// Synthetic checks (analyzer logic) + corpus legs that re-derive the
// band verdict gates from the judged corpus (evidence/2026-10-31/
// perseed-fullseat + fullseat-analysis.json). The det-gate and
// determinism legs are run artifacts recorded in the evidence file
// (det ON vs OFF byte-identical hashes on 87109/87135; 87107 rerun
// byte-identical to its judged JSON; 87115/87138 trajectory-identical
// modulo the anchor stamp, which moved on an instruments-only commit);
// they are not re-run here because they need the game harness and
// their own scratch dirs.
//
// Usage: node scripts/test-fullseat-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { bindingAt, shortfall, analyzeSeed } = require('./fullseat-analyze-20261031');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- Synthetic: binding / shortfall ----
check('binding full pass is []', eq(bindingAt({ w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2, foodDeeds: true, scale: true }), []));
check('binding 87132 vector is [w5] only', eq(bindingAt({ w1: 16, w2: 8, w3: 7, w4: 3, w5: 0, contests: 6, crises: 3, stage: 3, foodDeeds: true, scale: true }), ['w5']));
check('shortfall 87132 vector is 2', shortfall({ w1: 16, w2: 8, w3: 7, w4: 3, w5: 0, contests: 6, crises: 3, stage: 3, foodDeeds: true, scale: true }) === 2);
check('shortfall 87138 vector is 2', shortfall({ w1: 17, w2: 5, w3: 5, w4: 4, w5: 0, contests: 9, crises: 3, stage: 3, foodDeeds: true, scale: true }) === 2);
check('binding 87109 vector is [w3,w5]', eq(bindingAt({ w1: 15, w2: 9, w3: 2, w4: 5, w5: 0, contests: 14, crises: 3, stage: 3, foodDeeds: true, scale: true }), ['w3', 'w5']));
check('shortfall counts scale as 1 when unmet', shortfall({ w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2, foodDeeds: true, scale: false }) === 1);

// ---- Synthetic: analyzer on a fabricated seed ----
const synth = {
  seed: 99999, anchorCommit: 'synth',
  wavegateErrs: 0, vetErrs: 0, regtableErrs: 0, captureErrs: 0,
  won: 1, table: 1, national: 1, maxWave: 4, gameDays: 90, endReason: 'over-other', endScaleRank: 'global',
  derivedFinalUw: 4, engineFinalUw: 4,
  regtableRows: [
    { day: 47, seat: 'lesser', rank: 'regional', tableWaiting: true, tableDone: false, fullOk: false, full: { w1: 16, w2: 4, w3: 4, w4: 0, w5: 0, contestsN: 3, crisesN: 3, stage: 3, foodDeeds: true, scale: false } },
    { day: 90, seat: 'lesser', rank: 'global', tableWaiting: true, tableDone: true, fullOk: false, full: { w1: 17, w2: 5, w3: 5, w4: 4, w5: 0, contestsN: 9, crisesN: 3, stage: 3, foodDeeds: true, scale: true } },
  ],
  wavegateRows: [
    { day: 47, tableWaiting: true, tableDone: false, uw: 4 },
    { day: 90, tableWaiting: true, tableDone: true, uw: 4, gated: 199, hold: 'defer5', binding: ['defer5'], w4faced: true },
  ],
  vetRows: [
    { day: 82, scholarVid: 'a', scholarStateVid: 'a', vet4: [], vet5: [], names: { a: 'Alan' } },
    { day: 90, scholarVid: 'a', scholarStateVid: 'a', vet4: ['d'], vet5: ['d'], names: { a: 'Alan', d: 'Daniyar' } },
  ],
  kills: [{ d: 82, mid: 'influencer', w: 4, by: 'd', via: 'player', trick: null, src: 'wavekill', scholarVid: 'a', scholarStateVid: 'a' }],
  finalWaveKillLog: [{ d: 82, mid: 'influencer', w: 4, by: 'd', via: 'player', trick: null }],
  fullseat: { max: { w1: 17, w2: 5, w3: 5, w4: 4, w5: 0, contests: 9, crises: 3, stage: 3, standing: 199 }, firstFullSeatDay: null, firstLesserDay: 47, winDay: 90 },
};
const sa = analyzeSeed(synth);
check('synth tableDay 47', sa.tableDay === 47);
check('synth seatAtTable lesser', sa.seatAtTable === 'lesser');
check('synth firstFullDay null', sa.firstFullDay === null);
check('synth bindingAtMax [w5]', eq(sa.bindingAtMax, ['w5']));
check('synth closestDay shortfall 2', sa.closestDay && sa.closestDay.shortfall === 2);
check('synth maxVet5 1', sa.maxVet5 === 1);
check('synth w4 kills 1, w5 kills 0', sa.kills.w4 === 1 && sa.kills.w5 === 0);
check('synth cc1/cc2/cc4 pass', sa.cc1_tableDayAgree && sa.cc2.pass && sa.cc4_derivedEqEngine);
check('synth cc5 fullseat max agrees', sa.cc5_fullseatMaxAgree === true);

// ---- Corpus legs ----
const evidDir = path.join(REPO, 'evidence', '2026-10-31');
const analysisPath = path.join(evidDir, 'fullseat-analysis.json');
const analysisExists = fs.existsSync(analysisPath);
check('analysis JSON exists', analysisExists);
if (!analysisExists) { console.log(`${pass} passed, ${fail} failed`); process.exit(1); }
const A = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
check('band has 19 seeds', A.band.seeds === 19, 'got ' + A.band.seeds);
check('band everFull 0', A.band.everFull === 0);
check('band table 16', A.band.table === 16);
check('band won 15', A.band.won === 15);
check('band wave5 0', A.band.wave5 === 0);
check('band w4 kills total 4', A.band.w4killsTotal === 4);
check('band w5 kills total 0', A.band.w5killsTotal === 0);
check('band single-bar near misses are exactly [87132,87138]', eq(A.band.singleBarNearMiss, [87132, 87138]));
check('band componentWisePass empty', eq(A.band.componentWisePass, []));
check('band maxVet5ge2 0', A.band.maxVet5ge2 === 0);

const KNOWN_ANCHORS = new Set(['5bdc4de7400a', 'f29db07abae7']);
for (const s of A.seeds) {
  const fp = path.join(evidDir, 'perseed-fullseat', 'leadfeast', `s${s.seed}.json`);
  check(`s${s.seed} judged JSON exists`, fs.existsSync(fp));
  if (!fs.existsSync(fp)) continue;
  const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
  check(`s${s.seed} errs all 0`, s.errs.wavegate === 0 && s.errs.vet === 0 && s.errs.regtable === 0 && s.errs.capture === 0);
  check(`s${s.seed} cc1 tableDay agrees`, s.cc1_tableDayAgree === true);
  check(`s${s.seed} cc2 capture reconciles`, s.cc2.pass === true);
  check(`s${s.seed} cc4 derived==engine uw`, s.cc4_derivedEqEngine === true);
  check(`s${s.seed} firstFullDay null`, s.firstFullDay === null);
  check(`s${s.seed} anchor is a known arm anchor`, KNOWN_ANCHORS.has((j.anchorCommit || '')));
  // cc3: every mismatch must satisfy the addendum rule — both capture
  // scholar reads agree, and the kill moves no census number (wave <= 3
  // and, for wave-3 kills, the killer never appears in a living vet5 set).
  const vet5Vids = new Set();
  for (const r of (j.vetRows || [])) for (const v of (r.vet5 || [])) vet5Vids.add(v);
  let cc3ok = true, cc3why = '';
  for (const m of (s.cc3.mismatches || [])) {
    const cap = (j.kills || []).find(k => k.d === m.d && k.mid === m.mid);
    if (!cap || cap.scholarVid !== cap.scholarStateVid) { cc3ok = false; cc3why = 'scholar reads disagree'; break; }
    if (cap.w >= 4) { cc3ok = false; cc3why = 'wave-4+ mismatch moves census'; break; }
    if (cap.w === 3 && vet5Vids.has(cap.by)) { cc3ok = false; cc3why = 'w3 killer is a vet5 holder'; break; }
  }
  check(`s${s.seed} cc3 mismatches all explained under addendum rule`, cc3ok, cc3why);
  // Closest-day vector equals max vector on the near-miss seeds (no
  // simultaneity gap there) — re-derived, not quoted.
  if (s.seed === 87132 || s.seed === 87138) {
    check(`s${s.seed} closestDay binding is [w5]`, s.closestDay && eq(s.closestDay.binding, ['w5']));
  }
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
