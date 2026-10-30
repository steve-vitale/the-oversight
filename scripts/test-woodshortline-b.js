#!/usr/bin/env node
// test-woodshortline-b.js — proof for sim-woodshortline-b.
// Recomputes the judged ON + guard censuses from the committed
// corpora, audits every staged wood-short tail (line present,
// count == woodPlayer, grammar singular/plural, refusal before
// the night's own warmth outcome, no contradiction line), scans
// all ON creek tails for outcome contradictions, recomputes the
// guard census, and re-runs the 15003 ON leg for byte-identical
// determinism (staging dir deleted after comparison).
// Usage: node scripts/test-woodshortline-b.js  (from repo root)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ON = path.join(ROOT, 'evidence', '2026-10-30', 'sim-woodshortline-b-corpus-on');
const GUARD = path.join(ROOT, 'evidence', '2026-10-30', 'sim-woodshortline-b-corpus-guard');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function loadDir(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}
const WOOD_LINE = /^No bridge tonight — the pack holds (\d+) logs?, and a bridge needs 4\.$/;
function woodLineFor(n) {
  return 'No bridge tonight — the pack holds ' + n + ' log' + (n === 1 ? '' : 's') + ', and a bridge needs 4.';
}

const on = loadDir(ON);
const guard = loadDir(GUARD);
check('on files == 10', on.length === 10, on.length);
check('guard files == 10', guard.length === 10, guard.length);

// ---- ON census recomputation ----
let creek = 0, still = 0, rescued = 0;
const skip = {}, woodVals = [];
let warmActed = 0, warmSpent = 0, warmFailed = 0;
const miss = {};
const staged = [];
let wcErrs = 0, wwErrs = 0;
for (const inst of on) {
  wcErrs += inst.woodcarryStore.errs; wwErrs += inst.warmthStore.errs;
  const byDay = {};
  for (const e of inst.evenings || []) byDay[e.loopDay] = e;
  for (const e of inst.evenings || []) {
    const wc = e.woodcarry || {};
    const ww = e.warmth || null;
    if (ww) {
      if (ww.acted) {
        warmActed++;
        if (ww.fireLit && ww.logSpent >= 1) warmSpent++;
        else if (!ww.fireLit) warmFailed++;
      } else if (ww.miss && ww.miss !== 'lever-off') miss[ww.miss] = (miss[ww.miss] || 0) + 1;
    }
    if (wc.bucket !== 'creek') continue;
    creek++;
    const cls = wc.classification || {};
    woodVals.push(cls.woodPlayer);
    if (wc.rescued) { rescued++; continue; }
    still++;
    const sk = (wc.bridge && wc.bridge.skip) || '?';
    skip[sk] = (skip[sk] || 0) + 1;
    if (sk === 'wood-short') {
      let best = null;
      for (let d = e.loopDay - 1; d >= 1; d--) {
        const pw = (byDay[d] || {}).warmth;
        if (!(pw && pw.acted && pw.fireLit && pw.logSpent >= 1)) continue;
        let refill = null;
        for (let m = d + 1; m <= e.loopDay; m++) {
          const mc = (byDay[m] || {}).woodcarryCarry;
          if (mc && mc.acted) { refill = m; break; }
        }
        best = { spendNight: d, refill, pw };
        break;
      }
      if (best && best.refill === null) staged.push({ inst, e, cls, spendNight: best.spendNight, pw: best.pw });
    }
  }
}
check('on creek == 21', creek === 21, creek);
check('on still == 11', still === 11, still);
check('on rescued == 10', rescued === 10, rescued);
check('on skip breakdown', JSON.stringify(skip) === JSON.stringify({ 'kcal-short': 3, 'ticks-short': 1, 'wood-short': 7 }), skip);
check('on wood values', JSON.stringify(woodVals) === JSON.stringify([4,4,4,4,4,4,4,3,3,2,1,0,0,0,4,4,4,4,4,4,4]), woodVals);
check('warmth acted == 6', warmActed === 6, warmActed);
check('warmth log-spent == 4', warmSpent === 4, warmSpent);
check('warmth fire-failed == 2', warmFailed === 2, warmFailed);
check('warmth miss reasons', JSON.stringify(miss) === JSON.stringify({ 'not-creek-refused': 279, rescued: 10, 'branches-available': 1, 'ticks-short': 1, 'no-wood': 3 }), miss);
check('on errs == 0', wcErrs === 0 && wwErrs === 0, { wcErrs, wwErrs });
check('staged == 7', staged.length === 7, staged.map((s) => s.e.loopDay));
const expectMap = { 10: [9, 3], 11: [9, 3], 12: [11, 2], 13: [12, 1], 14: [13, 0], 15: [13, 0], 16: [13, 0] };
let mapOk = staged.length === 7;
for (const s of staged) {
  const exp = expectMap[s.e.loopDay];
  if (!exp || s.inst.seed !== 15215 || s.spendNight !== exp[0] || s.cls.woodPlayer !== exp[1]
      || s.pw.woodBefore - s.pw.woodAfter !== 1) mapOk = false;
}
check('staged mapping exact (seed 15215, spends 9/11/12/13, woods 3/3/2/1/0/0/0)', mapOk,
  staged.map((s) => [s.inst.seed, s.spendNight, s.e.loopDay, s.cls.woodPlayer]));

