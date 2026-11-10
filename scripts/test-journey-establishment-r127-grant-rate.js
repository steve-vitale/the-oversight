#!/usr/bin/env node
// test-journey-establishment-r127-grant-rate.js — proof test for the r127
// grant-rate dial (journey-establishment r127 2026-11-10).
//
// r118 CONFIRMED the pace regression (pace03 7/16 on fresh seeds): a
// villager races from nothing to specialist level 3 in 42 days because
// routine work pays 1 foodXp per unit — a rack batch, a hunt kill. The
// fix (src/js/game.js) halves the routine-work grant rate: 2 units of
// work buy 1 XP, the odd unit carrying on the person record
// (foodXpRemainder), so no work is ever lost to rounding. The rung
// (5/15/30, r116) is unchanged; askSpecialist (+1 per direct teaching
// use) is unchanged; only the two routine-work sites move (rack batches,
// hunt kills).
//
// This test proves the dial end to end:
//   source : the helper exists with the 2:1 conversion; both routine
//            sites call it; the old +1/+n grants are gone; askSpecialist
//            still grants +1; the rung is still 5/15/30.
//   live helper: 1 unit -> 0 XP + carry 1; 2 units -> 1 XP + carry 0;
//            5 units -> 2 XP + carry 1; 0/negative units -> 0, no write;
//            null person -> 0.
//   live rung: 10 units -> 5 XP -> skill 1; 30 units -> 15 XP -> 2;
//            60 units -> 30 XP -> 3 (forager, no occupation skill).
//            Holders still step +1 at 5 XP (fisherman butcher 2 -> 3).
//   live events (real duty resolutions on one harness-loaded Game):
//            1 rack batch -> +0 XP, carry 1; 2 batches -> +1 XP, carry
//            0; 5 batches -> +2 XP, carry 1; no preserve -> +0, carry
//            unchanged; 1st hunt kill -> +0 XP, carry 1; 2nd kill ->
//            +1 XP, carry 0; failed stalk -> +0, carry unchanged.
//            BEFORE the fix these FAIL (1 batch -> +1, 2 -> +2, 5 -> +5,
//            1st kill -> +1); AFTER they PASS.
//   analyzer: synthetic corpora prove the Q1 verdict lines (GO at 8/16
//            moves + pace03 1; NO-GO on the pace bar at pace03 5) and the
//            Q2 denominator fix (a pending-at-start answer counts as
//            offered with no spoken line; a spoken line followed by
//            silence counts as offered-but-unanswered).
//   det-gate: the r127 driver vs the r118 driver on 5d seed 2101
//            (HUNTSTAFF=2) reproduce identical funnel keys — the driver
//            changes are a tag rename + a read-only snapshot fallback.
//
// Usage: node scripts/test-journey-establishment-r127-grant-rate.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r127-20261110.py');
const DRIVER = path.join(__dirname, 'journey-establishment-r127-20261110.js');
const DRIVER_R118 = path.join(__dirname, 'journey-establishment-r118-20261109.js');
const GAME_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
const FOOD_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'food.js'), 'utf8');
const DRIVER_SRC = fs.readFileSync(DRIVER, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- source: the dial is wired as designed, nothing else moved ---
check('A helper-exists-2to1', /grantFoodXpCredit\(person, task, units\)/.test(GAME_SRC) &&
  /Math\.floor\(total \/ 2\)/.test(GAME_SRC) &&
  /person\.foodXpRemainder\[task\] = total % 2/.test(GAME_SRC));
check('B butcher-site-calls-helper', /grantFoodXpCredit\(_hp, 'butcher', 1\)/.test(GAME_SRC));
check('C preserver-site-calls-helper', /grantFoodXpCredit\(person, 'preserver', n\)/.test(GAME_SRC));
check('D old-butcher-grant-gone', !/foodXp\.butcher = \(_hp\.foodXp\.butcher \|\| 0\) \+ 1/.test(GAME_SRC));
check('E old-preserver-grant-gone', !/foodXp\.preserver = \(person\.foodXp\.preserver \|\| 0\) \+ n/.test(GAME_SRC));
check('F askspecialist-still-plus-one', /src\.foodXp\[task\] = \(src\.foodXp\[task\] \|\| 0\) \+ 1/.test(FOOD_SRC));
check('G rung-still-5-15-30', /xp >= 30 \? 3 : xp >= 15 \? 2 : 1/.test(FOOD_SRC));
check('H driver-snapshot-fallback', /const fx = \(p && p\.foodXp\) \|\| \(vp && vp\._src && vp\._src\.foodXp\) \|\| \{\}/.test(DRIVER_SRC));
check('I driver-foodXpOf-fallback', /if \(p && p\.foodXp && p\.foodXp\[task\]\) return p\.foodXp\[task\]/.test(DRIVER_SRC));

// --- analyzer synthetic corpora (r115 pattern: temp dirs, removed after) ---
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const SEEDS16 = [2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109, 2110, 2111, 2112, 2113, 2114, 2115, 2116];
function villager(id, name, occ, comp, prac, spec, food, skills, alive) {
  const c = {}, p = {}, s = {}, f = {};
  for (const t of TASKS) { c[t] = comp[t] != null ? comp[t] : 1.0; p[t] = (prac && prac[t]) || 0; }
  for (const t of SPECS) { s[t] = (spec && spec[t] != null) ? spec[t] : 0; f[t] = (food && food[t]) || 0; }
  return { id, name, alive: alive !== false, occ, competence: c, practice: p, specialist: s, foodXp: f, npcSkills: (skills || []).slice() };
}
function snap(day, villagers) { return villagers ? { day, snap: villagers } : null; }
function dailyRows() {
  const rows = [];
  for (let d = 2; d <= 43; d++) rows.push({ day: d, alive: 8, roster: 12, pantryKcal: 20000, over: false, wave: 1, ledger2: 0 });
  return rows;
}
function baseSeed(seed, practice, teleAll) {
  return { seed, run: 'r127-after', days: 42, endDay: 43, gameOver: false, startCensus: [],
    holdingsStart: [], holdingsEnd: [], practice: practice || { d1: null, d14: null, d28: null, dEnd: null },
    playerAbilitiesEnd: [], aliveAt40: 8, aliveEnd: 8, waveReached: 1, pantryKcalEnd: 20000,
    deaths: [{ day: 20, who: 'X', cause: 'monster', kind: 'monster', player: false }],
    census: [], daily: dailyRows(), matTrace: [], craftLog: [], npcCraftLog: [],
    huntLog: [], careLog: [], healerLog: [], treatLog: [], cookLog: [],
    huntStaff: { layerOn: true, prepOn: true, assignments: 0, assignLog: [], refusalLog: [], woundLog: [], prepLog: [] },
    huntEligEnd: [], huntEligEver: [], leanTrace: [],
    guardrails: { deaths: 1, popAlive: 8, pantryKcal: 20000 }, c3: { starvationDeaths: 0 },
    playerPackArmor: [], playerEquipped: [], playerRecipes: {},
    contestTele: [], contestCounts: {}, waveSysLines: [], teleTypes: {}, skillRows: [],
    skillCounts: {}, teachDays: [], teleAll: teleAll || [], playerCodexSkills: {}, avCraftEnd: {} };
}
function convoTxt() {
  return '=== r127-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\n(ended by engine)\nclosing: goodbye\n';
}
function corpusSeed(dir, tag, seed, practice, teleAll, convo) {
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-seed${seed}.json`),
    JSON.stringify(baseSeed(seed, practice, teleAll)));
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-convo-seed${seed}.txt`), convo !== undefined ? convo : convoTxt());
}
function corpus(dir, seeds, mkPractice, mkTele, mkConvo) {
  for (const seed of seeds) {
    const practice = mkPractice(seed);
    corpusSeed(dir, 'r127-before', seed, { d1: null, d14: null, d28: null, dEnd: null }, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r127-before') : undefined);
    corpusSeed(dir, 'r127-after', seed, practice, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r127-after') : undefined);
  }
}
function runAnalyzer(dir) {
  return execFileSync('python3', [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r127-grant-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
const MOVE_SEEDS = [2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108];

// (J) Ladder GO: specialist 0->positive on 8/16 seeds AND pace03 1 -> GO.
// Under the halved grant, 11 XP buys skill 2 (5->1, 15->2) and 30 XP buys
// skill 3; the synthetic move seeds carry 11 XP (skill 2) except 2101,
// which carries one 0->3 racer at 30 XP (inside the <=4 bar).
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { preserver: 0 }, { preserver: 0 }, []);
    if (!MOVE_SEEDS.includes(seed)) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { preserver: 2 }, { preserver: 11 }, []);
    if (seed !== 2101) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
    const v2 = villager('v2', 'Bo', 'forager', {}, {}, { preserver: 0 }, { preserver: 0 }, []);
    const v2e = villager('v2', 'Bo', 'forager', {}, {}, { preserver: 3 }, { preserver: 30 }, []);
    return { d1: snap(1, [v1, v2]), d14: snap(14, [v1, v2]), d28: snap(28, [v1, v2]), dEnd: snap(43, [v1e, v2e]) };
  };
  corpus(dir, SEEDS16, mk);
  const out = runAnalyzer(dir);
  check('J ladder-GO-eight-seeds', /Q1 verdict: GO \(moves 8\/16, pace03 1, bars moves>=8 pace<=4\)/.test(out), out.slice(out.indexOf('Q1 verdict:')));
  check('K ladder-pace-counted', /Q1 PACE \(specialist 0->3 in 42d\): BEFORE=0 AFTER=1 \(bar AFTER<=4\)/.test(out), out);
});

