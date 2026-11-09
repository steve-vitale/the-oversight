// analyze-sitdrive-winseek-20261109.js — the SIT DRIVE WINSEEK classifier + cost bars
// (arm sim-sitdrive-winseek-b, run fleshout-loop-b-20261109T0630Z). BUILD, zero src/js.
// Reuses the sitgap-b classifier (scripts/analyze-sitgap-20261108.js —
// READ-ONLY, never edited here) unchanged: same five classes, first match
// wins. The additions, all for the ARMED leg (a sit drive runs, so the
// skip diffs are REAL evidence and a sit is the expected outcome):
// - sat mechanism: sit day/kind/doors offered (from takeseatStats +
//   doorVerbMsgs) + table-choice answers after the sit.
// - failed-attempt flag: seatFailed > 0 — the verb was called but the
//   seat was not taken.
// - The DIAG winseek sentence ("no sit drive runs under winseek") must
//   NEVER appear in any armed-leg mechanism; the proof tests for it.
// - Cost bars (sim-scalemetric): starvation census (fallen cause
//   exactly 'starvation') band-wide and on sat seeds, true median
//   survival, median ratio vs a baseline dir.
// - Wall numbers with the TRUE median (the analyzer prints the
//   upper-middle value elsewhere; the evidence reports the true median).
// Usage:
//   node scripts/analyze-sitdrive-winseek-20261109.js <corpus-dir> [baseline-dir] [unrecorded-dir]
// Prints the per-seed classification table, per-seed mechanisms, wall
// numbers, cost bars vs the baseline dir, G3 integrity, and (with a
// third dir) the G2 neutrality comparison.
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./analyze-sitgap-20261108');

const NO_SIT_DRIVE_SENTENCE = 'no sit drive runs under winseek';

// classifySitDrive(corpus): the reused rule + the sitdrive mechanism
// for sat seeds + the caveat/failed-attempt flags. The CLASS is always
// the reused classifier's class — this wrapper never re-decides it.
function classifySitDrive(corpus) {
  const base = A.classifySit(corpus);
  const rows = corpus.daily || [];
  const lastRow = rows.length ? rows[rows.length - 1] : null;
  const out = Object.assign({}, base);
  out.caveatFlag = !!(lastRow && corpus.gameDays != null && (corpus.gameDays | 0) > (lastRow.day | 0));
  out.caveatDetail = out.caveatFlag
    ? 'last daily row d' + lastRow.day + ' but gameDays ' + corpus.gameDays + ' — final day(s) never snapshotted'
    : null;
  const ts = corpus.takeseatStats || {};
  out.seatFailed = (ts.seatFailed | 0);
  out.failedAttempt = out.seatFailed > 0;
  const tableChoices = (corpus.doorVerbMsgs || []).filter(function (m) { return m && m.call === 'chooseTableOption'; });
  const sitCalls = (corpus.doorVerbMsgs || []).filter(function (m) { return m && m.call === 'tableTakeSeat'; });
  out.sitCallCount = sitCalls.length;
  out.tableChoiceCount = tableChoices.length;
  if (base.cls === 'sat') {
    const ev = base.ev;
    const doors = (ts.doorsOffered != null) ? ts.doorsOffered : null;
    const firstChoice = tableChoices.length ? tableChoices[0] : null;
    out.mechanism = base.mechanism +
      '; drive: seatAttempts ' + (ts.seatAttempts | 0) + ', taken d' + ev.sitDay + ' (' + (ev.sitKind || '?') + ')' +
      '; doors offered ' + (doors == null ? 'unknown' : doors) +
      '; tableChoices answered after the sit: ' + tableChoices.length +
      (firstChoice ? ' (first d' + firstChoice.day + ': ' + String(firstChoice.arg) + ')' : '') +
      '; skips before the sit: ' + JSON.stringify(ts.skips || {});
  }
  return out;
}

function loadDir(dir) {
  const out = {};
  fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[c.seed] = c;
  });
  return out;
}

// starvationCount(corpus): fallen entries whose cause is exactly
// 'starvation' (a real fallen-cause value — fightloop-fix-b census:
// 'starvation 1' of 96). Thirst/dehydration are NOT starvation.
function starvationCount(corpus) {
  return ((corpus.fallen || []).filter(function (f) { return f && f.cause === 'starvation'; })).length;
}
function fallenCount(corpus) { return (corpus.fallen || []).length; }

