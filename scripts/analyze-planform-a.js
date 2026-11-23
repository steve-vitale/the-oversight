// analyze-planform-a.js — plan-formation classifier + band summary for
// arm sim-planform-a (what turns a wave-4 meeting into a wave-4 plan).
//
// Reads per-seed corpora written by scripts/planform-driver-a.js
// (evidence/2026-11-23/perseed-planform-a-ctl/) and, for every wave-4
// meeting (a villager facing a wave-4 monster blow-by-blow, or giving
// it room at the gate), names the formation rule from the frozen
// taxonomy in evidence/2026-11-23/sim-planform-a-prereg.md §5
// (evaluated in order, first match wins). Wave-3 meetings are
// classified identically and reported for the profile comparison;
// wave-5 meetings likewise. The scholar's meetings are out of the
// population (plans belong to villagers) and are counted separately.
//
// A "meeting" is one fieldFight row with wave >= 3, PLUS one
// winPlanFightGate row with result 'avoid' and no fieldFight row for
// the same (vid, day, mid). Seed calls join to meetings in file order
// on (vid, day, mid), preferring a seed whose path matches the
// meeting's origin. A "seeded" meeting is one whose seed call set
// target = the faced monster with needWave == the monster's wave
// (needWave >= 4 for the judged wave-4 set).
//
// Usage:
//   node scripts/analyze-planform-a.js [--dir <corpus-dir>]
//       [--out <analysis.json>] [--selftest] [--diff <dirA> <dirB>]
//   --selftest runs the built-in fixture suite (one synthetic corpus
//   per taxonomy row + join + seeded-later + determinism checks) and
//   exits non-zero on any failure. --diff compares two corpus dirs
//   seed by seed on (classCounts, launches, days) for the
//   determinism check.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const LOCK_STAGES = ['hunt', 'standing', 'table'];
const NO_SEED_OUTCOMES_WILDTICK = ['evade', 'mFlee', 'vDie', 'alreadyDead'];
const NO_SEED_OUTCOMES_EXPED = ['mFlee', 'vDie', 'alreadyDead'];
const OTHER_ROUTERS = ['contest', 'alien-player', 'psycho'];

function loadWave4pIds() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return []; }
}
const W4P_SET = new Set(loadWave4pIds());

function isW4pPlan(p) {
  if (!p) return false;
  if ((p.needWave | 0) >= 4) return true;
  return !!(p.target && W4P_SET.has(p.target));
}
function isW4pRow(r) {
  if (!r) return false;
  if ((r.targetWave | 0) >= 4) return true;
  if ((r.needWave | 0) >= 4) return true;
  return !!(r.target && W4P_SET.has(r.target));
}

// resolveW4pDepart / countLaunches / maxWaveReached: the
// launchsilence instrument, unchanged — the driver is a copy, so the
// launch count is comparable across the two arms.
function resolveW4pDepart(seed, row) {
  if (isW4pRow(row)) return true;
  if (!row || !row.vid || row.day == null) return false;
  for (const s of (seed.dawnbidScores || [])) {
    if (s.day !== row.day || s.vid !== row.vid) continue;
    if (!s.plan || (s.plan.needWave | 0) < 4) continue;
    if (row.winPlanAction && s.commit && s.commit.winPlanAction && s.commit.winPlanAction !== row.winPlanAction) continue;
    return true;
  }
  for (const c of (seed.planCensus || [])) {
    if (c.day !== row.day || (c.needWave | 0) < 4) continue;
    if (c.vid === row.vid) return true;
    if (Array.isArray(c.party) && c.party.indexOf(row.vid) !== -1) return true;
  }
  return false;
}
function countLaunches(seed) {
  const seen = {};
  let n = 0;
  function add(row) {
    const k = row.vid + '|' + row.day;
    if (!seen[k]) { seen[k] = true; n++; }
  }
  for (const r of (seed.v4departs || [])) if (r.result === 'launch' && resolveW4pDepart(seed, r)) add(r);
  for (const r of (seed.dawnbidDeparts || [])) if (r.result === 'launch' && resolveW4pDepart(seed, r)) add(r);
  return n;
}
function maxWaveReached(seed) {
  if (seed.maxWave != null) return seed.maxWave | 0;
  let m = 0;
  for (const r of (seed.funnelStage || [])) if ((r.unlockedWave | 0) > m) m = r.unlockedWave | 0;
  if (m > 0) return m;
  if (seed.unlockedWave != null) return seed.unlockedWave | 0;
  return null;
}

// pathMatchesOrigin(seedPath, meeting): does this seed call belong to
// this meeting's router? Gate-avoid seeds belong to gate-avoid
// meetings; agency evade/flee seeds belong to expedition fights;
// world-tick seeds belong to world-tick fights. A seed from any other
// router never exists (those routers never call the seeder), so a
// cross-path match is flagged, never silently accepted.
function pathMatchesOrigin(path, meeting) {
  if (!path) return false;
  if (meeting.kind === 'gate-avoid') return path === 'gate-avoid';
  if (meeting.origin === 'expedition') return path === 'agency-evade' || path === 'agency-flee';
  if (meeting.origin === 'world-tick') return path === 'world-tick';
  return false;
}

