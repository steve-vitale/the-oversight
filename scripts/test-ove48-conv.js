#!/usr/bin/env node
// test-ove48-conv.js — proof test for the OVE-48 MECHANISM arm
// (sim-ove48-conv-a, Loop A fleshout-20261114T2315Z).
//
// THE QUESTION (evidence/2026-11-14/sim-ove48-conv-prereg.md,
// prereg committed before any judged sim ran): band 3 proved a
// SURVIVAL effect for OVE-48 (far end 3/8 vs subject 0/8 on fresh
// band 190457–190464) but not the conversation behavior — zero
// dawn/commitment/want lines in 473 vetSays lines, no convo-want
// event type in telemetry. This arm builds the instrument (a
// conversation-open recorder) and measures the mechanism on the
// SAME band: does the subject change what villagers talk about —
// want-opener frequencies, dawn-commitment reads, conversation
// continuation — on identical seeds? Revert-vs-keep is NOT decided
// here; the call follows with the mechanism in hand.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Subject verification — branch transplant-15a-narrowed-subject
//      at 493d7a975, tree 6d6216e3…, exactly 1 commit on far end
//      203a32775, diff exactly 3 files +320/-3, green-list.txt
//      byte-identical to the far end. Read-only; never rebuilt.
//   2. Instrument live check (scratch seed 12345, 30d, unjudged):
//      the recorder captures conversation opens, classifies them
//      (want + source + dawn state), counts convoDawnPriorities
//      reads on the pick path, and records 0 reads when the pick
//      function is absent (the baseline code path); uninstall
//      restores the original methods.
//   3. Analyzer tables — DAWN_KIND_WANTS / DAWN_DRIVE_WANTS in the
//      analyzer are byte-identical to the subject source
//      (`git show transplant-15a-narrowed-subject:src/js/convo-wants.js`).
//   4. Alignment logic — isAligned on synthetic opens (kind/drive
//      preferred, non-preferred, no dawn state).
//   5. Step script + driver — the repo step script names the band-3
//      band and restores tooling from sim-ove48-conv-a; the driver
//      leg guard refuses markerless standing; no judged corpus
//      exists yet (no STEP t-ove48-conv-base/subj per-seed dir).
//   6. Prereg recorded (base, subject, band, both STEP ids, V1–V5
//      bars, deciding comparison, continuation scope).
//
// STAGE 2 (`node scripts/test-ove48-conv.js --stage2`, after both
// steps + the comparison + the evidence file) proves:
//   1. Both corpora 8/8 complete, 0 instrument errors.
//   2. Validity V1–V5 pass on both legs (incl. V5 replication vs
//      the band-3 corpora, field-for-field).
//   3. The comparison JSON exists with verdict GO or NO-GO (never
//      DIAG) and the pre-registered bar applied as written.
//   4. Standing.js on disk is the arm branch's version
//      (byte-identical to HEAD); tracked tree clean apart from the
//      committed evidence/corpus; the repo step script still names
//      the band-3 band (unmodified).
//   5. The evidence file exists and records the verdict, the wall
//      numbers, and a metric-review section.
//
// Usage: node scripts/test-ove48-conv.js [--stage2]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const STAGE2 = process.argv.indexOf('--stage2') !== -1;

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; failures.push(name + (extra ? ' — ' + extra : '')); console.error('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function sh(cmd) { return execSync(cmd, { cwd: REPO, encoding: 'utf8' }).trim(); }

// Extract a top-level `const NAME = {...};` object literal from source
// text by brace matching, and eval it in isolation.
function extractTable(src, name) {
  const idx = src.indexOf('const ' + name + ' = {');
  if (idx === -1) return null;
  const start = src.indexOf('{', idx);
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) {
        const lit = src.slice(start, i + 1);
        return (new Function('return (' + lit + ');'))();
      }
    }
  }
  return null;
}

