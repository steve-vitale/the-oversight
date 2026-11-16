// analyze-trickteach-b.js — analyzer for arm sim-trickteach-b (LEVER:
// one survived observation teaches a wave-4 trick, TRICKTEACH=1).
// Requires scripts/analyze-killfail-a.js and adds the trickteach
// judgment on top of its classifySeed/summarizeLeg output; the
// killfail analyzer itself is NOT modified. Reports, per leg:
// launched fights + kills (distinct meetings), trick-known shares,
// tricks learned, all-origins wave-4/5 kills, starvation + median
// survival, the wall numbers, and the three-bar judgment from
// evidence/2026-11-16/sim-trickteach-b-prereg.md. Exits non-zero
// on any bar failure, any instrument error, or any parse failure.
// Usage:
//   node scripts/analyze-trickteach-b.js [--control evidence/2026-11-16/perseed-trickteach-b-control]
//     [--armed evidence/2026-11-16/perseed-trickteach-b-lever]
//     [--out evidence/2026-11-16/trickteach-b-analysis.json]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const KA = require(path.join(REPO, 'scripts', 'analyze-killfail-a'));

function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const CONTROL_DIR = path.join(REPO, argvVal('--control', 'evidence/2026-11-16/perseed-trickteach-b-control'));
const ARMED_DIR = path.join(REPO, argvVal('--armed', 'evidence/2026-11-16/perseed-trickteach-b-lever'));
const OUT_FILE = path.join(REPO, argvVal('--out', 'evidence/2026-11-16/trickteach-b-analysis.json'));

const SEEDS = [102211, 102212, 102213, 102214, 102215, 102216, 102217, 102218];
const W4_SET = new Set(KA.W4);
const W5_SET = new Set(KA.W5);

function median(nums) {
  const a = nums.filter(function (n) { return typeof n === 'number' && isFinite(n); }).sort(function (x, y) { return x - y; });
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function parseLeg(dir) {
  const out = { dir: dir, files: [], parsed: {}, errors: [] };
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'trickteach-b-s' + seed + '-trickteach-b-competent.json');
    if (!fs.existsSync(fp)) { out.errors.push('missing per-seed file: ' + fp); continue; }
    try {
      const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
      out.files.push(fp);
      out.parsed[seed] = j;
    } catch (e) { out.errors.push('parse failed ' + fp + ': ' + String(e.message).slice(0, 120)); }
  }
  return out;
}

// Distinct launched kills: distinct meetings (seed+day+vid+mid)
// among launched fights with outcome vKill — the gatelever bar-2
// definition, frozen in the prereg.
function distinctLaunchedKills(bySeed) {
  const seen = {};
  const rows = [];
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    const r = bySeed[s];
    for (const row of r.launched) {
      if (row.fight.outcome !== 'vKill') continue;
      const key = r.seed + '|' + row.fight.day + '|' + row.fight.vid + '|' + row.fight.mid;
      if (seen[key]) continue;
      seen[key] = true;
      rows.push({ seed: r.seed, day: row.fight.day, vid: row.fight.vid, mid: row.fight.mid, wave: row.fight.wave, joinKind: row.joinKind });
    }
  }
  return rows;
}

// Tricks learned: distinct wave-4/5 species per leg whose first
// known-transition (trickBefore false -> trickAfter true) appears
// in the fight rows, plus the transition count. Fights are scanned
// in day order per seed; a species counts once (first transition).
function tricksLearned(bySeed) {
  const species = {};
  let transitions = 0;
  const perSeed = {};
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    const j = bySeed[s];
    const fights = ((j.raw && j.raw.killfailFights) || []).slice().sort(function (a, b) { return (a.day - b.day) || 0; });
    const known = {};
    const seedSpecies = [];
    for (const f of fights) {
      if (!f.trickAfter) continue;
      if (known[f.mid]) continue;
      known[f.mid] = true;
      if (!species[f.mid]) species[f.mid] = { firstSeed: s, firstDay: f.day, viaLaunched: null };
      transitions++;
      seedSpecies.push({ mid: f.mid, day: f.day, wave: f.wave });
    }
    perSeed[s] = seedSpecies;
  }
  return { distinctSpecies: Object.keys(species).sort(), transitions: transitions, perSeed: perSeed, bySpecies: species };
}

