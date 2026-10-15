#!/usr/bin/env node
// scripts/meatlastmile-lib-20261015.js — COOK→EAT LAST-MILE diagnostic
// instrument (loop B, 2026-10-15, ARM sim-meatlastmile).
//
// INSTRUMENT ONLY — read-only telemetry wraps around the monster-meat
// pipeline. No game-code changes; every wrap is call-through with
// before/after observation (the predation-lib / meat-discovery pattern).
// Attributes killed-monster meat kcal stage by stage:
//   killed → corpseRot → hauled → cleaned (self + specialist) →
//   cooked/smoked/rendered/pemmican → eaten (player by foodState;
//   villager via pantry ledger) → rotted (pack/stash/pantry) →
//   succession-lost → leftover.
// Belltoad legs vs body are attributed separately by plantId
// (meat_belltoad_legs vs meat_belltoad — Steve 2026-10-13).
//
// Kcal model: val(it) = realized edible kcal (kcalEach×units) when > 0,
// else hiddenKcal (the gross/potential — carcasses, undiscovered flesh).
// Cleaning converts gross → net; cooking can scorch; rot/succession
// remove at val. Conservation is checked at finalize.
//
// Usage:
//   const { attachInstruments, finalize } = require('./meatlastmile-lib-20261015');
//   const m = attachInstruments(Game);   // before runDays
//   ... runDays(Game, policy, opts) ...
//   const s = finalize(Game, m, result); // stage ledgers + conservation
'use strict';

