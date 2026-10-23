#!/usr/bin/env node
// diag-vetbaseline-bisect-20261023.js — DIAG runner for the veterans-channel
// baseline bisect (arm sim-vetbaseline-bisect, convergence backlog #829).
//
// Runs the splitclose CONTROL corpus (the drifting baseline) at an arbitrary
// commit of the repo tree and reports kill-time villager wave-4 kills plus
// wall numbers. The corpus definition is the DRIFT corpus from
// evidence/2026-10-22/sim-splitclose.md:
//   8 seeds (65611-65618) x {leadfeast, belongfeast} x {control} = 16 configs
//   180d death-aware, pre-seat armorydrive substrate:
//     FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//     ARMORYDRIVE=1 KILLDISC=1 (SPLITCLOSE unset)
//   control = SC.controlFor = AD.armedFor
//
// The sweep itself is scripts/sweep-splitclose-20261022.js AT THE TARGET
// COMMIT (run with REPO=<tree>); this runner is kept OUTSIDE the tree so it
// survives `git checkout <commit>` of the tree under test. The kill census
// is the pre-registered rule copied VERBATIM from
// scripts/analyze-splitclose-20261022.js (villagerKills) — the canonical
// killtime census; vetbisect adds no new kill semantics.
//
// Usage (env-trap lesson: run EXACTLY per this env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 \
//   node diag-vetbaseline-bisect-20261023.js --tree <repo-tree> --out <dir> [--commit <sha>]
//
//   --out must not exist or must be empty (the sweep SKIPS existing files;
//   a rerun into a populated dir would silently reuse stale results).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');

