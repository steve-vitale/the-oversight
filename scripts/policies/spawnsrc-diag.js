// spawnsrc-diag — spawn-source recorder for the above-cap raid-time pool
// (sim-spawnsrc-a, 2026-10-25, flesh-out loop, axis scale-onramp).
//
// QUESTION (not a claim): raid-time pools sit at median 17 vs the
// maintainWorldMonsters cap of 8, and the maintain-weight lever at its
// 100% ceiling moved nothing (byte-identical corpus, sim-poolpres-
// lever-b) because the maintain tap is already closed. WHERE does the
// pool actually come from? This recorder answers it by tagging every
// fresh world-monster spawn at birth with its spawn path, then reading
// the tag back at raid time.
//
// MECHANISM, READ FROM CODE (src/js/game.js, never invented):
//   - Every spawn path funnels through spawnWorldMonster(mdef, tx, ty,
//     opts), which pushes one object onto state.worldMonsters. The
//     callers are: maintainWorldMonsters (via worldTick on tile entry,
//     ONLY below worldMonsterCap); checkEncounter tile-entry spawn (on
//     the player tile when no monster is there, NO cap check);
//     checkEncounter wanderer-contact spawn (the cast wanderer
//     materializes on contact, NO cap check); fled-monster recovery in
//     travelTo (re-entry, not fresh stock); gwTrap spawn; scripted
//     spawns (hushwolf pack, titans/network/finale pieces, opts
//     titan:true). Titan/lingerer combat restore pushes the SAME object
//     back — never a fresh spawn, and it keeps its birth tag.
//   - Classification uses, in order: (1) the caller-flag stack
//     (maintainWorldMonsters / checkEncounter wraps push a flag for the
//     duration of the original call, so maintain inside worldTick
//     inside checkEncounter still reads 'maintain'); (2) opts markers
//     (titan, stance circle/fearful, beamPhase); (3) mdef shape inside
//     checkEncounter — the tile-entry spawn passes a full monster def
//     (hp array, name, wave...), the wanderer-contact spawn passes only
//     {id, veteran}; (4) the Error stack hint as a fallback. Anything
//     matching none of these is 'unknown' and is COUNTED, never hidden.
//   - The tag is stored two ways: a WeakMap keyed by the monster object
//     (zero game-state mutation) AND a plain _spawnsrc/_spawnSeq property
//     on the object (survives any clone the engine makes of the entity).
//     The game code never reads either. The recorder draws no RNG,
//     throws nothing into the engine (recording errors are counted),
//     and returns every original value untouched.
//
// OBSERVATIONAL ONLY. SPAWNSRC=1 is the only on-switch. Unset delegates
// byte-identically: no wraps installed, no ctx surface, no record.
// COMPOSE UPON (never edit): tableseat-nowait (which wraps
// leanlinkrescue). POLICY-SIDE ONLY — zero src/js changes, no default
// flips, no combat-code changes (DIAG ONLY).
//
// KNOWN LIMITS (stated, not hidden):
// - 'fled-recovery' is a re-entry of a monster that fled, not fresh
//   stock; it is reported as its own source so it never inflates the
//   fresh-spawn census, and its raid-time share is reported separately.
// - The above-cap attribution convention (see the analyzer) is an
//   accounting view: pool entities ordered by birth sequence, the
//   earliest `cap` living entities are the cap stock, the rest is the
//   excess. The engine labels no entity "excess".
// - Monsters spawned before the recorder installs (during setupGame)
//   would read 'unknown'. The sweep installs before runDays and the
//   detgate reports the post-setup world size, so any such stock is
//   measured, not assumed away.
// - One monster per tile: the world list order is spawn order modulo
//   removals (wander moves mutate in place, never reorder), so birth
//   sequence is a faithful ordering key.
'use strict';

const MAX_EVENTS = 80000;

function layerOn() { try { return process.env.SPAWNSRC === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    raids: [], spawns: [],
    errs: 0, errors: [], overflow: {},
    installed: false, seq: 0,
    byObj: new WeakMap(),
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
    if (m && m.wave != null && isFinite(m.wave)) return m.wave | 0;
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return w | 0;
    }
  } catch (e) { /* fall through to 1, as the engine does */ }
  return 1;
}

function stackHint() {
  try {
    const st = (new Error()).stack || '';
    const names = [];
    for (const line of st.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (!m) continue;
      const fn = m[1];
      if (fn === 'stackHint' || fn === 'classify' || fn === 'Error') continue;
      if (names.indexOf(fn) < 0) names.push(fn);
      if (names.length >= 6) break;
    }
    return names.join(',');
  } catch (e) { return ''; }
}

// classify(mdef, opts, flagStack, hint) -> source string.
// Order matters: maintain flag first (it nests inside checkEncounter
// via worldTick), then opts markers, then mdef shape in checkEncounter.
function classify(mdef, opts, flagStack, hint) {
  opts = opts || {};
  const top = flagStack.length ? flagStack[flagStack.length - 1] : null;
  if (top === 'maintain') return 'maintain';
  if (opts.titan) return 'scripted-titan';
  if (opts.stance === 'circle') return 'scripted-hushwolf';
  if (opts.stance === 'fearful') return 'fled-recovery';
  if (opts.beamPhase) return 'trap';
  if ((hint || '').split(',').indexOf('maintainWorldMonsters') >= 0) return 'maintain';
  const inCheck = flagStack.indexOf('checkEncounter') >= 0
    || (hint || '').split(',').indexOf('checkEncounter') >= 0;
  if (inCheck) {
    if (typeof mdef === 'string') return 'checkEncounter-other';
    const keys = mdef ? Object.keys(mdef) : [];
    if (keys.length && keys.every(k => k === 'id' || k === 'veteran')) return 'wanderer-contact';
    if (keys.length > 2) return 'tile-entry';
    return 'checkEncounter-other';
  }
  return 'unknown';
}

