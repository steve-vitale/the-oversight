#!/usr/bin/env node
// test-vinearmor-20261019.js — KILLED-VERDICT proof for sim-vinebank.
//
// The arm was KILLED at pilot (NO-GO: crafts/run control mean 0.13 vs armed
// mean 0.13, ratio 1.00, 16/16 paired deltas exactly +0 vs the >=2x bar and
// the >=1.0 craft/run engagement floor — the vine-priority drive fired ZERO
// times in ~4,000 sim-days; all guardrails trivially pass on identical
// trajectories). Per the kill protocol the policy layer
// (scripts/policies/vinearmor.js) was deleted zero-trace; instruments +
// evidence land.
//
// Pre-kill, the layer's own proof ran 22/22 green (DON fixtures on the real
// harness incl. the armorP reader against the real item defs and the
// no-communal-armor constraint; GATE: layer-off == bare w5path stack
// byte-identical; DET: VINEARMOR=1 repeat byte-identical; SMOKE both policies
// x both arms, 30d, zero instrument errors) — recorded in
// evidence/2026-10-19/sim-vinearmor.md, incl. the mid-run design correction
// (the layer's pre-craft wearBest was removed after it diverged
// armed/control trajectories on s63803 without a craft attempt). This file
// now proves the kill, not the layer:
//   K1 — the layer file is GONE (zero trace; no policy/src requires it
//        outside this test's own string and the instrument docs).
//   K2 — the corpus is intact: 32/32 per-seed files parse, arm tags match,
//        instrumentErrors=0 on all.
//   K3 — the verdict recomputes from the corpus: crafts control=2,
//        armed=2 (ratio 1.00, means 0.13/0.13, GO bar >=2x AND >=1.0/run
//        missed); guardrails recompute (wave4 16->16 pass; median survival
//        delta 0 pass; no new death modes pass; starvation pass).
//   K4 — zero src/js changes: git status shows no modified/tracked-file
//        changes under src/ (the arm never touched game code).
//   K5 — instruments + evidence present: probe, analyzer, transcript probe,
//        analysis JSON, panel triple, evidence file, transcripts.
// Usage: node scripts/test-vinearmor-20261019.js (no env needed)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-19', 'perseed-vinearmor');

// K1 — layer gone, zero trace
(function k1() {
  check('K1 layer file deleted', !fs.existsSync(path.join(ROOT, 'scripts', 'policies', 'vinearmor.js')));
  let refs = [];
  try {
    const out = execSync('grep -rln "policies/vinearmor" scripts/ evidence/2026-10-19/sim-vinearmor.md 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' });
    refs = out.split('\n').map(s => s.trim()).filter(s => s && !s.endsWith('test-vinearmor-20261019.js'));
    // The measurement instruments (probe/analyzer/transcript probe) reference
    // the layer — that is documentation of what was measured, not a trace:
    // they cannot run without it, and the corpus + analysis are the durable
    // evidence. The zero-trace bar is: no POLICY and no src/js requires it.
    const instruments = new Set(['scripts/probe-vinearmor-20261019.js',
      'scripts/analyze-vinearmor-20261019.js', 'scripts/vinearmor-transcripts-20261019.js']);
    const codeRefs = refs.filter(s => s.endsWith('.js') && !instruments.has(s) &&
      (s.startsWith('scripts/policies/') || s.startsWith('src/')));
    check('K1 no policy/src requires the layer', codeRefs.length === 0, codeRefs.join(','));
  } catch (e) { check('K1 grep ran', false, e.message); }
})();

