// meal-probe-20261110.js — instrument the nightly meal per villager.
// Usage: node evidence/2026-11-10/meal-probe-20261110.js <repoRoot> <outRowsJson>
// Runs seed 84101, 30d, competent — the person-trust pin conditions — and
// wraps villagerMealDay, recording per call: day, vid, hunger before/after,
// ate, drawn, gave, fasting, away. Prints one JSON summary line.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2];
const OUT = process.argv[3];
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));

(async () => {
  const { Game } = await loadGame({ seed: 84101, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const rows = [];
  const orig = Game.villagerMealDay;
  Game.villagerMealDay = function (vid, person, v, ctx) {
    let hb = null;
    try { hb = (Game.npcNeeds(vid).hunger || 0); } catch (e) {}
    const away = !!((v.away || {})[vid]);
    const day = (Game.state.scholar && Game.state.scholar.day) || 0;
    const r = orig.apply(this, arguments);
    let ha = null;
    try { ha = (Game.npcNeeds(vid).hunger || 0); } catch (e) {}
    rows.push({ day, vid, hungerBefore: hb, hungerAfter: ha, ate: r && r.ate, drawn: r && r.drawn, gave: r && r.gave, fasting: !!(r && r.fasting), away });
    return r;
  };
  const policy = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  await runDays(Game, policy, { days: 30, quiet: true });

  const mean = a => a.length ? +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(1) : null;
  const byVid = {};
  for (const r of rows) {
    const b = (byVid[r.vid] = byVid[r.vid] || { n: 0, ate: [], fast: 0, afterHi: 0, after: [] });
    b.n++; b.ate.push(r.ate || 0); if (r.fasting) b.fast++; if ((r.hungerAfter || 0) > 55) b.afterHi++; b.after.push(r.hungerAfter || 0);
  }
  const perVid = {};
  for (const v of Object.keys(byVid)) {
    const b = byVid[v];
    perVid[v] = { meals: b.n, meanAte: mean(b.ate), fastingDays: b.fast, afterHiDays: b.afterHi, meanAfter: mean(b.after) };
  }
  const early = rows.filter(r => r.day <= 10), late = rows.filter(r => r.day > 10);
  const summary = {
    repo: REPO,
    mealCalls: rows.length,
    meanAte: mean(rows.map(r => r.ate || 0)),
    fastingCalls: rows.filter(r => r.fasting).length,
    afterHi: rows.filter(r => (r.hungerAfter || 0) > 55).length,
    earlyAfterHi: early.filter(r => (r.hungerAfter || 0) > 55).length + '/' + early.length,
    lateAfterHi: late.filter(r => (r.hungerAfter || 0) > 55).length + '/' + late.length,
    lateMeanAte: mean(late.map(r => r.ate || 0)),
    earlyMeanAte: mean(early.map(r => r.ate || 0)),
    perVid,
  };
  fs.writeFileSync(OUT, JSON.stringify(rows));
  console.log('MEAL ' + JSON.stringify(summary));
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
