// trace-launchquad-b.js — tracer for arm sim-launchquad-trace-b (diagnostic).
// Traces each launched quad from depart to meeting on the FROZEN
// sim-partysize-allycap-b corpora (band 103601-103608, both legs) and
// names the mechanism behind finding #2511: does a launched party
// scatter en route (SCATTER), or does the meeting party come from a
// fresh sense at the meeting (ALLY-PICK)?
//
// Self-contained: the analyzer (scripts/analyze-partysize-b.js) lives on
// the sim-partysize-b branch, not on this worktree's base, so the launch
// join is re-implemented here from the raw rows, replicating the
// analyzer's join loop exactly (same order, same conditions, first match
// wins — seed 103604 launched THREE parties on day 49, so a naive
// find-by-day grabs the wrong launch).
//
// Mechanism rules (frozen in the prereg
// evidence/2026-11-18/sim-launchquad-trace-b-prereg.md):
//   ALLY-PICK — meeting party != launch party AND the encounter's
//     allyFromStart is false AND the gate row records a planParty that
//     differs from the sensed party (the recorder itself distinguishes
//     the plan from the sensed party). The code side (cited in the
//     evidence, not re-proved here): villagerFightAllies reads only
//     live assignments / _outdoorCrew / npcNode proximity — no
//     expedition-roster feed (src/js/party-wiring.js; src/js/game.js
//     "No roster feed"; villager-agency.js allyVids sensed at the
//     encounter). A verdict of ALLY-PICK from rows alone is the
//     corpus half; the code half is cited in the evidence file.
//   SCATTER — a row shows >=2 launch members together after the depart
//     (a together-sighting) AND a later row before the meeting shows a
//     launch member in an encounter without the holder / without other
//     launch members (apart-state). The depart row alone is a dawn
//     decision, not a together-sighting, and cannot ground SCATTER.
//   UNDECIDED — neither pattern is fully evidenced; the trace must name
//     the missing row.
// Distance/terrain: the corpus carries no such field on any row;
// recorded as "n/a (not in corpus)", never invented.
//
// Usage:
//   node scripts/trace-launchquad-b.js [ctlDir] [armDir] [outJson]
// Defaults: the frozen allycap corpora under evidence/2026-11-17/.
// Exits 0 on GO (population reproduced 3: 1 ctl, 2 arm, every traced
// quad carries a mechanism verdict), 2 on population drift.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const EXPECTED = { total: 3, ctl: 1, arm: 2 };

// launchesForSeed — copied verbatim (logic) from the analyzer
// (scripts/analyze-partysize-b.js on the sim-partysize-b branch): dedupe
// launch rows by (vid, day), partySize is the max across the group,
// companions are the union. WAVE-4+ ONLY: a launch counts iff its plan
// is wave-4+ by the launchfunnel rule (needWave >= 4, or the target is
// a wave-4 species). The wraps record every win-plan depart, including
// wave-3 hunts — joining to those is what inflated the population to
// 28 in the first tracer run; the frozen population is 3.
const W4_IDS = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
function launchesForSeed(j) {
  const groups = {};
  for (const d of (j.v4departs || [])) {
    if (d.result !== 'launch') continue;
    if (!(((d.targetWave | 0) >= 4) || (d.target && W4_IDS.indexOf(d.target) !== -1))) continue;
    const k = d.vid + '|' + d.day;
    if (!groups[k]) groups[k] = { vid: d.vid, day: d.day, sources: [], partySize: 1, party: [], target: d.target || null, targetWave: d.targetWave || null, companion: null, companion2: null, companion3: null };
    const g = groups[k];
    if (g.sources.indexOf(d.source) === -1) g.sources.push(d.source);
    if ((d.partySize | 0) > g.partySize) g.partySize = d.partySize | 0;
    for (const p of (d.party || [])) if (p && g.party.indexOf(p) === -1) g.party.push(p);
    if (d.target && !g.target) g.target = d.target;
    if (d.companion && !g.companion) g.companion = d.companion;
    if (d.companion2 && !g.companion2) g.companion2 = d.companion2;
    if (d.companion3 && !g.companion3) g.companion3 = d.companion3;
  }
  return Object.keys(groups).map(function (k) { return groups[k]; });
}

