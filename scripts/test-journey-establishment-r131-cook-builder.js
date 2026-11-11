#!/usr/bin/env node
// test-journey-establishment-r131-cook-builder.js — proof test for the r131
// ladder's-missing-rungs fix (journey-establishment r131 2026-11-11).
//
// r128 judged dial (a) GO but left the standing gap: every specialist move
// is still through preserving and butchering — cook, spotter and builder
// move nobody (foodXp totals preserver 399 / butcher 71 / rest 0). The
// diagnosis (code, verified pre-run): routine-work grant sites exist ONLY
// for butcher (hunt kill) and preserver (rack batch). The cook assignment
// resolves ~2x/day/seed doing haven cooking + rack work, but ALL its XP
// lands in preserver; cook XP stays 0. Mend is the only build-adjacent
// villager work and is never assigned by the competent policy (0
// resolutions on the r128 panel). Spotter has no effect anywhere
// ("future: faster ID") and no work site.
//
// The fix (src/js/game.js, resolveOneAssignment only):
//   cook: 1 foodXp['cook'] rep per cook resolution via grantFoodXpCredit
//         (the work is the meal, not the racks — fires whether or not any
//         batch preserved; the r128 dial's above-rung 2:1 brake applies),
//         CAPPED at the first resolution per villager per day (foodXpDay)
//         — the uncapped pilot raced (5 cooks hit skill 3 in 42 days).
//   mend: 1 foodXp['builder'] rep per mend resolution via grantFoodXpCredit,
//         same per-day cap.
//   spotter: NO grant site — granting XP toward a skill that does nothing
//         would be fake progress (guarded by Q1e).
//   driver: layers withDelegate under withHuntStaff so mend is actually
//         assigned (crafters -> mend; skips villagers who already hold an
//         assignment, so hunt staffing is untouched).
// The rung (5/15/30) and askSpecialist (+1) are unchanged; no threshold,
// bar, price, or gate change.
//
// This test proves the fix end to end:
//   source : cook + mend sites call the helper; preserver/butcher sites
//            still call it; NO spotter grant site exists; the helper is
//            unchanged (first-rung headroom + 2:1 above); askSpecialist
//            still grants +1; the rung is still 5/15/30; the driver
//            layers withDelegate under withHuntStaff and logs cook XP +
//            mend resolutions.
//   live events (real duty resolutions on one harness-loaded Game):
//            cook resolution -> +1 cook XP (below the rung) and preserver
//            still fires per batch; above the rung (XP pinned at 5) ->
//            +0 cook XP, carry 1; mend resolution -> +1 builder XP;
//            above the rung -> +0, carry 1; tend/teach grant nothing;
//            forage resolution grants no spotter XP; cook/builder rungs
//            (5 -> 1, 15 -> 2, 30 -> 3) through the helper.
//   analyzer: synthetic corpora prove the Q1a–Q1e verdict lines (GO at
//            cook 4/16 + builder 2/16 + pace03 cook+builder 1 +
//            preserver/butcher 8/16 + spotter 0; NO-GO on the Q1c pace
//            bar at pace03 5; UNTESTED when BEFORE already shows a cook
//            move) and the Q2 denominator + Q3 null-line checks.
//   det-gate: the r131 driver run twice on 5d seed 2301 (HUNTSTAFF=2)
//            reproduces byte-identical funnel keys AND practice snapshots
//            AND cook/mend logs (the delegate layer is deterministic
//            under the seeded harness); plus a fix-isolation check: a
//            cook resolution with the helper stubbed to skip 'cook'
//            produces byte-identical pantry/gives output — only foodXp
//            differs, so the grant's only effect is the XP credit.
//
// Usage: node scripts/test-journey-establishment-r131-cook-builder.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r131-20261111.py');
const DRIVER = path.join(__dirname, 'journey-establishment-r131-20261111.js');
const GAME_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
const FOOD_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'food.js'), 'utf8');
const DRIVER_SRC = fs.readFileSync(DRIVER, 'utf8');

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
check('B cook-site-calls-helper', /grantFoodXpCredit\(_cp, 'cook', 1\)/.test(GAME_SRC));
check('C mend-site-calls-helper', /grantFoodXpCredit\(_mp, 'builder', 1\)/.test(GAME_SRC));
check('D preserver-site-still-calls-helper', /grantFoodXpCredit\(person, 'preserver', n\)/.test(GAME_SRC));
check('E butcher-site-still-calls-helper', /grantFoodXpCredit\(_hp, 'butcher', 1\)/.test(GAME_SRC));
check('F no-spotter-grant-site', !/grantFoodXpCredit\([^)]*'spotter'/.test(GAME_SRC));
check('G askspecialist-still-plus-one', /src\.foodXp\[task\] = \(src\.foodXp\[task\] \|\| 0\) \+ 1/.test(FOOD_SRC));
check('H rung-still-5-15-30', /xp >= 30 \? 3 : xp >= 15 \? 2 : 1/.test(FOOD_SRC));
check('I driver-layers-delegate-under-huntstaff', /withHuntStaff\(withDelegate\(competent, 'competent-delegate'\), 'competent-hunt'\)/.test(DRIVER_SRC));
check('J driver-logs-cook-xp-and-mend', /fxCookBefore/.test(DRIVER_SRC) && /fxCookAfter/.test(DRIVER_SRC) &&
  /mendLog/.test(DRIVER_SRC) && /fxBuilderBefore/.test(DRIVER_SRC) && /fxBuilderAfter/.test(DRIVER_SRC));
