#!/usr/bin/env node
// armorsink-ledger-r3-20261022.js — r3 extension of the r2 armor ledger
// (flesh-out loop arm sim-armorsink-r3, run fleshout-20261022T0415Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAG: zero src/js changes, zero scripts/policies changes.
// EXTENDS the r2 module (require('./armorsink-ledger-20261022')) — never
// duplicates it. installR3() is called AFTER R2.install(); its Game.tele
// wrapper sits OUTSIDE r2's wrapper (both call through).
//
// WHY r3 EXISTS (r2 DIAG-NO-GO, 6 unexplained events):
// Forensic re-read of the r2 corpus showed three distinct attribution
// gaps, NOT an unhooked villager-generation channel:
//   G1. DAY-BOUNDARY: hooked production/sink events are labeled with the
//       hook-time scholar.day, but the census sample that observes them
//       can land a day later (missing/duplicate samples — e.g. s65422 has
//       no day-144 sample, two day-145 samples). r2 reconciles only
//       same-day hooks -> next-day deltas land unexplained.
//   G2. PRIZE DOUBLE-FIRE: alienLootGrant() fires loot_dropped, then the
//       contest/show path fires broadcast_item_prize for the SAME grant.
//       r2 records monster-loot + contest-prize (or fan-package +
//       show-prize) for ONE item — the hooked count over-states production
//       2x on every prize.
//   G3. HOLDER BLINDNESS: r2 reconciles UNIVERSE totals only. A delta with
//       no same-day hook names no holder, so the analyst can't tell a
//       donor->recipient gift from a materialization.
// r3 closes all three:
//   - carry-forward attribution: unmatched hooks persist; a day-d delta
//     matches hooks from day d AND d-1 (consumed once, recorded).
//   - shadow-dedup: the grant's loot_dropped is marked shadowOf when a
//     broadcast_item_prize for the same item fires in the same tick —
//     excluded from hooked-production counts (kept in the raw list).
//   - per-holder deltas: every unexplained event carries the holders whose
//     counts changed for that item.
//   - generation-path hooks: Game.genItemCandidates + Game.choosePersonalFive
//     wrapped (call-through) — every P>=15 armor id passing through the
//     villager factory is recorded (canon: genItemCandidates caps at
//     lootTier<=2 non-alien, so the factory CANNOT mint high-tier armor;
//     the hook proves it per run instead of asserting it).
//   - form audit: daily check that every villager's P>=15 equipped entry is
//     backed by items/stashed (the string<->object form-conversion path the
//     r2 metric review hypothesized).
//   - villager_gear transfers recorded with `from` (r2 recorded wear only).
//
// Exports: installR3(Game, C), dailySampleR3(Game, C), finalizeR3(Game, C),
// freshLedgerR3(), plus re-exports of the r2 surface used by the sweep.
'use strict';

const R2 = require('./armorsink-ledger-20261022');

const P_LINE = R2.P_LINE;

function freshLedgerR3() {
  const C = R2.freshLedger();
  C.r3transfers = [];      // {day, vid, from, itemId, name, P, via}
  C.r3attributed = [];     // resolved-by-r3: {day, kind, itemId, delta, via, hookDay, hookHow, holders}
  C.r3holderDeltas = {};   // day -> itemId -> {holder: delta}
  C.r3genArmor = [];       // {day, where, itemId, P, form}
  C.r3formAnomalies = [];  // {day, vid, itemId, slot, note}
  C.r3samplesPerDay = {};  // day -> sample count (missing/duplicate detector)
  C._r3consumed = [];      // 'p<idx>' / 's<idx>' consumed by attribution
  C._r3prevByVid = null;
  C._r3pendingHooks = [];  // hooked events never consumed by a delta (over-counts)
  return C;
}

