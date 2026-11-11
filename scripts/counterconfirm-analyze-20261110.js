// counterconfirm-analyze-20261110.js — counter-close arm analyzer
// (arm sim-counterconfirm-a, run fleshout-20261110T2215Z). Reuses the
// talkturn-a analyzer's analyzeSeedTalkturn for per-village raise
// classification, staging fates, second-link counting, first-link
// source, talk mechanism, death causes and wall numbers, and adds
// the counterclose question on top: fresh counters vs blocked
// re-knocks (the raiserseat-a "29/29 counter" split), seeds stalled
// at unanswered counters at end (last counterDays snapshot), counter
// answers (sweeten formed/failed/held, walked), the revised per-day
// cost bar (deaths per 100 village-days armed <= control + 10%,
// starvation armed <= control + 2, arm-only starvation <= control
// starvation total, median armed >= 0.8x control median), and the
// pending-raise census (pending-raise days, unanswerable-pending
// days, talks with a raiser while a raise was pending).
//
// Loads the armed + control legs from
// evidence/2026-11-10/perseed-counterconfirm-a/ (RUN=counterconfirm).
// Usage:
//   RUN=counterconfirm node scripts/counterconfirm-analyze-20261110.js
// Writes evidence/2026-11-10/counterconfirm-summary-<RUN>.json and
// prints the band report.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const RUN = process.env.RUN || 'counterconfirm';
const DIR = path.join(REPO, 'evidence', '2026-11-10', 'perseed-counterconfirm-a');
const TA = require(path.join(__dirname, 'talkturn-analyze-20261110'));

function load(mode) {
  const out = {};
  fs.readdirSync(DIR).filter(function (f) { return f.indexOf('-' + RUN + '-' + mode + '.json') !== -1; }).forEach(function (f) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    out[j.seed] = j;
  });
  return out;
}

function median(xs) { return TA.median(xs); }

// Per-seed counterclose analysis on top of the talkturn analysis.
function analyzeSeedCounterclose(j) {
  const r = TA.analyzeSeedTalkturn(j);
  // Counter split (counterclose instrument): fresh counters are new
  // judgments; blocked re-knocks are proposeLink's guard returning
  // 'counter' while one already sits. A seed is stalled at end when
  // its last counterDays snapshot still holds a pending counter.
  const ctr = j.counter || {};
  const propose = ctr.propose || [];
  const countKind = function (k) { return propose.filter(function (p) { return p.kind === k; }).length; };
  const answers = ctr.answers || [];
  const cDays = ctr.counterDays || [];
  const lastCD = cDays.length ? cDays[cDays.length - 1] : null;
  const judgments = ctr.judgments || [];
  r.counter = {
    fresh: countKind('fresh-counter'),
    blocked: countKind('blocked-reknock'),
    formed: countKind('formed'),
    declined: countKind('declined-null'),
    firstFreshDay: (function () { const f = propose.filter(function (p) { return p.kind === 'fresh-counter'; }); return f.length ? f[0].day : null; })(),
    firstFreshTarget: (function () { const f = propose.filter(function (p) { return p.kind === 'fresh-counter'; }); return f.length ? (f[0].villageId || null) : null; })(),
    firstFreshScore: (function () {
      const f = propose.filter(function (p) { return p.kind === 'fresh-counter'; });
      if (!f.length) return null;
      const jd = judgments.filter(function (x) { return x.day === f[0].day && x.caller === 'proposeLink'; });
      return jd.length ? (jd[0].score != null ? jd[0].score : null) : null;
    })(),
    firstFreshOpinion: (function () { const f = propose.filter(function (p) { return p.kind === 'fresh-counter'; }); return f.length ? (f[0].opinion != null ? f[0].opinion : null) : null; })(),
    firstFreshRepStanding: (function () { const f = propose.filter(function (p) { return p.kind === 'fresh-counter'; }); return f.length ? (f[0].repStanding != null ? f[0].repStanding : null) : null; })(),
    stalledAtEnd: !!(lastCD && lastCD.pendingCounter),
    stalledTarget: (lastCD && lastCD.pendingCounter) ? (lastCD.pendingCounter.targetId || null) : null,
    stalledSinceDay: (lastCD && lastCD.pendingCounter) ? (lastCD.pendingCounter.day != null ? lastCD.pendingCounter.day : null) : null,
    pendingCounterDays: cDays.filter(function (d) { return !!d.pendingCounter; }).length,
    sweetenFormed: answers.filter(function (a) { return a.how === 'sweeten' && a.result === 'formed-link'; }).length,
    sweetenFailed: answers.filter(function (a) { return a.how === 'sweeten' && a.result === 'refused-null'; }).length,
    sweetenHeld: answers.filter(function (a) { return a.how === 'sweeten' && a.result === 'held-counter'; }).length,
    walked: answers.filter(function (a) { return a.how === 'walk'; }).length,
    accepted: answers.filter(function (a) { return a.how === 'accept'; }).length,
    answerCalls: answers.length,
    ctx: ctr.ctx || null,
  };
  // 150206-class: >= 10 link stagings with 0 link picks on this seed.
  r.stagingsTotal = r.stagedTele || 0;
  r.is150206Class = (r.stagingsTotal >= 10) && ((r.talk && r.talk.linkPicks) || 0) === 0;
  // Pending-raise census (driver raiseDays: day-start snapshot with
  // each pending raiser's commLevel).
  const rd = j.raiseDays || [];
  r.raiseCensus = {
    pendingRaiseDays: rd.length,
    unanswerablePendingDays: rd.filter(function (d) {
      return (d.pending || []).length > 0 && (d.pending || []).every(function (p) { return p.comm === 'none'; });
    }).length,
    answerablePendingDays: rd.filter(function (d) {
      return (d.pending || []).some(function (p) { return p.comm !== 'none'; });
    }).length,
  };
  return r;
}