async function stage1() {
  // 1. Subject verification (read-only).
  const tip = sh('git rev-parse transplant-15a-narrowed-subject');
  check('subject tip is 493d7a975', tip.indexOf('493d7a9753aee1c154cf809402e6691ee9a5429e') === 0, tip);
  const tree = sh("git rev-parse 'transplant-15a-narrowed-subject^{tree}'");
  check('subject tree is 6d6216e3…', tree === '6d6216e3e414518d2c335829e130e65ec849941b', tree);
  const log = sh('git log --oneline 203a32775..transplant-15a-narrowed-subject');
  check('subject is exactly 1 commit on the far end', log.split('\n').filter(Boolean).length === 1 && log.indexOf('OVE-48') !== -1, log);
  const stat = sh('git diff --shortstat 203a32775 transplant-15a-narrowed-subject');
  check('subject diff is 3 files +320/-3', /3 files changed, 320 insertions\(\+\), 3 deletions\(-\)/.test(stat), stat);
  const glSubj = sh('git show transplant-15a-narrowed-subject:scripts/green-list.txt | sha256sum');
  const glFar = sh('git show 203a32775:scripts/green-list.txt | sha256sum');
  check('green-list.txt byte-identical to the far end', glSubj.split(' ')[0] === glFar.split(' ')[0]);
  const nativeSha = sh('git show 203a32775:src/js/standing.js | sha256sum').split(' ')[0];
  check('far-end native standing.js sha is 75762cb2…', nativeSha.indexOf('75762cb2') === 0, nativeSha);
  const fixSha = sh('git show 5157782a4:src/js/standing.js | sha256sum').split(' ')[0];
  check('fix standing.js sha is f8fda429…', fixSha.indexOf('f8fda429') === 0, fixSha);

  // 2. Instrument live check on a scratch seed (unjudged, 30d).
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const REC = require(path.join(REPO, 'scripts', 'ove48-conv-instrument-20261114'));
  const { Game } = await loadGame({ seed: 12345, mode: 'competent-vetphantom', fullTelemetry: false });
  check('pick present on this tree (convoDawnPriorities exists)', typeof Game.convoDawnPriorities === 'function');
  const origSelect = Game.convoSelectWant, origTalk = Game.talkTo, origEnd = Game.endConvo;
  const recA = REC.install(Game);
  await setupGame(Game);
  await quietLog(async function () { await runDays(Game, competent, { days: 15, manifest: undefined, sampleEvery: 1 }); });
  const outA = recA.finish();
  recA.uninstall();
  check('recorder captured opens on the pick path', outA.opens.length >= 5, 'opens=' + outA.opens.length);
  check('dawn-priority reads > 0 on the pick path', outA.totals.dawnPriorityReads > 0, 'reads=' + outA.totals.dawnPriorityReads);
  const classifiedA = outA.opens.filter(function (o) { return o.want && o.source && o.dawnSource && o.dawnSource !== 'error'; }).length;
  check('>=95% of pick-path opens classified', outA.opens.length > 0 && classifiedA / outA.opens.length >= 0.95, classifiedA + '/' + outA.opens.length);
  const producedA = outA.opens.filter(function (o) { return o.openerProduced; }).length;
  check('opener produced on most pick-path opens', outA.opens.length > 0 && producedA / outA.opens.length >= 0.8, producedA + '/' + outA.opens.length);
  check('uninstall restores original methods', Game.convoSelectWant === origSelect && Game.talkTo === origTalk && Game.endConvo === origEnd);
  check('no recorder errors on the pick path', outA.errors.length === 0, JSON.stringify(outA.errors.slice(0, 3)));
  // Baseline code path: same Game, pick function removed, reinstall.
  delete Game.convoDawnPriorities;
  const recB = REC.install(Game);
  await quietLog(async function () { await runDays(Game, competent, { days: 15, manifest: undefined, sampleEvery: 1 }); });
  const outB = recB.finish();
  recB.uninstall();
  check('recorder captured opens on the baseline path', outB.opens.length >= 5, 'opens=' + outB.opens.length);
  check('dawn-priority reads = 0 on the baseline path', outB.totals.dawnPriorityReads === 0, 'reads=' + outB.totals.dawnPriorityReads);
  const classifiedB = outB.opens.filter(function (o) { return o.want && o.source && o.dawnSource && o.dawnSource !== 'error'; }).length;
  check('>=95% of baseline-path opens classified', outB.opens.length > 0 && classifiedB / outB.opens.length >= 0.95, classifiedB + '/' + outB.opens.length);
  const dawnPresentB = outB.opens.filter(function (o) { return o.dawnKind || o.dawnDrive; }).length;
  check('baseline path still records a dawn state (independent read)', dawnPresentB > 0, 'dawnPresent=' + dawnPresentB);
  check('no recorder errors on the baseline path', outB.errors.length === 0, JSON.stringify(outB.errors.slice(0, 3)));
  check('uninstall restores methods again', Game.convoSelectWant === origSelect && Game.talkTo === origTalk && Game.endConvo === origEnd);

  // 3. Analyzer tables vs subject source.
  const AN = require(path.join(REPO, 'scripts', 'ove48-conv-analyze-20261114'));
  const subjSrc = sh('git show transplant-15a-narrowed-subject:src/js/convo-wants.js');
  check('analyzer DAWN_KIND_WANTS matches subject source', eq(AN.DAWN_KIND_WANTS, extractTable(subjSrc, 'DAWN_KIND_WANTS')));
  check('analyzer DAWN_DRIVE_WANTS matches subject source', eq(AN.DAWN_DRIVE_WANTS, extractTable(subjSrc, 'DAWN_DRIVE_WANTS')));

  // 4. Alignment logic on synthetic opens.
  check('aligned: FORAGE kind + ask_favor', AN.isAligned({ want: 'ask_favor', dawnKind: 'FORAGE', dawnDrive: null }) === true);
  check('not aligned: FORAGE kind + curious', AN.isAligned({ want: 'curious', dawnKind: 'FORAGE', dawnDrive: null }) === false);
  check('aligned via drive: bonds + seek_comfort', AN.isAligned({ want: 'seek_comfort', dawnKind: null, dawnDrive: 'bonds' }) === true);
  check('null with no dawn state', AN.isAligned({ want: 'ask_favor', dawnKind: null, dawnDrive: null }) === null);
  check('kind+drive stack: HUNT + bank_veterans + warn_you', AN.isAligned({ want: 'warn_you', dawnKind: 'HUNT', dawnDrive: 'bank_veterans' }) === true);

  // 5. Step script + driver.
  const stepSh = fs.readFileSync(path.join(REPO, 'scripts', 'ove48-conv-step.sh'), 'utf8');
  check('step script names the band-3 band', stepSh.indexOf('SEEDS="190457,190458,190459,190460,190461,190462,190463,190464"') !== -1);
  check('step script restores tooling from sim-ove48-conv-a', stepSh.indexOf('BRANCH="sim-ove48-conv-a"') !== -1);
  check('step script swaps the fix standing.js', stepSh.indexOf('f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078') !== -1);
  process.env.LEG = 'ove48conv'; // the driver reads LEG at require time
  const drv = require(path.join(REPO, 'scripts', 'ove48-conv-driver-20261114'));
  check('driver leg guard refuses markerless standing', drv.legGuard('no marker here', 'x').ok === false);
  check('driver leg guard accepts marker standing', drv.legGuard('ROSTER CHECK present', 'x').ok === true);
  check('no judged corpus exists yet (base)', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-conv-t-ove48-conv-base')));
  check('no judged corpus exists yet (subj)', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-conv-t-ove48-conv-subj')));

  // 6. Prereg recorded.
  const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-ove48-conv-prereg.md'), 'utf8');
  for (const needle of ['203a32775', 'transplant-15a-narrowed-subject', '190457', 't-ove48-conv-base', 't-ove48-conv-subj', 'V1', 'V5', 'GO bar', 'Continuation scope']) {
    check('prereg records ' + needle, prereg.indexOf(needle) !== -1);
  }
}

function stage2() {
  const AN = require(path.join(REPO, 'scripts', 'ove48-conv-analyze-20261114'));
  // 1. Corpora complete, 0 instrument errors.
  for (const step of ['t-ove48-conv-base', 't-ove48-conv-subj']) {
    const corpus = AN.loadCorpus(AN.SEEDS, step);
    check(step + ' corpus 8/8 complete', corpus.complete, 'missing: ' + (corpus.missing || []).join(','));
    const rows = corpus.rows;
    const errs = rows.reduce(function (n, r) { return n + ((r.instrumentErrors || []).length); }, 0);
    check(step + ' 0 instrument errors', errs === 0, 'errors=' + errs);
    const opens = rows.reduce(function (n, r) { return n + (((r.convo || {}).opens || []).length); }, 0);
    check(step + ' opens >= 200 (V1)', opens >= 200, 'opens=' + opens);
    const s = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'ove48-conv-' + step + '-summary.json'), 'utf8'));
    check(step + ' validity V1–V5 pass', s.validityPass === true, JSON.stringify(s.validity));
    check(step + ' replication mismatches 0 (V5)', (s.replication.mismatches || []).length === 0, JSON.stringify((s.replication.mismatches || []).slice(0, 3)));
  }
  // 2. Comparison verdict GO or NO-GO, bar applied as written.
  const cmpPath = path.join(REPO, 'evidence', '2026-11-14', 'ove48-conv-comparison.json');
  check('comparison JSON exists', fs.existsSync(cmpPath));
  const cmp = JSON.parse(fs.readFileSync(cmpPath, 'utf8'));
  check('comparison verdict is GO or NO-GO (not DIAG)', cmp.verdict === 'GO' || cmp.verdict === 'NO-GO', cmp.verdict);
  check('comparison V3 cross-leg holds (baseline 0 reads, subject > 0)', cmp.v3Cross === true);
  if (cmp.verdict === 'GO') {
    check('GO bar: subject aligned >= 40%', cmp.subj.alignedShare >= 0.40, String(cmp.subj.alignedShare));
    check('GO bar: improvement >= +15pp', cmp.diffPp >= 15, String(cmp.diffPp));
  } else {
    check('NO-GO bar: subject aligned < 40% or improvement < +15pp', cmp.subj.alignedShare < 0.40 || cmp.diffPp < 15, 'aligned=' + cmp.subj.alignedShare + ' diffPp=' + cmp.diffPp);
  }
  // 3. Standing.js + tree state.
  const headSha = sh('git rev-parse HEAD');
  check('HEAD is the arm branch tip (on sim-ove48-conv-a)', sh('git branch --show-current') === 'sim-ove48-conv-a');
  const diskSha = sh('sha256sum src/js/standing.js').split(' ')[0];
  const headStandingSha = sh('git show HEAD:src/js/standing.js | sha256sum').split(' ')[0];
  check('on-disk standing.js byte-identical to HEAD', diskSha === headStandingSha);
  const stepSh = fs.readFileSync(path.join(REPO, 'scripts', 'ove48-conv-step.sh'), 'utf8');
  check('repo step script still names the band-3 band (unmodified)', stepSh.indexOf('SEEDS="190457,190458,190459,190460,190461,190462,190463,190464"') !== -1);
  // 4. Evidence file.
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-ove48-conv.md'), 'utf8');
  check('evidence file records the verdict', ev.indexOf(cmp.verdict) !== -1);
  check('evidence file has a metric review section', /metric review/i.test(ev));
  check('evidence file records wall numbers', /survived/i.test(ev) && /wave-5/i.test(ev));
}

(async function () {
  try {
    if (STAGE2) stage2();
    else await stage1();
  } catch (e) {
    failed++;
    failures.push('exception: ' + (e && e.stack || e));
    console.error(e && e.stack || e);
  }
  console.log('test-ove48-conv ' + (STAGE2 ? 'stage 2' : 'stage 1') + ': ' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.error('failures:\n- ' + failures.join('\n- ')); process.exitCode = 1; }
})().catch(function (e) { console.error(e && e.stack || e); process.exitCode = 1; });
