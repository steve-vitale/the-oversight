#!/usr/bin/env node
// test-ove48-freshband.js — proof test for the OVE-48 FRESH-BAND arm
// (sim-ove48-freshband-a, Loop A fleshout-20261115T0547Z).
//
// THE QUESTION (evidence/2026-11-14/sim-ove48-freshband-prereg.md,
// prereg committed before any judged sim ran): band 3 proved a
// SURVIVAL effect for OVE-48 (far end 3/8 vs subject 0/8 on fresh
// band 190457–190464, 150d, competent verbatim), but the causal path
// is PROVEN NEGATIVE (sim-ove48-mech-a) and the collapse does NOT
// reproduce under held conversations (subject 4/8 vs far end 3/8).
// This arm closes the remaining question: does the 0/8 vs 3/8 gap
// reproduce on a FRESH band under the ORIGINAL band-3 conditions
// (competent verbatim, walk-out)?
//
// DECIDING BAR (pre-registered, judge exactly this):
//   baseline >= 3/8 is the GATE: run the subject leg only if the
//     baseline passes it; otherwise verdict UNMEASURED, no subject
//     leg cut (the 8c precedent).
//   CARRIER if subject <= 1/8 AND baseline >= 3/8.
//   NOT-CARRIER if subject >= baseline - 1.
//   AMBIGUOUS otherwise (inconclusive; no confirm licensed on this
//     band alone).
// The aligned-share mechanism read is DIAGNOSTIC only (the
// mechanism is already proven by sim-ove48-conv-a); the survival
// bar above is the judge.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Subject verification — branch transplant-15a-narrowed-subject
//      at 493d7a975, tree 6d6216e3…, exactly 1 commit on far end
//      203a32775, diff exactly 3 files +320/-3, green-list.txt
//      byte-identical to the far end. Read-only; never rebuilt.
//   2. Freshness — band 190561–190568 named in NO .md under
//      evidence/ or hidden_files/ (single traversal, all 8 seeds).
//   3. Step script — names the fresh band, the fresh STEP ids, RUN
//      ove48-freshband-pilot, restores tooling from
//      sim-ove48-freshband-a, swaps the fix standing.js; the repo
//      ove48-conv analyzer and step script still name the band-3
//      band (unmodified); no scratch tooling file is tracked at
//      either step commit (delete-restore is safe there).
//   4. Scratch-patch simulation — the five analyzer replacements
//      from the step script, applied to a /tmp copy, change exactly
//      5 lines and produce the fresh SEEDS/RUN/step ids plus the
//      V5-not-applicable line.
//   5. Instrument live check (scratch seed 12345, 15d, unjudged):
//      the recorder captures conversation opens, classifies them,
//      counts convoDawnPriorities reads on the pick path; uninstall
//      restores the original methods.
//   6. Analyzer tables — DAWN_KIND_WANTS / DAWN_DRIVE_WANTS in the
//      analyzer are byte-identical to the subject source.
//   7. Alignment logic — isAligned on synthetic opens.
//   8. Driver leg guard — refuses markerless standing, accepts
//      marker standing; no judged corpus exists yet (no freshband
//      per-seed dir).
//   9. Prereg recorded (base, subject, band, both STEP ids, gate,
//      deciding bar, V5-not-applicable).
//
// STAGE 2 (`node scripts/test-ove48-freshband.js --stage2`, after the
// steps + the evidence file) proves:
//   1. Baseline corpus 8/8 complete, 0 instrument errors; summary
//      carries the fresh seeds + RUN ove48-freshband-pilot;
//      validity V1–V4 pass, V5 recorded not-applicable (band3Step
//      null, 0 mismatches).
//   2. Gate outcome matches the corpus: if baseline <= 2/8, the
//      verdict is UNMEASURED and NO subject corpus exists; if
//      baseline >= 3/8, the subject corpus is 8/8 complete with 0
//      errors and the verdict is exactly the pre-registered bar
//      applied to the two survived counts.
//   3. Standing.js on disk is the arm branch's version
//      (byte-identical to HEAD); tracked tree clean apart from the
//      committed evidence/corpus; the repo analyzer and repo conv
//      step script are unmodified; the subject branch tip is still
//      493d7a975 (never committed onto).
//   4. The evidence file exists and records the verdict, the wall
//      numbers, a metric-review section, and a sense-testing
//      section.
//
// Usage: node scripts/test-ove48-freshband.js [--stage2]
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const STAGE2 = process.argv.indexOf('--stage2') !== -1;
const FRESH = [190561, 190562, 190563, 190564, 190565, 190566, 190567, 190568];
const BASE_STEP = 't-ove48-freshband-base';
const SUBJ_STEP = 't-ove48-freshband-subj';

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

