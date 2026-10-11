#!/usr/bin/env node
// sweep-contests-lever.js — LONG-RUN SIM LOOP, lever 6 (contests & shows).
// Baseline measurement + before/after lever comparison on identical seeds.
// Measures on current HEAD (the lever change, if any, is already in src):
//   - contests fired (by category: blood/endurance/moot/weird/puzzle/detective/forage/chance)
//   - shows fired by type (the six canon show types)
//   - ratings summons fired, and how they resolved
//   - fan club formation (apState().fanClubs per lane)
//   - eligibility breadth (player vs villager taken; System's-whim picks)
//   - countdown-dread events (announce vs grab), first-fire day (canon: day 14-21)
//   - aftermath: contest deaths, show gossip, viewership curve, weekly-budget use
//   - transcript capture of 📺 + village-reaction lines for sense-testing
//
// Node harness conventions (AGENTS.md):
//   - Math.random seeded BEFORE eval (sim-harness does mulberry32)
//   - eval FULL src/js/*.js list in index.html order minus DOM-only modules
//   - never stub Game.save; no concurrent jest
//
// Usage:
//   SEEDS="424242,777001,999983" POLICIES="competent,leader" DAYS=200 \
//     OUT=/tmp/contests-base.json node scripts/sweep-contests-lever.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const idle = require('./policies/idle');
const { competent } = require('./policies/competent');

const POLICIES = { zero: idle.zero, mvc: idle.mvc, leader: idle.leader, competent };
const SHOW_TYPES = ['why_eat', 'break_room', 'mouth_race', 'ask_human', 'death_reel'];
// NOTE: showPool ids are why_eat, break_room, mouth_race, ask_human, death_reel,
// plus nap_wars/museum_of_you/etc via SHOW_BEATS? shows fire via pickShow from
// showPool — capture whatever id fires and bucket it.

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}
const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };

function installHooks(Game, rec) {
  rec.transcript = [];
  const cap = (t) => {
    try {
      const s = String(t);
      if (s.indexOf('📺') >= 0 || /village holds its breath|gossip|fans?|shame|notability|chosen|The village/i.test(s)) {
        if (rec.transcript.length < 900) rec.transcript.push({ day: dayOf(Game), line: s.slice(0, 320) });
      }
    } catch (e) {}
  };
  // Capture (not silence) narration for sense-testing.
  Game.say = cap;
  Game.sysSay = cap;
  const wrap = (name, fn) => {
    const orig = Game[name];
    if (typeof orig !== 'function') { rec.wrapFails = rec.wrapFails || []; rec.wrapFails.push(name); return; }
    Game[name] = function(...a) { try { fn.apply(null, [this, ...a]); } catch (e) {} return orig.apply(this, a); };
  };
  // tele carries the rich cast metadata: show_aired {id, who, why}, contest_fired {id}
  wrap('tele', (G, type, data) => {
    if (type === 'show_aired') rec.teleShows.push({ day: dayOf(G), id: data.id, who: data.who, why: data.why });
    if (type === 'contest_fired') rec.teleContests.push({ day: dayOf(G), id: data.id });
  });
  wrap('fireContest', (G, event) => {});
  wrap('resolveContest', (G) => { rec.grabs++; rec.grabDays.push(dayOf(G)); });
  wrap('fireRatingsSummons', (G) => { rec.summons++; rec.summonsDays.push(dayOf(G)); });
  wrap('_cxKillContestant', (G, pid) => { rec.contestDeaths++; rec.contestDeathDays.push(dayOf(G)); });
  wrap('_contestEnd', (G, ac, outcome, prize) => {
    const pc = (ac && ac.participants) || [ac && ac.participant];
    rec.contestEnds.push({ day: dayOf(G), id: (ac && ac.contestId) || '?', outcome: outcome || '?',
      participants: pc, prize: !!prize });
  });
  wrap('_showEnd', (G, ac, outcome, prize) => {
    rec.showEnds.push({ day: dayOf(G), name: (ac && ac.showName) || '?', id: (ac && ac.showId) || '?',
      kind: (ac && ac.kind) || '?', outcome: outcome || '?', participant: ac && ac.participant, prize: !!prize });
  });
  wrap('_showVillagerEnd', (G, ac) => {
    // Villager pulls resolve here, not in _showEnd: the outcome is computed
    // inside from showResolveVillager. Capture participant + show; outcome
    // is recovered from the post-call say lines via showResolveVillager hook.
    rec.showEnds.push({ day: dayOf(G), name: (ac && ac.showName) || '?', id: (ac && ac.showId) || '?',
      kind: 'show-villager', outcome: '?', participant: ac && ac.participant, prize: false });
  });
  wrap('showResolveVillager', (G, pid) => { rec._lastVillagerPid = pid; });
}

