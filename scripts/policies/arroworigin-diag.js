// arroworigin-diag — per-person arrow-arrival trace for sim-arroworigin-a
// (2026-10-27, flesh-out loop, axis scale-onramp). DIAG ONLY: zero src/js
// changes, policy-side only.
//
// WHAT IT RECORDS (one daily row per run-day, BEFORE the day's actions —
// the same convention as ammostorage-diag's daily snapshot, so day 1 is
// the post-setup starting state):
// - Per person (villagers + background_survivors + rosterChars, deduped
//   by id, the same person lists ammostorage-diag uses): carried arrow
//   count + stashed arrow count. Arrow entries match by itemId OR
//   material, units summed — the volley mirror.
// - Holder detail for every person holding an arrow that day: full items
//   id list, full stashed id list, fullPool when present, equipped
//   ranged item id.
// - Scholar inventory arrow count + scholar fullPool (separate bucket:
//   the scholar's pack is state.scholar.inventory, not person.items).
// - Change events: any person whose carried/stashed arrow count moved
//   vs the previous day, with previous and current items/stashed lists,
//   a newPerson flag, and the previous day's roster presence.
// - New-person events: first roster day for a person, with fullPool +
//   items + stashed (this is what distinguishes a founder's starting
//   stash from a joiner's starting stash).
//
// OBSERVATIONAL ONLY. ARROWORIGIN=1 is the only on-switch. Unset
// delegates byte-identically: no snapshot, no ctx surface, no record.
// The recorder draws no RNG, never throws into the engine (recording
// errors are counted), never calls stashState() (a write) or
// villageStandingTotal() or unlockedWave(), and returns the inner
// policy's value untouched. It reads raw person.items / person.stashed
// only.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.ARROWORIGIN === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    dailyRows: [], changeEvents: [], newPersons: [],
    errs: 0, errors: [], overflow: { dailyRows: 0, changeEvents: 0, newPersons: 0 },
    installed: false, _prevByVid: {}, _seenVids: {},
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

function itemIdOf(ent) {
  if (!ent) return null;
  if (typeof ent === 'string') return ent;
  return ent.itemId || ent.id || null;
}
function matOf(ent) {
  if (!ent || typeof ent !== 'object') return null;
  return ent.material || null;
}
function unitsOf(ent) {
  if (!ent) return 0;
  if (typeof ent === 'string') return 1;
  return (ent.units || 1);
}
function arrowCountOf(list) {
  let n = 0;
  try {
    for (const ent of (list || [])) {
      if (!ent) continue;
      if (itemIdOf(ent) === 'arrow' || matOf(ent) === 'arrow') n += unitsOf(ent);
    }
  } catch (e) { /* count defensively; a bad entry is not a game error */ }
  return n;
}
function idListOf(list) {
  const out = [];
  try {
    for (const ent of (list || [])) {
      const id = itemIdOf(ent);
      if (id) out.push(id);
    }
  } catch (e) { /* same defensive read */ }
  return out;
}
function personName(Game, p) {
  try {
    if (p.name) return p.name;
    if (typeof Game.firstRef === 'function') return Game.firstRef(p.id) || p.id;
  } catch (e) { /* fall through to id */ }
  return p.id;
}
function allPersons(Game) {
  const out = [], seen = {};
  try {
    const push = (p) => {
      if (!p || !p.id || seen[p.id]) return;
      seen[p.id] = true; out.push(p);
    };
    if (Game.data && Array.isArray(Game.data.villagers)) for (const p of Game.data.villagers) push(p);
    if (Game.data && Array.isArray(Game.data.background_survivors)) for (const p of Game.data.background_survivors) push(p);
    const rc = ((Game.state || {}).village || {}).rosterChars;
    if (rc && typeof rc === 'object') for (const k of Object.keys(rc)) push(rc[k]);
  } catch (e) { /* empty person list on a broken read; error counted by caller */ }
  return out;
}

