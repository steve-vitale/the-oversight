// test-closekind-a.js — proof for arm sim-closekind-a (RECORDER FIX, finding #2508).
// classifySeed's churn block detected a holder death only from census
// holderAlive=false and daily-roster dead:true — but dead villagers DROP
// OUT of the daily roster, and census rows stop when the plan is deleted
// on death. Both fallbacks miss most deaths, so the instance closed
// plan-deleted instead of holder-died (or never closed at all). The fix
// consults the deaths array (kind villager) FIRST in every copy of the
// shared churn block (analyze-dawnbid-a / -gateconfirm-a / -launchdef-a /
// -haventick-b / -nightcarry-a / -profilegate-a); census and roster remain
// as fallbacks. Proves, on synthetic fixtures + the frozen corpora (no sims):
//   - deaths-only, deaths-vs-later-census precedence, death-before-seedDay
//     ignored, horizon-artifact stays plan-deleted, no-deaths-array
//     fallback still works, monster-kind deaths ignored, retargeted
//     untouched, launched bucket kept with the closeKind flip;
//   - the same fixture classifies identically across all five
//     classifySeed copies (+ a haventick leg on its own fixture shape);
//   - re-analysis of the frozen corpora (profilegate-b ON/OFF,
//     notick-a ON) shows EXACTLY the corrected flip set below and
//     nothing else;
//   - the notick tracer's fate tallies are identical on both legs
//     (0 fate changes), with exactly the 11 predicted trace-row
//     closeKind flips.
//
// CORRECTION 2 (recorded here and in evidence/2026-11-17/sim-closekind-a.md;
// the frozen prereg's clause-2 prediction was short, see metric review):
// the prereg enumerated 28 flips, 0 bucket changes, 2 sub changes. The
// complete effect, established by diffing the fixed classifier against the
// committed before-oracles, is 29 flips: the 28 enumerated PLUS
// oliver_moore (103414, eater, seeded and died d60, zero census/score
// rows — the old code left the instance NEVER CLOSED, closeKind null,
// bucket candidate-not-bid; the fix closes it holder-died@60, bucket
// plan-churned-before-dawn). The prereg probe filtered on
// closeKind==='plan-deleted' and so missed null-close instances. One
// bucket moves (oliver_moore, candidate-not-bid -> plan-churned-
// before-dawn). Sub moves: 2 churn subs (app_mgpspk2n36, visjoin_115)
// + oliver_moore's sub (not-scored -> holder-died) + 3 launched
// funnelSub window ends, which track closeDay (gen_4hoo6rr 148->147,
// sofia_chen eulogy 48->47, tariq_mahmood 146->145).
// Usage: node scripts/test-closekind-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const DAWNBID = require(path.join(REPO, 'scripts', 'analyze-dawnbid-a.js'));
const GATECONFIRM = require(path.join(REPO, 'scripts', 'analyze-gateconfirm-a.js'));
const LAUNCHDEF = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));
const NIGHTCARRY = require(path.join(REPO, 'scripts', 'analyze-nightcarry-a.js'));
const PROFILEGATE_A = require(path.join(REPO, 'scripts', 'analyze-profilegate-a.js'));
const HAVENTICK = require(path.join(REPO, 'scripts', 'analyze-haventick-b.js'));
const PG = require(path.join(REPO, 'scripts', 'analyze-profilegate-b.js'));
const NOTICK = require(path.join(REPO, 'scripts', 'analyze-notick-a.js'));

const CLASSIFIERS = [
  ['dawnbid', DAWNBID.classifySeed],
  ['gateconfirm', GATECONFIRM.classifySeed],
  ['launchdef', LAUNCHDEF.classifySeed],
  ['nightcarry', NIGHTCARRY.classifySeed],
  ['profilegate-a', PROFILEGATE_A.classifySeed],
];
// Launched-sub format differs by family: dawn-only classifiers report
// 'companion:<name>'; the any-commit family appends the commit kind.
const LAUNCH_SUB = { dawnbid: 'companion:v2', 'profilegate-a': 'companion:v2',
  gateconfirm: 'companion:v2:dawn', launchdef: 'companion:v2:dawn', nightcarry: 'companion:v2:dawn' };

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function loadDir(dir) {
  const bySeed = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = j;
  }
  return { bySeed: bySeed, files: files };
}

// ---------- 1. Static ----------
console.log('== static ==');
const PATCHED = ['analyze-dawnbid-a.js', 'analyze-gateconfirm-a.js', 'analyze-launchdef-a.js',
  'analyze-haventick-b.js', 'analyze-nightcarry-a.js', 'analyze-profilegate-a.js'];
