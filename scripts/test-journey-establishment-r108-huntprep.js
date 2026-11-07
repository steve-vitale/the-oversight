#!/usr/bin/env node
// scripts/test-journey-establishment-r108-huntprep.js — proof for the r108
// instrument: the hunt-staffing wrapper + the HUNT-PREP lesson (HUNTSTAFF=2).
//
// P1 (fixture, no harness): withHuntStaff(competent, 'competent-hunt')
//   gate-off delegates upkeep/daily to competent exactly (spies called,
//   ctx untouched, assignTask never attempted); HUNTSTAFF=1 staffs the
//   eligible hunter once with NO prep (prepLog stays empty — r107 behaviour
//   exactly); HUNTSTAFF=2 staffs WITH the prep: a holder at home teaches
//   the hunter field_dressing before assignTask, the hunter holds it after,
//   the prepLog records ok; no holder / teacher away -> 'no-teacher' and
//   staffing still proceeds. r109 Q2: the 'no-teacher' why splits three
//   ways (teacher-away / teacher-unseeded / no-teacher-anywhere — see
//   classifyNoTeacher in policies/huntstaff.js); kind stays 'no-teacher'.
//   hunter already holds -> 'already-holds', no lesson call; hunter
//   taught at dawn -> 'today', staffing still proceeds.
//   The non-substrate / low-trust / wounded / not-at-Haven / non-lean gates
//   each refuse honestly (no staffing, no prep).
// P2 (harness, short): seed 1502, 5 days — the r108 driver gate-off
//   reproduces the r107 driver (control) exactly on endDay / aliveEnd /
//   pantryKcalEnd + skill_lesson key sets. A third leg (control again)
//   attributes any divergence: control-vs-control divergence is substrate
//   noise (the known contest-ID entropy issue, b4 det-gate pattern), not
//   the wrapper. Runs the real drivers as subprocesses (one harness per
//   process) into /tmp — never into the repo.
// P2b (harness, 20 days): prep-off parity — the r108 driver with
//   HUNTSTAFF=1 reproduces the r107 driver with HUNTSTAFF=1 exactly on
//   seed 1502 (first assignments d15/d19/d20 fall inside 20 days, so the
//   staffing path is exercised with the prep flag off).
// P3 (harness output, same gate-off leg): the r108 driver's native
//   guardrails/c3 keys equal the r106 post-hoc derivation from the same
//   JSON, huntEligEver is present as an array, leanTrace is day-ordered,
//   and huntStaff.prepLog is present as an array (empty is honest gate-off)
//   with prepOn false.
// The panel M0 (42d, pilot seed) is the full det-gate; the b4 proof
// (test-huntstaff-b4.js: 17 pins + 60d det-gate 4/4 + smoke) already
// covers the layer itself and is re-run, not rewritten.
// Usage: node scripts/test-journey-establishment-r108-huntprep.js
'use strict';
const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HS = require('./policies/huntstaff');
const { competent } = require('./policies/competent');

