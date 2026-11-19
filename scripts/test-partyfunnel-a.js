// test-partyfunnel-a.js — proof test, arm sim-partyfunnel-a.
// Proves the PARTYFUNNEL change (finding #2547 family: the funnel
// AFTER seeding — the plan survives holder death via reassignment,
// and a retarget holds a staged party). Every section has an
// old-code-fails control: with PARTYFUNNEL unset the same call must do
// the OLD thing (delete the plan / retarget it), so green here means
// the new mechanism fired, not that the call never ran.
//   §1 holder death reassigns a 'party'-stage plan to a Haven successor
//      (flag ON -> plan lives under a living eligible successor with
//      the same target; flag OFF -> plan deleted).
//   §2 holder death mid-hunt reassigns to a living party member
//      (flag ON -> plan stays 'hunt' under the first living member
//      with the remaining party, other copies re-pointed at them;
//      flag OFF -> plan deleted).
//   §3 a 'standing'-stage plan still deletes on holder death (flag ON
//      -> deleted, the banked kill does not transfer).
//   §4 a 'party'-stage plan WITH a target does not retarget (flag ON
//      -> same target after a seed for another beast; flag OFF ->
//      retargeted).
//   §5 a targetless 'party'-stage plan still retargets (flag ON ->
//      acquires the new target) — the hold must never strand one.
//   §6 a 'gear'-stage plan still retargets (flag ON -> retargeted).
// Fixture (local-proof-of-effect): a LIVE loaded village (seed 104607,
// the Yuki seed), real roster and real gear — no staged gear, no solo
// scholar. Seed calls use real wave-4 mdefs (influencer, reunion).
// Plan stage/party are set directly where the seed's gear-derived
// stage would not put the plan in the shape under test (precedent:
// test-partyform-fix-a.js §4 sets party/stage directly). The
// OBSERVABLE effect in every section is the live plan store after a
// real method call — no fixture setup can fake a reassignment or a
// held target.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Usage: node scripts/test-partyfunnel-a.js
'use strict';
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

const MDEF = { id: 'influencer', wave: 4 };
const MDEF2 = { id: 'reunion', wave: 4 };

function setFlag(on) {
  if (on) process.env.PARTYFUNNEL = '1';
  else delete process.env.PARTYFUNNEL;
}

