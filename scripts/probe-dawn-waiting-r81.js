#!/usr/bin/env node
// r81 diagnostic probe: WHY do the joint-favor waiting predicates never
// read true in live play? Replays one seed with the competent policy and,
// after each sleep (dawn), dumps the full favor + promise objects for
// every joint-favor ledger entry plus the predicate verdicts.
// Usage: SEED=962 DAYS=10 node scripts/probe-dawn-waiting-r81.js
'use strict';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEED = parseInt(process.env.SEED || '962', 10);
const DAYS = parseInt(process.env.DAYS || '10', 10);
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const ctx = { policyId: competent.id, notes: [] };
  if (competent.setup) { try { await competent.setup(Game, ctx); } catch (e) {} }
  let promisedSightings = 0, promiseSightings = 0, askedSightings = 0;
  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (competent.upkeep) { try { competent.upkeep(Game, ctx); } catch (e) {} }
      try { driveFights(Game, competent, ctx); } catch (e) {}
      try { driveContests(Game, competent, ctx); } catch (e) {}
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) {}
      try { driveFights(Game, competent, ctx); } catch (e) {}
      try { driveContests(Game, competent, ctx); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) break;
    if (competent.daily) { try { competent.daily(Game, ctx); } catch (e) {} }
    try { Game.sleep(); } catch (e) {}
    const v = Game.state.village || {};
    const rows = [];
    for (const vid of (v.roster || [])) {
      const f = (v.favorLedger || {})[vid];
      if (!f || (f.kind !== 'forage_help' && f.kind !== 'water_haul')) continue;
      const pr = (v.promises || {})[vid] || null;
      let waiting = null;
      try { waiting = f.kind === 'forage_help' ? !!Game.forageFavorWaiting?.(vid) : !!Game.waterFavorWaiting?.(vid); } catch (e) { waiting = 'ERR:' + e.message; }
      let due = null; try { due = Game.promiseDueDay ? Game.promiseDueDay(pr) : null; } catch (e) {}
      if (f.state === 'promised') promisedSightings++;
      if (pr) promiseSightings++;
      if (f.state === 'asked') askedSightings++;
      rows.push({ vid: String(vid), dayPart: Game.dayPart, playerAtHaven: (() => { try { return Game.playerAtHaven(); } catch (e) { return 'ERR'; } })(),
        bearer: Game.villagerId, favor: { id: f.id, kind: f.kind, state: f.state, meetDay: f.meetDay ?? null, promisedDay: f.promisedDay ?? null, askedDay: f.askedDay ?? null, deadline: f.deadline ?? null, hasRun: !!(f.forageRun || f.waterRun) },
        promise: pr ? { favorId: pr.favorId, kept: !!pr.kept, maker: pr.maker, due } : null,
        nodePos: (v.nodePos || {})[vid] || null, away: !!(v.away || {})[vid], waiting });
    }
    console.log(`DAWN day=${nowDay(Game)} dayPart=${Game.dayPart} rows=${JSON.stringify(rows)}`);
  }
  console.log(`SUMMARY seed=${SEED} promisedStateSightings=${promisedSightings} promisePresentSightings=${promiseSightings} askedStateSightings=${askedSightings}`);
})().catch(e => { console.error(e); process.exit(1); });
