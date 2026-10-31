#!/usr/bin/env node
// test-sighit-a-20261031.js — proof for sim-sighit-a.
// Re-derives the prereg verdicts from the committed SUMMARY corpus
// (evidence/2026-10-31/perseed-sighit-a/fixture-band.json) WITHOUT
// re-running the fixture: pilot gate fields, R1/R2/R3 from the 48
// confirm pairs + leg medians, per-beast round-cap flags, audit
// control (delta range [0,0], pairs identical), and transcript
// presence (one full MAIN confirm transcript per beast).
// The summary corpus carries no per-fight array (EPERM-flap
// compaction, documented in the corpus note + evidence file), so
// per-fight re-derivation is replaced by pair-level re-derivation.
// Determinism of the summary corpus was proven by two stdout runs
// with identical sha256 (40925cee0cc29db84792a9ac719501d53eff59bed81
// a5976c18788f4638a39dd) — re-check with:
//   SIGHIT_COMPACT=1 SIGHIT_SUMMARY_OUT=stdout node
//   scripts/sighit-a-fixture-20261031.js 2>/dev/null | sha256sum
// Usage: node scripts/test-sighit-a-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-sighit-a', 'fixture-band.json');
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name + (detail !== undefined ? ' — ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ' — ' + detail : '')); }
}
function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; }

