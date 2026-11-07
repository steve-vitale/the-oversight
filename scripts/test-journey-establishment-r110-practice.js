// Proof test for establishment r110 Q1 practice instrument + Q2 holder
// dating + driver trajectory-neutrality (scripts/
// journey-establishment-r110-20261107.js practiceSnapshot, and scripts/
// analyze-journey-establishment-r110-20261107.py):
//   The driver snapshots per-villager competence/practice/specialist/foodXp/
//   npcSkills at d1/d14/d28/dEnd; the analyzer counts moved competence
//   cells per window (same villager id in both snaps), skill 0->positive
//   moves, and practice reps. Attribution: a moved cell counts as
//   ATTRIBUTED when the villager holds practice reps > 0 in that task at
//   the later snapshot. Q2 dates every living dEnd field_dressing holder
//   via telemetry villager_skill day or snapshot bracket.
// Runs the REAL analyzer on synthetic corpora (r51 pattern: temp dirs
// under os.tmpdir, removed after), plus a LIVE det-gate: the r110 driver
// on 5d seed 1502 (HUNTSTAFF=2) must reproduce the committed r109
// after-panel seed-1502 funnel keys at day 6. No repo writes except the
// det-gate's temp dir (removed after).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r110-20261107.py');
const DRIVER = path.join(__dirname, 'journey-establishment-r110-20261107.js');
const R109_REF = path.join(ROOT, 'evidence', '2026-11-07', 'journey-establishment-r109-seed1502.json');
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
check('C driver-practice-tasks-match-practicemove', /'hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'/.test(driver));
check('D driver-practice-specs-match', /'butcher', 'cook', 'preserver', 'spotter', 'builder'/.test(driver));

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
  return { seed, run: 'r110', days: 42, endDay: 43, gameOver: false, startCensus: [],
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
  return '=== r110 PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\n(ended by engine)\nclosing: goodbye\n';
}
function corpusSeed(dir, tag, seed, practice, teleAll) {
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-seed${seed}.json`),
    JSON.stringify(baseSeed(seed, practice, teleAll)));
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-convo-seed${seed}.txt`), convoTxt());
}
function corpus(dir, seeds, mkPractice, mkTele) {
  // Both tags get identical funnel keys (the r109 reference is the
  // trajectory the r110 driver must reproduce); only the r110 files carry
  // the practice snapshots under test.
  for (const seed of seeds) {
    const practice = mkPractice(seed);
    corpusSeed(dir, 'r109', seed, { d1: null, d14: null, d28: null, dEnd: null }, mkTele ? mkTele(seed) : []);
    corpusSeed(dir, 'r110', seed, practice, mkTele ? mkTele(seed) : []);
  }
}
function runAnalyzer(dir) {
  return execFileSync('python3', [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r110-practice-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
const SEEDS4 = [1502, 1504, 1603, 1604];

// (a) Attributed d28->dEnd moves on 3/4 seeds -> Q1 GO, funnel reproduced.
withDir((dir) => {
  const mk = (seed) => {
    if (seed === 1604) {
      const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
      return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
    }
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    const v1e = villager('v1', 'Ana', 'forager', { forage: 1.2 }, { forage: 8 }, {}, {}, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('E three-seed-attributed-GO', /Q1 verdict: GO \(seeds with >=1 attributed d28->dEnd cell: 3\/4\)/.test(out), out);
  check('F funnel-repro', /FUNNEL-REPRO verdict: REPRODUCED/.test(out), out);
  check('G d28-dEnd-window-line', /d28-dEnd: moved=3 attributed=3 seedsWithMove=3\/4 seedsAttributed=3\/4/.test(out), out);
});

// (b) Zero movement -> Q1 NO-GO (stalls message).
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('H zero-move-NO-GO', /Q1 verdict: NO-GO \(movement stalls in month 2/.test(out), out);
});

// (c) Villager missing at dEnd (died/left) is excluded, never a move.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    const v1e = villager('v1', 'Ana', 'forager', { forage: 1.2 }, { forage: 8 }, {}, {}, []);
    const v2 = villager('v2', 'Bo', 'smith', {}, {}, {}, {}, []);
    const v2e = villager('v2', 'Bo', 'smith', { wood: 1.3 }, { wood: 5 }, {}, {}, []);
    if (seed === 1502) return { d1: snap(1, [v1, v2]), d14: snap(14, [v1, v2]), d28: snap(28, [v1, v2]), dEnd: snap(43, [v1e]) };
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('I dead-villager-excluded', /d28-dEnd: moved=1 attributed=1/.test(out), out);
});

// (d) Skill 0->positive counted (specialist + foodXp + npcSkills gained).
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0 }, { cook: 0 }, []);
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0.5 }, { cook: 3 }, ['herbal_remedy']);
    if (seed === 1502) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('J skill-0-to-pos-counted', /skill0->pos \(all windows\)=2/.test(out), out);
  check('K skill-lines', /butcher specialist 0->0\.5/.test(out) && /cook foodXp 0->3/.test(out) && /skill herbal_remedy/.test(out), out);
});

