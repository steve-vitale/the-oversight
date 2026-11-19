// analyze-rageholder-survey-b.js — survey ranker for arm sim-rageholder-survey-b
// (DIAG survey: screen fresh 8-seed bands for a Rage-holder-rich band
// to designate for the laterage re-run; finding #2614).
// For each band dir (8 per-seed corpus files from
// scripts/rageholder-driver-b.js — the laterage recorder verbatim,
// wave-4+ encounters with holdsRage / rageFired / uncapped log) it
// counts, per band:
//   holderFights = v4encounters rows with holdsRage true (the
//     laterage-b definition: a Rage holder reaching a wave-4+ fight;
//     laterage counted 3 in 127, incl. 2 evades with rounds 0 —
//     evades count here too, and the contact subset rounds > 0 is
//     reported beside),
//   rageFights = rows with rageFired true (must be a subset of
//     holderFights; a fired row without holdsRage is a mismatch),
//   holderRate = holderFights / encounters,
// plus per-seed detail rows and the wall numbers (same wallOf as
// analyze-laterage-b.js). Flag/log agreement is checked on every
// rageFired row: the full log must contain a Rage line
// ("eyes go red ... (Rage)"); a fired row with no Rage line, or a
// Rage line on a row whose flag is false, is a mismatch.
// Ranks bands by holderFights desc, holderRate desc, rageFights
// desc, median survival desc.
// GO (frozen in the prereg): the best band has >= 8 holder-fights
// per 8 seeds AND all files parse (8/8 per band), 0 instrument
// errors, 0 flag/log mismatches. The 8 floor is laterage's floor
// carried one step upstream: every Rage fight needs a holder-fight
// first (rageFired ⊆ holdsRage), so a band with < 8 holder-fights
// cannot yield 8 observable Rage fights for the re-run.
// Usage:
//   node scripts/analyze-rageholder-survey-b.js <bandDir1> [bandDir2 ...]
//   node scripts/analyze-rageholder-survey-b.js --selftest
// Writes evidence/2026-11-19/rageholder-survey-b-survey.json. Exits
// 0 iff GO; on NO-GO it still writes the JSON and exits 1.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const GO_HOLDER_FIGHTS = 8;
var RAGE_RE = /eyes go red\. Next 3 strikes hit twice as hard\. \(Rage\)/;

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

var RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function wallOf(files) {
  var days = [], national = 0, standing200 = 0, wave4 = 0, wave5 = 0, wins = 0, lost = 0;
  for (var i = 0; i < files.length; i++) {
    var d = files[i];
    days.push(d.days != null ? d.days : d.gameDays);
    if ((RANK_ORDER[d.scaleRank] || 0) >= 2) national++;
    if ((d.standing | 0) >= 200) standing200++;
    if ((d.maxWave | 0) >= 4) wave4++;
    if ((d.unlockedWave | 0) >= 5) wave5++;
    if (d.won) wins++;
    if (d.villageLost) lost++;
  }
  return { n: files.length, national: national, standing200: standing200, table: null, wins: wins, wave4: wave4, wave5: wave5, medianSurvival: median(days), communityLoss: lost };
}

