// test-poolfirstfail-b.js — proof for arm sim-poolfirstfail-b (DIAG instrument).
// §1 static (frozen prereg, instrument = 3 new files only, src diff 0,
// pool path identical between the holderstate corpus base a6534c67b
// and this base df40fced1) + §2 analyzer selftest green + §3 fixture
// end-to-end through seedOf on a synthetic corpus (H applied + Leg P
// pool decomposition) + §4 live 150d shape run on screening seed
// 106731 (pool rows with gap fields, census rows, holder-state rows)
// + §5 D1/D2 at 30d on 106731 under the full substrate (repeatability
// + recorder neutrality).
// No new sims before §4; §4/§5 are live proof runs on the screening
// seed only (the judged leg runs the frozen band after this test).
// Usage: node scripts/test-poolfirstfail-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
process.env.VETREENGAGE = '1';
process.env.PARTYSIZE4 = '1';
process.env.SENSEEXPED = '1';
process.env.FLEEREPAIR2 = '1';
process.env.FIGHTALLY2 = '1';
process.env.ALLYSLOT3 = '1';
process.env.LAUNCHSURVIVE = '1';
const AH = require(path.join(REPO, 'scripts', 'analyze-poolfirstfail-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function git(args) {
  try { return execSync('git ' + args, { cwd: REPO }).toString().trim(); } catch (e) { return null; }
}

// ---- §1 STATIC ----
(function () {
  const prereg = path.join(REPO, 'evidence', '2026-11-21', 'sim-poolfirstfail-b-prereg.md');
  check('§1 prereg exists', fs.existsSync(prereg));
  const text = fs.existsSync(prereg) ? fs.readFileSync(prereg, 'utf8') : '';
  check('§1 prereg freezes the DIAG-GO bar', text.indexOf('DIAG-GO BAR (frozen') !== -1);
  check('§1 prereg freezes the classification bar (0 unclassified pool snapshots on the fresh band)',
    text.indexOf('0 unclassified pool') !== -1);
  check('§1 prereg freezes Leg P (pool-first-fail decomposition, P1-P8)',
    text.indexOf('Leg P') !== -1 && text.indexOf('P8 what-would-have-to-change') !== -1);
  const flat = text.replace(/\s+/g, ' ');
  check('§1 prereg names the overlap guard (no villager-brain.js / win-plan.js)',
    text.indexOf('OVERLAP GUARD') !== -1 && flat.indexOf('do NOT touch `villager-brain.js` or `win-plan.js`') !== -1);
  check('§1 prereg freezes Taxonomy H', flat.indexOf('Taxonomy H') !== -1);
  check('§1 prereg records the fresh band 106731-106738',
    text.indexOf('106731–106738') !== -1 && text.indexOf('106731–106738 FRESH') !== -1);
  check('§1 prereg records AMENDMENT 1 (census definition) + AMENDMENT 2 (§4 150d)',
    text.indexOf('AMENDMENT 1') !== -1 && text.indexOf('AMENDMENT 2') !== -1);
  check('§1 src/ clean at proof time', (git('status --short -- src/js') || '') === '', git('status --short -- src/js'));
  const poolPathDiff = git('diff a6534c67b HEAD -- src/js/villager-agency.js src/js/villager-objectives.js scripts/policies/competent.js');
  check('§1 pool-path files identical between corpus base a6534c67b and HEAD (agency/objectives/policy)', poolPathDiff === '', (poolPathDiff || '').slice(0, 200));
  const brainWinDiff = git('diff a6534c67b HEAD -- src/js/villager-brain.js src/js/win-plan.js') || '';
  const poolFnChanged = brainWinDiff.split('\n').filter(function (l) {
    return (l[0] === '+' || l[0] === '-') && /findCompanion|npcRangeProfile|npcRangingApt|RANGY_OCC/.test(l);
  });
  check('§1 no added/removed pool-filter line between a6534c67b and HEAD (findCompanion/npcRangeProfile/RANGY_OCC)',
    poolFnChanged.length === 0, poolFnChanged.slice(0, 5));
  const newSt = git('status --short -- scripts/poolfirstfail-driver-b.js scripts/analyze-poolfirstfail-b.js scripts/test-poolfirstfail-b.js') || '';
  const inHead = git('ls-tree HEAD -- scripts/poolfirstfail-driver-b.js scripts/analyze-poolfirstfail-b.js scripts/test-poolfirstfail-b.js') || '';
  check('§1 driver + analyzer + test are new files on this branch',
    (newSt.indexOf('??') !== -1 && newSt.indexOf('poolfirstfail-driver-b.js') !== -1 &&
      newSt.indexOf('analyze-poolfirstfail-b.js') !== -1 &&
      newSt.indexOf('test-poolfirstfail-b.js') !== -1) ||
    (inHead.indexOf('poolfirstfail-driver-b.js') !== -1 &&
      inHead.indexOf('analyze-poolfirstfail-b.js') !== -1 &&
      inHead.indexOf('test-poolfirstfail-b.js') !== -1),
    { status: newSt, head: inHead });
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'poolfirstfail-driver-b.js'), 'utf8');
  check('§1 driver arm/run is poolfirstfail-b, usage line re-seeded to 106731-106738',
    driverSrc.indexOf("arm: 'poolfirstfail-b'") !== -1 &&
    driverSrc.indexOf('SEEDS=106731,106732,106733,106734,106735,106736,106737,106738') !== -1 &&
    driverSrc.indexOf("process.env.EVIDENCE_DATE || '2026-11-21'") !== -1);
  check('§1 driver carries the per-part recorder (objTick / npcNodeTravel / vbrainLogGate wraps)',
    driverSrc.indexOf('sampleHolderState') !== -1 &&
    driverSrc.indexOf('Game.objTick') !== -1 &&
    driverSrc.indexOf('Game.npcNodeTravel') !== -1 &&
    driverSrc.indexOf('Game.vbrainLogGate') !== -1 &&
    driverSrc.indexOf('holderState: holderState') !== -1 &&
    driverSrc.indexOf('holderGatePicks: holderGatePicks') !== -1);
  check('§1 driver carries the pool-first-fail extension (rangeScoreOf + census + holderRange)',
    driverSrc.indexOf('rangeScoreOf') !== -1 &&
    driverSrc.indexOf('poolCensus: poolCensus') !== -1 &&
    driverSrc.indexOf('holderRange: pool.holderRange') !== -1 &&
    driverSrc.indexOf('awayPurpose') !== -1 &&
    driverSrc.indexOf('poolfirstfail-apt-mismatch') !== -1);
  check('§1 analyzer exports the H classifier + Leg R + Leg P + seedOf',
    typeof AH.classifyUnknownDayH === 'function' && typeof AH.applyHolderState === 'function' &&
    typeof AH.buildHsCtx === 'function' && typeof AH.reproduceOldBand === 'function' &&
    typeof AH.seedOf === 'function' && Array.isArray(AH.REPRODUCTION) && AH.REPRODUCTION.length === 10 &&
    typeof AH.eligibleUnder === 'function' && typeof AH.poolSnapshotCheck === 'function' &&
    typeof AH.poolSeedP === 'function' && typeof AH.poolBandP === 'function');
})();

