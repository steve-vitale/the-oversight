#!/usr/bin/env node
// vetaidcrisis-instrument.js — AID-CRISIS HAVEN-DEFENSE CHANNEL instrument
// (flesh-out loop arm sim-aidcrisis-b, axis scale-onramp, run
// fleshout-20261024T0615Z). DIAG arm: instrument-side, ZERO src/js changes.
// Namespace vetaidcrisis-*.
//
// Decomposes the aid-crisis haven-defense channel from findings-backlog #866:
// is the chair's lethality an EXPOSURE problem (crisis draws the scholar into
// the contact channel) or a SUCCESSION-TIMING problem (fresh scholars die)?
//
//   t.crisisEvents — raised/resolved rows: day, name, kind, wave, how.
//   t.fights        — combat_start + aidFight rows with a live crisis ctx:
//                     crisisActive, crisisName, crisisKind, crisisWave,
//                     atHaven, inTb, router, onExped, party, scholarIn, wave, mid.
//   t.deaths        — death rows with ctx.aid at death, scholar-vs-companion,
//                     tenure (days since last succession), blood-tenure (days
//                     since first wave-4+ kill), opp mid/wave, fightBasis.
//   t.successions   — mantleBecome rows (day, old->new, picked-successor flag).
//
// RNG-neutral, zero writes (reads + rows only), matching the windowstay
// patterns of vetautopsy-instrument.js.
'use strict';

