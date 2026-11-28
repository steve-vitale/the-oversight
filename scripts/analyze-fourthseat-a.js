// analyze-fourthseat-a.js — DIAG analyzer, arm sim-fourthseat-a
// (THE 4TH PARTY SEAT: classify EVERY fought wave-4 fieldFight on
// the band — party-size distribution, per-seat arrival round +
// damage, and a named blocker for the missing 4th seat — plus the
// secondaries: does a 4th companion ever exist; recruitment-capped
// vs call-in-capped; the sense ledger in the wild.)
//
// Reads per-seed JSONs from the fourthseat driver (w4fights rich
// rows) and answers, from the fight record itself:
//   - coverage: every fought wave-4 meeting classified, 0 unclassified
//   - per-seat arrival rounds (door = 0, shout = rec.shoutRound,
//     cross-checked against the R-prefixed "charges in" log lines)
//   - per-seat damage (lead / ally1 / ally2 / ally3) reconciled
//     against mDealt three ways: row arithmetic, roundsDetail
//     sums, and log strike parsing by fighter name
//   - blocker per fight (frozen taxonomy, prereg §0 — first match)
//   - sense ledger: villagerFightAllies return-length distribution
//   - launch census: max party size ever launched / planned
//   - wall numbers (national / table / wins, wave unlocks, survival)
//
// Usage:
//   node scripts/analyze-fourthseat-a.js --dir DIR [--out FILE]
//   node scripts/analyze-fourthseat-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');
// The strike parser is REQUIRED from scripts/analyze-speardmg-a.js
// — one definition of the parser (strike / echo / extra / ambush /
// contact / volley), no second copy to drift. partydmg-a got
// residual 0 on 22 live fights with it.
const { parseStrikes } = require(path.join(__dirname, 'analyze-speardmg-a'));

function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function round1(x) { return Math.round(x * 10) / 10; }

// seatDealt(fight): per-seat damage from the row's own tallies.
// The engine feeds each ally's damage into the shared allyDealt
// total AND its own tally, so ally1 = allyDealt - ally2Dealt -
// ally3Dealt and the four seats sum to mDealt by construction.
function seatDealt(f) {
  const mDealt = f.mDealt | 0;
  const allyDealt = f.allyDealt | 0;
  const ally2Dealt = f.ally2Dealt | 0;
  const ally3Dealt = f.ally3Dealt | 0;
  return {
    lead: mDealt - allyDealt,
    ally1: allyDealt - ally2Dealt - ally3Dealt,
    ally2: ally2Dealt,
    ally3: ally3Dealt,
    sum: mDealt,
  };
}

// parseArrivalLines(log): arrival rounds from the fight log alone.
// Door lines are pushed pre-loop (no R-prefix): "X is already at
// the door — charges in with Y!" / "...at the door too — charges
// in with Y!". Shout lines are pushed in-loop (R-prefixed):
// "R<n>: Y is losing — shouts for help! X charges in!" (1st),
// "R<n>: Y is still losing — shouts again! X charges in!" (2nd),
// "R<n>: Y is still losing — shouts a third time! X charges in!"
// (3rd). Returns { name: round } for every "charges in" line found.
function parseArrivalLines(log) {
  const out = {};
  for (const raw of (log || [])) {
    const line = String(raw);
    let m = /^R(\d+): .* shouts for help! (.+?) charges in!/.exec(line);
    if (m) { out[m[2]] = parseInt(m[1], 10); continue; }
    m = /^R(\d+): .* shouts again! (.+?) charges in!/.exec(line);
    if (m) { out[m[2]] = parseInt(m[1], 10); continue; }
    m = /^R(\d+): .* shouts a third time! (.+?) charges in!/.exec(line);
    if (m) { out[m[2]] = parseInt(m[1], 10); continue; }
    m = /^(.+?) is already at the door(?: too)? — charges in with /.exec(line);
    if (m) { if (out[m[1]] == null) out[m[1]] = 0; continue; }
  }
  return out;
}

// parseStrikesByName is intentionally NOT re-implemented here:
// the log strike parse reuses parseStrikes from
// analyze-speardmg-a.js (see classifyFight below).

