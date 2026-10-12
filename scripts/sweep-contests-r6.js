#!/usr/bin/env node
// sweep-contests-r6.js — LONG-RUN SIM LOOP, lever 6 ROUND 6 (casting variety).
// The r5 blank: "the same villager gets show-pulled every few days with
// identical 'MADE for this' lines — notability-weighted casting doing its
// job a bit too well." This sweep measures BEFORE and AFTER the lever on
// identical seeds.
//
// Per run: full completion metrics (from sweep-completion-r7.js) + casting
// census (from sweep-contests-r5.js) + casting-variety metrics:
//   - shows aired by type, per-villager pull counts, cast why (star/whim/
//     fresh/tie/debut), repeat-pull rate (same villager pulled on
//     consecutive shows; pulls within 3 days of own last pull),
//   - "producers cut it" repel flips (show_cast_repel tele events),
//   - MADE-for-this landing-line variants (distinct templates seen).
//
// Usage: SEEDS="..." POLICIES="competent,riskAware" DAYS=200 OUT=/tmp/r6-before.json node scripts/sweep-contests-r6.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { riskAware } = require('./policies/risk-aware');

const POLICIES = { competent, riskAware };

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };

// ---- utilization instrumentation (from sweep-completion-r7.js) ----
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

// ---- vest-event tracker (from sweep-completion-r7.js) ----
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

// ---- contest/show casting census (adapted from sweep-contests-r5.js) ----
function installContestHooks(Game, rec) {
  rec.transcript = [];
  const cap = (t) => {
    try {
      const s = String(t);
      if (/📺|MADE for this|came home with fans|clip|trainwreck|producers cut/.test(s)) {
        if (rec.transcript.length < 2000) rec.transcript.push({ day: dayOf(Game), line: s.slice(0, 320) });
      }
    } catch (e) {}
  };
  Game.say = cap; Game.sysSay = cap;
  const wrap = (name, fn) => {
    const orig = Game[name];
    if (typeof orig !== 'function') { rec.wrapFails = rec.wrapFails || []; rec.wrapFails.push(name); return; }
    Game[name] = function (...a) { try { fn.apply(null, [this, ...a]); } catch (e) {} return orig.apply(this, a); };
  };
  wrap('fireContest', (G, event) => {
    rec.fireContestCalls.push({ day: dayOf(G), id: (event && event.id) || '?', cat: (event && event.cat) || '?', risk: (event && event.risk) || '?' });
  });
  wrap('fireShow', (G, show) => {
    rec.fireShowCalls.push({ day: dayOf(G), id: (show && show.id) || '?' });
  });
  wrap('fireRatingsSummons', (G) => { rec.summons++; });
  wrap('_cxKillContestant', (G) => { rec.contestDeaths++; });
  const origPkg = Game.apCarePackage.bind(Game);
  Game.apCarePackage = function () {
    const r = origPkg();
    if (r) rec.pkgFires++;
    return r;
  };
  const origVote = Game.apClubVote && Game.apClubVote.bind(Game);
  if (origVote) {
    Game.apClubVote = function () {
      const r = origVote.apply(this, arguments);
      if (r) rec.clubVotes++;
      return r;
    };
  } else {
    rec.wrapFails = rec.wrapFails || [];
    if (typeof Game.apClubVote !== 'function') rec.wrapFails.push('apClubVote(absent)');
  }
  wrap('tele', (G, type, data) => {
    if (type === 'show_aired') rec.teleShows.push({ day: dayOf(G), id: data.id, who: data.who, why: data.why || '?' });
    if (type === 'contest_fired') rec.teleContests.push({ day: dayOf(G), id: data.id });
    if (type === 'show_cast_repel') rec.repels.push({ day: dayOf(G), star: data.star, picked: data.picked });
  });
}

