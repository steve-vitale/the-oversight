#!/usr/bin/env node
// test-feastdraww4-a.js — proof for the feast-cadence arm (policy-side only).
// Stub-Game determinism: the layer feasts exactly when all gates pass and
// never otherwise; no RNG is consumed. Plus the perception-law leg: the
// forbidden list/place tokens are absent from the policy file itself,
// including its comments. DELETED at closeout if the arm is KILLED.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { freshFeast, withFeastDrawW4 } = require(path.join(__dirname, 'policies', 'feastdraww4'));

const FORBIDDEN = [
  'worldMonsters', 'nearestWorldMonster', 'monsterAt', 'monsterPositions',
  'worldMonster', 'roster', 'otherVillages', 'linkWith', 'hierarchyState',
  'travelTargets', 'tileAt', 'pendingEncounter', 'pendingMonsterId',
  'wanderer', 'survey', 'nearest', 'map.px', 'map.py', 'state.village',
  'positions', 'position',
];

function stubGame(over) {
  const o = over || {};
  const calls = { host: 0 };
  const Game = {
    dayPart: (o.dayPart != null ? o.dayPart : 2),
    over: false,
    villagerId: 'me',
    state: {
      scholar: { day: (o.day != null ? o.day : 50), feastDay: (o.feastDay != null ? o.feastDay : 0), prog: { feastSurge: (o.armed === false ? 0 : 1.5) } },
      village: { gives: { me: (o.gives != null ? o.gives : 5000) } },
    },
    playerAtHaven: () => (o.atHaven === false ? false : true),
    fusionReactorOnline: () => !!o.reactor,
    feastedActive: () => !!o.feasted,
    feastPlan: () => ({ ok: true, have: (o.have != null ? o.have : 10000), cost: 2000 }),
    hostFeast: () => {
      calls.host++;
      if (o.nobodyCame) return { ok: false, why: 'Nobody came to the fire.' };
      Game.state.scholar.feastDay = Game.state.scholar.day;
      return { ok: true };
    },
    feastDrawPending: () => (o.draw === false ? null : { monsterId: 'the_eulogy', day: Game.state.scholar.day }),
  };
  return { Game, calls };
}

function ctxWith(histDay, histG) {
  return { _givesHist: [{ day: histDay, g: histG }], _tribHist: [] };
}

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

// 1. Happy path: armed, not feasted, dusk, haven, contribution + affordability pass.
check('happy path feasts and records the draw', () => {
  const { Game, calls } = stubGame({});
  const ctx = ctxWith(43, 2000); // recent gives = 5000 - 2000 = 3000 >= 1500
  freshFeast(Game, ctx);
  assert.strictEqual(calls.host, 1);
  assert.strictEqual(ctx.fdFeasts, 1);
  assert.deepStrictEqual(ctx.fdDraws, [{ day: 50, monsterId: 'the_eulogy' }]);
});
// 2. Buff live: a feast now would only refresh, never draw — no feast.
check('feasted buff live blocks the layer', () => {
  const { Game, calls } = stubGame({ feasted: true });
  const ctx = ctxWith(43, 2000);
  freshFeast(Game, ctx);
  assert.strictEqual(calls.host, 0);
  assert.strictEqual(ctx.fdFeasts, undefined);
});
// 3. Unarmed feasts draw nothing.
check('unarmed blocks the layer', () => {
  const { Game, calls } = stubGame({ armed: false });
  freshFeast(Game, ctxWith(43, 2000));
  assert.strictEqual(calls.host, 0);
});
// 4. Contribution gate.
check('low contribution blocks the layer', () => {
  const { Game, calls } = stubGame({ gives: 2000 });
  freshFeast(Game, ctxWith(43, 2000)); // recent = 0
  assert.strictEqual(calls.host, 0);
});
// 5. Affordability buffer.
check('unaffordable blocks the layer', () => {
  const { Game, calls } = stubGame({ have: 2000 }); // need >= 3000
  freshFeast(Game, ctxWith(43, 2000));
  assert.strictEqual(calls.host, 0);
});
// 6. One feast per day.
check('feast already today blocks the layer', () => {
  const { Game, calls } = stubGame({ feastDay: 50 });
  freshFeast(Game, ctxWith(43, 2000));
  assert.strictEqual(calls.host, 0);
});
// 7. Reactor ceiling.
check('reactor online blocks the layer', () => {
  const { Game, calls } = stubGame({ reactor: true });
  freshFeast(Game, ctxWith(43, 2000));
  assert.strictEqual(calls.host, 0);
});
// 8. Dusk only.
check('non-dusk blocks the layer', () => {
  const { Game, calls } = stubGame({ dayPart: 1 });
  freshFeast(Game, ctxWith(43, 2000));
  assert.strictEqual(calls.host, 0);
});
// 9. Haven only.
check('away from haven blocks the layer', () => {
  const { Game, calls } = stubGame({ atHaven: false });
  freshFeast(Game, ctxWith(43, 2000));
  assert.strictEqual(calls.host, 0);
});
// 10. Nobody-came room-reading: no retry within 7 days.
check('nobody-came sets the room-reading block', () => {
  const { Game, calls } = stubGame({ nobodyCame: true });
  const ctx = ctxWith(43, 2000);
  freshFeast(Game, ctx);
  assert.strictEqual(calls.host, 1);
  assert.strictEqual(ctx._fdEmptyDay, 50);
  assert.strictEqual(ctx.fdFeasts, undefined);
  Game.state.scholar.day = 52;
  Game.hostFeast = () => { calls.host++; return { ok: true }; };
  freshFeast(Game, ctx);
  assert.strictEqual(calls.host, 1, 'must not re-light within 7 days');
});
// 11. Fresh grant with no draw recorded still counts the feast, not a draw.
check('grant without a pending draw counts feast only', () => {
  const { Game, calls } = stubGame({ draw: false });
  const ctx = ctxWith(43, 2000);
  freshFeast(Game, ctx);
  assert.strictEqual(calls.host, 1);
  assert.strictEqual(ctx.fdFeasts, 1);
  assert.strictEqual(ctx.fdDraws, undefined);
});
// 12. No RNG consumed by the layer.
check('zero random calls', () => {
  const { Game } = stubGame({});
  const ctx = ctxWith(43, 2000);
  let rc = 0;
  const orig = Math.random;
  Math.random = () => { rc++; return orig(); };
  try { freshFeast(Game, ctx); } finally { Math.random = orig; }
  assert.strictEqual(rc, 0);
});
// 13. Wrapper delegates to base upkeep, then runs the layer.
check('wrapper runs base upkeep then the layer', () => {
  const { Game, calls } = stubGame({});
  const ctx = ctxWith(43, 2000);
  let baseUpkeeps = 0;
  const base = { id: 'b', upkeep() { baseUpkeeps++; } };
  const w = withFeastDrawW4(base, 'w', 'test wrapper');
  w.upkeep(Game, ctx);
  assert.strictEqual(baseUpkeeps, 1);
  assert.strictEqual(calls.host, 1);
  assert.strictEqual(w.id, 'w');
});
// 14. Perception law: forbidden tokens absent from the policy file, comments included.
check('forbidden list/place tokens absent from policy file', () => {
  const src = fs.readFileSync(path.join(__dirname, 'policies', 'feastdraww4.js'), 'utf8');
  for (const t of FORBIDDEN) assert.ok(!src.includes(t), 'forbidden token present: ' + t);
  assert.ok(src.includes('feastDrawPending'), 'allowed own-draw read must be present');
});
console.log('feastdraww4 proof: ' + n + '/' + n + ' checks passed');
