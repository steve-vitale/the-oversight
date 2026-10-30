#!/usr/bin/env node
// probe-woodshort-ledger-b.js — DIAGNOSTIC ONLY (not a judged leg).
// Dumps the stranded player's pack contents on still-refused creek
// evenings, to explain campfire trigger misses (pilot: all 3
// still-refused evenings missed on no-raw-food). Same policy chain
// and env gates as the judged driver; output is diagnosis for the
// evidence file's metric-review section, never a judged count.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withCampfire, newStore: newCfStore } = require('./policies/campfire');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY=1 for this probe'); process.exit(2); }
if (process.env.CAMPFIRE !== '1') { console.error('FATAL: CAMPFIRE=1 for this probe'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }

const SEED = parseInt(process.env.SEEDS || '15215', 10);
const DAYS = parseInt(process.env.DAYS || '30', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'nighttravel-b', fullTelemetry: false });
  await setupGame(Game);
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const camped = withCampfire(base, newCfStore());
  let callIdx = 0;
  const rows = [];
  const policy = Object.assign({}, camped, {
    daily(Game2, ctx) {
      callIdx++;
      camped.daily(Game2, ctx);
      const wc = ctx._wcLast || {};
      if (wc.outcome === 'travel-refused' && wc.bucket === 'creek' && !wc.rescued) {
        const inv = ((Game2.state || {}).scholar || {}).inventory || [];
        const items = inv.map((it) => ({ name: it.name || it.itemId || it.id,
          rawKcal: it.rawKcal ?? null, needsCooking: !!it.needsCooking,
          kcalEach: it.kcalEach ?? null, units: it.units ?? null,
          diseaseRisk: !!it.diseaseRisk, safe: it.safe ?? null,
          material: it.material || null }));
        let branches = null, wood = null, nearFire = false;
        try { branches = Game2.materialCount('branch'); } catch (e) {}
        try { wood = Game2.woodCount(); } catch (e) {}
        try { nearFire = !!Game2.nearFire(); } catch (e) {}
        rows.push({ seed: SEED, loopDay: callIdx,
          skip: (wc.bridge || {}).skip, woodPlayer: (wc.classification || {}).woodPlayer,
          kcal: (wc.classification || {}).kcalLive, ticks: (wc.classification || {}).ticksToDayEnd,
          packWood: wood, branches, nearFire, campMiss: (ctx._cfLast || {}).miss || null,
          items });
      }
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  for (const row of rows) console.log(JSON.stringify(row));
  console.log('probe done seed=' + SEED + ' end=' + result.endReason + ' days=' + result.days + ' stillRefusedCreek=' + rows.length);
})().catch((e) => { console.error('PROBE CRASH', e && (e.stack || e)); process.exit(2); });
