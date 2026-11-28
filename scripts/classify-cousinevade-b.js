// classify-cousinevade-b.js — classifier for arm sim-cousinevade-b (diagnostic).
// Reads the FROZEN fleerepair build-leg + emptybow armed-leg FIELD corpora
// (band 112301-112308, committed on HELD branches sim-fleerepair-b tip
// 7f228e1e5 and sim-emptybow-b tip 2d205acb0; read-only extracts under
// /tmp/sim-cousinevade-b-corpus/) and classifies EVERY launched evade
// meeting by what the party knew, under the frozen prereg
// (evidence/2026-11-28/sim-cousinevade-b-prereg.md).
//
// Population is the fleerepair analyzer's (scripts/analyze-fleerepair-b.js,
// copied byte-identical from sim-fleerepair-b): expedition-origin wave-4+
// rows; evade = rounds 0. The classifier MUST reproduce the frozen
// population (42: 23 build, 19 armed) or exit 2.
//
// Verdict rules (frozen in the prereg — do not tune here):
//   D_BEST = max mDealt over launched FOUGHT meetings, both legs pooled.
//   D_TYP  = median mDealt over launched fought meetings with mDealt > 0,
//            both legs pooled (zeros are round-1 flees, not damage
//            attempts). Per-leg values are reported as a robustness check;
//            verdicts must be invariant across pooled/per-leg scope.
//   WISE    iff mHpStartRec != null AND mHpStartRec > D_BEST.
//   WASTED  iff mHpStartRec != null AND mHpStartRec <= D_TYP AND targetMatch.
//   UNDECIDED otherwise, with the exact reason.
//   Leave-counter (Suburb, the only leave-trick species in this tree)
//   is WISE by definition regardless of HP.
// Distance/terrain: the corpus carries no such field on any row; recorded
// as "n/a (not in corpus)" per meeting, never invented, and no verdict
// depends on it. Party HP beyond the lead is likewise not in the corpus:
// only the lead's vHpLeft is recorded; allies' HP is "not in corpus".
//
// Launch join (frozen in the prereg — differs from evadeclass-b): among
// v4departs rows with result 'launch' in the same seed, the LATEST launch
// with launch.day <= meeting.day and meeting.day - launch.day <= 21 whose
// party ([holder vid] + party) contains the meeting vid OR any meeting
// allyVid; ties on day take the first in file order. No target-equality
// filter — targetMatch is recorded separately. If none joins, launch
// fields are null and targetMatch is false; the meeting is still
// classified.
//
// Usage:
//   node scripts/classify-cousinevade-b.js [buildDir] [armedDir] [outJson]
// Defaults: the /tmp read-only extracts; out defaults to
// evidence/2026-11-28/cousinevade-b-analysis.json. Exits 0 on GO (every
// launched evade classified, population reproduced), 1 on NO-GO on
// instrument (a verdict-required field missing), 2 on population drift.
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const REPO = path.join(__dirname, '..');
const ANALYZE = require('./analyze-fleerepair-b.js');

const CORPUS_ROOT = path.join(os.tmpdir(), 'sim-cousinevade-b-corpus');
const EXPECTED = { total: 42, build: 23, armed: 19 };

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  const shas = {};
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f));
    shas[f] = crypto.createHash('sha256').update(buf).digest('hex');
    out[JSON.parse(buf.toString('utf8')).seed] = JSON.parse(buf.toString('utf8'));
  }
  return { bySeed: out, files: files, shas: shas };
}
function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function isEvade(e) {
  return (e.wave | 0) >= 4 && e.origin === 'expedition' && ((e.rounds | 0) === 0) && e.outcome === 'evade';
}
function isFought(e) {
  return (e.wave | 0) >= 4 && e.origin === 'expedition' && ((e.rounds | 0) >= 1);
}

