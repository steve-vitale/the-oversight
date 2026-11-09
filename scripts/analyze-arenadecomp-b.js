// analyze-arenadecomp-b.js — the ARENA decomposition analyzer
// (arm sim-arenadecomp-b, run fleshout-loop-b-20261109T1739Z). DIAG, zero src/js.
// Implements EXACTLY the arena taxonomy pre-registered in
// evidence/2026-11-09/sim-arenadecomp-b-prereg.md — a taxonomy change after
// the sweep is a dated CORRECTION, never a silent re-issue.
// Reuses, READ-ONLY, never edited:
//   scripts/analyze-prefloor-deaths-20261109.js — classifyCause (the cause
//     registry: wild / arena / starvation / sickness-disease / other-NAMED;
//     arena = exact 'the arena' ONLY, bare 'arena' is other).
//   scripts/analyze-sicknessdiag-b.js — classifySeed, aggregate,
//     buildFingerprint, fingerprintsEqual (per-seed split + wall inputs).
// Usage:
//   node scripts/analyze-arenadecomp-b.js <winseek-dir> [bare-dir]
// Prints the per-seed pre-90 split, the band split (primary set + the
// pre-90-ending subset), the raw cause census, the arena join table (one row
// per pre-90 arena death, with veteran status, entry HP, HP trajectory,
// contest/fight, choice-offer signal, and origin), the contest census, wall
// numbers, contradiction flags, G3 integrity, and (with a bare dir) the G2
// neutrality comparison.
'use strict';
const fs = require('fs');
const path = require('path');
const PREFLOOR = require('./analyze-prefloor-deaths-20261109');
const SD = require('./analyze-sicknessdiag-b');

const classifyCause = PREFLOOR.classifyCause;
const CLASSES = PREFLOOR.CLASSES;
const classifySeed = SD.classifySeed;
const aggregateSeedClassifications = SD.aggregateSeedClassifications;
const buildFingerprint = SD.buildFingerprint;
const fingerprintsEqual = SD.fingerprintsEqual;
const loadDir = SD.loadDir;
const trueMedian = SD.trueMedian;

function med(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) { return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null; }
function r1(x) { return x == null ? null : Math.round(x * 10) / 10; }

