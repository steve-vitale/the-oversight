#!/usr/bin/env node
// test-talktranscript.js — proof test for the OVE-48 spoken-drive
// judged transcript run (arm sim-talktranscript-a, Loop A
// fleshout-20261115T0427Z).
//
// THE QUESTION (evidence/2026-11-14/sim-talktranscript-prereg.md,
// prereg committed before any judged sim ran): the ove48-mech (b)
// NO-GO (18.7% of held sittings name the drive, bar 25%) was
// judged on a Game.say instrument — but spoken dialogue does not
// go through Game.say; it goes to c.transcript. A scratch probe
// found 62.5% (42.9% ex-"promise") on transcript beats. This arm
// re-measures (b) on the spoken channel with the same bar, legs,
// seeds and policy, changing ONLY the capture channel.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Subject verification — branch transplant-15a-narrowed-subject
//      at 493d7a975, tree 6d6216e3…, exactly 1 commit on far end
//      203a32775, diff exactly 3 files +320/-3, green-list.txt
//      byte-identical to the far end. Read-only; never rebuilt.
//   2. Channel code-read — sayLine pushes spoken beats to
//      c.transcript ({who:'them', text}) on master AND both legs;
//      the ONE TEXT STREAM rule (dialogue never echoed to Game.say)
//      is present on both legs; c.transcript is reset exactly once
//      (at open) and never cleared by endConvo on all three trees;
//      endConvo speaks the goodbye + want-closing beats via sayLine,
//      so the post-close snapshot is the complete sitting.
//   3. SMOKE TEST (live, scratch seed 12345, 30d, unjudged): the
//      transcript recorder captures opens, classifies them, joins
//      them-beats to opens via openIdx/seq, and records held
//      sittings with exchangesAtClose under COMPETENT_TALK=1 —
//      while leaving Game.say untouched (identity check) and
//      restoring all methods on uninstall. The first two held
//      sittings' full transcripts print to stdout as visible proof
//      the channel captures real spoken lines.
//   4. Analyzer tables — DAWN_KIND_WANTS / DAWN_DRIVE_WANTS match
//      the subject source; the drive lexicon is VERBATIM the mech
//      lexicon (deep-equal against ove48-mech-analyze-20261114.js);
//      the ex-"promise" secondary behaves; isAligned +
//      isOpenerEcho behave on synthetic inputs.
//   5. Step script + driver — the repo step script names the band-3
//      band, restores tooling from sim-talktranscript-a, swaps the
//      fix standing.js, and exports COMPETENT_TALK=1 for both talk
//      legs; the driver leg guard refuses markerless standing; no
//      judged corpus / summary / comparison exists yet.
//   6. Prereg recorded (far end, subject, band, both STEP ids,
//      V1–V4+V6 bars, the (b) bar, the verbatim lexicon, the
//      c.transcript channel + smoke-test requirement).
//
// STAGE 2 (`node scripts/test-talktranscript.js --stage2`, after
// both steps + the talk comparison + the evidence file) proves:
//   1. Both corpora 8/8 complete, 0 instrument errors.
//   2. Talk summaries VALID-INSTRUMENT; talk comparison verdict GO,
//      NO-GO or INSUFFICIENT (never DIAG).
//   3. The bars were applied as written (GO implies naming share
//      >= 25% and mean aligned exchanges > misaligned).
//   4. Standing.js on disk is the arm branch's version
//      (byte-identical to HEAD); tracked tree clean apart from the
//      committed evidence/corpus; the repo step script still names
//      the band-3 band; no src/js change in the arm's commits.
//   5. The evidence file exists and records the verdict, the wall
//      numbers, and a metric-review section.
//
// Usage: node scripts/test-talktranscript.js [--stage2]
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
  check('mech master tip a4d0b2038 is an ancestor of master (master tip now ' + masterTip.slice(0, 12) + ')', (function () { try { execSync('git merge-base --is-ancestor a4d0b2038 master', { cwd: REPO }); return true; } catch (e) { return false; } })());

  // 2. Channel code-read: spoken dialogue lives in c.transcript,
  // never in Game.say — on master AND both legs.
  const masterConv = sh('git show master:src/js/conversation.js');
  const farConv = sh('git show 203a32775:src/js/conversation.js');
  const subjConv = sh('git show 493d7a975:src/js/conversation.js');
  for (const [name, src] of [['master', masterConv], ['far end', farConv], ['subject', subjConv]]) {
    check('sayLine pushes spoken beats to c.transcript (' + name + ')', src.indexOf('c.transcript.push(entry)') !== -1);
    check('ONE TEXT STREAM rule present (' + name + ')', src.indexOf('ONE TEXT STREAM') !== -1);
    const resets = (src.match(/transcript = \[\]/g) || []).length;
    check('c.transcript reset exactly once, at open (' + name + ')', resets === 1, 'resets=' + resets);
  }
  check('endConvo speaks goodbye + closing beat via sayLine (post-close snapshot is complete)', masterConv.indexOf("this.sayLine(vid, line, { structural: true })") !== -1 && masterConv.indexOf('this.sayLine(vid, wantClose, { structural: true })') !== -1);
  check('convoGet exists on master (instrument read point)', masterConv.indexOf('convoGet(vid)') !== -1);

  // 3. SMOKE TEST — live transcript capture on a scratch seed.
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const REC = require(path.join(REPO, 'scripts', 'talktranscript-instrument-20261114'));
  const { Game } = await loadGame({ seed: 12345, mode: 'competent-vetphantom', fullTelemetry: false });
  check('pick present on this tree (convoDawnPriorities exists)', typeof Game.convoDawnPriorities === 'function');
  const origSelect = Game.convoSelectWant, origTalk = Game.talkTo, origEnd = Game.endConvo, origSay = Game.say;
  const recA = REC.install(Game);
  check('install leaves Game.say untouched (transcript-only channel)', Game.say === origSay);
  await setupGame(Game);
  await quietLog(async function () { await runDays(Game, competent, { days: 15, manifest: undefined, sampleEvery: 1 }); });
  const outA = recA.finish();
  recA.uninstall();
  check('recorder captured opens on the pick path', outA.opens.length >= 5, 'opens=' + outA.opens.length);
  check('dawn-priority reads > 0 on the pick path', outA.totals.dawnPriorityReads > 0, 'reads=' + outA.totals.dawnPriorityReads);
  const classifiedA = outA.opens.filter(function (o) { return o.want && o.source && o.dawnSource && o.dawnSource !== 'error'; }).length;
  check('>=95% of pick-path opens classified', outA.opens.length > 0 && classifiedA / outA.opens.length >= 0.95, classifiedA + '/' + outA.opens.length);
  check('no recorder errors on the pick path', outA.errors.length === 0, JSON.stringify(outA.errors.slice(0, 3)));
  check('uninstall restores original methods', Game.convoSelectWant === origSelect && Game.talkTo === origTalk && Game.endConvo === origEnd && Game.say === origSay);
  // Held conversations: COMPETENT_TALK=1, same Game, reinstall.
  process.env.COMPETENT_TALK = '1';
  const recB = REC.install(Game);
  check('install leaves Game.say untouched on the held path too', Game.say === origSay);
  await quietLog(async function () { await runDays(Game, competent, { days: 15, manifest: undefined, sampleEvery: 1 }); });
  const outB = recB.finish();
  recB.uninstall();
  delete process.env.COMPETENT_TALK;
  check('recorder captured opens on the held path', outB.opens.length >= 5, 'opens=' + outB.opens.length);
  const heldB = outB.opens.filter(function (o) { return o.held; });
  check('held sittings recorded (exchanges >= 1) under COMPETENT_TALK=1', heldB.length >= 5, 'held=' + heldB.length);
  const joinedB = outB.lines.filter(function (l) { return typeof l.openIdx === 'number' && l.openIdx >= 0; }).length;
  check('them-beats joined to opens via openIdx', joinedB >= 10, 'joined=' + joinedB + '/' + outB.lines.length);
  const seqB = outB.lines.filter(function (l) { return typeof l.seq === 'number'; }).length;
  check('beats carry seq', seqB === outB.lines.length, 'seq=' + seqB + '/' + outB.lines.length);
  const richHeld = heldB.filter(function (o) { return (o.themBeats || 0) >= 2; });
  check('at least one held sitting with >= 2 them-beats (opener + turn)', richHeld.length >= 1, 'rich=' + richHeld.length + '/' + heldB.length);
  const exchB = heldB.filter(function (o) { return typeof o.exchangesAtClose === 'number' && o.exchangesAtClose >= 1; }).length;
  check('held opens carry exchangesAtClose >= 1', exchB === heldB.length, 'exch=' + exchB + '/' + heldB.length);
  check('transcript beats captured (them-beats > 0)', (outB.totals.themBeats || 0) > 0, 'themBeats=' + outB.totals.themBeats);
  check('no verbal sittings left unjoined', (outB.totals.sittingsUnjoined || 0) === 0, 'unjoined=' + outB.totals.sittingsUnjoined);
  check('close conservation: captured + nonverbal + noop = endConvo calls', (outB.totals.sittingsCaptured || 0) + (outB.totals.sittingsNonverbal || 0) + (outB.totals.endConvoNoop || 0) === outB.totals.endConvoCalls, 'captured=' + outB.totals.sittingsCaptured + ' nonverbal=' + outB.totals.sittingsNonverbal + ' noop=' + outB.totals.endConvoNoop + ' calls=' + outB.totals.endConvoCalls);
  check('no recorder errors on the held path', outB.errors.length === 0, JSON.stringify(outB.errors.slice(0, 3)));
  check('uninstall restores methods again', Game.convoSelectWant === origSelect && Game.talkTo === origTalk && Game.endConvo === origEnd && Game.say === origSay);
  // Visible smoke proof: print the first two rich held sittings.
  const shown = richHeld.slice(0, 2);
  for (const o of shown) {
    const beats = outB.lines.filter(function (l) { return l.openIdx === outB.opens.indexOf(o); });
    console.log('SMOKE sitting day ' + o.day + ' vid ' + o.vid + ' want ' + o.want + ' dawnDrive ' + o.dawnDrive + ' exchanges ' + o.exchangesAtClose + ' them-beats ' + o.themBeats + ':');
    for (const b of beats) console.log('  [seq ' + b.seq + '] ' + b.line);
  }
  check('smoke printed >= 1 rich held sitting transcript', shown.length >= 1);

  // 4. Analyzer tables + lexicon (verbatim vs mech) + alignment.
  const AN = require(path.join(REPO, 'scripts', 'talktranscript-analyze-20261114'));
  const MECH = require(path.join(REPO, 'scripts', 'ove48-mech-analyze-20261114'));
  const subjSrc = sh('git show transplant-15a-narrowed-subject:src/js/convo-wants.js');
  check('analyzer DAWN_KIND_WANTS matches subject source', eq(AN.DAWN_KIND_WANTS, extractTable(subjSrc, 'DAWN_KIND_WANTS')));
  check('analyzer DAWN_DRIVE_WANTS matches subject source', eq(AN.DAWN_DRIVE_WANTS, extractTable(subjSrc, 'DAWN_DRIVE_WANTS')));
  check('drive lexicon VERBATIM the mech lexicon', eq(AN.DRIVE_LEXICON, MECH.DRIVE_LEXICON));
  check('generic lexicon VERBATIM the mech lexicon', eq(AN.GENERIC_LEXICON, MECH.GENERIC_LEXICON));
  check('ex-promise generic drops only "promise"', eq(AN.GENERIC_LEXICON_NO_PROMISE, MECH.GENERIC_LEXICON.filter(function (w) { return w !== 'promise'; })));
  check('aligned: FORAGE kind + ask_favor', AN.isAligned({ want: 'ask_favor', dawnKind: 'FORAGE', dawnDrive: null }) === true);
  check('not aligned: FORAGE kind + curious', AN.isAligned({ want: 'curious', dawnKind: 'FORAGE', dawnDrive: null }) === false);
  check('null with no dawn state', AN.isAligned({ want: 'ask_favor', dawnKind: null, dawnDrive: null }) === null);
  check('lexicon: pantry line names food_security', AN.lineNamesDrive("Pantry's thin and getting thinner.", 'food_security') === true);
  check('lexicon: pantry line does NOT name safety', AN.lineNamesDrive("Pantry's thin and getting thinner.", 'safety') === false);
  check('lexicon: dawn word names any drive (generic)', AN.lineNamesDrive('At dawn I decided to go out.', 'party_up') === true);
  check('lexicon: small talk names nothing', AN.lineNamesDrive('Nice weather today.', 'food_security') === false);
  check('ex-promise: promise-only line names nothing without promise', AN.lineNamesDriveNoPromise('I promise I will keep my word.', 'food_security') === false);
  check('ex-promise: promise-only line DOES name with the verbatim lexicon', AN.lineNamesDrive('I promise I will keep my word.', 'food_security') === true);
  check('ex-promise: pantry line still names without promise', AN.lineNamesDriveNoPromise("Pantry's thin and getting thinner.", 'food_security') === true);
  check('opener-echo: identical line is an echo', AN.isOpenerEcho('Well, listen. I need you to hear this before you go back out there.', 'Well, listen. I need you to hear this before you go back out there.') === true);
  check('opener-echo: unrelated line is not an echo', AN.isOpenerEcho('The pantry is full.', 'Well, listen. I need you to hear this before you go back out there.') === false);

  // 5. Step script + driver (loads only; no judged run).
  const stepSh = fs.readFileSync(path.join(REPO, 'scripts', 'talktranscript-step.sh'), 'utf8');
  check('step script names the band-3 band', stepSh.indexOf('SEEDS="190457,190458,190459,190460,190461,190462,190463,190464"') !== -1);
  check('step script restores tooling from sim-talktranscript-a', stepSh.indexOf('BRANCH="sim-talktranscript-a"') !== -1);
  check('step script swaps the fix standing.js', stepSh.indexOf('f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078') !== -1);
  check('step script exports COMPETENT_TALK=1 for both talk legs', stepSh.indexOf('t-talktranscript-base') !== -1 && stepSh.indexOf('t-talktranscript-subj') !== -1 && stepSh.indexOf('COMPETENT_TALK=1') !== -1);
  check('step script names both STEP ids', stepSh.indexOf('t-talktranscript-base') !== -1 && stepSh.indexOf('t-talktranscript-subj') !== -1);
  check('step script restores the transcript instrument (not the mech one)', stepSh.indexOf('talktranscript-instrument-20261114.js') !== -1 && stepSh.indexOf('ove48-mech-instrument') === -1);
  process.env.LEG = 'talktranscript'; // the driver reads LEG at require time
  const drv = require(path.join(REPO, 'scripts', 'talktranscript-driver-20261114'));
  check('driver leg guard refuses markerless standing', drv.legGuard('no marker here', 'x').ok === false);
  check('driver leg guard accepts marker standing', drv.legGuard('ROSTER CHECK present', 'x').ok === true);
  check('driver uses the transcript instrument', fs.readFileSync(path.join(REPO, 'scripts', 'talktranscript-driver-20261114.js'), 'utf8').indexOf('talktranscript-instrument-20261114') !== -1);
  check('no judged corpus exists yet (talk-base)', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'perseed-talktranscript-t-talktranscript-base')));
  check('no judged corpus exists yet (talk-subj)', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'perseed-talktranscript-t-talktranscript-subj')));
  check('no talk comparison exists yet', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'talktranscript-talk-comparison.json')));

  // 6. Prereg recorded.
  const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-talktranscript-prereg.md'), 'utf8');
  for (const needle of ['203a32775', 'transplant-15a-narrowed-subject', '190457', 't-talktranscript-base', 't-talktranscript-subj', 'V6', 'DRIVE LEXICON', 'c.transcript', 'SMOKE TEST', 'COMPETENT_TALK=1', 'ONE TEXT STREAM', 'QUOTED-ONLY']) {
    check('prereg records ' + needle, prereg.indexOf(needle) !== -1);
  }
}

