// gunloss-recorder-a.js — pack-removal tracer, arm sim-gunloss-a
// (DIAG, instrument-only: omar_farouk's vanished searcaster + 2 cells,
// seed 107369, census days 133-134 — see evidence/2026-11-22/
// sim-gunloss-a-prereg.md for the code census of every removal path).
//
// The recorder has three layers, all pure reads + driver-local writes
// (no RNG, no game-state writes; every wrapped game function runs
// exactly once, untouched):
//   (1) NAMED WRAPS around the code-census paths (mantleBecome,
//       playerDeath, migrateKeepsakes, fieldFight, expeditionMonster,
//       expeditionReturn, hostileVisitorTick, registerDeath, equip,
//       unequip, villagerPocketAmmo, villagerAmmoCraftDay, plus the
//       namespace functions Godpath.npcDeathRefusal and
//       equipment.autoEquip). Each records pre/post gear snapshots of
//       the target holder AND of scholar.* — rare calls in full,
//       hot calls only on a gun/cell delta (plus a per-function call
//       count so a zero-delta silence is itself evidence).
//   (2) SPLICE TRIPWIRE (backstop): Array.prototype.splice is patched
//       while the recorder runs; any splice on an array holding a
//       searcaster/fusion_cell entry records day + stack + before/after
//       counts. Catches every in-place removal whatever named it —
//       including paths with no clean Game method (trade/gift, if any
//       exists at runtime; food spend; betrayal corpse-pack move).
//       The original is restored on uninstall.
//   (3) REASSIGNMENT WATCH (backstop): Object.defineProperty setters
//       on the target's person record (items/equipped/stashed — the
//       stable data.villagers object, found directly, never via
//       getPerson — see gunlossPersonOf) and on
//       state.scholar (inventory/equipped), logging reference changes
//       with stack. Catches `person.items = []` (mantle wipe),
//       `s.inventory = []` (death pack), shedNpcGear's flatMap
//       reassignment, and any whole-array replacement. Same-array
//       no-op assignments are not logged. Re-asserted daily (a
//       late-joining target re-gets its watch).
// The target is omar_farouk (TARGET_VID); the daily gun census records
// his full gear + the scholar's gun/cell state + scholarId, so the loss
// is bracketed to the day and its destination (or absence) is visible.
// Env-gated by the driver: install only when the recorder is on;
// uninstall restores every wrapped function and Array.prototype.splice.
'use strict';

const TARGET_VID = 'omar_farouk';
const TARGET_IDS = ['searcaster', 'fusion_cell'];

// gunlossPersonOf(Game, vid): the target's person record WITHOUT
// hydration. Game.getPerson MUST NOT be used here: for an id that is
// a background_survivors seed (omar_farouk is one —
// src/data/background_survivors.json:1600), getPerson falls through
// to hydrateSeed, which DRAWS RNG (a recorder must never perturb the
// sim's stream) and calls S.equipment.autoEquip — which this recorder
// wraps — so a snapshot inside the autoEquip wrap re-entered
// getPerson -> hydrateSeed -> autoEquip forever (observed: install
// hung burning CPU on seed 7, where omar is not yet roster). The
// direct data.villagers find is a pure read; a non-roster target
// simply reads found:false until it joins. (On the judged seed
// 107369 omar is roster from day 0, so the judged run never takes
// the hydrate path even so.)
function gunlossPersonOf(Game, vid) {
  try {
    const list = (Game.data && Game.data.villagers) || [];
    for (let i = 0; i < list.length; i++) if (list[i] && list[i].id === vid) return list[i];
  } catch (e) {}
  return null;
}

