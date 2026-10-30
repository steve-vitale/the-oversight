// shoutrec-diag — shout-time field-fight recorder (sim-shoutrec-a,
// 2026-10-29, flesh-out loop, axis scale-onramp, backlog #1452).
//
// THE BLANK (sim-allydpr-a, evidence/2026-10-29/sim-allydpr-a.md):
// the exact shout-time price was priced for 0/24 joined fights because
// the corpus carried none of its inputs (no shout round, no HP at
// shout, no per-round damage, no mBreak/flee floor). This recorder
// pairs with the additive src/js/fieldFights.js SHOUTREC snapshot
// (shoutRound/shoutMhp/shoutMmax/shoutVhp/shoutVhpMax/shoutMdealt/
// shoutVtaken/shoutAllyDealt/shoutMbreak/shoutFleeAt/shoutVbreak plus
// per-round cumulative roundTotals) and copies those fields into the
// corpus for EVERY fieldFight call, in call order, so the analyzer
// can index-join them to the fieldparty/tilejoin rows exactly as
// test-allydpr-a.js does. The src fields are record-only (no RNG, no
// stat, no decision reads them); this wrapper is record-only too
// (pure pre-reads, post-copy, never throws into the engine).
//
// OBSERVATIONAL GUARANTEES: SHOUTREC=1 installs; unset means the
// sweep never installs it. Wraps record AFTER delegating (the record
// needs the result, including rec.shout*), pre-reads are pure state
// reads, draw no RNG, never throw into the engine (a recording error
// is counted, and an engine throw is recorded and RETHROWN
// unchanged), and the original return value is untouched. Installed
// alongside fieldparty-form-diag, w4dpr-diag, breakline-diag and
// tilejoin-diag (all wrap fieldFight; stacking order is irrelevant
// because all pre-reads are pure and all post-writes touch only
// their own store). Every call is recorded, including throws, so
// call-index joins to the other recorders stay aligned.
'use strict';

const MAX_EVENTS = 60000;
const MAX_LOG_LINES = 500;

