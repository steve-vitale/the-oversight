// test-profileshadow-a.js — proof for arm sim-profileshadow-a (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the seed call's presence matches PROFILESHADOW_SEED_CALL
// (default 'on'; 'off' is the post-revert not-built shape), the
// driver wraps exist (incl. the companionPool capture + the members
// extension + the shadow extension), the game-code diff is the seed
// call only, the wave-4 id set matches the data, companionRank is a
// pure read, the shadow classifier places S0/S1/S2 fixtures per
// relaxation (incl. edge profiles, trust boundary, nesting,
// would-be-biddable counting, S0-vs-findCompanion agreement, and
// shadow shape unknowns), the identity distribution reads off the
// shadow picks, the recorder rows carry valid shadow objects, the
// vbrainScorePick wrap records pool rows WITH shadows without
// changing the pick, the pool replica + shadow computation run against
// live game state, and the determinism legs D1 (repeatability) + D2
// (wrap neutrality) are green at 60d on seed 102401.
// Usage:
//   node scripts/test-profileshadow-a.js            (seed call expected ON)
//   PROFILESHADOW_SEED_CALL=off node scripts/test-profileshadow-a.js   (post-revert shape)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SEED_CALL_EXPECTED = process.env.PROFILESHADOW_SEED_CALL || 'on';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-profileshadow-a.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitStatus(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
const seedBlockPresent = gameJs.indexOf("VETPARTY (sim-vetparty-a)") !== -1 &&
  gameJs.indexOf("this.winPlanSeedFromFight(vid, mdef, 'fled')") !== -1;
check('seed call present iff PROFILESHADOW_SEED_CALL=on (expected ' + SEED_CALL_EXPECTED + ', found ' + (seedBlockPresent ? 'present' : 'absent') + ')',
  (SEED_CALL_EXPECTED === 'on') === seedBlockPresent);
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
// The seed-block presence check above is the real assertion; this one
// only polices that no OTHER src file is dirty (the seed call may be
// committed already, so an empty status is fine when seed=on).
const srcOk = srcStatus.every(function (s) { return /src\/js\/game\.js$/.test(s); }) &&
  (SEED_CALL_EXPECTED === 'off' ? srcStatus.length === 0 : true);
check('game-code worktree diff is the seed call only (src status: ' + JSON.stringify(srcStatus) + ')', srcOk);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*profileshadow-[a-z0-9.-]+\.js$/.test(s); });
check('scripts worktree diff is profileshadow-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'profileshadow-driver-20261116.js'), 'utf8');
for (const w of ['vbrainScorePick', 'vbrainExecuteDepart', 'winPlanSeedFromFight', 'startExpedition', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'companionPool', 'poolReplica', 'members', 'shadow', 'shadowPools', 'shadowEligible']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver has PROFILESHADOW_RECORDER off-switch', driverSrc.indexOf("PROFILESHADOW_RECORDER") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
// The two findCompanions exist where the prereg says they do.
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('villager-brain.js findCompanion calls companionRank (party_launch path)',
  brainJs.indexOf('function findCompanion') !== -1 && brainJs.indexOf('companionRank(vid, elig') !== -1);
check('win-plan.js findCompanion exists (depart-gate twin)',
  winPlanJs.indexOf('function findCompanion') !== -1 && winPlanJs.indexOf('companionRank(vid, elig') !== -1);
check('winPlanCands calls the brain findCompanion (line ~215)',
  brainJs.indexOf('var companion = findCompanion(self, vid, hx, hy);') !== -1);
check('winPlanDepart launchParty calls the win-plan findCompanion',
  winPlanJs.indexOf('var cid = findCompanion(self, vid, hx, hy);') !== -1);
// companionRank is a pure read (no RNG call) — the shadow may call it
// freely. (The string "Math.random" appears in the module's header
// comment stating the no-RNG rule; the check strips line comments so
// only a real call fails it.)
const compScoreJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'companion-score.js'), 'utf8');
check('companionRank is a pure read (no Math.random call in companion-score.js)',
  compScoreJs.replace(/\/\/.*$/gm, '').indexOf('Math.random') === -1, 'Math.random call found in companion-score.js');
// npcRangeProfile returns exactly the four enumerated profiles.
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
check('npcRangeProfile enumerates exactly explorer/wanderer/forager/homebody',
  agencyJs.indexOf("score >= 5 ? 'explorer' : score >= 2 ? 'wanderer' : score >= -1 ? 'forager' : 'homebody'") !== -1);
// PROFILEGATE bypass present (pre-condition from the prereg).
check('PROFILEGATE bypass present in villager-agency.js',
  agencyJs.indexOf('PROFILEGATE (sim-profilegate-a)') !== -1);

