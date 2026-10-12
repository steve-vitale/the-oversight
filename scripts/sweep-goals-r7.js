#!/usr/bin/env node
// sweep-goals-r7.js — VILLAGER GOAL ARCS measurement (2026-10-12, lever 3 r7).
// "Do goals live?" — per-goal behavior differentiation, leadership-arc
// lifecycle, goal changes/resolution, escape-goal fates, plus standard
// reachability metrics. Wraps sim-harness (shared infra untouched) and the
// competent policy (behavior untouched).
//
// Per run records:
//   - GOALS: day-0 goal census per villager (+profile/temper), goal at end,
//     goal changes (any machinery besides leadership refocus?)
//   - DIFFERENTIATION: expedition departures/returns + haul kcal per goal,
//     objective-kind shares per goal (FORAGE per goal = does 'feed' forage
//     more?), mapped_far deeds per goal, deaths per goal
//   - ESCAPE: LEAVE departures, fates (still away at end / dead / removed /
//     came back), days from departure to fate
//   - LEADERSHIP: challenges issued, heat events, contendArc end states
//     (open/respect/refocus/leave), resolution attempts + outcomes,
//     contender deaths mid-arc (hygiene check)
//   - STANDARD: endReason, days, max arc/wave, won, table, breadth, stage,
//     death-cause shares (player/villager)
//
// Usage:
//   SEEDS="1,...,12" DAYS=200 OUT=/tmp/goals-r7.json node scripts/sweep-goals-r7.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

const DISEASE_RE = /gutrot|trichinosis|lockjaw|wound_?fever|trembles|lemons|eurika|east_?nile|howlbelly|gristlefit|croakbelly|shellgut|witness_?maw|flockmind|disease|sick|plague|pox/;
function bucket(c, monsterNames) {
  c = String(c || '').toLowerCase().trim();
  if (!c || c === '?' || c === 'the wild') return 'unattributed';
  if (/the night|starvat|the expedition/.test(c)) return 'starvation';
  if (/contest/.test(c)) return 'contest';
  if (/phoenix/.test(c)) return 'phoenix';
  if (/thirst|dehydrat/.test(c)) return 'thirst';
  if (/raid-defense/.test(c)) return 'raid-defense';
  if (/^raid/.test(c)) return 'raid';
  if (/alien/.test(c)) return 'alien-attack';
  if (/ambush|murder|betrayal|assassin/.test(c)) return 'murder';
  if (DISEASE_RE.test(c)) return 'disease';
  if (/wound|injur|bled|mauled/.test(c)) return 'wound';
  if (/^monster$|combat|split-fight/.test(c)) return 'combat';
  for (const n of monsterNames) { if (n && c.includes(n)) return 'combat'; }
  return 'other';
}

