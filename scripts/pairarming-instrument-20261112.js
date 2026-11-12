// pairarming-instrument-20261112.js — wave-5 pair-arming diagnostic
// instrument (arm sim-pairarming-a, run fleshout-20261112T1624Z
// follow-up). Scripts only, zero src/js.
//
// The question (evidence/2026-11-12/sim-bisect-r9-cut-a.md §5, §8.5):
// on the r9 base, seed 190398 holds a wave-5 pair for 19 days
// (d131–149) with armed 4–5 vs demand 6 and never qualifies; armed
// falls 4 → 3 over the block. WHY do armed counts fall while a pair
// holds — not whether pairs form.
//
// What this records, once per day (in the same finally block as the
// vetfirst snapshot, after it):
//   (1) GEAR SNAPSHOT: per living roster member the armed/armored
//       predicates of standing.js waveCombatReadiness(5), replicated
//       with the same engine APIs — scholar via armorBonus() /
//       equippedWeapon() / carried weapon in scholar inventory;
//       villager via S.equipment.armorOf / meleeWeaponOf /
//       rangedWeaponOf / carried weapon in vp.items; veteranW4
//       from state.waveKillLog (w>=4, living, roster-checked —
//       the swapped-in fix rule). PLUS the engine's own
//       waveCombatReadiness(5) read for cross-check, the capped
//       standing (war + diplomacy + min(plenty, cap) — a pure
//       villageStanding() read, NEVER villageStandingTotal() /
//       unlockedWave() mid-run: both release peaks / emit beats),
//       and state._standingPeakWave.
//   (2) ATTRIBUTION (diffGearDays): consecutive snapshots are
//       diffed member-by-member. Every armed-count drop on a hold
//       day is attributed to one class defined from what the code
//       actually records — death (registerDeath row that day, or
//       vp.dead flip), departure (alive but absent from the roster:
//       the betrayal.js removal choke point — exiled/fled/left),
//       gear-loss (alive and in-roster on both days, armed then
//       unarmed: transferred vs stolen/vanished), or counted
//       unattributed when no member-level delta explains it.
//       Armor-loss and veteran-loss are diffed the same way
//       alongside. "Readiness decay" is NOT a class: no decay
//       mechanism exists in the code — readiness is a live read
//       of roster state, so a drop with no member delta lands in
//       unattributed by design.
//   (3) HOLD DETECTION (findHoldBlocks): pair-hold days
//       (ready5.veterans >= 2, peak < 5) and deferral-hold days
//       (pair-hold + capped standing >= 200).
//
// All reads are record-only: no RNG consumed, no state mutated.
// Any failure in the RECORDING path is logged to instrumentErrors,
// never thrown into the game.
//
// Usage (driver): const PA = require('./pairarming-instrument-20261112');
//   const snap = PA.gearSnapshot(Game, prevSnap, deathsToday);
//   const diff = PA.diffGearDays(prevSnap, snap);
//   const holds = PA.findHoldBlocks(gearDaily);
'use strict';

const ARMOR_P5 = 15; // wave-5 armor demand (standingCfg readyDemand[5])

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function personName(Game, vid) {
  try {
    if (typeof Game.getPerson === 'function') {
      const p = Game.getPerson(vid);
      if (p) return p.name || p.displayName || vid;
    }
  } catch (e) {}
  try {
    const v = ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; });
    if (v) return v.name || vid;
  } catch (e) {}
  return vid;
}

function idOf(ent) {
  if (!ent) return null;
  if (typeof ent === 'string') return ent;
  return ent.itemId || ent.id || null;
}

function defOf(itemDefs, iid) {
  if (!iid) return null;
  for (let i = 0; i < (itemDefs || []).length; i++) {
    const d = itemDefs[i];
    if (d && d.id === iid) return d;
  }
  return null;
}

// carriesWeapon: mirrors standing.js — a weapon item carried in the
// member's items (string id or {itemId|id} entry whose def has .weapon).
function carriesWeaponIds(items, itemDefs) {
  const out = [];
  for (const e of (items || [])) {
    const iid = idOf(e);
    if (!iid) continue;
    const def = defOf(itemDefs, iid);
    if (def && def.weapon) out.push(iid);
  }
  return out;
}

