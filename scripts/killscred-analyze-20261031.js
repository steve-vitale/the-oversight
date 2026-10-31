#!/usr/bin/env node
// killscred-analyze-20261031.js — sim-killscred-a routing-table analyzer.
// Derives EVERY judged number from the per-seed JSONs only (this arm's
// corpus, evidence/2026-10-31/perseed-killscred-a/). No game code, no
// re-simulation, no RNG. Usage:
//   node scripts/killscred-analyze-20261031.js [corpusDir] [outJson]
//
// Join rule (patrolsilent v2, unchanged): the delegate pick for a
// villager-beat is the delegateBeat assignTask row in that beat; a
// beat with only non-delegate rows for that villager is pre-claimed
// (competent staffing before delegateBeat). Branch classification
// mirrors scripts/policies/delegate.js pickTask order, from the
// RECORDED delegate task + snapshot features — never re-rolled:
//   fit-cook/fit-fish/fit-garden/fit-mend/fit-teach? = delegate pick
//   danger-hit = pick patrol/hunt
//   danger-fallthrough = pick a need task (water/forage/wood/stone/
//     scout) with hp >= 60 + cred (danger evaluated, rolls missed)
//   hp-low = pick a need task with hp < 60 (danger hp-gate closed;
//     hp < 40 would have picked rest instead)
//   rest = pick rest
//   already-assigned = pre-beat assignment snapshot held the villager
//   pre-claimed = non-delegate assign only
//   no-call = at-Haven beat, no assign row at all for the villager
// Holder-beats are beats where the snapshot ALREADY shows kills > 0
// (a villager counts as kills-earned only from their first kill on;
// beats before the first kill are excluded from the holder table and
// reported separately as preKillBeats).
'use strict';
const fs = require('fs');
const path = require('path');

const NEED = new Set(['water', 'forage', 'wood', 'stone', 'scout']);
const FIT = { cook: 'fit-cook', fish: 'fit-fish', garden: 'fit-garden', mend: 'fit-mend', teach: 'fit-teach?' };

