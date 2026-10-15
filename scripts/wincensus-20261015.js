'use strict';
// scripts/wincensus-20261015.js — the WIN-SIDE CENSUS instrument
// (flesh-out loop ARM 1, 2026-10-15, scale-onramp axis, sim-wincensus).
//
// A PURE classifier over persisted run records. It never touches game code,
// never hooks Game, never runs a sim — classify() is a total function from
// a persisted per-seed JSON to a census verdict. The sweep
// (scripts/sweep-wincensus-20261015.js) persists the records; this script
// names every non-win.
//
// INPUT record shape (persisted by the sweep):
//   { seed, policyId, side, days, gameDays, endReason, deaths:{cause:n},
//     national:0/1, table:0/1, wins:0/1, exiled:0/1, maxWave, wave45:0/1,
//     tableAnswers, seatDetail:{w1,w2,w3,contestsN,crisesN,rank,stage,foodDeeds},
//     deedGate:{w1..w5,contestsN,crisesN,rank,stageOk,foodDeeds,ok},
//     decisions:[], wintrace:{verdict, evidence[], seatFirst, pathsQualified,
//       tableEver, sitEver, sitEpisodes, pathEntered, pathsEntered,
//       challengeSeen, maxBeat, finalsSeen, downgradeSeen, weakened,
//       deferDays, reofferSeen, answersTotal, maxModalStreak, endDay,
//       endReason, won, maxArc} }
//
// BUCKETS (the census taxonomy):
//   WIN                     — the win flag (rec.wins=1).
//   invited-sequence-stalled— the table sat (or the invitation fired) and the
//                             sequence is still open / never moved: the modal
//                             pended, the deferral never re-offered, the
//                             invitation never fired the scene at horizon.
//   invited-deferred-died   — the village died inside the win-day-floor
//                             deferral window (deferred pre-90, dead before
//                             the re-offer; or re-offered and died).
//   invited-finale-died     — the village died with the finale live
//                             (challenge/finals/downgrade phase).
//   never-invited           — the village was never invited AND survived to
//                             the horizon; the binding bar names why the seat
//                             never priced (see bar definitions below).
//   died-pre-invite         — the village died with the table never sat;
//                             the death cause names the terminal event.
//   unknown                 — anything the instrument cannot name. Counts
//                             AGAINST the binding GO (a miss is NO-GO).
//
// BINDING-BAR DEFINITIONS (never-invited; evaluated in this priority):
//   wave-3-bar — the lesser seat's wave-1..3 distinct-fights bar binds
//                (tableSeat().detail: w1<4 || w2<4 || w3<3). Engine: the
//                actual invitation gate (progression.js checkArc → want=4
//                on lesser|full; table.js tableSeat: lesser = 4/4/3).
//   wave-4-lock— the full deed gate's wave-4/5 distinct bars bind
//                (deedGateReady(): w4<3 || w5<2) on a run that cleared the
//                lesser wave bars. The documented two-rung bind
//                (sim-findings #44). NOTE: the engine invites on the LESSER
//                seat, so this branch firing on a never-invited SURVIVOR
//                means the lesser bars were met yet the invitation never
//                fired — an engine-anomaly worth investigating, not a normal
//                bar. The evidence field carries the full rows.
//   deeds      — the contest/crisis/food-thesis bars bind
//                (contestsN<2 || crisesN<2 || !foodDeeds on the lesser
//                detail; food-thesis is a deed, not standing).
//   standing   — the scale-rank or integration-stage bar binds
//                (rank not regional+ || stage<2).
//   If all four pass on a never-invited run → 'unknown' with the rows
//   (the arc-want breadth lock, or an engine gap — named, not hidden).
//
// DIED-PRE-INVITE vs NEVER-INVITED split: never-sat (wintrace verdicts
// never-sat / sat-withdrawn / invitation-no-fire) AND the village died
// (endReason is a death, gameDays < 180) → died-pre-invite + plurality
// death cause from the persisted deaths tally. never-sat AND survived to
// the 180d horizon → never-invited + binding bar. invitation-no-fire at
// horizon (invitation fired, scene never came) → invited-sequence-stalled
// (the sequence opened and stalled), not never-invited.
//
// MAP from wintrace verdicts (scripts/policies/wintrace.js) to census
// buckets:
//   WIN                     → WIN (rec.wins=1 is the belt; verdict the
//                             suspenders — either alone suffices)
//   sequence-stalled        → invited-sequence-stalled
//   deferred-died           → invited-deferred-died
//   reoffer-died            → invited-deferred-died
//   deferred-pending        → invited-deferred-died (died pre-floor with the
//                             deferral open — died INSIDE the window)
//   finale-died             → invited-finale-died
//   deferral-reoffer-missed → invited-sequence-stalled (survived; the
//                             re-offer never came — the sequence stalled)
//   invitation-no-fire      → died-pre-invite (died) | invited-sequence-stalled
//                             (survived to horizon)
//   never-sat / sat-withdrawn → died-pre-invite (died) | never-invited+bar
//                             (survived to horizon)
//   resolved-no-win        → unknown (phase done, won=false — engine
//                             inconsistency; never silently bucketed)
//   unknown                 → unknown
//
// The census is run by the sweep; the CLI `node scripts/wincensus-20261015.js
// <glob...>` prints the attribution table for persisted records.
const fs = require('fs');

