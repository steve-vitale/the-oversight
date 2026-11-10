#!/usr/bin/env node
// test-meleefirst-b.js — sim-meleefirst-b proof test.
//
// The melee-first / ranged-fallback slot rule (SPEAR-IN-RANGED-SLOT
// fallback, evidence/2026-11-10/sim-spearvolley-b.md metric review):
// a spear takes the MELEE slot when its carrier also holds a real ranged
// weapon (bow/crossbow/sling — volley restored), and the RANGED slot
// otherwise (the old fold-in preserved: machete+spear-no-bow keeps wb 33,
// spear-only keeps wb 15 and the contact finish's kind-'spear' path).
//
// The test is DUAL-MODE: on the fixed code it judges the GO bars; on the
// unfixed code (git stash of src/js/equipment.js) it asserts the BEFORE
// behavior instead (E1 volley 0/30, E4 medians re-measured as the baseline,
// bow+spear equipping spear-to-ranged). A before-run that exits 0 proves
// the test discriminates; a fixed-run that exits 0 proves the fix.
//
// Legs:
//   U. Unit: autoEquip shapes (bow+spear, machete+spear, spear-only,
//      machete+spear+bow, bow-only, sling+spear, crossbow+spear,
//      godslayer+bow, starfall-lance+bow); weapon census (all 25 weapons
//      classify per weapon.type under both contexts, fixed mode only);
//      4-arg equipScore backward compat; slotForItem/isRangedWeapon
//      UNCHANGED (both modes); isFallbackSpear census (exactly the 5
//      spears, fixed mode); carriesRealRanged; migrateEquipment (spear
//      -> melee with a bow in items, ranged without — fixed mode; spear
//      -> ranged regardless — before mode); armor slots unaffected.
//   E1. Constructed volley restoration (spearvolley E1 recipe): crude bow
//      + 4 arrows + hunting spear + 1 from-start ally vs full-HP wave-4
//      beasts (herald 700, audit 1200), 30 streams each. FIXED GO: volley
//      fires >= 27/30 per beast, median volley dmg > 0, slots melee spear
//      / ranged bow >= 27/30. BEFORE: volley 0/30, slots melee null /
//      ranged spear.
//   E4. Damage preservation (spearvolley E4 recipe): machete + hunting
//      spear, NO bow, same beasts. FIXED GO: median total damage
//      (rec.mDealt) >= 0.90 x the spearvolley E4 baseline per beast
//      (Herald 232.5, Audit 157.5 — i.e. >= 209.3 / >= 141.8). BEFORE:
//      medians recorded as the re-measured baseline (no bar). The
//      fallback predicts NO loss on this shape (same code path as
//      baseline), so fixed and before medians should match.
//   E5. Measurement only: machete + hunting spear + crude bow + 4 arrows
//      — the one shape that trades fold-in for volley. Report median
//      total damage and volley rate per beast; no threshold. BEFORE:
//      volley 0/30 (spear takes the ranged slot).
//   C. Controls: spear-only (volley null, ranged spear) and bow-only
//      (volley fires, ranged bow) — same in both modes.
// Writes nothing into the repo.
// Usage: node scripts/test-meleefirst-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