function gunlossItemId(e) {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object') return e.itemId || e.id || e.plantId || null;
  return null;
}
function gunlossUnits(e) {
  if (typeof e === 'string') return 1;
  if (e && typeof e === 'object') return (e.units == null ? 1 : e.units);
  return 0;
}
// gunlossCountItems(items): {gun, cells, len, list} — list holds ONLY
// gun/cell entries ({id, units}), so event rows stay small; len is the
// whole-array length for context. Never throws into the caller.
function gunlossCountItems(items) {
  const out = { gun: 0, cells: 0, len: 0, list: [] };
  try {
    const arr = items || [];
    out.len = arr.length || 0;
    for (let i = 0; i < arr.length; i++) {
      const id = gunlossItemId(arr[i]);
      if (id === 'searcaster') { out.gun += gunlossUnits(arr[i]); out.list.push({ id: id, units: gunlossUnits(arr[i]) }); }
      else if (id === 'fusion_cell') { out.cells += gunlossUnits(arr[i]); out.list.push({ id: id, units: gunlossUnits(arr[i]) }); }
    }
  } catch (e) {}
  return out;
}
function gunlossEquippedIds(eq) {
  const out = {};
  try {
    for (const slot of Object.keys(eq || {})) {
      const e = eq[slot];
      if (!e) continue;
      out[slot] = gunlossItemId(e);
    }
  } catch (e) {}
  return out;
}
// gunlossGearSnap(Game, vid): full gear snapshot of one villager.
// {vid, found, items, equipped, stashed, gun, cells, gunEquipped}.
// `items`/`stashed` are the full item lists ({id, units} per entry) so
// the analyzer can see WHERE a gun went, not just that it left.
function gunlossGearSnap(Game, vid) {
  const snap = { vid: vid, found: false, items: [], equipped: {}, stashed: [], gun: 0, cells: 0, gunEquipped: null };
  try {
    const p = gunlossPersonOf(Game, vid);
    if (!p) return snap;
    snap.found = true;
    const ic = gunlossCountItems(p.items);
    snap.gun = ic.gun; snap.cells = ic.cells;
    try {
      snap.items = (p.items || []).map(function (e) { return { id: gunlossItemId(e), units: gunlossUnits(e) }; });
    } catch (e) { snap.items = []; }
    try {
      snap.stashed = (p.stashed || []).map(function (e) { return { id: gunlossItemId(e), units: gunlossUnits(e) }; });
    } catch (e) { snap.stashed = []; }
    snap.equipped = gunlossEquippedIds(p.equipped);
    snap.gunEquipped = snap.equipped.ranged || null;
    const sc = gunlossCountItems(p.stashed);
    snap.stashGun = sc.gun; snap.stashCells = sc.cells;
  } catch (e) {}
  return snap;
}
// gunlossScholarSnap(Game): the scholar's gun/cell state. Counts the
// scholar inventory directly (a cell in the pack is a cell in the
// world) and reads the equipped ranged slot via the same
// rangedWeaponOf read the census uses — AND counts the gun and the
// cells in EVERY equipped slot. This matters: autoEquip scores ANY
// carried item 2 for the empty head slot (equipment.js equipScore —
// the "wear anything as a hat" fallback), so a carried fusion_cell is
// equipped as headgear; mantleBecome's worn transfer then moves that
// head entry onto the scholar, so the cells leave the inventory for
// the head slot — invisible to any census that counts inventory only
// (which is exactly how the cellcheck scholar census missed them).
// A worn entry CAN carry units since the mantle fix (ff17699c7) and
// the scholar equip fix (sim-wornstack-equip-a, #2707) — a 2-cell
// stack worn as a hat is 2 cells, not 1 — so cellsEq counts the
// worn entry's units, not one per slot (the old per-slot count
// under-read a worn stack by (units-1) and reported a phantom loss).
function gunlossScholarSnap(Game) {
  const snap = { cells: 0, cellsInv: 0, cellsEq: 0, gunInv: 0, gunEq: null, gunEqSlots: [], equipped: {}, items: [] };
  try {
    const s = (Game.state || {}).scholar || {};
    const ic = gunlossCountItems(s.inventory);
    snap.cellsInv = ic.cells; snap.gunInv = ic.gun;
    snap.items = ic.list;
    snap.equipped = gunlossEquippedIds(s.equipped);
    snap.gunEq = snap.equipped.ranged || null;
    // The scholar's ranged slot may be 'weapon' in some paths; also
    // surface it so a mantle-transferred gun under another slot name
    // is never missed.
    if (!snap.gunEq && snap.equipped.weapon) snap.gunEq = snap.equipped.weapon;
    for (const k of Object.keys(snap.equipped)) {
      if (snap.equipped[k] === 'fusion_cell') snap.cellsEq += gunlossUnits((s.equipped || {})[k]);
      if (snap.equipped[k] === 'searcaster') snap.gunEqSlots.push(k);
    }
    snap.cells = snap.cellsInv + snap.cellsEq;
  } catch (e) {}
  return snap;
}
function gunlossDay(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}
function gunlossStack() {
  try {
    const st = (new Error('gunloss-caller')).stack || '';
    const lines = st.split('\n').slice(1);
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i] || '';
      if (ln.indexOf('gunloss-recorder-a.js') !== -1) continue;
      if (ln.indexOf('gunloss-driver-a.js') !== -1) continue;
      return ln.trim().slice(0, 240);
    }
    return (lines[0] || '').trim().slice(0, 240);
  } catch (e) { return null; }
}
// gunlossDelta(a, b): person+scholar gear delta between two snapshots
// {gun, cells, scholarGun, scholarCells, gunEqChanged}. a/b are
// {person, scholar} pairs as taken by gunlossSnapPair.
function gunlossSnapPair(Game, vid) {
  return { person: gunlossGearSnap(Game, vid), scholar: gunlossScholarSnap(Game) };
}
function gunlossDelta(a, b) {
  function n(v) { return (v == null ? 0 : v) | 0; }
  const ap = a.person || {}, bp = b.person || {};
  const as = a.scholar || {}, bs = b.scholar || {};
  return {
    gun: (n(bp.gun) + n(bp.stashGun)) - (n(ap.gun) + n(ap.stashGun)),
    cells: (n(bp.cells) + n(bp.stashCells)) - (n(ap.cells) + n(ap.stashCells)),
    scholarGun: (n(bs.gunInv) + ((bs.gunEqSlots || []).length)) - (n(as.gunInv) + ((as.gunEqSlots || []).length)),
    scholarCells: n(bs.cells) - n(as.cells),
    gunEqChanged: ((ap.gunEquipped || null) !== (bp.gunEquipped || null)),
  };
}
function gunlossDeltaIsZero(d) {
  return d && d.gun === 0 && d.cells === 0 && d.scholarGun === 0 && d.scholarCells === 0 && !d.gunEqChanged;
}

