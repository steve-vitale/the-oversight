#!/usr/bin/env node
// patrolsilent-analyze-20261031.js — sim-patrolsilent-a census analyzer.
// Derives EVERY judged number from the per-seed JSONs only (never
// re-runs sims, never re-rolls policy RNG). Usage:
//   node scripts/patrolsilent-analyze-20261031.js [perseed-dir]
// Defaults: evidence/2026-10-31/perseed-patrolsilent-a, with the
// pocketdesign corpus at evidence/2026-10-31/perseed-pocketdesign-a/patrol
// as the cross-base check.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const PS = require(path.join(REPO, 'scripts', 'patrolsilent-diag-20261031'));

const FIT_TASKS = ['cook', 'fish', 'garden', 'mend', 'teach'];
const NEED_TASKS = ['water', 'forage', 'wood', 'stone', 'scout'];

function analyzeSeed(j) {
  const beats = j.psBeats || [];
  const assigns = j.psAssigns || [];
  const atHaven = beats.filter(b => b.atHaven);
  // Join: the DELEGATE pick per (beat, vid) = the assign row with
  // caller delegateBeat. Other callers (competent assignOne water,
  // assignAnother/counterPlay staffing, staffDeadfall) run in the
  // SAME beat BEFORE delegateBeat; when one of theirs STANDS,
  // delegateBeat skips that villager (already has an assignment),
  // so the villager never reached pickTask at all. Counting a
  // competent water assign as a "danger-roll miss" was the v1
  // analyzer's error (s85114's 13 water beats). v2 join:
  // delegateBeat rows only; stood non-delegate rows -> 'pre-claimed'.
  const taskByBeatVid = new Map();
  const preClaimedSet = new Set();
  for (const a of assigns) {
    if (a.beat === null || a.beat === undefined) continue;
    if (a.caller === 'delegateBeat') taskByBeatVid.set(a.beat + '|' + a.vid, a.task);
    else if (a.assignedAfter) preClaimedSet.add(a.beat + '|' + a.vid);
  }
  const classes = {};
  const bump = (k) => { classes[k] = (classes[k] || 0) + 1; };
  // Cred-eligible villager-beats: at-Haven beat, roster row, not dead,
  // not personMissing, not already-assigned, hp>=60, cred.
  let credVB = 0, credFitFirst = 0, credDanger = 0, credPatrol = 0, credHunt = 0;
  let noCredVB = 0, hpLowVB = 0, alreadyVB = 0, restVB = 0;
  let preClaimedVB = 0, preClaimedCredVB = 0;
  let awayDistHist = {};
  for (const b of beats) {
    if (!b.atHaven) {
      const hx = (b.villagePx === null || b.villagePx === undefined) ? 4 : b.villagePx;
      const hy = (b.villagePy === null || b.villagePy === undefined) ? 4 : b.villagePy;
      const d = (b.scholarPx === null || b.scholarPy === null) ? 'unknown'
        : (Math.abs(b.scholarPx - hx) + Math.abs(b.scholarPy - hy));
      awayDistHist[d] = (awayDistHist[d] || 0) + 1;
      continue;
    }
    for (const r of (b.roster || [])) {
      if (r.dead || r.personMissing) continue;
      const assignedTask = taskByBeatVid.has(b.id + '|' + r.vid)
        ? taskByBeatVid.get(b.id + '|' + r.vid) : null;
      const preClaimed = assignedTask === null && preClaimedSet.has(b.id + '|' + r.vid);
      // A villager with a pre-beat assignment gets no new call; the
      // wrapper has no row for them. hadAssignment rows must not
      // count as unclassified.
      const cls = PS.classifyBeatVillager({
        hadAssignment: !!r.hadAssignment, hp: r.hp, cred: !!r.cred,
        assignedTask: r.hadAssignment ? (r.preTask || 'unknown-held') : assignedTask,
      });
      // classifyBeatVillager returns 'already-assigned' for held rows;
      // for the class table, held rows keep their own bucket.
      if (r.hadAssignment) bump('already-assigned');
      else if (preClaimed) bump('pre-claimed');
      else if (assignedTask === null) bump('no-call-recorded');
      else bump(cls === 'already-assigned' ? 'unclassified' : cls);
      if (r.hadAssignment) { alreadyVB++; continue; }
      if (preClaimed) { preClaimedVB++; if (r.cred && typeof r.hp === 'number' && r.hp >= 60) preClaimedCredVB++; continue; }
      if (assignedTask === null) continue;
      if (assignedTask === 'rest') { restVB++; continue; }
      const hpOk = (typeof r.hp === 'number' && r.hp >= 60);
      if (!hpOk) { hpLowVB++; continue; }
      if (!r.cred) { noCredVB++; continue; }
      credVB++;
      if (FIT_TASKS.indexOf(assignedTask) !== -1) credFitFirst++;
      else if (assignedTask === 'patrol') { credDanger++; credPatrol++; }
      else if (assignedTask === 'hunt') { credDanger++; credHunt++; }
      else if (NEED_TASKS.indexOf(assignedTask) !== -1) credDanger++;
      else bump('cred-other-task');
    }
  }
  const patrolAttempts = assigns.filter(a => a.task === 'patrol');
  const patrolStood = patrolAttempts.filter(a => a.assignedAfter).length;
  const patrolRefused = patrolAttempts.filter(a => a.retRefused).length;
  const callers = {};
  for (const a of assigns) callers[a.caller || 'null'] = (callers[a.caller || 'null'] || 0) + 1;
  // Beat-boundary patrol sightings (all paths, not just assignTask).
  let patrolAssignSightings = 0, patrolLeadSightings = 0;
  for (const b of beats) {
    for (const k of Object.keys(b.assignments || {})) if (b.assignments[k] === 'patrol') patrolAssignSightings++;
    if (b.taskLeads && b.taskLeads.patrol) patrolLeadSightings++;
  }
  if ((j.finalAssignments || {})) for (const k of Object.keys(j.finalAssignments)) if (j.finalAssignments[k] === 'patrol') patrolAssignSightings++;
  // Per-villager cred roster (ever seen): occ + kills>0 ever + patrol picks.
  const villagers = {};
  for (const b of beats) {
    for (const r of (b.roster || [])) {
      if (r.dead || r.personMissing) continue;
      const v = villagers[r.vid] || (villagers[r.vid] = { vid: r.vid, occ: r.occ, beats: 0, everKills: false, everCred: false, patrolPicks: 0, maxKills: null });
      v.beats++;
      if (typeof r.kills === 'number') {
        if (v.maxKills === null || r.kills > v.maxKills) v.maxKills = r.kills;
        if (r.kills > 0) v.everKills = true;
      }
      if (r.cred) v.everCred = true;
      const t = taskByBeatVid.get(b.id + '|' + r.vid);
      if (t === 'patrol') v.patrolPicks++;
    }
  }
  const credHolders = Object.values(villagers).filter(v => v.everCred);
  const awayBeats = beats.length - atHaven.length;
  return { seed: j.seed, days: j.gameDays, endReason: j.endReason,
    national: j.national, table: j.table, won: j.won, maxWave: j.maxWave,
    wave4: j.wave4, wave5: j.wave5,
    deadfallHauls: j.deadfallHauls, deadfallSticks: j.deadfallSticks, deadfallFiber: j.deadfallFiber,
    beats: beats.length, atHavenBeats: atHaven.length, awayBeats,
    atHavenShare: beats.length ? atHaven.length / beats.length : 0,
    awayDistHist, classes, credVB, credFitFirst, credDanger, credPatrol, credHunt,
    fitFirstShare: (credFitFirst + credDanger) ? credFitFirst / (credFitFirst + credDanger) : null,
    noCredVB, hpLowVB, alreadyVB, restVB, preClaimedVB, preClaimedCredVB,
    assigns: assigns.length, patrolAttempts: patrolAttempts.length,
    patrolStood, patrolRefused, callers,
    patrolAssignSightings, patrolLeadSightings,
    errors: (j.psErrors || []).length,
    rosterN: Object.keys(villagers).length, credHoldersN: credHolders.length,
    credHolders: credHolders.map(v => ({ vid: v.vid, occ: v.occ, maxKills: v.maxKills, patrolPicks: v.patrolPicks })),
    hashes: j.hashes || [], anchorCommit: j.anchorCommit };
}

