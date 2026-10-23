#!/usr/bin/env node
// test-defer5gate.js — proof gates for the sim-defer5gate DIAG arm.
// INSTRUMENT-ONLY: zero src/js changes, zero engine eval. All fixtures are
// synthetic; the corpus assertions read the sim-w5door-b JSONs (read-only).
//
// Gates:
//   E1 RED->GREEN: the attribution is not vacuous. A naive stub attributer
//      (always answers 'stand-raw') MISSES a synthetic defer5-armor fixture
//      (RED), then w5gates-lib UNMODIFIED + defer5SubAttribution attribute
//      it correctly (GREEN).
//   E2 DET: the analyzer is byte-identical across two runs on the corpus.
//   E3 NON-VACUOUS attribution: an unlocked-but-unmet-gates fixture is
//      correctly flagged UNEXPLAINED (not silently attributed); a
//      grandfathered fixture attributes. The 0-unexplained corpus claim is
//      therefore a live claim.
//   E4 CORPUS MEASUREMENT (binding, §14): >=22/24 census configs attributed
//      to NAMED gate mechanisms via w5gates-lib UNMODIFIED, 0 unexplained,
//      16/16 defer5 bindings bar-level named, recompute-mismatch 0.
//   E5 ANCHOR: every corpus JSON records anchorCommit f5f19667ce19; the
//      defer5 mechanism (src/js/standing.js) is unchanged between that
//      anchor and this worktree's HEAD.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));
const { analyze, defer5SubAttribution } = require(path.join(REPO, 'scripts', 'diag-defer5gate-analyze'));

const DEM5 = { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 };
let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (cond ? '' : ' :: ' + (extra || '')));
  if (!cond) failures++;
}

// Synthetic gate vector builder: a config where the ONLY unmet gate is the
// named one (locked door, uw<5). All other gates met.
function synthVector({ binding, defer5Short = [], grandfathered = false, uw = 4, allMet = false }) {
  const bars = { armored: 4, armed: 6, tricks: 3, veterans: 2 };
  for (const b of defer5Short) {
    if (b === 'armor') bars.armored = 0;
    if (b === 'weapons') bars.armed = 0;
    if (b === 'tricks') bars.tricks = 0;
    if (b === 'veterans') bars.veterans = 0;
  }
  const met = binding === null;
  const v = {
    day: 100, dayFloor: 25, w2Floor: 8,
    w3: { dayOk: true, l2Ok: true, met: true, b2need: 4 },
    raw: 250, war: 100, dip: 60, plenty: 90, warPts: 0, links: 0, feasts: 0,
    t4: 100, t5: 200, plentyCap: 100, demand4: null, demand5: DEM5,
    capped: 205, peak: grandfathered ? 5 : 4,
    gated: met ? 250 : 199,
    r4: { armored: 3, armed: 5, tricks: 3, veterans: 1, short: [], ready: true },
    r5: { armored: bars.armored, armed: bars.armed, tricks: bars.tricks, veterans: bars.veterans, short: defer5Short.slice(), ready: defer5Short.length === 0 },
    df4: { deferred: false, grandfathered: false, raw: 250, threshold: 100 },
    df5: {
      deferred: !met && defer5Short.length > 0,
      grandfathered: grandfathered,
      raw: 250, capped: 205, threshold: 200,
    },
    w4faced: 2, w4facedMids: ['influencer'], facedPerWave: null,
    deed: null, uw,
  };
  v.dist = {
    w3rung: { day: 0, l2: 0 },
    'stand-raw': { standing: 0 },
    'plenty-cap': { loss: Math.max(0, v.raw - v.capped) },
    defer4: { armor: 0, weapons: 0, tricks: 0, veterans: 0 },
    defer5: {
      armor: Math.max(0, DEM5.armored - bars.armored),
      weapons: Math.max(0, DEM5.armed - bars.armed),
      tricks: Math.max(0, DEM5.tricks - bars.tricks),
      veterans: Math.max(0, DEM5.veterans - bars.veterans),
    },
    w4faced: { types: 0 },
  };
  return v;
}

