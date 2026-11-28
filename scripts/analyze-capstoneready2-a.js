#!/usr/bin/env node
// scripts/analyze-capstoneready2-a.js — sim-capstoneready-a leg-2 analyzer.
// Reads ONLY the per-seed JSONs the leg-2 driver wrote (never re-sims,
// never recomputes readiness from anywhere but the snapshot's own
// stored fields). The delivery judge (§2 of the leg-2 amendment) lives
// here: the verb must fire exactly where leg 1 said it could (113302
// day 83, 113305 day 140), succeed, record the capstone, pay both
// veterans cleanly, and fire nowhere else.
//
// Usage:
//   node scripts/analyze-capstoneready2-a.js [--outdir <dir>] [--json]
//   node scripts/analyze-capstoneready2-a.js --selftest
// Exit 0 on DIAG-GO, 1 on DIAG-NO-GO (or selftest failure).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-28', 'perseed-capstoneready-a-leg2-arm');
const SEEDS = (process.env.SEEDS || '113301,113302,113303,113304,113305,113306,113307,113308')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

const CAPSTONE_KINDS = ['military_tribute', 'trade_charter', 'feast_embassy'];

// recomputeReady(kind, entry): the stored `ready` boolean,
// recomputed from the entry's OWN stored fields. Returns true/false,
// or null when the stored fields cannot decide (read error, missing
// inputs) — null is "not recomputable", never a mismatch.
function recomputeReady(kind, entry) {
  if (!entry || typeof entry !== 'object' || entry.error) return null;
  if (entry.reason === 'delivered') return false; // already delivered reads not-ready
  if (entry.reason === 'read-error' || entry.reason === 'unknown-capstone' || entry.reason === 'unknown-kind') return null;
  if (kind === 'military_tribute') {
    if (typeof entry.veterans !== 'number' || typeof entry.need !== 'number') return null;
    return entry.veterans >= entry.need;
  }
  if (kind === 'trade_charter') {
    if (typeof entry.charteredLinks !== 'number') return null;
    const scaleOk = !entry.scale ? true : (entry.scale === 'national' || entry.scale === 'global');
    return entry.charteredLinks > 0 && scaleOk;
  }
  if (kind === 'feast_embassy') {
    if (typeof entry.stage !== 'number' || typeof entry.needStage !== 'number' || typeof entry.bundle !== 'boolean') return null;
    return entry.stage >= entry.needStage && entry.bundle;
  }
  return null;
}

// recomputeDeliverable(kind, entry): the stored `deliverable`,
// recomputed from the entry's OWN stored fields.
function recomputeDeliverable(kind, entry) {
  if (!entry || typeof entry !== 'object' || entry.error) return null;
  const ready = recomputeReady(kind, entry);
  if (ready === null) return null;
  if (!ready) return false;
  if (kind === 'military_tribute') {
    if (typeof entry.payable !== 'number') return null;
    return entry.payable >= 2;
  }
  return true;
}

// reconcileRow(row): stored-vs-recomputed readiness on EVERY
// snapshot of the row, plus the end table vs the last snapshot.
// Returns mismatch strings (empty = clean).
function reconcileRow(row) {
  const mismatches = [];
  const snaps = row.snapshots || [];
  if (!snaps.length) { mismatches.push('no-snapshots'); return mismatches; }
  for (const s of snaps) {
    if (!s.readiness) { mismatches.push(`day ${s.day}: readiness-null`); continue; }
    for (const kind of CAPSTONE_KINDS) {
      const e = s.readiness[kind];
      if (!e) { mismatches.push(`day ${s.day} ${kind}: entry-missing`); continue; }
      if (e.error) continue; // read errors are counted by coverage/instrument, not reconciled
      const re = recomputeReady(kind, e);
      if (re !== null && !!e.ready !== re) mismatches.push(`day ${s.day} ${kind}: stored-ready=${!!e.ready} recomputed=${re}`);
      const rd = recomputeDeliverable(kind, e);
      if (rd !== null && !!e.deliverable !== rd) mismatches.push(`day ${s.day} ${kind}: stored-deliverable=${!!e.deliverable} recomputed=${rd}`);
    }
  }
  const last = snaps[snaps.length - 1];
  if (row.end && row.end.readiness) {
    if (JSON.stringify(row.end.readiness) !== JSON.stringify(last.readiness)) mismatches.push('row.end.readiness != last-snapshot-readiness');
  } else if (row.end) mismatches.push('row.end.readiness-null');
  if (row.end && row.end.delivered !== last.delivered) mismatches.push(`row.end.delivered=${row.end.delivered} != last-snapshot-delivered=${last.delivered}`);
  if (row.end && row.end.gate && last.gate && JSON.stringify(row.end.gate) !== JSON.stringify(last.gate)) mismatches.push('row.end.gate != last-snapshot-gate');
  return mismatches;
}

