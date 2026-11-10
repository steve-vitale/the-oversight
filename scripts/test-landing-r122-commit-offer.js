// Proof test for the r122 settled-favor exclusion in the M-PR1 instrument
// (analyze-landing-r107-commit-offer.js, Q2). Runs the REAL analyzer
// (child process) on (a) synthetic fixture transcripts and (b) the r121
// landing AFTER corpus as calibration, and asserts the counts.
//   Fixtures (one transcript per sitting):
//   1150 d9 — the r121 shape: THEM speaks the moot opener ("Never mind the
//     food I needed — we got it handled. Thanks anyway."), the menu offers
//     [alive:want:ask_favor] but no [dlg:commit], want final unresolved.
//     Must read settled=true and NOT count as never-offered.
//   1152 d6 — control, live favor never offered: no settled line, menu
//     without [dlg:commit], want final unresolved. Must still count as
//     never-offered (the exclusion must not swallow live favors).
//   1153 d8 — handled-pool settled: THEM speaks "All sorted. Some things
//     just work out.", no commit offered. Must read settled=true, not
//     never-offered.
//   1154 d4 — promised control: menu offers [dlg:commit], YOU picks it,
//     want final promised. Must count offered/picked/promised, settled=false.
//   Calibration (r121 AFTER corpus, verdicts stand, never re-scored): the
//   one counted r121 miss (1150 d9 Henry) now reads settled, and the
//   exclusion fires a second time (1149 d10). The raw neverOffered total
//   is 7 — the r121 "1 false positive" was the per-seed ≥3-turn metric
//   reading, not the raw total: most never-offered sittings are
//   resolution=unestablished (the want never engaged), which the ≥3-turn
//   rule filters at metric time, not in this instrument.
// Usage: node scripts/test-landing-r122-commit-offer.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r107-commit-offer.js');
const GOAL = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-09');

function run(dir) {
  return execSync(`node ${ANALYZER} ${dir}`, { encoding: 'utf8' });
}
function num(out, key) {
  const m = new RegExp('\\b' + key + '=(\\d+)').exec(out);
  assert(m, 'no ' + key + ' in analyzer output');
  return +m[1];
}
function writeTranscript(dir, seed, day, body) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `journey-landing-r62-transcript-${seed}-day${day}.txt`), body);
}
function tmpdir(tag) { return fs.mkdtempSync(path.join(os.tmpdir(), `r122-commit-offer-${tag}-`)); }

const MENU_NO_COMMIT = 'menu (8): [alive:event:naming] "Have you heard about the naming debate?" | [alive:want:ask_favor] "Is there something you need? Really." | [menu:more] More things to say (1/3) | [leave] "Actually — never mind." | [silence] "..."';
const MENU_COMMIT = 'menu (8): [alive:event:naming] "Have you heard about the naming debate?" | [alive:want:ask_favor] "Is there something you need? Really." | [dlg:commit] "I will do it. I promise." | [menu:more] More things to say (1/3) | [leave] "Actually — never mind." | [silence] "..."';

// ---- fixtures ----
const dir = tmpdir('fixtures');
// 1150 d9: the r121 settled shape (moot opener, want offered, no commit).
writeTranscript(dir, 1150, 9, [
  'THEM: "Never mind the food I needed — we got it handled. Thanks anyway."',
  MENU_NO_COMMIT,
  'YOU: [alive:want:ask_favor] "Is there something you need? Really."',
  'THEM: "The pantry is thin. Could you bring back food?"',
  'want final: id=ask_favor stage=3 resolution=unresolved',
  '',
].join('\n'));
// 1152 d6: control — live favor, never offered (must still count).
writeTranscript(dir, 1152, 6, [
  'THEM: "The pantry is thin. Could you bring back food?"',
  MENU_NO_COMMIT,
  'YOU: [alive:want:ask_favor] "Is there something you need? Really."',
  'THEM: "Yes — the pantry is thin. Could you bring back food?"',
  'want final: id=ask_favor stage=3 resolution=unresolved',
  '',
].join('\n'));
// 1153 d8: handled-pool settled ("All sorted..."), no commit offered.
writeTranscript(dir, 1153, 8, [
  'THEM: "All sorted. Some things just work out."',
  MENU_NO_COMMIT,
  'YOU: [alive:want:ask_favor] "Is there something you need? Really."',
  'want final: id=ask_favor stage=3 resolution=unresolved',
  '',
].join('\n'));
// 1154 d4: promised control — commit offered and picked, promised.
writeTranscript(dir, 1154, 4, [
  MENU_COMMIT,
  'YOU: [dlg:commit] "I will do it. I promise."',
  'THEM: "Thank you. I knew I could count on you."',
  'want final: id=ask_favor stage=3 resolution=promised',
  '',
].join('\n'));

const out = run(dir);
assert.strictEqual(num(out, 'sittings'), 4, 'fixture sittings');
assert.strictEqual(num(out, 'settled'), 2, 'fixture settled (1150 d9 + 1153 d8)');
assert.strictEqual(num(out, 'neverOffered'), 1, 'fixture neverOffered (1152 d6 control only)');
assert.strictEqual(num(out, 'offered'), 1, 'fixture offered (1154 d4)');
assert.strictEqual(num(out, 'picked'), 1, 'fixture picked (1154 d4)');
assert.strictEqual(num(out, 'promised'), 1, 'fixture promised (1154 d4)');
assert(out.includes('1150 d9') && out.includes('settled=true'), '1150 d9 row settled');
assert(out.includes('1153 d8') && out.includes('settled=true'), '1153 d8 row settled');
assert(!/1152 d6.*settled=true/.test(out), '1152 d6 row NOT settled');

// ---- calibration: r121 AFTER corpus (verdicts stand, never re-scored) ----
const calDir = path.join(GOAL, 'landing-r121-after');
if (fs.existsSync(calDir)) {
  const cal = run(calDir);
  assert(cal.includes('1150 d9') && cal.includes('settled=true'), 'r121 1150 d9 reads settled');
  assert(cal.includes('1149 d10') && cal.includes('settled=true'), 'r121 1149 d10 reads settled (2nd firing)');
  assert.strictEqual(num(cal, 'settled'), 2, 'r121 settled=2');
  assert.strictEqual(num(cal, 'neverOffered'), 7, 'r121 neverOffered=7 (was 9 pre-revision; the 2 settled sittings excluded)');
  assert.strictEqual(num(cal, 'sittings'), 20, 'r121 sittings=20');
  console.log('CALIBRATION r121-after: sittings=20 neverOffered=7 settled=2 (1150 d9 + 1149 d10 excluded)');
} else {
  console.log('CALIBRATION SKIPPED (no r121-after corpus at ' + calDir + ')');
}

console.log('PASS test-landing-r122-commit-offer: settled excluded, live favor still counted');
