#!/usr/bin/env node
// Proof test for the r139 spotter wiring (journey-establishment r139
// 2026-11-14).
//
// The blank, seven runs running (r131–r138): foodXp['spotter'] = 0 on
// every panel — "a villager can stare at the wild all day and learn
// nothing." Diagnosis (code reading): SPECIALTIES.spotter exists in
// food.js ("plant identification help (future: faster ID)") with real
// occupation mappings, and specialistSkill grows it via the r116
// self-taught ladder (5 XP -> skill 1) — but no grantFoodXpCredit
// call for 'spotter' existed anywhere, and nothing read spotter skill.
// The r131 "no fake progress" guard (no grant toward a skill that does
// nothing) is retired BY DESIGN by this fix: the threshold benefit in
// bumpPlantFamiliarity now gives spotter skill a live effect.
//
// The fix (src/js/game.js only, +39 lines):
//   forage: 1 foodXp['spotter'] rep per forage resolution, first-per-day
//           (foodXpDay.spotter, the r131 cook cap) — a daily forager
//           reaches skill 1 in ~5 days, skill 2 in ~25, skill 3 in ~55.
//   bump:   1 foodXp['spotter'] rep first-per-day on handling a plant,
//           and spotter skill >= 1 lowers the recognition threshold by
//           1 (floor 1). Recognition only — never names a plant
//           (KNOWLEDGE.md: identification happens BACK AT CAMP).
//
// This test proves the mechanism on a harness-loaded Game and the
// tooling determinism:
//   source : the two grant sites call the helper with the per-day cap;
//            the threshold benefit reads skill >= 1 with floor 1; the
//            helper is unchanged (first-rung headroom + 2:1 above); the
//            rung is still 5/15/30; the r139 driver wraps
//            bumpPlantFamiliarity and snapshots codex plants; the r139
//            analyzer scores the SPOTTER / LADDER / FASTER-ID bars and
//            the widened Q2 recap needle; the r131 test's spotter guard
//            is retired (it now asserts the grant exists).
//   live   : rung through the helper for spotter (5 -> 1, 15 -> 2,
//            30 -> 3); villager forage -> +1 spotter XP, +0 second same
//            day, +1 next day, +0 above the rung with carry 1; tend/
//            teach grant nothing; scholar bump -> +1 first call/day,
//            +0 second same day, threshold baseline at skill 0,
//            baseline-1 at skill 1, floor 1 for a hunter at skill 1,
//            and plantKnown stays false even once familiar (recognition
//            is not identification); fix isolation (helper stubbed to
//            skip 'spotter' -> byte-identical pantry, only foodXp
//            differs).
//   analyzer: synthetic corpora prove the SPOTTER / LADDER / FASTER-ID
//            verdict lines (GO shape, total-NO-GO shape, FASTER-ID
//            no-opportunity shape).
//   det-gate: the r139 driver run twice on 5d pilot seed 5001 produces
//            byte-identical JSON + convo txt.
// Usage: node scripts/test-journey-establishment-r139-spotter.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');
const GAME_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
const FOOD_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'food.js'), 'utf8');
const DRIVER = path.join(__dirname, 'journey-establishment-r139-20261114.js');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r139-20261114.js');
const R131_TEST = path.join(__dirname, 'test-journey-establishment-r131-cook-builder.js');
const DRIVER_SRC = fs.readFileSync(DRIVER, 'utf8');
const ANALYZER_SRC = fs.readFileSync(ANALYZER, 'utf8');
const R131_SRC = fs.readFileSync(R131_TEST, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- source: the grants are wired as designed, nothing else moved ---
check('A helper-unchanged-first-rung-headroom', /grantFoodXpCredit\(person, task, units\)/.test(GAME_SRC) &&
  /if \(xp < 5\)/.test(GAME_SRC) &&
  /Math\.floor\(total \/ 2\)/.test(GAME_SRC) &&
  /person\.foodXpRemainder\[task\] = carry/.test(GAME_SRC));
check('B forage-site-calls-helper', /grantFoodXpCredit\(_sp, 'spotter', 1\)/.test(GAME_SRC));
check('C forage-grant-capped-per-day', /foodXpDay\.spotter !== _sday/.test(GAME_SRC) && /foodXpDay\.spotter = _sday/.test(GAME_SRC));
check('D bump-site-calls-helper', /grantFoodXpCredit\(_me, 'spotter', 1\)/.test(GAME_SRC));
check('E bump-threshold-benefit-skill-one-floor-one', /specialistSkill\(_me, 'spotter'\) >= 1/.test(GAME_SRC) &&
  /threshold = Math\.max\(1, threshold - 1\)/.test(GAME_SRC));
check('F rung-still-5-15-30', /xp >= 30 \? 3 : xp >= 15 \? 2 : 1/.test(FOOD_SRC));
check('G driver-wraps-bump-and-snapshots-codex', /Game\.bumpPlantFamiliarity = function \(pid, plant\)/.test(DRIVER_SRC) &&
  /bumpLog\.push\(\{ day: nowDay\(Game\), pid: String\(pid\)/.test(DRIVER_SRC) &&
  /codexPlantsEnd = \{ total: Object\.keys\(cp\)\.length, bySource: bySrc \}/.test(DRIVER_SRC));
check('H analyzer-scores-spotter-bars', /SPOTTER BAR \(primary\)/.test(ANALYZER_SRC) &&
  /LADDER BAR:/.test(ANALYZER_SRC) && /FASTER-ID BAR:/.test(ANALYZER_SRC) &&
  /\['recap-paraphrase', 'still where we are'\]/.test(ANALYZER_SRC));
check('I r131-spotter-guard-retired-by-design', /spotter-grant-site-exists/.test(R131_SRC) &&
  /forage-grants-spotter-xp/.test(R131_SRC) && /retired by design/i.test(R131_SRC));

// --- analyzer synthetic corpora (r131 pattern: temp dirs, removed after) ---
function seedJson(over) {
  return Object.assign({ seed: 5001, run: 'r139', days: 42, endDay: 43, gameOver: false,
    startCensus: [], aliveAt40: 8, aliveEnd: 8, waveReached: 1, pantryKcalEnd: 20000,
    deaths: [], census: [], daily: [], endLog: [], jamLog: [], strandedLog: [],
    brokenWaterDawns: 0, endDisabled: false, foodXpEnd: [], bumpLog: [],
    codexPlantsEnd: { total: 0, bySource: {} },
    travelOutLog: [], wedgeSits: [], commitLog: [] }, over || {});
}
function runAnalyzer(dir, seeds) {
  const env = Object.assign({}, process.env, { EVID: dir });
  return execFileSync(process.execPath, [ANALYZER].concat(seeds.map(String)), { encoding: 'utf8', env });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r139-spotter-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
function writeSeed(dir, seed, over, convo) {
  fs.writeFileSync(path.join(dir, `journey-establishment-r139-seed${seed}.json`), JSON.stringify(seedJson(Object.assign({ seed }, over || {}))));
  fs.writeFileSync(path.join(dir, `journey-establishment-r139-convo-seed${seed}.txt`), convo !== undefined ? convo : '');
}
function fx(id, spotter) { return { id: String(id), name: 'V' + id, alive: true, spotter, butcher: 0, cook: 0, preserver: 0, builder: 0 }; }

// (K) SPOTTER GO shape: panel total 26 (>= 10), every seed > 0, ladder
// on 3/4 seeds, benefit on 2/4 seeds.
withDir((dir) => {
  writeSeed(dir, 5001, { foodXpEnd: [fx('v1', 5), fx('v2', 3)], bumpLog: [{ day: 3, pid: 'dandelion', threshold: 2, encounters: 1, familiar: false, spotterSkill: 1, baseline: 3, benefit: true }], codexPlantsEnd: { total: 2, bySource: { fieldwork: 2 } } });
  writeSeed(dir, 5002, { foodXpEnd: [fx('v1', 5), fx('v2', 3)], bumpLog: [{ day: 4, pid: 'dandelion', threshold: 2, encounters: 1, familiar: false, spotterSkill: 1, baseline: 3, benefit: true }], codexPlantsEnd: { total: 1, bySource: { fieldwork: 1 } } });
  writeSeed(dir, 5003, { foodXpEnd: [fx('v1', 5), fx('v2', 3)], bumpLog: [{ day: 5, pid: 'dandelion', threshold: 3, encounters: 1, familiar: false, spotterSkill: 0, baseline: 3, benefit: false }], codexPlantsEnd: { total: 0, bySource: {} } });
  writeSeed(dir, 5004, { foodXpEnd: [fx('v1', 2)], bumpLog: [{ day: 6, pid: 'dandelion', threshold: 3, encounters: 1, familiar: false, spotterSkill: 0, baseline: 3, benefit: false }], codexPlantsEnd: { total: 0, bySource: {} } });
  // Seed totals: 8 + 8 + 8 + 2 = 26.
  const out = runAnalyzer(dir, [5001, 5002, 5003, 5004]);
  check('K spotter-go-shape', /SPOTTER BAR \(primary\): panel foodXp\['spotter'\] total = 26 \(bar: >= 10\); seeds with > 0 = 4\/4/.test(out), out);
  check('L ladder-three-of-four', /LADDER BAR: 3\/4 seeds with >= 1 villager at 5\+ spotter XP/.test(out), out);
  check('M faster-id-two-of-four', /FASTER-ID BAR: threshold benefit fired on 2\/4 seeds \(2 benefit plays in 4 bump calls/.test(out), out);
  check('N codex-plants-total', /CODEX PLANTS \(report-only\): 3 plants identified/.test(out), out);
});

// (O) SPOTTER total NO-GO shape: every seed > 0 but the panel total is
// 9 (< 10) — the bar reports the miss, it does not re-score it.
withDir((dir) => {
  writeSeed(dir, 5001, { foodXpEnd: [fx('v1', 3)] });
  writeSeed(dir, 5002, { foodXpEnd: [fx('v1', 2)] });
  writeSeed(dir, 5003, { foodXpEnd: [fx('v1', 2)] });
  writeSeed(dir, 5004, { foodXpEnd: [fx('v1', 2)] });
  const out = runAnalyzer(dir, [5001, 5002, 5003, 5004]);
  check('O spotter-total-nine-reported', /SPOTTER BAR \(primary\): panel foodXp\['spotter'\] total = 9 \(bar: >= 10\); seeds with > 0 = 4\/4/.test(out), out);
  check('P ladder-none-reported', /LADDER BAR: 0\/4 seeds/.test(out), out);
});

// (Q) FASTER-ID no-opportunity shape: the scholar handled no plants on
// any seed (bumpCalls = 0) — the bar names the gap instead of scoring 0.
withDir((dir) => {
  writeSeed(dir, 5001, { foodXpEnd: [fx('v1', 3)] });
  writeSeed(dir, 5002, { foodXpEnd: [fx('v1', 2)] });
  writeSeed(dir, 5003, { foodXpEnd: [fx('v1', 2)] });
  writeSeed(dir, 5004, { foodXpEnd: [fx('v1', 2)] });
  const out = runAnalyzer(dir, [5001, 5002, 5003, 5004]);
  check('Q faster-id-no-opportunity', /FASTER-ID BAR: threshold benefit fired on 0\/4 seeds \(0 benefit plays in 0 bump calls; bar: >= 2\/4 seeds; NO-OPPORTUNITY if bumpCalls = 0 on every seed\)/.test(out), out);
});

// --- live events (real resolutions on one harness-loaded Game, seed 5001) ---
(async () => {
  const { Game } = await loadGame({ seed: 5001, mode: 'mvc', fullTelemetry: false });
  try { await setupGame(Game); } catch (e) {
    check('T live-game-loads', false, 'loadGame/setupGame: ' + (e && e.message));
    finish();
    return;
  }
  check('T live-game-loads', !!Game && typeof Game.specialistSkill === 'function' && typeof Game.bumpPlantFamiliarity === 'function' && typeof Game.plantKnown === 'function');

  // Rung through the helper for spotter: 5 -> 1, 15 -> 2, 30 -> 3
  // (forager, no occupation skill — the self-taught ladder).
  try {
    const r = { formerOccupation: 'forager', foodXp: {}, foodXpRemainder: {} };
    Game.grantFoodXpCredit(r, 'spotter', 5);
    check('U rung-spotter-five-skill-one', r.foodXp.spotter === 5 && Game.specialistSkill(r, 'spotter') === 1,
      `xp=${r.foodXp.spotter} skill=${Game.specialistSkill(r, 'spotter')}`);
    Game.grantFoodXpCredit(r, 'spotter', 20);
    check('V rung-spotter-twentyfive-skill-two', r.foodXp.spotter === 15 && Game.specialistSkill(r, 'spotter') === 2,
      `xp=${r.foodXp.spotter} skill=${Game.specialistSkill(r, 'spotter')}`);
    Game.grantFoodXpCredit(r, 'spotter', 30);
    check('W rung-spotter-fiftyfive-skill-three', r.foodXp.spotter === 30 && Game.specialistSkill(r, 'spotter') === 3,
      `xp=${r.foodXp.spotter} skill=${Game.specialistSkill(r, 'spotter')}`);
  } catch (e) {
    check('U rung-spotter-five-skill-one', false, 'rung checks threw: ' + (e && e.message));
  }

  // Event proofs (real duty resolutions — state writes only on this test
  // Game, discarded after). Each case resets the test villager's XP +
  // carry first, so cases are independent despite the carry.
  try {
    const v = Game.state.village || {};
    const curDay = () => (Game.state.scholar || {}).day || 1;
    const setDay = (d) => { Game.state.scholar.day = d; };
    let day = curDay();
    const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
    const forageVid = living[0];
    const forageName = (() => { try { const p = Game.getPerson(forageVid) || {}; return p.name || String(forageVid); } catch (e) { return String(forageVid); } })();
    const fxOf = (vid, task) => (((Game.getPerson(vid) || {}).foodXp || {})[task]) || 0;
    const remOf = (vid, task) => (((Game.getPerson(vid) || {}).foodXpRemainder || {})[task]) || 0;
    const resetFx = (vid, task) => {
      const rec = Game.getPerson(vid) || {};
      rec.foodXp = rec.foodXp || {}; rec.foodXp[task] = 0;
      rec.foodXpRemainder = rec.foodXpRemainder || {}; rec.foodXpRemainder[task] = 0;
      rec.foodXpDay = rec.foodXpDay || {}; delete rec.foodXpDay[task];
    };
    const setFx = (vid, task, xp, carry) => {
      const rec = Game.getPerson(vid) || {};
      rec.foodXp = rec.foodXp || {}; rec.foodXp[task] = xp;
      rec.foodXpRemainder = rec.foodXpRemainder || {}; rec.foodXpRemainder[task] = carry;
      rec.foodXpDay = rec.foodXpDay || {}; delete rec.foodXpDay[task];
    };
    const pantryKcal = () => ((v.pantry || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0));
    const trustOf = (vid) => { try { const t = ((Game.state.village || {}).trust || {})[vid]; return (t === undefined || t === null) ? null : t; } catch (e) { return null; } };
    // (Y) Forage resolution -> +1 spotter XP, carry 0 (and the pantry
    // gains kcal, proving the resolution actually ran, not early-returned).
    setDay(day);
    resetFx(forageVid, 'spotter');
    const kcal0 = pantryKcal();
    Game.resolveOneAssignment(forageVid, { task: 'forage' });
    check('Y forage-resolution-grants-one-spotter-xp', fxOf(forageVid, 'spotter') === 1 && remOf(forageVid, 'spotter') === 0 && pantryKcal() > kcal0,
      `${forageName}: spotter xp ${fxOf(forageVid, 'spotter')}, carry ${remOf(forageVid, 'spotter')}, pantry ${kcal0}->${pantryKcal()} kcal (want +1 xp, carry 0, pantry up)`);
    // (Y2) Second forage THE SAME day -> +0 (per-day cap).
    Game.resolveOneAssignment(forageVid, { task: 'forage' });
    check('Y2 forage-second-same-day-grants-nothing', fxOf(forageVid, 'spotter') === 1 && remOf(forageVid, 'spotter') === 0,
      `spotter xp ${fxOf(forageVid, 'spotter')}, carry ${remOf(forageVid, 'spotter')} (want still 1 xp, carry 0)`);
    // (Y3) Forage the NEXT day -> +1 again (cap resets daily).
    setDay(day + 1); day = curDay();
    Game.resolveOneAssignment(forageVid, { task: 'forage' });
    check('Y3 forage-next-day-grants-again', fxOf(forageVid, 'spotter') === 2 && remOf(forageVid, 'spotter') === 0,
      `spotter xp ${fxOf(forageVid, 'spotter')}, carry ${remOf(forageVid, 'spotter')} (want 2 xp, carry 0)`);
    // (Z) Forage ABOVE the rung (spotter XP pinned at 5) -> +0 XP,
    // carry 1: the dial's 2:1 brake applies to the new grant too (fresh
    // day, so the cap is not what blocks it — the dial is).
    setDay(day + 1); day = curDay();
    setFx(forageVid, 'spotter', 5, 0);
    Game.resolveOneAssignment(forageVid, { task: 'forage' });
    check('Z forage-above-rung-no-xp-carry-one', fxOf(forageVid, 'spotter') === 5 && remOf(forageVid, 'spotter') === 1,
      `spotter xp ${fxOf(forageVid, 'spotter')}, carry ${remOf(forageVid, 'spotter')} (want +0 xp, carry 1)`);
    // (AA) Tend / teach grant NOTHING to spotter.
    const s0 = fxOf(forageVid, 'spotter');
    Game.resolveOneAssignment(forageVid, { task: 'tend' });
    Game.resolveOneAssignment(forageVid, { task: 'teach' });
    check('AA tend-teach-grant-nothing-to-spotter', fxOf(forageVid, 'spotter') === s0,
      `spotter ${s0}->${fxOf(forageVid, 'spotter')}`);

    // Scholar bump events. Baseline threshold from the occupation rules
    // (same rules the driver wrap replicates from game.js).
    const scholar = Game.getPerson(Game.villagerId) || {};
    const scholarData = (Game.data.villagers || []).find(x => x.id === Game.villagerId) || {};
    const scholarOcc = String((scholarData.formerOccupation || scholar.formerOccupation || '')).toLowerCase();
    const baselineFor = (occ, plant) => {
      let b = 3;
      if (occ.includes('hunter') || occ.includes('cook') || occ.includes('chef')) b = 2;
      if (occ.includes('nurse') && plant && plant.medicinal) b = 2;
      if (occ.includes('bus driver') || occ.includes('accountant') || occ.includes('dropout')) b = 4;
      return b;
    };
    const plants = (Game.data.plants || []).filter(p => p && p.id && Array.isArray(p.regions));
    const freshPlant = (i) => plants[i % plants.length];
    const pA = freshPlant(0), pB = freshPlant(1), pC = freshPlant(2);
    const baseA = baselineFor(scholarOcc, pA);
    // (AB) Scholar bump, skill 0 -> threshold is the occupation baseline,
    // +1 spotter XP, and the plant is still NOT known (handling builds
    // recognition, never naming).
    setDay(day + 1); day = curDay();
    resetFx(Game.villagerId, 'spotter');
    const outAB = Game.bumpPlantFamiliarity(pA.id, pA);
    check('AB bump-skill-zero-baseline-threshold-grants-one', outAB && outAB.threshold === baseA && outAB.encounters === 1 && outAB.familiar === false && fxOf(Game.villagerId, 'spotter') === 1 && Game.plantKnown(pA.id) === false,
      `occ=${scholarOcc || '?'} baseline=${baseA} threshold=${outAB && outAB.threshold} encounters=${outAB && outAB.encounters} familiar=${outAB && outAB.familiar} scholar spotter xp=${fxOf(Game.villagerId, 'spotter')} plantKnown=${Game.plantKnown(pA.id)}`);
    // (AB2) Second bump THE SAME day -> +0 XP (per-day cap).
    Game.bumpPlantFamiliarity(pA.id, pA);
    check('AB2 bump-second-same-day-grants-nothing', fxOf(Game.villagerId, 'spotter') === 1,
      `scholar spotter xp=${fxOf(Game.villagerId, 'spotter')} (want still 1)`);
    // (AD) Bump the same plant until familiar: recognition is complete
    // but the plant is STILL not known — identification happens back at
    // camp, never in the field (KNOWLEDGE.md).
    let outAD = outAB;
    for (let i = 0; i < 5 && !outAD.familiar; i++) outAD = Game.bumpPlantFamiliarity(pA.id, pA);
    check('AD familiar-still-not-known', !!(outAD && outAD.familiar) && Game.plantKnown(pA.id) === false,
      `familiar=${outAD && outAD.familiar} encounters=${outAD && outAD.encounters} threshold=${outAD && outAD.threshold} plantKnown=${Game.plantKnown(pA.id)}`);
    // (AC) Bump with skill 1 (spotter XP pinned at 5) on a FRESH plant ->
    // threshold is baseline - 1 (faster recognition).
    setDay(day + 1); day = curDay();
    setFx(Game.villagerId, 'spotter', 5, 0);
    const skillNow = (() => { try { return Game.specialistSkill(scholar, 'spotter'); } catch (e) { return null; } })();
    const outAC = Game.bumpPlantFamiliarity(pB.id, pB);
    check('AC bump-skill-one-threshold-minus-one', skillNow === 1 && outAC && outAC.threshold === baseA - 1 && Game.plantKnown(pB.id) === false,
      `skill=${skillNow} baseline=${baseA} threshold=${outAC && outAC.threshold} (want ${baseA - 1}) plantKnown=${Game.plantKnown(pB.id)}`);
    // (AE) Floor 1: a hunter at skill 1 (baseline 2) gets threshold 1,
    // not 0. Test-only occupation mutation on the harness Game.
    const savedOcc = scholarData.formerOccupation;
    scholarData.formerOccupation = 'hunter';
    setDay(day + 1); day = curDay();
    setFx(Game.villagerId, 'spotter', 5, 0);
    const outAE = Game.bumpPlantFamiliarity(pC.id, pC);
    scholarData.formerOccupation = savedOcc;
    check('AE bump-hunter-skill-one-floor-one', outAE && outAE.threshold === 1 && Game.plantKnown(pC.id) === false,
      `hunter baseline=2 threshold=${outAE && outAE.threshold} (want 1) plantKnown=${Game.plantKnown(pC.id)}`);
    // (AF) FIX ISOLATION: the same forage resolution with the helper
    // stubbed to skip 'spotter' produces a byte-identical pantry and
    // identical trust — only foodXp differs. The grant's only effect is
    // the XP credit.
    try {
      const _rnd = Math.random;
      Math.random = () => 0.5;
      resetFx(forageVid, 'spotter');
      const pantryBefore = JSON.stringify(v.pantry);
      const trustBefore = trustOf(forageVid);
      Game.resolveOneAssignment(forageVid, { task: 'forage' });
      const pantryLive = JSON.stringify(v.pantry);
      const trustLive = trustOf(forageVid);
      const fxLive = fxOf(forageVid, 'spotter');
      // restore the pre-resolution state, stub the helper, re-run.
      v.pantry = JSON.parse(pantryBefore);
      if (trustBefore !== null) ((Game.state.village || {}).trust || {})[forageVid] = trustBefore;
      resetFx(forageVid, 'spotter');
      const _grant = Game.grantFoodXpCredit.bind(Game);
      Game.grantFoodXpCredit = function (person, task, units) {
        if (task === 'spotter') return (person.foodXp || {})[task] || 0;
        return _grant(person, task, units);
      };
      try { Game.resolveOneAssignment(forageVid, { task: 'forage' }); } finally { Game.grantFoodXpCredit = _grant; }
      const pantryStub = JSON.stringify(v.pantry);
      const trustStub = trustOf(forageVid);
      const fxStub = fxOf(forageVid, 'spotter');
      Math.random = _rnd;
      check('AF fix-isolation-pantry-trust-identical', pantryLive === pantryStub && trustLive === trustStub && fxLive === 1 && fxStub === 0,
        `pantry identical=${pantryLive === pantryStub} trust ${trustLive} vs ${trustStub} spotter xp live ${fxLive} vs stub ${fxStub}`);
    } catch (e) { check('AF fix-isolation-pantry-trust-identical', false, 'isolation check threw: ' + (e && e.message)); }
  } catch (e) {
    check('Y forage-resolution-grants-one-spotter-xp', false, 'event proofs threw: ' + (e && e.message) + '\n' + (e && e.stack || ''));
  }

  // (LIVE) det-gate: the r139 driver run TWICE on 5d pilot seed 5001 —
  // byte-identical JSON outputs AND convo transcripts.
  (function detGate() {
    const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r139-detgate-a-'));
    const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r139-detgate-b-'));
    try {
      const run = (dir) => {
        const env = Object.assign({}, process.env, { SEEDS: '5001', DAYS: '5', EVID: dir });
        execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
        return {
          json: fs.readFileSync(path.join(dir, 'journey-establishment-r139-seed5001.json'), 'utf8'),
          txt: fs.readFileSync(path.join(dir, 'journey-establishment-r139-convo-seed5001.txt'), 'utf8'),
        };
      };
      let a = null, b = null;
      try { a = run(dirA); } catch (e) { check('AG det-gate-first-run', false, 'first driver run exit/timeout: ' + (e && e.message)); }
      try { b = run(dirB); } catch (e) { check('AH det-gate-second-run', false, 'second driver run exit/timeout: ' + (e && e.message)); }
      if (a && b) {
        check('AI det-gate-json-identical', a.json === b.json, 'two runs of the same driver/seed produce byte-identical JSON');
        check('AJ det-gate-convo-identical', a.txt === b.txt, 'two runs produce byte-identical convo transcripts');
        const ja = JSON.parse(a.json);
        check('AK det-gate-seed-ran', ja.seed === 5001 && ja.endDay > 0, `seed=${ja.seed} endDay=${ja.endDay}`);
        check('AL det-gate-spotter-instruments-present', Array.isArray(ja.bumpLog) && ja.foodXpEnd !== undefined && ja.codexPlantsEnd !== undefined,
          `bumpLog=${Array.isArray(ja.bumpLog) ? ja.bumpLog.length : typeof ja.bumpLog} foodXpEnd=${Array.isArray(ja.foodXpEnd)} codexPlantsEnd=${!!ja.codexPlantsEnd}`);
      }
    } finally {
      try { fs.rmSync(dirA, { recursive: true, force: true }); } catch (e) {}
      try { fs.rmSync(dirB, { recursive: true, force: true }); } catch (e) {}
    }
  })();

  finish();
})();

function finish() {
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