function fakeGame(opts) {
  const o = opts || {};
  const attempts = [];
  const teachCalls = [];
  const G = {
    over: false,
    state: {
      scholar: { day: 5, kcal: o.kcal == null ? 300 : o.kcal },
      village: {
        roster: o.roster || ['v1', 'v2', 'v3'],
        assignments: o.assignments || {},
        health: o.health || { v1: 90, v2: 90, v3: 90 },
        trust: o.trust || { v1: 50, v2: 20, v3: 60 },
        pantry: [],
        away: o.away || {},
        npcSkills: o.npcSkills || {},
        skillLessonDay: o.skillLessonDay || {},
      },
    },
    villagerId: 'scholar',
    playerAtHaven: () => (o.atHaven == null ? true : o.atHaven),
    getPerson: (id) => ({
      v1: { id, name: 'Ruby Roth', dead: false, formerOccupation: 'hunting guide' },
      v2: { id, name: 'Bob Smith', dead: false, formerOccupation: o.teacher ? 'butcher' : 'fishing guide' },
      v3: { id, name: 'Ana Lima', dead: false, formerOccupation: 'accountant' },
    }[id] || null),
    kcalCap: () => 2400,
    pantryFreshDays: () => (o.freshDays == null ? 1.5 : o.freshDays),
    villagerCompetence: () => 1.0,
    assignTask: (vid, task, ao) => {
      attempts.push({ vid, task, via: ao && ao.via });
      G.state.village.assignments[vid] = { task };
      return 'ok';
    },
    // Minimal faithful teachSkill stub: the engine's gates (teacher knows
    // it, learner lacks it, one lesson per learner per day), L1 grant.
    personKnowsSkill: (who, skill) => (((G.state.village.npcSkills || {})[who] || []).indexOf(skill) >= 0),
    npcHasAbility: (vid, id) => (((G.state.village.npcSkills || {})[vid] || []).indexOf(id) >= 0),
    canTeachSkill: (teacher, learner, skill) => {
      const v = G.state.village;
      if (!G.personKnowsSkill(teacher, skill)) return { ok: false, why: 'teacher' };
      if (G.personKnowsSkill(learner, skill)) return { ok: false, why: 'known' };
      if ((v.skillLessonDay || {})[learner] === G.state.scholar.day) return { ok: false, why: 'today' };
      return { ok: true };
    },
    teachSkill: (teacher, learner, skill, tOpts) => {
      teachCalls.push({ teacher, learner, skill, via: (tOpts || {}).via });
      if (!G.canTeachSkill(teacher, learner, skill).ok) return false;
      const v = G.state.village;
      v.npcSkills = v.npcSkills || {};
      (v.npcSkills[learner] = v.npcSkills[learner] || []).push(skill);
      v.skillLessonDay = v.skillLessonDay || {};
      v.skillLessonDay[learner] = G.state.scholar.day;
      return true;
    },
    _attempts: attempts,
    _teachCalls: teachCalls,
  };
  return G;
}

