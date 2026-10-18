#!/usr/bin/env node
// scripts/analyze-refusestaff-confirm-b.js — deterministic analyzer for
// the sim-refusestaff-confirm-b 16-seed CONFIRM (schema
// 'huntstaff-wall/6'), fresh seeds 6701-6708.
//
// Judges the pre-registered gates from evidence/2026-10-18/
// perseed-refusestaff-confirm-b/*.json and writes
// evidence/2026-10-18/refusestaff-confirm-b-analysis.json.
//
// PRIMARY: re-staff-through-wounds events on the armed side = 0/16
//   (type A: assignment within 2d of a wounding resolve; type B:
//   assignment with post-wound hp < 40 within 7d while the map read
//   >= 40) — the repair must reproduce. Control is expected > 0.
// ENGAGEMENT: duties fired (armed) >= max(53, control x 0.8), plus an
//   EXPLICIT same-day redirect instrument (pilot noted 0/5).
// GUARDRAILS:
//   - median survival armed >= control - 10d
//   - starvation deaths: per seed x policy pair, armed <= control + 2
//     (villager, deduped, person-kind only)
//   - ZERO hunt-attributable wound-chain deaths (#535 lens)
//   - no new death mode at the MODE level: armed-side villager mode-set
//     ⊆ control-side mode-set (named wave monsters grouped into
//     'monster' via a monsters.json-grounded lexicon — name/unknown/id;
//     the pilot's proposed metric-review revision). The string-level set
//     still fires honestly for the autopsy.
// WALL (report-only): national / table / wins / wave4 / wave5 /
//   arc2-4 / fourRealm / median+max survival / exiled.
//
// Usage: node scripts/analyze-refusestaff-confirm-b.js [--dir evidence/2026-10-18/perseed-refusestaff-confirm-b]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv.includes('--dir')
  ? process.argv[process.argv.indexOf('--dir') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-refusestaff-confirm-b');
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-18', 'refusestaff-confirm-b-analysis.json');

const SEEDS = [6701, 6702, 6703, 6704, 6705, 6706, 6707, 6708];
const POLICIES = ['leadfeast', 'belongfeast'];

// MODE-level death grouping (metric review adopted from the pilot):
// any villager cause string that matches a monster's name/unknown/id
// (src/data/monsters.json, read-only, verified clean vs HEAD) is mode
// 'monster' — sample noise on which monster landed the blow, not a new
// death mode. Starvation/thirst canonicalized. Everything else stays
// its own mode so the gate fires honestly on true novelty.
const STARV_RE = /starv/i, THIRST_RE = /thirst|dehydrat/i;
function canonCause(cause) { const c = String(cause == null ? '' : cause); return THIRST_RE.test(c) ? 'thirst' : c; }
function monsterLexicon() {
  const m = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
  const s = new Set(['monster']);
  for (const x of m) for (const k of ['name', 'unknown', 'id', 'title', 'label']) {
    if (x[k] && typeof x[k] === 'string') s.add(x[k].toLowerCase());
  }
  return s;
}
const LEX = monsterLexicon();
function modeOf(cause) {
  const c = canonCause(cause);
  if (STARV_RE.test(c)) return 'starvation';
  if (THIRST_RE.test(c)) return 'thirst';
  if (LEX.has(c.toLowerCase())) return 'monster';
  return c;
}

function load(arm) {
  const rows = [];
  for (const p of POLICIES) for (const s of SEEDS) {
    const f = path.join(DIR, `${arm}-${p}-s${s}.json`);
    if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
    rows.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  return rows;
}
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

const fixed = load('fixed');
const control = load('control');
const byKey = (rows) => Object.fromEntries(rows.map(r => [`${r.policyId}-s${r.seed}`, r]));
const F = byKey(fixed), C = byKey(control);

// PRIMARY
const restaffFixed = sum(fixed.map(r => r.restaffEventCount || 0));
const restaffControl = sum(control.map(r => r.restaffEventCount || 0));
const dutiesFixed = sum(fixed.map(r => r.huntAssignmentsFired || 0));
const dutiesControl = sum(control.map(r => r.huntAssignmentsFired || 0));
const dutiesBar = Math.max(53, dutiesControl * 0.8);
const refusalsFixed = sum(fixed.map(r => (r.refusalLog || []).length));
// EXPLICIT redirect instrument (pilot's honest note: 0/5 there)
const redirectsFixed = sum(fixed.map(r => r.redirectCount || 0));
const redirectRowsFixed = fixed.flatMap(r => (r.redirectEvents || []).map(e => ({ ...e, seed: r.seed, policy: r.policyId })));
const redirectRows = fixed.map(r => {
  const rdays = new Set((r.refusalLog || []).map(x => x.day));
  const redDays = new Set((r.redirectEvents || []).map(x => x.day));
  return { seed: r.seed, policy: r.policyId, refusalDays: rdays.size, redirectDays: redDays.size };
});
const restaffRowsFixed = fixed.flatMap(r => (r.restaffEvents || []).map(e => ({ ...e, seed: r.seed, policy: r.policyId })));
const restaffRowsControl = control.flatMap(r => (r.restaffEvents || []).map(e => ({ ...e, seed: r.seed, policy: r.policyId })));

// GUARDRAILS
const medFixed = median(fixed.map(r => r.gameDays));
const medControl = median(control.map(r => r.gameDays));
const maxFixed = Math.max(...fixed.map(r => r.gameDays));
const maxControl = Math.max(...control.map(r => r.gameDays));

const starvPairs = SEEDS.flatMap(s => POLICIES.map(p => {
  const k = `${p}-s${s}`;
  return { seed: s, policy: p, fixed: F[k].villagerStarvationDeaths || 0, control: C[k].villagerStarvationDeaths || 0 };
}));
const starvPairMiss = starvPairs.filter(x => x.fixed > x.control + 2);

const causeSet = (rows) => new Set(rows.flatMap(r => Object.keys(r.villagerCauseCounts || {})));
const modeSet = (rows) => new Set(rows.flatMap(r => Object.keys(r.villagerCauseCounts || {}).map(modeOf)));
const causesFixed = causeSet(fixed), causesControl = causeSet(control);
const newModesString = [...causesFixed].filter(c => !causesControl.has(c)); // string-level: fires honestly
const modesFixed = modeSet(fixed), modesControl = modeSet(control);
const newModes = [...modesFixed].filter(c => !modesControl.has(c)); // MODE-level: the binding gate

const huntAttr = (rows) => rows.flatMap(r => (r.assignedHunterDeaths || [])
  .filter(d => d.huntAttributable)
  .map(d => ({ ...d, seed: r.seed, policy: r.policyId })));
const huntAttrFixed = huntAttr(fixed), huntAttrControl = huntAttr(control);

// Wound-chain detail for the autopsy lens
const woundChainDeaths = (rows) => rows.flatMap(r => (r.assignedHunterDeaths || [])
  .filter(d => d.dayDied != null)
  .map(d => ({ ...d, seed: r.seed, policy: r.policyId })));

// WALL
const wall = (rows, k) => sum(rows.map(r => r[k] || 0));
const wallReport = {
  national: [wall(fixed, 'national'), wall(control, 'national')],
  table: [wall(fixed, 'table'), wall(control, 'table')],
  wins: [wall(fixed, 'wins'), wall(control, 'wins')],
  wave4: [wall(fixed, 'wave4'), wall(control, 'wave4')],
  wave5: [wall(fixed, 'wave5'), wall(control, 'wave5')],
  arc2: [wall(fixed, 'arc2'), wall(control, 'arc2')],
  arc3: [wall(fixed, 'arc3'), wall(control, 'arc3')],
  arc4: [wall(fixed, 'arc4'), wall(control, 'arc4')],
  fourRealm: [wall(fixed, 'fourRealm'), wall(control, 'fourRealm')],
  exiled: [wall(fixed, 'exiled'), wall(control, 'exiled')],
  medianSurvival: [medFixed, medControl],
  maxSurvival: [maxFixed, maxControl],
};

const verdict = {
  primary_restaff: restaffFixed === 0 ? 'GO' : 'NO-GO',
  primary_duties: dutiesFixed >= dutiesBar ? 'GO' : 'MISS',
  guard_survival: medFixed >= medControl - 10 ? 'GO' : 'MISS',
  guard_starvation: starvPairMiss.length === 0 ? 'GO' : 'MISS',
  guard_newmode: newModes.length === 0 ? 'GO' : 'MISS',
};
verdict.overall = (verdict.primary_restaff === 'GO' && verdict.primary_duties === 'GO' &&
  verdict.guard_survival === 'GO' && verdict.guard_starvation === 'GO' &&
  verdict.guard_newmode === 'GO') ? 'GO' : 'NO-GO';

const analysis = {
  schema: 'huntstaff-wall/6-analysis',
  runId: 'fleshout-loop-b-20261018T175233Z',
  generatedUtc: new Date().toISOString(),
  primary: {
    restaffEventsFixed: restaffFixed,
    restaffEventsControl: restaffControl,
    restaffRowsFixed, restaffRowsControl,
    dutiesFiredFixed: dutiesFixed,
    dutiesFiredControl: dutiesControl,
    dutiesBar,
    refusalsFixed,
    redirectsFixed,
    redirectRowsFixed,
    redirectRows,
  },
  guardrails: {
    medianSurvival: { fixed: medFixed, control: medControl, bar: medControl - 10 },
    maxSurvival: { fixed: maxFixed, control: maxControl },
    starvPairs, starvPairMiss: starvPairMiss.length,
    newDeathModesStringLevel: newModesString,
    newDeathModesModeLevel: newModes,
    villagerCauseCountsFixed: fixed.reduce((m, r) => { for (const [k, v] of Object.entries(r.villagerCauseCounts || {})) m[k] = (m[k] || 0) + v; return m; }, {}),
    villagerCauseCountsControl: control.reduce((m, r) => { for (const [k, v] of Object.entries(r.villagerCauseCounts || {})) m[k] = (m[k] || 0) + v; return m; }, {}),
    huntAttributableFixed: huntAttrFixed,
    huntAttributableControl: huntAttrControl,
    assignedHunterDeathsFixed: woundChainDeaths(fixed),
    assignedHunterDeathsControl: woundChainDeaths(control),
  },
  wall: wallReport,
  instrumentErrors: {
    fixed: sum(fixed.map(r => r.instrumentErrors || 0)),
    control: sum(control.map(r => r.instrumentErrors || 0)),
  },
  verdict,
};

fs.writeFileSync(OUT, JSON.stringify(analysis, null, 2) + '\n');
console.log(JSON.stringify({
  restaffFixed, restaffControl, dutiesFixed, dutiesControl, dutiesBar,
  refusalsFixed, redirectsFixed,
  medFixed, medControl, starvPairMiss: starvPairMiss.length,
  newModesString, newModes,
  huntAttrFixed: huntAttrFixed.length, huntAttrControl: huntAttrControl.length,
  verdict,
}, null, 2));
console.log('wrote', OUT);
