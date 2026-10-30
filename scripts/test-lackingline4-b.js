#!/usr/bin/env node
// test-lackingline4-b.js — proof for sim-lackingline4-b (prereg:
// evidence/2026-10-29/sim-lackingline4-b-prereg.md, pinned base
// 60cfe8fe1ed5d5dc53e75163a5a17e2c8c003479). Proves, from the
// committed corpora plus a fresh determinism re-run: the census
// (recomputed, not trusted), the staged still-refused ON evening
// and its exact lacking line, the tail match, the OFF guard, and
// byte-identical determinism. No game code is changed by this arm
// (measurement only).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const ev = (p) => path.join(root, 'evidence', '2026-10-29', p);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) failures++;
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const BANK = [13421, 13473, 13480, 13556, 13592, 13703, 13714, 13869, 13899, 14041, 14089, 14125, 14137];
const GATE_SKIPS = ['wood-short', 'kcal-short', 'ticks-short'];

// 1. Census file agrees with a recomputation from the corpora.
const census = read(ev('sim-lackingline4-b-on-census.json'));
check('census pinned base is 60cfe8fe1ed5d5dc53e75163a5a17e2c8c003479', census.pinnedBase === '60cfe8fe1ed5d5dc53e75163a5a17e2c8c003479', census.pinnedBase);
check('census bank = fixed 13 seeds in order', eq(census.bank, BANK), JSON.stringify(census.bank));
let onCreek = 0, onStill = 0, onRescued = 0, offCreek = 0;
const skipCounts = {};
let staged = null;
for (const s of BANK) {
  const onJ = read(ev(`sim-lackingline4-b-corpus-on/woodcarry3-b-nighttravel-s${s}.json`));
  const offJ = read(ev(`sim-lackingline4-b-corpus-off/woodcarry3-b-nighttravel-s${s}.json`));
  check('ON seed ' + s + ' errs==0 and unclassified==0', onJ.woodcarryStore.errs === 0 && onJ.woodcarryStore.unclassified === 0);
  check('ON seed ' + s + ' survived 30 days', onJ.endReason === 'survived' && onJ.daysAlive === 30, onJ.endReason + '/' + onJ.daysAlive);
  check('OFF seed ' + s + ' errs==0 and unclassified==0', offJ.woodcarryStore.errs === 0 && offJ.woodcarryStore.unclassified === 0);
  for (const e of onJ.evenings) {
    const w = e.woodcarry;
    if (!w || w.outcome !== 'travel-refused' || w.bucket !== 'creek') continue;
    onCreek++;
    if (w.rescued) { onRescued++; continue; }
    onStill++;
    const sk = (w.bridge && w.bridge.skip) || 'none';
    skipCounts[sk] = (skipCounts[sk] || 0) + 1;
    if (!staged && GATE_SKIPS.includes(sk)) {
      staged = { seed: s, loopDay: e.loopDay, skip: sk, narration: w.narration,
        woodPlayer: w.classification.woodPlayer, kcalLive: w.classification.kcalLive,
        ticksToDayEnd: w.classification.ticksToDayEnd };
    }
  }
  for (const e of offJ.evenings) {
    const w = e.woodcarry;
    if (w && w.outcome === 'travel-refused' && w.bucket === 'creek') offCreek++;
  }
}
check('ON creek evenings = 14', onCreek === 14, String(onCreek));
check('ON still-refused = 8, rescued = 6', onStill === 8 && onRescued === 6, onStill + '/' + onRescued);
check('ON still-refused skip breakdown ticks 2 / kcal 6 / wood 0 / build-retry 0',
  skipCounts['ticks-short'] === 2 && skipCounts['kcal-short'] === 6 && !skipCounts['wood-short'] && !skipCounts['build-refused'] && !skipCounts['retry-refused'],
  JSON.stringify(skipCounts));
check('census counts match recomputation', census.onCreekEvenings === onCreek && census.onStillRefused === onStill && census.onRescued === onRescued && census.offCreekEvenings === offCreek,
  [census.onCreekEvenings, census.onStillRefused, census.onRescued, census.offCreekEvenings].join('/'));
check('census staged matches derived staged', eq(census.staged, staged), JSON.stringify(census.staged));

// 2. Staged evening = first banked seed with a gate-skip still-refused evening, first such evening.
check('staged seed is 13480 (first banked seed with a still-refused evening on this base)', staged && staged.seed === 13480, staged ? String(staged.seed) : 'none');
check('staged evening is loop-day 4', staged && staged.loopDay === 4, staged ? String(staged.loopDay) : 'none');
const onStaged = read(ev('sim-lackingline4-b-corpus-on/woodcarry3-b-nighttravel-s13480.json'));
const e = onStaged.evenings.find((x) => x.loopDay === 4);
const cls = e.woodcarry.classification;
check('staged classification is creek, no probe/route error',
  cls.blockType === 'creek' && cls.hopReturnKind === 'block:creek' && cls.probeAgrees === true && cls.probeError === null && cls.routeAroundError === null);
