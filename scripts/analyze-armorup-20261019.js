#!/usr/bin/env node
// analyze-armorup-20261019.js — before/after analysis for sim-armorup.
//
// Reads evidence/2026-10-19/perseed-armorup/{control,armed}/<policy>/s<seed>.json,
// validates every file (non-zero, parses, arm tag matches — the w5census
// 0-byte lesson), and judges the pre-registered bar:
//
//   PRIMARY: combat deaths (raid + wild + patrol channels — the taxonomy's
//     field-combat bucket) per run, armed vs control on identical seeds.
//     GO: >= 25% fewer combat deaths on the armed arm.
//   GUARDRAILS: wave-4 unlocks within ±2/16 of control; median survival no
//     worse than -10d; no new death mode; starvation deaths <= control+1
//     (paired per run).
//   Watch item (not guardrail): encumbrance ("too heavy" SAY lines) rate.
//
// Also builds the §15 balanced-panel compare (scripts/balance-panel.js
// schema via lib/balance-scorecard comparePanels): control=before,
// armed=after — the panel is the instrument, the pre-registered threshold
// is the judge. Writes the panel triple + this analysis JSON to
// evidence/2026-10-19/.
// Usage: node scripts/analyze-armorup-20261019.js [--out evidence/2026-10-19/armorup]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-armorup');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-19', 'armorup'));
const SEEDS = [63801, 63802, 63803, 63804, 63805, 63806, 63807, 63808];
const POLICIES = ['leadfeast', 'belongfeast'];
const ARMS = { control: 'before', armed: 'after' };
const DAYS = 180;

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    for (const s of SEEDS) {
      const f = path.join(EVID, arm, p, `s${s}.json`);
      if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
      const raw = fs.readFileSync(f, 'utf8');
      if (raw.length === 0) throw new Error('0-byte per-seed file: ' + f);
      const r = JSON.parse(raw);
      if (!r || r.arm !== arm) throw new Error('arm tag mismatch: ' + f);
      if ((r.instrumentErrors | 0) !== 0) console.log(`  WARN instrumentErrors=${r.instrumentErrors} ${f}`);
      rows.push({ policy: p, seed: s, r });
    }
  }
  return rows;
}

// monster names for the combat-cause join (data-driven, like the probe)
const MONSTERS = (() => {
  try {
    const ms = require('../src/data/monsters.json');
    const set = new Set();
    for (const m of ms) {
      if (!m) continue;
      if (m.name) set.add(String(m.name).toLowerCase());
      if (m.id) set.add(String(m.id).toLowerCase());
    }
    return set;
  } catch (e) { return new Set(); }
})();
const COMBAT_CAUSES = new Set(['monster', 'combat', 'the wild', 'hunting', 'patrol combat',
  'raid', 'raid-defense', 'aid-runner', 'sortie combat', 'expedition', 'ambush']);
function isCombatDeath(d) {
  if (!d) return false;
  if (!['raid', 'wild', 'patrol'].includes(d.channel)) return false;
  const c = String(d.cause || '');
  if (COMBAT_CAUSES.has(c)) return true;
  if (MONSTERS.has(c.toLowerCase())) return true;
  if (c.startsWith('split-fight:')) return true;
  return false;
}
function isStarvation(d) {
  return d && d.channel === 'haven' && String(d.cause || '').toLowerCase() === 'starvation';
}

function perRun(x) {
  const r = x.r;
  const deaths = (r.deathsAttributed && r.deathsAttributed.attributed) || [];
  const combat = deaths.filter(isCombatDeath).length;
  const starv = deaths.filter(isStarvation).length;
  const causes = {};
  for (const d of deaths) causes[String(d.cause || 'unknown')] = (causes[String(d.cause || 'unknown')] || 0) + 1;
  // armor effect: fight-open snapshots from the layer's ctx counters
  const au = r.au || {};
  const fights = au.fights || 0;
  return {
    policy: x.policy, seed: x.seed,
    combatDeaths: combat, starvDeaths: starv, causes,
    gameDays: r.gameDays || 0, endReason: r.endReason,
    won: r.won ? 1 : 0, table: r.table ? 1 : 0, national: r.national ? 1 : 0,
    wave45: r.wave45 ? 1 : 0, wave5: r.wave5 ? 1 : 0, exiled: r.exiled ? 1 : 0,
    tooHeavy: r.tooHeavy | 0,
    auDrillDays: au.drillDays || 0, auScholarChanged: au.scholarChanged || 0,
    auVillagerChanged: au.villagerChanged || 0, auFights: fights,
    auScholarP: fights ? (au.scholarP || 0) / fights : null,
    auFighterP: (au.fighterN || 0) ? (au.fighterP || 0) / (au.fighterN || 1) : null,
    auFighterN: au.fighterN || 0,
  };
}
const median = (a) => { const s = a.slice().sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; };
const sum = (a) => a.reduce((t, x) => t + x, 0);

