// Proof test for landing r112 Q2 instrument fix
// (scripts/analyze-landing-r104-20261105.js, r111-named, analyzer-only):
//   EAMON FALLBACK — a starvation death landing after the last snapshot
//   (horizon-day deaths) has no autopsy, so the analyzer printed
//   pantryAtDeath='?'. The series snap's pantryKcal is the SAME measure as
//   the autopsy pantryEdible (both sum pantry units x kcalEach), so the
//   analyzer now falls back to the last series snap with day <= death day
//   and labels the source: `pantryAtDeath=<v> (series d<N>, no autopsy)`.
//   An autopsy, when present, is still used unlabeled. The fallback value
//   also feeds the scholar D/E join (a horizon-day Haven scholar death is
//   now classified D/E on the same measure instead of unexplained).
// Runs the REAL analyzer on synthetic corpora (r51 pattern: temp dirs under
// os.tmpdir, removed after). No game code, no repo writes.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r104-20261105.js');
const DRIVER = path.join(__dirname, 'journey-landing-r112-20261107.js');
const PRACTICE_ANALYZER = path.join(__dirname, 'analyze-landing-r112-practice.js');
const analyzer = fs.readFileSync(ANALYZER, 'utf8');
const driver = fs.readFileSync(DRIVER, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// Shape checks (the fix exists where the prereg says it does).
check('A analyzer-pantryAtDeathFor-helper', /pantryAtDeathFor/.test(analyzer) && /series d/.test(analyzer) && /no autopsy/.test(analyzer));
check('B analyzer-autopsy-still-first', /starvAutopsies/.test(analyzer) && /pantryEdible/.test(analyzer));
check('C driver-seeds-1053-1062', /\[1053, 1054, 1055, 1056, 1057, 1058, 1059, 1060, 1061, 1062\]/.test(driver));
check('D driver-outdir-landing-r112', /landing-r112/.test(driver));
check('E driver-practice-instrument', /function practiceSnapshot/.test(driver) && /practice: \{ d1: ctx\._practiceD1/.test(driver) && /ctx\._practiceD14 = practiceSnapshot/.test(driver));
check('F practice-analyzer-exists', fs.existsSync(PRACTICE_ANALYZER) && /PRACTICE: GO/.test(fs.readFileSync(PRACTICE_ANALYZER, 'utf8')) && /PRACTICE: NO-GO/.test(fs.readFileSync(PRACTICE_ANALYZER, 'utf8')));

function corpus(dir, seed, opts) {
  const horizon = 28;
  const series = [];
  for (let d = 1; d <= horizon; d++) {
    const snap = { day: d, pop: 12, villageGrief: 0, scholarKcal: 2400,
      scholarHydration: 80, loc: 'haven', journalHolder: 'h1',
      flesh: { foodSafe: {} } };
    // opts.pantryKcal: number (all days), function(day)->number, or null (omit the field).
    if (opts.pantryKcal === undefined || opts.pantryKcal === null) {
      if (opts.pantryKcal !== null) snap.pantryKcal = 20000;
    } else if (typeof opts.pantryKcal === 'function') snap.pantryKcal = opts.pantryKcal(d);
    else snap.pantryKcal = opts.pantryKcal;
    series.push(snap);
  }
  const c = {
    seed, systemDay: 8, series,
    deaths: opts.deaths || [],
    mantleLog: opts.mantleLog || [],
    awayDayDigest: [], starvAutopsies: opts.starvAutopsies || [], r41Summary: {},
    census: [{ id: 'h1', name: 'Test' }, { id: 'other1', name: 'Other' }],
    contestsHeld: 0, contestLedger: [], contestDeathAutopsies: [],
    villagerDeaths: (opts.deaths || []).filter(x => x.kind === 'villager'),
    monsterKills: [], finalGrief: 0,
    spawn: { scholarId: 'h1', scholarName: 'Test' },
    fleshArc: { pantryByDay: [], transitions: [], streamCounts: {}, experimentLines: [], haulSeenLines: [] },
  };
  fs.writeFileSync(path.join(dir, `journey-landing-r62-census-${seed}.json`), JSON.stringify(c));
}
function runAnalyzer(dir) {
  return execFileSync(process.execPath, [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-r112-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
const starvLines = (out) => (out.match(/STARVATION d\d+ [^\n]*/g) || []).join('\n');
const classLines = (out) => (out.match(/-> CAUSE CLASS [^\n]*/g) || []).join('\n');

// (a) Horizon-day NPC death, no autopsy -> series pantry with label.
withDir((dir) => {
  corpus(dir, 9001, { deaths: [{ who: 'other1', day: 28, cause: 'starvation', kind: 'villager' }] });
  const out = runAnalyzer(dir);
  const lines = starvLines(out);
  check('G horizon-NPC-no-autopsy-series-pantry', /pantryAtDeath=20000 \(series d28, no autopsy\)/.test(lines), lines);
  check('H horizon-NPC-class-F', /CAUSE CLASS F/.test(classLines(out)), classLines(out));
});

// (b) Horizon-day SCHOLAR death, no autopsy -> series pantry + class E (Haven, pantry > 0).
withDir((dir) => {
  corpus(dir, 9002, { deaths: [{ who: 'h1', day: 28, cause: 'starvation', kind: 'villager' }] });
  const out = runAnalyzer(dir);
  const lines = starvLines(out);
  check('I horizon-scholar-no-autopsy-series-pantry', /pantryAtDeath=20000 \(series d28, no autopsy\)/.test(lines), lines);
  check('J horizon-scholar-class-E', /CAUSE CLASS E/.test(classLines(out)), classLines(out));
});

// (c) Death WITH autopsy -> autopsy value, no label.
withDir((dir) => {
  corpus(dir, 9003, {
    deaths: [{ who: 'other1', day: 28, cause: 'starvation', kind: 'villager' }],
    starvAutopsies: [{ who: 'other1', day: 28, pantryEdible: 1234 }],
  });
  const out = runAnalyzer(dir);
  const lines = starvLines(out);
  check('K autopsy-wins-unlabeled', /pantryAtDeath=1234(?!\s*\()/.test(lines) && !/no autopsy/.test(lines), lines);
});

// (d) Non-horizon death (d20), no autopsy -> last snap <= d20 (pantry steps down after d20).
withDir((dir) => {
  corpus(dir, 9004, {
    pantryKcal: (day) => (day <= 20 ? 20000 : 5000),
    deaths: [{ who: 'other1', day: 20, cause: 'starvation', kind: 'villager' }],
  });
  const out = runAnalyzer(dir);
  const lines = starvLines(out);
  check('L mid-horizon-no-autopsy-last-snap', /pantryAtDeath=20000 \(series d20, no autopsy\)/.test(lines), lines);
});

// (e) No pantry anywhere (snaps carry no pantryKcal, no autopsy) -> honest '?'.
withDir((dir) => {
  corpus(dir, 9005, {
    pantryKcal: null,
    deaths: [{ who: 'other1', day: 28, cause: 'starvation', kind: 'villager' }],
  });
  const out = runAnalyzer(dir);
  const lines = starvLines(out);
  check('M no-pantry-anywhere-honest-question', /pantryAtDeath=\?/.test(lines), lines);
});

// (f) No bare '?' on a normal horizon death: the (a) corpus has zero '?'.
withDir((dir) => {
  corpus(dir, 9006, { deaths: [{ who: 'other1', day: 28, cause: 'starvation', kind: 'villager' }] });
  const out = runAnalyzer(dir);
  check('N no-bare-question-on-covered-death', !/pantryAtDeath=\?/.test(starvLines(out)), starvLines(out));
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
