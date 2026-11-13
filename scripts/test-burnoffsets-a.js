#!/usr/bin/env node
// test-burnoffsets-a.js — proof test for the more-reseed-burn-offsets
// arm (arm sim-burnoffsets-a).
//
// THE QUESTION (evidence/2026-11-13/sim-burnoffsets-a-prereg.md):
// the 0515Z deciding test proved the matched band 190391–190398 is
// STRONGLY stream-sensitive — one 997-draw burn moved 4 of 8 fates —
// but saved neither gap seed {190392, 190394}. Only one offset was
// sampled. This arm samples {1, 13, 251, 499, 1999} on current master
// f7352f946 and asks whether ANY burn offset saves a gap seed. GO per
// offset (all conjunctive): saves >=1 gap seed the measured baseline
// LOSES, no regression on the baseline's survivors, median >= 0.8x
// baseline median, starvation <= baseline+2. Instrument-only: ZERO
// src/js changes committed.
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. Burn design verified in code on THIS base — the five modules
//      alias Math.random at load (betrayal.js:87, comms.js:116,
//      corruption.js:47, fieldFights.js:71, finale-campaign.js:28),
//      and the only in-game `Math.random =` is the _worldRng
//      save/restore pair (game.js:11009–11011).
//   2. Observable effect — the burn moves the stream the game
//      actually reads: (a) hermetic, with the harness's own
//      mulberry32 — same seed, burn N, the next draws differ from
//      the unburned sequence, burn 0 is identity, distinct offsets
//      give distinct sequences (real RNG values printed); (b) LIVE,
//      in two separate node processes — same seed 131101, same
//      setupGame, burn 0 vs burn 1: the world is identical (same
//      day, same roster length) while the post-setupGame draws
//      differ. The burn shifts play-phase dice, not the world.
//   3. Driver guards — standingGuard accepts current-master text
//      (marker + exact sha f935997640a0, read from live disk) and
//      refuses marker-less / wrong-sha text; policyGuard accepts the
//      current-master policy (sha 74a890f0844e) and refuses any other;
//      noCodeChangeOk accepts exactly [] and refuses any list;
//      burnOffsetForLeg accepts {0,1,13,251,499,1999} and refuses
//      997 (taken), 2, -1, 2000.
//   4. Seed-band identity — driver + analyzer name exactly seeds
//      190391–190398, the vetphantom band; analyzer gap seeds are
//      {190392, 190394}.
//   5. GO-bar cases — the prereg's per-offset GO bar (all four
//      conjuncts) is judged correctly on synthetic per-seed rows:
//      GO via 190392, GO via 190394, NO-GO no-save, NO-GO
//      save+regression, NO-GO median fail, NO-GO starvation fail,
//      NO-GO baseline-already-saves-both-gap-seeds, NO-GO 190391-only
//      save (not a gap save).
//   6. Corpus completeness — the analyzer's loader reports 8/8
//      complete on a full synthetic corpus and names the missing
//      seed on a partial one.
//   7. Entry refusals (real subprocesses) — the driver refuses an
//      unknown BURN with exit 2 and a STOP line; the analyzer
//      refuses a missing corpus with exit 1.
//
// Usage: node scripts/test-burnoffsets-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, execFileSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const SC = require('./burnoffsets-analyze-20261113');
const DR = require('./burnoffsets-driver-20261113');
const T = K.reporter('burnoffsets-a');
const REPO = path.join(__dirname, '..');

function readSrc(rel) { return fs.readFileSync(path.join(REPO, rel), 'utf8'); }

function fakeRow(seed, lost, days, starv) {
  const deaths = [];
  for (let i = 0; i < (starv || 0); i++) deaths.push({ day: 10 + i, kind: 'death', cause: 'starvation', who: 'v' + i });
  deaths.push({ day: days, kind: 'death', cause: 'combat', who: 'x' });
  return { seed: seed, villageLost: !!lost, days: days, deaths: deaths };
}
// Baseline shaped like the far-end 4/8: survivors 190393/190395/
// 190397/190398; lost 190391 d86, 190392 d144, 190394 d43, 190396 d87.
// Starvation 1.
function baseRows() {
  return [
    fakeRow(190391, true, 86, 0), fakeRow(190392, true, 144, 0),
    fakeRow(190393, false, 150, 0), fakeRow(190394, true, 43, 1),
    fakeRow(190395, false, 150, 0), fakeRow(190396, true, 87, 0),
    fakeRow(190397, false, 150, 0), fakeRow(190398, false, 150, 0),
  ];
}
function legLikeBase(overrides) {
  const rows = baseRows();
  for (const o of (overrides || [])) {
    const r = rows.find(function (x) { return x.seed === o.seed; });
    if (r) { r.villageLost = !!o.lost; r.days = o.days; r.deaths = fakeRow(o.seed, o.lost, o.days, o.starv || 0).deaths; }
  }
  return rows;
}

