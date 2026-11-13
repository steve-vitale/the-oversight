// scholarschurn-analyze-20261112.js — scholar churn census analyzer
// (arm sim-scholarschurn-b). Reads the 8 per-seed JSONs in
// evidence/2026-11-12/perseed-scholarschurn-b/, computes the census
// tables + the prereg GO bar, writes scholarschurn-b-summary.json.
// Exit 0 iff complete + 0 unattributed scholar deaths + 100%
// succession coverage + 0 instrument errors.
// Usage:
//   node scripts/scholarschurn-analyze-20261112.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const SC = require(path.join(REPO, 'scripts', 'scholarschurn-instrument-20261112'));
const PA = require(path.join(REPO, 'scripts', 'pairarming-instrument-20261112'));

const DIR = path.join(REPO, 'evidence', '2026-11-12', 'perseed-scholarschurn-b');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'scholarschurn-pilot';
const MODE = 'current';

function load(seed) {
  const f = path.join(DIR, 'scholarschurn-s' + seed + '-' + RUN + '-' + MODE + '.json');
  if (!fs.existsSync(f)) return { seed: seed, missing: true, file: f };
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  j._file = f;
  return j;
}

// Distinct-day snapshots: the village-loss day can carry TWO
// snapshots (in-day + post-loss flush, pairarming §6 bug 2) —
// occurrence-aware dedup keeps the FIRST per day for chain checks
// (the in-day snapshot still shows the living roster).
function dedupDays(snaps) {
  const seen = {};
  const out = [];
  for (const s of (snaps || [])) {
    if (s == null || s.day == null) continue;
    if (seen[s.day]) continue;
    seen[s.day] = true;
    out.push(s);
  }
  return out;
}

