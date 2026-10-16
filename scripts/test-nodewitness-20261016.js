#!/usr/bin/env node
'use strict';
// test-nodewitness-20261016.js — proof record for the sim-nodewitness arm
// (axis scale-onramp): NODE-MATE/DEFENDER WITNESS OBSERVATION CHANNEL.
//
// The 2026-10-16 runs established the funnel: hyper-lethal wave-4/5 species
// (THE EATER 8/8 one-round kills, the Audit, the Cancellation) can never be
// learned under the 2-survived-encounter observation bar, and the
// sim-witnesslearn arm proved a witness-report mechanism (31/31) but died
// at pilot because its party-wiring witness pool was structurally empty at
// kill time (0/5 vDie witnessed). This arm wires the pool the engine
// actually stages: node-mates on the monster's tile (villagerMonsterTick's
// npcIds) and defenders at Haven (havenRaidTick) — read live at kill time
// via npcsOnNode in fieldFights.js, credited via noteNodeWitnessKill in
// game.js (next to _trickObservation).
//
// What changed (game code):
//   game.js — noteNodeWitnessKill(vid, mid, witnesses): node-witnessed
//     observation credit on the shared villageCounterObs bar (one kill =
//     one observation); discoverMonsterCounter viaLine gains the honest
//     'node-witnessed' case.
//   fieldFights.js — end-of-fight vDie block (NODEWITNESS=1 gated):
//     node-mates/defenders via npcsOnNode(m.tx, m.ty) + the standing party
//     ally report via noteNodeWitnessKill. Zero trace when unset.
//
// Sections:
//   UNIT — noteNodeWitnessKill: credit, narration, discovery, negatives.
//   ARC  — full fieldFight: node-mate-witnessed one-round vDie credits;
//          lone vDie credits nothing; m=null (no coords) credits nothing;
//          NODEWITNESS unset = zero trace.
//   DET  — identical-seed 40d pairs, NODEWITNESS unset: byte-identical.
//   SMOKE — 20d run with NODEWITNESS=1: no crash.
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
  const tmpFile = '/tmp/nodewitness-synth-' + seed + '-' + process.pid + '.js';
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
console.log('== UNIT: noteNodeWitnessKill ==');
{
  const o = gameEval(811, PRE + `
    const U = {};
    U.hasMethod = typeof G.noteNodeWitnessKill === 'function';
    if (U.hasMethod) {
      // 1. witnessed kill, wave-4 species (eater): +1 observation, narrated
      const r1 = G.noteNodeWitnessKill(vid, 'eater', [w1]);
      U.r1 = r1; U.obs1 = (G.state.villageCounterObs || {}).eater | 0;
      U.beat1 = said.join(' ').includes('story') || said.join(' ').includes('watched');
      U.noDoubleArticle = !said.join(' ').includes('the The ');
      // 2. second witnessed kill: discovery fires
      const r2 = G.noteNodeWitnessKill(vid, 'eater', [w2]);
      U.r2 = r2; U.known = !!(G.state.villagerTricks || {}).eater;
      U.beat2 = said.join(' ').includes('COUNTER LEARNED');
      U.beat2secondhand = said.join(' ').includes('pieced it together from the death');
      // 3. unwitnessed: nothing
      const obsBefore = (G.state.villageCounterObs || {}).spoiler | 0;
      const r3 = G.noteNodeWitnessKill(vid, 'spoiler', []);
      U.r3 = r3; U.obs3 = (G.state.villageCounterObs || {}).spoiler | 0; U.obs3Before = obsBefore;
      // 4. the scholar's own death is not this channel (player excluded)
      const r4 = G.noteNodeWitnessKill('player', 'eater', [w1]);
      U.r4 = r4;
      // 5. species with no trick: nothing
      const noTrick = (G.data.monsters || []).find(m => !m.counter && !(G.villagerTrickDefs()[m.id]));
      U.noTrickId = noTrick && noTrick.id;
      const r5 = noTrick ? G.noteNodeWitnessKill(vid, noTrick.id, [w1]) : 'n/a';
      U.r5 = r5; U.obs5 = noTrick ? ((G.state.villageCounterObs || {})[noTrick.id] | 0) : 'n/a';
      // 6. already-known species: no double credit
      const obsB = (G.state.villageCounterObs || {}).eater | 0;
      const r6 = G.noteNodeWitnessKill(vid, 'eater', [w1]);
      const obsC = (G.state.villageCounterObs || {}).eater | 0;
      U.r6 = r6; U.obsB = obsB; U.obsC = obsC;
      // 7. waves-1-2 ledger path via node witness: honest viaLine
      U.w12via = null;
      try {
        const ctr2 = (G.data.monsters || []).find(m => m.counter && !((G.state.monsterCounters || {})[m.id]));
        if (ctr2) {
          G.noteNodeWitnessKill(vid, ctr2.id, [w1]);
          G.noteNodeWitnessKill(vid, ctr2.id, [w2]);
          U.w12via = !!G.state.monsterCounters[ctr2.id];
          U.w12say = said.join(' ').includes('pieced it together from a death');
        }
      } catch (e) { U.w12err = String(e).slice(0, 200); }
      // 8. dead villager excluded from own witness list
      const r8 = G.noteNodeWitnessKill(vid, 'audit', [vid]);
      U.r8 = r8; U.obs8 = (G.state.villageCounterObs || {}).audit | 0;
      // 9. non-roster witness filtered out
      const r9 = G.noteNodeWitnessKill(vid, 'audit', ['not-a-villager']);
      U.r9 = r9; U.obs9 = (G.state.villageCounterObs || {}).audit | 0;
      // 10. duplicate witnesses: still exactly one credit
      const obsD = (G.state.villageCounterObs || {}).cancellation | 0;
      G.noteNodeWitnessKill(vid, 'cancellation', [w1, w1, w1]);
      U.obsD = (G.state.villageCounterObs || {}).cancellation | 0; U.obsDBefore = obsD;
    }
    G.say = _say;
    out.u = U;
  `, { NODEWITNESS: '1' });
  if (o.__err) console.log('  unit err: ' + o.__err);
  const u = o.u || {};
  ok(u.hasMethod === true, 'unit: noteNodeWitnessKill exists (RED→GREEN target)');
  ok(u.r1 === false, 'unit: first witnessed kill returns false (1/2, not learned)');
  ok(u.obs1 === 1, 'unit: witnessed kill grants exactly 1 observation credit');
  ok(u.beat1 === true, 'unit: the witness report is narrated (never silent)');
  ok(u.noDoubleArticle === true, 'unit: no "the The X" article doubling in the beat');
  ok(u.r2 === true, 'unit: second witnessed kill returns true (discovery)');
  ok(u.known === true, 'unit: eater trick learned via villagerTricks after 2 witness reports');
  ok(u.beat2 === true, 'unit: discovery narrates COUNTER LEARNED');
  ok(u.beat2secondhand === true, 'unit: discovery framed second-hand (witnessed, not survived)');
  ok(u.r3 === false, 'unit: unwitnessed kill returns false');
  ok(u.obs3 === u.obs3Before, 'unit: unwitnessed kill grants no credit');
  ok(u.r4 === false, 'unit: scholar death (player) is not the witness channel');
  ok(u.r5 === false, 'unit: no-trick species (' + u.noTrickId + ') grants nothing');
  ok(u.obs5 === 0, 'unit: no-trick species writes no observation');
  ok(u.r6 === false, 'unit: already-known species returns false (no double credit)');
  ok(u.obsC === u.obsB, 'unit: no observation credit after knowledge');
  ok(u.w12via === true, 'unit: waves-1-2 counter learnable via node-witness reports (ledger path)');
  ok(u.w12say === true, 'unit: ledger-path discovery narrates the honest witness viaLine');
  ok(u.r8 === false && u.obs8 === 0, 'unit: dead villager excluded from own witness list');
  ok(u.r9 === false && u.obs9 === 0, 'unit: non-roster witness filtered out');
  ok(u.obsD === u.obsDBefore + 1, 'unit: duplicate witnesses still grant exactly one credit');
}

