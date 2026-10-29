// breakline-diag — wild-field-fight break-line recorder (sim-breakline-a,
// 2026-10-29, flesh-out loop, axis scale-onramp, DIAG ONLY: zero
// src/js changes, policy-side recorder only).
//
// QUESTION: which engine branch actually ends wild field fights — the
// hopeless-trajectory flee, the fleeAt floor check, the learn
// withdrawal, the round cap, a kill, a drive-off, or death? The
// w4dpr flag classes cannot answer it exactly: the floor branch sets
// fleeHopeless = the round's hopeless value, so a floor flee with a
// hopeless trajectory carries the same flags as a hopeless-branch
// flee. The log LINES distinguish them (hopeless branch logs "sees
// how this ends", floor branch logs no line, learn branch logs "has
// seen enough", cap logs "Neither gives after 15 rounds"), so this
// recorder computes those three booleans from rec.log at record
// time and stores them for EVERY wave — no full log is needed for
// the census. Sense logs are stored only for the FIRST fight of
// each vFlee branch class per seed (floor / hopeless / learn),
// capped at 500 lines like w4dpr.
//
// OBSERVATIONAL ONLY. BREAKLINE=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. Wraps record AFTER delegating (the record needs the
// result, including rec.log), pre-reads are pure state reads taken
// before the call, never writes, draw no RNG, never throw into the
// engine (recording errors are counted, and an engine throw is
// recorded and RETHROWN unchanged), and return the original value
// untouched. Installed alongside fieldparty-form-diag and
// w4dpr-diag (all three wrap fieldFight; stacking order is
// irrelevant because all pre-reads are pure and all post-writes
// touch only their own store). The branch stored here is
// RECOMPUTED by the analyzer from the stored booleans/flags and
// checked against this value — a mismatch is an instrument
// failure, never silently trusted.
'use strict';

const MAX_EVENTS = 60000;
const MAX_LOG_LINES = 500;

function layerOn() { try { return process.env.BREAKLINE === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { meetings: [], partCounter: 0, errs: 0, errors: [], overflow: {}, installed: false,
    sense: { floor: null, hopeless: null, learn: null } };
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

// Branch at record time, same priority as breakline-lib.classifyBranch
// (kept inline so the recorder needs no cross-file load at wrap time;
// the analyzer recomputes from booleans and checks this value).
function branchAtRecordTime(rec, lines) {
  if (!rec) return 'OTHER';
  if (rec.outcome === 'vKill') return 'KILL';
  const capLine = lines.some(l => String(l).indexOf('Neither gives after 15 rounds') >= 0);
  if ((rec.rounds | 0) >= 15 && capLine) return 'CAP';
  if (rec.outcome === 'mFlee') return 'DRIVE-OFF';
  if (rec.outcome === 'vDie') return 'PARTY-DEATH';
  if (rec.outcome === 'vFlee' && lines.some(l => String(l).indexOf('sees how this ends') >= 0)) return 'HOPELESS-BRANCH';
  if (rec.outcome === 'vFlee' && lines.some(l => String(l).indexOf('has seen enough') >= 0)) return 'LEARN-BRANCH';
  if (rec.outcome === 'vFlee' && rec.fleeWise) return 'TRICK-EXIT';
  if (rec.outcome === 'vFlee') return 'FLOOR-BRANCH';
  return 'OTHER';
}

function installBreaklineDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._breaklineDiagStore === store && Game._breaklineDiagInstalled) return Game._breaklineDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  wrap('advancePart', (orig) => function () {
    const r = orig.apply(this, arguments);
    try { store.partCounter++; } catch (e) { noteErr(store, 'advancePart.counter', e); }
    return r;
  });

  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    let pre = null;
    try {
      const live = m || null;
      const defObj = mdef || null;
      pre = {
        day: dayOf(Game), part: store.partCounter,
        vid: vid != null ? String(vid) : null,
        seq: seqOf(live) != null ? seqOf(live) : seqOf(defObj),
        mid: (live && live.id) || (defObj && defObj.id) || null,
        wave: waveOf(Game, live || defObj),
        mHpStart: (live && live.hp != null) ? roundHp(live.hp) : null,
        allyFromStart: !!(opts && opts.allyFromStart),
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
        const log = (rec && Array.isArray(rec.log)) ? rec.log.map(l => String(l)) : [];
        pre.outcome = rec ? (rec.outcome || null) : null;
        pre.rounds = rec ? (rec.rounds | 0) : null;
        pre.mDealt = rec ? (rec.mDealt | 0) : null;
        pre.vTaken = rec ? (rec.vTaken | 0) : null;
        pre.mHpLeft = rec ? roundHp(rec.mHpLeft) : null;
        pre.vHpLeft = rec ? roundHp(rec.vHpLeft) : null;
        pre.intent = rec ? (rec.intent || null) : null;
        pre.everHopeless = rec ? !!rec.everHopeless : null;
        pre.everWinning = rec ? !!rec.everWinning : null;
        pre.fleeLearn = rec ? !!rec.fleeLearn : null;
        pre.fleeHopeless = rec ? !!rec.fleeHopeless : null;
        pre.fleeWise = rec ? !!rec.fleeWise : null;
        pre.fleeHpFrac = (rec && rec.fleeHpFrac != null) ? rec.fleeHpFrac : null;
        pre.minHpFrac = (rec && rec.minHpFrac != null) ? rec.minHpFrac : null;
        pre.calledHelp = rec ? !!rec.calledHelp : null;
        pre.joinedAllyVid = (rec && rec.allyVid != null) ? String(rec.allyVid) : null;
        pre.allyDealt = rec ? (rec.allyDealt | 0) : null;
        pre.allyTaken = rec ? (rec.allyTaken | 0) : null;
        pre.trickLog = rec ? ((rec.trickLog || []).slice()) : null;
        pre.capLine = log.some(l => l.indexOf('Neither gives after 15 rounds') >= 0);
        pre.hopelessLine = log.some(l => l.indexOf('sees how this ends') >= 0);
        pre.learnLine = log.some(l => l.indexOf('has seen enough') >= 0);
        pre.branch = branchAtRecordTime(rec, log);
        // Sense logs: FIRST fight of each vFlee branch class per seed.
        // Unfought fights (rounds < 1) never seed a sense log.
        if ((pre.rounds | 0) >= 1 && (pre.branch === 'FLOOR-BRANCH' || pre.branch === 'HOPELESS-BRANCH' || pre.branch === 'LEARN-BRANCH')) {
          const key = pre.branch === 'FLOOR-BRANCH' ? 'floor' : pre.branch === 'HOPELESS-BRANCH' ? 'hopeless' : 'learn';
          if (!store.sense[key]) {
            store.sense[key] = { day: pre.day, mid: pre.mid, vid: pre.vid, wave: pre.wave,
              outcome: pre.outcome, rounds: pre.rounds, branch: pre.branch,
              log: log.slice(0, MAX_LOG_LINES), logTruncated: log.length > MAX_LOG_LINES };
          }
        }
        pushCapped(store, 'meetings', pre);
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._breaklineDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._breaklineDiagStore = store;
    Game._breaklineDiagInstalled = true;
    Game._breaklineDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withBreaklineDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installBreaklineDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._breakline = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installBreaklineDiag, withBreaklineDiag, MAX_EVENTS };
