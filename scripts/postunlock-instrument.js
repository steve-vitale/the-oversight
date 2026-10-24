#!/usr/bin/env node
// postunlock-instrument.js — POST-UNLOCK RETENTION autopsy recorder for arm
// sim-postunlock-b2 (flesh-out loop, axis scale-onramp, run
// fleshout-20261024T0615Z). DIAG instrument: ZERO src/js changes, zero
// game-state writes, zero RNG draws. Namespace postunlock-*.
//
// Question (backlog #861): what kills post-unlock villages — the w5 editor?
// w4 congregation reruns? attrition across many small fights?
//
// What it records (per run):
//   t.postunlockDeaths — one row per death tele: day, who, cause, killer
//     monster id/wave (opponent linkage: live-tbfight first, combat-cause-
//     gated same-day combat_start fallback), hp + armor at death, per-person
//     armor/armed/veteran flags, VILLAGE counts (armored/armed/veterans from
//     Game.waveUnlockReady(5) — the same bars the gate reads), overtime tier
//     at death + table/seat state, killing-fight composition (monster pack
//     ids + waves) + rerun flag (tier>0 && wave>=4 at combat start).
//   t.postunlockFights — combat_start rows with pack composition +
//     overtime tier + rerun flag (killing-fight composition source).
//   t.unlock — {w4Day, w5Day} first-hit days via endDay poll of
//     Game.unlockedWave().
//   t.sayRing — last 240 emit() lines (the game's single write path) for
//     sense-testing the killing windows.
//   t.instrumentErrors
//
// Provenance of the patterns (credited, not invented):
//   - death-tele rows, lazy player-repair, combat-cause-gated same-day
//     linkage, hp/armor reads (incl. the scholar-equipped fix):
//     scripts/vetautopsy-instrument.js (2026-10-24)
//   - DISEASE taxonomy copied VERBATIM from
//     scripts/instr-windowstay-20261021.js so channel shares stay
//     comparable across arms
//   - say-ring via emit(): the game itself documents emit(text, surface)
//     as "the single write path — everything routes here" (game.js:43727)
'use strict';

function err(t, where, e) {
  try { t.instrumentErrors.push('postunlock.' + where + ': ' + String((e && e.message) || e)); } catch (e2) {}
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
// scripts/instr-windowstay-20261021.js (2026-10-21). IDENTICAL BY
// CONSTRUCTION so channel shares are comparable across arms.
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

function isCombatCause(cause, Game) {
  const c = String(cause || '');
  if (c === 'combat' || c === 'villager combat' || c.indexOf('split-fight') === 0 ||
      c.indexOf('raid') === 0 || c === 'patrol combat' || c === 'aid-runner' ||
      c === 'sortie combat') return true;
  return monsterNamedInCause(c, Game) != null;
}

// monsterNamedInCause(cause, Game): the game's own cause string names the
// killer monster (e.g. cause 'Choir Toad'). Returns the monster id or null.
function monsterNamedInCause(c, Game) {
  try {
    const m = (Game.data.monsters || []).find(m => m && (m.name === c || m.id === c));
    return m ? String(m.id) : null;
  } catch (e) { return null; }
}

function overtimeTierOf(Game) {
  try { return (typeof Game.overtimeTier === 'function' ? (Game.overtimeTier() | 0) : 0); }
  catch (e) { return -1; }
}

function tableCtxOf(Game) {
  const o = { active: false, tier: -1, tableWaiting: false, tableDone: false, seat: 'unknown' };
  try {
    o.tier = overtimeTierOf(Game);
    if (typeof Game.overtimeActive === 'function') o.active = !!Game.overtimeActive();
  } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    o.tableWaiting = !!pg.tableWaiting; o.tableDone = !!pg.tableDone;
    if (Game.tableSeat) { const s = Game.tableSeat(); o.seat = (s && s.seat) || 'none'; }
  } catch (e) {}
  return o;
}

