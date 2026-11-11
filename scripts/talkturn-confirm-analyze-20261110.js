// talkturn-confirm-analyze-20261110.js — talk-turn arm CONFIRM analyzer
// (arm sim-talkturn-confirm-b, run fleshout-loop-b-20261111T0330Z).
// Reuses the pilot analyzer's analyzeSeedTalkturn for per-village
// raise classification, staging fates, census and wall numbers, and
// adds the confirm question on top: the REVISED cost bar (deaths per
// 100 village-days, per the pilot's metric review — NOT the pilot's
// raw-total clause, which punished longer survival) and the
// counter-stall half of the primary (a seed counts as stalled if a
// pendingCounter is still open at the final snapshot — the
// counterconfirm-a class).
//
// Counter classification here is SNAPSHOT-BASED, not the
// counterclose instrument's counterDays: the talkturn corpus carries
// daily snapshots with pending.counter plus proposeCalls with
// outcome 'counter'/'formed'/'declined-null'. A 'counter' propose is
// FRESH when no earlier snapshot (day < propose day) held a pending
// counter, BLOCKED (a re-knock) when one did. The stall verdict
// itself reads the LAST snapshot only — no approximation there.
//
// Loads the armed + control legs from
// evidence/2026-11-10/perseed-talkturn-confirm-b/ (RUN=talkturn-confirm).
// Usage:
//   RUN=talkturn-confirm node scripts/talkturn-confirm-analyze-20261110.js
// Writes evidence/2026-11-10/talkturn-summary-<RUN>.json and
// prints the band report.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const RUN = process.env.RUN || 'talkturn-confirm';
const DIR = path.join(REPO, 'evidence', '2026-11-10', 'perseed-talkturn-confirm-b');
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

function isStarvationCause(cause) { return TA.isStarvationCause(cause); }

// Snapshot-based counter classification (see header): fresh vs
// blocked re-knock from proposeCalls + daily pending.counter; stall
// at end reads the last snapshot only.
function counterOf(j) {
  const days = j.daily || [];
  const proposes = (j.proposeCalls || []).filter(function (p) { return p.outcome === 'counter'; });
  let fresh = 0, blocked = 0;
  proposes.forEach(function (p) {
    let pendingBefore = false;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].day < p.day) { pendingBefore = !!(days[i].pending && days[i].pending.counter); break; }
    }
    if (pendingBefore) blocked++; else fresh++;
  });
  const last = days.length ? days[days.length - 1] : null;
  return {
    fresh: fresh,
    blocked: blocked,
    stalledAtEnd: !!(last && last.pending && last.pending.counter),
    pendingCounterDays: days.filter(function (d) { return d.pending && d.pending.counter; }).length,
  };
}

// Per-seed talkturn-confirm analysis on top of the pilot analysis.
// analyzeSeedTalkturn is the pilot's function UNCHANGED (same
// second-link counting, same fates) — the confirm measures the same
// thing the same way; only the cost bar and the stall half are new.
function analyzeSeedTalkturnConfirm(j) {
  const r = TA.analyzeSeedTalkturn(j);
  r.counter = counterOf(j);
  return r;
}

