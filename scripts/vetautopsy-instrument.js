#!/usr/bin/env node
// vetautopsy-instrument.js — DEATH-ROW RECORDER for arm sim-vetautopsy
// (flesh-out loop, axis scale-onramp, run fleshout-20261024T0446Z).
// DIAG instrument: ZERO src/js changes, zero game-state writes, zero RNG
// draws. Namespace vetautopsy-*.
//
// What it records (per run):
//   t.deathRows     — one row per death tele: day, who, kind, cause, wave
//                     (killer monster's wave, corpses.js), player flag
//                     (lazy-repaired, the mantlechain pattern), hp + armor
//                     at death, village context at death, opponent linkage
//                     (live-tbfight first, combat-cause-gated same-day
//                     fallback), isCombatCause (needs Game, computed live).
//   t.fights        — combat_start rows (ALL waves, for opponent
//                     attribution) + aidFight rows, with party vids.
//   t.successions   — mantleBecome rows: day, old→new, trust, veteran-at-pick.
//   t.instrumentErrors
//
// Provenance of the patterns (credited, not invented):
//   - lazy player-repair + combat-cause-gated same-day linkage:
//     scripts/mantlechain-instr-20261022.js
//   - ctx capture (aid/atHaven/inTb/router/onExped) + stateSnap:
//     scripts/instr-windowstay-20261021.js (DISEASE taxonomy copied VERBATIM
//     so channel shares stay comparable across arms)
//   - death-time readability: probed 2026-10-24 (scripts/vetautopsy-probe.js):
//     the death tele fires BEFORE roster removal — getPerson(who) is live
//     (18/18 villager deaths), armor via S.equipment.armorOf, hp via
//     state.village.health[vid] ?? 100 (villagers) / state.scholar.health
//     (scholar). Villager person records carry no hp field — not invented.
//
// install(Game, t) returns an uninstall function. The sweep drives it.
'use strict';

