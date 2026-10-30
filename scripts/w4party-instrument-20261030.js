#!/usr/bin/env node
// w4party-instrument-20261030.js — wave-4 party-presence diagnostic
// (sim-w4party-a, 2026-10-30, axis scale-onramp). DIAGNOSTIC — no lever.
//
// Follows sim-killconv-a (evidence/2026-10-30/sim-killconv-a.md): the
// killconv band had 35 villager field fights vs wave-4 beasts with 0
// kills. This instrument asks, for each wave-4 field meeting, whether
// anyone else was even there — in a sense the engine could use — and
// whether anyone joined, how late, and through which perception
// channel. Contrast: the scholar's TB party composition at wave-4
// TB fight starts.
//
// Env-gated on W4PARTY=1. Contract: instrumentOn(), install(Game, t),
// uninstall; when unset the wrappers are never installed and the sim
// path is byte-identical to base — the proof test's det-gate pins that.
//
// READ-ONLY DISCIPLINE (stricter than killconv, because position reads
// are the measurement):
//   - NEVER calls Game.npcNode (it WRITES a default Haven nodePos for
//     unplaced villagers). Node positions are read from
//     state.village.nodePos directly; a missing entry is reported as
//     defaulted:Haven (village px,py) WITHOUT writing it.
//   - NEVER calls Game.partyMembers (partyState() writes v.party when
//     missing). The formal party is read from state.village.party
//     directly with the same filter (exclude scholar, must be roster).
//   - NEVER calls ensureVillagerPositions. Grid positions are read
//     from state.village.positions directly (they exist only on the
//     scholar's node; off-node fights have no grid proximity to read).
//   - No Math.random / roll draws anywhere in the wraps. Wraps are
//     call-through; every catch reports into t.instrumentErrors,
//     never thrown, never silent.
//
// Wraps (all call-through):
//   Game.fieldFight — wave>=4 meetings: entry snapshot (fighter node,
//     monster tile, node-distance buckets for every living roster
//     villager, outdoor-crew lists, offered pool, scholar formal party,
//     fighter assignment) + exit record (outcome, rounds, partySize,
//     calledHelp, allyVid, shoutRound, intent, log tail).
//   Game.resolveWildMonsterEncounter / resolvePatrol / aidFight —
//     caller markers only (t._caller), so a meeting is classed
//     wild / patrol / aid / other (contest, expedition, direct).
//   Game.startCombat / tbEnd — wave>=4 TB fights: companions present
//     at start (tbfight fighters kind villager/ally), formal party
//     size at start, overlap, end outcome.
//
// Distance unit: world NODE Chebyshev distance (npcNode grid). Grid
// squares are NOT used for field meetings: positions exist only on
// the scholar's node, so for off-node fights they would be
// systematically missing. Same-node = d 0, earshot = d<=1 (the
// party-wiring.js rule), sight range = d<=2 (PERCEPTION.md
// observant distance-2 bound, generous upper bound).
'use strict';

function instrumentOn() { return process.env.W4PARTY === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function waveOf(Game, mid) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    const d = defs.find(m => m && m.id === mid);
    return (d && d.wave) || 1;
  } catch (e) { return 1; }
}

function classifyFieldFight(rec) {
  try {
    if (!rec || typeof rec !== 'object') return 'unresolved';
    const o = rec.outcome;
    if (o === 'evade' || o === 'vKill' || o === 'mFlee' || o === 'vFlee' || o === 'vDie' || o === 'alreadyDead') return o;
    return 'unresolved';
  } catch (e) { return 'unresolved'; }
}

// Read-only living check: scholar counts as living; otherwise the
// village health map, falling back to vpOf (a read) when absent.
function isLiving(Game, vid) {
  try {
    if (vid === Game.villagerId) return true;
    const health = ((Game.state || {}).village || {}).health || {};
    if (health[vid] !== undefined) return Number(health[vid]) > 0;
    if (typeof Game.vpOf === 'function') { const vp = Game.vpOf(vid); return !!(vp && !vp.dead); }
    return true;
  } catch (e) { return true; }
}

// Read-only formal party: state.village.party filtered like
// partyMembers() (exclude scholar, must be on roster) — without
// calling partyState(), which writes a default.
function formalParty(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    return ((v.party || []).filter(id => id !== Game.villagerId && roster.indexOf(id) >= 0));
  } catch (e) { return []; }
}