// Pure verdict function (frozen rules; exported for the proof test).
// c: { leaveCounter, hp (mHpStartRec or null), dBest, dTyp, targetMatch }
function verdict(c) {
  if (c.leaveCounter) return { verdict: 'WISE', reason: 'leave-counter species (Suburb) — the canon trick IS to leave; wise by definition regardless of HP' };
  if (c.hp == null) return { verdict: 'UNDECIDED', reason: 'no HP field in corpus (mHpStartRec null) — the verdict needs monster HP' };
  if (c.hp > c.dBest) return { verdict: 'WISE', reason: 'monster HP ' + c.hp + ' exceeds D_BEST ' + c.dBest + ' (most damage any launched party ever dealt in one meeting) — the meeting could not have ended in a kill' };
  if (c.hp <= c.dTyp && c.targetMatch) return { verdict: 'WASTED', reason: 'monster HP ' + c.hp + ' at or below D_TYP ' + c.dTyp + ' (typical damage of a fighting launched meeting) and it was the launch target — a fight the party could plausibly have finished in one meeting' };
  if (c.hp <= c.dTyp && !c.targetMatch) return { verdict: 'UNDECIDED', reason: 'monster HP ' + c.hp + ' at or below D_TYP ' + c.dTyp + ' but NOT the launch target — a missed finish, not a wasted launch; the launch is not spent' };
  return { verdict: 'UNDECIDED', reason: 'monster HP ' + c.hp + ' between D_TYP ' + c.dTyp + ' and D_BEST ' + c.dBest + ' — depends on this party\'s own damage, unrecorded' };
}

// Pure launch-join (frozen rule; exported for the proof test).
// launches: v4departs rows with result 'launch'; meeting: {day, vid, allyVids}.
function joinLaunch(launches, meeting) {
  const allies = meeting.allyVids || [];
  let best = null;
  for (const l of (launches || [])) {
    if (l.result !== 'launch') continue;
    if ((l.day | 0) > (meeting.day | 0)) continue;
    if ((meeting.day | 0) - (l.day | 0) > 21) continue;
    const party = [l.vid].concat(l.party || []);
    if (party.indexOf(meeting.vid) === -1 && !allies.some(function (a) { return party.indexOf(a) !== -1; })) continue;
    if (!best || (l.day | 0) > (best.day | 0)) best = l;
  }
  return best;
}

// trickKnownByDay (corpus-visible): any v4gates row (same seed, same mid,
// day <= day, trickKnown true) OR any v4encounters row (same seed, same
// mid, day < day, trickAfter true).
function trickKnownByDay(raw, mid, day) {
  for (const g of (raw.v4gates || [])) {
    if (g.mid === mid && (g.day | 0) <= day && g.trickKnown) return true;
  }
  for (const e of (raw.v4encounters || [])) {
    if (e.mid === mid && (e.day | 0) < day && e.trickAfter) return true;
  }
  return false;
}

