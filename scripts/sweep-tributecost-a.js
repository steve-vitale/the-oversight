#!/usr/bin/env node
// scripts/sweep-tributecost-a.js — tribute-cost recorder driver (DIAG ONLY,
// sim-tributecost-a, finding #1540). Instrument, never game code: it wraps
// a policy's daily with READ-ONLY snapshots and wraps verbs for event
// logging only. It never calls a game verb itself and never feeds a
// roster, list, census, or link snapshot into any villager decision
// (perception law: the recorder reads state; decisions stay in the
// policy and the engine).
//
// What the vests-b corpus MISSED (and this recorder covers):
//   - per-day pantry kcal series (daily, not sampleEvery=10)
//   - tribute-payment events, BOTH directions: Haven-paid (payTribute
//     wrap, actual kcal removed) and subordinate→Haven arrivals
//     (depositPantryPieces wrap filtered to 'Tribute grain from ',
//     exact amounts) plus waivers/shorts/sabotage from daily link
//     snapshots + link-history diffs
//   - a timestamped death log (runDays live capture) cross-checked
//     against an INDEPENDENT tele capture installed by this driver
//   - a population series (daily roster count + roster-set joiner /
//     leaver events, leavers checked against the death log)
//
// Direction (hierarchy.js, read before writing): LEAD links
// (leanlink's proposals, asSubordinate:false) make Haven PRIMARY, so
// tribute flows INTO Haven; Haven pays ONLY on flipped counter links
// (Haven subordinate, 5,000 kcal/week) via the payTribute verb, which
// no competent-derived policy calls. The recorder measures all of
// these; it does not assume any of them.
//
// Usage (one process per column — the LEANLINK env gate must not leak
// into the competent column):
//   SEEDS="9911,...,9918" POLICY=competent DAYS=180 \
//     OUT=evidence/2026-10-30/sim-tributecost-a-corpus-competent.json \
//     PERSEED_DIR=evidence/2026-10-30/sim-tributecost-a-corpus-competent \
//     node scripts/sweep-tributecost-a.js
//   LEANLINK=1 SEEDS="9911,...,9918" POLICY=leanlink DAYS=180 \
//     OUT=evidence/2026-10-30/sim-tributecost-a-corpus-leanlink.json \
//     PERSEED_DIR=evidence/2026-10-30/sim-tributecost-a-corpus-leanlink \
//     node scripts/sweep-tributecost-a.js
//
// Output JSON contains NO wall-clock timestamps (determinism gate:
// re-runs byte-identical). Per-seed files under PERSEED_DIR hold the
// full series (pantry, population, link snapshots, tribute events).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { leanlink } = require('./policies/leanlink');

const POLICY_MAP = { competent, leanlink };

// writeRetry: the container EPERM flap (AGENTS.md 2026-10-23/24) kills
// single writeFileSync calls mid-sweep (this run: competent seed 9915
// died on its per-seed write after 40 x 15s of retries, and the failed
// attempts left 0-byte files for 9915/9916/9917 — a truncated write
// throws AFTER truncating).
// ATOMIC: write to file+'.tmp' with retries, then rename into place,
// so a failed write never leaves a 0-byte final file behind.
// STICKY-DENIAL LESSON (this run, 15:26–15:34): once a long-running
// sweep process takes its first EPERM, its later writes keep failing
// for 10+ minutes while FRESH processes write the same directory
// fine in the same minute. A long in-process retry budget is therefore
// futile — it burns wall-clock while the process stays denied. Budget
// is deliberately SHORT (6 x 5s): on failure the caller DEFERS (the
// row stays in memory, the run continues) and the end-of-run flush
// plus stdout dump is the recovery path — the coordinator rebuilds
// the file from the dump with a fresh process. Sleep is Atomics.wait:
// sync, no extra process, no re-run.
function writeRetry(file, data) {
  const tmp = file + '.tmp';
  let lastErr = null;
  for (let i = 0; i < 6; i++) {
    try { fs.writeFileSync(tmp, data); break; } catch (e) { lastErr = e; }
    try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000); } catch (e) {}
    if (i === 5) throw lastErr;
  }
  lastErr = null;
  for (let i = 0; i < 6; i++) {
    try { fs.renameSync(tmp, file); return; } catch (e) { lastErr = e; }
    try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000); } catch (e) {}
    if (i === 5) throw lastErr;
  }
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function scholarDay(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}
function rosterIds(Game) {
  try { return ((Game.state.village || {}).roster || []).slice(); } catch (e) { return []; }
}
function otherPantryKcal(Game, vid) {
  try {
    const ov = Game._otherVillage ? Game._otherVillage(vid) : null;
    return ov && ov.pantryKcal != null ? Math.round(ov.pantryKcal) : null;
  } catch (e) { return null; }
}

