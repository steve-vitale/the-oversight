// analyze-killlootbundle-a.js — analyzer for arm sim-killlootbundle-a
// (kill-loot searcaster bundle, KILLBUNDLE=1).
//   node scripts/analyze-killlootbundle-a.js --dir <dir> --out <file>
//   node scripts/analyze-killlootbundle-a.js --compare <ctlDir> <armDir> [--out <file>]
//   node scripts/analyze-killlootbundle-a.js --rearm-compare <ctlDir> <armDir> [--out <file>]
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
  // REARM (sim-rearm-b): corpse-transfer takes + second-life volleys.
  // A re-arm event is one rearmTakeEvents record (a villager taking
  // fusion cells — and the gun, for kind 'second-life' — from a dead
  // holder's corpse). A second-life volley is a searcaster volley with
  // shots > 0 by a rearm taker on/after their take day: the gun speaks
  // again in new hands (either kind — the taker is always a second
  // villager holding cells taken from a corpse).
  const rearmTakes = (c.rearmTakeEvents || []).slice();
  const rearmTakers = {};
  rearmTakes.forEach(function (e) { rearmTakers[e.taker] = Math.min(rearmTakers[e.taker] == null ? 1e9 : rearmTakers[e.taker], e.day || 0); });
  const rearmVolleys = volleys.filter(function (e) {
    return rearmTakers[e.vid] != null && (e.day || 0) >= rearmTakers[e.vid];
  });
  const secondLifeTakers = {};
  rearmTakes.forEach(function (e) { if (e.kind === 'second-life') secondLifeTakers[e.taker] = true; });
  // Supply: staged (kill-loot) holders who DIED HOLDING CELLS — the
  // re-arm opportunities. A holder dies holding cells unless their
  // last sear-volley before death left ammoLeft 0 with no later cell
  // gain (a re-arm take) before death. Never-volleyed holders count.
  const deathsByVid = {};
  (c.deaths || []).forEach(function (d) { if (d.who) deathsByVid[d.who] = d.day || 0; });
  const klVolleysByVid = {};
  klVolleys.forEach(function (e) {
    (klVolleysByVid[e.vid] = klVolleysByVid[e.vid] || []).push(e);
  });
  let supplyDeaths = 0;
  Object.keys(klHolders).forEach(function (vid) {
    if (deathsByVid[vid] == null) return; // survived: no corpse, no opportunity
    const deathDay = deathsByVid[vid];
    const vs = (klVolleysByVid[vid] || []).filter(function (e) { return (e.day || 0) <= deathDay; });
    if (!vs.length) { supplyDeaths++; return; }
    const last = vs[vs.length - 1];
    if ((last.ammoLeft == null ? 1 : last.ammoLeft) > 0) { supplyDeaths++; return; }
    const regained = rearmTakes.some(function (e) { return e.taker === vid && (e.day || 0) > (last.day || 0) && (e.day || 0) <= deathDay; });
    if (regained) supplyDeaths++;
  });
  // Scholar-path context (killbundle-b §5: 2 of 17 arrivals): scholar
  // takes of a gun/cell from a kill-loot holder's corpse.
  const scholarTakes = (c.corpseTakeEvents || []).filter(function (e) {
    return (e.itemId === 'fusion_cell' || e.itemId === 'searcaster')
      && klHolders[e.corpseVid || ''];
  });
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
    rearmOn: !!c.rearmOn, rearmPresent: !!c.rearmPresent,
    rearmEvents: rearmTakes.length,
    rearmCellTakes: rearmTakes.filter(function (e) { return e.kind === 'rearm'; }).length,
    secondLifeTakes: rearmTakes.filter(function (e) { return e.kind === 'second-life'; }).length,
    rearmTakeDays: rearmTakes.map(function (e) { return { day: e.day, taker: e.taker, corpseVid: e.corpseVid, kind: e.kind, gun: e.gun, cells: e.cells, channel: e.channel || null }; }),
    secondLifeHolders: Object.keys(secondLifeTakers),
    rearmVolleys: rearmVolleys.length,
    rearmVolleyDays: rearmVolleys.map(function (e) { return { day: e.day, vid: e.vid, shots: e.shots, hits: e.hits, dmg: e.dmg }; }),
    supplyDeaths: supplyDeaths,
    scholarTakes: scholarTakes.length,
    scholarTakeDays: scholarTakes.map(function (e) { return { day: e.day, itemId: e.itemId, corpseVid: e.corpseVid }; }),
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
    rearmEvents: sum('rearmEvents'),
    rearmCellTakes: sum('rearmCellTakes'),
    secondLifeTakes: sum('secondLifeTakes'),
    rearmVolleys: sum('rearmVolleys'),
    supplyDeaths: sum('supplyDeaths'),
    scholarTakes: sum('scholarTakes'),
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
// REARM judge (sim-rearm-b, frozen in its prereg): the corpse-transfer
// path GOes only when a re-arm actually happens AND the re-armed gun
// actually fires again. Control must be clean (REARM unset ⇒ zero
// takes — a take on control means the env gate is broken). Supply-thin
// (no staged holder died holding cells on the armed leg) is
// INCONCLUSIVE, not a miss: a thin supply can't be re-scored as a miss
// or a pass after the fact.
function judgeRearmCompare(ctl, arm) {
  const bars = {};
  bars.instrument = {
    pass: (ctl.instrumentErrors || 0) === 0 && (arm.instrumentErrors || 0) === 0,
    detail: 'errors ctl=' + (ctl.instrumentErrors || 0) + ' arm=' + (arm.instrumentErrors || 0),
  };
  bars.controlClean = {
    pass: (ctl.rearmEvents || 0) === 0,
    detail: 'ctl rearmEvents=' + (ctl.rearmEvents || 0) + ' (must be 0: REARM unset)',
  };
  bars.supply = {
    pass: (arm.supplyDeaths || 0) >= 1,
    detail: 'arm supplyDeaths=' + (arm.supplyDeaths || 0) + ' (staged holders who died holding cells)',
    inconclusive: (arm.supplyDeaths || 0) === 0,
  };
  bars.rearmEvents = {
    pass: (arm.rearmEvents || 0) >= 1,
    detail: 'arm rearmEvents=' + (arm.rearmEvents || 0) + ' (rearm-kind ' + (arm.rearmCellTakes || 0) + ', second-life ' + (arm.secondLifeTakes || 0) + ')',
  };
  bars.secondLifeVolley = {
    pass: (arm.rearmVolleys || 0) >= 1,
    detail: 'arm rearmVolleys=' + (arm.rearmVolleys || 0) + ' (volleys by a rearm taker on/after the take day)',
  };
  const starvDelta = arm.starvDeaths - ctl.starvDeaths;
  const medDelta = (arm.medianSurvival || 0) - (ctl.medianSurvival || 0);
  bars.guardrails = {
    pass: starvDelta <= 2 && medDelta >= -20,
    detail: 'starvDeaths ctl=' + ctl.starvDeaths + ' arm=' + arm.starvDeaths + ' (delta ' + starvDelta + '); medianSurvival ctl=' + ctl.medianSurvival + ' arm=' + arm.medianSurvival + ' (delta ' + medDelta + ')',
  };
  const verdict = bars.supply.inconclusive ? 'INCONCLUSIVE'
    : (bars.instrument.pass && bars.controlClean.pass && bars.rearmEvents.pass
      && bars.secondLifeVolley.pass && bars.guardrails.pass ? 'GO' : 'NO-GO');
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
  // REARM (sim-rearm-b): a staged holder dies holding cells, a witness
  // takes gun + cells, and the taker fires at wave 4+ the next day.
  const c5 = JSON.parse(JSON.stringify(c));
  c5.mode = 'arm'; c5.rearmOn = true; c5.rearmPresent = true;
  c5.killLootEvents = [{ day: 71, vid: 'amina', dropId: 'searcaster', gains: [{ holder: 'amina', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }];
  c5.volleyEvents = [{ day: 90, vid: 'bob', rwId: 'searcaster', shots: 1, hits: 1, dmg: 33, ammoLeft: 0, wave: 4 }];
  c5.rearmTakeEvents = [{ day: 85, taker: 'bob', corpseVid: 'amina', corpseId: 'corpse_85_x', kind: 'second-life', gun: true, cells: 1 }];
  c5.deaths = [{ day: 85, who: 'amina', cause: 'monster' }];
  c5.corpseTakeEvents = [{ day: 86, itemId: 'fusion_cell', corpseVid: 'amina', toKind: 'scholar' }];
  const s5 = analyzeSeed(c5);
  check('rearm: rearmEvents 1', s5.rearmEvents === 1);
  check('rearm: secondLifeTakes 1', s5.secondLifeTakes === 1);
  check('rearm: secondLifeHolders bob', s5.secondLifeHolders.length === 1 && s5.secondLifeHolders[0] === 'bob');
  check('rearm: rearmVolleys 1 (taker fires after the take)', s5.rearmVolleys === 1);
  check('rearm: supplyDeaths 1 (amina died holding cells, never volleyed)', s5.supplyDeaths === 1);
  check('rearm: scholarTakes 1 (context, not a bar)', s5.scholarTakes === 1);
  // REARM control leg: same death, REARM unset, no takes.
  const c6 = JSON.parse(JSON.stringify(c5));
  c6.rearmOn = false; c6.rearmTakeEvents = []; c6.volleyEvents = [];
  const s6 = analyzeSeed(c6);
  check('rearm ctl: rearmEvents 0', s6.rearmEvents === 0);
  check('rearm ctl: rearmVolleys 0', s6.rearmVolleys === 0);
  check('rearm ctl: supplyDeaths still 1', s6.supplyDeaths === 1);
  const cmpR = judgeRearmCompare(analyzeLeg([c6]), analyzeLeg([c5]));
  check('rearm compare: GO', cmpR.verdict === 'GO');
  check('rearm compare: controlClean pass', cmpR.bars.controlClean.pass === true);
  // REARM supply-thin: the staged holder survives (no death) — INCONCLUSIVE.
  const c7 = JSON.parse(JSON.stringify(c5));
  c7.deaths = []; c7.rearmTakeEvents = []; c7.volleyEvents = [];
  const cmpR2 = judgeRearmCompare(analyzeLeg([c6]), analyzeLeg([c7]));
  check('rearm compare: supply-thin INCONCLUSIVE', cmpR2.verdict === 'INCONCLUSIVE');
  // REARM take with no volley: NO-GO (the path fires, the gun never speaks).
  const c8 = JSON.parse(JSON.stringify(c5));
  c8.volleyEvents = [];
  const cmpR3 = judgeRearmCompare(analyzeLeg([c6]), analyzeLeg([c8]));
  check('rearm compare: take-without-volley NO-GO', cmpR3.verdict === 'NO-GO');
  // REARM dry-at-death: holder fired both cells (ammoLeft 0) then died — no supply.
  const c9 = JSON.parse(JSON.stringify(c5));
  c9.volleyEvents = [{ day: 80, vid: 'amina', rwId: 'searcaster', shots: 2, hits: 1, dmg: 68, ammoLeft: 0, wave: 4 }];
  c9.rearmTakeEvents = [];
  const s9 = analyzeSeed(c9);
  check('rearm: fired-dry holder is not supply', s9.supplyDeaths === 0);
  console.log('SELFTEST: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) {
const args = process.argv.slice(2);
if (args.indexOf('--selftest') !== -1) {
  process.exit(selftest() ? 0 : 1);
} else if (args.indexOf('--rearm-compare') !== -1) {
  const i = args.indexOf('--rearm-compare');
  const dirA = args[i + 1], dirB = args[i + 2];
  if (!dirA || !dirB) { console.error('usage: --rearm-compare <ctlDir> <armDir> [--out <file>]'); process.exit(2); }
  const ctl = analyzeLeg(loadDir(dirA));
  const arm = analyzeLeg(loadDir(dirB));
  const cmp = judgeRearmCompare(ctl, arm);
  const out = { ctl: ctl, arm: arm, verdict: cmp.verdict, bars: cmp.bars };
  const oi = args.indexOf('--out');
  if (oi !== -1 && args[oi + 1]) fs.writeFileSync(args[oi + 1], JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: cmp.verdict, ctl: { supplyDeaths: ctl.supplyDeaths, rearmEvents: ctl.rearmEvents, rearmVolleys: ctl.rearmVolleys, starvDeaths: ctl.starvDeaths, medianSurvival: ctl.medianSurvival }, arm: { supplyDeaths: arm.supplyDeaths, rearmEvents: arm.rearmEvents, rearmVolleys: arm.rearmVolleys, starvDeaths: arm.starvDeaths, medianSurvival: arm.medianSurvival }, bars: cmp.bars }, null, 2));
  process.exit(cmp.verdict === 'GO' || cmp.verdict === 'INCONCLUSIVE' ? 0 : 1);
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

module.exports = { analyzeSeed: analyzeSeed, analyzeLeg: analyzeLeg, judgeCompare: judgeCompare, judgeRearmCompare: judgeRearmCompare, judgeLeg: judgeLeg, median: median, selftest: selftest };
