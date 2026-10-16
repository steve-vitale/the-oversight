#!/usr/bin/env node
// scripts/run-teleflag-20261016.js — the sim-teleflag-b census driver
// (loop B, 2026-10-16, food-economy axis / measurement infrastructure;
// fixes sim-findings #400/#403).
//
// 16-run census RE-RUN reusing the succdeath instrument
// (scripts/succdeath-20261016.js): same 16 seeds [307,418,529,640,751,862,973,84]
// x {leadfeast, belongfeast}, 180d death-aware, pre-seat courtship substrate
// (FEASTSCALE_R13=1+TRIBFLOOR=1+SUCCGRACE=1+RAIDDENSITY=1+WINPURSUIT=1+WINDEFER=1,
// SEATDRIVE=0 explicit). Zero src/js gameplay changes; the fix is
// telemetry-only (corpses.js teleflag repair + sim-harness lazy player).
//
// Per run: loadGame + setupGame, installSuccDeath, wrap policy.daily to call
// track.dawn(Game) first (and track reachability maxima), runDays, final
// track.dawn, finalize, uninstall. Writes per-seed JSONs to
// evidence/2026-10-16/perseed-teleflag/ (NOT perseed-succdeath — the 0630Z
// control JSONs must not be overwritten).
//
// TELEFLAG JOIN (the PRIMARY): the instrument's registerDeath hook records
// every call's opts (including the no-op'd player:true call); the harness
// live death capture (samples.deaths) is the tele stream. For each distinct
// vid with a player:true instrument record (a scholar death), the tele with
// who===vid must exist exactly once and carry player:true.
//
// Pre-registration (binding, MEASUREMENT §§9-12,14):
//   PRIMARY GO: 100% of scholar deaths carry player:true in harness teles
//     (flagged/scholarDeaths == 1.0). The known belongfeast-s529 instance
//     (Olivia Bennett, d138 — harness keyed 'person:combat' in the 0630Z
//     census) must be verified flipped to 'player:combat'.
//   DET-GATE (16/16 trajectory-identical vs the 0630Z control, identical
//     seeds): successions 143, fast 37, cause classes combat 32/other 5,
//     wall national 13/16 table 15/16 wins 0/16 exiled 0/16 wave4 15/16
//     wave5 9/16, per-seed days/endReason/nSuccessions/nFast identical.
//     Death counts must match exactly (no double-death).
//   Horizon: 180d death-aware (dead villages stop simulating, +10d tail).
//   Seeds: 16 — 8 seeds x {leadfeast, belongfeast} (identical to 0630Z).
//   Reported (not scored): per-seed teleflag lists.
//
// Usage:
//   node scripts/run-teleflag-20261016.js leadfeast 307   # one run
//   node scripts/run-teleflag-20261016.js --aggregate    # summary + verdict
// Run one-run processes in parallel (separate processes; never two harnesses
// in one process). Env substrate vars required (same as run-succdeath).
'use strict';
const fs = require('fs');
const path = require('path');

const SEEDS = [307, 418, 529, 640, 751, 862, 973, 84];
const PIDS = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-teleflag');
const CONTROLDIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-succdeath');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') {
    console.error(`SWEEP STOP: ${k}=1 is required (substrate).`);
    process.exit(2);
  }
}
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0';
process.env.SUCCDEATH = '1';

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installSuccDeath } = require('./succdeath-20261016');
const SD = require('./policies/seatdrive');
const POLICIES = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function snap(Game) {
  const o = { rank: 'village', arc: 1, tableWaiting: false, tableEntered: false, won: false, exiled: false, wave: 1 };
  try { o.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; o.arc = pg.arc || 1; o.tableWaiting = !!pg.tableWaiting; o.tableEntered = !!pg.tableDone; } catch (e) {}
  try { o.won = !!Game.won; } catch (e) {}
  try { o.exiled = !!(Game.justiceExiled && Game.justiceExiled()); } catch (e) {}
  return o;
}

