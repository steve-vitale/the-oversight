#!/usr/bin/env node
// build-r15-harness.js — clone journey-deepening-r14-20261016.js into
// journey-deepening-r15-20261017.js with the r15 modifications applied.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'scripts', 'journey-deepening-r14-20261016.js');
const DST = path.join(ROOT, 'scripts', 'journey-deepening-r15-20261017.js');

let s = fs.readFileSync(SRC, 'utf8');

const HEADER = `// journey-deepening-r15-20261017.js -- DEEPENING leg R15: hold r14's gains on
// the new tip (master@84a1e0af) + the EXECUTION WINDOW: do performed w3 tricks
// RESOLVE fights (kill-attributed / monster-fled / dismissed), and do r14's
// corrected bars hold? New in-window game code since r14's base (69c512be):
// succession r20 true-name mourning (6333e26c -- mantle-memory t2LatelyEvent
// resolves bearer <redacted> recorded name), crisis r19 wound-care memories
// (3e663509 -- combat-wound tending surfaces via the care lately kind), social
// r19 opener skip + grief pool + snippet substance gate (25033aa), prosefix-b
// feast voice x3 (34ac59f2/9351f1c6), ambientfix-b pilot-aware variants
// (359876e4), establishment r11 monster-meat pipeline (84a1e0af).
//
// PRE-REGISTER (2026-10-17, MEASUREMENT.md sections 9-12, 14):
//   Leg question: on the new tip, (a) do r14's DEEPENING gains hold (M1-M7',
//     C1, C3, C4), (b) with the CORRECTED C2 bar (0 flee-mid-trick with
//     minHpFrac > 0.25 -- design holds the line only while HP > 25%), does
//     trick-aware morale behave?, (c) THE EXECUTION WINDOW: for field fights
//     where villagers PERFORMED w3 tricks, what are the outcome channels
//     (vKill / mFlee / evade / vFlee / vDie) vs no-trick fights -- do
//     performances resolve?, (d) do the newly landed conversation changes read
//     human (true-name mourning, wound-care memories, opener skip, grief pool,
//     substance gate)?
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 meetings -- player wave-3 fights on >=2/8 seeds (r14: 4/8).
//     M2 seasoning -- >=1/8 seeds with a seasoned link by day 100 (r14: 6/8).
//     M3 counter parity -- 'observed'-via discovery on >=2/8 (r14: 8/8).
//     M4 knowledge -- compounding >0 on >=6/8 seeds (r14: 8/8).
//     M5 people -- >=10 transcripts sense-read, 0 senseless flags.
//     M6 winnable -- alive at day 100 on >=4/8 (r14: 7/8); 0 mislabels.
//     M7' win-side inert -- 0 table|deedgate rows, seat 'none', no Watchers
//       staged (viewership reported, not gated).
//     M8 show-memory -- >=1/8 seeds with a 'show' lately beat (r14: 7/8).
//     C1 counterwire reachability -- >=1 NEW w3 trick PERFORMED in a real
//       field fight on >=2/8 seeds (r14: 3/8).
//     C2' trick-aware morale (CORRECTED bar per r14 metric review) -- 0
//       flee-mid-trick events with minHpFrac > 0.25 (all such events must sit
//       at/below the design's 25% hold-line threshold).
//     C3 crisis-tier honesty -- >=1 raid aid-crisis at wave >=2 (r14: observed).
//     C4 kill attribution -- >=1 waveKillLog by=<vid> non-null on >=2/8 seeds
//       (r14: 8/8); >=1 via='companion' on >=1/8 (r14: 3/8).
//     C5 unknown flesh -- REPORT-ONLY (competent substrate: pantries 35-99k,
//       HAUL gate needs pantry<5000; r14's metric-review queues a scarcity
//       substrate for the NEXT run). Track pantryMin; report if any seed dips
//       < 5000 and what happens then.
//     E1 execution window -- for field fights with performed tricks, report
//       outcome distribution (vKill / mFlee / evade / vFlee / vDie) vs
//       no-trick w3 fights. Interesting if mFlee+vKill >= 50% of trick fights.
//   Interesting-finding bar: a performed trick RESOLVING a fight (monster
//     flees/dies after the trick); a true-name mourning beat read aloud; a
//     wound-care memory in talk; any pantry dip < 5000 with haul behavior.
//   Horizon: DAYCAP=100, death-aware stop. Seeds: fresh 8801-8804 pilot;
//     EXPAND to 8801-8808 on the interesting-finding bar. Policy: competent.
//     SEATDRIVE left unset (= driver ON).
// Canon read: CANON.md (2026-10-17), MONSTER-WAVES.md (wave law), KNOWLEDGE.md
// (channels). No new canon invented.
// Usage: POLICY=competent W3TRACE=1 SEEDS=8801,8802 node scripts/journey-deepening-r15-20261017.js
`;

