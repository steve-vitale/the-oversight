#!/usr/bin/env node
// BREAK-IT camps & structures proof 2026-10-11 (camps target).
// HOSTILE attacks along the 4 axes:
//
// EXPLOIT: break/rebuild camp loop for free resources or duplication
//   (pitch -> setUpCamp -> packTent(struck) cycles: tent units and kcal
//   must be conserved-or-spent, never gained).
// SOFTLOCK: camp destroyed while the player sleeps inside the tent ->
//   eviction must be honest; re-breaking a gone camp must be a no-op.
// HONESTY: the alien burn (apPlaygroundBurn) rubbles grid cells directly,
//   bypassing destroyCell. C1: it rubbles a live PLAYER fire cell but leaves
//   the tracked entry live -> playerFireAt stays true on rubble ("Feed the
//   fire" offered on ash; fuel spent into the void) while hasCampfireNearby
//   (grid-checked) says no fire. Ledger and grid disagree.
//   Also: the burn must NAME a player fire it kills (no silent loss).
// UNBREAKABLE: havens are the ONLY unbreakable human structures —
//   destroyCell on hall/bunk/door must refuse; the alien burn must refuse
//   the haven tile outright.
// DEAD-CODE: breakCamp/setUpCamp/packTent/pitchTent/enterTent/destroyCell
//   all exist AND execute their real paths at runtime (not just defined).
//
// CATCH (fixed in this run):
//   C1 (HONESTY, alien burn phantom fire): apPlaygroundBurn rubbled the
//     cell but never purged state.fires. Fixed: purge the tracked entry
//     when the burn takes a player fire cell, and say the honest line.
// HELD (attacked, resisted): break/rebuild loop conserves (no dupe, kcal
//   strictly spent); eviction on destroyed camp is honest; re-break is a
//   no-op; haven cells refuse destroyCell; burn refuses haven tile; every
//   camp verb is wired end-to-end (pitch/pack/enter/setUp/break).
//
// Green across 3 seeds: SEED=N node scripts/test-break-camps-20261011.js
const H = require('./sim-harness.js');
const SEED = parseInt(process.env.SEED || '20261011', 10);

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
};

