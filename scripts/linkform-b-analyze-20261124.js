// linkform-b-analyze-20261124.js — second-link stage classification
// analyzer (arm sim-linkform-b, run fleshout-loop-b-20261124T1030Z).
// Pure functions over one per-seed run JSON (driver output).
//
// Each reused analyzer runs on ITS OWN native input shape:
//   havenlink-b-analyze classifySeed + standing summarizeSeed run
//     on out.daily (MERGED rows: standing-shaped `links` with
//     l.key / l.counts, havenLinks, foreignPolitiesFull).
//   secondlink-analyze analyzeSeed runs on out.secondlinkDaily
//     (RAW secondlink rows: active-only `links` with l.other,
//     pendingRaises, raisers, scholarLore, linkTickRoll).
// The stage (S0–S5, prereg-frozen) is computed here from both.
//
// Stage definitions (prereg):
//   S0 no-link — no link ever forms.
//   S1 first-only-no-second-staging — exactly one link; zero
//     second-raise stagings.
//   S2 second-staged-lost — >=1 second raise staged; all expired
//     or pending-at-end; none accepted/refused; no proposeLink
//     call for a second village; no counter.
//   S3 second-offered — a raise accepted, a proposeLink call for
//     a second village, or a counter staged for a second village.
//   S4 second-formed — two active Haven links at once on any day.
//   S5 polity — polityOf('haven') non-null on any snapshot.
// A "second raise" is a raise staged for a village other than the
// first-linked village, staged on a day when >=1 link exists.
// Usage:
//   RUN=linkform-b node scripts/linkform-b-analyze-20261124.js
// Writes evidence/2026-11-24/linkform-b-analysis.json and prints
// the band report.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const RUN = process.env.RUN || 'linkform-b';
const DIR = path.join(REPO, 'evidence', '2026-11-24', 'perseed-linkform-b');
const CONFIRM_DIR = path.join(REPO, 'evidence', '2026-11-24', 'perseed-standing-gearready-b');

const HAVEN_AN = require(path.join(REPO, 'scripts', 'havenlink-b-analyze-20261124'));
const SL_AN = require(path.join(REPO, 'scripts', 'secondlink-analyze-20261110'));
const STANDING_AN = require(path.join(REPO, 'scripts', 'standing-gearready-b-analyze-20261124'));

const STAGES = {
  S0: 'no-link',
  S1: 'first-only-no-second-staging',
  S2: 'second-staged-lost',
  S3: 'second-offered',
  S4: 'second-formed',
  S5: 'polity',
};

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}

// First-link provenance: ladder reward, raise, or other. The
// _formLink caller marker records file paths only (havenlink
// lesson); the ladder case is pinned by the marker naming
// metaProgression.js PLUS the ladder stage crossing 2->3 on the
// link day (standing snapshot's ladder.stage), PLUS zero propose
// calls and zero accepted raises for that village. A raise case
// needs a formed proposeLink call (or an accepted raise) for the
// village on/before the link day.
function firstLinkProvenance(out, firstLink) {
  if (!firstLink) return null;
  const target = firstLink.other;
  const day = firstLink.day;
  const linkEv = (out.linkEvents || []).filter(function (e) {
    return e.formed && e.target === target;
  }).sort(function (a, b) { return a.day - b.day; })[0] || null;
  const proposeFormed = (out.proposeCalls || []).filter(function (p) {
    return p.villageId === target && p.outcome === 'formed' && p.day <= day;
  });
  const acceptForTarget = (out.acceptCalls || []).filter(function (a) {
    return a.villageId === target && a.ok && a.day <= day;
  });
  const daily = out.daily || [];
  const rowOnDay = daily.filter(function (d) { return d.day === day; })[0] || null;
  const rowBefore = daily.filter(function (d) { return d.day < day; }).slice(-1)[0] || null;
  const stageOnDay = rowOnDay && rowOnDay.ladder ? (rowOnDay.ladder.stage | 0) : null;
  const stageBefore = rowBefore && rowBefore.ladder ? (rowBefore.ladder.stage | 0) : null;
  const ladderCross = (stageBefore != null && stageOnDay != null && stageBefore < 3 && stageOnDay === 3);
  const caller = linkEv ? (linkEv.caller || null) : null;
  const callerIsLadder = !!(caller && caller.indexOf('metaProgression') !== -1);
  if (proposeFormed.length || acceptForTarget.length) {
    return { via: 'raise', caller: caller, ladderCross: ladderCross,
      proposeFormed: proposeFormed.length, acceptCalls: acceptForTarget.length };
  }
  if (callerIsLadder && ladderCross) {
    return { via: 'ladder-reward', caller: caller, ladderCross: ladderCross,
      proposeFormed: 0, acceptCalls: 0 };
  }
  if (callerIsLadder) {
    return { via: 'ladder-reward-unconfirmed-cross', caller: caller, ladderCross: ladderCross,
      proposeFormed: 0, acceptCalls: 0 };
  }
  return { via: 'other', caller: caller, ladderCross: ladderCross,
    proposeFormed: proposeFormed.length, acceptCalls: acceptForTarget.length };
}

