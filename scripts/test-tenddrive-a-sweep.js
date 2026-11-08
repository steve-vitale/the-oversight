#!/usr/bin/env node
// scripts/test-tenddrive-a-sweep.js — sim-tenddrive-a pilot + proof gates
// (scale-onramp axis, 2026-11-08, run fleshout-20261108T1622Z).
//
// THE BUILD (evidence/2026-11-08/sim-tenddrive-a-prereg.md): in
// win-plan.js winPlanBondsTick ONLY, delete the nationalLive /
// pendingNational early return (the TENDING leg) and raise the tend cap
// from 50 to 55 while nationalLive (cap stays 50 otherwise).
// winPlanMusterTick is untouched.
//
// PAIRING (exact, identical seeds) — run once per LEG:
//   EVID=.../perseed-tenddrive-a-before  on the UNFIXED tree (baseline leg)
//   EVID=.../perseed-tenddrive-a-after   on the FIXED tree (candidate leg)
// Each leg runs the same two arms:
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, TENDTRUST unset).
//   armed    = tableseat-nowait wrapped with scripts/policies/tendtrust-b.js
//     (TENDTRUST=1). The recorder is PURE-READ (proven neutral in
//     tendtrust, G2): it writes nothing to game state and draws no RNG —
//     so within a leg, baseline and armed trajectories must be IDENTICAL
//     (G2), and the delta is measurement only. The GO judgment compares
//     the RECORDED arms across legs (scripts/test-tenddrive-a-judge.js),
//     identical instruments, only the game code differs.
//
// Modes:
//   default: pilot sweep. SEEDS="76401,..." (default 76401-76408), DAYS=180
//     (default), EVID=evidence/2026-11-08/perseed-tenddrive-a-before
//     (default). Per-config INCREMENTAL corpus writes. Prints a tend
//     census + national-persistence analysis + verdict. Exit 0 on a
//     completed sweep regardless of GO/NO-GO (the verdict is data, not a
//     script failure); exit 1 on proof-gate failure.
//   --detgate: G1 delegation proof on one seed (SEED env, default 76401):
//     tableseat-nowait vs tendtrust-wrapped tableseat-nowait with
//     TENDTRUST unset must match on days/gameDays/ts counters with no
//     _tendtrust surface. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-11-08/sim-tenddrive-a-sense.txt.
//
// Proof gates (failures exit 1 in sweep mode):
//   G1 det-gate: see --detgate (run separately; the sweep prints a reminder).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters, starvation AND death-cause breakdown identical.
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     endSnap on every row, tend log + trust trajectories + shortfall
//     table on every armed row, engine-gated validation matching on every
//     armed row.
//   Cross-check: the armed corpus's tend counts per seed must reconcile
//     with the substrate's own ctx.tended attempt counters — recorder tend
//     events + refused attempts == attempts — with any deficit explained
//     by a mourning window in the trajectory.
//
// Verdict (computed, not asserted): LEG-OK iff 8/8 armed rows carry a
// full tend/trust corpus AND G1 passes AND G2 passes AND G3 passes AND
// the cross-check passes. The pilot GO/NO-GO is judged across legs by
// scripts/test-tenddrive-a-judge.js against the prereg bars.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { withTendTrust } = require('./policies/tendtrust-b');
const { snapBindingEnd } = require('./policies/binddiag-b');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

// Incremental corpus write via the chunked writer subprocess (the
// tableseat-nowait precedent — a sweep killed mid-run must not lose
// completed configs). Retries; on total failure the row JSON is printed
// to stdout first so the data is never silently lost.
// FLAP-HARDENED (sim-tenddrive-a, 2026-11-08): the EPERM write-denial
// flap killed the first baseline-leg run on s76402-baseline.json after
// 8 short retries — a flap can last tens of minutes, so the backoff
// now grows to 60s over 12 attempts, and the sweep RESUMES (see
// loadExistingRow in sweepMode): re-running skips row files already on
// disk and valid, so a flap-killed sweep loses at most the config it
// was writing, never the completed configs.
function writeRowViaWriter(p, body) {
  console.log('ROWJSON-BEGIN ' + path.basename(p) + '\n' + body + '\nROWJSON-END');
  let lastErr = null;
  for (let a = 1; a <= 12; a++) {
    try {
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'sim-postunlock2-b-writer.js'), p],
        { input: body, cwd: REPO, encoding: 'utf8', timeout: 600000 });
      const m = /WROTE ([0-9a-f]{12})/.exec(out || '');
      if (!m) throw new Error('writer gave no WROTE line: ' + String(out).slice(0, 200));
      const sha = crypto.createHash('sha256').update(body).digest('hex').slice(0, 12);
      if (m[1] !== sha) throw new Error('writer sha mismatch');
      return sha;
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 12) sleepMs(Math.min(60000, 5000 * a));
    }
  }
  throw lastErr;
}

