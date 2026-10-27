#!/usr/bin/env node
// test-spandraw-census-b.js — proof for the span-draw census analyzer.
// Synthetic legs always run; corpus legs run only when the census
// corpus directory exists (SKIP, not fail, before the sweep runs),
// so this proof stays green in a fresh worktree and strict once
// the corpus is committed. Verdict printed at the end; exit 0
// iff every non-skipped check passes.
'use strict';
const fs = require('fs');
const path = require('path');
const { censusPayload, censusDir } = require('./census-spandraw-b');

let pass = 0, fail = 0, skip = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// Synthetic payload builder: one span + optional internal draws,
// one direct record, meal records linked by (want, taken, items).
function synth({ ability, action, enterDay, exitDay, draws, directItems, directSeq }) {
  const ev = [];
  let evt = 0;
  ev.push({ evt: ++evt, kind: 'spanEnter', ability, action, day: enterDay, depth: 0, directBefore: 0 });
  const meals = [];
  let seq = 0;
  for (const d of (draws || [])) {
    ev.push({ evt: ++evt, kind: 'drawEnter', day: enterDay, want: d.want, frames: d.frames || [] });
    ev.push({ evt: ++evt, kind: 'drawExit', day: enterDay, want: d.want, taken: d.taken, items: d.items });
    meals.push({ seq: ++seq, kind: 'pantryDraw', day: enterDay, want: d.want, taken: d.taken, items: d.items });
  }
  ev.push({ evt: ++evt, kind: 'spanExit', ability, action, day: exitDay, depth: 0, directBefore: 0, directAfter: 1, result: true });
  const total = (directItems || []).reduce((t, i) => t + i.units * i.kcalEach, 0);
  return { seed: 1, nestEvents: ev,
    directRecords: [{ seq: directSeq || 1, path: ability + '.' + action, day: exitDay, totalKcal: total, items: directItems || [] }],
    mealDrawRecords: meals };
}

