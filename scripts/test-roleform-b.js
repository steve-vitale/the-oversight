#!/usr/bin/env node
// Proof: role-formation FIRST NUMBERS analyzer + driver (sim-roleform-b).
// Builds small synthetic corpora in a temp dir and runs
// scripts/roleform-analyze-20261110.js against them, asserting:
//  T1 complete corpus with ANY movement exits 0 with GO — the new
//     verdict rule judges instrument validity + complete capture, NOT
//     movement size (a single-track corpus is GO here).
//  T2 temperament normalization: a bold hunter's 1.4x1.15 competence
//     reads as rung 1.4 (no phantom movement), a cautious villager's
//     0.9-tempered gain reads as a real rung.
//  T3 NPC-window exclusion: resolutions/deeds after a villager takes the
//     mantle do not count toward their NPC profile.
//  T4 NO-GO legs: (a) a competence DECREASE exits 1; (b) an incomplete
//     corpus (missing endSnap) exits 1; (c) a practice-rep DECREASE
//     across snapshots exits 1.
//  T5 rung-gain lines are parsed per task (woodcutting -> wood), and
//     practice reps by track are counted from snapshot deltas.
//  T6 driver determinism: the same seed run twice at a short horizon
//     produces byte-identical corpora.
// Usage: node scripts/test-roleform-b.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(ROOT, 'scripts', 'roleform-analyze-20261110.js');
const DRIVER = path.join(ROOT, 'scripts', 'roleform-driver-20261110.js');

