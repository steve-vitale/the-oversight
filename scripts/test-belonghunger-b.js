#!/usr/bin/env node
// scripts/test-belonghunger-b.js — proof for the belong-road hunger diagnostic
// instrument (fleshout loop B, 2026-10-19, arm sim-belonghunger-b).
//
// RED (neutrality — the instrumentation must be invisible):
//   R1: 40d leadfeast seed 11, instrumented vs uninstrumented: bit-identical
//       per-day pantry series + identical outcome vector.
//   R2: cross-validation vs the fragilityfeast CONTROL corpus (identical
//       substrate: leadfeast/belongfeast + FEASTSCALE_R13=1; the deleted
//       fragilityfeast layer was R1-pinned byte-identical to these with
//       FRAGFEAST unset). Instrumented leadfeast s11 (180d horizon,
//       death-aware) must reproduce fragleadfeast-s11 EXACTLY:
//       days=114, endReason=village-lost, hungryDays=3, starveDeaths=0,
//       deaths {combat:23, monster:3, villager combat:10}, feasts=5.
// GREEN (the instrument measures):
//   G1: tribute channel records on belongfeast (belong road pays tribute).
//   G2: tend channel records on leadfeast (lead road tends).
//   G3: feast channel records (hostFeast pantry draws attributed).
//   G4: hungry-day detection — leadfeast s11 run detects exactly 3 hungry
//       events (matches the corpus hungryDays=3).
//   G5: daily reconciliation — pooled |residual| < 5% of pooled gross flows.
//   G6: determinism — two identical instrumented 40d runs bit-identical.
//
// Usage: FEASTSCALE_R13=1 node scripts/test-belonghunger-b.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { instrument, markDayStart, pantryKcal, gday } = require('./belonghunger-instrument');
const FS = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.log('STOP: FEASTSCALE_R13=1 required (the standard feast substrate).');
  process.exit(1);
}

const REGISTRY = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };
const results = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  results.push({ name, pass: !!cond });
  return !!cond;
}

function pantrySeries(Game) { return Math.round(pantryKcal(Game)); }

async function runInstrumented(pid, seed, days, wantLedger) {
  const base = REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: 'belonghunger-test-' + pid });
  await setupGame(Game);
  const W = instrument(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup, oDaily = base.daily;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const pSeries = [];
  policy.daily = (G, ctx) => {
    markDayStart(W, G);
    pSeries.push(gday(G) + ':' + pantrySeries(G));
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: days + 1 }); });
  try { W.scanInflows(); } catch (e) {} // final scan: catch the last interval's deposits
  // finalize last day's end pantry
  const daysArr = Object.keys(W.days).map(Number).sort((a, b) => a - b);
  W.finalPantry = pantrySeries(Game);
  W.lastDay = daysArr.length ? daysArr[daysArr.length - 1] : 0;
  const deaths = {};
  let starve = 0;
  for (const d of (result.samples.deaths || [])) {
    const k = String(d.cause || d.kind || 'unknown');
    deaths[k] = (deaths[k] || 0) + 1;
    if (/starv/i.test(k)) starve++;
  }
  let hungry = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  W.restore();
  return {
    W, pSeries: pSeries.join('\n'),
    out: {
      days: result.days, endReason: result.endReason,
      hungryDays: hungry, starveDeaths: starve, deaths,
      fsFeasts: (runCtx && runCtx.fsFeasts) || 0,
      fsArmedFeasts: (runCtx && runCtx.fsArmedFeasts) || 0,
      wave: result.maxWaveUnlocked || 1,
    },
  };
}

async function runBare(pid, seed, days) {
  const base = REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: 'belonghunger-testbare-' + pid });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const oDaily = base.daily;
  const pSeries = [];
  policy.daily = (G, ctx) => {
    pSeries.push(gday(G) + ':' + pantrySeries(G));
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: days + 1 }); });
  const deaths = {};
  let starve = 0;
  for (const d of (result.samples.deaths || [])) {
    const k = String(d.cause || d.kind || 'unknown');
    deaths[k] = (deaths[k] || 0) + 1;
    if (/starv/i.test(k)) starve++;
  }
  let hungry = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  return {
    pSeries: pSeries.join('\n'),
    out: {
      days: result.days, endReason: result.endReason,
      hungryDays: hungry, starveDeaths: starve, deaths,
      wave: result.maxWaveUnlocked || 1,
    },
  };
}

function outEq(a, b) {
  const ka = Object.keys(a.deaths).sort().join(',');
  const kb = Object.keys(b.deaths).sort().join(',');
  if (ka !== kb) return false;
  for (const k of Object.keys(a.deaths)) if (a.deaths[k] !== b.deaths[k]) return false;
  return a.days === b.days && a.endReason === b.endReason &&
    a.hungryDays === b.hungryDays && a.starveDeaths === b.starveDeaths &&
    a.wave === b.wave;
}