for (const f of PATCHED) {
  const src = fs.readFileSync(path.join(REPO, 'scripts', f), 'utf8');
  check(f + ' carries the deaths-first read (finding #2508)',
    src.indexOf('sim-closekind-a, finding #2508') !== -1 &&
    src.indexOf("e.kind === 'villager'") !== -1 &&
    src.indexOf('j.deaths') !== -1,
    'marker/deaths loop missing');
  try {
    execSync('node --check ' + path.join(REPO, 'scripts', f), { timeout: 30000 });
    check(f + ' parses (node --check)', true);
  } catch (e) { check(f + ' parses (node --check)', false, String(e && e.message)); }
}
check('no per-arm classifySeed fork (no analyze-closekind file)',
  !fs.existsSync(path.join(REPO, 'scripts', 'analyze-closekind-a.js')));
check('notick tracer unchanged (already deaths-first)',
  fs.readFileSync(path.join(REPO, 'scripts', 'analyze-notick-a.js'), 'utf8').indexOf('authoritative source') !== -1);
try {
  execSync('git diff --quiet -- src', { cwd: REPO, timeout: 60000 });
  check('no src/ change (scripts-only arm)', true);
} catch (e) { check('no src/ change (scripts-only arm)', false, 'src/ dirty'); }
check('prereg frozen (exists, names Correction 1 + the 28-flip set)',
  (function () {
    const p = path.join(REPO, 'evidence', '2026-11-17', 'sim-closekind-a-prereg.md');
    if (!fs.existsSync(p)) return false;
    const t = fs.readFileSync(p, 'utf8');
    return t.indexOf('Correction 1') !== -1 && t.indexOf('Expected flips (28') !== -1;
  })());

// ---------- 2. Synthetic fixtures ----------
console.log('== synthetic fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 100861, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
    dawnbidCensus: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
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
function departRow(day, vid, result, action, vidExped, compExped, vidBlock, compBlock) {
  return { day: day, vid: vid, source: 'brain', result: result, winPlanAction: action,
    companion: 'v2', vidExped: vidExped, companionExped: compExped,
    vidBlock: vidBlock || null, companionBlock: compBlock || null,
    stage: 'party', target: 'strike', party: ['v2'] };
}
function censusRow(day, vid, target, stage, alive) {
  return { day: day, vid: vid, target: target, needWave: 4, stage: stage, party: [],
    holderAlive: alive, holderNode: { nx: 0, ny: 0 }, holderExped: false,
    holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true } };
}
function deathRow(day, vid, cause) {
  return { day: day, kind: 'villager', who: vid, cause: cause || 'monster', player: false };
}
// Expect instance[0] to close with the given kind/day/bucket/sub, identically
// across all five classifySeed copies. Fixtures use part-0 commits only, so
// the dawn-only (dawnbid) and any-commit (launchdef family) definitions agree
// on closeKind/closeDay/bucket; the launched sub format differs by family
// (see LAUNCH_SUB) and is asserted per family.
function expectCloseAll(name, j, kind, day, bucket, sub) {
  const outs = CLASSIFIERS.map(function (pair) {
    let insts;
    try { insts = pair[1](JSON.parse(JSON.stringify(j))).instances; }
    catch (e) { return pair[0] + ':THREW:' + (e && e.message); }
    if (!insts || insts.length !== 1) return pair[0] + ':n=' + (insts ? insts.length : 'none');
    const x = insts[0];
    const wantSub = (sub === 'LAUNCH') ? LAUNCH_SUB[pair[0]] : sub;
    return pair[0] + ':' + x.closeKind + '@' + x.closeDay + '/' + x.bucket + ':' + x.sub +
      '|' + ((x.closeKind === kind && x.closeDay === day && x.bucket === bucket && x.sub === wantSub) ? 'MATCH' : 'MISMATCH');
  });
  const ok = outs.every(function (o) { return o.slice(-5) === 'MATCH'; });
  check(name + ' -> ' + kind + '@' + day + '/' + bucket + ':' + sub + ' on all 5 classifiers', ok, outs.join(' | '));
}

// F1 deaths-only: census alive throughout, roster never dead, deaths has it.
expectCloseAll('F1 deaths-only ref (census alive, no roster row)',
  baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
    deaths: [deathRow(22, 'v1', 'monster')],
  }), 'holder-died', 22, 'plan-churned-before-dawn', 'holder-died');
// F2 deaths day beats a LATER census holderAlive=false day (deaths-first precedence).
expectCloseAll('F2 deaths d22 beats census holderAlive=false d25',
  baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(25, 'v1', 'strike', 'party', false)],
    deaths: [deathRow(22, 'v1', 'monster')],
  }), 'holder-died', 22, 'plan-churned-before-dawn', 'holder-died');
// F3 death BEFORE seedDay is not this plan's death: stays plan-deleted.
expectCloseAll('F3 death d8 before seedDay d10 stays plan-deleted',
  baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
    deaths: [deathRow(8, 'v1', 'monster')],
  }), 'plan-deleted', 12, 'plan-churned-before-dawn', 'plan-deleted');
