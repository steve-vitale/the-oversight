#!/usr/bin/env node
// test-raidcapture-b.js — proof for sim-raidcapture-b (measurement only).
//
// Checks, all exit-1 on failure:
//   1. Corpus validity: 3 pilot per-seed JSONs in
//      sim-raidcapture-b-corpus, policy fields correct, raidcaptureOn
//      true, no truncation flags, opening stock + dried + stockdoor +
//      direct present, _removePantryKcal in wrappedPaths, none missing.
//   2. Det-gate (prereg leg (a)(i)): seed 9820 run twice (RAIDCAPTURE=1
//      vs 0, stdout-JSON mode) produces identical payloads excluding
//      directRecords / directCounters / raidcaptureOn / ms; the off-run
//      records no remove-pantry-kcal record. The published-9820
//      headline comparison is reported as INFO, not gated: the
//      published 2026-10-27 pilot headlines are NOT reproducible on
//      current head by the PRE-FOLD instrument either (true-control
//      proof, see the corpus reference file below), so gating on them
//      would fail a neutral fold for a stale baseline. The gated
//      reproduction check is the true-control comparison in (3).
//   3. Closure legs (prereg leg (b), pilot): per pilot seed, the
//      analyzer's driedPass and soupPass are true and the
//      full-ledger consistency flag is true (unfiltered ledger == OLD
//      + folded exactly); the folded records reproduce the TRUE-CONTROL
//      pre-fold probe takes exactly (same seed 9738, same trajectory,
//      pre-fold code — the committed reference file
//      truecontrol-pre-fold-s9738.json, generated 2026-10-27 with the
//      pre-fold captures restored via git checkout HEAD --, run
//      through scripts/sweep-driedhunt-b.js with the pilot env).
//      The old-probe comparison (vs the driedhunt corpus) is printed by
//      the analyzer as INFO: those takes live on the stale published
//      trajectories and cannot match any current-trajectory run.
//   4. Disjointness (prereg leg (c)): _removePantryKcal is absent from
//      the pre-existing instrument's wrappedPaths (frozen stockdoors
//      corpora) and present exactly once in the folded run's
//      wrappedPaths; folded-on vs off differ ONLY in direct fields;
//      no directRecord path outside the known set (old paths plus
//      remove-pantry-kcal).
//   5. Hygiene: zero src/js files modified, zero sibling capture files
//      modified (inflow/mealdraw/spoilvol/driedpath/stockdoor-capture),
//      and no modified tracked file outside this run's own files.
// Usage: node scripts/test-raidcapture-b.js
// Exit 0 = proof GREEN.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { judgeSeed, compareToDriedhunt } = require('./analyze-raidcapture-b');

const ROOT = path.join(__dirname, '..');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-27', 'sim-raidcapture-b-corpus');
const OLD_PILOT = path.join(ROOT, 'evidence', '2026-10-27', 'sim-stockdoors-b-corpus');
const DRIEDHUNT = path.join(ROOT, 'evidence', '2026-10-27', 'sim-driedhunt-b-corpus');
const PILOT_SEEDS = [9738, 9735, 9825];
let failures = 0;
function check(name, ok, extra) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (extra != null ? ' — ' + extra : ''));
  if (!ok) failures++;
}
function stripForDetGate(j) {
  const c = JSON.parse(JSON.stringify(j));
  delete c.directRecords; delete c.directCounters; delete c.raidcaptureOn; delete c.ms;
  return c;
}
function baseEnv(extra) {
  return Object.assign({}, process.env, {
    COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
    SEEDS: '9820', DAYS: '100', SAYCAP: '300',
    INFLOWCAP: '50000', MEALDRAWCAP: '50000', SWEEP_STDOUT_JSON: '1',
  }, extra);
}
function runDetGate(raidcapture) {
  const out = execSync('node scripts/sweep-raidcapture-b.js', {
    cwd: ROOT, encoding: 'utf8', timeout: 900000, maxBuffer: 512 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
    env: baseEnv({ RAIDCAPTURE: raidcapture }),
  });
  const lines = out.trim().split('\n').filter(Boolean);
  if (lines.length !== 1) throw new Error('det-gate: expected 1 JSON line, got ' + lines.length);
  return JSON.parse(lines[0]);
}
const KNOWN_DIRECT = new Set(['npc-adult-pantry', 'npc-child-pantry', 'alien-raid',
  'thief.steal_pantry', 'event-take', 'player-take', 'player-take-bulk', 'remove-pantry-kcal']);