// linkSnapshot(Game) -> per active+broken link state + NEW history entries
// (diffed against seenHistory keys, since the engine caps history at 40
// entries per link and daily capture is what makes it lossless).
function linkSnapshot(Game, seenHistory) {
  const links = [];
  try {
    const all = Game.hierarchyState ? Game.hierarchyState() : [];
    for (const l of (all || [])) {
      if (!l) continue;
      const newNotes = [];
      try {
        for (const h of (l.history || [])) {
          const k = l.id + '|' + h.day + '|' + h.kind + '|' + h.note;
          if (!seenHistory.has(k)) { seenHistory.add(k); newNotes.push({ day: h.day, kind: h.kind, note: h.note }); }
        }
      } catch (e) {}
      links.push({
        id: l.id, primary: l.primary, subordinate: l.subordinate, kind: l.kind || 'link',
        status: l.status, trust: l.trust, day: l.day,
        tributeKcalPerWeek: l.tributeKcalPerWeek,
        tributePaidKcal: l.tributePaidKcal || 0, tributeWeek: l.tributeWeek != null ? l.tributeWeek : null,
        tributePaidWeek: l.tributePaidWeek != null ? l.tributePaidWeek : null,
        arrears: l.arrears || 0, conquered: !!l.conquered,
        subordinatePantryKcal: l.primary === 'haven' ? otherPantryKcal(Game, l.subordinate) : null,
        newNotes,
      });
    }
  } catch (e) {}
  return links;
}

