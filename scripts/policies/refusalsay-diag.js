// refusalsay-diag — refusal say-text probe for sim-refusalsay-a
// (2026-10-30, flesh-out loop, axis scale-onramp, DIAG ONLY: zero
// src/js changes, zero edits to any existing recorder, policy-side
// only). Follow-up to sim-dissolveprobe-a (finding #1539): the 120
// "dissolved" herald fights are titan-entry-gate refusals, but the
// prior probe recorded say events WITHOUT their arguments, so the
// gate's have/need numbers were never captured. This probe adds
// first-argument capture to say / sysSay window events and nothing
// else, drops the removeWorldMonster wrap (its one-frame shift of
// the removal recorder's stack window broke the prior substrate
// leg), and attaches window logs by the claimed-set rule (see the
// prereg: evidence/2026-10-30/sim-refusalsay-a-prereg.md).
//
// OBSERVATIONAL ONLY. REFUSALSAY=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record AFTER delegating where it matters,
// write nothing to game state (the event log lives on the
// scholarmelt meeting row + this store's diag, never on Game),
// draw no RNG, never throw into the engine (recording errors are
// counted, and an engine throw is recorded and RETHROWN
// unchanged), and return the original value untouched. Outside an
// active startCombat window every wrap is a fast pass-through (one
// flag check), so the rest of the sim pays nothing for the probe.
// Say/sysSay argument capture happens at the wrap layer even
// though node sims stub Game.say to a no-op: the delegate, the
// return value, and the RNG stream are untouched by capturing.
//
// ATTACHMENT (claimed-set, binding — see prereg): the install
// closure holds a `claimed` set of scholarmelt meeting row objects
// (object identity, never serialized). Each buffer snapshots at
// entry the meeting objects present, the maximum fightSeq present,
// that row, whether its result is null at entry, and how many
// probe buffers are already open. At close it claims every row
// that is not already claimed AND (not present at entry OR (this
// buffer is outermost AND the row is the entry-max row AND that
// row's result was null at entry)). The outermost guard is what
// keeps a nested window from stealing its still-open outer row;
// the entry-max exception is what makes probe-inside single
// windows attach (their row is pushed by the outer recorder pre
// before the probe entry). Orphan-end rows (created outside any
// window, result already recorded) are never claimed by a later
// window. The probe store itself is never serialized into the
// corpus row; only its diag counters ride inside the scholarmelt
// diag literal (see the sweep), so the substrate leg
// (row-minus-scholarmelt) is unaffected by construction.
//
// STACK HYGIENE: transition events carry stackNames parsed to
// FUNCTION NAMES ONLY. Any stack token containing '/' is dropped,
// so the corpus carries no filesystem paths (and no worktree slug)
// from this probe — unlike the removal recorder's stack frames.
'use strict';

const MAX_EVENTS = 2000;
const MAX_ARGTEXT = 1000;

// Wrapped Game methods. startCombat brackets the window; the rest
// are the opening-turn window's calls plus the startCombat
// body-phase calls. DELIBERATE OMISSION vs dissolveprobe-diag:
// removeWorldMonster is NOT wrapped (proven stack cost, marginal
// body-gap information).
const WRAP_NAMES = [
  'tbBeginTurn', 'tbAdvance', 'tbEnd', 'tbEndCheck', 'tbBarrierExit',
  'tbMonsterTurn', 'tbVillagerTurn', 'tbRoundWrap', 'tbDamage',
  'maybeCheatDeath', 'playerDeath', 'identifyMonster',
  'combatWitnessReact', 'villageEvent', 'observe',
  'playerMonster', 'tele',
  'say', 'sysSay', 'audioEvent',
];
const SAY_NAMES = ['say', 'sysSay'];
// S.Godpath hooks called inside the window (begin at creation,
// observe at tbBeginTurn entry, finish inside tbEnd).
const GODPATH_NAMES = [
  'beginApexHunt', 'observeApexHunt', 'finishApexHunt',
  'finishWardRescues', 'finishTacticalEscape',
];

function layerOn() { try { return process.env.REFUSALSAY === '1'; } catch (e) { return false; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { errs: 0, errors: [], overflow: {}, installed: false,
    windows: 0, attached: 0 };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { void e2; }
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
    try { const p = fighters.find(x => x && x.key === 'p'); php = p ? roundHp(p.hp) : null; } catch (e) { void e; }
    let cur = null;
    try { const o = f.order || []; const k = o[f.turnIdx]; cur = (k != null ? String(k) : null); } catch (e) { void e; }
    return { state: f.over ? 'over' : 'live',
      result: f.result != null ? String(f.result) : null,
      turnIdx: (f.turnIdx != null ? f.turnIdx : null),
      round: (f.round != null ? f.round : null),
      nFighters: fighters.length,
      nMonAlive: fighters.filter(x => x && x.kind === 'monster' && x.alive).length,
      nMonFighting: fighters.filter(x => x && x.kind === 'monster' && x.alive && !x.fled).length,
      playerHp: php, currentKey: cur };
  } catch (e) {
    void e;
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
  } catch (e) { void e; }
  return out;
}

// First-argument capture for say / sysSay only. Any other function
// captures no arguments. Non-string first arguments are stringified
// (the gate text is a string; this branch exists only so a surprise
// argument type cannot throw into the engine).
function argTextOf(name, args) {
  if (SAY_NAMES.indexOf(name) < 0) return undefined;
  try {
    if (!args || args.length === 0) return '';
    const a = args[0];
    const s = (typeof a === 'string') ? a : JSON.stringify(a);
    return String(s == null ? '' : s).slice(0, MAX_ARGTEXT);
  } catch (e) { void e; return ''; }
}