check('J2 cook-grant-capped-per-day', /foodXpDay\.cook !== _cday/.test(GAME_SRC) && /foodXpDay\.cook = _cday/.test(GAME_SRC));
check('J3 mend-grant-capped-per-day', /foodXpDay\.builder !== _mday/.test(GAME_SRC) && /foodXpDay\.builder = _mday/.test(GAME_SRC));

// --- analyzer synthetic corpora (r115 pattern: temp dirs, removed after) ---
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const SEEDS16 = [2301, 2302, 2303, 2304, 2305, 2306, 2307, 2308, 2309, 2310, 2311, 2312, 2313, 2314, 2315, 2316];
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
  return { seed, run: 'r131-after', days: 42, endDay: 43, gameOver: false, startCensus: [],
    holdingsStart: [], holdingsEnd: [], practice: practice || { d1: null, d14: null, d28: null, dEnd: null },
    playerAbilitiesEnd: [], aliveAt40: 8, aliveEnd: 8, waveReached: 1, pantryKcalEnd: 20000,
    deaths: [{ day: 20, who: 'X', cause: 'monster', kind: 'monster', player: false }],
    census: [], daily: dailyRows(), matTrace: [], craftLog: [], npcCraftLog: [],
    huntLog: [], careLog: [], healerLog: [], treatLog: [], cookLog: [], mendLog: [],
    huntStaff: { layerOn: true, prepOn: true, assignments: 0, assignLog: [], refusalLog: [], woundLog: [], prepLog: [] },
    huntEligEnd: [], huntEligEver: [], leanTrace: [],
    guardrails: { deaths: 1, popAlive: 8, pantryKcal: 20000 }, c3: { starvationDeaths: 0 },
    playerPackArmor: [], playerEquipped: [], playerRecipes: {},
    contestTele: [], contestCounts: {}, waveSysLines: [], teleTypes: {}, skillRows: [],
    skillCounts: {}, teachDays: [], teleAll: teleAll || [], playerCodexSkills: {}, avCraftEnd: {} };
}
function convoTxt() {
  return '=== r131-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\n(ended by engine)\nclosing: goodbye\n';
}
function corpusSeed(dir, tag, seed, practice, teleAll, convo) {
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-seed${seed}.json`),
    JSON.stringify(baseSeed(seed, practice, teleAll)));
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-convo-seed${seed}.txt`), convo !== undefined ? convo : convoTxt());
}
function corpus(dir, seeds, mkPractice, mkTele, mkConvo, mkBeforePractice) {
  for (const seed of seeds) {
    const practice = mkPractice(seed);
    const beforePractice = mkBeforePractice ? mkBeforePractice(seed) : { d1: null, d14: null, d28: null, dEnd: null };
    corpusSeed(dir, 'r131-before', seed, beforePractice, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r131-before') : undefined);
    corpusSeed(dir, 'r131-after', seed, practice, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r131-after') : undefined);
  }
}
function runAnalyzer(dir) {
  return execFileSync('python3', [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r131-cook-builder-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
// BEFORE practice shared by the Q1 synthetics: every seed cooked (practice
// reps > 0) but nobody moved on BEFORE — the gap is work-without-XP.
function beforePracticeWithCook(seed) {
  const v = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
  return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
}
const COOK_SEEDS = [2301, 2302, 2303, 2304];
const BUILDER_SEEDS = [2305, 2306];
const PB_SEEDS = [2301, 2302, 2303, 2304, 2305, 2306, 2307, 2308];

// (K) Q1 GO: cook moves on 4/16, builder on 2/16, pace03 cook+builder 1
// (one cook racer 0->3 at 30 XP on 2301), preserver/butcher moves on
// 8/16, spotter foodXp 0, BEFORE-validity met -> GO.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
    const moves = {};
    if (COOK_SEEDS.includes(seed)) moves.cook = seed === 2301 ? { spec: 3, xp: 30 } : { spec: 1, xp: 5 };
    if (BUILDER_SEEDS.includes(seed)) moves.builder = { spec: 1, xp: 5 };
    if (PB_SEEDS.includes(seed)) moves.preserver = { spec: 1, xp: 5 };
    const specEnd = {}, foodEnd = {};
    for (const t of SPECS) { specEnd[t] = (moves[t] || {}).spec || 0; foodEnd[t] = (moves[t] || {}).xp || 0; }
    const v1e = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, specEnd, foodEnd, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  corpus(dir, SEEDS16, mk, null, null, beforePracticeWithCook);
  const out = runAnalyzer(dir);
  check('K q1-go-cook-builder', /Q1 verdict: GO \(cook 4\/16, builder 2\/16, pace03 cook\+builder 1, preserver\/butcher 8\/16, spotter 0\)/.test(out), out.slice(out.indexOf('Q1 verdict:')));
  check('L q1-before-validity-valid', /BEFORE-VALIDITY: BEFORE cook moves=0 \(must be 0\), BEFORE seeds with cook practice>0=16\/16 \(bar >=12\) -> VALID/.test(out), out);
});

// (M) Q1c NO-GO: moves hold but FIVE cook/builder villagers reach skill 3
// from 0 (bar <=4) -> NO-GO on the pace leg.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
    if (seed === 2301) {
      const racers = ['Bo', 'Cy', 'De', 'Em', 'Fa'].map((nm, i) =>
        villager('v' + (i + 2), nm, 'forager', {}, {}, { cook: 0 }, { cook: 0 }, []));
      const racersEnd = ['Bo', 'Cy', 'De', 'Em', 'Fa'].map((nm, i) =>
        villager('v' + (i + 2), nm, 'forager', {}, {}, { cook: 3 }, { cook: 30 }, []));
      const v1e = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { preserver: 1 }, { preserver: 5 }, []);
      return { d1: snap(1, [v1, ...racers]), d14: snap(14, [v1, ...racers]), d28: snap(28, [v1, ...racers]), dEnd: snap(43, [v1e, ...racersEnd]) };
    }
    const moves = {};
    if (COOK_SEEDS.includes(seed)) moves.cook = { spec: 1, xp: 5 };
    if (BUILDER_SEEDS.includes(seed)) moves.builder = { spec: 1, xp: 5 };
    if (PB_SEEDS.includes(seed)) moves.preserver = { spec: 1, xp: 5 };
    const specEnd = {}, foodEnd = {};
    for (const t of SPECS) { specEnd[t] = (moves[t] || {}).spec || 0; foodEnd[t] = (moves[t] || {}).xp || 0; }
    const v1e = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, specEnd, foodEnd, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  corpus(dir, SEEDS16, mk, null, null, beforePracticeWithCook);
  const out = runAnalyzer(dir);
  check('M q1c-pace-five-is-NO-GO', /Q1 verdict: NO-GO \(Q1c pace03 5 > 4\)/.test(out), out.slice(out.indexOf('Q1 verdict:')));
});

