// linkdrive-analyze-20261107.js — before/after analyzer for arm
// sim-linkdrive-b. Reads evidence/2026-11-07/perseed-linkdrive-b/
// (8 staged baseline + 8 armed, identical seeds) and prints the
// per-seed table, the pooled GO verdict against the preregged bar,
// the gate classification on armed no-regional days, and the wall
// numbers. Reads stored JSONs only; runs no sims.
// Usage: node scripts/linkdrive-analyze-20261107.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-07', 'perseed-linkdrive-b');
const SEEDS = [53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008];

function load(run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(DIR, 'linkdrive-s' + seed + '-' + run + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
  }
  return rows;
}

function shapeOf(link) {
  if (!link) return '?';
  if (link.kind === 'covenant' || link.kind === 'trade') return 'LEAGUE';
  if (link.primary === 'haven') return 'LEAD';
  if (link.subordinate === 'haven') return 'BELONG';
  return '?';
}
function w4kills(r) { return ((r.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); })).length; }
function starvation(r) { return ((r.teleDeaths || []).filter(function (e) { return e && e.cause === 'starvation'; })).length; }
function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function summarize(r) {
  const daily = r.daily || [];
  const last = daily[daily.length - 1] || {};
  const links = last.links || [];
  const shapes = {};
  links.forEach(function (l) { const s = shapeOf(l); shapes[s] = (shapes[s] || 0) + 1; });
  const diploSeries = daily.map(function (d) { return (d.standingBreakdown && d.standingBreakdown.diplomacy) || 0; });
  const maxDiplo = diploSeries.length ? Math.max.apply(null, diploSeries) : 0;
  const endDiplo = (last.standingBreakdown && last.standingBreakdown.diplomacy) || 0;
  const diploDays = diploSeries.filter(function (x) { return x > 0; }).length;
  const regionalDays = daily.filter(function (d) { return d.networkLive; }).length;
  const pairDays = daily.filter(function (d) { return d.pairDay; }).length;
  const ready5Days = daily.filter(function (d) { return d.readiness5; }).length;
  const w5faced = daily.some(function (d) { return (d.w4facedTypes || []).some(function (t) { return /wave.?5|w5/i.test(String(t)); }); })
    || ((r.wavesFaced || []).some(function (w) { return (w | 0) >= 5; }));
  const gateSeen = {};
  daily.forEach(function (d) { gateSeen[d.gate || '?'] = (gateSeen[d.gate || '?'] | 0) + 1; });
  const raises = last.raiseHistory || [];
  const expired = raises.filter(function (x) { return x.outcome === 'expired'; }).length;
  const acceptedR = raises.filter(function (x) { return x.outcome === 'accepted'; }).length;
  const refusedR = raises.filter(function (x) { return x.outcome === 'refused'; }).length;
  const pendingR = (last.pendingRaises || []).length;
  const stagedR = raises.length + pendingR;
  const ld = r.linkdriveStats || {};
  const natDays = daily.filter(function (d) { return d.pendingNational; }).length;
  return {
    seed: r.seed, days: r.days, end: r.endReason, scale: r.scaleRank,
    maxWave: r.maxWave, w5faced: !!w5faced, ready5Days: ready5Days,
    standing: r.standing, w4kills: w4kills(r), pairDays: pairDays,
    everLinks: (last.everLinks | 0), activeLinks: (last.activeLinks | 0),
    shapes: shapes, firstLinkDay: r.firstLinkDay,
    networkLiveDay: last.networkLiveDay || null, regionalDays: regionalDays,
    maxDiplo: maxDiplo, endDiplo: endDiplo, diploDays: diploDays,
    raisesStaged: stagedR, raisesExpired: expired, raisesAccepted: acceptedR,
    raisesRefused: refusedR, raisesPending: pendingR,
    proposeCalls: (last.proposeCalls | 0), proposeFormed: (last.proposeFormed | 0),
    proposeCounter: (last.proposeCounter | 0), answerCounterCalls: (last.answerCounterCalls | 0),
    answerAccordCalls: (last.answerAccordCalls | 0),
    acceptRaiseCalls: (last.acceptLinkRaiseCalls | 0),
    starvation: starvation(r), deaths: (r.teleDeaths || []).length,
    instrumentErrors: (r.instrumentErrors || []).length,
    gateSeen: gateSeen, nationalPendingDays: natDays,
    ld: ld,
  };
}