// ---------- 2. Pool classifier unit fixtures (reused classifier) ----------
console.log('== pool classifier fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 102401, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
    dawnbidCensus: [], companionPool: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
    deaths: [],
  };
  return Object.assign(j, over || {});
}
function seedRow(day, vid, target, wave, stageAfter, outcome) {
  return { day: day, vid: vid, mid: target, wave: wave, outcome: outcome || 'fled', stageAfter: stageAfter, target: target, node: { nx: 1, ny: 1 } };
}
function scoreRow(day, part, vid, target, stage, cands, commitAction) {
  const c = (cands || []).map(function (a) {
    return a ? { kind: a === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', w: a === 'party_launch' ? 5.0 : 4.0, winPlanAction: a, companion: a === 'party_launch' ? 'v2' : null, vbrainSrc: 'win_plan' } : null;
  });
  if (!cands || !cands.length) c.push({ kind: 'HAVEN_CHORE', w: 1.4, winPlanAction: null, companion: null, vbrainSrc: null });
  const logCands = c.map(function (x) { return { kind: x.kind, score: x.w, winPlanAction: x.winPlanAction }; });
  return { day: day, part: part, vid: vid,
    cands: c,
    pick: { kind: commitAction === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', winPlanAction: commitAction || null, override: commitAction ? 'win_plan:' + commitAction : null, corePick: 'HAVEN_CHORE' },
    logCands: logCands,
    commit: commitAction ? { kind: commitAction === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', winPlanAction: commitAction, companion: commitAction === 'party_launch' ? 'v2' : null } : { kind: 'HAVEN_CHORE', winPlanAction: null, companion: null },
    plan: target ? { stage: stage, target: target, needWave: 4, party: [] } : null,
    holderGear: { armed: true, armored: true } };
}
function censusRow(day, vid, target, stage, alive) {
  return { day: day, vid: vid, target: target, needWave: 4, stage: stage, party: [],
    holderAlive: alive, holderNode: { nx: 0, ny: 0 }, holderExped: false,
    holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true } };
}
function memberFor(firstFail, id) {
  const base = { id: id, profile: 'wanderer', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 },
    away: false, engaged: false, onExped: false, alive: true, firstFail: firstFail };
  if (firstFail === 'selfOrScholar') return { id: id, profile: null, trust: 10, trustRaw: null, node: null,
    away: false, engaged: false, onExped: false, alive: true, firstFail: firstFail };
  if (firstFail === 'dead') { base.alive = false; base.profile = 'forager'; return base; }
  if (firstFail === 'away') { base.away = true; return base; }
  if (firstFail === 'trustLow') { base.trust = 10; base.trustRaw = 10; return base; }
  if (firstFail === 'notAtHaven') { base.node = { nx: 0, ny: 0 }; return base; }
  if (firstFail === 'engaged') { base.engaged = true; return base; }
  if (firstFail === 'notRanger') { base.profile = 'forager'; return base; }
  if (firstFail === 'onExped') { base.onExped = true; return base; }
  return base;
}
function membersFor(counts, eligibleIds) {
  const members = [];
  let mx = 1;
  const order = ['selfOrScholar', 'dead', 'away', 'trustLow', 'notAtHaven', 'engaged', 'notRanger', 'onExped', 'eligible'];
  let eligIdx = 0;
  for (const cond of order) {
    const n = (counts[cond] | 0);
    for (let i = 0; i < n; i++) {
      if (cond === 'selfOrScholar') { members.push(memberFor('selfOrScholar', i === 0 ? 'v1' : 'scholar')); continue; }
      if (cond === 'eligible') {
        const id = (eligibleIds && eligibleIds[eligIdx] != null) ? eligibleIds[eligIdx] : ('mx' + (mx++));
        eligIdx++;
        members.push(memberFor('eligible', id));
        continue;
      }
      members.push(memberFor(cond, 'mx' + (mx++)));
    }
  }
  return members;
}
// expectedShadow(members, haven): INDEPENDENT reimplementation of the
// three shadow gates over fixture members (roster-first ranking), used
// to build fixture shadows. The analyzer's checks compare the shadow
// against the row's own fields, so a shared bug here cannot fake a
// pass on the S0-vs-row agreement.
function expectedShadow(members, haven) {
  const byId = {};
  for (const m of members) if (m && m.id != null) byId[m.id] = m;
  function elig(mode) {
    const out = [];
    for (const m of members) {
      if (!m || m.firstFail === 'selfOrScholar') continue;
      if (m.alive === false) continue;
      if (m.away === true) continue;
      if (typeof m.trust !== 'number' || m.trust < 15) continue;
      const atHaven = !!(m.node && haven && m.node.nx === haven.nx && m.node.ny === haven.ny);
      if (!atHaven) continue;
      if (m.engaged === true) continue;
      if (m.onExped === true) continue;
      if (mode === 's0' && m.profile !== 'wanderer' && m.profile !== 'explorer') continue;
      if (mode === 's2' && m.profile !== 'wanderer' && m.profile !== 'explorer' && m.profile !== 'forager') continue;
      out.push(m.id);
    }
    return out;
  }
  function build(mode) {
    const e = elig(mode);
    const profileCounts = { explorer: 0, wanderer: 0, forager: 0, homebody: 0, null: 0 };
    for (const id of e) {
      const p = byId[id] ? byId[id].profile : null;
      if (p === 'explorer' || p === 'wanderer' || p === 'forager' || p === 'homebody') profileCounts[p]++;
      else profileCounts['null']++;
    }
    const pick = e.length ? e[0] : null;
    return { eligible: e, rankedOrder: e.map(function (id) { return { id: id, s: null }; }),
      rankedPick: pick, rankedVia: 'roster-fallback',
      pickProfile: pick != null && byId[pick] ? (byId[pick].profile != null ? byId[pick].profile : null) : null,
      profileCounts: profileCounts };
  }
  return { s0: build('s0'), s1: build('s1'), s2: build('s2') };
}
function profileCountsFor(members, ids) {
  const byId = {};
  for (const m of members) if (m && m.id != null) byId[m.id] = m;
  const pc = { explorer: 0, wanderer: 0, forager: 0, homebody: 0, null: 0 };
  for (const id of (ids || [])) {
    const p = byId[id] ? byId[id].profile : null;
    if (p === 'explorer' || p === 'wanderer' || p === 'forager' || p === 'homebody') pc[p]++;
    else pc['null']++;
  }
  return pc;
}
function poolRow(day, vid, target, stage, holderProfile, counts, eligible, rankedPick, rankedOrder, bidCompanion, agree, membersOverride, shadowOverride) {
  let rosterN = 0;
  for (const k of Object.keys(counts)) rosterN += counts[k];
  const members = membersOverride || membersFor(counts, eligible || []);
  const fails = {};
  for (const m of members) if (m && m.id != null) fails[m.id] = m.firstFail;
  const haven = { nx: 4, ny: 4 };
  let shadow = shadowOverride;
  if (!shadow) {
    // S0 is built from the fixture-authored eligible/pick (so S0 == the
    // row by construction); S1/S2 come from the gate reimplementation.
    const exp = expectedShadow(members, haven);
    const byId = {};
    for (const m of members) if (m && m.id != null) byId[m.id] = m;
    const s0pick = rankedPick || null;
    shadow = {
      s0: { eligible: (eligible || []).slice(),
        rankedOrder: rankedOrder || (eligible || []).map(function (id) { return { id: id, s: null }; }),
        rankedPick: s0pick, rankedVia: 'companionRank',
        pickProfile: s0pick != null && byId[s0pick] ? (byId[s0pick].profile != null ? byId[s0pick].profile : null) : null,
        profileCounts: profileCountsFor(members, eligible || []) },
      s1: exp.s1, s2: exp.s2 };
  }
  return { day: day, part: 0, vid: vid, target: target, stage: stage,
    holderProfile: holderProfile, holderNode: { nx: 4, ny: 4 }, haven: haven,
    rosterN: rosterN, counts: counts, fails: fails,
    eligible: (eligible || []).slice(),
    rankedOrder: rankedOrder || (eligible || []).map(function (id) { return { id: id, s: null }; }),
    rankedPick: rankedPick || null, rankedVia: 'companionRank',
    bidCompanion: bidCompanion === undefined ? null : bidCompanion,
    agree: agree === undefined ? null : agree,
    members: members,
    shadow: shadow };
}
function classifyOne(j) {
  return ANALYZE.classifyShadow(j);
}
// One fixture per failing condition as the SOLE blocker (eligible 0):
// roster = holder (selfOrScholar 1) + 2 members failing at that check.
// Every dawn must ALSO be shadow-classified (unknown 0).
const SOLE = {
  selfOrScholar: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  dead: { selfOrScholar: 1, dead: 2, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  away: { selfOrScholar: 1, dead: 0, away: 2, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  trustLow: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 2, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  notAtHaven: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 2, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  engaged: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 2, notRanger: 0, onExped: 0, eligible: 0 },
  notRanger: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 },
  onExped: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 2, eligible: 0 },
};
for (const cond of Object.keys(SOLE)) {
  const counts = SOLE[cond];
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, [], null, [], null, null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const d = r.poolDawns[0] || {};
  check('sole blocker ' + cond + ' -> classified + shadow-classified, dominant ' + cond,
    r.scoredDawns === 1 && r.classifiedDawns === 1 && r.unknownDawns === 0 &&
    r.marginalClassifiedDawns === 1 && r.marginalUnknownDawns === 0 &&
    r.shadowClassifiedDawns === 1 && r.shadowUnknownDawns === 0 &&
    d.classified === true && d.marginalClassified === true && d.shadowClassified === true &&
    d.dominantBlocker === cond && d.eligibleN === 0,
    'scored=' + r.scoredDawns + ' classified=' + r.classifiedDawns +
    ' shadowClassified=' + r.shadowClassifiedDawns + ' shadowUnknown=' + r.shadowUnknownDawns +
    ' dominant=' + d.dominantBlocker + ' eligibleN=' + d.eligibleN);
}
// Eligible pool, ranked pick agrees with the bid.
(function () {
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 1, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const d = r.poolDawns[0] || {};
  check('eligible 1 + bid agrees -> classified + shadow-classified, pick v2, S0 agreement 1/1',
    r.classifiedDawns === 1 && r.unknownDawns === 0 && r.shadowClassifiedDawns === 1 && r.shadowUnknownDawns === 0 &&
    d.eligibleN === 1 && d.rankedPick === 'v2' && d.dominantBlocker == null &&
    r.shadow.s0Agreement.biddableDawns === 1 && r.shadow.s0Agreement.agreeDawns === 1,
    'classified=' + r.classifiedDawns + ' shadowClassified=' + r.shadowClassifiedDawns +
    ' pick=' + d.rankedPick + ' agreement=' + JSON.stringify(r.shadow.s0Agreement));
})();
// Two dawns: blocked then eligible (histogram + ranger split + shadows).
(function () {
  const blocked = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 };
  const open = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 2 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [
      scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait'),
      scoreRow(12, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch'),
    ],
    companionPool: [
      poolRow(11, 'v1', 'strike', 'party', 'explorer', blocked, [], null, [], null, null),
      poolRow(12, 'v1', 'strike', 'party', 'explorer', open, ['v2', 'v3'], 'v2', [{ id: 'v2', s: 8 }, { id: 'v3', s: 6 }], 'v2', true),
    ],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(12, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('two dawns blocked-then-eligible -> classified 2, shadow 2, S1/S2 biddable 2 (foragers open the blocked dawn)',
    r.scoredDawns === 2 && r.classifiedDawns === 2 && r.unknownDawns === 0 &&
    r.shadowClassifiedDawns === 2 && r.shadowUnknownDawns === 0 &&
    r.eligibleHist['0'] === 1 && r.eligibleHist['2'] === 1 &&
    r.shadow.per.s0.biddable === 1 && r.shadow.per.s1.biddable === 2 && r.shadow.per.s2.biddable === 2 &&
    r.shadow.paired.s0ZeroS1Open === 1 && r.shadow.paired.s0ZeroS2Open === 1,
    'scored=' + r.scoredDawns + ' shadow=' + r.shadowClassifiedDawns +
    ' biddable=' + JSON.stringify({ s0: r.shadow.per.s0.biddable, s1: r.shadow.per.s1.biddable, s2: r.shadow.per.s2.biddable }) +
    ' paired=' + JSON.stringify(r.shadow.paired));
})();

// Unknown cases (pool-level).
(function () {
  // Missing pool row.
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('missing pool row -> unknown (missing-pool-row)',
    r.scoredDawns === 1 && r.classifiedDawns === 0 && r.unknownDawns === 1 &&
    (r.unknownList[0] || {}).reason === 'missing-pool-row',
    'unknown=' + JSON.stringify(r.unknownList));
})();
(function () {
  // Replica disagrees with the real bid.
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', false)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('replica disagree (agree=false with a bid) -> unknown',
    r.unknownDawns === 1 && String((r.unknownList[0] || {}).reason).indexOf('replica-disagree') === 0,
    'unknown=' + JSON.stringify(r.unknownList));
})();

