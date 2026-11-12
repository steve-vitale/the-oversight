#!/usr/bin/env node
// test-journey-establishment-r133-preserver-unitcap.js — proof test for the
// r133 per-day UNIT cap on the preserver grant (journey-establishment
// r133 2026-11-12).
//
// r132 judged the call-level cap NO-GO: it cuts the race but does not stop
// it — Carmine the blacksmith (seed 2403) raced preserver 0->3 on 31 XP
// on the AFTER panel because she preserves ~3 batches on the FIRST
// resolution of most days. The fuel is units per day, not resolutions per
// day. The next dial, named by r132's metric review: only the first N
// batches' worth of XP per villager per day counts. N=2 is pinned by the
// r132 BEFORE panel cookLog simulation (replay the grant math over the
// fx deltas, ±1 unit inversion bounded both ways): N=2 stops the race on
// both bounds (pace03 0), leaves moves 11/16 (identical to BEFORE), and
// still lets the most dedicated daily preserver reach skill 2 (Carmine
// 25 XP); N=1 caps the leg's best preserver at skill 1 (top-braking, the
// r127 flat-halving failure mode); N=3 flips the verdict on inversion
// noise (pace03 0 low / 1 high) and is not a safe dial. The N=99
// simulation reproduces r132's BEFORE exactly (pace03 2, moves 11), so
// the inversion is validated.
//
// The fix (src/js/game.js, preserver grant site only):
//   only the first 2 units of preserver XP per villager per day count,
//   tracked as foodXpDay.preserverUnits (same field family as the
//   cook/builder caps, reset when the day rolls). A resolution preserving
//   n batches grants min(n, 2 - alreadyGrantedToday) units' worth through
//   grantFoodXpCredit; later batches that day still preserve food — only
//   the specialist XP is capped. Keyed to the GRANT event (inside
//   if (n > 0)): a first resolution that preserves nothing leaves the
//   day's budget open. The rung (5/15/30) and askSpecialist (+1) are
//   unchanged; no threshold, bar, price, or gate change.
//
// This test proves the fix end to end:
//   source : the preserver site caps units at 2/day via
//            foodXpDay.preserverUnits; the helper is unchanged (first-rung
//            headroom + 2:1 above); cook/builder per-day caps still
//            present; butcher site still grants 1 per kill; NO spotter
//            grant site exists; the rung is still 5/15/30; the driver
//            layers withDelegate under withHuntStaff and logs the units
//            fields (fxPreserverUnitsBefore/After).
//   live events (real duty resolutions on one harness-loaded Game):
//            a 3-batch resolution grants 2 units' worth (+2 XP below the
//            rung); a second 3-batch resolution THE SAME day grants 0; the
//            NEXT day grants again; a 1-batch resolution grants 1; above
//            the rung (XP pinned at 5) a 3-batch resolution grants +1 XP
//            (2 units at 2:1), carry 0; a resolution preserving nothing
//            leaves the day's budget open; cook grant unaffected; butcher
//            grant unaffected (helper-level); fix isolation: stubbing the
//            helper to skip 'preserver' leaves pantry/gives identical.
//   analyzer: synthetic corpora prove the Q1a–Q1e verdict lines (GO at
//            preserver pace03 0 + moves 11/16 + butcher within 2 of
//            control + cook 15/16 + builder 3/16 + pace03 cook+builder 0 +
//            spotter 0 + cap max 2 units/day; NO-GO on the Q1a pace bar;
//            NO-GO on the CAP CHECK at 3 units/day; UNTESTED when BEFORE
//            pace03 is 0) and the Q2 denominator + Q3 null-line checks.
//   det-gate: the r133 driver run twice on 5d seed 2501 (HUNTSTAFF=2)
//            reproduces byte-identical funnel keys AND practice snapshots
//            AND cook/mend logs (the delegate layer is deterministic
//            under the seeded harness); plus a fix-isolation check: a
//            cook resolution with the helper stubbed to skip 'preserver'
//            produces byte-identical pantry/gives output — only foodXp
//            differs, so the grant's only effect is the XP credit.
//
// Usage: node scripts/test-journey-establishment-r133-preserver-unitcap.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r133-20261112.py');
const DRIVER = path.join(__dirname, 'journey-establishment-r133-20261112.js');
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
check('B preserver-site-caps-units-two-per-day', /foodXpDay\.preserverUnits/.test(GAME_SRC) &&
  /Math\.min\(n,/.test(GAME_SRC) && /2 - \(person\.foodXpDay\.preserverUnits/.test(GAME_SRC));
check('B2 preserver-site-resets-units-on-day-roll', /foodXpDay\.preserver !== _pday/.test(GAME_SRC) &&
  /foodXpDay\.preserverUnits = 0/.test(GAME_SRC));
check('B3 preserver-site-grants-capped-units-only', /grantFoodXpCredit\(person, 'preserver', _grant\)/.test(GAME_SRC));
check('C cook-site-still-capped-per-day', /foodXpDay\.cook !== _cday/.test(GAME_SRC) && /grantFoodXpCredit\(_cp, 'cook', 1\)/.test(GAME_SRC));
check('D mend-site-still-capped-per-day', /foodXpDay\.builder !== _mday/.test(GAME_SRC) && /grantFoodXpCredit\(_mp, 'builder', 1\)/.test(GAME_SRC));
check('E butcher-site-still-calls-helper-one', /grantFoodXpCredit\(_hp, 'butcher', 1\)/.test(GAME_SRC));
check('F no-spotter-grant-site', !/grantFoodXpCredit\([^)]*'spotter'/.test(GAME_SRC));
check('G askspecialist-still-plus-one', /src\.foodXp\[task\] = \(src\.foodXp\[task\] \|\| 0\) \+ 1/.test(FOOD_SRC));
check('H rung-still-5-15-30', /xp >= 30 \? 3 : xp >= 15 \? 2 : 1/.test(FOOD_SRC));
check('I driver-layers-delegate-under-huntstaff', /withHuntStaff\(withDelegate\(competent, 'competent-delegate'\), 'competent-hunt'\)/.test(DRIVER_SRC));
check('J driver-logs-cook-xp-and-mend', /fxCookBefore/.test(DRIVER_SRC) && /fxCookAfter/.test(DRIVER_SRC) &&
  /mendLog/.test(DRIVER_SRC) && /fxBuilderBefore/.test(DRIVER_SRC) && /fxBuilderAfter/.test(DRIVER_SRC));
check('J2 driver-logs-preserver-units', /fxPreserverUnitsBefore/.test(DRIVER_SRC) && /fxPreserverUnitsAfter/.test(DRIVER_SRC));

// --- analyzer synthetic corpora (r115 pattern: temp dirs, removed after) ---
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const SEEDS16 = [2501, 2502, 2503, 2504, 2505, 2506, 2507, 2508, 2509, 2510, 2511, 2512, 2513, 2514, 2515, 2516];
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
function baseSeed(seed, practice, teleAll, cookLog, mendLog, huntLog) {
  return { seed, run: 'r133-after', days: 42, endDay: 43, gameOver: false, startCensus: [],
    holdingsStart: [], holdingsEnd: [], practice: practice || { d1: null, d14: null, d28: null, dEnd: null },
    playerAbilitiesEnd: [], aliveAt40: 8, aliveEnd: 8, waveReached: 1, pantryKcalEnd: 20000,
    deaths: [{ day: 20, who: 'X', cause: 'monster', kind: 'monster', player: false }],
    census: [], daily: dailyRows(), matTrace: [], craftLog: [], npcCraftLog: [],
    huntLog: huntLog || [], careLog: [], healerLog: [], treatLog: [], cookLog: cookLog || [], mendLog: mendLog || [],
    huntStaff: { layerOn: true, prepOn: true, assignments: 0, assignLog: [], refusalLog: [], woundLog: [], prepLog: [] },
    huntEligEnd: [], huntEligEver: [], leanTrace: [],
    guardrails: { deaths: 1, popAlive: 8, pantryKcal: 20000 }, c3: { starvationDeaths: 0 },
    playerPackArmor: [], playerEquipped: [], playerRecipes: {},
    contestTele: [], contestCounts: {}, waveSysLines: [], teleTypes: {}, skillRows: [],
    skillCounts: {}, teachDays: [], teleAll: teleAll || [], playerCodexSkills: {}, avCraftEnd: {} };
}
function convoTxt() {
  return '=== r133-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\n(ended by engine)\nclosing: goodbye\n';
}
function corpusSeed(dir, tag, seed, practice, teleAll, convo, cookLog, mendLog, huntLog) {
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-seed${seed}.json`),
    JSON.stringify(baseSeed(seed, practice, teleAll, cookLog, mendLog, huntLog)));
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-convo-seed${seed}.txt`), convo !== undefined ? convo : convoTxt());
}
function corpus(dir, seeds, mkPractice, mkTele, mkConvo, mkBeforePractice, mkCook, mkBeforeCook) {
  for (const seed of seeds) {
    const practice = mkPractice(seed);
    const beforePractice = mkBeforePractice ? mkBeforePractice(seed) : { d1: null, d14: null, d28: null, dEnd: null };
    corpusSeed(dir, 'r133-before', seed, beforePractice, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r133-before') : undefined,
      mkBeforeCook ? mkBeforeCook(seed) : [], [], []);
    corpusSeed(dir, 'r133-after', seed, practice, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r133-after') : undefined,
      mkCook ? mkCook(seed) : [], [], []);
  }
}
function runAnalyzer(dir) {
  return execFileSync('python3', [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r133-unitcap-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
// Cap rows for the AFTER panel: two granting days, 2 units then 1 unit —
// the cap's shape (max 2/day, never over). Units fields are the driver's
// live foodXpDay.preserverUnits reads; fx deltas agree with them. The
// day-10 row is a first-ever grant, so its Before read is null (the
// counter does not exist yet) — the analyzer must NOT count that as
// missing data; only a null After read is missing.
function capRowsOk(seed) {
  return [
    { day: 10, vid: 'v1', name: 'Ana', occ: 'forager', specPreserver: 0, holdsPreserveFood: false,
      preservedKcalBefore: 0, preservedKcalAfter: 300, rackLines: [], fxPreserverBefore: 0, fxPreserverAfter: 2,
      fxPreserverUnitsBefore: null, fxPreserverUnitsAfter: 2, fxCookBefore: 0, fxCookAfter: 1 },
    { day: 12, vid: 'v1', name: 'Ana', occ: 'forager', specPreserver: 0, holdsPreserveFood: false,
      preservedKcalBefore: 300, preservedKcalAfter: 400, rackLines: [], fxPreserverBefore: 2, fxPreserverAfter: 3,
      fxPreserverUnitsBefore: 0, fxPreserverUnitsAfter: 1, fxCookBefore: 1, fxCookAfter: 2 },
  ];
}
// BEFORE room rows: one day grants 4 XP from fx 0 (below the rung, 4 XP =
// 4 units — over the 2-unit cap), so the mechanism has room to bite.
function roomRowsBefore(seed) {
  return [
    { day: 10, vid: 'v1', name: 'Ana', occ: 'forager', specPreserver: 0, holdsPreserveFood: false,
      preservedKcalBefore: 0, preservedKcalAfter: 400, rackLines: [], fxPreserverBefore: 0, fxPreserverAfter: 4,
      fxPreserverUnitsBefore: null, fxPreserverUnitsAfter: null, fxCookBefore: 0, fxCookAfter: 1 },
  ];
}
// BEFORE practice shared by the Q1 synthetics: a preserver racer on 2501
// (Ana 0->3 on 37 XP — the race reproduces), butcher moves on 5 seeds
// (2501–2505), nobody else moves. The AFTER panel is judged against this
// control.
function beforePracticeQ1(seed) {
  const v = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
  if (seed === 2501) {
    const ve = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { preserver: 3, butcher: 1 }, { preserver: 37, butcher: 5 }, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [ve]) };
  }
  if (seed >= 2502 && seed <= 2505) {
    const ve = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { butcher: 1 }, { butcher: 5 }, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [ve]) };
  }
  return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
}
const PRESERVER_SEEDS = [2501, 2502, 2503, 2504, 2505, 2506, 2507, 2508, 2509, 2510, 2511];
const BUTCHER_SEEDS = [2501, 2502, 2503, 2504];
const COOK_SEEDS = [2501, 2502, 2503, 2504, 2505, 2506, 2507, 2508, 2509, 2510, 2511, 2512, 2513, 2514, 2515];
const BUILDER_SEEDS = [2501, 2502, 2503];

