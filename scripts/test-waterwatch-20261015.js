#!/usr/bin/env node
// test-waterwatch-20261015.js — proof test for the SCHOLAR CISTERN-WATCH
// policy layer (loop B, food-economy ARM 2, 2026-10-15, sim-findings #291).
//
// The layer (scripts/policies/waterwatch.js, WATERWATCH=1): when the cistern
// is dry (clean < ~1 day of village draw) OR a dehydration death has
// occurred on this run, the scholar does water work themselves that day —
// creek fill -> hearth boil -> drink, zero haven-well draw — and says a
// village-meeting-style beat about it. Zero src/js changes.
//
// PART 0 (module + gate): named exports resolve (#69 unwrap); layerOn()
//   false/true with the env gate; waterwatch(base) wraps inert when off
//   (_waterwatchLive false), live when on.
// PART 1 (RED — natural behavior): gate OFF, dry cistern, scholar at haven,
//   empty pack, low hydration -> one wrapped daily -> the scholar draws from
//   the haven well (cistern clean decreases); no _waterwatch state created.
// PART 2 (GREEN — the mechanism): gate ON, same setup (seed 33, wetland@d1
//   of haven, hearth fire) -> creekFills>=1, boilsOk>=1, cistern clean
//   UNCHANGED (zero well draw), beat fired, ledger present, pack ends clean.
// PART 3 (death latch): gate ON, full cistern -> watch off; forced honest
//   dehydration death (hydration 0 / health 10 / endDay) -> dehyDeathSeen,
//   deathName recorded, watchState on with reason 'death'; the successor's
//   first watch day fires the death beat naming the dead.
// PART 4 (det-gate): 8 seeds x {leadcourt,belongseek} x {gate-off-wrapped,
//   raw base}, 60d — per-day state hashes BYTE-IDENTICAL (the inert wrap is
//   trajectory-neutral).
// PART 5 (SMOKE): SMOKE=1 fast leg — 1 seed x 2 policies x 15d: policy.daily
//   fires >=10x/run; armed _waterwatchLive true + ledger exists; control
//   live false + no Game._waterwatch.
//
// RED-verification (never stash on the shared repo): --red builds a BROKEN
// copy of the layer (isDry forced false) under /tmp and runs PART 2's GREEN
// assertions against it — they must FAIL LOUD (RED OBSERVED, exit 0). If the
// broken layer passes, the test is vacuous (exit 2).
//
// KILL PROTOCOL: if scripts/policies/waterwatch.js is absent (layer deleted
// after a §14 kill), this script degrades to INFO-SKIP (exit 0), never
// MODULE_NOT_FOUND.
//
// Usage:
//   node scripts/test-waterwatch-20261015.js            # full proof
//   node scripts/test-waterwatch-20261015.js --red      # RED phase only
//   SMOKE=1 node scripts/test-waterwatch-20261015.js    # PART 5 only
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

let WW;
try {
  WW = require('./policies/waterwatch.js');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/waterwatch.js absent (layer deleted per kill protocol).');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const RED = process.argv.includes('--red');
const SMOKE = process.env.SMOKE === '1';
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = { leadcourt, belongseek };

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.error('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const vw = v.water || {};
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
    (s.water || []).length, Math.floor(vw.clean || 0), Math.floor(vw.dirty || 0),
    (v.roster || []).length, Game.villagerId].join('|');
}

function neutralizeCheats(Game) {
  const s = Game.state.scholar || {};
  try {
    if (Game.hasAbility && Game.hasAbility('second_wind')) { s.secondWindDay = s.day; s.secondWindUses = 99; }
    if (Game.hasAbility && Game.hasAbility('molt')) { s.moltWeek = Math.floor(s.day / 7); s.moltUses = 99; }
    if (Game.state.phoenixLink) Game.state.phoenixLink = null;
  } catch (e) {}
}

function forceDehydration(Game) {
  const s = Game.state.scholar;
  s.kcal = 5000; s.energy = 50;
  s.hydration = 0; s.health = 10;    // -12 health overnight -> dead
  neutralizeCheats(Game);
}

