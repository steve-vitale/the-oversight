#!/usr/bin/env node
// scripts/test-linkdecay-a-sweep.js — sim-linkdecay-a pilot + proof gates
// (scale-onramp axis, 2026-11-08, run fleshout-20261108T2315Z, Loop A).
//
// QUESTION (tenddrive-a's downstream failure): seed 76408 qualifies d58
// with 4 subs and trust 49-65, but links decay d60->99 (village_0 53->18);
// seasoned subs 4->1; NO national beat ever stages. A PRE-national
// qualification-persistence failure. This diag measures the decay: a decay
// census (drag by source between qualification and beat-staging/death),
// per-seed classification of the dominant decay source, actor-presence
// accounting (the engine drive's firing throttle, now recorded by the
// extended tendtrust-b recorder), and a sized next-lever spec computed
// from the corpus (never by simulation) — or a sizing NO-GO with numbers
// if the decay is firing-throttle-dominated.
//
// ROOTS RE-VERIFIED FIRST (prereg step 0): the baseline leg's per-seed
// table is read before any judged sweep is bound to 76408. If drift moved
// it, the diag re-scopes to whichever seeds now show the shape
// (qualify -> decay -> no beat) and says so in the evidence file.
//
// PAIRING (exact, identical seeds):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, TENDTRUST unset).
//   armed    = tableseat-nowait wrapped with scripts/policies/tendtrust-b.js
//     (TENDTRUST=1, actor-presence extension). The recorder is PURE-READ:
//     it writes nothing to game state and draws no RNG — so baseline and
//     armed trajectories must be IDENTICAL (G2), and the delta is
//     measurement only.
//
// Modes:
//   default: pilot sweep. SEEDS="76401,..." (default 76401-76408), DAYS=180
//     (default), EVID=evidence/2026-11-08/perseed-linkdecay-a (default).
//     Per-config INCREMENTAL corpus writes. Prints a tend census, a decay
//     census, per-seed classification + verdict. Exit 0 on a completed
//     sweep regardless of DIAG-GO/NO-GO (the verdict is data, not a script
//     failure); exit 1 on proof-gate failure.
//   --detgate: G1 delegation proof on one seed (SEED env, default 76401):
//     tableseat-nowait vs tendtrust-wrapped tableseat-nowait with
//     TENDTRUST unset must match on days/gameDays/ts counters with no
//     _tendtrust surface. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-11-08/sim-linkdecay-a-sense.txt.
//
// Proof gates (failures exit 1 in sweep mode):
//   G1 det-gate: see --detgate (run separately; the sweep prints a reminder).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters, starvation AND death-cause breakdown identical.
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     endSnap on every row, tend log + trust trajectories + shortfall
//     table on every armed row, engine-gated validation matching on every
//     armed row, and the actor-presence field present (non-null) on every
//     armed trajectory point.
//   Cross-check: the armed corpus's tend counts per seed must reconcile
//     with the substrate's own ctx.tended attempt counters — recorder tend
//     events + refused attempts == attempts — with any deficit explained
//     by a mourning window in the trajectory.
//
// Verdict (computed, not asserted): DIAG-GO iff 8/8 armed rows carry a
// full tend/trust corpus with actor presence AND the decay census is
// computable AND per-seed classification is complete AND G1 passes AND
// G2 passes AND G3 passes AND the cross-check passes.
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
function writeRowViaWriter(p, body) {
  console.log('ROWJSON-BEGIN ' + path.basename(p) + '\n' + body + '\nROWJSON-END');
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
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
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
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
  const { Game } = await loadGame({ seed, mode: 'linkdecay-a-' + pid, fullTelemetry: false });
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

function aggregate(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  const starvBySeed = {};
  for (const r of rs) starvBySeed[r.seed] = r.starvationDeaths;
  let tend = null;
  if (pid === 'armed') {
    let tendTotal = 0, policyTends = 0, engineTends = 0, attemptTotal = 0, refusedTotal = 0, gateBlockedTotal = 0;
    let liftSum = 0, liftN = 0, policyLiftSum = 0, policyLiftN = 0, engineLiftSum = 0, engineLiftN = 0;
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
      perSeed[r.seed] = {
        tends: t.length, policyTends: pt.length, engineTends: et.length,
        attempts: a.length, refused,
        gateBlocked: (r.diag.gateBlocked || []).length,
        lifts, nationalLost: (r.diag.nationalLost || []).length,
        ctxTended: (r.ctxExtra && r.ctxExtra.tended) || 0,
      };
    }
    tend = {
      tendTotal, policyTends, engineTends, attemptTotal, refusedTotal, gateBlockedTotal,
      meanLift: liftN ? +(liftSum / liftN).toFixed(2) : null, liftN,
      meanPolicyLift: policyLiftN ? +(policyLiftSum / policyLiftN).toFixed(2) : null, policyLiftN,
      meanEngineLift: engineLiftN ? +(engineLiftSum / engineLiftN).toFixed(2) : null, engineLiftN,
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

// classifyKind(kinds): map a history-kind list to one ledger bucket for
// the decay census. Succession wins over a same-night tend (the tend is
// counted separately from the tend log, so the overnight delta is
// adjusted by the tend lift before bucketing).
function classifyKind(kinds) {
  const ks = kinds || [];
  if (ks.includes('succession')) return 'succession';
  if (ks.includes('titan')) return 'titan';
  if (ks.includes('renegotiation') || ks.includes('demand')) return 'renegotiation';
  if (ks.includes('tribute')) return 'tribute';
  if (ks.includes('court')) return 'court';
  if (ks.includes('accord')) return 'accord';
  if (ks.includes('aid')) return 'aid';
  if (ks.includes('tended')) return 'tended';
  if (ks.includes('drift')) return 'drift';
  if (ks.length === 0) return 'unattributed';
  return 'other:' + ks.join('+');
}

// decayCensus(armedRows, meanLift): the diag's deliverable (c), (d), (e).
// For each armed row: the qualification->beat window (leadQ day exclusive
// to beat-staging day inclusive, else to death/end), per-link drag by
// source in that window, per-seed dominant-source classification, and
// actor-presence / firing accounting in the window. Sizing is computed
// from the corpus, never by simulation: tendsNeededToOffset =
// ceil(total drag / measured mean lift), capped by the weeks actually
// available in the window. sizingCall is 'spec' when the dominant drag
// is a named event source and the tends fit the weeks available, and
// 'nogo-firing-throttle' when the drive fired on fewer than half its
// opportunity days in the window (tends were feasible in cadence and
// gates but never fired — no number sizes that).
function decayCensus(armedRows, meanLift) {
  const lift = (typeof meanLift === 'number' && meanLift > 0) ? meanLift : 8;
  const perSeed = {};
  for (const r of armedRows) {
    const D = r.diag || {};
    const traj = D.traj || [];
    const leadQ = (D.first && D.first.leadQualifyDay != null) ? D.first.leadQualifyDay : null;
    const beat = (D.beats || [])[0] || null;
    const beatDay = beat ? beat.stagedDay : null;
    const endDay = beatDay != null ? beatDay : r.days;
    const shape = leadQ == null ? 'never-qualified'
      : beatDay != null ? 'beat-staged'
      : 'decay-no-beat';
    const entry = {
      seed: r.seed, shape, leadQ, beatDay, nationalDay: (D.first && D.first.nationalDay) || null,
      endDay, days: r.days, windowDays: leadQ == null ? 0 : Math.max(0, endDay - leadQ),
      perLink: {}, bySource: {}, totalDelta: 0, totalDrag: 0,
      tendsInWindow: 0, policyTendsInWindow: 0, engineTendsInWindow: 0,
      refusedInWindow: 0, tendsNeededToOffset: null, weeksAvailable: null,
      actorDays: 0, actorNullDays: 0, actorPrePostAgree: 0, actorPrePostTotal: 0,
      opportunities: 0, engineTendsOnOpportunityDays: 0,
      dominantDrag: null, dominantDragPoints: 0, sizingCall: null,
    };
    if (leadQ == null) { entry.sizingCall = 'n/a (never-qualified)'; perSeed[r.seed] = entry; continue; }
    const inWindow = (d) => d > leadQ && d <= endDay;
    // Tend lift per link-day (for adjusting mixed overnight deltas).
    const tendLiftByLinkDay = {};
    for (const t of (D.tends || [])) {
      if (!inWindow(t.day)) continue;
      entry.tendsInWindow++;
      if (t.source === 'policy') entry.policyTendsInWindow++;
      if (t.source === 'engine-winplan') entry.engineTendsInWindow++;
      const key = t.linkId + '|' + t.day;
      tendLiftByLinkDay[key] = (tendLiftByLinkDay[key] || 0) + ((t.noteGain != null ? t.noteGain : t.lift) || 0);
    }
    for (const a of (D.tendAttempts || [])) if (!a.flipped && inWindow(a.day)) entry.refusedInWindow++;
    // Per-link trust endpoints from the trajectory.
    const linkIds = new Set();
    for (const p of traj) for (const l of (p.links || [])) linkIds.add(l.id);
    for (const lid of linkIds) {
      let startPt = null, endPt = null;
      for (const p of traj) {
        const l = (p.links || []).find(x => x.id === lid);
        if (!l) continue;
        if (p.day <= leadQ) startPt = l;
        if (p.day <= endDay) endPt = l;
      }
      if (!startPt || !endPt) continue;
      const total = (endPt.trust | 0) - (startPt.trust | 0);
      const buckets = {};
      const add = (b, n) => { buckets[b] = (buckets[b] || 0) + n; entry.bySource[b] = (entry.bySource[b] || 0) + n; };
      // Tends on this link in the window (note gain = clean lift).
      for (const t of (D.tends || [])) {
        if (t.linkId !== lid || !inWindow(t.day)) continue;
        add(t.source === 'policy' ? 'tended-policy' : 'tended-engine', (t.noteGain != null ? t.noteGain : t.lift) || 0);
      }
      // Overnight moves (tribute/shake/titan/...), tend-adjusted.
      for (const o of (D.overnight || [])) {
        if (o.linkId !== lid || !inWindow(o.day) || o.delta == null) continue;
        let d = o.delta | 0;
        const kinds = o.kinds || [];
        if (kinds.includes('tended')) d -= (tendLiftByLinkDay[lid + '|' + o.day] || 0);
        if (d !== 0) add(classifyKind(kinds), d);
      }
      // Intraday non-tend moves (feast/accord/renegotiation/...).
      for (const o of (D.intradayOther || [])) {
        if (o.linkId !== lid || !inWindow(o.day)) continue;
        add(classifyKind(o.kinds || []), o.delta | 0);
      }
      const attributed = Object.values(buckets).reduce((a, b) => a + b, 0);
      buckets.unattributed = (buckets.unattributed || 0) + (total - attributed);
      entry.bySource.unattributed = (entry.bySource.unattributed || 0) + (total - attributed);
      let otherName = lid;
      for (const p of traj) {
        const l = (p.links || []).find(x => x.id === lid);
        if (l && l.other) { otherName = l.other; break; }
      }
      entry.perLink[lid] = { other: otherName,
        trustAtQualify: startPt.trust, trustAtEnd: endPt.trust, total, buckets };
      entry.totalDelta += total;
    }
    // Total drag = sum of negative buckets across links.
    for (const [b, n] of Object.entries(entry.bySource)) if (n < 0) entry.totalDrag += n;
    entry.weeksAvailable = Math.floor(entry.windowDays / 7);
    entry.tendsNeededToOffset = lift > 0 ? Math.ceil(Math.abs(entry.totalDrag) / lift) : null;
    // Dominant drag source.
    let dom = null, domN = 0;
    for (const [b, n] of Object.entries(entry.bySource)) if (n < domN) { dom = b; domN = n; }
    entry.dominantDrag = dom; entry.dominantDragPoints = domN;
    // Actor presence + firing opportunities in the window.
    for (const p of traj) {
      if (!inWindow(p.day)) continue;
      if (p.actors == null) { entry.actorNullDays++; continue; }
      if (p.actors > 0) entry.actorDays++;
      if (p.actorsPre != null) {
        entry.actorPrePostTotal++;
        if (p.actorsPre === p.actors) entry.actorPrePostAgree++;
      }
      // Firing opportunity: an actor is home, pantryDays >= 3, at least
      // one sub link is dipping (trust < 50), no national live.
      const dipping = (p.links || []).some(l => (l.trust | 0) < 50);
      if (p.actors > 0 && (p.pantryDays == null || p.pantryDays >= 3) && dipping && !p.nat) {
        entry.opportunities++;
        const tendedToday = (D.tends || []).some(t => t.source === 'engine-winplan' && t.day === p.day);
        if (tendedToday) entry.engineTendsOnOpportunityDays++;
      }
    }
    // Sizing call (computed, per prereg rule).
    const eventDrag = ['succession', 'titan', 'renegotiation', 'tribute', 'drift'].includes(entry.dominantDrag);
    const firedShare = entry.opportunities > 0 ? entry.engineTendsOnOpportunityDays / entry.opportunities : null;
    if (shape !== 'decay-no-beat') entry.sizingCall = 'n/a (' + shape + ')';
    else if (eventDrag && entry.tendsNeededToOffset != null && entry.tendsNeededToOffset <= Math.max(1, entry.weeksAvailable * 3)) entry.sizingCall = 'spec';
    else if (firedShare != null && firedShare < 0.5) entry.sizingCall = 'nogo-firing-throttle';
    else if (eventDrag) entry.sizingCall = 'spec';
    else entry.sizingCall = 'nogo-firing-throttle';
    perSeed[r.seed] = entry;
  }
  return { perSeed };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '76401,76402,76403,76404,76405,76406,76407,76408')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-08', 'perseed-linkdecay-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
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
  // G3: corpus integrity + engine-gated validation on every armed row
  // + the actor-presence field present (non-null) on every armed traj point.
  const armedRows = rows.filter(r => r.policy === 'armed');
  const actorNullDays = armedRows.reduce((t, r) => t + ((r.diag && r.diag.traj) || []).filter(p => p.actors == null).length, 0);
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.endSnap && !r.endSnap.error)
    && armedRows.length === seeds.length
    && armedRows.every(r => r.diag && r.diag.days > 0 && r.diag.traj && r.diag.traj.length > 0 && r.diag.first
      && Array.isArray(r.diag.tends) && Array.isArray(r.diag.tendAttempts) && Array.isArray(r.diag.gateBlocked)
      && r.endSnap.gatedMatchesEngine === true)
    && actorNullDays === 0;
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
  // Decay census (deliverables c/d/e) on the armed corpus.
  const meanLift = (byPolicy.armed.tend && byPolicy.armed.tend.meanLift) || 8;
  const census = decayCensus(armedRows, meanLift);
  const censusComplete = armedRows.every(r => census.perSeed[r.seed] && census.perSeed[r.seed].shape);
  // DIAG-GO inputs.
  const armedTraj = armedRows.every(r => r.diag && r.diag.traj && r.diag.traj.length > 0);
  const armedTendLog = armedRows.every(r => r.diag && Array.isArray(r.diag.tends) && Array.isArray(r.diag.tendAttempts));
  const armedActorField = actorNullDays === 0;
  const diagGo = armedTraj && armedTendLog && armedActorField && censusComplete && g2Pass && g3Pass && crossPass;
  const report = {
    label: 'sim-linkdecay-a pilot', seeds, days, rows, byPolicy, census,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass, actorNullDays, crossCheck: cross, crossPass },
    verdictInputs: { armedTraj, armedTendLog, armedActorField, censusComplete, g2Pass, g3Pass, crossPass },
    verdict: diagGo ? 'DIAG-GO' : 'DIAG-NO-GO',
    verdictRule: 'DIAG-GO iff 8/8 armed rows carry a full tend/trust corpus with actor presence (non-null on every traj point) AND the decay census is computable AND per-seed classification is complete AND G1 passes (separate --detgate run) AND G2 recorder neutrality passes AND G3 corpus integrity passes (incl. engine-gated validation) AND the tend cross-check passes',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-linkdecay-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} globEver=${b.globalEver} table=${b.table} entered=${b.entered} enteredFull=${b.enteredFull} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} tableAnswers=${b.tableAnswers}`);
    if (b.tend) console.log(`    tend census: tends=${b.tend.tendTotal} (policy=${b.tend.policyTends} engine=${b.tend.engineTends}) attempts=${b.tend.attemptTotal} refused=${b.tend.refusedTotal} gateBlocked=${b.tend.gateBlockedTotal} meanLift=${b.tend.meanLift} (n=${b.tend.liftN}; policy ${b.tend.meanPolicyLift} n=${b.tend.policyLiftN}, engine ${b.tend.meanEngineLift} n=${b.tend.engineLiftN}) perSeed=${JSON.stringify(b.tend.perSeed)}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'} (actorNullDays=${actorNullDays})`);
  console.log(`  Cross-check (recorder tends + refused == substrate attempts): ${crossPass ? 'PASS' : 'FAIL'} (${cross.filter(x => x.ok).length}/${cross.length} seeds)`);
  console.log('  --- decay census (qualification -> beat/death window) ---');
  for (const seed of seeds) {
    const c = census.perSeed[seed];
    if (!c) { console.log(`  seed ${seed}: NO CENSUS`); continue; }
    console.log(`  seed ${seed}: shape=${c.shape} leadQ=${c.leadQ} beatDay=${c.beatDay} nationalDay=${c.nationalDay} windowDays=${c.windowDays} totalDelta=${c.totalDelta} totalDrag=${c.totalDrag} bySource=${JSON.stringify(c.bySource)} tendsInWindow=${c.tendsInWindow} (pol=${c.policyTendsInWindow} eng=${c.engineTendsInWindow}) refusedInWindow=${c.refusedInWindow} tendsNeededToOffset=${c.tendsNeededToOffset} weeksAvail=${c.weeksAvailable} actorDays=${c.actorDays}/${c.windowDays} actorNullDays=${c.actorNullDays} actorPrePostAgree=${c.actorPrePostAgree}/${c.actorPrePostTotal} opportunities=${c.opportunities} engTendsOnOppDays=${c.engineTendsOnOpportunityDays} dominantDrag=${c.dominantDrag} (${c.dominantDragPoints}) sizingCall=${c.sizingCall}`);
    for (const [lid, pl] of Object.entries(c.perLink)) console.log(`    link ${lid} (${pl.other}): trust ${pl.trustAtQualify} -> ${pl.trustAtEnd} (total ${pl.total}) buckets=${JSON.stringify(pl.buckets)}`);
  }
  console.log(`  VERDICT (pending G1 det-gate): ${report.verdict} (armedTraj ${armedTraj ? 'PASS' : 'FAIL'}; armedTendLog ${armedTendLog ? 'PASS' : 'FAIL'}; armedActorField ${armedActorField ? 'PASS' : 'FAIL'}; censusComplete ${censusComplete ? 'PASS' : 'FAIL'}; G2 ${g2Pass ? 'PASS' : 'FAIL'}; G3 ${g3Pass ? 'PASS' : 'FAIL'}; cross ${crossPass ? 'PASS' : 'FAIL'}) -> ${summaryPath}`);
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
  const { Game } = await loadGame({ seed, mode: 'linkdecay-a-detgate', fullTelemetry: false });
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
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '76403', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-11-08', 'sim-linkdecay-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.TENDTRUST = '1';
  const armed = withTendTrust(tableseatNowait, 'tendtrust-b', 'tableseat-nowait + tend/trust recorder');
  const { Game } = await loadGame({ seed, mode: 'linkdecay-a-sense', fullTelemetry: false, narration: true });
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
if (require.main === module) main().catch(e => { console.error('LINKDECAY-A SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { decayCensus, classifyKind };
