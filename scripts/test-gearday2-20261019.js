#!/usr/bin/env node
// test-gearday2-20261019.js — KILLED-VERDICT proof for sim-gearday2.
//
// The arm is KILLED-AT-PILOT: the weight-honest gear-day re-arm (named next
// #1 of the killed sim-scholargear arm) moved the primary 107->86 scholar
// combat deaths (-19.6%, GO bar >=20% MISSED by 0.4pp) and FAILED three
// guardrails (wave-4 16->12 vs +-2 band; median survival 122.5d->93.5d vs
// -10d band; "too heavy" rate 1.6x vs 1.5x band). Per §14 binding, primary
// miss + guardrail miss = NO-GO. The layer is deleted zero-trace;
// instruments + evidence are kept.
//
// Pre-kill, the layer's own proof ran 32/32 green (DON fixtures on the live
// engine: D0 stash fetch + verb-equip + P>=10; D0b weight regression — no
// worn item double-counted in inventory; D0c read path — fake person-record
// melee ignored; D1 away-from-Haven; D2 replaced piece returns to
// inventory; D3 other-villager stash untouched; D4 keepsakes/acc untouched;
// D5 idempotent; D6 gate-off == bare daily; GATE 3 seeds byte-identical;
// DET repeat byte-identical; SMOKE both policies x both arms with the
// weight invariant held) — recorded in evidence/2026-10-19/sim-gearday2.md.
// This file now proves the kill, not the layer:
//   K1 — the layer file is GONE (zero trace; no policy or src/js requires it).
//   K2 — the corpus is intact: 32/32 per-seed files parse, arm tags match,
//        instrumentErrors=0 on all.
//   K3 — the verdict recomputes from the corpus: scholar combat deaths
//        control=107, armed=86 (19.6% reduction, GO bar >=20% MISSED);
//        wave-4 16->12 (guardrail FAIL); median survival -29d (guardrail
//        FAIL); tooHeavy rate 1.6x (guardrail FAIL); new modes none (PASS);
//        starvation flat (PASS).
//   K4 — zero src/js changes: git status shows no modified src/js files.
//   K5 — instruments + evidence present: probe, analyzer, evidence file,
//        analysis JSON, panel compare triple.
//
// Usage: node scripts/test-gearday2-20261019.js (no env needed)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-19', 'perseed-gearday2');

// K1 — layer gone, zero trace
(function k1() {
  check('K1 layer file deleted', !fs.existsSync(path.join(ROOT, 'scripts', 'policies', 'gearday2.js')));
  let refs = [];
  try {
    const out = execSync('grep -rln "policies/gearday2" scripts/ 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' });
    refs = out.split('\n').map(s => s.trim()).filter(s => s && !s.endsWith('test-gearday2-20261019.js'));
    // The measurement instruments (probe/analyzer) reference the layer —
    // documentation of what was measured, not a trace: they cannot run
    // without it, and the corpus + analysis are the durable evidence.
    // The zero-trace bar is: no POLICY and no src/js requires it.
    const instruments = new Set(['scripts/probe-gearday2-20261019.js',
      'scripts/analyze-gearday2-20261019.js']);
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
  const isScholarCombat = (d) => d && d.player && ['raid', 'wild', 'patrol'].includes(d.channel) &&
    (CC.has(String(d.cause)) || MON.has(String(d.cause).toLowerCase()) || String(d.cause).startsWith('split-fight:'));
  const isStarv = (d) => d && d.channel === 'haven' && String(d.cause || '').toLowerCase() === 'starvation';
  const sc = (rows) => rows.reduce((t, r) =>
    t + ((r.deathsAttributed.attributed) || []).filter(isScholarCombat).length, 0);
  const cB = sc(corpus.control), cA = sc(corpus.armed);
  check('K3 scholar combat deaths control=107', cB === 107, `got ${cB}`);
  check('K3 scholar combat deaths armed=86', cA === 86, `got ${cA}`);
  const red = (cB - cA) / cB;
  check('K3 GO bar (>=20% reduction) MISSED', red < 0.20, `reduction=${(red * 100).toFixed(1)}%`);
  const w4 = (rows) => rows.reduce((t, r) => t + (r.wave45 ? 1 : 0), 0);
  const w4B = w4(corpus.control), w4A = w4(corpus.armed);
  check('K3 wave-4 guardrail recompute (16->12, band +-2: FAIL)', w4B === 16 && w4A === 12 && Math.abs(w4A - w4B) > 2,
    `w4=${w4B}->${w4A}`);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return (s[7] + s[8]) / 2; };
  const mB = med(corpus.control.map(r => r.gameDays)), mA = med(corpus.armed.map(r => r.gameDays));
  check('K3 median survival guardrail recompute (-29d < -10d band: FAIL)', (mA - mB) < -10, `d=${(mA - mB).toFixed(1)}`);
  const th = (rows) => rows.reduce((t, r) => t + (r.tooHeavy | 0), 0);
  const dy = (rows) => Math.max(1, rows.reduce((t, r) => t + (r.gameDays | 0), 0));
  const rateB = th(corpus.control) / dy(corpus.control), rateA = th(corpus.armed) / dy(corpus.armed);
  check('K3 tooHeavy rate guardrail recompute (1.6x > 1.5x band: FAIL)', rateB > 0 && (rateA / rateB) > 1.5,
    `rate=${rateB.toFixed(3)}->${rateA.toFixed(3)} (${(rateA / rateB).toFixed(2)}x)`);
  const causesB = new Set();
  corpus.control.forEach(r => ((r.deathsAttributed.attributed) || []).forEach(d => causesB.add(String(d.cause || 'unknown'))));
  const armedCounts = {};
  corpus.armed.forEach(r => ((r.deathsAttributed.attributed) || []).forEach(d => {
    const c = String(d.cause || 'unknown'); armedCounts[c] = (armedCounts[c] || 0) + 1;
  }));
  const newModes = Object.keys(armedCounts).filter(c => !causesB.has(c) && armedCounts[c] >= 2);
  check('K3 no new death modes (PASS)', newModes.length === 0, newModes.join(','));
  let starvFail = false;
  const bMap = new Map();
  corpus.control.forEach(r => bMap.set(r.policyId + '/s' + r.seed, r));
  for (const r of corpus.armed) {
    const b = bMap.get(r.policyId + '/s' + r.seed);
    const sA = ((r.deathsAttributed.attributed) || []).filter(isStarv).length;
    const sB = b ? ((b.deathsAttributed.attributed) || []).filter(isStarv).length : 0;
    if (sA - sB > 1) starvFail = true;
  }
  check('K3 starvation guardrail (PASS)', !starvFail);
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
    'scripts/probe-gearday2-20261019.js',
    'scripts/analyze-gearday2-20261019.js',
    'evidence/2026-10-19/sim-gearday2.md',
    'evidence/2026-10-19/gearday2-analysis.json',
    'evidence/2026-10-19/gearday2-panel-primary.json',
    'evidence/2026-10-19/gearday2-panel-primary.md',
    'evidence/2026-10-19/gearday2-panel-primary-before.json.gz',
    'evidence/2026-10-19/gearday2-panel-primary-after.json.gz',
  ];
  for (const f of files) check('K5 present ' + f, fs.existsSync(path.join(ROOT, f)));
})();

console.log(`\ngearday2 KILLED-VERDICT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
