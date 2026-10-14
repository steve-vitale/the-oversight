#!/usr/bin/env node
// sweep-predation-b-20261014.js — PANTRY-PREDATION diagnostic sweep (ARM 3,
// loop B, 2026-10-14, food-economy axis).
//
// INSTRUMENT ONLY — no game-code changes. Wraps the engine's lingering-raider
// pantry gorge (scripts/predation-lib-20261014.js) and sweeps wave-5-rich
// seed sets to measure, per run:
//   - gorge events: nights, events per night, kcal per event/night, pantry
//     trajectory through the gorge window
//   - drive-off counterplay: defender kills, scholar engages, help calls,
//     crisis resolutions, and each lingering episode's resolution
//     (killed / moved-on / lingering-at-end) with attribution
//   - village outcome after gorge windows: survived vs collapsed
//   - wall numbers: national / table / wins, wave 4-5 unlocks, median survival
//
// Wave-5-rich seed sets (from r26/r27 evidence on current tip):
//   POLICY=leadfeast (FEASTSCALE_R13=1): seeds 11/22/33/44/55/66/77/88
//     — r27 census unlocked wave-5 on 22/44/55/88.
//   POLICY=fifthlink (FOURTHLINK=1 FIFTHLINK=1, leadcourt base): seeds
//     11/22/33/44/55/66/77/88 + 101/202/303/404/505/606/707/808
//     — r26 armed unlocked wave-5 on s11/s33/s44/s606 (Standing 204-272).
//
// Death-aware horizon (MEASUREMENT §10): runDays stops on Game.over /
// pop-zero; the cap is a ceiling, never a target.
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" POLICY=leadfeast DAYS=180 \
//     OUT=evidence/2026-10-14/predation-b-leadfeast.json \
//     node scripts/sweep-predation-b-20261014.js
//   SEEDS="11,22,33,44,55,66,77,88,101,202,303,404,505,606,707,808" POLICY=fifthlink DAYS=180 \
//     OUT=evidence/2026-10-14/predation-b-fifthlink.json \
//     node scripts/sweep-predation-b-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const POLICY_ID = process.env.POLICY || 'leadfeast';
if (POLICY_ID === 'leadfeast') process.env.FEASTSCALE_R13 = '1';
if (POLICY_ID === 'fifthlink') { process.env.FOURTHLINK = '1'; process.env.FIFTHLINK = '1'; }
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installPredation, finalizePredation, pantryKcal } = require('./predation-lib-20261014');

function loadPolicy() {
  if (POLICY_ID === 'leadfeast') return require('./policies/feastscale').leadfeast;
  if (POLICY_ID === 'fifthlink') return require('./policies/fifthlink-r26').fifthlink;
  throw new Error('unknown POLICY ' + POLICY_ID);
}
const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };

async function runOne(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'predation', fullTelemetry: false });
  await setupGame(Game);
  const track = installPredation(Game);
  const base = loadPolicy();
  const wallTrack = { maxRank: 0, rankEver: [], tableDays: [], winDay: null, maxWave: 1 };
  const wrapped = Object.assign({}, base, {
    id: base.id + '-predation',
    daily(G, ctx) {
      try {
        track.sampleDay();
        const d = ((G.state || {}).scholar || {}).day || 0;
        try {
          const r = G.scaleRank ? (G.scaleRank() || 'village') : 'village';
          wallTrack.rankEver.push({ day: d, rank: r });
          if ((RANK_ORDER[r] || 0) > wallTrack.maxRank) wallTrack.maxRank = RANK_ORDER[r] || 0;
        } catch (e) {}
        try {
          const pg = G.progState ? G.progState() : {};
          if (pg.tableWaiting || (G.tableActive && G.tableActive())) wallTrack.tableDays.push(d);
        } catch (e) {}
        try { if (G.won && !wallTrack.winDay) wallTrack.winDay = d; } catch (e) {}
        try { if (G.unlockedWave) wallTrack.maxWave = Math.max(wallTrack.maxWave, G.unlockedWave()); } catch (e) {}
      } catch (e) { track.instrErrors.push('daily: ' + e.message); }
      if (base.daily) return base.daily(G, ctx);
    },
  });
  const res = await runDays(Game, wrapped, {
    days, manifest: { policy: POLICY_ID, seed, mode: 'predation' },
  });
  const fin = finalizePredation(Game, track);
  // Collapse-after-gorge: for each gorge night, pantry trajectory +3d and the
  // village end state. A "collapse window" is a gorge night after which the
  // pantry hit <= 500 kcal within 5 days (the s88 hollow signature).
  const panByDay = {};
  for (const s of (fin.samples || [])) panByDay[s.day] = s.pantry;
  const collapseWindows = [];
  for (const gn of (fin.rawGorgeNights || [])) {
    let hitZero = false;
    for (let d = gn.day; d <= gn.day + 5; d++) {
      if (panByDay[d] !== undefined && panByDay[d] <= 500) { hitZero = true; break; }
    }
    collapseWindows.push({ day: gn.day, gorged: gn.totalGorged,
      pantryBefore: gn.pantryBefore, pantryAfter: gn.pantryAfter,
      pantryZeroWithin5d: hitZero });
  }
  const rankNames = Object.keys(RANK_ORDER).filter(k => RANK_ORDER[k] === wallTrack.maxRank);
  return {
    seed, policy: POLICY_ID,
    days: res.days, gameDays: res.gameDays, endReason: res.endReason,
    maxWaveUnlocked: wallTrack.maxWave,
    wave5Unlocked: wallTrack.maxWave >= 5,
    maxRank: rankNames[0] || 'village',
    reachedNational: wallTrack.maxRank >= 3,
    tableDays: wallTrack.tableDays.length,
    won: !!wallTrack.winDay, winDay: wallTrack.winDay,
    predation: {
      gorgeNights: fin.gorgeNights, totalEvents: fin.totalEvents,
      totalGorged: fin.totalGorged, w5Gorged: fin.w5Gorged,
      meanPerEvent: fin.meanPerEvent, meanPerNight: fin.meanPerNight,
      episodes: fin.episodes,
      driveOffs: fin.driveOffs,
      collapseWindows,
      fieldFightsVsLingering: fin.fieldFights.filter(f => f.wasLingering).length,
      scholarEngagesVsLingering: fin.scholarEngages.filter(x => x.wasLingering).length,
      scholarKillsVsLingering: fin.driveOffs.filter(d => d.outcome === 'killed-by-scholar').length,
      villagerKillsVsLingering: fin.driveOffs.filter(d => d.outcome === 'killed-by-villager').length,
      helpCalls: fin.helpCalls,
      aidResolutions: fin.aidResolutions,
      sayBeats: fin.sayBeats,
      instrErrors: fin.instrErrors,
    },
    samples: fin.samples,
  };
}

