#!/usr/bin/env node
// awaynaming-compare-rereg-a.js — before/after comparison for sim-awaynaming-rereg-a.
// REBUILT for the r141-relay substrate (not a copy of the abandoned
// gossipfix compare: the relay already gates stranded delivery and DROPS
// lines, so conservation is judged against the KICK LEDGER, not against
// the lossy before-leg totals). Prereg Correction 1 of the cap-a run
// (2026-11-05, after the pilot, before the confirm) replaced the (ii-b)
// position/DH-excess method with a queue-snapshot method: on the relay
// substrate the position method counts held ~= 0 (the relay never says
// a line while away) and the DH-excess method undercounts delivered
// (before-leg flushes land in harness phase on the return day). The
// corrected (ii-b) reads held volume from the live awayNaming snapshots
// and takes the ledger as the conservation judge; the superseded counts
// are retained as diagnostics. GUARDRAIL (i) RE-REGISTERED for this
// run (rereg prereg, 2026-11-05, per the 2115Z metric review): silencing
// is judged by the ledger — said_after == kicked, exact, per kind per
// seed (the (ii-a) identity) — and the non-stranded sleep burst rate is
// a DESCRIPTIVE phase-shift report only, no band, not a GO/NO-GO check.
// The old ±3pp sleep-rate band measured the designed sleep→daily phase
// shift, not silencing (2115Z: Δ −3.68pp, totals rose 2103 vs 2095).
// Reads the BEFORE corpus (fresh pre-fix baseline,
// sim-awaynaming-rereg-a-baseline — the relay's behavior on current
// master) and the AFTER corpus (sim-awaynaming-rereg-a-corpus, fixed
// code, uncapped awayNaming queue) and judges the prereg
// (evidence/2026-11-05/sim-awaynaming-rereg-a-prereg.md). Reads ONLY;
// judges nothing by re-running. Usage:
//   node scripts/awaynaming-compare-rereg-a.js [--before <dir>] [--after <dir>]
//   [--out <prefix>] [--pilot-only]
// Defaults: before=evidence/2026-11-05/sim-awaynaming-rereg-a-baseline,
// after=evidence/2026-11-05/sim-awaynaming-rereg-a-corpus,
// out=evidence/2026-11-05/awaynaming-rereg-compare (writes .md + .json).
// Exit 0 iff the prereg's GO criteria hold on the seeds present
// (pilot-only judges the pilot subset); exit 1 otherwise, exit 2 on
// missing/corrupt input. The .md always prints the full per-seed and
// per-stretch tables so a NO-GO is auditable.
'use strict';
const fs = require('fs');
const path = require('path');

const BEFORE_DIR = process.env.BEFORE_DIR
  || path.join(__dirname, '..', 'evidence', '2026-11-05', 'sim-awaynaming-rereg-a-baseline');
const AFTER_DIR = process.env.AFTER_DIR
  || path.join(__dirname, '..', 'evidence', '2026-11-05', 'sim-awaynaming-rereg-a-corpus');
const PILOT_SEEDS = [17021, 15003, 15009, 15091, 15211, 15215, 15220, 15221];
const KINDS = ['word', 'debate', 'settle'];

function loadDir(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter((x) => /^gossipcensus-s\d+\.json$/.test(x))) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[c.seed] = c;
  }
  return out;
}
function rate(n, d) { return d ? (100 * n / d) : null; }
function fmtRate(n, d) { return d ? (100 * n / d).toFixed(1) + '%' : 'n/a'; }
function normKind(k) { return k === 'settled' ? 'settle' : k; }
function manhattan(ax, ay, bx, by) { return Math.abs(ax - bx) + Math.abs(ay - by); }

// AWAY per the prereg: position.inside !== true AND Manhattan distance
// from (mx,my) to BOTH haven tiles (4,7) and (4,4) > 1. Null coords fall
// back to the inside flag alone. Null position -> 'unknown'.
function classifyPosition(pos) {
  if (!pos) return 'unknown';
  if (pos.inside === true) return 'haven';
  if (typeof pos.mx === 'number' && typeof pos.my === 'number') {
    if (manhattan(pos.mx, pos.my, 4, 4) <= 1 || manhattan(pos.mx, pos.my, 4, 7) <= 1) return 'haven';
    return 'away';
  }
  return pos.inside === false ? 'away' : 'unknown';
}