const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
function snap(over) {
  const s = { id: 'v1', name: 'Test', occ: 'carpenter', temperament: 'steady', dead: false, competence: {}, specialist: { butcher: 0, cook: 0, preserver: 0, spotter: 0, builder: 0 }, foodXp: {}, practice: {}, tracks: null, npcSkills: [], npcAbilities: [], npcKnow: [] };
  for (const t of TASKS) s.competence[t] = 1.0;
  return Object.assign(s, over || {});
}
function seedDoc(seed, rows, opts) {
  const o = opts || {};
  const daily = [];
  for (let d = 1; d <= 80; d++) daily.push({ day: d, alive: 5, rosterN: 6, taskLeads: {}, leadsChanged: false, over: false, scholarId: o.scholarId || 'p0', rosterIds: ['v1', 'v2', 'v3', 'v4', 'v5', 'p0'] });
  return { seed, leg: 'roleform-b', days: 150, endDay: 80, gameOver: false, playerId: 'p0',
    scholarIds: o.scholarIds || ['p0'], startRoster: ['v1', 'v2', 'v3', 'v4', 'v5', 'p0'],
    startSnap: o.startSnap || {}, endSnap: o.endSnap || {}, periodicSnap: o.periodicSnap || {},
    seenDays: { v1: 80, v2: 80, v3: 80, v4: 80, v5: 80, p0: 80 }, firstSeen: {}, lastSeen: {}, daily,
    resolved: o.resolved || [], assigned: [], deeds: o.deeds || [], practiceLines: o.practiceLines || [],
    wall: { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, everWon: false },
    waveKillLog: [], teleTypes: {}, skillRows: o.skillRows || [], commit: 'test' };
}
function runAnalyzer(dir) {
  try {
    const out = execFileSync(process.execPath, [ANALYZER, '--evid', dir], { encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) { return { code: e.status, out: (e.stdout || '') + (e.stderr || '') }; }
}
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---- T1 + T2 + T5: GO corpus. Only field + craft + social show
// competence movement; under the NEW rule that is still GO (capture is
// complete and valid). Practice reps are counted from snapshot deltas.
// v1 (steady carpenter): wood competence 1.0 -> 1.2 (craft, 1 cell),
//   practice wood 0 -> 40, track craft xp 20 (level 1).
// v2 (bold hunter): hunt competence 1.4x1.15 -> 1.4x1.15 (NO movement:
//   temperament-normalized rung is identical), but fight deeds give
//   combat xp 20 (level 1) -> combat signal via track level.
// v3 (cautious teacher): teach competence 0.9-tempered 1.0 -> 1.2
//   (social, 1 cell: 0.9 -> 1.08 reads as rung 1.0 -> 1.2 after division).
// v4: field via forage competence 1.0 -> 1.3 + field xp 18, practice
//   forage 0 -> 25.
// v5: strange via integration deed xp 18 (no task feeds strange).
function goCorpus(dir) {
  const start = {
    v1: snap({ id: 'v1', occ: 'carpenter' }),
    v2: snap({ id: 'v2', occ: 'hunter', temperament: 'bold', competence: Object.fromEntries(TASKS.map(t => [t, t === 'hunt' ? 1.61 : 1.0])) }),
    v3: snap({ id: 'v3', occ: 'teacher', temperament: 'cautious', competence: Object.fromEntries(TASKS.map(t => [t, 0.9])) }),
    v4: snap({ id: 'v4', occ: 'forager' }),
    v5: snap({ id: 'v5', occ: 'weaver' }),
  };
  const end = {
    v1: snap({ id: 'v1', occ: 'carpenter', competence: Object.fromEntries(TASKS.map(t => [t, t === 'wood' ? 1.2 : 1.0])), practice: { wood: 40 }, tracks: { xp: { combat: 0, field: 0, social: 0, craft: 20, strange: 0 }, granted: {}, skilled: {} } }),
    v2: snap({ id: 'v2', occ: 'hunter', temperament: 'bold', competence: Object.fromEntries(TASKS.map(t => [t, t === 'hunt' ? 1.61 : 1.0])), tracks: { xp: { combat: 20, field: 0, social: 0, craft: 0, strange: 0 }, granted: {}, skilled: {} } }),
    v3: snap({ id: 'v3', occ: 'teacher', temperament: 'cautious', competence: Object.fromEntries(TASKS.map(t => [t, t === 'teach' ? 1.08 : 0.9])), tracks: { xp: { combat: 0, field: 0, social: 20, craft: 0, strange: 0 }, granted: {}, skilled: {} } }),
    v4: snap({ id: 'v4', occ: 'forager', competence: Object.fromEntries(TASKS.map(t => [t, t === 'forage' ? 1.3 : 1.0])), practice: { forage: 25 }, tracks: { xp: { combat: 0, field: 18, social: 0, craft: 0, strange: 0 }, granted: {}, skilled: {} } }),
    v5: snap({ id: 'v5', occ: 'weaver', tracks: { xp: { combat: 0, field: 0, social: 0, craft: 0, strange: 18 }, granted: {}, skilled: {} } }),
  };
  const resolved = [];
  for (let d = 1; d <= 40; d++) {
    resolved.push({ day: d, vid: 'v1', task: 'wood' });
    resolved.push({ day: d, vid: 'v2', task: 'patrol' });
    resolved.push({ day: d, vid: 'v3', task: 'teach' });
    resolved.push({ day: d, vid: 'v4', task: 'forage' });
  }
  const deeds = [];
  for (let d = 1; d <= 10; d++) { deeds.push({ day: d, who: 'v2', deed: 'fight_won' }); deeds.push({ day: d, who: 'v5', deed: 'integration' }); }
  const doc = seedDoc(160201, null, { startSnap: start, endSnap: end, resolved, deeds,
    practiceLines: [{ day: 9, line: 'Mehdi is getting the hang of woodcutting' }, { day: 12, line: 'Ana is getting the hang of teaching' }] });
  // Wave-kill rows carry the wave in `w` (kind in `mid`): the analyzer
  // must count these, not read a `wave`/`monster` field that does not
  // exist (a draft did and silently reported 0 W4/W5 kills).
  doc.waveKillLog = [
    { d: 50, mid: 'strike', w: 4, by: 'v2', via: 'wild', trick: null },
    { d: 60, mid: 'editor', w: 5, by: 'v2', via: 'wild', trick: null },
    { d: 20, mid: 'hushwolf', w: 1, by: 'v1', via: 'wild', trick: null },
  ];
  fs.writeFileSync(path.join(dir, 'roleform-b-seed160201.json'), JSON.stringify(doc));
}
const dir1 = fs.mkdtempSync(path.join(os.tmpdir(), 'roleform-b-go-'));
goCorpus(dir1);
const r1 = runAnalyzer(dir1);
check('T1 complete corpus exits 0', r1.code === 0, r1.out.slice(-400));
check('T1 verdict GO printed (instrument valid)', /GO — instrument valid/.test(r1.out), r1.out.slice(-400));
check('T2 bold hunter shows no phantom movement (combat cells 0)', /"combat":0/.test(r1.out), r1.out.slice(0, 2000));
check('T2 cautious teacher counts a real rung (social cells 1)', /"social":1/.test(r1.out), r1.out.slice(0, 2000));
check('T5 rung lines parsed: woodcutting -> wood', /"wood":1/.test(r1.out), r1.out.slice(0, 3000));
check('T5 practice reps by track counted (craft 40, field 25)', /"craft":40/.test(r1.out) && /"field":25/.test(r1.out), r1.out.slice(0, 3000));
check('T5b wave kills counted from `w` field (W4 1, W5 1)', /wave-4 kills 1 \| wave-5 kills 1/.test(r1.out), r1.out.slice(0, 1200));

// ---- T3: NPC-window exclusion. v1 becomes scholar on day 41; all of
// v1's resolutions and deeds are AFTER day 41, so v1 must contribute
// nothing to the NPC profile (no tasks, no dominant track).
function npcWindowCorpus(dir) {
  const start = { v1: snap({ id: 'v1', occ: 'carpenter' }) };
  const end = { v1: snap({ id: 'v1', occ: 'carpenter', tracks: { xp: { combat: 0, field: 0, social: 0, craft: 40, strange: 0 }, granted: {}, skilled: {} } }) };
  const daily = [];
  for (let d = 1; d <= 80; d++) daily.push({ day: d, alive: 5, rosterN: 6, taskLeads: {}, leadsChanged: false, over: false, scholarId: d < 41 ? 'p0' : 'v1', rosterIds: ['v1', 'v2', 'v3', 'v4', 'v5', 'p0'] });
  const resolved = [];
  for (let d = 41; d <= 80; d++) resolved.push({ day: d, vid: 'v1', task: 'wood' });
  const doc = seedDoc(160202, null, { startSnap: start, endSnap: end, resolved, scholarIds: ['p0', 'v1'] });
  doc.daily = daily;
  fs.writeFileSync(path.join(dir, 'roleform-b-seed160202.json'), JSON.stringify(doc));
}
const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'roleform-b-npc-'));
npcWindowCorpus(dir2);
const r2 = runAnalyzer(dir2);
check('T3 scholar-window resolutions excluded (no wood in NPC-window task totals)', /resolved by task \(all seeds, NPC window\): \{\}/.test(r2.out), r2.out.slice(0, 2000));

