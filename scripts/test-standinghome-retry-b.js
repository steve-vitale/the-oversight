#!/usr/bin/env node
// test-standinghome-retry-b.js — proof + verdict computation for the
// standing-home retry (NEW prereg:
// evidence/2026-10-29/sim-standinghome-retry-b-prereg.md).
// Modes:
//   node scripts/test-standinghome-retry-b.js
//     Placement behavior + gate-off neutrality (must print PROOF-GREEN
//     before any judged after leg runs). Compares the banked before-pilot
//     corpus against the Arm B after-pilot corpus evening probes exactly.
//   node scripts/test-standinghome-retry-b.js <before-dir> <after-dir>
//     [<before-dir2> <after-dir2>]
//     Verdict under the NEW prereg: primary halving bar, no-move halving
//     bar, strand guard, G1-REVISED (causal-window starvation deaths only,
//     bar = 0), pooled total starvation reported-not-judged, G2
//     counterfactual. Prints VERDICT-GO / VERDICT-NO-GO (+ failing bars).
//     With 4 dirs: band verdicts plus a POOLED verdict.
// The causal window: a starvation death on day d counts iff a standing
// step fired for that seed on some gameDay D with D <= d <= D+7.
// The before leg has the gate OFF, so its causal-window count is 0 by
// definition; G1-REVISED therefore requires 0 causal-window starvation
// deaths in the after leg.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const { directHopBlockage, bfsRouteAround } = require('./creekpath-probe-b');
const competent = require('./policies/competent');

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
  const { Game } = await loadGame({ seed, mode: 'standinghome-retry-proof', fullTelemetry: false });
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
  check(`${label} C-on goHomeStanding fires nothing at haven`, !ctxHome.standingHomeDays, `ctx=${JSON.stringify(ctxHome)}`);
  Game.map.px = sx; Game.map.py = sy;
  try { Game.state.scholar.insideTent = true; } catch (e) {}
  const ctxTent = {};
  competent.goHomeStanding(Game, ctxTent);
  check(`${label} C-on goHomeStanding fires nothing inside a tent`, Game.map.px === sx && Game.map.py === sy && !ctxTent.standingHomeDays, `at (${Game.map.px},${Game.map.py}) ctx=${JSON.stringify(ctxTent)}`);
  try { Game.state.scholar.insideTent = false; } catch (e) {}
  delete process.env.COMPETENT_STANDING_HOME;
  delete process.env.COMPETENT_TRIPHOME_ROUTE_AROUND;
}

async function proofMode() {
  check('competent exports goHomeStanding (standing-home helper)', typeof competent.goHomeStanding === 'function');
  await placementCase(10757, 3, 3, '10757 (3,3)->haven');
  await placementCase(10752, 1, 4, '10752 (1,4)->haven');
  const beforeDir = path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-creekpath-armc-b-corpus-before-pilot');
  const armBDir = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-creekpath-armb-b-corpus-after-pilot');
  const seq = (rec) => (rec.evenings || []).map((e) => e.probe + '@' + e.mapPx + ',' + e.mapPy + ':' + e.tile).join('|');
  let allMatch = true;
  for (const f of fs.readdirSync(armBDir).filter((x) => x.endsWith('.json')).sort()) {
    const seed = f.match(/s(\d+)\.json/)[1];
    const armB = JSON.parse(fs.readFileSync(path.join(armBDir, f), 'utf8'));
    const mine = path.join(beforeDir, 'creekpath-b-competent-s' + seed + '.json');
    if (!fs.existsSync(mine)) { console.log('FAIL neutrality seed ' + seed + ': before-pilot corpus missing ' + mine); allMatch = false; continue; }
    const fresh = JSON.parse(fs.readFileSync(mine, 'utf8'));
    const ok = seq(fresh) === seq(armB);
    console.log((ok ? 'PASS' : 'FAIL') + ' neutrality seed ' + seed +
      ' :: fresh refused=' + fresh.evenings.filter((e) => e.probe === 'refused').length +
      ' armB refused=' + armB.evenings.filter((e) => e.probe === 'refused').length);
    if (!ok) allMatch = false;
  }
  check('gate-off before-pilot reproduces Arm B after-pilot corpus exactly', allMatch);
  console.log(failures === 0 ? 'PROOF-GREEN' : 'PROOF-RED ' + failures + ' failures');
  process.exit(failures === 0 ? 0 : 1);
}

