#!/usr/bin/env node
// test-adjacenttile-b.js — proof + verdict computation for the
// adjacent-tile guard fix (NEW prereg:
// evidence/2026-10-29/sim-adjacenttile-b-prereg.md).
// Modes:
//   node scripts/test-adjacenttile-b.js
//     Placement behavior (incl. THE FIX CASE: adjacent tile with
//     playerAtHaven()==true now walks home) + staging check of the
//     banked before corpora. Must print PROOF-GREEN before any judged
//     after leg runs.
//   node scripts/test-adjacenttile-b.js verdict <afterPilotDir>
//     [<afterConfirmDir>]
//     Verdict under THIS prereg: 10772 2/2 conversion, pooled
//     hop-clear halving bar, control census, G1 causal-window count,
//     pooled total starvation reported-not-judged, G2 honesty.
//     Before leg is FIXED: the retry run's after corpora (the current
//     instrument). Pilot seeds 10772,10752,10762,10770; confirm seeds
//     10758,10759,10760,10761,10763,10764,10765,10766,10767,10768,
//     10769,10771,10773. Prints VERDICT-GO / VERDICT-NO-GO /
//     VERDICT-KILLED (+ failing bars).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const { directHopBlockage, bfsRouteAround } = require('./creekpath-probe-b');
const competent = require('./policies/competent');

const PILOT_SEEDS = [10772, 10752, 10762, 10770];
const CONFIRM_SEEDS = [10758, 10759, 10760, 10761, 10763, 10764, 10765, 10766, 10767, 10768, 10769, 10771, 10773];
const CONTROL_FIRED = { 10752: [12], 10762: [13], 10770: [5] };

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}

function havenOf(Game) {
  const v = (Game.state || {}).village || {};
  const hx = (v.px === undefined ? 4 : v.px), hy = (v.py === undefined ? 4 : v.py);
  let type = null;
  try { const t = Game.tileAt(hx, hy); type = t ? (t.type || null) : null; } catch (e) {}
  return { hx, hy, type };
}

async function placementCase(seed, sx, sy, label) {
  const { Game } = await loadGame({ seed, mode: 'adjacenttile-proof', fullTelemetry: false });
  await setupGame(Game);
  const { hx, hy, type } = havenOf(Game);
  console.log(`${label}: haven=(${hx},${hy}) type=${type}`);
  check(`${label} haven tile is haven on fresh map`, type === 'haven');
  Game.map.px = sx; Game.map.py = sy;
  const probe = directHopBlockage(Game, hx, hy);
  const route = bfsRouteAround(Game, hx, hy);
  console.log(`${label}: from (${sx},${sy}) probe=${JSON.stringify(probe)} route=${route && route.path ? 'len ' + route.length : 'none'}`);
  process.env.COMPETENT_TRIPHOME_ROUTE_AROUND = '1';
  delete process.env.COMPETENT_STANDING_HOME;
  Game.map.px = sx; Game.map.py = sy;
  const ctxOff = {};
  const dOff = competent.goHomeStanding(Game, ctxOff);
  check(`${label} C-off goHomeStanding moves nothing`, Game.map.px === sx && Game.map.py === sy, `at (${Game.map.px},${Game.map.py}) ret=${dOff} ctx=${JSON.stringify(ctxOff)}`);
  check(`${label} C-off goHomeStanding banks nothing`, !ctxOff.standingHomeDays && !ctxOff.standingHomeDetours);
  process.env.COMPETENT_STANDING_HOME = '1';
  Game.map.px = sx; Game.map.py = sy;
  try { Game.state.scholar.insideTent = false; } catch (e) {}
  const ctxOn = {};
  const dOn = competent.goHomeStanding(Game, ctxOn);
  if (!probe || (route && route.path)) {
    check(`${label} C-on goHomeStanding reaches haven`, Game.map.px === hx && Game.map.py === hy, `at (${Game.map.px},${Game.map.py}) detours=${dOn} ctx=${JSON.stringify(ctxOn)}`);
    check(`${label} C-on goHomeStanding banks a fired day`, ctxOn.standingHomeDays === 1, `ctx=${JSON.stringify(ctxOn)}`);
    if (probe && route && route.path) check(`${label} C-on goHomeStanding actually detoured (>=1 step)`, dOn >= 1, `detours=${dOn}`);
  } else {
    check(`${label} C-on goHomeStanding moves nothing with no route`, Game.map.px === sx && Game.map.py === sy, `detours=${dOn}`);
  }
  Game.map.px = hx; Game.map.py = hy;
  const ctxHome = {};
  competent.goHomeStanding(Game, ctxHome);
  check(`${label} C-on goHomeStanding fires nothing on haven tile`, !ctxHome.standingHomeDays, `ctx=${JSON.stringify(ctxHome)}`);
  Game.map.px = sx; Game.map.py = sy;
  try { Game.state.scholar.insideTent = true; } catch (e) {}
  const ctxTent = {};
  competent.goHomeStanding(Game, ctxTent);
  check(`${label} C-on goHomeStanding fires nothing inside a tent`, Game.map.px === sx && Game.map.py === sy && !ctxTent.standingHomeDays, `at (${Game.map.px},${Game.map.py}) ctx=${JSON.stringify(ctxTent)}`);
  try { Game.state.scholar.insideTent = false; } catch (e) {}
  delete process.env.COMPETENT_STANDING_HOME;
  delete process.env.COMPETENT_TRIPHOME_ROUTE_AROUND;
}

