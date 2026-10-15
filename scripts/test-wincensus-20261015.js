#!/usr/bin/env node
'use strict';
// test-wincensus-20261015.js — proof for the win-side census instrument
// (flesh-out loop ARM 1, 2026-10-15, sim-wincensus).
//
// The instrument (scripts/wincensus-20261015.js) is a PURE classifier over
// persisted records — no game code, no sims, so the proof is constructed
// fixtures for EVERY census bucket + the bar evaluator + summarize math.
//
// REAL-RED: phase A runs every fixture against a NAIVE stub (maps the
// wintrace verdict 1:1, no bar/cause logic) and asserts it FAILS the
// never-invited bar fixtures and the died-pre-invite cause fixture —
// proving the fixtures actually exercise the classifier's new logic and
// are not vacuous. Phase B runs the real classifier: all green.
// A fixture that passes on the naive stub would be a dead test.
const WC = require('./wincensus-20261015');

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// The naive stub: the previous generation's 1:1 verdict mapping. No bar
// attribution, no cause naming, no horizon split.
function classifyNaive(rec) {
  if (!rec || typeof rec !== 'object') return 'unknown';
  if (rec.wins === 1) return 'WIN';
  return (rec.wintrace && rec.wintrace.verdict) || 'unknown';
}

function baseRec() {
  return {
    seed: 11, policyId: 'leadfeast', side: 'control',
    days: 180, gameDays: 180, endReason: 'survived',
    deaths: {}, national: 0, table: 0, wins: 0, exiled: 0,
    maxWave: 4, wave45: 1, tableAnswers: 0,
    seatDetail: { w1: 5, w2: 5, w3: 4, contestsN: 3, crisesN: 3, rank: 'regional', stage: 2, foodDeeds: true },
    deedGate: { w1: 5, w2: 5, w3: 4, w4: 1, w5: 0, contestsN: 3, crisesN: 3, rank: 'regional', stageOk: true, foodDeeds: true, ok: false },
    decisions: [],
    wintrace: { traced: true, verdict: 'unknown', evidence: [], maxArc: 3, endDay: 180, endReason: 'survived', won: false },
  };
}
function withTrace(rec, verdict, extra) {
  rec.wintrace = Object.assign(baseRec().wintrace, { verdict }, extra || {});
  return rec;
}

