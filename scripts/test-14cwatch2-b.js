// test-14cwatch2-b.js — proof test for arm sim-14cwatch2-b (§14c watch rerun).
// §1 Classifier fixtures: combat vs all-villager vs starvation vs player
//     deaths on known records, incl. the kind-villager / cause-monster
//     edge (counts NON-combat under the frozen rule).
// §2 D1 determinism self-repeat: seed 102221, control policy
//     (competent-covenant-b), driver oneRun twice in SEPARATE fresh
//     node processes; the two per-seed records must be byte-identical.
//     D1 compares the reruns to EACH OTHER, never to the re-confirm
//     numbers. D1 FAIL = STOP, do not spend the band.
// Usage: node scripts/test-14cwatch2-b.js [--skip-d1]  (D1 needs the
//   full driver; --skip-d1 runs the classifier fixtures only.)
// Exit 0 iff every check passes; prints "N/N checks passed".
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { isCombat, isAllVillager, isEdgeMonster, isStarvation } = require('./analyze-14cwatch2-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function eq(name, got, want) {
  check(name, got === want, 'got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want));
}

// --- §1 classifier fixtures (grounded in the re-confirm corpus:
//     evidence/2026-11-16/perseed-courtship-reconfirm-b-control/
//     courtship-reconfirm-b-s100633-competent-covenant-b-courtship-reconfirm-b.json)
const FIX = [
  { day: 4, kind: 'monster', who: 'mirrormoth', cause: 'villager combat', player: false }, // combat
  { day: 28, kind: 'monster', who: 'terms_of_service', cause: 'combat', player: false }, // combat (cause 'combat')
  { day: 43, kind: 'villager', who: 'gen_id88vrd', cause: 'the wild', player: true }, // player death, not villager
  { day: 146, kind: 'villager', who: 'visjoin_104', cause: 'thirst', player: false }, // non-combat villager
  { day: 165, kind: 'villager', who: 'benoit_lambert', cause: 'starvation', player: false }, // starvation
  { day: 166, kind: 'villager', who: 'visjoin_161', cause: 'monster', player: false }, // EDGE: monster-caused, kind villager
  { day: 122, kind: 'monster', who: 'herald', cause: 'villager combat', player: true }, // player killed BY a monster: NOT a villager combat death
];
eq('§1 combat counts monster+non-player (mirrormoth)', isCombat(FIX[0]), true);
eq('§1 combat counts cause=combat variant', isCombat(FIX[1]), true);
eq('§1 player death is not combat', isCombat(FIX[2]), false);
eq('§1 thirst villager is not combat', isCombat(FIX[3]), false);
eq('§1 starvation villager is not combat', isCombat(FIX[4]), false);
eq('§1 EDGE kind-villager/cause-monster is NOT combat (frozen rule)', isCombat(FIX[5]), false);
eq('§1 player killed by monster is NOT a villager combat death', isCombat(FIX[6]), false);
eq('§1 all-villager counts non-player any-kind (thirst)', isAllVillager(FIX[3]), true);
eq('§1 all-villager excludes player deaths', isAllVillager(FIX[2]), false);
eq('§1 all-villager includes EDGE record', isAllVillager(FIX[5]), true);
eq('§1 edge detector flags kind-villager/cause-monster', isEdgeMonster(FIX[5]), true);
eq('§1 edge detector ignores true combat', isEdgeMonster(FIX[0]), false);
eq('§1 starvation matches cause starvation', isStarvation(FIX[4]), true);
eq('§1 starvation does not match thirst', isStarvation(FIX[3]), false);
eq('§1 starvation does not match combat', isStarvation(FIX[0]), false);
// Fixture totals mirror the re-confirm seed-100633 control derivation:
// combat 36, all-villager 39, starvation 1, edge 1 — verified against the
// stored corpus file (not hand-waved): recompute from the corpus here.
(function () {
  const fp = path.join(REPO, 'evidence', '2026-11-16', 'perseed-courtship-reconfirm-b-control',
    'courtship-reconfirm-b-s100633-competent-covenant-b-courtship-reconfirm-b.json');
  if (!fs.existsSync(fp)) { check('§1 corpus file present', false, fp); return; }
  const rec = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const combat = rec.deaths.filter(isCombat).length;
  const allVill = rec.deaths.filter(isAllVillager).length;
  const starv = rec.deaths.filter(isStarvation).length;
  const edge = rec.deaths.filter(isEdgeMonster).length;
  eq('§1 corpus 100633 control combat = 36', combat, 36);
  eq('§1 corpus 100633 control all-villager = 39', allVill, 39);
  eq('§1 corpus 100633 control driver field = 39', rec.villagerCombatDeaths, 39);
  eq('§1 corpus 100633 control starvation = 1', starv, 1);
  eq('§1 corpus 100633 control edge = 1', edge, 1);
  const armedFp = path.join(REPO, 'evidence', '2026-11-16', 'perseed-courtship-reconfirm-b-on',
    'courtship-reconfirm-b-s100633-competent-courtship-b-courtship-reconfirm-b.json');
  if (!fs.existsSync(armedFp)) { check('§1 armed corpus file present', false, armedFp); return; }
  const armed = JSON.parse(fs.readFileSync(armedFp, 'utf8'));
  eq('§1 corpus 100633 armed combat = 66', armed.deaths.filter(isCombat).length, 66);
  eq('§1 corpus 100633 armed all-villager = 68', armed.deaths.filter(isAllVillager).length, 68);
  eq('§1 corpus 100633 armed driver field = 68', armed.villagerCombatDeaths, 68);
})();

// --- §2 D1 determinism self-repeat (separate fresh processes) ---
const SKIP_D1 = process.argv.includes('--skip-d1');
if (!SKIP_D1) {
  const runner = path.join(__dirname, '..', 'scripts', 'd1-14cwatch2-runner.js');
  // The runner is a tiny throwaway written by this test into /tmp (never
  // committed): it requires the driver verbatim and writes oneRun's
  // record for seed 102221 / competent-covenant-b / 200d to the given path.
  const tmpDir = fs.mkdtempSync(path.join('/tmp', 'd1-14cwatch2-'));
  const runnerSrc = "'use strict';\n" +
    "const fs = require('fs');\n" +
    "const { oneRun } = require(" + JSON.stringify(path.join(REPO, 'scripts', 'onlylead-driver-20261115.js')) + ");\n" +
    "(async function () {\n" +
    "  const out = await oneRun(102221, 'competent-covenant-b', { days: 200 });\n" +
    "  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2) + '\\n');\n" +
    "})().catch(function (e) { console.error(e.stack); process.exit(1); });\n";
  const runnerPath = path.join(tmpDir, 'run.js');
  fs.writeFileSync(runnerPath, runnerSrc);
  const a = path.join(tmpDir, 'a.json');
  const b = path.join(tmpDir, 'b.json');
  try {
    execFileSync(process.execPath, [runnerPath, a], { cwd: REPO, stdio: 'pipe', timeout: 600000 });
    execFileSync(process.execPath, [runnerPath, b], { cwd: REPO, stdio: 'pipe', timeout: 600000 });
    const ja = fs.readFileSync(a, 'utf8');
    const jb = fs.readFileSync(b, 'utf8');
    check('§2 D1 self-repeat: two fresh processes byte-identical', ja === jb,
      ja === jb ? '' : ('lengths ' + ja.length + ' vs ' + jb.length));
    if (ja === jb) {
      const rec = JSON.parse(ja);
      console.log('D1 record: gameDays ' + rec.gameDays + ' standing ' + rec.standing +
        ' maxWave ' + rec.maxWave + ' deaths ' + rec.deaths.length +
        ' villagerCombatDeaths ' + rec.villagerCombatDeaths +
        ' instrumentErrors ' + (rec.instrumentErrors || []).length);
      check('§2 D1 record has 0 instrument errors', (rec.instrumentErrors || []).length === 0);
    }
  } catch (e) {
    check('§2 D1 self-repeat ran without error', false, String((e && e.message) || e).slice(0, 200));
  }
}

console.log(pass + '/' + (pass + fail) + ' checks passed');
if (fail) process.exit(1);
