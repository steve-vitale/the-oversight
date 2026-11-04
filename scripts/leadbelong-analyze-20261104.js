// leadbelong-analyze-20261104.js — LEAD-vs-BELONG shape reporting
// (arm sim-leadbelong-b). Reads ONLY the stored sim-diplo-b corpus
// (evidence/2026-11-04/perseed-diplo-b/diplo-s9940*.json); writes a
// per-seed / per-link shape summary JSON. ZERO src/js changes, no
// harness, no new sims. Shape is read from link objects
// (primary/subordinate, kind + a/b, conquered flag), never from a
// say-line alone. See sim-leadbelong-b-prereg.md for definitions.
'use strict';
const fs = require('fs');
const path = require('path');

function classifyLink(l) {
  if (!l || typeof l !== 'object') return { shape: 'UNCLASSIFIED', conquered: false };
  const conquered = !!l.conquered;
  if (l.kind === 'covenant' || l.kind === 'trade') return { shape: 'LEAGUE', kind: l.kind, conquered };
  if (l.primary === 'haven' && l.subordinate && l.subordinate !== 'haven') return { shape: 'LEAD', conquered };
  if (l.subordinate === 'haven' && l.primary && l.primary !== 'haven') return { shape: 'BELONG', conquered };
  return { shape: 'UNCLASSIFIED', conquered };
}

function intentOfProposal(ev) {
  if (!ev) return 'UNKNOWN';
  if (ev.fn === 'proposeCovenant' || ev.fn === 'proposeTrade') return 'LEAGUE';
  if (ev.fn === 'proposeLink') {
    if (ev.opts && ev.opts.asSubordinate === true) return 'BELONG';
    if (ev.opts && ev.opts.asSubordinate === false) return 'LEAD';
    return 'UNKNOWN';
  }
  return 'UNKNOWN';
}

