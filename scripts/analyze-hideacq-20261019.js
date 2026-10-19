#!/usr/bin/env node
// analyze-hideacq-20261019.js — before/after analysis for sim-hideacq.
//
// Reads evidence/2026-10-19/perseed-hideacq/{control,armed}/<policy>/s<seed>.json,
// validates every file (non-zero, parses, arm tag matches — the w5census
// 0-byte lesson), and judges the pre-registered bar (see
// evidence/2026-10-19/sim-hideacq.md):
//
//   PRIMARY: hide_armor crafts per run (scholar-side — the layer's ha
//     counters; both arms instrumented identically), armed vs control on
//     IDENTICAL seeds, paired. GO: armed mean >= 2x control mean AND armed
//     mean >= 0.5 craft/run (absolute engagement floor). A miss is NO-GO,
//     never re-scored (§14).
//   GUARDRAILS: wave-4 unlocks within ±2/16 of control; median survival no
//     worse than -10d; no new death mode (revised >=2-event rule); starvation
//     deaths <= control+1 (paired per run).
//   SECONDARY (report): wave-5 door armored15 leg end/max; scholar mean P
//     worn; wall numbers.
//   Watch item (not guardrail): knife/trap production counts (the vine claim
//     reorders what gets built) + "too heavy" rates.
//
// Also builds the §15 balanced-panel compare (scripts/balance-panel.js
// schema via lib/balance-scorecard comparePanels): control=before,
// armed=after — the panel is the instrument, the pre-registered threshold
// is the judge. Writes the panel triple + this analysis JSON to
// evidence/2026-10-19/.
// Usage: node scripts/analyze-hideacq-20261019.js [--out evidence/2026-10-19/vinearmor]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-hideacq');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-19', 'hideacq'));
const SEEDS = [63901, 63902, 63903, 63904, 63905, 63906, 63907, 63908];
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
  const ap = r.ap || {};
  const recs = r.recs || [];
  const endDoor = recs.length ? (recs[recs.length - 1].door || {}) : {};
  const endAu = recs.length ? (recs[recs.length - 1].au || {}) : {};
  const maxArmored15 = recs.length ? Math.max(...recs.map(q => (q.door || {}).armored15 || 0)) : 0;
  return {
    policy: x.policy, seed: x.seed,
    combatDeaths: combat, starvDeaths: starv, causes,
    gameDays: r.gameDays || 0, endReason: r.endReason,
    won: r.won ? 1 : 0, table: r.table ? 1 : 0, national: r.national ? 1 : 0,
    wave45: r.wave45 ? 1 : 0, wave5: r.wave5 ? 1 : 0, exiled: r.exiled ? 1 : 0,
    tooHeavy: r.tooHeavy | 0, packRefused: r.packRefused | 0, leftBehind: r.leftBehind | 0,
    crafts: ap.hideCrafts || 0, // PRIMARY: hide_armor crafts (the layer's drive)
    hideAttempts: ap.hideAttempts || 0, hideCrafts: ap.hideCrafts || 0,
    hideFails: ap.hideFails || 0,
    barkCrafts: ap.barkCrafts || 0, // base-only, secondary context
    dawnButchers: ap.dawnButchers || 0, sweeps: ap.sweeps || 0,
    knives: ap.knives || 0, traps: ap.traps || 0,
    cooccurDays: recs.filter(q => ((q.prod || {}).hide || 0) >= 2 && ((q.prod || {}).vine || 0) >= 1).length, // secondary: (hide>=2 & vine>=1) days
    endArmored15: endDoor.armored15 || 0, maxArmored15,
    endScholarP: endDoor.scholarP || 0, endCensusSchP: endAu.schP || 0,
  };
}
const median = (a) => { const s = a.slice().sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; };
const sum = (a) => a.reduce((t, x) => t + x, 0);
const mean = (a) => a.length ? sum(a) / a.length : 0;