(function main() {
  // 1. Corpus validity.
  const allFiles = fs.existsSync(CORPUS) ? fs.readdirSync(CORPUS).filter(f => f.startsWith('raidcapture-b-') && f.endsWith('.json')).sort() : [];
  const files = allFiles.filter(f => PILOT_SEEDS.some(s => f === `raidcapture-b-competent-nofeast-s${s}.json`));
  check('corpus has 3 pilot per-seed files', files.length === 3, files.length + ' files');
  check('corpus has 10 raidcapture files (pilot 9738/9735 + confirm 9820-9827, 9825 shared)', allFiles.length === 10, allFiles.length + ' raidcapture files');
  check('true-control pre-fold reference file present', fs.existsSync(path.join(CORPUS, 'truecontrol-pre-fold-s9738.json')));
  let corpusOk = true, wrappedOk = true;
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    if (j.policy !== 'competent-nofeast' || j.raidcaptureOn !== true || j.inflowTruncated || j.mealdrawTruncated ||
        !j.openingStock || !Array.isArray(j.driedEvents) || !Array.isArray(j.stockdoorRecords) ||
        !Array.isArray(j.directRecords) || !Array.isArray(j.spoilDays) || j.spoilDays.length === 0) corpusOk = false;
    const w = (j.directCounters || {}).wrappedPaths || [];
    const m = (j.directCounters || {}).missingPaths || [];
    if (m.length !== 0 || w.indexOf('_removePantryKcal') < 0) wrappedOk = false;
    if (PILOT_SEEDS.indexOf(j.seed) < 0) corpusOk = false;
  }
  check('corpus files valid (policy, raidcaptureOn, no truncation, opening + dried + stockdoor + direct present, pilot seeds)', corpusOk);
  check('_removePantryKcal wrapped, none missing, on every pilot seed', wrappedOk);

  // 2. Det-gate.
  let on = null, off = null, detErr = null;
  try { on = runDetGate('1'); } catch (e) { detErr = 'on: ' + (e.message || e); }
  try { off = runDetGate('0'); } catch (e) { detErr = (detErr ? detErr + '; ' : '') + 'off: ' + (e.message || e); }
  check('det-gate runs completed', !detErr, detErr || 'both runs ok');
  if (on && off) {
    const identical = JSON.stringify(stripForDetGate(on)) === JSON.stringify(stripForDetGate(off));
    check('det-gate byte-identical excluding direct fields + ms', identical);
    check('det-gate off-run records no remove-pantry-kcal record',
      !(off.directRecords || []).some(r => r.path === 'remove-pantry-kcal'));
    check('det-gate on-run records remove-pantry-kcal in wrappedPaths',
      ((on.directCounters || {}).wrappedPaths || []).indexOf('_removePantryKcal') >= 0);
    const old9820 = JSON.parse(fs.readFileSync(path.join(OLD_PILOT, 'stockdoors-b-competent-nofeast-s9820.json'), 'utf8'));
    const onRemove = (on.directRecords || []).filter(r => r.path === 'remove-pantry-kcal').length;
    const pubMatch = on.inflowSeen === old9820.inflowSeen && on.mealDrawRecords.length === old9820.mealDrawRecords.length &&
      on.deaths === old9820.deaths && (on.driedEvents || []).length === (old9820.driedEvents || []).length &&
      (on.stockdoorRecords || []).length === (old9820.stockdoorRecords || []).length &&
      (on.directRecords || []).length - onRemove === (old9820.directRecords || []).length &&
      (on.finalPantry || {}).freshKcal === (old9820.finalPantry || {}).freshKcal;
    console.log('INFO published-9820 headline reproduction (NOT gated — stale baseline, see header): ' + (pubMatch ? 'MATCH' : 'MISMATCH') +
      ` — on ${on.inflowSeen}/${on.mealDrawRecords.length}/${on.deaths}/${(on.driedEvents || []).length}/${(on.stockdoorRecords || []).length}/${(on.directRecords || []).length - onRemove}/${(on.finalPantry || {}).freshKcal} vs published ${old9820.inflowSeen}/${old9820.mealDrawRecords.length}/${old9820.deaths}/${(old9820.driedEvents || []).length}/${(old9820.stockdoorRecords || []).length}/${(old9820.directRecords || []).length}/${(old9820.finalPantry || {}).freshKcal} (remove=${onRemove})`);
  }

  // 3. Closure legs + probe reproduction.
  for (const seed of PILOT_SEEDS) {
    const f = path.join(CORPUS, `raidcapture-b-competent-nofeast-s${seed}.json`);
    check(`pilot corpus file exists seed ${seed}`, fs.existsSync(f));
    if (!fs.existsSync(f)) continue;
    const ps = JSON.parse(fs.readFileSync(f, 'utf8'));
    const j = judgeSeed(ps);
    check(`seed ${seed} dried leg: old=${j.oldDried} folded=${j.foldedDried} new=${j.newDried} pass`,
      j.driedPass === true, 'pass=' + j.driedPass);
    check(`seed ${seed} soup leg: old=${j.oldSoup} folded=${j.foldedSoup} new=${j.newSoup} pass`,
      j.soupPass === true, 'pass=' + j.soupPass);
    check(`seed ${seed} full-ledger consistency (unfiltered == OLD + folded)`, j.consistent === true);
    const c = compareToDriedhunt(ps, DRIEDHUNT);
    console.log('INFO vs stale driedhunt probe (NOT gated — trajectories moved): present=' + c.present +
      ' oldTakes=' + c.oldTakes + ' folded=' + c.folded + ' identical=' + c.identical);
    if (seed === 9738) {
      const tc = JSON.parse(fs.readFileSync(path.join(CORPUS, 'truecontrol-pre-fold-s9738.json'), 'utf8'));
      const key = (t) => [t.day, t.caller, t.asked, t.ret,
        (t.items || []).map(i => `${i.name}x${i.units}`).sort().join(',')].join('|');
      const a = (tc.driedhuntTakes || []).map(key).sort();
      const b = (ps.directRecords || []).filter(r => r.path === 'remove-pantry-kcal')
        .map(r => key({ day: r.day, caller: r.caller, asked: r.asked, ret: r.retTaken, items: r.items })).sort();
      check('seed 9738 folded records reproduce TRUE-CONTROL pre-fold probe takes exactly',
        JSON.stringify(a) === JSON.stringify(b),
        `probe=${a.length} folded=${b.length} identical=${JSON.stringify(a) === JSON.stringify(b)}`);
    }
  }

  // 4. Disjointness.
  let oldWrappedHasRemove = false, badPaths = [];
  for (const dir of [OLD_PILOT]) {
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json'))) {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (((j.directCounters || {}).wrappedPaths || []).indexOf('_removePantryKcal') >= 0) oldWrappedHasRemove = true;
    }
  }
  check('pre-existing instrument never wrapped _removePantryKcal (frozen stockdoors corpora)', !oldWrappedHasRemove);
  for (const f of allFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    for (const r of (j.directRecords || [])) {
      if (!KNOWN_DIRECT.has(r.path) && !/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/.test(r.path)) badPaths.push(r.path);
    }
    const w = (j.directCounters || {}).wrappedPaths || [];
    if (w.filter(x => x === '_removePantryKcal').length !== 1) badPaths.push('REMOVE-COUNT:' + j.seed);
  }
  check('no unknown direct path; _removePantryKcal wrapped exactly once per seed', badPaths.length === 0, badPaths.join(',') || 'none');

  // 5. Hygiene.
  const st = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
  const lines = st.split('\n').filter(Boolean);
  const allowed = new Set(['scripts/sweep-raidcapture-b.js', 'scripts/analyze-raidcapture-b.js',
    'scripts/test-raidcapture-b.js', 'scripts/stockdoors-capture.js', 'scripts/driedhunt-capture.js',
    'evidence/2026-10-27/sim-raidcapture-b-prereg.md', 'evidence/2026-10-27/sim-raidcapture-b.md']);
  const bad = lines.filter(l => {
    const f = l.slice(3);
    if (f.startsWith('src/js/')) return true;
    if (/^scripts\/(inflow|mealdraw|spoilvol|driedpath|stockdoor-capture)-/.test(f)) return true;
    if (f.startsWith('evidence/2026-10-27/sim-raidcapture-b-corpus/')) return false;
    if (allowed.has(f)) return false;
    // Any other tracked modification is outside this run's files.
    return l[0] !== '?';
  });
  check('hygiene: no src/js or sibling capture modifications, no outside tracked modifications', bad.length === 0, JSON.stringify(bad));
  console.log('git status lines: ' + JSON.stringify(lines));

  if (failures) { console.log('PROOF FAILED: ' + failures + ' failure(s)'); process.exit(1); }
  console.log('PROOF GREEN');
})();
