#!/usr/bin/env node
// scripts/test-outdoorcrew-a-proof.js — sim-outdoorcrew-a mechanism proof
// (post-verdict form). Proves the CREW PATH the arm measured, with
// direct engine assignments, so it stays green on the final tree
// after the NO-GO policy variant was deleted (the policy-pair form
// of this proof ran PROOF-GREEN before deletion — pair assigned via
// the policy upkeep, snapshot carried both members, crewed meeting
// passed allies=1 with the mate named, solo control allies=0,
// layer OFF clean — quoted in evidence/2026-10-28/sim-outdoorcrew-a.md).
// Fixture (single process, seeded harness): trusted villagers +
// Game.assignTask (the engine's own willingness verb) must (1)
// assign a forage pair, (2) snapshot it into Game._outdoorCrew at
// resolveAssignments, and (3) feed a resolveWildMonsterEncounter so
// fieldFight receives allies/allyVids naming the crew-mate; with the
// crew cleared, the same call must pass allies 0 (solo control).
// No src/js change; the fixture only sets trust (a precondition the
// engine's own obedience gate requires) and reads/captures engine calls.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function fail(msg) { console.error('PROOF FAIL: ' + msg); process.exit(1); }
async function main() {
  const { Game } = await loadGame({ seed: 75101, mode: 'outdoorcrew-a-proof', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).slice();
  if (roster.length < 4) fail('roster too small: ' + roster.length);
  // Fixture precondition: trusted villagers (the engine's obedience
  // gate for forage is trust >= 20; default trust is 10).
  const pool = [];
  for (const id of roster) {
    if (id === Game.villagerId) continue;
    try { const p = Game.getPerson(id); if (!p || p.dead) continue; } catch (e) { continue; }
    pool.push(id);
    if (pool.length >= 6) break;
  }
  if (pool.length < 4) fail('pool too small');
  v.trust = v.trust || {};
  for (const id of pool) v.trust[id] = 60;
  // (1) Assign a forage pair through the engine's own verb.
  const assigned = [];
  for (const id of pool) {
    if (assigned.length >= 2) break;
    try { Game.assignTask(id, 'forage', { via: 'in-person' }); } catch (e) { continue; }
    if ((Game.state.village.assignments || {})[id] && Game.state.village.assignments[id].task === 'forage') assigned.push(id);
  }
  console.log(`assign: forageAssigned=${JSON.stringify(assigned)}`);
  if (assigned.length < 2) fail('fewer than 2 forage assignments');
  // (2) Snapshot carries the pair.
  try { Game.resolveAssignments(); } catch (e) { fail('resolveAssignments threw: ' + e.message); }
  const crew = (Game._outdoorCrew || []).slice();
  console.log(`snapshot: _outdoorCrew=${JSON.stringify(crew)}`);
  if (assigned.some(id => crew.indexOf(id) < 0)) fail('snapshot missing pair members: ' + JSON.stringify(crew));
  // (3) A wild meeting feeds the crew into fieldFight.
  const defs = (Game.data.monsters || []).filter(d => d && (d.wave | 0) === 1 && d.attack);
  if (!defs.length) fail('no wave-1 monster def');
  const def = defs[0];
  const leader = assigned[0], mate = assigned[1];
  let captured = null;
  const origFF = Game.fieldFight;
  Game.fieldFight = function (vid, mdef, m, opts) {
    captured = { allies: (opts && opts.allies) | 0, allyVids: (opts && opts.allyVids || []).slice() };
    return origFF.apply(this, arguments);
  };
  let rec = null;
  try {
    rec = Game.resolveWildMonsterEncounter(leader, { id: def.id, tx: 4, ty: 4, hp: def.hp || 100 });
  } catch (e) { fail('resolveWild threw: ' + e.message); }
  finally { Game.fieldFight = origFF; }
  console.log(`crewed meeting: captured=${JSON.stringify(captured)} outcome=${rec && rec.outcome} calledHelp=${rec && rec.calledHelp} allyVid=${rec && rec.allyVid}`);
  if (!captured) fail('fieldFight was not called by resolveWild');
  if (captured.allies < 1) fail('crewed meeting passed allies 0');
  if (captured.allyVids.indexOf(mate) < 0) fail('allyVids missing crew-mate ' + mate + ': ' + JSON.stringify(captured.allyVids));
  // Solo control: crew cleared, same call shape passes allies 0.
  Game._outdoorCrew = [];
  let capturedSolo = null;
  Game.fieldFight = function (vid, mdef, m, opts) {
    capturedSolo = { allies: (opts && opts.allies) | 0, allyVids: (opts && opts.allyVids || []).slice() };
    return origFF.apply(this, arguments);
  };
  try {
    Game.resolveWildMonsterEncounter(leader, { id: def.id, tx: 4, ty: 4, hp: def.hp || 100 });
  } catch (e) { fail('solo resolveWild threw: ' + e.message); }
  finally { Game.fieldFight = origFF; }
  console.log(`solo control: captured=${JSON.stringify(capturedSolo)}`);
  if (!capturedSolo) fail('solo fieldFight was not called');
  if (capturedSolo.allies !== 0 || capturedSolo.allyVids.length !== 0) fail('solo control passed allies: ' + JSON.stringify(capturedSolo));
  console.log('PROOF-GREEN: pair assigned, snapshot fed, crewed meeting allies>=1 with mate named, solo control allies 0');
}
main().catch(e => { console.error(e); process.exit(1); });
