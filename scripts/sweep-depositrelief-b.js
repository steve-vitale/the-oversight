#!/usr/bin/env node
// sweep-depositrelief-b.js — DEPOSITRELIEF=1 buffer-aware deposit-gate
// stand-down sweep (sim-depositrelief-b, 2026-10-24, axis food-economy,
// oversight-flesh-out-loop-b).
//
// Lever measurement: DEPOSITRELIEF=1 = the deposit gate STANDS DOWN when the
// deep-reserve buffer reads thin (pantryDaysEstimate() <= 4 — the SAME >4
// line PLENTYDEPRI=2 used; see scripts/test-depositrelief-b.js). Finding
// #863: on DEPOSITGATE=1 cells the starvation regression does NOT respond
// to the easing-channel repair — it flows through the deposit holdback
// pipe. This arm works the deposit channel.
// Design: {DEPOSITRELIEF=0/1} x policies {leadfeast,belongfeast}, 16 seeds
// 9250-9265 (same substrate as bufferdepri-b; fresh for this lever), 100d
// death-aware, FEASTSCALE_R13=1/SEATDRIVE=0. DEPOSITGATE=1 explicit,
// PLENTYDEPRI=0 explicit (the deposit channel in isolation — PD unset would
// silently arm the landed PD=1 default).
//
// Derived from scripts/sweep-bufferdepri-b.js (cited; the identical
// instrument per finding #850 — observer-effect: only the same instrument
// reproduces corpus numbers). Changes vs the bufferdepri sweep:
//   - SIDE=dr0|dr1 (DEPOSITRELIEF={0,1}); PLENTYDEPRI pinned '0',
//     DEPOSITGATE pinned '1' — all three FATAL-asserted explicit
//   - DR ledger capture: vv._depositRelief.days[].standDown(Dec/Days/Vids)
//   - per-seed schema gains "depositrelief": 0|1
//   - per-seed JSONs + summaries -> evidence/2026-10-24/depositrelief-b-corpus/
//     (inside the worktree; never /tmp — the 2026-10-23 /tmp wipe class)
//
// PRE-REGISTRATION lives in evidence/2026-10-24/sim-depositrelief-b.md
// (written BEFORE analysis per §14).
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); SIDE=dr0|dr1;
//   PLENTYDEPRI=0 DEPOSITGATE=1 DEPOSITRELIEF=0|1 explicit (asserted);
//   SEEDS="9250,...,9265" POLICY=leadfeast|belongfeast DAYS=100
//   (death-aware; dead villages stop; +10d tail max).
// CELL=SIDE OUT=<path> node scripts/sweep-depositrelief-b.js
//
// PER-SEED SCHEMA:
// {"seed","policy","depositrelief":0|1,"depositgate":1,"plentydepri":0,
//  "daysAlive","villageDays","rotFreshKcal","rotPreservedKcal","easedKcal",
//  "reliefStandDownDec","reliefStandDownDays",
//  "glutChannels":{"funnelShare","scholarHomecoming","tributeDeposit",
//                  "awayReturn","ambientBighaul","other"},
//  "freshDaysMedian","deathCauses":{},"national","table","win",
//  "waveReach":[],"medianSurvival":null}
// DIAG (extra, not in schema): endReason, rank, maxWave, arc, starveDays,
//   dgDays, dgShareEased, dgHoldbackKcal, reliefVids, scholarDeaths,
//   plentyDays, freshDaysMax, shareKcal, chan, inflowTotal, ms.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'dr0'; // dr0 | dr1 (DEPOSITRELIEF side)
const DR_WANT = SIDE === 'dr1' ? '1' : '0';
// STRICT: the gates default in node when unset (DEPOSITGATE defaults ON,
// DEPOSITRELIEF defaults OFF), so env must be EXPLICIT —
if (process.env.DEPOSITRELIEF !== DR_WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires DEPOSITRELIEF=${DR_WANT} explicitly (unset = default-OFF)`);
  process.exit(2);
}
if (process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: DEPOSITGATE=1 must be explicit (unset = default-ON, a silent "control")');
  process.exit(2);
}
if (process.env.PLENTYDEPRI !== '0') {
  console.error('FATAL: PLENTYDEPRI=0 must be explicit (the deposit channel in isolation; unset = default-ON)');
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS ||
  '9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'depositrelief-b-corpus', `sweep-${SIDE}-${POLICY_ID}.json`);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'depositrelief-b-corpus');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// channel attribution for stockPantry callers (confirm sweep taxonomy)
function channelOf() {
  const st = new Error().stack || '';
  if (/checkTraps/.test(st)) return 'traps';
  if (/catchUpSim|tribute/i.test(st)) return 'tribute';
  if (/donat/i.test(st)) return 'scholar_home';
  if (/resolveOneAssignment/.test(st)) return 'duty';
  if (/packMeal|homecoming|awayReturn|npcNodeTravel|objReturnEffect/i.test(st)) return 'away_wild';
  if (/hostFeast|Trial|replicated|System/i.test(st)) return 'system';
  if (/villageLives|ambientSocial|mealLeftover/i.test(st)) return 'ambient:villagelives';
  return 'ambient:other';
}

// EPERM-FLAP-RESILIENT WRITE (2026-10-23): this container intermittently
// EPERMs fs.writeFileSync (same flap class as the jest chown EPERM in
// AGENTS.md — writes fail even for root, in fresh processes, then recover
// minutes later). Sweep evidence must not silently go missing: write atomically
// (temp + rename, so a failed attempt never leaves a 0-byte truncation) with
// retries, verify by read-back, and FAIL LOUDLY if the window never opens.
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
    try {
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 59) { console.error('WRITE FAIL LOUDLY', filePath, e.code || e.message); process.exit(2); }
      // 2s backoff; the flap recovers on a minutes timescale
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}

// Output routing: STDOUT_SPLIT=1 sends file payloads to stdout with
// @@FILE/@@SWEEP markers for a shell splitter (bash redirection has been
// 100% reliable during EPERM windows; node fs writes flap). Progress goes
// to stderr in that mode.
const STDOUT_SPLIT = process.env.STDOUT_SPLIT === '1';
function emitFile(filePath, data) {
  if (STDOUT_SPLIT) {
    process.stdout.write('@@FILE ' + path.basename(filePath) + '\n');
    process.stdout.write(data + '\n');
    return;
  }
  writeRobust(filePath, data);
}
function emitSweep(data) {
  if (STDOUT_SPLIT) {
    process.stdout.write('@@SWEEP\n');
    process.stdout.write(data + '\n');
    return;
  }
  writeRobust(OUT, data);
}
const progress = (...a) => { if (STDOUT_SPLIT) console.error(...a); else console.log(...a); };

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'depositrelief-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const playerId = Game.villagerId;
  const W = {
    deaths: [], deathSeen: new Set(), chan: {}, shareKcal: 0, starveDays: 0,
    villageDays: 0, dgHoldbackKcal: 0, rot_fast: 0, rot_preserved: 0,
    scholarDeaths: 0,
  };

  // --- rot:fresh vs rot:preserved (dedupe by item identity) ---
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          W['rot_' + fs] = (W['rot_' + fs] || 0) + (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  // --- inflow channel attribution: stockPantry (call-path) + stockSurplus (the share funnel) ---
  const oSP = Game.stockPantry;
  if (typeof oSP === 'function') Game.stockPantry = function (kcal, name, opts) {
    try { const c = channelOf(); W.chan[c] = (W.chan[c] || 0) + (kcal || 0); }
    catch (e) {}
    return oSP.apply(this, arguments);
  };
  const oSS = Game.stockSurplus;
  if (typeof oSS === 'function') Game.stockSurplus = function (v, give) {
    const r = oSS.apply(this, arguments);
    try { W.shareKcal += Math.max(0, r || 0); } catch (e) {}
    return r;
  };

  // --- DEPOSITGATE holdback kcal (away.return / ambient.bighaul; the funnel.share
  //     ease is recorded by the game ledger as shareEased kcal) ---
  const oHB = Game._depositGateHoldback;
  if (typeof oHB === 'function') Game._depositGateHoldback = function (vid, kcal, kind) {
    const r = oHB.apply(this, arguments);
    try { if (r > 0) W.dgHoldbackKcal += r; } catch (e) {}
    return r;
  };

  // --- deaths: kind-aware, dedup on (who,day,cause); scholar deaths = successions ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          W.deaths.push({ day, who: who.slice(0, 24), kind, cause });
          if (who === String(playerId)) W.scholarDeaths++;
        }
      }
    } catch (e) {}
  };

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  const freshSeries = [];
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      const roster = ((G.state || {}).village || {}).roster || [];
      W.villageDays += roster.length; // exposure: villager-days alive today
      for (const id of roster) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
      if (G.pantryFreshDays) freshSeries.push(G.pantryFreshDays());
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  // --- DR ledger (deposit-gate stand-down decisions) ---
  let reliefStandDownDec = 0, reliefStandDownDays = 0;
  const reliefVids = new Set();
  try {
    const lg = (Game.state.village || {})._depositRelief;
    if (lg) for (const d of Object.values(lg.days || {})) {
      if ((d.standDown || 0) > 0) reliefStandDownDays++;
      reliefStandDownDec += (d.standDown || 0);
      for (const vid of (d.vids || [])) reliefVids.add(vid);
    }
  } catch (e) {}
  // --- DG ledger (funnel.share eased kcal) + holdback kcal (away.return/bighaul) ---
  let dgShareEased = 0, dgDays = 0;
  try {
    const lg = (Game.state.village || {})._depositGate;
    if (lg) for (const d of Object.values(lg.days || {})) {
      dgDays++; dgShareEased += (d.shareEased || 0);
    }
  } catch (e) {}
  const easedKcal = Math.round(dgShareEased + W.dgHoldbackKcal);

  const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);

  // glutChannels partition (schema-exact; analyzer asserts sum ~= total inflow)
  const ch = W.chan;
  const r0 = v => Math.round(v || 0);
  const glutChannels = {
    funnelShare: r0(W.shareKcal + (ch.duty || 0) + (ch.traps || 0)),
    scholarHomecoming: r0(ch.scholar_home || 0),
    tributeDeposit: r0(ch.tribute || 0),
    awayReturn: r0(ch.away_wild || 0),
    ambientBighaul: r0(ch['ambient:villagelives'] || 0),
    other: r0((ch.system || 0) + (ch['ambient:other'] || 0)),
  };

  const perSeed = {
    seed, policy: POLICY_ID,
    depositrelief: DR_WANT === '1' ? 1 : 0, depositgate: 1, plentydepri: 0,
    daysAlive: result.days, villageDays: W.villageDays,
    rotFreshKcal: Math.round(W.rot_fresh || 0), rotPreservedKcal: Math.round(W.rot_preserved || 0),
    easedKcal,
    reliefStandDownDec, reliefStandDownDays,
    glutChannels,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
    deathCauses, national,
    table: won, win: won, // the win flag IS the table: table.js sets Game.won
    waveReach, medianSurvival: null, // patched by the analyzer with the cell median
  };
  // extra diagnostic fields (NOT in the schema; kept alongside for the analyzer)
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays,
    dgDays, dgShareEased: Math.round(dgShareEased),
    dgHoldbackKcal: Math.round(W.dgHoldbackKcal),
    reliefVids: [...reliefVids], scholarDeaths: W.scholarDeaths,
    plentyDays: freshSeries.filter(x => x > 4).length,
    freshDaysMax: freshSeries.length ? Math.max.apply(null, freshSeries) : null,
    shareKcal: Math.round(W.shareKcal), chan: Object.fromEntries(Object.entries(ch).map(([k, x]) => [k, r0(x)])),
    inflowTotal: Math.round(W.shareKcal + Object.values(ch).reduce((a, b) => a + (b || 0), 0)),
    ms,
  };
  return { seed, perSeed, diag };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try {
      fs.mkdirSync(PERSEED_DIR, { recursive: true });
    } catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    emitFile(path.join(PERSEED_DIR, `depositrelief-b-${SIDE}-${POLICY_ID}-s${s}.json`),
      JSON.stringify(perSeed));
    const rotK = Math.round((perSeed.rotFreshKcal + perSeed.rotPreservedKcal) / 1000);
    progress(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} rot=${rotK}k easedK=${Math.round(perSeed.easedKcal / 1000)} reliefDec=${perSeed.reliefStandDownDec} scholarDeaths=${diag.scholarDeaths} freshMed=${perSeed.freshDaysMedian} won=${perSeed.win} (${diag.ms}ms)`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  // MERGE: the summary merges rows by seed with any existing summary file
  // (pilot + full runs share one 16-seed summary per cell). Re-running
  // identical seeds is byte-identical (seeded RNG, same instrument), so
  // merges are idempotent. Finding #864: on verify failure re-invoke node
  // for a fresh merge — never re-split a captured payload.
  let merged = rows;
  try {
    if (fs.existsSync(OUT)) {
      const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      const bySeed = new Map();
      for (const r of (prev.rows || [])) bySeed.set(r.seed, r);
      for (const r of rows) bySeed.set(r.seed, r);
      merged = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
    }
  } catch (e) {
    if (!STDOUT_SPLIT) { console.error('SUMMARY MERGE FAIL', OUT, e.message); process.exit(2); }
    // STDOUT_SPLIT: a missing/unreadable summary just means "first run" —
    // the shell verifier enforces the 16-row merge downstream.
  }
  const allSeeds = merged.map(r => r.seed).sort((a, b) => a - b);
  emitSweep(JSON.stringify({ meta: { cell: SIDE, policy: POLICY_ID, days: DAYS, seeds: allSeeds, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1', DEPOSITRELIEF: DR_WANT } }, rows: merged }));
  progress('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
