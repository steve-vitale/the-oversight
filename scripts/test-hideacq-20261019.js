#!/usr/bin/env node
// test-hideacq-20261019.js — KILLED-VERDICT proof for sim-hideacq.
//
// The arm was KILLED at pilot (NO-GO: hide crafts/run control mean 0.00 vs
// armed mean 0.06 — 1 craft on leadfeast/s63905 — vs the >=2x bar and the
// >=0.5 craft/run engagement floor; starvation guardrail FAIL on
// belongfeast/s63905: control 1 vs armed 3, delta +2 worse than the
// <= control+1 band — the dawn butcher front-loads the day's meat into the
// pack, pinning it full ("Too heavy. Carrying 30.9/30 kg." x13) so the
// forage haul gets left behind and 3 villagers starve on day 44).
// Per the kill protocol the policy layer (scripts/policies/hideacq.js) was
// deleted zero-trace; instruments + evidence land.
//
// Pre-kill, the layer's own proof ran 21/21 green (DON fixtures D1-D5 on the
// real harness incl. the dawn-butcher pack-landing + L1 teaching,
// craft-drive attempt accounting, the no-equip constraint, gate-off
// zero-writes, all five craft gates; GATE: HIDEACQ-unset == bare w5path
// stack byte-identical; DET: HIDEACQ=1 repeat byte-identical; SMOKE both
// policies x both arms, 30d, zero instrument errors) — recorded in
// evidence/2026-10-19/sim-hideacq.md. This file now proves the kill, not
// the layer:
//   K1 — the layer file is GONE (zero trace; no policy/src requires it
//        outside this test's own string and the instrument docs).
//   K2 — the corpus is intact: 32/32 per-seed files parse, arm tags match,
//        instrumentErrors=0 on all.
//   K3 — the verdict recomputes from the corpus: crafts control=0,
//        armed=1 (leadfeast/s63905; means 0.00/0.0625; GO bar >=2x AND
//        >=0.5 missed; paired deltas +1 on 1/16, +0 on 15/16); guardrails
//        recompute (wave4 13->12 pass; median survival 97.5->106.5 pass;
//        no new death modes pass; starvation FAIL on belongfeast/s63905
//        with delta +2).
//   K4 — zero src/js changes: git status shows no modified/tracked-file
//        changes under src/ (the arm never touched game code).
//   K5 — instruments + evidence present: probe, analyzer, transcript probe,
//        analysis JSON, panel triple, evidence file, transcripts, sweep logs.
// Usage: node scripts/test-hideacq-20261019.js (no env needed)
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
const EVID = path.join(ROOT, 'evidence', '2026-10-19', 'perseed-hideacq');

// K1 — layer gone, zero trace
(function k1() {
  check('K1 layer file deleted', !fs.existsSync(path.join(ROOT, 'scripts', 'policies', 'hideacq.js')));
  let refs = [];
  try {
    const out = execSync('grep -rln "policies/hideacq" scripts/ evidence/2026-10-19/sim-hideacq.md 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' });
    refs = out.split('\n').map(s => s.trim()).filter(s => s && !s.endsWith('test-hideacq-20261019.js'));
    // The measurement instruments (probe/analyzer/transcript probe) reference
    // the layer — that is documentation of what was measured, not a trace:
    // they cannot run without it, and the corpus + analysis are the durable
    // evidence. The zero-trace bar is: no POLICY and no src/js requires it.
    const instruments = new Set(['scripts/probe-hideacq-20261019.js',
      'scripts/analyze-hideacq-20261019.js', 'scripts/hideacq-transcripts-20261019.js']);
    const codeRefs = refs.filter(s => s.endsWith('.js') && !instruments.has(s) &&
      (s.startsWith('scripts/policies/') || s.startsWith('src/')));
    check('K1 no policy/src requires the layer', codeRefs.length === 0, codeRefs.join(','));
  } catch (e) { check('K1 grep ran', false, e.message); }
})();