// (L) Pace fails while moves hold: 8/16 move seeds, but FIVE villagers
// reach skill 3 from 0 (bar <=4) -> Q1 NO-GO on the pace leg.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { preserver: 0 }, { preserver: 0 }, []);
    if (!MOVE_SEEDS.includes(seed)) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { preserver: 2 }, { preserver: 11 }, []);
    if (seed !== 2101) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
    const racers = ['Bo', 'Cy', 'De', 'Em', 'Fa'].map((nm, i) =>
      villager('v' + (i + 2), nm, 'forager', {}, {}, { preserver: 0 }, { preserver: 0 }, []));
    const racersEnd = ['Bo', 'Cy', 'De', 'Em', 'Fa'].map((nm, i) =>
      villager('v' + (i + 2), nm, 'forager', {}, {}, { preserver: 3 }, { preserver: 30 }, []));
    return { d1: snap(1, [v1, ...racers]), d14: snap(14, [v1, ...racers]), d28: snap(28, [v1, ...racers]), dEnd: snap(43, [v1e, ...racersEnd]) };
  };
  corpus(dir, SEEDS16, mk);
  const out = runAnalyzer(dir);
  check('L pace-five-is-NO-GO', /Q1 verdict: NO-GO \(moves 8\/16, pace03 5 — pace bar missed, bar <=4\)/.test(out), out.slice(out.indexOf('Q1 verdict:')));
});