function snapshot(Game, rec, tag) {
  const snap = { tag, day: dayOf(Game) };
  snap.viewership = safe(() => (typeof Game.havenViewership === 'function' ? Game.havenViewership() : Game.state.village.viewership) || 0, 0);
  const elig = safe(() => Game.contestEligible(), null);
  if (elig) {
    snap.eligibleN = (elig.eligible || []).length;
    snap.playerEligible = (elig.eligible || []).some(e => e.id === 'player');
    snap.ineligibleReasons = {};
    for (const ie of (elig.ineligible || [])) {
      const r = String(ie.reason || 'unknown').slice(0, 40);
      snap.ineligibleReasons[r] = (snap.ineligibleReasons[r] || 0) + 1;
    }
  }
  snap.fanClubs = safe(() => Object.assign({}, (Game.apState && Game.apState().fanClubs) || {}), {});
  snap.showGossip = safe(() => (Game.state.village.gossip || []).filter(g => String(g.action || '').indexOf('show_') === 0).length, 0);
  snap.dipping = safe(() => !!(Game.state.village || {})._dipping, false);
  (rec.snapshots = rec.snapshots || []).push(snap);
}

function newRec(pid, seed) {
  return { policy: pid, seed, contestsFired: 0, showsFired: 0, summons: 0,
    grabs: 0, contestDeaths: 0, contestEnds: [], showEnds: [], teleShows: [], teleContests: [],
    grabDays: [], summonsDays: [], contestDeathDays: [], snapshots: [], transcript: [],
    fireContestCalls: [], fireShowCalls: [] };
}

