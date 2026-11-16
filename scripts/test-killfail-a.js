// test-killfail-a.js — proof for arm sim-killfail-a (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): this arm touches NO src file (instrument-only), the driver
// wraps exist (incl. the killfail fieldFight wrap and the ammo
// classifier, copied VERBATIM from the ammocensus driver), the
// taxonomy's code anchors still hold (fieldFight return fields, the
// gate party-3 bar, villageKnowsTrick), the wave-4 AND wave-5 id
// sets match the data, the classifier places one fixture per primary
// mode (incl. precedence, flag independence, the under-geared
// sub-split, the `other` residue, unknown on a missing field), the
// launch join places fighter/ally/cap/return/ambiguous/wild fixtures
// (broad vs strict), the recorder rows have their shape on a live
// 150d run, both LEG policies load with their frozen shas, and the
// determinism legs D1 (repeatability) + D2 (wrap neutrality) are
// green at 60d on seed 102041 under TABLESEATNOWAIT=1
// LEANLINKRESCUE=1.
// Usage:
//   node scripts/test-killfail-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-killfail-a.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitOut(args) {
  try { return execSync('git ' + args, { cwd: REPO }).toString().trim(); }
  catch (e) { return 'GIT-UNAVAILABLE'; }
}
function extractFunction(src, name) {
  const start = src.indexOf('function ' + name + '(');
  if (start === -1) return null;
  let depth = 0, i = src.indexOf('{', start);
  if (i === -1) return null;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}

// ---------- 1. Static ----------
console.log('== static ==');
const srcDiff = gitOut('diff master...HEAD -- src/');
check('NO src change on this branch (instrument-only)', srcDiff === '', srcDiff.slice(0, 300));
const srcStatus = gitOut('status --porcelain -- src/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
check('src worktree clean', srcStatus.length === 0, JSON.stringify(srcStatus));
const scriptsStatus = gitOut('status --porcelain -- scripts/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) {
  return /scripts\/(killfail-driver-20261116|analyze-killfail-a|test-killfail-a|build-killfail-panels-20261116)\.js$/.test(s);
});
check('scripts worktree diff is killfail-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'killfail-driver-20261116.js'), 'utf8');
for (const w of ['winPlanOf', 'winPlanHavenTick', 'winPlanSeedFromFight', 'winPlanDepart', 'vbrainExecuteDepart',
  'seedattachBounces', 'seedattachCreations', 'seedattachLaunches', 'seedattachCensus',
  'rumorplanLaunches', 'rumorplanTargetDiffs', 'snapAllPlans', 'recordRumorLaunch', 'expedMap',
  'killfailFights', 'classifyFighter', 'memberSnap', 'hpAtEntry', 'gateArmedOf']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver has KILLFAIL_RECORDER off-switch', driverSrc.indexOf('KILLFAIL_RECORDER') !== -1);
check('driver has LEG policy switch (competent|tableseat-nowait)', driverSrc.indexOf("LEG === 'tableseat-nowait'") !== -1);
check('driver defaults LEG to tableseat-nowait', driverSrc.indexOf("process.env.LEG || 'tableseat-nowait'") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver records BEFORE-state in the killfail wrap (armorP + hpEntry + trickBefore)',
  driverSrc.indexOf('armorP') !== -1 && driverSrc.indexOf('hpEntry') !== -1 && driverSrc.indexOf('trickBefore') !== -1);
check('driver records AFTER-state in the killfail wrap (mDealt + allyDealt + mHpLeft)',
  driverSrc.indexOf('allyDealt') !== -1 && driverSrc.indexOf('mHpLeft') !== -1);
check('driver watches wave 4 AND wave 5 for killfail rows',
  driverSrc.indexOf('(w === 4 || w === 5)') !== -1);
check('driver keeps the v4encounters row wave-4-only (drift-check compat)',
  driverSrc.indexOf('const watch = w === 4 && mdef && mdef.id;') !== -1);
// Ammo classifier verbatim: the copied function text matches the ammocensus source.
const ammoSrc = fs.readFileSync(path.join(REPO, 'scripts', 'ammocensus-driver-20261115.js'), 'utf8');
const ammoFn = extractFunction(ammoSrc, 'classifyFighter');
const killFn = extractFunction(driverSrc, 'classifyFighter');
check('ammo classifier copied VERBATIM from the ammocensus driver (classifyFighter text identical)',
  !!ammoFn && !!killFn && ammoFn === killFn,
  !ammoFn ? 'ammocensus fn not found' : (!killFn ? 'killfail fn not found' : 'texts differ'));
for (const helper of ['defOf', 'entryId', 'entryMaterial', 'entryUnits', 'ammoIdSet', 'countAmmo', 'gateArmedOf']) {
  const a = extractFunction(ammoSrc, helper);
  const k = extractFunction(driverSrc, helper);
  check('ammo helper ' + helper + ' copied verbatim', !!a && !!k && a === k);
}
// Wave-4 AND wave-5 id sets match the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
const liveW5 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 5; }).map(function (m) { return m.id; }).sort();
const frozenW5 = ['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot'].sort();
check('wave-5 id set matches monsters.json (10 ids)', JSON.stringify(liveW5) === JSON.stringify(frozenW5), JSON.stringify(liveW5));
// Taxonomy anchors: the code the classifier is built on must still hold.
const ffJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
check('anchor: fieldFight returns outcome/rounds/vTaken/mDealt/vHpLeft/mHpLeft',
  ffJs.indexOf("outcome: 'evade' | 'vKill' | 'mFlee' | 'vFlee' | 'vDie'") !== -1 &&
  ffJs.indexOf('allyDealt: 0') !== -1 && ffJs.indexOf('fleeHpFrac: null') !== -1);
