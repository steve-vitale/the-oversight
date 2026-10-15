#!/usr/bin/env node
// vinebank-pilot-20261014.js — sim-vinebank arm pilot (lever loop B, 2026-10-14).
// ARM: materials-banking policy layer for the blind trapline (snaregate's
// named next), scripts/policies/vinebank.js, opt-in VINEBANK=1 (default OFF).
//
// Pre-registered (docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: blind-band craft attempts >= 1 on >= 4/8 armed seeds
//     AND armed blind-band crafts >= 2x control blind-band crafts.
//     (GO needs the mechanism firing, not just a count. Control has no blind
//     band — its blind-band crafts are 0 by construction, so the binding
//     operational bar is the attempts conjunct; armed-vs-control TOTAL crafts
//     is reported as honest context, never re-scored.)
//   GUARDRAILS: median survival >= control-10d; national >= control-2;
//     no new death mode (n>=3 per finding #216); starvation <= control+9.
//   KILL: a miss on primary OR guardrail -> delete the layer before commit,
//     keep only the evidence (killed arms leave no trace).
//   Horizon: 150d death-aware (Game.over stops the run; dead villages stop
//     simulating). Seeds: 11, 22, 33, 44, 55, 66, 77, 88 x competent,
//     belongseek (16 runs/side, IDENTICAL seeds baseline vs armed).
//   Sides: baseline = VINEBANK unset (default OFF); armed = VINEBANK=1.
//     Code identical otherwise, same commit.
//   Convergence: converging -> 12-16 seed confirm if GO met; killed-at-pilot
//     otherwise.
//
// Usage:
//   SMOKE=1 node scripts/vinebank-pilot-20261014.js   (instrument-honesty gate)
//   LABEL=baseline OUTDIR=evidence/2026-10-14 node scripts/vinebank-pilot-20261014.js
//   LABEL=armed VINEBANK=1 OUTDIR=evidence/2026-10-14 node scripts/vinebank-pilot-20261014.js
// Writes: <OUTDIR>/vinebank-pilot-<LABEL>.json (rows + flat aggregates for
// the telemetry deviation check) and <OUTDIR>/vinebank-transcript-<LABEL>.txt
// (trap/vine/stick say-lines from armed runs for the sense read).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// Named-export policy unwrap (finding #69): never Object.assign({}, require(...))
// — that yields {competent:{...}} and the suite runs policy-less.
const POLICY_REGISTRY = {
  competent: require('./policies/competent').competent,
  belongseek: require('./policies/belongseek').belongseek,
};

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [11, 22, 33, 44, 55, 66, 77, 88]);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',') : ['competent', 'belongseek']);
const DAYS = parseInt(process.env.DAYS || '150', 10);
const LABEL = process.env.LABEL || 'run';
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-14');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const TRAP_IDS = /^(snare|deadfall|box_trap|spring_snare|minnow_trap|pit_trap)$/;
const ARMED = process.env.VINEBANK === '1';
const SAY_RE = /snare|trap|vine|stick|knap|blind/i;

function packMat(Game, m) {
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
  } catch (e) { return 0; }
}
function stdSnapshot(Game) {
  const out = { won: false, tableWaiting: false, rank: 'village', exiled: false };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.exiled = !!(Game.state && Game.state.exiled); } catch (e) {}
  return out;
}

