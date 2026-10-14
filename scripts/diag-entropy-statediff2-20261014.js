'use strict';
// diag-entropy-statediff2-20261014.js — find the actual differing state paths.
// Snapshots Game.state right after setup (day 1) and at day 10/30, then
// deep-diffs run A vs run B, reporting the first differing leaf paths.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

// Deep clone-ish structural snapshot: primitives, sorted keys, cycle-safe.
// Functions -> 'fn', depth-limited.
function snap(v, seen, depth) {
  if (depth > 12) return '[depth]';
  if (v === null || v === undefined) return v;
  const t = typeof v;
  if (t === 'number' || t === 'string' || t === 'boolean') return v;
  if (t === 'function') return '[fn]';
  if (t !== 'object') return '[' + t + ']';
  seen = seen || new Map();
  if (seen.has(v)) return '[ref]';
  seen.set(v, 1);
  if (Array.isArray(v)) return v.map(x => snap(x, seen, depth + 1));
  const o = {};
  for (const k of Object.keys(v).sort()) {
    try { o[k] = snap(v[k], seen, depth + 1); } catch (e) { o[k] = '[err]'; }
  }
  return o;
}

function diff(a, b, path, out) {
  if (out.length >= 40) return;
  if (a === b) return;
  const ta = Array.isArray(a) ? 'arr' : typeof a, tb = Array.isArray(b) ? 'arr' : typeof b;
  if (ta !== tb) { out.push(path + ' TYPE ' + ta + ' vs ' + tb); return; }
  if (ta !== 'object' && ta !== 'arr') {
    const sa = String(a).slice(0, 80), sb = String(b).slice(0, 80);
    out.push(path + ' = ' + JSON.stringify(sa) + ' vs ' + JSON.stringify(sb));
    return;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  const all = new Set([...ka, ...kb]);
  if (ka.length !== kb.length) out.push(path + ' KEYCOUNT ' + ka.length + ' vs ' + kb.length);
  for (const k of all) {
    if (!(k in a)) { out.push(path + '.' + k + ' MISSING in A'); continue; }
    if (!(k in b)) { out.push(path + '.' + k + ' MISSING in B'); continue; }
    diff(a[k], b[k], path + '.' + k, out);
    if (out.length >= 40) return;
  }
}

async function one(seed, snapDays) {
  const { Game } = await loadGame({ seed, mode: 'entropy-statediff2' });
  await setupGame(Game);
  const snaps = { 0: snap(Game.state) };
  const base = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => {
    const day = Game.state.scholar.day;
    if (snapDays.includes(day)) snaps[day] = snap(Game.state);
    return base(G, ctx);
  };
  const r = await runDays(Game, policy, { days: 40, sampleEvery: 10 });
  return { snaps, days: r.days, endReason: r.endReason };
}

(async () => {
  const snapDays = [10, 30];
  const a = await one(44, snapDays), b = await one(44, snapDays);
  console.log('endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason);
  for (const d of [0, ...snapDays]) {
    const out = [];
    diff(a.snaps[d], b.snaps[d], 'state', out);
    console.log('=== day', d, 'diffs:', out.length);
    for (const l of out.slice(0, 25)) console.log('  ' + l);
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
