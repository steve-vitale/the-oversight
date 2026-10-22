#!/usr/bin/env node
// armorsink-ledger-20261022.js — worn-armor mortality-sink ledger instrument
// (flesh-out loop arm sim-armorsink-r2, run fleshout-20261022T0415Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAG: zero src/js changes, zero scripts/policies changes.
// Every hook is a call-through wrapper that records and delegates; the only
// engine reads with any history of side effects are avoided (no
// villageStandingTotal — defer5 is read via standingDeferral(5), whose
// waveCombatReadiness path was audited read-only). DET parity (instrument-on
// vs instrument-off byte-identical) is pinned by
// scripts/test-armorsink-r2-20261022.js E2 and re-verified per config by the
// sweep's dayHash traces.
//
// WHAT IT MEASURES (the number-set for the corpse-stripping steve-call —
// measured here, NEVER designed or implemented here):
//   (a) P>=15 armor PRODUCTION — tele hooks: craft (scholar crafts),
//       loot_dropped (monster loot), broadcast_item_prize (contest/show
//       prizes). Day-0/1 endowment is attributed to generation.
//   (b) fighter-mortality SINK — Game.registerDeath wrapper: snapshots the
//       bearer's WORN P>=15 armor before the engine processes the death,
//       then checks the corpse's death pack after. Villager deaths route
//       through corpses.js generatePossessions (items/stashed ONLY — worn
//       gear is NOT transferred: the sink). Scholar deaths route through
//       ledger.js playerDeath (worn+carried ride the pack: recoverable).
//       Tracked corpses are followed daily: looted (tele loot_taken),
//       buried (pack goes into the ground — grave goods), decayed/gone.
//   (c) defer5 re-binds involving armor — daily standingDeferral(5) trace;
//       a re-bind = deferred false->true after a previous bind->release
//       cycle; armor-involved = 'armor' in the readiness short list.
// COMPLETENESS: a daily universe census (scholar inv+equipped, every live
// villager's items+stashed+equipped, every corpse pack) reconciles against
// hooked production/sink events. Any delta without a hooked cause lands in
// `unexplained` — the DIAG-GO bar is 0 unexplained events across the corpus.
//
// Exports: install(Game, C), dailySample(Game, C), finalize(Game, C),
// freshLedger(), detectRebinds(trace), reconcileCounts(prev, cur,
// prodToday, sinkToday), wornArmorPieces(Game, personLike, defs),
// armorDefsOf(Game).
'use strict';

const P_LINE = 15; // the ledger's armor line: protection >= 15

function freshLedger() {
  return {
    deaths: [],        // {day, vid, name, isScholar, kind, cause, vanished:[], packed:[]}
    production: [],    // {day, how, who, itemId, name, P, to}
    wear: [],          // {day, vid|scholar, itemId, name, P, via}
    sinkEvents: [],    // {day, kind, itemId, name, P, vid, corpseId}
    returnEvents: [],  // {day, kind, itemId, name, P, corpseId}
    corpseTracks: {},  // corpseId -> {vid, dayDied, packArmor:[{itemId,P}], buried, gone, finalized}
    defer5: [],        // {d, deferred, grandfathered, armored, armed, tricks, veterans, short, capped, raw}
    rebinds: [],       // computed in finalize
    dailyTotals: [],   // {d, total}
    unexplained: [],   // {day, kind:'production'|'sink', itemId, delta, hooked}
    sayRing: [],       // last 400 {d, text}
    hashes: [],        // dayHash trace (sweep writes; bare mode too)
    instrumentErrors: [],
  };
}

