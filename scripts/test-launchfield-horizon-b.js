// test-launchfield-horizon-b.js — proof for arm sim-launchfield-horizon-b (DIAG instrument).
// §1 static (frozen prereg, instrument = 3 new files only, src diff 0
// vs the frozen base 4e805681a050, anchor fix present in the driver) +
// §2 analyzer selftest green + §3 fixture end-to-end through seedOf
// on a synthetic corpus (H applied incl. hs-scholar-idle + Leg S
// per-part ledger) + §4 live 150d shape run on screening seed
// 107439 (holder-state rows, pool rows with gap fields, census rows,
// anchor pinned to the frozen base literal) + §5 D1/D2 at 30d on 107439 under the
// full substrate (repeatability + recorder neutrality) + §6 anchor
// (static strings §1 + live values §4 — the anchor-label lesson
// from the sibling arm, now proof-caught).
// No new sims before §4; §4/§5 are live proof runs on the screening
// seed only (the judged leg runs the frozen band after this test).
// Usage: node scripts/test-launchfield-horizon-b.js
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
const AH = require(path.join(REPO, 'scripts', 'analyze-launchfield-horizon-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function git(args) {
  try { return execSync('git ' + args, { cwd: REPO }).toString().trim(); } catch (e) { return null; }
}
const FROZEN_BASE = '4e805681a050f22672d479cf5e02b0d5700eb2c7';
const FROZEN_BASE12 = '4e805681a050';

// ---- §1 STATIC ----
(function () {
  const prereg = path.join(REPO, 'evidence', '2026-11-23', 'sim-launchfield-horizon-b-prereg.md');
  check('§1 prereg exists', fs.existsSync(prereg));
  const text = fs.existsSync(prereg) ? fs.readFileSync(prereg, 'utf8') : '';
  check('§1 prereg freezes the DIAG-GO bar', text.indexOf('DIAG-GO BAR (frozen') !== -1);
  check('§1 prereg freezes the completeness bar (0 unknown instance-days + 0 unexplained parts)',
    text.indexOf('0 unknown') !== -1 && text.indexOf('0 unexplained parts') !== -1);
  check('§1 prereg freezes Leg S (per-part scored-ness ledger)',
    text.indexOf('Leg S') !== -1 && text.indexOf('per-part scored-ness ledger') !== -1);
  check('§1 prereg freezes the H extensions (hs-scholar-idle + churn-closing fallback)',
    text.indexOf('hs-scholar-idle') !== -1 && text.indexOf('retarget-observed-holderstate') !== -1);
  check('§1 prereg freezes the field-encounter fallback (per-part, v4encounters day-match + Haven-rows-absent)',
    text.indexOf('field-encounter') !== -1 && text.indexOf('Haven-rows-absent') !== -1);
  const flat = text.replace(/\s+/g, ' ');
  check('§1 prereg names the overlap guard (no villager-brain.js / win-plan.js)',
    text.indexOf('overlap guard') !== -1 && flat.indexOf('Do NOT touch `villager-brain.js`, `win-plan.js`,') !== -1);
  check('§1 prereg freezes Taxonomy H', flat.indexOf('Taxonomy H') !== -1);
  // (Adoption fix 0030Z: the re-judge screen checks this test copied do NOT
  // apply here — the frozen prereg designs pilot 107439–107446 + confirm
  // 107447–107454 with no screen and no screen budget. The checks below
  // assert the frozen design verbatim instead. The old checks asserted a
  // backwards range '107439–107430' the prereg never contained.)
  check('§1 prereg records the pilot band 107439–107446 (8 fresh seeds, no screen)',
    text.indexOf('Pilot: 8 seeds 107439–107446') !== -1);
  check('§1 prereg freezes the confirm band 107447–107454, only if the pilot GOes',
    text.indexOf('Confirm: 8 fresh seeds 107447–107454') !== -1 && text.indexOf('ONLY if the pilot GOes') !== -1);
  check('§1 prereg records AMENDMENT 1 (Leg S part-level fallback rules)',
    text.indexOf('AMENDMENT 1') !== -1 && text.indexOf('Leg S part-level fallback rules') !== -1);
  check('§1 prereg records the anchor pin (FROZEN BASE literal, not run-time merge-base)',
    text.indexOf('ANCHOR PIN') !== -1 && text.indexOf('4e805681a050') !== -1);
  check('§1 src/ clean at proof time', (git('status --short -- src/js') || '') === '', git('status --short -- src/js'));
  // ANCHOR PIN (sim-launchfield-horizon-b prereg, §6 fix): the arm's frozen
  // base is the literal 4e805681a050, and the branch is anchored at it
  // (merge-base HEAD master == frozen base). The instrument-only arm
  // changes no src/js relative to that base.
  const mergeBase = git('merge-base HEAD master') || '';
  check('§1 branch is anchored at the frozen base (merge-base == 4e805681a050)',
    mergeBase.slice(0, 12) === FROZEN_BASE12, mergeBase);
  const srcDiff = git('diff ' + FROZEN_BASE + ' HEAD -- src/js') || '';
  check('§1 src/js identical between the frozen base and HEAD (instrument-only arm)', srcDiff === '', srcDiff.slice(0, 200));
  const newSt = git('status --short -- scripts/launchfield-horizon-driver-b.js scripts/analyze-launchfield-horizon-b.js scripts/test-launchfield-horizon-b.js') || '';
  const inHead = git('ls-tree HEAD -- scripts/launchfield-horizon-driver-b.js scripts/analyze-launchfield-horizon-b.js scripts/test-launchfield-horizon-b.js') || '';
  check('§1 driver + analyzer + test are new files on this branch',
    (newSt.indexOf('??') !== -1 && newSt.indexOf('launchfield-horizon-driver-b.js') !== -1 &&
      newSt.indexOf('analyze-launchfield-horizon-b.js') !== -1 &&
      newSt.indexOf('test-launchfield-horizon-b.js') !== -1) ||
    (inHead.indexOf('launchfield-horizon-driver-b.js') !== -1 &&
      inHead.indexOf('analyze-launchfield-horizon-b.js') !== -1 &&
      inHead.indexOf('test-launchfield-horizon-b.js') !== -1),
    { status: newSt, head: inHead });
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'launchfield-horizon-driver-b.js'), 'utf8');
  check('§1 driver arm/run is launchfield-horizon-b, usage line re-seeded to 107439-107446',
    driverSrc.indexOf("arm: 'launchfield-horizon-b'") !== -1 &&
    driverSrc.indexOf('SEEDS=107439,107440,107441,107442,107443,107444,107445,107446') !== -1 &&
    driverSrc.indexOf("process.env.EVIDENCE_DATE || '2026-11-23'") !== -1);
  check('§6 anchor pin: driver records the FROZEN BASE literal as anchorCommit, never a run-time merge-base',
    driverSrc.indexOf("FROZEN_BASE = '4e805681a050f22672d479cf5e02b0d5700eb2c7'") !== -1 &&
    driverSrc.indexOf('const ANCHOR = FROZEN_BASE;') !== -1 &&
    driverSrc.indexOf('ANCHOR = execSync') === -1 &&
    driverSrc.indexOf("FROZEN_BASE12 = '4e805681a050'") !== -1 &&
    driverSrc.indexOf('anchorCommit: ANCHOR') !== -1 &&
    driverSrc.indexOf('MERGE_BASE !== FROZEN_BASE') !== -1);
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
    driverSrc.indexOf('launchfield-apt-mismatch') !== -1);
  check('§1 analyzer exports the H classifier + Leg R + Leg S + seedOf + field-encounter fallback',
    typeof AH.classifyUnknownDayH === 'function' && typeof AH.applyHolderState === 'function' &&
    typeof AH.buildHsCtx === 'function' && typeof AH.reproduceOldBand === 'function' &&
    typeof AH.seedOf === 'function' && Array.isArray(AH.REPRODUCTION) && AH.REPRODUCTION.length === 10 &&
    typeof AH.perPartWhyNot === 'function' && typeof AH.applyPerPartLedger === 'function' &&
    AH.EXPECTED.anchor12 === '4e805681a050' && AH.EXPECTED.seeds.join(',') === '107439,107440,107441,107442,107443,107444,107445,107446' &&
    AH.EXPECTED.allyslot3InSrc === true);
})();

