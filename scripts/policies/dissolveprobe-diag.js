// dissolveprobe-diag — in-call dissolve probe for sim-dissolveprobe-a
// (2026-10-30, flesh-out loop, axis scale-onramp, DIAG ONLY: zero src/js
// changes, zero edits to any existing recorder, policy-side only).
//
// QUESTION (from sim-dissolvecause-a): 120/120 dissolved scholar fights
// are 'start-post-gone' — the fight is gone at the startCombat
// post-record, with no tbEnd, no throw, no death, no mantle pass, no
// barrier stamp, and 0 HP cost per dissolved start. WHICH step inside
// the startCombat call nulls tbfight? This probe snapshots tbfight
// across the opening-turn window (tbBeginTurn/tbAdvance entry-exit,
// plus the turn actors, the end check, and the startCombat body-phase
// calls) so the analyzer can bracket the first live->null transition
// to a single wrapped call (or a single gap between two events).
//
// OBSERVATIONAL ONLY. DISSOLVEPROBE=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record AFTER delegating where it matters,
// write nothing to game state (the event log lives on the
// scholarmelt meeting row + this store's diag, never on Game), draw
// no RNG, never throw into the engine (recording errors are counted,
// and an engine throw is recorded and RETHROWN unchanged), and
// return the original value untouched. Outside an active startCombat
// window every wrap is a fast pass-through (one flag check), so the
// rest of the sim pays nothing for the probe.
//
// ATTACHMENT (wrap-order independent): the probe's startCombat pre
// records the maximum scholarmelt fightSeq present; its post attaches
// the window's event buffer to every scholarmelt row with fightSeq
// >= that maximum that does not already carry a probe log. When the
// probe wraps outside the recorder (the sweep order: probe installed
// after scholarmelt), the maximum is the previous row's seq and the
// rule reduces exactly to fightSeq-set difference; when the probe
// wraps inside the recorder (recorder pre already pushed this
// window's row), the maximum IS this window's seq and the rule still
// attaches exactly this window's row, skipping already-logged
// earlier rows. Live-nested starts cannot occur (startCombat
// refuses while a fight is live), so the rule is exact for every
// window the sims can produce. The probe store itself is never
// serialized into the corpus row; only its diag counters ride inside
// the scholarmelt diag literal (see the sweep), so the substrate
// leg (row-minus-scholarmelt) is unaffected by construction.
//
// STACK HYGIENE: transition events carry stackNames parsed to
// FUNCTION NAMES ONLY. Any stack token containing '/' is dropped,
// so the corpus carries no filesystem paths (and no worktree slug)
// from this probe — unlike the removal recorder's stack frames.
'use strict';

const MAX_EVENTS = 2000;

// Wrapped Game methods. startCombat brackets the window; the rest are
// the opening-turn window's calls plus the startCombat body-phase
// calls between tbfight creation and the opening turns (say/sysSay/
// audioEvent are no-ops in node sims, but wrapping them closes the
// narration gap in the body for free).
const WRAP_NAMES = [
  'tbBeginTurn', 'tbAdvance', 'tbEnd', 'tbEndCheck', 'tbBarrierExit',
  'tbMonsterTurn', 'tbVillagerTurn', 'tbRoundWrap', 'tbDamage',
  'maybeCheatDeath', 'playerDeath', 'identifyMonster',
  'combatWitnessReact', 'villageEvent', 'observe',
  'removeWorldMonster', 'playerMonster', 'tele',
  'say', 'sysSay', 'audioEvent',
];
// S.Godpath hooks called inside the window (begin at creation,
// observe at tbBeginTurn entry, finish inside tbEnd).
const GODPATH_NAMES = [
  'beginApexHunt', 'observeApexHunt', 'finishApexHunt',
  'finishWardRescues', 'finishTacticalEscape',
];

