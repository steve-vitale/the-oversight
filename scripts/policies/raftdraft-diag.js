// raftdraft-diag — raid draft composition recorder (sim-raftdraft-a,
// 2026-10-25, flesh-out loop, axis scale-onramp).
//
// QUESTION (not a claim): the 0535Z run found only 7 of 119
// toll-marked meetings were wave-3+, and 114 arrived at exactly 1 HP.
// WHY do raids draft mostly wave-1/2 monsters — is it the
// nearest-first draft rule (havenGrowth.js havenRaidTick sorts the
// living world monsters by Manhattan distance to Haven and takes the
// first raidN), or is the world pool itself mostly wave-1/2 at raid
// time? This recorder decomposes the draft; it fixes nothing.
//
// MECHANISM, READ FROM CODE (src/js/havenGrowth.js havenRaidTick,
// never invented):
//   - Gates: 3+ living world monsters (hp > 0), pantry >= 3000 kcal,
//     >= 7 days since last raid (overtime knobs may shorten it),
//     ~18% roll (skip 0.82), no raids while the table sits.
//   - Draft: living monsters sorted by Manhattan distance
//     |tx-hx| + |ty-hy| to Haven (v.px ?? 4, v.py ?? 4), first raidN
//     taken, raidN = min(5, 3 + (pantry > 12000) + (pantry > 24000)).
//   - Toll: if havenTier() >= 2 (palisade), every drafted raider takes
//     wall = round(maxHp * 0.25) damage, floored at 1 HP:
//     hp = max(1, hp - wall). Wave via crisisWaveOf(m) — m.wave is
//     never on the entity (havenGrowth.js crisisWaveOf comment).
//   - Defenders then fight the raiders in the same tick via
//     resolveWildMonsterEncounter, so a post-tick read of a raider
//     already includes defender-fight wounds. The recorder therefore
//     reports THREE hp values per raider: pre-toll (pre-call pool
//     snapshot), post-toll (computed from the code formula, so the
//     toll step itself — not the tick diff — is the instrument,
//     per the 0535Z metric review), and post-call (live world list
//     after the tick, defender fights included).
//
// OBSERVATIONAL ONLY. RAFTDRAFT=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface, no
// daily record. The havenRaidTick wrap captures the pool snapshot
// BEFORE delegating (the draft mutates tx/ty/hp) and reads pantry,
// havenTier and the post-call world list AFTER delegating. The
// fieldFight wrap captures start hp BEFORE delegating and end
// hp/rounds/outcome from the RETURNED record. The wraps write nothing
// to game state, draw no RNG, never throw into the engine (recording
// errors are counted), and return the original's value untouched.
// Pantry is read AFTER delegating on purpose: havenRaidTick itself
// reads pantryKcalLive only after the monster-count gate, and a
// pre-call pantry read would sync a derived scalar on calls the
// engine early-returns from. Post-call pantry equals pre-call pantry
// for a fired raid (the tick itself consumes no pantry; lingering
// gorges happen in havenGrowthDaily, a different tick).
//
// COMPOSE UPON (never edit): tableseat-nowait (which wraps
// leanlinkrescue). POLICY-SIDE ONLY — zero src/js changes, no
// default flips, no combat-code changes (DIAG ONLY).
//
// KNOWN LIMITS (stated, not hidden):
// - World entities carry no stable instance id: drafted raiders are
//   identified by pre-call pool position (index + type id + hp +
//   tile). Post-call matching prefers same-index-same-id, else the
//   same type id at the Haven tile; the match kind is recorded per
//   raider. Two same-type raiders in one draft can swap identities
//   in the post-call read — their pre-toll/post-toll values (from
//   the pre-call snapshot) are unaffected, only post-call hp.
// - Later field-fight linkage is by type + HP continuity only: a
//   drafted raider is "later met (exact)" iff a later fieldFight of
//   the same type starts at exactly its post-toll hp (or at its
//   defender-fight end hp, when the raid-day defender fight is
//   identified). A same-type field fight at any other hp is
//   "later met (type only)" — weak linkage, reported separately,
//   never merged into the exact count. A second live entity of the
//   same type in the window weakens any single chain to "a" entity.
// - The non-firing call gate hint is approximate: the ~18% roll is
//   RNG and leaves no trace, so a call that passes pool/pantry/
//   cooldown/table gates is reported as 'roll-or-other', never as
//   'roll'. Cooldown uses the overtime knobs when readable, else
//   the base 7 days.
// - Defender fights inside the raid tick are identified in analysis
//   (not in the recorder) as raid-day fieldFights of the raider's
//   type starting at its post-toll hp. If two same-type raiders
//   share a post-toll hp, that identification is ambiguous and the
//   analysis says so.
'use strict';

