#!/usr/bin/env node
// killattr-instrument-20261020.js — deep death-attribution instrument for arm
// sim-killeraftermath (flesh-out loop run fleshout-20261020T2015Z, axis
// scale-onramp). DIAGNOSTIC — no lever, zero game-state writes.
//
// THE QUESTION (investigate-then-arm, backlog #696/#707): the
// scholarcare taxonomy (n=10) says post-wave-4-kill scholars die to
// threat-saturation 9/10, kill-fight 0, attrition 0 — killers do NOT die in
// the kill fight; they die to post-kill window threat-saturation. Policy-side
// is closed. Before any game-side lever is designed, verify the mechanism
// at depth: WHERE exactly do the killers die — haven raids? expedition
// encounters? wild encounters? sealed fights (#695)? contests?
//
// READ-ONLY observation wraps. Env-gated: install(Game, t) installs the
// wraps ONLY when process.env.KILLATTR === '1'. When unset the wrappers are
// never installed and the run is byte-identical to the bare substrate (the
// proof test's det-gate pins that).
//
// Wraps (all call-through, zero game-state writes, zero RNG draws):
//   Game.recordWaveKill   — kill-time ctx per wave-4+ kill (before-write:
//                            killCtx capture; after: push record)
//   Game.recordPyrrhicKill — same (pyrrhic=true)
//   Game.playerDeath      — death-time ctx per player death (before-capture
//                            reads state BEFORE playerDeath mutates anything)
//   Game.havenRaidTick    — raid-night ledger (day + fired) so deaths can be
//                            joined to raid nights (empty-draft shape)
//   Game.say              — stand-beat counter (the lever's visible beat:
//                            "Not alone. Not this time.") — read-only line
//                            match, zero state writes.
//
// Death-time ctx fields (all pure reads; every read guarded):
//   day, cause (the playerDeath arg), who (Game.villagerId), atHaven,
//   inTb, onExped, loc [map.px,map.py], arenaContest, raidNight (same-day
//   raid tick fired), fightNoFlee (tbfight.noFlee), fightOpps ([{mid,wave}]
//   of living monster/hostile fighters at death time), fightAllies (keys of
//   living ally/villager/player fighters — "was the scholar alone?"),
//   fightOver (tbfight.over — dissolve paths).
//
// Kill-time ctx fields: day, mid, wave, by, via, pyrrhic, atHaven, inTb,
// onExped, loc, partyVids, scholarHp (state.scholar.health — how hurt the
// killer walks out of the kill fight), fightNoFlee.
//
// Determinism note: tbfight.id contains Date.now() — used only as an
// in-run map key, never persisted to per-seed JSON. Raid nights record
// day numbers only. Re-runs are byte-comparable per seed.
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
'use strict';

function instrumentOn() { return process.env.KILLATTR === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day) | 0 || 0; } catch (e) { return 0; }
}

