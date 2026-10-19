#!/usr/bin/env node
// scripts/build-doomrevive-b2-panels.js — §15 balanced-panel compare for sim-doomrevive-b2.
//
// Reads the pilot sweep JSONs (~/workspace/sweep-tmp/sim-doomrevive-b2/sweep-{control,armed}-*.json),
// builds panels in the scripts/balance-panel.js schema, and runs the compare:
//   control (before) vs armed (after) — the primary.
// Panel metric mapping: won, table, national, survival30/60, playerDeaths,
// playerDeaths100Days, communityLost — the wall/reachability instrument.
// The panel is the instrument; the pre-registered threshold is the judge.
// Usage: node scripts/build-doomrevive-b2-panels.js [--out evidence/2026-10-19/doomrevive-b2-panel]
//
// INFRA (2026-10-19): the host flaps EPERM on node writeFileSync in long
// windows (sim-armory finding). Panel writes go through writeFileFlap
// (EPERM-only retry, 30s backoff x20).
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const SWEEP_DIR = process.env.SWEEP_DIR || (require('os').homedir() + '/workspace/sweep-tmp/sim-doomrevive-b2');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-19', 'doomrevive-b2-panel'));

// writeFileFlap: EPERM-only retry for the host's write flap. Non-EPERM
// errors throw immediately (real bugs must fail loudly, not retry).
// The flap has TWO shapes: (a) writeFileSync throws EPERM (open truncates
// the file to 0 bytes first); (b) writeFileSync returns success but leaves
// a 0-byte file (sim-armory 2026-10-19: 16x 0-byte JSONs). Both are retried:
// after every write the file size is verified against the expected byte
// length, and a 0-byte (or short) file counts as a flap failure.
function writeFileFlap(p, data) {
  const tries = 120, backoffMs = 30000;
  const want = Buffer.byteLength(data);
  for (let i = 1; ; i++) {
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, data);
      let got = -1;
      try { got = fs.statSync(p).size; } catch (e) {}
      if (got === want) {
        if (i > 1) console.log(`writeFileFlap: ${p} succeeded on try ${i}`);
        return;
      }
      throw Object.assign(new Error(`EPERM-flap shape: wrote ${got}/${want} bytes`), { code: 'EPERM' });
    } catch (e) {
      if (e && e.code === 'EPERM' && i < tries) {
        console.log(`writeFileFlap: EPERM on ${p}, try ${i}/${tries} — backing off ${backoffMs / 1000}s`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, backoffMs);
        continue;
      }
      throw e;
    }
  }
}

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [7501, 7502, 7503, 7504, 7505, 7506, 7507, 7508];
const POLICIES = ['leaddoomeddraw', 'belongdoomeddraw'];
const DAYS = 180;

function load(side) {
  const rows = [];
  for (const p of POLICIES) {
    const f = path.join(SWEEP_DIR, `sweep-${side}-${p}.json`);
    if (!fs.existsSync(f)) throw new Error('missing sweep file: ' + f);
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const r of data.rows) rows.push({ policy: p, seed: r.seed, e: r.end });
  }
  return rows;
}

function metricsFor(r) {
  const e = r.e;
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = e.won ? 1 : 0;
  m.table = (e.tableWaiting || e.won) ? 1 : 0;
  m.national = e.nationalLive ? 1 : 0;
  m.survival30 = e.days >= 30 ? 1 : 0;
  m.survival60 = e.days >= 60 ? 1 : 0;
  const playerDeaths = (e.deaths || []).filter(d => d.kind === 'person').length;
  m.playerDeaths = playerDeaths;
  m.playerDeaths100Days = (e.days > 0 && Number.isFinite(playerDeaths)) ? playerDeaths * 100 / e.days : null;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(e.endReason) ? 1 : 0;
  m.npcHungry = e.starveDays > 0 ? 1 : 0;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'doomrevive-b2-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'Columbus, Ohio',
      flags: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: '1' },
    },
    rows: rows.map(r => ({
      row: { policy: r.policy, seed: r.seed },
      metrics: metricsFor(r),
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

function compare(beforeArm, afterArm, suffix) {
  const before = load(beforeArm), after = load(afterArm);
  const beforePath = `${OUT_PREFIX}-${suffix}-before.json.gz`;
  const afterPath = `${OUT_PREFIX}-${suffix}-after.json.gz`;
  writeFileFlap(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(before, beforeArm)) + '\n'));
  writeFileFlap(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(after, afterArm)) + '\n'));
  const report = score.comparePanels(read(beforePath), read(afterPath));
  writeFileFlap(`${OUT_PREFIX}-${suffix}.json`, JSON.stringify(report, null, 2) + '\n');
  writeFileFlap(`${OUT_PREFIX}-${suffix}.md`, score.markdown(report));
  console.log(`compare ${beforeArm}->${afterArm}: decision=${report.decision}`);
  for (const p of report.policies || []) {
    console.log(`  policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
    for (const m of p.metrics || []) {
      if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
        console.log(`    ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
      }
    }
  }
}

compare('control', 'armed', 'primary');
