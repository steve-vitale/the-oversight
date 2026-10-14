#!/usr/bin/env node
// DIAG (harnessstop arm, 2026-10-14): reproduce the seed-505 leadcourt
// dead-village grind with per-phase timing + state-size telemetry, so the
// fixed stop condition targets the real cost driver.
// Mirrors runDays' day loop exactly (3 part-waits, upkeep/daily, sleep,
// driveFights/driveContests) but instruments each phase.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '505', 10);
const MAXDAYS = parseInt(process.env.MAXDAYS || '90', 10);
const LOG = process.env.LOG || '/tmp/diag505.log';

const log = (s) => { fs.appendFileSync(LOG, s + '\n'); };

function stateSizes(Game) {
  const v = Game.state.village || {};
  const s = Game.state.scholar || {};
  try {
    return {
      roster: (v.roster || []).length,
      pantryItems: (v.pantry || []).length,
      corpses: ((Game.corpses && Game.corpses()) || []).length,
      tele: ((Game.state || {}).telemetry || []).length,
      exiles: (v.exiles || []).length,
      fallen: (v.fallen || []).length,
      gossip: Object.keys(v.gossip || {}).length,
      deadInRoster: (v.roster || []).filter(id => {
        try { return !!((Game.getPerson(id) || {}).dead); } catch (e) { return false; }
      }).length,
      scholarDay: s.day || 0,
      over: !!Game.over, villageLost: !!Game.villageLost,
      scatter: !!v.scattered,
    };
  } catch (e) { return { err: e.message }; }
}

async function main() {
  fs.writeFileSync(LOG, '');
  const { Game } = await loadGame({ seed: SEED, mode: 'diag505' });
  await setupGame(Game);
  const { leadcourt } = require('./policies/leadcourt');
  const policy = Object.assign({}, leadcourt);
  const ctx = { policyId: policy.id, notes: [] };
  const withOrigin = (o, fn) => { ctx._verbOrigin = o; try { return fn(); } finally { ctx._verbOrigin = null; } };
  ctx._pacingBump = () => {};
  ctx._withOrigin = withOrigin;

  for (let day = 1; day <= MAXDAYS; day++) {
    const tDay = Date.now();
    const phase = {};
    const t = (name, fn) => { const a = Date.now(); fn(); phase[name] = Date.now() - a; };
    for (let p = 0; p < 3; p++) {
      t('upkeep', () => { if (policy.upkeep) { try { withOrigin('policy', () => policy.upkeep(Game, ctx)); } catch (e) {} } });
      t('driveF', () => driveFights(Game, policy, ctx));
      t('driveC', () => driveContests(Game, policy, ctx));
      if (Game.over) break;
      t('wait', () => { try { withOrigin('driver', () => Game.doAction('wait')); } catch (e) {} });
      t('driveF2', () => driveFights(Game, policy, ctx));
      t('driveC2', () => driveContests(Game, policy, ctx));
      if (Game.over) break;
    }
    if (Game.over) { log(`loopDay=${day} GAME OVER — breaking`); break; }
    t('daily', () => { if (policy.daily) { try { withOrigin('policy', () => policy.daily(Game, ctx)); } catch (e) {} } });
    t('sleep', () => { try { Game.sleep(); } catch (e) { phase.sleepErr = e.message; } });
    t('driveC3', () => driveContests(Game, policy, ctx));
    if (Game.over) { log(`loopDay=${day} GAME OVER (post-sleep) — breaking`); break; }
    const dt = Date.now() - tDay;
    const sz = stateSizes(Game);
    if (dt > 3000 || day % 10 === 0 || day <= 15) {
      log(`loopDay=${day} sday=${sz.scholarDay} ms=${dt} phases=${JSON.stringify(phase)} sizes=${JSON.stringify(sz)}`);
    }
    if (dt > 120000) { log(`STALL: loopDay ${day} took ${dt}ms — aborting diag`); break; }
  }
  log('diag done');
}
main().catch(e => { log('FATAL ' + e.stack); process.exit(1); });