// (N) BEFORE-validity UNTESTED: BEFORE already shows a cook move, so the
// diagnosis is wrong and the run is UNTESTED, not GO.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
    const v1e = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 1 }, { cook: 5 }, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  const beforeWithMove = (seed) => {
    const v = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
    const ve = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 1 }, { cook: 5 }, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [ve]) };
  };
  corpus(dir, SEEDS16, mk, null, null, beforeWithMove);
  const out = runAnalyzer(dir);
  check('N q1-before-move-is-untested', /Q1 verdict: UNTESTED \(BEFORE-validity failed/.test(out), out.slice(out.indexOf('Q1 verdict:')));
});

// (O) Q2 denominator fix, PASS shape: one spoken invite answered + one
// pending-at-start answer (no spoken line) + zero unanswered -> offered
// 2, answered 2 -> PASS.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoPass = (seed, tag) => {
    if (seed !== 2301 || tag !== 'r131-after') return convoTxt();
    return '=== r131-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: "Walk my trap line with me?"\nYOU: [betrayal:accept]\nTHEM: "Good. Bring your boots."\n-- Bo (v2) occ=hunter --\nOPENING: hello\nYOU: [betrayal:decline]\nTHEM: "Another time, then."\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoPass);
  const out = runAnalyzer(dir);
  check('O q2-denominator-pending-counts', /Q2 invitations: spoken=1 answers accept=1 decline=1 unanswered-spoken=0 offered=2/.test(out), out);
  check('P q2-pass-at-100pct', /Q2 verdict: PASS \(answered 2\/2 = 100%, bar >=80%\)/.test(out), out);
});

