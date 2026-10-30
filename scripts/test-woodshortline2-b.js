#!/usr/bin/env node
// test-woodshortline2-b.js — proof for sim-woodshortline2-b.
// Own instrument for this run. Recomputes the ON + guard censuses
// from the raw corpora (independent of the analyzer output), checks
// every staged tail, scans the full ON corpus for contradictions,
// checks the guard census, and re-runs seed 15003 ON+warmth for
// byte-identical determinism (staging dir deleted afterwards).
// Usage: node scripts/test-woodshortline2-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ON = path.join(ROOT, 'evidence', '2026-10-30', 'sim-woodshortline2-b-corpus-on');
const GUARD = path.join(ROOT, 'evidence', '2026-10-30', 'sim-woodshortline2-b-corpus-guard');

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; failures.push(name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : '')); console.log('FAIL ' + name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function loadDir(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => ({ file: f, inst: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

function census(rows) {
  const c = { seeds: rows.length, evenings: 0, creek: 0, still: 0, rescued: 0,
    skip: {}, woodVals: [], warmActed: 0, warmLogSpent: 0, warmFireFailed: 0,
    miss: {}, errs: 0, staged: [], spendEvents: [] };
  for (const { inst } of rows) {
    c.errs += (inst.woodcarryStore && inst.woodcarryStore.errs) || 0;
    c.errs += (inst.warmthStore && inst.warmthStore.errs) || 0;
    const evs = inst.evenings || [];
    const byDay = new Map(evs.map((e) => [e.loopDay, e]));
    c.evenings += evs.length;
    for (const e of evs) {
      const ww = e.warmth;
      if (ww) {
        if (ww.acted) {
          c.warmActed++;
          if (ww.fireLit && ww.logSpent >= 1) { c.warmLogSpent++; c.spendEvents.push({ seed: inst.seed, night: e.loopDay, before: ww.woodBefore, after: ww.woodAfter }); }
          else if (!ww.fireLit) c.warmFireFailed++;
        } else if (ww.miss && ww.miss !== 'lever-off') c.miss[ww.miss] = (c.miss[ww.miss] || 0) + 1;
      }
      const wc = e.woodcarry || {};
      if (wc.bucket !== 'creek') continue;
      c.creek++;
      c.woodVals.push((wc.classification || {}).woodPlayer);
      if (wc.rescued) { c.rescued++; continue; }
      c.still++;
      const sk = (wc.bridge && wc.bridge.skip) || '(none)';
      c.skip[sk] = (c.skip[sk] || 0) + 1;
      if (sk === 'wood-short') {
        let spend = null;
        for (let d = e.loopDay - 1; d >= 1; d--) {
          const pw = (byDay.get(d) || {}).warmth;
          if (pw && pw.acted && pw.fireLit && pw.logSpent >= 1) { spend = d; break; }
        }
        let refill = null;
        if (spend !== null) {
          for (let m = spend + 1; m <= e.loopDay; m++) {
            const mc = (byDay.get(m) || {}).woodcarryCarry;
            if (mc && mc.acted) { refill = m; break; }
          }
        }
        if (spend !== null && refill === null) {
          c.staged.push({ seed: inst.seed, loopDay: e.loopDay, spendNight: spend,
            wood: (wc.classification || {}).woodPlayer, narration: wc.narration || null,
            tail: e.eveningSayTail || [] });
        }
      }
    }
  }
  return c;
}

const onRows = loadDir(ON);
const guardRows = loadDir(GUARD);
const on = census(onRows);
const guard = census(guardRows);

// --- ON census (fresh re-derivation; old census is the target, not the source) ---
check('ON seeds', on.seeds === 10, on.seeds);
check('ON evenings', on.evenings === 300, on.evenings);
check('ON creek', on.creek === 21, on.creek);
check('ON still', on.still === 11, on.still);
check('ON rescued', on.rescued === 10, on.rescued);
check('ON skip kcal', on.skip['kcal-short'] === 3, on.skip);
check('ON skip ticks', on.skip['ticks-short'] === 1, on.skip);
check('ON skip wood', on.skip['wood-short'] === 7, on.skip);
check('ON woodVals', eq(on.woodVals, [4, 4, 4, 4, 4, 4, 4, 3, 3, 2, 1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4]), on.woodVals);
check('ON warmth acted', on.warmActed === 6, on.warmActed);
check('ON warmth logSpent', on.warmLogSpent === 4, on.warmLogSpent);
check('ON warmth fireFailed', on.warmFireFailed === 2, on.warmFireFailed);
check('ON miss not-creek-refused', on.miss['not-creek-refused'] === 279, on.miss);
check('ON miss rescued', on.miss.rescued === 10, on.miss);
check('ON miss branches-available', on.miss['branches-available'] === 1, on.miss);
check('ON miss ticks-short', on.miss['ticks-short'] === 1, on.miss);
check('ON miss no-wood', on.miss['no-wood'] === 3, on.miss);
check('ON errs', on.errs === 0, on.errs);
check('ON all survived 30d', onRows.every((r) => r.inst.endReason === 'survived' && r.inst.daysAlive === 30), onRows.map((r) => r.inst.daysAlive));
check('ON spend events', eq(on.spendEvents, [
  { seed: 15215, night: 9, before: 4, after: 3 },
  { seed: 15215, night: 11, before: 3, after: 2 },
  { seed: 15215, night: 12, before: 2, after: 1 },
  { seed: 15215, night: 13, before: 1, after: 0 }]), on.spendEvents);

// --- staged mapping ---
const stagedKey = on.staged.map((s) => [s.seed, s.loopDay, s.spendNight, s.wood]);
check('staged count 7', on.staged.length === 7, on.staged.length);
check('staged mapping exact', eq(stagedKey, [
  [15215, 10, 9, 3], [15215, 11, 9, 3], [15215, 12, 11, 2], [15215, 13, 12, 1],
  [15215, 14, 13, 0], [15215, 15, 13, 0], [15215, 16, 13, 0]]), stagedKey);

// --- per-staged tail checks ---
const WOOD_RE = /No bridge tonight — the pack holds (\d+) logs?, and a bridge needs 4\./;
const STILL_CONTRA_RE = /(lash logs together|bridge spans|bridge (stands|is built)|you cross|reached home|You (walk|step) (home|across))/i;
const FIRE_RE = /(tinder catches|Nothing\. Your arms ache|got the knack|friction fire is yours)/;
for (const s of on.staged) {
  const counts = s.tail.map((l) => { const m = String(l).match(WOOD_RE); return m ? parseInt(m[1], 10) : null; }).filter((n) => n !== null);
  const refusalIdx = s.tail.findIndex((l) => /No bridge tonight/.test(String(l)));
  const fireIdxs = s.tail.map((l, i) => (FIRE_RE.test(String(l)) ? i : -1)).filter((i) => i >= 0);
  const contra = s.tail.filter((l) => STILL_CONTRA_RE.test(String(l)));
  const expectedLine = 'No bridge tonight — the pack holds ' + s.wood + (s.wood === 1 ? ' log' : ' logs') + ', and a bridge needs 4.';
  check('staged ' + s.loopDay + ' line counts == wood', counts.length >= 1 && counts.every((n) => n === s.wood), counts);
  check('staged ' + s.loopDay + ' narration == line', s.narration === expectedLine, s.narration);
  check('staged ' + s.loopDay + ' tail contains exact line', s.tail.includes(expectedLine), s.tail);
  check('staged ' + s.loopDay + ' no contradiction', contra.length === 0, contra);
  check('staged ' + s.loopDay + ' refusal before own fire outcome', fireIdxs.every((fi) => refusalIdx >= 0 && refusalIdx < fi), { refusalIdx, fireIdxs });
}

// --- full-corpus contradiction scan (all ON creek evenings) ---
let stillContra = 0, rescuedRefusal = 0, rescuedN = 0, otherStillN = 0;
for (const { inst } of onRows) {
  for (const e of inst.evenings || []) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') continue;
    const tail = e.eveningSayTail || [];
    if (wc.rescued) {
      rescuedN++;
      if (tail.some((l) => /No bridge tonight/.test(String(l)))) rescuedRefusal++;
    } else {
      if (tail.some((l) => STILL_CONTRA_RE.test(String(l)))) stillContra++;
      if (!((wc.bridge && wc.bridge.skip) === 'wood-short')) {
        otherStillN++;
        const nar = wc.narration || '';
        const sk = wc.bridge && wc.bridge.skip;
        check('other-still ' + inst.seed + ' night ' + e.loopDay + ' narration names its lack',
          (sk === 'kcal-short' && /kcal/.test(nar)) || (sk === 'ticks-short' && /ticks/.test(nar)),
          { skip: sk, narration: nar });
      }
    }
  }
}
check('full-corpus still contradictions 0', stillContra === 0, stillContra);
check('full-corpus rescued with refusal line 0', rescuedRefusal === 0, rescuedRefusal);
check('rescued count in scan', rescuedN === 10, rescuedN);
check('otherStill count in scan', otherStillN === 4, otherStillN);

// --- guard census ---
check('guard seeds', guard.seeds === 10, guard.seeds);
check('guard creek', guard.creek === 15, guard.creek);
check('guard still', guard.still === 4, guard.still);
check('guard rescued', guard.rescued === 11, guard.rescued);
check('guard wood all 4', guard.woodVals.length === 15 && guard.woodVals.every((v) => v === 4), guard.woodVals);
check('guard wood-short 0', (guard.skip['wood-short'] || 0) === 0, guard.skip);
check('guard staged 0', guard.staged.length === 0, guard.staged.length);
check('guard warmth acted 0', guard.warmActed === 0, guard.warmActed);
check('guard errs', guard.errs === 0, guard.errs);
check('guard all survived 30d', guardRows.every((r) => r.inst.endReason === 'survived' && r.inst.daysAlive === 30), guardRows.map((r) => r.inst.daysAlive));

// --- determinism: re-run 15003 ON+warmth, byte-compare, delete staging ---
const staging = path.join(ROOT, '.det-woodshortline2-b');
try { fs.rmSync(staging, { recursive: true, force: true }); } catch (e) {}
const env = Object.assign({}, process.env, { COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1', POLICY: 'nighttravel', WOODCARRY: '1', WOODWARM: '1', DAYS: '30', SEEDS: '15003', OUTDIR: staging });
execSync('node scripts/woodwarm-trace-b.js', { cwd: ROOT, env, stdio: 'pipe' });
const orig = fs.readFileSync(path.join(ON, 'woodwarm-b-nighttravel-s15003.json'), 'utf8');
const rerun = fs.readFileSync(path.join(staging, 'woodwarm-b-nighttravel-s15003.json'), 'utf8');
check('determinism 15003 ON byte-identical', orig === rerun, { origLen: orig.length, rerunLen: rerun.length });
fs.rmSync(staging, { recursive: true, force: true });
check('determinism staging deleted', !fs.existsSync(staging), staging);

console.log('test-woodshortline2-b: ' + passed + ' passed, ' + failed + ' failed');
if (failed) { console.log('FAILURES:'); failures.forEach((f) => console.log(' - ' + f)); process.exit(1); }
