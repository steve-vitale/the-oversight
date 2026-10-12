#!/usr/bin/env node
// test-teach-dial-r4.js — proof test for the r4 teach/learn dial
// (need-driven topic weighting + teacher-quality success), 2026-10-11.
//
// Dial under test (src/js/villager-agency.js agencyTeachVillager):
//   - wounded learner (homeWounds[vid] > today): medicinal plants x4 weight
//   - hungry (npcNeeds.hunger >= 60) or novice (tracking xp < 8) learner:
//     food plants x3 weight
//   - teacher breadth <5: 60% success; 5-11: 85%; 12+: 95% + learner +2
//     tracking xp (else +1)
//   - failed lesson -> {taught:false}, no villagerLearnsPlant write
//   - deed text varies by the need read
//
// Usage: node scripts/test-teach-dial-r4.js   (exit 0 = green)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 424242, mode: 'test', fullTelemetry: false });
  await setupGame(Game);
  Game.say = function () {}; // silence for the test

  const plants = Game.data.plants || [];
  const medicinal = plants.filter(p => p.medicinal).map(p => p.id);
  const food = plants.filter(p =>
    (['safe', 'caution'].includes(p.edibility) && (p.caloriesPerUnit || 0) > 0) ||
    (p.uses || []).some(u => u.kind === 'food')).map(p => p.id);
  assert(medicinal.length >= 8, 'need medicinal plants in data');
  assert(food.length >= 20, 'need food plants in data');

  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length >= 3, 'need villagers');
  const teacher = roster[0], learner = roster[1];

  // BACKGROUND OVERLAP (test hygiene): plantsKnownBy is a union of
  // familiar/taught/plantKnowledge — the learner's background may already
  // know the teacher's plants (theater check, not a failure). All teacher
  // sets below are drawn from ids the learner does NOT know, so a
  // non-landed lesson is always the quality roll, never an empty cands.
  let lKnown = [];
  try { lKnown = Game.plantsKnownBy(learner) || []; } catch (e) {}
  const unknown = plants.map(p => p.id).filter(id => lKnown.indexOf(id) === -1);
  const uMed = unknown.filter(id => medicinal.includes(id));
  const uFood = unknown.filter(id => food.includes(id) && !medicinal.includes(id));
  const uOther = unknown.filter(id => !medicinal.includes(id) && !food.includes(id));
  console.log(`setup: learner knows ${lKnown.length}; unknown=${unknown.length} (med=${uMed.length}, food=${uFood.length}, other=${uOther.length})`);
  assert(unknown.length >= 12, 'need >=12 learner-unknown plants for clean trials');

  const setKnown = (vid, ids) => { v.taught[vid] = ids.slice(); };
  // PARALLEL STORE (game.js villagerLearnsPlant): lessons land in BOTH
  // v.taught AND v.plantKnowledge — a trial reset must restore both, or
  // candidates shrink to zero after a few landed lessons.
  const learnerPk0 = ((v.plantKnowledge || {})[learner] || []).slice();
  const resetLearner = () => {
    v.taught[learner] = [];
    v.plantKnowledge = v.plantKnowledge || {};
    v.plantKnowledge[learner] = learnerPk0.slice();
  };
  const clearWounds = () => { Game.state.homeWounds = {}; };
  const xpOf = (vid) => {
    const la = Game.agencyOf(vid);
    return la && la.xp && la.xp[vid] ? la.xp[vid] : null;
  };
  // silence the deed side-effects we don't need for the assertions
  const origDeed = Game.recordDeed;
  let deedTexts = [];
  Game.recordDeed = function (vid, type, text, mag) { deedTexts.push(String(text)); return origDeed.call(this, vid, type, text, mag); };

  // ---- 1. wounded learner: medicinal plants preferred (~80% expected) ----
  clearWounds();
  setKnown(teacher, uMed.slice(0, 6).concat(uFood.slice(0, 6), uOther.slice(0, 4))); // breadth 16 -> ~always lands
  Game.state.homeWounds = Game.state.homeWounds || {};
  Game.state.homeWounds[learner] = 999; // wounded
  Game.npcNeeds(learner).hunger = 10;
  if (xpOf(learner)) xpOf(learner).tracking = 50; // not novice: isolate wound
  let medCount = 0, n1 = 200, landed1 = 0;
  for (let i = 0; i < n1; i++) {
    resetLearner();
    const r = Game.agencyTeachVillager(teacher, learner);
    if (r && r.taught) { landed1++; if (medicinal.includes(r.plant)) medCount++; }
  }
  // expected: 4*6/(4*6+6+4) = 24/34 = 70.6%
  const medShare = medCount / landed1;
  console.log(`1. wounded: ${landed1}/${n1} landed, medicinal share=${(100 * medShare).toFixed(1)}% (expect ~71%)`);
  assert(landed1 > n1 * 0.85, 'breadth-16 teacher should land ~95%, got ' + landed1 / n1);
  assert(medShare > 0.55, 'wounded learner should mostly be taught medicinal plants, got ' + medShare);
  clearWounds();

  // ---- 2. hungry learner: food plants preferred ----
  Game.npcNeeds(learner).hunger = 70;
  let foodCount = 0, n2 = 200, landed2 = 0;
  for (let i = 0; i < n2; i++) {
    resetLearner();
    const r = Game.agencyTeachVillager(teacher, learner);
    if (r && r.taught) { landed2++; if (food.includes(r.plant)) foodCount++; }
  }
  // expected in-game: medicinal-food dual-use plants (dandelion, blackberry,
  // elderberry...) also count as food, so the real food-weighted share is
  // higher than the naive 3*6/(3*6+6+4)=64% — dual-use plants are doubly
  // sensible for a hungry learner, so the inflation is a feature, not a bug.
  const foodShare = foodCount / landed2;
  console.log(`2. hungry: ${landed2}/${n2} landed, food share=${(100 * foodShare).toFixed(1)}% (expect ~64%)`);
  assert(foodShare > 0.5, 'hungry learner should mostly be taught food plants, got ' + foodShare);
  Game.npcNeeds(learner).hunger = 10;

  // ---- 3. teacher quality: success rates by breadth ----
  // BREADTH = taught + background (familiar/plantKnowledge): measure the
  // teacher's background breadth first, then size the taught set so the
  // TOTAL lands in the intended band.
  const bgBreadth = (() => { setKnown(teacher, []); return Game.plantsKnownBy(teacher).length; })();
  console.log(`teacher background breadth: ${bgBreadth}`);
  const trialRate = (targetTotal, trials) => {
    const n = Math.max(0, targetTotal - bgBreadth);
    setKnown(teacher, unknown.slice(0, n));
    const actual = Game.plantsKnownBy(teacher).length;
    let ok = 0;
    for (let i = 0; i < trials; i++) {
      resetLearner();
      const r = Game.agencyTeachVillager(teacher, learner);
      if (r && r.taught) ok++;
    }
    return { rate: ok / trials, actual };
  };
  const t3 = trialRate(3, 200);
  console.log(`3a. breadth ${t3.actual}: success=${(100 * t3.rate).toFixed(1)}% (expect ~60%)`);
  assert(t3.actual < 5 && t3.rate > 0.45 && t3.rate < 0.75, 'breadth<5 should succeed ~60%, got ' + t3.rate + ' at breadth ' + t3.actual);
  const t8 = trialRate(8, 200);
  console.log(`3b. breadth ${t8.actual}: success=${(100 * t8.rate).toFixed(1)}% (expect ~85%)`);
  assert(t8.actual >= 5 && t8.actual < 12 && t8.rate > 0.74 && t8.rate < 0.96, 'breadth 5-11 should succeed ~85%, got ' + t8.rate + ' at breadth ' + t8.actual);
  const t15 = trialRate(15, 200);
  console.log(`3c. breadth ${t15.actual}: success=${(100 * t15.rate).toFixed(1)}% (expect ~95%)`);
  assert(t15.actual >= 12 && t15.rate > 0.88, 'breadth 12+ should succeed ~95%, got ' + t15.rate + ' at breadth ' + t15.actual);

  // ---- 4. failed lesson: no write, honest return ----
  setKnown(teacher, unknown.slice(0, Math.max(0, 3 - bgBreadth))); // land in the 60% band
  let sawFail = false;
  for (let i = 0; i < 60 && !sawFail; i++) {
    resetLearner();
    const before = (v.taught[learner] || []).length;
    const r = Game.agencyTeachVillager(teacher, learner);
    if (r && !r.taught) {
      sawFail = true;
      assert.strictEqual((v.taught[learner] || []).length, before, 'failed lesson must not write knowledge');
    }
  }
  console.log(`4. failed lesson observed: ${sawFail} (no knowledge write on failure)`);
  assert(sawFail, 'expected at least one failed lesson in 60 trials at 60% success');

  // ---- 5. great teacher grants +2 tracking xp ----
  setKnown(teacher, unknown.slice(0, Math.max(0, 15 - bgBreadth))); // total >= 12
  resetLearner();
  const xp = xpOf(learner);
  xp.tracking = 0;
  let landed5 = null;
  for (let i = 0; i < 20 && !landed5; i++) {
    resetLearner();
    xp.tracking = 0;
    const r = Game.agencyTeachVillager(teacher, learner);
    if (r && r.taught) landed5 = r;
  }
  assert(landed5, 'a lesson should land within 20 trials at 95%');
  console.log(`5. breadth-15 teacher: learner tracking xp delta=${xp.tracking} (expect 2)`);
  assert.strictEqual(xp.tracking, 2, 'great teacher should grant +2 tracking xp');

  // ---- 6. deed text varies by need ----
  const teachWithNeed = (needSetup) => {
    deedTexts = [];
    needSetup();
    setKnown(teacher, unknown.slice(0, Math.max(0, 15 - bgBreadth))); // total >= 12
    for (let i = 0; i < 20; i++) {
      resetLearner();
      deedTexts = [];
      const r = Game.agencyTeachVillager(teacher, learner);
      if (r && r.taught) return deedTexts[deedTexts.length - 1];
    }
    return null;
  };
  const woundDeed = teachWithNeed(() => { Game.state.homeWounds[learner] = 999; });
  Game.state.homeWounds[learner] = 0;
  const hungerDeed = teachWithNeed(() => { Game.npcNeeds(learner).hunger = 80; });
  Game.npcNeeds(learner).hunger = 10;
  console.log('6a. wound deed: ' + woundDeed);
  console.log('6b. hunger deed: ' + hungerDeed);
  assert(woundDeed && /wound/.test(woundDeed), 'wound lesson deed should name the wound');
  assert(hungerDeed && /safe to eat/.test(hungerDeed), 'hunger lesson deed should name the need');

  Game.recordDeed = origDeed;
  console.log('\nALL GREEN: teach/learn dial behaves as documented.');
})().catch(e => { console.error('RED: ' + (e && e.stack || e)); process.exit(1); });