const BUCKETS = [
  'WIN', 'invited-sequence-stalled', 'invited-deferred-died',
  'invited-finale-died', 'never-invited', 'died-pre-invite', 'unknown',
];

const BARS = ['wave-3-bar', 'wave-4-lock', 'deeds', 'standing', 'unknown'];

function survivedToHorizon(rec) {
  const d = (rec.gameDays | 0) || 0;
  const er = String(rec.endReason || '');
  return d >= 180 || /^(survived|horizon)$/i.test(er);
}

// Explicit terminal-state split (harness vocabulary: village-lost |
// village-dead | pop-zero | over-other | survived). 'other' (e.g. a
// non-death game-over without the win flag) is neither survived nor
// died — those rows go to 'unknown' with the endReason in evidence,
// never silently bucketed.
function terminalState(rec) {
  const d = (rec && rec.gameDays | 0) || 0;
  const er = String((rec && rec.endReason) || '');
  if (d >= 180 || /^(survived|horizon)$/i.test(er)) return 'survived';
  if (/^(village-lost|village-dead|pop-zero)$/i.test(er)) return 'died';
  return 'other';
}

// plurality death cause from the persisted tally {cause: n}
function deathCause(rec) {
  const t = (rec && rec.deaths) || {};
  let best = 'unknown-cause', bn = -1;
  for (const k of Object.keys(t)) {
    const n = +t[k] || 0;
    if (n > bn) { bn = n; best = String(k); }
  }
  return { cause: best, n: Math.max(0, bn) };
}

// Binding bar for a never-invited run. Reads the persisted end-of-run
// seat detail (tableSeat().detail) and full deed gate (deedGateReady()).
function bindingBar(rec) {
  const d = (rec && rec.seatDetail) || {};
  const g = (rec && rec.deedGate) || {};
  const w1 = d.w1 | 0, w2 = d.w2 | 0, w3 = d.w3 | 0;
  const cx = d.contestsN | 0, cr = d.crisesN | 0;
  const rank = String(d.rank || 'village');
  const stage = d.stage | 0;
  const food = !!d.foodDeeds;
  if (w1 < 4 || w2 < 4 || w3 < 3) {
    return { bar: 'wave-3-bar', why: `w1=${w1},w2=${w2},w3=${w3} (lesser needs 4/4/3)` };
  }
  if (cx < 2 || cr < 2 || !food) {
    return { bar: 'deeds', why: `contests=${cx}<2?${cx < 2} crises=${cr}<2?${cr < 2} foodThesis=${food}` };
  }
  if (!(rank === 'regional' || rank === 'national' || rank === 'global') || stage < 2) {
    return { bar: 'standing', why: `rank=${rank} stage=${stage} (need regional+, stage>=2)` };
  }
  // All lesser bars met, yet never invited: the full deed gate's wave-4/5
  // bars are the outstanding lock in the taxonomy. (Engine invites on the
  // lesser seat, so this firing on a survivor is an anomaly — see header.)
  const gw4 = (g.w4 == null ? (d.w4 | 0) : g.w4) | 0;
  const gw5 = (g.w5 == null ? (d.w5 | 0) : g.w5) | 0;
  if (gw4 < 3 || gw5 < 2) {
    return { bar: 'wave-4-lock', why: `lesser bars met; full wave bars w4=${gw4}<3?${gw4 < 3} w5=${gw5}<2?${gw5 < 2}` };
  }
  return { bar: 'unknown', why: 'all seat bars met but never invited (arc-want breadth lock or engine gap — investigate)' };
}

