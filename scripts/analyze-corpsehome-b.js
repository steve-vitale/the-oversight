#!/usr/bin/env node
// analyze-corpsehome-b.js — search-leg census for sim-corpsehome-b.
// Reads per-seed corpus JSON files (split-corpsehome-b.js output) and
// prints a JSON summary to stdout: per seed, the bearer id/name
// sequence, every bearer change (loop-day, old -> new, death-day
// candidate), every dead-bearer corpse (villagerId == a former bearer)
// with its node readings across snapshots, and every corpse node move
// on any segment. READ-ONLY: never loads the game, never writes.
// Usage: node scripts/analyze-corpsehome-b.js <corpus-dir>
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: analyze-corpsehome-b.js <corpus-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const out = { seeds: [], bearerDeaths: [], corpseMoves: [] };
for (const f of files) {
  const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  // Snapshot stream: interleave mornings (loopDay) and evenings in
  // loop-day order. Mornings array is indexed by loopDay (callIdx>1),
  // evenings by loopDay. Build a single timeline: for each loopDay,
  // morning then evening.
  const byDay = {};
  for (const m of inst.mornings || []) {
    (byDay[m.loopDay] = byDay[m.loopDay] || {}).morning = m;
  }
  for (const e of inst.evenings || []) {
    (byDay[e.loopDay] = byDay[e.loopDay] || {}).evening = e;
  }
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);
  const timeline = [];
  for (const d of days) {
    if (byDay[d].morning) timeline.push({ seg: 'morning ' + d, row: byDay[d].morning });
    if (byDay[d].evening) timeline.push({ seg: 'evening ' + d, row: byDay[d].evening });
  }
  const bearerSeq = [];
  let prevBearer = null;
  const changes = [];
  for (const t of timeline) {
    const inv = t.row.morningInv || t.row.eveningInv || null;
    const id = inv ? inv.scholarId : null;
    const name = inv ? inv.scholarName : null;
    bearerSeq.push({ seg: t.seg, id, name });
    if (prevBearer && id && prevBearer.id !== id) {
      changes.push({ seg: t.seg, from: prevBearer, to: { id, name } });
    }
    if (id) prevBearer = { id, name };
  }
  // Corpse node track per corpse id across the timeline.
  const tracks = {};
  for (const t of timeline) {
    const corpses = Array.isArray(t.row.corpses) ? t.row.corpses : [];
    for (const c of corpses) {
      (tracks[c.id] = tracks[c.id] || []).push({
        seg: t.seg, villagerId: c.villagerId || null, corpseName: c.name || null,
        bearerId: (t.row.morningInv || t.row.eveningInv || {}).scholarId || null,
        bearerName: (t.row.morningInv || t.row.eveningInv || {}).scholarName || null,
        node: c.node, mx: c.mx, my: c.my,
        items: (c.items || []).map((i) => i.id + 'x' + i.units),
        looted: c.looted, recovered: c.recovered, deathKnown: c.deathKnown,
        dayDied: c.dayDied, cause: c.cause,
        pending: t.row.pendingBurials || [],
      });
    }
  }
  const moves = [];
  const deadBearerCorpses = [];
  for (const [cid, track] of Object.entries(tracks)) {
    for (let i = 1; i < track.length; i++) {
      const a = track[i - 1], b = track[i];
      const an = a.node ? a.node.x + ',' + a.node.y : null;
      const bn = b.node ? b.node.x + ',' + b.node.y : null;
      if (an !== bn || a.mx !== b.mx || a.my !== b.my) {
        moves.push({ seed: inst.seed, corpseId: cid, from: a, to: b });
      }
    }
    const first = track[0];
    const wasBearer = bearerSeq.some((s) => s.id && first && first.villagerId === s.id) ||
      changes.some((ch) => ch.from.id === first.villagerId);
    if (wasBearer) deadBearerCorpses.push({ seed: inst.seed, corpseId: cid, villagerId: first.villagerId, track });
  }
  out.seeds.push({ seed: inst.seed, evenings: (inst.evenings || []).length, mornings: (inst.mornings || []).length, endReason: inst.endReason, bearerChanges: changes, deadBearerCorpses: deadBearerCorpses.map((d) => ({ corpseId: d.corpseId, villagerId: d.villagerId, firstNode: d.track[0].node, lastNode: d.track[d.track.length - 1].node, snaps: d.track.length })) });
  for (const ch of changes) out.bearerDeaths.push({ seed: inst.seed, ...ch });
  for (const m of moves) out.corpseMoves.push(m);
}
console.log(JSON.stringify(out, null, 2));
