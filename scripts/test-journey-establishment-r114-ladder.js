// Proof test for establishment r114 Q1 specialist-ladder PACE + Q2 standing
// check (scripts/journey-establishment-r114-20261108.js driver,
// scripts/analyze-journey-establishment-r114-20261108.py, and the fix in
// src/js/game.js (rack resolution: preserver XP per BATCH preserved, +n,
// instead of +1 per resolution)):
//   Q1: the ladder is PACED by the fix — village rack work grants
//   foodXp['preserver'] per batch (2 batches -> +2, 1 batch -> +1,
//   none -> +0), hunt kills grant butcher XP (+1/kill, unchanged), and
//   foodXp buys skill from 0 (5 XP -> 1, 10 -> 2, 15 -> 3, cap 3,
//   r113 rung, unchanged — the gate proof runs unchanged). The event
//   proof runs BEFORE the fix (must FAIL on the 2-batch case: +1, not
//   +2) and AFTER (must PASS).
//   Q2 (standing): 0 null THEM lines on the panel — the analyzer check.
// Runs the REAL analyzer on synthetic corpora (r51 pattern: temp dirs
// under os.tmpdir, removed after), plus LIVE checks on one harness-loaded
// Game (single loadGame per process — shared state) and a LIVE det-gate:
// the r114 driver on 5d seed 1502 (HUNTSTAFF=2) must reproduce the
// committed r113-driver-on-master seed-1502 funnel keys at day 6. No repo
// writes except the det-gate's temp dir (removed after).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r114-20261108.py');
const DRIVER = path.join(__dirname, 'journey-establishment-r114-20261108.js');
const R113_MASTER5_REF = path.join(ROOT, 'evidence', '2026-11-08', 'journey-establishment-r113-master5-seed1502.json');
const driver = fs.readFileSync(DRIVER, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

check('A driver-practice-snapshot-fn', /function practiceSnapshot\(Game\)/.test(driver));
check('B driver-practice-d1-d14-d28-dEnd', /practiceD1 = \{ day: nowDay\(Game\), snap: practiceSnapshot\(Game\) \}/.test(driver) &&
  /practiceD14 = \{ day: nd, snap: practiceSnapshot\(Game\) \}/.test(driver) &&
  /practiceD28 = \{ day: nd, snap: practiceSnapshot\(Game\) \}/.test(driver) &&
  /practiceDEnd = \{ day: nowDay\(Game\), snap: practiceSnapshot\(Game\) \}/.test(driver) &&
  /practice: \{ d1: practiceD1, d14: practiceD14, d28: practiceD28, dEnd: practiceDEnd \}/.test(driver));
check('C driver-snapshot-first-day-gte', /if \(nd >= 14 && !practiceD14\)/.test(driver) &&
  /if \(nd >= 28 && !practiceD28\)/.test(driver));
check('D driver-practice-tasks-match-practicemove', /'hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'/.test(driver));
check('E driver-practice-specs-match', /'butcher', 'cook', 'preserver', 'spotter', 'builder'/.test(driver));
check('F driver-navigation-logging', /menu page turned/.test(driver) && /r\.navigation/.test(driver));
check('G driver-foodxp-reads', /function foodXpOf\(Game, vid, task\)/.test(driver) &&
  /fxButcherBefore: fxBefore, fxButcherAfter: foodXpOf\(Game, vid, 'butcher'\)/.test(driver) &&
  /fxPreserverBefore: foodXpOf\(Game, vid, 'preserver'\)/.test(driver) &&
  /fxPreserverAfter: foodXpOf\(Game, vid, 'preserver'\)/.test(driver));

const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
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
  return { seed, run: 'r114-after', days: 42, endDay: 43, gameOver: false, startCensus: [],
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
  return '=== r114 PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\n(ended by engine)\nclosing: goodbye\n';
}
function corpusSeed(dir, tag, seed, practice, teleAll, convo) {
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-seed${seed}.json`),
    JSON.stringify(baseSeed(seed, practice, teleAll)));
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-convo-seed${seed}.txt`), convo !== undefined ? convo : convoTxt());
}
const SEEDS16 = [1502, 1504, 1603, 1604, 17101, 17102, 17103, 17104, 17105, 17106, 17107, 17108, 17109, 17110, 17111, 17112];
function corpus(dir, seeds, mkPractice, mkTele, mkConvo) {
  // Both tags get identical funnel keys (the before panel is the
  // trajectory the after panel is compared against in aggregate); only
  // the r114-after files carry the practice snapshots under test. The
  // r114-before files carry null practice in the synthetic corpus (the
  // analyzer's before-ladder reads them as missing -> zeros, which is
  // the honest shape for a synthetic corpus). Convo bodies are compared
  // with navigation turns normalized (old drivers log THEM: (null) after
  // menu:more; r114 logs (menu page turned)) — but only in the seed-1502
  // neutrality check.
  for (const seed of seeds) {
    const practice = mkPractice(seed);
    corpusSeed(dir, 'r114-before', seed, { d1: null, d14: null, d28: null, dEnd: null }, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r114-before') : undefined);
    corpusSeed(dir, 'r114-after', seed, practice, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r114-after') : undefined);
  }
}
function runAnalyzer(dir) {
  return execFileSync('python3', [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r114-ladder-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
const SEEDS4 = [1502, 1504, 1603, 1604]; // matched seeds (subset of SEEDS16, used where the test only needs the matched four)

// (a) Ladder GO: specialist 0->positive on 8/16 seeds -> Q1 GO.
// The move seeds are the 4 matched + 17101-17104; the other 8 new seeds
// carry no move. foodXp moves alone do NOT count toward the bar anymore
// (the bar is specialist moves); seed 1502's move is a real spec move.
withDir((dir) => {
  const mk = (seed) => {
    const moveSeeds = [1502, 1504, 1603, 1604, 17101, 17102, 17103, 17104];
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { preserver: 0 }, { preserver: 0 }, []);
    if (!moveSeeds.includes(seed)) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
    // Under the 5-XP rung, 11 XP buys skill 2 (5->1, 10->2).
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { preserver: 2 }, { preserver: 11 }, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  corpus(dir, SEEDS16, mk);
  const out = runAnalyzer(dir);
  check('H ladder-GO-eight-seeds', /Q1 verdict: GO \(seeds with >=1 specialist 0->positive move: 8\/16\)/.test(out), out);
  check('I ladder-per-seed-line', /ladder seed 1502: BEFORE spec0pos=0 foodXp0pos=0 foodXpEnd=0 \| AFTER spec0pos=1 foodXp0pos=1 foodXpEnd=11/.test(out), out);
  check('J ladder-move-detail', /move: Ana:preserver 0->2 \(foodXp 0->11\)/.test(out), out);
});

// (b) Zero ladder movement -> Q1 NO-GO (0/16).
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  corpus(dir, SEEDS16, mk);
  const out = runAnalyzer(dir);
  check('K zero-ladder-NO-GO', /Q1 verdict: NO-GO \(0 ladder moves on 16\/16 seeds\)/.test(out), out);
  check('L zero-foodXp-detail', /Q1 ladder detail: foodXpEnd total BEFORE=0 AFTER=0 plus1pool=0 stepped=0 wastedXp=0/.test(out), out);
});

// (c) +1-rung pool: a holder at xp>=5 whose skill stepped up is counted.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 2 }, { butcher: 0 }, []);
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 3 }, { butcher: 6 }, []);
    if (seed === 1502) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
  };
  corpus(dir, SEEDS16, mk);
  const out = runAnalyzer(dir);
  check('M plus1pool-stepped-counted', /ladder seed 1502: BEFORE spec0pos=0 foodXp0pos=0 foodXpEnd=0 \| AFTER spec0pos=0 foodXp0pos=1 foodXpEnd=6 plus1pool=1 stepped=1 wastedXp=0/.test(out), out);
});