function layerOn() { try { return process.env.SHOUTREC === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { meetings: [], errs: 0, errors: [], overflow: {}, installed: false,
    sense: { joined: null } };
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

// Caller classification, same as fieldparty-form-diag / tilejoin-diag
// (order matters: aid before resolve; sortie/patrol call directly).
function classifyCaller() {
  let stack = '';
  try { stack = (new Error()).stack || ''; } catch (e) { stack = ''; }
  const names = [];
  try {
    for (const line of stack.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m && names.indexOf(m[1]) < 0) names.push(m[1]);
    }
  } catch (e) { /* names best-effort */ }
  let cls = 'other';
  if (names.indexOf('lingererSortie') >= 0) cls = 'sortie';
  else if (names.indexOf('resolvePatrol') >= 0) cls = 'patrol';
  else if (names.indexOf('aidFight') >= 0) cls = 'aid';
  else if (names.indexOf('resolveWildMonsterEncounter') >= 0) cls = 'resolve';
  return { cls: cls, expedition: /expedition/i.test(stack) };
}

function installShoutrecDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._shoutrecDiagStore === store && Game._shoutrecDiagInstalled) return Game._shoutrecDiagUninstall || function () {};
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
    const inRaid = raidDepth > 0;
    let pre = null;
    try {
      const live = m || null;
      pre = {
        day: dayOf(Game),
        vid: vid != null ? String(vid) : null,
        seq: seqOf(live) != null ? seqOf(live) : seqOf(mdef),
        mid: (live && live.id) || (mdef && mdef.id) || null,
        wave: waveOf(Game, live || mdef),
        caller: caller.cls,
        channel: (!m && caller.expedition) ? 'other' : (inRaid ? 'raid' : 'field'),
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
        pre.outcome = rec ? (rec.outcome || null) : null;
        pre.rounds = rec ? (rec.rounds | 0) : null;
        pre.mDealt = rec ? (rec.mDealt | 0) : null;
        pre.vTaken = rec ? (rec.vTaken | 0) : null;
        pre.mHpLeft = rec ? roundHp(rec.mHpLeft) : null;
        pre.vHpLeft = rec ? roundHp(rec.vHpLeft) : null;
        pre.intent = rec ? (rec.intent || null) : null;
        pre.everHopeless = rec ? !!rec.everHopeless : null;
        pre.calledHelp = rec ? !!rec.calledHelp : null;
        pre.joinedAllyVid = (rec && rec.allyVid != null) ? String(rec.allyVid) : null;
        pre.allyDealt = rec ? (rec.allyDealt | 0) : null;
        pre.allyTaken = rec ? (rec.allyTaken | 0) : null;
        // SHOUTREC snapshot, copied verbatim from rec (null when the
        // shout branch never fired — allyFromStart joins, no-shout
        // fights, and the reverted-src neutrality leg all read null).
        pre.shoutRound = (rec && rec.shoutRound != null) ? (rec.shoutRound | 0) : null;
        pre.shoutMhp = (rec && rec.shoutMhp != null) ? roundHp(rec.shoutMhp) : null;
        pre.shoutMmax = (rec && rec.shoutMmax != null) ? roundHp(rec.shoutMmax) : null;
        pre.shoutVhp = (rec && rec.shoutVhp != null) ? roundHp(rec.shoutVhp) : null;
        pre.shoutVhpMax = (rec && rec.shoutVhpMax != null) ? roundHp(rec.shoutVhpMax) : null;
        pre.shoutMdealt = (rec && rec.shoutMdealt != null) ? (rec.shoutMdealt | 0) : null;
        pre.shoutVtaken = (rec && rec.shoutVtaken != null) ? (rec.shoutVtaken | 0) : null;
        pre.shoutAllyDealt = (rec && rec.shoutAllyDealt != null) ? (rec.shoutAllyDealt | 0) : null;
        pre.shoutMbreak = (rec && rec.shoutMbreak != null) ? rec.shoutMbreak : null;
        pre.shoutFleeAt = (rec && rec.shoutFleeAt != null) ? rec.shoutFleeAt : null;
        pre.shoutVbreak = (rec && rec.shoutVbreak != null) ? rec.shoutVbreak : null;
        pre.roundTotals = (rec && Array.isArray(rec.roundTotals))
          ? rec.roundTotals.map(t => ({ round: t.round | 0, mDealt: t.mDealt | 0, vTaken: t.vTaken | 0, allyDealt: t.allyDealt | 0, allyTaken: t.allyTaken | 0 }))
          : null;
        pushCapped(store, 'meetings', pre);
        // Sense slot: first joined fight per seed (calledHelp + ally).
        try {
          if (pre.calledHelp && pre.joinedAllyVid && !store.sense.joined) {
            const log = (rec && Array.isArray(rec.log)) ? rec.log.slice(0, MAX_LOG_LINES).map(l => String(l)) : [];
            store.sense.joined = { day: pre.day, vid: pre.vid, mid: pre.mid, wave: pre.wave,
              caller: pre.caller, rounds: pre.rounds, outcome: pre.outcome,
              joinedAllyVid: pre.joinedAllyVid, shoutRound: pre.shoutRound,
              mDealt: pre.mDealt, vTaken: pre.vTaken, allyDealt: pre.allyDealt, allyTaken: pre.allyTaken,
              log: log, logTruncated: (rec && Array.isArray(rec.log)) ? rec.log.length > MAX_LOG_LINES : false };
          }
        } catch (e) { noteErr(store, 'fieldFight.sense', e); }
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._shoutrecDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._shoutrecDiagStore = store;
    Game._shoutrecDiagInstalled = true;
    Game._shoutrecDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

module.exports = { layerOn, newStore, installShoutrecDiag, MAX_EVENTS };