check('anchor: fieldFight reads villageKnowsTrick for the learn-vs-fight judgment',
  ffJs.indexOf('villageKnowsTrick') !== -1);
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
check('anchor: villageKnowsTrick(mid) is the unified trick read',
  gameJs.indexOf('villageKnowsTrick(mid)') !== -1);
check('anchor: noteVillagerTrickObservation records into state.villagerTricks',
  gameJs.indexOf('noteVillagerTrickObservation') !== -1 && gameJs.indexOf('state.villagerTricks') !== -1);
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('anchor: gate demands party of 3 for wave 4+ (win-plan.js:510)',
  winPlanJs.indexOf('party.length < 3') !== -1);
check('anchor: gate avoid reason is outmatched',
  winPlanJs.indexOf("reason: 'outmatched'") !== -1);
// Policy shas (frozen in the prereg).
const crypto = require('crypto');
function sha12(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', file), 'utf8')).digest('hex').slice(0, 12);
}
check('competent policy sha is 74a890f0844e', sha12('competent.js') === '74a890f0844e', 'got ' + sha12('competent.js'));
check('tableseat-nowait policy sha is a11a1abc672e', sha12('tableseat-nowait.js') === 'a11a1abc672e', 'got ' + sha12('tableseat-nowait.js'));

// ---------- 2. Classifier unit fixtures ----------
console.log('== classifier fixtures ==');
function mkPerson(over) {
  const p = { vid: 'v1', name: 'Test Fighter', class: 'armed-with-ammo', gateArmed: true,
    effectivelyArmed: true, rangedWeapon: 'bow', ammoNeed: 'arrow', ammoN: 5, otherAmmoN: 0,
    meleeWeapon: 'spear', spearInRangedSlot: false, carriesRangedUnequipped: null,
    error: null, armorP: 12, weaponB: 20, hpEntry: 100 };
  return Object.assign(p, over || {});
}
function mkFight(over) {
  const f = { day: 60, vid: 'v1', mid: 'eulogy', wave: 4, alliesN: 2, allyVids: ['v2', 'v3'],
    allyFromStart: true, gate: null, trickBefore: true, trickAfter: true,
    fighter: mkPerson({ vid: 'v1' }),
    allies: [mkPerson({ vid: 'v2', name: 'Ally Two' }), mkPerson({ vid: 'v3', name: 'Ally Three' })],
    calledAlly: null, mHpEntry: 1000, mdefHp: [900, 1100], mHpLeft: 800,
    outcome: 'vFlee', rounds: 4, vTaken: 30, mDealt: 400, allyDealt: 50, vHpLeft: 70,
    calledHelp: false, allyVid: null, fleeHpFrac: 0.7, volley: { shots: 3, hits: 2, dmg: 40 }, log: ['R1: Test strikes for 40 (960 left)'] };
  return Object.assign(f, over || {});
}
function expectPrimary(name, fight, primary) {
  const c = ANALYZE.classifyFight(fight, { event: { launchedPartySize: 3 }, joinKind: 'fighter' });
  check(name + ' -> primary ' + primary, c.classified && c.primary === primary,
    'got classified=' + c.classified + ' primary=' + c.primary + ' missing=' + JSON.stringify(c.missingFields));
}
function expectFlags(name, fight, flags) {
  const c = ANALYZE.classifyFight(fight, { event: { launchedPartySize: 3 }, joinKind: 'fighter' });
  const got = (c.flags || []).slice().sort();
  const want = flags.slice().sort();
  check(name + ' -> flags [' + want.join(',') + ']', JSON.stringify(got) === JSON.stringify(want),
    'got [' + got.join(',') + ']');
}

