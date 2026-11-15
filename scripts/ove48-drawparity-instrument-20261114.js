// ove48-drawparity-instrument-20261114.js — RNG-draw-parity instrument
// for the OVE-48 draw-drift probe (arm sim-ove48-drawparity-a, Loop A
// fleshout-20261115T0547Z).
//
// Counts Math.random draws consumed per seed-run, per day, and by call
// site — WITHOUT consuming any draws itself and WITHOUT writing any
// game state. The counter is a pure pass-through wrapper installed
// BEFORE sim-harness is required (modules capture Math.random at load;
// the harness assigns Math.random = mulberry32(seed) per loadGame, and
// the defineProperty setter below wraps each assignment).
//
// Attribution is by context STACK (no per-call Error-stack capture —
// far too slow for 150d runs): method wraps push a bucket name while
// they run; each draw is counted to the innermost active bucket.
// Buckets: 'dawn' (inside convoDawnPriorities), 'selectWant' (inside
// convoSelectWant, outside dawn), 'talk' (inside talkTo, outside the
// pick), 'other' (everywhere else).
//
// Per weighted pick, the convoSelectWant wrap records: day, vid, want
// id, source class (seed / repay-preemptor / pocketed-preemptor /
// weighted-pick — same classifier as the conv instrument), draws
// consumed inside that call, and convoDawnPriorities calls inside it.
//
// Usage (driver):
//   const DP = require('./ove48-drawparity-instrument-20261114');
//   // (require installs the Math.random counter immediately)
//   const { loadGame } = require('./sim-harness'); // AFTER this require
//   ... loadGame, then DP.wrapGame(Game) ...
//   ... setupGame ...
//   DP.resetRun(); // records setup draws, zeroes run counters
//   ... runDays (driver snapshots per day via DP.snapshotDay(day)) ...
//   const out = DP.finish(); // { totals, byBucket, daySeries, picks, setupDraws, errors }
//   DP.unwrapGame(Game);
'use strict';

const BUCKETS = ['dawn', 'selectWant', 'talk', 'other'];

// --- Math.random counting wrapper (installed at require time) ---
const counts = { total: 0, byBucket: { dawn: 0, selectWant: 0, talk: 0, other: 0 } };
const ctxStack = [];
let installed = false;
let assignedFn = null;

function currentBucket() {
  return ctxStack.length ? ctxStack[ctxStack.length - 1] : 'other';
}

function makeCounting(fn) {
  return function countedRandom() {
    const b = currentBucket();
    counts.total++;
    counts.byBucket[b]++;
    return fn();
  };
}

function installMathCounter() {
  if (installed) return;
  installed = true;
  assignedFn = Math.random;
  // Wrap whatever is currently assigned (the native function, before
  // any loadGame seeds it) so draws before the first seed are counted
  // too; the setter re-wraps every later assignment (each loadGame).
  assignedFn = (typeof assignedFn === 'function') ? makeCounting(assignedFn) : assignedFn;
  try {
    Object.defineProperty(Math, 'random', {
      configurable: true,
      get: function () { return assignedFn; },
      set: function (fn) { assignedFn = (typeof fn === 'function') ? makeCounting(fn) : fn; },
    });
  } catch (e) {
    // If the property cannot be redefined, counting cannot run — fail
    // loudly at require time rather than silently under-counting.
    throw new Error('ove48-drawparity: cannot wrap Math.random: ' + String((e && e.message) || e));
  }
}
installMathCounter();

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function classifySource(out) {
  if (!out) return 'error-null';
  if (out.fromSeed) return 'seed';
  if (out.id === 'pocketed') return 'pocketed-preemptor';
  if (out.id === 'repay') return 'repay-preemptor';
  return 'weighted-pick';
}

// --- run-phase state (reset per seed after setupGame) ---
const run = {
  setupDraws: null,
  setupByBucket: null,
  daySeries: [], // { day, cumTotal, cumByBucket } at each day boundary
  picks: [], // per weighted-pick records (all opens, capped)
  totals: { selectWantCalls: 0, dawnPriorityCalls: 0, talkToCalls: 0, picksOverflow: 0 },
  errors: [],
};
const MAX_PICKS = 3000;