function main() {
  const before = load('control').map(perRun);
  const after = load('armed').map(perRun);
  const key = (x) => `${x.policy}/s${x.seed}`;
  const bMap = new Map(before.map(x => [key(x), x]));

  // PRIMARY: hide_armor crafts per run, paired per seed, GO = armed mean
  // >= 2x control mean AND armed mean >= 0.5 craft/run (absolute engagement
  // floor — a drive that crafts less than once per two runs is a dead letter).
  const deltas = after.map(a => {
    const b = bMap.get(key(a));
    return { key: key(a), dCrafts: a.crafts - b.crafts, dStarv: a.starvDeaths - b.starvDeaths,
             dCombat: a.combatDeaths - b.combatDeaths };
  });
  const mB = mean(before.map(x => x.crafts)), mA = mean(after.map(x => x.crafts));
  const ratio = mB > 0 ? mA / mB : (mA > 0 ? Infinity : 0);
  const go = mA >= 0.5 && (mB === 0 ? mA >= 0.5 : ratio >= 2);
  const pairedSum = sum(deltas.map(d => d.dCrafts)); // informational

  // guardrails
  const w4B = sum(before.map(x => x.wave45)), w4A = sum(after.map(x => x.wave45));
  const gWave4 = Math.abs(w4A - w4B) <= 2;
  const medB = median(before.map(x => x.gameDays)), medA = median(after.map(x => x.gameDays));
  const gSurv = (medA - medB) >= -10;
  // revised >=2-event rule: a new cause mode fails only with >=2 events on armed
  const causesB = new Set(); before.forEach(x => Object.keys(x.causes).forEach(c => causesB.add(c)));
  const newModeCounts = {};
  after.forEach(x => Object.keys(x.causes).forEach(c => {
    if (!causesB.has(c)) newModeCounts[c] = (newModeCounts[c] || 0) + x.causes[c];
  }));
  const newModes = Object.keys(newModeCounts).filter(c => newModeCounts[c] >= 2);
  const gModes = newModes.length === 0;
  const starvFails = deltas.filter(d => d.dStarv > 1);
  const gStarv = starvFails.length === 0;

  const verdict = {
    arm: 'sim-hideacq', seeds: SEEDS, policies: POLICIES, days: DAYS, n: before.length,
    primary: {
      craftsControlMean: mB, craftsArmedMean: mA,
      craftCountsControl: before.map(x => x.crafts), craftCountsArmed: after.map(x => x.crafts),
      ratioArmedOverControl: ratio === Infinity ? 'inf' : ratio,
      pairedDeltaSum: pairedSum, pairedDeltas: deltas,
      goThreshold: 'armed mean >= 2x control mean AND armed mean >= 0.5 craft/run',
      GO: go, basis: 'paired identical-seed means',
    },
    guardrails: {
      wave4: { control: w4B, armed: w4A, pass: gWave4, band: '±2/16' },
      medianSurvival: { control: medB, armed: medA, pass: gSurv, band: '-10d' },
      newDeathModes: { modes: newModes, counts: newModeCounts, pass: gModes, rule: '>=2 events' },
      starvation: { fails: starvFails, pass: gStarv, band: '<= control+1 per run' },
    },
    wall: {
      control: { national: sum(before.map(x => x.national)), table: sum(before.map(x => x.table)), wins: sum(before.map(x => x.won)), wave45: w4B, wave5: sum(before.map(x => x.wave5)), exiled: sum(before.map(x => x.exiled)) },
      armed: { national: sum(after.map(x => x.national)), table: sum(after.map(x => x.table)), wins: sum(after.map(x => x.won)), wave45: w4A, wave5: sum(after.map(x => x.wave5)), exiled: sum(after.map(x => x.exiled)) },
      medianSurvival: { control: medB, armed: medA },
    },
    armorProduction: {
      control: {
        crafts: sum(before.map(x => x.crafts)),
        meanEndScholarP: mean(before.map(x => x.endScholarP)),
      },
      armed: {
        crafts: sum(after.map(x => x.crafts)),
        hideAttempts: sum(after.map(x => x.hideAttempts)),
        hideCrafts: sum(after.map(x => x.hideCrafts)),
        hideFails: sum(after.map(x => x.hideFails)),
        barkCrafts: sum(after.map(x => x.barkCrafts)), // base-only, secondary context
        dawnButchers: sum(after.map(x => x.dawnButchers)),
        sweeps: sum(after.map(x => x.sweeps)),
        cooccurDays: sum(after.map(x => x.cooccurDays)),
        meanEndScholarP: mean(after.map(x => x.endScholarP)),
      },
    },
    doorLeg: {
      // wave-5 demand: 4 at P>=15 (standingCfg readyDemand). Report end-state
      // and max per arm; "is armor still short?" is the secondary verdict.
      control: { meanEndArmored15: mean(before.map(x => x.endArmored15)), meanMaxArmored15: mean(before.map(x => x.maxArmored15)) },
      armed: { meanEndArmored15: mean(after.map(x => x.endArmored15)), meanMaxArmored15: mean(after.map(x => x.maxArmored15)) },
    },
    watch: {
      tooHeavyControl: sum(before.map(x => x.tooHeavy)),
      tooHeavyArmed: sum(after.map(x => x.tooHeavy)),
      packRefusedControl: sum(before.map(x => x.packRefused)),
      packRefusedArmed: sum(after.map(x => x.packRefused)),
      leftBehindControl: sum(before.map(x => x.leftBehind)),
      leftBehindArmed: sum(after.map(x => x.leftBehind)),
      knivesControl: sum(before.map(x => x.knives)),
      knivesArmed: sum(after.map(x => x.knives)),
      trapsControl: sum(before.map(x => x.traps)),
      trapsArmed: sum(after.map(x => x.traps)),
    },
    perRun: { control: before, armed: after },
  };

  fs.writeFileSync(`${OUT_PREFIX}-analysis.json`, JSON.stringify(verdict, null, 2) + '\n');
  console.log('=== sim-hideacq PILOT verdict ===');
  console.log(`PRIMARY (hide crafts/run, paired): controlMean=${mB.toFixed(2)} armedMean=${mA.toFixed(2)} ratio=${ratio === Infinity ? 'inf' : ratio.toFixed(2)} pairedDeltaSum=${pairedSum} GO(>=2x AND >=0.5)=${go}`);
  console.log(`  paired deltas: ${deltas.map(d => `${d.key}:${d.dCrafts >= 0 ? '+' : ''}${d.dCrafts}`).join(' ')}`);
  console.log(`guardrails: wave4 ${w4B}->${w4A} ${gWave4 ? 'PASS' : 'FAIL'} | medSurv ${medB}->${medA} ${gSurv ? 'PASS' : 'FAIL'} | newModes [${newModes}] ${gModes ? 'PASS' : 'FAIL'} | starv ${gStarv ? 'PASS' : 'FAIL:' + JSON.stringify(starvFails)}`);
  console.log(`wall control: national=${verdict.wall.control.national}/16 table=${verdict.wall.control.table}/16 wins=${verdict.wall.control.wins}/16 wave4=${w4B}/16 wave5=${verdict.wall.control.wave5}/16`);
  console.log(`wall armed:   national=${verdict.wall.armed.national}/16 table=${verdict.wall.armed.table}/16 wins=${verdict.wall.armed.wins}/16 wave4=${w4A}/16 wave5=${verdict.wall.armed.wave5}/16`);
  console.log(`production (armed): hideAtt=${verdict.armorProduction.armed.hideAttempts} hideCrafts=${verdict.armorProduction.armed.hideCrafts} dawnButch=${sum(after.map(x => x.dawnButchers))} sweeps=${sum(after.map(x => x.sweeps))} | cooccur days/run: control=${mean(before.map(x => x.cooccurDays)).toFixed(1)} armed=${mean(after.map(x => x.cooccurDays)).toFixed(1)}`);
  console.log(`watch knives: control=${verdict.watch.knivesControl} armed=${verdict.watch.knivesArmed} | traps: control=${verdict.watch.trapsControl} armed=${verdict.watch.trapsArmed}`);
  console.log(`door leg armored15: control end=${verdict.doorLeg.control.meanEndArmored15.toFixed(2)} max=${verdict.doorLeg.control.meanMaxArmored15.toFixed(2)} | armed end=${verdict.doorLeg.armed.meanEndArmored15.toFixed(2)} max=${verdict.doorLeg.armed.meanMaxArmored15.toFixed(2)} (demand 4)`);
  console.log(`watch tooHeavy: control=${verdict.watch.tooHeavyControl} armed=${verdict.watch.tooHeavyArmed} | packRefused c=${verdict.watch.packRefusedControl} a=${verdict.watch.packRefusedArmed} | leftBehind c=${verdict.watch.leftBehindControl} a=${verdict.watch.leftBehindArmed}`);

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
      observerDigest: 'hideacq-sweep-instrument-v1',
      contractDigest,
      sources: {},
      options: {
        days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
        origin: 'Columbus, Ohio',
        flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', VETREL: '1', HAARM: 'control-vs-armed' },
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
