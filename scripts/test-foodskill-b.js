#!/usr/bin/env node
// scripts/test-foodskill-b.js — #524 food-skill table balance lever (78 occupations)
// arm sim-foodskill-b, run fleshout-loop-b-20261018T0830Z.
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §14 — binding, written BEFORE any sim):
//   MECHANISM gate: instrument computing expected occupationFoodSkill over the
//     genCharacter uniform pool (78 occupations) must equal 1.062 ± 0.004 —
//     the pre-gengap baseline recomputed on the same pool definition.
//     The gengap finding (evidence/2026-10-17/sim-gengap-b.md): pool dropped
//     1.062 → 1.041 after the 23 new occupations (avg 0.991: 22×1.0 + 1×0.8).
//     The lever re-rates the 23 new occupations honestly — a piano tuner is
//     not a forager. NO INFLATION: if honest ratings land below the gate,
//     the arm is NO-GO (KILLED), data change reverted.
//   PRIMARY / GUARDRAILS (only run if the MECHANISM gate passes):
//     pilot 8 seeds; confirm 12–16 only on full pilot GO.
//     starvation-days armed ≤ control + 2; lean-day pantry kcal ≥ control
//     (paired sign test); wall sweep 8 FRESH seeds × {leadfeast,belongfeast}
//     × {control,armed}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0:
//     national ≥ control−2, wins ±2, no new death mode, |paired survival Δ| ≤ 15d.
//   SENSE-TEST: 2 generated villagers (1.5 vs 0.8) — do the higher-skilled
//     read as more capable people?
// METRIC REVIEW: printed at the end of every run.
// NOTE: occupationFoodSkill() is a NAME-matching heuristic in src/js/game.js —
//   there is NO foodSkill field in characterGen.json (the arm brief assumed a
//   data table). The honest lever would be: add explicit foodSkill ratings to
//   the 23 new occupation definitions + a lookup shim in the function. The
//   mechanism instrument below computes exactly what that armed build would
//   produce, via the REAL function + in-script override map (no repo change
//   needed to judge the gate).
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

// Honest ratings for the 23 new occupations, keyed by definition id.
// Ladder (the heuristic's tiers, kept): 1.5 land-feeders / 1.3 food people /
// 1.1 outdoors-practical / 1.0 capable default / 0.8 indoor / 0.6 desk.
const HONEST = {
  // 1.1 — physical trade or field-transferable craft
  dockworker:        [1.1, 'waterside physical labor; sailor/truck-driver analog'],
  florist:           [1.1, 'daily plant handling + knowledge-route foraging/forage_sense/herbal_medicine'],
  postal_worker:    [1.1, 'pathfinder-granted; on-foot navigation is land skill'],
  taxi_driver:       [1.1, 'truck-driver analog: navigation, reading terrain by road'],
  bike_messenger:   [1.1, 'pathfinding + endurance; urban fieldcraft'],
  lifeguard:        [1.1, 'sailor analog: water rescue, boats, weather reading'],
  zookeeper:        [1.1, 'veterinarian analog: animal behavior/handling'],
  chimney_sweep:    [1.1, 'exterminator analog: heights, flues, solitary physical trade'],
  arborist:         [1.1, 'tree work: climbing, pruning, plant structure knowledge'],
  bus_driver:       [1.1, 'truck-driver analog: routes, vehicle fieldcraft'],
  // 1.0 — capable people, no land skill
  crossing_guard:   [1.0, 'vigilance and nerve, not foraging'],
  night_security_guard: [1.0, 'patrol and watchfulness; the land is foreign'],
  aquarium_keeper:  [1.0, 'aquatic animal care; captive fish != wild fishing'],
  rail_conductor:   [1.0, 'train operations and safety rounds; no fieldcraft'],
  // 0.8 — indoor/care/service: capable people, no land skills
  barber:           [0.8, 'tailor analog: indoor personal service, steady hands'],
  piano_tuner:      [0.8, 'indoor precision craft; not a forager, honestly'],
  radio_dj:         [0.8, 'indoor media work'],
  pottery_instructor:[0.8, 'artist analog: clay craft, earth-adjacent but not food'],
  hotel_housekeeper:[0.8, 'indoor service work'],
  comic_shop_owner: [0.8, 'indoor retail'],
  tattoo_artist:    [0.8, 'artist analog: indoor craft'],
  dry_cleaner:      [0.8, 'indoor service work'],
  sign_painter:     [0.8, 'artist analog: indoor craft'],
};