// Revised cost bar (prereg): deaths per 100 village-days armed <=
// control + 10% AND starvation armed <= control + 2 AND arm-only
// starvation (armed starvation on seeds where control starvation = 0)
// <= control starvation total AND median armed >= 0.8x control median.
// armed/control: {starvation, armOnlyStarvation, deathsPer100, median}
// (control armOnlyStarvation unused — the cap is its starvation total).
function costBarRevised(armed, control) {
  const reasons = [];
  if (armed.deathsPer100 > control.deathsPer100 * 1.1) reasons.push('deaths/100d ' + armed.deathsPer100.toFixed(2) + ' > control ' + control.deathsPer100.toFixed(2) + ' x1.1');
  if (armed.starvation > control.starvation + 2) reasons.push('starvation ' + armed.starvation + ' > control ' + control.starvation + '+2');
  if (armed.armOnlyStarvation > control.starvation) reasons.push('arm-only starvation ' + armed.armOnlyStarvation + ' > control total ' + control.starvation);
  if (control.median != null && (armed.median == null || armed.median < 0.8 * control.median)) reasons.push('median ' + armed.median + ' < 0.8x control ' + control.median);
  return { pass: reasons.length === 0, reasons: reasons };
}

function wallOf(perSeed) {
  return {
    wins: perSeed.filter(function (s) { return s.won; }).length,
    national: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: perSeed.filter(function (s) { return s.won; }).length,
    wave4unlocks: perSeed.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
    wave5unlocks: perSeed.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
    medianSurvival: median(perSeed.map(function (s) { return s.days; })),
    survivors: perSeed.filter(function (s) { return s.endReason === 'horizon'; }).length,
    seasonedLinksMax: Math.max.apply(null, perSeed.map(function (s) { return s.seasonedLinks; })),
    polityEver: perSeed.filter(function (s) { return s.polityEver; }).length,
  };
}

