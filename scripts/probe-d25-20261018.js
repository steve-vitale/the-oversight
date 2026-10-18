#!/usr/bin/env node
// probe-d25-20261018.js -- what sets stage=4 on d25 in seed 7208?
'use strict';
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const SEED = 7208;
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function livingNpcs(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    if (id === Game.villagerId) return false;
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'probe-d25', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 20 });
  // replicate staging exactly
  const npcs = livingNpcs(Game);
  const victim = npcs[Math.floor(npcs.length / 2)];
  Game.registerDeath({ kind: 'villager', villagerId: victim, name: Game.displayName(victim), cause: 'a wound that wouldn\'t close', killerId: null });
  Game.removeVillager(victim, 'killed');
  Game.seedGossip('death', { who: victim }, []);
  const corpse = (Game.corpses ? Game.corpses() : []).find(c => c.villagerId === victim && !c.buried);
  if (!Game.hasCuttingTool()) {
    const def = ((Game.data || {}).items || []).find(d => d && (d.class === 'weapon' || d.class === 'tool') && /knife|machete|blade/i.test(String(d.name || '') + ' ' + String(d.id || '')));
    if (def) Game.state.scholar.inventory.push({ id: def.id, name: def.name, plantId: def.id, units: 1, kcalEach: 0, edible: false });
  }
  const s = Game.state.scholar;
  const pos = Game.state.village.positions || (Game.state.village.positions = {});
  for (const wid of livingNpcs(Game).slice(0, 3)) pos[wid] = { mx: s.mx, my: s.my };
  Game.state.scholar.inventory.push({ id: 'staged_smoked', name: 'Smoked meat', plantId: 'meat_smoked', foodKind: 'meat', foodState: 'smoked', edible: true, units: 20, kcalEach: 500, spoilDay: dayOf(Game) + 30, unit: 'portion', kg: 0.3 });
  Game.corpseButcher(corpse.id);
  const inv = Game.state.scholar.inventory || [];
  const midx = inv.findIndex(it => it && it.plantId === 'meat_human' && (it.units || 0) > 0);
  if (midx >= 0) Game.eatCannibal(midx);
  // wrap justiceTick to log its inputs when stage changes to 4
  const _jt = Game.justiceTick;
  Game.justiceTick = function () {
    const j = this.justiceState();
    const before = { stage: j.stage, exiled: !!j.exiled, exileDay: j.exileDay };
    const heat = this.justiceHeat();
    const r = _jt.apply(this, arguments);
    const after = { stage: j.stage, exiled: !!j.exiled, exileDay: j.exileDay };
    if (after.stage === 4 && before.stage !== 4) {
      console.log(`[TICK] d${dayOf(Game)} stage ${before.stage}->4 heat=${heat} exiled=${before.exiled} exileDay=${before.exileDay} atHaven=${this.map && this.state.village ? (this.map.px === (this.state.village.px ?? 4) && this.map.py === (this.state.village.py ?? 4)) : '?'}`);
      console.log(`[TICK] crimes=${JSON.stringify((j.crimes || []).map(c => c.type))} playerCaseOpen=${(() => { try { return this.playerCaseOpen(); } catch (e) { return 'err'; } })()}`);
    }
    return r;
  };
  // replicate the pay on d23's confrontation
  let paid = false;
  for (let d = 0; d < 6; d++) {
    await runDays(Game, oracleV2, { days: 1 });
    const j = Game.justiceState();
    if (j.pendingConfront && !paid) { Game.justiceRespond('pay'); paid = true; console.log(`[PAY] d${dayOf(Game)} paid`); }
    console.log(`[DAY] d${dayOf(Game)} stage=${j.stage} heat=${Game.justiceHeat()} exiled=${!!j.exiled}`);
    if (Game.over) break;
  }
}
main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
