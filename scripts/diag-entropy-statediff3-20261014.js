'use strict';
// diag-entropy-statediff3-20261014.js — diff Game.state at day 100 IGNORING
// known-benign wall-clock fields (runKey, startedAt, pacing, telemetry[].t,
// linkId timestamp portions). Reports any NON-timestamp differences.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

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
    // IGNORE known-benign wall-clock fields
    if (k === 'runKey' || k === 'startedAt' || k === 'pacing') continue;
    if (k === 't' || k === 'at' || k === 'lastTs' || k === 'lastPlayed') continue;
    try { o[k] = snap(v[k], seen, depth + 1); } catch (e) { o[k] = '[err]'; }
  }
  return o;
}
// Normalize IDs containing timestamps: link_<base36ts><rand> -> link_<rand>
function normIds(v) {
  if (typeof v === 'string') {
    return v.replace(/link_[0-9a-z]+(\d{1,3})$/, 'link_R$1')
            .replace(/^(scattering-save-v1-gen_[0-9a-z]+-)\d+$/, '$1TS');
  }
  if (Array.isArray(v)) return v.map(normIds);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) o[k] = normIds(v[k]);
    return o;
  }
  return v;
}

function diff(a, b, path, out) {
  if (out.length >= 40) return;
  if (a === b) return;
  const ta = Array.isArray(a) ? 'arr' : typeof a, tb = Array.isArray(b) ? 'arr' : typeof b;
  if (ta !== tb) { out.push(path + ' TYPE ' + ta + ' vs ' + tb); return; }
  if (ta !== 'object' && ta !== 'arr') {
    out.push(path + ' = ' + JSON.stringify(String(a).slice(0, 100)) + ' vs ' + JSON.stringify(String(b).slice(0, 100)));
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

async function one(seed) {
  const { Game } = await loadGame({ seed, mode: 'entropy-statediff3' });
  await setupGame(Game);
  let snap100 = null;
  const base = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => {
    if ((Game.state.scholar || {}).day === 100) snap100 = normIds(snap(Game.state));
    return base(G, ctx);
  };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  return { snap100, days: r.days, endReason: r.endReason };
}

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44), b = await one(44);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    const out = [];
    diff(a.snap100, b.snap100, 'state', out);
    console.log('non-timestamp diffs at day 100:', out.length);
    for (const l of out.slice(0, 30)) console.log('  ' + l);
    break;
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