function carriedArmorIds(items, itemDefs) {
  const out = [];
  for (const e of (items || [])) {
    const iid = idOf(e);
    if (!iid) continue;
    const def = defOf(itemDefs, iid);
    if (def && def.armor) out.push(iid);
  }
  return out;
}

function equippedIds(vp) {
  const out = [];
  const eq = (vp && vp.equipped) || {};
  for (const k of Object.keys(eq)) {
    const e = eq[k];
    if (!e) continue;
    const iid = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (iid) out.push(iid);
  }
  return out;
}

// gearSnapshot(Game, prev, deathsToday): one day of pair-arming
// detail. prev is the previous day's snapshot (or null); deathsToday
// is the array of villagerIds with a registerDeath row on this day
// (from the vetfirst instrument's regDeaths, filtered by day).
// prevVanished records, for every vid in prev.members missing from
// today's roster, whether their vp record still exists and whether
// it is marked dead — the live read that separates death from
// departure (both remove the vid from the roster).
function gearSnapshot(Game, prev, deathsToday) {
  const snap = { day: dayOf(Game), instrumentErrors: [] };
  const err = function (site, e) {
    try { snap.instrumentErrors.push(site + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  };
  try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; err('scholarId', e); }
  try { snap.peakWave = ((Game.state && Game.state._standingPeakWave) | 0) || 0; } catch (e) { snap.peakWave = 0; err('peakWave', e); }
  try {
    const s = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
    const cfg = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
    const cap = (cfg && (cfg.plentyCapT5 | 0)) || 100;
    if (s) {
      snap.standingRaw = (s.total | 0) || 0;
      snap.cappedStanding = (((s.war | 0) + (s.diplomacy | 0) + Math.min((s.plenty | 0), cap)) | 0) || 0;
    } else { snap.standingRaw = null; snap.cappedStanding = null; }
  } catch (e) { snap.standingRaw = null; snap.cappedStanding = null; err('cappedStanding', e); }
  try {
    const r5 = (typeof Game.waveCombatReadiness === 'function') ? Game.waveCombatReadiness(5) : null;
    snap.ready5 = r5 ? { ready: !!r5.ready, armored: r5.armored | 0, armed: r5.armed | 0, tricks: r5.tricks | 0, veterans: r5.veterans | 0, short: r5.short || [] } : null;
  } catch (e) { snap.ready5 = null; err('ready5', e); }
  snap.deathsToday = (deathsToday || []).slice();
  try {
    const ex = ((Game.state && Game.state.village && Game.state.village.exiles) || []);
    snap.exiles = ex.map(function (e) { return e ? { vid: e.vid || null, how: e.how || null, day: (e.day | 0) || null } : null; }).filter(Boolean);
  } catch (e) { snap.exiles = []; err('exiles', e); }
  try {
    const st = (typeof Game.stashState === 'function') ? Game.stashState() : null;
    const pile = (st && (st.weapons || st.armor || [])) || [];
    snap.stashWeaponIds = [];
    snap.stashArmorIds = [];
    const itemDefs = ((Game.data || {}).items) || [];
    for (const e of pile) {
      const iid = idOf(e);
      if (!iid) continue;
      const def = defOf(itemDefs, iid);
      if (def && def.weapon) snap.stashWeaponIds.push(iid);
      if (def && def.armor) snap.stashArmorIds.push(iid);
    }
  } catch (e) { snap.stashWeaponIds = null; snap.stashArmorIds = null; err('stash', e); }
  try {
    const pantry = ((Game.state && Game.state.village && Game.state.village.pantry) || []);
    const itemDefs = ((Game.data || {}).items) || [];
    snap.pantryWeaponIds = [];
    snap.pantryArmorIds = [];
    for (const e of pantry) {
      const iid = idOf(e);
      if (!iid) continue;
      const def = defOf(itemDefs, iid);
      if (def && def.weapon) snap.pantryWeaponIds.push(iid);
      if (def && def.armor) snap.pantryArmorIds.push(iid);
    }
  } catch (e) { snap.pantryWeaponIds = null; snap.pantryArmorIds = null; err('pantry', e); }

  // Per-member rows, replicating the standing.js predicates.
  const members = [];
  let armed = 0, armored = 0;
  const veteransW4 = [];
  try {
    const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
    const eq = S.equipment || null;
    const itemDefs = ((Game.data || {}).items) || [];
    const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
    const scholarId = snap.scholarId;
    const log = ((Game.state && Game.state.waveKillLog) || []);
    const vpCache = {};
    const vpOfId = function (vid) {
      if (vid === scholarId) return null;
      if (!(vid in vpCache)) {
        let vp = null;
        try { vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; } catch (e) { vp = null; }
        vpCache[vid] = vp;
      }
      return vpCache[vid];
    };
    const isLiving = function (vid) {
      if (vid === scholarId) return true;
      const vp = vpOfId(vid);
      return !!(vp && !vp.dead);
    };
    for (const vid of roster) {
      const row = {
        vid: vid, name: personName(Game, vid), isScholar: vid === scholarId,
        alive: false, armed: false, meleeId: null, rangedId: null,
        carriedWeaponIds: [], equippedItemIds: [], carriedArmorIds: [],
        armorP: 0, veteranW4: false, hp: null,
      };
      try {
        if (vid === scholarId) {
          row.alive = true;
          let ap = 0;
          try { ap = (typeof Game.armorBonus === 'function') ? (Game.armorBonus() | 0) : 0; } catch (e) { ap = 0; }
          row.armorP = ap;
          let wp = false;
          let ew = null;
          try { ew = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null; wp = !!(ew && !ew.unarmed); } catch (e) { wp = false; }
          if (ew && !ew.unarmed) row.meleeId = ew.itemId || ew.id || null;
          try {
            const sinv = ((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []);
            row.carriedWeaponIds = carriesWeaponIds(sinv, itemDefs);
            row.carriedArmorIds = carriedArmorIds(sinv, itemDefs);
            const seq = (((Game.state && Game.state.scholar && Game.state.scholar.equipped) || {}));
            for (const k of Object.keys(seq)) {
              const e = seq[k];
              if (!e) continue;
              const iid = (typeof e === 'string') ? e : (e.itemId || e.id);
              if (iid) row.equippedItemIds.push(iid);
            }
            if (!wp && row.carriedWeaponIds.length) wp = true;
          } catch (e) { err('scholar-carry-' + vid, e); }
          row.armed = wp;
          try {
            const s = (Game.state && Game.state.scholar) || {};
            row.hp = (typeof s.health === 'number') ? s.health : null;
          } catch (e) { row.hp = null; }
        } else {
          const vp = vpOfId(vid);
          if (!vp) { members.push(row); continue; }
          row.alive = !vp.dead;
          row.name = vp.name || row.name;
          let ap = 0;
          try { ap = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, itemDefs) || 0) : 0; } catch (e) { ap = 0; }
          row.armorP = ap;
          let mw = null, rw = null;
          try { mw = (eq && typeof eq.meleeWeaponOf === 'function') ? eq.meleeWeaponOf(vp) : null; } catch (e) { mw = null; }
          try { rw = (eq && typeof eq.rangedWeaponOf === 'function') ? eq.rangedWeaponOf(vp) : null; } catch (e) { rw = null; }
          if (mw) row.meleeId = (typeof mw === 'string') ? mw : (mw.itemId || mw.id || null);
          if (rw) row.rangedId = (typeof rw === 'string') ? rw : (rw.itemId || rw.id || null);
          row.carriedWeaponIds = carriesWeaponIds(vp.items, itemDefs);
          row.carriedArmorIds = carriedArmorIds(vp.items, itemDefs);
          row.equippedItemIds = equippedIds(vp);
          let wp = !!(mw || rw);
          if (!wp && row.carriedWeaponIds.length) wp = true;
          row.armed = wp;
          row.hp = (typeof vp.hp === 'number') ? vp.hp : ((typeof vp.health === 'number') ? vp.health : null);
        }
      } catch (e) { err('member-' + vid, e); }
      // Veteran (wave-4+ kill, living, roster-checked — the fix rule).
      try {
        if (row.alive) {
          for (const e of log) {
            if (e && e.by === vid && ((e.w | 0) >= 4)) { row.veteranW4 = true; break; }
          }
        }
      } catch (e) { err('vet-' + vid, e); }
      if (row.alive && row.armed) armed++;
      if (row.alive && row.armorP >= ARMOR_P5) armored++;
      if (row.veteranW4) veteransW4.push(vid);
      members.push(row);
    }
  } catch (e) { err('members', e); }
  snap.members = members;
  snap.armed = armed;
  snap.armored = armored;
  snap.veteransW4 = veteransW4;
  snap.veterans = veteransW4.length;
  // Cross-check: the replicated totals must agree with the engine.
  try {
    if (snap.ready5) {
      if (snap.armed !== snap.ready5.armed) snap.instrumentErrors.push('armed-mismatch: replicated ' + snap.armed + ' vs engine ' + snap.ready5.armed);
      if (snap.armored !== snap.ready5.armored) snap.instrumentErrors.push('armored-mismatch: replicated ' + snap.armored + ' vs engine ' + snap.ready5.armored);
      if (snap.veterans !== snap.ready5.veterans) snap.instrumentErrors.push('veterans-mismatch: replicated ' + snap.veterans + ' vs engine ' + snap.ready5.veterans);
    }
  } catch (e) { err('xcheck', e); }
  // Vanished-member check: for every vid in prev.members missing
  // from today's roster, is their vp record still there, and dead?
  snap.prevVanished = [];
  try {
    if (prev && Array.isArray(prev.members)) {
      const now = {};
      for (const m of members) now[m.vid] = true;
      for (const m of prev.members) {
        if (now[m.vid]) continue;
        let vp = null;
        try { vp = (typeof Game.vpOf === 'function') ? Game.vpOf(m.vid) : null; } catch (e) { vp = null; }
        snap.prevVanished.push({ vid: m.vid, name: m.name, exists: !!vp, dead: !!(vp && vp.dead) });
      }
    }
  } catch (e) { err('prevVanished', e); }
  return snap;
}