function err(C, where, e) {
  try { C.instrumentErrors.push('r3:' + where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

function itemIdOf(it) {
  if (!it) return null;
  if (typeof it === 'string') return it;
  return it.itemId || it.id || null;
}

function consumed(C, tag) { return C._r3consumed.indexOf(tag) >= 0; }
function consume(C, tag) { if (!consumed(C, tag)) C._r3consumed.push(tag); }

// installR3(Game, C): call AFTER R2.install(Game, C). Wraps Game.tele
// (outer), Game.genItemCandidates, Game.choosePersonalFive. Call-through.
function installR3(Game, C) {
  if (Game.__asLedgerR3Installed) { err(C, 'install', new Error('double install')); return () => {}; }
  Game.__asLedgerR3Installed = true;
  const defs = R2.armorDefsOf(Game);
  const orig = {};
  try { orig.tele = Game.tele.bind(Game); } catch (e) { err(C, 'install.tele', e); }
  try { orig.genItemCandidates = Game.genItemCandidates ? Game.genItemCandidates.bind(Game) : null; } catch (e) { err(C, 'install.gen', e); }
  try { orig.choosePersonalFive = Game.choosePersonalFive ? Game.choosePersonalFive.bind(Game) : null; } catch (e) { err(C, 'install.choose', e); }

  // ---- tele (outer wrapper): transfers + prize shadow-dedup ----
  if (orig.tele) {
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        const day = gday(Game);
        data = data || {};
        if (type === 'villager_gear') {
          const id = data.item;
          const def = id && defs[id];
          if (def) C.r3transfers.push({
            day, vid: data.vid || '?', from: data.from || null,
            itemId: id, name: def.name, P: def.P, via: data.via || '?',
          });
        } else if (type === 'broadcast_item_prize') {
          // G2: the grant's loot_dropped fired in the same tick, immediately
          // before this tele (alienLootGrant always teles loot_dropped, and
          // r2's inner tele wrapper recorded it as the entry just before
          // this prize entry). Mark the GRANT's hook as shadow so the
          // hooked-production count reflects ONE grant, not two. Only when
          // the two trailing entries are exactly the prize pair — a real
          // same-day monster drop of the same item is never the immediate
          // predecessor of the prize tele.
          const id = data.id;
          const pl = C.production;
          if (id && pl.length >= 2) {
            const prize = pl[pl.length - 1];
            const grant = pl[pl.length - 2];
            const prizeHow = prize && (prize.how === 'contest-prize' || prize.how === 'show-prize');
            const grantHow = grant && (grant.how === 'monster-loot' || grant.how === 'fan-package');
            if (prizeHow && grantHow && prize.itemId === id && grant.itemId === id &&
                prize.day === day && grant.day === day &&
                !grant.shadowOf && !consumed(C, 'p' + (pl.length - 2))) {
              grant.shadowOf = 'broadcast_item_prize';
            }
          }
        }
      } catch (e) { err(C, 'tele.hook', e); }
      return r;
    };
  }

  // ---- genItemCandidates: the villager factory's item pool ----
  if (orig.genItemCandidates) {
    Game.genItemCandidates = function (occ, char) {
      let pool;
      try { pool = orig.genItemCandidates.apply(this, arguments); } catch (e) { throw e; }
      try {
        for (const id of (pool || [])) {
          const def = id && defs[id];
          if (def) C.r3genArmor.push({ day: gday(Game), where: 'genItemCandidates', itemId: id, name: def.name, P: def.P, form: 'pool-id' });
        }
      } catch (e) { err(C, 'genItemCandidates.hook', e); }
      return pool;
    };
  }

  // ---- choosePersonalFive: pool -> items (kept 5) + stashed (rest) ----
  if (orig.choosePersonalFive) {
    Game.choosePersonalFive = function (ch, pool) {
      let r;
      try { r = orig.choosePersonalFive.apply(this, arguments); } catch (e) { throw e; }
      try {
        const day = gday(Game);
        for (const it of ((ch && ch.items) || [])) {
          const id = itemIdOf(it); const def = id && defs[id];
          if (def) C.r3genArmor.push({ day, where: 'choosePersonalFive', itemId: id, name: def.name, P: def.P, form: 'items' });
        }
        for (const it of ((ch && ch.stashed) || [])) {
          const id = itemIdOf(it); const def = id && defs[id];
          if (def) C.r3genArmor.push({ day, where: 'choosePersonalFive', itemId: id, name: def.name, P: def.P, form: 'stashed' });
        }
      } catch (e) { err(C, 'choosePersonalFive.hook', e); }
      return r;
    };
  }

  return function uninstallR3() {
    try {
      if (orig.tele) Game.tele = orig.tele;
      if (orig.genItemCandidates) Game.genItemCandidates = orig.genItemCandidates;
      if (orig.choosePersonalFive) Game.choosePersonalFive = orig.choosePersonalFive;
      Game.__asLedgerR3Installed = false;
    } catch (e) {}
  };
}

// holderDelta(prevByVid, curByVid, itemId): {holder: delta} for holders
// whose count of itemId changed.
function holderDelta(prevByVid, curByVid, itemId) {
  const out = {};
  const holders = new Set([...Object.keys(prevByVid || {}), ...Object.keys(curByVid || {})]);
  for (const h of holders) {
    const a = ((prevByVid || {})[h] || {})[itemId] | 0;
    const b = ((curByVid || {})[h] || {})[itemId] | 0;
    if (b !== a) out[h] = b - a;
  }
  return out;
}

// hookedCounts(C, day): production/sink hook units for a day, EXCLUDING
// shadow-deduped and consumed entries. Returns {prod: {id: n}, sink: {id: n}}.
function hookedCounts(C, day) {
  const prod = {}, sink = {};
  C.production.forEach((e, i) => {
    if (e.day !== day || e.shadowOf || consumed(C, 'p' + i)) return;
    prod[e.itemId] = (prod[e.itemId] | 0) + ((e.units | 0) || 1);
  });
  C.sinkEvents.forEach((e, i) => {
    if (e.day !== day || consumed(C, 's' + i)) return;
    sink[e.itemId] = (sink[e.itemId] | 0) + ((e.units | 0) || 1);
  });
  return { prod, sink };
}

// dailySampleR3(Game, C): r2 sample + the r3 attribution pass.
//
// The r3 pass REPLACES r2's reconcile verdict for universe deltas with a
// stricter one: hooked counts EXCLUDE shadow-deduped grants, and unmatched
// hooks carry forward one day (the missing/duplicate-sample window).
// r2's corpse-track unexplained entries (carrying `note`) are kept as-is.
function dailySampleR3(Game, C) {
  const day = gday(Game);
  try { C.r3samplesPerDay[day] = (C.r3samplesPerDay[day] | 0) + 1; } catch (e) {}
  const prevCounts = C._r3prevCounts || null;
  const prevByVid = C._r3prevByVid || null;
  const unexplBefore = C.unexplained.length;
  try { R2.dailySample(Game, C); } catch (e) { err(C, 'dailySample.r2', e); return; }
  const defs = R2.armorDefsOf(Game);
  let curByVid = null;
  try { curByVid = R2.censusByVid(Game, defs); } catch (e) { err(C, 'census', e); }

  // Drop r2's fresh reconcile entries (no `note`); keep corpse-track ones.
  let freshNotes = [];
  try {
    const fresh = C.unexplained.splice(unexplBefore);
    freshNotes = fresh.filter(u => u && u.note);
    C.unexplained.push(...freshNotes);
  } catch (e) { err(C, 'unexplained.reset', e); }

  // r3 independent reconciliation (shadow-excluded, carry-forward d-1).
  try {
    if (prevCounts && curByVid) {
      const cur = {};
      for (const k of Object.keys(curByVid)) for (const id of Object.keys(curByVid[k])) {
        cur[id] = (cur[id] | 0) + (curByVid[k][id] | 0);
      }
      const ids = new Set([...Object.keys(prevCounts || {}), ...Object.keys(cur || {})]);
      for (const id of ids) {
        const d = (cur[id] | 0) - (prevCounts[id] | 0);
        if (d === 0) continue;
        const isProd = d > 0;
        const need = Math.abs(d);
        // Candidate hooks: same-day first, then day-1 (the missing/
        // duplicate-sample window). Shadow-deduped and consumed hooks
        // never count.
        const cands = [];
        const raw = isProd ? C.production : C.sinkEvents;
        const pfx = isProd ? 'p' : 's';
        for (const wantDay of [day, day - 1]) {
          for (let i = raw.length - 1; i >= 0; i--) {
            const e = raw[i];
            if (e.day !== wantDay || e.itemId !== id) continue;
            if (e.shadowOf || consumed(C, pfx + i)) continue;
            cands.push({ e, tag: pfx + i, day: wantDay });
          }
        }
        let matched = 0;
        const usedHooks = [];
        for (const c of cands) {
          if (matched >= need) break;
          const u = (c.e.units | 0) || 1;
          matched += u;
          usedHooks.push({ day: c.day, how: c.e.how || c.e.kind });
          consume(C, c.tag);
        }
        const hd = holderDelta(prevByVid, curByVid, id);
        try {
          C.r3holderDeltas[day] = C.r3holderDeltas[day] || {};
          C.r3holderDeltas[day][id] = hd;
        } catch (e) {}
        if (matched >= need) {
          const anySameDay = usedHooks.some(h => h.day === day);
          C.r3attributed.push({
            day, kind: isProd ? 'production' : 'sink', itemId: id, delta: need,
            via: anySameDay ? 'hook-same-day' : 'hook-carryforward-d-1',
            hooks: usedHooks, holders: hd, r3: true,
          });
        } else {
          C.unexplained.push({
            day, kind: isProd ? 'production' : 'sink', itemId: id,
            delta: need, hooked: matched, unaccounted: need - matched,
            holders: hd, r3: true,
          });
        }
      }
      try {
        C._r3prevCounts = cur;
      } catch (e) {}
    } else if (curByVid) {
      // First r3 sample: seed previous-state (r2's endowment attribution
      // already recorded the opening universe as production).
      try {
        const cur = {};
        for (const k of Object.keys(curByVid)) for (const id of Object.keys(curByVid[k])) {
          cur[id] = (cur[id] | 0) + (curByVid[k][id] | 0);
        }
        C._r3prevCounts = cur;
      } catch (e) {}
    }
  } catch (e) { err(C, 'reconcile.r3', e); }

  // G3 form audit: every villager P>=15 equipped entry must be backed by
  // items/stashed (catches string<->object form-conversion desyncs).
  try {
    const roster = (((Game.state || {}).village || {}).roster) || [];
    for (const vid of roster) {
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
      if (!p || p.dead) continue;
      const bagIds = new Set();
      for (const it of (p.items || [])) { const id = itemIdOf(it); if (id) bagIds.add(id); }
      for (const it of (p.stashed || [])) { const id = itemIdOf(it); if (id) bagIds.add(id); }
      for (const slot of Object.keys(p.equipped || {})) {
        const id = itemIdOf(p.equipped[slot]);
        const def = id && defs[id];
        if (def && !bagIds.has(id)) {
          C.r3formAnomalies.push({ day, vid: String(vid).slice(0, 20), slot: String(slot), itemId: id, name: def.name, P: def.P, note: 'equipped-not-in-items-or-stashed' });
        }
      }
    }
  } catch (e) { err(C, 'formAudit', e); }

  try { C._r3prevByVid = curByVid; } catch (e) {}
}

// finalizeR3(Game, C): r2 finalize + r3 summary.
function finalizeR3(Game, C) {
  try { R2.finalize(Game, C); } catch (e) { err(C, 'finalize.r2', e); }
  try {
    const pending = [];
    C.production.forEach((e, i) => {
      if (!e.shadowOf && !consumed(C, 'p' + i)) pending.push({ day: e.day, how: e.how, itemId: e.itemId, units: e.units | 0 || 1, shadowOf: e.shadowOf || null });
    });
    const pendingSink = [];
    C.sinkEvents.forEach((e, i) => {
      if (!consumed(C, 's' + i)) pendingSink.push({ day: e.day, kind: e.kind, itemId: e.itemId });
    });
    const shadows = C.production.filter(e => e.shadowOf).length;
    C.r3summary = {
      unexplained: C.unexplained.length,
      attributed: C.r3attributed.length,
      shadowDeduped: shadows,
      pendingProdHooks: pending.length,
      pendingSinkHooks: pendingSink.length,
      transfers: C.r3transfers.length,
      genArmorSightings: C.r3genArmor.length,
      formAnomalies: C.r3formAnomalies.length,
      instrumentErrors: C.instrumentErrors.length,
    };
    C._r3pendingHooks = pending;
    C._r3pendingSinkHooks = pendingSink;
  } catch (e) { err(C, 'finalize.summary', e); }
}

module.exports = {
  P_LINE, freshLedgerR3, installR3, dailySampleR3, finalizeR3,
  holderDelta, hookedCounts,
  // r2 surface re-exported for the sweep/analyzer's convenience
  R2,
};
