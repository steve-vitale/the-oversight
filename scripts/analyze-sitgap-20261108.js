// analyze-sitgap-20261108.js — the SIT GAP classifier + corpus checker
// (arm sim-sitgap-b, run fleshout-loop-b-20261109T0130Z). DIAG, zero src/js.
// Implements the prereg classification rule (evidence/2026-11-08/
// sim-sitgap-b-prereg.md) over the sitgap corpora. Pure functions over
// corpus JSONs; no sim.
// Classes (first match wins):
//   sat / offered-not-taken / offered-declined / reached-never-sat /
//   never-offered — each with a named mechanism.
// Usage:
//   node scripts/analyze-sitgap-20261108.js <corpus-dir> [roots-dir] [unrecorded-dir]
// Prints the per-seed classification table, the 53008 mechanism, wall
// numbers, roots delta vs the prior master, G3 integrity, and (with a
// third dir) the G2 neutrality comparison.
'use strict';
const fs = require('fs');
const path = require('path');
const A53007 = require('./analyze-53007-20261108');

// skipActivity(rows): per-day takeseat skip increments. The harness runs
// policy.upkeep 3x per loop-day and policy.daily ONCE at the END of the
// loop-day (sim-harness.js runDays: parts, then daily, then sleep), and
// the driver snapshots in daily() — so the snapshot for scholar-day d is
// taken AFTER all of day d's upkeep calls. The diff between consecutive
// rows therefore covers the upkeep calls of the LATER row's day, and is
// attributed to that day. Returns [{day, skips{}}] keyed by the day the
// activity happened on.
function skipActivity(rows) {
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const prev = (rows[i - 1].sitgap || {}).tsSkips || {};
    const cur = (rows[i].sitgap || {}).tsSkips || {};
    const keys = {};
    Object.keys(prev).forEach(function (k) { keys[k] = 1; });
    Object.keys(cur).forEach(function (k) { keys[k] = 1; });
    const inc = {};
    let total = 0;
    Object.keys(keys).forEach(function (k) {
      const d = ((cur[k] | 0) - (prev[k] | 0));
      if (d > 0) { inc[k] = d; total += d; }
    });
    if (total > 0) out.push({ day: rows[i].day, skips: inc, total: total });
  }
  return out;
}

function firstRow(rows, pred) {
  for (let i = 0; i < rows.length; i++) if (pred(rows[i])) return rows[i];
  return null;
}

// seatEvents(corpus): the sit-chain milestones read off the daily rows.
function seatEvents(corpus) {
  const rows = corpus.daily || [];
  const ev = { firstWaitingDay: null, firstAnnouncedDay: null, firstSeatDay: null, firstSeatKind: null,
    firstReadyDay: null, lastReadyDay: null, readyDays: [], dipDay: null, dipDetail: null,
    holdingTold: false, sitDay: null, sitKind: null, endSeat: null, endGate: null };
  let r = firstRow(rows, function (x) { return !!x.tableWaiting; });
  if (r) ev.firstWaitingDay = r.day;
  r = firstRow(rows, function (x) { return !!x.tableAnnounced; });
  if (r) ev.firstAnnouncedDay = r.day;
  r = firstRow(rows, function (x) { return x.seat && x.seat !== 'none'; });
  if (r) { ev.firstSeatDay = r.day; ev.firstSeatKind = r.seat; }
  rows.forEach(function (x) {
    if (x.preview && x.preview.ready) {
      ev.readyDays.push(x.day);
      if (ev.firstReadyDay == null) ev.firstReadyDay = x.day;
      ev.lastReadyDay = x.day;
    }
    if (x.tableHoldingTold) ev.holdingTold = true;
  });
  // Dip: first row AFTER the first announced day where the seat is none.
  if (ev.firstAnnouncedDay != null) {
    for (let i = 0; i < rows.length; i++) {
      const x = rows[i];
      if (x.day > ev.firstAnnouncedDay && x.seat === 'none') {
        ev.dipDay = x.day;
        ev.dipDetail = x.seatDetail || null;
        break;
      }
    }
  }
  const ts = corpus.takeseatStats || {};
  ev.sitDay = (ts.seatDay != null) ? (ts.seatDay | 0) : null;
  ev.sitKind = ts.seatKind || null;
  if (rows.length) { ev.endSeat = rows[rows.length - 1].seat; ev.endGate = rows[rows.length - 1].gate; }
  return ev;
}