// (K) Q1 GO: preserver pace03 0 + moves 11/16, butcher 4/16 vs control
// 5/16 (gap 1 <= 2) pace03 0, cook 15/16, builder 3/16, pace03
// cook+builder 0, spotter 0, cap max 2 units/day -> GO.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
    const moves = {};
    if (PRESERVER_SEEDS.includes(seed)) moves.preserver = { spec: 1, xp: 5 };
    if (BUTCHER_SEEDS.includes(seed)) moves.butcher = { spec: 1, xp: 5 };
    if (COOK_SEEDS.includes(seed)) moves.cook = { spec: 1, xp: 5 };
    if (BUILDER_SEEDS.includes(seed)) moves.builder = { spec: 1, xp: 5 };
    const specEnd = {}, foodEnd = {};
    for (const t of SPECS) { specEnd[t] = (moves[t] || {}).spec || 0; foodEnd[t] = (moves[t] || {}).xp || 0; }
    const v1e = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, specEnd, foodEnd, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  corpus(dir, SEEDS16, mk, null, null, beforePracticeQ1, capRowsOk, roomRowsBefore);
  const out = runAnalyzer(dir);
  check('K q1-go-unitcap', /Q1 verdict: GO \(preserver pace03 0, preserver moves 11\/16, butcher 4\/16 vs control 5\/16 pace03 0, cook 15\/16, builder 3\/16, pace03 cook\+builder 0, spotter 0, cap max-units\/day 2\)/.test(out), out.slice(out.indexOf('Q1 verdict:')));
  check('L q1-before-validity-valid', /BEFORE-VALIDITY: BEFORE preserver pace03=1 \(must be >=1\) -> VALID/.test(out), out);
  check('L2 cap-check-line', /CAP CHECK: AFTER max granted preserver units\/villager-day: 2 \(bar <=2, days over 0\) \| BEFORE: \d+ villager-days over 2 \(the mechanism's room\)/.test(out), out);
});

