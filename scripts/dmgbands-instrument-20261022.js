#!/usr/bin/env node
// dmgbands-instrument-20261022.js — companion damage vs wave-4 HP-band
// diagnostic instrument (sim-dmg-bands, 2026-10-22, axis scale-onramp).
// DIAGNOSTIC — no lever. Zero src/js changes.
//
// Named next of two closed arms:
//  - sim-stagemuster (pilot NO-GO): staged companions in wave-4 TB fights
//    die without landing kills — 0 damage-majority villager wave-4 kills
//    across 76 staged fights. The bottleneck is companion damage output
//    vs wave-4 bands (dmg 35-95, HP 850-1500).
//  - sim-wave4engage-r2 (KILLED-AT-PILOT): "instrument companion damage-vs-
//    wave-4-bands first, then test a fight-level intervention."
//
// Canon: docs/MONSTER-WAVES.md — wave 4 = The Mirror Draft, bands anchored
// (damage 35-95, HP 850-1500, pierce 0.2-0.5). Band edges below come from
// that anchor, not from invention.
//
// Hooks (all call-through, zero game-state writes, zero RNG draws):
//   Game.startCombat   — TB fight census: per wave-4 monster fighter, the
//                        HP pool at fight start (maxHp || hp) + staged
//                        companions (live villager/ally fighters in the
//                        formal party — splitkill's stagedCompanionsOf
//                        logic, inlined, no policy dependency) + the
//                        overtime RERUN tier (overtime.js overtimeScaleFight:
//                        wave-4+ monsters return at +25% HP/tier with +1
//                        packmate per 2 tiers — the measured pools run
//                        2-3x the canon anchor on rerun tiers; the tier is
//                        the named mechanism, the base pool the named band).
//   Game.tbDamage      — per-source damage on wave-4 monsters (scholar vs
//                        companion byVid vs monster-excluded vs other),
//                        keyed per (fight, monster fighter). Returns the
//                        ACTUAL landed damage — the after-hook attributes
//                        the landed number, not the asked number.
//                        Mid-fight joiners (reinforcements added after the
//                        startCombat census — pack delays, pack-leader
//                        packmates) are census-created here and tracked in
//                        t.midfightJoins (informational, not an error).
//   Game.tbEnd         — fight outcome per fightId (won/lost/fled/...).
//   Game.fieldFight    — villager-side wave-4 encounters: vid, monster,
//                        pool (m.hp when present, else mDealt + mHpLeft),
//                        rounds, outcome, vTaken, mDealt (villager damage).
//   Game.recordWaveKill / Game.recordPyrrhicKill — kill linkage: TB kills
//                        via the live tbfight fightId; field kills via the
//                        active field encounter. Unlinkable kills go to
//                        t.orphanKills (the attribution metric's residual).
//
// Per-encounter record (t.enc):
//   {seq, kind, day, mid, wave, pool, band, mechanism, vid, stagedVids,
//    rerunTier, dmgScholar, dmgCompanion, byVid, dmgOther, hits, rounds,
//    outcome, vTaken, kill, killBy, killVia, killBearer, fightOutcome}
//
// band: HP-pool band from the canon anchor on the MEASURED pool — L
// (850-1050), M (1051-1250), H (1251-1500); UNK when the pool is missing
// or outside the anchor. Overtime RERUN tiers scale pools above the
// anchor; the analyzer derives baseBand = bandOf(pool / (1+0.25*tier))
// so rerun encounters land in their monster's named band cell with the
// tier as the named mechanism multiplier (overtime.js: hpPerTier 0.25).
// mechanism: 'tb' (scholar's fight, companions present) or 'field'
// (villager's off-screen fight).
//
// Env-gated on DMGBANDS=1 (contract: instrumentOn(), install(Game, t),
// uninstall; when unset the wrappers are never installed and the policy
// path is byte-identical — the proof test's det-gate pins that).
//
// NOTE on determinism: Game.tbfight.id contains Date.now() — used ONLY as
// an in-run map key and NEVER written to the per-seed JSON. Encounter
// records carry a per-run ordinal seq. Re-runs are byte-identical on the
// serialized fields (proven by the proof test's E4 gate).
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
'use strict';

