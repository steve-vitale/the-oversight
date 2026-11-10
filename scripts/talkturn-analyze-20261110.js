// talkturn-analyze-20261110.js — talk-turn arm analyzer
// (arm sim-talkturn-a, run fleshout-20261110T1215Z). Reuses the
// secondlink-a analyzer's analyzeSeed for per-village raise
// classification, staging fates, census and wall numbers, and adds
// the talkturn question on top: second links formed (any path,
// via-raise split out), raises answered vs expired, first-link
// source (raise / ladder-by-elimination / propose-no-staging),
// the talk mechanism (held sittings, turns, talks with a raiser
// while a raise was pending, link: choice picks), death causes,
// and the prereg cost bar (armed vs control).
//
// Loads the armed + control legs from
// evidence/2026-11-10/perseed-talkturn-a/ (RUN=talkturn-pilot).
// Usage:
//   RUN=talkturn-pilot node scripts/talkturn-analyze-20261110.js
// Writes evidence/2026-11-10/talkturn-summary-<RUN>.json and
// prints the band report.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const RUN = process.env.RUN || 'talkturn-pilot';
const DIR = path.join(REPO, 'evidence', '2026-11-10', 'perseed-talkturn-a');
const AN = require(path.join(__dirname, 'secondlink-analyze-20261110'));

function load(mode) {
  const out = {};
  fs.readdirSync(DIR).filter(function (f) { return f.indexOf('-' + RUN + '-' + mode + '.json') !== -1; }).forEach(function (f) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    out[j.seed] = j;
  });
  return out;
}

function median(xs) { return AN.median(xs); }

function isStarvationCause(cause) {
  return typeof cause === 'string' && /starvation|hunger/i.test(cause);
}

// Per-seed talkturn analysis on top of the secondlink classification.
function analyzeSeedTalkturn(j) {
  const r = AN.analyzeSeed(j);
  const days = j.daily || [];
  // Villages ever linked (union over snapshots) — formation facts,
  // not a transient max: a second link counts if any village other
  // than the first-formed link ever held a link on this seed.
  const everLinked = {};
  days.forEach(function (s) {
    (s.links || []).forEach(function (l) { if (l.other) everLinked[l.other] = true; });
  });
  const everList = Object.keys(everLinked);
  const firstOther = r.firstLink ? r.firstLink.other : null;
  const secondEver = everList.filter(function (id) { return id !== firstOther; });
  r.villagesEverLinked = everList;
  r.secondLinkFormed = secondEver.length >= 1;
  r.secondLinkVillages = secondEver;
  r.secondLinksViaRaise = (r.stagings || []).filter(function (f) { return f.isSecond && f.fate === 'accepted->formed'; }).length;
  r.maxLinks = days.reduce(function (mx, s) { return Math.max(mx, (s.links || []).length); }, 0);
  r.finalLinks = days.length ? ((days[days.length - 1].links || []).length) : 0;
  // First-link source: raise (formedViaRaise) / propose-no-staging /
  // ladder (by elimination: no propose call formed it — competent
  // never raids, so no other path forms a link on this band).
  if (!r.firstLink) r.firstLinkSource = 'none';
  else if (r.villages[firstOther] && r.villages[firstOther].formedViaRaise) r.firstLinkSource = 'raise';
  else if ((j.proposeCalls || []).some(function (p) { return p.villageId === firstOther && p.outcome === 'formed'; })) r.firstLinkSource = 'propose-no-staging';
  else r.firstLinkSource = 'ladder';
  // Raises answered vs expired (tele outcomes, link kind).
  r.answered = {
    staged: r.stagedTele,
    accepted: r.acceptedTele,
    refused: r.refusedTele,
    expired: r.expiredTele,
  };
  r.secondAnswered = {
    staged: r.secondStagings.length,
    accepted: r.secondStagings.filter(function (f) { return f.fate.indexOf('accepted') === 0; }).length,
    refused: r.secondStagings.filter(function (f) { return f.fate === 'refused'; }).length,
    expired: r.secondStagings.filter(function (f) { return f.fate === 'expired'; }).length,
    pending: r.secondStagings.filter(function (f) { return f.fate === 'pending-at-end'; }).length,
  };
  // Talk mechanism (driver recorder + policy ctx counters).
  const tk = j.talk || {};
  r.talk = {
    talks: tk.talks || 0,
    turns: tk.turns || 0,
    linkPicks: tk.linkPicks || 0,
    bondPicks: tk.bondPicks || 0,
    talksWithRaiserPending: tk.talksWithRaiserPending || 0,
    deepConvos: tk.deepConvos || 0,
    deepTurns: tk.deepTurns || 0,
    talkEvents: tk.talkEvents || [],
    turnEvents: tk.turnEvents || [],
  };
  // Death causes (harness live capture, result.samples.deaths).
  const deaths = j.deaths || [];
  const causes = {};
  deaths.forEach(function (d) {
    const c = (d && d.cause) || '?';
    causes[c] = (causes[c] || 0) + 1;
  });
  r.deaths = {
    total: deaths.length,
    starvation: deaths.filter(function (d) { return isStarvationCause(d && d.cause); }).length,
    player: deaths.filter(function (d) { return d && d.player; }).length,
    causes: causes,
  };
  return r;
}