// REVISED cost bar (pilot metric review + counterconfirm-a precedent):
// deaths per 100 village-days armed <= control + 10% (NOT the raw
// total — the pilot's raw clause punished longer survival: 696 vs 603
// raw at identical 0.707 vs 0.708 per-day rates), starvation armed <=
// control+2, arm-only starvation <= 2, median survival armed >= 0.8x
// control median. armed/control are {starvation, deaths, villageDays,
// deathsPer100Days, armOnlyStarvation, median}.
function costBar(armed, control) {
  const reasons = [];
  if (armed.starvation > control.starvation + 2) reasons.push('starvation ' + armed.starvation + ' > control ' + control.starvation + '+2');
  if (armed.armOnlyStarvation > 2) reasons.push('arm-only starvation ' + armed.armOnlyStarvation + ' > 2');
  if (control.deathsPer100Days != null && (armed.deathsPer100Days == null || armed.deathsPer100Days > 1.1 * control.deathsPer100Days)) reasons.push('deaths/100d ' + (armed.deathsPer100Days == null ? 'n/a' : armed.deathsPer100Days.toFixed(2)) + ' > control ' + control.deathsPer100Days.toFixed(2) + ' x1.1');
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
  if (!seeds.length) { console.error('TALKTURN CONFIRM ANALYZE STOP: no armed-leg files for run ' + RUN); process.exit(2); }
  const missingControl = seeds.filter(function (s) { return !control[s]; });
  if (missingControl.length) { console.error('TALKTURN CONFIRM ANALYZE STOP: control leg missing seeds ' + missingControl.join(',')); process.exit(2); }
  const perSeedArmed = seeds.map(function (s) { return analyzeSeedTalkturnConfirm(armed[s]); });
  const perSeedControl = seeds.map(function (s) { return analyzeSeedTalkturnConfirm(control[s]); });

  function sum(perSeed, fn) { return perSeed.reduce(function (t, s) { return t + (fn(s) || 0); }, 0); }
  const n = seeds.length;
  const villageDays = function (perSeed) { return sum(perSeed, function (s) { return s.days; }); };
  const deathsPer100Days = function (perSeed) {
    const vd = villageDays(perSeed);
    return vd ? (sum(perSeed, function (s) { return s.deaths.total; }) / vd) * 100 : null;
  };
  // Arm-only starvation: armed starvation on seeds where the control
  // twin starved nobody.
  const armOnlyStarvation = perSeedArmed.reduce(function (t, s) {
    const c = perSeedControl.filter(function (x) { return x.seed === s.seed; })[0];
    return t + (((c && c.deaths.starvation === 0)) ? s.deaths.starvation : 0);
  }, 0);
  const band = {
    run: RUN, seeds: seeds,
    primary: {
      armedSecondLinks: perSeedArmed.filter(function (s) { return s.secondLinkFormed; }).length,
      controlSecondLinks: perSeedControl.filter(function (s) { return s.secondLinkFormed; }).length,
      armedSecondViaRaise: sum(perSeedArmed, function (s) { return s.secondLinksViaRaise; }),
      controlSecondViaRaise: sum(perSeedControl, function (s) { return s.secondLinksViaRaise; }),
      armedStalledSeeds: perSeedArmed.filter(function (s) { return s.counter.stalledAtEnd; }).map(function (s) { return s.seed; }),
      controlStalledSeeds: perSeedControl.filter(function (s) { return s.counter.stalledAtEnd; }).map(function (s) { return s.seed; }),
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
    deaths: {
      armed: { total: sum(perSeedArmed, function (s) { return s.deaths.total; }), starvation: sum(perSeedArmed, function (s) { return s.deaths.starvation; }), villageDays: villageDays(perSeedArmed), deathsPer100Days: deathsPer100Days(perSeedArmed), armOnlyStarvation: armOnlyStarvation },
      control: { total: sum(perSeedControl, function (s) { return s.deaths.total; }), starvation: sum(perSeedControl, function (s) { return s.deaths.starvation; }), villageDays: villageDays(perSeedControl), deathsPer100Days: deathsPer100Days(perSeedControl), armOnlyStarvation: 0 },
    },
    counter: {
      armed: { fresh: sum(perSeedArmed, function (s) { return s.counter.fresh; }), blocked: sum(perSeedArmed, function (s) { return s.counter.blocked; }), pendingCounterDays: sum(perSeedArmed, function (s) { return s.counter.pendingCounterDays; }) },
      control: { fresh: sum(perSeedControl, function (s) { return s.counter.fresh; }), blocked: sum(perSeedControl, function (s) { return s.counter.blocked; }), pendingCounterDays: sum(perSeedControl, function (s) { return s.counter.pendingCounterDays; }) },
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
  band.costBar = costBar(
    { starvation: band.deaths.armed.starvation, deaths: band.deaths.armed.total, villageDays: band.deaths.armed.villageDays, deathsPer100Days: band.deaths.armed.deathsPer100Days, armOnlyStarvation: band.deaths.armed.armOnlyStarvation, median: band.wall.armed.medianSurvival },
    { starvation: band.deaths.control.starvation, deaths: band.deaths.control.total, villageDays: band.deaths.control.villageDays, deathsPer100Days: band.deaths.control.deathsPer100Days, armOnlyStarvation: 0, median: band.wall.control.medianSurvival }
  );
  // Primary verdict (conjunction, as pre-registered): armed second
  // links > control AND zero armed seeds stalled at unanswered
  // counters. Cost bar is a separate gate: GO + cost-bar fail = HELD.
  band.verdict = {
    primaryA: band.primary.armedSecondLinks > band.primary.controlSecondLinks,
    primaryB: band.primary.armedStalledSeeds.length === 0,
    primary: band.primary.armedSecondLinks > band.primary.controlSecondLinks && band.primary.armedStalledSeeds.length === 0,
    costBar: band.costBar.pass,
    go: band.primary.armedSecondLinks > band.primary.controlSecondLinks && band.primary.armedStalledSeeds.length === 0 && band.costBar.pass,
    held: band.primary.armedSecondLinks > band.primary.controlSecondLinks && band.primary.armedStalledSeeds.length === 0 && !band.costBar.pass,
  };

  const outFile = path.join(REPO, 'evidence', '2026-11-10', 'talkturn-summary-' + RUN + '.json');
  fs.writeFileSync(outFile, JSON.stringify({ band: band, perSeedArmed: perSeedArmed, perSeedControl: perSeedControl }, null, 2) + '\n');

  console.log('TALKTURN CONFIRM BAND run=' + RUN + ' seeds=' + seeds.join(','));
  seeds.forEach(function (s) {
    const a = perSeedArmed.filter(function (x) { return x.seed === s; })[0];
    const c = perSeedControl.filter(function (x) { return x.seed === s; })[0];
    console.log(' seed ' + s +
      ' ARMED days=' + a.days + ' end=' + a.endReason + ' scale=' + a.scaleRank + ' wave=' + a.maxWave + ' standing=' + a.standing +
      ' firstLink=' + (a.firstLink ? a.firstLink.other + '@d' + a.firstLink.day + '(' + a.firstLinkSource + ')' : 'none') +
      ' secondLink=' + (a.secondLinkFormed ? 'YES(' + a.secondLinkVillages.join(',') + ',viaRaise=' + a.secondLinksViaRaise + ')' : 'no') +
      ' stalled=' + (a.counter.stalledAtEnd ? 'YES' : 'no') + ' ctr=' + a.counter.fresh + 'fresh/' + a.counter.blocked + 'blocked' +
      ' ans=' + a.answered.accepted + '/' + a.answered.refused + '/' + a.answered.expired + '(acc/ref/exp)' +
      ' talk=' + a.talk.talks + 't/' + a.talk.turns + 'turns/linkPicks=' + a.talk.linkPicks + '/raiserPending=' + a.talk.talksWithRaiserPending +
      ' deaths=' + a.deaths.total + '(starv ' + a.deaths.starvation + ')' + ' err=' + a.instrumentErrors);
    console.log('   CTRL days=' + c.days + ' end=' + c.endReason + ' scale=' + c.scaleRank + ' wave=' + c.maxWave + ' standing=' + c.standing +
      ' firstLink=' + (c.firstLink ? c.firstLink.other + '@d' + c.firstLink.day + '(' + c.firstLinkSource + ')' : 'none') +
      ' secondLink=' + (c.secondLinkFormed ? 'YES(' + c.secondLinkVillages.join(',') + ')' : 'no') +
      ' stalled=' + (c.counter.stalledAtEnd ? 'YES' : 'no') + ' ctr=' + c.counter.fresh + 'fresh/' + c.counter.blocked + 'blocked' +
      ' ans=' + c.answered.accepted + '/' + c.answered.refused + '/' + c.answered.expired +
      ' deaths=' + c.deaths.total + '(starv ' + c.deaths.starvation + ')' + ' err=' + c.instrumentErrors);
  });
  console.log('PRIMARY secondLinks armed=' + band.primary.armedSecondLinks + '/' + n + ' (viaRaise ' + band.primary.armedSecondViaRaise + ') control=' + band.primary.controlSecondLinks + '/' + n + ' (viaRaise ' + band.primary.controlSecondViaRaise + ')');
  console.log('PRIMARY stalled armed=' + JSON.stringify(band.primary.armedStalledSeeds) + ' control=' + JSON.stringify(band.primary.controlStalledSeeds));
  console.log('ANSWERED armed=' + JSON.stringify(band.answered.armed) + ' control=' + JSON.stringify(band.answered.control));
  console.log('ANSWERED-2ND armed=' + JSON.stringify(band.answered.armedSecond) + ' control=' + JSON.stringify(band.answered.controlSecond));
  console.log('FIRSTLINK armed=' + JSON.stringify(band.firstLinkSource.armed) + ' control=' + JSON.stringify(band.firstLinkSource.control));
  console.log('TALK armed=' + JSON.stringify(band.talk.armed) + ' control=' + JSON.stringify(band.talk.control));
  console.log('DEATHS armed=' + JSON.stringify(band.deaths.armed) + ' control=' + JSON.stringify(band.deaths.control));
  console.log('COUNTER armed=' + JSON.stringify(band.counter.armed) + ' control=' + JSON.stringify(band.counter.control));
  console.log('COSTBAR pass=' + band.costBar.pass + ' reasons=' + JSON.stringify(band.costBar.reasons));
  console.log('VERDICT ' + JSON.stringify(band.verdict));
  console.log('WALL armed wins=' + band.wall.armed.wins + '/' + n + ' national=' + band.wall.armed.national + ' table=' + band.wall.armed.table + ' w4=' + band.wall.armed.wave4unlocks + ' w5=' + band.wall.armed.wave5unlocks + ' median=' + band.wall.armed.medianSurvival + ' seasonedMax=' + band.wall.armed.seasonedLinksMax + ' polityEver=' + band.wall.armed.polityEver);
  console.log('WALL control wins=' + band.wall.control.wins + '/' + n + ' national=' + band.wall.control.national + ' table=' + band.wall.control.table + ' w4=' + band.wall.control.wave4unlocks + ' w5=' + band.wall.control.wave5unlocks + ' median=' + band.wall.control.medianSurvival + ' seasonedMax=' + band.wall.control.seasonedLinksMax + ' polityEver=' + band.wall.control.polityEver);
  console.log('RECONCILE bad=' + band.reconcileBad.length + ' ' + JSON.stringify(band.reconcileBad) + ' err=' + band.instrumentErrors);
  console.log('WROTE ' + path.relative(REPO, outFile));
}

if (require.main === module) main();

module.exports = { analyzeSeedTalkturnConfirm: analyzeSeedTalkturnConfirm, counterOf: counterOf, costBar: costBar, median: median, load: load, isStarvationCause: isStarvationCause };