function modeReason(snaps, kind) {
  const counts = {};
  for (const s of snaps) {
    const e = s.readiness && s.readiness[kind];
    if (!e) continue;
    const r = e.error ? ('error:' + String(e.error).slice(0, 40)) : (e.reason || 'none');
    counts[r] = (counts[r] || 0) + 1;
  }
  let best = null, bestN = 0;
  for (const [r, n] of Object.entries(counts)) if (n > bestN) { best = r; bestN = n; }
  return { reason: best, days: bestN, counts };
}

function analyzeRow(row) {
  const snaps = row.snapshots || [];
  const last = snaps.length ? snaps[snaps.length - 1] : (row.end || {});
  const aliveDay80 = snaps.some(s => (s.day | 0) >= 80);
  const perKind = {};
  for (const kind of CAPSTONE_KINDS) {
    const readySnaps = snaps.filter(s => s.readiness && s.readiness[kind] && s.readiness[kind].ready);
    const delivSnaps = snaps.filter(s => s.readiness && s.readiness[kind] && s.readiness[kind].deliverable);
    const readyButNotDeliverable = snaps.filter(s => s.readiness && s.readiness[kind] && s.readiness[kind].ready && !s.readiness[kind].deliverable).length;
    const firstReady = readySnaps.length ? readySnaps[0].day : null;
    const firstDeliverable = delivSnaps.length ? delivSnaps[0].day : null;
    const lastEntry = (last.readiness && last.readiness[kind]) || null;
    perKind[kind] = {
      firstReadyDay: firstReady, readyDays: readySnaps.length,
      firstDeliverableDay: firstDeliverable, deliverableDays: delivSnaps.length,
      readyButNotDeliverableDays: readyButNotDeliverable,
      dominantBlocker: modeReason(snaps, kind),
      endReady: lastEntry ? !!lastEntry.ready : null,
      endReason: lastEntry ? (lastEntry.reason || null) : null,
      endEntry: lastEntry,
    };
  }
  const anyReady = CAPSTONE_KINDS.some(k => perKind[k].readyDays > 0);
  const anyDeliverable = CAPSTONE_KINDS.some(k => perKind[k].deliverableDays > 0);
  return {
    seed: row.seed, days: row.days, gameDays: row.gameDays, endReason: row.endReason,
    won: !!row.won, maxRank: row.maxRank, finalRank: row.finalRank,
    table: !!row.table, entered: !!row.entered, arcMax: row.arcMax,
    aliveDay80,
    finalSeat: (row.end && row.end.seat) || 'none',
    finalGateOk: (row.end && row.end.gate) ? !!row.end.gate.ok : null,
    finalLadderPeak: (row.end && typeof row.end.ladderPeak === 'number') ? row.end.ladderPeak : null,
    finalDelivered: (row.end && row.end.delivered) || null,
    deliveryAttempts: (row.deliveryAttempts || []).slice(),
    deliveryOkDays: (row.deliveryAttempts || []).filter(a => a.ok).map(a => a.day),
    paymentVerified: (typeof row.paymentVerified === 'boolean') ? row.paymentVerified : null,
    anyReady, anyDeliverable,
    perKind,
    firstRegionalDay: (row.markers && row.markers.firstRegionalDay) ?? null,
    firstNationalDay: (row.markers && row.markers.firstNationalDay) ?? null,
    firstWaitingDay: row.firstWaitingDay ?? null,
    firstEnteredDay: row.firstEnteredDay ?? null,
    waitingDays: row.waitingDays || 0,
    overtimeEnd: (last && typeof last.overtime === 'number') ? last.overtime : null,
    popEnd: (row.end && typeof row.end.pop === 'number') ? row.end.pop : null,
    gateErrors: row.gateErrors || 0,
    readinessErrors: row.readinessErrors || 0,
    firesideCount: row.firesideCount || 0,
    tableLinesCount: row.tableLinesCount || 0,
    reconciliation: reconcileRow(row),
  };
}

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function judge(analyzed, rows) {
  // Prereg §2 bars (leg-2 amendment).
  const poolAlive80 = analyzed.filter(a => a.aliveDay80).length;
  const poolFloor = poolAlive80 >= 6;
  const totalSnaps = rows.reduce((n, r) => n + ((r.snapshots || []).length), 0);
  const completeSnaps = rows.reduce((n, r) => n + ((r.snapshots || []).filter(s => s.readiness && !s.readinessError).length), 0);
  const coverage = totalSnaps ? completeSnaps / totalSnaps : 0;
  const coverageOk = coverage >= 0.95;
  const mismatches = analyzed.reduce((n, a) => n + a.reconciliation.length, 0);
  const reconciliationOk = mismatches === 0;
  const instrumentErrors = rows.reduce((n, r) => n + ((r.errors || []).length) + (r.gateErrors || 0) + (r.readinessErrors || 0), 0);
  const instrumentOk = instrumentErrors === 0;
  const sniffTable = analyzed.some(a => a.table);
  const sniffRegional = analyzed.some(a => (a.maxRank === 'regional' || a.maxRank === 'national' || a.maxRank === 'global'));
  // Readiness machinery live: every kind returned a well-formed read
  // ({kind, ready boolean, reason string}) on at least one snapshot.
  let sniffReadiness = true;
  const sniffKinds = {};
  for (const kind of CAPSTONE_KINDS) {
    const ok = rows.some(r => (r.snapshots || []).some(s => {
      const e = s.readiness && s.readiness[kind];
      return e && !e.error && typeof e.ready === 'boolean' && typeof e.reason === 'string';
    }));
    sniffKinds[kind] = ok;
    if (!ok) sniffReadiness = false;
  }
  const sniffDelivery = analyzed.some(a => a.finalDelivered === 'military_tribute');
  const sniffOk = sniffTable && sniffRegional && sniffReadiness && sniffDelivery;
  // DELIVERY (amendment §2 (a)–(c)): the verb must fire exactly where
  // leg 1 said it could. Predicted from leg 1's firstDeliverableDay:
  // 113302 day 83, 113305 day 140 — and nowhere else.
  const PREDICTED = { 113302: 83, 113305: 140 };
  const deliveryDetail = { predicted: PREDICTED, hits: [], misses: [], extraAttempts: [], halfPayments: [] };
  for (const a of analyzed) {
    const okDays = a.deliveryOkDays || [];
    const attempts = a.deliveryAttempts || [];
    if (PREDICTED[a.seed] !== undefined) {
      if (okDays.includes(PREDICTED[a.seed]) && a.finalDelivered === 'military_tribute') deliveryDetail.hits.push(a.seed);
      else deliveryDetail.misses.push({ seed: a.seed, expectedDay: PREDICTED[a.seed], okDays, delivered: a.finalDelivered });
    }
    for (const at of attempts) {
      const expectedDay = PREDICTED[a.seed];
      if (!(expectedDay !== undefined && at.day === expectedDay && at.ok)) {
        deliveryDetail.extraAttempts.push({ seed: a.seed, day: at.day, ok: at.ok, reason: at.reason });
      }
    }
    if (a.finalDelivered && a.paymentVerified !== true) deliveryDetail.halfPayments.push({ seed: a.seed, paymentVerified: a.paymentVerified });
  }
  const deliveryOk = deliveryDetail.hits.length === Object.keys(PREDICTED).length
    && deliveryDetail.misses.length === 0
    && deliveryDetail.extraAttempts.length === 0
    && deliveryDetail.halfPayments.length === 0;
  const go = poolFloor && coverageOk && reconciliationOk && instrumentOk && deliveryOk;
  let kind = 'DIAG-GO';
  if (!go) {
    if (!deliveryOk) kind = 'DIAG-NO-GO MECHANISM';
    else if (!poolFloor) kind = 'DIAG-NO-GO THIN-POOL';
    else if (!coverageOk || !reconciliationOk) kind = 'DIAG-NO-GO ATTRIBUTION';
    else kind = 'DIAG-NO-GO INSTRUMENT';
  }
  if (go && !sniffOk) kind = 'DIAG-NO-GO THIN-POOL';
  return {
    verdict: kind, go,
    pool: { aliveDay80: poolAlive80, of: analyzed.length, floor: 6, pass: poolFloor },
    coverage: { complete: completeSnaps, total: totalSnaps, ratio: totalSnaps ? +(completeSnaps / totalSnaps).toFixed(4) : 0, pass: coverageOk },
    reconciliation: { mismatches, pass: reconciliationOk },
    instrument: { errors: instrumentErrors, pass: instrumentOk },
    delivery: Object.assign({ pass: deliveryOk }, deliveryDetail),
    sniff: { tableWaitingAny: sniffTable, regionalAny: sniffRegional, readinessLive: sniffReadiness, readinessKinds: sniffKinds, deliveryAny: sniffDelivery, pass: sniffOk },
  };
}

