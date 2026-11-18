// test-wildavoid-a.js — proof test, arm sim-wildavoid-a.
// Proves the build and its instrument:
//   §1 LIVE routers: an outmatched party avoids on the wild routers
//      (resolveWildMonsterEncounter + resolvePatrol) when WILDAVOID=1
//      — the avoid sentinel, the 'gives it room' line, the wildAvoids
//      bump, the monster left in the world — and FIGHTS when the flag
//      is off; a full geared trio does NOT avoid (herald or Suburb,
//      trick known or not); the Suburb trick still fires round 1 for
//      a trio that does fight (the learning path is untouched by the
//      rule, per the census band's party-3/3 finding).
//   §2 LIVE helper-vs-gate agreement: winPlanOutmatched agrees with
//      winPlanFightGate's outmatched branch on every staged fixture
//      (solo/duo/trio x armed/armored x wave 3/4, plan/no-plan,
//      table veteran, VETREENGAGE counted member); the veteran-guard
//      still fires where it did and the SEEK still fires where it did;
//      the helper is pure (no plan mutation, no seeding, no bumps).
//   §3 LIVE exemptions: a raid (opts.raid) never avoids; a
//      post-flee-resting villager returns null, not an avoid.
//   §4 Analyzer on synthetic legs (its own --selftest, asserted 0
//      failures) + driver/panel-builder exports.
//   §5 Src confinement: the only src files changed on this branch are
//      src/js/game.js and src/js/win-plan.js; party-wiring.js (the
//      sense arm's file) and comms.js carry no wildavoid change.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Encounter-gear rule (Steve 2026-11-13): the live cases stage a
// geared scholar-side party — a geared trio that fights, never a
// fresh un-geared solo scholar as the "should fight" case.
// Sensing control: trust is the sense's answer floor (15) and every
// villager starts on the Haven node, so a fighter senses the two
// highest-trust villagers by default. Each case therefore stages its
// own trust explicitly — zeroTrust() for solos, setTrio() for trios —
// and each §2 fixture fully re-stages its villager (plan, kill log,
// expeditions, gear, trust) so fixtures never share state.
// Usage: node scripts/test-wildavoid-a.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const driver = require('./wildavoid-driver-a');
const A = require('./analyze-wildavoid-a');
const panelBuilder = require('./build-wildavoid-panels-a');

const REPO = path.join(__dirname, '..');
let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
const FIGHT_OUTCOMES = ['vKill', 'vFlee', 'vDie', 'mFlee', 'evade', 'alreadyDead'];

