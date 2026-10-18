#!/usr/bin/env node
// killdisc-instrument-20261018.js — kill-discipline diagnostic instrument
// (sim-killdisc, 2026-10-18, axis scale-onramp). DIAGNOSTIC — no lever.
//
// Extends the COMPCHAN instrument (scripts/compchan-instrument-20261018.js,
// sim-compchan DIAG-GO 16/16): the same read-only kill/engagement/census
// wraps PLUS a per-source damage attribution wrap on Game.tbDamage.
//
// THE QUESTION (compchan named next): in wave-3 TB fights, how much damage
// do companions deal vs how many killing blows do they land? The census
// proved companions fight (Katarina 45-51/hit, out-damaging the scholar's
// 41s) but land 1/33 killing blows. If damage-share >> kill-share, the 5th
// production attempt is a policy-side kill-discipline rule (scholar softens
// and holds; the companion secures the blow). If damage-share ~ kill-share,
// the problem is companion combat capability, a different lever.
//
// READ-ONLY observation wraps. Env-gated: install(Game, t) is called by the
// sweep ONLY when process.env.KILLDISC === '1'. When unset the wrappers are
// never installed and the policy path is byte-identical to the tribfloor
// base (the proof test's det-gate pins that).
//
// Wraps (all call-through, zero game-state writes, zero RNG draws):
//   Game.recordWaveKill      — kill-time ctx capture per kill + fight dmg table
//   Game.recordPyrrhicKill   — same (pyrrhic=true)
//   Game.startCombat         — engagement census (scholar TB fights)
//   Game.sleep               — daily readiness census (standing, veterans, window)
//   Game.tbDamage            — per-source damage on wave-3+ monsters (scholar
//                             vs companion vs other), keyed by fight id
//
// Damage resolution (resolveDmgSource): the scholar's strikes arrive as
// ('you', null) / ('p', ...) / ('your ...', ...); villager allies pass
// v.key (game.js:35486). Monster-sourced and unresolvable damage is counted
// as 'other' and reported separately — if other-share is large the
// instrument needs refinement, not silent trust.
//
// NOTE on determinism: tbfight.id contains Date.now() (game.js:30616) — it
// is used ONLY as an in-run map key and is NEVER written to the per-seed
// JSON. The attached dmg tables (aggregates) are RNG-determined and
// re-run byte-identical (proven by the proof test's real-sweep gate).
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
'use strict';

