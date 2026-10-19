#!/usr/bin/env node
// PROBE (journey deepening r19, 2026-10-19): does the EXPEDITION/HAUL-return
// meat path conserve pantry atoms end-to-end? Establishment r16 proved the
// atom law (no unit > 500 kcal) on carcassToMeat / specialist butcher /
// mapmemButcherForCarry / markMonsterFoodSafe-reveal. The villager
// return-to-pantry legs — expeditionReturn (villager-agency.js) and the HAUL
// objective return (objReturnEffect 'haul', villager-objectives.js) — push
// unknown-flesh items straight into vv.pantry, bypassing stockPantry's
// piece splitter. This probe runs the FULL chain per gross value:
//   create (mapmemButcherForCarry | mapmemHaulAt) -> deposit -> reveal
// and asserts: (1) no pantry atom > 500 kcal, (2) total == round(gross*0.40)
// (the honest reveal yield — conservation, no phantom atoms).
// Deterministic: seeded harness, fixed gross sweep.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const GROSSES = [600, 1000, 1249, 1250, 1251, 1400, 1498, 1499, 1500, 1749, 1750, 1872, 2000, 2498, 2499, 2500, 3000, 5000];
const MID = 'highbeam_deer';

function corpseFor(gross, tag) {
  return {
    kind: 'monster', id: 'probe-corpse-' + tag + '-' + gross,
    monsterId: MID,
    items: [{ foodKind: 'meat', foodState: 'carcass', plantId: 'meat_' + MID, hiddenKcal: gross, kg: 40, units: 1 }],
  };
}
function pantryAtoms(Game) {
  return (Game.state.village.pantry || []).filter(p => p && p.foodKind === 'meat');
}
function checkAtoms(Game, label, gross, fails) {
  const atoms = pantryAtoms(Game);
  const worst = atoms.reduce((m, p) => Math.max(m, p.kcalEach || 0), 0);
  const total = atoms.reduce((t, p) => t + (p.kcalEach || 0) * (p.units || 1), 0);
  const expected = Math.round(gross * 0.40);
  const ok1 = worst <= 500;
  // INTEGER-PORTION RESIDUE (r19): the reveal distributes rNet over integer
  // portions via per=round(rNet/rUnits), so per*rUnits can differ from rNet
  // by ±1. That is integer arithmetic, not a phantom atom — the r16 fix
  // accepted it. The law binds the 500 cap and the chunking, not the last kcal.
  const ok2 = Math.abs(total - expected) <= 1;
  console.log((ok1 ? 'PASS' : 'FAIL') + ' ' + label + ' gross=' + gross + ' worstAtom=' + worst + ' total=' + total + ' expected=' + expected);
  if (!ok1) fails.push(label + ' gross=' + gross + ': atom ' + worst + ' > 500');
  if (!ok2) fails.push(label + ' gross=' + gross + ': total ' + total + ' != expected ' + expected);
}

