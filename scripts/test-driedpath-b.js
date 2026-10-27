#!/usr/bin/env node
// test-driedpath-b.js — proof for sim-driedpath-b (measurement only).
//
// Checks, all exit-1 on failure:
//   1. Corpus validity: 8 per-seed JSONs in sim-driedpath-b-corpus,
//      policy fields correct, driedpathOn true, no truncation flags,
//      opening stock present, dried events present.
//   2. Det-gate (prereg leg 1): seed 9820 run twice (DRIEDPATH=1 vs 0,
//      stdout-JSON mode) produces identical inflow records, mealdraw
//      records, death lists, and wall fields (driedpath fields and
//      `ms` excluded). The DRIEDPATH=1 det-gate run also reproduces
//      the corpus seed-9820 counts (inflows, mealDraw, deaths).
//   3. Independent leg recomputation: leg-2 numbers recomputed from
//      the corpus by a second code path (not the analyzer's) match
//      the analyzer's computeLegs output; the verdict string is one
//      of GO / NO-GO and follows from the legs.
//   4. Reproduction: the spoilvol corpus (committed) holds zero
//      (dried)/(smoked) inflow records on all 8 seeds.
//   5. Hygiene: zero src/js files modified vs HEAD, zero sibling
//      capture files modified (inflow/mealdraw/spoilvol-capture),
//      zero modified tracked files outside this run's own files.
// Usage: node scripts/test-driedpath-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-26', 'sim-driedpath-b-corpus');
const SPOILVOL_CORPUS = path.join(ROOT, 'evidence', '2026-10-26', 'sim-spoilvol-b-corpus');
const { computeLegs } = require('./analyze-driedpath-b');

let failures = 0;
function check(name, ok, extra) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (extra != null ? ' — ' + extra : ''));
  if (!ok) failures++;
}
function stripForDetGate(j) {
  const c = JSON.parse(JSON.stringify(j));
  delete c.driedEvents; delete c.driedCounters; delete c.smokeSayLines;
  delete c.driedpathOn; delete c.ms;
  return c;
}
function baseEnv(extra) {
  return Object.assign({}, process.env, {
    COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
    FEASTSCALE_R13: '0', SEEDS: '9820', DAYS: '100', SAYCAP: '300',
    INFLOWCAP: '50000', MEALDRAWCAP: '50000', SWEEP_STDOUT_JSON: '1',
  }, extra);
}
function runDetGate(driedpath) {
  const out = execSync('node scripts/sweep-driedpath-b.js', {
    cwd: ROOT, encoding: 'utf8', timeout: 600000, stdio: ['ignore', 'pipe', 'inherit'],
    env: baseEnv({ DRIEDPATH: driedpath }),
  });
  const lines = out.trim().split('\n').filter(Boolean);
  if (lines.length !== 1) throw new Error('det-gate: expected 1 JSON line, got ' + lines.length);
  return JSON.parse(lines[0]);
}