function analyze(outdir, seeds) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const p = path.join(outdir, `s${seed}.json`);
    if (!fs.existsSync(p)) { missing.push(seed); continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  if (missing.length) return { error: `missing rows: ${missing.join(',')}`, rows: [], analyzed: [] };
  const analyzed = rows.map(analyzeRow);
  const verdict = judge(analyzed, rows);
  // Pooled readiness finding: the separation, in numbers.
  const perKindPool = {};
  for (const kind of CAPSTONE_KINDS) {
    perKindPool[kind] = {
      seedsEverReady: analyzed.filter(a => a.perKind[kind].readyDays > 0).length,
      seedsEverDeliverable: analyzed.filter(a => a.perKind[kind].deliverableDays > 0).length,
      totalReadyDays: analyzed.reduce((n, a) => n + a.perKind[kind].readyDays, 0),
      totalDeliverableDays: analyzed.reduce((n, a) => n + a.perKind[kind].deliverableDays, 0),
      totalReadyButNotDeliverableDays: analyzed.reduce((n, a) => n + a.perKind[kind].readyButNotDeliverableDays, 0),
      firstReadyDays: analyzed.map(a => a.perKind[kind].firstReadyDay).filter(d => d !== null),
      firstDeliverableDays: analyzed.map(a => a.perKind[kind].firstDeliverableDay).filter(d => d !== null),
    };
  }
  const seated = analyzed.filter(a => a.entered).length;
  const national = analyzed.filter(a => (a.maxRank === 'national' || a.maxRank === 'global')).length;
  const regional = analyzed.filter(a => (a.maxRank === 'regional' || a.maxRank === 'national' || a.maxRank === 'global')).length;
  const firstNationalDays = analyzed.map(a => a.firstNationalDay).filter(d => d !== null && d !== undefined);
  const wall = {
    seeds: analyzed.length, wins: analyzed.filter(a => a.won).length,
    national, regional, table: analyzed.filter(a => a.table).length,
    seated, entered: seated,
    medianSurvival: medianOf(analyzed.map(a => a.days)),
    medianFirstNationalDay: medianOf(firstNationalDays),
    anyReadySeeds: analyzed.filter(a => a.anyReady).length,
    anyDeliverableSeeds: analyzed.filter(a => a.anyDeliverable).length,
    deliveredSeeds: analyzed.filter(a => a.finalDelivered).length,
    deliveryAttempts: analyzed.reduce((n, a) => n + (a.deliveryAttempts || []).length, 0),
    deliveryOkSeeds: analyzed.filter(a => (a.deliveryOkDays || []).length > 0).map(a => a.seed),
    deliveryOkDays: analyzed.flatMap(a => (a.deliveryOkDays || []).map(d => ({ seed: a.seed, day: d }))),
    paymentVerifiedSeeds: analyzed.filter(a => a.paymentVerified === true).map(a => a.seed),
    perKind: perKindPool,
    deathCauseShares: null, // NOT instrumented by this driver — reported null, never faked.
  };
  return { verdict, wall, analyzed, rows };
}

