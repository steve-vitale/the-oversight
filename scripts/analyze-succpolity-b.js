// analyze-succpolity-b.js — analyzer for the MEASUREMENT arm
// sim-succpolity-b (run fleshout-loop-b-20261114T2345Z). Reads the
// per-seed JSONs from scripts/succpolity-driver-20261114.js and the
// committed answercourt-confirm corpus (the baseline leg), and
// produces per-seed + per-leg summaries against the prereg's binding
// bars:
//   - dissolution EVENTS from the per-day series (national->regional
//     transitions — never end-state arithmetic; holdrealm metric
//     review §1), with the holdrealm classifyOne/deepDive/reclimb
//     alongside reads (required as a module, not copied);
//   - re-climbs (regional->national after a dissolution);
//   - succgrace-beat accounting (staged / answered / lapsed /
//     pending-at-end, from the prSg series + verbEvents + policy
//     stats; young-link answers are a G1 violation);
//   - wall numbers + cost bar (starvation deaths, median survival).
// Usage: node scripts/analyze-succpolity-b.js [perSeedDir] [corpusDir]
//   writes evidence/2026-11-14/succpolity-b-analysis.json and prints a
//   human summary to stdout.
// As a module: { dissolutionEvents, reclimbEvents, succgraceAccounting,
//   summarizeSeed, analyze }.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { classifyOne, deepDive, reclimb } = require('./analyze-holdrealm-b');

const CORPUS_ARMED = 'competent-answercourt-b';
const KNOWN_DISSOLUTION_SEEDS = [100203, 100204, 100206, 100208, 100211, 100212, 100216];
const PILOT_DISSOLUTION_SEEDS = [100203, 100204, 100206, 100208];
const RECLIMB_SEEDS = [100203, 100212];
const CORPUS_ARMED_STARVATION = 6;   // answercourt confirm evidence, armed leg
const CORPUS_ARMED_MEDIAN = 121.5;   // answercourt confirm evidence, armed leg

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ALL dissolution events in the per-day series: every national->
// regional transition, with the held days before it. A realm that
// dissolves, re-climbs and dissolves again counts twice — end-state
// counting would erase the first one.
function dissolutionEvents(rec) {
  const out = [];
  const series = rec.series || [];
  let nationalDay = null;
  for (let i = 0; i < series.length; i++) {
    const sc = series[i].scale;
    if ((sc === 'national' || sc === 'global') && nationalDay === null) nationalDay = series[i].d;
    if (nationalDay !== null && sc === 'regional') {
      out.push({ day: series[i].d, nationalDay: nationalDay, heldDays: series[i].d - nationalDay });
      nationalDay = null;
    }
  }
  return out;
}

// ALL re-climb events: every regional->national transition AFTER a
// dissolution has happened.
function reclimbEvents(rec) {
  const out = [];
  const series = rec.series || [];
  let dissolved = false;
  let wasNational = false;
  for (let i = 0; i < series.length; i++) {
    const sc = series[i].scale;
    const isNat = (sc === 'national' || sc === 'global');
    if (wasNational && !isNat) dissolved = true;
    if (dissolved && !wasNational && isNat) {
      out.push({ day: series[i].d });
      dissolved = false;
    }
    wasNational = isNat;
  }
  return out;
}