// (M) Q2 denominator fix, PASS shape: one spoken invite answered + one
// pending-at-start answer (no spoken line) + zero unanswered -> offered
// 2, answered 2 -> PASS. The pending answer proves the menu was
// presented even though no invitation line was spoken.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoPass = (seed, tag) => {
    if (seed !== 2101 || tag !== 'r127-after') return convoTxt();
    return '=== r127-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: "Walk my trap line with me?"\nYOU: [betrayal:accept]\nTHEM: "Good. Bring your boots."\n-- Bo (v2) occ=hunter --\nOPENING: hello\nYOU: [betrayal:decline]\nTHEM: "Another time, then."\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoPass);
  const out = runAnalyzer(dir);
  check('M q2-denominator-pending-counts', /Q2 invitations: spoken=1 answers accept=1 decline=1 unanswered-spoken=0 offered=2/.test(out), out);
  check('N q2-pass-at-100pct', /Q2 verdict: PASS \(answered 2\/2 = 100%, bar >=80%\)/.test(out), out);
});

// (O) Q2 denominator fix, FAIL shape: one spoken invite answered + one
// spoken invite followed by silence -> offered 2, answered 1 -> FAIL.
// The old denominator (spoken lines only) would have read offered=2,
// answered=1 here too — the fix shows in (M), where the pending answer
// would have been invisible to the old count.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoFail = (seed, tag) => {
    if (seed !== 2101 || tag !== 'r127-after') return convoTxt();
    return '=== r127-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: "Walk my trap line with me?"\nYOU: [betrayal:accept]\nTHEM: "Good. Bring your boots."\n-- Bo (v2) occ=hunter --\nOPENING: hello\nTHEM: "Come see what I found?"\nYOU: [silence]\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoFail);
  const out = runAnalyzer(dir);
  check('O q2-silence-counts-unanswered', /Q2 invitations: spoken=2 answers accept=1 decline=0 unanswered-spoken=1 offered=2/.test(out), out);
  check('P q2-fail-at-50pct', /Q2 verdict: FAIL \(answered 1\/2, bar >=80%\)/.test(out), out);
});

