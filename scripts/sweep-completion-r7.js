#!/usr/bin/env node
// sweep-completion-r7.js — post-structural completion measurement (Steve 2026-10-11).
// "Is the game winnable now, and is all content reachable?" Fresh measurement
// on current master — the old winrate-r6c branch predates the structural
// fixes and is NOT used.
//
// Measurement only: no game balance changes. 60 seeds x 3 policies
// (competent, mvc, leader) x 200 days. Records per run:
//   wins, winDay, table, arcs + first-day per arc, rank ladder,
//   vest events (lead/belong), four-realm formation, havenTier,
//   wave reach + first-day per wave, waveKills, deed ledger,
//   traps (player vs villager set, catches), counter discovery + counter kills,
//   successions (count, young-successor count, survival after succession),
//   death-cause shares, villager end-state diversity.
//
// Usage:
//   SEEDS="1,2,..." POLICIES="competent,mvc,leader" DAYS=200 \
//     OUT=/tmp/r7.json node scripts/sweep-completion-r7.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const idle = require('./policies/idle');
const { competent } = require('./policies/competent');

const POLICIES = { zero: idle.zero, mvc: idle.mvc, leader: idle.leader, competent };

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

// ---- utilization + source instrumentation (from winrate-iter3/r6) ----
function instrument(Game, ctx) {
  const U = ctx.util = {
    trapsSetPlayer: 0, trapsSetVillager: 0, trapCatches: 0,
    kills: 0, counterKills: 0,
  };
  const wrap = (name, fn) => {
    const o = Game[name];
    if (typeof o !== 'function') return false;
    Game[name] = function () { return fn.call(this, o, Array.prototype.slice.call(arguments)); };
    return true;
  };
  const vt = Game.villagerTurn;
  if (typeof vt === 'function') {
    Game.villagerTurn = function () {
      Game._utilVillagerPhase = true;
      try { return vt.apply(this, arguments); }
      finally { Game._utilVillagerPhase = false; }
    };
  }
  wrap('setTrap', function (orig, a) {
    if (Game._utilVillagerPhase) U.trapsSetVillager++; else U.trapsSetPlayer++;
    return orig.apply(this, a);
  });
  wrap('foodCarcass', function (orig, a) {
    if (a[3] === 'trapped') U.trapCatches++;
    return orig.apply(this, a);
  });
  wrap('recordWaveKill', function (orig, a) {
    const mid = a[0];
    let known = false;
    try { known = !!Game.monsterCounterKnown(mid); } catch (e) {}
    const r = orig.apply(this, a);
    U.kills++;
    if (known) U.counterKills++;
    return r;
  });
  // Succession tracker: mantle transfers after player death.
  const pd = Game.playerDeath;
  if (typeof pd === 'function') {
    Game.playerDeath = function () {
      const beforeId = this.villagerId;
      const r = pd.apply(this, arguments);
      try {
        if (!this.over && this.villagerId && this.villagerId !== beforeId) {
          ctx.successions = (ctx.successions || 0) + 1;
          const nc = ((this.data || {}).villagers || []).find(x => x.id === this.villagerId) || {};
          const age = (nc.age != null ? nc.age : null);
          if (age != null && age < 25) ctx.youngSuccessions = (ctx.youngSuccessions || 0) + 1;
          (ctx.successionDays = ctx.successionDays || []).push(((this.state || {}).scholar || {}).day || 0);
        }
      } catch (e) {}
      return r;
    };
  }
  return U;
}

// ---- vest-event tracker (from r6): first time each shape's polity vests ----
function trackVests(Game, ctx) {
  ctx.vests = [];
  const seen = {};
  const orig = Game.polityOf;
  if (typeof orig !== 'function') return;
  Game.polityOf = function (villageId) {
    let r = null;
    try { r = orig.apply(this, arguments); } catch (e) { return null; }
    try {
      if (r && r.shape && !seen[r.shape]) {
        seen[r.shape] = true;
        const day = ((this.state || {}).scholar || {}).day || 0;
        ctx.vests.push({ day, shape: r.shape, size: r.size || 0, primary: r.primary || null });
      }
    } catch (e) {}
    return r;
  };
}