// Succgrace-beat accounting for one record.
// staged: prSg 0->1 transitions per link in the series.
// answered: answerRenegotiation verb events whose link showed prSg=1
//   on the answer day or the day before (the beat stages during a
//   day's play and is answered at the next daily, before that day's
//   snapshot — so the staging day's snapshot carries prSg=1).
// youngAnswers: answerRenegotiation events with prSg=0 on both days —
//   a young-link beat answered, which the policy must never do (G1).
// lapsed: staged beats whose prSg returned to 0 with no answer (the
//   7-day expiry, or the link breaking with the beat pending).
// pendingAtEnd: prSg=1 on the last snapshot (beat still open when the
//   run ended — neither answered nor lapsed).
function succgraceAccounting(rec) {
  const series = rec.series || [];
  const prSgByLinkDay = {}; // linkId -> { day: prSg }
  const staged = []; // { linkId, other, day }
  const prev = {};
  for (const sn of series) {
    for (const l of (sn.linksRoll || [])) {
      if (!l || !l.id) continue;
      const sg = l.prSg ? 1 : 0;
      if (!prSgByLinkDay[l.id]) prSgByLinkDay[l.id] = {};
      prSgByLinkDay[l.id][sn.d] = sg;
      if (sg === 1 && prev[l.id] !== 1) staged.push({ linkId: l.id, other: l.o || null, day: sn.d });
      prev[l.id] = sg;
    }
  }
  const answers = [];
  const youngAnswers = [];
  for (const ev of (rec.verbEvents || [])) {
    if (ev.verb !== 'answerRenegotiation' || !ev.linkId) continue;
    const byDay = prSgByLinkDay[ev.linkId] || {};
    const sgHere = (byDay[ev.day] === 1) || (byDay[ev.day - 1] === 1);
    const entry = { day: ev.day, linkId: ev.linkId, other: ev.other || null,
      caller: ev.caller, result: ev.result, dTrust: ev.dTrust };
    if (sgHere) answers.push(entry);
    else youngAnswers.push(entry);
  }
  // A staged beat is answered if some answer event names its link on a
  // day >= the staging day and <= staging day + 7 (the expiry window).
  const answeredStaged = [];
  const lapsed = [];
  const pendingAtEnd = [];
  const lastDay = series.length ? series[series.length - 1].d : 0;
  for (const s of staged) {
    const hit = answers.find(function (a) { return a.linkId === s.linkId && a.day >= s.day && a.day <= s.day + 7; });
    if (hit) { answeredStaged.push({ staged: s, answer: hit }); continue; }
    const days = prSgByLinkDay[s.linkId] || {};
    const lastSgDay = Math.max.apply(null, Object.keys(days).filter(function (d) { return days[d] === 1; }).map(Number).concat([-1]));
    if (lastSgDay === lastDay) pendingAtEnd.push(s);
    else lapsed.push(s);
  }
  const policyStats = (rec.capSummary && rec.capSummary.succpolity) || null;
  return {
    staged: staged, stagedCount: staged.length,
    answered: answers, answeredCount: answers.length,
    answeredStagedCount: answeredStaged.length,
    youngAnswers: youngAnswers, youngAnswersCount: youngAnswers.length,
    lapsed: lapsed, lapsedCount: lapsed.length,
    pendingAtEnd: pendingAtEnd, pendingAtEndCount: pendingAtEnd.length,
    accounted: answeredStaged.length + lapsed.length + pendingAtEnd.length,
    policySuccgraceAnswers: policyStats ? (policyStats.succgraceAnswers | 0) : null,
    policySuccgraceBeatsSeen: policyStats ? (policyStats.succgraceBeatsSeen | 0) : null,
    policyYoungBeatsSeen: policyStats ? (policyStats.youngBeatsSeen | 0) : null,
  };
}

function starvationDeaths(rec) {
  return (rec.deaths || []).filter(function (d) {
    return /starv|hunger/i.test(String((d.cause || '') + ' ' + (d.kind || '')));
  }).length;
}