// ---- T4a: competence DECREASE corpus -> NO-GO exit 1.
function decreaseCorpus(dir) {
  const start = { v1: snap({ id: 'v1', occ: 'forager' }) };
  const end = { v1: snap({ id: 'v1', occ: 'forager', competence: Object.fromEntries(TASKS.map(t => [t, 1.0])), tracks: { xp: { combat: 0, field: 18, social: 0, craft: 0, strange: 0 }, granted: {}, skilled: {} } }) };
  // Start forage at 1.2 and end at 1.0: a real decrease.
  start.v1.competence.forage = 1.2;
  const resolved = [];
  for (let d = 1; d <= 40; d++) resolved.push({ day: d, vid: 'v1', task: 'forage' });
  const doc = seedDoc(160203, null, { startSnap: start, endSnap: end, resolved });
  fs.writeFileSync(path.join(dir, 'roleform-b-seed160203.json'), JSON.stringify(doc));
}
const dir3 = fs.mkdtempSync(path.join(os.tmpdir(), 'roleform-b-dec-'));
decreaseCorpus(dir3);
const r3 = runAnalyzer(dir3);
check('T4a competence decrease exits 1', r3.code === 1, 'code=' + r3.code);
check('T4a verdict NO-GO names competence decreases', /NO-GO — .*competence decreases/.test(r3.out), r3.out.slice(-400));

