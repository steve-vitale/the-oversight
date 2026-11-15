#!/usr/bin/env node
// test-ove48-mech.js — proof test for the OVE-48 revert-vs-keep
// sub-questions arm (sim-ove48-mech-a, Loop A fleshout-20261115T0215Z).
//
// THE QUESTIONS (evidence/2026-11-14/sim-ove48-mech-prereg.md,
// prereg committed before any judged sim ran): the ove48-conv arm
// proved the OVE-48 pick moves (dawn-aligned 28.7% → 74.9%) but
// left three sub-questions open for the revert-vs-keep call:
// (a) dawnKind null on all 1,810 opens — is the kind half EVER
// populated? (b) nobody says the drive aloud (0/811 lines) because
// the verbatim policy walks out — do held conversations name it?
// (c) what causal path (if any) links the pick to 3/8 → 0/8
// survival? This arm resolves all three; it does NOT make the
// revert-vs-keep call.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Subject verification — branch transplant-15a-narrowed-subject
//      at 493d7a975, tree 6d6216e3…, exactly 1 commit on far end
//      203a32775, diff exactly 3 files +320/-3, green-list.txt
//      byte-identical to the far end. Read-only; never rebuilt.
//   2. (a) code-read — villager-brain.js ABSENT at both 203a32775
//      and 493d7a975 (no writer on either ove48-conv leg); present
//      on master with vbrainCommit; convoDawnPriorities present in
//      master:src/js/convo-wants.js.
//   3. Mech instrument live check (scratch seed 12345, 30d, unjudged):
//      the recorder captures opens, classifies them, records kind
//      non-null on the pick path (writer + reader both present on
//      this tree), joins lines to opens via openIdx/seq, and records
//      held sittings with exchangesAtClose under COMPETENT_TALK=1;
//      uninstall restores the original methods.
//   4. Analyzer tables — DAWN_KIND_WANTS / DAWN_DRIVE_WANTS match
//      the subject source; drive lexicon + isAligned + isOpenerEcho
//      behave on synthetic inputs.
//   5. Step script + driver — the repo step script names the band-3
//      band, restores tooling from sim-ove48-mech-a, swaps the fix
//      standing.js, and exports COMPETENT_TALK=1 ONLY for the talk
//      legs; the driver leg guard refuses markerless standing; no
//      judged corpus / summary / causal JSON exists yet.
//   6. Prereg recorded (master tip, far end, subject, band, all
//      three STEP ids, V1–V4+V6 bars, (a)/(b)/(c) bars, lexicon).
//
// STAGE 2 (`node scripts/test-ove48-mech.js --stage2`, after all
// three steps + the talk comparison + the causal run + the evidence
// file) proves:
//   1. All three corpora 8/8 complete, 0 instrument errors.
//   2. Kind summary verdict GO or PROVEN-NEGATIVE (never DIAG);
//      talk summaries VALID-INSTRUMENT; talk comparison verdict GO,
//      NO-GO or INSUFFICIENT (never DIAG); causal JSON verdict
//      PROVEN-NEGATIVE or CHAIN-CANDIDATE.
//   3. The bars were applied as written (kind GO implies
//      pickKindShare >= 1% and dawnKindShare >= 1%; talk GO implies
//      naming share >= 25% and mean aligned exchanges > misaligned).
//   4. Standing.js on disk is the arm branch's version
//      (byte-identical to HEAD); tracked tree clean apart from the
//      committed evidence/corpus; the repo step script still names
//      the band-3 band; no src/js change in the arm's commits.
//   5. The evidence file exists and records all three verdicts, the
//      wall numbers, and a metric-review section.
//
// Usage: node scripts/test-ove48-mech.js [--stage2]
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
function fileExistsAt(commit, file) {
  try { execSync('git cat-file -e ' + commit + ':' + file + ' 2>/dev/null', { cwd: REPO, encoding: 'utf8' }); return true; }
  catch (e) { return false; }
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
  const masterTip = sh('git rev-parse master');
  check('master tip is a4d0b2038', masterTip.indexOf('a4d0b2038') === 0, masterTip);

  // 2. (a) code-read: no writer on either ove48-conv leg.
  check('villager-brain.js ABSENT at far end 203a32775 (no writer)', fileExistsAt('203a32775', 'src/js/villager-brain.js') === false);
  check('villager-brain.js ABSENT at subject 493d7a975 (no writer)', fileExistsAt('493d7a975', 'src/js/villager-brain.js') === false);
  check('villager-brain.js PRESENT on master', fileExistsAt('master', 'src/js/villager-brain.js') === true);
  const masterBrain = sh('git show master:src/js/villager-brain.js');
  check('master villager-brain.js defines vbrainCommit + writeCommit', masterBrain.indexOf('vbrainCommit: function') !== -1 && masterBrain.indexOf('function writeCommit') !== -1);
  const masterWants = sh('git show master:src/js/convo-wants.js');
  check('master convo-wants.js defines convoDawnPriorities', masterWants.indexOf('convoDawnPriorities(vid)') !== -1);
  check('master DAWN_KIND_WANTS has FORAGE entry', extractTable(masterWants, 'DAWN_KIND_WANTS') && extractTable(masterWants, 'DAWN_KIND_WANTS').FORAGE && extractTable(masterWants, 'DAWN_KIND_WANTS').FORAGE[0] === 'ask_favor');

  // 3. Mech instrument live check on a scratch seed (unjudged).
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const REC = require(path.join(REPO, 'scripts', 'ove48-mech-instrument-20261114'));
  const { Game } = await loadGame({ seed: 12345, mode: 'competent-vetphantom', fullTelemetry: false });
  check('pick present on this tree (convoDawnPriorities exists)', typeof Game.convoDawnPriorities === 'function');
  check('writer present on this tree (vbrainCommit exists)', typeof Game.vbrainCommit === 'function');
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
  const kindA = outA.opens.filter(function (o) { return o.pickDawn && o.pickDawn.kind; }).length;
  check('kind non-null on >=1 pick-path open (writer+reader present)', kindA >= 1, 'kindNonNull=' + kindA + '/' + outA.opens.length);
  const kindIndA = outA.opens.filter(function (o) { return o.dawnKind; }).length;
  check('independent dawnKind non-null on >=1 open', kindIndA >= 1, 'dawnKindNonNull=' + kindIndA);
  check('no recorder errors on the pick path', outA.errors.length === 0, JSON.stringify(outA.errors.slice(0, 3)));
  check('uninstall restores original methods', Game.convoSelectWant === origSelect && Game.talkTo === origTalk && Game.endConvo === origEnd);
  // Held conversations: COMPETENT_TALK=1, same Game, reinstall.
  process.env.COMPETENT_TALK = '1';
  const recB = REC.install(Game);
  await quietLog(async function () { await runDays(Game, competent, { days: 15, manifest: undefined, sampleEvery: 1 }); });
  const outB = recB.finish();
  recB.uninstall();
  delete process.env.COMPETENT_TALK;
  check('recorder captured opens on the held path', outB.opens.length >= 5, 'opens=' + outB.opens.length);
  const heldB = outB.opens.filter(function (o) { return o.held; });
  check('held sittings recorded (exchanges >= 1) under COMPETENT_TALK=1', heldB.length >= 1, 'held=' + heldB.length);
  const joinedB = outB.lines.filter(function (l) { return typeof l.openIdx === 'number' && l.openIdx >= 0; }).length;
  check('lines joined to opens via openIdx', joinedB >= 1, 'joined=' + joinedB + '/' + outB.lines.length);
  const seqB = outB.lines.filter(function (l) { return typeof l.seq === 'number'; }).length;
  check('lines carry seq', seqB === outB.lines.length, 'seq=' + seqB + '/' + outB.lines.length);
  const exchB = heldB.filter(function (o) { return typeof o.exchangesAtClose === 'number' && o.exchangesAtClose >= 1; }).length;
  check('held opens carry exchangesAtClose >= 1', exchB === heldB.length, 'exch=' + exchB + '/' + heldB.length);
  check('no recorder errors on the held path', outB.errors.length === 0, JSON.stringify(outB.errors.slice(0, 3)));
  check('uninstall restores methods again', Game.convoSelectWant === origSelect && Game.talkTo === origTalk && Game.endConvo === origEnd);

  // 4. Analyzer tables + lexicon + alignment + opener-echo.
  const AN = require(path.join(REPO, 'scripts', 'ove48-mech-analyze-20261114'));
  const subjSrc = sh('git show transplant-15a-narrowed-subject:src/js/convo-wants.js');
  check('analyzer DAWN_KIND_WANTS matches subject source', eq(AN.DAWN_KIND_WANTS, extractTable(subjSrc, 'DAWN_KIND_WANTS')));
  check('analyzer DAWN_DRIVE_WANTS matches subject source', eq(AN.DAWN_DRIVE_WANTS, extractTable(subjSrc, 'DAWN_DRIVE_WANTS')));
  check('aligned: FORAGE kind + ask_favor', AN.isAligned({ want: 'ask_favor', dawnKind: 'FORAGE', dawnDrive: null }) === true);
  check('not aligned: FORAGE kind + curious', AN.isAligned({ want: 'curious', dawnKind: 'FORAGE', dawnDrive: null }) === false);
  check('null with no dawn state', AN.isAligned({ want: 'ask_favor', dawnKind: null, dawnDrive: null }) === null);
  check('lexicon: pantry line names food_security', AN.lineNamesDrive("Pantry's thin and getting thinner.", 'food_security') === true);
  check('lexicon: pantry line does NOT name safety', AN.lineNamesDrive("Pantry's thin and getting thinner.", 'safety') === false);
  check('lexicon: dawn word names any drive (generic)', AN.lineNamesDrive('At dawn I decided to go out.', 'party_up') === true);
  check('lexicon: small talk names nothing', AN.lineNamesDrive('Nice weather today.', 'food_security') === false);
  check('opener-echo: identical line is an echo', AN.isOpenerEcho('Well, listen. I need you to hear this before you go back out there.', 'Well, listen. I need you to hear this before you go back out there.') === true);
  check('opener-echo: unrelated line is not an echo', AN.isOpenerEcho('The pantry is full.', 'Well, listen. I need you to hear this before you go back out there.') === false);

  // 5. Step script + driver + causal (loads only; no judged run).
  const stepSh = fs.readFileSync(path.join(REPO, 'scripts', 'ove48-mech-step.sh'), 'utf8');
  check('step script names the band-3 band', stepSh.indexOf('SEEDS="190457,190458,190459,190460,190461,190462,190463,190464"') !== -1);
  check('step script restores tooling from sim-ove48-mech-a', stepSh.indexOf('BRANCH="sim-ove48-mech-a"') !== -1);
  check('step script swaps the fix standing.js', stepSh.indexOf('f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078') !== -1);
  check('step script exports COMPETENT_TALK=1 only for talk legs', stepSh.indexOf('t-ove48-mech-talk-base|t-ove48-mech-talk-subj') !== -1 && stepSh.indexOf('COMPETENT_TALK=1') !== -1);
  check('step script names all three STEP ids', stepSh.indexOf('t-ove48-mech-kind') !== -1 && stepSh.indexOf('t-ove48-mech-talk-base') !== -1 && stepSh.indexOf('t-ove48-mech-talk-subj') !== -1);
  process.env.LEG = 'ove48mech'; // the driver reads LEG at require time
  const drv = require(path.join(REPO, 'scripts', 'ove48-mech-driver-20261114'));
  check('driver leg guard refuses markerless standing', drv.legGuard('no marker here', 'x').ok === false);
  check('driver leg guard accepts marker standing', drv.legGuard('ROSTER CHECK present', 'x').ok === true);
  const CA = require(path.join(REPO, 'scripts', 'ove48-mech-causal-20261114'));
  check('causal analyzer loads with the band-3 seeds', eq(CA.SEEDS, [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464]));
  check('no judged corpus exists yet (kind)', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-mech-t-ove48-mech-kind')));
  check('no judged corpus exists yet (talk-base)', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-mech-t-ove48-mech-talk-base')));
  check('no judged corpus exists yet (talk-subj)', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-mech-t-ove48-mech-talk-subj')));
  check('no causal JSON exists yet', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'ove48-mech-causal.json')));
  check('no talk comparison exists yet', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'ove48-mech-talk-comparison.json')));

  // 6. Prereg recorded.
  const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-ove48-mech-prereg.md'), 'utf8');
  for (const needle of ['a4d0b2038', '203a32775', 'transplant-15a-narrowed-subject', '190457', 't-ove48-mech-kind', 't-ove48-mech-talk-base', 't-ove48-mech-talk-subj', 'V6', 'DRIVE LEXICON', 'PROVEN NEGATIVE', 'COMPETENT_TALK=1']) {
    check('prereg records ' + needle, prereg.indexOf(needle) !== -1);
  }
}

