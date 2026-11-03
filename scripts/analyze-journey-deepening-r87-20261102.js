// analyze-journey-deepening-r87-20261102.js -- R87 "SHIP ITEMS IN THE WILD"
// analyzer (tooling only, zero game code). Reads per-seed JSONs written by
// scripts/journey-deepening-r87-20261102.js and reports the pre-registered
// SH1-SH5 verdicts plus M5/STAY-GREEN and a per-seed table.
// Usage: node scripts/analyze-journey-deepening-r87-20261102.js [evidir]
//   EVIDIR env overrides the default goal hidden_files evidence dir.
// When required as a module it exports verdicts(seeds) for proof fixtures.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-02');

function verdicts(seeds) {
  const out = { perSeed: [], pooled: {}, verdicts: {} };
  let violFights = [], lureFights = [], fleeKindFights = [];
  let fleeClasses = {}, otherCases = [];
  let lootRolls = [], ammoBatches = 0, ammoCalls = 0, ammoOppDays = 0, ammoOppTotal = 0, lessons = [], applicants = [], arrivals = [];
  let deadNpc = 0, deadApp = 0, deadArr = 0, wrapErrs = 0, committedTotal = 0;
  let villagesAlive = 0, mislabels = 0, transcripts = 0;
  for (const s of seeds) {
    const ship = s.ship || {};
    const fights = (ship.fights || []);
    // R87b: only contact/drive-off/round-cap/other flight on a non-flee kind
    // violates commitment; trick/stare/peace/judges/lure are designed wins.
    const v = fights.filter(f => f.outcome === 'mFlee' && !f.fleeKind && ['contact', 'driveoff', 'roundcap', 'other'].indexOf(f.fleeClass) >= 0);
    const lure = fights.filter(f => f.outcome === 'mFlee' && !f.fleeKind && (f.fleeClass === 'lure'));
    const fk = fights.filter(f => f.outcome === 'mFlee' && f.fleeKind);
    for (const f of fights) {
      if (f.outcome !== 'mFlee') continue;
      const c = f.fleeClass || 'unclassified';
      fleeClasses[c] = (fleeClasses[c] || 0) + 1;
      if (c === 'other') otherCases.push({ seed: s.seed, day: f.day, mid: f.mid, wave: f.wave, fleeKind: f.fleeKind, lastLine: f.lastLine || null });
    }
    violFights = violFights.concat(v.map(f => ({ seed: s.seed, day: f.day, mid: f.mid, wave: f.wave, fleeClass: f.fleeClass, lastLine: f.lastLine || null })));
    lureFights = lureFights.concat(lure.map(f => ({ seed: s.seed, day: f.day, mid: f.mid })));
    fleeKindFights = fleeKindFights.concat(fk.map(f => ({ seed: s.seed, day: f.day, mid: f.mid })));
    committedTotal += fights.reduce((t, f) => t + (f.committedLines || 0), 0);
    lootRolls = lootRolls.concat((ship.loot || []).map(l => ({ seed: s.seed, day: l.day, mid: l.mid, wave: l.wave, baseTier: l.baseTier, rewardSource: l.rewardSource, apex: l.apex, veteran: l.veteran, tier4Chance: l.tier4Chance, grantedId: l.grantedId, grantedTier: l.grantedTier })));
    ammoBatches += (ship.ammo || []).length;
    ammoCalls += ship.ammoCalls || 0;
    ammoOppDays += (ship.ammoOpp || []).length;
    ammoOppTotal += (ship.ammoOpp || []).reduce((t, d) => t + (d.opps || []).length, 0);
    lessons = lessons.concat((ship.lessons || []).map(l => ({ seed: s.seed, day: l.day, teacher: l.teacher, learner: l.learner, skill: l.skill, ok: l.ok })));
    applicants = applicants.concat(ship.applicants || []);
    arrivals = arrivals.concat(ship.arrivals || []);
    deadNpc += (ship.deadChecks || []).reduce((t, c) => t + (c.deadInNpcIds || []).length, 0);
    deadApp += (ship.applicants || []).filter(a => a.dead).length;
    deadArr += (ship.arrivals || []).reduce((t, a) => t + (a.deadNew || []).length, 0);
    wrapErrs += (ship.wrapErrors || []).length;
    const census = s.census || [];
    const alive = census.filter(c => c.alive).length;
    if (alive > 0) villagesAlive++;
    mislabels += ((s.deathHonesty || {}).mislabels || []).length;
    transcripts += (s.convoFiles || []).length;
    // repeat lessons: same teacher+learner+skill ok twice
    const seen = {};
    let repeats = 0;
    for (const l of (ship.lessons || [])) {
      if (!l.ok) continue;
      const k = l.teacher + '|' + l.learner + '|' + l.skill;
      if (seen[k]) repeats++;
      seen[k] = true;
    }
    out.perSeed.push({
      seed: s.seed, end: s.endReason || null, maxDay: s.maxGameDay || null,
      finalWave: s.finalWave || null, alive: alive, censusN: census.length,
      fightsWithOutcome: fights.length, mFleeViolations: v.length,
      mFleeLure: lure.length, mFleeFleeKind: fk.length,
      committedLines: fights.reduce((t, f) => t + (f.committedLines || 0), 0),
      lootRolls: (ship.loot || []).length, ammoBatches: (ship.ammo || []).length,
      ammoCalls: ship.ammoCalls || 0, lessons: (ship.lessons || []).length,
      lessonRepeats: repeats, applicants: (ship.applicants || []).length,
      deadChecks: (ship.deadChecks || []).length, transcripts: (s.convoFiles || []).length,
    });
  }
  const killRolls = lootRolls.filter(l => !l.rewardSource && !l.apex && l.grantedId);
  const w2KillRolls = killRolls.filter(l => (l.wave || 1) >= 2);
  const upShifts = w2KillRolls.filter(l => l.grantedTier != null && l.baseTier != null && l.grantedTier > l.baseTier);
  const upNon4 = upShifts.filter(l => l.grantedTier !== 4);
  const downShifts = w2KillRolls.filter(l => l.grantedTier != null && l.baseTier != null && l.grantedTier < l.baseTier);
  // R87b: wave-1 cap is 2, except veterans (min(base+1,3)) and tier4Chance
  // entries (their pool legitimately reaches tier 4 and below).
  const w1Viol = killRolls.filter(l => {
    if ((l.wave || 1) > 1 || l.grantedTier == null) return false;
    if (l.tier4Chance) return false;
    const cap = l.veteran ? Math.min((l.baseTier || 1) + 1, 3) : 2;
    return l.grantedTier > cap;
  });
  // R87b: the repeat-ledger fix is about MULTIPLE lessons over time (one per
  // conversation, not one ever) — same-skill-twice is impossible once learned.
  const byTeacher = {}, byLearner = {};
  for (const l of lessons) {
    if (!l.ok) continue;
    byTeacher[l.seed + '|' + l.teacher] = (byTeacher[l.seed + '|' + l.teacher] || 0) + 1;
    byLearner[l.seed + '|' + l.learner] = (byLearner[l.seed + '|' + l.learner] || 0) + 1;
  }
  const multiTeachers = Object.keys(byTeacher).filter(k => byTeacher[k] >= 2).length;
  const multiLearners = Object.keys(byLearner).filter(k => byLearner[k] >= 2).length;
  const totalRepeats = multiTeachers + multiLearners;
  out.pooled = {
    fightsWithOutcome: out.perSeed.reduce((t, p) => t + p.fightsWithOutcome, 0),
    mFleeViolations: violFights, mFleeLure: lureFights, mFleeFleeKind: fleeKindFights,
    committedLines: committedTotal,
    lootRolls: lootRolls.length, killRolls: killRolls.length, w2KillRolls: w2KillRolls.length,
    upShifts: upShifts, upNon4: upNon4, downShifts: downShifts, w1CapViolations: w1Viol,
    fleeClasses: fleeClasses, otherCases: otherCases,
    ammoBatches: ammoBatches, ammoCalls: ammoCalls, ammoOppDays: ammoOppDays, ammoOppTotal: ammoOppTotal,
    lessons: lessons.length, lessonRepeats: totalRepeats, multiTeachers: multiTeachers, multiLearners: multiLearners,
    applicants: applicants.length, arrivals: arrivals.length,
    deadInNpcIds: deadNpc, deadApplicants: deadApp, deadArrivals: deadArr,
    wrapErrors: wrapErrs, villagesAlive: villagesAlive, seeds: seeds.length,
    mislabels: mislabels, transcripts: transcripts,
  };
  const P = out.pooled;
  out.verdicts = {
    SH1_commitment: (P.mFleeViolations.length === 0 && P.fightsWithOutcome > 0) ? 'GO' : (P.fightsWithOutcome === 0 ? 'NO-DATA' : 'NO-GO'),
    SH2_taper: (P.w1CapViolations.length > 0) ? 'NO-GO' : (P.w2KillRolls >= 1 ? 'GO' : 'NO-DATA'),
    SH3_arrows: (P.ammoBatches >= 1) ? 'GO' : (P.ammoOppTotal === 0 ? 'NO-DATA' : 'NO-GO*'),
    SH4_deadExclusion: (P.deadInNpcIds === 0 && P.deadApplicants === 0 && P.deadArrivals === 0) ? 'GO' : 'NO-GO',
    SH5_lessons: (P.lessonRepeats >= 1) ? 'GO' : (P.lessons === 0 ? 'NO-DATA' : 'NO-GO*'),
    M5_winnable: (P.villagesAlive >= 2) ? 'GO' : 'NO-GO',
    STAYGREEN_mislabels: (P.mislabels === 0) ? 'GO' : 'NO-GO',
  };
  return out;
}