// Replicates the analyzer's launch join: first match wins.
function joinLaunch(launches, m) {
  for (const l of launches) {
    if (m.day < l.day || m.day > l.day + 21) continue;
    if (l.target && m.mid !== l.target) continue;
    const party = [l.vid].concat(l.party || []);
    if (m.vid === l.vid || party.indexOf(m.vid) !== -1) return l;
    if (m.allyVid && (m.allyVid === l.vid || party.indexOf(m.allyVid) !== -1)) return l;
  }
  return launches.find(function (l) { return l.day === m.launchDay; }) || null;
}

function isNoContact(e) {
  return e.outcome === 'evade' || e.outcome === 'alreadyDead' ||
    (((e.rounds | 0) === 0) && ((e.mDealt | 0) === 0));
}

// Pure mechanism verdict from the traced rows (exported for the proof test).
// t: { launchParty (holder + companions), meetingParty, allyFromStart,
//      gatePlanParty, gateSensed, togetherRows, apartRows }
function verdict(t) {
  const launchSet = t.launchParty || [];
  const meetSet = t.meetingParty || [];
  const sameSet = launchSet.length === meetSet.length &&
    launchSet.every(function (x) { return meetSet.indexOf(x) !== -1; });
  if (sameSet) {
    return { verdict: 'UNDECIDED', reason: 'meeting party EQUALS launch party — nothing to explain; the quad arrived as launched' };
  }
  const planDiffers = (t.gatePlanParty || null) !== null &&
    JSON.stringify((t.gatePlanParty || []).slice().sort()) !== JSON.stringify(meetSet.slice().sort());
  const sensedMatches = (t.gateSensed || null) !== null &&
    JSON.stringify((t.gateSensed || []).slice().sort()) === JSON.stringify(meetSet.slice().sort());
  const together = (t.togetherRows || []).length > 0;
  const apart = (t.apartRows || []).length > 0;
  if (together && apart) {
    return { verdict: 'SCATTER', reason: 'launch members were sighted together after depart (' + t.togetherRows.length + ' together-row(s)) and later apart before the meeting (' + t.apartRows.length + ' apart-row(s)) — the party travelled together, then split' };
  }
  if (t.allyFromStart === false && planDiffers && sensedMatches) {
    return { verdict: 'ALLY-PICK', reason: 'meeting party differs from launch party; allyFromStart=false; the gate row itself records planParty ' + JSON.stringify(t.gatePlanParty) + ' vs sensed ' + JSON.stringify(t.gateSensed) + ' — the meeting party was sensed fresh at the meeting, not carried from the launch' };
  }
  if (t.allyFromStart === false && planDiffers) {
    return { verdict: 'ALLY-PICK', reason: 'meeting party differs from launch party; allyFromStart=false; gate planParty ' + JSON.stringify(t.gatePlanParty) + ' differs from the meeting party — sensed fresh, not carried (gate sensed field absent)' };
  }
  return { verdict: 'UNDECIDED', reason: 'meeting party differs from launch party but the rows do not settle the mechanism (allyFromStart=' + t.allyFromStart + ', planDiffers=' + planDiffers + ', together=' + together + ', apart=' + apart + ')' };
}

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}