// installGunlossRecorder(Game, events, errors): installs all three
// layers. events is the caller's array (named-wrap + tripwire + watch
// rows all land here, in call order). errors collects install
// failures. Returns { uninstall, ensureWatch, census, callCounts }.
// census() takes the daily gun census row. callCounts is the
// per-function call tally (named wraps only).
function installGunlossRecorder(Game, events, errors, targetVid) {
  const TARGET = targetVid || TARGET_VID;
  const callCounts = {};
  const wrapped = []; // {obj, key, orig} for restore
  let tripwireOn = false;
  const origSplice = Array.prototype.splice;
  // Per-function re-entrancy guard (defense in depth — the observed
  // recursion was getPerson -> hydrateSeed -> autoEquip -> snapshot ->
  // getPerson, broken at the root by gunlossPersonOf; the guard also
  // covers any same-function re-entry through game code, e.g. a fight
  // inside a fight). A re-entered call runs the original unwrapped
  // (the outermost call's pre/post snapshot already covers the span);
  // DIFFERENT functions still nest and record (mantleBecome inside
  // playerDeath must keep its own row — that is the attribution).
  const inFn = {};
  function countCall(fn) { callCounts[fn] = (callCounts[fn] || 0) + 1; }
  function wrapMethod(obj, key, fnName, fileHint, recordEvery) {
    try {
      if (!obj || typeof obj[key] !== 'function') { errors.push(fnName + '-wrap: not a function'); return; }
      const orig = obj[key];
      const wrappedFn = function () {
        if (inFn[fnName]) return orig.apply(this, arguments);
        inFn[fnName] = true;
        countCall(fnName);
        const pre = gunlossSnapPair(Game, TARGET);
        let ret;
        let threw = null;
        try { ret = orig.apply(this, arguments); }
        catch (e) { threw = e; throw e; }
        finally {
          try {
            const post = gunlossSnapPair(Game, TARGET);
            const d = gunlossDelta(pre, post);
            if (recordEvery || !gunlossDeltaIsZero(d)) {
              events.push({ kind: 'wrap', fn: fnName, file: fileHint || null,
                day: gunlossDay(Game), stack: gunlossStack(),
                delta: d, pre: pre, post: post, threw: threw ? String(threw && threw.message || threw).slice(0, 120) : null });
            }
          } catch (e) { errors.push(fnName + '-log: ' + String(e.message).slice(0, 80)); }
          inFn[fnName] = false;
        }
        return ret;
      };
      obj[key] = wrappedFn;
      wrapped.push({ obj: obj, key: key, orig: orig });
    } catch (e) { errors.push(fnName + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }

  // ---- (1) named wraps ----
  // Rare calls (succession + death + return + steal + corpse): every
  // call recorded in full — they fire a handful of times per run.
  wrapMethod(Game, 'mantleBecome', 'mantleBecome', 'src/js/villager-build.js', true);
  wrapMethod(Game, 'playerDeath', 'playerDeath', 'src/js/ledger.js', true);
  wrapMethod(Game, 'migrateKeepsakes', 'migrateKeepsakes', 'src/js/keepsakes.js', true);
  wrapMethod(Game, 'expeditionReturn', 'expeditionReturn', 'src/js/villager-agency.js', true);
  wrapMethod(Game, 'hostileVisitorTick', 'hostileVisitorTick', 'src/js/betrayal.js', true);
  wrapMethod(Game, 'registerDeath', 'registerDeath', 'src/js/ledger.js', true);
  wrapMethod(Game, 'equip', 'equip', 'src/js/game.js', true);
  wrapMethod(Game, 'unequip', 'unequip', 'src/js/game.js', true);
  wrapMethod(Game, 'vesselStashFetch', 'vesselStashFetch', 'src/js/villager-build.js', true);
  wrapMethod(Game, 'vesselArmorFetch', 'vesselArmorFetch', 'src/js/villager-build.js', true);
  // Hot calls (fights, crafting, auto-equip): delta-only rows — the
  // callCounts tally proves they fired, the rows prove whether any of
  // them ever moved the gun or a cell.
  wrapMethod(Game, 'fieldFight', 'fieldFight', 'src/js/fieldFights.js', false);
  wrapMethod(Game, 'expeditionMonster', 'expeditionMonster', 'src/js/villager-agency.js', false);
  wrapMethod(Game, 'villagerPocketAmmo', 'villagerPocketAmmo', 'src/js/game.js', false);
  wrapMethod(Game, 'villagerAmmoCraftDay', 'villagerAmmoCraftDay', 'src/js/villager-build.js', false);
  wrapMethod(Game, 'villagerWeaponCraftDay', 'villagerWeaponCraftDay', 'src/js/villager-build.js', false);
  // Namespace functions (not Game methods).
  try {
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    if (S.Godpath && typeof S.Godpath.npcDeathRefusal === 'function') {
      const orig = S.Godpath.npcDeathRefusal;
      const fnName = 'npcDeathRefusal';
      S.Godpath.npcDeathRefusal = function () {
        if (inFn[fnName]) return orig.apply(this, arguments);
        inFn[fnName] = true;
        countCall(fnName);
        const pre = gunlossSnapPair(Game, TARGET);
        let ret;
        try { ret = orig.apply(this, arguments); }
        finally {
          try {
            const post = gunlossSnapPair(Game, TARGET);
            const d = gunlossDelta(pre, post);
            if (!gunlossDeltaIsZero(d)) {
              events.push({ kind: 'wrap', fn: fnName, file: 'src/js/godpath.js',
                day: gunlossDay(Game), stack: gunlossStack(), delta: d, pre: pre, post: post, threw: null });
            }
          } catch (e) { errors.push(fnName + '-log: ' + String(e.message).slice(0, 80)); }
          inFn[fnName] = false;
        }
        return ret;
      };
      wrapped.push({ obj: S.Godpath, key: 'npcDeathRefusal', orig: orig });
    } else errors.push('npcDeathRefusal-wrap: not a function');
  } catch (e) { errors.push('npcDeathRefusal-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    if (S.equipment && typeof S.equipment.autoEquip === 'function') {
      const orig = S.equipment.autoEquip;
      const fnName = 'autoEquip';
      S.equipment.autoEquip = function (v) {
        if (inFn[fnName]) return orig.apply(this, arguments);
        inFn[fnName] = true;
        countCall(fnName);
        const isTarget = !!(v && (v.id === TARGET));
        const pre = isTarget ? gunlossSnapPair(Game, TARGET) : null;
        let ret;
        try { ret = orig.apply(this, arguments); }
        finally {
          try {
            if (isTarget && pre) {
              const post = gunlossSnapPair(Game, TARGET);
              const d = gunlossDelta(pre, post);
              if (!gunlossDeltaIsZero(d)) {
                events.push({ kind: 'wrap', fn: fnName, file: 'src/js/equipment.js',
                  day: gunlossDay(Game), stack: gunlossStack(), delta: d, pre: pre, post: post, threw: null });
              }
            }
          } catch (e) { errors.push(fnName + '-log: ' + String(e.message).slice(0, 80)); }
          inFn[fnName] = false;
        }
        return ret;
      };
      wrapped.push({ obj: S.equipment, key: 'autoEquip', orig: orig });
    } else errors.push('autoEquip-wrap: not a function');
  } catch (e) { errors.push('autoEquip-wrap-install: ' + String(e.message).slice(0, 80)); }

  // ---- (2) splice tripwire ----
  function countTargetsOn(arr) {
    let gun = 0, cells = 0;
    try {
      if (!arr || arr.length > 500) return null;
      for (let i = 0; i < arr.length; i++) {
        const id = gunlossItemId(arr[i]);
        if (id === 'searcaster') gun += gunlossUnits(arr[i]);
        else if (id === 'fusion_cell') cells += gunlossUnits(arr[i]);
      }
    } catch (e) { return null; }
    return { gun: gun, cells: cells };
  }
  try {
    Array.prototype.splice = function () {
      let pre = null;
      try { if (tripwireOn) pre = countTargetsOn(this); } catch (e) { pre = null; }
      const ret = origSplice.apply(this, arguments);
      try {
        if (pre && (pre.gun > 0 || pre.cells > 0)) {
          const post = countTargetsOn(this);
          if (post && (post.gun !== pre.gun || post.cells !== pre.cells)) {
            const removed = [];
            try {
              for (let i = 0; i < ret.length; i++) {
                const id = gunlossItemId(ret[i]);
                if (id === 'searcaster' || id === 'fusion_cell') removed.push({ id: id, units: gunlossUnits(ret[i]) });
              }
            } catch (e) {}
            events.push({ kind: 'splice', day: gunlossDay(Game), stack: gunlossStack(),
              before: pre, after: post, removed: removed });
          }
        }
      } catch (e) { /* tripwire logging must never throw into game code */ }
      return ret;
    };
    tripwireOn = true;
  } catch (e) { errors.push('splice-tripwire-install: ' + String(e.message).slice(0, 80)); }

  // ---- (3) reassignment watch ----
  function summarizeValue(v) {
    if (v == null) return null;
    if (Array.isArray(v)) { const c = gunlossCountItems(v); return { len: v.length, gun: c.gun, cells: c.cells }; }
    if (typeof v === 'object') return { slots: gunlossEquippedIds(v) };
    return String(v).slice(0, 80);
  }
  function watchProp(obj, label, prop) {
    try {
      if (!obj || typeof obj !== 'object') return false;
      const desc = Object.getOwnPropertyDescriptor(obj, prop);
      if (desc && desc.get && desc.get.__gunlossWatch) return true;
      if (desc && !desc.configurable) { errors.push('watch-' + label + '-' + prop + ': non-configurable'); return false; }
      let val = obj[prop];
      const getter = function () { return val; };
      getter.__gunlossWatch = true;
      Object.defineProperty(obj, prop, {
        configurable: true, enumerable: true,
        get: getter,
        set: function (nv) {
          const old = val;
          val = nv;
          try {
            if (nv !== old) {
              events.push({ kind: 'reassign', label: label, prop: prop,
                day: gunlossDay(Game), stack: gunlossStack(),
                before: summarizeValue(old), after: summarizeValue(nv) });
            }
          } catch (e) { /* watch logging must never throw into game code */ }
        },
      });
      return true;
    } catch (e) { errors.push('watch-' + label + '-' + prop + ': ' + String(e.message).slice(0, 80)); return false; }
  }
  function ensureWatch() {
    try {
      const p = gunlossPersonOf(Game, TARGET);
      if (p) {
        watchProp(p, TARGET, 'items');
        watchProp(p, TARGET, 'equipped');
        watchProp(p, TARGET, 'stashed');
      }
    } catch (e) { errors.push('ensureWatch-omar: ' + String(e.message).slice(0, 80)); }
    try {
      const s = (Game.state || {}).scholar || null;
      if (s) {
        watchProp(s, 'scholar', 'inventory');
        watchProp(s, 'scholar', 'equipped');
      }
    } catch (e) { errors.push('ensureWatch-scholar: ' + String(e.message).slice(0, 80)); }
  }
  ensureWatch();

  function census() {
    let scholarId = null;
    try { scholarId = Game.villagerId || null; } catch (e) {}
    return { day: gunlossDay(Game), scholarId: scholarId,
      omar: gunlossGearSnap(Game, TARGET), scholar: gunlossScholarSnap(Game) };
  }
  function uninstall() {
    try { tripwireOn = false; Array.prototype.splice = origSplice; } catch (e) {}
    for (let i = wrapped.length - 1; i >= 0; i--) {
      try { wrapped[i].obj[wrapped[i].key] = wrapped[i].orig; } catch (e) {}
    }
  }
  return { uninstall: uninstall, ensureWatch: ensureWatch, census: census, callCounts: callCounts };
}

module.exports = { TARGET_VID: TARGET_VID, gunlossPersonOf: gunlossPersonOf,
  gunlossItemId: gunlossItemId,
  gunlossUnits: gunlossUnits, gunlossCountItems: gunlossCountItems,
  gunlossEquippedIds: gunlossEquippedIds, gunlossGearSnap: gunlossGearSnap,
  gunlossScholarSnap: gunlossScholarSnap, gunlossSnapPair: gunlossSnapPair,
  gunlossDelta: gunlossDelta, gunlossDeltaIsZero: gunlossDeltaIsZero,
  installGunlossRecorder: installGunlossRecorder };