function instrumentOn() { return process.env.DMGBANDS === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
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

// bandOf(pool): canon-anchored HP bands (MONSTER-WAVES.md: wave-4 HP
// 850-1500). UNK is the honest residual — missing pools and out-of-anchor
// pools are reported, never silently folded into a named band.
function bandOf(pool) {
  const p = +pool;
  if (!Number.isFinite(p) || p <= 0) return 'UNK';
  if (p < 850 || p > 1500) return 'UNK';
  if (p <= 1050) return 'L';
  if (p <= 1250) return 'M';
  return 'H';
}

// resolveDmgSource(Game, sourceLabel, sourceKey): 'scholar' | 'companion'
// | 'monster' | 'other'. Returns {kind, vid} — vid only for companions.
// Mirrors killdisc-instrument-20261021.js's resolution (proven on two
// corpora); kept in sync by the proof test's fixture.
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
    // Null-source damage on the player's own turn is the scholar's
    // (ability verbs that don't pass a source key). Anything else is
    // 'other' — reported, never silently folded into a named source.
    try {
      const cur = (typeof Game.tbCurrent === 'function') ? Game.tbCurrent() : null;
      if (cur && cur.kind === 'player') return { kind: 'scholar', vid: null };
    } catch (e) {}
    return { kind: 'other', vid: null };
  } catch (e) { return { kind: 'other', vid: null }; }
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

function newEnc(t, fields) {
  const e = Object.assign({
    seq: t._seq = (t._seq | 0) + 1,
    kind: null, day: 0, mid: null, wave: 4, pool: null, band: 'UNK',
    mechanism: null, vid: null, stagedVids: [], rerunTier: 0,
    dmgScholar: 0, dmgCompanion: 0, byVid: {}, dmgOther: 0, hits: 0,
    rounds: null, outcome: null, vTaken: null,
    kill: false, killBy: null, killVia: null, killBearer: null,
    fightOutcome: null,
  }, fields || {});
  t.enc.push(e);
  return e;
}

function markKill(Game, t, enc, monsterId, killerVid, via, pyrrhic) {
  try {
    enc.kill = true;
    enc.killBy = killerVid || null;
    enc.killVia = (via || 'unknown') + (pyrrhic ? '+pyrrhic' : '');
    try { enc.killBearer = Game.villagerId || null; } catch (e) {}
  } catch (e) { err(t, 'markKill', e); }
}

// encJSON(e): serialization-safe copy — strips internal (underscore)
// keys like _fightKey, which must never reach the per-seed JSON
// (killdisc's Date.now-id rule, same class).
function encJSON(e) {
  const o = {};
  for (const k of Object.keys(e || {})) {
    if (k.charAt(0) === '_') continue;
    const v = e[k];
    o[k] = (v && typeof v === 'object') ? JSON.parse(JSON.stringify(v)) : v;
  }
  return o;
}

// rerunTier(Game): the overtime RERUN tier at fight time (0 = base).
// Pure read; 0 when overtime is absent or the method is missing.
function rerunTier(Game) {
  try {
    if (typeof Game.overtimeTier === 'function') return Game.overtimeTier() | 0;
  } catch (e) {}
  return 0;
}

