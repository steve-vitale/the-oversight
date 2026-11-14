// retribution-offer-analyze-20261114.js — judge for the
// retribution-offer driver (arm sim-retribution-offer-b). Aggregates
// the per-seed JSONs: offer counts by source/status, retribution
// offer rate + sheet position, combat-kit depth at combat offers,
// Bulwark recognitions, resolutions, NPC scan, held-but-never-offered,
// scale-wall numbers. Checks the prereg GO bars (a)-(d),(f) and
// exits 1 when any fails.
// Usage: node scripts/retribution-offer-analyze-20261114.js [dir]
//   (default evidence/2026-11-14/perseed-retribution-offer-b)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function analyze(docs) {
  const A = {
    seeds: docs.length,
    offers: 0, bySource: {}, byStatus: {},
    retributionOffers: 0, retributionBySource: {}, retributionPositions: {},
    retributionOfferSeeds: [],
    combatLevelUps: 0, combatKitHeldAtCombatOffer: [],
    bulwarkRecognisedOffers: 0, bulwarkSeeds: [],
    accepted: 0, declinedByPosition: 0, stalledAttempts: 0,
    stalledFullLevelup: 0, kept: 0, trampled: 0, pendingAtEnd: 0,
    unattributed: 0, taughtSkill: 0,
    scholarHasRetribution: 0, scholarHeldCounts: [],
    pendingSheetAtEnd: 0, queueDepthAtEnd: [],
    npcScanned: 0, npcRetributionHolders: [], npcOfferedRetribution: [],
    villagerOffers: 0, villagerRetributionOffers: 0, villagerGrants: 0,
    heldButNeverOffered: {},
    instrumentErrors: 0, instrumentMissing: 0,
    survived: 0, medianDays: null, maxWave5: 0, national: 0, table: 0, wins: 0,
  };
  const days = [];
  for (const d of docs) {
    const offers = d.offers || [];
    A.offers += offers.length;
    for (const o of offers) {
      A.bySource[o.source] = (A.bySource[o.source] || 0) + 1;
      A.byStatus[o.status] = (A.byStatus[o.status] || 0) + 1;
      if (o.retributionPos >= 0) {
        A.retributionOffers++;
        A.retributionBySource[o.source] = (A.retributionBySource[o.source] || 0) + 1;
        A.retributionPositions[o.retributionPos] = (A.retributionPositions[o.retributionPos] || 0) + 1;
        if (A.retributionOfferSeeds.indexOf(d.seed) < 0) A.retributionOfferSeeds.push(d.seed);
      }
      if (o.source === 'level_up' && o.track === 'combat') {
        A.combatLevelUps++;
        A.combatKitHeldAtCombatOffer.push(o.combatKitHeldCount);
      }
      if (o.classRec && o.classRec.path === 'shieldbearer' && o.classRec.subclass === 'bulwark') {
        A.bulwarkRecognisedOffers++;
        if (A.bulwarkSeeds.indexOf(d.seed) < 0) A.bulwarkSeeds.push(d.seed);
      }
      if (o.status === 'accepted') {
        A.accepted++;
        if ((o.declinedByPosition || []).indexOf('retribution') >= 0) A.declinedByPosition++;
      }
      if (o.status === 'kept') A.kept++;
      if (o.status === 'trampled') A.trampled++;
      if (o.status === 'pending-at-end') A.pendingAtEnd++;
      if (o.status === 'unattributed') A.unattributed++;
      if (o.status === 'taught-skill') A.taughtSkill++;
      A.stalledAttempts += (o.stallAttempts || []).length;
      for (const s of (o.stallAttempts || [])) if (s.class === 'stalled-full-levelup') A.stalledFullLevelup++;
    }
    const es = d.endState || {};
    if (es.hasRetribution) A.scholarHasRetribution++;
    A.scholarHeldCounts.push(es.scholarHeldCount || 0);
    if ((es.pendingSheet || []).length) A.pendingSheetAtEnd++;
    A.queueDepthAtEnd.push(es.queueDepth || 0);
    for (const id of (es.heldButNeverOffered || [])) A.heldButNeverOffered[id] = (A.heldButNeverOffered[id] || 0) + 1;
    A.npcScanned += es.npcScanned || 0;
    for (const vid of (es.npcRetributionHolders || [])) A.npcRetributionHolders.push(d.seed + ':' + vid);
    for (const vid of (es.npcOfferedRetribution || [])) A.npcOfferedRetribution.push(d.seed + ':' + vid);
    A.villagerOffers += (d.villagerOffers || []).length;
    for (const vo of (d.villagerOffers || [])) if (vo.retributionPos >= 0) A.villagerRetributionOffers++;
    A.villagerGrants += (d.villagerGrants || []).filter(function (g) { return g.granted; }).length;
    A.instrumentErrors += (d.instrumentErrors || []).length;
    A.instrumentMissing += (d.instrumentMissing || []).length;
    days.push(d.days || 0);
    if (!d.villageLost && d.days >= 150) A.survived++;
    if ((d.maxWave || 0) >= 5) A.maxWave5++;
    if (d.scaleRank === 'national' || d.scaleRank === 'global') A.national++;
    if (d.won) { A.wins++; A.table++; }
  }
  days.sort(function (a, b) { return a - b; });
  A.medianDays = days.length ? days[Math.floor(days.length / 2)] : null;
  A.retributionOfferRatePerLevelUp = A.offers ? A.retributionOffers / A.offers : 0;
  return A;
}