// (Q) Q3 null lines: a THEM: (null) line in the after panel fails Q3.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoNull = (seed, tag) => {
    if (seed !== 2101 || tag !== 'r127-after') return convoTxt();
    return '=== r127-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: (null)\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoNull);
  const out = runAnalyzer(dir);
  check('Q q3-null-line-fails', /Q3 verdict: FAIL \(1 null THEM lines/.test(out), out);
});

// (LIVE) helper + rung + event proofs on one harness-loaded Game.
(async () => {
  const { loadGame, setupGame } = require('./sim-harness');
  let Game;
  try {
    ({ Game } = await loadGame({ seed: 2101, mode: 'mvc', fullTelemetry: false }));
    await setupGame(Game);
  } catch (e) {
    check('R live-game-loads', false, 'loadGame/setupGame: ' + (e && e.message));
    finish();
    return;
  }
  check('R live-game-loads', !!Game && typeof Game.specialistSkill === 'function');

  // Helper unit checks (plain person objects — no state writes).
  try {
    if (typeof Game.grantFoodXpCredit !== 'function') {
      check('S helper-present-on-Game', false, 'Game.grantFoodXpCredit missing (unfixed tree)');
    } else {
      check('S helper-present-on-Game', true);
      const p = {};
      check('T one-unit-no-xp-carry-one', Game.grantFoodXpCredit(p, 'preserver', 1) === 0 &&
        p.foodXpRemainder.preserver === 1 && !(p.foodXp && p.foodXp.preserver),
        `xp=${(p.foodXp || {}).preserver} carry=${(p.foodXpRemainder || {}).preserver}`);
      check('U second-unit-makes-one-xp', Game.grantFoodXpCredit(p, 'preserver', 1) === 1 &&
        p.foodXp.preserver === 1 && p.foodXpRemainder.preserver === 0,
        `xp=${p.foodXp.preserver} carry=${p.foodXpRemainder.preserver}`);
      check('V five-units-two-xp-carry-one', Game.grantFoodXpCredit(p, 'preserver', 5) === 2 &&
        p.foodXp.preserver === 3 && p.foodXpRemainder.preserver === 1,
        `xp=${p.foodXp.preserver} carry=${p.foodXpRemainder.preserver} (7 units total -> 3 xp)`);
      const b = {};
      check('W butcher-same-rate', Game.grantFoodXpCredit(b, 'butcher', 1) === 0 &&
        Game.grantFoodXpCredit(b, 'butcher', 1) === 1 && b.foodXp.butcher === 1,
        `butcher xp=${(b.foodXp || {}).butcher}`);
      const z = {};
      check('X zero-units-no-write', Game.grantFoodXpCredit(z, 'preserver', 0) === 0 && !z.foodXp && !z.foodXpRemainder);
      check('Y negative-units-no-write', Game.grantFoodXpCredit(z, 'preserver', -3) === 0 && !z.foodXp);
      check('Z null-person-safe', Game.grantFoodXpCredit(null, 'preserver', 2) === 0);
      // Rung through the helper: 10 units -> 5 XP -> 1; 30 -> 15 XP -> 2;
      // 60 -> 30 XP -> 3. Holders still step +1 at 5 XP.
      const r = { formerOccupation: 'forager', foodXp: {}, foodXpRemainder: {} };
      Game.grantFoodXpCredit(r, 'preserver', 10);
      check('AA rung-ten-units-skill-one', r.foodXp.preserver === 5 && Game.specialistSkill(r, 'preserver') === 1,
        `xp=${r.foodXp.preserver} skill=${Game.specialistSkill(r, 'preserver')}`);
      Game.grantFoodXpCredit(r, 'preserver', 20);
      check('AB rung-thirty-units-skill-two', r.foodXp.preserver === 15 && Game.specialistSkill(r, 'preserver') === 2,
        `xp=${r.foodXp.preserver} skill=${Game.specialistSkill(r, 'preserver')}`);
      Game.grantFoodXpCredit(r, 'preserver', 30);
      check('AC rung-sixty-units-skill-three', r.foodXp.preserver === 30 && Game.specialistSkill(r, 'preserver') === 3,
        `xp=${r.foodXp.preserver} skill=${Game.specialistSkill(r, 'preserver')}`);
      const h = { formerOccupation: 'fisherman', foodXp: {}, foodXpRemainder: {} };
      Game.grantFoodXpCredit(h, 'butcher', 10);
      check('AD holder-steps-up-at-five', h.foodXp.butcher === 5 && Game.specialistSkill(h, 'butcher') === 3,
        `xp=${h.foodXp.butcher} skill=${Game.specialistSkill(h, 'butcher')}`);
    }
  } catch (e) {
    check('S helper-present-on-Game', false, 'helper checks threw: ' + (e && e.message));
  }

  // Event proofs (real duty resolutions — state writes only on this test
  // Game, discarded after). Each case resets the test villager's XP +
  // carry first, so cases are independent despite the carry.
  try {
    const v = Game.state.village || {};
    const day = (Game.state.scholar || {}).day || 1;
    const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
    const cookVid = living[0];
    const hunterVid = living[1] || living[0];
    const fxOf = (vid, task) => (((Game.getPerson(vid) || {}).foodXp || {})[task]) || 0;
    const remOf = (vid, task) => (((Game.getPerson(vid) || {}).foodXpRemainder || {})[task]) || 0;
    const resetFx = (vid, task) => {
      const rec = Game.getPerson(vid) || {};
      rec.foodXp = rec.foodXp || {}; rec.foodXp[task] = 0;
      rec.foodXpRemainder = rec.foodXpRemainder || {}; rec.foodXpRemainder[task] = 0;
    };
    const preservedCount = () => ((Game.state.village.pantry || []).filter(it => it && it.foodState === 'preserved').length);
    // (i) ONE batch in one resolution -> +0 XP, carry 1. Setup: 10 units
    // x 1000 kcal, spoilDay day+1 (eligible), against a ~3000 kcal
    // reserve, so exactly one stack converts (r115 BA shape).
    resetFx(cookVid, 'preserver');
    v.pantry = v.pantry || [];
    v.pantry.push({ name: 'Test haunch', kcalEach: 1000, units: 10, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
    const p0 = preservedCount();
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('AE rack-one-batch-no-xp-carry-one', preservedCount() === p0 + 1 && fxOf(cookVid, 'preserver') === 0 && remOf(cookVid, 'preserver') === 1,
      `preserved ${p0}->${preservedCount()}, xp ${fxOf(cookVid, 'preserver')}, carry ${remOf(cookVid, 'preserver')} (want +1 preserved, +0 xp, carry 1)`);
    // (ii) no preserve -> +0, carry unchanged.
    try {
      const vv = Game.state.village;
      vv.pantry = (vv.pantry || []).filter(it => !it || it.foodState === 'preserved' || it.foodState === 'rendered' || (it.spoilDay != null && it.spoilDay - day > 2));
      const b2 = fxOf(cookVid, 'preserver'), r2 = remOf(cookVid, 'preserver'), p2 = preservedCount();
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      check('AF rack-no-preserve-no-xp-carry-kept', preservedCount() === p2 && fxOf(cookVid, 'preserver') === b2 && remOf(cookVid, 'preserver') === r2,
        `preserved ${p2}->${preservedCount()}, xp ${b2}->${fxOf(cookVid, 'preserver')}, carry ${r2}->${remOf(cookVid, 'preserver')}`);
    } catch (e) { check('AF rack-no-preserve-no-xp-carry-kept', false, 'negative rack check threw: ' + (e && e.message)); }
    // (iii) TWO batches in one resolution -> +1 XP, carry 0 (r115 BF
    // setup: two stacks, 5 units x 1000 kcal each).
    try {
      resetFx(cookVid, 'preserver');
      const vv = Game.state.village;
      vv.pantry = vv.pantry || [];
      vv.pantry.push({ name: 'Test haunch A', kcalEach: 1000, units: 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      vv.pantry.push({ name: 'Test haunch B', kcalEach: 1000, units: 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      const p3 = preservedCount();
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      check('AG rack-two-batches-one-xp', preservedCount() === p3 + 2 && fxOf(cookVid, 'preserver') === 1 && remOf(cookVid, 'preserver') === 0,
        `preserved ${p3}->${preservedCount()}, xp ${fxOf(cookVid, 'preserver')}, carry ${remOf(cookVid, 'preserver')} (want +2 preserved, +1 xp, carry 0)`);
    } catch (e) { check('AG rack-two-batches-one-xp', false, 'two-batch rack check threw: ' + (e && e.message)); }
    // (iv) FIVE batches in one resolution -> +2 XP, carry 1 (r115 BG
    // setup: stack A absorbs the reserve, stacks B-E convert; n=5).
    try {
      resetFx(cookVid, 'preserver');
      const vv = Game.state.village;
      vv.pantry = (vv.pantry || []).filter(it => !it || it.foodState === 'preserved' || it.foodState === 'rendered' || (it.spoilDay != null && it.spoilDay - day > 2));
      const rosterLen = ((vv.roster || []).length || 10);
      vv.pantry.push({ name: 'Test haunch CAP-A', kcalEach: 100, units: Math.ceil(2.5 * rosterLen) + 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      for (const nm of ['B', 'C', 'D', 'E']) {
        vv.pantry.push({ name: 'Test haunch CAP-' + nm, kcalEach: 100, units: 10, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      }
      const p4 = preservedCount();
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      check('AH rack-five-batches-two-xp-carry-one', preservedCount() >= p4 + 4 && fxOf(cookVid, 'preserver') === 2 && remOf(cookVid, 'preserver') === 1,
        `preserved ${p4}->${preservedCount()} (roster ${rosterLen}), xp ${fxOf(cookVid, 'preserver')}, carry ${remOf(cookVid, 'preserver')} (want >=+4 preserved, +2 xp, carry 1)`);
    } catch (e) { check('AH rack-five-batches-two-xp-carry-one', false, 'five-batch rack check threw: ' + (e && e.message)); }
    // (v)/(vi) hunt kill / fail via stubbed Math.random.
    resetFx(hunterVid, 'butcher');
    const _rnd = Math.random;
    try {
      Math.random = () => 0; // every draw succeeds: the stalk lands, the kill is cleaned
      const rKill1 = Game.villagerHuntResolve(hunterVid, 1.0);
      check('AI hunt-first-kill-no-xp-carry-one', (rKill1 && rKill1.kcal > 0) && fxOf(hunterVid, 'butcher') === 0 && remOf(hunterVid, 'butcher') === 1,
        `kill kcal=${rKill1 && rKill1.kcal}, butcher xp ${fxOf(hunterVid, 'butcher')}, carry ${remOf(hunterVid, 'butcher')} (want +0 xp, carry 1)`);
      const rKill2 = Game.villagerHuntResolve(hunterVid, 1.0);
      check('AJ hunt-second-kill-one-xp', (rKill2 && rKill2.kcal > 0) && fxOf(hunterVid, 'butcher') === 1 && remOf(hunterVid, 'butcher') === 0,
        `kill kcal=${rKill2 && rKill2.kcal}, butcher xp ${fxOf(hunterVid, 'butcher')}, carry ${remOf(hunterVid, 'butcher')} (want +1 xp, carry 0)`);
      Math.random = () => 0.999999; // every draw fails: the stalk fails
      const rFail = Game.villagerHuntResolve(hunterVid, 1.0);
      check('AK hunt-fail-grants-nothing', (rFail && rFail.kcal === 0) && fxOf(hunterVid, 'butcher') === 1 && remOf(hunterVid, 'butcher') === 0,
        `fail kcal=${rFail && rFail.kcal}, butcher xp ${fxOf(hunterVid, 'butcher')}, carry ${remOf(hunterVid, 'butcher')}`);
    } finally {
      Math.random = _rnd;
    }
  } catch (e) {
    check('AE rack-one-batch-no-xp-carry-one', false, 'event proofs threw: ' + (e && e.message) + '\n' + (e && e.stack || ''));
  }

  // (LIVE) det-gate: r127 driver vs r118 driver on 5d seed 2101
  // (HUNTSTAFF=2) — funnel keys identical (driver neutrality). The
  // practice snapshots are excluded: the r127 fallback is SUPPOSED to
  // change dEnd foodXp values where the wrapper read disagrees with the
  // live record. Convo files are excluded: the header tag differs by
  // construction.
  (function detGate() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r127-detgate-'));
    try {
      const run = (driver, tag) => {
        const env = Object.assign({}, process.env, { SEEDS: '2101', DAYS: '5', TAG: tag, EVID: dir, HUNTSTAFF: '2' });
        execFileSync(process.execPath, [driver], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
        return JSON.parse(fs.readFileSync(path.join(dir, `journey-establishment-${tag}-seed2101.json`), 'utf8'));
      };
      let a, b;
      try { a = run(DRIVER_R118, 'r118-detgate'); } catch (e) { check('AL det-gate-r118-runs', false, 'r118 driver exit/timeout: ' + (e && e.message)); return; }
      try { b = run(DRIVER, 'r127-detgate'); } catch (e) { check('AL det-gate-r118-runs', false, 'r127 driver exit/timeout: ' + (e && e.message)); return; }
      check('AL det-gate-drivers-run', !!a && !!b);
      const keys = ['endDay', 'aliveEnd', 'aliveAt40', 'waveReached', 'pantryKcalEnd'];
      const diffs = [];
      for (const k of keys) if (a[k] !== b[k]) diffs.push(`${k}: r118=${a[k]} r127=${b[k]}`);
      if (JSON.stringify(a.guardrails) !== JSON.stringify(b.guardrails)) diffs.push('guardrails differ');
      if (JSON.stringify(a.deaths) !== JSON.stringify(b.deaths)) diffs.push('deaths differ');
      if (JSON.stringify(a.daily) !== JSON.stringify(b.daily)) diffs.push('daily rows differ');
      if (JSON.stringify((a.huntStaff || {}).assignments) !== JSON.stringify((b.huntStaff || {}).assignments)) diffs.push('huntStaff.assignments differ');
      check('AM det-gate-funnel-identical', diffs.length === 0, diffs.join('; ') || 'endDay/alive/pantry/deaths/daily/huntStaff identical');
      check('AN det-gate-snapshots-present', !!b.practice && !!b.practice.d1 && b.practice.d1.snap.length > 0 && !!b.practice.dEnd,
        `practice keys=${Object.keys(b.practice || {})}`);
    } finally {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    }
  })();

  finish();
})();

function finish() {
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
