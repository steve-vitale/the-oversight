#!/usr/bin/env node
// windowseat-instrument-20261020.js — window-death taxonomy instrument for
// arm sim-windowseat (flesh-out loop run fleshout-20261020T2145Z, axis
// scale-onramp). DIAGNOSTIC — no lever, zero game-state writes.
//
// THE QUESTION: build the window-death taxonomy on the SEATDRIVE default-on
// substrate (the winning substrate — 10/16 wins on the wintrack/seat arm,
// all one track; the LOSERS' window deaths are unmeasured). The
// windowsurvive taxonomy (2026-10-19) measured the pre-seat+windefer
// substrate (raids 40/72 #1, scholars 42 vs villagers 30, rich-not-starving).
// This names the wall where wins actually happen.
//
// READ-ONLY observation wraps. Env-gated: install(Game, t) installs the
// wraps ONLY when process.env.WINDOWSEAT === '1'. When unset the wrappers
// are never installed and the run is byte-identical to the bare substrate
// (the proof test's DET gate pins that).
//
// Wraps (all call-through, zero game-state writes, zero RNG draws):
//   Game.recordWaveKill / Game.recordPyrrhicKill — all wave-4+ kills
//     {day, mid, wave, by, via, pyrrhic} (the kill-fight class join)
//   Game.playerDeath — scholar death-time ctx, captured in the BEFORE hook
//     (playerDeath mutates: mantle pass, health zeroing). The killattr
//     deathCtx verbatim — proven on the killattr corpus.
//   Game.havenRaidTick — raid-night ledger {day, fired} for the raid join.
//   Game.tele('death') — ALL person deaths (scholars + villagers) with
//     killattr-style ctx snapshot at tele time. Scholar teles that match
//     a playerDeath record (who,day) are dropped in the analyzer (the
//     playerDeath record is canonical — pre-mutation ctx).
//   Game.tele('combat_start') + resolvePatrol / resolveWildMonsterEncounter
//   / aidFight router wraps — fight-start records {day, mid, wave, via}
//     for the killer-wave join (the windowsurvive pattern, identical by
//     construction).
//
// Death-time ctx fields (all pure reads; every read guarded):
//   day, cause, who, player, arena (state.arenaContest), raidNight
//   (same-day raid tick fired), atHaven, inTb, noFlee (tbfight.noFlee —
//   THE #695 sealed-fight mark), fightOver, opps ([{mid,wave}] living
//   monster/hostile fighters), allies ([key] living ally/villager/player
//   fighters), onExped, router, aid (Game.aidCrisis()), loc.
//
// NOTE on atHaven for villager deaths: Game.playerAtHaven() is the
// SCHOLAR's location, not the dead villager's — same limitation as the
// windowsurvive classifier (documented there). Raid-class villager deaths
// lean on cause + raid-night join; the rule is named per row.
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
'use strict';

function instrumentOn() { return process.env.WINDOWSEAT === '1'; }

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