// (d) Wasted XP: a 0-skill villager holding foodXp BELOW the 5-XP rung
// is still the gate's shadow (4 XP buys nothing at skill 0).
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0 }, { butcher: 0 }, []);
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0 }, { butcher: 4 }, []);
    if (seed === 1502) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
  };
  corpus(dir, SEEDS16, mk);
  const out = runAnalyzer(dir);
  check('N wastedXp-counted', /ladder seed 1502: BEFORE spec0pos=0 foodXp0pos=0 foodXpEnd=0 \| AFTER spec0pos=0 foodXp0pos=1 foodXpEnd=4 plus1pool=0 stepped=0 wastedXp=1/.test(out), out);
});

// (e) Specialist 0->positive moves count — but 7/16 is still NO-GO
// (the bar is 8/16): a below-bar count must not pass.
withDir((dir) => {
  const mk = (seed) => {
    const moveSeeds = [1502, 1504, 1603, 1604, 17101, 17102, 17103];
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0 }, { butcher: 0 }, []);
    if (!moveSeeds.includes(seed)) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
    // Under the 5-XP rung, 11 XP buys skill 2.
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 2 }, { butcher: 11 }, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  corpus(dir, SEEDS16, mk);
  const out = runAnalyzer(dir);
  check('O spec0pos-counts', /ladder seed 1502: BEFORE spec0pos=0 foodXp0pos=0 foodXpEnd=0 \| AFTER spec0pos=1 foodXp0pos=1/.test(out), out);
  check('P seven-of-sixteen-is-NO-GO', /Q1 verdict: NO-GO \(ladder moves on only 7\/16 seeds, bar 8\/16\)/.test(out), out);
});