// arrivalRounds(fight): per-seat arrival round from the fight
// record (door = 0, shout = rec.shoutRound), cross-checked against
// the log parse. Returns { seat: round|null, checks: [...] } where
// a seat that never joined has round null and joined seats carry
// their round; any disagreement between the record and the log, or
// a joined seat with no determinable round, is listed in checks
// (and makes the fight unclassified for the GO bar).
function arrivalRounds(f) {
  const checks = [];
  const logArr = parseArrivalLines(f.log || []);
  const names = f.allyNames || {};
  function seatRound(vid, name, shoutRound, joinedFlag) {
    if (!vid) return null;
    let recRound = null;
    if (shoutRound != null) recRound = shoutRound | 0;
    else recRound = 0; // no shout round recorded: must be a door join
    let logRound = null;
    if (name && logArr[name] != null) logRound = logArr[name];
    if (logRound != null && logRound !== recRound) {
      checks.push('arrival-mismatch:' + name + ':rec=' + recRound + ':log=' + logRound);
    }
    if (logRound == null && shoutRound == null) {
      // No log line AND no shout round: the join is real (vid set)
      // but its round is unattested. Door joins always log a line,
      // so this means the log is missing the join.
      checks.push('arrival-unattested:' + (name || vid));
    }
    return recRound;
  }
  return {
    lead: 0,
    ally1: seatRound(f.allyVid, names.ally1, f.shoutRound, f.allyJoined),
    ally2: seatRound(f.ally2Vid, names.ally2, f.shout2Round, f.ally2Joined),
    ally3: seatRound(f.ally3Vid, names.ally3, f.shout3Round, f.ally3Joined),
    checks: checks,
  };
}

// roundsDetailSums(fight): per-seat dealt from the engine's own
// per-round deltas. NOTE the field names: each roundsDetail entry
// carries `dealt` (the round's TOTAL dealt — fieldFights.js:1716),
// NOT `mDealt`, plus allyDealt / ally2Dealt / ally3Dealt. (An
// earlier version of this function read r.mDealt and summed 0 —
// caught by the proof test on all three seeds.) Null when
// roundsDetail is absent.
function roundsDetailSums(f) {
  const rd = f.roundsDetail;
  if (!Array.isArray(rd) || !rd.length) return null;
  let m = 0, a = 0, a2 = 0, a3 = 0;
  for (const r of rd) {
    m += (r.dealt | 0); a += (r.allyDealt | 0); a2 += (r.ally2Dealt | 0); a3 += (r.ally3Dealt | 0);
  }
  return { lead: m - a, ally1: a - a2 - a3, ally2: a2, ally3: a3, sum: m };
}

// blockerFor(fight): the frozen taxonomy (prereg §0), first match.
// 'seat-present' when the 4th seat DID appear (not a blocker —
// counted in the headline). 'unclassified' when nothing explains
// the row (fails the GO bar).
function blockerFor(f) {
  const snap = f.snap;
  if (!snap) return 'unclassified';
  if (f.ally3Vid) return 'seat-present';
  const has4th = (snap.expedCompanionN >= 3) || (snap.planPartyN >= 3) || (snap.pinnedQuadN >= 3);
  const has4thScholar = f.leadIsScholar && snap.scholarPartyN != null && snap.scholarPartyN >= 4;
  if (!has4th && !has4thScholar) return 'no-4th-companion';
  if (snap.senseError) return 'unclassified';
  if ((snap.senseN == null ? 0 : snap.senseN) < 3) return 'sense-cap-2';
  if ((f.allyVidsPassed || []).length < 3) return 'call-site-cap';
  // 3 allyVids reached the engine: on plain master the slice caps
  // at 2 (ALLYSLOT3 off), so the 3rd id is cut before any join.
  return 'engine-slice-2';
}

