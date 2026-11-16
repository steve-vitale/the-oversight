// analyze-gatereach-b.js — gate-reachability instrument for
// sim-gatereach-b. Reads the gatereach-driver corpora (per-seed JSONs
// with w5encounters / w5gates / w5seeds / w5departs / grLaunches /
// wpEnd) and reports, on a baseline-only band, how wave-5 field
// fights actually start and where launched parties go. No lever is
// judged here — the bars are INSTRUMENT VALIDITY (prereg):
//   1. classified share of wave-5 field fights >= 0.90.
//   2. instrument errors = 0.
//   3. corpus complete on all 8 seeds.
//   4. launches + wait episodes classified (unclassified <= 10%
//      each).
// GO iff ALL hold. NO-GO otherwise — the revision goes under
// "metric review" for the NEXT run, never a mid-run re-score.
// Start-mode classes (frozen in the prereg, as corrected before any
// judged corpus — see the prereg's Correction note): expedition-party /
// expedition-solo / worldtick-party / worldtick-solo / patrol-party /
// patrol-solo / aid-party / aid-solo. `other` and `unclassified`
// origins count as unclassified for the coverage bar. Field-fight deaths are counted
// from encounter rows (vDie), NOT from the death log's killer field
// (producergate §9.1: the killer field misses field deaths recorded
// the other way round). Read-only; prints JSON to stdout as a script.
// Usage: node scripts/analyze-gatereach-b.js <dir>
'use strict';
const fs = require('fs');
const path = require('path');
const w5k = require('./analyze-wave5kill-b');

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function isStarvation(d) {
  return /starv|hunger/i.test(String((d && d.cause) || '') + ' ' + String((d && d.kind) || ''));
}

// classifyStartMode(row): same pure function as the driver's export
// (kept in both places; the proof test asserts they agree on every
// fixture row). Classified modes are the six named ones; 'other' and
// 'unclassified' are not classified.
const CLASSIFIED_MODES = ['expedition-party', 'expedition-solo', 'worldtick-party', 'worldtick-solo', 'patrol-party', 'patrol-solo', 'aid-party', 'aid-solo'];
function classifyStartMode(r) {
  if (!r || !r.origin || r.origin === 'unclassified') return 'unclassified';
  if (r.origin === 'expedition') {
    if (!r.fighterExped) return 'unclassified';
    return (r.allyExpedSharedN | 0) >= 1 ? 'expedition-party' : 'expedition-solo';
  }
  if (r.origin === 'world-tick') return (r.alliesN | 0) >= 1 ? 'worldtick-party' : 'worldtick-solo';
  if (r.origin === 'patrol') return (r.alliesN | 0) >= 1 ? 'patrol-party' : 'patrol-solo';
  if (r.origin === 'aid') return (r.alliesN | 0) >= 1 ? 'aid-party' : 'aid-solo';
  return 'other';
}
function isClassifiedMode(m) { return CLASSIFIED_MODES.indexOf(m) !== -1; }

// gateFailCondition(g): why a wave-4+ gate row did not SEEK, derived
// from the recorded row alone (gate order: target, party, trick).
function gateFailCondition(g) {
  if (!g) return 'no-gate-row';
  if (g.result === 'seek') return 'seek';
  if (g.result === 'avoid') return 'avoid:' + (g.reason || '-');
  if (g.result !== 'null') return 'other:' + (g.result || '?');
  const wave = g.wave | 0;
  const isTarget = (g.needWave != null && wave === g.needWave) ||
    (g.planTarget && g.mid === g.planTarget) ||
    (g.planStage === 'standing' && wave >= 3);
  if (!isTarget) return 'null:not-target';
  const partyOk = (g.partySize | 0) >= 2 && g.allArmed &&
    (wave >= 4 ? ((g.partySize | 0) >= 3 && g.allArmored) : true);
  if (!partyOk) {
    if ((g.partySize | 0) < 3 && wave >= 4) return 'null:party-short';
    if (!g.allArmed) return 'null:party-unarmed';
    if (!g.allArmored) return 'null:party-unarmored';
    return 'null:party-short';
  }
  if (wave >= 4 && !g.trickKnown) return 'null:trick-hold';
  return 'null:other';
}

