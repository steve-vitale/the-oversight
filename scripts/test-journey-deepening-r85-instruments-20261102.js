// journey-deepening-r85-20261102 proof: r84 proof with ONLY renames (r85 filenames, seed band 42241-42244, INVITE85/FAVOR85/TEACH85/TEACHPAGE85/REQ85 markers) PLUS (a11) TEACH-INVITEOPEN second-accept gate + (a12) invite-open record + (e) Q8 teach-inviteopen analyzer checks + Q8 fixtures + pooled vs r80-r84 (60/12). PRE-REGISTERED: hidden_files/evidence/2026-11-02/journey-deepening-r85-prereg.md
// test-journey-deepening-r82-instruments-20261102.js -- PROOF TEST for the
// r82 deepening instruments (driver-only, zero src/js). Same assertions as
// r80, re-pointed at r82 vs r80, plus FAVOR_DELIVER arm checks and Q6
// favor-total fixtures. Usage: node scripts/test-journey-deepening-r82-instruments-20261102.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
// test-journey-deepening-r80-instruments-20261102.js -- PROOF TEST for the
// r80 deepening instruments (driver-only, zero src/js). Same assertions as
// r79, re-pointed at r80 vs r79, plus Q1c binding fixtures (offer -> PASS,
// none -> FAIL). Usage: node scripts/test-journey-deepening-r80-instruments-20261102.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
// test-journey-deepening-r79-instruments-20261031.js -- PROOF TEST for the
// r78 deepening instruments (driver-only, zero src/js).
// Asserts: (a) the r75 driver carries the r72 census wraps + instruments +
// r75 output filenames + r75 prereg path; (a3) no r73 output filenames left;
// (b) pickChoice, subjectPivotPick and pagerPick are byte-identical to r79;
// (c) the r78 analyzer reads r78 seed JSONs and reports Q1a/Q1b/Q2/Q3/Q5-census;
// (d) analyzer verdict logic on synthetic fixtures: all-pass panel,
// made-fail/worn-pass split panel (the r72 metric-review case), hide gap,
// wave-3 kill pass, no-kill NO-GO, stay-green fail on a mislabel.
// Usage: node scripts/test-journey-deepening-r79-instruments-20261031.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r85-20261102.js');
const DRIVER84 = path.join(__dirname, 'journey-deepening-r84-20261102.js');
const ANALYZER = path.join(__dirname, 'analyze-journey-deepening-r85-20261102.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
const src84 = fs.readFileSync(DRIVER84, 'utf8');
const ana = fs.readFileSync(ANALYZER, 'utf8');
check('(a) driver contains census wraps + r84 outputs + r84 prereg + INVITE arm',
  src.includes('function wrapTeachCensus(G, ctx, dayFn)') &&
  src.includes('journey-deepening-r85-seed${seed}.json') && src.includes('journey-deepening-r85-transcript-') &&
  src.includes('offeredSkillTurns') && src.includes('gateWhy') &&
  src.includes('function subjectPivotPick(') && src.includes('function pagerPick(') &&
  src.includes('journey-deepening-r85-prereg.md') &&
  src.includes('INVITE_ACCEPT') && src.includes('inviteMenus') && src.includes('inviteAccepts') && src.includes('FAVOR_DELIVER') && src.includes('favorOffers') && src.includes('favorDelivers') && src.includes('_favorDeliverSpent') &&
  src.includes("trust: _trustV") && src.includes('_inviteAcceptSpent'));
check('(a4) r78 accept gate is any-turn (no turn===0 gate) + INVITE85 marker',
  !src.includes('INVITE_ACCEPT && !_inviteAcceptSpent && turn === 0') && src.includes('INVITE85') && src.includes('ANY turn'));
check('(a5) FAVOR_DELIVER arm: any-turn dlg:favor_action, once/seed, outcome fill',
  src.includes("FAVOR_DELIVER && !_favorDeliverSpent") && src.includes("x.id === 'dlg:favor_action'") && src.includes("_favRec") && src.includes('FAVOR85') && !src.includes('FAVOR_DELIVER && !_favorDeliverSpent && turn === 0'));
check('(a3) no r84 output filenames left',
  !src.includes('journey-deepening-r84-seed') && !src.includes('journey-deepening-r84-transcript-'));
check('(a6) TEACH85 arm: armor-sitting gate + learn-preferred armor pick + subject pivot cap + outcome fill',
  src.includes('TEACH_ARMOR') && src.includes('_sittingArmorOffered') && src.includes('TEACH85') &&
  src.includes("x.id.indexOf('bark_armor')") && src.includes('_teachArmPivots < 3') &&
  src.includes("x.id === 'dlg:subject'") && src.includes('_teachArmPicks') && src.includes('_teachRec'));
check('(a7) REQ85 arm: once/sitting dlg:favor_requirements pick + outcome fill',
  src.includes('FAVOR_REQ') && src.includes('_favorReqRead') && src.includes('REQ85') &&
  src.includes("x.id === 'dlg:favor_requirements'") && src.includes('_favorReqReads') && src.includes('_reqRec'));
check('(a8) w4fights detail projection in driver output',
  src.includes('w4fights') && src.includes('w4killsByType') && src.includes('teachArmPicks: _teachArmPicks') && src.includes('favorReqReads: _favorReqReads'));
check('(a9) TEACH-PAGE arm: menu:more walk after first pivot, cycle-detected, cap 8, page records',
  src.includes('TEACHPAGE85') && src.includes('_teachPageSteps') && src.includes('_teachPageSeen') &&
  src.includes("x.id === 'menu:more'") && src.includes('_teachPageSteps < 8') &&
  src.includes("kind: 'page'") && src.includes('_teachArmPivots === 0'));
check('(a10) REQ-before-TEACH order: requirements block precedes teach-page block',
  src.indexOf('FAVOR-REQUIREMENTS ARM') >= 0 && src.indexOf('TEACH-PAGE ARM') >= 0 &&
  src.indexOf('FAVOR-REQUIREMENTS ARM') < src.indexOf('TEACH-PAGE ARM'));
check('(a11) TEACH-INVITEOPEN second accept: armor-gated, trust gate kept, second flag recorded',
  src.includes('_inviteSecondAcceptSpent') && src.includes("_sittingArmorOffered.length && !_inviteSecondAcceptSpent") &&
  src.includes('second: _isSecond') && src.includes('INVITE85') &&
  src.includes('typeof _trustV') && src.includes('>= 60'));
check('(a12) invite-open record: turn-0 invitation-only detection + route flags + persistence',
  src.includes('_inviteOpenArmor') && src.includes('inviteOpenArmor: _inviteOpenArmor') &&
  src.includes('endedAfterAccept') && src.includes('steerableAfter') &&
  src.includes('lessonChoice') && src.includes('_inviteOpenCur'));
const slice = (s, from, to) => {
  const a = s.indexOf(from);
  if (a < 0) return null;
  const b = to ? s.indexOf(to, a + from.length) : s.length;
  if (b < 0) return null;
  return s.slice(a, b);
};
check('(b) pickChoice byte-identical to r84',
  slice(src, 'function pickChoice(', '\nconst CONVO_DAYS') === slice(src84, 'function pickChoice(', '\nconst CONVO_DAYS'));
check('(b) subjectPivotPick byte-identical to r84',
  slice(src, 'function subjectPivotPick(', 'function pagerPick(') === slice(src84, 'function subjectPivotPick(', 'function pagerPick('));
check('(b) pagerPick byte-identical to r84',
  slice(src, 'function pagerPick(', 'function pickChoice(') === slice(src84, 'function pagerPick(', 'function pickChoice('));
check('(e) analyzer reports Q1c RATE + wave-4 totals + favor transitions + Q7 teach-page + page tallies + requirements + w4 detail',
  ana.includes('Q1c CRAFT-CHANNEL RATE') && ana.includes('q1cRate') && ana.includes('pooledSittings') && ana.includes('totalW4') && ana.includes('favorTransitionCounts') && ana.includes('Q2b WAVE-4 WALL') &&
  ana.includes('Q7 TEACH-PAGE') && ana.includes('totalArmorLessonsLearned') && ana.includes('totalTeachArmPages') && ana.includes('totalFavorReqReads') && ana.includes('w4detail') && ana.includes('totalW4kills') && ana.includes('Q8 TEACH-INVITEOPEN') && ana.includes('classifyInviteOpen') && ana.includes('inviteOpenArmor'));
check('(c) analyzer reads r84 JSONs + Q1a/Q1b/Q2/Q3/Q5-LURE-CENSUS',
  ana.includes('journey-deepening-r85-seed') && ana.includes('Q8 TEACH-INVITEOPEN') && ana.includes('Q1a MADE') && ana.includes('Q1c CRAFT-CHANNEL') && ana.includes('BINDING, carried') && ana.includes('q1c') && ana.includes('Q1b WORN') && ana.includes('totalFavorOffers') && ana.includes('Q6 FAVOR-DELIVER') &&
  ana.includes('Q2 WAVE2-3 FIGHTS') && ana.includes('Q3 REGIONAL') && ana.includes('Q5 LURE-OUTCOME CENSUS') &&
  ana.includes('TOTAL r85:') && !ana.includes('journey-deepening-r80-seed'));
const { verdicts } = require('./analyze-journey-deepening-r85-20261102.js');
function fakeSeed(o) {
  return Object.assign({
    seed: 1, endReason: 'survived', maxGameDay: 101, finalWave: 3, finalScale: 'regional',
    census: [{ alive: true }, { alive: true }],
    armor: { craftArmor: { made: { bark_armor: 2 } }, snaps: [{ armoredVillagers: [{ torso: 'bark_armor' }] }], schEquipped: {}, matflow: { daysHidePos: 0, maxHide: 0 } },
    fightsByWave: { 2: 1, 3: 2 },
    w3fights: [{ day: 50, result: 'won', rounds: 4, endHp: [{ kind: 'villager' }, { kind: 'player' }], monsters: [{ mid: 'spool' }] }],
    regionalLog: [{ day: 33, ev: 'propose', result: 'linked' }],
    deathHonesty: { mislabels: [] },
    inviteMenus: [{ day: 45, vid: 'v1', trust: 90, turn: 0 }],
    inviteAccepts: [{ day: 45, vid: 'v1', trust: 90, outcomeLine: 'walk outcome' }],
    favorOffers: [{ day: 45, vid: 'v1', trust: 90, turn: 1 }],
    favorDelivers: [{ day: 45, vid: 'v1', trust: 90, outcomeLine: 'favor done' }],
    offeredSkillSittings: [{ offeredLearn: [], offeredTeach: [] }, { offeredLearn: [], offeredTeach: [] }, { offeredLearn: [], offeredTeach: [] }],
    teachLessons: [],
    teachArmPicks: [],
    favorReqReads: [],
    w4fights: [],
  }, o);
}
{
  const v = verdicts([fakeSeed({ seed: 42121 }), fakeSeed({ seed: 42112 }), fakeSeed({ seed: 42113 }), fakeSeed({ seed: 42114 })]);
  check('(d) synthetic all-pass panel: Q1a PASS, Q1b PASS, Q2 PASS, Q3 PASS, stay-green PASS',
    v.q1a === 'PASS' && v.q1b === 'PASS' && v.q2 === 'PASS' && v.q3 === 'PASS' && v.stayGreen === 'PASS');
  check('(d) synthetic hide gap detected (hide 0 everywhere)',
    v.hideGap === true);
}
{
  // Made-fail / worn-pass: the r72 split case — worn armor with zero crafts.
  const wornOnly = fakeSeed({ seed: 42121, armor: { craftArmor: { made: {} }, snaps: [{ armoredVillagers: [{ torso: 'bark_armor' }] }], schEquipped: {}, matflow: { daysHidePos: 0, maxHide: 0 } } });
  const v = verdicts([wornOnly, wornOnly, wornOnly, wornOnly]);
  check('(d) synthetic split panel: Q1a FAIL while Q1b PASS',
    v.q1a === 'FAIL' && v.q1b === 'PASS' && v.madePass === 0 && v.wornPass === 4);
}
{
  const noKill = fakeSeed({ seed: 42121, w3fights: [
    { day: 50, result: 'routed', rounds: 121, endHp: [{ kind: 'player' }], monsters: [{ mid: 'spool' }] },
    { day: 51, result: 'lost', rounds: 10, endHp: [{ kind: 'player' }], monsters: [{ mid: 'spool' }] },
  ], fightsByWave: { 2: 0, 3: 2 } });
  const v = verdicts([noKill, noKill, noKill, noKill]);
  check('(d) synthetic no-kill panel: Q2 FAIL + Q2 NO-GO finding',
    v.q2 === 'FAIL' && v.q2NoGo === true && v.totalW3 === 8 && v.totalW3kills === 0);
}
{
  const mis = fakeSeed({ seed: 42121, deathHonesty: { mislabels: [{ a: 1 }] } });
  const v = verdicts([mis, fakeSeed({ seed: 42112 }), fakeSeed({ seed: 42113 }), fakeSeed({ seed: 42114 })]);
  check('(d) synthetic mislabel panel: stay-green FAIL',
    v.stayGreen === 'FAIL' && v.mislabels === 1);
}
{
  const v = verdicts([fakeSeed({ seed: 42161 }), fakeSeed({ seed: 42162 }), fakeSeed({ seed: 42163 }), fakeSeed({ seed: 42164 })]);
  check('(d) synthetic Q5 census: menus offered + accepts with outcomes -> PASS',
    v.q5 === 'PASS' && v.totalMenus === 4 && v.totalAccepts === 4 && v.unclassified === 0);
}
{
  const offeredNone = fakeSeed({ seed: 42161, inviteAccepts: [] });
  const v = verdicts([offeredNone, offeredNone, offeredNone, offeredNone]);
  check('(d) synthetic Q5 census: menus offered, 0 accepts -> INSUFFICIENT-DATA (r78 revision)',
    v.q5 === 'INSUFFICIENT-DATA' && v.totalMenus === 4 && v.totalAccepts === 0);
}
{
  const noneOffered = fakeSeed({ seed: 42161, inviteMenus: [], inviteAccepts: [] });
  const v = verdicts([noneOffered, noneOffered, noneOffered, noneOffered]);
  check('(d) synthetic Q5 census: no menus offered -> INSUFFICIENT-DATA',
    v.q5 === 'INSUFFICIENT-DATA' && v.totalMenus === 0);
}
{
  const emptyOutcome = fakeSeed({ seed: 42161, inviteAccepts: [{ day: 45, vid: 'v1', trust: 90, outcomeLine: '' }] });
  const v = verdicts([emptyOutcome, emptyOutcome, emptyOutcome, emptyOutcome]);
  check('(d) synthetic Q5 census: accept with empty outcome -> FAIL (unclassified)',
    v.q5 === 'FAIL' && v.unclassified === 4);
}
{
  const offered = fakeSeed({ seed: 42191, offeredSkillSittings: [{ offeredLearn: ['armor_craft'], offeredTeach: [] }] });
  const v = verdicts([offered, fakeSeed({ seed: 42192 }), fakeSeed({ seed: 42193 }), fakeSeed({ seed: 42194 })]);
  check('(d) synthetic Q1c binding: >=1 armor offer -> PASS', v.q1c === 'PASS');
  check('(d) synthetic Q1c rate: 1 offer over 10 sittings -> 0.100, pooled 13/70', Math.abs(v.q1cRate - 0.1) < 1e-9 && v.totalSittings === 10 && v.pooledSittings === 70 && v.pooledOffers === 13);
}
{
  const v = verdicts([fakeSeed({ seed: 42191 }), fakeSeed({ seed: 42192 }), fakeSeed({ seed: 42193 }), fakeSeed({ seed: 42194 })]);
  check('(d) synthetic Q1c binding: 0 offers + 0 lessons -> FAIL', v.q1c === 'FAIL');
  check('(d) synthetic Q1c rate: 0 offers over 12 sittings -> 0.000, pooled 12/72', v.q1cRate === 0 && v.totalSittings === 12 && v.pooledSittings === 72 && v.pooledOffers === 12);
}
{
  const v = verdicts([fakeSeed({ seed: 42231 }), fakeSeed({ seed: 42232 }), fakeSeed({ seed: 42233 }), fakeSeed({ seed: 42234 })]);
  check('(d) synthetic Q6 favor totals: 1 offer + 1 deliver per seed -> 4/4',
    v.totalFavorOffers === 4 && v.totalFavorDelivers === 4);
}
{
  const none = fakeSeed({ seed: 42231, favorOffers: [], favorDelivers: [] });
  const v = verdicts([none, none, none, none]);
  check('(d) synthetic Q6 favor totals: 0 offers + 0 delivers -> 0/0',
    v.totalFavorOffers === 0 && v.totalFavorDelivers === 0);
}
{
  const taught = fakeSeed({ seed: 42231, teachLessons: [{ skill: 'bark_armor', result: 'learned', via: 'conversation' }], teachArmPicks: [{ day: 45, vid: 'v1', kind: 'pivot', choice: 'dlg:subject' }, { day: 45, vid: 'v1', kind: 'pick', choice: 'skill_teach:bark_armor', outcomeLine: 'lesson line' }] });
  const v = verdicts([taught, fakeSeed({ seed: 42232 }), fakeSeed({ seed: 42233 }), fakeSeed({ seed: 42234 })]);
  check('(d) synthetic Q7: 1 armor lesson learned + arm pick -> PASS, picks 1, pivots 1',
    v.q7 === 'PASS' && v.totalArmorLessonsLearned === 1 && v.totalTeachArmPicks === 1 && v.totalTeachArmPivots === 1);
}
{
  const offeredOnly = fakeSeed({ seed: 42231, offeredSkillSittings: [{ offeredLearn: [], offeredTeach: ['skill_teach:bark_armor'] }] });
  const v = verdicts([offeredOnly, fakeSeed({ seed: 42232 }), fakeSeed({ seed: 42233 }), fakeSeed({ seed: 42234 })]);
  check('(d) synthetic Q7: offers but 0 lessons learned -> FAIL while Q1c PASS (r82 shape)',
    v.q7 === 'FAIL' && v.q1c === 'PASS' && v.totalArmorLessonsLearned === 0);
}
{
  const reqd = fakeSeed({ seed: 42231, favorReqReads: [{ day: 45, vid: 'v1', turn: 3, favorKind: 'food_share', outcomeLine: 'You need edible food in your pack.' }] });
  const v = verdicts([reqd, fakeSeed({ seed: 42232 }), fakeSeed({ seed: 42233 }), fakeSeed({ seed: 42234 })]);
  check('(d) synthetic Q6 requirements: 1 read -> total 1, kind + outcome carried',
    v.totalFavorReqReads === 1 && v.per[0].favorReqReads[0].favorKind === 'food_share' && v.per[0].favorReqReads[0].outcome.indexOf('edible') >= 0);
}
{
  const w4 = fakeSeed({ seed: 42231, fightsByWave: { 2: 1, 3: 2, 4: 2 }, w4fights: [
    { day: 70, result: 'won', rounds: 9, endHp: [{ kind: 'villager' }, { kind: 'player' }], monsters: [{ mid: 'herald' }] },
    { day: 72, result: 'fled', rounds: 3, endHp: [{ kind: 'player' }], monsters: [{ mid: 'herald' }] },
  ] });
  const v = verdicts([w4, fakeSeed({ seed: 42232 }), fakeSeed({ seed: 42233 }), fakeSeed({ seed: 42234 })]);
  check('(d) synthetic Q2b: 2 wave-4 fights, 1 kill, detail carried',
    v.totalW4 === 2 && v.totalW4kills === 1 && v.per[0].w4detail.length === 2 && v.per[0].w4detail[0].villagers === 1);
}
{
  const paged = fakeSeed({ seed: 42231, teachLessons: [{ skill: 'bark_armor', result: 'learned', via: 'conversation' }], teachArmPicks: [{ day: 45, vid: 'v1', kind: 'pivot', choice: 'dlg:subject' }, { day: 45, vid: 'v1', kind: 'page', choice: 'menu:more', pageSteps: 1 }, { day: 45, vid: 'v1', kind: 'page', choice: 'menu:more', pageSteps: 2 }, { day: 45, vid: 'v1', kind: 'pick', choice: 'skill_learn:bark_armor', outcomeLine: 'lesson line' }] });
  const v = verdicts([paged, fakeSeed({ seed: 42232 }), fakeSeed({ seed: 42233 }), fakeSeed({ seed: 42234 })]);
  check('(d) synthetic Q7 teach-page: pivot + 2 page steps + pick -> PASS, pages 2, picks 1',
    v.q7 === 'PASS' && v.totalTeachArmPages === 2 && v.totalTeachArmPicks === 1 && v.totalTeachArmPivots === 1);
}
{
  const { classifyInviteOpen } = require('./analyze-journey-deepening-r85-20261102.js');
  check('(d) Q8 classifier covers every route class + malformed -> undetermined',
    classifyInviteOpen({ day: 80, vid: 'v1', lessonTaken: true }) === 'lesson-via-route' &&
    classifyInviteOpen({ day: 80, vid: 'v1', secondAccept: true, steerableAfter: true }) === 'accepted-then-steerable' &&
    classifyInviteOpen({ day: 80, vid: 'v1', firstAccept: true, endedAfterAccept: true }) === 'accepted-then-ended' &&
    classifyInviteOpen({ day: 80, vid: 'v1', secondAccept: true }) === 'accepted-no-steer' &&
    classifyInviteOpen({ day: 80, vid: 'v1', trust: 30 }) === 'trust-blocked' &&
    classifyInviteOpen({ day: 80, vid: 'v1', trust: 90 }) === 'left-unaccepted' &&
    classifyInviteOpen({}) === 'undetermined' && classifyInviteOpen(null) === 'undetermined');
}
{
  const io = fakeSeed({ seed: 42241, inviteOpenArmor: [
    { day: 80, vid: 'v1', trust: 90, secondAccept: true, steerableAfter: true, lessonTaken: true, lessonChoice: 'skill_learn:hide_armor' },
    { day: 60, vid: 'v2', trust: 20 },
  ], inviteAccepts: [{ day: 80, vid: 'v1', trust: 90, outcomeLine: 'walk', second: true }] });
  const v = verdicts([io, fakeSeed({ seed: 42242 }), fakeSeed({ seed: 42243 }), fakeSeed({ seed: 42244 })]);
  check('(d) synthetic Q8: mixed classified sittings -> PASS, lesson via route 1, second accepts 1',
    v.q8 === 'PASS' && v.inviteOpen.length === 2 && v.q8LessonsViaRoute === 1 && v.totalSecondAccepts === 1 &&
    v.inviteOpenClasses['lesson-via-route'] === 1 && v.inviteOpenClasses['trust-blocked'] === 1);
}
{
  const v = verdicts([fakeSeed({ seed: 42241 }), fakeSeed({ seed: 42242 }), fakeSeed({ seed: 42243 }), fakeSeed({ seed: 42244 })]);
  check('(d) synthetic Q8: 0 invite-open armor sittings -> NO-DATA (not FAIL)',
    v.q8 === 'NO-DATA' && v.inviteOpen.length === 0);
}
{
  const bad = fakeSeed({ seed: 42241, inviteOpenArmor: [{ trust: 90 }] });
  const v = verdicts([bad, fakeSeed({ seed: 42242 }), fakeSeed({ seed: 42243 }), fakeSeed({ seed: 42244 })]);
  check('(d) synthetic Q8: malformed record -> FAIL (loud instrument failure)',
    v.q8 === 'FAIL' && v.inviteOpenClasses['undetermined'] === 1);
}
if (fail) { console.log(`RESULT: ${fail} FAILURES`); process.exit(1); }
console.log('RESULT: ALL PASS');
