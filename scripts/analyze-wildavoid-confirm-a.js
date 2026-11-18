// analyze-wildavoid-confirm-a.js — classifier + judge for arm sim-wildavoid-confirm-a
// (CONFIRM, finding #2506: aid and world-tick meetings never consult
// winPlanFightGate. The census arm priced the gap at 18 avoidable wild
// meetings per 113; this arm builds the outmatched-avoid on the wild
// routers and judges it on two legs — MODE=ctl (WILDAVOID unset) vs
// MODE=arm (WILDAVOID=1) — on identical seeds, per the frozen prereg
// evidence/2026-11-18/sim-wildavoid-a-prereg.md):
//   B1 (the avoid fires): arm wild avoids >= 50% of ctl would-avoid
//       wild meetings. Contact: ctl would-avoid wild meetings >= 8.
//   B2 (no launch loss): wave-4 launch events armed >= 90% of ctl AND
//       launched instances armed >= 90% of ctl. (Events = raw v4departs
//       wave-4+ launch rows; instances = launchesForSeed deduped. The
//       prereg names dawnbidDeparts; v4departs is that wrap family's
//       wave-4+ record and carries the targetWave the wave-4 test
//       needs — same rows, same population.)
//   B3 (the price banks): arm wild wave-4+ deaths <= ctl AND arm wild
//       vFlee damage (sum vTaken) <= ctl.
//   B4 (Suburb harmless, RE-SCOPED per the re-judge prereg): arm
//       OUTMATCHED-Suburb deaths == 0 AND every outmatched Suburb meeting
//       on the arm leg was avoided (arm outmatched Suburb fought == 0).
//       Matched-party Suburb deaths are excluded; original-B4 numbers
//       are reported as context. Trick-known seeds reported, not gated.
//   C1 (median-survival cost): arm medianSurvival >= 0.90 * ctl.
//   C2 (starvation cost): arm starvDeaths <= ctl starvDeaths.
//   C3 (community-loss cost): arm communityLost <= ctl communityLost + 1.
//   B5 (instrument): 8/8 files per leg, exact frozen seed list, 0
//       instrument errors, missingHp 0, recMismatch 0, D3 replica-vs-
//       live-gate agreement >= 0.95 (n >= 5) on BOTH legs (guards the
//       gate refactor), D1a (0 unclassified) both legs, every arm avoid
//       row's snapshot classifies outmatched (0 mismatches), the
//       winPlanStats.wildAvoids counter equals the recorded avoids,
//       the 'gives it room' say lines equal the avoids (0 on ctl),
//       and trajectory control (first diverging day >= first avoid
//       day per seed, or no divergence when no avoid).
// Verdict: GO iff B1 && B2 && B3 && B4 && B5 && C1 && C2 && C3 (panel clean judged separately).
//   NO-GO iff any B fails with population present.
//   METRIC-BROKEN iff ctl would-avoid wild meetings < 8, or ctl wild
//   wave-4+ meetings < 40, or D3 n < 5 on either leg.
// The balanced panel (§15) is judged separately from its compare .md
// and is NOT part of this analyzer's verdict field.
// Launch join (for fought meetings): a v4encounters row is a
// launched-party meeting iff some launch (v4departs result=launch)
// by the same vid (or with the fighter among its party) has
// target == mid (or target null) and meeting day in
// [launchDay, launchDay+21] (max expedition duration 8+12=20, +1).
// Launches are deduped by (vid, day) across the winPlanDepart +
// brain depart rows; partySize is the max across the group.
// Usage:
//   node scripts/analyze-wildavoid-confirm-a.js <ctlDir> <armDir>
//   node scripts/analyze-wildavoid-confirm-a.js --selftest
// Writes evidence/2026-11-18/wildavoid-confirm-a-analysis.json.
// Exits 0 iff the verdict is GO.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const FROZEN_SEEDS = [104431, 104432, 104433, 104434, 104435, 104436, 104437, 104438, 104439, 104440, 104441, 104442, 104443, 104444, 104445, 104446];
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
// Raw wave-4+ launch events: v4departs launch rows under the same
// wave-4+ rule, WITHOUT dedup (the events half of B2; the instances
// half is launchesForSeed above).
function launchEventsW4ForSeed(j) {
  let n = 0;
  for (const d of (j.v4departs || [])) {
    if (d.result !== 'launch') continue;
    if ((((d.targetWave | 0) >= 4) || (d.target && W4_IDS.indexOf(d.target) !== -1))) n++;
  }
  return n;
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
// COPIED VERBATIM from scripts/analyze-fightgate-scope-b.js — do not
// edit the rule here; if the gate changes, this copy must be re-frozen
// against the gate by the D3 cross-check, not hand-tuned.
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

// dailyFingerprint(dayRow): the trajectory-control read — the parts of
// a daily snapshot that must be identical between ctl and arm until
// the arm's first avoid fires. Roster (vid + dead), kill log,
// veteran counts. Gear, positions, and hunger are NOT in the
// fingerprint (the census driver does not snapshot them); the D1
// repeatability check validates the fingerprint is deterministic.
function dailyFingerprint(r) {
  if (!r) return null;
  try {
    return JSON.stringify({
      day: r.day, scholar: r.scholarId || null,
      wkl: r.waveKillLog || [],
      roster: (r.roster || []).map(function (p) { return p.vid + ':' + (p.dead ? 1 : 0); }),
      v4: ((r.vetsW4 || {}).count | 0), v3: ((r.vetsW3 || {}).count | 0),
    });
  } catch (e) { return null; }
}

function seedAnalysis(j) {
  const launches = launchesForSeed(j);
  const launchEventsW4 = launchEventsW4ForSeed(j);
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
  // B3 inputs: wild wave-4+ deaths and wild flee damage (all wild
  // meetings, not just would-avoids — the avoid's price is measured
  // on the whole wild slice, so a reshuffle cannot hide in it).
  const wildDeaths = wild.filter(function (m) { return m.outcome === 'vDie'; }).length;
  const wildFlees = wild.filter(function (m) { return m.outcome === 'vFlee'; });
  const wildFleeTaken = wildFlees.reduce(function (t, m) { return t + (m.vTaken || 0); }, 0);
  const wildKills = wild.filter(function (m) { return m.outcome === 'vKill'; }).length;
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
  // WILDAVOID: the avoid rows. Every row's snapshot must classify
  // outmatched — the avoid fired, so the gate inputs at the avoid
  // instant MUST say outmatched; a mismatch means the recorder and
  // the rule disagree (instrument failure, B5).
  const avoids = (j.v4avoids || []).slice();
  const avoidByOrigin = {};
  for (const a of avoids) avoidByOrigin[a.origin || 'null'] = (avoidByOrigin[a.origin || 'null'] || 0) + 1;
  let avoidSnapMismatch = 0;
  const avoidMismatchRows = [];
  for (const a of avoids) {
    const c = classifyWouldAvoid(a.wild || null, a.wave);
    if (c.rule !== 'outmatched') {
      avoidSnapMismatch++;
      avoidMismatchRows.push({ day: a.day, vid: a.vid, mid: a.mid, wave: a.wave, origin: a.origin, rule: c.rule });
    }
  }
  const avoidsWithHelp = avoids.filter(function (a) { return (a.helpAtDoor | 0) > 0; }).length;
  const avoidSuburb = avoids.filter(function (a) { return a.mid === 'suburb'; }).length;
  const firstAvoidDay = avoids.length ? Math.min.apply(null, avoids.map(function (a) { return a.day; })) : null;
  const wildAvoidsStat = ((j.winPlanStats || {}).wildAvoids | 0);
  // The fiction line: one 'gives it room' say line per avoid.
  // vetSays rows are {day, line} objects (the driver's say wrap).
  const sayAvoidLines = (j.vetSays || []).filter(function (s) { return s && typeof s.line === 'string' && s.line.indexOf('gives it room') !== -1; }).length;
  // Trajectory control: daily fingerprints for the compare step.
  const dailyFp = ((j.daily || []).map(function (r) { return { day: r.day, fp: dailyFingerprint(r) }; }));
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    villageLost: !!j.villageLost,
    instrumentErrors: (j.instrumentErrors || []).length,
    launches: launches.length, launchedSizes: sizes, launchEventsW4: launchEventsW4,
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
    wildDeaths: wildDeaths, wildFleeTaken: wildFleeTaken, wildKills: wildKills,
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
    avoids: avoids.length, avoidByOrigin: avoidByOrigin,
    avoidSnapMismatch: avoidSnapMismatch, avoidMismatchRows: avoidMismatchRows,
    avoidsWithHelp: avoidsWithHelp, avoidSuburb: avoidSuburb,
    firstAvoidDay: firstAvoidDay, wildAvoidsStat: wildAvoidsStat,
    sayAvoidLines: sayAvoidLines,
    trickSuburbKnown: !!j.trickSuburbKnown,
    dailyFp: dailyFp,
    deaths: (j.deaths || []).length,
    expedDeaths: (j.deaths || []).filter(function (d) { return d.cause === 'expedition'; }).length,
    starvDeaths: (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length,
  };
}

function summarize(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const sizes = {};
  let launches = 0, launchEventsW4 = 0, fourth = 0, trios = 0;
  let encounters = 0, missingHp = 0, recMismatch = 0;
  let deaths = 0, exped = 0, starv = 0, errors = 0;
  let wild = 0, wildUnclassified = 0, wildWouldAvoid = 0, wildWouldAvoidDeaths = 0,
      wildWouldAvoidFlees = 0, wildWouldAvoidFleeTaken = 0, wildWouldAvoidTaken = 0,
      wildDeaths = 0, wildFleeTaken = 0, wildKills = 0,
      wildLaunched = 0, wildLaunchedWouldAvoid = 0, wildPlanFighters = 0,
      wildSuburb = 0, wildSuburbKnown = 0, wildSuburbUnknown = 0,
      wildSuburbWiseLeaves = 0, wildSuburbDeaths = 0, wildSuburbTaken = 0,
      expedMeetings = 0, expedWouldAvoid = 0, d3n = 0, d3agree = 0, w4kills = 0,
      avoids = 0, avoidSnapMismatch = 0, avoidsWithHelp = 0, avoidSuburb = 0,
      wildAvoidsStat = 0, sayAvoidLines = 0, trickSuburbKnown = 0;
  const wildByOrigin = {}, wildWouldAvoidByRule = {}, wildSuburbOutcomes = {}, avoidByOrigin = {};
  const d3disagree = [], avoidMismatchRows = [];
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  for (const s of seeds) {
    launches += s.launches; launchEventsW4 += s.launchEventsW4; fourth += s.fourthFills; trios += s.trioFills;
    encounters += s.encounters; missingHp += s.missingHp; recMismatch += s.recMismatch || 0;
    deaths += s.deaths; exped += s.expedDeaths; starv += s.starvDeaths; errors += s.instrumentErrors;
    for (const k of Object.keys(s.launchedSizes)) sizes[k] = (sizes[k] || 0) + s.launchedSizes[k];
    wild += s.wildMeetings; wildUnclassified += s.wildUnclassified;
    wildWouldAvoid += s.wildWouldAvoid; wildWouldAvoidDeaths += s.wildWouldAvoidDeaths;
    wildWouldAvoidFlees += s.wildWouldAvoidFlees; wildWouldAvoidFleeTaken += s.wildWouldAvoidFleeTaken;
    wildWouldAvoidTaken += s.wildWouldAvoidTaken;
    wildDeaths += s.wildDeaths; wildFleeTaken += s.wildFleeTaken; wildKills += s.wildKills;
    wildLaunched += s.wildLaunched; wildLaunchedWouldAvoid += s.wildLaunchedWouldAvoid;
    wildPlanFighters += s.wildPlanFighters;
    wildSuburb += s.wildSuburb; wildSuburbKnown += s.wildSuburbKnown; wildSuburbUnknown += s.wildSuburbUnknown;
    wildSuburbWiseLeaves += s.wildSuburbWiseLeaves; wildSuburbDeaths += s.wildSuburbDeaths;
    wildSuburbTaken += s.wildSuburbTaken;
    expedMeetings += s.expedMeetings; expedWouldAvoid += s.expedWouldAvoid;
    d3n += s.d3n; d3agree += s.d3agree; w4kills += s.w4kills;
    avoids += s.avoids; avoidSnapMismatch += s.avoidSnapMismatch;
    avoidsWithHelp += s.avoidsWithHelp; avoidSuburb += s.avoidSuburb;
    wildAvoidsStat += s.wildAvoidsStat; sayAvoidLines += s.sayAvoidLines;
    if (s.trickSuburbKnown) trickSuburbKnown++;
    for (const k of Object.keys(s.wildByOrigin)) wildByOrigin[k] = (wildByOrigin[k] || 0) + s.wildByOrigin[k];
    for (const k of Object.keys(s.wildWouldAvoidByRule)) wildWouldAvoidByRule[k] = (wildWouldAvoidByRule[k] || 0) + s.wildWouldAvoidByRule[k];
    for (const k of Object.keys(s.wildSuburbOutcomes)) wildSuburbOutcomes[k] = (wildSuburbOutcomes[k] || 0) + s.wildSuburbOutcomes[k];
    for (const k of Object.keys(s.avoidByOrigin)) avoidByOrigin[k] = (avoidByOrigin[k] || 0) + s.avoidByOrigin[k];
    for (const d of (s.d3disagree || [])) d3disagree.push(d);
    for (const r of (s.avoidMismatchRows || [])) avoidMismatchRows.push(r);
  }
  return {
    files: leg.files.length, seeds: seeds.length,
    seedList: seeds.map(function (s) { return s.seed; }),
    launches: launches, launchEventsW4: launchEventsW4, launchedSizes: sizes,
    fourthFills: fourth, trioFills: trios,
    encounters: encounters, missingHp: missingHp, recMismatch: recMismatch,
    wildMeetings: wild, wildByOrigin: wildByOrigin,
    wildUnclassified: wildUnclassified,
    wildWouldAvoid: wildWouldAvoid, wildWouldAvoidByRule: wildWouldAvoidByRule,
    wildWouldAvoidDeaths: wildWouldAvoidDeaths,
    wildWouldAvoidFlees: wildWouldAvoidFlees,
    wildWouldAvoidFleeTaken: wildWouldAvoidFleeTaken,
    wildWouldAvoidTaken: wildWouldAvoidTaken,
    wildDeaths: wildDeaths, wildFleeTaken: wildFleeTaken, wildKills: wildKills,
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
    avoids: avoids, avoidByOrigin: avoidByOrigin,
    avoidSnapMismatch: avoidSnapMismatch, avoidMismatchRows: avoidMismatchRows,
    avoidsWithHelp: avoidsWithHelp, avoidSuburb: avoidSuburb,
    wildAvoidsStat: wildAvoidsStat, sayAvoidLines: sayAvoidLines,
    trickSuburbKnown: trickSuburbKnown,
    deaths: deaths, expedDeaths: exped, starvDeaths: starv,
    instrumentErrors: errors,
    survived: seeds.filter(function (s) { return !s.villageLost; }).length,
    communityLost: seeds.filter(function (s) { return ['village-lost', 'village-dead', 'pop-zero'].indexOf(s.endReason) !== -1; }).length,
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

// Trajectory control: per seed, the first day the ctl and arm daily
// fingerprints diverge. The arm's first avoid day must be <= that day
// (the avoid is the only src change — nothing may diverge before its
// first effect). A seed with no avoid must not diverge at all. A
// divergence caused only by a shorter daily array (one village died
// earlier) counts at the first missing day.
function trajectoryControl(ctlSum, armSum) {
  const rows = [];
  let pass = true;
  for (const c of ctlSum.perSeed) {
    const a = armSum.perSeed.filter(function (x) { return x.seed === c.seed; })[0];
    if (!a) { rows.push({ seed: c.seed, pass: false, why: 'no arm seed' }); pass = false; continue; }
    const cFp = c.dailyFp || [], aFp = a.dailyFp || [];
    const cMap = {}, aMap = {};
    for (const r of cFp) cMap[r.day] = r.fp;
    for (const r of aFp) aMap[r.day] = r.fp;
    const days = Object.keys(cMap).concat(Object.keys(aMap)).map(function (x) { return +x; })
      .filter(function (v, i, arr) { return arr.indexOf(v) === i; }).sort(function (x, y) { return x - y; });
    let firstDiv = null;
    for (const d of days) {
      if (cMap[d] === undefined || aMap[d] === undefined || cMap[d] !== aMap[d]) { firstDiv = d; break; }
    }
    const firstAvoid = a.firstAvoidDay;
    let ok = false, why = '';
    if (firstDiv == null && firstAvoid == null) { ok = true; why = 'identical, no avoid'; }
    else if (firstDiv == null && firstAvoid != null) { ok = true; why = 'identical despite avoids from d' + firstAvoid + ' (avoid changed no fingerprinted state)'; }
    else if (firstDiv != null && firstAvoid != null && firstDiv >= firstAvoid) { ok = true; why = 'div d' + firstDiv + ' >= first avoid d' + firstAvoid; }
    else if (firstDiv != null && firstAvoid == null) { ok = false; why = 'diverged d' + firstDiv + ' with NO avoid on the arm leg'; }
    else { ok = false; why = 'div d' + firstDiv + ' BEFORE first avoid d' + firstAvoid; }
    if (!ok) pass = false;
    rows.push({ seed: c.seed, pass: ok, firstDivDay: firstDiv, firstAvoidDay: firstAvoid, why: why });
  }
  return { pass: pass, rows: rows };
}

// Frozen bars (from the prereg). Exported for the proof test.
function judgeInstrumentLeg(s) {
  const seedList = (s.seedList || []).slice().sort(function (a, b) { return a - b; });
  const frozen = FROZEN_SEEDS.slice().sort(function (a, b) { return a - b; });
  const seedsMatch = seedList.length === frozen.length &&
    seedList.every(function (v, i) { return v === frozen[i]; });
  const pass = s.files === 16 && seedsMatch && s.instrumentErrors === 0 && s.missingHp === 0 && s.recMismatch === 0;
  return { pass: pass, files: s.files, expectedFiles: 16, seedsMatch: seedsMatch,
    errors: s.instrumentErrors, missingHp: s.missingHp, recMismatch: s.recMismatch };
}
function judgeD3Leg(s) {
  if (s.d3n < 5) return { pass: false, unjudgeable: true, n: s.d3n, agreement: s.d3agreement, bar: 0.95 };
  return { pass: (s.d3agreement || 0) >= 0.95, unjudgeable: false, n: s.d3n, agreement: s.d3agreement, bar: 0.95 };
}
function judgeB1(ctl, arm) {
  const contact = ctl.wildWouldAvoid >= 8;
  return { pass: contact && arm.avoids >= 0.5 * ctl.wildWouldAvoid,
    contact: contact, ctlWouldAvoid: ctl.wildWouldAvoid, armAvoids: arm.avoids,
    ratio: ctl.wildWouldAvoid ? round(arm.avoids / ctl.wildWouldAvoid, 4) : null, bar: 0.5 };
}
function judgeB2(ctl, arm) {
  const eventsOk = ctl.launchEventsW4 === 0 ? (arm.launchEventsW4 === 0) : (arm.launchEventsW4 >= 0.9 * ctl.launchEventsW4);
  const instOk = ctl.launches === 0 ? (arm.launches === 0) : (arm.launches >= 0.9 * ctl.launches);
  return { pass: eventsOk && instOk,
    events: { ctl: ctl.launchEventsW4, arm: arm.launchEventsW4, pass: eventsOk },
    instances: { ctl: ctl.launches, arm: arm.launches, pass: instOk }, bar: 0.9 };
}
function judgeB3(ctl, arm) {
  return { pass: arm.wildDeaths <= ctl.wildDeaths && arm.wildFleeTaken <= ctl.wildFleeTaken,
    deaths: { ctl: ctl.wildDeaths, arm: arm.wildDeaths },
    fleeTaken: { ctl: ctl.wildFleeTaken, arm: arm.wildFleeTaken } };
}
function judgeB4(ctl, arm) {
  // RE-SCOPED (re-judge prereg): only OUTMATCHED Suburb meetings count.
  // A fought wild Suburb meeting whose snapshot classifies outmatched
  // means the lever failed to fire; an outmatched death is a B4 failure.
  // Matched-party Suburb deaths are excluded (reported as context).
  const fought = [];
  for (const s of arm.perSeed) {
    for (const m of (s.meetings || [])) {
      if (m.isWild && m.mid === 'suburb' && m.avoidRule === 'outmatched') {
        fought.push({ seed: s.seed, day: m.day, outcome: m.outcome });
      }
    }
  }
  const outmatchedDeaths = fought.filter(function (f) { return f.outcome === 'vDie'; }).length;
  const badOutcomes = [];
  for (const s of arm.perSeed) {
    for (const m of (s.meetings || [])) {
      if (m.isWild && m.mid === 'suburb' && ['vFlee', 'mFlee'].indexOf(m.outcome) === -1) {
        badOutcomes.push({ seed: s.seed, day: m.day, outcome: m.outcome });
      }
    }
  }
  return { pass: outmatchedDeaths === 0 && fought.length === 0,
    outmatchedSuburbFought: fought, outmatchedSuburbDeaths: outmatchedDeaths,
    outmatchedSuburbAvoided: arm.avoidSuburb,
    // Original-B4 numbers as context (not gated):
    deathsAllSuburb: arm.wildSuburbDeaths, badOutcomes: badOutcomes,
    trickKnown: { ctl: ctl.trickSuburbKnown, arm: arm.trickSuburbKnown } };
}
function judgeB5(ctl, arm, traj) {
  const iCtl = judgeInstrumentLeg(ctl), iArm = judgeInstrumentLeg(arm);
  const d3Ctl = judgeD3Leg(ctl), d3Arm = judgeD3Leg(arm);
  const d1aCtl = ctl.wildUnclassified === 0, d1aArm = arm.wildUnclassified === 0;
  const snapOk = arm.avoidSnapMismatch === 0;
  const statOk = arm.wildAvoidsStat === arm.avoids;
  const sayOk = arm.sayAvoidLines === arm.avoids && ctl.sayAvoidLines === 0 && ctl.avoids === 0;
  return { pass: iCtl.pass && iArm.pass && d3Ctl.pass && d3Arm.pass && d1aCtl && d1aArm &&
      snapOk && statOk && sayOk && traj.pass,
    instrument: { ctl: iCtl, arm: iArm },
    d3: { ctl: d3Ctl, arm: d3Arm },
    d1a: { ctlUnclassified: ctl.wildUnclassified, armUnclassified: arm.wildUnclassified },
    avoidSnapMismatch: arm.avoidSnapMismatch,
    wildAvoidsStat: { stat: arm.wildAvoidsStat, rows: arm.avoids, pass: statOk },
    sayLines: { ctl: ctl.sayAvoidLines, arm: arm.sayAvoidLines, avoids: arm.avoids, pass: sayOk },
    trajectory: traj };
}
function judgeCost(ctl, arm) {
  const c1ratio = ctl.medianSurvival ? round(arm.medianSurvival / ctl.medianSurvival, 4) : null;
  const c1 = { pass: ctl.medianSurvival === 0 ? true : arm.medianSurvival >= 0.9 * ctl.medianSurvival,
    ctl: ctl.medianSurvival, arm: arm.medianSurvival, ratio: c1ratio, bar: 0.9 };
  const c2 = { pass: arm.starvDeaths <= ctl.starvDeaths,
    ctl: ctl.starvDeaths, arm: arm.starvDeaths };
  const c3 = { pass: arm.communityLost <= ctl.communityLost + 1,
    ctl: ctl.communityLost, arm: arm.communityLost, bar: '+1' };
  return { c1: c1, c2: c2, c3: c3,
    pass: c1.pass && c2.pass && c3.pass };
}
function judgeVerdict(c) {
  const b = c.bars;
  if (b.metricBroken) return 'METRIC-BROKEN';
  if (!b.b1.pass || !b.b2.pass || !b.b3.pass || !b.b4.pass || !b.b5.pass ||
      !b.cost || !b.cost.pass) return 'NO-GO';
  return 'GO';
}

function compare(ctlDir, armDir) {
  const ctlLeg = loadDir(ctlDir), armLeg = loadDir(armDir);
  for (const k of Object.keys(ctlLeg.bySeed)) ctlLeg.bySeed[k] = seedAnalysis(ctlLeg.bySeed[k]);
  for (const k of Object.keys(armLeg.bySeed)) armLeg.bySeed[k] = seedAnalysis(armLeg.bySeed[k]);
  const ctl = summarize(ctlLeg), arm = summarize(armLeg);
  const traj = trajectoryControl(ctl, arm);
  const b1 = judgeB1(ctl, arm), b2 = judgeB2(ctl, arm), b3 = judgeB3(ctl, arm),
    b4 = judgeB4(ctl, arm), b5 = judgeB5(ctl, arm, traj),
    cost = judgeCost(ctl, arm);
  const metricBroken = ctl.wildWouldAvoid < 8 || ctl.wildMeetings < 40 ||
    ctl.d3n < 5 || arm.d3n < 5;
  const bars = { b1: b1, b2: b2, b3: b3, b4: b4, b5: b5, cost: cost, metricBroken: metricBroken,
    metricBrokenWhy: metricBroken ? {
      ctlWouldAvoid: ctl.wildWouldAvoid, ctlWildMeetings: ctl.wildMeetings,
      ctlD3n: ctl.d3n, armD3n: arm.d3n } : null };
  const verdict = judgeVerdict({ bars: bars });
  return { ctl: ctl, arm: arm, bars: bars, verdict: verdict,
    ctlDir: path.basename(ctlDir), armDir: path.basename(armDir) };
}

function selftest() {
  let failures = 0;
  function fail(m) { failures++; console.error('SELFTEST FAIL: ' + m); }
  function ok(m) { console.log('selftest ok: ' + m); }
  function assert(c, m) { if (c) ok(m); else fail(m); }
  // Classifier table (verbatim gate rules — same table as the census).
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
  // Synthetic legs: ctl stages 10 would-avoid wild meetings (1 death,
  // 2 flees / 60 taken); arm avoids 6 of the population (all snapshots
  // outmatched), stages 4 wild meetings, 0 wild deaths, 0 flee damage,
  // same launches, Suburb clean, trick known on both.
  function wildSnap(o) {
    return Object.assign({ planStage: null, planTarget: null, planParty: [], party: ['a'], partySize: 1,
      sensedSize: 1, countedSize: 0, allArmed: true, allArmored: true, gear: {}, isTableVeteran: false }, o);
  }
  function enc(o) {
    return Object.assign({ day: 50, vid: 'a', mid: 'strike', wave: 4, outcome: 'vFlee', rounds: 3,
      mDealt: 100, vTaken: 40, mHpStart: 500, mHpStartRec: 500, alliesN: 0, allyVid: null,
      calledHelp: false, origin: 'world-tick', fleeWise: false, fleeLearn: false,
      trickBefore: false, trickAfter: false, wild: wildSnap({}), gate: null }, o);
  }
  function dailyRow(day) {
    return { day: day, scholarId: 'a', waveKillLog: [], waveKills: {}, wave4Slain: 0,
      vetsW3: { count: 0, killers: [] }, vetsW4: { count: 0, killers: [] },
      roster: [{ vid: 'a', name: 'A', dead: false }], veteranRows: [], partyMembers: [],
      ready4: { ready: false }, ready5: { ready: false } };
  }
  function seedJ(o) {
    return Object.assign({ seed: 104411, days: 150, gameDays: 150, endReason: 'horizon', standing: 120,
      scaleRank: 'village', won: false, maxWave: 4, villageLost: false, instrumentErrors: [],
      winPlanStats: { wildAvoids: 0 }, v4seeds: [], v4departs: [], dawnbidScores: [],
      v4encounters: [], v4avoids: [], trickSuburbKnown: false, companionPool: [], deaths: [],
      daily: [dailyRow(1), dailyRow(2)], vetSays: [] }, o);
  }
  // B1: 6 avoids vs 10 would-avoids = 0.6 >= 0.5.
  assert(judgeB1({ wildWouldAvoid: 10 }, { avoids: 6 }).pass === true, 'B1 passes at 6/10 avoids');
  assert(judgeB1({ wildWouldAvoid: 10 }, { avoids: 4 }).pass === false, 'B1 fails at 4/10 avoids');
  assert(judgeB1({ wildWouldAvoid: 3 }, { avoids: 3 }).contact === false, 'B1 contact fails below 8 would-avoids');
  // B2: 90% rule on both halves; 0/0 passes.
  assert(judgeB2({ launchEventsW4: 10, launches: 5 }, { launchEventsW4: 9, launches: 5 }).pass === true,
    'B2 passes at 9/10 events, 5/5 instances');
  assert(judgeB2({ launchEventsW4: 10, launches: 5 }, { launchEventsW4: 8, launches: 5 }).pass === false,
    'B2 fails at 8/10 events');
  assert(judgeB2({ launchEventsW4: 0, launches: 0 }, { launchEventsW4: 0, launches: 0 }).pass === true,
    'B2 passes at 0/0 (no launches staged on either leg)');
  // B3: deaths and flee damage both down-or-equal.
  assert(judgeB3({ wildDeaths: 2, wildFleeTaken: 100 }, { wildDeaths: 0, wildFleeTaken: 0 }).pass === true,
    'B3 passes when deaths and flee damage fall');
  assert(judgeB3({ wildDeaths: 2, wildFleeTaken: 100 }, { wildDeaths: 2, wildFleeTaken: 101 }).pass === false,
    'B3 fails when flee damage rises by 1');
  // B4 RE-SCOPED: only OUTMATCHED Suburb meetings count. A matched-party
  // Suburb death does NOT fail; an outmatched fought Suburb meeting does.
  // judgeB4 reads arm.perSeed meetings; build the summary-shaped input.
  function b4arm(o) {
    return { wildSuburbDeaths: o.deaths || 0, trickSuburbKnown: (o.known | 0),
      avoidSuburb: o.avoidSuburb || 0,
      perSeed: [{ seed: 104431, meetings: o.meetings || [] }] };
  }
  function subMeet(o) {
    return Object.assign({ isWild: true, mid: 'suburb', outcome: 'vFlee', avoidRule: 'none' }, o);
  }
  assert(judgeB4({ trickSuburbKnown: 3 }, b4arm({ deaths: 0, known: 3,
    meetings: [subMeet({ outcome: 'vFlee', avoidRule: 'none' })] })).pass === true,
    'B4 re-scoped passes on a clean Suburb slice');
  assert(judgeB4({ trickSuburbKnown: 3 }, b4arm({ deaths: 1, known: 3,
    meetings: [subMeet({ outcome: 'vDie', avoidRule: 'none' })] })).pass === true,
    'B4 re-scoped passes on a MATCHED-party Suburb death (excluded by scope)');
  assert(judgeB4({ trickSuburbKnown: 3 }, b4arm({ deaths: 0, known: 3, avoidSuburb: 1,
    meetings: [subMeet({ outcome: 'vFlee', avoidRule: 'none' })] })).pass === true,
    'B4 re-scoped passes with 1 outmatched Suburb avoided and none fought');
  assert(judgeB4({ trickSuburbKnown: 3 }, b4arm({ deaths: 0, known: 3,
    meetings: [subMeet({ outcome: 'vFlee', avoidRule: 'outmatched' })] })).pass === false,
    'B4 re-scoped fails on an outmatched Suburb meeting fought (lever did not fire)');
  assert(judgeB4({ trickSuburbKnown: 3 }, b4arm({ deaths: 1, known: 3,
    meetings: [subMeet({ outcome: 'vDie', avoidRule: 'outmatched' })] })).pass === false,
    'B4 re-scoped fails on an outmatched Suburb death');
  // Cost bars C1-C3.
  assert(judgeCost({ medianSurvival: 130, starvDeaths: 5, communityLost: 2 },
    { medianSurvival: 125, starvDeaths: 4, communityLost: 2 }).pass === true,
    'cost bars pass: survival 125/130, starvation down, community equal');
  assert(judgeCost({ medianSurvival: 130, starvDeaths: 5, communityLost: 2 },
    { medianSurvival: 110, starvDeaths: 4, communityLost: 2 }).pass === false,
    'C1 fails when median survival falls below 90% of ctl');
  assert(judgeCost({ medianSurvival: 130, starvDeaths: 5, communityLost: 2 },
    { medianSurvival: 125, starvDeaths: 6, communityLost: 2 }).pass === false,
    'C2 fails when starvation deaths rise');
  assert(judgeCost({ medianSurvival: 130, starvDeaths: 5, communityLost: 2 },
    { medianSurvival: 125, starvDeaths: 4, communityLost: 4 }).pass === false,
    'C3 fails when community loss rises by 2');
  // Trajectory control: divergence before the first avoid fails; after
  // passes; no avoid + no divergence passes; no avoid + divergence fails.
  const fpA = [{ day: 1, fp: 'a' }, { day: 2, fp: 'b' }];
  const fpB = [{ day: 1, fp: 'a' }, { day: 2, fp: 'c' }];
  const fpC = [{ day: 1, fp: 'a' }, { day: 2, fp: 'b' }];
  function trajLeg(fp, firstAvoid) {
    return { perSeed: [{ seed: 104411, dailyFp: fp, firstAvoidDay: firstAvoid }] };
  }
  assert(trajectoryControl(trajLeg(fpA, null), trajLeg(fpB, 2)).pass === true,
    'trajectory passes: div d2 >= first avoid d2');
  assert(trajectoryControl(trajLeg(fpA, null), trajLeg(fpB, 5)).pass === false,
    'trajectory fails: div d2 before first avoid d5');
  assert(trajectoryControl(trajLeg(fpA, null), trajLeg(fpA, null)).pass === true,
    'trajectory passes: identical, no avoid');
  assert(trajectoryControl(trajLeg(fpA, null), trajLeg(fpB, null)).pass === false,
    'trajectory fails: diverged with no avoid');
  // Avoid snapshot mismatch: an avoid row whose snapshot is NOT
  // outmatched is counted, never silently accepted.
  const aMismatch = seedAnalysis(seedJ({ v4avoids: [{ day: 50, vid: 'a', mid: 'strike', wave: 4,
    origin: 'world-tick', viaAid: false, helpAtDoor: 0,
    wild: wildSnap({ partySize: 3, allArmed: true, allArmored: true }) }] }));
  assert(aMismatch.avoidSnapMismatch === 1, 'avoid with a full geared snapshot counts as a mismatch');
  const aOk = seedAnalysis(seedJ({ v4avoids: [{ day: 50, vid: 'a', mid: 'strike', wave: 4,
    origin: 'aid', viaAid: true, helpAtDoor: 0,
    wild: wildSnap({ partySize: 2, allArmed: true, allArmored: true }) }],
    winPlanStats: { wildAvoids: 1 }, vetSays: [{ day: 50, line: 'Mara sees the beast and gives it room — not ready alone, going back for help.' }] }));
  assert(aOk.avoidSnapMismatch === 0 && aOk.avoids === 1 && aOk.avoidByOrigin.aid === 1 &&
    aOk.wildAvoidsStat === 1 && aOk.sayAvoidLines === 1,
    'clean avoid row: counted once, aid origin, stat + say line agree');
  // Verdict mapping on fabricated bars.
  function fakeBars(o) {
    return Object.assign({ b1: { pass: true }, b2: { pass: true }, b3: { pass: true },
      b4: { pass: true }, b5: { pass: true }, cost: { pass: true }, metricBroken: false }, o);
  }
  assert(judgeVerdict({ bars: fakeBars({}) }) === 'GO', 'all bars pass: GO');
  assert(judgeVerdict({ bars: fakeBars({ b3: { pass: false } }) }) === 'NO-GO', 'a failed bar: NO-GO');
  assert(judgeVerdict({ bars: fakeBars({ cost: { pass: false } }) }) === 'NO-GO', 'a failed cost bar: NO-GO');
  assert(judgeVerdict({ bars: fakeBars({ metricBroken: true }) }) === 'METRIC-BROKEN', 'metric-broken flag: METRIC-BROKEN');
  console.log(failures === 0 ? 'SELFTEST ALL PASS' : failures + ' SELFTEST FAILURES');
  process.exitCode = failures === 0 ? 0 : 1;
  return failures;
}

function main() {
  if (process.argv[2] === '--selftest') { selftest(); return; }
  const ctlDir = process.argv[2], armDir = process.argv[3];
  if (!ctlDir || !armDir) { console.error('WILDAVOID ANALYZE STOP: ctlDir and armDir required (or --selftest).'); process.exit(2); }
  const c = compare(ctlDir, armDir);
  const out = {
    arm: 'wildavoid-confirm-a', run: 'wildavoid-confirm-a',
    ctlDir: c.ctlDir, armDir: c.armDir,
    ctl: c.ctl, arm: c.arm,
    bars: c.bars,
    verdict: c.verdict,
  };
  const outFile = process.env.WILDAVOID_ANALYSIS_OUT
    ? path.join(REPO, process.env.WILDAVOID_ANALYSIS_OUT)
    : path.join(REPO, 'evidence', '2026-11-18', 'wildavoid-confirm-a-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  const ctl = c.ctl, arm = c.arm, b = c.bars;
  console.log('=== wildavoid-confirm-a (ctl vs arm) ===');
  console.log('seeds: ' + JSON.stringify(ctl.seedList) + ' files ctl ' + ctl.files + ' arm ' + arm.files);
  console.log('wild meetings: ctl ' + ctl.wildMeetings + ' ' + JSON.stringify(ctl.wildByOrigin) +
    '  arm ' + arm.wildMeetings + ' ' + JSON.stringify(arm.wildByOrigin));
  console.log('would-avoid (ctl): ' + ctl.wildWouldAvoid + ' ' + JSON.stringify(ctl.wildWouldAvoidByRule) +
    '  avoids (arm): ' + arm.avoids + ' ' + JSON.stringify(arm.avoidByOrigin) +
    '  ratio ' + (b.b1.ratio == null ? 'null' : b.b1.ratio));
  console.log('wild deaths: ctl ' + ctl.wildDeaths + ' arm ' + arm.wildDeaths +
    '  wild flee damage: ctl ' + ctl.wildFleeTaken + ' arm ' + arm.wildFleeTaken +
    '  wild kills: ctl ' + ctl.wildKills + ' arm ' + arm.wildKills);
  console.log('launches: events ctl ' + ctl.launchEventsW4 + ' arm ' + arm.launchEventsW4 +
    '  instances ctl ' + ctl.launches + ' arm ' + arm.launches);
  console.log('wild Suburb: ctl ' + ctl.wildSuburb + ' arm ' + arm.wildSuburb +
    '  deaths ctl ' + ctl.wildSuburbDeaths + ' arm ' + arm.wildSuburbDeaths +
    '  trick-known seeds ctl ' + ctl.trickSuburbKnown + ' arm ' + arm.trickSuburbKnown +
    '  avoids on Suburb (arm): ' + arm.avoidSuburb +
    '  outmatched fought (arm): ' + JSON.stringify(b.b4.outmatchedSuburbFought) +
    '  outmatched deaths (arm): ' + b.b4.outmatchedSuburbDeaths);
  console.log('avoids with help at door: ' + arm.avoidsWithHelp +
    '  avoid snapshot mismatches: ' + arm.avoidSnapMismatch +
    '  wildAvoids stat vs rows: ' + arm.wildAvoidsStat + ' vs ' + arm.avoids +
    '  say lines: ctl ' + ctl.sayAvoidLines + ' arm ' + arm.sayAvoidLines);
  console.log('D3 gate agreement: ctl ' + ctl.d3agree + '/' + ctl.d3n + ' = ' + ctl.d3agreement +
    '  arm ' + arm.d3agree + '/' + arm.d3n + ' = ' + arm.d3agreement);
  console.log('trajectory: ' + (b.b5.trajectory.pass ? 'PASS' : 'FAIL') +
    ' ' + JSON.stringify(b.b5.trajectory.rows.map(function (r) { return r.seed + ':' + r.why; })));
  console.log('deaths: ctl ' + ctl.deaths + ' arm ' + arm.deaths +
    '  wall ctl ' + JSON.stringify(ctl.wall) + ' arm ' + JSON.stringify(arm.wall) +
    '  medianSurvival ctl ' + ctl.medianSurvival + ' arm ' + arm.medianSurvival);
  console.log('cost: C1 medianSurvival ctl ' + ctl.medianSurvival + ' arm ' + arm.medianSurvival +
    ' ratio ' + b.cost.c1.ratio + '  C2 starvation ctl ' + ctl.starvDeaths + ' arm ' + arm.starvDeaths +
    '  C3 communityLost ctl ' + ctl.communityLost + ' arm ' + arm.communityLost);
  console.log('bars: B1=' + (b.b1.pass ? 'PASS' : 'FAIL') + ' B2=' + (b.b2.pass ? 'PASS' : 'FAIL') +
    ' B3=' + (b.b3.pass ? 'PASS' : 'FAIL') + ' B4=' + (b.b4.pass ? 'PASS' : 'FAIL') +
    ' B5=' + (b.b5.pass ? 'PASS' : 'FAIL') +
    ' C1=' + (b.cost.c1.pass ? 'PASS' : 'FAIL') + ' C2=' + (b.cost.c2.pass ? 'PASS' : 'FAIL') +
    ' C3=' + (b.cost.c3.pass ? 'PASS' : 'FAIL') + (b.metricBroken ? ' METRIC-BROKEN' : ''));
  console.log('VERDICT: ' + c.verdict);
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (c.verdict !== 'GO') process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { judgeCost: judgeCost,
  launchesForSeed: launchesForSeed, launchEventsW4ForSeed: launchEventsW4ForSeed,
  seedAnalysis: seedAnalysis, summarize: summarize,
  classifyWouldAvoid: classifyWouldAvoid, dailyFingerprint: dailyFingerprint,
  trajectoryControl: trajectoryControl,
  judgeB1: judgeB1, judgeB2: judgeB2, judgeB3: judgeB3, judgeB4: judgeB4, judgeB5: judgeB5,
  judgeInstrumentLeg: judgeInstrumentLeg, judgeD3Leg: judgeD3Leg,
  judgeVerdict: judgeVerdict, compare: compare,
  selftest: selftest, FROZEN_SEEDS: FROZEN_SEEDS, WILD_ORIGINS: WILD_ORIGINS };
