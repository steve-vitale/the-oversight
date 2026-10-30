#!/usr/bin/env node
// test-woodshort-ledger-b.js — proof for sim-woodshort-ledger-b
// (prereg: evidence/2026-10-30/sim-woodshort-ledger-b-prereg.md,
// pinned base ff6bf0e04fecd10fab2aa2807a99b9003e8cd9e2). Proves,
// from the committed corpora plus a fresh determinism re-run, the
// INSUFFICIENT-DATA verdict: the ONE staged route (stranded-night
// campfire) never acted on the 10-seed bank — 0 campfires, 0
// log-spends, 0 staged wood-short evenings — with the miss
// breakdown, the exact reproduction of the woodshort ON census
// (15 creek / 4 still / 11 rescued, wood 4 on every evening),
// the pile ledger (min 8 on a full-pack morning, 0 pile-floor
// mornings after day 1), the OFF guard, and byte-identical
// determinism. No game code is changed by this arm
// (measurement only: one policy-side wrapper + driver +
// analyzer + diagnostic probe).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const ev = (p) => path.join(root, 'evidence', '2026-10-30', p);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) failures++;
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const QUALIFIERS = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439];

// 0. Unit: campDecision gate (all miss reasons + the act case).
const { campDecision } = require('./policies/campfire');
const base = { outcome: 'travel-refused', bucket: 'creek', rescued: false, gameOver: false,
  combat: false, inTent: false, atHaven: false, branches: 0, wood: 4, rawCookable: true,
  nearFire: false, groundFound: true, ticksLeft: 200, fireCost: 48 };
check('campDecision acts on the full trigger', campDecision(base).act === true);
check('campDecision misses rescued', campDecision({ ...base, rescued: true }).miss === 'rescued');
check('campDecision misses at-haven', campDecision({ ...base, atHaven: true }).miss === 'at-haven');
check('campDecision misses branches-available', campDecision({ ...base, branches: 2 }).miss === 'branches-available');
check('campDecision misses no-wood', campDecision({ ...base, wood: 0 }).miss === 'no-wood');
check('campDecision misses no-raw-food', campDecision({ ...base, rawCookable: false }).miss === 'no-raw-food');
check('campDecision misses fire-near', campDecision({ ...base, nearFire: true }).miss === 'fire-near');
check('campDecision misses no-ground', campDecision({ ...base, groundFound: false }).miss === 'no-ground');
check('campDecision misses ticks-short (47 < 48+40)', campDecision({ ...base, ticksLeft: 47 }).miss === 'ticks-short');
check('campDecision misses non-creek', campDecision({ ...base, bucket: 'other-refused' }).miss === 'not-creek-refused');

// 1. ON census recomputation from the committed corpora.
let onCreek = 0, onStill = 0, onRescued = 0, onErrs = 0, onCfErrs = 0;
let onWood = [], stillSkip = {}, campActed = 0, campLogSpent = 0, missReasons = {};
let staged = 0, havenMornings = 0, pileMinAfterDay1 = null, pileFloorAfterDay1 = 0;
for (const s of QUALIFIERS) {
  const j = read(ev(`sim-woodshort-ledger-b-corpus-on/woodshort-ledger-b-nighttravel-s${s}.json`));
  onErrs += j.woodcarryStore.errs || 0;
  onCfErrs += (j.campfireStore || {}).errs || 0;
  const byDay = {};
  for (const e of j.evenings) byDay[e.loopDay] = e;
  for (const e of j.evenings) {
    const wc = e.woodcarry || {}, cf = e.campfire || null;
    if (cf) {
      if (cf.acted) { campActed++; if (cf.fireLit && cf.logSpent >= 1) campLogSpent++; }
      else if (cf.miss && cf.miss !== 'lever-off') missReasons[cf.miss] = (missReasons[cf.miss] || 0) + 1;
    }
    const cr = e.woodcarryCarry || null;
    if (cr && cr.skip && ['not-at-haven', 'game-over', 'combat', 'lever-off'].indexOf(cr.skip) < 0 && cr.pileBefore !== null && cr.pileBefore !== undefined) {
      havenMornings++;
      if (e.loopDay > 1) {
        if (pileMinAfterDay1 === null || cr.pileBefore < pileMinAfterDay1) pileMinAfterDay1 = cr.pileBefore;
        if (cr.skip === 'pile-floor') pileFloorAfterDay1++;
      }
    }
    if (wc.bucket !== 'creek') continue;
    onCreek++;
    onWood.push((wc.classification || {}).woodPlayer);
    if (wc.rescued) onRescued++;
    else { onStill++; const sk = (wc.bridge || {}).skip; stillSkip[sk] = (stillSkip[sk] || 0) + 1; }
    const prev = byDay[e.loopDay - 1], prevCf = prev ? prev.campfire : null;
    if (wc.bridge && wc.bridge.skip === 'wood-short' && prevCf && prevCf.acted && prevCf.fireLit && prevCf.logSpent >= 1) staged++;
  }
}
check('ON bank is the 10 pre-registered qualifiers, errs 0, camp errs 0', onErrs === 0 && onCfErrs === 0, 'wcErrs=' + onErrs + ' cfErrs=' + onCfErrs);
check('ON census reproduces woodshort exactly: 15 creek / 4 still / 11 rescued', onCreek === 15 && onStill === 4 && onRescued === 11, onCreek + '/' + onStill + '/' + onRescued);
check('still skip breakdown kcal 3 / ticks 1', eq(stillSkip, { 'kcal-short': 3, 'ticks-short': 1 }), JSON.stringify(stillSkip));
check('woodPlayer = 4 on every ON creek evening (never below the floor)', onWood.length === 15 && onWood.every((v) => v === 4), JSON.stringify(onWood));
check('camp never acted on the bank (0 acted, 0 log-spent)', campActed === 0 && campLogSpent === 0, 'acted=' + campActed + ' spent=' + campLogSpent);
check('camp miss reasons: not-creek 285 / rescued 11 / branches 1 / no-raw-food 3',
  eq(missReasons, { 'not-creek-refused': 285, rescued: 11, 'branches-available': 1, 'no-raw-food': 3 }), JSON.stringify(missReasons));