async function fixCase() {
  // THE FIX CASE: adjacent tile, playerAtHaven()==true, NOT on haven tile.
  const seed = 10772, sx = 4, sy = 3;
  const { Game } = await loadGame({ seed, mode: 'adjacenttile-proof', fullTelemetry: false });
  await setupGame(Game);
  const { hx, hy, type } = havenOf(Game);
  console.log(`FIX-CASE: haven=(${hx},${hy}) type=${type}`);
  check('FIX-CASE haven tile is haven on fresh map', type === 'haven');
  Game.map.px = sx; Game.map.py = sy;
  let pah = null;
  try { pah = Game.playerAtHaven(); } catch (e) { pah = false; }
  check('FIX-CASE blind-spot condition: playerAtHaven()==true off-tile', pah === true, `at (${sx},${sy}) pah=${pah}`);
  const probe = directHopBlockage(Game, hx, hy);
  const route = bfsRouteAround(Game, hx, hy);
  console.log(`FIX-CASE: from (${sx},${sy}) probe=${JSON.stringify(probe)} route=${route && route.path ? 'len ' + route.length : 'none'}`);
  if (probe && !(route && route.path)) {
    check('FIX-CASE fresh-map adjacent case is demonstrable (clear hop or route)', false, 'no clear hop and no route — proof cannot demonstrate the fix on this map');
    return;
  }
  process.env.COMPETENT_TRIPHOME_ROUTE_AROUND = '1';
  process.env.COMPETENT_STANDING_HOME = '1';
  try { Game.state.scholar.insideTent = false; } catch (e) {}
  Game.map.px = sx; Game.map.py = sy;
  const ctx = {};
  const d = competent.goHomeStanding(Game, ctx);
  check('FIX-CASE C-on goHomeStanding reaches haven from adjacent tile', Game.map.px === hx && Game.map.py === hy, `at (${Game.map.px},${Game.map.py}) detours=${d} ctx=${JSON.stringify(ctx)}`);
  check('FIX-CASE C-on goHomeStanding banks a fired day', ctx.standingHomeDays === 1, `ctx=${JSON.stringify(ctx)}`);
  if (!probe) check('FIX-CASE clear hop takes 0 detour steps', d === 0, `detours=${d}`);
  delete process.env.COMPETENT_STANDING_HOME;
  delete process.env.COMPETENT_TRIPHOME_ROUTE_AROUND;
}

