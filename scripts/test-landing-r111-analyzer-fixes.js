// Proof test for landing r111 instrument fixes
// (scripts/analyze-landing-r104-20261105.js, r110-named, analyzer-only):
//   Fix A — NO-ARRIVAL split: peak===0 seeds are NO-ARRIVAL-TESTED when any
//     test happened (transitions OR stream experiments OR experiment lines —
//     transitions alone undercount: r110 seed 1042 had 7 experiments but 6
//     transitions) and NO-ARRIVAL-UNTESTED when no test happened at all.
//     The R62 summary gains noArrivalTested/noArrivalUntested counts.
//   Fix B — scholarDeaths counts ALL scholar deaths: final-holder deaths
//     (unresolved-at-horizon AND no-successor NO-GO) now count, with the
//     unresolved ones broken out on the summary line. (r110 showed
//     scholarDeaths=2 for 3 scholar deaths; the d28 one was invisible.)
// Runs the REAL analyzer on synthetic corpora (r51 pattern: temp dirs under
// os.tmpdir, removed after). No game code, no repo writes.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r104-20261105.js');
const DRIVER = path.join(__dirname, 'journey-landing-r111-20261106.js');
const analyzer = fs.readFileSync(ANALYZER, 'utf8');
const driver = fs.readFileSync(DRIVER, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// Shape checks (the fixes exist where the prereg says they do).
check('A analyzer-no-arrival-split-labels',
  /NO-ARRIVAL-TESTED/.test(analyzer) && /NO-ARRIVAL-UNTESTED/.test(analyzer) &&
  !/peak === 0 \? 'NO-ARRIVAL'/.test(analyzer));
check('B analyzer-tested-any-uses-experiments',
  /testedAny/.test(analyzer) && /sc\.experiments/.test(analyzer) &&
  /experimentLines/.test(analyzer));
check('C analyzer-scholarDeaths-unresolved-breakout',
  /scholarDeathsUnresolved/.test(analyzer) &&
  /scholarDeaths=\$\{scholarDeaths\} \(unresolved=/.test(analyzer));
check('D analyzer-final-holder-counted',
  /seedScholarDeaths\+\+/.test(analyzer) &&
  /Accumulate AFTER the final-holder block/.test(analyzer));
check('E driver-seeds-1043-1052',
  /\[1043, 1044, 1045, 1046, 1047, 1048, 1049, 1050, 1051, 1052\]/.test(driver));
check('F driver-outdir-landing-r111', /landing-r111/.test(driver));

function corpus(dir, seed, opts) {
  const horizon = 28;
  const series = [];
  for (let d = 1; d <= horizon; d++) {
    series.push({ day: d, pop: 12, villageGrief: 0, scholarKcal: 2400,
      pantryKcal: 20000, scholarHydration: 80, loc: 'haven', journalHolder: 'h1',
      flesh: { foodSafe: {} } });
  }
  const fleshArc = opts.fleshArc || { pantryByDay: [], transitions: [],
    streamCounts: {}, experimentLines: [], haulSeenLines: [] };
  const c = {
    seed, systemDay: 8, series,
    deaths: opts.deaths || [],
    mantleLog: opts.mantleLog || [],
    awayDayDigest: [], starvAutopsies: [], r41Summary: {},
    census: [{ id: 'h1', name: 'Test' }, { id: 'other1', name: 'Other' }],
    contestsHeld: 0, contestLedger: [], contestDeathAutopsies: [],
    villagerDeaths: (opts.deaths || []).filter(x => x.kind === 'villager'),
    monsterKills: [], finalGrief: 0,
    spawn: { scholarId: 'h1', scholarName: 'Test' },
    fleshArc,
  };
  fs.writeFileSync(path.join(dir, `journey-landing-r62-census-${seed}.json`), JSON.stringify(c));
}
function runAnalyzer(dir) {
  return execFileSync(process.execPath, [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-r111-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
const fleshLine = (out) => (out.match(/R62 FLESH[^\n]*/g) || []).join(' | ');
const summaryLine = (out) => (out.match(/SUMMARY: [^\n]*/g) || []).join(' | ');
const r62Line = (out) => (out.match(/R62 FLESH \(monster-meat tail\):[^\n]*/g) || []).join(' | ');

// G: NO-ARRIVAL-TESTED — peak 0, transitions present (the r110 shape).
withDir((dir) => {
  corpus(dir, 9101, { fleshArc: {
    pantryByDay: [{ day: 1, unknownFleshUnits: 0 }, { day: 28, unknownFleshUnits: 0 }],
    transitions: [
      { day: 8, mid: 'glasswing', how: 'tested', testedBy: 'Chantal' },
      { day: 9, mid: 'nightcourt', how: 'tested', testedBy: 'Ella' }],
    streamCounts: { haulsSeen: 0, deposits: 2, experiments: 2, reveals: 2, poisonVerdicts: 0, rotLines: 0 },
    experimentLines: ['Chantal sets aside time with Glasswing Darter flesh.'],
    haulSeenLines: [] } });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('G no-arrival-tested-transitions', false, e.message); return; }
  check('G no-arrival-tested-transitions',
    /NO-ARRIVAL-TESTED/.test(fleshLine(out)) && !/NO-ARRIVAL-UNTESTED/.test(out),
    fleshLine(out));
});

// H: NO-ARRIVAL-UNTESTED — peak 0, no test of any kind.
withDir((dir) => {
  corpus(dir, 9102, { fleshArc: {
    pantryByDay: [{ day: 1, unknownFleshUnits: 0 }, { day: 28, unknownFleshUnits: 0 }],
    transitions: [],
    streamCounts: { haulsSeen: 0, deposits: 0, experiments: 0, reveals: 0, poisonVerdicts: 0, rotLines: 0 },
    experimentLines: [], haulSeenLines: [] } });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('H no-arrival-untested', false, e.message); return; }
  check('H no-arrival-untested', /NO-ARRIVAL-UNTESTED/.test(fleshLine(out)), fleshLine(out));
});

// I: NO-ARRIVAL-TESTED via experiments only — the r110 seed-1042 gap shape
// (7 experiments, 6 transitions, poison test with no transition): zero
// transitions must NOT read as untested.
withDir((dir) => {
  corpus(dir, 9103, { fleshArc: {
    pantryByDay: [{ day: 1, unknownFleshUnits: 0 }, { day: 28, unknownFleshUnits: 0 }],
    transitions: [],
    streamCounts: { haulsSeen: 0, deposits: 0, experiments: 2, reveals: 1, poisonVerdicts: 1, rotLines: 0 },
    experimentLines: ['Sophia sets aside time with The Loud Beast flesh.',
      'Aisling sets aside time with The Loud Beast flesh.'],
    haulSeenLines: [] } });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('I no-arrival-tested-experiments-only', false, e.message); return; }
  check('I no-arrival-tested-experiments-only',
    /NO-ARRIVAL-TESTED/.test(fleshLine(out)) && !/NO-ARRIVAL-UNTESTED/.test(out),
    fleshLine(out));
});

// J: TAIL-MOVES and K: STUCK still label as before (back-compat).
withDir((dir) => {
  corpus(dir, 9104, { fleshArc: {
    pantryByDay: [{ day: 1, unknownFleshUnits: 0 }, { day: 5, unknownFleshUnits: 3 }, { day: 28, unknownFleshUnits: 0 }],
    transitions: [{ day: 9, mid: 'nightcourt', how: 'tested', testedBy: 'Desmond' }],
    streamCounts: { haulsSeen: 0, deposits: 1, experiments: 1, reveals: 1, poisonVerdicts: 0, rotLines: 0 },
    experimentLines: [], haulSeenLines: [] } });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('J tail-moves-unchanged', false, e.message); return; }
  check('J tail-moves-unchanged', /TAIL-MOVES/.test(fleshLine(out)), fleshLine(out));
});
withDir((dir) => {
  corpus(dir, 9105, { fleshArc: {
    pantryByDay: [{ day: 1, unknownFleshUnits: 0 }, { day: 5, unknownFleshUnits: 2 }, { day: 28, unknownFleshUnits: 2 }],
    transitions: [{ day: 9, mid: 'nightcourt', how: 'tested', testedBy: 'Desmond' }],
    streamCounts: { haulsSeen: 0, deposits: 1, experiments: 1, reveals: 1, poisonVerdicts: 0, rotLines: 0 },
    experimentLines: [], haulSeenLines: [] } });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('K stuck-unchanged', false, e.message); return; }
  check('K stuck-unchanged', /STUCK/.test(fleshLine(out)), fleshLine(out));
});

