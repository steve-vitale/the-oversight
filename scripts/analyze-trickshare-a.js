// analyze-trickshare-a.js — analyzer for arm sim-trickshare-a (LEVER:
// hearthside trick teaching, TRICKSHARE=1: a survived observation
// told at the fire credits a taught observation on the shared bar).
// Requires scripts/analyze-killfail-a.js and adds the trickshare
// judgment on top of its classifySeed/summarizeLeg output; the
// killfail analyzer itself is NOT modified. Reports, per leg:
// taught observations, gate trick-known rate, all-origins wave-4/5
// kills (distinct meetings, rounds >= 1), launched fights + kills
// (distinct meetings), trick-known shares, tricks learned,
// starvation + median survival + deaths/100d, the wall numbers,
// and the five-bar judgment from
// evidence/2026-11-16/sim-trickshare-a-prereg.md. Exits non-zero
// on any bar failure, any instrument error, or any parse failure.
// Usage:
//   node scripts/analyze-trickshare-a.js [--control evidence/2026-11-16/perseed-trickshare-a-control]
//     [--armed evidence/2026-11-16/perseed-trickshare-a-armed]
//     [--out evidence/2026-11-16/trickshare-a-analysis.json]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const KA = require(path.join(REPO, 'scripts', 'analyze-killfail-a'));

function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const CONTROL_DIR = path.join(REPO, argvVal('--control', 'evidence/2026-11-16/perseed-trickshare-a-control'));
const ARMED_DIR = path.join(REPO, argvVal('--armed', 'evidence/2026-11-16/perseed-trickshare-a-armed'));
const OUT_FILE = path.join(REPO, argvVal('--out', 'evidence/2026-11-16/trickshare-a-analysis.json'));

const SEEDS = [102601, 102602, 102603, 102604, 102605, 102606, 102607, 102608];
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
    const fp = path.join(dir, 'trickshare-a-s' + seed + '-trickshare-a-competent.json');
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

// Distinct-meeting wave-4/5 kills, rounds >= 1 (the trickshare
// PRIMARY, prereg-frozen): a 0-round kill is a wound-mill
// finish-off of an already-wounded beast, not a fight
// (trickteach metric review #5). Distinct on
// seed+day+vid+mid, so a fighter's three meetings with one beast
// in a day count three times but one fight never counts twice.
function waveKillsReal(bySeed) {
  const out = { wave4: 0, wave5: 0, wave4Rows: 0, wave5Rows: 0, wave4ZeroRound: 0, wave5ZeroRound: 0, rows: [] };
  const seen = {};
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    const r = bySeed[s];
    for (const row of r.launched.concat(r.wild)) {
      if (row.fight.outcome !== 'vKill') continue;
      const rounds = row.fight.rounds | 0;
      if (row.fight.wave === 4) { out.wave4Rows++; if (rounds < 1) out.wave4ZeroRound++; }
      if (row.fight.wave === 5) { out.wave5Rows++; if (rounds < 1) out.wave5ZeroRound++; }
      if (rounds < 1) continue;
      const key = r.seed + '|' + row.fight.day + '|' + row.fight.vid + '|' + row.fight.mid;
      if (seen[key]) continue;
      seen[key] = true;
      if (row.fight.wave === 4) out.wave4++;
      if (row.fight.wave === 5) out.wave5++;
      out.rows.push({ seed: r.seed, day: row.fight.day, vid: row.fight.vid, mid: row.fight.mid, wave: row.fight.wave, rounds: rounds, launched: !!row.event });
    }
  }
  return out;
}

// Taught observations + share mechanism, per leg: taught rows
// (source 'taught', any wave — the channel firing), wave-4/5
// taught rows, taught learns (known false -> true), offers,
// pending left at end of run. Delays: offer day -> taught-learn
// day per species per seed (the dawn delay).
function shareStats(bySeed) {
  let taught = 0, taughtW45 = 0, taughtLearns = 0, taughtLearnsW45 = 0, offers = 0;
  const taughtBySpecies = {}, offersBySpecies = {}, delays = [];
  const pendingEnd = {};
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    const j = bySeed[s].raw;
    const rows = (j.trickObservations || []);
    const offs = (j.trickShareOffers || []);
    offers += offs.length;
    for (const o of offs) {
      offersBySpecies[o.mid] = (offersBySpecies[o.mid] || 0) + 1;
    }
    const firstOffer = {};
    for (const o of offs) if (firstOffer[o.mid] == null || o.day < firstOffer[o.mid]) firstOffer[o.mid] = o.day;
    for (const r of rows) {
      if (r.source !== 'taught') continue;
      taught++;
      taughtBySpecies[r.mid] = (taughtBySpecies[r.mid] || 0) + 1;
      if (r.wave === 4 || r.wave === 5) taughtW45++;
      if (r.knownBefore === false && r.knownAfter === true) {
        taughtLearns++;
        if (r.wave === 4 || r.wave === 5) taughtLearnsW45++;
        if (firstOffer[r.mid] != null) delays.push({ seed: s, mid: r.mid, wave: r.wave, offerDay: firstOffer[r.mid], learnDay: r.day, delay: r.day - firstOffer[r.mid] });
      }
    }
    const pend = j.trickSharePendingEnd || {};
    for (const mid of Object.keys(pend)) {
      pendingEnd[mid] = (pendingEnd[mid] || []);
      pendingEnd[mid].push({ seed: s, teacher: pend[mid].teacher, offerDay: pend[mid].day });
    }
  }
  return { taught: taught, taughtW45: taughtW45, taughtLearns: taughtLearns, taughtLearnsW45: taughtLearnsW45,
    offers: offers, taughtBySpecies: taughtBySpecies, offersBySpecies: offersBySpecies,
    delays: delays, pendingEnd: pendingEnd };
}

