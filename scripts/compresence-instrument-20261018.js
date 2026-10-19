#!/usr/bin/env node
// compresence-instrument-20261018.js — companion presence diagnostic
// instrument (sim-compresence, 2026-10-18, axis scale-onramp). DIAGNOSTIC.
//
// Named-next from sim-killdisc: companions are ABSENT from wave-3 killing
// fights (39/44 zero companion damage; 0/44 companion kills). WHY? This
// instrument attributes each wave-3 killing fight to one of six presence
// channels:
//
//   (a) present-in-range — companion IN the fight and within melee strike
//       range (grid Chebyshev <= 1) of the killed monster, fight-start or
//       kill-time
//   (b) present-far — companion in the fight but never within strike range
//   (c) party-not-in-fight — no companion in the fight; the scholar's party
//       has living non-scholar members (WHERE are they: node vs scholar,
//       grid distance, side of the haven door)
//   (d) all-dead — no living non-scholar roster at all
//   (e) elsewhere — living roster exists but ALL on other world nodes
//   (f) solo-by-rule — living roster on the scholar's node but all beyond
//       the join radius (<= 4 grid squares) or behind the haven door
//
// THE JOIN RULE (game.js startCombat, 2026-10-10): villagers within
// Chebyshev 4 of the scholar's grid position join (nearest 4). positions[]
// are only populated for NPCs on the scholar's world node AND (at haven)
// on the scholar's side of the door. So absence is either node-distance,
// the 4-square radius, or the door.
//
// READ-ONLY observation wraps. Env-gated: install(Game, t) is called by the
// sweep ONLY when process.env.COMPRESENCE === '1'. No RNG draws, no state
// writes — npcNode()/npcInside() lazy-write, so the instrument reads the
// raw fields with the same defaults instead. The proof test's DET gate pins
// instrument-on vs instrument-off byte-identical trajectories.
//
// Wraps (all call-through):
//   Game.startCombat       — fight-start presence snapshot (roster census,
//                            joiners, AI modes, grid proximity)
//   Game.recordWaveKill    — kill-time snapshot + channel attribution
//   Game.recordPyrrhicKill — same (pyrrhic=true)
//   Game.fieldFight        — raid-engagement capture (vid, allies, rec)
//   Game.tbDamage          — per-source damage on wave-3+ monsters (same
//                            attribution as the killdisc instrument)
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
'use strict';
const KD = require('./killdisc-instrument-20261018');

function instrumentOn() { return process.env.COMPRESENCE === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }

// Raw reads — same defaults as npcNode()/npcInside(), no lazy writes.
function nodeOf(Game, rid) {
  try {
    const v = (Game.state || {}).village || {};
    const n = (v.nodePos || {})[rid];
    if (n && n.nx != null) return { nx: n.nx, ny: n.ny };
    return { nx: (v.px == null ? 4 : v.px), ny: (v.py == null ? 4 : v.py) };
  } catch (e) { return { nx: 4, ny: 4 }; }
}
function insideOf(Game, rid) {
  try { const v = (Game.state || {}).village || {}; return ((v.npcInside || {})[rid] == null) ? true : !!v.npcInside[rid]; }
  catch (e) { return true; }
}
function havenNodeOf(Game) {
  try { const v = (Game.state || {}).village || {}; return { nx: (v.px == null ? 4 : v.px), ny: (v.py == null ? 4 : v.py) }; }
  catch (e) { return { nx: 4, ny: 4 }; }
}
function nameOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
  try { if (Game.displayName) return String(Game.displayName(vid)).split(' ')[0]; } catch (e) {}
  return String(vid || '?').slice(0, 14);
}
// Living roster vids excluding the scholar. Dead villagers are REMOVED from
// the roster (removeVillager is the choke point), so roster = living.
function rosterOf(Game) {
  try {
    const sid = Game.villagerId;
    return (((Game.state || {}).village || {}).roster || []).filter(v => v && v !== sid);
  } catch (e) { return []; }
}
function scholarNode(Game) {
  try { return { nx: Game.map.px, ny: Game.map.py }; } catch (e) { return { nx: 4, ny: 4 }; }
}
function scholarGrid(Game) {
  try { const s = (Game.state || {}).scholar || {}; return { mx: (s.mx == null ? 4 : s.mx), my: (s.my == null ? 4 : s.my) }; }
  catch (e) { return { mx: 4, my: 4 }; }
}
function partyOf(Game) {
  try {
    const sid = Game.villagerId;
    return KD.partyVids(Game).filter(v => v && v !== sid);
  } catch (e) { return []; }
}

