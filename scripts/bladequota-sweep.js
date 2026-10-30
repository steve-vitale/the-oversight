#!/usr/bin/env node
// bladequota-sweep.js — muster blade-quota reachability sweep (sim-bladequota-a).
// MEASUREMENT ONLY: the snapshot instrument is pure reads (no state writes,
// no RNG draws); no policy or game system ever presses Sound the call /
// Commit Haven's blades in these runs, so yields are hypothetical sounded-call
// yields on wild states. Death-aware: runDays stops on Game.over; the 200d
// cap is an observation ceiling, not a fixed horizon.
// Usage:
//   node scripts/bladequota-sweep.js --seeds 76101,76102 --days 200 \
//     --outdir evidence/2026-10-30/perseed-bladequota-a
// Env: BLADEQUOTA_CAPTURE=1 writes captured say/sysSay lines to the per-seed
// JSON (transcript runs only; default off, so silent runs stay byte-identical
// to the harness baseline).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { leadcourt } = require('./policies/leadcourt');
const { bladeQuotaSnapshot, classifyShortfall } = require('./bladequota-snapshot');

function argVal(name, def) {
  const argv = process.argv;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--' + name && i + 1 < argv.length) return argv[i + 1];
    if (argv[i].indexOf('--' + name + '=') === 0) return argv[i].slice(name.length + 3);
  }
  return def;
}

async function runSeed(seed, opts) {
  opts = opts || {};
  const days = opts.days || 200;
  const capture = opts.capture || null; // array or null
  const policyName = opts.policy || 'competent';
  const basePolicy = policyName === 'leadcourt' ? leadcourt : competent;
  const { Game, manifest, loadFails } = await loadGame({ seed: seed, mode: 'bladequota' });
  if (loadFails && loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  if (capture) {
    Game.say = function () { capture.push(Array.prototype.slice.call(arguments).join(' ')); };
    Game.sysSay = function () { capture.push('[SYS] ' + Array.prototype.slice.call(arguments).join(' ')); };
  }
  await setupGame(Game, 'Columbus, Ohio');
  const daily = [];
  let firstLinkDetail = null, peakDetail = null, peakYield = -1, peakDay = null;
  let omenSeen = {}, maxRank = 'village', nationalEver = false;
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  const wrapped = Object.assign({}, basePolicy, {
    id: policyName,
    daily: function (G, ctx) {
      try { if (typeof basePolicy.daily === 'function') basePolicy.daily(G, ctx); } catch (e) {}
      try {
        const snap = bladeQuotaSnapshot(G, 'herald');
        const day = ((G.state || {}).scholar || {}).day || 0;
        const rank = (typeof G.scaleRank === 'function') ? (G.scaleRank() || 'village') : 'village';
        if ((RANK[rank] || 0) > (RANK[maxRank] || 0)) maxRank = rank;
        if ((RANK[rank] || 0) >= 2) nationalEver = true;
        if (snap.omenStage != null) {
          if (omenSeen[snap.omenStage] == null) omenSeen[snap.omenStage] = day;
        }
        daily.push({
          day: day, links: snap.links.length, alliedYield: snap.alliedYield,
          havenPool: snap.havenPool, totalYield: snap.totalYield,
          refusals: snap.refusals, trustedLinks: snap.trustedLinks,
          cappedLinks: snap.cappedLinks, omenStage: snap.omenStage,
          rank: rank, errors: snap.errors,
        });
        if (snap.links.length && !firstLinkDetail) {
          firstLinkDetail = { day: day, snap: snap };
        }
        if (snap.alliedYield > peakYield) {
          peakYield = snap.alliedYield; peakDay = day;
          peakDetail = { day: day, snap: snap };
        }
      } catch (e) {
        daily.push({ day: ((G.state || {}).scholar || {}).day || 0, instrumentError: String(e && e.message || e) });
      }
    },
  });
  const result = await runDays(Game, wrapped, { days: days, manifest: manifest });
  // Final snapshot (after the last sleep / at Game.over).
  let finalSnap = null;
  try { finalSnap = bladeQuotaSnapshot(Game, 'herald'); } catch (e) { finalSnap = { errors: ['final: ' + e.message] }; }
  let prog = {};
  try { prog = Game.progState ? Game.progState() : {}; } catch (e) {}
  let wave = 1;
  try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const deaths = (result.samples && result.samples.deaths) || [];
  const causeCounts = {};
  deaths.forEach(function (d) { const k = (d && d.cause) || 'unknown'; causeCounts[k] = (causeCounts[k] || 0) + 1; });
  const peakSnap = peakDetail ? peakDetail.snap : null;
  const row = {
    seed: seed, commit: manifest.commit, policy: policyName, daysCap: days,
    gameDays: result.gameDays, daysSimulated: result.days, endReason: result.endReason,
    won: !!Game.won, villageLost: !!Game.villageLost,
    finalRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) { return 'village'; } })(),
    maxRank: maxRank, nationalEver: nationalEver,
    nationalFinal: (function () { try { const r = Game.scaleRank ? Game.scaleRank() : 'village'; return RANK[r] >= 2; } catch (e) { return false; } })(),
    tableWaiting: !!prog.tableWaiting, tableEntered: !!prog.tableDone,
    waveUnlocked: wave, waveKills: result.waveKills || {},
    deathCount: deaths.length, deathCauses: causeCounts,
    omenSeen: omenSeen,
    finalOmen: finalSnap ? finalSnap.omen : null,
    peak: peakDetail ? {
      day: peakDetail.day, alliedYield: peakSnap.alliedYield, totalYield: peakSnap.totalYield,
      havenPool: peakSnap.havenPool, links: peakSnap.links.length,
      classification: classifyShortfall(peakSnap),
      offerable: peakSnap.omenStage != null && peakSnap.omenStage >= 2,
      counterfactual: peakSnap.counterfactual, linksDetail: peakSnap.links,
    } : null,
    firstLink: firstLinkDetail ? { day: firstLinkDetail.day, linksDetail: firstLinkDetail.snap.links } : null,
    final: finalSnap ? {
      alliedYield: finalSnap.alliedYield, totalYield: finalSnap.totalYield,
      havenPool: finalSnap.havenPool, links: finalSnap.links.length,
      classification: classifyShortfall(finalSnap),
      offerable: finalSnap.omenStage != null && finalSnap.omenStage >= 2,
      counterfactual: finalSnap.counterfactual, linksDetail: finalSnap.links,
    } : null,
    daily: daily,
    instrumentErrors: daily.filter(function (d) { return d.instrumentError; }).length,
  };
  if (capture) row.capturedLines = capture.slice();
  return row;
}

