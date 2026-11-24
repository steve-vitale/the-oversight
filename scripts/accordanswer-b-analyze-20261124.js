// accordanswer-b-analyze-20261124.js — accord-answer probe analyzer
// (arm sim-accordanswer-b). Pure functions over one per-seed run JSON
// (driver output) + the havenlink corpus for the reproduction check.
// Classifies, per seed: the accord story (staged / answered /
// unanswered, with actor, day, lag, kcal paid, trust gained), the
// drive's ride-along answers (tends / renegotiations / demands),
// the downstream state (links, standing, Dawn day, seasoned links,
// scale, waves, survival, deaths), and any offers/counters staged.
// Also the paired before/after comparison across legs.
// Usage: const AN = require('./accordanswer-b-analyze-20261124');
//   const c = AN.classifySeed(perSeedJson);
//   const r = AN.reproductionCheck(newJson, havenlinkJson);
//   const cmp = AN.compareLegs(ctlClassified, armClassified);
'use strict';

const HAVENLINK_AN = require('./havenlink-b-analyze-20261124');

function clone(o) { return JSON.parse(JSON.stringify(o)); }

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function lastDaily(out) {
  const d = out.daily || [];
  return d.length ? d[d.length - 1] : null;
}

function seasonCount(dailyRow) {
  if (!dailyRow || !dailyRow.havenLinks) return 0;
  return dailyRow.havenLinks.filter(function (l) { return l.seasoned; }).length;
}