(async () => {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
  const days = Number(process.env.DAYS || 180);
  const out = process.env.OUT || ('evidence/2026-10-14/predation-b-' + POLICY_ID + '.json');
  const runs = [];
  const t0 = process.hrtime.bigint(); // Date.now() is frozen by the harness — use hrtime
  await quietLog(async () => {
    for (const s of seeds) {
      runs.push(await runOne(s, days));
    }
  });
  const dir = path.dirname(out);
  fs.mkdirSync(dir, { recursive: true });
  const merged = {
    label: 'predation-b-' + POLICY_ID, policy: POLICY_ID, seeds, days,
    generated: new Date().toISOString(),
    note: 'DIAGNOSTIC ARM — measurement only. Instrument: scripts/predation-lib-20261014.js.',
    runs,
  };
  fs.writeFileSync(out, JSON.stringify(merged, null, 1));
  // Per-seed files for reuse.
  for (const r of runs) {
    fs.writeFileSync(path.join(dir, 'predation-b-' + POLICY_ID + '-s' + r.seed + '.json'),
      JSON.stringify(r, null, 1));
  }
  // Console summary (outside quietLog).
  const w5 = runs.filter(r => r.wave5Unlocked).length;
  const gorgers = runs.filter(r => r.predation.totalGorged > 0);
  const tg = runs.reduce((t, r) => t + r.predation.totalGorged, 0);
  const nat = runs.filter(r => r.reachedNational).length;
  const tab = runs.filter(r => r.tableDays > 0).length;
  const wins = runs.filter(r => r.won).length;
  const surv = runs.map(r => r.gameDays).sort((a, b) => a - b);
  const med = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  console.log('seeds=' + seeds.length + ' policy=' + POLICY_ID + ' ' +
    (Number(process.hrtime.bigint() - t0) / 1e9).toFixed(0) + 's');
  console.log('wall: wave5=' + w5 + ' national=' + nat + ' table=' + tab +
    ' wins=' + wins + ' medianSurv=' + med);
  console.log('gorge: runs-with-gorge=' + gorgers.length + ' totalKcal=' + tg +
    ' nights=' + runs.reduce((t, r) => t + r.predation.gorgeNights, 0));
  for (const r of gorgers) {
    console.log('  s' + r.seed + ': nights=' + r.predation.gorgeNights +
      ' kcal=' + r.predation.totalGorged + ' w5=' + r.wave5Unlocked +
      ' eps=' + r.predation.episodes.map(e => e.id + ':' + e.resolution + (e.killer ? '(' + e.killer + ')' : '')).join(','));
  }
  const drovers = runs.filter(r => r.predation.driveOffs.length);
  if (drovers.length) {
    console.log('drive-offs:');
    for (const r of drovers) {
      console.log('  s' + r.seed + ': ' + r.predation.driveOffs
        .map(d => 'd' + d.day + ' ' + d.id + ' ' + d.outcome).join(' | '));
    }
  }
  console.log('wrote ' + out);
})().catch(e => { console.error('SWEEP FAILURE', e); process.exit(2); });