// ---------- ARC: node-mate witness ----------
console.log('== ARC: end-to-end fieldFight node-mate-witnessed vDie ==');
{
  const o = gameEval(812, PRE + `
    const A = {};
    const G2 = Game;
    function setupDoomed(withWitness) {
      const rs = ((G2.state.village || {}).roster || []).filter(v => v && v !== 'player');
      const lead = rs[0], wit = rs[1];
      G2.state.village = G2.state.village || {};
      G2.state.village.health = G2.state.village.health || {};
      G2.state.village.health[lead] = 1;
      const v = (G2.data.villagers || []).find(x => x.id === lead);
      if (v) { v.items = []; v.abilities = []; }
      // node-mates: both on the monster's tile — or the witness far away
      G2.npcSetNode(lead, 5, 5);
      G2.npcSetNode(wit, withWitness ? 5 : 6, withWitness ? 5 : 6);
      return { lead: lead, wit: wit };
    }
    const mdef = G2.data.monsters.find(m => m.id === 'eater');
    function monsterAt(tx, ty) { return { id: 'eater', tx: tx, ty: ty, hp: 1200, maxHp: 1200 }; }
    // WITH node-mate witness, layer ON
    {
      const f = setupDoomed(true);
      const rec = G2.fieldFight(f.lead, mdef, monsterAt(5, 5), {});
      A.witOutcome = rec.outcome;
      A.witRounds = rec.rounds;
      A.witObs = (G2.state.villageCounterObs || {}).eater | 0;
      A.witBeat = said.join(' ').includes('story') || said.join(' ').includes('watched');
    }
    // WITHOUT node-mate (witness on another node), layer ON
    {
      G2.state.villageCounterObs = G2.state.villageCounterObs || {};
      delete G2.state.villageCounterObs.eater;
      said.length = 0;
      const f = setupDoomed(false);
      const rec = G2.fieldFight(f.lead, mdef, monsterAt(5, 5), {});
      A.noWitOutcome = rec.outcome;
      A.noWitObs = (G2.state.villageCounterObs || {}).eater | 0;
    }
    // m=null (expedition shape: no coords): node-mate present but unwirable
    {
      delete G2.state.villageCounterObs.eater;
      said.length = 0;
      const f = setupDoomed(true);
      const rec = G2.fieldFight(f.lead, mdef, null, {});
      A.nullMOutcome = rec.outcome;
      A.nullMObs = (G2.state.villageCounterObs || {}).eater | 0;
    }
    G2.say = _say;
    out.a = A;
  `, { NODEWITNESS: '1' });
  if (o.__err) console.log('  arc err: ' + o.__err);
  const a = o.a || {};
  ok(a.witOutcome === 'vDie', 'arc: rigged fight is a one-round vDie (node-mate present)');
  ok(a.witRounds === 1, 'arc: death happened in round 1 (the funnel target)');
  ok(a.witObs === 1, 'arc: node-mate-witnessed kill grants observation credit end-to-end');
  ok(a.witBeat === true, 'arc: witness report narrated in the real fight flow');
  ok(a.noWitOutcome === 'vDie', 'arc: rigged fight is a one-round vDie (witness elsewhere)');
  ok(a.noWitObs === 0, 'arc: kill with no node-mate present grants nothing');
  ok(a.nullMObs === 0, 'arc: m=null (no coords) grants nothing — pool honestly unwirable');
}

