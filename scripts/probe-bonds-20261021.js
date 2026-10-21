#!/usr/bin/env node
// probe-bonds-20261021.js — the bonds-drive sweep (sim-belongbonds,
// 2026-10-21, flesh-out loop, axis scale-onramp, backlog #742).
//
// POLICY-SIDE: zero src/js changes. Measures, on the SEATDRIVE=1 winning
// substrate, whether the BONDS diplomacy drive moves the belong road's raw
// standing to >=200 by day ~140.
//
// SUBSTRATE (the substrate where the #742 gap was measured):
//   withSeatDrive(withBonds(withWinDefer(TF.belongfeast)))
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
//   (+ BONDS=1 for the armed side only).
// ARM=armed|control (default control) selects the arm; BONDS is set from
// ARM at startup so both sides share the exact same process env otherwise.
// NO tablepathdriver, no relaydark — the natural track, not the driven one.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//     ARM=armed node scripts/probe-bonds-20261021.js
//   SMOKE=1 ...        # 2 seeds x 60d, mechanism fires?
//   DET=1 ...          # ARM=armed twice byte-identical (2 seeds x 60d)
//   SEEDS="64501,64502" DAYS=180 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const BD = require('./policies/bonds');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const MODE = process.env.DET === '1' ? 'det'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';
const ARM = (process.env.ARM || 'control').toLowerCase() === 'armed' ? 'armed' : 'control';

// SUBSTRATE GUARD
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (seatdrive substrate).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor off.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer off.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive off.'); process.exit(2); }
if (ARM === 'armed') process.env.BONDS = '1'; else delete process.env.BONDS;
if (ARM === 'armed' && !BD.layerOn()) { console.error('SWEEP STOP: bonds layer off on the armed side.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64501, 64502, 64503, 64504, 64505, 64506, 64507, 64508]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-belongbonds', ARM);

// EPERM flap hardening (2026-10-19 pattern): EPERM-only retry, no data change.
function writeFileRetry(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}

// Policy composition — the bonds stack:
//   withSeatDrive(withBonds(withWinDefer(TF.belongfeast)))
// BONDS is the ONLY switch between arms (seatdrive stays ON both sides).
function policyFor() {
  const wd = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const b = BD.withBonds(wd, 'belongfeast-bonds', 'belongfeast + bonds diplomacy drive (BONDS=1)');
  return SD.withSeatDrive(b, 'belongfeast-windefer', 'belongfeast + win-side stack + seatdrive (SEATDRIVE=1)');
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };

async function runSeed(seed, days, noWrite) {
  const policy = policyFor();
  const C = { instrumentErrors: 0, hashes: [], maxRaw: 0, dayFirst200: null, snapAtMax: null,
    maxRank: 0, nationalDay: null, everTable: false, tradeTrust: [], ctx: null };
  policy.daily = ((oDaily) => (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { C.instrumentErrors++; } }
    try { C.ctx = ctx; } catch (e) {}
    try { C.hashes.push(dayOf(G) + ':' + dayHash(G)); } catch (e) {}
    try {
      const s = BD.snapBonds(G);
      if (s.raw > C.maxRaw) { C.maxRaw = s.raw; C.snapAtMax = s; }
      if (C.dayFirst200 == null && s.raw >= 200) C.dayFirst200 = dayOf(G);
      if (s.tradeActive > 0) {
        // trust trajectory of the league bonds (sense-check, sampled daily)
        const trusts = [];
        for (const l of (G.hierarchyState() || []))
          if (l && l.status === 'active' && l.kind === 'trade' && (l.a === 'haven' || l.b === 'haven'))
            trusts.push(l.trust | 0);
        C.tradeTrust.push({ d: dayOf(G), t: trusts.slice().sort((a, b) => a - b) });
      }
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      C.maxRank = Math.max(C.maxRank, RANK_ORDER[rank] == null ? 0 : RANK_ORDER[rank]);
      if ((rank === 'national' || rank === 'global') && C.nationalDay == null) C.nationalDay = dayOf(G);
      const pg = G.progState ? G.progState() : null;
      if (pg && (pg.tableWaiting || pg.tableDone)) C.everTable = true;
    } catch (e) { C.instrumentErrors++; }
    return r;
  })(policy.daily);
  const { Game } = await loadGame({ seed, mode: 'bonds-' + ARM, fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  const gameDays = dayOf(Game);
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= days ? 'survived' : (result.endReason || 'ended'));
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const ctx = C.ctx || {};
  const out = {
    seed, arm: ARM, policyId: 'belongfeast',
    substrate: 'seatdrive1-bonds',
    days: result.days, gameDays, endReason,
    won: !!Game.won,
    deaths,
    maxRank: C.maxRank, national: C.nationalDay != null ? 1 : 0, nationalDay: C.nationalDay,
    table: C.everTable ? 1 : 0,
    // PRIMARY (pre-registered): raw standing reach
    maxRaw: C.maxRaw, dayFirst200: C.dayFirst200, reached200: C.maxRaw >= 200 ? 1 : 0,
    snapAtMax: C.snapAtMax,
    // mechanism attribution (the layer's own counters + link census)
    bonds: {
      proposed: ctx.bondsProposed || 0,
      lastTarget: ctx.bondsLastTarget || null,
      lastDet: ctx.bondsLastDet != null ? ctx.bondsLastDet : null,
      lastResult: ctx.bondsLastResult || null,
      errors: ctx.bondsError || 0,
    },
    tradeTrust: C.tradeTrust,
    instrumentErrors: C.instrumentErrors | 0,
    hashes: C.hashes,
  };
  // win-track attribution: the engine's own win record
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
    const ek = pg.table && pg.table.endingKey;
    out.winTrack = ek ? { path: ek.tablePath || null, moral: ek.moral || null } : null;
    out.seatDay = ctx.sdSeatDay != null ? ctx.sdSeatDay : null;
  } catch (e) { out.winTrack = { err: String(e && e.message || e) }; }
  if (!noWrite) {
    fs.mkdirSync(EVID, { recursive: true });
    writeFileRetry(path.join(EVID, `s${seed}.json`), JSON.stringify(out) + '\n');
  }
  return out;
}

