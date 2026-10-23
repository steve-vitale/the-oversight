#!/usr/bin/env node
// diag-havencontact.js — sim-havencontact instrument: havencontact origin census.
//
// DIAG instrument, ZERO src/js changes. Read-only wraps (pure delegation +
// synchronous state reads); RNG-neutrality proven by the det-gate in
// scripts/test-havencontact.js. Installed OUTSIDE the mantlechain
// instrument's wraps (mantlechain installed first), uninstalls inside-out.
//
// This is diag-havendraw-b.js with ONE semantic change: the player origin
// taxonomy splits 'field' into 'havencontact' (checkEncounter contact at the
// haven tile) vs 'field' (true field). See the "origin taxonomy" block below
// and sim-findings #831.
//
// Records (all wave bands, not just wave-4):
//   fights   — player combat_start rows with origin classification (incl.
//              havencontact), atHaven, feasted, party vids, fighter-hp
//              snapshots for companion damage
//   ends     — combat_end rows with per-fighter damage (player + villagers)
//   vfights  — villager resolveWildMonsterEncounter rows with origin class
//              (raiddefense / lingerer / havengrounds / field) + outcome/vTaken
//   raids    — havenRaidTick events: fired, raidN, raider mids+waves, palisade,
//              player-reach mid
//   musters  — shelterMusterCheck transitions: mustered/standdown, n, threat
//   draws    — drawFeastScavenger / faceFeastDraw / driveOffFeastDraw events
//
// Origin taxonomy (classifyOrigin, unit-tested):
//   feastdraw  — s.feastDraw match (faceFeastDraw) or faceFeastDraw call-site mark
//   raidreach  — the raider havenRaidTick sent at the sleeping player
//   tent       — pendingInTent (wanderer tent breach)
//   trap       — gwTrapTick call site (glasswing dive trap)
//   reengage   — reengageWaitingMonsters (hall-door / treeline re-engage)
//   pending-other — live pendingEncounter at startCombat not otherwise classified
//   havencontact — classifyOrigin says 'field' AND the player is at the haven
//              (playerAtHaven at combat_start): the ambient checkEncounter
//              contact channel, not an assault, not a draw — the haven tile
//              is stood in the path of (sim-findings #831).
//   field      — checkEncounter bumps / warning-lapses / everything else,
//              OUTSIDE the haven
'use strict';

const HDNS = 'havencontact';

// Pure origin classifiers — unit-tested in scripts/test-havencontact.js.
// classifyOrigin ctx: { mid, markFaceDraw, markTrap, markReengage,
//   raidReachMid, feastDrawMid, pendingInTent, pendingEncounter, pendingMonsterId }
function classifyOrigin(ctx) {
  if (!ctx || !ctx.mid) return 'field';
  if (ctx.markFaceDraw) return 'feastdraw';
  if (ctx.feastDrawMid && ctx.feastDrawMid === ctx.mid) return 'feastdraw';
  if (ctx.markTrap) return 'trap';
  if (ctx.markReengage) return 'reengage';
  if (ctx.raidReachMid && ctx.raidReachMid === ctx.mid && ctx.pendingEncounter) return 'raidreach';
  if (ctx.pendingInTent) return 'tent';
  if (ctx.pendingEncounter && ctx.pendingMonsterId === ctx.mid) return 'pending-other';
  return 'field';
}
// classifyPlayerOrigin: the havencontact split. Named classes have priority
// (a feast draw faced at the haven is feastdraw, not havencontact); only the
// residual 'field' class is split on the player's position. A null mid means
// the contact is unverifiable — no phantom havencontact on such rows.
function classifyPlayerOrigin(ctx, atHaven) {
  const o = classifyOrigin(ctx);
  return (o === 'field' && ctx && ctx.mid && !!atHaven) ? 'havencontact' : o;
}
// classifyVOrigin o: { raid, lingering, distHaven }
function classifyVOrigin(o) {
  if (o && o.raid) return 'raiddefense';
  if (o && o.lingering) return 'lingerer';
  if (o && o.distHaven != null && o.distHaven <= 1) return 'havengrounds';
  return 'field';
}