function scholarVid(Game) {
  try { return Game.villagerId || null; } catch (e) { return null; }
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

// fightCtx(Game): read-only snapshot of the live TB fight (or nulls).
function fightCtx(Game) {
  const out = { inTb: false, noFlee: false, over: false, opps: [], allies: [] };
  try {
    const f = Game.tbfight;
    if (!f) return out;
    out.inTb = true;
    out.noFlee = !!f.noFlee;
    out.over = !!f.over;
    const fighters = f.fighters || [];
    for (const x of fighters) {
      if (!x) continue;
      const k = x.kind;
      if ((k === 'monster' || k === 'hostile') && x.alive) {
        const mid = monsterIdOf(x);
        out.opps.push({ mid, wave: waveOf(Game, mid) });
      } else if ((k === 'ally' || k === 'villager' || k === 'player') && x.alive) {
        out.allies.push(String(x.key || x.vid || '?'));
      }
    }
  } catch (e) { /* guarded by caller */ }
  return out;
}

// killCtx(Game, t): the kill-time context snapshot. Pure reads.
function killCtx(Game, t) {
  const ctx = { day: gday(Game), scholarVid: scholarVid(Game), atHaven: false,
    inTb: false, onExped: false, loc: null, partyVids: [], scholarHp: null,
    noFlee: false, opps: 0 };
  try { ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { err(t, 'ctx.atHaven', e); }
  try { ctx.onExped = !!(((Game.state || {}).exped || {})[ctx.scholarVid]); } catch (e) { err(t, 'ctx.onExped', e); }
  try {
    const m = Game.map;
    ctx.loc = m ? [(m.px | 0), (m.py | 0)] : null;
  } catch (e) { err(t, 'ctx.loc', e); }
  try { ctx.partyVids = partyVids(Game); } catch (e) { err(t, 'ctx.party', e); }
  try { ctx.scholarHp = ((((Game.state || {}).scholar || {}).health) | 0) || null; } catch (e) { err(t, 'ctx.hp', e); }
  try {
    const f = fightCtx(Game);
    ctx.inTb = f.inTb; ctx.noFlee = f.noFlee; ctx.opps = f.opps.length;
  } catch (e) { err(t, 'ctx.fight', e); }
  return ctx;
}

// deathCtx(Game, t): the death-time context snapshot. MUST be captured in
// the BEFORE hook of playerDeath (playerDeath mutates state: mantle pass,
// health zeroing, over=true). Pure reads only.
function deathCtx(Game, t) {
  const ctx = killCtx(Game, t); // base shape shared
  ctx.cause = null; ctx.who = null; ctx.arena = false; ctx.raidNight = false;
  ctx.opps = []; ctx.allies = []; ctx.fightOver = false;
  try { ctx.who = scholarVid(Game); } catch (e) { err(t, 'dctx.who', e); }
  try { ctx.arena = !!((Game.state || {}).arenaContest); } catch (e) { err(t, 'dctx.arena', e); }
  try { ctx.raidNight = (t.raidNights || []).some(r => r.day === ctx.day && r.fired); } catch (e) { err(t, 'dctx.raid', e); }
  try {
    const f = fightCtx(Game);
    ctx.inTb = f.inTb; ctx.noFlee = f.noFlee; ctx.fightOver = f.over;
    ctx.opps = f.opps; ctx.allies = f.allies;
  } catch (e) { err(t, 'dctx.fight', e); }
  return ctx;
}

function install(Game, t) {
  t.instrumentErrors = [];
  t.kills = [];
  t.deaths = [];
  t.raidNights = [];
  t.standBeats = 0;
  const orig = {};
  const uninstall = () => {
    for (const name of Object.keys(orig)) {
      try { Game[name] = orig[name]; } catch (e) {}
    }
  };
  const wrap = (name, before, after) => {
    let o;
    try { o = Game[name]; } catch (e) { err(t, name + '.read', e); return; }
    if (typeof o !== 'function') { err(t, name + '.missing', new Error('not a function')); return; }
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

  // recordWaveKill(monsterId, killerVid, via, detail) — wave-4+ only kept.
  wrap('recordWaveKill',
    function (monsterId, killerVid, via) {
      const ctx = killCtx(Game, t);
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown', pyrrhic: false, ctx };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        const w = waveOf(Game, pre.monsterId);
        if ((w | 0) < 4) return; // wave-4+ kills only (the veteran channel)
        t.kills.push({ day: pre.ctx.day, mid: pre.monsterId, wave: w, by: pre.killerVid,
          via: pre.via, pyrrhic: false, ctx: pre.ctx });
      } catch (e) { err(t, 'pushKill', e); }
    });

  // recordPyrrhicKill(monsterId, killerVid, via, detail) — same.
  wrap('recordPyrrhicKill',
    function (monsterId, killerVid, via) {
      const ctx = killCtx(Game, t);
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown', pyrrhic: true, ctx };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        const w = waveOf(Game, pre.monsterId);
        if ((w | 0) < 4) return;
        t.kills.push({ day: pre.ctx.day, mid: pre.monsterId, wave: w, by: pre.killerVid,
          via: pre.via, pyrrhic: true, ctx: pre.ctx });
      } catch (e) { err(t, 'pushPyrrhic', e); }
    });

  // playerDeath(cause) — the engine's death choke point for the scholar.
  wrap('playerDeath',
    function (cause) {
      const ctx = deathCtx(Game, t);
      ctx.cause = String(cause || 'unknown');
      return ctx;
    },
    function (r, pre) {
      if (!pre) return;
      try { t.deaths.push(pre); } catch (e) { err(t, 'pushDeath', e); }
    });

  // havenRaidTick() — raid-night ledger for the raid join.
  wrap('havenRaidTick',
    function () { return { day: gday(Game) }; },
    function (r, pre) {
      if (!pre) return;
      try { t.raidNights.push({ day: pre.day, fired: !!r }); } catch (e) { err(t, 'pushRaid', e); }
    });

  // Game.say — stand-beat counter (read-only line match).
  try {
    const oSay = Game.say.bind(Game);
    orig.say = Game.say;
    Game.say = function (line) {
      try { if (/Not alone\. Not this time/.test(String(line))) t.standBeats++; }
      catch (e) { err(t, 'say.before', e); }
      return oSay.apply(this, arguments);
    };
  } catch (e) { err(t, 'say.install', e); }

  return uninstall;
}

module.exports = { install, instrumentOn, killCtx, deathCtx, waveOf };
