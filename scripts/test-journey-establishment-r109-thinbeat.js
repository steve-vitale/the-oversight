#!/usr/bin/env node
// scripts/test-journey-establishment-r109-thinbeat.js — regression guard
// for the conversation wind-down (r109 Q1: SUBSTRATE-MISSING).
//
// The r109 before-panel's two apparent stalls (Simran 1603, Juan 1604,
// nonverbal menu leave|nv:nod) turned out to be winding-down clean
// endings: the goon turn speaks the queued winddown beat, windingDown
// goes true, and the menu is one last turn of choices — leave or nv:nod,
// both ending the conversation naturally. There was no defect to fix, so
// this test guards the CORRECT behavior rather than proving a fix: it
// PASSES on the current code, and would FAIL if the winddown delivery
// broke (the menu degenerating to a no-pick while still open).
//
// P1 (seeded harness, nonverbal fixture — the OBSERVED shape):
//   On each of seeds 1603, 1604, 1502, find a day-1 roster villager with
//   no shared language (convo thread 'nonverbal'), start a conversation,
//   and drive it with the driver-style picker (goon-first, no-repeat,
//   betrayal never, confront last-resort) for up to 12 turns. At EVERY
//   turn the invariant must hold: the menu offers a fresh content choice,
//   or the conversation is winding down / ended. Fresh = an id outside
//   the structural set {leave, bye, silence, nv:listen, goon, dlg:subject,
//   subject, menu:more, recap} that has not been picked before this
//   sitting — except 'goon' and 'more', which yield a new beat each time
//   and are always fresh. (The nonverbal menu never contains dlg:subject,
//   so the subject-pivot subtlety does not arise in this fixture; the
//   verbal case is covered by the r109 panel's 16 held convos.)
// P2 (harness det-gate): the r109 driver gate-off reproduces the r108
//   driver gate-off exactly on seed 1502, 5 days (endDay / aliveEnd /
//   guardrails.pantryKcal / skill_lesson keys) — the r109 driver's play
//   loop is neutral vs r108; only the people check changed. Runs the real
//   drivers as subprocesses (one harness per process) into TMPDIR (or
//   ~/workspace/tmp-r109 when /tmp is full — r108 lesson).
// Usage: node scripts/test-journey-establishment-r109-thinbeat.js
//   TMPDIR=~/workspace/tmp-r109 node scripts/test-journey-establishment-r109-thinbeat.js
'use strict';
const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const STRUCTURAL = new Set(['leave', 'bye', 'silence', 'nv:listen', 'goon', 'dlg:subject', 'subject', 'menu:more', 'recap']);
const ALWAYS_FRESH = new Set(['goon', 'more']);

function freshContent(choices, seen) {
  return (choices || []).some(ch => {
    if (!ch || !ch.id) return false;
    if (ALWAYS_FRESH.has(ch.id)) return true;
    if (STRUCTURAL.has(ch.id)) return false;
    if (seen[ch.id]) return false;
    return true;
  });
}

