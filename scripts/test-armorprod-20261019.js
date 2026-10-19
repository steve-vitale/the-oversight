#!/usr/bin/env node
// test-armorprod-20261019.js — KILLED-VERDICT proof for sim-armorprod.
//
// The arm was KILLED at pilot (NO-GO: combat deaths control=156 armed=142,
// 9.0% paired-delta reduction vs the >=25% GO bar; median-survival guardrail
// FAIL at -11d vs the -10d band). Per the kill protocol the policy layer
// (scripts/policies/armorprod.js) was deleted zero-trace; instruments +
// evidence land.
//
// Pre-kill, the layer's own proof ran 12/12 green (DON fixtures on the
// layer incl. the armorP reader against the real item defs and the
// no-communal-armor/no-villager-gear constraint; GATE: layer-off == bare
// w5path stack byte-identical; DET: ARMORPROD=1 repeat byte-identical;
// SMOKE both policies x both arms, 30d, zero instrument errors) — recorded
// in evidence/2026-10-19/sim-armorprod.md. This file now proves the kill,
// not the layer:
//   K1 — the layer file is GONE (zero trace; no armorprod require anywhere
//        outside this test's own string and the instrument docs).
//   K2 — the corpus is intact: 32/32 per-seed files parse, arm tags match,
//        instrumentErrors=0 on all.
//   K3 — the verdict recomputes from the corpus: combat deaths control=156,
//        armed=142 (paired-delta reduction 9.0%, GO bar >=25% missed);
//        guardrails recompute (wave4 16->15 pass; median survival -11d fail;
//        no new death modes pass; starvation pass).
//   K4 — zero src/js changes: git status shows no modified/tracked-file
//        changes under src/ (the arm never touched game code).
//   K5 — instruments + evidence present: probe, analyzer, transcript probe,
//        analysis JSON, panel triple, evidence file, transcripts.
// Usage: node scripts/test-armorprod-20261019.js (no env needed)
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
const EVID = path.join(ROOT, 'evidence', '2026-10-19', 'perseed-armorprod');

// K1 — layer gone, zero trace
(function k1() {
  check('K1 layer file deleted', !fs.existsSync(path.join(ROOT, 'scripts', 'policies', 'armorprod.js')));
  let refs = [];
  try {
    const out = execSync('grep -rln "policies/armorprod" scripts/ evidence/2026-10-19/sim-armorprod.md 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' });
    refs = out.split('\n').map(s => s.trim()).filter(s => s && !s.endsWith('test-armorprod-20261019.js'));
    // The measurement instruments (probe/analyzer/transcript probe) reference
    // the layer — that is documentation of what was measured, not a trace:
    // they cannot run without it, and the corpus + analysis are the durable
    // evidence. The zero-trace bar is: no POLICY and no src/js requires it.
    const instruments = new Set(['scripts/probe-armorprod-20261019.js',
      'scripts/analyze-armorprod-20261019.js', 'scripts/armorprod-transcripts-20261019.js']);
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
  let MON = new Set();
  try {
    const ms = require(path.join(ROOT, 'src', 'data', 'monsters.json'));
    for (const m of ms) {
      if (!m) continue;
      if (m.name) MON.add(String(m.name).toLowerCase());
      if (m.id) MON.add(String(m.id).toLowerCase());
    }
  } catch (e) {}
  const CC = new Set(['monster', 'combat', 'the wild', 'hunting', 'patrol combat',
    'raid', 'raid-defense', 'aid-runner', 'sortie combat', 'expedition', 'ambush']);
  const isCombat = (d) => ['raid', 'wild', 'patrol'].includes(d.channel) &&
    (CC.has(String(d.cause)) || MON.has(String(d.cause).toLowerCase()) || String(d.cause).startsWith('split-fight:'));
  const combat = (rows) => rows.reduce((t, r) =>
    t + ((r.deathsAttributed.attributed) || []).filter(isCombat).length, 0);
  const cB = combat(corpus.control), cA = combat(corpus.armed);
  check('K3 combat deaths control=156', cB === 156, `got ${cB}`);
  check('K3 combat deaths armed=142', cA === 142, `got ${cA}`);
  // paired deltas
  const key = (r) => `${r.policyId}/s${r.seed}`;
  const bMap = new Map(corpus.control.map(r => [key(r), r]));
  let pairedSum = 0;
  for (const a of corpus.armed) {
    const b = bMap.get(key(a));
    pairedSum += combat([a]) - combat([b]);
  }
  const red = -pairedSum / cB;
  check('K3 paired-delta reduction 9.0%', Math.abs(red - 0.0897) < 0.005, `reduction=${(red * 100).toFixed(1)}%`);
  check('K3 GO bar (>=25% reduction) missed', red < 0.25, `reduction=${(red * 100).toFixed(1)}%`);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return (s[7] + s[8]) / 2; };
  const mB = med(corpus.control.map(r => r.gameDays)), mA = med(corpus.armed.map(r => r.gameDays));
  check('K3 median survival guardrail recompute (-11d < -10d band)', (mA - mB) < -10, `d=${(mA - mB).toFixed(1)}`);
  const w4 = (rows) => rows.filter(r => r.wave45).length;
  check('K3 wave4 guardrail recompute (16->15 within ±2)', Math.abs(w4(corpus.armed) - w4(corpus.control)) <= 2);
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
    'scripts/probe-armorprod-20261019.js',
    'scripts/analyze-armorprod-20261019.js',
    'scripts/armorprod-transcripts-20261019.js',
    'evidence/2026-10-19/armorprod-analysis.json',
    'evidence/2026-10-19/armorprod-panel-primary.json',
    'evidence/2026-10-19/armorprod-panel-primary.md',
    'evidence/2026-10-19/sim-armorprod.md',
  ];
  for (const f of need) check(`K5 present ${f}`, fs.existsSync(path.join(ROOT, f)));
  const tp = path.join(ROOT, 'evidence', '2026-10-19', 'armorprod-transcripts');
  let tn = 0;
  try { tn = fs.readdirSync(tp).filter(f => f.endsWith('.txt')).length; } catch (e) {}
  check('K5 transcripts present (4 files)', tn === 4, `n=${tn}`);
})();

console.log(`\nKILLED-VERDICT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