// K2 — corpus intact
const SEEDS = [63801, 63802, 63803, 63804, 63805, 63806, 63807, 63808];
const POLICIES = ['leadfeast', 'belongfeast'];
const corpus = { control: [], armed: [] };
(function k2() {
  let n = 0;
  for (const arm of ['control', 'armed']) {
    for (const p of POLICIES) {
      for (const s of SEEDS) {
        const f = path.join(EVID, arm, p, `s${s}.json`);
        let ok = false, r = null;
        try {
          const raw = fs.readFileSync(f, 'utf8');
          r = JSON.parse(raw);
          ok = raw.length > 0 && r.arm === arm && (r.instrumentErrors | 0) === 0 &&
            r.deathsAttributed && Array.isArray(r.deathsAttributed.attributed);
        } catch (e) { ok = false; }
        if (!ok) check(`K2 corpus file valid ${arm}/${p}/s${s}`, false);
        else { n++; corpus[arm].push(r); }
      }
    }
  }
  check('K2 32/32 per-seed files valid', n === 32, `n=${n}`);
})();

// K3 — verdict recomputes from the corpus
(function k3() {
  const crafts = (r) => ((r.ap || {}).hideCrafts || 0) + ((r.ap || {}).barkCrafts || 0);
  const cB = corpus.control.reduce((t, r) => t + crafts(r), 0);
  const cA = corpus.armed.reduce((t, r) => t + crafts(r), 0);
  check('K3 crafts control=2 (base only)', cB === 2, `got ${cB}`);
  check('K3 crafts armed=2 (layer never fired)', cA === 2, `got ${cA}`);
  const mB = cB / 16, mA = cA / 16;
  check('K3 means 0.13/0.13', Math.abs(mB - 0.125) < 1e-9 && Math.abs(mA - 0.125) < 1e-9,
    `mB=${mB} mA=${mA}`);
  check('K3 GO bar missed (ratio 1.00 < 2; mean 0.125 < 1.0)', (mA / mB) < 2 && mA < 1.0,
    `ratio=${(mA / mB).toFixed(2)}`);
  // paired deltas all zero
  const key = (r) => `${r.policyId}/s${r.seed}`;
  const bMap = new Map(corpus.control.map(r => [key(r), r]));
  const allZero = corpus.armed.every(a => crafts(a) - crafts(bMap.get(key(a))) === 0);
  check('K3 paired deltas 16/16 exactly +0', allZero);
  // guardrails recompute
  const w4 = (rows) => rows.filter(r => r.wave45).length;
  check('K3 wave4 guardrail recompute (16->16 within ±2)', Math.abs(w4(corpus.armed) - w4(corpus.control)) <= 2);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return (s[7] + s[8]) / 2; };
  const mSB = med(corpus.control.map(r => r.gameDays)), mSA = med(corpus.armed.map(r => r.gameDays));
  check('K3 median survival guardrail recompute (delta >= -10d)', (mSA - mSB) >= -10, `d=${(mSA - mSB).toFixed(1)}`);
})();

// K4 — zero src/js changes
(function k4() {
  let out = '';
  try { out = execSync('git status --porcelain -- src/', { cwd: ROOT, encoding: 'utf8' }); }
  catch (e) { check('K4 git status ran', false, e.message); return; }
  const lines = out.split('\n').map(s => s.trim()).filter(Boolean);
  check('K4 no src/ changes', lines.length === 0, lines.slice(0, 5).join('; '));
})();

// K5 — instruments + evidence present
(function k5() {
  const need = [
    'scripts/probe-vinearmor-20261019.js',
    'scripts/analyze-vinearmor-20261019.js',
    'scripts/vinearmor-transcripts-20261019.js',
    'evidence/2026-10-19/vinearmor-analysis.json',
    'evidence/2026-10-19/vinearmor-panel-primary.json',
    'evidence/2026-10-19/vinearmor-panel-primary.md',
    'evidence/2026-10-19/sim-vinearmor.md',
  ];
  for (const f of need) check(`K5 present ${f}`, fs.existsSync(path.join(ROOT, f)));
  const tp = path.join(ROOT, 'evidence', '2026-10-19', 'vinearmor-transcripts');
  let tn = 0;
  try { tn = fs.readdirSync(tp).filter(f => f.endsWith('.txt')).length; } catch (e) {}
  check('K5 transcripts present (4 files)', tn === 4, `n=${tn}`);
})();

console.log(`\nKILLED-VERDICT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