// ---------- fixtures ----------
const F = {};
{ // 1. WIN
  const r = baseRec(); r.wins = 1; r.gameDays = 90; r.table = 1;
  r.wintrace = Object.assign(r.wintrace, { verdict: 'WIN', won: true, pathEntered: 'feared', endDay: 90 });
  F.win = { rec: r, bucket: 'WIN' };
}
{ // 2. invited-sequence-stalled (modal pended to horizon)
  const r = baseRec(); r.table = 1; r.tableAnswers = 0;
  F.stalled = { rec: withTrace(r, 'sequence-stalled', { maxModalStreak: 92, answersTotal: 0, tableEver: true, sitEver: true, sitEpisodes: 1, seatFirst: 'lesser' }), bucket: 'invited-sequence-stalled' };
}
{ // 3. invited-deferred-died (deferred pre-floor, died in the window)
  const r = baseRec(); r.gameDays = 85; r.endReason = 'village-lost';
  r.deaths = { starvation: 6, wounds: 2 }; r.table = 1;
  F.deferredDied = { rec: withTrace(r, 'deferred-died', { deferDays: [60], endDay: 85, endReason: 'village-lost', tableEver: true, sitEver: true }), bucket: 'invited-deferred-died' };
}
{ // 4. invited-deferred-died via reoffer-died
  const r = baseRec(); r.gameDays = 120; r.endReason = 'village-lost';
  r.deaths = { monster: 4 }; r.table = 1;
  F.reofferDied = { rec: withTrace(r, 'reoffer-died', { deferDays: [47], sitEpisodes: 2, reofferSeen: true, endDay: 120, endReason: 'village-lost' }), bucket: 'invited-deferred-died' };
}
{ // 5. invited-finale-died
  const r = baseRec(); r.gameDays = 130; r.endReason = 'village-lost';
  r.deaths = { monster: 3, wounds: 1 }; r.table = 1;
  F.finaleDied = { rec: withTrace(r, 'finale-died', { pathEntered: 'feared', challengeSeen: true, maxBeat: 2, endDay: 130, endReason: 'village-lost', tableEver: true, sitEver: true }), bucket: 'invited-finale-died' };
}
function neverSatRec() {
  const r = baseRec();
  r.wintrace = Object.assign(r.wintrace, { verdict: 'never-sat', tableEver: false, sitEver: false, maxArc: 3, seatFirst: 'none' });
  return r;
}
{ // 6. never-invited + wave-3-bar (w3<3)
  const r = neverSatRec(); r.seatDetail.w3 = 2; r.seatDetail.w1 = 4; r.seatDetail.w2 = 4;
  F.niWave3 = { rec: r, bucket: 'never-invited', bar: 'wave-3-bar' };
}
{ // 7. never-invited + wave-4-lock (lesser waves met, w4<3)
  const r = neverSatRec();
  r.seatDetail = { w1: 5, w2: 5, w3: 4, contestsN: 3, crisesN: 3, rank: 'national', stage: 2, foodDeeds: true };
  r.deedGate.w4 = 1; r.deedGate.w5 = 0;
  F.niWave4 = { rec: r, bucket: 'never-invited', bar: 'wave-4-lock' };
}
{ // 8. never-invited + deeds (contests<2)
  const r = neverSatRec(); r.seatDetail.contestsN = 1;
  F.niDeeds = { rec: r, bucket: 'never-invited', bar: 'deeds' };
}
{ // 9. never-invited + standing (rank=village)
  const r = neverSatRec(); r.seatDetail.rank = 'village';
  F.niStanding = { rec: r, bucket: 'never-invited', bar: 'standing' };
}
{ // 10. died-pre-invite (never sat, died d70, starvation plurality)
  const r = neverSatRec(); r.gameDays = 70; r.endReason = 'village-lost';
  r.deaths = { starvation: 5, monster: 2 };
  r.wintrace.endDay = 70; r.wintrace.endReason = 'village-lost';
  F.diedPre = { rec: r, bucket: 'died-pre-invite', cause: 'starvation' };
}
{ // 11. died-pre-invite via invitation-no-fire + died
  const r = baseRec(); r.gameDays = 55; r.endReason = 'village-lost';
  r.deaths = { monster: 4, wounds: 1 };
  r.wintrace = Object.assign(r.wintrace, { verdict: 'invitation-no-fire', tableEver: true, endDay: 55, endReason: 'village-lost' });
  F.inviteNoFireDied = { rec: r, bucket: 'died-pre-invite', cause: 'monster' };
}
{ // 12. invited-sequence-stalled via invitation-no-fire + survived
  const r = baseRec();
  r.wintrace = Object.assign(r.wintrace, { verdict: 'invitation-no-fire', tableEver: true, sitEver: false, endDay: 180 });
  F.inviteNoFireStalled = { rec: r, bucket: 'invited-sequence-stalled' };
}
{ // 13. invited-sequence-stalled via deferral-reoffer-missed
  const r = baseRec(); r.table = 1;
  r.wintrace = Object.assign(r.wintrace, { verdict: 'deferral-reoffer-missed', deferDays: [63], tableEver: true, sitEver: true, endDay: 180 });
  F.reofferMissed = { rec: r, bucket: 'invited-sequence-stalled' };
}
{ // 14. unknown via resolved-no-win (engine inconsistency — never bucketed)
  const r = baseRec(); r.table = 1;
  r.wintrace = Object.assign(r.wintrace, { verdict: 'resolved-no-win', endDay: 180 });
  F.resolvedNoWin = { rec: r, bucket: 'unknown' };
}
{ // 15. unknown via unknown verdict
  F.plainUnknown = { rec: baseRec(), bucket: 'unknown' };
}
{ // 16. unknown via missing wintrace
  const r = baseRec(); delete r.wintrace;
  F.noTrace = { rec: r, bucket: 'unknown' };
}
{ // 17. bar priority: wave-3-bar beats deeds when both bind
  const r = neverSatRec(); r.seatDetail.w3 = 1; r.seatDetail.contestsN = 0;
  F.priority = { rec: r, bucket: 'never-invited', bar: 'wave-3-bar' };
}
{ // 18. deferred-pending (died pre-floor with deferral open) → invited-deferred-died
  const r = baseRec(); r.gameDays = 80; r.endReason = 'village-lost';
  r.deaths = { disease: 5 }; r.table = 1;
  r.wintrace = Object.assign(r.wintrace, { verdict: 'deferred-pending', deferDays: [55], tableEver: true, sitEver: true, endDay: 80, endReason: 'village-lost' });
  F.deferredPending = { rec: r, bucket: 'invited-deferred-died' };
}
{ // 19. died-pre-invite also carries the would-be bar in evidence (auditability)
  const r = neverSatRec(); r.gameDays = 70; r.endReason = 'village-lost';
  r.deaths = { monster: 3 }; r.seatDetail.w3 = 1;
  r.wintrace.endDay = 70; r.wintrace.endReason = 'village-lost';
  F.diedPreAudit = { rec: r, bucket: 'died-pre-invite', cause: 'monster', evContains: 'wave-3-bar' };
}
{ // 21. unknown: never-sat + non-death game-over (over-other, unwon) — neither survived nor died
  const r = neverSatRec(); r.gameDays = 100; r.endReason = 'over-other';
  r.wintrace.endDay = 100; r.wintrace.endReason = 'over-other';
  F.overOther = { rec: r, bucket: 'unknown' };
}
{ // 22. terminalState split is explicit
  const r = neverSatRec(); r.gameDays = 100; r.endReason = 'village-dead';
  r.deaths = { wounds: 2 };
  r.wintrace.endDay = 100; r.wintrace.endReason = 'village-dead';
  F.villageDead = { rec: r, bucket: 'died-pre-invite', cause: 'wounds' };
}
{ // 20. WIN via wintrace verdict alone (flag mismatch is evidence, not a bucket change)
  const r = baseRec();
  r.wintrace = Object.assign(r.wintrace, { verdict: 'WIN', won: true, pathEntered: 'beloved', endDay: 101 });
  F.winVerdictOnly = { rec: r, bucket: 'WIN' };
}

