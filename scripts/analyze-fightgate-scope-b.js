// analyze-fightgate-scope-b.js — classifier for arm sim-fightgate-scope-b
// (DIAGNOSTIC, finding #2506: aid and world-tick meetings never consult
// winPlanFightGate — the SEEK gate's scope is expedition-only. No lever,
// no contrast leg: this analyzer reads ONE census leg and judges the
// frozen prereg bars (evidence/2026-11-18/sim-fightgate-scope-b-prereg.md):
//   D1a (completeness): every wild wave-4+ meeting classified, 0 unclassified.
//   D1b (population): wild wave-4+ meetings >= 40 across the band.
//   D2 (Suburb presence): wild Suburb meetings >= 3.
//   D3 (classifier validity): on expedition rows the analyzer's
//       would-avoid replica agrees with the real gate's avoid/null/seek
//       result on >= 95% of rows with a gate snapshot (n >= 5).
//   Instrument: 8 files, exactly the frozen seed list, 0 instrument
//       errors, every FOUGHT encounter row carries mHpStart.
// The SUBSTANCE — how many wild meetings the expedition gate would
// have avoided, how many of those killed or mauled the fighter, how
// many hit a launched plan, and the Suburb slice by trick-known — is
// reported as the ANSWER, not gated: the diagnostic's job is to
// measure the harm, not to require it.
// Verdict: DIAG-GO iff D1a && D1b && D2 && D3 && instrument clean.
//   METRIC-BROKEN iff D1b or D2 fails, or D3 has < 5 gate rows
//   (population absent — the question is unanswered, not answered-no).
//   DIAG-NO-GO iff D1a fails, D3 agreement fails, or the instrument
//   is dirty (the instrument, not the world, is wrong).
// Launch join (for fought meetings): a v4encounters row is a
// launched-party meeting iff some launch (v4departs result=launch)
// by the same vid (or with the fighter among its party) has
// target == mid (or target null) and meeting day in
// [launchDay, launchDay+21] (max expedition duration 8+12=20, +1).
// Launches are deduped by (vid, day) across the winPlanDepart +
// brain depart rows; partySize is the max across the group.
// Usage:
//   node scripts/analyze-fightgate-scope-b.js <diagDir>
//   node scripts/analyze-fightgate-scope-b.js --selftest
// Writes evidence/2026-11-18/fightgate-scope-b-analysis.json.
// Exits 0 iff the verdict is DIAG-GO.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const FROZEN_SEEDS = [104301, 104302, 104303, 104304, 104305, 104306, 104307, 104308];
const WILD_ORIGINS = ['world-tick', 'aid', 'patrol'];

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(a) { return a.length ? a.reduce(function (t, x) { return t + x; }, 0) / a.length : null; }

// Dedupe launch rows by (vid, day): the winPlanDepart wrap and the
// brain wrap can both record one launch. partySize is the max across
// the group; companions are the union. WAVE-4+ ONLY: a launch counts
// here iff its plan is wave-4+ by the launchfunnel rule (needWave
// >= 4, or the target is a wave-4 species) — the wraps record every
// win-plan depart, including wave-3 hunts (needWave 3 / null).
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

// classifyWouldAvoid(snap, wave): the expedition gate's two avoid
// rules, replicated verbatim from src/js/win-plan.js winPlanFightGate
// (veteran-guard, then outmatched — evaluated in that order, before
// the trick-hold/SEEK block, so the avoid rules are the whole avoid
// surface). snap is the driver's `wild` snapshot (or a v4gates row,
// which carries the same fields): { partySize, allArmed, allArmored,
// planStage, isTableVeteran }. Returns { wouldAvoid, rule } with rule
// null | 'outmatched' | 'veteran-guard' | 'unclassified' (null/incomplete
// snapshot — never a silent false). The trick-hold and SEEK are NOT
// avoid rules: the hold returns null (ordinary encounter proceeds)
// and SEEK is a walk-in, so neither counts as an avoidance.
function classifyWouldAvoid(snap, wave) {
  if (!snap || typeof snap.partySize !== 'number' || typeof snap.allArmed !== 'boolean' ||
      typeof snap.allArmored !== 'boolean' || typeof wave !== 'number') {
    return { wouldAvoid: null, rule: 'unclassified' };
  }
  if (wave >= 4 && (snap.partySize < 3 || !snap.allArmed || !snap.allArmored)) {
    return { wouldAvoid: true, rule: 'outmatched' };
  }
  if (snap.planStage === 'table' && snap.isTableVeteran === true && wave >= 3 &&
      (snap.partySize < 2 || !snap.allArmed)) {
    return { wouldAvoid: true, rule: 'veteran-guard' };
  }
  return { wouldAvoid: false, rule: null };
}

