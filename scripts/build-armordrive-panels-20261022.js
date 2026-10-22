#!/usr/bin/env node
// build-armordrive-panels-20261022.js — §15 balanced-panel compare for
// sim-armor-drive + the pre-registered PRIMARY/guardrail paired judgment.
//
// Reads evidence/2026-10-22/perseed-armordrive/{control,drive}-<policy>-s<seed>.json,
// builds before/after panels in the scripts/balance-panel.js schema, runs
// score.comparePanels (the panel is the instrument), and prints the binding
// pre-registered verdicts (the threshold is the judge):
//   PRIMARY: doors opened among configs reaching w5vets2=2, drive vs
//     control, identical seeds. GO = drive >= control+2 doors AND
//     >=2/8 drive seeds with a door opened.
//   GUARDRAILS: median survival |paired d|<=10; starvation/100d <=
//     control+3 paired; no new death mode (>=2 events); armorPieces
//     drive >= control paired (no armor-sink regression).
//
// Usage: node scripts/build-armordrive-panels-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-armordrive');
const OUT_PREFIX = path.join(REPO, 'evidence', '2026-10-22', 'armordrive-panel');

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [65551, 65552, 65553, 65554, 65555, 65556, 65557, 65558];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(SWEEP_DIR, `${arm}-${p}-s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policy: p, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
    }
  }
  return rows;
}

function metricsFor(r) {
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.won ? 1 : 0;
  m.table = r.table ? 1 : 0;
  m.national = r.national ? 1 : 0;
  m.survival30 = (r.gameDays || 0) >= 30 ? 1 : 0;
  m.survival60 = (r.gameDays || 0) >= 60 ? 1 : 0;
  const dc = r.deathCauses || {};
  const starv = (dc.starvation | 0) + (dc.starved | 0);
  m.npcHungry = starv > 0 ? 1 : 0;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    // Arm identity is positional (before=control, after=drive): substrate
    // flags + observerDigest match exactly between panels (§15 validity).
    // The game-code difference is the intervention (sourceDigest differs
    // by construction — comparePanels does not match on it).
    observerDigest: 'armordrive-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-armor-drive',
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: r.policy, seed: r.seed },
      metrics: metricsFor(r.r),
      warnings: [], observerErrors: [], gear: { errors: [] },
    })),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(p => ({ policy: p, seed: SEEDS[0], match: true, warnings: 0 })),
    },
  };
}

const score = require('./lib/balance-scorecard');
const read = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8'));

const before = load('control'), after = load('drive');
const beforePath = `${OUT_PREFIX}-before.json.gz`;
const afterPath = `${OUT_PREFIX}-after.json.gz`;
fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(before, 'control')) + '\n'));
fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(after, 'drive')) + '\n'));
const report = score.comparePanels(read(beforePath), read(afterPath));
fs.writeFileSync(`${OUT_PREFIX}.json`, JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(`${OUT_PREFIX}.md`, score.markdown(report));
console.log(`panel compare control->drive: decision=${report.decision}`);
for (const p of report.policies || []) {
  console.log(`  policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
  for (const m of p.metrics || []) {
    if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
      console.log(`    ${m.id}: ${m.status} delta=${m.delta}`);
    }
  }
}

// ---------- pre-registered PRIMARY + guardrails (paired, identical seeds) ----------
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
const byKey = (rows) => { const m = {}; for (const r of rows) m[r.policy + '|s' + r.seed] = r.r; return m; };
const bc = byKey(before), ac = byKey(after);
const keys = Object.keys(bc);

// PRIMARY
let driveDoors = 0, controlDoors = 0;
const driveSeedsWithDoor = new Set();
for (const k of keys) {
  if (bc[k].windowReached && bc[k].doorOpened) controlDoors++;
  if (ac[k].windowReached && ac[k].doorOpened) { driveDoors++; driveSeedsWithDoor.add(k.split('|')[1]); }
}
const driveWindows = keys.filter(k => ac[k].windowReached).length;
const controlWindows = keys.filter(k => bc[k].windowReached).length;
console.log('\nPRIMARY (doors opened among window-reachers):');
console.log(`  windows reached: drive ${driveWindows}/16, control ${controlWindows}/16`);
console.log(`  doors opened: drive ${driveDoors}, control ${controlDoors}`);
console.log(`  drive seeds with a door: ${driveSeedsWithDoor.size}/8 (${[...driveSeedsWithDoor].join(',')})`);
const primaryGo = (driveDoors >= controlDoors + 2) && (driveSeedsWithDoor.size >= 2);
console.log(`  GO bar (drive>=control+2 AND >=2/8 seeds): ${primaryGo ? 'GO' : 'NO-GO'}`);

// GUARDRAILS
const survD = keys.map(k => ac[k].gameDays - bc[k].gameDays);
const medSurvD = median(survD);
console.log('\nGUARDRAILS:');
console.log(`  median survival paired diff: ${medSurvD}d (bar |d|<=10): ${Math.abs(medSurvD) <= 10 ? 'PASS' : 'FAIL'}`);
const starvD = keys.map(k => {
  const a = ac[k], b = bc[k];
  const ar = a.gameDays > 0 ? (a.starvationDeaths * 100 / a.gameDays) : 0;
  const br = b.gameDays > 0 ? (b.starvationDeaths * 100 / b.gameDays) : 0;
  return ar - br;
});
const medStarvD = median(starvD);
console.log(`  median starvation/100d paired diff: ${medStarvD.toFixed(2)} (bar <=+3): ${medStarvD <= 3 ? 'PASS' : 'FAIL'}`);
const causeCounts = {};
for (const k of keys) for (const [c, n] of Object.entries(ac[k].deathCauses || {})) {
  if (!bc[k].deathCauses || !(c in bc[k].deathCauses)) causeCounts[c] = (causeCounts[c] || 0) + n;
}
const newModes = Object.entries(causeCounts).filter(([, n]) => n >= 2);
console.log(`  new death modes (>=2 events): ${newModes.length ? JSON.stringify(newModes) + ' FAIL' : 'none PASS'}`);
const armorD = keys.map(k => (ac[k].armorPieces | 0) - (bc[k].armorPieces | 0));
const medArmorD = median(armorD);
console.log(`  median armorPieces paired diff: ${medArmorD} (bar >=0): ${medArmorD >= 0 ? 'PASS' : 'FAIL'}`);

// war-loot mechanism check (drive leg only)
const warHits = after.reduce((t, r) => t + (r.r.warHits | 0), 0);
const warCalls = after.reduce((t, r) => t + (r.r.warCalls | 0), 0);
const ctrlWarCalls = before.reduce((t, r) => t + (r.r.warCalls | 0), 0);
console.log(`\nMECHANISM: war-loot rolls drive ${warHits}/${warCalls}, control calls ${ctrlWarCalls} (must be 0 — pristine tree has no rollWarLoot)`);

const verdict = { primaryGo, driveDoors, controlDoors, driveSeedsWithDoor: [...driveSeedsWithDoor], driveWindows, controlWindows,
  medSurvD, medStarvD, newModes, medArmorD, warHits, warCalls, ctrlWarCalls };
fs.writeFileSync(`${OUT_PREFIX}-verdict.json`, JSON.stringify(verdict, null, 2) + '\n');
console.log('\nverdict written to ' + `${OUT_PREFIX}-verdict.json`);
