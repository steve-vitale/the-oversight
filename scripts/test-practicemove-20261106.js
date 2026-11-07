#!/usr/bin/env node
// Proof: practice-movement analyzer (sim-practicemove-a).
// Runs scripts/practicemove-analyze-20261106.js against synthetic corpora
// plus the real roleform corpora, asserting:
//  T1 attribution cross-check: a rung gain with >=8 reps is no mismatch;
//     a rung expected from reps but absent IS a mismatch -> DIAG-NO-GO.
//  T2 cap: a villager already at 1.4 with 30 reps expects 0 rungs (no
//     mismatch) and counts as a capped cell, not a defect.
//  T3 gate naming: never-offered tasks read NEVER OFFERED; fish assigned
//     ok but 0 resolved reads REDIRECTED (throttle ledger); deadfall
//     resolved-but-below-threshold reads as such.
//  T4 specialist gate sizing: foodXp>=5 gained with base spec 0 counts
//     as gate-blocked; base>0 + xp>=5 counts as a spec up.
//  T5 replication: on the real roleform-a-seed*.json corpora the analyzer
//     reproduces the published numbers exactly (33 cells / 50 steps /
//     195 lines / spec 0->positive 0, DIAG-GO, exit 0).
//  T6 skills attribution: skills gained split by lessons-learned vs
//     level-ups counts match the fixture.
// Usage: node scripts/test-practicemove-20261106.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(ROOT, 'scripts', 'practicemove-analyze-20261106.js');
const EVID = path.join(ROOT, 'evidence', '2026-11-06');

const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
function snap(over) {
  const s = { id: 'v1', name: 'Test', occ: 'carpenter', temperament: 'steady', dead: false, competence: {}, specialist: { butcher: 0, cook: 0, preserver: 0, spotter: 0, builder: 0 }, foodXp: {}, practice: {}, tracks: null, npcSkills: [], npcAbilities: [], npcKnow: [] };
  for (const t of TASKS) s.competence[t] = 1.0;
  return Object.assign(s, over || {});
}
function seedDoc(seed, o) {
  o = o || {};
  const daily = [];
  for (let d = 1; d <= 80; d++) daily.push({ day: d, alive: 5, rosterN: 6, taskLeads: o.taskLeads || {}, leadsChanged: false, over: false, scholarId: 'p0', rosterIds: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'p0'] });
  return { seed, leg: 'practicemove', days: 80, endDay: 80, gameOver: false, playerId: 'p0',
    scholarIds: ['p0'], startRoster: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'p0'],
    startSnap: o.startSnap || {}, endSnap: o.endSnap || {}, periodicSnap: {},
    seenDays: { v1: 80, v2: 80, v3: 80, v4: 80, v5: 80, v6: 80, p0: 80 }, firstSeen: {}, lastSeen: {}, daily,
    resolved: o.resolved || [], assigned: o.assigned || [], deeds: o.deeds || [], practiceLines: o.practiceLines || [],
    throttle: o.throttle || { redirects: 0, exemptDepth: 0 },
    wall: { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, everWon: false },
    waveKillLog: [], teleTypes: {}, skillRows: o.skillRows || [], commit: 'test' };
}
function runAnalyzer(dir, glob) {
  const args = [ANALYZER, '--evid', dir];
  if (glob) args.push('--glob', glob);
  const jout = path.join(os.tmpdir(), 'pm-analyze-' + process.pid + '-' + Math.floor(Math.random() * 1e9) + '.json');
  args.push('--json-out', jout);
  try {
    const out = execFileSync(process.execPath, args, { encoding: 'utf8' });
    return { code: 0, out, json: JSON.parse(fs.readFileSync(jout, 'utf8')) };
  } catch (e) {
    let json = null;
    try { json = JSON.parse(fs.readFileSync(jout, 'utf8')); } catch (_) {}
    return { code: e.status, out: (e.stdout || '') + (e.stderr || ''), json };
  }
}
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'pm-')); }

