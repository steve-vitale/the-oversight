// diplo-analyze-askplus-20261104.js — analyzer extension for arm
// sim-askplus-a. Wraps scripts/diplo-analyze-20261104.js summarizeSeed
// (NOT edited) and ADDS the fields the askplus GO bar judges:
//   maxDiplomacy / endDiplomacy / diploPositiveDays — from the daily
//     snapshots' standing.diplomacy (villageStanding breakdown; the
//     snapshot never calls the side-effecting total).
//   regionalPlusDays / seasonedDays — snapshots with linkFunnel
//     regionalPlus / seasoned > 0 (a link can season then break; end
//     state alone would erase it).
//   linkShapes — per formed link: LEAD if primary 'haven', BELONG if
//     subordinate 'haven', LEAGUE if kind is covenant/trade (peer links
//     carry a/b, not primary/subordinate), else OTHER. Counts per
//     shape in linkShapeCounts.
//   tendCalls / counterAnswers / accordAnswers — courtship verb counts.
//   sayStrict — strict recount of diplomacy say-lines for
//     sense-testing: lines starting with a proposal/covenant/decline/
//     counter-negotiation pattern, plus 'Word will travel' opinion
//     lines; EXCLUDES COUNTER LEARNED and keepsake-bond lines (the
//     diplo-b capture-noise classes).
// GO-bar judge (coordinator-set): judgeAskplus(summaries) returns GO
// iff proposals on >= 6/8 seeds AND links on >= 3/8 seeds AND
// endDiplomacy > 0 on >= 3/8 seeds; NO-GO otherwise (a miss is NO-GO,
// never re-scored). INSUFFICIENT-DATA only if > 2 seeds carry
// instrument errors or zero otherVillages at day 1.
'use strict';
const BASE = require('./diplo-analyze-20261104');

function linkShape(link) {
  if (!link || typeof link !== 'object') return 'OTHER';
  if (link.primary === 'haven') return 'LEAD';
  if (link.subordinate === 'haven') return 'BELONG';
  if (link.kind === 'covenant' || link.kind === 'trade' || link.kind === 'league') return 'LEAGUE';
  if ((link.a && link.a !== 'haven') || (link.b && link.b !== 'haven')) return 'LEAGUE';
  return 'OTHER';
}

// Strict diplomacy say-line patterns (first-words match, not any-word).
// Proposal/covenant/counter-negotiation/decline shapes; opinion lines
// are counted separately as wordTravel.
const STRICT_RE = /^(.*propos.*|.*covenant.*|.*declin.*|.*counter.*offer.*|.*they (refuse|declined|accepted).*|.*we (accept|refuse|agree).*)$/i;
function isCounterLearned(line) { return /COUNTER LEARNED/i.test(line); }
function isKeepsakeBond(line) { return /keepsake/i.test(line) && /bond/i.test(line); }
function strictSayLines(out) {
  const lines = (out.sayLines || []).map(function (s) { return s.line || ''; });
  const strict = lines.filter(function (l) {
    if (isCounterLearned(l) || isKeepsakeBond(l)) return false;
    return STRICT_RE.test(l) || /Word will travel/i.test(l);
  });
  return {
    totalSampled: lines.length,
    strictCount: strict.length,
    wordTravel: lines.filter(function (l) { return /Word will travel/i.test(l); }).length,
    sample: strict.slice(0, 40),
  };
}

function summarizeSeed(out) {
  const s = BASE.summarizeSeed(out);
  const daily = out.daily || [];
  let maxDiplo = 0, diploDays = 0, regDays = 0, seasDays = 0;
  for (const snap of daily) {
    const d = (snap.standing && typeof snap.standing.diplomacy === 'number') ? snap.standing.diplomacy : 0;
    if (d > maxDiplo) maxDiplo = d;
    if (d > 0) diploDays++;
    if (snap.linkFunnel && snap.linkFunnel.regionalPlus > 0) regDays++;
    if (snap.linkFunnel && snap.linkFunnel.seasoned > 0) seasDays++;
  }
  const last = daily[daily.length - 1] || null;
  const endDiplo = (last && last.standing && typeof last.standing.diplomacy === 'number') ? last.standing.diplomacy : 0;
  s.maxDiplomacy = maxDiplo;
  s.endDiplomacy = endDiplo;
  s.diploPositiveDays = diploDays;
  s.regionalPlusDays = regDays;
  s.seasonedDays = seasDays;
  const shapes = (s.linksFormedDetail || []).map(function (f) { return { day: f.day, shape: linkShape(f.link), link: f.link }; });
  s.linkShapes = shapes;
  s.linkShapeCounts = {};
  shapes.forEach(function (x) { s.linkShapeCounts[x.shape] = (s.linkShapeCounts[x.shape] || 0) + 1; });
  const court = out.courtshipEvents || [];
  s.tendCalls = court.filter(function (e) { return e.fn === 'tendLink'; }).length;
  s.counterAnswers = court.filter(function (e) { return e.fn === 'answerCounter'; }).length;
  s.accordAnswers = court.filter(function (e) { return e.fn === 'answerAccord'; }).length;
  s.defenseAnswers = court.filter(function (e) { return e.fn === 'answerDefenseCall'; }).length;
  s.sayStrict = strictSayLines(out);
  return s;
}

function judgeAskplus(summaries) {
  const n = summaries.length;
  const propSeeds = summaries.filter(function (s) { return (s.proposalCalls || 0) > 0; }).length;
  const linkSeeds = summaries.filter(function (s) { return (s.linksFormed || 0) > 0; }).length;
  const diploSeeds = summaries.filter(function (s) { return (s.endDiplomacy || 0) > 0; }).length;
  const bad = summaries.filter(function (s) { return (s.instrumentErrors || 0) > 0 || (s.ovMax || 0) === 0; }).length;
  // Scaled bar: pilot is 8 seeds (>=6 proposals, >=3 links, >=3 diplo);
  // a confirm band scales proposals to >=75% and links to >=3/12.
  const propBar = (n === 8) ? 6 : Math.ceil(n * 0.75);
  const linkBar = (n === 8) ? 3 : 3;
  const diploBar = (n === 8) ? 3 : 3;
  const go = propSeeds >= propBar && linkSeeds >= linkBar && diploSeeds >= diploBar;
  return {
    n: n, propSeeds: propSeeds, propBar: propBar,
    linkSeeds: linkSeeds, linkBar: linkBar,
    diploSeeds: diploSeeds, diploBar: diploBar,
    badSeeds: bad,
    verdict: bad > 2 ? 'INSUFFICIENT-DATA' : (go ? 'GO' : 'NO-GO'),
  };
}

module.exports = {
  summarizeSeed: summarizeSeed, judgeAskplus: judgeAskplus,
  linkShape: linkShape, strictSayLines: strictSayLines,
  classifyProposal: BASE.classifyProposal, judgeGo: BASE.judgeGo,
};