// ---------- 2c. Marginal classifier fixtures (reused) ----------
// M1: co-occurrence — one member fails away AND trustLow, one fails
// trustLow AND notRanger, one fails away AND notRanger, one eligible.
(function () {
  const counts = { selfOrScholar: 1, dead: 0, away: 2, trustLow: 1, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  const members = [
    memberFor('selfOrScholar', 'v1'),
    { id: 'a', profile: 'wanderer', trust: 10, trustRaw: 10, node: { nx: 4, ny: 4 }, away: true, engaged: false, onExped: false, alive: true, firstFail: 'away' },
    { id: 'b', profile: 'forager', trust: 10, trustRaw: 10, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'trustLow' },
    { id: 'c', profile: 'forager', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: true, engaged: false, onExped: false, alive: true, firstFail: 'away' },
    { id: 'v2', profile: 'wanderer', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'eligible' },
  ];
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true, members)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const m = r.marginals;
  check('M1 co-occurrence: Pop-B 4, away/trustLow/notRanger 2 each, each pair 1, alone 0; shadow S0/S1/S2 biddable 1',
    r.marginalClassifiedDawns === 1 && r.marginalUnknownDawns === 0 &&
    r.shadowClassifiedDawns === 1 && r.shadowUnknownDawns === 0 &&
    m.popA === 4 && m.popB === 4 && m.dead === 0 &&
    m.cond.away === 2 && m.cond.trustLow === 2 && m.cond.notRanger === 2 &&
    m.pair['trustLowxaway'] === 1 && m.pair['trustLowxnotRanger'] === 1 && m.pair['awayxnotRanger'] === 1 &&
    m.alone.away === 0 && m.alone.trustLow === 0 && m.alone.notRanger === 0 &&
    r.shadow.per.s0.biddable === 1 && r.shadow.per.s1.biddable === 1 && r.shadow.per.s2.biddable === 1,
    'marginals=' + JSON.stringify(m) + ' biddable=' + JSON.stringify({ s0: r.shadow.per.s0.biddable, s1: r.shadow.per.s1.biddable, s2: r.shadow.per.s2.biddable }));
})();
// M3: members-shape unknowns — a dawn that is first-fail-classified
// but has no valid members array is marginal-unknown (and therefore
// shadow-unknown too), not classified.
(function () {
  function baseJ(row) {
    return baseSeed({
      v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
      dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
      companionPool: [row],
      dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
    });
  }
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 1, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  const rowA = poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true);
  delete rowA.members;
  const rA = classifyOne(baseJ(rowA));
  check('M3a members missing -> marginal-unknown AND shadow-unknown (members-missing)',
    rA.classifiedDawns === 1 && rA.marginalClassifiedDawns === 0 && rA.marginalUnknownDawns === 1 &&
    rA.shadowClassifiedDawns === 0 && rA.shadowUnknownDawns === 1 &&
    (rA.shadowUnknownList[0] || {}).reason === 'members-missing',
    'shadowUnknown=' + JSON.stringify(rA.shadowUnknownList));
})();