function analyzeSeed(j) {
  const s = { seed: j.seed, missing: !!j.missing };
  if (j.missing) return s;
  s.days = j.days; s.gameDays = j.gameDays; s.endReason = j.endReason;
  s.won = !!j.won; s.villageLost = !!j.villageLost; s.scaleRank = j.scaleRank;
  s.maxWave = j.maxWave; s.standing = j.standing;
  s.totalDeaths = (j.regDeaths || []).length;
  s.samplesPlayerDeaths = (j.deaths || []).filter(function (d) { return d.player; }).length;
  s.instrumentErrors = (j.instrumentErrors || []).length;
  s.instrumentErrorList = (j.instrumentErrors || []).slice(0, 20);

  const wrap = j.scholarDeaths || [];
  const reg = j.regDeaths || [];
  const daily = dedupDays(j.scholarDaily || []);
  const gearDaily = j.gearDaily || [];
  s.scholarDeaths = wrap.length;
  s.scholarSays = (j.scholarSays || []).length;

  // --- Reconciliation: wrap records vs regDeath rows (GO bar 1) ---
  // A wrap record matches a regDeath row on the same day with the
  // same villagerId. A regDeath row is a scholar death iff its
  // villagerId was the scholar on the previous snapshot day or the
  // current snapshot day (succession happens before the snapshot, so
  // same-day alone undercounts — prereg sizing probe).
  const schByDay = {};
  for (const d of daily) schByDay[d.day] = d.scholarId;
  const daysSorted = Object.keys(schByDay).map(Number).sort(function (a, b) { return a - b; });
  function prevScholarId(day) {
    let prev = null;
    for (const d of daysSorted) { if (d < day) prev = d; else break; }
    return prev === null ? null : schByDay[prev];
  }
  const regByKey = {};
  for (const r of reg) {
    if (!r || r.villagerId == null) continue;
    regByKey[r.day + '|' + r.villagerId] = r;
  }
  s.wrapWithoutReg = [];
  for (const w of wrap) {
    if (!regByKey[w.day + '|' + w.scholarId]) s.wrapWithoutReg.push({ day: w.day, id: w.scholarId, name: w.scholarName, cause: w.cause });
  }
  s.regScholarWithoutWrap = [];
  const scholarRegKeys = {};
  for (const r of reg) {
    if (!r || r.villagerId == null) continue;
    const wasScholar = (schByDay[r.day] === r.villagerId) || (prevScholarId(r.day) === r.villagerId);
    if (!wasScholar) continue;
    scholarRegKeys[r.day + '|' + r.villagerId] = true;
    const hit = wrap.filter(function (w) { return w.day === r.day && w.scholarId === r.villagerId; });
    if (!hit.length) s.regScholarWithoutWrap.push({ day: r.day, id: r.villagerId, name: r.name, cause: r.cause });
  }
  s.unattributed = s.wrapWithoutReg.length + s.regScholarWithoutWrap.length;
  s.scholarRegDeaths = Object.keys(scholarRegKeys).length;
  s.nonScholarDeaths = s.totalDeaths - s.scholarRegDeaths;

  // --- Succession coverage (GO bar 2) ---
  // Every wrap record that does not end the village names a successor;
  // the successor held the mantle iff they appear as scholarId on some
  // snapshot at day >= the death day, OR they have their own wrap
  // record (they died as scholar — the wrap only fires for the sitting
  // scholar). The second clause is what same-day cascades need: on
  // 190393 d61 seven scholars die in one day, the daily snapshot is
  // taken mid-day, and the intermediate bearers (Pilar, Bessie, Dale,
  // Henry, Jovan) never appear on any snapshot — they held the mantle
  // for minutes between two deaths, and their own death records are
  // the evidence. Sleep-boundary deaths need the first clause's
  // day >= (not ==): a scholar who dies after the death-day snapshot
  // (during sleep) first appears on the NEXT day's snapshot.
  s.successions = 0; s.successionsUncovered = [];
  for (const w of wrap) {
    if (w.villageLost) continue;
    s.successions++;
    if (!w.successorId) { s.successionsUncovered.push({ day: w.day, why: 'no-successor-named' }); continue; }
    const seenOnSnapshot = daily.some(function (d) { return d.day >= w.day && d.scholarId === w.successorId; });
    const diedAsScholar = wrap.some(function (x) { return x.scholarId === w.successorId && x.day >= w.day; });
    if (!seenOnSnapshot && !diedAsScholar) {
      const first = daily.filter(function (d) { return d.day >= w.day; })[0];
      s.successionsUncovered.push({ day: w.day, why: 'snapshot-shows-' + (first ? first.scholarId : 'none'), named: w.successorId });
    }
  }
  s.successionCoverage = s.successions ? (s.successions - s.successionsUncovered.length) / s.successions : 1;

  // --- ScholarId chain consistency (GO bar 3) ---
  // Consecutive distinct-day snapshots change scholarId ONLY on a day
  // with a wrap record for the outgoing id.
  s.chainViolations = [];
  for (let i = 1; i < daily.length; i++) {
    const prev = daily[i - 1], cur = daily[i];
    if (prev.scholarId && cur.scholarId && prev.scholarId !== cur.scholarId) {
      const hit = wrap.filter(function (w) { return w.scholarId === prev.scholarId && (w.day === cur.day || w.day === cur.day - 1); });
      if (!hit.length) s.chainViolations.push({ fromDay: prev.day, toDay: cur.day, from: prev.scholarId, to: cur.scholarId });
    }
  }

  // --- Cause x location table ---
  s.byCause = {}; s.byLocation = {}; s.byCauseLocation = {};
  for (const w of wrap) {
    s.byCause[w.causeClass] = (s.byCause[w.causeClass] || 0) + 1;
    s.byLocation[w.location] = (s.byLocation[w.location] || 0) + 1;
    const k = w.causeClass + '/' + w.location;
    s.byCauseLocation[k] = (s.byCauseLocation[k] || 0) + 1;
  }
  s.wildDeaths = wrap.filter(function (w) { return w.location !== 'home'; }).length;
  s.homeDeaths = wrap.filter(function (w) { return w.location === 'home'; }).length;
  s.veteranDeaths = wrap.filter(function (w) { return w.veteranW4; }).length;
  s.pelletBearerDeaths = wrap.filter(function (w) { return w.pelletBearer; }).length;
  s.reactorBearerDeaths = wrap.filter(function (w) { return w.reactorBearer; }).length;

  // --- Tenure: from wrap records (authoritative, snapshot-proof) ---
  // Bearer i holds from (previous succession day) to (death day);
  // the final bearer holds to the last snapshot day.
  const lastDay = daysSorted.length ? daysSorted[daysSorted.length - 1] : 0;
  s.tenures = [];
  let startDay = 1;
  let holder = daily.length ? daily[0].scholarId : null;
  for (const w of wrap) {
    s.tenures.push({ id: w.scholarId, name: w.scholarName, startDay: startDay, endDay: w.day, days: Math.max(0, w.day - startDay + 1), cause: w.cause, location: w.location, wasVeteran: !!w.veteranW4 });
    startDay = w.day;
    holder = w.successorId;
  }
  if (holder && !wrapsEndVillage(wrap)) {
    s.tenures.push({ id: holder, name: null, startDay: startDay, endDay: lastDay, days: Math.max(0, lastDay - startDay + 1), cause: null, location: null, wasVeteran: null, final: true });
  }
  function wrapsEndVillage(wr) {
    return wr.length && wr[wr.length - 1].villageLost;
  }

  // --- Death rates ---
  // Scholar-days: every lived day has exactly one scholar (the game
  // day count); villager-days: summed living roster per distinct day.
  s.scholarDays = Math.max(1, lastDay);
  s.scholarDeathRate = +(100 * s.scholarDeaths / s.scholarDays).toFixed(2);
  let villagerDays = 0;
  const gearSeenDays = {};
  for (const g of gearDaily) {
    if (!g || !g.members) continue;
    if (gearSeenDays[g.day]) continue; // village-loss day flushes twice (pairarming §6 bug 2)
    gearSeenDays[g.day] = true;
    villagerDays += g.members.filter(function (m) { return m && m.alive && !m.isScholar; }).length;
  }
  s.villagerDays = villagerDays;
  s.villagerDeathRate = villagerDays ? +(100 * s.nonScholarDeaths / villagerDays).toFixed(2) : null;

  // --- Successor readiness: days to armed / ability / first kill ---
  const lastVfDaily = (j.daily || [])[(j.daily || []).length - 1];
  const fullLog = (lastVfDaily && lastVfDaily.waveKillLog) || [];
  s.recoveries = [];
  for (const w of wrap) {
    if (w.villageLost || !w.successorId) continue;
    const rec = { deathDay: w.day, successorId: w.successorId, successorName: w.successorName, successorWasVeteran: !!w.successorWasVeteran, successorAbilityCount: (w.successorAbilityIds || []).length };
    const after = daily.filter(function (d) { return d.day >= w.day && d.scholarId === w.successorId; });
    const armedDay = after.filter(function (d) { return d.scholarArmed; })[0];
    rec.daysToArmed = armedDay ? (armedDay.day - w.day) : null;
    const abDay = after.filter(function (d) { return (d.abilityCount | 0) >= 1; })[0];
    rec.daysToAbility = abDay ? (abDay.day - w.day) : null;
    const killDay = SC.firstWaveKillDay(fullLog, w.successorId, w.day);
    rec.daysToFirstKill = (killDay === null) ? null : (killDay - w.day);
    rec.observedDays = after.length ? (after[after.length - 1].day - w.day + 1) : 0;
    s.recoveries.push(rec);
  }
  // Days lost to churn: summed days-to-armed (censored at horizon end
  // when never re-armed: observed days count instead, flagged).
  s.daysLostToArmed = 0; s.daysLostCensored = 0;
  for (const r of s.recoveries) {
    if (r.daysToArmed === null) { s.daysLostToArmed += r.observedDays; s.daysLostCensored++; }
    else s.daysLostToArmed += r.daysToArmed;
  }
  // Scholar-days lived at 0 abilities.
  s.zeroAbilityScholarDays = daily.filter(function (d) { return (d.abilityCount | 0) === 0; }).length;

  // --- Hold stranding ---
  const hs = SC.findHoldStranding(gearDaily, wrap);
  s.holdBlocks = hs.blocks;
  s.holdStrandings = hs.strandings;
  s.holdDayDeaths = hs.strandings.filter(function (r) { return r.pairHoldDay; }).length;
  s.deferralDayDeaths = hs.strandings.filter(function (r) { return r.deferralHoldDay; }).length;
  s.pairEndedAfterDeath = hs.strandings.filter(function (r) { return r.pairEndsWithin7 === true; }).length;

  // --- Snapshot coverage (completeness) ---
  s.snapshotDays = daysSorted.length;
  s.snapshotFirstDay = daysSorted.length ? daysSorted[0] : null;
  s.snapshotLastDay = lastDay;
  let gaps = 0;
  for (let i = 1; i < daysSorted.length; i++) if (daysSorted[i] !== daysSorted[i - 1] + 1) gaps++;
  s.snapshotGaps = gaps;

  return s;
}