function classifyLeg(legName, dir, constants) {
  const leg = loadDir(dir);
  const pop = ANALYZE.analyzeDir(dir);
  const rows = [];
  const foughtDealt = [];
  const foughtDealtNz = [];
  let totalEvadeRows = 0;
  const speciesAll = {};
  for (const k of Object.keys(leg.bySeed).sort()) {
    const raw = leg.bySeed[k];
    for (const e of (raw.v4encounters || [])) {
      if ((e.wave | 0) >= 4 && e.origin === 'expedition' && ((e.rounds | 0) === 0)) {
        totalEvadeRows++;
        speciesAll[e.mid] = (speciesAll[e.mid] || 0) + 1;
      }
      if (isFought(e) && e.mDealt != null) {
        foughtDealt.push(e.mDealt);
        if (e.mDealt > 0) foughtDealtNz.push(e.mDealt);
      }
    }
    const launches = (raw.v4departs || []).filter(function (d) { return d.result === 'launch'; });
    for (const e of (raw.v4encounters || []).filter(isEvade)) {
      const launch = joinLaunch(launches, e);
      let launchKillers = null, launchArmed = null;
      if (launch) {
        launchKillers = launch.partyKillers != null ? launch.partyKillers : null;
        launchArmed = launch.partyArmed != null ? launch.partyArmed : null;
      }
      const v = verdict({
        leaveCounter: e.mid === 'suburb',
        hp: e.mHpStartRec != null ? e.mHpStartRec : null,
        dBest: constants.dBest, dTyp: constants.dTyp,
        targetMatch: launch ? launch.target === e.mid : false,
      });
      rows.push({
        leg: legName, seed: k, day: e.day, vid: e.vid, mid: e.mid, wave: e.wave,
        outcome: e.outcome, rounds: e.rounds, mDealt: e.mDealt,
        launchDay: launch ? launch.day : null,
        launchTarget: launch ? launch.target : null,
        launchStage: launch ? launch.stage : null,
        targetMatch: launch ? launch.target === e.mid : false,
        launchJoined: !!launch,
        launchPartySize: launch ? launch.partySize : null,
        launchParty: launch ? [launch.vid].concat(launch.party || []) : null,
        launchPartyKillers: launchKillers, launchPartyArmed: launchArmed,
        meetingPartySize: (e.alliesN != null ? e.alliesN + 1 : null),
        allyVids: e.allyVids || null,
        leadHp: e.vHpLeft != null ? e.vHpLeft : null,
        partyHp: 'lead only; party HP not in corpus',
        gateSensedSize: e.gate ? e.gate.sensedSize : null,
        gatePartySize: e.gate ? e.gate.partySize : null,
        gateAllArmed: e.gate ? e.gate.allArmed : null,
        gateAllArmored: e.gate ? e.gate.allArmored : null,
        gatePlanStage: e.gate ? e.gate.planStage : null,
        gatePlanTarget: e.gate ? e.gate.planTarget : null,
        gateTrickKnown: e.gate ? e.gate.trickKnown : null,
        trickBefore: e.trickBefore != null ? e.trickBefore : null,
        trickAfter: e.trickAfter != null ? e.trickAfter : null,
        trickKnownByLaunch: launch ? trickKnownByDay(raw, e.mid, launch.day) : null,
        trickKnownByMeeting: trickKnownByDay(raw, e.mid, e.day),
        mHpStart: e.mHpStart, mHpStartRec: e.mHpStartRec != null ? e.mHpStartRec : null,
        mHpLeft: e.mHpLeft != null ? e.mHpLeft : null,
        log: (e.log && e.log[0]) || null,
        origin: e.origin || null,
        leaveCounter: e.mid === 'suburb',
        distanceTerrain: 'n/a (not in corpus)',
        verdict: v.verdict, reason: v.reason,
      });
    }
  }
  return { rows: rows, foughtDealt: foughtDealt, foughtDealtNz: foughtDealtNz,
    totalEvadeRows: totalEvadeRows, speciesAll: speciesAll, files: leg.files.length,
    shas: leg.shas, pool: pop.pool, fought: pop.fought, evades: pop.evades,
    wall: pop.wall };
}