function runP1() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  console.log('PART P1 — wrapper + hunt-prep wiring on the real competent policy');

  // Gate-off: wrapped upkeep/daily delegate to competent's own hooks.
  delete process.env.HUNTSTAFF;
  ok('gate-off delegates upkeep to competent (spy called once)', () => {
    const calls = [];
    const origUp = competent.upkeep, origDaily = competent.daily;
    competent.upkeep = (G, c) => { calls.push('upkeep'); };
    competent.daily = (G, c) => { calls.push('daily'); };
    try {
      const wrapped = HS.withHuntStaff(competent, 'competent-hunt');
      assert.strictEqual(wrapped.id, 'competent-hunt');
      const ctx = {};
      wrapped.upkeep(fakeGame(), ctx);
      wrapped.daily(fakeGame(), ctx);
      assert.deepStrictEqual(calls, ['upkeep', 'daily']);
      assert.deepStrictEqual(ctx, {}); // zero ctx writes gate-off
    } finally { competent.upkeep = origUp; competent.daily = origDaily; }
  });
  ok('gate-off staffHunt never attempts assignTask', () => {
    const G = fakeGame();
    assert.strictEqual(HS.staffHunt(G, {}), null);
    assert.strictEqual(G._attempts.length, 0);
  });

  // HUNTSTAFF=1: layer on, prep OFF — r107 behaviour exactly.
  process.env.HUNTSTAFF = '1';
  ok('HUNTSTAFF=1 staffs the eligible hunter once, with NO prep', () => {
    const G = fakeGame({ teacher: true, npcSkills: { v2: ['field_dressing'] } });
    const ctx = {};
    const fakeBase = { id: 'competent', upkeep: () => {}, daily: () => {} };
    const w2 = HS.withHuntStaff(fakeBase, 'competent-hunt');
    w2.upkeep(G, ctx);
    assert.strictEqual(G._attempts.length, 1);
    assert.strictEqual(G._attempts[0].vid, 'v1');
    assert.strictEqual(G._attempts[0].task, 'hunt');
    assert.strictEqual(ctx._hsAssignments, 1);
    assert.strictEqual(G._teachCalls.length, 0, 'no lesson under HUNTSTAFF=1');
    assert.ok(!ctx._hsPrepLog || ctx._hsPrepLog.length === 0, 'prepLog empty under HUNTSTAFF=1');
    assert.strictEqual(G.personKnowsSkill('v1', 'field_dressing'), false, 'hunter still lacks the skill');
    // second upkeep same day: once-per-day, no second attempt
    w2.upkeep(G, ctx);
    assert.strictEqual(G._attempts.length, 1);
  });
  ok('HUNTSTAFF=1 refusals: non-substrate / low-trust / wounded / away / full pantry', () => {
    const cases = [
      ['all-non-substrate', () => { const G = fakeGame(); G.getPerson = () => ({ id: 'x', name: 'X', dead: false, formerOccupation: 'accountant' }); return G; }],
      ['low-trust hunters', () => fakeGame({ trust: { v1: 20, v2: 20, v3: 60 } })],
      ['wounded hunter', () => fakeGame({ health: { v1: 25, v2: 90, v3: 90 }, trust: { v1: 90, v2: 20, v3: 60 } })],
      ['not at Haven', () => fakeGame({ atHaven: false })],
      ['non-lean day', () => fakeGame({ kcal: 2000, freshDays: 9 })],
    ];
    for (const [name, mk] of cases) {
      const G = mk();
      const ctx = {};
      assert.strictEqual(HS.staffHunt(G, ctx), null, name);
      assert.strictEqual(G._attempts.length, 0, name);
      assert.ok(!ctx._hsPrepLog || ctx._hsPrepLog.length === 0, name + ': no prep on refusal');
    }
  });

  // HUNTSTAFF=2: layer on + prep.
  process.env.HUNTSTAFF = '2';
  ok('HUNTSTAFF=2 teaches the hunter before assigning (holder at home)', () => {
    const G = fakeGame({ teacher: true, npcSkills: { v2: ['field_dressing'] } });
    const ctx = {};
    const vid = HS.staffHunt(G, ctx);
    assert.strictEqual(vid, 'v1');
    assert.strictEqual(G._teachCalls.length, 1, 'one lesson');
    assert.strictEqual(G._teachCalls[0].teacher, 'v2');
    assert.strictEqual(G._teachCalls[0].learner, 'v1');
    assert.strictEqual(G._teachCalls[0].skill, 'field_dressing');
    assert.strictEqual(G._teachCalls[0].via, 'hunt-prep');
    assert.strictEqual(G.personKnowsSkill('v1', 'field_dressing'), true, 'hunter holds it after the prep');
    assert.strictEqual(G._attempts.length, 1, 'staffing still happens');
    assert.strictEqual((ctx._hsPrepLog || []).length, 1);
    const e = ctx._hsPrepLog[0];
    assert.strictEqual(e.kind, 'lesson');
    assert.strictEqual(e.ok, true);
    assert.strictEqual(e.teacher, 'v2');
    assert.strictEqual(e.hunter, 'v1');
  });
  ok('HUNTSTAFF=2 through the wrapped hooks (prep runs inside upkeep)', () => {
    const G = fakeGame({ teacher: true, npcSkills: { v2: ['field_dressing'] } });
    const ctx = {};
    const fakeBase = { id: 'competent', upkeep: () => {}, daily: () => {} };
    const w2 = HS.withHuntStaff(fakeBase, 'competent-hunt');
    w2.upkeep(G, ctx);
    assert.strictEqual(G._teachCalls.length, 1);
    assert.strictEqual(G._attempts.length, 1);
    assert.strictEqual(ctx._hsAssignments, 1);
  });
  ok('HUNTSTAFF=2 no holder at home: no-teacher-anywhere, staffing still proceeds', () => {
    const G = fakeGame(); // v2 is a fishing guide with no field_dressing; v3 an accountant — no holder, no granting occupation
    const ctx = {};
    const vid = HS.staffHunt(G, ctx);
    assert.strictEqual(vid, 'v1');
    assert.strictEqual(G._teachCalls.length, 0);
    assert.strictEqual(G._attempts.length, 1);
    assert.strictEqual((ctx._hsPrepLog || []).length, 1);
    assert.strictEqual(ctx._hsPrepLog[0].kind, 'no-teacher');
    assert.strictEqual(ctx._hsPrepLog[0].why, 'no-teacher-anywhere');
  });
  ok('HUNTSTAFF=2 teacher away: teacher-away (a lesson is in-person work)', () => {
    const G = fakeGame({ teacher: true, npcSkills: { v2: ['field_dressing'] }, away: { v2: true } });
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1');
    assert.strictEqual(G._teachCalls.length, 0);
    assert.strictEqual(ctx._hsPrepLog[0].kind, 'no-teacher');
    assert.strictEqual(ctx._hsPrepLog[0].why, 'teacher-away');
  });
  ok('HUNTSTAFF=2 teacher unseeded: teacher-unseeded (a butcher on the roster, nobody holds it yet)', () => {
    const G = fakeGame({ teacher: true }); // v2 is a butcher (granting occupation) but holds no field_dressing
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1');
    assert.strictEqual(G._teachCalls.length, 0);
    assert.strictEqual(ctx._hsPrepLog[0].kind, 'no-teacher');
    assert.strictEqual(ctx._hsPrepLog[0].why, 'teacher-unseeded');
  });
  ok('classifyNoTeacher direct: the three classes are distinct pure reads', () => {
    const away = fakeGame({ teacher: true, npcSkills: { v2: ['field_dressing'] }, away: { v2: true } });
    assert.strictEqual(HS.classifyNoTeacher(away, 'v1'), 'teacher-away');
    const unseeded = fakeGame({ teacher: true });
    assert.strictEqual(HS.classifyNoTeacher(unseeded, 'v1'), 'teacher-unseeded');
    const nowhere = fakeGame();
    assert.strictEqual(HS.classifyNoTeacher(nowhere, 'v1'), 'no-teacher-anywhere');
    assert.deepStrictEqual([...HS.fieldDressingGrantOccupations(away)].sort(), ['butcher', 'mortician', 'veterinarian']);
  });
  ok('HUNTSTAFF=2 hunter already holds: already-holds, no lesson call', () => {
    const G = fakeGame({ teacher: true, npcSkills: { v1: ['field_dressing'], v2: ['field_dressing'] } });
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1');
    assert.strictEqual(G._teachCalls.length, 0);
    assert.strictEqual(ctx._hsPrepLog[0].kind, 'already-holds');
    assert.strictEqual(G._attempts.length, 1);
  });
  ok('HUNTSTAFF=2 hunter taught at dawn: today, staffing still proceeds', () => {
    const G = fakeGame({ teacher: true, npcSkills: { v2: ['field_dressing'] }, skillLessonDay: { v1: 5 } });
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1');
    assert.strictEqual(G._teachCalls.length, 1, 'the attempt is made');
    assert.strictEqual(G.personKnowsSkill('v1', 'field_dressing'), false, 'lesson refused by the engine');
    assert.strictEqual(ctx._hsPrepLog[0].kind, 'lesson');
    assert.strictEqual(ctx._hsPrepLog[0].ok, false);
    assert.strictEqual(ctx._hsPrepLog[0].why, 'today');
    assert.strictEqual(G._attempts.length, 1, 'the hunt proceeds anyway');
  });
  ok('HUNTSTAFF=2 refusals still refuse honestly (no staffing, no prep)', () => {
    const G = fakeGame({ teacher: true, npcSkills: { v2: ['field_dressing'] }, trust: { v1: 20, v2: 20, v3: 60 } });
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(G._attempts.length, 0);
    assert.strictEqual(G._teachCalls.length, 0);
    assert.ok(!ctx._hsPrepLog || ctx._hsPrepLog.length === 0);
  });
  delete process.env.HUNTSTAFF;
  console.log(`PART P1 green (${n} checks)`);
}

