// Proof test for analyze-landing-r68-20261029.js R68 PARTY block (landing r68).
// Question: does the analyzer adjudicate invite_party outcomes as spoken vs
// dry per the pre-registered binding rule (prereg 2026-10-29)?
// Fixtures are the real r67 seed-691 census with only invitePartyPicks /
// r41Summary invite fields mutated, so the analyzer runs its full path.
// F1: 2 spoken picks (one accepted, one declined) -> PARTY-GO.
// F2: 1 spoken + 1 dry pick -> NO-GO.
// F3: 0 picks (offers > 0, never taken) -> VACUOUS.
// F4: dry line inside a fixture that also carries a caseLedger etc. must not
// disturb the R67 CASE verdict path (analyzer still exits 0 and prints CASE).
// Run: node scripts/test-landing-r68-party-20261029.js  (exit 0 = all green)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ANALYZER = path.join(__dirname, 'analyze-landing-r68-20261029.js');
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
  path.join(EVID, 'landing-r67', 'journey-landing-r62-census-691.json'), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r68party-'));
function fixtureDir(name, census, seed) {
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, `journey-landing-r62-census-${seed}.json`), JSON.stringify(census));
  return dir;
}
function cloneWith(seed, picks, offered) {
  const d = JSON.parse(JSON.stringify(base));
  d.seed = seed;
  d.invitePartyPicks = picks;
  d.r41Summary = Object.assign({}, d.r41Summary || {}, {
    invitePartyOffered: offered, invitePartyPicks: picks.length,
    invitePartyDry: picks.filter(p => p.dry).length,
    invitePartySpoken: picks.filter(p => !p.dry).length,
  });
  return d;
}
const spoken = (day, npc, line, inPartyAfter) => ({ day, npc, line, dry: false, inPartyAfter });
const dry = (day, npc) => ({ day, npc, line: '...Sorry, lost my train of thought.', dry: true, inPartyAfter: false });
// F1: spoken accept + spoken decline -> PARTY-GO
const f1 = cloneWith(921, [
  spoken(12, 'Ada', '"Yes. Absolutely. I\'ve been hoping you\'d ask."', true),
  spoken(15, 'Boris', '"I work alone. Ask me again when I know you better."', false),
], 2);
const out1 = runAnalyzer(fixtureDir('f1', f1, 921));
check('F1 spoken picks counted', /R68 PARTY d12 Ada dry=false inPartyAfter=true/.test(out1), out1.slice(-800));
check('F1 verdict PARTY-GO', /R68 PARTY \(invite-outcome speech.*PARTY-GO/.test(out1));
// F2: one dry pick -> NO-GO
const f2 = cloneWith(922, [
  spoken(11, 'Ada', '"Yes. Absolutely. I\'ve been hoping you\'d ask."', true),
  dry(14, 'Caleb'),
], 2);
const out2 = runAnalyzer(fixtureDir('f2', f2, 922));
check('F2 dry pick counted', /R68 PARTY d14 Caleb dry=true/.test(out2), out2.slice(-800));
check('F2 verdict NO-GO', /R68 PARTY \(invite-outcome speech.*NO-GO/.test(out2));
// F3: no picks -> VACUOUS (offers present, never taken)
const f3 = cloneWith(923, [], 3);
const out3 = runAnalyzer(fixtureDir('f3', f3, 923));
check('F3 verdict VACUOUS', /R68 PARTY \(invite-outcome speech.*VACUOUS/.test(out3), out3.slice(-800));
// F4: analyzer still runs the full path (CASE line present) on a party fixture
check('F4 full-path CASE line present', /R67 CASE \(labeling\)/.test(out1));
console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