async function newGame(seed, mode) {
  const { Game } = await loadGame({ seed, mode, fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  return Game;
}

function havenize(Game) {
  const v = Game.state.village || {};
  Game.map.px = v.px ?? 4; Game.map.py = v.py ?? 4;
}

// Count haven-well vs wild fills through a wrapping fillWater.
function countFills(Game) {
  const c = { haven: 0, wild: 0 };
  const ofw = Game.fillWater.bind(Game);
  Game.fillWater = function () {
    const b = ((Game.state.scholar || {}).water || []).length;
    const r = ofw.apply(this, arguments);
    const a = ((Game.state.scholar || {}).water || []).length;
    if (a > b) {
      let t = null;
      try { t = Game.playerTile ? Game.playerTile() : null; } catch (e) {}
      // haven-well fills happen on the haven tile; wild fills on water tiles
      if (t && t.type === 'haven') c.haven += (a - b);
      else c.wild += (a - b);
    }
    return r;
  };
  return c;
}

function drySetup(Game) {
  havenize(Game);
  Game.state.village.water = { clean: 2, dirty: 0 }; // dry: 2 < 2*roster
  Game.state.scholar.water = [];
  Game.state.scholar.hydration = 20;
}

// ---------------- PART 0: module + gate ----------------
function part0() {
  console.log('PART 0 — module + gate');
  for (const n of ['waterwatch', 'layerOn', 'watchState', 'wwState', 'findWaterTile', 'isDry', 'cistern', 'dryThreshold']) {
    check('named export ' + n, typeof WW[n] === 'function', typeof WW[n]);
  }
  check('DRY_BEATS non-empty', Array.isArray(WW.DRY_BEATS) && WW.DRY_BEATS.length >= 2);
  check('DEATH_BEATS non-empty', Array.isArray(WW.DEATH_BEATS) && WW.DEATH_BEATS.length >= 1);
  const had = process.env.WATERWATCH;
  delete process.env.WATERWATCH;
  check('layerOn() false without env', WW.layerOn() === false);
  const wOff = WW.waterwatch(leadcourt);
  check('gate-off wrap is inert (_waterwatchLive false)', wOff._waterwatchLive === false);
  check('gate-off wrap keeps base daily', typeof wOff.daily === 'function' && wOff.id === 'leadcourt');
  process.env.WATERWATCH = '1';
  check('layerOn() true with WATERWATCH=1', WW.layerOn() === true);
  const wOn = WW.waterwatch(leadcourt);
  check('gate-on wrap is live', wOn._waterwatchLive === true && /waterwatch/.test(wOn.id));
  if (had === undefined) delete process.env.WATERWATCH; else process.env.WATERWATCH = had;
}

// ---------------- PART 1: RED — natural behavior, gate off ----------------
// The competent-family drinkSafe fills at the haven well during upkeep
// (3x/day). Gate off -> the scholar draws the well on a dry day.
async function part1() {
  console.log('PART 1 — RED: gate OFF, dry cistern -> scholar draws the haven well');
  delete process.env.WATERWATCH;
  const Game = await newGame(33, 'ww-red-fixture');
  drySetup(Game);
  const fills = countFills(Game);
  const p = WW.waterwatch(leadcourt);
  await quietLog(async () => {
    for (let i = 0; i < 3; i++) await p.upkeep(Game, {});
    await p.daily(Game, {});
  });
  check('scholar drew from the haven well (natural behavior)', fills.haven >= 1,
    'havenFills=' + fills.haven + ' wildFills=' + fills.wild);
  check('layer left no state on Game when off', !Game._waterwatch, 'present=' + !!Game._waterwatch);
  check('no death-wrap installed when off', !Game._waterwatchDeathWrapped);
}

// ---------------- PART 2: GREEN — the mechanism ----------------
// Gate ON: the upkeep leg pre-fills the pack at the creek (3x/day, before
// the base upkeep's drinkSafe), so the haven-well fill gate never fires.
async function part2(layerMod, label) {
  console.log('PART 2 — GREEN: gate ON, dry cistern -> scholar self-sources (' + label + ')');
  process.env.WATERWATCH = '1';
  const Game = await newGame(33, 'ww-green-fixture');
  havenize(Game);
  const wt = layerMod.findWaterTile(Game);
  check('fixture precondition: revealed water tile adjacent to haven (seed 33)', !!wt, JSON.stringify(wt));
  drySetup(Game);
  const fills = countFills(Game);
  const says = [];
  const osay = Game.say.bind(Game);
  Game.say = function (m) { says.push(String(m)); return osay(m); };
  const p = layerMod.waterwatch(leadcourt);
  const day = Game.state.scholar.day;
  await quietLog(async () => {
    await p.upkeep(Game, {}); // leg: creek fill x3 + boil, before base drinkSafe
    await p.daily(Game, {});  // beat + end-of-day top-up
  });
  const st = layerMod.wwState(Game);
  const rec = st.days[day];
  check('ledger exists for the day', !!rec, 'days=' + Object.keys(st.days).join(','));
  if (rec) {
    check('watch engaged (reason dry)', rec.watch === true && rec.reason === 'dry', JSON.stringify({ watch: rec.watch, reason: rec.reason }));
    check('creek fills >= 3 (upkeep leg + daily top-up)', rec.creekFills >= 3, 'creekFills=' + rec.creekFills);
    check('boil converted risky->clean', rec.boilsOk >= 3, 'boilsOk=' + rec.boilsOk + ' refused=' + rec.boilsRefused);
    check('no walk failure / no fire failure', !rec.walkFailed && !rec.noFire && !rec.noWaterTile,
      JSON.stringify({ walkFailed: rec.walkFailed, noFire: rec.noFire, noWaterTile: rec.noWaterTile }));
  }
  check('ZERO haven-well fills (the mechanism)', fills.haven === 0,
    'havenFills=' + fills.haven + ' wildFills=' + fills.wild);
  const beats = says.filter(s => s.indexOf('🪣') === 0);
  check('village-meeting beat fired', beats.length >= 1, 'beats=' + beats.length);
  if (beats.length) {
    const b = beats[0];
    check('beat reads as a person deciding (names the decision)', /creek|well|cistern/i.test(b) && /I /i.test(b), b.slice(0, 90));
  }
  const pack = (Game.state.scholar.water || []).map(x => x.quality);
  check('pack ends with clean water (boiled, not raw risky)', pack.length > 0 && pack.every(q => q === 'clean'), pack.join(','));
  check('death-wrap installed when on', !!Game._waterwatchDeathWrapped);
  delete process.env.WATERWATCH;
  return { failedBefore: failed };
}

// ---------------- PART 3: death latch ----------------
async function part3() {
  console.log('PART 3 — dehydration death latches the watch (successor remembers)');
  process.env.WATERWATCH = '1';
  const Game = await newGame(33, 'ww-death-fixture');
  havenize(Game);
  Game.state.village.water = { clean: 40, dirty: 0 }; // full: NOT dry
  const p = WW.waterwatch(leadcourt);
  const ws0 = WW.watchState(Game);
  check('watch OFF with full cistern pre-death', ws0.on === false, JSON.stringify(ws0));
  const deadName = (() => {
    try {
      const ch = (Game.data.villagers || []).find(x => x.id === Game.villagerId) || {};
      return ch.name || null;
    } catch (e) { return null; }
  })();
  await quietLog(async () => { await p.daily(Game, {}); }); // installs the death wrap
  check('death wrap installed', !!Game._waterwatchDeathWrapped);
  forceDehydration(Game);
  const dayD = Game.state.scholar.day;
  await quietLog(async () => { Game.endDay(); }); // honest overnight death
  const st = WW.wwState(Game);
  check('dehyDeathSeen latched', st.dehyDeathSeen === true);
  check('dead scholar name recorded', !!st.deathName, 'name=' + st.deathName);
  const ws1 = WW.watchState(Game);
  check('watch ON after death (latch drives it)', ws1.on === true && ws1.dehyDeathSeen === true,
    JSON.stringify(ws1));
  // Isolate the latch: refill the cistern (fixture intervention) so dryness
  // can't explain the watch — the death latch alone must hold it on.
  Game.state.village.water = { clean: 40, dirty: 0 };
  const ws2 = WW.watchState(Game);
  check('death latch alone holds the watch (reason death, cistern full)',
    ws2.on === true && ws2.reason === 'death' && ws2.dry === false, JSON.stringify(ws2));
  // successor's first watch day: position at haven, run the daily, read the beat
  havenize(Game);
  const says = [];
  const osay = Game.say.bind(Game);
  Game.say = function (m) { says.push(String(m)); return osay(m); };
  const dayS = Game.state.scholar.day;
  await quietLog(async () => { await p.daily(Game, {}); });
  const deathBeats = says.filter(s => s.indexOf('🪣') === 0);
  check('death beat fired for the successor', deathBeats.length >= 1, 'beats=' + deathBeats.length);
  if (deathBeats.length && deadName) {
    check('death beat names the dead (a person, not a knob)', deathBeats[0].indexOf(deadName) >= 0,
      deathBeats[0].slice(0, 110));
  }
  delete process.env.WATERWATCH;
}

// ---------------- PART 4: det-gate ----------------
async function part4() {
  console.log('PART 4 — det-gate: gate-off wrapped vs raw base, 8 seeds x 2 policies x 60d');
  delete process.env.WATERWATCH;
  let compared = 0, diverged = 0;
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      const hashes = {};
      for (const side of ['wrapped', 'raw']) {
        const Game = await newGame(seed, 'ww-detgate-' + pid + '-' + side);
        const policy = side === 'wrapped' ? WW.waterwatch(POLICIES[pid]) : POLICIES[pid];
        const hs = [];
        const oed = Game.endDay.bind(Game);
        Game.endDay = function () {
          const r = oed.apply(this, arguments);
          try { hs.push(dayHash(this)); } catch (e) { hs.push('ERR'); }
          return r;
        };
        await quietLog(async () => { await runDays(Game, policy, { days: 60 }); });
        hashes[side] = hs;
      }
      compared++;
      const a = hashes.wrapped, b = hashes.raw;
      const same = a.length === b.length && a.every((h, i) => h === b[i]);
      if (!same) { diverged++; console.error('  DIVERGE ' + pid + ' seed ' + seed + ' (' + a.length + ' vs ' + b.length + ' days)'); }
    }
  }
  check('all 16 pairs byte-identical', diverged === 0, compared + ' compared, ' + diverged + ' diverged');
}