// One day's per-person arrow map. Pure reads; never mutates Game.
function snapshotDay(Game, store) {
  const day = dayOf(Game);
  const persons = allPersons(Game);
  const byVid = {};
  const listsByVid = {};
  const holders = [];
  let totalCarried = 0, totalStashed = 0;
  for (const p of persons) {
    let c = 0, s = 0, items = [], stashed = [], fullPool = null, ranged = null;
    try { c = arrowCountOf(p.items || []); } catch (e) { noteErr(store, 'snapshot.carried', e); }
    try { s = arrowCountOf(p.stashed || []); } catch (e) { noteErr(store, 'snapshot.stashed', e); }
    // Full lists for EVERY person (in-memory only): tomorrow's change
    // event needs the previous day's lists even for a first-time holder.
    try { items = idListOf(p.items || []); } catch (e) { noteErr(store, 'snapshot.items', e); }
    try { stashed = idListOf(p.stashed || []); } catch (e) { noteErr(store, 'snapshot.stashList', e); }
    listsByVid[p.id] = { items: items, stashedList: stashed };
    if (c > 0 || s > 0) {
      try { fullPool = Array.isArray(p.fullPool) ? p.fullPool.slice() : null; } catch (e) { noteErr(store, 'snapshot.fullPool', e); }
      try {
        const eq = p.equipped || {};
        ranged = eq.ranged ? (eq.ranged.itemId || eq.ranged.id || null) : null;
      } catch (e) { noteErr(store, 'snapshot.equipped', e); }
      holders.push({ vid: p.id, name: personName(Game, p), carried: c, stashed: s, items: items, stashedList: stashed, fullPool: fullPool, equippedRanged: ranged, dead: !!p.dead });
    }
    byVid[p.id] = { carried: c, stashed: s };
    totalCarried += c; totalStashed += s;
  }
  // Change events vs the previous day's map (kept in memory, not in JSON).
  const prev = store._prevByVid || {};
  const seen = store._seenVids || {};
  for (const p of persons) {
    const cur = byVid[p.id];
    const isNew = !seen[p.id];
    if (isNew) {
      let items = [], stashed = [], fullPool = null;
      try { items = idListOf(p.items || []); } catch (e) { noteErr(store, 'newPerson.items', e); }
      try { stashed = idListOf(p.stashed || []); } catch (e) { noteErr(store, 'newPerson.stashList', e); }
      try { fullPool = Array.isArray(p.fullPool) ? p.fullPool.slice() : null; } catch (e) { noteErr(store, 'newPerson.fullPool', e); }
      pushCapped(store, 'newPersons', {
        day: day, vid: p.id, name: personName(Game, p),
        carried: cur.carried, stashed: cur.stashed,
        items: items, stashedList: stashed, fullPool: fullPool,
      });
      seen[p.id] = true;
    }
    const pr = prev[p.id];
    if (pr && (pr.carried !== cur.carried || pr.stashed !== cur.stashed)) {
      const prevItems = (pr.items || []);
      const prevStashed = (pr.stashedList || []);
      const curItems = (listsByVid[p.id] && listsByVid[p.id].items) || [];
      const curStashed = (listsByVid[p.id] && listsByVid[p.id].stashedList) || [];
      pushCapped(store, 'changeEvents', {
        day: day, vid: p.id, name: personName(Game, p),
        prevCarried: pr.carried, prevStashed: pr.stashed,
        curCarried: cur.carried, curStashed: cur.stashed,
        prevItems: prevItems, prevStashedList: prevStashed,
        curItems: curItems, curStashedList: curStashed,
        newPerson: false,
      });
    }
    // Remember today's full lists for tomorrow's change event.
    prev[p.id] = {
      carried: cur.carried, stashed: cur.stashed,
      items: (listsByVid[p.id] && listsByVid[p.id].items) || [],
      stashedList: (listsByVid[p.id] && listsByVid[p.id].stashedList) || [],
    };
  }
  store._prevByVid = prev;
  store._seenVids = seen;
  // Scholar bucket (separate structure).
  let scholarArrow = 0, scholarFullPool = null;
  try { scholarArrow = arrowCountOf(((Game.state || {}).scholar || {}).inventory || []); } catch (e) { noteErr(store, 'snapshot.scholar', e); }
  try {
    const sch = (Game.data && Array.isArray(Game.data.villagers)) ? Game.data.villagers.find(v => v && v.id === Game.villagerId) : null;
    scholarFullPool = (sch && Array.isArray(sch.fullPool)) ? sch.fullPool.slice() : null;
  } catch (e) { noteErr(store, 'snapshot.scholarPool', e); }
  const row = {
    day: day, rosterN: persons.length,
    totalCarried: totalCarried, totalStashed: totalStashed,
    total: totalCarried + totalStashed,
    holders: holders, scholarArrow: scholarArrow, scholarFullPool: scholarFullPool,
  };
  pushCapped(store, 'dailyRows', row);
  return row;
}

function withArrowOriginDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      if (layerOn()) {
        try { ctx._arroworigin = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
        // Daily snapshot BEFORE the day's actions (starting-state convention).
        try { snapshotDay(Game, st); } catch (e) { noteErr(st, 'daily.snap', e); }
      }
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      return r;
    },
  });
}

module.exports = { layerOn, newStore, snapshotDay, withArrowOriginDiag, MAX_EVENTS };
