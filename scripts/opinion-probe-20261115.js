// opinion-probe-20261115.js — SUBSTRATE CHECK for arm sim-onlylead2-b
// (run fleshout-loop-b-20261115T1130Z). The 1055Z run killed the covenant
// Stage 2 as SUBSTRATE-MISSING: opinion 10+ (the engine's peer-proposal
// prerequisite) is only reached at ~day 150 from a cold start, so the
// first covenant beat is structurally past day 175 — beyond a 150d
// horizon. This arm re-tests the substrate on a 200d horizon BEFORE any
// judged sweep (§14b; lesson from the onlylead metric review #4 — never
// freeze a staging bar before proving the substrate exists in-window).
//
// Method: competent-only play (the substrate the covenant policy
// inherits — covenantClimb adds no opinion), 200d death-aware, seeds
// from SEEDS env (default 100421,100422 — the first two pilot seeds).
// After each daily(), record the max opinion among KNOWN villages
// (Game.knowsVillage(v), the same gate the policy uses) and the first
// day it reaches 10. Report checkpoints d30/60/90/120/150/180/200.
// Exit 0 always (this is a probe, not a judge); the prereg decides.
// Usage: SEEDS=100421,100422 DAYS=200 node scripts/opinion-probe-20261115.js
// Writes evidence/2026-11-15/onlylead2-b-opinion-probe.json (OUT env overrides).
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : [100421, 100422]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const CHECKPOINTS = [30, 60, 90, 120, 150, 180, 200];
const OUT = process.env.OUT || path.join(REPO, 'evidence', '2026-11-15', 'onlylead2-b-opinion-probe.json');

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

function maxKnownOpinion(Game) {
  let best = null, bestOp = null;
  try {
    const ovs = ((Game.state || {}).otherVillages || []);
    for (const v of ovs) {
      if (!v || !v.id || v.id === 'haven') continue;
      let known = false;
      try { known = (typeof Game.knowsVillage === 'function') ? !!Game.knowsVillage(v) : false; } catch (e) {}
      if (!known) continue;
      const op = (v.opinion | 0);
      if (bestOp === null || op > bestOp) { bestOp = op; best = v.id; }
    }
  } catch (e) {}
  return { village: best, opinion: bestOp };
}

async function probeOne(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'opinion-probe', fullTelemetry: false });
  const byDay = {}; // day -> {opinion, village}
  let first10 = null;
  const probePolicy = Object.assign({}, competent, {
    daily: function (G, ctx) {
      let r;
      try { r = competent.daily ? competent.daily(G, ctx) : undefined; } catch (e) { throw e; }
      try {
        const day = (((G.state || {}).scholar || {}).day) || 0;
        const m = maxKnownOpinion(G);
        byDay[day] = m;
        if (first10 === null && m.opinion !== null && m.opinion >= 10) first10 = day;
      } catch (e) {}
      return r;
    },
  });
  await setupGame(Game);
  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, probePolicy, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  });
  const checkpoints = {};
  for (const cp of CHECKPOINTS) {
    if (byDay[cp]) checkpoints['d' + cp] = byDay[cp];
    else checkpoints['d' + cp] = { opinion: null, village: null, note: 'village dead before this day' };
  }
  // Max opinion ever seen (in-window), and the day it was first reached.
  let maxEver = null, maxEverDay = null;
  for (const d of Object.keys(byDay).map(Number).sort(function (a, b) { return a - b; })) {
    const op = byDay[d].opinion;
    if (op !== null && (maxEver === null || op > maxEver)) { maxEver = op; maxEverDay = d; }
  }
  return {
    seed: seed, days: result.days, endReason: result.endReason,
    villageLost: !!Game.villageLost, over: !!Game.over,
    checkpoints: checkpoints, firstOpinion10Day: first10,
    maxKnownOpinionEver: maxEver, maxKnownOpinionDay: maxEverDay,
  };
}

(async function () {
  const out = { probe: 'opinion-substrate-200d', policy: 'competent-only', days: DAYS, seeds: [] };
  for (const seed of SEEDS) {
    const r = await probeOne(seed);
    out.seeds.push(r);
    console.log(JSON.stringify(r));
  }
  writeRobust(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log('wrote ' + path.relative(REPO, OUT));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
