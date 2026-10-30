#!/usr/bin/env node
// bladequota-verify-generated.js — checks the faces=0 mechanism on a
// re-run of one leadcourt seed (default 76102).
// Re-runs the seed with the same policy/base and records, per link per
// day, the other village's `generated` flag and roster size alongside the
// snapshot's free-face count. Then asserts trajectory identity against
// the leg corpus (peak allied + final allied must match exactly); only
// if they match are the generated/roster readings quotable as readings
// of the same trajectory.
// Usage: node scripts/bladequota-verify-generated.js [seed] [corpusJson]
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { bladeQuotaSnapshot } = require('./bladequota-snapshot');

async function main() {
  const seed = Number(process.argv[2] || 76102);
  const corpusPath = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'perseed-bladequota-a-leadcourt', 's' + seed + '.json');
  const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
  const { Game, loadFails } = await loadGame({ seed: seed, mode: 'bladequota-verify' });
  if (loadFails && loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(Game, 'Columbus, Ohio');
  const rows = [];
  let peak = -1, peakDay = null, finalSnap = null;
  const wrapped = Object.assign({}, leadcourt, {
    id: 'leadcourt',
    daily: function (G, ctx) {
      try { if (typeof leadcourt.daily === 'function') leadcourt.daily(G, ctx); } catch (e) {}
      try {
        const snap = bladeQuotaSnapshot(G, 'herald');
        const day = ((G.state || {}).scholar || {}).day || 0;
        if (snap.alliedYield > peak) { peak = snap.alliedYield; peakDay = day; }
        finalSnap = snap;
        snap.links.forEach(function (l) {
          let ov = null;
          try { ov = G._otherVillage ? G._otherVillage(l.villageId) : null; } catch (e) {}
          rows.push({ day: day, village: l.name, villageId: l.villageId,
            trust: l.trust, quota: l.quota, freeFaces: l.freeFaces, yielded: l.yielded,
            generated: ov ? !!ov.generated : null,
            rosterSize: ov && ov.roster ? ov.roster.length : (ov ? 0 : null),
            rosterAliveAdults: ov && ov.roster ? ov.roster.filter(function (r) { return r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0); }).length : null });
        });
      } catch (e) {}
    },
  });
  await runDays(Game, wrapped, { days: 200 });
  const finalAllied = finalSnap ? finalSnap.alliedYield : null;
  const identical = peak === corpus.peak.alliedYield && peakDay === corpus.peak.day && finalAllied === corpus.final.alliedYield;
  console.log('trajectory identical: ' + identical +
    ' (peak ' + peak + '@' + peakDay + ' vs corpus ' + corpus.peak.alliedYield + '@' + corpus.peak.day +
    '; final ' + finalAllied + ' vs corpus ' + corpus.final.alliedYield + ')');
  // Summarize: for each village, faces=0 days split by generated flag.
  const byVillage = {};
  rows.forEach(function (r) {
    const b = byVillage[r.village] = byVillage[r.village] || { days: 0, faces0: 0, faces0Ungenerated: 0, facesPos: 0, everGenerated: false, maxFaces: 0 };
    b.days++;
    if (r.generated) b.everGenerated = true;
    if (r.freeFaces === 0) { b.faces0++; if (!r.generated) b.faces0Ungenerated++; }
    else b.facesPos++;
    if (r.freeFaces > b.maxFaces) b.maxFaces = r.freeFaces;
  });
  console.log(JSON.stringify(byVillage, null, 2));
  const sample = rows.filter(function (r) { return r.day === peakDay; });
  console.log('peak-day rows: ' + JSON.stringify(sample, null, 2));
  if (!identical) { console.error('TRAJECTORY MISMATCH — generated readings NOT quotable'); process.exit(1); }
  console.log('PASS: trajectory identical; generated/roster readings are readings of the corpus trajectory');
}

main().catch(function (e) { console.error('bladequota-verify-generated FAILED: ' + (e && e.stack || e)); process.exit(1); });