function canonCauseOf(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// ---- G3 corpus integrity (prereg G3, arena shape) ----
function checkCorpusArena(corpus) {
  const problems = [];
  const notes = [];
  const rows = corpus.daySeries || [];
  const daysAlive = corpus.daysAlive | 0;
  if (!rows.length) problems.push('no daily rows');
  else {
    const firstDay = rows[0].day | 0;
    const lastDay = rows[rows.length - 1].day | 0;
    if (firstDay !== 1 && firstDay !== 0) problems.push('first daily row day ' + firstDay + ' (expected 0/1)');
    if (!(rows.length === daysAlive || rows.length === daysAlive - 1)) {
      problems.push('daySeries length ' + rows.length + ' vs daysAlive ' + daysAlive + ' (expected daysAlive or daysAlive-1)');
    } else if (rows.length === daysAlive - 1) {
      notes.push('daySeries is daysAlive-1 (one day has no snapshot — see gaps below)');
    }
    const seenDays = new Set(rows.map(function (r) { return r.day | 0; }));
    const gaps = [];
    for (let d = (rows[0].day | 0); d <= (rows[rows.length - 1].day | 0); d++) if (!seenDays.has(d)) gaps.push(d);
    if (gaps.length) notes.push('daySeries gaps (no snapshot): days ' + gaps.join(', '));
    rows.forEach(function (r, i) {
      if (r.healerPresent == null) problems.push('row ' + i + ' (day ' + r.day + '): healerPresent null');
      if (r.healthMap == null) problems.push('row ' + i + ' (day ' + r.day + '): healthMap null');
    });
  }
  if (!corpus.fallen) problems.push('fallen list missing');
  if (!corpus.deathRows) problems.push('deathRows missing');
  if ((corpus.instrumentErrors || []).length) problems.push('instrumentErrors: ' + corpus.instrumentErrors.join('; '));
  if (corpus.hurtEvents == null) problems.push('hurtEvents missing');
  if (corpus.contestTakes == null) problems.push('contestTakes missing');
  if (corpus.arenaEvents == null) problems.push('arenaEvents missing');
  if (corpus.arenaAfterEvents == null) problems.push('arenaAfterEvents missing');
  if (corpus.waveKillLog == null) problems.push('waveKillLog missing');
  if (corpus.contestDeathsById == null) problems.push('contestDeathsById missing');
  if (corpus.sysSayLines == null) problems.push('sysSayLines missing (sysSay channel not recorded)');
  // Fallen vs deathRows consistency: every fallen entry must have a matching
  // deathRow (same day + same villager id + canonCause-matched cause).
  const fallen = corpus.fallen || [];
  const deaths = corpus.deathRows || [];
  let fallenMatched = 0;
  const fallenUnmatched = [];
  fallen.forEach(function (f) {
    const ok = deaths.some(function (d) {
      return d && (d.day | 0) === (f.day | 0) && d.who === f.villagerId &&
        (d.cause === canonCauseOf(f.cause) || (d.causeRaw != null && String(d.causeRaw) === String(f.cause)));
    });
    if (ok) fallenMatched++;
    else fallenUnmatched.push(f);
  });
  const deathUnmatched = deaths.filter(function (d) {
    return !fallen.some(function (f) {
      return (f.day | 0) === (d.day | 0) && f.villagerId === d.who;
    });
  });
  if (fallenUnmatched.length) problems.push('fallen without deathRow: ' + fallenUnmatched.length + ' (' + fallenUnmatched.map(function (f) { return f.villagerId + ' d' + f.day + ' ' + f.cause; }).join('; ') + ')');
  if (deathUnmatched.length) notes.push('deathRows without fallen entry: ' + deathUnmatched.length + ' (' + deathUnmatched.map(function (d) { return d.who + ' d' + d.day + ' ' + d.cause; }).join('; ') + ')');
  // Every pre-90 arena fallen entry must carry a deathRow with an arena
  // snapshot; a missing snapshot is an unclassified death, not a silent gap.
  fallen.filter(function (f) { return f && f.day != null && (f.day | 0) < 90 && classifyCause(f) === 'arena'; })
    .forEach(function (f) {
      const d = deaths.find(function (x) { return x && (x.day | 0) === (f.day | 0) && x.who === f.villagerId; });
      if (!d) problems.push('arena death d' + f.day + ' ' + f.villagerId + ': no deathRow');
      else if (!d.arena) problems.push('arena death d' + f.day + ' ' + f.villagerId + ': deathRow has no arena snapshot');
    });
  return { ok: problems.length === 0, problems: problems, notes: notes,
    fallenMatched: fallenMatched, fallenTotal: fallen.length,
    deathUnmatched: deathUnmatched.length };
}

// ---- the arena join (prereg taxonomy) ----
// For one pre-90 arena fallen entry, join: the deathRow's arena snapshot
// (arenaContest live at death? activeContest? tbfight? veteran kills?),
// the contest take (choice-offer signal), the arena-fight start + outcome,
// the entry HP (death-day dawn snapshot, else latest earlier row), and the
// hurtVillager trail for that victim on the death day.
function joinArenaDeath(corpus, fallenEntry) {
  const vid = fallenEntry.villagerId;
  const day = fallenEntry.day | 0;
  const deaths = corpus.deathRows || [];
  const drow = deaths.find(function (d) { return d && (d.day | 0) === day && d.who === vid; }) || null;
  const snap = drow ? drow.arena : null;
  const rows = corpus.daySeries || [];
  const snapByDay = new Map(rows.map(function (r) { return [r.day | 0, r]; }));
  // Entry HP: the death-day dawn snapshot's healthMap (the policy.daily
  // wrapper runs at dawn, before the day's fighting). Fall back to the
  // latest earlier row; never to a later row.
  let entryHp = null, entryHpDay = null;
  const rowSame = snapByDay.get(day);
  if (rowSame && rowSame.healthMap && rowSame.healthMap[vid] != null) {
    entryHp = rowSame.healthMap[vid]; entryHpDay = day;
  } else {
    let best = -1;
    rows.forEach(function (r) {
      if ((r.day | 0) < day && (r.day | 0) > best && r.healthMap && r.healthMap[vid] != null) best = r.day | 0;
    });
    if (best >= 0) { entryHp = snapByDay.get(best).healthMap[vid]; entryHpDay = best; }
  }
  // The hurtVillager trail for this victim on the death day, in record order.
  const trail = (corpus.hurtEvents || []).filter(function (ev) {
    return ev.who === vid && (ev.day | 0) === day;
  }).map(function (ev) {
    return { dmg: ev.dmg, cause: ev.cause, hpBefore: ev.hpBefore, hpAfter: ev.hpAfter,
      settlement: !!ev.settlement, monsterName: ev.monsterName || null };
  });
  const trailDmg = trail.reduce(function (n, t) { return n + ((t.dmg | 0) || 0); }, 0);
  // Contest identity: prefer the death-time activeContest, else the
  // arenaContest, else the take match.
  const contestId = (snap && snap.activeContest && snap.activeContest.contestId) ||
    (snap && snap.arenaContest && snap.arenaContest.contestId) || null;
  const takes = (corpus.contestTakes || []).filter(function (t) {
    return contestId != null && t.contestId === contestId && (t.day | 0) <= day;
  });
  takes.sort(function (a, b) { return (b.day | 0) - (a.day | 0); });
  const take = takes[0] || null;
  const arenaEvs = (corpus.arenaEvents || []).filter(function (e) {
    return contestId != null && e.contestId === contestId && (e.day | 0) <= day;
  });
  arenaEvs.sort(function (a, b) { return (b.day | 0) - (a.day | 0); });
  const arenaEv = arenaEvs[0] || null;
  const afterEvs = (corpus.arenaAfterEvents || []).filter(function (e) {
    return contestId != null && e.contestId === contestId && (e.day | 0) <= day;
  });
  afterEvs.sort(function (a, b) { return (b.day | 0) - (a.day | 0); });
  const afterEv = afterEvs[0] || null;
  // Origin: arenaContest live at death = a real contest-arena death;
  // no arenaContest live = the tbFightDeathCause fallback label on a
  // non-contest fight loss; no snapshot at all = unclassified.
  let origin;
  if (!snap) origin = 'unclassified';
  else if (snap.arenaContest) origin = 'contest-arena';
  else origin = 'fallback-label';
  const vet = (snap && snap.veteran) || { w3: 0, w4: 0, maxWave: 0, kills: [] };
  const approach = (snap && snap.activeContest && snap.activeContest.approach) || null;
  // Choice taken: ONLY meaningful when the take offered a choice — then the
  // choice phase is phaseIdx 0 and approach[0] is its index (0 = Participate,
  // 1 = Refuse, per the winseek comment). Otherwise approach[0] is the first
  // real phase's choice and says nothing about the offer.
  let choiceTaken = null;
  if (take && take.choiceOffered && approach && approach['0'] != null) {
    choiceTaken = approach['0'] === 0 ? 'participated' : (approach['0'] === 1 ? 'refused' : 'other:' + approach['0']);
  }
  const tb = (snap && snap.tbfight) || null;
  const victimFighter = tb ? (tb.fighters || []).find(function (p) {
    return p.villagerId === vid || (drow && drow.isPlayer && p.key === 'p');
  }) || null : null;
  return {
    seed: corpus.seed, day: day, who: vid,
    whoName: fallenEntry.name || (drow && drow.whoName) || null,
    isPlayer: !!(drow && drow.isPlayer),
    cause: fallenEntry.cause,
    origin: origin,
    contestId: contestId,
    contestCat: (take && take.cat) || (snap && snap.activeContest && snap.activeContest.cat) || null,
    contestName: (take && take.name) || (snap && snap.activeContest && snap.activeContest.name) || null,
    takeDay: take ? take.day : null,
    takeParticipantIds: take ? take.participantIds : null,
    isPlayerTake: take ? !!take.isPlayerTake : null,
    choiceOffered: take ? !!take.choiceOffered : null,
    choiceTaken: choiceTaken,
    approach: approach,
    arenaWaveIdx: (snap && snap.arenaContest) ? snap.arenaContest.waveIdx : null,
    arenaWaves: (snap && snap.arenaContest) ? snap.arenaContest.waves : null,
    beastId: (snap && snap.arenaContest) ? snap.arenaContest.beastId : null,
    beastWave: (snap && snap.arenaContest) ? snap.arenaContest.beastWave : null,
    arenaOutcome: afterEv ? afterEv.result : null,
    arenaOutcomeDay: afterEv ? afterEv.day : null,
    veteranW3: vet.w3 | 0, veteranW4: vet.w4 | 0, veteranMaxWave: vet.maxWave | 0,
    veteranKills: vet.kills || [],
    entryHp: entryHp, entryHpDay: entryHpDay,
    hpAtDeath: snap ? snap.hpAtDeath : null,
    trail: trail, trailDmg: trailDmg, trailEvents: trail.length,
    tbfightRound: tb ? tb.round : null,
    tbfightTaken: victimFighter ? victimFighter.taken : null,
    tbfightHp: victimFighter ? victimFighter.hp : null,
    tbfightFighterCount: tb ? (tb.fighters || []).length : null,
    contestsHeldAtDeath: snap ? snap.contestsHeld : null,
    hasSnapshot: !!snap,
  };
}

function printSplit(label, split, n, shares) {
  console.log(label + ' (n=' + n + '): ' + CLASSES.map(function (c) {
    return c + ' ' + split[c] + ' (' + (100 * shares[c]).toFixed(1) + '%)';
  }).join(', '));
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/analyze-arenadecomp-b.js <winseek-dir> [bare-dir]'); process.exit(2); }
  const corpora = loadDir(dir, /^arenadecomp-b-winseek-s\d+\.json$/);
  const seeds = Object.keys(corpora).sort(function (a, b) { return (a | 0) - (b | 0); });
  if (!seeds.length) { console.error('no per-seed files in ' + dir); process.exit(2); }
  const classified = seeds.map(function (s) { return classifySeed(corpora[s]); });
  console.log('=== sim-arenadecomp-b DIAGNOSIS (seeds ' + seeds.join(',') + ', winseek, 150d) ===\n');
  console.log('seed | daysAlive | end | floor? | fallen | pre90 | wild | arena | starv | sick | other | sitCalls');
  classified.forEach(function (cl) {
    console.log(cl.seed + ' | ' + cl.daysAlive + ' | ' + cl.endReason + ' | ' + (cl.floorReach ? 'YES' : 'no') + ' | ' + cl.fallenTotal + ' | ' + cl.pre90Total +
      ' | ' + cl.split.wild + ' | ' + cl.split.arena + ' | ' + cl.split.starvation + ' | ' + cl.split['sickness-disease'] + ' | ' + cl.split.other + ' | ' + cl.sitCalls +
      (cl.contradiction ? ' CONTRADICTION' : '') + (cl.floorDisagree ? ' FLOOR-DISAGREE' : ''));
  });
  const agg = aggregateSeedClassifications(classified);
  console.log('\nBAND SPLIT — primary set (all pre-90 deaths, winseek leg):');
  printSplit('primary', agg.primary, agg.primaryN, agg.primaryShares);
  console.log('dominant: ' + agg.primaryDominant.cls + ' ' + (100 * agg.primaryDominant.share).toFixed(1) + '% — ' + (agg.primaryDominant.meets50 ? 'MEETS the 50% bar' : 'below the 50% bar'));
  console.log('\nBAND SPLIT — subset (deaths in villages ending before day 90):');
  printSplit('subset', agg.subset, agg.subsetN, agg.subsetShares);
  console.log('dominant: ' + agg.subsetDominant.cls + ' ' + (100 * agg.subsetDominant.share).toFixed(1) + '% — ' + (agg.subsetDominant.meets50 ? 'MEETS the 50% bar' : 'below the 50% bar'));
  console.log('\nRAW CAUSE CENSUS (pre-90 deaths, all causes, nothing hidden):');
  Object.keys(agg.raw).sort(function (a, b) { return agg.raw[b] - agg.raw[a]; }).forEach(function (c) {
    const classes = Object.keys(agg.rawClasses[c] || {}).map(function (k) { return k + ' ' + agg.rawClasses[c][k]; }).join(', ');
    console.log('  ' + agg.raw[c] + '  ' + JSON.stringify(c) + '  -> ' + classes);
  });
  console.log('\nOTHER-CLASS BREAKDOWN (named):');
  const ob = agg.otherBreakdown;
  if (Object.keys(ob).length) Object.keys(ob).sort(function (a, b) { return ob[b] - ob[a]; }).forEach(function (c) { console.log('  ' + ob[c] + '  ' + JSON.stringify(c)); });
  else console.log('  (empty — no pre-90 death fell in other)');
  console.log('\nFallen entries with missing day (data quality, expected 0): ' + agg.dayMissing);

  // ---- the arena join (primary metric) ----
  console.log('\n=== ARENA JOIN (pre-90 arena deaths) ===');
  const joins = [];
  seeds.forEach(function (s) {
    const corpus = corpora[s];
    (corpus.fallen || []).filter(function (f) { return f && f.day != null && (f.day | 0) < 90 && classifyCause(f) === 'arena'; })
      .forEach(function (f) { joins.push(joinArenaDeath(corpus, f)); });
  });
  const originCounts = {};
  joins.forEach(function (j) { originCounts[j.origin] = (originCounts[j.origin] || 0) + 1; });
  console.log('arena deaths=' + joins.length + ' origin counts: ' + JSON.stringify(originCounts) +
    ' (unclassified ' + (originCounts['unclassified'] || 0) + ', bar 0)');
  const scholarN = joins.filter(function (j) { return j.isPlayer; }).length;
  const villagerN = joins.length - scholarN;
  console.log('scholar (player) arena deaths=' + scholarN + ' villager arena deaths=' + villagerN);
  const vet3 = joins.filter(function (j) { return j.veteranW3 > 0; }).length;
  const vet4 = joins.filter(function (j) { return j.veteranW4 > 0; }).length;
  console.log('victims who were living wave-3+ killers=' + vet3 + ' wave-4 killers=' + vet4 + ' (of ' + joins.length + ')');
  const choiceOfferedN = joins.filter(function (j) { return j.choiceOffered === true; }).length;
  const choiceNotOfferedN = joins.filter(function (j) { return j.choiceOffered === false; }).length;
  const choiceUnknownN = joins.filter(function (j) { return j.choiceOffered == null; }).length;
  console.log('choice-offer line observed: offered=' + choiceOfferedN + ' not-observed=' + choiceNotOfferedN + ' unknown(no take match)=' + choiceUnknownN);
  const byCat = {};
  joins.forEach(function (j) { const k = j.contestCat || '<unknown>'; byCat[k] = (byCat[k] || 0) + 1; });
  console.log('by contest category: ' + JSON.stringify(byCat));
  const byBeastWave = {};
  joins.forEach(function (j) { const k = j.beastWave == null ? '<unknown>' : ('wave ' + j.beastWave); byBeastWave[k] = (byBeastWave[k] || 0) + 1; });
  console.log('by arena-beast wave: ' + JSON.stringify(byBeastWave));
  const byOutcome = {};
  joins.forEach(function (j) { const k = j.arenaOutcome || '<unknown>'; byOutcome[k] = (byOutcome[k] || 0) + 1; });
  console.log('by arena outcome: ' + JSON.stringify(byOutcome));
  joins.forEach(function (j) {
    console.log('  s' + j.seed + ' d' + j.day + ' ' + (j.whoName || j.who) + ' (' + j.who + ')' +
      (j.isPlayer ? ' SCHOLAR' : ' villager') +
      ' origin=' + j.origin +
      ' contest=' + (j.contestName || j.contestId || '<unknown>') + ' cat=' + (j.contestCat || '?') +
      ' takeDay=' + (j.takeDay == null ? '?' : 'd' + j.takeDay) +
      ' choiceOffered=' + (j.choiceOffered == null ? 'unknown' : j.choiceOffered) +
      (j.choiceTaken ? ' choiceTaken=' + j.choiceTaken : '') +
      ' beast=' + (j.beastId || '?') + ' wave=' + (j.beastWave == null ? '?' : j.beastWave) +
      ' waveIdx=' + (j.arenaWaveIdx == null ? '?' : j.arenaWaveIdx) +
      ' outcome=' + (j.arenaOutcome || '?') +
      ' vetW3=' + j.veteranW3 + ' vetW4=' + j.veteranW4 + ' vetMaxWave=' + j.veteranMaxWave +
      (j.veteranKills.length ? ' kills=[' + j.veteranKills.map(function (k) { return 'd' + k.d + ' ' + k.mid + ' w' + k.w + '/' + k.via; }).join(', ') + ']' : '') +
      ' entryHp=' + j.entryHp + (j.entryHpDay != null && j.entryHpDay !== j.day ? ' (d' + j.entryHpDay + ' row)' : '') +
      ' hpAtDeath=' + j.hpAtDeath +
      ' trailDmg=' + j.trailDmg + ' in ' + j.trailEvents + ' hurtEvents' +
      (j.tbfightRound != null ? ' tbRound=' + j.tbfightRound + ' tbTaken=' + j.tbfightTaken + ' tbHp=' + j.tbfightHp : ''));
    j.trail.forEach(function (t) {
      console.log('      hurt: dmg=' + t.dmg + ' cause=' + t.cause + ' ' + t.hpBefore + '->' + t.hpAfter +
        (t.settlement ? ' (settlement)' : '') + (t.monsterName ? ' monster=' + t.monsterName : ''));
    });
    if (!j.trail.length) console.log('      hurt: (no hurtVillager events for the victim on the death day)');
  });
  const entryHps = joins.filter(function (j) { return j.entryHp != null; }).map(function (j) { return j.entryHp; });
  if (entryHps.length) console.log('entry HP (n=' + entryHps.length + '): min=' + Math.min.apply(null, entryHps) + ' median=' + med(entryHps) + ' mean=' + r1(mean(entryHps)) + ' max=' + Math.max.apply(null, entryHps));
  const lowEntry = joins.filter(function (j) { return j.entryHp != null && j.entryHp < 50; }).length;
  console.log('arena deaths with entry HP < 50: ' + lowEntry + ' of ' + joins.length + ' (entered the arena already hurt)');

  // ---- contest census (all takes + arena fights, all days) ----
  console.log('\n=== CONTEST CENSUS (all days, winseek leg) ===');
  let takesTotal = 0, playerTakes = 0, offeredTotal = 0, arenaStarts = 0, arenaVoids = 0;
  const takesByCat = {};
  const afterByResult = {};
  seeds.forEach(function (s) {
    const c = corpora[s];
    takesTotal += (c.contestTakes || []).length;
    playerTakes += (c.contestTakes || []).filter(function (t) { return t.isPlayerTake; }).length;
    offeredTotal += (c.contestTakes || []).filter(function (t) { return t.choiceOffered; }).length;
    (c.contestTakes || []).forEach(function (t) { const k = t.cat || '<unknown>'; takesByCat[k] = (takesByCat[k] || 0) + 1; });
    arenaStarts += (c.arenaEvents || []).filter(function (e) { return !e.void; }).length;
    arenaVoids += (c.arenaEvents || []).filter(function (e) { return e.void; }).length;
    (c.arenaAfterEvents || []).forEach(function (e) { const k = e.result || '<unknown>'; afterByResult[k] = (afterByResult[k] || 0) + 1; });
  });
  console.log('contest takes=' + takesTotal + ' (player takes=' + playerTakes + ', choice-offered=' + offeredTotal + ')');
  console.log('takes by category: ' + JSON.stringify(takesByCat));
  console.log('arena-fight starts=' + arenaStarts + ' voids=' + arenaVoids);
  console.log('arena outcomes (all arena fights): ' + JSON.stringify(afterByResult));
  let contestDeathsTotal = 0;
  seeds.forEach(function (s) {
    const dl = corpora[s].contestDeathsById || {};
    Object.keys(dl).forEach(function (k) { contestDeathsTotal += dl[k] | 0; });
  });
  console.log('contestDeathsById total (ledger, all contests): ' + contestDeathsTotal);
  let contestsHeldTotal = 0;
  seeds.forEach(function (s) { contestsHeldTotal += (corpora[s].contestsHeld | 0); });
  console.log('contestsHeld total (final, all seeds): ' + contestsHeldTotal);
  let sysSayTotal = 0;
  seeds.forEach(function (s) { sysSayTotal += (corpora[s].sysSayLines || []).length; });
  console.log('sysSay lines captured (channel-live proof): ' + sysSayTotal + ' (expected >0 — the System speaks through sysSay)');

  // ---- hurtVillager coverage (the gap (c) instrument) ----
  console.log('\n=== HURT-COVERAGE (death-day attribution) ===');
  let hurtTotal = 0;
  seeds.forEach(function (s) { hurtTotal += (corpora[s].hurtEvents || []).length; });
  console.log('hurtVillager events recorded (all days, all seeds): ' + hurtTotal);
  const arenaDaysWithTrail = joins.filter(function (j) { return j.trailEvents > 0; }).length;
  console.log('arena deaths with a same-day hurt trail: ' + arenaDaysWithTrail + ' of ' + joins.length);

  // ---- wall numbers ----
  console.log('\nWall numbers (winseek leg):');
  const floorN = classified.filter(function (c) { return c.floorReach; }).length;
  const national = classified.filter(function (c) { return c.national; }).length;
  const wins = classified.filter(function (c) { return c.won; }).length;
  const w4u = classified.filter(function (c) { return (c.maxWave | 0) >= 4; }).length;
  const w5u = classified.filter(function (c) { return (c.maxWave | 0) >= 5; }).length;
  const surv = classified.map(function (c) { return c.daysAlive; }).sort(function (a, b) { return a - b; });
  console.log('floor-reach ' + floorN + '/' + classified.length + ', national ' + national + '/' + classified.length + ', table sits 0/' + classified.length + ', wins ' + wins + '/' + classified.length);
  console.log('wave-4 unlocks ' + w4u + '/' + classified.length + ', wave-5 unlocks ' + w5u + '/' + classified.length);
  console.log('true median survival ' + trueMedian(classified.map(function (c) { return c.daysAlive; })) + 'd (sorted ' + surv.join(', ') + ')');
  console.log('sit-verb calls across the band: ' + classified.reduce(function (n, c) { return n + c.sitCalls; }, 0) + ' (expected 0 — no seat-walking on this leg)');

  // ---- G3 corpus integrity ----
  console.log('\nG3 corpus integrity (winseek leg):');
  let g3pass = true;
  seeds.forEach(function (s) {
    const ck = checkCorpusArena(corpora[s]);
    if (!ck.ok) g3pass = false;
    console.log(s + ': ' + (ck.ok ? 'PASS' : 'FAIL — ' + ck.problems.join('; ')) + (ck.notes.length ? ' (notes: ' + ck.notes.join('; ') + ')' : '') +
      ' [fallen matched ' + ck.fallenMatched + '/' + ck.fallenTotal + ']');
  });
  console.log('G3 overall: ' + (g3pass ? 'PASS' : 'FAIL'));

  // ---- G2 neutrality (bare dir: fingerprints) ----
  const bareDir = process.argv[3];
  if (bareDir) {
    const bare = loadDir(bareDir, /^arenadecomp-b-bare-s\d+\.json$/);
    console.log('\nG2 neutrality (unrecorded vs recorded, winseek leg):');
    Object.keys(bare).sort(function (a, b) { return (a | 0) - (b | 0); }).forEach(function (s) {
      if (!corpora[s]) { console.log(s + ': no recorded match'); return; }
      const recFp = buildFingerprint(corpora[s], null);
      const diff = fingerprintsEqual(recFp, bare[s]);
      console.log(s + ': ' + (diff ? 'FAIL — ' + diff : 'PASS'));
    });
  }

  // ---- verdict inputs (prereg DIAG-GO bar) ----
  console.log('\nDIAG-GO BAR INPUTS:');
  console.log('arena deaths classified: ' + (joins.length - (originCounts['unclassified'] || 0)) + ' of ' + joins.length + ' (unclassified ' + (originCounts['unclassified'] || 0) + ', bar 0)');
  console.log('arena share of pre-90 deaths: ' + agg.primary.arena + '/' + agg.primaryN + ' = ' + (agg.primaryN ? (100 * agg.primary.arena / agg.primaryN).toFixed(1) + '%' : 'n/a'));
  console.log('origin split: ' + JSON.stringify(originCounts));
}

module.exports = { classifySeed: classifySeed, aggregateSeedClassifications: aggregateSeedClassifications,
  joinArenaDeath: joinArenaDeath, checkCorpusArena: checkCorpusArena, buildFingerprint: buildFingerprint,
  fingerprintsEqual: fingerprintsEqual, loadDir: loadDir, trueMedian: trueMedian, CLASSES: CLASSES };