function summarizeSeed(rec) {
  const diss = dissolutionEvents(rec);
  const recl = reclimbEvents(rec);
  const sg = succgraceAccounting(rec);
  const natDays = (rec.series || []).filter(function (sn) { return sn.scale === 'national' || sn.scale === 'global'; });
  const firstNat = natDays.length ? natDays[0].d : null;
  // Holdrealm alongside classification of the FIRST dissolution (if any).
  let hold = null, deep = null, reclInfo = null;
  if (diss.length) {
    try { hold = classifyOne(String(rec.seed), rec); } catch (e) { hold = { error: String(e.message).slice(0, 120) }; }
    try { if (hold && hold.dissolved) deep = deepDive(String(rec.seed), rec, hold); } catch (e) { deep = { error: String(e.message).slice(0, 120) }; }
    try { if (hold && hold.dissolved) reclInfo = reclimb(String(rec.seed), rec); } catch (e) { reclInfo = { error: String(e.message).slice(0, 120) }; }
  }
  return {
    seed: rec.seed, policy: rec.policy, run: rec.run || null,
    env: rec.env || null,
    days: rec.days, endReason: rec.endReason, won: !!rec.won,
    scaleRank: rec.scaleRank, maxWave: rec.maxWave,
    standing: rec.standing, standingRaw: rec.standingRaw,
    nationalEver: firstNat !== null, firstNationalDay: firstNat,
    nationalHeldDays: natDays.length,
    dissolutions: diss, dissolutionCount: diss.length,
    reclimbs: recl, reclimbCount: recl.length,
    hold: hold ? { mechanism: hold.mechanism || null, mechanismDetail: hold.mechanismDetail || null,
      dissolutionDay: hold.dissolutionDay || null, heldDays: hold.heldDays || null } : null,
    deepTrigger: deep ? (deep.trigger || null) : null,
    reclimbBlocker: reclInfo ? (reclInfo.blocker || null) : null,
    succgrace: sg,
    starvationDeaths: starvationDeaths(rec),
    totalDeaths: (rec.deaths || []).length,
    villagerCombatDeaths: rec.villagerCombatDeaths | 0,
    waveKills: rec.waveKills || {},
    errors: (rec.instrumentErrors || []).length,
    dissolutionLines: (rec.dissolutionLines || []).length,
    linkLines: (rec.linkLines || []).length,
  };
}

function legVerdict(legKey, seeds, baseline) {
  // seeds: per-seed summaries for this leg; baseline: corpus-armed
  // per-seed summaries (same seeds). Returns the prereg G2 + cost-bar
  // verdict for the leg.
  const known = seeds.filter(function (s) { return KNOWN_DISSOLUTION_SEEDS.indexOf(s.seed) !== -1; });
  const dissCount = known.reduce(function (t, s) { return t + s.dissolutionCount; }, 0);
  const reclimbed = RECLIMB_SEEDS.filter(function (sd) {
    const s = seeds.find(function (x) { return x.seed === sd; });
    return s && s.reclimbCount > 0;
  });
  const starv = seeds.reduce(function (t, s) { return t + s.starvationDeaths; }, 0);
  const medSurv = med(seeds.map(function (s) { return s.days; }));
  const g2Diss = dissCount <= 4;
  const g2Reclimb = reclimbed.length >= 1;
  const costStarv = starv <= CORPUS_ARMED_STARVATION + 2;
  const costSurv = medSurv !== null && medSurv >= 0.8 * CORPUS_ARMED_MEDIAN;
  const guardrail = seeds.every(function (s) {
    const b = baseline.find(function (x) { return x.seed === s.seed; });
    if (!b) return true;
    return s.totalDeaths <= Math.ceil(b.totalDeaths * 1.5);
  });
  return {
    leg: legKey, n: seeds.length,
    dissolutionsOnKnown7: dissCount, g2DissolutionsLe4of7: g2Diss,
    reclimbedOf100203_100212: reclimbed, g2ReclimbAtLeastOne: g2Reclimb,
    starvationPooled: starv, costStarvationLe8: costStarv,
    medianSurvival: medSurv, costMedianGe97_2: costSurv,
    guardrailDeathsWithin50pct: guardrail,
    go: g2Diss && g2Reclimb && costStarv && costSurv && guardrail,
  };
}