// classifyFight(fight): the full per-fight classification. Returns
// null for non-fought meetings (evade / alreadyDead, 0 rounds) —
// those are counted, not classified. For fought fights returns the
// classification object; `unclassified` is true when the fight
// cannot be fully explained (GO bar: 0 of these).
function classifyFight(f) {
  const rounds = f.rounds | 0;
  if (rounds < 1) return null;
  const dealt = seatDealt(f);
  const arr = arrivalRounds(f);
  const rd = roundsDetailSums(f);
  const problems = [];
  if (dealt.ally1 < 0) problems.push('negative-ally1-dealt');
  if ((f.mDealt | 0) < (f.allyDealt | 0)) problems.push('allyDealt-exceeds-mDealt');
  if (arr.checks.length) problems.push.apply(problems, arr.checks);
  // Reconciliation: roundsDetail sums must equal the row tallies.
  let rdResidual = null;
  if (rd) {
    rdResidual = Math.abs(rd.lead - dealt.lead) + Math.abs(rd.ally1 - dealt.ally1) +
      Math.abs(rd.ally2 - dealt.ally2) + Math.abs(rd.ally3 - dealt.ally3) +
      Math.abs(rd.sum - (f.mDealt | 0));
    if (rdResidual !== 0) problems.push('roundsDetail-residual:' + rdResidual);
  } else {
    problems.push('roundsDetail-missing');
  }
  // Log strike parse: the proven speardmg parser (strike / echo /
  // extra / ambush / contact / volley), fed a synthetic row built
  // from this row's names. Volley / contact / ambush are attributed
  // to the lead by the parser (lead-only channels), so they join
  // the lead's parsed total here. Any unattributed strike line,
  // unknown damage line, or per-seat mismatch is a problem.
  const names = [f.leadName, (f.allyNames || {}).ally1, (f.allyNames || {}).ally2, (f.allyNames || {}).ally3].filter(Boolean);
  let logResidual = null, logParsed = 0, logUnattributed = 0;
  if (names.length === new Set(names).size && names.every(function (n) { return n !== 'Someone'; })) {
    const kits = [{ vid: f.vid, name: f.leadName }];
    if (f.allyVid) kits.push({ vid: f.allyVid, name: (f.allyNames || {}).ally1 });
    if (f.ally2Vid) kits.push({ vid: f.ally2Vid, name: (f.allyNames || {}).ally2 });
    if (f.ally3Vid) kits.push({ vid: f.ally3Vid, name: (f.allyNames || {}).ally3 });
    const synth = { vid: f.vid, leadKit: kits[0], fighterKits: kits.slice(1), log: f.log || [], mDealt: f.mDealt | 0 };
    const parsed = parseStrikes(synth);
    logParsed = parsed.strikeLines;
    logUnattributed = parsed.strikeLines - parsed.coveredStrikeLines;
    const seatParsed = {};
    function parsedTotal(vid) {
      const b = (vid && parsed.byVid[vid]) || null;
      return (b ? ((b.weaponDmg | 0) + (b.extraDmg | 0)) : 0);
    }
    seatParsed.lead = parsedTotal(f.vid) + (parsed.volleyParsed | 0) + (parsed.contactParsed | 0) + (parsed.ambushParsed | 0);
    seatParsed.ally1 = f.allyVid ? parsedTotal(f.allyVid) : 0;
    seatParsed.ally2 = f.ally2Vid ? parsedTotal(f.ally2Vid) : 0;
    seatParsed.ally3 = f.ally3Vid ? parsedTotal(f.ally3Vid) : 0;
    logResidual = Math.abs(parsed.unparsedDmg) +
      Math.abs(seatParsed.lead - dealt.lead) + Math.abs(seatParsed.ally1 - dealt.ally1) +
      Math.abs(seatParsed.ally2 - dealt.ally2) + Math.abs(seatParsed.ally3 - dealt.ally3);
    if (logUnattributed > 0) problems.push('log-unattributed-strikes:' + logUnattributed);
    if (parsed.unknownDmgLines.length > 0) problems.push('log-unknown-dmg-lines:' + parsed.unknownDmgLines.length);
    if (logResidual !== 0) problems.push('log-residual:' + logResidual);
  } else {
    problems.push('name-collision');
  }
  const seatsPresent = 1 + (f.allyVid ? 1 : 0) + (f.ally2Vid ? 1 : 0) + (f.ally3Vid ? 1 : 0);
  const partySizeAtStart = 1 +
    ((f.allyVid && f.shoutRound == null) ? 1 : 0) +
    ((f.ally2Vid && f.shout2Round == null) ? 1 : 0) +
    ((f.ally3Vid && f.shout3Round == null) ? 1 : 0);
  const blocker = blockerFor(f);
  if (blocker === 'unclassified') problems.push('blocker-unclassified');
  return {
    seed: f.seed || null, day: f.day, mid: f.mid, wave: f.wave, origin: f.origin,
    leadName: f.leadName, leadIsScholar: !!f.leadIsScholar,
    outcome: f.outcome, rounds: rounds, mHpStart: f.mHpStart, mDealt: f.mDealt | 0,
    seatsPresent: seatsPresent, partySizeAtStart: partySizeAtStart,
    arrival: { lead: arr.lead, ally1: arr.ally1, ally2: arr.ally2, ally3: arr.ally3 },
    dealt: dealt,
    expedCompanionN: f.snap ? f.snap.expedCompanionN : null,
    planPartyN: f.snap ? f.snap.planPartyN : null,
    pinnedQuadN: f.snap ? f.snap.pinnedQuadN : null,
    scholarPartyN: f.snap ? f.snap.scholarPartyN : null,
    senseN: f.snap ? f.snap.senseN : null,
    allyVidsPassedN: (f.allyVidsPassed || []).length,
    blocker: blocker,
    rdResidual: rdResidual, logResidual: logResidual, logParsed: logParsed,
    problems: problems,
    unclassified: problems.length > 0,
  };
}

