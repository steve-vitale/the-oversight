#!/usr/bin/env node
// sweep-deathattr-r17-20261013.js — scale-wall r17 arm 1 (scholar-death attribution) sweep driver.
// Wall suite: SEEDS="11,22,33,44,55,66,77,88" POLICIES="competent,winseek" DAYS=150
//   OUT=evidence/2026-10-13/sim-scale-wall-r17-deathattr-<before|after>.json
//   node scripts/sweep-deathattr-r17-20261013.js
//
// Each seed x policy runs 150d death-aware (dead villages stop). Gates unset.
// fullTelemetry: true — the 300-event ring cap EVICTS early death records
// (a 150d run emits ~1000 tele events), which would silently break death
// attribution. The full stream is measurement-only; tele() is gameplay-inert.
//
// Death keying: player deaths (tele 'death' events with player:true, wired in
// ledger.js playerDeath -> corpses.js registerDeath) key as 'player:<cause>';
// everything else keys '<kind>:<cause>' as before. Attribution coverage per
// run = player-death records / bearer-change successions.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek } = require('./policies/winseek');
const { attachScale, scaleRow } = require('./scale-repro-20261013');
const { stdSnapshot } = require('./sweep-compare');

const POLICY_REGISTRY = { competent, winseek };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

(async () => {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'competent,winseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const label = process.env.LEVER || 'deathattr-r17';
  const out = process.env.OUT || null;
  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname + '/..' }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const runs = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'deathattr-' + pid, fullTelemetry: true });
      await setupGame(Game);
      const scaleHolder = {};
      attachScale(Game, scaleHolder);
      const policy = Object.assign({}, base);
      const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1, maxVests: 0, exiledEver: false };
      const bearer = { last: null, changes: 0 };
      const bearerIds = [];
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try {
          const s = stdSnapshot(G);
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
          hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
          hist.maxVests = Math.max(hist.maxVests, s.vests || 0);
          if (s.tableWaiting) hist.everTable = true;
          try { if (G.state && G.state.exiled) hist.exiledEver = true; } catch (e) {}
          try { scaleRow(G); } catch (e) {}
        } catch (e) {}
        try {
          const vid = G.villagerId != null ? G.villagerId : ((G.state || {}).scholar || {}).villagerId;
          if (vid != null) {
            if (bearer.last !== null && bearer.last !== vid) { bearer.changes += 1; bearerIds.push(vid); }
            bearer.last = vid;
          }
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
      const end = stdSnapshot(Game);
      try { const wv = (Game.unlockedWave && Game.unlockedWave()) || 1; hist.maxWave = Math.max(hist.maxWave, wv); } catch (e) {}
      // Death attribution: player-kind records key 'player:<cause>'.
      const deaths = {};
      const peopleDeaths = {};
      const playerDeaths = [];
      try {
        for (const d of (result.samples.deaths || [])) {
          const cause = String(d.cause || d.kind || 'unknown');
          const kk = (d.player ? 'player' : String(d.kind || '?')) + ':' + cause;
          deaths[cause] = (deaths[cause] || 0) + 1;
          peopleDeaths[kk] = (peopleDeaths[kk] || 0) + 1;
          if (d.player) playerDeaths.push({ day: d.day, who: d.who, cause: d.cause });
        }
      } catch (e) {}
      const r = {
        policy: pid, seed, commit,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        won: end.won ? 1 : 0,
        waveReach: Math.max(result.maxWaveUnlocked || 1, hist.maxWave),
        maxArc: hist.maxArc,
        maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
        national: hist.maxRank >= 2 ? 1 : 0,
        table: hist.everTable || end.tableWaiting ? 1 : 0,
        vests: hist.maxVests, exiled: hist.exiledEver ? 1 : 0,
        deaths, peopleDeaths,
        bearerDeaths: bearer.changes,
        playerDeaths, nPlayerDeaths: playerDeaths.length,
        attribution: bearer.changes > 0 ? +(playerDeaths.length / bearer.changes).toFixed(3) : null,
      };
      runs.push(r);
      console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} rank=${r.maxRank} nat=${r.national} bearerDeaths=${r.bearerDeaths} playerDeaths=${r.nPlayerDeaths} attr=${r.attribution}`);
    }
  }
  const byPolicy = {};
  for (const pid of policyIds) {
    const rs = runs.filter(r => r.policy === pid);
    const daysArr = rs.map(r => r.days).sort((a, b) => a - b);
    byPolicy[pid] = {
      runs: rs.length, national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      wins: rs.reduce((t, r) => t + r.won, 0),
      waveReach: Math.max(...rs.map(r => r.waveReach)),
      medianDays: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
      maxDays: Math.max(...rs.map(r => r.days)),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      bearerDeaths: rs.reduce((t, r) => t + r.bearerDeaths, 0),
      playerDeaths: rs.reduce((t, r) => t + r.nPlayerDeaths, 0),
    };
  }
  const all = runs;
  const totSucc = all.reduce((t, r) => t + r.bearerDeaths, 0);
  const totAttr = all.reduce((t, r) => t + r.nPlayerDeaths, 0);
  const report = {
    label, commit, date: new Date().toISOString(), seeds, policies: policyIds, days,
    summary: {
      national: all.reduce((t, r) => t + r.national, 0),
      table: all.reduce((t, r) => t + r.table, 0),
      wins: all.reduce((t, r) => t + r.won, 0),
      waveReach: Math.max(...all.map(r => r.waveReach)),
      medianDays: (() => { const a = all.map(r => r.days).sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; })(),
      maxDays: Math.max(...all.map(r => r.days)),
      exiled: all.reduce((t, r) => t + r.exiled, 0),
      bearerDeaths: totSucc,
      playerDeaths: totAttr,
      attributionCoverage: totSucc > 0 ? +(totAttr / totSucc).toFixed(3) : null,
    },
    byPolicy, runs,
  };
  console.log(JSON.stringify({ label, summary: report.summary, byPolicy }, null, 1));
  if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1)); console.log('wrote ' + out); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
