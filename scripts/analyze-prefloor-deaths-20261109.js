// analyze-prefloor-deaths-20261109.js — the PRE-FLOOR DEATHS classifier + corpus checker
// (arm sim-prefloor-deaths-b, run fleshout-loop-b-20261109T1230Z). DIAG, zero src/js.
// Implements EXACTLY the cause-class registry pre-registered in
// evidence/2026-11-09/sim-prefloor-deaths-b-prereg.md — a taxonomy change
// after the sweep is a dated CORRECTION, never a silent re-issue.
// Reuses the sitgap-b corpus checks (scripts/analyze-sitgap-20261108.js —
// READ-ONLY, never edited here): checkCorpusSit (G3) and
// neutralityCompareSit (G2). The sit-classification (classifySit) is NOT
// reused for verdicts — the seat is out of scope; only seat-verb counts
// are read, as contradiction flags.
// Usage:
//   node scripts/analyze-prefloor-deaths-20261109.js <winseek-dir> [doorwalk-dir] [unrec-dir]
// Prints the per-seed pre-90 split, the band split (primary set + the
// pre-90-ending subset), the raw cause census, floor-reach / median /
// wave-4 / wall numbers, contradiction flags, G3 integrity, and (with a
// third dir) the G2 neutrality comparison.
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./analyze-sitgap-20261108');

// ---- The pre-registered cause-class registry (prereg § Cause-class registry) ----
const WILD_CAUSES = { 'the wild': 1, 'monster': 1, 'ambush': 1, 'combat': 1, 'a stranger': 1 };
const SICKNESS_CAUSES = { 'sickness': 1, 'wound_fever': 1, "a wound that wouldn't close": 1 };
const CLASSES = ['wild', 'arena', 'starvation', 'sickness-disease', 'other'];

// classifyCause(entry): exactly one class per fallen entry. The monsterName
// rule comes FIRST: a signature-monster-named cause ('Ad Break', 'The
// Eulogy', …) carries monsterName/monsterId and is a field monster-fight
// death — wild. 'dehydration' / 'thirst' are NOT merged into starvation
// or sickness: they land in other, named, per the prereg.
function classifyCause(entry) {
  if (!entry || typeof entry !== 'object') return 'other';
  if (entry.monsterName != null || entry.monsterId != null) return 'wild';
  const cause = entry.cause != null ? String(entry.cause) : '';
  if (WILD_CAUSES[cause]) return 'wild';
  if (cause === 'the arena') return 'arena';
  if (cause === 'starvation') return 'starvation';
  if (SICKNESS_CAUSES[cause]) return 'sickness-disease';
  return 'other';
}

function emptySplit() {
  const s = {};
  CLASSES.forEach(function (c) { s[c] = 0; });
  return s;
}

// classifySeed(corpus): the per-seed pre-90 decomposition + flags.
function classifySeed(corpus) {
  const fallen = corpus.fallen || [];
  const pre90 = fallen.filter(function (f) { return f && f.day != null && (f.day | 0) < 90; });
  const dayMissing = fallen.filter(function (f) { return !f || f.day == null; }).length;
  const split = emptySplit();
  const raw = {};
  const rawClasses = {};
  const otherBreakdown = {};
  pre90.forEach(function (f) {
    const cl = classifyCause(f);
    split[cl] += 1;
    const c = f.cause != null ? String(f.cause) : '<missing>';
    raw[c] = (raw[c] || 0) + 1;
    // Record the class of the REAL entry (with its monsterName), not of a
    // bare-cause synthetic: a 'Gavel' entry WITH monsterName set is wild,
    // and the census must print that, not the other a bare lookup gives.
    rawClasses[c] = rawClasses[c] || {};
    rawClasses[c][cl] = (rawClasses[c][cl] || 0) + 1;
    if (cl === 'other') otherBreakdown[c] = (otherBreakdown[c] || 0) + 1;
  });
  const total90 = pre90.length;
  const shares = {};
  CLASSES.forEach(function (c) { shares[c] = total90 ? split[c] / total90 : 0; });
  // Floor reach: alive at the day-90 floor (gameDays >= 90), cross-checked
  // against daily rows reaching day >= 90.
  const rows = corpus.daily || [];
  const maxRowDay = rows.length ? Math.max.apply(null, rows.map(function (r) { return r.day | 0; })) : -1;
  const floorReach = (corpus.gameDays | 0) >= 90;
  const floorReachRows = maxRowDay >= 90;
  // Contradiction flags: ANY seat-verb call contradicts the no-seat-walking
  // configuration (both legs), as does any recorded sit / door walk.
  const sitCalls = (corpus.sitVerbMsgs || []).length +
    (corpus.doorVerbMsgs || []).filter(function (m) { return m && (m.call === 'tableTakeSeat' || m.call === 'tableOfferSeatTaker' || m.call === 'tableChooseSeatTaker' || m.call === 'chooseTableOption'); }).length;
  const seatTaken = ((corpus.takeseatStats || {}).seatTaken | 0);
  const dw = corpus.doorwalkStats || null;
  const doorsEntered = dw ? (dw.doorsEntered | 0) + (dw.answers | 0) + ((dw.walked || []).length | 0) : 0;
  const lastRow = rows.length ? rows[rows.length - 1] : null;
  const caveatFlag = !!(lastRow && corpus.gameDays != null && (corpus.gameDays | 0) > (lastRow.day | 0));
  return {
    seed: corpus.seed, gameDays: corpus.gameDays, endReason: corpus.endReason,
    floorReach: floorReach, floorReachRows: floorReachRows, floorDisagree: floorReach !== floorReachRows,
    fallenTotal: fallen.length, pre90Total: total90, dayMissing: dayMissing,
    split: split, shares: shares, raw: raw, rawClasses: rawClasses, otherBreakdown: otherBreakdown,
    sitCalls: sitCalls, seatTaken: seatTaken, doorsEntered: doorsEntered,
    contradiction: sitCalls > 0 || seatTaken > 0 || doorsEntered > 0,
    caveatFlag: caveatFlag,
    caveatDetail: caveatFlag ? 'last daily row d' + lastRow.day + ' but gameDays ' + corpus.gameDays : null,
    standing: corpus.standing, maxWave: corpus.maxWave, scaleRank: corpus.scaleRank, won: !!corpus.won,
  };
}