// (Q) Q2 denominator fix, FAIL shape: one spoken invite answered + one
// spoken invite followed by silence -> offered 2, answered 1 -> FAIL.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoFail = (seed, tag) => {
    if (seed !== 2301 || tag !== 'r131-after') return convoTxt();
    return '=== r131-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: "Walk my trap line with me?"\nYOU: [betrayal:accept]\nTHEM: "Good. Bring your boots."\n-- Bo (v2) occ=hunter --\nOPENING: hello\nTHEM: "Come see what I found?"\nYOU: [silence]\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoFail);
  const out = runAnalyzer(dir);
  check('Q q2-silence-counts-unanswered', /Q2 invitations: spoken=2 answers accept=1 decline=0 unanswered-spoken=1 offered=2/.test(out), out);
  check('R q2-fail-at-50pct', /Q2 verdict: FAIL \(answered 1\/2, bar >=80%\)/.test(out), out);
});

// (S) Q3 null lines: a THEM: (null) line in the after panel fails Q3.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoNull = (seed, tag) => {
    if (seed !== 2301 || tag !== 'r131-after') return convoTxt();
    return '=== r131-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: (null)\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoNull);
  const out = runAnalyzer(dir);
  check('S q3-null-line-fails', /Q3 verdict: FAIL \(1 null THEM lines/.test(out), out);
});