// F4 horizon artifact (luis shape): holder alive, census ends at the run end.
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(149, 'v1', 'strike', 'party', true)],
  });
  j.gameDays = 150;
  expectCloseAll('F4 horizon artifact stays plan-deleted@150', j, 'plan-deleted', 150, 'plan-churned-before-dawn', 'plan-deleted');
})();
// F5 no deaths array at all (old corpus shape): census fallback still works.
expectCloseAll('F5 no deaths array: census holderAlive=false still finds the death',
  baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', false)],
  }), 'holder-died', 11, 'plan-churned-before-dawn', 'holder-died');
// F5b no deaths array: daily-roster backup still works.
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  j.daily = [{ day: 11, waveKillLog: [], roster: [{ vid: 'v1', dead: true }] }, { day: 150, waveKillLog: [], roster: [] }];
  expectCloseAll('F5b no deaths array: roster dead:true still finds the death', j, 'holder-died', 11, 'plan-churned-before-dawn', 'holder-died');
})();
// F6 monster-kind death entry for the vid is ignored (kind must be villager).
expectCloseAll('F6 kind=monster death entry ignored -> plan-deleted',
  baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
    deaths: [{ day: 22, kind: 'monster', who: 'v1', cause: 'villager combat', player: false }],
  }), 'plan-deleted', 12, 'plan-churned-before-dawn', 'plan-deleted');
// F7 death day == old closeDay (david_kim shape: census ends d21, death d22).
expectCloseAll('F7 death d22 == old closeDay (census ends d21)',
  baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(21, 'v1', 'strike', 'party', true)],
    deaths: [deathRow(22, 'v1', 'monster')],
  }), 'holder-died', 22, 'plan-churned-before-dawn', 'holder-died');
// F8 death day == old closeDay - 1 (gen_4hoo6rr shape: census ends d20, death d20).
expectCloseAll('F8 death d20, old closeDay 21 -> holder-died@20',
  baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(20, 'v1', 'strike', 'party', true)],
    deaths: [deathRow(20, 'v1', 'the wild')],
  }), 'holder-died', 20, 'plan-churned-before-dawn', 'holder-died');
// F9 retargeted close is untouched by the churn fix (death after the retarget).
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party'), seedRow(12, 'v1', 'audit', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(12, 'v1', 'audit', 'party', true)],
    deaths: [deathRow(13, 'v1', 'monster')],
  });
  const outs = CLASSIFIERS.map(function (pair) {
    const insts = pair[1](JSON.parse(JSON.stringify(j))).instances;
    if (!insts || insts.length !== 2) return pair[0] + ':n=' + (insts ? insts.length : 'none');
    return pair[0] + ':' + insts[0].closeKind + '@' + insts[0].closeDay + '+' + insts[1].closeKind + '@' + insts[1].closeDay;
  });
  const ok = outs.every(function (o) { return o.split(':').slice(1).join(':') === 'retargeted@12+holder-died@13'; });
  check('F9 retargeted stays retargeted@12; second instance holder-died@13 (all 5)', ok, outs.join(' | '));
})();
// F10 launched instance keeps its bucket; only closeKind flips (gen_4hoo6rr shape).
expectCloseAll('F10 launched keeps bucket, closeKind holder-died@22',
  baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    dawnbidDeparts: [departRow(11, 'v1', 'launch', 'party_launch', true, true)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'hunt', true), censusRow(21, 'v1', 'strike', 'hunt', true)],
    deaths: [deathRow(22, 'v1', 'the wild')],
  }), 'holder-died', 22, 'launched', 'LAUNCH');
// F11 never-closed instance (oliver_moore shape): seeded and died the same
// day, zero census/score rows — the old code left closeKind null forever.
expectCloseAll('F11 seeded+died same day, no census rows -> holder-died@60 (was null)',
  baseSeed({
    v4seeds: [seedRow(60, 'v1', 'eater', 4, 'party')],
    dawnbidCensus: [],
    deaths: [deathRow(60, 'v1', 'monster')],
  }), 'holder-died', 60, 'plan-churned-before-dawn', 'holder-died');

