#!/usr/bin/env node
// sweep-dmgaudit-r16-20261013.js — scale-wall r16 arm B sweep driver.
// Per-fight wave-1/2 damage audit on the wall suite:
//   SEEDS="11,22,33,44" POLICIES="belongseek,leadcourt" DAYS=150
//   OUT=evidence/2026-10-13/sim-scale-wall-r16-dmgmath-baseline.json
//   node scripts/sweep-dmgaudit-r16-20261013.js
//
// Arm B (before): gates unset. Arm B (after): COMPETENT_W2DISENGAGE=1.
// Each seed x policy runs 150d death-aware (dead villages stop).
//
// TOOLING + policy-side lever only. No game-code balance changes.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');
const { attachDmgAudit } = require('./dmg-audit-20261013');
const { stdSnapshot } = require('./sweep-compare');

const POLICY_REGISTRY = { belongseek, leadcourt };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

(async () => {
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'belongseek,leadcourt').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const gateOn = process.env.COMPETENT_W2DISENGAGE === '1';
  const label = process.env.LEVER || ('w2-disengage ' + (gateOn ? 'AFTER(disengage)' : 'BEFORE(base)'));
  const out = process.env.OUT || null;
  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname + '/..' }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const runs = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'dmgaudit-' + pid });
      await setupGame(Game);
      const audit = attachDmgAudit(Game);
      const scaleHolder = {};
      const scale = attachScale(Game, scaleHolder);
      const policy = Object.assign({}, base);
      const ctxHolder = {};
      const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1, maxVests: 0, exiledEver: false };
      const bearer = { last: null, changes: 0 };
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        ctxHolder.ctx = ctx;
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
          if (vid != null) { if (bearer.last !== null && bearer.last !== vid) bearer.changes += 1; bearer.last = vid; }
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
      const end = stdSnapshot(Game);
      try { const wv = (Game.unlockedWave && Game.unlockedWave()) || 1; hist.maxWave = Math.max(hist.maxWave, wv); } catch (e) {}
      const deaths = {};
      const peopleDeaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = String(d.cause || d.kind || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
          const kk = String(d.kind || '?') + ':' + k;
          peopleDeaths[kk] = (peopleDeaths[kk] || 0) + 1;
        }
      } catch (e) {}
      let countersKnown = 0;
      try { countersKnown = Object.keys((Game.state || {}).monsterCounters || {}).length; } catch (e) {}
      const c = ctxHolder.ctx || {};
      const fights = audit.fights;
      const w12 = fights.filter(f => f.wave === 1 || f.wave === 2);
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
        deaths, peopleDeaths, bearerDeaths: bearer.changes,
        // per-fight damage audit
        nFights: fights.length, nFightsW12: w12.length,
        fights,
        // policy decline telemetry (both arms; gates keep the counters honest)
        faDeclined: c.faDeclined || 0, faSkipped: c.faSkipped || 0,
        fledBad: c.fledBad || 0, fled: c.fled || 0,
        w2dSkipped: c.w2dSkipped || 0, w2dForcedFights: c.w2dForcedFights || 0,
        beastTricks: c.beastTricks || 0, countersKnown,
      };
      runs.push(r);
      const died = w12.filter(f => f.playerDied).length;
      console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} rank=${r.maxRank} nat=${r.national} fights=${r.nFights}(w12=${w12.length}) diedFights=${died} w2dSkip=${r.w2dSkipped} fled=${r.fled}`);
    }
  }
  const byPolicy = {};
  for (const pid of policyIds) {
    const rs = runs.filter(r => r.policy === pid);
    const daysArr = rs.map(r => r.days).sort((a, b) => a - b);
    const median = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
    byPolicy[pid] = {
      runs: rs.length, national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      wins: rs.reduce((t, r) => t + r.won, 0),
      waveReach: Math.max(...rs.map(r => r.waveReach)),
      medianDays: median, maxDays: Math.max(...rs.map(r => r.days)),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      nFightsW12: rs.reduce((t, r) => t + r.nFightsW12, 0),
      w2dSkipped: rs.reduce((t, r) => t + r.w2dSkipped, 0),
      faSkipped: rs.reduce((t, r) => t + r.faSkipped, 0),
      fled: rs.reduce((t, r) => t + r.fled, 0),
    };
  }
  const all = runs;
  const report = {
    label, gateOn, commit, date: new Date().toISOString(), seeds, policies: policyIds, days,
    summary: {
      national: all.reduce((t, r) => t + r.national, 0),
      table: all.reduce((t, r) => t + r.table, 0),
      wins: all.reduce((t, r) => t + r.won, 0),
      waveReach: Math.max(...all.map(r => r.waveReach)),
      medianDays: (() => { const a = all.map(r => r.days).sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; })(),
      maxDays: Math.max(...all.map(r => r.days)),
      exiled: all.reduce((t, r) => t + r.exiled, 0),
      nFightsW12: all.reduce((t, r) => t + r.nFightsW12, 0),
    },
    byPolicy, runs,
  };
  console.log(JSON.stringify({ label, summary: report.summary, byPolicy }, null, 1));
  if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1)); console.log('wrote ' + out); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
