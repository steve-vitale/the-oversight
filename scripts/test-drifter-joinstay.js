// test-drifter-joinstay.js — the joined village is a real place.
// Bugs fixed 2026-10-05 (drifter playtest loop):
//  1. DOUBLE-DIP: a player joined to a distant village ate THEIR meals while
//     their labor still fed HOME's pot (villageEats skipped the away player
//     only when NOT joined). Now joined-elsewhere counts as away.
//  2. TELEPORTING FOOD: villageMeal drew the joined meal from the joined
//     pantry no matter where the player stood — including Haven's hall.
//     Now the joined meal only serves at their fire (dist <= 1).
//  3. DEAD VILLAGE: the joined village never simmed while you lived there —
//     ten people ate nothing for days; only your meal moved their pantry.
//     Now tickJoinedVillage() sims their day (via extracted simVillageDay)
//     while you're at their fire, on the same village.day watermark so
//     catch-up never double-counts.
//  4. FROZEN AFTER FIRST SIGHT: checkVillageProximity only catch-up simmed
//     while !generated, so after first contact a village froze whenever you
//     walked away (only talk/petition re-synced it). Now every approach
//     catch-ups; the first-sight announcement still fires once.
// Usage: node scripts/test-drifter-joinstay.js [--seed N]
const K = require('./godpath/lib');
const { spawnSync } = require('child_process');
const path = require('path');
const value = flag => {
  const exact = process.argv.indexOf(flag);
  return exact >= 0 ? process.argv[exact + 1] : process.argv.find(a => a.startsWith(flag + '='))?.slice(flag.length + 1);
};
const seed = Number(value('--seed') || process.env.SEED || 7);
const caseValue = value('--case-seed');
if (caseValue == null) {
  let passed = 0, failed = 0;
  for (const caseSeed of [seed, seed + 1, seed + 2]) {
    const result = spawnSync(process.execPath, [__filename, '--case-seed', String(caseSeed)], {
      cwd: path.resolve(__dirname, '..'), env: process.env, encoding: 'utf8', timeout: 60000,
    });
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    if (result.error) console.error(result.error);
    const counts = (result.stdout || '').match(/test-drifter-joinstay: (\d+) passed, (\d+) failed/);
    passed += Number(counts?.[1] || 0);
    failed += Number(counts?.[2] || 0);
    if (result.status !== 0 && !Number(counts?.[2])) failed++;
  }
  console.log(`\ntest-drifter-joinstay: ${passed} passed, ${failed} failed (three isolated seeds)`);
  process.exit(failed ? 1 : 0);
}
const caseSeed = Number(caseValue);
let Game;

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name); }
}
function reseed(s) {
  let st = s >>> 0;
  Math.random = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; };
}
const manhattan = (ax, ay, bx, by) => Math.abs(ax - bx) + Math.abs(ay - by);

async function freshGame(s) {
  reseed(s);
  Game.say = () => {};
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const sc = Game.state.scholar;
  sc.kcal = 4000; sc.health = 100; sc.hydration = 100; sc.exiled = false;
  return sc;
}
function walkTo(tx, ty) {
  let cx = Game.map.px, cy = Game.map.py, guard = 0;
  while ((cx !== tx || cy !== ty) && guard++ < 40) {
    const nx = cx !== tx ? cx + Math.sign(tx - cx) : cx;
    const ny = cx === tx ? cy + Math.sign(ty - cy) : cy;
    Game.reveal(nx, ny); Game.reveal(cx, cy);
    Game.travelTo(nx, ny, true);
    if (Game.map.px !== nx || Game.map.py !== ny) throw new Error('Travel fixture refused: ' + JSON.stringify({ nx, ny, at: [Game.map.px, Game.map.py], combat: Game.inCombat(), over: Game.over }));
    cx = Game.map.px; cy = Game.map.py;
  }
}
function nearestVillage() {
  const vs = Game.state.otherVillages || [];
  return vs.slice().sort((a, b) => manhattan(3, 3, a.x, a.y) - manhattan(3, 3, b.x, b.y))[0];
}

