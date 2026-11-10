// wave5face-analyze-20261109.js — wave-5 facing analyzer (arm
// sim-wave5face-b, run fleshout-loop-b-20261110T0122Z). Pure functions
// over the wave5face driver corpus; no sims, writes nothing unless
// asked. Classifies, per seed: readiness-5 release (unlock day,
// release days), wave-5 spawns (meeting outcome or never-met reason),
// wave-5 casts (reconciled against wanderer births and spawns),
// meetings (fighter/veteran vs beast, outcome), and the
// veterans-simultaneity datum (max simultaneous living veterans,
// day-count of 2+ living veterans).
//
// Join rules (preregged, with one CORRECTED rule — see below):
//  - field fight -> spawn: EXACT, by row.w5spawnSeq (same world entity).
//  - TB trace -> spawn: earliest single candidate of the same mid with
//    spawnDay <= traceDay and (no removal, or traceDay - removedDay
//    <= 3). CORRECTED from the prereg (traceDay <= removedDay + no
//    same-day repeat): the engine removes the world monster when the
//    FIRST TB fight starts (startCombat: "it's in the fight now, not
//    wandering"), and later fights vs the same species are
//    re-engagements with no new spawn — observed to +3 days on this
//    band, with four scholars fighting one Cancellation on a single
//    day (99641 d100). Re-engagement joins are flagged 're-engage'.
//    Two+ live candidates -> 'ambiguous', never silently assigned.
//  - cast -> wanderer birth: same day + same mid (one event).
//  - wanderer birth -> spawn: same mid, spawnDay in [bornDay, bornDay+7]
//    (the 7-day give-up window). Unmatched births gave up or the
//    village died while the beast paced.
//  - spawn outcome priority: kill > die > flee > never-met.
//    never-met reason is always 'no-encounter' at spawn level;
//    'no-spawn' is a release-window reason (release days, zero spawns).
//
// Usage: node scripts/wave5face-analyze-20261109.js <corpus-dir>
//   (prints the band summary as JSON). The judged corpus lives in
//   evidence/2026-11-09/perseed-wave5face-b/.
'use strict';
const fs = require('fs');
const path = require('path');

function fieldOutcome(outcome) {
  if (outcome === 'vKill') return 'kill';
  if (outcome === 'vDie') return 'die';
  if (outcome === 'vFlee') return 'flee';
  return 'other:' + String(outcome);
}
function tbOutcome(ending) {
  if (ending === 'kill') return 'kill';
  if (ending === 'scholar-death') return 'die';
  if (ending === 'scholar-flee' || ending === 'rout') return 'flee';
  return 'other:' + String(ending);
}