// Node snapshot for one meeting. Pure reads; missing nodePos entries
// are reported as defaulted, never written.
function nodeSnapshot(Game, fighterVid, monsterTile) {
  const snap = { fighterNode: null, fighterDefaulted: false, monsterTile: monsterTile || null,
    sameNode: [], adjacent: [], within2: [], farther: [], unplaced: [],
    crewOutdoor: [], crewSnapshot: [], fighterTask: null, scholarParty: [] };
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    const nodePos = v.nodePos || {};
    const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
    const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
    const nodeOf = (vid) => {
      const n = nodePos[vid];
      if (n && typeof n.nx === 'number' && typeof n.ny === 'number') return { nx: n.nx, ny: n.ny, def: false };
      return { nx: hx, ny: hy, def: true };
    };
    const fn = nodeOf(fighterVid);
    snap.fighterNode = { nx: fn.nx, ny: fn.ny };
    snap.fighterDefaulted = fn.def;
    const trust = v.trust || {};
    const trustOf = (rid) => (trust[rid] === undefined ? 10 : trust[rid]);
    for (const rid of roster) {
      if (rid === fighterVid) continue;
      if (!isLiving(Game, rid)) continue;
      const n = nodeOf(rid);
      const d = Math.max(Math.abs(n.nx - fn.nx), Math.abs(n.ny - fn.ny));
      const entry = { vid: rid, d, trust: trustOf(rid), defaulted: n.def };
      if (d === 0) snap.sameNode.push(entry);
      else if (d === 1) snap.adjacent.push(entry);
      else if (d === 2) snap.within2.push(entry);
      else snap.farther.push(entry);
      if (n.def) snap.unplaced.push(rid);
    }
    const asg = v.assignments || {};
    const OUTDOOR = ['patrol', 'scout', 'hunt', 'forage'];
    for (const rid of Object.keys(asg)) {
      if (OUTDOOR.indexOf(((asg[rid] || {}).task)) >= 0) snap.crewOutdoor.push(rid);
    }
    snap.crewSnapshot = (Game._outdoorCrew || []).slice();
    if (asg[fighterVid]) snap.fighterTask = (asg[fighterVid] || {}).task || null;
    snap.scholarParty = formalParty(Game);
  } catch (e) { /* snapshot failure is recorded by caller via errors */ }
  return snap;
}