function missingBars(detail) {
  const d = detail || {};
  const m = [];
  if (((d.w1 | 0)) < 4) m.push('wave-1 faced ' + (d.w1 | 0) + '/4');
  if (((d.w2 | 0)) < 4) m.push('wave-2 faced ' + (d.w2 | 0) + '/4');
  if (((d.w3 | 0)) < 3) m.push('wave-3 faced ' + (d.w3 | 0) + '/3');
  if (((d.contestsN | 0)) < 2) m.push('contests survived ' + (d.contestsN | 0) + '/2');
  if (((d.crisesN | 0)) < 2) m.push('crises weathered ' + (d.crisesN | 0) + '/2');
  const rk = d.rank || 'village';
  if (rk !== 'regional' && rk !== 'national' && rk !== 'global') m.push('scale ' + rk + ' (needs regional+)');
  if (((d.stage | 0)) < 2) m.push('integration stage ' + (d.stage | 0) + '/2');
  if (!d.foodDeeds) m.push('food-thesis deeds unfinished');
  return m;
}

// classifySit(corpus): the prereg rule, first match wins.
// Returns {cls, mechanism, ev, readySkipTop, readyAway, readyBlocked}.
function classifySit(corpus) {
  const rows = corpus.daily || [];
  const ev = seatEvents(corpus);
  const ts = corpus.takeseatStats || {};
  const taken = (ts.seatTaken | 0) > 0 || (corpus.finalSeat && corpus.finalSeat.seat && corpus.finalSeat.seat !== 'none' && rows.length && rows[rows.length - 1].tableDone);
  // 1. sat
  if (taken || (rows.length && rows[rows.length - 1].tableDone)) {
    const seatRow = firstRow(rows, function (x) { return !!x.tableDone; });
    const kind = ev.sitKind || (seatRow ? seatRow.seat : null) || 'lesser';
    const day = ev.sitDay != null ? ev.sitDay : (seatRow ? seatRow.day : null);
    const det = seatRow ? seatRow.seatDetail : null;
    return { cls: 'sat', mechanism: 'sat ' + kind + ' on d' + day + ' (standing ' + (seatRow ? seatRow.raw : corpus.standing) + '; seat detail ' + JSON.stringify(det) + ')', ev: ev };
  }
  // Ready-day attribution: skip increments on ready days + scholar state.
  const act = skipActivity(rows);
  const readySet = {};
  ev.readyDays.forEach(function (d) { readySet[d] = 1; });
  const readySkips = {};
  let readyTotal = 0;
  act.forEach(function (a) {
    if (!readySet[a.day]) return;
    Object.keys(a.skips).forEach(function (k) { readySkips[k] = (readySkips[k] || 0) + a.skips[k]; readyTotal += a.skips[k]; });
  });
  let readySkipTop = null;
  Object.keys(readySkips).forEach(function (k) { if (!readySkipTop || readySkips[k] > readySkips[readySkipTop]) readySkipTop = k; });
  const readyRows = rows.filter(function (x) { return x.preview && x.preview.ready; });
  const readyAway = readyRows.filter(function (x) { return x.scholarAtHaven === false; }).length;
  const readyBlocked = {};
  readyRows.forEach(function (x) {
    const w = (x.preview && x.preview.why) || x.entryBlock || '';
    if (w) readyBlocked[w] = (readyBlocked[w] || 0) + 1;
  });
  const base = { ev: ev, readySkipTop: readySkipTop, readySkips: readySkips, readyTotal: readyTotal, readyAway: readyAway, readyRows: readyRows.length, readyBlocked: readyBlocked };
  // 2. offered-not-taken
  if (ev.firstAnnouncedDay != null && ev.readyDays.length > 0) {
    const endState = (corpus.endReason || '') + ' d' + corpus.gameDays;
    return Object.assign({ cls: 'offered-not-taken',
      mechanism: 'announced d' + ev.firstAnnouncedDay + ', seat ' + (ev.firstSeatKind || '?') + ' from d' + ev.firstSeatDay +
        '; preview ready on ' + ev.readyDays.length + ' days (d' + ev.firstReadyDay + '–d' + ev.lastReadyDay + ')' +
        '; scholar away from Haven on ' + readyAway + '/' + readyRows.length + ' ready days' +
        '; dominant sit-drive skip across ready days: ' + (readySkipTop || 'none recorded') + ' (' + JSON.stringify(readySkips) + ')' +
        '; entry blocks on ready days: ' + JSON.stringify(readyBlocked) +
        '; end: ' + endState + ' unseated, standing ' + corpus.standing },
      base);
  }
  // 3. offered-declined (announced, then the seat dips to none, never ready)
  if (ev.firstAnnouncedDay != null && ev.dipDay != null) {
    const lastSeatRow = null;
    let lastSeat = null;
    for (let i = rows.length - 1; i >= 0; i--) { if (rows[i].day < ev.dipDay && rows[i].seat && rows[i].seat !== 'none') { lastSeat = rows[i]; break; } }
    const dipped = missingBars(ev.dipDetail);
    return Object.assign({ cls: 'offered-declined',
      mechanism: 'announced d' + ev.firstAnnouncedDay + ' (' + (ev.firstSeatKind || '?') + ' seat from d' + ev.firstSeatDay + '); seat dipped to none on d' + ev.dipDay +
        ' (holding' + (ev.holdingTold ? ' told' : ' — no holding line captured') + '); missing at the dip: ' + (dipped.join('; ') || 'none named') +
        '; last whole-seat day d' + (lastSeat ? lastSeat.day : '?') + ' (standing ' + (lastSeat ? lastSeat.raw : '?') + ')' +
        '; never a ready day; end unseated, standing ' + corpus.standing },
      base);
  }
  // 4. reached-never-sat
  if (ev.firstWaitingDay != null) {
    const lastWaiting = null;
    let lw = null;
    for (let i = rows.length - 1; i >= 0; i--) { if (rows[i].tableWaiting) { lw = rows[i]; break; } }
    const gate = lw ? lw.gate : null;
    const miss = (lw && lw.seatDetail) ? missingBars(lw.seatDetail) : [];
    // Why the preview never became ready: the day-90 floor is the common
    // cause (tablePreview is null before day 90 even with a priced seat);
    // otherwise the entry block / seat state on the last waiting day.
    const floorDays = rows.filter(function (x) { return x.tableWaiting && x.winDayFloorOk === false; }).length;
    const waitingDays = rows.filter(function (x) { return x.tableWaiting; }).length;
    const floorNote = (floorDays === waitingDays && waitingDays > 0)
      ? 'preview null on every waiting day because day < 90 (winDayFloorOk false) — the village ended before the floor'
      : 'preview null on ' + floorDays + '/' + waitingDays + ' waiting days for the day-90 floor';
    return Object.assign({ cls: 'reached-never-sat',
      mechanism: 'tableWaiting from d' + ev.firstWaitingDay + ' but preview never ready; ' + floorNote + '; last waiting day d' + (lw ? lw.day : '?') +
        ' gate=' + gate + '; seat ' + (lw ? lw.seat : '?') + (miss.length ? '; missing bars: ' + miss.join('; ') : '') +
        '; announced: ' + (ev.firstAnnouncedDay != null ? 'd' + ev.firstAnnouncedDay : 'never') +
        '; preview why on last waiting day: ' + JSON.stringify(lw && lw.preview ? lw.preview.why : null) +
        '; entry block: ' + JSON.stringify(lw ? lw.entryBlock : null) +
        '; end unseated, standing ' + corpus.standing },
      base);
  }
  // 5. never-offered
  const end = rows.length ? rows[rows.length - 1] : {};
  const miss = missingBars(end.seatDetail);
  return Object.assign({ cls: 'never-offered',
    mechanism: 'tableWaiting never true (furthest arc ' + (end.arc != null ? end.arc : '?') + '); seat ' + (end.seat || '?') +
      ' at end; missing bars at end: ' + (miss.join('; ') || 'none named') +
      '; end ' + (corpus.endReason || '?') + ' d' + corpus.gameDays + ', standing ' + corpus.standing },
    base);
}