async function live() {
  process.env.WILDAVOID = '1';
  const { Game, loadFails } = await loadGame({ seed: 104411, mode: 'test' });
  if (loadFails && loadFails.length) { fail('live module load failures: ' + loadFails.join('; ')); return; }
  // Capture say lines (the avoid's fiction line) the way the driver
  // does — wrap before setupGame so nothing is missed.
  const saidLines = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try { if (typeof arguments[0] === 'string') saidLines.push(String(arguments[0])); } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) {}
  await setupGame(Game);
  const mdef = function (id) { return (Game.data.monsters || []).find(function (m) { return m.id === id; }); };
  const mdefWave = function (w) { return (Game.data.monsters || []).find(function (m) { return m.wave === w; }); };
  const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 6) { fail('live need 6+ NPCs, have ' + roster.length); return; }
  const setHealth = function (vid, hp) { ((Game.state.village.health = Game.state.village.health || {}))[vid] = hp; };
  const alive = function (vid) {
    try { const p = Game.getPerson ? Game.getPerson(vid) : null; return !!(p && !p.dead); } catch (e) { return true; }
  };
  const firstName = function (vid) {
    try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
    try { return Game.displayName(vid); } catch (e) { return 'Someone'; }
  };
  const sensed = function (vid) { try { return Game.villagerFightAllies(vid) || []; } catch (e) { return []; } };
  const wildAvoids = function () { try { return (((Game.state.village || {}).winPlanStats || {}).wildAvoids | 0); } catch (e) { return 0; } };
  const avoidances = function () { try { return (((Game.state.village || {}).winPlanStats || {}).avoidances | 0); } catch (e) { return 0; } };
  const planOf = function (vid) { try { return ((Game.state.village || {}).winPlan || {})[vid] || null; } catch (e) { return null; } };
  const weaponDef = (Game.data.items || []).find(function (d) { return d && d.weapon && (d.weapon.bonus | 0) > 0; });
  const armorDef = (Game.data.items || []).find(function (d) { return d && d.armor && (d.armor.protection | 0) > 0; });
  assert(!!weaponDef && !!armorDef, '§1 staged gear exists in data (weapon ' + (weaponDef && weaponDef.id) + ', armor ' + (armorDef && armorDef.id) + ')');
  // Gear staging: the villager CARRIES the weapon + armor, then
  // villagerGearUp (autoEquip) wears the best of what they carry.
  // Staging equipped alone is undone at fight entry — fieldFight
  // re-equips from items (fieldFights.js:587) — so a staged fighter
  // who only wears the gear loses it the moment they fight.
  const itemDefOf = function (id) { return (Game.data.items || []).find(function (d) { return d && d.id === id; }); };
  const gearUp = function (vid) {
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (!p) return false;
      p.items = p.items || [];
      const has = function (id) { return p.items.some(function (i) { return (i && (i.itemId || i.id || i)) === id; }); };
      if (!has(weaponDef.id)) p.items.push(weaponDef.id);
      if (!has(armorDef.id)) p.items.push(armorDef.id);
      if (Game.villagerGearUp) Game.villagerGearUp(vid, false);
      const g = driver.gearOfReplica(Game, vid);
      return !!(g.armed && g.armored);
    } catch (e) { return false; }
  };
  const stripArmor = function (vid) {
    // Remove every armor item the villager carries, then re-equip:
    // they keep a weapon (armed) but wear no armor (unarmored).
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (!p) return;
      p.items = (p.items || []).filter(function (i) {
        const iid = i && (i.itemId || i.id || i);
        const def = itemDefOf(iid);
        return !(def && def.armor);
      });
      p.equipped = {};
      if (Game.villagerGearUp) Game.villagerGearUp(vid, false);
    } catch (e) {}
  };
  const armWeaponOnly = function (vid) {
    // Weapon only: carry + wear the staged weapon, wear no armor.
    stripArmor(vid);
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (!p) return false;
      p.items = p.items || [];
      if (!p.items.some(function (i) { return (i && (i.itemId || i.id || i)) === weaponDef.id; })) p.items.push(weaponDef.id);
      if (Game.villagerGearUp) Game.villagerGearUp(vid, false);
      const g = driver.gearOfReplica(Game, vid);
      return !!(g.armed && !g.armored);
    } catch (e) { return false; }
  };
  const gearDown = function (vid) {
    // Clear staged gear (the staged weapon + armor ids only; the
    // villager's own carried gear stays).
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (!p) return;
      p.items = (p.items || []).filter(function (i) {
        const iid = i && (i.itemId || i.id || i);
        return iid !== weaponDef.id && iid !== armorDef.id;
      });
      p.equipped = {};
    } catch (e) {}
  };
  // A flee that ends at <=25% HP marks the villager resting for the
  // day (game.js markPostFleeRest); a rested fixture returns null, not
  // an avoid or a fight. Clear it before each live case so one case's
  // mauling never decides the next case's outcome.
  const clearRest = function (vid) { try { if (Game._postFleeRest) delete Game._postFleeRest[vid]; } catch (e) {} };
  // Trust staging: zeroTrust() makes everyone solo (nothing clears
  // the 15 answer floor); setTrio() then trusts exactly two allies.
  const zeroTrust = function () {
    const t = (Game.state.village.trust = Game.state.village.trust || {});
    for (const id of roster) t[id] = 0;
  };
  const setTrio = function (fighter, allies) {
    zeroTrust();
    for (const id of allies) Game.state.village.trust[id] = 90;
    return sensed(fighter);
  };
  const herald = mdef('herald'), suburb = mdef('suburb'), w3 = mdefWave(3);
  assert(!!herald && herald.wave === 4, '§1 herald def is wave 4');
  assert(!!suburb && suburb.wave === 4, '§1 suburb def is wave 4');
  assert(!!w3 && w3.wave === 3, '§1 found a wave-3 def (' + (w3 && w3.id) + ')');
  assert(typeof Game.winPlanOutmatched === 'function', '§1 Game.winPlanOutmatched exists');
  assert(typeof Game.winPlanFightParty === 'function', '§1 Game.winPlanFightParty exists');
  assert(typeof Game.winPlanFightGate === 'function', '§1 Game.winPlanFightGate exists');

  // One fresh villager per live case: a case that fights may wound or
  // kill its fighter, so no case reuses another case's fighter (only
  // §1b reuses §1a's solo — the avoid never fights — and §1g reuses
  // §1f's patroller for the same reason).
  const taken = new Set();
  const takeAlive = function (n) {
    const out = [];
    for (const id of roster) {
      if (out.length >= n) break;
      if (alive(id) && !taken.has(id)) { taken.add(id); out.push(id); }
    }
    return out;
  };
  const solo = takeAlive(1)[0];
  const trio = takeAlive(3);
  const trioD = takeAlive(3);
  const solo2 = takeAlive(1)[0];
  const patrolSolo = takeAlive(1)[0];
  assert(!!solo && trio.length === 3 && trioD.length === 3 && !!solo2 && !!patrolSolo,
    '§1 took distinct fresh villagers for each live case');
  const fakeM = function (id) { return { id: id, tx: 4, ty: 4 }; };

  // §1a: solo vs herald, WILDAVOID=1 — avoids.
  zeroTrust();
  clearRest(solo);
  assert(sensed(solo).length === 0, '§1a fixture is solo (sensed 0)');
  setHealth(solo, 100);
  const saidBefore = saidLines.length;
  const r1a = Game.resolveWildMonsterEncounter(solo, fakeM('herald'));
  assert(!!r1a && r1a.avoided === true && r1a.reason === 'outmatched' && r1a.viaAid === false,
    '§1a solo vs herald avoids (avoided ' + (r1a && r1a.avoided) + ', reason ' + (r1a && r1a.reason) + ')');
  assert(wildAvoids() === 1, '§1a wildAvoids bumped to 1 (got ' + wildAvoids() + ')');
  assert(saidLines.slice(saidBefore).some(function (l) { return l.indexOf('gives it room') !== -1; }),
    '§1a the avoid says the line ("gives it room")');
  assert(planOf(solo) == null, '§1a the avoid seeds no plan (plan still null)');

  // §1b: same meeting, flag OFF — fights (the flag gates the lever).
  delete process.env.WILDAVOID;
  setHealth(solo, 100);
  clearRest(solo);
  const r1b = Game.resolveWildMonsterEncounter(solo, fakeM('herald'));
  assert(!!r1b && FIGHT_OUTCOMES.indexOf(r1b.outcome) !== -1 && !r1b.avoided,
    '§1b flag off: the same meeting fights (outcome ' + (r1b && r1b.outcome) + ')');
  assert(wildAvoids() === 1, '§1b the flag-off fight bumps no wildAvoid (still 1)');
  process.env.WILDAVOID = '1';

  // §1c: geared trio vs herald — does NOT avoid.
  for (const id of trio) { setHealth(id, 100); clearRest(id); }
  let trioOk = true;
  for (const id of trio) if (!gearUp(id)) trioOk = false;
  assert(trioOk, '§1c trio geared (armed + armored via the gear replica)');
  assert(setTrio(trio[0], [trio[1], trio[2]]).length === 2, '§1c fighter senses both allies (sensed 2)');
  const r1c = Game.resolveWildMonsterEncounter(trio[0], fakeM('herald'));
  assert(!!r1c && FIGHT_OUTCOMES.indexOf(r1c.outcome) !== -1 && !r1c.avoided,
    '§1c geared trio vs herald fights (outcome ' + (r1c && r1c.outcome) + ', not avoided)');
  assert(wildAvoids() === 1, '§1c the trio fight bumps no wildAvoid (still 1)');

  // §1d: Suburb, trick KNOWN, a FRESH geared trio — does NOT avoid;
  // the trick fires round 1 (the learning path is untouched by the
  // rule). A fresh trio: §1c's trio may be wounded from the herald.
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  Game.state.villagerTricks.suburb = true;
  for (const id of trioD) { setHealth(id, 100); clearRest(id); }
  let trioDOk = true;
  for (const id of trioD) if (!gearUp(id)) trioDOk = false;
  assert(trioDOk, '§1d trio geared (armed + armored via the gear replica)');
  assert(setTrio(trioD[0], [trioD[1], trioD[2]]).length === 2, '§1d trio staged (sensed 2)');
  const r1d = Game.resolveWildMonsterEncounter(trioD[0], fakeM('suburb'));
  assert(!!r1d && !r1d.avoided && r1d.outcome === 'vFlee' && r1d.fleeWise === true && (r1d.rounds | 0) === 1 && (r1d.mDealt | 0) === 0,
    '§1d known-trick trio vs Suburb: no avoid, round-1 wise leave (outcome ' + (r1d && r1d.outcome) + ', fleeWise ' + (r1d && r1d.fleeWise) + ', rounds ' + (r1d && r1d.rounds) + ')');

  // §1e: Suburb, trick KNOWN, solo — DOES avoid (the rule fires on
  // party/gear, not on species; the avoid replaces the round-1 flee).
  zeroTrust();
  clearRest(solo2);
  assert(sensed(solo2).length === 0, '§1e fixture is solo (sensed 0)');
  setHealth(solo2, 100);
  const r1e = Game.resolveWildMonsterEncounter(solo2, fakeM('suburb'));
  assert(!!r1e && r1e.avoided === true && r1e.reason === 'outmatched',
    '§1e known-trick solo vs Suburb avoids (avoided ' + (r1e && r1e.avoided) + ')');
  assert(wildAvoids() === 2, '§1e wildAvoids bumped to 2 (got ' + wildAvoids() + ')');

  // §1f: patrol, solo, WILDAVOID=1 — avoids (world monster staged).
  const v = Game.state.village;
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  Game.state.worldMonsters = Game.state.worldMonsters || [];
  const staged = { id: 'herald', tx: hx, ty: hy };
  Game.state.worldMonsters.push(staged);
  zeroTrust();
  clearRest(patrolSolo);
  assert(sensed(patrolSolo).length === 0, '§1f fixture is solo (sensed 0)');
  setHealth(patrolSolo, 100);
  const r1f = Game.resolvePatrol(patrolSolo, firstName(patrolSolo));
  assert(!!r1f && r1f.avoided === true && r1f.reason === 'outmatched',
    '§1f solo patrol vs herald avoids (avoided ' + (r1f && r1f.avoided) + ')');
  assert(wildAvoids() === 3, '§1f wildAvoids bumped to 3 (got ' + wildAvoids() + ')');
  assert(Game.state.worldMonsters.indexOf(staged) !== -1, '§1f the avoided beast stays in the world');

  // §1g: patrol, flag OFF — the same solo patroller fights.
  delete process.env.WILDAVOID;
  setHealth(patrolSolo, 100);
  clearRest(patrolSolo);
  const r1g = Game.resolvePatrol(patrolSolo, firstName(patrolSolo));
  assert(!!r1g && FIGHT_OUTCOMES.indexOf(r1g.outcome) !== -1 && !r1g.avoided,
    '§1g flag off: the patrol fights (outcome ' + (r1g && r1g.outcome) + ')');
  process.env.WILDAVOID = '1';
  // Clean the staged monster so later fixtures see a clean world.
  try { const i = Game.state.worldMonsters.indexOf(staged); if (i !== -1) Game.state.worldMonsters.splice(i, 1); } catch (e) {}

  // §2: helper-vs-gate agreement fixtures. Each fixture takes a fresh
  // alive villager (or a re-staged one — clearVid wipes its plan, kill
  // log, expeditions, and gear first, and trust is re-staged per
  // fixture, so reuse is sound).
  const usedVids = new Set();
  const clearVid = function (vid) {
    try { const wp = ((Game.state.village || {}).winPlan || {}); delete wp[vid]; } catch (e) {}
    try { Game.state.waveKillLog = (Game.state.waveKillLog || []).filter(function (r) { return r.by !== vid; }); } catch (e) {}
    try { const a = Game.agencyState ? Game.agencyState() : null; if (a && a.exped) delete a.exped[vid]; } catch (e) {}
    gearDown(vid);
  };
  const takeVid = function () {
    for (const id of roster) if (alive(id) && !usedVids.has(id)) { usedVids.add(id); clearVid(id); setHealth(id, 100); return id; }
    for (const id of roster) if (alive(id)) { usedVids.add(id); clearVid(id); setHealth(id, 100); return id; }
    return null;
  };
  const gateReason = function (ret) { return ret ? (ret.avoid ? 'avoid:' + (ret.reason || '?') : (ret.seek ? 'seek' : 'null')) : 'null'; };
  const agree = function (vid, m, label) {
    const h = Game.winPlanOutmatched(vid, m);
    const g = Game.winPlanFightGate(vid, m);
    const hAvoid = !!(h && h.avoid);
    const gOutmatched = !!(g && g.avoid && g.reason === 'outmatched');
    assert(hAvoid === gOutmatched, '§2 ' + label + ': helper avoid=' + hAvoid + ' vs gate outmatched=' + gOutmatched +
      ' (gate ' + gateReason(g) + ')');
    return { h: h, g: g };
  };
  const twoAllies = function (vid) {
    // The first two alive roster members that are not the fighter.
    const out = [];
    for (const id of roster) if (id !== vid && alive(id) && out.length < 2) out.push(id);
    return out;
  };
  // F1: solo, no plan, wave-4 — both avoid/outmatched; the gate seeds
  // a plan (its side effect stays in the gate).
  const f1 = takeVid();
  assert(!!f1, '§2 F1 took a villager');
  zeroTrust();
  assert(sensed(f1).length === 0, '§2 F1 fixture is solo (sensed 0)');
  const rF1 = agree(f1, herald, 'F1 solo/no-plan/wave-4');
  assert(!!(rF1.g && rF1.g.avoid && rF1.g.reason === 'outmatched'), '§2 F1 gate returns avoid/outmatched');
  assert(planOf(f1) != null, '§2 F1 the gate seeds a plan when there is none (side effect intact)');
  // F2: solo, no plan, wave-3 — neither avoids (rule is wave>=4).
  const f2 = takeVid();
  assert(!!f2, '§2 F2 took a villager');
  zeroTrust();
  agree(f2, w3, 'F2 solo/no-plan/wave-3');
  // F3: geared trio, no plan, wave-4 — neither avoids.
  const f3 = takeVid();
  assert(!!f3, '§2 F3 took a villager');
  const f3allies = twoAllies(f3);
  assert(f3allies.length === 2, '§2 F3 found two allies');
  gearUp(f3);
  for (const id of f3allies) gearUp(id);
  assert(setTrio(f3, f3allies).length === 2, '§2 F3 fixture senses 2 allies (party 3)');
  agree(f3, herald, 'F3 geared trio/no-plan/wave-4');
  // F4: duo geared, no plan, wave-4 — both avoid.
  const f4 = takeVid();
  assert(!!f4, '§2 F4 took a villager');
  const f4ally = twoAllies(f4)[0];
  gearUp(f4); gearUp(f4ally);
  zeroTrust();
  Game.state.village.trust[f4ally] = 90;
  assert(sensed(f4).length === 1, '§2 F4 fixture senses 1 ally (party 2, got ' + sensed(f4).length + ')');
  agree(f4, herald, 'F4 geared duo/no-plan/wave-4');
  // F5: trio, fighter unarmored — both avoid (gear clause). The
  // fighter carries + wears a weapon but no armor, so only the armor
  // clause fires.
  const f5 = takeVid();
  assert(!!f5, '§2 F5 took a villager');
  const f5allies = twoAllies(f5);
  for (const id of f5allies) gearUp(id);
  assert(armWeaponOnly(f5) === true, '§2 F5 fighter is armed but unarmored');
  assert(setTrio(f5, f5allies).length === 2, '§2 F5 fixture senses 2 allies (party 3)');
  assert(Game.winPlanOutmatched(f5, herald) && Game.winPlanOutmatched(f5, herald).avoid === true,
    '§2 F5 unarmored fighter in a trio is outmatched');
  agree(f5, herald, 'F5 trio/unarmored fighter/wave-4');
  // F6: table-stage veteran solo, wave-3 — the GUARD fires, the
  // helper stays null (it never suppresses the guard).
  const f6 = takeVid();
  assert(!!f6, '§2 F6 took a villager');
  zeroTrust();
  const vv6 = Game.state.village;
  vv6.winPlan = vv6.winPlan || {};
  vv6.winPlan[f6] = { stage: 'table', target: 'herald', node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  Game.state.waveKillLog.push({ by: f6, w: 4, mid: 'herald' });
  assert(Game.winPlanOutmatched(f6, w3) == null, '§2 F6 helper is null on a wave-3 (outmatched is wave>=4)');
  const g6 = Game.winPlanFightGate(f6, w3);
  assert(!!(g6 && g6.avoid && g6.reason === 'veteran-guard'),
    '§2 F6 the veteran-guard still fires (gate ' + gateReason(g6) + ')');
  // F7: table-stage veteran duo geared, wave-4 — guard does not fire
  // (party 2, all armed), outmatched does.
  const f7 = takeVid();
  assert(!!f7, '§2 F7 took a villager');
  gearUp(f7);
  const f7ally = twoAllies(f7)[0];
  gearUp(f7ally);
  const vv7 = Game.state.village;
  vv7.winPlan = vv7.winPlan || {};
  vv7.winPlan[f7] = { stage: 'table', target: 'herald', node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  Game.state.waveKillLog.push({ by: f7, w: 4, mid: 'herald' });
  zeroTrust();
  Game.state.village.trust[f7ally] = 90;
  assert(sensed(f7).length === 1, '§2 F7 fixture senses 1 ally (party 2)');
  const rF7 = agree(f7, herald, 'F7 table veteran duo/wave-4');
  assert(!!(rF7.g && rF7.g.avoid && rF7.g.reason === 'outmatched'),
    '§2 F7 gate returns avoid/outmatched, not veteran-guard');
  // F8: hunt-plan holder, geared trio, trick KNOWN, target species —
  // the SEEK still fires; the helper stays null.
  const f8 = takeVid();
  assert(!!f8, '§2 F8 took a villager');
  const f8allies = twoAllies(f8);
  gearUp(f8);
  for (const id of f8allies) gearUp(id);
  const vv8 = Game.state.village;
  vv8.winPlan = vv8.winPlan || {};
  vv8.winPlan[f8] = { stage: 'hunt', target: 'herald', needWave: 4, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
  Game.state.villagerTricks.herald = true;
  assert(setTrio(f8, f8allies).length === 2, '§2 F8 fixture senses 2 allies (party 3)');
  assert(Game.winPlanOutmatched(f8, herald) == null, '§2 F8 helper is null for a full geared trio');
  const g8 = Game.winPlanFightGate(f8, herald);
  assert(!!(g8 && g8.seek === true), '§2 F8 the SEEK still fires (gate ' + gateReason(g8) + ')');
  delete Game.state.villagerTricks.herald;
  // F9: VETREENGAGE counted member — a plan companion on the same
  // expedition target counts toward the party even when not sensed.
  const f9 = takeVid();
  assert(!!f9, '§2 F9 took a villager');
  let f9comp = null;
  for (const id of roster) if (id !== f9 && alive(id)) { f9comp = id; break; }
  assert(!!f9comp, '§2 F9 found a plan companion');
  gearUp(f9); gearUp(f9comp);
  const vv9 = Game.state.village;
  vv9.winPlan = vv9.winPlan || {};
  vv9.winPlan[f9] = { stage: 'hunt', target: 'herald', needWave: 4, node: null, party: [f9comp], sinceDay: 0, holdSinceDay: -1 };
  const a9 = Game.agencyState ? Game.agencyState() : null;
  if (a9) { a9.exped[f9] = { tx: 3, ty: 3 }; a9.exped[f9comp] = { tx: 3, ty: 3 }; }
  let f9ally = null;
  for (const id of roster) if (id !== f9 && id !== f9comp && alive(id)) { f9ally = id; break; }
  assert(!!f9ally, '§2 F9 found a sensed ally');
  gearUp(f9ally);
  zeroTrust();
  Game.state.village.trust[f9ally] = 90;
  assert(sensed(f9).length === 1 && sensed(f9).indexOf(f9comp) === -1,
    '§2 F9 the companion is counted, not sensed (sensed ' + sensed(f9).length + ')');
  process.env.VETREENGAGE = '1';
  assert(Game.winPlanFightParty(f9).length === 3,
    '§2 F9 VETREENGAGE=1: party counts the companion (party ' + Game.winPlanFightParty(f9).length + ')');
  assert(Game.winPlanOutmatched(f9, herald) == null, '§2 F9 helper null at party 3 under VETREENGAGE');
  const g9 = Game.winPlanFightGate(f9, herald);
  assert(!(g9 && g9.avoid), '§2 F9 gate does not avoid at party 3 under VETREENGAGE (gate ' + gateReason(g9) + ')');
  delete process.env.VETREENGAGE;
  assert(Game.winPlanFightParty(f9).length === 2,
    '§2 F9 VETREENGAGE unset: party drops to 2 (party ' + Game.winPlanFightParty(f9).length + ')');
  assert(!!(Game.winPlanOutmatched(f9, herald) && Game.winPlanOutmatched(f9, herald).avoid),
    '§2 F9 helper avoids at party 2 without VETREENGAGE');
  // F10: helper purity — calling it changes no plan and no bump.
  const f10 = takeVid();
  assert(!!f10, '§2 F10 took a villager');
  zeroTrust();
  const vv10 = Game.state.village;
  vv10.winPlan = vv10.winPlan || {};
  vv10.winPlan[f10] = { stage: 'hunt', target: 'herald', needWave: 4, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
  const planBefore = JSON.stringify(planOf(f10));
  const avoidBefore = avoidances();
  const h10 = Game.winPlanOutmatched(f10, herald);
  assert(!!(h10 && h10.avoid), '§2 F10 helper avoids the solo hunt-holder');
  assert(JSON.stringify(planOf(f10)) === planBefore, '§2 F10 the helper mutates no plan');
  assert(avoidances() === avoidBefore, '§2 F10 the helper bumps no avoidance');

  // §3: exemptions.
  // 3a: raid — a solo villager at the haven door fights, never avoids.
  const raidVid = roster.find(function (id) { return alive(id); }) || solo;
  zeroTrust();
  setHealth(raidVid, 100);
  const r3a = Game.resolveWildMonsterEncounter(raidVid, fakeM('herald'), { raid: true });
  assert(!!r3a && FIGHT_OUTCOMES.indexOf(r3a.outcome) !== -1 && !r3a.avoided,
    '§3a raid: the door defence fights (outcome ' + (r3a && r3a.outcome) + ', not avoided)');
  // 3b: post-flee rest — a resting villager returns null, not an avoid.
  const restVid = roster.find(function (id) { return alive(id) && id !== raidVid; }) || solo2;
  setHealth(restVid, 100);
  let restDay = null;
  try { restDay = Game.postFleeRestDay ? Game.postFleeRestDay() : null; } catch (e) {}
  if (restDay != null) {
    Game._postFleeRest = Game._postFleeRest || {};
    Game._postFleeRest[restVid] = restDay;
    assert(Game.isPostFleeResting(restVid) === true, '§3b resting fixture staged (isPostFleeResting true)');
    const r3b = Game.resolveWildMonsterEncounter(restVid, fakeM('herald'));
    assert(r3b === null, '§3b resting villager returns null, not an avoid (got ' + JSON.stringify(r3b) + ')');
    delete Game._postFleeRest[restVid];
  } else {
    fail('§3b postFleeRestDay unavailable — cannot stage the rest fixture');
  }
  delete process.env.WILDAVOID;
}

// ---- §4 analyzer + driver + panel builder ----
(function section4() {
  const C = A.classifyWouldAvoid;
  assert(C({ partySize: 1, allArmed: true, allArmored: true, planStage: 'table', isTableVeteran: true }, 3).rule === 'veteran-guard',
    '§4 classifier: lone table veteran vs wave-3 is veteran-guard');
  assert(C({ partySize: 3, allArmed: true, allArmored: true, planStage: 'hunt', isTableVeteran: false }, 4).wouldAvoid === false,
    '§4 classifier: full geared trio vs wave-4 is not avoided');
  assert(C(null, 4).rule === 'unclassified', '§4 classifier: null snapshot is unclassified');
  const stFailures = A.selftest();
  assert(stFailures === 0, '§4 analyzer --selftest passes with 0 failures');
  assert(typeof driver.oneRun === 'function', '§4 driver exports oneRun');
  assert(typeof driver.wildSnapshot === 'function', '§4 driver exports wildSnapshot');
  assert(typeof driver.isWave4Killer === 'function', '§4 driver exports isWave4Killer');
  assert(typeof driver.fightOrigin === 'function', '§4 driver exports fightOrigin');
  assert(typeof driver.recoverMHpStart === 'function', '§4 driver exports recoverMHpStart');
  assert(typeof driver.classifySeedPath === 'function', '§4 driver exports classifySeedPath');
  const panel = panelBuilder.buildPanel([{ seed: 104411, run: 'wildavoid-a-ctl',
    r: { won: false, scaleRank: 'village', gameDays: 150, endReason: 'horizon', deaths: [{}, {}] } }]);
  assert(panel.rows.length === 1 && panel.rows[0].metrics.villageDeaths === 2,
    '§4 panel builder maps a per-seed row (villageDeaths 2)');
})();

// ---- §5 src confinement ----
(function section5() {
  let changed = [];
  try {
    const base = execSync('git merge-base HEAD master', { cwd: REPO }).toString().trim();
    const committed = execSync('git diff --name-only ' + base + ' HEAD', { cwd: REPO }).toString().trim();
    const uncommitted = execSync('git diff --name-only', { cwd: REPO }).toString().trim();
    changed = (committed + '\n' + uncommitted).split('\n').map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });
  } catch (e) { fail('§5 git diff failed: ' + String(e.message).slice(0, 120)); }
  const srcChanged = changed.filter(function (f) { return f.indexOf('src/') === 0; }).sort();
  assert(eq(srcChanged, ['src/js/game.js', 'src/js/win-plan.js']),
    '§5 src changes are exactly game.js + win-plan.js (got ' + JSON.stringify(srcChanged) + ')');
  const senseSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
  assert(senseSrc.toLowerCase().indexOf('wildavoid') === -1,
    '§5 party-wiring.js (sense arm) carries no wildavoid change');
  const commsSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'comms.js'), 'utf8');
  assert(commsSrc.toLowerCase().indexOf('wildavoid') === -1,
    '§5 comms.js (aidFight) carries no wildavoid change');
  const agencySrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
  assert(agencySrc.toLowerCase().indexOf('wildavoid') === -1,
    '§5 villager-agency.js (expedition path) carries no wildavoid change');
})();

async function main() {
  await live();
  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exitCode = failures === 0 ? 0 : 1;
}
if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