// ---- T4b: incomplete corpus (endSnap missing) -> NO-GO exit 1.
const dir4 = fs.mkdtempSync(path.join(os.tmpdir(), 'roleform-b-inc-'));
{
  const start = { v1: snap({ id: 'v1', occ: 'forager' }) };
  const doc = seedDoc(160204, null, { startSnap: start, endSnap: {} });
  delete doc.endSnap;
  fs.writeFileSync(path.join(dir4, 'roleform-b-seed160204.json'), JSON.stringify(doc));
}
const r4 = runAnalyzer(dir4);
check('T4b incomplete corpus exits 1', r4.code === 1, 'code=' + r4.code);
check('T4b verdict NO-GO names incomplete corpora', /NO-GO — .*corpora incomplete/.test(r4.out), r4.out.slice(-400));

// ---- T4c: practice-rep DECREASE across snapshots -> NO-GO exit 1.
const dir5 = fs.mkdtempSync(path.join(os.tmpdir(), 'roleform-b-prac-'));
{
  const start = { v1: snap({ id: 'v1', occ: 'carpenter', practice: { wood: 10 } }) };
  const mid = { v1: snap({ id: 'v1', occ: 'carpenter', practice: { wood: 5 } }) };
  const end = { v1: snap({ id: 'v1', occ: 'carpenter', practice: { wood: 6 } }) };
  const doc = seedDoc(160205, null, { startSnap: start, endSnap: end, periodicSnap: { 30: mid } });
  fs.writeFileSync(path.join(dir5, 'roleform-b-seed160205.json'), JSON.stringify(doc));
}
const r5 = runAnalyzer(dir5);
check('T4c practice-rep decrease exits 1', r5.code === 1, 'code=' + r5.code);
check('T4c verdict NO-GO names practice-rep decreases', /NO-GO — .*practice-rep decreases/.test(r5.out), r5.out.slice(-400));

// ---- T4d (bar-change leg): the old roleform-a NO-GO corpus — only
// field shows any signal — is GO under the new rule, because movement
// size is not judged; only validity + completeness are.
const dir6 = fs.mkdtempSync(path.join(os.tmpdir(), 'roleform-b-fieldonly-'));
{
  const start = { v1: snap({ id: 'v1', occ: 'forager' }) };
  const end = { v1: snap({ id: 'v1', occ: 'forager', competence: Object.fromEntries(TASKS.map(t => [t, t === 'forage' ? 1.2 : 1.0])), tracks: { xp: { combat: 0, field: 18, social: 0, craft: 0, strange: 0 }, granted: {}, skilled: {} } }) };
  const resolved = [];
  for (let d = 1; d <= 40; d++) resolved.push({ day: d, vid: 'v1', task: 'forage' });
  const doc = seedDoc(160206, null, { startSnap: start, endSnap: end, resolved });
  fs.writeFileSync(path.join(dir6, 'roleform-b-seed160206.json'), JSON.stringify(doc));
}
const r6 = runAnalyzer(dir6);
check('T4d field-only corpus is GO under the new rule (movement not judged)', r6.code === 0 && /GO — instrument valid/.test(r6.out), 'code=' + r6.code + ' ' + r6.out.slice(-300));

// ---- T6: driver determinism. Same seed, short horizon, twice — the
// corpora must be byte-identical (seeded RNG before eval).
const detA = fs.mkdtempSync(path.join(os.tmpdir(), 'roleform-b-det-a-'));
const detB = fs.mkdtempSync(path.join(os.tmpdir(), 'roleform-b-det-b-'));
let detOk = false, detErr = '';
try {
  execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env: Object.assign({}, process.env, { SEEDS: '160201', DAYS: '5', EVID: detA }), timeout: 600000 });
  execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env: Object.assign({}, process.env, { SEEDS: '160201', DAYS: '5', EVID: detB }), timeout: 600000 });
  const a = fs.readFileSync(path.join(detA, 'roleform-b-seed160201.json'), 'utf8');
  const b = fs.readFileSync(path.join(detB, 'roleform-b-seed160201.json'), 'utf8');
  detOk = a === b;
  if (!detOk) detErr = `lengths ${a.length} vs ${b.length}`;
} catch (e) { detErr = (e && e.message) || String(e); }
check('T6 driver determinism: same seed twice -> byte-identical corpus', detOk, detErr);

console.log(`\nroleform-b proof: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