function main() {
  const base = load('linkdrive-base').map(summarize);
  const armed = load('linkdrive-armed').map(summarize);
  const out = { base: base, armed: armed };
  // GO verdict (preregged):
  // (a) links ≥3/8 armed; (b) regional ≥2/8 armed;
  // (c) starvation armed ≤ baseline+2 AND arm-only seeds ≤2;
  // (d) median armed ≥ 0.8 × baseline median.
  const baseStarv = base.reduce(function (t, s) { return t + s.starvation; }, 0);
  const armedStarv = armed.reduce(function (t, s) { return t + s.starvation; }, 0);
  const armOnlyStarv = armed.reduce(function (t, s, i) { return t + (base[i].starvation === 0 ? s.starvation : 0); }, 0);
  const baseMed = median(base.map(function (s) { return s.days; }));
  const armedMed = median(armed.map(function (s) { return s.days; }));
  const linksSeeds = armed.filter(function (s) { return s.everLinks > 0; }).length;
  const regionalSeeds = armed.filter(function (s) { return s.scale && s.scale !== 'village'; }).length;
  const baseW4 = base.reduce(function (t, s) { return t + s.w4kills; }, 0);
  const armedW4 = armed.reduce(function (t, s) { return t + s.w4kills; }, 0);
  const basePair = base.reduce(function (t, s) { return t + s.pairDays; }, 0);
  const armedPair = armed.reduce(function (t, s) { return t + s.pairDays; }, 0);
  out.verdict = {
    linksSeeds: linksSeeds, linksBar: 3, linksPass: linksSeeds >= 3,
    regionalSeeds: regionalSeeds, regionalBar: 2, regionalPass: regionalSeeds >= 2,
    starvationBase: baseStarv, starvationArmed: armedStarv, starvationCap: baseStarv + 2,
    starvationArmOnly: armOnlyStarv, starvationArmOnlyCap: 2,
    starvationPass: armedStarv <= baseStarv + 2 && armOnlyStarv <= 2,
    medianBase: baseMed, medianArmed: armedMed, medianFloor: 0.8 * baseMed,
    medianPass: armedMed >= 0.8 * baseMed,
    w4Base: baseW4, w4Armed: armedW4, pairBase: basePair, pairArmed: armedPair,
    pairGuardPass: armedW4 >= baseW4 - 2 && armedPair >= 0.9 * basePair,
  };
  out.verdict.go = out.verdict.linksPass && out.verdict.regionalPass
    && out.verdict.starvationPass && out.verdict.medianPass;
  // Baseline exact-reproduction guard vs regionalstep headlines.
  const expectDays = { 53001: 106, 53002: 150, 53003: 92, 53004: 88, 53005: 89, 53006: 150, 53007: 150, 53008: 123 };
  const expectW4 = { 53001: 1, 53002: 1, 53003: 2, 53004: 1, 53005: 0, 53006: 8, 53007: 4, 53008: 0 };
  out.baselineGuard = base.map(function (s) {
    return { seed: s.seed, daysOk: s.days === expectDays[s.seed], w4Ok: s.w4kills === expectW4[s.seed],
      linksOk: s.everLinks === 0, regionalOk: s.scale === 'village', errorsOk: s.instrumentErrors === 0,
      days: s.days, w4kills: s.w4kills, everLinks: s.everLinks, scale: s.scale, errors: s.instrumentErrors };
  });
  out.baselineGuardPass = out.baselineGuard.every(function (g) { return g.daysOk && g.w4Ok && g.linksOk && g.regionalOk && g.errorsOk; });
  out.armedErrors = armed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  // Wall numbers.
  function wall(rows) {
    return {
      national: rows.filter(function (s) { return s.scale === 'national' || s.scale === 'global'; }).length,
      table: rows.filter(function (s) { return s.scale === 'global'; }).length,
      wins: 0, wave4unlock: rows.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
      wave5unlock: rows.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
      wave5faced: rows.filter(function (s) { return s.w5faced; }).length,
      medianSurvival: median(rows.map(function (s) { return s.days; })),
    };
  }
  out.wall = { base: wall(base), armed: wall(armed) };
  if (process.argv.includes('--json')) { console.log(JSON.stringify(out, null, 2)); return; }
  console.log('seed  leg    days end           scale    maxW w5  r5d  stand w4k pair links(shape) firstLink dawn regDays maxDip endDip raises(st/exp/acc) prop(c/f) starv errs');
  [ ['base', base], ['armed', armed] ].forEach(function (pair) {
    pair[1].forEach(function (s) {
      const sh = Object.keys(s.shapes).map(function (k) { return k + ':' + s.shapes[k]; }).join(',') || '-';
      console.log(String(s.seed) + ' ' + pair[0].padEnd(6) + ' ' + String(s.days).padStart(4)
        + ' ' + String(s.end || '?').padEnd(13) + ' ' + String(s.scale || '?').padEnd(8)
        + ' ' + String(s.maxWave).padStart(4) + ' ' + (s.w5faced ? 'Y' : '.') + '  '
        + String(s.ready5Days).padStart(3) + ' ' + String(s.standing == null ? '?' : s.standing).padStart(5)
        + ' ' + String(s.w4kills).padStart(3) + ' ' + String(s.pairDays).padStart(4)
        + ' ' + String(s.everLinks).padStart(2) + '(' + sh + ')'
        + ' ' + String(s.firstLinkDay == null ? '-' : s.firstLinkDay).padStart(4)
        + ' ' + String(s.networkLiveDay == null ? '-' : s.networkLiveDay).padStart(4)
        + ' ' + String(s.regionalDays).padStart(4)
        + ' ' + String(s.maxDiplo).padStart(5) + ' ' + String(s.endDiplo).padStart(5)
        + ' ' + String(s.raisesStaged).padStart(2) + '/' + String(s.raisesExpired).padStart(2) + '/' + String(s.raisesAccepted).padStart(2)
        + ' ' + String(s.proposeCalls).padStart(2) + '/' + String(s.proposeFormed).padStart(2)
        + ' ' + String(s.starvation).padStart(2) + ' ' + String(s.instrumentErrors).padStart(2));
    });
  });
  console.log('\nGO VERDICT (preregged): ' + (out.verdict.go ? 'GO' : 'NO-GO'));
  console.log('  links ≥3/8: ' + out.verdict.linksSeeds + '/8 ' + (out.verdict.linksPass ? 'PASS' : 'FAIL'));
  console.log('  regional ≥2/8: ' + out.verdict.regionalSeeds + '/8 ' + (out.verdict.regionalPass ? 'PASS' : 'FAIL'));
  console.log('  starvation armed ' + out.verdict.starvationArmed + ' ≤ base+2=' + out.verdict.starvationCap + ', arm-only ' + out.verdict.starvationArmOnly + ' ≤ 2: ' + (out.verdict.starvationPass ? 'PASS' : 'FAIL'));
  console.log('  median armed ' + out.verdict.medianArmed + ' ≥ 0.8×base ' + out.verdict.medianFloor + ': ' + (out.verdict.medianPass ? 'PASS' : 'FAIL'));
  console.log('  pair guard (w4 ' + out.verdict.w4Armed + ' vs base ' + out.verdict.w4Base + ', pair-days ' + out.verdict.pairArmed + ' vs ' + out.verdict.pairBase + '): ' + (out.verdict.pairGuardPass ? 'PASS' : 'FAIL'));
  console.log('BASELINE GUARD (exact regionalstep reproduction): ' + (out.baselineGuardPass ? 'PASS' : 'FAIL'));
  out.baselineGuard.forEach(function (g) {
    if (!(g.daysOk && g.w4Ok && g.linksOk && g.regionalOk && g.errorsOk)) console.log('  seed ' + g.seed + ': days ' + g.days + ' w4 ' + g.w4kills + ' links ' + g.everLinks + ' scale ' + g.scale + ' errors ' + g.errors);
  });
  console.log('ARMED instrument errors total: ' + out.armedErrors);
  console.log('WALL base: ' + JSON.stringify(out.wall.base));
  console.log('WALL armed: ' + JSON.stringify(out.wall.armed));
  console.log('\nARMED no-regional gate days:');
  const gates = {};
  armed.forEach(function (s) { Object.keys(s.gateSeen).forEach(function (g) { gates[g] = (gates[g] || 0) + s.gateSeen[g]; }); });
  console.log('  ' + JSON.stringify(gates));
}

if (require.main === module) main();
module.exports = { load: load, summarize: summarize, SEEDS: SEEDS };