function main() {
  const buildDir = process.argv[2] || path.join(CORPUS_ROOT, 'build-field', 'evidence', '2026-11-28', 'perseed-fleerepair-b-field-build');
  const armedDir = process.argv[3] || path.join(CORPUS_ROOT, 'armed-field', 'evidence', '2026-11-28', 'perseed-emptybow-b-field');
  const outFile = process.argv[4] || path.join(REPO, 'evidence', '2026-11-28', 'cousinevade-b-analysis.json');
  for (const d of [buildDir, armedDir]) {
    if (!fs.existsSync(d)) {
      console.error('COUSINEVADE STOP: corpus dir missing: ' + d + ' — extract the held-branch corpora to ' + CORPUS_ROOT + ' first (git archive, never copy into the repo)');
      process.exitCode = 2;
      return;
    }
  }
  // First pass: damage constants from launched fought meetings (pooled).
  const buildPre = classifyLeg('build', buildDir, { dBest: Infinity, dTyp: Infinity });
  const armedPre = classifyLeg('armed', armedDir, { dBest: Infinity, dTyp: Infinity });
  const allDealt = buildPre.foughtDealt.concat(armedPre.foughtDealt);
  const allDealtNz = buildPre.foughtDealtNz.concat(armedPre.foughtDealtNz);
  const constants = {
    dBest: allDealt.length ? Math.max.apply(null, allDealt) : null,
    dTyp: median(allDealtNz),
    dBestBuild: buildPre.foughtDealt.length ? Math.max.apply(null, buildPre.foughtDealt) : null,
    dTypBuild: median(buildPre.foughtDealtNz),
    dBestArmed: armedPre.foughtDealt.length ? Math.max.apply(null, armedPre.foughtDealt) : null,
    dTypArmed: median(armedPre.foughtDealtNz),
    foughtN: allDealt.length, foughtNzN: allDealtNz.length,
    foughtNBuild: buildPre.foughtDealt.length, foughtNzNBuild: buildPre.foughtDealtNz.length,
    foughtNArmed: armedPre.foughtDealt.length, foughtNzNArmed: armedPre.foughtDealtNz.length,
  };
  // Second pass: classify with the frozen constants.
  const build = classifyLeg('build', buildDir, constants);
  const armed = classifyLeg('armed', armedDir, constants);
  const rows = build.rows.concat(armed.rows);
  // Scope-invariance check: re-derive each verdict under the per-leg
  // constants; any disagreement forces UNDECIDED with that reason.
  for (const r of rows) {
    const per = r.leg === 'build'
      ? { dBest: constants.dBestBuild, dTyp: constants.dTypBuild }
      : { dBest: constants.dBestArmed, dTyp: constants.dTypArmed };
    const vPer = verdict({ leaveCounter: r.leaveCounter, hp: r.mHpStartRec, dBest: per.dBest, dTyp: per.dTyp, targetMatch: r.targetMatch });
    r.verdictPooledScope = r.verdict;
    r.verdictPerLegScope = vPer.verdict;
    r.scopeInvariant = vPer.verdict === r.verdict;
    if (!r.scopeInvariant) {
      r.verdict = 'UNDECIDED';
      r.reason = 'per-leg-scope verdict ' + vPer.verdict + ' disagrees with pooled-scope verdict ' + r.verdictPooledScope + ' — scope-dependent, cannot judge';
    }
  }
  const counts = { total: rows.length, build: build.rows.length, armed: armed.rows.length };
  const verdictCounts = {};
  for (const r of rows) verdictCounts[r.verdict] = (verdictCounts[r.verdict] || 0) + 1;
  const speciesLaunched = {};
  for (const r of rows) speciesLaunched[r.mid] = (speciesLaunched[r.mid] || 0) + 1;
  const speciesAll = {};
  for (const leg of [build, armed]) for (const k of Object.keys(leg.speciesAll)) speciesAll[k] = (speciesAll[k] || 0) + leg.speciesAll[k];
  const missingHp = rows.filter(function (r) { return r.mHpStartRec == null; }).length;
  const missingLeadHp = rows.filter(function (r) { return r.leadHp == null; }).length;
  const joinMiss = rows.filter(function (r) { return !r.launchJoined; }).length;
  const targetMatchN = rows.filter(function (r) { return r.targetMatch; }).length;
  const trickKnownN = rows.filter(function (r) { return r.trickBefore === true || r.trickKnownByMeeting === true; }).length;
  // Frozen decision rule: X=60 wise -> lever A (DAMAGE); Y=25 wasted
  // with wise <60 -> lever B (ENGAGEMENT); else NO-LEVER.
  const wiseShare = counts.total ? (verdictCounts.WISE || 0) / counts.total : 0;
  const wastedShare = counts.total ? (verdictCounts.WASTED || 0) / counts.total : 0;
  const decision = wiseShare >= 0.60
    ? 'A-DAMAGE'
    : (wastedShare >= 0.25 ? 'B-ENGAGEMENT' : 'NO-LEVER');
  const out = {
    arm: 'cousinevade-b', run: 'fleshout-loop-b-20261128T0830Z',
    corpus: {
      buildBranch: 'sim-fleerepair-b', buildTip: '7f228e1e5',
      buildDir: 'evidence/2026-11-28/perseed-fleerepair-b-field-build',
      armedBranch: 'sim-emptybow-b', armedTip: '2d205acb0',
      armedDir: 'evidence/2026-11-28/perseed-emptybow-b-field',
      band: '112301-112308',
      buildShas: build.shas, armedShas: armed.shas,
    },
    population: { expected: EXPECTED, actual: counts },
    constants: constants,
    rows: rows,
    verdictCounts: verdictCounts,
    wiseShare: +wiseShare.toFixed(4), wastedShare: +wastedShare.toFixed(4),
    decision: decision, decisionThresholds: { wiseX: 0.60, wastedY: 0.25 },
    speciesLaunched: speciesLaunched,
    speciesAllEvades: speciesAll,
    totalEvadeRows: build.totalEvadeRows + armed.totalEvadeRows,
    legSplitEvades: { build: build.totalEvadeRows, armed: armed.totalEvadeRows },
    joinMiss: joinMiss, targetMatchN: targetMatchN, trickKnownN: trickKnownN,
    missingHp: missingHp, missingLeadHp: missingLeadHp,
    scopeInvariant: rows.every(function (r) { return r.scopeInvariant; }),
    wall: { build: build.wall, armed: armed.wall },
  };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('=== sim-cousinevade-b ===');
  console.log('population: expected ' + JSON.stringify(EXPECTED) + ' actual ' + JSON.stringify(counts));
  console.log('constants: D_BEST=' + constants.dBest + ' D_TYP=' + constants.dTyp +
    ' (pooled; fought n=' + constants.foughtN + ' nonzero n=' + constants.foughtNzN + ')' +
    ' | per-leg build D_BEST=' + constants.dBestBuild + ' D_TYP=' + constants.dTypBuild +
    ' (fought n=' + constants.foughtNBuild + ', nz ' + constants.foughtNzNBuild + ')' +
    ' | armed D_BEST=' + constants.dBestArmed + ' D_TYP=' + constants.dTypArmed +
    ' (fought n=' + constants.foughtNArmed + ', nz ' + constants.foughtNzNArmed + ')');
  console.log('verdicts: ' + JSON.stringify(verdictCounts) + '  wiseShare=' + out.wiseShare + ' wastedShare=' + out.wastedShare + '  scopeInvariant=' + out.scopeInvariant);
  console.log('decision (frozen X=60/Y=25): ' + decision);
  console.log('species (launched evades): ' + JSON.stringify(speciesLaunched));
  console.log('species (ALL evade rows, n=' + out.totalEvadeRows + '): ' + JSON.stringify(speciesAll));
  console.log('leg split (ALL evade rows): build ' + build.totalEvadeRows + ' / armed ' + armed.totalEvadeRows);
  console.log('joinMiss=' + joinMiss + ' targetMatch=' + targetMatchN + ' trickKnown=' + trickKnownN + ' missingHp=' + missingHp + ' missingLeadHp=' + missingLeadHp);
  for (const r of rows) {
    console.log('- ' + r.leg + ' s' + r.seed + ' d' + r.day + ' ' + r.vid + ' vs ' + r.mid +
      ' (launch d' + r.launchDay + ' size ' + r.launchPartySize + ' target ' + r.launchTarget +
      (r.targetMatch ? ' MATCH' : ' no-match') + (r.launchJoined ? '' : ' NO-JOIN') + ', meeting party ' + r.meetingPartySize +
      ', leadHp=' + r.leadHp + ', trickBefore=' + r.trickBefore + ', trickByLaunch=' + r.trickKnownByLaunch +
      ', trickByMeeting=' + r.trickKnownByMeeting +
      ', HP=' + r.mHpStartRec + ') => ' + r.verdict + ' — ' + r.reason);
  }
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (counts.total !== EXPECTED.total || counts.build !== EXPECTED.build || counts.armed !== EXPECTED.armed) {
    console.error('COUSINEVADE STOP: population drift — expected ' + JSON.stringify(EXPECTED) + ' got ' + JSON.stringify(counts));
    process.exitCode = 2;
  } else if (missingHp > 0) {
    console.error('COUSINEVADE NO-GO: instrument — ' + missingHp + ' launched evade(s) carry no mHpStartRec; verdict-required field missing');
    process.exitCode = 1;
  }
}

if (require.main === module) main();
module.exports = { verdict: verdict, median: median, joinLaunch: joinLaunch, trickKnownByDay: trickKnownByDay, EXPECTED: EXPECTED };