// loadExistingRow: flap-resume support. A row file already on disk from
// an earlier (killed) run of this leg is reused WITHOUT re-running the
// config — but only if it validates (right seed/policy, days > 0, an
// endSnap with no error, and for armed rows a diag with a trajectory).
// Anything else re-runs. The writer verifies SHA on write, so a file
// that exists and parses with the right shape is a completed config.
function loadExistingRow(evidDir, seed, pid) {
  const fn = path.join(evidDir, `s${seed}-${pid}.json`);
  try {
    const row = JSON.parse(fs.readFileSync(fn, 'utf8'));
    if (!row || row.seed !== seed || row.policy !== pid) return null;
    if (!(row.days > 0) || !row.endSnap || row.endSnap.error) return null;
    if (pid === 'armed' && (!row.diag || !row.diag.traj || !row.diag.traj.length)) return null;
    return row;
  } catch (e) { return null; }
}

async function runOne(pid, seed, days, evidDir) {
  // Env pairing: LEANLINKRESCUE=1 + TABLESEATNOWAIT=1 for BOTH arms (the
  // tableseat substrate is shared exactly); TENDTRUST=1 only for armed.
  // Both policy gates read env per daily call, so setting env between
  // configs in one process is safe.
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  if (pid === 'armed') process.env.TENDTRUST = '1';
  else delete process.env.TENDTRUST;
  const base = pid === 'armed'
    ? withTendTrust(tableseatNowait, 'tendtrust-b', 'tableseat-nowait + tend/trust recorder')
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'tenddrive-a-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, everGlobal: false };
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
        if ((RANK_ORDER[s.rank] || 0) >= 3) hist.everGlobal = true;
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  // End snapshot: pure-read, computed AFTER runDays, so it cannot affect
  // the trajectory on either arm. Includes the engine-gated validation
  // (binddiag-b's snapBindingEnd — same standing formula, same validation).
  let endSnap = null;
  try { endSnap = snapBindingEnd(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }
  // Recorder block (armed only): tend log, trust trajectories, shortfall
  // table, national-loss dips, gate-blocked opportunities.
  let diag = null;
  if (capturedCtx && capturedCtx._tendtrust) {
    const D = capturedCtx._tendtrust;
    diag = {
      days: D.days, errs: D.errs,
      first: D.first,
      maxSeasonedSubs: D.maxSeasonedSubs,
      tends: D.tends, tendAttempts: D.tendAttempts,
      overnight: D.overnight, intradayOther: D.intradayOther,
      traj: D.traj,
      gateBlocked: D.gateBlocked, gateBlockedDays: D.gateBlockedDays,
      nationalLost: D.nationalLost, beats: D.beats,
      winDay: D.winDay, winSnap: D.winSnap || null,
    };
  }
  const ts = {};
  const ctxExtra = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls') ctxExtra[k] = capturedCtx[k];
    }
    if (Array.isArray(capturedCtx.tendTrusts)) ctxExtra.tendTrusts = capturedCtx.tendTrusts;
  }
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const row = {
    policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    globalEver: hist.everGlobal ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    enteredFull: (endSnap && endSnap.seat === 'full') ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, ctxExtra,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    endSnap,
    diag,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

// National-persistence analysis for one armed row (the mechanism leg):
// which tends landed WHILE nationalLive (traj nat flag on the tend's day),
// the highest trust any link reached while national, and whether any
// link topped to >=55 while national. The tend log's day is the pre
// snapshot day — the tend fired the night before, under the nationalLive
// state that morning's pre snapshot reads.
function persistenceOf(row) {
  const out = {
    engineTendsWhileNational: 0, policyTendsWhileNational: 0,
    engineTendsWhileNationalDays: [], maxTrustWhileNational: null,
    topped55: false, nationalLostDays: [],
  };
  if (!row.diag) return out;
  const natByDay = {};
  let maxTrust = null;
  for (const tp of (row.diag.traj || [])) {
    natByDay[tp.day] = !!tp.nat;
    if (tp.nat) {
      for (const l of (tp.links || [])) {
        if (maxTrust == null || l.trust > maxTrust) maxTrust = l.trust;
      }
    }
  }
  for (const t of (row.diag.tends || [])) {
    if (!natByDay[t.day]) continue;
    if (t.source === 'engine-winplan') { out.engineTendsWhileNational++; out.engineTendsWhileNationalDays.push(t.day); }
    else if (t.source === 'policy') out.policyTendsWhileNational++;
  }
  out.maxTrustWhileNational = maxTrust;
  out.topped55 = maxTrust != null && maxTrust >= 55;
  out.nationalLostDays = (row.diag.nationalLost || []).map(x => x.day);
  return out;
}

function aggregate(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  const starvBySeed = {};
  for (const r of rs) starvBySeed[r.seed] = r.starvationDeaths;
  let tend = null;
  if (pid === 'armed') {
    let tendTotal = 0, policyTends = 0, engineTends = 0, attemptTotal = 0, refusedTotal = 0, gateBlockedTotal = 0;
    let liftSum = 0, liftN = 0, policyLiftSum = 0, policyLiftN = 0, engineLiftSum = 0, engineLiftN = 0;
    let engNat = 0, polNat = 0;
    const engNatSeeds = [], topped55Seeds = [], natLostSeeds = [];
    const maxTrustWhileNational = {}, engNatDays = {}, natLostDays = {};
    const perSeed = {};
    for (const r of rs) {
      if (!r.diag) continue;
      const t = r.diag.tends || [];
      const a = r.diag.tendAttempts || [];
      const refused = a.filter(x => !x.flipped).length;
      const pt = t.filter(x => x.source === 'policy');
      const et = t.filter(x => x.source === 'engine-winplan');
      const lifts = t.map(x => x.lift);
      tendTotal += t.length;
      policyTends += pt.length;
      engineTends += et.length;
      attemptTotal += a.length;
      refusedTotal += refused;
      gateBlockedTotal += (r.diag.gateBlocked || []).length;
      for (const l of lifts) { liftSum += l; liftN++; }
      for (const l of pt.map(x => x.lift)) { policyLiftSum += l; policyLiftN++; }
      for (const l of et.map(x => x.lift)) { engineLiftSum += l; engineLiftN++; }
      const p = persistenceOf(r);
      engNat += p.engineTendsWhileNational;
      polNat += p.policyTendsWhileNational;
      if (p.engineTendsWhileNational > 0) engNatSeeds.push(r.seed);
      if (p.topped55) topped55Seeds.push(r.seed);
      if (p.nationalLostDays.length) natLostSeeds.push(r.seed);
      maxTrustWhileNational[r.seed] = p.maxTrustWhileNational;
      engNatDays[r.seed] = p.engineTendsWhileNationalDays;
      natLostDays[r.seed] = p.nationalLostDays;
      perSeed[r.seed] = {
        tends: t.length, policyTends: pt.length, engineTends: et.length,
        attempts: a.length, refused,
        gateBlocked: (r.diag.gateBlocked || []).length,
        lifts, nationalLost: (r.diag.nationalLost || []).length,
        ctxTended: (r.ctxExtra && r.ctxExtra.tended) || 0,
        engineTendsWhileNational: p.engineTendsWhileNational,
        policyTendsWhileNational: p.policyTendsWhileNational,
        maxTrustWhileNational: p.maxTrustWhileNational,
        topped55: p.topped55,
        nationalLostDays: p.nationalLostDays,
      };
    }
    tend = {
      tendTotal, policyTends, engineTends, attemptTotal, refusedTotal, gateBlockedTotal,
      meanLift: liftN ? +(liftSum / liftN).toFixed(2) : null, liftN,
      meanPolicyLift: policyLiftN ? +(policyLiftSum / policyLiftN).toFixed(2) : null, policyLiftN,
      meanEngineLift: engineLiftN ? +(engineLiftSum / engineLiftN).toFixed(2) : null, engineLiftN,
      engineTendsWhileNational: engNat, engineTendsWhileNationalSeeds: engNatSeeds,
      policyTendsWhileNational: polNat,
      topped55Seeds, nationalLostSeeds: natLostSeeds, maxTrustWhileNational, engineTendsWhileNationalDays: engNatDays,
      nationalLostDays: natLostDays,
      perSeed,
    };
  }
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    medianGameDays: medianOf(rs.map(r => r.gameDays)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    globalEver: rs.reduce((t, r) => t + r.globalEver, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    enteredFull: rs.reduce((t, r) => t + r.enteredFull, 0),
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
    starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    starvationBySeed: starvBySeed,
    seatTaken: rs.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatAttempts: rs.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
    seatFailed: rs.reduce((t, r) => t + (r.ts.tsSeatFailed || 0), 0),
    previewSeen: rs.reduce((t, r) => t + (r.ts.tsPreviewSeen || 0), 0),
    previewNotReady: rs.reduce((t, r) => t + (r.ts.tsPreviewNotReady || 0), 0),
    tableAnswers: rs.reduce((t, r) => t + (r.ts.tsTableAnswers || 0), 0),
    tend,
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '76401,76402,76403,76404,76405,76406,76407,76408')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-08', 'perseed-tenddrive-a-before');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const resumed = loadExistingRow(evidDir, seed, pid);
      if (resumed) {
        rows.push(resumed);
        console.log(`  [${pid} seed ${seed}] RESUME-SKIP days=${resumed.days} end=${resumed.endReason} natFinal=${resumed.nationalFinal} (row on disk from an earlier run)`);
        continue;
      }
      const row = await runOne(pid, seed, days, evidDir);
      rows.push(row);
      const F = row.diag ? row.diag.first : {};
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} enteredFull=${row.enteredFull} won=${row.won} starv=${row.starvationDeaths} tends=${row.diag ? row.diag.tends.length : '-'} (pol=${row.diag ? row.diag.tends.filter(t => t.source === 'policy').length : '-'} eng=${row.diag ? row.diag.tends.filter(t => t.source === 'engine-winplan').length : '-'}) attempts=${row.diag ? row.diag.tendAttempts.length : '-'} refused=${row.diag ? row.diag.tendAttempts.filter(a => !a.flipped).length : '-'} gateBlocked=${row.diag ? row.diag.gateBlocked.length : '-'} natLost=${row.diag ? row.diag.nationalLost.length : '-'} first=${JSON.stringify(F)} gatedMatch=${row.endSnap ? row.endSnap.gatedMatchesEngine : '-'} ts=${JSON.stringify(row.ts)}`);
    }
  }
  const byPolicy = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  // G2: recorder neutrality — ALL seeds identical days/gameDays/ts/starvation
  // AND death-cause breakdown.
  const g2 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths
      && JSON.stringify(c.deaths) === JSON.stringify(a.deaths);
    g2.push({ seed, ok, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  // G3: corpus integrity + engine-gated validation on every armed row.
  const armedRows = rows.filter(r => r.policy === 'armed');
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.endSnap && !r.endSnap.error)
    && armedRows.length === seeds.length
    && armedRows.every(r => r.diag && r.diag.days > 0 && r.diag.traj && r.diag.traj.length > 0 && r.diag.first
      && Array.isArray(r.diag.tends) && Array.isArray(r.diag.tendAttempts) && Array.isArray(r.diag.gateBlocked)
      && r.endSnap.gatedMatchesEngine === true);
  // Cross-check: recorder POLICY tend events + refused attempts ==
  // substrate attempts. Engine tends are a separate source (the
  // villagers' own win-plan drive) and do not touch ctx.tended.
  const cross = [];
  for (const seed of seeds) {
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    if (!a || !a.diag) { cross.push({ seed, ok: false, reason: 'no armed row' }); continue; }
    const policyEvents = (a.diag.tends || []).filter(t => t.source === 'policy').length;
    const engineEvents = (a.diag.tends || []).filter(t => t.source === 'engine-winplan').length;
    const attempts = a.diag.tendAttempts.length;
    const refused = a.diag.tendAttempts.filter(x => !x.flipped).length;
    const ctxTended = (a.ctxExtra && a.ctxExtra.tended) || 0;
    const mourningExplained = a.diag.tendAttempts.filter(x => !x.flipped)
      .every(x => x.mourningUntil != null && x.mourningUntil > x.day);
    const ok = (policyEvents + refused) === attempts && attempts === ctxTended && (refused === 0 || mourningExplained);
    cross.push({ seed, ok, policyEvents, engineEvents, attempts, refused, ctxTended, mourningExplained });
  }
  const crossPass = cross.every(x => x.ok);
  // LEG-OK inputs (per-leg gates only; the pilot GO/NO-GO is judged
  // across legs by scripts/test-tenddrive-a-judge.js).
  const armedTraj = armedRows.every(r => r.diag && r.diag.traj && r.diag.traj.length > 0);
  const armedTendLog = armedRows.every(r => r.diag && Array.isArray(r.diag.tends) && Array.isArray(r.diag.tendAttempts));
  const legOk = armedTraj && armedTendLog && g2Pass && g3Pass && crossPass;
  const report = {
    label: 'sim-tenddrive-a pilot', seeds, days, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass, crossCheck: cross, crossPass },
    verdictInputs: { armedTraj, armedTendLog, g2Pass, g3Pass, crossPass },
    verdict: legOk ? 'LEG-OK' : 'LEG-NO-GO',
    verdictRule: 'LEG-OK iff 8/8 armed rows carry a full tend/trust corpus (tend log + trust trajectories + shortfall table) AND G1 passes (separate --detgate run) AND G2 recorder neutrality passes AND G3 corpus integrity passes (incl. engine-gated validation) AND the tend cross-check passes. Pilot GO/NO-GO is judged across legs by test-tenddrive-a-judge.js.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-tenddrive-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} globEver=${b.globalEver} table=${b.table} entered=${b.entered} enteredFull=${b.enteredFull} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} tableAnswers=${b.tableAnswers}`);
    if (b.tend) console.log(`    tend census: tends=${b.tend.tendTotal} (policy=${b.tend.policyTends} engine=${b.tend.engineTends}) attempts=${b.tend.attemptTotal} refused=${b.tend.refusedTotal} gateBlocked=${b.tend.gateBlockedTotal} meanLift=${b.tend.meanLift} (n=${b.tend.liftN}; policy ${b.tend.meanPolicyLift} n=${b.tend.policyLiftN}, engine ${b.tend.meanEngineLift} n=${b.tend.engineLiftN}) perSeed=${JSON.stringify(b.tend.perSeed)}`);
    if (b.tend) console.log(`    persistence: engineTendsWhileNational=${b.tend.engineTendsWhileNational} seeds=${JSON.stringify(b.tend.engineTendsWhileNationalSeeds)} policyTendsWhileNational=${b.tend.policyTendsWhileNational} topped55Seeds=${JSON.stringify(b.tend.topped55Seeds)} maxTrustWhileNational=${JSON.stringify(b.tend.maxTrustWhileNational)} nationalLostSeeds=${JSON.stringify(b.tend.nationalLostSeeds)}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  Cross-check (recorder tends + refused == substrate attempts): ${crossPass ? 'PASS' : 'FAIL'} (${cross.filter(x => x.ok).length}/${cross.length} seeds)`);
  console.log(`  VERDICT (per-leg, pending G1 det-gate): ${report.verdict} (armedTraj ${armedTraj ? 'PASS' : 'FAIL'}; armedTendLog ${armedTendLog ? 'PASS' : 'FAIL'}; G2 ${g2Pass ? 'PASS' : 'FAIL'}; G3 ${g3Pass ? 'PASS' : 'FAIL'}; cross ${crossPass ? 'PASS' : 'FAIL'}) -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1 (TENDTRUST unset delegation).');
  if (!g2Pass || !g3Pass || !crossPass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '76401', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  // Wrapped policy under TENDTRUST-unset env: run the wrapped policy
  // directly (runOne('armed') would set TENDTRUST=1, which is not the gate).
  delete process.env.TENDTRUST;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = withTendTrust(tableseatNowait, 'tendtrust-b', 'tableseat-nowait + tend/trust recorder');
  const { Game } = await loadGame({ seed, mode: 'tenddrive-a-detgate', fullTelemetry: false });
  await setupGame(Game);
  let capturedCtx = null;
  const policy = Object.assign({}, wrapped, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try { return wrapped.daily(G, ctx); } catch (e) {}
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const hasDiagSurface = !!(capturedCtx && capturedCtx._tendtrust);
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(TENDTRUST unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '76407', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-11-08', 'sim-tenddrive-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.TENDTRUST = '1';
  const armed = withTendTrust(tableseatNowait, 'tendtrust-b', 'tableseat-nowait + tend/trust recorder');
  const { Game } = await loadGame({ seed, mode: 'tenddrive-a-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let rank = 'village';
  try { rank = Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) {}
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+tendtrust-b days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} finalRank=${rank} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} finalRank=${rank} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('TENDDRIVE-A SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