async function main() {
  if (MODE === 'det') {
    // instrument-on twice byte-identical (2 seeds x 60d) — repeatability of the arm itself
    for (const seed of [64501, 64502]) {
      const a = await runSeed(seed, 60, true);
      const b = await runSeed(seed, 60, true);
      const ha = a.hashes.join('|'), hb = b.hashes.join('|');
      console.log(`det ${ARM} seed ${seed}: ${ha === hb ? 'IDENTICAL' : 'DIVERGED'} (${a.hashes.length} days)`);
      if (ha !== hb) process.exitCode = 1;
    }
    return;
  }
  const days = MODE === 'smoke' ? 60 : daysNow();
  const seeds = MODE === 'smoke' ? SEEDS.slice(0, 2) : SEEDS;
  for (const seed of seeds) {
    const t0 = process.hrtime.bigint();
    const rec = await runSeed(seed, days, false);
    const ms = (Number(process.hrtime.bigint() - t0) / 1e9).toFixed(1);
    console.log(`${ARM} seed ${seed}: days=${rec.gameDays} end=${rec.endReason} won=${rec.won} ` +
      `maxRaw=${rec.maxRaw} reached200=${rec.reached200} proposed=${rec.bonds.proposed} ` +
      `tradeSeasoned@${JSON.stringify((rec.snapAtMax || {}).tradeSeasoned)} national=${rec.national} (${ms}s)`);
  }
  console.log(`done: ${ARM} x ${seeds.length} seeds x ${days}d -> ${EVID}`);
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP ERROR: ' + (e && e.stack || e)); process.exit(1); });
}
module.exports = { policyFor, runSeed };