function loadDir(d) {
  const recs = [];
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json')).sort()) {
    recs.push(JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')));
  }
  return recs.sort((a, b) => a.seed - b.seed);
}
function bySeed(recs) { const m = {}; for (const r of recs) m[r.seed] = r; return m; }

function stagingCheck() {
  // Banked before leg = retry run's after corpora; must reproduce published numbers.
  const base = path.join(__dirname, '..', 'evidence', '2026-10-29');
  const pilot = loadDir(path.join(base, 'sim-standinghome-retry-b-corpus-after-pilot'));
  const confirm = loadDir(path.join(base, 'sim-standinghome-retry-b-corpus-after-confirm'));
  const all = [...pilot, ...confirm];
  check('staging: 24 banked before files (8 pilot + 16 confirm)', pilot.length === 8 && confirm.length === 16, `pilot=${pilot.length} confirm=${confirm.length}`);
  const cnt = (recs, probe) => recs.reduce((n, r) => n + r.evenings.filter((e) => e.probe === probe).length, 0);
  check('staging: pilot refused 0', cnt(pilot, 'refused') === 0, `got ${cnt(pilot, 'refused')}`);
  check('staging: pilot hop-clear 0', cnt(pilot, 'hop-clear') === 0, `got ${cnt(pilot, 'hop-clear')}`);
  check('staging: confirm refused 0', cnt(confirm, 'refused') === 0, `got ${cnt(confirm, 'refused')}`);
  check('staging: confirm hop-clear 2 (10772 only)', cnt(confirm, 'hop-clear') === 2, `got ${cnt(confirm, 'hop-clear')}`);
  const fired = (r) => r.evenings.filter((e) => e.standingHomeDays > 0).map((e) => e.gameDay);
  const m = bySeed(all);
  check('staging: 10752 fired day 12 only', JSON.stringify(fired(m[10752])) === '[12]', `got ${JSON.stringify(fired(m[10752]))}`);
  check('staging: 10762 fired day 13 only', JSON.stringify(fired(m[10762])) === '[13]', `got ${JSON.stringify(fired(m[10762]))}`);
  check('staging: 10770 fired day 5 only', JSON.stringify(fired(m[10770])) === '[5]', `got ${JSON.stringify(fired(m[10770]))}`);
  const adj = all.reduce((n, r) => n + r.evenings.filter((e) => e.probe !== 'at-home' && e.probe !== 'game-over' && e.havenDistance === 1).length, 0);
  check('staging: adjacent-away census total 2, both 10772', adj === 2, `got ${adj}`);
  const s10772 = m[10772].evenings.filter((e) => e.gameDay === 10 || e.gameDay === 11);
  check('staging: 10772 gameDays 10+11 both hop-clear at (4,3)',
    s10772.length === 2 && s10772.every((e) => e.probe === 'hop-clear' && e.mapPx === 4 && e.mapPy === 3),
    s10772.map((e) => `d${e.gameDay}:${e.probe}@${e.mapPx},${e.mapPy}`).join(' '));
  const starv = (r) => r.deaths.filter((x) => /starv|hunger/i.test(JSON.stringify(x)));
  check('staging: pilot starvation total 4', pilot.reduce((n, r) => n + starv(r).length, 0) === 4);
  check('staging: confirm starvation total 7', confirm.reduce((n, r) => n + starv(r).length, 0) === 7);
  check('staging: 10772 player starvation death day 11 present',
    starv(m[10772]).some((x) => x.day === 11 && x.player === true), JSON.stringify(starv(m[10772])));
  return bySeed(all);
}

async function proofMode() {
  check('competent exports goHomeStanding (standing-home helper)', typeof competent.goHomeStanding === 'function');
  await placementCase(10757, 3, 3, '10757 (3,3)->haven');
  await placementCase(10752, 1, 4, '10752 (1,4)->haven');
  await fixCase();
  stagingCheck();
  console.log(failures === 0 ? 'PROOF-GREEN' : 'PROOF-RED ' + failures + ' failures');
  process.exit(failures === 0 ? 0 : 1);
}

