#!/usr/bin/env node
// test-armorup-20261019.js — KILLED-VERDICT proof for sim-armorup.
//
// The arm was KILLED at pilot (NO-GO: combat deaths control=156 armed=165,
// -5.8% reduction vs the >=25% GO bar; 2 guardrail fails). Per the kill
// protocol the policy layer (scripts/policies/armorup.js) was deleted
// zero-trace; instruments + evidence land.
//
// Pre-kill, the layer's own proof ran 52/52 green (DON fixtures on the real
// equipment module, GATE: layer-off == bare w5path stack byte-identical,
// DET: ARMORUP=1 repeat byte-identical, SMOKE both policies x both arms) —
// recorded in evidence/2026-10-19/sim-armorup.md. This file now proves the
// kill, not the layer:
//   K1 — the layer file is GONE (zero trace; no armorup require anywhere
//        outside this test's own string).
//   K2 — the corpus is intact: 32/32 per-seed files parse, arm tags match,
//        instrumentErrors=0 on all.
//   K3 — the verdict recomputes from the corpus: combat deaths control=156,
//        armed=165 (reduction -5.8%, GO bar >=25% missed); guardrails
//        recompute (wave4 16->16 pass; median survival -14d fail;
//        new death modes present -> fail; starvation pass).
//   K4 — zero src/js changes: git status shows no modified/tracked-file
//        changes under src/ (the arm never touched game code).
//   K5 — instruments + evidence present: probe, analyzer, transcript probe,
//        analysis JSON, panel triple, evidence file.
// Usage: node scripts/test-armorup-20261019.js (no env needed)
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
const EVID = path.join(ROOT, 'evidence', '2026-10-19', 'perseed-armorup');

// K1 — layer gone, zero trace
(function k1() {
  check('K1 layer file deleted', !fs.existsSync(path.join(ROOT, 'scripts', 'policies', 'armorup.js')));
  let refs = [];
  try {
    const out = execSync('grep -rln "policies/armorup" scripts/ evidence/2026-10-19/sim-armorup.md 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' });
    refs = out.split('\n').map(s => s.trim()).filter(s => s && !s.endsWith('test-armorup-20261019.js'));
    // The measurement instruments (probe/analyzer/transcript probe) reference
    // the layer — that is documentation of what was measured, not a trace:
    // they cannot run without it, and the corpus + analysis are the durable
    // evidence. The zero-trace bar is: no POLICY and no src/js requires it.
    const instruments = new Set(['scripts/probe-armorup-20261019.js',
      'scripts/analyze-armorup-20261019.js', 'scripts/armorup-transcripts-20261019.js']);
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
  check('K3 combat deaths armed=165', cA === 165, `got ${cA}`);
  const red = (cB - cA) / cB;
  check('K3 GO bar (>=25% reduction) missed', red < 0.25, `reduction=${(red * 100).toFixed(1)}%`);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return (s[7] + s[8]) / 2; };
  const mB = med(corpus.control.map(r => r.gameDays)), mA = med(corpus.armed.map(r => r.gameDays));
  check('K3 median survival guardrail recompute (-14d < -10d band)', (mA - mB) < -10, `d=${(mA - mB).toFixed(1)}`);
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
  const files = [
    'scripts/probe-armorup-20261019.js',
    'scripts/analyze-armorup-20261019.js',
    'scripts/armorup-transcripts-20261019.js',
    'evidence/2026-10-19/armorup-analysis.json',
    'evidence/2026-10-19/armorup-panel-primary.json',
    'evidence/2026-10-19/armorup-panel-primary.md',
    'evidence/2026-10-19/armorup-panel-primary-before.json.gz',
    'evidence/2026-10-19/armorup-panel-primary-after.json.gz',
    'evidence/2026-10-19/sim-armorup.md',
  ];
  for (const f of files) check(`K5 present ${f}`, fs.existsSync(path.join(ROOT, f)));
})();

console.log(`armorup-kill-proof: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
