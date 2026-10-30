// soloendlines-diag — solo-fight end-line recorder (sim-soloendlines-a,
// 2026-10-29, flesh-out loop, axis scale-onramp).
//
// THE BLANK (backlog #1458, follow-up to sim-joinendlines-a,
// evidence/2026-10-29/sim-joinendlines-a.md): solo (unjoined) field
// fights end with NO log line when the monster crosses its break line
// (drive-off) or when the flee floor fires (floor-flee). The fix
// (src/js/fieldFights.js, SOLOENDLINES) adds one honest end line per
// case, narration only, gated on !shoutJoined && !allyFromStart.
// This recorder copies the FULL log for every SOLO fight ending mFlee
// or vFlee — the only outcomes the two new lines can carry — so the
// analyzer can classify each ending by its log content and prove the
// lines fire in their cases and nowhere else (the stray check against
// shout-joined / allyFromStart fights runs over the joinendlines
// corpus in the same sweep rows).
//
// OBSERVATIONAL GUARANTEES (same as soloendlines-diag):
// SOLOENDLINES=1 installs; unset means the sweep never installs it.
// Records AFTER delegating (the record needs the result, including
// rec.log); pre-reads are pure state reads, draw no RNG, never throw
// into the engine (a recording error is counted, and an engine throw
// is recorded and RETHROWN unchanged); the original return value is
// untouched. Installed alongside fieldparty-form-diag, w4dpr-diag,
// breakline-diag, tilejoin-diag, shoutrec-diag and soloendlines-diag
// (all wrap fieldFight; stacking order is irrelevant because all
// pre-reads are pure and all post-writes touch only their own store).
// Only solo mFlee/vFlee fights are stored, so the corpus stays small;
// every other fight is skipped without a trace.
'use strict';

const MAX_EVENTS = 60000;
const MAX_LOG_LINES = 500;

function layerOn() { try { return process.env.SOLOENDLINES === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return { meetings: [], errs: 0, errors: [], overflow: {}, installed: false };
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

function installSoloendlinesDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._soloendlinesDiagStore === store && Game._soloendlinesDiagInstalled) return Game._soloendlinesDiagUninstall || function () {};
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
      try { if (pre && pre.calledHelp !== false) { /* joined-throw: not stored; throws carry no ending */ } } catch (e2) { noteErr(store, 'fieldFight.throwRec', e2); }
      throw e;
    }
    try {
      // Store ONLY solo fights (NOT calledHelp, NOT allyFromStart)
      // ending mFlee or vFlee — the only outcomes the two new lines
      // can carry. Everything else is out of this arm's population
      // by definition (prereg).
      if (pre && rec && !rec.calledHelp && !pre.allyFromStart
        && (rec.outcome === 'mFlee' || rec.outcome === 'vFlee')) {
        pre.outcome = rec.outcome || null;
        pre.calledHelp = !!rec.calledHelp;
        pre.rounds = rec.rounds | 0;
        pre.intent = rec.intent || null;
        pre.joinedAllyVid = (rec.allyVid != null) ? String(rec.allyVid) : null;
        pre.shoutRound = (rec.shoutRound != null) ? (rec.shoutRound | 0) : null;
        pre.allyDealt = rec.allyDealt | 0;
        pre.allyTaken = rec.allyTaken | 0;
        pre.mHpLeft = (rec.mHpLeft != null && isFinite(rec.mHpLeft)) ? Math.round(rec.mHpLeft) : null;
        pre.vHpLeft = (rec.vHpLeft != null && isFinite(rec.vHpLeft)) ? Math.round(rec.vHpLeft) : null;
        const log = (rec && Array.isArray(rec.log)) ? rec.log.map(l => String(l)) : [];
        pre.log = log.slice(0, MAX_LOG_LINES);
        pre.logTruncated = log.length > MAX_LOG_LINES;
        pushCapped(store, 'meetings', pre);
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._soloendlinesDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._soloendlinesDiagStore = store;
    Game._soloendlinesDiagInstalled = true;
    Game._soloendlinesDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

module.exports = { layerOn, newStore, installSoloendlinesDiag, MAX_EVENTS };
