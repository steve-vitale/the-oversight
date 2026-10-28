#!/usr/bin/env node
// scripts/test-earlycrew-a-proof.js — sim-earlycrew-a mechanism proof.
// Proves, in one seeded harness process:
//   (A) the earlycrew policy layer, ON, assigns a forage pair through
//       the engine's own assignTask verb and counts ec* ctx surface;
//       OFF, it assigns nothing and adds no ec* surface (det-gate
//       shape; the full 180d det-gate lives in test-earlycrew-a-sweep.js
//       --detgate).
//   (B) the from-start question at code level: a wild meeting whose
//       crew-mate is BOTH in _outdoorCrew AND standing on the monster
//       tile (nodePos set in the fixture — test setup only, never
//       policy behaviour) still receives NO allyFromStart flag from
//       resolveWildMonsterEncounter: the wild router never passes it.
//       Only aidFight sets it.
//   (C) positive control: fieldFight called DIRECTLY with
//       allyFromStart:true DOES put the ally in from round 1 (log
//       line "already at the door"), so (B) is a router gap, not a
//       missing engine capability.
//   (D) solo control: crew cleared, same wild call passes allies 0.
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
  // (A) Policy layer ON assigns a pair; OFF assigns nothing.
  process.env.EARLYCREW = '1';
  const { earlycrew } = require('./policies/earlycrew');
  const ctx = {};
  // upkeep needs the scholar at Haven; the harness starts there.
  try { earlycrew.upkeep(Game, ctx); } catch (e) { fail('upkeep ON threw: ' + e.message); }
  const asgOn = Object.keys(Game.state.village.assignments || {}).filter(id => (Game.state.village.assignments[id] || {}).task === 'forage');
  console.log(`policy ON: forageAssigned=${JSON.stringify(asgOn)} ecPairs=${ctx.ecPairs | 0} ecAssigned=${ctx.ecAssigned | 0}`);
  if (asgOn.length < 2) fail('policy ON assigned fewer than 2 forage');
  if ((ctx.ecPairs | 0) < 1) fail('policy ON counted no ecPairs');
  delete process.env.EARLYCREW;
  const ctxOff = {};
  // Clear assignments so the OFF upkeep is judged on its own output.
  try { Game.state.village.assignments = {}; } catch (e) {}
  try { earlycrew.upkeep(Game, ctxOff); } catch (e) { fail('upkeep OFF threw: ' + e.message); }
  const ecKeysOff = Object.keys(ctxOff).filter(k => k.indexOf('ec') === 0);
  const asgOff = Object.keys(Game.state.village.assignments || {}).filter(id => (Game.state.village.assignments[id] || {}).task === 'forage');
  console.log(`policy OFF: forageAssigned=${JSON.stringify(asgOff)} ecKeys=${JSON.stringify(ecKeysOff)}`);
  if (asgOff.length !== 0 || ecKeysOff.length !== 0) fail('policy OFF leaked assignments or ec* surface');
  // (B) + (D) setup: trusted pair, snapshot, mate on the monster tile.
  const leader = pool[0], mate = pool[1];
  for (const id of [leader, mate]) {
    try { Game.assignTask(id, 'forage', { via: 'in-person' }); } catch (e) {}
  }
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
  console.log('PROOF-GREEN: policy ON pairs / OFF clean; tile-present crewed wild meeting passes NO allyFromStart (router gap proven); direct allyFromStart works (capability exists); solo control allies 0');
}
main().catch(e => { console.error(e); process.exit(1); });
