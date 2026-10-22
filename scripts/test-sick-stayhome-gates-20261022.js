#!/usr/bin/env node
// test-sick-stayhome-gates-20261022.js — SICK STAY-HOME GATE proof
// (journey-crisis 2026-10-22 r42).
//
// Finding: the "SICK: the feverish stay home" gate (parity 2026-10-08,
// objMaybeDepart in villager-objectives.js) was missing on TWO departure
// paths. Measured on oracleV2 runs: seed 101 d11/d37/d40 sick villagers
// launched expeditions; d18/d20/d28 + seed 202 d34/d67 sick villagers walked
// out as guard companions.
//
// Root cause:
//   1. villager-agency.js startExpedition: heal-checks wound HP only
//      (villagerHealCheck), never reads v.sick.
//   2. villager-objectives.js objAskCompanion: the candidate filter excludes
//      dead/engaged/away — but not sick — and the companion departs inside
//      the LEADER's objMaybeDepart call, so the companion never passes the
//      leader's own sick gate.
//
// Fix: sick villagers can't be asked to walk guard (objAskCompanion filter);
// sick villagers don't launch expeditions (startExpedition gate). The LEAVE
// escape stays ungated on purpose (the desperate don't do sit-outs).
//
// Proves:
//   1. A villager in v.sick does NOT launch an expedition (no v.away entry,
//      no agency exped record).
//   2. objAskCompanion NEVER returns a sick villager (all-sick candidate pool
//      -> null, not a sick companion).
//   3. A healthy villager CAN still launch an expedition (no over-gating).
// Usage: node scripts/test-sick-stayhome-gates-20261022.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name + (extra ? ' (' + extra + ')' : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof' });
  await setupGame(Game);
  Game.state.scholar.day = 10;
  const v = Game.state.village;
  const hx = 4, hy = 4;
  const npcs = Game.npcIds().filter(id => id !== Game.villagerId);
  ok(npcs.length >= 4, 'roster has NPCs', 'npcs=' + npcs.length);
  v.health = v.health || {};

  // ---- 1. sick villager does not launch an expedition ----
  const sick1 = npcs.find(id => { try { return Game.npcMaxDist(id) >= 1; } catch (e) { return false; } });
  ok(!!sick1, 'found an expedition-capable NPC');
  v.health[sick1] = 100;
  v.sick = v.sick || {};
  v.sick[sick1] = { name: 'bad belly', daysLeft: 5, severity: 2 };
  try { Game.startExpedition(sick1, hx, hy, false); } catch (e) { ok(false, 'startExpedition no-throw on sick', e.message); }
  ok(!((v.away || {})[sick1]), 'sick villager has no v.away entry after startExpedition');
  let expedRec = null;
  try { expedRec = (Game.agencyState() || {}).exped || {}; } catch (e) {}
  ok(!(expedRec && expedRec[sick1]), 'sick villager has no agency expedition record');

  // ---- 2. objAskCompanion never returns a sick villager ----
  const leader = npcs.find(id => id !== sick1);
  // everyone except the leader is sick: the only candidates are sick
  for (const id of npcs) {
    if (id === leader) continue;
    v.sick[id] = { name: 'bad belly', daysLeft: 5, severity: 1 };
  }
  let asked = null;
  try {
    const o = Game.objOf(leader);
    o.kind = 'FORAGE'; o.purpose = 'forage'; o.tx = hx + 2; o.ty = hy;
    o.state = 'ready'; o.indoor = false; o.tightness = 0;
    asked = Game.objAskCompanion(leader, o, hx, hy);
  } catch (e) { ok(false, 'objAskCompanion no-throw', e.message); }
  ok(asked === null || asked === undefined, 'all-sick candidate pool -> no companion', 'got=' + asked);

  // ---- 3. a healthy villager can still launch (no over-gating) ----
  delete v.sick[sick1];
  const healthy = npcs.find(id => id !== leader && id !== sick1 && (() => { try { return Game.npcMaxDist(id) >= 1; } catch (e) { return false; } })());
  v.health[healthy] = 100;
  delete v.sick[healthy];
  try { Game.startExpedition(healthy, hx, hy, false); } catch (e) { ok(false, 'startExpedition no-throw on healthy', e.message); }
  const away = (v.away || {})[healthy];
  ok(!!away && away.purpose === 'expedition', 'healthy villager still launches expedition');

  // ---- 4. a healthy companion CAN still be asked (no over-gating) ----
  delete v.sick[leader];
  const healthyComp = npcs.find(id => id !== leader && id !== healthy && (() => { try { return !(v.sick || {})[id]; } catch (e) { return true; } })());
  if (healthyComp) {
    delete v.sick[healthyComp];
    v.trust = v.trust || {}; v.trust[healthyComp] = 100;
    let asked2 = null;
    try {
      const o2 = Game.objOf(leader);
      o2.kind = 'FORAGE'; o2.purpose = 'forage'; o2.tx = hx + 1; o2.ty = hy;
      o2.state = 'ready'; o2.indoor = false; o2.tightness = 0;
      asked2 = Game.objAskCompanion(leader, o2, hx, hy);
    } catch (e) { ok(false, 'objAskCompanion no-throw (healthy pool)', e.message); }
    ok(asked2 === healthyComp || (asked2 && !(v.sick || {})[asked2]),
      'healthy companion askable, never a sick one', 'got=' + asked2);
  } else {
    console.log('  (skip) no second healthy NPC for companion-positive control');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