// ---------- 2d. Shadow classifier fixtures ----------
// SH1: mixed roster, forager first in roster order — the identity
// distribution differs by shadow: S0 picks the ranger, S1/S2 pick
// the forager.
(function () {
  const members = [
    memberFor('selfOrScholar', 'v1'),
    memberFor('selfOrScholar', 'scholar'),
    { id: 'f1', profile: 'forager', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'notRanger' },
    { id: 'h1', profile: 'homebody', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'notRanger' },
    { id: 'r1', profile: 'wanderer', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'eligible' },
  ];
  const counts = { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 1 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, ['r1'], 'r1', [{ id: 'r1', s: 7 }], null, null, members)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const sh = r.shadow;
  check('SH1 mixed roster: S0 n=1 pick ranger; S1 n=3 pick forager; S2 n=2 pick forager; nesting holds',
    r.shadowClassifiedDawns === 1 && r.shadowUnknownDawns === 0 &&
    sh.per.s0.eligibleTotal === 1 && sh.per.s1.eligibleTotal === 3 && sh.per.s2.eligibleTotal === 2 &&
    sh.per.s0.pickProfileCounts.wanderer === 1 && sh.per.s1.pickProfileCounts.forager === 1 && sh.per.s2.pickProfileCounts.forager === 1 &&
    sh.per.s1.pooledProfileCounts.forager === 1 && sh.per.s1.pooledProfileCounts.homebody === 1 && sh.per.s1.pooledProfileCounts.wanderer === 1 &&
    sh.per.s0.biddable === 1 && sh.per.s1.biddable === 1 && sh.per.s2.biddable === 1,
    'per=' + JSON.stringify(sh.per));
})();
// SH2: S0-empty dawn that opens under both relaxations (paired move).
(function () {
  const members = [
    memberFor('selfOrScholar', 'v1'),
    memberFor('selfOrScholar', 'scholar'),
    { id: 'f1', profile: 'forager', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'notRanger' },
    { id: 'h1', profile: 'homebody', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'notRanger' },
  ];
  const counts = { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, [], null, [], null, null, members)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const sh = r.shadow;
  check('SH2 S0-empty dawn: S0 0, S1 n=2 pick forager, S2 n=1 pick forager; paired s0ZeroS1Open=1 s0ZeroS2Open=1',
    r.shadowClassifiedDawns === 1 && r.shadowUnknownDawns === 0 &&
    sh.per.s0.eligible0 === 1 && sh.per.s0.biddable === 0 &&
    sh.per.s1.eligibleTotal === 2 && sh.per.s1.pickProfileCounts.forager === 1 &&
    sh.per.s2.eligibleTotal === 1 && sh.per.s2.pickProfileCounts.forager === 1 &&
    sh.paired.s0ZeroS1Open === 1 && sh.paired.s0ZeroS2Open === 1 && sh.paired.s0ZeroS1Zero === 0,
    'per=' + JSON.stringify(sh.per) + ' paired=' + JSON.stringify(sh.paired));
})();
// SH3: trust boundary — trust 14 excluded everywhere, trust 15 in all.
(function () {
  const members = [
    memberFor('selfOrScholar', 'v1'),
    { id: 't14', profile: 'wanderer', trust: 14, trustRaw: 14, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'trustLow' },
    { id: 't15', profile: 'wanderer', trust: 15, trustRaw: 15, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'eligible' },
  ];
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 1, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, ['t15'], 't15', [{ id: 't15', s: 7 }], null, null, members)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('SH3 trust boundary: trust 14 in no shadow, trust 15 in all three (n=1 each)',
    r.shadowClassifiedDawns === 1 && r.shadowUnknownDawns === 0 &&
    r.shadow.per.s0.eligibleTotal === 1 && r.shadow.per.s1.eligibleTotal === 1 && r.shadow.per.s2.eligibleTotal === 1,
    'per=' + JSON.stringify(r.shadow.per));
})();
// SH4: profile-null member — eligible ONLY in S1.
(function () {
  const members = [
    memberFor('selfOrScholar', 'v1'),
    { id: 'n1', profile: null, trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'notRanger' },
  ];
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 1, onExped: 0, eligible: 0 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, [], null, [], null, null, members)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('SH4 profile-null: S0/S2 empty, S1 n=1 pick profile null, nullProfileEligible 1',
    r.shadowClassifiedDawns === 1 && r.shadowUnknownDawns === 0 &&
    r.shadow.per.s0.eligible0 === 1 && r.shadow.per.s2.eligible0 === 1 &&
    r.shadow.per.s1.eligibleTotal === 1 && r.shadow.per.s1.pickProfileCounts['null'] === 1 &&
    r.shadow.per.s1.nullProfileEligible === 1 && r.shadow.per.s1.pooledProfileCounts['null'] === 1,
    'per=' + JSON.stringify(r.shadow.per));
})();
// SH5: shadow shape unknowns — each fails the dawn at the shadow level.
(function () {
  function baseJ(row) {
    return baseSeed({
      v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
      dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
      companionPool: [row],
      dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
    });
  }
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 1, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  // (a) shadow missing entirely.
  const rowA = poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true);
  delete rowA.shadow;
  const rA = classifyOne(baseJ(rowA));
  check('SH5a shadow missing -> shadow-unknown (shadow-missing), marginal still classified',
    rA.marginalClassifiedDawns === 1 && rA.shadowClassifiedDawns === 0 && rA.shadowUnknownDawns === 1 &&
    (rA.shadowUnknownList[0] || {}).reason === 'shadow-missing',
    'shadowUnknown=' + JSON.stringify(rA.shadowUnknownList));
  // (b) S0 eligible mismatch vs the row (rankedPick/profileCounts
  // cleared too, so the shape checks pass and the S0-vs-row
  // comparison is what fires).
  const rowB = poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true);
  rowB.shadow.s0.eligible = [];
  rowB.shadow.s0.rankedPick = null;
  rowB.shadow.s0.rankedOrder = [];
  rowB.shadow.s0.pickProfile = null;
  rowB.shadow.s0.profileCounts = { explorer: 0, wanderer: 0, forager: 0, homebody: 0, null: 0 };
  const rB = classifyOne(baseJ(rowB));
  check('SH5b S0 eligible != row eligible -> shadow-unknown (shadow-s0-mismatch:eligible)',
    rB.shadowClassifiedDawns === 0 && rB.shadowUnknownDawns === 1 &&
    String((rB.shadowUnknownList[0] || {}).reason).indexOf('shadow-s0-mismatch:eligible') === 0,
    'shadowUnknown=' + JSON.stringify(rB.shadowUnknownList));
  // (c) S0 ranked pick mismatch vs the row.
  const rowC = poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true);
  rowC.shadow.s0.rankedPick = 'someone-else';
  const rC = classifyOne(baseJ(rowC));
  check('SH5c S0 pick != row pick -> shadow-unknown (shadow-s0-mismatch:pick)',
    rC.shadowClassifiedDawns === 0 && rC.shadowUnknownDawns === 1 &&
    String((rC.shadowUnknownList[0] || {}).reason).indexOf('shadow-s0-mismatch:pick') === 0,
    'shadowUnknown=' + JSON.stringify(rC.shadowUnknownList));
  // (d) not nested: S1 emptied while S2 still holds the wanderer +
  // forager, so S2 ⊄ S1 while every profile check passes (both
  // members are S2-admissible profiles).
  const membersD = [
    memberFor('selfOrScholar', 'v1'),
    { id: 'f1', profile: 'forager', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'notRanger' },
    { id: 'v2', profile: 'wanderer', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true, firstFail: 'eligible' },
  ];
  const countsD = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 1, onExped: 0, eligible: 1 };
  const rowD = poolRow(11, 'v1', 'strike', 'party', 'forager', countsD, ['v2'], 'v2', [{ id: 'v2', s: 7 }], null, null, membersD);
  rowD.shadow.s1.eligible = [];
  rowD.shadow.s1.rankedPick = null;
  rowD.shadow.s1.rankedOrder = [];
  rowD.shadow.s1.pickProfile = null;
  rowD.shadow.s1.profileCounts = { explorer: 0, wanderer: 0, forager: 0, homebody: 0, null: 0 };
  const rD = classifyOne(baseJ(rowD));
  check('SH5d S2 not subset of S1 -> shadow-unknown (shadow-not-nested)',
    rD.shadowClassifiedDawns === 0 && rD.shadowUnknownDawns === 1 &&
    String((rD.shadowUnknownList[0] || {}).reason).indexOf('shadow-not-nested') === 0,
    'shadowUnknown=' + JSON.stringify(rD.shadowUnknownList));
  // (e) profileCounts do not sum to the eligible count.
  const rowE = poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true);
  rowE.shadow.s1.profileCounts.wanderer = 99;
  const rE = classifyOne(baseJ(rowE));
  check('SH5e profileCounts sum != eligible -> shadow-unknown (shadow-counts-mismatch)',
    rE.shadowClassifiedDawns === 0 && rE.shadowUnknownDawns === 1 &&
    String((rE.shadowUnknownList[0] || {}).reason).indexOf('shadow-counts-mismatch') === 0,
    'shadowUnknown=' + JSON.stringify(rE.shadowUnknownList));
  // (f) rankedPick null with eligible > 0.
  const rowF = poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true);
  rowF.shadow.s1.rankedPick = null;
  const rF = classifyOne(baseJ(rowF));
  check('SH5f rankedPick null with eligible > 0 -> shadow-unknown (shadow-no-pick)',
    rF.shadowClassifiedDawns === 0 && rF.shadowUnknownDawns === 1 &&
    String((rF.shadowUnknownList[0] || {}).reason).indexOf('shadow-no-pick') === 0,
    'shadowUnknown=' + JSON.stringify(rF.shadowUnknownList));
})();
// SH6: S0 agreement — bid companion == S0 pick classifies; a shadow
// whose S0 pick differs from the bid is unknown.
(function () {
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 2 };
  function baseJ(row) {
    return baseSeed({
      v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
      dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
      companionPool: [row],
      dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
    });
  }
  const rowOk = poolRow(11, 'v1', 'strike', 'party', 'wanderer', counts, ['v2', 'v3'], 'v2', [{ id: 'v2', s: 9 }, { id: 'v3', s: 5 }], 'v2', true);
  const rOk = classifyOne(baseJ(rowOk));
  check('SH6a S0 pick == bid companion -> classified, S0 agreement 1/1',
    rOk.shadowClassifiedDawns === 1 && rOk.shadowUnknownDawns === 0 &&
    rOk.shadow.s0Agreement.biddableDawns === 1 && rOk.shadow.s0Agreement.agreeDawns === 1,
    'agreement=' + JSON.stringify(rOk.shadow.s0Agreement));
  const rowBad = poolRow(11, 'v1', 'strike', 'party', 'wanderer', counts, ['v2', 'v3'], 'v2', [{ id: 'v2', s: 9 }, { id: 'v3', s: 5 }], 'v2', true);
  rowBad.shadow.s0.rankedPick = 'v3';
  const rBad = classifyOne(baseJ(rowBad));
  check('SH6b S0 pick != bid companion -> shadow-unknown (shadow-s0-mismatch:pick)',
    rBad.shadowClassifiedDawns === 0 && rBad.shadowUnknownDawns === 1 &&
    String((rBad.shadowUnknownList[0] || {}).reason).indexOf('shadow-s0-mismatch:pick') === 0,
    'shadowUnknown=' + JSON.stringify(rBad.shadowUnknownList));
})();