function checkGoBars(A) {
  // Prereg GO bars: (a) every offer attributable; (b) retribution
  // rate counted per level-up with contrast; (c) code gate confirmed
  // or corrected; (d) NPC scan complete; (f) zero instrument errors.
  const fails = [];
  if (A.unattributed > 0) fails.push('(a) unattributed offers: ' + A.unattributed);
  if ((A.byStatus.pending || 0) > 0) fails.push('(a) offers left in raw pending (closeout missed): ' + A.byStatus.pending);
  if (!A.seeds) fails.push('(b) no seeds analysed');
  // (c) every retribution offer must come from a route the code gate
  // allows (level_up only). Any other source is a code-gate correction.
  const badSources = Object.keys(A.retributionBySource).filter(function (s) { return s !== 'level_up'; });
  if (badSources.length) fails.push('(c) retribution offered via non-level-up source: ' + badSources.join(',') + ' (code-gate correction — see evidence)');
  if (A.npcScanned === 0) fails.push('(d) NPC scan empty');
  if (A.instrumentErrors > 0) fails.push('(f) instrument errors: ' + A.instrumentErrors);
  if (A.instrumentMissing > 0) fails.push('(f) instrument missing methods: ' + A.instrumentMissing);
  return fails;
}

function report(A) {
  const L = [];
  L.push('seeds: ' + A.seeds);
  L.push('offers: ' + A.offers + ' bySource=' + JSON.stringify(A.bySource) + ' byStatus=' + JSON.stringify(A.byStatus));
  L.push('retribution offers: ' + A.retributionOffers + ' (' + (100 * A.retributionOfferRatePerLevelUp).toFixed(1) + '% of offers)'
    + ' bySource=' + JSON.stringify(A.retributionBySource)
    + ' positions=' + JSON.stringify(A.retributionPositions)
    + ' seeds=' + JSON.stringify(A.retributionOfferSeeds));
  L.push('combat level-ups: ' + A.combatLevelUps + ' combatKitHeldAtCombatOffer=' + JSON.stringify(A.combatKitHeldAtCombatOffer));
  L.push('Bulwark-recognised offers: ' + A.bulwarkRecognisedOffers + ' seeds=' + JSON.stringify(A.bulwarkSeeds));
  L.push('resolutions: accepted=' + A.accepted + ' declinedByPosition(retribution)=' + A.declinedByPosition
    + ' stallAttempts=' + A.stalledAttempts + ' (full-levelup=' + A.stalledFullLevelup + ')'
    + ' kept=' + A.kept + ' trampled=' + A.trampled + ' pendingAtEnd=' + A.pendingAtEnd
    + ' unattributed=' + A.unattributed + ' taughtSkill=' + A.taughtSkill);
  L.push('scholar: hasRetribution on ' + A.scholarHasRetribution + '/' + A.seeds + ' seeds; heldCounts=' + JSON.stringify(A.scholarHeldCounts)
    + '; pendingSheetAtEnd=' + A.pendingSheetAtEnd + '; queueDepthAtEnd=' + JSON.stringify(A.queueDepthAtEnd));
  L.push('held-but-never-offered: ' + JSON.stringify(A.heldButNeverOffered));
  L.push('NPC: scanned=' + A.npcScanned + ' retributionHolders=' + JSON.stringify(A.npcRetributionHolders)
    + ' offeredRetribution=' + JSON.stringify(A.npcOfferedRetribution)
    + ' villagerOffers=' + A.villagerOffers + ' villagerRetributionOffers=' + A.villagerRetributionOffers
    + ' villagerGrants=' + A.villagerGrants);
  L.push('instrument: errors=' + A.instrumentErrors + ' missing=' + A.instrumentMissing);
  L.push('scale-wall: survived=' + A.survived + '/' + A.seeds + ' medianDays=' + A.medianDays
    + ' maxWave5=' + A.maxWave5 + ' national=' + A.national + ' table/wins=' + A.table + '/' + A.wins);
  return L.join('\n');
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-14', 'perseed-retribution-offer-b');
  const docs = loadDir(dir);
  const A = analyze(docs);
  console.log(report(A));
  const fails = checkGoBars(A);
  if (fails.length) {
    console.log('GO-BAR FAILURES:');
    for (const f of fails) console.log('  FAIL ' + f);
    process.exitCode = 1;
  } else console.log('GO BARS: all pass');
}

module.exports = { loadDir: loadDir, analyze: analyze, checkGoBars: checkGoBars, report: report };
