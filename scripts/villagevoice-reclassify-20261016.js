// scripts/villagevoice-reclassify-20261016.js — re-run beat classification on
// every evidence/2026-10-16/villagevoice-beats/*.json with the FINAL
// classifier (villagevoice-lib-20261016.js). The sweep classifies per-run at
// write time; classifier improvements made mid-sweep must apply to ALL runs
// for the distribution to be comparable. This pass rewrites b.c/b.base and
// the distribution/villagerBeats/sensed/unattributed fields in place.
// Also rewrites the aggregate line into each per-seed JSON's beatCount/
// villagerBeats/sensed keys (perseed-villagevoice/*.json).
'use strict';
const fs = require('fs');
const path = require('path');
const { classify, SENSE_CATS } = require('./villagevoice-lib-20261016');

const BEATS_DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'villagevoice-beats');
const PERSEED_DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-villagevoice');

function namesOf(d) {
  const names = [];
  const add = (n) => { if (n && !names.includes(n)) names.push(n); };
  for (const s of [d.rosterStart, d.rosterEnd, ...(d.snaps || []).map((x) => x.roster)]) {
    for (const p of (s || [])) {
      if (p.name) { add(p.name); add(p.name.split(' ')[0]); }
    }
  }
  for (const e of (d.events || [])) if (e.who) add(e.who);
  return names;
}

let totalVill = 0, totalSensed = 0, totalBeats = 0, totalUnattr = 0;
const files = fs.readdirSync(BEATS_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('SMOKE'));
for (const f of files) {
  const fp = path.join(BEATS_DIR, f);
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const names = namesOf(d);
  const deathDay = {};
  for (const e of (d.events || [])) if (e.type === 'death' && e.who) deathDay[e.who] = Math.min(deathDay[e.who] ?? 1e9, e.d);
  const seen = new Map();
  const dist = {};
  let vill = 0, sensed = 0, unattr = 0;
  for (const b of d.beats) {
    const c = classify(b.t, { names, seen, deathDay, beatDay: b.d });
    b.c = c.cat;
    if (c.base) b.base = c.base; else delete b.base;
    if (!c.cat) { unattr++; continue; }
    dist[c.cat] = (dist[c.cat] || 0) + 1;
    if (c.villagerBeat) { vill++; if (SENSE_CATS.includes(c.cat)) sensed++; }
  }
  d.distribution = dist;
  d.villagerBeats = vill;
  d.sensed = sensed;
  d.unattributed = unattr;
  fs.writeFileSync(fp, JSON.stringify(d));
  totalVill += vill; totalSensed += sensed; totalBeats += d.beats.length; totalUnattr += unattr;
  // mirror the voice keys into the per-seed JSON
  const psf = path.join(PERSEED_DIR, f);
  if (fs.existsSync(psf)) {
    const ps = JSON.parse(fs.readFileSync(psf, 'utf8'));
    ps.villagerBeats = vill;
    ps.sensed = sensed;
    fs.writeFileSync(psf, JSON.stringify(ps, null, 1));
  }
  console.log(`  ${f}: beats=${d.beats.length} vill=${vill} sensed=${sensed} unattr=${unattr}`);
}
console.log(`\naggregate: beats=${totalBeats} villagerBeats=${totalVill} sensed=${totalSensed} share=${totalVill ? (100 * totalSensed / totalVill).toFixed(1) : 0}% unattributed=${totalUnattr}`);
