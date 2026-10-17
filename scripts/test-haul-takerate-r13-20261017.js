#!/usr/bin/env node
// PROOF: dawn-after-kill haul prioritization (journey r13, 2026-10-17).
//
// r12's blank (queued for this run): near-haven HAUL takes are stochastic
// in a ~1-day window — 0-1 takes across 6 pilot runs despite 1-3
// offer-days/seed. Root cause: the weighted chore lottery is the wrong
// mechanism for time-critical knowledge. A fresh unrevealed-flesh kill
// rots in 3 days; the lottery almost never picks HAUL inside that window.
// A person who knows fresh meat is out there goes and gets it — they don't
// enter a chore lottery.
//
// The fix (villager-objectives.js, objPick): after the body-first gates
// (rest/eat), a remembered corpse killed yesterday/today whose flesh is
// still unrevealed and whose haul is feasible takes the HAUL objective
// directly (dawn-after-kill prioritization). mapmemHaulCandidate still
// enforces feasibility, range, and the no-dogpile cap; objDanger still
// gates the actual departure.
//
// Cases (staged honestly in-engine: registerDeath + monsterCarcassEntries
// + mapmemRemember, real objPick):
//   1. fresh kill (age<=1) + unrevealed + full pantry -> HAUL 20/20 picks
//      (deterministic, not lottery)
//   2. stale kill (age 2, rot window extended so the offer is still
//      feasible) -> offered but NOT deterministic (lottery: <20/20)
//   3. fresh kill + revealed meat -> no offer at all (0/20)
//   4. dogpile cap: two villagers already HAUL-ready on the corpse ->
//      third villager not offered (0/20)
//
// RED: run with the objPick hunk reverted (patch-file recipe — never stash
// on the hot tree): case 1 must fail (lottery, <20/20).
// GREEN: with the fix: all four cases as stated.
// Usage: SEED=7 node scripts/test-haul-takerate-r13-20261017.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '7', 10);

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('  ok: ' + name);
  else { failures++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

function fitVid(Game, v, sid, exclude) {
  const ids = (v.roster || []).filter(id => id !== sid && !(exclude || []).includes(id));
  for (const id of ids) {
    let n = {};
    try { n = Game.npcNeeds(id) || {}; } catch (e) {}
    let dead = false;
    try { dead = !!((Game.getPerson(id) || {}).dead); } catch (e) {}
    if (!dead && (n.hunger || 0) <= 50 && (n.energy == null || n.energy >= 35)) return id;
  }
  return null;
}

function stageCorpse(Game, monsterId, vid, nx, ny) {
  const mdef = (Game.data.monsters || []).find(m => m.id === monsterId);
  if (!mdef) return null;
  const corpse = Game.registerDeath({
    kind: 'monster', monsterId: mdef.id, monsterName: mdef.name,
    name: Game.monsterDisplayName ? Game.monsterDisplayName(monsterId) : mdef.name,
    node: { x: nx, y: ny }, cause: 'test', killerId: vid, witnesses: [vid],
  });
  if (!corpse || !corpse.id) return null;
  const meats = Game.monsterCarcassEntries ? Game.monsterCarcassEntries(mdef) : [];
  for (const me of meats) corpse.items.push(me);
  if (!Game.mapmemMeatItem(corpse)) return null;
  Game.mapmemRemember(vid, corpse);
  return corpse;
}

function countHaulPicks(Game, vid, hx, hy, nPicks, wantRef) {
  let n = 0;
  for (let i = 0; i < nPicks; i++) {
    const o = Game.objPick(vid, hx, hy);
    if (o && o.kind === 'HAUL' && (!wantRef || o.targetRef === wantRef)) n++;
  }
  return n;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const sid = Game.villagerId;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.state.scholar.day = 10;

  check('hushwolf meat unrevealed (premise)', Game.monsterFoodSafe && !Game.monsterFoodSafe('hushwolf'));
  // full pantry: only the knowledge channel can offer
  v.pantry = v.pantry || [];
  v.pantry.push({ name: 'Test stores', kcalEach: 500, units: 120, unit: 'portion' });

  console.log('case 1: fresh kill + unrevealed flesh -> deterministic HAUL');
  const vid = fitVid(Game, v, sid, []);
  check('fit villager staged (premise)', !!vid);
  const c1 = stageCorpse(Game, 'hushwolf', vid, 3, 3); // dayDied = 10, age 0
  check('corpse staged (premise)', !!(c1 && c1.id));
  let cand = null;
  try { cand = Game.mapmemHaulCandidate(vid, hx, hy); } catch (e) {}
  check('candidate offered (premise)', !!(cand && cand.ref === c1.id));
  const n1 = countHaulPicks(Game, vid, hx, hy, 20, c1.id);
  check('HAUL taken 20/20 picks (deterministic)', n1 === 20, 'got ' + n1 + '/20');
  const o1 = Game.objOf(vid);
  check('objective fields set like the lottery path',
    o1 && o1.kind === 'HAUL' && o1.targetRef === c1.id && o1.state === 'ready' &&
    o1.tx === 3 && o1.ty === 3 && !o1.indoor,
    JSON.stringify({ kind: o1 && o1.kind, ref: o1 && o1.targetRef, tx: o1 && o1.tx }));

  console.log('case 2: stale kill (age 2) still offered, not prioritized');
  const vidB = fitVid(Game, v, sid, [vid]);
  check('second fit villager (premise)', !!vidB);
  Game.state.scholar.day = 8;
  const c2 = stageCorpse(Game, 'bulldozer', vidB, 5, 5); // dayDied = 8
  check('stale corpse staged (premise)', !!(c2 && c2.id));
  Game.state.scholar.day = 10; // age 2
  // extend the rot window so the offer stays feasible (isolates freshness)
  try {
    const mem = Game.mapmemOf(vidB);
    const s = (mem.sites || []).find(x => x && x.ref === c2.id);
    if (s) s.spoilBy = 13;
  } catch (e) {}
  check('bulldozer still unrevealed (premise)', !Game.monsterFoodSafe('bulldozer'));
  let candB = null;
  try { candB = Game.mapmemHaulCandidate(vidB, hx, hy); } catch (e) {}
  check('stale candidate still OFFERED (premise)', !!candB, 'got ' + JSON.stringify(candB && candB.ref));
  const n2 = countHaulPicks(Game, vidB, hx, hy, 20, c2.id);
  console.log('  info: stale-kill lottery HAUL share = ' + n2 + '/20');
  check('stale kill NOT deterministic (<20/20)', n2 < 20, 'got ' + n2 + '/20');

  console.log('case 3: fresh kill + revealed meat -> no offer');
  const vidC = fitVid(Game, v, sid, [vid, vidB]);
  check('third fit villager (premise)', !!vidC);
  // ISOLATION: case-1/2 HAUL picks gossiped c1/c2 to haven mates (correct
  // game behavior). vidC must only know the corpse staged here, or the
  // "no offer" premise is polluted by unrevealed secondhand memories.
  try { Game.mapmemOf(vidC).sites = []; } catch (e) {}
  const mdefS = (Game.data.monsters || []).find(m =>
    m.id !== 'hushwolf' && m.id !== 'bulldozer' &&
    Game.monsterCarcassEntries && Game.monsterCarcassEntries(m).length &&
    !(Game.monsterFoodSafe && Game.monsterFoodSafe(m.id)));
  check('third meat monster exists (premise)', !!mdefS);
  const c3 = mdefS ? stageCorpse(Game, mdefS.id, vidC, 3, 5) : null; // dayDied = 10
  check('third corpse staged (premise)', !!(c3 && c3.id));
  Game.markMonsterFoodSafe(mdefS.id, 'tested');
  let candC = 'unset';
  try { candC = Game.mapmemHaulCandidate(vidC, hx, hy); } catch (e) { candC = 'err'; }
  check('revealed-meat candidate NOT offered (premise)', candC === null, 'got ' + JSON.stringify(candC && candC.ref));
  const n3 = countHaulPicks(Game, vidC, hx, hy, 20, null);
  check('revealed meat never HAUL (0/20)', n3 === 0, 'got ' + n3 + '/20');

  console.log('case 4: no dogpile past the cap');
  const vidD1 = fitVid(Game, v, sid, [vid, vidB, vidC]);
  const vidD2 = (v.roster || []).find(id => id !== sid && ![vid, vidB, vidC, vidD1].includes(id) &&
    !(Game.getPerson(id) || {}).dead);
  check('two more villagers (premise)', !!(vidD1 && vidD2));
  const c4 = (vidD1 && vidD2 && mdefS) ? stageCorpse(Game, mdefS.id, vidD1, 5, 3) : null;
  // un-reveal so the knowledge channel applies to this corpse
  if (c4 && Game.state.codex.monsters) delete Game.state.codex.monsters[mdefS.id];
  if (c4) Game.mapmemRemember(vidD2, c4);
  check('dogpile corpse staged (premise)', !!(c4 && c4.id));
  Game.objPick(vidD1, hx, hy);
  const oD1 = Game.objOf(vidD1);
  Game.objPick(vidD2, hx, hy);
  const oD2 = Game.objOf(vidD2);
  check('two haulers claimed (premise)', oD1.kind === 'HAUL' && oD2.kind === 'HAUL',
    JSON.stringify([oD1.kind, oD2.kind]));
  const vidD3 = (v.roster || []).find(id => id !== sid && ![vid, vidB, vidC, vidD1, vidD2].includes(id) &&
    !(Game.getPerson(id) || {}).dead);
  check('third dogpile villager (premise)', !!vidD3);
  if (vidD3 && c4) Game.mapmemRemember(vidD3, c4);
  let candD = 'unset';
  try { candD = Game.mapmemHaulCandidate(vidD3, hx, hy); } catch (e) { candD = 'err'; }
  check('capped corpse NOT offered (premise)', candD === null, 'got ' + JSON.stringify(candD && candD.ref));
  const n4 = vidD3 ? countHaulPicks(Game, vidD3, hx, hy, 20, null) : -1;
  check('capped corpse never HAUL (0/20)', n4 === 0, 'got ' + n4 + '/20');

  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