async function main() {
  const { Game } = await loadGame({ seed: 87104, mode: 'herald', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const eq = (globalThis.Scattering || {}).equipment;
  check('unit: equipment API present', !!eq && typeof eq.autoEquip === 'function' && typeof eq.equipScore === 'function');
  // Dual-mode: the fallback helpers exist only on the fixed code.
  const FIXED = typeof eq.isFallbackSpear === 'function';
  console.log('MODE: ' + (FIXED ? 'FIXED (fallback present)' : 'BEFORE (fallback absent — git stash)'));
  check('mode: fallback helpers present iff fixed', FIXED === (typeof eq.carriesRealRanged === 'function'));
  const items = Game.data.items || [];
  const defs = {};
  for (const d of items) defs[d.id] = d;
  check('unit: hunting_spear / crude_bow / machete defs present', !!(defs.hunting_spear && defs.crude_bow && defs.machete));

  // --- static legs: the context-free classifiers do not move (both modes) ---
  check('static: isRangedWeapon spear still ranged (context-free)', eq.isRangedWeapon(defs.hunting_spear) === true);
  check('static: isRangedWeapon bow ranged', eq.isRangedWeapon(defs.crude_bow) === true);
  check('static: isRangedWeapon machete melee', eq.isRangedWeapon(defs.machete) === false);
  check('static: slotForItem spear still ranged (context-free)', eq.slotForItem(defs.hunting_spear) === 'ranged');
  check('static: slotForItem godslayer_spear melee (explicit slot)', eq.slotForItem(defs.godslayer_spear) === 'melee');
  check('static: slotForItem apex_bow ranged (explicit slot)', eq.slotForItem(defs.apex_bow) === 'ranged');

  const pers = { temperament: 'steady', sharing: 'balanced' };
  if (FIXED) {
    // --- isFallbackSpear census: exactly the 5 spears/lance ---
    const weps = items.filter(d => d.weapon);
    const spears = weps.filter(d => eq.isFallbackSpear(d)).map(d => d.id).sort();
    check('unit: fallback spears are exactly the 5 spears/lance',
      JSON.stringify(spears) === JSON.stringify(['fire_hardened_spear', 'godslayer_spear', 'hunting_spear', 'shard_spear', 'starfall_lance']), { spears });
    const realRanged = weps.filter(d => eq.isRealRangedWeapon(d)).map(d => d.id).sort();
    check('unit: real ranged weapons are the 8 type-ranged weapons',
      JSON.stringify(realRanged) === JSON.stringify(['apex_bow', 'bow', 'crossbow', 'crude_bow', 'phase_sling', 'searcaster', 'sling', 'starfall_bow']), { realRanged });
    check('unit: carriesRealRanged spear-only false', eq.carriesRealRanged(['hunting_spear'], items) === false);
    check('unit: carriesRealRanged spear+bow true', eq.carriesRealRanged(['hunting_spear', 'crude_bow'], items) === true);
    check('unit: carriesRealRanged empty false', eq.carriesRealRanged([], items) === false);
    check('unit: carriesRealRanged machete-only false', eq.carriesRealRanged(['machete'], items) === false);

    // --- equipScore census: every weapon classifies per weapon.type ---
    let censusBad = [];
    for (const w of weps) {
      const type = (w.weapon || {}).type;
      const isSpear = eq.isFallbackSpear(w);
      // without opts (backward compat): spear scores ranged, as today
      const m0 = eq.equipScore(w.id, 'melee', pers, items);
      const r0 = eq.equipScore(w.id, 'ranged', pers, items);
      // with opts (carrier holds a real ranged weapon): spear scores melee
      const m1 = eq.equipScore(w.id, 'melee', pers, items, { meleeFirstSpears: true });
      const r1 = eq.equipScore(w.id, 'ranged', pers, items, { meleeFirstSpears: true });
      let want;
      if (type === 'ranged') want = { m0: -1, r0: 1, m1: -1, r1: 1 };
      else if (isSpear) want = { m0: -1, r0: 1, m1: 1, r1: -1 };
      else want = { m0: 1, r0: -1, m1: 1, r1: -1 };
      const ok = (m0 > 0) === (want.m0 > 0) && (r0 > 0) === (want.r0 > 0) &&
        (m1 > 0) === (want.m1 > 0) && (r1 > 0) === (want.r1 > 0);
      if (!ok) censusBad.push({ id: w.id, type, isSpear, m0, r0, m1, r1 });
    }
    check('unit: equipScore census — all 25 weapons classify per type in both contexts', censusBad.length === 0, { bad: censusBad });
  } else {
    check('before: fallback helpers absent', typeof eq.isFallbackSpear === 'undefined' && typeof eq.carriesRealRanged === 'undefined');
    // 4-arg behavior on the before tree: spear scores ranged, as today.
    check('before: equipScore spear scores ranged (4-arg)', eq.equipScore('hunting_spear', 'ranged', pers, items) > 0);
    check('before: equipScore spear does not score melee (4-arg)', eq.equipScore('hunting_spear', 'melee', pers, items) === -1);
  }

  // --- autoEquip shapes (expectations differ by mode) ---
  function makeV(itemList) {
    return { id: 'test-fighter', items: itemList.map(it => (typeof it === 'string' ? { itemId: it, units: 1 } : { itemId: it.id, units: it.units || 1 })),
      personality: { temperament: 'steady', sharing: 'balanced' } };
  }
  function slotOf(v, slot) { return (v.equipped && v.equipped[slot] && v.equipped[slot].itemId) || null; }
  function shape(label, itemList, want) {
    const v = makeV(itemList);
    eq.autoEquip(v, items);
    check('U ' + label + ': melee ' + (want.melee || 'null'), slotOf(v, 'melee') === want.melee, v.equipped);
    check('U ' + label + ': ranged ' + (want.ranged || 'null'), slotOf(v, 'ranged') === want.ranged, v.equipped);
    return v;
  }
  // bow+spear: fixed -> melee spear / ranged bow (volley restored);
  // before -> melee null / ranged spear (the bug).
  shape('bow+spear', ['crude_bow', { id: 'arrow', units: 4 }, 'hunting_spear'],
    FIXED ? { melee: 'hunting_spear', ranged: 'crude_bow' } : { melee: null, ranged: 'hunting_spear' });
  // machete+spear: identical both modes (fold-in preserved).
  shape('machete+spear', ['machete', 'hunting_spear'], { melee: 'machete', ranged: 'hunting_spear' });
  // spear-only: identical both modes.
  shape('spear-only', ['hunting_spear'], { melee: null, ranged: 'hunting_spear' });
  // machete+spear+bow: fixed -> melee machete / ranged bow (spear out);
  // before -> melee machete / ranged spear (spear outscores the bow).
  shape('machete+spear+bow', ['machete', 'hunting_spear', 'crude_bow', { id: 'arrow', units: 4 }],
    FIXED ? { melee: 'machete', ranged: 'crude_bow' } : { melee: 'machete', ranged: 'hunting_spear' });
  // bow-only: identical both modes.
  shape('bow-only', ['crude_bow', { id: 'arrow', units: 4 }], { melee: null, ranged: 'crude_bow' });
  // sling+spear: fixed -> melee spear / ranged sling; before -> ranged spear.
  shape('sling+spear', ['sling', 'hunting_spear'],
    FIXED ? { melee: 'hunting_spear', ranged: 'sling' } : { melee: null, ranged: 'hunting_spear' });
  // crossbow+spear: fixed -> melee spear / ranged crossbow; before -> ranged spear.
  shape('crossbow+spear', ['crossbow', 'hunting_spear'],
    FIXED ? { melee: 'hunting_spear', ranged: 'crossbow' } : { melee: null, ranged: 'hunting_spear' });
  // godslayer+bow: fixed -> melee godslayer / ranged bow; before -> ranged godslayer.
  shape('godslayer+bow', ['godslayer_spear', 'crude_bow', { id: 'arrow', units: 4 }],
    FIXED ? { melee: 'godslayer_spear', ranged: 'crude_bow' } : { melee: null, ranged: 'godslayer_spear' });
  // starfall-lance+bow: fixed -> melee lance / ranged bow; before -> ranged lance.
  shape('starfall-lance+bow', ['starfall_lance', 'bow', { id: 'arrow', units: 4 }],
    FIXED ? { melee: 'starfall_lance', ranged: 'bow' } : { melee: null, ranged: 'starfall_lance' });
  // spear unequipped on the fixed machete+spear+bow shape only.
  if (FIXED) {
    const v = makeV(['machete', 'hunting_spear', 'crude_bow', { id: 'arrow', units: 4 }]);
    eq.autoEquip(v, items);
    check('U machete+spear+bow: spear unequipped', !Object.keys(v.equipped || {}).some(s => (v.equipped[s] || {}).itemId === 'hunting_spear'), v.equipped);
  }
  // armor slots unaffected (both modes).
  const torsoArmor = items.find(d => d.armor && eq.slotForItem(d) === 'torso');
  if (torsoArmor) {
    const v = makeV(['machete', torsoArmor.id]);
    eq.autoEquip(v, items);
    check('U armor unaffected: melee machete + torso armor', slotOf(v, 'melee') === 'machete' && slotOf(v, 'torso') === torsoArmor.id, v.equipped);
  } else {
    check('U armor unaffected: torso armor def found', false);
  }

  // --- migrateEquipment ---
  try { globalThis.Scattering.Game = Game; } catch (e) {}
  function migratePerson(weaponId, itemList) {
    const p = { equipped: { weapon: { itemId: weaponId } }, items: (itemList || []).map(id => ({ itemId: id, units: 1 })) };
    eq.migrateEquipment(p);
    return p.equipped;
  }
  let me;
  me = migratePerson('hunting_spear', ['crude_bow']);
  if (FIXED) check('U migrate: spear + bow in items -> melee', me.melee && me.melee.itemId === 'hunting_spear' && !me.weapon, me);
  else check('U migrate before: spear + bow in items -> ranged (old rule)', me.ranged && me.ranged.itemId === 'hunting_spear' && !me.weapon, me);
  me = migratePerson('hunting_spear', []);
  check('U migrate: spear, no bow -> ranged (fold-in preserved)', me.ranged && me.ranged.itemId === 'hunting_spear' && !me.weapon, me);
  me = migratePerson('machete', ['crude_bow']);
  check('U migrate: machete + bow -> melee (unchanged path)', me.melee && me.melee.itemId === 'machete' && !me.weapon, me);
  me = migratePerson('crude_bow', []);
  check('U migrate: bow -> ranged (unchanged path)', me.ranged && me.ranged.itemId === 'crude_bow' && !me.weapon, me);

  // --- engine legs (spearvolley E1/E4/E5 recipes) ---
  const roster = ((Game.state.village || {}).roster || []).filter(function (x) { return x !== Game.villagerId; });
  check('engine: roster has non-scholar fighters', roster.length >= 2, roster.length);
  const mdefs = {};
  for (const m of (Game.data.monsters || [])) mdefs[m.id] = m;
  check('engine: herald/audit defs present', !!(mdefs.herald && mdefs.audit));
  check('engine: herald HP range covers 700', Array.isArray(mdefs.herald.hp) && mdefs.herald.hp[0] <= 700 && mdefs.herald.hp[1] >= 700, { hp: mdefs.herald.hp });
  check('engine: audit HP range covers 1200', Array.isArray(mdefs.audit.hp) && mdefs.audit.hp[0] <= 1200 && mdefs.audit.hp[1] >= 1200, { hp: mdefs.audit.hp });

  function runFight(vid, itemList, def, startHp, maxHp, streamSeed, health, allyVid) {
    const vp = (Game.data.villagers || []).find(function (x) { return x.id === vid; }) || {};
    vp.items = itemList.map(function (it) {
      if (typeof it === 'string') return { itemId: it, units: 1 };
      return { itemId: it.id, units: it.units || 1 };
    });
    delete vp.equipped;
    var hv = Game.state.village.health || (Game.state.village.health = {});
    hv[vid] = health;
    if (allyVid) { hv[allyVid] = 100; }
    const opts = { allies: allyVid ? 1 : 0, allyVids: allyVid ? [allyVid] : [],
      allyFromStart: !!allyVid, rng: mulberry32(streamSeed) };
    const rec = Game.fieldFight(vid, def, { hp: startHp, maxHp: maxHp }, opts);
    // slots as the fight actually equipped them (gear-up runs at fight start)
    const eqd = vp.equipped || {};
    rec._slots = { melee: (eqd.melee && eqd.melee.itemId) || null, ranged: (eqd.ranged && eqd.ranged.itemId) || null };
    return rec;
  }

  function engineLeg(label, itemList, beasts) {
    const out = {};
    for (const b of beasts) {
      let volleyFires = 0, volleyDmgs = [], totals = [], slotsOk = 0, fights = 0;
      for (let s = 1; s <= 30; s++) {
        const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
        let rec;
        try { rec = runFight(vid, itemList, b.def, b.hp, b.hp, s * 104729 + b.hp, 100, allyVid); } catch (e) { continue; }
        fights++;
        if (rec.volley && (rec.volley.shots | 0) > 0) { volleyFires++; volleyDmgs.push(rec.volley.dmg | 0); }
        totals.push(rec.mDealt | 0);
        if (b.wantSlots && rec._slots.melee === b.wantSlots.melee && rec._slots.ranged === b.wantSlots.ranged) slotsOk++;
      }
      out[b.label] = { fights, volleyFires, medianVolleyDmg: median(volleyDmgs), medianTotal: median(totals), slotsOk };
    }
    console.log(label + ': ' + JSON.stringify(out));
    return out;
  }

  const beasts = [
    { def: mdefs.herald, hp: 700, label: 'herald-700' },
    { def: mdefs.audit, hp: 1200, label: 'audit-1200' },
  ];
  // E1: bow+spear.
  const e1want = FIXED
    ? { melee: 'hunting_spear', ranged: 'crude_bow' }
    : { melee: null, ranged: 'hunting_spear' };
  const e1 = engineLeg('E1 bow+spear', ['crude_bow', { id: 'arrow', units: 4 }, 'hunting_spear'],
    beasts.map(b => Object.assign({}, b, { wantSlots: e1want })));
  for (const b of beasts) {
    const r = e1[b.label];
    if (FIXED) {
      check('E1 ' + b.label + ': volley fires >= 27/30', r.volleyFires >= 27, r);
      check('E1 ' + b.label + ': median volley dmg > 0', (r.medianVolleyDmg || 0) > 0, r);
      check('E1 ' + b.label + ': slots melee spear / ranged bow >= 27/30', r.slotsOk >= 27, r);
    } else {
      check('E1-before ' + b.label + ': volley 0/30 (bug reproduced)', r.volleyFires === 0, r);
      check('E1-before ' + b.label + ': slots melee null / ranged spear >= 27/30', r.slotsOk >= 27, r);
    }
  }
  // E4: machete+spear, no bow. Fixed GO bar is 0.90x the spearvolley E4
  // baseline; before mode records the re-measured baseline (no bar).
  const e4 = engineLeg('E4 machete+spear', ['machete', 'hunting_spear'],
    beasts.map(b => Object.assign({}, b, { wantSlots: { melee: 'machete', ranged: 'hunting_spear' } })));
  const e4bar = { 'herald-700': 209.3, 'audit-1200': 141.8 };
  for (const b of beasts) {
    const r = e4[b.label];
    if (FIXED) {
      check('E4 ' + b.label + ': median total >= 0.90x spearvolley baseline (' + e4bar[b.label] + ')', (r.medianTotal || 0) >= e4bar[b.label], r);
    } else {
      console.log('E4-before baseline ' + b.label + ': medianTotal ' + r.medianTotal + ' (spearvolley E4 baseline: herald 232.5 / audit 157.5)');
      check('E4-before ' + b.label + ': median total > 0 (sanity)', (r.medianTotal || 0) > 0, r);
    }
    check('E4 ' + b.label + ': slots melee machete / ranged spear >= 27/30', r.slotsOk >= 27, r);
  }
  // E5: machete+spear+bow — measurement only (confined-loss shape).
  const e5want = FIXED
    ? { melee: 'machete', ranged: 'crude_bow' }
    : { melee: 'machete', ranged: 'hunting_spear' };
  const e5 = engineLeg('E5 machete+spear+bow', ['machete', 'hunting_spear', 'crude_bow', { id: 'arrow', units: 4 }],
    beasts.map(b => Object.assign({}, b, { wantSlots: e5want })));
  for (const b of beasts) {
    const r = e5[b.label];
    console.log('E5 note ' + b.label + ': medianTotal ' + r.medianTotal + ', volley ' + r.volleyFires + '/30, medianVolleyDmg ' + r.medianVolleyDmg + ', slotsOk ' + r.slotsOk + '/30');
    if (FIXED) check('E5 ' + b.label + ': volley fires >= 27/30', r.volleyFires >= 27, r);
    else check('E5-before ' + b.label + ': volley 0/30', r.volleyFires === 0, r);
  }
  // Controls (same in both modes).
  const cSpear = engineLeg('C spear-only', ['hunting_spear'],
    beasts.map(b => Object.assign({}, b, { wantSlots: { melee: null, ranged: 'hunting_spear' } })));
  for (const b of beasts) {
    const r = cSpear[b.label];
    check('C spear-only ' + b.label + ': volley null 30/30', r.volleyFires === 0, r);
    check('C spear-only ' + b.label + ': slots ranged spear >= 27/30', r.slotsOk >= 27, r);
  }
  const cBow = engineLeg('C bow-only', ['crude_bow', { id: 'arrow', units: 4 }],
    beasts.map(b => Object.assign({}, b, { wantSlots: { melee: null, ranged: 'crude_bow' } })));
  for (const b of beasts) {
    const r = cBow[b.label];
    check('C bow-only ' + b.label + ': volley fires >= 27/30', r.volleyFires >= 27, r);
    check('C bow-only ' + b.label + ': slots ranged bow >= 27/30', r.slotsOk >= 27, r);
  }

  console.log(`meleefirst proof: ${pass} passed, ${fail} failed (${FIXED ? 'FIXED' : 'BEFORE'} mode)`);
  process.exit(fail ? 1 : 0);
}
main().catch(function (e) { console.error('MELEEFIRST PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
