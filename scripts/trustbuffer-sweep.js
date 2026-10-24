// trustbuffer-sweep.js — TRUSTBUFFER=1 depth-lever sweep
// (sim-trustbuffer, axis scale-onramp, run fleshout-20261023T2217Z; claims
// sim-findings.md #857).
//
// 12 seeds x {leadfeast, belongfeast} x {control, armed} = 48 configs,
// 180d death-aware. ONE DELTA ONLY per (seed, policy):
//   control: LF.linkformArmedFor() / OCR.linkformBelongArmedFor(),
//            LINKFORM=2, TRUSTBUFFER unset (the overcourt-restage armed leg)
//   armed:   TB.trustbufferArmedFor() / TB.trustbufferBelongArmedFor(),
//            LINKFORM=2 + TRUSTBUFFER=1 (same courtship, tending targets the
//            50+ trust band — trust < 58 tended whenever the pantry affords
//            it above the survival floor)
//
// Substrate (pinned, FAIL LOUD) — the overcourt-restage census-armed base:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1. SUCCGRACE/RAIDDENSITY/NODEWITNESS/
//   FULLSEAT/VETREL/VGEARBEATS/SURPLUSFEED/VGEAR/WAVE4ENGAGE must be UNSET.
//   LINKFORM=2 required on BOTH arms; TRUSTBUFFER=1 armed only.
//
// ZERO src/js. Namespace trustbuffer-*. Per-seed JSONs written ONCE to
// evidence/2026-10-23/perseed-trustbuffer/<arm>-<policy>/s<seed>.json with
// hash-after-write readback (the selective write-denial class is real).
// Sweep outputs go to the worktree evidence dir, NEVER /tmp.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 LINKFORM=2 ARM=control POLICY=leadfeast SEEDS=69001,69002 node scripts/trustbuffer-sweep.js
//   ... ARM=armed POLICY=leadfeast ...   (TRUSTBUFFER=1 set by the driver)
//   ... ARM=control POLICY=belongfeast ...
//   ... ARM=armed POLICY=belongfeast ... (TRUSTBUFFER=1 set by the driver)
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const LF = require(path.join(REPO, 'scripts', 'policies', 'linkform'));
const OCR = require(path.join(REPO, 'scripts', 'policies', 'overcourtrestage'));
const TB = require(path.join(REPO, 'scripts', 'policies', 'trustbuffer'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));

