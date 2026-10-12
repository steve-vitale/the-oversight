#!/usr/bin/env node
// sweep-wave-lever.js — long-run wave-unlock-pacing measurement (2026-10-11).
// Rotation lever 2: wave unlock pacing — deed bars, villager-experience
// counting, wave timing. Wraps sim-harness (shared infra untouched) and
// records, per run, on a FIXED seed set:
//   - first day each wave unlocks (unlockedWave daily), and first day each
//     wave's LEDGER BAR fills (to separate ledger-bound from floor/scale-bound)
//   - ledger points per wave + per-type detail: kills, points, counter-kill
//     bonus extras, perTypeCap hits (is the cap binding? which types fill?)
//   - villager-vs-player kill split per wave per type (villageSlain total
//     minus exact villager kills counted in the fieldFight wrapper —
//     VILLAGER XP LAW: does it fire in real sims?)
//   - villager fight counts + outcomes by wave (fights, vKill, vFlee, vDie)
//   - player fights/day per wave (combat_start telemetry)
//   - scale timeline: first day at each rank
//   - endgame deed bars (wavesFaced distinct per wave) + day each completes
//   - counters discovered; ledger counter-bonus points
//   - arcs, win, tableWaiting, survival days, coarse death buckets
// SENSE: captures sysSay lines (ledger/wave beats), sampled villager fight
// summaries, and end-of-run awayNews — transcripts to READ, not just count.
//
// Usage:
//   SEEDS="1,2,...,20" DAYS=200 POLICIES="competent" OUT=/tmp/x.json \
//     node scripts/sweep-wave-lever.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const POLICIES = { competent };

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

function scaleRankOrder(r) {
  const o = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
  return (o[String(r || '').toLowerCase()] != null) ? o[String(r || '').toLowerCase()] : 0;
}

const RANKS = ['village', 'local', 'regional', 'national', 'global'];

const BEAT_RE = /wave ledger|wave \d.*(unlock|released)|📺.*wave|beasttrick|counter.*(discover|known)|the producers|mirror draft|final draft|at the fire/i;
// (2026-10-12: added "at the fire" — the wave-drop villager reactions would
// otherwise fire in sims but never be captured for the sense read.)

