#!/usr/bin/env node
// test-journey-establishment-r128-grant-rate.js — proof test for the r128
// grant-rate dial (a) (journey-establishment r128 2026-11-10).
//
// r127 judged the flat halving NO-GO (moves 6/16 on fresh seeds): it
// removed every racer but also braked the marginal movers below their
// first rung. The fix (src/js/game.js) halves the routine-work grant
// rate ONLY above the first rung: the first 5 XP of a task credit 1:1,
// above 5 XP 2 units of work buy 1 XP, the odd unit carrying on the
// person record (foodXpRemainder), so no work is ever lost to rounding.
// The rung (5/15/30, r116) is unchanged; askSpecialist (+1 per direct
// teaching use) is unchanged; only the two routine-work sites move
// (rack batches, hunt kills).
//
// This test proves the dial end to end:
//   source : the helper exists with the first-rung headroom + 2:1 above;
//            both routine sites call it; the old +1/+n grants are gone;
//            askSpecialist still grants +1; the rung is still 5/15/30.
//   live helper: 1 unit at 0 XP -> 1 XP; 5 units -> 5 XP; 1 unit at 5 XP
//            -> +0 XP, carry 1; next unit -> +1 XP, carry 0; 5 units at
//            6 XP -> +2 XP, carry 1; butcher crosses the rung the same
//            way; 0/negative units -> 0, no write; null person -> 0.
//   live rung: 5 units -> 5 XP -> skill 1; 25 units -> 15 XP -> 2;
//            55 units -> 30 XP -> 3 (forager, no occupation skill).
//            Holders still step +1 at 5 XP (fisherman butcher 2 -> 3).
//   live events (real duty resolutions on one harness-loaded Game):
//            below the rung, 1 rack batch -> +1 XP; 2 batches -> +2 XP;
//            5 batches -> +5 XP; no preserve -> +0, carry unchanged.
//            Above the rung (XP pinned at 5 first), 1 batch -> +0 XP,
//            carry 1; 2 batches -> +1 XP, carry 0; 5 batches -> +2 XP,
//            carry 1. Below the rung, 1st hunt kill -> +1 XP; 2nd kill
//            -> +2 XP. Above the rung, 1st kill -> +0 XP, carry 1;
//            2nd kill -> +1 XP, carry 0; failed stalk -> +0, carry
//            unchanged. BEFORE the fix the above-rung cases FAIL (1
//            batch -> +1, 2 -> +2, 5 -> +5, 1st kill -> +1); AFTER they
//            PASS, and the below-rung cases pass on both trees (the dial
//            does not touch the first rung).
//   analyzer: synthetic corpora prove the Q1 verdict lines (GO at 8/16
//            moves + pace03 1; NO-GO on the pace bar at pace03 5) and the
//            Q2 denominator fix (a pending-at-start answer counts as
//            offered with no spoken line; a spoken line followed by
//            silence counts as offered-but-unanswered).
//   det-gate: the r128 driver vs the r127 driver on 5d seed 2201
//            (HUNTSTAFF=2) reproduce identical funnel keys AND identical
//            practice snapshots — the driver changes are a tag rename +
//            a seed band.
//
// Usage: node scripts/test-journey-establishment-r128-grant-rate.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r128-20261110.py');
const DRIVER = path.join(__dirname, 'journey-establishment-r128-20261110.js');
const DRIVER_R127 = path.join(__dirname, 'journey-establishment-r127-20261110.js');
const GAME_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
const FOOD_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'food.js'), 'utf8');
const DRIVER_SRC = fs.readFileSync(DRIVER, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- source: the dial is wired as designed, nothing else moved ---
check('A helper-exists-first-rung-headroom', /grantFoodXpCredit\(person, task, units\)/.test(GAME_SRC) &&
  /if \(xp < 5\)/.test(GAME_SRC) &&
  /Math\.floor\(total \/ 2\)/.test(GAME_SRC) &&
  /person\.foodXpRemainder\[task\] = carry/.test(GAME_SRC));
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
const SEEDS16 = [2201, 2202, 2203, 2204, 2205, 2206, 2207, 2208, 2209, 2210, 2211, 2212, 2213, 2214, 2215, 2216];
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
  return { seed, run: 'r128-after', days: 42, endDay: 43, gameOver: false, startCensus: [],
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
  return '=== r128-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\n(ended by engine)\nclosing: goodbye\n';
}
function corpusSeed(dir, tag, seed, practice, teleAll, convo) {
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-seed${seed}.json`),
    JSON.stringify(baseSeed(seed, practice, teleAll)));
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-convo-seed${seed}.txt`), convo !== undefined ? convo : convoTxt());
}
function corpus(dir, seeds, mkPractice, mkTele, mkConvo) {
  for (const seed of seeds) {
    const practice = mkPractice(seed);
    corpusSeed(dir, 'r128-before', seed, { d1: null, d14: null, d28: null, dEnd: null }, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r128-before') : undefined);
    corpusSeed(dir, 'r128-after', seed, practice, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r128-after') : undefined);
  }
}
function runAnalyzer(dir) {
  return execFileSync('python3', [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r128-grant-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
const MOVE_SEEDS = [2201, 2202, 2203, 2204, 2205, 2206, 2207, 2208];

// (J) Ladder GO: specialist 0->positive on 8/16 seeds AND pace03 1 -> GO.
// Under dial (a), 11 XP buys skill 2 and 30 XP buys skill 3; the
// synthetic move seeds carry 11 XP (skill 2) except 2201, which carries
// one 0->3 racer at 30 XP (inside the <=4 bar).
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { preserver: 0 }, { preserver: 0 }, []);
    if (!MOVE_SEEDS.includes(seed)) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { preserver: 2 }, { preserver: 11 }, []);
    if (seed !== 2201) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
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
    if (seed !== 2201) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
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
    if (seed !== 2201 || tag !== 'r128-after') return convoTxt();
    return '=== r128-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: "Walk my trap line with me?"\nYOU: [betrayal:accept]\nTHEM: "Good. Bring your boots."\n-- Bo (v2) occ=hunter --\nOPENING: hello\nYOU: [betrayal:decline]\nTHEM: "Another time, then."\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS16, mk, null, convoPass);
  const out = runAnalyzer(dir);
  check('M q2-denominator-pending-counts', /Q2 invitations: spoken=1 answers accept=1 decline=1 unanswered-spoken=0 offered=2/.test(out), out);
  check('N q2-pass-at-100pct', /Q2 verdict: PASS \(answered 2\/2 = 100%, bar >=80%\)/.test(out), out);
});

// (O) Q2 denominator fix, FAIL shape: one spoken invite answered + one
// spoken invite followed by silence -> offered 2, answered 1 -> FAIL.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const convoFail = (seed, tag) => {
    if (seed !== 2201 || tag !== 'r128-after') return convoTxt();
    return '=== r128-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: "Walk my trap line with me?"\nYOU: [betrayal:accept]\nTHEM: "Good. Bring your boots."\n-- Bo (v2) occ=hunter --\nOPENING: hello\nTHEM: "Come see what I found?"\nYOU: [silence]\n(ended by engine)\nclosing: goodbye\n';
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
    if (seed !== 2201 || tag !== 'r128-after') return convoTxt();
    return '=== r128-after PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nTHEM: (null)\n(ended by engine)\nclosing: goodbye\n';
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
    ({ Game } = await loadGame({ seed: 2201, mode: 'mvc', fullTelemetry: false }));
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
      check('T one-unit-full-rate-below-rung', Game.grantFoodXpCredit(p, 'preserver', 1) === 1 &&
        p.foodXp.preserver === 1 && p.foodXpRemainder.preserver === 0,
        `xp=${(p.foodXp || {}).preserver} carry=${(p.foodXpRemainder || {}).preserver}`);
      check('U five-units-reach-first-rung', Game.grantFoodXpCredit(p, 'preserver', 4) === 5 &&
        p.foodXp.preserver === 5 && p.foodXpRemainder.preserver === 0,
        `xp=${p.foodXp.preserver} carry=${p.foodXpRemainder.preserver} (5 units total -> 5 xp)`);
      check('V one-unit-above-rung-no-xp-carry-one', Game.grantFoodXpCredit(p, 'preserver', 1) === 5 &&
        p.foodXp.preserver === 5 && p.foodXpRemainder.preserver === 1,
        `xp=${p.foodXp.preserver} carry=${p.foodXpRemainder.preserver}`);
      check('W second-unit-above-rung-makes-one-xp', Game.grantFoodXpCredit(p, 'preserver', 1) === 6 &&
        p.foodXp.preserver === 6 && p.foodXpRemainder.preserver === 0,
        `xp=${p.foodXp.preserver} carry=${p.foodXpRemainder.preserver}`);
      check('X five-units-above-rung-two-xp-carry-one', Game.grantFoodXpCredit(p, 'preserver', 5) === 8 &&
        p.foodXp.preserver === 8 && p.foodXpRemainder.preserver === 1,
        `xp=${p.foodXp.preserver} carry=${p.foodXpRemainder.preserver} (5 units at 6 xp -> +2 xp)`);
      const b = {};
      check('Y butcher-crosses-rung-same-way', Game.grantFoodXpCredit(b, 'butcher', 3) === 3 &&
        Game.grantFoodXpCredit(b, 'butcher', 3) === 5 && b.foodXp.butcher === 5 && b.foodXpRemainder.butcher === 1 &&
        Game.grantFoodXpCredit(b, 'butcher', 1) === 6 && b.foodXpRemainder.butcher === 0,
        `butcher xp=${(b.foodXp || {}).butcher} carry=${(b.foodXpRemainder || {}).butcher}`);
      const z = {};
      check('Z zero-units-no-write', Game.grantFoodXpCredit(z, 'preserver', 0) === 0 && !z.foodXp && !z.foodXpRemainder);
      check('AA negative-units-no-write', Game.grantFoodXpCredit(z, 'preserver', -3) === 0 && !z.foodXp);
      check('AB null-person-safe', Game.grantFoodXpCredit(null, 'preserver', 2) === 0);
      // Rung through the helper: 5 units -> 5 XP -> 1; 25 -> 15 XP -> 2;
      // 55 -> 30 XP -> 3. Holders still step +1 at 5 XP.
      const r = { formerOccupation: 'forager', foodXp: {}, foodXpRemainder: {} };
      Game.grantFoodXpCredit(r, 'preserver', 5);
      check('AC rung-five-units-skill-one', r.foodXp.preserver === 5 && Game.specialistSkill(r, 'preserver') === 1,
        `xp=${r.foodXp.preserver} skill=${Game.specialistSkill(r, 'preserver')}`);
      Game.grantFoodXpCredit(r, 'preserver', 20);
      check('AD rung-twentyfive-units-skill-two', r.foodXp.preserver === 15 && Game.specialistSkill(r, 'preserver') === 2,
        `xp=${r.foodXp.preserver} skill=${Game.specialistSkill(r, 'preserver')}`);
      Game.grantFoodXpCredit(r, 'preserver', 30);
      check('AE rung-fiftyfive-units-skill-three', r.foodXp.preserver === 30 && Game.specialistSkill(r, 'preserver') === 3,
        `xp=${r.foodXp.preserver} skill=${Game.specialistSkill(r, 'preserver')}`);
      const h = { formerOccupation: 'fisherman', foodXp: {}, foodXpRemainder: {} };
      Game.grantFoodXpCredit(h, 'butcher', 5);
      check('AF holder-steps-up-at-five', h.foodXp.butcher === 5 && Game.specialistSkill(h, 'butcher') === 3,
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
    const setFx = (vid, task, xp, carry) => {
      const rec = Game.getPerson(vid) || {};
      rec.foodXp = rec.foodXp || {}; rec.foodXp[task] = xp;
      rec.foodXpRemainder = rec.foodXpRemainder || {}; rec.foodXpRemainder[task] = carry;
    };
    const preservedCount = () => ((Game.state.village.pantry || []).filter(it => it && it.foodState === 'preserved').length);
    const filterPantry = () => {
      const vv = Game.state.village;
      vv.pantry = (vv.pantry || []).filter(it => !it || it.foodState === 'preserved' || it.foodState === 'rendered' || (it.spoilDay != null && it.spoilDay - day > 2));
    };
    // (i) ONE batch, below the rung -> +1 XP, carry 0 (full rate).
    // Setup: 10 units x 1000 kcal, spoilDay day+1 (eligible), against a
    // ~3000 kcal reserve, so exactly one stack converts (r115 BA shape).
    resetFx(cookVid, 'preserver');
    v.pantry = v.pantry || [];
    v.pantry.push({ name: 'Test haunch', kcalEach: 1000, units: 10, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
    const p0 = preservedCount();
    Game.resolveOneAssignment(cookVid, { task: 'cook' });
    check('AG rack-one-batch-below-rung-one-xp', preservedCount() === p0 + 1 && fxOf(cookVid, 'preserver') === 1 && remOf(cookVid, 'preserver') === 0,
      `preserved ${p0}->${preservedCount()}, xp ${fxOf(cookVid, 'preserver')}, carry ${remOf(cookVid, 'preserver')} (want +1 preserved, +1 xp, carry 0)`);
    // (ii) no preserve -> +0, carry unchanged.
    try {
      filterPantry();
      const b2 = fxOf(cookVid, 'preserver'), r2 = remOf(cookVid, 'preserver'), p2 = preservedCount();
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      check('AH rack-no-preserve-no-xp-carry-kept', preservedCount() === p2 && fxOf(cookVid, 'preserver') === b2 && remOf(cookVid, 'preserver') === r2,
        `preserved ${p2}->${preservedCount()}, xp ${b2}->${fxOf(cookVid, 'preserver')}, carry ${r2}->${remOf(cookVid, 'preserver')}`);
    } catch (e) { check('AH rack-no-preserve-no-xp-carry-kept', false, 'negative rack check threw: ' + (e && e.message)); }
    // (iii) TWO batches, below the rung -> +2 XP, carry 0 (r115 BF
    // setup: two stacks, 5 units x 1000 kcal each).
    try {
      resetFx(cookVid, 'preserver');
      const vv = Game.state.village;
      vv.pantry = vv.pantry || [];
      vv.pantry.push({ name: 'Test haunch A', kcalEach: 1000, units: 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      vv.pantry.push({ name: 'Test haunch B', kcalEach: 1000, units: 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      const p3 = preservedCount();
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      check('AI rack-two-batches-below-rung-two-xp', preservedCount() === p3 + 2 && fxOf(cookVid, 'preserver') === 2 && remOf(cookVid, 'preserver') === 0,
        `preserved ${p3}->${preservedCount()}, xp ${fxOf(cookVid, 'preserver')}, carry ${remOf(cookVid, 'preserver')} (want +2 preserved, +2 xp, carry 0)`);
    } catch (e) { check('AI rack-two-batches-below-rung-two-xp', false, 'two-batch rack check threw: ' + (e && e.message)); }
    // (iv) FIVE batches, below the rung -> +5 XP, carry 0 (r115 BG
    // setup: stack A absorbs the reserve, stacks B-E convert; n=5).
    try {
      resetFx(cookVid, 'preserver');
      filterPantry();
      const vv = Game.state.village;
      const rosterLen = ((vv.roster || []).length || 10);
      vv.pantry.push({ name: 'Test haunch CAP-A', kcalEach: 100, units: Math.ceil(2.5 * rosterLen) + 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      for (const nm of ['B', 'C', 'D', 'E']) {
        vv.pantry.push({ name: 'Test haunch CAP-' + nm, kcalEach: 100, units: 10, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      }
      const p4 = preservedCount();
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      check('AJ rack-five-batches-below-rung-five-xp', preservedCount() >= p4 + 4 && fxOf(cookVid, 'preserver') === 5 && remOf(cookVid, 'preserver') === 0,
        `preserved ${p4}->${preservedCount()} (roster ${rosterLen}), xp ${fxOf(cookVid, 'preserver')}, carry ${remOf(cookVid, 'preserver')} (want >=+4 preserved, +5 xp, carry 0)`);
    } catch (e) { check('AJ rack-five-batches-below-rung-five-xp', false, 'five-batch rack check threw: ' + (e && e.message)); }
    // (v) ONE batch, ABOVE the rung (XP pinned at 5) -> +0 XP, carry 1.
    try {
      setFx(cookVid, 'preserver', 5, 0);
      filterPantry();
      const vv = Game.state.village;
      vv.pantry.push({ name: 'Test haunch', kcalEach: 1000, units: 10, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      const p5 = preservedCount();
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      check('AK rack-one-batch-above-rung-no-xp-carry-one', preservedCount() === p5 + 1 && fxOf(cookVid, 'preserver') === 5 && remOf(cookVid, 'preserver') === 1,
        `preserved ${p5}->${preservedCount()}, xp ${fxOf(cookVid, 'preserver')}, carry ${remOf(cookVid, 'preserver')} (want +1 preserved, +0 xp, carry 1)`);
    } catch (e) { check('AK rack-one-batch-above-rung-no-xp-carry-one', false, 'above-rung one-batch rack check threw: ' + (e && e.message)); }
    // (vi) TWO batches, ABOVE the rung -> +1 XP, carry 0.
    try {
      setFx(cookVid, 'preserver', 5, 0);
      filterPantry();
      const vv = Game.state.village;
      vv.pantry.push({ name: 'Test haunch A', kcalEach: 1000, units: 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      vv.pantry.push({ name: 'Test haunch B', kcalEach: 1000, units: 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      const p6 = preservedCount();
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      check('AL rack-two-batches-above-rung-one-xp', preservedCount() === p6 + 2 && fxOf(cookVid, 'preserver') === 6 && remOf(cookVid, 'preserver') === 0,
        `preserved ${p6}->${preservedCount()}, xp ${fxOf(cookVid, 'preserver')}, carry ${remOf(cookVid, 'preserver')} (want +2 preserved, +1 xp, carry 0)`);
    } catch (e) { check('AL rack-two-batches-above-rung-one-xp', false, 'above-rung two-batch rack check threw: ' + (e && e.message)); }
    // (vii) FIVE batches, ABOVE the rung -> +2 XP, carry 1 (CAP setup).
    try {
      setFx(cookVid, 'preserver', 5, 0);
      filterPantry();
      const vv = Game.state.village;
      const rosterLen = ((vv.roster || []).length || 10);
      vv.pantry.push({ name: 'Test haunch CAP-A', kcalEach: 100, units: Math.ceil(2.5 * rosterLen) + 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      for (const nm of ['B', 'C', 'D', 'E']) {
        vv.pantry.push({ name: 'Test haunch CAP-' + nm, kcalEach: 100, units: 10, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      }
      const p7 = preservedCount();
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      check('AM rack-five-batches-above-rung-two-xp-carry-one', preservedCount() >= p7 + 4 && fxOf(cookVid, 'preserver') === 7 && remOf(cookVid, 'preserver') === 1,
        `preserved ${p7}->${preservedCount()} (roster ${rosterLen}), xp ${fxOf(cookVid, 'preserver')}, carry ${remOf(cookVid, 'preserver')} (want >=+4 preserved, +2 xp, carry 1)`);
    } catch (e) { check('AM rack-five-batches-above-rung-two-xp-carry-one', false, 'above-rung five-batch rack check threw: ' + (e && e.message)); }
    // (viii)-(xi) hunt kill / fail via stubbed Math.random.
    resetFx(hunterVid, 'butcher');
    const _rnd = Math.random;
    try {
      Math.random = () => 0; // every draw succeeds: the stalk lands, the kill is cleaned
      const rKill1 = Game.villagerHuntResolve(hunterVid, 1.0);
      check('AN hunt-first-kill-below-rung-one-xp', (rKill1 && rKill1.kcal > 0) && fxOf(hunterVid, 'butcher') === 1 && remOf(hunterVid, 'butcher') === 0,
        `kill kcal=${rKill1 && rKill1.kcal}, butcher xp ${fxOf(hunterVid, 'butcher')}, carry ${remOf(hunterVid, 'butcher')} (want +1 xp, carry 0)`);
      const rKill2 = Game.villagerHuntResolve(hunterVid, 1.0);
      check('AO hunt-second-kill-below-rung-two-xp', (rKill2 && rKill2.kcal > 0) && fxOf(hunterVid, 'butcher') === 2 && remOf(hunterVid, 'butcher') === 0,
        `kill kcal=${rKill2 && rKill2.kcal}, butcher xp ${fxOf(hunterVid, 'butcher')}, carry ${remOf(hunterVid, 'butcher')} (want +2 xp, carry 0)`);
      setFx(hunterVid, 'butcher', 5, 0);
      const rKill3 = Game.villagerHuntResolve(hunterVid, 1.0);
      check('AP hunt-first-kill-above-rung-no-xp-carry-one', (rKill3 && rKill3.kcal > 0) && fxOf(hunterVid, 'butcher') === 5 && remOf(hunterVid, 'butcher') === 1,
        `kill kcal=${rKill3 && rKill3.kcal}, butcher xp ${fxOf(hunterVid, 'butcher')}, carry ${remOf(hunterVid, 'butcher')} (want +0 xp, carry 1)`);
      const rKill4 = Game.villagerHuntResolve(hunterVid, 1.0);
      check('AQ hunt-second-kill-above-rung-one-xp', (rKill4 && rKill4.kcal > 0) && fxOf(hunterVid, 'butcher') === 6 && remOf(hunterVid, 'butcher') === 0,
        `kill kcal=${rKill4 && rKill4.kcal}, butcher xp ${fxOf(hunterVid, 'butcher')}, carry ${remOf(hunterVid, 'butcher')} (want +1 xp, carry 0)`);
      Math.random = () => 0.999999; // every draw fails: the stalk fails
      const rFail = Game.villagerHuntResolve(hunterVid, 1.0);
      check('AR hunt-fail-grants-nothing', (rFail && rFail.kcal === 0) && fxOf(hunterVid, 'butcher') === 6 && remOf(hunterVid, 'butcher') === 0,
        `fail kcal=${rFail && rFail.kcal}, butcher xp ${fxOf(hunterVid, 'butcher')}, carry ${remOf(hunterVid, 'butcher')}`);
    } finally {
      Math.random = _rnd;
    }
  } catch (e) {
    check('AG rack-one-batch-below-rung-one-xp', false, 'event proofs threw: ' + (e && e.message) + '\n' + (e && e.stack || ''));
  }

  // (LIVE) det-gate: r128 driver vs r127 driver on 5d seed 2201
  // (HUNTSTAFF=2) — funnel keys AND practice snapshots identical
  // (driver neutrality). Convo files are excluded: the header tag differs
  // by construction. Both drivers run the same (fixed) tree here, so the
  // only differences should be the tag strings.
  (function detGate() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r128-detgate-'));
    try {
      const run = (driver, tag) => {
        const env = Object.assign({}, process.env, { SEEDS: '2201', DAYS: '5', TAG: tag, EVID: dir, HUNTSTAFF: '2' });
        execFileSync(process.execPath, [driver], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
        return JSON.parse(fs.readFileSync(path.join(dir, `journey-establishment-${tag}-seed2201.json`), 'utf8'));
      };
      let a, b;
      try { a = run(DRIVER_R127, 'r127-detgate'); } catch (e) { check('AS det-gate-r127-runs', false, 'r127 driver exit/timeout: ' + (e && e.message)); return; }
      try { b = run(DRIVER, 'r128-detgate'); } catch (e) { check('AS det-gate-r127-runs', false, 'r128 driver exit/timeout: ' + (e && e.message)); return; }
      check('AS det-gate-drivers-run', !!a && !!b);
      const keys = ['endDay', 'aliveEnd', 'aliveAt40', 'waveReached', 'pantryKcalEnd'];
      const diffs = [];
      for (const k of keys) if (a[k] !== b[k]) diffs.push(`${k}: r127=${a[k]} r128=${b[k]}`);
      if (JSON.stringify(a.guardrails) !== JSON.stringify(b.guardrails)) diffs.push('guardrails differ');
      if (JSON.stringify(a.deaths) !== JSON.stringify(b.deaths)) diffs.push('deaths differ');
      if (JSON.stringify(a.daily) !== JSON.stringify(b.daily)) diffs.push('daily rows differ');
      if (JSON.stringify((a.huntStaff || {}).assignments) !== JSON.stringify((b.huntStaff || {}).assignments)) diffs.push('huntStaff.assignments differ');
      check('AT det-gate-funnel-identical', diffs.length === 0, diffs.join('; ') || 'endDay/alive/pantry/deaths/daily/huntStaff identical');
      check('AU det-gate-practice-identical', JSON.stringify(a.practice) === JSON.stringify(b.practice),
        'practice snapshots identical across drivers');
      check('AV det-gate-snapshots-present', !!b.practice && !!b.practice.d1 && b.practice.d1.snap.length > 0 && !!b.practice.dEnd,
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