function attachInstruments(Game) {
  const m = {
    kills: 0,
    killed: {}, killedPlayer: {}, killedVillager: {},
    corpseRot: {}, hauledGross: {}, hauledState: {},
    cleanGross: {}, cleanNet: {}, cleanValIn: {}, specGross: {}, specNet: {}, specValIn: {},
    selfCleans: 0, specCleans: 0,
    cookLoss: {},            // stage -> kcal (cook, smoke, pemmican, specialist, render)
    eaten: {}, eatenState: {}, eatenPemmicanMixed: 0,
    rotPack: {}, rotStash: {}, rotPantry: {},
    carcassRotPack: 0,       // carcass-state rot in pack/stash (gross)
    successionNet: 0, successionGross: 0, successions: 0,
    donatedNet: {}, withdrawNet: {},
    villHauledGross: {}, villHauledNet: {},
    leftover: {}, leftoverState: {},
    haulEvents: 0, eatEvents: 0,
    pemmicanIn: {},
    revealDelta: 0, reveals: 0,
    transcript: [],          // sampled meat-handling beats (sense-test)
    instrErrors: [],
  };
  const note = (where, e) => { m.instrErrors.push(where + ': ' + (e && e.message)); };
  const day = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const add = (obj, key, v) => { if (key && v) obj[key] = Math.round((obj[key] || 0) + v); };
  const add2 = (obj, k1, k2, v) => {
    if (!k1 || !v) return;
    obj[k1] = obj[k1] || {};
    obj[k1][k2] = Math.round((obj[k1][k2] || 0) + v);
  };

  // monster-meat key: 'meat_<mid>' or 'meat_belltoad_legs'. Null otherwise.
  const keyOf = (plantId) => {
    const pid = String(plantId || '');
    if (!/^meat_/.test(pid) || pid === 'meat_human') return null;
    const mid = pid.slice(5);
    try {
      const base = (mid === 'belltoad_legs') ? 'belltoad' : mid;
      return (Game.data.monsters || []).some(x => x.id === base) ? pid : null;
    } catch (e) { return null; }
  };
  // value of one item: realized edible kcal, else the gross/potential.
  // A units<=0 item is an emptied shell (the take/eat paths zero units and
  // the engine treats it as gone) — its stale hiddenKcal must not count.
  const val = (it) => {
    if (!it) return 0;
    const u = (it.units == null ? 1 : it.units);
    if (!(u > 0)) return 0;
    const realized = (it.kcalEach || 0) * u;
    if (realized > 0) return Math.round(realized);
    return Math.round(it.hiddenKcal || 0);
  };
  const pack = () => { try { return Game.state.scholar.inventory || []; } catch (e) { return []; } };
  const stash = () => { try { const s = Game.prepStash ? Game.prepStash() : null; return (s && s !== Game.state.scholar.inventory) ? s : []; } catch (e) { return []; } };
  const pantry = () => { try { return (Game.state.village || {}).pantry || []; } catch (e) { return []; } };
  // snapshot of all monster-meat across player containers (+ corpses opt)
  const scanAll = (withCorpses) => {
    const out = new Map();
    const conts = [[pack(), 'pack'], [stash(), 'stash'], [pantry(), 'pantry']];
    if (withCorpses) {
      try {
        for (const c of (Game.state.corpses || [])) {
          if (!c || c.buried || !c.items) continue;
          conts.push([c.items, 'corpse:' + c.kind]);
        }
      } catch (e) {}
    }
    for (const [cont, where] of conts) {
      for (const it of (cont || [])) {
        if (!it) continue;
        const key = keyOf(it.plantId);
        if (!key) continue;
        out.set(it, { key, state: it.foodState || '?', val: val(it), where });
      }
    }
    return out;
  };
  const scanOne = (cont, where) => {
    const out = new Map();
    for (const it of (cont || [])) {
      if (!it) continue;
      const key = keyOf(it.plantId);
      if (!key) continue;
      out.set(it, { key, state: it.foodState || '?', val: val(it), where });
    }
    return out;
  };
  const wrap = (name, fn) => {
    const f = Game[name];
    if (typeof f !== 'function') { note('wrap-missing', new Error(name)); return; }
    Game[name] = function (...a) { try { fn.apply(this, a); } catch (e) { note('pre:' + name, e); } return f.apply(this, a); };
  };

  // --- say: sample meat-handling beats for sense-testing ---
  const MEAT_LINE = /meat|flesh|carcass|butcher|clean it|smok|cook|spoil|went bad|rot|ate |eats |hauled|🥩/i;
  try {
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        const s = String(msg || '');
        if (MEAT_LINE.test(s) && m.transcript.length < 80)
          m.transcript.push({ day: day(), text: s.slice(0, 300) });
      } catch (e) {}
      return origSay(msg);
    };
  } catch (e) { note('wrapSay', e); }

  // --- 1. KILLED: monsterCarcassEntries is the single kill funnel (all 4
  // kill paths: tbKillRewards, patrol, villager combat, mapmemNoteKill).
  // Each returned entry carries hiddenKcal = the species gross.
  {
    const f = Game.monsterCarcassEntries;
    if (typeof f !== 'function') { note('wrap-missing', new Error('monsterCarcassEntries')); }
    else Game.monsterCarcassEntries = function (mdef) {
      let entries = [];
      try { entries = f.apply(this, arguments); } catch (e) { return entries; }
      try {
        for (const e of (entries || [])) {
          const key = keyOf(e && e.plantId);
          if (!key) continue;
          const g = Math.round(e.hiddenKcal || 0);
          m.kills++;
          add(m.killed, key, g);
          try {
            const list = Game.corpses ? Game.corpses() : [];
            let c = null;
            for (let i = list.length - 1; i >= 0; i--)
              if (list[i] && list[i].kind === 'monster') { c = list[i]; break; }
            if (c && Game.villagerId && c.killerId === Game.villagerId)
              add(m.killedPlayer, key, g);
            else add(m.killedVillager, key, g);
          } catch (ee) { add(m.killedVillager, key, g); }
        }
      } catch (e) { note('monsterCarcassEntries', e); }
      return entries;
    };
  }

  // --- 2. HAULED: _corpseTakeStack is the single corpse→pack funnel.
  {
    const f = Game._corpseTakeStack;
    if (typeof f === 'function') {
      Game._corpseTakeStack = function (c, it) {
        try {
          const key = keyOf(it && it.plantId);
          if (key) {
            const v = val(it);
            add(m.hauledGross, key, v);
            add2(m.hauledState, key, String(it.foodState || '?'), v);
            m.haulEvents++;
          }
        } catch (e) { note('_corpseTakeStack', e); }
        return f.apply(this, arguments);
      };
    } else note('wrap-missing', new Error('_corpseTakeStack'));
  }

  // --- 3. CLEANED (self): carcassToMeat mutates the item in place.
  // Ledger value-in is val() BEFORE (post-reveal if revealed); the physical
  // gross (hiddenKcal) is recorded separately for the butcher's-cut narrative.
  {
    const f = Game.carcassToMeat;
    if (typeof f === 'function') {
      Game.carcassToMeat = function (inv, i, knows) {
        let key = null, valBefore = 0, gross = 0, it = null;
        try {
          it = inv && inv[i];
          if (it && it.foodState === 'carcass') {
            key = keyOf(it.plantId);
            valBefore = val(it);
            gross = Math.round(it.hiddenKcal || 0);
          }
        } catch (e) {}
        const r = f.apply(this, arguments);
        try {
          if (key && it) {
            add(m.cleanValIn, key, valBefore);
            add(m.cleanGross, key, gross);
            add(m.cleanNet, key, val(it));
            m.selfCleans++;
          }
        } catch (e) { note('carcassToMeat', e); }
        return r;
      };
    } else note('wrap-missing', new Error('carcassToMeat'));
  }

  // --- 3b. CLEANED (specialist): askSpecialist butchers in place without
  // carcassToMeat; cook/preserver branches transform in place. Butcher is
  // attributed explicitly; other tasks via container net-diff.
  {
    const f = Game.askSpecialist;
    if (typeof f === 'function') {
      Game.askSpecialist = function (vid, idx, container, forceTask) {
        let it = null, key = null, valBefore = 0, gross = 0, butcherPath = false;
        let beforeScan = null;
        try {
          const inv = container || pack();
          it = inv && inv[idx];
          if (it && it.foodState === 'carcass') {
            key = keyOf(it.plantId);
            if (key) { valBefore = val(it); gross = Math.round(it.hiddenKcal || 0); butcherPath = true; }
          } else {
            beforeScan = scanAll(false);
          }
        } catch (e) {}
        const r = f.apply(this, arguments);
        try {
          if (butcherPath && it && it.foodState !== 'carcass') {
            add(m.specValIn, key, valBefore);
            add(m.specGross, key, gross);
            add(m.specNet, key, val(it));
            m.specCleans++;
          } else if (beforeScan) {
            const afterScan = scanAll(false);
            let b = 0, a = 0;
            for (const x of beforeScan.values()) b += x.val;
            for (const x of afterScan.values()) a += x.val;
            const loss = b - a;
            if (loss !== 0) add(m.cookLoss, 'specialist', loss);
          }
        } catch (e) { note('askSpecialist', e); }
        return r;
      };
    } else note('wrap-missing', new Error('askSpecialist'));
  }

  // --- transform wraps: container net-diff → stage loss. Vanished refs
  // are rot (attributed separately); the residual diff is process loss.
  const transformWrap = (name, stage) => {
    const f = Game[name];
    if (typeof f !== 'function') { note('wrap-missing', new Error(name)); return; }
    Game[name] = function (...a) {
      let before = null;
      try { before = scanAll(false); } catch (e) {}
      const r = f.apply(this, a);
      try {
        const after = scanAll(false);
        let b = 0, aSum = 0, rotV = 0;
        for (const x of before.values()) b += x.val;
        for (const x of after.values()) aSum += x.val;
        for (const [ref, bx] of before) {
          if (!after.has(ref)) {
            rotV += bx.val;
            const bucket = bx.where === 'pantry' ? m.rotPantry : bx.where === 'stash' ? m.rotStash : m.rotPack;
            add(bucket, bx.key, bx.val);
            if (bx.state === 'carcass') m.carcassRotPack += bx.val;
          }
        }
        const loss = b - aSum - rotV;
        if (loss !== 0) add(m.cookLoss, stage, loss);
      } catch (e) { note(name, e); }
      return r;
    };
  };
  transformWrap('cookAll', 'cook');
  transformWrap('cookFood', 'cook');
  transformWrap('preserveFood', 'smoke');

  // --- pemmican: outputs are anonymous bars (plantId null) — attribute
  // input net by key; the bars are a mixed pool from here on.
  {
    const f = Game.makePemmican;
    if (typeof f === 'function') {
      Game.makePemmican = function (...a) {
        let before = null;
        try { before = scanAll(false); } catch (e) {}
        const r = f.apply(this, a);
        try {
          const after = scanAll(false);
          for (const [ref, bx] of before) {
            if (!after.has(ref)) add(m.pemmicanIn, bx.key, bx.val);
          }
        } catch (e) { note('makePemmican', e); }
        return r;
      };
    } else note('wrap-missing', new Error('makePemmican'));
  }

  // --- 6. EATEN: identity-diff across eat/eatOne/eatStashOne. Attributes
  // consumed kcal by foodState at eat time.
  const scanOneFull = (cont, where) => {
    const out = new Map();
    let spoilBonus = 0;
    try { spoilBonus = Math.round(Game.modTarget('food.spoilage_days', 0)); } catch (e) {}
    for (const it of (cont || [])) {
      if (!it) continue;
      const key = keyOf(it.plantId);
      if (!key) continue;
      let spoiled = false;
      try { spoiled = !!(Game.isSpoiled && Game.isSpoiled(it, spoilBonus)); } catch (e) {}
      out.set(it, { key, state: it.foodState || '?', val: val(it), where,
                    units: it.units || 0, kcalEach: it.kcalEach || 0, spoiled });
    }
    return out;
  };
  const eatWrapFull = (name, contFn, where) => {
    const f = Game[name];
    if (typeof f !== 'function') { note('wrap-missing', new Error(name)); return; }
    Game[name] = function (...a) {
      let before = null;
      try { before = scanOneFull(contFn(), where); } catch (e) {}
      const r = f.apply(this, a);
      try {
        const afterUnits = new Map();
        for (const it of (contFn() || [])) afterUnits.set(it, it.units || 0);
        for (const [ref, bx] of before) {
          const nowU = afterUnits.has(ref) ? afterUnits.get(ref) : 0;
          const cu = Math.max(0, bx.units - nowU);
          if (cu > 0 && bx.kcalEach > 0 && !bx.spoiled) {
            const kcal = Math.round(cu * bx.kcalEach);
            add(m.eaten, bx.key, kcal);
            add2(m.eatenState, bx.key, bx.state, kcal);
            m.eatEvents++;
          } else if (cu > 0 && bx.spoiled) {
            // Game.eat() discards spoiled items at the end of the meal —
            // that is ROT, not eating (it never entered the mouth).
            const bucket = bx.where === 'stash' ? m.rotStash : m.rotPack;
            add(bucket, bx.key, bx.val);
          }
        }
      } catch (e) { note(name, e); }
      return r;
    };
  };
  eatWrapFull('eat', pack, 'pack');
  eatWrapFull('eatOne', pack, 'pack');
  eatWrapFull('eatStashOne', stash, 'stash');

  // --- 7. ROTTED: sweepSpoiled removes from pack/stash/pantry/corpses.
  // Vanished refs attribute by (where, state); carcasses carry gross.
  {
    const f = Game.sweepSpoiled;
    if (typeof f === 'function') {
      Game.sweepSpoiled = function (...a) {
        let before = null;
        try { before = scanAll(true); } catch (e) {}
        const r = f.apply(this, a);
        try {
          const after = scanAll(true);
          for (const [ref, bx] of before) {
            if (!after.has(ref)) {
              if (String(bx.where).startsWith('corpse')) add(m.corpseRot, bx.key, bx.val);
              else if (bx.where === 'pantry') add(m.rotPantry, bx.key, bx.val);
              else if (bx.where === 'stash') add(m.rotStash, bx.key, bx.val);
              else add(m.rotPack, bx.key, bx.val);
            }
          }
        } catch (e) { note('sweepSpoiled', e); }
        return r;
      };
    } else note('wrap-missing', new Error('sweepSpoiled'));
  }

  // --- 8. cleanCarcass dropRotten: rotten carcasses refused mid-day.
  // Converted carcasses are measured in carcassToMeat; vanished = rot.
  {
    const f = Game.cleanCarcass;
    if (typeof f === 'function') {
      Game.cleanCarcass = function (idx, container) {
        let before = null, contKind = 'pack';
        try {
          const cont = container || pack();
          contKind = (container && container !== pack()) ? 'stash' : 'pack';
          before = scanOne(cont, contKind);
        } catch (e) {}
        const r = f.apply(this, arguments);
        try {
          const cont = container || pack();
          const afterSet = new Set(cont || []);
          for (const [ref, bx] of before) {
            if (!afterSet.has(ref)) {
              // converted refs survive (mutated in place); vanished = rot
              const bucket = contKind === 'stash' ? m.rotStash : m.rotPack;
              add(bucket, bx.key, bx.val);
              if (bx.state === 'carcass') m.carcassRotPack += bx.val;
            }
          }
        } catch (e) { note('cleanCarcass', e); }
        return r;
      };
    }
  }

  // --- 9b. REVEAL: markMonsterFoodSafe grants kcalEach to matching pack/
  // stash meat (flat 40% of gross — the engine's own convention). For
  // undiscovered meat the instrument values potential at hiddenKcal, so
  // the reveal is a real value step (usually -60%: potential → realized).
  // Tracked signed; folds into the pack-side identity.
  {
    const f = Game.markMonsterFoodSafe;
    if (typeof f === 'function') {
      Game.markMonsterFoodSafe = function (...a) {
        let before = 0;
        try { for (const x of scanAll(false).values()) before += x.val; } catch (e) {}
        const r = f.apply(this, a);
        try {
          let after = 0;
          for (const x of scanAll(false).values()) after += x.val;
          const d = after - before;
          m.revealDelta = Math.round((m.revealDelta || 0) + d);
          m.reveals = (m.reveals || 0) + 1;
        } catch (e) { note('markMonsterFoodSafe', e); }
        return r;
      };
    } else note('wrap-missing', new Error('markMonsterFoodSafe'));
  }

  // --- 10. SUCCESSION: playerDeath zeroes the pack into the death pack
  // (ledger.js: gearPack items get kcalEach 0 — the food dies with them).
  {
    const f = Game.playerDeath;
    if (typeof f === 'function') {
      Game.playerDeath = function (...a) {
        let before = 0, grossBefore = 0;
        try {
          for (const it of (pack() || [])) {
            const key = keyOf(it.plantId);
            if (!key) continue;
            before += val(it);
            if (it.foodState === 'carcass') grossBefore += val(it);
          }
        } catch (e) {}
        const r = f.apply(this, a);
        try {
          m.successions++;
          m.successionNet += before - grossBefore;
          m.successionGross += grossBefore;
        } catch (e) { note('playerDeath', e); }
        return r;
      };
    }
  }

  // --- pantry ledger: donations in, policy withdrawals out.
  {
    const f = Game.donateToPantry;
    if (typeof f === 'function') {
      Game.donateToPantry = function (idx) {
        let key = null, v = 0;
        try {
          const it = (pack() || [])[idx];
          key = keyOf(it && it.plantId);
          if (key) v = val(it);
        } catch (e) {}
        const r = f.apply(this, arguments);
        try { if (key && v) add(m.donatedNet, key, v); } catch (e) { note('donateToPantry', e); }
        return r;
      };
    }
    const wTake = (name) => {
      const f2 = Game[name];
      if (typeof f2 !== 'function') return;
      Game[name] = function (...a) {
        let before = 0;
        try { for (const x of scanAll(false).values()) if (x.where === 'pantry') before += x.val; } catch (e) {}
        const r = f2.apply(this, a);
        try {
          let after = 0;
          for (const x of scanAll(false).values()) if (x.where === 'pantry') after += x.val;
          const out = before - after;
          if (out > 0) m.withdrawTotal = Math.round((m.withdrawTotal || 0) + out);
        } catch (e) { note(name, e); }
        return r;
      };
    };
    wTake('takeFromPantry');
    wTake('takeFromPantryBulk');
  }

  // --- villager haul: mapmemHaulAt butchers at the corpse; the net rides
  // home to the pantry (stockPantry) via the HAUL objective return.
  {
    const f = Game.mapmemHaulAt;
    if (typeof f === 'function') {
      Game.mapmemHaulAt = function (vid) {
        let key = null, gross = 0;
        try {
          const o = Game.objOf ? Game.objOf(vid) : null;
          const cs = Game.corpses ? Game.corpses() : [];
          const corpse = (o && cs.find(c => c.id === o.targetRef)) || null;
          if (corpse) {
            key = corpse.monsterId ? ('meat_' + corpse.monsterId) : null;
            if (key && !keyOf(key)) key = null;
            for (const it of (corpse.items || [])) {
              if (it && keyOf(it.plantId) && (it.units == null ? 1 : it.units) > 0)
                gross += val(it);
            }
          }
        } catch (e) {}
        const r = f.apply(this, arguments);
        try {
          if (r && key) {
            const o = Game.objOf ? Game.objOf(vid) : null;
            const net = (o && o.haulKcal) || 0;
            add(m.villHauledGross, key, gross);
            add(m.villHauledNet, key, net);
          }
        } catch (e) { note('mapmemHaulAt', e); }
        return r;
      };
    }
  }

  m.installDay = day();
  return m;
}

