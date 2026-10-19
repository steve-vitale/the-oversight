#!/usr/bin/env node
// build-r19-harness.js — clone journey-deepening-r16-20261017.js into
// journey-deepening-r19-20261019.js with the r19 modifications applied.
// R19 question: do EXPEDITION meat returns conserve pantry atoms through the
// deepening window? Establishment r16 proved the atom law (no pantry unit
// >500 kcal, ceil() chunking) on the four direct unit paths
// (scripts/test-portion-atom-r16.js). The EXPEDITION-return path — villagers
// haul meat home, it is deposited, butchered, enters the pantry — was NOT
// covered. Last night an expedition-meat deposit bypassed the law (~560-unit
// chunk hitting the pantry, butcher rounding up to ~749). Confirm or refute.
// R19 keeps the r16 driver (competent policy, conversation corpus days
// 45/60/80, death-aware stop via runDays, census) and ADDS:
//   - deposit instrumentation: wrap Game.expeditionReturn +
//     Game.objReturnEffect('haul') + Game.stockPantry (expedition/haul names)
//     -> ctx-independent depositEvents19 (D1 contact).
//   - daily pantry atom scan in policy.daily -> ctx.atomViolations (D2).
// PRE-REGISTER (2026-10-19, MEASUREMENT.md sections 9-12, 14):
//   D1 (contact): >=1 expedition meat deposit on >=2/4 pilot seeds; >=6/8 on expansion.
//   D2 (conservation): 0 phantom atoms — every deposit's pantry-atom delta ==
//     expected ceil-chunked butcher yield; 0 atoms >500 kcal minted on the
//     expedition path. If the bypass reproduces, the FIX (not documentation)
//     is the expected blank-fill.
//   M6 (winnable carry): alive at day 100 on >=4/8 (r16: 6/8).
//   W1' (window reachability, report-only): distinct wave-2 types faced in days 40-80.
//   M5 people check (report-only this run — the conversation engine is the
//     social loop's active lane: DO NOT change dialogue code; document
//     senseless transcripts with root-cause hypotheses and hand over).
//   INTERESTING-FINDING BAR: any deposit where delivered kcal != expected
//     yield; any >500 atom minted; any expedition meat that never reaches
//     the pantry (rots/lost untraced).
//   Seeds: fresh 9201-9204 pilot, competent policy, DAYCAP=100, death-aware
//     stop (+10d tail max, never tick a dead village). EXPAND to 9205-9208
//     only if D1/D2 shows signal.
// Canon read: CANON.md, MONSTER-WAVES.md, PRESERVATION.md (2026-10-19) —
//   expedition meat / butcher / pantry canon. No new canon invented.
// Usage: POLICY=competent SEEDS=9201,9202 node scripts/journey-deepening-r19-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'scripts', 'journey-deepening-r16-20261017.js');
const DST = path.join(ROOT, 'scripts', 'journey-deepening-r19-20261019.js');

let s = fs.readFileSync(SRC, 'utf8');

const HEADER = `// journey-deepening-r19-20261019.js -- DEEPENING leg R19: expedition-meat
// atom conservation.
// Base: master@66e51053c (r18 article-phrase class fix + curious deeper beats).
// R19 question: do EXPEDITION meat returns conserve pantry atoms through the
// deepening window? Establishment r16 proved the atom law (no pantry unit
// >500 kcal, ceil() chunking) on carcassToMeat / specialist butcher /
// mapmemButcherForCarry / markMonsterFoodSafe-reveal (test-portion-atom-r16).
// The villager return-to-pantry legs (expeditionReturn, HAUL-objective return)
// push unknown-flesh items straight into vv.pantry, bypassing stockPantry's
// piece splitter — NOT covered by r16. Last night a ~560-unit chunk hit the
// pantry on this path (butcher rounding up to ~749). Confirm or refute.
// PRE-REGISTER (2026-10-19, MEASUREMENT.md sections 9-12, 14 — BINDING):
//   D1 (contact): >=1 expedition meat deposit on >=2/4 pilot seeds (>=6/8 expanded).
//   D2 (conservation): 0 phantom atoms — deposit delta == ceil-chunked yield,
//     0 atoms >500 kcal minted on the expedition path. Bypass => FIX, not docs.
//   M6 (winnable carry): alive at day 100 on >=4/8 (r16: 6/8).
//   W1' (window reachability, report-only): distinct wave-2 types faced days 40-80.
//   M5 people check (report-only; dialogue lane is the social loop's — document, don't fix).
//   INTERESTING-FINDING BAR: deposit kcal != expected yield; any >500 atom;
//     expedition meat lost untraced.
//   Seeds: fresh 9201-9204 pilot; EXPAND to 9205-9208 only on D1/D2 signal.
//     Competent policy, DAYCAP=100, death-aware stop.
// Canon: CANON.md, MONSTER-WAVES.md, PRESERVATION.md (2026-10-19).
// Usage: POLICY=competent SEEDS=9201,9202 node scripts/journey-deepening-r19-20261019.js
`;