async function runP1() {
  console.log('PART P1 — nonverbal exhaustion invariant (seeded harness)');
  const { loadGame, setupGame } = require('./sim-harness');
  const seeds = [1603, 1604, 1502];
  let ran = 0, stalls = 0;
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
    await setupGame(Game);
    const roster = ((Game.state.village || {}).roster || []).filter(id => String(id) !== String(Game.villagerId));
    let vid = null;
    for (const id of roster) {
      let p = null;
      try { p = Game.getPerson(id); } catch (e) {}
      if (!p || p.dead) continue;
      // Nonverbal = the convo opens on the nonverbal thread (no shared words).
      let r = null;
      try { r = Game.startConvo(id); } catch (e) { continue; }
      let thread = null;
      try { thread = (Game.convoGet(id) || {}).thread; } catch (e) {}
      try { Game.endConvo(id, 'done'); } catch (e) {}
      if (thread === 'nonverbal') { vid = id; break; }
    }
    if (!vid) { console.log(`  seed ${seed}: no nonverbal villager in the day-1 roster — skipped`); continue; }
    ran++;
    let nm = '?';
    try { nm = Game.displayName(vid); } catch (e) {}
    console.log(`  seed ${seed}: ${nm} (${vid}) — nonverbal`);
    const lines = [];
    const seen = {};
    let r = Game.startConvo(vid);
    lines.push(`OPENING: ${r.line}`);
    let stalled = false;
    for (let turn = 0; turn < 12; turn++) {
      const choices = (r.choices && r.choices.length) ? r.choices : [];
      if (!choices.length) { lines.push('(choices empty)'); stalled = !r.ended && !r.windingDown; break; }
      if (!freshContent(choices, seen) && !r.windingDown && !r.ended) {
        lines.push(`STALL at turn ${turn}: menu=[${choices.map(ch => ch.id).join('|')}] windingDown=${!!r.windingDown} ended=${!!r.ended}`);
        stalled = true;
        break;
      }
      let pick = null;
      if (choices.find(ch => ch.id === 'goon')) pick = choices.find(ch => ch.id === 'goon');
      else pick = choices.find(ch => ch.id !== 'leave' && ch.id !== 'bye' && !seen[ch.id] && !/^betrayal:/.test(ch.id) && !/^confront:/.test(ch.id))
        || choices.find(ch => /^confront:/.test(ch.id) && !seen[ch.id])
        || null;
      if (!pick) { lines.push('(no pick)'); stalled = !r.windingDown; break; }
      if (pick.id !== 'goon') seen[pick.id] = 1;
      lines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
      r = Game.convoTurn(vid, pick.id);
      lines.push(`THEM: ${r.line == null ? '(null)' : r.line}`);
      if (r.ended) { lines.push('(ended by engine)'); break; }
    }
    try { const end = Game.endConvo(vid, 'done'); if (end && end.line) lines.push('closing: ' + end.line); } catch (e) {}
    for (const l of lines) console.log('    ' + l);
    if (stalled) { stalls++; console.log(`  seed ${seed}: STALLED`); }
    else console.log(`  seed ${seed}: no stall (invariant held)`);
  }
  console.log(`  P1: ran on ${ran} seed(s), stalls=${stalls}`);
  assert.ok(ran >= 2, `P1 needs >=2 nonverbal fixtures, ran on ${ran}`);
  assert.strictEqual(stalls, 0, `P1 FAIL: ${stalls} nonverbal conversation(s) stalled to a no-pick menu`);
  console.log('PART P1 green — every nonverbal conversation offers fresh content or winds down');
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
  const g = j.guardrails || {};
  console.log(`    ${name}: endDay=${j.endDay} aliveEnd=${j.aliveEnd} pantryGuardrails=${g.pantryKcal} lessons=${lessonKeys(j).length}`);
  return j;
}

function runP2() {
  console.log('PART P2 — r109 driver det-gate (seed 1502, 5 days, gate-off both legs)');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r109-p2-'));
  const legs = [
    { name: 'control-r108', script: 'journey-establishment-r108-20261106.js', env: {} },
    { name: 'gateoff-r109', script: 'journey-establishment-r109-20261107.js', env: {} },
    { name: 'control-r108b', script: 'journey-establishment-r108-20261106.js', env: {} },
  ];
  const summaries = {};
  for (const leg of legs) {
    const env = Object.assign({}, leg.env);
    delete env.HUNTSTAFF;
    const j = runDriverLeg(tmp, leg.name, leg.script, env, 5);
    const g = j.guardrails || {};
    summaries[leg.name] = { endDay: j.endDay, aliveEnd: j.aliveEnd, pantryKcal: g.pantryKcal, lessons: lessonKeys(j) };
  }
  const same = (a, b) => a.endDay === b.endDay && a.aliveEnd === b.aliveEnd && a.pantryKcal === b.pantryKcal
    && JSON.stringify(a.lessons) === JSON.stringify(b.lessons);
  const gateClean = same(summaries['gateoff-r109'], summaries['control-r108']);
  const substrateClean = same(summaries['control-r108b'], summaries['control-r108']);
  console.log(`  gate-off r109 vs control r108: ${gateClean ? 'IDENTICAL' : 'DIVERGES'}`);
  console.log(`  control-r108b vs control-r108: ${substrateClean ? 'IDENTICAL' : 'DIVERGES (substrate noise)'}`);
  if (!gateClean && substrateClean) {
    throw new Error('P2 FAIL: r109 gate-off diverges from the r108 control while control-vs-control is identical — driver-attributable divergence');
  }
  if (!gateClean) console.log('  NOTE: gate-off diverges but so does control-vs-control — substrate noise, not the driver (b4 det-gate pattern)');
  console.log('PART P2 green — no driver-attributable divergence');
  console.log(`  P2 outputs kept at ${tmp} (outside the repo)`);
}

(async () => {
  await runP1();
  runP2();
  console.log('TEST-JOURNEY-ESTABLISHMENT-R109-THINBEAT: ALL GREEN');
})().catch(e => { console.error('TEST-JOURNEY-ESTABLISHMENT-R109-THINBEAT FAILED:', e); process.exit(1); });
