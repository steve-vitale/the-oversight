// titangate-a-analyze.js — analyzer for the sim-titangate-a corpus.
//
// Reads per-seed JSONs (scripts/titangate-a-sweep.js output) and
// classifies every refused audience by kind + muster completeness +
// what happens next (prereg definitions). Exports analyzeSeed /
// analyzeBand for the proof test; run directly to print the pooled
// report as JSON.
//
//   node scripts/titangate-a-analyze.js <per-seed-dir>
'use strict';
const fs = require('fs');
const path = require('path');

function isTitanKind(kind) { return kind !== 'other'; }

// Muster completeness for a titan-gate refusal (prereg definition).
// Exact have/need come from the gate's own outcomes detail when
// present; else the muster snapshot at refusal time.
function musterClass(rec) {
  if (rec.refusedHow === 'entry') return 'n/a-entry';
  if (!isTitanKind(rec.kind)) return 'n/a-other';
  const oe = rec.outcomeEntry;
  if (oe && oe.detail && oe.detail.gate === 'campaign') return 'complete-but-refused';
  if (oe && oe.detail && Number.isFinite(oe.detail.have) && Number.isFinite(oe.detail.need)) {
    return oe.detail.have >= oe.detail.need ? 'complete-but-refused' : 'incomplete';
  }
  const m = rec.muster;
  if (!m) return 'unclassified';
  if (m.noMuster) return 'no-muster';
  if (!Number.isFinite(m.need)) return 'unclassified';
  const have = (m.allies || 0) + (m.haven || 0);
  return have >= m.need ? 'complete-but-refused' : 'incomplete';
}

// Gate label for a titan-gate refusal (outcomes detail when present).
function gateLabel(rec) {
  if (rec.refusedHow === 'entry') return 'entry';
  const oe = rec.outcomeEntry;
  if (oe && oe.detail && oe.detail.gate) return oe.detail.gate;
  if (rec.refusedHow === 'threw') return 'threw';
  return 'unknown';
}

// Distinct refusal line texts: normalize have/need numbers so one
// gate line with varying counts counts as one reason.
function normalizeLine(line) {
  return String(line || '')
    .replace(/muster \d+ allied blades \(you have \d+\)/g, 'muster N allied blades (you have M)')
    .replace(/\d[\d,]*(?= kcal)/g, 'N');
}