const names = Object.keys(F);

// ---------- PHASE A: REAL-RED on the naive stub ----------
console.log('PHASE A — REAL-RED: naive 1:1-verdict stub must FAIL the bar/cause fixtures');
const redTargets = ['niWave3', 'niWave4', 'niDeeds', 'niStanding', 'diedPre', 'inviteNoFireDied', 'priority'];
let reds = 0;
for (const n of redTargets) {
  const got = classifyNaive(F[n].rec);
  const naiveFails = got !== F[n].bucket;
  if (naiveFails) reds++;
  ok(`RED stub fails ${n} (naive='${got}')`, naiveFails, `stub unexpectedly passed ${n}`);
}
ok('RED observed on all 7 bar/cause fixtures', reds === redTargets.length, `reds=${reds}`);
console.log(`  (RED confirmed: ${reds}/${redTargets.length} naive failures — fixtures are not vacuous)`);

// ---------- PHASE B: the real classifier ----------
console.log('PHASE B — real classifier on every bucket fixture');
for (const n of names) {
  const f = F[n];
  const c = WC.classify(f.rec);
  ok(`${n} → ${f.bucket}`, c.bucket === f.bucket, `got '${c.bucket}'`);
  if (f.bar) ok(`${n} bar=${f.bar}`, c.bar === f.bar, `got '${c.bar}'`);
  if (f.cause) ok(`${n} cause names ${f.cause}`, (c.cause || '').indexOf(f.cause) === 0, `got '${c.cause}'`);
  if (f.evContains) ok(`${n} evidence carries '${f.evContains}'`, (c.evidence.join(' ')).indexOf(f.evContains) >= 0, c.evidence.join('; ').slice(0, 120));
}

// summarize math: unknown counts against; WIN outside the denominator
{
  const recs = names.map(n => F[n].rec);
  const s = WC.summarize(recs);
  ok('summarize counts wins', s.wins === 2, `wins=${s.wins}`);
  const nonWin = recs.length - 2;
  ok('summarize nonWinning', s.nonWinning === nonWin, `nonWinning=${s.nonWinning}`);
  const unknowns = names.filter(n => F[n].bucket === 'unknown').length;
  ok('summarize attributed excludes unknowns', s.attributed === nonWin - unknowns,
    `attributed=${s.attributed} expected=${nonWin - unknowns}`);
  ok('attributionShare counts unknown against', Math.abs(s.attributionShare - (nonWin - unknowns) / nonWin) < 1e-9,
    `share=${s.attributionShare}`);
  ok('unknownRows listed', s.unknownRows.length === unknowns, `unknownRows=${s.unknownRows.length}`);
}

// purity: the classifier is total — null/garbage in, 'unknown' out, never throws
{
  let threw = false, got = '';
  try { got = WC.classify(null).bucket; } catch (e) { threw = true; }
  ok('classify(null) → unknown, no throw', !threw && got === 'unknown', `threw=${threw} got=${got}`);
  try { got = WC.classify({}).bucket; } catch (e) { threw = true; }
  ok('classify({}) → unknown, no throw', !threw && got === 'unknown', `got=${got}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILING:'); for (const f of fails) console.log('  - ' + f); process.exit(1); }
console.log('test-wincensus-20261015: GREEN');