function ledgerCounts(corpus) {
  const ledger = corpus.namingLedger || null;
  if (!ledger) return null;
  const kicked = { word: 0, debate: 0, settle: 0 };
  for (const e of ledger) {
    if (e.namingKicked) {
      kicked.word++;
      if ((e.proposalCount || 0) >= 1) kicked.debate++;
    }
    if (e.villageName) kicked.settle++;
  }
  return kicked;
}
function saidCounts(corpus) {
  const a = corpus.analysis || {};
  const c = { word: 0, debate: 0, settle: 0 };
  for (const l of (a.allBursts || [])) { if (l.kind === 'word') c.word++; else if (l.kind === 'debate') c.debate++; }
  c.settle = (a.allSettles || []).length;
  return c;
}
function heldEndCounts(corpus, queueName) {
  const q = ((corpus.endQueues || {})[queueName]) || [];
  const c = { word: 0, debate: 0, settle: 0 };
  for (const h of q) { const k = normKind(h.kind); if (c[k] !== undefined) c[k]++; }
  return c;
}
// Daily/harness-phase lines of one kind on one loop-day.
function dhCount(corpus, kind, loopDay) {
  const a = corpus.analysis || {};
  let n = 0;
  const list = kind === 'settle' ? (a.allSettles || []) : (a.allBursts || []);
  for (const l of list) {
    if (kind !== 'settle' && l.kind !== kind) continue;
    if (l.loopDay === loopDay && (l.phase === 'daily' || l.phase === 'harness')) n++;
  }
  return n;
}
// Daily/harness-phase lines of one kind on one loop-day with AT-HAVEN
// fire-time position (used only for the (ii-b) diagnostic cross-check).
function dhHavenCount(corpus, kind, loopDay) {
  const a = corpus.analysis || {};
  let n = 0;
  const list = kind === 'settle' ? (a.allSettles || []) : (a.allBursts || []);
  for (const l of list) {
    if (kind !== 'settle' && l.kind !== kind) continue;
    if (l.loopDay === loopDay && (l.phase === 'daily' || l.phase === 'harness')
      && classifyPosition(l.position) === 'haven') n++;
  }
  return n;
}

// Away stretches from evening rows: maximal runs of consecutive
// loopDays with inside !== true. Returns [{days:[...], returnDay|null}].
function awayStretches(corpus) {
  const rows = (corpus.evenings || []).slice().sort((x, y) => x.loopDay - y.loopDay);
  const byDay = new Map(rows.map((r) => [r.loopDay, r]));
  const stretches = [];
  let cur = null;
  for (const r of rows) {
    const away = r.inside !== true;
    if (away) {
      if (cur && r.loopDay === cur.days[cur.days.length - 1] + 1) cur.days.push(r.loopDay);
      else { cur = { days: [r.loopDay] }; stretches.push(cur); }
    } else cur = null;
  }
  for (const s of stretches) {
    const last = s.days[s.days.length - 1];
    let ret = null;
    for (let d = last + 1; ; d++) {
      const row = byDay.get(d);
      if (!row) break;
      if (row.inside === true) { ret = d; break; }
    }
    s.returnDay = ret;
  }
  return stretches;
}

// Queue-depth snapshot sequence for one leg: [{loopDay, part, len}]
// ordered morning-before-evening per loopDay.
function queueSnapshots(corpus, field) {
  const snaps = [];
  for (const m of (corpus.mornings || [])) {
    if (typeof m[field] === 'number') snaps.push({ loopDay: m.loopDay, part: 'morning', len: m[field] });
  }
  for (const e of (corpus.evenings || [])) {
    if (typeof e[field] === 'number') snaps.push({ loopDay: e.loopDay, part: 'evening', len: e[field] });
  }
  snaps.sort((x, y) => x.loopDay - y.loopDay || (x.part === 'morning' ? -1 : 1));
  return snaps;
}