function memberByVid(members, vid) {
  for (const m of (members || [])) if (m && m.vid === vid) return m;
  return null;
}

function vanishedByVid(snap, vid) {
  for (const v of (snap.prevVanished || [])) if (v && v.vid === vid) return v;
  return null;
}

function exileHow(snap, vid) {
  for (const e of (snap.exiles || [])) if (e && e.vid === vid) return e.how || 'left';
  return null;
}

// itemAppearsElsewhere(itemId, cur, excludeVid): does this weapon /
// armor id show up on any other roster member's equipped/carried
// items, or in the stash / pantry, on the later day?
function itemAppearsElsewhere(iid, cur, excludeVid) {
  if (!iid) return false;
  for (const m of (cur.members || [])) {
    if (m.vid === excludeVid) continue;
    if ((m.equippedItemIds || []).indexOf(iid) >= 0) return true;
    if ((m.carriedWeaponIds || []).indexOf(iid) >= 0) return true;
    if ((m.carriedArmorIds || []).indexOf(iid) >= 0) return true;
    if (m.meleeId === iid || m.rangedId === iid) return true;
  }
  if ((cur.stashWeaponIds || []).indexOf(iid) >= 0) return true;
  if ((cur.stashArmorIds || []).indexOf(iid) >= 0) return true;
  if ((cur.pantryWeaponIds || []).indexOf(iid) >= 0) return true;
  if ((cur.pantryArmorIds || []).indexOf(iid) >= 0) return true;
  return false;
}

