#!/usr/bin/env node
// scripts/test-fullseat-stage-a.js — sim-fullseat-stage-a fixture proof.
//
// Question (held claim from sim-sysbond-a): docs/TABLE.md's full-seat
// line says stage >= 3, while the table.js seat comment describes
// deedGateReady() with stage >= 2. Which is true in code?
//
// Method: load the FULL src/js list in index.html order via the shared
// sim harness (seeded Math.random BEFORE eval; Game.save is NEVER
// stubbed). NO gate function is stubbed anywhere: every seat answer
// below is read out of the REAL deedGateReady() and the REAL
// tableSeat(), and every Relay answer out of the REAL
// tableEarnedPaths() under a REAL lesser seat (no tableSeat stub —
// the lesser-legs state below genuinely prices as 'lesser').
// Only narration (say) is silenced, and it is restored at the end.
// Integration stage is constructed through the real mapping:
// integrationStage() returns 0 without systemArrived, else 3 at
// integration >= 80, 2 at >= 40, 1 below that — each cell asserts
// the mapped stage BEFORE the seat is judged (prereg F4).
//
// Expected (code reading, pre-registered in
// evidence/2026-10-28/sim-fullseat-stage-a-prereg.md):
//   FULL legs met + stage 2 -> deedGateReady ok, seat 'full'
//   FULL legs met + stage 3 -> deedGateReady ok, seat 'full'
//   FULL legs met + stage 1 -> NOT ok, seat not 'full'
//   FULL legs met + stage 0 -> NOT ok, seat not 'full'
//   LESSER legs met + stage 2 -> seat 'lesser' (not 'full')
//   LESSER legs met + stage 1 -> seat 'none'
//   LESSER legs met + stage 3 -> seat 'lesser' (stage alone
//     does not promote to full without the full bars)
//   Relay prereq is a PATH bar, not a seat bar: lesser seat +
//     stage 3 earns relay; lesser + stage 2 + office earns relay;
//     lesser + stage 2 without office does not.
// Exit 0 on all-pass, 1 otherwise.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'fullseat-stage-a' });
  await setupGame(Game, 'Columbus, Ohio');
  const origSay = Game.say;
  Game.say = function () {}; // silence narration; no game logic reads say's return

  const byWave = {};
  for (const m of Game.data.monsters || []) (byWave[m.wave || 1] = byWave[m.wave || 1] || []).push(m.id);

  function setIntegration(stage) {
    if (stage === 0) { Game.state.systemArrived = false; Game.state.scholar.integration = 5; }
    else {
      Game.state.systemArrived = true;
      Game.state.scholar.integration = stage === 3 ? 85 : stage === 2 ? 45 : 5;
    }
    return Game.integrationStage();
  }
  function setFullLegs() {
    const need = { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 };
    const d = Game.deedState();
    d.wavesFaced = {};
    for (const w of Object.keys(need)) for (const id of (byWave[w] || []).slice(0, need[w])) d.wavesFaced[id] = +w;
    d.contestsSurvived = 3;
    const pg = Game.progState();
    pg.crises = { a: 1, b: 1, c: 1 };
    pg.sentimentTaught = true;
    Game.state.scholar.prog = Game.state.scholar.prog || {};
    Game.state.scholar.prog.feastSurgeUsed = true;
    Game.state.nationalLive = true;
    Game.state.switchboard = null;
  }
  function setLesserLegs() {
    const need = { 1: 4, 2: 4, 3: 3 };
    const d = Game.deedState();
    d.wavesFaced = {};
    for (const w of Object.keys(need)) for (const id of (byWave[w] || []).slice(0, need[w])) d.wavesFaced[id] = +w;
    d.contestsSurvived = 2;
    const pg = Game.progState();
    pg.crises = { a: 1, b: 1 };
    pg.sentimentTaught = true;
    Game.state.scholar.prog = Game.state.scholar.prog || {};
    Game.state.scholar.prog.feastSurgeUsed = true;
    Game.state.nationalLive = true;
  }
  function gate() {
    const g = Game.deedGateReady();
    const seat = Game.tableSeat();
    return { g, seat: seat.seat, detail: seat.detail || {} };
  }

  // --- FULL-seat stage sweep: every other full leg satisfied ---
  console.log('FULL-SEAT stage sweep (all other full legs met):');
  setFullLegs();
  let st = setIntegration(0);
  let r = gate();
  console.log(`  stage${st} -> deedGateReady ok=${r.g.ok} stageOk=${r.g.stageOk} waves=${r.g.waves} contests=${r.g.contests} crises=${r.g.crises} scale=${r.g.scale} food=${r.g.foodDeeds} seat=${r.seat}`);
  ok(st === 0, 'stage construction: no system -> stage 0', 'stage=' + st);
  ok(r.g.stageOk === false && r.g.ok === false, 'full legs + stage 0 -> deedGateReady NOT ok', JSON.stringify({ ok: r.g.ok, stageOk: r.g.stageOk }));
  ok(r.seat !== 'full', 'full legs + stage 0 -> seat is not full', 'seat=' + r.seat);

  setFullLegs(); st = setIntegration(1); r = gate();
  console.log(`  stage${st} -> deedGateReady ok=${r.g.ok} stageOk=${r.g.stageOk} seat=${r.seat}`);
  ok(st === 1, 'stage construction: integration 5 -> stage 1', 'stage=' + st);
  ok(r.g.stageOk === false && r.g.ok === false, 'full legs + stage 1 -> deedGateReady NOT ok', JSON.stringify({ ok: r.g.ok, stageOk: r.g.stageOk }));
  ok(r.seat !== 'full', 'full legs + stage 1 -> seat is not full', 'seat=' + r.seat);

  setFullLegs(); st = setIntegration(2); r = gate();
  console.log(`  stage${st} -> deedGateReady ok=${r.g.ok} stageOk=${r.g.stageOk} rank=${r.g.rank} seat=${r.seat}`);
  ok(st === 2, 'stage construction: integration 45 -> stage 2', 'stage=' + st);
  ok(r.g.waves && r.g.contests && r.g.crises && r.g.scale && r.g.foodDeeds, 'full legs + stage 2 -> every non-stage leg met', JSON.stringify(r.g));
  ok(r.g.stageOk === true && r.g.ok === true, 'full legs + stage 2 -> deedGateReady OK (stage >= 2, not >= 3)', JSON.stringify({ ok: r.g.ok, stageOk: r.g.stageOk }));
  ok(r.seat === 'full', 'full legs + stage 2 -> tableSeat is FULL', 'seat=' + r.seat);

  setFullLegs(); st = setIntegration(3); r = gate();
  console.log(`  stage${st} -> deedGateReady ok=${r.g.ok} stageOk=${r.g.stageOk} seat=${r.seat}`);
  ok(st === 3, 'stage construction: integration 85 -> stage 3', 'stage=' + st);
  ok(r.g.ok === true && r.seat === 'full', 'full legs + stage 3 -> deedGateReady OK, seat FULL', 'seat=' + r.seat);

  // --- One-leg-missing controls at stage 2 (prove the stage cells decide) ---
  console.log('FULL-SEAT controls at stage 2 (one leg missing each):');
  setFullLegs(); setIntegration(2); Game.state.scholar.prog.feastSurgeUsed = false; r = gate();
  ok(r.g.ok === false && r.seat !== 'full', 'stage 2, no feast surge -> NOT full', 'seat=' + r.seat);
  setFullLegs(); setIntegration(2); Game.state.nationalLive = false; r = gate();
  console.log(`  national off -> rank=${r.g.rank} scale=${r.g.scale} ok=${r.g.ok} seat=${r.seat}`);
  ok(r.g.scale === false && r.g.ok === false, 'stage 2, national off -> scale leg fails, NOT ok', JSON.stringify({ scale: r.g.scale, ok: r.g.ok }));
  setFullLegs(); setIntegration(2); Game.deedState().contestsSurvived = 2; r = gate();
  ok(r.g.ok === false && r.seat === 'lesser', 'stage 2, contests 2 (not 3) -> NOT full, falls to lesser', 'seat=' + r.seat);

  // --- LESSER seat: its own stage bar, and stage alone never promotes ---
  console.log('LESSER-SEAT cells (lesser legs only):');
  setLesserLegs(); st = setIntegration(2); r = gate();
  ok(r.seat === 'lesser', 'lesser legs + stage 2 -> seat LESSER', 'seat=' + r.seat);
  ok(r.g.ok === false, 'lesser legs + stage 2 -> deedGateReady NOT ok (full bars unmet)', JSON.stringify({ ok: r.g.ok }));
  setLesserLegs(); st = setIntegration(1); r = gate();
  ok(r.seat === 'none', 'lesser legs + stage 1 -> seat NONE (lesser also needs stage >= 2)', 'seat=' + r.seat);
  setLesserLegs(); st = setIntegration(3); r = gate();
  ok(r.seat === 'lesser', 'lesser legs + stage 3 -> seat LESSER, not full (stage alone does not promote)', 'seat=' + r.seat);

  // --- RELAY prereq branches under a REAL lesser seat (path bar, not seat bar) ---
  console.log('RELAY prereq under a real lesser seat:');
  function relayUnderLesser(stage, office) {
    setLesserLegs(); setIntegration(stage);
    Game.state.switchboard = office ? { holderId: 'fixture-holder', appointedDay: 1, stage: 'village relay' } : null;
    const seat = Game.tableSeat();
    const relay = (Game.tableEarnedPaths() || []).find(p => p.id === 'relay') || null;
    return { seat: seat.seat, earned: !!(relay && relay.earned), strength: relay ? relay.strength : 0, why: relay ? relay.why : '(no relay entry)' };
  }
  const rel3 = relayUnderLesser(3, false);
  console.log(`  lesser + stage 3, no office -> seat=${rel3.seat} relay earned=${rel3.earned} strength=${rel3.strength}`);
  ok(rel3.seat === 'lesser' && rel3.earned === true, 'lesser + stage 3 -> relay earned (path prereq, not a seat)', JSON.stringify(rel3));
  const rel2o = relayUnderLesser(2, true);
  console.log(`  lesser + stage 2 + office -> seat=${rel2o.seat} relay earned=${rel2o.earned} strength=${rel2o.strength}`);
  ok(rel2o.seat === 'lesser' && rel2o.earned === true, 'lesser + stage 2 + office -> relay earned', JSON.stringify(rel2o));
  const rel2n = relayUnderLesser(2, false);
  console.log(`  lesser + stage 2, no office -> seat=${rel2n.seat} relay earned=${rel2n.earned}`);
  ok(rel2n.seat === 'lesser' && rel2n.earned === false, 'lesser + stage 2, no office -> relay NOT earned', JSON.stringify(rel2n));

  Game.say = origSay;
  console.log(`TEST-FULLSEAT-STAGE-A ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST-FULLSEAT-STAGE-A harness error', e); process.exit(1); });