// One fixture per primary mode.
expectPrimary('killed: vKill', mkFight({ outcome: 'vKill', mDealt: 1000, mHpLeft: 0 }), 'killed');
expectPrimary('evaded: evade', mkFight({ outcome: 'evade', rounds: 0, mDealt: 0, vTaken: 0 }), 'evaded');
expectPrimary('died: vDie', mkFight({ outcome: 'vDie', rounds: 3, mDealt: 100, vTaken: 100, vHpLeft: 0 }), 'died');
expectPrimary('fled-early: vFlee 2 rounds', mkFight({ rounds: 2, mDealt: 100 }), 'fled-early');
expectPrimary('drove-off: mFlee', mkFight({ outcome: 'mFlee', mDealt: 400 }), 'drove-off');
expectPrimary('out-damaged: vFlee 5 rounds, 10% dealt', mkFight({ rounds: 5, mDealt: 100 }), 'out-damaged');
expectPrimary('trick-unknown: vFlee 4 rounds, 40% dealt, trick false',
  mkFight({ trickBefore: false, mDealt: 400 }), 'trick-unknown');
expectPrimary('dry: fighter dry, trick known, 40% dealt',
  mkFight({ fighter: mkPerson({ vid: 'v1', class: 'armed-no-ammo', ammoN: 0 }), mDealt: 400 }), 'dry');
expectPrimary('party-short: contact party 2, trick known, 40% dealt',
  mkFight({ alliesN: 1, allyVids: ['v2'], allies: [mkPerson({ vid: 'v2' })], mDealt: 400 }), 'party-short');
expectPrimary('under-geared: armorP 5, trick known, 40% dealt, party 3',
  mkFight({ fighter: mkPerson({ vid: 'v1', armorP: 5 }), mDealt: 400 }), 'under-geared');
expectPrimary('other: fought, geared, known trick, party 3, ammo fine, 40% dealt, 4 rounds',
  mkFight({ mDealt: 400 }), 'other');
// Precedence.
expectPrimary('precedence: trick-unknown beats dry beats party-short',
  mkFight({ trickBefore: false, alliesN: 1, allyVids: ['v2'], allies: [mkPerson({ vid: 'v2' })],
    fighter: mkPerson({ vid: 'v1', class: 'armed-no-ammo', ammoN: 0 }), mDealt: 400 }), 'trick-unknown');
expectPrimary('precedence: vFlee 2 rounds with low damage is fled-early, not out-damaged',
  mkFight({ rounds: 2, mDealt: 100 }), 'fled-early');