// 1. Replace the r16 header block (everything up to 'use strict';)
s = s.replace(/^[\s\S]*?'use strict';\n/, HEADER + "'use strict';\n");

// 2. Evidence dir + naming
s = s.split("evidence', '2026-10-17'").join("evidence', '2026-10-19'");
s = s.split('journey-deepening-r16-').join('journey-deepening-r19-');
s = s.split('journey-deepening-r16-POLICYX').join('journey-deepening-r19-POLICYX');

// 3. Deposit instrumentation: insert after the raiseAidCrisis wrap block in runSeed.
// Anchor: the line "await setupGame(Game);" that follows the wraps.
const DEPOSIT_WRAP = `
  // R19: expedition/HAUL meat deposit instrumentation (D1/D2). Wrap the two
  // villager return-to-pantry legs + the known-meat stockPantry calls.
  // Instrument only — return values and game state untouched.
  var depositEvents19 = [], stockMeat19 = [];
  function pantrySnap19() {
    try {
      return ((Game.state.village || {}).pantry || []).map(function (p) {
        return { name: p.name, plantId: p.plantId, foodKind: p.foodKind, foodState: p.foodState,
          kcalEach: p.kcalEach || 0, units: p.units || 1, hiddenKcal: p.hiddenKcal || 0, edible: !!p.edible };
      });
    } catch (e) { return []; }
  }
  function ufUnits19(snap) {
    return snap.filter(function (p) { return p.foodKind === 'meat' && !p.edible && (p.kcalEach || 0) === 0; })
      .reduce(function (t, p) { return t + (p.units || 1); }, 0);
  }
  function maxAtom19(snap) { return snap.reduce(function (m, p) { return Math.max(m, p.kcalEach || 0); }, 0); }
  try {
    if (typeof Game.expeditionReturn === 'function') {
      const _er = Game.expeditionReturn.bind(Game);
      Game.expeditionReturn = function (vid, playerAtHaven) {
        const before = pantrySnap19();
        const r = _er(vid, playerAtHaven);
        try {
          const after = pantrySnap19();
          depositEvents19.push({ day: gday(), path: 'expedition', vid: vid || null,
            ufBefore: ufUnits19(before), ufAfter: ufUnits19(after),
            maxAtomAfter: maxAtom19(after), pantryPieces: after.length });
        } catch (e2) {}
        return r;
      };
    }
  } catch (e) { console.log('expeditionReturn wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.objReturnEffect === 'function') {
      const _ore = Game.objReturnEffect.bind(Game);
      Game.objReturnEffect = function (vid, purpose) {
        const before = pantrySnap19();
        const r = _ore(vid, purpose);
        try {
          if (purpose === 'haul') {
            const after = pantrySnap19();
            depositEvents19.push({ day: gday(), path: 'haul', vid: vid || null,
              ufBefore: ufUnits19(before), ufAfter: ufUnits19(after),
              maxAtomAfter: maxAtom19(after), pantryPieces: after.length });
          }
        } catch (e2) {}
        return r;
      };
    }
  } catch (e) { console.log('objReturnEffect wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.stockPantry === 'function') {
      const _sp = Game.stockPantry.bind(Game);
      Game.stockPantry = function (kcal, name, opts) {
        const r = _sp(kcal, name, opts);
        try {
          if (/expedition|haul/i.test(String(name || ''))) stockMeat19.push({ day: gday(), name: String(name || ''), kcal: Math.round(kcal || 0) });
        } catch (e2) {}
        return r;
      };
    }
  } catch (e) { console.log('stockPantry wrap ERROR: ' + (e && e.message)); }
`;
const anchorSetup = '  await setupGame(Game);';
if (!s.includes(anchorSetup)) { console.error('ANCHOR MISSING: await setupGame'); process.exit(1); }
s = s.replace(anchorSetup, DEPOSIT_WRAP + anchorSetup);

