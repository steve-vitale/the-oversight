#!/usr/bin/env node
// test-sim-linkdrive.js — proof test for arm sim-linkdrive (flesh-out loop,
// axis scale-onramp, parent run fleshout-20261024T1347Z).
// READ-ONLY (stdout only, exit non-zero on failure): asserts on the
// committed pilot corpora in evidence/2026-10-24/perseed-linkdrive/ plus
// the pairing/delta source proof. Run AFTER the pilot sweep completes.
// T1: pairing/delta source proof — competent.daily contains NO scale
//   verbs (so the armed delta is the whole mode-2 courtship, not just
//   the cap); linkform mode 2 = competent.daily + linkformCourtship with
//   subordinate cap 5; LINKFORM=1 maps to off (KILLED 2026-10-23, never
//   resurrected here).
// T2: corpus completeness — 16 pilot files, seeds exactly 73401-73408 x
//   {control, armed}, single anchor, daysRequested 180, zero errors.
// T3: recomputation — the pre-registered primary + guardrails recomputed
//   from the corpora (legs printed; the verdict itself is judged in the
//   evidence file against the same header — this test fails only if the
//   corpora cannot support the recomputation, e.g. missing fields or a
//   paired-seed mismatch).
// T4: no lever trace on kill-path — linkform.js and competent.js are
//   unmodified by this arm (their git status is clean relative to the
//   arm's commit set is checked by the coordinator; here: the arm's own
//   file list contains no policy files — enforced by the file inventory
//   in the evidence file, and this test asserts no scripts/policies/
//   file was created by the arm: linkdrive.js must NOT exist).
// Usage: node scripts/test-sim-linkdrive.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-24', 'perseed-linkdrive');
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail != null ? ' — ' + detail : ''));
  if (!cond) failures++;
}
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

// T1a: competent has no scale verbs.
const compSrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8');
for (const verb of ['Game.proposeLink', 'Game.tendLink', 'Game.answerCounter', 'Game.answerAccord',
  'Game.answerNationalChoice', 'Game.answerGlobalChoice', 'Game.hierarchyState']) {
  check('T1a competent lacks ' + verb, !compSrc.includes(verb));
}
// T1b: linkform mode-2 shape.
const lfSrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'linkform.js'), 'utf8');
check('T1b linkform mode-2 = competent.daily + linkformCourtship',
  lfSrc.includes('competent.daily(Game, ctx)') && lfSrc.includes('linkformCourtship(Game, ctx, mode)'));
check('T1b linkform subCap 5 for mode 2', lfSrc.includes('(mode === 2) ? 5 : 3'));
check('T1b linkform proposeFrom 25, perDay 1', lfSrc.includes('const proposeFrom = 25') && lfSrc.includes('const perDay = 1'));
const { linkformMode } = require(path.join(REPO, 'scripts', 'policies', 'linkform'));
process.env.LINKFORM = '1';
check('T1c LINKFORM=1 maps to off (KILLED, never resurrected)', linkformMode() === 0);
process.env.LINKFORM = '2';
check('T1c LINKFORM=2 maps to mode 2', linkformMode() === 2);
delete process.env.LINKFORM;
check('T1c LINKFORM unset maps to off', linkformMode() === 0);

// T2: corpus completeness.
const files = fs.readdirSync(DIR).filter(x => /^s7340\d+-(control|armed)\.json$/.test(x)).sort();
check('T2a pilot files = 16', files.length === 16, `got ${files.length}`);
const rows = files.map(f => load(path.join(DIR, f)));
const byArm = { control: rows.filter(r => r.arm === 'control'), armed: rows.filter(r => r.arm === 'armed') };
check('T2b 8 control + 8 armed', byArm.control.length === 8 && byArm.armed.length === 8,
  `${byArm.control.length} control, ${byArm.armed.length} armed`);
const seedsOk = s => { const srt = [...s].sort((a, b) => a - b); return srt.length === 8 && srt.every((v, i) => v === 73401 + i); };
check('T2c control seeds 73401-73408', seedsOk(byArm.control.map(r => r.seed)), byArm.control.map(r => r.seed).join(','));
check('T2c armed seeds 73401-73408', seedsOk(byArm.armed.map(r => r.seed)), byArm.armed.map(r => r.seed).join(','));
const anchors = new Set(rows.map(r => r.anchor12));
check('T2d single anchor', anchors.size === 1, [...anchors].join(','));
check('T2e all daysRequested 180', rows.every(r => r.daysRequested === 180));
check('T2f zero sweep errors', rows.every(r => (r.errors || []).length === 0),
  rows.map(r => (r.errors || []).length).join(','));
check('T2g paired seeds identical', JSON.stringify(byArm.control.map(r => r.seed).sort()) === JSON.stringify(byArm.armed.map(r => r.seed).sort()));

// T3: recomputation of the pre-registered bar.
const nat = a => a.reduce((t, r) => t + (r.national || 0), 0);
const starv = a => a.reduce((t, r) => t + ((r.deathTotals.byCause || {}).starvation || 0), 0);
const cNat = nat(byArm.control), aNat = nat(byArm.armed);
const cMed = med(byArm.control.map(r => r.gameDays)), aMed = med(byArm.armed.map(r => r.gameDays));
const cStarv = starv(byArm.control), aStarv = starv(byArm.armed);
const spikes = Object.keys(byArm.armed.reduce((m, r) => { for (const [k, v] of Object.entries(r.deathTotals.byCause || {})) m[k] = (m[k] || 0) + v; return m; }, {}))
  .filter(k => { const av = byArm.armed.reduce((t, r) => t + ((r.deathTotals.byCause || {})[k] || 0), 0); const cv = byArm.control.reduce((t, r) => t + ((r.deathTotals.byCause || {})[k] || 0), 0); return av >= 3 && cv === 0; });
console.log(`T3 recomputed: national control=${cNat}/8 armed=${aNat}/8; median control=${cMed} armed=${aMed} ratio=${cMed ? (aMed / cMed).toFixed(3) : 'n/a'}; starvation control=${cStarv} armed=${aStarv} diff=${aStarv - cStarv}; spikes=${JSON.stringify(spikes)}`);
check('T3a primary legs computable (integers 0..8)', Number.isInteger(cNat) && Number.isInteger(aNat) && cNat >= 0 && cNat <= 8 && aNat >= 0 && aNat <= 8);
check('T3b guardrail legs computable', Number.isFinite(cMed) && Number.isFinite(aMed) && Number.isInteger(cStarv) && Number.isInteger(aStarv));
check('T3c villager-combat co-primary present on every row',
  rows.every(r => typeof r.deathTotals.villagerCombat === 'number' && typeof r.deathTotals.villager === 'number'));
check('T3d court counters present on every row',
  rows.every(r => r.court && typeof r.court.proposedLead === 'number' && typeof r.court.tended === 'number'));
check('T3e control courtship is zero (pairing holds in the corpora)',
  byArm.control.every(r => Object.values(r.court || {}).every(v => v === 0)),
  byArm.control.map(r => JSON.stringify(r.court)).join(' '));

// T4: no thin-wrapper policy file created (armed is linkform.js + env only).
check('T4 no scripts/policies/linkdrive.js created', !fs.existsSync(path.join(REPO, 'scripts', 'policies', 'linkdrive.js')));

console.log(failures ? `TEST-FAILURES: ${failures}` : 'TEST-OK');
process.exit(failures ? 1 : 0);
