#!/usr/bin/env node
// pocketcall-diag-20261031.js — pocket-call census instrument (sim-pocketcall-a).
// MEASUREMENT ONLY. Env-gated on PCDIAG=1. Contract: instrumentOn(),
// install(Game, t), uninstall; when unset the wrapper is never installed
// and the sim path is byte-identical to base.
//
// Installs ON TOP of ammo-diag-20261031.js (install that first): it
// wraps Game.fieldFight a second time ONLY to capture fight-time
// pocket/departure history + sensed-contact state, and wraps
// Game.startExpedition / Game.resolvePatrol a second time ONLY to
// count departure invocations (pre-call, so an in-progress patrol
// that produces a fight counts) and their went/sat-out outcomes.
//
// READ-ONLY DISCIPLINE (same as ammo-diag, stricter on sensing):
// - Draws NO RNG, writes NO game state, returns original results.
// - Sensed contact reads RAW state only: village.nodePos,
//   village.positions, village.party, village.away, village health
//   map, Game._outdoorCrew, Game.map, scholar.mx/my. It NEVER calls
//   a Game method that initializes state: no npcNode, no npcInside,
//   no campPeopleIds, no partyMembers, no stashState, no agencyState,
//   no ensureVillagerPositions. Missing raw entries record null
//   (unknown), never a defaulted Haven. The proof's static scan
//   enforces this list over the de-commented source.
// - It NEVER iterates the roster: the sensed test reads the
//   fighter's own node/position/party membership and the crew array
//   the fighter is already in. A crew is a co-present travelling
//   group, not a roster query.
// - Every catch reports into t.pcErrors (never thrown, never silent).
//
// Pure functions (shared with the analyzer, single source of truth):
// - classifyFight(f): f = {carriedNeeded, pocketBefore, departBefore,
//   wentBefore, fighterNode, havenNode, away, onExpedition} ->
//   {cls, atHome, nodeUnknown, anomaly}.
// - sensedContact(s): s = {fighterNode, scholarNode, fighterGrid,
//   scholarGridRaw, crewIncludesVid, crewAliveOthers, partyIncludesVid}
//   -> {c1, c2, c2Stale, c3, c4, reachable}.
'use strict';

function instrumentOn() { return process.env.PCDIAG === '1'; }

