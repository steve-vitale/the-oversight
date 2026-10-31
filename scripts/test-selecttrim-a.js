#!/usr/bin/env node
// test-selecttrim-a.js — proof for sim-selecttrim-a.
// Pure gate tests + corpus checks on the four judged legs
// (control/trim x guard/on, seed 15215) + determinism +
// no-tracked-file-modified guard. Exits non-zero on failure.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { trimDecision, thirstHomeWouldFire, leverOn } = require('./policies/selecttrim-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(name, a, b) { check(name, JSON.stringify(a) === JSON.stringify(b), { got: a, want: b }); }

// ---- Pure gate tests ----
const base = { gameOver: false, combatLive: false, insideTent: false, wakeTileType: 'creek',
  insideHaven: false, morningDayTicks: 384, isRecovering: false, needsTrip: true, thirstHome: false };
eq('gate fires on canonical trim day', trimDecision(base), { fire: true });
const cases = [
  ['game-over', { gameOver: true }, 'game-over'],
  ['combat', { combatLive: true }, 'combat'],
  ['in-tent', { insideTent: true }, 'in-tent'],
  ['not-creek-wake wetland', { wakeTileType: 'wetland' }, 'not-creek-wake'],
  ['not-creek-wake haven', { wakeTileType: 'haven' }, 'not-creek-wake'],
  ['haven-morning', { insideHaven: true }, 'haven-morning'],
  ['day-not-short 256', { morningDayTicks: 256 }, 'day-not-short'],
  ['day-not-short 383', { morningDayTicks: 383 }, 'day-not-short'],
  ['day-not-short null', { morningDayTicks: null }, 'day-not-short'],
  ['recovering', { isRecovering: true }, 'recovering'],
  ['no-trip-needed', { needsTrip: false }, 'no-trip-needed'],
  ['thirst-home', { thirstHome: true }, 'thirst-home'],
];
for (const [name, over, want] of cases) {
  const got = trimDecision(Object.assign({}, base, over));
  check('gate skip ' + name, got.fire === false && got.skip === want, got);
}
check('gate fires at 384 boundary', trimDecision(base).fire === true);
check('gate fires above 384', trimDecision(Object.assign({}, base, { morningDayTicks: 400 })).fire === true);
check('gate fires with null insideHaven (unknown, not true)', trimDecision(Object.assign({}, base, { insideHaven: null })).fire === true);
check('gate fires with null insideTent (unknown, not true)', trimDecision(Object.assign({}, base, { insideTent: null })).fire === true);

// thirstHomeWouldFire (needs a Game stub)
function fakeGame(hydration, water, atHaven) {
  return { state: { scholar: { hydration, water } },
    playerAtHaven: () => atHaven };
}
check('thirst false when hydrated', thirstHomeWouldFire(fakeGame(45, [], false)) === false);
check('thirst false when hydrated high', thirstHomeWouldFire(fakeGame(90, [], false)) === false);
check('thirst false when water carried', thirstHomeWouldFire(fakeGame(10, [{ id: 1 }], false)) === false);
check('thirst false at haven', thirstHomeWouldFire(fakeGame(10, [], true)) === false);
check('thirst true when low, dry, away', thirstHomeWouldFire(fakeGame(0, [], false)) === true);
check('thirst true at 44', thirstHomeWouldFire(fakeGame(44, [], false)) === true);

// leverOn gating (reads env at call time)
process.env.SELECTTRIM = '1';
check('lever on at 1', leverOn() === true);
process.env.SELECTTRIM = '0';
check('lever off at 0', leverOn() === false);
delete process.env.SELECTTRIM;
check('lever off when unset', leverOn() === false);

