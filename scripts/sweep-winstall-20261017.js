#!/usr/bin/env node
// scripts/sweep-winstall-20261017.js — WINSTALL post-modal stall diagnostic
// (flesh-out loop, axis scale-onramp, 2026-10-17, sim-findings #446).
//
// THE QUESTION: on the seatdrive-composed substrate the driver took the seat
// 11/11 but wins were 0/16 — WHY does no win land after the table modal?
//
// SUBSTRATE (asserted up front — identical to the seatblow sweep for direct
// comparability):
//   FEASTSCALE_R13=1, SEATDRIVE=1 EXPLICIT via scripts/policies/seatdrive.js
//   leadseat/belongseat = withSeatDrive(withWinDefer(tribfloor base)).
//   NOTE: WINDEFER/WINPURSUIT are deliberately NOT set here — the sweep
//   measures the substrate as the seatblow arm ran it. The working
//   hypothesis (evidence/2026-10-17/sim-winstall.md pre-registration) is that
//   the modal drain is env-gated OFF on this exact env, so the 7-door offer
//   is never answered; the instrument measures whether that is true.
//
// 8 FRESH seeds [5201-5208] x {leadseat, belongseat} = 16 runs, 180d
// death-aware, identical-seed lead/belong pairs. DIAGNOSTIC: the instrument
// is read-only — hooks record, never alter. The det-gate (proof) pins
// byte-identical trajectories vs the uninstrumented policy.
//
// HORIZON PROBE: PROBE250=1 (or --probe) re-runs the SITTING non-winning
// runs to 250d with the same seeds (deterministic 1–180d prefix) to
// distinguish "too short" from "structurally unsatisfied".
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=1 node scripts/sweep-winstall-20261017.js
//   FEASTSCALE_R13=1 SEATDRIVE=1 PROBE250=1 node scripts/sweep-winstall-20261017.js
// Targeted: SEEDS="5201,5202" ONLY="leadseat" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=1 node scripts/sweep-winstall-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { leadseat, belongseat } = require('./policies/seatdrive');
const { attachWinstallCapture } = require('./winstall-instrument-20261017');