// checkCorpusSit(corpus): G3 integrity = the 53007 check + sitgap fields.
function checkCorpusSit(corpus) {
  const base = A53007.checkCorpus(corpus);
  const problems = base.problems.slice();
  if (!corpus.instrumentOff) {
    const daily = corpus.daily || [];
    const missing = daily.filter(function (r) { return !r.sitgap; }).length;
    if (missing) problems.push('sitgap missing on ' + missing + '/' + daily.length + ' rows');
    const nullSkips = daily.filter(function (r) { return r.sitgap && r.sitgap.tsSkips == null; }).length;
    if (nullSkips) problems.push('sitgap.tsSkips null on ' + nullSkips + ' rows');
    const nullSeat = daily.filter(function (r) { return r.seat == null; }).length;
    if (nullSeat) problems.push('seat null on ' + nullSeat + ' rows');
  }
  return { ok: problems.length === 0, problems: problems, gaps: base.gaps, livingNotes: base.livingNotes };
}

// stripSitgap(corpus): the unrecorded shape of an armed corpus.
function stripSitgap(corpus) {
  const c = JSON.parse(JSON.stringify(corpus));
  (c.daily || []).forEach(function (r) { delete r.diag; delete r.sitgap; });
  return c;
}

// neutralityCompareSit(unrec, rec): G2 — the recorded corpus stripped of
// BOTH recorder fields (diag + sitgap) must equal the unrecorded corpus on
// headlines, fallen, daily rows, waveKillLog, takeseatStats, sitAttempts
// and doorVerbMsgs (the instrument records the last two identically on
// both sides — INST is always installed; only the recorders are gated).
function neutralityCompareSit(unrec, rec) {
  const diffs = [];
  const a = stripSitgap(A53007.stripDiag(rec));
  function cmp(label, x, y) {
    if (JSON.stringify(x) !== JSON.stringify(y)) diffs.push(label);
  }
  ['days', 'gameDays', 'endReason', 'won', 'over', 'villageLost', 'scaleRank', 'maxWave', 'unlockedWave', 'standing'].forEach(function (k) { cmp('headline.' + k, unrec[k], a[k]); });
  cmp('fallen', unrec.fallen, a.fallen);
  cmp('daily', unrec.daily, a.daily);
  cmp('waveKillLog', unrec.waveKillLog, a.waveKillLog);
  cmp('takeseatStats', unrec.takeseatStats, a.takeseatStats);
  cmp('sitAttempts', unrec.sitAttempts, a.sitAttempts);
  cmp('doorVerbMsgs', unrec.doorVerbMsgs, a.doorVerbMsgs);
  return { ok: diffs.length === 0, diffs: diffs };
}