function seedAnalysis(j) {
  const launches = launchesForSeed(j);
  const sizes = {};
  for (const l of launches) sizes[l.partySize] = (sizes[l.partySize] || 0) + 1;
  const fourthFills = launches.filter(function (l) { return l.partySize >= 4; }).length;
  const trioFills = launches.filter(function (l) { return l.partySize === 3; }).length;
  const encounters = (j.v4encounters || []).slice();
  let missingHp = 0, recMismatch = 0;
  const meetings = [];
  // D3 inputs: expedition rows carrying a gate snapshot.
  let d3n = 0, d3agree = 0;
  const d3disagree = [];
  for (const e of encounters) {
    const noContact = e.outcome === 'evade' || e.outcome === 'alreadyDead' ||
      (((e.rounds | 0) === 0) && ((e.mDealt | 0) === 0));
    const isKill = e.outcome === 'vKill';
    if (e.mHpStart == null && !noContact && !isKill) missingHp++;
    if (e.mHpStart != null && e.mHpStartRec != null && e.mHpStart !== e.mHpStartRec) recMismatch++;
    const share = isKill ? 1.0 : ((e.mHpStart != null && e.mHpStart > 0) ? (e.mDealt || 0) / e.mHpStart : null);
    let launched = null;
    for (const l of launches) {
      if (e.day < l.day || e.day > l.day + 21) continue;
      if (l.target && e.mid !== l.target) continue;
      const party = [l.vid].concat(l.party);
      if (e.vid === l.vid || party.indexOf(e.vid) !== -1) { launched = l; break; }
      if (e.allyVid && (e.allyVid === l.vid || party.indexOf(e.allyVid) !== -1)) { launched = l; break; }
    }
    const origin = e.origin || null;
    const isWild = WILD_ORIGINS.indexOf(origin) !== -1;
    const cls = classifyWouldAvoid(e.wild || null, e.wave);
    // D3: on expedition rows the replica must agree with the real gate.
    let gateAgree = null;
    if (origin === 'expedition' && e.gate && typeof e.gate.result === 'string') {
      const gcls = classifyWouldAvoid({
        partySize: e.gate.partySize, allArmed: e.gate.allArmed, allArmored: e.gate.allArmored,
        planStage: e.gate.planStage, isTableVeteran: e.gate.isTableVeteran,
      }, e.wave);
      if (gcls.rule !== 'unclassified') {
        d3n++;
        const actualAvoid = e.gate.result === 'avoid';
        gateAgree = (gcls.wouldAvoid === actualAvoid);
        if (gateAgree) d3agree++;
        else d3disagree.push({ day: e.day, vid: e.vid, mid: e.mid, gateResult: e.gate.result,
          gateReason: e.gate.reason, replicaRule: gcls.rule });
      }
    }
    meetings.push({ day: e.day, vid: e.vid, mid: e.mid, wave: e.wave, outcome: e.outcome || null,
      rounds: e.rounds, mDealt: e.mDealt || 0, vTaken: (e.vTaken == null ? null : e.vTaken | 0),
      mHpStart: e.mHpStart != null ? e.mHpStart : null,
      share: share != null ? round(share, 4) : null, alliesN: e.alliesN, allyVid: e.allyVid || null,
      calledHelp: !!e.calledHelp, origin: origin, isWild: isWild,
      fleeWise: !!e.fleeWise, fleeLearn: !!e.fleeLearn,
      trickBefore: (e.trickBefore == null ? null : !!e.trickBefore),
      trickAfter: (e.trickAfter == null ? null : !!e.trickAfter),
      launched: !!launched, launchPartySize: launched ? launched.partySize : null,
      launchDay: launched ? launched.day : null,
      planStage: (e.wild && e.wild.planStage != null) ? e.wild.planStage : null,
      wouldAvoid: cls.wouldAvoid, avoidRule: cls.rule, gateAgree: gateAgree });
  }
  const wild = meetings.filter(function (m) { return m.isWild; });
  const wildByOrigin = {};
  for (const m of wild) wildByOrigin[m.origin] = (wildByOrigin[m.origin] || 0) + 1;
  const wildUnclassified = wild.filter(function (m) { return m.avoidRule === 'unclassified'; }).length;
  const wildWouldAvoid = wild.filter(function (m) { return m.wouldAvoid === true; });
  const wildWouldAvoidByRule = {};
  for (const m of wildWouldAvoid) wildWouldAvoidByRule[m.avoidRule] = (wildWouldAvoidByRule[m.avoidRule] || 0) + 1;
  const wildWouldAvoidDeaths = wildWouldAvoid.filter(function (m) { return m.outcome === 'vDie'; }).length;
  const wildWouldAvoidFlees = wildWouldAvoid.filter(function (m) { return m.outcome === 'vFlee'; });
  const wildWouldAvoidTaken = wildWouldAvoid.reduce(function (t, m) { return t + (m.vTaken || 0); }, 0);
  const wildLaunched = wild.filter(function (m) { return m.launched; });
  const wildLaunchedWouldAvoid = wildLaunched.filter(function (m) { return m.wouldAvoid === true; }).length;
  const wildPlanFighters = wild.filter(function (m) { return m.planStage === 'hunt' || m.planStage === 'standing' || m.planStage === 'table'; });
  // Suburb slice (the #2506 species): wild meetings by trick-known.
  const wildSuburb = wild.filter(function (m) { return m.mid === 'suburb'; });
  const wildSuburbKnown = wildSuburb.filter(function (m) { return m.trickBefore === true; });
  const wildSuburbUnknown = wildSuburb.filter(function (m) { return m.trickBefore === false; });
  const suburbOutcomes = {};
  for (const m of wildSuburb) suburbOutcomes[m.outcome || 'null'] = (suburbOutcomes[m.outcome || 'null'] || 0) + 1;
  const wildSuburbWiseLeaves = wildSuburb.filter(function (m) { return !!m.fleeWise; }).length;
  const wildSuburbDeaths = wildSuburb.filter(function (m) { return m.outcome === 'vDie'; }).length;
  const wildSuburbTaken = wildSuburb.reduce(function (t, m) { return t + (m.vTaken || 0); }, 0);
  // Expedition contrast (context, not judged): how often the gate
  // avoids on the path where it runs.
  const exped = meetings.filter(function (m) { return m.origin === 'expedition'; });
  const expedWouldAvoid = exped.filter(function (m) { return m.wouldAvoid === true; }).length;
  const w4kills = meetings.filter(function (m) { return m.wave === 4 && m.outcome === 'vKill'; }).length;
  const stats = j.winPlanStats || {};
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    villageLost: !!j.villageLost,
    instrumentErrors: (j.instrumentErrors || []).length,
    launches: launches.length, launchedSizes: sizes,
    fourthFills: fourthFills, trioFills: trioFills,
    encounters: encounters.length, missingHp: missingHp, recMismatch: recMismatch,
    meetings: meetings,
    wildMeetings: wild.length, wildByOrigin: wildByOrigin,
    wildUnclassified: wildUnclassified,
    wildWouldAvoid: wildWouldAvoid.length, wildWouldAvoidByRule: wildWouldAvoidByRule,
    wildWouldAvoidDeaths: wildWouldAvoidDeaths,
    wildWouldAvoidFlees: wildWouldAvoidFlees.length,
    wildWouldAvoidFleeTaken: wildWouldAvoidFlees.reduce(function (t, m) { return t + (m.vTaken || 0); }, 0),
    wildWouldAvoidTaken: wildWouldAvoidTaken,
    wildLaunched: wildLaunched.length,
    wildLaunchedWouldAvoid: wildLaunchedWouldAvoid,
    wildPlanFighters: wildPlanFighters.length,
    wildSuburb: wildSuburb.length,
    wildSuburbKnown: wildSuburbKnown.length, wildSuburbUnknown: wildSuburbUnknown.length,
    wildSuburbOutcomes: suburbOutcomes,
    wildSuburbWiseLeaves: wildSuburbWiseLeaves,
    wildSuburbDeaths: wildSuburbDeaths, wildSuburbTaken: wildSuburbTaken,
    expedMeetings: exped.length, expedWouldAvoid: expedWouldAvoid,
    d3n: d3n, d3agree: d3agree, d3disagree: d3disagree,
    w4kills: w4kills,
    deaths: (j.deaths || []).length,
    expedDeaths: (j.deaths || []).filter(function (d) { return d.cause === 'expedition'; }).length,
    starvDeaths: (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length,
  };
}