function installHavencontact(Game) {
  const T = {
    fights: [], ends: [], vfights: [], raids: [], musters: [], draws: [],
    instrumentErrors: [],
  };
  const day = () => { try { return (((Game.state || {}).scholar || {}).day | 0); } catch (e) { return 0; } };
  const err = (where, e) => { T.instrumentErrors.push(where + ':' + String((e && e.message) || e)); };
  const nameOf = (vid) => {
    try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
    return String(vid || '?').slice(0, 14);
  };
  const waveOf = (mid) => {
    try {
      const d = ((Game.data || {}).monsters || []).find(m => m && m.id === mid) || null;
      return d ? (d.wave | 0) || 1 : null;
    } catch (e) { return null; }
  };
  const havenXY = () => {
    try { const v = Game.state.village || {}; return { x: v.px ?? 4, y: v.py ?? 4 }; } catch (e) { return { x: 4, y: 4 }; }
  };

  // Transient call-site markers (set around the original call; read at
  // combat_start, which fires synchronously inside startCombat).
  let markFaceDraw = false, markTrap = false, markReengage = false;
  let raidReachMid = null; // the raider id havenRaidTick sent at the player
  const fightStart = {};   // tbfight.id -> {fighters: key->{vid,kind,hp}, origin, mid, wave, atHaven}

  // Exported pure classifier — unit-tested in scripts/test-havencontact.js.
  // originCtx builds the marker/state context for a monster id; the player
  // origin applies the havencontact split on top of the base class.
  function originCtx(Game, mid) {
    let feastDrawMid = null, pendingInTent = false, pendingEncounter = false, pendingMonsterId = null;
    try { const s = Game.state.scholar || {}; if (s.feastDraw && s.feastDraw.monsterId) feastDrawMid = s.feastDraw.monsterId; } catch (e) {}
    try { pendingInTent = !!Game.pendingInTent; } catch (e) {}
    try { pendingEncounter = !!Game.pendingEncounter; pendingMonsterId = Game.pendingMonsterId || null; } catch (e) {}
    return { mid, markFaceDraw, markTrap, markReengage, raidReachMid, feastDrawMid, pendingInTent, pendingEncounter, pendingMonsterId };
  }

  const wraps = []; // {obj, key, orig} for uninstall
  function wrapMethod(key, fn) {
    if (typeof Game[key] !== 'function') { T.instrumentErrors.push('missing:' + key); return; }
    const orig = Game[key].bind(Game);
    wraps.push({ key, orig: Game[key] });
    Game[key] = function () { return fn.apply(this, [orig].concat([].slice.call(arguments))); };
  }

  // ---- call-site wraps (pure delegation + recording) ----
  wrapMethod('faceFeastDraw', function (orig) {
    markFaceDraw = true;
    let r;
    try { r = orig(); } finally { markFaceDraw = false; }
    try { T.draws.push({ day: day(), kind: 'face', ok: !!(r && r.ok), mid: (r && r.monsterId) || null }); } catch (e) { err('draw-face', e); }
    return r;
  });
  wrapMethod('driveOffFeastDraw', function (orig) {
    let r;
    try { r = orig(); } catch (e) { err('draw-drive-fwd', e); throw e; }
    try { T.draws.push({ day: day(), kind: 'driveoff', ok: !!(r && r.ok) }); } catch (e) { err('draw-drive', e); }
    return r;
  });
  wrapMethod('drawFeastScavenger', function (orig) {
    let r;
    try { r = orig(); } catch (e) { err('draw-cast-fwd', e); throw e; }
    try {
      T.draws.push({ day: day(), kind: 'cast', drawn: !!(r && r.drawn),
        mid: (r && r.monsterId) || null, wave: (r && r.monsterId) ? waveOf(r.monsterId) : null,
        why: (r && r.why) || null });
    } catch (e) { err('draw-cast', e); }
    return r;
  });
  wrapMethod('havenRaidTick', function (orig) {
    let prePE = false, prePMid = null;
    try { prePE = !!Game.pendingEncounter; prePMid = Game.pendingMonsterId || null; } catch (e) {}
    // Raider selection, mirrored from the raid's own code (havenGrowth.js
    // havenRaidTick): the raidN nearest world monsters to haven, raidN from
    // the pantry. Mirroring (not post-hoc diffing) because defender fights
    // inside the tick can kill/remove raiders before we read back.
    let draft = [];
    try {
      const h = havenXY();
      const ms = (Game.worldMonsters ? Game.worldMonsters() : []).slice();
      ms.sort((a, b) =>
        (Math.abs(a.tx - h.x) + Math.abs(a.ty - h.y)) - (Math.abs(b.tx - h.x) + Math.abs(b.ty - h.y)));
      let pantry = 0;
      try { pantry = Game.pantryKcalLive ? (Game.pantryKcalLive(Game.state.village) || 0) : 0; } catch (e) {}
      const raidN = Math.min(5, 3 + (pantry > 12000 ? 1 : 0) + (pantry > 24000 ? 1 : 0));
      draft = ms.slice(0, raidN).map(m => ({ mid: m.id || null, wave: waveOf(m.id || null) }));
    } catch (e) { err('raid-draft', e); }
    let r;
    try { r = orig(); } catch (e) { err('raid-fwd', e); throw e; }
    try {
      const d = day();
      const fired = !!r;
      let palisade = null, reachMid = null;
      if (fired) {
        try { palisade = Game.havenTier ? Game.havenTier() >= 2 : null; } catch (e) {}
        // the raider sent at the sleeping player (pendingEncounter flip)
        try {
          if (Game.pendingEncounter && (!prePE || prePMid !== Game.pendingMonsterId)) {
            const s = Game.state.scholar || {};
            const fdm = (s.feastDraw && s.feastDraw.monsterId) || null;
            if (Game.pendingMonsterId !== fdm) reachMid = Game.pendingMonsterId || null;
          }
        } catch (e) {}
        if (reachMid) raidReachMid = reachMid;
      }
      const raiders = fired ? draft : [];
      T.raids.push({ day: d, fired, n: raiders.length, raiders, palisade, reachMid,
        maxWave: raiders.length ? Math.max.apply(null, raiders.map(x => x.wave || 1)) : null });
    } catch (e) { err('raid-rec', e); }
    return r;
  });
  let prevMustered = false;
  wrapMethod('shelterMusterCheck', function (orig) {
    let r;
    try { r = orig(); } catch (e) { err('muster-fwd', e); throw e; }
    try {
      const d = day(), v = Game.state.village || {};
      const now = !!((r && r.mustered) || v.shelterMustered);
      let threat = null;
      try { if (v.shelterMustered) threat = v.shelterMustered.threat || null; } catch (e) {}
      if (now && !prevMustered) {
        let sheltered = 0;
        try { sheltered = Object.keys(v.sheltered || {}).length; } catch (e) {}
        T.musters.push({ day: d, kind: 'muster', n: (r && r.n) || 0, sheltered, threat });
      } else if (!now && prevMustered) {
        T.musters.push({ day: d, kind: 'standdown' });
      }
      prevMustered = now;
    } catch (e) { err('muster-rec', e); }
    return r;
  });
  wrapMethod('resolveWildMonsterEncounter', function (orig, vid, m, opts) {
    let rec;
    try { rec = orig(vid, m, opts); } catch (e) { err('vf-fwd', e); throw e; }
    try {
      const d = day(), h = havenXY();
      const mx = (m && (m.tx != null ? m.tx : m.mx)) ?? null;
      const my = (m && (m.ty != null ? m.ty : m.my)) ?? null;
      const distHaven = (mx != null && my != null) ? Math.max(Math.abs(mx - h.x), Math.abs(my - h.y)) : null;
      const mid = (m && m.id) || null;
      T.vfights.push({
        day: d, vid: vid || null, vidName: nameOf(vid), mid, wave: mid ? waveOf(mid) : null,
        origin: classifyVOrigin({ raid: !!(opts && opts.raid), lingering: !!(m && m.lingering), distHaven }),
        raid: !!(opts && opts.raid), lingering: !!(m && m.lingering), distHaven,
        mx, my, outcome: (rec && rec.outcome) || null, vTaken: (rec && rec.vTaken) || 0,
      });
    } catch (e) { err('vf-rec', e); }
    return rec;
  });
  wrapMethod('gwTrapTick', function (orig) {
    markTrap = true;
    try { return orig(); } finally { markTrap = false; }
  });
  wrapMethod('reengageWaitingMonsters', function (orig) {
    markReengage = true;
    try { return orig.apply(this, [].slice.call(arguments, 1)); }
    finally { markReengage = false; }
  });

  // ---- tele wrap: combat_start (all waves) + combat_end ----
  const otele = Game.tele.bind(Game);
  wraps.push({ key: 'tele', orig: Game.tele });
  Game.tele = function (type, data) {
    let r;
    try { r = otele.apply(this, arguments); } catch (e) { throw e; }
    try {
      if (type === 'combat_start') {
        const d = day();
        const mid = (data && data.vs) || null;
        const wave = (data && data.wave != null) ? (data.wave | 0) : waveOf(mid);
        let atHaven = null, feasted = null;
        try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
        try { feasted = !!(Game.feastedActive && Game.feastedActive()); } catch (e) {}
        // THE havencontact split: originCtx builds the marker/state context;
        // classifyOrigin names the base class ('field' for ambient contacts);
        // classifyPlayerOrigin names the haven channel on top of it.
        const ctx0 = originCtx(Game, mid);
        const baseOrigin = classifyOrigin(ctx0);
        const origin = classifyPlayerOrigin(ctx0, atHaven);
        raidReachMid = null; // the pending encounter is consumed by this fight — never reuse the marker
        const party = [];
        const snap = {};
        try {
          for (const f of (((Game.tbfight || {}).fighters) || [])) {
            if (!f) continue;
            snap[f.key] = { vid: f.villagerId || f.key, kind: f.kind || null, hp: Number(f.hp) || 0 };
            if (f.kind === 'villager' && f.villagerId) party.push(f.villagerId);
          }
        } catch (e) {}
        let fid = null;
        try { fid = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
        if (fid) fightStart[fid] = { fighters: snap, origin, mid, wave, atHaven };
        T.fights.push({ day: d, fid, mid, wave, atHaven, feasted, origin, baseOrigin,
          scholar: Game.villagerId || null, party, php: (data && data.php) || null, pack: (data && data.pack) || null });
      }
      if (type === 'combat_end') {
        const d = day();
        let fid = null, cur = {};
        try { fid = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
        try {
          for (const f of (((Game.tbfight || {}).fighters) || [])) {
            if (!f) continue;
            cur[f.key] = { vid: f.villagerId || f.key, kind: f.kind || null, hp: Number(f.hp) || 0,
              alive: f.alive !== false, fled: !!f.fled };
          }
        } catch (e) {}
        const start = (fid && fightStart[fid]) || null;
        const perFighter = [];
        let compDmg = 0, compDied = 0;
        for (const k of Object.keys(cur)) {
          const s0 = start && start.fighters ? start.fighters[k] : null;
          const dmg = s0 ? Math.max(0, (s0.hp || 0) - (cur[k].hp || 0)) : null;
          const died = !cur[k].alive;
          perFighter.push({ vid: cur[k].vid, kind: cur[k].kind, dmg, died, fled: cur[k].fled });
          if (cur[k].kind === 'villager' && dmg != null) { compDmg += dmg; if (died) compDied++; }
        }
        T.ends.push({ day: d, fid, result: (data && data.result) || null,
          mid: start ? start.mid : null, wave: start ? start.wave : null,
          origin: start ? start.origin : null, atHaven: start ? start.atHaven : null,
          perFighter, compDmg, compDied, php: (data && data.php) || null });
        if (fid && fightStart[fid]) delete fightStart[fid];
      }
    } catch (e) { err('tele-row', e); }
    return r;
  };

  function uninstall() {
    for (let i = wraps.length - 1; i >= 0; i--) {
      try { Game[wraps[i].key] = wraps[i].orig; } catch (e) {}
    }
  }
  return { T, uninstall, HDNS, classifyOrigin, classifyPlayerOrigin, classifyVOrigin };
}

module.exports = { installHavencontact, classifyOrigin, classifyPlayerOrigin, classifyVOrigin, HDNS };