(async () => {
  const seeds = parseList('SEEDS', Array.from({ length: 20 }, (_, i) => String(i + 1)).join(',')).map(Number);
  const policyIds = parseList('POLICIES', 'competent');
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error(`unknown policy: ${pid}`); process.exit(1); }
    for (const seed of seeds) {
      const { Game, manifest } = await loadGame({ seed, mode: pid, fullTelemetry: true });
      await setupGame(Game);

      // ---- instrumentation (sweep-owned wrappers on the singleton; the
      // harness re-evals all modules per seed, so wrapping per-seed is safe)
      const unlockDay = {};      // wave -> first day unlockedWave >= wave
      const barFillDay = {};     // wave -> first day ledger points >= bar
      const scaleDay = {};       // rank -> first day scaleRank == rank
      const deedDay = {};        // 'deedN' -> first day bar met
      const villFights = {};     // wave -> {n, vKill, vFlee, vDie, other}
      const villKillsByType = {}; // monsterId -> count (exact, from wrapper)
      const villKillCounter = {}; // monsterId -> vKills scored with counter known
      const fightSamples = [];    // sampled villager fight summaries (sense)
      const sayLines = [];        // sysSay + matching say lines (sense)
      const playerIds = new Set();

      // narration capture (harness silenced say/sysSay — re-wrap to sample)
      Game.sysSay = function (...a) {
        try { const s = a.join(' '); if (sayLines.length < 400) sayLines.push({ day: (this.state.scholar || {}).day || 0, line: String(s).slice(0, 320) }); } catch (e) {}
      };
      const rawSay = Game.say;
      Game.say = function (...a) {
        try { const s = String(a.join(' ')); if (BEAT_RE.test(s) && sayLines.length < 400) sayLines.push({ day: (this.state.scholar || {}).day || 0, line: s.slice(0, 320) }); } catch (e) {}
      };

      // villager fight instrumentation: exact killer-side counts by type
      const origFF = Game.fieldFight.bind(Game);
      Game.fieldFight = function (vid, mdef, m, opts) {
        let rec = null;
        try { rec = origFF(vid, mdef, m, opts); } catch (e) { throw e; }
        try {
          const wave = (mdef && mdef.wave) || 1;
          const o = rec && rec.outcome;
          villFights[wave] = villFights[wave] || { n: 0, vKill: 0, vFlee: 0, vDie: 0, alreadyDead: 0, evade: 0, other: 0 };
          villFights[wave].n++;
          if (o === 'vKill') villFights[wave].vKill++;
          else if (o === 'vFlee') villFights[wave].vFlee++;
          else if (o === 'vDie') villFights[wave].vDie++;
          else if (o === 'alreadyDead') villFights[wave].alreadyDead++;
          else if (o === 'evade') villFights[wave].evade++;
          else { villFights[wave].other++; villFights[wave]['o_' + o] = (villFights[wave]['o_' + o] || 0) + 1; }
          const mid = (mdef && mdef.id) || (m && m.id);
          if (o === 'vKill' && mid) {
            villKillsByType[mid] = (villKillsByType[mid] || 0) + 1;
            if (Game.monsterCounterKnown && Game.monsterCounterKnown(mid)) villKillCounter[mid] = (villKillCounter[mid] || 0) + 1;
          }
          if (fightSamples.length < 14 && rec && o) {
            let person = null;
            try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
            const first = person ? String(person.name).split(' ')[0] : 'Someone';
            let summary = '';
            try { summary = Game.fieldFightSummary ? Game.fieldFightSummary(rec, first, (mdef && mdef.name) || mid) : ''; } catch (e) {}
            fightSamples.push({ day: (Game.state.scholar || {}).day || 0, vid: first, mid, wave, outcome: o, rounds: rec.rounds || rec.roundLog && rec.roundLog.length || '?', vTaken: rec.vTaken, mTaken: rec.mTaken, summary: String(summary).slice(0, 400) });
          }
        } catch (e) {}
        return rec;
      };

      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try {
          const day = (G.state.scholar || {}).day || 0;
          if (G.villagerId) playerIds.add(G.villagerId);
          const w = G.unlockedWave ? G.unlockedWave() : 1;
          for (let u = 2; u <= 5; u++) if (w >= u && !(u in unlockDay)) unlockDay[u] = day;
          if (G.scaleRank) { const r = G.scaleRank(); if (!(r in scaleDay)) scaleDay[r] = day; }
          try {
            const cfg = G.waveLedgerCfg ? G.waveLedgerCfg() : { barsPerWave: {} };
            for (let u = 1; u <= 5; u++) {
              const bar = (cfg.barsPerWave || {})[u];
              if (bar && !(u in barFillDay) && G.waveLedgerPoints && G.waveLedgerPoints(u) >= bar) barFillDay[u] = day;
            }
          } catch (e) {}
          try {
            const d = (G.progState().deeds || {}).wavesFaced || {};
            const cnt = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            for (const mid of Object.keys(d)) { const ww = d[mid] | 0; if (cnt[ww] != null) cnt[ww]++; }
            const need = { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 };
            for (let u = 1; u <= 5; u++) if (!(u in deedDay) && cnt[u] >= need[u]) deedDay[u] = day;
          } catch (e) {}
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };

      const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
      const telemetry = result.telemetry || [];

      // ---- monster id -> wave map ----
      const waveOf = {};
      try { for (const m of (Game.data.monsters || [])) waveOf[m.id] = m.wave || 1; } catch (e) {}

      // ---- ledger detail ----
      const ledger = {};
      let capNow = 2;
      try { capNow = (Game.waveLedgerCfg && Game.waveLedgerCfg().perTypeCap) || 2; } catch (e) {}
      try {
        const wl = Game.state.waveLedger || {};
        const slain = Game.state.villageSlain || {};
        for (let w = 1; w <= 5; w++) {
          const e = wl[w] || { points: 0, perType: {} };
          const perType = {};
          for (const t of Object.keys(e.perType || {})) {
            const pts = e.perType[t] | 0;
            const kills = slain[t] | 0;
            const villK = villKillsByType[t] | 0;
            perType[t] = {
              points: pts, kills, villKills: villK, playerKills: kills - villK,
              // counter-kill bonus extras: points beyond plain kills
              // (each counter kill adds 1 extra; clipped by perTypeCap)
              counterBonusExtras: Math.max(0, pts - kills),
              capHit: pts >= capNow, // perTypeCap from live config
            };
          }
          ledger[w] = { points: e.points | 0, perType };
        }
      } catch (e) {}

      // ---- kills per wave by source ----
      const killsByWave = {};
      try {
        const slain = Game.state.villageSlain || {};
        for (const t of Object.keys(slain)) {
          const w = waveOf[t] || '?';
          killsByWave[w] = killsByWave[w] || { total: 0, villager: 0, player: 0 };
          killsByWave[w].total += slain[t];
          killsByWave[w].villager += villKillsByType[t] | 0;
          killsByWave[w].player += (slain[t] | 0) - (villKillsByType[t] | 0);
        }
      } catch (e) {}

      // ---- player fights per wave (telemetry combat_start) ----
      const playerFights = {};
      const combatOutcomes = {};
      for (const ev of telemetry) {
        if (ev.type === 'combat_start') { const w = ev.wave || '?'; playerFights[w] = (playerFights[w] || 0) + 1; }
        if (ev.type === 'combat_end') { const r = ev.result || '?'; combatOutcomes[r] = (combatOutcomes[r] || 0) + 1; }
      }

      // ---- counters ----
      let countersKnown = 0;
      try { countersKnown = Object.keys(Game.state.monsterCounters || {}).length; } catch (e) {}
      let counterTele = 0;
      for (const ev of telemetry) if (ev.type === 'counter_discovered') counterTele++;

      // ---- deaths (coarse) ----
      let deaths = 0;
      const deathCauses = {};
      for (const ev of telemetry) {
        if (ev.type !== 'death' || (ev.kind || '') === 'monster') continue;
        deaths++;
        const c = String(ev.cause || '?').toLowerCase().slice(0, 40);
        deathCauses[c] = (deathCauses[c] || 0) + 1;
      }

      // ---- deed bars final ----
      let deedBars = {};
      try {
        const d = (Game.progState().deeds || {}).wavesFaced || {};
        const cnt = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const mid of Object.keys(d)) { const ww = d[mid] | 0; if (cnt[ww] != null) cnt[ww]++; }
        deedBars = cnt;
      } catch (e) {}

      // ---- scale / realm / arc / win ----
      let maxScale = 'village';
      try { for (const r of Object.keys(scaleDay)) if (scaleRankOrder(r) > scaleRankOrder(maxScale)) maxScale = r; } catch (e) {}
      let realmMax = 0;
      try {
        const links = (Game.hierarchyState ? Game.hierarchyState() : []) || [];
        for (const l of links) { const sz = 1 + ((l.subs || []).length || 0); if (sz > realmMax) realmMax = sz; }
      } catch (e) {}
      let maxArc = 1, tableWaiting = false, won = false, breadth = 0, stage = 0, sentiment = false;
      try { const pg = Game.progState(); maxArc = pg.arc || 1; tableWaiting = !!pg.tableWaiting; sentiment = !!pg.sentimentTaught; } catch (e) {}
      try { won = !!Game.won; } catch (e) {}
      try { breadth = Game.codexBreadth(); } catch (e) {}
      try { stage = Game.integrationStage(); } catch (e) {}

      let awayNews = [];
      try { awayNews = ((Game.state.scholar || {}).awayNews || []).slice(); } catch (e) {}

      const runDaysN = result.days;
      const fightsPerDay = {};
      for (const [w, n] of Object.entries(playerFights)) fightsPerDay['p' + w] = +(n / Math.max(1, runDaysN)).toFixed(3);
      for (const [w, v] of Object.entries(villFights)) fightsPerDay['v' + w] = +((v.n || 0) / Math.max(1, runDaysN)).toFixed(3);

      runs.push({
        seed, days: runDaysN, endReason: result.endReason,
        unlockDay, barFillDay, scaleDay, deedDay,
        maxWave: result.maxWaveUnlocked, maxArc, won, tableWaiting, breadth, stage, sentiment,
        maxScale, realmMax,
        ledger, killsByWave, villFights,
        playerFights, combatOutcomes, fightsPerDay,
        countersKnown, counterTele,
        deaths, deathCauses, deedBars,
        sayLines: sayLines.slice(0, 60), fightSamples, awayNews: awayNews.slice(0, 8),
        ms: result.ms,
      });
      console.log(`done: seed=${seed} days=${runDaysN} end=${result.endReason} unlock=${JSON.stringify(unlockDay)} barfill=${JSON.stringify(barFillDay)} scale=${JSON.stringify(scaleDay)} pfights=${JSON.stringify(playerFights)} vfights=${JSON.stringify(Object.fromEntries(Object.entries(villFights).map(([w, v]) => [w, v.n])))}`);
    }
  }

  // ---- aggregate ----
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const med = (a) => { const s = a.filter(x => x != null).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const agg = {};
  for (const pid of policyIds) {
    const pr = runs.filter(r => r.seed != null);
    const reach = {};
    for (const w of [2, 3, 4, 5]) {
      const ds = pr.map(r => r.unlockDay[w]).filter(x => x != null);
      const fs = pr.map(r => r.barFillDay[w - 1]).filter(x => x != null);
      reach['w' + w] = {
        unlockRuns: ds.length, unlockMedianDay: med(ds), unlockDays: ds,
        barRuns: fs.length, barMedianDay: med(fs),
      };
    }
    const scaleDist = {};
    for (const r of pr) scaleDist[r.maxScale] = (scaleDist[r.maxScale] || 0) + 1;
    const ds = pr.map(r => r.days).sort((a, b) => a - b);
    // ledger per wave: median points, cap-hit types, counter extras, villager kill share
    const ledAgg = {};
    for (const w of [1, 2, 3, 4, 5]) {
      const pts = pr.map(r => (r.ledger[w] || {}).points || 0);
      let capHits = 0, capTypes = {}, counterExtras = 0, villK = 0, totK = 0, typeFill = {};
      for (const r of pr) {
        const e = r.ledger[w] || { perType: {} };
        for (const [t, d] of Object.entries(e.perType || {})) {
          if (d.capHit) { capHits++; capTypes[t] = (capTypes[t] || 0) + 1; }
          counterExtras += d.counterBonusExtras || 0;
          typeFill[t] = (typeFill[t] || 0) + 1;
        }
        const k = r.killsByWave[w] || {};
        villK += k.villager || 0; totK += k.total || 0;
      }
      ledAgg[w] = {
        medianPoints: med(pts), maxPoints: Math.max.apply(null, pts),
        capHits, capTypes, counterExtras,
        villagerKills: villK, totalKills: totK,
        villagerShare: totK ? +(100 * villK / totK).toFixed(1) : null,
        typesTouched: Object.keys(typeFill).length,
      };
    }
    // villager fight outcomes by wave
    const vOut = {};
    for (const r of pr) for (const [w, v] of Object.entries(r.villFights)) {
      vOut[w] = vOut[w] || { n: 0 };
      for (const k of Object.keys(v)) if (typeof v[k] === 'number') vOut[w][k] = (vOut[w][k] || 0) + v[k];
    }
    // fights/day
    const fpd = {};
    for (const r of pr) for (const [k, v] of Object.entries(r.fightsPerDay)) { fpd[k] = fpd[k] || []; fpd[k].push(v); }
    const fpdMed = {}; for (const k of Object.keys(fpd)) fpdMed[k] = +med(fpd[k]).toFixed(3);
    // scale first-day
    const scaleFirst = {};
    for (const r of RANKS) { const xs = pr.map(x => x.scaleDay[r]).filter(x => x != null); if (xs.length) scaleFirst[r] = { runs: xs.length, medianDay: med(xs) }; }
    // death causes top
    const dc = {};
    for (const r of pr) for (const [c, n] of Object.entries(r.deathCauses)) dc[c] = (dc[c] || 0) + n;
    const dcTop = Object.entries(dc).sort((a, b) => b[1] - a[1]).slice(0, 8);
    agg[pid] = {
      n: pr.length,
      medianDays: med(pr.map(r => r.days)), maxDays: Math.max.apply(null, pr.map(r => r.days)),
      endReasons: pr.reduce((o, r) => { o[r.endReason] = (o[r.endReason] || 0) + 1; return o; }, {}),
      won: pr.filter(r => r.won).length, tableWaiting: pr.filter(r => r.tableWaiting).length,
      arcDist: pr.reduce((o, r) => { o[r.maxArc] = (o[r.maxArc] || 0) + 1; return o; }, {}),
      waveUnlockDist: pr.reduce((o, r) => { o[r.maxWave] = (o[r.maxWave] || 0) + 1; return o; }, {}),
      reach, scaleDist, scaleFirst, realmMaxMax: Math.max.apply(null, pr.map(r => r.realmMax)),
      ledAgg, villOutcomes: vOut, fightsPerDayMedian: fpdMed,
      countersKnown: sum(pr.map(r => r.countersKnown)), counterTele: sum(pr.map(r => r.counterTele)),
      deaths: sum(pr.map(r => r.deaths)), deathCausesTop: dcTop,
      deedDayMedian: (() => { const o = {}; for (const w of [1, 2, 3, 4, 5]) { const xs = pr.map(r => r.deedDay[w]).filter(x => x != null); o['w' + w] = xs.length ? { runs: xs.length, medianDay: med(xs) } : null; } return o; })(),
      meanBreadth: +(sum(pr.map(r => r.breadth)) / pr.length).toFixed(1),
      meanStage: +(sum(pr.map(r => r.stage)) / pr.length).toFixed(1),
    };
  }
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10) }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
