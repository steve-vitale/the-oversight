#!/usr/bin/env node
// scripts/sweep-distrhalf-20261015.js — measurement sweep for the distrhalf
// distribution-starvation instrument (loop B, 2026-10-15, #272).
//
// DIAGNOSTIC ONLY: measures the CONTROL substrate (no lever, no armed side).
// Substrate: 8 seeds (11/22/33/44/55/66/77/88) x {leadcourt, belongseek},
// 180d death-aware. Every villager hunger-day (census: ate < 0.6*need) and
// every scholar hunger-day (overnight STARVING) is attributed to channel
// (a)/(b)/(c) by scripts/distrhalf-lib-20261015.js.
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   DIAGNOSTIC GO: >= 90% of villager hunger-days attributed to a NAMED
//     channel (a/b/c-with-sub-label), and the trust-throttled channel (b)
//     quantified in villager-days and share of total hunger-days.
//   MISS -> instrument repaired, evidence only.
//   Horizon: 180d death-aware (dead villages stop +10d tail).
//   Seeds: 11/22/33/44/55/66/77/88, identical across policies.
//   Det-gate: scripts/test-distrhalf-20261015.js PART C green first.
//
// SMOKE=1: 1 seed (belongseek s11) x 25d — instrument-honesty asserts
// (meals/nights/dawns captured, policy.daily fired, >=0 hunger-days all
// attributed when present).
//
// Outputs: PERSEED_DIR JSON per run, TRANSCRIPT_DIR beats per run, and a
// sweep JSON with the pooled attribution + wall numbers + GO verdict.
//
// Usage:
//   SMOKE=1 node scripts/sweep-distrhalf-20261015.js
//   LEVER=distrhalf SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     OUT=evidence/2026-10-15/distrhalf-sweep.json \
//     PERSEED_DIR=evidence/2026-10-15/perseed-distrhalf \
//     TRANSCRIPT_DIR=evidence/2026-10-15/distrhalf-transcripts \
//     node scripts/sweep-distrhalf-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installDistrHalf, finalizeDistrHalf } = require('./distrhalf-lib-20261015');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',');
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', breadth: 0, stage: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  return out;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed, policyId, days, tdir) {
  const { Game } = await loadGame({ seed, mode: 'distrhalf' });
  await setupGame(Game);
  const base = require('./policies/' + policyId)[policyId];
  const track = installDistrHalf(Game);
  // hunger-relevant beat capture (sense-testing)
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Half ration|half ration|starv|hunger|STARVING|pantry is empty|bins are echoing|HUNGER WINTER|went to sleep hungry|trust/i.test(s) && beats.length < 8000)
        beats.push({ day: gday(Game), text: s.slice(0, 500) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const policy = Object.assign({}, base);
  const origSetup = base.setup, origDaily = base.daily;
  let dailyCalls = 0;
  policy.setup = (G, ctx) => { if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1 };
  policy.daily = (G, ctx) => {
    dailyCalls++;
    try { track.dawn(G); } catch (e) {}
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave() || 1);
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const rep = finalizeDistrHalf(Game, track);
  const deaths = {};
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
    }
  } catch (e) {}
  Game.say = oSay;
  try { track.uninstall(); } catch (e) {}
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(path.join(tdir, `${policyId}-s${seed}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  const hungerDays = rep.hungerDays;
  const scholarDays = hungerDays.filter(h => h.subject === 'scholar');
  const villagerDays = hungerDays.filter(h => h.subject === 'villager');
  const chanB = hungerDays.filter(h => h.channel === 'b');
  return {
    policy: policyId, seed, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: end.won ? 1 : 0, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    waveReach: hist.maxWave,
    deaths, starveDeaths,
    dailyCalls,
    nMeals: rep.nMeals, nNights: rep.nNights,
    hungerDays: hungerDays.length,
    scholarHungerDays: scholarDays.length, villagerHungerDays: villagerDays.length,
    byChannel: rep.byChannel, byLabel: rep.byLabel,
    chanBdays: chanB.length,
    unattributed: rep.unattributed,
    beatGateMismatches: rep.beatGateMismatches,
    resolveDayWrapped: rep.resolveDayWrapped,
    // compact hunger-day rows for the analyzer
    rows: hungerDays.map(h => ({
      day: h.day, subject: h.subject, vid: h.vid, channel: h.channel, label: h.label,
      freshDaysDawn: h.freshDaysDawn == null ? null : +h.freshDaysDawn.toFixed(2),
      trust: h.trust, ate: h.ate, need: h.need,
      halfRationNamed: !!h.halfRationNamed,
      mealTaken: h.meal ? h.meal.taken : null,
      mealTrust: h.meal ? h.meal.trust : null,
      mealBelow06: h.meal ? h.meal.mealBelow06 : null,
    })),
  };
}

async function smokeGate() {
  console.log('== distrhalf SMOKE ==');
  const r = await oneRun(11, 'belongseek', 25, null);
  const fails = [];
  const check = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  check('policy.daily fired', r.dailyCalls >= 20, `calls=${r.dailyCalls}`);
  check('scholar meals captured', r.nMeals >= 20, `meals=${r.nMeals}`);
  check('overnight resolveDay captured', r.nNights >= 20, `nights=${r.nNights}`);
  check('resolveDay wrap installed', r.resolveDayWrapped === true);
  check('zero unattributed hunger-days', r.unattributed === 0, `unattributed=${r.unattributed}`);
  check('zero beat-gate mismatches', r.beatGateMismatches === 0, `mismatches=${r.beatGateMismatches}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smokeGate(); return; }
  console.log(`== distrhalf sweep: ${SEEDS.length} seeds x ${POLICIES.length} policies, ${DAYS}d ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid, DAYS, TRANSCRIPT_DIR);
      runs.push(r);
      console.log(`  [${pid} s${seed}] days=${r.days} end=${r.endReason} ` +
        `hunger=${r.hungerDays} (scholar=${r.scholarHungerDays} villager=${r.villagerHungerDays}) ` +
        `chan=${JSON.stringify(r.byChannel)} unattrib=${r.unattributed} ` +
        `wave=${r.waveReach} rank=${r.maxRank}`);
      if (PERSEED_DIR) {
        try {
          fs.mkdirSync(PERSEED_DIR, { recursive: true });
          fs.writeFileSync(path.join(PERSEED_DIR, `distrhalf-${pid}-s${seed}.json`),
            JSON.stringify(r, null, 1));
        } catch (e) {}
      }
    }
  }
  // ---- pooled analysis ----
  const byPolicy = {}, pooled = { byChannel: {}, byLabel: {}, hungerDays: 0,
    scholarHungerDays: 0, villagerHungerDays: 0, chanBdays: 0, unattributed: 0 };
  for (const pid of POLICIES) {
    const rs = runs.filter(r => r.policy === pid);
    const agg = { n: rs.length, hungerDays: 0, scholarHungerDays: 0, villagerHungerDays: 0,
      chanBdays: 0, unattributed: 0, byChannel: {}, byLabel: {} };
    for (const r of rs) {
      agg.hungerDays += r.hungerDays; agg.scholarHungerDays += r.scholarHungerDays;
      agg.villagerHungerDays += r.villagerHungerDays; agg.chanBdays += r.chanBdays;
      agg.unattributed += r.unattributed;
      for (const [k, v] of Object.entries(r.byChannel)) {
        agg.byChannel[k] = (agg.byChannel[k] || 0) + v;
        pooled.byChannel[k] = (pooled.byChannel[k] || 0) + v;
      }
      for (const [k, v] of Object.entries(r.byLabel)) {
        agg.byLabel[k] = (agg.byLabel[k] || 0) + v;
        pooled.byLabel[k] = (pooled.byLabel[k] || 0) + v;
      }
    }
    const named = agg.hungerDays - agg.unattributed;
    agg.namedShare = agg.hungerDays ? named / agg.hungerDays : null;
    byPolicy[pid] = agg;
    pooled.hungerDays += agg.hungerDays; pooled.scholarHungerDays += agg.scholarHungerDays;
    pooled.villagerHungerDays += agg.villagerHungerDays; pooled.chanBdays += agg.chanBdays;
    pooled.unattributed += agg.unattributed;
  }
  pooled.namedShare = pooled.hungerDays ? (pooled.hungerDays - pooled.unattributed) / pooled.hungerDays : null;
  pooled.chanBshare = pooled.hungerDays ? pooled.chanBdays / pooled.hungerDays : null;
  // wall numbers
  const wall = {
    n: runs.length,
    national: runs.filter(r => r.national).length,
    table: runs.filter(r => r.table).length,
    won: runs.filter(r => r.won).length,
    wave4: runs.filter(r => r.waveReach >= 4).length,
    wave5: runs.filter(r => r.waveReach >= 5).length,
    maxWave: Math.max(...runs.map(r => r.waveReach)),
    medianDays: (() => { const ds = runs.map(r => r.gameDays).sort((a, b) => a - b); return ds[Math.floor(ds.length / 2)]; })(),
    maxDays: Math.max(...runs.map(r => r.gameDays)),
    deathCauses: {},
  };
  for (const r of runs) for (const [k, v] of Object.entries(r.deaths)) wall.deathCauses[k] = (wall.deathCauses[k] || 0) + v;
  const goNamed = (pooled.namedShare == null) ? false : pooled.namedShare >= 0.90;
  const goB = pooled.chanBdays > 0 || pooled.hungerDays === 0;
  const verdict = (goNamed && goB) ? 'GO' : 'NO-GO';
  const sweep = {
    label: 'distrhalf', seeds: SEEDS, policies: POLICIES, days: DAYS,
    when: new Date().toISOString(), runs, byPolicy, pooled, wall,
    go: { namedShare: pooled.namedShare, chanBdays: pooled.chanBdays,
      chanBshare: pooled.chanBshare, verdict },
  };
  if (OUT) { try { fs.writeFileSync(OUT, JSON.stringify(sweep, null, 1)); } catch (e) {} }
  console.log('\n-- pooled attribution --');
  console.log(`  hunger-days: ${pooled.hungerDays} (scholar=${pooled.scholarHungerDays} villager=${pooled.villagerHungerDays})`);
  console.log(`  byChannel: ${JSON.stringify(pooled.byChannel)}`);
  console.log(`  byLabel: ${JSON.stringify(pooled.byLabel)}`);
  console.log(`  named share: ${pooled.namedShare == null ? 'n/a' : (pooled.namedShare * 100).toFixed(1) + '%'}`);
  console.log(`  channel (b) trust-throttled: ${pooled.chanBdays} days (${pooled.chanBshare == null ? 'n/a' : (pooled.chanBshare * 100).toFixed(1) + '%'} of hunger-days)`);
  console.log(`  unattributed: ${pooled.unattributed}`);
  console.log('\n-- wall --');
  console.log(`  national ${wall.national}/${wall.n} table ${wall.table}/${wall.n} won ${wall.won}/${wall.n} ` +
    `wave4 ${wall.wave4}/${wall.n} wave5 ${wall.wave5}/${wall.n} maxWave ${wall.maxWave} ` +
    `median ${wall.medianDays}d max ${wall.maxDays}d`);
  console.log(`  deaths: ${JSON.stringify(wall.deathCauses)}`);
  console.log(`\nGO VERDICT: ${verdict} (named>=90%: ${goNamed}, (b) quantified: ${goB})`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