// Gate trick-known: v4gates rows carry trickKnown (wave-4 gate
// consultations). Counts + rate per leg; denominators reported
// (a 0-row leg makes the bar uninformative, not a pass).
function gateKnown(bySeed) {
  let rows = 0, known = 0;
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    for (const g of ((bySeed[s].raw.v4gates) || [])) {
      rows++;
      if (g.trickKnown === true) known++;
    }
  }
  return { rows: rows, known: known, rate: rows ? known / rows : null };
}

// Deaths per 100 village-days (cost bar, panel metric).
function deathsPer100d(bySeed) {
  let deaths = 0, days = 0;
  for (const s of Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; })) {
    const j = bySeed[s].raw;
    deaths += (j.deaths || []).length;
    days += (j.days || 0);
  }
  return { deaths: deaths, days: days, per100d: days ? (deaths / days) * 100 : null };
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
  const wkReal = waveKillsReal(classifiedBySeed);
  const gates = gateCounts(out);
  const endKnown = trickKnownEnd(out);
  const share = shareStats(out);
  const gateK = gateKnown(out);
  const d100 = deathsPer100d(out);
  return {
    sum: sum, distinctKills: distinctKills, distinctKillCount: distinctKills.length,
    tricksLearned: learned, shares: shares, waveKills: wk, waveKillsReal: wkReal,
    gates: gates, trickKnownEnd: endKnown, share: share, gateKnown: gateK,
    deathsPer100d: d100,
    medianSurvival: sum.medianSurvival,
    starvation: sum.wall.starvation, deaths: sum.wall.deaths,
  };
}

// Panel deaths/100d signal: read the §15 panel compare JSON when it
// exists (build-trickshare-panels writes trickshare-a-panel.json
// with a per-metric verdict map). 'unchecked' when the panel has
// not been built yet — the bar then defers to the evidence run,
// which must build the panel before judging. Never a silent pass.
function panelDeaths100dSignal() {
  try {
    const pf = path.join(REPO, 'evidence', '2026-11-16', 'trickshare-a-panel.json');
    if (!fs.existsSync(pf)) return 'unchecked';
    const j = JSON.parse(fs.readFileSync(pf, 'utf8'));
    // The panel JSON is the balance-scorecard compare report:
    // { decision, policies: [{ policy, metrics: [{ id, status, delta, interval95 }] }] }.
    for (const p of (j.policies || [])) {
      for (const m of (p.metrics || [])) {
        if (m.id === 'villageDeaths100Days') return m.status || 'unknown';
      }
    }
    return 'unknown';
  } catch (e) { return 'unknown'; }
}