// (M) Q1a NO-GO: the GO shape, but one AFTER seed still races (Ana
// preserver 0->3 on 2501) -> NO-GO on the pace bar.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
    const moves = {};
    if (PRESERVER_SEEDS.includes(seed)) moves.preserver = { spec: 1, xp: 5 };
    if (BUTCHER_SEEDS.includes(seed)) moves.butcher = { spec: 1, xp: 5 };
    if (COOK_SEEDS.includes(seed)) moves.cook = { spec: 1, xp: 5 };
    if (BUILDER_SEEDS.includes(seed)) moves.builder = { spec: 1, xp: 5 };
    if (seed === 2501) moves.preserver = { spec: 3, xp: 37 };
    const specEnd = {}, foodEnd = {};
    for (const t of SPECS) { specEnd[t] = (moves[t] || {}).spec || 0; foodEnd[t] = (moves[t] || {}).xp || 0; }
    const v1e = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, specEnd, foodEnd, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  corpus(dir, SEEDS16, mk, null, null, beforePracticeQ1, capRowsOk, roomRowsBefore);
  const out = runAnalyzer(dir);
  check('M q1a-pace-one-is-NO-GO', /Q1 verdict: NO-GO \(Q1a preserver pace03 1 != 0\)/.test(out), out.slice(out.indexOf('Q1 verdict:')));
});

