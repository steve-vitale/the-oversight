#!/usr/bin/env node
// test-rubbleroute-b.js — proofs for sim-rubbleroute-b
// (prereg: evidence/2026-10-29/sim-rubbleroute-b-prereg.md).
//
// Reads the judged corpora + analysis json (no new sims,
// except T6 which byte-compares a scratch re-run when
// RUBBLEROUTE_RERUN_DIR is set). Exits non-zero on any
// failure; prints PROOF-GREEN on full pass.
//
//   node scripts/test-rubbleroute-b.js
//   RUBBLEROUTE_RERUN_DIR=.rubbleroute-rerun node scripts/test-rubbleroute-b.js
'use strict';
const fs = require('fs');
const path = require('path');

const EV = path.join(__dirname, '..', 'evidence', '2026-10-29');
const load = (f) => JSON.parse(fs.readFileSync(path.join(EV, f), 'utf8'));
const off13224 = load('sim-rubbleroute-b-corpus-off/rubbleroute-b-off-s13224.json');
const off13029 = load('sim-rubbleroute-b-corpus-off/rubbleroute-b-off-s13029.json');
const on13224 = load('sim-rubbleroute-b-corpus-on/rubbleroute-b-on-s13224.json');
const on13029 = load('sim-rubbleroute-b-corpus-on/rubbleroute-b-on-s13029.json');
const analysis = load('sim-rubbleroute-b-analysis.json');
const census13224 = load('sim-blockscreen2-b-corpus-on/blocktype-b-on-s13224.json');
const census13029 = load('sim-blockscreen2-b-corpus-on/blocktype-b-on-s13029.json');

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) failures++;
}
const refusedOf = (f) => f.evenings.filter((e) => e.eveningOutcome === 'travel-refused');
const detoursOf = (f) => f.evenings.filter((e) => e.detourAttempted);

// T1 — OFF-leg reproduction vs census (guard a).
check('T1a 13224 OFF refused loopDays', JSON.stringify(refusedOf(off13224).map((e) => e.loopDay)) === '[4,5]', refusedOf(off13224).map((e) => e.loopDay).join(','));
check('T1b 13224 OFF refused all rubble', refusedOf(off13224).every((e) => e.blocktype && e.blocktype.blockType === 'rubble'));
check('T1c 13029 OFF refused loopDays', JSON.stringify(refusedOf(off13029).map((e) => e.loopDay)) === '[19,20,21,22,23]', refusedOf(off13029).map((e) => e.loopDay).join(','));
check('T1d 13029 OFF refused all rubble', refusedOf(off13029).every((e) => e.blocktype && e.blocktype.blockType === 'rubble'));

// T2 — completeness bar (guard: 0 untraced detour evenings).
check('T2a untraced == 0', analysis.totals.untracedDetourEvenings === 0, 'untraced=' + analysis.totals.untracedDetourEvenings);
check('T2b detour counts', detoursOf(on13224).length === 18 && detoursOf(on13029).length === 1, '13224=' + detoursOf(on13224).length + ' 13029=' + detoursOf(on13029).length);

// T3 — every detour evening walked its full BFS path home.
for (const [seed, file] of [[13224, on13224], [13029, on13029]]) {
  for (const e of detoursOf(file)) {
    const d = e.detour;
    check(`T3 seed ${seed} day ${e.loopDay} walked==bfs`, d.stepsWalked === d.path.length, `walked=${d.stepsWalked} bfs=${d.path.length}`);
    check(`T3 seed ${seed} day ${e.loopDay} all steps moved`, d.steps.every((s) => s.moved === true));
    check(`T3 seed ${seed} day ${e.loopDay} arrival haven inside`, e.tile === 'haven' && e.mapPx === 4 && e.mapPy === 4 && e.inside === true);
    check(`T3 seed ${seed} day ${e.loopDay} outcome completed+rescued`, e.eveningOutcome === 'completed' && d.rescued === true);
    check(`T3 seed ${seed} day ${e.loopDay} walk kcal 0`, d.kcalAfterDetour - d.kcalBeforeDetour === 0);
    check(`T3 seed ${seed} day ${e.loopDay} walk ticks 0 (postEntry-before==entrySteps)`,
      (e.dayTicks - d.ticksBeforeDetour) === (e.delegated && e.delegated.walkTarget ? e.delegated.walkTarget.steps : -1),
      `ticks ${d.ticksBeforeDetour}->${e.dayTicks} entrySteps ${(e.delegated && e.delegated.walkTarget || {}).steps}`);
    check(`T3 seed ${seed} day ${e.loopDay} steps orthogonal singles`,
      d.steps.every((s) => Math.abs(s.to.mapPx - s.from.mapPx) + Math.abs(s.to.mapPy - s.from.mapPy) === 1));
    check(`T3 seed ${seed} day ${e.loopDay} no combat steps`, d.steps.every((s) => !s.combatLive));
  }
}

