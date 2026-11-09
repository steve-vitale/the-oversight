#!/usr/bin/env node
// test-duty-pick-attribution.js — OVE-90: census pickByTask credits max-score
// DUTY cand (matches Game vbrainScorePick duty_top_score), not feed-order [0].
//
// Proves:
//   1. When scout outscores an earlier co-fired teach, attributed task is scout.
//   2. sampleDutyLogs increments pickByTask.scout (teach does not steal it).
//   3. Tie-break: equal scores keep the earlier cand (strict >, same as Game).
//   4. Failing control: feed-order [0] credits teach and leaves scout at 0.
//
// Usage: node scripts/test-duty-pick-attribution.js
// Exit 0 = pass, 1 = fail. No repo writes. Measurement-only — no Game retune.
'use strict';
const path = require('path');
const repo = path.join(__dirname, '..');
const probe = require(path.join(repo, 'scripts', 'probe-phase6-role-census-20261108b.js'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function out(o) { console.log(JSON.stringify(o)); }

function emptyDuty() {
  return {
    logCursor: 0,
    logsTotal: 0,
    adEvents: 0,
    adCandCount: 0,
    pickEvents: 0,
    dutyTopScorePicks: 0,
    adByTask: {},
    pickByTask: {},
    pickByOverride: {},
    adSamples: [],
    oppByTask: {},
  };
}

// Teach earlier in feed (as dutyFeedCandsFor), scout last — but scout wins on score
// (occupation clamp ×1.15 → 2.645 > teach 2.4), the OVE-88 undercount case.
const SCOUT_OVER_TEACH = [
  { kind: 'DUTY', vbrainSrc: 'duty', dutyTask: 'teach', score: 2.4 },
  { kind: 'DUTY', vbrainSrc: 'duty', dutyTask: 'scout', score: 2.645 },
];

console.log('== max-score attribution (helper) ==');
{
  const got = probe.dutyPickAttributedTask(SCOUT_OVER_TEACH);
  check('scout outscores earlier teach → scout', got === 'scout', 'got=' + got);

  const tied = [
    { kind: 'DUTY', dutyTask: 'teach', score: 2.4 },
    { kind: 'DUTY', dutyTask: 'scout', score: 2.4 },
  ];
  const tieGot = probe.dutyPickAttributedTask(tied);
  check('tie keeps earlier cand (teach)', tieGot === 'teach', 'got=' + tieGot);

  check('empty → null', probe.dutyPickAttributedTask([]) === null);
  check('null → null', probe.dutyPickAttributedTask(null) === null);
}

console.log('== sampleDutyLogs pickByTask ==');
{
  const duty = emptyDuty();
  const Game = {
    villagerId: 'p',
    vbrainLogs: () => [{
      day: 7,
      vid: 'v1',
      pick: 'DUTY',
      pickSrc: 'duty',
      override: 'duty_top_score',
      corePick: 'HAVEN_CHORE',
      candidates: [
        { kind: 'HAVEN_CHORE', score: 0.8 },
        ...SCOUT_OVER_TEACH,
      ],
    }],
  };
  // Avoid opportunity sampling side paths (roster empty / stubs).
  Game.state = { scholar: { day: 7 }, village: { roster: [] } };

  probe.sampleDutyLogs(Game, duty);
  check('pickEvents=1', duty.pickEvents === 1, 'got=' + duty.pickEvents);
  check('pickByTask.scout=1', duty.pickByTask.scout === 1,
    'pickByTask=' + JSON.stringify(duty.pickByTask));
  check('pickByTask.teach absent/0', !duty.pickByTask.teach,
    'pickByTask=' + JSON.stringify(duty.pickByTask));
  check('duty_top_score tallied', duty.dutyTopScorePicks === 1);
}

console.log('== failing control: feed-order [0] ==');
{
  const broken = probe.dutyPickAttributedTaskFeedOrder(SCOUT_OVER_TEACH);
  check('control [0] wrongly credits teach', broken === 'teach', 'got=' + broken);
  const fixed = probe.dutyPickAttributedTask(SCOUT_OVER_TEACH);
  check('control fails desired scout credit', fixed === 'scout' && broken !== 'scout');
}

out({ pass: fail === 0, passCount: pass, failCount: fail });
process.exit(fail === 0 ? 0 : 1);