const food = { name: 'Foraged food', kcalEach: 200, units: 5, spoilDay: 10 };
// LEG A: cultivate-like proven double-count (crosses day, internal draw matches record items).
{
  const p = synth({ ability: 'green_whisper', action: 'cultivate', enterDay: 35, exitDay: 36,
    draws: [{ want: 1000, taken: 1000, items: [food], frames: ['Object.villageMeal', 'Object.endDay'] }],
    directItems: [food] });
  const c = censusPayload(p);
  const row = c.perKey['green_whisper.cultivate'];
  check('A1 proven classification', row && row.classification === 'PROVEN-SPAN-DOUBLE-COUNT', row && row.classification);
  check('A2 exclusions 1000', row && row.exclusionsKcal === 1000, String(row && row.exclusionsKcal));
  check('A3 day-crossing counted', row && row.dayCrossingSpans === 1, String(row && row.dayCrossingSpans));
  check('A4 dedup total excluded', c.dedup.totalExcludedKcal === 1000, String(c.dedup.totalExcludedKcal));
}
// LEG B: crosses day, no draw inside -> SPAN-CROSSES-DAY-NO-DRAW, zero exclusions.
{
  const p = synth({ ability: 'soft_step', action: 'sneak', enterDay: 5, exitDay: 6, draws: [], directItems: [] });
  // directAfter 1 with empty items: span creates an empty record; still a crossing span, no draw, no exclusion.
  const c = censusPayload(p);
  const row = c.perKey['soft_step.sneak'];
  check('B1 crosses-day-no-draw', row && row.classification === 'SPAN-CROSSES-DAY-NO-DRAW', row && row.classification);
  check('B2 zero exclusions', row && row.exclusionsKcal === 0, String(row && row.exclusionsKcal));
}
// LEG C: same-day span -> NO-DAY-CROSSING even with a draw that matches nothing (draw outside record).
{
  const p = synth({ ability: 'triage', action: 'heal', enterDay: 5, exitDay: 5,
    draws: [{ want: 100, taken: 100, items: [{ name: 'Fish catch', kcalEach: 20, units: 1, spoilDay: 5 }] }],
    directItems: [] });
  const c = censusPayload(p);
  const row = c.perKey['triage.heal'];
  check('C1 no-day-crossing', row && row.classification === 'NO-DAY-CROSSING', row && row.classification);
  check('C2 zero exclusions on unmatched draw', row && row.exclusionsKcal === 0, String(row && row.exclusionsKcal));
}
// LEG D: day-crossing span whose internal draw matches NO record item -> MIXED-NEEDS-READ, never silently promoted.
{
  const p = synth({ ability: 'green_whisper', action: 'cultivate', enterDay: 7, exitDay: 8,
    draws: [{ want: 100, taken: 100, items: [{ name: 'Fish catch', kcalEach: 20, units: 1, spoilDay: 7 }] }],
    directItems: [food] });
  const c = censusPayload(p);
  const row = c.perKey['green_whisper.cultivate'];
  check('D1 unmatched-draw crossing is MIXED', row && row.classification === 'MIXED-NEEDS-READ', row && row.classification);
  check('D2 unmatched-draw exclusion zero', row && row.exclusionsKcal === 0, String(row && row.exclusionsKcal));
}
// LEG E: no-span-data payload yields zero exclusions and zero keys (fail-closed, never day-label matched).
{
  const c = censusPayload({ seed: 9, directRecords: [{ seq: 1, path: 'x.y', day: 3, totalKcal: 500, items: [food] }], mealDrawRecords: [] });
  check('E1 no span data -> no keys', Object.keys(c.perKey).length === 0, JSON.stringify(Object.keys(c.perKey)));
  check('E2 no span data -> zero excluded', c.dedup.totalExcludedKcal === 0, String(c.dedup.totalExcludedKcal));
}
// LEG F: corpus legs (strict only when the corpus exists).
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-spandraw-census-b-corpus');
if (fs.existsSync(CORPUS) && fs.readdirSync(CORPUS).filter((f) => f.endsWith('.json')).length > 0) {
  const out = censusDir(CORPUS);
  check('F1 corpus has >=8 files', out.files.length >= 8, String(out.files.length));
  const totalSpans = Object.values(out.keys).reduce((t, k) => t + k.spans, 0);
  check('F2 corpus total spans >=50', totalSpans >= 50, String(totalSpans));
  // F3 CORRECTED (see evidence metric review): the original F3
  // re-asserted the prereg LEG1 sniff floor (>=5 distinct keys).
  // The pilot disproved that floor's assumption — the node-sim
  // useAbility surface is cultivate-only by construction (only
  // game-code caller is cultivateGarden; UI buttons live in
  // app.js, excluded from node). Re-asserting a disproved
  // assumption in an analyzer proof would be a false red, not
  // a correctness signal. The LEG1 gate itself is still judged
  // FAILED on that clause in the evidence verdict; this proof
  // checks the analyzer property instead (keys exist and are
  // reported), and prints the gate outcome separately below.
  check('F3 corpus keys reported (>=1)', Object.keys(out.keys).length >= 1, String(Object.keys(out.keys).length));
  console.log('GATE-LEG1 distinct keys: ' + Object.keys(out.keys).length + ' vs prereg floor 5 -> ' +
    (Object.keys(out.keys).length >= 5 ? 'PASS' : 'FAIL (narrowed per prereg, see evidence)'));
  check('F4 every corpus key classified', Object.values(out.keys).every((k) => !!k.classification), 'unclassified key present');
  check('F5 wall rows == files', out.wall.rows.length === out.files.length, out.wall.rows.length + ' vs ' + out.files.length);
  check('F6 no per-seed dedup ambiguity hidden (reported, may be 0)', out.perSeed.every((s) => typeof s.dedup.ambiguousSpans.length === 'number'), 'dedup shape');
  // The 9954 cultnest replay must still classify cultivate as PROVEN when run through the same analyzer.
  const replay = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-9954cultnest-b-replay', '9954cultnest-b-belongseek-nofeast-s9954.json');
  if (fs.existsSync(replay)) {
    const rp = JSON.parse(fs.readFileSync(replay, 'utf8'));
    const rc = censusPayload(rp);
    const crow = rc.perKey['green_whisper.cultivate'];
    check('F7 9954 replay cultivate still PROVEN', crow && crow.classification === 'PROVEN-SPAN-DOUBLE-COUNT', crow && crow.classification);
    check('F8 9954 replay exclusions 3820', crow && crow.exclusionsKcal === 3820, String(crow && crow.exclusionsKcal));
  } else { skip++; console.log('SKIP F7-F8: 9954 cultnest replay not present'); }
} else {
  skip++; console.log('SKIP F1-F8: census corpus not present yet');
}

console.log(`spandraw-census proof: ${pass} PASS, ${fail} FAIL, ${skip} SKIP`);
console.log(fail === 0 ? 'verdict: PROOF-GREEN' : 'verdict: PROOF-RED');
process.exit(fail === 0 ? 0 : 1);
