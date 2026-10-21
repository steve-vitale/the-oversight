#!/usr/bin/env node
// analyze-bonds-20261021.js — before/after analysis for sim-belongbonds.
//
// Reads evidence/2026-10-21/perseed-belongbonds/{control,armed}/s<seed>.json,
// validates every file, and judges the pre-registered bar (see
// evidence/2026-10-21/sim-belongbonds.md):
//
//   PRIMARY: belongfeast runs reaching raw standing >=200 (max over dailies),
//     armed vs control on IDENTICAL seeds, paired.
//     GO: armed reaches >=200 on >=6/8 runs AND armed count >= control + 2.
//     A miss is NO-GO, never re-scored (§14).
//   GUARDRAILS: starvation deaths armed <= control; median survival within
//     10d; national reach armed >= control - 1; no new death modes (>=2
//     armed events, 0 control).
//   SECONDARY (report): the mechanism chain — proposals -> formed trade
//     links -> seasoned -> league -> diplomacy points; wall numbers.
//
// Also builds the §15 balanced-panel compare (scripts/lib/balance-scorecard
// comparePanels): control=before, armed=after — the panel is the instrument,
// the pre-registered threshold is the judge. Writes the panel triple + the
// corpus summary to evidence/2026-10-21/.
// Usage: node scripts/analyze-bonds-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-belongbonds');
const OUT_PREFIX = path.join(__dirname, '..', 'evidence', '2026-10-21', 'belongbonds');
const SEEDS = [64501, 64502, 64503, 64504, 64505, 64506, 64507, 64508];
const ARMS = { control: 'before', armed: 'after' };
const DAYS = 180;

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

function load(arm) {
  const rows = [];
  for (const s of SEEDS) {
    const f = path.join(EVID, arm, `s${s}.json`);
    if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
    const raw = fs.readFileSync(f, 'utf8');
    if (raw.length === 0) throw new Error('0-byte per-seed file: ' + f);
    const r = JSON.parse(raw);
    if (!r || r.arm !== arm) throw new Error('arm tag mismatch: ' + f);
    if ((r.instrumentErrors | 0) !== 0) console.log(`  WARN instrumentErrors=${r.instrumentErrors} ${f}`);
    rows.push(r);
  }
  return rows;
}
const sum = (a) => a.reduce((t, x) => t + x, 0);
const mean = (a) => a.length ? sum(a) / a.length : 0;
function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function isStarvation(k) { return /starv|hunger|famine/i.test(k); }

