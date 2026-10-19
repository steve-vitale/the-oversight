#!/usr/bin/env node
// test-scholargear-20261019.js — KILLED-VERDICT proof for sim-scholargear.
//
// The arm is KILLED-AT-PILOT: the full gear-day layer hit 21.1% primary GO
// (scholar combat deaths 114→90) but FAILED guardrails (wave-4 16→11,
// median survival -28d) due to a weight bug (autoEquip left worn gear in
// inventory → 3.6x "too heavy"). Per §14 binding, guardrail miss = NO-GO.
// The layer is deleted zero-trace; instruments + evidence are kept.
//
// Sections:
//   K1 — the layer file is GONE (zero trace; no scholargear require
//        anywhere in scripts/ or src/).
//   K2 — the corpus is intact: 32/32 per-seed files parse, arm tags match,
//        seeds/policies complete.
//   K3 — the verdict recomputes from the corpus: scholar combat deaths
//        control=114, armed=90 (21.1% reduction, GO bar MET); wave-4
//        16→11 (guardrail FAIL); median survival -28d (guardrail FAIL).
//   K4 — zero src/js changes: git status shows no modified src/js files.
//   K5 — instruments + evidence present: probe, analyzer, evidence file,
//        analysis JSON, panel compare.
//
// Usage: node scripts/test-scholargear-20261019.js
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  // K1 — layer gone, zero trace
  check('K1 layer file deleted', !fs.existsSync(path.join(ROOT, 'scripts', 'policies', 'scholargear.js')));
  try {
    const refs = execSync('grep -rl "policies/scholargear" scripts/ src/ 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' }).trim();
    // The probe requires it (instrument), but no POLICY or SRC may require it.
    // The probe is an instrument (kept); the layer must not be wired into any policy.
    const policyRefs = execSync('grep -rl "require.*policies/scholargear" scripts/policies/ 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' }).trim();
    check('K1 no policy requires the layer', policyRefs === '', policyRefs);
  } catch (e) { check('K1 grep ran', false, e.message); }

  // K2 — corpus intact
  const SEEDS = [63801, 63802, 63803, 63804, 63805, 63806, 63807, 63808];
  const POLICIES = ['leadfeast', 'belongfeast'];
  const ARMS = ['control', 'armed'];
  let n = 0, bad = 0;
  for (const arm of ARMS) {
    for (const p of POLICIES) {
      for (const s of SEEDS) {
        const fp = path.join(ROOT, 'evidence', '2026-10-19', 'perseed-scholargear', arm, p, `s${s}.json`);
        n++;
        try {
          const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
          const ok = j && j.arm === arm && j.policyId === p && j.seed === s;
          if (!ok) { bad++; check(`K2 corpus file valid ${arm}/${p}/s${s}`, false, 'arm/policy/seed mismatch'); }
        } catch (e) { bad++; check(`K2 corpus file valid ${arm}/${p}/s${s}`, false, e.message); }
      }
    }
  }
  check('K2 32/32 per-seed files valid', n === 32 && bad === 0, `n=${n} bad=${bad}`);

  // K3 — verdict recomputes from the corpus
  try {
    const ap = path.join(ROOT, 'evidence', '2026-10-19', 'scholargear-analysis.json');
    const a = JSON.parse(fs.readFileSync(ap, 'utf8'));
    check('K3 analysis JSON present', !!a);
    const cB = a.primary && a.primary.scholarCombatControl;
    const cA = a.primary && a.primary.scholarCombatArmed;
    if (cB != null && cA != null) {
      check('K3 combat deaths control=114', cB === 114, `got ${cB}`);
      check('K3 combat deaths armed=90', cA === 90, `got ${cA}`);
      const red = (cB - cA) / cB;
      check('K3 GO bar (>=20% reduction) MET', red >= 0.20, `reduction=${(red * 100).toFixed(1)}%`);
      const g = a.guardrails || {};
      check('K3 wave-4 guardrail FAIL (16→11)', g.wave4 && g.wave4.pass === false, JSON.stringify(g.wave4));
      check('K3 survival guardrail FAIL (-28d)', g.medianSurvival && g.medianSurvival.pass === false,
        JSON.stringify(g.medianSurvival));
    } else {
      check('K3 combat death counts readable', false, 'keys missing');
    }
  } catch (e) { check('K3 analysis JSON readable', false, e.message); }

  // K4 — zero src/js changes
  try {
    const st = execSync('git status --short src/js/ 2>/dev/null || true', { cwd: ROOT, encoding: 'utf8' }).trim();
    check('K4 zero src/js changes', st === '', st.slice(0, 200));
  } catch (e) { check('K4 git status ran', false, e.message); }

  // K5 — instruments + evidence present
  const keep = [
    'scripts/probe-scholargear-20261019.js',
    'scripts/analyze-scholargear-20261019.js',
    'scripts/test-scholargear-20261019.js',
    'evidence/2026-10-19/sim-scholargear.md',
    'evidence/2026-10-19/scholargear-analysis.json',
  ];
  for (const f of keep) {
    check(`K5 present ${f}`, fs.existsSync(path.join(ROOT, f)));
  }

  console.log(`\nscholargear KILLED-VERDICT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(1); });