function trueMedian(values) {
  const s = values.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return (s.length % 2 === 1) ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// costBars(armed, baseline): the sim-scalemetric cost bars. Returns
// {starvArmed, starvControl, starvArmOnlyArmed, starvArmOnlyControl,
//  medianArmed, medianControl, medianRatio, starvTotalsOk, starvArmOnlyOk,
//  medianOk} — null when no baseline dir was given. "Arm-only" =
// starvation deaths on the seeds where the drive fired (the armed leg's
// sat seeds), armed vs control on those same seeds.
function costBars(armed, baseline) {
  if (!baseline) return null;
  const aSeeds = Object.keys(armed).sort();
  const satSeeds = aSeeds.filter(function (s) { return classifySitDrive(armed[s]).cls === 'sat'; });
  const starv = function (dir, seeds) {
    return seeds.reduce(function (n, s) { return n + (dir[s] ? starvationCount(dir[s]) : 0); }, 0);
  };
  const starvArmed = starv(armed, aSeeds);
  const starvControl = starv(baseline, aSeeds);
  const starvArmOnlyArmed = starv(armed, satSeeds);
  const starvArmOnlyControl = starv(baseline, satSeeds);
  const medianArmed = trueMedian(aSeeds.map(function (s) { return armed[s].gameDays; }));
  const medianControl = trueMedian(aSeeds.map(function (s) { return baseline[s] ? baseline[s].gameDays : null; }).filter(function (v) { return v != null; }));
  const medianRatio = (medianControl ? (medianArmed / medianControl) : null);
  return { satSeeds: satSeeds, starvArmed: starvArmed, starvControl: starvControl,
    starvArmOnlyArmed: starvArmOnlyArmed, starvArmOnlyControl: starvArmOnlyControl,
    medianArmed: medianArmed, medianControl: medianControl, medianRatio: medianRatio,
    starvTotalsOk: starvArmed <= starvControl + 2,
    starvArmOnlyOk: starvArmOnlyArmed <= starvArmOnlyControl + 2,
    medianOk: (medianRatio != null && medianRatio >= 0.8) };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/analyze-sitdrive-winseek-20261109.js <corpus-dir> [baseline-dir] [unrecorded-dir]'); process.exit(2); }
  const corpora = loadDir(dir);
  const seeds = Object.keys(corpora).sort();
  const baselineDir = process.argv[3];
  const baseline = baselineDir ? loadDir(baselineDir) : null;
  console.log('seed | days | end | standing | maxWave | seat | w4 | class | caveat | failed | sitCalls | choices');
  const classes = {};
  seeds.forEach(function (s) {
    const c = corpora[s];
    const cl = classifySitDrive(c);
    classes[s] = cl.cls;
    const w4 = (c.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length;
    const sat = (c.takeseatStats || {}).seatDay;
    console.log(s + ' | ' + c.days + ' | ' + c.endReason + ' | ' + c.standing + ' | ' + c.maxWave + ' | ' + (sat ? (c.takeseatStats.seatKind || '?') + ' d' + sat : '—') + ' | ' + w4 + ' | ' + cl.cls + ' | ' + (cl.caveatFlag ? 'CAVEAT' : '—') + ' | ' + (cl.failedAttempt ? 'FAILED-ATTEMPT' : '—') + ' | ' + cl.sitCallCount + ' | ' + cl.tableChoiceCount);
  });
  console.log('\nPer-seed mechanisms (sitdrive):');
  seeds.forEach(function (s) {
    const cl = classifySitDrive(corpora[s]);
    console.log('\n' + s + ' [' + cl.cls + ']: ' + cl.mechanism);
    const ev = cl.ev;
    console.log('  events: waiting d' + ev.firstWaitingDay + ', announced d' + ev.firstAnnouncedDay + ', seat ' + ev.firstSeatKind + ' d' + ev.firstSeatDay + ', ready d' + ev.firstReadyDay + '–d' + ev.lastReadyDay + ' (' + ev.readyDays.length + 'd), dip d' + ev.dipDay + ', sit d' + ev.sitDay);
    if (cl.caveatFlag) console.log('  CAVEAT: ' + cl.caveatDetail);
    if (cl.failedAttempt) console.log('  FAILED ATTEMPT: seatFailed=' + cl.seatFailed + ' — the verb was called but the seat was not taken');
  });
  console.log('\nWall numbers:');
  const sits = seeds.filter(function (s) { return classes[s] === 'sat'; }).length;
  const ont = seeds.filter(function (s) { return classes[s] === 'offered-not-taken'; }).length;
  const national = seeds.filter(function (s) { return corpora[s].scaleRank === 'national' || corpora[s].scaleRank === 'global'; }).length;
  const w4u = seeds.filter(function (s) { return corpora[s].maxWave >= 4; }).length;
  const w5u = seeds.filter(function (s) { return corpora[s].maxWave >= 5; }).length;
  const surv = seeds.map(function (s) { return corpora[s].gameDays; });
  console.log('national ' + national + '/' + seeds.length + ', table sits ' + sits + '/' + seeds.length + ', offered-not-taken ' + ont + '/' + seeds.length + ', wins ' + seeds.filter(function (s) { return corpora[s].won; }).length + '/' + seeds.length);
  console.log('wave-4 unlocks ' + w4u + '/' + seeds.length + ', wave-5 unlocks ' + w5u + '/' + seeds.length);
  console.log('median survival (true) ' + trueMedian(surv) + 'd (sorted ' + surv.slice().sort(function (a, b) { return a - b; }).join(', ') + ')');
  console.log('seat-verb calls across the band: ' + seeds.reduce(function (n, s) { return n + classifySitDrive(corpora[s]).sitCallCount; }, 0) + ' (expected = sits: the drive calls the verb to sit)');
  console.log('tableChoices answered across the band: ' + seeds.reduce(function (n, s) { return n + classifySitDrive(corpora[s]).tableChoiceCount; }, 0));
  const bars = costBars(corpora, baseline);
  if (bars) {
    console.log('\nCost bars vs baseline ' + baselineDir + ':');
    console.log('starvation totals: armed ' + bars.starvArmed + ' vs control ' + bars.starvControl + ' (bar ≤ control+2): ' + (bars.starvTotalsOk ? 'PASS' : 'FAIL'));
    console.log('starvation on sat seeds (' + (bars.satSeeds.join(', ') || 'none sat') + '): armed ' + bars.starvArmOnlyArmed + ' vs control ' + bars.starvArmOnlyControl + ' (bar ≤ control+2): ' + (bars.starvArmOnlyOk ? 'PASS' : 'FAIL'));
    console.log('median survival: armed ' + bars.medianArmed + 'd vs control ' + bars.medianControl + 'd, ratio ' + (bars.medianRatio == null ? '?' : bars.medianRatio.toFixed(2)) + ' (bar ≥ 0.80): ' + (bars.medianOk ? 'PASS' : 'FAIL'));
    if (baseline) {
      console.log('\nBaseline comparison (same seeds, plain winseek):');
      seeds.forEach(function (s) {
        const b = baseline[s];
        const a = corpora[s];
        if (!b) { console.log(s + ': no baseline'); return; }
        console.log(s + ': now ' + a.gameDays + 'd ' + a.endReason + ' (baseline ' + b.gameDays + 'd ' + b.endReason + '), class ' + classes[s] + ' (baseline ' + A.classifySit(b).cls + '), standing ' + a.standing + ' (baseline ' + b.standing + ')');
      });
    }
  } else {
    console.log('\nCost bars: no baseline dir given — run with a baseline dir to judge them.');
  }
  console.log('\nG3 corpus integrity:');
  seeds.forEach(function (s) {
    const ck = A.checkCorpusSit(corpora[s]);
    console.log(s + ': ' + (ck.ok ? 'PASS' : 'FAIL — ' + ck.problems.join('; ')) + (ck.gaps.length ? ' (gaps: ' + ck.gaps.join(', ') + ')' : '') + (ck.livingNotes.length ? ' (living notes: ' + ck.livingNotes.join('; ') + ')' : ''));
  });
  const unrecDir = process.argv[4];
  if (unrecDir) {
    const unrec = loadDir(unrecDir);
    console.log('\nG2 neutrality (unrecorded vs recorded):');
    Object.keys(unrec).sort().forEach(function (s) {
      if (!corpora[s]) { console.log(s + ': no recorded match'); return; }
      const n = A.neutralityCompareSit(unrec[s], corpora[s]);
      console.log(s + ': ' + (n.ok ? 'PASS' : 'FAIL — ' + n.diffs.join(', ')));
    });
  }
}

module.exports = { classifySitDrive: classifySitDrive, starvationCount: starvationCount, fallenCount: fallenCount,
  trueMedian: trueMedian, costBars: costBars, loadDir: loadDir, NO_SIT_DRIVE_SENTENCE: NO_SIT_DRIVE_SENTENCE,
  classifySit: A.classifySit, seatEvents: A.seatEvents, skipActivity: A.skipActivity, missingBars: A.missingBars,
  checkCorpusSit: A.checkCorpusSit, stripSitgap: A.stripSitgap, neutralityCompareSit: A.neutralityCompareSit };