function trickKnownShares(bySeed) {
  let launched = 0, launchedKnown = 0, wild = 0, wildKnown = 0;
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    const r = bySeed[s];
    for (const row of r.launched) {
      launched++;
      if (row.fight.trickBefore === true) launchedKnown++;
    }
    for (const row of r.wild) {
      wild++;
      if (row.fight.trickBefore === true) wildKnown++;
    }
  }
  return {
    launched: launched, launchedKnown: launchedKnown,
    launchedKnownShare: launched ? launchedKnown / launched : null,
    wild: wild, wildKnown: wildKnown,
    wildKnownShare: wild ? wildKnown / wild : null,
  };
}

function waveKills(bySeed) {
  let w4 = 0, w5 = 0, w4Launched = 0, w5Launched = 0;
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    const r = bySeed[s];
    for (const row of r.launched.concat(r.wild)) {
      if (row.fight.outcome !== 'vKill') continue;
      if (row.fight.wave === 4) { w4++; if (row.event) w4Launched++; }
      if (row.fight.wave === 5) { w5++; if (row.event) w5Launched++; }
    }
  }
  return { wave4All: w4, wave5All: w5, wave4LaunchedRows: w4Launched, wave5LaunchedRows: w5Launched };
}

function gateCounts(bySeed) {
  const counts = { seek: 0, avoid: 0, null: 0, other: 0, rows: 0 };
  const launchedGate = { seek: 0, avoid: 0, null: 0, none: 0 };
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    const j = bySeed[s].raw;
    for (const g of (j.v4gates || [])) {
      counts.rows++;
      if (g.result === 'seek') counts.seek++;
      else if (g.result === 'avoid') counts.avoid++;
      else if (g.result === null || g.result === 'null') counts.null++;
      else counts.other++;
    }
    for (const row of bySeed[s].classified.launched) {
      const g = row.fight.gate;
      if (!g) { launchedGate.none++; continue; }
      if (g.result === 'seek') launchedGate.seek++;
      else if (g.result === 'avoid') launchedGate.avoid++;
      else launchedGate.null++;
    }
  }
  return { all: counts, launchedFights: launchedGate };
}

function trickKnownEnd(bySeed) {
  const w12 = {}, w345 = {};
  let obsSpecies = 0, obsTotal = 0;
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    const t = bySeed[s].raw.trickKnownEnd || {};
    for (const m of (t.wave12 || [])) w12[m] = true;
    for (const m of (t.wave345 || [])) w345[m] = true;
    const obs = bySeed[s].raw.trickObsEnd || {};
    for (const m of Object.keys(obs)) { obsSpecies++; obsTotal += obs[m]; }
  }
  return {
    wave12KnownSpecies: Object.keys(w12).sort(),
    wave345KnownSpecies: Object.keys(w345).sort(),
    obsSpeciesRows: obsSpecies, obsTotal: obsTotal,
  };
}

function summarize(bySeed) {
  const out = {};
  for (const s of Object.keys(bySeed)) {
    const r = bySeed[s];
    out[s] = { raw: r, classified: KA.classifySeed(r) };
  }
  const classifiedBySeed = {};
  for (const s of Object.keys(out)) classifiedBySeed[s] = out[s].classified;
  const sum = KA.summarizeLeg(classifiedBySeed);
  const distinctKills = distinctLaunchedKills(classifiedBySeed);
  const learned = tricksLearned(out);
  const shares = trickKnownShares(classifiedBySeed);
  const wk = waveKills(classifiedBySeed);
  const gates = gateCounts(out);
  const endKnown = trickKnownEnd(out);
  return {
    sum: sum, distinctKills: distinctKills, distinctKillCount: distinctKills.length,
    tricksLearned: learned, shares: shares, waveKills: wk,
    gates: gates, trickKnownEnd: endKnown,
    medianSurvival: sum.medianSurvival,
    starvation: sum.wall.starvation, deaths: sum.wall.deaths,
  };
}

