#!/usr/bin/env node
// scripts/sweep-raiddensity-20261015.js — before/after sweep for the
// RAIDDENSITY Haven post-raid cooldown arm (flesh-out sim-raiddensity).
//
// Substrate (the #312 lesson): FEASTSCALE_R13=1 is REQUIRED; policies are
// leadfeast/belongfeast from scripts/policies/feastscale.js. The armed half
// additionally sets RAIDDENSITY=1. Run the control and armed halves as
// separate processes on identical seeds (16 runs each):
//
//   FEASTSCALE_R13=1 node scripts/sweep-raiddensity-20261015.js \
//     --tag control --out evidence/2026-10-15/telemetry-raiddensity
//   FEASTSCALE_R13=1 RAIDDENSITY=1 node scripts/sweep-raiddensity-20261015.js \
//     --tag armed --out evidence/2026-10-15/telemetry-raiddensity
//
// Pre-registered primary (binding, §14): combined-channel night-raid
// clusters (>=2 rival raids within 5d) on young nationals (first 60
// hold-days) — armed <= 0.5x control cluster count. Mechanism check: armed
// young-national raids staged within 7d of a prior raid = 0.
// Guardrails: national reaches >= control-2; median survival >= control-10d;
// no new death mode; fiction lines sense-checked in the proof test.
//
// Seeds: 11/22/33/44/55/66/77/88 x {leadfeast, belongfeast}, 180d,
// death-aware (runDays stops dead villages after a +10d tail).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('SWEEP FATAL: FEASTSCALE_R13=1 required (#312 lesson).');
  process.exit(2);
}
const ARMED = process.env.RAIDDENSITY === '1';
const tag = (process.argv.find(a => a.startsWith('--tag=')) || '').slice(6) || (ARMED ? 'armed' : 'control');
const outDir = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6) || 'evidence/2026-10-15/telemetry-raiddensity';

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

const { leadfeast, belongfeast } = require('./policies/feastscale');
const POL = { leadfeast, belongfeast };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };

// Classify a say-line into a raid event (or null).
function classify(line) {
  if (line.includes('🌙 Raid —') && line.includes('came in the night')) return { channel: 'commons', kind: 'staged' };
  if (line.includes('doubled watch turned it')) return { channel: 'commons', kind: 'blocked' };
  if (line.includes('Your pantry or your blood')) return { channel: 'famine', kind: 'staged' };
  if (line.includes("We're asking. Not taking")) return { channel: 'famine', kind: 'converted-beg' };
  if (line.includes('asking again this soon buys nothing')) return { channel: 'famine', kind: 'blocked-none' };
  if (line.includes("didn't wait") && line.includes('hit the stores')) return { channel: 'famine', kind: 'unanswered-aftermath' };
  return null;
}

// Clusters: maximal chains of >=2 staged raids with consecutive gaps <=5d.
function clusterCount(sortedDays) {
  let clusters = 0, i = 0;
  while (i < sortedDays.length) {
    let j = i;
    while (j + 1 < sortedDays.length && sortedDays[j + 1] - sortedDays[j] <= 5) j++;
    if (j > i) clusters++;
    i = j + 1;
  }
  return clusters;
}

