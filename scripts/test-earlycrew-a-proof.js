#!/usr/bin/env node
// scripts/test-earlycrew-a-proof.js — sim-earlycrew-a mechanism proof
// (post-verdict form). Proves the CREW PATH + ROUTER GAP the arm
// measured, with direct engine assignments, so it stays green on the
// final tree after the NO-GO policy variant was deleted (the
// policy-pair form of this proof ran PROOF-GREEN before deletion —
// policy ON assigned a pair via upkeep (ecPairs 1, ecAssigned 2),
// policy OFF clean, snapshot carried the pair, tile-present crewed
// wild meeting passed allies=1 with the mate named and
// allyFromStart=false, direct allyFromStart worked, solo control
// allies=0 — quoted in evidence/2026-10-28/sim-earlycrew-a.md).
// Fixture (single process, seeded harness): trusted villagers +
// Game.assignTask (the engine's own willingness verb) must (1)
// assign a forage pair, (2) snapshot it into Game._outdoorCrew at
// resolveAssignments, and (3) feed a resolveWildMonsterEncounter
// whose crew-mate ALSO stands on the monster tile — which must
// still receive NO allyFromStart flag (the wild router never passes
// it; only aidFight sets it). (4) Positive control: fieldFight
// called DIRECTLY with allyFromStart:true DOES put the ally in from
// round 1. (5) Solo control: crew cleared, same call passes allies 0.
// No src/js change; the fixture only sets trust (a precondition the
// engine's own obedience gate requires) and reads/captures engine calls.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function fail(msg) { console.error('PROOF FAIL: ' + msg); process.exit(1); }
async function main() {
  const { Game } = await loadGame({ seed: 75101, mode: 'earlycrew-a-proof', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).slice();
  if (roster.length < 4) fail('roster too small: ' + roster.length);
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
  const assigned0 = [];
  for (const id of pool) {
    if (assigned0.length >= 2) break;
    try { Game.assignTask(id, 'forage', { via: 'in-person' }); } catch (e) { continue; }
    if ((Game.state.village.assignments || {})[id] && Game.state.village.assignments[id].task === 'forage') assigned0.push(id);
  }
  console.log(`assign: forageAssigned=${JSON.stringify(assigned0)}`);
  if (assigned0.length < 2) fail('fewer than 2 forage assignments');
  // (2) Snapshot carries the pair; leader/mate are the assigned pair.
  const leader = assigned0[0], mate = assigned0[1];
  try { Game.resolveAssignments(); } catch (e) { fail('resolveAssignments threw: ' + e.message); }
  const crew = (Game._outdoorCrew || []).slice();
  console.log(`snapshot: _outdoorCrew=${JSON.stringify(crew)}`);
  if (crew.indexOf(leader) < 0 || crew.indexOf(mate) < 0) fail('snapshot missing pair members');
  const defs = (Game.data.monsters || []).filter(d => d && (d.wave | 0) === 1 && d.attack);
  if (!defs.length) fail('no wave-1 monster def');
  const def = defs[0];
  // Fixture-only placement: the mate stands on the monster tile.
  try {
    Game.state.village.nodePos = Game.state.village.nodePos || {};
    Game.state.village.nodePos[mate] = { nx: 4, ny: 4 };
    Game.state.village.nodePos[leader] = { nx: 4, ny: 4 };
  } catch (e) { fail('fixture nodePos set threw: ' + e.message); }
  const origFF = Game.fieldFight;
  let captured = null;
  Game.fieldFight = function (vid, mdef, m, opts) {
    captured = { allies: (opts && opts.allies) | 0, allyVids: (opts && opts.allyVids || []).slice(), allyFromStart: !!(opts && opts.allyFromStart) };
    return origFF.apply(this, arguments);
  };
  let rec = null;
  try { rec = Game.resolveWildMonsterEncounter(leader, { id: def.id, tx: 4, ty: 4, hp: def.hp || 100 }); }
  catch (e) { fail('resolveWild threw: ' + e.message); }
  finally { Game.fieldFight = origFF; }
  console.log(`tile-present crewed meeting: captured=${JSON.stringify(captured)} outcome=${rec && rec.outcome} calledHelp=${rec && rec.calledHelp} allyVid=${rec && rec.allyVid}`);
  if (!captured) fail('fieldFight was not called by resolveWild');
  if (captured.allies < 1 || captured.allyVids.indexOf(mate) < 0) fail('crewed meeting did not name the tile-present mate: ' + JSON.stringify(captured));
  if (captured.allyFromStart) fail('wild router PASSED allyFromStart — the from-start premise is wrong, re-read the router');
  // (C) Positive control: direct fieldFight with allyFromStart.
  let rec2 = null;
  try {
    rec2 = Game.fieldFight(leader, def, { id: def.id, tx: 4, ty: 4, hp: def.hp || 100 },
      { allies: 1, allyVids: [mate], allyFromStart: true });
  } catch (e) { fail('direct allyFromStart fieldFight threw: ' + e.message); }
  const logJoined = ((rec2 && rec2.log) || []).some(l => String(l).indexOf('already at the door') >= 0);
  console.log(`direct allyFromStart: allyVid=${rec2 && rec2.allyVid} calledHelp=${rec2 && rec2.calledHelp} doorLog=${logJoined} outcome=${rec2 && rec2.outcome}`);
  if (!logJoined || !(rec2 && rec2.allyVid)) fail('direct allyFromStart did not put the ally in from round 1');
  // (D) Solo control.
  Game._outdoorCrew = [];
  let capturedSolo = null;
  Game.fieldFight = function (vid, mdef, m, opts) {
    capturedSolo = { allies: (opts && opts.allies) | 0, allyVids: (opts && opts.allyVids || []).slice(), allyFromStart: !!(opts && opts.allyFromStart) };
    return origFF.apply(this, arguments);
  };
  try { Game.resolveWildMonsterEncounter(leader, { id: def.id, tx: 4, ty: 4, hp: def.hp || 100 }); }
  catch (e) { fail('solo resolveWild threw: ' + e.message); }
  finally { Game.fieldFight = origFF; }
  console.log(`solo control: captured=${JSON.stringify(capturedSolo)}`);
  if (!capturedSolo) fail('solo fieldFight was not called');
  if (capturedSolo.allies !== 0 || capturedSolo.allyVids.length !== 0) fail('solo control passed allies: ' + JSON.stringify(capturedSolo));
  console.log('PROOF-GREEN: pair assigned, snapshot fed, tile-present crewed wild meeting passes NO allyFromStart (router gap proven); direct allyFromStart works (capability exists); solo control allies 0');
}
main().catch(e => { console.error(e); process.exit(1); });