// ---------- 2e. Analyzer summarizeShadow shape ----------
(function () {
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 };
  const one = ANALYZE.classifyShadow(baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, [], null, [], null, null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
    deaths: [
      { day: 5, kind: 'x', who: 'v9', cause: 'expedition', player: false },
      { day: 6, kind: 'y', who: 'v8', cause: 'starvation', player: false },
    ],
  }));
  const leg = { bySeed: { 102401: one }, files: ['a.json'] };
  const sum = ANALYZE.summarizeShadow(leg);
  check('summarizeShadow counts the one scored dawn, shadow-classified 1, unknown 0',
    sum.shadowScoredDawns === 1 && sum.shadowClassifiedDawns === 1 && sum.shadowUnknownDawns === 0 && sum.shadowClassifiedShare === 1,
    'got scored=' + sum.shadowScoredDawns + ' share=' + sum.shadowClassifiedShare);
  check('summarizeShadow S0 eligible-0 share is 1, S1/S2 biddable 1 (foragers open it)',
    sum.shadow.per.s0.eligible0Share === 1 && sum.shadow.per.s0.biddable === 0 &&
    sum.shadow.per.s1.biddable === 1 && sum.shadow.per.s2.biddable === 1,
    'got s0=' + JSON.stringify(sum.shadow.per.s0) + ' s1biddable=' + sum.shadow.per.s1.biddable);
  check('summarizeShadow guard counts total deaths 2, expedition deaths 1',
    sum.guard.totalDeaths === 2 && sum.guard.expeditionDeaths === 1,
    'got guard=' + JSON.stringify(sum.guard));
  check('summarizeShadow wallDetail names both national fields',
    Array.isArray(sum.marginals.wallDetail) && sum.marginals.wallDetail.length === 1 &&
    sum.marginals.wallDetail[0].nationalByStanding === false && sum.marginals.wallDetail[0].nationalByRank === false,
    'got wallDetail=' + JSON.stringify(sum.marginals.wallDetail));
  check('summarizeShadow launchedInstances is 0 on this fixture leg',
    sum.launchedInstances === 0, 'got ' + sum.launchedInstances);
})();