let failures = 0;
function check(name, cond, detail) {
  const tag = cond ? 'PASS' : 'FAIL';
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${detail ? ' — ' + detail : ''}`);
}
const approx = (a, b, tol) => Math.abs(a - b) <= tol;

async function main() {
  const { Game } = await loadGame({ seed: 77001, mode: 'foodskill-b' });
  await quietLog(async () => { await setupGame(Game); });
  const occs = (Game.data.characterGen || {}).occupations || [];
  check('pool has 78 occupations', occs.length === 78, 'n=' + occs.length);
  const skill = name => Game.occupationFoodSkill(name);

  // ---- PART A: recompute the gengap finding on the REAL function ----
  console.log('PART A — baseline recomputation (real Game.occupationFoodSkill):');
  const old55 = occs.slice(0, 55), new23 = occs.slice(55);
  const mean = arr => arr.reduce((s, o) => s + skill(o.name), 0) / arr.length;
  const mOld = mean(old55), mAll = mean(occs), mNew = mean(new23);
  console.log(`  old55 mean=${mOld.toFixed(4)}  all78 mean=${mAll.toFixed(4)}  new23 mean=${mNew.toFixed(4)}`);
  check('old-55 pool ≈ 1.062 (pre-gengap baseline)', approx(mOld, 1.062, 0.002), mOld.toFixed(4));
  check('all-78 pool ≈ 1.041 (gengap finding)', approx(mAll, 1.041, 0.002), mAll.toFixed(4));
  check('new-23 pool ≈ 0.991 (gengap finding)', approx(mNew, 0.991, 0.002), mNew.toFixed(4));
  const dist = {};
  for (const o of old55) { const v = skill(o.name); dist[v] = (dist[v] || 0) + 1; }
  console.log('  old55 distribution: ' + JSON.stringify(dist));

  // ---- PART B: honest re-rating of the 23 (in-script override = armed build) ----
  console.log('PART B — honest ratings applied to the 23 (what the armed build would compute):');
  let armedSum = 0;
  for (const o of occs) {
    let v = skill(o.name);
    if (o.id in HONEST) v = HONEST[o.id][0];
    armedSum += v;
  }
  const mArmed = armedSum / occs.length;
  const newAvg = Object.values(HONEST).reduce((s, [v]) => s + v, 0) / 23;
  console.log(`  new23 honest avg=${newAvg.toFixed(4)}  armed all78 mean=${mArmed.toFixed(4)}`);
  console.log('  honest ratings (id: rating — justification):');
  for (const o of new23) {
    const [v, why] = HONEST[o.id];
    console.log(`    ${o.id}: ${v} — ${why}`);
  }
  check('MECHANISM GATE: armed pool = 1.062 ± 0.004', approx(mArmed, 1.062, 0.004), mArmed.toFixed(4));

  // ---- PART C: dishonest-ceiling bound — even stretching every debatable call ----
  console.log('PART C — ceiling bound (all four 1.0s stretched to 1.1, dishonest):');
  const stretch = { crossing_guard: 1.1, night_security_guard: 1.1, aquarium_keeper: 1.1, rail_conductor: 1.1 };
  let ceilSum = 0;
  for (const o of occs) {
    let v = skill(o.name);
    if (o.id in HONEST) v = (o.id in stretch) ? stretch[o.id] : HONEST[o.id][0];
    ceilSum += v;
  }
  const mCeil = ceilSum / occs.length;
  console.log(`  stretched all78 mean=${mCeil.toFixed(4)}`);
  check('ceiling still misses 1.062 ± 0.004 (NO-GO is robust)', !approx(mCeil, 1.062, 0.004), mCeil.toFixed(4));

  // ---- PART D: sense sample — 1.5 vs 0.8 villagers as people ----
  console.log('PART D — sense sample (higher-skilled vs lower-skilled as people):');
  const farmer = occs.find(o => o.name === 'farmer');
  const tuner = occs.find(o => o.id === 'piano_tuner');
  const base = name => Math.round(1500 * skill(name));
  console.log(`  farmer (skill 1.5, identity base ${base('farmer')} kcal):`);
  console.log('    "' + (farmer.backstories && farmer.backstories[0]).slice(0, 180) + '…"');
  console.log(`  piano tuner (skill 0.8, identity base ${base('piano tuner')} kcal):`);
  console.log('    "' + (tuner.backstories && tuner.backstories[0]).slice(0, 180) + '…"');
  check('higher-skilled reads as more capable forager', base('farmer') >= base('piano tuner') * 1.5,
    `${base('farmer')} vs ${base('piano tuner')} kcal = ${(base('farmer')/base('piano tuner')).toFixed(2)}x`);

  console.log('\nMETRIC REVIEW:');
  console.log('  - Mechanism gate (1.062 ± 0.004) was calibrated to RESTORE the pre-gengap');
  console.log('    baseline. Honest ratings cannot reach it: the 1.062 figure is an artifact');
  console.log('    of the curated 55-occupation pool (10×1.5/4×1.3/10×1.1 food-trade bias).');
  console.log('    A 78-occupation world of real trades averages ~1.034 honestly.');
  console.log('  - The gate itself is not wrong for THIS arm (the arm promised restoration);');
  console.log('    the verdict is NO-GO/KILLED, not a re-score. Options for Steve: accept');
  console.log('    1.034 as the honest world, accept the 1.041 status quo, or add new');
  console.log('    food-trade occupations to background survivors (new content, not re-rating).');
  console.log('  - occupationFoodSkill() is a name heuristic in game.js; characterGen.json');
  console.log('    carries NO foodSkill field. A real lever = explicit per-definition ratings');
  console.log('    + lookup shim. The instrument computed exactly that armed build.');
  console.log(failures === 0 ? '\nRESULT: ALL CHECKS GREEN (mechanism gate reported honestly above)' : `\nRESULT: ${failures} check(s) failed`);
  process.exit(failures ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