(async () => {
  const seeds = parseList('SEEDS', Array.from({ length: 12 }, (_, i) => String(10101 + i * 101)).join(',')).map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent', fullTelemetry: true });
    await setupGame(Game);

    const playerId = Game.villagerId;
    const roster0 = ((Game.state.village || {}).roster || []).filter(id => id !== playerId);

    // ---- day-0 goal census ----
    const day0 = {}; // vid -> {goal, profile, temper}
    for (const vid of roster0) {
      let goal = null, profile = null, temper = null;
      try { goal = Game.npcGoal(vid); } catch (e) {}
      try { profile = Game.npcRangeProfile(vid); } catch (e) {}
      try { temper = Game.npcTemper(vid); } catch (e) {}
      day0[vid] = { goal: goal || '?', profile: profile || '?', temper: temper || '?' };
    }
    const goalOf = (vid) => vid === playerId ? 'player(self)' : ((day0[vid] && day0[vid].goal) || '?');

    // ---- instrumentation (sweep tooling only, never game code) ----
    const expedDepart = {}, expedReturn = {}, expedHaul = {};
    const leaveDepart = {}; // vid -> day departed
    const leaveFates = []; // {vid, goal, fate, day}
    const removals = {}; // goal -> {how: n}
    const arcAttempts = { n: 0 };
    const arcOutcomes = {}; // state -> n
    const arcOutcomeGoals = {}; // state -> [goals]
    let challengesIssued = 0, challengeDays = 0;
    let lastChallengeCid = null;
    const challengesSeen = new Set();

    try {
      const _se = Game.startExpedition;
      Game.startExpedition = function (vid, hx, hy, announce) {
        const g = goalOf(vid);
        expedDepart[g] = (expedDepart[g] || 0) + 1;
        return _se.call(this, vid, hx, hy, announce);
      };
      const _er = Game.expeditionReturn;
      Game.expeditionReturn = function (vid, playerAtHaven) {
        const g = goalOf(vid);
        let kcal = 0;
        try {
          const ex = (this.agencyState().exped || {})[vid];
          for (const f of (ex && ex.finds) || []) kcal += f.kcal || 0;
        } catch (e) {}
        expedReturn[g] = (expedReturn[g] || 0) + 1;
        expedHaul[g] = (expedHaul[g] || 0) + kcal;
        return _er.call(this, vid, playerAtHaven);
      };
      const _od = Game.objDepart;
      Game.objDepart = function (vid, obj, hx, hy, playerAtHaven) {
        if (obj && obj.purpose === 'leave') {
          leaveDepart[vid] = (this.state.scholar || {}).day || 0;
        }
        return _od.call(this, vid, obj, hx, hy, playerAtHaven);
      };
      const _rv = Game.removeVillager;
      Game.removeVillager = function (vid, how) {
        const g = goalOf(vid);
        removals[g] = removals[g] || {};
        removals[g][how || '?'] = (removals[g][how || '?'] || 0) + 1;
        // escape-LEAVE fate tracking
        if (leaveDepart[vid] != null) {
          leaveFates.push({ vid, goal: g, fate: 'removed:' + (how || '?'), day: (this.state.scholar || {}).day || 0, afterDays: ((this.state.scholar || {}).day || 0) - leaveDepart[vid] });
          delete leaveDepart[vid];
        }
        return _rv.call(this, vid, how);
      };
      const _mra = Game._maybeResolveContendArc;
      if (_mra) {
        Game._maybeResolveContendArc = function (cid, arc) {
          arcAttempts.n++;
          const r = _mra.call(this, cid, arc);
          if (r) {
            arcOutcomes[r] = (arcOutcomes[r] || 0) + 1;
            arcOutcomeGoals[r] = arcOutcomeGoals[r] || [];
            arcOutcomeGoals[r].push(goalOf(cid));
          }
          return r;
        };
      }
    } catch (e) {}

    // objective-kind shares per goal (sampled) + challenge watch
    const objKindByGoal = {}; // goal -> {kind: n}
    const policy = Object.assign({}, competent);
    const playerIds = new Set();
    const origDaily = competent.daily;
    policy.daily = (G, ctx) => {
      try { if (G.villagerId) playerIds.add(G.villagerId); } catch (e) {}
      try {
        const v = G.state.village || {};
        const ch = v.challenge;
        if (ch && ch.cid && !challengesSeen.has(ch.cid + ':' + (G.state.scholar || {}).day)) {
          challengesSeen.add(ch.cid + ':' + (G.state.scholar || {}).day);
          challengesIssued++;
        }
        if (ch) challengeDays++;
        const d = (G.state.scholar || {}).day || 0;
        if (d % 10 === 0 && G.objState) {
          const o = G.objState() || {};
          for (const id of Object.keys(o)) {
            const g = goalOf(id);
            const k = o[id].kind || '?';
            objKindByGoal[g] = objKindByGoal[g] || {};
            objKindByGoal[g][k] = (objKindByGoal[g][k] || 0) + 1;
          }
        }
      } catch (e) {}
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    };

    const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
    const telemetry = result.telemetry || [];

    const monsterNames = new Set();
    try { for (const m of (Game.data.monsters || [])) { monsterNames.add(String(m.name || '').toLowerCase()); monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' ')); } } catch (e) {}

    // deaths per goal + buckets
    const deathBucketsP = {}, deathBucketsV = {}, deathsPerGoal = {};
    let playerDeaths = 0, villagerDeaths = 0;
    for (const ev of telemetry) {
      if (ev.type !== 'death' || (ev.kind || '') === 'monster') continue;
      const b = bucket(ev.cause, monsterNames);
      if (playerIds.has(ev.who)) { playerDeaths++; deathBucketsP[b] = (deathBucketsP[b] || 0) + 1; }
      else {
        villagerDeaths++;
        deathBucketsV[b] = (deathBucketsV[b] || 0) + 1;
        const g = goalOf(ev.who);
        deathsPerGoal[g] = deathsPerGoal[g] || {};
        deathsPerGoal[g][b] = (deathsPerGoal[g][b] || 0) + 1;
      }
    }

    // mapped_far deeds per goal (ranging differentiation made visible)
    const deedsPerGoal = {};
    try {
      for (const d of ((Game.agencyState() || {}).ach || [])) {
        const g = goalOf(d.vid);
        deedsPerGoal[g] = deedsPerGoal[g] || {};
        deedsPerGoal[g][d.type] = (deedsPerGoal[g][d.type] || 0) + 1;
      }
    } catch (e) {}

    // leadership end-state
    let contendArcEnd = {};
    try {
      const ca = (Game.state.village || {}).contendArc || {};
      for (const [cid, arc] of Object.entries(ca)) {
        contendArcEnd[arc.state || '?'] = contendArcEnd[arc.state || '?'] || [];
        contendArcEnd[arc.state || '?'].push({ cid, goal: goalOf(cid), stoodDown: arc.stoodDown || 0, yielded: arc.yielded || 0, resolvedDay: arc.resolvedDay || null });
      }
    } catch (e) {}
    let heatEnd = {};
    try {
      for (const [cid, h] of Object.entries((Game.state.village || {}).heat || {})) heatEnd[cid] = { goal: goalOf(cid), heat: h };
    } catch (e) {}

    // goal changes: day0 vs end
    const goalChanges = [];
    const goalEnd = {};
    try {
      const rosterEnd = (Game.state.village || {}).roster || [];
      for (const vid of roster0) {
        const g0 = day0[vid].goal;
        let g1 = null;
        try { g1 = Game.npcGoal(vid); } catch (e) {}
        goalEnd[vid] = { goal0: g0, goal1: g1, alive: rosterEnd.includes(vid) };
        if (g1 && g1 !== g0) goalChanges.push({ vid, from: g0, to: g1, alive: rosterEnd.includes(vid) });
      }
    } catch (e) {}

    // escape-LEAVE fates: anyone still departed at end?
    const dayEnd = (Game.state.scholar || {}).day || 0;
    for (const vid of Object.keys(leaveDepart)) {
      const v = Game.state.village || {};
      const onRoster = (v.roster || []).includes(vid);
      const away = (v.away || {})[vid];
      leaveFates.push({ vid, goal: goalOf(vid), fate: onRoster ? (away ? 'still-away-at-end' : 'back-on-roster') : 'off-roster-unrecorded', day: dayEnd, afterDays: dayEnd - leaveDepart[vid] });
    }

    // standard end-state
    let maxArc = 1, won = false, tableWaiting = false, breadth = 0, stage = 0;
    try { maxArc = (Game.progState() || {}).arc || 1; } catch (e) {}
    try { won = !!Game.won; } catch (e) {}
    try { tableWaiting = !!((Game.progState() || {}).tableWaiting); } catch (e) {}
    try { breadth = Game.codexBreadth(); } catch (e) {}
    try { stage = Game.integrationStage(); } catch (e) {}

    const goalCensus = {};
    for (const vid of roster0) { const g = day0[vid].goal; goalCensus[g] = (goalCensus[g] || 0) + 1; }
    const profileByGoal = {};
    for (const vid of roster0) {
      const g = day0[vid].goal, p = day0[vid].profile;
      profileByGoal[g] = profileByGoal[g] || {};
      profileByGoal[g][p] = (profileByGoal[g][p] || 0) + 1;
    }

    const rec = {
      seed, days: result.days, endReason: result.endReason,
      maxArc, maxWaveUnlocked: result.maxWaveUnlocked, won, tableWaiting, breadth, stage,
      playerDeaths, villagerDeaths, deathBucketsP, deathBucketsV, deathsPerGoal,
      goalCensus, profileByGoal, objKindByGoal,
      expedDepart, expedReturn, expedHaul, deedsPerGoal,
      leaveFates, removals,
      challengesIssued, challengeDays, arcAttempts: arcAttempts.n, arcOutcomes, arcOutcomeGoals,
      contendArcEnd, heatEnd, goalChanges,
    };
    runs.push(rec);
    console.log(`done: seed=${seed} days=${result.days} end=${result.endReason} w=${result.maxWaveUnlocked} arc=${maxArc} chal=${challengesIssued} arcRes=${JSON.stringify(arcOutcomes)} goalChg=${goalChanges.length} leaves=${leaveFates.length}`);
  }

  // ---- aggregate ----
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const ds = runs.map(r => r.days).sort((a, b) => a - b);
  const mergeCounts = (key) => { const o = {}; for (const r of runs) for (const [k, n] of Object.entries(r[key] || {})) o[k] = (o[k] || 0) + n; return o; };
  const share = (obj) => { const t = sum(Object.values(obj)) || 1; const o = {}; for (const [k, v] of Object.entries(obj)) o[k] = +(100 * v / t).toFixed(1); return o; };
  const addBuckets = (key) => { const o = {}; for (const r of runs) for (const [b, n] of Object.entries(r[key])) o[b] = (o[b] || 0) + n; return o; };

  // per-goal aggregates
  const goals = {};
  const bump = (g, field, val) => { goals[g] = goals[g] || {}; goals[g][field] = (goals[g][field] || 0) + val; };
  for (const r of runs) {
    for (const [g, n] of Object.entries(r.goalCensus || {})) bump(g, 'census', n);
    for (const [g, n] of Object.entries(r.expedDepart || {})) bump(g, 'expedDepart', n);
    for (const [g, n] of Object.entries(r.expedReturn || {})) bump(g, 'expedReturn', n);
    for (const [g, n] of Object.entries(r.expedHaul || {})) bump(g, 'expedHaulKcal', n);
  }
  // deaths per goal
  const deathsG = {};
  for (const r of runs) for (const [g, b] of Object.entries(r.deathsPerGoal || {})) {
    deathsG[g] = deathsG[g] || {};
    for (const [k, n] of Object.entries(b)) deathsG[g][k] = (deathsG[g][k] || 0) + n;
  }
  for (const g of Object.keys(goals)) goals[g].deaths = sum(Object.values(deathsG[g] || {}));
  // objective shares per goal (mean of sampled counts -> share)
  const objShareByGoal = {};
  for (const r of runs) for (const [g, kinds] of Object.entries(r.objKindByGoal || {})) {
    objShareByGoal[g] = objShareByGoal[g] || {};
    for (const [k, n] of Object.entries(kinds)) objShareByGoal[g][k] = (objShareByGoal[g][k] || 0) + n;
  }
  for (const g of Object.keys(objShareByGoal)) objShareByGoal[g] = share(objShareByGoal[g]);
  // profile distribution per goal
  const profByGoal = {};
  for (const r of runs) for (const [g, ps] of Object.entries(r.profileByGoal || {})) {
    profByGoal[g] = profByGoal[g] || {};
    for (const [p, n] of Object.entries(ps)) profByGoal[g][p] = (profByGoal[g][p] || 0) + n;
  }
  // mapped_far deeds per goal
  const farDeeds = {};
  for (const r of runs) for (const [g, ds2] of Object.entries(r.deedsPerGoal || {})) farDeeds[g] = (farDeeds[g] || 0) + (ds2.mapped_far || 0);

  const leaveFatesAll = [];
  for (const r of runs) for (const f of (r.leaveFates || [])) leaveFatesAll.push(Object.assign({ seed: r.seed }, f));
  const fateCounts = {};
  for (const f of leaveFatesAll) fateCounts[f.fate] = (fateCounts[f.fate] || 0) + 1;

  const goalChangesAll = [];
  for (const r of runs) for (const c of (r.goalChanges || [])) goalChangesAll.push(Object.assign({ seed: r.seed }, c));

  const agg = {
    n: runs.length,
    medianDays: ds[Math.floor(ds.length / 2)], maxDays: ds[ds.length - 1],
    endReasons: runs.reduce((o, r) => { o[r.endReason] = (o[r.endReason] || 0) + 1; return o; }, {}),
    won: runs.filter(r => r.won).length, tableWaiting: runs.filter(r => r.tableWaiting).length,
    maxArcDist: runs.reduce((o, r) => { o[r.maxArc] = (o[r.maxArc] || 0) + 1; return o; }, {}),
    maxWaveDist: runs.reduce((o, r) => { o[r.maxWaveUnlocked] = (o[r.maxWaveUnlocked] || 0) + 1; return o; }, {}),
    playerDeaths: sum(runs.map(r => r.playerDeaths)), villagerDeaths: sum(runs.map(r => r.villagerDeaths)),
    playerBucketShare: share(addBuckets('deathBucketsP')), villagerBucketShare: share(addBuckets('deathBucketsV')),
    meanBreadth: +(sum(runs.map(r => r.breadth)) / runs.length).toFixed(1),
    meanStage: +(sum(runs.map(r => r.stage)) / runs.length).toFixed(1),
    // goals
    perGoal: goals,
    deathsPerGoal: deathsG,
    objShareByGoal,
    profileByGoal: profByGoal,
    mappedFarDeedsPerGoal: farDeeds,
    leaveFateCounts: fateCounts,
    leaveFates: leaveFatesAll,
    removals: (() => { const o = {}; for (const r of runs) for (const [g, h] of Object.entries(r.removals || {})) { o[g] = o[g] || {}; for (const [k, n] of Object.entries(h)) o[g][k] = (o[g][k] || 0) + n; } return o; })(),
    challengesIssued: sum(runs.map(r => r.challengesIssued)),
    challengeDays: sum(runs.map(r => r.challengeDays)),
    arcAttempts: sum(runs.map(r => r.arcAttempts)),
    arcOutcomes: mergeCounts('arcOutcomes'),
    goalChanges: goalChangesAll,
  };
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10), policy: 'competent', commit: runs.length ? undefined : undefined }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