function main() {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-patrolsilent-a');
  const pdDir = path.join(REPO, 'evidence', '2026-10-31', 'perseed-pocketdesign-a', 'patrol');
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const rows = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    rows.push(analyzeSeed(j));
  }
  rows.sort((a, b) => a.seed - b.seed);
  for (const r of rows) {
    console.log(`s${r.seed} days=${r.days} end=${r.endReason} nat=${r.national} table=${r.table} won=${r.won} w4=${r.wave4} w5=${r.wave5} deadfall=${r.deadfallHauls} beats=${r.beats} atHaven=${r.atHavenBeats} (${(r.atHavenShare * 100).toFixed(1)}%) assigns=${r.assigns} patrolAtt=${r.patrolAttempts} stood=${r.patrolStood} refused=${r.patrolRefused} patrolAssignSight=${r.patrolAssignSightings} patrolLeadSight=${r.patrolLeadSightings} credVB=${r.credVB} credFit=${r.credFitFirst} credDanger=${r.credDanger} (patrol ${r.credPatrol} hunt ${r.credHunt}) fitShare=${r.fitFirstShare === null ? 'null' : r.fitFirstShare.toFixed(2)} noCredVB=${r.noCredVB} hpLowVB=${r.hpLowVB} preClaimed=${r.preClaimedVB} preClaimedCred=${r.preClaimedCredVB} roster=${r.rosterN} credHolders=${r.credHoldersN} errs=${r.errors}`);
    console.log(`  classes: ${JSON.stringify(r.classes)}`);
    console.log(`  callers: ${JSON.stringify(r.callers)} awayDist: ${JSON.stringify(r.awayDistHist)}`);
    if (r.credHolders.length) console.log(`  cred holders: ${JSON.stringify(r.credHolders)}`);
  }
  console.log('--- cross-base check vs pocketdesign corpus (base differs; counts only, never hashes) ---');
  for (const r of rows) {
    const p = path.join(pdDir, `s${r.seed}.json`);
    if (!fs.existsSync(p)) { console.log(`s${r.seed}: no pocketdesign corpus`); continue; }
    const pj = JSON.parse(fs.readFileSync(p, 'utf8'));
    const pdPatrolDeps = (pj.pdDepartures || []).filter(d => d.kind === 'resolvePatrol').length;
    console.log(`s${r.seed}: pdAnchor=${pj.anchorCommit} vs psAnchor=${r.anchorCommit} | pdAssigns=${(pj.pdAssigns || []).length} psPatrolAtt=${r.patrolAttempts} | pdPatrolDeps=${pdPatrolDeps} | pdDeadfall=${pj.deadfallHauls} psDeadfall=${r.deadfallHauls} | pdDays=${pj.gameDays} psDays=${r.days} | pdNat=${pj.national} psNat=${r.national} pdTable=${pj.table} psTable=${r.table} pdWon=${pj.won} psWon=${r.won} pdMaxWave=${pj.maxWave} psMaxWave=${r.maxWave}`);
  }
  return rows;
}

if (require.main === module) main();
module.exports = { analyzeSeed };