function err(C, where, e) {
  try { C.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

// armorDefsOf(Game): id -> {name, P} for every P>=15 armor def. Cached per Game.
function armorDefsOf(Game) {
  if (Game.__asLedgerDefs) return Game.__asLedgerDefs;
  const defs = {};
  try {
    for (const d of ((Game.data || {}).items || [])) {
      if (d && d.id && d.armor && (d.armor.protection | 0) >= P_LINE) {
        defs[d.id] = { name: d.name || d.id, P: d.armor.protection | 0 };
      }
    }
  } catch (e) {}
  try { Game.__asLedgerDefs = defs; } catch (e) {}
  return defs;
}

function itemIdOf(it) {
  if (!it) return null;
  if (typeof it === 'string') return it;
  return it.itemId || it.id || null;
}

// wornArmorPieces(Game, personLike, defs): P>=15 armor pieces in .equipped.
function wornArmorPieces(Game, personLike, defs) {
  const out = [];
  try {
    const eq = (personLike && personLike.equipped) || {};
    for (const slot of Object.keys(eq)) {
      const e = eq[slot];
      const id = itemIdOf(e);
      const def = id && defs[id];
      if (def) out.push({ itemId: id, name: (e && e.name) || def.name, P: def.P, slot });
    }
  } catch (e) {}
  return out;
}

function packArmorMap(corpse, defs) {
  const m = {};
  try {
    for (const it of ((corpse && corpse.items) || [])) {
      const id = itemIdOf(it);
      if (id && defs[id]) m[id] = (m[id] || 0) + ((it && it.units) == null ? 1 : (it.units | 0));
    }
  } catch (e) {}
  return m;
}

function personName(Game, vid, person) {
  try { if (person && person.name) return String(person.name).split(' ')[0]; } catch (e) {}
  try { if (Game.displayName) { const n = Game.displayName(vid); if (n) return String(n).split(' ')[0]; } } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

// censusByVid(Game, defs): P>=15 armor per holder. Keys: 'scholar', vid,
// 'corpse:<id>'. Villager equipped is a view over items (not counted twice).
function censusByVid(Game, defs) {
  const out = {};
  const add = (key, bag) => {
    try {
      for (const it of (bag || [])) {
        const id = itemIdOf(it);
        if (id && defs[id]) {
          out[key] = out[key] || {};
          out[key][id] = (out[key][id] | 0) + ((it && it.units) == null ? 1 : (it.units | 0));
        }
      }
    } catch (e) {}
  };
  try {
    const s = (Game.state || {}).scholar || {};
    add('scholar', s.inventory);
    add('scholar', Object.values(s.equipped || {}));
    const roster = (((Game.state || {}).village || {}).roster) || [];
    for (const vid of roster) {
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
      if (!p || p.dead) continue;
      add(vid, p.items); add(vid, p.stashed);
    }
    const corpses = (typeof Game.corpses === 'function') ? Game.corpses() : [];
    for (const c of corpses) { try { if (c && c.id) add('corpse:' + c.id, c.items); } catch (e) {} }
  } catch (e) {}
  return out;
}

// universeCount(Game, defs): totals across censusByVid.
function universeCount(Game, defs) {
  const counts = {};
  const byVid = censusByVid(Game, defs);
  for (const k of Object.keys(byVid)) for (const id of Object.keys(byVid[k])) {
    counts[id] = (counts[id] | 0) + (byVid[k][id] | 0);
  }
  return counts;
}

function totalOf(counts) {
  let t = 0;
  for (const k of Object.keys(counts)) t += counts[k] | 0;
  return t;
}

// reconcileCounts(prev, cur, prodToday, sinkToday): PURE. Deltas with no
// hooked cause are unexplained. prodToday/sinkToday: [{itemId, units}].
function reconcileCounts(prev, cur, prodToday, sinkToday) {
  const unexplainedProd = [], unexplainedSink = [];
  const hooked = (list, id) => list.reduce((t, e) => t + ((e.itemId === id) ? ((e.units | 0) || 1) : 0), 0);
  const ids = new Set([...Object.keys(prev || {}), ...Object.keys(cur || {})]);
  for (const id of ids) {
    const d = ((cur || {})[id] | 0) - ((prev || {})[id] | 0);
    if (d > 0) {
      const h = hooked(prodToday, id);
      if (d > h) unexplainedProd.push({ itemId: id, delta: d, hooked: h, unaccounted: d - h });
    } else if (d < 0) {
      const h = hooked(sinkToday, id);
      if (-d > h) unexplainedSink.push({ itemId: id, delta: -d, hooked: h, unaccounted: -d - h });
    }
  }
  return { unexplainedProd, unexplainedSink };
}

// detectRebinds(trace): PURE. trace: [{d, deferred, short[]}].
// bind = false->true transition; rebind = a bind after a bind->release cycle.
function detectRebinds(trace) {
  const binds = [];
  let prev = null, everBound = false, released = false;
  for (const t of trace) {
    if (prev != null && !prev.deferred && t.deferred) {
      binds.push({
        bindDay: t.d,
        rebind: everBound && released,
        armorInvolved: (t.short || []).includes('armor'),
        short: (t.short || []).slice(),
        armored: t.armored, veterans: t.veterans,
      });
      everBound = true; released = false;
    } else if (prev != null && prev.deferred && !t.deferred) {
      released = true;
    }
    prev = t;
  }
  return binds;
}

function defer5Sample(Game) {
  const t = { d: gday(Game) };
  try {
    const d = Game.standingDeferral(5);
    t.deferred = !!d.deferred;
    t.grandfathered = !!d.grandfathered;
    const b = d.bars || {};
    t.armored = b.armored | 0; t.armed = b.armed | 0; t.tricks = b.tricks | 0; t.veterans = b.veterans | 0;
    t.short = Array.isArray(b.short) ? b.short.slice() : [];
    t.capped = d.capped | 0; t.raw = d.raw | 0;
  } catch (e) { t.error = 1; }
  return t;
}

// install(Game, C): wraps registerDeath, tele, say. Call-through; read-only.
function install(Game, C) {
  if (Game.__asLedgerInstalled) { err(C, 'install', new Error('double install')); return () => {}; }
  Game.__asLedgerInstalled = true;
  const defs = armorDefsOf(Game);
  const orig = {};
  try { orig.registerDeath = Game.registerDeath.bind(Game); } catch (e) { err(C, 'install.registerDeath', e); }
  try { orig.playerDeath = Game.playerDeath.bind(Game); } catch (e) { err(C, 'install.playerDeath', e); }
  try { orig.apGrantItem = Game.apGrantItem.bind(Game); } catch (e) { err(C, 'install.apGrantItem', e); }
  try { orig.tele = Game.tele.bind(Game); } catch (e) { err(C, 'install.tele', e); }
  try { orig.say = Game.say.bind(Game); } catch (e) { err(C, 'install.say', e); }

  // ---- playerDeath: snapshot the scholar's worn armor BEFORE the engine
  // clears s.equipped into the death pack (ledger.js playerDeath empties
  // equipped BEFORE calling registerDeath, so the registerDeath wrapper
  // alone would see nothing worn). Stashed for the registerDeath wrapper.
  if (orig.playerDeath) {
    Game.playerDeath = function (cause) {
      try {
        const s = (Game.state || {}).scholar || {};
        C._scholarWornAtDeath = wornArmorPieces(Game, s, defs);
      } catch (e) { err(C, 'playerDeath.snapshot', e); }
      try { return orig.playerDeath.apply(this, arguments); }
      catch (e) { err(C, 'playerDeath.callthrough', e); throw e; }
    };
  }

  // ---- apGrantItem: fan care packages / alien-player gifts (alienPlayers.js).
  // Grants DIRECTLY into the scholar's inventory with NO tele event — the
  // uninstrumented production channel the pilot's reconciliation caught
  // (2x shelter_cloak, days 143/170). Call-through; record P>=15 armor.
  if (orig.apGrantItem) {
    Game.apGrantItem = function (itemId) {
      let r;
      try { r = orig.apGrantItem.apply(this, arguments); } catch (e) { throw e; }
      try {
        const def = itemId && defs[itemId];
        if (def) C.production.push({ day: gday(Game), how: 'fan-package', who: 'village-via-fans', itemId, name: def.name, P: def.P, units: 1 });
      } catch (e) { err(C, 'apGrantItem.hook', e); }
      return r;
    };
  }

  // ---- market trade (betrayal.js): the trader channel. Buys push alien
  // loot (incl. P>=15 armor) into the scholar's inventory with NO item tele
  // (only recordMarketExchange + a godpath_deed); sells splice armor OUT of
  // the scholar's inventory. Both call-through.
  try {
    const oBuy = Game.hawkerBuy ? Game.hawkerBuy.bind(Game) : null;
    if (oBuy) {
      orig.hawkerBuy = oBuy;
      Game.hawkerBuy = function (vid) {
        let wareId = null;
        try {
          const ware = (((Game.state || {}).village || {}).hawkerStock || {})[vid];
          wareId = ware && ware.itemId;
        } catch (e) {}
        let r = null;
        try { r = oBuy.apply(this, arguments); } catch (e) { throw e; }
        try {
          const def = wareId && defs[wareId];
          if (r && def) C.production.push({ day: gday(Game), how: 'market-buy', who: 'scholar', itemId: wareId, name: def.name, P: def.P, units: 1 });
        } catch (e) { err(C, 'hawkerBuy.hook', e); }
        return r;
      };
    }
  } catch (e) { err(C, 'install.hawkerBuy', e); }
  try {
    const oSell = Game.traderSell ? Game.traderSell.bind(Game) : null;
    if (oSell) {
      orig.traderSell = oSell;
      Game.traderSell = function (visId, packIdx) {
        let soldId = null;
        try {
          const it = ((Game.state || {}).scholar || {}).inventory || [];
          soldId = itemIdOf(it[packIdx]);
        } catch (e) {}
        let r = null;
        try { r = oSell.apply(this, arguments); } catch (e) { throw e; }
        try {
          const def = soldId && defs[soldId];
          if (r && def) C.sinkEvents.push({ day: gday(Game), kind: 'market-sell', itemId: soldId, name: def.name, P: def.P, vid: Game.villagerId, units: 1 });
        } catch (e) { err(C, 'traderSell.hook', e); }
        return r;
      };
    }
  } catch (e) { err(C, 'install.traderSell', e); }

  // ---- scholar gear-swap: Game.equip OVERWRITES s.equipped[slot] with the
  // new item and splices it from inventory — the old worn item is NEVER
  // returned to inventory (the "unequip current (back to inventory)" comment
  // has no code). Displaced P>=15 armor VANISHES. Call-through; classify.
  try {
    const oEquip = Game.equip ? Game.equip.bind(Game) : null;
    if (oEquip) {
      orig.equip = oEquip;
      Game.equip = function (itemIdx, slot) {
        let oldId = null;
        try {
          const s0 = (Game.state || {}).scholar || {};
          const old = (s0.equipped || {})[slot];
          if (old) oldId = itemIdOf(old);
        } catch (e) {}
        let r = null;
        try { r = oEquip.apply(this, arguments); } catch (e) { throw e; }
        try {
          const def = oldId && defs[oldId];
          // Game.equip returns null/undefined even on success — verify the
          // swap happened by checking the slot now holds a different item.
          const s1 = (Game.state || {}).scholar || {};
          const nowId = itemIdOf((s1.equipped || {})[slot]);
          if (def && nowId && nowId !== oldId) {
            let found = false;
            for (const it of (s1.inventory || [])) if (itemIdOf(it) === oldId) { found = true; break; }
            if (!found) for (const v of Object.values(s1.equipped || {})) if (itemIdOf(v) === oldId) { found = true; break; }
            if (!found) C.sinkEvents.push({ day: gday(Game), kind: 'swap-vanished', itemId: oldId, name: def.name, P: def.P, slot: String(slot), units: 1 });
          }
        } catch (e) { err(C, 'equip.hook', e); }
        return r;
      };
    }
  } catch (e) { err(C, 'install.equip', e); }

  // ---- registerDeath: the mortality-sink choke point ----
  if (orig.registerDeath) {
    Game.registerDeath = function (opts) {
      opts = opts || {};
      let snap = null;
      try {
        const vid = opts.villagerId || null;
        const isScholar = !!(opts.player || (vid && vid === Game.villagerId));
        let personLike = null;
        let pieces = [];
        if (isScholar && C._scholarWornAtDeath) {
          // Scholar path: stashed by the playerDeath wrapper before the
          // engine cleared s.equipped into the death pack.
          pieces = C._scholarWornAtDeath;
          C._scholarWornAtDeath = null;
          try { personLike = (Game.state || {}).scholar || null; } catch (e) {}
        } else if (isScholar) {
          // Direct registerDeath for the scholar (no known live path —
          // every scholar death routes through playerDeath; fallback).
          try { personLike = (Game.state || {}).scholar || null; } catch (e) {}
          pieces = personLike ? wornArmorPieces(Game, personLike, defs) : [];
        } else if (vid) {
          try { personLike = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
          pieces = personLike ? wornArmorPieces(Game, personLike, defs) : [];
        }
        snap = { vid, isScholar, pieces, name: vid ? personName(Game, vid, personLike) : (opts.name || '?') };
      } catch (e) { err(C, 'snapshotWorn', e); snap = { vid: opts.villagerId || null, isScholar: false, pieces: [], name: '?' }; }
      let corpse = null;
      try { corpse = orig.registerDeath(opts); }
      catch (e) { err(C, 'registerDeath.callthrough', e); throw e; }
      try {
        // Person deaths only — monster/animal deaths carry no armor ledger.
        if (!snap.vid) return corpse;
        const day = gday(Game);
        const packMap = corpse ? packArmorMap(corpse, defs) : {};
        const vanished = [], packed = [];
        for (const pc of (snap.pieces || [])) {
          if (packMap[pc.itemId] > 0) { packed.push(pc); packMap[pc.itemId]--; }
          else vanished.push(pc);
        }
        const dev = {
          day, vid: snap.vid, name: snap.name, isScholar: snap.isScholar,
          kind: opts.kind || '?', cause: opts.cause || '?',
          vanished: vanished.map(p => ({ itemId: p.itemId, name: p.name, P: p.P })),
          packed: packed.map(p => ({ itemId: p.itemId, name: p.name, P: p.P })),
          corpseId: corpse ? corpse.id : null,
          noCorpse: !corpse,
        };
        // Sense-test material: the beats around an armor-bearing death.
        if ((snap.pieces || []).length) {
          try { dev.sayContext = C.sayRing.slice(-40).map(s => ({ d: s.d, text: s.text })); } catch (e) {}
        }
        C.deaths.push(dev);
        for (const p of vanished) {
          C.sinkEvents.push({ day, kind: 'worn-vanished', itemId: p.itemId, name: p.name, P: p.P, vid: snap.vid, name2: snap.name, isScholar: snap.isScholar, corpseId: dev.corpseId, units: 1 });
        }
        if (corpse && (packed.length || vanished.length || (snap.pieces || []).length)) {
          C.corpseTracks[corpse.id] = {
            vid: snap.vid, name: snap.name, isScholar: snap.isScholar,
            dayDied: day, cause: opts.cause || '?',
            packArmor: packed.map(p => ({ itemId: p.itemId, name: p.name, P: p.P, looted: false })),
            buried: false, gone: false, finalized: false,
          };
        }
      } catch (e) { err(C, 'classifyDeath', e); }
      return corpse;
    };
  }

  // ---- tele: production + return-channel events ----
  if (orig.tele) {
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        const day = gday(Game);
        data = data || {};
        const armorOf = (id) => (id && defs[id]) ? { itemId: id, name: defs[id].name, P: defs[id].P } : null;
        if (type === 'craft') {
          const a = armorOf(data.id);
          if (a) C.production.push({ day, how: 'craft', who: 'scholar', itemId: a.itemId, name: data.name || a.name, P: a.P, units: 1 });
        } else if (type === 'loot_dropped') {
          const a = armorOf(data.id);
          if (a) C.production.push({ day, how: 'monster-loot', who: 'village-via-combat', itemId: a.itemId, name: a.name, P: a.P, to: data.to || '?', units: 1 });
        } else if (type === 'broadcast_item_prize') {
          const a = armorOf(data.id);
          if (a) C.production.push({ day, how: data.contest ? 'contest-prize' : 'show-prize', who: data.who || '?', itemId: a.itemId, name: a.name, P: a.P, tier: data.tier, units: 1 });
        } else if (type === 'loot_taken') {
          const a = armorOf(data.id);
          if (a) C.returnEvents.push({ day, kind: 'corpse-loot', itemId: a.itemId, name: a.name, P: a.P, alien: !!data.alien });
        } else if (type === 'villager_gear') {
          const a = armorOf(data.item);
          if (a) C.wear.push({ day, vid: data.vid || '?', itemId: a.itemId, name: a.name, P: a.P, via: data.via || '?' });
        }
      } catch (e) { err(C, 'tele.hook', e); }
      return r;
    };
  }

  // ---- say: ring buffer for the sense read (read-only capture) ----
  if (orig.say) {
    Game.say = function (msg) {
      try {
        if (typeof msg === 'string' && msg) {
          C.sayRing.push({ d: gday(Game), text: msg.slice(0, 300) });
          if (C.sayRing.length > 400) C.sayRing.splice(0, C.sayRing.length - 400);
        }
      } catch (e) {}
      return orig.say.apply(this, arguments);
    };
  }

  return function uninstall() {
    try {
      if (orig.registerDeath) Game.registerDeath = orig.registerDeath;
      if (orig.playerDeath) Game.playerDeath = orig.playerDeath;
      if (orig.apGrantItem) Game.apGrantItem = orig.apGrantItem;
      if (orig.hawkerBuy) Game.hawkerBuy = orig.hawkerBuy;
      if (orig.traderSell) Game.traderSell = orig.traderSell;
      if (orig.equip) Game.equip = orig.equip;
      if (orig.tele) Game.tele = orig.tele;
      if (orig.say) Game.say = orig.say;
      Game.__asLedgerInstalled = false;
    } catch (e) {}
  };
}

// updateCorpseTracks(Game, C, day): follow tracked corpses — looted pieces
// (via loot_taken return events), burial (grave goods), disappearance.
function updateCorpseTracks(Game, C, day) {
  let corpses = [];
  try { corpses = (typeof Game.corpses === 'function') ? Game.corpses() : []; } catch (e) { err(C, 'corpseList', e); return; }
  const byId = {};
  for (const c of corpses) { try { if (c && c.id) byId[c.id] = c; } catch (e) {} }
  const defs = armorDefsOf(Game);
  for (const cid of Object.keys(C.corpseTracks)) {
    const tr = C.corpseTracks[cid];
    if (tr.finalized) continue;
    const c = byId[cid];
    if (!c) {
      tr.gone = true;
      for (const p of tr.packArmor) {
        if (!p.looted) C.sinkEvents.push({ day, kind: 'pack-decayed', itemId: p.itemId, name: p.name, P: p.P, vid: tr.vid, corpseId: cid, units: 1 });
      }
      tr.finalized = true;
      continue;
    }
    if (c.buried && !tr.buried) {
      tr.buried = true;
      const still = packArmorMap(c, defs);
      for (const p of tr.packArmor) {
        if (!p.looted && (still[p.itemId] | 0) > 0) {
          C.sinkEvents.push({ day, kind: 'pack-buried', itemId: p.itemId, name: p.name, P: p.P, vid: tr.vid, corpseId: cid, units: 1 });
          p.sunk = true;
        }
      }
    }
    // looted pieces: correlate returnEvents (corpse-loot) with pack armor.
    const packMap = packArmorMap(c, defs);
    for (const p of tr.packArmor) {
      if (p.looted || p.sunk) continue;
      if ((packMap[p.itemId] | 0) <= 0) {
        const ret = C.returnEvents.find(r => r.kind === 'corpse-loot' && r.itemId === p.itemId && r.day >= tr.dayDied && !r._claimed);
        if (ret) { ret._claimed = true; ret.corpseId = cid; p.looted = true; }
        else {
          // piece left the pack through no hooked channel — unexplained.
          C.unexplained.push({ day, kind: 'sink', itemId: p.itemId, delta: 1, hooked: 0, note: 'pack piece left with no loot_taken event' });
          p.looted = true; p.unexplained = true;
        }
      }
    }
  }
}

// dailySample(Game, C): call once per game day AFTER the policy's daily.
function dailySample(Game, C) {
  const day = gday(Game);
  const defs = armorDefsOf(Game);
  try { C.defer5.push(defer5Sample(Game)); } catch (e) { err(C, 'defer5', e); }
  try { updateCorpseTracks(Game, C, day); } catch (e) { err(C, 'corpseTracks', e); }
  try {
    // Roster joins/leaves: alien players, visitors, etc. join with their
    // kit and leave with it — armor entering/leaving the village economy
    // outside death. Deaths are excluded (handled by the death ledger).
    const roster = new Set((((Game.state || {}).village || {}).roster) || []);
    if (C._prevRoster) {
      const deadVids = new Set((C.deaths || []).map(d => d.vid));
      for (const vid of roster) {
        if (!C._prevRoster.has(vid)) {
          let p = null;
          try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
          if (p && !p.dead) {
            const pieces = wornArmorPieces(Game, { equipped: p.equipped }, defs);
            // count all P>=15 in items+stashed (equipped is a view)
            const bag = {};
            const addBag = (b) => { for (const it of (b || [])) { const id = itemIdOf(it); if (id && defs[id]) bag[id] = (bag[id] | 0) + 1; } };
            addBag(p.items); addBag(p.stashed);
            for (const id of Object.keys(bag)) {
              C.production.push({ day, how: 'joined-with', who: String(vid).slice(0, 20), itemId: id, name: defs[id].name, P: defs[id].P, units: bag[id] });
            }
          }
        }
      }
      for (const vid of C._prevRoster) {
        if (!roster.has(vid) && !deadVids.has(vid)) {
          // Departed without dying — attribute their last-seen kit as a sink.
          const last = (C._prevByVid || {})[vid] || {};
          for (const id of Object.keys(last)) {
            C.sinkEvents.push({ day, kind: 'departed-with', itemId: id, name: (defs[id] || {}).name || id, P: (defs[id] || {}).P || 0, vid: String(vid).slice(0, 20), units: last[id] | 0 });
          }
          C.departures = C.departures || [];
          C.departures.push({ day, vid: String(vid).slice(0, 20) });
        }
      }
    }
    C._prevRoster = roster;
  } catch (e) { err(C, 'rosterTrack', e); }
  try {
    // scholar re-wear detection (villager wear comes via tele villager_gear).
    const s = (Game.state || {}).scholar || {};
    const wornNow = wornArmorPieces(Game, s, defs).map(p => p.itemId).sort().join(',');
    if (C._scholarWornKey !== undefined && C._scholarWornKey !== wornNow) {
      const before = new Set((C._scholarWornKey || '').split(',').filter(Boolean));
      for (const p of wornArmorPieces(Game, s, defs)) {
        if (!before.has(p.itemId)) C.wear.push({ day, vid: 'scholar', itemId: p.itemId, name: p.name, P: p.P, via: 'scholar-rewear' });
      }
    }
    C._scholarWornKey = wornNow;
  } catch (e) { err(C, 'scholarWear', e); }
  try {
    const byVid = censusByVid(Game, defs);
    const cur = {};
    for (const k of Object.keys(byVid)) for (const id of Object.keys(byVid[k])) {
      cur[id] = (cur[id] | 0) + (byVid[k][id] | 0);
    }
    C.dailyTotals.push({ d: day, total: totalOf(cur), byItem: cur });
    if (C._prevCounts) {
      const prodToday = C.production.filter(e => e.day === day);
      const sinkToday = C.sinkEvents.filter(e => e.day === day);
      const { unexplainedProd, unexplainedSink } = reconcileCounts(C._prevCounts, cur, prodToday, sinkToday);
      for (const u of unexplainedProd) C.unexplained.push({ day, kind: 'production', ...u });
      for (const u of unexplainedSink) C.unexplained.push({ day, kind: 'sink', ...u });
    } else {
      // First sample ever: the opening endowment, attributed to generation.
      for (const id of Object.keys(cur)) {
        if ((cur[id] | 0) > 0) C.production.push({ day, how: 'endowment', who: 'generation', itemId: id, name: (defs[id] || {}).name || id, P: (defs[id] || {}).P || 0, units: cur[id] | 0 });
      }
    }
    C._prevCounts = cur;
    C._prevByVid = byVid;
  } catch (e) { err(C, 'reconcile', e); }
}

// finalize(Game, C): end-of-run — finalize corpse fates, rebinds.
function finalize(Game, C) {
  const day = gday(Game);
  try { updateCorpseTracks(Game, C, day); } catch (e) { err(C, 'finalize.tracks', e); }
  try {
    for (const cid of Object.keys(C.corpseTracks)) {
      const tr = C.corpseTracks[cid];
      if (tr.finalized) continue;
      tr.finalized = true;
      tr.endState = tr.buried ? 'buried' : (tr.gone ? 'gone' : 'exists');
    }
  } catch (e) { err(C, 'finalize.states', e); }
  try { C.rebinds = detectRebinds(C.defer5); } catch (e) { err(C, 'finalize.rebinds', e); }
  try {
    // returned = looted pieces; re-worn subset.
    const s = (Game.state || {}).scholar || {};
    const defs = armorDefsOf(Game);
    const scholarWorn = new Set(wornArmorPieces(Game, s, defs).map(p => p.itemId));
    let returned = 0, reworn = 0;
    for (const cid of Object.keys(C.corpseTracks)) {
      for (const p of C.corpseTracks[cid].packArmor) {
        if (p.looted && !p.unexplained) { returned++; if (scholarWorn.has(p.itemId)) reworn++; }
      }
    }
    C.summary = {
      deaths: C.deaths.length,
      deathsWithArmor: C.deaths.filter(d => d.vanished.length || d.packed.length).length,
      vanishedPieces: C.sinkEvents.filter(e => e.kind === 'worn-vanished').length,
      buriedPieces: C.sinkEvents.filter(e => e.kind === 'pack-buried').length,
      decayedPieces: C.sinkEvents.filter(e => e.kind === 'pack-decayed').length,
      producedPieces: C.production.reduce((t, e) => t + ((e.units | 0) || 1), 0),
      returnedPieces: returned,
      rewornPieces: reworn,
      rebinds: C.rebinds.length,
      rebindsArmor: C.rebinds.filter(r => r.armorInvolved).length,
      unexplained: C.unexplained.length,
      instrumentErrors: C.instrumentErrors.length,
    };
  } catch (e) { err(C, 'finalize.summary', e); }
}

module.exports = {
  P_LINE, freshLedger, install, dailySample, finalize, updateCorpseTracks,
  detectRebinds, reconcileCounts, wornArmorPieces, armorDefsOf, universeCount,
  defer5Sample, censusByVid,
};