// ---------- 3. Recorder: live in-memory run (shape + pick neutrality) ----------
console.log('== recorder live ==');
function shadowRowValid(r) {
  if (!r || !r.shadow || typeof r.shadow !== 'object') return 'shadow-missing';
  const byId = {};
  for (const m of (r.members || [])) if (m && m.id != null) byId[m.id] = m;
  const setEq = function (a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    const sa = a.slice().sort(), sb = b.slice().sort();
    for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
    return true;
  };
  for (const s of ['s0', 's1', 's2']) {
    const o = r.shadow[s];
    if (!o || !Array.isArray(o.eligible) || !('rankedPick' in o) || typeof o.rankedVia !== 'string' ||
      !('pickProfile' in o) || !o.profileCounts) return 'shadow-shape:' + s;
    if (o.eligible.length > 0 && !o.rankedPick) return 'shadow-no-pick:' + s;
    let pcSum = 0;
    for (const k of ['explorer', 'wanderer', 'forager', 'homebody', 'null']) pcSum += (o.profileCounts[k] | 0);
    if (pcSum !== o.eligible.length) return 'shadow-counts-mismatch:' + s;
    if (o.rankedPick != null) {
      const pm = byId[o.rankedPick];
      if (!pm) return 'shadow-pick-not-member:' + s;
      if (o.pickProfile !== (pm.profile != null ? pm.profile : null)) return 'shadow-pickprofile-mismatch:' + s;
    }
  }
  if (!setEq(r.shadow.s0.eligible, r.eligible || [])) return 'shadow-s0-mismatch:eligible';
  if (r.shadow.s0.rankedPick !== r.rankedPick) return 'shadow-s0-mismatch:pick';
  const isSub = function (sub, sup) { const s = new Set(sup); for (const x of sub) if (!s.has(x)) return false; return true; };
  if (!isSub(r.shadow.s0.eligible, r.shadow.s2.eligible) || !isSub(r.shadow.s2.eligible, r.shadow.s1.eligible)) return 'shadow-not-nested';
  return null;
}
async function liveRuns() {
  // DAYS=5 live run through the driver: rows exist with their shape,
  // no instrument errors, and the score wrap records bids.
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'profileshadow-driver-20261116.js'))];
  const driver = require(path.join(REPO, 'scripts', 'profileshadow-driver-20261116.js'));
  const out = await driver.oneRun(102401);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries dawnbid arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.dawnbidDeparts) && Array.isArray(out.dawnbidCensus) && Array.isArray(out.dawnbidStarts));
  check('live run carries companionPool array', Array.isArray(out.companionPool));
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  check('live run policy sha is competent verbatim (74a890f0844e)', out.policySha === '74a890f0844e', 'got ' + out.policySha);
  const badScore = (out.dawnbidScores || []).find(function (r) { return !(r && typeof r.day === 'number' && typeof r.part === 'number' && r.vid && Array.isArray(r.cands) && r.plan !== undefined); });
  check('score rows have their shape', !badScore, badScore ? JSON.stringify(badScore).slice(0, 200) : '');
  const badPool = (out.companionPool || []).find(function (r) {
    if (!(r && typeof r.day === 'number' && r.part === 0 && r.vid && r.counts && typeof r.rosterN === 'number' && Array.isArray(r.eligible))) return true;
    let sum = 0;
    for (const k of Object.keys(r.counts)) sum += r.counts[k];
    if (sum !== r.rosterN) return true;
    if (r.eligible.length !== (r.counts.eligible | 0)) return true;
    if ((r.counts.eligible | 0) > 0 && !r.rankedPick) return true;
    // Members extension: one entry per roster member, firstFail matching
    // the fails map, tallies matching the counts.
    if (!Array.isArray(r.members) || r.members.length !== r.rosterN) return true;
    const tally = {};
    for (const m of r.members) {
      if (!m || m.id == null || m.firstFail == null) return true;
      if ((r.fails || {})[m.id] !== m.firstFail) return true;
      tally[m.firstFail] = (tally[m.firstFail] || 0) + 1;
    }
    for (const c of Object.keys(r.counts)) if ((tally[c] || 0) !== (r.counts[c] | 0)) return true;
    // Shadow extension: valid shadow object, S0 == the row, nested.
    if (shadowRowValid(r)) return true;
    return false;
  });
  check('pool rows have their shape (counts sum, eligible matches, pick present, members valid, shadow valid + nested)', !badPool, badPool ? JSON.stringify(badPool).slice(0, 400) : '');
  console.log('  info: live 5d run recorded ' + (out.companionPool || []).length + ' pool rows, ' + (out.dawnbidScores || []).length + ' score rows');
  return out;
}

