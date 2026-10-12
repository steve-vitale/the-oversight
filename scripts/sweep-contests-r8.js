#!/usr/bin/env node
// sweep-contests-r8.js — LONG-RUN SIM LOOP, lever 6 ROUND 8 (repeat-winner
// adaptation audit). Extends the r7 harness with an adaptation census:
//   - per-contest _cxApplyAdaptation fires: variant, heat, whether the
//     applied phases genuinely differ from the base (label+sub sig),
//   - _cxStipulationFor firings by kind (no_repeat/handicap/blind),
//   - _cxShowTwist firings (stale shows get real costs),
//   - _cxRecordOutcome per-participant outcomes with heat-before-bump and
//     the player's appearance index per contest (repeat-winner win-rate
//     curve vs first-timer fairness),
//   - hardened-variant occurrence via _contestScaled,
//   - rival-hot (winsVs>=3) contests, pilot (first contest) timing,
//   - fan-club growth + care-package delivery.
//
// Usage: SEEDS="..." POLICIES="competent,riskAware" DAYS=200 OUT=/tmp/r8-before.json node scripts/sweep-contests-r8.js
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
      if (/📺|MADE for this|came home with fans|clip|trainwreck|producers cut|countdown|studied the tapes|casting office|stipulation|BLIND DRAW|HEAT|body keeps score|care package|Fan Club|funeral|didn't come home|The System was going to take|MYSTERY INGREDIENT|veteran|you know its beats|Moot|Ask a Human|Death Reel|Mouth Race|Break Room|WHY DO THEY EAT|pilot|PILOT/.test(s)) {
        if (rec.transcript.length < 2500) rec.transcript.push({ day: dayOf(Game), line: s.slice(0, 340) });
      }
    } catch (e) {}
  };
  Game.say = cap; Game.sysSay = cap;
  // ---- r8 ADAPTATION CENSUS ----
  rec.adaptFires = []; rec.stips = []; rec.outcomes = []; rec.showOutcomes = [];
  rec.scalings = []; rec.showTwists = []; rec.heatBumps = []; rec._appCount = {};
  const phaseSig = (phases) => {
    try {
      return JSON.stringify((phases || []).map(p => ((p.choices || []).map(c => (c.label || '') + '~' + (c.sub || ''))).join('|')));
    } catch (e) { return 'ERR'; }
  };
  const wrapPost = (name, fn) => {
    const orig = Game[name];
    if (typeof orig !== 'function') { rec.wrapFails = rec.wrapFails || []; rec.wrapFails.push(name); return; }
    Game[name] = function (...a) {
      let extra = null;
      try { extra = fn.before ? fn.before.apply(null, [this, ...a]) : null; } catch (e) {}
      const r = orig.apply(this, a);
      try { if (fn.after) fn.after.apply(null, [this, r, extra, ...a]); } catch (e) {}
      return r;
    };
  };
  wrapPost('_contestScaled', {
    after: (G, scaled, _ex, base, variant) => {
      try { rec.scalings.push({ day: dayOf(G), id: (base && base.id) || '?', variant: (scaled && scaled.variant) || variant || 'plain' }); } catch (e) {}
    },
  });
  wrapPost('_cxApplyAdaptation', {
    before: (G, contest, phases) => ({ sig: phaseSig(phases) }),
    after: (G, adapted, extra, contest, phases) => {
      try {
        const sigA = phaseSig(adapted);
        let heat = -1; try { heat = G._cxHeatFor(contest.id); } catch (e) {}
        rec.adaptFires.push({ day: dayOf(G), id: contest.id, variant: contest.variant || 'plain',
          heat, diffSig: extra && extra.sig !== sigA,
          nBefore: (phases || []).length, nAfter: (adapted || []).length });
      } catch (e) {}
    },
  });
  wrapPost('_cxStipulationFor', {
    after: (G, kind, _ex, contest) => {
      try { if (kind) rec.stips.push({ day: dayOf(G), id: (contest && contest.id) || '?', kind }); } catch (e) {}
    },
  });
  wrapPost('_cxShowTwist', {
    after: (G, twisted, _ex, show, phases, who) => {
      try { rec.showTwists.push({ day: dayOf(G), id: (show && show.id) || '?', who: who || '?', twisted: twisted !== phases }); } catch (e) {}
    },
  });
  wrapPost('_cxBumpHeat', {
    after: (G, _r, _ex, contestId, outcome) => {
      try { rec.heatBumps.push({ day: dayOf(G), id: contestId || '?', outcome: outcome || '?' }); } catch (e) {}
    },
  });
  wrapPost('_cxRecordOutcome', {
    before: (G, ac, outcome) => {
      const ex = { heat: -1, rivalHot: false, app: 1 };
      try {
        const cid = (ac && ac.contestId) || '?';
        const who = (ac && ac.participant) || '?';
        ex.heat = G._cxHeatFor(cid);
        const rv = ((G._cxAdapt().rival || {})[cid] || {});
        ex.rivalHot = (rv.winsVs || 0) >= 3;
        const key = cid + '|' + who;
        rec._appCount[key] = (rec._appCount[key] || 0) + 1;
        ex.app = rec._appCount[key];
        ex.cid = cid; ex.who = who;
      } catch (e) {}
      return ex;
    },
    after: (G, _r, ex, ac, outcome) => {
      try { rec.outcomes.push({ day: dayOf(G), contestId: (ex && ex.cid) || '?', who: (ex && ex.who) || '?',
        outcome: outcome || '?', heat: ex && ex.heat, rivalHot: !!(ex && ex.rivalHot), app: (ex && ex.app) || 0 }); } catch (e) {}
    },
  });
  const origShowEnd = Game._showEnd && Game._showEnd.bind(Game);
  if (origShowEnd) {
    Game._showEnd = function (ac, outcome, prize) {
      const r = origShowEnd.apply(this, arguments);
      try { rec.showOutcomes.push({ day: dayOf(Game), showId: (ac && (ac.showId || ac.id)) || '?',
        who: (ac && ac.participant) || '?', outcome: outcome || '?' }); } catch (e) {}
      return r;
    };
  } else { rec.wrapFails = rec.wrapFails || []; rec.wrapFails.push('_showEnd(absent)'); }
  const wrap = (name, fn) => {
    const orig = Game[name];
    if (typeof orig !== 'function') { rec.wrapFails = rec.wrapFails || []; rec.wrapFails.push(name); return; }
    Game[name] = function (...a) { try { fn.apply(null, [this, ...a]); } catch (e) {} return orig.apply(this, a); };
  };
  wrap('fireContest', (G, event) => {
    // r7: the fireContestCalls record keeps the r6 census shape; the cast
    // capture below (post-call, pendingContest-based) is the r7 census.
    rec.fireContestCalls.push({ day: dayOf(G), id: (event && event.id) || '?', cat: (event && event.cat) || '?', risk: (event && event.risk) || '?' });
  });
  // r7 CONTEST-CAST CENSUS: fireContest announces then stores the cast in
  // state.pendingContest.participants. Read AFTER the call (the early
  // return on empty eligibility leaves pendingContest stale — guard with
  // reference inequality so a dry fire doesn't re-record the last cast).
  const origFireContest = Game.fireContest.bind(Game);
  Game.fireContest = function (event) {
    const beforePc = Game.state.pendingContest;
    const r = origFireContest(event);
    try {
      const afterPc = Game.state.pendingContest;
      if (afterPc && afterPc !== beforePc && Array.isArray(afterPc.participants)) {
        rec.contestCasts.push({ day: dayOf(Game), id: (event && event.id) || '?', cat: (event && event.cat) || '?',
          participants: afterPc.participants.slice() });
      }
    } catch (e) {}
    return r;
  };
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
    if (type === 'contest_cast_repel' && data) rec.repelsCx.push({ day: dayOf(G), star: data.star, picked: data.picked });
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
  // ---- r8 adaptation census snapshot ----
  out.adaptFires = rec.adaptFires.length;
  out.adaptDiff = rec.adaptFires.filter(f => f.diffSig).length;
  out.hardenedScalings = rec.scalings.filter(s => s.variant === 'hardened').length;
  out.hardenedAdaptDiff = rec.adaptFires.filter(f => f.variant === 'hardened' && f.diffSig).length;
  out.hardenedAdaptN = rec.adaptFires.filter(f => f.variant === 'hardened').length;
  out.stips = {};
  for (const s of rec.stips) out.stips[s.kind] = (out.stips[s.kind] || 0) + 1;
  out.showTwists = rec.showTwists.filter(t => t.twisted).length;
  out.heatBumps = rec.heatBumps.length;
  out.rivalHot = rec.outcomes.filter(o => o.rivalHot).length;
  out.outcomes = rec.outcomes.map(o => ({ d: o.day, c: o.contestId, w: o.who, o: o.outcome, h: o.heat, rh: o.rivalHot, a: o.app }));
  out.showOutcomes = rec.showOutcomes.map(o => ({ d: o.day, s: o.showId, w: o.who, o: o.outcome }));
  out.adaptFireList = rec.adaptFires.map(f => ({ d: f.day, c: f.id, v: f.variant, h: f.heat, diff: f.diffSig }));
  out.pilotDay = (rec.teleContests[0] || rec.fireContestCalls[0] || { day: null }).day;
  try { out.fanClubs = Object.assign({}, (Game.apState() || {}).fanClubs || {}); } catch (e) { out.fanClubs = {}; }
  try { out.showWear = Object.assign({}, ((Game._cxAdapt() || {}).wear || {})); } catch (e) { out.showWear = {}; }
  try { out.dossierIds = Object.keys(((Game._cxAdapt() || {}).dossier || {})); } catch (e) { out.dossierIds = []; }
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
        repels: [], repelsCx: [], contestCasts: [],
        summons: 0, contestDeaths: 0, pkgFires: 0, clubVotes: 0, transcript: [], wrapFails: [] };
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
      r.casts = rec.contestCasts;
      r.cxrepels = rec.repelsCx;
      runs.push(r);
      const el = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`[${runN}/${seeds.length * policyIds.length} ${el}s] ${pid} s${seed}: d${r.days} ${r.endReason} arc${r.maxArc} w${r.maxWave} rank=${r.rank} cx=${r.contests} shows=${r.shows} pulls=${r.pulls.length} repels=${r.repels.length} cxcasts=${r.casts.length} cxflips=${r.cxrepels.length} won=${r.won}`);
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

  // ---- r7: contest-cast variety analysis ----
  // Same shape as the show-side census above, but for contest co-star
  // casting (fireContest weightedPick): immediate repeat = a villager cast
  // in two CONSECUTIVE contests; near repeat = a villager's consecutive
  // casts within 3 days. The player is excluded — the surest-star first
  // slot is deterministic, not the concentration path.
  const cxc = { villagerCasts: 0, immediateRepeats: 0, nearRepeats3d: 0, flips: 0, maxShare: [] };
  for (const r of runs) {
    const casts = (r.casts || []).slice().sort((a, b) => a.day - b.day);
    const counts = {}, lastDay = {};
    let prevSet = null;
    for (const c of casts) {
      const vids = (c.participants || []).filter(id => id !== 'player');
      const set = new Set(vids);
      for (const id of vids) {
        cxc.villagerCasts++;
        counts[id] = (counts[id] || 0) + 1;
        if (prevSet && prevSet.has(id)) cxc.immediateRepeats++;
        if (lastDay[id] != null && c.day - lastDay[id] <= 3) cxc.nearRepeats3d++;
        lastDay[id] = c.day;
      }
      prevSet = set;
    }
    const total = Object.values(counts).reduce((t, n) => t + n, 0);
    if (total > 0) cxc.maxShare.push(Math.max(...Object.values(counts)) / total);
    cxc.flips += (r.cxrepels || []).length;
  }

  // ---- general aggregate ----
  const sum = (f) => runs.reduce((t, r) => t + (f(r) || 0), 0);
  const avg = (f) => runs.length ? sum(f) / runs.length : 0;
  const med = (f) => { const a = runs.map(f).filter(v => v != null).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; };

  // ---- r8: adaptation analysis ----
  const ad = { outcomes: 0, playerOutcomes: 0, heatWins: 0, rivalHot: 0, stipKinds: {},
    firstTimer: { w: 0, n: 0 }, rep23: { w: 0, n: 0 }, rep4p: { w: 0, n: 0 },
    heat0: { w: 0, n: 0 }, heat1: { w: 0, n: 0 }, heat2p: { w: 0, n: 0 },
    showOutcomes: { w: 0, n: 0 }, showTwistedWins: { w: 0, n: 0 },
    heatBumps: 0, contestDeathsByPart: {}, villagerOutcomes: 0 };
  const bucket = (app) => app <= 1 ? 'firstTimer' : app <= 3 ? 'rep23' : 'rep4p';
  for (const r of runs) {
    for (const o of (r.outcomes || [])) {
      ad.outcomes++;
      const won = o.o === 'won';
      if (o.w === 'player') {
        ad.playerOutcomes++;
        const b = ad[bucket(o.a)]; b.n++; if (won) b.w++;
        const hb = o.h >= 2 ? ad.heat2p : o.h === 1 ? ad.heat1 : ad.heat0;
        hb.n++; if (won) hb.w++;
      } else {
        ad.villagerOutcomes++;
      }
      if (o.h >= 1 && won) ad.heatWins++;
      if (o.rh) ad.rivalHot++;
      const ck = o.o + '/' + o.w;
      ad.contestDeathsByPart[ck] = (ad.contestDeathsByPart[ck] || 0) + 1;
    }
    for (const o of (r.showOutcomes || [])) {
      ad.showOutcomes.n++; if (o.o === 'won') ad.showOutcomes.w++;
    }
    for (const k of Object.keys(r.stips || {})) ad.stipKinds[k] = (ad.stipKinds[k] || 0) + r.stips[k];
    ad.heatBumps += r.heatBumps || 0;
  }
  const rate = (b) => b.n ? +(b.w / b.n).toFixed(3) : null;
  const dedup = (arr, key) => { const seen = new Set(); return arr.filter(x => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
  const formats6 = { why_eat: 0, moot_show: 0, break_room: 0, mouth_race: 0, ask_human: 0, death_reel: 0 };
  for (const r of runs) for (const k of Object.keys(r.showIds || {})) if (k in formats6) formats6[k] += r.showIds[k];
  const fanFinal = { fight: [], survival: [], social: [], showbiz: [] };
  for (const r of runs) for (const k of Object.keys(fanFinal)) if (typeof (r.fanClubs || {})[k] === 'number') fanFinal[k].push(r.fanClubs[k]);
  const fanAvg = {};
  for (const k of Object.keys(fanFinal)) fanAvg[k] = fanFinal[k].length ? +(fanFinal[k].reduce((a, b) => a + b, 0) / fanFinal[k].length).toFixed(1) : null;
  const adaptAgg = {
    adaptFires: sum(r => r.adaptFires || 0), adaptDiff: sum(r => r.adaptDiff || 0),
    hardenedScalings: sum(r => r.hardenedScalings || 0),
    hardenedAdaptFires: sum(r => r.hardenedAdaptN || 0),
    hardenedAdaptDiff: sum(r => r.hardenedAdaptDiff || 0),
    stips: ad.stipKinds, showTwists: sum(r => r.showTwists || 0),
    heatBumps: ad.heatBumps, rivalHotContests: ad.rivalHot,
    outcomeN: ad.outcomes, playerOutcomeN: ad.playerOutcomes, villagerOutcomeN: ad.villagerOutcomes,
    firstTimerWinRate: rate(ad.firstTimer), rep23WinRate: rate(ad.rep23), rep4pWinRate: rate(ad.rep4p),
    firstTimerN: ad.firstTimer.n, rep23N: ad.rep23.n, rep4pN: ad.rep4p.n,
    heat0WinRate: rate(ad.heat0), heat1WinRate: rate(ad.heat1), heat2pWinRate: rate(ad.heat2p),
    heat0N: ad.heat0.n, heat1N: ad.heat1.n, heat2pN: ad.heat2p.n,
    winsAtHeat1p: ad.heatWins,
    showWinRate: rate(ad.showOutcomes), showN: ad.showOutcomes.n,
    pilotDayMedian: med(r => r.pilotDay), pilotDayMin: runs.length ? Math.min(...runs.map(r => r.pilotDay == null ? 999 : r.pilotDay)) : null,
    dossierContests: runs.reduce((s, r) => s + (r.dossierIds || []).length, 0),
    formatReach: formats6,
    pkgFires: sum(r => r.pkgFires), clubVotes: sum(r => r.clubVotes), fanAvg,
    outcomeBreakdown: ad.contestDeathsByPart,
  };
  const deathCauses = {};
  for (const r of runs) for (const d of (r.deaths || [])) deathCauses[d.cause || '?'] = (deathCauses[d.cause || '?'] || 0) + 1;
  const cats = {}, showIds = {};
  for (const r of runs) {
    for (const k of Object.keys(r.cats || {})) cats[k] = (cats[k] || 0) + r.cats[k];
    for (const k of Object.keys(r.showIds || {})) showIds[k] = (showIds[k] || 0) + r.showIds[k];
  }
  const agg = {
    n: runs.length,
    adapt: adaptAgg,
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
    contestCasts: {
      villagerCasts: cxc.villagerCasts, flips: cxc.flips,
      immediateRepeatRate: cxc.villagerCasts ? +(cxc.immediateRepeats / cxc.villagerCasts).toFixed(3) : null,
      nearRepeat3dRate: cxc.villagerCasts ? +(cxc.nearRepeats3d / cxc.villagerCasts).toFixed(3) : null,
      medianMaxShare: cxc.maxShare.length ? +cxc.maxShare.sort((a, b) => a - b)[Math.floor(cxc.maxShare.length / 2)].toFixed(2) : null,
    },
  };
  // r8 hardened verification: dedupe double application (setup + resolve builds)
  const distinct = (r, key) => dedup(r.adaptFireList || [], key);
  agg.adapt.adaptFiresDistinct = sum(r => distinct(r, f => f.d + '|' + f.c + '|' + f.v).length);
  agg.adapt.adaptDiffDistinct = sum(r => distinct(r, f => f.d + '|' + f.c + '|' + f.v).filter(f => f.diff).length);
  agg.adapt.hardenedDistinct = sum(r => distinct(r, f => f.d + '|' + f.c).filter(f => f.v === 'hardened').length);
  agg.adapt.hardenedDiffDistinct = sum(r => distinct(r, f => f.d + '|' + f.c).filter(f => f.v === 'hardened' && f.diff).length);
  console.log('\n=== AGG ===');
  console.log(JSON.stringify(agg, null, 1));
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ config: { seeds, policies: policyIds, days }, runs, agg }, null, 1)); console.log('wrote ' + outFile); }
})();
