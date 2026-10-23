// diag-linksdiag-pilot.js — link-formation lever pilot (sim-links-diag,
// axis scale-onramp, run fleshout-20261023T1015Z).
//
// PHASE 2 of the sim-links-diag DIAG: the offline DIAG named two leverable
// policy-side channels (see evidence/2026-10-23/sim-links-diag.md):
//   arm cadence   (LINKFORM=1): courtship cadence — propose from day 15 (was
//     25), 2 proposals/day (was 1), tend every 3 days (was weekly), always
//     sweeten counters (was only-when-rich). Attacks the 4 long-survivor
//     census configs (d144-180) that formed ZERO links.
//   arm overcourt (LINKFORM=2): court to 5 subordinate links (was stop-at-3).
//     Attacks the 8 census dissolution events (-102 steps, incl. armed
//     s65518's 4x form/dissolve loop): redundancy so one link dipping below
//     the trust-40 bar no longer dissolves the polity.
//
// Three legs on IDENTICAL seeds (8 seeds, pilot gate §§9-12):
//   baseline  = AV.armedFor('leadfeast'), LINKFORM unset (the census armed config)
//   cadence   = LF.linkformArmedFor(), LINKFORM=1
//   overcourt = LF.linkformArmedFor(), LINKFORM=2
//
// Substrate (pinned, FAIL LOUD) — identical to the census armed leg:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1. SUCCGRACE/RAIDDENSITY/NODEWITNESS/
//   FULLSEAT/VETREL/VGEARBEATS/SURPLUSFEED/VGEAR/WAVE4ENGAGE must be UNSET.
//
// ZERO src/js. Namespace linksdiag-* (disjoint from sibling loop-B arms and
// from sim-vetretention-restage/sim-vetstack: linkform-*/linksdiag-* only).
// Per-seed JSONs written ONCE to
// evidence/2026-10-23/perseed-linksdiag-pilot/{baseline,cadence,overcourt}/s<seed>.json.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 ARM=baseline SEEDS=68401,68402 node scripts/diag-linksdiag-pilot.js
//   ... ARM=cadence ...   (LINKFORM=1 set by the driver)
//   ... ARM=overcourt ... (LINKFORM=2 set by the driver)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const LF = require(path.join(REPO, 'scripts', 'policies', 'linkform'));
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
  const ARM = process.env.ARM || 'baseline';
  if (!['baseline', 'cadence', 'overcourt'].includes(ARM)) { console.error('SWEEP STOP: ARM must be baseline|cadence|overcourt.'); process.exit(2); }
  if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }
  return ARM;
}
const ARM = checkEnv();

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [68401, 68402, 68403, 68404, 68405, 68406, 68407, 68408]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-linksdiag-pilot');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// LINKFORM is read dynamically by the policy's daily(), so one process can
// run all three arms — set it per arm here.
function policyFor() {
  if (ARM === 'baseline') { delete process.env.LINKFORM; return AV.armedFor('leadfeast'); }
  if (ARM === 'cadence') { process.env.LINKFORM = '1'; return LF.linkformArmedFor(); }
  process.env.LINKFORM = '2'; return LF.linkformArmedFor();
}
function policyTag() {
  return ARM === 'baseline' ? 'leadfeast-armorydrive-armorvillage'
    : ARM === 'cadence' ? 'linkform-cadence-armorvillage' : 'linkform-overcourt-armorvillage';
}
function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'linksdiag-pilot', fullTelemetry: false });
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

  // dip trajectory: per-day raw steps, so formation (+102/+122) and
  // dissolution (-102) events are attributable offline exactly as in the DIAG.
  const dipSteps = [];
  for (let i = 1; i < t.window.length; i++) {
    const x = (t.window[i].raw | 0) - (t.window[i - 1].raw | 0);
    if (Math.abs(x) >= 102) dipSteps.push({ day: t.window[i].day, step: x });
  }

  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
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
    seed, arm: ARM, policyId: policyTag(),
    instrument: 'linksdiag-pilot on killdisc-v2+windowstay+w5gates-lib',
    substrate: 'non-seat long substrate + ARMORYDRIVE=1 + ARMORVILLAGE=1 (census armed leg)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1' +
      (ARM === 'cadence' ? ' LINKFORM=1' : ARM === 'overcourt' ? ' LINKFORM=2' : ''),
    anchorCommit: ANCHOR,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    maxWave: result.maxWaveUnlocked || 1,
    deaths, nDeathRows: (result.samples.deaths || []).length,
    gateVector, gateErr,
    dipSteps,
    nWindowTraceDays: t.window.length,
    window: t.window,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, ARM);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return out;
}

async function runPhase(label, seeds) {
  const rows = [];
  console.log(`linksdiag-pilot ${label}: arm=${ARM} seeds=${seeds.join(',')}`);
  for (const seed of seeds) {
    const t0 = Date.now();
    try {
      const r = await oneRun(seed);
      const gv = r.gateVector || {};
      rows.push(r);
      console.log(`done ${r.policyId} s${seed}: end=${r.endReason} days=${r.gameDays} dip=${gv.dip} links=${gv.links} national=${r.national} dipSteps=${JSON.stringify(r.dipSteps)} errs=${r.instrumentErrors.length} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } catch (e) {
      console.error(`ERROR ${ARM} s${seed}: ${e && e.message}`);
      rows.push({ seed, arm: ARM, error: String(e && e.message) });
    }
  }
  return rows;
}

module.exports = { checkEnv, policyFor, policyTag, ANCHOR };

if (require.main === module) {
  (async () => {
    const rows = await runPhase('pilot', SEEDS);
    const ok = rows.filter(r => !r.error);
    console.log(`pilot done: arm=${ARM} n=${ok.length} errors=${rows.length - ok.length}`);
    console.log(JSON.stringify({
      instrument: 'linksdiag-pilot', arm: ARM, n: ok.length, errors: rows.length - ok.length,
      formed: ok.filter(r => (r.dipSteps || []).some(s => s.step > 0)).length,
      endDipGe68: ok.filter(r => ((r.gateVector || {}).dip | 0) >= 68).length,
      national: ok.reduce((a, r) => a + (r.national | 0), 0),
      totalInstrumentErrors: ok.reduce((a, r) => a + (r.instrumentErrors || []).length, 0),
    }, null, 1));
    fs.writeFileSync(path.join(EVID, `corpus-summary-${ARM}.json`),
      JSON.stringify({
        arm: ARM, anchor: ANCHOR, n: ok.length, errors: rows.length - ok.length,
        runs: rows.map(r => ({ seed: r.seed, policyId: r.policyId, dip: (r.gateVector || {}).dip | 0, links: (r.gateVector || {}).links | 0, national: r.national | 0, dipSteps: r.dipSteps || [] })),
      }, null, 1) + '\n');
  })().catch(e => { console.error(e && e.stack || e); process.exit(1); });
}
