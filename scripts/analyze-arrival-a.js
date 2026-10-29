#!/usr/bin/env node
// scripts/analyze-arrival-a.js — gaps-grudge EMPTY-TILE ARRIVAL diag:
// read-only re-analysis of the sim-funnel-a corpus
// (evidence/2026-10-29/perseed-funnel-a/s751*.json, on master).
// No game code, no new sim, no judged run. Answers, per HUNT
// departure in the band:
//   (a) departure -> first true drop lag (parts and days), i.e. how
//       long the walk to the remembered tile took;
//   (b) departures with NO true drop (arrived to the beast still
//       there, OR never reached the tile inside the trip clock);
//   (c) linger after a true drop: false drop calls for the same
//       villager + tile before the next departure (the arrival block
//       re-fires each part the hunter stands on the tile);
//   (d) pick -> departure lag for HUNT picks (funnel pick records
//       joined to the first departure at/after the pick part);
//   (e) meetings that followed a no-drop departure (a present
//       arrival converting to a fight, or not).
// NEED STATE IS NOT IN THIS CORPUS: funnel pick records carry gates
// (armed/sheltered/postFleeResting/maxD) but no hunger, energy,
// fear, pantry, or waterDays — the grudge-audit recorder gap. Any
// need-at-arrival number must come from a fixture (see
// scripts/test-arrival-a.js), never from this corpus.
// Usage: node scripts/analyze-arrival-a.js [--dir <corpus dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dirIdx = process.argv.indexOf('--dir');
const DIR = dirIdx >= 0 && process.argv[dirIdx + 1]
  ? process.argv[dirIdx + 1]
  : path.join(REPO, 'evidence', '2026-10-29', 'perseed-funnel-a');