// analyzeCorpus(files): the pooled analysis over per-seed JSONs.
function analyzeCorpus(files) {
  const seeds = [];
  const fights = []; // all wave>=4 rows, any origin
  let senseCalls = [], departs = [], planCensus = [];
  let totalDeaths = 0;
  const deathKinds = {}, deathCauses = {};
  for (const file of files) {
    const d = JSON.parse(fs.readFileSync(file, 'utf8'));
    const seedRow = { seed: d.seed, days: d.days, endReason: d.endReason, won: d.won,
      villageLost: d.villageLost, scaleRank: d.scaleRank, maxWave: d.maxWave,
      unlockedWave: d.unlockedWave, standing: d.standing,
      anchorCommit: (d.anchorCommit || '').slice(0, 12),
      wiringSha: d.wiringSha, fightsSha: d.fightsSha, brainSha: d.brainSha,
      flagsSet: d.flagsSet || [], instrumentErrors: (d.instrumentErrors || []).length,
      deaths: (d.deaths || []).length,
      w4rows: (d.w4fights || []).length,
      senseCalls: (d.senseCalls || []).length,
      departs: (d.departs || []).length,
      planCensus: (d.planCensus || []).length };
    seeds.push(seedRow);
    for (const f of (d.w4fights || [])) { f.seed = d.seed; fights.push(f); }
    senseCalls = senseCalls.concat((d.senseCalls || []).map(function (r) { r.seed = d.seed; return r; }));
    departs = departs.concat((d.departs || []).map(function (r) { r.seed = d.seed; return r; }));
    planCensus = planCensus.concat((d.planCensus || []).map(function (r) { r.seed = d.seed; return r; }));
    for (const dd of (d.deaths || [])) {
      totalDeaths++;
      deathKinds[dd.kind || 'unknown'] = (deathKinds[dd.kind || 'unknown'] || 0) + 1;
      deathCauses[dd.cause || 'unknown'] = (deathCauses[dd.cause || 'unknown'] || 0) + 1;
    }
  }
  const w4 = fights.filter(function (f) { return (f.wave | 0) === 4; });
  const w5 = fights.filter(function (f) { return (f.wave | 0) >= 5; });
  const foughtW4 = w4.filter(function (f) { return (f.rounds | 0) >= 1; });
  const evadedW4 = w4.filter(function (f) { return (f.rounds | 0) < 1; });
  const foughtW5 = w5.filter(function (f) { return (f.rounds | 0) >= 1; });
  const classified = foughtW4.map(classifyFight);
  const unclassified = classified.filter(function (c) { return c.unclassified; });
  const blockers = {};
  for (const c of classified) blockers[c.blocker] = (blockers[c.blocker] || 0) + 1;
  const seatsDist = {};
  for (const c of classified) seatsDist[c.seatsPresent] = (seatsDist[c.seatsPresent] || 0) + 1;
  const startDist = {};
  for (const c of classified) startDist[c.partySizeAtStart] = (startDist[c.partySizeAtStart] || 0) + 1;
  const originDist = {};
  for (const c of classified) originDist[c.origin] = (originDist[c.origin] || 0) + 1;
  const outcomeDist = {};
  for (const c of classified) outcomeDist[c.outcome] = (outcomeDist[c.outcome] || 0) + 1;
  // Per-seat pooled damage + arrival rounds.
  const seatTotals = { lead: 0, ally1: 0, ally2: 0, ally3: 0 };
  const seatFights = { lead: 0, ally1: 0, ally2: 0, ally3: 0 };
  const arrivalRoundsBySeat = { ally1: [], ally2: [], ally3: [] };
  let totalMDealt = 0;
  for (const c of classified) {
    totalMDealt += c.mDealt;
    seatTotals.lead += c.dealt.lead; seatTotals.ally1 += c.dealt.ally1;
    seatTotals.ally2 += c.dealt.ally2; seatTotals.ally3 += c.dealt.ally3;
    if (c.allyVid != null || c.seatsPresent >= 2) seatFights.ally1++;
    if (c.seatsPresent >= 3) seatFights.ally2++;
    if (c.seatsPresent >= 4) seatFights.ally3++;
    seatFights.lead++;
    if (c.arrival.ally1 != null) arrivalRoundsBySeat.ally1.push(c.arrival.ally1);
    if (c.arrival.ally2 != null) arrivalRoundsBySeat.ally2.push(c.arrival.ally2);
    if (c.arrival.ally3 != null) arrivalRoundsBySeat.ally3.push(c.arrival.ally3);
  }
  // Sense ledger in the wild.
  const senseDist = {};
  let senseMax = 0, senseWith3PlusExped = 0, senseCallsTotal = senseCalls.length;
  for (const s of senseCalls) {
    senseDist[s.returnedN] = (senseDist[s.returnedN] || 0) + 1;
    if (s.returnedN > senseMax) senseMax = s.returnedN;
    if ((s.expedCompanionN | 0) >= 3) senseWith3PlusExped++;
  }
  // Launch census: max party ever launched / planned.
  let maxLaunchParty = 0, maxPlanParty = 0, maxCensusParty = 0;
  let launches = 0, launchesWith2 = 0, launchesWith3 = 0;
  let companion2Ever = 0, companion3Ever = 0;
  for (const dp of departs) {
    if (dp.result !== 'launch') continue;
    launches++;
    if (dp.partySize > maxLaunchParty) maxLaunchParty = dp.partySize;
    if (dp.partySize >= 3) launchesWith2++;
    if (dp.partySize >= 4) launchesWith3++;
    if (dp.companion2) companion2Ever++;
    if (dp.companion3) companion3Ever++;
  }
  for (const dp of departs) if (dp.partySize > maxPlanParty) maxPlanParty = dp.partySize;
  for (const pc of planCensus) if (pc.partySize > maxCensusParty) maxCensusParty = pc.partySize;
  // 4th-companion existence at fight time (max over fought w4).
  let maxExpedAtFight = 0, maxPlanAtFight = 0, maxPinnedAtFight = 0, maxSenseAtFight = 0;
  let fightsWith4thCompanion = 0;
  for (const c of classified) {
    if (c.expedCompanionN > maxExpedAtFight) maxExpedAtFight = c.expedCompanionN;
    if (c.planPartyN > maxPlanAtFight) maxPlanAtFight = c.planPartyN;
    if (c.pinnedQuadN > maxPinnedAtFight) maxPinnedAtFight = c.pinnedQuadN;
    if (c.senseN > maxSenseAtFight) maxSenseAtFight = c.senseN;
    if (c.expedCompanionN >= 3 || c.planPartyN >= 3 || c.pinnedQuadN >= 3) fightsWith4thCompanion++;
  }
  // Per-seed fought counts (determinism cross-check for siblings).
  const perSeedFought = {};
  for (const s of seeds) perSeedFought[s.seed] = 0;
  for (const c of classified) perSeedFought[c.seed] = (perSeedFought[c.seed] || 0) + 1;
  const perSeedMDealt = {};
  for (const c of classified) perSeedMDealt[c.seed] = (perSeedMDealt[c.seed] || 0) + c.mDealt;
  // Wall numbers.
  const daysSorted = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const wall = {
    national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: null,
    wins: seeds.filter(function (s) { return s.won; }).length,
    wave4Unlocked: seeds.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
    wave5Unlocked: seeds.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
    medianSurvival: median(daysSorted),
    survivalDays: daysSorted,
    communityLost: seeds.filter(function (s) { return s.villageLost; }).length,
    scaleRanks: seeds.map(function (s) { return s.scaleRank; }),
    standings: seeds.map(function (s) { return s.standing; }),
    deaths: totalDeaths, deathKinds: deathKinds, deathCauses: deathCauses,
  };
  return {
    seeds: seeds,
    pool: { w4rows: w4.length, w5rows: w5.length, foughtW4: foughtW4.length,
      evadedW4: evadedW4.length, foughtW5: foughtW5.length },
    coverage: { classified: classified.length, unclassified: unclassified.length,
      coverage: classified.length ? (classified.length - unclassified.length) / classified.length : null },
    unclassifiedRows: unclassified,
    classified: classified,
    blockers: blockers,
    seatsDist: seatsDist, startDist: startDist, originDist: originDist, outcomeDist: outcomeDist,
    seatTotals: seatTotals, seatFights: seatFights, totalMDealt: totalMDealt,
    seatShares: totalMDealt ? {
      lead: round1(100 * seatTotals.lead / totalMDealt),
      ally1: round1(100 * seatTotals.ally1 / totalMDealt),
      ally2: round1(100 * seatTotals.ally2 / totalMDealt),
      ally3: round1(100 * seatTotals.ally3 / totalMDealt) } : null,
    arrivalRoundsBySeat: arrivalRoundsBySeat,
    arrivalMedians: { ally1: median(arrivalRoundsBySeat.ally1),
      ally2: median(arrivalRoundsBySeat.ally2), ally3: median(arrivalRoundsBySeat.ally3) },
    fourthCompanion: { maxExpedAtFight: maxExpedAtFight, maxPlanAtFight: maxPlanAtFight,
      maxPinnedAtFight: maxPinnedAtFight, maxSenseAtFight: maxSenseAtFight,
      fightsWith4thCompanion: fightsWith4thCompanion,
      maxLaunchParty: maxLaunchParty, maxPlanParty: maxPlanParty, maxCensusParty: maxCensusParty,
      launches: launches, launchesWith2: launchesWith2, launchesWith3: launchesWith3,
      companion2Ever: companion2Ever, companion3Ever: companion3Ever },
    sense: { calls: senseCallsTotal, dist: senseDist, max: senseMax,
      callsWith3PlusExped: senseWith3PlusExped },
    perSeedFought: perSeedFought, perSeedMDealt: perSeedMDealt,
    wall: wall,
    instrumentErrors: seeds.reduce(function (a, s) { return a + s.instrumentErrors; }, 0),
  };
}