check('STAGED wood-short evenings = 0 (primary bar not met, no lowering)', staged === 0, 'staged=' + staged);
check('pile ledger: min pile days 2+ is 8, pile-floor mornings after day 1 = 0', pileMinAfterDay1 === 8 && pileFloorAfterDay1 === 0, 'min=' + pileMinAfterDay1 + ' floor=' + pileFloorAfterDay1 + ' havenMornings=' + havenMornings);

// 2. OFF guard recomputation.
let offEvenings = 0, offLeverLines = 0, offCampActed = 0, offErrs = 0;
for (const s of QUALIFIERS) {
  const j = read(ev(`sim-woodshort-ledger-b-corpus-off/woodshort-ledger-b-nighttravel-s${s}.json`));
  offErrs += j.woodcarryStore.errs || 0;
  for (const e of j.evenings) {
    offEvenings++;
    if (e.campfire && e.campfire.acted) offCampActed++;
    for (const line of (e.eveningSayTail || [])) if (typeof line === 'string' && line.indexOf('No bridge tonight') >= 0) offLeverLines++;
  }
}
check('OFF guard: 300 evenings, errs 0, 0 lever lines, 0 camp acted', offEvenings === 300 && offErrs === 0 && offLeverLines === 0 && offCampActed === 0, 'evenings=' + offEvenings + ' errs=' + offErrs + ' lines=' + offLeverLines + ' camp=' + offCampActed);

// 3. Determinism: re-run first qualifier seed ON+c camp, byte-compare.
const staging = path.join(root, '.test-woodshort-ledger-det');
try {
  fs.rmSync(staging, { recursive: true, force: true });
  const env = { ...process.env, SEEDS: '15003', POLICY: 'nighttravel', COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1', DAYS: '30', WOODCARRY: '1', CAMPFIRE: '1', OUTDIR: staging };
  execFileSync('node', [path.join(root, 'scripts', 'woodshort-ledger-trace-b.js')], { env, cwd: root, stdio: 'pipe' });
  const orig = fs.readFileSync(ev('sim-woodshort-ledger-b-corpus-on/woodshort-ledger-b-nighttravel-s15003.json'), 'utf8');
  const rerun = fs.readFileSync(path.join(staging, 'woodshort-ledger-b-nighttravel-s15003.json'), 'utf8');
  check('determinism re-run of 15003 ON+c camp is byte-identical to judged corpus', rerun === orig);
} catch (e) {
  check('determinism re-run of 15003 ON+c camp is byte-identical to judged corpus', false, String((e && e.message) || e).slice(0, 200));
} finally {
  try { fs.rmSync(staging, { recursive: true, force: true }); } catch (e) {}
}
check('determinism staging dir deleted', !fs.existsSync(staging));

console.log(failures === 0 ? 'ALL PROOF CHECKS GREEN' : failures + ' PROOF CHECKS FAILED');
process.exit(failures === 0 ? 0 : 1);