// ---- Tail audit: every staged evening ----
for (const s of staged) {
  const tail = s.e.eveningSayTail || [];
  const want = woodLineFor(s.cls.woodPlayer);
  const hits = tail.filter((l) => WOOD_LINE.test(String(l)));
  check('night ' + s.e.loopDay + ' tail carries exact line ' + JSON.stringify(want), hits.length === 1 && hits[0] === want, hits);
  const ri = tail.findIndex((l) => WOOD_LINE.test(String(l)));
  const contra = tail.filter((l) => /You lash logs together|You walk back into Haven/.test(String(l)));
  check('night ' + s.e.loopDay + ' no bridge-built/home contradiction', contra.length === 0, contra);
  const ww = s.e.warmth || {};
  if (ww.acted) {
    const fi = tail.findIndex((l) => /tinder catches|Nothing\. Your arms ache/.test(String(l)));
    check('night ' + s.e.loopDay + ' refusal precedes own warmth outcome', ri >= 0 && fi > ri, { ri, fi });
  } else {
    check('night ' + s.e.loopDay + ' no warmth action after refusal (no-wood miss)', true);
  }
  check('night ' + s.e.loopDay + ' narration field == line', (s.e.woodcarry || {}).narration === want,
    (s.e.woodcarry || {}).narration);
}

// ---- Full-corpus contradiction scan (all ON creek evenings) ----
let contraViolations = 0;
for (const inst of on) {
  for (const e of inst.evenings || []) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') continue;
    const joined = (e.eveningSayTail || []).join('\n');
    if (!wc.rescued && (/You lash logs together/.test(joined) || /You walk back into Haven/.test(joined))) contraViolations++;
    if (wc.rescued && /No bridge tonight/.test(joined)) contraViolations++;
  }
}
check('full-corpus outcome-contradiction scan == 0', contraViolations === 0, contraViolations);

// ---- Other-still lines name their own lack ----
const otherExpect = { '15009:13': 'No bridge tonight — 24 kcal in hand, and the lashing takes 60.',
  '15215:7': 'No bridge tonight — 47 ticks left in the day, and a bridge takes 96 ticks.',
  '15215:8': 'No bridge tonight — 0 kcal in hand, and the lashing takes 60.',
  '15215:9': 'No bridge tonight — 0 kcal in hand, and the lashing takes 60.' };
for (const inst of on) {
  for (const e of inst.evenings || []) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek' || wc.rescued) continue;
    const sk = (wc.bridge && wc.bridge.skip) || '?';
    if (sk === 'wood-short') continue;
    const key = inst.seed + ':' + e.loopDay;
    check('other-still ' + key + ' line names its lack', wc.narration === otherExpect[key], wc.narration);
  }
}

// ---- Guard census recomputation ----
let gCreek = 0, gStill = 0, gRescued = 0, gWoodShort = 0, gActed = 0, gWcErrs = 0, gWwErrs = 0;
for (const inst of guard) {
  gWcErrs += inst.woodcarryStore.errs; gWwErrs += inst.warmthStore.errs; gActed += inst.warmthStore.acted;
  for (const e of inst.evenings || []) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') continue;
    gCreek++;
    if (wc.rescued) gRescued++;
    else { gStill++; if (wc.bridge && wc.bridge.skip === 'wood-short') gWoodShort++; }
    if ((wc.classification || {}).woodPlayer !== 4) check('guard wood == 4 everywhere', false, wc.classification);
  }
}
check('guard creek == 15', gCreek === 15, gCreek);
check('guard still == 4', gStill === 4, gStill);
check('guard rescued == 11', gRescued === 11, gRescued);
check('guard wood-short == 0', gWoodShort === 0, gWoodShort);
check('guard warmth acted == 0', gActed === 0, gActed);
check('guard errs == 0', gWcErrs === 0 && gWwErrs === 0, { gWcErrs, gWwErrs });

// ---- Determinism: re-run 15003 ON, byte-compare, delete staging ----
const STAGING = path.join(ROOT, '.woodshortline-staging');
try { fs.rmSync(STAGING, { recursive: true, force: true }); } catch (e) {}
const env = Object.assign({}, process.env, { COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0',
  DEPOSITGATE: '1', POLICY: 'nighttravel', WOODCARRY: '1', WOODWARM: '1', SEEDS: '15003', DAYS: '30',
  OUTDIR: STAGING });
execSync('node scripts/woodwarm-trace-b.js', { cwd: ROOT, env, stdio: 'ignore' });
const a = fs.readFileSync(path.join(STAGING, 'woodwarm-b-nighttravel-s15003.json'), 'utf8');
const b = fs.readFileSync(path.join(ON, 'woodwarm-b-nighttravel-s15003.json'), 'utf8');
check('determinism 15003 ON byte-identical', a === b, a.length + ' vs ' + b.length);
try { fs.rmSync(STAGING, { recursive: true, force: true }); } catch (e) {}
check('staging dir deleted', !fs.existsSync(STAGING), STAGING);

console.log('---');
console.log('PASS ' + pass + ' FAIL ' + fail);
process.exit(fail ? 1 : 0);