// aggregateSeedClassifications(list): band split over the primary set (all
// pre-90 deaths) + the pre-90-ending subset + the raw census.
function aggregateSeedClassifications(list) {
  const primary = emptySplit();
  const subset = emptySplit();
  const raw = {};
  const rawClasses = {};
  const otherBreakdown = {};
  let primaryN = 0, subsetN = 0, dayMissing = 0;
  list.forEach(function (cl) {
    CLASSES.forEach(function (c) { primary[c] += cl.split[c]; });
    primaryN += cl.pre90Total;
    dayMissing += cl.dayMissing;
    Object.keys(cl.raw).forEach(function (c) {
      raw[c] = (raw[c] || 0) + cl.raw[c];
    });
    Object.keys(cl.rawClasses || {}).forEach(function (c) {
      rawClasses[c] = rawClasses[c] || {};
      Object.keys(cl.rawClasses[c]).forEach(function (k) {
        rawClasses[c][k] = (rawClasses[c][k] || 0) + cl.rawClasses[c][k];
      });
    });
    Object.keys(cl.otherBreakdown).forEach(function (c) {
      otherBreakdown[c] = (otherBreakdown[c] || 0) + cl.otherBreakdown[c];
    });
    if ((cl.gameDays | 0) < 90) {
      CLASSES.forEach(function (c) { subset[c] += cl.split[c]; });
      subsetN += cl.pre90Total;
    }
  });
  function shares(split, n) {
    const s = {};
    CLASSES.forEach(function (c) { s[c] = n ? split[c] / n : 0; });
    return s;
  }
  function dominant(split, n) {
    let best = null, bestShare = 0;
    CLASSES.forEach(function (c) {
      const sh = n ? split[c] / n : 0;
      if (sh > bestShare) { best = c; bestShare = sh; }
    });
    return { cls: best, share: bestShare, meets50: bestShare >= 0.5 };
  }
  return {
    primary: primary, primaryN: primaryN, primaryShares: shares(primary, primaryN),
    primaryDominant: dominant(primary, primaryN),
    subset: subset, subsetN: subsetN, subsetShares: shares(subset, subsetN),
    subsetDominant: dominant(subset, subsetN),
    raw: raw, rawClasses: rawClasses, otherBreakdown: otherBreakdown, dayMissing: dayMissing,
  };
}

function loadDir(dir) {
  const out = {};
  fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[c.seed] = c;
  });
  return out;
}