function summarize(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const sizes = {};
  let launches = 0, fourth = 0, trios = 0;
  let encounters = 0, missingHp = 0, recMismatch = 0;
  let deaths = 0, exped = 0, starv = 0, errors = 0;
  let wild = 0, wildUnclassified = 0, wildWouldAvoid = 0, wildWouldAvoidDeaths = 0,
      wildWouldAvoidFlees = 0, wildWouldAvoidFleeTaken = 0, wildWouldAvoidTaken = 0,
      wildLaunched = 0, wildLaunchedWouldAvoid = 0, wildPlanFighters = 0,
      wildSuburb = 0, wildSuburbKnown = 0, wildSuburbUnknown = 0,
      wildSuburbWiseLeaves = 0, wildSuburbDeaths = 0, wildSuburbTaken = 0,
      expedMeetings = 0, expedWouldAvoid = 0, d3n = 0, d3agree = 0, w4kills = 0;
  const wildByOrigin = {}, wildWouldAvoidByRule = {}, wildSuburbOutcomes = {};
  const d3disagree = [];
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  for (const s of seeds) {
    launches += s.launches; fourth += s.fourthFills; trios += s.trioFills;
    encounters += s.encounters; missingHp += s.missingHp; recMismatch += s.recMismatch || 0;
    deaths += s.deaths; exped += s.expedDeaths; starv += s.starvDeaths; errors += s.instrumentErrors;
    for (const k of Object.keys(s.launchedSizes)) sizes[k] = (sizes[k] || 0) + s.launchedSizes[k];
    wild += s.wildMeetings; wildUnclassified += s.wildUnclassified;
    wildWouldAvoid += s.wildWouldAvoid; wildWouldAvoidDeaths += s.wildWouldAvoidDeaths;
    wildWouldAvoidFlees += s.wildWouldAvoidFlees; wildWouldAvoidFleeTaken += s.wildWouldAvoidFleeTaken;
    wildWouldAvoidTaken += s.wildWouldAvoidTaken;
    wildLaunched += s.wildLaunched; wildLaunchedWouldAvoid += s.wildLaunchedWouldAvoid;
    wildPlanFighters += s.wildPlanFighters;
    wildSuburb += s.wildSuburb; wildSuburbKnown += s.wildSuburbKnown; wildSuburbUnknown += s.wildSuburbUnknown;
    wildSuburbWiseLeaves += s.wildSuburbWiseLeaves; wildSuburbDeaths += s.wildSuburbDeaths;
    wildSuburbTaken += s.wildSuburbTaken;
    expedMeetings += s.expedMeetings; expedWouldAvoid += s.expedWouldAvoid;
    d3n += s.d3n; d3agree += s.d3agree; w4kills += s.w4kills;
    for (const k of Object.keys(s.wildByOrigin)) wildByOrigin[k] = (wildByOrigin[k] || 0) + s.wildByOrigin[k];
    for (const k of Object.keys(s.wildWouldAvoidByRule)) wildWouldAvoidByRule[k] = (wildWouldAvoidByRule[k] || 0) + s.wildWouldAvoidByRule[k];
    for (const k of Object.keys(s.wildSuburbOutcomes)) wildSuburbOutcomes[k] = (wildSuburbOutcomes[k] || 0) + s.wildSuburbOutcomes[k];
    for (const d of (s.d3disagree || [])) d3disagree.push(d);
  }
  return {
    files: leg.files.length, seeds: seeds.length,
    seedList: seeds.map(function (s) { return s.seed; }),
    launches: launches, launchedSizes: sizes,
    fourthFills: fourth, trioFills: trios,
    encounters: encounters, missingHp: missingHp, recMismatch: recMismatch,
    wildMeetings: wild, wildByOrigin: wildByOrigin,
    wildUnclassified: wildUnclassified,
    wildWouldAvoid: wildWouldAvoid, wildWouldAvoidByRule: wildWouldAvoidByRule,
    wildWouldAvoidDeaths: wildWouldAvoidDeaths,
    wildWouldAvoidFlees: wildWouldAvoidFlees,
    wildWouldAvoidFleeTaken: wildWouldAvoidFleeTaken,
    wildWouldAvoidTaken: wildWouldAvoidTaken,
    wildLaunched: wildLaunched, wildLaunchedWouldAvoid: wildLaunchedWouldAvoid,
    wildPlanFighters: wildPlanFighters,
    wildSuburb: wildSuburb, wildSuburbKnown: wildSuburbKnown, wildSuburbUnknown: wildSuburbUnknown,
    wildSuburbOutcomes: wildSuburbOutcomes,
    wildSuburbWiseLeaves: wildSuburbWiseLeaves,
    wildSuburbDeaths: wildSuburbDeaths, wildSuburbTaken: wildSuburbTaken,
    expedMeetings: expedMeetings, expedWouldAvoid: expedWouldAvoid,
    d3n: d3n, d3agree: d3agree,
    d3agreement: d3n ? round(d3agree / d3n, 4) : null,
    d3disagree: d3disagree,
    w4kills: w4kills,
    deaths: deaths, expedDeaths: exped, starvDeaths: starv,
    instrumentErrors: errors,
    survived: seeds.filter(function (s) { return !s.villageLost; }).length,
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    wall: {
      nationalStanding: seeds.filter(function (s) { return (s.standing || 0) >= 200; }).length,
      nationalRank: seeds.filter(function (s) { return (RANK_ORDER[s.scaleRank] || 0) >= 2; }).length,
      table: 0, wins: seeds.filter(function (s) { return !!s.won; }).length,
      wave4: seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
    },
    perSeed: seeds,
  };
}

