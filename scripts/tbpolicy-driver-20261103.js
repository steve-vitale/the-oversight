// tbpolicy-driver-20261103.js — TB-policy arm driver (sim-tbpolicy-a).
// Runs one policy module on seeds 99101-99108, 140d death-aware, with the
// w4convert instrument (trajectory-neutral wraps) PLUS decision telemetry
// that is itself decision-neutral: a fight() counting wrapper (counts
// player turns per wave-4 TB fight, in start order) and a tbBarrierExit
// counting wrapper (flee pushes attempted while a wave-4 TB fight is
// open). Neither wrapper changes any decision or consumes RNG.
// Per-seed JSON to evidence/2026-11-03/perseed-tbpolicy-a/; refuses to
// overwrite. Prints a per-seed summary incl. trajectory identity vs the
// w4convert per-seed files (calibration gate: baseline must reproduce
// w4convert days/endReason/kills exactly).
// Usage:
//   DAYS=140 SEEDS=99101,99102 RUN=tbpolicy-base POLICY=competent \
//     node scripts/tbpolicy-driver-20261103.js
// POLICY is a scripts/policies/<name>.js module (no .js suffix) exporting
// a policy object, or 'competent' for verbatim competent.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'w4convert-instrument-20261103'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || 'tbpolicy';
const POLICY = process.env.POLICY || 'competent';
if (!SEEDS.length) { console.error('TBPOLICY STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-tbpolicy-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'tbpolicy-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('TBPOLICY STOP: refusing to overwrite ' + file); process.exit(3); }
}

function loadPolicy() {
  if (POLICY === 'competent') {
    const m = require(path.join(REPO, 'scripts', 'policies', 'competent'));
    return m.competent;
  }
  const m = require(path.join(REPO, 'scripts', 'policies', POLICY));
  // Variant modules export either the policy object directly or { <name> }.
  if (m && typeof m.fight === 'function') return m;
  const keys = Object.keys(m || {});
  for (const k of keys) { if (m[k] && typeof m[k].fight === 'function') return m[k]; }
  throw new Error('policy module ' + POLICY + ' exports no fight() policy');
}

function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}

function fightIsW4(Game, fight) {
  try {
    for (const f of ((fight && fight.fighters) || [])) {
      if (!f || f.kind !== 'monster') continue;
      const mid = ((f.mdef || {}).id || f.monsterId || f.id) || null;
      if (mid && waveOf(Game, mid) === 4) return true;
    }
  } catch (e) {}
  return false;
}