// ---------------- PART 5: SMOKE ----------------
async function part5() {
  console.log('PART 5 — SMOKE=1 instrument honesty');
  let ok = true;
  for (const pid of Object.keys(POLICIES)) {
    for (const armed of [true, false]) {
      if (armed) process.env.WATERWATCH = '1'; else delete process.env.WATERWATCH;
      const Game = await newGame(11, 'ww-smoke-' + pid + '-' + (armed ? 'a' : 'c'));
      let dailyCalls = 0;
      const base = POLICIES[pid];
      const p = WW.waterwatch(base);
      const od = p.daily;
      const pw = Object.assign({}, p);
      pw.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
      await quietLog(async () => { await runDays(Game, pw, { days: 15 }); });
      check(pid + ' ' + (armed ? 'armed' : 'control') + ': policy.daily >= 10x', dailyCalls >= 10, 'calls=' + dailyCalls);
      check(pid + ' ' + (armed ? 'armed' : 'control') + ': live marker ' + (armed ? 'true' : 'false'),
        !!pw._waterwatchLive === armed, 'live=' + pw._waterwatchLive);
      if (armed) check(pid + ' armed: ledger exists', !!Game._waterwatch);
      else check(pid + ' control: no ledger', !Game._waterwatch, 'present=' + !!Game._waterwatch);
    }
  }
  delete process.env.WATERWATCH;
}

