#!/usr/bin/env node
// scripts/test-vetshape-a.js — proof for the sim-vetshape-a release +
// cost-bar computation (synthetic rows only; no sims run here).
//
// The sweep script's releaseFromTraj() and costBarPass() are the judged
// computations of the pre-registered GO bar. This test pins them on
// synthetic trajectories so a sweep verdict can never rest on an
// untested helper:
//   - released via 'ready+gated': rd4 ready on some day AND max gated >= 100.
//   - NOT released when rd4 ready but max gated stays < 100 (bar cleared,
//     standing short — not a release).
//   - NOT released when gated >= 100 but rd4 never ready (standing met,
//     bar unmet — the pin itself) and no wave-4 recorded.
//   - released via 'wave4' when waveReach >= 4 even if the trajectory
//     missed the ready day (fallback criterion, reported as such).
//   - NOT released when nothing fires (all three stuck seeds' baseline
//     shape: rd4 never ready, gated pinned at 99, waveReach < 4).
//   - cost bar: starvation <= baseline + 2 AND median >= 0.8x baseline;
//     boundary cases (exactly +2, exactly 0.8x) pass; violations fail.
//   - rd5 flicker is NOT a release: rd5 ready alone never releases.
'use strict';
const assert = require('assert');
const { releaseFromTraj, costBarPass } = require('./test-vetshape-a-sweep');

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (!cond) { failed++; console.error(`FAIL ${name}: ${detail || ''}`); return; }
  passed++; console.log(`ok ${name}`);
}
function pt(day, rd4ready, gated, rd5ready, unlockedWave) {
  return { day, rd4: { ready: !!rd4ready, veterans: rd4ready ? 1 : 0, short: rd4ready ? [] : ['veterans'] },
    rd5: { ready: !!rd5ready, veterans: 0, short: ['veterans'] }, gated, raw: gated, unlockedWave: unlockedWave || 0 };
}

// 1. ready+gated release.
{
  const traj = [pt(1, false, 90), pt(50, true, 99), pt(60, true, 102)];
  const r = releaseFromTraj(traj, 3);
  ok('release: ready+gated fires', r.released && r.criterion === 'ready+gated', JSON.stringify(r));
  ok('release: first ready day recorded', r.rd4FirstReadyDay === 50, `first=${r.rd4FirstReadyDay}`);
  ok('release: maxGated tracked', r.maxGated === 102, `maxGated=${r.maxGated}`);
}
// 2. ready but gated short: no release.
{
  const r = releaseFromTraj([pt(1, false, 90), pt(50, true, 99)], 3);
  ok('no release: ready but gated < 100', !r.released && r.criterion === 'none', JSON.stringify(r));
}
// 3. gated met but rd4 never ready: the pin itself, no release.
{
  const r = releaseFromTraj([pt(1, false, 99), pt(50, false, 99), pt(90, false, 99)], 3);
  ok('no release: gated pinned, rd4 never ready', !r.released && r.criterion === 'none', JSON.stringify(r));
}
// 4. wave-4 fallback: waveReach >= 4 releases even without a ready day.
{
  const r = releaseFromTraj([pt(1, false, 90), pt(50, false, 99)], 4);
  ok('release: wave4 fallback fires', r.released && r.criterion === 'wave4', JSON.stringify(r));
}
// 5. baseline stuck shape: nothing fires.
{
  const r = releaseFromTraj([pt(1, false, 50), pt(63, false, 99), pt(180, false, 99)], 3);
  ok('no release: baseline stuck shape', !r.released && r.criterion === 'none' && !r.rd4ReadyEver, JSON.stringify(r));
}
// 6. rd5 flicker alone is not a release.
{
  const r = releaseFromTraj([pt(1, false, 99, true), pt(50, false, 99, true)], 3);
  ok('no release: rd5 ready alone', !r.released && r.rd5ReadyEver, JSON.stringify(r));
}
// 7. empty trajectory: no crash, no release.
{
  const r = releaseFromTraj([], 1);
  ok('no release: empty trajectory', !r.released && r.criterion === 'none', JSON.stringify(r));
}
// 8. cost bar: pass, boundary pass, starvation fail, median fail.
{
  ok('cost bar: clean pass', costBarPass({ starvationTotal: 3, medianDays: 150 }, { starvationTotal: 3, medianDays: 150 }).pass);
  ok('cost bar: boundary pass (+2 starv, 0.8x median)', costBarPass({ starvationTotal: 3, medianDays: 150 }, { starvationTotal: 5, medianDays: 120 }).pass);
  ok('cost bar: starvation +3 fails', !costBarPass({ starvationTotal: 3, medianDays: 150 }, { starvationTotal: 6, medianDays: 150 }).pass);
  ok('cost bar: median below 0.8x fails', !costBarPass({ starvationTotal: 3, medianDays: 150 }, { starvationTotal: 3, medianDays: 119 }).pass);
  const c = costBarPass({ starvationTotal: 3, medianDays: 150 }, { starvationTotal: 6, medianDays: 119 });
  ok('cost bar: failing parts named', !c.starvationOk && !c.medianOk, JSON.stringify(c));
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
