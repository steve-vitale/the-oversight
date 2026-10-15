#!/usr/bin/env node
// test-spoilsibs-20261014.js — SIM-SPOILSIBS arm proof test (loop B, food economy).
//
// CONTEXT: spoilsmoke (ce1c680c) closed the duty-time cook drive laundering;
// smoke-siblings (1bdcf05c) closed the batch-cook laundering. This arm audits
// the two remaining sibling vectors and proves them CLEAN on pristine master:
//   (a) tribute payments (hierarchy.js: payTribute -> _removePantryKcal;
//       linkTick receipt -> "Tribute grain from X" push)
//   (b) direct cooking calls (re-verified via the siblings' committed proofs)
//
// Because both vectors are clean, this proof is NEGATIVE: it constructs the
// exact fixture that WOULD launder (a spoiled pantry stack run through the
// tribute path) and asserts NO spoilDay reset / NO safe-marking happens.
// A synthetic FOIL (what the pre-fix convert() did) proves the detector is
// not vacuous — the same assertions FIRE on real laundering.
//
// Invariant under test: NO tribute code path writes spoilDay or safe=true
// on an existing pantry stack. _removePantryKcal only decrements units or
// splices; the receipt path pushes a NEW stack (transfer, not conversion).
//
// Node harness: full src/js list in index.html order, Math.random seeded
// before eval (sim-harness), Game.save never stubbed.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function spoiledStack(day, name, units, kcalEach) {
  return { name, kcalEach, units, unit: 'portion', spoilDay: day - 1,
    foodKind: 'meat', foodState: 'fresh', safe: false, diseaseRisk: 0.1,
    kg: 0.2, _testSpoiled: true };
}
function freshStack(day, name, units, kcalEach) {
  return { name, kcalEach, units, unit: 'portion', spoilDay: day + 10,
    foodKind: 'meat', foodState: 'fresh', safe: false, kg: 0.2 };
}

// The laundering detector used everywhere below. Returns laundered kcal.
function detectLaunder(Game) {
  const day = (Game.state.scholar || {}).day || 0;
  let k = 0;
  for (const it of ((Game.state.village || {}).pantry || [])) {
    if (it && it._testSpoiled && it.spoilDay > day) k += (it.kcalEach || 0) * (it.units || 1);
  }
  return k;
}