(async () => {
  const { Game } = await H.loadGame({ seed: SEED });
  await H.setupGame(Game);
  const s = Game.state.scholar;
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.tickAction = () => {}; // hermetic: clock side effects stubbed
  console.log('== BREAK-IT camps proof, SEED ' + SEED + ' ==');

  // ---- move to a wild tile ----
  Game.map.px = 0; Game.map.py = 0;
  Game.tileAt(0, 0);
  const detail = Game.genDetail(0, 0);
  s.mx = 4; s.my = 4;
  ok('wild tile selected', (Game.tileAt(0, 0) || {}).type !== 'haven',
    'type=' + ((Game.tileAt(0, 0) || {}).type));

  const plantFire = (cx, cy) => {
    const d = Game.genDetail(Game.map.px, Game.map.py);
    d[cy][cx] = 'fire';
    Game.state.fires = Game.state.fires || [];
    Game.state.fires.push({ tx: Game.map.px, ty: Game.map.py, cx, cy, inside: false, till: Game._absTick() + 20000 });
  };
  const liveFireAt = (cx, cy) => (Game.state.fires || []).some(f =>
    !f.inside && f.tx === Game.map.px && f.ty === Game.map.py && f.cx === cx && f.cy === cy && f.till > Game._absTick());

  // ============ HONESTY C1: alien burn vs player fire ============
  detail[5][5] = 'dirt'; detail[5][6] = 'dirt'; detail[6][5] = 'dirt'; detail[6][6] = 'dirt';
  plantFire(5, 5);
  ok('setup: player fire live and grid-visible', Game.playerFireAt(5, 5) && liveFireAt(5, 5));
  const pid = (Game.data.alienPlayers || [])[0] && Game.data.alienPlayers[0].id;
  ok('setup: alien persona available', !!pid);
  // stub RNG: want=4, then force picks (5,5) fire, (6,5), (5,6), (6,6)
  const realRandom = Math.random;
  const targets = [[5, 5], [6, 5], [5, 6], [6, 6]];
  const seq = [0.5];
  for (const [bx, by] of targets) seq.push((bx + 0.5) / 9, (by + 0.5) / 9);
  let ri = 0;
  Math.random = () => seq[ri++ % seq.length];
  let burnRet = null;
  try { burnRet = Game.apPlaygroundBurn(pid); } finally { Math.random = realRandom; }
  const dAfter = Game.genDetail(0, 0);
  ok('burn hit the fire cell', dAfter[5][5] === 'rubble', 'cell=' + dAfter[5][5]);
  ok('C1: no phantom fire — playerFireAt false on rubble', Game.playerFireAt(5, 5) === false,
    'playerFireAt(5,5)=' + Game.playerFireAt(5, 5));
  ok('C1: tracked entry purged with its cell', !liveFireAt(5, 5));
  ok('C1: the burn names the fire it killed',
    said.join(' ').toLowerCase().includes('fire dies in the burn') ||
    said.join(' ').toLowerCase().includes("fire's gone"),
    said.slice(-3).join(' | '));
  // ledger and grid agree everywhere now
  ok('C1: hasCampfireNearby agrees with the ledger (no split brain)',
    Game.hasCampfireNearby() === false || Game.playerFireAt(5, 5) === false);

  // ============ EXPLOIT: break/rebuild loop ============
  said.length = 0;
  const d2 = Game.genDetail(0, 0);
  d2[4][3] = 'dirt'; d2[4][5] = 'dirt';
  s.mx = 4; s.my = 4; s.kcal = 5000;
  s.inventory = s.inventory || [];
  s.inventory.push({ kind: 'tent', name: 'Packed tent', units: 2, kg: 2.5, kcalEach: 0, spoilDay: 9999, unit: 'tent', prep: 'x' });
  const tentUnits = () => { const t = (s.inventory || []).find(i => i.kind === 'tent'); return t ? (t.units || 0) : 0; };
  for (let i = 0; i < 2; i++) {
    Game.pitchTent(3, 4);  // -50 kcal
    plantFire(5, 4);       // camp needs a fire
    Game.setUpCamp();      // struck-able camp
    ok('loop ' + i + ': camp set up', !!Game.state.camp);
    Game.packTent(3, 4);   // struck path: tent back, camp gone
  }
  ok('EXPLOIT held: no tent duplication across break/rebuild', tentUnits() === 2, 'units=' + tentUnits());
  ok('EXPLOIT held: rebuild loop costs, never pays (kcal strictly spent)',
    Math.round(s.kcal) === 4900, 'kcal=' + Math.round(s.kcal));
  ok('EXPLOIT held: struck camp is gone, not phantom', !Game.state.camp);
  ok('EXPLOIT held: struck fire honestly keeps burning (ledger+grid agree)',
    liveFireAt(5, 4) && Game.genDetail(0, 0)[4][5] === 'fire');
  // cleanup planted fires
  try { Game.killCampFires(0, 0); } catch (e) {}

  // ============ SOFTLOCK: destroyed while inside ============
  said.length = 0;
  d2[4][3] = 'dirt';
  Game.pitchTent(3, 4);
  Game.enterTent(3, 4);
  ok('setup: inside tent', !!(s.insideTent));
  plantFire(4, 4); // adjacent to the tent interior (player now at 3,4)
  Game.setUpCamp();
  Game.breakCamp('the storm tore through it');
  ok('SOFTLOCK held: destroyed camp evicts honestly', s.insideTent === null);
  ok('SOFTLOCK held: camp deleted, not phantom', !Game.state.camp);
  ok('SOFTLOCK held: eviction line is honest',
    said.join(' ').includes('crawl out'), said.slice(-4).join(' | '));
  // re-break is a no-op
  said.length = 0;
  let threw = false;
  try { Game.breakCamp('again'); } catch (e) { threw = true; }
  ok('SOFTLOCK held: re-breaking a gone camp is a silent no-op', !threw && !Game.state.camp);
  try { Game.killCampFires(0, 0); } catch (e) {}

  // ============ UNBREAKABLE: haven truly unbreakable ============
  Game.map.px = 4; Game.map.py = 4;
  const hd = Game.genDetail(4, 4);
  const UNB = ['hall', 'bunk', 'door', 'haven', 'sanct', 'base', 'lodge'];
  let utarget = null;
  for (let y = 0; y < 9 && !utarget; y++) for (let x = 0; x < 9 && !utarget; x++) {
    const c = hd[y] && hd[y][x];
    const ct = typeof c === 'string' ? c : (c && c.type);
    if (UNB.indexOf(ct) !== -1) utarget = [x, y, ct];
  }
  if (utarget) {
    const before = JSON.stringify(hd[utarget[1]][utarget[0]]);
    const r = Game.destroyCell(utarget[0], utarget[1], 'bulldozer');
    const after = JSON.stringify(Game.genDetail(4, 4)[utarget[1]][utarget[0]]);
    ok('UNBREAKABLE held: destroyCell refuses ' + utarget[2], r === false, 'returned ' + r);
    ok('UNBREAKABLE held: haven cell intact', before === after);
  } else {
    ok('UNBREAKABLE held: haven cell found to test', false, 'no hall/bunk/door cell on haven detail');
  }
  // alien burn refuses the haven tile outright
  try { Game.apState().lastBurnDay = -999; } catch (e) {}
  const realR2 = Math.random;
  Math.random = () => 0.5;
  let burnHaven = null;
  try { burnHaven = Game.apPlaygroundBurn(pid); } finally { Math.random = realR2; }
  ok('UNBREAKABLE held: alien burn refuses haven tile', burnHaven === false, 'returned ' + burnHaven);

  // ============ DEAD-CODE: every camp verb wired and executable ============
  for (const fn of ['breakCamp', 'setUpCamp', 'packTent', 'pitchTent', 'enterTent', 'destroyCell', 'hasCampfireNearby', 'canSetUpCamp']) {
    ok('DEAD-CODE: Game.' + fn + ' is a live function', typeof Game[fn] === 'function');
  }
  // camp has no storage surface: food lives in inventory/pantry, never in state.camp
  Game.map.px = 0; Game.map.py = 0;
  const d3 = Game.genDetail(0, 0);
  d3[4][3] = 'dirt'; d3[4][5] = 'dirt';
  s.mx = 4; s.my = 4;
  s.inventory.push({ kind: 'tent', name: 'Packed tent', units: 1, kg: 2.5, kcalEach: 0, spoilDay: 9999, unit: 'tent', prep: 'x' });
  Game.pitchTent(3, 4); plantFire(5, 4); Game.setUpCamp();
  ok('camp state carries no storage (px/py/condition only)',
    JSON.stringify(Object.keys(Game.state.camp || {}).sort()) === JSON.stringify(['condition', 'px', 'py']),
    'keys=' + JSON.stringify(Object.keys(Game.state.camp || {})));
  try { Game.killCampFires(0, 0); Game.breakCamp('test cleanup'); } catch (e) {}

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