function selftest() {
  let passed = 0, failed = 0;
  const fails = [];
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS ' + name); }
    else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  // Fixture fight 1: plain-master shape — lead + 1 ally via door,
  // no 4th companion anywhere (exped 1, plan 1, pin 0), sense 1.
  const f1 = {
    vid: 'v_lead', seed: 112201, day: 60, mid: 'audit', wave: 4, origin: 'expedition',
    leadName: 'Mateo', leadIsScholar: false, outcome: 'vFlee', rounds: 4,
    mHpStart: 1200, mDealt: 200, vTaken: 100,
    leadDealt: 150, allyDealt: 50, ally2Dealt: 0, ally3Dealt: 0, ally1Dealt: 50,
    allyVid: 'v_ally1', ally2Vid: null, ally3Vid: null,
    allyNames: { ally1: 'Riri', ally2: null, ally3: null },
    allyJoined: true, ally2Joined: false, ally3Joined: false,
    calledHelp: true, shoutRound: null, shout2Round: null, shout3Round: null,
    allyVidsPassed: ['v_ally1'],
    snap: { expedCompanions: ['v_ally1'], expedCompanionN: 1, planParty: ['v_ally1'],
      planPartyN: 1, pinnedQuad: [], pinnedQuadN: 0, scholarPartyN: null,
      rosterN: 12, livingN: 10, senseReturned: ['v_ally1'], senseN: 1, senseError: null },
    log: ['Riri is already at the door — charges in with Mateo!',
      'R1: Mateo strikes for 40 (1160 left)',
      'R1: Riri strikes for 12 (1148 left)',
      'R2: Mateo strikes for 38 (1110 left)',
      'R2: Riri strikes for 13 (1097 left)',
      'R3: Mateo strikes for 36 (1061 left)',
      'R3: Riri strikes for 12 (1049 left)',
      'R4: Mateo strikes for 36 (1013 left)',
      'R4: Riri strikes for 13 (1000 left)'],
    roundsDetail: [
      { round: 1, dealt: 52, allyDealt: 12, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 2, dealt: 51, allyDealt: 13, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 3, dealt: 48, allyDealt: 12, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 4, dealt: 49, allyDealt: 13, ally2Dealt: 0, ally3Dealt: 0 },
    ],
  };
  const c1 = classifyFight(f1);
  check('f1 fought, 2 seats, start 2', c1 && c1.seatsPresent === 2 && c1.partySizeAtStart === 2, JSON.stringify(c1 && { seats: c1.seatsPresent, start: c1.partySizeAtStart }));
  check('f1 arrival ally1 = 0 (door)', c1 && c1.arrival.ally1 === 0, JSON.stringify(c1 && c1.arrival));
  check('f1 dealt lead 150 / ally1 50', c1 && c1.dealt.lead === 150 && c1.dealt.ally1 === 50, JSON.stringify(c1 && c1.dealt));
  check('f1 blocker no-4th-companion', c1 && c1.blocker === 'no-4th-companion', c1 && c1.blocker);
  check('f1 rdResidual 0', c1 && c1.rdResidual === 0, String(c1 && c1.rdResidual));
  check('f1 logResidual 0', c1 && c1.logResidual === 0, String(c1 && c1.logResidual));
  check('f1 classified (no problems)', c1 && !c1.unclassified, JSON.stringify(c1 && c1.problems));

  // Fixture fight 2: ally joins via 1st shout on round 3; a 4th
  // companion EXISTS on the expedition (3 companions) but the sense
  // returned only 2 → sense-cap-2.
  const f2 = Object.assign({}, f1, {
    day: 70, mid: 'reunion', outcome: 'vFlee', rounds: 5, mDealt: 260,
    leadDealt: 200, allyDealt: 60, ally1Dealt: 60,
    allyVidsPassed: ['v_ally1', 'v_ally2'],
    snap: { expedCompanions: ['v_ally1', 'v_ally2', 'v_ally3'], expedCompanionN: 3,
      planParty: ['v_ally1', 'v_ally2', 'v_ally3'], planPartyN: 3,
      pinnedQuad: [], pinnedQuadN: 0, scholarPartyN: null,
      rosterN: 14, livingN: 12, senseReturned: ['v_ally1', 'v_ally2'], senseN: 2, senseError: null },
    shoutRound: 3,
    log: ['R1: Mateo strikes for 40 (1160 left)',
      'R2: Mateo strikes for 38 (1122 left)',
      'R3: Mateo is losing — shouts for help! Riri charges in!',
      'R3: Mateo strikes for 42 (1080 left)',
      'R3: Riri strikes for 15 (1065 left)',
      'R4: Mateo strikes for 40 (1025 left)',
      'R4: Riri strikes for 15 (1010 left)',
      'R5: Mateo strikes for 40 (970 left)',
      'R5: Riri strikes for 30 (940 left)'],
    roundsDetail: [
      { round: 1, dealt: 40, allyDealt: 0, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 2, dealt: 38, allyDealt: 0, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 3, dealt: 57, allyDealt: 15, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 4, dealt: 55, allyDealt: 15, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 5, dealt: 70, allyDealt: 30, ally2Dealt: 0, ally3Dealt: 0 },
    ],
  });
  const c2 = classifyFight(f2);
  check('f2 arrival ally1 = 3 (shout)', c2 && c2.arrival.ally1 === 3, JSON.stringify(c2 && c2.arrival));
  check('f2 blocker sense-cap-2', c2 && c2.blocker === 'sense-cap-2', c2 && c2.blocker);
  check('f2 start size 1 (shout join)', c2 && c2.partySizeAtStart === 1, String(c2 && c2.partySizeAtStart));
  check('f2 classified', c2 && !c2.unclassified, JSON.stringify(c2 && c2.problems));

  // Fixture fight 3: evade (0 rounds) → not classified (null).
  const c3 = classifyFight(Object.assign({}, f1, { rounds: 0, outcome: 'evade', mDealt: 0, leadDealt: 0, allyDealt: 0, ally1Dealt: 0 }));
  check('f3 evade returns null', c3 === null, String(c3));

  // Fixture fight 4: the 4th seat DID appear (ally3Vid set) →
  // blocker seat-present, 4 seats.
  const f4 = Object.assign({}, f1, {
    mid: 'eater', rounds: 6, mDealt: 440, leadDealt: 240, allyDealt: 200,
    ally2Dealt: 80, ally3Dealt: 60, ally1Dealt: 60,
    ally2Vid: 'v_ally2', ally3Vid: 'v_ally3',
    allyNames: { ally1: 'Riri', ally2: 'Nikos', ally3: 'Tashi' },
    shout2Round: 4, shout3Round: 5,
    allyVidsPassed: ['v_ally1', 'v_ally2', 'v_ally3'],
    snap: { expedCompanions: ['v_ally1', 'v_ally2', 'v_ally3'], expedCompanionN: 3,
      planParty: ['v_ally1', 'v_ally2', 'v_ally3'], planPartyN: 3,
      pinnedQuad: ['v_ally1', 'v_ally2', 'v_ally3'], pinnedQuadN: 3,
      scholarPartyN: null, rosterN: 14, livingN: 12,
      senseReturned: ['v_ally1', 'v_ally2', 'v_ally3'], senseN: 3, senseError: null },
    log: ['Riri is already at the door — charges in with Mateo!',
      'R1: Mateo strikes for 40 (1160 left)',
      'R1: Riri strikes for 10 (1150 left)',
      'R2: Mateo strikes for 40 (1110 left)',
      'R2: Riri strikes for 10 (1100 left)',
      'R3: Mateo strikes for 40 (1060 left)',
      'R3: Riri strikes for 10 (1050 left)',
      'R4: Mateo is still losing — shouts again! Nikos charges in!',
      'R4: Mateo strikes for 40 (1010 left)',
      'R4: Riri strikes for 10 (1000 left)',
      'R4: Nikos strikes for 40 (960 left)',
      'R5: Mateo is still losing — shouts a third time! Tashi charges in!',
      'R5: Mateo strikes for 40 (920 left)',
      'R5: Riri strikes for 10 (910 left)',
      'R5: Tashi strikes for 30 (880 left)',
      'R6: Mateo strikes for 40 (840 left)',
      'R6: Riri strikes for 10 (830 left)',
      'R6: Nikos strikes for 40 (790 left)',
      'R6: Tashi strikes for 30 (760 left)'],
    roundsDetail: [
      { round: 1, dealt: 50, allyDealt: 10, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 2, dealt: 50, allyDealt: 10, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 3, dealt: 50, allyDealt: 10, ally2Dealt: 0, ally3Dealt: 0 },
      { round: 4, dealt: 90, allyDealt: 50, ally2Dealt: 40, ally3Dealt: 0 },
      { round: 5, dealt: 80, allyDealt: 40, ally2Dealt: 0, ally3Dealt: 30 },
      { round: 6, dealt: 120, allyDealt: 80, ally2Dealt: 40, ally3Dealt: 30 },
    ],
  });
  const c4 = classifyFight(f4);
  check('f4 4 seats present', c4 && c4.seatsPresent === 4, String(c4 && c4.seatsPresent));
  check('f4 arrivals 0/4/5', c4 && c4.arrival.ally1 === 0 && c4.arrival.ally2 === 4 && c4.arrival.ally3 === 5, JSON.stringify(c4 && c4.arrival));
  check('f4 blocker seat-present', c4 && c4.blocker === 'seat-present', c4 && c4.blocker);
  check('f4 rdResidual 0', c4 && c4.rdResidual === 0, String(c4 && c4.rdResidual));
  check('f4 logResidual 0', c4 && c4.logResidual === 0, String(c4 && c4.logResidual));
  check('f4 classified', c4 && !c4.unclassified, JSON.stringify(c4 && c4.problems));

  // Fixture fight 5: arrival mismatch (shoutRound says 3, log says
  // R4) → unclassified with a problem.
  const f5 = Object.assign({}, f2, { log: f2.log.map(function (l) { return l.replace('R3: Mateo is losing', 'R4: Mateo is losing'); }) });
  const c5 = classifyFight(f5);
  check('f5 arrival mismatch → unclassified', c5 && c5.unclassified && c5.problems.some(function (p) { return p.indexOf('arrival-mismatch') === 0; }), JSON.stringify(c5 && c5.problems));

  // parseArrivalLines unit checks.
  const pa = parseArrivalLines(['Riri is already at the door — charges in with Mateo!', 'R3: Mateo is losing — shouts for help! Nikos charges in!', 'R5: Mateo is still losing — shouts a third time! Tashi charges in!']);
  check('parseArrivalLines door 0 / shout 3 / third 5', pa.Riri === 0 && pa.Nikos === 3 && pa.Tashi === 5, JSON.stringify(pa));

  // seatDealt identity.
  const sd = seatDealt({ mDealt: 400, allyDealt: 200, ally2Dealt: 80, ally3Dealt: 60 });
  check('seatDealt sums to mDealt', sd.lead === 200 && sd.ally1 === 60 && sd.ally2 === 80 && sd.ally3 === 60 && sd.sum === 400, JSON.stringify(sd));

  console.log(passed + ' passed, ' + failed + ' failed');
  if (failed) { console.log('FAILURES: ' + fails.join(', ')); process.exitCode = 1; }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { selftest(); process.exit(); }
  const dirIdx = args.indexOf('--dir');
  const outIdx = args.indexOf('--out');
  if (dirIdx === -1) { console.error('Usage: node scripts/analyze-fourthseat-a.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const dir = args[dirIdx + 1];
  const files = fs.readdirSync(dir).filter(function (f) { return /^fourthseat-a-s\d+-/.test(f) && f.endsWith('.json'); }).map(function (f) { return path.join(dir, f); }).sort();
  if (!files.length) { console.error('No fourthseat per-seed files in ' + dir); process.exit(2); }
  const analysis = analyzeCorpus(files);
  const summary = {
    files: files.length,
    pool: analysis.pool,
    coverage: analysis.coverage,
    blockers: analysis.blockers,
    seatsDist: analysis.seatsDist,
    startDist: analysis.startDist,
    originDist: analysis.originDist,
    outcomeDist: analysis.outcomeDist,
    seatTotals: analysis.seatTotals,
    seatShares: analysis.seatShares,
    arrivalMedians: analysis.arrivalMedians,
    fourthCompanion: analysis.fourthCompanion,
    sense: analysis.sense,
    perSeedFought: analysis.perSeedFought,
    perSeedMDealt: analysis.perSeedMDealt,
    wall: analysis.wall,
    instrumentErrors: analysis.instrumentErrors,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (outIdx !== -1) {
    fs.writeFileSync(args[outIdx + 1], JSON.stringify(analysis, null, 2) + '\n');
    console.log('Wrote ' + args[outIdx + 1]);
  }
  if (analysis.coverage.unclassified) {
    console.error('UNCLASSIFIED FIGHTS: ' + analysis.coverage.unclassified);
    process.exitCode = 1;
  }
}

module.exports = { seatDealt: seatDealt, parseArrivalLines: parseArrivalLines, arrivalRounds: arrivalRounds,
  roundsDetailSums: roundsDetailSums, blockerFor: blockerFor,
  classifyFight: classifyFight, analyzeCorpus: analyzeCorpus };