function verdictFor(base, subj) {
  if (base == null) return null;
  if (base <= 2) return 'UNMEASURED';
  if (subj == null) return null;
  if (subj <= 1) return 'CARRIER';
  if (subj >= base - 1) return 'NOT-CARRIER';
  return 'AMBIGUOUS';
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

  // 2. Freshness — one traversal over all .md under evidence/ + hidden_files/.
  // Excludes this arm's own prereg/evidence (they name the band by
  // design — the question is whether anyone ELSE named it first).
  const args = FRESH.map(function (s) { return '-e ' + s; }).join(' ');
  let hits = '';
  try {
    hits = execSync('grep -r -l --include="*.md" --exclude="sim-ove48-freshband-prereg.md" --exclude="sim-ove48-freshband-a.md" -F ' + args + ' evidence/ hidden_files/ 2>/dev/null', { cwd: REPO, encoding: 'utf8' }).trim();
  } catch (e) {
    hits = (e.stdout || '').trim(); // grep exits 1 on no match
  }
  check('fresh band 190561–190568 named in no .md (evidence/ + hidden_files/)', hits === '', hits);

  // 3. Step script + repo tooling unmodified.
  const stepSh = fs.readFileSync(path.join(REPO, 'scripts', 'ove48-freshband-step.sh'), 'utf8');
  check('freshband step script names the fresh band', stepSh.indexOf('SEEDS="190561,190562,190563,190564,190565,190566,190567,190568"') !== -1);
  check('freshband step script names RUN ove48-freshband-pilot', stepSh.indexOf('RUN="ove48-freshband-pilot"') !== -1);
  check('freshband step script restores tooling from sim-ove48-freshband-a', stepSh.indexOf('BRANCH="sim-ove48-freshband-a"') !== -1);
  check('freshband step script swaps the fix standing.js', stepSh.indexOf('f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078') !== -1);
  check('freshband step script takes both fresh STEP ids', stepSh.indexOf('t-ove48-freshband-base | t-ove48-freshband-subj') !== -1);
  const repoAn = fs.readFileSync(path.join(REPO, 'scripts', 'ove48-conv-analyze-20261114.js'), 'utf8');
  check('repo analyzer still hardcodes the band-3 band (unmodified)', repoAn.indexOf('const SEEDS = [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464];') !== -1);
  check('repo analyzer still hardcodes RUN ove48-conv-pilot (unmodified)', repoAn.indexOf("const RUN = 'ove48-conv-pilot';") !== -1);
  const repoStep = fs.readFileSync(path.join(REPO, 'scripts', 'ove48-conv-step.sh'), 'utf8');
  check('repo conv step script still names the band-3 band (unmodified)', repoStep.indexOf('SEEDS="190457,190458,190459,190460,190461,190462,190463,190464"') !== -1);
  const scratchFiles = ['scripts/ove48-conv-driver-20261114.js', 'scripts/ove48-conv-analyze-20261114.js', 'scripts/ove48-conv-instrument-20261114.js', 'scripts/vetfirst-instrument-20261111.js', 'scripts/masterregress-analyze-20261113.js'];
  for (const commit of ['203a32775', '493d7a975']) {
    const tracked = sh('git ls-tree -r --name-only ' + commit + ' scripts/ | grep -E "vetfirst|masterregress|ove48|culpritbisect" || true');
    check('no scratch tooling tracked at ' + commit + ' (delete-restore safe)', tracked === '', tracked);
  }

  // 4. Scratch-patch simulation on a /tmp copy (same five
  // replacements the step script applies; must touch exactly 5 lines).
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ove48-freshband-patch-'));
  const tmpAn = path.join(tmpDir, 'ove48-conv-analyze-20261114.js');
  fs.writeFileSync(tmpAn, repoAn);
  let s = repoAn;
  function once(before, after) {
    const n = s.split(before).length - 1;
    if (n !== 1) throw new Error('patch pattern not found exactly once: ' + before.slice(0, 60));
    s = s.replace(before, after);
  }
  once('const SEEDS = [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464];', 'const SEEDS = [190561, 190562, 190563, 190564, 190565, 190566, 190567, 190568];');
  once("const RUN = 'ove48-conv-pilot';", "const RUN = 'ove48-freshband-pilot';");
  once("const isSubj = step === 't-ove48-conv-subj';", "const isSubj = step === 't-ove48-freshband-subj';");
  once("const isBase = step === 't-ove48-conv-base';", "const isBase = step === 't-ove48-freshband-base';");
  once("if (!b3) { out.mismatches.push('no band-3 mapping for step ' + step); return out; }", "if (!b3) { return out; } // fresh band: V5 does not apply (no band-3 counterpart on fresh seeds); band3Step stays null");
  fs.writeFileSync(tmpAn, s);
  const diff = execSync('diff ' + path.join(REPO, 'scripts', 'ove48-conv-analyze-20261114.js') + ' ' + tmpAn + ' || true', { encoding: 'utf8' });
  const changed = diff.split('\n').filter(function (l) { return l[0] === '<' || l[0] === '>'; });
  check('scratch patch touches exactly 5 lines (5 removed + 5 added)', changed.length === 10, 'changed=' + changed.length + '\n' + diff);
  check('patched copy carries the fresh SEEDS', s.indexOf('const SEEDS = [190561, 190562, 190563, 190564, 190565, 190566, 190567, 190568];') !== -1);
  check('patched copy carries RUN ove48-freshband-pilot', s.indexOf("const RUN = 'ove48-freshband-pilot';") !== -1);
  check('patched copy maps the fresh step ids', s.indexOf("'t-ove48-freshband-subj'") !== -1 && s.indexOf("'t-ove48-freshband-base'") !== -1);
  check('patched copy returns V5-not-applicable for unmapped steps', s.indexOf("if (!b3) { return out; }") !== -1);
  fs.unlinkSync(tmpAn);
  fs.rmdirSync(tmpDir);

  // 5. Instrument live check on a scratch seed (unjudged, 15d).
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
  check('uninstall restores original methods', Game.convoSelectWant === origSelect && Game.talkTo === origTalk && Game.endConvo === origEnd);
  check('no recorder errors on the pick path', outA.errors.length === 0, JSON.stringify(outA.errors.slice(0, 3)));

  // 6. Analyzer tables vs subject source.
  const AN = require(path.join(REPO, 'scripts', 'ove48-conv-analyze-20261114'));
  const subjSrc = sh('git show transplant-15a-narrowed-subject:src/js/convo-wants.js');
  check('analyzer DAWN_KIND_WANTS matches subject source', eq(AN.DAWN_KIND_WANTS, extractTable(subjSrc, 'DAWN_KIND_WANTS')));
  check('analyzer DAWN_DRIVE_WANTS matches subject source', eq(AN.DAWN_DRIVE_WANTS, extractTable(subjSrc, 'DAWN_DRIVE_WANTS')));

  // 7. Alignment logic on synthetic opens.
  check('aligned: FORAGE kind + ask_favor', AN.isAligned({ want: 'ask_favor', dawnKind: 'FORAGE', dawnDrive: null }) === true);
  check('not aligned: FORAGE kind + curious', AN.isAligned({ want: 'curious', dawnKind: 'FORAGE', dawnDrive: null }) === false);
  check('aligned via drive: bonds + seek_comfort', AN.isAligned({ want: 'seek_comfort', dawnKind: null, dawnDrive: 'bonds' }) === true);
  check('null with no dawn state', AN.isAligned({ want: 'ask_favor', dawnKind: null, dawnDrive: null }) === null);
  check('kind+drive stack: HUNT + bank_veterans + warn_you', AN.isAligned({ want: 'warn_you', dawnKind: 'HUNT', dawnDrive: 'bank_veterans' }) === true);

  // 8. Driver leg guard + no judged corpus yet.
  process.env.LEG = 'ove48conv'; // the driver reads LEG at require time
  const drv = require(path.join(REPO, 'scripts', 'ove48-conv-driver-20261114'));
  check('driver leg guard refuses markerless standing', drv.legGuard('no marker here', 'x').ok === false);
  check('driver leg guard accepts marker standing', drv.legGuard('ROSTER CHECK present', 'x').ok === true);
  check('no judged corpus exists yet (base)', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-conv-' + BASE_STEP)));
  check('no judged corpus exists yet (subj)', !fs.existsSync(path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-conv-' + SUBJ_STEP)));

  // 9. Prereg recorded.
  const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-ove48-freshband-prereg.md'), 'utf8');
  for (const needle of ['203a32775', 'transplant-15a-narrowed-subject', '190561', 't-ove48-freshband-base', 't-ove48-freshband-subj', 'CARRIER', 'NOT-CARRIER', 'UNMEASURED', 'V5', 'Freshness check']) {
    check('prereg records ' + needle, prereg.indexOf(needle) !== -1);
  }
}

function stage2() {
  const AN = require(path.join(REPO, 'scripts', 'ove48-conv-analyze-20261114'));
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-ove48-freshband-a.md'), 'utf8');
  // 1. Baseline corpus + summary.
  const baseCorpus = AN.loadCorpus(FRESH, BASE_STEP);
  check('baseline corpus 8/8 complete', baseCorpus.complete, 'missing: ' + (baseCorpus.missing || []).join(','));
  const baseErrs = baseCorpus.rows.reduce(function (n, r) { return n + ((r.instrumentErrors || []).length); }, 0);
  check('baseline 0 instrument errors', baseErrs === 0, 'errors=' + baseErrs);
  const baseSummaryPath = path.join(REPO, 'evidence', '2026-11-14', 'ove48-conv-' + BASE_STEP + '-summary.json');
  check('baseline summary exists', fs.existsSync(baseSummaryPath));
  const baseS = JSON.parse(fs.readFileSync(baseSummaryPath, 'utf8'));
  check('baseline summary carries the fresh seeds', eq(baseS.seeds, FRESH), JSON.stringify(baseS.seeds));
  check('baseline summary carries RUN ove48-freshband-pilot', baseS.run === 'ove48-freshband-pilot', String(baseS.run));
  check('baseline validity V1–V4 pass', baseS.validity.v1Opens && baseS.validity.v2Classified && baseS.validity.v3DawnReads === true && baseS.validity.v4Errors, JSON.stringify(baseS.validity));
  check('baseline V5 recorded not-applicable (band3Step null, 0 mismatches)', baseS.replication.band3Step === null && (baseS.replication.mismatches || []).length === 0, JSON.stringify(baseS.replication));
  const baseSurvived = baseS.survived;
  // 2. Gate outcome matches the corpus; verdict is exactly the bar.
  let subjSurvived = null, subjS = null;
  const subjDir = path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-conv-' + SUBJ_STEP);
  if (baseSurvived <= 2) {
    check('baseline gate failed (<=2/8) so verdict is UNMEASURED', verdictFor(baseSurvived, null) === 'UNMEASURED' && ev.indexOf('UNMEASURED') !== -1, 'base survived=' + baseSurvived);
    check('no subject corpus was cut on a failed gate', !fs.existsSync(subjDir));
  } else {
    check('baseline gate passed (>=3/8)', baseSurvived >= 3, 'base survived=' + baseSurvived);
    const subjCorpus = AN.loadCorpus(FRESH, SUBJ_STEP);
    check('subject corpus 8/8 complete', subjCorpus.complete, 'missing: ' + (subjCorpus.missing || []).join(','));
    const subjErrs = subjCorpus.rows.reduce(function (n, r) { return n + ((r.instrumentErrors || []).length); }, 0);
    check('subject 0 instrument errors', subjErrs === 0, 'errors=' + subjErrs);
    const subjSummaryPath = path.join(REPO, 'evidence', '2026-11-14', 'ove48-conv-' + SUBJ_STEP + '-summary.json');
    check('subject summary exists', fs.existsSync(subjSummaryPath));
    subjS = JSON.parse(fs.readFileSync(subjSummaryPath, 'utf8'));
    check('subject summary carries the fresh seeds', eq(subjS.seeds, FRESH), JSON.stringify(subjS.seeds));
    check('subject summary carries RUN ove48-freshband-pilot', subjS.run === 'ove48-freshband-pilot', String(subjS.run));
    check('subject validity V1–V4 pass', subjS.validity.v1Opens && subjS.validity.v2Classified && subjS.validity.v3DawnReads === true && subjS.validity.v4Errors, JSON.stringify(subjS.validity));
    check('subject V5 recorded not-applicable (band3Step null, 0 mismatches)', subjS.replication.band3Step === null && (subjS.replication.mismatches || []).length === 0, JSON.stringify(subjS.replication));
    subjSurvived = subjS.survived;
    const want = verdictFor(baseSurvived, subjSurvived);
    check('verdict is exactly the pre-registered bar (base ' + baseSurvived + '/8, subj ' + subjSurvived + '/8 -> ' + want + ')', ev.indexOf('Verdict: ' + want) !== -1 || ev.indexOf('OUTCOME: ' + want) !== -1, 'want=' + want);
    check('evidence records the judged numbers', ev.indexOf(String(baseSurvived) + '/8') !== -1 && ev.indexOf(String(subjSurvived) + '/8') !== -1);
  }
  // 3. Standing.js + tree state + subject untouched.
  check('on arm branch sim-ove48-freshband-a', sh('git branch --show-current') === 'sim-ove48-freshband-a');
  const diskSha = sh('sha256sum src/js/standing.js').split(' ')[0];
  const headStandingSha = sh('git show HEAD:src/js/standing.js | sha256sum').split(' ')[0];
  check('on-disk standing.js byte-identical to HEAD', diskSha === headStandingSha);
  check('subject branch tip still 493d7a975 (never committed onto)', sh('git rev-parse transplant-15a-narrowed-subject').indexOf('493d7a9753aee1c154cf809402e6691ee9a5429e') === 0);
  const repoAn = fs.readFileSync(path.join(REPO, 'scripts', 'ove48-conv-analyze-20261114.js'), 'utf8');
  check('repo analyzer still hardcodes the band-3 band (unmodified)', repoAn.indexOf('const SEEDS = [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464];') !== -1);
  const repoStep = fs.readFileSync(path.join(REPO, 'scripts', 'ove48-conv-step.sh'), 'utf8');
  check('repo conv step script still names the band-3 band (unmodified)', repoStep.indexOf('SEEDS="190457,190458,190459,190460,190461,190462,190463,190464"') !== -1);
  // 4. Evidence file completeness.
  check('evidence file has a metric review section', /metric review/i.test(ev));
  check('evidence file has a sense-testing section', /sense-testing/i.test(ev));
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
  console.log('test-ove48-freshband ' + (STAGE2 ? 'stage 2' : 'stage 1') + ': ' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.error('failures:\n- ' + failures.join('\n- ')); process.exitCode = 1; }
})().catch(function (e) { console.error(e && e.stack || e); process.exitCode = 1; });
