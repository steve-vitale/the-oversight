#!/usr/bin/env node
// probe-trauma-20261012.js — trauma distribution & consequence measurement.
// 24 seeds x 200 days, competent policy. Records per player life:
//   dawn trauma samples, trauma max, nights eligible for nightmare (pre-sleep
//   trauma >= 30), nightmares fired (pre>=30 & drop==5), keepsake channel uses,
//   payRespects uses, whether the life ended in death (mantle change) and the
//   death cause bucket. Also captures nightmare/witness say lines for
//   SENSE-TESTING transcript review.
// Usage: SEEDS="1..24" DAYS=200 OUT=/tmp/trauma-baseline.json node scripts/probe-trauma-20261012.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

(async () => {
  const seeds = parseList('SEEDS', Array.from({ length: 24 }, (_, i) => String(i + 1)).join(',')).map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;
  const runs = [];

  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent', fullTelemetry: true });
    await setupGame(Game);

    const lives = [];
    let cur = null;
    const sleepStats = { nights: 0, eligible: 0, nightmares: 0, otherDrops: {}, nightmareTraumaAtFire: [] };
    let channels = 0, respects = 0;
    const said = [];

    // say capture: wrap AFTER harness silenced it
    const origSay = Game.say.bind(Game);
    Game.say = (line, ...rest) => {
      const l = String(line || '');
      if (/nightmare|dream|shaking|haunt|Hold it|steady yourself|breathe/i.test(l)) {
        said.push({ day: (Game.state.scholar || {}).day, line: l.slice(0, 220) });
      }
      return origSay(line, ...rest);
    };

    // sleep wrap: exact nightmare accounting (pre>=30 & drop==5 == nightmare)
    const origSleep = Game.sleep.bind(Game);
    Game.sleep = function (...a) {
      const s = Game.state.scholar || {};
      const pre = s.trauma || 0;
      const vidPre = Game.villagerId;
      sleepStats.nights++;
      if (pre >= 30) sleepStats.eligible++;
      const r = origSleep(...a);
      const s2 = Game.state.scholar || {};
      const post = s2.trauma || 0;
      const vidPost = Game.villagerId;
      const drop = pre - post;
      if (vidPost !== vidPre) { sleepStats.mantleAtSleep = (sleepStats.mantleAtSleep || 0) + 1; }
      if (pre >= 30 && drop === 5 && vidPost === vidPre) {
        sleepStats.nightmares++;
        sleepStats.nightmareTraumaAtFire.push(pre);
      } else if (drop > 0) {
        sleepStats.otherDrops[drop] = (sleepStats.otherDrops[drop] || 0) + 1;
      }
      return r;
    };

    // channel / respects counters
    if (Game.channelSentiment) {
      const oc = Game.channelSentiment.bind(Game);
      Game.channelSentiment = (idx) => { const r = oc(idx); channels++; return r; };
    }
    if (Game.payRespects) {
      const opr = Game.payRespects.bind(Game);
      Game.payRespects = (id) => { const r = opr(id); if (r) respects++; return r; };
    }

    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    const openLife = (vid) => {
      cur = { vid, day0: (Game.state.scholar || {}).day, dawns: [], nights30: 0, nightmares: 0, died: false, lastDawnTrauma: 0 };
      lives.push(cur);
    };
    policy.daily = (G, ctx) => {
      try {
        const s = G.state.scholar || {};
        const vid = G.villagerId;
        if (!cur || cur.vid !== vid) {
          if (cur) cur.died = true; // mantle passed = previous life ended in death
          openLife(vid);
        }
        cur.dawns.push(s.trauma || 0);
        cur.lastDawnTrauma = s.trauma || 0;
        cur.lastDay = s.day;
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };

    const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
    const tele = result.telemetry || [];

    // close final life
    if (cur) cur.died = (result.endReason !== 'survived');

    // per-life aggregates
    for (const L of lives) {
      const d = L.dawns;
      L.samples = d.length;
      L.traumaMax = d.length ? Math.max.apply(null, d) : 0;
      L.traumaMean = d.length ? +(d.reduce((a, b) => a + b, 0) / d.length).toFixed(1) : 0;
      L.daysAt30 = d.filter(t => t >= 30).length;
      L.daysAt50 = d.filter(t => t >= 50).length;
    }

    // death causes correlated with trauma: match telemetry death events to lives
    // by villager id (day matching is unreliable across mantle bookkeeping)
    const deaths = tele.filter(ev => ev.type === 'death' && (ev.kind || '') !== 'monster');
    for (const L of lives) {
      if (!L.died) { L.deathCause = null; continue; }
      // village-lost run-ends: the final life never gets a death event —
      // label it honestly instead of 'unknown'.
      if (L === cur && result.endReason === 'village-lost') { L.deathCause = 'village-lost(run-end)'; continue; }
      const cand = deaths.filter(e => e.who === L.vid);
      const pick = cand.length ? cand[cand.length - 1] : deaths.filter(e => e.day === L.lastDay).slice(-1)[0];
      L.deathCause = pick ? String(pick.cause || '?') : 'unknown';
    }

    runs.push({
      seed, days: result.days, endReason: result.endReason,
      lives: lives.map(L => ({ days: L.samples, traumaMax: L.traumaMax, traumaMean: L.traumaMean, daysAt30: L.daysAt30, daysAt50: L.daysAt50, died: L.died, deathCause: L.deathCause, lastDawnTrauma: L.lastDawnTrauma })),
      lifeCount: lives.length,
      sleepStats, channels, respects, said: said.slice(0, 40),
    });
    console.log(`done seed=${seed} days=${result.days} end=${result.endReason} lives=${lives.length} nightmares=${sleepStats.nightmares}/${sleepStats.eligible} channels=${channels} respects=${respects}`);
  }

  // aggregate
  const allLives = runs.flatMap(r => r.lives.map(L => ({ ...L, seed: r.seed })));
  const dead = allLives.filter(L => L.died);
  const surv = allLives.filter(L => !L.died);
  const hist = (arr, f) => { const o = {}; for (const x of arr) { const k = f(x); o[k] = (o[k] || 0) + 1; } return o; };
  const agg = {
    n: runs.length,
    totalLives: allLives.length,
    deadLives: dead.length, survLives: surv.length,
    deadTraumaMaxHist: hist(dead, L => L.traumaMax >= 50 ? '50+' : L.traumaMax >= 30 ? '30-49' : L.traumaMax >= 8 ? '8-29' : '0-7'),
    survTraumaMaxHist: hist(surv, L => L.traumaMax >= 50 ? '50+' : L.traumaMax >= 30 ? '30-49' : L.traumaMax >= 8 ? '8-29' : '0-7'),
    deadMeanOfMeans: dead.length ? +(dead.reduce((a, L) => a + L.traumaMean, 0) / dead.length).toFixed(1) : 0,
    survMeanOfMeans: surv.length ? +(surv.reduce((a, L) => a + L.traumaMean, 0) / surv.length).toFixed(1) : 0,
    deadDaysAt30: dead.reduce((a, L) => a + L.daysAt30, 0),
    survDaysAt30: surv.reduce((a, L) => a + L.daysAt30, 0),
    deadDeathCauses: hist(dead, L => L.deathCause || 'unknown'),
    nights: runs.reduce((a, r) => a + r.sleepStats.nights, 0),
    eligibleNights: runs.reduce((a, r) => a + r.sleepStats.eligible, 0),
    nightmares: runs.reduce((a, r) => a + r.sleepStats.nightmares, 0),
    nightmareFireRate: 0,
    meanNightmareTrauma: 0,
    otherDrops: {},
    channels: runs.reduce((a, r) => a + r.channels, 0),
    respects: runs.reduce((a, r) => a + r.respects, 0),
  };
  const fires = [];
  for (const r of runs) {
    for (const k of Object.keys(r.sleepStats.otherDrops)) agg.otherDrops[k] = (agg.otherDrops[k] || 0) + r.sleepStats.otherDrops[k];
    fires.push(...r.sleepStats.nightmareTraumaAtFire);
  }
  agg.nightmareFireRate = agg.eligibleNights ? +(agg.nightmares / agg.eligibleNights).toFixed(3) : 0;
  agg.meanNightmareTrauma = fires.length ? +(fires.reduce((a, b) => a + b, 0) / fires.length).toFixed(1) : 0;

  console.log('\n=== TRAUMA AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: '2026-10-12', lever: 'trauma-baseline' }, agg, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
