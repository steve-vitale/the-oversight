// stab-instrument-20261107.js — RNG draw census for the staged-trajectory
// stability arm (sim-stageally-stab-b, run fleshout-loop-b-20261107T0530Z).
// DIAG only, zero src/js. Pure-read counting: it never writes game state
// and never draws from any stream itself (the displacement draw is the
// trajfrag instrument's, recorded separately by the driver).
//
// THE COUNTER: after each loadGame, the harness has installed a fresh
// seeded mulberry32 as global Math.random (the same function object the
// game modules captured at load). installDrawCounter() wraps THAT
// function object with a delegating counter: every call returns the
// closure's next value in order, so the trajectory cannot change — the
// wrapper only counts. Per-hook deltas are read by bracketing policy
// hook invocations (see the driver). Stack sampling (every Nth draw,
// bucketed by first src/js/ frame) locates the biggest draw sites.
//
// COVERAGE CAVEAT (prereg): a few modules capture Math.random into a
// top-level local at load (betrayal.js, comms.js — IIFE-scope
// `const R = Math.random`), and draws through those locals bypass this
// wrapper. The staged-vs-baseline DELTA is the estimand and both legs
// share the same bypass; the ABSOLUTE total is a lower bound and is
// reported as such. The census table in the evidence file names the
// bypassing modules (static grep) alongside the counted total.
'use strict';

function installDrawCounter(sampleEvery) {
  const orig = Math.random;
  const st = {
    orig: orig,
    total: 0,
    sampled: 0,
    sampleEvery: sampleEvery || 100,
    samples: {},
    hooks: { dailyBase: 0, dailyStage: 0, fight: 0, rallyVerb: 0, pending: 0 },
    hookCalls: { dailyBase: 0, dailyStage: 0, fight: 0, rallyVerb: 0, pending: 0 },
  };
  function wrapper() {
    st.total += 1;
    if (st.total % st.sampleEvery === 0) {
      st.sampled += 1;
      try {
        const stack = new Error().stack || '';
        const lines = stack.split('\n').slice(1);
        let bucket = 'unknown';
        for (let i = 0; i < lines.length; i++) {
          const ln = lines[i];
          const m = ln.match(/src\/js\/([A-Za-z0-9_.\-]+\.js)/);
          if (m) { bucket = m[1]; break; }
          if (/stab-driver-20261107|stab-instrument-20261107/.test(ln)) { bucket = 'driver'; break; }
          if (/sim-harness/.test(ln)) { bucket = 'harness'; break; }
        }
        st.samples[bucket] = (st.samples[bucket] || 0) + 1;
      } catch (e) { /* sampling must never break a run */ }
    }
    return orig();
  }
  Math.random = wrapper;
  st.uninstall = function () { Math.random = orig; };
  return st;
}

// Bracket a synchronous call, attributing the draws it consumed (through
// the global lookup) to a hook bucket. Returns the call's return value.
function hookDelta(st, bucket, fn) {
  const before = st.total;
  const r = fn();
  const d = st.total - before;
  st.hooks[bucket] = (st.hooks[bucket] || 0) + d;
  st.hookCalls[bucket] = (st.hookCalls[bucket] || 0) + 1;
  return r;
}

function hookDrawsTotal(st) {
  let n = 0;
  Object.keys(st.hooks || {}).forEach(function (k) { n += (st.hooks[k] || 0); });
  return n;
}

// Static bypass census: which src/js modules capture Math.random into a
// top-level local at load (those draws bypass the counter). Heuristic,
// read-only: a line matching `const|let|var <name> = Math.random;`
// whose indentation is 0–2 spaces AND which sits inside an IIFE/file
// top level is counted as a top-level capture; the same pattern deeper
// indented inside a function body captures at CALL time (sees the
// wrapper) and is counted separately. Returns per-file counts.
function bypassCensus(repoRoot) {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(repoRoot, 'src', 'js');
  const out = { topLevel: {}, functionLevel: {}, callSites: {} };
  fs.readdirSync(dir).filter(function (f) { return f.endsWith('.js'); }).forEach(function (f) {
    const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
    lines.forEach(function (ln) {
      const calls = ln.match(/Math\.random\(\)/g);
      if (calls) out.callSites[f] = (out.callSites[f] || 0) + calls.length;
      const cap = ln.match(/^\s*(const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*Math\.random\s*;/);
      if (cap) {
        const indent = ln.match(/^\s*/)[0].length;
        // Top-level IIFE bodies in this repo sit at 2-space indent;
        // function-body captures sit deeper. 0-2 = top-level capture.
        if (indent <= 2) out.topLevel[f] = (out.topLevel[f] || 0) + 1;
        else out.functionLevel[f] = (out.functionLevel[f] || 0) + 1;
      }
    });
  });
  return out;
}

module.exports = { installDrawCounter: installDrawCounter, hookDelta: hookDelta,
  hookDrawsTotal: hookDrawsTotal, bypassCensus: bypassCensus };
