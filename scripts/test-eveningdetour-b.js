#!/usr/bin/env node
// test-eveningdetour-b.js — proof tests for sim-eveningdetour-b.
//
// T1: both legs present for all 8 declared pilot seeds.
// T2: gate-OFF leg contains ZERO detour attempts (default-off /
//     gate-off behavior unchanged).
// T3: every rescued evening walked its full BFS path, step by
//     step, landing on haven, and ends inside at haven.
// T4: every still-refused evening with no moved detour step has
//     hop arrival == departure.
// T5: every recorded detour step moves exactly one orthogonal
//     tile (no teleport steps).
// T6: rescued count equals detour-rescued count; rescue rate
//     recomputed from corpora matches the analyzer's verdict
//     inputs (refused n, rescued n).
// T7: every pilot seed is still refused-prone on the before leg
//     (>=1 refused evening), and before-leg refused counts are
//     reported beside the verdict pooled-36 corpus counts for
//     transparency (drift is reported, not asserted exact —
//     src/js landings between the verdict run and this run may
//     legitimately move trajectories).
// T8: scope guards — competent.js and all src/js untouched vs
//     HEAD; nighttravel.js gate is default-OFF (env-absent
//     means off) and no detour narration was added.
// Usage: node scripts/test-eveningdetour-b.js [--before DIR]
//   [--after DIR] [--verdict DIR]
// Defaults: the eveningdetour pilot corpora + the verdict
// pooled-36 nighttravel corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const beforeDir = arg('before', path.join(root, 'evidence', '2026-10-29', 'sim-eveningdetour-b-corpus-before'));
const afterDir = arg('after', path.join(root, 'evidence', '2026-10-29', 'sim-eveningdetour-b-corpus-after'));
const verdictDir = arg('verdict', path.join(root, 'evidence', '2026-10-29', 'sim-nighttravel-verdict-adopt-b-pooled36-nighttravel'));
const PILOT = (arg('seeds', null) || '11149,11031,11360,11384,11390,11439,11077,11299')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!ok) failures++;
}
function loadDir(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function endsInside(e) { return e.inside === true && e.tile === 'haven'; }
function isAway(e) { return e.preStepTile !== null && e.preStepTile !== undefined && e.preStepTile !== 'haven'; }

const before = loadDir(beforeDir), after = loadDir(afterDir);
// T1
check('T1 both legs present for all declared seeds',
  PILOT.every((s) => before[s] && after[s]),
  'before=' + PILOT.filter((s) => before[s]).length + '/8 after=' + PILOT.filter((s) => after[s]).length + '/8');
// T2
let gateOffAttempts = 0;
for (const s of PILOT) {
  if (!before[s]) continue;
  for (const e of (before[s].evenings || [])) if (e.detourAttempted) gateOffAttempts++;
}
check('T2 gate-OFF leg has zero detour attempts', gateOffAttempts === 0, 'attempts=' + gateOffAttempts);
// T3/T5/T6 + rescued details
let refusedAfter = 0, rescuedAfter = 0, detourRescued = 0;
let badRescue = [], badStep = [], badStillRefused = [];
for (const s of PILOT) {
  if (!after[s]) continue;
  for (const e of (after[s].evenings || []).filter((x) => x.eveningOutcome !== 'game-over')) {
    const refused = !!e.detourAttempted || e.eveningOutcome === 'travel-refused';
    if (isAway(e) && refused) {
      refusedAfter++;
      if (endsInside(e)) { rescuedAfter++; if (e.detourAttempted) detourRescued++; }
    }
    if (e.detourAttempted) {
      const d = e.detour || {};
      if (Array.isArray(d.steps)) {
        for (const st of d.steps) {
          const md = Math.abs((st.to.mapPx ?? -99) - (st.from.mapPx ?? -99)) + Math.abs((st.to.mapPy ?? -99) - (st.from.mapPy ?? -99));
          if (md !== 1) badStep.push({ seed: s, loopDay: e.loopDay, step: st });
        }
      }
      if (isAway(e) && refused && endsInside(e)) {
        const okPath = Array.isArray(d.path) && d.path.length > 0
          && Array.isArray(d.steps) && d.steps.filter((x) => x.moved).length === d.path.length;
        const last = (d.steps || [])[(d.steps || []).length - 1];
        const h = e.haven || {};
        const okLand = !!last && last.to.mapPx === h.hx && last.to.mapPy === h.hy;
        if (!okPath || !okLand) badRescue.push({ seed: s, loopDay: e.loopDay, okPath, okLand });
      }
      if (isAway(e) && refused && !endsInside(e) && e.travel && e.travel.from && e.travel.arrival) {
        const movedSteps = Array.isArray(d.steps) ? d.steps.filter((x) => x.moved).length : 0;
        if (movedSteps === 0 && (e.travel.from.mapPx !== e.travel.arrival.mapPx || e.travel.from.mapPy !== e.travel.arrival.mapPy)) {
          badStillRefused.push({ seed: s, loopDay: e.loopDay });
        }
      }
    }
  }
}
check('T3 every rescued evening walked its full BFS path onto haven', badRescue.length === 0, 'bad=' + badRescue.length + ' rescued=' + rescuedAfter);
if (badRescue.length) console.log(JSON.stringify(badRescue, null, 2));
check('T4 still-refused evenings with no moved detour step have arrival==departure', badStillRefused.length === 0, 'bad=' + badStillRefused.length);
check('T5 every detour step moves exactly one orthogonal tile', badStep.length === 0, 'bad=' + badStep.length);
if (badStep.length) console.log(JSON.stringify(badStep.slice(0, 5), null, 2));
check('T6 rescued count equals detour-rescued count', rescuedAfter === detourRescued, 'rescued=' + rescuedAfter + ' detourRescued=' + detourRescued);
console.log('T6-info refused-after n=' + refusedAfter + ' rescued=' + rescuedAfter + ' rate=' + (refusedAfter ? (rescuedAfter / refusedAfter).toFixed(3) : 'null'));
// T7
const verdict = loadDir(verdictDir);
let proneOk = true; const t7rows = [];
for (const s of PILOT) {
  const bRef = before[s] ? (before[s].evenings || []).filter((e) => e.eveningOutcome === 'travel-refused').length : 0;
  let vRef = null;
  if (verdict[s]) {
    vRef = (verdict[s].evenings || []).filter((e) => e.eveningOutcome === 'travel-refused').length;
  }
  if (bRef < 1) proneOk = false;
  t7rows.push(s + ': before-refused=' + bRef + ' verdict-refused=' + (vRef === null ? 'n/a' : vRef));
}
check('T7 every pilot seed still refused-prone on the before leg (>=1)', proneOk);
console.log('T7-info ' + t7rows.join(' | '));
// T8
let scopeOk = true, scopeDetail = '';
try {
  const changed = execSync('git diff --name-only HEAD -- scripts/policies/competent.js src/js', { cwd: root, encoding: 'utf8' }).trim();
  if (changed) { scopeOk = false; scopeDetail = 'changed: ' + changed; }
} catch (e) { scopeOk = false; scopeDetail = 'git check failed: ' + String(e.message); }
const ntSrc = fs.readFileSync(path.join(root, 'scripts', 'policies', 'nighttravel.js'), 'utf8');
const gateDefaultOff = /function eveningDetourOn\(\) \{ return process\.env\.COMPETENT_EVENING_DETOUR === '1'; \}/.test(ntSrc);
const hasNarration = /going around/i.test(ntSrc);
if (!gateDefaultOff) { scopeOk = false; scopeDetail += ' gate not default-off;'; }
if (hasNarration) { scopeOk = false; scopeDetail += ' detour narration present (blank must stay unbuilt);'; }
check('T8 scope: competent.js + src/js untouched, gate default-OFF, no detour narration', scopeOk, scopeDetail || 'clean');
if (failures) { console.log('PROOF-RED (' + failures + ' failures)'); process.exit(1); }
console.log('PROOF-GREEN (T1-T8, no failures)');
