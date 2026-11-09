// analyze-sitgap-winseek-20261109.js — the SIT GAP WINSEEK classifier + corpus checker
// (arm sim-sitgap-winseek-b, run fleshout-loop-b-20261109T0330Z). DIAG, zero src/js.
// Reuses the sitgap-b classifier (scripts/analyze-sitgap-20261108.js —
// READ-ONLY, never edited here) unchanged: same five classes, first match
// wins. The ONE addition is the winseek mechanism rewrite: under winseek
// there is no sit drive, so the takeseat skip diffs are EMPTY by
// construction and the offered-not-taken mechanism must be written from the
// sitstep snapshot fields (ready window, scholar location, entry block,
// preview.why) plus the verified fact that no sit drive runs — never from
// skip reasons that never fire. Any mechanism text that cites a skip reason
// is a bug in this file, and the proof tests for it.
//
// Also adds, per seed: the ready-day caveat flag (an unsnapshotted final
// day — last daily row day < gameDays — means a ready window could have
// opened and closed unseen; carried from sim-sitgap-b) and the sit-call
// contradiction flag (any tableTakeSeat / chooseTableOption call recorded
// contradicts the pre-sweep code verification and must be reported loudly).
// Usage:
//   node scripts/analyze-sitgap-winseek-20261109.js <corpus-dir> [roots-dir] [unrecorded-dir]
// Prints the per-seed classification table, per-seed winseek mechanisms,
// the 53008 mechanism, roots delta vs the prior master, the same-policy
// comparison vs the flipsocial healed winseek panel rows, wall numbers,
// G3 integrity, and (with a third dir) the G2 neutrality comparison.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const A = require('./analyze-sitgap-20261108');

const NO_SIT_DRIVE = 'no sit drive runs under winseek (verified from code: winseek extends base competent; no takeSeatDrive; tableRoad answers only pending tableChoices, which never exist pre-sit)';

// winseekMechanism(corpus, baseCl): the offered-not-taken mechanism, written
// from snapshot fields only. baseCl is the reused classifySit result (class
// + ev + readySkipTop etc. — the skip fields are EMPTY under winseek and
// are never read here).
function winseekMechanism(corpus, baseCl) {
  const rows = corpus.daily || [];
  const ev = baseCl.ev;
  const readyRows = rows.filter(function (x) { return x.preview && x.preview.ready; });
  const away = readyRows.filter(function (x) { return x.scholarAtHaven === false; }).length;
  const atHaven = readyRows.filter(function (x) { return x.scholarAtHaven === true; }).length;
  const unknownLoc = readyRows.length - away - atHaven;
  const blocks = {};
  readyRows.forEach(function (x) {
    const w = (x.preview && x.preview.why) || x.entryBlock || '';
    if (w) blocks[w] = (blocks[w] || 0) + 1;
  });
  const gates = {};
  readyRows.forEach(function (x) { const g = x.gate || '?'; gates[g] = (gates[g] || 0) + 1; });
  const endState = (corpus.endReason || '') + ' d' + corpus.gameDays;
  return 'announced d' + ev.firstAnnouncedDay + ', seat ' + (ev.firstSeatKind || '?') + ' from d' + ev.firstSeatDay +
    '; preview ready on ' + ev.readyDays.length + ' days (d' + ev.firstReadyDay + '–d' + ev.lastReadyDay + ')' +
    '; scholar at Haven on ' + atHaven + '/' + readyRows.length + ' ready days, away on ' + away + '/' + readyRows.length +
    (unknownLoc ? ', location unknown on ' + unknownLoc : '') +
    '; entry blocks on ready days: ' + JSON.stringify(blocks) +
    '; daily gates across the ready window: ' + JSON.stringify(gates) +
    '; ' + NO_SIT_DRIVE + ' — the seat sat ready and nobody walked to it' +
    '; end: ' + endState + ' unseated, standing ' + corpus.standing;
}

