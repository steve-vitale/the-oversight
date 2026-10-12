#!/usr/bin/env node
// test-disease-r4-20261012.js — proof for longsim disease r4 (lever 7): THE SEEKER.
//
// Canon (docs/DISEASES.md): alien diseases are min-max building blocks —
// "some players will avoid these at all costs, others will seek infection to
// boost their build." No prior sim policy played the seeker angle, so this
// run proves the MECHANISMS of the seeker policy; the sweep
// (scripts/sweep-disease-lever.js, POLICIES=competent,seeker) measures the
// OUTCOMES before/after on identical seeds (see evidence/2026-10-12/).
//
// Proves:
//  (a) seeker claims pure vector fights — no flee on the new-fight assessment
//      where competent WOULD flee (wave-2 mosquito, hpPct 0.6 < 0.7).
//  (b) seeker still retreats below 35% HP (survival first).
//  (c) pureVectorFight/missingViruses unit logic (mixed fights stay competent).
//  (d) seekerEat: quirk meat is taken FIRST as food; meat_human never taken.
//  (e) mosquitoBiteVirus applies a virus on a landed drink (scripted, real Game).
//  (f) lemons engorge fires on eat (scripted, real Game).
//  (g) seeker stops seeking once the permanent warping is held (both viruses /
//      lemons) — falls through to competent fight logic.
// Usage: node scripts/test-disease-r4-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { seeker, pureVectorFight, missingViruses, GIANT_SEEK } = require('./policies/seeker');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('PASS —', name); }
  else { fail++; console.log('FAIL —', name, extra || ''); }
}

// ---- mock fight scaffolding ----
function mockPlayer(hp, maxHp) {
  return { hp, maxHp: maxHp || 100, mx: 4, my: 4, moveLeft: 1, acted: false, alive: true, key: 'p' };
}
function mockMosqFight(p) {
  const m = { kind: 'monster', monsterId: 'giant_mosquito', hp: 35, maxHp: 42, mx: 5, my: 5, alive: true, key: 'm1' };
  return { fighters: [p, m], over: false, id: 'mock1', round: 1 };
}
function mockGame(f, p, held) {
  const calls = { waited: 0, moved: 0, struck: 0, afterAction: 0 };
  const G = {
    tbfight: f,
    tbIsPlayerTurn: () => true,
    tbFighter: (k) => (k === 'p' ? p : null),
    tbPlayerWait: () => { calls.waited++; p.acted = true; p.moveLeft = 0; return true; },
    tbPlayerMove: () => { calls.moved++; return true; },
    tbPlayerStrike: () => { calls.struck++; return true; },
    tbAfterPlayerAction: () => { calls.afterAction++; },
    hasStatus: (who, id) => !!(held || {})[id],
    data: { monsters: [{ id: 'giant_mosquito', wave: 2 }, { id: 'alien_tick', wave: 2 }] },
    equippedWeapon: () => ({ range: 1 }),
    calls,
  };
  return G;
}