// whereClass(Game, rid, scholar): 'same-node' | 'other-node' for a
// non-joiner, plus door-side info at haven.
function whereOf(Game, rid, snode, havenNode, scholarInside) {
  const n = nodeOf(Game, rid);
  const sameNode = (n.nx === snode.nx && n.ny === snode.ny);
  let gridPos = null, gridDist = null;
  try { gridPos = (((Game.state || {}).village || {}).positions || {})[rid] || null; } catch (e) {}
  if (sameNode && gridPos && gridPos.mx != null) {
    const sg = scholarGrid(Game);
    gridDist = cheb(gridPos.mx, gridPos.my, sg.mx, sg.my);
  }
  const atHavenNode = (n.nx === havenNode.nx && n.ny === havenNode.ny);
  const side = atHavenNode ? (insideOf(Game, rid) ? 'inside' : 'outside') : null;
  const sideMatch = atHavenNode ? (insideOf(Game, rid) === scholarInside) : null;
  return { node: n, sameNode, gridPos: gridPos ? { mx: gridPos.mx, my: gridPos.my } : null, gridDist, atHavenNode, side, sideMatch };
}

// fightStartSnap(Game, t, monsterId): pure-read presence census at fight
// start. Called from the startCombat after-wrap (this.tbfight is live).
function fightStartSnap(Game, t, monsterId) {
  const snap = {
    day: gday(Game), mid: monsterId, wave: KD.waveOf(Game, monsterId), fightId: null,
    scholar: null, rosterStart: t.rosterStart | 0, rosterSize: 0, partySize: 0,
    joiners: [], nonjoiners: [], monsters: [],
  };
  try {
    const f = Game.tbfight;
    if (!f) { snap.noFight = true; return snap; }
    snap.fightId = f.id || null;
    const sid = Game.villagerId || null;
    const snode = scholarNode(Game);
    const sgrid = scholarGrid(Game);
    const havenNode = havenNodeOf(Game);
    let atHaven = false, scholarInside = true, onExped = false;
    try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
    try { scholarInside = (((Game.state || {}).scholar || {}).insideHaven !== false); } catch (e) {}
    try { onExped = !!(((Game.state || {}).exped || {})[sid]); } catch (e) {}
    snap.scholar = { vid: sid, node: snode, grid: sgrid, atHaven, insideHaven: scholarInside, onExped };
    const roster = rosterOf(Game);
    snap.rosterSize = roster.length;
    const party = partyOf(Game);
    snap.partySize = party.length;
    snap.partyVids = party;
    const joinedSet = {};
    const mons = [];
    for (const x of (f.fighters || [])) {
      if (!x) continue;
      if (x.kind === 'monster') mons.push({ key: x.key, mid: KD.monsterIdOf(x), grid: { mx: x.mx, my: x.my } });
      else if (x.kind === 'villager' && x.villagerId) {
        joinedSet[x.villagerId] = true;
        const dists = {};
        for (const m of mons) dists[m.key] = (x.mx != null && m.grid.mx != null) ? cheb(x.mx, x.my, m.grid.mx, m.grid.my) : null;
        snap.joiners.push({
          vid: x.villagerId, name: nameOf(Game, x.villagerId), ai: x.ai || null,
          weapon: (x.wbonus | 0) || 0, armor: (x.varmor | 0) || 0,
          grid: (x.mx != null) ? { mx: x.mx, my: x.my } : null,
          distToMonsters: dists, hp: x.hp | 0, maxHp: x.maxHp | 0, fled: !!x.fled,
        });
      }
    }
    snap.monsters = mons;
    for (const rid of roster) {
      if (joinedSet[rid]) continue;
      const w = whereOf(Game, rid, snode, havenNode, scholarInside);
      snap.nonjoiners.push({
        vid: rid, name: nameOf(Game, rid), inParty: party.indexOf(rid) >= 0,
        sameNode: w.sameNode, node: w.node, gridPos: w.gridPos, gridDist: w.gridDist,
        atHavenNode: w.atHavenNode, side: w.side, sideMatch: w.sideMatch,
      });
    }
  } catch (e) { err(t, 'fightStartSnap', e); }
  return snap;
}