async function live() {
  process.env.VETREENGAGE = '1';
  process.env.PARTYSIZE4 = '1';
  process.env.FLEEREPAIR2 = '1';
  delete process.env.PARTYFORMFIX;
  delete process.env.WILDSEEDPLAN;
  delete process.env.WILDAVOID;
  const { Game, loadFails } = await loadGame({ seed: 104607, mode: 'test' });
  if (loadFails && loadFails.length) { fail('live module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px != null ? v.px : 4, hy = v.py != null ? v.py : 4;
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  assert(roster.length >= 8, 'live need 8+ NPCs, have ' + roster.length);
  const origSay = Game.say;
  Game.say = function () {};
  const wp = function () { return (Game.state.village.winPlan || {}); };
  const clearPlan = function (vid) { try { delete wp()[vid]; } catch (e) {} };
  const seedPlan = function (vid, mdef) {
    let r = null;
    try { r = Game.winPlanSeedFromFight(vid, mdef, 'fled'); } catch (e) { fail('seed threw for ' + vid + ': ' + e.message); }
    return r;
  };
  const rangeOf = function (vid) { try { return Game.npcMaxDist ? Game.npcMaxDist(vid) : null; } catch (e) { return null; } };
  const atHaven = function (vid) {
    try { const n = Game.npcNode ? Game.npcNode(vid) : null; return !!(n && n.nx === hx && n.ny === hy); } catch (e) { return false; }
  };
  const alive = function (vid) {
    try { const p = Game.getPerson ? Game.getPerson(vid) : null; return !!(p && !p.dead); } catch (e) { return true; }
  };

  // Pick distinct NPCs per section so plans never interfere.
  const H1 = roster[0], H2 = roster[1], M1 = roster[2], M2 = roster[3];
  const H3 = roster[4], H4 = roster[5], H5 = roster[6], H6 = roster[7];

  // ---- §1 holder death reassigns a 'party'-stage plan to a Haven successor ----
  // Prepare one thoroughly eligible successor (at Haven, trusted, able
  // to walk); the assertion is property-based — whoever the pick
  // returns must be a living eligible NPC holding the same-target plan.
  let succ1 = null;
  for (let i = 8; i < roster.length && !succ1; i++) {
    const cand = roster[i];
    if (cand === H1) continue;
    if ((rangeOf(cand) || 0) < 1) continue;
    succ1 = cand;
  }
  assert(!!succ1, '§1 fixture: a range>=1 NPC exists to prepare as successor (have ' + (succ1 || 'none') + ')');
  if (succ1) {
    try { Game.npcSetNode(succ1, hx, hy); } catch (e) {}
    try { v.trust = v.trust || {}; v.trust[succ1] = 50; } catch (e) {}
    try { if (v.sick) delete v.sick[succ1]; } catch (e) {}
    try { if (v.away) delete v.away[succ1]; } catch (e) {}
  }
  setFlag(false);
  let r1seed = seedPlan(H1, MDEF);
  assert(!!r1seed, '§1 fixture: holder holds a plan before dying');
  if (r1seed) { try { r1seed.stage = 'party'; } catch (e) {} }
  setFlag(true);
  let r1 = null;
  try { r1 = Game.winPlanOnVillagerDeath(H1); } catch (e) { fail('§1 death cleanup threw (flag ON): ' + e.message); }
  assert(!!(r1 && r1.reassignedTo), '§1 plan reassigned on holder death with flag ON (got ' + JSON.stringify(r1) + ')');
  assert(r1 && r1.reassignVia === 'haven-successor', '§1 reassignment came via a Haven successor (got ' + (r1 && r1.reassignVia) + ')');
  assert(r1 && r1.planStageBefore === 'party', '§1 the reassigned plan was party-stage (got ' + (r1 && r1.planStageBefore) + ')');
  if (r1 && r1.reassignedTo) {
    const to = r1.reassignedTo;
    assert(to !== H1 && to !== Game.villagerId, '§1 successor is a living NPC, not the holder or the scholar (got ' + to + ')');
    assert(alive(to), '§1 successor is alive');
    assert(atHaven(to), '§1 successor is at Haven');
    assert((rangeOf(to) || 0) >= 1, '§1 successor can walk (range>=1, got ' + rangeOf(to) + ')');
    assert(!!(wp()[to] && wp()[to].target === 'influencer'), '§1 successor holds the plan with the SAME target (got ' + JSON.stringify(wp()[to] && wp()[to].target) + ')');
    assert(!wp()[H1], '§1 the dead holder entry is gone');
  }
  // Control: flag OFF, the same death deletes the plan.
  if (r1 && r1.reassignedTo) clearPlan(r1.reassignedTo);
  clearPlan(H1);
  setFlag(false);
  let r1c = seedPlan(H1, MDEF);
  if (r1c) { try { r1c.stage = 'party'; } catch (e) {} }
  let r1off = null;
  try { r1off = Game.winPlanOnVillagerDeath(H1); } catch (e) { fail('§1 death cleanup threw (flag OFF): ' + e.message); }
  assert(!!(r1off && r1off.deleted), '§1 OLD CODE control: holder death deletes the plan with flag OFF (got ' + JSON.stringify(r1off) + ')');
  assert(!(r1off && r1off.reassignedTo), '§1 OLD CODE control: no reassignment with flag OFF');
  assert(!wp()[H1], '§1 OLD CODE control: the dead holder entry is gone with flag OFF');
  clearPlan(H1);

  // ---- §2 holder death mid-hunt reassigns to a living party member ----
  setFlag(false);
  let r2seed = seedPlan(H2, MDEF);
  assert(!!r2seed, '§2 fixture: holder holds a plan before dying');
  if (r2seed) { try { r2seed.stage = 'hunt'; r2seed.party = [M1, M2]; } catch (e) {} }
  const mkCopy = function (vid, party) {
    let cp = null;
    try { cp = Game.winPlanOf(vid); } catch (e) { fail('§2 winPlanOf threw for ' + vid + ': ' + e.message); }
    if (cp) { try { cp.stage = 'hunt'; cp.target = 'influencer'; cp.needWave = 4; cp.party = party.slice(); } catch (e) {} }
    return cp;
  };
  mkCopy(M1, [H2, M2]);
  mkCopy(M2, [H2, M1]);
  setFlag(true);
  let r2 = null;
  try { r2 = Game.winPlanOnVillagerDeath(H2); } catch (e) { fail('§2 death cleanup threw (flag ON): ' + e.message); }
  assert(!!(r2 && r2.reassignedTo === M1), '§2 plan passes to the FIRST living party member with flag ON (got ' + (r2 && r2.reassignedTo) + ', want ' + M1 + ')');
  assert(r2 && r2.reassignVia === 'party-member', '§2 reassignment came via a party member (got ' + (r2 && r2.reassignVia) + ')');
  if (r2 && r2.reassignedTo === M1) {
    assert(wp()[M1] && wp()[M1].stage === 'hunt', '§2 the new holder plan stays hunt-stage');
    assert(wp()[M1] && wp()[M1].target === 'influencer', '§2 the new holder plan keeps the target');
    assert(JSON.stringify((wp()[M1].party || []).slice().sort()) === JSON.stringify([M2]), '§2 the new holder party is the remaining living members (got ' + JSON.stringify(wp()[M1].party) + ')');
    assert(wp()[M2] && (wp()[M2].party || []).indexOf(M1) !== -1, '§2 the other member copy names the new holder');
    assert(wp()[M2] && (wp()[M2].party || []).indexOf(H2) === -1, '§2 the other member copy no longer names the dead holder');
    assert(!wp()[H2], '§2 the dead holder entry is gone');
  }
  // Control: flag OFF, the same death deletes the plan (party purge only).
  clearPlan(M1); clearPlan(M2); clearPlan(H2);
  setFlag(false);
  let r2c = seedPlan(H2, MDEF);
  if (r2c) { try { r2c.stage = 'hunt'; r2c.party = [M1, M2]; } catch (e) {} }
  mkCopy(M1, [H2, M2]);
  mkCopy(M2, [H2, M1]);
  let r2off = null;
  try { r2off = Game.winPlanOnVillagerDeath(H2); } catch (e) { fail('§2 death cleanup threw (flag OFF): ' + e.message); }
  assert(!!(r2off && r2off.deleted), '§2 OLD CODE control: holder death deletes the plan with flag OFF');
  assert(!(r2off && r2off.reassignedTo), '§2 OLD CODE control: no reassignment with flag OFF');
  assert(!wp()[H2], '§2 OLD CODE control: the dead holder entry is gone with flag OFF');
  assert(wp()[M1] && (wp()[M1].party || []).indexOf(H2) === -1, '§2 OLD CODE control: the purge still strikes the dead holder from parties');
  clearPlan(M1); clearPlan(M2); clearPlan(H2);

  // ---- §3 a 'standing'-stage plan still deletes on holder death ----
  setFlag(true);
  let r3seed = seedPlan(H3, MDEF);
  assert(!!r3seed, '§3 fixture: holder holds a plan before dying');
  if (r3seed) { try { r3seed.stage = 'standing'; } catch (e) {} }
  const before3 = Object.keys(wp()).length;
  let r3 = null;
  try { r3 = Game.winPlanOnVillagerDeath(H3); } catch (e) { fail('§3 death cleanup threw (flag ON): ' + e.message); }
  assert(!!(r3 && r3.deleted), '§3 standing-stage plan still deletes with flag ON (got ' + JSON.stringify(r3) + ')');
  assert(!(r3 && r3.reassignedTo), '§3 no reassignment for a banked (standing) plan');
  assert(Object.keys(wp()).length === before3 - 1, '§3 no plan appears under anyone else (plans ' + before3 + ' -> ' + Object.keys(wp()).length + ')');
  clearPlan(H3);

  // ---- §4 a 'party'-stage plan WITH a target does not retarget ----
  setFlag(false);
  let r4seed = seedPlan(H4, MDEF);
  assert(!!r4seed, '§4 fixture: holder holds a plan');
  if (r4seed) { try { r4seed.stage = 'party'; } catch (e) {} }
  setFlag(true);
  let r4 = null;
  try { r4 = Game.winPlanSeedFromFight(H4, MDEF2, 'fled'); } catch (e) { fail('§4 seed threw (flag ON): ' + e.message); }
  assert(!!r4 && r4.target === 'influencer', '§4 retarget HOLD fires: party-stage plan keeps its target with flag ON (got ' + (r4 && r4.target) + ')');
  assert(!!r4 && r4.stage === 'party', '§4 the held plan stays party-stage');
  setFlag(false);
  let r4off = null;
  try { r4off = Game.winPlanSeedFromFight(H4, MDEF2, 'fled'); } catch (e) { fail('§4 seed threw (flag OFF): ' + e.message); }
  assert(!!r4off && r4off.target === 'reunion', '§4 OLD CODE control: the same seed retargets with flag OFF (got ' + (r4off && r4off.target) + ')');
  clearPlan(H4);

  // ---- §5 a targetless 'party'-stage plan still retargets ----
  setFlag(false);
  let r5seed = seedPlan(H5, MDEF);
  assert(!!r5seed, '§5 fixture: holder holds a plan');
  if (r5seed) { try { r5seed.stage = 'party'; r5seed.target = null; } catch (e) {} }
  setFlag(true);
  let r5 = null;
  try { r5 = Game.winPlanSeedFromFight(H5, MDEF2, 'fled'); } catch (e) { fail('§5 seed threw (flag ON): ' + e.message); }
  assert(!!r5 && r5.target === 'reunion', '§5 targetless party-stage plan still acquires the new target with flag ON (got ' + (r5 && r5.target) + ')');
  clearPlan(H5);

  // ---- §6 a 'gear'-stage plan still retargets ----
  setFlag(false);
  let r6seed = seedPlan(H6, MDEF);
  assert(!!r6seed, '§6 fixture: holder holds a plan');
  if (r6seed) { try { r6seed.stage = 'gear'; } catch (e) {} }
  setFlag(true);
  let r6 = null;
  try { r6 = Game.winPlanSeedFromFight(H6, MDEF2, 'fled'); } catch (e) { fail('§6 seed threw (flag ON): ' + e.message); }
  assert(!!r6 && r6.target === 'reunion', '§6 gear-stage plan still retargets with flag ON (got ' + (r6 && r6.target) + ')');
  clearPlan(H6);

  try { Game.say = origSay; } catch (e) {}
  setFlag(false);
}

async function main() {
  await live();
  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}
if (require.main === module) {
  main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
}
