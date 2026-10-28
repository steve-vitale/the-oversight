#!/usr/bin/env node
// scripts/test-fieldfeed-a-proof.js — sim-fieldfeed-a proof test.
// Proves the wild-meeting feed: a villager who meets a wave-4 beast in
// the wild fights WITH the villagers physically present on that tile
// (or in earshot), when those villagers are willing (trust >= 15).
// Fixtures (scripted, seeded harness, full game eval):
//   A. FORMED: leader + willing, armed candidate on the leader's node
//      (+ a stranger, trust 10, on the same node) meet a wave-4 beast.
//      Expect: presentFightAllies names the candidate only; the router
//      feeds the candidate into fieldFight opts; the ally answers the
//      shout (calledHelp + allyVid) — a party of >= 2 fighters.
//   B. CONTROL-SOLO: nobody present (candidate far away) -> the router
//      feeds zero allies and the fight stays solo (no calledHelp).
//   C. CONTROL-STRANGER: candidate on the tile but trust 10 (stranger)
//      -> not fed, fight stays solo.
//   D. PATROL: the same feed through resolvePatrol (patroller +
//      candidate on one node near Haven, wave-4 beast nearest).
// Exit 0 iff every assertion passes. No RNG drawn by the test itself;
// the harness seed is pinned (20261028) so the shout timing is stable.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('fieldfeed-a-proof');

function setup(Game) {
  K.newRun(Game);
  const v = Game.state.village;
  v.nodePos = v.nodePos || {};
  v.trust = v.trust || {};
  v.health = v.health || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) throw new Error('need >=3 roster villagers, got ' + roster.length);
  const leader = roster[0], cand = roster[1], stranger = roster[2];
  // Everyone far away by default, trust at the stranger floor — so the
  // ONLY presence/trust in each fixture is what the fixture plants.
  // (npcNode defaults a missing entry to Haven (4,4); explicit
  // placement removes that ambiguity.)
  for (const id of roster) {
    v.nodePos[id] = { nx: 0, ny: 0 };
    v.trust[id] = 10;
    v.health[id] = 100;
  }
  return { v, leader, cand, stranger, roster };
}

function arm(Game, vid) {
  // Give the villager a weapon item and verify with the same reads the
  // census uses (equipped melee/ranged, else carried weapon item).
  let vp = null;
  try { vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; } catch (e) { vp = null; }
  if (!vp) return false;
  vp.items = vp.items || [];
  vp.items.push({ itemId: 'hunting_spear' });
  const itemDefs = (Game.data && Game.data.items) || [];
  const carriesWeapon = (items) => {
    for (const e of (items || [])) {
      const iid = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
      if (!iid) continue;
      const def = itemDefs.find(d => d && d.id === iid);
      if (def && def.weapon) return true;
    }
    return false;
  };
  let armed = false;
  try {
    const eq = (globalThis.Scattering && globalThis.Scattering.equipment)
      || (globalThis.S && globalThis.S.equipment) || null;
    if (eq && typeof eq.meleeWeaponOf === 'function' && eq.meleeWeaponOf(vp)) armed = true;
    if (!armed && eq && typeof eq.rangedWeaponOf === 'function' && eq.rangedWeaponOf(vp)) armed = true;
  } catch (e) { /* fall through to carried read */ }
  if (!armed) armed = carriesWeapon(vp.items);
  return armed;
}

function wave4Def(Game) {
  const def = (Game.data.monsters || []).find(x => x.wave === 4);
  if (!def) throw new Error('no wave-4 monster def');
  return def;
}

function spyFieldFight(Game) {
  const calls = [];
  const orig = Game.fieldFight;
  Game.fieldFight = function (vid, mdef, m, opts) {
    calls.push({ opts: Object.assign({}, opts || {}), allyVids: ((opts && opts.allyVids) || []).slice() });
    const rec = orig.apply(this, arguments);
    calls[calls.length - 1].rec = rec;
    return rec;
  };
  return { calls, restore: () => { Game.fieldFight = orig; } };
}