(async () => {
  // ---- (a) seeker shape ----
  ok(seeker.id === 'seeker', 'seeker policy id');
  ok(typeof seeker.fight === 'function' && typeof seeker.upkeep === 'function', 'seeker has fight/upkeep');
  ok(GIANT_SEEK.has('giant_mosquito') && GIANT_SEEK.has('alien_tick'), 'seeker targets both giant vectors');

  // ---- (b) pureVectorFight / missingViruses ----
  const p0 = mockPlayer(100);
  const fPure = mockMosqFight(p0);
  ok(pureVectorFight(fPure) === true, 'pure mosquito fight detected');
  const fMixed = { fighters: [p0, { kind: 'monster', monsterId: 'giant_mosquito', hp: 35, alive: true, key: 'm1' }, { kind: 'monster', monsterId: 'hushwolf', hp: 160, alive: true, key: 'm2' }], over: false };
  ok(pureVectorFight(fMixed) === false, 'mixed fight NOT claimed (competent rules)');
  const fNone = { fighters: [p0], over: false };
  ok(pureVectorFight(fNone) === false, 'no monsters: not a vector fight');
  ok(JSON.stringify(missingViruses(mockGame(fPure, p0, {}), fPure.fighters.slice(1))) === JSON.stringify(['eurika', 'east_nile']),
    'missing viruses: both when none held');
  ok(missingViruses(mockGame(fPure, p0, { eurika: 1 }), fPure.fighters.slice(1)).join() === 'east_nile',
    'missing viruses: only east_nile when eurika held');
  ok(missingViruses(mockGame(fPure, p0, { eurika: 1, east_nile: 1 }), fPure.fighters.slice(1)).length === 0,
    'missing viruses: none when both held');

  // ---- (c) seeker does NOT flee the mosquito on assessment; competent DOES ----
  {
    const p = mockPlayer(60); // hpPct 0.6: wave-2 + <0.7 -> competent flees
    const f = mockMosqFight(p);
    const G = mockGame(f, p, {});
    const ctx = {};
    const handled = seeker.fight(G, ctx);
    ok(handled === true, 'seeker handles the mosquito turn (no flee)');
    ok(G.calls.waited === 1, 'seeker WAITS for the drink (does not strike)', 'waited=' + G.calls.waited);
    ok(G.calls.struck === 0, 'seeker does not strike pre-drink');
    ok((ctx.seekerWaits || 0) === 1, 'ctx.seekerWaits counted');
    ok(ctx._fightObj === f, 'seeker claims the fight (competent assessment skipped)');
    // competent on the same position: flees
    const p2 = mockPlayer(60);
    const f2 = mockMosqFight(p2);
    const G2 = mockGame(f2, p2, {});
    const ctx2 = {};
    const h2 = competent.fight(G2, ctx2);
    ok(h2 === true && (ctx2.fledBad || 0) === 1, 'competent FLEES the same mosquito fight on assessment');
  }

  // ---- (d) seeker still retreats below 35% HP ----
  {
    const p = mockPlayer(30); // hpPct 0.3
    const f = mockMosqFight(p);
    const G = mockGame(f, p, {});
    const ctx = {};
    seeker.fight(G, ctx);
    ok(!ctx._seekerFight, 'seeker does NOT claim the fight below 35% HP (survival first)');
    ok((ctx.fled || 0) >= 1, 'competent retreats below 35% HP');
  }

  // ---- (e) mosquito heavy (drank): seeker falls through to kill it ----
  {
    const p = mockPlayer(80);
    const f = mockMosqFight(p);
    f.fighters[1].mosqPhase = 'heavy';
    const G = mockGame(f, p, {});
    const ctx = {};
    seeker.fight(G, ctx);
    ok((ctx.seekerDrinksStood || 0) === 1, 'drink counted as stood');
    ok(G.calls.waited === 0 && G.calls.struck === 1, 'post-drink: no more waiting, competent strikes it');
  }

  // ---- (f) tick walk-in: seeker moves adjacent and waits, no strike ----
  {
    const p = mockPlayer(80);
    const tick = { kind: 'monster', monsterId: 'alien_tick', hp: 50, maxHp: 60, mx: 6, my: 6, alive: true, key: 't1' };
    const f = { fighters: [p, tick], over: false, id: 'mockT', round: 1 };
    const G = mockGame(f, p, {});
    const ctx = {};
    const handled = seeker.fight(G, ctx);
    ok(handled === true, 'seeker handles the tick turn (walks in)');
    ok(G.calls.moved === 1 && G.calls.waited === 1 && G.calls.struck === 0,
      'seeker steps adjacent and waits (no strike)', JSON.stringify(G.calls));
    ok((ctx.seekerWalkIns || 0) === 1, 'ctx.seekerWalkIns counted');
  }

  // ---- (g) warping held: seeker fights normally (no seeking) ----
  {
    const p = mockPlayer(80);
    const f = mockMosqFight(p);
    const G = mockGame(f, p, { eurika: 1, east_nile: 1 });
    const ctx = {};
    seeker.fight(G, ctx);
    ok(!ctx._seekerFight, 'fight not claimed when warping held');
    ok(G.calls.waited === 0, 'both viruses held: seeker does not wait (nothing to seek)');
  }

  // ---- (h) seekerEat: quirk meat first, human meat never ----
  {
    const taken = [];
    const G = {
      state: {
        scholar: { kcal: 0, inventory: [] },
        village: { pantry: [
          { plantId: 'plant_dandelion', foodState: 'raw', kcalEach: 50, units: 1, name: 'dandelion' },
          { plantId: 'meat_hushwolf', foodState: 'raw', kcalEach: 200, units: 1, name: 'hushwolf (cleaned)' },
          { plantId: 'meat_human', foodState: 'raw', kcalEach: 500, units: 1, name: 'long pig' },
        ] },
      },
      data: { cooking: { monsterDiseases: [{ id: 'howlbelly', monsters: ['hushwolf'] }] } },
      kcalCap: () => 1000,
      takeFromPantry: (i) => {
        const it = G.state.village.pantry[i];
        taken.push(it.plantId);
        G.state.scholar.inventory.push(it);
        G.state.village.pantry.splice(i, 1);
        return true;
      },
      eat: () => { G.state.scholar.kcal += 400; }, // mock: each eat adds kcal
    };
    const ctx = {};
    // reach into the module's seekerEat via upkeep? upkeep needs full competent.
    // Instead: call the exported policy's upkeep pieces — simpler to test the
    // scoring directly through a minimal re-run of seekerEat logic is not
    // exported... so drive it via the real function through upkeep with a
    // stubbed competent.upkeep. We test via seeker.upkeep with competent
    // pieces stubbed: temporarily replace competent.upkeep.
    const comp = require('./policies/competent').competent;
    const origUpkeep = comp.upkeep;
    comp.upkeep = () => {};
    try { seeker.upkeep(G, ctx); } finally { comp.upkeep = origUpkeep; }
    ok(taken[0] === 'meat_hushwolf', 'seeker takes quirk meat FIRST (before dandelion)', taken.join(','));
    ok(!taken.includes('meat_human'), 'seeker NEVER takes human meat');
    ok((ctx.seekerMeatEaten || {}).meat_hushwolf >= 1, 'ctx.seekerMeatEaten counts the quirk meat');
  }

  // ---- scripted, real Game ----
  const { Game } = await loadGame({ seed: 4242, mode: 'test', fullTelemetry: true });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t, ...r) { try { said.push(String(t)); } catch (e) {} return origSay(t, ...r); };

  // (i) mosquitoBiteVirus applies a virus on a landed drink
  {
    const vid = Game.mosquitoBiteVirus();
    ok(vid === 'eurika' || vid === 'east_nile', 'mosquitoBiteVirus returns a virus id', String(vid));
    ok(Game.hasStatus('scholar', vid), 'virus applied to scholar');
    // clear and confirm the other is reachable too (min-maxers seek both)
    try { const st = Game.seList('scholar').find(x => x.id === vid); if (st) Game.seRemove('scholar', st); } catch (e) {}
    const seen = new Set();
    for (let i = 0; i < 60; i++) {
      const v2 = Game.mosquitoBiteVirus();
      seen.add(v2);
      try { const st = Game.seList('scholar').find(x => x.id === v2); if (st) Game.seRemove('scholar', st); } catch (e) {}
      if (seen.size === 2) break;
    }
    ok(seen.has('eurika') && seen.has('east_nile'), 'both viruses reachable from bites (seeker can hold both)');
  }

  // (j) lemons engorge fires on eat
  {
    said.length = 0;
    Game.applyStatus('scholar', 'lemons', { source: 'test' });
    const s = Game.state.scholar;
    s.kcal = 0;
    (s.inventory || []).push({ plantId: 'plant_dandelion', foodKind: 'plant', foodState: 'raw', kcalEach: 100, units: 1, edible: true, spoilDay: 9999, name: 'dandelion' });
    try { Game.eat(); } catch (e) {}
    ok(said.some(t => /Lemons engorge/.test(t)), 'lemons engorge fires on eat (+20% kcal)', said.slice(0, 3).join(' | ').slice(0, 140));
  }

  // (k) pool separation holds for the seeker path: alien viruses are not
  // mundane-treatable (canon: earthly pills do nothing to alien biology)
  {
    const def = Game.seDef('eurika');
    const cure = (def || {}).cure || {};
    const pillKeys = Object.keys(cure).filter(k => /antibiotics|antiparasitic/i.test(k));
    ok(pillKeys.every(k => cure[k] === 'no' || cure[k] === undefined) || pillKeys.length === 0,
      'eurika not cured by earthly pills (pool separation)', JSON.stringify(cure));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