// buildMeetings(seed): the planform stream. Returns {meetings,
// missingStreams, orphanSeeds, scholarMeetings}. A meeting row carries
// the join result (seedSeq / seedRow fields) so the evidence can audit
// every classification against its raw rows.
function buildMeetings(seed) {
  const missing = [];
  if (!Array.isArray(seed.v4encounters)) missing.push('v4encounters');
  if (!Array.isArray(seed.v4seeds)) missing.push('v4seeds');
  if (!Array.isArray(seed.v4gates)) missing.push('v4gates');
  // A missing stream does NOT empty the meeting list: meetings are
  // still built from the streams that exist, and each one classifies
  // unclassified with the missing stream named (analyzeSeed). Only
  // the join starves (a missing v4seeds reads as zero seed calls).
  const encounters = Array.isArray(seed.v4encounters) ? seed.v4encounters : [];
  const gates = Array.isArray(seed.v4gates) ? seed.v4gates : [];
  const seeds = Array.isArray(seed.v4seeds) ? seed.v4seeds : [];
  const scholarId = seed.scholarId || null;
  const meetings = [];
  const fightKey = {};
  for (let i = 0; i < encounters.length; i++) {
    const r = encounters[i];
    if (!r || ((r.wave | 0) < 3)) continue;
    const k = r.vid + '|' + r.day + '|' + r.mid;
    fightKey[k] = true;
    meetings.push({
      idx: i, kind: 'fight', day: r.day, vid: r.vid, mid: r.mid, wave: r.wave | 0,
      origin: r.origin || 'unknown-missing', caller: r.caller || null,
      outcome: r.outcome || null,
      monsterTile: r.monsterTile || null, havenTile: r.havenTile || null,
      lingering: !!r.lingering, optsRaid: !!r.optsRaid, optsCornered: !!r.optsCornered,
      gateReason: (r.gate && r.gate.reason) || null,
      scholar: scholarId != null && r.vid === scholarId,
      seed: null, joinAmbiguous: false, joinCrossPath: false,
    });
  }
  for (let i = 0; i < gates.length; i++) {
    const r = gates[i];
    if (!r || ((r.wave | 0) < 3)) continue;
    if (r.result !== 'avoid') continue;
    const k = r.vid + '|' + r.day + '|' + r.mid;
    if (fightKey[k]) continue; // the fight that followed is the meeting
    meetings.push({
      idx: 100000 + i, kind: 'gate-avoid', day: r.day, vid: r.vid, mid: r.mid, wave: r.wave | 0,
      origin: r.origin || 'expedition', caller: r.caller || null,
      outcome: 'avoided',
      monsterTile: null, havenTile: null,
      lingering: false, optsRaid: false, optsCornered: false,
      gateReason: r.reason || null,
      planStageAtGate: (r.planStage !== undefined ? r.planStage : null),
      planTargetAtGate: (r.planTarget !== undefined ? r.planTarget : null),
      scholar: scholarId != null && r.vid === scholarId,
      seed: null, joinAmbiguous: false, joinCrossPath: false,
    });
  }
  // Join: seed calls to meetings in file order on (vid, day, mid),
  // preferring a path that matches the meeting's origin.
  const keyCounts = {};
  for (const m of meetings) {
    const k = m.vid + '|' + m.day + '|' + m.mid;
    keyCounts[k] = (keyCounts[k] || 0) + 1;
  }
  const used = {};
  let joinAmbiguous = 0;
  for (const m of meetings) {
    const k = m.vid + '|' + m.day + '|' + m.mid;
    if (keyCounts[k] > 1) { m.joinAmbiguous = true; joinAmbiguous++; }
    const cands = [];
    for (let i = 0; i < seeds.length; i++) {
      if (used[i]) continue;
      const s = seeds[i];
      if (!s || s.vid !== m.vid || s.day !== m.day || s.mid !== m.mid) continue;
      cands.push(i);
    }
    if (!cands.length) continue;
    let pick = -1;
    for (const i of cands) if (pathMatchesOrigin(seeds[i].path, m)) { pick = i; break; }
    if (pick === -1) { pick = cands[0]; m.joinCrossPath = true; }
    used[pick] = true;
    m.seed = seeds[pick];
  }
  const orphanSeeds = [];
  for (let i = 0; i < seeds.length; i++) {
    if (!used[i]) orphanSeeds.push({ seq: seeds[i].seq != null ? seeds[i].seq : i, day: seeds[i].day, vid: seeds[i].vid, mid: seeds[i].mid, wave: seeds[i].wave, path: seeds[i].path, outcome: seeds[i].outcome || null });
  }
  const scholarMeetings = meetings.filter(function (m) { return m.scholar; }).length;
  return { meetings: meetings, missingStreams: missing, orphanSeeds: orphanSeeds, scholarMeetings: scholarMeetings, joinAmbiguous: joinAmbiguous };
}