// L: mantle-passing scholar death counts (latency 0).
withDir((dir) => {
  corpus(dir, 9106, {
    deaths: [{ day: 10, who: 'h1', cause: 'the wild', kind: 'villager' }],
    mantleLog: [{ day: 10, from: 'h1', to: 'other1', fromName: 'Test', toName: 'Other' }] });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('L mantle-death-counted', false, e.message); return; }
  check('L mantle-death-counted',
    /SCHOLAR DEATH: Test d10 cause=the wild -> mantle Other d10 latency=0/.test(out) &&
    /scholarDeaths\(seed\)=1/.test(out),
    out.split('\n').filter(l => /SCHOLAR/.test(l)).join(' | '));
});

// M: final-holder death inside the +4 tail counts as a scholar death and is
// broken out as unresolved (the r110 seed-1035 shape: Jasper d28).
withDir((dir) => {
  corpus(dir, 9107, {
    deaths: [{ day: 26, who: 'h1', cause: 'the wild', kind: 'villager' }],
    mantleLog: [] });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('M final-holder-unresolved-counted', false, e.message); return; }
  check('M final-holder-unresolved-counted',
    /UNRESOLVED-AT-HORIZON/.test(out) && /counted in scholarDeaths \(unresolved\)/.test(out) &&
    /scholarDeaths\(seed\)=1/.test(out) &&
    /scholarDeaths=1 \(unresolved=1\) on 1\/1 seeds/.test(summaryLine(out)),
    summaryLine(out));
});