function install(Game, t) {
  if (!t.meetings) t.meetings = [];
  if (!t.tbFights) t.tbFights = [];
  if (!t.tbOutcomes) t.tbOutcomes = {};
  const orig = {};

  const wrap = (name, before, after) => {
    const o = Game[name];
    if (typeof o !== 'function') { err(t, 'install.missing:' + name, new Error('not a function')); return; }
    orig[name] = o;
    Game[name] = function () {
      let pre = null;
      try { if (before) pre = before.apply(this, arguments); } catch (e) { err(t, name + '.before', e); }
      let r;
      try { r = o.apply(this, arguments); } catch (e) { err(t, name + '.call', e); throw e; }
      try { if (after) after.call(this, r, pre, arguments); } catch (e) { err(t, name + '.after', e); }
      return r;
    };
  };

  // Caller markers: synchronous nesting, so save/restore is exact.
  for (const pair of [['resolveWildMonsterEncounter', 'wild'], ['resolvePatrol', 'patrol'], ['aidFight', 'aid']]) {
    const fname = pair[0], label = pair[1];
    if (typeof Game[fname] !== 'function') { err(t, 'install.missing:' + fname, new Error('not a function')); continue; }
    const o = Game[fname];
    orig[fname] = o;
    Game[fname] = function () {
      const prev = t._caller || null;
      t._caller = label;
      let r;
      try { r = o.apply(this, arguments); } catch (e) { t._caller = prev; throw e; }
      t._caller = prev;
      return r;
    };
  }

  wrap('fieldFight',
    function (vid, mdef, m, opts) {
      let mid = null;
      try { mid = (mdef && mdef.id) || null; } catch (e) {}
      const wave = mid ? waveOf(Game, mid) : 0;
      let snap = null, offered = null, tile = null;
      if (wave >= 4) {
        try {
          if (m && typeof m.tx === 'number' && typeof m.ty === 'number') tile = { tx: m.tx, ty: m.ty };
        } catch (e) {}
        try { snap = nodeSnapshot(Game, (vid === undefined || vid === null) ? null : String(vid), tile); } catch (e) { err(t, 'fieldFight.snap', e); }
        try {
          const oo = opts || {};
          offered = { allies: oo.allies || 0, allyVids: (oo.allyVids || []).slice(), allyFromStart: !!oo.allyFromStart, noFlee: !!oo.noFlee };
        } catch (e) { offered = { allies: 0, allyVids: [], allyFromStart: false, noFlee: false }; }
      }
      return { vid: (vid === undefined || vid === null) ? null : String(vid), mid, wave,
        day: gday(Game), caller: t._caller || 'other', snap, offered };
    },
    function (r, pre) {
      if (!pre || (pre.wave | 0) < 4) return;
      try {
        const rec = (r && typeof r === 'object') ? r : null;
        const outcome = classifyFieldFight(rec);
        let logTail = null;
        try { if (rec && Array.isArray(rec.log)) logTail = rec.log.slice(-120); } catch (e) {}
        t.meetings.push({
          day: pre.day, vid: pre.vid, mid: pre.mid, wave: pre.wave, caller: pre.caller,
          outcome, rounds: rec && rec.rounds != null ? rec.rounds : null,
          partySize: rec && rec.partySize != null ? rec.partySize : null,
          calledHelp: !!(rec && rec.calledHelp), allyVid: rec && rec.allyVid ? rec.allyVid : null,
          shoutRound: rec && rec.shoutRound != null ? rec.shoutRound : null,
          intent: rec && rec.intent ? rec.intent : null,
          vTaken: rec && rec.vTaken != null ? rec.vTaken : null,
          mDealt: rec && rec.mDealt != null ? rec.mDealt : null,
          vHpLeft: rec && rec.vHpLeft != null ? rec.vHpLeft : null,
          mHpLeft: rec && rec.mHpLeft != null ? rec.mHpLeft : null,
          offered: pre.offered, snap: pre.snap, logTail,
        });
      } catch (e) { err(t, 'fieldFight.push', e); }
    });

  wrap('startCombat',
    function (monsterId) {
      let beforeId = null;
      try { beforeId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      return { monsterId, wave: waveOf(Game, monsterId), day: gday(Game), beforeId,
        partyBefore: formalParty(Game) };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        let afterId = null;
        try { afterId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
        const started = !!(afterId && afterId !== pre.beforeId);
        if ((pre.wave | 0) < 4) return;
        let companions = [];
        if (started) {
          try {
            const fs = (Game.tbfight && Game.tbfight.fighters) || [];
            companions = fs.filter(f => f && (f.kind === 'villager' || f.kind === 'ally') && f.villagerId)
              .map(f => ({ vid: f.villagerId, kind: f.kind, mx: f.mx != null ? f.mx : null, my: f.my != null ? f.my : null }));
          } catch (e) {}
        }
        t.tbFights.push({ day: pre.day, mid: pre.monsterId, wave: pre.wave, started,
          fightId: started ? afterId : null, companions,
          formalParty: pre.partyBefore, formalPartySize: pre.partyBefore.length });
      } catch (e) { err(t, 'startCombat.push', e); }
    });

  wrap('tbEnd',
    function (result) {
      let fightId = null;
      try { fightId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      return { fightId, result: (result === undefined || result === null) ? 'unknown' : String(result), day: gday(Game) };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        if (pre.fightId) t.tbOutcomes[pre.fightId] = pre.result;
        const rec = t.tbFights.find(x => x.fightId === pre.fightId);
        if (rec) rec.end = pre.result;
      } catch (e) { err(t, 'tbEnd.push', e); }
    });

  wrap('tbBarrierExit',
    function () {
      let f = null, holderVid = null, over = false;
      try { f = Game.tbfight || null; } catch (e) {}
      try { holderVid = Game.villagerId; } catch (e) {}
      try { over = !!Game.over; } catch (e) {}
      return { fightId: f ? (f.id || null) : null, hadFight: !!f, holderVid, over };
    },
    function (r, pre) {
      if (!pre || !pre.fightId || !pre.hadFight) return;
      try {
        if (t.tbOutcomes[pre.fightId]) return;
        if (Game.tbfight) return;
        let nb = null, nover = false;
        try { nb = Game.villagerId; } catch (e) {}
        try { nover = !!Game.over; } catch (e) {}
        if (nover || nb !== pre.holderVid) {
          t.tbOutcomes[pre.fightId] = 'dissolved';
          const rec = t.tbFights.find(x => x.fightId === pre.fightId);
          if (rec) rec.end = 'dissolved';
        }
      } catch (e) { err(t, 'tbBarrierExit.push', e); }
    });

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

module.exports = { instrumentOn, install, waveOf, classifyFieldFight, nodeSnapshot, formalParty };
