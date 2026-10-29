#!/usr/bin/env node
// analyze-creekpath-armb-b.js — Arm B before/after comparison over
// creekpath-trace-b corpora (prereg:
// evidence/2026-10-28/sim-creekpath-armb-b-prereg.md).
// Usage: node scripts/analyze-creekpath-armb-b.js <before-dir> <after-dir>
// Prints per-seed rows, the per-seed strand-length table (consecutive
// refused evenings, with tile + block), pooled stranded evenings, the
// no-move breakout (refused evenings where the player never left the tile
// that day), the excluding-no-move sensitivity line, guard metrics (G1
// starvation deaths, G2 player deaths on/after detour days), and the
// verdict: primary bar (after <= 50% of before) AND the strand guard (no
// seed's longest strand grows unless its refused count fell).
// Writes nothing (stdout only; caller redirects).
'use strict';
const fs = require('fs');
const path = require('path');

const [beforeDir, afterDir] = process.argv.slice(2);
if (!beforeDir || !afterDir) { console.error('usage: analyze-creekpath-armb-b.js <before-dir> <after-dir>'); process.exit(2); }

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

function summarize(recs, label) {
  console.log(`\n===== ${label} =====`);
  let totRefused = 0, totNoMove = 0, totDetourDays = 0, totStarv = 0, totStarvPlayer = 0;
  const perSeed = {};
  const survivals = [];
  for (const r of recs) {
    const evs = r.evenings || [];
    const refused = evs.filter((e) => e.probe === 'refused');
    const noMove = refused.filter((e) => e.movedDuringDay === false);
    const detourDays = new Set(evs.filter((e) => (e.tripHomeDetours || 0) > 0).map((e) => e.gameDay));
    const starv = (r.deaths || []).filter((d) => /starv|hunger/i.test(JSON.stringify(d)));
    const starvPlayer = starv.filter((d) => d.player);
    const g2hits = (r.deaths || []).filter((d) => d.player && (detourDays.has(d.day) || detourDays.has(d.day - 1)));
    const strands = strandsOf(evs);
    const longest = strands.reduce((m, s) => Math.max(m, s.length), 0);
    perSeed[r.seed] = { refused: refused.length, noMove: noMove.length, longest, strands, detourDays: detourDays.size, starv: starv.length, starvPlayer: starvPlayer.length, g2hits: g2hits.map((d) => d.day + ':' + (d.cause || d.kind)) };
    totRefused += refused.length; totNoMove += noMove.length; totDetourDays += detourDays.size;
    totStarv += starv.length; totStarvPlayer += starvPlayer.length;
    survivals.push(r.daysAlive);
    const probes = {};
    for (const e of evs) probes[e.probe] = (probes[e.probe] || 0) + 1;
    console.log(`seed ${r.seed}: days=${r.daysAlive} end=${r.endReason} wave=${r.maxWaveUnlocked} deaths=${(r.deaths || []).length} starv=${starv.length} (player ${starvPlayer.length}) probes=${JSON.stringify(probes)} refused=${refused.length} noMove=${noMove.length} detourDays=${detourDays.size} longestStrand=${longest} g2=${JSON.stringify(perSeed[r.seed].g2hits)}`);
    for (const s of strands) console.log(`    strand seed ${r.seed}: startDay=${s.start} len=${s.length} at=${s.tile} block=${s.block}`);
  }
  survivals.sort((a, b) => a - b);
  const med = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
  console.log(`POOLED ${label}: seeds=${recs.length} refused=${totRefused} noMove=${totNoMove} exclNoMove=${totRefused - totNoMove} detourDays=${totDetourDays} starvDeaths=${totStarv} (player ${totStarvPlayer}) medianSurvival=${med}`);
  return { perSeed, totRefused, totNoMove, totStarv, totStarvPlayer };
}

const before = summarize(loadDir(beforeDir), 'BEFORE');
const after = summarize(loadDir(afterDir), 'AFTER');
const bar = Math.floor(before.totRefused / 2);
console.log('\n===== VERDICT vs PREREG =====');
console.log(`primary: before=${before.totRefused} after=${after.totRefused} bar=after<=${bar} (50% of before): ${after.totRefused <= bar ? 'PASS' : 'FAIL'}`);
console.log(`sensitivity (excl no-move days): before=${before.totRefused - before.totNoMove} after=${after.totRefused - after.totNoMove} (reported, not judged)`);
console.log(`G1 starvation deaths: before=${before.totStarv} (player ${before.totStarvPlayer}) after=${after.totStarv} (player ${after.totStarvPlayer}): ${after.totStarv <= before.totStarv ? 'HOLD' : 'VIOLATION'}`);
let guardOk = true;
for (const seed of Object.keys(before.perSeed)) {
  const b = before.perSeed[seed], a = after.perSeed[seed];
  if (!a) { console.log(`strand guard seed ${seed}: MISSING in after leg`); guardOk = false; continue; }
  const ok = a.longest <= b.longest || a.refused < b.refused;
  if (!ok) guardOk = false;
  console.log(`strand guard seed ${seed}: before longest=${b.longest} count=${b.refused} -> after longest=${a.longest} count=${a.refused}: ${ok ? 'OK' : 'VIOLATION (longest grew, count did not fall)'}`);
}
const g2total = Object.values(after.perSeed).reduce((t, s) => t + s.g2hits.length, 0);
console.log(`G2 player deaths on/after detour days (after leg): ${g2total}: ${g2total === 0 ? 'HOLD' : 'VIOLATION'}`);
console.log(`G3 perception-lawful: by construction (own tile, home haven, engine-offered adjacent steps only) — see evidence file`);
const go = after.totRefused <= bar && guardOk && after.totStarv <= before.totStarv && g2total === 0;
console.log(`\nOVERALL (primary + strand guard + G1 + G2): ${go ? 'GO' : 'NO-GO'}`);
