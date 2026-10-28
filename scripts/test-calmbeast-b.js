#!/usr/bin/env node
// test-calmbeast-b.js — proof for sim-calmbeast-b: the calm_beast bar tap
// (no target) attempts beside a live hostile, stays refused beside only a
// monster or no foe at all, and the explicit-target path is unchanged.
//
// Fixture: barwhy C1 scaffold (player + live hostile h_x), plus two guards
// (monster-only, no-foe). Per seed, per scenario: activatableAbilities row
// for animal_ken.calm_beast, then a no-target tap via activateAbility with
// say() captured, then (fresh scaffold) an explicit-target tap for the C1
// control. Mode: run <outfile> — dumps JSON rows, prints one line each.
// Exit 0 pass (script ran), 1 failure (missing rows), 2 crash.
// Seeds: env SEEDS, default 9981..9988.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '9981,9982,9983,9984,9985,9986,9987,9988')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

async function base(seed) {
  const { Game } = await loadGame({ seed, mode: 'calmbeast-b', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  const abs = (s.abilities || []);
  if (!abs.some((a) => (a.id || a) === 'animal_ken')) abs.push({ id: 'animal_ken', level: 1 });
  s.abilities = abs;
  try { s.kcal = Math.max(s.kcal || 0, 5000); s.health = Math.max(s.health || 0, 100); } catch (e) {}
  try { Game.state.scholar.dayTicks = 100; Game.state.scholar.actionClock = 0; Game.dayPart = 0; } catch (e) {}
  return Game;
}
function scaffold(Game, foes) {
  const fighters = [
    { key: 'p', kind: 'player', name: 'You', hp: 100, maxHp: 100, alive: true, fled: false, acted: false, mx: 4, my: 4 },
  ];
  for (const f of foes) fighters.push(f);
  Game.tbfight = { id: 'calmbeast-fight', over: false, round: 1, fighters,
    order: fighters.map((f) => f.key), turnIdx: 0 };
}
const HOSTILE = () => ({ key: 'h_x', kind: 'hostile', name: 'Hostile villager', hp: 80, maxHp: 80, alive: true, fled: false, mx: 5, my: 4 });
const MONSTER = () => ({ key: 'm_0', kind: 'monster', monsterId: 'test-beast', name: 'Test Beast', hp: 80, maxHp: 80, alive: true, fled: false, mx: 5, my: 4 });

function calmRow(Game) {
  const list = Game.activatableAbilities() || [];
  const r = list.find((x) => x.id === 'animal_ken.calm_beast');
  return r ? { available: !!r.available, why: (r.why == null ? null : String(r.why)) } : null;
}
function tap(Game) {
  const lines = [];
  const origSay = Game.say;
  Game.say = function (t) { lines.push(String(t)); try { return origSay.call(Game, t); } catch (e) { return undefined; } };
  let ret = null;
  try { ret = Game.activateAbility('animal_ken.calm_beast'); }
  catch (e) { lines.push('TAP-THREW: ' + (e && e.message)); }
  finally { Game.say = origSay; }
  // tbEnd('calmed') clears Game.tbfight, so "fight over" is null OR over.
  let over = null;
  try { over = !Game.tbfight || !!Game.tbfight.over; } catch (e) {}
  return { ret: ret === undefined ? null : !!ret, lines, fightOver: over };
}

async function collect(seed) {
  const out = [];
  // C1: live hostile — row + no-target tap + explicit-target control.
  {
    const Game = await base(seed);
    scaffold(Game, [HOSTILE()]);
    const row = calmRow(Game);
    const tapNoTarget = tap(Game);
    Game.tbfight = null;
    scaffold(Game, [HOSTILE()]);
    const tapExplicit = (() => {
      const lines = [];
      const origSay = Game.say;
      Game.say = function (t) { lines.push(String(t)); try { return origSay.call(Game, t); } catch (e) {} };
      let ret = null;
      try { ret = Game.activateAbility('animal_ken.calm_beast', 'h_x'); }
      catch (e) { lines.push('TAP-THREW: ' + (e && e.message)); }
      finally { Game.say = origSay; }
      let over = null;
      try { over = !Game.tbfight || !!Game.tbfight.over; } catch (e) {}
      return { ret: ret === undefined ? null : !!ret, lines, fightOver: over };
    })();
    Game.tbfight = null;
    out.push({ seed, scenario: 'C1-hostile', row, tapNoTarget, tapExplicit });
  }
  // Guard M1: monster only.
  {
    const Game = await base(seed);
    scaffold(Game, [MONSTER()]);
    const row = calmRow(Game);
    const tapNoTarget = tap(Game);
    Game.tbfight = null;
    out.push({ seed, scenario: 'M1-monster-only', row, tapNoTarget });
  }
  // Guard N1: no foe.
  {
    const Game = await base(seed);
    scaffold(Game, []);
    const row = calmRow(Game);
    const tapNoTarget = tap(Game);
    Game.tbfight = null;
    out.push({ seed, scenario: 'N1-no-foe', row, tapNoTarget });
  }
  return out;
}

(async () => {
  const mode = process.argv[2];
  const outfile = process.argv[3];
  if (mode !== 'run' || !outfile) { console.error('usage: test-calmbeast-b.js run <outfile>'); process.exit(2); }
  const all = [];
  for (const seed of SEEDS) {
    const rows = await collect(seed);
    for (const r of rows) {
      all.push(r);
      const attempt = r.tapNoTarget.lines.join(' | ').slice(0, 160);
      console.log(`seed=${seed} ${r.scenario} rowAvailable=${r.row ? r.row.available : 'MISSING'} why=${r.row ? JSON.stringify(r.row.why) : 'null'} tapRet=${r.tapNoTarget.ret} fightOver=${r.tapNoTarget.fightOver} tap=${attempt}`);
      if (r.tapExplicit) console.log(`seed=${seed} ${r.scenario} explicitTapRet=${r.tapExplicit.ret} fightOver=${r.tapExplicit.fightOver} tap=${r.tapExplicit.lines.join(' | ').slice(0, 160)}`);
    }
  }
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  fs.writeFileSync(outfile, JSON.stringify(all, null, 2) + '\n');
  console.log('dumped ' + all.length + ' rows to ' + outfile);
})().catch((e) => { console.error('CRASH: ' + (e && (e.stack || e.message))); process.exit(2); });