async function oneRun(pid, seed) {
  const { Game, manifest } = await loadGame({ seed, mode: 'tf-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const track = installSuccDeath(Game);
  if (!track.on) throw new Error('instrument did not arm (SUCCDEATH=1)');
  const base = POLICIES[pid];
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, maxWave: 1, everExiled: false };
  const od = base.daily;
  policy.daily = (G, ctx) => {
    track.dawn(G);
    try {
      const s = snap(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.tableEntered) hist.everEntered = true;
      if (s.exiled) hist.everExiled = true;
    } catch (e) {}
    if (od) { try { return od(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, manifest, sampleEvery: 10 });
  try { track.dawn(Game); } catch (e) {}
  const fin = track.finalize();
  const deathRecs = (track.deaths || []).slice(); // registerDeath hook records (finalize doesn't expose)
  track.uninstall();
  const end = snap(Game);

  // harness tele deaths (live capture)
  const teleDeaths = (result.samples.deaths || []).map(d => ({
    day: d.day, kind: d.kind, who: d.who != null ? String(d.who) : null,
    cause: d.cause, player: !!d.player,
  }));
  const deaths = {};
  for (const d of teleDeaths) {
    const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
    deaths[k] = (deaths[k] || 0) + 1;
  }

  // TELEFLAG JOIN: scholar deaths = distinct vids with a player:true
  // instrument record. Each must have exactly one harness tele, player:true.
  const scholarVids = {};
  for (const d of deathRecs) {
    if (d && d.player && d.vid) scholarVids[String(d.vid)] = { day: d.day, cause: d.cause, name: d.name };
  }
  const teleflag = { scholarDeaths: 0, flagged: 0, unflagged: [], multiTele: [] };
  for (const vid of Object.keys(scholarVids)) {
    teleflag.scholarDeaths++;
    const teles = teleDeaths.filter(t => t.who === vid);
    if (teles.length !== 1) teleflag.multiTele.push({ vid, n: teles.length, info: scholarVids[vid] });
    if (teles.length === 1 && teles[0].player === true) teleflag.flagged++;
    else teleflag.unflagged.push({ vid, nTeles: teles.length, player: teles.map(t => t.player), info: scholarVids[vid] });
  }

  try { hist.maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
  const rankMax = Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0);
  const successions = (fin.successions || []);
  return {
    policy: pid, seed, days: result.days, endReason: result.endReason,
    national: rankMax >= 2 ? 1 : 0,
    table: hist.everTable || end.tableWaiting ? 1 : 0,
    wins: end.won ? 1 : 0,
    exiled: hist.everExiled || end.exiled ? 1 : 0,
    entered: hist.everEntered || end.tableEntered ? 1 : 0,
    maxArc: hist.maxArc, maxWave: hist.maxWave,
    deaths,
    nSuccessions: successions.length,
    nFast: successions.filter(e => e.fast).length,
    teleflag,
    instrumentErrors: (fin.errors || []).length,
  };
}

async function aggregate() {
  const files = fs.readdirSync(OUTDIR).filter(f => f.endsWith('.json') && f !== 'summary.json');
  const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(OUTDIR, f), 'utf8')));
  runs.sort((a, b) => (a.policy + a.seed).localeCompare(b.policy + b.seed));

  let scholarDeaths = 0, flagged = 0, errs = 0;
  const unflaggedAll = [], multiAll = [];
  for (const r of runs) {
    scholarDeaths += r.teleflag.scholarDeaths;
    flagged += r.teleflag.flagged;
    errs += r.instrumentErrors || 0;
    for (const u of r.teleflag.unflagged) unflaggedAll.push(Object.assign({ policy: r.policy, seed: r.seed }, u));
    for (const m of r.teleflag.multiTele) multiAll.push(Object.assign({ policy: r.policy, seed: r.seed }, m));
  }

  // DET-GATE vs the 0630Z control per-seed JSONs
  const detgate = { perSeed: [], mismatches: [] };
  for (const r of runs) {
    const cf = path.join(CONTROLDIR, `${r.policy}-s${r.seed}.json`);
    if (!fs.existsSync(cf)) { detgate.mismatches.push(`${r.policy}/s${r.seed}: no control JSON`); continue; }
    const c = JSON.parse(fs.readFileSync(cf, 'utf8'));
    const cnSucc = ((c.succdeath || {}).successions || []).length;
    const cnFast = ((c.succdeath || {}).successions || []).filter(e => e.fast).length;
    const row = { policy: r.policy, seed: r.seed };
    const checks = [
      ['days', r.days, c.days],
      ['endReason', r.endReason, c.endReason],
      ['nSuccessions', r.nSuccessions, cnSucc],
      ['nFast', r.nFast, cnFast],
      ['national', r.national, c.national],
      ['table', r.table, c.table],
      ['wins', r.wins, c.wins],
      ['exiled', r.exiled, c.exiled],
      ['maxWave', r.maxWave, c.maxWave],
    ];
    for (const [k, a, b] of checks) {
      row[k] = (a === b) ? 'same' : `ARMED=${a} CONTROL=${b}`;
      if (a !== b) detgate.mismatches.push(`${r.policy}/s${r.seed}.${k}: armed=${a} control=${b}`);
    }
    detgate.perSeed.push(row);
  }

  const nSucc = runs.reduce((s, r) => s + r.nSuccessions, 0);
  const nFast = runs.reduce((s, r) => s + r.nFast, 0);
  const summary = {
    nRuns: runs.length,
    seeds: SEEDS,
    primary: {
      scholarDeaths, flagged,
      rate: scholarDeaths ? flagged / scholarDeaths : null,
      go: scholarDeaths > 0 && flagged === scholarDeaths,
    },
    unflagged: unflaggedAll,
    multiTele: multiAll,
    detgate: {
      nSuccessions: nSucc, nFast,
      controlExpect: { nSuccessions: 143, nFast: 37 },
      match: nSucc === 143 && nFast === 37,
      mismatches: detgate.mismatches,
      perSeed: detgate.perSeed,
    },
    wall: {
      national: runs.reduce((s, r) => s + r.national, 0),
      table: runs.reduce((s, r) => s + r.table, 0),
      wins: runs.reduce((s, r) => s + r.wins, 0),
      exiled: runs.reduce((s, r) => s + r.exiled, 0),
      wave4: runs.filter(r => r.maxWave >= 4).length,
      wave5: runs.filter(r => r.maxWave >= 5).length,
      medianSurvival: (() => { const d = runs.map(r => r.days).sort((a, b) => a - b); return d[Math.floor(d.length / 2)]; })(),
      maxSurvival: Math.max(...runs.map(r => r.days)),
    },
    instrumentErrors: errs,
  };
  fs.writeFileSync(path.join(OUTDIR, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log('\nTELEFLAG CENSUS: ' + JSON.stringify(summary, null, 1));
}

async function main() {
  const arg = process.argv[2];
  if (arg === '--aggregate') { await aggregate(); return; }
  const pid = arg, seed = Number(process.argv[3]);
  if (!PIDS.includes(pid) || !SEEDS.includes(seed)) {
    console.error('usage: node scripts/run-teleflag-20261016.js <leadfeast|belongfeast> <seed> | --aggregate');
    process.exit(2);
  }
  fs.mkdirSync(OUTDIR, { recursive: true });
  const t0 = process.hrtime.bigint();
  const r = await quietLog(async () => oneRun(pid, seed));
  const dt = Number(process.hrtime.bigint() - t0) / 1e9;
  fs.writeFileSync(path.join(OUTDIR, `${pid}-s${seed}.json`), JSON.stringify(r, null, 1));
  console.log(`${pid} s${seed}: ${dt.toFixed(0)}s days=${r.days} succ=${r.nSuccessions} fast=${r.nFast} ` +
    `teleflag=${r.teleflag.flagged}/${r.teleflag.scholarDeaths} unflagged=${r.teleflag.unflagged.length}`);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