// attributeChannel(start, kill): the six-channel taxonomy. Pure function of
// the snapshots — unit-testable with fixtures.
function attributeChannel(start, kill) {
  const ev = {};
  const joiners = (start && start.joiners) || [];
  const km = (kill && kill.killedMonster) || null;
  const dmgByVid = ((kill && kill.dmg) || {}).byVid || {};
  function distOf(j) {
    // distance from joiner j to the killed monster: kill-time first, then
    // fight-start (fight-start dists are keyed by monster key).
    if (kill && kill.joinerDists && kill.joinerDists[j.vid] != null) return kill.joinerDists[j.vid];
    if (km && j.distToMonsters && j.distToMonsters[km.key] != null) return j.distToMonsters[km.key];
    const ds = j.distToMonsters ? Object.keys(j.distToMonsters).map(k => j.distToMonsters[k]).filter(x => x != null) : [];
    return ds.length ? Math.min.apply(null, ds) : null;
  }
  if (joiners.length) {
    const ranged = joiners.map(j => ({ j, d: distOf(j) }));
    ev.joiners = ranged.map(r => ({ vid: r.j.vid, name: r.j.name, ai: r.j.ai, dist: r.d, dmg: Math.round(dmgByVid[r.j.vid] || 0), fled: !!r.j.fled }));
    const inRange = ranged.filter(r => r.d != null && r.d <= 1);
    if (inRange.length) return { channel: 'a', evidence: ev, note: inRange.length + '/' + joiners.length + ' joiners within strike range (<=1) of the killed monster' };
    return { channel: 'b', evidence: ev, note: 'joiner(s) present but all beyond strike range' };
  }
  const party = ((start && start.partyVids) || []).filter(v => v);
  if (party.length) {
    ev.party = ((start && start.nonjoiners) || []).filter(n => n.inParty).map(n => ({
      vid: n.vid, name: n.name, sameNode: n.sameNode, node: n.node, gridDist: n.gridDist,
      atHavenNode: n.atHavenNode, side: n.side, sideMatch: n.sideMatch,
    }));
    // Anomaly probe: a party member within the join radius who did NOT join.
    ev.partyInRadiusNotJoined = ev.party.filter(p => p.sameNode && p.gridDist != null && p.gridDist <= 4).map(p => p.vid);
    return { channel: 'c', evidence: ev, note: 'party of ' + party.length + ' exists but none in the fight' };
  }
  const rosterSize = (start && start.rosterSize) | 0;
  if (rosterSize === 0) {
    ev.rosterStart = (start && start.rosterStart) | 0;
    return { channel: 'd', evidence: ev, note: 'no living non-scholar roster — all companions dead' };
  }
  const nonjoiners = (start && start.nonjoiners) || [];
  const sameNode = nonjoiners.filter(n => n.sameNode);
  if (!sameNode.length) {
    const nodes = {};
    for (const n of nonjoiners) { const k = n.node.nx + ',' + n.node.ny; nodes[k] = (nodes[k] || 0) + 1; }
    ev.nodeDist = nodes;
    ev.scholarNode = (start && start.scholar && start.scholar.node) || null;
    ev.scholarAtHaven = !!(start && start.scholar && start.scholar.atHaven);
    return { channel: 'e', evidence: ev, note: 'all ' + nonjoiners.length + ' living companions on other nodes' };
  }
  const near = sameNode.filter(n => n.gridDist != null && n.gridDist <= 4 && n.sideMatch !== false);
  ev.sameNodeCount = sameNode.length;
  ev.nearest = sameNode.map(n => ({ vid: n.vid, name: n.name, gridDist: n.gridDist, side: n.side, sideMatch: n.sideMatch }))
    .sort((a, b) => (a.gridDist == null ? 99 : a.gridDist) - (b.gridDist == null ? 99 : b.gridDist)).slice(0, 4);
  ev.inRadiusNotJoined = near.map(n => n.vid);
  return { channel: 'f', evidence: ev, note: sameNode.length + ' companions on the scholar\'s node, none within the <=4 join radius (or behind the door)' };
}

