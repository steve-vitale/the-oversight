#!/usr/bin/env node
// scripts/test-flowrate-20261017.js — proof the flowrate instrument is honest
// (sim-flowrate-b, 2026-10-17). RED-pin on fixtures: each check has a RED
// phase proving it discriminates, then GREEN.
//
// R1: instrumented 40d run is byte-identical to clean (read-only proof).
//     RED foil (MUTATE=1): a kcal-adding probe breaks dayHash identity.
// R2: provenance tagging — seed stock tagged stock; new deposits tagged flow.
// R3: merge path — stockSurplus merge credits added units as flow.
// G1: rot attribution — spoiled stock+flow items split exactly, rounding 0.
// G2: per-day inflow attribution — deposits on day 5/6 land on those days;
//     inflowDayAttributed == pantryInKcal exactly.
// G3: drawSpoiled partial-unit attribution follows the tag ratio.
// G4: untagged detection — an untagged spoiled item lands in rotRounding and
//     bumps rotUntaggedItems (the gap detector works; RED-pin for the GO bar).
// G5: 15d live run — flowConservation parities all zero, WR |rel| small.
// G6: band split — lt100/b100_200/ge200 bands sum to the attributed rot.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-flowrate-20261017.js
//        FEASTSCALE_R13=1 SEATDRIVE=0 MUTATE=1 node scripts/test-flowrate-20261017.js r1
//        (r1 mode: prints day-hashes only, for the RED-foil comparison)
'use strict';
process.env.FEASTSCALE_R13 = process.env.FEASTSCALE_R13 || '1';
process.env.SEATDRIVE = process.env.SEATDRIVE || '0';
const FR = require('./flowrate-instrument-20261017');
const WR = require('./wasterate-instrument-20261017');
const { leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const SEEDSHIFT = parseInt(process.env.SEEDSHIFT || '0', 10);
const SEED = 4401 + SEEDSHIFT;
const fails = [];
const check = (name, cond, detail) => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
};
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function freshGame(mode, instrumented) {
  const { Game } = await loadGame({ seed: SEED, mode, fullTelemetry: false });
  await setupGame(Game);
  const t = {};
  if (instrumented) { FR.attachFlowRate(Game, t); FR.snapshotStartFR(Game, t); }
  return { Game, t };
}

async function r1Hashes(instrumented, mutate) {
  const { Game } = await freshGame(`flowrate-r1-${instrumented ? 'inst' : 'clean'}${mutate ? '-mut' : ''}`, instrumented);
  if (mutate) {
    // RED FOIL: a mutating probe (adds kcal on every stockSurplus — the
    // live deposit funnel, 290 calls/40d) must break dayHash identity.
    const orig = Game.stockSurplus.bind(Game);
    Game.stockSurplus = function (v, give) {
      const r = orig(v, give);
      try { (Game.state.village.pantry || []).push({ name: 'PROBE', kcalEach: 1000, units: 1, spoilDay: 99999 }); } catch (e) {}
      return r;
    };
  }
  const hashes = [];
  const pol = Object.assign({}, leadfeast);
  const oDaily = leadfeast.daily;
  pol.daily = (G, ctx) => {
    hashes.push(gday(Game) + ':' + dayHash(Game));
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 1 }); });
  return hashes;
}