async function runSeed(seed, policyId, days) {
  const base = POLICY_MAP[policyId];
  if (!base) throw new Error('unknown policy: ' + policyId);
  const { Game, manifest } = await loadGame({ seed, mode: 'tributecost-a-' + policyId, fullTelemetry: false });
  await setupGame(Game);

  const rec = {
    pantryDaily: [], pantryEOD: [], popDaily: [], joiners: [], leavers: [],
    linkDays: [], payTributeEvents: [], tributeArrivals: [], courtCalls: [],
    teleDeathCount: 0, teleDeaths: [],
  };
  const seenHistory = new Set();
  let prevRoster = null;
  let lastCtx = null;

  // INDEPENDENT death capture: installed BEFORE runDays, so runDays'
  // own tele wrapper chains through it (runDays restores Game.tele to
  // this wrapper at the end). Defensive: never throws into the engine.
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    let r;
    try { r = origTele.apply(this, arguments); } catch (e) { throw e; }
    try {
      if (type === 'death') {
        rec.teleDeathCount++;
        rec.teleDeaths.push({ day: scholarDay(this), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
      }
    } catch (e) {}
    return r;
  };

  // Verb wraps: pass-through + event log. They record the pantry kcal
  // before/after each call, so sweetener / accord-gift / payTribute
  // ACTUALS are measured, not assumed from nominal prices.
  const wrapVerb = (name, log) => {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function () {
      const before = pantryKcal(this);
      const day = scholarDay(this);
      let ret, errObj = null;
      try { ret = orig.apply(this, arguments); } catch (e) { errObj = e; }
      const after = pantryKcal(this);
      try { log({ day, name, args: Array.prototype.slice.call(arguments).map(a => (a && typeof a === 'object' ? JSON.stringify(a).slice(0, 200) : String(a))), ret: (ret && typeof ret === 'object' ? JSON.stringify(ret).slice(0, 200) : (ret == null ? null : ret)), pantryBefore: Math.round(before), pantryAfter: Math.round(after), pantryDelta: Math.round(after - before), error: errObj ? String(errObj.message || errObj).slice(0, 120) : null }); } catch (e) {}
      if (errObj) throw errObj;
      return ret;
    };
  };
  wrapVerb('payTribute', (e) => { rec.payTributeEvents.push(e); });
  wrapVerb('proposeLink', (e) => { rec.courtCalls.push(e); });
  wrapVerb('answerCounter', (e) => { rec.courtCalls.push(e); });
  wrapVerb('answerAccord', (e) => { rec.courtCalls.push(e); });
  // Tribute arrivals ride depositPantryPieces with name 'Tribute grain
  // from <village>' (hierarchy.js linkTick). Filter to that prefix so
  // other deposits (hauls, donations) never count as tribute income.
  // Amount = kcalEach * units as deposited (pre-split pieces: the
  // engine splits into <=500-kcal pieces via the same call path, so
  // each call's amount is one piece; the analyzer sums per day).
  if (typeof Game.depositPantryPieces === 'function') {
    const origDep = Game.depositPantryPieces;
    Game.depositPantryPieces = function (v, item, maxPiece) {
      const day = scholarDay(this);
      let ret;
      try { ret = origDep.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (item && typeof item.name === 'string' && item.name.indexOf('Tribute grain from ') === 0) {
          rec.tributeArrivals.push({ day, name: item.name, kcalEach: item.kcalEach, units: item.units, amount: Math.round((item.kcalEach || 0) * (item.units || 1)) });
        }
      } catch (e) {}
      return ret;
    };
  }
  // Post-sleep pantry series: runDays samples pantry AFTER sleep +
  // driveContests; this snapshot lands right after sleep returns, so
  // the two series bracket the same day-end (any residual gap is
  // driveContests food, reported as a diagnostic, never hidden).
  if (typeof Game.sleep === 'function') {
    const origSleep = Game.sleep;
    Game.sleep = function () {
      let ret;
      try { ret = origSleep.apply(this, arguments); } catch (e) { throw e; }
      try { rec.pantryEOD.push({ scholarDay: scholarDay(this), kcal: Math.round(pantryKcal(this)) }); } catch (e) {}
      return ret;
    };
  }

  const takeDaily = (stage) => {
    const day = scholarDay(Game);
    const roster = rosterIds(Game);
    if (prevRoster !== null) {
      const prev = new Set(prevRoster), cur = new Set(roster);
      for (const id of roster) if (!prev.has(id)) rec.joiners.push({ day, stage, id });
      for (const id of prevRoster) if (!cur.has(id)) rec.leavers.push({ day, stage, id });
    }
    prevRoster = roster;
    const links = linkSnapshot(Game, seenHistory);
    if (stage === 'post') {
      rec.pantryDaily.push({ scholarDay: day, kcal: Math.round(pantryKcal(Game)) });
      rec.popDaily.push({ scholarDay: day, pop: roster.length });
      rec.linkDays.push({ scholarDay: day, links });
    }
    return links;
  };

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    lastCtx = ctx;
    try { takeDaily('pre'); } catch (e) {}
    // NOTE: no early return here — the post-daily snapshot must run
    // after origDaily (an early `return origDaily(...)` skipped it
    // entirely; caught by test-tributecost-a F2/F3).
    let ret;
    if (origDaily) { try { ret = origDaily(G, ctx); } catch (e) {} }
    try { takeDaily('post'); } catch (e) {}
    return ret;
  };
  if (typeof base.setup === 'function') {
    policy.setup = (G, ctx) => { lastCtx = ctx; return base.setup(G, ctx); };
  }
  const result = await runDays(Game, policy, { days, manifest, sampleEvery: 1 });
  // End-of-run snapshot (a village lost mid-day still gets its final state).
  let endLinks = [];
  try { endLinks = linkSnapshot(Game, seenHistory); } catch (e) {}
  const endGate = { rank: 'village', nationalLive: false, links: [], deed: null, seat: null };
  try { endGate.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { endGate.nationalLive = !!Game.state.nationalLive; } catch (e) {}
  try {
    const links = Game.hierarchyState ? Game.hierarchyState() : [];
    endGate.links = (links || []).filter(l => l && l.status === 'active').map(l => ({
      primary: l.primary, subordinate: l.subordinate, trust: l.trust,
      ageDays: l.ageDays != null ? l.ageDays : null, conquered: !!l.conquered,
      tributeKcalPerWeek: l.tributeKcalPerWeek, arrears: l.arrears || 0,
    }));
  } catch (e) {}
  try {
    const d = Game.deedGateReady ? Game.deedGateReady() : null;
    if (d) endGate.deed = { ok: !!d.ok, waves: !!d.waves, contests: !!d.contests, crises: !!d.crises, scale: !!d.scale, stageOk: !!d.stageOk, foodDeeds: !!d.foodDeeds, stage: d.stage, w1: d.w1, w2: d.w2, w3: d.w3, w4: d.w4, w5: d.w5, contestsN: d.contestsN, crisesN: d.crisesN, rank: d.rank };
  } catch (e) {}
  try {
    const t = Game.tableSeat ? Game.tableSeat() : null;
    if (t) endGate.seat = { seat: t.seat || 'none', detail: t.detail || null };
  } catch (e) {}
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let maxRank = 'village', maxArc = 1;
  try { maxRank = endGate.rank; } catch (e) {}
  try { maxArc = Game.progState ? (Game.progState().arc || 1) : 1; } catch (e) {}
  const scaleCurve = (result.samples.scale || []).map(([d, r]) => [d, r]);
  const rankOrder = { village: 0, regional: 1, national: 2, global: 3 };
  for (const [, r] of scaleCurve) if ((rankOrder[r] || 0) > (rankOrder[maxRank] || 0)) maxRank = r;
  const court = {};
  try {
    if (lastCtx) {
      for (const k of ['proposedLead', 'courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls']) {
        if (lastCtx[k] != null) court[k] = lastCtx[k];
      }
    }
  } catch (e) {}
  const row = {
    policy: policyId, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc, maxRank,
    national: (rankOrder[maxRank] || 0) >= 2 ? 1 : 0,
    table: 0, entered: 0,
    deaths,
    deathLog: result.samples.deaths || [],
    deathLogCount: (result.samples.deaths || []).length,
    teleDeathCount: rec.teleDeathCount,
    teleDeaths: rec.teleDeaths,
    pantryDaily: rec.pantryDaily,
    pantryEOD: rec.pantryEOD,
    pantrySamples: result.samples.pantry || [],
    popDaily: rec.popDaily,
    popSamples: result.samples.pop || [],
    joiners: rec.joiners, leavers: rec.leavers,
    linkDays: rec.linkDays, endLinks,
    payTributeEvents: rec.payTributeEvents,
    tributeArrivals: rec.tributeArrivals,
    courtCalls: rec.courtCalls,
    endGate, court,
    scaleCurve,
    pacing: result.pacing ? { verbs: result.pacing.meanDeliberatePerDay } : null,
  };
  try {
    const pg = Game.progState ? Game.progState() : {};
    row.table = pg.tableWaiting ? 1 : 0;
    row.entered = pg.tableDone ? 1 : 0;
  } catch (e) {}
  console.log(`  [${policyId} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} rank=${row.maxRank} national=${row.national} deaths=${row.deathLogCount} teleDeaths=${row.teleDeathCount} payTrib=${row.payTributeEvents.length} arrivals=${row.tributeArrivals.length} pantryDays=${row.pantryDaily.length} popDays=${row.popDaily.length} joiners=${row.joiners.length} leavers=${row.leavers.length}`);
  return row;
}

async function main() {
  const policyId = process.env.POLICY || 'competent';
  const seeds = (process.env.SEEDS || '9911,9912,9913,9914,9915,9916,9917,9918').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT;
  const perSeedDir = process.env.PERSEED_DIR;
  if (policyId === 'leanlink' && process.env.LEANLINK !== '1') {
    console.error('REFUSAL: leanlink column requires LEANLINK=1 in this process (default-OFF gate).');
    process.exit(2);
  }
  if (perSeedDir) fs.mkdirSync(perSeedDir, { recursive: true });
  const runs = [];
  const failedWrites = [];
  for (const seed of seeds) {
    const row = await runSeed(seed, policyId, days);
    runs.push(row);
    if (perSeedDir) {
      try {
        writeRetry(path.join(perSeedDir, `seed-${seed}.json`), JSON.stringify(row, null, 1) + '\n');
      } catch (e) {
        // Do NOT die on one seed's write: the flap is host-wide and
        // time-boxed, and dying here loses every later seed's sim too.
        // The row stays in memory; it gets a fresh flush attempt below,
        // and as a last resort is dumped to stdout for reconstruction.
        console.log(`  [WARN seed ${seed}] per-seed write failed (${e.code || e.message}); deferred to end-of-run flush.`);
        failedWrites.push(seed);
      }
    }
  }
  for (const seed of failedWrites.slice()) {
    const row = runs.find(r => r.seed === seed);
    try {
      writeRetry(path.join(perSeedDir, `seed-${seed}.json`), JSON.stringify(row, null, 1) + '\n');
      failedWrites.splice(failedWrites.indexOf(seed), 1);
      console.log(`  [flush seed ${seed}] deferred write recovered.`);
    } catch (e) { console.log(`  [flush seed ${seed}] STILL failing; row will be dumped to stdout.`); }
  }
  if (failedWrites.length) {
    for (const seed of failedWrites) {
      const row = runs.find(r => r.seed === seed);
      console.log('@@ROW_JSON@@' + seed + ' ' + JSON.stringify(row));
    }
    throw new Error('per-seed writes still failing after flush for seeds: ' + failedWrites.join(',') + ' (rows dumped to stdout above for reconstruction)');
  }
  const totalDeaths = (rs) => rs.reduce((t, r) => t + r.deathLogCount, 0);
  const report = { label: 'sim-tributecost-a', policy: policyId, seeds, days,
    runs,
    byPolicy: {
      n: runs.length,
      won: runs.reduce((t, r) => t + r.won, 0),
      medianDays: runs.map(r => r.days).sort((a, b) => a - b)[Math.floor(runs.length / 2)] || 0,
      maxDays: Math.max.apply(null, runs.map(r => r.days).concat([0])),
      maxWave: Math.max.apply(null, runs.map(r => r.waveReach).concat([1])),
      national: runs.reduce((t, r) => t + r.national, 0),
      table: runs.reduce((t, r) => t + r.table, 0),
      entered: runs.reduce((t, r) => t + r.entered, 0),
      deaths: totalDeaths(runs),
      payTributeEvents: runs.reduce((t, r) => t + r.payTributeEvents.length, 0),
      payTributeKcal: runs.reduce((t, r) => t + r.payTributeEvents.reduce((u, e) => u + (typeof e.ret === 'number' ? e.ret : 0), 0), 0),
      tributeArrivals: runs.reduce((t, r) => t + r.tributeArrivals.length, 0),
      tributeArrivalKcal: runs.reduce((t, r) => t + r.tributeArrivals.reduce((u, e) => u + (e.amount || 0), 0), 0),
      courtCalls: runs.reduce((t, r) => t + r.courtCalls.length, 0),
    },
  };
  if (out) {
    try { writeRetry(out, JSON.stringify(report, null, 1) + '\n'); console.log('wrote ' + out); }
    catch (e) {
      // Aggregate is rebuildable from per-seed files; still, never
      // lose it silently: dump it for fresh-process reconstruction.
      console.log('@@AGGREGATE_JSON@@' + JSON.stringify(report));
      throw new Error('aggregate write failed (dumped to stdout for reconstruction): ' + (e.code || e.message));
    }
  }
  return report;
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
module.exports = { runSeed, pantryKcal, linkSnapshot };