function classifySeed(out) {
  const hl = HAVEN_AN.classifySeed(out);
  // The secondlink analyzer reads j.daily — give it the RAW
  // secondlink rows (its native shape), not the merged rows.
  const slOut = Object.assign({}, out, { daily: out.secondlinkDaily || out.daily });
  const sl = SL_AN.analyzeSeed(slOut);
  const st = STANDING_AN.summarizeSeed(out);
  const slDaily = out.secondlinkDaily || [];

  const firstLink = sl.firstLink ? {
    day: sl.firstLink.day, other: sl.firstLink.other,
    otherName: (function () {
      const v = (out.otherVillages || []).filter(function (o) { return o.id === sl.firstLink.other; })[0];
      return v ? v.name : null;
    })(),
    kind: sl.firstLink.kind,
  } : null;
  const provenance = firstLinkProvenance(out, firstLink);

  // Max ACTIVE links on any day (secondlink rows are active-only).
  let maxActiveLinks = 0;
  let maxActiveDay = null;
  slDaily.forEach(function (d) {
    const n = (d.links || []).length;
    if (n > maxActiveLinks) { maxActiveLinks = n; maxActiveDay = d.day; }
  });
  // Seasoned at end: last secondlink row with links.
  let seasonedAtEnd = false;
  let seasonedLinksEnd = 0;
  for (let i = slDaily.length - 1; i >= 0; i--) {
    const ls = slDaily[i].links || [];
    if (ls.length) {
      seasonedLinksEnd = ls.filter(function (l) { return l.seasoned; }).length;
      seasonedAtEnd = seasonedLinksEnd > 0;
      break;
    }
  }
  // Second raises, PREREG definition (governs; the reused
  // sl.secondStagings uses the secondlink-a OR definition — target
  // differs from the first link OR staged after it — which also
  // counts a pre-link raise for a never-linked village as second.
  // The prereg requires BOTH: a village other than the first-linked
  // one AND staged on a day when >=1 link already exists, i.e.
  // staging day strictly after the first-link day. Both counts are
  // carried and any disagreement is listed, not hidden.
  const preregSecond = (sl.stagings || []).filter(function (f) {
    return firstLink && f.villageId !== firstLink.other && f.day > firstLink.day;
  });
  const reusedSecond = sl.secondStagings || [];
  const secondDefDiff = (sl.stagings || []).filter(function (f) {
    const inPrereg = preregSecond.indexOf(f) !== -1;
    const inReused = reusedSecond.indexOf(f) !== -1;
    return inPrereg !== inReused;
  }).map(function (f) { return { vid: f.vid, villageId: f.villageId, day: f.day, fate: f.fate }; });

  // Second-village offers: proposeLink calls / counters / accepted
  // raises for any village other than the first-linked one.
  const secondPropose = (out.proposeCalls || []).filter(function (p) {
    return firstLink && p.villageId && p.villageId !== firstLink.other;
  });
  const secondCounters = (out.counterEvents || []).filter(function (c) {
    return firstLink && c.target && c.target !== firstLink.other;
  });
  const secondAccepted = preregSecond.filter(function (f) {
    return String(f.fate || '').indexOf('accepted') === 0;
  });

  let stage = 'S0';
  if (sl.polityEver) stage = 'S5';
  else if (maxActiveLinks >= 2) stage = 'S4';
  else if (secondAccepted.length || secondPropose.length || secondCounters.length) stage = 'S3';
  else if (preregSecond.length) stage = 'S2';
  else if (firstLink) stage = 'S1';
  else stage = 'S0';

  // Gate census, secondlink shape (top gates by raiser-day count).
  const gateDays = sl.census ? (sl.census.gateDays || {}) : {};
  const topGates = Object.keys(gateDays).map(function (g) {
    return { gate: g, raiserDays: gateDays[g] };
  }).sort(function (a, b) { return b.raiserDays - a.raiserDays; }).slice(0, 5);

  const c = {
    seed: out.seed, days: out.days, endReason: out.endReason,
    won: !!out.won, scaleRank: out.scaleRank, maxWave: out.maxWave,
    endUnlockedWave: out.endUnlockedWave,
    stage: stage, stageLabel: STAGES[stage],
    firstLink: firstLink,
    firstLinkProvenance: provenance ? provenance.via : null,
    firstLinkProvenanceDetail: provenance,
    maxActiveLinks: maxActiveLinks, maxActiveDay: maxActiveDay,
    seasonedLinksMax: sl.seasonedLinks || 0,
    seasonedAtEnd: seasonedAtEnd, seasonedLinksEnd: seasonedLinksEnd,
    polityEver: !!sl.polityEver,
    stagingsTotal: (sl.stagings || []).length,
    secondStagings: preregSecond,
    secondStagingCount: preregSecond.length,
    secondStagingsReusedOR: reusedSecond,
    secondStagingCountReusedOR: reusedSecond.length,
    secondDefDiff: secondDefDiff,
    secondFates: {},
    secondAcceptedCount: secondAccepted.length,
    secondProposeCount: secondPropose.length,
    secondProposeOutcomes: secondPropose.map(function (p) { return { day: p.day, villageId: p.villageId, outcome: p.outcome }; }),
    secondCounterCount: secondCounters.length,
    secondCounters: secondCounters.map(function (e) { return { day: e.day, target: e.target, targetName: e.targetName, tributeKcalPerWeek: e.tributeKcalPerWeek }; }),
    eligibleRaiserDays: sl.census ? (sl.census.eligibleRaiserDays || 0) : 0,
    lotteryPass: sl.census ? (sl.census.lotteryPassEligible || 0) : 0,
    lotteryTotal: sl.census ? ((sl.census.lotteryPassEligible || 0) + (sl.census.lotteryFailEligible || 0)) : 0,
    topGates: topGates,
    gateDays: gateDays,
    villagesClassified: {},
    reconcileOk: sl.reconcile ? sl.reconcile.ok : 0,
    reconcileBad: sl.reconcile ? sl.reconcile.bad : [],
    // Havenlink half: foreign polity, membership, join path.
    foreignPolity: hl.foreignPolity,
    havenMember: hl.havenMember,
    havenMemberDetail: hl.havenMemberDetail,
    isTargetForeignPrimary: hl.isTargetForeignPrimary,
    joinPath: hl.joinPath,
    joinPathDetail: hl.joinPathDetail,
    pendingNationalEver: hl.pendingNationalEver,
    nationalLiveEver: hl.nationalLiveEver,
    scaleRefusedEver: hl.scaleRefusedEver,
    orphanLinkEvents: hl.orphanLinkEvents,
    // Standing half: wall fields.
    bestCapped: st.bestCapped, doorOpenDay: st.doorOpenDay,
    daysAt199: st.daysAt199,
    wave4Faced: st.wave4Faced, wave5Faced: st.wave5Faced,
    warKillsByWave: st.warKillsByWave,
    deathCauses: st.deathCauses,
    instrumentErrors: (out.instrumentErrors || []).length,
    unclassified: false,
    unclassifiedReasons: [],
  };
  (preregSecond || []).forEach(function (f) {
    c.secondFates[f.fate] = (c.secondFates[f.fate] || 0) + 1;
  });
  Object.keys(sl.villages || {}).forEach(function (id) {
    const v = sl.villages[id];
    c.villagesClassified[v.class] = (c.villagesClassified[v.class] || 0) + 1;
  });
  // Keep the full secondlink per-seed record for the evidence table.
  c.secondlink = sl;
  c.havenlink = hl;

  if (c.orphanLinkEvents.length) {
    c.unclassified = true;
    c.unclassifiedReasons.push(c.orphanLinkEvents.length + ' orphan link-formation event(s)');
  }
  if (c.reconcileBad.length) {
    c.unclassified = true;
    c.unclassifiedReasons.push(c.reconcileBad.length + ' irreconcilable bond_proposed event(s)');
  }
  if (!c.stage || !STAGES[c.stage]) {
    c.unclassified = true;
    c.unclassifiedReasons.push('no stage assigned');
  }
  if (firstLink && !c.firstLinkProvenance) {
    c.unclassified = true;
    c.unclassifiedReasons.push('first-link provenance undetermined');
  }
  return c;
}