async function main() {
  const mode = process.argv[2] || 'full';
  if (mode === 'r1') {
    // hash-dump mode for the RED-foil shell comparison
    const h = await r1Hashes(process.env.INST === '1', process.env.MUTATE === '1');
    console.log(h.join('\n'));
    return;
  }

  console.log('== R1: instrument is read-only (40d byte-identical) ==');
  const cleanH = await r1Hashes(false, false);
  const instH = await r1Hashes(true, false);
  const same = cleanH.length === instH.length && cleanH.every((h, i) => h === instH[i]);
  check('R1 instrumented == clean (40d)', same, `n=${cleanH.length}/${instH.length}`);

  console.log('== R2: provenance tagging ==');
  {
    const { Game, t } = await freshGame('flowrate-r2', true);
    const v = Game.state.village;
    const stockTagged = (v.pantry || []).every(it => it._frF === 0 && it._frS === (it.units || 1) && it._frU === 0);
    check('R2 seed stock tagged stock', stockTagged, `pantry n=${(v.pantry || []).length}`);
    const before = (v.pantry || []).length;
    Game.depositPantryPieces(v, { name: 'Test haunch', kcalEach: 400, units: 2, spoilDay: 99999 }, 500);
    const newItems = (v.pantry || []).slice(before);
    const flowTagged = newItems.length > 0 && newItems.every(it => (it._frF | 0) > 0 && (it._frS | 0) === 0);
    check('R2 new deposits tagged flow', flowTagged, `new n=${newItems.length}`);
  }

  console.log('== R3: merge path credits added units as flow ==');
  {
    const { Game } = await freshGame('flowrate-r3', true);
    const v = Game.state.village;
    v.day = 50;
    Game.stockSurplus(v, 1000);
    const it = (v.pantry || []).find(p => p.name === 'Foraged food');
    check('R3 first surplus lands', !!it, it ? `units=${it.units} _frF=${it._frF}` : 'none');
    const f0 = it ? (it._frF | 0) : 0;
    const u0 = it ? (it.units || 0) : 0;
    Game.stockSurplus(v, 1000); // same v.day -> merge path
    const f1 = it ? (it._frF | 0) : 0;
    const u1 = it ? (it.units || 0) : 0;
    check('R3 merge credits flow units', f1 - f0 === u1 - u0 && u1 > u0,
      `dF=${f1 - f0} dU=${u1 - u0}`);
  }

  console.log('== G1: rot attribution exact ==');
  {
    const { Game, t } = await freshGame('flowrate-g1', true);
    const v = Game.state.village;
    Game.state.scholar.day = 100;
    v.pantry.length = 0;
    const stockIt = { name: 'Old beans', kcalEach: 100, units: 3, spoilDay: -100, _frF: 0, _frS: 3, _frU: 0 };
    const flowIt = { name: 'Fresh meat', kcalEach: 200, units: 2, spoilDay: -100, _frF: 2, _frS: 0, _frU: 0 };
    v.pantry.push(stockIt, flowIt);
    await quietLog(async () => { Game.sweepSpoiled(); });
    check('G1 stock rot exact', t.rotStock === 300, `rotStock=${t.rotStock}`);
    check('G1 flow rot exact', t.rotFlow === 400, `rotFlow=${t.rotFlow}`);
    check('G1 rounding zero', t.rotRounding === 0, `rotRounding=${t.rotRounding}`);
    check('G1 band ge200', t.rotBand.ge200.n === 2 && t.rotBand.ge200.flow === 400 && t.rotBand.ge200.stock === 300,
      JSON.stringify(t.rotBand.ge200));
    const fc = FR.flowConservation(Game, t);
    check('G1 sweep parity zero', fc.sweepParity === 0, `sweepParity=${fc.sweepParity}`);
  }

  console.log('== G2: per-day inflow attribution ==');
  {
    const { Game, t } = await freshGame('flowrate-g2', true);
    const v = Game.state.village;
    Game.state.scholar.day = 5;
    Game.depositPantryPieces(v, { name: 'D5 food', kcalEach: 300, units: 2, spoilDay: 99999 }, 500);
    Game.state.scholar.day = 6;
    Game.stockPantry(700, 'test stock');
    const d5 = t.inflowByDay[5] | 0, d6 = t.inflowByDay[6] | 0;
    check('G2 day-5 inflow', d5 === 600, `d5=${d5}`);
    check('G2 day-6 inflow', d6 === 700, `d6=${d6}`);
    check('G2 day-attribution == pantryInKcal', t.inflowDayAttributed === t.pantryInKcal,
      `${t.inflowDayAttributed} vs ${t.pantryInKcal}`);
  }

  console.log('== G3: drawSpoiled partial-unit attribution ==');
  {
    const { Game, t } = await freshGame('flowrate-g3', true);
    const v = Game.state.village;
    Game.state.scholar.day = 100;
    v.pantry.length = 0;
    v.pantry.push({ name: 'Mixed stack', kcalEach: 200, units: 5, spoilDay: -100, _frF: 2, _frS: 3, _frU: 0 });
    const exposure = { spoiled: 0 };
    await quietLog(async () => { Game.drawSpoiled(v, 400, exposure); });
    // eats 2 units (400 kcal): flow 2/5 -> 160, stock 3/5 -> 240
    check('G3 flow share', t.rotFlow === 160, `rotFlow=${t.rotFlow}`);
    check('G3 stock share', t.rotStock === 240, `rotStock=${t.rotStock}`);
    check('G3 rounding zero', t.rotRounding === 0, `rotRounding=${t.rotRounding}`);
    const fc = FR.flowConservation(Game, t);
    check('G3 desperation parity', fc.despFreshParity === 0, `despFreshParity=${fc.despFreshParity}`);
  }

  console.log('== G4: untagged detection (RED-pin for the GO bar) ==');
  {
    const { Game, t } = await freshGame('flowrate-g4', true);
    const v = Game.state.village;
    Game.state.scholar.day = 100;
    v.pantry.length = 0;
    const ghost = { name: 'Ghost item', kcalEach: 150, units: 2, spoilDay: -100 };
    delete ghost._frF; delete ghost._frS; delete ghost._frU;
    v.pantry.push(ghost);
    await quietLog(async () => { Game.sweepSpoiled(); });
    check('G4 untagged -> rounding', t.rotRounding === 300, `rotRounding=${t.rotRounding}`);
    check('G4 untagged counted', t.rotUntaggedItems === 1, `rotUntaggedItems=${t.rotUntaggedItems}`);
    check('G4 flow/stock untouched', t.rotFlow === 0 && t.rotStock === 0,
      `flow=${t.rotFlow} stock=${t.rotStock}`);
  }

  console.log('== G5: 15d live run, all parities ==');
  {
    const { Game, t } = await freshGame('flowrate-g5', true);
    await quietLog(async () => { await runDays(Game, Object.assign({}, leadfeast), { days: 15, sampleEvery: 30 }); });
    const fc = FR.flowConservation(Game, t);
    check('G5 conservation |rel|<=3%', Math.abs(fc.wr.rel) <= 0.03, `rel=${(fc.wr.rel * 100).toFixed(2)}%`);
    check('G5 day-attribution parity', fc.dayAttrParity === 0, `dayAttrParity=${fc.dayAttrParity}`);
    check('G5 sweep parity', fc.sweepParity === 0, `sweepParity=${fc.sweepParity}`);
    check('G5 desperation parities', fc.despFreshParity === 0 && fc.despPreservedParity === 0,
      `fresh=${fc.despFreshParity} pres=${fc.despPreservedParity}`);
    check('G5 attribution residual 0', fc.attrResidual === 0, `attrResidual=${fc.attrResidual}`);
    check('G5 no wrap failures', t.frWrapFailed.length === 0 && (t.wrapFailed || []).length === 0,
      `fr=[${t.frWrapFailed.join(',')}] wr=[${(t.wrapFailed || []).join(',')}]`);
    check('G5 no instrument errors', (t.frErrors | 0) === 0 && (t.wrErrors | 0) === 0,
      `fr=${t.frErrors} wr=${t.wrErrors}`);
    console.log(`  (15d: rotTotal=${fc.rotTotal} flow=${t.rotFlow} stock=${t.rotStock} rounding=${t.rotRounding})`);
  }

  console.log('== G6: band decomposition sums ==');
  {
    const { Game, t } = await freshGame('flowrate-g6', true);
    const v = Game.state.village;
    Game.state.scholar.day = 100;
    v.pantry.length = 0;
    // lt100: 50 kcal stock; b100_200: 150 kcal flow; ge200: 400 stock + 600 flow
    v.pantry.push(
      { name: 'a', kcalEach: 50, units: 1, spoilDay: -100, _frF: 0, _frS: 1, _frU: 0 },
      { name: 'b', kcalEach: 150, units: 1, spoilDay: -100, _frF: 1, _frS: 0, _frU: 0 },
      { name: 'c', kcalEach: 200, units: 2, spoilDay: -100, _frF: 0, _frS: 2, _frU: 0 },
      { name: 'd', kcalEach: 300, units: 2, spoilDay: -100, _frF: 2, _frS: 0, _frU: 0 },
    );
    await quietLog(async () => { Game.sweepSpoiled(); });
    const B = t.rotBand;
    const ok = B.lt100.stock === 50 && B.lt100.n === 1 &&
      B.b100_200.flow === 150 && B.b100_200.n === 1 &&
      B.ge200.stock === 400 && B.ge200.flow === 600 && B.ge200.n === 2;
    check('G6 bands exact', ok, JSON.stringify(B));
    const bandSum = ['lt100', 'b100_200', 'ge200']
      .reduce((a, k) => a + B[k].flow + B[k].stock + B[k].rounding, 0);
    check('G6 bands sum to attributed', bandSum === t.rotFlow + t.rotStock + t.rotRounding,
      `${bandSum} vs ${t.rotFlow + t.rotStock + t.rotRounding}`);
  }

  console.log(fails.length ? `\nPROOF RED — ${fails.length} failing: ${fails.join(', ')}` : '\nPROOF GREEN — all checks passed.');
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
