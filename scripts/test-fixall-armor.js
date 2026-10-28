#!/usr/bin/env node
// test-fixall-armor.js — fixall-armor round 3 proof test (before/after).
// Proves, with NO experiment flag set (the live-play condition — the
// browser game has no process.env, so a flag-gated beat can never fire
// there):
//   E1 inflow mix: the open-village stash-contribution beat brings bark, vine
//      AND hide home (not just branch/wood), with branch+wood still the
//      majority of contributions. Round 3 mix: branch 35 / wood 20 / bark 30
//      / vine 10 / hide 5 (bark widened from 15, taken from branch/wood;
//      vine/hide unchanged). On pre-fix code this FAILS on bark/vine/hide
//      (the starved precondition); on post-fix code it PASSES.
//   E2 knowledge gate + cooldown: a villager NOT wearing bark/hide armor
//      never attempts a craft even with materials on hand, and a knower
//      does not attempt twice within 3 days.
//   E3 craft beat fires WITHOUT the flag: a knower with a complete recipe in
//      the stash attempts (tele fires / cooldown set) with no ARMORVILLAGE
//      set. On pre-fix code this FAILS (the beat returns 0); on post-fix
//      code it PASSES.
//   E4 spares flow gears another villager: a crafted piece in a knower's
//      spares moves to an unarmored villager on the next villagerGearDay
//      and that villager wears it (the "actually geared" path).
//   E5 hide knower: a villager wearing hide_armor with hide+vine on hand
//      attempts a hide craft (no flag).
//   E6 armory-pile draw WITHOUT the flag (round 3): a bark_armor deposited
//      in the stash armor pile is drawn by an unarmored villager on the next
//      villagerGearDay and worn — the deposit-is-consent path, mirroring the
//      ungated weapons pile. On pre-fix code this FAILS (step 3b is
//      flag-gated, the pile sits untouched); on post-fix code it PASSES.
//
// Usage: node scripts/test-fixall-armor.js
// (ARMORVILLAGE must be UNSET — setting it would bypass the enable this
// test exists to prove.)
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
if ('ARMORVILLAGE' in process.env) {
  console.error('PROOF STOP: ARMORVILLAGE must be UNSET — this test proves the beat fires in live play without the flag.');
  process.exit(2);
}
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; console.log('  ok: ' + label + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('  FAIL: ' + label + (detail ? ' — ' + detail : '')); }
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'armor-craft-inflow-proof', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function setTrustOpen(Game) {
  const v = Game.state.village || {};
  v.trust = v.trust || {};
  for (const vid of (v.roster || [])) {
    if (vid !== Game.villagerId) v.trust[vid] = 60;
  }
}

function stashMaterials(Game) {
  try { return (Game.stashState ? Game.stashState().materials : (Game.state.village.stash || {}).materials) || {}; }
  catch (e) { return {}; }
}

