// havenlink-b-analyze-20261124.js — foreign-polity membership
// analyzer (arm sim-havenlink-b). Pure functions over one per-seed
// run JSON (driver output) + the pilot per-seed JSON for the
// reproduction check. Classifies, per seed: Haven's link target
// (named, foreign-primary or not), the foreign polity's membership
// (primary + full subs, Haven among them or not), the BELONG-bar
// gap when Haven's link IS to the foreign primary, and the
// join/subordinate path as offered (binding-staged /
// counter-offered / subordinate-link-formed /
// no-join-path-offered). Also the reproduction comparison against
// the pilot corpus (standing analyzer summarizeSeed fields).
// Usage: const AN = require('./havenlink-b-analyze-20261124');
//   const c = AN.classifySeed(perSeedJson);
//   const r = AN.reproductionCheck(newJson, pilotJson);
'use strict';

const STANDING_AN = require('./standing-gearready-b-analyze-20261124');

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function firstDayWith(daily, pred) {
  for (const d of daily) if (pred(d)) return d.day;
  return null;
}

// Largest foreign polity seen on the run (by max size, then earliest).
function foreignPolitySummary(daily) {
  let best = null;
  for (const d of daily) {
    for (const fp of (d.foreignPolitiesFull || [])) {
      if (!best || fp.size > best.maxSize) {
        best = { primary: fp.primary, primaryName: fp.primaryName,
          subs: fp.subs.slice(), subsNames: (fp.subsNames || []).slice(),
          maxSize: fp.size, firstDay: d.day, lastDay: d.day,
          firstSubs: fp.subs.slice(), lastSubs: fp.subs.slice() };
      } else if (best && fp.primary === best.primary) {
        best.lastDay = d.day;
        best.lastSubs = fp.subs.slice();
        if (fp.size > best.maxSize) { best.maxSize = fp.size; best.subs = fp.subs.slice(); best.subsNames = (fp.subsNames || []).slice(); }
      }
    }
  }
  return best;
}

// Haven's link story: first link formed, its target, end state.
function havenLinkSummary(daily) {
  let first = null, last = null, ever = [];
  const seen = {};
  for (const d of daily) {
    for (const l of (d.havenLinks || [])) {
      if (!first) first = { day: d.day, other: l.other, otherName: l.otherName, role: l.role, kind: l.kind };
      last = { day: d.day, other: l.other, otherName: l.otherName, role: l.role, kind: l.kind,
        trust: l.trust, age: l.age, seasoned: l.seasoned, goodStanding: l.goodStanding,
        isForeignPrimary: l.isForeignPrimary, belongGap: clone(l.belongGap || {}) };
      if (!seen[l.other]) { seen[l.other] = true; ever.push(l.other); }
    }
  }
  return { first: first, last: last, ever: ever };
}