function lessonKeys(j) {
  const out = [];
  for (const t of (j.teleAll || [])) {
    if (t.type !== 'skill_lesson') continue;
    out.push([t.day, String(t.teacher), String(t.skill), String(t.learner)].join('|'));
  }
  return out.sort();
}

function runDriverLeg(tmp, name, script, envExtra, days) {
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir, { recursive: true });
  const env = Object.assign({}, process.env, { SEEDS: '1502', DAYS: String(days), EVID: dir }, envExtra);
  console.log(`  running ${name} (${script}, ${days}d, HUNTSTAFF=${env.HUNTSTAFF || 'unset'})...`);
  execSync(`node scripts/${script}`, { cwd: path.join(__dirname, '..'), env, stdio: 'pipe', timeout: 900000 });
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  assert.strictEqual(files.length, 1, `${name}: expected 1 json, got ${files}`);
  const j = JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'));
  console.log(`    ${name}: endDay=${j.endDay} aliveEnd=${j.aliveEnd} pantryEnd=${j.pantryKcalEnd} lessons=${lessonKeys(j).length} hsAssign=${(j.huntStaff && j.huntStaff.assignments) || 0}`);
  return j;
}

function runP2() {
  console.log('PART P2 — harness mini-det-gate (seed 1502, 5 days, 3 legs)');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r108-p2-'));
  const legs = [
    { name: 'control-a', script: 'journey-establishment-r107-20261106.js', env: {} },
    { name: 'gateoff', script: 'journey-establishment-r108-20261106.js', env: {} },
    { name: 'control-b', script: 'journey-establishment-r107-20261106.js', env: {} },
  ];
  const summaries = {};
  let gateoffJson = null;
  for (const leg of legs) {
    const env = Object.assign({}, leg.env);
    delete env.HUNTSTAFF; // gate-off for the r108 leg; r107 driver ignores it
    const j = runDriverLeg(tmp, leg.name, leg.script, env, 5);
    if (leg.name === 'gateoff') gateoffJson = j;
    summaries[leg.name] = { endDay: j.endDay, aliveEnd: j.aliveEnd, pantryKcalEnd: j.pantryKcalEnd, lessons: lessonKeys(j) };
  }
  const same = (a, b) => a.endDay === b.endDay && a.aliveEnd === b.aliveEnd && a.pantryKcalEnd === b.pantryKcalEnd
    && JSON.stringify(a.lessons) === JSON.stringify(b.lessons);
  const gateClean = same(summaries.gateoff, summaries['control-a']);
  const substrateClean = same(summaries['control-b'], summaries['control-a']);
  console.log(`  gate-off vs control-a: ${gateClean ? 'IDENTICAL' : 'DIVERGES'}`);
  console.log(`  control-b vs control-a: ${substrateClean ? 'IDENTICAL' : 'DIVERGES (substrate noise)'}`);
  if (!gateClean && substrateClean) {
    throw new Error('P2 FAIL: gate-off diverges from control while control-vs-control is identical — wrapper-attributable divergence');
  }
  if (!gateClean) console.log('  NOTE: gate-off diverges but so does control-vs-control — substrate noise, not the wrapper (b4 det-gate pattern)');
  console.log('PART P2 green — no wrapper-attributable divergence');
  console.log(`  P2 outputs kept at ${tmp} (outside the repo)`);
  return { gateoffJson, tmp };
}