// ---- §2 ANALYZER SELFTEST ----
check('§2 analyzer selftest green (74 checks incl. §F H fixtures + §G Leg R + §H Leg P)', AH.selftest() === true);

// ---- §3 FIXTURE END-TO-END (seedOf applies H + Leg P) ----
(function () {
  function hsRow(day, part, when, obj, over) {
    return Object.assign({ day: day, part: part, when: when, vid: 'h1',
      target: 'algorithm', stage: 'party',
      obj: obj, away: false, engaged: false, node: { nx: 4, ny: 4 }, haven: true,
      onExped: false, isScholar: false, dead: false, commit: null }, over || {});
  }
  function choreObj(pl) { return { kind: 'HAVEN_CHORE', state: 'indoor', partsLeft: pl, indoor: true, chore: 'wait', purpose: 'chore', targetVid: null, companion: null }; }
  function doneObj() { return { kind: 'idle', state: 'done', partsLeft: 0, indoor: false, chore: null, purpose: null, targetVid: null, companion: null }; }
  function poolRange(score, gap, over) {
    return Object.assign({ temper: 'steady', temperScore: 0, goal: null, goalScore: 0,
      age: 35, ageScore: 0, apt: 0, aptParts: { occ: 0, snare: 0, tags: 0, observant: 0 },
      potential: false, potentialScore: 0, score: score,
      profile: score >= 5 ? 'explorer' : score >= 2 ? 'wanderer' : score >= -1 ? 'forager' : 'homebody',
      gap: gap }, over || {});
  }
  function poolMember(id, over) {
    return Object.assign({ id: id, profile: 'forager', trust: 20, trustRaw: 20,
      node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true,
      firstFail: 'notRanger', awayPurpose: null, awaySinceDay: null, awayDuration: null,
      trustGap: 0, range: poolRange(0, 2), rangeStale: false }, over || {});
  }
  function poolRow(day, members) {
    const counts = { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 };
    for (const m of members) counts[m.firstFail] = (counts[m.firstFail] || 0) + 1;
    const all = [poolMember('h1', { firstFail: 'selfOrScholar', profile: null, trust: 10, trustRaw: null, node: null, range: null }),
      poolMember('scholar', { firstFail: 'selfOrScholar', profile: null, trust: 10, trustRaw: null, node: null, range: null })].concat(members);
    return { day: day, part: 0, vid: 'h1', target: 'algorithm', stage: 'party',
      holderProfile: 'forager', holderRange: poolRange(0, 2), holderNode: { nx: 4, ny: 4 },
      haven: { nx: 4, ny: 4 }, rosterN: all.length, counts: counts, fails: {},
      eligible: [], rankedOrder: [], rankedPick: null, rankedVia: 'roster-fallback',
      bidCompanion: null, agree: null, members: all };
  }
  const commit11 = { day: 11, part: 1, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' };
  const doc = { seed: 999003, arm: 'poolfirstfail-b', run: 'poolfirstfail-b', mode: 'vre',
    policySha: '1884c8852d38aaaa', senseexpedFlag: '1', partysize4Flag: '1',
    vetreengageFlag: '1', fleerepair2Flag: '1', fightally2Flag: '1',
    allyslot3Flag: '1', launchsurviveFlag: '1', allyslot3InSrc: false,
    days: 12, gameDays: 12, endReason: 'survived', standing: 199, scaleRank: 'regional',
    won: false, maxWave: 4, instrumentErrors: [],
    v4seeds: [{ day: 10, vid: 'h1', mid: 'algorithm', wave: 4, outcome: 'fled',
      path: 'world-tick', stageAfter: 'party', target: 'algorithm', node: null }],
    dawnbidScores: [{ day: 11, part: 1, vid: 'h1',
      cands: [{ kind: 'HAVEN_CHORE', w: 4, winPlanAction: 'party_wait' }],
      pick: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', corePick: 'VISIT' },
      commit: commit11,
      plan: { stage: 'party', target: 'algorithm', needWave: 4, party: [] },
      holderGear: { armed: true, armored: true } }],
    dawnbidDeparts: [], dawnbidCensus: [10, 11, 12].map(function (d) {
      return { day: d, vid: 'h1', target: 'algorithm', needWave: 4, stage: 'party',
        party: [], holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false,
        holderSick: false, holderHealth: 80, holderGear: { armed: true, armored: true } };
    }),
    dawnbidStarts: [], launchdefSkips: [],
    companionPool: [
      poolRow(11, [
        poolMember('a1', { firstFail: 'notRanger', range: poolRange(1, 1) }),
        poolMember('a2', { firstFail: 'away', profile: 'wanderer', away: true, awayPurpose: 'expedition', onExped: true, range: poolRange(3, 0) }),
        poolMember('a3', { firstFail: 'trustLow', profile: 'explorer', trust: 8, trustRaw: 8, trustGap: 7, range: poolRange(6, 0) }),
      ]),
      poolRow(12, [
        poolMember('b1', { firstFail: 'notRanger', range: poolRange(0, 2) }),
        poolMember('b2', { firstFail: 'notRanger', profile: 'homebody', range: poolRange(2, 0), rangeStale: true }),
      ]),
    ],
    poolCensus: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (d) {
      return { day: d, rosterN: 6, livingN: 5, deadN: 1,
        liveProfiles: { explorer: 1, wanderer: 1, forager: 2, homebody: 1, null: 0 },
        holderN: 1, rangersAlive: 2, rangersAway: 1, rangersAtHome: 1,
        rangersAtHomeTrusted: 1, rangersOnExped: 0, rangersChainFull: 1 };
    }),
    v4launchTrack: [],
    v4departs: [], v4gates: [], v4encounters: [], deaths: [],
    // AMENDMENT 1: daily days 1-12 + trailing snapshot day 13.
    // scholarId is a DIFFERENT villager (the holder h1 is never
    // the scholar — scholarId 'h1' would make d10/d12
    // holder-scholar and break the H fixture below).
    daily: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(function (d) { return { day: d, scholarId: 'scholar-x' }; }),
    holderGatePicks: [],
    holderState: [
      hsRow(11, 1, 'tick-entry', doneObj(), { commit: null }),
      hsRow(11, 1, 'tick-exit', choreObj(4), { commit: commit11 }),
      hsRow(12, 0, 'tick-entry', choreObj(4), { commit: commit11 }),
      hsRow(12, 0, 'tick-exit', choreObj(3), { commit: commit11 }),
      hsRow(12, 1, 'tick-entry', choreObj(3), { engaged: true, commit: commit11 }),
      hsRow(12, 1, 'tick-exit', choreObj(3), { engaged: true, commit: commit11 }),
      hsRow(12, 2, 'tick-entry', choreObj(3), { commit: commit11 }),
      hsRow(12, 2, 'tick-exit', choreObj(2), { commit: commit11 }),
      hsRow(12, 3, 'tick-entry', choreObj(2), { commit: commit11 }),
      hsRow(12, 3, 'tick-exit', choreObj(1), { commit: commit11 }),
    ] };
  const s = AH.seedOf(doc);
  check('§3 seedOf opens exactly 1 instance, candidate-not-bid',
    s.instancesOpened === 1 && s.notBid.length === 1, { opened: s.instancesOpened, notBid: s.notBid.length });
  const inst = s.notBid[0];
  check('§3 seedOf: B leaves 1 unknown day (d12), H explains it as hs-engaged-skip',
    inst.hU === 1 && inst.hE === 1 && inst.hS === 1 &&
    inst.hDays.length === 1 && inst.hDays[0].hReason === 'hs-engaged-skip', inst);
  check('§3 seedOf: instance unknown is 0 after H', inst.unknown === 0, inst.unknown);
  check('§3 seedOf: holder-state rows counted (10)', s.holderStateRows === 10, s.holderStateRows);
  check('§3 seedOf Leg P: 2 snapshots, 0 problems, census 12 rows, censusOk',
    s.poolP.snapshots === 2 && s.poolP.problems.length === 0 &&
    s.poolP.censusRows === 12 && s.poolP.censusOk === true, s.poolP);
  check('§3 seedOf Leg P: binding first-fail notRanger 3 (away 1, trustLow 1)',
    s.poolP.firstFailsNonSelf.notRanger === 3 && s.poolP.firstFailsNonSelf.away === 1 &&
    s.poolP.firstFailsNonSelf.trustLow === 1, s.poolP.firstFailsNonSelf);
  check('§3 seedOf Leg P: relax-profile fills both empty snapshots',
    s.poolP.relax.profile === 2 && s.poolP.relaxGains.profile === 2, s.poolP.relax);
  check('§3 seedOf Leg P: gap histogram {0:1, 1:1, 2:1}, stale 1',
    s.poolP.gapHist[0] === 1 && s.poolP.gapHist[1] === 1 && s.poolP.gapHist[2] === 1 && s.poolP.gapStale === 1, s.poolP.gapHist);
})();

