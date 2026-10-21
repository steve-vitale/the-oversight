#!/usr/bin/env node
// killdisc-instrument-20261021.js — kill-discipline diagnostic instrument v2
// (sim-killdisc, 2026-10-21, axis scale-onramp). DIAGNOSTIC — no lever.
//
// Extends killdisc-instrument-20261018.js (backlog #736, zero-veteran
// survivors): v1 captured scholar TB fights (startCombat), kills
// (recordWaveKill/recordPyrrhicKill) and per-source damage — but villager
// field fights (Game.fieldFight, the villager-side blow-by-blow path) were
// invisible in the engagement census, wave-4+ spawns were never counted, and
// scholar TB fights had no recorded end outcome. So "wave 4 unlocked 20+
// days, zero wave-4+ villager kills" could not be attributed: no encounters?
// break-offs? scholar soloing? the draw never targeting villagers?
//
// v2 closes the gaps, all read-only, env-gated on KILLDISC=1 (unchanged
// contract: instrumentOn(), install(Game, t), uninstall; when unset the
// wrappers are never installed and the policy path is byte-identical to the
// base — the proof test's det-gate pins that).
//
// Wraps (all call-through, zero game-state writes, zero RNG draws):
//   Game.recordWaveKill      — kill-time ctx capture per kill + fight dmg table
//   Game.recordPyrrhicKill   — same (pyrrhic=true)
//   Game.startCombat         — engagement census (scholar TB fights) + fightId
//                              capture; startCombat calls that produce NO new
//                              fight (titan muster gate refused) are recorded
//                              with started=false (TB-REFUSED class)
//   Game.tbEnd               — TB fight outcome by fightId ('won'/'lost'/'fled'/...)
//   Game.fieldFight          — villager-side engagement census (wave>=3): vid,
//                              monster, wave, outcome (evade|vKill|mFlee|vFlee|
//                              vDie|alreadyDead|null), rounds, wounds both ways
//   Game.castMonster         — spawn census: every world cast's id/wave/veteran flag
//   Game.sleep               — daily readiness census (standing, veterans, window)
//   Game.tbDamage            — per-source damage on wave-3+ monsters (scholar
//                              vs companion vs other), keyed by fight id
//
// Damage resolution (resolveDmgSource): the scholar's strikes arrive as
// ('you', null) / ('p', ...) / ('your ...', ...); villager allies pass
// v.key (game.js:35486). Monster-sourced and unresolvable damage is counted
// as 'other' and reported separately — if other-share is large the
// instrument needs refinement, not silent trust.
//
// NOTE on determinism: tbfight.id contains Date.now() — it is used ONLY as
// an in-run map key and is NEVER written to the per-seed JSON. The attached
// dmg tables (aggregates) and outcome records are RNG-determined and re-run
// byte-identical (proven by the proof test's real-sweep gate).
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

// classifyFieldFight(rec, wave): outcome taxonomy for a fieldFight record
// (fieldFights.js: outcomes evade | vKill | mFlee | vFlee | vDie |
// alreadyDead, plus the null initial when a run ended without resolution).
// Returns one of the outcome names, or 'unresolved' when the record carries
// no recognizable outcome — the residual the attribution gate watches.
function classifyFieldFight(rec, wave) {
  try {
    if (!rec || typeof rec !== 'object') return 'unresolved';
    const o = rec.outcome;
    if (o === 'evade' || o === 'vKill' || o === 'mFlee' || o === 'vFlee' || o === 'vDie' || o === 'alreadyDead') return o;
    return 'unresolved';
  } catch (e) { return 'unresolved'; }
}