(async () => {
  // ---- 1. Burn design verified in code on this base ----
  T.section('1. Burn design — five load-time aliases, one save/restore pair');
  const aliases = [
    { file: 'src/js/betrayal.js', line: 87, re: /const R = Math\.random;/ },
    { file: 'src/js/comms.js', line: 116, re: /var R = Math\.random;/ },
    { file: 'src/js/corruption.js', line: 47, re: /const R = Math\.random;/ },
    { file: 'src/js/fieldFights.js', line: 71, re: /var R = Math\.random;/ },
    { file: 'src/js/finale-campaign.js', line: 28, re: /var R = Math\.random;/ },
  ];
  for (const a of aliases) {
    const lines = readSrc(a.file).split('\n');
    T.ok(a.file + ':' + a.line + ' captures Math.random at load', a.re.test(lines[a.line - 1] || ''), 'line=' + JSON.stringify(lines[a.line - 1] || ''));
  }
  const gameSrc = readSrc('src/js/game.js');
  const assigns = (gameSrc.match(/Math\.random\s*=/g) || []).length;
  T.ok('only in-game Math.random = is the _worldRng save/restore pair (set + restore)', assigns === 2 && gameSrc.indexOf('_worldRng') !== -1, 'assignments=' + assigns);
  T.ok('_worldRng restores Math.random in finally', /finally\s*\{\s*this\._worldRng = null; Math\.random = real;/.test(gameSrc), 'restore pair present');
  let otherAssign = null;
  for (const f of fs.readdirSync(path.join(REPO, 'src', 'js'))) {
    if (!/\.js$/.test(f) || f === 'game.js') continue;
    const src = readSrc('src/js/' + f);
    if (/Math\.random\s*=/.test(src)) { otherAssign = f; break; }
  }
  T.ok('no other src/js module assigns Math.random', otherAssign === null, 'offender=' + otherAssign);
  T.ok('standing.js on disk carries the ROSTER CHECK marker', readSrc('src/js/standing.js').indexOf('ROSTER CHECK') !== -1, 'marker present');
  T.ok('ladder.js carries the shared countLivingVeterans (scholar counts)', /function countLivingVeterans/.test(readSrc('src/js/ladder.js')), 'shared rule present');

  // ---- 2. Observable effect — the burn moves the stream ----
  T.section('2. Observable effect — burn moves the stream the game reads');
  const seed = 131101;
  const fresh = function () { return H.mulberry32(seed); };
  const seq0 = (function () { const r = fresh(); return [r(), r(), r(), r(), r()]; })();
  const seqBurn1 = (function () { const r = fresh(); r(); return [r(), r(), r(), r(), r()]; })();
  const seqBurn13 = (function () { const r = fresh(); for (let i = 0; i < 13; i++) r(); return [r(), r(), r(), r(), r()]; })();
  const seqBurn997 = (function () { const r = fresh(); for (let i = 0; i < 997; i++) r(); return [r(), r(), r(), r(), r()]; })();
  T.ok('burn 0 is identity (same first draws)', JSON.stringify(seq0) === JSON.stringify((function () { const r = fresh(); return [r(), r(), r(), r(), r()]; })()), 'seq0=' + JSON.stringify(seq0));
  T.ok('burn 1 shifts the sequence (draws differ from unburned)', JSON.stringify(seqBurn1) !== JSON.stringify(seq0), 'burn1 first=' + seqBurn1[0].toFixed(6) + ' vs unburned ' + seq0[0].toFixed(6));
  T.ok('burn 1 sequence equals the unburned sequence shifted by one', seqBurn1[0] === seq0[1] && seqBurn1[1] === seq0[2], 'shift-by-one holds: ' + seqBurn1[0].toFixed(6) + '==' + seq0[1].toFixed(6));
  T.ok('burn 13 gives a distinct sequence from burn 1', JSON.stringify(seqBurn13) !== JSON.stringify(seqBurn1), 'burn13 first=' + seqBurn13[0].toFixed(6));
  T.ok('burn 997 gives a distinct sequence from burn 13', JSON.stringify(seqBurn997) !== JSON.stringify(seqBurn13), 'burn997 first=' + seqBurn997[0].toFixed(6));
  // LIVE smoke: two separate node processes, same seed, burn 0 vs 1.
  const smokeScript = [
    "'use strict';",
    "const H = require(" + JSON.stringify(path.join(REPO, 'scripts', 'sim-harness')) + ");",
    "(async () => {",
    "  const burn = parseInt(process.env.SMOKE_BURN || '0', 10);",
    "  const { Game } = await H.loadGame({ seed: 131101, mode: 'burnoffsets-smoke', fullTelemetry: false });",
    "  await H.setupGame(Game);",
    "  for (let i = 0; i < burn; i++) Math.random();",
    "  const draws = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];",
    "  const day = ((Game.state || {}).scholar || {}).day || 0;",
    "  const roster = (((Game.state || {}).village || {}).roster || []).length;",
    "  console.log(JSON.stringify({ burn: burn, draws: draws, day: day, roster: roster }));",
    "})().catch(function (e) { console.error(e.stack); process.exit(1); });",
  ].join('\n');
  const smoke0 = JSON.parse(execFileSync('node', ['-e', smokeScript], { env: Object.assign({}, process.env, { SMOKE_BURN: '0' }), encoding: 'utf8' }));
  const smoke1 = JSON.parse(execFileSync('node', ['-e', smokeScript], { env: Object.assign({}, process.env, { SMOKE_BURN: '1' }), encoding: 'utf8' }));
  T.ok('live smoke: same seed, same world (day + roster identical)', smoke0.day === smoke1.day && smoke0.roster === smoke1.roster, 'day=' + smoke0.day + '/' + smoke1.day + ' roster=' + smoke0.roster + '/' + smoke1.roster);
  T.ok('live smoke: post-setupGame draws differ after a 1-draw burn', JSON.stringify(smoke0.draws) !== JSON.stringify(smoke1.draws), 'burn0 first=' + smoke0.draws[0].toFixed(6) + ' burn1 first=' + smoke1.draws[0].toFixed(6));
  T.ok('live smoke: burn-1 draws equal burn-0 draws shifted by one', smoke1.draws[0] === smoke0.draws[1] && smoke1.draws[1] === smoke0.draws[2], 'shift holds on the live stream');

  // ---- 3. Driver guards ----
  T.section('3. Driver guards — master standing/policy accepted, anything else refused');
  const standingText = readSrc('src/js/standing.js');
  const gStanding = DR.standingGuard(standingText);
  T.ok('standingGuard accepts current-master standing.js', gStanding.ok === true && gStanding.shaFull === DR.EXPECTED_STANDING_SHA, 'sha=' + gStanding.sha);
  T.ok('standingGuard refuses marker-less text', DR.standingGuard('no marker here').ok === false, 'no marker refused');
  const wrongShaText = standingText.replace('ROSTER CHECK', 'ROSTER CHECk');
  T.ok('standingGuard refuses marker present but wrong sha', DR.standingGuard(wrongShaText).ok === false, 'wrong-sha refused');
  T.ok('standingGuard refuses a non-string', DR.standingGuard(null).ok === false, 'null refused');
  const policyText = readSrc('scripts/policies/competent.js');
  const gPolicy = DR.policyGuard(policyText);
  T.ok('policyGuard accepts current-master competent.js', gPolicy.ok === true && gPolicy.shaFull === DR.EXPECTED_POLICY_SHA, 'sha=' + gPolicy.sha);
  T.ok('policyGuard refuses other policy text', DR.policyGuard(policyText + '\n// x').ok === false, 'altered policy refused');
  T.ok('policyGuard refuses a non-string', DR.policyGuard(null).ok === false, 'null refused');
  T.ok('noCodeChangeOk accepts exactly []', DR.noCodeChangeOk([]) === true, 'empty accepted');
  T.ok('noCodeChangeOk refuses any src/js change', DR.noCodeChangeOk(['src/js/standing.js']) === false, 'swap refused');
  T.ok('noCodeChangeOk refuses a stray change', DR.noCodeChangeOk(['src/js/game.js']) === false, 'stray refused');
  T.ok('noCodeChangeOk refuses a non-list', DR.noCodeChangeOk(null) === false && DR.noCodeChangeOk('x') === false, 'non-list refused');
  for (const b of [0, 1, 13, 251, 499, 1999]) {
    T.ok('burnOffsetForLeg accepts ' + b, DR.burnOffsetForLeg(b) === b, 'BURN=' + b);
  }
  for (const b of [997, 2, 7, -1, 2000]) {
    T.ok('burnOffsetForLeg refuses ' + b, DR.burnOffsetForLeg(b) === null, 'BURN=' + b + ' refused');
  }
  T.ok('driver refuses a run without standing guard (exit path in source)', readSrc('scripts/burnoffsets-driver-20261113.js').indexOf('refuseUnlessStanding()') !== -1, 'standing refusal wired');
  T.ok('driver refuses a run with src/js changes (exit path in source)', readSrc('scripts/burnoffsets-driver-20261113.js').indexOf('refuseUnlessNoCodeChange()') !== -1, 'no-code-change refusal wired');
  T.ok('driver burn is applied after setupGame', readSrc('scripts/burnoffsets-driver-20261113.js').indexOf('await setupGame(Game);') !== -1, 'burn placement after setupGame');

  // ---- 4. Seed-band identity ----
  T.section('4. Seed-band identity — 190391–190398, the vetphantom band');
  T.ok('analyzer seeds are exactly 190391–190398', JSON.stringify(SC.SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]), 'SEEDS=' + SC.SEEDS.join(','));
  T.ok('analyzer gap seeds are {190392, 190394}', JSON.stringify(SC.GAP_SEEDS) === JSON.stringify([190392, 190394]), 'GAP=' + SC.GAP_SEEDS.join(','));
  T.ok('analyzer run is burnoffsets-pilot', SC.RUN === 'burnoffsets-pilot', 'RUN=' + SC.RUN);
  T.ok('analyzer mode is competent-burnoffsets', SC.MODE === 'competent-burnoffsets', 'MODE=' + SC.MODE);
  T.ok('driver burn set is {0,1,13,251,499,1999}', JSON.stringify(DR.BURNS) === JSON.stringify([0, 1, 13, 251, 499, 1999]), 'BURNS=' + DR.BURNS.join(','));

  // ---- 5. GO-bar cases ----
  T.section('5. GO bar — all four conjuncts, judged on synthetic rows');
  const base = baseRows();
  T.ok('median helper reads the far-end-shaped baseline as 150', SC.median(base.map(function (r) { return r.days; })) === 150, 'median=150');
  T.ok('starvationDeaths counts cause=starvation only', SC.starvationDeaths(base) === 1, 'starv=1');
  let j = SC.judgeOffset(legLikeBase([{ seed: 190392, lost: false, days: 150 }]), base);
  T.ok('GO: saves 190392, no regression, median + starvation ok', j.verdict === 'GO' && j.gapSaved.join() === '190392' && j.lostBaseline.length === 0, JSON.stringify(j));
  j = SC.judgeOffset(legLikeBase([{ seed: 190394, lost: false, days: 150 }]), base);
  T.ok('GO: saves 190394 instead', j.verdict === 'GO' && j.gapSaved.join() === '190394', JSON.stringify(j));
  j = SC.judgeOffset(legLikeBase([]), base);
  T.ok('NO-GO: identical to baseline (no gap seed saved)', j.verdict === 'NO_GO' && j.gapSaved.length === 0, JSON.stringify(j));
  j = SC.judgeOffset(legLikeBase([{ seed: 190392, lost: false, days: 150 }, { seed: 190393, lost: true, days: 100 }]), base);
  T.ok('NO-GO: saves 190392 but loses baseline survivor 190393', j.verdict === 'NO_GO' && j.lostBaseline.join() === '190393', JSON.stringify(j));
  // Median-fail case: a weak baseline (only 190393/190397 survive).
  const weakBase = [
    fakeRow(190391, true, 43, 0), fakeRow(190392, true, 72, 0),
    fakeRow(190393, false, 150, 0), fakeRow(190394, true, 86, 0),
    fakeRow(190395, true, 87, 0), fakeRow(190396, true, 60, 0),
    fakeRow(190397, false, 150, 0), fakeRow(190398, true, 100, 0),
  ];
  const weakLeg = [
    fakeRow(190391, true, 40, 0), fakeRow(190392, false, 150, 0),
    fakeRow(190393, false, 150, 0), fakeRow(190394, true, 45, 0),
    fakeRow(190395, true, 50, 0), fakeRow(190396, true, 55, 0),
    fakeRow(190397, false, 150, 0), fakeRow(190398, true, 60, 0),
  ];
  j = SC.judgeOffset(weakLeg, weakBase);
  T.ok('NO-GO: saves 190392 but median 60 < 0.8x baseline 87', j.verdict === 'NO_GO' && j.medianOk === false, 'legMedian=' + j.legMedian + ' baseMedian=' + j.baseMedian);
  j = SC.judgeOffset(legLikeBase([{ seed: 190392, lost: false, days: 150, starv: 3 }]), base);
  T.ok('NO-GO: saves 190392 but starvation 4 > baseline 1 + 2', j.verdict === 'NO_GO' && j.starvOk === false, 'legStarv=' + j.legStarvation + ' baseStarv=' + j.baseStarvation);
  const bothSavedBase = baseRows().map(function (r) {
    if (r.seed === 190392 || r.seed === 190394) return fakeRow(r.seed, false, 150, 0);
    return r;
  });
  j = SC.judgeOffset(bothSavedBase, bothSavedBase);
  T.ok('NO-GO: baseline already saves both gap seeds (nothing left to save)', j.verdict === 'NO_GO' && j.gapSaved.length === 0 && j.baselineLostGap.length === 0, JSON.stringify(j));
  j = SC.judgeOffset(legLikeBase([{ seed: 190391, lost: false, days: 150 }]), base);
  T.ok('NO-GO: saves 190391 only (pole survivor, not a gap seed)', j.verdict === 'NO_GO' && j.gapSaved.length === 0, JSON.stringify(j));

  // ---- 6. Corpus completeness ----
  T.section('6. Corpus completeness — loader names missing seeds');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'burnoffsets-proof-'));
  const fullDir = path.join(tmp, 'full');
  const partDir = path.join(tmp, 'part');
  fs.mkdirSync(fullDir); fs.mkdirSync(partDir);
  for (const s of SC.SEEDS) {
    const row = { seed: s, villageLost: false, days: 150, deaths: [], daily: [], instrumentErrors: [] };
    fs.writeFileSync(path.join(fullDir, 'burnoffsets-s' + s + '-' + SC.RUN + '-' + SC.MODE + '.json'), JSON.stringify(row));
    if (s !== 190394) fs.writeFileSync(path.join(partDir, 'burnoffsets-s' + s + '-' + SC.RUN + '-' + SC.MODE + '.json'), JSON.stringify(row));
  }
  const full = SC.loadCorpus(SC.SEEDS, fullDir);
  T.ok('loader reports 8/8 complete on a full synthetic corpus', full.complete === true && full.rows.length === 8, 'rows=' + full.rows.length);
  const part = SC.loadCorpus(SC.SEEDS, partDir);
  T.ok('loader names the missing seed on a partial corpus', part.complete === false && part.missing.join() === '190394', 'missing=' + part.missing.join(','));
  fs.rmSync(tmp, { recursive: true, force: true });

  // ---- 7. Entry refusals (real subprocesses) ----
  T.section('7. Entry refusals — real subprocess exits');
  let refused = null;
  try {
    execSync('node scripts/burnoffsets-driver-20261113.js', {
      cwd: REPO, encoding: 'utf8',
      env: Object.assign({}, process.env, { BURN: '7', SEEDS: '190391', RUN: 'burnoffsets-proof', DAYS: '150' }),
    });
  } catch (e) { refused = e; }
  T.ok('driver refuses unknown BURN=7 with exit 2 + STOP line', !!refused && refused.status === 2 && /BURNOFFSETS STOP/.test(String((refused.stderr || '') + (refused.stdout || ''))), 'status=' + (refused && refused.status));
  refused = null;
  try {
    execSync('node scripts/burnoffsets-analyze-20261113.js', {
      cwd: REPO, encoding: 'utf8',
      env: Object.assign({}, process.env, { BURN: '1' }),
    });
  } catch (e) { refused = e; }
  T.ok('analyzer refuses a missing corpus with exit 1 + INCOMPLETE', !!refused && refused.status === 1 && /INCOMPLETE/.test(String((refused.stderr || '') + (refused.stdout || ''))), 'status=' + (refused && refused.status));

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