// buildWaitEpisodes(departs, deaths, endDay): group party-wait rows
// into episodes per (seed, vid, target); close each episode with the
// first later depart row for that villager, or by death / horizon.
// Returns { episodes, byEnd, unclassified }.
function buildWaitEpisodes(departs, deaths, endDay) {
  const waits = departs.filter(function (p) {
    if (p.result !== 'hold') return false;
    if (p.winPlanAction) return p.winPlanAction === 'party_wait';
    return p.stage === 'party';
  }).sort(function (a, b) { return (a.day - b.day) || String(a.vid).localeCompare(String(b.vid)); });
  const closers = departs.filter(function (p) { return p.result === 'launch' || p.result === 'normal'; })
    .sort(function (a, b) { return (a.day - b.day) || String(a.vid).localeCompare(String(b.vid)); });
  const deadVids = {};
  for (const d of (deaths || [])) {
    if (!d.player && d.who) deadVids[d.seed + '|' + d.who] = true;
  }
  const episodes = [];
  let cur = null;
  function flush(end, endDayValue) {
    if (!cur) return;
    cur.end = end;
    cur.endDay = endDayValue;
    episodes.push(cur);
    cur = null;
  }
  for (const w of waits) {
    const key = w.seed + '|' + w.vid + '|' + (w.target || '-');
    if (cur && cur.key === key && (w.day - cur.lastDay) <= 3) {
      cur.waits.push(w);
      cur.lastDay = w.day;
      continue;
    }
    // Close the open episode before starting a new one: find its end.
    if (cur) {
      const end = closeEpisode(cur, closers, deadVids, endDay);
      flush(end.reason, end.day);
    }
    cur = { key: key, seed: w.seed, vid: w.vid, target: w.target || null,
      firstDay: w.day, lastDay: w.day, waits: [w],
      secondCompanionWaits: 0, poolEligible: [] };
    if (isSecondCompanionWait(w)) cur.secondCompanionWaits += 1;
    if (w.poolCensus) cur.poolEligible.push(w.poolCensus.eligible);
  }
  if (cur) {
    const end = closeEpisode(cur, closers, deadVids, endDay);
    flush(end.reason, end.day);
  }
  // Second-companion counts + pool medians were tallied per first wait
  // only above; recompute over all waits in each episode.
  for (const ep of episodes) {
    ep.secondCompanionWaits = 0;
    ep.poolEligible = [];
    for (const w of ep.waits) {
      if (isSecondCompanionWait(w)) ep.secondCompanionWaits += 1;
      if (w.poolCensus) ep.poolEligible.push(w.poolCensus.eligible);
    }
    ep.medianPoolEligible = med(ep.poolEligible);
    ep.nWaits = ep.waits.length;
    delete ep.waits;
  }
  const byEnd = {};
  for (const ep of episodes) byEnd[ep.end] = (byEnd[ep.end] || 0) + 1;
  const unclassified = episodes.filter(function (e) { return e.end === 'unknown'; }).length;
  return { episodes: episodes, byEnd: byEnd, unclassified: unclassified };
}

function isSecondCompanionWait(w) {
  if (!w.needsFull) return false;
  if (w.poolCensus && w.poolCensus.eligible === 1) return true;
  if (w.companionsAvailable === 1) return true;
  return false;
}

function closeEpisode(ep, closers, deadVids, endDay) {
  for (const c of closers) {
    if (c.seed !== ep.seed || c.vid !== ep.vid) continue;
    if (c.day < ep.lastDay) continue;
    if (c.day - ep.lastDay > 30) break;
    if (c.result === 'launch') return { reason: 'launch', day: c.day };
    if (c.result === 'normal') {
      if (c.stage && c.stage !== 'party') return { reason: 'plan-changed', day: c.day };
      if (c.target !== undefined && ep.target !== null && c.target !== ep.target) return { reason: 'plan-changed', day: c.day };
      return { reason: 'hold-expired', day: c.day };
    }
  }
  if (deadVids[ep.seed + '|' + ep.vid]) return { reason: 'fighter-died', day: endDay };
  return { reason: 'horizon', day: endDay };
}