// 1. Replace the whole comment header (everything before the Usage line).
const usageIdx = s.indexOf('// Usage:');
if (usageIdx < 0) { console.error('Usage line not found'); process.exit(1); }
const restStart = s.indexOf('\n', usageIdx);
s = HEADER + s.slice(restStart);

// 2. Global renames.
s = s.split('journey-deepening-r14').join('journey-deepening-r15');
s = s.split('[8801, 8802, 8703, 8704]').join('[8801, 8802, 8803, 8804]'); // no-op guard
s = s.split('[8701, 8702, 8703, 8704]').join('[8801, 8802, 8803, 8804]');
s = s.split('2026-10-16').join('2026-10-17');
s = s.split("'journey-deepening-r12-' + POLICY").join("'journey-deepening-r15-' + POLICY");
s = s.split("journey-deepening-r12-POLICYX").join("journey-deepening-r15-POLICYX");

// 3. Pantry-min tracking in policy.daily (after gearUp(ctx) line).
const dailyAnchor = `    gearUp(ctx);\n    regionalPlay(ctx);`;
if (s.indexOf(dailyAnchor) < 0) { console.error('daily anchor not found'); process.exit(1); }
s = s.replace(dailyAnchor, `    gearUp(ctx);\n    regionalPlay(ctx);\n    // R15: pantry-min tracker (C5 report-only: does any seed dip < 5000?)\n    try { const _pk = pantryKcal(); if (ctx._pantryMin == null || _pk < ctx._pantryMin) ctx._pantryMin = _pk; } catch (e2) {}`);

// 4b. R15 blank fill: the fleeMidTrick summary dropped fledHopeless/fleeLearn,
// so the hopeless-path vs floor-path distinction (the C2'' question) was not
// directly measurable. Carry them through + the design-honest C2'' count.
const fleeAnchor = `  const fleeMidTrick = ff14.filter(f => ((f.trickLog || []).length > 0) && (f.outcome === 'vFlee')).map(f => ({ day: f.day, who: f.vname, mid: f.mid, tricks: f.trickLog, fleeHpFrac: f.fleeHpFrac, minHpFrac: f.minHpFrac }));`;
if (s.indexOf(fleeAnchor) < 0) { console.error('flee anchor not found'); process.exit(1); }
s = s.replace(fleeAnchor, `  const fleeMidTrick = ff14.filter(f => ((f.trickLog || []).length > 0) && (f.outcome === 'vFlee')).map(f => ({ day: f.day, who: f.vname, mid: f.mid, tricks: f.trickLog, fleeHpFrac: f.fleeHpFrac, minHpFrac: f.minHpFrac, fledHopeless: !!f.fledHopeless, fleeLearn: !!f.fleeLearn, holdLine: !!f.holdLine }));
  // R15 C2'': design-honest bar -- hopeless-path violations above the 25%
  // hold-line floor. Floor-path (vBreak) withdrawals are normal morale.
  const fleeMidTrickHopelessOver = fleeMidTrick.filter(f => f.fledHopeless && (f.minHpFrac || 0) > 0.25);
  // R15 C2' (r14 metric review): events above the 25% threshold (all paths).
  const fleeMidTrickOver = fleeMidTrick.filter(f => (f.minHpFrac || 0) > 0.25);`);

// 5a. Compute E1 resolution census before the out object (not inside it).
const outAnchor = `  const out = {
    seed, policy: POLICY, probe: PROBE_W3,`;