function classify(rec) {
  const out = {
    seed: rec && rec.seed, policyId: rec && rec.policyId, side: rec && rec.side,
    bucket: 'unknown', bar: null, cause: null, evidence: [],
  };
  if (!rec || typeof rec !== 'object') { out.evidence.push('no record'); return out; }
  if (rec.wins === 1 || (rec.wintrace && rec.wintrace.won)) {
    out.bucket = 'WIN';
    out.evidence.push(`won day=${rec.gameDays} path=${(rec.wintrace || {}).pathEntered || '?'}`);
    return out;
  }
  const w = rec.wintrace || {};
  const v = String(w.verdict || 'unknown');
  const term = terminalState(rec);
  const died = term === 'died';
  const survived = term === 'survived';
  const dc = deathCause(rec);
  const diedNote = `${dc.cause} (x${dc.n})`;
  const otherNote = `endReason=${rec.endReason} (non-death game-over, unwon)`;
  switch (v) {
    case 'WIN':
      out.bucket = 'WIN'; out.evidence.push('wintrace WIN, rec.wins=0 — flag mismatch, investigate'); break;
    case 'sequence-stalled':
      out.bucket = 'invited-sequence-stalled';
      out.evidence.push(`modal streak max=${w.maxModalStreak} answers=${w.answersTotal} phase=${(w.evidence || []).join('; ').slice(0, 200)}`);
      break;
    case 'deferred-died':
    case 'reoffer-died':
    case 'deferred-pending':
      out.bucket = 'invited-deferred-died';
      out.evidence.push(`${v}: deferDays=${(w.deferDays || []).join(',')} end day=${w.endDay} end=${w.endReason}`);
      break;
    case 'finale-died':
      out.bucket = 'invited-finale-died';
      out.evidence.push((w.evidence || []).join('; ').slice(0, 220));
      break;
    case 'deferral-reoffer-missed':
      out.bucket = 'invited-sequence-stalled';
      out.evidence.push('survived; winDeferred set at end with floor met — dawn driver never re-offered');
      break;
    case 'invitation-no-fire':
      if (died) { out.bucket = 'died-pre-invite'; out.cause = diedNote; }
      else if (survived) { out.bucket = 'invited-sequence-stalled'; }
      else { out.bucket = 'unknown'; out.evidence.push(otherNote); return out; }
      out.evidence.push((w.evidence || []).join('; ').slice(0, 220));
      break;
    case 'never-sat':
    case 'sat-withdrawn':
      if (died) {
        out.bucket = 'died-pre-invite'; out.cause = diedNote;
        const b = bindingBar(rec);
        out.evidence.push(`died d${rec.gameDays} maxArc=${w.maxArc} seat=${w.seatFirst || 'none'}; bar at death would be ${b.bar} (${b.why})`);
      } else if (survived) {
        out.bucket = 'never-invited';
        const b = bindingBar(rec);
        out.bar = b.bar; out.evidence.push(b.why + `; maxArc=${w.maxArc} seatFirst=${w.seatFirst || 'none'}`);
      } else {
        out.bucket = 'unknown'; out.evidence.push(otherNote); return out;
      }
      break;
    case 'resolved-no-win':
      out.bucket = 'unknown';
      out.evidence.push('phase done, won=false — engine inconsistency; never silently bucketed');
      break;
    default:
      out.bucket = 'unknown';
      out.evidence.push(`unmapped wintrace verdict '${v}'; end=${rec.endReason} day=${rec.gameDays}`);
      break;
  }
  return out;
}

// summarize(records) → {counts per bucket, attribution share}
function summarize(records) {
  const counts = {};
  for (const b of BUCKETS) counts[b] = 0;
  const rows = records.map(classify);
  const nonWin = rows.filter(r => r.bucket !== 'WIN');
  for (const r of rows) counts[r.bucket]++;
  const named = nonWin.filter(r => r.bucket !== 'unknown').length;
  return {
    rows, counts,
    wins: counts.WIN,
    nonWinning: nonWin.length,
    attributed: named,
    attributionShare: nonWin.length ? named / nonWin.length : 1,
    unknownRows: rows.filter(r => r.bucket === 'unknown'),
  };
}

function loadRecords(patterns) {
  const recs = [];
  for (const pat of patterns) {
    // tiny glob: support '*' only in the filename part
    const dir = pat.slice(0, pat.lastIndexOf('/') + 1) || './';
    const rx = new RegExp('^' + pat.slice(pat.lastIndexOf('/') + 1).replace(/\*/g, '.*') + '$');
    let files = [];
    try { files = fs.readdirSync(dir).filter(f => rx.test(f)).sort(); } catch (e) {}
    for (const f of files) {
      try { recs.push(JSON.parse(fs.readFileSync(dir + f, 'utf8'))); }
      catch (e) { console.error('unreadable: ' + dir + f); }
    }
  }
  return recs;
}

if (require.main === module) {
  const recs = loadRecords(process.argv.slice(2).length ? process.argv.slice(2)
    : ['evidence/2026-10-15/perseed-wincensus/*.json']);
  const s = summarize(recs);
  console.log(`records=${recs.length} wins=${s.wins} nonWinning=${s.nonWinning} attributed=${s.attributed} share=${(s.attributionShare * 100).toFixed(1)}%`);
  for (const r of s.rows) {
    const extra = r.bar ? ` bar=${r.bar}` : (r.cause ? ` cause=${r.cause}` : '');
    console.log(`  [${r.side} ${r.policyId} s${r.seed}] ${r.bucket}${extra} — ${(r.evidence[0] || '').slice(0, 160)}`);
  }
  if (s.unknownRows.length) {
    console.log('UNKNOWN rows (count against GO):');
    for (const r of s.unknownRows) console.log(`  [${r.side} ${r.policyId} s${r.seed}] — ${(r.evidence[0] || '').slice(0, 200)}`);
  }
}

module.exports = { classify, summarize, bindingBar, deathCause, survivedToHorizon, terminalState, BUCKETS, BARS };