const d = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
check('corpus arm', d.arm === 'sim-sighit-a', d.arm);
check('corpus is summary corpus', d.compactSummary === true, String(d.compactSummary));
check('corpus anchor is a 40-hex commit', /^[0-9a-f]{40}$/.test(d.anchorCommit || ''), d.anchorCommit);
check('pilot gate recorded PASS', d.pilotPass === true && d.pilotGate.p1_fromStartRate === 1 && d.pilotGate.p2_wrapperMatchedRate === 1, JSON.stringify(d.pilotGate));
check('pilot P3 all beasts 1', d.pilotGate.p3_sigAdd.congregation === 1 && d.pilotGate.p3_sigAdd.eater === 1 && d.pilotGate.p3_sigAdd.suburb === 1 && d.pilotGate.p3_sigAdd.audit === 1, JSON.stringify(d.pilotGate.p3_sigAdd));
const pairs = d.confirm.pairs;
check('pairs = 48', pairs.length === 48, String(pairs.length));
const perBeastPairs = {};
for (const p of pairs) (perBeastPairs[p.beast] = perBeastPairs[p.beast] || []).push(p);
check('12 pairs per beast', Object.values(perBeastPairs).every(a => a.length === 12), Object.entries(perBeastPairs).map(([k, v]) => k + ':' + v.length).join(' '));
// Re-derive R1/R2/R3 from pairs + leg medians.
const r1 = d.confirm.nosig.medianRounds >= d.confirm.main.medianRounds + 1;
const r2 = mean(pairs.map(p => p.dRounds)) >= 0.5;
const r3 = d.confirm.nosig.medianVHpLeft >= d.confirm.main.medianVHpLeft + 10;
console.log('INFO medianRounds MAIN=' + d.confirm.main.medianRounds + ' NOSIG=' + d.confirm.nosig.medianRounds + ' meanPairedDRounds=' + mean(pairs.map(p => p.dRounds)) + ' medianVHp MAIN=' + d.confirm.main.medianVHpLeft + ' NOSIG=' + d.confirm.nosig.medianVHpLeft);
check('R1 re-derived matches corpus (false)', r1 === false && d.confirm.r1_medianRoundsPlus1 === false, 'R1=' + r1);
check('R2 re-derived matches corpus (false)', r2 === false && d.confirm.r2_meanPairedDRoundsGe05 === false, 'R2=' + r2 + ' mean=' + mean(pairs.map(p => p.dRounds)));
check('R3 re-derived matches corpus (true)', r3 === true && d.confirm.r3_medianVHpPlus10 === true, 'R3=' + r3);
check('mean paired dRounds matches corpus', Math.abs(mean(pairs.map(p => p.dRounds)) - d.confirm.meanPairedDRounds) < 1e-9, String(d.confirm.meanPairedDRounds));
check('verdict = DIAG-NO-GO (R1 and R2 miss)', d.confirmVerdict === 'DIAG-NO-GO', d.confirmVerdict);
// Per-beast round-cap flags re-derived from pairs + perBeast medians.
for (const beast of ['congregation', 'eater', 'audit', 'suburb']) {
  const bp = perBeastPairs[beast], pb = d.confirm.perBeast[beast];
  const capped = (pb.medianRoundsNosig >= pb.medianRoundsMain + 1) && (mean(bp.map(p => p.dRounds)) >= 0.5);
  check('round-cap flag ' + beast + ' re-derived', capped === pb.roundCapped, beast + ' capped=' + capped + ' meanD=' + mean(bp.map(p => p.dRounds)));
}
check('eater round-capped true, others false', d.confirm.perBeast.eater.roundCapped === true && d.confirm.perBeast.congregation.roundCapped === false && d.confirm.perBeast.audit.roundCapped === false && d.confirm.perBeast.suburb.roundCapped === false, 'eater=' + d.confirm.perBeast.eater.roundCapped);
// Audit control: delta range [0,0] both legs, pairs identical.
check('audit MAIN delta range [0,0]', JSON.stringify(d.hitSummary['audit:MAIN'].rangeSigDelta) === '[0,0]', JSON.stringify(d.hitSummary['audit:MAIN'].rangeSigDelta));
check('audit NOSIG delta range [0,0]', JSON.stringify(d.hitSummary['audit:NOSIG'].rangeSigDelta) === '[0,0]', JSON.stringify(d.hitSummary['audit:NOSIG'].rangeSigDelta));
check('audit pairs identical rounds+HP', perBeastPairs.audit.every(p => p.dRounds === 0 && p.dVHp === 0), '12/12');
check('audit hit summaries identical', JSON.stringify(d.hitSummary['audit:MAIN']) === JSON.stringify(d.hitSummary['audit:NOSIG']), 'identical');
// Base-band fidelity: pre-sig in band = 1 on every MAIN leg.
for (const beast of ['congregation', 'eater', 'audit', 'suburb']) {
  check('preSig in band = 1, ' + beast + ':MAIN', d.hitSummary[beast + ':MAIN'].sharePreSigInBand === 1, String(d.hitSummary[beast + ':MAIN'].sharePreSigInBand));
}
// Round-1 bands: sig beasts 100% above band top, audit 0%.
for (const beast of ['congregation', 'eater', 'suburb']) {
  check('r1 above band top = 1, ' + beast, d.r1Summary[beast].sharePostSigAboveBandTop === 1, String(d.r1Summary[beast].sharePostSigAboveBandTop));
}
check('r1 above band top = 0, audit', d.r1Summary.audit.sharePostSigAboveBandTop === 0, String(d.r1Summary.audit.sharePostSigAboveBandTop));
// Transcripts: exactly one per beast, MAIN confirm, non-empty logs.
check('transcripts = 4, one per beast', d.transcripts.length === 4 && ['congregation', 'eater', 'audit', 'suburb'].every(b => d.transcripts.some(t => t.beast === b)), d.transcripts.map(t => t.beast).join(','));
check('transcripts all MAIN confirm with logs', d.transcripts.every(t => t.leg === 'MAIN' && t.stage === 'confirm' && t.log.length > 0), d.transcripts.map(t => t.beast + ':' + t.log.length).join(' '));
check('all confirm fights vFlee both legs', d.confirm.main.outcomes.vFlee === 48 && d.confirm.nosig.outcomes.vFlee === 48, 'main ' + JSON.stringify(d.confirm.main.outcomes) + ' nosig ' + JSON.stringify(d.confirm.nosig.outcomes));
console.log('RESULT ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