function resetRun() {
  run.setupDraws = counts.total;
  run.setupByBucket = Object.assign({}, counts.byBucket);
  counts.total = 0;
  counts.byBucket = { dawn: 0, selectWant: 0, talk: 0, other: 0 };
  run.daySeries = [];
  run.picks = [];
  run.totals = { selectWantCalls: 0, dawnPriorityCalls: 0, talkToCalls: 0, picksOverflow: 0 };
  run.errors = [];
  if (ctxStack.length) run.errors.push('resetRun: ctxStack not empty (' + ctxStack.join(',') + ')');
  ctxStack.length = 0;
}

function snapshotDay(day) {
  run.daySeries.push({
    day: day,
    cumTotal: counts.total,
    cumByBucket: Object.assign({}, counts.byBucket),
  });
}

// Context helpers (also used by the proof test).
function enter(bucket) { ctxStack.push(bucket); }
function exit(bucket) {
  const popped = ctxStack.pop();
  if (popped !== bucket) run.errors.push('ctx mismatch: exit(' + bucket + ') popped ' + String(popped));
}

function wrapGame(Game) {
  const orig = {};
  function err(where, e) {
    run.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  }

  // --- convoDawnPriorities: the pick's code path (subject only). ---
  // Pure read in the game (zero Math.random calls of its own) — this
  // wrap only counts CALLS and attributes any nested draws to 'dawn'.
  if (typeof Game.convoDawnPriorities === 'function') {
    orig.convoDawnPriorities = Game.convoDawnPriorities;
    Game.convoDawnPriorities = function (vid) {
      run.totals.dawnPriorityCalls++;
      enter('dawn');
      try { return orig.convoDawnPriorities.apply(this, arguments); }
      catch (e) { err('convoDawnPriorities-throw', e); throw e; }
      finally { exit('dawn'); }
    };
  }
  // Baseline leg: no such function — dawnPriorityCalls stays 0 by
  // construction. That 0 is a control read, not a gap.

  // --- convoSelectWant: the want selection itself. Records draws consumed
  // inside the call + the source class of the pick. ---
  if (typeof Game.convoSelectWant === 'function') {
    orig.convoSelectWant = Game.convoSelectWant;
    Game.convoSelectWant = function (vid) {
      run.totals.selectWantCalls++;
      const beforeTotal = counts.total;
      const beforeDawn = run.totals.dawnPriorityCalls;
      enter('selectWant');
      let out = null;
      try { out = orig.convoSelectWant.apply(this, arguments); }
      catch (e) { exit('selectWant'); err('convoSelectWant-throw', e); throw e; }
      exit('selectWant');
      try {
        if (run.picks.length < MAX_PICKS) {
          run.picks.push({
            day: gday(Game), vid: String(vid),
            want: (out && out.id) || null,
            source: classifySource(out),
            draws: counts.total - beforeTotal,
            dawnCalls: run.totals.dawnPriorityCalls - beforeDawn,
            dawnPresent: !!(out && out.dawn),
          });
        } else { run.totals.picksOverflow++; }
      } catch (e) { err('convoSelectWant-record', e); }
      return out;
    };
  } else { run.errors.push('install: Game.convoSelectWant missing'); }

  // --- talkTo: the open. Attributes draws inside the sitting (outside
  // the pick) to 'talk'. ---
  if (typeof Game.talkTo === 'function') {
    orig.talkTo = Game.talkTo;
    Game.talkTo = function (vid) {
      run.totals.talkToCalls++;
      enter('talk');
      try { return orig.talkTo.apply(this, arguments); }
      catch (e) { err('talkTo-throw', e); throw e; }
      finally { exit('talk'); }
    };
  } else { run.errors.push('install: Game.talkTo missing'); }

  return {
    uninstall: function () {
      if (orig.convoDawnPriorities) Game.convoDawnPriorities = orig.convoDawnPriorities;
      if (orig.convoSelectWant) Game.convoSelectWant = orig.convoSelectWant;
      if (orig.talkTo) Game.talkTo = orig.talkTo;
    },
  };
}

function finish() {
  return {
    setupDraws: run.setupDraws,
    setupByBucket: run.setupByBucket,
    totalDraws: counts.total,
    byBucket: Object.assign({}, counts.byBucket),
    daySeries: run.daySeries,
    picks: run.picks,
    totals: Object.assign({}, run.totals),
    errors: run.errors.slice(),
  };
}

module.exports = {
  installMathCounter: installMathCounter,
  wrapGame: wrapGame,
  resetRun: resetRun,
  snapshotDay: snapshotDay,
  finish: finish,
  classifySource: classifySource,
  enter: enter,
  exit: exit,
  counts: counts,
  BUCKETS: BUCKETS,
  MAX_PICKS: MAX_PICKS,
};