// T4 — policy path == census path minus departure, on the two census evenings.
const censusPath = (f, day) => {
  const e = f.evenings.find((x) => x.loopDay === day);
  return e && e.blocktype ? e.blocktype.routeAroundPath : null;
};
const policyPath = (f, day) => {
  const e = f.evenings.find((x) => x.loopDay === day);
  return e && e.detour ? e.detour.path : null;
};
check('T4a 13224 day4 policy path == census path minus departure',
  JSON.stringify(policyPath(on13224, 4)) === JSON.stringify(censusPath(census13224, 4).slice(1)));
check('T4b 13029 day19 policy path == census path minus departure',
  JSON.stringify(policyPath(on13029, 19)) === JSON.stringify(censusPath(census13029, 19).slice(1)));

// T5 — divergence audit + unclassified (guards c, d).
for (const seed of [13224, 13029]) {
  const p = analysis.perSeed[seed];
  check(`T5a seed ${seed} divergence audit pass`, p.divergence.auditPass === true, JSON.stringify(p.divergence.firstDiff));
  check(`T5b seed ${seed} first diff >= first detour`, !p.divergence.firstDiff || p.divergence.firstDiff.loopDay >= p.divergence.firstDetourLoopDay);
}
check('T5c unclassified == 0', analysis.totals.unclassifiedEvenings === 0, 'unclassified=' + analysis.totals.unclassifiedEvenings);

// T6 — determinism (only when a scratch re-run dir is supplied).
const rerunDir = process.env.RUBBLEROUTE_RERUN_DIR;
if (rerunDir) {
  const a = fs.readFileSync(path.join(EV, 'sim-rubbleroute-b-corpus-on/rubbleroute-b-on-s13224.json'));
  const b = fs.readFileSync(path.join(rerunDir, 'rubbleroute-b-on-s13224.json'));
  check('T6 ON 13224 re-run byte-identical', a.equals(b));
} else {
  console.log('SKIP T6 determinism (RUBBLEROUTE_RERUN_DIR unset — run separately with a scratch re-run)');
}

// T7 — gate-OFF legs attempted zero detours.
check('T7a OFF 13224 zero detours', detoursOf(off13224).length === 0);
check('T7b OFF 13029 zero detours', detoursOf(off13029).length === 0);

// T8 — no detour narration; refusal line present on detour evenings.
const NARR_RE = /going around|detour|route-around/i;
for (const [seed, file] of [[13224, on13224], [13029, on13029]]) {
  for (const e of detoursOf(file)) {
    const lines = e.sayDayLines || [];
    check(`T8a seed ${seed} day ${e.loopDay} no detour-narration line`, !lines.some((l) => NARR_RE.test(l)));
    check(`T8b seed ${seed} day ${e.loopDay} refusal line present`, lines.some((l) => l.includes('Rubble chokes the path.')));
    check(`T8c seed ${seed} day ${e.loopDay} walk lines are plain Travel-1-tile`, lines.some((l) => l.startsWith('Travel 1 tile to')));
  }
}

if (failures) { console.error(`PROOF-RED: ${failures} failure(s)`); process.exit(1); }
console.log('PROOF-GREEN: all rubbleroute checks passed');
