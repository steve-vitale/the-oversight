'use strict';
// diag-entropy-spy-20261014.js — catch unseeded entropy sources red-handed.
// Installs spies BEFORE requiring anything: any require-time capture of
// Math.random (policy chain!) hits the spy and delegates to NATIVE (unseeded)
// Math.random — recorded with a stack. Date.now / performance.now /
// crypto / hrtime / timers are spied for the whole process; only calls whose
// stack contains game/policy frames are reported (harness's own Date.now
// calls are filtered).
const nativeRandom = Math.random;
const nativeDateNow = Date.now;
const nativePerfNow = (typeof performance !== 'undefined' && performance.now) ? performance.now.bind(performance) : null;
const nativeGetRandomValues = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto.getRandomValues.bind(crypto) : null;
const nativeRandomUUID = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID.bind(crypto) : null;
const nativeHrtime = process.hrtime;
const nativeSetTimeout = setTimeout;
const nativeSetInterval = setInterval;

const hits = []; // {kind, day, stack}
let currentRun = 0;
function gameDay() {
  try {
    const G = globalThis.Scattering && globalThis.Scattering.Game;
    return (G && G.state && G.state.scholar && G.state.scholar.day) || 0;
  } catch (e) { return -1; }
}
function gameFrames(stack) {
  return stack.split('\n').slice(1).filter(l => /src\/js\/|scripts\/policies\/|scripts\/sim-harness/.test(l));
}
function record(kind, stackFull, extra) {
  const gf = gameFrames(stackFull);
  if (!gf.length) return; // harness/node internals only — not game entropy
  hits.push({ run: currentRun, kind, day: gameDay(), extra: extra || '', stack: gf.slice(0, 4).join(' <- ') });
}
// Math.random spy: installed BEFORE requires; loadGame replaces the global
// with the seeded mulberry32, so only require-time captures hit this.
Math.random = function spyRandom() {
  record('Math.random(native)', new Error().stack);
  return nativeRandom();
};
const spyDateNow = function () {
  const s = new Error().stack;
  if (/src\/js\/|scripts\/policies\//.test(s)) record('Date.now', s);
  return nativeDateNow();
};
Date.now = spyDateNow;
if (nativePerfNow) {
  performance.now = function () {
    const s = new Error().stack;
    if (/src\/js\/|scripts\/policies\//.test(s)) record('performance.now', s);
    return nativePerfNow();
  };
}
if (nativeGetRandomValues) {
  crypto.getRandomValues = function (arr) {
    record('crypto.getRandomValues', new Error().stack);
    return nativeGetRandomValues(arr);
  };
}
if (nativeRandomUUID) {
  crypto.randomUUID = function () {
    record('crypto.randomUUID', new Error().stack);
    return nativeRandomUUID();
  };
}
process.hrtime = function (...a) {
  const s = new Error().stack;
  if (/src\/js\/|scripts\/policies\//.test(s)) record('process.hrtime', s);
  return nativeHrtime(...a);
};
if (nativeHrtime.bigint) {
  process.hrtime.bigint = function () {
    const s = new Error().stack;
    if (/src\/js\/|scripts\/policies\//.test(s)) record('hrtime.bigint', s);
    return nativeHrtime.bigint();
  };
}
global.setTimeout = function (fn, ms, ...rest) {
  const s = new Error().stack;
  const gf = gameFrames(s);
  const wrapped = gf.length ? function (...a) {
    record('timer-fired(' + ms + 'ms)', new Error().stack, 'scheduled at day ' + (this && this.__schedDay));
    return fn.apply(this, a);
  } : fn;
  const t = nativeSetTimeout(wrapped, ms, ...rest);
  if (gf.length) { try { wrapped.__schedDay = gameDay(); } catch (e) {} record('setTimeout(' + ms + 'ms)', s); }
  return t;
};
global.setInterval = function (fn, ms, ...rest) {
  const s = new Error().stack;
  if (gameFrames(s).length) record('setInterval(' + ms + 'ms)', s);
  return nativeSetInterval(fn, ms, ...rest);
};

process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}

async function one(seed, runNo) {
  currentRun = runNo;
  const { Game } = await loadGame({ seed, mode: 'entropy-spy' });
  await setupGame(Game);
  const base = leadfeast.daily, hashes = [];
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base(G, ctx); };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  return { hashes, days: r.days, endReason: r.endReason };
}

(async () => {
  const a = await one(44, 1), b = await one(44, 2);
  let first = -1;
  const n = Math.min(a.hashes.length, b.hashes.length);
  for (let i = 0; i < n; i++) if (a.hashes[i] !== b.hashes[i]) { first = i; break; }
  console.log('firstDivIdx', first, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason);
  console.log('=== entropy hits:', hits.length);
  const byKind = {};
  for (const h of hits) {
    byKind[h.kind] = (byKind[h.kind] || 0) + 1;
  }
  console.log(JSON.stringify(byKind, null, 1));
  // Show hits near/after the divergence onset (firstDiv day ~107): the first
  // hit of each kind with day >= 100, plus any Math.random(native) hits.
  const divDay = first >= 0 ? parseInt(a.hashes[first].split(':')[0], 10) : 0;
  console.log('--- first hit per kind with day >= ' + (divDay - 10) + ' (div onset ~' + divDay + ') ---');
  const seen = {};
  for (const h of hits) {
    if (h.day >= divDay - 10 && !seen[h.kind + h.run]) {
      seen[h.kind + h.run] = 1;
      console.log(`run${h.run} day${h.day} ${h.kind} ${h.extra}\n    ${h.stack}`);
    }
  }
  console.log('--- ALL Math.random(native) hits (require-time captures = SMOKING GUN) ---');
  for (const h of hits.filter(h => h.kind === 'Math.random(native)').slice(0, 10))
    console.log(`run${h.run} day${h.day}\n    ${h.stack}`);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