(async () => {
  console.log('E1 inflow mix (open village, 3000 batch turns each seed)');
  for (const seed of [7, 42, 99]) {
    const Game = await freshGame(seed);
    await quietLog(async () => {});
    setTrustOpen(Game);
    const before = Object.assign({}, stashMaterials(Game));
    const keys = ['branch', 'wood', 'bark', 'vine', 'hide'];
    // Count only gains: stash can also be taken/skimmed by other beats, but
    // with trust open there is no skim, and no player takes run here.
    await quietLog(async () => {
      for (let i = 0; i < 3000; i++) {
        try { Game.npcBatchTurn(); } catch (e) {}
      }
    });
    const after = stashMaterials(Game);
    const gain = {};
    for (const k of keys) gain[k] = Math.max(0, (after[k] || 0) - (before[k] || 0));
    const total = keys.reduce((t, k) => t + gain[k], 0);
    console.log(`  seed ${seed}: gains ${JSON.stringify(gain)} total=${total}`);
    ok(gain.bark > 0, `seed ${seed}: bark arrives in the communal stash`, `bark +${gain.bark}`);
    ok(gain.vine > 0, `seed ${seed}: vine arrives in the communal stash`, `vine +${gain.vine}`);
    ok(gain.hide > 0, `seed ${seed}: hide arrives in the communal stash`, `hide +${gain.hide}`);
    ok(total > 0 && (gain.branch + gain.wood) > total * 0.5, `seed ${seed}: branch+wood still the majority`, `branch+wood=${gain.branch + gain.wood}/${total}`);
  }

  console.log('E2/E3 knowledge gate, cooldown, and craft attempt (seed 4242)');
  {
    const Game = await freshGame(4242);
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    const npcs = (v.roster || []).filter(id => id !== sid);
    ok(npcs.length >= 2, 'roster has ≥2 NPCs to test gate vs knower', `npcs=${npcs.length}`);
    const knowerId = npcs[0], otherId = npcs[1];
    const eq = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.equipment) || null;
    ok(!!eq && typeof eq.autoEquip === 'function', 'equipment.autoEquip available');
    // Knower: give bark_armor and wear it.
    const kp = Game.getPerson ? Game.getPerson(knowerId) : null;
    const op = Game.getPerson ? Game.getPerson(otherId) : null;
    ok(!!kp && !!op, 'getPerson resolves both test villagers');
    if (kp && op && eq) {
      kp.items = kp.items || [];
      if (!kp.items.some(it => (it.itemId || it.id) === 'bark_armor')) kp.items.push({ itemId: 'bark_armor', name: 'Bark armor', units: 1, kcalEach: 0, kg: 1.2 });
      try { eq.autoEquip(kp, Game.data.items || []); } catch (e) {}
      const worn = new Set(Object.values(kp.equipped || {}).map(e => e && e.itemId).filter(Boolean));
      ok(worn.has('bark_armor'), 'knower wears bark_armor after autoEquip', `worn=${[...worn].join(',')}`);
      const wornOther = new Set(Object.values(op.equipped || {}).map(e => e && e.itemId).filter(Boolean));
      ok(!wornOther.has('bark_armor') && !wornOther.has('hide_armor'), 'other villager wears no craft armor (gate control)');
      // Materials: abundant, so the gate — not scarcity — decides who attempts.
      const st = Game.stashState ? Game.stashState() : null;
      if (st) { st.materials.bark = 30; st.materials.vine = 20; st.materials.hide = 20; }
      v.avCraft = {}; v.avCraftCd = {};
      if (Game.state.scholar) Game.state.scholar.day = 10;
      // Keep both villagers home for the beat.
      if (v.away) { delete v.away[knowerId]; delete v.away[otherId]; }
      const events = [];
      const origTele = Game.tele;
      Game.tele = function (type, data) {
        const r = origTele.apply(this, arguments);
        try { if (type === 'armor_craft') events.push({ ok: !!(data && data.ok), vid: data && data.vid, item: data && data.item }); } catch (e) {}
        return r;
      };
      let made = null;
      try { made = Game.villagerArmorCraftDay(); } catch (e) { console.log('  craft call threw: ' + e.message); }
      Game.tele = origTele;
      const knowerCd = (v.avCraftCd || {})[knowerId];
      const otherCd = (v.avCraftCd || {})[otherId];
      ok(knowerCd === 10 || (typeof made === 'number' && made >= 0 && events.some(e => e.vid === knowerId)),
        'knower attempts when materials are on hand', `knowerCd=${knowerCd} made=${made} events=${JSON.stringify(events)}`);
      ok(otherCd === undefined || otherCd === null, 'non-wearer never attempts even with materials on hand', `otherCd=${otherCd}`);
      // Cooldown: a second call the same day must not attempt again for the knower.
      const events2 = [];
      const origTele2 = Game.tele;
      Game.tele = function (type, data) {
        const r = origTele2.apply(this, arguments);
        try { if (type === 'armor_craft') events2.push({ vid: data && data.vid }); } catch (e) {}
        return r;
      };
      try { Game.villagerArmorCraftDay(); } catch (e) {}
      Game.tele = origTele2;
      ok(!events2.some(e => e.vid === knowerId), 'knower does not attempt twice within 3 days (cooldown holds)', `second-call events=${JSON.stringify(events2)}`);
    }
  }

  console.log('E4 crafted piece gears another villager via spares flow (seed 5150)');
  {
    const Game = await freshGame(5150);
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    const npcs = (v.roster || []).filter(id => id !== sid);
    const eq = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.equipment) || null;
    const wornIds = (p) => new Set(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean));
    const armorWorn = (p) => [...wornIds(p)].some(id => { const d = (Game.data.items || []).find(x => x && x.id === id); return !!(d && d.armor); });
    ok(npcs.length >= 2 && !!eq, 'roster + equipment available for spares-flow test', `npcs=${npcs.length}`);
    if (npcs.length >= 2 && eq) {
      const knowerId = npcs[0];
      const kp = Game.getPerson ? Game.getPerson(knowerId) : null;
      // Unarmored recipient: prefer a villager wearing no armor; else strip
      // one volunteer's worn armor (test fixture only) so the gain is real.
      let recipId = null, rp = null;
      for (const id of npcs.slice(1)) {
        const p = Game.getPerson ? Game.getPerson(id) : null;
        if (p && !armorWorn(p)) { recipId = id; rp = p; break; }
      }
      if (!recipId) {
        recipId = npcs[1]; rp = Game.getPerson ? Game.getPerson(recipId) : null;
        if (rp && rp.equipped) for (const slot of Object.keys(rp.equipped)) {
          const e = rp.equipped[slot];
          const d = e && (Game.data.items || []).find(x => x && x.id === e.itemId);
          if (d && d.armor) delete rp.equipped[slot];
        }
      }
      // The recipient must hold no bark_armor anywhere (items/stash), or
      // the final assertion could pass vacuously off their own gear.
      if (rp) {
        const strip = (arr) => { if (Array.isArray(arr)) for (let i = arr.length - 1; i >= 0; i--) { const it = arr[i]; if ((it && (it.itemId || it.id)) === 'bark_armor') arr.splice(i, 1); } };
        strip(rp.items); strip(rp.stashed);
      }
      ok(!!kp && !!rp && !armorWorn(rp), 'knower + unarmored recipient ready', `recip=${recipId}`);
      if (kp && rp) {
        kp.items = kp.items || [];
        if (!kp.items.some(it => (it.itemId || it.id) === 'bark_armor')) kp.items.push({ itemId: 'bark_armor', name: 'Bark armor', units: 1, kcalEach: 0, kg: 1.2 });
        try { eq.autoEquip(kp, Game.data.items || []); } catch (e) {}
        ok(wornIds(kp).has('bark_armor'), 'knower wears bark_armor (knowledge source)');
        const st = Game.stashState ? Game.stashState() : null;
        if (st) { st.materials.bark = 90; st.materials.vine = 60; st.materials.hide = 60; }
        v.avCraft = {}; v.avCraftCd = {};
        if (v.away) { delete v.away[knowerId]; delete v.away[recipId]; }
        let succeeded = false, tries = 0;
        for (let t = 0; t < 40 && !succeeded; t++) {
          if (Game.state.scholar) Game.state.scholar.day = 10 + t * 3;
          const events = [];
          const origTele = Game.tele;
          Game.tele = function (type, data) {
            const r = origTele.apply(this, arguments);
            try { if (type === 'armor_craft' && data && data.ok) events.push(data); } catch (e) {}
            return r;
          };
          try { Game.villagerArmorCraftDay(); } catch (e) {}
          Game.tele = origTele;
          tries++;
          if (events.length) succeeded = true;
        }
        ok(succeeded, 'knower eventually crafts a piece (35% blind odds, ≤40 tries)', `tries=${tries}`);
        const beforeWorn = wornIds(rp).has('bark_armor');
        try { Game.villagerGearDay(); } catch (e) { console.log('  gear day threw: ' + e.message); }
        // Gated on succeeded: without a real craft this must FAIL, not pass
        // vacuously off the recipient's own gear (stripped above as well).
        ok(succeeded && !beforeWorn && wornIds(rp).has('bark_armor'), 'crafted piece moves to the unarmored villager, who now wears it', `recip=${recipId} succeeded=${succeeded}`);
      }
    }
  }

  console.log('E5 hide knower attempts a hide craft without the flag (seed 4243)');
  {
    const Game = await freshGame(4243);
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    const npcs = (v.roster || []).filter(id => id !== sid);
    const eq = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.equipment) || null;
    ok(npcs.length >= 1 && !!eq, 'roster + equipment available for hide test');
    if (npcs.length >= 1 && eq) {
      const knowerId = npcs[0];
      const kp = Game.getPerson ? Game.getPerson(knowerId) : null;
      if (kp) {
        kp.items = kp.items || [];
        if (!kp.items.some(it => (it.itemId || it.id) === 'hide_armor')) kp.items.push({ itemId: 'hide_armor', name: 'Hide armor', units: 1, kcalEach: 0, kg: 1.5 });
        try { eq.autoEquip(kp, Game.data.items || []); } catch (e) {}
        const worn = new Set(Object.values(kp.equipped || {}).map(e => e && e.itemId).filter(Boolean));
        ok(worn.has('hide_armor') && !worn.has('bark_armor'), 'hide knower wears hide_armor only');
        const st = Game.stashState ? Game.stashState() : null;
        if (st) { st.materials.hide = 20; st.materials.vine = 20; st.materials.bark = 0; }
        v.avCraft = {}; v.avCraftCd = {};
        if (Game.state.scholar) Game.state.scholar.day = 10;
        if (v.away) delete v.away[knowerId];
        const events = [];
        const origTele = Game.tele;
        Game.tele = function (type, data) {
          const r = origTele.apply(this, arguments);
          try { if (type === 'armor_craft') events.push({ ok: !!(data && data.ok), vid: data && data.vid, item: data && data.item }); } catch (e) {}
          return r;
        };
        try { Game.villagerArmorCraftDay(); } catch (e) {}
        Game.tele = origTele;
        ok(events.some(e => e.vid === knowerId && e.item === 'hide_armor'), 'hide knower attempts a hide craft without the flag', `events=${JSON.stringify(events)}`);
      }
    }
  }

  console.log('E6 armory-pile draw without the flag: deposited armor is worn (seed 5151)');
  {
    const Game = await freshGame(5151);
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    const npcs = (v.roster || []).filter(id => id !== sid);
    const eq = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.equipment) || null;
    const wornIds = (p) => new Set(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean));
    const armorWorn = (p) => [...wornIds(p)].some(id => { const d = (Game.data.items || []).find(x => x && x.id === id); return !!(d && d.armor); });
    ok(npcs.length >= 1 && !!eq, 'roster + equipment available for pile-draw test', `npcs=${npcs.length}`);
    if (npcs.length >= 1 && eq) {
      let recipId = null, rp = null;
      for (const id of npcs) {
        const p = Game.getPerson ? Game.getPerson(id) : null;
        if (p && !armorWorn(p)) { recipId = id; rp = p; break; }
      }
      if (!recipId) {
        recipId = npcs[0]; rp = Game.getPerson ? Game.getPerson(recipId) : null;
        if (rp && rp.equipped) for (const slot of Object.keys(rp.equipped)) {
          const e = rp.equipped[slot];
          const d = e && (Game.data.items || []).find(x => x && x.id === e.itemId);
          if (d && d.armor) delete rp.equipped[slot];
        }
      }
      if (rp) {
        const strip = (arr) => { if (Array.isArray(arr)) for (let i = arr.length - 1; i >= 0; i--) { const it = arr[i]; if ((it && (it.itemId || it.id)) === 'bark_armor') arr.splice(i, 1); } };
        strip(rp.items); strip(rp.stashed);
      }
      // TIGHTENED (E6 must not pass vacuously): strip bark_armor spares from
      // EVERY villager's carried/stashed gear, so the pile piece is the only
      // unworn bark_armor in the world. Worn copies stay (spares flow skips
      // the worn copy), but no second copy may flow to the recipient.
      for (const id of npcs) {
        const p = Game.getPerson ? Game.getPerson(id) : null;
        if (!p) continue;
        const stripAll = (arr) => { if (Array.isArray(arr)) for (let i = arr.length - 1; i >= 0; i--) { const it = arr[i]; if ((it && (it.itemId || it.id)) === 'bark_armor') arr.splice(i, 1); } };
        stripAll(p.items); stripAll(p.stashed);
      }
      ok(!!rp && !armorWorn(rp), 'unarmored recipient ready (no armor worn or carried)', `recip=${recipId}`);
      if (rp) {
        if (v.away) delete v.away[recipId];
        const st = Game.stashState ? Game.stashState() : null;
        ok(!!st, 'stashState available');
        if (st) {
          st.armor = st.armor || [];
          st.armor.push({ itemId: 'bark_armor', name: 'Bark armor', units: 1 });
        }
        const beforeWorn = wornIds(rp).has('bark_armor');
        try { Game.villagerGearDay(); } catch (e) { console.log('  gear day threw: ' + e.message); }
        const pileAfter = st ? (st.armor || []).filter(e => (e.itemId || e.id) === 'bark_armor').reduce((t, e) => t + (e.units || 1), 0) : -1;
        // Gated on the pile being drawn: the recipient must wear it AND the
        // pile must be empty — otherwise the piece came from elsewhere.
        ok(!beforeWorn && wornIds(rp).has('bark_armor') && pileAfter === 0, 'deposited bark armor is drawn from the pile and worn, no flag', `recip=${recipId} pileAfter=${pileAfter}`);
      }
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FAILED', e && e.stack || e); process.exit(1); });