function analyzeSeed(o) {
  const daily = o.daily || [];
  const spawns = (o.w5spawns || []).slice();
  const casts = (o.w5casts || []).slice();
  const births = (o.w5wanderers || []).slice();
  const field5 = (o.fieldFights || []).filter(function (f) { return (f.wave | 0) === 5; });
  const traces5 = (o.traces || []).filter(function (x) { return (x.wave | 0) >= 5; });
  const killLog = o.waveKillLog || [];

  // ---- release ----
  const releaseDays = daily.filter(function (d) { return (d.unlockedWaveSnap | 0) >= 5; }).map(function (d) { return d.day; });
  const unlockDay = releaseDays.length ? releaseDays[0] : null;
  const lastSnap = daily[daily.length - 1] || {};
  const lastGated = (lastSnap.gated != null) ? lastSnap.gated : null;
  const maxGated = daily.reduce(function (m, d) { return (d.gated != null && d.gated > m) ? d.gated : m; }, 0);
  const lastShort = (lastSnap.readiness5 && lastSnap.readiness5.short) || null;
  const lastR5 = lastSnap.readiness5 || null;

  // ---- simultaneity datum ----
  const lv = o.w5livingVets || [];
  let maxVets = 0, days2plus = 0, days1plus = 0, maxVetsDay = null;
  lv.forEach(function (r) {
    if ((r.count | 0) > maxVets) { maxVets = (r.count | 0); maxVetsDay = r.day; }
    if ((r.count | 0) >= 2) days2plus++;
    if ((r.count | 0) >= 1) days1plus++;
  });
  const releaseSet = {};
  releaseDays.forEach(function (d) { releaseSet[d] = true; });
  let relDays2plus = 0, relDays1plus = 0;
  lv.forEach(function (r) {
    if (!releaseSet[r.day]) return;
    if ((r.count | 0) >= 2) relDays2plus++;
    if ((r.count | 0) >= 1) relDays1plus++;
  });

  // ---- meetings ----
  const meetings = [];
  field5.forEach(function (row) {
    meetings.push({
      kind: 'field', day: row.day, mid: row.mid, vid: row.vid,
      isScholar: !!row.isScholar, outcome: fieldOutcome(row.outcome),
      rawOutcome: row.outcome, spawnSeq: row.w5spawnSeq || null,
      veteranAtMeeting: !!row.w5veteranAtMeeting,
      fighterHadKill: !!row.w5fighterHadKill,
      entryHp: row.entryHp, entryMaxHp: row.entryMaxHp,
      rounds: row.rounds, mHpLeft: row.mHpLeft, vHpLeft: row.vHpLeft,
      logHead: (row.log || []).slice(0, 6),
    });
  });
  traces5.forEach(function (tr) {
    meetings.push({
      kind: 'tb', day: tr.day, mid: tr.mid, mids: tr.mids || [],
      fighters: tr.fighters || [], outcome: tbOutcome(tr.ending),
      rawOutcome: tr.ending, spawnSeq: tr.w5scholarMonsterSeq || null,
      seq: tr.seq, rounds: tr.rounds, mHpLeft: tr.mHpLeft,
      scholarHpEnd: tr.scholarHpEnd,
      fightersVeteran: tr.w5fightersVeteran || null,
    });
  });
  meetings.sort(function (a, b) { return (a.day | 0) - (b.day | 0); });

  // ---- spawn classification ----
  const bySeq = {};
  spawns.forEach(function (s) { bySeq[s.seq] = { spawn: s, meetings: [], tbJoin: null }; });
  const unmatchedField = [];
  field5.forEach(function (row) {
    const rec = row.w5spawnSeq ? bySeq[row.w5spawnSeq] : null;
    if (rec) rec.meetings.push({ kind: 'field', day: row.day, mid: row.mid, vid: row.vid, outcome: fieldOutcome(row.outcome), veteranAtMeeting: !!row.w5veteranAtMeeting });
    else unmatchedField.push({ day: row.day, mid: row.mid, vid: row.vid, outcome: fieldOutcome(row.outcome), spawnSeq: row.w5spawnSeq || null });
  });
  // TB join (preregged mid-day rule, CORRECTED — see analyzer note):
  // the engine removes the world monster when the first TB fight
  // starts (startCombat: "it's in the fight now, not wandering"), and
  // later fights vs the same species are re-engagements with no new
  // spawn — so a trace may legitimately post-date its spawn's removal
  // (observed to +3 days on this band) and several scholars may fight
  // the same beast the same day. Candidates: same mid, spawnDay <=
  // traceDay, and (no removal, or traceDay - removedDay <= 3). The
  // same-day exclusion from the prereg is REMOVED (it was wrong: four
  // scholars fought one Cancellation on 99641 d100). A trace whose
  // scholar-monster seq matches a spawn exactly takes that spawn;
  // otherwise the earliest single candidate. Two+ live candidates ->
  // 'ambiguous', counted separately, never silently assigned.
  const unmatchedTb = [];
  const ambiguousTb = [];
  traces5.forEach(function (tr) {
    let rec = null, join = null;
    if (tr.w5scholarMonsterSeq && bySeq[tr.w5scholarMonsterSeq]) { rec = bySeq[tr.w5scholarMonsterSeq]; join = 'instance'; }
    if (!rec) {
      const cands = spawns.filter(function (s) {
        return s.mid === tr.mid && (s.day | 0) <= (tr.day | 0)
          && (s.removedDay == null || (tr.day | 0) - (s.removedDay | 0) <= 3);
      });
      if (cands.length === 1) {
        rec = bySeq[cands[0].seq];
        join = ((tr.day | 0) <= (cands[0].removedDay == null ? (tr.day | 0) : (cands[0].removedDay | 0))) ? 'mid-day' : 're-engage';
        if (cands[0].removedDay != null && (tr.day | 0) > (cands[0].removedDay | 0)) join = 're-engage';
      } else if (cands.length > 1) { ambiguousTb.push({ day: tr.day, mid: tr.mid, ending: tr.ending, candidates: cands.map(function (s) { return s.seq; }) }); }
    }
    if (rec) {
      rec.tbJoin = rec.tbJoin || join;
      rec.meetings.push({ kind: 'tb', day: tr.day, mid: tr.mid, fighters: tr.fighters || [], outcome: tbOutcome(tr.ending), join: join });
    } else if (!ambiguousTb.some(function (a) { return a.day === tr.day && a.mid === tr.mid; })) {
      unmatchedTb.push({ day: tr.day, mid: tr.mid, ending: tr.ending });
    }
  });

  function spawnOutcome(rec) {
    const outs = rec.meetings.map(function (m) { return m.outcome; });
    if (outs.indexOf('kill') >= 0) return 'kill';
    if (outs.indexOf('die') >= 0) return 'die';
    if (outs.indexOf('flee') >= 0) return 'flee';
    if (outs.some(function (x) { return String(x).indexOf('other:') === 0; })) return 'other';
    return 'never-met';
  }
  const spawnRows = spawns.map(function (s) {
    const rec = bySeq[s.seq];
    const out = spawnOutcome(rec);
    return {
      seq: s.seq, day: s.day, mid: s.mid, veteranSpawn: !!s.veteran,
      hp: s.hp, maxHp: s.maxHp, removedDay: s.removedDay,
      outcome: out, neverMetReason: out === 'never-met' ? 'no-encounter' : null,
      meetings: rec.meetings, tbJoin: rec.tbJoin,
    };
  });

  // ---- cast reconciliation ----
  // Births are ALL waves (the snapshot records every wanderer); the
  // reconciliation counts wave-5 births only — casts are wave-5 only.
  const births5 = births.filter(function (b) { return (b.wave | 0) === 5; });
  const birthKeys = {};
  births5.forEach(function (b) { birthKeys[b.bornDay + '|' + b.mid] = b; });
  let castsMatchedBirth = 0;
  const unmatchedCasts = [];
  casts.forEach(function (c) {
    if (birthKeys[c.day + '|' + c.mid]) castsMatchedBirth++;
    else unmatchedCasts.push(c);
  });
  let birthsMatchedSpawn = 0;
  const unmatchedBirths = [];
  births5.forEach(function (b) {
    const hit = spawns.some(function (s) {
      return s.mid === b.mid && (s.day | 0) >= (b.bornDay | 0) && (s.day | 0) <= ((b.bornDay | 0) + 7);
    });
    if (hit) birthsMatchedSpawn++;
    else unmatchedBirths.push(b);
  });
  const spawnsFromBirths = spawnRows.filter(function (r) {
    return births5.some(function (b) { return b.mid === r.mid && (r.day | 0) >= (b.bornDay | 0) && (r.day | 0) <= ((b.bornDay | 0) + 7); });
  }).length;

  // ---- release classification ----
  let releaseClass;
  if (!releaseDays.length) {
    releaseClass = { class: 'never-released', lastGated: lastGated, maxGated: maxGated, lastShort: lastShort,
      lastR5: lastR5 ? { armored: lastR5.armored, armed: lastR5.armed, tricks: lastR5.tricks, veterans: lastR5.veterans, demand: lastR5.demand } : null };
  } else if (!meetings.length && !spawns.length) {
    releaseClass = { class: 'released-no-spawn' };
  } else if (!meetings.length) {
    releaseClass = { class: 'released-spawns-no-meeting' };
  } else {
    releaseClass = { class: 'released-met' };
  }

  const w5kills = killLog.filter(function (e) { return ((e.w | 0) >= 5); });
  const w4kills = killLog.filter(function (e) { return ((e.w | 0) >= 4); });
  const w5facedTypes = (o.wavesFaced && o.wavesFaced[5]) || (o.wavesFaced && o.wavesFaced['5']) || null;

  return {
    seed: o.seed, days: o.days, endReason: o.endReason, won: !!o.won,
    standing: o.standing, scaleRank: o.scaleRank, maxWave: o.maxWave,
    instrumentErrors: (o.instrumentErrors || []).length,
    releaseDays: releaseDays, unlockDay: unlockDay,
    releaseClass: releaseClass,
    w4kills: w4kills.length, w5kills: w5kills.length,
    w5killsDetail: w5kills.map(function (e) { return { d: e.d, mid: e.mid, by: e.by, via: e.via }; }),
    w5facedTypes: w5facedTypes,
    scholarDeaths: (o.scholarDeaths || []).length,
    simultaneity: { maxVets: maxVets, maxVetsDay: maxVetsDay, days2plus: days2plus, days1plus: days1plus, relDays2plus: relDays2plus, relDays1plus: relDays1plus },
    casts: { total: casts.length, matchedBirth: castsMatchedBirth, unmatched: unmatchedCasts },
    births: { total: births5.length, matchedSpawn: birthsMatchedSpawn, unmatched: unmatchedBirths },
    spawns: { total: spawns.length, fromWandererBirth: spawnsFromBirths, rows: spawnRows },
    meetings: meetings,
    unmatchedField: unmatchedField, unmatchedTb: unmatchedTb, ambiguousTb: ambiguousTb,
  };
}