// ---- Shared GO-shaped base: field + craft move, combat/social/strange 0.
// v1 wood 1.0 -> 1.2 with 8 reps (field? no — wood is craft, 1 step).
// v2 forage 1.0 -> 1.2 with 8 reps (field, 1 step).
function baseCorpus(dir, mutate) {
  const start = {
    v1: snap({ id: 'v1', occ: 'carpenter' }),
    v2: snap({ id: 'v2', occ: 'forager' }),
    v3: snap({ id: 'v3', occ: 'weaver' }),
    v4: snap({ id: 'v4', occ: 'weaver' }),
    v5: snap({ id: 'v5', occ: 'weaver' }),
    v6: snap({ id: 'v6', occ: 'weaver' }),
  };
  const end = {
    v1: snap({ id: 'v1', occ: 'carpenter', competence: Object.fromEntries(TASKS.map(t => [t, t === 'wood' ? 1.2 : 1.0])), practice: { wood: 8 } }),
    v2: snap({ id: 'v2', occ: 'forager', competence: Object.fromEntries(TASKS.map(t => [t, t === 'forage' ? 1.2 : 1.0])), practice: { forage: 8 } }),
    v3: snap({ id: 'v3', occ: 'weaver' }),
    v4: snap({ id: 'v4', occ: 'weaver' }),
    v5: snap({ id: 'v5', occ: 'weaver' }),
    v6: snap({ id: 'v6', occ: 'weaver' }),
  };
  const doc = seedDoc(1, { startSnap: start, endSnap: end,
    resolved: Array.from({ length: 8 }, (_, i) => ({ day: 10 + i, vid: 'v1', task: 'wood' })).concat(Array.from({ length: 8 }, (_, i) => ({ day: 10 + i, vid: 'v2', task: 'forage' }))),
    practiceLines: [{ day: 20, line: 'V1 is getting the hang of woodcutting' }, { day: 21, line: 'V2 is getting the hang of foraging' }] });
  if (mutate) mutate(doc, start, end);
  fs.writeFileSync(path.join(dir, 'practicemove-a-seed1.json'), JSON.stringify(doc));
}

