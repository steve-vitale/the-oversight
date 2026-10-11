#!/usr/bin/env node
// sweep-contest-fear.js — CONTEST-FEAR lever measurement.
// Before/after on IDENTICAL seeds: per-contest id/cat/risk/variant/outcome,
// player HP + trauma before/after each contest, contest deaths (villager +
// player), refusal rate, fan/shame deltas on shows.
// Usage: SEEDS="424242,777001" DAYS=200 OUT=/tmp/fear-before.json node scripts/sweep-contest-fear.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const seeds = (process.env.SEEDS || '424242,777001,999983,20261011,7,12345,31337,8675309').split(',').map(Number);
const days = parseInt(process.env.DAYS || '200', 10);
const outFile = process.env.OUT || null;
const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const hpOf = (Game) => { try { return Math.round(Game.state.scholar.health || 0); } catch (e) { return 0; } };
const trOf = (Game) => { try { return Math.round(Game.state.scholar.trauma || 0); } catch (e) { return 0; } };

function installHooks(Game, rec) {
  rec.contests = []; rec.deaths = []; rec.refusals = 0;
  rec._pre = null;
  const wrap = (name, fn) => {
    const orig = Game[name];
    if (typeof orig !== 'function') { (rec.wrapFails = rec.wrapFails || []).push(name); return; }
    Game[name] = function(...a) { try { fn.apply(null, [this, ...a]); } catch (e) {} return orig.apply(this, a); };
  };
  // Capture the fired contest with full metadata; snapshot player state pre-contest.
  const origFire = Game.fireContest.bind(Game);
  Game.fireContest = function(event) {
    try {
      rec._pre = { day: dayOf(this), id: (event && event.id) || '?', cat: (event && event.cat) || '?',
        risk: (event && event.risk) || '?', variant: (event && event.variant) || null,
        hp: hpOf(this), trauma: trOf(this) };
    } catch (e) {}
    return origFire(event);
  };
  wrap('_contestEnd', (G, ac, outcome, prize) => {
    const pre = rec._pre || {};
    rec.contests.push({ day: pre.day != null ? pre.day : dayOf(G), id: (ac && ac.contestId) || pre.id || '?',
      cat: pre.cat || '?', risk: pre.risk || '?', variant: pre.variant || null,
      outcome: outcome || '?', hpBefore: pre.hp, hpAfter: hpOf(G),
      traumaBefore: pre.trauma, traumaAfter: trOf(G), prize: !!prize });
    rec._pre = null;
  });
  wrap('_contestDie', (G, ac, how) => {
    rec.deaths.push({ day: dayOf(G), who: 'player', contest: (ac && ac.contestId) || '?', how: String(how).slice(0, 80) });
    rec._pre = null;
  });
  wrap('_cxKillContestant', (G, pid) => {
    rec.deaths.push({ day: dayOf(G), who: String(pid), contest: (rec._pre && rec._pre.id) || '?' });
  });
  wrap('_contestRefuse', (G, ac) => { rec.refusals++; rec._pre = null; });
  // Show shame/fans outcomes for the social-stakes read.
  wrap('_showEnd', (G, ac, outcome) => {
    rec.shows = rec.shows || [];
    rec.shows.push({ day: dayOf(G), id: (ac && ac.showId) || '?', outcome: outcome || '?' });
  });
}

(async () => {
  const runs = [];
  for (const seed of seeds) {
    const rec = { seed, contests: [], deaths: [], refusals: 0, shows: [] };
    const { Game } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
    installHooks(Game, rec);
    await setupGame(Game);
    const result = await runDays(Game, Object.assign({}, competent), { days, sampleEvery: 10 });
    rec.days = result.days; rec.endReason = result.endReason;
    runs.push(rec);
    console.log(`seed ${seed}: ${rec.contests.length} contests, ${rec.deaths.length} deaths, ${rec.refusals} refusals, end ${result.endReason} d${result.days}`);
  }
  // Aggregate
  const agg = { seeds: seeds.length, days,
    contests: runs.reduce((a, r) => a + r.contests.length, 0),
    deaths: runs.reduce((a, r) => a + r.deaths.length, 0),
    refusals: runs.reduce((a, r) => a + r.refusals, 0),
    byCat: {}, byRisk: {}, outcomes: {},
    hpLost: [], traumaGained: [],
  };
  for (const r of runs) for (const c of r.contests) {
    agg.byCat[c.cat] = agg.byCat[c.cat] || { n: 0, won: 0, deaths: 0 };
    agg.byCat[c.cat].n++; if (c.outcome === 'won') agg.byCat[c.cat].won++;
    agg.byRisk[c.risk] = agg.byRisk[c.risk] || { n: 0, won: 0 };
    agg.byRisk[c.risk].n++; if (c.outcome === 'won') agg.byRisk[c.risk].won++;
    agg.outcomes[c.outcome] = (agg.outcomes[c.outcome] || 0) + 1;
    if (c.hpBefore != null && c.hpAfter != null) agg.hpLost.push(c.hpBefore - c.hpAfter);
    if (c.traumaBefore != null && c.traumaAfter != null) agg.traumaGained.push(c.traumaAfter - c.traumaBefore);
  }
  const avg = (a) => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : 'n/a';
  agg.avgHpLostPerContest = avg(agg.hpLost);
  agg.avgTraumaGainedPerContest = avg(agg.traumaGained);
  agg.winRate = agg.contests ? (agg.outcomes.won || 0) / agg.contests : 0;
  console.log(JSON.stringify(agg, null, 1));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify({ agg, runs }, null, 1));
  console.log('wrote', outFile || '(no OUT)');
})();
