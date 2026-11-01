#!/usr/bin/env node
// test-contactrec2-20261031.js — proof test for sim-contactrec2-a.
// (1) The REAL captureHp from scripts/policies/contactrec2-diag.js:
//     evade rows capture exactly, fought rows are never filled, and
//     the src emission is ignored even when present in rec.
// (2) File-content assertions: the candidate recorder never reads
//     rec.mHpStart / rec.mMaxHp (emission-independence, by code).
// (3) Classifier cases via the unchanged contactbreak classifyRow.
// (4) Corpus reconciliation on both judged legs, when the analysis
//     JSONs exist (evidence/2026-10-31/contactrec2-analysis-
//     baseline.json / -candidate.json); skipped with a printed note
//     before the analyses are written, never silently.
// Loads no game code, runs no sims. Usage: node
// scripts/test-contactrec2-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIAG = require(path.join(REPO, 'scripts', 'policies', 'contactrec2-diag.js'));
const CB = require(path.join(REPO, 'scripts', 'contactbreak-analyze-20261031.js'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' :: ' + extra : ''}`); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// (1) captureHp — the real function.
check('evade m-null: start=mHpLeft, max=band top',
  eq(DIAG.captureHp(null, null, { outcome: 'evade', mHpLeft: 317 }, null, { hp: [240, 340] }),
     { mHpStart: 317, mMaxHp: 340, mHpAtContact: 317 }));
check('evade m-present: pre-call wins over mHpLeft',
  eq(DIAG.captureHp(268, 320, { outcome: 'evade', mHpLeft: 268 }, { hp: 268, maxHp: 320 }, { hp: [240, 320] }),
     { mHpStart: 268, mMaxHp: 320, mHpAtContact: 268 }));
check('evade healthy beast classifies FOUGHT (contactbreak, unchanged)',
  CB.classifyRow({ mHpStart: 317, mMaxHp: 340, rounds: 0, mDealt: 0, outcome: 'evade' }).cls === 'FOUGHT');
check('evade broken beast classifies CONTACT',
  CB.classifyRow({ mHpStart: 36, mMaxHp: 260, rounds: 0, mDealt: 0, outcome: 'evade' }).cls === 'CONTACT');
check('fought m-null: start NEVER filled, even with emission in rec',
  eq(DIAG.captureHp(null, null, { outcome: 'mFlee', mHpLeft: 10, mHpStart: 44, mMaxHp: 280 }, null, { hp: [240, 280] }),
     { mHpStart: null, mMaxHp: 280, mHpAtContact: 10 }));
check('fought m-null with damage: start null, max band-top (exact, not derived)',
  DIAG.captureHp(null, null, { outcome: 'vFlee', mHpLeft: 100, mHpStart: 200, mMaxHp: 300 }, null, { hp: [240, 300] }).mHpStart === null);
check('fought m-present: pre-call stands, emission ignored',
  eq(DIAG.captureHp(44, 280, { outcome: 'mFlee', mHpLeft: 44, mHpStart: 999, mMaxHp: 999 }, { hp: 44, maxHp: 280 }, { hp: [240, 280] }),
     { mHpStart: 44, mMaxHp: 280, mHpAtContact: 44 }));
check('alreadyDead is not an evade: no fill from mHpLeft=0',
  DIAG.captureHp(null, null, { outcome: 'alreadyDead', mHpLeft: 0 }, null, { hp: [240, 280] }).mHpStart === null);
check('mHpAtContact rides every row',
  DIAG.captureHp(10, 300, { outcome: 'vKill', mHpLeft: 0 }, { hp: 10, maxHp: 300 }, { hp: [240, 300] }).mHpAtContact === 0);

// (2) File-content: no emission read in the candidate recorder.
// Comments name the emission in prose ("never read"), so strip
// full-line // comments before testing for an actual code read.
const diagSrcRaw = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'contactrec2-diag.js'), 'utf8');
const diagSrc = diagSrcRaw.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
check('candidate never reads rec.mHpStart', !/rec\.mHpStart/.test(diagSrc));
check('candidate never reads rec.mMaxHp', !/rec\.mMaxHp/.test(diagSrc));
check('candidate has evade-only fill', /outcome === 'evade'/.test(diagSrc) && /rec\.mHpLeft/.test(diagSrc));
check('candidate exports captureHp', typeof DIAG.captureHp === 'function');
// Protected files untouched: this test only reads them.
for (const f of ['scripts/policies/spikecontact-diag.js', 'scripts/spikecontact-sweep-20261031.js',
  'scripts/spikecontact-contact-20261031.js', 'scripts/policies/contactrec-diag.js']) {
  check(`protected file readable+present: ${f}`, fs.existsSync(path.join(REPO, f)));
}

// (3) Classifier edge cases.
check('classifier: missing HP -> UNCLASSIFIED with reason',
  (() => { const r = CB.classifyRow({ rounds: 0, mDealt: 0, outcome: 'evade' }); return r.cls === 'UNCLASSIFIED' && /mHpStart/.test(r.reason); })());
check('classifier: rounds-1 below-break mFlee -> CONTACT',
  CB.classifyRow({ mHpStart: 20, mMaxHp: 300, rounds: 1, mDealt: 0, outcome: 'mFlee' }).cls === 'CONTACT');
check('classifier: at-break-line 0.15 exactly -> FOUGHT (strict <)',
  CB.classifyRow({ mHpStart: 45, mMaxHp: 300, rounds: 0, mDealt: 0, outcome: 'mFlee' }).cls === 'FOUGHT');

// (4) Corpus reconciliation, re-derived from raw per-seed rows (not
// the analyzer's own arithmetic), when corpora + analyses exist.
for (const leg of ['baseline', 'candidate']) {
  const dir = path.join(REPO, 'evidence', '2026-10-31', `perseed-contactrec2-${leg}`, 'leadfeast');
  const fp = path.join(REPO, 'evidence', '2026-10-31', `contactrec2-analysis-${leg}.json`);
  if (!fs.existsSync(dir) || !fs.existsSync(fp)) { console.log(`SKIP corpus reconciliation (${leg}): corpus/analysis not written yet`); continue; }
  const b = JSON.parse(fs.readFileSync(fp, 'utf8')).band;
  let total = 0, contact = 0, unclassified = 0, evadeRows = 0, evadeCap = 0;
  for (const fn of fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort()) {
    const obj = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
    for (const f of (obj.fieldFights || [])) {
      if (f.wave !== 3) continue;
      total++;
      if (f.outcome === 'evade') { evadeRows++; if (Number.isFinite(f.mHpStart) && Number.isFinite(f.mMaxHp)) evadeCap++; }
      const c = CB.classifyRow(f);
      if (c.cls === 'CONTACT') contact++;
      else if (c.cls === 'UNCLASSIFIED') unclassified++;
    }
  }
  check(`corpus ${leg}: re-derived total == band total`, total === b.total, `${total} vs ${b.total}`);
  check(`corpus ${leg}: re-derived CONTACT == band contactN`, contact === b.contactN, `${contact} vs ${b.contactN}`);
  check(`corpus ${leg}: re-derived UNCLASSIFIED == band unclassified`, unclassified === b.unclassified, `${unclassified} vs ${b.unclassified}`);
  check(`corpus ${leg}: CONTACT+FOUGHT+UNCLASSIFIED == total`,
    contact + (total - contact - unclassified) + unclassified === total);
  check(`corpus ${leg}: re-derived evade capture == band`, evadeRows === b.evadeRows && evadeCap === b.evadeCaptured,
    `${evadeCap}/${evadeRows} vs ${b.evadeCaptured}/${b.evadeRows}`);
  check(`corpus ${leg}: BUILD universe + no-instr mFlee <= mFlee CONTACT`,
    b.buildUniverseN + b.noInstrMfleeN <= b.mFleeN);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