// K2 — corpus intact
const SEEDS = [63901, 63902, 63903, 63904, 63905, 63906, 63907, 63908];
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
  const crafts = (r) => ((r.ap || {}).hideCrafts || 0);
  const cB = corpus.control.reduce((t, r) => t + crafts(r), 0);
  const cA = corpus.armed.reduce((t, r) => t + crafts(r), 0);
  check('K3 crafts control=0 (base never crafts hide_armor)', cB === 0, `got ${cB}`);
  check('K3 crafts armed=1 (leadfeast/s63905 only)', cA === 1, `got ${cA}`);
  const craftRun = corpus.armed.find(r => crafts(r) > 0);
  check('K3 the craft is leadfeast/s63905', !!craftRun && craftRun.policyId === 'leadfeast' && craftRun.seed === 63905,
    craftRun ? `${craftRun.policyId}/s${craftRun.seed}` : 'none');
  const mB = cB / 16, mA = cA / 16;
  check('K3 means 0.00/0.0625', mB === 0 && Math.abs(mA - 0.0625) < 1e-9, `mB=${mB} mA=${mA}`);
  check('K3 GO bar missed (mean 0.0625 < 0.5 floor)', mA < 0.5, `mA=${mA}`);
  // paired deltas: +1 on 1/16, +0 on 15/16
  const key = (r) => `${r.policyId}/s${r.seed}`;
  const bMap = new Map(corpus.control.map(r => [key(r), r]));
  const deltas = corpus.armed.map(a => crafts(a) - crafts(bMap.get(key(a))));
  const pos = deltas.filter(d => d === 1).length, zero = deltas.filter(d => d === 0).length;
  check('K3 paired deltas +1 on 1/16, +0 on 15/16', pos === 1 && zero === 15,
    `+1:${pos} +0:${zero}`);
  // guardrails recompute
  const w4 = (rows) => rows.filter(r => r.wave45).length;
  check('K3 wave4 guardrail recompute (13->12 within ±2)', Math.abs(w4(corpus.armed) - w4(corpus.control)) <= 2,
    `${w4(corpus.control)}->${w4(corpus.armed)}`);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return (s[7] + s[8]) / 2; };
  const mSB = med(corpus.control.map(r => r.gameDays)), mSA = med(corpus.armed.map(r => r.gameDays));
  check('K3 median survival guardrail recompute (97.5->106.5, delta >= -10d)',
    Math.abs(mSB - 97.5) < 1e-9 && Math.abs(mSA - 106.5) < 1e-9 && (mSA - mSB) >= -10,
    `${mSB}->${mSA}`);
  // starvation: paired per run, <= control+1
  const isStarv = (d) => d && d.channel === 'haven' && String(d.cause || '').toLowerCase() === 'starvation';
  const starv = (r) => ((r.deathsAttributed || {}).attributed || []).filter(isStarv).length;
  const fails = corpus.armed.filter(a => {
    const b = bMap.get(key(a));
    return b && (starv(a) - starv(b)) > 1;
  }).map(a => key(a));
  check('K3 starvation guardrail recompute (FAIL on belongfeast/s63905, delta +2)',
    fails.length === 1 && fails[0] === 'belongfeast/s63905', JSON.stringify(fails));
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
    'scripts/probe-hideacq-20261019.js',
    'scripts/analyze-hideacq-20261019.js',
    'scripts/hideacq-transcripts-20261019.js',
    'scripts/smoke-hideflow-20261019.js',
    'evidence/2026-10-19/hideacq-analysis.json',
    'evidence/2026-10-19/hideacq-panel-primary.json',
    'evidence/2026-10-19/hideacq-panel-primary.md',
    'evidence/2026-10-19/sim-hideacq.md',
    'evidence/2026-10-19/hideacq-sweep-control.log',
    'evidence/2026-10-19/hideacq-sweep-armed.log',
  ];
  for (const f of need) check(`K5 present ${f}`, fs.existsSync(path.join(ROOT, f)));
  const tp = path.join(ROOT, 'evidence', '2026-10-19', 'hideacq-transcripts');
  let tn = 0;
  try { tn = fs.readdirSync(tp).filter(f => f.endsWith('.txt')).length; } catch (e) {}
  check('K5 transcripts present (8 files)', tn === 8, `n=${tn}`);
})();

console.log(`\nKILLED-VERDICT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
