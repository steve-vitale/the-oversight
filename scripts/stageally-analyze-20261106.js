// stageally-analyze-20261106.js — companion-staging + rally analyzer
// (arm sim-stageally-a). Pure function over corpus JSON; no game reads,
// no re-scoring. Reuses bankkiller-analyze-20261105 by require
// (perSeedExtra / legSummary — the killerdeath classification underneath)
// and adds staging splits + the prereg's GO/NO-GO/THIN verdict.
//
// VERDICT (prereg-binding, judged here, never re-scored):
//   THIN  — T1: armed-leg rally fires < 8 (rally half unmeasured), OR T2:
//           allies present in < 40% of armed-leg wave-4+ TB fights when
//           the armed leg has >= 10 such fights (staging half unmeasured).
//           THIN is NOT a NO-GO; the next run re-designs the trigger.
//   GO    — primary: armed leg banks a living pair (≥ 1 daily engine
//           snapshot day with readiness5.veterans ≥ 2) on ≥ 1 seed, OR
//           post-first-blood wave-4 kills ≥ 3 on the armed leg — AND the
//           survival guard holds.
//   NO-GO — anything else, or a failed guard even if the primary holds.
// Guardrail: G-survival — armed median survival ≥ baseline median − 10d.
//
// TB SURVIVAL (fight-level, NEW in this arm): bankkiller's day-join TB
// survival secondary was INVALID (26 deaths / 25 fights — the join
// overcounts). Here TB survival comes from the instrument's tbEnd rows:
// fights ending without a scholar death IN THAT FIGHT. The day-join
// numbers are still computed (bankkiller perSeedExtra) and kept under
// tbSurvivalDayJoin for cross-check, clearly labeled — never cited as
// the survival measure.
// Usage: node scripts/stageally-analyze-20261106.js <per-seed-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');
const BK = require('./bankkiller-analyze-20261105');
const KD = require('./killerdeath-analyze-20261105');

function stagingExtra(row) {
  const tb = (row.tbFights || []).filter(function (f) { return (f.wave | 0) >= 4; });
  const withAlly = tb.filter(function (f) { return (f.alliesAtEntry | 0) >= 1; }).length;
  const withParty = tb.filter(function (f) { return (f.partyAtEntry | 0) >= 1; }).length;
  const diedInFight = tb.filter(function (f) { return !!f.scholarDiedInFight; }).length;
  const outcomes = {};
  tb.forEach(function (f) { const o = f.outcome == null ? 'unfinished' : f.outcome; outcomes[o] = (outcomes[o] | 0) + 1; });
  const daily = row.daily || [];
  const partyDays1 = daily.filter(function (d) { return (d.partySize | 0) >= 1; }).length;
  const partyDays2 = daily.filter(function (d) { return (d.partySize | 0) >= 2; }).length;
  const gateDays = daily.filter(function (d) { return (d.rawStanding != null && d.rawStanding >= 75) || (d.unlockedWaveSnap | 0) >= 4; }).length;
  const ss = row.stageallyStats || {};
  return {
    tbFightsW4: tb.length,
    tbFightsW4WithAlly: withAlly,
    tbFightsW4WithParty: withParty,
    allyPresence: tb.length ? withAlly / tb.length : null,
    partyPresence: tb.length ? withParty / tb.length : null,
    tbDeathsInFight: diedInFight,
    tbSurvivalFightLevel: tb.length ? (tb.length - diedInFight) / tb.length : null,
    tbOutcomes: outcomes,
    partyDays1: partyDays1, partyDays2: partyDays2, gateDays: gateDays,
    invites: ss.invites != null ? ss.invites : null,
    invitesAccepted: ss.accepted != null ? ss.accepted : null,
    invitesDeclined: ss.declined != null ? ss.declined : null,
    invitesNotOffered: ss.notOffered != null ? ss.notOffered : null,
    inviteErrors: ss.errors != null ? ss.errors : null,
    inviteQuestionsAnswered: ss.answered != null ? ss.answered : null,
    pendingW4: ss.pendingW4 != null ? ss.pendingW4 : null,
    pendingW4Staged: ss.pendingW4Staged != null ? ss.pendingW4Staged : null,
    pendingStagedShare: (ss.pendingW4 != null && ss.pendingW4 > 0) ? (ss.pendingW4Staged || 0) / ss.pendingW4 : null,
  };
}

function perSeedExtra(row) {
  const c = BK.perSeedExtra(row);
  // Keep the bankkiller day-join TB survival under a labeled key; the
  // fight-level number (below) is the cited one.
  const out = Object.assign({}, c, {
    tbSurvivalDayJoin: c.tbSurvival,
    tbFightsDayJoin: c.tbFights,
    tbDeathsDayJoin: c.tbDeaths,
  });
  delete out.tbSurvival;
  delete out.tbFights;
  delete out.tbDeaths;
  return Object.assign(out, stagingExtra(row));
}

