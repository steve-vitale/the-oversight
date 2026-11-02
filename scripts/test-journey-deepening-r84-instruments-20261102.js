// journey-deepening-r84-20261102 proof: r83 proof with ONLY renames (r84 filenames, seed band 42231-42234, INVITE84/FAVOR84/TEACH84/REQ84 markers) PLUS (a6) TEACH84/REQ84 arm checks + (a9) TEACH-PAGE arm checks + REQ-before-TEACH order + (e) Q7 teach-page / requirements / wave-4-detail analyzer checks + Q7 fixtures. PRE-REGISTERED: hidden_files/evidence/2026-11-02/journey-deepening-r84-prereg.md
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
const DRIVER = path.join(__dirname, 'journey-deepening-r84-20261102.js');
const DRIVER82 = path.join(__dirname, 'journey-deepening-r83-20261101.js');
const ANALYZER = path.join(__dirname, 'analyze-journey-deepening-r84-20261102.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
const src82 = fs.readFileSync(DRIVER82, 'utf8');
const ana = fs.readFileSync(ANALYZER, 'utf8');
check('(a) driver contains census wraps + r84 outputs + r84 prereg + INVITE arm',
  src.includes('function wrapTeachCensus(G, ctx, dayFn)') &&
  src.includes('journey-deepening-r84-seed${seed}.json') && src.includes('journey-deepening-r84-transcript-') &&
  src.includes('offeredSkillTurns') && src.includes('gateWhy') &&
  src.includes('function subjectPivotPick(') && src.includes('function pagerPick(') &&
  src.includes('journey-deepening-r84-prereg.md') &&
  src.includes('INVITE_ACCEPT') && src.includes('inviteMenus') && src.includes('inviteAccepts') && src.includes('FAVOR_DELIVER') && src.includes('favorOffers') && src.includes('favorDelivers') && src.includes('_favorDeliverSpent') &&
  src.includes("trust: _trustV") && src.includes('_inviteAcceptSpent'));
check('(a4) r78 accept gate is any-turn (no turn===0 gate) + INVITE84 marker',
  !src.includes('INVITE_ACCEPT && !_inviteAcceptSpent && turn === 0') && src.includes('INVITE84') && src.includes('ANY turn'));
check('(a5) FAVOR_DELIVER arm: any-turn dlg:favor_action, once/seed, outcome fill',
  src.includes("FAVOR_DELIVER && !_favorDeliverSpent") && src.includes("x.id === 'dlg:favor_action'") && src.includes("_favRec") && src.includes('FAVOR84') && !src.includes('FAVOR_DELIVER && !_favorDeliverSpent && turn === 0'));
check('(a3) no r83 output filenames left',
  !src.includes('journey-deepening-r83-seed') && !src.includes('journey-deepening-r83-transcript-'));
check('(a6) TEACH84 arm: armor-sitting gate + learn-preferred armor pick + subject pivot cap + outcome fill',
  src.includes('TEACH_ARMOR') && src.includes('_sittingArmorOffered') && src.includes('TEACH84') &&
  src.includes("x.id.indexOf('bark_armor')") && src.includes('_teachArmPivots < 3') &&
  src.includes("x.id === 'dlg:subject'") && src.includes('_teachArmPicks') && src.includes('_teachRec'));
check('(a7) REQ84 arm: once/sitting dlg:favor_requirements pick + outcome fill',
  src.includes('FAVOR_REQ') && src.includes('_favorReqRead') && src.includes('REQ84') &&
  src.includes("x.id === 'dlg:favor_requirements'") && src.includes('_favorReqReads') && src.includes('_reqRec'));
check('(a8) w4fights detail projection in driver output',
  src.includes('w4fights') && src.includes('w4killsByType') && src.includes('teachArmPicks: _teachArmPicks') && src.includes('favorReqReads: _favorReqReads'));
check('(a9) TEACH-PAGE arm: menu:more walk after first pivot, cycle-detected, cap 8, page records',
  src.includes('TEACHPAGE84') && src.includes('_teachPageSteps') && src.includes('_teachPageSeen') &&
  src.includes("x.id === 'menu:more'") && src.includes('_teachPageSteps < 8') &&
  src.includes("kind: 'page'") && src.includes('_teachArmPivots === 0'));
check('(a10) REQ-before-TEACH order: requirements block precedes teach-page block',
  src.indexOf('FAVOR-REQUIREMENTS ARM') >= 0 && src.indexOf('TEACH-PAGE ARM') >= 0 &&
  src.indexOf('FAVOR-REQUIREMENTS ARM') < src.indexOf('TEACH-PAGE ARM'));
const slice = (s, from, to) => {
  const a = s.indexOf(from);
  if (a < 0) return null;
  const b = to ? s.indexOf(to, a + from.length) : s.length;
  if (b < 0) return null;
  return s.slice(a, b);
};
check('(b) pickChoice byte-identical to r83',
  slice(src, 'function pickChoice(', '\nconst CONVO_DAYS') === slice(src82, 'function pickChoice(', '\nconst CONVO_DAYS'));
check('(b) subjectPivotPick byte-identical to r83',
  slice(src, 'function subjectPivotPick(', 'function pagerPick(') === slice(src82, 'function subjectPivotPick(', 'function pagerPick('));
check('(b) pagerPick byte-identical to r83',
  slice(src, 'function pagerPick(', 'function pickChoice(') === slice(src82, 'function pagerPick(', 'function pickChoice('));
check('(e) analyzer reports Q1c RATE + wave-4 totals + favor transitions + Q7 teach-page + page tallies + requirements + w4 detail',
  ana.includes('Q1c CRAFT-CHANNEL RATE') && ana.includes('q1cRate') && ana.includes('pooledSittings') && ana.includes('totalW4') && ana.includes('favorTransitionCounts') && ana.includes('Q2b WAVE-4 WALL') &&
  ana.includes('Q7 TEACH-PAGE') && ana.includes('totalArmorLessonsLearned') && ana.includes('totalTeachArmPages') && ana.includes('totalFavorReqReads') && ana.includes('w4detail') && ana.includes('totalW4kills'));
check('(c) analyzer reads r84 JSONs + Q1a/Q1b/Q2/Q3/Q5-LURE-CENSUS',
  ana.includes('journey-deepening-r84-seed') && ana.includes('Q1a MADE') && ana.includes('Q1c CRAFT-CHANNEL') && ana.includes('BINDING r84') && ana.includes('q1c') && ana.includes('Q1b WORN') && ana.includes('totalFavorOffers') && ana.includes('Q6 FAVOR-DELIVER') &&
  ana.includes('Q2 WAVE2-3 FIGHTS') && ana.includes('Q3 REGIONAL') && ana.includes('Q5 LURE-OUTCOME CENSUS') &&
  ana.includes('TOTAL r84:') && !ana.includes('journey-deepening-r80-seed'));
const { verdicts } = require('./analyze-journey-deepening-r84-20261102.js');
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
  check('(d) synthetic Q1c rate: 1 offer over 10 sittings -> 0.100, pooled 11/58', Math.abs(v.q1cRate - 0.1) < 1e-9 && v.totalSittings === 10 && v.pooledSittings === 58 && v.pooledOffers === 11);
}
{
  const v = verdicts([fakeSeed({ seed: 42191 }), fakeSeed({ seed: 42192 }), fakeSeed({ seed: 42193 }), fakeSeed({ seed: 42194 })]);
  check('(d) synthetic Q1c binding: 0 offers + 0 lessons -> FAIL', v.q1c === 'FAIL');
  check('(d) synthetic Q1c rate: 0 offers over 12 sittings -> 0.000, pooled 10/60', v.q1cRate === 0 && v.totalSittings === 12 && v.pooledSittings === 60 && v.pooledOffers === 10);
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
if (fail) { console.log(`RESULT: ${fail} FAILURES`); process.exit(1); }
console.log('RESULT: ALL PASS');
