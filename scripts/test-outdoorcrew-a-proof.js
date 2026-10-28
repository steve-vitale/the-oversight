#!/usr/bin/env node
// scripts/test-outdoorcrew-a-proof.js — sim-outdoorcrew-a mechanism proof.
// Fixture (single process, seeded harness): trusted villagers + the
// outdoorcrew upkeep must (1) assign a forage pair, (2) snapshot it
// into Game._outdoorCrew at resolveAssignments, and (3) feed a
// resolveWildMonsterEncounter so fieldFight receives allies/allyVids
// naming the crew-mate; with the crew cleared, the same call must pass
// allies 0 (solo control). Also (4) with OUTDOORCREW unset, the layer
// adds no oc* ctx surface and no forage assignment.
// No src/js change; the fixture only sets trust (a precondition the
// engine's own obedience gate requires) and reads/captures engine calls.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
function fail(msg) { console.error('PROOF FAIL: ' + msg); process.exit(1); }
async function main() {
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1'; process.env.OUTDOORCREW = '1';
  const { Game } = await loadGame({ seed: 75101, mode: 'outdoorcrew-a-proof', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).slice();
  if (roster.length < 4) fail('roster too small: ' + roster.length);
  // Fixture precondition: two villagers the leader trusts (the engine's
  // obedience gate for forage is trust >= 20; default trust is 10).
  // Trust a pool of six (base upkeep may take 1-3 villagers for
  // water/wood first, so the pair must survive that draw).
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
  const ctx = {};
  const { outdoorcrew } = require('./policies/outdoorcrew');
  // (1) Upkeep assigns the pair.
  await quietLog(async () => { if (outdoorcrew.upkeep) outdoorcrew.upkeep(Game, ctx); });
  const asg = (Game.state.village.assignments || {});
  const forageAssigned = Object.keys(asg).filter(id => asg[id] && asg[id].task === 'forage');
  console.log(`upkeep: ocAssigned=${ctx.ocAssigned || 0} ocPairs=${ctx.ocPairs || 0} forageAssigned=${JSON.stringify(forageAssigned)}`);
  if ((ctx.ocAssigned || 0) < 2) fail('policy assigned fewer than 2 (ocAssigned=' + (ctx.ocAssigned || 0) + ')');
  if (forageAssigned.length < 2) fail('fewer than 2 forage assignments in state');
  // (2) Snapshot carries the pair.
  try { Game.resolveAssignments(); } catch (e) { fail('resolveAssignments threw: ' + e.message); }
  const crew = (Game._outdoorCrew || []).slice();
  console.log(`snapshot: _outdoorCrew=${JSON.stringify(crew)}`);
  const pair = forageAssigned.slice(0, 2);
  const pairInCrew = pair.filter(id => crew.indexOf(id) >= 0);
  if (pairInCrew.length < 2) fail('snapshot missing pair members: ' + JSON.stringify(crew));
  // (3) A wild meeting feeds the crew into fieldFight.
  const defs = (Game.data.monsters || []).filter(d => d && (d.wave | 0) === 1 && d.attack);
  if (!defs.length) fail('no wave-1 monster def');
  const def = defs[0];
  const leader = pair[0], mate = pair[1];
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
  // (4) Layer OFF adds no oc* surface and no forage assignment.
  delete process.env.OUTDOORCREW;
  const ctxOff = {};
  const forageBefore = Object.keys(Game.state.village.assignments || {}).filter(id => (Game.state.village.assignments[id] || {}).task === 'forage').length;
  await quietLog(async () => { if (outdoorcrew.upkeep) outdoorcrew.upkeep(Game, ctxOff); });
  const ocKeys = Object.keys(ctxOff).filter(k => k.indexOf('oc') === 0);
  const forageAfter = Object.keys(Game.state.village.assignments || {}).filter(id => (Game.state.village.assignments[id] || {}).task === 'forage').length;
  console.log(`off: ocKeys=${JSON.stringify(ocKeys)} forageBefore=${forageBefore} forageAfter=${forageAfter}`);
  if (ocKeys.length) fail('layer OFF added oc* ctx keys: ' + ocKeys.join(','));
  if (forageAfter !== forageBefore) fail('layer OFF changed forage assignments');
  console.log('PROOF-GREEN: pair assigned, snapshot fed, crewed meeting allies>=1 with mate named, solo control allies 0, OFF surface clean');
}
main().catch(e => { console.error(e); process.exit(1); });