function reproductionCheck(out, confirmOut) {
  return HAVEN_AN.reproductionCheck(out, confirmOut);
}

function contrastGroup(classified, pred) {
  const g = classified.filter(pred);
  if (!g.length) return null;
  return {
    n: g.length,
    seeds: g.map(function (c) { return c.seed; }),
    stages: g.reduce(function (acc, c) { acc[c.stage] = (acc[c.stage] || 0) + 1; return acc; }, {}),
    secondStagings: g.reduce(function (a, c) { return a + c.secondStagingCount; }, 0),
    secondFates: g.reduce(function (acc, c) {
      Object.keys(c.secondFates).forEach(function (f) { acc[f] = (acc[f] || 0) + c.secondFates[f]; });
      return acc;
    }, {}),
    firstLinkDayMedian: median(g.filter(function (c) { return c.firstLink; }).map(function (c) { return c.firstLink.day; })),
    foreignPolityPresent: g.filter(function (c) { return !!c.foreignPolity; }).length,
    maxForeignSizeMedian: median(g.filter(function (c) { return c.foreignPolity; }).map(function (c) { return c.foreignPolity.maxSize; })),
    targetInForeignPolity: g.filter(function (c) {
      return c.firstLink && c.foreignPolity && (c.foreignPolity.subs || []).indexOf(c.firstLink.other) !== -1;
    }).length,
    wins: g.filter(function (c) { return c.won; }).length,
    national: g.filter(function (c) { return c.scaleRank === 'national' || c.scaleRank === 'global'; }).length,
    medianSurvival: median(g.map(function (c) { return c.days; })),
  };
}