expectPrimary('precedence: vFlee 5 rounds with low damage is out-damaged, not fled-early',
  mkFight({ rounds: 5, mDealt: 100 }), 'out-damaged');
expectPrimary('precedence: dry beats party-short (trick known)',
  mkFight({ alliesN: 1, allyVids: ['v2'], allies: [mkPerson({ vid: 'v2' })],
    fighter: mkPerson({ vid: 'v1', class: 'armed-no-ammo', ammoN: 0 }), mDealt: 400 }), 'dry');
expectPrimary('precedence: party-short beats under-geared (trick known, ammo fine)',
  mkFight({ alliesN: 1, allyVids: ['v2'], allies: [mkPerson({ vid: 'v2' })],
    fighter: mkPerson({ vid: 'v1', armorP: 5 }), mDealt: 400 }), 'party-short');
expectPrimary('precedence: died beats fled-early (vDie at 2 rounds)',
  mkFight({ outcome: 'vDie', rounds: 2, mDealt: 100, vTaken: 100, vHpLeft: 0 }), 'died');
expectPrimary('precedence: drove-off beats out-damaged (mFlee with 10% dealt)',
  mkFight({ outcome: 'mFlee', mDealt: 100 }), 'drove-off');
// Flag independence + sub-splits.
expectFlags('flags: trick-unknown + dry + party-short all counted at once',
  mkFight({ trickBefore: false, alliesN: 1, allyVids: ['v2'], allies: [mkPerson({ vid: 'v2' })],
    fighter: mkPerson({ vid: 'v1', class: 'armed-no-ammo', ammoN: 0 }), mDealt: 400 }),
  ['trick-unknown', 'party-short', 'dry-fighter']);
(function () {
  const c = ANALYZE.classifyFight(mkFight({ fighter: mkPerson({ vid: 'v1', armorP: 5 }) }), { event: { launchedPartySize: 3 }, joinKind: 'fighter' });
  check('under-geared sub-split: unarmored-only (armorP 5, effectivelyArmed true)',
    c.subs.unarmored === true && c.subs.unarmed === false, JSON.stringify(c.subs));
  const c2 = ANALYZE.classifyFight(mkFight({ fighter: mkPerson({ vid: 'v1', effectivelyArmed: false, class: 'unarmed', rangedWeapon: null, ammoNeed: null, ammoN: 0, meleeWeapon: null }) }), { event: { launchedPartySize: 3 }, joinKind: 'fighter' });
  check('under-geared sub-split: unarmed-only (armorP 12, effectivelyArmed false)',
    c2.subs.unarmored === false && c2.subs.unarmed === true, JSON.stringify(c2.subs));
  const c3 = ANALYZE.classifyFight(mkFight({ vTaken: 60 }), { event: { launchedPartySize: 3 }, joinKind: 'fighter' });
  check('mauled flag: vTaken 60 >= 50% of HP entry 100', c3.flags.indexOf('mauled') !== -1, JSON.stringify(c3.flags));
  const c4 = ANALYZE.classifyFight(mkFight({ fighter: mkPerson({ vid: 'v1', armorP: 5 }) }), { event: { launchedPartySize: 2 }, joinKind: 'fighter' });
  check('launched-short flag: launched party 2', c4.flags.indexOf('launched-short') !== -1, JSON.stringify(c4.flags));
  const c5 = ANALYZE.classifyFight(mkFight({ fighter: mkPerson({ vid: 'v1', class: 'unarmed', rangedWeapon: null, ammoNeed: null, ammoN: 0, meleeWeapon: 'spear' }),
    allies: [mkPerson({ vid: 'v2', class: 'unarmed', rangedWeapon: null, ammoNeed: null, ammoN: 0 }), mkPerson({ vid: 'v3', class: 'unarmed', rangedWeapon: null, ammoNeed: null, ammoN: 0 })] }),
    { event: { launchedPartySize: 3 }, joinKind: 'fighter' });
  check('no-working-range flag: nobody armed-with-ammo', c5.flags.indexOf('no-working-range') !== -1, JSON.stringify(c5.flags));
})();
// Unknown on a missing field (each dropped in turn).
(function () {
  const cases = [
    ['mHpEntry', (function (f) { delete f.mHpEntry; return f; })(mkFight())],
    ['fighter.hpEntry', (function (f) { f.fighter = mkPerson({ vid: 'v1', hpEntry: null }); return f; })(mkFight())],
    ['trickBefore', (function (f) { delete f.trickBefore; return f; })(mkFight())],
    ['outcome', (function (f) { delete f.outcome; return f; })(mkFight())],
    ['fighter.unclassified', (function (f) { f.fighter = mkPerson({ vid: 'v1', class: 'unclassified', error: 'no-person' }); return f; })(mkFight())],
  ];
  for (const pair of cases) {
    const c = ANALYZE.classifyFight(pair[1], { event: { launchedPartySize: 3 }, joinKind: 'fighter' });
    check('unknown on missing ' + pair[0], c.classified === false && c.primary === 'unclassified' && c.missingFields.length > 0,
      'got classified=' + c.classified + ' missing=' + JSON.stringify(c.missingFields));
  }
})();

