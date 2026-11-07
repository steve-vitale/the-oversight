// Proof test for landing r112 Q1 practice instrument + analyzer
// (scripts/journey-landing-r112-20261107.js practiceSnapshot, and
// scripts/analyze-landing-r112-practice.js):
//   The driver snapshots per-villager competence/practice/specialist/foodXp/
//   npcSkills at d1/d14/d28; the analyzer counts moved competence cells
//   d1->d28 (same villager id in both snaps), skill 0->positive moves, and
//   practice reps. Attribution: a moved cell counts as ATTRIBUTED when the
//   villager holds practice reps > 0 in that task at d28.
// Runs the REAL analyzer on synthetic corpora (r51 pattern: temp dirs under
// os.tmpdir, removed after). No game code, no repo writes.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r112-practice.js');
const DRIVER = path.join(__dirname, 'journey-landing-r112-20261107.js');
const driver = fs.readFileSync(DRIVER, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

check('A driver-practice-snapshot-fn', /function practiceSnapshot/.test(driver));
check('B driver-practice-d1-d14-d28', /ctx\._practiceD1 = practiceSnapshot/.test(driver) &&
  /ctx\._practiceD14 = practiceSnapshot/.test(driver) &&
  /practice: \{ d1: ctx\._practiceD1/.test(driver));
check('C driver-practice-tasks-match-practicemove', /'hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'/.test(driver));
check('D driver-practice-specs-match', /'butcher', 'cook', 'preserver', 'spotter', 'builder'/.test(driver));

const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
function villager(id, name, occ, comp, prac, spec, food, skills) {
  const c = {}, p = {}, s = {}, f = {};
  for (const t of TASKS) { c[t] = comp[t] != null ? comp[t] : 1.0; p[t] = (prac && prac[t]) || 0; }
  for (const t of SPECS) { s[t] = (spec && spec[t] != null) ? spec[t] : 0; f[t] = (food && food[t]) || 0; }
  return { id, name, alive: true, occ, competence: c, practice: p, specialist: s, foodXp: f, npcSkills: (skills || []).slice() };
}
function corpus(dir, seed, d1, d14, d28) {
  fs.writeFileSync(path.join(dir, `journey-landing-r62-census-${seed}.json`),
    JSON.stringify({ seed, practice: { d1, d14, d28 } }));
}
function runAnalyzer(dir) {
  return execFileSync(process.execPath, [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-r112-practice-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}

// (a) One moved cell with practice reps -> GO, attributed, per-task counted.
withDir((dir) => {
  const v1d1 = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
  const v1d28 = villager('v1', 'Ana', 'forager', { forage: 1.2 }, { forage: 8 }, {}, {}, []);
  const v2 = villager('v2', 'Bo', 'smith', {}, {}, {}, {}, []);
  corpus(dir, 9101, [v1d1, v2], [v1d1, v2], [v1d28, v2]);
  const out = runAnalyzer(dir);
  check('E one-move-GO', /movedCells d1->d14=0 d1->d28=1 attributed=1/.test(out), out);
  check('F one-move-line', /Ana forage: 1 -> 1\.2 \(reps 8\)/.test(out), out);
  check('G one-move-GO-line', /PRACTICE: GO/.test(out), out);
});

// (b) Zero movement -> NO-GO.
withDir((dir) => {
  const v1 = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
  corpus(dir, 9102, [v1], [v1], [v1]);
  const out = runAnalyzer(dir);
  check('H zero-move-NO-GO', /movedCells d1->d14=0 d1->d28=0 attributed=0/.test(out) && /PRACTICE: NO-GO/.test(out), out);
});

// (c) Villager missing at d28 (died/left) is excluded, never counted as a move.
withDir((dir) => {
  const v1d1 = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
  const v1d28 = villager('v1', 'Ana', 'forager', { forage: 1.2 }, { forage: 8 }, {}, {}, []);
  const v2d1 = villager('v2', 'Bo', 'smith', {}, {}, {}, {}, []);
  // v2 absent at d28 (dead): its d1 values must not count, and v1's move still counts.
  corpus(dir, 9103, [v1d1, v2d1], [v1d1, v2d1], [v1d28]);
  const out = runAnalyzer(dir);
  check('I dead-villager-excluded', /movedCells d1->d14=0 d1->d28=1 attributed=1/.test(out), out);
});

// (d) Skill 0->positive counted (specialist + foodXp + npcSkills gained).
withDir((dir) => {
  const v1d1 = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0 }, { cook: 0 }, []);
  const v1d28 = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0.5 }, { cook: 3 }, ['herbal_remedy']);
  corpus(dir, 9104, [v1d1], [v1d1], [v1d28]);
  const out = runAnalyzer(dir);
  check('J skill-0-to-pos-counted', /skill0->pos=2/.test(out), out);
  check('K skill-lines', /butcher specialist 0->0\.5/.test(out) && /cook foodXp 0->3/.test(out) && /skill herbal_remedy/.test(out), out);
});

// (e) A moved cell with ZERO practice reps is counted but NOT attributed.
withDir((dir) => {
  const v1d1 = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
  const v1d28 = villager('v1', 'Ana', 'forager', { wood: 1.2 }, {}, {}, {}, []);
  corpus(dir, 9105, [v1d1], [v1d1], [v1d28]);
  const out = runAnalyzer(dir);
  check('L move-without-reps-unattributed', /movedCells d1->d14=0 d1->d28=1 attributed=0/.test(out), out);
  check('M unattributed-still-NO-GO', /PRACTICE: NO-GO/.test(out), out);
});

// (f) Missing snapshots reported, not crashed.
withDir((dir) => {
  fs.writeFileSync(path.join(dir, 'journey-landing-r62-census-9106.json'), JSON.stringify({ seed: 9106 }));
  const out = runAnalyzer(dir);
  check('N missing-snapshots-reported', /PRACTICE SNAPSHOTS MISSING/.test(out), out);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
