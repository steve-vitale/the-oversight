#!/usr/bin/env node
// bloodrestraint-e2e.js — child worker for test-bloodrestraint.js.
// Loads the real Game via sim-harness ONCE per process (never two
// harnesses in one node process), injects a synthetic village +
// waveKillLog, forces Game.playerDeath, and prints the outcome as JSON.
// Usage: BLOODRESTRAINT=1 POLICY=lead node scripts/bloodrestraint-e2e.js <case>
// Cases: topblooded | allblooded | lapsed | wave3 | base (no blood)
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

async function main() {
  const which = process.argv[2] || 'base';
  const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 65511, mode: 'bloodrestraint-e2e', fullTelemetry: false });
  await setupGame(Game);

  const v = Game.state.village;
  const roster = (v.roster || []).slice();
  if (roster.length < 4) { console.log(JSON.stringify({ error: 'roster-too-small' })); return; }
  const scholarId = roster[0];
  const [a, b, c] = [roster[1], roster[2], roster[3]];
  Game.villagerId = scholarId;
  try { Game.state.scholar.villagerId = scholarId; } catch (e) {}
  v.trust = {};
  v.trust[a] = 90; v.trust[b] = 70; v.trust[c] = 50; v.trust[scholarId] = 10;
  Game.state.scholar.day = 100;

  const now = 100;
  const kill = (by, d, w) => ({ d, mid: 'the-influencer', w, by, via: 'test', trick: null });
  if (which === 'topblooded') Game.state.waveKillLog = [kill(a, now - 5, 4)];
  else if (which === 'allblooded') {
    // Blood EVERY candidate (the whole roster minus the scholar) so the
    // open list is empty -> the fallback must pick.
    const everyone = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    Game.state.waveKillLog = everyone.map((id, i) => kill(id, now - 1 - i, 4));
  }
  else if (which === 'lapsed') Game.state.waveKillLog = [kill(a, now - 20, 4)];
  else if (which === 'wave3') Game.state.waveKillLog = [kill(a, now - 5, 3)];
  else Game.state.waveKillLog = [];

  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (s) => { said.push(String(s)); return origSay(s); };

  // Diagnostics for the restraint decision (stderr, never swallowed by the JSON).
  if (process.env.BRDIAG === '1') {
    try {
      const cands = Game.npcIds().slice().sort((x, y) => ((v.trust[y] || 0) - (v.trust[x] || 0)));
      const held = (typeof Game.bloodrestraintBlooded === 'function') ? Game.bloodrestraintBlooded(100) : new Set(['no-method']);
      console.error('BRDIAG cands=' + JSON.stringify(cands.slice(0, 6)) + ' held=' + JSON.stringify([...held]) + ' env=' + process.env.BLOODRESTRAINT);
    } catch (e) { console.error('BRDIAG failed: ' + String(e && e.message)); }
  }

  let error = null;
  await quietLog(async () => {
    try { Game.playerDeath('the test wild'); } catch (e) { error = String((e && e.stack) || e).slice(0, 500); }
  });

  const heldBeat = said.some(s => s.indexOf('Not the office') !== -1);
  console.log(JSON.stringify({
    successor: Game.villagerId, a, b, c,
    heldBeat, saidCount: said.length, error,
    saidTail: said.slice(-4),
    beatLine: said.find(s => s.indexOf('Not the office') !== -1) || null,
  }));
}
main().catch(e => { console.log(JSON.stringify({ error: String((e && e.stack) || e).slice(0, 500) })); });
