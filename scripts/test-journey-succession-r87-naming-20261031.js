#!/usr/bin/env node
// test-journey-succession-r87-naming-20261031.js — proof test for the r87
// instrument (WEEK1-NAMING analyzer + r83->r87 driver rename).
// (a) ANALYZER on r83 fixtures: r83's own week-1 transcripts scored with
//     r83 dead names must give per-seed named [2,1,1,1,0,3] over totals
//     [5,4,5,5,5,4] (pooled 8/28), zero collisions, zero missing files.
//     (Baseline measured by mechanical grep during r87 pre-registration.)
// (b) WRONG-NAME control: the same fixtures scored with a dead name from
//     another seed (26151 scored against 'Violet') must give 0 naming —
//     proving the scorer keys on the right name, not generic hits.
// (c) DRIVER RENAME smoke: the r87 driver on proof seed 24998 (short
//     config, all five kills forced) must emit fifthDeath (scripted,
//     passed) and write d+3/d+7 transcript files. Proof scratch
//     (seed 24998 tele + transcript files) is deleted afterwards,
//     r56 pattern. The driver writes no stdout file itself; the test
//     captures its stdout JSON directly.
// Usage: node scripts/test-journey-succession-r87-naming-20261031.js
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-31');
const { scoreWeek1 } = require('./analyze-journey-succession-r87-naming-20261031.js');

let fails = [];
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(name);
}

// ---- (a) r83 fixtures ----
const seeds = [26151, 26152, 26153, 26154, 26155, 26156];
const expNamed = [2, 1, 1, 1, 0, 3];
const expTotal = [5, 4, 5, 5, 5, 4];
const fix = scoreWeek1(EVID, seeds, 'r83');
fix.perSeed.forEach((r, i) => {
  check(`FIXTURE seed ${r.seed} named=${expNamed[i]}/${expTotal[i]}`,
    r.named === expNamed[i] && r.total === expTotal[i],
    `got named=${r.named} total=${r.total} dead=${r.dead}`);
  check(`FIXTURE seed ${r.seed} no collision, no missing`,
    r.collision === false && !r.transcripts.some(t => t.missing),
    `collision=${r.collision} missing=${r.transcripts.filter(t => t.missing).length}`);
});
check('FIXTURE pooled 8/28', fix.pooled.named === 8 && fix.pooled.transcripts === 28,
  `got ${fix.pooled.named}/${fix.pooled.transcripts}`);

// ---- (b) wrong-name control ----
const wrong = scoreWeek1(EVID, [26151], 'r83', { 26151: 'Violet' });
check('WRONG-NAME control 26151-as-Violet gives 0 naming',
  wrong.perSeed[0].named === 0 && wrong.pooled.namingLines === 0,
  `got named=${wrong.perSeed[0].named} lines=${wrong.pooled.namingLines}`);

// ---- (c) driver rename smoke ----
const ENV = Object.assign({}, process.env, { SEED: '24998', EARLY_KILL_DAY: '5', POST_DAYS: '30',
  SECOND_KILL_DPLUS: '3', THIRD_KILL_DPLUS: '3', FOURTH_KILL_DPLUS: '3', FIFTH_KILL_DPLUS: '3' });
try {
  const out = execFileSync('node', [path.join(ROOT, 'scripts', 'journey-succession-r87-20261031.js')],
    { cwd: ROOT, env: ENV, timeout: 600000, maxBuffer: 64 * 1024 * 1024 }).toString();
  const start = out.lastIndexOf('\n{');
  const rec = JSON.parse(out.slice(start + 1));
  check('DRIVER fifthDeath present, scripted, passed',
    !!(rec.fifthDeath && rec.fifthDeath.scripted && rec.fifthDeath.passed),
    'fifthDeath=' + JSON.stringify(rec.fifthDeath));
  const w1 = (rec.convoReads || []).filter(c => c.dplus === 3 || c.dplus === 7);
  check('DRIVER wrote d+3/d+7 convoReads (week-1 instrument present)',
    w1.length >= 2, `w1 reads=${w1.length}`);
  let filesOk = 0;
  for (const c of w1) {
    if (fs.existsSync(path.join(EVID, `journey-succession-r87-transcript-24998-dplus${c.dplus}-${c.vid}.txt`))) filesOk++;
  }
  check('DRIVER d+3/d+7 transcript files exist on disk',
    filesOk === w1.length, `files=${filesOk}/${w1.length}`);
} catch (e) {
  check('DRIVER smoke ran without throwing', false, String(e && e.message).slice(0, 300));
} finally {
  // Delete proof scratch (r56 pattern): seed 24998 tele + transcripts.
  for (const f of fs.readdirSync(EVID)) {
    if (f.includes('24998') && (f.includes('r87-tele-') || f.includes('r87-transcript-'))) {
      try { fs.unlinkSync(path.join(EVID, f)); } catch (e) { /* flap-tolerant: leave, note below */ }
    }
  }
  const leftovers = fs.readdirSync(EVID).filter(f => f.includes('24998'));
  check('DRIVER proof scratch deleted', leftovers.length === 0, `leftovers=${leftovers.join(',')}`);
}

if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL PASS');
