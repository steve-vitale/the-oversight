#!/usr/bin/env node
// investigate-arrivals-20261029.js — 0-arrivals INVESTIGATION (build-map).
// Why did establishment runs r44–r52 show 0 arrivals, and what would a
// perceivable approach look like? No game code is changed by this script.
// ARM A (default): read-only wraps — counters only, no state mutation,
// no RNG consumption. ARM B (ACCEPT_ONE=1): separate process; accepts the
// first pending application once per seed to prove the accept->arrive chain.
// Day loop mirrors the r52 establishment driver (competent policy: upkeep,
// driveFights, driveContests, wait x3 parts, daily, sleep).
// Usage: SEEDS=209,228,238,239 DAYS=60 node scripts/investigate-arrivals-20261029.js
//        ACCEPT_ONE=1 SEEDS=209 node scripts/investigate-arrivals-20261029.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-29';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [209, 228, 238, 239]);
const DAYS = parseInt(process.env.DAYS || '60', 10);
const ACCEPT_ONE = process.env.ACCEPT_ONE === '1';

const _warned = {};
function warnOnce(key, e) { if (!_warned[key]) { _warned[key] = true; console.warn('[arr:' + key + ']', (e && e.message) || e); } }
function nowDay(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function livingVids(Game) {
  try { return (Game.state.village.roster || []).filter(id => { try { const vp = Game.vpOf ? Game.vpOf(id) : null; return !(vp && vp.dead); } catch (e) { return true; } }); }
  catch (e) { return []; }
}
function mship(Game) { try { return Game.mshipState ? Game.mshipState() : {}; } catch (e) { return {}; } }

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('policy.setup', e); } }

  const counts = {
    considerApplications: 0, genApplicant: 0, acceptApplication: 0,
    villageAutoRecruit: 0, autoRecruitRosterLt8: 0, autoRecruitIntakes: 0,
    arrivalTick: 0, arrivalTickCompletions: 0,
    considerStrangers: 0, strangersSpawned: 0, visitorInteract: 0, visitorInvites: 0,
  };
  const daily = [];
  const accepted = [];
  let acceptedOnce = false;

  function wrap(name, fn) {
    const orig = (typeof Game[name] === 'function') ? Game[name].bind(Game) : null;
    if (!orig) { warnOnce('nowrap-' + name, 'missing'); return; }
    Game[name] = function (...args) {
      // Pre-call snapshots (read-only).
      const preInbox = (mship(Game).applications || []).length;
      const prePend = (mship(Game).arrivals || []).length;
      const preVis = ((Game.state.village || {}).visitors || []).length;
      const preRoster = (Game.state.village.roster || []).length;
      const r = orig(...args);
      if (name === 'considerApplications') counts.considerApplications++;
      if (name === 'genApplicant') counts.genApplicant++;
      if (name === 'acceptApplication') {
        counts.acceptApplication++;
        accepted.push({ day: nowDay(Game), appId: args[0] });
      }
      if (name === 'villageAutoRecruit') {
        counts.villageAutoRecruit++;
        if (preRoster < 8) counts.autoRecruitRosterLt8++;
        const postPend = (mship(Game).arrivals || []).length;
        if (postPend > prePend) counts.autoRecruitIntakes++;
      }
      if (name === 'arrivalTick') {
        counts.arrivalTick++;
        const postPend = (mship(Game).arrivals || []).length;
        if (prePend > postPend) counts.arrivalTickCompletions += (prePend - postPend);
      }
      if (name === 'considerStrangers') {
        counts.considerStrangers++;
        const postVis = ((Game.state.village || {}).visitors || []).length;
        if (postVis > preVis) counts.strangersSpawned++;
      }
      if (name === 'visitorInteract') {
        counts.visitorInteract++;
        if (args[1] === 'invite') counts.visitorInvites++;
      }
      return r;
    };
  }
  for (const n of ['considerApplications', 'genApplicant', 'acceptApplication',
    'villageAutoRecruit', 'arrivalTick', 'considerStrangers', 'visitorInteract']) wrap(n);

  const startRoster = (Game.state.village.roster || []).length;
  let minRoster = startRoster, everInbox = 0, everPending = 0;
  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('doAction', e); }
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    // Counterfactual arm: accept the FIRST pending application, once.
    if (ACCEPT_ONE && !acceptedOnce) {
      try {
        const apps = mship(Game).applications || [];
        if (apps.length) {
          const app = apps[0];
          const ok = Game.acceptApplication(app.id);
          acceptedOnce = true;
          const pend = (mship(Game).arrivals || []).find(a => a.id === app.id);
          accepted.push({ day: nowDay(Game), appId: app.id, name: app.name, acceptedOk: !!ok, arriveDay: pend ? pend.arriveDay : null, counterfactual: true });
        }
      } catch (e) { warnOnce('counterfactual', e); }
    }
    const snap = {
      day: nowDay(Game), roster: (Game.state.village.roster || []).length,
      living: livingVids(Game).length,
      inbox: (mship(Game).applications || []).length,
      pending: (mship(Game).arrivals || []).length,
      visitors: ((Game.state.village || {}).visitors || []).length,
      notability: (() => { try { return Game.villageNotability ? Game.villageNotability() : null; } catch (e) { return null; } })(),
      room: (() => { try { return Game.growthStatus ? Game.growthStatus().room : null; } catch (e) { return null; } })(),
    };
    if (snap.roster < minRoster) minRoster = snap.roster;
    if (snap.inbox > everInbox) everInbox = snap.inbox;
    if (snap.pending > everPending) everPending = snap.pending;
    daily.push(snap);
    if (Game.over) break;
  }

  // Counterfactual check: did the accepted applicant reach the roster?
  let counterfactualJoined = null;
  if (ACCEPT_ONE && accepted.length) {
    const a = accepted.find(x => x.counterfactual);
    if (a) {
      const onRoster = ((Game.state.village.roster || []).indexOf(a.appId) >= 0) ||
        ((Game.state.village.roster || []).indexOf(a.appId) >= 0);
      // acceptApplication stores charId; roster id is charId || app id.
      const pend = null;
      counterfactualJoined = {
        appId: a.appId, name: a.name, acceptedDay: a.day, arriveDay: a.arriveDay,
        endDay: nowDay(Game), onRosterByAppId: onRoster,
        rosterLen: (Game.state.village.roster || []).length,
      };
      // Resolve via arrivals-pending + roster growth: if pending cleared and
      // roster grew after accept, arrivalTick completed it (checked in report).
    }
  }
  const rosterIds = (Game.state.village.roster || []).slice();
  const out = {
    seed, arm: ACCEPT_ONE ? 'counterfactual' : 'readonly', days: DAYS,
    endDay: nowDay(Game), gameOver: !!Game.over,
    startRoster, endRoster: (Game.state.village.roster || []).length,
    minRoster, endLiving: livingVids(Game).length,
    everInbox, everPending, counts, accepted,
    counterfactualJoined, rosterIds, daily,
  };
  console.log(`seed ${seed} [${out.arm}]: endDay=${out.endDay} over=${out.gameOver} ` +
    `roster ${startRoster}->${out.endRoster} (min ${minRoster}) living=${out.endLiving} ` +
    `everInbox=${everInbox} everPending=${everPending} ` +
    `accept=${counts.acceptApplication} autoRecruit=${counts.villageAutoRecruit} (rosterLt8=${counts.autoRecruitRosterLt8}, intakes=${counts.autoRecruitIntakes}) ` +
    `arrivalCompletions=${counts.arrivalTickCompletions} strangers=${counts.strangersSpawned} invites=${counts.visitorInvites}`);
  return out;
}

(async () => {
  const results = [];
  for (const s of SEEDS) results.push(await runSeed(s));
  fs.mkdirSync(EVID, { recursive: true });
  const tag = ACCEPT_ONE ? 'counterfactual' : 'readonly';
  const outPath = path.join(EVID, `build-map-arrivals-${tag}-20261029.json`);
  fs.writeFileSync(outPath, JSON.stringify({ seeds: SEEDS, days: DAYS, arm: tag, results }, null, 2));
  console.log('wrote ' + outPath);
})().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