// ---- §4 RECORDER: live 150d shape run (screening seed 106731) ----
// 150d, not 100d (AMENDMENT 2): this seed forms no wave-4 plan by
// day 100 (0 holder-state rows, 0 pool rows at 100d despite 20
// v4seed rows) but 23 pool rows by 150d (378 holder-state rows,
// standing 325, maxWave 5, survived) — the 100d shape run cannot
// validate the pool recorder on this seed.
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '150';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'poolfirstfail-driver-b.js'))];
  const driver = require(path.join(REPO, 'scripts', 'poolfirstfail-driver-b.js'));
  check('live driver sees SEEDLAND hard-on', driver.SEEDLAND === true);
  const out = await driver.oneRun(106731);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run arm is poolfirstfail-b', out.arm === 'poolfirstfail-b' && out.run === 'poolfirstfail-b', 'arm=' + out.arm);
  check('live run carries v4 + dawnbid + pool + census + skip + holder-state arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) &&
    Array.isArray(out.v4encounters) && Array.isArray(out.dawnbidScores) &&
    Array.isArray(out.companionPool) && Array.isArray(out.poolCensus) &&
    Array.isArray(out.launchdefSkips) &&
    Array.isArray(out.holderState) && Array.isArray(out.holderGatePicks));
  check('live run self-describes the substrate (all seven flags 1, allyslot3InSrc false, launchTrackOn true)',
    out.senseexpedFlag === '1' && out.partysize4Flag === '1' && out.vetreengageFlag === '1' &&
    out.fleerepair2Flag === '1' && out.fightally2Flag === '1' && out.allyslot3Flag === '1' &&
    out.launchsurviveFlag === '1' && out.allyslot3InSrc === false && out.launchTrackOn === true);
  check('live run policy sha is the current competent verbatim (1884c8852d38)',
    out.policySha === '1884c8852d38', 'got ' + out.policySha);
  const hs = out.holderState || [];
  const whens = {};
  for (const r of hs) whens[r.when] = (whens[r.when] || 0) + 1;
  check('live run holder-state rows exist with all 3 `when` values (part-start / tick-entry / tick-exit)',
    hs.length > 0 && whens['part-start'] > 0 && whens['tick-entry'] > 0 && whens['tick-exit'] > 0, whens);
  let dupes = 0;
  const seen = {};
  for (const r of hs) {
    const k = r.vid + '|' + r.day + '|' + r.part + '|' + r.when;
    if (seen[k]) dupes++;
    seen[k] = true;
  }
  check('live run has at most 1 holder-state row per (vid, day, part, when)',
    dupes === 0, 'dupes=' + dupes);
  let badShape = 0;
  for (const r of hs) {
    if (r.day == null || r.part == null || r.part < 0 || r.part > 3 || !r.vid || !r.target ||
        typeof r.away !== 'boolean' || typeof r.engaged !== 'boolean' ||
        typeof r.haven !== 'boolean' || typeof r.onExped !== 'boolean' ||
        typeof r.isScholar !== 'boolean' || typeof r.dead !== 'boolean') badShape++;
  }
  check('live run holder-state rows all carry the frozen fields (day/part 0-3, flags boolean)',
    badShape === 0, 'badShape=' + badShape);
  const pool = out.companionPool || [];
  let badPool = 0, poolMembers = 0;
  for (const r of pool) {
    if (!r.counts || !Array.isArray(r.members)) { badPool++; continue; }
    let sum = 0;
    for (const k of Object.keys(r.counts)) sum += (r.counts[k] | 0);
    if (sum !== r.rosterN) badPool++;
    for (const m of r.members) {
      poolMembers++;
      if (m.firstFail !== 'selfOrScholar') {
        if (!m.range || typeof m.range.score !== 'number' || typeof m.range.gap !== 'number') badPool++;
        if (typeof m.trust !== 'number') badPool++;
      }
    }
  }
  check('live run pool rows exist with gap fields on every non-self member (counts sum to rosterN)',
    pool.length > 0 && badPool === 0, { rows: pool.length, members: poolMembers, bad: badPool });
  const census = out.poolCensus || [];
  let badCensus = 0;
  for (const c of census) {
    if (c.day == null || typeof c.rosterN !== 'number' || typeof c.livingN !== 'number' ||
        !c.liveProfiles || typeof c.rangersAlive !== 'number' ||
        typeof c.rangersAtHome !== 'number' || typeof c.rangersChainFull !== 'number') badCensus++;
  }
  // AMENDMENT 1: census day-set must sit inside the daily day-set
  // with |C| >= |D|-1 (trailing post-run snapshot day has no census).
  const cDays = {};
  for (const c of census) if (typeof c.day === 'number') cDays[c.day] = true;
  const dDays = {};
  for (const x of (out.daily || [])) if (x && typeof x.day === 'number') dDays[x.day] = true;
  let censusSubset = true;
  for (const d of Object.keys(cDays)) if (!dDays[d]) censusSubset = false;
  const censusOk = censusSubset && Object.keys(cDays).length >= Math.max(0, Object.keys(dDays).length - 1);
  check('live run census rows exist (one per daily day, AMENDMENT 1) with the frozen supply-chain fields',
    census.length > 0 && censusOk && badCensus === 0,
    { rows: census.length, dailyRows: (out.daily || []).length, subset: censusSubset, bad: badCensus });
  console.log('  info: live 150d run recorded ' + hs.length + ' holder-state rows (' +
    JSON.stringify(whens) + '), ' + (out.holderGatePicks || []).length + ' gate picks, ' +
    (out.v4seeds || []).length + ' seed rows, ' + (out.companionPool || []).length + ' pool rows, ' +
    (out.poolCensus || []).length + ' census rows');
}

