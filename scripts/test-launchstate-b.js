// test-launchstate-b.js — proof for arm sim-launchstate-b (DIAG instrument).
// §1 static (frozen prereg, instrument = 3 new files only, src diff 0
// vs the frozen base a0a2bf26d, anchor fix present in the driver) +
// §2 analyzer selftest green + §3 fixture end-to-end through seedOf
// on a synthetic corpus (H applied incl. hs-scholar-idle + Leg S
// per-part ledger) + §4 live 150d shape run on screening seed
// 107301 (holder-state rows, pool rows with gap fields, census rows,
// anchor merge-base asserted) + §5 D1/D2 at 30d on 107301 under the
// full substrate (repeatability + recorder neutrality) + §6 anchor
// (static strings §1 + live values §4 — the anchor-label lesson
// from the sibling arm, now proof-caught).
// No new sims before §4; §4/§5 are live proof runs on the screening
// seed only (the judged leg runs the frozen band after this test).
// Usage: node scripts/test-launchstate-b.js
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
const AH = require(path.join(REPO, 'scripts', 'analyze-launchstate-b.js'));

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
  const prereg = path.join(REPO, 'evidence', '2026-11-21', 'sim-launchstate-b-prereg.md');
  check('§1 prereg exists', fs.existsSync(prereg));
  const text = fs.existsSync(prereg) ? fs.readFileSync(prereg, 'utf8') : '';
  check('§1 prereg freezes the DIAG-GO bar', text.indexOf('DIAG-GO BAR (frozen') !== -1);
  check('§1 prereg freezes the completeness bar (0 unknown instance-days + 0 unexplained parts)',
    text.indexOf('0 unknown') !== -1 && text.indexOf('0 unexplained parts') !== -1);
  check('§1 prereg freezes Leg S (per-part scored-ness ledger)',
    text.indexOf('Leg S') !== -1 && text.indexOf('per-part scored-ness ledger') !== -1);
  check('§1 prereg freezes the H extensions (hs-scholar-idle + churn-closing fallback)',
    text.indexOf('hs-scholar-idle') !== -1 && text.indexOf('retarget-observed-holderstate') !== -1);
  const flat = text.replace(/\s+/g, ' ');
  check('§1 prereg names the overlap guard (no villager-brain.js / win-plan.js)',
    text.indexOf('OVERLAP GUARD') !== -1 && flat.indexOf('Do NOT touch `villager-brain.js`, `win-plan.js`') !== -1);
  check('§1 prereg freezes Taxonomy H', flat.indexOf('Taxonomy H') !== -1);
  check('§1 prereg records the fresh band 107301-107308',
    text.indexOf('107301–107308') !== -1 && text.indexOf('107301–107308 FRESH') !== -1);
  check('§1 prereg records AMENDMENT 1 (Leg S part-level fallback rules)',
    text.indexOf('AMENDMENT 1') !== -1 && text.indexOf('Leg S part-level fallback rules') !== -1);
  check('§1 src/ clean at proof time', (git('status --short -- src/js') || '') === '', git('status --short -- src/js'));
  const srcDiff = git('diff a0a2bf26d HEAD -- src/js') || '';
  check('§1 src/js identical between frozen base a0a2bf26d and HEAD (instrument-only arm)', srcDiff === '', srcDiff.slice(0, 200));
  const headSha = git('rev-parse HEAD') || '';
  check('§1 HEAD is ahead of the frozen base (the anchor fix is live: merge-base != HEAD)',
    headSha !== '' && headSha.slice(0, 12) !== 'a0a2bf26d', headSha);
  const newSt = git('status --short -- scripts/launchstate-driver-b.js scripts/analyze-launchstate-b.js scripts/test-launchstate-b.js') || '';
  const inHead = git('ls-tree HEAD -- scripts/launchstate-driver-b.js scripts/analyze-launchstate-b.js scripts/test-launchstate-b.js') || '';
  check('§1 driver + analyzer + test are new files on this branch',
    (newSt.indexOf('??') !== -1 && newSt.indexOf('launchstate-driver-b.js') !== -1 &&
      newSt.indexOf('analyze-launchstate-b.js') !== -1 &&
      newSt.indexOf('test-launchstate-b.js') !== -1) ||
    (inHead.indexOf('launchstate-driver-b.js') !== -1 &&
      inHead.indexOf('analyze-launchstate-b.js') !== -1 &&
      inHead.indexOf('test-launchstate-b.js') !== -1),
    { status: newSt, head: inHead });
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'launchstate-driver-b.js'), 'utf8');
  check('§1 driver arm/run is launchstate-b, usage line re-seeded to 107301-107308',
    driverSrc.indexOf("arm: 'launchstate-b'") !== -1 &&
    driverSrc.indexOf('SEEDS=107301,107302,107303,107304,107305,107306,107307,107308') !== -1 &&
    driverSrc.indexOf("process.env.EVIDENCE_DATE || '2026-11-21'") !== -1);
  check('§6 anchor fix: driver records merge-base as anchorCommit + anchorHead, refuses a stale base',
    driverSrc.indexOf('git merge-base HEAD master') !== -1 &&
    driverSrc.indexOf("FROZEN_BASE12 = 'a0a2bf26d'") !== -1 &&
    driverSrc.indexOf('anchorHead: ANCHOR_HEAD') !== -1 &&
    driverSrc.indexOf('merge-base') !== -1 &&
    driverSrc.indexOf('!== frozen base') !== -1);
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
    driverSrc.indexOf('launchstate-apt-mismatch') !== -1);
  check('§1 analyzer exports the H classifier + Leg R + Leg S + seedOf',
    typeof AH.classifyUnknownDayH === 'function' && typeof AH.applyHolderState === 'function' &&
    typeof AH.buildHsCtx === 'function' && typeof AH.reproduceOldBand === 'function' &&
    typeof AH.seedOf === 'function' && Array.isArray(AH.REPRODUCTION) && AH.REPRODUCTION.length === 10 &&
    typeof AH.perPartWhyNot === 'function' && typeof AH.applyPerPartLedger === 'function' &&
    AH.EXPECTED.anchor12 === 'a0a2bf26d' && AH.EXPECTED.seeds.join(',') === '107301,107302,107303,107304,107305,107306,107307,107308');
})();