function main() {
  const perSeed = [];
  let complete = true;
  for (const seed of SEEDS) {
    const j = load(seed);
    if (j.missing) { complete = false; console.log('MISSING ' + j.file); perSeed.push({ seed: seed, missing: true }); continue; }
    perSeed.push(analyzeSeed(j));
  }

  // Band rollup.
  const ok = perSeed.filter(function (s) { return !s.missing; });
  const sum = function (f) { return ok.reduce(function (a, s) { return a + ((f(s) | 0) || 0); }, 0); };
  const band = {
    seeds: SEEDS, complete: complete,
    survived: ok.filter(function (s) { return !s.villageLost; }).length,
    wins: ok.filter(function (s) { return s.won; }).length,
    national: ok.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'galactic'; }).length,
    table: 0, // wins count sittings per MEASUREMENT §15 ruling 665; no wins, no table
    wave5: ok.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
    wave4: ok.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
    medianDays: median(ok.map(function (s) { return s.days; })),
    totalDeaths: sum(function (s) { return s.totalDeaths; }),
    scholarDeaths: sum(function (s) { return s.scholarDeaths; }),
    scholarRegDeaths: sum(function (s) { return s.scholarRegDeaths; }),
    samplesPlayerDeaths: sum(function (s) { return s.samplesPlayerDeaths; }),
    nonScholarDeaths: sum(function (s) { return s.nonScholarDeaths; }),
    scholarDays: sum(function (s) { return s.scholarDays; }),
    villagerDays: sum(function (s) { return s.villagerDays; }),
    scholarDeathRate: null, villagerDeathRate: null,
    wildDeaths: sum(function (s) { return s.wildDeaths; }),
    homeDeaths: sum(function (s) { return s.homeDeaths; }),
    veteranDeaths: sum(function (s) { return s.veteranDeaths; }),
    pelletBearerDeaths: sum(function (s) { return s.pelletBearerDeaths; }),
    reactorBearerDeaths: sum(function (s) { return s.reactorBearerDeaths; }),
    successions: sum(function (s) { return s.successions; }),
    daysLostToArmed: sum(function (s) { return s.daysLostToArmed; }),
    zeroAbilityScholarDays: sum(function (s) { return s.zeroAbilityScholarDays; }),
    holdDayDeaths: sum(function (s) { return s.holdDayDeaths; }),
    deferralDayDeaths: sum(function (s) { return s.deferralDayDeaths; }),
    pairEndedAfterDeath: sum(function (s) { return s.pairEndedAfterDeath; }),
    unattributed: sum(function (s) { return s.unattributed; }),
    chainViolations: sum(function (s) { return s.chainViolations.length; }),
    successionUncovered: sum(function (s) { return s.successionsUncovered.length; }),
    instrumentErrors: sum(function (s) { return s.instrumentErrors; }),
    byCause: {}, byLocation: {}, byCauseLocation: {},
    tenures: [],
    recoveries: [],
  };
  band.scholarDeathRate = band.scholarDays ? +(100 * band.scholarDeaths / band.scholarDays).toFixed(2) : null;
  band.villagerDeathRate = band.villagerDays ? +(100 * band.nonScholarDeaths / band.villagerDays).toFixed(2) : null;
  for (const s of ok) {
    for (const k of Object.keys(s.byCause || {})) band.byCause[k] = (band.byCause[k] || 0) + s.byCause[k];
    for (const k of Object.keys(s.byLocation || {})) band.byLocation[k] = (band.byLocation[k] || 0) + s.byLocation[k];
    for (const k of Object.keys(s.byCauseLocation || {})) band.byCauseLocation[k] = (band.byCauseLocation[k] || 0) + s.byCauseLocation[k];
    band.tenures.push.apply(band.tenures, (s.tenures || []).map(function (t) { return Object.assign({ seed: s.seed }, t); }));
    band.recoveries.push.apply(band.recoveries, (s.recoveries || []).map(function (r) { return Object.assign({ seed: s.seed }, r); }));
  }
  const tenuresDone = band.tenures.filter(function (t) { return !t.final; }).map(function (t) { return t.days; }).sort(function (a, b) { return a - b; });
  band.tenureMedian = median(tenuresDone);
  band.tenureMin = tenuresDone.length ? tenuresDone[0] : null;
  band.tenureMax = tenuresDone.length ? tenuresDone[tenuresDone.length - 1] : null;
  band.tenureMean = tenuresDone.length ? +(tenuresDone.reduce(function (a, b) { return a + b; }, 0) / tenuresDone.length).toFixed(1) : null;
  const armedDays = band.recoveries.map(function (r) { return r.daysToArmed; }).filter(function (x) { return x !== null; });
  band.daysToArmedMedian = median(armedDays);
  band.daysToArmedNever = band.recoveries.filter(function (r) { return r.daysToArmed === null; }).length;
  const abDays = band.recoveries.map(function (r) { return r.daysToAbility; }).filter(function (x) { return x !== null; });
  band.daysToAbilityMedian = median(abDays);
  band.daysToAbilityNever = band.recoveries.filter(function (r) { return r.daysToAbility === null; }).length;
  const killDays = band.recoveries.map(function (r) { return r.daysToFirstKill; }).filter(function (x) { return x !== null; });
  band.daysToFirstKillMedian = median(killDays);
  band.daysToFirstKillNever = band.recoveries.filter(function (r) { return r.daysToFirstKill === null; }).length;

  // GO bar (prereg): instrument validity only.
  const go = {
    complete: complete,
    unattributed: band.unattributed,
    unattributedOk: band.unattributed === 0,
    successionCoverageOk: band.successionUncovered === 0,
    chainOk: band.chainViolations === 0,
    instrumentErrors: band.instrumentErrors,
    instrumentErrorsOk: band.instrumentErrors === 0,
  };
  go.pass = go.complete && go.unattributedOk && go.successionCoverageOk && go.chainOk && go.instrumentErrorsOk;

  const summary = { arm: 'scholarschurn', run: RUN, mode: MODE, band: band, go: go, perSeed: perSeed };
  const outFile = path.join(REPO, 'evidence', '2026-11-12', 'scholarschurn-b-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');

  console.log('SCHOLARSCHURN band: survived ' + band.survived + '/8 wins ' + band.wins + ' national ' + band.national + ' wave5 ' + band.wave5 + '/8 medianDays ' + band.medianDays);
  console.log('scholar deaths ' + band.scholarDeaths + ' in ' + band.scholarDays + ' scholar-days = ' + band.scholarDeathRate + '/100d; villagers ' + band.nonScholarDeaths + ' in ' + band.villagerDays + ' villager-days = ' + band.villagerDeathRate + '/100d');
  console.log('wild ' + band.wildDeaths + ' home ' + band.homeDeaths + ' veteran ' + band.veteranDeaths + ' pellet ' + band.pelletBearerDeaths + ' reactor ' + band.reactorBearerDeaths);
  console.log('byCause ' + JSON.stringify(band.byCause) + ' byLocation ' + JSON.stringify(band.byLocation));
  console.log('tenure median ' + band.tenureMedian + 'd mean ' + band.tenureMean + ' min ' + band.tenureMin + ' max ' + band.tenureMax);
  console.log('daysToArmed median ' + band.daysToArmedMedian + ' never ' + band.daysToArmedNever + '/' + band.recoveries.length + '; daysToAbility median ' + band.daysToAbilityMedian + ' never ' + band.daysToAbilityNever + '; daysToKill median ' + band.daysToFirstKillMedian + ' never ' + band.daysToFirstKillNever);
  console.log('daysLostToArmed ' + band.daysLostToArmed + ' zeroAbilityScholarDays ' + band.zeroAbilityScholarDays);
  console.log('holdDayDeaths ' + band.holdDayDeaths + ' deferralDayDeaths ' + band.deferralDayDeaths + ' pairEndedAfterDeath ' + band.pairEndedAfterDeath);
  console.log('samples player:true ' + band.samplesPlayerDeaths + ' vs wrap scholar deaths ' + band.scholarDeaths);
  console.log('GO: complete ' + go.complete + ' unattributed ' + band.unattributed + ' successionUncovered ' + band.successionUncovered + ' chainViolations ' + band.chainViolations + ' instrumentErrors ' + band.instrumentErrors + ' => ' + (go.pass ? 'GO' : 'NO-GO'));
  console.log('summary: ' + path.relative(REPO, outFile));
  process.exit(go.pass ? 0 : 1);
}

function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

if (require.main === module) main();
module.exports = { analyzeSeed: analyzeSeed, dedupDays: dedupDays };