// (N) CAP NO-GO: the GO shape, but one AFTER villager-day grants 3 units
// (a 3-batch resolution uncapped) -> NO-GO on the cap check.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
    const moves = {};
    if (PRESERVER_SEEDS.includes(seed)) moves.preserver = { spec: 1, xp: 5 };
    if (BUTCHER_SEEDS.includes(seed)) moves.butcher = { spec: 1, xp: 5 };
    if (COOK_SEEDS.includes(seed)) moves.cook = { spec: 1, xp: 5 };
    if (BUILDER_SEEDS.includes(seed)) moves.builder = { spec: 1, xp: 5 };
    const specEnd = {}, foodEnd = {};
    for (const t of SPECS) { specEnd[t] = (moves[t] || {}).spec || 0; foodEnd[t] = (moves[t] || {}).xp || 0; }
    const v1e = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, specEnd, foodEnd, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  const capRowsOver = (seed) => {
    if (seed !== 2501) return capRowsOk(seed);
    return [
      { day: 10, vid: 'v1', name: 'Ana', occ: 'forager', specPreserver: 0, holdsPreserveFood: false,
        preservedKcalBefore: 0, preservedKcalAfter: 300, rackLines: [], fxPreserverBefore: 0, fxPreserverAfter: 3,
        fxPreserverUnitsBefore: 0, fxPreserverUnitsAfter: 3, fxCookBefore: 0, fxCookAfter: 1 },
    ];
  };
  corpus(dir, SEEDS16, mk, null, null, beforePracticeQ1, capRowsOver, roomRowsBefore);
  const out = runAnalyzer(dir);
  check('N cap-three-units-is-NO-GO', /Q1 verdict: NO-GO \(CAP CHECK max-units\/day 3 > 2\)/.test(out), out.slice(out.indexOf('Q1 verdict:')));
});