function analyzeSeed(j) {
  const assignsByBeat = new Map();
  for (const a of (j.psAssigns || [])) {
    if (a.beat === null || a.beat === undefined) continue;
    if (!assignsByBeat.has(a.beat)) assignsByBeat.set(a.beat, []);
    assignsByBeat.get(a.beat).push(a);
  }
  // Holders: any vid with kills > 0 in any beat snapshot.
  const holderInfo = new Map();
  for (const b of (j.psBeats || [])) {
    for (const r of (b.roster || [])) {
      if (typeof r.kills === 'number' && r.kills > 0) {
        if (!holderInfo.has(r.vid)) {
          holderInfo.set(r.vid, { vid: r.vid, occ: r.occ, occLower: r.occLower,
            credOcc: r.credOcc, firstKillBeat: b.id, firstKillDay: b.day,
            maxKills: r.kills, lastSpecCook: r.specCook, lastSpecPreserver: r.specPreserver });
        } else {
          const h = holderInfo.get(r.vid);
          h.maxKills = Math.max(h.maxKills, r.kills);
          h.lastSpecCook = r.specCook; h.lastSpecPreserver = r.specPreserver;
        }
      }
    }
  }
  // Occupation-cred holders (credOcc, never kills>0): contrast only.
  const occHolders = [];
  {
    const seen = new Map();
    for (const b of (j.psBeats || [])) {
      for (const r of (b.roster || [])) {
        if (r.credOcc && !(typeof r.kills === 'number' && r.kills > 0) && !holderInfo.has(r.vid)) {
          if (!seen.has(r.vid)) seen.set(r.vid, { vid: r.vid, occ: r.occ, patrolPicks: 0, fitPicks: 0, dangerPicks: 0 });
        }
      }
    }
    for (const a of (j.psAssigns || [])) {
      if (a.caller !== 'delegateBeat') continue;
      const h = seen.get(a.vid); if (!h) continue;
      if (a.task === 'patrol') h.patrolPicks++;
      else if (FIT[a.task]) h.fitPicks++;
      else if (a.task === 'hunt' || NEED.has(a.task)) h.dangerPicks++;
    }
    // Only holders who ever actually held a delegate pick or patrol pick
    // are interesting; keep all occ-cred roster members but flag pickless.
    for (const h of seen.values()) occHolders.push(h);
  }
  const holders = [];
  for (const [vid, info] of holderInfo) {
    const branches = { 'fit-cook': 0, 'fit-fish': 0, 'fit-garden': 0, 'fit-mend': 0,
      'fit-teach?': 0, 'danger-hit': 0, 'danger-fallthrough': 0, 'hp-low': 0,
      rest: 0, 'already-assigned': 0, 'pre-claimed': 0, 'no-call': 0 };
    const duty = {};
    const allBeatsDuty = {};
    let credVB = 0, credFit = 0, credDanger = 0, preClaimedCred = 0;
    const heldTasks = {};
    let patrolAttempts = 0, huntPicks = 0, holderBeats = 0, preKillBeats = 0;
    let hpSum = 0, hpN = 0, specCookAtFirst = null, specPresAtFirst = null;
    const sampleDays = [];
    for (const b of (j.psBeats || [])) {
      if (!b.atHaven) continue;
      const row = (b.roster || []).find(r => r.vid === vid);
      if (!row) continue;
      const killsNow = (typeof row.kills === 'number') ? row.kills : 0;
      if (killsNow <= 0) { preKillBeats++; continue; }
      if (specCookAtFirst === null) { specCookAtFirst = row.specCook; specPresAtFirst = row.specPreserver; }
      holderBeats++;
      if (typeof row.hp === 'number') { hpSum += row.hp; hpN++; }
      if (row.hadAssignment) {
        branches['already-assigned']++;
        heldTasks[row.preTask || '?'] = (heldTasks[row.preTask || '?'] || 0) + 1;
        continue;
      }
      const rows = (assignsByBeat.get(b.id) || []).filter(a => a.vid === vid);
      const del = rows.find(a => a.caller === 'delegateBeat');
      if (del) {
        // Patrolsilent credVB reconciliation: delegate pick with
        // hp >= 60 (rest excluded separately); fit/danger split inside it.
        if (del.task !== 'rest' && typeof row.hp === 'number' && row.hp >= 60) {
          credVB++;
          if (FIT[del.task]) credFit++;
          else if (del.task === 'patrol' || del.task === 'hunt' || NEED.has(del.task)) credDanger++;
        }
        const t = del.task;
        duty[t] = (duty[t] || 0) + 1;
        if (t === 'patrol') patrolAttempts++;
        if (t === 'hunt') huntPicks++;
        if (FIT[t]) branches[FIT[t]]++;
        else if (t === 'patrol' || t === 'hunt') branches['danger-hit']++;
        else if (t === 'rest') branches.rest++;
        else if (NEED.has(t)) {
          if ((row.hp === null || row.hp === undefined || row.hp >= 60)) branches['danger-fallthrough']++;
          else branches['hp-low']++;
        } else branches['no-call']++;
      } else if (rows.length > 0) {
        branches['pre-claimed']++;
        if (typeof row.hp === 'number' && row.hp >= 60) preClaimedCred++;
        for (const r of rows) duty['pre:' + (r.task || '?')] = (duty['pre:' + (r.task || '?')] || 0) + 1;
      } else {
        branches['no-call']++;
      }
      if (sampleDays.length < 400) sampleDays.push({ beat: b.id, day: b.day, part: b.part, hp: row.hp, kills: killsNow, specCook: row.specCook, specPres: row.specPreserver, branch: del ? (FIT[del.task] || (del.task === 'patrol' || del.task === 'hunt' ? 'danger-hit' : del.task)) : (rows.length ? 'pre-claimed' : 'no-call'), task: del ? del.task : (rows.length ? rows.map(r => r.task).join(',') : null) });
    }
    // Non-delegate patrol rows for this holder (should be 0 on silent seeds).
    const nonDelPatrol = (j.psAssigns || []).filter(a => a.vid === vid && a.task === 'patrol' && a.caller !== 'delegateBeat').length;
    // All-beats duty (pre-kill + post-kill delegate picks): reconciles
    // with patrolsilent's "mends 271x / cooks 257x" totals, which count
    // every delegate pick, not only post-kill holder-beats.
    for (const b of (j.psBeats || [])) {
      if (!b.atHaven) continue;
      if (!(b.roster || []).some(r => r.vid === vid)) continue;
      const del = (assignsByBeat.get(b.id) || []).find(a => a.vid === vid && a.caller === 'delegateBeat');
      if (del) allBeatsDuty[del.task] = (allBeatsDuty[del.task] || 0) + 1;
    }
    holders.push({ ...info, holderBeats, preKillBeats, patrolAttempts, huntPicks,
      nonDelPatrol, branches, duty, allBeatsDuty, heldTasks,
      credVB, credFit, credDanger, preClaimedCred,
      meanHp: hpN ? Math.round((hpSum / hpN) * 10) / 10 : null,
      specCookAtFirst, specPresAtFirst,
      fitShareOfPicks: (function () {
        const picks = holderBeats - branches['already-assigned'] - branches['pre-claimed'] - branches['no-call'];
        const fit = branches['fit-cook'] + branches['fit-fish'] + branches['fit-garden'] + branches['fit-mend'] + branches['fit-teach?'];
        return picks > 0 ? Math.round((fit / picks) * 1000) / 1000 : null;
      })(),
      sampleDays });
  }
  const beats = (j.psBeats || []).length;
  const atHaven = (j.psBeats || []).filter(b => b.atHaven).length;
  const allPatrol = (j.psAssigns || []).filter(a => a.task === 'patrol').length;
  const delPatrol = (j.psAssigns || []).filter(a => a.task === 'patrol' && a.caller === 'delegateBeat').length;
  return { seed: j.seed, anchorCommit: j.anchorCommit, instrument: j.instrument,
    days: j.gameDays, endReason: j.endReason, national: j.national, table: j.table,
    won: j.won, maxWave: j.maxWave, deadfallHauls: j.deadfallHauls,
    beats, atHaven, assigns: (j.psAssigns || []).length,
    patrolAttemptsAll: allPatrol, patrolAttemptsDelegate: delPatrol,
    psErrors: (j.psErrors || []).length, psErrorList: j.psErrors || [],
    holders, occHolders };
}