// ---- Corpus checks ----
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-31');
function load(leg) {
  return JSON.parse(fs.readFileSync(path.join(BASE, 'sim-selecttrim-a-corpus-' + leg, 'selecttrim-a-nighttravel-s15215.json'), 'utf8'));
}
const legs = {};
for (const leg of ['guard-control', 'guard-trim', 'on-control', 'on-trim']) {
  legs[leg] = load(leg);
  const d = legs[leg];
  check(leg + ' has 30 evenings', d.evenings.length === 30, d.evenings.length);
  check(leg + ' seed 15215', d.seed === 15215, d.seed);
  check(leg + ' survived 30 days', d.daysAlive === 30 && d.endReason === 'survived', d.endReason);
  check(leg + ' errs 0 everywhere', d.woodcarryStore.errs === 0 && d.warmthStore.errs === 0 &&
    d.pressbStore.errs === 0 && d.selecttrimStore.errs === 0,
    [d.woodcarryStore.errs, d.warmthStore.errs, d.pressbStore.errs, d.selecttrimStore.errs]);
}
const census = JSON.parse(fs.readFileSync(path.join(BASE, 'sim-selecttrim-a-census.json'), 'utf8'));
// Control reproduction vs ticks-b control-variant 15215
eq('guard-control presses', census.legs['guard-control'].presses.map((p) => 'd' + p.loopDay + ' E' + p.E), ['d10 E450']);
eq('guard-control ticks-short days', census.legs['guard-control'].ticksShortDays, [7, 10]);
eq('on-control presses', census.legs['on-control'].presses.map((p) => 'd' + p.loopDay + ' E' + p.E),
  ['d10 E540', 'd14 E900', 'd18 E810', 'd22 E990']);
eq('on-control ticks-short days', census.legs['on-control'].ticksShortDays, [7, 13, 18, 22]);
// Trim legs: trims, presses > 0 (hold arm scored 0)
eq('guard-trim trim days', census.legs['guard-trim'].trims, [9, 10, 11]);
eq('on-trim trim days', census.legs['on-trim'].trims, [9, 10, 12, 13, 14]);
check('guard-trim presses > 0', census.legs['guard-trim'].pressCount === 1, census.legs['guard-trim'].pressCount);
eq('guard-trim press list', census.legs['guard-trim'].presses.map((p) => 'd' + p.loopDay + ' E' + p.E), ['d10 E540']);
check('on-trim presses > 0', census.legs['on-trim'].pressCount === 2, census.legs['on-trim'].pressCount);
eq('on-trim press list', census.legs['on-trim'].presses.map((p) => 'd' + p.loopDay + ' E' + p.E), ['d10 E720', 'd14 E900']);
// Walk: the forageTrip return landing matches control on EVERY trim
// day. On still evenings the evening snapshot cell IS the walk end.
// On a rescued control evening the snapshot cell is the haven cell
// AFTER bridge + travel, so the walk end is instead the spy's
// recorded walkHome landing (travelTo back to the creek tile,
// beat walkTo) on that loopDay.
const spyGuard = JSON.parse(fs.readFileSync(path.join(BASE, 'sim-selecttrim-a-spy-guard', 'selecttrim-spy-nighttravel-s15215.json'), 'utf8'));
function spyWalkLanding(spy, loopDay) {
  const calls = (spy.calls || []).filter((c) => c.loopDay === loopDay && c.beat && c.beat.fn === 'walkTo');
  if (!calls.length) return null;
  const last = calls[calls.length - 1];
  return last.after.mx + ',' + last.after.my;
}
for (const [cl, tl] of [['guard-control', 'guard-trim'], ['on-control', 'on-trim']]) {
  for (const td of census.legs[tl].trims) {
    const cDay = census.legs[cl].days[td], tDay = census.legs[tl].days[td];
    if (cDay && cDay.wc && cDay.wc.rescued) {
      const landing = tl === 'guard-trim' ? spyWalkLanding(spyGuard, td) : null;
      check(tl + ' walk landing d' + td + ' (rescued control: spy walkHome landing)',
        landing !== null && tDay && tDay.eveningCell === landing,
        { controlWalkHome: landing, trim: tDay && tDay.eveningCell });
    } else {
      check(tl + ' walk landing d' + td, cDay && tDay && cDay.eveningCell === tDay.eveningCell,
        { control: cDay && cDay.eveningCell, trim: tDay && tDay.eveningCell });
    }
    // Next-morning wake matches wherever the bearer lives (both still
    // stranded next morning OR control rescued/trim successor nuances
    // are reported in the census, not asserted here).
    const cNext = census.legs[cl].days[td + 1], tNext = census.legs[tl].days[td + 1];
    if (cNext && tNext && cNext.wc && cNext.wc.bucket === 'creek' && !cNext.wc.rescued &&
        tNext.wc && tNext.wc.bucket === 'creek') {
      check(tl + ' next-morning wake d' + (td + 1) + ' (both stranded)', cNext.morningCell === tNext.morningCell,
        { control: cNext.morningCell, trim: tNext.morningCell });
    }
  }
}
// Ticks saved per trim day (control routine - trim routine)
const wantSaved = { 'guard-trim': { 9: 3, 10: 1, 11: 1 }, 'on-trim': { 9: 3, 10: 1, 12: 9, 13: 17, 14: 1 } };
for (const [tl, map] of Object.entries(wantSaved)) {
  const cl = tl === 'guard-trim' ? 'guard-control' : 'on-control';
  for (const [day, want] of Object.entries(map)) {
    const got = census.legs[cl].days[day].routineTotal - census.legs[tl].days[day].routineTotal;
    check(tl + ' saved d' + day, got === want, { got, want });
  }
}
// Day 7: no trim fires, still ticks-short on all four legs
for (const leg of ['guard-control', 'guard-trim', 'on-control', 'on-trim']) {
  check(leg + ' day-7 no trim', !census.legs[leg].days[7].trim, census.legs[leg].days[7].trim);
  check(leg + ' day-7 ticks-short', census.legs[leg].ticksShortDays.includes(7), census.legs[leg].ticksShortDays);
}
// Guard d10 hole: 384 + 17 press + 17 trim routine = 418, 2 short (was 3)
check('guard-trim d10 still ticks-short by 2', census.legs['guard-trim'].days[10].decisionTicksLeft === 94,
  census.legs['guard-trim'].days[10].decisionTicksLeft);