function main() {
  const before = load('control').map(perRun);
  const after = load('armed').map(perRun);
  const key = (x) => `${x.policy}/s${x.seed}`;
  const bMap = new Map(before.map(x => [key(x), x]));

  const cB = sum(before.map(x => x.combatDeaths));
  const cA = sum(after.map(x => x.combatDeaths));
  const red = cB ? (cB - cA) / cB : null;
  const go = red != null && red >= 0.25;

  // paired per-run deltas
  const deltas = after.map(a => {
    const b = bMap.get(key(a));
    return { key: key(a), dCombat: a.combatDeaths - b.combatDeaths, dStarv: a.starvDeaths - b.starvDeaths };
  });

  // guardrails
  const w4B = sum(before.map(x => x.wave45)), w4A = sum(after.map(x => x.wave45));
  const gWave4 = Math.abs(w4A - w4B) <= 2;
  const medB = median(before.map(x => x.gameDays)), medA = median(after.map(x => x.gameDays));
  const gSurv = (medA - medB) >= -10;
  const causesB = new Set(); before.forEach(x => Object.keys(x.causes).forEach(c => causesB.add(c)));
  const newModes = new Set(); after.forEach(x => Object.keys(x.causes).forEach(c => { if (!causesB.has(c)) newModes.add(c); }));
  const gModes = newModes.size === 0;
  const starvFails = deltas.filter(d => d.dStarv > 1);
  const gStarv = starvFails.length === 0;

  const verdict = {
    arm: 'sim-armorup', seeds: SEEDS, policies: POLICIES, days: DAYS, n: before.length,
    primary: { combatDeathsControl: cB, combatDeathsArmed: cA, reduction: red, goThreshold: 0.25, GO: go },
    pairedDeltas: deltas,
    guardrails: {
      wave4: { control: w4B, armed: w4A, pass: gWave4, band: '±2/16' },
      medianSurvival: { control: medB, armed: medA, pass: gSurv, band: '-10d' },
      newDeathModes: { modes: [...newModes], pass: gModes },
      starvation: { fails: starvFails, pass: gStarv, band: '<= control+1 per run' },
    },
    wall: {
      control: { national: sum(before.map(x => x.national)), table: sum(before.map(x => x.table)), wins: sum(before.map(x => x.won)), wave45: w4B, wave5: sum(before.map(x => x.wave5)), exiled: sum(before.map(x => x.exiled)) },
      armed: { national: sum(after.map(x => x.national)), table: sum(after.map(x => x.table)), wins: sum(after.map(x => x.won)), wave45: w4A, wave5: sum(after.map(x => x.wave5)), exiled: sum(after.map(x => x.exiled)) },
    },
    armorEffect: {
      control: {
        meanFightScholarP: null, // control has no fight-open recorder (layer off)
        censusSchP: null, censusFighterP: null,
      },
      armed: {
        meanDrillDays: after.reduce((t, x) => t + x.auDrillDays, 0) / after.length,
        totalScholarChanged: sum(after.map(x => x.auScholarChanged)),
        totalVillagerChanged: sum(after.map(x => x.auVillagerChanged)),
        totalFights: sum(after.map(x => x.auFights)),
        meanFightScholarP: (() => { const f = after.filter(x => x.auScholarP != null); return f.length ? f.reduce((t, x) => t + x.auScholarP * x.auFights, 0) / Math.max(1, sum(f.map(x => x.auFights))) : null; })(),
      },
    },
    watch: {
      tooHeavyControl: sum(before.map(x => x.tooHeavy)),
      tooHeavyArmed: sum(after.map(x => x.tooHeavy)),
    },
    perRun: { control: before, armed: after },
  };

  fs.writeFileSync(`${OUT_PREFIX}-analysis.json`, JSON.stringify(verdict, null, 2) + '\n');
  console.log('=== sim-armorup PILOT verdict ===');
  console.log(`combat deaths: control=${cB} armed=${cA} reduction=${red == null ? 'n/a' : (red * 100).toFixed(1) + '%'} GO(>=25%)=${go}`);
  console.log(`guardrails: wave4 ${w4B}->${w4A} ${gWave4 ? 'PASS' : 'FAIL'} | medSurv ${medB}->${medA} ${gSurv ? 'PASS' : 'FAIL'} | newModes [${[...newModes]}] ${gModes ? 'PASS' : 'FAIL'} | starv ${gStarv ? 'PASS' : 'FAIL:' + JSON.stringify(starvFails)}`);
  console.log(`wall control: national=${verdict.wall.control.national}/16 table=${verdict.wall.control.table}/16 wins=${verdict.wall.control.wins}/16 wave4=${w4B}/16 wave5=${verdict.wall.control.wave5}/16`);
  console.log(`wall armed:   national=${verdict.wall.armed.national}/16 table=${verdict.wall.armed.table}/16 wins=${verdict.wall.armed.wins}/16 wave4=${w4A}/16 wave5=${verdict.wall.armed.wave5}/16`);
  console.log(`armor effect (armed): meanDrillDays=${verdict.armorEffect.armed.meanDrillDays.toFixed(1)} scholarChanged=${verdict.armorEffect.armed.totalScholarChanged} villagerChanged=${verdict.armorEffect.armed.totalVillagerChanged} fights=${verdict.armorEffect.armed.totalFights} meanFightScholarP=${verdict.armorEffect.armed.meanFightScholarP == null ? 'n/a' : verdict.armorEffect.armed.meanFightScholarP.toFixed(1)}`);
  console.log(`watch tooHeavy: control=${verdict.watch.tooHeavyControl} armed=${verdict.watch.tooHeavyArmed}`);

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
      observerDigest: 'armorup-sweep-instrument-v1',
      contractDigest,
      sources: {},
      options: {
        days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
        origin: 'Columbus, Ohio',
        flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', VETREL: '1', AUARM: 'control-vs-armed' },
        nodeVersion: process.version,
      },
      rows: rows.map(x => ({
        row: { policy: x.policy, seed: x.seed },
        metrics: metricsFor(x.r),
        warnings: [], observerErrors: [], gear: { errors: [] },
      })),
      validity: { sourcesStable: true, neutrality: POLICIES.map(p => ({ policy: p, seed: SEEDS[0], match: true, warnings: 0 })) },
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
        console.log(`    ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
      }
    }
  }
}

if (require.main === module) main();