function selftest() {
  let passed = 0, failed = 0;
  const fails = [];
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS ' + name); }
    else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  // Synthetic readiness entries (clearly fixtures).
  const tribReady = { kind: 'military_tribute', ready: true, reason: 'ready', veterans: 2, payable: 2, need: 2, deliverable: true };
  const tribSplit = { kind: 'military_tribute', ready: true, reason: 'ready', veterans: 2, payable: 1, need: 2, deliverable: false };
  const tribShort = { kind: 'military_tribute', ready: false, reason: 'veterans-short', veterans: 1, payable: 1, need: 2, deliverable: false };
  const chartReady = { kind: 'trade_charter', ready: true, reason: 'ready', charteredLinks: 1, scale: 'national', deliverable: true };
  const chartNoSeal = { kind: 'trade_charter', ready: false, reason: 'no-sealed-charter', charteredLinks: 0, scale: 'village', deliverable: false };
  const chartScaleShort = { kind: 'trade_charter', ready: false, reason: 'scale-short', charteredLinks: 1, scale: 'regional', deliverable: false };
  const feastReady = { kind: 'feast_embassy', ready: true, reason: 'ready', stage: 3, needStage: 3, bundle: true, deliverable: true };
  const feastNoBundle = { kind: 'feast_embassy', ready: false, reason: 'no-bundle-feast', stage: 3, needStage: 3, bundle: false, deliverable: false };
  const feastStageShort = { kind: 'feast_embassy', ready: false, reason: 'stage-short', stage: 2, needStage: 3, bundle: true, deliverable: false };
  const delivered = { kind: 'military_tribute', ready: false, reason: 'delivered', delivered: 'military_tribute', veterans: 2, payable: 2, need: 2, deliverable: false };

  check('tribute ready recomputes true', recomputeReady('military_tribute', tribReady) === true);
  check('tribute split recomputes ready true', recomputeReady('military_tribute', tribSplit) === true);
  check('tribute split deliverable recomputes false (payable 1)', recomputeDeliverable('military_tribute', tribSplit) === false);
  check('tribute ready deliverable recomputes true', recomputeDeliverable('military_tribute', tribReady) === true);
  check('tribute short recomputes false', recomputeReady('military_tribute', tribShort) === false);
  check('charter ready recomputes true', recomputeReady('trade_charter', chartReady) === true);
  check('charter no-seal recomputes false', recomputeReady('trade_charter', chartNoSeal) === false);
  check('charter scale-short recomputes false', recomputeReady('trade_charter', chartScaleShort) === false);
  check('feast ready recomputes true', recomputeReady('feast_embassy', feastReady) === true);
  check('feast no-bundle recomputes false', recomputeReady('feast_embassy', feastNoBundle) === false);
  check('feast stage-short recomputes false', recomputeReady('feast_embassy', feastStageShort) === false);
  check('delivered recomputes ready false', recomputeReady('military_tribute', delivered) === false);
  check('delivered recomputes deliverable false', recomputeDeliverable('military_tribute', delivered) === false);
  check('error entry recomputes null', recomputeReady('military_tribute', { kind: 'military_tribute', error: 'boom' }) === null);
  check('mismatched stored ready is caught', recomputeReady('military_tribute', Object.assign({}, tribReady, { ready: false })) === true);

  // reconcileRow on a synthetic row: all-ready series, then a corrupted one.
  const mkSnap = (day, readiness) => ({ day, rank: 'regional', arc: 4, tableWaiting: true, tableDone: false, tableAnnounced: true, stage: 2, pop: 12, pantry: 10000, pantrySrc: 'pantryKcalLive', waitingDays: 1, gate: null, gateError: null, seat: 'lesser', ladderPeak: 1, capstone: null, overtime: 0, readiness, readinessError: null, delivered: null });
  const goodRow = {
    seed: 113301, days: 150, gameDays: 150, endReason: 'horizon', won: false, maxRank: 'regional', finalRank: 'regional',
    table: true, entered: false, arcMax: 4, firstWaitingDay: 95, firstEnteredDay: null, waitingDays: 10,
    gateErrors: 0, readinessErrors: 0, errors: [],
    markers: { firstRegionalDay: 60, firstNationalDay: null, firstLesserDay: null, firstFullDay: null, firstOvertimeDay: null },
    end: { rank: 'regional', pop: 12, pantry: 10000, pantrySrc: 'pantryKcalLive', stage: 2, gate: null, seat: 'lesser', ladderPeak: 1, capstone: null, overtime: 0, readiness: { military_tribute: tribReady, trade_charter: chartNoSeal, feast_embassy: feastNoBundle }, delivered: null },
    snapshots: [
      mkSnap(80, { military_tribute: tribShort, trade_charter: chartNoSeal, feast_embassy: feastNoBundle }),
      mkSnap(90, { military_tribute: tribReady, trade_charter: chartNoSeal, feast_embassy: feastNoBundle }),
    ],
    fireside: [], firesideCount: 0, tableLines: [], tableLinesCount: 0, captureCount: 0, error: null,
  };
  // End readiness must equal the last snapshot's readiness.
  goodRow.end.readiness = goodRow.snapshots[1].readiness;
  check('reconcile clean row empty', reconcileRow(goodRow).length === 0, JSON.stringify(reconcileRow(goodRow)));
  const badRow = JSON.parse(JSON.stringify(goodRow));
  badRow.snapshots[1].readiness.military_tribute = Object.assign({}, tribReady, { ready: false });
  const badRec = reconcileRow(badRow);
  check('reconcile catches stored/recomputed mismatch', badRec.length > 0, JSON.stringify(badRec));
  const an = analyzeRow(goodRow);
  check('analyzeRow tribute firstReadyDay = 90', an.perKind.military_tribute.firstReadyDay === 90);
  check('analyzeRow tribute readyDays = 1', an.perKind.military_tribute.readyDays === 1);
  check('analyzeRow tribute deliverableDays = 1', an.perKind.military_tribute.deliverableDays === 1);
  check('analyzeRow charter never ready', an.perKind.trade_charter.firstReadyDay === null && an.perKind.trade_charter.readyDays === 0);
  check('analyzeRow anyReady true', an.anyReady === true);
  check('analyzeRow dominant blocker tribute = veterans-short', an.perKind.military_tribute.dominantBlocker.reason === 'veterans-short');
  check('analyzeRow dominant blocker charter = no-sealed-charter', an.perKind.trade_charter.dominantBlocker.reason === 'no-sealed-charter');

  // Split fixture: ready but never deliverable.
  const splitRow = JSON.parse(JSON.stringify(goodRow));
  splitRow.snapshots[1].readiness.military_tribute = tribSplit;
  splitRow.end.readiness = splitRow.snapshots[1].readiness;
  const anSplit = analyzeRow(splitRow);
  check('split row: tribute readyDays 1, deliverableDays 0', anSplit.perKind.military_tribute.readyDays === 1 && anSplit.perKind.military_tribute.deliverableDays === 0);
  check('split row: readyButNotDeliverableDays 1', anSplit.perKind.military_tribute.readyButNotDeliverableDays === 1);

  // Judge shapes. The good corpus carries the predicted deliveries:
  // 113302 day 83 and 113305 day 140, both ok, payment verified; no
  // attempts anywhere else (the fixture rows are synthetic).
  const PREDICTED_DAYS = { 113302: 83, 113305: 140 };
  const mkJudgedRow = (seed, alive80, complete) => {
    const r = JSON.parse(JSON.stringify(goodRow));
    r.seed = seed;
    r.snapshots = r.snapshots.map(s => Object.assign({}, s, { day: alive80 ? s.day : 40 }));
    if (!complete) { r.snapshots[0].readiness = null; r.snapshots[0].readinessError = 'readiness-error:military_tribute'; r.readinessErrors = 1; }
    if (PREDICTED_DAYS[seed] !== undefined) {
      r.deliveryAttempts = [{ day: PREDICTED_DAYS[seed], kind: 'military_tribute', ok: true, reason: 'delivered', veterans: ['vA', 'vB'], names: ['A', 'B'] }];
      r.deliveredDay = PREDICTED_DAYS[seed];
      r.paymentVerified = true;
      r.end.delivered = 'military_tribute';
      // The closing snapshot is read after runDays, so its delivered
      // agrees with end.delivered (same object, one read — the
      // driver's closing-snapshot rule).
      r.snapshots[r.snapshots.length - 1].delivered = 'military_tribute';
    } else {
      r.deliveryAttempts = [];
      r.deliveredDay = null;
      r.paymentVerified = null;
      r.end.delivered = null;
    }
    return r;
  };
  const goodRows = SEEDS.map(s => mkJudgedRow(s, true, true));
  const jGood = judge(goodRows.map(analyzeRow), goodRows);
  check('judge GO on clean corpus', jGood.verdict === 'DIAG-GO', jGood.verdict);
  check('judge delivery hits both predicted seeds', JSON.stringify(jGood.delivery.hits) === JSON.stringify([113302, 113305]), JSON.stringify(jGood.delivery));
  const thinRows = SEEDS.map((s, i) => mkJudgedRow(s, i < 2, true));
  const jThin = judge(thinRows.map(analyzeRow), thinRows);
  check('judge THIN-POOL when <6 alive day 80', jThin.verdict === 'DIAG-NO-GO THIN-POOL', jThin.verdict);
  const badCovRows = goodRows.map(r => mkJudgedRow(r.seed, true, false));
  const jAttr = judge(badCovRows.map(analyzeRow), badCovRows);
  check('judge ATTRIBUTION on coverage miss', jAttr.verdict === 'DIAG-NO-GO ATTRIBUTION', jAttr.verdict);
  // MECHANISM shapes: a missed predicted delivery, and an extra attempt.
  const missedRows = goodRows.map(r => {
    const c = mkJudgedRow(r.seed, true, true);
    if (c.seed === 113305) { c.deliveryAttempts = []; c.deliveredDay = null; c.paymentVerified = null; c.end.delivered = null; }
    return c;
  });
  const jMechMiss = judge(missedRows.map(analyzeRow), missedRows);
  check('judge MECHANISM on missed predicted delivery', jMechMiss.verdict === 'DIAG-NO-GO MECHANISM', jMechMiss.verdict);
  const extraRows = goodRows.map(r => {
    const c = mkJudgedRow(r.seed, true, true);
    if (c.seed === 113301) c.deliveryAttempts = [{ day: 94, kind: 'military_tribute', ok: true, reason: 'delivered', veterans: ['vA', 'vB'], names: ['A', 'B'] }];
    return c;
  });
  const jMechExtra = judge(extraRows.map(analyzeRow), extraRows);
  check('judge MECHANISM on extra attempt (split seed)', jMechExtra.verdict === 'DIAG-NO-GO MECHANISM', jMechExtra.verdict);
  const halfRows = goodRows.map(r => {
    const c = mkJudgedRow(r.seed, true, true);
    if (c.seed === 113302) c.paymentVerified = false;
    return c;
  });
  const jMechHalf = judge(halfRows.map(analyzeRow), halfRows);
  check('judge MECHANISM on half-payment', jMechHalf.verdict === 'DIAG-NO-GO MECHANISM', jMechHalf.verdict);

  console.log(`SELFTEST: ${passed} passed, ${failed} failed`);
  if (failed) { console.log('FAILURES: ' + fails.join('; ')); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) { selftest(); return; }
  const outdirIdx = args.indexOf('--outdir');
  const outdir = outdirIdx >= 0 ? args[outdirIdx + 1] : OUTDIR;
  const res = analyze(outdir, SEEDS);
  if (res.error) { console.error('ANALYZE FAILED: ' + res.error); process.exit(1); }
  const out = { verdict: res.verdict, wall: res.wall, perSeed: res.analyzed };
  console.log(JSON.stringify(out, null, 1));
  if (!res.verdict.go) { console.error('VERDICT: ' + res.verdict.verdict); process.exit(1); }
  console.log('VERDICT: ' + res.verdict.verdict);
}
if (require.main === module) main().catch(e => { console.error('ANALYZE FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { recomputeReady, recomputeDeliverable, reconcileRow, analyzeRow, judge, analyze, CAPSTONE_KINDS };