function main() {
  const armed = load('armed');
  const control = load('control');
  const seeds = Object.keys(armed).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) { console.error('COUNTERCONFIRM ANALYZE STOP: no armed-leg files for run ' + RUN); process.exit(2); }
  const missingControl = seeds.filter(function (s) { return !control[s]; });
  if (missingControl.length) { console.error('COUNTERCONFIRM ANALYZE STOP: control leg missing seeds ' + missingControl.join(',')); process.exit(2); }
  const perSeedArmed = seeds.map(function (s) { return analyzeSeedCounterclose(armed[s]); });
  const perSeedControl = seeds.map(function (s) { return analyzeSeedCounterclose(control[s]); });

  function sum(perSeed, fn) { return perSeed.reduce(function (t, s) { return t + (fn(s) || 0); }, 0); }
  const daysArmed = sum(perSeedArmed, function (s) { return s.days; });
  const daysControl = sum(perSeedControl, function (s) { return s.days; });
  const deathsArmed = sum(perSeedArmed, function (s) { return s.deaths.total; });
  const deathsControl = sum(perSeedControl, function (s) { return s.deaths.total; });
  const starvArmed = sum(perSeedArmed, function (s) { return s.deaths.starvation; });
  const starvControl = sum(perSeedControl, function (s) { return s.deaths.starvation; });
  // Arm-only starvation: armed starvation on seeds where control starved 0.
  let armOnlyStarv = 0;
  perSeedArmed.forEach(function (a) {
    const c = perSeedControl.filter(function (x) { return x.seed === a.seed; })[0];
    if (c && (c.deaths.starvation || 0) === 0) armOnlyStarv += (a.deaths.starvation || 0);
  });

  const band = {
    run: RUN, seeds: seeds,
    primary: {
      armedSecondLinks: perSeedArmed.filter(function (s) { return s.secondLinkFormed; }).length,
      controlSecondLinks: perSeedControl.filter(function (s) { return s.secondLinkFormed; }).length,
      armedSecondViaRaise: sum(perSeedArmed, function (s) { return s.secondLinksViaRaise; }),
      controlSecondViaRaise: sum(perSeedControl, function (s) { return s.secondLinksViaRaise; }),
      armed150206Class: perSeedArmed.filter(function (s) { return s.is150206Class; }).map(function (s) { return s.seed; }),
      control150206Class: perSeedControl.filter(function (s) { return s.is150206Class; }).map(function (s) { return s.seed; }),
      armedStalledSeeds: perSeedArmed.filter(function (s) { return s.counter.stalledAtEnd; }).map(function (s) { return s.seed; }),
      controlStalledSeeds: perSeedControl.filter(function (s) { return s.counter.stalledAtEnd; }).map(function (s) { return s.seed; }),
    },
    counter: {
      armed: {
        fresh: sum(perSeedArmed, function (s) { return s.counter.fresh; }),
        blocked: sum(perSeedArmed, function (s) { return s.counter.blocked; }),
        formed: sum(perSeedArmed, function (s) { return s.counter.formed; }),
        declined: sum(perSeedArmed, function (s) { return s.counter.declined; }),
        pendingCounterDays: sum(perSeedArmed, function (s) { return s.counter.pendingCounterDays; }),
        sweetenFormed: sum(perSeedArmed, function (s) { return s.counter.sweetenFormed; }),
        sweetenFailed: sum(perSeedArmed, function (s) { return s.counter.sweetenFailed; }),
        sweetenHeld: sum(perSeedArmed, function (s) { return s.counter.sweetenHeld; }),
        walked: sum(perSeedArmed, function (s) { return s.counter.walked; }),
        accepted: sum(perSeedArmed, function (s) { return s.counter.accepted; }),
        answerCalls: sum(perSeedArmed, function (s) { return s.counter.answerCalls; }),
        sweetenKcal: sum(perSeedArmed, function (s) { return (s.counter.ctx && s.counter.ctx.counterSweetenKcal) || 0; }),
      },
      control: {
        fresh: sum(perSeedControl, function (s) { return s.counter.fresh; }),
        blocked: sum(perSeedControl, function (s) { return s.counter.blocked; }),
        formed: sum(perSeedControl, function (s) { return s.counter.formed; }),
        declined: sum(perSeedControl, function (s) { return s.counter.declined; }),
        pendingCounterDays: sum(perSeedControl, function (s) { return s.counter.pendingCounterDays; }),
        sweetenFormed: sum(perSeedControl, function (s) { return s.counter.sweetenFormed; }),
        sweetenFailed: sum(perSeedControl, function (s) { return s.counter.sweetenFailed; }),
        sweetenHeld: sum(perSeedControl, function (s) { return s.counter.sweetenHeld; }),
        walked: sum(perSeedControl, function (s) { return s.counter.walked; }),
        accepted: sum(perSeedControl, function (s) { return s.counter.accepted; }),
        answerCalls: sum(perSeedControl, function (s) { return s.counter.answerCalls; }),
        sweetenKcal: sum(perSeedControl, function (s) { return (s.counter.ctx && s.counter.ctx.counterSweetenKcal) || 0; }),
      },
    },
    answered: {
      armed: { accepted: sum(perSeedArmed, function (s) { return s.answered.accepted; }), refused: sum(perSeedArmed, function (s) { return s.answered.refused; }), expired: sum(perSeedArmed, function (s) { return s.answered.expired; }), staged: sum(perSeedArmed, function (s) { return s.answered.staged; }) },
      control: { accepted: sum(perSeedControl, function (s) { return s.answered.accepted; }), refused: sum(perSeedControl, function (s) { return s.answered.refused; }), expired: sum(perSeedControl, function (s) { return s.answered.expired; }), staged: sum(perSeedControl, function (s) { return s.answered.staged; }) },
      armedSecond: { accepted: sum(perSeedArmed, function (s) { return s.secondAnswered.accepted; }), refused: sum(perSeedArmed, function (s) { return s.secondAnswered.refused; }), expired: sum(perSeedArmed, function (s) { return s.secondAnswered.expired; }), staged: sum(perSeedArmed, function (s) { return s.secondAnswered.staged; }) },
      controlSecond: { accepted: sum(perSeedControl, function (s) { return s.secondAnswered.accepted; }), refused: sum(perSeedControl, function (s) { return s.secondAnswered.refused; }), expired: sum(perSeedControl, function (s) { return s.secondAnswered.expired; }), staged: sum(perSeedControl, function (s) { return s.secondAnswered.staged; }) },
    },
    firstLinkSource: { armed: {}, control: {} },
    talk: {
      armed: { talks: sum(perSeedArmed, function (s) { return s.talk.talks; }), turns: sum(perSeedArmed, function (s) { return s.talk.turns; }), linkPicks: sum(perSeedArmed, function (s) { return s.talk.linkPicks; }), bondPicks: sum(perSeedArmed, function (s) { return s.talk.bondPicks; }), talksWithRaiserPending: sum(perSeedArmed, function (s) { return s.talk.talksWithRaiserPending; }), deepConvos: sum(perSeedArmed, function (s) { return s.talk.deepConvos; }), deepTurns: sum(perSeedArmed, function (s) { return s.talk.deepTurns; }) },
      control: { talks: sum(perSeedControl, function (s) { return s.talk.talks; }), turns: sum(perSeedControl, function (s) { return s.talk.turns; }), linkPicks: sum(perSeedControl, function (s) { return s.talk.linkPicks; }), bondPicks: sum(perSeedControl, function (s) { return s.talk.bondPicks; }), talksWithRaiserPending: sum(perSeedControl, function (s) { return s.talk.talksWithRaiserPending; }), deepConvos: sum(perSeedControl, function (s) { return s.talk.deepConvos; }), deepTurns: sum(perSeedControl, function (s) { return s.talk.deepTurns; }) },
    },
    raiseCensus: {
      armed: { pendingRaiseDays: sum(perSeedArmed, function (s) { return s.raiseCensus.pendingRaiseDays; }), unanswerablePendingDays: sum(perSeedArmed, function (s) { return s.raiseCensus.unanswerablePendingDays; }), answerablePendingDays: sum(perSeedArmed, function (s) { return s.raiseCensus.answerablePendingDays; }) },
      control: { pendingRaiseDays: sum(perSeedControl, function (s) { return s.raiseCensus.pendingRaiseDays; }), unanswerablePendingDays: sum(perSeedControl, function (s) { return s.raiseCensus.unanswerablePendingDays; }), answerablePendingDays: sum(perSeedControl, function (s) { return s.raiseCensus.answerablePendingDays; }) },
    },
    deaths: {
      armed: { total: deathsArmed, starvation: starvArmed, villageDays: daysArmed, deathsPer100: daysArmed ? (deathsArmed / daysArmed * 100) : null, armOnlyStarvation: armOnlyStarv },
      control: { total: deathsControl, starvation: starvControl, villageDays: daysControl, deathsPer100: daysControl ? (deathsControl / daysControl * 100) : null },
    },
    wall: { armed: wallOf(perSeedArmed), control: wallOf(perSeedControl) },
    instrumentErrors: sum(perSeedArmed, function (s) { return s.instrumentErrors; }) + sum(perSeedControl, function (s) { return s.instrumentErrors; }),
    reconcileBad: [],
  };
  perSeedArmed.forEach(function (s) {
    band.firstLinkSource.armed[s.firstLinkSource] = (band.firstLinkSource.armed[s.firstLinkSource] || 0) + 1;
    band.reconcileBad = band.reconcileBad.concat(s.reconcile.bad.map(function (b) { return Object.assign({ seed: s.seed, leg: 'armed' }, b); }));
  });
  perSeedControl.forEach(function (s) {
    band.firstLinkSource.control[s.firstLinkSource] = (band.firstLinkSource.control[s.firstLinkSource] || 0) + 1;
    band.reconcileBad = band.reconcileBad.concat(s.reconcile.bad.map(function (b) { return Object.assign({ seed: s.seed, leg: 'control' }, b); }));
  });
  band.costBar = costBarRevised(
    { starvation: band.deaths.armed.starvation, armOnlyStarvation: band.deaths.armed.armOnlyStarvation, deathsPer100: band.deaths.armed.deathsPer100, median: band.wall.armed.medianSurvival },
    { starvation: band.deaths.control.starvation, deathsPer100: band.deaths.control.deathsPer100, median: band.wall.control.medianSurvival }
  );

  const outFile = path.join(REPO, 'evidence', '2026-11-10', 'counterconfirm-summary-' + RUN + '.json');
  fs.writeFileSync(outFile, JSON.stringify({ band: band, perSeedArmed: perSeedArmed, perSeedControl: perSeedControl }, null, 2) + '\n');

  console.log('COUNTERCONFIRM BAND run=' + RUN + ' seeds=' + seeds.join(','));
  seeds.forEach(function (s) {
    const a = perSeedArmed.filter(function (x) { return x.seed === s; })[0];
    const c = perSeedControl.filter(function (x) { return x.seed === s; })[0];
    console.log(' seed ' + s +
      ' ARMED days=' + a.days + ' end=' + a.endReason + ' scale=' + a.scaleRank + ' wave=' + a.maxWave + ' standing=' + a.standing +
      ' firstLink=' + (a.firstLink ? a.firstLink.other + '@d' + a.firstLink.day + '(' + a.firstLinkSource + ')' : 'none') +
      ' secondLink=' + (a.secondLinkFormed ? 'YES(' + a.secondLinkVillages.join(',') + ',viaRaise=' + a.secondLinksViaRaise + ')' : 'no') +
      ' class150206=' + (a.is150206Class ? 'YES' : 'no') + '(stagings=' + a.stagingsTotal + ',picks=' + a.talk.linkPicks + ')' +
      ' counter[fresh=' + a.counter.fresh + ' blocked=' + a.counter.blocked + ' formed=' + a.counter.formed + ' stalledEnd=' + (a.counter.stalledAtEnd ? 'YES(' + a.counter.stalledTarget + '@d' + a.counter.stalledSinceDay + ')' : 'no') +
      ' ans=' + a.counter.sweetenFormed + 'swF/' + a.counter.sweetenFailed + 'swX/' + a.counter.walked + 'walk]' +
      ' ans=' + a.answered.accepted + '/' + a.answered.refused + '/' + a.answered.expired + '(acc/ref/exp)' +
      ' talk=' + a.talk.talks + 't/' + a.talk.turns + 'turns/linkPicks=' + a.talk.linkPicks + '/raiserPending=' + a.talk.talksWithRaiserPending +
      ' raiseDays=' + a.raiseCensus.pendingRaiseDays + '(unans ' + a.raiseCensus.unanswerablePendingDays + ')' +
      ' deaths=' + a.deaths.total + '(starv ' + a.deaths.starvation + ')' + ' err=' + a.instrumentErrors);
    console.log('   CTRL days=' + c.days + ' end=' + c.endReason + ' scale=' + c.scaleRank + ' wave=' + c.maxWave + ' standing=' + c.standing +
      ' firstLink=' + (c.firstLink ? c.firstLink.other + '@d' + c.firstLink.day + '(' + c.firstLinkSource + ')' : 'none') +
      ' secondLink=' + (c.secondLinkFormed ? 'YES(' + c.secondLinkVillages.join(',') + ')' : 'no') +
      ' class150206=' + (c.is150206Class ? 'YES' : 'no') + '(stagings=' + c.stagingsTotal + ',picks=' + c.talk.linkPicks + ')' +
      ' counter[fresh=' + c.counter.fresh + ' blocked=' + c.counter.blocked + ' formed=' + c.counter.formed + ' stalledEnd=' + (c.counter.stalledAtEnd ? 'YES(' + c.counter.stalledTarget + '@d' + c.counter.stalledSinceDay + ')' : 'no') + ']' +
      ' ans=' + c.answered.accepted + '/' + c.answered.refused + '/' + c.answered.expired +
      ' raiseDays=' + c.raiseCensus.pendingRaiseDays + '(unans ' + c.raiseCensus.unanswerablePendingDays + ')' +
      ' deaths=' + c.deaths.total + '(starv ' + c.deaths.starvation + ')' + ' err=' + c.instrumentErrors);
  });
  console.log('PRIMARY secondLinks armed=' + band.primary.armedSecondLinks + '/' + seeds.length + ' (viaRaise ' + band.primary.armedSecondViaRaise + ') control=' + band.primary.controlSecondLinks + '/' + seeds.length + ' (viaRaise ' + band.primary.controlSecondViaRaise + ')');
  console.log('PRIMARY-150206 armed class seeds=[' + band.primary.armed150206Class.join(',') + '] control class seeds=[' + band.primary.control150206Class.join(',') + ']');
  console.log('PRIMARY-STALL armed stalled seeds=[' + band.primary.armedStalledSeeds.join(',') + '] control stalled seeds=[' + band.primary.controlStalledSeeds.join(',') + ']');
  console.log('COUNTER armed=' + JSON.stringify(band.counter.armed) + ' control=' + JSON.stringify(band.counter.control));
  console.log('ANSWERED armed=' + JSON.stringify(band.answered.armed) + ' control=' + JSON.stringify(band.answered.control));
  console.log('ANSWERED-2ND armed=' + JSON.stringify(band.answered.armedSecond) + ' control=' + JSON.stringify(band.answered.controlSecond));
  console.log('FIRSTLINK armed=' + JSON.stringify(band.firstLinkSource.armed) + ' control=' + JSON.stringify(band.firstLinkSource.control));
  console.log('TALK armed=' + JSON.stringify(band.talk.armed) + ' control=' + JSON.stringify(band.talk.control));
  console.log('RAISECENSUS armed=' + JSON.stringify(band.raiseCensus.armed) + ' control=' + JSON.stringify(band.raiseCensus.control));
  console.log('DEATHS armed=' + JSON.stringify(band.deaths.armed) + ' control=' + JSON.stringify(band.deaths.control));
  console.log('COSTBAR pass=' + band.costBar.pass + ' reasons=' + JSON.stringify(band.costBar.reasons));
  console.log('WALL armed wins=' + band.wall.armed.wins + '/' + seeds.length + ' national=' + band.wall.armed.national + ' table=' + band.wall.armed.table + ' w4=' + band.wall.armed.wave4unlocks + ' w5=' + band.wall.armed.wave5unlocks + ' median=' + band.wall.armed.medianSurvival + ' seasonedMax=' + band.wall.armed.seasonedLinksMax + ' polityEver=' + band.wall.armed.polityEver);
  console.log('WALL control wins=' + band.wall.control.wins + '/' + seeds.length + ' national=' + band.wall.control.national + ' table=' + band.wall.control.table + ' w4=' + band.wall.control.wave4unlocks + ' w5=' + band.wall.control.wave5unlocks + ' median=' + band.wall.control.medianSurvival + ' seasonedMax=' + band.wall.control.seasonedLinksMax + ' polityEver=' + band.wall.control.polityEver);
  console.log('RECONCILE bad=' + band.reconcileBad.length + ' ' + JSON.stringify(band.reconcileBad) + ' err=' + band.instrumentErrors);
  console.log('WROTE ' + path.relative(REPO, outFile));
}

if (require.main === module) main();

module.exports = { analyzeSeedCounterclose: analyzeSeedCounterclose, costBarRevised: costBarRevised, median: median, load: load };