// ---------- ARC: zero trace with layer OFF ----------
console.log('== ARC: NODEWITNESS unset = zero trace ==');
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
    G2.npcSetNode(lead, 5, 5);
    G2.npcSetNode(wit, 5, 5);
    const mdef = G2.data.monsters.find(m => m.id === 'eater');
    const rec = G2.fieldFight(lead, mdef, { id: 'eater', tx: 5, ty: 5, hp: 1200, maxHp: 1200 }, {});
    Z.outcome = rec.outcome;
    Z.obs = (G2.state.villageCounterObs || {}).eater | 0;
    Z.beats = said.filter(s => /story|watched|came back with/i.test(s)).length;
    G2.say = _say;
    out.z = Z;
  `); // NO env — NODEWITNESS unset
  if (o.__err) console.log('  zero-trace err: ' + o.__err);
  const z = o.z || {};
  ok(z.outcome === 'vDie', 'zero-trace: fight still resolves as vDie with layer off');
  ok(z.obs === 0, 'zero-trace: NODEWITNESS unset → no observation credit');
  ok(z.beats === 0, 'zero-trace: NODEWITNESS unset → no witness beats');
}

// ---------- DET-GATE ----------
console.log('== DET-GATE: identical-seed 40d pairs byte-identical (layer off) ==');
{
  const crypto = require('crypto');
  function digest(seed) {
    const code = `
const { loadGame, setupGame, runDays, quietLog } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'nodewitness-det', fullTelemetry: false });
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
    const f = '/tmp/nodewitness-det-' + seed + '-' + process.pid + '.js';
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
console.log('== SMOKE: 20d run, NODEWITNESS=1, no crash ==');
{
  const code = `
process.env.NODEWITNESS = '1';
const { loadGame, setupGame, runDays, quietLog } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: 831, mode: 'nodewitness-smoke', fullTelemetry: false });
  await setupGame(Game);
  const policy = { id: 'smoke-nop', daily() {} };
  let err = null;
  try { await quietLog(async () => { await runDays(Game, policy, { days: 20 }); }); }
  catch (e) { err = String(e && e.stack || e).slice(0, 500); }
  console.log(JSON.stringify({ err: err, day: (Game.state.scholar || {}).day || 0 }));
})().catch(e => { console.log(JSON.stringify({ err: 'CRASH ' + String(e).slice(0, 300) })); });
`;
  const f = '/tmp/nodewitness-smoke-' + process.pid + '.js';
  fs.writeFileSync(f, code);
  let out;
  try {
    out = JSON.parse(execSync(`node ${f}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString().trim().split('\n').pop());
  } finally { try { fs.unlinkSync(f); } catch (e) {} }
  if (out && out.err) console.log('  smoke err: ' + out.err);
  ok(!out.err, 'smoke: 20d run with NODEWITNESS=1 completes without crashing');
}

console.log(`\n== ${pass} passed, ${fail} failed ==`);
if (fails.length) { console.log('failures:'); fails.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);