// install(Game, t): installs the read-only wraps.
// t = {enc: [], orphanKills: [], midfightJoins: [], tbOutcomes: {}, instrumentErrors: []}.
function install(Game, t) {
  const orig = {};
  if (!instrumentOn()) return function uninstall() {};
  if (!t.enc) t.enc = [];
  if (!t.orphanKills) t.orphanKills = [];
  if (!t.midfightJoins) t.midfightJoins = [];
  if (!t.tbOutcomes) t.tbOutcomes = {};
  if (!t.instrumentErrors) t.instrumentErrors = [];
  t.encByFight = {};   // fightId -> [enc] (internal key only, never serialized)
  t.activeField = null;

  function wrap(name, pre, post) {
    const o = Game[name];
    if (typeof o !== 'function') { err(t, 'install.missing:' + name, new Error('not a function')); return; }
    orig[name] = o.bind(Game);
    Game[name] = function () {
      let p = null;
      try { p = pre ? pre.apply(this, arguments) : null; } catch (e) { err(t, name + '.pre', e); }
      let r;
      try { r = orig[name].apply(this, arguments); }
      finally {
        try { if (post) post.call(this, r, p); } catch (e) { err(t, name + '.post', e); }
      }
      return r;
    };
  }

  // TB fight census: per wave-4 monster fighter, the HP pool at fight
  // start + the staged companions (splitkill's stagedCompanionsOf logic).
  wrap('startCombat',
    function () {
      let beforeId = null;
      try { beforeId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      return { day: gday(Game), beforeId };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        let f = null;
        try { f = Game.tbfight; } catch (e) {}
        if (!f || f.over) return;
        const afterId = f.id || null;
        if (!afterId || afterId === pre.beforeId) return; // no new fight
        const party = partyVids(Game);
        const staged = (f.fighters || []).filter(x => x && x.alive && !x.fled &&
          (x.kind === 'villager' || x.kind === 'ally') && x.villagerId && party.includes(x.villagerId))
          .map(x => x.villagerId);
        const list = [];
        const tier = rerunTier(Game);
        for (const mf of (f.fighters || [])) {
          if (!mf || mf.kind !== 'monster') continue;
          const mid = monsterIdOf(mf);
          if (!mid || (waveOf(Game, mid) | 0) !== 4) continue;
          let pool = null;
          try { pool = (mf.maxHp != null ? +mf.maxHp : (mf.hp != null ? +mf.hp : null)); } catch (e) {}
          if (!Number.isFinite(pool) || pool <= 0) pool = null;
          const e = newEnc(t, {
            kind: 'tb', day: pre.day, mid, wave: 4,
            pool, band: bandOf(pool), mechanism: 'tb',
            stagedVids: staged.slice(), rerunTier: tier,
          });
          e._fightKey = afterId + '|' + (mf.key || '?');
          list.push(e);
        }
        if (list.length) t.encByFight[afterId] = list;
      } catch (e) { err(t, 'startCombat.push', e); }
    });

  // Per-source damage on wave-4 monsters: tbDamage(targetKey, dmg,
  // sourceLabel, sourceKey, opts). Returns the ACTUAL damage applied —
  // the after-hook attributes the landed number, not the asked number.
  wrap('tbDamage',
    function (targetKey, dmg, sourceLabel, sourceKey) {
      try {
        const f = Game.tbfight;
        if (!f || !f.id) return null;
        const tgt = (typeof Game.tbFighter === 'function') ? Game.tbFighter(targetKey) : null;
        if (!tgt || tgt.kind !== 'monster') return null;
        const mid = monsterIdOf(tgt);
        if (!mid || (waveOf(Game, mid) | 0) !== 4) return null;
        return { fightId: f.id, fightKey: f.id + '|' + targetKey, targetKey, mid, sourceLabel: sourceLabel || '', sourceKey: sourceKey || null };
      } catch (e) { return null; }
    },
    function (r, pre) {
      if (!pre || !pre.fightKey) return;
      const final = +r || 0;
      if (!(final > 0)) return;
      try {
        const src = resolveDmgSource(Game, pre.sourceLabel, pre.sourceKey);
        if (src.kind === 'monster') return; // monster-on-monster: not a share
        let enc = null;
        for (const c of (t.encByFight[pre.fightId] || [])) {
          if (c._fightKey === pre.fightKey) { enc = c; break; }
        }
        if (!enc) {
          // Mid-fight joiner (reinforcements arrive after the startCombat
          // census — pack delays, pack-leader packmates): census-create it
          // here so the damage is never silently dropped. Tracked
          // informationally in t.midfightJoins, not as an error.
          let pool = null, mid = pre.mid;
          try {
            const tgt = Game.tbFighter(pre.targetKey);
            if (tgt) { pool = (tgt.maxHp != null ? +tgt.maxHp : (tgt.hp != null ? +tgt.hp : null)); if (!Number.isFinite(pool) || pool <= 0) pool = null; }
          } catch (e) {}
          enc = newEnc(t, { kind: 'tb', day: gday(Game), mid, wave: 4, pool, band: bandOf(pool), mechanism: 'tb', rerunTier: rerunTier(Game) });
          enc._fightKey = pre.fightKey;
          (t.encByFight[pre.fightId] || (t.encByFight[pre.fightId] = [])).push(enc);
          try { t.midfightJoins.push({ day: gday(Game), mid, fightKey: pre.fightKey }); } catch (e) {}
        }
        enc.hits++;
        if (src.kind === 'scholar') enc.dmgScholar += final;
        else if (src.kind === 'companion') {
          enc.dmgCompanion += final;
          if (src.vid) enc.byVid[src.vid] = (enc.byVid[src.vid] || 0) + final;
        } else enc.dmgOther += final;
      } catch (e) { err(t, 'tbDamage.push', e); }
    });

  // TB fight end outcome, matched by fightId.
  wrap('tbEnd',
    function (result) {
      let fightId = null;
      try { fightId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      return { fightId, result: (result === undefined || result === null) ? 'unknown' : String(result) };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        if (pre.fightId) {
          t.tbOutcomes[pre.fightId] = pre.result;
          for (const e of (t.encByFight[pre.fightId] || [])) e.fightOutcome = pre.result;
        }
      } catch (e) { err(t, 'tbEnd.push', e); }
    });

  // The blow-by-blow villager path — recorded for wave 4. The pre-hook
  // creates the encounter and registers it as t.activeField BEFORE the
  // original runs, because recordWaveKill fires DURING fieldFight (before
  // any post-hook could link it). The post-hook fills the record from the
  // fight rec and clears the registration (finally-safe via wrap()).
  wrap('fieldFight',
    function (vid, mdef, m) {
      let mid = null, wave = 0, pool = null;
      try { mid = (mdef && mdef.id) || null; wave = mid ? waveOf(Game, mid) : 0; } catch (e) {}
      try { if (m && m.hp != null) { const h = +m.hp; if (Number.isFinite(h) && h > 0) pool = h; } } catch (e) {}
      const vidS = (vid === undefined || vid === null) ? null : String(vid);
      let enc = null;
      if ((wave | 0) === 4) {
        enc = newEnc(t, {
          kind: 'field', day: gday(Game), mid, wave: 4,
          pool: null, band: 'UNK', mechanism: 'field', vid: vidS,
        });
        t.activeField = enc;
      }
      return { vid: vidS, mid, wave, pool, enc };
    },
    function (r, pre) {
      if (!pre) { try { t.activeField = null; } catch (e) {} return; }
      try {
        const enc = pre.enc;
        if (t.activeField === enc) t.activeField = null;
        if ((pre.wave | 0) !== 4 || !enc) return;
        const rec = (r && typeof r === 'object') ? r : null;
        const mDealt = rec && rec.mDealt != null ? +rec.mDealt || 0 : 0;
        let pool = pre.pool;
        if (pool == null && rec) {
          const left = rec.mHpLeft != null ? +rec.mHpLeft || 0 : 0;
          pool = mDealt + Math.max(0, left);
          if (!(pool > 0)) pool = null;
        }
        enc.pool = pool;
        enc.band = bandOf(pool);
        enc.dmgCompanion = mDealt;
        if (pre.vid && mDealt > 0) enc.byVid[pre.vid] = (enc.byVid[pre.vid] || 0) + mDealt;
        enc.hits = 1;
        enc.rounds = rec && rec.rounds != null ? rec.rounds : null;
        enc.outcome = rec && rec.outcome != null ? String(rec.outcome) : 'unresolved';
        enc.vTaken = rec && rec.vTaken != null ? rec.vTaken : null;
      } catch (e) { err(t, 'fieldFight.push', e); }
    });

  function pushKill(pre, pyrrhic) {
    if (!pre) return;
    try {
      const monsterId = pre.monsterId;
      if (!monsterId || (waveOf(Game, monsterId) | 0) !== 4) return;
      const killerVid = pre.killerVid, via = pre.via;
      // Tightest scope first: a live field encounter.
      if (t.activeField && t.activeField.mid === monsterId && !t.activeField.kill) {
        markKill(Game, t, t.activeField, monsterId, killerVid, via, pyrrhic);
        return;
      }
      // Otherwise the scholar's TB fight.
      let f = null;
      try { f = Game.tbfight; } catch (e) {}
      if (f && f.id && t.encByFight[f.id]) {
        const cands = t.encByFight[f.id].filter(e => e.mid === monsterId && !e.kill);
        if (cands.length) { markKill(Game, t, cands[0], monsterId, killerVid, via, pyrrhic); return; }
      }
      // Unlinkable — the attribution metric's residual. Never silent.
      t.orphanKills.push({ day: gday(Game), mid: monsterId, by: killerVid || null, via: via || 'unknown', pyrrhic: !!pyrrhic });
    } catch (e) { err(t, 'pushKill', e); }
  }

  // Kill attribution: recordWaveKill(monsterId, killerVid, via, detail).
  wrap('recordWaveKill',
    function (monsterId, killerVid, via) {
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown' };
    },
    function (r, pre) { pushKill(pre, false); });

  wrap('recordPyrrhicKill',
    function (monsterId, killerVid, via) {
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown' };
    },
    function (r, pre) { pushKill(pre, true); });

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { instrumentOn, install, encJSON, bandOf, rerunTier, resolveDmgSource, waveOf };
}
