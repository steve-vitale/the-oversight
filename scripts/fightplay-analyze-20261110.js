// fightplay-analyze-20261110.js — analyzer for the fight-play census
// (arm sim-fightplay-b). Pure function over fightplay-driver per-seed
// JSONs. No src/js, no RNG. Deterministic: same corpus -> same output.
//   node scripts/fightplay-analyze-20261110.js <perseed-dir> [run]
// Prints a JSON summary: grounded/conjured fight accounting, party size,
// ability uses, flee/engage vs knowledge, trick use, ammo, wall numbers.
//
// Definitions (from the prereg):
// - AGENCY fight = channel 'field' + cls 'other' (expeditionMonster path).
// - CONJURED agency fight = seq == null (never registered by the
//   spawnWorldMonster wrapper). On current master every agency fight is
//   conjured by construction (fieldFight(vid, m, null, ...)).
// - REAL (grounded) wild fight = field fight with seq != null, excluding
//   psycho_* rows (person-vs-person, corruption.js) and excluding
//   contest/feast/trap channels (staged/social, not wild).
// - An agency kill (waveKillLog via 'agency') is GROUNDED iff a same-day /
//   same-fighter / same-kind vKill fight row carries a spawn seq;
//   CONJURED if all matching rows are seq-null; UNMATCHED if no fight
//   row matches at all (reported separately, never silently grounded).
'use strict';
const fs = require('fs');
const path = require('path');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function bump(obj, k, n) { obj[k] = (obj[k] || 0) + (n == null ? 1 : n); }

function isPsycho(f) {
  return f && typeof f.mid === 'string' && f.mid.indexOf('psycho_') === 0;
}
function isGroundedWild(f) {
  return f && f.channel === 'field' && f.seq != null && !isPsycho(f)
    && f.cls !== 'contest' && f.cls !== 'feast' && f.cls !== 'trap';
}
function isAgency(f) {
  return f && f.channel === 'field' && f.cls === 'other';
}