(async () => {
  const seeds = parseList('SEEDS', '424242,777001,999983,20261011,7,12345,31337,8675309').map(Number);
  const policyIds = parseList('POLICIES', 'competent,leader');
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;
  const runs = [];

  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error(`unknown policy: ${pid}`); process.exit(1); }
    for (const seed of seeds) {
      const rec = newRec(pid, seed);
      const { Game } = await loadGame({ seed, mode: pid, fullTelemetry: false });
      installHooks(Game, rec);
      // Capture fired events with contest metadata (contestTick -> fireContest/show path).
      const origFireContest = Game.fireContest.bind(Game);
      Game.fireContest = function(event) {
        rec.contestsFired++;
        const pc = this.state.pendingContest;
        rec.fireContestCalls.push({ day: dayOf(this),
          id: (event && event.id) || '?', cat: (event && event.cat) || '?',
          risk: (event && event.risk) || '?', variant: (event && event.variant) || null,
          pending: pc ? (pc.participants || []).slice() : null });
        return origFireContest(event);
      };
      const origFireShow = Game.fireShow.bind(Game);
      Game.fireShow = function(show) {
        rec.showsFired++;
        const s = (show && show.id) ? show : null;
        const r = origFireShow(show);
        rec.fireShowCalls.push({ day: dayOf(this),
          id: (s && s.id) || ((r && r.id) || '?'), name: (s && s.name) || ((r && r.name) || '?'),
          participant: this.state.activeContest ? this.state.activeContest.participant : '?' });
        return r;
      };
      await setupGame(Game);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try {
          const d = dayOf(G);
          if (d === 30 || d === 90 || d === 150) snapshot(G, rec, 'd' + d);
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      rec.days = result.days; rec.endReason = result.endReason; rec.ms = result.ms;
      rec.firstContestDay = rec.fireContestCalls.length ? rec.fireContestCalls[0].day : null;
      rec.firstShowDay = rec.fireShowCalls.length ? rec.fireShowCalls[0].day : null;
      snapshot(Game, rec, 'end');
      // per-week TV budget utilization (2/week cap)
      rec.tvPerWeek = {};
      for (const e of rec.fireContestCalls.concat(rec.fireShowCalls)) {
        const w = Math.floor(e.day / 7);
        rec.tvPerWeek[w] = (rec.tvPerWeek[w] || 0) + 1;
      }
      runs.push(rec);
      console.log(`done: ${pid} seed=${seed} days=${result.days} end=${result.endReason} contests=${rec.contestsFired} shows=${rec.showsFired} summons=${rec.summons} grabs=${rec.grabs} cdeaths=${rec.contestDeaths} firstContest=${rec.firstContestDay} (${result.ms}ms)`);
    }
  }

  // ---- aggregate ----
  const agg = {};
  for (const pid of policyIds) {
    const pr = runs.filter(r => r.policy === pid);
    if (!pr.length) continue;
    const sum = (f) => pr.reduce((t, r) => t + (f(r) || 0), 0);
    const avg = (f) => sum(f) / pr.length;
    const contestCats = {}, showIds = {}, showWho = {}, showWhy = {}, contestOutcomes = {}, showOutcomes = {};
    let firstContestDays = [], firstShowDays = [];
    let weeksAtCap = 0, weeksZeroTV = 0, weekTotal = 0;
    for (const r of pr) {
      for (const c of r.fireContestCalls) contestCats[c.cat] = (contestCats[c.cat] || 0) + 1;
      for (const s of r.teleShows.length ? r.teleShows : r.fireShowCalls) {
        const id = s.id || '?';
        showIds[id] = (showIds[id] || 0) + 1;
        if (s.who) { showWho[s.who === 'player' ? 'player' : (s.who === 'together' ? 'together' : 'villager')] = (showWho[s.who === 'player' ? 'player' : (s.who === 'together' ? 'together' : 'villager')] || 0) + 1; }
        if (s.why) showWhy[s.why] = (showWhy[s.why] || 0) + 1;
      }
      for (const e of r.contestEnds) contestOutcomes[e.outcome] = (contestOutcomes[e.outcome] || 0) + 1;
      for (const e of r.showEnds) showOutcomes[e.outcome] = (showOutcomes[e.outcome] || 0) + 1;
      if (r.firstContestDay != null) firstContestDays.push(r.firstContestDay);
      if (r.firstShowDay != null) firstShowDays.push(r.firstShowDay);
      for (const w of Object.keys(r.tvPerWeek)) { weekTotal++; if (r.tvPerWeek[w] >= 2) weeksAtCap++; }
      const lastWeek = Math.floor(r.days / 7);
      for (let w = 2; w <= lastWeek; w++) { if (!r.tvPerWeek[w]) weeksZeroTV++; }
    }
    agg[pid] = {
      n: pr.length, avgDays: +avg(r => r.days).toFixed(1),
      avgContests: +avg(r => r.contestsFired).toFixed(1),
      avgShows: +avg(r => r.showsFired).toFixed(1),
      avgSummons: +avg(r => r.summons).toFixed(2),
      avgGrabs: +avg(r => r.grabs).toFixed(1),
      avgContestDeaths: +avg(r => r.contestDeaths).toFixed(2),
      firstContestDay: firstContestDays.length ? Math.round(firstContestDays.reduce((a,b)=>a+b,0)/firstContestDays.length) : null,
      firstShowDay: firstShowDays.length ? Math.round(firstShowDays.reduce((a,b)=>a+b,0)/firstShowDays.length) : null,
      contestCats, showIds, showWho, showWhy, contestOutcomes, showOutcomes,
      weeksAtCap, weeksZeroTV, weeksSampled: weekTotal,
    };
  }
  console.log('\n=== AGG ===');
  console.log(JSON.stringify(agg, null, 1));
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ config: { seeds, policies: policyIds, days }, runs, agg }, null, 1)); console.log('wrote ' + outFile); }
})();