// Count one band dir. Throws on a corpus that is not a
// rageholder-survey-b corpus (mislabel guard).
function bandOf(dir) {
  const abs = path.isAbsolute(dir) ? dir : path.join(REPO, dir);
  const files = fs.existsSync(abs) ? fs.readdirSync(abs).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  let valid = 0, errors = 0, mismatches = 0;
  const mismatchRows = [];
  const perSeed = [];
  let encounters = 0, holderFights = 0, contactHolderFights = 0, rageFights = 0;
  const holderFightRows = [];
  const parsed = [];
  for (const f of files) {
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(abs, f), 'utf8')); }
    catch (e) { errors++; continue; }
    if (j.mode !== 'rageholder' || j.arm !== 'rageholder-survey-b') throw new Error('CORPUS MISMATCH: ' + f + ' is not a rageholder-survey-b corpus file (mode=' + j.mode + ', arm=' + j.arm + ')');
    if (j.ragePresent !== true) throw new Error('CORPUS MISMATCH: ' + f + ' ragePresent!=' + true + ' — the Rage mechanism is not on this leg');
    if ((j.instrumentErrors || []).length) errors += j.instrumentErrors.length;
    valid++;
    parsed.push(j);
    const enc = j.v4encounters || [];
    let seedEncounters = 0, seedHolders = 0, seedContact = 0, seedFired = 0;
    for (const e of enc) {
      seedEncounters++;
      const log = e.log || [];
      const hasRageLine = log.some(function (ln) { return RAGE_RE.test(ln); });
      if (e.holdsRage) {
        seedHolders++;
        if ((e.rounds | 0) > 0) seedContact++;
        holderFightRows.push({ seed: j.seed, day: e.day, vid: e.vid, mid: e.mid, outcome: e.outcome, rounds: e.rounds | 0, fired: !!e.rageFired, mDealt: e.mDealt | 0 });
      }
      if (e.rageFired) {
        seedFired++;
        if (!e.holdsRage) { mismatches++; mismatchRows.push({ seed: j.seed, day: e.day, mid: e.mid, kind: 'fired_without_hold' }); }
        if (!hasRageLine) { mismatches++; mismatchRows.push({ seed: j.seed, day: e.day, mid: e.mid, kind: 'fired_without_line' }); }
      } else if (hasRageLine) {
        mismatches++; mismatchRows.push({ seed: j.seed, day: e.day, mid: e.mid, kind: 'line_without_flag' });
      }
    }
    encounters += seedEncounters; holderFights += seedHolders;
    contactHolderFights += seedContact; rageFights += seedFired;
    perSeed.push({ seed: j.seed, encounters: seedEncounters, holderFights: seedHolders, contactHolderFights: seedContact, rageFights: seedFired, holderRate: seedEncounters ? seedHolders / seedEncounters : null, days: j.days != null ? j.days : j.gameDays, standing: j.standing, scaleRank: j.scaleRank, maxWave: j.maxWave, unlockedWave: j.unlockedWave, won: !!j.won, villageLost: !!j.villageLost });
  }
  const seeds = perSeed.map(function (r) { return r.seed; }).sort(function (a, b) { return a - b; });
  return {
    dir: path.basename(abs), files: files.length, seeds: seeds,
    encounters: encounters, holderFights: holderFights,
    contactHolderFights: contactHolderFights, rageFights: rageFights,
    holderRate: encounters ? holderFights / encounters : null,
    contactRate: encounters ? contactHolderFights / encounters : null,
    errors: errors, valid: valid, mismatches: mismatches, mismatchRows: mismatchRows,
    perSeed: perSeed, holderFightRows: holderFightRows, wall: wallOf(parsed),
  };
}

function rankBands(bands) {
  return bands.slice().sort(function (a, b) {
    if (b.holderFights !== a.holderFights) return b.holderFights - a.holderFights;
    const ra = a.holderRate || 0, rb = b.holderRate || 0;
    if (rb !== ra) return rb - ra;
    if (b.rageFights !== a.rageFights) return b.rageFights - a.rageFights;
    const ma = (a.wall && a.wall.medianSurvival) || 0, mb = (b.wall && b.wall.medianSurvival) || 0;
    return mb - ma;
  });
}

