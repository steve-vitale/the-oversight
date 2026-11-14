#!/usr/bin/env node
// Journey-establishment r138 panel scorer (read-only): scores the
// pre-registered bars from the per-seed JSONs. No game state is touched.
// Usage: node scripts/analyze-journey-establishment-r138-20261113.js <seed...>
//   EVID defaults to the goal hidden_files evidence dir for 2026-11-14.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-14';
const seeds = process.argv.slice(2).map(s => parseInt(s, 10));
if (!seeds.length) { console.error('usage: analyze-journey-establishment-r138-20261113.js <seed...>'); process.exit(2); }

function load(seed) {
  const p = path.join(EVID, `journey-establishment-r138-seed${seed}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
// A broken-live forage run, reconstructed per seed from the wedge logs:
// every travelOutLog entry whose pre-state was broken (or whose end
// record exists) is one run-opportunity, keyed by vid + break-cluster.
// R138 FIX (pilot): the r85 grouping keyed by vid only, so a villager
// with TWO broken runs in one seed (pilot Raul: d6 and d23) collapsed
// into one opportunity whose endDay was the LAST close — misread as a
// 2-dawn-window FAIL. An opportunity closes when its run ends; the
// next broken entry for the same vid opens a new one.
function opportunities(d) {
  const ops = [];
  const cur = new Map(); // vid -> currently open opportunity
  for (const t of (d.travelOutLog || [])) {
    if (t.kind !== 'forage_help') continue;
    const key = String(t.vid);
    const broken = (t.preRun && t.preRun.promiseKept === 'broken') || (t.end && t.end.preRun && t.end.preRun.promiseKept === 'broken') || t.outcome === 'ended' || t.outcome === 'end-via-deliver' || (t.outcome || '').startsWith('end-');
    if (!broken) continue;
    let op = cur.get(key);
    if (!op) { op = { vid: key, name: t.name, firstDay: t.day, outcomes: [], endDay: null }; ops.push(op); cur.set(key, op); }
    op.outcomes.push({ day: t.day, outcome: t.outcome });
    if (t.outcome === 'ended' || t.outcome === 'end-via-deliver') { op.endDay = t.day; cur.delete(key); }
  }
  return ops;
}
let allOps = 0, closedOps = 0, noOppSeeds = 0, trustDrops = 0, jamTotal = 0, villagePass = 0;
// R138 STRANDED BRANCH: previous-bearer live runs (the r137 next
// blank). strandedDawns counts strandedLog entries; strandedRuns
// counts distinct vid:kind runs; strandedWorked counts travel-out
// work on a stranded run (the r137 failure signature — must be 0);
// guardFires counts wedgeTravelOut guard trips (mid-dawn succession
// — 0-work by construction, reported separately); strandedSocial
// counts stranded dawns on which the wedge still sat socially
// (mode 'accept' or 'start'); strandedNoSocial lists stranded dawns
// with no social sit (a miss against the bar); strandedCommits
// counts new favor commits after a run first stranded.
let strandedDawns = 0, strandedRunsTotal = 0, strandedWorked = 0, guardFires = 0;
let strandedSocial = 0, strandedNoSocial = 0, strandedCommits = 0;
const strandedRunKeys = new Set();
// R138 THREAD BRANCH: end attempts where the wedge had to page (the
// Yara shape — menu paged by betrayal/agency prepends, cancel on page
// 2+). threadOps counts broken-live opportunities whose end sits paged;
// threadClosed counts those closed within 2 dawns of first-seen-broken.
let threadOps = 0, threadClosed = 0, pagedEndSits = 0, totalEndSits = 0;
// R138 TRAVEL BRANCH: end/travel-out sits whose homeward walk first hit
// a clearable blockage (fallen_tree / rubble / washed_out — the Pablo
// shape). travelOps counts broken-live opportunities with such a hit;
// travelClosed counts those closed within 2 dawns of first-seen-broken.
let travelOps = 0, travelClosed = 0, clearSits = 0, totalHomeSits = 0;
const CLEARABLE = { fallen_tree: 1, rubble: 1, washed_out: 1 };
function homeHit(h) {
  if (!h) return false;
  if ((h.clears || []).length > 0) return true;
  return !!(h.blocked && CLEARABLE[h.blocked.blockType]);
}
// R138 Q2 (canned-line variety watch, r135 standing watch): verbatim
// repeats across the panel convo transcripts.
const CANNED = [
  ['pod-dream', 'The pods get into my sleep some nights'],
  ['recap-stitch', ' — Still on '],
  ['slope-reading', 'how their grandmother did it'],
  ['walked-in', "Walked in like they'd never left"],
  ['take-it', "Take it for what it's worth"],
  ['stew-bowl', 'Someone saved me the last of the stew once'],
];
const cannedTotals = Object.fromEntries(CANNED.map(([k]) => [k, 0]));
// R138 Q3 (spotter guard, carried): foodXp['spotter'] total at end.
let spotterTotal = 0;
const lines = [];
for (const seed of seeds) {
  const d = load(seed);
  const ops = opportunities(d);
  const endAttempts = (d.endLog || []).length;
  const ended = (d.endLog || []).filter(e => e.outcome === 'ended' || e.outcome === 'end-via-deliver').length;
  const drops = (d.endLog || []).filter(e => (e.outcome || '').startsWith('end-trust-drop'));
  trustDrops += drops.length;
  jamTotal += (d.jamLog || []).length;
  const alive40 = d.aliveAt40;
  if (alive40 != null && alive40 > 0) villagePass++;
  // Thread-branch accounting from the end log: an end attempt paged
  // when pagesTurned > 0 (or menuPages > 1 with a paged sit rec).
  const paged = (d.endLog || []).filter(e => (e.pagesTurned || 0) > 0);
  pagedEndSits += paged.length; totalEndSits += endAttempts;
  // Travel-branch accounting: homeHops with a clear or a clearable
  // block on any end/travel-out sit this seed.
  for (const e of (d.endLog || [])) { totalHomeSits++; if (homeHit(e.homeHops)) clearSits++; }
  for (const t of (d.travelOutLog || [])) { if (t.homeHops) { totalHomeSits++; if (homeHit(t.homeHops)) clearSits++; } }
  for (const fx of (d.foodXpEnd || [])) spotterTotal += fx.spotter || 0;
  // R138 STRANDED accounting from strandedLog + wedge sits/commits.
  const sLog = (d.strandedLog || []);
  strandedDawns += sLog.length;
  for (const s of sLog) strandedRunKeys.add(String(s.vid) + ':' + s.kind);
  for (const t of (d.travelOutLog || [])) {
    if ((t.outcome || '').startsWith('unworked: previous bearer')) strandedWorked++;
    if (t.outcome === 'prev-bearer-stranded') guardFires++;
    // Work on a stranded run by any other shape: a travel-out entry
    // for the stranded vid on a stranded day that moved or pressed.
    if (t.moved || t.press) {
      const hit = sLog.some(s => String(s.vid) === String(t.vid) && s.day === t.day);
      if (hit) strandedWorked++;
    }
  }
  const strandedDays = [...new Set(sLog.map(s => s.day))];
  for (const day of strandedDays) {
    const social = (d.wedgeSits || []).some(s => s.day === day && (s.mode === 'accept' || s.mode === 'start'));
    if (social) strandedSocial++; else { strandedNoSocial++; lines.push(`seed ${seed}: stranded d${day} with NO social sit (accept/start) — BAR MISS`); }
  }
  const firstStrandedDay = sLog.length ? Math.min(...sLog.map(s => s.day)) : null;
  if (firstStrandedDay !== null) {
    strandedCommits += (d.commitLog || []).filter(c => c.ok && c.day > firstStrandedDay).length;
  }
  // Canned lines from this seed's convo transcript.
  try {
    const txt = fs.readFileSync(path.join(EVID, `journey-establishment-r138-convo-seed${seed}.txt`), 'utf8');
    for (const [k, needle] of CANNED) {
      let n = 0, i = -1;
      while ((i = txt.indexOf(needle, i + 1)) !== -1) n++;
      cannedTotals[k] += n;
    }
  } catch (e) { lines.push(`seed ${seed}: (convo transcript unreadable: ${e.message})`); }
  // END BAR per opportunity: broke >=2 days before the run's end AND
  // bearer is the player AND ending was ready on >=1 dawn after
  // breaking. Bearer/ready are approximated from the end log: an
  // end-not-ready entry naming the bearer block excuses the run;
  // an end attempt that closed within 2 dawns of first-seen-broken
  // passes. Runs first seen broken on the final 2 days are excluded.
  let seedPass = true; const seedNotes = [];
  for (const op of ops) {
    allOps++;
    const excluded = (d.endDay - op.firstDay) < 2;
    // R138 thread branch: did any end attempt for THIS run (days
    // firstDay..endDay) have to page?
    const opPaged = (d.endLog || []).some(e => String(e.vid) === String(op.vid) && e.day >= op.firstDay && (op.endDay === null || e.day <= op.endDay) && (e.pagesTurned || 0) > 0);
    if (opPaged) threadOps++;
    // R138 travel branch: did any end/travel-out sit for THIS run
    // (days firstDay..endDay) hit a clearable blockage on the way home?
    const opTravel = (d.endLog || []).some(e => String(e.vid) === String(op.vid) && e.day >= op.firstDay && (op.endDay === null || e.day <= op.endDay) && homeHit(e.homeHops))
      || (d.travelOutLog || []).some(t => String(t.vid) === String(op.vid) && t.day >= op.firstDay && (op.endDay === null || t.day <= op.endDay) && homeHit(t.homeHops));
    if (opTravel) travelOps++;
    if (excluded) { seedNotes.push(`${op.name}: first-seen-broken d${op.firstDay}, run ended d${d.endDay} (<2d left — excluded)`); continue; }
    const closedIn2 = op.endDay !== null && (op.endDay - op.firstDay) <= 2;
    if (closedIn2) { closedOps++; if (opPaged) threadClosed++; if (opTravel) travelClosed++; seedNotes.push(`${op.name}: broken d${op.firstDay}, closed d${op.endDay} — PASS${opPaged ? ' (PAGED)' : ''}${opTravel ? ' (TRAVEL-HIT)' : ''}`); continue; }
    // Prereg condition (c): ending must have been ready on >=1 dawn
    // after breaking. A run whose every end attempt was not-ready on
    // bearer/event grounds never met (c) — excused, not failed.
    const attempts = (d.endLog || []).filter(e => String(e.vid) === String(op.vid));
    const notReady = attempts.filter(e => (e.outcome || '').startsWith('end-not-ready'));
    const excusable = attempts.length > 0 && notReady.length === attempts.length &&
      notReady.every(e => /previous bearer|current event|Finish the fight/i.test(e.outcome || ''));
    if (excusable) { seedNotes.push(`${op.name}: broken d${op.firstDay}, ending never ready (${notReady.map(e => e.outcome).join(' | ')}) — EXCUSED (condition c unmet)`); continue; }
    // R138 bearer-change excuse (r136 metric-review proposal (a)): the
    // bearer died/changed mid-window and the ending is permanently
    // not-ready for the successor (the Hiroshi shape) — out of scope,
    // recorded with the cause, not counted as a failure.
    const bearerChanged = attempts.some(e => /previous bearer/i.test(e.outcome || ''));
    if (bearerChanged) { seedNotes.push(`${op.name}: broken d${op.firstDay}, bearer changed mid-window (ending not-ready for successor) — EXCUSED (bearer-change scope boundary)`); continue; }
    seedPass = false; seedNotes.push(`${op.name}: broken d${op.firstDay}, outcomes ${JSON.stringify(op.outcomes)} — FAIL`);
  }
  if (!ops.length) { noOppSeeds++; seedNotes.push('(no broken-live forage runs — NO-OPPORTUNITY on this seed)'); }
  lines.push(`seed ${seed}: endDay=${d.endDay} aliveAt40=${alive40} aliveEnd=${d.aliveEnd} wave=${d.waveReached} pantryEnd=${d.pantryKcalEnd} endAttempts=${endAttempts} ended=${ended} trustDrops=${drops.length} jamDays=${(d.jamLog || []).length} strandedDawns=${sLog.length} strandedRuns=${new Set(sLog.map(s => String(s.vid) + ':' + s.kind)).size} brokenWaterDawns=${d.brokenWaterDawns} endDisabled=${!!d.endDisabled}`);
  for (const n of seedNotes) lines.push(`  ${n}`);
}
console.log(lines.join('\n'));
console.log('---');
console.log(`STRANDED BAR: ${strandedDawns} stranded dawns on ${strandedRunKeys.size} runs; worked-on-stranded=${strandedWorked} (must be 0); guard fires=${guardFires}; social-sit dawns=${strandedSocial}/${strandedDawns} (misses=${strandedNoSocial}); new commits after first stranding=${strandedCommits} (NO-OPPORTUNITY if 0 stranded dawns — mechanism then carried by the proof test)`);
console.log(`END BAR: ${closedOps}/${allOps} broken-live forage opportunities closed within 2 dawns (excluded-tail runs not counted; NO-OPPORTUNITY seeds: ${noOppSeeds})`);
console.log(`THREAD BRANCH (carried watch): ${threadClosed}/${threadOps} paged (Yara-shape) opportunities closed within 2 dawns; ${pagedEndSits}/${totalEndSits} end sits paged (NO-OPPORTUNITY if 0 paged ops — mechanism then carried by the proof test)`);
console.log(`TRAVEL BRANCH: ${travelClosed}/${travelOps} clearable-blockage (Pablo-shape) opportunities closed within 2 dawns; ${clearSits}/${totalHomeSits} homeward sits hit a clearable blockage or cleared one (NO-OPPORTUNITY if 0 travel ops — mechanism then carried by the proof test)`);
console.log(`TRUST GUARD: ${trustDrops} trust drops on end presses (must be 0)`);
console.log(`JAM BAR (report-only): ${jamTotal} jam-days across panel (r84 panel: ~15 on seed 994 alone)`);
console.log(`VILLAGE BAR: ${villagePass}/${seeds.length} seeds alive at d40 (bar: >=3/4)`);
console.log(`Q2 CANNED LINES (report-only, r135 watch): ${CANNED.map(([k]) => `${k}=${cannedTotals[k]}`).join(' ')} (r136 panel: pod-dream=0 recap-stitch=1 slope-reading=0 walked-in=0 take-it=0 stew-bowl=1)`);
console.log(`Q3 SPOTTER GUARD: foodXp['spotter'] total = ${spotterTotal} (r135/r136: 0)`);
