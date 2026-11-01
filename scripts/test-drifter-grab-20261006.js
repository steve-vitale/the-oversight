#!/usr/bin/env node
// Proof: the drifter's grab + return (Steve 2026-10-06).
// BUG 1 (homecoming): scholar.lastHavenDay is never initialized at depart/newGame.
//   A day-1 drifter who leaves immediately and returns on day 10 gets
//   daysAway = dayNow - (undefined || dayNow) = 0 -> NO homecoming beat.
//   The away clock must start at departure.
//   - 'homecoming-day1-drifter': FAILS before fix, PASSES after.
// COHERENCE (no fix, must stay green):
//   - 'contest-countdown-away': contest fired mid-day while camped wild far
//     from haven resolves on the natural 1-day countdown (announce day D,
//     fires during the D+1 -> D+2 endDay) and opens the modal interruption.
//   - 'contest-while-joined': home contest grabs you at another village's
//     fire; membership survives, their day watermark keeps ticking.
//   - 'distant-village-relives': leaving a distant village and returning days
//     later re-runs catch-up (village.day advances, turf visibly worked).
// Run: node scripts/test-drifter-grab-20261006.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const {loadGame}=require('./sim-harness');
let Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; } else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const said = [];

function rig(seq) { const o = Math.random; let i = 0; Math.random = () => seq[i++ % seq.length]; return () => { Math.random = o; }; }
function stepToward(tx, ty) {
  const axes = [];
  if (Game.map.px !== tx) axes.push([Game.map.px + Math.sign(tx - Game.map.px), Game.map.py]);
  if (Game.map.py !== ty) axes.push([Game.map.px, Game.map.py + Math.sign(ty - Game.map.py)]);
  for (const [nx, ny] of axes) {
    const bx = Game.map.px, by = Game.map.py;
    try { Game.travelTo(nx, ny); } catch (e) {}
    if (Game.map.px !== bx || Game.map.py !== by) return true;
  }
  // blocked both ways (creek/rubble RNG): swim it — the test walks the road,
  // it doesn't test pathfinding. force bypasses the blockage only.
  for (const [nx, ny] of axes) {
    const bx = Game.map.px, by = Game.map.py;
    try { Game.travelTo(nx, ny, true); } catch (e) {}
    if (Game.map.px !== bx || Game.map.py !== by) return true;
  }
  return false;
}
function walkTo(tx, ty) { let g = 30; while (g-- > 0 && (Game.map.px !== tx || Game.map.py !== ty)) { if (!stepToward(tx, ty)) break; } }
function fresh() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.kcal = 4000; s.health = 100; s.hydration = 100; s.water = [{ days: 3 }];
  Game.state.village.trust[Game.villagerId] = 70;
  Game.state.systemArrived = true; // isolate from the arrival cinematic
  said.length = 0;
  return s;
}
function endDay() { said.length = 0; try { Game.endDay(); } catch (e) { said.push('ENDDAY-ERR ' + e.message); } }
// campNight: the honest drifter's bedtime — eat from the pack, drink water.
// (Topping s.water alone doesn't hydrate; the body tracks s.hydration.)
function campNight() {
  const s = Game.state.scholar;
  s.kcal = 4000; s.hydration = 100; s.water = [{ days: 3 }];
  endDay();
}

