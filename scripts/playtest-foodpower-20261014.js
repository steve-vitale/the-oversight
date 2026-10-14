// playtest-foodpower-20261014.js — Steve 2026-10-14 food-powered abilities.
// Three playtests on identical seeds:
// (a) villager ability casts across village food tiers (the X× measurement)
// (b) the kcal tradeoff: ability spam in a real fight drains real food
// (c) overcharge flips rounds-to-kill in a real fight (identical seeds)
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const { execSync } = require('child_process');
const SEED = parseInt(process.env.SEED || '7', 10);

async function boot() {
  Math.random = mulberry32(20261014);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^\\"]*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  const lines = [];
  Game.say = function (t) { lines.push(t); };
  Game.audioEvent = function () {};
  if (Game.drama === undefined) Game.drama = function () {};
  await Game.init();
  return { Game, lines };
}
function flatGrid() {
  const g = [];
  for (let y = 0; y < 9; y++) { const row = []; for (let x = 0; x < 9; x++) row.push({ type: 'grass' }); g.push(row); }
  return g;
}
function freshRun(Game) {
  Game.genDetail = () => flatGrid();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.health = 100; s.mx = 4; s.my = 4;
  return s;
}
function foe(Game) {
  if (!Game.tbfight) return null;
  return (Game.tbfight.fighters || []).filter(x => (x.kind === 'monster' || x.kind === 'hostile') && x.alive && !x.fled)[0];
}
function endTurn(Game) {
  if (!Game.tbfight || Game.tbfight.over) return;
  if (!Game.tbIsPlayerTurn()) return;
  const p = Game.tbFighter('p'); if (!p) return;
  p.moveLeft = 0; p.acted = true;
  Game.tbAfterPlayerAction();
}

async function main() {
  const { Game, lines } = await boot();

  // ============ (a) villager casts across tiers ============
  console.log('=== (a) villager ability casts by village food tier ===');
  for (const [tierName, days] of [['starving', 0], ['tight', 2], ['secure', 5], ['abundant', 10]]) {
    Math.random = mulberry32(SEED);
    const s = freshRun(Game);
    const v = Game.state.village;
    v.burnHistory = [];
    const need = Game.villageDailyNeed();
    v.pantry = days > 0 ? [{ kcalEach: need * days, units: 1 }] : [];
    if (Game.villageFoodTier() !== tierName) { console.log(`  ${tierName}: tier mismatch (${Game.villageFoodTier()})`); continue; }
    // mock 6-round fight, 2 villagers, 2 monsters; count casts
    Game.tbfight = { id: 'ptest-' + tierName, round: 1, fighters: [
      { kind: 'monster', alive: true, fled: false, mx: 3, my: 3, hp: 200 },
      { kind: 'monster', alive: true, fled: false, mx: 5, my: 5, hp: 200 },
    ]};
    Game.npcHasAbility = () => true;
    let casts = 0;
    const mk = (n) => ({ villagerId: 'v' + n, name: 'Vill' + n, mx: 4, my: 4, maxHp: 100, alive: true });
    const vs = [mk(1), mk(2)];
    for (let round = 0; round < 6; round++) {
      Game.tbfight.round = round + 1;
      for (const mv of vs) { try { if (Game.tbVillagerAbility(mv)) casts++; } catch (e) {} }
    }
    console.log(`  ${tierName}: ${casts} casts (2 villagers × 6 rounds)`);
    Game.tbfight = null;
    delete Game.npcHasAbility;
  }

  // ============ (b) kcal tradeoff in a real fight ============
  console.log('=== (b) ability spam drains real kcal (real fight vs hushwolf) ===');
  for (const kcalStart of [2000, 2000]) {
    Math.random = mulberry32(SEED);
    const s = freshRun(Game);
    s.kcal = kcalStart;
    s.abilities.push({ id: 'pocket_sand', name: 'pocket_sand', level: 1, xp: 0 });
    Game.startCombat('hushwolf');
    if (!Game.tbfight) { console.log('  fight failed to start'); break; }
    const k0 = s.kcal;
    let rounds = 0, casts = 0;
    while (Game.tbfight && !Game.tbfight.over && rounds < 12) {
      const t = foe(Game);
      if (!t) break;
      if (Game.tbIsPlayerTurn()) {
        // spam pocket_sand every other round, strike otherwise — a real fight rhythm
        let acted = false;
        if (rounds % 2 === 0) {
          try {
            const r = Game.activateAbility('pocket_sand.throw_sand', t.key);
            if (r !== false) { acted = true; casts++; }
          } catch (e) {}
        }
        if (!acted) { try { Game.tbPlayerStrike(t.key); } catch (e) {} }
        const p = Game.tbFighter('p');
        if (p) { p.moveLeft = 0; p.acted = true; }
        Game.tbAfterPlayerAction();
      }
      rounds++;
    }
    console.log(`  start ${k0} kcal → end ${Math.round(s.kcal)} kcal over ${rounds} rounds (${casts} ability casts burned ${Math.round(k0 - s.kcal)} kcal)`);
    console.log(`  fight over: ${!Game.tbfight || !!Game.tbfight.over}, player alive: ${s.health > 0}`);
    break; // one arm is enough for the drain measurement
  }

  // ============ (c) overcharge vs base: rounds to kill, 6 seeds per arm ============
  console.log('=== (c) overcharge vs base: mean rounds to kill (6 seeds/arm, fixed HP) ===');
  for (const [label, kcalStart] of [['base (1200 kcal)', 1200], ['overcharged (2200 kcal)', 2200]]) {
    let totRounds = 0, totHp = 0, wins = 0, n = 0;
    for (let seed = 1; seed <= 6; seed++) { const HP = 120;
      Math.random = mulberry32(SEED * 1000 + seed);
      const s = freshRun(Game);
      s.kcal = kcalStart;
      Game.startCombat('hushwolf');
      if (!Game.tbfight) continue;
      const m0 = foe(Game);
      if (m0) { m0.hp = HP; m0.maxHp = HP; }
      let rounds = 0;
      while (Game.tbfight && !Game.tbfight.over && rounds < 20) {
        const t = foe(Game);
        if (!t) break;
        if (Game.tbIsPlayerTurn()) {
          try { Game.tbPlayerStrike(t.key); } catch (e) {}
          const p = Game.tbFighter('p');
          if (p) { p.moveLeft = 0; p.acted = true; }
          Game.tbAfterPlayerAction();
        }
        rounds++;
      }
      const won = s.health > 0 && !foe(Game);
      totRounds += rounds; totHp += s.health; if (won) wins++; n++;
    }
    console.log(`  ${label}: mean ${(totRounds / n).toFixed(1)} rounds to kill, mean HP ${(totHp / n).toFixed(0)}, wins ${wins}/${n}`);
  }
  console.log('\ndone.');
}
main().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