function main() {
  const files = fs.readdirSync(DIR).filter(function (f) {
    return f.indexOf('-' + RUN + '.json') !== -1;
  }).sort();
  if (!files.length) { console.error('LINKFORM ANALYZE STOP: no per-seed files for run ' + RUN); process.exit(2); }
  const outs = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); });
  const perSeed = outs.map(function (o) { return classifySeed(o); });
  const seeds = perSeed.map(function (c) { return c.seed; }).sort(function (a, b) { return a - b; });

  // Reproduction vs the standingconfirm corpus (15 overlapping seeds).
  const repro = [];
  perSeed.forEach(function (c) {
    const cf = path.join(CONFIRM_DIR, 'standing-gearready-b-s' + c.seed + '-standingconfirm-b.json');
    if (!fs.existsSync(cf)) {
      repro.push({ seed: c.seed, match: null, mismatches: [{ field: 'confirm-file', note: 'no standingconfirm counterpart (seed 109309, prereg note)' }] });
      return;
    }
    const confirm = JSON.parse(fs.readFileSync(cf, 'utf8'));
    const out = outs.filter(function (o) { return o.seed === c.seed; })[0];
    repro.push(reproductionCheck(out, confirm));
  });

  const band = {
    run: RUN, seeds: seeds,
    stageDistribution: perSeed.reduce(function (acc, c) { acc[c.stage] = (acc[c.stage] || 0) + 1; return acc; }, {}),
    unclassified: perSeed.filter(function (c) { return c.unclassified; }).length,
    unclassifiedReasons: perSeed.filter(function (c) { return c.unclassified; }).map(function (c) { return { seed: c.seed, reasons: c.unclassifiedReasons }; }),
    firstLinkProvenance: perSeed.reduce(function (acc, c) {
      const k = c.firstLinkProvenance || 'none';
      acc[k] = (acc[k] || 0) + 1; return acc;
    }, {}),
    secondStagingsTotal: perSeed.reduce(function (a, c) { return a + c.secondStagingCount; }, 0),
    secondFates: perSeed.reduce(function (acc, c) {
      Object.keys(c.secondFates).forEach(function (f) { acc[f] = (acc[f] || 0) + c.secondFates[f]; });
      return acc;
    }, {}),
    secondProposeTotal: perSeed.reduce(function (a, c) { return a + c.secondProposeCount; }, 0),
    secondCounterTotal: perSeed.reduce(function (a, c) { return a + c.secondCounterCount; }, 0),
    maxActiveLinksEver: Math.max.apply(null, perSeed.map(function (c) { return c.maxActiveLinks; })),
    seasonedAtEndCount: perSeed.filter(function (c) { return c.seasonedAtEnd; }).length,
    seasonedMaxEver: Math.max.apply(null, perSeed.map(function (c) { return c.seasonedLinksMax; })),
    polityEverCount: perSeed.filter(function (c) { return c.polityEver; }).length,
    foreignPolityPresent: perSeed.filter(function (c) { return !!c.foreignPolity; }).length,
    targetInForeignPolity: perSeed.filter(function (c) {
      return c.firstLink && c.foreignPolity && (c.foreignPolity.subs || []).indexOf(c.firstLink.other) !== -1;
    }).length,
    gateDays: perSeed.reduce(function (acc, c) {
      Object.keys(c.gateDays || {}).forEach(function (g) { acc[g] = (acc[g] || 0) + c.gateDays[g]; });
      return acc;
    }, {}),
    eligibleRaiserDays: perSeed.reduce(function (a, c) { return a + c.eligibleRaiserDays; }, 0),
    instrumentErrors: perSeed.reduce(function (a, c) { return a + c.instrumentErrors; }, 0),
    reconcileBadTotal: perSeed.reduce(function (a, c) { return a + c.reconcileBad.length; }, 0),
    orphanLinkTotal: perSeed.reduce(function (a, c) { return a + c.orphanLinkEvents.length; }, 0),
    reproMatch: repro.filter(function (r) { return r.match === true; }).length,
    reproDiverged: repro.filter(function (r) { return r.match === false; }).map(function (r) { return { seed: r.seed, mismatches: r.mismatches }; }),
    reproNoCounterpart: repro.filter(function (r) { return r.match === null; }).map(function (r) { return r.seed; }),
    contrasts: {
      seasonedAtEnd: contrastGroup(perSeed, function (c) { return c.seasonedAtEnd; }),
      unseasonedAtEnd: contrastGroup(perSeed, function (c) { return !c.seasonedAtEnd; }),
      foreignPolity: contrastGroup(perSeed, function (c) { return !!c.foreignPolity; }),
      noForeignPolity: contrastGroup(perSeed, function (c) { return !c.foreignPolity; }),
    },
    wall: {
      wins: perSeed.filter(function (c) { return c.won; }).length,
      national: perSeed.filter(function (c) { return c.scaleRank === 'national' || c.scaleRank === 'global'; }).length,
      table: perSeed.filter(function (c) { return c.won; }).length,
      wave4Faced: perSeed.filter(function (c) { return c.wave4Faced; }).length,
      wave5Unlocks: perSeed.filter(function (c) { return (c.maxWave || 1) >= 5; }).length,
      wave5Faced: perSeed.filter(function (c) { return c.wave5Faced; }).length,
      wave5Kills: perSeed.reduce(function (a, c) { return a + ((c.warKillsByWave && c.warKillsByWave[5]) || 0); }, 0),
      medianSurvival: median(perSeed.map(function (c) { return c.days; })),
      maxSurvival: Math.max.apply(null, perSeed.map(function (c) { return c.days; })),
      deathCauses: perSeed.reduce(function (acc, c) {
        Object.keys(c.deathCauses || {}).forEach(function (k) { acc[k] = (acc[k] || 0) + c.deathCauses[k]; });
        return acc;
      }, {}),
    },
  };

  const outFile = path.join(REPO, 'evidence', '2026-11-24', 'linkform-b-analysis.json');
  fs.writeFileSync(outFile, JSON.stringify({ band: band, perSeed: perSeed, repro: repro }, null, 2) + '\n');

  console.log('LINKFORM BAND run=' + RUN + ' seeds=' + seeds.join(','));
  perSeed.forEach(function (c) {
    console.log(' seed ' + c.seed + ' days=' + c.days + ' end=' + c.endReason + ' scale=' + c.scaleRank +
      ' stage=' + c.stage + ' firstLink=' + (c.firstLink ? c.firstLink.other + '@d' + c.firstLink.day + ' via ' + c.firstLinkProvenance : 'none') +
      ' secondStagings=' + c.secondStagingCount + ' fates=' + JSON.stringify(c.secondFates) +
      ' propose2=' + c.secondProposeCount + ' counter2=' + c.secondCounterCount +
      ' maxLinks=' + c.maxActiveLinks + ' seasonedEnd=' + c.seasonedAtEnd +
      ' FP=' + (c.foreignPolity ? c.foreignPolity.primaryName + ':size' + c.foreignPolity.maxSize : 'none') +
      ' join=' + c.joinPath + ' err=' + c.instrumentErrors +
      (c.unclassified ? ' UNCLASSIFIED:' + c.unclassifiedReasons.join(';') : ''));
  });
  console.log('STAGES ' + JSON.stringify(band.stageDistribution) + ' unclassified=' + band.unclassified);
  console.log('PROVENANCE ' + JSON.stringify(band.firstLinkProvenance));
  console.log('SECOND stagings=' + band.secondStagingsTotal + ' fates=' + JSON.stringify(band.secondFates) +
    ' propose2=' + band.secondProposeTotal + ' counter2=' + band.secondCounterTotal +
    ' maxLinks=' + band.maxActiveLinksEver + ' seasonedEnd=' + band.seasonedAtEndCount + ' polity=' + band.polityEverCount);
  console.log('GATES ' + JSON.stringify(band.gateDays) + ' eligRaiserDays=' + band.eligibleRaiserDays);
  console.log('REPRO match=' + band.reproMatch + '/15 diverged=' + JSON.stringify(band.reproDiverged) + ' noCounterpart=' + JSON.stringify(band.reproNoCounterpart));
  console.log('CONTRAST seasoned: ' + JSON.stringify(band.contrasts.seasonedAtEnd));
  console.log('CONTRAST unseasoned: ' + JSON.stringify(band.contrasts.unseasonedAtEnd));
  console.log('CONTRAST foreignPolity: ' + JSON.stringify(band.contrasts.foreignPolity));
  console.log('CONTRAST noForeignPolity: ' + JSON.stringify(band.contrasts.noForeignPolity));
  console.log('WALL wins=' + band.wall.wins + '/' + seeds.length + ' national=' + band.wall.national +
    ' w4faced=' + band.wall.wave4Faced + ' w5unlocks=' + band.wall.wave5Unlocks + ' w5faced=' + band.wall.wave5Faced +
    ' w5kills=' + band.wall.wave5Kills + ' median=' + band.wall.medianSurvival + ' err=' + band.instrumentErrors +
    ' reconcileBad=' + band.reconcileBadTotal + ' orphan=' + band.orphanLinkTotal);
  console.log('WROTE ' + path.relative(REPO, outFile));
}

if (require.main === module) main();

module.exports = { classifySeed: classifySeed, reproductionCheck: reproductionCheck,
  firstLinkProvenance: firstLinkProvenance, contrastGroup: contrastGroup,
  STAGES: STAGES, median: median };
