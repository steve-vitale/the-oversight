#!/usr/bin/env node
// scripts/test-vetkilltale-20261107.js — veteran-kill fireside tale
// (sim-vetkilltale-a, sim-findings.md line 1848: a wave-4 kill of an
// already-named beast gets no fireside telling at all).
//
// 1. Repeat wave-4 kill of a reported type -> vet tale queued, told at
//    night, names the beast AND the killer, logged, tele fired.
// 2. NEGATIVE: the vet tale does NOT re-run the naming debate —
//    reported / knowers / proposals / villageName byte-identical before
//    and after the tale.
// 3. Guard: a first-report kill still tells exactly once (first tale
//    only, no vet tale).
// 4. Wave gate: a wave-3 repeat kill queues nothing.
// 5. Scholar kill of a reported wave-4 type queues nothing.
// 6. Dead killer before nightfall -> vet tale moot, never told.
// 7. Two repeat kills, same type, same killer, before night -> one tale.
// 8. VETKILLTALE_OFF=1 -> nothing queued (baseline switch).
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
function snapEntry(Game, mid) {
  const e = (Game.state.codex.monsters || {})[mid] || {};
  return JSON.stringify({
    reported: !!e.reported, knowers: e.knowers || null,
    proposals: e.proposals || null, villageName: e.villageName || null,
    namingKicked: !!e.namingKicked,
  });
}
function captureTele(Game) {
  const events = [];
  if (typeof Game.tele === 'function') {
    const orig = Game.tele;
    Game.tele = function () {
      try { events.push(Array.from(arguments)); } catch (e) {}
      return orig.apply(this, arguments);
    };
  }
  return events;
}