// analyzeLeg(dir, w5set) — one corpus dir. Returns the full summary.
function analyzeLeg(dir, w5set) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const perSeed = [];
  const encounters = [];
  const gates = [];
  const seeds = [];
  const departs = [];
  const launches = [];
  const deathsAll = [];
  const wpEnds = [];
  const brainEnds = [];
  let parseErrors = 0;
  let endDay = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { parseErrors += 1; continue; }
    const rec0 = w5k.classifySeed(d, w5set);
    perSeed.push(rec0);
    rec0.fieldKills = (d.w5encounters || []).filter(function (e) { return e.wave === 5 && e.outcome === 'vKill'; }).length;
    rec0.tbKills = (rec0.kills || 0) - rec0.fieldKills;
    if (rec0.tbKills < 0) rec0.errors.push('negative-tb-kills');
    // FIELD DEATHS FROM ENCOUNTER ROWS (prereg): vDie outcomes on
    // wave-5 (and wave-4) field fights — the honest count the death
    // log's killer field misses (producergate §9.1).
    rec0.fieldDeathsW5 = (d.w5encounters || []).filter(function (e) { return e.wave === 5 && e.outcome === 'vDie'; }).length;
    rec0.fieldDeathsW4 = (d.w5encounters || []).filter(function (e) { return e.wave === 4 && e.outcome === 'vDie'; }).length;
    for (const e of (d.w5encounters || [])) encounters.push(Object.assign({ seed: d.seed }, e));
    for (const g of (d.w5gates || [])) gates.push(Object.assign({ seed: d.seed }, g));
    for (const s of (d.w5seeds || [])) seeds.push(Object.assign({ seed: d.seed }, s));
    for (const p of (d.w5departs || [])) departs.push(Object.assign({ seed: d.seed }, p));
    for (const l of (d.grLaunches || [])) launches.push(Object.assign({ seed: d.seed }, l));
    for (const dd of (d.deaths || [])) deathsAll.push(Object.assign({ seed: d.seed }, dd));
    if (d.wpEnd) wpEnds.push(Object.assign({ seed: d.seed }, d.wpEnd));
    if (d.brainEnd) brainEnds.push(Object.assign({ seed: d.seed }, d.brainEnd));
    rec0.scaleRank = d.scaleRank || null;
    rec0.won = !!d.won;
    rec0.tableTaken = (d.seatTakes || []).some(function (t) { return t && t.ok; });
    rec0.starvation = (d.deaths || []).filter(isStarvation).length;
    rec0.wpEnd = d.wpEnd || null;
    if ((d.gameDays || 0) > endDay) endDay = d.gameDays || 0;
    // Instrument errors carried on the per-seed record.
    if ((d.instrumentErrors || []).length) {
      for (const e of d.instrumentErrors) rec0.errors.push('driver:' + String(e).slice(0, 80));
    }
  }
  const unlocked = perSeed.filter(function (s) { return s.unlocked; });
  const classes = { LOCKED: 0, 'NEVER-FACED': 0, 'FACED-NOT-KILLED': 0, KILLED: 0 };
  perSeed.forEach(function (s) { classes[s.cls] += 1; });

  // --- wave-5 field fights: start-mode classification ---
  const w5enc = encounters.filter(function (e) { return e.wave === 5; });
  const w4enc = encounters.filter(function (e) { return e.wave === 4; });
  function encSummary(list) {
    const byOutcome = {};
    const byStartMode = {};
    const byPartyAtStart = {};
    let kills = 0, deaths = 0, seeks = 0, joined = 0;
    for (const e of list) {
      byOutcome[e.outcome || '?'] = (byOutcome[e.outcome || '?'] || 0) + 1;
      const sm = e.startMode || classifyStartMode(e);
      byStartMode[sm] = (byStartMode[sm] || 0) + 1;
      const ps = (e.partyAtStart != null ? e.partyAtStart : (e.allyVids || []).length + 1);
      byPartyAtStart[ps] = (byPartyAtStart[ps] || 0) + 1;
      if (e.outcome === 'vKill') kills += 1;
      if (e.outcome === 'vDie') deaths += 1;
      if (e.gate && e.gate.result === 'seek') seeks += 1;
      if (e.calledHelp) joined += 1;
    }
    return { n: list.length, byOutcome: byOutcome, byStartMode: byStartMode,
      byPartyAtStart: byPartyAtStart, kills: kills, deaths: deaths,
      seeks: seeks, allyJoinedMidFight: joined };
  }
  const w5sum = encSummary(w5enc);
  const w4sum = encSummary(w4enc);
  const w5classified = w5enc.filter(function (e) { return isClassifiedMode(e.startMode || classifyStartMode(e)); }).length;
  const w5classifiedShare = w5enc.length ? +(w5classified / w5enc.length).toFixed(3) : null;
  // Outcomes by start mode (wave 5): does how the fight starts change
  // how it ends?
  const w5byMode = {};
  for (const e of w5enc) {
    const sm = e.startMode || classifyStartMode(e);
    const b = w5byMode[sm] || (w5byMode[sm] = { n: 0, vKill: 0, vFlee: 0, mFlee: 0, vDie: 0, evade: 0, other: 0 });
    b.n += 1;
    if (e.outcome === 'vKill') b.vKill += 1;
    else if (e.outcome === 'vFlee') b.vFlee += 1;
    else if (e.outcome === 'mFlee') b.mFlee += 1;
    else if (e.outcome === 'vDie') b.vDie += 1;
    else if (e.outcome === 'evade') b.evade += 1;
    else b.other += 1;
  }

  // --- gate decomposition (wave 5): result + failing condition ---
  const w5gates = gates.filter(function (g) { return g.wave === 5; });
  const gateByResult = {};
  const gateByFail = {};
  for (const g of w5gates) {
    gateByResult[g.result || '?'] = (gateByResult[g.result || '?'] || 0) + 1;
    const fc = gateFailCondition(g);
    gateByFail[fc] = (gateByFail[fc] || 0) + 1;
  }
  const gatePartySizes = {};
  for (const g of w5gates) gatePartySizes[g.partySize] = (gatePartySizes[g.partySize] || 0) + 1;
  const trickKnownAtGate = { known: 0, unknown: 0 };
  for (const g of w5gates) { if (g.trickKnown) trickKnownAtGate.known += 1; else trickKnownAtGate.unknown += 1; }
  const gatePlanStages = {};
  for (const g of w5gates) gatePlanStages[g.planStage || 'no-plan'] = (gatePlanStages[g.planStage || 'no-plan'] || 0) + 1;

  // --- launches: holder rows are launches; join to gate + fights ---
  const holderLaunches = launches.filter(function (l) { return l.role === 'holder'; });
  const launchedHolders = holderLaunches.filter(function (l) { return l.launched; });
  const failedDeparts = holderLaunches.filter(function (l) { return !l.launched; });
  const launchBySource = {};
  const launchBySize = {};
  const launchBySizeFull = {};
  for (const l of launchedHolders) {
    launchBySource[l.source || '?'] = (launchBySource[l.source || '?'] || 0) + 1;
    const size = 1 + ((l.partyAfter || []).length);
    launchBySize[size] = (launchBySize[size] || 0) + 1;
    if (l.needWave != null && (l.needWave | 0) >= 4) launchBySizeFull[size] = (launchBySizeFull[size] || 0) + 1;
  }
  // Gate arrival + fight joined, per launched holder.
  let gateArrived = 0, gateNotArrived = 0, launchUnknown = 0;
  const daysToGate = [];
  let fightsJoined = 0;
  const arrivalBySource = {};
  for (const l of launchedHolders) {
    const src = l.source || '?';
    const a = arrivalBySource[src] || (arrivalBySource[src] = { launched: 0, arrived: 0, fightsJoined: 0 });
    a.launched += 1;
    if (l.duration == null) { launchUnknown += 1; continue; }
    const lo = l.day, hi = l.day + (l.duration | 0);
    let firstGate = null;
    for (const g of gates) {
      if (g.seed !== l.seed || g.vid !== l.vid) continue;
      if (g.day < lo || g.day > hi) continue;
      if (firstGate === null || g.day < firstGate) firstGate = g.day;
    }
    if (firstGate !== null) {
      gateArrived += 1;
      a.arrived += 1;
      daysToGate.push(firstGate - lo);
    } else gateNotArrived += 1;
    let joined = false;
    for (const e of encounters) {
      if (e.seed !== l.seed || e.vid !== l.vid) continue;
      if (e.origin !== 'expedition') continue;
      if (e.day < lo || e.day > hi) continue;
      if ((e.allyExpedSharedN | 0) >= 1) { joined = true; break; }
    }
    if (joined) { fightsJoined += 1; a.fightsJoined += 1; }
  }

  // --- waits + episodes ---
  const waitRows = departs.filter(function (p) {
    if (p.result !== 'hold') return false;
    if (p.winPlanAction) return p.winPlanAction === 'party_wait';
    return p.stage === 'party';
  });
  const ep = buildWaitEpisodes(departs, deathsAll, endDay);
  const secondWaits = waitRows.filter(isSecondCompanionWait).length;
  const poolEligibleAtWaits = waitRows.filter(function (w) { return w.poolCensus; }).map(function (w) { return w.poolCensus.eligible; });
  const poolByReason = { dead: 0, away: 0, trust: 0, notAtHaven: 0, engaged: 0, profile: 0, exped: 0 };
  for (const w of waitRows) {
    if (!w.poolCensus) continue;
    for (const k of Object.keys(poolByReason)) poolByReason[k] += (w.poolCensus.byReason[k] | 0);
  }

  // --- plan seeds (wave 5) + win-plan sums ---
  const w5seedRows = seeds.filter(function (s) { return s.wave === 5; });
  const seedByOutcome = {};
  for (const s of w5seedRows) seedByOutcome[s.outcome || '?'] = (seedByOutcome[s.outcome || '?'] || 0) + 1;
  const wpSum = { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, w5Targets: 0 };
  const wpByStage = {};
  for (const w of wpEnds) {
    for (const k of Object.keys(wpSum)) wpSum[k] += (w[k] | 0);
    const bs = w.byStage || {};
    for (const st of Object.keys(bs)) wpByStage[st] = (wpByStage[st] || 0) + bs[st];
  }
  const brainSum = { totalCommits: 0, winPlanCommits: 0, byAction: {}, byOverride: {} };
  for (const b of brainEnds) {
    brainSum.totalCommits += (b.totalCommits | 0);
    brainSum.winPlanCommits += (b.winPlanCommits | 0);
    for (const k of Object.keys(b.byAction || {})) brainSum.byAction[k] = (brainSum.byAction[k] || 0) + b.byAction[k];
    for (const k of Object.keys(b.byOverride || {})) brainSum.byOverride[k] = (brainSum.byOverride[k] || 0) + b.byOverride[k];
  }

  // --- wall numbers + costs ---
  const national = perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length;
  const table = perSeed.filter(function (s) { return s.tableTaken; }).length;
  const wins = perSeed.filter(function (s) { return s.won; }).length;
  const w4unlock = perSeed.filter(function (s) { return (s.maxWave || 0) >= 4; }).length;
  const starvation = perSeed.reduce(function (a, s) { return a + (s.starvation | 0); }, 0);
  const totFieldKills = unlocked.reduce(function (a, s) { return a + (s.fieldKills || 0); }, 0);
  const totTbKills = unlocked.reduce(function (a, s) { return a + (s.tbKills || 0); }, 0);
  const totKills = totFieldKills + totTbKills;
  const fieldDeathsW5 = perSeed.reduce(function (a, s) { return a + (s.fieldDeathsW5 || 0); }, 0);
  const fieldDeathsW4 = perSeed.reduce(function (a, s) { return a + (s.fieldDeathsW4 || 0); }, 0);
  const deathLogW5 = unlocked.reduce(function (a, s) { return a + (s.deathsW5 || 0); }, 0);
  const instrumentErrors = perSeed.reduce(function (a, s) { return a + s.errors.length; }, 0) + parseErrors;
  const unclassifiedFights = w5enc.length - w5classified;
  const launchUnclassifiedShare = launchedHolders.length ? +(launchUnknown / launchedHolders.length).toFixed(3) : null;
  const episodeUnclassifiedShare = ep.episodes.length ? +(ep.unclassified / ep.episodes.length).toFixed(3) : null;

  const pooled = {
    seeds: perSeed.length, files: files.length, parseErrors: parseErrors,
    unlocked: unlocked.length, classes: classes,
    fieldKills: totFieldKills, tbKills: totTbKills, totalKills: totKills,
    fieldKillsPerUnlocked: unlocked.length ? +(totFieldKills / unlocked.length).toFixed(2) : null,
    // Field deaths from encounter rows (the honest count) vs the death
    // log's killer-field count (the biased one) — the contrast the
    // next lever's kill:death bar needs.
    fieldDeathsW5: fieldDeathsW5, fieldDeathsW4: fieldDeathsW4,
    deathLogW5: deathLogW5,
    killDeathField: fieldDeathsW5 ? +(totFieldKills / fieldDeathsW5).toFixed(2) : null,
    medianSurvivalUnlocked: med(unlocked.map(function (s) { return s.days; })),
    medianSurvivalAll: med(perSeed.map(function (s) { return s.days; })),
    instrumentErrors: instrumentErrors,
    w5fights: w5enc.length, w5classified: w5classified,
    classifiedShare: w5classifiedShare, unclassifiedFights: unclassifiedFights,
    launches: { holderRows: holderLaunches.length, launched: launchedHolders.length,
      failedDeparts: failedDeparts.length, bySource: launchBySource, bySize: launchBySize,
      bySizeFull: launchBySizeFull, gateArrived: gateArrived, gateNotArrived: gateNotArrived,
      launchUnknown: launchUnknown, launchUnclassifiedShare: launchUnclassifiedShare,
      daysToGate: daysToGate, medianDaysToGate: med(daysToGate),
      fightsJoined: fightsJoined, arrivalBySource: arrivalBySource },
    waits: { rows: waitRows.length, secondCompanionWaits: secondWaits,
      episodes: ep.episodes.length, byEnd: ep.byEnd,
      episodeUnclassified: ep.unclassified, episodeUnclassifiedShare: episodeUnclassifiedShare,
      medianPoolEligible: med(poolEligibleAtWaits), poolByReason: poolByReason },
    starvation: starvation,
    wall: { national: national, table: table, wins: wins, wave4: w4unlock, wave5: unlocked.length },
  };
  return {
    perSeed: perSeed, pooled: pooled,
    encounters: { w5: w5sum, w4: w4sum, w5byMode: w5byMode },
    gates: { w5n: w5gates.length, byResult: gateByResult, byFail: gateByFail,
      partySizes: gatePartySizes, trickKnown: trickKnownAtGate, planStages: gatePlanStages },
    seeds: { w5n: w5seedRows.length, byOutcome: seedByOutcome },
    launchesDetail: { holderLaunches: holderLaunches, episodes: ep.episodes },
    winplan: { sum: wpSum, byStage: wpByStage },
    brain: brainSum,
  };
}