if (s.indexOf(outAnchor) < 0) { console.error('out anchor not found'); process.exit(1); }
s = s.replace(outAnchor, `
  // R15 E1: execution-window resolution census -- do performed tricks RESOLVE?
  // Channels: vKill (monster dead), mFlee (monster fled -- includes
  // trick-dismissals), evade (fight avoided), vFlee (villager fled),
  // vDie (villager died), alreadyDead.
  const OUTCOMES = ['vKill', 'mFlee', 'evade', 'vFlee', 'vDie', 'alreadyDead', 'other'];
  const ocDist = (rows) => {
    const d = {}; for (const o of OUTCOMES) d[o] = 0;
    for (const f of rows) { const o = OUTCOMES.indexOf(f.outcome) >= 0 ? f.outcome : 'other'; d[o]++; }
    return d;
  };
  const ffW3NoTrick = ffW3.filter(f => (f.trickLog || []).length === 0);
  const resolution = { trickFights: ocDist(ffW3Trick), noTrickFights: ocDist(ffW3NoTrick) };
  const trickFightDetails = ffW3Trick.map(f => ({ day: f.day, who: f.vname, mid: f.mid, tricks: f.trickLog, outcome: f.outcome, rounds: f.rounds, minHpFrac: f.minHpFrac, mHpLeft: f.mHpLeft }));
  // R15: missed-opportunity census -- w3 field fights with NO trick performed:
  // which monsters, and did the village know their trick at fight time?
  // (villageKnows snapshot at analysis = end of run; day vs discovery day
  // would be exact, but end-of-run knowledge is the honest upper bound.)
  let villageKnows = {};
  try { villageKnows = Game.state.villagerTricks || {}; } catch (e2) {}
  const noTrickFightDetails = ffW3NoTrick.map(f => ({ day: f.day, who: f.vname, mid: f.mid, outcome: f.outcome, rounds: f.rounds, villageKnowsTrick: !!villageKnows[f.mid] }));
` + outAnchor);

// 5b. counterwire block: add fleeMidTrickOver, resolution, trickFightDetails,
// noTrickFightDetails (fleeMidTrickOver computed in step 4; the rest in 5a).
const cwAnchor = `      holdLineBeats, fleeMidTrick,
    },`;
if (s.indexOf(cwAnchor) < 0) { console.error('counterwire anchor not found'); process.exit(1); }
s = s.replace(cwAnchor, `      holdLineBeats, fleeMidTrick, fleeMidTrickOver, fleeMidTrickHopelessOver,
      resolution, trickFightDetails, noTrickFightDetails,
    },`);

// 6. Pantry-min into out JSON: extend the pantry block.
const pantryAnchor = `    pantry: { unknownFleshItems, unknownFleshUnits, maxPieceKcal, pantryPieces,`;
if (s.indexOf(pantryAnchor) < 0) { console.error('pantry anchor not found'); process.exit(1); }
s = s.replace(pantryAnchor, `    pantry: { unknownFleshItems, unknownFleshUnits, maxPieceKcal, pantryPieces, pantryMin: (ctx._pantryMin == null ? null : Math.round(ctx._pantryMin)),`);

// 7. New conversation markers (r15): wound-care memories + true-name mourning.
// Extend the R14_MARKERS block.
const markersAnchor = `  const R14_MARKERS = {
    meatHaul: ['is back with strange meat', 'Unknown flesh, heading home'],
    healerMemory: ['sat with me through the worst of it', 'through the fever'],
    mourning: ['mourn', 'burial', 'laid to rest', 'we buried'],
    holdLineText: ['holds the line \\u2014 working the trick'],
  };`;
if (s.indexOf(markersAnchor) < 0) { console.error('markers anchor not found'); process.exit(1); }
s = s.replace(markersAnchor, `  const R14_MARKERS = {
    meatHaul: ['is back with strange meat', 'Unknown flesh, heading home'],
    healerMemory: ['sat with me through the worst of it', 'through the fever'],
    // R15: crisis r19 wound-care memories -- combat-wound tending surfaces via
    // the care lately kind, wound-flavored lines (exact beat text from
    // convoTopics.js care/wound branch)
    woundTending: ['bound up my cut', 'wrapped it tight', 'did the work', 'bound up the cut'],
    // R15: succession r20 true-name mourning -- mantle-memory t2LatelyEvent
    // resolves the bearer's recorded name ("their name already carried");
    // "Nobody says X's name right yet" (successor as a new person)
    trueNameMourning: ['their name already carried', 'nobody says', 'name right yet', 'before the Codex did'],
    mourning: ['mourn', 'burial', 'laid to rest', 'we buried'],
    holdLineText: ['holds the line \\\\u2014 working the trick'],
  };`);

// 8. SEED DONE line: add fleeMidTrickOver + resolution summary.
const doneAnchor = 'holdLine=${holdLineBeats.length} fleeMidTrick=${fleeMidTrick.length}';
if (s.indexOf(doneAnchor) < 0) { console.error('done-line anchor not found'); process.exit(1); }
s = s.replace(doneAnchor, 'holdLine=${holdLineBeats.length} fleeMidTrick=${fleeMidTrick.length} fleeOver=${fleeMidTrickOver.length} hopelessOver=${fleeMidTrickHopelessOver.length} res=${JSON.stringify(resolution.trickFights)}');

fs.writeFileSync(DST, s);
console.log('wrote', DST, s.length, 'bytes');