function loadDir(dir) {
  const out = {};
  fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[c.seed] = c;
  });
  return out;
}

function headline(c) {
  return { days: c.days, gameDays: c.gameDays, endReason: c.endReason, standing: c.standing, maxWave: c.maxWave,
    scaleRank: c.scaleRank, seatDay: (c.takeseatStats || {}).seatDay, seatKind: (c.takeseatStats || {}).seatKind,
    w4: (c.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/analyze-sitgap-20261108.js <corpus-dir> [roots-dir] [unrecorded-dir]'); process.exit(2); }
  const corpora = loadDir(dir);
  const seeds = Object.keys(corpora).sort();
  console.log('seed | days | end | standing | maxWave | seat | w4 | class');
  const classes = {};
  seeds.forEach(function (s) {
    const c = corpora[s];
    const cl = classifySit(c);
    classes[s] = cl.cls;
    const w4 = (c.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length;
    const sat = (c.takeseatStats || {}).seatDay;
    console.log(s + ' | ' + c.days + ' | ' + c.endReason + ' | ' + c.standing + ' | ' + c.maxWave + ' | ' + (sat ? (c.takeseatStats.seatKind || '?') + ' d' + sat : '—') + ' | ' + w4 + ' | ' + cl.cls);
  });
  console.log('\nPer-seed mechanisms:');
  seeds.forEach(function (s) {
    const cl = classifySit(corpora[s]);
    console.log('\n' + s + ' [' + cl.cls + ']: ' + cl.mechanism);
    const ev = cl.ev;
    console.log('  events: waiting d' + ev.firstWaitingDay + ', announced d' + ev.firstAnnouncedDay + ', seat ' + ev.firstSeatKind + ' d' + ev.firstSeatDay + ', ready d' + ev.firstReadyDay + '–d' + ev.lastReadyDay + ' (' + ev.readyDays.length + 'd), dip d' + ev.dipDay + ', sit d' + ev.sitDay);
  });
  const c8 = corpora['53008'];
  if (c8) {
    console.log('\n53008 mechanism (full):');
    console.log(JSON.stringify(classifySit(c8), null, 2));
  }
  const rootsDir = process.argv[3];
  if (rootsDir) {
    const roots = loadDir(rootsDir);
    console.log('\nRoots delta vs ' + rootsDir + ' (prior master):');
    seeds.forEach(function (s) {
      const h = headline(corpora[s]);
      const r = roots[s] ? headline(roots[s]) : null;
      if (!r) { console.log(s + ': no root'); return; }
      const same = JSON.stringify(h) === JSON.stringify(r);
      console.log(s + ': ' + (same ? 'SAME' : 'CHANGED') + '  now=' + JSON.stringify(h) + '  root=' + JSON.stringify(r));
    });
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
  console.log('\nG3 corpus integrity:');
  seeds.forEach(function (s) {
    const ck = checkCorpusSit(corpora[s]);
    console.log(s + ': ' + (ck.ok ? 'PASS' : 'FAIL — ' + ck.problems.join('; ')) + (ck.gaps.length ? ' (gaps: ' + ck.gaps.join(', ') + ')' : '') + (ck.livingNotes.length ? ' (living notes: ' + ck.livingNotes.join('; ') + ')' : ''));
  });
  const unrecDir = process.argv[4];
  if (unrecDir) {
    const unrec = loadDir(unrecDir);
    console.log('\nG2 neutrality (unrecorded vs recorded):');
    Object.keys(unrec).sort().forEach(function (s) {
      if (!corpora[s]) { console.log(s + ': no recorded match'); return; }
      const n = neutralityCompareSit(unrec[s], corpora[s]);
      console.log(s + ': ' + (n.ok ? 'PASS' : 'FAIL — ' + n.diffs.join(', ')));
    });
  }
}

module.exports = { classifySit: classifySit, seatEvents: seatEvents, skipActivity: skipActivity, missingBars: missingBars,
  checkCorpusSit: checkCorpusSit, stripSitgap: stripSitgap, neutralityCompareSit: neutralityCompareSit, loadDir: loadDir, headline: headline };