function layerOn() { try { return process.env.DISSOLVEPROBE === '1'; } catch (e) { return false; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { errs: 0, errors: [], overflow: {}, installed: false,
    windows: 0, attached: 0 };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

// Pure read of the fight state: properties only, no Game method calls
// (a method call from a snapshot could re-enter wrapped code).
function snapFight(Game) {
  try {
    const f = Game.tbfight;
    if (!f) return { state: 'null', result: null, turnIdx: null, round: null,
      nFighters: 0, nMonAlive: 0, nMonFighting: 0, playerHp: null, currentKey: null };
    const fighters = f.fighters || [];
    let php = null;
    try { const p = fighters.find(x => x && x.key === 'p'); php = p ? roundHp(p.hp) : null; } catch (e) {}
    let cur = null;
    try { const o = f.order || []; const k = o[f.turnIdx]; cur = (k != null ? String(k) : null); } catch (e) {}
    return { state: f.over ? 'over' : 'live',
      result: f.result != null ? String(f.result) : null,
      turnIdx: (f.turnIdx != null ? f.turnIdx : null),
      round: (f.round != null ? f.round : null),
      nFighters: fighters.length,
      nMonAlive: fighters.filter(x => x && x.kind === 'monster' && x.alive).length,
      nMonFighting: fighters.filter(x => x && x.kind === 'monster' && x.alive && !x.fled).length,
      playerHp: php, currentKey: cur };
  } catch (e) {
    return { state: 'unknown', result: null, turnIdx: null, round: null,
      nFighters: 0, nMonAlive: 0, nMonFighting: 0, playerHp: null, currentKey: null };
  }
}

// Error stack -> function names only. V8 lines look like
// "    at Game.tbAdvance (/abs/path/game.js:36875:5)" (name captured
// before " (") or "    at /abs/path/file.js:10:5" (dropped: '/').
// Anything carrying a path character is dropped outright.
function stackNames(err) {
  const out = [];
  try {
    const lines = String((err && err.stack) || '').split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*at\s+(.+?)(?:\s+\(|$)/);
      if (!m) continue;
      const name = m[1].trim();
      if (!name || name === 'Error') continue;
      if (name.indexOf('/') >= 0 || name.indexOf('\\') >= 0) continue;
      out.push(name);
      if (out.length >= 12) break;
    }
  } catch (e) { /* stack parsing must never throw */ }
  return out;
}

function installDissolveProbeDiag(Game, store, smStore) {
  if (!Game || !store) return function () {};
  if (Game._dissolveProbeStore === store && Game._dissolveProbeInstalled) return Game._dissolveProbeUninstall || function () {};
  const uninstalls = [];
  // Buffers live in this install closure (never serialized): one per
  // open startCombat window, stacked for re-entrant starts.
  const buffers = [];

  function pushEvent(buf, fn, phase) {
    try {
      if (buf.overflow) return;
      if (buf.events.length >= MAX_EVENTS) { buf.overflow = true; return; }
      const snap = snapFight(Game);
      const ev = { fn, phase, callStack: buf.callStack.slice() };
      for (const k of ['state', 'result', 'turnIdx', 'round', 'nFighters',
        'nMonAlive', 'nMonFighting', 'playerHp', 'currentKey']) ev[k] = snap[k];
      if (snap.state === 'live') buf.seenLive = true;
      else if (buf.seenLive && !buf.nullCaptured && (snap.state === 'over' || snap.state === 'null')) {
        // FIRST leave-live observation: capture the call chain (names
        // only). Later transitions add nothing — the first one is the
        // bracket.
        ev.stackNames = stackNames(new Error('dissolveprobe-transition'));
        buf.nullCaptured = true;
      }
      buf.events.push(ev);
    } catch (e) { noteErr(store, 'pushEvent.' + fn, e); }
  }

  function activeBuf() { return buffers.length ? buffers[buffers.length - 1] : null; }

  const wrap = (obj, name, fn) => {
    try {
      if (!obj || typeof obj[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = obj[name];
      obj[name] = fn(orig);
      uninstalls.push(() => { try { obj[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // Generic wrapped-call recorder: entry event, delegate, exit event.
  // Engine throws are recorded as a 'throw' phase event and RETHROWN
  // unchanged; recording failures never reach the engine.
  function wrapRecorded(obj, name) {
    wrap(obj, name, (orig) => function () {
      const buf = activeBuf();
      if (buf) { buf.callStack.push(name); pushEvent(buf, name, 'enter'); }
      let ret = null, threw = null;
      try { ret = orig.apply(this, arguments); }
      catch (e) { threw = e; }
      try {
        if (buf) {
          pushEvent(buf, name, threw ? 'throw' : 'exit');
          const ix = buf.callStack.lastIndexOf(name);
          if (ix >= 0) buf.callStack.splice(ix, 1);
        }
      } catch (e) { noteErr(store, name + '.post', e); }
      if (threw) throw threw;
      return ret;
    });
  }

  for (const name of WRAP_NAMES) {
    if (name === 'startCombat') continue; // window bracket below, not generic
    wrapRecorded(Game, name);
  }
  // Godpath hooks: resolved at install time; absent object or missing
  // function is a counted diag note, never a crash. Re-resolved on
  // each daily install only if this install is fresh (the guard
  // above returns early for repeat installs with the same store).
  try {
    let gp = null;
    try { if (typeof S !== 'undefined' && S) gp = S.Godpath || null; } catch (e) {}
    if (!gp) { try { gp = (globalThis.Scattering || {}).Godpath || null; } catch (e) {} }
    if (gp) for (const name of GODPATH_NAMES) wrapRecorded(gp, name);
    else noteErr(store, 'godpath.missing', new Error('no S.Godpath at install'));
  } catch (e) { noteErr(store, 'godpath.wrap', e); }

  // startCombat window bracket: open a buffer, delegate, close + attach.
  wrap(Game, 'startCombat', (orig) => function () {
    let maxSeqAtEntry = -1;
    try {
      const ms = (smStore && smStore.meetings) || [];
      for (const r of ms) if (r && r.fightSeq != null && r.fightSeq > maxSeqAtEntry) maxSeqAtEntry = r.fightSeq;
    } catch (e) { noteErr(store, 'startCombat.seqs', e); }
    const buf = { events: [], callStack: [], seenLive: false, nullCaptured: false, overflow: false };
    buffers.push(buf);
    try { store.windows++; } catch (e) {}
    pushEvent(buf, 'startCombat', 'enter');
    let ret = null, threw = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try { pushEvent(buf, 'startCombat', threw ? 'throw' : 'exit'); } catch (e) { noteErr(store, 'startCombat.post', e); }
    try {
      buffers.pop();
      const ms = (smStore && smStore.meetings) || [];
      for (const r of ms) {
        if (r && r.fightSeq != null && r.fightSeq >= maxSeqAtEntry && r.dissolveInCallProbe == null) {
          r.dissolveInCallProbe = { events: buf.events, overflow: buf.overflow };
          try { store.attached++; } catch (e) {}
        }
      }
      if (buf.overflow) {
        try { store.overflow.windows = (store.overflow.windows || 0) + 1; } catch (e) {}
      }
    } catch (e) { noteErr(store, 'startCombat.attach', e); }
    if (threw) throw threw;
    return ret;
  });

  try {
    Game._dissolveProbeStore = store;
    Game._dissolveProbeInstalled = true;
    Game._dissolveProbeUninstall = () => { try { for (const u of uninstalls) u(); } catch (e) {} try { Game._dissolveProbeInstalled = false; } catch (e) {} };
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return Game._dissolveProbeUninstall || function () {};
}

module.exports = { layerOn, newStore, installDissolveProbeDiag, MAX_EVENTS, WRAP_NAMES, GODPATH_NAMES, stackNames, snapFight };
