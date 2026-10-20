// test-wintrack-audit-20261020 — proof test for scripts/wintrack-audit-20261020.js
// (sim-wintrack-audit, 2026-10-20, flesh-out loop, axis scale-onramp).
//
// Usage: node scripts/test-wintrack-audit-20261020.js
//   No env vars. No game eval, no RNG, no network — pure offline fixture +
//   corpus analysis. Exit 0 = all green, 1 = failure (prints the failures).
//
// What it proves:
//  G1-G8 (fixture attribution): the auditor attributes each synthetic case
//    exactly as specified — wins via assigned door, via fallback door, via
//    relay (walked=[] but doorEvents+finals+endRec agree), and flags a
//    finals/endRec MISMATCH as UNEXPLAINED; non-wins get the right stall
//    class (pre-table-collapse, invitation-window-collapse,
//    no-invitation-stall); an unmatchable record is UNEXPLAINED.
//  G9 (completeness gate): on clean fixtures completeness = 100% (the
//    pre-registered GO threshold); with one poisoned record it drops below
//    and the run is NO-GO (never re-scored).
//  DET (read-only determinism): the auditor run twice over the REAL
//    committed corpora produces byte-identical reports; every corpus file
//    hashes identically before and after — the instrument cannot alter
//    trajectories (it never writes into the corpus dirs).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const A = require('./wintrack-audit-20261020.js');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function synth(o) {
  return Object.assign({
    policyId: 'leadfeast', seed: 90001, won: false, endReason: 'village-lost',
    gameDays: 50, tableDay: null, tableDoneDay: null, satEver: false,
    tableActiveDays: 0, maxWave: 2, tpAssigned: 'defiant', endRec: {},
    tpdSummary: { answers: 0, doorEvents: [], walked: [], finalsEvents: [], branchMargins: {} },
    rdSummary: null, deathsAttributed: { causeSpace: {} },
  }, o);
}

// G1: win via assigned door — witness/light, all three records agree.
const g1 = synth({ won: true, seed: 90001,
  endRec: { tb: { path: 'witness', branch: 'light', seat: 'lesser', beat: 3 } },
  tpdSummary: { answers: 5, branchMargins: { feared: {} },
    doorEvents: [{ day: 100, picked: 'path:witness', fellBack: false, why: 'assigned+witness', missWhy: null }],
    walked: [{ day: 100, path: 'witness', branch: 'light', fellBack: false }],
    finalsEvents: [{ day: 100, path: 'witness', branch: 'light', finalId: 'final:witness-read' }] } });
// G2: win via fallback — indispensable assigned, witness walked.
const g2 = synth({ won: true, seed: 90002, tpAssigned: 'indispensable',
  endRec: { tb: { path: 'witness', branch: 'light', seat: 'lesser', beat: 3 } },
  tpdSummary: { answers: 5, branchMargins: { feared: {} },
    doorEvents: [{ day: 90, picked: 'path:witness', fellBack: true, why: 'fallback', missWhy: 'The Indispensable needs a full seat' }],
    walked: [{ day: 90, path: 'witness', branch: 'light', fellBack: true }],
    finalsEvents: [{ day: 90, path: 'witness', branch: 'light', finalId: 'final:witness-read' }] } });
// G3: relay/dark win — walked=[] (the TPD recorder gap), doorEvents + finals + endRec agree.
const g3 = synth({ won: true, seed: 90003, tpAssigned: 'relay',
  endRec: { tb: { path: 'relay', branch: 'dark', seat: 'lesser', beat: 4 } },
  tpdSummary: { answers: 7,
    doorEvents: [{ day: 115, picked: 'path:relay', fellBack: false, why: 'assigned+relay', missWhy: null }],
    walked: [],
    finalsEvents: [{ day: 115, path: 'relay', branch: 'dark', finalId: 'final:relay-merge' }] },
  rdSummary: { active: true, claimed: 1, lean: -48, grounding: 100, darkUses: 8 } });
// G4: POISONED win — finals says defiant, endRec says relay -> UNEXPLAINED.
const g4 = synth({ won: true, seed: 90004,
  endRec: { tb: { path: 'relay', branch: 'dark', seat: 'lesser', beat: 4 } },
  tpdSummary: { answers: 6,
    doorEvents: [{ day: 90, picked: 'path:defiant', fellBack: false, why: 'assigned+defiant', missWhy: null }],
    walked: [{ day: 90, path: 'defiant', branch: 'light', fellBack: false }],
    finalsEvents: [{ day: 90, path: 'defiant', branch: 'light', finalId: 'final:defiant-walk' }] } });
// G5: pre-table collapse.
const g5 = synth({ seed: 90005, endReason: 'village-lost', gameDays: 38, tableDay: null, satEver: false,
  deathsAttributed: { causeSpace: { monster: 2, starvation: 1 } } });
// G6: invitation-window collapse.
const g6 = synth({ seed: 90006, endReason: 'village-lost', gameDays: 69, tableDay: 45, tableDoneDay: null, satEver: false,
  deathsAttributed: { causeSpace: { combat: 5 } } });
// G7: no-invitation stall (road-active).
const g7 = synth({ seed: 90007, endReason: 'survived', gameDays: 182, tableDay: null, satEver: false, maxWave: 3,
  rdSummary: { active: true, claimed: 1, done: 1, doneDay: 60, lean: -48, darkUses: 8 } });
