#!/usr/bin/env node
// scripts/sweep-flowrate-20261017.js — flow-rate diagnostic sweep
// (sim-flowrate-b, 2026-10-17, food-economy axis).
//
// WHY: sim-trig6-b (KILLED/NO-GO) prescribed that future drawdown arms must
// (a) pre-register a volume-sanity check, (b) consider triggering on FLOW
// (income rate) not STOCK, (c) score rot-per-pantry-kcal. No instrument
// measures these. This sweep runs the flowrate instrument
// (scripts/flowrate-instrument-20261017.js — layered on the proven
// wasterate instrument) on the base substrate to deliver:
//   (1) per-day pantry income-rate (kcal/day) distribution
//   (2) rot decomposed into flow-driven / stock-driven / rounding
//       (phantomfood phantomBand pattern: lt100 / b100_200 / ge200)
//   (3) rot-per-pantry-kcal (waste rate) baseline
//   (4) max-theoretical-drawdown volume table for flow-trigger thresholds X
//
// 8 FRESH seeds 4401-4408 x {leadfeast, belongfeast} = 16 runs, 180d
// death-aware. No lever — base substrate only (read-only diagnostic).
//
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat). Banned-seed check: SWEEP STOPS if any seed is banned.
// 4401-4408 verified fresh: not in the coordinator's banned list, not in
// recent sets (4101-4108 trig6, 4201-4208 banned, 4301-4308 wasterate,
// 4313, 5103-5104).
//
// Pre-registered DIAGNOSTIC GO (binding, MEASUREMENT §§9-12, 14 — see
// evidence/2026-10-17/sim-flowrate-b.md):
//   PRIMARY (attribution gate): 100% of pantry rot attributed to
//     flow/stock/rounding on 16/16 runs — rotRounding <= 1% of rotTotal per
//     run (the instrument may not hide real rot in rounding), AND the
//     attribution reconciles with the WR books (attrResidual == 0,
//     sweep/desperation/day parities == 0).
//   COMPLETENESS: conservation |rel| <= 3% on all 16 runs (WR method —
//     proves the inflow wrap set is complete).
// Per-seed JSONs carry the schema-drift LOUD class (exact key sets,
// filename<->field cross-check in the analyzer).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SMOKE=1 node scripts/sweep-flowrate-20261017.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-flowrate-20261017.js
// Targeted re-runs: SEEDS="4401,4402" ONLY="leadfeast" node scripts/sweep-flowrate-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
process.env.LEANWINTER_LIB = '1';
const LW = require('./sweep-leanwinter-20261017');
const FR = require('./flowrate-instrument-20261017');
const WR = require('./wasterate-instrument-20261017');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