// ---- verdict computation (new prereg) ----
function loadDir(d) {
  const recs = [];
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json')).sort()) {
    recs.push(JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')));
  }
  return recs.sort((a, b) => a.seed - b.seed);
}
function isStarv(d) { return /starv|hunger/i.test(JSON.stringify(d)); }
function strandsOf(evs) {
  const strands = []; let cur = null;
  for (const e of evs) {
    if (e.probe === 'refused') {
      if (!cur) cur = { length: 0, tile: e.tile + ' (' + e.mapPx + ',' + e.mapPy + ')', block: (e.block ? e.block.blockType + '@' + e.block.x + ',' + e.block.y + '/' + e.block.leg : '?') };
      cur.length++;
    } else if (cur) { strands.push(cur); cur = null; }
  }
  if (cur) strands.push(cur);
  return strands;
}
function summarize(recs, label, beforeDeathKeys) {
  let totRefused = 0, totNoMove = 0, totHopClear = 0, totOutReach = 0;
  let totStandingDays = 0, totStandingDetours = 0, totStarv = 0, totStarvPlayer = 0;
  let totCausal = 0, totCausalPlayer = 0, totG2 = 0;
  const perSeed = {};
  for (const r of recs) {
    const evs = r.evenings || [];
    const refused = evs.filter((e) => e.probe === 'refused');
    const noMove = refused.filter((e) => e.movedDuringDay === false);
    const standingEvs = evs.filter((e) => (e.standingHomeDays || 0) > 0);
    const standingDays = new Set(standingEvs.map((e) => e.gameDay));
    const detourDays = new Set(evs.filter((e) => (e.tripHomeDetours || 0) > 0 || (e.standingHomeDetours || 0) > 0).map((e) => e.gameDay));
    const starv = (r.deaths || []).filter(isStarv);
    const causal = starv.filter((d) => [...standingDays].some((D) => D <= d.day && d.day <= D + 7));
    const g2hits = [];
    if (beforeDeathKeys) {
      const keys = beforeDeathKeys[r.seed] || new Set();
      for (const d of (r.deaths || [])) {
        if (!d.player) continue;
        if (!(detourDays.has(d.day) || detourDays.has(d.day - 1))) continue;
        if (keys.has(d.day + '|' + (d.cause || d.kind))) continue;
        g2hits.push(d.day + ':' + (d.cause || d.kind));
      }
    }
    const strands = strandsOf(evs);
    const longest = strands.reduce((m, s) => Math.max(m, s.length), 0);
    perSeed[r.seed] = { refused: refused.length, noMove: noMove.length, longest, strands,
      standingDays: standingEvs.length, standingDetours: evs.reduce((t, e) => t + (e.standingHomeDetours || 0), 0),
      standingGameDays: [...standingDays].sort((a, b) => a - b),
      starv: starv.length, starvPlayer: starv.filter((d) => d.player).length,
      causal: causal.length, causalPlayer: causal.filter((d) => d.player).length,
      causalDetail: causal.map((d) => d.day + ':' + d.who + ':' + (d.cause || d.kind) + (d.player ? ':player' : '')),
      starvDetail: starv.map((d) => d.day + ':' + d.who + ':' + (d.cause || d.kind) + (d.player ? ':player' : '')),
      g2hits };
    totRefused += refused.length; totNoMove += noMove.length;
    totHopClear += evs.filter((e) => e.probe === 'hop-clear').length;
    totOutReach += evs.filter((e) => e.probe === 'out-of-reach').length;
    totStandingDays += standingEvs.length;
    totStandingDetours += perSeed[r.seed].standingDetours;
    totStarv += starv.length; totStarvPlayer += perSeed[r.seed].starvPlayer;
    totCausal += causal.length; totCausalPlayer += perSeed[r.seed].causalPlayer; totG2 += g2hits.length;
    console.log(`seed ${r.seed}: days=${r.daysAlive} deaths=${(r.deaths || []).length} refused=${refused.length} noMove=${noMove.length} hopClear=${evs.filter((e) => e.probe === 'hop-clear').length} outReach=${evs.filter((e) => e.probe === 'out-of-reach').length} standingDays=${standingEvs.length} standingDetours=${perSeed[r.seed].standingDetours} longestStrand=${longest} starvPooled=${starv.length} (player ${perSeed[r.seed].starvPlayer}) starvCausal=${causal.length} (player ${perSeed[r.seed].causalPlayer}) g2=${JSON.stringify(g2hits)}`);
    for (const s of strands) console.log(`    strand seed ${r.seed}: len=${s.length} at=${s.tile} block=${s.block}`);
    if (perSeed[r.seed].causalDetail.length) console.log(`    causal starvation seed ${r.seed}: ${perSeed[r.seed].causalDetail.join(', ')}`);
    if (perSeed[r.seed].starvDetail.length) console.log(`    pooled starvation seed ${r.seed}: ${perSeed[r.seed].starvDetail.join(', ')}`);
  }
  console.log(`POOLED ${label}: seeds=${recs.length} refused=${totRefused} noMove=${totNoMove} hopClear=${totHopClear} outReach=${totOutReach} standingDays=${totStandingDays} standingDetours=${totStandingDetours} starvPooled=${totStarv} (player ${totStarvPlayer}) starvCausal=${totCausal} (player ${totCausalPlayer}) g2=${totG2}`);
  return { perSeed, totRefused, totNoMove, totHopClear, totOutReach, totStandingDays, totStandingDetours, totStarv, totStarvPlayer, totCausal, totCausalPlayer, totG2 };
}
function verdictFor(before, after, label) {
  const bar = Math.floor(before.totRefused / 2);
  const noMoveBar = Math.floor(before.totNoMove / 2);
  const primaryOk = after.totRefused <= bar;
  const noMoveOk = after.totNoMove <= noMoveBar;
  const g1Ok = after.totCausal === 0; // before causal is 0 by definition (gate OFF)
  let guardOk = true;
  for (const seed of Object.keys(before.perSeed)) {
    const b = before.perSeed[seed], a = after.perSeed[seed];
    if (!a) { console.log(`strand guard ${label} seed ${seed}: MISSING in after leg`); guardOk = false; continue; }
    const ok = a.longest <= b.longest || a.refused < b.refused;
    if (!ok) guardOk = false;
    console.log(`strand guard ${label} seed ${seed}: before longest=${b.longest} count=${b.refused} -> after longest=${a.longest} count=${a.refused}: ${ok ? 'OK' : 'VIOLATION'}`);
  }
  const g2Ok = after.totG2 === 0;
  console.log(`\n===== VERDICT ${label} under NEW prereg =====`);
  console.log(`primary: before=${before.totRefused} after=${after.totRefused} bar=after<=${bar}: ${primaryOk ? 'PASS' : 'FAIL'}`);
  console.log(`no-move co-primary: before=${before.totNoMove} after=${after.totNoMove} bar=after<=${noMoveBar}: ${noMoveOk ? 'PASS' : 'FAIL'}`);
  console.log(`G1-REVISED causal-window starvation (bar 0): after=${after.totCausal} (player ${after.totCausalPlayer}): ${g1Ok ? 'HOLD' : 'VIOLATION'}`);
  console.log(`pooled TOTAL starvation REPORTED-NOT-JUDGED: before=${before.totStarv} (player ${before.totStarvPlayer}) after=${after.totStarv} (player ${after.totStarvPlayer})`);
  console.log(`G2 counterfactual player deaths: ${after.totG2}: ${g2Ok ? 'HOLD' : 'VIOLATION'}`);
  console.log(`G3 perception-lawful: by construction (own tile, home haven, engine-offered adjacent steps only)`);
  const go = primaryOk && noMoveOk && guardOk && g1Ok && g2Ok;
  console.log(`OVERALL ${label}: ${go ? 'GO' : 'NO-GO'}`);
  return go;
}
function beforeDeathKeys(recs) {
  const m = {};
  for (const r of recs) { const s = new Set(); for (const d of (r.deaths || [])) if (d.player) s.add(d.day + '|' + (d.cause || d.kind)); m[r.seed] = s; }
  return m;
}
function verdictMode(args) {
  const b1 = summarize(loadDir(args[0]), 'BEFORE', null);
  const a1 = summarize(loadDir(args[1]), 'AFTER', beforeDeathKeys(loadDir(args[0])));
  const go1 = verdictFor(b1, a1, 'BAND1');
  let goPooled = go1;
  if (args.length === 4) {
    const b2 = summarize(loadDir(args[2]), 'BEFORE2', null);
    const a2 = summarize(loadDir(args[3]), 'AFTER2', beforeDeathKeys(loadDir(args[2])));
    verdictFor(b2, a2, 'BAND2');
    const merge = (x, y) => ({ perSeed: Object.assign({}, x.perSeed, y.perSeed),
      totRefused: x.totRefused + y.totRefused, totNoMove: x.totNoMove + y.totNoMove,
      totHopClear: x.totHopClear + y.totHopClear, totOutReach: x.totOutReach + y.totOutReach,
      totStandingDays: x.totStandingDays + y.totStandingDays, totStandingDetours: x.totStandingDetours + y.totStandingDetours,
      totStarv: x.totStarv + y.totStarv, totStarvPlayer: x.totStarvPlayer + y.totStarvPlayer,
      totCausal: x.totCausal + y.totCausal, totCausalPlayer: x.totCausalPlayer + y.totCausalPlayer, totG2: x.totG2 + y.totG2 });
    goPooled = verdictFor(merge(b1, b2), merge(a1, a2), 'POOLED');
    console.log(`\nFINAL: band1=${go1 ? 'GO' : 'NO-GO'} pooled=${goPooled ? 'GO' : 'NO-GO'}`);
  }
  console.log(goPooled ? 'VERDICT-GO' : 'VERDICT-NO-GO');
  process.exit(goPooled ? 0 : 1);
}

const args = process.argv.slice(2);
if (args.length === 0) { proofMode().catch((e) => { console.error('FATAL', e && (e.stack || e.message)); process.exit(1); }); }
else if (args.length === 2 || args.length === 4) { verdictMode(args); }
else { console.error('usage: test-standinghome-retry-b.js [<before-dir> <after-dir> [<before-dir2> <after-dir2>]]'); process.exit(2); }