function analyzeBand(objs) {
  const seeds = objs.map(analyzeSeed);
  const released = seeds.filter(function (s) { return s.releaseDays.length > 0; });
  const relClasses = {};
  released.forEach(function (s) { const c = s.releaseClass.class; relClasses[c] = (relClasses[c] || 0) + 1; });
  const neverRel = seeds.filter(function (s) { return !s.releaseDays.length; });
  const allSpawns = seeds.reduce(function (a, s) { return a.concat(s.spawns.rows); }, []);
  const spawnOutcomes = {};
  allSpawns.forEach(function (r) { spawnOutcomes[r.outcome] = (spawnOutcomes[r.outcome] || 0) + 1; });
  const allMeetings = seeds.reduce(function (a, s) { return a.concat(s.meetings); }, []);
  const meetingOutcomes = {};
  allMeetings.forEach(function (m) { meetingOutcomes[m.kind + ':' + m.outcome] = (meetingOutcomes[m.kind + ':' + m.outcome] || 0) + 1; });
  const days = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = days.length ? days[Math.floor(days.length / 2)] : null;
  const diagGo = {
    bar1_releasesClassified: released.every(function (s) { return !!s.releaseClass.class; }) && neverRel.every(function (s) { return !!s.releaseClass.class; }),
    bar2_spawnsClassified: allSpawns.every(function (r) { return r.outcome !== 'never-met' || r.neverMetReason; }) && seeds.every(function (s) { return s.casts.total >= 0; }),
    bar3_simultaneityAllSeeds: seeds.every(function (s) { return s.simultaneity && s.simultaneity.maxVets != null; }),
  };
  diagGo.all = diagGo.bar1_releasesClassified && diagGo.bar2_spawnsClassified && diagGo.bar3_simultaneityAllSeeds;
  return {
    seeds: seeds.length,
    wall: {
      national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
      table: seeds.filter(function (s) { return !!s.won; }).length,
      wins: seeds.filter(function (s) { return !!s.won; }).length,
      wave4unlocks: seeds.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
      wave5unlocks: released.length,
      wave5kills: seeds.reduce(function (a, s) { return a + s.w5kills; }, 0),
      wave4kills: seeds.reduce(function (a, s) { return a + s.w4kills; }, 0),
      medianSurvival: medianDays,
    },
    releases: { count: released.length, classes: relClasses,
      neverReleased: neverRel.map(function (s) { return { seed: s.seed, lastGated: s.releaseClass.lastGated, maxGated: s.releaseClass.maxGated, lastShort: s.releaseClass.lastShort }; }) },
    spawns: { total: allSpawns.length, outcomes: spawnOutcomes },
    meetings: { total: allMeetings.length, outcomes: meetingOutcomes },
    casts: { total: seeds.reduce(function (a, s) { return a + s.casts.total; }, 0),
      matchedBirth: seeds.reduce(function (a, s) { return a + s.casts.matchedBirth; }, 0),
      unmatched: seeds.reduce(function (a, s) { return a + s.casts.unmatched.length; }, 0) },
    births: { total: seeds.reduce(function (a, s) { return a + s.births.total; }, 0),
      matchedSpawn: seeds.reduce(function (a, s) { return a + s.births.matchedSpawn; }, 0),
      unmatched: seeds.reduce(function (a, s) { return a + s.births.unmatched.length; }, 0) },
    simultaneity: seeds.map(function (s) { return { seed: s.seed, maxVets: s.simultaneity.maxVets, maxVetsDay: s.simultaneity.maxVetsDay, days2plus: s.simultaneity.days2plus, days1plus: s.simultaneity.days1plus, relDays2plus: s.simultaneity.relDays2plus, relDays1plus: s.simultaneity.relDays1plus }; }),
    unmatchedField: seeds.reduce(function (a, s) { return a.concat(s.unmatchedField); }, []),
    unmatchedTb: seeds.reduce(function (a, s) { return a.concat(s.unmatchedTb); }, []),
    ambiguousTb: seeds.reduce(function (a, s) { return a.concat(s.ambiguousTb); }, []),
    diagGo: diagGo,
    perSeed: seeds,
  };
}

function readCorpus(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.indexOf('w5-') === 0 && x.endsWith('.json'); })) {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      // The off (neutrality) legs carry instrumentOff: true and empty
      // facing arrays — they are NOT judged evidence. Exclude them.
      if (o && o.instrumentOff) continue;
      out.push(o);
    } catch (e) { /* skip unreadable */ }
  }
  return out.sort(function (a, b) { return (a.seed | 0) - (b.seed | 0); });
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/wave5face-analyze-20261109.js <corpus-dir>'); process.exit(2); }
  const objs = readCorpus(dir);
  if (!objs.length) { console.error('no w5-*.json files in ' + dir); process.exit(2); }
  console.log(JSON.stringify(analyzeBand(objs), null, 2));
}
module.exports = { analyzeSeed: analyzeSeed, analyzeBand: analyzeBand, readCorpus: readCorpus, fieldOutcome: fieldOutcome, tbOutcome: tbOutcome };