function snapshot(Game, ctx, result) {
  const out = {
    arc: 1, arcDay: {}, waveDay: {}, table: false, won: false, winDay: null,
    breadth: 0, stage: 0, sentiment: false, feastArmed: false, feastUsed: false,
    rank: '?', nationalLive: false, globalLive: false,
    vests: [], fourRealm: false, fourRealmShape: null,
    havenTier: 0, maxWave: 1, waveKills: {},
    w: [0, 0, 0, 0, 0], cx: 0, cr: 0, gate: false,
    countersKnown: 0,
    trapsSetPlayer: 0, trapsSetVillager: 0, trapCatches: 0,
    kills: 0, counterKills: 0,
    successions: 0, youngSuccessions: 0, successionDays: [],
    deaths: [],
  };
  try {
    const pg = Game.progState();
    out.arc = pg.arc || 1;
    out.table = !!(pg.tableWaiting || pg.tableDone);
    out.sentiment = !!pg.sentimentTaught;
  } catch (e) {}
  try { out.breadth = Game.codexBreadth(); } catch (e) {}
  try { out.stage = Game.integrationStage(); } catch (e) {}
  try { out.won = !!Game.won; } catch (e) {}
  try {
    const s = Game.state.scholar || {};
    out.feastArmed = !!((s.prog || {}).feastSurge);
    out.feastUsed = !!((s.prog || {}).feastSurgeUsed);
  } catch (e) {}
  try { out.rank = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
  try { out.nationalLive = !!Game.state.nationalLive; } catch (e) {}
  try { out.globalLive = !!Game.state.globalLive; } catch (e) {}
  out.vests = (ctx.vests || []).slice();
  if (out.vests.length) {
    out.fourRealm = true;
    out.fourRealmShape = out.vests[0].shape;
  }
  try { out.havenTier = Game.havenTier ? Game.havenTier() : 0; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { out.waveKills = Object.assign({}, Game.state.waveKills || {}); } catch (e) {}
  try {
    const g = Game.deedGateReady ? Game.deedGateReady() : null;
    if (g) { out.w = [g.w1, g.w2, g.w3, g.w4, g.w5]; out.cx = g.contestsN; out.cr = g.crisesN; out.gate = !!g.ok; }
  } catch (e) {}
  try { out.countersKnown = Object.keys((Game.state || {}).monsterCounters || {}).length; } catch (e) {}
  if (ctx.util) {
    out.trapsSetPlayer = ctx.util.trapsSetPlayer;
    out.trapsSetVillager = ctx.util.trapsSetVillager;
    out.trapCatches = ctx.util.trapCatches;
    out.kills = ctx.util.kills;
    out.counterKills = ctx.util.counterKills;
  }
  out.successions = ctx.successions || 0;
  out.youngSuccessions = ctx.youngSuccessions || 0;
  out.successionDays = (ctx.successionDays || []).slice();
  out.arcDay = Object.assign({}, ctx.arcDay || {});
  out.waveDay = Object.assign({}, ctx.waveDay || {});
  try {
    for (const d of ((result.samples || {}).deaths || [])) out.deaths.push({ day: d.day, kind: d.kind, cause: d.cause });
  } catch (e) {}
  // Villager end-state diversity (sense-testing input).
  try {
    const v = Game.state.village || {};
    const occs = {}, profs = {};
    let withKills = 0, withExped = 0, n = 0;
    for (const vid of (v.roster || [])) {
      n++;
      let person = null, ag = null;
      try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e2) {}
      try { ag = Game.agencyOf ? Game.agencyOf(vid) : null; } catch (e2) {}
      const occ = (person && (person.occupationId || person.formerOccupation)) || '?';
      occs[occ] = (occs[occ] || 0) + 1;
      const pr = (ag && ag.profiles && ag.profiles[vid]) || '?';
      profs[pr] = (profs[pr] || 0) + 1;
      const astats = ((ag || {}).stats || {})[vid] || {};
      if ((astats.monsterKills || 0) > 0) withKills++;
      if ((astats.expeditions || 0) > 0) withExped++;
    }
    out.villagerDiv = { n, occs: Object.keys(occs).length, profs: Object.keys(profs).length, withKills, withExped };
  } catch (e) {}
  return out;
}

(async () => {
  const seedList = parseList('SEEDS', Array.from({ length: 60 }, (_, i) => String(i + 1)).join(',')).map(Number);
  const policyIds = parseList('POLICIES', 'competent,mvc,leader');
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  let runN = 0;
  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error(`unknown policy: ${pid}`); process.exit(1); }
    for (const seed of seedList) {
      runN++;
      const t0 = Date.now();
      const { Game, manifest } = await loadGame({ seed, mode: pid, fullTelemetry: false });
      await setupGame(Game);
      const ctx = { successions: 0, youngSuccessions: 0, successionDays: [], vests: [], arcDay: {}, waveDay: {} };
      instrument(Game, ctx);
      trackVests(Game, ctx);
      const policy = Object.assign({}, base);
      let lastArc = 1, lastWave = 1;
      const origDaily = base.daily;
      policy.daily = (G, c2) => {
        try {
          let arc = 1, wave = 1, day = 0;
          try { arc = G.progState().arc || 1; } catch (e) {}
          try { wave = G.unlockedWave ? G.unlockedWave() : 1; } catch (e) {}
          try { day = (G.state.scholar || {}).day || 0; } catch (e) {}
          if (!(arc in ctx.arcDay)) ctx.arcDay[arc] = day;
          if (arc > lastArc) lastArc = arc;
          if (!(wave in ctx.waveDay)) ctx.waveDay[wave] = day;
          if (wave > lastWave) lastWave = wave;
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, c2); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
      const end = snapshot(Game, ctx, result);
      const rec = {
        policy: pid, seed,
        days: result.days, endReason: result.endReason,
        maxArc: Math.max(lastArc, end.arc),
        maxWave: Math.max(lastWave, end.maxWave),
        rank: end.rank, vested: end.vests.length > 0, fourRealm: end.fourRealm,
        fourRealmShape: end.fourRealmShape,
        havenTier: end.havenTier, table: end.table, won: end.won,
        breadth: end.breadth, stage: end.stage, sentiment: end.sentiment,
        feastArmed: end.feastArmed, feastUsed: end.feastUsed,
        deeds: end.w, contestsN: end.cx, crisesN: end.cr, deedGate: end.gate,
        countersKnown: end.countersKnown,
        trapsSetPlayer: end.trapsSetPlayer, trapsSetVillager: end.trapsSetVillager,
        trapCatches: end.trapCatches, kills: end.kills, counterKills: end.counterKills,
        successions: end.successions, youngSuccessions: end.youngSuccessions,
        successionDays: end.successionDays,
        deaths: end.deaths, villagerDiv: end.villagerDiv,
        arcDay: end.arcDay, waveDay: end.waveDay,
        ms: result.ms,
      };
      runs.push(rec);
      const el = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`[${runN}/${seedList.length * policyIds.length} ${el}s] ${pid} s${seed}: d${rec.days} ${rec.endReason} arc${rec.maxArc} w${rec.maxWave} rank=${rec.rank} tier=${rec.havenTier} vest=${rec.vested ? 'Y' : 'n'} table=${rec.table} won=${rec.won} succ=${rec.successions}(y${rec.youngSuccessions})`);
    }
  }

  // ---- aggregate ----
  const agg = {};
  const all = { n: runs.length };
  for (const pid of policyIds.concat(['ALL'])) {
    const pr = pid === 'ALL' ? runs : runs.filter(r => r.policy === pid);
    if (!pr.length) continue;
    const ds = pr.map(r => r.days).sort((a, b) => a - b);
    const arcDist = {}, waveDist = {}, rankDist = {}, endDist = {}, causeDist = {};
    let won = 0, table = 0, vested = 0, fourRealm = 0, national = 0, global = 0;
    let tier2 = 0, wave3 = 0, arc4 = 0, arc3 = 0, arc2 = 0;
    let succTotal = 0, youngSuccTotal = 0, succRuns = 0;
    let trapsP = 0, trapsV = 0, trapC = 0, kills = 0, ckills = 0, counters = 0, cRuns = 0;
    for (const r of pr) {
      arcDist[r.maxArc] = (arcDist[r.maxArc] || 0) + 1;
      waveDist[r.maxWave] = (waveDist[r.maxWave] || 0) + 1;
      rankDist[r.rank] = (rankDist[r.rank] || 0) + 1;
      endDist[r.endReason] = (endDist[r.endReason] || 0) + 1;
      if (r.won) won++;
      if (r.table) table++;
      if (r.vested) vested++;
      if (r.fourRealm) fourRealm++;
      if (r.rank === 'national' || r.rank === 'global') national++;
      if (r.rank === 'global') global++;
      if (r.havenTier >= 2) tier2++;
      if (r.maxWave >= 3) wave3++;
      if (r.maxArc >= 4) arc4++;
      if (r.maxArc >= 3) arc3++;
      if (r.maxArc >= 2) arc2++;
      succTotal += r.successions;
      youngSuccTotal += r.youngSuccessions;
      if (r.successions > 0) succRuns++;
      trapsP += r.trapsSetPlayer; trapsV += r.trapsSetVillager; trapC += r.trapCatches;
      kills += r.kills; ckills += r.counterKills;
      counters += r.countersKnown;
      if (r.countersKnown > 0) cRuns++;
      for (const d of (r.deaths || [])) {
        const k = `${d.kind || '?'}/${d.cause || '?'}`;
        causeDist[k] = (causeDist[k] || 0) + 1;
      }
    }
    agg[pid] = {
      n: pr.length,
      medianDays: ds[Math.floor(ds.length / 2)], maxDays: ds[ds.length - 1],
      won, table, arc2, arc3, arc4, vested, fourRealm, national, global, tier2, wave3,
      arcDist, waveDist, rankDist, endDist,
      successions: succTotal, youngSuccessions: youngSuccTotal, succRuns,
      trapsSetPlayer: trapsP, trapsSetVillager: trapsV, trapCatches: trapC,
      kills, counterKills: ckills, counterKnownTotal: counters, counterRuns: cRuns,
      meanBreadth: +(pr.reduce((a, r) => a + r.breadth, 0) / pr.length).toFixed(1),
      causeDist,
    };
  }
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10), policies: policyIds }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