(async () => {
  console.log('== 1. repeat wave-4 kill: vet tale fires, names beast + killer ==');
  {
    const { Game } = await loadGame({ seed: 201, mode: 'vetkilltale-repeat', fullTelemetry: false });
    await setupGame(Game);
    const teleEvents = captureTele(Game);
    const [killer] = rosterOf(Game);
    Game.identifyMonster('congregation'); // scholar's encounter: the news is out
    const e0 = (Game.state.codex.monsters || {}).congregation || {};
    check('type reported before the kill', !!e0.reported);
    Game.recordWaveKill('congregation', killer);
    check('vet tale queued', (Game.state.vetKillerTales || []).length === 1);
    check('no first tale queued', !(Game.state.killerTales || []).length);
    const before = snapEntry(Game, 'congregation');
    toNight(Game);
    const log = Game.state.vetKillerTaleLog || [];
    check('exactly one vet tale told', log.length === 1, JSON.stringify(log));
    const kName = Game.firstRef(killer) || '';
    const noun = Game.monsterDisplayName('congregation') || '';
    // prose capitalizes the noun as a sentence opener (_taleCap), so
    // match the capitalized form
    const nounCap = noun ? noun.charAt(0).toUpperCase() + noun.slice(1) : '';
    check('tale names the killer', log.length === 1 && log[0].indexOf(kName) !== -1,
      `killer=${kName} log=${log[0] || ''}`);
    check('tale names the beast', log.length === 1 && log[0].indexOf(nounCap) !== -1,
      `noun=${noun} log=${log[0] || ''}`);
    check('tale does not invite the naming debate', log.length === 1 && log[0].indexOf('what are we calling it') === -1);
    check('vet_killer_tale tele fired', teleEvents.some(a => a[0] === 'vet_killer_tale' && a[1] && a[1].id === 'congregation' && a[1].killer === killer),
      JSON.stringify(teleEvents.map(a => a[0])));
    check('no first tale told', !(Game.state.killerTaleLog || []).length);
    check('codex entry unchanged by the vet tale', snapEntry(Game, 'congregation') === before,
      `before=${before} after=${snapEntry(Game, 'congregation')}`);
  }

  console.log('== 2. negative: debate state identical across the vet tale ==');
  {
    const { Game } = await loadGame({ seed: 202, mode: 'vetkilltale-nodebate', fullTelemetry: false });
    await setupGame(Game);
    const [killer] = rosterOf(Game);
    Game.identifyMonster('eulogy');
    // let the debate run a little so proposals exist before the kill
    let g = 0;
    while (g++ < 12) Game.advancePart();
    Game.recordWaveKill('eulogy', killer);
    const before = snapEntry(Game, 'eulogy');
    const proposalsBefore = before;
    toNight(Game);
    check('vet tale told', (Game.state.vetKillerTaleLog || []).length === 1);
    check('reported/knowers/proposals/villageName identical',
      snapEntry(Game, 'eulogy') === proposalsBefore,
      `before=${proposalsBefore} after=${snapEntry(Game, 'eulogy')}`);
  }

  console.log('== 3. guard: first-report kill still tells exactly once ==');
  {
    const { Game } = await loadGame({ seed: 203, mode: 'vetkilltale-first', fullTelemetry: false });
    await setupGame(Game);
    const [killer] = rosterOf(Game);
    const e0 = (Game.state.codex.monsters || {}).audit || {};
    check('type unreported before the kill', !e0.reported);
    Game.recordWaveKill('audit', killer);
    check('first tale queued', (Game.state.killerTales || []).length === 1);
    check('no vet tale queued', !(Game.state.vetKillerTales || []).length);
    toNight(Game);
    check('exactly one first tale told', (Game.state.killerTaleLog || []).length === 1);
    check('no vet tale told', !(Game.state.vetKillerTaleLog || []).length);
  }

  console.log('== 4. wave gate: wave-3 repeat kill queues nothing ==');
  {
    const { Game } = await loadGame({ seed: 204, mode: 'vetkilltale-w3', fullTelemetry: false });
    await setupGame(Game);
    const [killer] = rosterOf(Game);
    Game.identifyMonster('redactor');
    Game.recordWaveKill('redactor', killer);
    check('no first tale queued', !(Game.state.killerTales || []).length);
    check('no vet tale queued', !(Game.state.vetKillerTales || []).length);
    toNight(Game);
    check('no vet tale told', !(Game.state.vetKillerTaleLog || []).length);
    check('no first tale told', !(Game.state.killerTaleLog || []).length);
  }

  console.log('== 5. scholar kill of a reported wave-4 type queues nothing ==');
  {
    const { Game } = await loadGame({ seed: 205, mode: 'vetkilltale-scholar', fullTelemetry: false });
    await setupGame(Game);
    Game.identifyMonster('strike');
    Game.recordWaveKill('strike', Game.villagerId);
    check('no vet tale queued', !(Game.state.vetKillerTales || []).length);
    check('no first tale queued', !(Game.state.killerTales || []).length);
  }

  console.log('== 6. dead killer: vet tale dies with them ==');
  {
    const { Game } = await loadGame({ seed: 206, mode: 'vetkilltale-dead', fullTelemetry: false });
    await setupGame(Game);
    const [killer] = rosterOf(Game);
    Game.identifyMonster('reunion');
    Game.recordWaveKill('reunion', killer);
    check('vet tale queued', (Game.state.vetKillerTales || []).length === 1);
    Game.state.village.fallen = Game.state.village.fallen || [];
    Game.state.village.fallen.push({ villagerId: killer, day: 1, cause: 'test' });
    toNight(Game);
    check('no vet tale told', !(Game.state.vetKillerTaleLog || []).length);
    check('tale marked told (moot)', (Game.state.vetKillerTales || []).every(t => t.told));
  }

  console.log('== 7. two repeat kills, same killer: one tale ==');
  {
    const { Game } = await loadGame({ seed: 207, mode: 'vetkilltale-dupe', fullTelemetry: false });
    await setupGame(Game);
    const [killer] = rosterOf(Game);
    Game.identifyMonster('influencer');
    Game.recordWaveKill('influencer', killer);
    Game.recordWaveKill('influencer', killer);
    check('single untold vet tale', (Game.state.vetKillerTales || []).filter(t => !t.told).length === 1);
    toNight(Game);
    check('exactly one vet tale told', (Game.state.vetKillerTaleLog || []).length === 1);
  }

  console.log('== 8. VETKILLTALE_OFF=1: nothing queued ==');
  {
    process.env.VETKILLTALE_OFF = '1';
    try {
      const { Game } = await loadGame({ seed: 208, mode: 'vetkilltale-off', fullTelemetry: false });
      await setupGame(Game);
      const [killer] = rosterOf(Game);
      Game.identifyMonster('suburb');
      Game.recordWaveKill('suburb', killer);
      check('no vet tale queued with switch off', !(Game.state.vetKillerTales || []).length);
      toNight(Game);
      check('no vet tale told with switch off', !(Game.state.vetKillerTaleLog || []).length);
    } finally {
      delete process.env.VETKILLTALE_OFF;
    }
  }

  console.log(`\nvetkilltale: ${pass} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('vetkilltale harness error:', e); process.exit(2); });
