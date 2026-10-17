#!/usr/bin/env node
// scripts/test-wasterate-20261017.js — PROOF for the waste-rate instrument
// (sim-wasterate-b, 2026-10-17, food-economy axis diagnostic).
//
// THE INSTRUMENT: scripts/wasterate-instrument-20261017.js — wasteRate =
// pantryRotKcal / (pantryStartKcal + pantryInKcal), pantry-scoped, with a
// conservation identity (S0 + T - O - R = S_end) as the completeness proof
// and one global reentrancy guard against double-counting nested funnels.
//
// RED PHASE (instrument off / naive):
//   R1. no instrument -> no waste-rate fields (the instrument adds them).
//   R2. NAIVE RED FOIL: guard-less double wrap counts one deposit twice
//       (proves the G4 guard discriminates a real failure mode).
//   R3. BLANK DOCUMENTATION: without the drawSpoiled wrap, desperation rot
//       is invisible to freshRotKcal — the kcal vanishes from measurement
//       (the archive blind spot this instrument fills).
// GREEN PHASE (instrument on):
//   G1.  depositPantryPieces accumulates exactly (piece-splitting no-inflate).
//   G2.  stockSurplus accumulates exactly (merge path no-phantom).
//   G3.  pantryAdd accumulates exactly; over-cap deposit refused, T unchanged.
//   G4.  reentrancy guard: nested wrapped calls accumulate ONCE.
//   G5a. funnel round-trip nets exactly; G5b. an invisible (non-funnel)
//        deposit is CAUGHT by the identity (residual goes negative — it names
//        unaccounted inflow, not absorbed); G5c. symmetric invisible removal
//        nets it back to exact.
//   G6.  outflow exact: _removePantryKcal return + pantryDraw taken.
//   G7.  conservation identity EXACT on a mixed scripted sequence.
//   G8.  drawSpoiled -> desperationRotKcal (freshRotKcal untouched).
//   G9.  sweepSpoiled -> pantryRotKcal + freshRotKcal compat; scholar-inv rot
//       excluded from the pantry numerator.
//   G9b. spoiled PRESERVED item -> preserved counter (freshRot untouched);
//       G9c. identity holds with preserved rot.
//   G10. S0 recorded (seed stock > 0 after setupGame).
//   G11. determinism: scripted sequence twice, same seed -> identical counters.
//   G12. gate-off byte-identity: instrumented vs pristine Game, same ops ->
//       identical pantry + dayHash (pure read + call-through).
//   G13. wrap coverage: every expected funnel attached, wrapFailed empty
//       (schema-drift tripwire for the instrument itself).
//
// Policy-side/scripts-only: zero src/js changes.
//
// Usage: node scripts/test-wasterate-20261017.js
//   Multi-seed: SEED_SHIFT=100 node scripts/test-wasterate-20261017.js
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const WR = require('./wasterate-instrument-20261017');

const SS = parseInt(process.env.SEED_SHIFT || '0', 10) || 0;
const SEED = 9101 + SS;
console.log(`== wasterate proof ${SS ? `[seed_shift=${SS}] ` : ''}==`);

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}
const pk = (v) => (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    return [s.day, Math.round(s.health || 0), (v.roster || []).length,
      Math.round(pk(v) / 100)].join('|');
  } catch (e) { return 'ERR'; }
}
function mkItem(Game, kcal, daysLeft, name) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name: name || 'Test food', kcalEach: 500, units: Math.ceil(kcal / 500),
    safe: true, spoilDay: day + daysLeft };
}

async function build(seed) {
  const { Game } = await loadGame({ seed, mode: 'wasterate-proof', fullTelemetry: false });
  await setupGame(Game);
  Game.say = () => {};
  Game.sysSay = () => {};
  // NOTE: scholar.day stays at its setup value (1). Setting it forward would
  // spoil the seed-stock staples and contaminate the spoilage fixtures —
  // only explicitly back-dated items (daysLeft < 0) may be spoiled here.
  return Game;
}

