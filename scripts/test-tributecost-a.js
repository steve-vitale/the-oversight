#!/usr/bin/env node
// test-tributecost-a.js — proof for sim-tributecost-a (DIAG instrument).
//   F1 (fixtures): pantryKcal() sums kcalEach*units; linkSnapshot()
//     copies link fields, diffs history (second call: no new notes),
//     and never mutates the link.
//   F2 (smoke, competent, 30d, seed 9911): runSeed completes with a
//     per-day pantry series, population series, and link snapshots
//     (one post-daily entry per loop-day), and the independent tele
//     death capture matches the harness live capture exactly.
//   F3 (smoke, leanlink, 30d, seed 9911, LEANLINK=1): same series
//     completeness, plus the courtship wraps fire (proposals start
//     day 25, so a 30d run must log proposeLink calls) and the
//     recorder does not break the policy (run completes, court
//     counters present).
// The full pilot determinism check (pilot re-run byte-identical) runs
// at sweep time as a separate process pair, not inside this test:
// two harnesses must never share one node process.
// Usage: node scripts/test-tributecost-a.js
'use strict';
const { pantryKcal, linkSnapshot, runSeed } = require('./sweep-tributecost-a');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(function f1() {
  const fake = { state: { village: { pantry: [
    { kcalEach: 500, units: 3 }, { kcalEach: 0, units: 9 }, { kcalEach: 250, units: 2 },
  ] } } };
  check('F1 pantry sum 500*3+250*2=2000', pantryKcal(fake) === 2000, 'got ' + pantryKcal(fake));
  check('F1 pantry sum tolerates missing state', pantryKcal({}) === 0);
  const link = { id: 'link_x', primary: 'haven', subordinate: 'v9', status: 'active',
    trust: 30, day: 5, tributeKcalPerWeek: 4000, tributePaidKcal: 0, tributeWeek: null,
    tributePaidWeek: -1, arrears: 0, conquered: false,
    history: [{ day: 5, kind: 'formed', note: 'v9 joined Haven as subordinate.' }] };
  const seen = new Set();
  const snap1 = linkSnapshot({ hierarchyState: () => [link], _otherVillage: () => null }, seen);
  check('F1 snapshot carries tribute + arrears', snap1.length === 1 && snap1[0].tributeKcalPerWeek === 4000 && snap1[0].arrears === 0);
  check('F1 first call reports the formed note', snap1[0].newNotes.length === 1 && snap1[0].newNotes[0].kind === 'formed');
  const snap2 = linkSnapshot({ hierarchyState: () => [link], _otherVillage: () => null }, seen);
  check('F1 second call reports no new notes (diffing works)', snap2[0].newNotes.length === 0);
  check('F1 snapshot does not mutate link history', link.history.length === 1);
})();

async function main() {
  const c = await runSeed(9911, 'competent', 30);
  check('F2 competent smoke completes', c.days > 0 && c.endReason, 'days=' + c.days);
  check('F2 pantryDaily one per loop-day', c.pantryDaily.length === c.days, `${c.pantryDaily.length} vs ${c.days}`);
  check('F2 popDaily one per loop-day', c.popDaily.length === c.days, `${c.popDaily.length} vs ${c.days}`);
  check('F2 linkDays one per loop-day', c.linkDays.length === c.days, `${c.linkDays.length} vs ${c.days}`);
  check('F2 pantry values finite non-negative', c.pantryDaily.every(p => Number.isFinite(p.kcal) && p.kcal >= 0));
  check('F2 tele death capture matches harness capture', c.teleDeathCount === c.deathLogCount, `${c.teleDeathCount} vs ${c.deathLogCount}`);
  check('F2 aggregate deaths sum to death log', Object.values(c.deaths).reduce((t, v) => t + v, 0) === c.deathLogCount);

  process.env.LEANLINK = '1';
  const l = await runSeed(9911, 'leanlink', 30);
  check('F3 leanlink smoke completes', l.days > 0 && l.endReason, 'days=' + l.days);
  check('F3 pantryDaily one per loop-day', l.pantryDaily.length === l.days, `${l.pantryDaily.length} vs ${l.days}`);
  check('F3 tele death capture matches harness capture', l.teleDeathCount === l.deathLogCount, `${l.teleDeathCount} vs ${l.deathLogCount}`);
  const proposes = l.courtCalls.filter(x => x.name === 'proposeLink');
  check('F3 leanlink courtship wraps fire (proposals logged)', proposes.length > 0, 'courtCalls=' + l.courtCalls.length);
  check('F3 court counters present', (l.court.proposedLead || 0) > 0, JSON.stringify(l.court));
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
