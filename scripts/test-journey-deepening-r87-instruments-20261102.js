// test-journey-deepening-r87-instruments-20261102.js -- PROOF TEST for the
// r87 deepening instruments (driver-only, zero src/js). Static marker checks
// on the driver + analyzer verdict fixtures on synthetic seed objects.
// Usage: node scripts/test-journey-deepening-r87-instruments-20261102.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r87-20261102.js');
const ANALYZER = path.join(__dirname, 'analyze-journey-deepening-r87-20261102.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
check('(a) driver carries r87 ship wraps + outputs + prereg',
  src.includes('shipFights') && src.includes('shipLoot') && src.includes('shipAmmo') &&
  src.includes('shipLessons') && src.includes('shipApplicants') && src.includes('shipArrivals') &&
  src.includes('shipDeadChecks') && src.includes('shipWrapErrors') &&
  src.includes('rollAlienLoot') && src.includes('villagerAmmoCraftDay') &&
  src.includes('teachSkill') && src.includes('genApplicant') && src.includes('arrivalTick') &&
  src.includes('journey-deepening-r87-seed${seed}.json') &&
  src.includes('journey-deepening-r87-transcript-') &&
  src.includes('journey-deepening-r87-prereg.md') &&
  src.includes('(Committed)') && src.includes('CANNOT resist') &&
  src.includes('fleeClass') && src.includes('veteran') && src.includes('tier4Chance') &&
  src.includes('shipAmmoOpp'));
check('(a3) no r40 output filenames left',
  !src.includes('journey-deepening-r40-seed') && !src.includes('journey-deepening-r40-transcript-'));
check('(a4) seeds 93001-93004 + EVIDIR 2026-11-02',
  src.includes('[93001, 93002, 93003, 93004]') && src.includes("'evidence', '2026-11-02'"));
check('(a5) lure flag recorded on fight records',
  src.includes('lureLines') && src.includes("indexOf('CANNOT resist')"));
const anaSrc = fs.readFileSync(ANALYZER, 'utf8');
check('(b) analyzer exports verdicts + reads r87 seed JSONs',
  anaSrc.includes('module.exports = { verdicts }') && anaSrc.includes('journey-deepening-r87-seed'));
const { verdicts } = require(ANALYZER);
const mkSeed = (seed, ship, extra) => Object.assign({
  seed, endReason: 'daycap', maxGameDay: 100, finalWave: 3,
  census: [{ alive: true }, { alive: true }], deathHonesty: { mislabels: [] },
  convoFiles: ['t1', 't2', 't3'],
}, extra || {}, { ship });
const allPass = verdicts([
  mkSeed(93001, {
    fights: [{ outcome: 'vKill', mid: 'a', wave: 2, fleeKind: false, committedLines: 2, lureLines: 0 },
             { outcome: 'mFlee', mid: 'lockpick_raccoon', wave: 1, fleeKind: true, committedLines: 0, lureLines: 0, fleeClass: 'driveoff' },
             { outcome: 'mFlee', mid: 'redactor', wave: 3, fleeKind: false, committedLines: 0, lureLines: 0, fleeClass: 'trick' }],
    loot: [{ wave: 2, baseTier: 2, grantedTier: 3, grantedId: 'x', rewardSource: false, apex: false, veteran: false, tier4Chance: 0 }],
    ammo: [{ day: 50, made: 1 }], ammoCalls: 12, ammoOpp: [],
    lessons: [{ teacher: 't', learner: 'l', skill: 's1', ok: true }, { teacher: 't', learner: 'l2', skill: 's2', ok: true }],
    applicants: [{ id: 'app_1', dead: false }], arrivals: [],
    deadChecks: [{ day: 50, rosterN: 8, deadN: 1, deadInNpcIds: [] }], wrapErrors: [],
  }),
]);
check('(c) all-pass fixture: SH1/SH2/SH3/SH4/SH5 GO',
  allPass.verdicts.SH1_commitment === 'GO' && allPass.verdicts.SH2_taper === 'GO' &&
  allPass.verdicts.SH3_arrows === 'GO' && allPass.verdicts.SH4_deadExclusion === 'GO' &&
  allPass.verdicts.SH5_lessons === 'GO' &&
  allPass.pooled.upShifts.length === 1 && allPass.pooled.multiTeachers === 1,
  JSON.stringify(allPass.verdicts));
const viol = verdicts([
  mkSeed(93001, {
    fights: [{ outcome: 'mFlee', mid: 'highbeam_deer', wave: 1, fleeKind: false, committedLines: 0, lureLines: 0, fleeClass: 'contact' }],
    loot: [], ammo: [], ammoCalls: 0, lessons: [], applicants: [], arrivals: [],
    deadChecks: [{ day: 50, rosterN: 8, deadN: 1, deadInNpcIds: ['dead_1'] }], wrapErrors: [],
  }),
]);
check('(d) violation fixture: SH1 NO-GO + SH4 NO-GO, lure not counted',
  viol.verdicts.SH1_commitment === 'NO-GO' && viol.verdicts.SH4_deadExclusion === 'NO-GO' &&
  viol.pooled.mFleeViolations.length === 1, JSON.stringify(viol.verdicts));
const lureOnly = verdicts([
  mkSeed(93001, {
    fights: [{ outcome: 'mFlee', mid: 'hushpuppy', wave: 1, fleeKind: false, committedLines: 0, lureLines: 1, fleeClass: 'lure' }],
    loot: [], ammo: [], ammoCalls: 5, lessons: [{ teacher: 't', learner: 'l', skill: 's', ok: true }],
    applicants: [], arrivals: [],
    deadChecks: [{ day: 50, rosterN: 8, deadN: 0, deadInNpcIds: [] }], wrapErrors: [],
  }),
]);
check('(e) lure-only fixture: SH1 GO, lure counted separately',
  lureOnly.verdicts.SH1_commitment === 'GO' && lureOnly.pooled.mFleeLure.length === 1 &&
  lureOnly.pooled.mFleeViolations.length === 0, JSON.stringify(lureOnly.verdicts));
const noData = verdicts([
  mkSeed(93001, {
    fights: [], loot: [], ammo: [], ammoCalls: 0, lessons: [],
    applicants: [], arrivals: [], deadChecks: [], wrapErrors: [],
  }, { census: [{ alive: false }], convoFiles: [] }),
]);
check('(f) no-data fixture: SH1/SH2 NO-DATA, M5 NO-GO',
  noData.verdicts.SH1_commitment === 'NO-DATA' && noData.verdicts.SH2_taper === 'NO-DATA' &&
  noData.verdicts.M5_winnable === 'NO-GO', JSON.stringify(noData.verdicts));
const w1cap = verdicts([
  mkSeed(93001, {
    fights: [{ outcome: 'vKill', mid: 'a', wave: 1, fleeKind: false, committedLines: 0, lureLines: 0 }],
    loot: [{ wave: 1, baseTier: 1, grantedTier: 3, grantedId: 'x', rewardSource: false, apex: false, veteran: false, tier4Chance: 0 }],
    ammo: [], ammoCalls: 0, lessons: [], applicants: [], arrivals: [],
    deadChecks: [], wrapErrors: [],
  }),
]);
check('(g) wave-1 cap fixture: SH2 NO-GO on tier-3 wave-1 grant',
  w1cap.verdicts.SH2_taper === 'NO-GO' && w1cap.pooled.w1CapViolations.length === 1,
  JSON.stringify(w1cap.verdicts));
const vetLegal = verdicts([
  mkSeed(93001, {
    fights: [{ outcome: 'vKill', mid: 'a', wave: 1, fleeKind: false, committedLines: 0, lureLines: 0, fleeClass: null }],
    loot: [{ wave: 1, baseTier: 2, grantedTier: 3, grantedId: 'x', rewardSource: false, apex: false, veteran: true, tier4Chance: 0 },
           { wave: 2, baseTier: 2, grantedTier: 2, grantedId: 'y', rewardSource: false, apex: false, veteran: false, tier4Chance: 0 }],
    ammo: [], ammoCalls: 0, ammoOpp: [], lessons: [], applicants: [], arrivals: [],
    deadChecks: [], wrapErrors: [],
  }),
]);
check('(h) veteran wave-1 tier-3 grant is legal: SH2 GO, w1Viol 0',
  vetLegal.verdicts.SH2_taper === 'GO' && vetLegal.pooled.w1CapViolations.length === 0,
  JSON.stringify(vetLegal.verdicts));
const oppMiss = verdicts([
  mkSeed(93001, {
    fights: [{ outcome: 'vKill', mid: 'a', wave: 2, fleeKind: false, committedLines: 0, lureLines: 0, fleeClass: null }],
    loot: [], ammo: [], ammoCalls: 50, ammoOpp: [{ day: 50, opps: [{ vid: 'v', weapon: 'bow', ammo: 'arrow', carried: 2 }] }],
    lessons: [], applicants: [], arrivals: [], deadChecks: [], wrapErrors: [],
  }),
]);
check('(i) ammo opportunity without batch: SH3 NO-GO*',
  oppMiss.verdicts.SH3_arrows === 'NO-GO*' && oppMiss.pooled.ammoOppTotal === 1,
  JSON.stringify(oppMiss.verdicts));
console.log(fail === 0 ? 'ALL PASS' : fail + ' FAILURES');
process.exit(fail === 0 ? 0 : 1);