// ---- verdict computation (this prereg) ----
function isStarv(d) { return /starv|hunger/i.test(JSON.stringify(d)); }
function seedStats(rec) {
  const evs = rec.evenings || [];
  const hop = evs.filter((e) => e.probe === 'hop-clear').length;
  const ref = evs.filter((e) => e.probe === 'refused').length;
  const refNoMove = evs.filter((e) => e.probe === 'refused' && e.movedDuringDay === false).length;
  const firedDays = evs.filter((e) => e.standingHomeDays > 0).map((e) => e.gameDay);
  const starv = (rec.deaths || []).filter(isStarv);
  const causal = starv.filter((x) => firedDays.some((D) => D <= x.day && x.day <= D + 7));
  const causalPlayer = causal.filter((x) => x.player === true);
  // G2: every standing-fired evening must end on the haven tile.
  const g2 = evs.filter((e) => e.standingHomeDays > 0 && !(e.probe === 'at-home' && e.haven && e.mapPx === e.haven.hx && e.mapPy === e.haven.hy));
  const day10 = evs.find((e) => e.gameDay === 10);
  const day11 = evs.find((e) => e.gameDay === 11);
  return { seed: rec.seed, hop, ref, refNoMove, firedDays, starv: starv.length, starvPlayer: starv.filter((x) => x.player).length,
    causal: causal.length, causalPlayer: causalPlayer.length, g2: g2.length,
    g2Detail: g2.map((e) => `loopDay ${e.loopDay} gameDay ${e.gameDay} probe ${e.probe} @${e.mapPx},${e.mapPy}`).join(' ; '),
    day10probe: day10 ? day10.probe : null, day11probe: day11 ? day11.probe : null,
    maxWave: rec.maxWaveUnlocked, daysAlive: rec.daysAlive };
}
function bandVerdict(label, seeds, beforeMap, afterMap) {
  console.log(`--- ${label} ---`);
  let bHop = 0, aHop = 0, bRef = 0, aRef = 0, g1 = 0, g1Player = 0, g2 = 0, bStarv = 0, aStarv = 0;
  let controlOk = true;
  for (const s of seeds) {
    const b = beforeMap[s], a = afterMap[s];
    if (!b) { console.log(`seed ${s}: MISSING BEFORE`); controlOk = false; continue; }
    if (!a) { console.log(`seed ${s}: MISSING AFTER`); controlOk = false; continue; }
    const bs = seedStats(b), as = seedStats(a);
    bHop += bs.hop; aHop += as.hop; bRef += bs.ref; aRef += as.ref;
    g1 += as.causal; g1Player += as.causalPlayer; g2 += as.g2;
    bStarv += bs.starv; aStarv += as.starv;
    console.log(`seed ${s}: hop ${bs.hop}->${as.hop} refused ${bs.ref}->${as.ref} noMoveRef ${bs.refNoMove}->${as.refNoMove} ` +
      `fired ${JSON.stringify(bs.firedDays)}->${JSON.stringify(as.firedDays)} starv ${bs.starv}->${as.starv} ` +
      `causal ${as.causal} (player ${as.causalPlayer}) G2viol ${as.g2} wave ${bs.maxWave}->${as.maxWave} daysAlive ${bs.daysAlive}->${as.daysAlive}`);
    if (as.g2) console.log(`  G2 DETAIL seed ${s}: ${as.g2Detail}`);
    if (CONTROL_FIRED[s]) {
      const ok = JSON.stringify(as.firedDays) === JSON.stringify(CONTROL_FIRED[s]) && as.ref === 0;
      if (!ok) controlOk = false;
      console.log(`  control ${s}: fired must be ${JSON.stringify(CONTROL_FIRED[s])} + refused 0 -> ${ok ? 'OK' : 'DIVERGED'}`);
    }
  }
  const bar = Math.floor(bHop / 2);
  const hopPass = aHop <= bar;
  console.log(`${label}: hop-clear ${bHop}->${aHop} bar after<=${bar} -> ${hopPass ? 'PASS' : 'FAIL'}`);
  console.log(`${label}: refused ${bRef}->${aRef} (reported, not judged)`);
  console.log(`${label}: G1 causal-window starvation ${g1} (player ${g1Player}) bar 0 -> ${g1 === 0 ? 'HOLD' : 'VIOLATION'}`);
  console.log(`${label}: G2 honesty violations ${g2} bar 0 -> ${g2 === 0 ? 'HOLD' : 'VIOLATION'}`);
  console.log(`${label}: pooled total starvation ${bStarv}->${aStarv} (reported, not judged)`);
  console.log(`${label}: controls ${controlOk ? 'OK' : 'DIVERGED'}`);
  return { bHop, aHop, bar, hopPass, g1, g2, controlOk, bStarv, aStarv };
}
function verdictMode(afterPilotDir, afterConfirmDir) {
  const base = path.join(__dirname, '..', 'evidence', '2026-10-29');
  const beforeMap = bySeed([...loadDir(path.join(base, 'sim-standinghome-retry-b-corpus-after-pilot')),
    ...loadDir(path.join(base, 'sim-standinghome-retry-b-corpus-after-confirm'))]);
  const afterPilot = bySeed(loadDir(afterPilotDir));
  const p = bandVerdict('PILOT', PILOT_SEEDS, beforeMap, afterPilot);
  // 10772 2/2 conversion (after-leg gameDay 10 + 11 rows at-home).
  const a10772 = afterPilot[10772];
  let conv = false, convDetail = '';
  if (a10772) {
    const s = seedStats(a10772);
    conv = s.day10probe === 'at-home' && s.day11probe === 'at-home';
    convDetail = `day10=${s.day10probe} day11=${s.day11probe} fired=${JSON.stringify(s.firedDays)}`;
  }
  console.log(`PILOT 10772 conversion 2/2: ${conv ? 'PASS' : 'FAIL'} :: ${convDetail}`);
  const pilotGo = conv && p.hopPass && p.g1 === 0 && p.g2 === 0 && p.controlOk;
  const pilotKilled = !conv || p.g1 !== 0 || p.g2 !== 0;
  console.log(`PILOT VERDICT: ${pilotKilled ? 'VERDICT-KILLED' : (pilotGo ? 'VERDICT-GO' : 'VERDICT-NO-GO')}`);
  if (!afterConfirmDir) {
    console.log(pilotKilled ? 'VERDICT-KILLED' : (pilotGo ? 'VERDICT-GO' : 'VERDICT-NO-GO'));
    process.exit(0);
  }
  const afterConfirm = bySeed(loadDir(afterConfirmDir));
  const afterAll = Object.assign({}, afterPilot, afterConfirm);
  const c = bandVerdict('CONFIRM-BAND', CONFIRM_SEEDS, beforeMap, afterConfirm);
  const pooled = bandVerdict('POOLED (pilot+confirm)', [...PILOT_SEEDS, ...CONFIRM_SEEDS], beforeMap, afterAll);
  const pooledGo = conv && pooled.hopPass && pooled.g1 === 0 && pooled.g2 === 0 && pooled.controlOk;
  const pooledKilled = !conv || pooled.g1 !== 0 || pooled.g2 !== 0;
  console.log(`POOLED VERDICT: ${pooledKilled ? 'VERDICT-KILLED' : (pooledGo ? 'VERDICT-GO' : 'VERDICT-NO-GO')}`);
  console.log(`CONFIRM-BAND (reported): hop ${c.bHop}->${c.aHop} G1 ${c.g1} G2 ${c.g2} controls ${c.controlOk ? 'OK' : 'DIVERGED'}`);
  process.exit(0);
}

(async () => {
  const mode = process.argv[2];
  if (mode === 'verdict') {
    verdictMode(process.argv[3], process.argv[4]);
  } else {
    await proofMode();
  }
})().catch((e) => { console.error('FATAL', e && (e.stack || e.message)); process.exit(1); });