function analyzeSeed(row) {
  const fights = row.fights || [];
  const kills = row.waveKillLog || [];
  const spawns = row.spawns || [];
  const daily = row.daily || [];
  const fallen = row.fallen || [];
  const gates = row.gateCalls || [];

  const fieldFights = fights.filter(function (f) { return f.channel === 'field'; });
  const grounded = fieldFights.filter(isGroundedWild);
  const agencyFights = fieldFights.filter(isAgency);
  const conjuredAgency = agencyFights.filter(function (f) { return f.seq == null; });
  const groundedAgency = agencyFights.filter(function (f) { return f.seq != null; });
  const psychoFights = fieldFights.filter(isPsycho);
  const playerTb = fights.filter(function (f) { return f.channel === 'player-tb'; });
  const contestFights = fieldFights.filter(function (f) { return f.cls === 'contest'; });

  // Kill linkage (adapted from conjurefix-analyze-20261110.js).
  let agencyKills = 0, groundedKills = 0, conjuredKills = 0, unmatchedKills = 0;
  const agencyKillDetail = [];
  kills.forEach(function (k) {
    if (!k || k.via !== 'agency') return;
    agencyKills++;
    const matches = fights.filter(function (f) {
      return f.channel === 'field' && f.cls === 'other' && f.outcome === 'vKill'
        && f.day === k.d && f.fighter === k.by && f.mid === k.mid;
    });
    let status;
    if (!matches.length) { unmatchedKills++; status = 'unmatched'; }
    else if (matches.some(function (f) { return f.seq != null; })) { groundedKills++; status = 'grounded'; }
    else { conjuredKills++; status = 'conjured'; }
    agencyKillDetail.push({ d: k.d, mid: k.mid, w: k.w, by: k.by, status: status });
  });

  // Party size at fight start (grounded wild fights only).
  const partySizeDist = {};
  grounded.forEach(function (f) { bump(partySizeDist, String(f.partySize == null ? 'null' : f.partySize)); });
  const partyByWave = {};
  grounded.forEach(function (f) {
    const w = 'w' + ((f.wave | 0) || 0);
    partyByWave[w] = partyByWave[w] || { fights: 0, partySum: 0, solo: 0 };
    partyByWave[w].fights++;
    if (f.partySize != null) partyByWave[w].partySum += f.partySize;
    if (f.partySize === 1) partyByWave[w].solo++;
  });
  Object.keys(partyByWave).forEach(function (w) {
    const p = partyByWave[w];
    p.meanParty = p.fights ? +(p.partySum / p.fights).toFixed(2) : null;
  });

  // Ability uses per fight, by villager (leader's rec.ffFired only — the
  // engine records no per-ally firing list; see unmeasurable note).
  const abilityUses = {};
  const abilityByFighter = {};
  let fightsWithAbility = 0;
  grounded.forEach(function (f) {
    const ids = (f.ffFired || []).slice();
    if (ids.length) fightsWithAbility++;
    ids.forEach(function (id) {
      bump(abilityUses, id);
      abilityByFighter[f.fighter] = abilityByFighter[f.fighter] || {};
      bump(abilityByFighter[f.fighter], id);
    });
  });
  const abilityUsesTotal = Object.keys(abilityUses).reduce(function (a, k) { return a + abilityUses[k]; }, 0);
  // Per-round ability firings (roundsDetail abilities).
  let roundsWithAbility = 0, roundsTotal = 0;
  grounded.forEach(function (f) {
    (f.abilitiesByRound || []).forEach(function (abs) {
      roundsTotal++;
      if (abs && abs.length) roundsWithAbility++;
    });
  });

  // Flee / engage vs knowledge. Four decision points.
  const gateResults = { avoid: 0, seek: 0, null: 0 };
  const gateByTrick = {};
  gates.forEach(function (g) {
    bump(gateResults, g.result == null ? 'null' : g.result);
    // The gate itself does not record trick-known; join offline is by
    // gateSeq on the fight row, so gate rows are reported raw here and
    // the fight-side cross-tabs below carry the knowledge columns.
    void gateByTrick;
  });
  // Fight-side cross-tabs: every grounded fight carries trickKnown /
  // foughtBefore captured at entry. Evade rows are fights too (the
  // awareness decision), so they join the same tabs.
  function tabulate(list, keyFn) {
    const out = {};
    list.forEach(function (f) {
      const k = keyFn(f);
      out[k] = out[k] || { fights: 0, evade: 0, vKill: 0, mFlee: 0, vFlee: 0, vDie: 0, other: 0 };
      out[k].fights++;
      const o = f.outcome || 'null';
      if (out[k][o] != null) out[k][o]++; else out[k].other++;
    });
    return out;
  }
  const byTrickKnown = tabulate(grounded, function (f) { return 'trickKnown=' + String(f.trickKnown); });
  const byFoughtBefore = tabulate(grounded, function (f) { return 'foughtBefore=' + String(f.foughtBefore); });
  const byIntent = tabulate(grounded, function (f) { return 'intent=' + String(f.intent); });
  const intentCounts = {};
  grounded.forEach(function (f) { bump(intentCounts, String(f.intent) + '/' + String(f.intentWhy)); });
  // Gate outcome joined to fights: fights whose gateSeq names a gate call.
  // CAUTION: the gate fires ONLY inside expeditionMonster, immediately
  // before a (conjured) agency fight. A grounded fight's gateSeq is a
  // STALE join (the last gate call for that vid, from an earlier
  // expedition meeting) and must NOT be read as that fight's gate. The
  // valid fight-side join is gateJoinedAgency (agency fights only);
  // gateJoined (grounded) is reported for completeness and must be
  // interpreted as stale.
  const gateBySeq = {};
  gates.forEach(function (g) { gateBySeq[g.gateSeq] = g; });
  const gateJoined = { avoid: 0, seek: 0, nullGate: 0, noGate: 0 };
  const gateJoinedOutcomes = {};
  grounded.forEach(function (f) {
    let gr = 'noGate';
    if (f.gateSeq != null && gateBySeq[f.gateSeq]) gr = gateBySeq[f.gateSeq].result == null ? 'nullGate' : gateBySeq[f.gateSeq].result;
    bump(gateJoined, gr);
    gateJoinedOutcomes[gr] = gateJoinedOutcomes[gr] || {};
    bump(gateJoinedOutcomes[gr], String(f.outcome));
  });
  const gateJoinedAgency = { avoid: 0, seek: 0, nullGate: 0, noGate: 0 };
  const gateJoinedAgencyOutcomes = {};
  agencyFights.forEach(function (f) {
    let gr = 'noGate';
    if (f.gateSeq != null && gateBySeq[f.gateSeq]) gr = gateBySeq[f.gateSeq].result == null ? 'nullGate' : gateBySeq[f.gateSeq].result;
    bump(gateJoinedAgency, gr);
    gateJoinedAgencyOutcomes[gr] = gateJoinedAgencyOutcomes[gr] || {};
    bump(gateJoinedAgencyOutcomes[gr], String(f.outcome));
  });

  // Outcome by party size x wave (grounded) — the table the party-size
  // build's prereg needs: what size actually fights wave-4/5.
  const outcomeByPartyWave = {};
  grounded.forEach(function (f) {
    const k = 'w' + ((f.wave | 0) || 0) + '/party' + String(f.partySize == null ? 'null' : f.partySize);
    outcomeByPartyWave[k] = outcomeByPartyWave[k] || { fights: 0, evade: 0, vKill: 0, mFlee: 0, vFlee: 0, vDie: 0, other: 0 };
    outcomeByPartyWave[k].fights++;
    const o = f.outcome || 'null';
    if (outcomeByPartyWave[k][o] != null) outcomeByPartyWave[k][o]++; else outcomeByPartyWave[k].other++;
  });

  // Trick use.
  const trickUses = {};
  let trickKnownFights = 0, trickKnownNoExec = 0;
  grounded.forEach(function (f) {
    (f.trickLog || []).forEach(function (t) { bump(trickUses, String(t)); });
    if (f.trickKnown === true) {
      trickKnownFights++;
      if (!(f.trickLog && f.trickLog.length)) trickKnownNoExec++;
    }
  });
  const trickUsesTotal = Object.keys(trickUses).reduce(function (a, k) { return a + trickUses[k]; }, 0);

  // Ammo pocketed / used.
  let ammoPocketedSum = 0, ammoPocketedN = 0, ammoSpentSum = 0, ammoSpentN = 0;
  const ammoReasons = {};
  let volleyFights = 0, volleyHits = 0, volleyShots = 0, volleyDmg = 0;
  grounded.forEach(function (f) {
    if (typeof f.ammoBefore === 'number') { ammoPocketedSum += f.ammoBefore; ammoPocketedN++; }
    if (f.ammoBeforeReason) bump(ammoReasons, f.ammoBeforeReason);
    if (typeof f.ammoSpent === 'number') { ammoSpentSum += f.ammoSpent; ammoSpentN++; }
    if (f.volley) {
      volleyFights++;
      volleyShots += (f.volley.shots | 0);
      volleyHits += (f.volley.hits | 0);
      volleyDmg += (f.volley.dmg | 0);
    }
  });

  // Outcomes + waves on grounded fights.
  const groundedOutcomes = {};
  grounded.forEach(function (f) { bump(groundedOutcomes, String(f.outcome)); });
  const groundedByWave = {};
  grounded.forEach(function (f) { bump(groundedByWave, 'w' + ((f.wave | 0) || 0)); });
  const groundedFightKills = grounded.filter(function (f) { return f.outcome === 'vKill'; }).length;
  const groundedRounds = grounded.map(function (f) { return f.rounds; }).filter(function (x) { return typeof x === 'number'; });

  const killsByWave = {};
  const killsByVia = {};
  kills.forEach(function (k) {
    if (!k) return;
    bump(killsByWave, 'w' + ((k.w | 0) || 0));
    bump(killsByVia, k.via || 'unknown');
  });
  const spawnWaveTotals = {};
  const spawnSourceTotals = {};
  spawns.forEach(function (s) {
    if (!s) return;
    bump(spawnWaveTotals, 'w' + ((s.wave | 0) || 0));
    bump(spawnSourceTotals, s.source || 'unknown');
  });
  let villageDays = 0;
  daily.forEach(function (d) { villageDays += (d && d.living) || 0; });
  const starvationDeaths = fallen.filter(function (f) {
    return f && typeof f.cause === 'string' && /starv/i.test(f.cause);
  }).length;
  const deathCauses = {};
  fallen.forEach(function (f) { bump(deathCauses, (f && f.cause) || 'unknown'); });

  return {
    seed: row.seed, days: row.days, gameDays: row.gameDays || null,
    endReason: row.endReason || null, won: !!row.won, villageLost: !!row.villageLost,
    scaleRank: row.scaleRank || null, unlockedWave: row.unlockedWave || null,
    maxWave: row.maxWave || null, standing: row.standing || null,
    fightsTotal: fights.length, fieldFights: fieldFights.length,
    playerTb: playerTb.length, contestFights: contestFights.length,
    psychoFights: psychoFights.length,
    agencyFights: agencyFights.length, conjuredAgency: conjuredAgency.length,
    groundedAgency: groundedAgency.length,
    groundedWild: grounded.length, groundedOutcomes: groundedOutcomes,
    groundedByWave: groundedByWave, groundedKills: groundedFightKills,
    medianGroundedRounds: median(groundedRounds),
    partySizeDist: partySizeDist, partyByWave: partyByWave,
    abilityUses: abilityUses, abilityUsesTotal: abilityUsesTotal,
    abilityByFighter: abilityByFighter, fightsWithAbility: fightsWithAbility,
    roundsWithAbility: roundsWithAbility, roundsTotal: roundsTotal,
    gateResults: gateResults, gateCalls: gates.length,
    gateJoined: gateJoined, gateJoinedOutcomes: gateJoinedOutcomes,
    gateJoinedAgency: gateJoinedAgency, gateJoinedAgencyOutcomes: gateJoinedAgencyOutcomes,
    outcomeByPartyWave: outcomeByPartyWave,
    byTrickKnown: byTrickKnown, byFoughtBefore: byFoughtBefore,
    byIntent: byIntent, intentCounts: intentCounts,
    trickUses: trickUses, trickUsesTotal: trickUsesTotal,
    trickKnownFights: trickKnownFights, trickKnownNoExec: trickKnownNoExec,
    ammoPocketedSum: ammoPocketedSum, ammoPocketedN: ammoPocketedN,
    ammoPocketedMean: ammoPocketedN ? +(ammoPocketedSum / ammoPocketedN).toFixed(2) : null,
    ammoSpentSum: ammoSpentSum, ammoSpentN: ammoSpentN, ammoReasons: ammoReasons,
    volleyFights: volleyFights, volleyShots: volleyShots, volleyHits: volleyHits,
    volleyDmg: volleyDmg,
    volleyHitRate: volleyShots ? +(volleyHits / volleyShots).toFixed(3) : null,
    agencyKills: agencyKills, groundedKillsAgency: groundedKills,
    conjuredKills: conjuredKills, unmatchedKills: unmatchedKills,
    agencyKillDetail: agencyKillDetail,
    killsTotal: kills.length, killsByWave: killsByWave, killsByVia: killsByVia,
    spawnsTotal: spawns.length, spawnWaveTotals: spawnWaveTotals,
    spawnSourceTotals: spawnSourceTotals,
    fallenTotal: fallen.length, starvationDeaths: starvationDeaths,
    deathCauses: deathCauses,
    villageDays: villageDays,
    deathsPer100VillageDays: villageDays ? +(fallen.length / villageDays * 100).toFixed(2) : null,
    instrumentErrors: (row.instrumentErrors || []).length,
    instrumentErrorList: (row.instrumentErrors || []).slice(0, 10),
  };
}