function main() {
  const dirs = process.argv.slice(2);
  if (!dirs.length) { console.error('RAGEHOLDER-SURVEY ANALYZE STOP: at least one band dir required.'); process.exit(2); }
  const bands = dirs.map(bandOf);
  const ranked = rankBands(bands);
  const best = ranked[0];
  const allFilesOk = bands.every(function (b) { return b.files === 8 && b.valid === 8 && b.errors === 0; });
  const allMatch = bands.every(function (b) { return b.mismatches === 0; });
  const go = !!best && best.holderFights >= GO_HOLDER_FIGHTS && allFilesOk && allMatch;
  const out = {
    arm: 'rageholder-survey-b', run: 'rageholder-survey-b',
    goHolderFights: GO_HOLDER_FIGHTS,
    bands: bands, ranking: ranked.map(function (b) { return b.dir; }),
    best: best ? { dir: best.dir, seeds: best.seeds, holderFights: best.holderFights, contactHolderFights: best.contactHolderFights, rageFights: best.rageFights, holderRate: best.holderRate } : null,
    bars: {
      holderRich: { pass: !!best && best.holderFights >= GO_HOLDER_FIGHTS, bestHolderFights: best ? best.holderFights : null, floorHolderFights: GO_HOLDER_FIGHTS },
      instrument: { pass: allFilesOk, filesByBand: bands.map(function (b) { return { dir: b.dir, files: b.files, valid: b.valid, errors: b.errors }; }) },
      agreement: { pass: allMatch, mismatchesByBand: bands.map(function (b) { return { dir: b.dir, mismatches: b.mismatches }; }) },
    },
    verdict: go ? 'GO' : 'NO-GO',
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-19', 'rageholder-survey-b-survey.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  for (const b of bands) {
    console.log('band ' + b.dir + ' seeds ' + (b.seeds.join(',') || '?') +
      ' encounters=' + b.encounters + ' holderFights=' + b.holderFights +
      ' contact=' + b.contactHolderFights + ' rageFights=' + b.rageFights +
      ' holderRate=' + (b.holderRate == null ? 'null' : b.holderRate.toFixed(3)) +
      ' mismatches=' + b.mismatches + ' errors=' + b.errors +
      ' wall=' + JSON.stringify(b.wall));
  }
  console.log('ranking: ' + ranked.map(function (b) { return b.dir; }).join(' > '));
  console.log('best: ' + (best ? best.dir + ' seeds ' + best.seeds.join('-') + ' holderFights=' + best.holderFights : 'none'));
  console.log('bars: holderRich=' + (out.bars.holderRich.pass ? 'PASS' : 'FAIL') +
    ' instrument=' + (out.bars.instrument.pass ? 'PASS' : 'FAIL') +
    ' agreement=' + (out.bars.agreement.pass ? 'PASS' : 'FAIL'));
  console.log('VERDICT: ' + out.verdict);
  console.log('survey: ' + path.relative(REPO, outFile));
  if (!go) process.exitCode = 1;
}

function check(name, cond, state) {
  state.total++;
  if (cond) { state.passed++; }
  else { state.failed++; console.log('FAIL: ' + name); }
}

function fakeBand(files) {
  // files: [{seed, encounters:[{holdsRage, rageFired, rounds, log[]}]}]
  const dir = fs.mkdtempSync(path.join('/tmp', 'rhs-test-'));
  files.forEach(function (f, i) {
    const j = { seed: f.seed, mode: 'rageholder', arm: 'rageholder-survey-b', ragePresent: true, instrumentErrors: [], days: f.days || 150, gameDays: f.days || 150, standing: f.standing || 100, scaleRank: f.scaleRank || 'village', maxWave: f.maxWave || 4, unlockedWave: f.unlockedWave || 4, won: false, villageLost: false, v4encounters: f.encounters };
    fs.writeFileSync(path.join(dir, 'rageholder-survey-b-s' + f.seed + '-x.json'), JSON.stringify(j));
  });
  return dir;
}

function selftest() {
  var state = { total: 0, passed: 0, failed: 0 };
  const RAGE_LINE = "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)";
  // 1. Laterage shape: 127 encounters, 3 holder-fights (2 evades),
  //    1 fired — counting matches laterage-b's published numbers.
  let dir = fakeBand([{ seed: 106113, encounters: [
    { day: 56, vid: 'v1', mid: 'reunion', outcome: 'evade', rounds: 0, holdsRage: true, rageFired: false, mDealt: 0, log: [] },
    { day: 73, vid: 'v2', mid: 'reunion', outcome: 'evade', rounds: 0, holdsRage: true, rageFired: false, mDealt: 0, log: [] },
    { day: 76, vid: 'v3', mid: 'eater', outcome: 'vFlee', rounds: 2, holdsRage: true, rageFired: true, mDealt: 0, log: [RAGE_LINE] },
  ] }, { seed: 106114, encounters: (function () { const a = []; for (let i = 0; i < 124; i++) a.push({ day: 50 + i, vid: 'v' + i, mid: 'eater', outcome: 'vDie', rounds: 5, holdsRage: false, rageFired: false, mDealt: 10, log: [] }); return a; })() }]);
  let b = bandOf(dir);
  check('laterage shape: 127 enc, 3 holders, 1 fired, 1 contact', b.encounters === 127 && b.holderFights === 3 && b.contactHolderFights === 1 && b.rageFights === 1 && b.mismatches === 0 && b.errors === 0 && Math.abs(b.holderRate - 3 / 127) < 1e-9, state);
  check('laterage shape: holder rows detail 3, evades listed', b.holderFightRows.length === 3 && b.holderFightRows.filter(function (r) { return r.rounds === 0; }).length === 2, state);
  // 2. Fired without hold -> mismatch; fired without line -> mismatch;
  //    line without flag -> mismatch.
  dir = fakeBand([{ seed: 106121, encounters: [
    { day: 10, vid: 'v1', mid: 'eater', outcome: 'vFlee', rounds: 2, holdsRage: false, rageFired: true, mDealt: 0, log: [RAGE_LINE] },
    { day: 11, vid: 'v2', mid: 'eater', outcome: 'vFlee', rounds: 2, holdsRage: true, rageFired: true, mDealt: 0, log: [] },
    { day: 12, vid: 'v3', mid: 'eater', outcome: 'vFlee', rounds: 2, holdsRage: true, rageFired: false, mDealt: 0, log: [RAGE_LINE] },
  ] }]);
  b = bandOf(dir);
  check('three mismatch kinds counted', b.mismatches === 3 && b.mismatchRows.map(function (r) { return r.kind; }).sort().join(',') === 'fired_without_hold,fired_without_line,line_without_flag', state);
  // 3. Ranking: holderFights desc, then rate, then rageFights.
  const b1 = { dir: 'b1', holderFights: 9, holderRate: 9 / 100, rageFights: 2, wall: { medianSurvival: 140 } };
  const b2 = { dir: 'b2', holderFights: 9, holderRate: 9 / 50, rageFights: 1, wall: { medianSurvival: 150 } };
  const b3 = { dir: 'b3', holderFights: 12, holderRate: 12 / 200, rageFights: 0, wall: { medianSurvival: 100 } };
  const ranked = rankBands([b1, b2, b3]);
  check('ranking: most holders first, rate breaks ties', ranked[0].dir === 'b3' && ranked[1].dir === 'b2' && ranked[2].dir === 'b1', state);
  // 4. Wall: national threshold + standing200 + medians.
  dir = fakeBand([
    { seed: 106121, days: 150, standing: 250, scaleRank: 'national', maxWave: 5, unlockedWave: 5, encounters: [] },
    { seed: 106122, days: 100, standing: 199, scaleRank: 'regional', maxWave: 4, unlockedWave: 4, encounters: [] },
  ]);
  b = bandOf(dir);
  check('wall counts', b.wall.national === 1 && b.wall.standing200 === 1 && b.wall.wave4 === 2 && b.wall.wave5 === 1 && b.wall.medianSurvival === 125, state);
  // 5. Mislabel guard: a laterage corpus throws.
  dir = fs.mkdtempSync(path.join('/tmp', 'rhs-test-'));
  fs.writeFileSync(path.join(dir, 'laterage-b-s106111-x.json'), JSON.stringify({ seed: 106111, mode: 'laterage', arm: 'laterage-b', ragePresent: true, instrumentErrors: [], v4encounters: [] }));
  let threw = false;
  try { bandOf(dir); } catch (e) { threw = /CORPUS MISMATCH/.test(e.message); }
  check('laterage corpus refused', threw, state);
  console.log('analyze-rageholder-survey-b --selftest: ' + state.passed + ' passed, ' + state.failed + ' failed');
  if (state.failed) process.exit(1);
}

var args = process.argv.slice(2);
if (args.indexOf('--selftest') !== -1) { selftest(); return; }
if (require.main === module) main();
module.exports = { bandOf: bandOf, rankBands: rankBands, GO_HOLDER_FIGHTS: GO_HOLDER_FIGHTS, RAGE_RE: RAGE_RE };
