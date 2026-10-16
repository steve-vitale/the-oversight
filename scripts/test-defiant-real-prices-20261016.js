#!/usr/bin/env node
// test-defiant-real-prices-20261016.js — PROOF (journey-endgame r14):
// the Defiant reverse-auction prices are REAL, not meter theater.
// Before the fix: beat:harvest left the pantry untouched and beat:name left
// the named villager on the roster (only T.meters moved). After: 20,000 kcal
// leaves the shelves and the relay's person leaves the village.
// TOOLING ONLY — no game balance changes.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'defiant-prices-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  // Known pantry: 30 x 1000-kcal units.
  v.pantry = [{ name: 'smoked turkey', kcalEach: 1000, units: 30, kg: 0.5 }];
  v.pantryKcal = 30000;
  const rosterBefore = (v.roster || []).slice();
  // Fake a defiant walk at beat 0 (no Long Road — the full price must land).
  const T = Game.tableState();
  Object.assign(T, { path: 'defiant', beat: 0, branch: 'light', meters: {}, abils: [] });

  // PRICE ONE: a full harvest.
  Game.tableChoose('beat:harvest');
  const kcalAfter = (v.pantry || []).reduce((t, i) => t + ((i.kcalEach || 0) * (i.units || 0)), 0);

  // PRICE TWO: name the relay's person (highest-trust villager).
  const trust = v.trust || {};
  const rpId = Object.keys(trust).filter(id => id && id !== Game.villagerId)
    .sort((a, b) => ((trust[b] | 0) - (trust[a] | 0)))[0];
  Game.tableChoose('beat:name');
  const rosterAfter = (v.roster || []).slice();
  const taken = Game.tableState().relayTaken;

  let fails = 0;
  const check = (name, cond, detail) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
    if (!cond) fails++;
  };
  check('harvest deducts 20000 real kcal', kcalAfter === 10000, `pantry ${kcalAfter} kcal (was 30000)`);
  check('named villager leaves the roster', !!rpId && !rosterAfter.includes(rpId),
    `named=${rpId} roster ${rosterBefore.length} -> ${rosterAfter.length}`);
  check('relayTaken recorded on the table', !!(taken && taken.id === rpId),
    JSON.stringify(taken));
  check('paid meters still accumulate', (Game.tableState().meters.paid | 0) >= 6,
    `paid=${Game.tableState().meters.paid | 0}`);
  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: ALL GREEN');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