// Frozen bars (from the prereg). Exported for the proof test.
function judgeD1a(s) {
  return { pass: s.wildUnclassified === 0, unclassified: s.wildUnclassified, bar: 0 };
}
function judgeD1b(s) {
  return { pass: s.wildMeetings >= 40, wild: s.wildMeetings, bar: 40 };
}
function judgeD2(s) {
  return { pass: s.wildSuburb >= 3, wildSuburb: s.wildSuburb, bar: 3 };
}
function judgeD3(s) {
  if (s.d3n < 5) return { pass: false, unjudgeable: true, n: s.d3n, agreement: s.d3agreement, bar: 0.95 };
  return { pass: (s.d3agreement || 0) >= 0.95, unjudgeable: false, n: s.d3n, agreement: s.d3agreement, bar: 0.95 };
}
function judgeInstrument(s) {
  const seedList = (s.seedList || []).slice().sort(function (a, b) { return a - b; });
  const frozen = FROZEN_SEEDS.slice().sort(function (a, b) { return a - b; });
  const seedsMatch = seedList.length === frozen.length &&
    seedList.every(function (v, i) { return v === frozen[i]; });
  const pass = s.files === 8 && seedsMatch && s.instrumentErrors === 0 && s.missingHp === 0;
  return { pass: pass, files: s.files, expectedFiles: 8, seedsMatch: seedsMatch,
    errors: s.instrumentErrors, missingHp: s.missingHp };
}