// T1: clean attribution — no mismatch, DIAG-GO.
{
  const d = tmpDir(); baseCorpus(d);
  const r = runAnalyzer(d);
  check('T1 clean attribution exits 0 (DIAG-GO)', r.code === 0, 'code=' + r.code + ' ' + r.out.slice(-200));
  check('T1 cells/steps/lines are 2/2/2', r.json && r.json.pooled60.compChangedCells === 2 && r.json.replication.steps === 2 && r.json.replication.lines === 2, JSON.stringify(r.json && r.json.replication));
  check('T1 mismatches 0', r.json && r.json.pooled60.mismatches === 0);
}
// T1b: rung expected from reps but absent -> mismatch -> DIAG-NO-GO.
{
  const d = tmpDir();
  baseCorpus(d, (doc, start, end) => {
    end.v6 = snap({ id: 'v6', occ: 'weaver', practice: { wood: 8 } }); // 8 reps, competence still 1.0
    doc.endSnap.v6 = end.v6;
    doc.resolved = doc.resolved.concat(Array.from({ length: 8 }, (_, i) => ({ day: 30 + i, vid: 'v6', task: 'wood' })));
  });
  const r = runAnalyzer(d);
  check('T1b missing rung with 8 reps exits 1 (DIAG-NO-GO)', r.code === 1, 'code=' + r.code);
  check('T1b mismatches counted', r.json && r.json.pooled60.mismatches === 1, JSON.stringify(r.json && r.json.pooled60.mismatches));
}
// T2: at-cap villager, 30 reps, no rung — no mismatch, counted as capped.
{
  const d = tmpDir();
  baseCorpus(d, (doc, start, end) => {
    start.v6 = snap({ id: 'v6', occ: 'smith', competence: Object.fromEntries(TASKS.map(t => [t, t === 'wood' ? 1.4 : 1.0])) });
    end.v6 = snap({ id: 'v6', occ: 'smith', competence: Object.fromEntries(TASKS.map(t => [t, t === 'wood' ? 1.4 : 1.0])), practice: { wood: 30 } });
    doc.startSnap.v6 = start.v6; doc.endSnap.v6 = end.v6;
    doc.resolved = doc.resolved.concat(Array.from({ length: 30 }, (_, i) => ({ day: 10 + (i % 40), vid: 'v6', task: 'wood' })));
  });
  const r = runAnalyzer(d);
  check('T2 capped villager exits 0', r.code === 0, 'code=' + r.code + ' ' + r.out.slice(-200));
  check('T2 cappedNoRung counts the cell', r.json && r.json.pooled60.cappedNoRung.wood === 1, JSON.stringify(r.json && r.json.pooled60.cappedNoRung));
  check('T2 mismatches still 0', r.json && r.json.pooled60.mismatches === 0);
}
// T3: gate naming.
{
  const d = tmpDir();
  baseCorpus(d, (doc) => {
    // fish: assigned ok 5x, resolved 0x, throttle redirects recorded.
    doc.assigned = Array.from({ length: 5 }, (_, i) => ({ day: 10 + i, vid: 'v3', task: 'fish', ok: true }));
    doc.throttle = { redirects: 12, exemptDepth: 0 };
    // deadfall: resolved 3x by v4, 3 reps (below the 8 threshold), no rung.
    doc.resolved = doc.resolved.concat([{ day: 15, vid: 'v4', task: 'deadfall' }, { day: 16, vid: 'v4', task: 'deadfall' }, { day: 17, vid: 'v4', task: 'deadfall' }]);
    doc.endSnap.v4 = snap({ id: 'v4', occ: 'weaver', practice: { deadfall: 3 } });
  });
  const r = runAnalyzer(d);
  check('T3 hunt never offered', r.json && /NEVER OFFERED/.test(r.json.gates.hunt || ''), r.json && r.json.gates.hunt);
  check('T3 scout/patrol/tend/teach/mend never offered', r.json && ['scout', 'patrol', 'tend', 'teach', 'mend'].every(t => /NEVER OFFERED/.test(r.json.gates[t] || '')));
  check('T3 fish redirected by throttle', r.json && /REDIRECTED/.test(r.json.gates.fish || ''), r.json && r.json.gates.fish);
  check('T3 deadfall below threshold', r.json && /below the 8-rep threshold/.test(r.json.gates.deadfall || ''), r.json && r.json.gates.deadfall);
  check('T3 throttle ledger read', r.json && r.json.opportunities.throttleRedirects === 12);
}
// T4: specialist gate sizing.
{
  const d = tmpDir();
  baseCorpus(d, (doc, start, end) => {
    // v3: base preserver 0, foodXp preserver 0 -> 6 (gate-blocked: xp>=5, base 0).
    end.v3 = snap({ id: 'v3', occ: 'weaver', foodXp: { preserver: 6 } });
    doc.endSnap.v3 = end.v3;
    // v4: base cook 1 (occupation match), foodXp cook 0 -> 5 (spec up).
    start.v4 = snap({ id: 'v4', occ: 'cook', specialist: { butcher: 0, cook: 1, preserver: 0, spotter: 0, builder: 0 } });
    end.v4 = snap({ id: 'v4', occ: 'cook', specialist: { butcher: 0, cook: 2, preserver: 0, spotter: 0, builder: 0 }, foodXp: { cook: 5 } });
    doc.startSnap.v4 = start.v4; doc.endSnap.v4 = end.v4;
  });
  const r = runAnalyzer(d);
  check('T4 gate-blocked preserver counts 1', r.json && r.json.pooled60.specBlocked.preserver === 1, JSON.stringify(r.json && r.json.pooled60.specBlocked));
  check('T4 spec up counts 1 (cook 1->2)', r.json && r.json.pooled60.specUp === 1, JSON.stringify(r.json && r.json.pooled60.specUp));
  check('T4 spec 0->positive still 0', r.json && r.json.pooled60.specZeroToPos === 0);
}
// T5: replication on the real roleform corpora.
{
  const r = runAnalyzer(EVID, 'roleform-a-seed');
  check('T5 roleform corpora exit 0 (DIAG-GO)', r.code === 0, 'code=' + r.code + ' ' + r.out.slice(-300));
  check('T5 cells 33', r.json && r.json.pooled60.compChangedCells === 33, JSON.stringify(r.json && r.json.pooled60.compChangedCells));
  check('T5 steps 50 (field 14 / craft 36)', r.json && r.json.replication.steps === 50 && r.json.pooled60.cellsByTrack.field === 14 && r.json.pooled60.cellsByTrack.craft === 36);
  check('T5 rung lines 195', r.json && r.json.replication.lines === 195, JSON.stringify(r.json && r.json.replication.lines));
  check('T5 spec 0->positive 0', r.json && r.json.pooled60.specZeroToPos === 0);
  check('T5 mismatches 0 on real corpora', r.json && r.json.pooled60.mismatches === 0);
  check('T5 gates named on real corpora', r.json && r.json.gates.hunt === 'NEVER OFFERED (0 assignTask ok, 0 lead-days)' && /qual30 SET/.test(r.json.gates.deadfall || ''), JSON.stringify(r.json && r.json.gates));
}
// T6: skills attribution split.
{
  const d = tmpDir();
  baseCorpus(d, (doc, start, end) => {
    end.v3 = snap({ id: 'v3', occ: 'weaver', npcSkills: ['foraging', 'snare_wire'] });
    doc.endSnap.v3 = end.v3;
    doc.skillRows = [
      { day: 20, type: 'skill_lesson', teacher: 'v1', learner: 'v3', skill: 'foraging' },
      { day: 40, type: 'villager_level_up', vid: 'v3', track: 'field' },
    ];
  });
  const r = runAnalyzer(d);
  check('T6 skills gained 2', r.json && r.json.pooled60.skillsGained === 2, JSON.stringify(r.json && r.json.pooled60.skillsGained));
  check('T6 lessons learned 1 / level-ups 1', r.json && r.json.pooled60.lessonsLearned === 1 && r.json.pooled60.levelUps === 1);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