function stage2() {
  const AN = require(path.join(REPO, 'scripts', 'ove48-mech-analyze-20261114'));
  // 1. Corpora complete, 0 instrument errors; leg verdicts.
  for (const step of ['t-ove48-mech-kind', 't-ove48-mech-talk-base', 't-ove48-mech-talk-subj']) {
    const corpus = AN.loadCorpus(AN.SEEDS, step);
    check(step + ' corpus 8/8 complete', corpus.complete, 'missing: ' + (corpus.missing || []).join(','));
    const rows = corpus.rows;
    const errs = rows.reduce(function (n, r) { return n + ((r.instrumentErrors || []).length); }, 0);
    check(step + ' 0 instrument errors', errs === 0, 'errors=' + errs);
    const opens = rows.reduce(function (n, r) { return n + (((r.convo || {}).opens || []).length); }, 0);
    check(step + ' opens >= 200 (V1)', opens >= 200, 'opens=' + opens);
    const s = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'ove48-mech-' + step + '-summary.json'), 'utf8'));
    check(step + ' validity passes', s.validityPass === true, JSON.stringify(s.validity));
  }
  const kindS = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'ove48-mech-t-ove48-mech-kind-summary.json'), 'utf8'));
  check('(a) kind verdict is GO or PROVEN-NEGATIVE (not DIAG)', kindS.verdict === 'GO' || kindS.verdict === 'PROVEN-NEGATIVE', kindS.verdict);
  if (kindS.verdict === 'GO') {
    check('(a) GO bar: pickKindShare >= 1%', kindS.convo.pickKindShare >= 0.01, String(kindS.convo.pickKindShare));
    check('(a) GO bar: dawnKindShare >= 1%', kindS.convo.dawnKindShare >= 0.01, String(kindS.convo.dawnKindShare));
  }
  for (const step of ['t-ove48-mech-talk-base', 't-ove48-mech-talk-subj']) {
    const s = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'ove48-mech-' + step + '-summary.json'), 'utf8'));
    check(step + ' verdict VALID-INSTRUMENT', s.verdict === 'VALID-INSTRUMENT', s.verdict);
    check(step + ' held sittings >= 20 (V6)', s.convo.held >= 20, 'held=' + s.convo.held);
  }
  // 2. Talk comparison verdict GO, NO-GO or INSUFFICIENT (not DIAG).
  const cmpPath = path.join(REPO, 'evidence', '2026-11-14', 'ove48-mech-talk-comparison.json');
  check('talk comparison JSON exists', fs.existsSync(cmpPath));
  const cmp = JSON.parse(fs.readFileSync(cmpPath, 'utf8'));
  check('(b) comparison verdict is GO, NO-GO or INSUFFICIENT (not DIAG)', cmp.verdict === 'GO' || cmp.verdict === 'NO-GO' || cmp.verdict === 'INSUFFICIENT', cmp.verdict);
  if (cmp.verdict === 'GO') {
    check('(b) GO bar: naming share >= 25%', cmp.namingShare >= 0.25, String(cmp.namingShare));
    check('(b) GO bar: mean aligned exchanges > misaligned', cmp.pooled.meanExchAligned > cmp.pooled.meanExchMisaligned, String(cmp.pooled.meanExchAligned) + ' vs ' + String(cmp.pooled.meanExchMisaligned));
  }
  // 3. Causal verdict.
  const causalPath = path.join(REPO, 'evidence', '2026-11-14', 'ove48-mech-causal.json');
  check('causal JSON exists', fs.existsSync(causalPath));
  const causal = JSON.parse(fs.readFileSync(causalPath, 'utf8'));
  check('(c) causal verdict is PROVEN-NEGATIVE or CHAIN-CANDIDATE', causal.verdict === 'PROVEN-NEGATIVE' || causal.verdict === 'CHAIN-CANDIDATE', causal.verdict);
  check('(c) causal covers all 8 seeds', (causal.perSeed || []).length === 8, String((causal.perSeed || []).length));
  // 4. Standing.js + tree state + no src/js changes in the arm.
  check('HEAD is the arm branch tip (on sim-ove48-mech-a)', sh('git branch --show-current') === 'sim-ove48-mech-a');
  const diskSha = sh('sha256sum src/js/standing.js').split(' ')[0];
  const headStandingSha = sh('git show HEAD:src/js/standing.js | sha256sum').split(' ')[0];
  check('on-disk standing.js byte-identical to HEAD', diskSha === headStandingSha);
  const stepSh = fs.readFileSync(path.join(REPO, 'scripts', 'ove48-mech-step.sh'), 'utf8');
  check('repo step script still names the band-3 band (unmodified)', stepSh.indexOf('SEEDS="190457,190458,190459,190460,190461,190462,190463,190464"') !== -1);
  const srcChanges = sh('git log --oneline master..HEAD -- src/js/ || true');
  check('no src/js change in the arm commits (DIAG tooling only)', srcChanges === '', srcChanges);
  // 5. Evidence file.
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-ove48-mech-a.md'), 'utf8');
  check('evidence file records the (a) verdict', ev.indexOf(kindS.verdict) !== -1);
  check('evidence file records the (b) verdict', ev.indexOf(cmp.verdict) !== -1);
  check('evidence file records the (c) verdict', ev.indexOf(causal.verdict) !== -1);
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
  console.log('test-ove48-mech ' + (STAGE2 ? 'stage 2' : 'stage 1') + ': ' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.error('failures:\n- ' + failures.join('\n- ')); process.exitCode = 1; }
})().catch(function (e) { console.error(e && e.stack || e); process.exitCode = 1; });