function main() {
  const controlParse = parseLeg(CONTROL_DIR);
  const armedParse = parseLeg(ARMED_DIR);
  const controlBySeed = {};
  const armedBySeed = {};
  for (const seed of SEEDS) {
    if (controlParse.parsed[seed]) controlBySeed[seed] = controlParse.parsed[seed];
    if (armedParse.parsed[seed]) armedBySeed[seed] = armedParse.parsed[seed];
  }
  const control = summarize(controlBySeed);
  const armed = summarize(armedBySeed);
  const instrumentErrors = control.sum.instrumentErrors + armed.sum.instrumentErrors;

  const bars = [];
  bars.push({ id: 'armed launched wave-4+ kills (distinct) >= 2', pass: armed.distinctKillCount >= 2,
    detail: 'armed ' + armed.distinctKillCount + ' (control ' + control.distinctKillCount + ')' });
  bars.push({ id: 'starvation armed <= control + 2', pass: armed.starvation <= control.starvation + 2,
    detail: 'armed ' + armed.starvation + ', control ' + control.starvation });
  bars.push({ id: 'median survival armed >= 0.8x control', pass: control.medianSurvival != null && armed.medianSurvival != null && armed.medianSurvival >= 0.8 * control.medianSurvival,
    detail: 'armed ' + armed.medianSurvival + 'd, control ' + control.medianSurvival + 'd (0.8x = ' + (control.medianSurvival == null ? 'n/a' : (0.8 * control.medianSurvival).toFixed(1)) + ')' });
  bars.push({ id: 'instrument clean (0 errors, 8/8 parse both legs)', pass: instrumentErrors === 0 && controlParse.files.length === 8 && armedParse.files.length === 8 && controlParse.errors.length === 0 && armedParse.errors.length === 0,
    detail: 'errors ' + instrumentErrors + ', control ' + controlParse.files.length + '/8, armed ' + armedParse.files.length + '/8' });
  const go = bars.every(function (b) { return b.pass; });

  console.log('== trickteach-b analysis ==');
  console.log('control leg: ' + control.sum.files + '/8 files, launched fights ' + control.sum.launchedTotal +
    ', classified ' + control.sum.launchedClassified + ', kills ' + control.sum.kills + ' (distinct ' + control.distinctKillCount + ')');
  console.log('armed leg: ' + armed.sum.files + '/8 files, launched fights ' + armed.sum.launchedTotal +
    ', classified ' + armed.sum.launchedClassified + ', kills ' + armed.sum.kills + ' (distinct ' + armed.distinctKillCount + ')');
  console.log('--- outcomes (launched fights) ---');
  console.log('control: ' + JSON.stringify(control.sum.outcomes));
  console.log('armed:   ' + JSON.stringify(armed.sum.outcomes));
  console.log('--- ranked primary failure modes (non-kill launched fights) ---');
  for (const leg of [{ name: 'control', sum: control.sum }, { name: 'armed', sum: armed.sum }]) {
    const ranked = Object.keys(leg.sum.primaryCounts).filter(function (k) { return k !== 'killed'; })
      .sort(function (a, b) { return leg.sum.primaryCounts[b] - leg.sum.primaryCounts[a]; });
    console.log('  ' + leg.name + ': ' + ranked.map(function (k) { return k + ':' + leg.sum.primaryCounts[k]; }).join(', ') +
      (leg.sum.primaryCounts.killed ? ' | killed:' + leg.sum.primaryCounts.killed : ''));
  }
  console.log('--- flag prevalence (classified launched fights) ---');
  for (const leg of [{ name: 'control', sum: control.sum }, { name: 'armed', sum: armed.sum }]) {
    const ranked = Object.keys(leg.sum.flagCounts).sort(function (a, b) { return leg.sum.flagCounts[b] - leg.sum.flagCounts[a]; });
    console.log('  ' + leg.name + ': ' + ranked.map(function (k) { return k + ':' + leg.sum.flagCounts[k] + '/' + leg.sum.launchedClassified; }).join(', '));
  }
  console.log('--- trick mechanism ---');
  console.log('control: tricks learned ' + control.tricksLearned.distinctSpecies.length + ' species (' + control.tricksLearned.distinctSpecies.join(', ') + '), ' + control.tricksLearned.transitions + ' transitions; trick-known launched ' + control.shares.launchedKnown + '/' + control.shares.launched + ', wild ' + control.shares.wildKnown + '/' + control.shares.wild);
  console.log('armed:   tricks learned ' + armed.tricksLearned.distinctSpecies.length + ' species (' + armed.tricksLearned.distinctSpecies.join(', ') + '), ' + armed.tricksLearned.transitions + ' transitions; trick-known launched ' + armed.shares.launchedKnown + '/' + armed.shares.launched + ', wild ' + armed.shares.wildKnown + '/' + armed.shares.wild);
  console.log('wave-1/2 tricks known at end: control ' + control.trickKnownEnd.wave12KnownSpecies.length + ' (' + control.trickKnownEnd.wave12KnownSpecies.join(', ') + '), armed ' + armed.trickKnownEnd.wave12KnownSpecies.length + ' (' + armed.trickKnownEnd.wave12KnownSpecies.join(', ') + ')');
  console.log('wave-4/5 kills, all origins: control w4 ' + control.waveKills.wave4All + ' w5 ' + control.waveKills.wave5All + '; armed w4 ' + armed.waveKills.wave4All + ' w5 ' + armed.waveKills.wave5All);
  console.log('--- gate rows (wave-4+ consultations) ---');
  console.log('control: ' + JSON.stringify(control.gates.all) + '; on launched fights ' + JSON.stringify(control.gates.launchedFights));
  console.log('armed:   ' + JSON.stringify(armed.gates.all) + '; on launched fights ' + JSON.stringify(armed.gates.launchedFights));
  console.log('--- wall ---');
  for (const leg of [{ name: 'control', sum: control.sum }, { name: 'armed', sum: armed.sum }]) {
    console.log('  ' + leg.name + ': wins ' + leg.sum.wall.wins + '/8, national(rank>=2) ' + leg.sum.wall.nationalRank + '/8, national(standing>=200) ' +
      leg.sum.wall.nationalStanding + '/8, wave4 ' + leg.sum.wall.wave4 + '/8, wave5 ' + leg.sum.wall.wave5 +
      '/8, median survival ' + leg.sum.medianSurvival + 'd, deaths ' + leg.sum.wall.deaths + ', starvation ' + leg.sum.wall.starvation);
  }
  console.log('--- GO bars ---');
  for (const b of bars) console.log('  ' + (b.pass ? 'PASS' : 'FAIL') + ' ' + b.id + ' — ' + b.detail);
  console.log('verdict: ' + (go ? 'PILOT GO' : 'PILOT NO-GO'));

  const analysis = {
    arm: 'trickteach-b', run: 'fleshout-loop-b-20261116T1530Z', seeds: SEEDS, policy: 'competent',
    control: control, armed: armed, bars: bars, go: go,
    instrumentErrors: instrumentErrors,
  };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(analysis, null, 2) + '\n');
  console.log('wrote ' + path.relative(REPO, OUT_FILE));
  if (!go) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { SEEDS: SEEDS, parseLeg: parseLeg, summarize: summarize, distinctLaunchedKills: distinctLaunchedKills, tricksLearned: tricksLearned };