// classifyMeeting(seed, meeting): the frozen §5 taxonomy. Returns
// {rule, sub, detail}. `rule` is the taxonomy row; `sub` the
// seeded sub-count (new/retarget/refresh) or null.
function classifyMeeting(seed, meeting) {
  if (meeting.scholar) return { rule: 'scholar-out-of-population', sub: null, detail: 'scholar meeting (vid === scholarId); plans belong to villagers' };
  const s = meeting.seed;
  const atHavenTile = !!(meeting.monsterTile && meeting.havenTile &&
    meeting.monsterTile.tx === meeting.havenTile.nx && meeting.monsterTile.ty === meeting.havenTile.ny);
  if (s) {
    const before = s.planBefore || null;
    const after = s.planAfter || null;
    const mid = meeting.mid;
    // A1. Seeded: the call set target = the faced monster with
    // needWave == the monster's wave (the seed sets needWave =
    // mdef.wave exactly). For the judged wave-4 set this is
    // needWave >= 4, as the prereg freezes it; the == reading is
    // what makes the same rule correct for wave-3 meetings (a
    // wave-3 seed sets needWave 3 — the >= 4 reading would call
    // every wave-3 seed a bounce).
    if (after && after.target === mid && (after.needWave | 0) === meeting.wave) {
      let sub = 'seeded-new';
      if (before) sub = (before.target === mid) ? 'seeded-refresh' : 'seeded-retarget';
      return { rule: 'seeded', sub: sub, detail: 'seed seq ' + (s.seq != null ? s.seq : '?') + ' path ' + (s.path || '?') + ' outcome ' + (s.outcome || '?') + ' (' + sub + ')' };
    }
    // A3. Suburb: the code returns null before the stage check
    // (winPlanSeedFromFight's fleerepair2 guard comes first).
    if (mid === 'suburb' && s.retNull) {
      return { rule: 'bounced-suburb', sub: null, detail: 'seed seq ' + (s.seq != null ? s.seq : '?') + ' returned null for suburb (FLEEREPAIR2=1)' };
    }
    // A2. Hunt-stage lock: the plan came back unchanged in a
    // non-gear/party stage.
    if (before && LOCK_STAGES.indexOf(before.stage) !== -1) {
      return { rule: 'bounced-hunt-lock', sub: null, detail: 'seed seq ' + (s.seq != null ? s.seq : '?') + ' bounced: plan stage ' + before.stage + ' target ' + (before.target || 'null') + ' unchanged' };
    }
    // A4. Residual: a seed fired and the target did not become the
    // faced monster, for no named reason. Attach the evidence.
    return { rule: 'bounced-other', sub: null, detail: 'seed seq ' + (s.seq != null ? s.seq : '?') + ' path ' + (s.path || '?') + ' retNull=' + !!s.retNull + ' before=' + JSON.stringify(before) + ' after=' + JSON.stringify(after) };
  }
  // No seed call for this meeting.
  if (meeting.kind === 'gate-avoid') {
    if (meeting.planStageAtGate != null) {
      return { rule: 'gate-avoid-plan-exists-no-retarget', sub: null, detail: 'gate avoid d' + meeting.day + ' reason ' + (meeting.gateReason || '?') + ': plan stage ' + meeting.planStageAtGate + ' target ' + (meeting.planTargetAtGate || 'null') + ' — the gate resets the stage but never sets the target' };
    }
    return { rule: 'unclassified', sub: null, detail: 'gate avoid with NO plan and no seed call — the gate seeds when no plan exists, so the call should have fired' };
  }
  const origin = meeting.origin || 'unknown-missing';
  const outcome = meeting.outcome || null;
  // B1. Kills never seed (both routers).
  if (outcome === 'vKill') return { rule: 'no-call-kill', sub: null, detail: 'outcome vKill origin ' + origin + ' — kills call winPlanNoteKill only, never the seeder' };
  // B2–B5. Routers that never call the seeder.
  if (origin === 'aid') return { rule: 'no-call-aid', sub: null, detail: 'origin aid — the world-tick seed is suppressed by !wViaAid and aidFight never seeds' };
  if (origin === 'patrol') return { rule: 'no-call-patrol-router', sub: null, detail: 'origin patrol — resolvePatrol never calls the seeder' };
  if (origin === 'sortie') return { rule: 'no-call-sortie', sub: null, detail: 'origin sortie — lingererSortie never calls the seeder' };
  if (OTHER_ROUTERS.indexOf(origin) !== -1) return { rule: 'no-call-other-router', sub: null, detail: 'origin ' + origin + ' — that router never calls the seeder' };
  // B6. Raid (frozen §5): a world-tick vFlee against a monster on
  // the Haven tile. The raid router calls resolveWildMonsterEncounter
  // with {raid:true} (havenGrowth.js:681) and the seed is suppressed
  // by !opts.raid. The test is the TILE, not lingering: the
  // fieldFight opts the driver reads never carry the raid flag
  // (resolveWildMonsterEncounter passes only allies/allyVids to
  // fieldFight), so optsRaid reads false on every raid, and
  // lingering fights are origin 'aid' (B2 fires first) — a
  // lingering test can never fire. Probe 2026-11-23 (seed 107633
  // replay, /tmp/probe-107633.log): all 10 pilot W4 unclassified
  // are RWE-level optsRaid=true, world-tick vFlee, tile (4,4).
  if (origin === 'world-tick' && outcome === 'vFlee' && atHavenTile) {
    return { rule: 'no-call-raid', sub: null, detail: 'world-tick vFlee on the Haven tile (monsterTile ' + JSON.stringify(meeting.monsterTile) + ' havenTile ' + JSON.stringify(meeting.havenTile) + ') — the raid router passes {raid:true} and the seed is suppressed by !opts.raid' };
  }
  // Expected-seed cases: the code says the call fires here, so its
  // absence is unclassified, never a named rule.
  if (origin === 'expedition' && (outcome === 'evade' || outcome === 'vFlee')) {
    return { rule: 'unclassified', sub: null, detail: 'expedition ' + outcome + ' with no seed call — the expedition seeds every evade and flee' };
  }
  if (origin === 'world-tick' && outcome === 'vFlee') {
    return { rule: 'unclassified', sub: null, detail: 'world-tick vFlee (lingering=false, tile ' + JSON.stringify(meeting.monsterTile) + ' vs haven ' + JSON.stringify(meeting.havenTile) + ') with no seed call — the wild seed block should have fired' };
  }
  // B7. Outcomes no seed site covers on that origin.
  if (origin === 'world-tick' && NO_SEED_OUTCOMES_WILDTICK.indexOf(outcome) !== -1) {
    return { rule: 'no-call-outcome-' + outcome, sub: null, detail: 'world-tick outcome ' + outcome + ' — the wild seed block is vFlee-only' };
  }
  if (origin === 'expedition' && NO_SEED_OUTCOMES_EXPED.indexOf(outcome) !== -1) {
    return { rule: 'no-call-outcome-' + outcome, sub: null, detail: 'expedition outcome ' + outcome + ' — the expedition seeds evade/flee only' };
  }
  if (origin === 'unknown-missing' || origin.indexOf('unknown-') === 0) {
    return { rule: 'unclassified', sub: null, detail: 'origin ' + origin + ' — the meeting cannot be attributed to a router (instrument gap)' };
  }
  if (!outcome) {
    return { rule: 'unclassified', sub: null, detail: 'outcome missing for origin ' + origin + ' — the fight record carries no outcome' };
  }
  return { rule: 'unclassified', sub: null, detail: 'no seed call; origin ' + origin + ' outcome ' + outcome + ' is not in the frozen taxonomy' };
}