function main() {
  const files = fs.readdirSync(DIR).filter(f => /^s\d+-fresh\.json$/.test(f)).sort();
  if (!files.length) { console.log('ARRIVAL-ANALYSIS FAIL: no corpus rows in ' + DIR); process.exit(1); }
  let nHuntDep = 0, nDrop = 0, nNoDrop = 0, nDistinctTrueDrops = 0, nUnmatchedTrueDrops = 0;
  const walkParts = [], pickDepParts = [], lingerCalls = [];
  let meetingsSoonAfterNoDrop = 0, meetingsLaterAfterNoDrop = 0;
  const soonMeetingsDetail = [];
  let waveById = {};
  try { const mons = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8')); for (const m of mons) if (m && m.id) waveById[m.id] = m.wave || 1; } catch (e) { waveById = {}; }
  let nHuntPicks = 0, nPicksJoined = 0;
  for (const f of files) {
    const row = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const ret = row.returns || {};
    const deps = (ret.departures || []).filter(d => d && d.objective && d.objective.kind === 'HUNT');
    const drops = ret.drops || [];
    const meetings = ret.meetings || [];
    const picks = ((row.funnel || {}).picks || []).filter(p => p && p.chosen && p.chosen.kind === 'HUNT');
    nHuntDep += deps.length;
    nHuntPicks += picks.length;
    // Each true drop record is CONSUMED by at most one departure: without
    // this, two departures to the same tile (an early one that never
    // arrived plus a later one that did) both match the later drop and
    // the join count exceeds the distinct true-drop count (297 band-wide
    // per returns-a). Departures in part order; drops in part order.
    const trueDrops = drops.filter(d => d && d.dropped === true)
      .sort((a, b) => (a.part - b.part) || (a.day - b.day));
    nDistinctTrueDrops += trueDrops.length;
    const usedDrop = new Set();
    const depsSorted = deps.slice().sort((a, b) => a.part - b.part);
    for (const dep of depsSorted) {
      const o = dep.objective;
      // First UNCONSUMED true drop for this villager at this tile
      // at/after departure (part counter is monotonic across the run).
      let drop = null;
      for (let i = 0; i < trueDrops.length; i++) {
        const d = trueDrops[i];
        if (usedDrop.has(i)) continue;
        if (d.vid === dep.vid && d.tx === o.huntTx && d.ty === o.huntTy && d.part >= dep.part) { drop = d; usedDrop.add(i); break; }
      }
      if (drop) {
        nDrop++;
        walkParts.push(drop.part - dep.part);
        lingerCalls.push(drops.filter(d => d && d.vid === dep.vid && d.tx === o.huntTx && d.ty === o.huntTy
          && d.dropped === false && d.part > drop.part && d.part < drop.part + 40).length);
      } else {
        nNoDrop++;
        // A meeting within 10 parts of a no-drop departure is plausibly
        // the present-arrival fight; anything later is a new accident,
        // NOT attributed to this arrival.
        const soon = meetings.find(m => m && m.vid === dep.vid && m.mid === o.huntMid
          && (m.part || 0) >= dep.part && (m.part || 0) <= dep.part + 10);
        if (soon) { meetingsSoonAfterNoDrop++; soonMeetingsDetail.push({ seed: row.seed, vid: dep.vid, mid: o.huntMid, wave: waveById[o.huntMid] || null, depPart: dep.part, meetPart: soon.part || null }); }
        else if (meetings.find(m => m && m.vid === dep.vid && m.mid === o.huntMid && (m.part || 0) > dep.part + 10)) meetingsLaterAfterNoDrop++;
      }
    }
    for (const pick of picks) {
      const dep = deps.find(d => d && d.vid === pick.vid && d.part >= pick.part
        && d.objective && d.objective.huntTx === pick.chosen.huntTx && d.objective.huntTy === pick.chosen.huntTy);
      if (dep) { nPicksJoined++; pickDepParts.push(dep.part - pick.part); }
    }
    // Unmatched true drops in this row: drops no departure consumed.
    // (A departure that never arrived can steal a later trip's drop in
    // the greedy join, so unmatched drops and long-lag matches are the
    // same misattribution seen from both sides — see evidence.)
    nUnmatchedTrueDrops += trueDrops.length - usedDrop.size;
  }
  const summarise = (arr) => {
    if (!arr.length) return 'n=0';
    const s = arr.slice().sort((a, b) => a - b);
    const sum = s.reduce((a, b) => a + b, 0);
    const med = s[Math.floor(s.length / 2)];
    return `n=${s.length} min=${s[0]} median=${med} mean=${(sum / s.length).toFixed(1)} max=${s[s.length - 1]}`;
  };
  const hist = (arr) => {
    const h = {};
    for (const x of arr) { const b = x <= 2 ? '0-2' : x <= 4 ? '3-4' : x <= 8 ? '5-8' : x <= 12 ? '9-12' : '13+'; h[b] = (h[b] || 0) + 1; }
    return JSON.stringify(h);
  };
  console.log(`corpus rows: ${files.length} (${files[0]}..${files[files.length - 1]})`);
  console.log(`HUNT departures (all waves): ${nHuntDep}`);
  console.log(`distinct true drops (empty-tile arrivals, returns-a headline): ${nDistinctTrueDrops} (${nHuntDep ? (100 * nDistinctTrueDrops / nHuntDep).toFixed(1) : 0}% of departures)`);
  console.log(`join-matched departures->drops (greedy, see misattribution note): ${nDrop}; unmatched true drops: ${nUnmatchedTrueDrops}; join no-drop departures: ${nNoDrop}`);
  console.log(`  NOTE: join counts are NOT the headline — the band headline stays 297/326 = 91.1% distinct true drops (returns-a). A trip's clock is 2*dist+3 parts, so walk lags >~13 parts cannot be one trip: they are cross-trip misattribution (an early departure that never arrived consuming a later trip's drop).`);
  console.log(`departure -> true-drop walk lag (parts; ~4 parts/day): ${summarise(walkParts)}`);
  console.log(`  walk-lag histogram (parts): ${hist(walkParts)}`);
  console.log(`linger after true drop (false drop calls on the tile, next 40 parts): ${summarise(lingerCalls)}`);
  console.log(`HUNT picks in funnel pick records (WAVE-4-memory-holder picks ONLY — see header): ${nHuntPicks}, joined to a departure: ${nPicksJoined}`);
  console.log(`pick -> departure lag, wave-4 picks only (parts): ${summarise(pickDepParts)}`);
  console.log(`  pick-departure-lag histogram (parts): ${hist(pickDepParts)}`);
  console.log(`meetings within 10 parts after a no-drop departure (plausible present-arrival fights): ${meetingsSoonAfterNoDrop} ${JSON.stringify(soonMeetingsDetail)}`);
  console.log(`no-drop departures whose next same-beast meeting is later than 10 parts (new accidents, not this arrival): ${meetingsLaterAfterNoDrop}`);
  console.log('ARRIVAL-ANALYSIS DONE — read-only corpus re-analysis; no game state touched');
}
main();