async function oneRun(pid, seed) {
  const { Game } = await loadGame({ seed, mode: `rd-sweep-${tag}-${pid}-s${seed}`, narration: true });
  await setupGame(Game);
  const raidLines = [];
  const dailyRanks = [];
  const origSay = Game.say;
  Game.say = function (msg) {
    const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
    const ev = classify(t);
    if (ev) raidLines.push({ day: gday(Game), channel: ev.channel, kind: ev.kind, text: t.slice(0, 160) });
    return origSay ? origSay.call(Game, msg) : msg;
  };
  const base = POL[pid];
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      dailyRanks.push({ day: gday(G), rank: (G.scaleRank ? G.scaleRank() : 'village') || 'village', nationalLive: !!(G.state && G.state.nationalLive) });
    } catch (e) {}
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS });
  Game.say = origSay;

  // young-national day set: first 60 hold-days from first national/global day
  let formDay = null;
  for (const r of dailyRanks) {
    if (r.rank === 'national' || r.rank === 'global') { formDay = r.day; break; }
  }
  const youngDays = new Set();
  if (formDay != null) {
    for (const r of dailyRanks) {
      if ((r.rank === 'national' || r.rank === 'global') && r.day >= formDay && r.day < formDay + 60) youngDays.add(r.day);
    }
  }
  const staged = raidLines.filter(e => e.kind === 'staged');
  const youngStaged = staged.filter(e => youngDays.has(e.day)).map(e => e.day).sort((a, b) => a - b);
  // mechanism check: armed young-national staged raid within 7d of a prior staged raid
  let within7d = 0;
  for (let i = 1; i < youngStaged.length; i++) if (youngStaged[i] - youngStaged[i - 1] <= 7) within7d++;

  let end = {};
  try {
    end.won = !!Game.won;
    const pg = Game.progState ? Game.progState() : {};
    end.table = !!pg.tableWaiting;
    end.tableEntered = !!pg.tableDone;
    end.exiled = (Game.state.scholar || {}).exiled === true;
  } catch (e) {}
  let maxRank = 0;
  const RO = { village: 0, regional: 1, national: 2, global: 3 };
  for (const r of dailyRanks) maxRank = Math.max(maxRank, RO[r.rank] || 0);
  let endRank = 'village';
  try { endRank = Game.scaleRank ? (Game.scaleRank() || 'village') : 'village'; } catch (e) {}
  maxRank = Math.max(maxRank, RO[endRank] || 0);

  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}

  return {
    arm: tag, policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    national: maxRank >= 2 ? 1 : 0,
    table: end.table ? 1 : 0, tableEntered: end.tableEntered ? 1 : 0,
    wins: end.won ? 1 : 0, exiled: end.exiled ? 1 : 0,
    formDay,
    stagedRaids: staged.map(e => ({ day: e.day, channel: e.channel })),
    youngStagedRaidDays: youngStaged,
    clusters: clusterCount(youngStaged),
    raidsWithin7d: within7d,
    blockedCommons: raidLines.filter(e => e.kind === 'blocked').length,
    convertedBegs: raidLines.filter(e => e.kind === 'converted-beg').length,
    begCooldownBlocks: raidLines.filter(e => e.kind === 'blocked-none').length,
    unansweredAftermaths: raidLines.filter(e => e.kind === 'unanswered-aftermath').length,
    deathCauses: deaths,
    waveUnlocked: result.maxWaveUnlocked || 1,
  };
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const row = await oneRun(pid, seed);
      rows.push(row);
      const fp = path.join(outDir, `${tag}-${pid}-s${seed}.json`);
      fs.writeFileSync(fp, JSON.stringify(row, null, 1) + '\n');
      console.log(`${tag} ${pid} s${seed}: ${row.gameDays}d end=${row.endReason} nat=${row.national} clusters=${row.clusters} youngStaged=${row.youngStagedRaidDays.length} within7d=${row.raidsWithin7d} blocked=${row.blockedCommons} conv=${row.convertedBegs} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    }
  }
  // aggregate summary
  const agg = (f) => rows.reduce((t, r) => t + f(r), 0);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const summary = {
    tag, seeds: SEEDS, policies: POLICIES, days: DAYS, runs: rows.length,
    national: agg(r => r.national),
    table: agg(r => r.table), tableEntered: agg(r => r.tableEntered),
    wins: agg(r => r.wins), exiled: agg(r => r.exiled),
    clusters: agg(r => r.clusters),
    youngStagedRaids: agg(r => r.youngStagedRaidDays.length),
    raidsWithin7d: agg(r => r.raidsWithin7d),
    blockedCommons: agg(r => r.blockedCommons),
    convertedBegs: agg(r => r.convertedBegs),
    begCooldownBlocks: agg(r => r.begCooldownBlocks),
    unansweredAftermaths: agg(r => r.unansweredAftermaths),
    medianSurvival: med(rows.map(r => r.gameDays)),
    maxSurvival: Math.max.apply(null, rows.map(r => r.gameDays)),
    deathCauses: {},
  };
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses)) summary.deathCauses[k] = (summary.deathCauses[k] || 0) + v;
  fs.writeFileSync(path.join(outDir, `${tag}-summary.json`), JSON.stringify(summary, null, 1) + '\n');
  console.log('\nSUMMARY ' + tag + ': ' + JSON.stringify(summary, null, 1));
})().catch(e => { console.error('SWEEP FATAL:', e && e.stack || e); process.exit(1); });