// seededLater(seed, meeting): did a wave-4+ plan appear for this vid
// within 7 days after the meeting, and what made it? A targetless
// havenTick plan does NOT count — only a later seed call setting a
// wave-4 target counts, credited to the LATER meeting.
function seededLater(seed, meeting) {
  const vid = meeting.vid;
  const d0 = meeting.day;
  const census = seed.planCensus || [];
  const creates = seed.v4creates || [];
  const seeds = seed.v4seeds || [];
  for (let d = d0 + 1; d <= d0 + 7; d++) {
    let row = null;
    for (const c of census) {
      if (c.vid === vid && c.day === d && isW4pPlan(c)) { row = c; break; }
    }
    if (!row) continue;
    let creator = null;
    for (const c of creates) {
      if (c.vid === vid && c.day > d0 && c.day <= d && isW4pRow(c)) { creator = { day: c.day, creator: c.creator, target: c.target || null }; break; }
    }
    let laterSeed = null;
    for (const s of seeds) {
      if (s.vid === vid && s.day > d0 && s.day <= d && s.planAfter && s.planAfter.target && W4P_SET.has(s.planAfter.target)) {
        laterSeed = { day: s.day, mid: s.mid, path: s.path || null, target: s.planAfter.target }; break;
      }
    }
    return { found: true, daysLater: d - d0, day: d, target: row.target || null, needWave: (row.needWave != null ? row.needWave : null), creator: creator, laterSeed: laterSeed };
  }
  return { found: false, daysLater: null, day: null, target: null, needWave: null, creator: null, laterSeed: null };
}

// seedProfiles(seed): the wave-3 vs wave-4 seed rows, grouped for the
// profile-flip comparison (holder profile x fight origin x outcome).
function seedProfiles(seed) {
  const out = {};
  for (const w of [3, 4, 5]) {
    const rows = (seed.v4seeds || []).filter(function (r) { return (r.wave | 0) === w; });
    const byProfile = {}, byOrigin = {}, byOutcome = {};
    let seeded = 0, bounced = 0;
    for (const r of rows) {
      const p = r.profile || 'unknown';
      byProfile[p] = (byProfile[p] || 0) + 1;
      const o = r.path || 'unknown';
      byOrigin[o] = (byOrigin[o] || 0) + 1;
      const oc = r.outcome || 'unknown';
      byOutcome[oc] = (byOutcome[oc] || 0) + 1;
      const after = r.planAfter || null;
      if (after && after.target === r.mid) seeded++;
      else bounced++;
    }
    out['w' + w] = { n: rows.length, seeded: seeded, bounced: bounced, byProfile: byProfile, byOrigin: byOrigin, byOutcome: byOutcome };
  }
  return out;
}