// ---------- 3. Join fixtures ----------
console.log('== join fixtures ==');
function rumorLaunch(day, vid, role, inviter, opts) {
  const o = opts || {};
  return { day: day, vid: vid, role: role, path: o.path || 'brain', inviter: inviter,
    companion: o.companion || null, expedStart: 'yes', expedBefore: false, expedAfter: true,
    stageBefore: o.stageBefore || 'party', targetBefore: o.targetBefore || null,
    needWaveBefore: o.needWaveBefore != null ? o.needWaveBefore : null, nodeBefore: null,
    partyBefore: o.partyBefore || [],
    stageAfter: o.stageAfter || 'hunt', targetAfter: o.targetAfter || null,
    needWaveAfter: o.needWaveAfter != null ? o.needWaveAfter : null, nodeAfter: null,
    partyAfter: o.partyAfter || [] };
}
function censusRow(day, vid, exped, opts) {
  const o = opts || {};
  return { day: day, vid: vid, target: o.target || null, needWave: o.needWave != null ? o.needWave : null,
    stage: o.stage || 'hunt', party: o.party || [], sinceDay: 50, node: null,
    holderAlive: true, holderNode: { nx: 0, ny: 0 }, holderExped: !!exped,
    holderSick: false, holderHealth: 100 };
}
function mkSeed(over) {
  const j = { seed: 102041, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], v4encounters: [], deaths: [],
    seedattachBounces: [], seedattachCreations: [], seedattachLaunches: [], seedattachCensus: [],
    rumorplanLaunches: [], rumorplanTargetDiffs: [], killfailFights: [], daily: [] };
  return Object.assign(j, over || {});
}
function launchedLaunch(day, inviter, companion, opts) {
  const o = opts || {};
  const nw = ('needWaveAfter' in o) ? o.needWaveAfter : 4;
  const rows = [rumorLaunch(day, inviter, 'inviter', inviter, {
    targetAfter: o.targetAfter || null, needWaveAfter: nw,
    partyAfter: companion ? [companion] : [], stageAfter: o.stageAfter || 'hunt' })];
  if (companion) rows.push(rumorLaunch(day, companion, 'companion', inviter, {
    targetAfter: o.targetAfter || null, needWaveAfter: nw,
    partyAfter: [inviter], stageAfter: 'hunt' }));
  return rows;
}
function expedCensus(vid, daysOut, returnDay) {
  const rows = [];
  for (let d = daysOut[0]; d <= daysOut[1]; d++) rows.push(censusRow(d, vid, true));
  rows.push(censusRow(returnDay, vid, false));
  return rows;
}
(function () {
  // Fighter-window join: launch day 50, out 50-52, back 53; fight day 51 by the inviter.
  const r = ANALYZE.classifySeed(mkSeed({
    rumorplanLaunches: launchedLaunch(50, 'v1', 'v2'),
    seedattachCensus: expedCensus('v1', [50, 52], 53).concat(expedCensus('v2', [50, 52], 53)),
    killfailFights: [mkFight({ day: 51, vid: 'v1' })],
  }));
  check('join: fight inside fighter window joins (launched 1, joinKind fighter)',
    r.launchedTotal === 1 && r.launched[0].joinKind === 'fighter', 'got ' + r.launchedTotal + '/' + (r.launched[0] || {}).joinKind);
  // Ally-window join: the fighter is not a participant; an ally is.
  const r2 = ANALYZE.classifySeed(mkSeed({
    rumorplanLaunches: launchedLaunch(50, 'v1', 'v2'),
    seedattachCensus: expedCensus('v1', [50, 52], 53).concat(expedCensus('v2', [50, 52], 53)),
    killfailFights: [mkFight({ day: 51, vid: 'v9', allyVids: ['v1', 'v2'], allies: [mkPerson({ vid: 'v1' }), mkPerson({ vid: 'v2' })] })],
  }));
  check('join: fight inside an ally window joins (joinKind ally)',
    r2.launchedTotal === 1 && r2.launched[0].joinKind === 'ally', 'got ' + r2.launchedTotal + '/' + (r2.launched[0] || {}).joinKind);
  // Past the +14d cap: launch 50, fight 65 -> wild.
  const r3 = ANALYZE.classifySeed(mkSeed({
    rumorplanLaunches: launchedLaunch(50, 'v1', 'v2'),
    seedattachCensus: expedCensus('v1', [50, 52], 53).concat(expedCensus('v2', [50, 52], 53)),
    killfailFights: [mkFight({ day: 65, vid: 'v1' })],
  }));
  check('join: fight past the +14d cap is wild', r3.launchedTotal === 0 && r3.wildTotal === 1, 'got ' + r3.launchedTotal + '/' + r3.wildTotal);
  // Return day: census exped false on day 51; fight day 52 -> wild; fight day 51 -> launched.
  const r4 = ANALYZE.classifySeed(mkSeed({
    rumorplanLaunches: launchedLaunch(50, 'v1', 'v2'),
    seedattachCensus: [censusRow(50, 'v1', true), censusRow(51, 'v1', false), censusRow(50, 'v2', true), censusRow(51, 'v2', false)],
    killfailFights: [mkFight({ day: 52, vid: 'v1' })],
  }));
  check('join: fight after the return census day is wild', r4.launchedTotal === 0 && r4.wildTotal === 1, 'got ' + r4.launchedTotal + '/' + r4.wildTotal);
  const r5 = ANALYZE.classifySeed(mkSeed({
    rumorplanLaunches: launchedLaunch(50, 'v1', 'v2'),
    seedattachCensus: [censusRow(50, 'v1', true), censusRow(51, 'v1', false), censusRow(50, 'v2', true), censusRow(51, 'v2', false)],
    killfailFights: [mkFight({ day: 50, vid: 'v1' })],
  }));
  check('join: fight on launch day joins even when the holder returns the next day',
    r5.launchedTotal === 1, 'got ' + r5.launchedTotal);
  // Two covering events: joined once, flagged ambiguous.
  const r6 = ANALYZE.classifySeed(mkSeed({
    rumorplanLaunches: launchedLaunch(50, 'v1', 'v2').concat(launchedLaunch(51, 'v3', 'v1')),
    seedattachCensus: expedCensus('v1', [50, 55], 56).concat(expedCensus('v2', [50, 52], 53), expedCensus('v3', [51, 55], 56)),
    killfailFights: [mkFight({ day: 52, vid: 'v1' })],
  }));
  check('join: two covering events join once, flagged ambiguous',
    r6.launchedTotal === 1 && r6.launched[0].ambiguous === true && r6.launched[0].covering === 2,
    'got ' + r6.launchedTotal + ' ambiguous=' + (r6.launched[0] || {}).ambiguous);
  // No launches at all -> wild.
  const r7 = ANALYZE.classifySeed(mkSeed({ killfailFights: [mkFight({ day: 51, vid: 'v1' })] }));
  check('join: no launches -> wild', r7.launchedTotal === 0 && r7.wildTotal === 1, 'got ' + r7.launchedTotal + '/' + r7.wildTotal);
  // Broad vs strict: target-null needWave-4 launch is BOTH (needWave >= 4 is strict leg (a)).
  const ev1 = ANALYZE.buildEvents(mkSeed({ rumorplanLaunches: launchedLaunch(50, 'v1', 'v2') }));
  check('broad vs strict: target-null needWave-4 launch is broad AND strict (needWave leg)',
    ev1.length === 1 && ev1[0].broad === true && ev1[0].strict === true, JSON.stringify(ev1.map(function (e) { return { broad: e.broad, strict: e.strict }; })));
  // Named-target launch is both.
  const ev2 = ANALYZE.buildEvents(mkSeed({ rumorplanLaunches: launchedLaunch(50, 'v1', 'v2', { targetAfter: 'eulogy', needWaveAfter: null }) }));
  check('broad vs strict: named-target launch is both',
    ev2.length === 1 && ev2[0].broad === true && ev2[0].strict === true, JSON.stringify(ev2.map(function (e) { return { broad: e.broad, strict: e.strict }; })));
  // Bounce leg: target-null, needWave unset, but a wave-4 seed bounce for the inviter -> broad.
  const ev3 = ANALYZE.buildEvents(mkSeed({
    rumorplanLaunches: launchedLaunch(50, 'v1', 'v2', { needWaveAfter: null }),
    v4seeds: [{ day: 48, vid: 'v1', mid: 'eulogy', wave: 4, outcome: 'fled', stageAfter: 'party', target: null, node: null }],
  }));
  check('broad via bounce leg: wave-4 seed history makes the launch broad (strict false)',
    ev3.length === 1 && ev3[0].broad === true && ev3[0].strict === false, JSON.stringify(ev3.map(function (e) { return { broad: e.broad, strict: e.strict }; })));
  // End-to-end: 2 launched fights (1 killed, 1 fled) + 1 wild fight.
  const r8 = ANALYZE.classifySeed(mkSeed({
    rumorplanLaunches: launchedLaunch(50, 'v1', 'v2'),
    seedattachCensus: expedCensus('v1', [50, 55], 56).concat(expedCensus('v2', [50, 55], 56)),
    killfailFights: [
      mkFight({ day: 51, vid: 'v1', outcome: 'vKill', mDealt: 1000, mHpLeft: 0 }),
      mkFight({ day: 52, vid: 'v1', outcome: 'vFlee', rounds: 4, mDealt: 100 }),
      mkFight({ day: 70, vid: 'v1', outcome: 'vFlee', rounds: 4, mDealt: 100 }),
    ],
  }));
  check('classifySeed end-to-end: 2 launched (1 kill), 1 wild',
    r8.launchedTotal === 2 && r8.wildTotal === 1 &&
    r8.launched.filter(function (row) { return row.fight.outcome === 'vKill'; }).length === 1,
    'got launched=' + r8.launchedTotal + ' wild=' + r8.wildTotal);
})();