function pilotVerdict(legKey, seeds, baseline) {
  const pilot = seeds.filter(function (s) { return s.seed >= 100201 && s.seed <= 100208; });
  const known = pilot.filter(function (s) { return PILOT_DISSOLUTION_SEEDS.indexOf(s.seed) !== -1; });
  const dissCount = known.reduce(function (t, s) { return t + s.dissolutionCount; }, 0);
  const starv = pilot.reduce(function (t, s) { return t + s.starvationDeaths; }, 0);
  const medSurv = med(pilot.map(function (s) { return s.days; }));
  // Pilot cost bar: same shape as the full bar, on the pilot band only,
  // judged against the corpus armed leg's OWN pilot-band numbers
  // (computed from the baseline list, never hardcoded).
  const basePilot = (baseline || []).filter(function (s) { return s.seed >= 100201 && s.seed <= 100208; });
  const baseStarv = basePilot.reduce(function (t, s) { return t + s.starvationDeaths; }, 0);
  const baseMed = med(basePilot.map(function (s) { return s.days; }));
  const costStarv = starv <= baseStarv + 2;
  const costSurv = medSurv !== null && baseMed !== null && medSurv >= 0.8 * baseMed;
  return {
    leg: legKey, n: pilot.length,
    dissolutionsOnPilot4: dissCount, pilotDissolutionsLe2of4: dissCount <= 2,
    starvationPooled: starv, baselineStarvationPooled: baseStarv, costStarvationOk: costStarv,
    medianSurvival: medSurv, baselineMedianSurvival: baseMed, costMedianOk: costSurv,
    proceedToConfirm: dissCount <= 2 && costStarv && costSurv,
  };
}

function wallNumbers(summaries) {
  const surv = summaries.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  return {
    n: summaries.length,
    nationalEver: summaries.filter(function (s) { return s.nationalEver; }).length,
    nationalAtEnd: summaries.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: summaries.filter(function (s) { return s.won; }).length,
    wins: summaries.filter(function (s) { return s.won; }).length,
    wave4: summaries.filter(function (s) { return s.maxWave >= 4; }).length,
    wave5: summaries.filter(function (s) { return s.maxWave >= 5; }).length,
    medianSurvival: med(summaries.map(function (s) { return s.days; })),
    maxSurvival: surv.length ? surv[surv.length - 1] : null,
    dissolutions: summaries.reduce(function (t, s) { return t + s.dissolutionCount; }, 0),
    reclimbs: summaries.reduce(function (t, s) { return t + s.reclimbCount; }, 0),
    starvationDeaths: summaries.reduce(function (t, s) { return t + s.starvationDeaths; }, 0),
    totalDeaths: summaries.reduce(function (t, s) { return t + s.totalDeaths; }, 0),
  };
}

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.slice(-5) === '.json'; }).sort();
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function analyze(records, baselineRecords) {
  const perSeed = {};
  const byLeg = {};
  for (const rec of records) {
    const s = summarizeSeed(rec);
    perSeed[(rec.run || 'n/a') + '-' + rec.seed + '-' + rec.policy] = s;
    const leg = rec.run || 'n/a';
    if (!byLeg[leg]) byLeg[leg] = [];
    byLeg[leg].push(s);
  }
  const baselineSeeds = {};
  for (const rec of (baselineRecords || [])) {
    if (rec.policy !== CORPUS_ARMED) continue;
    baselineSeeds[rec.seed] = summarizeSeed(rec);
  }
  const baselineList = Object.keys(baselineSeeds).map(function (k) { return baselineSeeds[k]; })
    .sort(function (a, b) { return a.seed - b.seed; });
  const legs = {};
  for (const leg of Object.keys(byLeg)) {
    const seeds = byLeg[leg].slice().sort(function (a, b) { return a.seed - b.seed; });
    // G1: 0 instrument errors; every staged beat accounted; 0 young answers.
    const g1Errors = seeds.reduce(function (t, s) { return t + s.errors; }, 0);
    const g1Unaccounted = seeds.reduce(function (t, s) {
      return t + (s.succgrace.stagedCount - s.succgrace.accounted);
    }, 0);
    const g1Young = seeds.reduce(function (t, s) { return t + s.succgrace.youngAnswersCount; }, 0);
    legs[leg] = {
      wall: wallNumbers(seeds),
      g1: { errors: g1Errors, unaccountedBeats: g1Unaccounted, youngAnswers: g1Young,
        go: g1Errors === 0 && g1Unaccounted === 0 && g1Young === 0 },
      pilot: pilotVerdict(leg, seeds, baselineList),
      verdict: legVerdict(leg, seeds, baselineList),
      seeds: seeds,
    };
  }
  return {
    perSeed: perSeed,
    legs: legs,
    baseline: { wall: wallNumbers(baselineList), seeds: baselineList },
  };
}

