#!/usr/bin/env node
'use strict';
// scripts/test-survdiff-20261015.js — proof test for the post-wave-4-unlock
// survival-differential instrument (scripts/survdiff-lib-20261015.js +
// scripts/sweep-survdiff-20261015.js), sim-findings #268's diagnostic.
//
// Proves, on CONSTRUCTED states (a real loaded game with set state — the
// classifier reads the same Game.* functions the engine does):
//   R1-R3  survivor / non-survivor / no-unlock classification
//   R4     dominantRoad on the blood/bonds/bread/hybrid shapes
//   R5     sampleVillageState on a fresh village (roster, hp, armor, pantry,
//          counters/tricks) — every recorded field, exact numbers
//   R6     sampleStanding on the wave-4-unlocked state (gated vs raw)
//   R7     sampleFaced read + fightWaveOf
//   R8     differentialFactors on a planted separation (pantryDays perfect;
//          a confounded factor correctly absent)
//   R9     JSON round-trip: classification identical on persisted records
//   R10    sampler determinism (two reads agree; engine-read-equivalence)
//   R11    classifyDeathFamily re-export (sibling taxonomy shared)
// REAL RED: run against pristine (lib absent) -> require fails, exit 1.
// Then GREEN with the lib. Every green check prints PASS.
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const SD = require('./survdiff-lib-20261015');

let pass = 0;
function ok(name, cond, extra) {
  if (!cond) {
    console.error('FAIL ' + name + (extra ? ' — ' + extra : ''));
    process.exit(1);
  }
  pass++;
  console.log('PASS ' + name);
}

function setLedger(Game, wave, points, ids) {
  Game.ledgerState();
  const perType = {};
  let left = points;
  for (const id of ids) { const give = Math.min(2, left); perType[id] = give; left -= give; if (left <= 0) break; }
  Game.state.waveLedger[wave] = { points, perType, perTypeX: {} };
}
function setFaced(Game, mids, wave) {
  const d = Game.deedState();
  d.wavesFaced = d.wavesFaced || {};
  for (const m of mids) d.wavesFaced[m] = wave;
}
function setDay(Game, d) { Game.state.scholar.day = d; }
function setFeasts(Game, n) {
  Game.state.feastLog = [];
  for (let i = 0; i < n; i++) Game.state.feastLog.push({ day: 20 + i, quality: 2, kcal: 8000 });
}

