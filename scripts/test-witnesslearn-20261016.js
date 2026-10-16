#!/usr/bin/env node
'use strict';
// KILL PROTOCOL (2026-10-16: pilot NO-GO, 0 hyper-lethal witness reports vs
// the ≥2 bar): the lever is reverted — src/js/game.js no longer carries
// noteWitnessReportedKill. INFO-SKIP instead of crashing on the missing lever.
(function () {
  const fs = require('fs');
  const path = require('path');
  try {
    const gj = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    if (gj.indexOf('noteWitnessReportedKill') === -1) {
      console.log('SKIP test-witnesslearn-20261016 (lever reverted per kill protocol — noteWitnessReportedKill absent from src/js/game.js)');
      process.exit(0);
    }
  } catch (e) {}
})();
// test-witnesslearn-20261016.js — proof record for the sim-witnesslearn arm
// (axis scale-onramp, finding #413): WITNESS-REPORTED KILL SITES.
//
// The 2026-10-16 runs established the trick game is wired and executing
// (counterwire + apexhook), but LEARNING is the binding constraint: hyper-
// lethal species (The Eater 8/8 one-round kills; Spoiler/Timeslot 1-round)
// can never be learned under the 2-encounter observation bar because the
// dead don't report (sim-apexroute was killed at pilot on exactly this
// survivor-bias mechanism). This arm: when a one-round killer kills a
// villager, surviving witnesses (allies present at the kill, engine-
// grounded via party-wiring allyVids) report it — granting observation
// credit toward the species' trick. The dead don't report; the living do.
//
// What changed (game code):
//   game.js — noteWitnessReportedKill(vid, mid, witnesses): witness-
//     reported observation credit on the shared villageCounterObs bar
//     (one kill = one observation, no matter how many witnesses);
//     discoverMonsterCounter viaLine gains the honest 'witness-reported' case.
//   fieldFights.js — end-of-fight vDie block (WITNESSLEARN=1 gated):
//     surviving witnesses (joined ally still standing + party-wired crew)
//     report via noteWitnessReportedKill. Zero trace when the flag is unset.
//
// Sections:
//   UNIT — noteWitnessReportedKill: credit, narration, discovery, negatives.
//   ARC  — full fieldFight: witnessed one-round vDie credits; unwitnessed
//          vDie credits nothing; WITNESSLEARN unset = zero trace.
//   DET  — identical-seed 40d pairs, WITNESSLEARN unset: byte-identical.
//   SMOKE — 20d run with WITNESSLEARN=1: no crash.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js, env) {
  const tmpFile = '/tmp/witnesslearn-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 1200); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    const lines = r.trim().split('\n');
    return JSON.parse(lines[lines.length - 1] || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

const PRE = `
  const G = Game;
  const roster = ((G.state.village || {}).roster || []).filter(v => v && v !== 'player');
  const vid = roster[0], w1 = roster[1], w2 = roster[2];
  const said = [];
  const _say = G.say.bind(G);
  G.say = (t) => { try { said.push(String(t)); } catch (e) {} return _say(t); };
`;

// ---------- UNIT ----------
console.log('== UNIT: noteWitnessReportedKill ==');
{
  const o = gameEval(811, PRE + `
    const U = {};
    U.hasMethod = typeof G.noteWitnessReportedKill === 'function';
    if (U.hasMethod) {
      // 1. witnessed kill, wave-4 species (eater): +1 observation, narrated
      const r1 = G.noteWitnessReportedKill(vid, 'eater', [w1]);
      U.r1 = r1; U.obs1 = (G.state.villageCounterObs || {}).eater | 0;
      U.beat1 = said.join(' ').includes('story') || said.join(' ').includes('watched');
      // 2. second witnessed kill: discovery fires
      const r2 = G.noteWitnessReportedKill(vid, 'eater', [w2]);
      U.r2 = r2; U.known = !!(G.state.villagerTricks || {}).eater;
      U.beat2 = said.join(' ').includes('COUNTER LEARNED');
      // 3. unwitnessed: nothing
      const obsBefore = (G.state.villageCounterObs || {}).spoiler | 0;
      const r3 = G.noteWitnessReportedKill(vid, 'spoiler', []);
      U.r3 = r3; U.obs3 = (G.state.villageCounterObs || {}).spoiler | 0; U.obs3Before = obsBefore;
      // 4. the scholar's own death is not this channel (player excluded)
      const r4 = G.noteWitnessReportedKill('player', 'eater', [w1]);
      U.r4 = r4;
      // 5. species with no trick: nothing
      const noTrick = (G.data.monsters || []).find(m => !m.counter && !(G.villagerTrickDefs()[m.id]));
      U.noTrickId = noTrick && noTrick.id;
      const r5 = noTrick ? G.noteWitnessReportedKill(vid, noTrick.id, [w1]) : 'n/a';
      U.r5 = r5; U.obs5 = noTrick ? ((G.state.villageCounterObs || {})[noTrick.id] | 0) : 'n/a';
      // 6. already-known species: no double credit
      G.state.monsterCounters = G.state.monsterCounters || {};
      const ctr = (G.data.monsters || []).find(m => m.counter && !G.state.monsterCounters[m.id]);
      U.ctrId = ctr && ctr.id;
      if (ctr) {
        G.noteWitnessReportedKill(vid, ctr.id, [w1]);
        G.noteWitnessReportedKill(vid, ctr.id, [w2]);
        U.ctrKnown = !!G.state.monsterCounters[ctr.id];
        const obsB = (G.state.villageCounterObs || {})[ctr.id] | 0;
        const r6 = G.noteWitnessReportedKill(vid, ctr.id, [w1]);
        const obsC = (G.state.villageCounterObs || {})[ctr.id] | 0;
        U.r6 = r6; U.obsB = obsB; U.obsC = obsC;
      }
      // 7. waves-1-2 ledger path via witness report: honest viaLine
      U.w12via = null;
      try {
        const ctr2 = (G.data.monsters || []).find(m => m.counter && !G.state.monsterCounters[m.id]);
        if (ctr2) {
          G.noteWitnessReportedKill(vid, ctr2.id, [w1]);
          G.noteWitnessReportedKill(vid, ctr2.id, [w2]);
          U.w12via = !!G.state.monsterCounters[ctr2.id];
          U.w12say = said.join(' ').includes('pieced it together from a death');
        }
      } catch (e) { U.w12err = String(e).slice(0, 200); }
      // 8. dead villager excluded from witness list
      const r8 = G.noteWitnessReportedKill(vid, 'audit', [vid]);
      U.r8 = r8; U.obs8 = (G.state.villageCounterObs || {}).audit | 0;
    }
    G.say = _say;
    out.u = U;
  `, { WITNESSLEARN: '1' });
  if (o.__err) console.log('  unit err: ' + o.__err);
  const u = o.u || {};
  ok(u.hasMethod === true, 'unit: noteWitnessReportedKill exists (RED→GREEN target)');
  ok(u.r1 === false, 'unit: first witnessed kill returns false (1/2, not learned)');
  ok(u.obs1 === 1, 'unit: witnessed kill grants exactly 1 observation credit');
  ok(u.beat1 === true, 'unit: the witness report is narrated (never silent)');
  ok(u.r2 === true, 'unit: second witnessed kill returns true (discovery)');
  ok(u.known === true, 'unit: eater trick learned via villagerTricks after 2 witness reports');
  ok(u.beat2 === true, 'unit: discovery narrates COUNTER LEARNED');
  ok(u.r3 === false, 'unit: unwitnessed kill returns false');
  ok(u.obs3 === u.obs3Before, 'unit: unwitnessed kill grants no credit');
  ok(u.r4 === false, 'unit: scholar death (player) is not the witness channel');
  ok(u.r5 === false, 'unit: no-trick species (' + u.noTrickId + ') grants nothing');
  ok(u.obs5 === 0, 'unit: no-trick species writes no observation');
  ok(u.r6 === false, 'unit: already-known species returns false (no double credit)');
  ok(u.obsC === u.obsB, 'unit: no observation credit after knowledge');
  ok(u.w12via === true, 'unit: waves-1-2 counter learnable via witness reports (ledger path)');
  ok(u.w12say === true, 'unit: ledger-path discovery narrates the honest witness viaLine');
  ok(u.r8 === false && u.obs8 === 0, 'unit: dead villager excluded from own witness list');
}

// ---------- ARC ----------
console.log('== ARC: end-to-end fieldFight one-round vDie ==');
{
  const o = gameEval(812, PRE + `
    const A = {};
    const G2 = Game;
    function setupDoomed() {
      const rs = ((G2.state.village || {}).roster || []).filter(v => v && v !== 'player');
      const lead = rs[0], wit = rs[1];
      // the lead is hanging by a thread — a one-round kill is honest
      G2.state.village = G2.state.village || {};
      G2.state.village.health = G2.state.village.health || {};
      G2.state.village.health[lead] = 1;
      const v = (G2.data.villagers || []).find(x => x.id === lead);
      if (v) { v.items = []; v.abilities = []; }
      return { lead: lead, wit: wit };
    }
    const mdef = G2.data.monsters.find(m => m.id === 'eater');
    // WITH witness, layer ON
    {
      const f = setupDoomed();
      const rec = G2.fieldFight(f.lead, mdef, null, { allies: 1, allyVids: [f.wit] });
      A.witOutcome = rec.outcome;
      A.witRounds = rec.rounds;
      A.witObs = (G2.state.villageCounterObs || {}).eater | 0;
      A.witBeat = said.join(' ').includes('story') || said.join(' ').includes('watched');
    }
    // WITHOUT witnesses, layer ON
    {
      G2.state.villageCounterObs = G2.state.villageCounterObs || {};
      delete G2.state.villageCounterObs.eater;
      const f = setupDoomed();
      const rec = G2.fieldFight(f.lead, mdef, null, {});
      A.noWitOutcome = rec.outcome;
      A.noWitObs = (G2.state.villageCounterObs || {}).eater | 0;
    }
    G2.say = _say;
    out.a = A;
  `, { WITNESSLEARN: '1' });
  if (o.__err) console.log('  arc err: ' + o.__err);
  const a = o.a || {};
  ok(a.witOutcome === 'vDie', 'arc: rigged fight is a one-round vDie (witnessed)');
  ok(a.witRounds === 1, 'arc: death happened in round 1 (the funnel target)');
  ok(a.witObs === 1, 'arc: witnessed one-round kill grants observation credit end-to-end');
  ok(a.witBeat === true, 'arc: witness report narrated in the real fight flow');
  ok(a.noWitOutcome === 'vDie', 'arc: rigged fight is a one-round vDie (unwitnessed)');
  ok(a.noWitObs === 0, 'arc: unwitnessed one-round kill grants nothing end-to-end');
}

// ---------- ARC: zero trace with layer OFF ----------
console.log('== ARC: WITNESSLEARN unset = zero trace ==');
{
  const o = gameEval(813, PRE + `
    const Z = {};
    const G2 = Game;
    const rs = ((G2.state.village || {}).roster || []).filter(v => v && v !== 'player');
    const lead = rs[0], wit = rs[1];
    G2.state.village = G2.state.village || {};
    G2.state.village.health = G2.state.village.health || {};
    G2.state.village.health[lead] = 1;
    const v = (G2.data.villagers || []).find(x => x.id === lead);
    if (v) { v.items = []; v.abilities = []; }
    const mdef = G2.data.monsters.find(m => m.id === 'eater');
    const rec = G2.fieldFight(lead, mdef, null, { allies: 1, allyVids: [wit] });
    Z.outcome = rec.outcome;
    Z.obs = (G2.state.villageCounterObs || {}).eater | 0;
    Z.beats = said.filter(s => /story|watched|came back with/i.test(s)).length;
    G2.say = _say;
    out.z = Z;
  `); // NO env — WITNESSLEARN unset
  if (o.__err) console.log('  zero-trace err: ' + o.__err);
  const z = o.z || {};
  ok(z.outcome === 'vDie', 'zero-trace: fight still resolves as vDie with layer off');
  ok(z.obs === 0, 'zero-trace: WITNESSLEARN unset → no observation credit');
  ok(z.beats === 0, 'zero-trace: WITNESSLEARN unset → no witness beats');
}

// ---------- DET-GATE ----------
console.log('== DET-GATE: identical-seed 40d pairs byte-identical (layer off) ==');
{
  const crypto = require('crypto');
  function digest(seed) {
    const code = `
const { loadGame, setupGame, runDays, quietLog } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'witnesslearn-det', fullTelemetry: false });
  await setupGame(Game);
  const policy = { id: 'det-nop', daily() {} };
  await quietLog(async () => { await runDays(Game, policy, { days: 40 }); });
  // wall-clock perf timings are not game state — exclude them from the digest
  const st2 = JSON.parse(JSON.stringify(Game.state));
  try { delete st2.pacing; } catch (e) {}
  const s = JSON.stringify({ st: st2, d: (Game.data.monsters || []).length });
  console.log(require('crypto').createHash('sha256').update(s).digest('hex'));
})().catch(e => { console.log('CRASH ' + String(e).slice(0, 200)); });
`;
    const f = '/tmp/witnesslearn-det-' + seed + '-' + process.pid + '.js';
    fs.writeFileSync(f, code);
    try {
      return execSync(`node ${f}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString().trim().split('\n').pop();
    } finally { try { fs.unlinkSync(f); } catch (e) {} }
  }
  const d1a = digest(821), d1b = digest(821), d2a = digest(822), d2b = digest(822);
  ok(/^[0-9a-f]{64}$/.test(d1a), 'det: run 821a produces a digest');
  ok(d1a === d1b, 'det: seed 821 pair byte-identical (layer off)');
  ok(d2a === d2b, 'det: seed 822 pair byte-identical (layer off)');
  ok(d1a !== d2a, 'det: different seeds differ (digest is live)');
}

// ---------- SMOKE ----------
console.log('== SMOKE: 20d run, WITNESSLEARN=1, no crash ==');
{
  const code = `
process.env.WITNESSLEARN = '1';
const { loadGame, setupGame, runDays, quietLog } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: 831, mode: 'witnesslearn-smoke', fullTelemetry: false });
  await setupGame(Game);
  const policy = { id: 'smoke-nop', daily() {} };
  let err = null;
  try { await quietLog(async () => { await runDays(Game, policy, { days: 20 }); }); }
  catch (e) { err = String(e && e.stack || e).slice(0, 500); }
  console.log(JSON.stringify({ err: err, day: (Game.state.scholar || {}).day || 0 }));
})().catch(e => { console.log(JSON.stringify({ err: 'CRASH ' + String(e).slice(0, 300) })); });
`;
  const f = '/tmp/witnesslearn-smoke-' + process.pid + '.js';
  fs.writeFileSync(f, code);
  let out;
  try {
    out = JSON.parse(execSync(`node ${f}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString().trim().split('\n').pop());
  } finally { try { fs.unlinkSync(f); } catch (e) {} }
  if (out && out.err) console.log('  smoke err: ' + out.err);
  ok(!out.err, 'smoke: 20d run with WITNESSLEARN=1 completes without crashing');
}

console.log(`\n== ${pass} passed, ${fail} failed ==`);
if (fails.length) { console.log('failures:'); fails.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);