// judge(summary) — the frozen prereg bars (instrument validity).
//   1. classified share of wave-5 field fights >= 0.90.
//   2. instrument errors = 0.
//   3. corpus complete on all 8 seeds (8/8 files, 0 parse errors).
//   4. launch + wait-episode classification: unclassified <= 10%
//      of launches and <= 10% of episodes respectively.
function judge(summary) {
  const p = summary.pooled;
  const classifiedBar = p.classifiedShare != null ? p.classifiedShare >= 0.90 : null;
  const errorsBar = p.instrumentErrors === 0;
  const corpusBar = p.seeds === 8 && p.files === 8 && p.parseErrors === 0;
  const launchBar = p.launches.launchUnclassifiedShare != null
    ? p.launches.launchUnclassifiedShare <= 0.10
    : (p.launches.launched === 0 ? null : null);
  const episodeBar = p.waits.episodeUnclassifiedShare != null
    ? p.waits.episodeUnclassifiedShare <= 0.10
    : (p.waits.episodes === 0 ? null : null);
  const go = classifiedBar === true && errorsBar && corpusBar &&
    launchBar !== false && episodeBar !== false;
  return {
    classifiedShare: { value: p.classifiedShare, classified: p.w5classified, total: p.w5fights, bar: '>= 0.90', pass: classifiedBar },
    instrumentErrors: { value: p.instrumentErrors, bar: '= 0', pass: errorsBar },
    corpusComplete: { seeds: p.seeds, files: p.files, parseErrors: p.parseErrors, bar: '8/8 files, 0 parse errors', pass: corpusBar },
    launchClassification: { unclassified: p.launches.launchUnknown, launched: p.launches.launched, share: p.launches.launchUnclassifiedShare, bar: '<= 0.10', pass: launchBar },
    episodeClassification: { unclassified: p.waits.episodeUnclassified, episodes: p.waits.episodes, share: p.waits.episodeUnclassifiedShare, bar: '<= 0.10', pass: episodeBar },
    verdict: go ? 'GO' : 'NO-GO',
  };
}

const isMain = require.main === module;
if (isMain) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('usage: node scripts/analyze-gatereach-b.js <dir>');
    process.exit(2);
  }
  const monstersPath = path.join(__dirname, '..', 'src', 'data', 'monsters.json');
  const w5set = new Set(w5k.loadWave5Ids(monstersPath));
  const out = analyzeLeg(dir, w5set);
  out.judgment = judge(out);
  console.log(JSON.stringify(out, null, 2));
}

module.exports = { analyzeLeg: analyzeLeg, judge: judge, med: med,
  isStarvation: isStarvation, classifyStartMode: classifyStartMode,
  gateFailCondition: gateFailCondition, buildWaitEpisodes: buildWaitEpisodes,
  isSecondCompanionWait: isSecondCompanionWait };