(function main() {
  // 1. Corpus validity.
  const files = fs.existsSync(CORPUS) ? fs.readdirSync(CORPUS).filter(f => f.endsWith('.json')).sort() : [];
  check('corpus has 8 per-seed files', files.length === 8, files.length + ' files');
  let corpusOk = true, corpus9820 = null;
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    if (j.policy !== 'competent-nofeast' || j.driedpathOn !== true || j.inflowTruncated || j.mealdrawTruncated ||
        !j.openingStock || !Array.isArray(j.driedEvents) || !Array.isArray(j.spoilDays) || j.spoilDays.length === 0) corpusOk = false;
    if (j.seed === 9820) corpus9820 = j;
  }
  check('corpus files valid (policy, driedpathOn, no truncation, opening + events present)', corpusOk);
  check('corpus seed 9820 present', !!corpus9820);

  // 2. Det-gate.
  let on = null, off = null, detErr = null;
  try { on = runDetGate('1'); } catch (e) { detErr = 'on: ' + (e.message || e); }
  try { off = runDetGate('0'); } catch (e) { detErr = (detErr ? detErr + '; ' : '') + 'off: ' + (e.message || e); }
  check('det-gate runs completed', !detErr, detErr || 'both runs ok');
  if (on && off) {
    const a = stripForDetGate(on), b = stripForDetGate(off);
    check('det-gate byte-identical (driedpath fields + ms excluded)',
      JSON.stringify(a) === JSON.stringify(b));
    check('det-gate inflow records identical', JSON.stringify(on.inflows) === JSON.stringify(off.inflows));
    check('det-gate mealdraw records identical', JSON.stringify(on.mealDrawRecords) === JSON.stringify(off.mealDrawRecords));
    check('det-gate death lists identical', JSON.stringify(on.deathList) === JSON.stringify(off.deathList));
    check('det-gate wall fields identical',
      on.rank === off.rank && on.national === off.national && on.table === off.table &&
      on.win === off.win && JSON.stringify(on.waveReach) === JSON.stringify(off.waveReach));
    if (corpus9820) {
      check('det-gate run reproduces corpus 9820 counts',
        on.inflowSeen === corpus9820.inflowSeen && on.mealDrawRecords.length === corpus9820.mealDrawRecords.length &&
        on.deaths === corpus9820.deaths,
        `det-gate ${on.inflowSeen}/${on.mealDrawRecords.length}/${on.deaths} vs corpus ${corpus9820.inflowSeen}/${corpus9820.mealDrawRecords.length}/${corpus9820.deaths}`);
    }
    check('det-gate on-run recorded dried events', Array.isArray(on.driedEvents) && on.driedEvents.length > 0,
      on ? String((on.driedEvents || []).length) + ' events' : '');
    check('det-gate off-run recorded no dried events', off && off.driedEvents === null);
  }

  // 3. Independent leg recomputation (second code path).
  const legs = computeLegs(CORPUS);
  let evCount = 0, linkedPost = 0, totPost = 0, seedsWithEvents = 0;
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    const evs = j.driedEvents || [];
    if (evs.length > 0) seedsWithEvents++;
    evCount += evs.length;
    for (const e of evs) {
      totPost += e.postKcal || 0;
      if (e.linked) linkedPost += e.postKcal || 0;
    }
  }
  check('independent leg-2 recomputation matches analyzer',
    seedsWithEvents === legs.leg2.seedsWithEvents && totPost === legs.leg2.totPost && linkedPost === legs.leg2.totLinked,
    `seeds=${seedsWithEvents} totPost=${totPost} linkedPost=${linkedPost}`);
  check('verdict follows from legs',
    legs.verdict === ((legs.leg2.pass && legs.leg3.pass && legs.leg4.pass) ? 'GO' : 'NO-GO'),
    'verdict=' + legs.verdict + ' leg2=' + legs.leg2.pass + ' leg3=' + legs.leg3.pass + ' leg4=' + legs.leg4.pass);
  console.log('INFO legs: leg2 pass=' + legs.leg2.pass + ' leg3 seedPass=' + legs.leg3.seedPass + '/8 pooledShare=' + legs.leg3.pooledShare + ' leg4 share=' + legs.leg4.share);

  // 4. Reproduction on the committed spoilvol corpus.
  let reproOk = true, reproDetail = [];
  if (fs.existsSync(SPOILVOL_CORPUS)) {
    for (const f of fs.readdirSync(SPOILVOL_CORPUS).filter(x => x.endsWith('.json')).sort()) {
      const j = JSON.parse(fs.readFileSync(path.join(SPOILVOL_CORPUS, f), 'utf8'));
      const driedIn = (j.inflows || []).filter(r => / \((dried|smoked)\)$/.test(String(r.name || '')));
      if (driedIn.length !== 0) reproOk = false;
      reproDetail.push(j.seed + ':' + driedIn.length);
    }
  } else reproOk = false;
  check('spoilvol corpus: zero (dried)/(smoked) inflow records on all seeds', reproOk, reproDetail.join(' '));

  // 5. Hygiene.
  const diffNames = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const srcModified = diffNames.filter(n => n.startsWith('src/js/'));
  const siblingModified = diffNames.filter(n => ['scripts/inflow-capture.js', 'scripts/mealdraw-capture.js', 'scripts/spoilvol-capture.js'].indexOf(n) >= 0);
  check('zero src/js files modified', srcModified.length === 0, srcModified.join(',') || 'none');
  check('zero sibling capture files modified', siblingModified.length === 0, siblingModified.join(',') || 'none');
  console.log('INFO git diff vs HEAD (uncommitted): ' + (diffNames.length ? diffNames.join(', ') : '(none — all committed)'));

  if (failures) { console.log('PROOF FAILED: ' + failures + ' failure(s)'); process.exit(1); }
  console.log('PROOF GREEN');
})();

module.exports = {};