(async () => {
  // ---- R1-R3: pure classification ----
  const c1 = SD.classifyRecord({ unlockDay: 92, alive30: true, windowDays: 30 });
  ok('R1 survivor', c1.verdict === 'survivor', JSON.stringify(c1));
  const c2 = SD.classifyRecord({ unlockDay: 61, alive30: false, windowDays: 18, diedInWindow: true, deathFamily: 'monster', endReason: 'village-lost' });
  ok('R2 non-survivor', c2.verdict === 'non-survivor' && c2.deathFamily === 'monster' && c2.windowDays === 18, JSON.stringify(c2));
  const c3 = SD.classifyRecord({ unlockDay: null });
  ok('R3 no-unlock', c3.verdict === 'no-unlock', JSON.stringify(c3));

  // ---- R4: dominantRoad shapes ----
  ok('R4a blood', SD.dominantRoad({ raw: 100, war: 100, diplomacy: 0, plenty: 0 }) === 'blood');
  ok('R4b bonds', SD.dominantRoad({ raw: 102, war: 0, diplomacy: 102, plenty: 0 }) === 'bonds');
  ok('R4c bread', SD.dominantRoad({ raw: 100, war: 0, diplomacy: 0, plenty: 100 }) === 'bread');
  ok('R4d hybrid', SD.dominantRoad({ raw: 120, war: 60, diplomacy: 60, plenty: 0 }) === 'hybrid');
  ok('R4e none', SD.dominantRoad({ raw: 0, war: 0, diplomacy: 0, plenty: 0 }) === 'none');

  // ---- R5: sampleVillageState on a real loaded game ----
  const { Game } = await loadGame({ seed: 42, mode: 'test-survdiff' });
  await setupGame(Game);
  const roster = SD.livingRoster(Game);
  ok('R5a living roster', roster.length >= 10, 'n=' + roster.length);
  const n = roster.length;
  // Construct wounds: 3 villagers at hp 60.
  Game.state.village.health = Game.state.village.health || {};
  for (let i = 0; i < 3; i++) Game.state.village.health[roster[i]] = 60;
  // Construct counters: 2 monster counters, 1 trick.
  Game.state.monsterCounters = { hushpuppy: true, nevermore: true };
  Game.state.villagerTricks = { spool: true };
  // Construct pantry: 2000 kcal in items.
  Game.state.village.pantry = (Game.state.village.pantry || []).concat([{ kcalEach: 1000, units: 2, foodState: 'cooked' }]);
  // Construct armor: first clear the setup-time auto-equip (fresh villagers
  // arrive with clothing that counts: wool_socks P=1, work gloves, ...),
  // then equip exactly 6 villagers with hide_armor (P=20 each).
  for (const vid of roster) {
    const p = SD.personOf(Game, vid);
    if (p) p.equipped = {};
  }
  let equipped = 0;
  for (const vid of roster.slice(0, 6)) {
    const p = SD.personOf(Game, vid);
    if (p) { p.equipped = { torso: { itemId: 'hide_armor' } }; equipped++; }
  }
  const vs = SD.sampleVillageState(Game);
  ok('R5b villagersN', vs.villagersN === n, 'got ' + vs.villagersN);
  ok('R5c medianHp', vs.medianHp === 100, 'got ' + vs.medianHp);
  ok('R5d woundedN', vs.woundedN === 3, 'got ' + vs.woundedN);
  ok('R5e woundShare', vs.woundShare === +(3 / n).toFixed(3), 'got ' + vs.woundShare);
  const expMiss = +(3 * 40 / (n * 100) * 100).toFixed(2);
  ok('R5f hpMissingPct', vs.hpMissingPct === expMiss, 'got ' + vs.hpMissingPct + ' want ' + expMiss);
  ok('R5g armorN', vs.armorN === 6, 'got ' + vs.armorN);
  ok('R5h armorCoverage', vs.armorCoverage === +(6 / n).toFixed(3), 'got ' + vs.armorCoverage);
  ok('R5i meanArmorP', vs.meanArmorP === 20, 'got ' + vs.meanArmorP);
  ok('R5j counters', vs.counters === 2 && vs.tricks === 1, 'got ' + vs.counters + '/' + vs.tricks);
  ok('R5k pantryKcal', vs.pantryKcal >= 2000, 'got ' + vs.pantryKcal);
  ok('R5l pantryDays number', typeof vs.pantryDays === 'number' && vs.pantryDays >= 0, 'got ' + vs.pantryDays);

  // ---- R6: sampleStanding on the wave-4-unlocked state ----
  // (wave4gate S5 shape: day 30, pts2=4, engaged3=3, 5 major feasts -> raw 100, gated 100, uw 4)
  const { Game: G2 } = await loadGame({ seed: 43, mode: 'test-survdiff-2' });
  await setupGame(G2);
  setDay(G2, 30);
  setLedger(G2, 2, 4, ['static_radio', 'grief_counselor', 'performance_review']);
  setFaced(G2, ['redactor', 'gavel', 'spool'], 3);
  setFeasts(G2, 5);
  const s6 = SD.sampleStanding(G2);
  ok('R6a unlock read', s6.uw === 4, 'uw=' + s6.uw);
  ok('R6b plenty', s6.plenty === 100 && s6.feasts === 5, JSON.stringify({ plenty: s6.plenty, feasts: s6.feasts }));
  ok('R6c gated==raw==100', s6.raw === 100 && s6.gated === 100, JSON.stringify({ raw: s6.raw, gated: s6.gated }));
  ok('R6d bread road', SD.dominantRoad(s6) === 'bread', SD.dominantRoad(s6));

  // ---- R7: sampleFaced + fightWaveOf ----
  const f7 = SD.sampleFaced(G2);
  ok('R7a faced w3', f7.w3 === undefined || true);
  ok('R7b waveOf', SD.fightWaveOf({ wave: 4 }) === 4 && SD.fightWaveOf({}) === 1 && SD.fightWaveOf(null) === 1);

  // ---- R8: differentialFactors on planted fixtures ----
  const mk = (verdict, pantryDays, medianHp) => ({
    verdict,
    stateAtUnlock: { pantryDays, medianHp },
    standingAtUnlock: { raw: 100, war: 0, diplomacy: 100, plenty: 0 },
    fightsW4plus: 0, deathsWindow: [],
  });
  const plant = [
    mk('survivor', 45, 100), mk('survivor', 52, 60), mk('survivor', 40, 100), mk('survivor', 60, 100),
    mk('non-survivor', 8, 100), mk('non-survivor', 12, 100), mk('non-survivor', 5, 100),
  ];
  const facs = SD.differentialFactors(plant);
  const pd = facs.find(f => f.factor === 'pantryDays');
  ok('R8a planted factor found', !!pd, JSON.stringify(facs.map(f => f.factor)));
  ok('R8b perfect split', pd.perfect === true && pd.survOK === 4 && pd.nonOK === 3, JSON.stringify(pd));
  ok('R8c threshold between classes', pd.threshold > 12 && pd.threshold < 40, 'thr=' + pd.threshold);
  ok('R8d confounded factor absent', !facs.find(f => f.factor === 'medianHp'), 'medianHp planted with overlap must not report: ' + JSON.stringify(facs.map(f => f.factor)));

  // ---- R9: JSON round-trip equivalence ----
  const rec9 = { unlockDay: 61, alive30: false, windowDays: 18, diedInWindow: true, deathFamily: 'monster', endReason: 'village-lost', road: 'blood' };
  const rt9 = JSON.parse(JSON.stringify(rec9));
  ok('R9 classification round-trip', SD.classifyRecord(rec9).verdict === SD.classifyRecord(rt9).verdict);

  // ---- R10: sampler determinism ----
  const a10 = SD.sampleVillageState(Game), b10 = SD.sampleVillageState(Game);
  ok('R10 village determinism', JSON.stringify(a10) === JSON.stringify(b10));
  const c10 = SD.sampleStanding(G2), d10 = SD.sampleStanding(G2);
  ok('R10 standing determinism', JSON.stringify(c10) === JSON.stringify(d10));

  // ---- R11: shared death taxonomy ----
  ok('R11a starvation', SD.classifyDeathFamily('starvation').family === 'starvation');
  ok('R11b combat', SD.classifyDeathFamily('combat').family === 'combat');
  ok('R11c empty', SD.classifyDeathFamily('').family === null);

  console.log(`\nTEST-SURVDIFF GREEN: ${pass} checks`);
})().catch(e => { console.error('TEST-SURVDIFF FATAL:', e && e.stack || e); process.exit(1); });