function analyzeSeed(o) {
  const starts = Array.isArray(o.tbStarts) ? o.tbStarts : [];
  const fights = Array.isArray(o.fights) ? o.fights : [];
  const ends = Array.isArray(o.tbEnds) ? o.tbEnds : [];
  const removals = Array.isArray(o.removals) ? o.removals : [];
  const refused = starts.filter(s => s.refused);
  const gateRefused = refused.filter(s => isTitanKind(s.kind) && s.refusedHow !== 'entry');
  const gateWithLine = gateRefused.filter(s => (s.sayDuring || []).length > 0);
  const coverage = gateRefused.length ? gateWithLine.length / gateRefused.length : null;

  // Player-channel fights: tbEnd joined to its tbStart by fightSeq.
  // A tbEnd joined to a REFUSED start is that same audience dissolving
  // (smoke finding, prereg Amendment 1: non-titan return-nulls resolve
  // as 'routed' the same day) — it is NOT a later fight, so it is
  // counted as dissolvedSelf on the streak and excluded from
  // foughtAfter.
  const startBySeq = new Map();
  for (const s of starts) if (s.fightSeq != null) startBySeq.set(s.fightSeq, s);
  const playerFights = [];
  const dissolvedByMid = {};
  for (const e of ends) {
    const s = startBySeq.get(e.fightSeq);
    if (!s) continue;
    if (s.refused) { dissolvedByMid[s.type] = (dissolvedByMid[s.type] || 0) + 1; continue; }
    playerFights.push({ eseq: e.eseq, day: e.day, type: s.type, kind: s.kind, result: e.result });
  }
  const allFights = fights.map(f => ({ eseq: f.eseq, day: f.day, type: f.type, kind: null, ch: f.ch, outcome: f.outcome }))
    .concat(playerFights.map(f => ({ eseq: f.eseq, day: f.day, type: f.type, kind: null, ch: 'player', outcome: f.result })));

  // Streaks: group refusals by mid (type), in eseq order.
  const byMid = {};
  for (const r of refused) {
    const k = r.type || 'unknown';
    (byMid[k] = byMid[k] || []).push(r);
  }
  const streaks = [];
  for (const mid of Object.keys(byMid).sort()) {
    const rs = byMid[mid].slice().sort((a, b) => a.eseq - b.eseq);
    const last = rs[rs.length - 1];
    const foughtAfter = allFights.filter(f => f.type === mid && f.eseq > last.eseq);
    const removedAfter = removals.filter(rm => rm.type === mid && rm.eseq > last.eseq);
    let next;
    if (foughtAfter.length) next = 'fought';
    else if (removedAfter.length) next = 'removed';
    else if ((o.finalWorldTypes || []).indexOf(mid) >= 0) next = 'lingering';
    else next = 'run-ended';
    // Final muster completeness (approximation — see prereg metric review).
    let musterCompleteAtEnd = null;
    try {
      const mus = ((o.finalTitans || {}).musters || {})[mid];
      const td = null; // need comes from the refusal records, not the final state
      if (mus) {
        const need = rs.map(r => (r.muster && r.muster.need) || (r.outcomeEntry && r.outcomeEntry.detail && r.outcomeEntry.detail.need)).find(Number.isFinite);
        if (Number.isFinite(need)) {
          const alive = (mus.allies || 0) + (mus.haven || 0);
          musterCompleteAtEnd = alive >= need;
        }
      }
    } catch (e) { musterCompleteAtEnd = null; }
    const slainAtEnd = !!(((o.finalTitans || {}).slain || {})[mid]);
    streaks.push({
      mid, kind: rs[0].kind, wave: rs[0].wave, count: rs.length,
      firstDay: rs[0].day, lastDay: last.day,
      gates: Array.from(new Set(rs.map(gateLabel))).sort(),
      musterClasses: Array.from(new Set(rs.map(musterClass))).sort(),
      withLine: rs.filter(r => (r.sayDuring || []).length > 0).length,
      next, foughtAfter: foughtAfter.length, removedAfter: removedAfter.length,
      dissolvedSelf: dissolvedByMid[mid] || 0,
      reattempted: rs.length > 1,
      musterCompleteAtEnd, slainAtEnd,
    });
  }

  const refusedByKind = {};
  const gateByKind = {};
  const gateLineTexts = {};
  for (const r of refused) {
    refusedByKind[r.kind] = (refusedByKind[r.kind] || 0) + 1;
  }
  for (const r of gateRefused) {
    gateByKind[r.kind] = (gateByKind[r.kind] || 0) + 1;
    for (const l of (r.sayDuring || [])) {
      const n = normalizeLine(l.line);
      gateLineTexts[n] = (gateLineTexts[n] || 0) + 1;
    }
  }
  const unclassified = refused.filter(r => {
    if (musterClass(r) === 'unclassified') return true;
    const st = streaks.find(s => s.mid === (r.type || 'unknown'));
    return !st || !st.next;
  });

  let unlockDay = null;
  try {
    for (const row of (o.rows || [])) if (row.uw >= 4) { unlockDay = row.day; break; }
  } catch (e) {}
  return {
    seed: o.seed, unlockDay,
    endDay: o.gameDays, endReason: o.endReason, won: o.won,
    maxWave: o.maxWave, national: o.national, table: o.table,
    captureErrs: o.captureErrs || 0,
    refusedTotal: refused.length,
    refusedByKind,
    gateRefusedTotal: gateRefused.length,
    gateByKind,
    gateWithLine: gateWithLine.length,
    coverage,
    gateLineTexts,
    streaks,
    unclassifiedCount: unclassified.length,
    unclassified: unclassified.map(r => ({ eseq: r.eseq, day: r.day, type: r.type, kind: r.kind, refusedHow: r.refusedHow })),
    complete: true,
  };
}

function analyzeBand(dir) {
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const seeds = [];
  for (const f of files) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(analyzeSeed(o));
  }
  const pooled = {
    seeds: seeds.length,
    refusedTotal: 0, gateRefusedTotal: 0, gateWithLine: 0,
    refusedByKind: {}, gateByKind: {}, gateLineTexts: {},
    streaks: [], unclassifiedCount: 0, captureErrsTotal: 0,
  };
  for (const s of seeds) {
    pooled.refusedTotal += s.refusedTotal;
    pooled.gateRefusedTotal += s.gateRefusedTotal;
    pooled.gateWithLine += s.gateWithLine;
    pooled.unclassifiedCount += s.unclassifiedCount;
    pooled.captureErrsTotal += s.captureErrs;
    for (const k of Object.keys(s.refusedByKind)) pooled.refusedByKind[k] = (pooled.refusedByKind[k] || 0) + s.refusedByKind[k];
    for (const k of Object.keys(s.gateByKind)) pooled.gateByKind[k] = (pooled.gateByKind[k] || 0) + s.gateByKind[k];
    for (const k of Object.keys(s.gateLineTexts)) pooled.gateLineTexts[k] = (pooled.gateLineTexts[k] || 0) + s.gateLineTexts[k];
    for (const st of s.streaks) pooled.streaks.push(Object.assign({ seed: s.seed }, st));
  }
  pooled.coverage = pooled.gateRefusedTotal ? pooled.gateWithLine / pooled.gateRefusedTotal : null;
  const byMid = {};
  for (const st of pooled.streaks) byMid[st.mid] = (byMid[st.mid] || 0) + 1;
  pooled.streaksByMid = byMid;
  const nextCounts = {};
  for (const st of pooled.streaks) nextCounts[st.next] = (nextCounts[st.next] || 0) + 1;
  pooled.nextCounts = nextCounts;
  return { pooled, seeds };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('Usage: node scripts/titangate-a-analyze.js <per-seed-dir>'); process.exit(2); }
  const { pooled, seeds } = analyzeBand(dir);
  console.log(JSON.stringify({ pooled, seeds }, null, 1));
}

module.exports = { analyzeSeed, analyzeBand, musterClass, gateLabel, normalizeLine };