function loadBrokenLayer() {
  // REAL RED: a broken COPY of the layer (isDry forced false) — the repo
  // file is never touched (no stash on the shared repo, ever).
  const src = fs.readFileSync(path.join(__dirname, 'policies', 'waterwatch.js'), 'utf8');
  const broken = src.replace(
    'function isDry(Game) {\n  return cistern(Game).clean < dryThreshold(Game);',
    'function isDry(Game) {\n  return false; // RED: trigger broken'
  );
  if (broken === src) throw new Error('RED patch anchor not found');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ww-red-'));
  const fp = path.join(dir, 'waterwatch.js');
  fs.writeFileSync(fp, broken);
  return require(fp);
}

async function main() {
  if (RED) {
    console.log('RED PHASE — broken layer (isDry forced false); PART 2 GREEN assertions must FAIL LOUD');
    const brokenMod = loadBrokenLayer();
    const f0 = failed;
    await part2(brokenMod, 'BROKEN');
    const newFails = failed - f0;
    if (newFails > 0) {
      console.log('RED OBSERVED: ' + newFails + ' GREEN assertion(s) failed against the broken layer.');
      process.exit(0);
    } else {
      console.error('RED FAILED TO FAIL: broken layer passed all GREEN assertions — the test is vacuous.');
      process.exit(2);
    }
  }
  if (SMOKE) { await part0(); await part5(); }
  else {
    part0();
    await part1();
    await part2(WW, 'GREEN');
    await part3();
    await part4();
    await part5();
  }
  console.log('waterwatch proof: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