// (f) Navigation-turn normalization: the r112 driver's THEM: (null) after
// menu:more and r114's (menu page turned) compare as the SAME body in the
// seed-1502 neutrality check (the before/after panel itself never
// funnel-repros).
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  corpus(dir, SEEDS16, mk);
  const navMaster42 = '=== r113-master42 PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nYOU: [menu:more] More things to say (1/2)\nTHEM: (null)\n(ended by engine)\nclosing: goodbye\n';
  const navBefore = '=== r114-before PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nYOU: [menu:more] More things to say (1/2)\nTHEM: (menu page turned)\n(ended by engine)\nclosing: goodbye\n';
  fs.writeFileSync(path.join(dir, 'journey-establishment-r113-master42-convo-seed1502.txt'), navMaster42);
  fs.writeFileSync(path.join(dir, 'journey-establishment-r114-before-convo-seed1502.txt'), navBefore);
  // Neutrality also needs the r113-master42 JSON (identical funnel keys:
  // the driver is trajectory-neutral, so the r112-driver file matches the
  // r114-before file).
  fs.writeFileSync(path.join(dir, 'journey-establishment-r113-master42-seed1502.json'),
    fs.readFileSync(path.join(dir, 'journey-establishment-r114-before-seed1502.json'), 'utf8'));
  const out = runAnalyzer(dir);
  check('Q nav-normalized-neutral', /DRIVER-NEUTRALITY vs r113-driver-on-master: NEUTRAL/.test(out), out);
});

// (g) A REAL navigation difference still diverges (normalization is not a
// blanket pass): an r114-before body with an extra line must DRIFT.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  corpus(dir, SEEDS16, mk);
  const navMaster42 = '=== r113-master42 PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nYOU: [menu:more] More things to say (1/2)\nTHEM: (null)\n(ended by engine)\nclosing: goodbye\n';
  const navBefore = '=== r114-before PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nYOU: [menu:more] More things to say (1/2)\nTHEM: (menu page turned)\nTHEM: an extra line that was never said\n(ended by engine)\nclosing: goodbye\n';
  fs.writeFileSync(path.join(dir, 'journey-establishment-r113-master42-convo-seed1502.txt'), navMaster42);
  fs.writeFileSync(path.join(dir, 'journey-establishment-r114-before-convo-seed1502.txt'), navBefore);
  fs.writeFileSync(path.join(dir, 'journey-establishment-r113-master42-seed1502.json'),
    fs.readFileSync(path.join(dir, 'journey-establishment-r114-before-seed1502.json'), 'utf8'));
  const out = runAnalyzer(dir);
  check('R real-diff-still-drifts', /DRIVER-NEUTRALITY vs r113-driver-on-master: DRIFT:/.test(out), out);
});

// (h) Missing snapshots reported, not crashed.
withDir((dir) => {
  corpus(dir, SEEDS16, () => ({ d1: null, d14: null, d28: null, dEnd: null }));
  const out = runAnalyzer(dir);
  check('S missing-snapshots-reported', /MISSING SNAPSHOTS \(instrument gap\)/.test(out), out);
});

