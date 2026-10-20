#!/usr/bin/env node
// build-r25-harness.js — clone journey-deepening-r24-20261020.js into
// journey-deepening-r25-20261020.js with the r25 modifications applied.
// R25 question (r24 metric-review named-next): the OFFER_FOOD sub-funnel.
// r24: all 3 non-performed in-window funnel opportunities were
// lockpick_raccoon offer_food fails — villagers don't carry food into field
// fights (villagerHasFood false), so the bribe path never aligned.
//   (a) Do villagers EVER carry food into field fights? (all fights)
//   (b) When offer_food is known AND the villager has food at fight time,
//       is it PERFORMED?
//   (c) When known but no food: binding constraint or AI choice?
// PRE-REGISTER (2026-10-20, MEASUREMENT.md sections 9-12, 14 — BINDING):
//   R1 (instrument, PRIMARY): hasFoodBefore at the fieldFight wrap
//     (pre-fight); 4/4 pilot seeds complete, 0 instrument errors,
//     hasFoodBefore non-null on >=95% of recorded field fights.
//   R2 (funnel, report-only): lockpick fights with counter known at fight
//     time, split by hasFoodBefore; 'offer_food' in trickLog = performed.
//   R3 (breadth, report-only): fraction of ALL field fights with
//     hasFoodBefore=true; named carriers.
//   M4 (people): >=6 transcripts sense-read, 0 senseless (report-only).
//   M5 (winnable): >=3/4 pilot seeds alive at end.
//   Seeds: fresh 9801-9804 competent pilot (expand 9805-9808 on GO signal).
//     DAYCAP=100, death-aware stop. PROBE_W3 off.
// RACE GUARDS: (1) no pacing lever (flesh-out territory) — observe only.
//   (2) dialogue engine is the social loop's lane — report-only, no dialogue
//   code changes. (3) the kills-only wave-3 gate is Steve's design —
//   measured, never moved. (4) telemetry per-seed (r20 lesson). (5) the
//   offer_food AI is landed design — measured, never levered.
// Canon read: CANON.md, MONSTER-WAVES.md (2026-10-20). No new canon.
// Usage: node scripts/build-r25-harness.js
//        POLICY=competent SEEDS=9801,9802 node scripts/journey-deepening-r25-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'scripts', 'journey-deepening-r24-20261020.js');
const DST = path.join(ROOT, 'scripts', 'journey-deepening-r25-20261020.js');

let s = fs.readFileSync(SRC, 'utf8');

const HEADER = `// journey-deepening-r25-20261020.js -- DEEPENING leg R25:
// the offer_food sub-funnel: do villagers EVER carry food into field
// fights, and does the bribe fire when the counter is known + food is held?
// Base: r24 trick-funnel harness (master@8ac811b08); measurement run,
// no game-code changes.
// R25 question (r24 metric-review named-next): r24's 3 non-performed
// in-window opportunities were all lockpick_raccoon offer_food fails —
// villagers don't carry food into field fights, so the bribe never aligned.
//   (a) do villagers EVER carry food into field fights? (b) known counter
//   + food held at fight time -> PERFORMED? (c) known but no food: binding
//   constraint or AI choice?
// PRE-REGISTER (2026-10-20, MEASUREMENT.md 9-12, 14 - BINDING):
//   R1 instrument: hasFoodBefore pre-fight in the fieldFight wrap;
//     4/4 pilot seeds, 0 instrument errors, non-null >=95% of fights.
//   R2 funnel report-only: lockpick fights, counter known at fight time,
//     split by hasFoodBefore; 'offer_food' in trickLog = performed.
//   R3 breadth report-only: fraction of ALL field fights with food;
//     named carriers. M4 >=6 transcripts 0 senseless (report-only).
//   M5 >=3/4 alive at end.
//   Seeds: fresh 9801-9804 competent pilot (expand 9805-9808 on GO signal).
//     DAYCAP=100, death-aware stop.
// RACE GUARDS: no pacing lever; no dialogue changes; gate untouched;
//   per-seed telemetry; offer_food AI is landed design, measured not levered.
// Canon: CANON.md, MONSTER-WAVES.md (2026-10-20). No new canon.
// Usage: POLICY=competent SEEDS=9801,9802 node scripts/journey-deepening-r25-20261020.js
`;

// 1. Replace the header block (everything up to 'use strict';)
s = s.replace(/^[\s\S]*?'use strict';\n/, HEADER + "'use strict';\n");

// 2. Naming
s = s.split('journey-deepening-r24-').join('journey-deepening-r25-');
s = s.split('journey-deepening-r24-POLICYX').join('journey-deepening-r25-POLICYX');

// 3. Pre-fight hasFoodBefore in the fieldFight wrap. The bribe consumes the
// food unit, so the read must happen BEFORE _ff runs. Instrument only.
const WRAP_OLD = `      Game.fieldFight = function (vid, mdef, m, opts) {
        let rec = null;
        try { rec = _ff(vid, mdef, m, opts); } catch (e) { rec = null; }`;
