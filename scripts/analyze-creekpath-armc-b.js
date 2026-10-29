#!/usr/bin/env node
// analyze-creekpath-armc-b.js — Arm C before/after comparison over
// creekpath-trace-b corpora (prereg:
// evidence/2026-10-29/sim-creekpath-armc-b-prereg.md).
// Usage: node scripts/analyze-creekpath-armc-b.js <before-dir> <after-dir>
//        [<before-dir2> <after-dir2>]
// With 4 dirs: band 1 = pilot, band 2 = confirm, plus a pooled verdict.
// Prints per-seed rows, the per-seed strand-length table, pooled stranded
// evenings, the no-move co-primary breakout, hop-clear/out-of-reach
// secondary counts, the standing-step census, guard metrics (G1
// starvation deaths, G2 counterfactual player deaths on/after detour or
// standing days), and the verdict: primary bar (after <= floor(before/2))
// AND no-move bar AND strand guard AND G1 AND G2.
// Writes nothing (stdout only; caller redirects).
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length !== 2 && args.length !== 4) { console.error('usage: analyze-creekpath-armc-b.js <before-dir> <after-dir> [<before-dir2> <after-dir2>]'); process.exit(2); }

function loadDir(d) {
  const recs = [];
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json')).sort()) {
    try { recs.push(JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'))); }
    catch (e) { console.error('skip unreadable', f, String(e.message).slice(0, 100)); }
  }
  return recs.sort((a, b) => a.seed - b.seed);
}

function strandsOf(evs) {
  const strands = [];
  let cur = null;
  for (const e of evs) {
    if (e.probe === 'refused') {
      if (!cur) cur = { start: e.loopDay, gameDay: e.gameDay, length: 0, tile: e.tile + ' (' + e.mapPx + ',' + e.mapPy + ')', block: e.block.blockType + '@' + e.block.x + ',' + e.block.y + '/' + e.block.leg };
      cur.length++;
    } else if (cur) { strands.push(cur); cur = null; }
  }
  if (cur) strands.push(cur);
  return strands;
}

// G2 counterfactual: before-leg player deaths keyed seed -> "day|cause".
function beforeDeathKeys(recs) {
  const m = {};
  for (const r of recs) {
    const s = new Set();
    for (const d of (r.deaths || [])) {
      if (d.player) s.add(d.day + '|' + (d.cause || d.kind));
    }
    m[r.seed] = s;
  }
  return m;
}

function summarize(recs, label, bDeathKeys) {
  console.log(`\n===== ${label} =====`);
  let totRefused = 0, totNoMove = 0, totHopClear = 0, totOutReach = 0;
  let totStandingDays = 0, totStandingDetours = 0, totStarv = 0, totStarvPlayer = 0;
  const perSeed = {};
  const survivals = [];
  for (const r of recs) {
    const evs = r.evenings || [];
    const refused = evs.filter((e) => e.probe === 'refused');
    const noMove = refused.filter((e) => e.movedDuringDay === false);
    const hopClear = evs.filter((e) => e.probe === 'hop-clear');
    const outReach = evs.filter((e) => e.probe === 'out-of-reach');
    const detourDays = new Set(evs.filter((e) => (e.tripHomeDetours || 0) > 0 || (e.standingHomeDetours || 0) > 0).map((e) => e.gameDay));
    const standingDays = evs.filter((e) => (e.standingHomeDays || 0) > 0);
    const standingDetours = evs.reduce((t, e) => t + ((e.standingHomeDetours || 0)), 0);
    const starv = (r.deaths || []).filter((d) => /starv|hunger/i.test(JSON.stringify(d)));
    const starvPlayer = starv.filter((d) => d.player);
    // G2 counterfactual: player death on/after a detour-or-standing day
    // that does NOT also occur in the before leg same day same cause.
    const g2hits = [];
    if (bDeathKeys) {
      const keys = bDeathKeys[r.seed] || new Set();
      for (const d of (r.deaths || [])) {
        if (!d.player) continue;
        if (!(detourDays.has(d.day) || detourDays.has(d.day - 1))) continue;
        if (keys.has(d.day + '|' + (d.cause || d.kind))) continue;
        g2hits.push(d.day + ':' + (d.cause || d.kind));
      }
    }
    const strands = strandsOf(evs);
    const longest = strands.reduce((m, s) => Math.max(m, s.length), 0);
    perSeed[r.seed] = { refused: refused.length, noMove: noMove.length, hopClear: hopClear.length, outReach: outReach.length, longest, strands, detourDays: detourDays.size, standingDays: standingDays.length, standingDetours, starv: starv.length, starvPlayer: starvPlayer.length, g2hits };
    totRefused += refused.length; totNoMove += noMove.length; totHopClear += hopClear.length; totOutReach += outReach.length;
    totStandingDays += standingDays.length; totStandingDetours += standingDetours;
    totStarv += starv.length; totStarvPlayer += starvPlayer.length;
    survivals.push(r.daysAlive);
    const probes = {};
    for (const e of evs) probes[e.probe] = (probes[e.probe] || 0) + 1;
    console.log(`seed ${r.seed}: days=${r.daysAlive} end=${r.endReason} wave=${r.maxWaveUnlocked} deaths=${(r.deaths || []).length} starv=${starv.length} (player ${starvPlayer.length}) probes=${JSON.stringify(probes)} refused=${refused.length} noMove=${noMove.length} hopClear=${hopClear.length} outReach=${outReach.length} standingDays=${standingDays.length} standingDetours=${standingDetours} longestStrand=${longest} g2=${JSON.stringify(g2hits)}`);
    for (const s of strands) console.log(`    strand seed ${r.seed}: startDay=${s.start} len=${s.length} at=${s.tile} block=${s.block}`);
  }
  survivals.sort((a, b) => a - b);
  const med = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
  console.log(`POOLED ${label}: seeds=${recs.length} refused=${totRefused} noMove=${totNoMove} exclNoMove=${totRefused - totNoMove} hopClear=${totHopClear} outReach=${totOutReach} standingDays=${totStandingDays} standingDetours=${totStandingDetours} starvDeaths=${totStarv} (player ${totStarvPlayer}) medianSurvival=${med}`);
  return { perSeed, totRefused, totNoMove, totHopClear, totOutReach, totStandingDays, totStandingDetours, totStarv, totStarvPlayer };
}

function verdictFor(before, after, label) {
  const bar = Math.floor(before.totRefused / 2);
  const noMoveBar = Math.floor(before.totNoMove / 2);
  const primaryOk = after.totRefused <= bar;
  const noMoveOk = after.totNoMove <= noMoveBar;
  const g1Ok = after.totStarv <= before.totStarv;
  let guardOk = true;
  for (const seed of Object.keys(before.perSeed)) {
    const b = before.perSeed[seed], a = after.perSeed[seed];
    if (!a) { console.log(`strand guard ${label} seed ${seed}: MISSING in after leg`); guardOk = false; continue; }
    const ok = a.longest <= b.longest || a.refused < b.refused;
    if (!ok) guardOk = false;
    console.log(`strand guard ${label} seed ${seed}: before longest=${b.longest} count=${b.refused} -> after longest=${a.longest} count=${a.refused}: ${ok ? 'OK' : 'VIOLATION (longest grew, count did not fall)'}`);
  }
  const g2total = Object.values(after.perSeed).reduce((t, s) => t + s.g2hits.length, 0);
  console.log(`\n===== VERDICT ${label} vs PREREG =====`);
  console.log(`primary: before=${before.totRefused} after=${after.totRefused} bar=after<=${bar}: ${primaryOk ? 'PASS' : 'FAIL'}`);
  console.log(`no-move co-primary: before=${before.totNoMove} after=${after.totNoMove} bar=after<=${noMoveBar}: ${noMoveOk ? 'PASS' : 'FAIL'}`);
  console.log(`sensitivity (excl no-move days): before=${before.totRefused - before.totNoMove} after=${after.totRefused - after.totNoMove} (reported, not judged)`);
  console.log(`hop-clear away (secondary): before=${before.totHopClear} after=${after.totHopClear}`);
  console.log(`out-of-reach away (secondary): before=${before.totOutReach} after=${after.totOutReach}`);
  console.log(`G1 starvation deaths: before=${before.totStarv} (player ${before.totStarvPlayer}) after=${after.totStarv} (player ${after.totStarvPlayer}): ${g1Ok ? 'HOLD' : 'VIOLATION'}`);
  console.log(`G2 counterfactual player deaths on/after detour-or-standing days (after leg): ${g2total}: ${g2total === 0 ? 'HOLD' : 'VIOLATION'}`);
  console.log(`G3 perception-lawful: by construction (own tile, home haven, engine-offered adjacent steps only) — see evidence file`);
  const go = primaryOk && noMoveOk && guardOk && g1Ok && g2total === 0;
  console.log(`\nOVERALL ${label} (primary + no-move + strand guard + G1 + G2): ${go ? 'GO' : 'NO-GO'}`);
  return go;
}

const before1 = summarize(loadDir(args[0]), 'BEFORE', null);
const after1 = summarize(loadDir(args[1]), 'AFTER', beforeDeathKeys(loadDir(args[0])));
let go1 = verdictFor(before1, after1, 'BAND1');
let goPooled = go1;
if (args.length === 4) {
  const before2 = summarize(loadDir(args[2]), 'BEFORE2', null);
  const after2 = summarize(loadDir(args[3]), 'AFTER2', beforeDeathKeys(loadDir(args[2])));
  verdictFor(before2, after2, 'BAND2');
  // pooled: merge per-seed maps and totals
  const merge = (a, b) => ({
    perSeed: Object.assign({}, a.perSeed, b.perSeed),
    totRefused: a.totRefused + b.totRefused, totNoMove: a.totNoMove + b.totNoMove,
    totHopClear: a.totHopClear + b.totHopClear, totOutReach: a.totOutReach + b.totOutReach,
    totStandingDays: a.totStandingDays + b.totStandingDays, totStandingDetours: a.totStandingDetours + b.totStandingDetours,
    totStarv: a.totStarv + b.totStarv, totStarvPlayer: a.totStarvPlayer + b.totStarvPlayer,
  });
  goPooled = verdictFor(merge(before1, before2), merge(after1, after2), 'POOLED');
  console.log(`\nFINAL: band1=${go1 ? 'GO' : 'NO-GO'} pooled=${goPooled ? 'GO' : 'NO-GO'}`);
}