function installRefusalsayDiag(Game, store, smStore) {
  if (!Game || !store) return function () {};
  if (Game._refusalsayStore === store && Game._refusalsayInstalled) return Game._refusalsayUninstall || function () {};
  const uninstalls = [];
  // Buffers live in this install closure (never serialized): one per
  // open startCombat window, stacked for re-entrant starts. `claimed`
  // is the attach set: scholarmelt meeting rows already given a log.
  const buffers = [];
  const claimed = new Set();

  function pushEvent(buf, fn, phase, argText) {
    try {
      if (buf.overflow) return;
      if (buf.events.length >= MAX_EVENTS) { buf.overflow = true; return; }
      const snap = snapFight(Game);
      const ev = { fn, phase, callStack: buf.callStack.slice() };
      for (const k of ['state', 'result', 'turnIdx', 'round', 'nFighters',
        'nMonAlive', 'nMonFighting', 'playerHp', 'currentKey']) ev[k] = snap[k];
      if (argText !== undefined) ev.argText = argText;
      if (snap.state === 'live') buf.seenLive = true;
      else if (buf.seenLive && !buf.nullCaptured && (snap.state === 'over' || snap.state === 'null')) {
        // FIRST leave-live observation: capture the call chain (names
        // only). Later transitions add nothing — the first one is the
        // bracket.
        ev.stackNames = stackNames(new Error('refusalsay-transition'));
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
      uninstalls.push(() => { try { obj[name] = orig; } catch (e) { noteErr(store, name + '.uninstall', e); } });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // Generic wrapped-call recorder: entry event, delegate, exit event.
  // Engine throws are recorded as a 'throw' phase event and RETHROWN
  // unchanged; recording failures never reach the engine.
  function wrapRecorded(obj, name) {
    wrap(obj, name, (orig) => function () {
      const buf = activeBuf();
      const args = Array.prototype.slice.call(arguments);
      if (buf) { buf.callStack.push(name); pushEvent(buf, name, 'enter', argTextOf(name, args)); }
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
    try { if (typeof S !== 'undefined' && S) gp = S.Godpath || null; } catch (e) { void e; }
    if (!gp) { try { gp = (globalThis.Scattering || {}).Godpath || null; } catch (e) { void e; } }
    if (gp) for (const name of GODPATH_NAMES) wrapRecorded(gp, name);
    else noteErr(store, 'godpath.missing', new Error('no S.Godpath at install'));
  } catch (e) { noteErr(store, 'godpath.wrap', e); }

  // startCombat window bracket: open a buffer, delegate, close + attach.
  wrap(Game, 'startCombat', (orig) => function () {
    let entryRows = new Set();
    let entryMaxSeq = -1;
    let entryMaxRow = null;
    let entryMaxRowOpen = false;
    try {
      const ms = (smStore && smStore.meetings) || [];
      for (const r of ms) {
        entryRows.add(r);
        if (r && r.fightSeq != null && r.fightSeq > entryMaxSeq) { entryMaxSeq = r.fightSeq; entryMaxRow = r; }
      }
      entryMaxRowOpen = !!(entryMaxRow && entryMaxRow.result == null);
    } catch (e) { noteErr(store, 'startCombat.seqs', e); }
    const buffersAtEntry = buffers.length;
    const buf = { events: [], callStack: [], seenLive: false, nullCaptured: false, overflow: false };
    buffers.push(buf);
    try { store.windows++; } catch (e) { noteErr(store, 'startCombat.windows', e); }
    pushEvent(buf, 'startCombat', 'enter');
    let ret = null, threw = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try { pushEvent(buf, 'startCombat', threw ? 'throw' : 'exit'); } catch (e) { noteErr(store, 'startCombat.post', e); }
    try {
      buffers.pop();
      const ms = (smStore && smStore.meetings) || [];
      for (const r of ms) {
        if (!r || claimed.has(r)) continue;
        const isNew = !entryRows.has(r);
        const isEntryMaxOpen = (buffersAtEntry === 0 && r === entryMaxRow && entryMaxRowOpen);
        if (isNew || isEntryMaxOpen) {
          r.refusalSayProbe = { events: buf.events, overflow: buf.overflow };
          claimed.add(r);
          try { store.attached++; } catch (e) { noteErr(store, 'startCombat.attached', e); }
        }
      }
      if (buf.overflow) {
        try { store.overflow.windows = (store.overflow.windows || 0) + 1; } catch (e) { noteErr(store, 'startCombat.overflow', e); }
      }
    } catch (e) { noteErr(store, 'startCombat.attach', e); }
    if (threw) throw threw;
    return ret;
  });

  try {
    Game._refusalsayStore = store;
    Game._refusalsayInstalled = true;
    Game._refusalsayUninstall = () => { try { for (const u of uninstalls) u(); } catch (e) { noteErr(store, 'install.uninstall', e); } try { Game._refusalsayInstalled = false; } catch (e) { noteErr(store, 'install.unflag', e); } };
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return Game._refusalsayUninstall || function () {};
}

module.exports = { layerOn, newStore, installRefusalsayDiag, MAX_EVENTS, MAX_ARGTEXT, WRAP_NAMES, SAY_NAMES, GODPATH_NAMES, stackNames, snapFight, argTextOf };