// ---- §5 Determinism legs D1/D2 (30d, screening seed 106731, full substrate) ----
console.log('== determinism legs D1/D2 ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days), MODE: 'vre',
    VETREENGAGE: '1', PARTYSIZE4: '1', SENSEEXPED: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
    ALLYSLOT3: '1', LAUNCHSURVIVE: '1' }, envExtra || {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/poolfirstfail-driver-b.js');" +
    "d.oneRun(106731).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childRun(30, {});
  const b = childRun(30, {});
  check('D1 repeatability: identical full corpus, recorder ON twice, full substrate (30d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(30, { LAUNCHFUNNEL_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF, full substrate (30d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty recorder arrays (v4/dawnbid/pool/census/skips/holder-state)',
    (off.full.companionPool || []).length === 0 && (off.full.poolCensus || []).length === 0 &&
    (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.v4encounters || []).length === 0 && (off.full.launchdefSkips || []).length === 0 &&
    (off.full.holderState || []).length === 0 && (off.full.holderGatePicks || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  console.log('  info: D1 30d run recorded ' + (a.full.holderState || []).length + ' holder-state rows, ' +
    (a.full.holderGatePicks || []).length + ' gate picks, ' +
    (a.full.v4encounters || []).length + ' encounters, ' + (a.full.v4seeds || []).length + ' seed rows, ' +
    (a.full.companionPool || []).length + ' pool rows, ' + (a.full.poolCensus || []).length + ' census rows');
}

(async function () {
  try {
    await liveRuns();
    await determinism();
  } catch (e) {
    failed++;
    console.log('FAIL live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('test-poolfirstfail-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed === 0 ? 0 : 1);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
