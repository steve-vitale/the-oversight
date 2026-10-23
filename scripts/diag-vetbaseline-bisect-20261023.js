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
// The sweep itself is scripts/sweep-splitclose-20261022.js AT THE BRANCH TIP
// (REPO=<tree>); this runner is kept OUTSIDE the tree so it survives worktree
// changes. The GAME CODE under test is varied per commit via pathspec
// checkout (src/js + src/data + index.html only — the harness builds its
// script list by grepping index.html, so the script list must move with
// src/js). scripts/ (sweep, instrument, policies, harness, this runner's
// committed copy) stays at tip: the measurement is held CONSTANT across
// the bisect and only the game varies. This is required because the sweep
// script did not exist at the window's endpoints (added in f5a51a496,
// after f2daadf3d) — a full-tree detached checkout cannot run it there.
// The kill census is the pre-registered rule copied VERBATIM from
// scripts/analyze-splitclose-20261022.js (villagerKills) — the canonical
// killtime census; vetbisect adds no new kill semantics.
//
// Usage (env-trap lesson: run EXACTLY per this env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 \
//   node diag-vetbaseline-bisect-20261023.js --tree <repo-tree> --out <dir> [--commit <sha>] [--restore]
//
//   --commit <sha>: check out src/js+src/data+index.html at <sha> (HEAD never
//     moves; the branch is untouched).
//   --restore: restore src/js+src/data+index.html to HEAD and exit.
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
const RESTORE = process.argv.includes('--restore');
if (!TREE || (!OUT && !RESTORE)) usage('need --tree and --out (or --restore)');

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

// --restore: put the game paths back to HEAD and exit (HEAD never moves).
if (RESTORE) {
  try {
    execSync('git checkout HEAD -- src/js src/data index.html', { cwd: TREE, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    console.error('VETBISECT FAIL: restore failed: ' + ((e && e.message) || e));
    process.exit(1);
  }
  const dirty = execSync('git diff HEAD --stat -- src/js src/data index.html', { cwd: TREE }).toString().trim();
  if (dirty) { console.error('VETBISECT FAIL: restore left a diff vs HEAD:\n' + dirty); process.exit(1); }
  console.log('VETBISECT: game paths restored to HEAD');
  process.exit(0);
}

if (fs.existsSync(OUT) && fs.readdirSync(OUT).length > 0) usage('out dir must not exist or must be empty: ' + OUT);
fs.mkdirSync(OUT, { recursive: true });

const GAME_PATHS = 'src/js src/data index.html';
let headTip = null;
try { headTip = execSync('git rev-parse HEAD', { cwd: TREE }).toString().trim(); } catch (e) {}
if (COMMIT) {
  console.log(`VETBISECT: checking out game paths at ${COMMIT} in ${TREE} (HEAD stays at ${(headTip || '').slice(0, 12)})`);
  try {
    execSync(`git checkout ${COMMIT} -- ${GAME_PATHS}`, { cwd: TREE, stdio: ['ignore', 'pipe', 'pipe'] });
    // checkout -- <paths> does NOT delete files that exist at HEAD but not
    // at <sha> (e.g. src/js/text.js added mid-window). The harness builds
    // its script list from index.html (also checked out), so leftovers are
    // never loaded — but remove them anyway so the worktree matches <sha>
    // exactly for the game paths.
    const added = execSync(`git diff --name-only --diff-filter=A ${COMMIT} HEAD -- ${GAME_PATHS}`, { cwd: TREE })
      .toString().trim().split('\n').map(s => s.trim()).filter(Boolean);
    for (const f of added) {
      fs.rmSync(path.join(TREE, f), { force: true });
    }
    if (added.length) console.log(`VETBISECT: removed ${added.length} post-${COMMIT.slice(0, 12)} game files (${added.join(', ')})`);
  } catch (e) {
    console.error('VETBISECT FAIL: game-paths checkout failed: ' + ((e && e.message) || e));
    process.exit(1);
  }
  // Verify the worktree game paths match the target commit exactly.
  const diff = execSync(`git diff ${COMMIT} --stat -- ${GAME_PATHS}`, { cwd: TREE }).toString().trim();
  if (diff) {
    console.error(`VETBISECT FAIL: game paths do not match ${COMMIT} after checkout:\n` + diff);
    process.exit(1);
  }
}
const GAME12 = COMMIT ? COMMIT.slice(0, 12) : 'tip-' + (headTip || 'unknown').slice(0, 12);
const HEAD12 = (headTip || 'unknown').slice(0, 12);

// The sweep + its runtime inputs live at the branch tip (HEAD never moves).
const need = [
  'scripts/sweep-splitclose-20261022.js',
  'scripts/sim-harness.js',
  'scripts/policies/armorydrive.js',
  'scripts/policies/splitclose.js',
  'scripts/killdisc-instrument-20261021.js',
];
for (const f of need) {
  if (!fs.existsSync(path.join(TREE, f))) {
    console.error(`VETBISECT FAIL: missing at tip: ${f}`);
    process.exit(1);
  }
}

console.log(`VETBISECT: corpus with game=${GAME12} measurement=tip-${HEAD12} -> ${OUT}`);
const childEnv = Object.assign({}, process.env, {
  REPO: TREE,
  EVID: OUT,
  ARM: 'control',
  SEEDS: SEEDS.join(','),
  POLICIES: POLICIES.join(','),
});
const t0 = Date.now();
const r = spawnSync('node', [path.join(TREE, 'scripts', 'sweep-splitclose-20261022.js')],
  { env: childEnv, stdio: 'inherit', timeout: 100 * 60 * 1000 });
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
  ts: new Date().toISOString(),
  gameCommit: COMMIT || null, game12: GAME12,
  measureCommit: HEAD12,
  out: OUT, total, seedsWith, perSeed, wall, hashes,
}) + '\n';
appendFlap(path.join(OUT, 'ledger.jsonl'), ledgerLine);
console.log(`\nVETBISECT_RESULT game=${GAME12} measure=tip-${HEAD12} total=${total} seedsWith=${seedsWith}/8 out=${OUT}`);