// Village gate-bar counts at this instant (the same bars the w4/w5 gates
// read — standing.js: waveUnlockReady reads LIVE village state, pure read).
function barCounts(Game) {
  const o = { armored: -1, armed: -1, tricks: -1, veterans: -1 };
  try {
    const r = Game.waveUnlockReady ? Game.waveUnlockReady(5) : null;
    if (r) { o.armored = r.armored | 0; o.armed = r.armed | 0; o.tricks = r.tricks | 0; o.veterans = r.veterans | 0; }
  } catch (e) { o.readErr = String((e && e.message) || e); }
  try { o.roster = ((((Game.state && Game.state.village) || {}).roster) || []).length; } catch (e) { o.roster = -1; }
  return o;
}

// Per-person flags at death (probe: death tele fires BEFORE roster removal,
// so getPerson/state reads are live).
function personFlags(Game, who) {
  const o = { veteran4plus: false, armored: false, armed: false, armor: null, hp: null };
  try {
    const kl = (Game.state && Game.state.waveKillLog) || [];
    for (const e of kl) { if (e && e.by === who && (e.w | 0) >= 4) { o.veteran4plus = true; break; } }
  } catch (e) {}
  try {
    const S = Game.Scattering || globalThis.Scattering || null;
    const EQ = (S && S.equipment) || null;
    const items = (Game.data || {}).items;
    const scholarVid = String((((Game.state || {}).scholar || {}).villagerId) || '');
    let v = null;
    if (who === scholarVid) v = { equipped: (((Game.state || {}).scholar || {}).equipped) || {} };
    else v = (typeof Game.getPerson === 'function') ? Game.getPerson(who) : null;
    if (v && EQ && typeof EQ.armorOf === 'function') {
      o.armor = EQ.armorOf(v, items);
      try {
        const flat = (typeof Game.modTarget === 'function') ? Game.modTarget('armor.flat', 0) : 0;
        if (flat > 0 && o.armor != null) o.armor += flat;
      } catch (e) {}
      o.armored = (o.armor | 0) > 0;
    }
    if (v && EQ) {
      try {
        const eq = v.equipped || {};
        const hasWeaponSlot = !!(eq.weapon || eq.ranged);
        let carried = false;
        const inv = v.inv || v.inventory || [];
        if (Array.isArray(inv)) {
          for (const it of inv) {
            const id = String((it && it.id) || it || '');
            if (/sword|spear|bow|axe|knife|club|rifle|gun|staff|blade/i.test(id)) { carried = true; break; }
          }
        }
        o.armed = hasWeaponSlot || carried;
      } catch (e) {}
    }
  } catch (e) {}
  try {
    const scholarVid = String((((Game.state || {}).scholar || {}).villagerId) || '');
    if (who === scholarVid) {
      const h = Game.state && Game.state.scholar && Game.state.scholar.health;
      o.hp = (h != null ? h : null);
    } else {
      const vh = (Game.state && Game.state.village && Game.state.village.health) || {};
      o.hp = (vh[who] !== undefined ? vh[who] : 100);
    }
  } catch (e) {}
  return o;
}