// (O) BEFORE-validity UNTESTED: BEFORE shows no preserver race, so the
// question is untested on this band — UNTESTED, not GO.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
    const moves = {};
    if (PRESERVER_SEEDS.includes(seed)) moves.preserver = { spec: 1, xp: 5 };
    if (BUTCHER_SEEDS.includes(seed)) moves.butcher = { spec: 1, xp: 5 };
    if (COOK_SEEDS.includes(seed)) moves.cook = { spec: 1, xp: 5 };
    if (BUILDER_SEEDS.includes(seed)) moves.builder = { spec: 1, xp: 5 };
    const specEnd = {}, foodEnd = {};
    for (const t of SPECS) { specEnd[t] = (moves[t] || {}).spec || 0; foodEnd[t] = (moves[t] || {}).xp || 0; }
    const v1e = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, specEnd, foodEnd, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  const beforeNoRace = (seed) => {
    const v = villager('v1', 'Ana', 'forager', {}, { cook: 88 }, { cook: 0 }, { cook: 0 }, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  corpus(dir, SEEDS16, mk, null, null, beforeNoRace, capRowsOk, roomRowsBefore);
  const out = runAnalyzer(dir);
  check('O q1-before-no-race-is-untested', /Q1 verdict: UNTESTED \(BEFORE-validity failed/.test(out), out.slice(out.indexOf('Q1 verdict:')));
});

// (P) Q2 denominator fix, PASS shape: one spoken invite answered + one
// pending-at-start answer (no spoken line) + zero unanswered -> offered
// 2, answered 2 -> PASS.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoPass = (seed, tag) => {
    if (seed !== 2501 || tag !== 'r133-after') return convoTxt();
    return '=== r133-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: "Walk my trap line with me?"\nYOU: [betrayal:accept]\nTHEM: "Good. Bring your boots."\n-- Bo (v2) occ=hunter --\nOPENING: hello\nYOU: [betrayal:decline]\nTHEM: "Another time, then."\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoPass);
  const out = runAnalyzer(dir);
  check('P q2-denominator-pending-counts', /Q2 invitations: spoken=1 answers accept=1 decline=1 unanswered-spoken=0 offered=2/.test(out), out);
  check('Q q2-pass-at-100pct', /Q2 verdict: PASS \(answered 2\/2 = 100%, bar >=80%\)/.test(out), out);
});

// (R) Q2 denominator fix, FAIL shape: one spoken invite answered + one
// spoken invite followed by silence -> offered 2, answered 1 -> FAIL.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoFail = (seed, tag) => {
    if (seed !== 2501 || tag !== 'r133-after') return convoTxt();
    return '=== r133-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: "Walk my trap line with me?"\nYOU: [betrayal:accept]\nTHEM: "Good. Bring your boots."\n-- Bo (v2) occ=hunter --\nOPENING: hello\nTHEM: "Come see what I found?"\nYOU: [silence]\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoFail);
  const out = runAnalyzer(dir);
  check('R q2-silence-counts-unanswered', /Q2 invitations: spoken=2 answers accept=1 decline=0 unanswered-spoken=1 offered=2/.test(out), out);
  check('S q2-fail-at-50pct', /Q2 verdict: FAIL \(answered 1\/2, bar >=80%\)/.test(out), out);
});

// (T) Q3 null lines: a THEM: (null) line in the after panel fails Q3.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoNull = (seed, tag) => {
    if (seed !== 2501 || tag !== 'r133-after') return convoTxt();
    return '=== r133-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: (null)\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoNull);
  const out = runAnalyzer(dir);
  check('T q3-null-line-fails', /Q3 verdict: FAIL \(1 null THEM lines/.test(out), out);
});