function traceLeg(legName, dir) {
  const leg = loadDir(dir);
  const traces = [];
  for (const k of Object.keys(leg.bySeed).sort()) {
    const raw = leg.bySeed[k];
    const launches = launchesForSeed(raw);
    for (const e of (raw.v4encounters || [])) {
      if (!isNoContact(e)) continue;
      const launch = joinLaunch(launches, e);
      if (!launch) continue;
      const launchParty = [launch.vid].concat(launch.party || []);
      const meetingParty = [e.vid].concat(e.allyVids || []);
      const gate = (raw.v4gates || []).find(function (g) {
        return g.day === e.day && g.vid === e.vid && g.mid === e.mid;
      }) || null;
      // Together-rows: encounters strictly after the launch day and
      // before the meeting day in which the vid is a launch member and
      // at least one OTHER launch member is vid or ally.
      const togetherRows = [];
      // Apart-rows: encounters in (launchDay, meetingDay] in which a
      // launch member appears with NO other launch member alongside.
      const apartRows = [];
      for (const o of (raw.v4encounters || [])) {
        if (o.day <= launch.day || o.day > e.day) continue;
        if (o === e) continue;
        const oParty = [o.vid].concat(o.allyVids || []);
        const launchPresent = oParty.filter(function (x) { return launchParty.indexOf(x) !== -1; });
        if (launchPresent.length === 0) continue;
        const row = { day: o.day, vid: o.vid, mid: o.mid, outcome: o.outcome, allies: o.allyVids || [] };
        if (launchPresent.length >= 2) togetherRows.push(row);
        else apartRows.push(row);
      }
      const v = verdict({
        launchParty: launchParty, meetingParty: meetingParty,
        allyFromStart: e.allyFromStart,
        gatePlanParty: gate ? gate.planParty : null,
        gateSensed: gate ? gate.sensed : null,
        togetherRows: togetherRows, apartRows: apartRows,
      });
      traces.push({
        leg: legName, seed: k, day: e.day, vid: e.vid, mid: e.mid,
        outcome: e.outcome, rounds: e.rounds, mDealt: e.mDealt,
        launchDay: launch.day, launchTarget: launch.target,
        targetMatch: launch.target === e.mid,
        launchParty: launchParty, launchPartySize: launch.partySize,
        meetingParty: meetingParty, meetingPartySize: meetingParty.length,
        allyFromStart: e.allyFromStart,
        gatePlanParty: gate ? gate.planParty : null,
        gateSensed: gate ? gate.sensed : null,
        gatePlanStage: gate ? gate.planStage : null,
        gatePlanTarget: gate ? gate.planTarget : null,
        togetherRows: togetherRows, apartRows: apartRows,
        mHpStartRec: e.mHpStartRec != null ? e.mHpStartRec : null,
        log: (e.log && e.log[0]) || null,
        distanceTerrain: 'n/a (not in corpus)',
        verdict: v.verdict, reason: v.reason,
      });
    }
  }
  return traces;
}

function main() {
  const ctlDir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-17', 'perseed-partysize-allycap-b-ctl');
  const armDir = process.argv[3] || path.join(REPO, 'evidence', '2026-11-17', 'perseed-partysize-allycap-b-arm');
  const outFile = process.argv[4] || path.join(REPO, 'evidence', '2026-11-18', 'launchquad-trace-b-analysis.json');
  const ctl = traceLeg('ctl', ctlDir);
  const arm = traceLeg('arm', armDir);
  const rows = ctl.concat(arm);
  const counts = { total: rows.length, ctl: ctl.length, arm: arm.length };
  const verdictCounts = {};
  for (const r of rows) verdictCounts[r.verdict] = (verdictCounts[r.verdict] || 0) + 1;
  const out = {
    arm: 'launchquad-trace-b', run: 'fleshout-loop-b-20261118T0330Z',
    corpus: { ctlDir: path.basename(ctlDir), armDir: path.basename(armDir), band: '103601-103608' },
    population: { expected: EXPECTED, actual: counts },
    verdictCounts: verdictCounts,
    rows: rows,
  };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('=== sim-launchquad-trace-b ===');
  console.log('population: expected ' + JSON.stringify(EXPECTED) + ' actual ' + JSON.stringify(counts));
  console.log('verdicts: ' + JSON.stringify(verdictCounts));
  for (const r of rows) {
    console.log('- ' + r.leg + ' s' + r.seed + ' d' + r.day + ' ' + r.vid + ' vs ' + r.mid +
      ' (launch d' + r.launchDay + ' ' + JSON.stringify(r.launchParty) +
      ' -> meeting ' + JSON.stringify(r.meetingParty) +
      ', allyFromStart=' + r.allyFromStart +
      ', planParty=' + JSON.stringify(r.gatePlanParty) +
      ', together=' + r.togetherRows.length + ' apart=' + r.apartRows.length +
      ') => ' + r.verdict + ' — ' + r.reason);
  }
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (counts.total !== EXPECTED.total || counts.ctl !== EXPECTED.ctl || counts.arm !== EXPECTED.arm) {
    console.error('TRACE STOP: population drift — expected ' + JSON.stringify(EXPECTED) + ' got ' + JSON.stringify(counts));
    process.exitCode = 2;
  } else if (rows.some(function (r) { return r.verdict === 'UNDECIDED'; })) {
    console.log('TRACE NOTE: at least one quad is UNDECIDED — see evidence file for the missing row');
  }
}

if (require.main === module) main();
module.exports = { verdict: verdict, joinLaunch: joinLaunch, launchesForSeed: launchesForSeed, isNoContact: isNoContact, EXPECTED: EXPECTED };