// Haventick leg (own fixture shape: v4creates + planCensus).
console.log('== haventick fixture ==');
(function () {
  function htSeed(over) {
    const j = {
      seed: 102141, days: 150, gameDays: 150, endReason: 'survived',
      standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
      instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
      dawnbidCensus: [], companionPool: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
      v4creates: [], planCensus: [], v4departs: [], v4gates: [], v4encounters: [],
      dawnbidStarts: [],
    };
    return Object.assign(j, over || {});
  }
  function htCreate(day, vid, target) {
    return { day: day, vid: vid, creator: 'havenTick', source: 'lived',
      profile: 'wanderer', stageAfter: 'gear', target: target,
      needWave: 4, foughtN: 1, slainN: 0,
      caller: 'Object.agencyTick (villager-agency.js:433:10)' };
  }
  function htCensus(day, vid, target, alive) {
    return { day: day, vid: vid, target: target, needWave: 4, stage: 'party', party: [],
      holderAlive: alive, holderNode: { nx: 0, ny: 0 }, holderExped: false,
      holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true } };
  }
  const withDeath = htSeed({
    v4creates: [htCreate(10, 'v1', 'strike')],
    planCensus: [htCensus(10, 'v1', 'strike', true), htCensus(11, 'v1', 'strike', true)],
    deaths: [deathRow(22, 'v1', 'monster')],
  });
  const r1 = HAVENTICK.classifyHavenTick(withDeath);
  const ep1 = (r1.episodes || [])[0] || {};
  check('H1 haventick deaths-only -> holder-died@22, plan-churned-before-dawn',
    r1.episodesOpened === 1 && ep1.closeKind === 'holder-died' && ep1.closeDay === 22 &&
    ep1.bucket === 'plan-churned-before-dawn' && ep1.sub === 'holder-died',
    'episodes=' + r1.episodesOpened + ' close=' + ep1.closeKind + '@' + ep1.closeDay + ' bucket=' + ep1.bucket + ':' + ep1.sub);
  const noDeath = htSeed({
    v4creates: [htCreate(10, 'v1', 'strike')],
    planCensus: [htCensus(10, 'v1', 'strike', true), htCensus(11, 'v1', 'strike', true)],
  });
  const r2 = HAVENTICK.classifyHavenTick(noDeath);
  const ep2 = (r2.episodes || [])[0] || {};
  check('H2 haventick control (no death) stays plan-deleted@12',
    r2.episodesOpened === 1 && ep2.closeKind === 'plan-deleted' && ep2.closeDay === 12,
    'close=' + ep2.closeKind + '@' + ep2.closeDay);
})();