(async () => {
  const Game = await K.load({ seed: 20261028 });
  const def = wave4Def(Game);

  T.section('A. present, willing, armed villager forms a party (wild)');
  {
    const { v, leader, cand, stranger } = setup(Game);
    v.nodePos[leader] = { nx: 5, ny: 5 };
    v.nodePos[cand] = { nx: 5, ny: 5 };
    v.nodePos[stranger] = { nx: 5, ny: 5 };
    v.trust[cand] = 50;
    v.trust[stranger] = 10;
    v.health[leader] = 400; // sturdy enough to reach the round-2 shout
    const armed = arm(Game, cand);
    T.ok('candidate is armed', armed === true, 'armed=' + armed);
    const fed = (typeof Game.presentFightAllies === 'function') ? Game.presentFightAllies(leader) : null;
    T.ok('presentFightAllies exists', Array.isArray(fed), 'fed=' + JSON.stringify(fed));
    T.ok('candidate is fed', Array.isArray(fed) && fed.indexOf(cand) >= 0, JSON.stringify(fed));
    T.ok('stranger (trust 10) is NOT fed', Array.isArray(fed) && fed.indexOf(stranger) < 0, JSON.stringify(fed));
    T.ok('leader never answers own call', Array.isArray(fed) && fed.indexOf(leader) < 0, JSON.stringify(fed));
    const m = Game.spawnWorldMonster(def.id, 5, 5, {});
    const spy = spyFieldFight(Game);
    const rec = Game.resolveWildMonsterEncounter(leader, m);
    spy.restore();
    const call = spy.calls[0] || {};
    T.ok('router fed >=1 ally into fieldFight', (call.opts.allies | 0) >= 1, JSON.stringify(call.opts));
    T.ok('router fed the candidate', (call.allyVids || []).indexOf(cand) >= 0, JSON.stringify(call.allyVids));
    T.ok('ally answered the shout (calledHelp + allyVid)', !!(rec && rec.calledHelp && rec.allyVid === cand),
      'calledHelp=' + (rec && rec.calledHelp) + ' allyVid=' + (rec && rec.allyVid) + ' outcome=' + (rec && rec.outcome));
    T.ok('fight log carries the shout line',
      !!(rec && Array.isArray(rec.log) && rec.log.some(l => /shouts for help/i.test(String(l)))),
      'outcome=' + (rec && rec.outcome));
  }

  T.section('B. nobody present stays solo (wild control)');
  {
    const { v, leader, cand } = setup(Game);
    v.nodePos[leader] = { nx: 5, ny: 5 };
    v.nodePos[cand] = { nx: 0, ny: 0 }; // far away
    v.trust[cand] = 50; // willing, but not present
    v.health[leader] = 400;
    arm(Game, cand);
    const fed = (typeof Game.presentFightAllies === 'function') ? Game.presentFightAllies(leader) : null;
    T.ok('nobody present -> nobody fed', Array.isArray(fed) && fed.length === 0, JSON.stringify(fed));
    const m = Game.spawnWorldMonster(def.id, 5, 5, {});
    const spy = spyFieldFight(Game);
    const rec = Game.resolveWildMonsterEncounter(leader, m);
    spy.restore();
    const call = spy.calls[0] || {};
    T.ok('router fed zero allies', (call.opts.allies | 0) === 0, JSON.stringify(call.opts));
    T.ok('fight stays solo (no calledHelp)', !(rec && rec.calledHelp), 'calledHelp=' + (rec && rec.calledHelp));
  }

  T.section('C. stranger on the tile does not answer (wild control)');
  {
    const { v, leader, cand } = setup(Game);
    v.nodePos[leader] = { nx: 5, ny: 5 };
    v.nodePos[cand] = { nx: 5, ny: 5 }; // present...
    v.trust[cand] = 10; // ...but a stranger
    v.health[leader] = 400;
    arm(Game, cand);
    const fed = (typeof Game.presentFightAllies === 'function') ? Game.presentFightAllies(leader) : null;
    T.ok('stranger on tile -> nobody fed', Array.isArray(fed) && fed.length === 0, JSON.stringify(fed));
    const m = Game.spawnWorldMonster(def.id, 5, 5, {});
    const spy = spyFieldFight(Game);
    const rec = Game.resolveWildMonsterEncounter(leader, m);
    spy.restore();
    const call = spy.calls[0] || {};
    T.ok('router fed zero allies', (call.opts.allies | 0) === 0, JSON.stringify(call.opts));
    T.ok('fight stays solo (no calledHelp)', !(rec && rec.calledHelp), 'calledHelp=' + (rec && rec.calledHelp));
  }

  T.section('D. patrol feeds the same presence (patrol)');
  {
    const { v, leader, cand } = setup(Game);
    // Clear the world's monsters so the planted beast is nearest Haven.
    try {
      for (const wm of Game.worldMonsters()) Game.removeWorldMonster(wm);
    } catch (e) { /* best-effort */ }
    v.nodePos[leader] = { nx: 4, ny: 5 };
    v.nodePos[cand] = { nx: 4, ny: 5 };
    v.trust[cand] = 50;
    v.health[leader] = 100;
    arm(Game, cand);
    const m = Game.spawnWorldMonster(def.id, 4, 5, {});
    const spy = spyFieldFight(Game);
    Game.resolvePatrol(leader, 'Tester');
    spy.restore();
    const call = spy.calls[0] || {};
    T.ok('patrol fed >=1 ally into fieldFight', (call.opts.allies | 0) >= 1, JSON.stringify(call.opts));
    T.ok('patrol fed the candidate', (call.allyVids || []).indexOf(cand) >= 0, JSON.stringify(call.allyVids));
    T.ok('patrol fought the planted beast', !!spy.calls.length, 'calls=' + spy.calls.length);
  }

  T.done();
})().catch(e => { console.error('FIELDFEED PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
