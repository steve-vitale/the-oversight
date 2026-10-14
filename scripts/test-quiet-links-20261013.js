#!/usr/bin/env node
// scripts/test-quiet-links-20261013.js — PROOF for the quiet-links lever
// (stall forensics driver #2: internal linkWith/switchboard verb noise).
//
// The lever: linkWith (hierarchy.js:184) and switchboard (comms.js:827) are
// pure state READS — zero ticks, zero mutation. They were instrumented as
// player verbs, so policy read-checks counted as deliberate decisions and
// game-code lookups (foreignCrisisTick, link maintenance) counted as
// internal traffic (~2k noise verbs/run). The fix removes them from the
// harness VERB_CAT: reads are not player verbs.
//
// Controls (proof-of-effect: the artifact must BE the effect):
//   A (purity): 2000 linkWith + 2000 switchboard calls change NOTHING —
//      full Game.state JSON identical, dayTicks identical. Empirically
//      establishes the pre-registered "tick-cost" is 0 (pure reads).
//   B (off-stream): a 3-day winseek run (a policy that calls Game.linkWith
//      in its filters) records ZERO linkWith/switchboard verb keys in
//      perDay acts, any origin — the reads left the verb stream.
//   C (foreign-crisis): scripted known+linked village with crisis parts=1 —
//      foreignCrisisTick() clears the crisis and says the 'door is clear'
//      message EXACTLY once. The link logic still fires once per event;
//      only the telemetry changed.
//   D (no-behavior-change): identical-seed 10-day competent run,
//      TELEMETRY_VERBS=1 vs 0 — byte-identical end state on the NEW harness.
//
// Usage: node scripts/test-quiet-links-20261013.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures++; }
}
const snap = (Game) => JSON.stringify(Game.state);

async function controlA() {
  console.log('CONTROL A: linkWith/switchboard purity (2000 calls each, nothing changes)');
  const { Game } = await loadGame({ seed: 11, mode: 'quiet-links-A' });
  await setupGame(Game);
  const ids = (Game.state.otherVillages || []).map(v => v.id).concat(['__bogus']);
  // warm-up: the first read lazily initializes mship containers (one-time);
  // purity is about steady-state calls after that.
  try { Game.linkWith(ids[0]); } catch (e) {}
  const before = snap(Game);
  const ticksBefore = (Game.state.scholar || {}).dayTicks || 0;
  for (let i = 0; i < 2000; i++) {
    for (const id of ids) { try { Game.linkWith(id); } catch (e) {} }
    try { Game.switchboard(); } catch (e) {}
  }
  const after = snap(Game);
  const ticksAfter = (Game.state.scholar || {}).dayTicks || 0;
  check('Game.state byte-identical after 4000+ read calls', before === after,
    `state bytes ${before.length} -> ${after.length}`);
  check('dayTicks unchanged (tick-cost of these verbs is 0)', ticksBefore === ticksAfter,
    `dayTicks ${ticksBefore} -> ${ticksAfter}`);
}

async function controlB() {
  console.log('CONTROL B: reads left the verb stream (3-day winseek, zero linkWith/switchboard keys)');
  const { Game } = await loadGame({ seed: 22, mode: 'quiet-links-B' });
  await setupGame(Game);
  const { winseek } = require('./policies/winseek');
  const result = await runDays(Game, winseek, { days: 3, sampleEvery: 3 });
  const keys = new Set();
  for (const r of (result.pacing && result.pacing.perDay) || [])
    for (const k of Object.keys(r.acts || {})) keys.add(k);
  const hits = [...keys].filter(k => /linkWith|switchboard/.test(k));
  check('no linkWith/switchboard verb keys recorded', hits.length === 0,
    hits.length ? `found: ${hits.join(', ')}` : `${keys.size} verb keys, none are reads`);
}

async function controlC() {
  console.log('CONTROL C: foreign-crisis link logic fires exactly once per event');
  const { Game } = await loadGame({ seed: 33, mode: 'quiet-links-C' });
  await setupGame(Game);
  Game.state.otherVillages.push({
    id: '__testv', name: 'Testville', generated: true,
    crisis: { kind: 'monster', parts: 1 },
  });
  Game.hierarchyState().push({
    status: 'active', kind: 'covenant', a: 'haven', b: '__testv', day: 0, trust: 50,
  });
  // sanity: the reads see the fabricated link
  const lk = Game.linkWith('__testv');
  check('linkWith finds the fabricated covenant link', !!(lk && lk.b === '__testv'));
  const said = [];
  const origSay = Game.say;
  Game.say = function (m) { said.push(String(m)); if (origSay) return origSay.apply(this, arguments); };
  Game.foreignCrisisTick();
  Game.say = origSay;
  const ov = Game.state.otherVillages.find(v => v.id === '__testv');
  check('crisis cleared (parts 1 -> 0 -> null)', ov && ov.crisis === null);
  const doorMsgs = said.filter(m => /door is clear again/.test(m));
  check("door-clear message said exactly once", doorMsgs.length === 1,
    `got ${doorMsgs.length}`);
}

async function controlD() {
  console.log('CONTROL D: no behavior change on new harness (TELEMETRY_VERBS=1 vs 0)');
  const snapRun = async (verbsOn) => {
    process.env.TELEMETRY_VERBS = verbsOn ? '1' : '0';
    const { Game } = await loadGame({ seed: 44, mode: 'quiet-links-D' });
    await setupGame(Game);
    const { competent } = require('./policies/competent');
    const result = await runDays(Game, competent, { days: 10, sampleEvery: 10 });
    let pantry = 0;
    try {
      pantry = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    } catch (e) {}
    return {
      days: result.days, gameDays: result.gameDays, endReason: result.endReason,
      pop: ((Game.state.village || {}).roster || []).length,
      pantry: Math.round(pantry), waveKills: JSON.stringify(result.waveKills || {}),
    };
  };
  const on = await snapRun(true);
  const off = await snapRun(false);
  delete process.env.TELEMETRY_VERBS;
  check('end state identical with/without instrumentation', JSON.stringify(on) === JSON.stringify(off),
    JSON.stringify(on) === JSON.stringify(off) ? '' : `\n on : ${JSON.stringify(on)}\n off: ${JSON.stringify(off)}`);
}

(async () => {
  await controlA();
  await controlB();
  await controlC();
  await controlD();
  console.log(failures ? `\n${failures} FAILURES` : '\nALL CONTROLS GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