const MAX_EVENTS = 40000;

function layerOn() { try { return process.env.RAFTDRAFT === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    raids: [], calls: [], fieldFights: [],
    errs: 0, errors: [], overflow: {},
    installed: false,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

function havenXY(Game) {
  let hx = 4, hy = 4;
  try {
    const v = (Game.state || {}).village || {};
    if (v.px !== undefined && v.px !== null) hx = v.px;
    if (v.py !== undefined && v.py !== null) hy = v.py;
  } catch (e) { /* defaults */ }
  return { hx: hx, hy: hy };
}

function waveOf(Game, m) {
  try {
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return w | 0;
    }
  } catch (e) { /* fall through to 1, as the engine does */ }
  return 1;
}

// Pure-read pool snapshot: COPIES of live entries (never the live
// list, never sorted in place). Distance needs Haven coords, which
// the caller supplies so the snapshot is taken in one pass.
function snapPool(Game, hx, hy) {
  const out = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (!m) continue;
      const hp = roundHp(m.hp), maxHp = roundHp(m.maxHp);
      out.push({
        idx: i, id: m.id || null, hp: hp, maxHp: maxHp,
        tx: m.tx, ty: m.ty,
        dist: (m.tx != null && m.ty != null) ? (Math.abs(m.tx - hx) + Math.abs(m.ty - hy)) : null,
        wave: waveOf(Game, m), living: (m.hp || 0) > 0,
      });
    }
  } catch (e) { /* snapshot best-effort; caller records the error */ }
  return out;
}

function snapPostWorld(Game) {
  const out = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (!m) continue;
      out.push({ idx: i, id: m.id || null, hp: roundHp(m.hp), maxHp: roundHp(m.maxHp), tx: m.tx, ty: m.ty });
    }
  } catch (e) { /* best-effort */ }
  return out;
}

function installRaftdraftDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._raftdraftDiagStore === store && Game._raftdraftDiagInstalled) return Game._raftdraftDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // havenRaidTick: pool BEFORE, everything else AFTER.
  wrap('havenRaidTick', (orig) => function () {
    let prePool = null, hx = 4, hy = 4, lastBefore = null, day = dayOf(Game);
    try {
      const xy = havenXY(Game);
      hx = xy.hx; hy = xy.hy;
      prePool = snapPool(Game, hx, hy);
      try { lastBefore = ((Game.state || {}).village || {}).lastRaidDay || 0; } catch (e) { lastBefore = 0; }
    } catch (e) { noteErr(store, 'raid.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      day = dayOf(Game);
      let pantry = null, tier = null, lastAfter = null, cooldownDays = 7, knobSrc = 'base';
      try {
        const v = (Game.state || {}).village || {};
        lastAfter = v.lastRaidDay || 0;
        if (typeof Game.pantryKcalLive === 'function') pantry = Game.pantryKcalLive(v);
        if (typeof Game.havenTier === 'function') tier = Game.havenTier();
      } catch (e) { noteErr(store, 'raid.postRead', e); }
      try {
        if (typeof Game.overtimeRaidKnobs === 'function') {
          const ot = Game.overtimeRaidKnobs();
          if (ot && typeof ot.cooldown === 'number') { cooldownDays = ot.cooldown; knobSrc = 'overtime'; }
        }
      } catch (e) { /* base cooldown */ }
      const fired = (lastAfter !== lastBefore) && lastAfter != null && lastAfter !== 0;
      if (!fired) {
        const livingN = prePool ? prePool.filter(p => p.living).length : null;
        let tableActive = false;
        try { tableActive = !!(typeof Game.tableActive === 'function' && Game.tableActive()); } catch (e) { tableActive = false; }
        let gate = 'roll-or-other';
        if (livingN != null && livingN < 3) gate = 'pool';
        else if (pantry != null && pantry < 3000) gate = 'pantry';
        else if (day - (lastBefore || 0) < cooldownDays) gate = 'cooldown';
        else if (tableActive) gate = 'table';
        pushCapped(store, 'calls', {
          day: day, fired: false, returned: r === undefined ? null : !!r,
          poolN: prePool ? prePool.length : null, livingN: livingN,
          pantry: pantry, havenTier: tier, lastRaidDay: lastAfter,
          cooldownDays: cooldownDays, knobSrc: knobSrc, gateHint: gate,
        });
      } else {
        const post = snapPostWorld(Game);
        const living = (prePool || []).filter(p => p.living);
        const sorted = living.slice().sort((a, b) => (a.dist == null ? 1e9 : a.dist) - (b.dist == null ? 1e9 : b.dist));
        const raidN = Math.min(5, 3 + (pantry > 12000 ? 1 : 0) + (pantry > 24000 ? 1 : 0));
        const palisade = (tier != null ? tier : 0) >= 2;
        const drafted = sorted.slice(0, raidN);
        const farthest = sorted.slice(-raidN);
        const countByWave = (arr) => {
          const c = {};
          for (const x of arr) { const w = x.wave || 1; c[w] = (c[w] || 0) + 1; }
          return c;
        };
        const matchPost = (d) => {
          const byIdx = post[d.idx];
          if (byIdx && byIdx.id === d.id) return { hp: byIdx.hp, maxHp: byIdx.maxHp, tx: byIdx.tx, ty: byIdx.ty, kind: 'same-index' };
          const atHaven = post.filter(p => p.id === d.id && p.tx === hx && p.ty === hy);
          if (atHaven.length === 1) return { hp: atHaven[0].hp, maxHp: atHaven[0].maxHp, tx: atHaven[0].tx, ty: atHaven[0].ty, kind: 'haven-tile-unique' };
          if (atHaven.length > 1) return { hp: atHaven[0].hp, maxHp: atHaven[0].maxHp, tx: atHaven[0].tx, ty: atHaven[0].ty, kind: 'haven-tile-ambiguous' };
          return { hp: null, maxHp: null, tx: null, ty: null, kind: 'gone' };
        };
        const raiders = drafted.map((d, rank) => {
          const base = d.maxHp || d.hp || 20;
          const wall = palisade ? Math.round(base * 0.25) : 0;
          const postToll = palisade ? Math.max(1, (d.hp || wall) - wall) : d.hp;
          const pm = matchPost(d);
          return {
            rank: rank, type: d.id, wave: d.wave, dist: d.dist,
            preTx: d.tx, preTy: d.ty, preHp: d.hp, maxHp: d.maxHp,
            wall: wall, postTollHp: postToll, postTollExactly1: postToll === 1,
            postCallHp: pm.hp, postCallTx: pm.tx, postCallTy: pm.ty, postMatch: pm.kind,
          };
        });
        const w3plus = sorted.map((p, rank) => ({
          type: p.id, wave: p.wave, dist: p.dist, rank: rank,
          inDraft: rank < raidN, hp: p.hp, maxHp: p.maxHp,
        })).filter(p => (p.wave || 1) >= 3);
        const meanDist = (arr) => arr.length ? arr.reduce((t, x) => t + (x.dist || 0), 0) / arr.length : null;
        pushCapped(store, 'raids', {
          day: day, returned: r === undefined ? null : !!r,
          pantry: pantry, havenTier: tier, palisade: palisade,
          raidN: raidN, hx: hx, hy: hy,
          poolN: (prePool || []).length, livingN: living.length,
          poolByWave: countByWave(living),
          draftedByWave: countByWave(drafted),
          farthestByWave: countByWave(farthest),
          draftedMeanDist: meanDist(drafted),
          poolMeanDist: meanDist(living),
          w3plusMeanDist: meanDist(sorted.filter(p => (p.wave || 1) >= 3)),
          w12MeanDist: meanDist(sorted.filter(p => (p.wave || 1) < 3)),
          raiders: raiders, w3plusPool: w3plus,
        });
      }
    } catch (e) { noteErr(store, 'raid.rec', e); }
    return r;
  });

  // fieldFight: start hp BEFORE delegating, end hp/rounds from RETURNED rec.
  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    let startHp = null, startMax = null;
    try {
      if (m && m.hp != null) startHp = roundHp(m.hp);
      if (m && m.maxHp != null) startMax = roundHp(m.maxHp);
      if (startMax == null && mdef && mdef.hp && mdef.hp.length === 2) startMax = roundHp(mdef.hp[1]);
    } catch (e) { noteErr(store, 'fieldFight.start', e); }
    const rec = orig.apply(this, arguments);
    try {
      const md = mdef || {};
      pushCapped(store, 'fieldFights', {
        day: dayOf(Game), vid: vid != null ? String(vid) : null,
        mid: md.id || null, wave: (md.wave | 0) || 1,
        startHp: startHp, startMax: startMax,
        endHp: rec ? roundHp(rec.mHpLeft) : null,
        outcome: rec ? (rec.outcome || null) : null,
        rounds: rec ? (rec.rounds | 0) : null,
        mDealt: rec ? (rec.mDealt | 0) : null,
      });
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._raftdraftDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._raftdraftDiagStore = store;
    Game._raftdraftDiagInstalled = true;
    Game._raftdraftDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withRaftdraftDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // Delegate FIRST (tableseat-nowait does the day's work, raids
      // included when the sweep pre-installed the wraps before the
      // run); install here only as a guard for days after the first.
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installRaftdraftDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._raftdraft = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installRaftdraftDiag, withRaftdraftDiag, snapPool, snapPostWorld, MAX_EVENTS };
