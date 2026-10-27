#!/usr/bin/env node
// test-spandraw-design-b.js — proof for the day-boundary span probe.
// Synthetic legs always run; corpus legs run only when the probe
// corpus exists (SKIP, not fail, before the pilot runs), so this
// proof stays green in a fresh worktree and strict once the corpus
// is committed. Verdict printed at the end; exit 0 iff every
// non-skipped check passes.
//
// Synthetic legs use the census classifier (censusPayload) on
// hand-built probe-shaped payloads, exactly as the analyzer does:
// a boundary span with an item-matched internal draw must read
// PROBE-PROVEN in the analyzer's terms (census PROVEN), a
// same-day control span must read NO-DAY-CROSSING, and an
// unwired-refusal span (enter/exit, no tick, no draw) must read
// NO-DAY-CROSSING with zero exclusions.
'use strict';
const fs = require('fs');
const path = require('path');
const { censusPayload } = require('./census-spandraw-b');
const { analyzeDir, dataActions, classifyRefusal } = require('./analyze-spandraw-design-b');

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
// LEG A: boundary span, internal draw matches the direct record -> census PROVEN (= analyzer PROBE-PROVEN terms).
{
  const p = synth({ ability: 'tracker', action: 'track', enterDay: 1, exitDay: 2,
    draws: [{ want: 1000, taken: 1000, items: [food], frames: ['Object.villageMeal', 'Object.endDay'] }],
    directItems: [food] });
  const c = censusPayload(p);
  const row = c.perKey['tracker.track'];
  check('A1 boundary+draw+match is PROVEN', row && row.classification === 'PROVEN-SPAN-DOUBLE-COUNT', row && row.classification);
  check('A2 exclusions 1000', row && row.exclusionsKcal === 1000, String(row && row.exclusionsKcal));
}
// LEG B: control position, same-day span -> NO-DAY-CROSSING, zero exclusions.
{
  const p = synth({ ability: 'tracker', action: 'track', enterDay: 1, exitDay: 1, draws: [], directItems: [] });
  const c = censusPayload(p);
  const row = c.perKey['tracker.track'];
  check('B1 control same-day is NO-DAY-CROSSING', row && row.classification === 'NO-DAY-CROSSING', row && row.classification);
  check('B2 control zero exclusions', row && row.exclusionsKcal === 0, String(row && row.exclusionsKcal));
}
// LEG C: unwired refusal span (enter/exit, no tick, no draw, no direct record) -> NO-DAY-CROSSING, zero exclusions.
{
  const ev = [
    { evt: 1, kind: 'spanEnter', ability: 'long_table', action: 'share_pot', day: 1, depth: 0, directBefore: 0 },
    { evt: 2, kind: 'spanExit', ability: 'long_table', action: 'share_pot', day: 1, depth: 0, directBefore: 0, directAfter: 0, result: false },
  ];
  const c = censusPayload({ seed: 1, nestEvents: ev, directRecords: [], mealDrawRecords: [] });
  const row = c.perKey['long_table.share_pot'];
  check('C1 refusal span is NO-DAY-CROSSING', row && row.classification === 'NO-DAY-CROSSING', row && row.classification);
  check('C2 refusal span zero exclusions', row && row.exclusionsKcal === 0, String(row && row.exclusionsKcal));
}
// LEG D: refusal classifier reads the say lines.
{
  check('D1 unwired line -> REFUSED-UNWIRED',
    classifyRefusal({ sayLines: ["(Share Pot isn't wired up yet — the data defines it but the code doesn't. Nothing spent.)"], result: false }).refusal === 'REFUSED-UNWIRED');
  check('D2 no-hold line -> GRANT-FAILED',
    classifyRefusal({ sayLines: ["You don't have that ability. (Tracker)"], result: false }).refusal === 'GRANT-FAILED');
  check('D3 true result -> no refusal',
    classifyRefusal({ sayLines: ['You track the trail.'], result: true }).refusal === null);
}
// LEG E: inventory derivation — 68 data actions, 24 non-combat.
{
  const all = dataActions();
  check('E1 data actions == 68', all.length === 68, String(all.length));
  const nc = all.filter((a) => a.context !== 'combat' && !a.automatic);
  check('E2 non-combat tappable == 24', nc.length === 24, String(nc.length));
  const combat = all.filter((a) => a.context === 'combat');
  check('E3 combat == 44', combat.length === 44, String(combat.length));
}
// LEG F: corpus legs (strict only when the corpus exists).
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-spandraw-design-b-corpus');
if (fs.existsSync(CORPUS) && fs.readdirSync(CORPUS).filter((f) => f.endsWith('.json')).length > 0) {
  const out = analyzeDir(CORPUS);
  // Pilot shape: 8 seeds x 24 actions x 2 positions = 384, plus a
  // second attempt for each of the 5 social actions (targeted) x 8
  // seeds x 2 positions = 80, total 464 files. Accept >= 384 so a
  // partial pilot is still analyzable (legs judge, not hide).
  check('F1 corpus has >=384 files', out.files.length >= 384, String(out.files.length));
  check('F2 every boundary instance logged a span',
    out.legs.boundarySpansLogged === out.legs.boundaryInstances,
    out.legs.boundarySpansLogged + ' vs ' + out.legs.boundaryInstances);
  check('F3 inventory fully classified', out.legs.inventoryClassified === out.legs.inventoryTotal,
    out.legs.inventoryClassified + ' vs ' + out.legs.inventoryTotal);
  check('F4 zero control crossings (LEG 4a)', out.legs.controlCrossed === 0, String(out.legs.controlCrossed));
  check('F5 probe-proven keys listed (may be empty)', Array.isArray(out.legs.probeProvenKeys), '');
  // 9954 replay control (LEG 4b) — same analyzer, same detector.
  const replay = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-9954cultnest-b-replay', '9954cultnest-b-belongseek-nofeast-s9954.json');
  if (fs.existsSync(replay)) {
    const rp = JSON.parse(fs.readFileSync(replay, 'utf8'));
    const rc = censusPayload(rp);
    const crow = rc.perKey['green_whisper.cultivate'];
    check('F6 9954 replay cultivate still PROVEN', crow && crow.classification === 'PROVEN-SPAN-DOUBLE-COUNT', crow && crow.classification);
    check('F7 9954 replay exclusions 3820', crow && crow.exclusionsKcal === 3820, String(crow && crow.exclusionsKcal));
  } else { skip++; console.log('SKIP F6-F7: 9954 cultnest replay not present'); }
} else {
  skip++; console.log('SKIP F1-F7: probe corpus not present yet');
}

console.log(`spandraw-design proof: ${pass} PASS, ${fail} FAIL, ${skip} SKIP`);
console.log(fail === 0 ? 'verdict: PROOF-GREEN' : 'verdict: PROOF-RED');
process.exit(fail === 0 ? 0 : 1);