// monsterNameSet(Game): names + ids + the undiscovered 'unknown'
// descriptors (expedDeath stamps the DESCRIPTOR — "a toad like a war drum,
// throat swelling" is belltoad's unknown line, monsters.json:695).
function monsterNameSet(Game) {
  const set = new Set();
  try {
    for (const m of (Game.data && Game.data.monsters) || []) {
      if (!m) continue;
      if (m.name) set.add(String(m.name).toLowerCase());
      if (m.id) set.add(String(m.id).toLowerCase());
      if (m.id) set.add(String(m.id).toLowerCase().replace(/_/g, ' '));
      if (m.unknown) set.add(String(m.unknown).toLowerCase());
    }
  } catch (e) { err(null, 'monsterNameSet', e); }
  return set;
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

// deathCtx(Game, t): the death-time context snapshot. For playerDeath this
// MUST be captured in the BEFORE hook (playerDeath mutates state). For
// tele('death') it is captured post-call (the tele args carry who/cause;
// the ctx fields are death-mutation-independent — the windowsurvive
// pattern). Pure reads only.
function deathCtx(Game, t) {
  const ctx = { day: gday(Game), who: null, cause: 'unknown', player: false,
    atHaven: false, inTb: false, noFlee: false, fightOver: false,
    opps: [], allies: [], arena: false, raidNight: false, onExped: false,
    router: null, aid: false, loc: null, scholarHp: null };
  try { ctx.who = scholarVid(Game); } catch (e) { err(t, 'dctx.who', e); }
  try { ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { err(t, 'dctx.atHaven', e); }
  try { ctx.arena = !!((Game.state || {}).arenaContest); } catch (e) { err(t, 'dctx.arena', e); }
  try { ctx.raidNight = (t.raidNights || []).some(r => r.day === ctx.day && r.fired); } catch (e) { err(t, 'dctx.raid', e); }
  try {
    const f = fightCtx(Game);
    ctx.inTb = f.inTb; ctx.noFlee = f.noFlee; ctx.fightOver = f.over;
    ctx.opps = f.opps; ctx.allies = f.allies;
  } catch (e) { err(t, 'dctx.fight', e); }
  try { ctx.onExped = !!(((Game.state || {}).exped || {})[ctx.who]); } catch (e) { err(t, 'dctx.onExped', e); }
  try { ctx.aid = !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) { err(t, 'dctx.aid', e); }
  try { ctx.router = t._router || null; } catch (e) {}
  try {
    const m = Game.map;
    ctx.loc = m ? [(m.px | 0), (m.py | 0)] : null;
  } catch (e) { err(t, 'dctx.loc', e); }
  try { ctx.scholarHp = ((((Game.state || {}).scholar || {}).health) | 0) || null; } catch (e) { err(t, 'dctx.hp', e); }
  return ctx;
}

function isPersonDeath(t) {
  return !!(t.player || t.kind === 'person' || t.kind === 'villager' || t.kind === 'scholar' || t.kind == null);
}

function install(Game, t) {
  t.instrumentErrors = [];
  t.kills = [];
  t.deaths = [];       // scholar deaths from playerDeath (canonical, pre-mutation ctx)
  t.deathTeles = [];   // ALL person deaths from tele('death') (villager source; scholar fallback)
  t.raidNights = [];
  t.fightStarts = [];
  t._router = null;
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

  // recordWaveKill / recordPyrrhicKill — ALL wave-4+ kills (the kill-fight join).
  const killWrap = (pyrrhic) => [
    function (monsterId, killerVid, via) {
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown', pyrrhic };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        const w = waveOf(Game, pre.monsterId);
        if ((w | 0) < 4) return;
        t.kills.push({ day: gday(Game), mid: pre.monsterId, wave: w, by: pre.killerVid, via: pre.via, pyrrhic });
      } catch (e) { err(t, 'pushKill', e); }
    },
  ];
  const kw = killWrap(false); wrap('recordWaveKill', kw[0], kw[1]);
  const kp = killWrap(true); wrap('recordPyrrhicKill', kp[0], kp[1]);

  // playerDeath(cause) — the scholar's death choke point. BEFORE-hook ctx.
  wrap('playerDeath',
    function (cause) {
      const ctx = deathCtx(Game, t);
      ctx.cause = String(cause || 'unknown');
      ctx.player = true;
      return ctx;
    },
    function (r, pre) {
      if (!pre) return;
      try { t.deaths.push(Object.assign({ source: 'playerDeath' }, pre)); } catch (e) { err(t, 'pushDeath', e); }
    });

  // havenRaidTick() — raid-night ledger for the raid join.
  wrap('havenRaidTick',
    function () { return { day: gday(Game) }; },
    function (r, pre) {
      if (!pre) return;
      try { t.raidNights.push({ day: pre.day, fired: !!r }); } catch (e) { err(t, 'pushRaid', e); }
    });

  // Router wraps for the killer-wave join (the windowsurvive pattern,
  // identical by construction).
  const recFight = (mid, wave, via) => {
    try { t.fightStarts.push({ day: gday(Game), mid: mid != null ? String(mid) : null, wave: wave != null ? (wave | 0) : waveOf(Game, mid), via }); }
    catch (e) { err(t, 'recFight', e); }
  };
  const wrapRouter = (name, flag, midOf) => {
    try {
      const origF = Game[name];
      if (typeof origF !== 'function') { err(t, name + '.missing', new Error('not a function')); return; }
      orig[name] = origF;
      Game[name] = function (...args) {
        const prev = t._router;
        t._router = flag;
        try {
          try {
            const mid = midOf ? midOf(args) : null;
            if (mid) recFight(mid, null, 'router:' + flag);
          } catch (e) { err(t, name + '.rec', e); }
          return origF.apply(this, args);
        }
        finally { t._router = prev; }
      };
    } catch (e) { err(t, name + '.wrap', e); }
  };
  wrapRouter('resolvePatrol', 'patrol', (args) => (args[1] && args[1].id) || null);
  wrapRouter('resolveWildMonsterEncounter', 'wild', (args) => (args[1] && args[1].id) || null);
  try {
    const oAid = Game.aidFight;
    if (typeof oAid === 'function') {
      orig.aidFight = oAid;
      Game.aidFight = function (vid, mdef) {
        try { recFight(mdef && mdef.id, mdef && mdef.wave, 'aidFight'); }
        catch (e) { err(t, 'aidFight.rec', e); }
        return oAid.apply(this, arguments);
      };
    } else { err(t, 'aidFight.missing', new Error('not a function')); }
  } catch (e) { err(t, 'aidFight.wrap', e); }

  // tele — combat_start records + death capture for all person deaths.
  try {
    const oTele = Game.tele.bind(Game);
    orig.tele = Game.tele;
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'combat_start') {
          recFight(data && data.vs, data && data.wave, 'combat_start');
        }
        if (type === 'death' && isPersonDeath(data || {})) {
          const ctx = deathCtx(Game, t);
          ctx.who = data && data.who != null ? String(data.who) : null;
          ctx.cause = data && data.cause != null ? String(data.cause) : 'unknown';
          ctx.player = !!(data && data.player);
          ctx.kind = data && data.kind != null ? String(data.kind) : null;
          ctx.wave = (data && data.wave != null) ? (data.wave | 0) : null;
          ctx.onExped = !!((((Game.state || {}).exped) || {})[ctx.who]);
          t.deathTeles.push(Object.assign({ source: 'tele' }, ctx));
        }
      } catch (e) { err(t, 'tele.rec', e); }
      return r;
    };
  } catch (e) { err(t, 'tele.install', e); }

  return uninstall;
}

module.exports = { install, instrumentOn, deathCtx, fightCtx, waveOf, monsterNameSet, isPersonDeath };
