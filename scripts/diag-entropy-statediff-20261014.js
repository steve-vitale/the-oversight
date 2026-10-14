'use strict';
// diag-entropy-statediff-20261014.js — deep-compare Game.state between two
// in-process runs at days 50/80/100. The day-hash only covers 7 fields;
// hidden state differences (flags, counters, ids) accumulating from day 1
// would be invisible to it but could drive the day-111 divergence.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

// Deep hash of a value: deterministic, handles cycles, skips functions.
function deepHash(v, seen) {
  if (v === null) return 'null';
  if (v === undefined) return 'undef';
  const t = typeof v;
  if (t === 'number') return 'n' + (Number.isInteger(v) ? v : v.toFixed(6));
  if (t === 'string') return 's' + v.length + ':' + v.slice(0, 60);
  if (t === 'boolean') return 'b' + v;
  if (t === 'function') return 'fn';
  if (t !== 'object') return t + '?';
  seen = seen || new Map();
  if (seen.has(v)) return 'ref' + seen.get(v);
  seen.set(v, seen.size);
  if (Array.isArray(v)) {
    return 'a[' + v.length + ']{' + v.map(x => deepHash(x, seen)).join(',') + '}';
  }
  const keys = Object.keys(v).sort();
  return 'o{' + keys.map(k => k + '=' + deepHash(v[k], seen)).join(',') + '}';
}

function stateHash(Game) {
  try { return deepHash(Game.state); }
  catch (e) { return 'HASHERR:' + e.message; }
}
// Simple string hash to keep memory sane (state hashes are huge).
function shortHash(s) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}

async function one(seed, runNo, snapDays) {
  const { Game } = await loadGame({ seed, mode: 'entropy-statediff' });
  await setupGame(Game);
  const base = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  const snaps = {};
  policy.daily = (G, ctx) => {
    const day = Game.state.scholar.day;
    if (snapDays.includes(day)) snaps[day] = shortHash(stateHash(Game));
    return base(G, ctx);
  };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  return { snaps, days: r.days, endReason: r.endReason, full100: null };
}

(async () => {
  const snapDays = [50, 80, 100];
  const a = await one(44, 0, snapDays), b = await one(44, 1, snapDays);
  console.log('endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason);
  for (const d of snapDays) {
    console.log('day', d, 'state hash', a.snaps[d] === b.snaps[d] ? 'IDENTICAL' : 'DIFFER',
      String(a.snaps[d]).slice(0, 12), 'vs', String(b.snaps[d]).slice(0, 12));
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