// (LIVE) helper + rung + event proofs on one harness-loaded Game.
(async () => {
  const { loadGame, setupGame } = require('./sim-harness');
  let Game;
  try {
    ({ Game } = await loadGame({ seed: 2301, mode: 'mvc', fullTelemetry: false }));
    await setupGame(Game);
  } catch (e) {
    check('T live-game-loads', false, 'loadGame/setupGame: ' + (e && e.message));
    finish();
    return;
  }
  check('T live-game-loads', !!Game && typeof Game.specialistSkill === 'function');

  // Rung through the helper for the new tasks: 5 -> 1, 15 -> 2, 30 -> 3
  // (forager, no occupation skill — the self-taught ladder).
  try {
    const r = { formerOccupation: 'forager', foodXp: {}, foodXpRemainder: {} };
    Game.grantFoodXpCredit(r, 'cook', 5);
    check('U rung-cook-five-skill-one', r.foodXp.cook === 5 && Game.specialistSkill(r, 'cook') === 1,
      `xp=${r.foodXp.cook} skill=${Game.specialistSkill(r, 'cook')}`);
    Game.grantFoodXpCredit(r, 'cook', 20);
    check('V rung-cook-twentyfive-skill-two', r.foodXp.cook === 15 && Game.specialistSkill(r, 'cook') === 2,
      `xp=${r.foodXp.cook} skill=${Game.specialistSkill(r, 'cook')}`);
    Game.grantFoodXpCredit(r, 'cook', 30);
    check('W rung-cook-fiftyfive-skill-three', r.foodXp.cook === 30 && Game.specialistSkill(r, 'cook') === 3,
      `xp=${r.foodXp.cook} skill=${Game.specialistSkill(r, 'cook')}`);
    const b = { formerOccupation: 'forager', foodXp: {}, foodXpRemainder: {} };
    Game.grantFoodXpCredit(b, 'builder', 5);
    check('X rung-builder-five-skill-one', b.foodXp.builder === 5 && Game.specialistSkill(b, 'builder') === 1,
      `xp=${b.foodXp.builder} skill=${Game.specialistSkill(b, 'builder')}`);
  } catch (e) {
    check('U rung-cook-five-skill-one', false, 'rung checks threw: ' + (e && e.message));
  }

  // Event proofs (real duty resolutions — state writes only on this test
  // Game, discarded after). Each case resets the test villager's XP +
  // carry first, so cases are independent despite the carry.
  try {
    const v = Game.state.village || {};
    // The cap is per villager per DAY: cases advance scholar.day so each
    // grant case runs on a fresh day, and the cap itself is tested by
    // resolving twice on the same day (Y2/AB2) and again the next day.
    const curDay = () => (Game.state.scholar || {}).day || 1;
    const setDay = (d) => { Game.state.scholar.day = d; };
    let day = curDay();
    const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
    const cookVid = living[0];
    const mendVid = living[1] || living[0];
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
    const preservedCount = () => ((Game.state.village.pantry || []).filter(it => it && it.foodState === 'preserved').length);
    const filterPantry = () => {
      const vv = Game.state.village;
      const d = curDay();
      vv.pantry = (vv.pantry || []).filter(it => !it || it.foodState === 'preserved' || it.foodState === 'rendered' || (it.spoilDay != null && it.spoilDay - d > 2));
    };
    // (Y) Cook resolution, no rack work -> +1 cook XP, carry 0. The meal
    // itself is the work: the grant fires whether or not any batch preserved.
    setDay(day);
    resetFx(cookVid, 'cook');
    filterPantry();
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Y cook-resolution-grants-one-cook-xp', fxOf(cookVid, 'cook') === 1 && remOf(cookVid, 'cook') === 0,
      `cook xp ${fxOf(cookVid, 'cook')}, carry ${remOf(cookVid, 'cook')} (want +1 xp, carry 0)`);
    // (Y2) Second cook resolution THE SAME day -> +0 (per-day cap).
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Y2 cook-second-same-day-grants-nothing', fxOf(cookVid, 'cook') === 1 && remOf(cookVid, 'cook') === 0,
      `cook xp ${fxOf(cookVid, 'cook')}, carry ${remOf(cookVid, 'cook')} (want still 1 xp, carry 0)`);
    // (Y3) Cook resolution the NEXT day -> +1 again (cap resets daily).
    setDay(day + 1); day = curDay();
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Y3 cook-next-day-grants-again', fxOf(cookVid, 'cook') === 2 && remOf(cookVid, 'cook') === 0,
      `cook xp ${fxOf(cookVid, 'cook')}, carry ${remOf(cookVid, 'cook')} (want 2 xp, carry 0)`);
    // (Z) Cook resolution WITH one batch preserved -> preserver +1 AND
    // cook +1: both grants fire from the same resolution (fresh day).
    setDay(day + 1); day = curDay();
    resetFx(cookVid, 'cook');
    resetFx(cookVid, 'preserver');
    v.pantry = v.pantry || [];
    v.pantry.push({ name: 'Test haunch', kcalEach: 1000, units: 10, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
    const p0 = preservedCount();
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Z cook-resolution-with-batch-grants-both', preservedCount() === p0 + 1 && fxOf(cookVid, 'preserver') === 1 && fxOf(cookVid, 'cook') === 1,
      `preserved ${p0}->${preservedCount()}, preserver xp ${fxOf(cookVid, 'preserver')}, cook xp ${fxOf(cookVid, 'cook')} (want +1/+1/+1)`);
    // (AA) Cook resolution ABOVE the rung (cook XP pinned at 5) -> +0 XP,
    // carry 1: the dial's 2:1 brake applies to the new grant too (fresh
    // day, so the cap is not what blocks it — the dial is).
    setDay(day + 1); day = curDay();
    setFx(cookVid, 'cook', 5, 0);
    filterPantry();
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('AA cook-above-rung-no-xp-carry-one', fxOf(cookVid, 'cook') === 5 && remOf(cookVid, 'cook') === 1,
      `cook xp ${fxOf(cookVid, 'cook')}, carry ${remOf(cookVid, 'cook')} (want +0 xp, carry 1)`);
    // (AB) Mend resolution -> +1 builder XP, carry 0.
    resetFx(mendVid, 'builder');
    Game.resolveOneAssignment(mendVid, { task: 'mend' });
    check('AB mend-resolution-grants-one-builder-xp', fxOf(mendVid, 'builder') === 1 && remOf(mendVid, 'builder') === 0,
      `builder xp ${fxOf(mendVid, 'builder')}, carry ${remOf(mendVid, 'builder')} (want +1 xp, carry 0)`);
    // (AB2) Second mend THE SAME day -> +0 (per-day cap).
    Game.resolveOneAssignment(mendVid, { task: 'mend' });
    check('AB2 mend-second-same-day-grants-nothing', fxOf(mendVid, 'builder') === 1 && remOf(mendVid, 'builder') === 0,
      `builder xp ${fxOf(mendVid, 'builder')}, carry ${remOf(mendVid, 'builder')} (want still 1 xp, carry 0)`);
    // (AB3) Mend the NEXT day -> +1 again.
    setDay(day + 1); day = curDay();
    Game.resolveOneAssignment(mendVid, { task: 'mend' });
    check('AB3 mend-next-day-grants-again', fxOf(mendVid, 'builder') === 2 && remOf(mendVid, 'builder') === 0,
      `builder xp ${fxOf(mendVid, 'builder')}, carry ${remOf(mendVid, 'builder')} (want 2 xp, carry 0)`);
    // (AC) Mend resolution ABOVE the rung -> +0 XP, carry 1 (fresh day).
    setDay(day + 1); day = curDay();
    setFx(mendVid, 'builder', 5, 0);
    Game.resolveOneAssignment(mendVid, { task: 'mend' });
    check('AC mend-above-rung-no-xp-carry-one', fxOf(mendVid, 'builder') === 5 && remOf(mendVid, 'builder') === 1,
      `builder xp ${fxOf(mendVid, 'builder')}, carry ${remOf(mendVid, 'builder')} (want +0 xp, carry 1)`);
    // (AD) Tend / teach grant NOTHING to cook or builder.
    const b0 = fxOf(mendVid, 'builder'), c0 = fxOf(mendVid, 'cook');
    Game.resolveOneAssignment(mendVid, { task: 'tend' });
    Game.resolveOneAssignment(mendVid, { task: 'teach' });
    check('AD tend-teach-grant-nothing', fxOf(mendVid, 'builder') === b0 && fxOf(mendVid, 'cook') === c0,
      `builder ${b0}->${fxOf(mendVid, 'builder')}, cook ${c0}->${fxOf(mendVid, 'cook')}`);
    // (AE) Forage resolution grants NO spotter XP (no fake progress).
    resetFx(cookVid, 'spotter');
    Game.resolveOneAssignment(cookVid, { task: 'forage' });
    check('AE forage-grants-no-spotter-xp', fxOf(cookVid, 'spotter') === 0 && !((Game.getPerson(cookVid) || {}).foodXp || {}).spotter,
      `spotter xp ${fxOf(cookVid, 'spotter')} (want 0, no write)`);
    // (AF) FIX ISOLATION: the same cook resolution with the helper stubbed
    // to skip 'cook' produces byte-identical pantry + gives output — only
    // foodXp differs. The grant's only effect is the XP credit.
    try {
      const _rnd = Math.random;
      Math.random = () => 0.5;
      resetFx(cookVid, 'cook');
      resetFx(cookVid, 'preserver');
      filterPantry();
      v.pantry.push({ name: 'Test haunch ISO', kcalEach: 1000, units: 10, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      const pantryBefore = JSON.stringify(v.pantry);
      const givesBefore = ((v.gives || {})[cookVid]) || 0;
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      const pantryLive = JSON.stringify(v.pantry);
      const givesLive = ((v.gives || {})[cookVid]) || 0;
      const fxLive = fxOf(cookVid, 'cook');
      // restore the pre-resolution state, stub the helper, re-run.
      v.pantry = JSON.parse(pantryBefore);
      v.gives[cookVid] = givesBefore;
      resetFx(cookVid, 'cook');
      resetFx(cookVid, 'preserver');
      const _grant = Game.grantFoodXpCredit.bind(Game);
      Game.grantFoodXpCredit = function (person, task, units) {
        if (task === 'cook') return (person.foodXp || {})[task] || 0;
        return _grant(person, task, units);
      };
      try { Game.resolveOneAssignment(cookVid, { task: 'cook' }); } finally { Game.grantFoodXpCredit = _grant; }
      const pantryStub = JSON.stringify(v.pantry);
      const givesStub = ((v.gives || {})[cookVid]) || 0;
      const fxStub = fxOf(cookVid, 'cook');
      Math.random = _rnd;
      check('AF fix-isolation-pantry-gives-identical', pantryLive === pantryStub && givesLive === givesStub && fxLive === 1 && fxStub === 0,
        `pantry identical=${pantryLive === pantryStub} gives ${givesLive} vs ${givesStub} cook xp live ${fxLive} vs stub ${fxStub}`);
    } catch (e) { check('AF fix-isolation-pantry-gives-identical', false, 'isolation check threw: ' + (e && e.message)); }
  } catch (e) {
    check('Y cook-resolution-grants-one-cook-xp', false, 'event proofs threw: ' + (e && e.message) + '\n' + (e && e.stack || ''));
  }

  // (LIVE) det-gate: the r131 driver run TWICE on 5d seed 2301
  // (HUNTSTAFF=2) — byte-identical JSON outputs (funnel keys, practice
  // snapshots, cook/mend logs, deaths, daily, guardrails). The delegate
  // layer draws only seeded RNG, so the same seed reproduces exactly.
  // Convo files are excluded: the header tag differs by construction.
  (function detGate() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r131-detgate-'));
    try {
      const run = (tag) => {
        const env = Object.assign({}, process.env, { SEEDS: '2301', DAYS: '5', TAG: tag, EVID: dir, HUNTSTAFF: '2' });
        execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
        return JSON.parse(fs.readFileSync(path.join(dir, `journey-establishment-${tag}-seed2301.json`), 'utf8'));
      };
      let a, b;
      try { a = run('r131-detgate-a'); } catch (e) { check('AG det-gate-first-run', false, 'first driver run exit/timeout: ' + (e && e.message)); return; }
      try { b = run('r131-detgate-b'); } catch (e) { check('AG det-gate-first-run', false, 'second driver run exit/timeout: ' + (e && e.message)); return; }
      check('AG det-gate-both-runs', !!a && !!b);
      const strip = (o) => { const c = Object.assign({}, o); delete c.run; return c; };
      check('AH det-gate-outputs-identical', JSON.stringify(strip(a)) === JSON.stringify(strip(b)),
        'two runs of the same driver/seed produce byte-identical JSON (minus the run tag)');
      const keys = ['endDay', 'aliveEnd', 'aliveAt40', 'waveReached', 'pantryKcalEnd'];
      const diffs = [];
      for (const k of keys) if (a[k] !== b[k]) diffs.push(`${k}: run-a=${a[k]} run-b=${b[k]}`);
      if (JSON.stringify(a.practice) !== JSON.stringify(b.practice)) diffs.push('practice snapshots differ');
      if (JSON.stringify(a.cookLog) !== JSON.stringify(b.cookLog)) diffs.push('cookLog differs');
      if (JSON.stringify(a.mendLog) !== JSON.stringify(b.mendLog)) diffs.push('mendLog differs');
      if (JSON.stringify(a.deaths) !== JSON.stringify(b.deaths)) diffs.push('deaths differ');
      if (JSON.stringify(a.guardrails) !== JSON.stringify(b.guardrails)) diffs.push('guardrails differ');
      check('AI det-gate-funnel-practice-logs-identical', diffs.length === 0, diffs.join('; ') || 'funnel/practice/cookLog/mendLog/deaths/guardrails identical');
      check('AJ det-gate-snapshots-present', !!b.practice && !!b.practice.d1 && b.practice.d1.snap.length > 0 && !!b.practice.dEnd,
        `practice keys=${Object.keys(b.practice || {})}`);
      check('AK det-gate-mend-log-present', Array.isArray(b.mendLog), `mendLog is ${Array.isArray(b.mendLog) ? 'an array of ' + b.mendLog.length : typeof b.mendLog}`);
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