function err(t, where, e) {
  try {
    t.instrumentErrors.push(where + ': ' + String((e && e.message) || e));
  } catch (e2) {}
}
function gday(Game) {
  try { return (Game.state && Game.state.scholar && Game.state.scholar.day) | 0; }
  catch (e) { return -1; }
}
function nameOf(Game, vid) {
  try { return Game.displayName ? Game.displayName(vid) : String(vid); }
  catch (e) { return String(vid); }
}
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(x => x && (x.id === mid || x.name === mid));
    return m && m.wave != null ? (m.wave | 0) : null;
  } catch (e) { return null; }
}
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
function crisisSnap(Game) {
  const s = { crisisActive: false, crisisName: null, crisisKind: null, crisisWave: null,
              crisisRaiders: false, crisisSinceDay: null };
  try {
    const c = Game.aidCrisis ? Game.aidCrisis() : null;
    if (c) {
      s.crisisActive = true;
      s.crisisName = c.name || null;
      s.crisisKind = c.raiders ? 'raid' : (c.kind || 'monster');
      s.crisisWave = c.wave != null ? (c.wave | 0) : null;
      s.crisisRaiders = !!c.raiders;
      s.crisisSinceDay = c.sinceDay != null ? (c.sinceDay | 0) : null;
    }
  } catch (e) {}
  return s;
}
function install(Game, t) {
  if (!Array.isArray(t.crisisEvents)) t.crisisEvents = [];
  if (!Array.isArray(t.fights)) t.fights = [];
  if (!Array.isArray(t.fightEnds)) t.fightEnds = [];
  if (!Array.isArray(t.deaths)) t.deaths = [];
  if (!Array.isArray(t.successions)) t.successions = [];
  if (!Array.isArray(t.instrumentErrors)) t.instrumentErrors = [];
  const uninstalls = [];
  let router = null;
  let seq = 0; // tele-order sequence shared by fights, ends, deaths
  try { t.initialScholarVid = String((((Game.state || {}).scholar || {}).villagerId) || ''); }
  catch (e) { t.initialScholarVid = ''; }

  // -- 1. Succession events (mantlechain pattern) --
  try {
    const omb = typeof Game.mantleBecome === 'function' ? Game.mantleBecome.bind(Game) : null;
    Game.mantleBecome = function (oldId, newId) {
      let r;
      try { r = omb ? omb.apply(this, arguments) : undefined; }
      catch (e) { err(t, 'mantleBecome-fwd', e); throw e; }
      try {
        t.successions.push({
          day: gday(Game),
          oldId: oldId != null ? String(oldId) : null,
          newId: newId != null ? String(newId) : null,
        });
      } catch (e) { err(t, 'succ-row', e); }
      return r;
    };
    uninstalls.push(() => { try { if (omb) Game.mantleBecome = omb; } catch (e) {} });
  } catch (e) { err(t, 'mantleBecome.wrap', e); }

  // -- 2. Router wraps (windowstay pattern) for patrol/wild sub-channel --
  const wrapRouter = (name, flag) => {
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

  // -- 3. Crisis raise/resolve wraps: the crisis TIMELINE --
  try {
    const oRaise = Game.raiseAidCrisis ? Game.raiseAidCrisis.bind(Game) : null;
    if (typeof oRaise === 'function') {
      Game.raiseAidCrisis = function (name, wave) {
        const day = gday(Game);
        let r;
        try { r = oRaise.apply(this, arguments); }
        catch (e) { err(t, 'raiseAidCrisis-fwd', e); throw e; }
        try {
          const c = Game.aidCrisis ? Game.aidCrisis() : null;
          t.crisisEvents.push({
            day, event: 'raised', name: c && c.name ? String(c.name) : (name != null ? String(name) : null),
            kind: c ? (c.raiders ? 'raid' : (c.kind || 'monster')) : 'monster',
            wave: c && c.wave != null ? (c.wave | 0) : (wave != null ? (wave | 0) : null),
            how: null, raisedOk: !!c,
          });
        } catch (e) { err(t, 'raise-row', e); }
        return r;
      };
      uninstalls.push(() => { try { if (oRaise) Game.raiseAidCrisis = oRaise; } catch (e) {} });
    } else { err(t, 'install.missing:raiseAidCrisis', new Error('not a function')); }
  } catch (e) { err(t, 'raiseAidCrisis.wrap', e); }
  try {
    const oResolve = Game.resolveAidCrisis ? Game.resolveAidCrisis.bind(Game) : null;
    if (typeof oResolve === 'function') {
      Game.resolveAidCrisis = function (how) {
        const day = gday(Game);
        // Read the crisis BEFORE resolve nulls it (pure read).
        let pre = null;
        try { pre = Game.aidCrisis ? Game.aidCrisis() : null; } catch (e) {}
        const preSnap = pre ? { name: String(pre.name || ''), kind: pre.raiders ? 'raid' : (pre.kind || 'monster'),
          wave: pre.wave != null ? (pre.wave | 0) : null, sinceDay: pre.sinceDay != null ? (pre.sinceDay | 0) : null,
          attracted: pre.attracted | 0, helped: (pre.helpAtDoor || []).length } : null;
        let r;
        try { r = oResolve.apply(this, arguments); }
        catch (e) { err(t, 'resolveAidCrisis-fwd', e); throw e; }
        try {
          if (preSnap) {
            t.crisisEvents.push({
              day, event: 'resolved', name: preSnap.name, kind: preSnap.kind, wave: preSnap.wave,
              how: how != null ? String(how) : null, attracted: preSnap.attracted,
              helpAtDoor: preSnap.helped, crisisDays: preSnap.sinceDay != null ? (day - preSnap.sinceDay) : null,
            });
          }
        } catch (e) { err(t, 'resolve-row', e); }
        return r;
      };
      uninstalls.push(() => { try { if (oResolve) Game.resolveAidCrisis = oResolve; } catch (e) {} });
    } else { err(t, 'install.missing:resolveAidCrisis', new Error('not a function')); }
  } catch (e) { err(t, 'resolveAidCrisis.wrap', e); }

  // -- 4. Fight rows: combat_start + aidFight, with live crisis ctx --
  function fightCtx() {
    const cs = crisisSnap(Game);
    cs.atHaven = false; cs.inTb = false; cs.router = router; cs.onExped = false;
    try { cs.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
    try { cs.inTb = !!Game.tbfight; } catch (e) {}
    try {
      const st = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
      cs.onExped = !!(st && st.exped);
    } catch (e) {}
    return cs;
  }
  try {
    const oAid = Game.aidFight;
    if (typeof oAid === 'function') {
      Game.aidFight = function (vid, mdef) {
        try {
          // mdef is a monster DEF object (comms.js aidFight(vid, mdef, m, opts)),
          // not a string id — match the vetautopsy recording: id + wave off the def.
          t.fights.push(Object.assign({
            seq: seq++,
            day: gday(Game), mid: mdef && mdef.id != null ? String(mdef.id) : null,
            wave: mdef && mdef.wave != null ? (mdef.wave | 0) : waveOf(Game, mdef && mdef.id),
            via: 'aidFight',
            party: vid != null ? [String(vid)] : [],
            scholarIn: false, // aidFight = arrived ALLY combatants (comms.js), not the scholar
          }, fightCtx()));
        } catch (e) { err(t, 'aidFight.rec', e); }
        return oAid.apply(this, arguments);
      };
      uninstalls.push(() => { try { Game.aidFight = oAid; } catch (e) {} });
    } else { err(t, 'install.missing:aidFight', new Error('not a function')); }
  } catch (e) { err(t, 'aidFight.wrap', e); }

  // -- 5. tele wrap: combat_start rows (crisis-tagged) + death rows --
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
          t.fights.push(Object.assign({
            seq: seq++,
            day: gday(Game), mid,
            wave: data.wave != null ? (data.wave | 0) : waveOf(Game, mid),
            via: 'combat_start', party, scholarIn,
          }, fightCtx()));
        }
        // combat_end: the exact attribution anchor. A scholar combat death
        // is attributed to the fight whose combat_end (same day, scholarIn
        // start) carries result='lost' (or php<=0) nearest-before the death
        // tele — no same-day guessing.
        if (type === 'combat_end' && data) {
          try {
            // Pair with the most recent combat_start (the fight that ended).
            let start = null;
            for (let i = t.fights.length - 1; i >= 0; i--) {
              if (t.fights[i].via === 'combat_start' || t.fights[i].via === 'aidFight') { start = t.fights[i]; break; }
            }
            t.fightEnds.push(Object.assign({
              seq: seq++,
              day: gday(Game),
              result: data.result != null ? String(data.result) : null,
              php: data.php != null ? Math.round(data.php) : null,
              mid: start ? start.mid : null,
              wave: start ? start.wave : null,
              via: start ? start.via : null,
              scholarIn: start ? !!start.scholarIn : false,
              party: start ? (start.party || []).slice() : [],
            }, fightCtx()));
          } catch (e) { err(t, 'combat_end.rec', e); }
        }
        if (type === 'death' && data) {
          const who = data.who != null ? String(data.who) : null;
          const day = gday(Game);
          const scholarVid = String((((Game.state || {}).scholar || {}).villagerId) || '');
          const isScholar = who === scholarVid;
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
          // Tenure: days since this vid became scholar (last succession to them),
          // and days since their first wave-4+ kill (blood-tenure).
          let tenureDays = null;
          try {
            for (let i = t.successions.length - 1; i >= 0; i--) {
              if (t.successions[i].newId === who) { tenureDays = day - t.successions[i].day; break; }
            }
          } catch (e) {}
          let bloodTenure = null;
          try {
            for (const e of (Game.state.waveKillLog || [])) {
              if (e && e.by === who && (e.w | 0) >= 4) {
                bloodTenure = bloodTenure == null ? (day - ((e.d | 0))) : Math.min(bloodTenure, day - (e.d | 0));
              }
            }
          } catch (e) {}
          const crisis = crisisSnap(Game);
          t.deaths.push({
            seq: seq++,
            day, who, whoName: nameOf(Game, who), isScholar,
            cause: data.cause != null ? String(data.cause) : 'unknown',
            combatCause: combat,
            oppMid, oppWave, fightBasis: basis, scholarInFight: scholarIn, fightParty: party,
            crisisActive: crisis.crisisActive, crisisName: crisis.crisisName,
            crisisKind: crisis.crisisKind, crisisWave: crisis.crisisWave,
            atHaven: (() => { try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; } })(),
            tenureDays, bloodTenure,
          });
        }
      } catch (e) { err(t, 'tele.rec', e); }
      return r;
    };
    uninstalls.push(() => { try { Game.tele = oTele; } catch (e) {} });
  } catch (e) { err(t, 'tele.wrap', e); }

  return function uninstallVetaidcrisis() {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
  };
}

module.exports = { install };