// install(Game, t): installs the read-only wraps. t = {kills, engagements,
// fieldFights, spawns, tbOutcomes, census, dmg, instrumentErrors}.
// fieldFights: per-fight {day, vid, mid, wave, outcome, rounds, vTaken,
//   mDealt, vHpLeft, mHpLeft, shape} — recorded for wave>=3 (context) and
//   primary wave>=4.
// spawns: castMonster events {day, mid, wave, veteran}.
// tbOutcomes: fightId -> result (TB fight end, matched to engagements via fightId).
// Returns an uninstall function.
function install(Game, t) {
  if (!t.dmg) t.dmg = {};
  if (!t.fieldFights) t.fieldFights = [];
  if (!t.spawns) t.spawns = [];
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
  // After-hook captures the live fight id for tbEnd matching. A call that
  // produces NO new fight (titan entry gate refused the muster-less solo —
  // titans.js "no solo titans", or any other refusal) is recorded with
  // started=false: TB-REFUSED is a real mechanism class, not an engagement.
  wrap('startCombat',
    function (monsterId) {
      const ctx = killCtx(Game, t);
      let beforeId = null;
      try { beforeId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      return { monsterId, wave: waveOf(Game, monsterId), ctx, beforeId };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        let afterId = null;
        try { afterId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
        const started = !!(afterId && afterId !== pre.beforeId);
        t.engagements.push({
          day: pre.ctx.day, mid: pre.monsterId, wave: pre.wave,
          shape: classifyKill({ via: 'player' }, pre.ctx),
          partySize: pre.ctx.partyVids.length,
          fightId: started ? afterId : null,
          started: started,
        });
      } catch (e) { err(t, 'startCombat.push', e); }
    });

  // TB fight end outcome: tbEnd(result) — matched to engagements by fightId.
  wrap('tbEnd',
    function (result) {
      let fightId = null;
      try { fightId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      return { fightId, result: (result === undefined || result === null) ? 'unknown' : String(result) };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        if (pre.fightId) t.tbOutcomes[pre.fightId] = pre.result;
        else t.tbOutcomes['no-fight-id:' + pre.result] = (t.tbOutcomes['no-fight-id:' + pre.result] || 0) + 1;
      } catch (e) { err(t, 'tbEnd.push', e); }
    });

  // Fight-dissolve path: tbBarrierExit dissolves an in-progress fight when
  // the bearer changed (succession) or the game ended — tbfight.result =
  // 'dissolved' WITHOUT calling tbEnd (game.js:33630). Without this wrap,
  // dissolved fights show up as TB engagements with no end outcome. The
  // dissolve condition is this.over || villagerId-changed; we mirror it.
  wrap('tbBarrierExit',
    function () {
      let f = null, bearer = null, over = false;
      try { f = Game.tbfight || null; } catch (e) {}
      try { bearer = Game.villagerId; } catch (e) {}
      try { over = !!Game.over; } catch (e) {}
      return { fightId: f ? (f.id || null) : null, hadFight: !!f, bearer, over };
    },
    function (r, pre) {
      if (!pre || !pre.fightId || !pre.hadFight) return;
      try {
        if (t.tbOutcomes[pre.fightId]) return; // tbEnd already recorded it
        if (Game.tbfight) return; // fight still live — not dissolved
        let nb = null, nover = false;
        try { nb = Game.villagerId; } catch (e) {}
        try { nover = !!Game.over; } catch (e) {}
        if (nover || nb !== pre.bearer) t.tbOutcomes[pre.fightId] = 'dissolved';
      } catch (e) { err(t, 'tbBarrierExit.push', e); }
    });
  // The blow-by-blow villager path — recorded for wave>=3 (wave 4+ primary).
  wrap('fieldFight',
    function (vid, mdef, m, opts) {
      let mid = null;
      try { mid = (mdef && mdef.id) || null; } catch (e) {}
      const ctx = killCtx(Game, t);
      return { vid: (vid === undefined || vid === null) ? null : String(vid), mid, wave: mid ? waveOf(Game, mid) : 0, ctx };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        if ((pre.wave | 0) < 3) return; // context only from wave 3 up
        const rec = (r && typeof r === 'object') ? r : null;
        const outcome = classifyFieldFight(rec, pre.wave);
        t.fieldFights.push({
          day: pre.ctx.day, vid: pre.vid, mid: pre.mid, wave: pre.wave,
          outcome,
          rounds: rec && rec.rounds != null ? rec.rounds : null,
          vTaken: rec && rec.vTaken != null ? rec.vTaken : null,
          mDealt: rec && rec.mDealt != null ? rec.mDealt : null,
          vHpLeft: rec && rec.vHpLeft != null ? rec.vHpLeft : null,
          mHpLeft: rec && rec.mHpLeft != null ? rec.mHpLeft : null,
        });
      } catch (e) { err(t, 'fieldFight.push', e); }
    });

  // Spawn census: castMonster() — the wanderer/contest casting path.
  // NOTE: castMonster is NOT the only spawn route. maintainWorldMonsters
  // (the roaming population top-up) and checkEncounter go through
  // spawnWorldMonster() directly — wrapped below. Both feeds are needed to
  // answer "no wave-4 encounters at all?".
  wrap('castMonster',
    function () { return { day: gday(Game) }; },
    function (r, pre) {
      if (!pre) return;
      try {
        let mid = null, veteran = false;
        if (typeof r === 'string') mid = r;
        else if (r && typeof r === 'object') { mid = r.id || null; veteran = !!r.veteran; }
        if (!mid) return;
        t.spawns.push({ day: pre.day, mid, wave: waveOf(Game, mid), veteran, src: 'cast' });
      } catch (e) { err(t, 'castMonster.push', e); }
    });

  // World-spawn census: spawnWorldMonster(mdef, tx, ty, opts) — the real
  // world-entity spawn choke point (maintainWorldMonsters top-up,
  // checkEncounter, wanderer, fled re-spawn, traps). mdef may be an id
  // string or a def object. Record wave-3+ spawns.
  wrap('spawnWorldMonster',
    function (mdef, tx, ty) { return { day: gday(Game), mdef: mdef }; },
    function (r, pre) {
      if (!pre) return;
      try {
        let mid = null;
        const md = pre.mdef;
        if (typeof md === 'string') mid = md;
        else if (md && typeof md === 'object') mid = md.id || null;
        if (!mid) return;
        const wave = waveOf(Game, mid) | 0;
        if (wave < 3) return;
        t.spawns.push({ day: pre.day, mid, wave, veteran: false, src: 'world' });
      } catch (e) { err(t, 'spawnWorldMonster.push', e); }
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
        let raw = null, capped = null;
        try { const vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null; raw = vs ? (vs.total | 0) : null; } catch (e) { err(t, 'sleep.raw', e); }
        try { capped = (typeof Game.standingPlentyCappedTotal === 'function') ? Game.standingPlentyCappedTotal() : null; } catch (e) { err(t, 'sleep.capped', e); }
        let rd = null;
        try { rd = (typeof Game.waveCombatReadiness === 'function') ? Game.waveCombatReadiness(4) : null; } catch (e) { err(t, 'sleep.readiness', e); }
        t.census.push({
          day, uw, raw, capped,
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

module.exports = { instrumentOn, install, classifyKill, killCtx, waveOf, partyVids, resolveDmgSource, monsterIdOf, classifyFieldFight };