check('staged skip is ticks-short, not rescued, not at haven, no bridge attempted',
  e.woodcarry.bridge.skip === 'ticks-short' && e.woodcarry.bridge.attempted === false && e.woodcarry.rescued === false && e.inside === false);
check('staged line names live ticks 45 (not wood/kcal)',
  e.woodcarry.narration === 'No bridge tonight — 45 ticks left in the day, and a bridge takes 96 ticks.' &&
  cls.ticksToDayEnd === 45 && cls.woodPlayer === 4 && cls.kcalLive === 2254,
  e.woodcarry.narration + ' | ticks=' + cls.ticksToDayEnd + ' wood=' + cls.woodPlayer + ' kcal=' + cls.kcalLive);
check('staged morning carry is already-carrying (pack 4, cost 0 ticks)',
  e.woodcarryCarry && e.woodcarryCarry.skip === 'already-carrying' && e.woodcarryCarry.woodBefore === 4, JSON.stringify(e.woodcarryCarry));
check('staged line matches policy lackingLine ticks branch (scripts/policies/woodcarry.js)',
  fs.readFileSync(path.join(root, 'scripts', 'policies', 'woodcarry.js'), 'utf8').includes('ticks left in the day, and a bridge takes 96 ticks.'));

// 3. Tail leg: evening rows (excl say fields) match judged; judged day reads correctly.
const tail = read(ev('sim-lackingline4-b-corpus-tail/woodcarry3-b-nighttravel-s13480.json'));
const strip = (rows) => rows.map((r) => { const c = { ...r }; delete c.eveningSayTail; delete c.eveningSayFull; return c; });
check('tail evening rows (excl say) match judged ON rows exactly', eq(strip(tail.evenings), strip(onStaged.evenings)));
check('tail mornings match judged mornings', eq(tail.mornings, onStaged.mornings));
const t4 = tail.evenings.find((x) => x.loopDay === 4);
const noBridge = (t4.eveningSayFull || []).filter((l) => l.includes('No bridge'));
check('judged day full tail has exactly one lacking line', noBridge.length === 1, String(noBridge.length));
check('judged day lacking line equals staged narration', noBridge[0] === e.woodcarry.narration, noBridge[0] || 'none');
check('judged day has no debug-string line (no "skip:", no nulls)', !(t4.eveningSayFull || []).some((l) => l.includes('skip:') || l.includes('null')));

// 4. OFF guard: no lever lacking-line on any fresh combined-bank OFF evening.
let offEvenings = 0, offHits = 0;
for (const s of BANK) {
  const j = read(ev(`sim-lackingline4-b-corpus-off/woodcarry3-b-nighttravel-s${s}.json`));
  for (const evRow of j.evenings) {
    offEvenings++;
    for (const l of (evRow.eveningSayTail || [])) if (l.includes('No bridge')) offHits++;
  }
}
check('OFF guard: 390 evenings checked, 0 lever lines', offEvenings === 390 && offHits === 0, offEvenings + ' evenings, ' + offHits + ' hits');
check('census OFF guard matches recomputation', census.offGuardEvenings === offEvenings && census.offGuardHits === offHits);

// 5. Determinism: fresh ON re-run of first banked seed is byte-identical on the pinned base.
const staging = path.join(root, '.test-lackingline4-det');
try {
  fs.rmSync(staging, { recursive: true, force: true });
  const env = { ...process.env, SEEDS: '13421', POLICY: 'nighttravel', COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1', DAYS: '30', WOODCARRY: '1', OUTDIR: staging };
  execFileSync('node', [path.join(root, 'scripts', 'woodcarry3-trace-b.js')], { env, stdio: 'pipe' });
  const rerun = fs.readFileSync(path.join(staging, 'woodcarry3-b-nighttravel-s13421.json'), 'utf8');
  const orig = fs.readFileSync(ev('sim-lackingline4-b-corpus-on/woodcarry3-b-nighttravel-s13421.json'), 'utf8');
  check('determinism re-run of 13421 ON is byte-identical to judged corpus', rerun === orig);
} finally {
  fs.rmSync(staging, { recursive: true, force: true });
}
check('determinism staging dir deleted', !fs.existsSync(staging));

if (failures) { console.error('FAILURES: ' + failures); process.exit(1); }
console.log('ALL sim-lackingline4-b proof checks passed');
