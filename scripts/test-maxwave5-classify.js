'use strict';
// Unit proof for scripts/maxwave5-classify-20261102.js.
const assert = require('assert');
const { classifyReplay, classifySpawn } = require('./maxwave5-classify-20261102');

function base() {
  return { dailyTrace: [], spawns: [], attempts: [], fieldFights: [], kills: [],
    deedFacedByWave: {}, waveKillLogByWave: {}, endUnlockedWave: 1 };
}
let n = 0;
function check(name, r, want) {
  const c = classifyReplay(r);
  assert.strictEqual(c.verdict, want, name + ': got ' + c.verdict + ' want ' + want);
  assert.strictEqual(c.unclassifiedCount, 0, name + ': unclassified must be 0');
  n++;
}
// 1. nothing at all -> NONE
check('none', base(), 'NONE');
// 2. unlock only -> UNLOCK
{ const r = base(); r.dailyTrace = [{ day: 70, uw: 5 }]; r.endUnlockedWave = 5; check('unlock', r, 'UNLOCK'); }
// 3. end-state-only unlock (no trace day) -> UNLOCK with flag
{ const r = base(); r.endUnlockedWave = 5; const c = classifyReplay(r); assert.strictEqual(c.endStateOnlyUnlock, true); assert.strictEqual(c.verdict, 'UNLOCK'); n++; }
// 4. pool spawn -> SPAWN-POOL
{ const r = base(); r.dailyTrace = [{ day: 70, uw: 5 }]; r.endUnlockedWave = 5;
  r.spawns = [{ day: 71, mid: 'cancellation', wave: 5, titan: false, stackTop: 'at checkEncounter' }];
  check('pool-spawn', r, 'SPAWN-POOL'); }
// 5. titan spawn (finale, titan opts) -> SPAWN-TITAN-CAMPAIGN, not pool
{ const r = base(); r.dailyTrace = [{ day: 70, uw: 5 }]; r.endUnlockedWave = 5;
  r.spawns = [{ day: 71, mid: 'finale', wave: 5, titan: true, stackTop: 'at titanOmen' }];
  assert.strictEqual(classifySpawn(r.spawns[0]), 'SPAWN-TITAN-CAMPAIGN'); check('titan-spawn', r, 'SPAWN-TITAN-CAMPAIGN'); }
// 6. finale_crew campaign spawn (no titan flag, finale in stack) -> TITAN-CAMPAIGN
{ const r = base(); r.dailyTrace = [{ day: 70, uw: 5 }]; r.endUnlockedWave = 5;
  r.spawns = [{ day: 71, mid: 'finale_crew', wave: 5, titan: false, stackTop: 'at finale-campaign.js start' }];
  assert.strictEqual(classifySpawn(r.spawns[0]), 'SPAWN-TITAN-CAMPAIGN'); n++; }
// 7. player fight -> FIGHT (beats spawn)
{ const r = base(); r.dailyTrace = [{ day: 70, uw: 5 }]; r.endUnlockedWave = 5;
  r.spawns = [{ day: 71, mid: 'cancellation', wave: 5, titan: false, stackTop: 'x' }];
  r.attempts = [{ day: 72, mid: 'cancellation', wave: 5, cls: 'FOUGHT' }];
  check('player-fight', r, 'FIGHT'); }
// 8. player REFUSED is not a fight
{ const r = base(); r.dailyTrace = [{ day: 70, uw: 5 }]; r.endUnlockedWave = 5;
  r.attempts = [{ day: 72, mid: 'cancellation', wave: 5, cls: 'REFUSED' }];
  check('refused-not-fight', r, 'UNLOCK'); }
// 9. villager evade is not a fight; vFlee is
{ const r = base(); r.dailyTrace = [{ day: 70, uw: 5 }]; r.endUnlockedWave = 5;
  r.fieldFights = [{ day: 72, mid: 'editor', wave: 5, outcome: 'evade' }];
  check('evade-not-fight', r, 'UNLOCK');
  r.fieldFights = [{ day: 72, mid: 'editor', wave: 5, outcome: 'vFlee' }];
  check('vflee-is-fight', r, 'FIGHT'); }
// 10. deed entry alone -> FIGHT; kill -> KILL
{ const r = base(); r.dailyTrace = [{ day: 70, uw: 5 }]; r.endUnlockedWave = 5;
  r.deedFacedByWave = { '5': ['editor'] }; check('deed-is-fight', r, 'FIGHT');
  r.kills = [{ day: 73, mid: 'editor', wave: 5 }]; check('kill', r, 'KILL'); }
// 11. wave-4 spawn/fight never upgrades a wave-5 verdict
{ const r = base(); r.dailyTrace = [{ day: 70, uw: 5 }]; r.endUnlockedWave = 5;
  r.spawns = [{ day: 71, mid: 'eater', wave: 4, titan: false, stackTop: 'x' }];
  r.attempts = [{ day: 72, mid: 'eater', wave: 4, cls: 'FOUGHT' }];
  check('w4-ignored', r, 'UNLOCK'); }
console.log('test-maxwave5-classify: ' + n + ' checks passed');