// classifySitWinseek(corpus): the reused rule + the winseek mechanism
// rewrite + the caveat/contradiction flags. The CLASS is always the reused
// classifier's class — this wrapper never re-decides it.
function classifySitWinseek(corpus) {
  const base = A.classifySit(corpus);
  const rows = corpus.daily || [];
  const lastRow = rows.length ? rows[rows.length - 1] : null;
  const out = Object.assign({}, base);
  // Ready-day caveat: an unsnapshotted final day (last daily row before
  // the final game day) means a ready window could have opened and closed
  // unseen — the seed could misclassify as reached-never-sat.
  out.caveatFlag = !!(lastRow && corpus.gameDays != null && (corpus.gameDays | 0) > (lastRow.day | 0));
  out.caveatDetail = out.caveatFlag
    ? 'last daily row d' + lastRow.day + ' but gameDays ' + corpus.gameDays + ' — final day(s) never snapshotted'
    : null;
  // Contradiction flag: ANY seat-verb call under winseek contradicts the
  // pre-sweep code verification (no sit drive exists). Count both the
  // instrument wrap (sitAttempts) and the driver wrap (doorVerbMsgs).
  const sitCalls = (corpus.sitAttempts || []).filter(function (a) { return a && (a.call === 'tableTakeSeat' || a.call === 'tableOfferSeatTaker' || a.call === 'tableChooseSeatTaker'); });
  const doorSitCalls = (corpus.doorVerbMsgs || []).filter(function (m) { return m && (m.call === 'tableTakeSeat' || m.call === 'tableOfferSeatTaker' || m.call === 'tableChooseSeatTaker'); });
  const tableChoices = (corpus.doorVerbMsgs || []).filter(function (m) { return m && m.call === 'chooseTableOption'; });
  out.sitCallCount = sitCalls.length + doorSitCalls.length;
  out.tableChoiceCount = tableChoices.length;
  out.contradiction = out.sitCallCount > 0 || out.tableChoiceCount > 0 || ((corpus.takeseatStats || {}).seatTaken | 0) > 0;
  if (base.cls === 'offered-not-taken') {
    out.mechanism = winseekMechanism(corpus, base);
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

// flipsocialWinseekRows(): the healed-leg winseek panel rows (same policy,
// older master c9fea16ee) — the clean same-policy master-movement read.
// Returns null when the panel file is absent.
function flipsocialWinseekRows() {
  try {
    const p = path.join(__dirname, '..', 'evidence', '2026-11-08', 'panel-flipsocial-b', 'after', 'panel.json.gz');
    const j = JSON.parse(zlib.gunzipSync(fs.readFileSync(p)).toString('utf8'));
    const rows = (j.rows || []).map(function (r) { return r.row || {}; })
      .filter(function (r) { return r.policy === 'winseek'; })
      .sort(function (a, b) { return (a.seed | 0) - (b.seed | 0); });
    return rows.length ? rows : null;
  } catch (e) { return null; }
}

function headline(c) {
  return { days: c.days, gameDays: c.gameDays, endReason: c.endReason, standing: c.standing, maxWave: c.maxWave,
    scaleRank: c.scaleRank, seatDay: (c.takeseatStats || {}).seatDay, seatKind: (c.takeseatStats || {}).seatKind,
    w4: (c.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/analyze-sitgap-winseek-20261109.js <corpus-dir> [roots-dir] [unrecorded-dir]'); process.exit(2); }
  const corpora = loadDir(dir);
  const seeds = Object.keys(corpora).sort();
  console.log('seed | days | end | standing | maxWave | seat | w4 | class | caveat | sitCalls');
  const classes = {};
  seeds.forEach(function (s) {
    const c = corpora[s];
    const cl = classifySitWinseek(c);
    classes[s] = cl.cls;
    const w4 = (c.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length;
    const sat = (c.takeseatStats || {}).seatDay;
    console.log(s + ' | ' + c.days + ' | ' + c.endReason + ' | ' + c.standing + ' | ' + c.maxWave + ' | ' + (sat ? (c.takeseatStats.seatKind || '?') + ' d' + sat : '—') + ' | ' + w4 + ' | ' + cl.cls + ' | ' + (cl.caveatFlag ? 'CAVEAT' : '—') + ' | ' + cl.sitCallCount);
  });
  console.log('\nPer-seed mechanisms (winseek):');
  seeds.forEach(function (s) {
    const cl = classifySitWinseek(corpora[s]);
    console.log('\n' + s + ' [' + cl.cls + ']: ' + cl.mechanism);
    const ev = cl.ev;
    console.log('  events: waiting d' + ev.firstWaitingDay + ', announced d' + ev.firstAnnouncedDay + ', seat ' + ev.firstSeatKind + ' d' + ev.firstSeatDay + ', ready d' + ev.firstReadyDay + '–d' + ev.lastReadyDay + ' (' + ev.readyDays.length + 'd), dip d' + ev.dipDay + ', sit d' + ev.sitDay);
    if (cl.caveatFlag) console.log('  CAVEAT: ' + cl.caveatDetail);
    if (cl.contradiction) console.log('  CONTRADICTION: sit/table-choice calls recorded under winseek (sitCalls=' + cl.sitCallCount + ', tableChoices=' + cl.tableChoiceCount + ') — contradicts the code verification');
  });
  const c8 = corpora['53008'];
  if (c8) {
    console.log('\n53008 mechanism (full):');
    console.log(JSON.stringify(classifySitWinseek(c8), null, 2));
  }
  const rootsDir = process.argv[3];
  if (rootsDir) {
    const roots = loadDir(rootsDir);
    console.log('\nRoots delta vs ' + rootsDir + ' (prior master — POLICY+MASTER delta: doorwalk on the old master vs winseek on this one; do not attribute to one cause):');
    seeds.forEach(function (s) {
      const h = headline(corpora[s]);
      const r = roots[s] ? headline(roots[s]) : null;
      if (!r) { console.log(s + ': no root'); return; }
      const same = JSON.stringify(h) === JSON.stringify(r);
      console.log(s + ': ' + (same ? 'SAME' : 'CHANGED') + '  now=' + JSON.stringify(h) + '  root=' + JSON.stringify(r));
    });
  }
  const panelRows = flipsocialWinseekRows();
  if (panelRows) {
    console.log('\nSame-policy comparison vs flipsocial healed winseek panel rows (master c9fea16ee, same policy winseek — the clean master-movement read):');
    seeds.forEach(function (s) {
      const pr = panelRows.filter(function (r) { return String(r.seed) === String(s); })[0];
      const c = corpora[s];
      if (!pr) { console.log(s + ': no panel row'); return; }
      console.log(s + ': now gameDays ' + c.gameDays + ' (panel ' + pr.gameDays + '), waveReach ' + c.maxWave + ' (panel ' + pr.waveReach + '), end ' + c.endReason + ' (panel ' + pr.endReason + '), panel table ' + pr.table + ' / entered ' + pr.entered);
    });
  } else {
    console.log('\nSame-policy comparison: panel-flipsocial-b/after/panel.json.gz not present — comparison skipped.');
  }
  console.log('\nWall numbers:');
  const sits = seeds.filter(function (s) { return classes[s] === 'sat'; }).length;
  const national = seeds.filter(function (s) { return corpora[s].scaleRank === 'national' || corpora[s].scaleRank === 'global'; }).length;
  const w4u = seeds.filter(function (s) { return corpora[s].maxWave >= 4; }).length;
  const w5u = seeds.filter(function (s) { return corpora[s].maxWave >= 5; }).length;
  const surv = seeds.map(function (s) { return corpora[s].gameDays; }).sort(function (a, b) { return a - b; });
  console.log('national ' + national + '/' + seeds.length + ', table sits ' + sits + '/' + seeds.length + ', wins ' + seeds.filter(function (s) { return corpora[s].won; }).length + '/' + seeds.length);
  console.log('wave-4 unlocks ' + w4u + '/' + seeds.length + ', wave-5 unlocks ' + w5u + '/' + seeds.length);
  console.log('median survival ' + surv[Math.floor(surv.length / 2)] + 'd (sorted ' + surv.join(', ') + ')');
  console.log('sit-verb calls across the band: ' + seeds.reduce(function (n, s) { return n + classifySitWinseek(corpora[s]).sitCallCount; }, 0) + ' (expected 0 — no sit drive under winseek)');
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

module.exports = { classifySitWinseek: classifySitWinseek, winseekMechanism: winseekMechanism, NO_SIT_DRIVE: NO_SIT_DRIVE,
  flipsocialWinseekRows: flipsocialWinseekRows, loadDir: loadDir, headline: headline,
  classifySit: A.classifySit, seatEvents: A.seatEvents, skipActivity: A.skipActivity, missingBars: A.missingBars,
  checkCorpusSit: A.checkCorpusSit, stripSitgap: A.stripSitgap, neutralityCompareSit: A.neutralityCompareSit };