// 4. Daily atom scan in policy.daily — anchor on the R15 pantry-min tracker.
const PANTRY_MIN_ANCHOR = "    try { const _pk = pantryKcal(); if (ctx._pantryMin == null || _pk < ctx._pantryMin) ctx._pantryMin = _pk; } catch (e2) {}";
const ATOM_SCAN = PANTRY_MIN_ANCHOR + `
    // R19: daily pantry atom scan (D2) — any atom > 500 kcal, with item detail.
    try {
      ctx.atomViolations = ctx.atomViolations || [];
      const _pan = ((_G.state || {}).village || {}).pantry || [];
      for (const _p of _pan) {
        const _ke = _p.kcalEach || 0;
        if (_ke > 500) ctx.atomViolations.push({ day: gday(), name: _p.name, plantId: _p.plantId,
          foodKind: _p.foodKind, foodState: _p.foodState, kcalEach: _ke, units: _p.units || 1, edible: !!_p.edible });
      }
      const _mx = _pan.reduce(function (m, _p) { return Math.max(m, _p.kcalEach || 0); }, 0);
      if (ctx._maxAtom == null || _mx > ctx._maxAtom) ctx._maxAtom = _mx;
    } catch (e2) {}`;
if (!s.includes(PANTRY_MIN_ANCHOR)) { console.error('ANCHOR MISSING: pantry-min'); process.exit(1); }
s = s.replace(PANTRY_MIN_ANCHOR, ATOM_SCAN);

// 5. Output: add expeditionMeat block to the out object — anchor on the pantry line.
const PANTRY_OUT_ANCHOR = '    pantry: { unknownFleshItems, unknownFleshUnits, maxPieceKcal, pantryPieces,';
const EXPED_OUT = `    expeditionMeat: { deposits: depositEvents19, stockPantryMeat: stockMeat19,
      atomViolations: ctx.atomViolations || [], maxAtomKcal: ctx._maxAtom || 0,
      contactDays: depositEvents19.filter(function (d) { return d.ufAfter > d.ufBefore; }).length,
      knownMeatKcal: stockMeat19.reduce(function (t, e) { return t + (e.kcal || 0); }, 0) },
`;
if (!s.includes(PANTRY_OUT_ANCHOR)) { console.error('ANCHOR MISSING: pantry out'); process.exit(1); }
s = s.replace(PANTRY_OUT_ANCHOR, EXPED_OUT + PANTRY_OUT_ANCHOR);

// 6. SEED DONE line: append deposit/violation summary.
const DONE_ANCHOR = 'scale=${maxScale} links=${linkEvents.length} ms=${result.ms}';
if (!s.includes(DONE_ANCHOR)) { console.error('ANCHOR MISSING: done line'); process.exit(1); }
s = s.replace(DONE_ANCHOR, DONE_ANCHOR + ' dep=' + '${depositEvents19.length}' + ' depUF=' + '${depositEvents19.filter(d=>d.ufAfter>d.ufBefore).length}' + ' viol=' + '${(ctx.atomViolations||[]).length}' + ' maxAtom=' + '${ctx._maxAtom||0}');

// 7. Default seeds -> 9201-9204.
s = s.replace('[8901, 8902, 8903, 8904]', '[9201, 9202, 9203, 9204]');

fs.writeFileSync(DST, s);
console.log('wrote ' + DST + ' (' + s.length + ' bytes)');
try { require('child_process').execSync('node --check ' + DST, { stdio: 'inherit' }); console.log('node --check OK'); }
catch (e) { console.error('node --check FAILED'); process.exit(1); }
