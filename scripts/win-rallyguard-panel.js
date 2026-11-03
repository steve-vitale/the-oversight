#!/usr/bin/env node
// RALLY-GUARD panel (win-drives Track 3, 2026-11-03).
// Counts, per competent-policy seed: raid gossip events, guard departures,
// and guard departures within 3 days after a raid gossip event (the drive's
// window), plus rally-ask calls (objAskCompanion with rallyOnly — only the
// drive's code path passes that flag, so BEFORE runs must read 0).
// Run twice on IDENTICAL seeds: once on base code (BEFORE), once on the
// drive branch (AFTER). Env: SEEDS (csv, default 31001-31008), DAYS
// (default 120), EVIDIR (absolute; default evidence/2026-11-03/
// rallyguard-panel under this checkout's root).
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '31001,31002,31003,31004,31005,31006,31007,31008')
  .split(',').map(s => parseInt(s, 10));
const DAYS = parseInt(process.env.DAYS || '120', 10);
const EVIDIR = process.env.EVIDIR || path.join(__dirname, '..', 'evidence', '2026-11-03', 'rallyguard-panel');
const RALLY_GOALS = ['protect', 'prove', 'lead'];

(async () => {
  fs.mkdirSync(EVIDIR, { recursive: true });
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed });
    await setupGame(Game, 'Columbus, Ohio');
    const departures = [];   // {day, vid, purpose, companion, guardGoal, freshRaid}
    const raidDays = [];     // days on which a raid gossip entry appeared
    const rallyAsks = [];    // {day, principal, picked}
    const seenRaidKeys = new Set();
    // Watch gossip for new raid entries (cheap scan on each departure wrap).
    const noteRaids = () => {
      try {
        const g = (Game.state.village.gossip || []);
        const day = (Game.state.scholar || {}).day || 0;
        for (const e of g) {
          if (e.action !== 'raid') continue;
          const k = (e.day || 0) + ':' + (e.village || e.raiders || '?');
          if (!seenRaidKeys.has(k)) { seenRaidKeys.add(k); raidDays.push(e.day || 0); }
        }
      } catch (e) {}
    };
    const freshRaid = () => {
      try {
        const day = (Game.state.scholar || {}).day || 0;
        return (Game.state.village.gossip || [])
          .some(e => e.action === 'raid' && day - (e.day || 0) <= 3);
      } catch (e) { return false; }
    };
    const _od = Game.objDepart;
    Game.objDepart = function (vid, obj, hx, hy, playerAtHaven) {
      try {
        noteRaids();
        const o = obj || {};
        const day = (Game.state.scholar || {}).day || 0;
        let guardGoal = null;
        try { guardGoal = Game.npcGoal ? Game.npcGoal(vid) : null; } catch (e) {}
        departures.push({ day, vid, purpose: o.purpose || null, companion: o.companion || null,
          targetVid: o.targetVid || null, guardGoal, freshRaid: freshRaid() });
      } catch (e) {}
      return _od.apply(this, arguments);
    };
    const _ac = Game.objAskCompanion;
    if (typeof _ac === 'function') {
      Game.objAskCompanion = function (vid, obj, hx, hy, opts) {
        const r = _ac.apply(this, arguments);
        try {
          if (opts && opts.rallyOnly) {
            rallyAsks.push({ day: (Game.state.scholar || {}).day || 0, principal: vid, picked: r || null });
          }
        } catch (e) {}
        return r;
      };
    }
    const policy = Object.assign({ id: 'competent' }, competent);
    const result = await runDays(Game, policy, { days: DAYS });
    const guardDeps = departures.filter(d => d.purpose === 'guard');
    const rallyGuardDeps = guardDeps.filter(d => d.freshRaid);
    const rallyGoalGuardDeps = rallyGuardDeps.filter(d => RALLY_GOALS.includes(d.guardGoal));
    const out = { seed, days: DAYS, endReason: result.endReason, gameDays: result.gameDays,
      raidGossipEvents: raidDays.length, raidDays,
      departures: departures.length, guardDepartures: guardDeps.length,
      guardAfterRaid: rallyGuardDeps.length, rallyGoalGuardAfterRaid: rallyGoalGuardDeps.length,
      rallyAsks: rallyAsks.length, rallyAskPicked: rallyAsks.filter(a => a.picked).length,
      guardAfterRaidRows: rallyGuardDeps, rallyAskRows: rallyAsks };
    fs.writeFileSync(path.join(EVIDIR, `seed-${seed}.json`), JSON.stringify(out, null, 1));
    console.log(`SEED ${seed} end=${result.endReason} gameDays=${result.gameDays} raids=${raidDays.length} guards=${guardDeps.length} guardAfterRaid=${rallyGuardDeps.length} rallyGoalGuardAfterRaid=${rallyGoalGuardDeps.length} rallyAsks=${rallyAsks.length} picked=${rallyAsks.filter(a => a.picked).length}`);
  }
})().catch(e => { console.error('RALLY PANEL FAIL', e && e.stack || e); process.exit(1); });