async function main() {
  const seeds = argVal('seeds', '').split(',').filter(Boolean).map(Number);
  if (!seeds.length) { console.error('usage: --seeds 76101,76102 [--days 200] [--outdir dir]'); process.exit(2); }
  const days = Number(argVal('days', '200'));
  const policy = argVal('policy', 'competent');
  const outdir = argVal('outdir', path.join(__dirname, '..', 'evidence', '2026-10-30', 'perseed-bladequota-a'));
  fs.mkdirSync(outdir, { recursive: true });
  for (const seed of seeds) {
    const t0 = Date.now();
    const row = await runSeed(seed, { days: days, policy: policy });
    const fp = path.join(outdir, 's' + seed + '.json');
    fs.writeFileSync(fp, JSON.stringify(row, null, 2));
    console.log('seed ' + seed + ': days=' + row.gameDays + ' end=' + row.endReason +
      ' peakYield=' + (row.peak ? row.peak.alliedYield : 'n/a') + '/' + (row.peak ? row.peak.totalYield : 'n/a') +
      ' peakDay=' + (row.peak ? row.peak.day : 'n/a') + ' class=' + (row.peak ? row.peak.classification : 'n/a') +
      ' omenSeen=' + JSON.stringify(row.omenSeen) + ' rank=' + row.maxRank +
      ' wave=' + row.waveUnlocked + ' (' + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error('bladequota-sweep FAILED: ' + (e && e.stack || e)); process.exit(1); });
}
module.exports = { runSeed, bladeQuotaSnapshot, classifyShortfall };