// (LIVE) helper + rung + event proofs on one harness-loaded Game.
(async () => {
  const { loadGame, setupGame } = require('./sim-harness');
  let Game;
  try {
    ({ Game } = await loadGame({ seed: 2501, mode: 'mvc', fullTelemetry: false }));
    await setupGame(Game);
  } catch (e) {
    check('U live-game-loads', false, 'loadGame/setupGame: ' + (e && e.message));
    finish();
    return;
  }
  check('U live-game-loads', !!Game && typeof Game.specialistSkill === 'function');

  // Rung through the helper for preserver: 5 -> 1, 15 -> 2, 30 -> 3
  // (forager, no occupation skill — the self-taught ladder).
  try {
    const r = { formerOccupation: 'forager', foodXp: {}, foodXpRemainder: {} };
    Game.grantFoodXpCredit(r, 'preserver', 5);
    check('V rung-preserver-five-skill-one', r.foodXp.preserver === 5 && Game.specialistSkill(r, 'preserver') === 1,
      `xp=${r.foodXp.preserver} skill=${Game.specialistSkill(r, 'preserver')}`);
    Game.grantFoodXpCredit(r, 'preserver', 20);
    check('W rung-preserver-twentyfive-skill-two', r.foodXp.preserver === 15 && Game.specialistSkill(r, 'preserver') === 2,
      `xp=${r.foodXp.preserver} skill=${Game.specialistSkill(r, 'preserver')}`);
    Game.grantFoodXpCredit(r, 'preserver', 30);
    check('X rung-preserver-fiftyfive-skill-three', r.foodXp.preserver === 30 && Game.specialistSkill(r, 'preserver') === 3,
      `xp=${r.foodXp.preserver} skill=${Game.specialistSkill(r, 'preserver')}`);
  } catch (e) {
    check('V rung-preserver-five-skill-one', false, 'rung checks threw: ' + (e && e.message));
  }

  // Event proofs (real duty resolutions — state writes only on this test
  // Game, discarded after). Staging a 3-batch resolution: the rack budget
  // is 4000 kcal and the dinner reserve is 250/roster (~3000 kcal), so
  // three 1-unit x 100-kcal stacks alone would be eaten as dinner. A
  // sacrificial 1-unit x 10000-kcal stack sorts first (soonest-spoiling,
  // biggest) and absorbs the whole reserve as ONE kept unit (keepUnits ==
  // origUnits, so the whole stack stays fresh and the reserve drops to 0)
  // — then the three test stacks all hit the racks (n=3). Validated on
  // the unfixed engine: 3 batches preserved, +3 XP.
  try {
    const v = Game.state.village || {};
    const curDay = () => (Game.state.scholar || {}).day || 1;
    const setDay = (d) => { Game.state.scholar.day = d; };
    let day = curDay();
    const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
    const cookVid = living[0];
    const fxOf = (vid, task) => (((Game.getPerson(vid) || {}).foodXp || {})[task]) || 0;
    const remOf = (vid, task) => (((Game.getPerson(vid) || {}).foodXpRemainder || {})[task]) || 0;
    const unitsOf = (vid) => {
      const rec = Game.getPerson(vid) || {};
      return (rec.foodXpDay && rec.foodXpDay.preserverUnits) || 0;
    };
    const resetFx = (vid, task) => {
      const rec = Game.getPerson(vid) || {};
      rec.foodXp = rec.foodXp || {}; rec.foodXp[task] = 0;
      rec.foodXpRemainder = rec.foodXpRemainder || {}; rec.foodXpRemainder[task] = 0;
      rec.foodXpDay = rec.foodXpDay || {}; delete rec.foodXpDay[task];
      if (task === 'preserver') delete rec.foodXpDay.preserverUnits;
    };
    const setFx = (vid, task, xp, carry) => {
      const rec = Game.getPerson(vid) || {};
      rec.foodXp = rec.foodXp || {}; rec.foodXp[task] = xp;
      rec.foodXpRemainder = rec.foodXpRemainder || {}; rec.foodXpRemainder[task] = carry;
      rec.foodXpDay = rec.foodXpDay || {}; delete rec.foodXpDay[task];
      if (task === 'preserver') delete rec.foodXpDay.preserverUnits;
    };
    const preservedCount = () => ((Game.state.village.pantry || []).filter(it => it && it.foodState === 'preserved').length);
    const filterPantry = () => {
      const vv = Game.state.village;
      const d = curDay();
      vv.pantry = (vv.pantry || []).filter(it => !it || it.foodState === 'preserved' || it.foodState === 'rendered' || (it.spoilDay != null && it.spoilDay - d > 2));
    };
    const stage = (nBatch) => {
      // One sacrificial stack (absorbs the dinner reserve whole) + nBatch
      // 1-unit x 100-kcal test stacks (all hit the racks, n = nBatch).
      const d = curDay();
      v.pantry = v.pantry || [];
      v.pantry.push({ name: 'Sacrificial haunch', kcalEach: 10000, units: 1, foodState: 'cleaned', foodKind: 'meat', spoilDay: d + 1 });
      for (let i = 0; i < nBatch; i++) {
        v.pantry.push({ name: 'Test haunch ' + i, kcalEach: 100, units: 1, foodState: 'cleaned', foodKind: 'meat', spoilDay: d + 1 });
      }
    };
    // (Y) A 3-batch resolution on a fresh day grants 2 units' worth:
    // +2 XP below the rung, units counter 2 (not 3).
    setDay(day);
    resetFx(cookVid, 'preserver');
    filterPantry();
    stage(3);
    const p0 = preservedCount();
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Y three-batch-resolution-grants-two-units', preservedCount() === p0 + 3 && fxOf(cookVid, 'preserver') === 2 && unitsOf(cookVid) === 2,
      `preserved ${p0}->${preservedCount()} (want +3 batches), preserver xp ${fxOf(cookVid, 'preserver')} (want 2), units today ${unitsOf(cookVid)} (want 2)`);
    // (Y2) A second 3-batch resolution THE SAME day grants 0 (budget spent).
    stage(3);
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Y2 second-same-day-grants-nothing', fxOf(cookVid, 'preserver') === 2 && unitsOf(cookVid) === 2,
      `preserver xp ${fxOf(cookVid, 'preserver')} (want still 2), units today ${unitsOf(cookVid)} (want still 2)`);
    // (Y3) A 3-batch resolution the NEXT day grants 2 again (budget resets).
    setDay(day + 1); day = curDay();
    stage(3);
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Y3 next-day-grants-again', fxOf(cookVid, 'preserver') === 4 && unitsOf(cookVid) === 2,
      `preserver xp ${fxOf(cookVid, 'preserver')} (want 4), units today ${unitsOf(cookVid)} (want 2)`);
    // (Y4) A 1-batch resolution on a fresh day grants 1 unit (+1 XP).
    setDay(day + 1); day = curDay();
    stage(1);
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Y4 one-batch-resolution-grants-one', fxOf(cookVid, 'preserver') === 5 && unitsOf(cookVid) === 1,
      `preserver xp ${fxOf(cookVid, 'preserver')} (want 5), units today ${unitsOf(cookVid)} (want 1)`);
    // (Y5) ABOVE the rung (XP pinned at 5): a 3-batch resolution grants
    // 2 units at 2:1 -> +1 XP, carry 0 (the dial's math is unchanged by
    // the cap; fresh day, so the cap is not what limits it — the dial is).
    setDay(day + 1); day = curDay();
    setFx(cookVid, 'preserver', 5, 0);
    stage(3);
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Y5 above-rung-three-batch-grants-one-xp', fxOf(cookVid, 'preserver') === 6 && remOf(cookVid, 'preserver') === 0 && unitsOf(cookVid) === 2,
      `preserver xp ${fxOf(cookVid, 'preserver')} (want 6), carry ${remOf(cookVid, 'preserver')} (want 0), units today ${unitsOf(cookVid)} (want 2)`);
    // (Y6) A resolution preserving NOTHING leaves the day's budget open:
    // resolve with no test stacks (only the sacrificial, which stays
    // fresh) -> units 0; then stage 3 and resolve again the same day ->
    // grants 2. Keyed to the grant event, not the cook resolution.
    setDay(day + 1); day = curDay();
    resetFx(cookVid, 'preserver');
    filterPantry();
    v.pantry.push({ name: 'Sacrificial haunch', kcalEach: 10000, units: 1, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    const unitsAfterEmpty = unitsOf(cookVid);
    stage(3);
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Y6 empty-resolution-leaves-budget-open', unitsAfterEmpty === 0 && fxOf(cookVid, 'preserver') === 2 && unitsOf(cookVid) === 2,
      `units after empty resolution ${unitsAfterEmpty} (want 0), preserver xp ${fxOf(cookVid, 'preserver')} (want 2), units today ${unitsOf(cookVid)} (want 2)`);
    // (Z) Cook grant unaffected: first resolution of a fresh day grants
    // +1 cook XP; second same day grants nothing (the r131 cap stands).
    setDay(day + 1); day = curDay();
    resetFx(cookVid, 'cook');
    filterPantry();
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    const cookAfter1 = fxOf(cookVid, 'cook');
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('Z cook-grant-unaffected', cookAfter1 === 1 && fxOf(cookVid, 'cook') === 1,
      `cook xp after 1st ${cookAfter1}, after 2nd ${fxOf(cookVid, 'cook')} (want 1, 1)`);
    // (AA) Butcher grant unaffected (helper-level): 1 unit -> +1 XP, and
    // the 2:1 dial above the rung still applies.
    try {
      const b = { formerOccupation: 'forager', foodXp: {}, foodXpRemainder: {} };
      Game.grantFoodXpCredit(b, 'butcher', 1);
      check('AA butcher-helper-one-unit-one-xp', b.foodXp.butcher === 1, `butcher xp ${b.foodXp.butcher} (want 1)`);
      const b2 = { formerOccupation: 'forager', foodXp: { butcher: 5 }, foodXpRemainder: { butcher: 0 } };
      Game.grantFoodXpCredit(b2, 'butcher', 2);
      check('AB butcher-helper-above-rung-two-to-one', b2.foodXp.butcher === 6, `butcher xp ${b2.foodXp.butcher} (want 6: 5 + 1 from 2 units at 2:1)`);
    } catch (e) {
      check('AA butcher-helper-one-unit-one-xp', false, 'butcher helper checks threw: ' + (e && e.message));
    }
    // (AC) FIX ISOLATION: the same 3-batch cook resolution with the
    // helper stubbed to skip 'preserver' produces byte-identical pantry
    // + gives output — only foodXp differs. The cap's only effect is the
    // XP credit.
    try {
      const _rnd = Math.random;
      Math.random = () => 0.5;
      setDay(day + 1); day = curDay();
      resetFx(cookVid, 'preserver');
      filterPantry();
      stage(3);
      const pantryBefore = JSON.stringify(v.pantry);
      const givesBefore = ((v.gives || {})[cookVid]) || 0;
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      const pantryLive = JSON.stringify(v.pantry);
      const givesLive = ((v.gives || {})[cookVid]) || 0;
      const fxLive = fxOf(cookVid, 'preserver');
      // restore the pre-resolution state, stub the helper, re-run.
      v.pantry = JSON.parse(pantryBefore);
      v.gives[cookVid] = givesBefore;
      resetFx(cookVid, 'preserver');
      const _grant = Game.grantFoodXpCredit.bind(Game);
      Game.grantFoodXpCredit = function (person, task, units) {
        if (task === 'preserver') return (person.foodXp || {})[task] || 0;
        return _grant(person, task, units);
      };
      try { Game.resolveOneAssignment(cookVid, { task: 'cook' }); } finally { Game.grantFoodXpCredit = _grant; }
      const pantryStub = JSON.stringify(v.pantry);
      const givesStub = ((v.gives || {})[cookVid]) || 0;
      const fxStub = fxOf(cookVid, 'preserver');
      Math.random = _rnd;
      check('AC fix-isolation-pantry-gives-identical', pantryLive === pantryStub && givesLive === givesStub && fxLive === 2 && fxStub === 0,
        `pantry identical=${pantryLive === pantryStub} gives ${givesLive} vs ${givesStub} preserver xp live ${fxLive} vs stub ${fxStub} (want 2 vs 0)`);
    } catch (e) { check('AC fix-isolation-pantry-gives-identical', false, 'isolation check threw: ' + (e && e.message)); }
  } catch (e) {
    check('Y three-batch-resolution-grants-two-units', false, 'event proofs threw: ' + (e && e.message) + '\n' + (e && e.stack || ''));
  }

  // (LIVE) det-gate: the r133 driver run TWICE on 5d seed 2501
  // (HUNTSTAFF=2) — byte-identical JSON outputs (funnel keys, practice
  // snapshots, cook/mend logs, deaths, daily, guardrails). The delegate
  // layer draws only seeded RNG, so the same seed reproduces exactly.
  // Convo files are excluded: the header tag differs by construction.
  (function detGate() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r133-detgate-'));
    try {
      const run = (tag) => {
        const env = Object.assign({}, process.env, { SEEDS: '2501', DAYS: '5', TAG: tag, EVID: dir, HUNTSTAFF: '2' });
        execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
        return JSON.parse(fs.readFileSync(path.join(dir, `journey-establishment-${tag}-seed2501.json`), 'utf8'));
      };
      let a, b;
      try { a = run('r133-detgate-a'); } catch (e) { check('AD det-gate-first-run', false, 'first driver run exit/timeout: ' + (e && e.message)); return; }
      try { b = run('r133-detgate-b'); } catch (e) { check('AD det-gate-first-run', false, 'second driver run exit/timeout: ' + (e && e.message)); return; }
      check('AD det-gate-both-runs', !!a && !!b);
      const strip = (o) => { const c = Object.assign({}, o); delete c.run; return c; };
      check('AE det-gate-outputs-identical', JSON.stringify(strip(a)) === JSON.stringify(strip(b)),
        'two runs of the same driver/seed produce byte-identical JSON (minus the run tag)');
      const keys = ['endDay', 'aliveEnd', 'aliveAt40', 'waveReached', 'pantryKcalEnd'];
      const diffs = [];
      for (const k of keys) if (a[k] !== b[k]) diffs.push(`${k}: run-a=${a[k]} run-b=${b[k]}`);
      if (JSON.stringify(a.practice) !== JSON.stringify(b.practice)) diffs.push('practice snapshots differ');
      if (JSON.stringify(a.cookLog) !== JSON.stringify(b.cookLog)) diffs.push('cookLog differs');
      if (JSON.stringify(a.mendLog) !== JSON.stringify(b.mendLog)) diffs.push('mendLog differs');
      if (JSON.stringify(a.deaths) !== JSON.stringify(b.deaths)) diffs.push('deaths differ');
      if (JSON.stringify(a.guardrails) !== JSON.stringify(b.guardrails)) diffs.push('guardrails differ');
      check('AF det-gate-funnel-practice-logs-identical', diffs.length === 0, diffs.join('; ') || 'funnel/practice/cookLog/mendLog/deaths/guardrails identical');
      check('AG det-gate-snapshots-present', !!b.practice && !!b.practice.d1 && b.practice.d1.snap.length > 0 && !!b.practice.dEnd,
        `practice keys=${Object.keys(b.practice || {})}`);
      check('AH det-gate-mend-log-present', Array.isArray(b.mendLog), `mendLog is ${Array.isArray(b.mendLog) ? 'an array of ' + b.mendLog.length : typeof b.mendLog}`);
      // Units fields: every cookLog row that grants preserver XP must
      // carry the driver's live units reads (null = the field is absent
      // on the unfixed engine — on the fixed tree the AFTER read must
      // be present: it is the day's granted total. A null BEFORE read
      // is fine — it is the counter not yet created, a villager's
      // first-ever grant, i.e. zero units so far that day.)
      const granting = (b.cookLog || []).filter(r => (r.fxPreserverAfter || 0) > (r.fxPreserverBefore || 0));
      const missing = granting.filter(r => r.fxPreserverUnitsAfter == null);
      check('AI det-gate-units-fields-present', missing.length === 0,
        `${granting.length} granting rows, ${missing.length} missing units fields`);
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