function classifySeed(out) {
  const daily = out.daily || [];
  const c = {
    seed: out.seed, days: out.days, endReason: out.endReason,
    won: !!out.won, scaleRank: out.scaleRank, maxWave: out.maxWave,
    endUnlockedWave: out.endUnlockedWave,
    havenLink: havenLinkSummary(daily),
    foreignPolity: foreignPolitySummary(daily),
    havenMember: 'not-a-member',
    havenMemberDetail: null,
    isTargetForeignPrimary: null,
    belongGap: null,
    joinPath: null,
    joinPathDetail: {},
    pendingNationalEver: false,
    nationalLiveEver: false,
    scaleRefusedEver: false,
    unclassified: false,
    unclassifiedReasons: [],
    instrumentErrors: (out.instrumentErrors || []).length,
    orphanLinkEvents: [],
  };

  // --- membership: is Haven among the foreign polity's members? ---
  // A foreign polity never lists Haven in subs (foreignPolities are
  // polities that don't include Haven, by construction), so
  // membership can only come through Haven's own subordinate link
  // to the foreign primary — read from havenLinks + _belongPolity.
  let belongEver = null;
  for (const d of daily) {
    if (d.pendingNational) c.pendingNationalEver = true;
    if (d.nationalLive) c.nationalLiveEver = true;
    if (d.scaleRefused) c.scaleRefusedEver = true;
    if (d.belongPolity) belongEver = d.belongPolity;
  }
  const hl = c.havenLink;
  if (hl.last) {
    const subToForeign = hl.last.role === 'subordinate' && hl.last.isForeignPrimary;
    if (belongEver) {
      c.havenMember = 'subordinate';
      c.havenMemberDetail = { primary: belongEver.primary, primaryName: belongEver.primaryName,
        villages: belongEver.villages, size: belongEver.size, shape: belongEver.shape };
    } else if (subToForeign) {
      c.havenMember = 'subordinate-not-in-good-standing';
      c.havenMemberDetail = { primary: hl.last.other, primaryName: hl.last.otherName,
        trust: hl.last.trust, goodStanding: hl.last.goodStanding,
        belongGap: hl.last.belongGap };
    } else {
      c.havenMember = 'not-a-member';
      c.havenMemberDetail = { linkRole: hl.last.role, linkTarget: hl.last.other,
        linkTargetName: hl.last.otherName, isForeignPrimary: hl.last.isForeignPrimary };
    }
  } else {
    c.havenMember = 'not-a-member';
    c.havenMemberDetail = { linkRole: null, note: 'no Haven link ever formed' };
  }

  // --- is Haven's link to the foreign primary? ---
  if (c.foreignPolity && hl.last) {
    c.isTargetForeignPrimary = (hl.last.other === c.foreignPolity.primary);
  } else if (!c.foreignPolity && hl.last) {
    c.isTargetForeignPrimary = false;
  } else if (c.foreignPolity && !hl.last) {
    c.isTargetForeignPrimary = null; // no link to compare — classified below
  } else {
    c.isTargetForeignPrimary = null;
  }

  // --- BELONG-bar gap (only meaningful when the link IS to the foreign primary) ---
  if (c.isTargetForeignPrimary === true) {
    // Gap over the run: on how many days was each bar met, on the
    // link-to-foreign-primary days.
    const gapDays = { trust: 0, arrears: 0, age: 0, size: 0, all: 0, n: 0 };
    let lastGap = null;
    for (const d of daily) {
      for (const l of (d.havenLinks || [])) {
        if (l.other !== c.foreignPolity.primary) continue;
        gapDays.n++;
        const g = l.belongGap || {};
        if (g.trust) gapDays.trust++;
        if (g.arrears) gapDays.arrears++;
        if (g.age) gapDays.age++;
        if (g.size) gapDays.size++;
        if (g.trust && g.arrears && g.age && g.size) gapDays.all++;
        lastGap = { day: d.day, trust: l.trust, arrears: l.arrears, age: l.age,
          foreignSize: (l.foreignPolityOfOther ? l.foreignPolityOfOther.size : 0),
          gap: clone(g), goodStanding: l.goodStanding };
      }
    }
    c.belongGap = { days: gapDays, last: lastGap };
  } else if (c.isTargetForeignPrimary === false && hl.last) {
    c.belongGap = { notApplicable: 'link target is not the foreign primary',
      target: hl.last.other, targetName: hl.last.otherName,
      foreignPrimary: c.foreignPolity ? c.foreignPolity.primary : null,
      foreignPrimaryName: c.foreignPolity ? c.foreignPolity.primaryName : null };
  } else {
    c.belongGap = { notApplicable: !c.foreignPolity ? 'no foreign polity ever formed' : 'no Haven link ever formed' };
  }

  // --- join / subordinate path as offered ---
  const linkEvents = out.linkEvents || [];
  const counterEvents = out.counterEvents || [];
  const nationalEvents = out.nationalEvents || [];
  const subFormed = linkEvents.filter(function (e) { return e.asSubordinate && e.formed; });
  const belongStaged = nationalEvents.filter(function (e) { return e.kind === 'staged' && e.shape === 'belong'; });
  const belongAnswered = nationalEvents.filter(function (e) { return e.kind === 'answered' && e.shape === 'belong'; });
  const subCounters = counterEvents.filter(function (e) { return e.asSubordinate; });
  if (belongStaged.length) {
    c.joinPath = 'binding-staged';
    c.joinPathDetail = { staged: belongStaged.map(function (e) { return { day: e.day, primary: e.primary, primaryName: e.primaryName, villages: e.villages }; }),
      answered: belongAnswered.map(function (e) { return { day: e.day, how: e.how, cost: e.cost }; }),
      costNote: 'swear = 3,000 kcal oath; serve = 7 speaker-days (code-fixed, hierarchy.js)' };
  } else if (subFormed.length) {
    c.joinPath = 'subordinate-link-formed';
    c.joinPathDetail = { formed: subFormed.map(function (e) { return { day: e.day, target: e.target, targetName: e.targetName, tributeKcalPerWeek: e.tributeKcalPerWeek, caller: e.caller }; }) };
  } else if (subCounters.length) {
    c.joinPath = 'counter-offered';
    c.joinPathDetail = { counters: subCounters.map(function (e) { return { day: e.day, target: e.target, targetName: e.targetName, tributeKcalPerWeek: e.tributeKcalPerWeek, terms: e.terms }; }),
      costNote: 'counter asks Haven to bow at the named tribute (kcal/week); accept forms the subordinate link' };
  } else {
    c.joinPath = 'no-join-path-offered';
    const reasons = [];
    if (!hl.first) reasons.push('no Haven link ever formed');
    else if (c.isTargetForeignPrimary === false) reasons.push('Haven linked ' + (hl.first.otherName || hl.first.other) + ', not the foreign primary ' + (c.foreignPolity ? (c.foreignPolity.primaryName || c.foreignPolity.primary) : 'none'));
    else if (c.isTargetForeignPrimary === true) reasons.push('Haven linked the foreign primary as ' + hl.first.role + ' (primary, not subordinate) — no subordinate offer followed');
    else if (!c.foreignPolity) reasons.push('no foreign polity ever formed');
    if (!counterEvents.length && !(out.proposeEvents || []).length) reasons.push('no propose/counter traffic at all (policy never proposes; villagers propose bonds, never subordination)');
    else if (!counterEvents.length) reasons.push('no counter ever staged');
    c.joinPathDetail = { reasons: reasons,
      proposeOutcomes: (out.proposeEvents || []).map(function (e) { return { day: e.day, target: e.target, outcome: e.outcome }; }),
      counters: counterEvents.map(function (e) { return { day: e.day, target: e.target, asSubordinate: e.asSubordinate, tributeKcalPerWeek: e.tributeKcalPerWeek }; }) };
  }

  // --- orphan link-formation events: every _formLink must show in a later snapshot ---
  for (const ev of linkEvents) {
    if (!ev.formed) continue;
    const seen = daily.some(function (d) {
      return d.day >= ev.day && (d.havenLinks || []).some(function (l) { return l.other === ev.target; });
    });
    if (!seen) c.orphanLinkEvents.push(ev);
  }

  // --- UNCLASSIFIED if any required answer is missing ---
  // Note: a regional seed with no foreign polity at all is a
  // classification (foreign polity never formed), not a gap — the
  // pilot had exactly this shape on its village-rank seeds.
  if (hl.last && c.isTargetForeignPrimary === null) {
    c.unclassified = true;
    c.unclassifiedReasons.push('link target foreign-primary status unknown (no foreign polity recorded but a link exists)');
  }
  if (!c.joinPath) { c.unclassified = true; c.unclassifiedReasons.push('no join-path classification'); }
  if (!c.havenMember) { c.unclassified = true; c.unclassifiedReasons.push('no membership classification'); }
  if (c.orphanLinkEvents.length) { c.unclassified = true; c.unclassifiedReasons.push(c.orphanLinkEvents.length + ' orphan link-formation event(s)'); }
  return c;
}

