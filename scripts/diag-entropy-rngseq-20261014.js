'use strict';
// diag-entropy-rngseq-20261014.js — record the full seeded-RNG call sequence
// (seqNo -> caller location) for two in-process runs and find the FIRST
// call where consumption diverges. Intercepts Math.random ASSIGNMENT via
// defineProperty so eval-captured `const R = Math.random` references also
// hit the recorder.
process.env.FEASTSCALE_R13 = '1';

const seqLogs = []; // per run: array of "callerLoc"
let curLog = null;
let seqNo = 0;

function callerLoc() {
  const st = new Error().stack.split('\n');
  // skip: Error, callerLoc, recording wrapper; take first real caller
  for (let i = 3; i < Math.min(st.length, 8); i++) {
    const m = st[i].match(/\(?.*?([^\/\)]+\.js):(\d+):\d+\)?$/);
    if (m) return m[1] + ':' + m[2];
  }
  return st[3] ? st[3].trim().slice(0, 80) : '?';
}

function makeRecording(fn) {
  return function recordedRandom() {
    if (curLog) curLog.push(seqNo + '@' + callerLoc());
    seqNo++;
    return fn();
  };
}

// Intercept the harness's `Math.random = mulberry32(seed)` assignment.
let assignedFn = Math.random;
Object.defineProperty(Math, 'random', {
  configurable: true,
  get() { return assignedFn; },
  set(fn) { assignedFn = (typeof fn === 'function') ? makeRecording(fn) : fn; }
});

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
  seqNo = 0; curLog = [];
  const { Game } = await loadGame({ seed, mode: 'entropy-rngseq' });
  await setupGame(Game);
  const base = leadfeast.daily, hashes = [];
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base(G, ctx); };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  seqLogs[runNo] = curLog; curLog = null;
  return { hashes, days: r.days, endReason: r.endReason, rngCalls: seqLogs[runNo].length };
}

(async () => {
  const a = await one(44, 0), b = await one(44, 1);
  console.log('rngCalls A:', a.rngCalls, 'B:', b.rngCalls, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason);
  const A = seqLogs[0], B = seqLogs[1];
  let first = -1;
  const n = Math.min(A.length, B.length);
  for (let i = 0; i < n; i++) {
    // compare caller location only (values are deterministic given same seq)
    const ca = A[i].split('@')[1], cb = B[i].split('@')[1];
    if (ca !== cb) { first = i; break; }
  }
  if (A.length !== B.length) console.log('LENGTH DIFF: A=' + A.length + ' B=' + B.length);
  console.log('firstDivRngSeq:', first);
  if (first >= 0) {
    for (let i = Math.max(0, first - 3); i < Math.min(n, first + 4); i++)
      console.log(i, 'A:', A[i], ' B:', B[i], A[i] === B[i] ? '' : ' <--');
  } else console.log('RNG call sequences IDENTICAL (same length, same callers)');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