(async () => {
  Game = await K.load({ seed: caseSeed });
  Game.debugRegion = process.env.TEST_REGION || 'na_eastern_woodlands';
  for (const s of [caseSeed]) {
    // --- FIX 1: joined-elsewhere player does not feed home's pot ---
    // Snapshot/restore within ONE game: pre-fix, joinedVillage exempted the
    // player from the away-skip. Compare both states and observe the live meal loop.
    {
      const sc = await freshGame(s);
      const v = nearestVillage();
      walkTo(v.x, v.y);
      Game.joinVillageReal(v.id);
      const snap = JSON.stringify(Game.state.village), serviced = [];
      const meal = Game.villagerMealDay;
      Game.villagerMealDay = function (id, ...args) {
        serviced.push(id);
        return meal.call(this, id, ...args);
      };
      let dJoined, dAway;
      try {
        reseed(s * 7919 + 11);
        const p0 = Game.state.village.pantryKcal || 0;
        Game.villageEats();
        dJoined = (Game.state.village.pantryKcal || 0) - p0;
        Game.state.village = JSON.parse(snap);
        sc.joinedVillage = null; // same home state and location, merely away
        reseed(s * 7919 + 11);
        const q0 = Game.state.village.pantryKcal || 0;
        Game.villageEats();
        dAway = (Game.state.village.pantryKcal || 0) - q0;
      } finally { Game.villagerMealDay = meal; }
      ok(serviced.length > 0, `seed ${s}: the actual home NPC meal loop ran`);
      ok(!serviced.includes(Game.villagerId), `seed ${s}: the away bearer is never fed or credited as a home NPC`);

      ok(dJoined === dAway,
        `seed ${s}: joined-away home delta === away-not-joined delta (${Math.round(dJoined)} vs ${Math.round(dAway)}) — no double-dip`);
    }

    // --- FIX 2: no teleporting food from the joined pantry ---
    {
      const sc = await freshGame(s);
      const v = nearestVillage();
      walkTo(v.x, v.y);
      Game.joinVillageReal(v.id);
      walkTo(4, 4); // haven proper: genVillages keeps every village >=3 tiles from (4,4),
      // so this is guaranteed away from their fire. (3,3) could sit adjacent to one.
      ok(sc.joinedVillage === v.id, `seed ${s}: still joined after walking home`);
      reseed(s * 104729 + 3);
      const jv0 = v.pantryKcal;
      Game.villageMeal();
      ok(v.pantryKcal === jv0,
        `seed ${s}: joined pantry untouched by a meal eaten at home (${Math.round(jv0)} -> ${Math.round(v.pantryKcal)})`);
      walkTo(v.x, v.y); // back at their fire
      sc.kcal = 500;
      reseed(s * 104729 + 5);
      const jv1 = v.pantryKcal, k0 = sc.kcal;
      Game.villageMeal();
      // PROBATION PORTIONS (test fix 2026-10-10): joinVillageReal puts the
      // player on 14-day probation, and the betrayal.js villageMeal wrap
      // serves half shares (1000) until voted in — the old 2000 expectation
      // predates the probation-portions wrap. Copy and engine agree.
      ok(v.pantryKcal === jv1 - Math.min(1000, jv1) && sc.kcal > k0,
        `seed ${s}: meal at their fire draws their pantry (${Math.round(jv1)} -> ${Math.round(v.pantryKcal)}), fed ${Math.round(k0)} -> ${Math.round(sc.kcal)}`);
      // starving fire: honest +0, no phantom food
      v.pantryKcal = 0;
      sc.kcal = 500;
      Game.villageMeal();
      ok(sc.kcal === 500,
        `seed ${s}: empty joined pantry feeds nothing (kcal stays 500)`);
    }

    // --- FIX 3: the joined village lives while you're there ---
    {
      const sc = await freshGame(s);
      const v = nearestVillage();
      walkTo(v.x, v.y);
      Game.joinVillageReal(v.id);
      const day0 = v.day;
      // give them a healthy turf so their foraging has something to eat
      for (let ty = 0; ty < Game.map.tiles.length; ty++) for (let tx = 0; tx < Game.map.tiles[ty].length; tx++) {
        const t = Game.tileAt(tx, ty);
        if (t && Math.abs(tx - v.x) + Math.abs(ty - v.y) <= 4 && (t.maxStock || 0) > 0) {
          t.stock = t.maxStock;
          t.detailRegrow = {};
        }
      }
      const turf0 = Game.turfKcal(v.x, v.y), harvests = [];
      const deplete = Game.depleteRandomTile;
      Game.depleteRandomTile = function (...args) {
        const before = this.turfKcal(v.x, v.y);
        const result = deplete.apply(this, args);
        if (args[3]?.byVillage === v) harvests.push({
          day: this.state.scholar.day, requested: args[0], takes: result.takes,
          before, after: this.turfKcal(v.x, v.y), x: args[1], y: args[2],
        });
        return result;
      };
      try {
        for (let d = 0; d < 3; d++) {
          sc.kcal = 500; sc.hydration = 100; if (sc.health < 100) sc.health = 100;
          Game.state.village.pantryKcal = Math.max(Game.state.village.pantryKcal || 0, 20000);
          Game.endDay();
          if (Game.over) break;
        }
      } finally { Game.depleteRandomTile = deplete; }
      ok(v.day === day0 + 3,
        `seed ${s}: joined village day watermark advanced exactly 3 (${day0} -> ${v.day})`);
      ok(turf0 > 0 && harvests.length === 3,
        `seed ${s}: actual day resolution dispatches three joined-village harvests`);
      ok(harvests.every(h => h.x === v.x && h.y === v.y && h.takes > 0 && h.takes <= h.requested),
        `seed ${s}: joined villagers take real stock from their own turf`);
      ok(harvests.every(h => h.before - h.after === h.takes * 200),
        `seed ${s}: every visible harvest removes exactly its reported stock calories`);
      ok(new Set(harvests.map(h => h.day)).size === 3,
        `seed ${s}: harvests occur on three distinct actual days`);
      console.log('joined-harvest', JSON.stringify({ seed: s, region: Game.state.region,
        initialTurf: turf0, finalTurf: Game.turfKcal(v.x, v.y), harvests }));
      // walk away: their day must NOT advance while you're gone...
      walkTo(4, 4); // haven proper: guaranteed >=3 from every village (see above)
      const awayDay = v.day;
      sc.kcal = 4000; sc.hydration = 100;
      Game.endDay(); Game.endDay();
      ok(v.day === awayDay,
        `seed ${s}: joined village day frozen while you're away (${awayDay} -> ${v.day})`);
    }

    // --- FIX 4: every approach re-syncs (not just first sight) ---
    {
      const sc = await freshGame(s);
      const v = nearestVillage();
      walkTo(v.x, v.y); // first sight: catch-up to scholar day
      const firstDay = v.day;
      ok(firstDay === sc.day, `seed ${s}: first sight catch-up lands on scholar day (${firstDay} vs ${sc.day})`);
      walkTo(4, 4); // haven proper: guaranteed >=3 from every village (see above)
      for (let d = 0; d < 4; d++) {
        sc.kcal = 4000; sc.hydration = 100;
        Game.state.village.pantryKcal = Math.max(Game.state.village.pantryKcal || 0, 20000);
        Game.endDay();
      }
      const gap = sc.day - v.day;
      ok(gap === 4, `seed ${s}: village froze while you were gone (gap ${gap})`);
      walkTo(v.x, v.y); // walk back WITHOUT talking: proximity must re-sync
      ok(v.day === sc.day,
        `seed ${s}: approach re-syncs the village (${v.day} vs scholar ${sc.day}) — no talk needed`);
    }
  }
  console.log(`\ntest-drifter-joinstay: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH:', e.message, '\n', e.stack.split('\n').slice(0, 6).join('\n')); process.exit(1); });