function finalize(Game, m, result) {
  const sum = (o) => Object.values(o || {}).reduce((t, v) => t + (v || 0), 0);
  const out = {
    kills: m.kills,
    killed: m.killed,
    killedPlayer: m.killedPlayer,
    killedVillager: m.killedVillager,
    killedTotal: sum(m.killed),
    corpseRot: m.corpseRot, corpseRotTotal: sum(m.corpseRot),
    hauledGross: m.hauledGross, hauledTotal: sum(m.hauledGross),
    hauledState: m.hauledState, haulEvents: m.haulEvents,
    cleanGross: m.cleanGross, cleanNet: m.cleanNet, cleanValIn: m.cleanValIn,
    specGross: m.specGross, specNet: m.specNet, specValIn: m.specValIn,
    selfCleans: m.selfCleans, specCleans: m.specCleans,
    cookLoss: m.cookLoss, cookLossTotal: sum(m.cookLoss),
    eaten: m.eaten, eatenTotal: sum(m.eaten), eatenState: m.eatenState,
    eatEvents: m.eatEvents,
    rotPack: m.rotPack, rotPackTotal: sum(m.rotPack),
    rotStash: m.rotStash, rotStashTotal: sum(m.rotStash),
    rotPantry: m.rotPantry, rotPantryTotal: sum(m.rotPantry),
    carcassRotPack: Math.round(m.carcassRotPack),
    successionNet: Math.round(m.successionNet),
    successionGross: Math.round(m.successionGross),
    successions: m.successions,
    donatedNet: m.donatedNet, donatedTotal: sum(m.donatedNet),
    withdrawTotal: Math.round(m.withdrawTotal || 0),
    villHauledGross: m.villHauledGross, villHauledNet: m.villHauledNet,
    villHauledGrossTotal: sum(m.villHauledGross),
    villHauledNetTotal: sum(m.villHauledNet),
    pemmicanIn: m.pemmicanIn || {}, pemmicanInTotal: sum(m.pemmicanIn || {}),
    transcript: m.transcript,
    instrErrors: m.instrErrors,
  };
  // leftover at run end
  const loKeyOf = (plantId) => {
    const pid = String(plantId || '');
    if (!/^meat_/.test(pid) || pid === 'meat_human') return null;
    const mid = pid.slice(5);
    try {
      const base = (mid === 'belltoad_legs') ? 'belltoad' : mid;
      return (Game.data.monsters || []).some(x => x.id === base) ? pid : null;
    } catch (e) { return null; }
  };
  try {
    const lo = {}, loS = {};
    const conts = [[Game.state.scholar.inventory, 'pack']];
    try { const s = Game.prepStash ? Game.prepStash() : null; if (s && s !== Game.state.scholar.inventory) conts.push([s, 'stash']); } catch (e) {}
    try { conts.push([(Game.state.village || {}).pantry || [], 'pantry']); } catch (e) {}
    for (const [cont, where] of conts) {
      for (const it of (cont || [])) {
        const k = loKeyOf(it && it.plantId);
        if (!k) continue;
        const realized = (it.kcalEach || 0) * (it.units || 1);
        const v = Math.round(realized > 0 ? realized : (it.hiddenKcal || 0));
        if (v <= 0) continue;
        lo[k] = (lo[k] || 0) + v;
        loS[k] = loS[k] || {};
        const st = (it.foodState || '?') + '@' + where;
        loS[k][st] = (loS[k][st] || 0) + v;
      }
    }
    out.leftover = lo;
    out.leftoverState = loS;
    out.leftoverTotal = sum(lo);
  } catch (e) { out.leftover = {}; out.leftoverState = {}; out.leftoverTotal = 0; }
  // conservation
  // GROSS-SIDE (the pipeline): killed = corpseRot + hauled + villHauled + unattr.
  const grossAtt = out.corpseRotTotal + out.hauledTotal + out.villHauledGrossTotal;
  out.grossUnattributed = Math.round(out.killedTotal - grossAtt);
  // PACK-SIDE identity (pack inflow = hauled gross at potential value):
  //   hauled + revealDelta + cookGain
  //     = cleanLoss + cookLossPos + eaten + rotPack + rotStash + donated
  //       + successionNet + leftoverNet + pemmicanIn
  //       + carcassRotPack + successionGross + carcassLeftover
  // (carcassRotPack/successionGross are the gross-valued carcass outflows;
  // leftoverState splits net vs carcass by '@pack'/'@stash' foodState.)
  const cleanIn = sum(m.cleanGross) + sum(m.specGross);
  out.cleanLossTotal = Math.round(cleanIn - (sum(m.cleanNet) + sum(m.specNet)));
  // ledger clean loss (value-in based — no overlap with revealDelta)
  out.cleanLossValTotal = Math.round(
    (sum(m.cleanValIn) + sum(m.specValIn)) - (sum(m.cleanNet) + sum(m.specNet)));
  const cookLossSigned = sum(m.cookLoss);
  out.cookGainTotal = Math.round(-Math.min(0, cookLossSigned));
  const cookLossPos = Math.max(0, Math.round(cookLossSigned));
  out.revealDelta = Math.round(m.revealDelta || 0);
  out.reveals = m.reveals || 0;
  let leftoverCarcass = 0, leftoverNetOnly = 0;
  try {
    for (const k of Object.keys(out.leftoverState || {}))
      for (const sk of Object.keys(out.leftoverState[k])) {
        if (/^carcass@/.test(sk)) leftoverCarcass += out.leftoverState[k][sk];
        else leftoverNetOnly += out.leftoverState[k][sk];
      }
  } catch (e) {}
  out.leftoverCarcassTotal = Math.round(leftoverCarcass);
  const packIn = out.hauledTotal + out.revealDelta + out.cookGainTotal;
  const packOut = out.cleanLossValTotal + cookLossPos + out.eatenTotal +
    out.rotPackTotal + out.rotStashTotal + out.donatedTotal +
    out.successionNet + leftoverNetOnly + sum(m.pemmicanIn || {}) +
    Math.round(m.carcassRotPack) + Math.round(m.successionGross) + leftoverCarcass;
  out.packInTotal = Math.round(packIn);
  out.packOutTotal = Math.round(packOut);
  out.packResidual = Math.round(packIn - packOut);
  // legacy net-side fields (kept for the summary print)
  out.netProducedTotal = Math.round(sum(m.cleanNet) + sum(m.specNet) + out.villHauledNetTotal + out.cookGainTotal);
  out.netUsesTotal = Math.round(out.eatenTotal + out.rotPackTotal + out.rotStashTotal + out.rotPantryTotal +
    out.successionNet + out.donatedTotal + out.leftoverTotal + cookLossPos + sum(m.pemmicanIn || {}));
  out.netResidual = Math.round(out.netProducedTotal - out.netUsesTotal);
  // coverage: 1 - |gross unattributed| / killed (the pipeline attribution)
  out.coverage = out.killedTotal > 0
    ? +((1 - (Math.abs(out.grossUnattributed) / out.killedTotal)).toFixed(3))
    : 0;
  // villager-eaten: pantry-pool residual (donations + villager haul in;
  // rot + policy withdrawals + pantry leftover out).
  try {
    let leftoverPantry = 0;
    for (const k of Object.keys(out.leftoverState || {}))
      for (const sk of Object.keys(out.leftoverState[k]))
        if (/@pantry$/.test(sk)) leftoverPantry += out.leftoverState[k][sk];
    out.leftoverPantryTotal = Math.round(leftoverPantry);
    out.villagerEatenTotal = Math.round(
      out.donatedTotal + out.villHauledNetTotal - out.rotPantryTotal - out.withdrawTotal - leftoverPantry);
  } catch (e) { out.villagerEatenTotal = 0; out.leftoverPantryTotal = 0; }
  if (result) {
    out.days = result.days;
    out.endReason = result.endReason;
  }
  return out;
}

module.exports = { attachInstruments, finalize };
