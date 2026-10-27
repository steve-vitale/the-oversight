#!/usr/bin/env node
// test-spanpromo-b.js — proof for the real-play promotion band.
// Synthetic legs always run; corpus legs run only when the pilot
// corpus exists (SKIP, not fail, before the pilot runs), so this
// proof stays green in a fresh worktree and strict once the corpus
// is committed. Verdict printed at the end; exit 0 iff every
// non-skipped check passes. DIAG/measurement ONLY: zero src/js
// changes, zero analyzer changes — it only CALLS the reused
// census classifier (censusPayload/censusDir).
//
// What it proves (not what it judges): the classifier reads the
// promotion rule correctly (synthetic legs), the pilot corpus is
// complete and analyzable (corpus legs), the 15-key table is
// fully reported with no unclassified key, and the 9954 replay
// control still reads cultivate PROVEN at 3,820 kcal (LEG 4b).
// The promotion VERDICT itself lives in the evidence file, judged
// against the prereg — this script never hardcodes "promoted" or
// "not promoted" for any key; it only reports the measured table.
'use strict';
const fs = require('fs');
const path = require('path');
const { censusPayload, censusDir } = require('./census-spandraw-b');

const KEYS15 = ['tracker.track', 'thief.steal_pantry', 'game_sense.read_sign',
  'patient_aim.clean_shot', 'stalk.stalk_prey', 'blood_trail.follow_blood',
  'ambush.lay_wait', 'animal_ken.read_beast', 'scarecrow.stage_injury',
  'molt.shed_skin', 'fear_aura.menace', 'intimidating_presence.end_it_before',
  'war_cry.challenge', 'trophy_room.mark', 'long_table.share_pot'];

let pass = 0, fail = 0, skip = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function synth({ ability, action, enterDay, exitDay, draws, directItems }) {
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
    directRecords: [{ seq: 1, path: ability + '.' + action, day: exitDay, totalKcal: total, items: directItems || [] }],
    mealDrawRecords: meals };
}

const food = { name: 'Foraged food', kcalEach: 200, units: 5, spoilDay: 10 };
const other = { name: 'Dried meat', kcalEach: 400, units: 3, spoilDay: 12 };
// LEG A: boundary span, internal draw matches the direct record -> census PROVEN (= promotion rule).
{
  const p = synth({ ability: 'tracker', action: 'track', enterDay: 1, exitDay: 2,
    draws: [{ want: 1000, taken: 1000, items: [food], frames: ['Object.villageMeal', 'Object.endDay'] }],
    directItems: [food] });
  const c = censusPayload(p);
  const row = c.perKey['tracker.track'];
  check('A1 boundary+draw+match is PROVEN', row && row.classification === 'PROVEN-SPAN-DOUBLE-COUNT', row && row.classification);
  check('A2 exclusions 1000', row && row.exclusionsKcal === 1000, String(row && row.exclusionsKcal));
}
// LEG B: same-day span -> NO-DAY-CROSSING, zero exclusions.
{
  const p = synth({ ability: 'tracker', action: 'track', enterDay: 1, exitDay: 1, draws: [], directItems: [] });
  const c = censusPayload(p);
  const row = c.perKey['tracker.track'];
  check('B1 same-day is NO-DAY-CROSSING', row && row.classification === 'NO-DAY-CROSSING', row && row.classification);
  check('B2 same-day exclusions 0', row && row.exclusionsKcal === 0, String(row && row.exclusionsKcal));
}
// LEG C: day-crossing span whose internal draw matches NOTHING -> MIXED-NEEDS-READ, never promoted.
{
  const p = synth({ ability: 'molt', action: 'shed_skin', enterDay: 1, exitDay: 2,
    draws: [{ want: 1200, taken: 1200, items: [other], frames: ['Object.villageMeal'] }],
    directItems: [food] });
  const c = censusPayload(p);
  const row = c.perKey['molt.shed_skin'];
  check('C1 unmatched crossing is MIXED-NEEDS-READ', row && row.classification === 'MIXED-NEEDS-READ', row && row.classification);
  check('C2 unmatched crossing exclusions 0', row && row.exclusionsKcal === 0, String(row && row.exclusionsKcal));
}
// LEG D: boundary span, internal draw present but span creates NO direct record -> no exclusion.
{
  const ev = [];
  let evt = 0;
  ev.push({ evt: ++evt, kind: 'spanEnter', ability: 'stalk', action: 'stalk_prey', day: 1, depth: 0, directBefore: 0 });
  ev.push({ evt: ++evt, kind: 'drawEnter', day: 1, want: 1000, frames: [] });
  ev.push({ evt: ++evt, kind: 'drawExit', day: 1, want: 1000, taken: 1000, items: [food] });
  ev.push({ evt: ++evt, kind: 'spanExit', ability: 'stalk', action: 'stalk_prey', day: 2, depth: 0, directBefore: 0, directAfter: 0, result: true });
  const p = { seed: 1, nestEvents: ev, directRecords: [],
    mealDrawRecords: [{ seq: 1, kind: 'pantryDraw', day: 1, want: 1000, taken: 1000, items: [food] }] };
  const c = censusPayload(p);
  const row = c.perKey['stalk.stalk_prey'];
  check('D1 crossing without record is not PROVEN', !row || row.classification !== 'PROVEN-SPAN-DOUBLE-COUNT', row && row.classification);
}