async function oneRun(seed, policyId) {
  const { Game } = await loadGame({ seed, mode: 'vinebank-pilot' });
  await setupGame(Game);
  const base = POLICY_REGISTRY[policyId];
  const policy = Object.create(base); // inherit, never mutate the shared export
  // --- measurement wrappers (no behavior change) ---
  let playerCrafted = 0, playerSet = 0, snareAttempts = 0;
  let vineMax = 0, stickMax = 0;
  let blindAttempts = 0, blindCrafts = 0, deferred = 0;
  let deferKnife = 0, deferArm = 0, deferArrow = 0, deferArmor = 0;
  const beats = [];
  const hist = { maxRank: 0, everTable: false, everWon: false, everExiled: false };
  try {
    const _craft = Game.craft.bind(Game), _setTrap = Game.setTrap.bind(Game);
    Game.craft = function (id) {
      if (id === 'snare') snareAttempts++;
      const r = _craft.apply(this, arguments);
      if (r && TRAP_IDS.test(id)) playerCrafted++;
      return r;
    };
    Game.setTrap = function (id) {
      const r = _setTrap.apply(this, arguments);
      if (r) playerSet++;
      return r;
    };
    const _say = Game.say ? Game.say.bind(Game) : null;
    if (_say) Game.say = function (msg) {
      try { if (SAY_RE.test(String(msg)) && beats.length < 60) beats.push(`d${(Game.state.scholar || {}).day || 0}: ${String(msg).slice(0, 160)}`); } catch (e) {}
      return _say.apply(this, arguments);
    };
  } catch (e) {}
  const origDaily = base.daily;
  policy.daily = function (G, ctx) {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      if (s.tableWaiting) hist.everTable = true;
      if (s.won) hist.everWon = true;
      if (s.exiled) hist.everExiled = true;
      vineMax = Math.max(vineMax, packMat(G, 'vine'));
      stickMax = Math.max(stickMax, packMat(G, 'stick'));
    } catch (e) {}
    const r = origDaily(G, ctx);
    try {
      blindAttempts = Math.max(blindAttempts, ctx.vinebankBlindAttempts || 0);
      blindCrafts = Math.max(blindCrafts, ctx.vinebankBlindCrafts || 0);
      deferred = Math.max(deferred, ctx.vinebankDeferred || 0);
      deferKnife = Math.max(deferKnife, ctx.vinebankDeferKnife || 0);
      deferArm = Math.max(deferArm, ctx.vinebankDeferArm || 0);
      deferArrow = Math.max(deferArrow, ctx.vinebankDeferArrow || 0);
      deferArmor = Math.max(deferArmor, ctx.vinebankDeferArmor || 0);
    } catch (e) {}
    return r;
  };
  const res = await runDays(Game, policy, { days: DAYS, manifest: { seed, policy: policyId } });
  const sday = (Game.state.scholar || {}).day || 0;
  const end = stdSnapshot(Game);
  hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0);
  if (end.tableWaiting) hist.everTable = true;
  if (end.won) hist.everWon = true;
  if (end.exiled) hist.everExiled = true;
  const deaths = ((res.samples || {}).deaths || []);
  const playerDeathCauses = deaths.filter(d => d.player).map(d => String(d.cause || d.kind || 'unknown'));
  return {
    seed, policy: policyId, label: LABEL,
    survivalDays: sday, over: !!Game.over,
    pop: ((Game.state.village || {}).roster || []).length,
    playerSnareLevel: (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0,
    trapsCrafted: playerCrafted,
    snareCraftAttempts: snareAttempts,
    blindBandAttempts: blindAttempts,
    blindBandCrafts: blindCrafts,
    vinebankDeferred: deferred, deferKnife, deferArm, deferArrow, deferArmor,
    trapsSet: playerSet,
    vineMax, stickMax,
    playerDeathCauses,
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    wins: hist.everWon ? 1 : 0,
    exiled: hist.everExiled ? 1 : 0,
    waveReach: res.maxWaveUnlocked || 1,
    deaths: deaths.length,
    beats,
  };
}