function runP2b(tmp) {
  console.log('PART P2b — prep-off parity (seed 1502, 20 days, HUNTSTAFF=1 both legs)');
  const ref = runDriverLeg(tmp, 'refarm-20d', 'journey-establishment-r107-20261106.js', { HUNTSTAFF: '1' }, 20);
  const prepOff = runDriverLeg(tmp, 'prepoff-20d', 'journey-establishment-r108-20261106.js', { HUNTSTAFF: '1' }, 20);
  const sameScalars = ref.endDay === prepOff.endDay && ref.aliveEnd === prepOff.aliveEnd && ref.pantryKcalEnd === prepOff.pantryKcalEnd;
  const sameLessons = JSON.stringify(lessonKeys(ref)) === JSON.stringify(lessonKeys(prepOff));
  const sameAssign = JSON.stringify((ref.huntStaff && ref.huntStaff.assignLog) || []) === JSON.stringify((prepOff.huntStaff && prepOff.huntStaff.assignLog) || []);
  console.log(`  ref-arm: assignments=${(ref.huntStaff && ref.huntStaff.assignments) || 0} huntLog=${(ref.huntLog || []).length}`);
  console.log(`  prep-off: assignments=${(prepOff.huntStaff && prepOff.huntStaff.assignments) || 0} huntLog=${(prepOff.huntLog || []).length} prepLog=${((prepOff.huntStaff && prepOff.huntStaff.prepLog) || []).length}`);
  console.log(`  scalars identical: ${sameScalars}; lessons identical: ${sameLessons}; assignLog identical: ${sameAssign}`);
  assert.ok(sameScalars && sameLessons && sameAssign, 'P2b FAIL: HUNTSTAFF=1 on the r108 driver diverges from the r107 driver ref-arm');
  assert.strictEqual(((prepOff.huntStaff && prepOff.huntStaff.prepLog) || []).length, 0, 'prepLog must be empty with the prep flag off');
  console.log('PART P2b green — prep-off parity holds (20d, staffing path exercised)');
}