// Prereg cost bar: starvation armed <= control+2 AND total villager
// deaths armed <= control total AND median survival armed >= 0.8x
// control median. armed/control are {starvation, deaths, median}.
function costBar(armed, control) {
  const reasons = [];
  if (armed.starvation > control.starvation + 2) reasons.push('starvation ' + armed.starvation + ' > control ' + control.starvation + '+2');
  if (armed.deaths > control.deaths) reasons.push('deaths ' + armed.deaths + ' > control ' + control.deaths);
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
  if (!seeds.length) { console.error('TALKTURN ANALYZE STOP: no armed-leg files for run ' + RUN); process.exit(2); }
  const missingControl = seeds.filter(function (s) { return !control[s]; });
  if (missingControl.length) { console.error('TALKTURN ANALYZE STOP: control leg missing seeds ' + missingControl.join(',')); process.exit(2); }
  const perSeedArmed = seeds.map(function (s) { return analyzeSeedTalkturn(armed[s]); });
  const perSeedControl = seeds.map(function (s) { return analyzeSeedTalkturn(control[s]); });

  function sum(perSeed, fn) { return perSeed.reduce(function (t, s) { return t + (fn(s) || 0); }, 0); }
  const band = {
    run: RUN, seeds: seeds,
    primary: {
      armedSecondLinks: perSeedArmed.filter(function (s) { return s.secondLinkFormed; }).length,
      controlSecondLinks: perSeedControl.filter(function (s) { return s.secondLinkFormed; }).length,
      armedSecondViaRaise: sum(perSeedArmed, function (s) { return s.secondLinksViaRaise; }),
      controlSecondViaRaise: sum(perSeedControl, function (s) { return s.secondLinksViaRaise; }),
    },
    answered: {
      armed: { accepted: sum(perSeedArmed, function (s) { return s.answered.accepted; }), refused: sum(perSeedArmed, function (s) { return s.answered.refused; }), expired: sum(perSeedArmed, function (s) { return s.answered.expired; }), staged: sum(perSeedArmed, function (s) { return s.answered.staged; }) },
      control: { accepted: sum(perSeedControl, function (s) { return s.answered.accepted; }), refused: sum(perSeedControl, function (s) { return s.answered.refused; }), expired: sum(perSeedControl, function (s) { return s.answered.expired; }), staged: sum(perSeedControl, function (s) { return s.answered.staged; }) },
      armedSecond: { accepted: sum(perSeedArmed, function (s) { return s.secondAnswered.accepted; }), refused: sum(perSeedArmed, function (s) { return s.secondAnswered.refused; }), expired: sum(perSeedArmed, function (s) { return s.secondAnswered.expired; }), staged: sum(perSeedArmed, function (s) { return s.secondAnswered.staged; }) },
      controlSecond: { accepted: sum(perSeedControl, function (s) { return s.secondAnswered.accepted; }), refused: sum(perSeedControl, function (s) { return s.secondAnswered.refused; }), expired: sum(perSeedControl, function (s) { return s.secondAnswered.expired; }), staged: sum(perSeedControl, function (s) { return s.secondAnswered.staged; }) },
    },
    firstLinkSource: {
      armed: {},
      control: {},
    },
    talk: {
      armed: { talks: sum(perSeedArmed, function (s) { return s.talk.talks; }), turns: sum(perSeedArmed, function (s) { return s.talk.turns; }), linkPicks: sum(perSeedArmed, function (s) { return s.talk.linkPicks; }), bondPicks: sum(perSeedArmed, function (s) { return s.talk.bondPicks; }), talksWithRaiserPending: sum(perSeedArmed, function (s) { return s.talk.talksWithRaiserPending; }), deepConvos: sum(perSeedArmed, function (s) { return s.talk.deepConvos; }), deepTurns: sum(perSeedArmed, function (s) { return s.talk.deepTurns; }) },
      control: { talks: sum(perSeedControl, function (s) { return s.talk.talks; }), turns: sum(perSeedControl, function (s) { return s.talk.turns; }), linkPicks: sum(perSeedControl, function (s) { return s.talk.linkPicks; }), bondPicks: sum(perSeedControl, function (s) { return s.talk.bondPicks; }), talksWithRaiserPending: sum(perSeedControl, function (s) { return s.talk.talksWithRaiserPending; }), deepConvos: sum(perSeedControl, function (s) { return s.talk.deepConvos; }), deepTurns: sum(perSeedControl, function (s) { return s.talk.deepTurns; }) },
    },
    deaths: {
      armed: { total: sum(perSeedArmed, function (s) { return s.deaths.total; }), starvation: sum(perSeedArmed, function (s) { return s.deaths.starvation; }) },
      control: { total: sum(perSeedControl, function (s) { return s.deaths.total; }), starvation: sum(perSeedControl, function (s) { return s.deaths.starvation; }) },
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
    { starvation: band.deaths.armed.starvation, deaths: band.deaths.armed.total, median: band.wall.armed.medianSurvival },
    { starvation: band.deaths.control.starvation, deaths: band.deaths.control.total, median: band.wall.control.medianSurvival }
  );

  const outFile = path.join(REPO, 'evidence', '2026-11-10', 'talkturn-summary-' + RUN + '.json');
  fs.writeFileSync(outFile, JSON.stringify({ band: band, perSeedArmed: perSeedArmed, perSeedControl: perSeedControl }, null, 2) + '\n');

  console.log('TALKTURN BAND run=' + RUN + ' seeds=' + seeds.join(','));
  seeds.forEach(function (s) {
    const a = perSeedArmed.filter(function (x) { return x.seed === s; })[0];
    const c = perSeedControl.filter(function (x) { return x.seed === s; })[0];
    console.log(' seed ' + s +
      ' ARMED days=' + a.days + ' end=' + a.endReason + ' scale=' + a.scaleRank + ' wave=' + a.maxWave + ' standing=' + a.standing +
      ' firstLink=' + (a.firstLink ? a.firstLink.other + '@d' + a.firstLink.day + '(' + a.firstLinkSource + ')' : 'none') +
      ' secondLink=' + (a.secondLinkFormed ? 'YES(' + a.secondLinkVillages.join(',') + ',viaRaise=' + a.secondLinksViaRaise + ')' : 'no') +
      ' ans=' + a.answered.accepted + '/' + a.answered.refused + '/' + a.answered.expired + '(acc/ref/exp)' +
      ' talk=' + a.talk.talks + 't/' + a.talk.turns + 'turns/linkPicks=' + a.talk.linkPicks + '/raiserPending=' + a.talk.talksWithRaiserPending +
      ' deaths=' + a.deaths.total + '(starv ' + a.deaths.starvation + ')' + ' err=' + a.instrumentErrors);
    console.log('   CTRL days=' + c.days + ' end=' + c.endReason + ' scale=' + c.scaleRank + ' wave=' + c.maxWave + ' standing=' + c.standing +
      ' firstLink=' + (c.firstLink ? c.firstLink.other + '@d' + c.firstLink.day + '(' + c.firstLinkSource + ')' : 'none') +
      ' secondLink=' + (c.secondLinkFormed ? 'YES(' + c.secondLinkVillages.join(',') + ')' : 'no') +
      ' ans=' + c.answered.accepted + '/' + c.answered.refused + '/' + c.answered.expired +
      ' deaths=' + c.deaths.total + '(starv ' + c.deaths.starvation + ')' + ' err=' + c.instrumentErrors);
  });
  console.log('PRIMARY secondLinks armed=' + band.primary.armedSecondLinks + '/8 (viaRaise ' + band.primary.armedSecondViaRaise + ') control=' + band.primary.controlSecondLinks + '/8 (viaRaise ' + band.primary.controlSecondViaRaise + ')');
  console.log('ANSWERED armed=' + JSON.stringify(band.answered.armed) + ' control=' + JSON.stringify(band.answered.control));
  console.log('ANSWERED-2ND armed=' + JSON.stringify(band.answered.armedSecond) + ' control=' + JSON.stringify(band.answered.controlSecond));
  console.log('FIRSTLINK armed=' + JSON.stringify(band.firstLinkSource.armed) + ' control=' + JSON.stringify(band.firstLinkSource.control));
  console.log('TALK armed=' + JSON.stringify(band.talk.armed) + ' control=' + JSON.stringify(band.talk.control));
  console.log('DEATHS armed=' + JSON.stringify(band.deaths.armed) + ' control=' + JSON.stringify(band.deaths.control));
  console.log('COSTBAR pass=' + band.costBar.pass + ' reasons=' + JSON.stringify(band.costBar.reasons));
  console.log('WALL armed wins=' + band.wall.armed.wins + '/8 national=' + band.wall.armed.national + ' table=' + band.wall.armed.table + ' w4=' + band.wall.armed.wave4unlocks + ' w5=' + band.wall.armed.wave5unlocks + ' median=' + band.wall.armed.medianSurvival + ' seasonedMax=' + band.wall.armed.seasonedLinksMax + ' polityEver=' + band.wall.armed.polityEver);
  console.log('WALL control wins=' + band.wall.control.wins + '/8 national=' + band.wall.control.national + ' table=' + band.wall.control.table + ' w4=' + band.wall.control.wave4unlocks + ' w5=' + band.wall.control.wave5unlocks + ' median=' + band.wall.control.medianSurvival + ' seasonedMax=' + band.wall.control.seasonedLinksMax + ' polityEver=' + band.wall.control.polityEver);
  console.log('RECONCILE bad=' + band.reconcileBad.length + ' ' + JSON.stringify(band.reconcileBad) + ' err=' + band.instrumentErrors);
  console.log('WROTE ' + path.relative(REPO, outFile));
}

if (require.main === module) main();

module.exports = { analyzeSeedTalkturn: analyzeSeedTalkturn, costBar: costBar, median: median, load: load, isStarvationCause: isStarvationCause };
