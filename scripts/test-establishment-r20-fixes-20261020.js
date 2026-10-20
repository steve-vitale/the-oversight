#!/usr/bin/env node
// test-establishment-r20-fixes-20261020.js — proof tests for the two
// establishment-leg (r20) closeout fixes.
//
// FIX 1 (game.js villagerCompetence 'cook'): preserver specialists
//   (fisherman/smoker — specialistSkill('preserver') >= 2) were invisible to
//   the assignment UI's competence signal, so competent staffing never routed
//   them to the smoke racks (r20 M2: 0/61 smoke events at specialist rate).
//   Now they earn the ⭐ natural tag at 1.3 (below a true cook's 1.4).
// FIX 2 (game.js cook branch racks-full note): the cook resolves ~3x/day and
//   the identical "racks are already full" line fired per resolution
//   (r20 seed 61 day 25: 3x identical). Now voiced once per cook-day
//   (FOODVOICE2 pattern); the fullness is still computed every resolution.
//
// Method: extract the REAL function sources from the worktree (NEW) and from
// `git show HEAD:src/js/game.js` (OLD — HEAD predates the uncommitted fixes),
// eval them with controlled fixtures, and assert the before/after delta.
// No copies of the logic: the assertions run the actual shipped code.
//
// Usage: node scripts/test-establishment-r20-fixes-20261020.js
'use strict';
const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NEW_GAME = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
const OLD_GAME = cp.execSync('git show HEAD:src/js/game.js', { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString();
const FOOD = fs.readFileSync(path.join(ROOT, 'src/js/food.js'), 'utf8');

let failures = 0;
function eq(actual, expected, label) {
  if (actual === expected) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}

// ---- source extraction (brace-balanced) ----
function extractBlock(src, startMarker) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error('marker not found: ' + startMarker);
  const open = src.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (depth === 0) return src.slice(open, j + 1); }
  }
  throw new Error('unbalanced braces after: ' + startMarker);
}

// real specialistSkill + SPECIALTIES from food.js
const specialtiesSrc = extractBlock(FOOD, 'const SPECIALTIES =');
const specMethodSrc = extractBlock(FOOD, 'specialistSkill(person, task)');
const specialistSkill = new Function(
  `const SPECIALTIES = ${specialtiesSrc};\nreturn function specialistSkill(person, task) ${specMethodSrc};`
)();

// real villagerCompetence, old and new
function competenceFrom(gameSrc) {
  const body = extractBlock(gameSrc, 'villagerCompetence(vid, task)');
  const fn = new Function(`return function villagerCompetence(vid, task) ${body};`)();
  return fn;
}
const compNew = competenceFrom(NEW_GAME);
const compOld = competenceFrom(OLD_GAME);

function fakeCtx(villagers) {
  return {
    data: { villagers, background_survivors: [] },
    specialistSkill,
  };
}
function person(id, occ) {
  return { id, formerOccupation: occ, personality: { temperament: 'steady' } };
}

console.log('FIX 1 — preserver recognized on cook duty (real villagerCompetence, OLD vs NEW)');
{
  const villagers = [
    person('v_fish', 'fisherman'),
    person('v_truck', 'truck driver'),
    person('v_chef', 'chef'),
    person('v_farmer', 'farmer'),
    person('v_ranger', 'park ranger'),
    person('v_linecook', 'line cook'),
  ];
  const ctx = fakeCtx(villagers);
  const cases = [
    ['v_fish', 1.3, 1.0, 'fisherman (preserver 3)'],
    ['v_truck', 1.0, 1.0, 'truck driver (no skill)'],
    ['v_chef', 1.4, 1.4, 'chef (cook 3, keeps 1.4 priority)'],
    ['v_farmer', 1.2, 1.2, 'farmer (unchanged 1.2)'],
    ['v_ranger', 1.0, 1.0, 'park ranger (preserver 1 — below threshold)'],
    ['v_linecook', 1.4, 1.4, 'line cook (keyword match unchanged)'],
  ];
  for (const [vid, wantNew, wantOld, label] of cases) {
    eq(compNew.call(ctx, vid, 'cook'), wantNew, `NEW ${label} -> ${wantNew}`);
    eq(compOld.call(ctx, vid, 'cook'), wantOld, `OLD ${label} -> ${wantOld}`);
  }
  // UI tag mapping (app.js): >= 1.3 = '⭐ natural'
  eq(compNew.call(ctx, 'v_fish', 'cook') >= 1.3, true, 'fisherman earns the ⭐ natural tag');
}

// ---- FIX 2: racks-full voice gate, real resolveOneAssignment ----
function resolveFrom(gameSrc) {
  const body = extractBlock(gameSrc, '\n    resolveOneAssignment(vid, a) {');
  return new Function(`return function resolveOneAssignment(vid, a) ${body};`)();
}

console.log('FIX 2 — racks-full voice gated per cook-day (real resolveOneAssignment, OLD vs NEW)');
for (const [tag, gameSrc] of [['NEW', NEW_GAME], ['OLD', OLD_GAME]]) {
  const resolveOneAssignment = resolveFrom(gameSrc);
  const DAY = { day: 20 };
  const sayLines = [];
  const vid = 'v_cook';
  const villagers = [person(vid, 'truck driver')];
  const pantry = [
    // racks already full: preserved kcal >= 125 * roster(10) * (15-2) = 16250
    { name: 'smoked fish', foodState: 'preserved', kcalEach: 2000, units: 10 },
    // about-to-rot eligible surplus (spoilDay = day+1)
    { name: 'fresh trout', foodState: 'raw', kcalEach: 500, units: 4, spoilDay: 21 },
  ];
  const ctx = {
    data: { villagers, background_survivors: [] },
    specialistSkill,
    state: {
      scholar: { day: DAY.day },
      village: { roster: ['p0','p1','p2','p3','p4','p5','p6','p7','p8', vid], pantry, trust: {}, assignments: {} },
    },
    villagerId: 'player',
    displayName: () => 'Angelo',
    villagerCompetence: compNew,
    trustTaskMult: () => 1,
    havenRoleCredit: () => 400,
    getPerson: (id) => villagers.find(v => v.id === id) || {},
    isKeepsake: () => false,
    isSpoiled: () => false,
    creditDeed: () => {},
    bumpTrust: () => {},
    remember: () => {},
    say: (l) => sayLines.push(String(l)),
  };
  const racksFullCount = () => sayLines.filter(l => l.includes('racks are already full')).length;
  // 3 resolutions, same day (the cook resolves ~3x/day)
  for (let i = 0; i < 3; i++) resolveOneAssignment.call(ctx, vid, { task: 'cook' });
  const afterDay1 = racksFullCount();
  // next day: one more resolution — the gate must reset
  ctx.state.scholar.day = 21;
  resolveOneAssignment.call(ctx, vid, { task: 'cook' });
  const afterDay2 = racksFullCount();
  if (tag === 'NEW') {
    eq(afterDay1, 1, 'NEW: 3 same-day resolutions -> 1 racks-full line');
    eq(afterDay2, 2, 'NEW: next day voices once more (gate resets daily)');
  } else {
    eq(afterDay1, 3, 'OLD: 3 same-day resolutions -> 3 identical lines (the bug)');
    eq(afterDay2, 4, 'OLD: next day adds a 4th');
  }
  // sanity: the cook still smoked nothing and the pantry is untouched by the gate
  eq(pantry.filter(i => i.foodState === 'preserved').length >= 1, true, `${tag}: preserved stock still counted`);
}

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
