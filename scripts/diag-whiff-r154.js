#!/usr/bin/env node
// diag-whiff-r154.js — inspect the whiff guard's live state during the staged
// betrayal stall (seed 13611). Prints f.round, f._whiffRounds, f._whiffFired,
// f._whiffHp and the liveFoe/liveUs inputs after each runDays iteration.
// Usage: SEED=13611 node scripts/diag-whiff-r154.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const SEED = parseInt(process.env.SEED || '13611', 10);
(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-delayed-r70', fullTelemetry: true });
  await setupGame(Game, 'Denver, Colorado');
  for (const [tx, ty] of [[5, 4], [6, 4], [7, 4]]) { try { Game.travelTo(tx, ty); } catch (e) {} }
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => String(id) !== String(Game.villagerId));
  let vid = null;
  for (const id of roster) { try { const vp = Game.vpOf(id); if (vp && !vp.dead) { vid = id; break; } } catch (e) {} }
  try { Game.state.scholar.health = 20; } catch (e) {}
  const started = Game.startBetrayalCombat(vid, { aggressor: 'npc' });
  console.log('fight started:', !!started, 'whiffGuardOn:', (typeof Game.tbWhiffGuardOn === 'function') ? Game.tbWhiffGuardOn() : 'n/a');
  // R154: count tbRoundWrap / tbWhiffGuardOn calls — _whiffHp stayed null
  // after 2601 rounds, so find out which link never runs.
  let rwCalls = 0, wgCalls = 0;
  const _rw = Game.tbRoundWrap.bind(Game);
  Game.tbRoundWrap = function (f) { rwCalls++; return _rw(f); };
  const _wg = Game.tbWhiffGuardOn.bind(Game);
  Game.tbWhiffGuardOn = function () { wgCalls++; return _wg(); };
  const policy = oracleV2;
  for (let it = 1; it <= 3; it++) {
    await runDays(Game, policy, { days: 1, sampleEvery: 1 });
    const f = Game.tbfight;
    if (!f) { console.log('iter', it, 'fight is null (ended)'); break; }
    const liveFoe = (f.fighters || []).some(x => x && (x.kind === 'monster' || x.kind === 'hostile') && x.alive && !x.fled);
    const liveUs = (f.fighters || []).some(x => x && (x.kind === 'player' || x.kind === 'villager' || x.kind === 'ally') && x.alive && !x.fled);
    console.log('iter', it, JSON.stringify({ round: f.round, over: !!f.over, whiffRounds: f._whiffRounds || 0, whiffFired: !!f._whiffFired, whiffHp: f._whiffHp || null, liveFoe, liveUs, packIncoming: !!(Game._pendingPack && Game._pendingPack.count > 0), rwCalls, wgCalls, fighters: (f.fighters || []).map(x => x.key + ':' + (x.kind || '?') + ':hp' + Math.round(x.hp || 0) + '@' + x.mx + ',' + x.my) }));
    if (f.over) break;
  }
})();
