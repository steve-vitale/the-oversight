// tbend-repro-20261106.js — LIVE REPRODUCTION for sim-tbend-a (diagnostic arm).
// Re-runs the exact 51002 baseline leg (competent policy, fightinterior
// instrument) with tracing wrappers OUTSIDE the instrument, and logs the
// call order around every wave-4+ fight close: tbEnd / startCombat /
// tbPlayerStrike / recordWaveKill entry+exit, whether each threw, and a
// stack on any throw. The wrappers add no RNG draws and no game-state
// writes, so the run must stay byte-identical to the committed corpus
// (evidence/2026-11-06/perseed-fightinterior-b/fightinterior-s51002-
// fightinterior-baseline.json) on days / endReason / kills / traces.
// Writes its event log + comparison to /tmp (OUTDIR for the per-seed JSON
// defaults to /tmp/tbend-repro-20261106; set OUTDIR to override).
// Usage:
//   DAYS=88 SEEDS=51002 node scripts/tbend-repro-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const INST = require(path.join(REPO, 'scripts', 'fightinterior-instrument-20261106'));

const SEEDS = (process.env.SEEDS || '51002').split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '88', 10) || 88;
const OUTDIR = process.env.OUTDIR || '/tmp/tbend-repro-20261106';
fs.mkdirSync(OUTDIR, { recursive: true });
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function stackTop(n) {
  try {
    const st = new Error('tbend-trace').stack || '';
    return st.split('\n').slice(2, 2 + (n || 12)).map(function (l) { return l.trim(); });
  } catch (e) { return []; }
}

async function oneRun(seed) {
  const events = [];
  let seq = 0;
  function log(kind, detail) {
    try {
      events.push(Object.assign({ n: ++seq, kind: kind }, detail || {}));
    } catch (e) {}
  }
  const { Game } = await loadGame({ seed: seed, mode: 'fightinterior-baseline', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;

  // Tracing wrappers, installed OUTSIDE (after) the instrument so they see
  // the instrument's wrappers as the "original". They never throw: all
  // logging is try/caught, and the original's return/throw passes through
  // untouched.
  function traceFn(name, fn, detailFn) {
    const orig = Game[name];
    if (typeof orig !== 'function') { log('missing', { fn: name }); return; }
    Game[name] = function () {
      const args = Array.prototype.slice.call(arguments);
      const d0 = { day: gday(Game) };
      try {
        const f = Game.tbfight;
        d0.round = (f && f.round != null) ? f.round : null;
        d0.mid = (f && f.fighters) ? ((f.fighters.find(function (x) { return x && x.kind === 'monster'; }) || {}).mdef || {}).id || null : null;
        d0.traceOpen = !!t._trace;
        d0.traceSeq = t._trace ? t._trace.seq : null;
      } catch (e) {}
      if (detailFn) { try { Object.assign(d0, detailFn.apply(null, args) || {}); } catch (e) {} }
      // TBEND STACK CAPTURE: a startCombat entered while a trace is open is
      // a nested fight open inside a live fight (the 51002 shape) — keep
      // its call stack so the interleaving site is named, not guessed.
      // tbEnd:enter stacks are kept too (they bracket the nested call).
      try {
        if ((name === 'startCombat' && d0.traceOpen) || name === 'tbEnd') d0.stack = stackTop(16);
      } catch (e) {}
      log(name + ':enter', d0);
      let ret;
      try { ret = orig.apply(this, args); }
      catch (e) {
        const d1 = { day: gday(Game), threw: String((e && e.message) || e).slice(0, 300), stack: stackTop(14) };
        try { d1.traceOpen = !!t._trace; d1.traceSeq = t._trace ? t._trace.seq : null; } catch (e2) {}
        log(name + ':THREW', d1);
        throw e;
      }
      const d2 = { day: gday(Game), ret: (typeof ret === 'object' ? '[obj]' : (ret === undefined ? 'undef' : String(ret).slice(0, 80))) };
      try { d2.traceOpen = !!t._trace; d2.traceSeq = t._trace ? t._trace.seq : null; } catch (e) {}
      log(name + ':exit', d2);
      return ret;
    };
  }
  traceFn('tbPlayerStrike', null, function (targetKey) { return { target: String(targetKey) }; });
  traceFn('tbEnd', null, function (result) { return { result: String(result) }; });
  traceFn('startCombat', null, function (mid) { return { mid: String(mid) }; });
  traceFn('recordWaveKill', null, function (mid, by, via) { return { mid: String(mid), by: String(by), via: String(via) }; });
  // Watch the trace session open/close from outside: poll each day is too
  // coarse; instead wrap the instrument's close indirectly by snapshotting
  // the trace list length on every traced call exit is overkill — the
  // enter/exit traceOpen flags above already bracket every close.

  let lastSnapDay = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try { const d = gday(Game); if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); } } catch (e) {}
      }
    },
  });
  try { RALLY.resetBankkillerStats(); } catch (e) {}
  try { STAGED.resetStageallyStats(); } catch (e) {}
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { log('finalize-threw', { threw: String(e && e.message) }); }
  try { inst.uninstall(); } catch (e) {}

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'tbend-repro', policy: 'baseline', anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost,
    killsLive: t.killsLive, tbFights: t.tbFights || [], traces: t.traces || [],
    waveKillLog: fin ? fin.waveKillLog : null,
    instrumentErrors: t.instrumentErrors,
    events: events,
  };
  const file = path.join(OUTDIR, 'tbend-repro-s' + seed + '.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');

  // Comparison vs the committed corpus leg (same seed, same policy).
  let cmp = { corpusFound: false };
  try {
    const corpus = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-06', 'perseed-fightinterior-b',
      'fightinterior-s' + seed + '-fightinterior-baseline.json'), 'utf8'));
    cmp = {
      corpusFound: true,
      daysMatch: corpus.days === out.days,
      endReasonMatch: corpus.endReason === out.endReason,
      killsLiveMatch: JSON.stringify(corpus.killsLive) === JSON.stringify(out.killsLive),
      tracesMatch: JSON.stringify(corpus.traces) === JSON.stringify(out.traces),
      tbFightsMatch: JSON.stringify(corpus.tbFights) === JSON.stringify(out.tbFights),
      waveKillLogMatch: JSON.stringify(corpus.waveKillLog) === JSON.stringify(out.waveKillLog),
      corpusDays: corpus.days, reproDays: out.days,
      corpusEnd: corpus.endReason, reproEnd: out.endReason,
    };
  } catch (e) { cmp.error = String(e.message); }
  console.log(JSON.stringify({ seed: seed, days: out.days, endReason: out.endReason,
    traces: (out.traces || []).map(function (x) { return [x.seq, x.day, x.mid, x.ending]; }),
    events: events.length, threwEvents: events.filter(function (e) { return /THREW/.test(e.kind); }).length,
    cmp: cmp, file: file }));
  return { out: out, cmp: cmp, events: events };
}

(async function () {
  for (const seed of SEEDS) await oneRun(seed);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