function main() {
  const args = process.argv.slice(2);
  const pilotOnly = args.includes('--pilot-only');
  const outIdx = args.indexOf('--out');
  const outPrefix = outIdx >= 0 ? args[outIdx + 1]
    : path.join(__dirname, '..', 'evidence', '2026-11-05', 'awaynaming-rereg-compare');
  const before = loadDir(BEFORE_DIR);
  const after = loadDir(AFTER_DIR);
  const afterSeeds = Object.keys(after).map(Number).sort((a, b) => a - b);
  const judged = pilotOnly ? PILOT_SEEDS.filter((s) => after[s]) : afterSeeds;
  if (!judged.length) { console.error('AWAYNAMING-COMPARE: no after-corpus files in ' + AFTER_DIR); process.exit(2); }
  const missingBefore = judged.filter((s) => !before[s]);
  if (missingBefore.length) { console.error('AWAYNAMING-COMPARE: missing before-corpus seeds: ' + missingBefore.join(',')); process.exit(2); }

  const rows = [];
  const stretchRows = [];
  const ledgerFail = [];
  const reconFail = [];
  const stretchFail = [];
  const artifacts = [];
  const trajMismatch = [];
  let bSSW = 0, bSSE = 0, bSUW = 0, bSUE = 0, bNSSW = 0, bNSSE = 0, bSSSettle = 0;
  let aSSW = 0, aSSE = 0, aSUW = 0, aSUE = 0, aNSSW = 0, aNSSE = 0, aSSSettle = 0;
  let relayDroppedTotal = { word: 0, debate: 0, settle: 0 };
  let myLostTotal = { word: 0, debate: 0, settle: 0 };
  let unknownPositions = 0;

  for (const seed of judged) {
    const b = before[seed], a = after[seed];
    const ba = b.analysis, aa = a.analysis;
    if (!b.namingLedger || !a.namingLedger || !b.endQueues || !a.endQueues) {
      console.error('AWAYNAMING-COMPARE: seed ' + seed + ' corpus lacks namingLedger/endQueues — rerun the driver');
      process.exit(2);
    }
    bSSW += ba.strandedSleepWindows; bSSE += ba.strandedSleepEvents;
    bSUW += ba.strandedUpkeepWindows; bSUE += ba.strandedUpkeepEvents;
    bNSSW += ba.nonStranded.sleepWindows; bNSSE += ba.nonStranded.sleepEvents;
    aSSW += aa.strandedSleepWindows; aSSE += aa.strandedSleepEvents;
    aSUW += aa.strandedUpkeepWindows; aSUE += aa.strandedUpkeepEvents;
    aNSSW += aa.nonStranded.sleepWindows; aNSSE += aa.nonStranded.sleepEvents;
    const bSettleStranded = (ba.stranded || []).reduce((t, s) => t + ((s.sleepWindow || {}).settleLines || 0), 0)
      + (ba.mornings || []).reduce((t, m) => t + ((m.upkeepWindow || {}).settleLines || 0), 0);
    const aSettleStranded = (aa.stranded || []).reduce((t, s) => t + ((s.sleepWindow || {}).settleLines || 0), 0)
      + (aa.mornings || []).reduce((t, m) => t + ((m.upkeepWindow || {}).settleLines || 0), 0);
    bSSSettle += bSettleStranded; aSSSettle += aSettleStranded;

    // Validation: every line in a stranded sleep/upkeep window must
    // classify AWAY (the gossipfix gate-definition coincidence).
    let strandedPosViolations = 0;
    for (const s of (ba.stranded || [])) {
      for (const h of ((s.sleepWindow || {}).hits || [])) {
        if (classifyPosition(h.position) !== 'away') strandedPosViolations++;
      }
    }
    for (const m of (ba.mornings || [])) {
      for (const h of ((m.upkeepWindow || {}).hits || [])) {
        if (classifyPosition(h.position) !== 'away') strandedPosViolations++;
      }
    }

    // (iii-b) trajectory identity.
    const trajSame = b.daysAlive === a.daysAlive
      && b.endReason === a.endReason
      && (ba.stranded || []).length === (aa.stranded || []).length
      && ba.strandedSleepWindows === aa.strandedSleepWindows
      && ba.nonStranded.sleepWindows === aa.nonStranded.sleepWindows;
    if (!trajSame) {
      trajMismatch.push({ seed,
        before: [b.daysAlive, b.endReason, (ba.stranded || []).length, ba.strandedSleepWindows, ba.nonStranded.sleepWindows],
        after: [a.daysAlive, a.endReason, (aa.stranded || []).length, aa.strandedSleepWindows, aa.nonStranded.sleepWindows] });
    }

    // (ii-a) ledger conservation + (ii-c) reconciliation, per kind.
    const kicked = ledgerCounts(a); // ledger is trajectory-identical; use after (== before when traj holds)
    const kickedB = ledgerCounts(b);
    const saidB = saidCounts(b), saidA = saidCounts(a);
    const heldB = heldEndCounts(b, 'pendingHavenNews');
    const heldA = heldEndCounts(a, 'awayNaming');
    const ledgerRow = { seed, kicked, saidB, saidA, heldB, heldA, relayDropped: {}, myLost: {}, recon: {} };
    for (const k of KINDS) {
      const rd = kickedB[k] - saidB[k] - heldB[k];
      const ml = kicked[k] - saidA[k] - heldA[k];
      ledgerRow.relayDropped[k] = rd;
      ledgerRow.myLost[k] = ml;
      relayDroppedTotal[k] += rd;
      myLostTotal[k] += ml;
      const recon = (saidA[k] - saidB[k]) - (rd + heldB[k] - heldA[k]);
      ledgerRow.recon[k] = recon;
      if (ml !== 0) ledgerFail.push({ seed, kind: k, kicked: kicked[k], said: saidA[k], held: heldA[k], lost: ml });
      if (recon !== 0) reconFail.push({ seed, kind: k, recon });
      if (rd < 0 || heldB[k] < 0 || heldA[k] < 0) ledgerFail.push({ seed, kind: k, note: 'negative ledger term', kicked: kicked[k], saidB: saidB[k], heldB: heldB[k], saidA: saidA[k], heldA: heldA[k] });
    }
    if (JSON.stringify(kicked) !== JSON.stringify(kickedB)) {
      ledgerFail.push({ seed, note: 'ledger differs before/after (trajectory divergence?)', kickedBefore: kickedB, kickedAfter: kicked });
    }

    // (ii-b) held-volume accounting per away stretch — CORRECTED
    // METHOD (prereg Correction 1, 2026-11-05). The preregistered
    // position/DH-excess method is broken on the relay substrate:
    // on the before leg no burst/settle line is ever SAID while
    // away (the relay holds everything away-fired), so the
    // position method counts held ~= 0, and the DH-excess method
    // undercounts delivered because before-leg relay flushes land
    // in HARNESS phase on the return day, not sleep phase (pilot
    // seed 15221: position held 0/0/0 vs live queue 7 held;
    // DH excess delivered 2 vs 7 actually delivered). The
    // corrected method uses the live queue snapshots as the held
    // measure and the ledger (ii-a) as the conservation judge.
    // Stretches come from the BEFORE corpus's evening rows;
    // trajectories identical so the after corpus has the same
    // stretches — assert it.
    const stretchesB = awayStretches(b);
    const stretchesA = awayStretches(a);
    if (JSON.stringify(stretchesB.map((s) => s.days)) !== JSON.stringify(stretchesA.map((s) => s.days))) {
      stretchFail.push({ seed, note: 'away stretches differ before/after', before: stretchesB, after: stretchesA });
    }
    const snapsA = queueSnapshots(a, 'awayNamingLen');
    const snapsB = queueSnapshots(b, 'pendingHavenNewsLen');
    const snapAt = (snaps, loopDay, part) => {
      const hit = snaps.find((x) => x.loopDay === loopDay && x.part === part);
      return hit ? hit.len : null;
    };
    for (const s of stretchesB) {
      const daysSet = new Set([...s.days, ...(s.returnDay ? [s.returnDay] : [])]);
      // DIAGNOSTIC (superseded judge): position-based held — the
      // preregistered method. On the relay substrate this is
      // expected to be ~0: it confirms the relay held everything
      // away-fired, it does not measure held volume.
      const posHeld = { word: 0, debate: 0, settle: 0 };
      let unknown = 0;
      const countLine = (l) => {
        if (!daysSet.has(l.loopDay)) return;
        const cls = classifyPosition(l.position);
        if (cls === 'unknown') { unknown++; return; }
        if (cls !== 'away') return;
        if (l.kind === 'word') posHeld.word++;
        else if (l.kind === 'debate') posHeld.debate++;
        else if (l.kind === 'settle') posHeld.settle++;
      };
      for (const l of (ba.allBursts || [])) countLine(l);
      for (const l of (ba.allSettles || [])) countLine({ ...l, kind: 'settle' });
      unknownPositions += unknown;
      // DIAGNOSTIC (superseded judge): DH-excess delivered — the
      // preregistered method. Expected to undercount when
      // before-leg flushes land in harness phase on the return day.
      const dhExcess = { word: 0, debate: 0, settle: 0 };
      for (const d of daysSet) {
        for (const k of KINDS) dhExcess[k] += dhCount(a, k, d) - dhCount(b, k, d);
      }
      // JUDGED (corrected method): queue snapshots on the after leg.
      // The queue only grows on holdNamingNews and only shrinks on
      // deliverHeldNamingNews (full drain at a return), so the
      // snapshot sequence across the stretch days shows the held
      // volume directly: held = depth at the last evening of the
      // stretch (qEnd) + the sum of observed mid-stretch drops
      // (each drop = lines delivered at a mid-stretch return).
      // held is a TOTAL (snapshots carry no kinds); per-kind
      // conservation is the ledger's job (ii-a).
      const span = snapsA.filter((x) => s.days.includes(x.loopDay));
      const qMax = span.length ? Math.max(...span.map((x) => x.len)) : 0;
      const lastEvening = span.filter((x) => x.part === 'evening').pop();
      const qEnd = lastEvening ? lastEvening.len : 0;
      let drops = 0;
      let drained = false;
      for (let i = 1; i < span.length; i++) {
        if (span[i].len < span[i - 1].len) { drained = true; drops += span[i - 1].len - span[i].len; }
      }
      const heldQ = qEnd + drops;
      // Drain evidence at the return: queue depth at the morning of
      // the return day (before the return step) vs the evening of
      // the return day (after it). A non-terminal stretch drains
      // fully at the return (returnToVillage splices the whole
      // queue — unit-proven in scripts/test-awaynaming-cap-a.js),
      // so stillHeld = 0 and delivered = held. A terminal stretch
      // has no return: delivered = mid-stretch drops only,
      // stillHeld = qEnd, lost = qEnd (NO-GO if > 0).
      const morningR = s.returnDay === null ? null : snapAt(snapsA, s.returnDay, 'morning');
      const eveningR = s.returnDay === null ? null : snapAt(snapsA, s.returnDay, 'evening');
      const drainEvidenced = s.returnDay === null ? null
        : (heldQ === 0 ? true
          : (morningR !== null && eveningR !== null && eveningR < morningR));
      const terminal = s.returnDay === null;
      const deliveredQ = terminal ? drops : heldQ;
      const lostQ = heldQ - deliveredQ; // == qEnd for terminal, 0 otherwise
      const row = { seed, stretch: s.days, returnDay: s.returnDay,
        held: heldQ, delivered: deliveredQ, lost: lostQ,
        qMax, qEnd, drops, drained, morningR, eveningR, drainEvidenced,
        posHeld, dhExcess, unknown };
      stretchRows.push(row);
      if (!drainEvidenced && !terminal && heldQ > 0) {
        artifacts.push({ seed, stretch: s.days, returnDay: s.returnDay,
          held: heldQ, qMax, qEnd, morningR, eveningR,
          note: 'drain at the return not snapshot-evidenced (evening-R depth did not fall below morning-R depth — the scholar may have returned and left again the same day, accruing new holds). Ledger (ii-a) is the conservation judge; investigate in the evidence file.' });
      }
      if (lostQ > 0) {
        stretchFail.push({ seed, stretch: s.days, returnDay: s.returnDay,
          held: heldQ, delivered: deliveredQ, lost: lostQ,
          qMax, qEnd, note: 'TERMINAL stretch holds lines that can never be delivered (delivery lives inside returnToVillage !over && !estranged)' });
      }
    }
    // Terminal-stretch consistency: if a terminal stretch exists,
    // every line still held at end of run must have come from it
    // (non-terminal stretches always drain). Compare its qEnd to
    // the total endQueues awayNaming count.
    const terminalStretch = stretchesB.find((s) => s.returnDay === null);
    if (terminalStretch) {
      const tRow = stretchRows.find((r) => r.seed === seed && r.returnDay === null);
      const endHeldTotal = heldA.word + heldA.debate + heldA.settle;
      if (tRow && tRow.qEnd !== endHeldTotal) {
        artifacts.push({ seed, stretch: terminalStretch.days,
          qEnd: tRow.qEnd, endHeldTotal,
          note: 'terminal stretch qEnd differs from end-run still-held total — some held lines came from outside the evening-defined stretch (e.g. a mid-day away period). Ledger (ii-a) still judges conservation; explain in the evidence file.' });
      }
    }

    rows.push({ seed, daysAlive: a.daysAlive, endReason: a.endReason,
      strandedNights: (aa.stranded || []).length,
      bStrandedSleep: ba.strandedSleepWindows + '/' + ba.strandedSleepEvents,
      aStrandedSleep: aa.strandedSleepWindows + '/' + aa.strandedSleepEvents,
      bStrandedSettle: bSettleStranded, aStrandedSettle: aSettleStranded,
      bNonStrandedSleep: ba.nonStranded.sleepWindows + '/' + ba.nonStranded.sleepEvents,
      aNonStrandedSleep: aa.nonStranded.sleepWindows + '/' + aa.nonStranded.sleepEvents,
      trajSame, strandedPosViolations,
      ledger: ledgerRow });
  }

  const primaryPass = aSSE === 0 && aSSSettle === 0;
  const nsRateAfter = rate(aNSSE, aNSSW);
  const nsRateBefore = rate(bNSSE, bNSSW);
  // Guardrail (i) RE-REGISTERED (rereg prereg, 2026-11-05, per the 2115Z
  // metric review): silencing is judged by the ledger — said_after ==
  // kicked, exact, per kind per seed — the same identity as (ii-a).
  // The sleep-phase rates are a DESCRIPTIVE phase-shift report only
  // (no band, not a GO/NO-GO check): the old ±3pp band measured the
  // designed sleep→daily phase shift, not silencing.
  const guardI = ledgerFail.length === 0;
  const guardIIa = ledgerFail.length === 0;
  const guardIIb = stretchFail.length === 0;
  const guardIIc = reconFail.length === 0;
  const guardIII = trajMismatch.length === 0;
  const go = primaryPass && guardI && guardIIa && guardIIb && guardIIc && guardIII;

  const md = [];
  md.push('# awaynaming-rereg-compare — before/after judgement (sim-awaynaming-rereg-a)');
  md.push('');
  md.push('Scope: ' + (pilotOnly ? 'PILOT 8 seeds' : 'FULL ' + judged.length + ' seeds')
    + ' (' + judged.join(', ') + '). Before corpus: fresh pre-fix baseline (r141 relay behavior) '
    + 'sim-awaynaming-rereg-a-baseline. After corpus: uncapped awayNaming gate sim-awaynaming-rereg-a-corpus.');
  md.push('');
  md.push('## Verdict: ' + (go ? 'GO' : 'NO-GO'));
  md.push('');
  md.push('- Primary — stranded sleep burst events, after: ' + aSSE + ' in ' + aSSW + ' windows (before: ' + bSSE + ' in ' + bSSW + '). Stranded settle lines, after: ' + aSSSettle + ' (before: ' + bSSSettle + '). ' + (primaryPass ? 'PASS' : 'FAIL'));
  md.push('- Guardrail (i) — NO SILENCING, ledger-based (re-registered per the 2115Z metric review): said_after == kicked, exact, per kind per seed. ' + (guardI ? 'PASS — 0 lines silenced on all ' + judged.length + ' seeds.' : 'FAIL (' + JSON.stringify(ledgerFail) + ')') + ' Phase-shift report (descriptive only, no band): non-stranded sleep burst rate after ' + fmtRate(aNSSE, aNSSW) + ' (' + aNSSE + '/' + aNSSW + ') vs before (relay) ' + fmtRate(bNSSE, bNSSW) + ' (' + bNSSE + '/' + bNSSW + ').');
  md.push('- Guardrail (ii-a) — ledger conservation (after leg): said + stillHeld == kicked per kind per seed. ' + (guardIIa ? 'PASS — 0 lines lost on all ' + judged.length + ' seeds.' : 'FAIL (' + JSON.stringify(ledgerFail) + ')'));
  md.push('- Guardrail (ii-b) — held-volume accounting per away stretch (queue-snapshot method, preregistered — the cap-a Correction 1 method: held/delivered from live awayNaming queue snapshots; ledger (ii-a) is the conservation judge; position-based held and DH-excess delivered retained as diagnostics). Lost == 0 on every stretch. ' + (guardIIb ? 'PASS' : 'FAIL — see stretch table.'));
  md.push('- Guardrail (ii-c) — reconciliation: said_after − said_before == relayDropped + stillHeld_before − stillHeld_after per kind per seed. ' + (guardIIc ? 'PASS' : 'FAIL (' + JSON.stringify(reconFail) + ')'));
  md.push('- Guardrail (iii-b) — trajectory identity before/after: ' + (guardIII ? 'all ' + judged.length + ' seeds identical (daysAlive, endReason, stranded nights, stranded/non-stranded sleep windows). PASS' : 'MISMATCH on ' + trajMismatch.length + ' seeds. FAIL'));
  md.push('- Relay measured loss (before leg, ledger): word ' + relayDroppedTotal.word + ' / debate ' + relayDroppedTotal.debate + ' / settle ' + relayDroppedTotal.settle + ' lines dropped by the r141 relay (20-cap + flush filters) across ' + judged.length + ' seeds — recovered by the uncapped gate iff (ii-a) passes.');
  md.push('- My-gate loss (after leg, ledger): word ' + myLostTotal.word + ' / debate ' + myLostTotal.debate + ' / settle ' + myLostTotal.settle + '.');
  md.push('- Queue-snapshot notes (drain not snapshot-evidenced, or terminal-stretch/end-held mismatch): ' + artifacts.length + (artifacts.length ? ' — see notes below.' : '.'));
  md.push('- Lines with unknown fire-time position (position-method diagnostic): ' + unknownPositions + '.');
  md.push('');
  md.push('## Per-seed table (after leg; b = before, a = after)');
  md.push('');
  md.push('| seed | days | end | stranded nights | b stranded sleep w/e | a stranded sleep w/e | b stranded settle | a stranded settle | b non-stranded sleep w/e | a non-stranded sleep w/e | traj same | stranded-pos violations |');
  md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of rows) md.push('| ' + r.seed + ' | ' + r.daysAlive + ' | ' + r.endReason + ' | ' + r.strandedNights + ' | ' + r.bStrandedSleep + ' | ' + r.aStrandedSleep + ' | ' + r.bStrandedSettle + ' | ' + r.aStrandedSettle + ' | ' + r.bNonStrandedSleep + ' | ' + r.aNonStrandedSleep + ' | ' + (r.trajSame ? 'yes' : 'NO') + ' | ' + r.strandedPosViolations + ' |');
  md.push('');
  md.push('## Ledger per seed (k = kicked, sB/sA = said before/after, hB/hA = still-held before/after, rD = relay dropped, mL = my-gate lost)');
  md.push('');
  md.push('| seed | word k/sB/sA/hB/hA/rD/mL | debate k/sB/sA/hB/hA/rD/mL | settle k/sB/sA/hB/hA/rD/mL |');
  md.push('| --- | --- | --- | --- |');
  for (const r of rows) {
    const L = r.ledger;
    const cell = (k) => L.kicked[k] + '/' + L.saidB[k] + '/' + L.saidA[k] + '/' + L.heldB[k] + '/' + L.heldA[k] + '/' + L.relayDropped[k] + '/' + L.myLost[k];
    md.push('| ' + r.seed + ' | ' + cell('word') + ' | ' + cell('debate') + ' | ' + cell('settle') + ' |');
  }
  md.push('');
  md.push('## Held-volume accounting per away stretch (CORRECTED method, prereg Correction 1: held = after-leg awayNaming queue depth at the last evening of the stretch + mid-stretch drops; delivered = held for returned stretches (full drain at the return, unit-proven), = mid-stretch drops for terminal stretches; lost = held − delivered. posHeld = superseded position-method diagnostic (expected ~0 on the relay substrate); dhExcess = superseded DH-excess diagnostic (expected to undercount). qMax/qEnd = after-leg queue snapshots; morningR/eveningR = queue depth at the return day\'s morning/evening snapshots — the drain evidence.)');
  md.push('');
  md.push('| seed | stretch days | return day | held (q) | delivered (q) | lost | qMax | qEnd | mid-stretch drops | morningR | eveningR | drain evidenced | posHeld w/d/s | dhExcess w/d/s | unknown pos |');
  md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const s of stretchRows) {
    md.push('| ' + s.seed + ' | ' + s.stretch.join(',') + ' | ' + (s.returnDay === null ? 'TERMINAL' : s.returnDay) + ' | '
      + s.held + ' | ' + s.delivered + ' | ' + s.lost + ' | '
      + s.qMax + ' | ' + s.qEnd + ' | ' + s.drops + ' | '
      + (s.morningR === null ? '—' : s.morningR) + ' | ' + (s.eveningR === null ? '—' : s.eveningR) + ' | '
      + (s.drainEvidenced === null ? '—' : (s.drainEvidenced ? 'yes' : 'NO')) + ' | '
      + s.posHeld.word + '/' + s.posHeld.debate + '/' + s.posHeld.settle + ' | '
      + s.dhExcess.word + '/' + s.dhExcess.debate + '/' + s.dhExcess.settle + ' | ' + s.unknown + ' |');
  }
  if (artifacts.length) {
    md.push('');
    md.push('## Queue-snapshot notes');
    md.push('');
    for (const a of artifacts) md.push('- seed ' + a.seed + ', stretch [' + a.stretch.join(',') + '] return ' + a.returnDay + ': ' + JSON.stringify(a));
  }
  if (stretchFail.length) {
    md.push('');
    md.push('## Stretch failures');
    md.push('');
    for (const f of stretchFail) md.push('- ' + JSON.stringify(f));
  }
  if (ledgerFail.length) {
    md.push('');
    md.push('## Ledger failures');
    md.push('');
    for (const f of ledgerFail) md.push('- ' + JSON.stringify(f));
  }
  md.push('');
  md.push('## Metric binding');
  md.push('');
  md.push('Judged strictly against evidence/2026-11-05/sim-awaynaming-rereg-a-prereg.md. A miss is NO-GO, never re-scored.');
  md.push('');

  const json = { verdict: go ? 'GO' : 'NO-GO', pilotOnly, seeds: judged,
    primary: { afterStrandedSleepEvents: aSSE, afterStrandedSleepWindows: aSSW, beforeStrandedSleepEvents: bSSE, beforeStrandedSleepWindows: bSSW, afterStrandedSettle: aSSSettle, beforeStrandedSettle: bSSSettle, pass: primaryPass },
    guardI: { basis: 'ledger said_after==kicked exact per kind per seed (re-registered; sleep rate descriptive only)', afterRate: nsRateAfter, beforeRate: nsRateBefore, pass: guardI },
    guardIIa: { pass: guardIIa, failures: ledgerFail, relayDroppedTotal, myLostTotal },
    guardIIb: { pass: guardIIb, failures: stretchFail, artifacts, unknownPositions },
    guardIIc: { pass: guardIIc, failures: reconFail },
    guardIII: { pass: guardIII, mismatches: trajMismatch },
    rows, stretchRows };
  fs.mkdirSync(path.dirname(outPrefix), { recursive: true });
  fs.writeFileSync(outPrefix + '.md', md.join('\n'));
  fs.writeFileSync(outPrefix + '.json', JSON.stringify(json, null, 2));
  console.log('AWAYNAMING-COMPARE: verdict ' + (go ? 'GO' : 'NO-GO') + ' on ' + judged.length + ' seeds'
    + ' | primary ' + aSSE + ' stranded events / ' + aSSSettle + ' stranded settles after'
    + ' | (i) ' + fmtRate(aNSSE, aNSSW) + ' vs ' + fmtRate(bNSSE, bNSSW)
    + ' | relay dropped w/d/s ' + relayDroppedTotal.word + '/' + relayDroppedTotal.debate + '/' + relayDroppedTotal.settle
    + ' | my lost w/d/s ' + myLostTotal.word + '/' + myLostTotal.debate + '/' + myLostTotal.settle
    + ' | stretches ' + stretchRows.length + ' | wrote ' + outPrefix + '.md + .json');
  process.exit(go ? 0 : 1);
}

if (require.main === module) main();
module.exports = { loadDir, ledgerCounts, saidCounts, heldEndCounts, awayStretches, classifyPosition };