function snapshot(Game, ctx, result, rec) {
  const out = {
    arc: 1, arcDay: {}, waveDay: {}, table: false, won: false,
    breadth: 0, stage: 0, sentiment: false, feastArmed: false, feastUsed: false,
    rank: '?', nationalLive: false, globalLive: false,
    vests: [], fourRealm: false, fourRealmShape: null,
    havenTier: 0, maxWave: 1,
    w: [0, 0, 0, 0, 0], cx: 0, cr: 0, gate: false,
    countersKnown: 0,
    trapsSetPlayer: 0, trapsSetVillager: 0, trapCatches: 0,
    kills: 0, counterKills: 0,
    successions: 0, youngSuccessions: 0, successionDays: [],
    deaths: [],
    // contest/show census
    contests: rec.fireContestCalls.length, shows: rec.fireShowCalls.length,
    cats: {}, showIds: {}, summons: rec.summons, contestDeaths: rec.contestDeaths,
    pkgFires: rec.pkgFires, clubVotes: rec.clubVotes,
    teleShows: rec.teleShows, teleContests: rec.teleContests, repels: rec.repels,
  };
  for (const c of rec.fireContestCalls) out.cats[c.cat] = (out.cats[c.cat] || 0) + 1;
  for (const s of (rec.teleShows.length ? rec.teleShows : rec.fireShowCalls)) out.showIds[s.id] = (out.showIds[s.id] || 0) + 1;
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
  if (out.vests.length) { out.fourRealm = true; out.fourRealmShape = out.vests[0].shape; }
  try { out.havenTier = Game.havenTier ? Game.havenTier() : 0; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
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
  return out;
}

(async () => {
  const seeds = parseList('SEEDS', '424242,777001,999983,20261011,7,12345,31337,8675309,11,22,33,44,55,66,77,88').map(Number);
  const policyIds = parseList('POLICIES', 'competent,riskAware');
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  let runN = 0;
  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error(`unknown policy: ${pid}`); process.exit(1); }
    for (const seed of seeds) {
      runN++;
      const t0 = Date.now();
      const { Game, manifest } = await loadGame({ seed, mode: pid, fullTelemetry: false });
      await setupGame(Game);
      const rec = { fireContestCalls: [], fireShowCalls: [], teleShows: [], teleContests: [],
        repels: [], summons: 0, contestDeaths: 0, pkgFires: 0, clubVotes: 0, transcript: [], wrapFails: [] };
      const ctx = { successions: 0, youngSuccessions: 0, successionDays: [], vests: [], arcDay: {}, waveDay: {} };
      instrument(Game, ctx);
      trackVests(Game, ctx);
      installContestHooks(Game, rec);
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
      const end = snapshot(Game, ctx, result, rec);
      const r = Object.assign({ policy, seed, days: result.days, endReason: result.endReason,
        maxArc: Math.max(lastArc, end.arc), maxWave: Math.max(lastWave, end.maxWave),
        transcript: rec.transcript, wrapFails: rec.wrapFails, ms: result.ms }, end);
      delete r.teleShows; delete r.teleContests; // kept in runs as pulls: — actually keep teleShows in r.pulls
      r.pulls = rec.teleShows;
      r.repels = rec.repels;
      runs.push(r);
      const el = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`[${runN}/${seeds.length * policyIds.length} ${el}s] ${pid} s${seed}: d${r.days} ${r.endReason} arc${r.maxArc} w${r.maxWave} rank=${r.rank} cx=${r.contests} shows=${r.shows} pulls=${r.pulls.length} repels=${r.repels.length} won=${r.won}`);
    }
  }

  // ---- casting-variety analysis ----
  const cast = { totalPulls: 0, villagerPulls: 0, why: {}, perVillager: {}, immediateRepeats: 0, nearRepeats3d: 0, repels: 0, maxShare: [] };
  const madeLines = {}; // distinct landing templates
  for (const r of runs) {
    const pulls = (r.pulls || []).filter(p => p.who && p.who !== 'together');
    cast.totalPulls += pulls.length;
    const counts = {}, lastPull = {}, lastWho = { id: null };
    for (const p of pulls) {
      cast.why[p.why || '?'] = (cast.why[p.why || '?'] || 0) + 1;
      if (p.who !== 'player') {
        cast.villagerPulls++;
        counts[p.who] = (counts[p.who] || 0) + 1;
        if (lastWho.id === p.who) cast.immediateRepeats++;
        if (lastPull[p.who] != null && p.day - lastPull[p.who] <= 3) cast.nearRepeats3d++;
        lastPull[p.who] = p.day;
      }
      lastWho.id = p.who;
    }
    const vp = pulls.filter(p => p.who !== 'player').length;
    if (vp > 0) {
      const top = Math.max(...Object.values(counts));
      cast.maxShare.push(top / vp);
      for (const k of Object.keys(counts)) cast.perVillager[k] = Math.max(cast.perVillager[k] || 0, counts[k]);
    }
    cast.repels += (r.repels || []).length;
    for (const t of (r.transcript || [])) {
      const L = t.line;
      if (/MADE for this|came home with fans|making clips|clip of .* will outlive|trainwreck|ate the camera|It went\.\.\. badly/.test(L)) {
        // strip the participant name(s) so variant templates collapse
        const name0 = ((r.pulls || []).map(p => p.who).filter(Boolean) || []);
        let tpl = L;
        madeLines[tpl] = (madeLines[tpl] || 0) + 1;
      }
    }
    const _tplKeys = Object.keys(madeLines);
    if (_tplKeys.length > 60) { // keep the map bounded; extras merge into count
      for (const k of _tplKeys.slice(0, _tplKeys.length - 60)) delete madeLines[k];
    }
  }

  // ---- general aggregate ----
  const sum = (f) => runs.reduce((t, r) => t + (f(r) || 0), 0);
  const avg = (f) => runs.length ? sum(f) / runs.length : 0;
  const med = (f) => { const a = runs.map(f).filter(v => v != null).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; };
  const deathCauses = {};
  for (const r of runs) for (const d of (r.deaths || [])) deathCauses[d.cause || '?'] = (deathCauses[d.cause || '?'] || 0) + 1;
  const cats = {}, showIds = {};
  for (const r of runs) {
    for (const k of Object.keys(r.cats || {})) cats[k] = (cats[k] || 0) + r.cats[k];
    for (const k of Object.keys(r.showIds || {})) showIds[k] = (showIds[k] || 0) + r.showIds[k];
  }
  const agg = {
    n: runs.length,
    won: sum(r => r.won ? 1 : 0), table: sum(r => r.table ? 1 : 0),
    maxArc: Math.max(...runs.map(r => r.maxArc || 1)),
    arc2: sum(r => r.maxArc >= 2 ? 1 : 0), arc3: sum(r => r.maxArc >= 3 ? 1 : 0), arc4: sum(r => r.maxArc >= 4 ? 1 : 0),
    maxWave: Math.max(...runs.map(r => r.maxWave || 1)),
    wave2: sum(r => r.maxWave >= 2 ? 1 : 0), wave3: sum(r => r.maxWave >= 3 ? 1 : 0), wave4: sum(r => r.maxWave >= 4 ? 1 : 0), wave5: sum(r => r.maxWave >= 5 ? 1 : 0),
    national: sum(r => r.rank === 'national' || r.rank === 'global' ? 1 : 0),
    vested: sum(r => r.vested ? 1 : 0), fourRealm: sum(r => r.fourRealm ? 1 : 0),
    tier2: sum(r => r.havenTier >= 2 ? 1 : 0),
    avgDays: +avg(r => r.days).toFixed(1), medDays: med(r => r.days), maxDays: Math.max(...runs.map(r => r.days || 0)),
    deathCauses, cats, showIds,
    contests: sum(r => r.contests), shows: sum(r => r.shows),
    summons: sum(r => r.summons), contestDeaths: sum(r => r.contestDeaths),
    pkgFires: sum(r => r.pkgFires), clubVotes: sum(r => r.clubVotes),
    trapsSet: sum(r => r.trapsSetPlayer + r.trapsSetVillager), trapCatches: sum(r => r.trapCatches),
    kills: sum(r => r.kills), counterKills: sum(r => r.counterKills),
    countersKnownRuns: sum(r => r.countersKnown > 0 ? 1 : 0),
    successions: sum(r => r.successions), youngSuccessions: sum(r => r.youngSuccessions),
    sentiment: sum(r => r.sentiment ? 1 : 0),
    casts: {
      totalPulls: cast.totalPulls, villagerPulls: cast.villagerPulls, why: cast.why,
      immediateRepeatRate: cast.villagerPulls ? +(cast.immediateRepeats / cast.villagerPulls).toFixed(3) : null,
      nearRepeat3dRate: cast.villagerPulls ? +(cast.nearRepeats3d / cast.villagerPulls).toFixed(3) : null,
      medianMaxShare: cast.maxShare.length ? +cast.maxShare.sort((a, b) => a - b)[Math.floor(cast.maxShare.length / 2)].toFixed(2) : null,
      repels: cast.repels,
    },
    madeLineTemplates: madeLines,
  };
  console.log('\n=== AGG ===');
  console.log(JSON.stringify(agg, null, 1));
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ config: { seeds, policies: policyIds, days }, runs, agg }, null, 1)); console.log('wrote ' + outFile); }
})();