const WRAP_NEW = `      Game.fieldFight = function (vid, mdef, m, opts) {
        let rec = null, hasFoodBefore = null;
        // R25: pre-fight food read — fieldFights.js villagerHasFood gates the
        // offer_food bribe; the bribe consumes the unit, so post-fight reads
        // lie. Instrument only — Game state untouched.
        try { hasFoodBefore = (typeof Game.villagerHasFood === 'function') ? !!Game.villagerHasFood(vid) : null; }
        catch (e0) { hasFoodBefore = null; }
        try { rec = _ff(vid, mdef, m, opts); } catch (e) { rec = null; }`;
if (s.indexOf(WRAP_OLD) < 0) throw new Error('fieldFight wrap anchor not found');
s = s.split(WRAP_OLD).join(WRAP_NEW);

// 4. Record hasFoodBefore on each field-fight record.
const PUSH_OLD = `            minHpFrac: rec ? rec.minHpFrac : null,
          });`;
const PUSH_NEW = `            minHpFrac: rec ? rec.minHpFrac : null,
            hasFoodBefore: hasFoodBefore,
          });`;
if (s.indexOf(PUSH_OLD) < 0) throw new Error('fieldFight push anchor not found');
s = s.split(PUSH_OLD).join(PUSH_NEW);

// 5. R25 analysis: the offer_food sub-funnel + the all-fights food census.
// Insert right before the regional/scale summary block.
const REG_ANCHOR = `  // R16: regional/scale summary from the scale trace + regionalLog.`;
const R25_ADD = `  // R25: OFFER_FOOD sub-funnel (r24 metric-review named-next). offer_food
  // needs a real food unit in the villager's items at fight time
  // (fieldFights.js: known counter + villagerHasFood(vid) -> bribe, monster
  // bolts). hasFoodBefore is the pre-fight read from the wrap. knownAtFight
  // uses the r24 convention (first counterDiscovered day <= fight day) and
  // the >=1-turn filter from the w2Missed fix (r23/r24).
  const lockpickFights = (fieldFights14 || []).filter(f => f.mid === 'lockpick_raccoon' && (f.actionKinds || []).length >= 1);
  const lockpickKnown = lockpickFights.filter(f => discoveryDay[f.mid] !== undefined && discoveryDay[f.mid] <= f.day);
  const lockpickHasFood = lockpickKnown.filter(f => f.hasFoodBefore === true);
  const lockpickNoFood = lockpickKnown.filter(f => f.hasFoodBefore !== true);
  const offerFoodPerformed = lockpickKnown.filter(f => (f.trickLog || []).indexOf('offer_food') >= 0);
  const allFieldFights = (fieldFights14 || []).filter(f => (f.actionKinds || []).length >= 1);
  const foodCarrierFights = allFieldFights.filter(f => f.hasFoodBefore === true);
  const offerFood = {
    lockpickFights: lockpickFights.length,
    lockpickKnownAtFight: lockpickKnown.length,
    lockpickKnownHasFood: lockpickHasFood.length,
    lockpickKnownNoFood: lockpickNoFood.length,
    performed: offerFoodPerformed.length,
    performedDetail: offerFoodPerformed.map(f => ({ day: f.day, who: f.vname, tricks: f.trickLog, outcome: f.outcome, rounds: f.rounds })),
    knownDetail: lockpickKnown.map(f => ({ day: f.day, who: f.vname, vid: f.vid, hasFoodBefore: f.hasFoodBefore, performed: (f.trickLog || []).indexOf('offer_food') >= 0, tricks: f.trickLog, outcome: f.outcome })),
    // the "do villagers EVER carry food into field fights" census
    fieldFightsTotal: allFieldFights.length,
    fieldFightsWithFood: foodCarrierFights.length,
    foodCarriers: [...new Set(foodCarrierFights.map(f => f.vname + '|' + (f.vid || '')))],
    hasFoodNullFrac: allFieldFights.length ? allFieldFights.filter(f => f.hasFoodBefore == null).length / allFieldFights.length : null,
  };
  ${REG_ANCHOR}`;
if (s.indexOf(REG_ANCHOR) < 0) throw new Error('regional anchor not found');
s = s.split(REG_ANCHOR).join(R25_ADD);

// 6. Per-seed JSON: add offerFood next to trickFunnel.
const TF_OLD = `    trickFunnel,`;
const TF_NEW = `    trickFunnel,
    // R25: offer_food sub-funnel
    offerFood,`;
if (s.indexOf(TF_OLD) < 0) throw new Error('trickFunnel JSON anchor not found');
s = s.split(TF_OLD).join(TF_NEW);

// 7. Summary line: offer_food counts + carrier fraction.
const SUM_OLD = 'maxAtom=${ctx._maxAtom||0} -> ${fp}';
const SUM_NEW = 'maxAtom=${ctx._maxAtom||0} of=${offerFood.lockpickKnownAtFight} ofFood=${offerFood.lockpickKnownHasFood} ofPerf=${offerFood.performed} foodFrac=${offerFood.fieldFightsTotal ? (offerFood.fieldFightsWithFood + "/" + offerFood.fieldFightsTotal) : "?"} -> ${fp}';
if (s.indexOf(SUM_OLD) < 0) throw new Error('summary anchor not found');
s = s.split(SUM_OLD).join(SUM_NEW);

fs.writeFileSync(DST, s);
console.log('wrote ' + DST + ' (' + s.length + ' bytes)');