function instrumentOn() { return process.env.KILLDISC === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function partyVids(Game) {
  try {
    const p = ((Game.state || {}).village || {}).party || [];
    return p.map(x => {
      if (typeof x === 'string') return x;
      if (x && typeof x === 'object') return x.vid || x.id || null;
      return null;
    }).filter(Boolean);
  } catch (e) { return []; }
}

// killCtx(Game, t): the kill-time context snapshot. Pure reads.
function killCtx(Game, t) {
  const ctx = { day: gday(Game), scholarVid: null, aid: false, atHaven: false, inTb: false, onExped: false, partyVids: [], fightId: null, nMonsters: 0 };
  try { ctx.scholarVid = Game.villagerId || null; } catch (e) { err(t, 'ctx.scholarVid', e); }
  try { ctx.aid = !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) { err(t, 'ctx.aid', e); }
  try { ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { err(t, 'ctx.atHaven', e); }
  try { ctx.inTb = !!Game.tbfight; } catch (e) { err(t, 'ctx.inTb', e); }
  try {
    const st = Game.state || {};
    ctx.onExped = !!(st.exped && ctx.scholarVid && st.exped[ctx.scholarVid]);
  } catch (e) { err(t, 'ctx.onExped', e); }
  try { ctx.partyVids = partyVids(Game); } catch (e) { err(t, 'ctx.party', e); }
  try {
    const f = Game.tbfight;
    if (f) {
      ctx.fightId = f.id || null;
      ctx.nMonsters = (f.fighters || []).filter(x => x && x.kind === 'monster').length;
    }
  } catch (e) { err(t, 'ctx.fight', e); }
  return ctx;
}

// classifyKill(entry, ctx): fight-shape taxonomy for a waveKillLog entry.
// (compchan taxonomy, unchanged.)
function classifyKill(entry, ctx) {
  const via = (entry && entry.via) || 'unknown';
  ctx = ctx || {};
  if (ctx.aid || via === 'aid-crisis') return 'raid';
  if (via === 'agency') return 'agency';
  if (via === 'sortie') return 'expedition';
  if (via === 'patrol') return 'patrol';
  if (via === 'contest') return 'contest';
  if (ctx.onExped) return 'expedition';
  if (via === 'wild') return 'wild';
  if (ctx.atHaven && ctx.inTb) return 'haven-TB';
  if (ctx.inTb) return 'wild'; // scholar TB fight in the wild
  if (via === 'player' || via === 'companion') return ctx.atHaven ? 'haven-TB' : 'wild';
  return 'unknown';
}

function waveOf(Game, monsterId) {
  try {
    const m = ((Game.data || {}).monsters || []).find(x => x && x.id === monsterId);
    return (m && m.wave) || 0;
  } catch (e) { return 0; }
}

function monsterIdOf(f) {
  try { return (f && (f.monsterId || (f.mdef && f.mdef.id))) || null; } catch (e) { return null; }
}

// resolveDmgSource(Game, sourceLabel, sourceKey): 'scholar' | 'companion'
// | 'monster' | 'other'. Returns {kind, vid} — vid only for companions.
// Pure reads; never throws (callers guard anyway).
function resolveDmgSource(Game, sourceLabel, sourceKey) {
  try {
    const lbl = String(sourceLabel || '');
    if (sourceKey === 'p' || lbl === 'you' || lbl.indexOf('your ') === 0) return { kind: 'scholar', vid: null };
    if (sourceKey) {
      const sf = (typeof Game.tbFighter === 'function') ? Game.tbFighter(sourceKey) : null;
      if (sf) {
        if (sf.kind === 'player') return { kind: 'scholar', vid: null };
        if (sf.kind === 'villager' || sf.kind === 'ally') return { kind: 'companion', vid: sf.villagerId || null };
        if (sf.kind === 'monster' || sf.kind === 'hostile') return { kind: 'monster', vid: null };
      }
    }
    // Null-source damage on the player's own turn is the scholar's (ability
    // verbs that don't pass a source key). Anything else is 'other'.
    try {
      const cur = (typeof Game.tbCurrent === 'function') ? Game.tbCurrent() : null;
      if (cur && cur.kind === 'player') return { kind: 'scholar', vid: null };
    } catch (e) {}
    return { kind: 'other', vid: null };
  } catch (e) { return { kind: 'other', vid: null }; }
}

// install(Game, t): installs the read-only wraps. t = {kills, engagements,
// census, dmg, instrumentErrors}. dmg: fightId -> {scholar, companion,
// other, byVid:{}, hits}. Returns an uninstall function.
function install(Game, t) {
  if (!t.dmg) t.dmg = {};
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

  const pushKill = (pre, pyrrhic) => {
    if (!pre) return;
    try {
      let dmgTab = null;
      if (pre.ctx.fightId && t.dmg[pre.ctx.fightId]) {
        const d = t.dmg[pre.ctx.fightId];
        dmgTab = {
          scholar: Math.round(d.scholar), companion: Math.round(d.companion),
          other: Math.round(d.other), hits: d.hits,
          byVid: Object.assign({}, d.byVid),
          singleMonster: pre.ctx.nMonsters === 1,
        };
      }
      t.kills.push({
        day: pre.ctx.day, mid: pre.monsterId, wave: waveOf(Game, pre.monsterId),
        by: pre.killerVid, via: pre.via, pyrrhic: !!pyrrhic, ctx: pre.ctx,
        dmg: dmgTab,
      });
    } catch (e) { err(t, 'pushKill', e); }
  };

  // Kill attribution: recordWaveKill(monsterId, killerVid, via, detail).
  wrap('recordWaveKill',
    function (monsterId, killerVid, via) {
      const ctx = killCtx(Game, t);
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown', ctx };
    },
    function (r, pre) { pushKill(pre, false); });

  // Pyrrhic kills: recordPyrrhicKill(monsterId, killerVid, via, detail).
  wrap('recordPyrrhicKill',
    function (monsterId, killerVid, via) {
      const ctx = killCtx(Game, t);
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown', ctx };
    },
    function (r, pre) { pushKill(pre, true); });

  // Engagement census: startCombat(monsterId) — the scholar's TB entry.
  wrap('startCombat',
    function (monsterId) {
      const ctx = killCtx(Game, t);
      return { monsterId, wave: waveOf(Game, monsterId), ctx };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        t.engagements.push({
          day: pre.ctx.day, mid: pre.monsterId, wave: pre.wave,
          shape: classifyKill({ via: 'player' }, pre.ctx),
          partySize: pre.ctx.partyVids.length,
        });
      } catch (e) { err(t, 'startCombat.push', e); }
    });

  // Per-source damage on wave-3+ monsters: tbDamage(targetKey, dmg,
  // sourceLabel, sourceKey, opts). Returns the ACTUAL damage applied —
  // the after-hook attributes the landed number, not the asked number.
  wrap('tbDamage',
    function (targetKey, dmg, sourceLabel, sourceKey) {
      try {
        const f = Game.tbfight;
        if (!f) return null;
        const tgt = (typeof Game.tbFighter === 'function') ? Game.tbFighter(targetKey) : null;
        if (!tgt || tgt.kind !== 'monster') return null;
        if ((waveOf(Game, monsterIdOf(tgt)) | 0) < 3) return null;
        return { fightId: f.id || null, sourceLabel: sourceLabel || '', sourceKey: sourceKey || null };
      } catch (e) { return null; }
    },
    function (r, pre) {
      if (!pre || !pre.fightId) return;
      const final = +r || 0;
      if (!(final > 0)) return;
      try {
        const src = resolveDmgSource(Game, pre.sourceLabel, pre.sourceKey);
        if (src.kind === 'monster') return; // monster-on-monster: not a share
        const tab = t.dmg[pre.fightId] || (t.dmg[pre.fightId] = { scholar: 0, companion: 0, other: 0, byVid: {}, hits: 0 });
        tab.hits++;
        if (src.kind === 'scholar') tab.scholar += final;
        else if (src.kind === 'companion') {
          tab.companion += final;
          if (src.vid) tab.byVid[src.vid] = (tab.byVid[src.vid] || 0) + final;
        } else tab.other += final;
      } catch (e) { err(t, 'tbDamage.push', e); }
    });

  // Daily readiness census (header: cannot perturb the sim — pure reads).
  const origSleep = Game.sleep;
  if (typeof origSleep === 'function') {
    orig.sleep = origSleep;
    Game.sleep = function () {
      try {
        const day = gday(Game);
        const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1;
        let st = null;
        try { st = (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : null; } catch (e) { err(t, 'sleep.standing', e); }
        let rd = null;
        try { rd = (typeof Game.waveCombatReadiness === 'function') ? Game.waveCombatReadiness(4) : null; } catch (e) { err(t, 'sleep.readiness', e); }
        t.census.push({
          day, uw, st,
          veterans: rd ? (rd.veterans | 0) : null,
          short: rd ? (rd.short || []).slice() : null,
        });
      } catch (e) { err(t, 'sleep', e); }
      return origSleep.apply(this, arguments);
    };
  } else { err(t, 'install.missing:sleep', new Error('not a function')); }

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

module.exports = { instrumentOn, install, classifyKill, killCtx, waveOf, partyVids, resolveDmgSource, monsterIdOf };
