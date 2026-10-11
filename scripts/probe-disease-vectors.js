#!/usr/bin/env node
// probe-disease-vectors.js — direct headless probes of each disease vector.
// Answers: do the vectors actually fire, at what rate, and what happens after?
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function probe(seed, fn) {
  const { Game } = await loadGame({ seed, mode: 'probe' });
  await setupGame(Game);
  return fn(Game);
}

(async () => {
  // P1: raw risky-water drink -> gutrot rate
  const r1 = await probe(7, (Game) => {
    let gutrot = 0;
    const s = Game.state.scholar;
    for (let i = 0; i < 60; i++) {
      // refill a risky bottle directly (skip tile hunting)
      s.water = [{ quality: 'risky', source: 'creek' }];
      s.hydration = 10;
      try { Game.doAction('drink'); } catch (e) {}
      if (Game.hasStatus && Game.hasStatus('scholar', 'gutrot')) { gutrot++; try { Game.cureStatus('scholar', 'gutrot', { source: 'probe' }); } catch (e) {} }
    }
    return { gutrot, trials: 60 };
  });
  console.log('P1 risky-water drink x60 ->', JSON.stringify(r1));

  // P2: ambient tick attach in forest + escalation to Fever over 20 days
  const r2 = await probe(42, (Game) => {
    const s = Game.state.scholar;
    let attaches = 0, fever = 0;
    // walk 800 steps in forest: force tile type by walking; count attaches
    for (let i = 0; i < 800; i++) {
      try {
        // fake forest underfoot: override playerTile temporarily
        const orig = Game.playerTile;
        Game.playerTile = () => ({ type: 'forest' });
        try { Game.stepTo && Game.stepTo(0, 0); } catch (e) {}
        Game.playerTile = orig;
      } catch (e) {}
      if (Game.hasStatus && Game.hasStatus('scholar', 'tick_attached')) { attaches++; break; }
    }
    // now leave tick on and tick dayParts for 20 days
    let parts = 0;
    for (let d = 0; d < 20 && !Game.hasStatus('scholar', 'disease'); d++) {
      for (let p = 0; p < 4; p++) { try { Game.diseaseVectorTick(); parts++; } catch (e) {} }
    }
    fever = Game.hasStatus && Game.hasStatus('scholar', 'disease') ? 1 : 0;
    return { attaches, parts, fever };
  });
  console.log('P2 forest steps 800 ->', JSON.stringify(r2));

  // P3: ambient mosquito bite (wetlands at dusk) — call diseaseVectorTick with tile faked
  const r3 = await probe(99, (Game) => {
    let fever = 0;
    const orig = Game.playerTile;
    Game.playerTile = () => ({ type: 'marsh' });
    try {
      for (let i = 0; i < 200; i++) {
        // dusk-only handled inside; call enough times
        try { Game.diseaseVectorTick(); } catch (e) {}
        if (Game.hasStatus && Game.hasStatus('scholar', 'disease')) { fever++; break; }
      }
    } finally { Game.playerTile = orig; }
    return { fever, trials: 200 };
  });
  console.log('P3 mosquito vectorTick x200 (marsh) ->', JSON.stringify(r3));

  // P4: lockjaw untreated — contract and tick until resolution
  const r4 = await probe(2026, (Game) => {
    Game.contractDisease('lockjaw', { source: 'probe' });
    let parts = 0, died = false, resolved = 'still-present';
    for (let i = 0; i < 400 && !died; i++) {
      try { Game.advancePart(); } catch (e) {}
      parts++;
      if (Game.over) { died = true; break; }
      if (!(Game.hasStatus && Game.hasStatus('scholar', 'lockjaw'))) { resolved = 'expired-at-' + parts; break; }
    }
    return { parts, died, resolved, over: !!Game.over };
  });
  console.log('P4 lockjaw untreated 400 parts ->', JSON.stringify(r4));

  // P5: wound vector — health<40, run vector ticks
  const r5 = await probe(4242, (Game) => {
    const s = Game.state.scholar;
    s.health = 20;
    let wound = 0, lock = 0;
    for (let i = 0; i < 100; i++) {
      try { Game.diseaseVectorTick(); } catch (e) {}
      if (Game.hasStatus('scholar', 'wound_fever')) wound++;
      if (Game.hasStatus('scholar', 'lockjaw')) lock++;
    }
    return { wound, lock, trials: 100 };
  });
  console.log('P5 wound vector x100 (hp 20) ->', JSON.stringify(r5));

  // P6: trichinosis — eat raw bear meat
  const r6 = await probe(987654, (Game) => {
    let tri = 0;
    for (let i = 0; i < 30; i++) {
      Game.state.scholar.kcal = 100;
      Game.state.scholar.inventory = [{ plantId: 'meat_bear', foodState: 'raw', kcalEach: 200, name: 'bear meat' }];
      try { Game.eat(); } catch (e) {}
      if (Game.hasStatus && Game.hasStatus('scholar', 'trichinosis')) { tri++; break; }
    }
    return { tri, trials: 30 };
  });
  console.log('P6 raw bear meat x30 ->', JSON.stringify(r6));

  // P7: cure pipeline — wound_fever diagnosed then folk-treated; does it cure or just ease?
  const r7 = await probe(111, (Game) => {
    Game.contractDisease('wound_fever', { source: 'probe' });
    try { Game.diagnoseDisease('scholar', 'wound_fever', { by: 'probe' }); } catch (e) {}
    const diag = !!(Game.isDiagnosed && Game.isDiagnosed('scholar', 'wound_fever'));
    // folk rest cure attempt via the action path
    let cured = 0, eased = 0;
    for (let i = 0; i < 10; i++) {
      try { Game.cureStatus('scholar', 'wound_fever', { source: 'folk remedy (probe)' }); } catch (e) {}
      if (!(Game.hasStatus && Game.hasStatus('scholar', 'wound_fever'))) { cured++; break; }
    }
    return { diag, cured, present: !!(Game.hasStatus && Game.hasStatus('scholar', 'wound_fever')) };
  });
  console.log('P7 wound_fever diagnosed + folk cure x10 ->', JSON.stringify(r7));
})();