function judgeVerdict(s) {
  const d1a = judgeD1a(s), d1b = judgeD1b(s), d2 = judgeD2(s), d3 = judgeD3(s), instr = judgeInstrument(s);
  if (!instr.pass || !d1a.pass || (d3.n >= 5 && !d3.pass)) return 'DIAG-NO-GO';
  if (!d1b.pass || !d2.pass || d3.unjudgeable) return 'METRIC-BROKEN';
  return 'DIAG-GO';
}

function selftest() {
  let failures = 0;
  function fail(m) { failures++; console.error('SELFTEST FAIL: ' + m); }
  function ok(m) { console.log('selftest ok: ' + m); }
  function assert(c, m) { if (c) ok(m); else fail(m); }
  // Classifier table (verbatim gate rules).
  const C = classifyWouldAvoid;
  assert(C({ partySize: 3, allArmed: true, allArmored: true, planStage: 'hunt', isTableVeteran: false }, 4).wouldAvoid === false,
    'full geared trio vs wave-4: no avoid');
  assert(C({ partySize: 2, allArmed: true, allArmored: true, planStage: 'hunt', isTableVeteran: false }, 4).rule === 'outmatched',
    'duo vs wave-4: outmatched');
  assert(C({ partySize: 3, allArmed: true, allArmored: false, planStage: 'standing', isTableVeteran: false }, 4).rule === 'outmatched',
    'unarmored trio vs wave-4: outmatched');
  assert(C({ partySize: 3, allArmed: false, allArmored: true, planStage: 'hunt', isTableVeteran: false }, 4).rule === 'outmatched',
    'unarmed trio vs wave-4: outmatched');
  assert(C({ partySize: 1, allArmed: true, allArmored: true, planStage: 'table', isTableVeteran: true }, 3).rule === 'veteran-guard',
    'lone table veteran vs wave-3: veteran-guard');
  assert(C({ partySize: 2, allArmed: true, allArmored: true, planStage: 'table', isTableVeteran: true }, 3).wouldAvoid === false,
    'table veteran with an armed companion vs wave-3: no avoid');
  assert(C({ partySize: 1, allArmed: true, allArmored: true, planStage: 'table', isTableVeteran: false }, 3).wouldAvoid === false,
    'table non-veteran alone vs wave-3: no avoid (veteran-guard needs a wave-4 killer)');
  assert(C({ partySize: 1, allArmed: true, allArmored: true, planStage: 'hunt', isTableVeteran: true }, 3).wouldAvoid === false,
    'wave-3 never outmatches (rule is wave>=4)');
  assert(C(null, 4).rule === 'unclassified', 'null snapshot: unclassified, never silent false');
  assert(C({ partySize: 3, allArmed: true }, 4).rule === 'unclassified', 'incomplete snapshot: unclassified');
  // Synthetic leg: one wild outmatched death, one wild suburb wise
  // leave (trick known), one wild clean fight, one expedition row
  // whose gate snapshot agrees with the replica.
  function seed(o) {
    return {
      seed: o.seed, days: 150, gameDays: 150, endReason: 'horizon', standing: 120, scaleRank: 'village',
      won: false, maxWave: 4, villageLost: false, instrumentErrors: [],
      winPlanStats: {}, v4seeds: [], v4departs: o.departs || [], dawnbidScores: [],
      v4encounters: o.encounters || [], companionPool: [], deaths: [], daily: [{ day: 1 }, { day: 150 }],
    };
  }
  const wildSnap = function (o) {
    return Object.assign({ planStage: null, planTarget: null, planParty: [], party: ['a'], partySize: 1,
      sensedSize: 1, countedSize: 0, allArmed: true, allArmored: true, gear: {}, isTableVeteran: false }, o);
  };
  const enc = function (o) {
    return Object.assign({ day: 50, vid: 'a', mid: 'strike', wave: 4, outcome: 'vFlee', rounds: 3,
      mDealt: 100, vTaken: 40, mHpStart: 500, mHpStartRec: 500, alliesN: 0, allyVid: null,
      calledHelp: false, origin: 'world-tick', fleeWise: false, fleeLearn: false,
      trickBefore: false, trickAfter: false, wild: wildSnap({}), gate: null }, o);
  };
  const leg1 = seed({ seed: 104301, encounters: [
    enc({ mid: 'herald', outcome: 'vDie', vTaken: 100, wild: wildSnap({ partySize: 1 }) }),
    enc({ day: 60, mid: 'suburb', outcome: 'vFlee', rounds: 1, mDealt: 0, vTaken: 3,
      fleeWise: true, trickBefore: true, origin: 'aid',
      wild: wildSnap({ partySize: 3, allArmed: true, allArmored: true, planStage: 'standing', planTarget: 'herald' }) }),
    enc({ day: 70, mid: 'strike', outcome: 'vFlee', vTaken: 20, origin: 'patrol',
      wild: wildSnap({ partySize: 3, allArmed: true, allArmored: true, planStage: 'hunt' }) }),
    enc({ day: 80, mid: 'audit', outcome: 'vKill', rounds: 5, mDealt: 600, vTaken: 10, origin: 'expedition',
      wild: wildSnap({ partySize: 3, allArmed: true, allArmored: true, planStage: 'hunt' }),
      gate: { result: 'null', reason: null, partySize: 3, sensedSize: 3, countedSize: 0,
        allArmed: true, allArmored: true, trickKnown: false, planStage: 'hunt', planTarget: 'audit', isTableVeteran: false } }),
  ] });
  const a1 = seedAnalysis(leg1);
  assert(a1.wildMeetings === 3, 'synthetic: 3 wild meetings counted (got ' + a1.wildMeetings + ')');
  assert(a1.wildWouldAvoid === 1, 'synthetic: 1 would-avoid (lone herald death, got ' + a1.wildWouldAvoid + ')');
  assert(a1.wildWouldAvoidDeaths === 1, 'synthetic: the would-avoid meeting killed (deaths ' + a1.wildWouldAvoidDeaths + ')');
  assert(a1.wildSuburb === 1 && a1.wildSuburbKnown === 1 && a1.wildSuburbWiseLeaves === 1,
    'synthetic: 1 known-trick wild Suburb wise leave');
  assert(a1.wildUnclassified === 0, 'synthetic: 0 unclassified');
  assert(a1.d3n === 1 && a1.d3agree === 1, 'synthetic: D3 1/1 agreement on the expedition gate row');
  // A leg where the replica disagrees with the gate is caught.
  const leg2 = seed({ seed: 104301, encounters: [
    enc({ origin: 'expedition', wild: wildSnap({ partySize: 1 }),
      gate: { result: 'null', reason: null, partySize: 1, sensedSize: 1, countedSize: 0,
        allArmed: true, allArmored: true, trickKnown: false, planStage: 'hunt', planTarget: 'strike', isTableVeteran: false } }),
  ] });
  const a2 = seedAnalysis(leg2);
  assert(a2.d3n === 1 && a2.d3agree === 0 && a2.d3disagree.length === 1,
    'synthetic: gate/result mismatch is recorded as a D3 disagreement');
  // Judges on fabricated summaries: instrument-passing but thin
  // population -> METRIC-BROKEN; full population -> DIAG-GO;
  // unclassified rows -> DIAG-NO-GO.
  function fakeSummary(o) {
    return Object.assign({ files: 8, seedList: FROZEN_SEEDS.slice(), instrumentErrors: 0, missingHp: 0,
      wildMeetings: 50, wildUnclassified: 0, wildSuburb: 5, d3n: 10, d3agree: 10, d3agreement: 1.0 }, o);
  }
  assert(judgeVerdict(fakeSummary({ wildMeetings: 3, wildSuburb: 1 })) === 'METRIC-BROKEN',
    'thin but clean leg: METRIC-BROKEN (got ' + judgeVerdict(fakeSummary({ wildMeetings: 3, wildSuburb: 1 })) + ')');
  assert(judgeVerdict(fakeSummary({})) === 'DIAG-GO',
    'full clean leg: DIAG-GO (got ' + judgeVerdict(fakeSummary({})) + ')');
  assert(judgeVerdict(fakeSummary({ wildUnclassified: 1 })) === 'DIAG-NO-GO',
    'unclassified rows: DIAG-NO-GO (got ' + judgeVerdict(fakeSummary({ wildUnclassified: 1 })) + ')');
  assert(judgeVerdict(fakeSummary({ d3n: 2, d3agree: 2, d3agreement: 1.0 })) === 'METRIC-BROKEN',
    'too few gate rows for D3: METRIC-BROKEN');
  const s1 = summarize({ bySeed: { 104301: a1 }, files: ['x'] });
  assert(judgeD1a(s1).pass === true, 'synthetic small leg: D1a passes (complete)');
  console.log(failures === 0 ? 'SELFTEST ALL PASS' : failures + ' SELFTEST FAILURES');
  process.exitCode = failures === 0 ? 0 : 1;
  return failures;
}