function stage2() {
  const AN = require(path.join(REPO, 'scripts', 'talktranscript-analyze-20261114'));
  // 1. Corpora complete, 0 instrument errors; leg verdicts.
  for (const step of ['t-talktranscript-base', 't-talktranscript-subj']) {
    const corpus = AN.loadCorpus(AN.SEEDS, step);
    check(step + ' corpus 8/8 complete', corpus.complete, 'missing: ' + (corpus.missing || []).join(','));
    const rows = corpus.rows;
    const errs = rows.reduce(function (n, r) { return n + ((r.instrumentErrors || []).length); }, 0);
    check(step + ' 0 instrument errors', errs === 0, 'errors=' + errs);
    const opens = rows.reduce(function (n, r) { return n + (((r.convo || {}).opens || []).length); }, 0);
    check(step + ' opens >= 200 (V1)', opens >= 200, 'opens=' + opens);
    const s = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'talktranscript-' + step + '-summary.json'), 'utf8'));
    check(step + ' validity passes', s.validityPass === true, JSON.stringify(s.validity));
  }
  for (const step of ['t-talktranscript-base', 't-talktranscript-subj']) {
    const s = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'talktranscript-' + step + '-summary.json'), 'utf8'));
    check(step + ' verdict VALID-INSTRUMENT', s.verdict === 'VALID-INSTRUMENT', s.verdict);
    check(step + ' held sittings >= 20 (V6)', s.convo.held >= 20, 'held=' + s.convo.held);
    check(step + ' transcript beats captured (lines > 0)', (s.convo.lines || 0) > 0, 'lines=' + s.convo.lines);
  }
  // 2. Talk comparison verdict GO, NO-GO or INSUFFICIENT (not DIAG).
  const cmpPath = path.join(REPO, 'evidence', '2026-11-14', 'talktranscript-talk-comparison.json');
  check('talk comparison JSON exists', fs.existsSync(cmpPath));
  const cmp = JSON.parse(fs.readFileSync(cmpPath, 'utf8'));
  check('(b) comparison verdict is GO, NO-GO or INSUFFICIENT (not DIAG)', cmp.verdict === 'GO' || cmp.verdict === 'NO-GO' || cmp.verdict === 'INSUFFICIENT', cmp.verdict);
  if (cmp.verdict === 'GO') {
    check('(b) GO bar: naming share >= 25%', cmp.namingShare >= 0.25, String(cmp.namingShare));
    check('(b) GO bar: mean aligned exchanges > misaligned', cmp.pooled.meanExchAligned > cmp.pooled.meanExchMisaligned, String(cmp.pooled.meanExchAligned) + ' vs ' + String(cmp.pooled.meanExchMisaligned));
  }
  // 3. Standing.js + tree state + no src/js changes in the arm.
  check('HEAD is the arm branch tip (on sim-talktranscript-a)', sh('git branch --show-current') === 'sim-talktranscript-a');
  const diskSha = sh('sha256sum src/js/standing.js').split(' ')[0];
  const headStandingSha = sh('git show HEAD:src/js/standing.js | sha256sum').split(' ')[0];
  check('on-disk standing.js byte-identical to HEAD', diskSha === headStandingSha);
  const stepSh = fs.readFileSync(path.join(REPO, 'scripts', 'talktranscript-step.sh'), 'utf8');
  check('repo step script still names the band-3 band (unmodified)', stepSh.indexOf('SEEDS="190457,190458,190459,190460,190461,190462,190463,190464"') !== -1);
  const srcChanges = sh('git log --oneline master..HEAD -- src/js/ || true');
  check('no src/js change in the arm commits (DIAG tooling only)', srcChanges === '', srcChanges);
  // 4. Evidence file.
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-talktranscript-a.md'), 'utf8');
  check('evidence file records the (b) verdict', ev.indexOf(cmp.verdict) !== -1);
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
  console.log('test-talktranscript ' + (STAGE2 ? 'stage 2' : 'stage 1') + ': ' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.error('failures:\n- ' + failures.join('\n- ')); process.exitCode = 1; }
})().catch(function (e) { console.error(e && e.stack || e); process.exitCode = 1; });
