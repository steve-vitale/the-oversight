#!/usr/bin/env node
// scripts/test-perceptform-a-proof.js — sim-perceptform-a mechanism
// proof (armed code only). Proves, with direct engine assignments:
// (1) resolveAssignments stamps the co-departure record: two
// villagers assigned the same outdoor task in the same part carry
// each other as stamp partners (same task, same day/part).
// (2) A wild meeting whose stamp partner stands on the monster tile
// passes allyFromStart=true with that partner first, and the
// partner joins from round 1 (calledHelp + allyVid + door log).
// (3) NEGATIVE — tile: the same stamp partner standing OFF the
// monster tile does NOT pass allyFromStart.
// (4) NEGATIVE — task: a villager on the tile who walked out on a
// DIFFERENT task that part is NOT a stamp partner and does NOT
// pass allyFromStart.
// (5) Solo control: no stamp, no allies, no from-start flag.
// The proof drives the router (resolveWildMonsterEncounter) and
// the helper (perceivedFromStartAlly) directly; it never reads
// _outdoorCrew for an eligibility decision (the crew snapshot is
// only asserted to exist as the engine's pre-existing behavior).
// Fixture-only placement (nodePos writes) mirrors the prior arms'
// proofs; trust is set because assignTask's obedience gate needs it.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function fail(msg) { console.error('PROOF FAIL: ' + msg); process.exit(1); }
async function main() {
  const { Game } = await loadGame({ seed: 75101, mode: 'perceptform-a-proof', fullTelemetry: false });
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
  const leader = pool[0], mate = pool[1], other = pool[2];
  // Assign leader + mate to forage, other to patrol, same part.
  for (const [id, task] of [[leader, 'forage'], [mate, 'forage'], [other, 'patrol']]) {
    try { Game.assignTask(id, task, { via: 'in-person' }); } catch (e) { fail('assignTask threw for ' + id + ': ' + e.message); }
    if (!((Game.state.village.assignments || {})[id] && Game.state.village.assignments[id].task === task)) fail('assignment missing for ' + id + ' task ' + task);
  }
  try { Game.resolveAssignments(); } catch (e) { fail('resolveAssignments threw: ' + e.message); }
  // (1) Stamp exists, same-task partners only.
  const stamp = (Game._coDepart || {})[leader] || null;
  console.log(`stamp leader=${leader}: ${JSON.stringify(stamp)}`);
  if (!stamp) fail('no _coDepart stamp for leader');
  if ((stamp.partners || []).indexOf(mate) < 0) fail('stamp partners missing forage mate');
  if ((stamp.partners || []).indexOf(other) >= 0) fail('stamp partners wrongly include different-task villager');
  if (stamp.task !== 'forage') fail('stamp task wrong: ' + stamp.task);
  const defs = (Game.data.monsters || []).filter(d => d && (d.wave | 0) === 1 && d.attack);
  if (!defs.length) fail('no wave-1 monster def');
  const def = defs[0];
  const setTile = (id, nx, ny) => {
    Game.state.village.nodePos = Game.state.village.nodePos || {};
    Game.state.village.nodePos[id] = { nx, ny };
  };
  const origFF = Game.fieldFight;
  function captureWild(mTile) {
    let captured = null;
    Game.fieldFight = function (vid, mdef, m, opts) {
      captured = { allies: (opts && opts.allies) | 0, allyVids: (opts && opts.allyVids || []).slice(), allyFromStart: !!(opts && opts.allyFromStart) };
      return origFF.apply(this, arguments);
    };
    let rec = null;
    try { rec = Game.resolveWildMonsterEncounter(leader, { id: def.id, tx: mTile.nx, ty: mTile.ny, hp: def.hp || 100 }); }
    catch (e) { fail('resolveWild threw: ' + e.message); }
    finally { Game.fieldFight = origFF; }
    return { captured, rec };
  }
  // Helper-direct checks (the same helper both routers call).
  if (typeof Game.perceivedFromStartAlly !== 'function') fail('perceivedFromStartAlly helper missing');
  // (2) Mate on the monster tile: helper + router join from start.
  setTile(leader, 4, 4); setTile(mate, 4, 4); setTile(other, 4, 4);
  const helperHit = Game.perceivedFromStartAlly(leader, { tx: 4, ty: 4 });
  console.log(`helper tile-present: ${helperHit}`);
  if (helperHit !== mate) fail('helper did not return the on-tile stamp partner: ' + helperHit);
  const hit = captureWild({ nx: 4, ny: 4 });
  console.log(`tile-present meeting: captured=${JSON.stringify(hit.captured)} outcome=${hit.rec && hit.rec.outcome} calledHelp=${hit.rec && hit.rec.calledHelp} allyVid=${hit.rec && hit.rec.allyVid}`);
  if (!hit.captured || !hit.captured.allyFromStart) fail('wild router did NOT pass allyFromStart for a seen outing partner');
  if (hit.captured.allyVids[0] !== mate) fail('perceived ally not first in allyVids: ' + JSON.stringify(hit.captured.allyVids));
  if (!(hit.rec && hit.rec.allyVid === mate && hit.rec.calledHelp)) fail('partner did not join from round 1');
  const doorLog = ((hit.rec && hit.rec.log) || []).some(l => String(l).indexOf('already at the door') >= 0);
  if (!doorLog) fail('from-start door log line missing');
  // (3) NEGATIVE tile: mate off the tile (other still on it, but other
  // is a different-task villager, so nothing perceived is present).
  setTile(mate, 0, 0); setTile(other, 4, 4);
  const helperMiss = Game.perceivedFromStartAlly(leader, { tx: 4, ty: 4 });
  console.log(`helper tile-absent: ${helperMiss}`);
  if (helperMiss !== null) fail('helper returned an ally with no stamp partner on the tile: ' + helperMiss);
  const miss = captureWild({ nx: 4, ny: 4 });
  console.log(`tile-absent meeting: captured=${JSON.stringify(miss.captured)}`);
  if (miss.captured && miss.captured.allyFromStart) fail('wild router passed allyFromStart with no perceived ally on the tile');
  // (4) NEGATIVE task is already covered by (3): `other` stood on the
  // tile in both fixtures and never joined from start — but assert
  // explicitly that other is not in the leader's stamp partners.
  if ((stamp.partners || []).indexOf(other) >= 0) fail('different-task villager in stamp partners (re-check)');
  // (5) Solo control: stamp cleared, no allies.
  Game._coDepart = {};
  Game._outdoorCrew = [];
  setTile(mate, 4, 4);
  const solo = captureWild({ nx: 4, ny: 4 });
  console.log(`solo control: captured=${JSON.stringify(solo.captured)}`);
  if (!solo.captured) fail('solo fieldFight was not called');
  if (solo.captured.allies !== 0 || solo.captured.allyVids.length !== 0 || solo.captured.allyFromStart) fail('solo control passed allies/fromStart: ' + JSON.stringify(solo.captured));
  console.log('PROOF-GREEN: stamp records same-task co-departure; on-tile stamp partner joins from round 1 via the wild router; off-tile and different-task villagers do not; solo control clean');
}
main().catch(e => { console.error(e); process.exit(1); });