function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-killscred-a');
  const outFile = process.argv[3] || null;
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const seeds = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(analyzeSeed(j));
  }
  const out = { corpusDir: dir, seeds };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(out, null, 1) + '\n');
  for (const s of seeds) {
    console.log(`s${s.seed}: ${s.days}d end=${s.endReason} nat=${s.national} table=${s.table} won=${s.won} w${s.maxWave} beats=${s.beats} atHaven=${s.atHaven} assigns=${s.assigns} patrolAll=${s.patrolAttemptsAll} patrolDel=${s.patrolAttemptsDelegate} errs=${s.psErrors} holders=${s.holders.length}`);
    for (const h of s.holders) {
      console.log(`  HOLDER ${h.vid} occ=${h.occ} credOcc=${h.credOcc} maxKills=${h.maxKills} firstKillDay=${h.firstKillDay} holderBeats=${h.holderBeats} preKillBeats=${h.preKillBeats} patrol=${h.patrolAttempts} hunt=${h.huntPicks} nonDelPatrol=${h.nonDelPatrol} fitShare=${h.fitShareOfPicks} meanHp=${h.meanHp} specFirst=cook:${h.specCookAtFirst}/pres:${h.specPresAtFirst}`);
      console.log(`    branches: ${JSON.stringify(h.branches)}`);
      console.log(`    duty(post-kill): ${JSON.stringify(h.duty)} allBeatsDuty: ${JSON.stringify(h.allBeatsDuty)} heldTasks: ${JSON.stringify(h.heldTasks)}`);
      console.log(`    credVB=${h.credVB} credFit=${h.credFit} credDanger=${h.credDanger} preClaimedCred=${h.preClaimedCred}`);
    }
    if (s.occHolders && s.occHolders.length) console.log(`  OCC-CRED contrast: ${JSON.stringify(s.occHolders)}`);
  }
  return out;
}

if (require.main === module) main();
module.exports = { analyzeSeed };