function legSummary(rows) {
  const b = BK.legSummary(rows);
  const seeds = rows.map(perSeedExtra);
  const tbFightsW4 = seeds.reduce(function (m, s) { return m + s.tbFightsW4; }, 0);
  const withAlly = seeds.reduce(function (m, s) { return m + s.tbFightsW4WithAlly; }, 0);
  const withParty = seeds.reduce(function (m, s) { return m + s.tbFightsW4WithParty; }, 0);
  const diedInFight = seeds.reduce(function (m, s) { return m + s.tbDeathsInFight; }, 0);
  const postBloodKills = seeds.reduce(function (m, s) { return m + (s.postBloodKills || 0); }, 0);
  const postBloodFights = seeds.reduce(function (m, s) { return m + (s.postBloodFights || 0); }, 0);
  const partyDays1 = seeds.reduce(function (m, s) { return m + s.partyDays1; }, 0);
  const partyDays2 = seeds.reduce(function (m, s) { return m + s.partyDays2; }, 0);
  const invites = seeds.reduce(function (m, s) { return m + (s.invites || 0); }, 0);
  const accepted = seeds.reduce(function (m, s) { return m + (s.invitesAccepted || 0); }, 0);
  const declined = seeds.reduce(function (m, s) { return m + (s.invitesDeclined || 0); }, 0);
  const notOffered = seeds.reduce(function (m, s) { return m + (s.invitesNotOffered || 0); }, 0);
  const pendingW4 = seeds.reduce(function (m, s) { return m + (s.pendingW4 || 0); }, 0);
  const pendingStaged = seeds.reduce(function (m, s) { return m + (s.pendingW4Staged || 0); }, 0);
  const outcomes = {};
  seeds.forEach(function (s) {
    Object.keys(s.tbOutcomes || {}).forEach(function (o) { outcomes[o] = (outcomes[o] | 0) + s.tbOutcomes[o]; });
  });
  return Object.assign({}, b, {
    seeds: seeds,
    tbFightsW4: tbFightsW4,
    tbFightsW4WithAlly: withAlly,
    tbFightsW4WithParty: withParty,
    allyPresence: tbFightsW4 ? withAlly / tbFightsW4 : null,
    partyPresence: tbFightsW4 ? withParty / tbFightsW4 : null,
    tbDeathsInFight: diedInFight,
    tbSurvivalFightLevel: tbFightsW4 ? (tbFightsW4 - diedInFight) / tbFightsW4 : null,
    tbOutcomes: outcomes,
    postBloodKillsTotal: postBloodKills,
    postBloodFightsTotal: postBloodFights,
    postBloodKillRate: postBloodFights ? postBloodKills / postBloodFights : null,
    partyDays1: partyDays1, partyDays2: partyDays2,
    invites: invites, invitesAccepted: accepted, invitesDeclined: declined,
    invitesNotOffered: notOffered,
    pendingW4: pendingW4, pendingW4Staged: pendingStaged,
    pendingStagedShare: pendingW4 ? pendingStaged / pendingW4 : null,
  });
}

function verdictFor(baselineRows, armedRows) {
  const b = legSummary(baselineRows);
  const a = legSummary(armedRows);
  if (a.rallyFires < 8) {
    return { verdict: 'THIN', reason: 'T1: rally fires ' + a.rallyFires + ' < 8 across the armed leg — rally half unmeasured, not a NO-GO', baseline: b, armed: a };
  }
  if (a.tbFightsW4 >= 10 && (a.allyPresence == null || a.allyPresence < 0.40)) {
    return { verdict: 'THIN', reason: 'T2: allies present in only ' + a.tbFightsW4WithAlly + '/' + a.tbFightsW4 + ' (' + (a.allyPresence == null ? 'n/a' : (a.allyPresence * 100).toFixed(1) + '%') + ') armed-leg wave-4+ TB fights — staging half unmeasured, not a NO-GO', baseline: b, armed: a };
  }
  const pairHolds = a.pairSnapshotSeeds >= 1;
  const postBloodHolds = a.postBloodKillsTotal >= 3;
  const primaryHolds = pairHolds || postBloodHolds;
  const guardSurvival = {
    holds: (b.wall.medianDays == null || a.wall.medianDays == null) ? true : (a.wall.medianDays >= b.wall.medianDays - 10),
    baselineMedian: b.wall.medianDays, armedMedian: a.wall.medianDays,
    delta: (b.wall.medianDays != null && a.wall.medianDays != null) ? a.wall.medianDays - b.wall.medianDays : null,
  };
  if (!primaryHolds) {
    return { verdict: 'NO-GO', reason: 'primary missed: living-pair seeds armed ' + a.pairSnapshotSeeds + '/8 (bar ≥ 1) and post-first-blood kills armed ' + a.postBloodKillsTotal + ' (bar ≥ 3); baseline post-blood kills ' + b.postBloodKillsTotal, baseline: b, armed: a, guards: { survival: guardSurvival } };
  }
  if (!guardSurvival.holds) {
    return { verdict: 'NO-GO', reason: 'primary held (' + (pairHolds ? 'living pair on ' + a.pairSnapshotSeeds + ' seed(s)' : '') + (postBloodHolds ? ' post-first-blood kills ' + a.postBloodKillsTotal : '') + ') but the survival guard failed (armed median ' + a.wall.medianDays + 'd vs baseline ' + b.wall.medianDays + 'd)', baseline: b, armed: a, guards: { survival: guardSurvival } };
  }
  return { verdict: 'GO', reason: 'primary held (' + (pairHolds ? 'living pair on ' + a.pairSnapshotSeeds + ' seed(s)' : '') + (postBloodHolds ? ' post-first-blood kills ' + a.postBloodKillsTotal : '') + '); survival guard holds (armed median ' + a.wall.medianDays + 'd vs baseline ' + b.wall.medianDays + 'd)', baseline: b, armed: a, guards: { survival: guardSurvival } };
}

function analyzeDir(dir, prefix) {
  prefix = prefix || 'stageally-s';
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const baseline = rows.filter(function (r) { return r.policy === 'baseline'; });
  const armed = rows.filter(function (r) { return r.policy === 'staged'; });
  return verdictFor(baseline, armed);
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: stageally-analyze-20261106.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { stagingExtra: stagingExtra, perSeedExtra: perSeedExtra,
  legSummary: legSummary, verdictFor: verdictFor, analyzeDir: analyzeDir };