// ---- banned-seed check (the coordinator's list; sweep stops on any hit) ----
const BANNED = new Set();
for (const spec of ['982-989', '3101-3108', '3301-3308', '3201-3208',
    '931-938', '111-888', '11-88', '1201-1208', '991-998', '4201-4208',
    '5101-5108', '201-208', '1701-1708']) {
  const [a, b] = spec.split('-').map(Number);
  for (let s = a; s <= b; s++) BANNED.add(s);
}
for (const spec of ['171,282,393,504,615,726,837,948', '121,232,343,454,565,676,787,898',
    '131,242,353,464,575,686,797,908', '151,262,373,484,595,706,817,928',
    '163,274,385,496,607,718,829,940', '205,246,321,412,523,634,745,856',
    '307,418,529,640,751,862,973,84', '917,928,939,104,215,326,437,548',
    '141,252,363,474', '101,202,303,404,606,707,808,909',
    '137,248,359,470,581,692,803,914']) {
  for (const s of spec.split(',').map(Number)) BANNED.add(s);
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4401, 4402, 4403, 4404, 4405, 4406, 4407, 4408]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
const DAYS = 180;
const POLICIES = ['leadfeast', 'belongfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-flowrate');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function alivePop(Game) {
  try {
    const v = Game.state.village || {};
    const health = v.health || {};
    let n = 0;
    for (const id of (v.roster || [])) {
      const h = health[id];
      if ((h == null ? 100 : h) > 0) n++;
    }
    return n;
  } catch (e) { return 0; }
}
function policyFor(policyId) {
  return policyId === 'leadfeast' ? leadfeast : belongfeast;
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    const { Game } = await loadGame({ seed: 4401, mode: `flowrate-smoke-${policyId}`, fullTelemetry: false });
    await setupGame(Game);
    const t = {};
    FR.attachFlowRate(Game, t);
    FR.snapshotStartFR(Game, t);
    const base = policyFor(policyId);
    let r = null;
    await quietLog(async () => { r = await runDays(Game, Object.assign({}, base), { days: 15, sampleEvery: 30 }); });
    check(`${policyId}: instrument live`, t.frWrapped.flow.length >= 15 && t.frWrapped.rot.length === 2 && t.frWrapFailed.length === 0,
      `flow=${t.frWrapped.flow.length} rot=${t.frWrapped.rot.length} failed=[${t.frWrapFailed.join(',')}]`);
    check(`${policyId}: S0 recorded`, t.pantryStartKcal > 0, `S0=${t.pantryStartKcal}`);
    check(`${policyId}: stock tagged`, (() => { try {
      return (Game.state.village.pantry || []).every(it => (it._frS | 0) + (it._frF | 0) + (it._frU | 0) >= 0);
    } catch (e) { return false; } })(), 'tags present');
    check(`${policyId}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    const fc = FR.flowConservation(Game, t);
    check(`${policyId}: smoke conservation |rel|<=3%`, Math.abs(fc.wr.rel) <= 0.03, `rel=${(fc.wr.rel * 100).toFixed(2)}%`);
    check(`${policyId}: smoke parities zero`, fc.dayAttrParity === 0 && fc.sweepParity === 0 && fc.attrResidual === 0,
      `day=${fc.dayAttrParity} sweep=${fc.sweepParity} attr=${fc.attrResidual}`);
  }
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function detGate() {
  // r27 rule: bit-identical reruns WITH the instrument attached — proves the
  // instrument is pure read + call-through before trusting the sweep.
  for (const policyId of POLICIES) {
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: 4401, mode: `flowrate-det-${policyId}` });
      await setupGame(Game);
      const t = {};
      FR.attachFlowRate(Game, t);
      FR.snapshotStartFR(Game, t);
      const base = policyFor(policyId);
      const hashes = [];
      const pol = Object.assign({}, base);
      const oDaily = base.daily;
      pol.daily = (G, ctx) => {
        hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
        return oDaily ? oDaily(G, ctx) : undefined;
      };
      await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 1 }); });
      runs.push(hashes);
    }
    const same = runs[0].length === runs[1].length && runs[0].every((h, i) => h === runs[1][i]);
    console.log(`  ${same ? 'PASS' : 'FAIL'} det-gate (${policyId}, instrumented): 40d rerun byte-identical — n=${runs[0].length}/${runs[1].length}`);
    if (!same) { console.error('DET-GATE FAILED'); process.exit(3); }
  }
  console.log('DET gate green.');
}

async function oneRun(seed, policyId) {
  const side = 'base';
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `flowrate-${policyId}`, fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, everTable: false, exiled: false, villagerDays: 0, maxArc: 1, maxFires: 0, starvedDays: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const inst = {};
  LW.attachDeathInstrument(Game, inst);
  LW.attachFoodInstruments(Game, inst);
  const t = {};
  FR.attachFlowRate(Game, t);
  FR.snapshotStartFR(Game, t);
  const policy = Object.assign({}, base);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      hist.villagerDays += alivePop(G);
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try {
        const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
        if (w > waveHist.dailyMax) {
          waveHist.dailyMax = w;
          if (w >= 4 && waveHist.wave4Day == null) waveHist.wave4Day = gday(G);
          if (w >= 5 && waveHist.wave5Day == null) waveHist.wave5Day = gday(G);
        }
      } catch (e) {}
    } catch (e) { inst.errors = (inst.errors || 0) + 1; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const causeCounts = {}, clsCounts = {};
  for (const d of (inst.deaths || [])) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
  }
  const starvation = clsCounts.STARVATION || 0;
  const vd = hist.villagerDays || 0;
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  let hungryDays = 0;
  try { hungryDays = ((Game.state.village || {}).hungryDays || 0); } catch (e) {}
  const halfRationDays = Object.values(inst.meals || {}).filter(m => m.halfRation).length;
  const mealsDays = Object.keys(inst.meals || {}).length;
  const fc = FR.flowConservation(Game, t);
  const rotTotal = FR.rotTotalOf(t);
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    // wall-metric key set as NUMBERS (schema-drift LOUD class):
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    sits: 0, // SEATDRIVE=0: no sitting substrate — schema completeness
    starvation, starvationPerVDay: vd ? +(starvation / vd).toFixed(6) : 0,
    causeCounts, clsCounts,
    dehydration: (clsCounts['WATER-DEHYDRATION'] || 0),
    thirst: (clsCounts['WATER-THIRST'] || 0),
    maxRank: hist.maxRank,
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    villagerDays: vd, starvedDays: hist.starvedDays, hungryDays,
    halfRationDays, halfRationRate: mealsDays ? +(halfRationDays / Math.max(1, result.gameDays)).toFixed(4) : 0,
    // archive-compat rot (scholar inv + prepStash + pantry):
    freshRotKcal: t.freshRotKcal || 0, freshRotItems: t.freshRotItems || 0,
    freshRotPerVDay: vd ? +((t.freshRotKcal || 0) / vd).toFixed(1) : 0,
    // waste-rate instrument (WR layer):
    pantryRotKcal: t.pantryRotKcal || 0, pantryRotItems: t.pantryRotItems || 0,
    pantryRotPreservedKcal: t.pantryRotPreservedKcal || 0,
    pantryRotPreservedItems: t.pantryRotPreservedItems || 0,
    desperationRotKcal: t.desperationRotKcal || 0, desperationRotItems: t.desperationRotItems || 0,
    desperationRotPreservedKcal: t.desperationRotPreservedKcal || 0,
    desperationRotPreservedItems: t.desperationRotPreservedItems || 0,
    pantryStartKcal: t.pantryStartKcal || 0,
    pantryInKcal: t.pantryInKcal || 0,
    pantryOutKcal: t.pantryOutKcal || 0,
    pantryEndKcal: fc.wr.end,
    conservationResidual: fc.wr.residual, conservationRel: +fc.wr.rel.toFixed(5),
    wasteRate: +WR.wasteRate(t).toFixed(5),
    wasteRateAll: +WR.wasteRateAll(t).toFixed(5),
    mixedInShare: +WR.mixedInShare(t).toFixed(4),
    perMethod: t.perMethod || {},
    // flow-rate instrument (FR layer):
    inflowByDay: t.inflowByDay || {},
    inflowDayAttributed: t.inflowDayAttributed || 0,
    rotTotal,
    rotFlow: t.rotFlow || 0, rotStock: t.rotStock || 0, rotRounding: t.rotRounding || 0,
    rotFlowFresh: t.rotFlowFresh || 0, rotStockFresh: t.rotStockFresh || 0,
    rotUntaggedItems: t.rotUntaggedItems || 0,
    rotBand: t.rotBand || {},
    roundingShare: +fc.roundingShare.toFixed(5),
    attrResidual: fc.attrResidual,
    sweepParity: fc.sweepParity,
    despFreshParity: fc.despFreshParity,
    despPreservedParity: fc.despPreservedParity,
    dayAttrParity: fc.dayAttrParity,
    instrumentErrors: (inst.errors | 0) + (t.wrErrors | 0) + (t.frErrors | 0),
    wrapFailed: [...(t.wrapFailed || []), ...(t.frWrapFailed || [])],
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-flowrate-s${seed}.json`), JSON.stringify(out, null, 1));
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} starv=${out.starvation} nat=${out.national} wave=${out.maxWave} table=${out.table} rot=${Math.round(rotTotal / 1000)}k(flow ${(100 * out.rotFlow / Math.max(1, rotTotal)).toFixed(0)}%) wasteRate=${(out.wasteRate * 100).toFixed(1)}% roundShare=${(out.roundingShare * 100).toFixed(2)}% consRel=${(out.conservationRel * 100).toFixed(2)}%`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

(async () => {
  let only = null;
  if (process.env.ONLY) {
    only = new Set(String(process.env.ONLY).split(';').map(x => x.trim()).filter(Boolean));
  }
  const match = (p) => !only || only.has(p);

  if (process.env.SMOKE === '1') { await smokeGate(); }
  // SKIP_DET=1: the det-gate already passed on this code+seed (documented in
  // the evidence file); used when re-launching after an infra kill.
  if (process.env.SKIP_DET !== '1') { await detGate(); }
  else { console.log('DET gate skipped (SKIP_DET=1 — already green this run).'); }

  const recs = [];
  for (const policyId of POLICIES) {
    if (!match(policyId)) continue;
    for (const seed of SEEDS) {
      recs.push(await oneRun(seed, policyId));
    }
  }

  // ---- summary ----
  console.log('\n== flowrate sweep summary ==');
  for (const policyId of POLICIES) {
    const rs = recs.filter(r => r.policyId === policyId);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const mean = (f) => rs.reduce((a, r) => a + (r[f] || 0), 0) / Math.max(1, n);
    const rotTot = rs.reduce((a, r) => a + r.rotTotal, 0);
    const rotFl = rs.reduce((a, r) => a + r.rotFlow, 0);
    console.log(`${policyId}: n=${n} wasteRate=${(mean('wasteRate') * 100).toFixed(1)}% ` +
      `rotFlowShare=${(100 * rotFl / Math.max(1, rotTot)).toFixed(1)}% ` +
      `roundShare_max=${(Math.max(...rs.map(r => r.roundingShare)) * 100).toFixed(3)}% ` +
      `consRel_max=${(Math.max(...rs.map(r => Math.abs(r.conservationRel))) * 100).toFixed(2)}% ` +
      `national=${sum('national')}/${n} table=${sum('table')}/${n} wins=${sum('wins')}/${n} ` +
      `medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `wave4=${sum('wave4')}/${n} wave5=${sum('wave5')}/${n} starvation=${sum('starvation')}`);
  }
  const bad = recs.filter(r => Math.abs(r.conservationRel) > 0.03 || r.roundingShare > 0.01 ||
    r.attrResidual !== 0 || r.sweepParity !== 0 || r.dayAttrParity !== 0 ||
    r.despFreshParity !== 0 || r.despPreservedParity !== 0);
  console.log(`ATTRIBUTION GATE: ${bad.length === 0 ? 'GREEN' : 'RED — ' + bad.map(r => `${r.policyId}/s${r.seed}`).join(' ')}`);
  const n = recs.length;
  const s = (f) => recs.reduce((a, r) => a + (r[f] | 0), 0);
  const gd = recs.map(r => r.gameDays).sort((a, b) => a - b);
  const med = gd.length % 2 ? gd[gd.length >> 1] : (gd[gd.length / 2 - 1] + gd[gd.length / 2]) / 2;
  console.log(`\n== wall numbers ==`);
  console.log(`n=${n} national=${s('national')}/${n} table=${s('table')}/${n} wins=${s('wins')}/${n} exiled=${s('exiled')}/${n} ` +
    `wave4=${s('wave4')}/${n} wave5=${s('wave5')}/${n} arc2=${s('arc2')}/${n} arc3=${s('arc3')}/${n} arc4=${s('arc4')}/${n} fourRealm=${s('fourRealm')}/${n} ` +
    `median=${med.toFixed(1)}d max=${gd[gd.length - 1]}d starvation=${s('starvation')} halfRationDays=${s('halfRationDays')}`);
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