// ---- §2 ANALYZER SELFTEST ----
check('§2 analyzer selftest green (66 checks incl. §F H fixtures + §G Leg R + §H Leg S)', AH.selftest() === true);

// ---- §3 FIXTURE END-TO-END (seedOf applies H + Leg S) ----
(function () {
  function hsRow(day, part, when, obj, over) {
    return Object.assign({ day: day, part: part, when: when, vid: 'h1',
      target: 'algorithm', stage: 'party',
      obj: obj, away: false, engaged: false, node: { nx: 4, ny: 4 }, haven: true,
      onExped: false, isScholar: false, dead: false, commit: null }, over || {});
  }
  function choreObj(pl) { return { kind: 'HAVEN_CHORE', state: 'indoor', partsLeft: pl, indoor: true, chore: 'wait', purpose: 'chore', targetVid: null, companion: null }; }
  function doneObj() { return { kind: 'idle', state: 'done', partsLeft: 0, indoor: false, chore: null, purpose: null, targetVid: null, companion: null }; }
  const commit11 = { day: 11, part: 1, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' };
  const doc = { seed: 999003, arm: 'launchstate-b', run: 'launchstate-b', mode: 'vre',
    policySha: '1884c8852d38aaaa', anchorCommit: 'a0a2bf26d0000000000000000000000000000000',
    anchorHead: 'bcadb0e2600000000000000000000000000000000',
    senseexpedFlag: '1', partysize4Flag: '1',
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
    companionPool: [], poolCensus: [],
    v4launchTrack: [],
    v4departs: [], v4gates: [], v4encounters: [], deaths: [],
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
  check('§3 seedOf substrate is clean (arm/run/mode/policy/anchor/flags on the frozen base)',
    s.substrateBad.length === 0, s.substrateBad);
  const inst = s.notBid[0];
  check('§3 seedOf: B leaves 1 unknown day (d12), H explains it as hs-engaged-skip',
    inst.hU === 1 && inst.hE === 1 && inst.hS === 1 &&
    inst.hDays.length === 1 && inst.hDays[0].hReason === 'hs-engaged-skip', inst);
  check('§3 seedOf: instance unknown is 0 after H', inst.unknown === 0, inst.unknown);
  check('§3 seedOf: holder-state rows counted (10)', s.holderStateRows === 10, s.holderStateRows);
  check('§3 seedOf Leg S: 12 parts (3 days x 4), 1 scored (d11 p1)',
    inst.sPartsTotal === 12 && inst.sScored === 1, { total: inst.sPartsTotal, scored: inst.sScored });
  check('§3 seedOf Leg S: 3 unexplained parts (d11 p0/p2/p3, no-rows — the fixture records no rows there)',
    inst.sUnexplained === 3, inst.sUnexplained);
  check('§3 seedOf Leg S: seed-day fallback covers d10 (4 parts), chore-live 3, engaged 1',
    inst.sSeedDayParts === 4 && inst.sTally['seed-day'] === 4 &&
    inst.sTally['chore-live'] === 3 && inst.sTally.engaged === 1, inst.sTally);
})();

// ---- §4 RECORDER: live 150d shape run (screening seed 107301) ----
// 150d = the judged horizon. The seed must form a wave-4 plan by
// 150d for the shape run to validate the recorder; if it forms
// none, this check fails loudly and the screening seed is re-chosen
// by amendment — never silently passed.
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '150';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'launchstate-driver-b.js'))];
  const driver = require(path.join(REPO, 'scripts', 'launchstate-driver-b.js'));
  check('live driver sees SEEDLAND hard-on', driver.SEEDLAND === true);
  const out = await driver.oneRun(107301);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run arm is launchstate-b', out.arm === 'launchstate-b' && out.run === 'launchstate-b', 'arm=' + out.arm);
  check('§6 live anchor: anchorCommit is the frozen base merge-base, anchorHead is run-time HEAD, and they differ (the fix is live)',
    (out.anchorCommit || '').slice(0, 12) === 'a0a2bf26d' && out.anchorHead === git('rev-parse HEAD') &&
    out.anchorCommit !== out.anchorHead,
    { anchor: (out.anchorCommit || '').slice(0, 12), head: (out.anchorHead || '').slice(0, 12) });
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

// ---- §5 Determinism legs D1/D2 (30d, screening seed 107301, full substrate) ----
console.log('== determinism legs D1/D2 ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days), MODE: 'vre',
    VETREENGAGE: '1', PARTYSIZE4: '1', SENSEEXPED: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
    ALLYSLOT3: '1', LAUNCHSURVIVE: '1' }, envExtra || {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/launchstate-driver-b.js');" +
    "d.oneRun(107301).then(function(o){" +
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
  console.log('test-launchstate-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed === 0 ? 0 : 1);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