async function main() {
  const { Game } = await loadGame({ seed: 9201, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const fails = [];
  const vid = ((Game.state.village || {}).roster || []).find(id => id !== Game.villagerId);
  if (!vid) { console.log('FAIL no villager to stage'); process.exit(1); }
  const say0 = Game.say; Game.say = () => {};

  for (const gross of GROSSES) {
    // ---- E1: expedition kill -> butcher on the spot -> expeditionReturn -> reveal
    Game.state.village.pantry = [];
    Game.state.village.pantryKcal = 0;
    if (Game.state.codex && Game.state.codex.monsters) delete Game.state.codex.monsters[MID]; // un-know between iterations
    let carried = null;
    try { carried = Game.mapmemButcherForCarry(vid, corpseFor(gross, 'exp')); }
    catch (e) { fails.push('E1 gross=' + gross + ' mapmemButcherForCarry threw: ' + e.message); continue; }
    if (!carried || !(carried.unknown || []).length) { fails.push('E1 gross=' + gross + ': no unknown carried'); continue; }
    const createdUnits = carried.unknown[0].units || 1;
    const expUnits = Math.max(1, Math.ceil(Math.round(gross * 0.50) / 500));
    const uok = createdUnits === expUnits;
    console.log((uok ? 'PASS' : 'FAIL') + ' E1-create gross=' + gross + ' units=' + createdUnits + ' expected=' + expUnits);
    if (!uok) fails.push('E1 gross=' + gross + ': created units ' + createdUnits + ' != ceil-chunked ' + expUnits);
    try {
      const ag = Game.state.village.agency = Game.state.village.agency || {};
      ag.exped = ag.exped || {};
      ag.exped[vid] = { meat: [carried], finds: [], encounters: [], dist: 1 };
      Game.expeditionReturn(vid, false);
    } catch (e) { fails.push('E1 gross=' + gross + ' expeditionReturn threw: ' + e.message); continue; }
    try { Game.markMonsterFoodSafe(MID, 'tested'); } catch (e) { fails.push('E1 gross=' + gross + ' reveal threw'); continue; }
    checkAtoms(Game, 'E1-expedition', gross, fails);
  }

  for (const gross of GROSSES) {
    // ---- E2: HAUL objective -> mapmemHaulAt (unrevealed branch) -> objReturnEffect('haul') -> reveal
    Game.state.village.pantry = [];
    Game.state.village.pantryKcal = 0;
    if (Game.state.codex && Game.state.codex.monsters) delete Game.state.codex.monsters[MID]; // un-know between iterations
    const corpse = corpseFor(gross, 'haul');
    Game.state.corpses = [corpse];
    const o = Game.objOf(vid);
    o.kind = 'HAUL'; o.state = 'travel'; o.targetRef = corpse.id; o.haulLabel = 'Highbeam Deer';
    o.purpose = 'haul';
    let ret = false;
    try { ret = Game.mapmemHaulAt(vid); } catch (e) { fails.push('E2 gross=' + gross + ' mapmemHaulAt threw: ' + e.message); continue; }
    if (!ret || !(o.haulUnknown || []).length) { fails.push('E2 gross=' + gross + ': unrevealed branch did not fire (ret=' + ret + ')'); continue; }
    const createdUnits = o.haulUnknown[0].units || 1;
    const expUnits = Math.max(1, Math.ceil(Math.round(gross * 0.50) / 500));
    const uok = createdUnits === expUnits;
    console.log((uok ? 'PASS' : 'FAIL') + ' E2-create gross=' + gross + ' units=' + createdUnits + ' expected=' + expUnits);
    if (!uok) fails.push('E2 gross=' + gross + ': created units ' + createdUnits + ' != ceil-chunked ' + expUnits);
    try { Game.objReturnEffect(vid, 'haul'); } catch (e) { fails.push('E2 gross=' + gross + ' objReturnEffect threw: ' + e.message); continue; }
    try { Game.markMonsterFoodSafe(MID, 'tested'); } catch (e) { fails.push('E2 gross=' + gross + ' reveal threw'); continue; }
    checkAtoms(Game, 'E2-haul', gross, fails);
    Game.state.corpses = [];
  }

  // ---- E3: merge conservation — two same-gross hauls merge in the pantry, then reveal.
  // stacksMatch gates on hiddenKcal equality, so same-gross hauls merge units;
  // the merged stack must still reveal the combined yield.
  for (const gross of [1400, 2000]) {
    Game.state.village.pantry = [];
    Game.state.village.pantryKcal = 0;
    if (Game.state.codex && Game.state.codex.monsters) delete Game.state.codex.monsters[MID];
    for (let h = 0; h < 2; h++) {
      const corpse = corpseFor(gross, 'haulmerge' + h);
      Game.state.corpses = [corpse];
      const o = Game.objOf(vid);
      o.kind = 'HAUL'; o.state = 'travel'; o.targetRef = corpse.id; o.haulLabel = 'Highbeam Deer'; o.purpose = 'haul';
      try { Game.mapmemHaulAt(vid); } catch (e) { fails.push('E3 gross=' + gross + ' haul ' + h + ' threw'); break; }
      try { Game.objReturnEffect(vid, 'haul'); } catch (e) { fails.push('E3 gross=' + gross + ' deposit ' + h + ' threw'); break; }
      Game.state.corpses = [];
    }
    try { Game.markMonsterFoodSafe(MID, 'tested'); } catch (e) { fails.push('E3 gross=' + gross + ' reveal threw'); continue; }
    const atoms = pantryAtoms(Game);
    const total = atoms.reduce((t, p) => t + (p.kcalEach || 0) * (p.units || 1), 0);
    const expected = 2 * Math.round(gross * 0.40);
    const okc = Math.abs(total - expected) <= 2; // ±2 rounding residue allowed
    const worst = atoms.reduce((m, p) => Math.max(m, p.kcalEach || 0), 0);
    console.log((okc && worst <= 500 ? 'PASS' : 'FAIL') + ' E3-merge gross=' + gross + ' total=' + total + ' expected=' + expected + ' worstAtom=' + worst + ' stacks=' + atoms.length);
    if (!okc) fails.push('E3 gross=' + gross + ': merged reveal total ' + total + ' != expected ' + expected + ' (energy lost at merge)');
    if (worst > 500) fails.push('E3 gross=' + gross + ': atom ' + worst + ' > 500');
  }

  Game.say = say0;
  console.log(fails.length ? '\n' + fails.length + ' FAILURES:\n- ' + fails.join('\n- ') : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