function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required.'); process.exit(2); }
  for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'SURPLUSFEED', 'VGEAR', 'WAVE4ENGAGE']) {
    if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate).`); process.exit(2); }
  }
  // LINKFORM=2 on BOTH arms (control = the overcourt-restage armed leg).
  if (process.env.LINKFORM !== '2') { console.error('SWEEP STOP: LINKFORM=2 is required on both arms.'); process.exit(2); }
  const ARM = process.env.ARM || 'control';
  if (!['control', 'armed'].includes(ARM)) { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
  if (ARM === 'armed' && process.env.TRUSTBUFFER !== '1') { console.error('SWEEP STOP: armed requires TRUSTBUFFER=1.'); process.exit(2); }
  if (ARM === 'control' && ('TRUSTBUFFER' in process.env)) { console.error('SWEEP STOP: TRUSTBUFFER must be unset on control.'); process.exit(2); }
  const POLICY = process.env.POLICY || 'leadfeast';
  if (!['leadfeast', 'belongfeast'].includes(POLICY)) { console.error('SWEEP STOP: POLICY must be leadfeast|belongfeast.'); process.exit(2); }
  if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }
  return { ARM, POLICY };
}
const { ARM, POLICY } = checkEnv();

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) :
  [69001, 69002, 69003, 69004, 69005, 69006, 69007, 69008, 69009, 69010, 69011, 69012]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-trustbuffer');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// TRUSTBUFFER is read dynamically by the policy's daily(), so one process
// can run either arm — set it per arm here. ONE DELTA ONLY.
function policyFor() {
  if (ARM === 'control') { delete process.env.TRUSTBUFFER; return POLICY === 'leadfeast' ? LF.linkformArmedFor() : OCR.linkformBelongArmedFor(); }
  process.env.TRUSTBUFFER = '1';
  return POLICY === 'leadfeast' ? TB.trustbufferArmedFor() : TB.trustbufferBelongArmedFor();
}
function policyTag() {
  const tag = ARM === 'control'
    ? (POLICY === 'leadfeast' ? 'linkform-overcourt-armorvillage' : 'linkformbelong-overcourt-armorvillage')
    : (POLICY === 'leadfeast' ? 'trustbuffer-overcourt-armorvillage' : 'trustbufferbelong-overcourt-armorvillage');
  return tag;
}
function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

// hash-after-write readback: the selective write-denial class is real.
// EPERM-RETRY (2026-10-24): this container flaps EPERM on file writes
// intermittently (same class as the 2026-10-23 .git-write flap) — retry a
// few times before failing loud, so a write flap doesn't nuke a finished
// sim's per-seed JSON.
function writeVerified(p, text) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      fs.writeFileSync(p, text);
      const back = fs.readFileSync(p, 'utf8');
      if (back !== text) throw new Error('readback differs');
      return crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
    } catch (e) {
      lastErr = e;
      if (attempt < 12) {
        const wait = 2000 * attempt;
        const t0 = Date.now();
        while (Date.now() - t0 < wait) { /* back off */ }
      }
    }
  }
  console.error(`WRITE-VERIFY FAIL after retries: ${p}: ${lastErr && lastErr.message}`);
  process.exit(3);
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'trustbuffer-sweep', fullTelemetry: false });
  const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [], deathRecs: [], fightStarts: [] };
  const uninstall = WS.install(Game, t);
  await setupGame(Game);
  const hashes = [];
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      lastCtx = ctx;
      return policy.daily(Gm, ctx);
    },
  });
  const result = await quietLog(async () => { return await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  let gateVector = null, gateErr = null;
  try { gateVector = G5.gateVector(Game); } catch (e) { gateErr = String((e && e.message) || e); }

  // dip trajectory: ALL +/-34-multiple single-day steps, so formation
  // (+102/+122), dissolution (-102/-136), and post-polity single-link
  // seasonings (+34/+68) are all attributable offline.
  const dipSteps = [];
  for (let i = 1; i < t.window.length; i++) {
    const x = (t.window[i].raw | 0) - (t.window[i - 1].raw | 0);
    if (Math.abs(x) >= 34) dipSteps.push({ day: t.window[i].day, step: x });
  }

  // mechanism-engagement read: tend counts from the policy ctx.
  // control: ctx.tended (linkformCourtship's weekly loop). armed: + ctx.trustbufferTended (the buffer delta).
  const tended = (lastCtx && lastCtx.tended) | 0;
  const bufferTended = (lastCtx && lastCtx.trustbufferTended) | 0;

  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let w4Day = null, w5Day = null;
  try { const gv = gateVector || {}; w4Day = gv.w4Day != null ? gv.w4Day : null; w5Day = gv.w5Day != null ? gv.w5Day : null; } catch (e) {}
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const st = Game.state || {};
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  const out = {
    seed, arm: ARM, policy: POLICY, policyId: policyTag(),
    instrument: 'trustbuffer-sweep on killdisc-v2+windowstay+w5gates-lib',
    substrate: 'non-seat long substrate + ARMORYDRIVE=1 + ARMORVILLAGE=1 (overcourt-restage census-armed base)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 LINKFORM=2' +
      (ARM === 'armed' ? ' TRUSTBUFFER=1' : ''),
    anchorCommit: ANCHOR,
    national, table, won, w4Day, w5Day,
    days: result.days, gameDays, endReason: result.endReason,
    maxWave: result.maxWaveUnlocked || 1,
    deaths, nDeathRows: (result.samples.deaths || []).length,
    gateVector, gateErr,
    dipSteps,
    tended, bufferTended,
    nWindowTraceDays: t.window.length,
    window: t.window,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, `${ARM}-${POLICY}`);
  fs.mkdirSync(dir, { recursive: true });
  const sha = writeVerified(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return { out, sha };
}

async function runPhase(label, seeds) {
  const rows = [];
  console.log(`trustbuffer-sweep ${label}: arm=${ARM} policy=${POLICY} seeds=${seeds.join(',')}`);
  for (const seed of seeds) {
    const t0 = Date.now();
    try {
      const { out: r, sha } = await oneRun(seed);
      const gv = r.gateVector || {};
      rows.push(r);
      console.log(`done ${r.policyId} s${seed}: end=${r.endReason} days=${r.gameDays} dip=${gv.dip} links=${gv.links} national=${r.national} tended=${r.tended}+${r.bufferTended} dipSteps=${JSON.stringify(r.dipSteps)} errs=${r.instrumentErrors.length} sha=${sha} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } catch (e) {
      console.error(`ERROR ${ARM} ${POLICY} s${seed}: ${e && e.message}`);
      rows.push({ seed, arm: ARM, policy: POLICY, error: String(e && e.message) });
    }
  }
  return rows;
}

module.exports = { checkEnv, policyFor, policyTag, ANCHOR };

if (require.main === module) {
  (async () => {
    const rows = await runPhase('sweep', SEEDS);
    const ok = rows.filter(r => !r.error);
    console.log(`sweep done: arm=${ARM} policy=${POLICY} n=${ok.length} errors=${rows.length - ok.length}`);
    console.log(JSON.stringify({
      instrument: 'trustbuffer-sweep', arm: ARM, policy: POLICY, n: ok.length, errors: rows.length - ok.length,
      meanEndDip: ok.length ? ok.reduce((a, r) => a + (((r.gateVector || {}).dip | 0)), 0) / ok.length : null,
      national: ok.reduce((a, r) => a + (r.national | 0), 0),
      totalInstrumentErrors: ok.reduce((a, r) => a + (r.instrumentErrors || []).length, 0),
      meanTended: ok.length ? ok.reduce((a, r) => a + (r.tended | 0), 0) / ok.length : null,
      meanBufferTended: ok.length ? ok.reduce((a, r) => a + (r.bufferTended | 0), 0) / ok.length : null,
    }, null, 1));
    writeVerified(path.join(EVID, `corpus-summary-${ARM}-${POLICY}.json`),
      JSON.stringify({
        arm: ARM, policy: POLICY, anchor: ANCHOR, n: ok.length, errors: rows.length - ok.length,
        runs: rows.map(r => ({ seed: r.seed, policyId: r.policyId, dip: (r.gateVector || {}).dip | 0, links: (r.gateVector || {}).links | 0, national: r.national | 0, tended: r.tended | 0, bufferTended: r.bufferTended | 0, dipSteps: r.dipSteps || [] })),
      }, null, 1) + '\n');
  })().catch(e => { console.error(e && e.stack || e); process.exit(1); });
}