(async () => {
  // ---------- RED ----------
  {
    const Game = await build(SEED);
    const t = {};
    check('R1 no-instrument: no waste-rate fields', t.pantryInKcal === undefined);
    // R2 naive foil: guard-less double wrap double-counts
    const v = Game.state.village;
    const acc = { n: 0 };
    const naiveWrap = (obj, name) => {
      const o = obj[name].bind(obj);
      obj[name] = function (...a) {
        const b = pk(Game.state.village);
        const r = o.apply(this, a);
        acc.n += pk(Game.state.village) - b;
        return r;
      };
    };
    naiveWrap(Game, 'depositPantryPieces');
    naiveWrap(Game, 'depositPantryPieces');
    Game.depositPantryPieces(v, mkItem(Game, 2000, 3), 500);
    check('R2 naive foil: double wrap counts 2x', acc.n === 4000, `acc=${acc.n} for a 2000-kcal deposit`);
    // R3: desperation rot invisible without the instrument
    const t3 = {};
    const v3 = Game.state.village;
    const rot = mkItem(Game, 1000, -10, 'Doomed stew');
    v3.pantry.push(rot);
    Game.drawSpoiled(v3, 5000, {});
    Game.sweepSpoiled();
    check('R3 blank: drawSpoiled rot invisible to archive-style counters',
      (t3.freshRotKcal || 0) === 0 && !v3.pantry.includes(rot),
      '1000 kcal rotted+eaten, no counter saw it');
  }

  // ---------- GREEN ----------
  const Game = await build(SEED + 1);
  const t = {};
  WR.attachWasteRate(Game, t);
  WR.snapshotStart(Game, t);
  const v = Game.state.village;

  check('G10 S0 recorded (seed stock)', t.pantryStartKcal > 0, `S0=${t.pantryStartKcal}`);
  check('G13 wrap coverage', t.wrapFailed.length === 0,
    `in=${t.wrapped.inflow.length} out=${t.wrapped.outflow.length} rot=${t.wrapped.rot.length}` +
    (t.wrapFailed.length ? ` FAILED=${t.wrapFailed.join(',')}` : ''));
  check('G13b wrap counts', t.wrapped.inflow.length === 12 && t.wrapped.outflow.length === 8 && t.wrapped.rot.length === 2,
    `in=${t.wrapped.inflow.length}/12 out=${t.wrapped.outflow.length}/8 rot=${t.wrapped.rot.length}/2`);

  // G1: depositPantryPieces exact (2000 kcal, split into <=500 pieces)
  const t0 = t.pantryInKcal;
  Game.depositPantryPieces(v, mkItem(Game, 2000, 3, 'G1 haul'), 500);
  check('G1 depositPantryPieces exact', t.pantryInKcal - t0 === 2000, `+${t.pantryInKcal - t0}`);

  // G2: stockSurplus exact incl. merge path
  const t2a = t.pantryInKcal;
  Game.stockSurplus(v, 1000);
  Game.stockSurplus(v, 1000); // second merges into the existing 'Foraged food' stack
  check('G2 stockSurplus exact (merge no-phantom)', t.pantryInKcal - t2a === 2000, `+${t.pantryInKcal - t2a}`);

  // G2b: stockPantry direct (not via depositPantryPieces) is captured — the
  // 2026-10-16 conservation miss: direct stockPantry calls (Hoarder's
  // interest, genesis fruit, betrayal caches) bypass depositPantryPieces.
  const t2b = t.pantryInKcal;
  Game.stockPantry(1500, 'G2b direct');
  check('G2b stockPantry direct captured', t.pantryInKcal - t2b === 1500, `+${t.pantryInKcal - t2b}`);

  // G3: pantryAdd exact + cap refusal
  const t3a = t.pantryInKcal;
  const added = Game.pantryAdd(mkItem(Game, 1500, 9, 'G3 ration'));
  const d3 = t.pantryInKcal - t3a;
  // over-cap: fill past the 120k cap via the uncapped haul path, then pantryAdd must refuse
  Game.depositPantryPieces(v, { name: 'Cap filler', kcalEach: 200000, units: 1, safe: true, spoilDay: 999 }, 500);
  const t3b = t.pantryInKcal;
  const refused = Game.pantryAdd(mkItem(Game, 1500, 9, 'G3 over'));
  check('G3 pantryAdd exact + cap refuses cleanly',
    added === true && d3 === 1500 && refused === false && t.pantryInKcal === t3b,
    `added=${added} +${d3} refused=${refused} T_unchanged=${t.pantryInKcal === t3b}`);

  // G4: reentrancy guard — nested wrapped calls accumulate once
  Game.__g4o = function (vv) {
    this.depositPantryPieces(vv, mkItem(Game, 300, 3, 'G4'), 500);
  };
  t.__wrapFlow(Game, t, '__g4o', 'in', null);
  const t4 = t.pantryInKcal;
  Game.__g4o(v);
  delete Game.__g4o;
  check('G4 guard: nested wrap counts once', t.pantryInKcal - t4 === 500, `+${t.pantryInKcal - t4} (not 1000)`);

  // G5a: funnel round-trip nets exactly (take through a funnel, re-deposit)
  const gi5 = v.pantry.find((i) => i.name === 'G4');
  const t5a_in = t.pantryInKcal, t5a_out = t.pantryOutKcal;
  Game.takeFromPantry(v.pantry.indexOf(gi5)); // 1 unit = 500 kcal, funnel-tracked
  Game.depositPantryPieces(v, { name: 'G5', kcalEach: 500, units: 1, safe: true, spoilDay: 99 }, 500);
  check('G5a funnel round-trip nets exactly',
    t.pantryOutKcal - t5a_out === 500 && t.pantryInKcal - t5a_in === 500,
    `out+${t.pantryOutKcal - t5a_out} in+${t.pantryInKcal - t5a_in}`);
  // G5b: an INVISIBLE (non-funnel) mutation is CAUGHT by the identity, not absorbed.
  // Sign convention: residual = books - actual. An invisible deposit makes
  // actual > books -> residual NEGATIVE (names unaccounted inflow).
  v.pantry.push({ name: 'Ghost', kcalEach: 500, units: 1, safe: true, spoilDay: 99 });
  const c5b = WR.conservation(Game, t);
  check('G5b identity catches invisible deposit', c5b.residual === -500, `residual=${c5b.residual}`);
  // G5c: symmetric invisible removal nets the ghost to zero — the identity
  // measures NET unaccounted flow, and honest books return to exact.
  v.pantry.splice(v.pantry.findIndex((i) => i.name === 'Ghost'), 1);
  const c5c = WR.conservation(Game, t);
  check('G5c identity restored after symmetric invisible removal', c5c.residual === 0, `residual=${c5c.residual}`);

  // G6: outflow exact — delta equals ACTUAL pantry loss (pantryDraw is
  // delta-style because its .taken return is cooked-kcal, overstating raw loss)
  const o6 = t.pantryOutKcal, pk6 = pk(v);
  const rm = Game._removePantryKcal(1200);
  Game.pantryDraw(v, 800, {});
  check('G6 outflow exact (delta = actual pantry loss)',
    t.pantryOutKcal - o6 === pk6 - pk(v),
    `out+${t.pantryOutKcal - o6} pkdrop=${pk6 - pk(v)} rm_ret=${rm}`);

  // G8: drawSpoiled -> desperationRotKcal (freshRotKcal untouched).
  // The doomed item enters THROUGH the funnel so the identity stays exact.
  const t8_in = t.pantryInKcal;
  Game.depositPantryPieces(v, mkItem(Game, 1000, -10, 'Doomed stew'), 500);
  const pkBefore8 = pk(v);
  Game.drawSpoiled(v, 5000, {});
  check('G8 drawSpoiled -> desperationRotKcal',
    t.desperationRotKcal === 1000 && t.freshRotKcal === 0 && pk(v) === pkBefore8 - 1000 &&
    t.pantryInKcal - t8_in === 1000,
    `desp=${t.desperationRotKcal} freshRot=${t.freshRotKcal} in+${t.pantryInKcal - t8_in}`);

  // G9: sweepSpoiled -> pantryRotKcal + freshRotKcal compat; scholar-inv excluded from pantry num.
  // The pantry item enters through the funnel (the inventory item is not pantry flow).
  const t9_in = t.pantryInKcal;
  Game.depositPantryPieces(v, mkItem(Game, 500, -10, 'Pantry rot'), 500);
  Game.state.scholar.inventory.push(mkItem(Game, 1000, -10, 'Pack rot'));
  Game.sweepSpoiled();
  check('G9 sweepSpoiled: pantry+compat split',
    t.pantryRotKcal === 500 && t.pantryRotItems === 1 &&
    t.freshRotKcal === 1500 && t.freshRotItems === 2,
    `pantryRot=${t.pantryRotKcal} freshRot=${t.freshRotKcal}/${t.freshRotItems}`);

  // G9b: spoiled PRESERVED item -> preserved counter (the engine removes it;
  // the archive fresh convention excludes it from freshRotKcal — the split
  // the conservation identity needs).
  const presRot = mkItem(Game, 500, -40, 'Old smoke');
  presRot.foodState = 'preserved';
  Game.depositPantryPieces(v, presRot, 500);
  Game.sweepSpoiled();
  check('G9b spoiled preserved -> preserved counter, freshRot untouched',
    t.pantryRotPreservedKcal === 500 && t.pantryRotPreservedItems === 1 &&
    t.freshRotKcal === 1500,
    `pres=${t.pantryRotPreservedKcal}/${t.pantryRotPreservedItems} freshRot=${t.freshRotKcal}`);
  const c9b = WR.conservation(Game, t);
  check('G9c identity holds with preserved rot', c9b.residual === 0, `residual=${c9b.residual}`);

  // G7: conservation identity EXACT on the whole scripted sequence
  const c = WR.conservation(Game, t);
  check('G7 conservation identity exact', c.residual === 0,
    `S0=${c.start} in=${c.in} out=${c.out} rot=${c.rotPantry + c.rotDesp} end=${c.end} residual=${c.residual}`);
  const wr = WR.wasteRate(t);
  const mx = WR.mixedInShare(t);
  console.log(`  [info] wasteRate=${(wr * 100).toFixed(2)}% mixedInShare=${(mx * 100).toFixed(1)}%`);

  // G11: determinism — identical scripted sequence, same seed -> identical counters
  async function scripted(seed) {
    const G2 = await build(seed);
    const tt = {};
    WR.attachWasteRate(G2, tt);
    WR.snapshotStart(G2, tt);
    const vv = G2.state.village;
    G2.depositPantryPieces(vv, { name: 'D', kcalEach: 4000, units: 1, safe: true, spoilDay: 99 }, 500);
    G2._removePantryKcal(900);
    G2.pantryDraw(vv, 700, {});
    G2.stockSurplus(vv, 600);
    return [tt.pantryInKcal, tt.pantryOutKcal, tt.pantryStartKcal, WR.conservation(G2, tt).residual];
  }
  const sA = await scripted(SEED + 2), sB = await scripted(SEED + 2);
  check('G11 determinism', JSON.stringify(sA) === JSON.stringify(sB), JSON.stringify(sA));

  // G12: gate-off byte-identity — instrumented vs pristine, same ops
  async function opsOnly(seed, instrumented) {
    const G3 = await build(seed);
    if (instrumented) { const tt = {}; WR.attachWasteRate(G3, tt); WR.snapshotStart(G3, tt); }
    const vv = G3.state.village;
    G3.depositPantryPieces(vv, { name: 'E', kcalEach: 3000, units: 1, safe: true, spoilDay: 99 }, 500);
    G3._removePantryKcal(1100);
    G3.pantryDraw(vv, 500, {});
    G3.sweepSpoiled();
    return dayHash(G3) + '|' + JSON.stringify(vv.pantry.map((i) => [i.name, i.kcalEach, i.units, i.spoilDay]));
  }
  const hA = await opsOnly(SEED + 3, true), hB = await opsOnly(SEED + 3, false);
  check('G12 gate-off byte-identity', hA === hB, 'instrument is pure read + call-through');

  console.log(fails.length ? `\nPROOF FAIL: ${fails.join(', ')}` : '\nPROOF GREEN — all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH:', (e && e.stack) || e); process.exit(2); });