const DATE = '2026-10-17';
function assertSubstrate() {
  const fails = [];
  if (process.env.FEASTSCALE_R13 !== '1') fails.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '1') fails.push('SEATDRIVE=1 required EXPLICIT (unset is not the pinned state for this sweep)');
  if (fails.length) { console.error('SWEEP STOP: ' + fails.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [5201, 5202, 5203, 5204, 5205, 5206, 5207, 5208]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const PROBE = process.env.PROBE250 === '1' || process.argv.includes('--probe');
const POLICIES = { leadseat, belongseat };
const ROAD_IDS = process.env.ONLY ? String(process.env.ONLY).split(',').map(s => s.trim()).filter(s => POLICIES[s])
  : ['leadseat', 'belongseat'];
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-winstall');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// ---------- one instrumented run ----------
// opts: { days, writeJson, instrumented, probeTag }
async function runWinstall(seed, policyId, opts) {
  opts = opts || {};
  const days = opts.days || DAYS;
  const writeJson = opts.writeJson !== false;
  const instrumented = opts.instrumented !== false;
  const probeTag = opts.probeTag || null;
  const policy = POLICIES[policyId];
  if (!policy) throw new Error('unknown policy ' + policyId);
  const { Game } = await loadGame({ seed, mode: `winstall-${policyId}` });
  await setupGame(Game);
  const inst = instrumented ? attachWinstallCapture(Game) : null;
  const hist = { maxRank: 0 };
  const hashes = [];
  let lastCtx = null;
  const oDaily = policy.daily;
  policy.daily = (G, ctx) => {
    lastCtx = ctx || null;
    let r;
    if (oDaily) r = oDaily(G, ctx);
    try {
      if (inst) inst.sample();
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      hashes.push(G.state.scholar.day + ':' + dayHash(G));
    } catch (e) { if (inst) inst.capture.errors++; }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 30 }); });
  policy.daily = oDaily; // restore (same process runs many seeds)
  let cap = null;
  if (inst) {
    try { cap = inst.finish(lastCtx); } catch (e) { cap = inst.capture; cap.errors++; }
    try { inst.restore(); } catch (e) {}
  }
  const end = cap ? cap.snapEnd : {};
  const out = {
    seed, policyId, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    maxRank: hist.maxRank | 0, national: hist.maxRank >= 2 ? 1 : 0,
    wins: Game.won ? 1 : 0, wonDay: cap ? cap.wonDay : null,
    // the seat chain
    sitN: cap ? cap.sitEvents.length : 0,
    sitDay: (cap && cap.sitEvents.length) ? cap.sitEvents[0].day : null,
    seatKind: (cap && cap.sitEvents.length) ? cap.sitEvents[0].seat : null,
    // the answering record
    chooseCallsN: cap ? cap.chooseCalls.length : 0,
    progOpsN: cap ? cap.chooseCalls.filter(c => !c.noOp).length : 0,
    tableAnswers: cap ? cap.tableAnswersEnd : null,
    deferN: cap ? cap.deferEvents.length : 0,
    finalN: cap ? cap.finalEvents.length : 0,
    finals: cap ? cap.finalEvents.map(f => ({ day: f.day, finalId: f.finalId, won: f.won })) : [],
    // end-state
    phaseEnd: end.phase || null, pathEnd: end.path || null, beatEnd: end.beat,
    branchEnd: end.branch || null, weakenedEnd: end.weakened | 0,
    winDeferredEnd: end.winDeferred ? 1 : 0,
    modalSigEnd: end.modalSig || null, modalNEnd: end.modalN | 0,
    tableWaitingEnd: end.tableWaiting ? 1 : 0, tableDoneEnd: end.tableDone ? 1 : 0,
    floorOkEnd: end.floorOk == null ? null : (end.floorOk ? 1 : 0),
    // the verdict
    stall: cap && cap.stall ? cap.stall.stall : null,
    instrumentErrors: cap ? (cap.errors | 0) : 0,
    instrumented: !!instrumented,
    probe250: probeTag ? 1 : 0,
    hashes,
  };
  if (writeJson) {
    fs.mkdirSync(EVID, { recursive: true });
    const jsonOut = Object.assign({}, out);
    delete jsonOut.hashes; // per-seed JSONs carry analysis, not the det-gate hash chain
    // keep chooseCalls compact but complete (the answering record IS the payload)
    jsonOut.chooseCalls = cap ? cap.chooseCalls.map(c => ({
      day: c.day, id: c.id, pb: c.phaseBefore, pa: c.phaseAfter,
      pathB: c.pathBefore, pathA: c.pathAfter, beatB: c.beatBefore, beatA: c.beatAfter,
      noOp: c.noOp ? 1 : 0, won: c.won ? 1 : 0,
    })) : [];
    jsonOut.deferDays = cap ? cap.deferEvents.map(d => d.day) : [];
    jsonOut.tableLines = cap ? cap.tableLines.slice(-30) : [];
    const fname = probeTag ? `probe250-${policyId}-s${seed}.json` : `${policyId}-s${seed}.json`;
    fs.writeFileSync(path.join(EVID, fname), JSON.stringify(jsonOut, null, 1));
  }
  console.log(`  [${policyId} s${seed}${probeTag ? ' PROBE250' : ''}] days=${out.gameDays} end=${out.endReason} wins=${out.wins} sit=${out.sitN ? out.sitDay : 'no'} answers=${out.tableAnswers} choose=${out.chooseCallsN} prog=${out.progOpsN} finals=${out.finalN} stall=${out.stall} err=${out.instrumentErrors}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function main() {
  assertSubstrate();
  const recs = [];
  for (const policyId of ROAD_IDS) {
    for (const seed of SEEDS) {
      recs.push(await runWinstall(seed, policyId, { days: EFF_DAYS }));
    }
  }
  console.log('\n== winstall summary (180d) ==');
  for (const policyId of ROAD_IDS) {
    const rs = recs.filter(r => r.policyId === policyId);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const stalls = {};
    for (const r of rs) stalls[r.stall] = (stalls[r.stall] || 0) + 1;
    console.log(`${policyId}: n=${n} wins=${sum('wins')}/${n} sit=${rs.filter(r => r.sitN > 0).length}/${n} ` +
      `answers=${rs.reduce((a, r) => a + (r.tableAnswers | 0), 0)} stalls=${JSON.stringify(stalls)} ` +
      `medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d instErr=${rs.reduce((a, r) => a + r.instrumentErrors, 0)}`);
  }
  // HORIZON PROBE: sitting non-winning runs re-run to 250d (same seeds —
  // deterministic 1–180d prefix).
  if (PROBE && !SMOKE) {
    const probes = [];
    for (const policyId of ROAD_IDS) {
      for (const seed of SEEDS) {
        const base = recs.find(r => r.policyId === policyId && r.seed === seed);
        if (base && base.sitN > 0 && !base.wins) {
          probes.push(await runWinstall(seed, policyId, { days: 250, probeTag: 'probe250' }));
        }
      }
    }
    if (probes.length) {
      console.log('\n== horizon probe (250d, sitting non-winning subset) ==');
      console.log(`probed=${probes.length} wins250=${probes.filter(p => p.wins).length} ` +
        `stalls=${JSON.stringify(probes.reduce((a, p) => { a[p.stall] = (a[p.stall] || 0) + 1; return a; }, {}))}`);
    } else {
      console.log('\n== horizon probe: no sitting non-winning runs to probe ==');
    }
  }
}

module.exports = { runWinstall, assertSubstrate, ROAD_IDS, SEEDS };

if (require.main === module) {
  main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
}
