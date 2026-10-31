#!/usr/bin/env node
// stickfiber-events-20261031.js — production-event census for
// sim-stickfiber-b. Reads perseed-stickfiber-b JSONs and reports:
// daily pile increases in stick/fiber, pocket-call pile increases in
// stick/fiber, producer-counter deltas (scholar addMaterial,
// donateMaterial, inviteReward bundle, scholar craft), and the
// end-of-run pile. Writes NOTHING; prints a JSON summary.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const ARM = process.env.ARM || 'baseline';
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-stickfiber-b', ARM);
const seedsArg = process.argv.slice(2).map(s => parseInt(s, 10)).filter(Number.isFinite);
const files = fs.readdirSync(EVID).filter(f => /^s\d+\.json$/.test(f)).sort();
const seeds = files.map(f => parseInt(f.slice(1, -5), 10)).filter(s => !seedsArg.length || seedsArg.includes(s));
const out = { seeds, dailyIncreases: [], pocketIncreases: [], producerTotals: {}, producerEvents: [], scholarPackIncreases: [], scholarPackTotals: {}, finalPiles: [], errors: 0, wrapMissing: [] };
for (const seed of seeds) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}.json`), 'utf8'));
  out.errors += (d.instrumentErrors || []).length + (d.supplyErrors || []).length + (d.stickfiberErrors || []).length;
  for (const e of (d.stickfiberErrors || [])) if (String(e).startsWith('wrap-missing:')) out.wrapMissing.push(seed + ':' + e);
  let prev = null;
  for (const row of (d.supplyDaily || [])) {
    const pile = row.pile;
    if (!pile) { prev = null; continue; }
    if (prev) for (const m of ['stick', 'fiber']) {
      const delta = (pile[m] || 0) - (prev[m] || 0);
      if (delta > 0) out.dailyIncreases.push({ seed, day: row.day, material: m, delta, from: prev[m] || 0, to: pile[m] || 0 });
    }
    prev = pile;
  }
  for (const pc of (d.supplyPocketCalls || [])) {
    if (!pc.prePile || !pc.postPile) continue;
    for (const m of ['stick', 'fiber']) {
      const delta = (pc.postPile[m] || 0) - (pc.prePile[m] || 0);
      if (delta > 0) out.pocketIncreases.push({ seed, day: pc.day, vid: pc.vid, material: m, delta });
    }
  }
  let prevC = null;
  for (const row of (d.stickfiberRows || [])) {
    if (prevC) for (const k of ['addStick', 'addFiber', 'donateStick', 'donateFiber', 'inviteBundle', 'craftArrow', 'craftBolt']) {
      const delta = (row[k] || 0) - (prevC[k] || 0);
      if (delta > 0) { out.producerEvents.push({ seed, day: row.day, counter: k, delta }); out.producerTotals[k] = (out.producerTotals[k] || 0) + delta; }
    }
    // Scholar-pack series (direct inventory pushes bypass addMaterial).
    if (prevC && row.scholarStick !== null && row.scholarStick !== undefined && prevC.scholarStick !== null && prevC.scholarStick !== undefined) {
      const ds = row.scholarStick - prevC.scholarStick;
      const df = row.scholarFiber - prevC.scholarFiber;
      if (ds > 0) { out.scholarPackIncreases.push({ seed, day: row.day, material: 'stick', delta: ds }); out.scholarPackTotals.stick = (out.scholarPackTotals.stick || 0) + ds; }
      if (df > 0) { out.scholarPackIncreases.push({ seed, day: row.day, material: 'fiber', delta: df }); out.scholarPackTotals.fiber = (out.scholarPackTotals.fiber || 0) + df; }
    }
    prevC = row;
  }
  const end = d.supplyEnd || {};
  out.finalPiles.push({ seed, pile: end.finalPile || null });
}
console.log(JSON.stringify(out, null, 1));
