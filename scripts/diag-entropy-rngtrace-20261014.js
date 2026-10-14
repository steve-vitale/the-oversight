'use strict';
// diag-entropy-rngtrace-20261014.js — PHASE 2 (v2): caller-location tracing of
// the seeded RNG for days 105-113. Tracing is driven by a Game.sleep wrapper
// so each day's trace = parts + daily + sleep, attributed consistently.
// Diffs the first-divergent day's call sequences between two in-process runs.
Error.stackTraceLimit = 6;
process.env.FEASTSCALE_R13 = '1';

let traceOn = false;
let curTrace = null;
let tracedDay = null;
const traces = [];
let curRunTraces = null;

function callerLoc() {
  const st = new Error().stack.split('\n');
  for (let i = 3; i < st.length; i++) {
    const m = st[i].match(/([^\/\)]+\.js):(\d+)/);
    if (m) return m[1] + ':' + m[2];
  }
  return '?';
}
function makeTracing(fn) {
  let n = 0;
  return function tracedRandom() {
    if (traceOn && curTrace) curTrace.push((n++) + '@' + callerLoc());
    else n++;
    return fn();
  };
}
let assignedFn = Math.random;
Object.defineProperty(Math, 'random', {
  configurable: true,
  get() { return assignedFn; },
  set(fn) { assignedFn = (typeof fn === 'function') ? makeTracing(fn) : fn; }
});

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

async function one(seed, runNo) {
  curRunTraces = {};
  tracedDay = null; curTrace = null; traceOn = false;
  const { Game } = await loadGame({ seed, mode: 'entropy-rngtrace' });
  await setupGame(Game);
  // Sleep wrapper: attribute sleep(D)+boundary to day D, then open day D+1.
  const origSleep = Game.sleep.bind(Game);
  Game.sleep = function (...a) {
    const r = origSleep(...a); // sleep(D) runs under day-D trace
    if (tracedDay != null && curTrace) { curRunTraces[tracedDay] = curTrace; }
    tracedDay = null; curTrace = null; traceOn = false;
    const newDay = Game.state.scholar.day;
    if (newDay >= 105 && newDay <= 113) { tracedDay = newDay; curTrace = []; traceOn = true; }
    return r;
  };
  const base = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => base(G, ctx); // traced while its day's trace is open
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  // flush the last open trace if the run ended mid-window
  if (tracedDay != null && curTrace) curRunTraces[tracedDay] = curTrace;
  traces[runNo] = curRunTraces; curRunTraces = null;
  traceOn = false; curTrace = null; tracedDay = null;
  return { days: r.days, endReason: r.endReason };
}

const strip = s => s.split('@')[1];

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44, 0), b = await one(44, 1);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    const A = traces[0], B = traces[1];
    for (let d = 105; d <= 113; d++) {
      if (!A[d] || !B[d]) { console.log('day', d, 'missing trace', !!A[d], !!B[d]); continue; }
      let first = -1;
      const n = Math.min(A[d].length, B[d].length);
      for (let i = 0; i < n; i++) if (strip(A[d][i]) !== strip(B[d][i])) { first = i; break; }
      const lenDiff = A[d].length !== B[d].length;
      if (first < 0 && !lenDiff) { console.log('day', d, 'rng seq IDENTICAL (' + n + ' calls)'); continue; }
      console.log('day', d, 'DIVERGE at call', first, 'lenA', A[d].length, 'lenB', B[d].length);
      for (let i = Math.max(0, first - 6); i < Math.min(n, first + 8); i++)
        console.log('  ', i, 'A:', A[d][i], ' B:', B[d][i], A[d][i] === B[d][i] ? '' : ' <--');
      break;
    }
    break; // got a divergent pair — done
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