// ---- §2 ANALYZER SELFTEST ----
check('§2 analyzer selftest green (71 checks incl. §F H fixtures + §G Leg R + §H Leg S + §H4 field-encounter)', AH.selftest() === true);

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
  const doc = { seed: 999003, arm: 'launchfield-horizon-b', run: 'launchfield-horizon-b', mode: 'vre',
    policySha: '1884c8852d38aaaa', anchorCommit: '4e805681a050000000000000000000000000000',
    anchorHead: 'bcadb0e2600000000000000000000000000000000',
    senseexpedFlag: '1', partysize4Flag: '1',
    vetreengageFlag: '1', fleerepair2Flag: '1', fightally2Flag: '1',
    allyslot3Flag: '1', launchsurviveFlag: '1', allyslot3InSrc: true,
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

// ---- §3b OLD-BAND REGRESSION (the launchstate gap, closed) ----
// The new analyzer re-reads the EXISTING launchstate corpora
// (107301-107308) and must close exactly the 2 parts that failed
// bar (a) there — seed 107305, day 150, part 3, both holders — as
// field-encounter with the suburb/vFlee trace. Substrate flags on
// the old band are EXPECTED to fail (arm launchstate-b, anchor
// a0a2bf26dbfa); only the Leg S ledger is asserted here.
(function () {
  const oldBand = AH.bandOf('evidence/2026-11-21/perseed-launchstate-b-107301-107308');
  check('§3b old band: 324 parts, 0 unexplained after the field-encounter fallback (was 2)',
    oldBand.sPartsTotal === 324 && oldBand.sUnexplained === 0, { total: oldBand.sPartsTotal, unexplained: oldBand.sUnexplained });
  check('§3b old band: exactly 2 field-encounter parts',
    (oldBand.sWhyNot || {})['field-encounter'] === 2, oldBand.sWhyNot);
  const hits = [];
  for (const s of oldBand.perSeed) for (const inst of s.notBid.concat(s.churn))
    for (const sp of (inst.sParts || [])) if (sp.whyNot === 'field-encounter')
      hits.push({ seed: s.seed, vid: inst.vid, target: inst.target, day: sp.day, part: sp.part, enc: sp.enc });
  check('§3b old band: the 2 parts are 107305 devon_okafor/reunion + benoit_lambert/eulogy, d150 p3, suburb/vFlee',
    hits.length === 2 &&
    hits.some(function (h) { return h.seed === 107305 && h.vid === 'devon_okafor' && h.target === 'reunion' && h.day === 150 && h.part === 3 && h.enc && h.enc.mid === 'suburb' && h.enc.outcome === 'vFlee'; }) &&
    hits.some(function (h) { return h.seed === 107305 && h.vid === 'benoit_lambert' && h.target === 'eulogy' && h.day === 150 && h.part === 3 && h.enc && h.enc.mid === 'suburb' && h.enc.outcome === 'vFlee'; }), hits);
})();

// ---- §4 RECORDER: live 150d shape run (screening seed 107439) ----
// 150d = the judged horizon. The seed must form a wave-4 plan by
// 150d for the shape run to validate the recorder; if it forms
// none, this check fails loudly and the screening seed is re-chosen
// by amendment — never silently passed.
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '150';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'launchfield-horizon-driver-b.js'))];
  const driver = require(path.join(REPO, 'scripts', 'launchfield-horizon-driver-b.js'));
  check('live driver sees SEEDLAND hard-on', driver.SEEDLAND === true);
  check('live driver exports the frozen base literal (anchor pin)',
    driver.FROZEN_BASE === '4e805681a050f22672d479cf5e02b0d5700eb2c7' && driver.FROZEN_BASE12 === '4e805681a050');
  const out = await driver.oneRun(107439);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run arm is launchfield-horizon-b', out.arm === 'launchfield-horizon-b' && out.run === 'launchfield-horizon-b', 'arm=' + out.arm);
  // §6 ANCHOR PIN (sim-launchfield-horizon-b prereg): anchorCommit IS the
  // frozen base literal — a constant, not a run-time computation.
  // The launchstate §6 compared the recorded anchor against the
  // same merge-base call that produced it (a tautology: the anchor
  // silently followed the landing rebase and the proof could not
  // catch the move). Here the expectation is the literal itself.
  check('§6 live anchor: anchorCommit IS the frozen base literal 4e805681a050, anchorHead is run-time HEAD',
    out.anchorCommit === '4e805681a050f22672d479cf5e02b0d5700eb2c7' && out.anchorHead === git('rev-parse HEAD'),
    { anchor: (out.anchorCommit || '').slice(0, 12), head: (out.anchorHead || '').slice(0, 12) });
  check('live run carries v4 + dawnbid + pool + census + skip + holder-state arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) &&
    Array.isArray(out.v4encounters) && Array.isArray(out.dawnbidScores) &&
    Array.isArray(out.companionPool) && Array.isArray(out.poolCensus) &&
    Array.isArray(out.launchdefSkips) &&
    Array.isArray(out.holderState) && Array.isArray(out.holderGatePicks));
  // ALLYSLOT3 IS landed on this base (doorflee2 port): the live run
  // honestly reports allyslot3InSrc true; the substrate is the
  // frozen one, not the instrument, that changed.
  check('live run self-describes the substrate (all seven flags 1, allyslot3InSrc true, launchTrackOn true)',
    out.senseexpedFlag === '1' && out.partysize4Flag === '1' && out.vetreengageFlag === '1' &&
    out.fleerepair2Flag === '1' && out.fightally2Flag === '1' && out.allyslot3Flag === '1' &&
    out.launchsurviveFlag === '1' && out.allyslot3InSrc === true && out.launchTrackOn === true);
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
    if (r.day == null || r.part == null || r.part < 0 || r.part > 3 || !r.vid || !('target' in r) || // AMENDMENT 2: target may be null — a holder between targets
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

// ---- §6b ANCHOR TRIPWIRE (live): the driver refuses to run when
// the run-time merge-base is NOT the frozen base. Proven without
// touching git state and without extracting a whole tree: run the
// real CLI in the real worktree with a one-line `git` shim on PATH
// that answers `merge-base HEAD master` with 4266e6ccef2a (the
// doorflee2 merge — a real base that differs from the frozen base,
// proven by the read-only check beside it) and passes every other
// git call through to /usr/bin/git. The driver must STOP exit 2
// with the merge-base message before any sim. The shim lives at a
// FIXED path (/tmp/launchfield-gitshim/git) and persists across
// runs by design: the write flap refuses fresh-file creates far
// more often than overwrites of an existing file, so the test
// (re)writes the same path instead of a fresh pid path each run,
// verifies its content, and never deletes it. A setup failure
// fails loudly, never silently passes. (First version extracted
// the whole 4266e6cce tree with git archive | tar — it failed only
// because the write flap refused every tar file create; the
// tripwire logic was never reached. A pid-pathed shim then failed
// the same way: every attempt rm -rf'd the shim first, so every
// write was a fresh create.)
function tripwire() {
  const shimDir = '/tmp/launchfield-gitshim';
  const shim = path.join(shimDir, 'git');
  let setupOk = false, setupErr = '';
  for (let i = 0; i < 24 && !setupOk; i++) {
    try {
      execSync('mkdir -p ' + shimDir, { cwd: REPO });
      fs.writeFileSync(shim, '#!/bin/sh\nif [ "$1" = "merge-base" ]; then echo 4266e6ccef2ace1ded2658515b58e9db8c760c8b; exit 0; fi\nexec /usr/bin/git "$@"\n');
      execSync('chmod +x ' + shim, { cwd: REPO });
      setupOk = fs.existsSync(shim) && (fs.readFileSync(shim, 'utf8').indexOf('4266e6ccef2a') !== -1);
    } catch (e) { setupErr = String((e && e.message) || e).slice(0, 120); }
    if (!setupOk && i < 23) { try { execSync('sleep 5', { cwd: REPO }); } catch (e) {} }
  }
  check('§6b tripwire setup: git shim installed (flap-retried)',
    setupOk, setupErr);
  if (!setupOk) return;
  const env = Object.assign({}, process.env, { DAYS: '150', MODE: 'vre',
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', ALLYSLOT3: '1', LAUNCHSURVIVE: '1',
    SEEDS: '107439', RUN: 'launchfield-horizon-b', EVIDENCE_DATE: '2026-11-23',
    PATH: shimDir + ':' + (process.env.PATH || '') });
  let trip = null;
  try {
    execFileSync('node', ['scripts/launchfield-horizon-driver-b.js'], { cwd: REPO, env: env, encoding: 'utf8' });
    trip = { code: 0, out: '' };
  } catch (e) {
    trip = { code: e.status, out: String((e.stderr || e.stdout || '')).slice(0, 300) };
  }
  check('§6b anchor tripwire: driver refuses (exit 2, merge-base message) when the base is not frozen',
    trip && trip.code === 2 && trip.out.indexOf('merge-base') !== -1 && trip.out.indexOf('frozen base') !== -1, trip);
  const realBase = git('merge-base 4266e6cce master') || '';
  check('§6b anchor tripwire: a real base at 4266e6cce differs from the frozen base (same comparison trips on a genuine rebase)',
    realBase !== '' && realBase.slice(0, 12) !== FROZEN_BASE12, realBase);
  // The shim is NOT deleted: it persists at the fixed path for the
  // next run (see the header comment above).
}

// ---- §5 Determinism legs D1/D2 (30d, screening seed 107439, full substrate) ----
console.log('== determinism legs D1/D2 ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days), MODE: 'vre',
    VETREENGAGE: '1', PARTYSIZE4: '1', SENSEEXPED: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
    ALLYSLOT3: '1', LAUNCHSURVIVE: '1' }, envExtra || {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/launchfield-horizon-driver-b.js');" +
    "d.oneRun(107439).then(function(o){" +
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
    tripwire();
    await determinism();
  } catch (e) {
    failed++;
    console.log('FAIL live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('test-launchfield-horizon-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed === 0 ? 0 : 1);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