function analyzeDir(dir, run) {
  const files = fs.readdirSync(dir)
    .filter(function (f) { return f.endsWith('.json'); })
    .sort();
  const perSeed = [];
  files.forEach(function (f) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (run && row.run !== run) return;
    perSeed.push(analyzeSeed(row));
  });
  const sum = function (k) { return perSeed.reduce(function (a, s) { return a + (s[k] || 0); }, 0); };
  const mergeCounts = function (k) {
    const out = {};
    perSeed.forEach(function (s) {
      const o = s[k] || {};
      Object.keys(o).forEach(function (kk) { out[kk] = (out[kk] || 0) + o[kk]; });
    });
    return out;
  };
  const days = perSeed.map(function (s) { return s.days; });
  return {
    seeds: perSeed.length,
    perSeed: perSeed,
    fightsTotal: sum('fightsTotal'),
    fieldFights: sum('fieldFights'),
    playerTb: sum('playerTb'),
    contestFights: sum('contestFights'),
    psychoFights: sum('psychoFights'),
    agencyFights: sum('agencyFights'),
    conjuredAgency: sum('conjuredAgency'),
    groundedAgency: sum('groundedAgency'),
    groundedWild: sum('groundedWild'),
    groundedOutcomes: mergeCounts('groundedOutcomes'),
    groundedByWave: mergeCounts('groundedByWave'),
    groundedKills: sum('groundedKills'),
    partySizeDist: mergeCounts('partySizeDist'),
    abilityUses: mergeCounts('abilityUses'),
    abilityUsesTotal: sum('abilityUsesTotal'),
    fightsWithAbility: sum('fightsWithAbility'),
    roundsWithAbility: sum('roundsWithAbility'),
    roundsTotal: sum('roundsTotal'),
    gateResults: mergeCounts('gateResults'),
    gateCalls: sum('gateCalls'),
    gateJoined: mergeCounts('gateJoined'),
    gateJoinedAgency: mergeCounts('gateJoinedAgency'),
    outcomeByPartyWave: perSeed.reduce(function (acc, s) {
      Object.keys(s.outcomeByPartyWave).forEach(function (k) {
        acc[k] = acc[k] || { fights: 0, evade: 0, vKill: 0, mFlee: 0, vFlee: 0, vDie: 0, other: 0 };
        Object.keys(s.outcomeByPartyWave[k]).forEach(function (kk) { acc[k][kk] += s.outcomeByPartyWave[k][kk]; });
      });
      return acc;
    }, {}),
    byTrickKnown: perSeed.reduce(function (acc, s) {
      Object.keys(s.byTrickKnown).forEach(function (k) {
        acc[k] = acc[k] || { fights: 0, evade: 0, vKill: 0, mFlee: 0, vFlee: 0, vDie: 0, other: 0 };
        Object.keys(s.byTrickKnown[k]).forEach(function (kk) { acc[k][kk] += s.byTrickKnown[k][kk]; });
      });
      return acc;
    }, {}),
    byFoughtBefore: perSeed.reduce(function (acc, s) {
      Object.keys(s.byFoughtBefore).forEach(function (k) {
        acc[k] = acc[k] || { fights: 0, evade: 0, vKill: 0, mFlee: 0, vFlee: 0, vDie: 0, other: 0 };
        Object.keys(s.byFoughtBefore[k]).forEach(function (kk) { acc[k][kk] += s.byFoughtBefore[k][kk]; });
      });
      return acc;
    }, {}),
    byIntent: perSeed.reduce(function (acc, s) {
      Object.keys(s.byIntent).forEach(function (k) {
        acc[k] = acc[k] || { fights: 0, evade: 0, vKill: 0, mFlee: 0, vFlee: 0, vDie: 0, other: 0 };
        Object.keys(s.byIntent[k]).forEach(function (kk) { acc[k][kk] += s.byIntent[k][kk]; });
      });
      return acc;
    }, {}),
    intentCounts: mergeCounts('intentCounts'),
    trickUses: mergeCounts('trickUses'),
    trickUsesTotal: sum('trickUsesTotal'),
    trickKnownFights: sum('trickKnownFights'),
    trickKnownNoExec: sum('trickKnownNoExec'),
    ammoPocketedSum: sum('ammoPocketedSum'),
    ammoPocketedN: sum('ammoPocketedN'),
    ammoSpentSum: sum('ammoSpentSum'),
    ammoReasons: mergeCounts('ammoReasons'),
    volleyFights: sum('volleyFights'),
    volleyShots: sum('volleyShots'),
    volleyHits: sum('volleyHits'),
    volleyDmg: sum('volleyDmg'),
    agencyKills: sum('agencyKills'),
    groundedKillsAgency: sum('groundedKillsAgency'),
    conjuredKills: sum('conjuredKills'),
    unmatchedKills: sum('unmatchedKills'),
    killsTotal: sum('killsTotal'),
    killsByWave: mergeCounts('killsByWave'),
    killsByVia: mergeCounts('killsByVia'),
    spawnsTotal: sum('spawnsTotal'),
    fallenTotal: sum('fallenTotal'),
    starvationDeaths: sum('starvationDeaths'),
    deathCauses: mergeCounts('deathCauses'),
    villageDays: sum('villageDays'),
    medianSurvival: median(days),
    maxSurvival: days.length ? Math.max.apply(null, days) : null,
    national: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: perSeed.filter(function (s) { return !!s.won; }).length,
    wins: perSeed.filter(function (s) { return !!s.won; }).length,
    w4unlocked: perSeed.filter(function (s) { return (s.unlockedWave | 0) >= 4; }).length,
    w5unlocked: perSeed.filter(function (s) { return (s.unlockedWave | 0) >= 5; }).length,
    instrumentErrors: sum('instrumentErrors'),
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const run = process.argv[3] || null;
  if (!dir) { console.error('Usage: node scripts/fightplay-analyze-20261110.js <perseed-dir> [run]'); process.exit(2); }
  const out = analyzeDir(dir, run);
  console.log(JSON.stringify(out, null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, isGroundedWild: isGroundedWild, isPsycho: isPsycho };