function install(Game, t) {
  if (!Array.isArray(t.postunlockDeaths)) t.postunlockDeaths = [];
  if (!Array.isArray(t.postunlockFights)) t.postunlockFights = [];
  if (!Array.isArray(t.sayRing)) t.sayRing = [];
  if (!Array.isArray(t.instrumentErrors)) t.instrumentErrors = [];
  if (!t.unlock) t.unlock = { w4Day: null, w5Day: null };
  const uninstalls = [];
  // Narration liveness: the harness stubs G.say/G.sysSay to no-ops unless
  // loadGame({narration:true}). sayRing only fills when narration is live.
  try {
    t.sayLive = String(Game.say).replace(/\s+/g, '') !== 'function(){}';
  } catch (e) { t.sayLive = false; }

  // -- 1. say-ring: the transcript tap (emit is the game's single write path) --
  try {
    if (typeof Game.emit === 'function') {
      const oEmit = Game.emit.bind(Game);
      Game.emit = function (text, surface) {
        const r = oEmit.apply(this, arguments);
        try {
          t.sayRing.push({ day: gday(Game), surface: surface != null ? String(surface) : null, text: String(text).slice(0, 400) });
          if (t.sayRing.length > 240) t.sayRing.splice(0, t.sayRing.length - 240);
        } catch (e) { err(t, 'sayRing', e); }
        return r;
      };
      uninstalls.push(() => { try { Game.emit = oEmit; } catch (e) {} });
    } else { err(t, 'install.missing:emit', new Error('not a function')); }
  } catch (e) { err(t, 'emit.wrap', e); }

  // -- 2b. aidFight wrap: aid-crisis fights never fire combat_start, so
  // without this their deaths are unlinkable (the vetautopsy pattern).
  try {
    const oAid = Game.aidFight;
    if (typeof oAid === 'function') {
      Game.aidFight = function (vid, mdef) {
        try {
          const mid = mdef && mdef.id != null ? String(mdef.id) : null;
          const wave = mdef && mdef.wave != null ? (mdef.wave | 0) : waveOf(Game, mid);
          const tier = overtimeTierOf(Game);
          t.postunlockFights.push({
            day: gday(Game), mid, wave, via: 'aidFight',
            party: vid != null ? [String(vid)] : [], scholarIn: false,
            monsterIds: mid ? [mid] : [], monsterWaves: mid ? [waveOf(Game, mid)] : [],
            overtimeTier: tier, rerun: tier > 0 && wave >= 4,
          });
        } catch (e) { err(t, 'aidFight.rec', e); }
        return oAid.apply(this, arguments);
      };
      uninstalls.push(() => { try { Game.aidFight = oAid; } catch (e) {} });
    } else { err(t, 'install.missing:aidFight', new Error('not a function')); }
  } catch (e) { err(t, 'aidFight.wrap', e); }

  // -- 2. tele wrap: combat_start fight rows + death rows --
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'combat_start' && data) {
          const party = [];
          const monsterIds = [];
          let scholarIn = false;
          try {
            for (const f of (((Game.tbfight || {}).fighters) || [])) {
              if (f && f.kind === 'villager' && f.villagerId) party.push(String(f.villagerId));
              if (f && f.kind === 'player') scholarIn = true;
              if (f && f.kind === 'monster' && f.monsterId && !f.fled) monsterIds.push(String(f.monsterId));
            }
          } catch (e) {}
          const mid = data.vs != null ? String(data.vs) : null;
          const wave = data.wave != null ? (data.wave | 0) : waveOf(Game, mid);
          const tier = overtimeTierOf(Game);
          t.postunlockFights.push({
            day: gday(Game), mid, wave, via: 'combat_start', party, scholarIn,
            monsterIds, monsterWaves: monsterIds.map(m => waveOf(Game, m)),
            overtimeTier: tier, rerun: tier > 0 && wave >= 4,
          });
        }
        if (type === 'death' && data) {
          const who = data.who != null ? String(data.who) : null;
          const day = gday(Game);
          const scholarVid = String((((Game.state || {}).scholar || {}).villagerId) || '');
          // Opponent: live-tbfight first (monster fighters at tele time).
          let oppMid = null, oppWave = null, basis = 'none';
          const party = [];
          let scholarIn = false;
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
          // Killing-fight composition: most recent same-day combat_start row,
          // combat-cause gated (the mantlechain pattern from vetautopsy).
          // Fallback: the most recent fight within the last 3 days (a death
          // tele can fire after combat_start when the killing blow lands
          // across the day boundary). fightLink names which basis won.
          let fight = null, fightLink = null;
          const combat = isCombatCause(data.cause, Game);
          if (combat) {
            try {
              for (let i = t.postunlockFights.length - 1; i >= 0; i--) {
                if (t.postunlockFights[i].day === day) { fight = t.postunlockFights[i]; fightLink = 'same-day:combat_start'; break; }
              }
              if (!fight) {
                for (let i = t.postunlockFights.length - 1; i >= 0; i--) {
                  const fd = t.postunlockFights[i].day | 0;
                  if (fd <= day && day - fd <= 3) { fight = t.postunlockFights[i]; fightLink = 'prior3d:combat_start'; break; }
                }
              }
            } catch (e) {}
          }
          if (!oppMid && fight) { oppMid = fight.mid; oppWave = fight.wave; basis = fightLink; }
          // Cause-names-monster: the game's own cause string IS the killer
          // (e.g. cause 'Choir Toad' with no combat_start tele — a kill
          // resolved outside the turn-based fight path).
          if (!oppMid && combat) {
            try {
              const named = monsterNamedInCause(data.cause, Game);
              if (named) { oppMid = named; oppWave = waveOf(Game, named); basis = 'cause-names-monster'; }
            } catch (e) {}
          }
          // Nearest-fight info (always recorded for combat-cause deaths): the
          // most recent fight row at or before the death day. When no fight
          // links, this documents the honest limit (e.g. a lingering-wound
          // tick days after the last fight) instead of leaving the row
          // silently unattributed.
          let nearestFight = null;
          if (combat) {
            try {
              for (let i = t.postunlockFights.length - 1; i >= 0; i--) {
                const f = t.postunlockFights[i];
                const fd = f.day | 0;
                if (fd <= day) {
                  nearestFight = {
                    day: fd, mid: f.mid, wave: f.wave, via: f.via,
                    dayDistance: day - fd, overtimeTier: f.overtimeTier, rerun: f.rerun,
                  };
                  break;
                }
              }
            } catch (e) {}
          }
          const dis = diseaseInfo(data.cause);
          const pf = personFlags(Game, who);
          const row = {
            day, who, whoName: nameOf(Game, who),
            kind: data.kind != null ? String(data.kind) : null,
            cause: data.cause != null ? String(data.cause) : 'unknown',
            wave: data.wave != null ? (data.wave | 0) : null,
            person: !!(data && (data.player || data.kind === 'person' || data.kind === 'villager' || data.kind === 'scholar' || data.kind == null)),
            combatCause: combat,
            disease: dis.disease, diseasePool: dis.pool, diseaseId: dis.id,
            hp: pf.hp, armor: pf.armor, armored: pf.armored, armed: pf.armed,
            veteran4plus: pf.veteran4plus,
            oppMid, oppWave, fightBasis: basis, nearestFight,
            fight: fight ? {
              monsterIds: fight.monsterIds.slice(), monsterWaves: fight.monsterWaves.slice(),
              party: fight.party.slice(), scholarIn: fight.scholarIn,
              overtimeTier: fight.overtimeTier, rerun: fight.rerun,
            } : null,
            village: barCounts(Game),
            overtime: tableCtxOf(Game),
          };
          // TELEFLAG race: read player LAZILY off the tele record (the
          // registerDeath repair can land after the fire).
          try {
            const tel = (Game.state && Game.state.telemetry) || [];
            const rec = tel.length ? tel[tel.length - 1] : null;
            if (rec && rec.type === 'death' && String(rec.who) === String(who)) {
              Object.defineProperty(row, 'player', {
                enumerable: true, configurable: true,
                get: function () { return !!rec.player; },
              });
            } else {
              row.player = !!(data && data.player);
            }
          } catch (e) { row.player = !!(data && data.player); }
          t.postunlockDeaths.push(row);
        }
      } catch (e) { err(t, 'tele.rec', e); }
      return r;
    };
    uninstalls.push(() => { try { Game.tele = oTele; } catch (e) {} });
  } catch (e) { err(t, 'tele.wrap', e); }

  // -- 3. endDay wrap: first-hit unlock days (pure poll of unlockedWave) --
  try {
    const oEndDay = Game.endDay;
    if (typeof oEndDay === 'function') {
      Game.endDay = function () {
        const r = oEndDay.apply(this, arguments);
        try {
          if (typeof Game.unlockedWave === 'function') {
            const uw = Game.unlockedWave() | 0;
            if (t.unlock.w4Day == null && uw >= 4) t.unlock.w4Day = gday(Game);
            if (t.unlock.w5Day == null && uw >= 5) t.unlock.w5Day = gday(Game);
          }
        } catch (e) { err(t, 'unlock.poll', e); }
        return r;
      };
      uninstalls.push(() => { try { Game.endDay = oEndDay; } catch (e) {} });
    } else { err(t, 'install.missing:endDay', new Error('not a function')); }
  } catch (e) { err(t, 'endDay.wrap', e); }

  return function uninstallPostunlock() {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
  };
}

module.exports = { install, isCombatCause, diseaseInfo, waveOf, gday, nameOf, overtimeTierOf, tableCtxOf, barCounts };