check('guard-control d10 ticks-short by 3', census.legs['guard-control'].days[10].decisionTicksLeft === 93,
  census.legs['guard-control'].days[10].decisionTicksLeft);
// Gate-shift + conversions (reported, not judged)
eq('guard gate-shift days', census.pairs.guard.gateShift, [11]);
eq('guard conversions', census.pairs.guard.conversions, []);
eq('on conversions', census.pairs.on.conversions, []);
// Determinism: det re-run byte-identical to judged guard-trim file
const judged = fs.readFileSync(path.join(BASE, 'sim-selecttrim-a-corpus-guard-trim', 'selecttrim-a-nighttravel-s15215.json'), 'utf8');
const det = fs.readFileSync(path.join(BASE, 'sim-selecttrim-a-corpus-det-guard-trim', 'selecttrim-a-nighttravel-s15215.json'), 'utf8');
check('det-guard-trim byte-identical', judged === det);
// No tracked file modified: status shows only new files under my prefixes
const status = execSync('git status --short', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const allowed = ['scripts/policies/selecttrim-diag.js', 'scripts/selecttrim-trace-b.js', 'scripts/selecttrim-spy-b.js',
  'scripts/analyze-selecttrim-a.js', 'scripts/test-selecttrim-a.js'];
let statusOk = true;
for (const line of status) {
  const f = line.slice(3);
  const ok = line.startsWith('?? ') && (allowed.includes(f) || f.startsWith('evidence/2026-10-31/sim-selecttrim-a'));
  if (!ok) { statusOk = false; console.error('STATUS NOT ALLOWED: ' + line); }
}
check('worktree contains only my new files (no tracked modification)', statusOk, status);
const srcDiff = execSync('git diff --name-only HEAD -- src/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
check('src/ diff empty', srcDiff === '', srcDiff);

console.log('test-selecttrim-a: ' + pass + '/' + (pass + fail) + ' checks pass');
if (fail) process.exit(1);
