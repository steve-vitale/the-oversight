// overcourtrestage-sweep.js — LINKFORM=2 overcourt CONFIRM sweep
// (sim-overcourt-restage, axis scale-onramp, run fleshout-20261023T2015Z).
//
// Re-stage of the sim-links-diag LINKFORM=2 pilot arm with the metric-review
// revised primary (mean end dip per config; GO = armed >= baseline + 34).
//
// 12 seeds x {leadfeast, belongfeast} x {control, armed} = 48 configs,
// 180d death-aware. ONE DELTA ONLY per (seed, policy):
//   control: AV.armedFor(policy), LINKFORM unset
//   armed:   leadfeast -> LF.linkformArmedFor() (the pilot's proven armed
//            shape); belongfeast -> OCR.linkformBelongArmedFor() (the same
//            lever over the belong base); LINKFORM=2
//
// Substrate (pinned, FAIL LOUD) — identical to the pilot:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1. SUCCGRACE/RAIDDENSITY/NODEWITNESS/
//   FULLSEAT/VETREL/VGEARBEATS/SURPLUSFEED/VGEAR/WAVE4ENGAGE must be UNSET.
//
// ZERO src/js. Namespace overcourtrestage-*. Per-seed JSONs written ONCE to
// evidence/2026-10-23/perseed-overcourtrestage/<arm>-<policy>/s<seed>.json
// with hash-after-write readback (the selective write-denial class is real).
// Sweep outputs go to the worktree evidence dir, NEVER /tmp.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 ARM=control POLICY=leadfeast SEEDS=68901,68902 node scripts/overcourtrestage-sweep.js
//   ... ARM=armed POLICY=leadfeast ...   (LINKFORM=2 set by the driver)
//   ... ARM=control POLICY=belongfeast ...
//   ... ARM=armed POLICY=belongfeast ...  (LINKFORM=2 set by the driver)
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
  const ARM = process.env.ARM || 'control';
  if (!['control', 'armed'].includes(ARM)) { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
  const POLICY = process.env.POLICY || 'leadfeast';
  if (!['leadfeast', 'belongfeast'].includes(POLICY)) { console.error('SWEEP STOP: POLICY must be leadfeast|belongfeast.'); process.exit(2); }
  if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }
  return { ARM, POLICY };
}
const { ARM, POLICY } = checkEnv();

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) :
  [68901, 68902, 68903, 68904, 68905, 68906, 68907, 68908, 68909, 68910, 68911, 68912]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-overcourtrestage');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// LINKFORM is read dynamically by the policy's daily(), so one process can
// run either arm — set it per arm here. ONE DELTA ONLY.
function policyFor() {
  if (ARM === 'control') { delete process.env.LINKFORM; return AV.armedFor(POLICY); }
  process.env.LINKFORM = '2';
  return POLICY === 'leadfeast' ? LF.linkformArmedFor() : OCR.linkformBelongArmedFor();
}
function policyTag() {
  const tag = ARM === 'control'
    ? (POLICY === 'leadfeast' ? 'leadfeast-armorydrive-armorvillage' : 'belongfeast-armorydrive-armorvillage')
    : (POLICY === 'leadfeast' ? 'linkform-overcourt-armorvillage' : 'linkformbelong-overcourt-armorvillage');
  return tag;
}
function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

// hash-after-write readback: the selective write-denial class is real.
function writeVerified(p, text) {
  fs.writeFileSync(p, text);
  const back = fs.readFileSync(p, 'utf8');
  if (back !== text) { console.error(`WRITE-VERIFY FAIL: ${p} readback differs`); process.exit(3); }
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'overcourtrestage-sweep', fullTelemetry: false });
  const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [], deathRecs: [], fightStarts: [] };
  const uninstall = WS.install(Game, t);
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  const result = await quietLog(async () => { return await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  let gateVector = null, gateErr = null;
  try { gateVector = G5.gateVector(Game); } catch (e) { gateErr = String((e && e.message) || e); }

  // dip trajectory: ALL +/-34-multiple single-day steps, so formation
  // (+102/+122), dissolution (-102), and post-polity single-link seasonings
  // (+34/+68) are all attributable offline (metric-review instrument note
  // from sim-links-diag: the |step|>=102 classifier missed +34 seasonings).
  const dipSteps = [];
  for (let i = 1; i < t.window.length; i++) {
    const x = (t.window[i].raw | 0) - (t.window[i - 1].raw | 0);
    if (Math.abs(x) >= 34) dipSteps.push({ day: t.window[i].day, step: x });
  }

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
    instrument: 'overcourtrestage-sweep on killdisc-v2+windowstay+w5gates-lib',
    substrate: 'non-seat long substrate + ARMORYDRIVE=1 + ARMORVILLAGE=1 (pilot census armed leg)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1' +
      (ARM === 'armed' ? ' LINKFORM=2' : ''),
    anchorCommit: ANCHOR,
    national, table, won, w4Day, w5Day,
    days: result.days, gameDays, endReason: result.endReason,
    maxWave: result.maxWaveUnlocked || 1,
    deaths, nDeathRows: (result.samples.deaths || []).length,
    gateVector, gateErr,
    dipSteps,
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
  console.log(`overcourtrestage-sweep ${label}: arm=${ARM} policy=${POLICY} seeds=${seeds.join(',')}`);
  for (const seed of seeds) {
    const t0 = Date.now();
    try {
      const { out: r, sha } = await oneRun(seed);
      const gv = r.gateVector || {};
      rows.push(r);
      console.log(`done ${r.policyId} s${seed}: end=${r.endReason} days=${r.gameDays} dip=${gv.dip} links=${gv.links} national=${r.national} dipSteps=${JSON.stringify(r.dipSteps)} errs=${r.instrumentErrors.length} sha=${sha} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
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
      instrument: 'overcourtrestage-sweep', arm: ARM, policy: POLICY, n: ok.length, errors: rows.length - ok.length,
      meanEndDip: ok.length ? ok.reduce((a, r) => a + (((r.gateVector || {}).dip | 0)), 0) / ok.length : null,
      national: ok.reduce((a, r) => a + (r.national | 0), 0),
      totalInstrumentErrors: ok.reduce((a, r) => a + (r.instrumentErrors || []).length, 0),
    }, null, 1));
    writeVerified(path.join(EVID, `corpus-summary-${ARM}-${POLICY}.json`),
      JSON.stringify({
        arm: ARM, policy: POLICY, anchor: ANCHOR, n: ok.length, errors: rows.length - ok.length,
        runs: rows.map(r => ({ seed: r.seed, policyId: r.policyId, dip: (r.gateVector || {}).dip | 0, links: (r.gateVector || {}).links | 0, national: r.national | 0, dipSteps: r.dipSteps || [] })),
      }, null, 1) + '\n');
  })().catch(e => { console.error(e && e.stack || e); process.exit(1); });
}