// ---------- 3b. Pool replica + shadows against live game state ----------
async function replicaLive() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const driver = require(path.join(REPO, 'scripts', 'profileshadow-driver-20261116.js'));
  const { Game } = await loadGame({ seed: 102401, mode: 'profileshadow-proof', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  check('live replica: roster is non-empty', roster.length > 0, 'roster=' + roster.length);
  let checked = 0;
  for (const vid of roster.slice(0, 5)) {
    const pool = driver.poolReplica(Game, vid);
    if (!pool) continue;
    checked++;
    let sum = 0;
    for (const k of Object.keys(pool.counts)) sum += pool.counts[k];
    let membersOk = Array.isArray(pool.members) && pool.members.length === pool.rosterN;
    if (membersOk) {
      const tally = {};
      for (const m of pool.members) {
        if (!m || m.id == null || m.firstFail == null || (pool.fails || {})[m.id] !== m.firstFail) { membersOk = false; break; }
        tally[m.firstFail] = (tally[m.firstFail] || 0) + 1;
      }
      if (membersOk) for (const c of Object.keys(pool.counts)) if ((tally[c] || 0) !== (pool.counts[c] | 0)) { membersOk = false; break; }
    }
    check('live replica for ' + vid + ': counts sum to rosterN, eligible matches, members valid',
      sum === pool.rosterN && pool.eligible.length === (pool.counts.eligible | 0) &&
      ((pool.counts.eligible | 0) === 0 || !!pool.rankedPick) && membersOk,
      'sum=' + sum + ' rosterN=' + pool.rosterN + ' eligible=' + pool.eligible.length + ' pick=' + pool.rankedPick + ' membersOk=' + membersOk);
    // Shadow computation against the same live state.
    const shadow = driver.shadowPools(Game, vid, pool);
    const setEq = function (a, b) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
      const sa = a.slice().sort(), sb = b.slice().sort();
      for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
      return true;
    };
    const isSub = function (sub, sup) { const s = new Set(sup); for (const x of sub) if (!s.has(x)) return false; return true; };
    check('live shadow for ' + vid + ': S0 == poolReplica eligible/pick, S0 ⊆ S2 ⊆ S1, profileCounts sum',
      !!shadow && setEq(shadow.s0.eligible, pool.eligible) && shadow.s0.rankedPick === pool.rankedPick &&
      isSub(shadow.s0.eligible, shadow.s2.eligible) && isSub(shadow.s2.eligible, shadow.s1.eligible) &&
      (function () {
        for (const s of ['s0', 's1', 's2']) {
          let pcSum = 0;
          for (const k of ['explorer', 'wanderer', 'forager', 'homebody', 'null']) pcSum += (shadow[s].profileCounts[k] | 0);
          if (pcSum !== shadow[s].eligible.length) return false;
          if (shadow[s].eligible.length > 0 && !shadow[s].rankedPick) return false;
        }
        return true;
      })(),
      shadow ? JSON.stringify({ s0: shadow.s0.eligible.length, s1: shadow.s1.eligible.length, s2: shadow.s2.eligible.length }) : 'shadow null');
    // shadowEligible agrees with shadowPools on all three modes.
    check('live shadowEligible agrees with shadowPools for ' + vid,
      !!shadow &&
      setEq(driver.shadowEligible(pool.members, pool.haven, 's0'), shadow.s0.eligible) &&
      setEq(driver.shadowEligible(pool.members, pool.haven, 's1'), shadow.s1.eligible) &&
      setEq(driver.shadowEligible(pool.members, pool.haven, 's2'), shadow.s2.eligible),
      'shadowEligible disagrees with shadowPools');
    if (checked >= 3) break;
  }
  check('live replica ran on at least 3 roster members', checked >= 3, 'checked=' + checked);
}

// ---------- 4. Determinism legs D1 + D2 (60d, seed 102401) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60' }, envExtra || {});
  const script = "const d=require('./scripts/profileshadow-driver-20261116.js');" +
    "d.oneRun(102401).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childFingerprint({});
  const b = childFingerprint({});
  check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childFingerprint({ PROFILESHADOW_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty companionPool/dawnbid/v4 arrays',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  console.log('  info: D1 60d run recorded ' + (a.full.companionPool || []).length + ' pool rows, ' +
    (a.full.dawnbidScores || []).length + ' score rows, ' + (a.full.v4seeds || []).length + ' v4 seeds');
}

(async function () {
  try {
    await liveRuns();
    await replicaLive();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
