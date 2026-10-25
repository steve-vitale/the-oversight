// test-vetguard-20261024.js — journey-endgame r49 (lane B) proof for
// CAPABLE_VETGUARD in scripts/policies/capable.js greedyWaits.
//
// The rule: with CAPABLE_GREEDY=1 and CAPABLE_VETGUARD=1, a living
// veteran (waveCombatReadiness(5).veterans >= 1) ends the wait — greedy
// sits at once instead of waiting. Without the gate, or without a
// veteran, greedy waits exactly as before. No game code is loaded here:
// greedyWaits is a pure function of (Game stub, preview) + env, so a
// stub Game proves the rule and its default-off behavior directly.
//
// Usage: node scripts/test-vetguard-20261024.js  (exit 0 = all pass)
'use strict';
const { greedyWaits } = require('./policies/capable');

let failures = 0;
function check(name, got, want) {
  const ok = got === want;
  if (!ok) failures++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name + ' got=' + got + ' want=' + want);
}
function stubGame(veterans, opts) {
  const o = opts || {};
  return {
    state: {
      scholar: { day: o.day != null ? o.day : 100, health: o.hp != null ? o.hp : 100, maxHealth: 100 },
      village: { roster: o.roster || ['a', 'b', 'c', 'd', 'e', 'f'] },
    },
    maxHealth: () => 100,
    waveCombatReadiness: (w) => {
      if (o.throwRead) throw new Error('read boom');
      return { veterans: w === 5 ? veterans : 0 };
    },
  };
}
function pv(opts) {
  const o = opts || {};
  return { key: !!o.key, overtime: o.tier || 0, losses: o.losses || 0 };
}
function withEnv(env, fn) {
  const saved = {};
  for (const k of ['CAPABLE_GREEDY', 'CAPABLE_VETGUARD', 'CAPABLE_GREEDY_RECKLESS', 'CAPABLE_GREEDY_MAXTIER', 'CAPABLE_GREEDY_LASTDAY']) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  Object.assign(process.env, env);
  try { fn(); } finally {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

// 1. VETGUARD ON + 1 living veteran + all guards pass -> SIT (false).
withEnv({ CAPABLE_GREEDY: '1', CAPABLE_VETGUARD: '1' }, () => {
  check('vetguard sits on first veteran', greedyWaits(stubGame(1), pv()), false);
});
// 2. VETGUARD ON + 2 veterans -> SIT.
withEnv({ CAPABLE_GREEDY: '1', CAPABLE_VETGUARD: '1' }, () => {
  check('vetguard sits on two veterans', greedyWaits(stubGame(2), pv()), false);
});
// 3. VETGUARD ON + 0 veterans -> WAIT (true), the r47/r48 behavior.
withEnv({ CAPABLE_GREEDY: '1', CAPABLE_VETGUARD: '1' }, () => {
  check('vetguard waits with no veteran', greedyWaits(stubGame(0), pv()), true);
});
// 4. VETGUARD OFF (default) + 1 veteran -> WAIT: default-off, byte-identical road.
withEnv({ CAPABLE_GREEDY: '1' }, () => {
  check('gate off waits despite veteran', greedyWaits(stubGame(1), pv()), true);
});
// 5. GREEDY OFF + VETGUARD ON + veteran -> SIT (greedy off already sits).
withEnv({ CAPABLE_VETGUARD: '1' }, () => {
  check('greedy off sits regardless', greedyWaits(stubGame(1), pv()), false);
});
// 6. VETGUARD ON + veteran + key -> SIT via the key guard (not the vetguard branch).
withEnv({ CAPABLE_GREEDY: '1', CAPABLE_VETGUARD: '1' }, () => {
  check('key still sits first', greedyWaits(stubGame(1), pv({ key: true })), false);
});
// 7. VETGUARD ON + veteran + losses=3 -> SIT via the losses guard.
withEnv({ CAPABLE_GREEDY: '1', CAPABLE_VETGUARD: '1' }, () => {
  check('losses still sits first', greedyWaits(stubGame(1), pv({ losses: 3 })), false);
});
// 8. Read error -> treated as 0 veterans -> WAIT (fail-open toward waiting,
//    never a surprise sit on a broken read).
withEnv({ CAPABLE_GREEDY: '1', CAPABLE_VETGUARD: '1' }, () => {
  check('read error waits', greedyWaits(stubGame(1, { throwRead: true }), pv()), true);
});
// 9. VETGUARD ON + veteran + roster 4 -> SIT via the roster guard.
withEnv({ CAPABLE_GREEDY: '1', CAPABLE_VETGUARD: '1' }, () => {
  check('roster guard still sits', greedyWaits(stubGame(1, { roster: ['a', 'b', 'c', 'd'] }), pv()), false);
});

if (failures) { console.log('VETGUARD PROOF: ' + failures + ' FAILURES'); process.exit(1); }
console.log('VETGUARD PROOF: all 9 pass');