if (require.main === module) {
  const dir = process.argv[2] || process.env.R87_EVIDIR || DEFAULT_EVIDIR;
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => /^journey-deepening-r87-seed\d+\.json$/.test(f)).sort(); } catch (e) { console.log('EVIDIR read failed: ' + e.message); process.exit(1); }
  if (!files.length) { console.log('No r87 seed JSONs in ' + dir); process.exit(1); }
  const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  const v = verdicts(seeds);
  console.log('=== R87 SHIP ITEMS IN THE WILD ===');
  for (const p of v.perSeed) console.log(JSON.stringify(p));
  console.log('--- pooled ---');
  const P = v.pooled;
  console.log('fightsWithOutcome=' + P.fightsWithOutcome + ' mFleeViolations=' + P.mFleeViolations.length + ' mFleeLure=' + P.mFleeLure.length + ' mFleeFleeKind=' + P.mFleeFleeKind.length + ' committedLines=' + P.committedLines);
  console.log('fleeClasses=' + JSON.stringify(P.fleeClasses));
  console.log('lootRolls=' + P.lootRolls + ' killRolls=' + P.killRolls + ' w2KillRolls=' + P.w2KillRolls + ' upShifts=' + P.upShifts.length + ' (non4=' + P.upNon4.length + ') downShifts=' + P.downShifts.length + ' w1CapViolations=' + P.w1CapViolations.length);
  console.log('ammoBatches=' + P.ammoBatches + ' ammoCalls=' + P.ammoCalls + ' ammoOppDays=' + P.ammoOppDays + ' ammoOppTotal=' + P.ammoOppTotal + ' lessons=' + P.lessons + ' multiTeachers=' + P.multiTeachers + ' multiLearners=' + P.multiLearners);
  console.log('applicants=' + P.applicants + ' arrivals=' + P.arrivals + ' deadInNpcIds=' + P.deadInNpcIds + ' deadApplicants=' + P.deadApplicants + ' deadArrivals=' + P.deadArrivals + ' wrapErrors=' + P.wrapErrors);
  console.log('villagesAlive=' + P.villagesAlive + '/' + P.seeds + ' mislabels=' + P.mislabels + ' transcripts=' + P.transcripts);
  if (P.mFleeViolations.length) console.log('VIOLATIONS: ' + JSON.stringify(P.mFleeViolations));
  if (P.otherCases.length) console.log('OTHER-CLASS mFlee: ' + JSON.stringify(P.otherCases));
  if (P.upShifts.length) console.log('UP-SHIFTS: ' + JSON.stringify(P.upShifts));
  if (P.downShifts.length) console.log('DOWN-SHIFTS: ' + JSON.stringify(P.downShifts));
  if (P.w1CapViolations.length) console.log('W1-CAP-VIOLATIONS: ' + JSON.stringify(P.w1CapViolations));
  console.log('--- verdicts (NO-GO* = miss-or-no-opportunity, see prereg) ---');
  for (const [k, val] of Object.entries(v.verdicts)) console.log(k + ': ' + val);
}
module.exports = { verdicts };