const SEEDS = [65611, 65612, 65613, 65614, 65615, 65616, 65617, 65618];
const POLICIES = ['leadfeast', 'belongfeast'];
const SUBSTRATE_FLAGS = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC'];
const FORBIDDEN_FLAGS = ['SPLITCLOSE', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE', 'FEASTDISC'];

function usage(msg) {
  if (msg) console.error('VETBISECT STOP: ' + msg);
  console.error('Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 ARMORYDRIVE=1 KILLDISC=1');
  console.error('  node diag-vetbaseline-bisect-20261023.js --tree <repo-tree> --out <dir> [--commit <sha>]');
  process.exit(2);
}
function arg(name) {
  const i = process.argv.indexOf(name);
  return (i >= 0 && i + 1 < process.argv.length) ? process.argv[i + 1] : null;
}
const TREE = arg('--tree');
const OUT = arg('--out');
const COMMIT = arg('--commit');
if (!TREE || !OUT) usage('need --tree and --out');

// Env guard (mirrors the sweep's guard; the env-trap lesson).
for (const k of SUBSTRATE_FLAGS) {
  if (process.env[k] !== '1') usage(`${k}=1 is required (pre-seat armorydrive substrate).`);
}
if (process.env.SEATDRIVE !== '0') usage('SEATDRIVE=0 is required (non-seat substrate).');
for (const k of FORBIDDEN_FLAGS) {
  if (k in process.env) usage(`${k} must be unset (pinned substrate, nothing else).`);
}

// EPERM-flap-hardened append (finding #621 pattern).
function appendFlap(fp, data) {
  let last = null;
  for (let i = 0; i < 12; i++) {
    try { fs.appendFileSync(fp, data); return; }
    catch (e) {
      last = e;
      if (/EPERM/i.test(String((e && e.code) || '') + String((e && e.message) || ''))) { execSync('sleep 20'); continue; }
      throw e;
    }
  }
  throw last;
}

if (!fs.existsSync(TREE) || !fs.statSync(TREE).isDirectory()) usage('tree not a directory: ' + TREE);
if (fs.existsSync(OUT) && fs.readdirSync(OUT).length > 0) usage('out dir must not exist or must be empty: ' + OUT);
fs.mkdirSync(OUT, { recursive: true });

let prevHead = null;
try { prevHead = execSync('git rev-parse HEAD', { cwd: TREE }).toString().trim(); } catch (e) {}
if (COMMIT) {
  console.log(`VETBISECT: checking out ${COMMIT} in ${TREE}`);
  try {
    execSync(`git checkout ${COMMIT}`, { cwd: TREE, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    console.error('VETBISECT FAIL: git checkout failed: ' + ((e && e.message) || e));
    process.exit(1);
  }
}
let head = null;
try { head = execSync('git rev-parse HEAD', { cwd: TREE }).toString().trim(); } catch (e) {}
if (COMMIT && !head.startsWith(COMMIT)) {
  console.error(`VETBISECT FAIL: HEAD ${head} does not start with ${COMMIT}`);
  process.exit(1);
}
const HEAD12 = (head || 'unknown').slice(0, 12);

// The sweep + its runtime inputs must exist at the target commit.
const need = [
  'scripts/sweep-splitclose-20261022.js',
  'scripts/sim-harness.js',
  'scripts/policies/armorydrive.js',
  'scripts/policies/splitclose.js',
  'scripts/killdisc-instrument-20261021.js',
];
for (const f of need) {
  if (!fs.existsSync(path.join(TREE, f))) {
    console.error(`VETBISECT FAIL: missing at ${HEAD12}: ${f}`);
    process.exit(1);
  }
}

console.log(`VETBISECT: corpus at ${HEAD12} (prev ${prevHead ? prevHead.slice(0, 12) : 'n/a'}) -> ${OUT}`);
const childEnv = Object.assign({}, process.env, {
  REPO: TREE,
  EVID: OUT,
  ARM: 'control',
  SEEDS: SEEDS.join(','),
  POLICIES: POLICIES.join(','),
});
const t0 = Date.now();
const r = spawnSync('node', [path.join(TREE, 'scripts', 'sweep-splitclose-20261022.js')],
  { env: childEnv, stdio: 'inherit', timeout: 25 * 60 * 1000 });
if (r.error) {
  console.error('VETBISECT FAIL: sweep spawn error: ' + (r.error.message || r.error));
  process.exit(1);
}
if (r.status !== 0) {
  console.error(`VETBISECT FAIL: sweep exited ${r.status}${r.signal ? ' signal=' + r.signal : ''}`);
  process.exit(1);
}
console.log(`VETBISECT: sweep done in ${Math.round((Date.now() - t0) / 1000)}s`);

// Kill-time census: the CANONICAL pre-registered rule, copied VERBATIM from
// scripts/analyze-splitclose-20261022.js (function villagerKills — the judge
// for sim-splitclose: waveKillLog w=4, by != bearerAtKill, by != 'player').
// vetbisect reuses the splitclose killtime census; no new kill semantics.
function vetbisectVillagerKills(rec) {
  return (rec.w4killsDetail || []).filter(e => e.by && e.by !== 'player' && e.by !== e.bearerAtKill);
}
function sha256File(fp) {
  return crypto.createHash('sha256').update(fs.readFileSync(fp)).digest('hex');
}
function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const perSeed = {};
let total = 0, seedsWith = 0;
const wall = { national: 0, table: 0, won: 0, wave4: 0, wave5: 0, exiled: 0 };
const surv = [];
const hashes = {};
let missing = 0;
for (const p of POLICIES) {
  for (const seed of SEEDS) {
    const fn = `control-${p}-s${seed}.json`;
    const fp = path.join(OUT, fn);
    if (!fs.existsSync(fp)) { console.error('VETBISECT FAIL: missing sweep output: ' + fn); missing++; continue; }
    hashes[fn] = sha256File(fp);
    const rec = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const kills = vetbisectVillagerKills(rec);
    perSeed[`${p}/s${seed}`] = kills.length;
    total += kills.length;
    if (kills.length > 0) seedsWith++;
    if (rec.national) wall.national++;
    if (rec.table) wall.table++;
    if (rec.won) wall.won++;
    if (rec.wave4) wall.wave4++;
    if (rec.wave5) wall.wave5++;
    if (rec.exiled) wall.exiled++;
    surv.push(rec.gameDays || 0);
  }
}
if (missing) process.exit(1);
wall.medSurv = median(surv);
wall.maxSurv = Math.max(...surv);

console.log('\nVETBISECT census (control, kill-time villager wave-4 kills):');
for (const p of POLICIES) {
  const row = SEEDS.map(s => `${s}:${perSeed[`${p}/s${s}`]}`).join(' ');
  console.log(`  ${p}: ${row}`);
}
console.log(`  TOTAL=${total}  seedsWith>=1=${seedsWith}/8`);
console.log(`  WALL national=${wall.national} table=${wall.table} won=${wall.won} wave4=${wall.wave4}/16 wave5=${wall.wave5}/16 exiled=${wall.exiled} medSurv=${wall.medSurv} maxSurv=${wall.maxSurv}`);

const ledgerLine = JSON.stringify({
  ts: new Date().toISOString(), commit: HEAD12, prevCommit: prevHead ? prevHead.slice(0, 12) : null,
  out: OUT, total, seedsWith, perSeed, wall, hashes,
}) + '\n';
appendFlap(path.join(OUT, 'ledger.jsonl'), ledgerLine);
console.log(`\nVETBISECT_RESULT commit=${HEAD12} total=${total} seedsWith=${seedsWith}/8 out=${OUT}`);