async function oneRun(seed, basePolicy) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-tbpolicy-' + RUN, fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;

  // Decision telemetry (decision-neutral counting wrappers).
  const w4Turns = []; // in wave-4 TB fight start order: {turns, pushes}
  const w4CtxDeltas = []; // same order: per-fight competent ctx counter deltas
  let curFight = null; // current tbfight object seen by the wrapper
  let curRec = null;
  let curStartCtx = null;
  let lastCtx = null;
  let barrierPushesW4 = 0;
  function ctxSnap(ctx) {
    if (!ctx) return null;
    let ap = 0;
    try { const o = ctx.abilityPresses || {}; for (const k of Object.keys(o)) ap += o[k] || 0; } catch (e) {}
    return {
      struck: ctx.struck || 0, fled: ctx.fled || 0, fledBad: ctx.fledBad || 0,
      closed: ctx.closed || 0, beastTricks: ctx.beastTricks || 0, abilityPresses: ap,
      barrierPushes: ctx.barrierPushes || 0, dirWalks: ctx.dirWalks || 0,
      fleeBlocked: ctx.fleeBlocked || 0, fledHeld: ctx.fledHeld || 0,
    };
  }
  function ctxDelta(a, b) {
    if (!a || !b) return null;
    const o = {};
    for (const k of Object.keys(a)) o[k] = b[k] - a[k];
    return o;
  }
  const origBarrierExit = Game.tbBarrierExit;
  if (typeof origBarrierExit === 'function') {
    Game.tbBarrierExit = function () {
      try {
        if (Game.tbfight && !Game.tbfight.over && fightIsW4(Game, Game.tbfight)) {
          barrierPushesW4++;
          if (curRec && curFight === Game.tbfight) curRec.pushes++;
        }
      } catch (e) {}
      return origBarrierExit.apply(this, arguments);
    };
  }
  const wrapped = Object.assign({}, basePolicy, {
    fight: function (Gm, ctx) {
      try {
        lastCtx = ctx || lastCtx;
        const f = Game.tbfight;
        if (f && !f.over && fightIsW4(Game, f)) {
          if (curFight !== f) { curFight = f; curRec = { turns: 0, pushes: 0 }; w4Turns.push(curRec); curStartCtx = ctxSnap(ctx); }
          curRec.turns++;
        }
      } catch (e) {}
      return basePolicy.fight(Gm, ctx);
    },
  });
  // Outermost tbEnd wrap (installed after the instrument's): snapshots the
  // competent ctx counter deltas for the wave-4 fight being ended. Read-only;
  // calls through to the instrument's wrap exactly once.
  const origTbEndOuter = Game.tbEnd;
  Game.tbEnd = function (result) {
    let pending = null;
    try {
      const f = Game.tbfight;
      if (f && !f.over && curFight === f && curRec && fightIsW4(Game, f)) {
        pending = { rec: curRec, start: curStartCtx, end: ctxSnap(lastCtx) };
      }
    } catch (e) {}
    const r = origTbEndOuter.apply(this, arguments);
    try {
      if (pending) {
        w4CtxDeltas.push(ctxDelta(pending.start, pending.end));
        curFight = null; curRec = null; curStartCtx = null;
      }
    } catch (e) {}
    return r;
  };
  // Restore tbBarrierExit after the run so the instrument's uninstall is
  // the only other teardown; the wrap is call-through so trajectory is
  // unaffected either way.
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { Game.tbBarrierExit = origBarrierExit; } catch (e) {}
  try { Game.tbEnd = origTbEndOuter; } catch (e) {}
  try { inst.uninstall(); } catch (e) {}

  // Trajectory identity vs the w4convert per-seed file (calibration gate).
  let identity = 'no-w4convert-file';
  try {
    const other = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-03', 'perseed-w4convert-a', 'w4convert-s' + seed + '-w4convert.json'), 'utf8'));
    const mine = t.killRows.map(function (r) { return [r.day, r.mid, r.by, r.via]; });
    const theirs = (other.killRows || []).map(function (r) { return [r.day, r.mid, r.by, r.via]; });
    identity = (other.days === result.days && other.endReason === result.endReason && JSON.stringify(theirs) === JSON.stringify(mine)) ? 'MATCH' : 'DIVERGED';
  } catch (e) { identity = 'read-error: ' + String(e.message).slice(0, 60); }

  // Per-TB-exposure derived metrics, zipped in start order with w4Turns.
  const tbEx = t.exposures.filter(function (e) { return e.type === 'tb'; });
  const tbDerived = tbEx.map(function (ex, i) {
    let hpPct = null;
    try {
      const start = (ex.monsters || []).filter(function (m) { return m.mid && waveOf(Game, m.mid) === 4; });
      const startHp = start.reduce(function (a, m) { return a + (m.hp || 0); }, 0);
      const endM = (ex.end && ex.end.monsters) || [];
      const endHp = endM.filter(function (m) { return m.mid && waveOf(Game, m.mid) === 4; })
        .reduce(function (a, m) { return a + (m.alive ? (m.hp || 0) : 0); }, 0);
      if (startHp > 0) hpPct = +((1 - endHp / startHp) * 100).toFixed(1);
    } catch (e) {}
    const rec = w4Turns[i] || null;
    return {
      seq: ex.seq, day: ex.day, mid: ex.mid, partySizeStart: ex.partySizeStart,
      result: ex.end ? ex.end.result : 'unended',
      kills: (ex.kills || []).filter(function (r) { return r.entryAdded !== false; }).length,
      hpDealtPct: hpPct, playerTurns: rec ? rec.turns : null, barrierPushes: rec ? rec.pushes : null,
      ctxDelta: w4CtxDeltas[i] || null,
    };
  });
  const st = Game.state || {};
  return {
    seed: seed, run: RUN, policy: POLICY, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, villageLost: !!Game.villageLost,
    maxWave: result.maxWaveUnlocked || 1,
    identity: identity,
    spawnsW4: t.spawns.length, tbCalls: t.tbCalls,
    tbStarted: tbEx.length,
    fieldsW4: t.exposures.filter(function (e) { return e.type === 'field'; }).length,
    exposures: t.exposures, killRows: t.killRows, unlinkedKills: t.unlinkedKills,
    spawns: t.spawns, deathDays: t.deathDays, deathEvents: t.deathEvents,
    orphanTbEnds: t.orphanTbEnds, wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors,
    tbDerived: tbDerived, w4TurnsCount: w4Turns.length, barrierPushesW4: barrierPushesW4,
    w4CtxDeltasCount: w4CtxDeltas.length,
    tbTurnsZipMismatch: (w4Turns.length !== tbEx.length || w4CtxDeltas.length !== tbEx.length),
  };
}

(async function () {
  const basePolicy = loadPolicy();
  for (const seed of SEEDS) {
    const out = await oneRun(seed, basePolicy);
    const file = path.join(outDir, 'tbpolicy-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const tb = out.tbDerived;
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, end: out.endReason, identity: out.identity,
      spawnsW4: out.spawnsW4, tbStarted: out.tbStarted, fieldsW4: out.fieldsW4,
      killsW4: out.killRows.length, tbKills: tb.reduce(function (a, d) { return a + d.kills; }, 0),
      results: tb.reduce(function (a, d) { a[d.result] = (a[d.result] || 0) + 1; return a; }, {}),
      zipMismatch: out.tbTurnsZipMismatch, barrierPushesW4: out.barrierPushesW4,
      errors: out.instrumentErrors.length,
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