// classifyVanished(prev, cur, vid): the member armed yesterday is
// gone from today's roster. death vs departure, from what the code
// records — a registerDeath row that day, a dead vp record, an
// exiles entry, or a living vp record.
function classifyVanished(prev, cur, vid) {
  const deaths = cur.deathsToday || [];
  if (deaths.indexOf(vid) >= 0) {
    const scholar = (vid === prev.scholarId);
    return { class: 'death', subclass: scholar ? 'scholar-death' : 'death', successionTo: scholar ? (cur.scholarId || null) : null };
  }
  const v = vanishedByVid(cur, vid);
  if (v && v.dead) return { class: 'death', subclass: 'death-flag-no-row', successionTo: (vid === prev.scholarId) ? (cur.scholarId || null) : null };
  if (v && v.exists && !v.dead) {
    const how = exileHow(cur, vid);
    return { class: 'departure', subclass: how || 'left' };
  }
  if (v && !v.exists) return { class: 'other', subclass: 'roster-record-gone' };
  return { class: 'other', subclass: 'vanished-unchecked' };
}

// diffGearDays(prev, cur): attribute the armed / armored / veterans
// movement between two consecutive gear snapshots. Events explain
// exactly one unit of their bar each. Drops with no member-level
// delta are counted unattributed (never silently dropped).
function diffGearDays(prev, cur) {
  const out = { day: cur.day, prevDay: prev.day, armedEvents: [], armoredEvents: [], veteranEvents: [], gains: [], unattributedArmed: 0, unattributedArmored: 0, instrumentErrors: [] };
  const err = function (site, e) {
    try { out.instrumentErrors.push(site + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  };
  try {
    const prevArmed = prev.armed | 0, curArmed = cur.armed | 0;
    const prevArmored = prev.armored | 0, curArmored = cur.armored | 0;
    // Engine cross-check: if the replicated totals moved differently
    // from the engine's read, the diff is untrustworthy — say so.
    if (prev.ready5 && cur.ready5) {
      const engDelta = (cur.ready5.armed | 0) - (prev.ready5.armed | 0);
      if (engDelta !== (curArmed - prevArmed)) out.instrumentErrors.push('armed-delta-mismatch: replicated ' + (curArmed - prevArmed) + ' vs engine ' + engDelta);
      const engArmDelta = (cur.ready5.armored | 0) - (prev.ready5.armored | 0);
      if (engArmDelta !== (curArmored - prevArmored)) out.instrumentErrors.push('armored-delta-mismatch: replicated ' + (curArmored - prevArmored) + ' vs engine ' + engArmDelta);
    }
    let explainedArmed = 0, explainedArmored = 0;
    for (const m of (prev.members || [])) {
      if (!m) continue;
      const curM = memberByVid(cur.members, m.vid);
      // --- armed ---
      if (m.alive && m.armed) {
        if (!curM) {
          const c = classifyVanished(prev, cur, m.vid);
          out.armedEvents.push({ bar: 'armed', day: cur.day, vid: m.vid, name: m.name, class: c.class, subclass: c.subclass, successionTo: c.successionTo || null, detail: 'armed member left the roster' });
          explainedArmed++;
        } else if (!curM.alive) {
          const scholar = (m.vid === prev.scholarId);
          out.armedEvents.push({ bar: 'armed', day: cur.day, vid: m.vid, name: m.name, class: 'death', subclass: scholar ? 'scholar-death' : 'death', successionTo: scholar ? (cur.scholarId || null) : null, detail: 'armed member dead but still listed in roster' });
          explainedArmed++;
        } else if (!curM.armed) {
          const lost = [];
          const had = [m.meleeId, m.rangedId].concat(m.carriedWeaponIds || []);
          const has = [curM.meleeId, curM.rangedId].concat(curM.carriedWeaponIds || []);
          for (const id of had) if (id && has.indexOf(id) < 0 && lost.indexOf(id) < 0) lost.push(id);
          let transferred = false;
          for (const id of lost) if (itemAppearsElsewhere(id, cur, m.vid)) { transferred = true; break; }
          out.armedEvents.push({ bar: 'armed', day: cur.day, vid: m.vid, name: m.name, class: 'gear-loss', subclass: transferred ? 'transferred' : 'stolen/vanished', lostWeaponIds: lost, detail: 'alive roster member lost weapon(s): ' + (lost.join(', ') || 'none-recorded') });
          explainedArmed++;
        }
      } else if (m.alive && !m.armed && curM && curM.alive && curM.armed) {
        out.gains.push({ bar: 'armed', day: cur.day, vid: m.vid, name: m.name, kind: 'gear-gain', detail: 'member gained a weapon' });
      }
      // --- armored ---
      if (m.alive && m.armorP >= ARMOR_P5) {
        if (!curM) {
          const c = classifyVanished(prev, cur, m.vid);
          out.armoredEvents.push({ bar: 'armored', day: cur.day, vid: m.vid, name: m.name, class: c.class, subclass: c.subclass, successionTo: c.successionTo || null, detail: 'armored member left the roster' });
          explainedArmored++;
        } else if (!curM.alive) {
          const scholar = (m.vid === prev.scholarId);
          out.armoredEvents.push({ bar: 'armored', day: cur.day, vid: m.vid, name: m.name, class: 'death', subclass: scholar ? 'scholar-death' : 'death', successionTo: scholar ? (cur.scholarId || null) : null, detail: 'armored member dead but still listed in roster' });
          explainedArmored++;
        } else if (curM.armorP < ARMOR_P5) {
          const lost = [];
          const had = (m.equippedItemIds || []).concat(m.carriedArmorIds || []);
          const has = (curM.equippedItemIds || []).concat(curM.carriedArmorIds || []);
          for (const id of had) if (id && has.indexOf(id) < 0 && lost.indexOf(id) < 0) lost.push(id);
          let transferred = false;
          for (const id of lost) if (itemAppearsElsewhere(id, cur, m.vid)) { transferred = true; break; }
          out.armoredEvents.push({ bar: 'armored', day: cur.day, vid: m.vid, name: m.name, class: 'armor-loss', subclass: transferred ? 'transferred' : 'stolen/vanished', lostArmorIds: lost, detail: 'armorP ' + m.armorP + ' -> ' + curM.armorP });
          explainedArmored++;
        }
      } else if (m.alive && m.armorP < ARMOR_P5 && curM && curM.alive && curM.armorP >= ARMOR_P5) {
        out.gains.push({ bar: 'armored', day: cur.day, vid: m.vid, name: m.name, kind: 'armor-gain', detail: 'member crossed armorP ' + ARMOR_P5 });
      }
    }
    // Joins: a member present today who was absent yesterday.
    for (const m of (cur.members || [])) {
      if (!m) continue;
      if (memberByVid(prev.members, m.vid)) continue;
      if (m.alive && m.armed) out.gains.push({ bar: 'armed', day: cur.day, vid: m.vid, name: m.name, kind: 'join-armed', detail: 'new roster member arrived armed' });
      if (m.alive && m.armorP >= ARMOR_P5) out.gains.push({ bar: 'armored', day: cur.day, vid: m.vid, name: m.name, kind: 'join-armored', detail: 'new roster member arrived armored' });
    }
    // Veterans: killers present yesterday, gone today.
    const prevVets = prev.veteransW4 || [];
    const curVets = cur.veteransW4 || [];
    for (const vid of prevVets) {
      if (curVets.indexOf(vid) >= 0) continue;
      const m = memberByVid(prev.members, vid);
      const curM = memberByVid(cur.members, vid);
      if (curM && curM.alive) {
        out.veteranEvents.push({ bar: 'veterans', day: cur.day, vid: vid, name: (m && m.name) || vid, class: 'other', subclass: 'veteran-gone-but-alive-in-roster', detail: 'kill log is append-only: a living roster veteran cannot un-kill; instrument read failure' });
      } else if (!curM) {
        const c = classifyVanished(prev, cur, vid);
        out.veteranEvents.push({ bar: 'veterans', day: cur.day, vid: vid, name: (m && m.name) || vid, class: c.class, subclass: c.subclass, successionTo: c.successionTo || null, detail: 'wave-4+ killer left the roster' });
      } else {
        out.veteranEvents.push({ bar: 'veterans', day: cur.day, vid: vid, name: (m && m.name) || vid, class: 'death', subclass: 'death', detail: 'wave-4+ killer dead but still listed in roster' });
      }
    }
    for (const vid of curVets) {
      if (prevVets.indexOf(vid) < 0) {
        const m = memberByVid(cur.members, vid);
        out.gains.push({ bar: 'veterans', day: cur.day, vid: vid, name: (m && m.name) || vid, kind: 'new-veteran', detail: 'first wave-4+ kill recorded' });
      }
    }
    // Unattributed: drops the member walk did not explain. The net
    // drop is losses minus gains, so a day with simultaneous losses
    // AND gains explains (drop + gains) loss events: 3 deaths and 1
    // armed joiner is a drop of 2 with 3 explained events, not an
    // over-explanation (190391 d75: 3 death losses + 1 join-armed
    // gain = net drop 2; the pre-fix check flagged it).
    const armedGains = out.gains.filter(function (g) { return g.bar === 'armed'; }).length;
    const armoredGains = out.gains.filter(function (g) { return g.bar === 'armored'; }).length;
    const needArmed = prevArmed - curArmed;
    if (needArmed > 0) {
      const explainedNeededArmed = needArmed + armedGains;
      if (explainedArmed < explainedNeededArmed) out.unattributedArmed = explainedNeededArmed - explainedArmed;
      else if (explainedArmed > explainedNeededArmed) out.instrumentErrors.push('over-explained-armed: ' + explainedArmed + ' events for a drop of ' + needArmed + ' (+' + armedGains + ' gains)');
    }
    const needArmored = prevArmored - curArmored;
    if (needArmored > 0) {
      const explainedNeededArmored = needArmored + armoredGains;
      if (explainedArmored < explainedNeededArmored) out.unattributedArmored = explainedNeededArmored - explainedArmored;
      else if (explainedArmored > explainedNeededArmored) out.instrumentErrors.push('over-explained-armored: ' + explainedArmored + ' events for a drop of ' + needArmored + ' (+' + armoredGains + ' gains)');
    }
  } catch (e) { err('diff', e); }
  return out;
}

// findHoldBlocks(gearDaily): pair-hold days (veterans >= 2, peak < 5)
// and deferral-hold days (pair-hold + capped standing >= 200).
// Returns { perDay: [{day, pairHold, deferralHold, ceiling}], blocks: [{startDay, endDay, days}] }
// (blocks are consecutive deferral-hold days; ceiling = roster < 6,
// i.e. the armed demand is unreachable even at a 100% armed rate).
function findHoldBlocks(gearDaily) {
  const perDay = [];
  const blocks = [];
  let cur = null;
  for (const s of (gearDaily || [])) {
    const vets = (s.ready5 && (s.ready5.veterans | 0)) || (s.veterans | 0) || 0;
    const pairHold = vets >= 2 && ((s.peakWave | 0) || 0) < 5;
    const deferralHold = pairHold && ((s.cappedStanding == null ? -1 : s.cappedStanding) >= 200);
    const ceiling = deferralHold && ((s.members || []).filter(function (m) { return m && m.alive; }).length < 6);
    perDay.push({ day: s.day, pairHold: pairHold, deferralHold: deferralHold, ceiling: !!ceiling, rosterSize: (s.members || []).length, armed: s.armed | 0, armored: s.armored | 0, veterans: vets });
    if (deferralHold) {
      if (cur && s.day === cur.endDay + 1) { cur.endDay = s.day; cur.days++; }
      else { cur = { startDay: s.day, endDay: s.day, days: 1 }; blocks.push(cur); }
    } else cur = null;
  }
  return { perDay: perDay, blocks: blocks };
}

module.exports = {
  ARMOR_P5: ARMOR_P5,
  gearSnapshot: gearSnapshot,
  diffGearDays: diffGearDays,
  findHoldBlocks: findHoldBlocks,
  classifyVanished: classifyVanished,
  itemAppearsElsewhere: itemAppearsElsewhere,
  carriesWeaponIds: carriesWeaponIds,
};
