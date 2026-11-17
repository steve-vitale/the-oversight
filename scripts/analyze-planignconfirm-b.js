// analyze-planignconfirm-b.js — judge for arm sim-planignconfirm-b (CONFIRM:
// the planignite catch-22 fix, PLANFIX=1, on the FRESH band 103501-103512).
// Compares the two legs on this tip (control = flag off, armed = flag on,
// identical seeds) against the frozen prereg
// (evidence/2026-11-17/sim-planignconfirm-b-prereg.md).
//   Bar 1 (PRIMARY): wave-4 kills per plan departure armed >= control.
//     kills = killCalls with wave === 4; departures = v4departs rows
//     (launch + hold — the pilot's stated definition; kills per launch
//     reported alongside).
//   Bar 2: total deaths armed <= control x 1.10 (expedition deaths
//     reported alongside, not judged).
//   Bar 3: no-plan villages armed 0/12.
//   Bar 4: wave-5 unlocks armed >= control - 1 AND national-by-standing
//     (standing >= 300) armed >= control - 1.
//   Instrument: 12/12 files per leg, zero tick-gate mismatches, zero
//     holders without a creation, zero initializer disagreements.
// Reuses the PILOT analyzer's legSummary (scripts/analyze-planignite-fix-a.js)
// and the DIAG classifier — the pilot analyzer file itself is NOT modified.
// Bars 5 (proof green) and 6 (balanced panel attached) are judged in the
// evidence file, not here.
// Usage:
//   node scripts/analyze-planignconfirm-b.js <controlDir> <armedDir>
// Writes evidence/2026-11-17/planignconfirm-b-analysis.json. Exits 0
// iff bars 1-4 and the instrument hold.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const PILOT = require(path.join(REPO, 'scripts', 'analyze-planignite-fix-a'));

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

function legExtra(dir) {
  const loaded = loadDir(dir);
  let k4 = 0, k5 = 0, deaths = 0, expd = 0, w4unlock = 0, w5unlock = 0;
  let nat300 = 0, natRank = 0, table = 0, wins = 0;
  let depKillers = 0, depTarget = 0, launchKillers = 0, launchTarget = 0;
  let launches = 0, holds = 0;
  const deathCauses = {};
  const gameDays = [];
  const perSeed = [];
  for (const k of Object.keys(loaded.bySeed).sort()) {
    const j = loaded.bySeed[k];
    const kc = (j.killCalls || []).filter(function (x) { return x.wave === 4; }).length;
    const kc5 = (j.killCalls || []).filter(function (x) { return x.wave === 5; }).length;
    const dep = (j.v4departs || []).length;
    const ln = (j.v4departs || []).filter(function (r) { return r.result === 'launch'; }).length;
    const hd = dep - ln;
    const d = (j.deaths || []).length;
    const e = (j.deaths || []).filter(function (x) { return x.cause === 'expedition'; }).length;
    for (const x of (j.deaths || [])) deathCauses[x.cause || 'unknown'] = (deathCauses[x.cause || 'unknown'] || 0) + 1;
    k4 += kc; k5 += kc5; deaths += d; expd += e; launches += ln; holds += hd;
    if ((j.maxWave || 1) >= 4) w4unlock++;
    if ((j.maxWave || 1) >= 5) w5unlock++;
    if ((j.standing || 0) >= 300) nat300++;
    if (j.scaleRank === 'national' || j.scaleRank === 'global') natRank++;
    if (j.won) wins++;
    gameDays.push(j.gameDays);
    for (const r of (j.v4departs || [])) {
      if (r.partyKillers > 0) depKillers++;
      if (r.target) depTarget++;
    }
    for (const r of (j.v4departs || []).filter(function (x) { return x.result === 'launch'; })) {
      if (r.partyKillers > 0) launchKillers++;
      if (r.target) launchTarget++;
    }
    perSeed.push({ seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
      standing: j.standing, scaleRank: j.scaleRank, won: j.won, maxWave: j.maxWave,
      villageLost: j.villageLost, k4: kc, k5: kc5, departs: dep, launches: ln, holds: hd,
      deaths: d, expeditionDeaths: e, creates: (j.v4creates || []).length,
      firstCreationDay: (function () {
        let m = null;
        for (const c of (j.v4creates || [])) if (m == null || c.day < m) m = c.day;
        return m;
      })() });
  }
  return { files: loaded.files.length, perSeed: perSeed,
    k4: k4, k5: k5, departs: launches + holds, launches: launches, holds: holds,
    k4PerDepart: (launches + holds) ? k4 / (launches + holds) : null,
    k4PerLaunch: launches ? k4 / launches : null,
    deaths: deaths, expeditionDeaths: expd, deathCauses: deathCauses,
    medianSurvival: med(gameDays),
    w4unlock: w4unlock, w5unlock: w5unlock, nat300: nat300, natRank: natRank,
    table: table, wins: wins,
    depKillers: depKillers, depTarget: depTarget,
    launchKillers: launchKillers, launchTarget: launchTarget };
}