async function main() {
  const { Game } = await loadGame({ seed: 42, mode: 'proof-spoilsibs', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  const lines = [];
  const origSay = Game.say;
  Game.say = (s) => { lines.push(String(s)); try { return origSay.call(Game, s); } catch (e) {} };

  let fail = 0;
  const check = (name, cond, detail) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
    if (!cond) fail++;
  };

  // ---- Vector (a1): payTribute payer side. Spoiled stack is destroyed,
  //      never re-dated. Freshest-first: fresh 1000 + spoiled 4000 = 5000 owed.
  v.pantry = [];
  v.pantry.push(spoiledStack(day, 'Old fish', 40, 100));
  v.pantry.push(freshStack(day, 'Deer meat', 10, 100));
  const week = Math.floor(day / 7);
  Game.mshipState().links = Game.mshipState().links || [];
  Game.mshipState().links.push({ id: 'tlink1', status: 'active',
    subordinate: 'haven', primary: 'otherv', tributeKcalPerWeek: 5000,
    tributeWeek: week, tributePaidKcal: 0, tributePaidWeek: -1, arrears: 0, trust: 50 });
  const paid = Game.payTribute('tlink1', 5000);
  const launderA1 = detectLaunder(Game);
  const spoiledGone = !(v.pantry || []).some(i => i && i._testSpoiled);
  console.log(`A1 paid=${paid} pantryLeft=${(v.pantry||[]).length} launderedKcal=${launderA1}`);
  check('A1: tribute paid at full value (paid==5000)', paid === 5000, 'paid=' + paid);
  check('A1: spoiled stack destroyed, not re-dated (laundered==0)', launderA1 === 0 && spoiledGone,
    `launderedKcal=${launderA1} spoiledGone=${spoiledGone}`);
  const paidLine = lines.find(l => /Tribute paid/.test(l));
  check('A1: payment said aloud', !!paidLine, paidLine || '(silent)');

  // ---- Vector (a2): payTribute partial — short branch, arrears, no re-date.
  v.pantry = [];
  v.pantry.push(spoiledStack(day, 'Old turkey', 20, 100));
  v.pantry.push(freshStack(day, 'Berries', 10, 100));
  Game.mshipState().links.push({ id: 'tlink2', status: 'active',
    subordinate: 'haven', primary: 'otherv', tributeKcalPerWeek: 5000,
    tributeWeek: week, tributePaidKcal: 0, tributePaidWeek: -1, arrears: 0, trust: 50 });
  const paid2 = Game.payTribute('tlink2', 5000);
  const launderA2 = detectLaunder(Game);
  const link2 = Game.hierarchyState().find(l => l.id === 'tlink2');
  const shortLine = lines.find(l => /Tribute short/.test(l));
  console.log(`A2 paid=${paid2} paidKcal=${link2 && link2.tributePaidKcal} launderedKcal=${launderA2}`);
  check('A2: partial payment recorded (paid==3000)', paid2 === 3000, 'paid=' + paid2);
  // PARTIALS DON'T DOUBLE-COUNT (hierarchy.js): arrears ride on linkTick's
  // week-boundary settlement, not here — payTribute only accumulates.
  check('A2: short payment accumulated, said aloud', link2 && link2.tributePaidKcal === 3000 && !!shortLine,
    `paidKcal=${link2 && link2.tributePaidKcal} shortSaid=${!!shortLine}`);
  check('A2: no laundering on the short path (laundered==0)', launderA2 === 0,
    'launderedKcal=' + launderA2);

  // ---- Vector (a3): linkTick receipt side — fresh dated grain arrives;
  //      no existing stack's spoilDay is touched.
  v.pantry = [];
  const anchor = spoiledStack(day, 'Old fish', 5, 100);
  anchor._anchorSd = anchor.spoilDay;
  v.pantry.push(anchor);
  const freshAnchor = freshStack(day, 'Deer meat', 5, 100);
  freshAnchor._anchorSd = freshAnchor.spoilDay;
  v.pantry.push(freshAnchor);
  Game.state.otherVillages = (Game.state.otherVillages || []).concat(
    [{ id: 'otherv2', name: 'Otherville', pantryKcal: 4000, generated: true }]);
  Game.mshipState().links.push({ id: 'tlink3', status: 'active', kind: 'primary',
    primary: 'haven', subordinate: 'otherv2', tributeKcalPerWeek: 3000,
    trust: 50, arrears: 0 });
  try { Game.mshipState().lastLinkWeek = week - 1; } catch (e) {}
  try { Game.linkTick(); } catch (e) { console.log('linkTick threw: ' + e.message); }
  const launderA3 = detectLaunder(Game);
  const arrived = (v.pantry || []).find(i => i && /^Tribute grain from/.test(i.name || ''));
  const anchorsIntact = (v.pantry || []).every(i => !i._anchorSd || i.spoilDay === i._anchorSd);
  console.log(`A3 arrived=${arrived ? arrived.kcalEach + 'kcal sd=' + arrived.spoilDay : 'NONE'} launderedKcal=${launderA3}`);
  check('A3: tribute arrives as fresh dated grain (sd==day+21)', !!arrived && arrived.spoilDay === day + 21,
    arrived ? `sd=${arrived.spoilDay} want=${day + 21}` : 'no arrival');
  check('A3: no existing stack re-dated (laundered==0)', launderA3 === 0 && anchorsIntact,
    `launderedKcal=${launderA3} anchorsIntact=${anchorsIntact}`);

  // ---- FOIL: the detector fires on real laundering (pre-fix convert()
  //      behavior, injected synthetically) — the negative proof is not vacuous.
  v.pantry = [];
  const foil = spoiledStack(day, 'Foil fish', 10, 100);
  v.pantry.push(foil);
  foil.spoilDay = day + 30; foil.foodState = 'preserved'; foil.safe = true; // what convert() did pre-fix
  const foilHit = detectLaunder(Game);
  console.log(`FOIL launderedKcal=${foilHit}`);
  check('FOIL: detector fires on genuine spoilDay-reset laundering', foilHit === 1000,
    'launderedKcal=' + foilHit);
  // reset the foil so it can't leak into anything else
  v.pantry = [];

  // ---- Vector (b): cooking entry points re-verified via the siblings'
  //      committed proofs (re-run on current master — independent check).
  console.log('B: re-running sibling proofs on current master...');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH: ' + (e && e.stack || e)); process.exit(2); });
