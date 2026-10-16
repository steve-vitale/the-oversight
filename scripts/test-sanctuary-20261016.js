#!/usr/bin/env node
'use strict';
// test-sanctuary-20261016.js — design call #3 SANCTUARY SEMANTICS proof.
//
// Design call (Steve 2026-10-16): Haven is sanctuary. A monster/killer that
// was waiting for a dead bearer must NOT re-engage the successor through
// the fire. The killer waits at the treeline instead.
//
// RED->GREEN: the SAME scenarios run against the pre-fix code (RED) and the
// fixed code (GREEN).
//
// Scenario 1 — LIVING BEARER (sanctioned behavior, must not change):
//   A door-flees a hushwolf (stash tagged with A) and steps back out.
//   -> the killer re-engages A at the door, wounds honored (hp 37).
//   (Steve 2026-10-05 MONSTERS WAIT + r6/r7 wound claim — untouched.)
//
// Scenario 2 — SUCCESSOR (the design call):
//   1. A "door-flees" a hushwolf -> state.doorFledMonsters stashed in the OLD
//      (untagged) shape, exactly what the pre-fix write path produced.
//   2. A dies -> playerDeath -> the mantle passes to successor B, who wakes
//      inside the hall at Haven.
//   3. B exits the hall (exitBuilding):
//        RED:  startCombat fires — the killer re-engages B at Haven.
//        GREEN: no combat; the stash is held, not consumed.
//   4. B travels haven -> wild (travelTo):
//        GREEN: the treeline ambush fires — the hushwolf re-engages OUTSIDE
//        Haven, wounds honored (stashed hp 37 restored onto the fighter).
//
// Harness: sim-harness (seeded BEFORE eval, full src/js list in index.html
// order minus DOM-only, window stubbed-then-deleted, real Game.save).
// Writes nothing into the repo (assertions only).
const { loadGame, setupGame } = require('./sim-harness');

const SEED = 20261016;
let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
const liveFight = (Game) => !!(Game.tbfight && !Game.tbfight.over);
async function newGame() {
  const { Game } = await loadGame({ seed: SEED, mode: 'sanctuary-proof' });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  return { Game, says };
}

async function scenarioLivingBearer() {
  console.log('-- scenario 1: living bearer (sanctioned MONSTERS WAIT, unchanged) --');
  const { Game, says } = await newGame();
  const A = Game.villagerId;
  Game.state.scholar.insideHaven = true; // A fled inside earlier
  Game.state.doorFledMonsters = [{ id: 'hushwolf', mx: 4, my: 4, hp: 37, bearer: A }];
  ok('s1: stash tagged with the living bearer', true);
  const exited = Game.exitBuilding();
  ok('s1: A exits the hall', exited === true);
  ok('s1: the killer re-engages the LIVING bearer at the door', liveFight(Game),
    'tbfight live=' + liveFight(Game));
  if (liveFight(Game)) {
    const wolves = (Game.tbfight.fighters || []).filter(f =>
      (f.kind === 'monster' || f.kind === 'hostile') &&
      (f.monsterId === 'hushwolf' || (f.mdef && f.mdef.id === 'hushwolf')));
    ok('s1: it is the stashed hushwolf', wolves.length > 0);
    ok('s1: wounds honored (hp 37)', wolves.some(f => f.hp === 37),
      'hp=' + (wolves[0] && wolves[0].hp));
  }
  ok('s1: stash consumed by the re-engage',
    !Game.state.doorFledMonsters || Game.state.doorFledMonsters.length === 0);
  ok('s1: "still here. Waiting." said', /still here\. Waiting/.test(says.join('\n')));
}

async function scenarioSuccessor() {
  console.log('-- scenario 2: successor (the design call) --');
  const { Game, says } = await newGame();
  const A = Game.villagerId;
  ok('s2: bearer A exists', !!A, 'villagerId=' + A);
  const roster = ((Game.state.village || {}).roster || []);
  ok('s2: a successor exists in the roster', roster.filter(id => id !== A).length > 0);

  // 1. A door-flees: stash in the OLD untagged shape (pre-fix write path).
  Game.state.doorFledMonsters = [{ id: 'hushwolf', mx: 4, my: 4, hp: 37 }];
  ok('s2: stash set (old untagged shape)', (Game.state.doorFledMonsters || []).length === 1);

  // 2. A dies; the mantle passes.
  const sayMark = says.length;
  Game.playerDeath('a hushwolf');
  const B = Game.villagerId;
  ok('s2: mantle passes to a successor', !Game.over && B && B !== A, A + ' -> ' + B);
  if (Game.over) { console.log('  village lost — cannot continue'); return; }
  ok('s2: successor wakes inside the hall', Game.state.scholar.insideHaven === true);
  const deathSays = says.slice(sayMark).join('\n');
  ok('s2: death names the treeline wait (no silent handoff)', /treeline/i.test(deathSays));

  // 3. B exits the hall.
  // RED:  combat starts at Haven (the bug). GREEN: no combat, stash held.
  const exited = Game.exitBuilding();
  ok('s2: B can exit the hall', exited === true);
  ok('s2: NO hostile re-engagement at Haven (the design call)', !liveFight(Game),
    'tbfight live=' + liveFight(Game));
  ok('s2: stash held, not consumed at the door',
    Array.isArray(Game.state.doorFledMonsters) && Game.state.doorFledMonsters.length === 1,
    'stash=' + JSON.stringify(Game.state.doorFledMonsters));

  // 4. B leaves Haven for the wild: the killer waits at the treeline.
  const hx = Game.map.px, hy = Game.map.py;
  const dests = [[hx + 1, hy], [hx - 1, hy], [hx, hy + 1], [hx, hy - 1]]
    .filter(([x, y]) => x >= 0 && x <= 8 && y >= 0 && y <= 8);
  let ambushed = false, ambushErr = null;
  for (const [dx, dy] of dests) {
    try {
      const r = Game.travelTo(dx, dy);
      if (r && r.kind === 'blockage') continue;
      ambushed = liveFight(Game);
      break;
    } catch (e) { ambushErr = e.message; }
  }
  ok('s2: travel out of Haven attempted cleanly', ambushErr == null, ambushErr || '');
  ok('s2: killer re-engages at the treeline (outside Haven)', ambushed,
    'liveFight=' + ambushed);
  if (ambushed) {
    ok('s2: the fight is NOT at Haven', !(Game.map.px === hx && Game.map.py === hy),
      `at=(${Game.map.px},${Game.map.py}) haven=(${hx},${hy})`);
    const wolves = (Game.tbfight.fighters || []).filter(f =>
      (f.kind === 'monster' || f.kind === 'hostile') &&
      (f.monsterId === 'hushwolf' || (f.mdef && f.mdef.id === 'hushwolf')));
    ok('s2: the re-engaged killer is the stashed hushwolf', wolves.length > 0);
    ok('s2: wounds honored — the killer is still bleeding (hp 37)',
      wolves.some(f => f.hp === 37), 'hp=' + (wolves[0] && wolves[0].hp));
    ok('s2: stash consumed by the ambush',
      !Game.state.doorFledMonsters || Game.state.doorFledMonsters.length === 0);
  }
  ok('s2: treeline ambush narrated honestly', /treeline/i.test(says.join('\n')));
}

async function main() {
  console.log('== design call #3: sanctuary semantics (seed ' + SEED + ') ==');
  await scenarioLivingBearer();
  await scenarioSuccessor();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fails.length) { console.log('failures:'); fails.forEach(f => console.log(' - ' + f)); }
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