function classifySeed(out) {
  const base = HAVENLINK_AN.classifySeed(out);
  const daily = out.daily || [];
  const c = {
    seed: out.seed, run: out.run || null, policy: out.policy || null, driveEnv: !!out.driveEnv,
    days: out.days, endReason: out.endReason, won: !!out.won,
    scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
    havenLink: base.havenLink, foreignPolity: base.foreignPolity,
    havenMember: base.havenMember, joinPath: base.joinPath,
    unclassified: base.unclassified, unclassifiedReasons: base.unclassifiedReasons.slice(),
    instrumentErrors: (out.instrumentErrors || []).length,
    // --- the accord story ---
    staged: [], answered: [], unanswered: [],
    answerRate: null, answerRateDistinct: null,
    driveStats: out.driveStats || null,
    driveCalls: (out.driveCallDays || []).length,
    // --- downstream ---
    linksFormed: 0, seasonedAtEnd: 0, standingFinal: null, standingPeak: null,
    standingCapped: null, dawnDay: null, w4faced: null, w5faced: null,
    wave4kills: 0, wave5kills: 0, deaths: 0, starvationDeaths: 0,
    proposeCount: 0, counterCount: 0, nationalCount: 0,
  };

  const staged = (out.accordStageEvents || []).filter(function (e) { return e.staged; });
  const answered = (out.accordAnswerEvents || []).filter(function (e) { return e.outcome === 'answered'; });
  const answeredByLink = {};
  answered.forEach(function (e) { if (e.linkId) answeredByLink[e.linkId] = e; });
  const stagedLinkIds = {};
  staged.forEach(function (e) { if (e.linkId) stagedLinkIds[e.linkId] = true; });
  const distinctStaged = Object.keys(stagedLinkIds).length;
  const distinctAnswered = Object.keys(answeredByLink).length;
  c.answerRate = staged.length ? answered.length / staged.length : null;
  c.answerRateDistinct = distinctStaged ? distinctAnswered / distinctStaged : null;

  staged.forEach(function (e) {
    const a = answeredByLink[e.linkId];
    const row = { linkId: e.linkId, target: e.target, targetName: e.targetName,
      stagedDay: e.day, answeredDay: a ? a.day : null,
      lagDays: a ? a.lagDays : null,
      pendingDaysEnd: a ? null : (out.days - e.day),
      how: a ? a.how : null, channel: a ? a.channel : null,
      actorId: a ? a.actorId : null, actorName: a ? a.actorName : null,
      kcalPaid: a ? a.kcalPaid : null, trustGain: a ? a.trustGain : null };
    c.staged.push(row);
    if (a) c.answered.push(row); else c.unanswered.push(row);
  });
  c.answeredEvents = answered.map(function (e) {
    return { day: e.day, how: e.how, channel: e.channel, actorName: e.actorName,
      linkId: e.linkId, targetName: e.targetName, lagDays: e.lagDays,
      kcalPaid: e.kcalPaid, trustGain: e.trustGain, outcome: e.outcome };
  });

  // --- downstream state (last snapshot row) ---
  const last = lastDaily(out);
  if (last) {
    c.seasonedAtEnd = seasonCount(last);
    if (last.standing) {
      c.standingFinal = (last.standing.total | 0) || 0;
      c.standingPeak = (last.peak | 0) || 0;
      c.standingCapped = (last.capped | 0) || 0;
    }
    c.dawnDay = (last.networkLiveDay | 0) || null;
    c.w4faced = last.w4faced != null ? !!last.w4faced : null;
    c.w5faced = last.w5faced != null ? !!last.w5faced : null;
  }
  c.linksFormed = (out.linkEvents || []).filter(function (e) { return e.formed; }).length;
  (out.killEvents || []).forEach(function (e) {
    if ((e.wave | 0) === 4) c.wave4kills++;
    if ((e.wave | 0) === 5) c.wave5kills++;
  });
  (out.deathEvents || []).forEach(function (e) {
    c.deaths++;
    if (e.cause === 'starvation') c.starvationDeaths++;
  });
  c.proposeCount = (out.proposeEvents || []).length;
  c.counterCount = (out.counterEvents || []).length;
  c.nationalCount = (out.nationalEvents || []).length;

  // --- UNCLASSIFIED additions (accord-specific) ---
  // The arm leg must show driveStats (the gate ran); the control leg
  // must show null (the gate never ran). A mismatch is a gate failure,
  // not a classification.
  if (c.driveEnv && !c.driveStats) {
    c.unclassified = true;
    c.unclassifiedReasons.push('arm leg ran with ANSWERMAIL_DRIVE=1 but driveStats is null (gate did not run)');
  }
  if (!c.driveEnv && c.driveStats) {
    c.unclassified = true;
    c.unclassifiedReasons.push('control leg ran with the drive off but driveStats is present (gate leaked into control)');
  }
  answered.forEach(function (e) {
    if (!e.linkId || !stagedLinkIds[e.linkId]) {
      c.unclassified = true;
      c.unclassifiedReasons.push('answer event with no matching staged accord (linkId ' + (e.linkId || 'null') + ', day ' + e.day + ')');
    }
    if (e.channel !== 'engine') {
      c.unclassified = true;
      c.unclassifiedReasons.push('answer event via unexpected channel ' + e.channel + ' (day ' + e.day + ')');
    }
    if (!e.actorName) {
      c.unclassified = true;
      c.unclassifiedReasons.push('answer event with no actor recorded (day ' + e.day + ')');
    }
  });
  (out.accordAnswerEvents || []).forEach(function (e) {
    if (e.outcome === 'no-pending-or-dead-link' && e.channel === 'engine') {
      c.unclassified = true;
      c.unclassifiedReasons.push('engine answer attempt on a dead/missing accord (day ' + e.day + ')');
    }
  });
  if (c.instrumentErrors > 0) {
    c.unclassified = true;
    c.unclassifiedReasons.push(c.instrumentErrors + ' instrument error(s)');
  }
  return c;
}

