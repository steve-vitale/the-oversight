#!/usr/bin/env node
// sweep-contests-r4.js — LONG-RUN SIM LOOP, lever 6 ROUND 4 (fan clubs + prizes).
// Baseline census on current HEAD before playing the lever:
//   - PRIZE CENSUS: contest prize grants (item id/tier) vs "vault shy" whiffs;
//     show prize outcomes (curio granted vs shy); fan care package fires.
//   - CLUB CENSUS: per-lane max favor ever, apClubBoon fires (the 50+ vote
//     gate), apCarePackage fires (20+ gate), cooldown-vs-gate failures.
//   - HIGHLIGHTS: death_reel airings; do reel airings move any club?
//   - REACHABILITY: contest categories, show types, summons, win-flag path.
// Harness conventions (AGENTS.md): seeded Math.random BEFORE eval via
// sim-harness; full src/js list minus DOM-only; never stub Game.save.
// Usage: SEEDS="..." POLICIES="competent,riskAware" DAYS=200 OUT=/tmp/r4.json node scripts/sweep-contests-r4.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { riskAware } = require('./policies/risk-aware');

const POLICIES = { competent, riskAware };
const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };

function installHooks(Game, rec) {
  rec.transcript = [];
  const cap = (t) => {
    try {
      const s = String(t);
      if (s.indexOf('📺') >= 0 || /voted|care package|fan club|shy|Death Reel|prize|favor/i.test(s)) {
        if (rec.transcript.length < 900) rec.transcript.push({ day: dayOf(Game), line: s.slice(0, 300) });
      }
    } catch (e) {}
  };
  Game.say = cap; Game.sysSay = cap;
  const wrap = (name, fn) => {
    const orig = Game[name];
    if (typeof orig !== 'function') { rec.wrapFails = rec.wrapFails || []; rec.wrapFails.push(name); return; }
    Game[name] = function(...a) { try { fn.apply(null, [this, ...a]); } catch (e) {} return orig.apply(this, a); };
  };
  // --- prize census ---
  wrap('rollAlienLoot', (G, mdef, fighter) => {
    const loot = (fighter && fighter.loot) || (mdef && mdef.loot) || null;
    rec.lootRolls.push({ day: dayOf(G), chance: loot && loot.chance, tier: loot && loot.tier });
  });
  wrap('alienLootGrant', (G, loot) => {
    const def = (loot && loot.def) || null;
    rec.prizeGrants.push({ day: dayOf(G), id: (def && def.id) || '?', name: (def && def.name) || '?',
      tier: (def && def.tier) || (loot && loot.tier) || '?' });
  });
  // --- club census ---
  const origBoon = Game.apClubBoon.bind(Game);
  Game.apClubBoon = function() {
    const day = dayOf(this);
    const fc = safe(() => Object.assign({}, this.apState().fanClubs), {});
    const maxLane = Math.max(fc.fight||0, fc.survival||0, fc.social||0, fc.showbiz||0);
    const cool = (day - ((this.apState().lastBoonDay) || -999)) < 5;
    const r = origBoon();
    rec.boonChecks.push({ day, fired: !!r, maxLane, cooldown: !!cool, gate50: maxLane >= 50 });
    if (r) rec.boonFires++;
    return r;
  };
  const origPkg = Game.apCarePackage.bind(Game);
  Game.apCarePackage = function() {
    const fc = safe(() => Object.assign({}, this.apState().fanClubs), {});
    const maxAbs = Math.max(Math.abs(fc.fight||0), Math.abs(fc.survival||0), Math.abs(fc.social||0), Math.abs(fc.showbiz||0));
    const r = origPkg();
    rec.pkgChecks.push({ day: dayOf(this), fired: !!r, favorGate: maxAbs >= 20 });
    if (r) rec.pkgFires++;
    return r;
  };
  wrap('apAdjustFavor', (G, n, why, lane) => {
    const L = lane || 'showbiz';
    rec.favorMoves.push({ day: dayOf(G), lane: L, n });
    const v = safe(() => G.apFanLane(L), 0);
    if (Math.abs(v) > Math.abs(rec.laneMax[L] || 0)) rec.laneMax[L] = v;
  });
  // --- contest/show outcomes ---
  wrap('fireContest', (G, event) => {
    rec.fireContestCalls.push({ day: dayOf(G), id: (event && event.id) || '?', cat: (event && event.cat) || '?', risk: (event && event.risk) || '?' });
  });
  // NOTE: isWatch here is ac.watch; the real code keys on participant.
  // The prize census below uses participant, not this flag.
  wrap('_contestEnd', (G, ac, outcome, prize) => {
    rec.contestEnds.push({ day: dayOf(G), id: (ac && ac.contestId) || '?', outcome: outcome || '?',
      participant: (ac && ac.participant) || 'player', prize: !!prize });
  });
  wrap('_showEnd', (G, ac, outcome, prize) => {
    rec.showEnds.push({ day: dayOf(G), id: (ac && ac.showId) || '?', name: (ac && ac.showName) || '?',
      outcome: outcome || '?', participant: ac && ac.participant, prize: !!prize });
  });
  wrap('fireShow', (G, show) => {
    rec.fireShowCalls.push({ day: dayOf(G), id: (show && show.id) || '?' });
  });
  wrap('fireRatingsSummons', (G) => { rec.summons++; });
  wrap('_cxKillContestant', (G) => { rec.contestDeaths++; });
  wrap('tele', (G, type, data) => {
    if (type === 'show_aired') rec.teleShows.push({ day: dayOf(G), id: data.id, who: data.who });
    if (type === 'contest_fired') rec.teleContests.push({ day: dayOf(G), id: data.id });
  });
}