// ---------- 3. Frozen-corpus legs ----------
// Corrected flip set (prereg Correction 1's 28 + Correction 2's oliver_moore):
// [seed, vid, target, seedDay, oldKind, oldDay, newDay].
console.log('== frozen corpora ==');
const EXPECTED_FLIPS = {
  on: [
    [103413, 'naran_tumen', 'herald', 119, 'plan-deleted', 123, 123],
    [103413, 'gen_4hoo6rr', 'reunion', 128, 'plan-deleted', 148, 147],
    [103414, 'oliver_moore', 'eater', 60, null, null, 60],
    [103414, 'giulia_bianchi', 'eater', 64, 'plan-deleted', 111, 110],
    [103414, 'visjoin_73', 'reunion', 99, 'plan-deleted', 137, 137],
    [103414, 'visjoin_85', 'eulogy', 104, 'plan-deleted', 109, 109],
    [103414, 'visjoin_134', 'eater', 137, 'plan-deleted', 139, 139],
    [103416, 'sofia_chen', 'eulogy', 41, 'plan-deleted', 48, 47],
    [103416, 'luis_fernandez', 'audit', 78, 'plan-deleted', 87, 87],
    [103416, 'app_mgpspk2n36', 'eater', 79, 'plan-deleted', 80, 80],
    [103416, 'david_kim', 'congregation', 85, 'plan-deleted', 86, 86],
    [103417, 'tariq_mahmood', 'strike', 93, 'plan-deleted', 146, 145],
    [103418, 'visjoin_58', 'influencer', 69, 'plan-deleted', 80, 80],
    [103418, 'yuki_mori', 'reunion', 69, 'plan-deleted', 83, 83],
    [103418, 'thabo_maseko', 'influencer', 70, 'plan-deleted', 81, 81],
    [103418, 'visjoin_59', 'reunion', 76, 'plan-deleted', 80, 80],
    [103418, 'visjoin_91', 'herald', 94, 'plan-deleted', 96, 95],
  ],
  off: [
    [103415, 'visjoin_98', 'herald', 128, 'plan-deleted', 137, 136],
    [103416, 'sofia_chen', 'eulogy', 41, 'plan-deleted', 61, 60],
    [103416, 'ethan_hunt', 'algorithm', 62, 'plan-deleted', 88, 88],
    [103416, 'david_kim', 'editor', 86, 'plan-deleted', 99, 98],
    [103416, 'visjoin_99', 'herald', 106, 'plan-deleted', 125, 125],
    [103416, 'visjoin_137', 'suburb', 143, 'plan-deleted', 149, 148],
    [103418, 'visjoin_115', 'reunion', 119, 'plan-deleted', 120, 120],
  ],
  notick: [
    [103441, 'app_mgpspl5e343', 'strike', 128, 'plan-deleted', 133, 132],
    [103444, 'omar_farouk', 'eater', 62, 'plan-deleted', 75, 74],
    [103444, 'visjoin_126', 'editor', 128, 'plan-deleted', 134, 134],
    [103446, 'app_mgpspka1208', 'reunion', 91, 'plan-deleted', 92, 92],
    [103446, 'tom_baker', 'reunion', 98, 'plan-deleted', 99, 99],
  ],
};
// Full expected per-field diffs vs the frozen before-oracle, as
// [seed, vid, target, seedDay, field, before, after]. Only the fields
// that move are listed; every other field on every other instance must
// be identical. (oliver_moore's bucket/sub/funnel moves are the one
// bucket change; the three launched window ends track closeDay.)
const EXPECTED_DIFFS = {
  on: [
    [103413, 'naran_tumen', 'herald', 119, 'closeKind', 'plan-deleted', 'holder-died'],
    [103413, 'gen_4hoo6rr', 'reunion', 128, 'closeKind', 'plan-deleted', 'holder-died'],
    [103413, 'gen_4hoo6rr', 'reunion', 128, 'closeDay', 148, 147],
    [103413, 'gen_4hoo6rr', 'reunion', 128, 'funnelSub', 'window:134-148', 'window:134-147'],
    [103414, 'oliver_moore', 'eater', 60, 'closeKind', null, 'holder-died'],
    [103414, 'oliver_moore', 'eater', 60, 'closeDay', null, 60],
    [103414, 'oliver_moore', 'eater', 60, 'bucket', 'candidate-not-bid', 'plan-churned-before-dawn'],
    [103414, 'oliver_moore', 'eater', 60, 'sub', 'not-scored', 'holder-died'],
    [103414, 'oliver_moore', 'eater', 60, 'funnelBucket', 'candidate-not-bid', 'plan-churned-before-dawn'],
    [103414, 'oliver_moore', 'eater', 60, 'funnelSub', 'not-scored', 'holder-died'],
    [103414, 'giulia_bianchi', 'eater', 64, 'closeKind', 'plan-deleted', 'holder-died'],
    [103414, 'giulia_bianchi', 'eater', 64, 'closeDay', 111, 110],
    [103414, 'visjoin_73', 'reunion', 99, 'closeKind', 'plan-deleted', 'holder-died'],
    [103414, 'visjoin_85', 'eulogy', 104, 'closeKind', 'plan-deleted', 'holder-died'],
    [103414, 'visjoin_134', 'eater', 137, 'closeKind', 'plan-deleted', 'holder-died'],
    [103416, 'sofia_chen', 'eulogy', 41, 'closeKind', 'plan-deleted', 'holder-died'],
    [103416, 'sofia_chen', 'eulogy', 41, 'closeDay', 48, 47],
    [103416, 'sofia_chen', 'eulogy', 41, 'funnelSub', 'window:45-48', 'window:45-47'],
    [103416, 'luis_fernandez', 'audit', 78, 'closeKind', 'plan-deleted', 'holder-died'],
    [103416, 'app_mgpspk2n36', 'eater', 79, 'closeKind', 'plan-deleted', 'holder-died'],
    [103416, 'app_mgpspk2n36', 'eater', 79, 'sub', 'plan-deleted', 'holder-died'],
    [103416, 'app_mgpspk2n36', 'eater', 79, 'funnelSub', 'plan-deleted', 'holder-died'],
    [103416, 'david_kim', 'congregation', 85, 'closeKind', 'plan-deleted', 'holder-died'],
    [103417, 'tariq_mahmood', 'strike', 93, 'closeKind', 'plan-deleted', 'holder-died'],
    [103417, 'tariq_mahmood', 'strike', 93, 'closeDay', 146, 145],
    [103417, 'tariq_mahmood', 'strike', 93, 'funnelSub', 'window:96-146', 'window:96-145'],
    [103418, 'visjoin_58', 'influencer', 69, 'closeKind', 'plan-deleted', 'holder-died'],
    [103418, 'yuki_mori', 'reunion', 69, 'closeKind', 'plan-deleted', 'holder-died'],
    [103418, 'thabo_maseko', 'influencer', 70, 'closeKind', 'plan-deleted', 'holder-died'],
    [103418, 'visjoin_59', 'reunion', 76, 'closeKind', 'plan-deleted', 'holder-died'],
    [103418, 'visjoin_91', 'herald', 94, 'closeKind', 'plan-deleted', 'holder-died'],
    [103418, 'visjoin_91', 'herald', 94, 'closeDay', 96, 95],
  ],
  off: [
    [103415, 'visjoin_98', 'herald', 128, 'closeKind', 'plan-deleted', 'holder-died'],
    [103415, 'visjoin_98', 'herald', 128, 'closeDay', 137, 136],
    [103416, 'sofia_chen', 'eulogy', 41, 'closeKind', 'plan-deleted', 'holder-died'],
    [103416, 'sofia_chen', 'eulogy', 41, 'closeDay', 61, 60],
    [103416, 'ethan_hunt', 'algorithm', 62, 'closeKind', 'plan-deleted', 'holder-died'],
    [103416, 'david_kim', 'editor', 86, 'closeKind', 'plan-deleted', 'holder-died'],
    [103416, 'david_kim', 'editor', 86, 'closeDay', 99, 98],
    [103416, 'visjoin_99', 'herald', 106, 'closeKind', 'plan-deleted', 'holder-died'],
    [103416, 'visjoin_137', 'suburb', 143, 'closeKind', 'plan-deleted', 'holder-died'],
    [103416, 'visjoin_137', 'suburb', 143, 'closeDay', 149, 148],
    [103418, 'visjoin_115', 'reunion', 119, 'closeKind', 'plan-deleted', 'holder-died'],
    [103418, 'visjoin_115', 'reunion', 119, 'sub', 'plan-deleted', 'holder-died'],
    [103418, 'visjoin_115', 'reunion', 119, 'funnelSub', 'plan-deleted', 'holder-died'],
  ],
};
const EXPECTED_STAYS = {
  on: [[103413, 'devon_okafor', 'eulogy', 151], [103413, 'app_mgpspkh6343', 'influencer', 151],
    [103413, 'omar_farouk', 'influencer', 151], [103413, 'david_kim', 'reunion', 151],
    [103417, 'sofia_chen', 'eater', 151]],
  off: [[103413, 'devon_okafor', 'eulogy', 151]],
  notick: [[103441, 'farid_ahmed', 'strike', 151], [103441, 'luis_fernandez', 'editor', 151]],
};
function keyOf(seed, vid, target, seedDay) { return seed + '|' + vid + '|' + target + '|d' + seedDay; }