function runP3(j) {
  console.log('PART P3 — native guardrails/c3 + ever-substrate + prepLog capture (r108)');
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  ok('guardrails present and equal to the r106 post-hoc derivation', () => {
    assert.ok(j.guardrails, 'guardrails missing');
    assert.strictEqual(j.guardrails.deaths, (j.deaths || []).length, 'guardrails.deaths');
    assert.strictEqual(j.guardrails.popAlive, j.aliveEnd, 'guardrails.popAlive');
    assert.strictEqual(j.guardrails.pantryKcal, j.pantryKcalEnd, 'guardrails.pantryKcal');
  });
  ok('c3.starvationDeaths counts the corrected keywords', () => {
    assert.ok(j.c3, 'c3 missing');
    const words = ['starvat', 'hunger', 'thirst', 'dehydrat'];
    const expect = (j.deaths || []).filter(d => words.some(w => String(d.cause || '').toLowerCase().includes(w))).length;
    assert.strictEqual(j.c3.starvationDeaths, expect, 'c3.starvationDeaths');
  });
  ok('huntEligEver present as an array (empty is honest on a 5d gate-off run)', () => {
    assert.ok(Array.isArray(j.huntEligEver), 'huntEligEver must be an array');
    for (const e of j.huntEligEver) assert.strictEqual(typeof e.name, 'string');
  });
  ok('leanTrace present as a day-ordered array with lean/atHaven/subs', () => {
    assert.ok(Array.isArray(j.leanTrace), 'leanTrace must be an array');
    assert.ok(j.leanTrace.length >= 1, 'leanTrace needs at least one dawn');
    for (const e of j.leanTrace) {
      assert.strictEqual(typeof e.day, 'number');
      assert.strictEqual(typeof e.lean, 'boolean');
      assert.ok(Array.isArray(e.subs));
    }
  });
  ok('huntStaff.prepLog present as an array, prepOn false gate-off', () => {
    assert.ok(j.huntStaff, 'huntStaff missing');
    assert.ok(Array.isArray(j.huntStaff.prepLog), 'huntStaff.prepLog must be an array');
    assert.strictEqual(j.huntStaff.prepLog.length, 0, 'prepLog empty is honest gate-off');
    assert.strictEqual(j.huntStaff.prepOn, false, 'prepOn false gate-off');
  });
  console.log(`PART P3 green (${n} checks)`);
}

(async () => {
  runP1();
  const { gateoffJson, tmp } = runP2();
  runP2b(tmp);
  runP3(gateoffJson);
  console.log('TEST-JOURNEY-ESTABLISHMENT-R108-HUNTPREP: ALL GREEN');
})().catch(e => { console.error('TEST-JOURNEY-ESTABLISHMENT-R108-HUNTPREP FAILED:', e); process.exit(1); });