function trueMedian(nums) {
  const s = nums.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function printSplit(label, split, n, shares) {
  console.log(label + ' (n=' + n + '): ' + CLASSES.map(function (c) {
    return c + ' ' + split[c] + ' (' + (100 * shares[c]).toFixed(1) + '%)';
  }).join(', '));
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/analyze-prefloor-deaths-20261109.js <winseek-dir> [doorwalk-dir] [unrec-dir]'); process.exit(2); }
  const corpora = loadDir(dir);
  const seeds = Object.keys(corpora).sort(function (a, b) { return (a | 0) - (b | 0); });
  const classified = seeds.map(function (s) { return classifySeed(corpora[s]); });
  console.log('seed | gameDays | end | floor? | fallen | pre90 | wild | arena | starv | sick | other | sitCalls');
  classified.forEach(function (cl) {
    console.log(cl.seed + ' | ' + cl.gameDays + ' | ' + cl.endReason + ' | ' + (cl.floorReach ? 'YES' : 'no') + ' | ' + cl.fallenTotal + ' | ' + cl.pre90Total +
      ' | ' + cl.split.wild + ' | ' + cl.split.arena + ' | ' + cl.split.starvation + ' | ' + cl.split['sickness-disease'] + ' | ' + cl.split.other + ' | ' + cl.sitCalls +
      (cl.contradiction ? ' CONTRADICTION' : '') + (cl.caveatFlag ? ' CAVEAT' : '') + (cl.floorDisagree ? ' FLOOR-DISAGREE' : ''));
  });
  const agg = aggregateSeedClassifications(classified);
  console.log('\nBAND SPLIT — primary set (all pre-90 deaths, winseek leg):');
  printSplit('primary', agg.primary, agg.primaryN, agg.primaryShares);
  console.log('dominant: ' + agg.primaryDominant.cls + ' ' + (100 * agg.primaryDominant.share).toFixed(1) + '% — ' + (agg.primaryDominant.meets50 ? 'MEETS the 50% bar' : 'below the 50% bar'));
  console.log('\nBAND SPLIT — subset (deaths in villages ending before day 90):');
  printSplit('subset', agg.subset, agg.subsetN, agg.subsetShares);
  console.log('dominant: ' + agg.subsetDominant.cls + ' ' + (100 * agg.subsetDominant.share).toFixed(1) + '% — ' + (agg.subsetDominant.meets50 ? 'MEETS the 50% bar' : 'below the 50% bar'));
  console.log('\nRAW CAUSE CENSUS (pre-90 deaths, all causes, nothing hidden):');
  Object.keys(agg.raw).sort(function (a, b) { return agg.raw[b] - agg.raw[a]; }).forEach(function (c) {
    const classes = Object.keys(agg.rawClasses[c] || {}).map(function (k) { return k + ' ' + agg.rawClasses[c][k]; }).join(', ');
    console.log('  ' + agg.raw[c] + '  ' + JSON.stringify(c) + '  -> ' + classes);
  });
  console.log('\nOTHER-CLASS BREAKDOWN (named):');
  const ob = agg.otherBreakdown;
  if (Object.keys(ob).length) Object.keys(ob).sort(function (a, b) { return ob[b] - ob[a]; }).forEach(function (c) { console.log('  ' + ob[c] + '  ' + JSON.stringify(c)); });
  else console.log('  (empty — no pre-90 death fell in other)');
  console.log('\nFallen entries with missing day (data quality, expected 0): ' + agg.dayMissing);
  console.log('\nWall numbers (winseek leg):');
  const floorN = classified.filter(function (c) { return c.floorReach; }).length;
  const national = classified.filter(function (c) { return c.scaleRank === 'national' || c.scaleRank === 'global'; }).length;
  const sits = classified.filter(function (c) { return c.seatTaken > 0; }).length;
  const wins = classified.filter(function (c) { return c.won; }).length;
  const w4u = classified.filter(function (c) { return (c.maxWave | 0) >= 4; }).length;
  const w5u = classified.filter(function (c) { return (c.maxWave | 0) >= 5; }).length;
  const surv = classified.map(function (c) { return c.gameDays; }).sort(function (a, b) { return a - b; });
  console.log('floor-reach ' + floorN + '/' + classified.length + ', national ' + national + '/' + classified.length + ', table sits ' + sits + '/' + classified.length + ', wins ' + wins + '/' + classified.length);
  console.log('wave-4 unlocks ' + w4u + '/' + classified.length + ', wave-5 unlocks ' + w5u + '/' + classified.length);
  console.log('true median survival ' + trueMedian(classified.map(function (c) { return c.gameDays; })) + 'd (sorted ' + surv.join(', ') + ')');
  console.log('sit-verb calls across the band: ' + classified.reduce(function (n, c) { return n + c.sitCalls; }, 0) + ' (expected 0 — no seat-walking on either leg)');
  const dwDir = process.argv[3];
  if (dwDir) {
    const dwCorpora = loadDir(dwDir);
    const dwSeeds = Object.keys(dwCorpora).sort(function (a, b) { return (a | 0) - (b | 0); });
    const dwClassified = dwSeeds.map(function (s) { return classifySeed(dwCorpora[s]); });
    const dwAgg = aggregateSeedClassifications(dwClassified);
    console.log('\n--- DOORWALK BASELINE LEG (gates OFF) ---');
    console.log('seed | gameDays | end | floor? | fallen | pre90 | wild | arena | starv | sick | other | sitCalls');
    dwClassified.forEach(function (cl) {
      console.log(cl.seed + ' | ' + cl.gameDays + ' | ' + cl.endReason + ' | ' + (cl.floorReach ? 'YES' : 'no') + ' | ' + cl.fallenTotal + ' | ' + cl.pre90Total +
        ' | ' + cl.split.wild + ' | ' + cl.split.arena + ' | ' + cl.split.starvation + ' | ' + cl.split['sickness-disease'] + ' | ' + cl.split.other + ' | ' + cl.sitCalls +
        (cl.contradiction ? ' CONTRADICTION' : ''));
    });
    console.log('\nDOORWALK BAND SPLIT — primary set:');
    printSplit('primary', dwAgg.primary, dwAgg.primaryN, dwAgg.primaryShares);
    console.log('dominant: ' + dwAgg.primaryDominant.cls + ' ' + (100 * dwAgg.primaryDominant.share).toFixed(1) + '% — ' + (dwAgg.primaryDominant.meets50 ? 'MEETS the 50% bar' : 'below the 50% bar'));
    console.log('\nDOORWALK RAW CAUSE CENSUS (pre-90):');
    Object.keys(dwAgg.raw).sort(function (a, b) { return dwAgg.raw[b] - dwAgg.raw[a]; }).forEach(function (c) {
      const classes = Object.keys(dwAgg.rawClasses[c] || {}).map(function (k) { return k + ' ' + dwAgg.rawClasses[c][k]; }).join(', ');
      console.log('  ' + dwAgg.raw[c] + '  ' + JSON.stringify(c) + '  -> ' + classes);
    });
    const dwFloorN = dwClassified.filter(function (c) { return c.floorReach; }).length;
    const dwNational = dwClassified.filter(function (c) { return c.scaleRank === 'national' || c.scaleRank === 'global'; }).length;
    const dwW4 = dwClassified.filter(function (c) { return (c.maxWave | 0) >= 4; }).length;
    const dwW5 = dwClassified.filter(function (c) { return (c.maxWave | 0) >= 5; }).length;
    console.log('\nDOORWALK wall numbers: floor-reach ' + dwFloorN + '/' + dwClassified.length + ', national ' + dwNational + '/' + dwClassified.length +
      ', wins ' + dwClassified.filter(function (c) { return c.won; }).length + '/' + dwClassified.length +
      ', wave-4 ' + dwW4 + '/' + dwClassified.length + ', wave-5 ' + dwW5 + '/' + dwClassified.length +
      ', true median ' + trueMedian(dwClassified.map(function (c) { return c.gameDays; })) + 'd');
    console.log('DOORWALK sit-verb calls across the band: ' + dwClassified.reduce(function (n, c) { return n + c.sitCalls; }, 0) + ' (expected 0)');
  }
  console.log('\nG3 corpus integrity (winseek leg):');
  seeds.forEach(function (s) {
    const ck = A.checkCorpusSit(corpora[s]);
    console.log(s + ': ' + (ck.ok ? 'PASS' : 'FAIL — ' + ck.problems.join('; ')) + (ck.gaps.length ? ' (gaps: ' + ck.gaps.join(', ') + ')' : '') + (ck.livingNotes.length ? ' (living notes: ' + ck.livingNotes.join('; ') + ')' : ''));
  });
  if (dwDir) {
    console.log('\nG3 corpus integrity (doorwalk leg):');
    const dwCorpora = loadDir(dwDir);
    Object.keys(dwCorpora).sort(function (a, b) { return (a | 0) - (b | 0); }).forEach(function (s) {
      const ck = A.checkCorpusSit(dwCorpora[s]);
      console.log(s + ': ' + (ck.ok ? 'PASS' : 'FAIL — ' + ck.problems.join('; ')) + (ck.gaps.length ? ' (gaps: ' + ck.gaps.join(', ') + ')' : '') + (ck.livingNotes.length ? ' (living notes: ' + ck.livingNotes.join('; ') + ')' : ''));
    });
  }
  const unrecDir = process.argv[4];
  if (unrecDir) {
    const unrec = loadDir(unrecDir);
    console.log('\nG2 neutrality (unrecorded vs recorded, winseek leg):');
    Object.keys(unrec).sort().forEach(function (s) {
      if (!corpora[s]) { console.log(s + ': no recorded match'); return; }
      const n = A.neutralityCompareSit(unrec[s], corpora[s]);
      console.log(s + ': ' + (n.ok ? 'PASS' : 'FAIL — ' + n.diffs.join(', ')));
    });
  }
}

module.exports = { classifyCause: classifyCause, classifySeed: classifySeed,
  aggregateSeedClassifications: aggregateSeedClassifications, loadDir: loadDir,
  trueMedian: trueMedian, CLASSES: CLASSES, WILD_CAUSES: WILD_CAUSES, SICKNESS_CAUSES: SICKNESS_CAUSES };
