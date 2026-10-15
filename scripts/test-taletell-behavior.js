#!/usr/bin/env node
// scripts/test-taletell-behavior.js — killer's tale edge cases (finding #28).
//
// 1. Dead killer before nightfall -> the tale dies with them, no report.
// 2. Already-reported type -> no tale queued (the news is out).
// 3. Scholar's own kill -> no tale (their path is identifyMonster/tellbeast).
// 4. Two kills of the same type before night -> one tale, not two.
// 5. Parity: the converged name comes from the EXISTING proposal machinery
//    (seedMonsterNames/monsterNamingCheck), not a tale shortcut.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok -', name); }
  else { failed++; console.log('  FAIL -', name, extra || ''); }
}
function rosterOf(Game) {
  return (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
}
function toNight(Game) {
  let g = 0;
  while (Game.dayPart !== 3 && g++ < 8) Game.advancePart();
}
function runParts(Game, n) { for (let i = 0; i < n; i++) Game.advancePart(); }
// keepFed: the scholar never eats in this test, so an idle run starves around
// day 7 and the mantle passes to a villager who may already hold a proposal
// (then "the scholar" is in the proposals by succession, not by seeding).
// Whether the debate converged first was seed luck; pin the body instead.
function keepFed(Game) {
  const s = Game.state.scholar;
  s.kcal = Math.max(s.kcal || 0, 3000);
  s.hydration = Math.max(s.hydration || 0, 100);
  s.health = Math.max(s.health || 0, 100);
}

(async () => {
  console.log('== 1. dead killer: tale dies, no report ==');
  {
    const { Game } = await loadGame({ seed: 101, mode: 'taletell-dead', fullTelemetry: false });
    await setupGame(Game);
    const [killer] = rosterOf(Game);
    Game.recordWaveKill('belltoad', killer);
    check('tale queued', (Game.state.killerTales || []).length === 1);
    // the killer dies before nightfall
    Game.state.village.fallen = Game.state.village.fallen || [];
    Game.state.village.fallen.push({ villagerId: killer, day: 1, cause: 'test' });
    toNight(Game);
    const e = (Game.state.codex.monsters || {}).belltoad || {};
    check('no report from a dead teller', !e.reported);
    check('no transcript', !(Game.state.killerTaleLog || []).length);
  }

  console.log('== 2. already-reported type: no tale ==');
  {
    const { Game } = await loadGame({ seed: 102, mode: 'taletell-reported', fullTelemetry: false });
    await setupGame(Game);
    const [killer] = rosterOf(Game);
    Game.identifyMonster('belltoad'); // scholar's encounter: the news is out
    Game.recordWaveKill('belltoad', killer);
    check('no tale queued', !(Game.state.killerTales || []).length);
  }

  console.log('== 3. scholar kill: no tale ==');
  {
    const { Game } = await loadGame({ seed: 103, mode: 'taletell-scholar', fullTelemetry: false });
    await setupGame(Game);
    Game.recordWaveKill('belltoad', Game.villagerId);
    check('no tale queued', !(Game.state.killerTales || []).length);
  }

  console.log('== 4. two kills, one tale ==');
  {
    const { Game } = await loadGame({ seed: 104, mode: 'taletell-dupe', fullTelemetry: false });
    await setupGame(Game);
    const [k1, k2] = rosterOf(Game);
    Game.recordWaveKill('belltoad', k1);
    Game.recordWaveKill('belltoad', k2);
    check('single untold tale', (Game.state.killerTales || []).filter(t => !t.told).length === 1);
    toNight(Game);
    check('exactly one transcript', (Game.state.killerTaleLog || []).length === 1);
  }

  console.log('== 5. parity: convergence runs the existing machinery ==');
  {
    const { Game } = await loadGame({ seed: 105, mode: 'taletell-parity', fullTelemetry: false });
    await setupGame(Game);
    const scholarId = Game.villagerId;
    const [killer] = rosterOf(Game);
    Game.recordWaveKill('belltoad', killer);
    toNight(Game);
    const e = (Game.state.codex.monsters || {}).belltoad || {};
    check('killer is the first knower', (e.knowers || [])[0] === killer);
    let g = 0;
    while (!e.villageName && g++ < 300) { keepFed(Game); Game.advancePart(); }
    check('scholar survived the debate (no succession)', Game.villagerId === scholarId,
      `scholar ${scholarId} -> ${Game.villagerId}`);
    check('debate converged', !!e.villageName, 'no villageName after 300 parts');
    const proposals = Object.values(e.proposals || {});
    check('name came from villager proposals', proposals.includes(e.villageName),
      `villageName=${e.villageName} proposals=${JSON.stringify(proposals)}`);
    const rosterN = (Game.state.village.roster || []).length;
    check('proposals seeded from roster (not the scholar)', !Object.keys(e.proposals || {}).includes(Game.villagerId));
    console.log('   info: converged to', JSON.stringify(e.villageName), 'roster', rosterN);
  }

  console.log(`\n${pass} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(err => { console.error('HARNESS ERROR:', err && err.message); process.exit(2); });