function main() {
  const controlDir = process.argv[2];
  const armedDir = process.argv[3];
  if (!controlDir || !armedDir) { console.error('PLANIGNCONFIRM ANALYZE STOP: controlDir armedDir required.'); process.exit(2); }
  const control = PILOT.legSummary(controlDir);
  const armed = PILOT.legSummary(armedDir);
  const cx = legExtra(controlDir);
  const ax = legExtra(armedDir);
  const bar1 = ax.k4PerDepart != null && cx.k4PerDepart != null && ax.k4PerDepart >= cx.k4PerDepart;
  const bar2 = ax.deaths <= cx.deaths * 1.10;
  const bar3 = armed.noPlanSeeds === 0;
  const bar4 = ax.w5unlock >= cx.w5unlock - 1 && ax.nat300 >= cx.nat300 - 1;
  const instrument = control.files === 12 && armed.files === 12 &&
    control.tickGateMismatches === 0 && armed.tickGateMismatches === 0 &&
    control.holdersWithoutCreation === 0 && armed.holdersWithoutCreation === 0 &&
    control.initializerDisagreements.length === 0 && armed.initializerDisagreements.length === 0;
  const out = {
    arm: 'planignconfirm-b', run: 'planignconfirm-b',
    controlDir: path.basename(controlDir), armedDir: path.basename(armedDir),
    control: control, armed: armed, controlExtra: cx, armedExtra: ax,
    bars: {
      killsPerDeparture: { pass: bar1, controlK4: cx.k4, controlDeparts: cx.departs,
        controlRatio: cx.k4PerDepart, armedK4: ax.k4, armedDeparts: ax.departs,
        armedRatio: ax.k4PerDepart,
        controlK4PerLaunch: cx.k4PerLaunch, armedK4PerLaunch: ax.k4PerLaunch },
      deaths: { pass: bar2, controlDeaths: cx.deaths, armedDeaths: ax.deaths,
        ratio: cx.deaths ? ax.deaths / cx.deaths : null, limit: cx.deaths * 1.10,
        controlExpeditionDeaths: cx.expeditionDeaths, armedExpeditionDeaths: ax.expeditionDeaths,
        controlDeathCauses: cx.deathCauses, armedDeathCauses: ax.deathCauses },
      noPlanZero: { pass: bar3, armedNoPlan: armed.noPlanSeeds, armedNoPlanList: armed.noPlanList,
        controlNoPlan: control.noPlanSeeds, controlNoPlanList: control.noPlanList },
      wall: { pass: bar4, controlW5: cx.w5unlock, armedW5: ax.w5unlock,
        controlNat300: cx.nat300, armedNat300: ax.nat300,
        controlNatRank: cx.natRank, armedNatRank: ax.natRank,
        controlW4: cx.w4unlock, armedW4: ax.w4unlock,
        controlWins: cx.wins, armedWins: ax.wins,
        controlMedianSurvival: cx.medianSurvival, armedMedianSurvival: ax.medianSurvival },
      instrument: { pass: instrument, controlFiles: control.files, armedFiles: armed.files,
        controlMismatches: control.tickGateMismatches, armedMismatches: armed.tickGateMismatches,
        controlHolders: control.holdersWithoutCreation, armedHolders: armed.holdersWithoutCreation,
        initializerDisagreements: control.initializerDisagreements.length + armed.initializerDisagreements.length },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-17', 'planignconfirm-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('=== planignconfirm-b control -> armed (fresh band 103501-103512) ===');
  console.log('control: k4 ' + cx.k4 + ' departs ' + cx.departs + ' k4/depart ' + (cx.k4PerDepart == null ? '-' : cx.k4PerDepart.toFixed(3)) +
    ' k4/launch ' + (cx.k4PerLaunch == null ? '-' : cx.k4PerLaunch.toFixed(3)) +
    ' deaths ' + cx.deaths + ' (exped ' + cx.expeditionDeaths + ')' +
    ' no-plan ' + control.noPlanSeeds + ' w5 ' + cx.w5unlock + ' nat300 ' + cx.nat300 +
    ' natRank ' + cx.natRank + ' wins ' + cx.wins + ' medianSurvival ' + cx.medianSurvival);
  console.log('armed:   k4 ' + ax.k4 + ' departs ' + ax.departs + ' k4/depart ' + (ax.k4PerDepart == null ? '-' : ax.k4PerDepart.toFixed(3)) +
    ' k4/launch ' + (ax.k4PerLaunch == null ? '-' : ax.k4PerLaunch.toFixed(3)) +
    ' deaths ' + ax.deaths + ' (exped ' + ax.expeditionDeaths + ')' +
    ' no-plan ' + armed.noPlanSeeds + ' w5 ' + ax.w5unlock + ' nat300 ' + ax.nat300 +
    ' natRank ' + ax.natRank + ' wins ' + ax.wins + ' medianSurvival ' + ax.medianSurvival);
  console.log('control departs with killer ' + cx.depKillers + '/' + cx.departs + ' with target ' + cx.depTarget + '/' + cx.departs +
    ' | launches with killer ' + cx.launchKillers + '/' + cx.launches + ' with target ' + cx.launchTarget + '/' + cx.launches);
  console.log('armed   departs with killer ' + ax.depKillers + '/' + ax.departs + ' with target ' + ax.depTarget + '/' + ax.departs +
    ' | launches with killer ' + ax.launchKillers + '/' + ax.launches + ' with target ' + ax.launchTarget + '/' + ax.launches);
  for (const s of ax.perSeed) {
    const c = cx.perSeed.find(function (x) { return x.seed === s.seed; }) || {};
    console.log('  seed ' + s.seed + ': k4 ' + (c.k4 || 0) + '->' + s.k4 +
      ' departs ' + (c.departs || 0) + '->' + s.departs +
      ' launches ' + (c.launches || 0) + '->' + s.launches +
      ' deaths ' + (c.deaths || 0) + '->' + s.deaths +
      ' firstCreationDay ' + (s.firstCreationDay != null ? s.firstCreationDay : '-') +
      ' days ' + s.gameDays + ' standing ' + s.standing + ' rank ' + s.scaleRank + ' maxWave ' + s.maxWave);
  }
  console.log('bars: killsPerDeparture=' + (bar1 ? 'PASS' : 'FAIL') + ' deaths=' + (bar2 ? 'PASS' : 'FAIL') +
    ' noPlanZero=' + (bar3 ? 'PASS' : 'FAIL') + ' wall=' + (bar4 ? 'PASS' : 'FAIL') +
    ' instrument=' + (instrument ? 'PASS' : 'FAIL'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !bar4 || !instrument) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { legExtra: legExtra };