// N: final-holder death outside the tail (NO-GO) also counts.
withDir((dir) => {
  corpus(dir, 9108, {
    deaths: [{ day: 10, who: 'h1', cause: 'the wild', kind: 'villager' }],
    mantleLog: [] });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('N final-holder-nogo-counted', false, e.message); return; }
  check('N final-holder-nogo-counted',
    /NO-SUCCESSOR NO-GO/.test(out) && /counted in scholarDeaths/.test(out) &&
    /scholarDeaths\(seed\)=1/.test(out) &&
    /scholarDeaths=1 \(unresolved=0\) on 1\/1 seeds/.test(summaryLine(out)),
    summaryLine(out));
});

// O: no double-count — mantle chain A->B d5, B dies d20 as final holder:
// two scholar deaths total (A via mantle, B via final-holder block).
withDir((dir) => {
  corpus(dir, 9109, {
    deaths: [
      { day: 5, who: 'h1', cause: 'the wild', kind: 'villager' },
      { day: 20, who: 'other1', cause: 'the wild', kind: 'villager' }],
    mantleLog: [{ day: 5, from: 'h1', to: 'other1', fromName: 'Test', toName: 'Other' }] });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('O chain-no-double-count', false, e.message); return; }
  check('O chain-no-double-count',
    /scholarDeaths\(seed\)=2/.test(out) &&
    /scholarDeaths=2 \(unresolved=0\) on 1\/1 seeds/.test(summaryLine(out)),
    summaryLine(out));
});

// P: aggregate panel — one mantle death, one unresolved, one NO-GO, plus one
// TESTED, one UNTESTED, one TAIL-MOVES flesh seed: summary counts all three
// deaths and both no-arrival classes, and no bare NO-ARRIVAL remains.
withDir((dir) => {
  corpus(dir, 9110, {
    deaths: [{ day: 10, who: 'h1', cause: 'the wild', kind: 'villager' }],
    mantleLog: [{ day: 10, from: 'h1', to: 'other1', fromName: 'Test', toName: 'Other' }],
    fleshArc: {
      pantryByDay: [{ day: 1, unknownFleshUnits: 0 }, { day: 28, unknownFleshUnits: 0 }],
      transitions: [{ day: 8, mid: 'glasswing', how: 'tested', testedBy: 'Chantal' }],
      streamCounts: { haulsSeen: 0, deposits: 1, experiments: 1, reveals: 1, poisonVerdicts: 0, rotLines: 0 },
      experimentLines: [], haulSeenLines: [] } });
  corpus(dir, 9111, {
    deaths: [{ day: 26, who: 'h1', cause: 'the wild', kind: 'villager' }],
    mantleLog: [],
    fleshArc: {
      pantryByDay: [{ day: 1, unknownFleshUnits: 0 }, { day: 28, unknownFleshUnits: 0 }],
      transitions: [],
      streamCounts: { haulsSeen: 0, deposits: 0, experiments: 0, reveals: 0, poisonVerdicts: 0, rotLines: 0 },
      experimentLines: [], haulSeenLines: [] } });
  corpus(dir, 9112, {
    deaths: [{ day: 10, who: 'h1', cause: 'the wild', kind: 'villager' }],
    mantleLog: [],
    fleshArc: {
      pantryByDay: [{ day: 1, unknownFleshUnits: 0 }, { day: 5, unknownFleshUnits: 3 }, { day: 28, unknownFleshUnits: 0 }],
      transitions: [{ day: 9, mid: 'nightcourt', how: 'tested', testedBy: 'Desmond' }],
      streamCounts: { haulsSeen: 0, deposits: 1, experiments: 1, reveals: 1, poisonVerdicts: 0, rotLines: 0 },
      experimentLines: [], haulSeenLines: [] } });
  let out = '';
  try { out = runAnalyzer(dir); } catch (e) { check('P aggregate-counts', false, e.message); return; }
  const bareNoArrival = (out.match(/-> NO-ARRIVAL(?![-A-Z])/g) || []).length;
  check('P aggregate-counts',
    /scholarDeaths=3 \(unresolved=1\) on 3\/3 seeds/.test(summaryLine(out)) &&
    /noArrivalTested=1 noArrivalUntested=1/.test(r62Line(out)) &&
    /noSuccessorNoGo=1 unresolvedAtHorizon=1/.test(out) &&
    bareNoArrival === 0,
    summaryLine(out) + ' | ' + r62Line(out) + ` | bareNO-ARRIVAL=${bareNoArrival}`);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