function reproductionCheck(newOut, havenlinkOut) {
  return HAVENLINK_AN.reproductionCheck(newOut, havenlinkOut);
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

function compareLegs(ctl, arm) {
  const bySeed = {};
  ctl.forEach(function (c) { bySeed[c.seed] = { ctl: c, arm: null }; });
  arm.forEach(function (a) {
    if (!bySeed[a.seed]) bySeed[a.seed] = { ctl: null, arm: a };
    else bySeed[a.seed].arm = a;
  });
  const pairs = Object.keys(bySeed).sort().map(function (s) { return bySeed[s]; })
    .filter(function (p) { return p.ctl && p.arm; });
  function delta(field) {
    return pairs.map(function (p) {
      const a = p.ctl[field], b = p.arm[field];
      if (a == null || b == null) return null;
      return b - a;
    });
  }
  function sum(xs) { return xs.reduce(function (t, x) { return t + (x || 0); }, 0); }
  const ctlStaged = sum(ctl.map(function (c) { return c.staged.length; }));
  const armStaged = sum(arm.map(function (c) { return c.staged.length; }));
  const ctlAnswered = sum(ctl.map(function (c) { return c.answered.length; }));
  const armAnswered = sum(arm.map(function (c) { return c.answered.length; }));
  const cmp = {
    pairs: pairs.length,
    answerRate: { control: ctlStaged ? ctlAnswered / ctlStaged : null,
      arm: armStaged ? armAnswered / armStaged : null,
      stagedCtl: ctlStaged, stagedArm: armStaged,
      answeredCtl: ctlAnswered, answeredArm: armAnswered },
    lagDaysArm: arm.reduce(function (acc, c) {
      c.answered.forEach(function (r) { if (r.lagDays != null) acc.push(r.lagDays); });
      return acc;
    }, []),
    kcalPaidArm: arm.reduce(function (acc, c) {
      c.answered.forEach(function (r) { if (r.kcalPaid != null) acc.push(r.kcalPaid); });
      return acc;
    }, []),
    trustGainArm: arm.reduce(function (acc, c) {
      c.answered.forEach(function (r) { if (r.trustGain != null) acc.push(r.trustGain); });
      return acc;
    }, []),
    deltas: {
      standingFinal: delta('standingFinal'),
      standingPeak: delta('standingPeak'),
      standingCapped: delta('standingCapped'),
      dawnDay: delta('dawnDay'),
      seasonedAtEnd: delta('seasonedAtEnd'),
      linksFormed: delta('linksFormed'),
      days: delta('days'),
      deaths: delta('deaths'),
      starvationDeaths: delta('starvationDeaths'),
      wave4kills: delta('wave4kills'),
      wave5kills: delta('wave5kills'),
    },
    scaleMoves: pairs.map(function (p) {
      return { seed: p.ctl.seed,
        rank: (p.ctl.scaleRank || 'null') + ' -> ' + (p.arm.scaleRank || 'null'),
        rankDelta: (RANK_ORDER[p.arm.scaleRank] || 0) - (RANK_ORDER[p.ctl.scaleRank] || 0),
        won: (p.ctl.won ? 1 : 0) + ' -> ' + (p.arm.won ? 1 : 0) };
    }),
    costGuardrail: {
      starvationCtl: sum(ctl.map(function (c) { return c.starvationDeaths; })),
      starvationArm: sum(arm.map(function (c) { return c.starvationDeaths; })),
      medianSurvivalCtl: median(ctl.map(function (c) { return c.days; })),
      medianSurvivalArm: median(arm.map(function (c) { return c.days; })),
    },
    unclassifiedCtl: ctl.filter(function (c) { return c.unclassified; }).length,
    unclassifiedArm: arm.filter(function (c) { return c.unclassified; }).length,
  };
  cmp.costGuardrail.starvationPass =
    cmp.costGuardrail.starvationArm <= cmp.costGuardrail.starvationCtl + 2;
  cmp.costGuardrail.survivalPass =
    cmp.costGuardrail.medianSurvivalCtl == null || cmp.costGuardrail.medianSurvivalArm == null
      ? null
      : cmp.costGuardrail.medianSurvivalArm >= 0.8 * cmp.costGuardrail.medianSurvivalCtl;
  return cmp;
}

function wallSummary(classified) {
  const wins = classified.filter(function (c) { return c.won; }).length;
  const national = classified.filter(function (c) { return c.scaleRank === 'national' || c.scaleRank === 'global'; }).length;
  const days = classified.map(function (c) { return c.days; }).sort(function (a, b) { return a - b; });
  return { seeds: classified.length, wins: wins, national: national, table: wins,
    medianSurvival: median(days), maxSurvival: days.length ? days[days.length - 1] : null,
    wave5unlocks: classified.filter(function (c) { return (c.endUnlockedWave | 0) >= 5; }).length,
    wave5faced: classified.filter(function (c) { return c.w5faced; }).length,
    wave4faced: classified.filter(function (c) { return c.w4faced; }).length,
    wave4kills: classified.reduce(function (t, c) { return t + c.wave4kills; }, 0),
    wave5kills: classified.reduce(function (t, c) { return t + c.wave5kills; }, 0),
    unclassified: classified.filter(function (c) { return c.unclassified; }).length };
}

module.exports = { classifySeed: classifySeed, reproductionCheck: reproductionCheck,
  compareLegs: compareLegs, wallSummary: wallSummary,
  RANK_ORDER: RANK_ORDER, median: median };