if (require.main === module) (async function () {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-14', 'perseed-succpolity-b');
  const corpusDir = process.argv[3] || path.join(REPO, 'evidence', '2026-11-14', 'perseed-answercourt-confirm-b');
  const records = loadDir(dir);
  const baseline = loadDir(corpusDir);
  const out = analyze(records, baseline);
  const outPath = path.join(REPO, 'evidence', '2026-11-14', 'succpolity-b-analysis.json');
  // Summary FIRST (always visible even if the write falls back to stdout).
  console.log('== BASELINE (corpus armed leg): ' + JSON.stringify(out.baseline.wall));
  for (const leg of Object.keys(out.legs).sort()) {
    const L = out.legs[leg];
    console.log('\n== LEG ' + leg + ': wall ' + JSON.stringify(L.wall));
    console.log('   G1: errors=' + L.g1.errors + ' unaccountedBeats=' + L.g1.unaccountedBeats + ' youngAnswers=' + L.g1.youngAnswers + ' GO=' + L.g1.go);
    console.log('   PILOT: ' + JSON.stringify(L.pilot));
    console.log('   VERDICT: ' + JSON.stringify(L.verdict));
    for (const s of L.seeds) {
      console.log('   seed ' + s.seed + ' ' + s.policy + ' days=' + s.days + ' end=' + s.endReason +
        ' scale=' + s.scaleRank + ' natEver=' + s.nationalEver + ' natHeld=' + s.nationalHeldDays +
        ' diss=' + s.dissolutionCount + (s.dissolutions.map(function (x) { return 'd' + x.day; }).join(',') || '') +
        ' reclimb=' + s.reclimbCount + ' sg staged/ans/lapsed/pend=' +
        s.succgrace.stagedCount + '/' + s.succgrace.answeredCount + '/' + s.succgrace.lapsedCount + '/' + s.succgrace.pendingAtEndCount +
        ' youngAns=' + s.succgrace.youngAnswersCount +
        ' starv=' + s.starvationDeaths + ' deaths=' + s.totalDeaths +
        ' mech=' + (s.hold ? s.hold.mechanism : '-') + ' trigger=' + (s.deepTrigger || '-') +
        ' blocker=' + (s.reclimbBlocker || '-') + ' errors=' + s.errors);
    }
  }
  // Write (flap-tolerant): retry the write, then fall back to printing
  // the JSON so the numbers are never lost to a flap window.
  const payload = JSON.stringify(out, null, 2) + '\n';
  let wrote = false;
  for (let i = 0; i < 480 && !wrote; i++) {
    try {
      fs.writeFileSync(outPath, payload);
      const back = fs.readFileSync(outPath, 'utf8');
      if (back.length === payload.length) wrote = true;
    } catch (e) {
      if (i === 479) { console.log('@@ANALYSIS-FALLBACK ' + outPath + '\n' + payload); break; }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
    }
  }
  if (wrote) console.log('wrote ' + path.relative(REPO, outPath));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { dissolutionEvents: dissolutionEvents, reclimbEvents: reclimbEvents,
  succgraceAccounting: succgraceAccounting, summarizeSeed: summarizeSeed, analyze: analyze };