function err(t, where, e) {
  try { t.instrumentErrors.push('vetautopsy.' + where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}
function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day) | 0 || 0; } catch (e) { return 0; }
}
function nameOf(Game, vid) {
  try {
    const def = ((Game.data || {}).villagers || []).find(x => x && x.id === vid);
    if (def && def.name) return String(def.name).split(' ')[0];
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}
function waveOf(Game, mid) {
  try {
    const md = ((Game.data || {}).monsters || []).find(x => x && x.id === mid);
    return (md && (md.wave | 0)) || null;
  } catch (e) { return null; }
}

// DISEASE taxonomy — copied VERBATIM from
// scripts/instr-windowstay-20261021.js (2026-10-21, itself verbatim from
// scripts/probe-windowsurvive-20261019.js). IDENTICAL BY CONSTRUCTION so
// channel shares are comparable across arms. Pools: mundane + alien.
const DISEASE_IDS = new Set(['gutrot', 'trichinosis', 'disease', 'lockjaw', 'wound_fever', 'trembles',
  'howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind',
  'eurika', 'east_nile', 'lemons']);
const DISEASE_RES = [/^sickness$/i, /food poisoning|bad belly|spoiled gut|poisoned/i,
  /^(wound fever|gut rot|tick fever)$/i];
const ALIEN_POOL = new Set(['eurika', 'east_nile', 'lemons']);
function diseaseInfo(causeRaw) {
  const cause = String(causeRaw == null ? 'unknown' : causeRaw);
  const lc = cause.toLowerCase();
  if (DISEASE_IDS.has(lc) || DISEASE_RES.some(re => re.test(cause))) {
    return { disease: true, pool: ALIEN_POOL.has(lc) ? 'alien' : 'mundane', id: lc };
  }
  return { disease: false, pool: null, id: null };
}

// isCombatCause(cause, Game): which death causes count as "died in a fight".
// The monster-name check needs Game — computed LIVE in the instrument.
function isCombatCause(cause, Game) {
  const c = String(cause || '');
  if (c === 'combat' || c === 'villager combat' || c.indexOf('split-fight') === 0 ||
      c.indexOf('raid') === 0 || c === 'patrol combat' || c === 'aid-runner' ||
      c === 'sortie combat') return true;
  try {
    if ((Game.data.monsters || []).some(m => m && (m.name === c || m.id === c))) return true;
  } catch (e) {}
  return false;
}

function isPersonKind(kind, player) {
  return !!(player || kind === 'person' || kind === 'villager' || kind === 'scholar' || kind == null);
}

// villageCtx(Game): village context at a death. PURE reads (extends the
// windowstay stateSnap with scaleRank + unlockedWave for the autopsy).
function villageCtx(Game) {
  const s = {};
  try { s.pantry = Math.round(Game.pantryKcalLive ? Game.pantryKcalLive(Game.state.village) : -1); }
  catch (e) { s.pantry = -1; }
  try { const pg = Game.progState ? Game.progState() : null; s.hungryStreak = (pg && (pg.hungryStreak | 0)) || 0; } catch (e) { s.hungryStreak = -1; }
  try { s.scaleRank = Game.scaleRank ? (Game.scaleRank() || null) : null; } catch (e) { s.scaleRank = null; }
  try { s.unlockedWave = Game.unlockedWave ? (Game.unlockedWave() | 0) : null; } catch (e) { s.unlockedWave = null; }
  s.national = (s.scaleRank === 'national' || s.scaleRank === 'global') ? 1 : 0;
  s.w5live = (s.unlockedWave != null && s.unlockedWave >= 5) ? 1 : 0;
  try {
    const r5 = Game.waveUnlockReady ? Game.waveUnlockReady(5) : null;
    if (r5) { s.armored = r5.armored | 0; s.armed = r5.armed | 0; s.vets = r5.veterans | 0; s.tricks = r5.tricks | 0; s.short = (r5.short || []).slice(); s.rdy = !!r5.ready; }
    else { s.armored = -1; s.armed = -1; s.vets = -1; s.tricks = -1; s.short = ['no-read']; s.rdy = false; }
  } catch (e) { s.armored = -1; s.armed = -1; s.vets = -1; s.tricks = -1; s.short = ['read-error']; s.rdy = false; }
  try {
    const vs = Game.villageStanding ? Game.villageStanding() : {};
    s.raw = (vs.total | 0) || 0; s.war = (vs.war | 0) || 0; s.dip = (vs.diplomacy | 0) || 0; s.plenty = (vs.plenty | 0) || 0;
  } catch (e) { s.raw = -1; s.war = -1; s.dip = -1; s.plenty = -1; }
  try { s.cap = Game.standingPlentyCappedTotal ? (Game.standingPlentyCappedTotal() | 0) : -1; } catch (e) { s.cap = -1; }
  try { s.roster = ((((Game.state && Game.state.village) || {}).roster) || []).length; } catch (e) { s.roster = -1; }
  try { s.scholarAlive = !!(Game.state && Game.state.scholar && !Game.state.scholar.dead); } catch (e) { s.scholarAlive = false; }
  return s;
}

function install(Game, t) {
  if (!Array.isArray(t.deathRows)) t.deathRows = [];
  if (!Array.isArray(t.fights)) t.fights = [];
  if (!Array.isArray(t.successions)) t.successions = [];
  if (!Array.isArray(t.instrumentErrors)) t.instrumentErrors = [];
  const uninstalls = [];
  let router = null;

  try { t.initialScholarVid = String((((Game.state || {}).scholar || {}).villagerId) || ''); }
  catch (e) { t.initialScholarVid = ''; }

  // -- 1. Succession events (the mantlechain pattern) --
  try {
    const omb = typeof Game.mantleBecome === 'function' ? Game.mantleBecome.bind(Game) : null;
    Game.mantleBecome = function (oldId, newId) {
      let r;
      try { r = omb ? omb.apply(this, arguments) : undefined; }
      catch (e) { err(t, 'mantleBecome-fwd', e); throw e; }
      try {
        const v = Game.state.village || {};
        const trust = ((v.trust || {})[newId]) || 0;
        const ch = ((Game.data || {}).villagers || []).find(x => x && x.id === newId) || {};
        let w4k = 0, anyK = 0;
        try {
          for (const e of (Game.state.waveKillLog || [])) {
            if (!e || e.by !== newId) continue;
            anyK++;
            if ((e.w | 0) >= 4) w4k++;
          }
        } catch (e) {}
        t.successions.push({
          day: gday(Game), oldId: oldId != null ? String(oldId) : null,
          newId: newId != null ? String(newId) : null,
          oldName: nameOf(Game, oldId), newName: nameOf(Game, newId),
          trust: trust | 0, occupationId: ch.occupationId || null,
          wave4plusKillsAtPick: w4k, anyWaveKillsAtPick: anyK,
        });
      } catch (e) { err(t, 'succ-row', e); }
      return r;
    };
    uninstalls.push(() => { try { if (omb) Game.mantleBecome = omb; } catch (e) {} });
  } catch (e) { err(t, 'mantleBecome.wrap', e); }

  // -- 2. Router wraps (windowstay pattern) for the patrol/wild sub-channel --
  const wrapRouter = (name, flag, midOf) => {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { err(t, 'install.missing:' + name, new Error('not a function')); return; }
      Game[name] = function (...args) {
        const prev = router;
        router = flag;
        try { return orig.apply(this, args); }
        finally { router = prev; }
      };
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { err(t, 'wrapRouter.' + name, e); }
  };
  wrapRouter('resolvePatrol', 'patrol');
  wrapRouter('resolveWildMonsterEncounter', 'wild');

  // -- 3. aidFight wrap (windowstay pattern): aid fights get a fight row --
  try {
    const oAid = Game.aidFight;
    if (typeof oAid === 'function') {
      Game.aidFight = function (vid, mdef) {
        try {
          t.fights.push({
            day: gday(Game), mid: mdef && mdef.id != null ? String(mdef.id) : null,
            wave: mdef && mdef.wave != null ? (mdef.wave | 0) : waveOf(Game, mdef && mdef.id),
            via: 'aidFight', party: vid != null ? [String(vid)] : [], scholarIn: false,
          });
        } catch (e) { err(t, 'aidFight.rec', e); }
        return oAid.apply(this, arguments);
      };
      uninstalls.push(() => { try { Game.aidFight = oAid; } catch (e) {} });
    } else { err(t, 'install.missing:aidFight', new Error('not a function')); }
  } catch (e) { err(t, 'aidFight.wrap', e); }

  // -- 4. tele wrap: combat_start rows + death rows --
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'combat_start' && data) {
          const party = [];
          let scholarIn = false;
          try {
            for (const f of (((Game.tbfight || {}).fighters) || [])) {
              if (f && f.kind === 'villager' && f.villagerId) party.push(String(f.villagerId));
              if (f && f.kind === 'player') scholarIn = true;
            }
          } catch (e) {}
          const mid = data.vs != null ? String(data.vs) : null;
          t.fights.push({
            day: gday(Game), mid,
            wave: data.wave != null ? (data.wave | 0) : waveOf(Game, mid),
            via: 'combat_start', party, scholarIn,
          });
        }
        if (type === 'death' && data) {
          const who = data.who != null ? String(data.who) : null;
          const day = gday(Game);
          const scholarVid = String((((Game.state || {}).scholar || {}).villagerId) || '');
          // Opponent: live-tbfight first (monster fighters at tele time).
          let oppMid = null, oppWave = null, basis = 'none', scholarIn = false;
          const party = [];
          try {
            const tf = Game.tbfight;
            if (tf && !tf.over && Array.isArray(tf.fighters)) {
              for (const f of tf.fighters) {
                if (f && f.kind === 'monster' && f.monsterId && !f.fled) oppMid = String(f.monsterId);
                if (f && f.kind === 'player') scholarIn = true;
                if (f && f.kind === 'villager' && f.villagerId) party.push(String(f.villagerId));
              }
              if (oppMid) { oppWave = waveOf(Game, oppMid); basis = 'live-tbfight'; }
            }
          } catch (e) {}
          // same-day fallback, combat-cause gated (mantlechain pattern).
          const combat = isCombatCause(data.cause, Game);
          if (!oppMid && combat) {
            try {
              for (let i = t.fights.length - 1; i >= 0; i--) {
                if (t.fights[i].day === day) {
                  oppMid = t.fights[i].mid; oppWave = t.fights[i].wave;
                  basis = 'same-day:' + (t.fights[i].via || '?');
                  break;
                }
              }
            } catch (e) {}
          }
          // hp + armor at death (probe-verified readable at tele time).
          // ARMOR PATHS (fixed 2026-10-24): villagers wear armorOf(getPerson
          // .equipped); the SCHOLAR's armor lives on state.scholar.equipped
          // (game.js armorBonus() reads there — the person record's equipped
          // is EMPTY for the scholar, so armorOf(getPerson()) misreads 0).
          // armorBonus() itself is NOT called: it runs migrateEquipment (a
          // write). The read below replicates its pure part: armorOf on a
          // villager-shaped view + the armor.flat modifier (pure read).
          let hp = null, hpSource = null, armor = null, armorSource = null, equippedKeys = null;
          try {
            const isScholar = who === scholarVid;
            if (isScholar) {
              const h = Game.state && Game.state.scholar && Game.state.scholar.health;
              hp = (h != null ? h : null); hpSource = h != null ? 'scholar.health' : 'scholar-missing';
            } else {
              const vh = (Game.state && Game.state.village && Game.state.village.health) || {};
              hp = (vh[who] !== undefined ? vh[who] : 100); hpSource = (vh[who] !== undefined ? 'village.health' : 'default-100');
            }
          } catch (e) { hpSource = 'read-error'; }
          try {
            const S = Game.Scattering || globalThis.Scattering || null;
            const EQ = (S && S.equipment) || null;
            const items = (Game.data || {}).items;
            if (who === scholarVid) {
              const sch = (Game.state && Game.state.scholar) || {};
              const v = { equipped: sch.equipped || {} };
              armor = (EQ && typeof EQ.armorOf === 'function') ? EQ.armorOf(v, items) : null;
              try {
                const flat = (typeof Game.modTarget === 'function') ? Game.modTarget('armor.flat', 0) : 0;
                if (flat > 0 && armor != null) armor += flat;
              } catch (e) {}
              equippedKeys = sch.equipped ? Object.keys(sch.equipped) : [];
              armorSource = 'scholar.equipped+flat';
            } else {
              const person = (typeof Game.getPerson === 'function') ? Game.getPerson(who) : null;
              if (person) {
                armor = (EQ && typeof EQ.armorOf === 'function') ? EQ.armorOf(person, items) : null;
                equippedKeys = person.equipped ? Object.keys(person.equipped) : null;
              }
              armorSource = 'person.equipped';
            }
          } catch (e) { armor = null; }
          const ctx = { aid: false, atHaven: false, inTb: false, router: router || null, onExped: false };
          try { ctx.aid = !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) {}
          try { ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
          try { ctx.inTb = !!Game.tbfight; } catch (e) {}
          try {
            const st = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
            ctx.onExped = !!(st && st.exped && who && st.exped[who]);
          } catch (e) {}
          const dis = diseaseInfo(data.cause);
          const row = {
            day, who, whoName: nameOf(Game, who),
            kind: data.kind != null ? String(data.kind) : null,
            cause: data.cause != null ? String(data.cause) : 'unknown',
            wave: data.wave != null ? (data.wave | 0) : null, // killer monster's wave (corpses.js)
            scholarVidAtDeath: scholarVid,
            person: isPersonKind(data.kind, data && data.player),
            combatCause: combat,
            disease: dis.disease, diseasePool: dis.pool, diseaseId: dis.id,
            hp, hpSource, armor, armorSource, equippedKeys,
            oppMid, oppWave, fightBasis: basis, scholarInFight: scholarIn, fightParty: party,
            ctx, village: villageCtx(Game),
          };
          // TELEFLAG race (mantlechain pattern): a villager-death path can
          // fire the death tele before playerDeath repairs player:true on
          // the live tele record. Read player LAZILY — the getter evaluates
          // at JSON.stringify time (post-run), when the repair has landed.
          try {
            const tel = (Game.state && Game.state.telemetry) || [];
            const rec = tel.length ? tel[tel.length - 1] : null;
            if (rec && rec.type === 'death' && String(rec.who) === String(data && data.who)) {
              Object.defineProperty(row, 'player', {
                enumerable: true, configurable: true,
                get: function () { return !!rec.player; },
              });
            } else {
              row.player = !!(data && data.player);
            }
          } catch (e) { row.player = !!(data && data.player); }
          t.deathRows.push(row);
        }
      } catch (e) { err(t, 'tele.rec', e); }
      return r;
    };
    uninstalls.push(() => { try { Game.tele = oTele; } catch (e) {} });
  } catch (e) { err(t, 'tele.wrap', e); }

  return function uninstallVetautopsy() {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
  };
}

module.exports = { install, isCombatCause, diseaseInfo, villageCtx, waveOf, gday, nameOf };