(async () => {
  ({Game}=await loadGame({seed:20261018,narration:true}));
  Game.say = (t) => { said.push(String(t)); };
Game.sysSay = (t) => { said.push('[SYS] ' + String(t)); };

  // --- 1. homecoming for the day-1 drifter ---
  {
    const s = fresh();
    const hx = Game.state.village.px ?? 4, hy = Game.state.village.py ?? 4;
    walkTo(5, 0); // leave immediately, day 1
    for (let i = 0; i < 9; i++) campNight(); // 9 days out
    const dayAway = s.day;
    said.length = 0;
    walkTo(hx, hy); // stepping onto the haven tile triggers returnToVillage
    const beat = said.some(t => /days gone/i.test(t));
    ok('homecoming-day1-drifter', beat, `away ${dayAway - 1} days, beat=${beat}`);
  }

  // --- 2. contest countdown from the road ---
  {
    const s = fresh();
    s.day = 15;
    walkTo(5, 0); // camped wild, far from haven
    const u0 = rig([0.5]);
    Game.state.showBudget = null; Game.state.pendingContest = null;
    Game.fireContest(Object.assign({}, Game.contestPool().find(c => c.id === 'hide'), { givesChoice: false }));
    u0();
    const firesDay = Game.state.pendingContest.firesDay;
    campNight(); // day 15 -> 16: countdown, no fire yet
    const earlyFire = !!Game.state.activeContest;
    campNight(); // day 16 -> 17: fires
    const fired = !!Game.state.activeContest;
    ok('contest-countdown-away', !earlyFire && fired, `firesDay=${firesDay} early=${earlyFire} fired=${fired}`);
    if (fired) {
      // drive the modal; player must survive the sequence state-intact
      const px0 = Game.map.px, py0 = Game.map.py;
      const uu = rig([0.99]); let steps = 0;
      while (Game.state.activeContest && steps < 20) { try { Game.contestChoose(0); } catch (e) { break; } steps++; }
      uu();
      ok('contest-away-modal-completes', !Game.state.activeContest, `steps=${steps}`);
      ok('contest-away-position-kept', Game.map.px === px0 && Game.map.py === py0, `(${px0},${py0}) -> (${Game.map.px},${Game.map.py})`);
    }
  }

  // --- 3. contest while joined to another village ---
  {
    const s = fresh();
    s.day = 15;
    const v = (Game.state.otherVillages || [])[0];
    walkTo(v.x, v.y);
    Game.checkVillageProximity();
    Game.joinVillageReal(v.id);
    const u0 = rig([0.5]);
    Game.state.showBudget = null; Game.state.pendingContest = null;
    Game.fireContest(Object.assign({}, Game.contestPool().find(c => c.id === 'oath'), { givesChoice: false }));
    u0();
    campNight();
    campNight();
    const fired = !!Game.state.activeContest;
    if (fired) {
      const uu = rig([0.99]); let steps = 0;
      while (Game.state.activeContest && steps < 20) { try { Game.contestChoose(0); } catch (e) { break; } steps++; }
      uu();
    }
    ok('contest-while-joined-fires', fired);
    ok('contest-while-joined-membership', s.joinedVillage === v.id, `joined=${s.joinedVillage}`);
    ok('contest-while-joined-watermark', v.day === s.day, `village.day=${v.day} scholar.day=${s.day}`);
    ok('contest-while-joined-at-fire', Game.map.px === v.x && Game.map.py === v.y, `at (${Game.map.px},${Game.map.py})`);
  }

  // --- 4. distant village re-lives while you're gone ---
  {
    const s = fresh();
    s.day = 15;
    const v = (Game.state.otherVillages || [])[0];
    walkTo(v.x, v.y);
    Game.checkVillageProximity();
    const dayFirst = v.day, pantryFirst = Math.round(v.pantryKcal || 0);
    // A fed village can gather exactly its daily need: its pantry legitimately
    // stays flat below the cap. Observe actual daily work instead of requiring
    // an arbitrary stock change. Delegate every draw to the real engine.
    const deplete = Game.depleteRandomTile;
    let workedDays = 0;
    Game.depleteRandomTile = function (...args) {
      if (args[3] && args[3].byVillage === v) workedDays++;
      return deplete.apply(this, args);
    };
    walkTo(0, 0); // far away
    for (let i = 0; i < 5; i++) campNight();
    const dayGone = v.day; // should NOT have advanced while away (no one watching)
    const workedWhileAway = workedDays;
    // The real nights can open a show. Return travel must wait for its actual
    // choices; forcing world movement under that scene used to hide the bug.
    if (Game.state.activeContest) {
      const before = { x: Game.map.px, y: Game.map.py, ticks: s.dayTicks, kcal: s.kcal };
      const nx = Game.map.px + Math.sign(v.x - Game.map.px);
      const ny = Game.map.py + (nx === Game.map.px ? Math.sign(v.y - Game.map.py) : 0);
      Game.travelTo(nx, ny, true);
      ok('broadcast-refuses-return-travel-before-payment', Game.map.px === before.x &&
        Game.map.py === before.y && s.dayTicks === before.ticks && s.kcal === before.kcal);
      let sceneSteps = 0;
      while (Game.state.activeContest && sceneSteps++ < 20) Game.contestChoose(0);
    }
    ok('distant-village-return-waits-for-broadcast-choices', !Game.state.activeContest);
    walkTo(v.x, v.y);
    Game.checkVillageProximity(); // re-approach -> catch-up
    ok('distant-village-frozen-while-away', dayGone === dayFirst, `day ${dayFirst} -> ${dayGone} while away`);
    ok('distant-village-catchup-on-return', v.day === s.day, `village.day=${v.day} scholar.day=${s.day}`);
    const pantryNow = Math.round(v.pantryKcal || 0), cap = v.population * 8000;
    Game.depleteRandomTile = deplete;
    ok('distant-village-no-work-while-away', workedWhileAway === 0, `workdays ${workedWhileAway}`);
    ok('distant-village-actually-works-every-catchup-day', v.day > dayGone && workedDays === v.day - dayGone,
      `workdays ${workedDays}, missed days ${v.day - dayGone}`);
    ok('distant-village-pantry-respects-buffer', Number.isFinite(pantryNow) && pantryNow >= 0 && pantryNow <= cap,
      `pantry ${pantryFirst} -> ${pantryNow} (cap ${cap})`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
