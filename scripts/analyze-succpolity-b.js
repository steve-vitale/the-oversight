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
//     pending-at-end, from the policy succgrace-answer events +
//     pr-series transitions + verbEvents, with prSg as a secondary
//     read for lapsed beats only; young-link answers are a G1
//     violation) — corrected join, sim-succpolity-g1join-b: the old
//     prSg-only join was a false positive on same-day answers;
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

// Succgrace-beat accounting for one record — CORRECTED JOIN
// (sim-succpolity-g1join-b, 2026-11-15). The old prSg-only join was a
// false positive: a beat staged and answered the same day never appears
// as prSg=1 in any snapshot. The policy answers at the start of daily
// (runDays calls policy.daily at the END of the day's play, before
// sleep) and the driver snapshots AFTER each daily, and
// answerRenegotiation clears pendingRenegotiation first — so the
// snapshot after the answering daily shows nothing. Both patterns occur
// in the corpus (100203 staged d89 / answered d90; 100208 staged d100
// / answered d100). Young-link beats DO survive to snapshots (the
// policy leaves them alone): pr=1, prSg=0 for their 7-day window.
// staged: UNION of (a) pr 0->1 transitions per link in the series —
//   any beat that survived to a snapshot; and (b) one entry per
//   succgrace-answer policy event in capSummary.succpolity.events —
//   a beat answered before any snapshot could record it (staged that
//   day or the day before; the policy event is the authoritative
//   observation). A policy-derived entry is dropped when a pr-derived
//   succgrace entry for the same link staged within the 7 days before
//   the answer (the retry case: answer delayed past a snapshot).
// answered: answerRenegotiation verb events. GENUINE iff a matching
//   succgrace-answer policy event exists (same linkId, same day) OR
//   prSg=1 on the answer day or the day before (legacy fallback for
//   records without policy events). Otherwise YOUNG (G1 violation).
//   A young-answered beat's staged entry still lands in `lapsed` (its
//   pr cleared) while the violation is counted in `youngAnswers`.
// lapsed: staged beats with no genuine answer whose pr returned to 0
//   (the 7-day expiry, or the link breaking with the beat pending).
// pendingAtEnd: pr=1 on the last snapshot (beat still open when the
//   run ended). Policy-derived entries are answered by construction
//   (the event is only logged after a successful answerRenegotiation
//   call); if the driver's verb wrap missed the call, the beat is
//   still counted answered and the cross-check flags the discrepancy.
// crossCheck: policy stats vs analyzer counts (informational —
//   beatsSeen counts daily SIGHTINGS, staged counts DISTINCT beats;
//   they agree when every beat is answered at first sighting).
function succgraceAccounting(rec) {
  const series = rec.series || [];
  const prByLinkDay = {}; // linkId -> { day: pr }
  const prSgByLinkDay = {}; // linkId -> { day: prSg }
  const prStaged = []; // { linkId, other, day, via: 'pr', succgrace }
  const prevPr = {};
  for (const sn of series) {
    for (const l of (sn.linksRoll || [])) {
      if (!l || !l.id) continue;
      const pr = l.pr ? 1 : 0;
      const sg = l.prSg ? 1 : 0;
      if (!prByLinkDay[l.id]) prByLinkDay[l.id] = {};
      if (!prSgByLinkDay[l.id]) prSgByLinkDay[l.id] = {};
      prByLinkDay[l.id][sn.d] = pr;
      prSgByLinkDay[l.id][sn.d] = sg;
      if (pr === 1 && prevPr[l.id] !== 1) {
        prStaged.push({ linkId: l.id, other: l.o || null, day: sn.d, via: 'pr', succgrace: sg === 1 });
      }
      prevPr[l.id] = pr;
    }
  }
  const policyStats = (rec.capSummary && rec.capSummary.succpolity) || null;
  const policyEvents = (policyStats && Array.isArray(policyStats.events)) ? policyStats.events : [];
  const sgAnswerEvents = policyEvents.filter(function (e) { return e && e.kind === 'succgrace-answer' && e.linkId; });
  // The verb event carries the other-village name the policy event lacks.
  function verbOther(linkId, day) {
    for (const ev of (rec.verbEvents || [])) {
      if (ev.verb === 'answerRenegotiation' && ev.linkId === linkId && ev.day === day) return ev.other || null;
    }
    return null;
  }
  // Dedup: a policy-derived staged entry is the same beat as a
  // pr-derived succgrace entry staged within the 7 days before the
  // answer (answer delayed past a snapshot — the retry case). Keep
  // the pr-derived entry (its day is observed, not inferred).
  const consumedPr = {};
  const policyStaged = [];
  for (const ev of sgAnswerEvents) {
    let dup = -1;
    for (let i = 0; i < prStaged.length; i++) {
      const s = prStaged[i];
      if (s.linkId === ev.linkId && s.succgrace && s.day <= ev.day && s.day >= ev.day - 7 && !consumedPr[i]) { dup = i; break; }
    }
    if (dup !== -1) { consumedPr[dup] = true; continue; }
    policyStaged.push({ linkId: ev.linkId, other: verbOther(ev.linkId, ev.day), day: ev.day,
      via: 'policy', succgrace: true, stagedDayInferred: true });
  }
  const staged = prStaged.concat(policyStaged).sort(function (a, b) {
    return (a.day - b.day) || (a.linkId < b.linkId ? -1 : (a.linkId > b.linkId ? 1 : 0));
  });
  const answers = [];
  const youngAnswers = [];
  for (const ev of (rec.verbEvents || [])) {
    if (ev.verb !== 'answerRenegotiation' || !ev.linkId) continue;
    const byDay = prSgByLinkDay[ev.linkId] || {};
    const sgHere = (byDay[ev.day] === 1) || (byDay[ev.day - 1] === 1);
    const policyHere = sgAnswerEvents.some(function (pe) { return pe.linkId === ev.linkId && pe.day === ev.day; });
    const entry = { day: ev.day, linkId: ev.linkId, other: ev.other || null,
      caller: ev.caller, result: ev.result, dTrust: ev.dTrust,
      via: policyHere ? 'policy-event' : 'prSg' };
    if (policyHere || sgHere) answers.push(entry);
    else youngAnswers.push(entry);
  }
  // A staged beat is answered if some genuine answer names its link on
  // a day >= the staging day and <= staging day + 7 (the expiry
  // window). Policy-derived entries carry their own answer day (the
  // policy event IS the answer record); if the driver's verb wrap
  // missed the call, the beat still counts answered and the
  // cross-check below flags the discrepancy.
  const answeredStaged = [];
  const lapsed = [];
  const pendingAtEnd = [];
  const lastDay = series.length ? series[series.length - 1].d : 0;
  for (const s of staged) {
    let hit = null;
    if (s.via === 'policy') {
      hit = answers.find(function (a) { return a.linkId === s.linkId && a.day === s.day; });
      if (!hit) hit = { day: s.day, linkId: s.linkId, other: s.other || null, caller: 'policy',
        result: 'policy-event-only', dTrust: null, via: 'policy-event' };
    } else {
      hit = answers.find(function (a) { return a.linkId === s.linkId && a.day >= s.day && a.day <= s.day + 7; });
    }
    if (hit) { answeredStaged.push({ staged: s, answer: hit }); continue; }
    const days = prByLinkDay[s.linkId] || {};
    const lastPrDay = Math.max.apply(null, Object.keys(days).filter(function (d) { return days[d] === 1; }).map(Number).concat([-1]));
    if (lastPrDay === lastDay) pendingAtEnd.push(s);
    else lapsed.push(s);
  }
  const stagedSuccgraceCount = staged.filter(function (s) { return s.succgrace; }).length;
  const youngStagedCount = staged.length - stagedSuccgraceCount;
  const crossCheck = policyStats ? {
    policySuccgraceAnswers: policyStats.succgraceAnswers | 0,
    analyzerAnswered: answers.length,
    answersMatch: (policyStats.succgraceAnswers | 0) === answers.length,
    policySuccgraceBeatsSeen: policyStats.succgraceBeatsSeen | 0,
    analyzerStagedSuccgrace: stagedSuccgraceCount,
    beatsSeenMatch: (policyStats.succgraceBeatsSeen | 0) === stagedSuccgraceCount,
    policyYoungBeatsSeen: policyStats.youngBeatsSeen | 0,
    analyzerYoungStaged: youngStagedCount,
  } : null;
  return {
    staged: staged, stagedCount: staged.length,
    stagedSuccgraceCount: stagedSuccgraceCount, youngStagedCount: youngStagedCount,
    answered: answers, answeredCount: answers.length,
    answeredStagedCount: answeredStaged.length,
    youngAnswers: youngAnswers, youngAnswersCount: youngAnswers.length,
    lapsed: lapsed, lapsedCount: lapsed.length,
    pendingAtEnd: pendingAtEnd, pendingAtEndCount: pendingAtEnd.length,
    accounted: answeredStaged.length + lapsed.length + pendingAtEnd.length,
    policySuccgraceAnswers: policyStats ? (policyStats.succgraceAnswers | 0) : null,
    policySuccgraceBeatsSeen: policyStats ? (policyStats.succgraceBeatsSeen | 0) : null,
    policyYoungBeatsSeen: policyStats ? (policyStats.youngBeatsSeen | 0) : null,
    crossCheck: crossCheck,
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
    const xbad = L.seeds.filter(function (s) { const x = s.succgrace.crossCheck; return x && (!x.answersMatch || !x.beatsSeenMatch); });
    if (xbad.length) console.log('   XCHK MISMATCH: ' + xbad.map(function (s) { const x = s.succgrace.crossCheck; return 'seed ' + s.seed + ' policyAns=' + x.policySuccgraceAnswers + '/analyzerAns=' + x.analyzerAnswered + ' policySeen=' + x.policySuccgraceBeatsSeen + '/stagedSg=' + x.analyzerStagedSuccgrace; }).join('; '));
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
