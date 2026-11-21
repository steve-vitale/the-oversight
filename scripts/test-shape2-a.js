#!/usr/bin/env node
// scripts/test-shape2-a.js — proof test, arm sim-shape2-a
// (findings #2628/#2599: DRAFT-ARMED-HOLDER-AS-LEAD — at a wave-4+
// fight launch, the launch rule goes and fetches a living armed
// holder as the lead, even when they are not the natural lead and
// not in earshot. #2635 rides in the driver/analyzer, not here.)
// The lever, env-gated SHAPE2=1; unset = the old launch, the draft
// a no-op:
// (a) DECISION (`Game._shape2DraftLead`, pure, zero draws): gun
//     tier beats bow tier; roster order within a tier; the natural
//     lead is never replaced when already armed (gun or bow); the
//     draft fires for a holder moved far from the fight (not in
//     earshot by the game's own ally rule); skips raids, aid-routed
//     fights, scholar leads, sub-wave-4 monsters; the scholar is
//     never a candidate even with a gun in their inventory;
//     eligibility filters (sheltered / post-flee resting / sick /
//     low-health / range-0 / dead) each in isolation, plus the
//     gun-filtered -> bow-fallback shape; miss reasons by tier.
// (b) WILD ROUTER (`resolveWildMonsterEncounter`): a stubbed
//     fieldFight proves the drafted holder receives the fight (the
//     captured lead vid), the kill corpse names the holder as
//     killer, and the control legs (SHAPE2 off / raid / scholar
//     lead / post-flee rest) do not draft. A REAL fight proves the
//     fight's wounds land on the holder (health drops by exactly
//     vTaken) while the natural lead is untouched.
// (c) EXPEDITION ROUTER (`expeditionMonster`): the same stubbed
//     capture proves the drafted holder receives the fight and the
//     kill bookkeeping (expedition encounters) follows the holder.
// (d) GATE HOLD/FIRE UNCHANGED: under SHAPE2=1 + CELLGATE=1 the
//     armed searcaster still holds below wave 4 (0 shots, cells
//     kept) and fires at wave 4+ (shots > 0, cells spent).
// The encounter-gear fixture (a geared villager fighter with a
// party — never a fresh un-geared solo scholar) is shared with the
// gunrate/cellgate tests. The GUNRATE/CELLGATE substrate itself is
// proven by scripts/test-gunrate-a.js (39/39), test-cellgate-a.js
// (12/12) and test-lendpool-a.js (35/35); this test proves ONLY
// the shape-2 draft + both routers + draw-neutrality + gate
// hold/fire. The range-0 filter is proven by setting the cached
// range profile to 'homebody' (the profile cache is how the game
// itself stores a homebody villager); the aid-router live path is
// NOT proven here (forcing an aid crisis in the harness is out of
// scope — the aid miss reason is proven at the decision level and
// the router passes aid:true through, read in code).
//
// Usage: node scripts/test-shape2-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf } = require('./gunrate-driver-a');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}
function itemDef(Game, id) {
  return (Game.data.items || []).find(function (d) { return d.id === id; }) || null;
}
// Feed Math.random a fixed draw sequence; returns how many draws were consumed.
function withDraws(draws, fn) {
  const saved = Math.random;
  let di = 0;
  Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
  try { return { out: fn(), used: di }; }
  finally { Math.random = saved; }
}
function setShape2(on) { if (on) process.env.SHAPE2 = '1'; else delete process.env.SHAPE2; }
function setCellgate(on) { if (on) process.env.CELLGATE = '1'; else delete process.env.CELLGATE; }
const FIGHT_OUTCOMES = ['vKill', 'mFlee', 'vFlee', 'vDie'];

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'shape2-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const lead = roster[0];
  const pLead = personOf(Game, lead);
  console.log('lead=' + lead + ' scholar=' + Game.villagerId + ' roster=' + roster.length);
  function healthOf(v) { return ((Game.state.village || {}).health || {})[v]; }
  function setHealth(v, n) {
    Game.state.village.health = Game.state.village.health || {};
    Game.state.village.health[v] = n;
  }
  function revive(v) {
    // Fixture management between fights: full health, no post-flee
    // rest flag, alive — the test proves the draft/routers, not the fight.
    const pp = personOf(Game, v);
    try { if (pp) pp.dead = false; } catch (e) {}
    setHealth(v, 100);
    try { if (Game._postFleeRest) delete Game._postFleeRest[v]; } catch (e) {}
  }
  function armGun(v) {
    const pp = personOf(Game, v);
    resetVillager(Game, pp);
    pp.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 },
      { itemId: 'fusion_cell', name: 'Fusion cell', units: 4, kg: 0.4 }];
    Game.villagerGearUp(v, true);
    return pp;
  }
  function armBow(v, weapon, ammo, n) {
    const pp = personOf(Game, v);
    resetVillager(Game, pp);
    pp.items = [{ itemId: weapon, name: weapon, units: 1, kg: 1.0 },
      { itemId: ammo, name: ammo, units: n, kg: 0.1 }];
    Game.villagerGearUp(v, true);
    return pp;
  }
  function disarm(v) { resetVillager(Game, personOf(Game, v)); try { Game.villagerGearUp(v, true); } catch (e) {} }
  function disarmAll(vids) { for (const v of vids) disarm(v); }
  function eligible(v) {
    if (Game.isSheltered && Game.isSheltered(v)) return false;
    if (Game.isPostFleeResting && Game.isPostFleeResting(v)) return false;
    if (((Game.state.village || {}).sick || {})[v]) return false;
    const h = healthOf(v);
    if (h !== undefined && h <= 20) return false;
    if (Game.npcMaxDist && Game.npcMaxDist(v) < 1) return false;
    const pp = personOf(Game, v);
    if (!pp || pp.dead) return false;
    return true;
  }
  // Roster members (after the lead) who are eligible once armed
  // with a gun — roster order, the first `limit` left armed, the
  // rest left as they were. The first is the earliest-roster
  // eligible gun holder, which is what the draft must pick in the
  // roster-order test. (Only two are armed: the rest of the roster
  // stays free for the bow fixture.)
  function findGunHolders(limit) {
    const out = [];
    for (const v of roster) {
      if (v === lead) continue;
      armGun(v);
      if (eligible(v) && out.length < limit) out.push(v); else disarm(v);
    }
    return out;
  }
  function findBowHolder(exclude) {
    exclude = exclude || [];
    for (const v of roster) {
      if (v === lead || exclude.indexOf(v) !== -1) continue;
      armBow(v, 'bow', 'arrow', 5);
      if (eligible(v)) return v;
      disarm(v);
    }
    return null;
  }
  const eulogy = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
  const w3 = (Game.data.monsters || []).find(function (m) { return (m.wave || 1) === 3; });
  const moth = (Game.data.monsters || []).find(function (m) { return m.id === 'mirrormoth'; });

  // ---- 1. live data agreement ----
  const sear = itemDef(Game, 'searcaster');
  check('searcaster def: alien tier-4, range 8, ammo fusion_cell',
    sear && sear.origin === 'alien' && (sear.lootTier || 0) === 4 &&
    sear.weapon && sear.weapon.range === 8 && sear.weapon.ammo === 'fusion_cell',
    JSON.stringify(sear && sear.weapon));
  const cell = itemDef(Game, 'fusion_cell');
  check('fusion_cell def: material, alien, lootTier 4',
    cell && cell.class === 'material' && cell.origin === 'alien' && (cell.lootTier || 0) === 4,
    JSON.stringify(cell));
  check('eulogy fixture is wave 4', eulogy && (eulogy.wave || 1) === 4, JSON.stringify(eulogy && eulogy.wave));
  check('a wave-3 monster exists for the not-wave4 negative', !!w3, w3 && w3.id);
  check('mirrormoth fixture is wave 1', moth && (moth.wave || 1) === 1, JSON.stringify(moth && moth.wave));
  // Frozen bow list vs live items data (prereg §3): every bow-tier
  // weapon has an ammo id, and that ammo exists as an item.
  const BOWS = [['crude_bow', 'arrow'], ['bow', 'arrow'], ['starfall_bow', 'arrow'], ['apex_bow', 'arrow'], ['crossbow', 'bolt']];
  let bowDataOk = true, bowDataWhy = '';
  for (const pair of BOWS) {
    const d = itemDef(Game, pair[0]), a = itemDef(Game, pair[1]);
    if (!d || !d.weapon || d.weapon.ammo !== pair[1] || !a) { bowDataOk = false; bowDataWhy += pair[0] + ' '; }
  }
  check('bow-tier data agreement: all 5 frozen bow weapons carry their frozen ammo id, ammo items exist',
    bowDataOk, bowDataWhy || 'all five agree');

  // ---- 2. draft decision ----
  // Fixtures: the lead unarmed; the gun holder far from the fight.
  resetVillager(Game, pLead);
  try { Game.villagerGearUp(lead, true); } catch (e) {}
  revive(lead);
  const gunHolders = findGunHolders(2);
  const gunHolder = gunHolders[0] || null;
  check('fixture: an eligible gun holder exists in the roster', !!gunHolder, gunHolder || 'none eligible');
  const gunHolder2 = gunHolders[1] || null;
  check('fixture: a second eligible gun holder exists (roster-order test)', !!gunHolder2, gunHolder2 || 'only one eligible');
  const bowHolder = findBowHolder(gunHolders);
  check('fixture: an eligible bow holder exists in the roster', !!bowHolder, bowHolder || 'none eligible');
  // The gun holder moves far from the fight: (0,0) vs the monster
  // at (4,4) — Chebyshev 4, outside the lend's own earshot rule
  // (dist <= 1), and out of the lead's ally set.
  try { Game.npcSetNode(gunHolder, 0, 0); } catch (e) { console.log('move error: ' + e.message); }
  const gunNode = Game.npcNode ? Game.npcNode(gunHolder) : null;
  const gunDist = (gunNode && gunNode.nx != null) ? Math.max(Math.abs(gunNode.nx - 4), Math.abs(gunNode.ny - 4)) : null;
  const leadAllies = Game.villagerFightAllies ? Game.villagerFightAllies(lead) : [];
  check('fixture: gun holder is far from the fight (node dist 4, not among the lead\'s allies)',
    gunDist === 4 && leadAllies.indexOf(gunHolder) === -1,
    'node=' + JSON.stringify(gunNode) + ' dist=' + gunDist + ' allies=' + JSON.stringify(leadAllies));
  const mArg = { id: 'eulogy', tx: 4, ty: 4 };
  function draft(v, m, md, opts) { return Game._shape2DraftLead(v, m, md || null, opts || {}); }
  setShape2(false);
  let d = draft(lead, mArg, eulogy, {});
  check('decision off: SHAPE2 unset returns missReason off, lead unchanged, not drafted',
    d.missReason === 'off' && d.lead === lead && d.drafted === false, JSON.stringify(d));
  setShape2(true);
  d = draft(lead, mArg, eulogy, {});
  check('decision: far gun holder is drafted as lead (tier gun), even though not in earshot',
    d.drafted === true && d.lead === gunHolder && d.holder === gunHolder && d.tier === 'gun' && d.missReason === null,
    JSON.stringify(d));
  // Gun beats bow: the bow holder armed and eligible too.
  d = draft(lead, mArg, eulogy, {});
  check('decision: gun tier beats bow tier when both are eligible',
    d.drafted === true && d.lead === gunHolder && d.tier === 'gun', JSON.stringify(d));
  // Roster order within the gun tier: all eligible gun holders are
  // armed; the earliest-roster one must win.
  d = draft(lead, mArg, eulogy, {});
  check('decision: roster order within the gun tier — the earlier roster holder wins',
    d.drafted === true && d.lead === gunHolder && d.tier === 'gun', 'lead=' + d.lead + ' want=' + gunHolder);
  // Bow tier fires when no gun holder is armed.
  disarmAll(gunHolders);
  d = draft(lead, mArg, eulogy, {});
  check('decision: bow holder drafted (tier bow) when no gun holder is armed',
    d.drafted === true && d.lead === bowHolder && d.tier === 'bow' && d.missReason === null, JSON.stringify(d));
  // Crossbow + bolts is the bow tier (the other ammo id).
  disarm(bowHolder);
  const xbowHolder = findBowHolder(gunHolders);
  if (xbowHolder) { disarm(xbowHolder); armBow(xbowHolder, 'crossbow', 'bolt', 2); }
  d = draft(lead, mArg, eulogy, {});
  check('decision: crossbow + bolts is the bow tier',
    d.drafted === true && d.lead === xbowHolder && d.tier === 'bow', JSON.stringify(d));
  if (xbowHolder) disarm(xbowHolder);
  // Re-arm the gun holder for the skip/filter tests.
  armGun(gunHolder);
  d = draft(lead, mArg, eulogy, {});
  check('decision restored: gun holder drafted again after the bow tests',
    d.drafted === true && d.lead === gunHolder, JSON.stringify(d));
  // Lead already armed: gun, then bow.
  armGun(lead);
  d = draft(lead, mArg, eulogy, {});
  check('decision: armed lead (gun) is never replaced — missReason lead-already-armed, tier gun',
    d.drafted === false && d.lead === lead && d.missReason === 'lead-already-armed' && d.tier === 'gun', JSON.stringify(d));
  disarm(lead);
  armBow(lead, 'bow', 'arrow', 5);
  d = draft(lead, mArg, eulogy, {});
  check('decision: armed lead (bow) is never replaced — missReason lead-already-armed, tier bow',
    d.drafted === false && d.lead === lead && d.missReason === 'lead-already-armed' && d.tier === 'bow', JSON.stringify(d));
  disarm(lead);
  // Scope skips.
  d = draft(lead, { id: w3.id, tx: 4, ty: 4 }, w3, {});
  check('decision: sub-wave-4 monster is out of scope (not-wave4)',
    d.drafted === false && d.missReason === 'not-wave4', JSON.stringify(d));
  d = draft(lead, mArg, eulogy, { raid: true });
  check('decision: raid is out of scope (raid)', d.drafted === false && d.missReason === 'raid', JSON.stringify(d));
  d = draft(lead, mArg, eulogy, { aid: true });
  check('decision: aid-routed fight is out of scope (aid)', d.drafted === false && d.missReason === 'aid', JSON.stringify(d));
  d = draft(Game.villagerId, mArg, eulogy, {});
  check('decision: scholar-led fight is out of scope (scholar-lead)',
    d.drafted === false && d.missReason === 'scholar-lead', JSON.stringify(d));
  // The scholar is never a candidate, even with a gun in inventory.
  const scholarInv = (Game.state.scholar || {}).inventory || [];
  scholarInv.push({ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 });
  scholarInv.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: 4, kg: 0.4 });
  disarmAll(roster);
  d = draft(lead, mArg, eulogy, {});
  check('decision: scholar never a candidate — only the scholar armed means no-living-holder, zero candidates',
    d.drafted === false && d.missReason === 'no-living-holder' && d.candidates.length === 0, JSON.stringify(d));
  // Pull the scholar's gun back out of the inventory.
  for (let i = scholarInv.length - 1; i >= 0; i--) {
    if (scholarInv[i].itemId === 'searcaster' || scholarInv[i].itemId === 'fusion_cell') scholarInv.splice(i, 1);
  }
  // No living holder at all.
  d = draft(lead, mArg, eulogy, {});
  check('decision: no living holder anywhere means no-living-holder',
    d.drafted === false && d.missReason === 'no-living-holder', JSON.stringify(d));
  // Eligibility filters, each in isolation with the gun holder as
  // the ONLY armed candidate (so the miss reason is unambiguous).
  armGun(gunHolder);
  function onlyGunHolder() { disarmAll(roster.filter(function (v) { return v !== gunHolder; })); }
  onlyGunHolder();
  Game.state.village.sheltered = Game.state.village.sheltered || {};
  Game.state.village.sheltered[gunHolder] = true;
  d = draft(lead, mArg, eulogy, {});
  check('filter: sheltered gun holder is skipped (gun:sheltered, candidate fail recorded)',
    d.drafted === false && d.missReason === 'gun:sheltered' && d.candidates.length === 1 && d.candidates[0].fail === 'sheltered',
    JSON.stringify(d));
  // Gun filtered -> bow fallback: the bow holder is still picked.
  armBow(bowHolder, 'bow', 'arrow', 5);
  d = draft(lead, mArg, eulogy, {});
  check('filter: sheltered gun holder falls back to the eligible bow holder',
    d.drafted === true && d.lead === bowHolder && d.tier === 'bow', JSON.stringify(d));
  disarm(bowHolder);
  delete Game.state.village.sheltered[gunHolder];
  Game._postFleeRest = Game._postFleeRest || {};
  Game._postFleeRest[gunHolder] = Game.postFleeRestDay();
  d = draft(lead, mArg, eulogy, {});
  check('filter: post-flee resting gun holder is skipped (gun:resting)',
    d.drafted === false && d.missReason === 'gun:resting', JSON.stringify(d));
  delete Game._postFleeRest[gunHolder];
  Game.state.village.sick = Game.state.village.sick || {};
  Game.state.village.sick[gunHolder] = true;
  d = draft(lead, mArg, eulogy, {});
  check('filter: sick gun holder is skipped (gun:sick)',
    d.drafted === false && d.missReason === 'gun:sick', JSON.stringify(d));
  delete Game.state.village.sick[gunHolder];
  setHealth(gunHolder, 10);
  d = draft(lead, mArg, eulogy, {});
  check('filter: low-health gun holder is skipped (gun:low-health)',
    d.drafted === false && d.missReason === 'gun:low-health', JSON.stringify(d));
  setHealth(gunHolder, 100);
  const st = Game.agencyState();
  const savedProfile = st.profiles[gunHolder];
  st.profiles[gunHolder] = 'homebody';
  d = draft(lead, mArg, eulogy, {});
  check('filter: range-0 gun holder is skipped (gun:range0)',
    d.drafted === false && d.missReason === 'gun:range0' && Game.npcMaxDist(gunHolder) === 0, JSON.stringify(d));
  if (savedProfile === undefined) delete st.profiles[gunHolder]; else st.profiles[gunHolder] = savedProfile;
  const pGun = personOf(Game, gunHolder);
  pGun.dead = true;
  d = draft(lead, mArg, eulogy, {});
  check('filter: dead gun holder is not a candidate at all (no-living-holder, zero candidates)',
    d.drafted === false && d.missReason === 'no-living-holder' && d.candidates.length === 0, JSON.stringify(d));
  pGun.dead = false;
  // Bow-only filter: the bow holder alone, sheltered.
  disarm(gunHolder);
  armBow(bowHolder, 'bow', 'arrow', 5);
  Game.state.village.sheltered[bowHolder] = true;
  d = draft(lead, mArg, eulogy, {});
  check('filter: sheltered bow-only holder is skipped (bow:sheltered)',
    d.drafted === false && d.missReason === 'bow:sheltered', JSON.stringify(d));
  delete Game.state.village.sheltered[bowHolder];
  disarm(bowHolder);
  // Draw-neutrality of the decision: zero draws, on or off.
  armGun(gunHolder);
  const longDraws = [];
  for (let i = 0; i < 200; i++) longDraws.push(0.5);
  setShape2(true);
  const drawsOn = withDraws(longDraws, function () { return draft(lead, mArg, eulogy, {}); }).used;
  setShape2(false);
  const drawsOff = withDraws(longDraws, function () { return draft(lead, mArg, eulogy, {}); }).used;
  check('draw-neutrality: the decision consumes zero draws, SHAPE2 on or off',
    drawsOn === 0 && drawsOff === 0, 'on=' + drawsOn + ' off=' + drawsOff);
  setShape2(true);

  // ---- 3. wild router: resolveWildMonsterEncounter ----
  // Fixture: lead unarmed + revived; gun holder armed, eligible,
  // far away (0,0). The stubbed fieldFight captures the lead vid.
  revive(lead); revive(gunHolder);
  resetVillager(Game, pLead);
  try { Game.villagerGearUp(lead, true); } catch (e) {}
  armGun(gunHolder);
  try { Game.npcSetNode(gunHolder, 0, 0); } catch (e) {}
  const realFF = Game.fieldFight;
  let captured = null;
  function stubFight(outcome, vTaken) {
    captured = null;
    Game.fieldFight = function (v, md, m, o) {
      captured = { vid: v, allies: (o && o.allyVids) || [] };
      return { outcome: outcome, rounds: 3, vTaken: vTaken, calledHelp: false, log: [] };
    };
  }
  function corpses() {
    try { return Game.corpses ? Game.corpses() : (Game.state.corpses || []); } catch (e) { return []; }
  }
  stubFight('vKill', 25);
  let rec = null;
  try { rec = Game.resolveWildMonsterEncounter(lead, mArg, {}); } catch (e) { console.log('wild stub error: ' + e.message); }
  check('wild router: stubbed fieldFight receives the DRAFTED holder as lead (not the natural lead)',
    captured && captured.vid === gunHolder, 'captured=' + JSON.stringify(captured));
  check('wild router: stubbed vKill returns the fight record', rec && rec.outcome === 'vKill', JSON.stringify(rec && rec.outcome));
  const killCorpse = (corpses() || []).find(function (c) { return c.kind === 'monster' && c.monsterId === 'eulogy' && c.killerId === gunHolder; });
  check('wild router: the kill corpse names the DRAFTED holder as killer (kill credit follows the draft)',
    !!killCorpse, JSON.stringify((corpses() || []).map(function (c) { return { kind: c.kind, monsterId: c.monsterId, killerId: c.killerId }; })));
  // The stubbed record carries no real damage settlement (the gear
  // settlement warns and skips), so wounds are proven on the REAL
  // fight below, not here. The stub proves routing + kill credit.
  Game.fieldFight = realFF;
  // Control: SHAPE2 off — the natural lead fights.
  setShape2(false);
  revive(lead); revive(gunHolder);
  armGun(gunHolder);
  try { Game.npcSetNode(gunHolder, 0, 0); } catch (e) {}
  stubFight('vKill', 25);
  rec = null;
  try { rec = Game.resolveWildMonsterEncounter(lead, mArg, {}); } catch (e) { console.log('wild control error: ' + e.message); }
  check('wild router control: SHAPE2 off, the natural lead fights (no swap)',
    captured && captured.vid === lead, 'captured=' + JSON.stringify(captured));
  Game.fieldFight = realFF;
  // Control: raid — no draft even with SHAPE2 on.
  setShape2(true);
  revive(lead); revive(gunHolder);
  armGun(gunHolder);
  try { Game.npcSetNode(gunHolder, 0, 0); } catch (e) {}
  stubFight('vKill', 25);
  rec = null;
  try { rec = Game.resolveWildMonsterEncounter(lead, mArg, { raid: true }); } catch (e) { console.log('wild raid error: ' + e.message); }
  check('wild router control: raid does not draft (natural lead defends)',
    captured && captured.vid === lead, 'captured=' + JSON.stringify(captured));
  Game.fieldFight = realFF;
  // Control: scholar-led fight — no draft away from the scholar.
  revive(lead); revive(gunHolder);
  armGun(gunHolder);
  stubFight('vFlee', 10);
  rec = null;
  try { rec = Game.resolveWildMonsterEncounter(Game.villagerId, mArg, {}); } catch (e) { console.log('wild scholar error: ' + e.message); }
  check('wild router control: scholar-led fight does not draft (scholar stays lead)',
    captured && captured.vid === Game.villagerId, 'captured=' + JSON.stringify(captured));
  Game.fieldFight = realFF;
  // Control: post-flee rest on the natural lead — no fight is
  // conjured at all, and no draft runs.
  revive(lead); revive(gunHolder);
  armGun(gunHolder);
  Game._postFleeRest = Game._postFleeRest || {};
  Game._postFleeRest[lead] = Game.postFleeRestDay();
  stubFight('vKill', 25);
  rec = 'not-null';
  try { rec = Game.resolveWildMonsterEncounter(lead, mArg, {}); } catch (e) { console.log('wild rest error: ' + e.message); }
  check('wild router control: post-flee resting lead returns null (no fight conjured, no draft)',
    rec === null && captured === null, 'rec=' + JSON.stringify(rec) + ' captured=' + JSON.stringify(captured));
  Game.fieldFight = realFF;
  delete Game._postFleeRest[lead];
  // REAL fight: wounds land on the drafted holder, exactly vTaken;
  // the natural lead is untouched.
  setShape2(true);
  revive(lead); revive(gunHolder);
  resetVillager(Game, pLead);
  try { Game.villagerGearUp(lead, true); } catch (e) {}
  armGun(gunHolder);
  try { Game.npcSetNode(gunHolder, 0, 0); } catch (e) {}
  let realRec = null, realOutcome = null, realVTaken = null;
  let fought = false;
  for (let attempt = 1; attempt <= 3 && !fought; attempt++) {
    const hb = healthOf(gunHolder), lb = healthOf(lead);
    try { realRec = Game.resolveWildMonsterEncounter(lead, mArg, {}); } catch (e) { console.log('wild real error: ' + e.message); break; }
    if (realRec && FIGHT_OUTCOMES.indexOf(realRec.outcome) !== -1 && (realRec.vTaken | 0) > 0) {
      fought = true;
      realOutcome = realRec.outcome; realVTaken = realRec.vTaken;
      check('wild router real fight: resolves to a real fight outcome with wounds',
        true, 'outcome=' + realOutcome + ' vTaken=' + realVTaken + ' attempt=' + attempt);
      check('wild router real fight: the DRAFTED holder takes exactly vTaken in wounds',
        healthOf(gunHolder) === hb - realVTaken,
        'holder ' + hb + '->' + healthOf(gunHolder) + ' vTaken=' + realVTaken);
      check('wild router real fight: the natural lead is untouched',
        healthOf(lead) === lb, 'lead ' + lb + '->' + healthOf(lead));
    } else {
      // Evade or a woundless outcome: revive the holder and retry;
      // the test proves the draft, not the fight's luck.
      revive(gunHolder);
      armGun(gunHolder);
      try { Game.npcSetNode(gunHolder, 0, 0); } catch (e) {}
    }
  }
  check('wild router real fight: a wounding fight landed within 3 attempts',
    fought, 'outcome=' + realOutcome + ' vTaken=' + realVTaken);
  setShape2(false);

  // ---- 4. expedition router: expeditionMonster ----
  setShape2(true);
  revive(lead); revive(gunHolder);
  resetVillager(Game, pLead);
  try { Game.villagerGearUp(lead, true); } catch (e) {}
  armGun(gunHolder);
  try { Game.npcSetNode(gunHolder, 0, 0); } catch (e) {}
  const ast = Game.agencyState();
  ast.exped[gunHolder] = { encounters: [], meat: [] };
  ast.exped[lead] = { encounters: [], meat: [] };
  const realPool = Game.monsterWavePool, realGate = Game.winPlanFightGate;
  Game.monsterWavePool = function () { return [eulogy]; };
  Game.winPlanFightGate = function () { return null; };
  stubFight('vKill', 10);
  try { Game.expeditionMonster(lead, 2, false); } catch (e) { console.log('exped error: ' + e.message); }
  check('expedition router: stubbed fieldFight receives the DRAFTED holder as lead',
    captured && captured.vid === gunHolder, 'captured=' + JSON.stringify(captured));
  check('expedition router: the kill bookkeeping follows the drafted holder (expedition encounters)',
    (ast.exped[gunHolder].encounters || []).some(function (s) { return /killed eulogy/.test(s); }) &&
    (ast.exped[lead].encounters || []).length === 0,
    'holder=' + JSON.stringify(ast.exped[gunHolder].encounters) + ' lead=' + JSON.stringify(ast.exped[lead].encounters));
  Game.fieldFight = realFF;
  // Control: SHAPE2 off — the natural lead fights and is booked.
  setShape2(false);
  revive(lead); revive(gunHolder);
  armGun(gunHolder);
  ast.exped[gunHolder] = { encounters: [], meat: [] };
  ast.exped[lead] = { encounters: [], meat: [] };
  stubFight('vKill', 10);
  try { Game.expeditionMonster(lead, 2, false); } catch (e) { console.log('exped control error: ' + e.message); }
  check('expedition router control: SHAPE2 off, the natural lead fights and is booked',
    captured && captured.vid === lead &&
    (ast.exped[lead].encounters || []).some(function (s) { return /killed eulogy/.test(s); }),
    'captured=' + JSON.stringify(captured) + ' leadEnc=' + JSON.stringify(ast.exped[lead].encounters));
  Game.fieldFight = realFF;
  Game.monsterWavePool = realPool; Game.winPlanFightGate = realGate;
  setShape2(false);

  // ---- 5. the gate hold/fire is unchanged under SHAPE2=1 ----
  function armSearcaster(v, cells) {
    const pp = personOf(Game, v);
    resetVillager(Game, pp);
    pp.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) pp.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(v, true);
  }
  setShape2(true); setCellgate(true);
  armSearcaster(lead, 4);
  let recH = null;
  try { recH = Game.fieldFight(lead, moth, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('gate holds below wave 4 under SHAPE2=1 (0 shots, CELLGATE=1)',
    recH && recH.volley && recH.volley.shots === 0, JSON.stringify(recH && recH.volley));
  check('gate keeps all 4 cells below wave 4 under SHAPE2=1',
    recH && recH.volley && ammoCountOf(pLead.items, 'fusion_cell') === 4,
    'cells=' + ammoCountOf(pLead.items, 'fusion_cell'));
  armSearcaster(lead, 4);
  let recW = null;
  try { recW = Game.fieldFight(lead, eulogy, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('gate fires at wave 4+ under SHAPE2=1 (shots > 0, CELLGATE=1)',
    recW && recW.volley && recW.volley.shots > 0, JSON.stringify(recW && recW.volley));
  check('wave-4+ volley spends exactly its shots in cells under SHAPE2=1',
    recW && recW.volley && ammoCountOf(pLead.items, 'fusion_cell') === 4 - recW.volley.shots,
    'left=' + ammoCountOf(pLead.items, 'fusion_cell') + ' shots=' + (recW && recW.volley && recW.volley.shots));
  setShape2(false); setCellgate(false);

  // ---- 6. analyzer selftest (analyze-shape2-a --selftest) ----
  console.log('\n=== Analyzer selftest (analyze-shape2-a --selftest) ===');
  let anaSelf = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-shape2-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    anaSelf = /101 passed, 0 failed/.test(anaOut);
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (101 passed, 0 failed — incl. draftStats + bowStats + grantsByLeadCount + judgeShape2)', anaSelf === true, anaSelf === null ? 'no output' : 'see output above');

  console.log('SHAPE2_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('SHAPE2_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
