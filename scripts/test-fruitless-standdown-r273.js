// test-fruitless-standdown-r273.js -- r273 fruitless-march stand-down proof.
// The blank (106282, r273 panel corpus): the herald stayed ready 64 days
// while the march arrived at its tile every day and no encounter ever
// started; the standing muster's hunger bled −2 trust/day on every allied
// link (251 muster-hunger events) until the trade league dissolved on d115
// and the national standing lapsed — a village that reached global on d72
// ended regional with trust 0 on every link.
// The fix (driver policy, zero src/js change): after 7 arrived-but-no-pending
// march days, stand the muster down (G.titanStandDown) and hold the re-call
// for 30 days, so the hunger bleed stops with the muster.
// Proof (this test): replay seed 106282 with the FIXED driver into a temp
// dir and assert the observable effect — the stand-down fires, the bleed is
// bounded, national holds to the horizon. The control is the committed r273
// panel corpus (the UNFIXED run): 251 hunger events, 45 national days,
// trade 0/3 at end, regional. If that corpus is absent the control
// assertions are skipped (the fixed-run bars are the binding ones).
// Runtime ~40s (one full 140-day seed).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const DRIVER = path.join(__dirname, 'journey-scale-r273-20261123.js');
// The r273 panel corpus (unfixed driver) — the before half of the before/after.
const PANEL_DIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-23');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function countLines(file, re) {
  try { return fs.readFileSync(file, 'utf8').split('\n').filter(l => re.test(l)).length; }
  catch (e) { return -1; }
}
function lastNatgateLine(dir) {
  try {
    const lines = fs.readFileSync(path.join(dir, 'journey-scale-r273-b-natgate-106282.txt'), 'utf8').split('\n').filter(l => l.trim() !== '');
    return lines[lines.length - 1] || '';
  } catch (e) { return ''; }
}

// Control (unfixed panel corpus, if present): the old behavior the fix must differ from.
let controlSeen = false;
{
  const hungerFile = path.join(PANEL_DIR, 'journey-scale-r273-b-trustevents-106282.txt');
  const natFile = path.join(PANEL_DIR, 'journey-scale-r273-b-natgate-106282.txt');
  if (fs.existsSync(hungerFile) && fs.existsSync(natFile)) {
    controlSeen = true;
    const hunger = countLines(hungerFile, /muster-hunger/);
    const natDays = countLines(natFile, /nat=true/);
    const last = lastNatgateLine(PANEL_DIR);
    ok('control: unfixed run bled 251 muster-hunger events', hunger === 251, 'hunger=' + hunger);
    ok('control: unfixed national held 45 days only', natDays === 45, 'natDays=' + natDays);
    ok('control: unfixed run ended regional, trade 0/3', /rank=regional/.test(last) && /trade=0\/3/.test(last), last.slice(0, 120));
  } else {
    console.log('  (control skipped: r273 panel corpus not found at ' + PANEL_DIR + ')');
  }
}

// Fixed replay: seed 106282, same policy, fixed driver, temp EVIDIR.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r273-fruitless-'));
let code = -1, out = '';
try {
  out = execFileSync('node', [DRIVER], {
    encoding: 'utf8',
    env: Object.assign({}, process.env, { SEEDS: '106282', ARM: 'B', MUSTER_HOLD: 'sitting', EVIDIR: dir }),
    timeout: 300000,
  });
  code = 0;
} catch (e) {
  code = (e && e.status != null) ? e.status : -1;
  out = (e.stdout || '') + (e.stderr || '');
}
ok('replay: fixed driver on 106282 exits 0', code === 0, 'code=' + code + ' ' + String(out).slice(-200));
if (code === 0) {
  const marchFile = path.join(dir, 'journey-scale-r273-b-march-106282.txt');
  const musterFile = path.join(dir, 'journey-scale-r273-b-muster-106282.txt');
  const hungerFile = path.join(dir, 'journey-scale-r273-b-trustevents-106282.txt');
  const natFile = path.join(dir, 'journey-scale-r273-b-natgate-106282.txt');
  const standdowns = countLines(marchFile, /held=fruitless-standdown/);
  const cooldowns = countLines(musterFile, /held=fruitless-cooldown/);
  const hunger = countLines(hungerFile, /muster-hunger/);
  const natDays = countLines(natFile, /nat=true/);
  const globDays = countLines(natFile, /glob=true/);
  const last = lastNatgateLine(dir);
  ok('fixed: a fruitless stand-down fired', standdowns >= 1, 'standdowns=' + standdowns);
  ok('fixed: the re-call was held on cooldown (not re-sounded daily)', cooldowns >= 7, 'cooldowns=' + cooldowns);
  ok('fixed: muster-hunger bounded to the two fruitless weeks (<=60, was 251)', hunger >= 0 && hunger <= 60, 'hunger=' + hunger);
  ok('fixed: national holds to the horizon (>=65 days, was 45)', natDays >= 65, 'natDays=' + natDays);
  ok('fixed: global holds to the horizon (>=60 days, was 44)', globDays >= 60, 'globDays=' + globDays);
  ok('fixed: run ends global with trade 3/3 (was regional, 0/3)', /rank=global/.test(last) && /trade=3\/3/.test(last), last.slice(0, 120));
}
console.log(`\n${pass} passed, ${fail} failed${controlSeen ? '' : ' (control skipped)'}`);
console.log('replay corpus: ' + dir);
if (fail === 0) { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
process.exit(fail === 0 ? 0 : 1);
