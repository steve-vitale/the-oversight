// holdbeat-analyze-20261104.js — overlap-window + beat-order analyzer
// (arm sim-holdbeat-a). Pure functions over a per-seed JSON (driver
// output); no Game access, no repo writes.
// Q1: overlap windows = maximal runs of consecutive daily snapshots
// with veteranRecount >= 2. Each window day carries: living veterans,
// readiness-5 readout, standing breakdown + capped, peak/door state,
// natural gate-evaluation count that day, and whether a wave-5
// release beat fired that day. Standing-sufficient = capped >= 200.
// Q2: for each wave-4+ kill event, the same-day hold beats are ordered
// against the kill credit seq: beat.seq < kill.seqCredit => the beat
// read PRE-credit state (read-order artifact, if the beat-moment
// veteran count also predates the kill); beat.seq > kill.seqCredit
// => post-credit (a real count gap if the count still reads short).
// Also reported: gate evaluations on kill days ordered vs the kill,
// and the closest approach (max living veterans) when no window occurs.
'use strict';

function gateCallsPerDay(out) {
  const m = {};
  for (const g of (out.gateCalls || [])) { m[g.day] = (m[g.day] || 0) + 1; }
  return m;
}
function beatsByDay(out, kind) {
  const m = {};
  for (const b of (out.beatEvents || [])) {
    if (kind && b.kind !== kind) continue;
    (m[b.day] = m[b.day] || []).push(b);
  }
  return m;
}
function killsByDay(out) {
  const m = {};
  for (const k of (out.killEvents || [])) { (m[k.day] = m[k.day] || []).push(k); }
  return m;
}

function summarizeSeed(out) {
  const daily = out.daily || [];
  const gatePerDay = gateCallsPerDay(out);
  const release5ByDay = beatsByDay(out, 'release5');
  const holdByDay = beatsByDay(out, 'hold');
  const killsDay = killsByDay(out);
  const s = {
    seed: out.seed, days: out.days, endReason: out.endReason,
    maxWave: out.maxWave, peakMax: 0, peakEnd: null,
    mismatchDays: [], overlapWindows: [], overlapDayCount: 0,
    maxLivingVets: 0, maxLivingVetDays: [],
    killEventsW4: 0, holdBeatCount: 0, vetkillBeatCount: 0, release5Count: 0,
    killDayOrders: [], gateOnKillDays: [],
    instrumentErrors: (out.instrumentErrors || []).length,
  };
  for (const b of (out.beatEvents || [])) {
    if (b.kind === 'hold') s.holdBeatCount++;
    if (b.kind === 'vetkill') s.vetkillBeatCount++;
    if (b.kind === 'release5') s.release5Count++;
  }
  for (const k of (out.killEvents || [])) if ((k.wave | 0) >= 4) s.killEventsW4++;
  let cur = null;
  function flush() { if (cur) { s.overlapWindows.push(cur); s.overlapDayCount += cur.days.length; cur = null; } }
  for (const snap of daily) {
    if ((snap.peak | 0) > s.peakMax) s.peakMax = snap.peak | 0;
    if (snap.veteranMismatch) s.mismatchDays.push(snap.day);
    const v = snap.veteranRecount | 0;
    if (v > s.maxLivingVets) { s.maxLivingVets = v; s.maxLivingVetDays = [snap.day]; }
    else if (v === s.maxLivingVets && v > 0) s.maxLivingVetDays.push(snap.day);
    const rd5 = snap.readiness5 || {};
    const dayRow = {
      day: snap.day, veterans: v, veteranVids: snap.veteranVids || [],
      ready5: !!rd5.ready, ready5Veterans: (rd5.veterans != null ? rd5.veterans : null),
      ready5Short: rd5.short || null,
      standing: snap.standing ? { war: snap.standing.war, diplomacy: snap.standing.diplomacy, plenty: snap.standing.plenty, total: snap.standing.total } : null,
      capped: snap.capped, standingSufficient: (snap.capped != null && (snap.capped | 0) >= 200),
      peak: snap.peak, gateCalls: gatePerDay[snap.day] || 0,
      release5Fired: !!(release5ByDay[snap.day] || []).length,
      holdBeats: (holdByDay[snap.day] || []).map(function (b) { return { seq: b.seq, beatVeterans: b.beatVeterans, momentVeterans: b.momentVeterans, line: b.line }; }),
      kills: (killsDay[snap.day] || []).filter(function (k) { return (k.wave | 0) >= 4; }).map(function (k) { return { by: k.by, mid: k.mid, via: k.via, seqCredit: k.seqCredit, beastHpAtFightStart: k.beastHpAtFightStart, beastMaxHp: k.beastMaxHp }; }),
    };
    if (v >= 2) {
      if (!cur || cur.endDay !== snap.day - 1) { flush(); cur = { startDay: snap.day, endDay: snap.day, days: [dayRow] }; }
      else { cur.endDay = snap.day; cur.days.push(dayRow); }
    } else { flush(); }
  }
  flush();
  s.peakEnd = daily.length ? daily[daily.length - 1].peak : null;
  // Q2 ordering: same-day hold beats vs wave-4+ kill credits.
  for (const k of (out.killEvents || [])) {
    if ((k.wave | 0) < 4) continue;
    const holds = (holdByDay[k.day] || []);
    const gates = (out.gateCalls || []).filter(function (g) { return g.day === k.day; });
    const order = {
      day: k.day, by: k.by, mid: k.mid, via: k.via,
      seqEntry: k.seqEntry, seqCredit: k.seqCredit,
      beastHpAtFightStart: k.beastHpAtFightStart, beastMaxHp: k.beastMaxHp,
      holds: holds.map(function (b) {
        return { seq: b.seq, beatVeterans: b.beatVeterans, momentVeterans: b.momentVeterans,
          order: (b.seq < k.seqCredit ? 'beat-before-credit' : 'beat-after-credit') };
      }),
      gatesBeforeCredit: gates.filter(function (g) { return g.seqExit < k.seqCredit; }).length,
      gatesAfterCredit: gates.filter(function (g) { return g.seqEntry > k.seqCredit; }).length,
      gatesStraddling: gates.filter(function (g) { return g.seqEntry < k.seqCredit && g.seqExit > k.seqCredit; }).length,
    };
    s.killDayOrders.push(order);
    s.gateOnKillDays.push({ day: k.day, gates: gates.length });
  }
  return s;
}

function judgeDiag(summaries) {
  // Q1 definitive: every leg has daily rows, and either an overlap
  // window exists (full day rows) or every leg ran with 0 instrument
  // errors (veteran counts demonstrably captured) so the closest
  // approach (maxLivingVets) is trustworthy. Q2 definitive: >= 1
  // kill-day hold beat with an ordering, anywhere in the legs.
  let q2 = false, windows = 0, q1 = true;
  for (const s of summaries) {
    windows += s.overlapWindows.length;
    if (!s || !s.days || s.instrumentErrors == null) q1 = false;
    for (const o of s.killDayOrders) if (o.holds.length) q2 = true;
  }
  if (windows === 0 && summaries.some(function (s) { return s.instrumentErrors > 0; })) q1 = false;
  return { q1Definitive: q1, q2Definitive: q2, totalWindows: windows };
}

module.exports = { summarizeSeed: summarizeSeed, judgeDiag: judgeDiag, gateCallsPerDay: gateCallsPerDay };