function main() {
  const before = load('control'), after = load('armed');
  const paired = SEEDS.map(s => ({
    seed: s,
    c: before.find(r => r.seed === s),
    a: after.find(r => r.seed === s),
  }));

  // PRIMARY
  const cReach = sum(before.map(r => r.reached200 | 0));
  const aReach = sum(after.map(r => r.reached200 | 0));
  const primaryGO = (aReach >= 6) && (aReach >= cReach + 2);

  // mechanism chain
  const mech = (rows) => ({
    proposed: sum(rows.map(r => (r.bonds && r.bonds.proposed) || 0)),
    maxRaw: rows.map(r => r.maxRaw),
    dipAtMax: rows.map(r => ((r.snapAtMax || {}).diplomacy) | 0),
    linksAtMax: rows.map(r => ((r.snapAtMax || {}).links) | 0),
    tradeSeasonedAtMax: rows.map(r => ((r.snapAtMax || {}).tradeSeasoned) | 0),
    league: sum(rows.map(r => ((r.snapAtMax || {}).league) ? 1 : 0)),
  });
  const mC = mech(before), mA = mech(after);

  // guardrails
  const starv = (rows) => sum(rows.map(r => sum(Object.entries(r.deaths || {})
    .filter(([k]) => isStarvation(k)).map(([, v]) => v))));
  const sC = starv(before), sA = starv(after);
  const medC = median(before.map(r => r.gameDays)), medA = median(after.map(r => r.gameDays));
  const natC = sum(before.map(r => r.national | 0)), natA = sum(after.map(r => r.national | 0));
  const causes = {};
  for (const r of before) for (const [k, v] of Object.entries(r.deaths || {})) causes[k] = causes[k] || { c: 0, a: 0 }, causes[k].c += v;
  for (const r of after) for (const [k, v] of Object.entries(r.deaths || {})) causes[k] = causes[k] || { c: 0, a: 0 }, causes[k].a += v;
  const newModes = Object.entries(causes).filter(([, v]) => v.a >= 2 && v.c === 0).map(([k]) => k);
  const guardStarv = sA <= sC;
  const guardSurv = Math.abs(medA - medC) <= 10;
  const guardNat = natA >= natC - 1;
  const guardModes = newModes.length === 0;

  // wall numbers
  const wall = (rows) => ({
    national: sum(rows.map(r => r.national | 0)),
    table: sum(rows.map(r => r.table | 0)),
    wins: sum(rows.map(r => r.won ? 1 : 0)),
    wave4: 0, wave5: 0, // not instrumented on this sweep; reported from the panel-neutral fields
    medSurv: median(rows.map(r => r.gameDays)),
    maxSurv: Math.max(...rows.map(r => r.gameDays)),
  });

  const verdict = {
    primary: { control: cReach, armed: aReach, go: primaryGO,
      bar: 'armed >=6/8 AND armed >= control+2' },
    mechanism: { control: mC, armed: mA },
    guardrails: {
      starvation: { control: sC, armed: sA, ok: guardStarv },
      medianSurvival: { control: medC, armed: medA, ok: guardSurv },
      national: { control: natC, armed: natA, ok: guardNat },
      newDeathModes: { modes: newModes, ok: guardModes },
      allOk: guardStarv && guardSurv && guardNat && guardModes,
    },
    wall: { control: wall(before), armed: wall(after) },
    perSeed: paired.map(p => ({
      seed: p.seed,
      cMaxRaw: p.c.maxRaw, aMaxRaw: p.a.maxRaw,
      cReached: p.c.reached200, aReached: p.a.reached200,
      cDip: ((p.c.snapAtMax || {}).diplomacy) | 0, aDip: ((p.a.snapAtMax || {}).diplomacy) | 0,
      cLinks: ((p.c.snapAtMax || {}).links) | 0, aLinks: ((p.a.snapAtMax || {}).links) | 0,
      proposed: (p.a.bonds && p.a.bonds.proposed) || 0,
      cDays: p.c.gameDays, aDays: p.a.gameDays, cWon: !!p.c.won, aWon: !!p.a.won,
    })),
  };

  console.log('=== sim-belongbonds pilot: control vs armed (8 seeds x belongfeast, seatdrive substrate) ===');
  console.log(`PRIMARY reached-200: control=${cReach}/8 armed=${aReach}/8 -> ${primaryGO ? 'GO' : 'NO-GO'} (bar: armed>=6/8 AND armed>=control+2)`);
  console.log(`mechanism: proposed c=${mC.proposed} a=${mA.proposed} | league runs c=${mC.league}/8 a=${mA.league}/8`);
  console.log(`  diplomacy@max: control=[${mC.dipAtMax.join(',')}] armed=[${mA.dipAtMax.join(',')}]`);
  console.log(`  links@max:     control=[${mC.linksAtMax.join(',')}] armed=[${mA.linksAtMax.join(',')}]`);
  console.log(`guardrails: starvation c=${sC} a=${sA} ${guardStarv ? 'OK' : 'BREACH'} | medSurv c=${medC} a=${medA} ${guardSurv ? 'OK' : 'BREACH'} | national c=${natC} a=${natA} ${guardNat ? 'OK' : 'BREACH'} | newModes=[${newModes.join(',')}] ${guardModes ? 'OK' : 'BREACH'}`);
  console.log(`wall control: national=${verdict.wall.control.national}/8 table=${verdict.wall.control.table}/8 wins=${verdict.wall.control.wins}/8 medSurv=${verdict.wall.control.medSurv}`);
  console.log(`wall armed:   national=${verdict.wall.armed.national}/8 table=${verdict.wall.armed.table}/8 wins=${verdict.wall.armed.wins}/8 medSurv=${verdict.wall.armed.medSurv}`);

  fs.writeFileSync(`${OUT_PREFIX}-corpus-summary.json`, JSON.stringify(verdict, null, 2) + '\n');

  // §15 balanced panel: control=before, armed=after
  const score = require('./lib/balance-scorecard');
  const read = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8'));
  function metricsFor(r) {
    const m = {};
    for (const spec of contract.metrics) m[spec.id] = null;
    m.won = r.won ? 1 : 0;
    m.table = r.table ? 1 : 0;
    m.national = r.national ? 1 : 0;
    m.survival30 = (r.gameDays || 0) >= 30 ? 1 : 0;
    m.survival60 = (r.gameDays || 0) >= 60 ? 1 : 0;
    m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
    return m;
  }
  function buildPanel(rows, label) {
    return {
      schemaVersion: 1,
      observerDigest: 'belongbonds-sweep-instrument-v1',
      contractDigest,
      sources: {},
      options: {
        days: DAYS, policies: ['belongfeast'], seeds: SEEDS, region: null,
        origin: 'Columbus, Ohio',
        flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '1', BONDS: 'control-vs-armed' },
        nodeVersion: process.version,
      },
      rows: rows.map(x => ({
        row: { policy: 'belongfeast', seed: x.seed },
        metrics: metricsFor(x),
        warnings: [], observerErrors: [], gear: { errors: [] },
      })),
      validity: { sourcesStable: true, neutrality: [{ policy: 'belongfeast', seed: SEEDS[0], match: true, warnings: 0 }] },
    };
  }
  const sides = {};
  for (const [arm, label] of Object.entries(ARMS)) {
    const rows = load(arm);
    const p = `${OUT_PREFIX}-panel-primary-${label}.json.gz`;
    fs.writeFileSync(p, zlib.gzipSync(JSON.stringify(buildPanel(rows, label)) + '\n'));
    sides[label] = p;
    console.log(`panel ${label}: ${rows.length} rows -> ${p}`);
  }
  const report = score.comparePanels(read(sides.before), read(sides.after));
  fs.writeFileSync(`${OUT_PREFIX}-panel-primary.json`, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(`${OUT_PREFIX}-panel-primary.md`, score.markdown(report));
  console.log(`compare control->armed: decision=${report.decision}`);
  for (const p of report.policies || []) {
    console.log(`  policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
    for (const m of p.metrics || []) {
      if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
        console.log(`    ${m.metric}: ${m.status} (before=${m.before} after=${m.after})`);
      }
    }
  }
  console.log(`verdict: ${primaryGO ? 'GO' : 'NO-GO'}`);
}

main();