// Corpus legs.
const corpusDir = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-spanpromo-b-corpus');
if (!fs.existsSync(corpusDir)) {
  skip++; console.log('SKIP corpus legs: pilot corpus not present');
} else {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
  check('E1 pilot corpus has 8 files', files.length === 8, String(files.length));
  let allHaveNest = true, allHaveDirect = true, allHaveMeals = true;
  for (const f of files) {
    const p = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    if (!Array.isArray(p.nestEvents)) allHaveNest = false;
    if (!Array.isArray(p.directRecords)) allHaveDirect = false;
    if (!Array.isArray(p.mealDrawRecords)) allHaveMeals = false;
  }
  check('E2 every payload carries nestEvents', allHaveNest);
  check('E3 every payload carries directRecords', allHaveDirect);
  check('E4 every payload carries mealDrawRecords', allHaveMeals);
  const out = censusDir(corpusDir);
  check('E5 analyzer wall seeds = 8', out.wall.seeds === 8, String(out.wall.seeds));
  const unclassified = Object.values(out.keys).filter((k) => !k.classification);
  check('E6 no unclassified fired key', unclassified.length === 0, JSON.stringify(unclassified.map((k) => k.key)));
  // Report the 15-key table (measured, never hardcoded as verdict).
  console.log('--- 15-key pilot table (measured) ---');
  for (const k of KEYS15) {
    const row = out.keys[k];
    if (!row) console.log(k + ' :: NOT-FIRED spans=0 excl=0');
    else console.log(k + ' :: ' + row.classification + ' spans=' + row.spans + ' crossing=' + row.dayCrossingSpans + ' draws=' + row.internalDraws + ' exclKcal=' + row.exclusionsKcal + ' exclSpans=' + row.exclusionSpans + ' seedsWithSpans=' + row.seedsWithSpans);
  }
  console.log('--- wall (measured) ---');
  console.log(JSON.stringify({ seeds: out.wall.seeds, national: out.wall.national, table: out.wall.table, wins: out.wall.wins, wave45: out.wall.wave45, medianDaysAlive: out.wall.medianDaysAlive, maxDaysAlive: out.wall.maxDaysAlive, totalDeaths: out.wall.totalDeaths, deathCauses: out.wall.deathCauses }));
}

// LEG 4b control: 9954 belongseek replay still PROVEN at 3820.
const replay = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-9954cultnest-b-replay', '9954cultnest-b-belongseek-nofeast-s9954.json');
if (fs.existsSync(replay)) {
  const p = JSON.parse(fs.readFileSync(replay, 'utf8'));
  const c = censusPayload(p);
  const crow = c.perKey['green_whisper.cultivate'] || c.perKey['green_thumb.cultivate'];
  check('F1 9954 replay cultivate still PROVEN', crow && crow.classification === 'PROVEN-SPAN-DOUBLE-COUNT', crow && crow.classification);
  check('F2 9954 replay exclusions 3820', crow && crow.exclusionsKcal === 3820, String(crow && crow.exclusionsKcal));
} else { skip++; console.log('SKIP F1-F2: 9954 cultnest replay not present'); }

console.log(`\nspanpromo-b proof: ${pass} pass, ${fail} fail, ${skip} skip — ${fail === 0 ? 'PROOF-GREEN' : 'PROOF-RED'}`);
process.exit(fail === 0 ? 0 : 1);