function tagOf(store, mon) {
  try {
    if (mon && store.byObj.has(mon)) return store.byObj.get(mon);
  } catch (e) { /* fall through to the plain tag */ }
  try {
    if (mon && mon._spawnsrc) return { src: mon._spawnsrc, seq: (mon._spawnSeq != null ? mon._spawnSeq : null) };
  } catch (e) { /* no tag */ }
  return null;
}

function installSpawnsrcDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._spawnsrcDiagStore === store && Game._spawnsrcDiagInstalled) return Game._spawnsrcDiagUninstall || function () {};
  const uninstalls = [];
  const flagStack = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // Flag wraps: push for the duration of the original call only.
  wrap('maintainWorldMonsters', (orig) => function () {
    flagStack.push('maintain');
    try { return orig.apply(this, arguments); }
    finally { flagStack.pop(); }
  });
  wrap('checkEncounter', (orig) => function () {
    flagStack.push('checkEncounter');
    try { return orig.apply(this, arguments); }
    finally { flagStack.pop(); }
  });

  // The birth tag: wrap spawnWorldMonster, classify, tag, record.
  wrap('spawnWorldMonster', (orig) => function (mdef, tx, ty, opts) {
    const hint = stackHint();
    let mon = null;
    try { mon = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      const src = classify(mdef, opts, flagStack, hint);
      const seq = ++store.seq;
      const wave = waveOf(Game, mon);
      const type = (mon && mon.id) || (typeof mdef === 'string' ? mdef : (mdef && mdef.id)) || null;
      const rec = { src: src, seq: seq };
      try { store.byObj.set(mon, rec); } catch (e) { /* WeakMap best-effort */ }
      try { mon._spawnsrc = src; mon._spawnSeq = seq; } catch (e) { /* plain tag best-effort */ }
      pushCapped(store, 'spawns', {
        day: dayOf(Game), seq: seq, src: src, type: type, wave: wave,
        tx: tx, ty: ty, hint: hint,
      });
    } catch (e) { noteErr(store, 'spawn.rec', e); }
    return mon;
  });

  // havenRaidTick: pool BEFORE delegating (the draft mutates tx/ty/hp),
  // cap + fired detection AFTER, same convention as raftdraft-diag.
  wrap('havenRaidTick', (orig) => function () {
    let prePool = null, hx = 4, hy = 4, lastBefore = null;
    try {
      const xy = havenXY(Game);
      hx = xy.hx; hy = xy.hy;
      try { lastBefore = ((Game.state || {}).village || {}).lastRaidDay || 0; } catch (e) { lastBefore = 0; }
      const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      prePool = list.map((m, i) => {
        const tag = tagOf(store, m);
        return {
          idx: i, id: m.id || null, hp: (m.hp != null && isFinite(m.hp)) ? Math.round(m.hp) : null,
          maxHp: (m.maxHp != null && isFinite(m.maxHp)) ? Math.round(m.maxHp) : null,
          tx: m.tx, ty: m.ty,
          dist: (m.tx != null && m.ty != null) ? (Math.abs(m.tx - hx) + Math.abs(m.ty - hy)) : null,
          wave: waveOf(Game, m), living: (m.hp || 0) > 0,
          src: tag ? tag.src : 'unknown', seq: tag ? tag.seq : null,
        };
      });
    } catch (e) { noteErr(store, 'raid.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      let lastAfter = null, cap = null;
      try { lastAfter = ((Game.state || {}).village || {}).lastRaidDay || 0; } catch (e) { lastAfter = 0; }
      try { cap = (typeof Game.worldMonsterCap === 'function') ? Game.worldMonsterCap() : null; } catch (e) { cap = null; }
      const fired = (lastAfter !== lastBefore) && lastAfter != null && lastAfter !== 0;
      if (fired) {
        const living = (prePool || []).filter(p => p.living);
        const countBy = (arr, key) => {
          const c = {};
          for (const x of arr) { const k = String(x[key]); c[k] = (c[k] || 0) + 1; }
          return c;
        };
        pushCapped(store, 'raids', {
          day: dayOf(Game), poolN: (prePool || []).length, livingN: living.length,
          cap: cap, poolByWave: countBy(living, 'wave'),
          poolBySrc: countBy(living, 'src'),
          poolBySrcWave: (() => {
            const c = {};
            for (const x of living) { const k = x.src + ':w' + x.wave; c[k] = (c[k] || 0) + 1; }
            return c;
          })(),
          pool: living.map(p => ({ type: p.id, wave: p.wave, dist: p.dist, src: p.src, seq: p.seq, hp: p.hp })),
        });
      }
    } catch (e) { noteErr(store, 'raid.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._spawnsrcDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._spawnsrcDiagStore = store;
    Game._spawnsrcDiagInstalled = true;
    Game._spawnsrcDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withSpawnsrcDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // Delegate FIRST (tableseat-nowait does the day's work); install
      // here only as a guard for days after the first.
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installSpawnsrcDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._spawnsrc = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installSpawnsrcDiag, withSpawnsrcDiag, classify, tagOf, MAX_EVENTS };