// (LIVE) gate proof + menu:more proof on one harness-loaded Game.
(async () => {
  const { loadGame, setupGame } = require('./sim-harness');
  let Game;
  try {
    ({ Game } = await loadGame({ seed: 1502, mode: 'mvc', fullTelemetry: false }));
    await setupGame(Game);
  } catch (e) {
    check('R live-game-loads', false, 'loadGame/setupGame: ' + (e && e.message));
    finish();
    return;
  }
  check('R live-game-loads', !!Game && typeof Game.specialistSkill === 'function');

  // Q1 GATE PROOF (live code, synthetic persons — no state writes):
  // the self-taught ladder (r114 tuning): 5 XP buys skill 1, +1 per
  // further 5 XP (10 -> 2, 15 -> 3, cap 3); holders unchanged (+1 at
  // 5 XP); and the raw-record shape reads XP too (game.js call sites
  // pass getPerson records, not villagePeople wrappers). BEFORE the fix
  // these FAIL (xp5 -> 0, xp10 -> 1); AFTER they PASS.
  try {
    const forg4 = Game.specialistSkill({ formerOccupation: 'forager', _src: { foodXp: { butcher: 4 } } }, 'butcher');
    check('T gate-selftaught-xp4-stays-zero', forg4 === 0, `forager butcher xp4 -> ${forg4} (want 0)`);
    const forg5 = Game.specialistSkill({ formerOccupation: 'forager', _src: { foodXp: { butcher: 5 } } }, 'butcher');
    check('U gate-selftaught-xp5-buys-one', forg5 === 1, `forager butcher xp5 -> ${forg5} (want 1)`);
    const forg9 = Game.specialistSkill({ formerOccupation: 'forager', _src: { foodXp: { butcher: 9 } } }, 'butcher');
    check('V gate-selftaught-xp9-stays-one', forg9 === 1, `forager butcher xp9 -> ${forg9} (want 1)`);
    const forg10 = Game.specialistSkill({ formerOccupation: 'forager', _src: { foodXp: { butcher: 10 } } }, 'butcher');
    check('W gate-selftaught-xp10-buys-two', forg10 === 2, `forager butcher xp10 -> ${forg10} (want 2)`);
    const forg14 = Game.specialistSkill({ formerOccupation: 'forager', _src: { foodXp: { butcher: 14 } } }, 'butcher');
    check('X gate-selftaught-xp14-stays-two', forg14 === 2, `forager butcher xp14 -> ${forg14} (want 2)`);
    const forg15 = Game.specialistSkill({ formerOccupation: 'forager', _src: { foodXp: { butcher: 15 } } }, 'butcher');
    check('Y gate-selftaught-xp15-buys-three', forg15 === 3, `forager butcher xp15 -> ${forg15} (want 3)`);
    const forg100 = Game.specialistSkill({ formerOccupation: 'forager', _src: { foodXp: { butcher: 100 } } }, 'butcher');
    check('Z gate-selftaught-xp100-caps-three', forg100 === 3, `forager butcher xp100 -> ${forg100} (want 3)`);
    const fish5 = Game.specialistSkill({ formerOccupation: 'fisherman', _src: { foodXp: { butcher: 5 } } }, 'butcher');
    check('AA gate-holder-xp5-steps-up', fish5 === 3, `fisherman butcher xp5 -> ${fish5} (want 3)`);
    const fish4 = Game.specialistSkill({ formerOccupation: 'fisherman', _src: { foodXp: { butcher: 4 } } }, 'butcher');
    check('AB gate-holder-xp4-holds', fish4 === 2, `fisherman butcher xp4 -> ${fish4} (want 2)`);
    const bake5 = Game.specialistSkill({ formerOccupation: 'baker', _src: { foodXp: { cook: 5 } } }, 'cook');
    check('AC gate-baker-cook-xp5-steps-up', bake5 === 3, `baker cook xp5 -> ${bake5} (want 3)`);
    // Raw-record shape: a getPerson record carries foodXp directly (no
    // _src) — the smoke-rack skill read and the driver snapshot pass this
    // shape, so the gate must read it.
    const raw5 = Game.specialistSkill({ formerOccupation: 'forager', foodXp: { preserver: 5 } }, 'preserver');
    check('AD gate-raw-record-xp5-buys-one', raw5 === 1, `raw-record forager preserver xp5 -> ${raw5} (want 1)`);
    const raw4 = Game.specialistSkill({ formerOccupation: 'forager', foodXp: { preserver: 4 } }, 'preserver');
    check('AE gate-raw-record-xp4-stays-zero', raw4 === 0, `raw-record forager preserver xp4 -> ${raw4} (want 0)`);
    const raw0 = Game.specialistSkill({ formerOccupation: 'forager', foodXp: {} }, 'preserver');
    check('AF gate-raw-record-no-xp-stays-zero', raw0 === 0, `raw-record forager preserver xp0 -> ${raw0} (want 0)`);
  } catch (e) {
    check('T gate-selftaught-xp4-stays-zero', false, 'specialistSkill threw: ' + (e && e.message));
  }

  // Q1 EVENT PROOFS (live Game, real duty resolutions — state writes only
  // on this test Game, discarded after):
  // (i) smoke racks: a cook-duty resolution that preserves >=1 batch
  // grants the cook +1 foodXp['preserver'] PER BATCH (r114 per-batch
  // grant: n batches -> +n). The single-stack case below is n=1 (+1);
  // the two-stack case (BF, after the negative) is n=2 (+2) and is the
  // before/after discriminator: the old +1/resolution grants +1 there.
  // (ii) smoke racks, negative: a resolution that preserves nothing
  // grants nothing.
  // (iii) hunt kill: a villagerHuntResolve kill grants the hunter +1
  // foodXp['butcher'] (chance forced with a stubbed Math.random — the
  // grant, not the stalk, is under test).
  // (iv) hunt fail: a failed stalk grants nothing.
  try {
    const v = Game.state.village || {};
    const day = (Game.state.scholar || {}).day || 1;
    const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
    const cookVid = living[0];
    const cookBefore = (((Game.getPerson(cookVid) || {}).foodXp || {}).preserver) || 0;
    // Craft an about-to-rot surplus stack: spoilDay day+1 (eligible:
    // sd-day<=2, not spoiled), 10000 kcal against a ~3000 kcal reserve,
    // so part of the stack must hit the racks (budget 4000).
    v.pantry = v.pantry || [];
    v.pantry.push({ name: 'Test haunch', kcalEach: 1000, units: 10, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
    let preserved = 0;
    try { preserved = ((Game.state.village.pantry || []).filter(it => it && it.foodState === 'preserved').length); } catch (e) {}
    try { Game.resolveOneAssignment(cookVid, { task: 'cook' }); } catch (e) { check('BA rack-grant-resolution-runs', false, 'resolveOneAssignment threw: ' + (e && e.message)); }
    const cookAfter = (((Game.getPerson(cookVid) || {}).foodXp || {}).preserver) || 0;
    let preservedAfter = 0;
    try { preservedAfter = ((Game.state.village.pantry || []).filter(it => it && it.foodState === 'preserved').length); } catch (e) {}
    check('BA rack-grant-preserves-a-batch', preservedAfter > preserved, `preserved stacks before=${preserved} after=${preservedAfter}`);
    check('BB rack-grant-cook-earns-preserver-xp', preservedAfter > preserved && cookAfter === cookBefore + 1, `cook foodXp preserver before=${cookBefore} after=${cookAfter} (1 batch -> +1)`);
    // (ii) negative: no eligible surplus -> nothing preserved, no XP.
    // Remove every preservable stack (spoilDay<=day+2) so the racks stay shut.
    try {
      const vv = Game.state.village;
      vv.pantry = (vv.pantry || []).filter(it => !it || it.foodState === 'preserved' || it.foodState === 'rendered' || (it.spoilDay != null && it.spoilDay - day > 2));
      const b2 = (((Game.getPerson(cookVid) || {}).foodXp || {}).preserver) || 0;
      const p2 = ((vv.pantry || []).filter(it => it && it.foodState === 'preserved').length);
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      const a2 = (((Game.getPerson(cookVid) || {}).foodXp || {}).preserver) || 0;
      const p2a = ((vv.pantry || []).filter(it => it && it.foodState === 'preserved').length);
      check('BC rack-no-preserve-no-xp', p2a === p2 && a2 === b2, `preserved ${p2}->${p2a}, xp ${b2}->${a2}`);
    } catch (e) { check('BC rack-no-preserve-no-xp', false, 'negative rack check threw: ' + (e && e.message)); }
    // (i-b) TWO batches in one resolution -> +2 XP (r114 per-batch grant).
    // The pantry is clear of eligible surplus after BC, so the two crafted
    // stacks are the only eligible items. Reserve (250 x roster, ~3000)
    // keeps 3 units of the first stack fresh; its remaining 2 units and
    // 2 units of the second stack convert under the 4000-kcal budget:
    // n=2 batches, so the grant must be +2 (old code: +1).
    try {
      const vv = Game.state.village;
      vv.pantry = vv.pantry || [];
      vv.pantry.push({ name: 'Test haunch A', kcalEach: 1000, units: 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      vv.pantry.push({ name: 'Test haunch B', kcalEach: 1000, units: 5, foodState: 'cleaned', foodKind: 'meat', spoilDay: day + 1 });
      const b3 = (((Game.getPerson(cookVid) || {}).foodXp || {}).preserver) || 0;
      const p3 = ((vv.pantry || []).filter(it => it && it.foodState === 'preserved').length);
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      const a3 = (((Game.getPerson(cookVid) || {}).foodXp || {}).preserver) || 0;
      const p3a = ((vv.pantry || []).filter(it => it && it.foodState === 'preserved').length);
      check('BF rack-two-batches-grant-two-xp', p3a === p3 + 2 && a3 === b3 + 2, `preserved ${p3}->${p3a}, xp ${b3}->${a3} (want +2 preserved, +2 xp)`);
    } catch (e) { check('BF rack-two-batches-grant-two-xp', false, 'two-batch rack check threw: ' + (e && e.message)); }
    // (iii)/(iv) hunt kill / fail via stubbed Math.random.
    const hunterVid = living[1] || living[0];
    const hBefore = (((Game.getPerson(hunterVid) || {}).foodXp || {}).butcher) || 0;
    const _rnd = Math.random;
    try {
      Math.random = () => 0; // every draw succeeds: the stalk lands, the kill is cleaned
      const rKill = Game.villagerHuntResolve(hunterVid, 1.0);
      const hAfterKill = (((Game.getPerson(hunterVid) || {}).foodXp || {}).butcher) || 0;
      check('BD hunt-kill-grants-butcher-xp', (rKill && rKill.kcal > 0) && hAfterKill === hBefore + 1, `kill kcal=${rKill && rKill.kcal}, butcher xp ${hBefore}->${hAfterKill}`);
      Math.random = () => 0.999999; // every draw fails: the stalk fails
      const rFail = Game.villagerHuntResolve(hunterVid, 1.0);
      const hAfterFail = (((Game.getPerson(hunterVid) || {}).foodXp || {}).butcher) || 0;
      check('BE hunt-fail-grants-nothing', (rFail && rFail.kcal === 0) && hAfterFail === hAfterKill, `fail kcal=${rFail && rFail.kcal}, butcher xp ${hAfterKill}->${hAfterFail}`);
    } finally {
      Math.random = _rnd;
    }
  } catch (e) {
    check('BA rack-grant-preserves-a-batch', false, 'event proofs threw: ' + (e && e.message) + '\n' + (e && e.stack || ''));
  }

  // Q2 menu:more PROOF (live convo, real transcript):
  // (i) ignored branch, fully natural: the opening menu is short
  // (menuPages 1), so menu:more is ignored — but must still carry the
  // current line, not undefined.
  // (ii) paging branch, forced pagination state on the real convo object
  // (the pagination path itself is exercised, not stubbed): menu:more
  // must return navigation:true AND line === the last 'them' line.
  try {
    const roster = ((Game.state.village || {}).roster || []).filter(id => String(id) !== String(Game.villagerId));
    let vid = null, r0 = null;
    for (const id of roster) {
      try { if (((Game.getPerson(id) || {}).dead)) continue; } catch (e) { continue; }
      try {
        const r = Game.startConvo(id);
        if (r && typeof r.line === 'string' && r.line.length > 0) { vid = id; r0 = r; break; }
        try { Game.endConvo(id, 'done'); } catch (e2) {}
      } catch (e) { /* try the next villager */ }
      if (vid) break;
    }
    if (!vid) { check('AJ menumore-live-villager', false, 'no living non-player villager opened a convo'); }
    else {
      // r0 is the opening return from the successful startConvo above.
      const openLine = r0 && r0.line;
      check('AK menumore-opening-line', typeof openLine === 'string' && openLine.length > 0, `opening line: ${String(openLine).slice(0, 80)}`);
      const currentLine = (() => { try { const ui = Game.convoUI ? Game.convoUI(vid) : null; return ui ? ui.line : null; } catch (e) { return null; } })();
      check('AL menumore-current-line-known', typeof currentLine === 'string' && currentLine.length > 0, `convoUI line: ${String(currentLine).slice(0, 80)}`);
      // (i) ignored branch (natural short menu).
      const rIgn = Game.convoTurn(vid, 'menu:more');
      check('AM menumore-ignored-carries-line', !!(rIgn && rIgn.ignored && rIgn.navigation && typeof rIgn.line === 'string' && rIgn.line.length > 0 && rIgn.line === currentLine),
        `ignored return: ${JSON.stringify(rIgn && { ignored: rIgn.ignored, navigation: rIgn.navigation, line: rIgn.line }).slice(0, 200)}`);
      // (ii) paging branch (forced pagination state on the real convo).
      const c = Game.convoGet ? Game.convoGet(vid) : null;
      if (!c || typeof c !== 'object') {
        check('AN menumore-paging-carries-line', false, 'convoGet unavailable');
      } else {
        c.menuPages = 2; c.menuPage = 0;
        const rPage = Game.convoTurn(vid, 'menu:more');
        const lastThem = (() => {
          try {
            const tr = (Game.convoGet(vid).transcript || []).filter(e => e && e.who === 'them');
            return tr.length ? tr[tr.length - 1].text : null;
          } catch (e) { return null; }
        })();
        check('AN menumore-paging-carries-line', !!(rPage && rPage.navigation && !rPage.ignored && typeof rPage.line === 'string' && rPage.line.length > 0 && rPage.line === lastThem),
          `paging return line: ${String(rPage && rPage.line).slice(0, 160)} vs lastThem: ${String(lastThem).slice(0, 160)}`);
        check('AO menumore-paging-advances-page', !!(rPage && rPage.choices && rPage.choices.length > 0), `choices after page: ${(rPage && rPage.choices || []).length}`);
      }
      try { Game.endConvo(vid, 'done'); } catch (e) {}
    }
  } catch (e) {
    check('AJ menumore-live-villager', false, 'menu:more live check threw: ' + (e && e.message) + '\n' + (e && e.stack || ''));
  }

  // (LIVE) det-gate: r114 driver 5d seed 1502 (HUNTSTAFF=2) reproduces the
  // committed r113-driver-on-master seed-1502 funnel keys at day 6.
  (function detGate() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r114-detgate-'));
    try {
      const env = Object.assign({}, process.env, { SEEDS: '1502', DAYS: '5', TAG: 'r114-detgate', EVID: dir, HUNTSTAFF: '2' });
      let stdout = '';
      try {
        stdout = execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
      } catch (e) {
        check('AP det-gate-driver-runs', false, 'driver exit/timeout: ' + (e && e.message));
        return;
      }
      const got = JSON.parse(fs.readFileSync(path.join(dir, 'journey-establishment-r114-detgate-seed1502.json'), 'utf8'));
      const ref = JSON.parse(fs.readFileSync(R113_MASTER5_REF, 'utf8'));
      const day6got = (got.daily || []).find(r => r.day === 6);
      const day6ref = (ref.daily || []).find(r => r.day === 6);
      check('AP det-gate-driver-runs', /SEED 1502: endDay=6/.test(stdout) && new RegExp('practiceSnaps=d1:' + (ref.startCensus || []).length).test(stdout), stdout.slice(0, 400));
      check('AQ det-gate-endDay', got.endDay === 6 && got.endDay === ref.daily[4].day, `got endDay=${got.endDay}`);
      check('AR det-gate-day6-alive-pantry', !!day6got && !!day6ref && day6got.alive === day6ref.alive && day6got.pantryKcal === day6ref.pantryKcal,
        `got day6=${JSON.stringify(day6got)} ref day6=${JSON.stringify(day6ref)}`);
      const deathsGot = (got.deaths || []).filter(d => d.day <= 6).map(d => [d.day, d.cause, d.kind, d.player]);
      const deathsRef = (ref.deaths || []).filter(d => d.day <= 6).map(d => [d.day, d.cause, d.kind, d.player]);
      check('AS det-gate-deaths-to-d6', JSON.stringify(deathsGot) === JSON.stringify(deathsRef),
        `got=${JSON.stringify(deathsGot)} ref=${JSON.stringify(deathsRef)}`);
      const skillsGot = (got.skillRows || []).filter(r => r.day <= 6).length;
      const skillsRef = (ref.skillRows || []).filter(r => r.day <= 6).length;
      check('AT det-gate-skillRows-to-d6', skillsGot === skillsRef, `got=${skillsGot} ref=${skillsRef}`);
      check('AU det-gate-snapshots-present', !!got.practice && !!got.practice.d1 && got.practice.d1.snap.length > 0 &&
        !!got.practice.dEnd && got.practice.d14 === null && got.practice.d28 === null,
        `practice=${JSON.stringify(got.practice || {}).slice(0, 200)}`);
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