// ---------- 4. Recorder: live in-memory runs (shape + both LEG policies) ----------
console.log('== recorder live ==');
function loadDriverFresh(leg, days) {
  const driverPath = path.join(REPO, 'scripts', 'killfail-driver-20261116.js');
  delete require.cache[require.resolve(driverPath)];
  process.env.LEG = leg;
  process.env.DAYS = String(days);
  process.env.TABLESEATNOWAIT = '1';
  process.env.LEANLINKRESCUE = '1';
  return require(driverPath);
}
async function liveRuns() {
  const d1 = loadDriverFresh('tableseat-nowait', 5);
  const out = await d1.oneRun(102041);
  check('live tableseat-nowait run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run policy is tableseat-nowait, sha a11a1abc672e', out.policy === 'tableseat-nowait' && out.policySha === 'a11a1abc672e',
    'got ' + out.policy + '/' + out.policySha);
  check('live run carries killfailFights array', Array.isArray(out.killfailFights));
  check('live run carries rumorplan + seedattach + v4 arrays',
    Array.isArray(out.rumorplanLaunches) && Array.isArray(out.seedattachCensus) && Array.isArray(out.v4seeds) && Array.isArray(out.v4encounters));
  check('live run carries wave4Ids + wave5Ids (10 + 10)', Array.isArray(out.wave4Ids) && out.wave4Ids.length === 10 &&
    Array.isArray(out.wave5Ids) && out.wave5Ids.length === 10,
    'got w4=' + (out.wave4Ids || []).length + ' w5=' + (out.wave5Ids || []).length);
  // 150d run: the killfail rows must actually populate (seed 102041 produced 5 in the smoke run).
  const dLong = loadDriverFresh('tableseat-nowait', 150);
  const outLong = await dLong.oneRun(102041);
  check('live 150d run completes with 0 instrument errors', outLong.instrumentErrors.length === 0, JSON.stringify(outLong.instrumentErrors.slice(0, 3)));
  check('live 150d run produced >=1 killfailFights row (before/after proof is non-vacuous)',
    outLong.killfailFights.length >= 1, 'got ' + outLong.killfailFights.length);
  const badKf = (outLong.killfailFights || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && r.mid && (r.wave === 4 || r.wave === 5) &&
      r.fighter && typeof r.fighter.class === 'string' && typeof r.fighter.armorP === 'number' &&
      typeof r.fighter.hpEntry === 'number' && typeof r.trickBefore === 'boolean' &&
      typeof r.outcome === 'string' && typeof r.rounds === 'number' && typeof r.mDealt === 'number' &&
      typeof r.mHpEntry === 'number' && r.mHpEntry > 0 && Array.isArray(r.log) && Array.isArray(r.allies));
  });
  check('killfail rows have their full shape (before + after + monster HP)', !badKf,
    badKf ? JSON.stringify(badKf).slice(0, 300) : '');
  const w4count = (outLong.v4encounters || []).length;
  const kfW4 = (outLong.killfailFights || []).filter(function (r) { return r.wave === 4; }).length;
  check('killfail wave-4 rows cross-check the v4encounters count', kfW4 === w4count, 'kf=' + kfW4 + ' v4=' + w4count);
  const d2 = loadDriverFresh('competent', 5);
  const out2 = await d2.oneRun(102041);
  check('live competent run completes with 0 instrument errors', out2.instrumentErrors.length === 0, JSON.stringify(out2.instrumentErrors.slice(0, 3)));
  check('live run policy is competent, sha 74a890f0844e', out2.policy === 'competent' && out2.policySha === '74a890f0844e',
    'got ' + out2.policy + '/' + out2.policySha);
  check('live run carries killfailFights array on the competent leg too', Array.isArray(out2.killfailFights));
}

// ---------- 5. Determinism legs D1 + D2 (60d, seed 102041, tableseat-nowait, flags on) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60', LEG: 'tableseat-nowait',
    TABLESEATNOWAIT: '1', LEANLINKRESCUE: '1' }, envExtra || {});
  const script = "const d=require('./scripts/killfail-driver-20261116.js');" +
    "d.oneRun(102041).then(function(o){" +
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
  const off = childFingerprint({ KILLFAIL_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty killfail/rumorplan/seedattach/v4/dawnbid arrays',
    (off.full.killfailFights || []).length === 0 && (off.full.rumorplanLaunches || []).length === 0 &&
    (off.full.rumorplanTargetDiffs || []).length === 0 &&
    (off.full.seedattachBounces || []).length === 0 && (off.full.seedattachCensus || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidScores || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
}

(async function () {
  try {
    await liveRuns();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