function main() {
  const panelDeathsSignal = panelDeaths100dSignal();
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
  bars.push({ id: '(a) taught observations > 0 on the armed leg', pass: armed.share.taught > 0,
    detail: 'armed ' + armed.share.taught + ' taught rows (' + armed.share.taughtW45 + ' wave-4/5), control ' + control.share.taught });
  bars.push({ id: '(b) gate trick-known rises vs control', pass: (control.gateKnown.rows > 0 || armed.gateKnown.rows > 0) && armed.gateKnown.known > control.gateKnown.known && (armed.gateKnown.rate == null || control.gateKnown.rate == null || armed.gateKnown.rate >= control.gateKnown.rate),
    detail: 'armed ' + armed.gateKnown.known + '/' + armed.gateKnown.rows + ' (' + (armed.gateKnown.rate == null ? 'n/a' : (armed.gateKnown.rate * 100).toFixed(1) + '%') + '), control ' + control.gateKnown.known + '/' + control.gateKnown.rows + ' (' + (control.gateKnown.rate == null ? 'n/a' : (control.gateKnown.rate * 100).toFixed(1) + '%') + ')' });
  bars.push({ id: '(c) PRIMARY all-origins wave-4 kills (distinct, rounds>=1) armed > control', pass: armed.waveKillsReal.wave4 > control.waveKillsReal.wave4,
    detail: 'armed ' + armed.waveKillsReal.wave4 + ' (rows ' + armed.waveKillsReal.wave4Rows + ', 0-round ' + armed.waveKillsReal.wave4ZeroRound + '), control ' + control.waveKillsReal.wave4 + ' (rows ' + control.waveKillsReal.wave4Rows + ', 0-round ' + control.waveKillsReal.wave4ZeroRound + ')' });
  bars.push({ id: 'cost: starvation armed <= control + 2', pass: armed.starvation <= control.starvation + 2,
    detail: 'armed ' + armed.starvation + ', control ' + control.starvation });
  bars.push({ id: 'cost: median survival armed >= 0.8x control', pass: control.medianSurvival != null && armed.medianSurvival != null && armed.medianSurvival >= 0.8 * control.medianSurvival,
    detail: 'armed ' + armed.medianSurvival + 'd, control ' + control.medianSurvival + 'd (0.8x = ' + (control.medianSurvival == null ? 'n/a' : (0.8 * control.medianSurvival).toFixed(1)) + ')' });
  bars.push({ id: 'cost: deaths/100d not a panel regression_signal (panel verdict read separately)', pass: panelDeathsSignal !== 'regression_signal' && panelDeathsSignal !== 'unchecked' && panelDeathsSignal !== 'unknown',
    detail: 'panel deaths/100d signal: ' + String(panelDeathsSignal) + ' (armed ' + (armed.deathsPer100d.per100d == null ? 'n/a' : armed.deathsPer100d.per100d.toFixed(2)) + '/100d, control ' + (control.deathsPer100d.per100d == null ? 'n/a' : control.deathsPer100d.per100d.toFixed(2)) + '/100d)' });
  bars.push({ id: 'instrument clean (0 errors, 8/8 parse both legs)', pass: instrumentErrors === 0 && controlParse.files.length === 8 && armedParse.files.length === 8 && controlParse.errors.length === 0 && armedParse.errors.length === 0,
    detail: 'errors ' + instrumentErrors + ', control ' + controlParse.files.length + '/8, armed ' + armedParse.files.length + '/8' });
  const go = bars.every(function (b) { return b.pass; });

  console.log('== trickshare-a analysis ==');
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
  console.log('--- share mechanism (taught channel) ---');
  console.log('control: taught observations ' + control.share.taught + ' (' + control.share.taughtW45 + ' wave-4/5), taught learns ' + control.share.taughtLearns + ' (' + control.share.taughtLearnsW45 + ' wave-4/5), offers ' + control.share.offers);
  console.log('armed:   taught observations ' + armed.share.taught + ' (' + armed.share.taughtW45 + ' wave-4/5), taught learns ' + armed.share.taughtLearns + ' (' + armed.share.taughtLearnsW45 + ' wave-4/5), offers ' + armed.share.offers);
  console.log('armed taught by species: ' + JSON.stringify(armed.share.taughtBySpecies) + '; offers by species: ' + JSON.stringify(armed.share.offersBySpecies));
  console.log('armed offer->learn delays: ' + JSON.stringify(armed.share.delays));
  console.log('armed pending left at end of run: ' + JSON.stringify(armed.share.pendingEnd));
  console.log('gate trick-known: control ' + control.gateKnown.known + '/' + control.gateKnown.rows + ', armed ' + armed.gateKnown.known + '/' + armed.gateKnown.rows);
  console.log('PRIMARY (distinct wave-4 kills, rounds>=1): control ' + control.waveKillsReal.wave4 + ', armed ' + armed.waveKillsReal.wave4 + ' (wave-5: control ' + control.waveKillsReal.wave5 + ', armed ' + armed.waveKillsReal.wave5 + ')');
  console.log('deaths/100d: control ' + (control.deathsPer100d.per100d == null ? 'n/a' : control.deathsPer100d.per100d.toFixed(2)) + ' (' + control.deathsPer100d.deaths + '/' + control.deathsPer100d.days + 'd), armed ' + (armed.deathsPer100d.per100d == null ? 'n/a' : armed.deathsPer100d.per100d.toFixed(2)) + ' (' + armed.deathsPer100d.deaths + '/' + armed.deathsPer100d.days + 'd); panel signal: ' + String(panelDeathsSignal));
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
    arm: 'trickshare-a', run: 'fleshout-20261116T2015Z', seeds: SEEDS, policy: 'competent',
    control: control, armed: armed, bars: bars, go: go,
    instrumentErrors: instrumentErrors,
  };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(analysis, null, 2) + '\n');
  console.log('wrote ' + path.relative(REPO, OUT_FILE));
  if (!go) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { SEEDS: SEEDS, parseLeg: parseLeg, summarize: summarize, distinctLaunchedKills: distinctLaunchedKills, tricksLearned: tricksLearned, waveKillsReal: waveKillsReal, shareStats: shareStats, gateKnown: gateKnown, deathsPer100d: deathsPer100d };