// G8: unmatchable non-win (no stall class) -> UNEXPLAINED.
const g8 = synth({ seed: 90008, endReason: 'mysterious', gameDays: 100, tableDay: 50, tableDoneDay: 70, satEver: true });

const a1 = A.attributeRun(g1);
ok('G1 door', a1.door === 'witness' && a1.branch === 'light' && !a1.unexplained, JSON.stringify(a1.door));
const a2 = A.attributeRun(g2);
ok('G2 fallback', a2.door === 'witness' && !a2.unexplained && a2.doorEvents[0].fellBack === true, JSON.stringify(a2.doorEvents));
const a3 = A.attributeRun(g3);
ok('G3 relay-no-walk', a3.door === 'relay' && a3.branch === 'dark' && !a3.unexplained, JSON.stringify({ d: a3.door, u: a3.unexplained }));
const a4 = A.attributeRun(g4);
ok('G4 poison-flagged', a4.unexplained === true, 'poisoned win was not flagged unexplained');
const a5 = A.attributeRun(g5);
ok('G5 stall-class', a5.stallClass === 'pre-table-collapse' && !a5.unexplained, a5.stallClass);
const a6 = A.attributeRun(g6);
ok('G6 stall-class', a6.stallClass === 'invitation-window-collapse' && !a6.unexplained, a6.stallClass);
const a7 = A.attributeRun(g7);
ok('G7 stall-class', a7.stallClass === 'no-invitation-stall' && !a7.unexplained && /road-active/.test(a7.mechanism), a7.mechanism);
const a8 = A.attributeRun(g8);
ok('G8 unmatchable', a8.unexplained === true, 'should be unexplained');

// G9: completeness gate.
const cleanAudit = A.auditArmed([g1, g2, g3, g5, g6, g7]);
ok('G9 clean-completeness', cleanAudit.completeness === 1 && cleanAudit.unexplained.length === 0,
  `completeness=${cleanAudit.completeness}`);
const poisonAudit = A.auditArmed([g1, g2, g3, g4, g5, g6, g7, g8]);
ok('G9 poisoned-NO-GO', poisonAudit.completeness < 1 && poisonAudit.unexplained.length === 2,
  `completeness=${poisonAudit.completeness} unexplained=${poisonAudit.unexplained.join(',')}`);

// Control-side fixture: natural track all one door.
const c1 = synth({ won: true, seed: 91001, endRec: { tb: { path: 'feared', branch: 'light', seat: 'lesser', beat: 4 } } });
const c2 = synth({ won: false, seed: 91002, endReason: 'village-lost', gameDays: 60, satEver: false, tableDay: null });
const ca = A.auditControl([c1, c2]);
ok('G10 control-dist', ca.dist['feared/light'] === 1 && ca.nonwins.length === 1 && ca.unexplained.length === 0,
  JSON.stringify(ca.dist));

// DET: read-only + deterministic over the REAL committed corpora.
function hashDir(dir) {
  const h = crypto.createHash('sha256');
  const files = [];
  for (const pol of ['belongfeast', 'leadfeast']) {
    const pdir = path.join(dir, pol);
    if (!fs.existsSync(pdir)) continue;
    for (const f of fs.readdirSync(pdir).filter(x => /^s\d+\.json$/.test(x)).sort()) files.push(path.join(pdir, f));
  }
  for (const f of files) h.update(fs.readFileSync(f));
  return h.digest('hex');
}
const repo = path.resolve(__dirname, '..');
const armedDir = path.join(repo, 'evidence', '2026-10-20', 'perseed-tablepathdriver');
const ctrlDir = path.join(repo, 'evidence', '2026-10-20', 'perseed-tablepathdriver-control');
const hArmed0 = hashDir(armedDir), hCtrl0 = hashDir(ctrlDir);
const rep1 = JSON.stringify({ a: A.auditArmed(A.loadCorpus(armedDir)), c: A.auditControl(A.loadCorpus(ctrlDir)) });
const rep2 = JSON.stringify({ a: A.auditArmed(A.loadCorpus(armedDir)), c: A.auditControl(A.loadCorpus(ctrlDir)) });
ok('DET report-deterministic', rep1 === rep2 && rep1.length > 1000, 'double-run reports differ');
ok('DET corpus-unchanged', hashDir(armedDir) === hArmed0 && hashDir(ctrlDir) === hCtrl0, 'corpus files were modified by the audit');

// Sanity on the real corpora: sizes + completeness must match the known corpus.
const realArmed = A.auditArmed(A.loadCorpus(armedDir));
ok('REAL armed-n', realArmed.n === 16, `n=${realArmed.n}`);
ok('REAL armed-wins', realArmed.wins === 12 && realArmed.nonwins === 4, `wins=${realArmed.wins} nonwins=${realArmed.nonwins}`);
ok('REAL armed-completeness', realArmed.completeness === 1, `completeness=${realArmed.completeness}`);
const realCtrl = A.auditControl(A.loadCorpus(ctrlDir));
ok('REAL ctrl-one-track', realCtrl.dist['feared/light'] === 12 && Object.keys(realCtrl.dist).length === 1,
  JSON.stringify(realCtrl.dist));

console.log(fail === 0 ? `ALL GREEN (${pass}/${pass})` : `FAILURES: ${fail} (passed ${pass})`);
process.exit(fail === 0 ? 0 : 1);
