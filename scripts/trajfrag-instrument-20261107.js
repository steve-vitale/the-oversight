// trajfrag-instrument-20261107.js — trajectory-fragility instrument
// (arm sim-trajfrag-b, run fleshout-loop-b-20261107T0230Z). DIAG only,
// zero src/js. Pure-read helpers + the one-draw displacement; zero
// game-state writes except the single Math.random() draw itself.
//
// THE DISPLACEMENT: exactly one extra Math.random() draw at day 0,
// after setupGame, before runDays. Math.random is the seeded mulberry32
// stream installed by loadGame (same function object the game modules
// captured at load), so one draw shifts every later game-RNG draw by
// one position. The policy stream (__policyRandom, derived from the seed
// in the harness) is untouched — the shift is a GAME-RNG displacement
// only, and the prereg records that scope. The drawn value is returned
// and recorded in the per-seed JSON so a perturbed leg is auditable.
//
// CLASS (prereg §primary metric): [survived?, w4kills 0 vs >=1, living
// veterans 0 vs >=1 at end]. classify(run) reads only the per-seed
// JSON fields, never narration.
// FIRST DIVERGENCE: firstDivergence(a, b) diffs the two legs' daily
// rows field-by-field (scholarId, living, raw/gated standing,
// readiness5.veterans, w4kills, w4killers, partySize, scholarAtHaven),
// the wave-kill ledger, and the scholar-death ledger, and names the
// earliest differing event.
'use strict';

function displace() {
  // One draw, nothing else. Returns the drawn value for the record.
  return Math.random();
}

function w4Kills(run) {
  return ((run.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); })).length;
}

function endVeterans(run) {
  const daily = run.daily || [];
  const last = daily[daily.length - 1] || {};
  if (last.readiness5 && last.readiness5.veterans != null) return (last.readiness5.veterans | 0);
  if (run.readiness5 && run.readiness5.veterans != null) return (run.readiness5.veterans | 0);
  return null;
}

function classify(run) {
  return {
    survived: (run.endReason === 'survived' || !!run.won),
    w4kills: w4Kills(run) >= 1,
    veterans: (endVeterans(run) || 0) >= 1,
    days: run.days,
    endReason: run.endReason,
    standing: run.standing,
    w4killCount: w4Kills(run),
    endVeterans: endVeterans(run),
    maxWave: run.maxWave,
    unlockedWave: run.unlockedWave,
  };
}

function classDiff(a, b) {
  const ca = classify(a), cb = classify(b);
  const diffs = [];
  if (ca.survived !== cb.survived) diffs.push('survived');
  if (ca.w4kills !== cb.w4kills) diffs.push('w4kills');
  if (ca.veterans !== cb.veterans) diffs.push('veterans');
  return { fragile: diffs.length > 0, diffs: diffs, a: ca, b: cb };
}

function vetOf(row) {
  if (!row || !row.readiness5 || row.readiness5.veterans == null) return null;
  return (row.readiness5.veterans | 0);
}

// First daily-row field difference, by day. Rows are compared by index
// (both legs snapshot once per game day, so index == day order).
function firstDailyDiff(a, b) {
  const da = a.daily || [], db = b.daily || [];
  const fields = ['scholarId', 'living', 'raw', 'gated', 'w4kills', 'w4killers', 'partySize', 'scholarAtHaven'];
  const n = Math.min(da.length, db.length);
  for (let i = 0; i < n; i++) {
    const ra = da[i], rb = db[i];
    if ((ra.day | 0) !== (rb.day | 0)) {
      return { kind: 'daily-row', day: Math.min(ra.day | 0, rb.day | 0), field: 'day', a: ra.day, b: rb.day };
    }
    for (let k = 0; k < fields.length; k++) {
      const f = fields[k];
      if (ra[f] !== rb[f]) return { kind: 'daily-row', day: (ra.day | 0), field: f, a: ra[f], b: rb[f] };
    }
    const va = vetOf(ra), vb = vetOf(rb);
    if (va !== vb) return { kind: 'daily-row', day: (ra.day | 0), field: 'readiness5.veterans', a: va, b: vb };
  }
  if (da.length !== db.length) {
    const longer = da.length > db.length ? a : b;
    const row = (da.length > db.length ? da : db)[n] || {};
    return { kind: 'daily-row', day: (row.day | 0) || n, field: 'daily-length', a: da.length, b: db.length };
  }
  return null;
}

function killKey(e) {
  return ((e.d != null ? e.d : e.day) + '|' + (e.mid || e.monster || e.name || e.type || '?') + '|w' + (e.w | 0));
}

function firstKillDiff(a, b) {
  const ka = (a.waveKillLog || []).map(killKey);
  const kb = (b.waveKillLog || []).map(killKey);
  const n = Math.min(ka.length, kb.length);
  for (let i = 0; i < n; i++) {
    if (ka[i] !== kb[i]) {
      return { kind: 'kill-ledger', day: ((a.waveKillLog[i] || {}).d | 0) || ((a.waveKillLog[i] || {}).day | 0) || null, field: 'waveKillLog[' + i + ']', a: ka[i], b: kb[i] };
    }
  }
  if (ka.length !== kb.length) {
    const extra = ka.length > kb.length ? a.waveKillLog[ka.length - 1] : b.waveKillLog[kb.length - 1];
    return { kind: 'kill-ledger', day: ((extra || {}).d | 0) || ((extra || {}).day | 0) || null, field: 'waveKillLog-length', a: ka.length, b: kb.length };
  }
  return null;
}

function deathKey(e) {
  return ((e.day | 0) + '|' + (e.scholarId || e.id || '?') + '|' + (e.causeArg || e.cause || e.reason || e.how || '?'));
}

function firstDeathDiff(a, b) {
  const sa = (a.scholarDeaths || []).map(deathKey);
  const sb = (b.scholarDeaths || []).map(deathKey);
  const n = Math.min(sa.length, sb.length);
  for (let i = 0; i < n; i++) {
    if (sa[i] !== sb[i]) {
      return { kind: 'scholar-deaths', day: (((a.scholarDeaths || [])[i] || {}).day | 0) || null, field: 'scholarDeaths[' + i + ']', a: sa[i], b: sb[i] };
    }
  }
  if (sa.length !== sb.length) {
    const extra = sa.length > sb.length ? (a.scholarDeaths || [])[sa.length - 1] : (b.scholarDeaths || [])[sb.length - 1];
    return { kind: 'scholar-deaths', day: ((extra || {}).day | 0) || null, field: 'scholarDeaths-length', a: sa.length, b: sb.length };
  }
  return null;
}

// The first diverging event overall: the earliest-dated of the three
// diffs (daily-row, kill-ledger, scholar-deaths). Nulls mean that
// channel never diverges; if all three are null the legs are identical
// on every compared channel.
function firstDivergence(a, b) {
  const d = firstDailyDiff(a, b);
  const k = firstKillDiff(a, b);
  const s = firstDeathDiff(a, b);
  const cands = [d, k, s].filter(function (x) { return x != null && x.day != null; });
  if (!cands.length) return { first: d || k || s, daily: d, kills: k, deaths: s };
  cands.sort(function (x, y) { return (x.day | 0) - (y.day | 0); });
  return { first: cands[0], daily: d, kills: k, deaths: s };
}

module.exports = { displace: displace, w4Kills: w4Kills, endVeterans: endVeterans, classify: classify, classDiff: classDiff, firstDailyDiff: firstDailyDiff, firstKillDiff: firstKillDiff, firstDeathDiff: firstDeathDiff, firstDivergence: firstDivergence };
