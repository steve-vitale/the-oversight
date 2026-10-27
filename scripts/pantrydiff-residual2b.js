// pantrydiff-residual2b.js — phase-2 DIAG-only pantry-diff tracer for
// sim-residual2b. Zero src/js. Used ONLY by the phase-2 rerun (reported
// separately, never retroactively changing the phase-1 verdict).
//
// Purpose: the phase-1 corpus shows two dried-channel steps with NO record
// in any instrument (LQ dried -800 at the day-81->82 snapshots, Muscadine
// dried -864 at day-75->76, seed 9825) — same shape: stack count unchanged,
// spoiled unchanged, no flow. Something shrinks a dried stack in place
// without going through any wrapped function. This tracer wraps every own
// function property of Game with depth tracking and snapshots ONLY the
// target dried stacks (cheap: pantry scan filtered by name) before/after
// each call. A diff is logged only at its INNERMOST wrapped call (an
// identical diff already claimed by a deeper call during the same
// outermost call is not re-logged), so the log names the direct mutator,
// not every ancestor on the stack.
//
// Log entries: {day, fn, args (summarized), diffs: [{stack, field,
// before, after}]}. Only diffs on the TARGETS list are logged. The tracer
// never writes game state, never uses RNG, and delegates identically
// (same this, same args, same return, rethrows).
'use strict';
const TARGETS = ["Lamb's Quarters (dried)", 'Muscadine Grapes (dried)'];

function installPantrydiffCapture(Game, opts) {
  opts = opts || {};
  const targets = new Set(opts.targets || TARGETS);
  const log = [];
  const ids = new Map(); // stack object -> id
  let nextId = 1;
  function pantry() {
    try {
      const pan = ((Game.state || {}).village || {}).pantry || [];
      const out = [];
      for (const s of pan) {
        if (!s || !targets.has(s.name)) continue;
        if (!ids.has(s)) ids.set(s, nextId++);
        out.push({ id: ids.get(s), name: s.name, units: s.units || 0,
          kcalEach: s.kcalEach || 0, spoilDay: s.spoilDay == null ? null : s.spoilDay });
      }
      return out;
    } catch (e) { return []; }
  }
  function diff(before, after) {
    const bmap = new Map(before.map(s => [s.id, s]));
    const amap = new Map(after.map(s => [s.id, s]));
    const out = [];
    for (const [id, a] of amap) {
      const b = bmap.get(id);
      if (!b) { out.push({ stack: a.name, field: 'added', before: null, after: a.units + 'u x ' + a.kcalEach }); continue; }
      if (b.units !== a.units) out.push({ stack: a.name, field: 'units', before: b.units, after: a.units, spoilDay: a.spoilDay });
      if (b.kcalEach !== a.kcalEach) out.push({ stack: a.name, field: 'kcalEach', before: b.kcalEach, after: a.kcalEach, spoilDay: a.spoilDay });
    }
    for (const [id, b] of bmap) {
      if (!amap.has(id)) out.push({ stack: b.name, field: 'removed', before: b.units + 'u x ' + b.kcalEach, after: null, spoilDay: b.spoilDay });
    }
    return out;
  }
  function dayOf() { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
  function summarizeArgs(args) {
    return args.slice(0, 4).map(a => {
      if (a == null) return String(a);
      if (typeof a === 'string') return a.slice(0, 60);
      if (typeof a === 'number' || typeof a === 'boolean') return String(a);
      if (Array.isArray(a)) return 'array[' + a.length + ']';
      if (typeof a === 'object') {
        const nm = a.name || a.id || a.vid || a.task || a.kind || '';
        return 'obj' + (nm ? ':' + String(nm).slice(0, 40) : '');
      }
      return typeof a;
    });
  }
  let depth = 0;
  let claimed = new Set(); // diff keys claimed during current outermost call
  const wrapped = new Set();
  for (const key of Object.keys(Game)) {
    let fn;
    try { fn = Game[key]; } catch (e) { continue; }
    if (typeof fn !== 'function' || fn.__pantrydiffInstalled) continue;
    const orig = fn;
    const wrap = function (...args) {
      const outer = depth === 0;
      if (outer) claimed = new Set();
      depth++;
      const before = pantry();
      let ret, threw = null;
      try { ret = orig.apply(this, args); }
      catch (e) { threw = e; }
      const after = pantry();
      depth--;
      if (threw === null) {
        const d = diff(before, after);
        const fresh = [];
        for (const item of d) {
          const k = item.stack + '|' + item.field + '|' + item.before + '->' + item.after;
          if (claimed.has(k)) continue;
          claimed.add(k);
          fresh.push(item);
        }
        if (fresh.length) {
          const entry = { day: dayOf(), fn: key, args: summarizeArgs(args), diffs: fresh };
          if (key === '_removePantryKcal') {
            try { entry.stack = new Error().stack.split('\n').slice(1, 9).join(' | '); } catch (e) { /* no stack */ }
          }
          log.push(entry);
        }
      }
      if (threw !== null) throw threw;
      return ret;
    };
    wrap.__pantrydiffInstalled = true;
    try { Game[key] = wrap; wrapped.add(key); } catch (e) { /* read-only prop: skip */ }
  }
  return { log, wrappedCount: wrapped.size, wrapped: Array.from(wrapped) };
}

module.exports = { installPantrydiffCapture, TARGETS };