function err(t, where, e) {
  try { t.pcErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function copyNode(n) {
  if (!n || typeof n !== 'object') return null;
  if (typeof n.nx === 'number' && typeof n.ny === 'number') return { nx: n.nx, ny: n.ny };
  return null;
}

function copyGrid(p) {
  if (!p || typeof p !== 'object') return null;
  if (typeof p.mx === 'number' && typeof p.my === 'number') return { mx: p.mx, my: p.my };
  return null;
}

function cheb(a, b) { return Math.max(Math.abs(a.mx - b.mx), Math.abs(a.my - b.my)); }

// classifyFight: priority order ARMED > NEVER-CALLED > NEVER-DEPARTED >
// DRY-AT-HOME > DRY-AT-FIGHT (see sim-pocketcall-a-prereg.md).
function classifyFight(f) {
  const carried = (f && f.carriedNeeded) || 0;
  const P = (f && f.pocketBefore) || 0;
  const D = (f && f.departBefore) || 0;
  const W = (f && f.wentBefore) || 0;
  let atHome = null, nodeUnknown = false;
  if (f && f.fighterNode && f.havenNode) {
    atHome = (f.fighterNode.nx === f.havenNode.nx && f.fighterNode.ny === f.havenNode.ny);
  } else {
    nodeUnknown = true;
    // Fallback (prereg): away/on-expedition -> out; otherwise home.
    atHome = !((f && f.away) || (f && f.onExpedition));
  }
  let cls = null, anomaly = false;
  if (carried > 0) cls = 'ARMED';
  else if (P === 0 && D === 0) cls = 'NEVER-CALLED';
  else if (D > 0 && P === 0) { cls = 'NEVER-DEPARTED'; if (W > 0) anomaly = true; }
  else if (atHome) cls = 'DRY-AT-HOME';
  else cls = 'DRY-AT-FIGHT';
  return { cls, atHome, nodeUnknown, anomaly };
}

// sensedContact: C1 same node; C2 same grid within Chebyshev 1
// (perceive.js person-hint range), void when nodes differ (stale
// grid); C3 crew shout (fighter in crew + another living crew
// member); C4 party follow. Reachable = union.
function sensedContact(s) {
  const out = { c1: false, c2: false, c2Stale: false, c3: false, c4: false, reachable: false };
  try {
    const fn = s.fighterNode, sn = s.scholarNode;
    if (fn && sn) out.c1 = (fn.nx === sn.nx && fn.ny === sn.ny);
    if (s.fighterGrid) {
      const sg = { mx: (s.scholarGridRaw && typeof s.scholarGridRaw.mx === 'number') ? s.scholarGridRaw.mx : 4,
                   my: (s.scholarGridRaw && typeof s.scholarGridRaw.my === 'number') ? s.scholarGridRaw.my : 4 };
      if (fn && sn && (fn.nx !== sn.nx || fn.ny !== sn.ny)) out.c2Stale = true;
      else out.c2 = cheb(s.fighterGrid, sg) <= 1;
    }
    if (s.crewIncludesVid && Array.isArray(s.crewAliveOthers) && s.crewAliveOthers.length > 0) out.c3 = true;
    if (s.partyIncludesVid) out.c4 = true;
    out.reachable = out.c1 || out.c2 || out.c3 || out.c4;
  } catch (e) {}
  return out;
}

function install(Game, t) {
  if (!t.pcFights) t.pcFights = [];
  if (!t.pcDepartures) t.pcDepartures = [];
  if (!t.pcErrors) t.pcErrors = [];
  if (typeof t.pcLowWave !== 'number') t.pcLowWave = 0;
  const WF = require('./w4field-instrument-20261030.js');
  const started = {}; // vid -> departure invocations started (pre-call count)
  const pocketCountFor = (vid) => {
    let n = 0;
    try { for (const p of (t.pocketCalls || [])) if (p.vid === vid) n++; } catch (e) {}
    return n;
  };
  const wentCountFor = (vid) => {
    let n = 0;
    try { for (const d of (t.pcDepartures || [])) if (d.vid === vid && d.went) n++; } catch (e) {}
    return n;
  };

  function fightRow(Game, vid, mdef, m, opts) {
    const row = { day: gday(Game), vid: (vid === undefined || vid === null) ? null : String(vid),
      mid: (mdef && mdef.id) || null, wave: 0,
      pocketBefore: 0, departBefore: 0, wentBefore: 0,
      fighterNode: null, havenNode: null, scholarNode: null,
      fighterGrid: null, scholarGridRaw: null,
      crewIncludesVid: false, crewAliveOthers: [], partyIncludesVid: false,
      away: null, onExpedition: false,
      monsterNode: null, optAllies: null, optAllyVids: null };
    try { row.wave = row.mid ? WF.waveOf(Game, row.mid) : 0; } catch (e) { err(t, 'fightRow.wave', e); }
    try { row.pocketBefore = pocketCountFor(row.vid); } catch (e) {}
    try { row.departBefore = started[row.vid] || 0; } catch (e) {}
    try { row.wentBefore = wentCountFor(row.vid); } catch (e) {}
    try {
      const v = (Game.state || {}).village || {};
      row.fighterNode = copyNode((v.nodePos || {})[row.vid]);
      row.havenNode = { nx: (typeof v.px === 'number' ? v.px : 4), ny: (typeof v.py === 'number' ? v.py : 4) };
      row.fighterGrid = copyGrid((v.positions || {})[row.vid]);
      const aw = (v.away || {})[row.vid];
      row.away = aw ? { purpose: aw.purpose || null } : null;
      row.partyIncludesVid = Array.isArray(v.party) && v.party.indexOf(row.vid) !== -1;
      const ag = v.agency || null;
      row.onExpedition = !!(ag && ag.exped && ag.exped[row.vid]);
      const crew = Game._outdoorCrew;
      if (Array.isArray(crew)) {
        row.crewIncludesVid = crew.indexOf(row.vid) !== -1;
        const health = v.health || {};
        for (const rid of crew) {
          if (rid === row.vid) continue;
          const hp = (health[rid] === undefined) ? 100 : health[rid];
          if (hp > 0) row.crewAliveOthers.push(rid);
        }
      }
    } catch (e) { err(t, 'fightRow.state', e); }
    try {
      const mp = Game.map || null;
      if (mp && typeof mp.px === 'number' && typeof mp.py === 'number') row.scholarNode = { nx: mp.px, ny: mp.py };
    } catch (e) {}
    try {
      const s = (Game.state || {}).scholar || {};
      row.scholarGridRaw = (typeof s.mx === 'number' && typeof s.my === 'number') ? { mx: s.mx, my: s.my } : null;
    } catch (e) {}
    try {
      if (m && typeof m.tx === 'number' && typeof m.ty === 'number') row.monsterNode = { tx: m.tx, ty: m.ty };
    } catch (e) {}
    try {
      if (opts && typeof opts === 'object') {
        if (typeof opts.allies === 'number') row.optAllies = opts.allies;
        if (Array.isArray(opts.allyVids)) row.optAllyVids = opts.allyVids.slice();
      }
    } catch (e) {}
    return row;
  }

  const origFight = Game.fieldFight;
  if (typeof origFight !== 'function') { err(t, 'install.missing:fieldFight', new Error('not a function')); return function () {}; }
  Game.fieldFight = function (vid, mdef, m, opts) {
    let row = null;
    try { row = fightRow(Game, vid, mdef, m, opts); } catch (e) { err(t, 'fieldFight.row', e); }
    const r = origFight.apply(this, arguments);
    try {
      if (!row) return r;
      if ((row.wave | 0) < 4) { t.pcLowWave++; return r; }
      t.pcFights.push(row);
    } catch (e) { err(t, 'fieldFight.after', e); }
    return r;
  };

  const depUninstalls = [];
  for (const kind of ['startExpedition', 'resolvePatrol']) {
    try {
      const orig = Game[kind];
      if (typeof orig !== 'function') { err(t, 'install.missing:' + kind, new Error('not a function')); continue; }
      Game[kind] = function () {
        let vid = null;
        try { vid = arguments[0] !== undefined && arguments[0] !== null ? String(arguments[0]) : null; } catch (e) {}
        // Pre-call increment: an in-progress patrol that produces a
        // fight must count as a departure call at fight time (the
        // ammo-diag departure wrapper appends only after return).
        if (vid) started[vid] = (started[vid] || 0) + 1;
        let prePocket = 0;
        try { prePocket = pocketCountFor(vid); } catch (e) {}
        const r = orig.apply(this, arguments);
        try {
          const postPocket = pocketCountFor(vid);
          let awayAfter = false, expedAfter = false;
          try {
            const v = (Game.state || {}).village || {};
            awayAfter = !!((v.away || {})[vid]);
            const ag = v.agency || null;
            expedAfter = !!(ag && ag.exped && ag.exped[vid]);
          } catch (e) {}
          // Went <=> pocket invoked during the call (pocketing runs
          // after the sit-out gates in both sites). Away/exped are a
          // cross-check for expeditions, recorded, not re-derived.
          t.pcDepartures.push({ day: gday(Game), vid, kind,
            went: postPocket > prePocket, pocketDelta: postPocket - prePocket,
            awayAfter, expedAfter });
        } catch (e) { err(t, 'departure.after:' + kind, e); }
        return r;
      };
      depUninstalls.push(function () { try { Game[kind] = orig; } catch (e) {} });
    } catch (e) { err(t, 'install.departure:' + kind, e); }
  }

  return function uninstall() {
    try { Game.fieldFight = origFight; } catch (e) {}
    for (const u of depUninstalls) { try { u(); } catch (e) {} }
  };
}

module.exports = { instrumentOn, install, classifyFight, sensedContact };
