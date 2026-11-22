#!/usr/bin/env node
// Proof: BEARER-END — a dead bearer's joint run can be closed by the
// successor (journey-establishment r265, 2026-11-22).
//
// r247 proved the orphan: seed 101970, Jamie died d25 leaving a joint
// forage run for Jack; the run stranded 18 dawns — 0 work, 0 closes —
// because forageFavorAction/waterFavorAction block BOTH branches for
// ANY previous bearer ("That outing belonged to the previous bearer.
// It is not your promise.") and the companions lists filter to
// bearer===villagerId. The mantle handoff releases the promise but
// leaves the run live, so the ledger carries it forever. r81 fixed the
// mirror case (partner-death: ending allowed when the partner is gone);
// bearer-death was never fixed.
// ROOT CAUSE: the bearer block fires before the ending branch for a
// previous bearer regardless of whether that bearer is alive or dead.
// GREEN (post-fix): when `ending` is true and the run's bearer is dead
// or roster-gone, the successor may end the run at Haven. The honest
// end, mirroring r81: the successor unloads ONLY what they carry (the
// dead bearer's haul is lost with them — matched from the successor's
// pack, so it deposits 0 by construction); the partner's virtual share
// stays with the partner (never deposited); the promise is renounced,
// the favor goes 'broken', the run closes (returned=true). A LIVING
// previous bearer still owns their outing — work and end both stay
// blocked. Water mirrors forage (partner water never becomes cistern
// water on a bearer-gone end).
// Staging mirrors test-journey-establishment-r138-prevbearer.js.
// Uses the shared harness (scripts/sim-harness). Exits nonzero on failure.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');

let pass = 0;
function check(name, cond, extra) {
  assert(cond, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return null; }
}
function cisternLiters(Game) {
  try { const w = (Game.state.village || {}).water || {}; return (w.clean || 0) + (w.dirty || 0); }
  catch (e) { return null; }
}

