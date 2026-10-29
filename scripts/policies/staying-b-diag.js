// staying-b-diag — sim-staying-b field-fight recorder (DIAG ONLY).
// Observational only: wraps Game.fieldFight, records the fight record's
// own fields (including the staying-b rec fields tileJoined /
// alliesJoined / partySizeAchieved when the game code writes them),
// draws no RNG, writes no game state, never throws into the engine
// (recording errors are counted). Installed alongside the VERBATIM
// fieldparty-form-diag recorder; the two recorders' counts are
// cross-checked by the analyzer (same sweep, same seeds), never
// merged by index. Caller classification mirrors fieldparty-form-diag
// (stack-based; aid before resolve; sortie/patrol call fieldFight
// directly). Channel: 'raid' when opts.raid or inside havenRaidTick,
// else 'field'. STAYINGB=1 is the only on-switch; unset delegates
// byte-identically (no wraps installed).
'use strict';

const MAX_EVENTS = 60000;

function layerOn() { try { return process.env.STAYINGB === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { meetings: [], errs: 0, errors: [], overflow: {}, installed: false };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

function seqOf(m) {
  try { return (m && m._spawnSeq != null) ? m._spawnSeq : null; } catch (e) { return null; }
}

function waveOf(Game, m) {
  try {
    if (m && m.id && typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m) | 0;
      if (w) return w;
    }
  } catch (e) { /* fall through */ }
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === (m && m.id));
    if (def && (def.wave | 0)) return def.wave | 0;
  } catch (e) { /* fall through */ }
  return 1;
}

function classifyCaller() {
  let stack = '';
  try { stack = (new Error()).stack || ''; } catch (e) { stack = ''; }
  const names = [];
  try {
    for (const line of stack.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m && names.indexOf(m[1]) < 0) names.push(m[1]);
    }
  } catch (e) { /* best-effort */ }
  let cls = 'other';
  if (names.indexOf('lingererSortie') >= 0) cls = 'sortie';
  else if (names.indexOf('resolvePatrol') >= 0) cls = 'patrol';
  else if (names.indexOf('aidFight') >= 0) cls = 'aid';
  else if (names.indexOf('resolveWildMonsterEncounter') >= 0) cls = 'resolve';
  return { cls: cls, stack: names.slice(0, 20).join(','), expedition: /expedition/i.test(stack) };
}

function installStayingbDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._stayingbDiagStore === store && Game._stayingbDiagInstalled) return Game._stayingbDiagUninstall || function () {};
  const uninstalls = [];
  let raidDepth = 0;
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  wrap('havenRaidTick', (orig) => function () {
    raidDepth++;
    try { return orig.apply(this, arguments); }
    finally { raidDepth--; }
  });

  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    const caller = classifyCaller();
    const inRaid = raidDepth > 0 || !!(opts && opts.raid);
    let pre = null;
    try {
      const live = m || null;
      const mid = (live && live.id) || (mdef && mdef.id) || null;
      pre = {
        day: dayOf(Game), vid: vid != null ? String(vid) : null,
        seq: seqOf(live) != null ? seqOf(live) : seqOf(mdef),
        mid: mid, wave: waveOf(Game, live || mdef),
        caller: caller.cls, stack: caller.stack,
        channel: inRaid ? 'raid' : 'field',
        mTile: (live && typeof live.tx === 'number' && typeof live.ty === 'number') ? { tx: live.tx, ty: live.ty } : null,
        mHpStart: (live && live.hp != null) ? roundHp(live.hp) : null,
        leaderIsScholar: (vid === Game.villagerId || vid === 'player'),
        engineAllies: (opts && opts.allies != null) ? (opts.allies | 0) : null,
        allyVids: (opts && Array.isArray(opts.allyVids)) ? opts.allyVids.map(a => (a != null ? String(a) : null)) : [],
        allyFromStart: !!(opts && opts.allyFromStart),
        tileParty: !!(opts && opts.tileParty),
        tileAllies: (opts && Array.isArray(opts.tileAllies)) ? opts.tileAllies.map(a => (a != null ? String(a) : null)) : [],
        cornered: !!(opts && opts.cornered),
      };
    } catch (e) { noteErr(store, 'fieldFight.pre', e); }
    let rec = null;
    try { rec = orig.apply(this, arguments); }
    catch (e) {
      try { if (pre) { pre.threw = true; pre.error = String((e && e.message) || e).slice(0, 120); pushCapped(store, 'meetings', pre); } } catch (e2) { noteErr(store, 'fieldFight.throwRec', e2); }
      throw e;
    }
    try {
      if (pre) {
        pre.outcome = rec ? (rec.outcome || null) : null;
        pre.rounds = rec ? (rec.rounds | 0) : null;
        pre.mDealt = rec ? (rec.mDealt | 0) : null;
        pre.vTaken = rec ? (rec.vTaken | 0) : null;
        pre.allyDealt = rec ? (rec.allyDealt | 0) : null;
        pre.allyTaken = rec ? (rec.allyTaken | 0) : null;
        pre.vHpLeft = rec ? roundHp(rec.vHpLeft) : null;
        pre.mHpLeft = rec ? roundHp(rec.mHpLeft) : null;
        pre.intent = rec ? (rec.intent || null) : null;
        pre.everHopeless = rec ? !!rec.everHopeless : null;
        pre.everWinning = rec ? !!rec.everWinning : null;
        pre.fleeLearn = rec ? !!rec.fleeLearn : null;
        pre.fleeHopeless = rec ? !!rec.fleeHopeless : null;
        pre.fleeHpFrac = (rec && rec.fleeHpFrac != null) ? rec.fleeHpFrac : null;
        pre.calledHelp = rec ? !!rec.calledHelp : null;
        pre.allyVid = (rec && rec.allyVid != null) ? String(rec.allyVid) : null;
        pre.alliesJoined = (rec && Array.isArray(rec.alliesJoined)) ? rec.alliesJoined.map(a => String(a)) : null;
        pre.tileJoined = (rec && rec.tileJoined != null) ? (rec.tileJoined | 0) : null;
        pre.partySizeAchieved = (rec && rec.partySizeAchieved != null) ? (rec.partySizeAchieved | 0) : null;
        pre.partyHold = rec ? !!rec.partyHold : null;
        pre.trickLogLen = (rec && Array.isArray(rec.trickLog)) ? rec.trickLog.length : null;
        pre.capLine = !!(rec && Array.isArray(rec.log) && rec.log.some(l => /Neither gives after 15 rounds/.test(String(l))));
        pre.logLines = (rec && Array.isArray(rec.log)) ? rec.log.length : null;
        pushCapped(store, 'meetings', pre);
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._stayingbDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._stayingbDiagStore = store;
    Game._stayingbDiagInstalled = true;
    Game._stayingbDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withStayingbDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installStayingbDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._stayingb = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installStayingbDiag, withStayingbDiag, MAX_EVENTS };