function main() {
  if (process.argv[2] === '--selftest') { selftest(); return; }
  const diagDir = process.argv[2];
  if (!diagDir) { console.error('FIGHTGATE-SCOPE ANALYZE STOP: diagDir required (or --selftest).'); process.exit(2); }
  const raw = loadDir(diagDir);
  const leg = loadDir(diagDir);
  for (const k of Object.keys(leg.bySeed)) leg.bySeed[k] = seedAnalysis(leg.bySeed[k]);
  const s = summarize(leg);
  const d1a = judgeD1a(s), d1b = judgeD1b(s), d2 = judgeD2(s), d3 = judgeD3(s), instr = judgeInstrument(s);
  const verdict = judgeVerdict(s);
  const out = {
    arm: 'fightgate-scope-b', run: 'fightgate-scope-b',
    diagDir: path.basename(diagDir),
    diag: s,
    bars: {
      d1aCompleteness: d1a, d1bPopulation: d1b, d2SuburbPresence: d2, d3GateAgreement: d3,
      instrument: instr,
    },
    verdict: verdict,
  };
  const outFile = process.env.FIGHTGATE_SCOPE_ANALYSIS_OUT
    ? path.join(REPO, process.env.FIGHTGATE_SCOPE_ANALYSIS_OUT)
    : path.join(REPO, 'evidence', '2026-11-18', 'fightgate-scope-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('=== fightgate-scope-b (diagnostic census) ===');
  console.log('seeds: ' + JSON.stringify(s.seedList) + ' files ' + s.files + ' launches ' + s.launches);
  console.log('encounters: ' + s.encounters + '  wild: ' + s.wildMeetings + ' ' + JSON.stringify(s.wildByOrigin) +
    '  expedition: ' + s.expedMeetings + ' (would-avoid ' + s.expedWouldAvoid + ')');
  console.log('wild would-avoid: ' + s.wildWouldAvoid + ' ' + JSON.stringify(s.wildWouldAvoidByRule) +
    '  deaths among them: ' + s.wildWouldAvoidDeaths +
    '  flees: ' + s.wildWouldAvoidFlees + ' (taken ' + s.wildWouldAvoidFleeTaken + ')');
  console.log('wild launched-plan meetings: ' + s.wildLaunched + '  of them would-avoid: ' + s.wildLaunchedWouldAvoid +
    '  wild plan-stage fighters: ' + s.wildPlanFighters);
  console.log('wild Suburb: ' + s.wildSuburb + ' (known ' + s.wildSuburbKnown + ' unknown ' + s.wildSuburbUnknown + ')' +
    '  outcomes ' + JSON.stringify(s.wildSuburbOutcomes) +
    '  wise leaves ' + s.wildSuburbWiseLeaves + ' deaths ' + s.wildSuburbDeaths + ' taken ' + s.wildSuburbTaken);
  console.log('D3 gate agreement: ' + s.d3agree + '/' + s.d3n + ' = ' + s.d3agreement +
    (s.d3disagree.length ? '  DISAGREE: ' + JSON.stringify(s.d3disagree) : ''));
  console.log('deaths: ' + s.deaths + ' exped ' + s.expedDeaths + ' starv ' + s.starvDeaths +
    '  wave-4 kills ' + s.w4kills);
  console.log('wall: ' + JSON.stringify(s.wall) + ' medianSurvival ' + s.medianSurvival);
  console.log('bars: D1a=' + (d1a.pass ? 'PASS' : 'FAIL') + ' D1b=' + (d1b.pass ? 'PASS' : 'FAIL') +
    ' D2=' + (d2.pass ? 'PASS' : 'FAIL') + ' D3=' + (d3.pass ? 'PASS' : (d3.unjudgeable ? 'UNJUDGEABLE' : 'FAIL')) +
    ' instrument=' + (instr.pass ? 'CLEAN' : 'DIRTY'));
  console.log('VERDICT: ' + verdict);
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (verdict !== 'DIAG-GO') process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { launchesForSeed: launchesForSeed, seedAnalysis: seedAnalysis, summarize: summarize,
  classifyWouldAvoid: classifyWouldAvoid, judgeD1a: judgeD1a, judgeD1b: judgeD1b, judgeD2: judgeD2,
  judgeD3: judgeD3, judgeInstrument: judgeInstrument, judgeVerdict: judgeVerdict,
  selftest: selftest, FROZEN_SEEDS: FROZEN_SEEDS, WILD_ORIGINS: WILD_ORIGINS };