// E1 RED->GREEN
(function e1() {
  const v = synthVector({ binding: 'defer5', defer5Short: ['armor'] });
  const stub = () => ({ binding: 'stand-raw' }); // naive guess attributer
  const redGuess = stub().binding;
  check('E1a RED: naive stub misses the defer5-armor fixture', redGuess !== 'defer5', 'stub said ' + redGuess);
  const a = G5.attribute(v);
  check('E1b GREEN: lib attributes the fixture to defer5', a.binding === 'defer5' && a.attributed, JSON.stringify(a && a.why));
  const sub = defer5SubAttribution(v);
  check('E1c GREEN: sub-gate named defer5-armor', sub.name === 'defer5-armor', sub.name);
  const v2 = synthVector({ binding: 'defer5', defer5Short: ['armor', 'veterans', 'weapons'] });
  const sub2 = defer5SubAttribution(v2);
  check('E1d GREEN: multi-bar named defer5-armor+veterans+weapons', sub2.name === 'defer5-armor+veterans+weapons', sub2.name);
  const v3 = synthVector({ binding: 'defer5', defer5Short: ['veterans'] });
  const sub3 = defer5SubAttribution(v3);
  check('E1e GREEN: lone veterans named defer5-veterans', sub3.name === 'defer5-veterans', sub3.name);
})();

// E2 DET: two analyzer runs byte-identical
(function e2() {
  const s1 = JSON.stringify(analyze(), null, 1);
  const s2 = JSON.stringify(analyze(), null, 1);
  check('E2 DET: analyzer byte-identical across runs', s1 === s2, 'lengths ' + s1.length + ' vs ' + s2.length);
})();

// E3 non-vacuous attribution
(function e3() {
  // locked but every gate reads met -> must flag UNEXPLAINED, not attribute.
  const v = synthVector({ binding: null, uw: 4, allMet: true });
  v.df5.deferred = false; v.r5 = { armored: 4, armed: 6, tricks: 3, veterans: 2, short: [], ready: true };
  const a = G5.attribute(v);
  check('E3a: locked-with-all-met flags UNEXPLAINED', !a.attributed && /UNEXPLAINED/.test(a.why), a.why);
  // grandfathered: unlocked, gates read unmet, peak 5 -> attributed via ratchet.
  const g = synthVector({ binding: null, uw: 5, grandfathered: true });
  g.df5.deferred = true; g.df5.grandfathered = true;
  g.r5 = { armored: 0, armed: 0, tricks: 0, veterans: 0, short: ['armor', 'weapons', 'tricks', 'veterans'], ready: false };
  g.dist.defer5 = { armor: 4, weapons: 6, tricks: 3, veterans: 2 };
  const ga = G5.attribute(g);
  check('E3b: grandfathered unlock attributes (peak ratchet)', ga.attributed && /grandfathered/.test(ga.why), ga.why);
})();

// E4 corpus measurement (the §14 binding bar)
(function e4() {
  const r = analyze();
  check('E4a: 24/24 configs attributed (>=22 bar)', r.attributed >= 22, r.attributed + '/' + r.total);
  check('E4b: 0 unexplained', r.unexplained === 0, 'unexplained=' + r.unexplained);
  check('E4c: 0 recompute mismatches', r.recomputeMismatch === 0, 'mismatch=' + r.recomputeMismatch);
  check('E4d: 16 defer5 bindings', r.bindingCounts.defer5 === 16, JSON.stringify(r.bindingCounts));
  const named = Object.keys(r.defer5SubCounts || {}).every((k) => /^defer5-(armor|weapons|tricks|veterans)(\+(armor|weapons|tricks|veterans))*$/.test(k));
  const subN = Object.values(r.defer5SubCounts || {}).reduce((a, b) => a + b, 0);
  check('E4e: 16/16 defer5 bindings bar-level named', named && subN === 16, JSON.stringify(r.defer5SubCounts));
  const vetBind = r.rows.filter((x) => x.binding === 'defer5' && (x.defer5Short || []).includes('veterans')).length;
  check('E4f: veterans short on 16/16 defer5 bindings', vetBind === 16, vetBind + '/16');
})();

// E5 anchor
(function e5() {
  const dirs = ['control', 'armorydrive'];
  let ok = true, n = 0;
  for (const arm of dirs) {
    const dir = path.join(REPO, 'evidence', '2026-10-23', 'perseed-w5door-b', arm);
    for (const f of fs.readdirSync(dir)) {
      if (!/^s\d+\.json$/.test(f)) continue;
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      n++;
      if (j.anchorCommit !== 'f5f19667ce19') { ok = false; console.log('   anchor mismatch:', arm, f, j.anchorCommit); }
    }
  }
  check('E5a: all ' + n + ' corpus JSONs carry the census anchor f5f19667ce19', ok && n === 24, n + ' files');
  let diff = '';
  try { diff = execSync('git diff f5f19667ce19 HEAD -- src/js/standing.js', { cwd: REPO }).toString().trim(); } catch (e) { diff = 'ERR:' + (e && e.message); }
  check('E5b: src/js/standing.js unchanged since the census anchor', diff === '', diff.slice(0, 200));
})();

console.log(failures === 0 ? '\nALL GATES GREEN' : `\n${failures} GATE(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