function analyzeSeed(seed) {
  const built = buildMeetings(seed);
  const meetings = built.meetings;
  const rows = [];
  const classCounts = {};
  function bump(k) { classCounts[k] = (classCounts[k] || 0) + 1; }
  let w4 = 0, w3 = 0, w5 = 0, classifiedW4 = 0, unclassifiedW4 = 0;
  for (const m of meetings) {
    if (m.scholar) {
      rows.push({ day: m.day, vid: m.vid, mid: m.mid, wave: m.wave, kind: m.kind, origin: m.origin, outcome: m.outcome, rule: 'scholar-out-of-population', sub: null, detail: 'scholar meeting', seedSeq: null, planBefore: null, planAfter: null, profile: null, joinAmbiguous: !!m.joinAmbiguous, joinCrossPath: !!m.joinCrossPath, laterPlan: { found: false } });
      continue;
    }
    const c = built.missingStreams.length ? { rule: 'unclassified', sub: null, detail: 'missing stream(s): ' + built.missingStreams.join(', ') } : classifyMeeting(seed, m);
    const later = (c.rule === 'seeded') ? { found: false } : seededLater(seed, m);
    rows.push({ day: m.day, vid: m.vid, mid: m.mid, wave: m.wave, kind: m.kind, origin: m.origin, outcome: m.outcome,
      rule: c.rule, sub: c.sub, detail: c.detail,
      seedSeq: (m.seed && m.seed.seq != null ? m.seed.seq : null),
      planBefore: (m.seed && m.seed.planBefore) || null, planAfter: (m.seed && m.seed.planAfter) || null,
      profile: (m.seed && m.seed.profile) || null,
      joinAmbiguous: !!m.joinAmbiguous, joinCrossPath: !!m.joinCrossPath, laterPlan: later });
    bump(c.rule);
    if (m.wave === 4) { w4++; if (c.rule === 'unclassified') unclassifiedW4++; else classifiedW4++; }
    else if (m.wave === 3) w3++;
    else if (m.wave === 5) w5++;
  }
  return {
    seed: seed.seed, days: seed.days, gameDays: seed.gameDays, endReason: seed.endReason,
    villageLost: !!seed.villageLost, lostDay: seed.funnelVillage ? seed.funnelVillage.lostDay : null,
    maxWave: maxWaveReached(seed), standing: seed.standing, scaleRank: seed.scaleRank,
    won: !!seed.won, deaths: (seed.deaths || []).length,
    launches: countLaunches(seed),
    meetings: rows, meetingsW4: w4, meetingsW3: w3, meetingsW5: w5,
    scholarMeetings: built.scholarMeetings,
    classifiedW4: classifiedW4, unclassifiedW4: unclassifiedW4,
    classCounts: classCounts, orphanSeeds: built.orphanSeeds, orphanSeedCount: built.orphanSeeds.length,
    joinAmbiguous: built.joinAmbiguous,
    missingStreams: built.missingStreams,
    instrumentErrors: (seed.instrumentErrors || []).length,
    tickGateMismatches: (seed.tickGateChecks || []).filter(function (x) { return !x.match; }).length,
    seedProfiles: seedProfiles(seed),
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const perSeed = [];
  let instrumentErrors = 0, tickMismatches = 0;
  for (const f of files) {
    const seed = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const a = analyzeSeed(seed);
    instrumentErrors += a.instrumentErrors;
    tickMismatches += a.tickGateMismatches;
    perSeed.push(a);
  }
  let meetingsW4 = 0, meetingsW3 = 0, meetingsW5 = 0, scholarMeetings = 0;
  let classifiedW4 = 0, unclassifiedW4 = 0, orphanSeeds = 0, joinAmbiguous = 0;
  const classCountsW4 = {}, classCountsW3 = {}, classCountsW5 = {}, classCountsAll = {};
  const profW3 = {}, profW4 = {}, origW3 = {}, origW4 = {};
  for (const p of perSeed) {
    meetingsW4 += p.meetingsW4; meetingsW3 += p.meetingsW3; meetingsW5 += p.meetingsW5;
    scholarMeetings += p.scholarMeetings;
    classifiedW4 += p.classifiedW4; unclassifiedW4 += p.unclassifiedW4;
    orphanSeeds += p.orphanSeedCount; joinAmbiguous += p.joinAmbiguous;
    for (const m of p.meetings) {
      if (m.rule === 'scholar-out-of-population') continue;
      classCountsAll[m.rule] = (classCountsAll[m.rule] || 0) + 1;
      if (m.wave === 4) classCountsW4[m.rule] = (classCountsW4[m.rule] || 0) + 1;
      else if (m.wave === 3) classCountsW3[m.rule] = (classCountsW3[m.rule] || 0) + 1;
      else if (m.wave === 5) classCountsW5[m.rule] = (classCountsW5[m.rule] || 0) + 1;
    }
    const sp = p.seedProfiles;
    for (const k in (sp.w3.byProfile || {})) profW3[k] = (profW3[k] || 0) + sp.w3.byProfile[k];
    for (const k in (sp.w4.byProfile || {})) profW4[k] = (profW4[k] || 0) + sp.w4.byProfile[k];
    for (const k in (sp.w3.byOrigin || {})) origW3[k] = (origW3[k] || 0) + sp.w3.byOrigin[k];
    for (const k in (sp.w4.byOrigin || {})) origW4[k] = (origW4[k] || 0) + sp.w4.byOrigin[k];
  }
  const surv = perSeed.map(function (p) { return p.days; }).sort(function (a, b) { return a - b; });
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : null;
  const wall = {
    wins: perSeed.filter(function (p) { return p.won; }).length,
    national: perSeed.filter(function (p) { return p.scaleRank === 'national' || p.scaleRank === 'global'; }).length,
    table: 0, // the table seat is not in the per-seed corpus
    wave5: perSeed.filter(function (p) { return (p.maxWave | 0) >= 5; }).length,
    wave4: perSeed.filter(function (p) { return (p.maxWave | 0) >= 4; }).length,
    medianSurvival: median, maxSurvival: surv.length ? surv[surv.length - 1] : null,
    villagesLost: perSeed.filter(function (p) { return p.villageLost; }).length,
    totalDeaths: perSeed.reduce(function (a, p) { return a + p.deaths; }, 0),
  };
  return {
    arm: 'planform-a', dir: dir, seeds: perSeed.length,
    meetingsW4: meetingsW4, meetingsW3: meetingsW3, meetingsW5: meetingsW5,
    scholarMeetings: scholarMeetings,
    classifiedW4: classifiedW4, unclassifiedW4: unclassifiedW4,
    classifiedShareW4: meetingsW4 ? classifiedW4 / meetingsW4 : 1,
    classCountsW4: classCountsW4, classCountsW3: classCountsW3, classCountsW5: classCountsW5,
    classCountsAll: classCountsAll,
    orphanSeeds: orphanSeeds, joinAmbiguous: joinAmbiguous,
    seedProfiles: {
      w3: { byProfile: profW3, byOrigin: origW3 },
      w4: { byProfile: profW4, byOrigin: origW4 },
    },
    launchesTotal: perSeed.reduce(function (a, p) { return a + p.launches; }, 0),
    launchingSeeds: perSeed.filter(function (p) { return p.launches > 0; }).length,
    instrumentErrors: instrumentErrors, tickGateMismatches: tickMismatches,
    wall: wall, perSeed: perSeed,
  };
}

// ---- selftest ----
function synthBase(over) {
  const b = {
    seed: 999001, scholarId: 'scholar', roster: ['a', 'b', 'scholar'],
    maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
    endReason: 'days', won: false, scaleRank: 'village', ready4: { short: [] },
    v4encounters: [], v4seeds: [], v4gates: [],
    v4creates: [], planCensus: [], funnelStage: [], v4departs: [], dawnbidScores: [],
    dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
    havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
    funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null },
  };
  if (over) for (const k in over) b[k] = over[k];
  return b;
}
function fight(day, vid, mid, wave, origin, outcome, extra) {
  const r = { day: day, vid: vid, mid: mid, wave: wave, origin: origin, caller: 'at Object.' + (origin === 'world-tick' ? 'resolveWildMonsterEncounter' : origin === 'expedition' ? 'expeditionMonster' : origin === 'aid' ? 'aidFight' : origin === 'patrol' ? 'resolvePatrol' : origin === 'sortie' ? 'lingererSortie' : 'x') + ' (src/js/x.js:1:1)', outcome: outcome, monsterTile: { tx: 1, ty: 1 }, havenTile: { nx: 4, ny: 4 }, lingering: false, optsRaid: false, optsCornered: false };
  if (extra) for (const k in extra) r[k] = extra[k];
  return r;
}
function seedCall(day, vid, mid, wave, path, outcome, before, after, retNull, profile) {
  return { day: day, vid: vid, mid: mid, wave: wave, outcome: outcome, path: path, caller: 'x',
    planExistedBefore: !!before, planBefore: before || null, planAfter: after || null,
    retNull: !!retNull, profile: profile || 'forager', seq: 0,
    stageAfter: after ? after.stage : null, target: after ? after.target : null, node: null };
}
function gateAvoid(day, vid, mid, wave, planStage, planTarget) {
  return { day: day, vid: vid, mid: mid, wave: wave, origin: 'expedition', caller: 'x', result: 'avoid', reason: 'outmatched', planStage: planStage, planTarget: planTarget };
}
function selftest() {
  let pass = 0, fail = 0;
  const failures = [];
  function check(name, cond, detail) {
    if (cond) pass++;
    else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); }
  }
  function oneMeeting(over) {
    const b = synthBase(over);
    const a = analyzeSeed(b);
    return { analysis: a, meeting: (a.meetings || [])[0] || null };
  }
  // A1 seeded-new
  let r = oneMeeting({ v4encounters: [fight(63, 'a', 'eulogy', 4, 'world-tick', 'vFlee')],
    v4seeds: [seedCall(63, 'a', 'eulogy', 4, 'world-tick', 'fled', null, { stage: 'gear', target: 'eulogy', needWave: 4 }, false, 'forager')] });
  check('A1 seeded-new', r.meeting && r.meeting.rule === 'seeded' && r.meeting.sub === 'seeded-new', JSON.stringify(r.meeting));
  // A1 seeded-retarget (wave-3 plan -> wave-4 target)
  r = oneMeeting({ v4encounters: [fight(70, 'a', 'eater', 4, 'expedition', 'vFlee')],
    v4seeds: [seedCall(70, 'a', 'eater', 4, 'agency-flee', 'fled', { stage: 'party', target: 'spool', needWave: 3 }, { stage: 'party', target: 'eater', needWave: 4 }, false, 'wanderer')] });
  check('A1 seeded-retarget', r.meeting && r.meeting.rule === 'seeded' && r.meeting.sub === 'seeded-retarget', JSON.stringify(r.meeting));
  // A1 seeded-refresh (same target already)
  r = oneMeeting({ v4encounters: [fight(71, 'a', 'eater', 4, 'world-tick', 'vFlee')],
    v4seeds: [seedCall(71, 'a', 'eater', 4, 'world-tick', 'fled', { stage: 'party', target: 'eater', needWave: 4 }, { stage: 'party', target: 'eater', needWave: 4 }, false, 'forager')] });
  check('A1 seeded-refresh', r.meeting && r.meeting.rule === 'seeded' && r.meeting.sub === 'seeded-refresh', JSON.stringify(r.meeting));
  // A2 hunt-lock (hannah/zoe shape: plan frozen in hunt, seed bounces)
  r = oneMeeting({ v4encounters: [fight(108, 'a', 'timeslot', 5, 'expedition', 'vFlee')],
    v4seeds: [seedCall(108, 'a', 'timeslot', 5, 'agency-flee', 'fled', { stage: 'hunt', target: null, needWave: null }, { stage: 'hunt', target: null, needWave: null }, false, 'wanderer')] });
  check('A2 bounced-hunt-lock', r.meeting && r.meeting.rule === 'bounced-hunt-lock', JSON.stringify(r.meeting));
  // A2 standing-stage lock
  r = oneMeeting({ v4encounters: [fight(90, 'a', 'audit', 4, 'world-tick', 'vFlee')],
    v4seeds: [seedCall(90, 'a', 'audit', 4, 'world-tick', 'fled', { stage: 'standing', target: 'spool', needWave: 3 }, { stage: 'standing', target: 'spool', needWave: 3 }, false, 'forager')] });
  check('A2 standing-stage lock', r.meeting && r.meeting.rule === 'bounced-hunt-lock', JSON.stringify(r.meeting));
  // A3 suburb (FLEEREPAIR2: the seed returns null)
  r = oneMeeting({ v4encounters: [fight(95, 'a', 'suburb', 4, 'expedition', 'vFlee')],
    v4seeds: [seedCall(95, 'a', 'suburb', 4, 'agency-flee', 'fled', null, null, true, 'forager')] });
  check('A3 bounced-suburb', r.meeting && r.meeting.rule === 'bounced-suburb', JSON.stringify(r.meeting));
  // A4 residual (seed fired, target did not become the monster)
  r = oneMeeting({ v4encounters: [fight(80, 'a', 'eater', 4, 'world-tick', 'vFlee')],
    v4seeds: [seedCall(80, 'a', 'eater', 4, 'world-tick', 'fled', { stage: 'party', target: 'spool', needWave: 3 }, { stage: 'party', target: 'spool', needWave: 3 }, false, 'forager')] });
  check('A4 bounced-other', r.meeting && r.meeting.rule === 'bounced-other', JSON.stringify(r.meeting));
  // B1 kill (107529 herald shape: the kill never seeds)
  r = oneMeeting({ v4encounters: [fight(108, 'a', 'herald', 4, 'world-tick', 'vKill')] });
  check('B1 no-call-kill', r.meeting && r.meeting.rule === 'no-call-kill', JSON.stringify(r.meeting));
  // B1 kill on expedition too
  r = oneMeeting({ v4encounters: [fight(110, 'a', 'herald', 4, 'expedition', 'vKill')] });
  check('B1 no-call-kill (expedition)', r.meeting && r.meeting.rule === 'no-call-kill', JSON.stringify(r.meeting));
  // B2 aid
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'aid', 'vFlee')] });
  check('B2 no-call-aid', r.meeting && r.meeting.rule === 'no-call-aid', JSON.stringify(r.meeting));
  // B3 patrol
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'patrol', 'vFlee')] });
  check('B3 no-call-patrol-router', r.meeting && r.meeting.rule === 'no-call-patrol-router', JSON.stringify(r.meeting));
  // B4 sortie
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'sortie', 'vFlee', { optsCornered: true })] });
  check('B4 no-call-sortie', r.meeting && r.meeting.rule === 'no-call-sortie', JSON.stringify(r.meeting));
  // B5 other router (contest vFlee — a contest vKill would be B1 first)
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'contest', 'vFlee')] });
  check('B5 no-call-other-router', r.meeting && r.meeting.rule === 'no-call-other-router', JSON.stringify(r.meeting));
  // B6 raid (Haven tile, world-tick vFlee, no seed — the TILE decides,
  // not lingering: lingering fights are origin 'aid' and B2 fires
  // first, so a lingering test can never fire; AMENDMENT §16).
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'world-tick', 'vFlee', { lingering: false, monsterTile: { tx: 4, ty: 4 } })] });
  check('B6 no-call-raid', r.meeting && r.meeting.rule === 'no-call-raid', JSON.stringify(r.meeting));
  // B7 world-tick evade (the wild seed block is vFlee-only)
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'world-tick', 'evade')] });
  check('B7 no-call-outcome-evade', r.meeting && r.meeting.rule === 'no-call-outcome-evade', JSON.stringify(r.meeting));
  // B7 expedition mFlee
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'expedition', 'mFlee')] });
  check('B7 no-call-outcome-mFlee', r.meeting && r.meeting.rule === 'no-call-outcome-mFlee', JSON.stringify(r.meeting));
  // B8 gate-avoid with an existing plan (the gate resets the stage,
  // never sets the target)
  r = oneMeeting({ v4gates: [gateAvoid(50, 'a', 'eater', 4, 'party', 'spool')] });
  check('B8 gate-avoid-plan-exists-no-retarget', r.meeting && r.meeting.rule === 'gate-avoid-plan-exists-no-retarget' && r.meeting.kind === 'gate-avoid', JSON.stringify(r.meeting));
  // Gate-avoid with NO plan seeds (the gate's else-branch) -> A1
  r = oneMeeting({ v4gates: [gateAvoid(50, 'a', 'eater', 4, null, null)],
    v4seeds: [seedCall(50, 'a', 'eater', 4, 'gate-avoid', 'avoided', null, { stage: 'gear', target: 'eater', needWave: 4 }, false, 'wanderer')] });
  check('gate-avoid no plan seeds -> seeded-new', r.meeting && r.meeting.rule === 'seeded' && r.meeting.sub === 'seeded-new' && r.meeting.kind === 'gate-avoid', JSON.stringify(r.meeting));
  // C: gate-avoid, no plan, no seed (the gate should have seeded)
  r = oneMeeting({ v4gates: [gateAvoid(50, 'a', 'eater', 4, null, null)] });
  check('C gate-avoid no plan no seed -> unclassified', r.meeting && r.meeting.rule === 'unclassified', JSON.stringify(r.meeting));
  // C: expedition evade with no seed (the expedition seeds every evade)
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'expedition', 'evade')] });
  check('C expedition evade no seed -> unclassified', r.meeting && r.meeting.rule === 'unclassified', JSON.stringify(r.meeting));
  // C: world-tick vFlee, not lingering, off the Haven tile, no seed
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'world-tick', 'vFlee', { lingering: false, monsterTile: { tx: 1, ty: 1 } })] });
  check('C world-tick vFlee no seed -> unclassified', r.meeting && r.meeting.rule === 'unclassified', JSON.stringify(r.meeting));
  // C: missing streams
  const stripped = synthBase({});
  delete stripped.v4seeds;
  const aStripped = analyzeSeed(stripped);
  check('C missing streams -> meetings unclassified', aStripped.missingStreams.indexOf('v4seeds') !== -1, JSON.stringify(aStripped.missingStreams));
  const stripped2 = synthBase({ v4encounters: [fight(60, 'a', 'audit', 4, 'world-tick', 'vFlee')] });
  delete stripped2.v4seeds;
  const aStripped2 = analyzeSeed(stripped2);
  check('C missing v4seeds stream classifies the meeting unclassified', aStripped2.meetings[0] && aStripped2.meetings[0].rule === 'unclassified', JSON.stringify(aStripped2.meetings[0]));
  // Scholar meeting: out of population, not counted in the bars
  r = oneMeeting({ v4encounters: [fight(60, 'scholar', 'audit', 4, 'patrol', 'vFlee')] });
  check('scholar meeting out of population', r.meeting && r.meeting.rule === 'scholar-out-of-population' && r.analysis.scholarMeetings === 1 && r.analysis.meetingsW4 === 0, JSON.stringify({ m: r.meeting, s: r.analysis.scholarMeetings, w4: r.analysis.meetingsW4 }));
  // Seeded-later: a no-call-kill meeting, wave-4+ plan in the census
  // 3 days later via a later seed call — reported, rule unchanged
  r = oneMeeting({ v4encounters: [fight(108, 'a', 'herald', 4, 'world-tick', 'vKill')],
    planCensus: [{ day: 111, vid: 'a', target: 'herald', needWave: 4, stage: 'party' }],
    v4creates: [{ day: 111, vid: 'a', creator: 'world-tick', source: null, profile: 'forager', stageAfter: 'party', target: 'herald', needWave: 4, foughtN: 1, slainN: 0, caller: null }],
    v4seeds: [seedCall(111, 'a', 'herald', 4, 'world-tick', 'fled', null, { stage: 'gear', target: 'herald', needWave: 4 }, false, 'forager')] });
  check('seeded-later reported, rule stays no-call-kill', r.meeting && r.meeting.rule === 'no-call-kill' && r.meeting.laterPlan && r.meeting.laterPlan.found === true && r.meeting.laterPlan.daysLater === 3, JSON.stringify(r.meeting && r.meeting.laterPlan));
  // Join-ambiguous: two meetings, same (vid, day, mid), one seed
  r = oneMeeting({ v4encounters: [fight(60, 'a', 'audit', 4, 'world-tick', 'vFlee'), fight(60, 'a', 'audit', 4, 'world-tick', 'vFlee')],
    v4seeds: [seedCall(60, 'a', 'audit', 4, 'world-tick', 'fled', null, { stage: 'gear', target: 'audit', needWave: 4 }, false, 'forager')] });
  check('join-ambiguous: first meeting takes the seed, second is unclassified (expected seed absent)',
    r.analysis.meetings.length === 2 && r.analysis.meetings[0].rule === 'seeded' && r.analysis.meetings[0].joinAmbiguous === true &&
    r.analysis.meetings[1].rule === 'unclassified' && r.analysis.joinAmbiguous === 2, JSON.stringify(r.analysis.meetings.map(function (m) { return m.rule; })));
  // Wave-3 meeting classified identically (profile comparison input)
  r = oneMeeting({ v4encounters: [fight(40, 'a', 'spool', 3, 'expedition', 'evade')],
    v4seeds: [seedCall(40, 'a', 'spool', 3, 'agency-evade', 'evaded', null, { stage: 'gear', target: 'spool', needWave: 3 }, false, 'wanderer')] });
  check('wave-3 meeting classified (seeded) and counted in W3 not W4', r.meeting && r.meeting.rule === 'seeded' && r.analysis.meetingsW3 === 1 && r.analysis.meetingsW4 === 0, JSON.stringify({ m: r.meeting && r.meeting.rule, w3: r.analysis.meetingsW3, w4: r.analysis.meetingsW4 }));
  // Determinism: same input twice -> identical output
  const fix = synthBase({ v4encounters: [fight(63, 'a', 'eulogy', 4, 'world-tick', 'vFlee')],
    v4seeds: [seedCall(63, 'a', 'eulogy', 4, 'world-tick', 'fled', null, { stage: 'gear', target: 'eulogy', needWave: 4 }, false, 'forager')] });
  const c1 = analyzeSeed(JSON.parse(JSON.stringify(fix)));
  const c2 = analyzeSeed(JSON.parse(JSON.stringify(fix)));
  check('classifier deterministic on identical input', JSON.stringify(c1) === JSON.stringify(c2), 'outputs differ');
  // Seed profiles: wave-3 wanderer/evade vs wave-4 forager/flee
  const prof = analyzeSeed(synthBase({
    v4seeds: [
      seedCall(40, 'a', 'spool', 3, 'agency-evade', 'evaded', null, { stage: 'gear', target: 'spool', needWave: 3 }, false, 'wanderer'),
      seedCall(70, 'b', 'eater', 4, 'agency-flee', 'fled', null, { stage: 'party', target: 'eater', needWave: 4 }, false, 'forager'),
    ] })).seedProfiles;
  check('seed profiles split wave-3/wave-4 by profile and origin',
    prof.w3.n === 1 && prof.w3.byProfile.wanderer === 1 && prof.w3.byOrigin['agency-evade'] === 1 &&
    prof.w4.n === 1 && prof.w4.byProfile.forager === 1 && prof.w4.byOrigin['agency-flee'] === 1, JSON.stringify(prof));
  return { pass: pass, fail: fail, failures: failures };
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    const r = selftest();
    console.log('planform-a analyzer selftest: ' + r.pass + ' passed, ' + r.fail + ' failed');
    for (const f of r.failures) console.log('  FAIL: ' + f);
    process.exit(r.fail ? 1 : 0);
  }
  if (args.indexOf('--diff') !== -1) {
    const i = args.indexOf('--diff');
    const dirA = args[i + 1], dirB = args[i + 2];
    if (!dirA || !dirB) { console.error('USAGE: --diff <dirA> <dirB>'); process.exit(2); }
    const a = analyzeDir(dirA), b = analyzeDir(dirB);
    const bySeed = {};
    for (const p of a.perSeed) bySeed[p.seed] = { a: p };
    for (const p of b.perSeed) { if (!bySeed[p.seed]) bySeed[p.seed] = {}; bySeed[p.seed].b = p; }
    let match = 0, mismatch = 0;
    const rows = [];
    for (const s of Object.keys(bySeed).sort()) {
      const x = bySeed[s];
      if (!x.a || !x.b) { mismatch++; rows.push({ seed: +s, match: false, reason: 'present in only one dir' }); continue; }
      const ok = JSON.stringify(x.a.classCounts) === JSON.stringify(x.b.classCounts) && x.a.launches === x.b.launches && x.a.days === x.b.days;
      if (ok) match++; else mismatch++;
      rows.push({ seed: +s, match: ok, a: { classCounts: x.a.classCounts, launches: x.a.launches, days: x.a.days }, b: { classCounts: x.b.classCounts, launches: x.b.launches, days: x.b.days } });
    }
    console.log(JSON.stringify({ dirA: dirA, dirB: dirB, match: match, mismatch: mismatch, rows: rows }, null, 2));
    process.exit(mismatch ? 1 : 0);
  }
  let dir = path.join(REPO, 'evidence', '2026-11-23', 'perseed-planform-a-ctl');
  let out = path.join(REPO, 'evidence', '2026-11-23', 'planform-a-analysis.json');
  const di = args.indexOf('--dir'); if (di !== -1 && args[di + 1]) dir = args[di + 1];
  const oi = args.indexOf('--out'); if (oi !== -1 && args[oi + 1]) out = args[oi + 1];
  const result = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({
    seeds: result.seeds,
    meetingsW4: result.meetingsW4, meetingsW3: result.meetingsW3, meetingsW5: result.meetingsW5,
    scholarMeetings: result.scholarMeetings,
    classifiedW4: result.classifiedW4, classifiedShareW4: result.classifiedShareW4,
    unclassifiedW4: result.unclassifiedW4,
    classCountsW4: result.classCountsW4,
    orphanSeeds: result.orphanSeeds, joinAmbiguous: result.joinAmbiguous,
    launchesTotal: result.launchesTotal,
    instrumentErrors: result.instrumentErrors, tickGateMismatches: result.tickGateMismatches,
    wall: result.wall, out: path.relative(REPO, out),
  }, null, 2));
}

if (require.main === module) main();
module.exports = { classifyMeeting: classifyMeeting, buildMeetings: buildMeetings, seededLater: seededLater, seedProfiles: seedProfiles, analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, selftest: selftest, loadWave4pIds: loadWave4pIds };
