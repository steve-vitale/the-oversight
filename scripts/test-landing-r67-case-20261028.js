// Proof test for analyze-landing-r67-20261028.js R67 CASE block (landing r67).
// Question: does a case-framing line name its case TARGET (code prediction
// from betrayalCaseFrame: line built from cs.target), never an accused?
// Fixtures are the real r66 seed-687 census with only caseLedger /
// caseFramingSittings / deaths mutated, so the analyzer runs its full path.
// F1: "ambush of Luis", Luis a case target -> MATCH.
// F2: "against me" spoken to the case target -> MATCH.
// F3: "ambush of X" where X is only an accused -> MISMATCH, verdict NO-GO.
// F4: a matched case whose target dies later -> TARGET-DIED-LATER join.
// Retrospective: the real r66 corpus carries no caseFramingSittings field,
// so the analyzer must print CASE: NO-SITTINGS (instrument absence, not a
// re-score of r66).
// Run: node scripts/test-landing-r67-case-20261028.js  (exit 0 = all green)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ANALYZER = path.join(__dirname, 'analyze-landing-r67-20261028.js');
const EVID = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-28');
let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (cond ? '' : ' :: ' + (extra || '')));
  if (!cond) failures++;
}
function runAnalyzer(dir) {
  return execFileSync('node', [ANALYZER, dir], { encoding: 'utf8' });
}
const base = JSON.parse(fs.readFileSync(
  path.join(EVID, 'landing-r66', 'journey-landing-r62-census-687.json'), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r67case-'));
function fixtureDir(name, census, seed) {
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, `journey-landing-r67-census-${seed}.json`), JSON.stringify(census));
  return dir;
}
function cloneWith(seed, mutate) {
  const d = JSON.parse(JSON.stringify(base));
  d.seed = seed;
  mutate(d);
  return d;
}
function caseObj(id, day, targetName, accusedNames) {
  return { id, day, charge: 'ambush', target: 'id_' + targetName, targetName,
    accused: accusedNames.map(a => 'id_' + a), accusedNames, status: 'open', playerRole: 'bystander' };
}
// F1: target match
const f1 = cloneWith(911, (d) => {
  const c = caseObj('case_1', 9, 'Luis', ['Meera']);
  d.caseLedger = { cases: [c], plots: [] };
  d.caseFramingSittings = [{ day: 10, npc: 'Meera',
    framingLines: ["There's still the matter of the ambush of Luis. Nobody's settled it."],
    cases: [c], plots: [] }];
});
const out1 = runAnalyzer(fixtureDir('f1', f1, 911));
check('F1 target-name framing -> MATCH', /R67 CASE SITTING d10 npc=Meera -> MATCH/.test(out1), out1.slice(-600));
check('F1 verdict LABELING-GO', /R67 CASE \(labeling\):.*LABELING-GO/.test(out1));
// F2: against-me spoken to the target
const f2 = cloneWith(912, (d) => {
  const c = caseObj('case_2', 8, 'Meera', ['Luis']);
  d.caseLedger = { cases: [c], plots: [] };
  d.caseFramingSittings = [{ day: 10, npc: 'Meera',
    framingLines: ["Nobody's settled the ambush against me yet."],
    cases: [c], plots: [] }];
});
const out2 = runAnalyzer(fixtureDir('f2', f2, 912));
check('F2 against-me spoken to target -> MATCH', /R67 CASE SITTING d10 npc=Meera -> MATCH/.test(out2));
// F3: accused-only name -> MISMATCH, NO-GO
const f3 = cloneWith(913, (d) => {
  const c = caseObj('case_3', 9, 'Luis', ['Meera']);
  d.caseLedger = { cases: [c], plots: [] };
  d.caseFramingSittings = [{ day: 10, npc: 'Declan',
    framingLines: ["There's still the matter of the ambush of Meera. Nobody's settled it."],
    cases: [c], plots: [] }];
});
const out3 = runAnalyzer(fixtureDir('f3', f3, 913));
check('F3 accused-only framing -> MISMATCH', /R67 CASE SITTING d10 npc=Declan -> MISMATCH/.test(out3));
check('F3 verdict NO-GO', /R67 CASE \(labeling\):.*NO-GO/.test(out3));
// F4: matched case, target dies later (join, context only)
// Census nameOf() matches census entries by id; use a real census person
// as the target so the death join resolves: take the first census entry's
// name, and append a death for that id on a day after the sitting.
const f4 = cloneWith(914, (d) => {
  const person = (d.census || [])[0];
  const tname = person ? person.name : 'Luis';
  const c = caseObj('case_4', 9, tname, ['Meera']);
  d.caseLedger = { cases: [c], plots: [] };
  d.caseFramingSittings = [{ day: 10, npc: 'Meera',
    framingLines: [`There's still the matter of the ambush of ${tname}. Nobody's settled it.`],
    cases: [c], plots: [] }];
  d.deaths = [...(d.deaths || []), { day: 20, who: person.id, cause: 'ambush' }];
});
const out4 = runAnalyzer(fixtureDir('f4', f4, 914));
check('F4 target-died-later join printed', /TARGET-DIED-LATER/.test(out4), out4.slice(-600));
check('F4 still LABELING-GO (join is context, not a gate)', /R67 CASE \(labeling\):.*LABELING-GO/.test(out4));
// F5 (R67 contest-name fix): a dead villager whose census name fell back
// to its id must still match a contest participant via the autopsy name
// captured at death time. Clone 687, blank one census name to its id, and
// add a ledger entry + autopsy for that person as a participant who died
// by contest inside the span. Old census-only nameOf would recompute
// WILD-ARENA-COINCIDENT and print AUTOPSY DISAGREE; fixed nameOf must
// recompute LEDGER with zero disagreements.
const f5 = cloneWith(915, (d) => {
  const person = (d.census || [])[0];
  person.name = person.id;
  d.contestLedger = [...(d.contestLedger || []), { contestId: 'synthprice', name: 'Synth Price',
    kind: 'contest', firedDay: 14, endDay: 20, firedFromTele: true, endedFromTele: true,
    outcome: 'won', participants: [person.name === person.id ? 'Eli' : person.name],
    tvLineCount: 0, tvExcerpts: [], phaseExcerpts: [] }];
  // The participant name must be the person's true name, not the id:
  // use the spawn scholar name when the person is the scholar, else the
  // autopsy name we are about to set.
  const trueName = (d.spawn && d.spawn.scholarId === person.id) ? d.spawn.scholarName : 'Eli';
  d.contestLedger[d.contestLedger.length - 1].participants = [trueName];
  d.contestDeathAutopsies = [...(d.contestDeathAutopsies || []),
    { day: 15, who: person.id, name: trueName, cause: 'contest', arenaish: true,
      deathLines: [], deathLinesNamed: [], context: 'LEDGER' }];
});
const out5 = runAnalyzer(fixtureDir('f5', f5, 915));
check('F5 dead-villager id-name still matches participant via autopsy name',
  !/AUTOPSY DISAGREE/.test(out5) && /driverDisagreements=0/.test(out5), out5.slice(-500));
// Retrospective: real r66 corpus has no caseFramingSittings field.
const outR = runAnalyzer(path.join(EVID, 'landing-r66'));
check('Retrospective r66 corpus -> NO-SITTINGS per seed', (outR.match(/R67 CASE: NO-SITTINGS/g) || []).length >= 4, outR.slice(-400));
check('Retrospective r66 corpus -> VACUOUS verdict', /R67 CASE \(labeling\):.*VACUOUS/.test(outR));
console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