// Reproduction check: the standing analyzer's summarizeSeed on the
// new JSON must match the pilot JSON on every frozen field.
const REPRO_FIELDS = ['days', 'endReason', 'scaleRank', 'maxWave', 'endUnlockedWave', 'bestCapped', 'doorOpenDay', 'daysAt199'];
function reproductionCheck(newOut, pilotOut) {
  const a = STANDING_AN.summarizeSeed(newOut);
  const b = STANDING_AN.summarizeSeed(pilotOut);
  const mismatches = [];
  for (const f of REPRO_FIELDS) {
    if (a[f] !== b[f]) mismatches.push({ field: f, replay: a[f], pilot: b[f] });
  }
  return { seed: newOut.seed, match: mismatches.length === 0, mismatches: mismatches,
    replay: pick(a), pilot: pick(b) };
  function pick(s) {
    const o = {};
    for (const f of REPRO_FIELDS) o[f] = s[f];
    return o;
  }
}

function wallSummary(classified) {
  const wins = classified.filter(function (c) { return c.won; }).length;
  const national = classified.filter(function (c) { return c.scaleRank === 'national' || c.scaleRank === 'global'; }).length;
  const table = wins; // Game.won is the win flag (the table win sets it); no separate table read exists in this instrument
  const days = classified.map(function (c) { return c.days; }).sort(function (x, y) { return x - y; });
  const mid = days.length % 2 ? days[(days.length - 1) / 2] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
  return { seeds: classified.length, wins: wins, national: national, table: table,
    medianSurvival: mid, maxSurvival: days[days.length - 1],
    targetIsForeignPrimary: classified.filter(function (c) { return c.isTargetForeignPrimary === true; }).length,
    havenSubordinate: classified.filter(function (c) { return c.havenMember === 'subordinate' || c.havenMember === 'subordinate-not-in-good-standing'; }).length,
    joinPaths: classified.map(function (c) { return c.joinPath; }),
    unclassified: classified.filter(function (c) { return c.unclassified; }).length };
}

module.exports = { classifySeed: classifySeed, reproductionCheck: reproductionCheck,
  REPRO_FIELDS: REPRO_FIELDS, wallSummary: wallSummary,
  foreignPolitySummary: foreignPolitySummary, havenLinkSummary: havenLinkSummary };