function newRec(pid, seed) {
  return { policy: pid, seed, lootRolls: [], prizeGrants: [], favorMoves: [],
    laneMax: { fight: 0, survival: 0, social: 0, showbiz: 0 },
    boonChecks: [], boonFires: 0, pkgChecks: [], pkgFires: 0,
    fireContestCalls: [], fireShowCalls: [], contestEnds: [], showEnds: [],
    teleShows: [], teleContests: [], summons: 0, contestDeaths: 0, transcript: [] };
}

(async () => {
  const seeds = (process.env.SEEDS || '424242,777001,999983,20261011,7,12345,31337,8675309').split(',').map(s => s.trim()).filter(Boolean).map(Number);
  const policyIds = (process.env.POLICIES || 'competent,riskAware').split(',').map(s => s.trim()).filter(Boolean);
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
      await setupGame(Game);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { const d = dayOf(G); if (d === 60 || d === 120) {
          const fc = safe(() => Object.assign({}, G.apState().fanClubs), {});
          rec['clubs_d' + d] = fc;
        } } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      rec.days = result.days; rec.endReason = result.endReason; rec.ms = result.ms;
      rec.clubsEnd = safe(() => Object.assign({}, Game.apState().fanClubs), {});
      runs.push(rec);
      console.log(`done: ${pid} seed=${seed} days=${result.days} end=${result.endReason} contests=${rec.fireContestCalls.length} shows=${rec.fireShowCalls.length} grants=${rec.prizeGrants.length} boons=${rec.boonFires} pkgs=${rec.pkgFires} laneMax=${JSON.stringify(rec.laneMax)} (${result.ms}ms)`);
    }
  }
  // ---- aggregate ----
  const agg = {};
  for (const pid of policyIds) {
    const pr = runs.filter(r => r.policy === pid);
    if (!pr.length) continue;
    const sum = (f) => pr.reduce((t, r) => t + (f(r) || 0), 0);
    const avg = (f) => sum(f) / pr.length;
    const cats = {}, showIds = {}, contestOutcomes = {}, grantByTier = {}, grantIds = {};
    const laneAbsMax = { fight: 0, survival: 0, social: 0, showbiz: 0 };
    let boonFire = 0, boonGateFail = 0, boonCoolFail = 0, pkgFire = 0, pkgGateFail = 0;
    let shyWhiffs = 0;
    for (const r of pr) {
      for (const c of r.fireContestCalls) cats[c.cat] = (cats[c.cat] || 0) + 1;
      for (const s of (r.teleShows.length ? r.teleShows : r.fireShowCalls)) showIds[s.id] = (showIds[s.id] || 0) + 1;
      for (const e of r.contestEnds) contestOutcomes[e.outcome] = (contestOutcomes[e.outcome] || 0) + 1;
      for (const g of r.prizeGrants) { grantByTier[g.tier] = (grantByTier[g.tier] || 0) + 1; grantIds[g.id] = (grantIds[g.id] || 0) + 1; }
      for (const L of Object.keys(laneAbsMax)) laneAbsMax[L] = Math.max(laneAbsMax[L], Math.abs(r.laneMax[L] || 0));
      boonFire += r.boonFires; pkgFire += r.pkgFires;
      for (const b of r.boonChecks) { if (!b.fired && !b.gate50) boonGateFail++; else if (!b.fired && b.cooldown) boonCoolFail++; }
      for (const p of r.pkgChecks) { if (!p.fired && !p.favorGate) pkgGateFail++; }
      // "vault shy": contest WIN with prize path but no grant. Approximate via transcript lines.
    }
    // Count shy lines in transcripts
    let shyLines = 0, prizeWins = 0, votedLines = 0;
    for (const r of pr) for (const t of r.transcript) {
      if (/feeling shy/i.test(t.line)) shyLines++;
      if (/voted:/i.test(t.line)) votedLines++;
    }
    agg[pid] = { n: pr.length, avgDays: +avg(r => r.days).toFixed(1),
      contests: sum(r => r.fireContestCalls.length), shows: sum(r => r.fireShowCalls.length),
      summons: sum(r => r.summons), contestDeaths: sum(r => r.contestDeaths),
      contestOutcomes, cats, showIds,
      prizeGrants: sum(r => r.prizeGrants.length), grantByTier, grantIds,
      boonFires: boonFire, boonGateFails: boonGateFail, boonCoolFails: boonCoolFail,
      pkgFires: pkgFire, pkgGateFails: pkgGateFail,
      laneAbsMax, shyLines, votedLines,
    };
  }
  console.log('\n=== AGG ===');
  console.log(JSON.stringify(agg, null, 1));
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ config: { seeds, policies: policyIds, days }, runs, agg }, null, 1)); console.log('wrote ' + outFile); }
})();
