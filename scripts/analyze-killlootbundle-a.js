// analyze-killlootbundle-a.js — analyzer for arm sim-killlootbundle-a
// (kill-loot searcaster bundle, KILLBUNDLE=1).
//   node scripts/analyze-killlootbundle-a.js --dir <dir> --out <file>
//   node scripts/analyze-killlootbundle-a.js --compare <ctlDir> <armDir> [--out <file>]
//   node scripts/analyze-killlootbundle-a.js --selftest
// Metrics (frozen in the prereg): kill-loot searcaster arrivals + cells
// bundled at arrival, contest grants, total gun ARRIVALS, volleys fired
// from kill-loot guns, holder-days with cells, guardrails (starvation
// deaths + median survival). A miss is NO-GO, never re-scored.
'use strict';
const fs = require('fs');
const path = require('path');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}
function loadDir(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/killlootbundle-a-s\d+-killlootbundle-a-(ctl|arm)\.json$/.test(f)) continue;
    out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}
function isStarv(d) {
  const s = String((d && (d.cause || d.kind)) || '').toLowerCase();
  return s.indexOf('starv') !== -1 || s.indexOf('hunger') !== -1;
}
function analyzeSeed(c) {
  const kl = (c.killLootEvents || []).filter(function (e) { return e.dropId === 'searcaster'; });
  const klBundled = kl.filter(function (e) {
    return (e.gains || []).some(function (g) { return g.cellsGained === 2; });
  });
  const klHolders = {};
  kl.forEach(function (e) {
    const g = (e.gains || []).filter(function (x) { return x.gunsGained > 0; })[0];
    klHolders[g ? g.holder : e.vid] = true;
  });
  const contestGrants = (c.prizeEvents || []).filter(function (e) {
    return (e.gains || []).some(function (g) { return g.gunsGained > 0; });
  });
  const contestGrantDays = contestGrants.map(function (e) { return e.day; });
  const searGrantEvents = (c.grantEvents || []).filter(function (e) { return e.itemId === 'searcaster'; });
  const volleys = (c.volleyEvents || []).filter(function (e) { return e.rwId === 'searcaster' && (e.shots || 0) > 0; });
  const klVolleys = volleys.filter(function (e) { return !!klHolders[e.vid]; });
  let holderDaysCells = 0;
  (c.v4gunLoc || []).forEach(function (row) {
    const seen = {};
    (row.locations || []).forEach(function (l) {
      if (l.loc === 'equipped' && klHolders[l.vid] && (l.cells || 0) > 0 && !seen[l.vid]) {
        seen[l.vid] = true;
        holderDaysCells++;
      }
    });
  });
  const starv = (c.deaths || []).filter(isStarv).length;
  return {
    seed: c.seed, mode: c.mode, days: c.gameDays, endReason: c.endReason,
    won: !!c.won, villageLost: !!c.villageLost, maxWave: c.maxWave,
    standing: c.standing, scaleRank: c.scaleRank,
    contests: (c.contestEvents || []).length,
    prizeRolls: (c.prizeEvents || []).length,
    contestGrants: contestGrants.length, contestGrantDays: contestGrantDays,
    searGrantEvents: searGrantEvents.length,
    klArrivals: kl.length, klBundled: klBundled.length, klDry: kl.length - klBundled.length,
    klArrivalDays: kl.map(function (e) { return { day: e.day, vid: e.vid, cellsGained: ((e.gains || [])[0] || {}).cellsGained || 0 }; }),
    totalArrivals: contestGrants.length + kl.length,
    klHolders: Object.keys(klHolders),
    searVolleys: volleys.length,
    searVolleyShots: volleys.reduce(function (a, e) { return a + (e.shots || 0); }, 0),
    klVolleys: klVolleys.length,
    klVolleyShots: klVolleys.reduce(function (a, e) { return a + (e.shots || 0); }, 0),
    klVolleyDays: klVolleys.map(function (e) { return { day: e.day, vid: e.vid, shots: e.shots, hits: e.hits, dmg: e.dmg }; }),
    holderDaysCells: holderDaysCells,
    deaths: (c.deaths || []).length, starvDeaths: starv,
    instrumentErrors: (c.instrumentErrors || []).length,
    killbundleOn: !!c.killbundleOn, killbundlePresent: !!c.killbundlePresent,
  };
}
function analyzeLeg(corpora) {
  const per = corpora.map(analyzeSeed);
  const sum = function (k) { return per.reduce(function (a, s) { return a + (s[k] || 0); }, 0); };
  return {
    mode: per.length ? per[0].mode : null, seeds: per.map(function (s) { return s.seed; }),
    perSeed: per,
    wins: sum('won'), national: per.filter(function (s) { return String(s.scaleRank || '').toLowerCase().indexOf('national') !== -1; }).length,
    wave5: per.filter(function (s) { return (s.maxWave || 0) >= 5; }).length,
    wave4: per.filter(function (s) { return (s.maxWave || 0) >= 4; }).length,
    medianSurvival: median(per.map(function (s) { return s.days || 0; })),
    villageLost: per.filter(function (s) { return s.villageLost; }).length,
    contests: sum('contests'), prizeRolls: sum('prizeRolls'),
    contestGrants: sum('contestGrants'),
    klArrivals: sum('klArrivals'), klBundled: sum('klBundled'), klDry: sum('klDry'),
    totalArrivals: sum('totalArrivals'),
    searVolleys: sum('searVolleys'), searVolleyShots: sum('searVolleyShots'),
    klVolleys: sum('klVolleys'), klVolleyShots: sum('klVolleyShots'),
    holderDaysCells: sum('holderDaysCells'),
    deaths: sum('deaths'), starvDeaths: sum('starvDeaths'),
    instrumentErrors: sum('instrumentErrors'),
  };
}
function judgeLeg(leg) {
  const bars = {};
  bars.instrument = { pass: leg.instrumentErrors === 0, detail: 'errors=' + leg.instrumentErrors };
  const attributed = leg.perSeed.every(function (s) {
    return s.klArrivals === s.klArrivalDays.length;
  });
  bars.coverage = { pass: attributed, detail: 'all kill-loot drops carry cells-at-arrival diffs: ' + attributed };
  return bars;
}
// Guardrail "no material signal" (frozen): starvation deaths move by at
// most +2 and median survival falls by at most 20 days arm-vs-ctl. The
// lever adds ammo, never food — a bigger move is a real bug, not noise.
function judgeCompare(ctl, arm) {
  const bars = {};
  bars.pilotGO = {
    pass: arm.klBundled >= 1 && arm.klVolleys >= 1 && ctl.klBundled === 0,
    detail: 'arm bundled=' + arm.klBundled + ' arm klVolleys=' + arm.klVolleys + ' ctl bundled=' + ctl.klBundled,
    inconclusive: (ctl.klArrivals + arm.klArrivals) === 0,
  };
  const starvDelta = arm.starvDeaths - ctl.starvDeaths;
  const medDelta = (arm.medianSurvival || 0) - (ctl.medianSurvival || 0);
  bars.guardrails = {
    pass: starvDelta <= 2 && medDelta >= -20,
    detail: 'starvDeaths ctl=' + ctl.starvDeaths + ' arm=' + arm.starvDeaths + ' (delta ' + starvDelta + '); medianSurvival ctl=' + ctl.medianSurvival + ' arm=' + arm.medianSurvival + ' (delta ' + medDelta + ')',
  };
  const verdict = bars.pilotGO.inconclusive ? 'INCONCLUSIVE'
    : (bars.pilotGO.pass && bars.guardrails.pass ? 'GO' : 'NO-GO');
  return { bars: bars, verdict: verdict };
}
function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond) { if (cond) pass++; else { fail++; console.log('SELFTEST FAIL: ' + name); } }
  // Fixture: one bundled kill-loot arrival + one volley from that holder.
  const c = {
    seed: 1, mode: 'arm', gameDays: 150, endReason: 'survived', won: false,
    villageLost: false, maxWave: 5, standing: 500, scaleRank: 'village',
    contestEvents: [{}, {}], prizeEvents: [{ gains: [{ holder: 'bob', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }],
    grantEvents: [{ itemId: 'searcaster', caller: 'contest-prize' }],
    killLootEvents: [{ day: 71, vid: 'amina', dropId: 'searcaster', gains: [{ holder: 'amina', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }],
    volleyEvents: [{ day: 90, vid: 'amina', rwId: 'searcaster', shots: 2, hits: 1, dmg: 9 }],
    v4gunLoc: [
      { day: 71, locations: [{ loc: 'equipped', vid: 'amina', count: 1, cells: 2 }], total: 1 },
      { day: 72, locations: [{ loc: 'equipped', vid: 'amina', count: 1, cells: 2 }], total: 1 },
      { day: 90, locations: [{ loc: 'equipped', vid: 'amina', count: 1, cells: 0 }], total: 1 },
    ],
    deaths: [{ day: 50, cause: 'monster' }],
    instrumentErrors: [],
  };
  const s = analyzeSeed(c);
  check('seed: klArrivals 1', s.klArrivals === 1);
  check('seed: klBundled 1', s.klBundled === 1);
  check('seed: klDry 0', s.klDry === 0);
  check('seed: contestGrants 1', s.contestGrants === 1);
  check('seed: totalArrivals 2', s.totalArrivals === 2);
  check('seed: klVolleys 1', s.klVolleys === 1);
  check('seed: klVolleyShots 2', s.klVolleyShots === 2);
  check('seed: holderDaysCells 2', s.holderDaysCells === 2);
  check('seed: starvDeaths 0', s.starvDeaths === 0);
  // Fixture: dry ctl arrival — no bundle, no volley.
  const c2 = JSON.parse(JSON.stringify(c));
  c2.mode = 'ctl';
  c2.killLootEvents = [{ day: 71, vid: 'amina', dropId: 'searcaster', gains: [{ holder: 'amina', gunsGained: 1, cellsGained: 0, cellsAfter: 0 }] }];
  c2.volleyEvents = [];
  c2.v4gunLoc = [{ day: 71, locations: [{ loc: 'equipped', vid: 'amina', count: 1, cells: 0 }], total: 1 }];
  const s2 = analyzeSeed(c2);
  check('ctl: klBundled 0', s2.klBundled === 0);
  check('ctl: klDry 1', s2.klDry === 1);
  check('ctl: klVolleys 0', s2.klVolleys === 0);
  check('ctl: holderDaysCells 0', s2.holderDaysCells === 0);
  // Compare fixtures.
  const legCtl = analyzeLeg([c2]);
  const legArm = analyzeLeg([c]);
  const cmp = judgeCompare(legCtl, legArm);
  check('compare: GO', cmp.verdict === 'GO');
  check('compare: guardrails pass', cmp.bars.guardrails.pass === true);
  // Zero-arrival both legs -> INCONCLUSIVE.
  const c3 = JSON.parse(JSON.stringify(c2));
  c3.killLootEvents = []; c3.volleyEvents = []; c3.v4gunLoc = [];
  const cmp2 = judgeCompare(analyzeLeg([c3]), analyzeLeg([c3]));
  check('compare: zero arrivals INCONCLUSIVE', cmp2.verdict === 'INCONCLUSIVE');
  // Guardrail: starvation jump is a fail.
  const c4 = JSON.parse(JSON.stringify(c));
  c4.deaths = [{ day: 20, cause: 'starvation' }, { day: 30, cause: 'starvation' }, { day: 40, cause: 'starvation' }];
  const cmp3 = judgeCompare(analyzeLeg([c2]), analyzeLeg([c4]));
  check('compare: starvation jump fails guardrail', cmp3.bars.guardrails.pass === false);
  console.log('SELFTEST: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) {
const args = process.argv.slice(2);
if (args.indexOf('--selftest') !== -1) {
  process.exit(selftest() ? 0 : 1);
} else if (args.indexOf('--compare') !== -1) {
  const i = args.indexOf('--compare');
  const dirA = args[i + 1], dirB = args[i + 2];
  if (!dirA || !dirB) { console.error('usage: --compare <ctlDir> <armDir> [--out <file>]'); process.exit(2); }
  const ctl = analyzeLeg(loadDir(dirA));
  const arm = analyzeLeg(loadDir(dirB));
  const cmp = judgeCompare(ctl, arm);
  const out = { ctl: ctl, arm: arm, verdict: cmp.verdict, bars: cmp.bars };
  const oi = args.indexOf('--out');
  if (oi !== -1 && args[oi + 1]) fs.writeFileSync(args[oi + 1], JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: cmp.verdict, ctl: { klArrivals: ctl.klArrivals, klBundled: ctl.klBundled, klVolleys: ctl.klVolleys, starvDeaths: ctl.starvDeaths, medianSurvival: ctl.medianSurvival }, arm: { klArrivals: arm.klArrivals, klBundled: arm.klBundled, klVolleys: arm.klVolleys, starvDeaths: arm.starvDeaths, medianSurvival: arm.medianSurvival }, bars: cmp.bars }, null, 2));
  process.exit(cmp.verdict === 'GO' || cmp.verdict === 'INCONCLUSIVE' ? 0 : 1);
} else {
  const di = args.indexOf('--dir');
  const dir = di !== -1 ? args[di + 1] : null;
  if (!dir) { console.error('usage: --selftest | --dir <dir> --out <file> | --compare <ctlDir> <armDir> [--out <file>]'); process.exit(2); }
  const leg = analyzeLeg(loadDir(dir));
  leg.bars = judgeLeg(leg);
  const oi = args.indexOf('--out');
  if (oi !== -1 && args[oi + 1]) fs.writeFileSync(args[oi + 1], JSON.stringify(leg, null, 2) + '\n');
  console.log(JSON.stringify(leg, null, 2));
  process.exit(0);
}
}

module.exports = { analyzeSeed: analyzeSeed, analyzeLeg: analyzeLeg, judgeCompare: judgeCompare, judgeLeg: judgeLeg, median: median, selftest: selftest };