// install(Game, t): installs the read-only wraps.
// t = { fights, kills, engagements, census, dmg, fieldFights,
//       instrumentErrors, rosterStart }.
function install(Game, t) {
  if (!t.dmg) t.dmg = {};
  if (!t.fights) t.fights = [];
  if (!t.kills) t.kills = [];
  if (!t.fieldFights) t.fieldFights = [];
  t.lastField = null;
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

  // Fight-start presence census.
  wrap('startCombat',
    function (monsterId) { return { monsterId: monsterId || null }; },
    function (r, pre) {
      if (!pre || !pre.monsterId) return;
      try {
        if ((KD.waveOf(Game, pre.monsterId) | 0) < 3) return; // wave-3+ only
        const snap = fightStartSnap(Game, t, pre.monsterId);
        t.fights.push(snap);
      } catch (e) { err(t, 'startCombat.push', e); }
    });

  const pushKill = (pre, pyrrhic) => {
    if (!pre) return;
    try {
      const ctx = pre.ctx;
      const start = ctx.fightId ? t.fights.filter(x => x.fightId === ctx.fightId).pop() : null;
      let dmgTab = null;
      if (ctx.fightId && t.dmg[ctx.fightId]) {
        const d = t.dmg[ctx.fightId];
        dmgTab = {
          scholar: Math.round(d.scholar), companion: Math.round(d.companion),
          other: Math.round(d.other), hits: d.hits,
          byVid: Object.assign({}, d.byVid),
          singleMonster: ctx.nMonsters === 1,
        };
      }
      // Kill-time snapshot: joiner grid positions + distance to the killed
      // monster (the dead monster fighter with this monster id).
      const kill = { killedMonster: null, joinerDists: {}, dmg: dmgTab };
      try {
        const f = Game.tbfight;
        if (f && pre.monsterId) {
          const dead = (f.fighters || []).filter(x => x && x.kind === 'monster' && KD.monsterIdOf(x) === pre.monsterId && !x.alive);
          const km = dead[0] || null;
          if (km) kill.killedMonster = { key: km.key, mid: pre.monsterId, grid: (km.mx != null) ? { mx: km.mx, my: km.my } : null };
          for (const x of (f.fighters || [])) {
            if (!x || x.kind !== 'villager' || !x.villagerId) continue;
            if (km && km.mx != null && x.mx != null) kill.joinerDists[x.villagerId] = cheb(x.mx, x.my, km.mx, km.my);
            else kill.joinerDists[x.villagerId] = null;
          }
        }
      } catch (e) { err(t, 'pushKill.killSnap', e); }
      let channel = null;
      try { channel = start ? attributeChannel(start, kill) : { channel: 'x', evidence: { noStartSnap: true }, note: 'no fight-start snapshot (non-TB kill path)' }; }
      catch (e) { err(t, 'pushKill.attribute', e); channel = { channel: 'x', evidence: { attributeError: true }, note: 'attribution threw' }; }
      // Raid-engagement record (fieldFight recency correlation, mid-matched).
      let field = null;
      try { if (t.lastField && t.lastField.mid === pre.monsterId) field = t.lastField; } catch (e) {}
      t.kills.push({
        day: ctx.day, mid: pre.monsterId, wave: KD.waveOf(Game, pre.monsterId),
        by: pre.killerVid, via: pre.via, pyrrhic: !!pyrrhic, ctx,
        shape: KD.classifyKill({ via: pre.via }, ctx),
        dmg: dmgTab, kill, channel: channel.channel, channelNote: channel.note,
        channelEvidence: channel.evidence, field,
        startScholar: start ? start.scholar : null,
      });
    } catch (e) { err(t, 'pushKill', e); }
  };

  wrap('recordWaveKill',
    function (monsterId, killerVid, via) {
      const ctx = KD.killCtx(Game, t);
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown', ctx };
    },
    function (r, pre) { pushKill(pre, false); });

  wrap('recordPyrrhicKill',
    function (monsterId, killerVid, via) {
      const ctx = KD.killCtx(Game, t);
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown', ctx };
    },
    function (r, pre) { pushKill(pre, true); });

  // Raid-engagement capture: fieldFight(vid, mdef, m, opts) -> rec.
  wrap('fieldFight',
    function (vid, mdef, m, opts) {
      return {
        vid: vid || null, mid: (m && m.id) || (mdef && mdef.id) || null,
        allies: (opts && opts.allies) | 0,
        allyVids: (opts && opts.allyVids ? opts.allyVids.slice(0, 6) : []),
      };
    },
    function (rec, pre) {
      if (!pre) return;
      try {
        if ((KD.waveOf(Game, pre.mid) | 0) < 3) return;
        const row = {
          vid: pre.vid, mid: pre.mid, allies: pre.allies, allyVids: pre.allyVids,
          outcome: rec ? rec.outcome : null, rounds: rec ? (rec.rounds | 0) : null,
          allyDealt: rec ? Math.round(rec.allyDealt || 0) : 0,
          allyVid: rec ? (rec.allyVid || null) : null,
          mDealt: rec ? Math.round(rec.mDealt || 0) : 0, vTaken: rec ? Math.round(rec.vTaken || 0) : 0,
          intent: rec ? (rec.intent || null) : null,
        };
        t.fieldFights.push(row);
        t.lastField = row;
      } catch (e) { err(t, 'fieldFight.push', e); }
    });

  // Per-source damage on wave-3+ monsters (same attribution as killdisc).
  wrap('tbDamage',
    function (targetKey, dmg, sourceLabel, sourceKey) {
      try {
        const f = Game.tbfight;
        if (!f) return null;
        const tgt = (typeof Game.tbFighter === 'function') ? Game.tbFighter(targetKey) : null;
        if (!tgt || tgt.kind !== 'monster') return null;
        if ((KD.waveOf(Game, KD.monsterIdOf(tgt)) | 0) < 3) return null;
        return { fightId: f.id || null, sourceLabel: sourceLabel || '', sourceKey: sourceKey || null };
      } catch (e) { return null; }
    },
    function (r, pre) {
      if (!pre || !pre.fightId) return;
      const final = +r || 0;
      if (!(final > 0)) return;
      try {
        const src = KD.resolveDmgSource(Game, pre.sourceLabel, pre.sourceKey);
        if (src.kind === 'monster') return;
        const tab = t.dmg[pre.fightId] || (t.dmg[pre.fightId] = { scholar: 0, companion: 0, other: 0, byVid: {}, hits: 0 });
        tab.hits++;
        if (src.kind === 'scholar') tab.scholar += final;
        else if (src.kind === 'companion') {
          tab.companion += final;
          if (src.vid) tab.byVid[src.vid] = (tab.byVid[src.vid] || 0) + final;
        } else tab.other += final;
      } catch (e) { err(t, 'tbDamage.push', e); }
    });

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

module.exports = { instrumentOn, install, attributeChannel, fightStartSnap, cheb, nodeOf, insideOf, rosterOf };