// (e) A moved cell with ZERO practice reps is counted but NOT attributed.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    const v1e = villager('v1', 'Ana', 'forager', { wood: 1.2 }, {}, {}, {}, []);
    if (seed === 1502) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('L move-without-reps-unattributed', /d28-dEnd: moved=1 attributed=0/.test(out), out);
});

// (f) Missing snapshots reported, not crashed; Q2 unexercised on the gap.
withDir((dir) => {
  corpus(dir, SEEDS4, () => ({ d1: null, d14: null, d28: null, dEnd: null }));
  const out = runAnalyzer(dir);
  check('M missing-snapshots-reported', /MISSING SNAPSHOTS \(instrument gap\)/.test(out), out);
  check('N missing-snaps-Q2-gap', /Q2 verdict: UNEXERCISED \(snapshot gap/.test(out), out);
});

// (g) Q2 dating: telemetry day + snapshot bracket both date holders.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    const v1fd = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, ['field_dressing']);
    const v2 = villager('v2', 'Bo', 'smith', {}, {}, {}, {}, []);
    const v2fd = villager('v2', 'Bo', 'smith', {}, {}, {}, {}, ['field_dressing']);
    if (seed === 1502) {
      return { d1: snap(1, [v1, v2]), d14: snap(14, [v1, v2]), d28: snap(28, [v1, v2fd]), dEnd: snap(43, [v1fd, v2fd]) };
    }
    return { d1: snap(1, [v1, v2]), d14: snap(14, [v1, v2]), d28: snap(28, [v1, v2]), dEnd: snap(43, [v1, v2]) };
  };
  const mkTele = (seed) => (seed === 1502
    ? [{ seq: 0, day: 36, type: 'villager_skill', skill: 'field_dressing', learner: 'v1', vid: 'v1' }]
    : []);
  corpus(dir, SEEDS4, mk, mkTele);
  const out = runAnalyzer(dir);
  check('O Q2-dating-GO', /Q2 verdict: GO/.test(out), out);
  check('P telemetry-date-line', /dated: seed 1502 Ana via telemetry d36/.test(out), out);
  check('Q snapshot-bracket-line', /dated: seed 1502 Bo via snapshot \(d14,d28\]/.test(out), out);
});

// (H) LIVE det-gate: r110 driver 5d seed 1502 (HUNTSTAFF=2) reproduces the
// committed r109 after-panel funnel keys at day 6.
(function detGate() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r110-detgate-'));
  try {
    const env = Object.assign({}, process.env, { SEEDS: '1502', DAYS: '5', TAG: 'r110-detgate', EVID: dir, HUNTSTAFF: '2' });
    let stdout = '';
    try {
      stdout = execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
    } catch (e) {
      check('R det-gate-driver-runs', false, 'driver exit/timeout: ' + (e && e.message));
      return;
    }
    const got = JSON.parse(fs.readFileSync(path.join(dir, 'journey-establishment-r110-detgate-seed1502.json'), 'utf8'));
    const ref = JSON.parse(fs.readFileSync(R109_REF, 'utf8'));
    const day6got = (got.daily || []).find(r => r.day === 6);
    const day6ref = (ref.daily || []).find(r => r.day === 6);
    check('R det-gate-driver-runs', /SEED 1502: endDay=6/.test(stdout) && new RegExp('practiceSnaps=d1:' + (ref.startCensus || []).length).test(stdout), stdout.slice(0, 400));
    check('S det-gate-endDay', got.endDay === 6 && got.endDay === ref.daily[4].day, `got endDay=${got.endDay}`);
    check('T det-gate-day6-alive-pantry', !!day6got && !!day6ref && day6got.alive === day6ref.alive && day6got.pantryKcal === day6ref.pantryKcal,
      `got day6=${JSON.stringify(day6got)} ref day6=${JSON.stringify(day6ref)}`);
    const deathsGot = (got.deaths || []).filter(d => d.day <= 6).map(d => [d.day, d.cause, d.kind, d.player]);
    const deathsRef = (ref.deaths || []).filter(d => d.day <= 6).map(d => [d.day, d.cause, d.kind, d.player]);
    check('U det-gate-deaths-to-d6', JSON.stringify(deathsGot) === JSON.stringify(deathsRef),
      `got=${JSON.stringify(deathsGot)} ref=${JSON.stringify(deathsRef)}`);
    const skillsGot = (got.skillRows || []).filter(r => r.day <= 6).length;
    const skillsRef = (ref.skillRows || []).filter(r => r.day <= 6).length;
    check('V det-gate-skillRows-to-d6', skillsGot === skillsRef, `got=${skillsGot} ref=${skillsRef}`);
    check('W det-gate-snapshots-present', !!got.practice && !!got.practice.d1 && got.practice.d1.snap.length > 0 &&
      !!got.practice.dEnd && got.practice.d14 === null && got.practice.d28 === null,
      `practice=${JSON.stringify(got.practice || {}).slice(0, 200)}`);
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
})();

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