function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// INSTRUMENT-HONESTY GATE (#69): SMOKE=1 runs a short live smoke per policy
// BEFORE any pilot spend and FAILS LOUDLY unless the policy is genuinely
// driving: (1) policy.daily is a function after unwrap; (2) the harness
// actually invokes policy.daily; (3) >=1 policy-origin deliberate act.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] unwrapped policy.daily is a function`,
      base && typeof base.daily === 'function', 'typeof=' + (base && typeof base.daily));
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s) — the suite would run policy-less.`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.create(base);
    policy.daily = function (G, ctx) { dailyCalls++; return base.daily(G, ctx); };
    const { Game } = await loadGame({ seed: 11, mode: 'vinebank-smoke-' + pid, fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    let policyActs = 0;
    try {
      for (const row of (result.pacing.perDay || [])) {
        for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
      }
    } catch (e) {}
    check(`[${pid}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0, `days=${result.days}`);
    check(`[${pid}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
    check(`[${pid}] >=1 policy-origin deliberate act (policyActs=${policyActs})`, policyActs > 0);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s) — the policy is present but not driving. Fix before measuring.`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive — safe to measure.');
}

(async () => {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const rows = [];
  const allBeats = [];
  for (const seed of SEEDS) {
    for (const pid of POLICIES) {
      console.log(`--- ${LABEL} seed=${seed} policy=${pid} ---`);
      const t0 = Date.now();
      try {
        const row = await oneRun(seed, pid);
        rows.push(row);
        for (const b of (row.beats || [])) allBeats.push(`[${seed}/${pid}] ${b}`);
        delete row.beats;
        console.log(`  survival=${row.survivalDays}d pop=${row.pop} craft=${row.trapsCrafted} blindAtt=${row.blindBandAttempts} blindCraft=${row.blindBandCrafts} defer=${row.vinebankDeferred} vineMax=${row.vineMax} stickMax=${row.stickMax} snareL=${row.playerSnareLevel} pdeaths=[${row.playerDeathCauses.join(',')}] nat=${row.national} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      } catch (e) {
        console.log(`  ERROR ${e.message}`);
        rows.push({ seed, policy: pid, label: LABEL, error: String(e.message).slice(0, 200) });
      }
    }
  }
  const good = rows.filter(r => !r.error);
  const flat = {
    national: good.reduce((t, r) => t + (r.national || 0), 0),
    table: good.reduce((t, r) => t + (r.table || 0), 0),
    wins: good.reduce((t, r) => t + (r.wins || 0), 0),
    exiled: good.reduce((t, r) => t + (r.exiled || 0), 0),
    trapsCrafted: good.reduce((t, r) => t + (r.trapsCrafted || 0), 0),
    snareCraftAttempts: good.reduce((t, r) => t + (r.snareCraftAttempts || 0), 0),
    blindBandAttempts: good.reduce((t, r) => t + (r.blindBandAttempts || 0), 0),
    blindBandCrafts: good.reduce((t, r) => t + (r.blindBandCrafts || 0), 0),
    vinebankDeferred: good.reduce((t, r) => t + (r.vinebankDeferred || 0), 0),
    seedsWithBlindAttempt: good.filter(r => (r.blindBandAttempts || 0) >= 1).map(r => r.seed + '/' + r.policy),
    seedsWithCraft: good.filter(r => (r.trapsCrafted || 0) >= 1).map(r => r.seed + '/' + r.policy),
    medianSurvival: median(good.map(r => r.survivalDays)),
    maxSurvival: Math.max.apply(null, good.map(r => r.survivalDays).concat([0])),
    playerDeathCauses: {},
  };
  for (const r of good) for (const c of (r.playerDeathCauses || [])) flat.playerDeathCauses[c] = (flat.playerDeathCauses[c] || 0) + 1;
  const out = { label: `vinebank-pilot-${LABEL}`, days: DAYS, seeds: SEEDS, policies: POLICIES, armed: ARMED, rows, flat };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const p = path.join(OUTDIR, `vinebank-pilot-${LABEL}.json`);
  fs.writeFileSync(p, JSON.stringify(out, null, 1));
  console.log('wrote', p);
  const tp = path.join(OUTDIR, `vinebank-transcript-${LABEL}.txt`);
  fs.writeFileSync(tp, allBeats.join('\n') + '\n');
  console.log('wrote', tp, `(${allBeats.length} beats)`);
  console.log('FLAT', JSON.stringify(flat));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