async function freshGame() {
  const { Game } = await loadGame({ seed: 385, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const day0 = (Game.state.scholar || {}).day || 0;
  const living = ((Game.state.village || {}).roster || []).filter(id => {
    if (String(id) === String(Game.villagerId)) return false;
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  const v = Game.state.village || {};
  const home = (Number.isFinite(v.px) && Number.isFinite(v.py)) ? { x: v.px, y: v.py } : { x: 4, y: 4 };
  if (Number.isFinite(v.px) && Number.isFinite(v.py)) { Game.map.px = v.px; Game.map.py = v.py; }
  Game.dayPart = 0;
  function promisedFavor(vid, kind) {
    const f = { id: 'test-' + kind + '-' + String(vid), vid, kind, goal: kind, task: 'test ' + kind,
      state: 'asked', askedDay: day0 - 7, deadline: (day0 - 7) + 2, line: '"test"', short: 'test' };
    Game.convoStoreFavor(f);
    const r = Game.convoFavorCommit(vid, f);
    return { f, r };
  }
  function placeAdjacent(vid) {
    const vv = Game.state.village || {}, s = Game.state.scholar || {};
    vv.nodePos = vv.nodePos || {}; vv.nodePos[vid] = { nx: home.x, ny: home.y };
    vv.positions = vv.positions || {};
    vv.positions[vid] = { mx: (s.mx ?? 4), my: (s.my ?? 4) };
    vv.npcInside = vv.npcInside || {}; vv.npcInside[vid] = false;
    s.insideHaven = false;
    if (vv.away) delete vv.away[vid];
  }
  function liveRun(vid, f) {
    // A run with real haul on both sides: the dead bearer's share
    // (200 kcal) + the partner's virtual share (150 kcal). Neither
    // may reach the pantry on a bearer-gone end.
    f.forageRun = { bearer: Game.villagerId, startedDay: day0,
      playerHaul: [{ itemId: 'test-venison-r265', name: 'Test venison', kcalEach: 100, units: 2, edible: true }],
      partnerHaul: [{ itemId: 'test-venison-r265', name: 'Test venison', kcalEach: 75, units: 2, edible: true }],
      forageCount: 1, talked: false, talkCount: 0, returned: false, deliveredKcal: 0 };
    placeAdjacent(vid);
    return f.forageRun;
  }
  function liveWaterRun(vid, f) {
    f.waterRun = { bearer: Game.villagerId, startedDay: day0,
      target: { x: home.x + 1, y: home.y },
      partnerWater: [{ liters: 2, quality: 'clean' }], returned: false };
    placeAdjacent(vid);
    return f.waterRun;
  }
  function strandRun(vid, f, predecessorId) {
    const p = ((Game.state.village || {}).promises || {})[vid];
    if (p) { p.kept = 'released'; p.inherited = true; }
    f.state = 'asked';
    const run = f.forageRun || f.waterRun;
    if (run) run.bearer = predecessorId;
    return run;
  }
  function killPerson(id) {
    const p = Game.getPerson(id);
    if (p) p.dead = true;
    return p;
  }
  function endSit(vid) { try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {} }
  return { Game, day0, living, home, promisedFavor, liveRun, liveWaterRun, strandRun, killPerson, endSit, placeAdjacent };
}

async function main() {
  const predecessor = (t) => t.living[1] || t.living[0];

  // A: forage run, bearer DEAD — the successor can end it, honestly.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    check('A0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    check('A0b bearer is dead', !!(Game.getPerson(pred) || {}).dead);
    const pantryBefore = pantryKcal(Game);
    const stWork = Game.forageFavorAction(vid, c.f, false);
    check('A1 work is STILL blocked for the successor', !!(stWork && !stWork.ready && /previous bearer/i.test(stWork.reason || '')), JSON.stringify(stWork && stWork.reason));
    const stEnd = Game.forageFavorAction(vid, c.f, true);
    check('A2 ending is ready for a dead bearer', !!(stEnd && stEnd.ready && stEnd.action === 'forage_end'), JSON.stringify(stEnd));
    check('A3 ending names the gone bearer', /who is gone/i.test(stEnd.reason || ''), JSON.stringify(stEnd && stEnd.reason));
    const res = Game.performForageFavor(vid, c.f, true);
    check('A4 perform end succeeds and closes', !!(res && res.ok && res.close), JSON.stringify(res));
    check('A5 run is returned', !!(c.f.forageRun && c.f.forageRun.returned), 'returned=' + JSON.stringify(c.f.forageRun && c.f.forageRun.returned));
    check('A6 favor is broken (promise missed)', c.f.state === 'broken', 'state=' + c.f.state);
    check('A7 dead bearer haul deposits nothing', (c.f.forageRun.deliveredKcal || 0) === 0, 'deliveredKcal=' + JSON.stringify(c.f.forageRun.deliveredKcal));
    check('A8 partner virtual share deposits nothing', (c.f.forageRun.deliveredPartnerKcal || 0) === 0, 'deliveredPartnerKcal=' + JSON.stringify(c.f.forageRun.deliveredPartnerKcal));
    check('A9 pantry unchanged by the close', pantryKcal(Game) === pantryBefore, 'before=' + pantryBefore + ' after=' + pantryKcal(Game));
    check('A10 return line names the gone bearer', /who is gone/i.test(res.line || ''), JSON.stringify(res && res.line));
    t.endSit(vid);
  }

  // B: water run, bearer DEAD — same honest end, cistern unchanged.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'water_haul');
    check('B0 water commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveWaterRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    const cisternBefore = cisternLiters(Game);
    const stWork = Game.waterFavorAction(vid, c.f, false);
    check('B1 water work is STILL blocked', !!(stWork && !stWork.ready && /previous bearer/i.test(stWork.reason || '')), JSON.stringify(stWork && stWork.reason));
    const stEnd = Game.waterFavorAction(vid, c.f, true);
    check('B2 water ending is ready for a dead bearer', !!(stEnd && stEnd.ready && stEnd.action === 'water_end'), JSON.stringify(stEnd));
    const res = Game.performWaterFavor(vid, c.f, true);
    check('B3 water perform end succeeds and closes', !!(res && res.ok && res.close), JSON.stringify(res));
    check('B4 water run is returned', !!(c.f.waterRun && c.f.waterRun.returned));
    check('B5 water favor is broken', c.f.state === 'broken', 'state=' + c.f.state);
    check('B6 partner water never reaches the cistern', (c.f.waterRun.deliveredLiters || 0) === 0, 'deliveredLiters=' + JSON.stringify(c.f.waterRun.deliveredLiters));
    check('B7 cistern unchanged by the close', cisternLiters(Game) === cisternBefore, 'before=' + cisternBefore + ' after=' + cisternLiters(Game));
    t.endSit(vid);
  }

  // C (fail-control): a LIVING previous bearer still owns the outing —
  // work AND end stay blocked, exactly as r138 proved.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    check('C0 bearer is alive', !(Game.getPerson(pred) || {}).dead);
    const stWork = Game.forageFavorAction(vid, c.f, false);
    check('C1 living-bearer work still blocked', !!(stWork && !stWork.ready && /previous bearer/i.test(stWork.reason || '')), JSON.stringify(stWork && stWork.reason));
    const stEnd = Game.forageFavorAction(vid, c.f, true);
    check('C2 living-bearer ending still blocked', !!(stEnd && !stEnd.ready && /previous bearer/i.test(stEnd.reason || '')), JSON.stringify(stEnd && stEnd.reason));
    check('C3 run stays live', !!(c.f.forageRun && !c.f.forageRun.returned));
    const cW = t.promisedFavor(t.living[1], 'water_haul');
    t.liveWaterRun(t.living[1], cW.f);
    t.strandRun(t.living[1], cW.f, pred);
    const stWEnd = Game.waterFavorAction(t.living[1], cW.f, true);
    check('C4 living-bearer water ending still blocked', !!(stWEnd && !stWEnd.ready && /previous bearer/i.test(stWEnd.reason || '')), JSON.stringify(stWEnd && stWEnd.reason));
    t.endSit(vid); t.endSit(t.living[1]);
  }

  // D (control): current-bearer ending still works as before (r81 path).
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    const stEnd = Game.forageFavorAction(vid, c.f, true);
    check('D1 current-bearer ending still ready at home', !!(stEnd && stEnd.ready && stEnd.action === 'forage_end'), JSON.stringify(stEnd));
    const res = Game.performForageFavor(vid, c.f, true);
    check('D2 current-bearer end closes the run', !!(res && res.ok && res.close), JSON.stringify(res));
    t.endSit(vid);
  }

  // E (source): the BEARER-END branches exist; the living-bearer block stands.
  {
    const forageSrc = fs.readFileSync(path.join(ROOT, 'src/js/favor-forage.js'), 'utf8');
    check('E1 forage has the BEARER-END branch', /BEARER-END \(journey-establishment r265/.test(forageSrc));
    check('E2 forage living-bearer block still present', /if\(r&&r\.bearer!==this\.villagerId\)return block\('That outing belonged to the previous bearer/.test(forageSrc));
    check('E3 forage unload skips partner share when bearer gone', /if\(partnerGone\|\|bearerGone\)break/.test(forageSrc));
    const waterSrc = fs.readFileSync(path.join(ROOT, 'src/js/favor-water.js'), 'utf8');
    check('E4 water has the BEARER-END branch', /BEARER-END \(journey-establishment r265/.test(waterSrc));
    check('E5 water living-bearer block still present', /if\(r&&r\.bearer!==this\.villagerId\)return block\('That creek trip belonged to the previous bearer/.test(waterSrc));
    check('E6 water unload drops partner water when bearer gone', /const bottles=bearerGone\?\[\.\.\.cargo\(this,f\)\]/.test(waterSrc));
  }

  console.log(`\n${pass} passed`);
}
main().catch(e => { console.error('CRASH', e && e.stack || e); process.exit(1); });