async function main() {
  console.log('RED — neutrality');
  // R1: instrumented vs bare, 40d leadfeast s11
  const r1a = await runInstrumented('leadfeast', 11, 40);
  const r1b = await runBare('leadfeast', 11, 40);
  check('R1 pantry series bit-identical (instrumented vs bare)', r1a.pSeries === r1b.pSeries,
    `seriesLen=${r1a.pSeries.length}`);
  check('R1 outcome vector identical', outEq(r1a.out, r1b.out), JSON.stringify(r1a.out));
  check('R1 no missing wraps', r1a.W.missing.length === 0, 'missing=' + r1a.W.missing.join(','));

  // R2: cross-validation vs corpus fragleadfeast-s11 (180d horizon, death-aware)
  const r2 = await runInstrumented('leadfeast', 11, 180);
  const exp = { days: 114, endReason: 'village-lost', hungryDays: 3, starveDeaths: 0,
    deaths: { combat: 23, monster: 3, 'villager combat': 10 }, fsFeasts: 5, wave: 4 };
  check('R2 days=114', r2.out.days === 114, 'got ' + r2.out.days);
  check('R2 endReason=village-lost', r2.out.endReason === 'village-lost', 'got ' + r2.out.endReason);
  check('R2 hungryDays=3', r2.out.hungryDays === 3, 'got ' + r2.out.hungryDays);
  check('R2 starveDeaths=0', r2.out.starveDeaths === 0, 'got ' + r2.out.starveDeaths);
  check('R2 death multiset == corpus', (() => {
    const ka = Object.keys(r2.out.deaths).sort(), kb = Object.keys(exp.deaths).sort();
    return ka.join(',') === kb.join(',') && ka.every(k => r2.out.deaths[k] === exp.deaths[k]);
  })(), JSON.stringify(r2.out.deaths));
  check('R2 feasts=5', r2.out.fsFeasts === 5, 'got ' + r2.out.fsFeasts);
  check('R2 wave=4', r2.out.wave === 4, 'got ' + r2.out.wave);

  console.log('GREEN — the instrument measures');
  // G1/G2/G3: channels record (belongfeast 40d s11; leadfeast 40d s11)
  const g1 = await runInstrumented('belongfeast', 11, 40);
  const trib = Object.values(g1.W.days).reduce((t, d) => t + (d.ch.tribute || 0), 0);
  check('G1 tribute channel records on belong road', trib > 0, `tribute=${trib}`);
  check('G1 tribute weeks ledger non-empty', g1.W.tributeWeeks.length > 0, `n=${g1.W.tributeWeeks.length}`);
  const g2 = await runInstrumented('leadfeast', 11, 40);
  const tend = Object.values(g2.W.days).reduce((t, d) => t + (d.ch.tend || 0), 0);
  check('G2 tend channel records on lead road', tend > 0, `tend=${tend}`);
  const feast = Object.values(g2.W.days).reduce((t, d) => t + (d.ch.feast || 0), 0);
  check('G3 feast channel records', feast > 0, `feast=${feast} events=${g2.W.feasts.length}`);

  // G4: hungry-day detection on the R2 run (3 hungry days in corpus)
  check('G4 hungry events detected == 3', r2.W.hungryEvents.length === 3,
    `got ${r2.W.hungryEvents.length}: ${JSON.stringify(r2.W.hungryEvents)}`);
  check('G4 say windows captured', r2.W.hungryEvents.every(e => {
    const rec = r2.W.days[e.day]; return rec && Array.isArray(rec.sayWin) && rec.sayWin.length > 0;
  }), 'sayWin present on all hungry days');

  // G5: pooled reconciliation — every deposit is eventually scanned, every
  // consumption wrapped; the 1-day scan smear cancels in the pool.
  // residual = |totalDelta + (totalOut - totalIn)| must be < 5% of gross.
  const dkeys = Object.keys(r2.W.days).map(Number).sort((a, b) => a - b);
  let totalOut = 0, totalIn = 0;
  for (const d of dkeys) {
    const rec = r2.W.days[d];
    for (const [k, v] of Object.entries(rec.ch)) {
      if (k === 'in' || k === 'in-granary') totalIn += v; else totalOut += v;
    }
  }
  const firstStart = r2.W.days[dkeys[0]].start;
  const totalDelta = r2.W.finalPantry - firstStart;
  const gross = totalOut + totalIn + Math.abs(totalDelta);
  const resid = Math.abs(totalDelta + (totalOut - totalIn));
  check('G5 pooled residual < 5% of gross', gross > 0 && resid / gross < 0.05,
    `resid=${Math.round(resid)} gross=${Math.round(gross)} share=${(100 * resid / gross).toFixed(2)}% out=${Math.round(totalOut)} in=${Math.round(totalIn)} delta=${Math.round(totalDelta)}`);

  // G6: determinism — two identical instrumented runs bit-identical
  const g6a = await runInstrumented('leadfeast', 11, 40);
  const g6b = await runInstrumented('leadfeast', 11, 40);
  const hashDays = (W) => Object.keys(W.days).map(Number).sort((a, b) => a - b)
    .map(d => `${d}:${W.days[d].start}:${JSON.stringify(W.days[d].ch)}:${W.days[d].hungry}`).join('\n');
  check('G6 ledger bit-identical across reruns', hashDays(g6a.W) === hashDays(g6b.W));
  check('G6 outcome vectors identical', outEq(g6a.out, g6b.out));

  // G7: surplus channel — the villager-meal surplus deposit is attributed
  // separately from other inflows on the R2 run.
  let surplusTags = 0;
  for (const d of Object.values(r2.W.days)) for (const tag of ((d.tags || {})['in'] || [])) if (tag === 'surplus') surplusTags++;
  check('G7 surplus channel records (villager-meal surplus attributed)', surplusTags > 0 && (r2.W.surplusTotal || 0) > 0,
    `surplus-tagged inflow events=${surplusTags}, W.surplusTotal=${Math.round(r2.W.surplusTotal || 0)}`);

  const fails = results.filter(r => !r.pass);
  console.log(`\n${results.length - fails.length}/${results.length} checks passed.`);
  if (fails.length) { console.log('FAILURES: ' + fails.map(f => f.name).join('; ')); process.exit(1); }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