// L1: profilegate-b ON/OFF — full diff of the fixed classifier vs the
// committed frozen analysis (closeKind, closeDay, bucket, sub,
// funnelBucket, funnelSub), matched on seed+vid+target+seedDay (a vid
// can hold the same target twice, e.g. visjoin_98 OFF).
const frozenPG = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'profilegate-b-analysis.json'), 'utf8'));
function diffLeg(legName, dir, frozenLeg) {
  const raw = loadDir(dir);
  const before = {};
  for (const ps of frozenLeg.perSeed) {
    for (const inst of ps.instances) before[keyOf(ps.seed, inst.vid, inst.target, inst.seedDay)] = inst;
  }
  const got = [];
  let fixedCount = 0, beforeCount = 0;
  for (const ps of frozenLeg.perSeed) beforeCount += ps.instances.length;
  for (const seed of Object.keys(raw.bySeed).sort()) {
    const j = raw.bySeed[seed];
    const c = PG.funnelForSeed(j);
    for (const inst of (c.instances || [])) {
      fixedCount++;
      const b = before[keyOf(j.seed, inst.vid, inst.target, inst.seedDay)];
      if (!b) { got.push([j.seed, inst.vid, inst.target, inst.seedDay, 'NO-BEFORE-ORACLE', null, null]); continue; }
      for (const f of ['closeKind', 'closeDay', 'bucket', 'sub', 'funnelBucket', 'funnelSub']) {
        if (JSON.stringify(inst[f]) !== JSON.stringify(b[f])) {
          got.push([j.seed, inst.vid, inst.target, inst.seedDay, f, b[f], inst[f]]);
        }
      }
    }
  }
  const want = EXPECTED_DIFFS[legName].map(function (e) { return JSON.stringify(e); }).sort();
  const gotS = got.map(function (e) { return JSON.stringify(e); }).sort();
  check('L1-' + legName + ': diff vs frozen is EXACTLY the ' + EXPECTED_DIFFS[legName].length +
    ' expected field moves (' + fixedCount + ' instances vs ' + beforeCount + ' before, same count)',
    fixedCount === beforeCount && JSON.stringify(gotS) === JSON.stringify(want),
    'got=' + JSON.stringify(got));
}
diffLeg('on', path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on'), frozenPG.on);
diffLeg('off', path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-off'), frozenPG.off);

// L2: summarize-level — exact bucket/sub deltas (the oliver_moore bucket
// move + the window-end funnelSub moves + the 2 churn-sub moves).
(function () {
  function summarizeLeg(dir) {
    const raw = loadDir(dir);
    const leg = loadDir(dir);
    for (const k of Object.keys(leg.bySeed)) leg.bySeed[k] = PG.funnelForSeed(leg.bySeed[k]);
    const s = PG.summarize(leg);
    // Same wall enrichment the sibling tests use (test-notick-a, test-selblock-a).
    let deaths = 0, starv = 0;
    for (const k of Object.keys(raw.bySeed)) {
      const j = raw.bySeed[k];
      deaths += (j.deaths || []).length;
      starv += (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length;
    }
    s.wall.deaths = deaths; s.wall.starvation = starv;
    return s;
  }
  // Order-insensitive map equality (JSON.stringify is key-order sensitive;
  // the fixed summarize inserts the new window keys in instance order).
  function sameMap(a, b) {
    const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
    if (JSON.stringify(ka) !== JSON.stringify(kb)) return false;
    for (const k of ka) if (a[k] !== b[k]) return false;
    return true;
  }
  function withDeltas(frozenMap, deltas) {
    const s = JSON.parse(JSON.stringify(frozenMap));
    for (const k of Object.keys(deltas)) {
      s[k] = (s[k] || 0) + deltas[k];
      if (s[k] === 0) delete s[k];
    }
    return s;
  }
  const on = summarizeLeg(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on'));
  const off = summarizeLeg(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-off'));
  check('L2-ON buckets = frozen + oliver_moore move only',
    sameMap(on.byFunnel, withDeltas(frozenPG.on.byFunnel,
      { 'plan-churned-before-dawn': 1, 'candidate-not-bid': -1 })),
    JSON.stringify(on.byFunnel));
  check('L2-OFF buckets identical to frozen',
    sameMap(off.byFunnel, frozenPG.off.byFunnel), JSON.stringify(off.byFunnel));
  check('L2-ON subs = frozen + the 9 expected key moves',
    sameMap(on.byFunnelSub, withDeltas(frozenPG.on.byFunnelSub, {
      'launched-no-meeting:window:134-148': -1, 'launched-no-meeting:window:134-147': 1,
      'launched-no-meeting:window:45-48': -1, 'launched-no-meeting:window:45-47': 1,
      'launched-no-meeting:window:96-146': -1, 'launched-no-meeting:window:96-145': 1,
      'plan-churned-before-dawn:plan-deleted': -1, 'plan-churned-before-dawn:holder-died': 2,
      'candidate-not-bid:not-scored': -1,
    })), JSON.stringify(on.byFunnelSub));
  check('L2-OFF subs = frozen + the 2 expected key moves',
    sameMap(off.byFunnelSub, withDeltas(frozenPG.off.byFunnelSub, {
      'plan-churned-before-dawn:plan-deleted': -1, 'plan-churned-before-dawn:holder-died': 1,
    })), JSON.stringify(off.byFunnelSub));
  check('L2 pool/wall/median identical (ON + OFF)',
    JSON.stringify(on.poolShape) === JSON.stringify(frozenPG.on.poolShape) &&
    JSON.stringify(off.poolShape) === JSON.stringify(frozenPG.off.poolShape) &&
    JSON.stringify(on.wall) === JSON.stringify(frozenPG.on.wall) &&
    JSON.stringify(off.wall) === JSON.stringify(frozenPG.off.wall) &&
    on.medianSurvival === frozenPG.on.medianSurvival &&
    off.medianSurvival === frozenPG.off.medianSurvival,
    'onWall=' + JSON.stringify(on.wall) + ' offWall=' + JSON.stringify(off.wall));
})();

// L3: notick-a ON corpus — prereg literals (no full before-oracle exists
// for this corpus; the 7 plan-deleted instances are enumerated in the
// prereg, and the old-vs-new comparison was verified by hand in the
// evidence: exactly the 5 flips, 0 other field diffs).
(function () {
  const raw = loadDir(path.join(REPO, 'evidence', '2026-11-17', 'perseed-notick-a-on'));
  const got = {};
  let holderDiedOK = true;
  for (const seed of Object.keys(raw.bySeed).sort()) {
    const j = raw.bySeed[seed];
    const c = LAUNCHDEF.classifySeed(j);
    for (const inst of (c.instances || [])) {
      if (inst.closeKind === 'plan-deleted') got[keyOf(j.seed, inst.vid, inst.target, inst.seedDay)] = inst.closeDay;
      if (inst.closeKind === 'holder-died') {
        // No spurious holder-died: the deaths array must record this
        // holder's death on the close day.
        const hit = (j.deaths || []).some(function (e) {
          return e && e.kind === 'villager' && e.who === inst.vid && (e.day | 0) === inst.closeDay;
        });
        if (!hit) holderDiedOK = false;
      }
    }
  }
  // Stays are keyed without seedDay in EXPECTED_STAYS; re-key them from the corpus.
  const wantStaysByKey = {};
  for (const seed of Object.keys(raw.bySeed).sort()) {
    const c = LAUNCHDEF.classifySeed(raw.bySeed[seed]);
    for (const inst of (c.instances || [])) {
      for (const s of EXPECTED_STAYS.notick) {
        if (inst.vid === s[1] && inst.target === s[2] && inst.closeDay === s[3]) {
          wantStaysByKey[keyOf(raw.bySeed[seed].seed, inst.vid, inst.target, inst.seedDay)] = s[3];
        }
      }
    }
  }
  check('L3-notick: plan-deleted set after fix is exactly the 2 prereg stays (luis horizon artifact + farid)',
    JSON.stringify(got) === JSON.stringify(wantStaysByKey), JSON.stringify(got));
  const flipOk = EXPECTED_FLIPS.notick.every(function (e) {
    const c = LAUNCHDEF.classifySeed(raw.bySeed[String(e[0])]);
    const inst = (c.instances || []).find(function (x) { return x.vid === e[1] && x.target === e[2] && x.seedDay === e[3]; });
    return inst && inst.closeKind === 'holder-died' && inst.closeDay === e[6];
  });
  check('L3-notick: all 5 prereg flips are holder-died at the death day', flipOk);
  check('L3-notick: every holder-died close is backed by a deaths-array row on that day', holderDiedOK);
})();

// L4: the two named cases, stated on their own (the brief's "exactly 2").
(function () {
  const raw = loadDir(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on'));
  const c16 = LAUNCHDEF.classifySeed(raw.bySeed['103416']);
  const dk = (c16.instances || []).find(function (x) { return x.vid === 'david_kim' && x.target === 'congregation'; });
  const c13 = LAUNCHDEF.classifySeed(raw.bySeed['103413']);
  const g4 = (c13.instances || []).find(function (x) { return x.vid === 'gen_4hoo6rr' && x.target === 'reunion'; });
  check('L4 david_kim d86: plan-deleted -> holder-died@86 (bucket selected-blocked kept)',
    dk && dk.closeKind === 'holder-died' && dk.closeDay === 86 && dk.bucket === 'selected-blocked',
    dk ? dk.closeKind + '@' + dk.closeDay + '/' + dk.bucket : 'missing');
  check('L4 gen_4hoo6rr d147: plan-deleted -> holder-died@147 (bucket launched kept)',
    g4 && g4.closeKind === 'holder-died' && g4.closeDay === 147 && g4.bucket === 'launched',
    g4 ? g4.closeKind + '@' + g4.closeDay + '/' + g4.bucket : 'missing');
})();

// L5: tracer legs — fate tallies identical, exactly the predicted
// trace-row closeKind flips (9 frozen, 2 fresh).
console.log('== tracer legs ==');
const frozenTrace = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'notick-a-analysis.json'), 'utf8'));
const freshTrace = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'notick-a-fresh-analysis.json'), 'utf8'));
function tracerLeg(name, dir, frozen) {
  const a = NOTICK.analyzeDir(dir);
  check('L5-' + name + ': fate tally identical to frozen',
    JSON.stringify(a.fateTally) === JSON.stringify(frozen.fateTally),
    JSON.stringify(a.fateTally) + ' vs frozen ' + JSON.stringify(frozen.fateTally));
  check('L5-' + name + ': no-tick count + unknown identical',
    a.noTickSelections === frozen.noTickSelections && a.unknown === frozen.unknown,
    'n=' + a.noTickSelections + ' unknown=' + a.unknown);
  const before = {};
  for (const t of frozen.traces) before[t.seed + '|' + t.vid + '|' + t.target + '|d' + t.noTickDay] = t;
  const flips = [];
  let otherDiffs = 0;
  for (const t of a.traces) {
    const b = before[t.seed + '|' + t.vid + '|' + t.target + '|d' + t.noTickDay];
    if (!b) { otherDiffs++; continue; }
    if (t.fate !== b.fate || t.fateDay !== b.fateDay) otherDiffs++;
    if (String(t.closeKind) !== String(b.closeKind) || String(t.closeDay) !== String(b.closeDay)) {
      flips.push({ seed: t.seed, vid: t.vid, target: t.target, noTickDay: t.noTickDay,
        before: b.closeKind + '@' + b.closeDay, after: t.closeKind + '@' + t.closeDay, fate: t.fate });
    }
  }
  return { flips: flips, otherDiffs: otherDiffs };
}
const tFrozen = tracerLeg('frozen', path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on'), frozenTrace);
const tFresh = tracerLeg('fresh', path.join(REPO, 'evidence', '2026-11-17', 'perseed-notick-a-on'), freshTrace);
check('L5-frozen: exactly 9 trace-row closeKind flips, all plan-deleted -> holder-died, 0 other trace diffs',
  tFrozen.flips.length === 9 && tFrozen.otherDiffs === 0 &&
  tFrozen.flips.every(function (f) { return f.before.indexOf('plan-deleted') === 0 && f.after.indexOf('holder-died') === 0; }),
  JSON.stringify(tFrozen.flips) + ' otherDiffs=' + tFrozen.otherDiffs);
check('L5-fresh: exactly 2 trace-row closeKind flips (app_mgpspl5e343, tom_baker), 0 other trace diffs',
  tFresh.flips.length === 2 && tFresh.otherDiffs === 0 &&
  tFresh.flips.every(function (f) { return f.before.indexOf('plan-deleted') === 0 && f.after.indexOf('holder-died') === 0; }) &&
  tFresh.flips.some(function (f) { return f.vid === 'app_mgpspl5e343'; }) &&
  tFresh.flips.some(function (f) { return f.vid === 'tom_baker'; }),
  JSON.stringify(tFresh.flips) + ' otherDiffs=' + tFresh.otherDiffs);
check('L5-fresh: luis_fernandez horizon artifact keeps plan-deleted-after fate',
  (function () {
    const a = NOTICK.analyzeDir(path.join(REPO, 'evidence', '2026-11-17', 'perseed-notick-a-on'));
    const luis = a.traces.find(function (t) { return t.vid === 'luis_fernandez'; });
    return luis && luis.fate === 'plan-deleted-after' && luis.closeKind === 'plan-deleted';
  })());

console.log('== test-closekind-a: ' + pass + ' passed, ' + fail + ' failed ==');
if (fail) { console.log('failures:\n' + failures.map(function (f) { return '  - ' + f; }).join('\n')); process.exitCode = 1; }
if (require.main !== module) module.exports = {};