// Say-line classes. Over-catch checks run FIRST: a line that matches
// the diplo instrument's SAY_RE only via COUNTER LEARNED, a keepsake
// bond, an internal "proposed relief" journal line, gossip
// "opinions", or a reluctance "Not today" is over-catch, not
// diplomacy. STRICT diplomacy is deliberately narrow — a bare
// "counter" must NOT qualify, because the corpus is flooded with
// combat-tactic "Counter:" journal/codex lines and pantry
// "onto the counter" lines, none of which are diplomacy. A
// counter/decline/alliance line counts as strict ONLY with
// village/tribute/primacy/terms context. Strict lines: a "Word
// will travel" opinion line, the "don't know them well enough"
// knowledge gate, "They're watching", a proposal line (other
// than "proposed relief"), a covenant / trade-league / polity
// line, or a village-context counter/decline/alliance line.
const VILLAGE_CTX = /Stonebridge|Emberhold|Thornfield|Ashford|Hungry Road|tribute|primacy|terms|village/i;
function classifySay(line) {
  const s = String(line || '');
  // Combat-tactic journal/codex "Counter:" lines are not diplomacy
  // even when they contain words like "terms" ("on your terms").
  if (/^📓 (Journal|Codex): Counter:/i.test(s) || /^(Journal|Codex): Counter:/i.test(s)) return 'other';
  if (/COUNTER LEARNED/i.test(s)) return 'overcatch-counter-learned';
  if (/keepsake/i.test(s) && /bond/i.test(s)) return 'overcatch-keepsake-bond';
  if (/proposed relief/i.test(s)) return 'overcatch-proposed-relief';
  if (/everyone has opinions/i.test(s)) return 'overcatch-gossip-opinions';
  if (/not today\. sorry/i.test(s)) return 'overcatch-reluctance';
  if (/word will travel/i.test(s)) return 'strict-diplomacy';
  if (/don't know them well enough/i.test(s)) return 'strict-diplomacy';
  if (/they'?re watching/i.test(s)) return 'strict-diplomacy';
  if (/propos/i.test(s)) return 'strict-diplomacy';
  if (/covenant|trade league|polity/i.test(s)) return 'strict-diplomacy';
  if (/counter|declin|alliance/i.test(s) && VILLAGE_CTX.test(s)) return 'strict-diplomacy';
  return 'other';
}

function analyzeSeed(d) {
  const seed = d.seed;
  const ovSplinter = {};
  const ovName = {};
  for (const day of (d.daily || [])) {
    for (const ov of (day.ovs || [])) {
      ovName[ov.id] = ov.name || ov.id;
      if (ov.isSplinter || /^village_spl_/.test(ov.id)) ovSplinter[ov.id] = true;
    }
  }
  // Per-link daily trace.
  const links = {};
  const dailyShape = [];
  for (const day of (d.daily || [])) {
    const lf = day.linkFunnel || {};
    const byShape = { LEAD: 0, BELONG: 0, LEAGUE: 0, UNCLASSIFIED: 0 };
    const seasByShape = { LEAD: 0, BELONG: 0, LEAGUE: 0, UNCLASSIFIED: 0 };
    const regByShape = { LEAD: 0, BELONG: 0, LEAGUE: 0, UNCLASSIFIED: 0 };
    for (const det of (lf.detail || [])) {
      const c = classifyLink(det);
      byShape[c.shape] = (byShape[c.shape] || 0) + 1;
      if (det.seasoned) seasByShape[c.shape] = (seasByShape[c.shape] || 0) + 1;
      if (det.regionalPlus) regByShape[c.shape] = (regByShape[c.shape] || 0) + 1;
      const other = c.shape === 'LEAD' ? det.subordinate : c.shape === 'BELONG' ? det.primary : (det.a === 'haven' ? det.b : det.a);
      if (!links[det.id]) {
        links[det.id] = { id: det.id, other: other || null, otherName: ovName[other] || other || null,
          splinter: !!ovSplinter[other], formationShape: c.shape, formationKind: c.kind || det.kind || null,
          formationDay: day.day, formationTrust: det.trust, conquered: c.conquered,
          daysSeen: 0, maxTrust: det.trust, seasonedEver: false, seasonedFirstDay: null,
          regionalEver: false, regionalFirstDay: null, lastDay: day.day, lastStatus: det.status, lastTrust: det.trust };
      }
      const L = links[det.id];
      L.daysSeen += 1; L.lastDay = day.day; L.lastStatus = det.status; L.lastTrust = det.trust;
      L.maxTrust = Math.max(L.maxTrust, det.trust || 0);
      if (det.seasoned && !L.seasonedEver) { L.seasonedEver = true; L.seasonedFirstDay = day.day; }
      if (det.regionalPlus && !L.regionalEver) { L.regionalEver = true; L.regionalFirstDay = day.day; }
      L.endShape = c.shape;
    }
    dailyShape.push({ day: day.day, counts: byShape, seasoned: seasByShape, regionalPlus: regByShape,
      diplomacy: (day.standing || {}).diplomacy || 0, capped: day.capped || 0, scaleRank: day.scaleRank || null });
  }
  for (const id of Object.keys(links)) {
    const L = links[id];
    L.heldToEnd = L.lastStatus === 'active';
    L.shapeChanged = L.endShape !== L.formationShape;
    // Diplomacy value while this link was seasoned-regional+: max
    // daily diplomacy on days the link's detail read regionalPlus.
    let mx = 0; let daysReg = 0;
    for (const day of (d.daily || [])) {
      const det = ((day.linkFunnel || {}).detail || []).find((x) => x.id === id);
      if (det && det.regionalPlus) { daysReg += 1; mx = Math.max(mx, (day.standing || {}).diplomacy || 0); }
    }
    L.regionalPlusDays = daysReg; L.maxDiplomacyWhileRegional = mx;
  }
  // Proposal / counter trace.
  const proposals = [];
  const counterByTargetDay = {};
  for (const ev of (d.proposalEvents || [])) {
    const intent = intentOfProposal(ev);
    let outcome = 'unknown'; let linkId = null; let linkShape = null;
    if (ev.ret && typeof ev.ret === 'object' && ev.ret.id) { outcome = 'direct-accept'; linkId = ev.ret.id; linkShape = classifyLink(ev.ret).shape; }
    else if (ev.ret === 'counter') { outcome = 'counter'; counterByTargetDay[ev.target + '|' + ev.day] = ev; }
    else if (typeof ev.ret === 'string') outcome = ev.ret;
    proposals.push({ day: ev.day, fn: ev.fn, target: ev.target, targetName: ovName[ev.target] || ev.target,
      intent, outcome, linkId, linkShape });
  }
  const flips = [];
  const acceptedCounters = [];
  for (const ev of (d.courtshipEvents || [])) {
    if (ev.fn !== 'answerCounter' || ev.target !== 'accept') continue;
    const link = ev.ret && typeof ev.ret === 'object' ? ev.ret : null;
    if (!link || !link.id) { acceptedCounters.push({ day: ev.day, linkId: null, traced: false }); continue; }
    const shape = classifyLink(link).shape;
    // Find the counter proposal that produced it: the most recent
    // counter proposal whose target matches the link's other side.
    const other = shape === 'BELONG' ? link.primary : link.subordinate;
    const cands = proposals.filter((p) => p.outcome === 'counter' && p.target === other && p.day <= ev.day);
    const src = cands[cands.length - 1] || null;
    const rec = { day: ev.day, linkId: link.id, other, otherName: ovName[other] || other,
      intent: src ? src.intent : 'UNKNOWN', resultShape: shape, flip: !!(src && src.intent !== 'UNKNOWN' && src.intent !== shape) };
    acceptedCounters.push(rec);
    if (rec.flip) flips.push(rec);
  }
  // Say-line recount.
  const sayCounts = {};
  let strictDiplomacyLines = [];
  for (const s of (d.sayLines || [])) {
    const c = classifySay(s.line);
    sayCounts[c] = (sayCounts[c] || 0) + 1;
    if (c === 'strict-diplomacy') strictDiplomacyLines.push(s);
  }
  const captured = (d.sayLines || []).length;
  const overcatch = Object.keys(sayCounts).filter((k) => k.startsWith('overcatch'))
    .reduce((a, k) => a + sayCounts[k], 0);
  const wordWillTravel = (d.sayLines || []).filter((s) => /word will travel/i.test(s.line || '')).length;
  const politySystem = (d.sayLines || []).filter((s) => /GOVERNANCE LAYER|built a realm/i.test(s.line || '')).length;
  const w4faced = Math.max(0, ...((d.daily || []).map((x) => x.w4faced || 0)));
  const w5faced = Math.max(0, ...((d.daily || []).map((x) => x.w5faced || 0)));
  const ready5days = (d.daily || []).filter((x) => x.readiness5 && x.readiness5.ready).length;
  const maxDiplomacy = Math.max(0, ...((d.daily || []).map((x) => (x.standing || {}).diplomacy || 0)));
  const regionalPlusDays = (d.daily || []).filter((x) => (x.linkFunnel || {}).regionalPlus > 0).length;
  return { seed, policy: d.policy, arm: d.arm, anchorCommit: d.anchorCommit,
    days: d.days, endReason: d.endReason, won: !!d.won, scaleRankEnd: d.scaleRank,
    maxWave: d.maxWave, endUnlockedWave: d.endUnlockedWave,
    w4faced, w5faced, ready5days, maxDiplomacy, regionalPlusDays,
    links: Object.values(links), proposals, acceptedCounters, flips,
    sayCaptured: captured, sayCounts, overcatch, wordWillTravel, politySystem,
    strictDiplomacyLineCount: strictDiplomacyLines.length,
    strictDiplomacySample: strictDiplomacyLines.slice(0, 12).map((s) => ({ day: s.day, line: s.line })),
    dailyShape };
}

function analyzeCorpus(files) {
  const seeds = files.map((f) => analyzeSeed(JSON.parse(fs.readFileSync(f, 'utf8'))));
  const allLinks = seeds.flatMap((s) => s.links.map((l) => Object.assign({ seed: s.seed }, l)));
  const allProposals = seeds.flatMap((s) => s.proposals.map((p) => Object.assign({ seed: s.seed }, p)));
  const allAccepted = seeds.flatMap((s) => s.acceptedCounters.map((a) => Object.assign({ seed: s.seed }, a)));
  const allFlips = seeds.flatMap((s) => s.flips.map((x) => Object.assign({ seed: s.seed }, x)));
  const shapeCounts = {};
  for (const l of allLinks) shapeCounts[l.formationShape] = (shapeCounts[l.formationShape] || 0) + 1;
  const daysSorted = seeds.map((s) => s.days).sort((a, b) => a - b);
  const median = daysSorted.length % 2 ? daysSorted[Math.floor(daysSorted.length / 2)]
    : (daysSorted[daysSorted.length / 2 - 1] + daysSorted[daysSorted.length / 2]) / 2;
  return { seeds, totals: { seeds: seeds.length, links: allLinks.length, shapeCounts,
      proposals: allProposals.length, acceptedCounters: allAccepted.length, flips: allFlips.length,
      flipPerAcceptedCounter: allAccepted.length ? allFlips.length + '/' + allAccepted.length : 'n/a (0 accepted counters)',
      flipPerProposal: allProposals.length ? allFlips.length + '/' + allProposals.length : 'n/a',
      flipPerLink: allLinks.length ? allFlips.length + '/' + allLinks.length : 'n/a',
      sayCaptured: seeds.reduce((a, s) => a + s.sayCaptured, 0),
      sayOvercatch: seeds.reduce((a, s) => a + s.overcatch, 0),
      wins: seeds.filter((s) => s.won).length,
      national: seeds.filter((s) => s.scaleRankEnd === 'national').length,
      table: 0,
      w4unlock: seeds.filter((s) => s.maxWave >= 4).length,
      w5unlock: seeds.filter((s) => s.endUnlockedWave >= 5 || s.maxWave >= 5).length,
      w4faced: seeds.filter((s) => s.w4faced > 0).length,
      w5faced: seeds.filter((s) => s.w5faced > 0).length,
      medianSurvival: median, survivalDays: daysSorted } };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir || !out) { console.error('usage: node leadbelong-analyze-20261104.js <perseed-dir> <out-json>'); process.exit(2); }
  const files = fs.readdirSync(dir).filter((f) => /^diplo-s9940.*\.json$/.test(f)).sort()
    .map((f) => path.join(dir, f));
  if (files.length !== 8) { console.error('expected 8 corpus files, found ' + files.length); process.exit(1); }
  const res = analyzeCorpus(files);
  fs.writeFileSync(out, JSON.stringify(res, null, 2) + '\n');
  console.log('seeds=' + res.seeds.length + ' links=' + res.totals.links +
    ' shapes=' + JSON.stringify(res.totals.shapeCounts) +
    ' proposals=' + res.totals.proposals + ' acceptedCounters=' + res.totals.acceptedCounters +
    ' flips=' + res.totals.flips + ' sayCaptured=' + res.totals.sayCaptured +
    ' sayOvercatch=' + res.totals.sayOvercatch);
}
module.exports = { classifyLink, intentOfProposal, classifySay, analyzeSeed, analyzeCorpus };
