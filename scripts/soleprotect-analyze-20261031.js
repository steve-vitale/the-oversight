#!/usr/bin/env node
// soleprotect-analyze-20261031.js — sim-soleprotect-a census analyzer.
// DIAG ONLY. Derives EVERY number from the per-seed JSONs only
// (this arm's corpora). No game code, no re-simulation, no RNG.
//
// Usage:
//   node scripts/soleprotect-analyze-20261031.js <corpusDir> [outJson]
//
// Definitions (prereg, fixed before judged sims):
// - Holder: snapshot monsterKills > 0 on any at-Haven beat.
// - Provider of mend/cook: >= 1 delegateBeat pick of that task on
//   at-Haven beats over the run. Sole provider: exactly 1 provider.
// - Sole-specialist holder: kills-holder who is sole provider of
//   mend or of cook on that seed-leg.
// - Sole-specialist patrol death: sole-specialist holder with a
//   deaths-list row kind=villager whose last delegateBeat pick
//   before disappearance was 'patrol' on the death day.
// - HP at death: pre-beat snapshot HP on the death-day patrol beat.
// - Days out: days firstKill->death, distinct patrol days, patrol
//   picks before death (all three reported).
// - Truncation: village-wide delegate picks of the skill split at
//   the death day, plus post-death empty-days / post-death days.
// - RETREAT-80: sole specialist skips patrol at pre-beat HP < 80.
//   A patrol death counts RETREAT-80-SAVED iff its death-day
//   patrol beat pre-beat HP < 80 (kept-home-that-day only —
//   NOT a claim the holder would have lived to run end).
'use strict';
const fs = require('fs');
const path = require('path');

const SKILLS = ['mend', 'cook'];

function analyzeSeed(j) {
  const assignsByBeat = new Map();
  for (const a of (j.psAssigns || [])) {
    if (a.beat === null || a.beat === undefined) continue;
    if (!assignsByBeat.has(a.beat)) assignsByBeat.set(a.beat, []);
    assignsByBeat.get(a.beat).push(a);
  }
  const beatById = new Map();
  for (const b of (j.psBeats || [])) beatById.set(b.id, b);

  // Village-wide delegate picks per skill per day (at-Haven beats only,
  // delegateBeat caller only — the all-beats frame of killscred).
  const skillDayCounts = { mend: new Map(), cook: new Map() };
  const providers = { mend: new Map(), cook: new Map() }; // vid -> count
  const holderPicks = new Map(); // vid -> {mend,cook} delegate picks, all beats
  for (const b of (j.psBeats || [])) {
    if (!b.atHaven) continue;
    const dels = (assignsByBeat.get(b.id) || []).filter(a => a.caller === 'delegateBeat');
    for (const d of dels) {
      if (d.task === 'mend' || d.task === 'cook') {
        skillDayCounts[d.task].set(b.day, (skillDayCounts[d.task].get(b.day) || 0) + 1);
        providers[d.task].set(d.vid, (providers[d.task].get(d.vid) || 0) + 1);
      }
    }
  }
  const runEndDay = j.gameDays || 0;

  // Holders + first-kill day + patrol history.
  const holderInfo = new Map();
  for (const b of (j.psBeats || [])) {
    for (const r of (b.roster || [])) {
      if (typeof r.kills === 'number' && r.kills > 0) {
        if (!holderInfo.has(r.vid)) {
          holderInfo.set(r.vid, { vid: r.vid, occ: r.occ, firstKillDay: b.day,
            firstKillBeat: b.id, maxKills: r.kills });
        } else {
          const h = holderInfo.get(r.vid);
          h.maxKills = Math.max(h.maxKills, r.kills);
        }
      }
    }
  }

  const holders = [];
  for (const [vid, info] of holderInfo) {
    // Per-holder delegate picks + patrol days, at-Haven beats.
    let patrolPicks = 0, huntPicks = 0;
    const patrolDays = new Set();
    const picks = { mend: 0, cook: 0 };
    const beatRows = []; // {beat,day,part,hp,task} for patrol-death join
    let lastSeenBeat = null, lastSeenDay = null, lastSeenPart = null;
    for (const b of (j.psBeats || [])) {
      const row = (b.roster || []).find(r => r.vid === vid);
      if (row) { lastSeenBeat = b.id; lastSeenDay = b.day; lastSeenPart = b.part; }
      if (!b.atHaven) continue;
      const del = (assignsByBeat.get(b.id) || []).find(a => a.vid === vid && a.caller === 'delegateBeat');
      if (!del) continue;
      if (del.task === 'patrol') { patrolPicks++; patrolDays.add(b.day); }
      if (del.task === 'hunt') huntPicks++;
      if (del.task === 'mend' || del.task === 'cook') picks[del.task]++;
      if (row) beatRows.push({ beat: b.id, day: b.day, part: b.part, hp: row.hp, task: del.task });
    }
    const sole = {};
    for (const s of SKILLS) sole[s] = (providers[s].size === 1 && providers[s].has(vid));
    const isSoleSpecialist = sole.mend || sole.cook;

    // Death row for this vid (kind=villager only).
    const deathRows = (j.deaths || []).filter(d => d.kind === 'villager' && d.who === vid);
    const death = deathRows.length ? deathRows[0] : null;
    let patrolDeath = null;
    if (death && isSoleSpecialist) {
      // Last delegate pick on the death day, before disappearance:
      // beats on death day with a patrol pick for this vid, where a
      // later beat on the same day has no roster row for the vid.
      const dayPatrols = beatRows.filter(r => r.day === death.day && r.task === 'patrol');
      const vanishedSameDay = (j.psBeats || []).some(b => b.day === death.day &&
        !(b.roster || []).some(r => r.vid === vid) &&
        dayPatrols.some(p => p.beat < b.id));
      const lastPatrol = dayPatrols.length ? dayPatrols[dayPatrols.length - 1] : null;
      if (lastPatrol && vanishedSameDay) {
        const preDeathPatrolDays = new Set();
        let preDeathPatrolPicks = 0;
        for (const b of (j.psBeats || [])) {
          if (!b.atHaven || b.day > death.day) continue;
          const del = (assignsByBeat.get(b.id) || []).find(a => a.vid === vid && a.caller === 'delegateBeat');
          if (del && del.task === 'patrol') { preDeathPatrolPicks++; preDeathPatrolDays.add(b.day); }
        }
        patrolDeath = {
          day: death.day, cause: death.cause, hpAtDeath: lastPatrol.hp,
          deathBeat: lastPatrol.beat, deathPart: lastPatrol.part,
          daysFirstKillToDeath: death.day - info.firstKillDay,
          patrolDaysBeforeDeath: preDeathPatrolDays.size,
          patrolPicksBeforeDeath: preDeathPatrolPicks,
          retreat80Saved: (typeof lastPatrol.hp === 'number' && lastPatrol.hp < 80),
        };
      }
    }
    // Truncation per sole skill (village-wide, split at death day).
    const truncation = {};
    for (const s of SKILLS) {
      if (!sole[s]) continue;
      const dayMap = skillDayCounts[s];
      let before = 0, after = 0, emptyDays = 0, postDays = 0;
      if (death) {
        for (const [d, c] of dayMap) { if (d < death.day) before += c; else if (d > death.day) after += c; }
        // Death-day picks themselves belong to neither side (holder
        // worked that morning, then died); report them separately.
        const deathDay = dayMap.get(death.day) || 0;
        for (let d = death.day + 1; d <= runEndDay; d++) {
          postDays++;
          if (!(dayMap.get(d) || 0)) emptyDays++;
        }
        truncation[s] = { beforeDeath: before, deathDay, afterDeath: after,
          postDeathEmptyDays: emptyDays, postDeathDays: postDays,
          holderOwn: picks[s], villageTotal: before + deathDay + after };
      } else {
        let total = 0; for (const c of dayMap.values()) total += c;
        // Surviving holder: empty-days over the whole run's day span.
        let empty = 0; const span = runEndDay;
        for (let d = 1; d <= runEndDay; d++) { if (!(dayMap.get(d) || 0)) empty++; }
        truncation[s] = { beforeDeath: null, deathDay: null, afterDeath: null,
          postDeathEmptyDays: empty, postDeathDays: span,
          holderOwn: picks[s], villageTotal: total, survivedNote: 'holder alive at run end' };
      }
    }
    // Providers alive at end: roster presence on the last beat.
    const lastBeat = (j.psBeats || [])[(j.psBeats || []).length - 1];
    const aliveAtEnd = lastBeat ? (lastBeat.roster || []).some(r => r.vid === vid) : false;
    holders.push({ ...info, patrolPicks, huntPicks,
      patrolDays: patrolDays.size, picks, sole, isSoleSpecialist,
      death: death ? { day: death.day, cause: death.cause } : null,
      patrolDeath, truncation, aliveAtEnd,
      lastSeenDay, lastSeenPart });
  }

  const soleCoverage = {};
  for (const s of SKILLS) {
    const provList = [...providers[s].entries()].map(([vid, n]) => ({ vid, picks: n }));
    const soleHolder = holders.find(h => h.sole[s]);
    soleCoverage[s] = { providerCount: providers[s].size, providers: provList,
      soleHolderVid: soleHolder ? soleHolder.vid : null,
      soleHolderOcc: soleHolder ? soleHolder.occ : null };
  }

  const beats = (j.psBeats || []).length;
  const atHaven = (j.psBeats || []).filter(b => b.atHaven).length;
  return { seed: j.seed, arm: j.arm || null, anchorCommit: j.anchorCommit,
    days: j.gameDays, endReason: j.endReason, national: j.national,
    table: j.table, won: j.won, maxWave: j.maxWave,
    wave4: j.wave4, wave5: j.wave5,
    beats, atHaven, assigns: (j.psAssigns || []).length,
    psErrors: (j.psErrors || []).length, psErrorList: j.psErrors || [],
    soleCoverage, holders };
}

function main() {
  const dir = process.argv[2];
  const outFile = process.argv[3] || null;
  if (!dir) { console.error('usage: soleprotect-analyze-20261031.js <corpusDir> [outJson]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const seeds = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(analyzeSeed(j));
  }
  const out = { corpusDir: dir, seeds };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(out, null, 1) + '\n');
  for (const s of seeds) {
    console.log(`s${s.seed}: ${s.days}d end=${s.endReason} nat=${s.national} table=${s.table} won=${s.won} w${s.maxWave} beats=${s.beats} atHaven=${s.atHaven} errs=${s.psErrors} holders=${s.holders.length}`);
    for (const sk of SKILLS) {
      const c = s.soleCoverage[sk];
      console.log(`  ${sk}: providers=${c.providerCount} soleHolder=${c.soleHolderVid || '-'} (${c.soleHolderOcc || '-'}) prov=${JSON.stringify(c.providers)}`);
    }
    for (const h of s.holders) {
      console.log(`  HOLDER ${h.vid} occ=${h.occ} firstKillDay=${h.firstKillDay} maxKills=${h.maxKills} patrol=${h.patrolPicks} hunt=${h.huntPicks} patrolDays=${h.patrolDays} picks=${JSON.stringify(h.picks)} sole=${JSON.stringify(h.sole)} death=${h.death ? h.death.day + '/' + h.death.cause : 'alive'} aliveAtEnd=${h.aliveAtEnd}`);
      if (h.patrolDeath) console.log(`    PATROL-DEATH: ${JSON.stringify(h.patrolDeath)}`);
      if (Object.keys(h.truncation).length) console.log(`    TRUNCATION: ${JSON.stringify(h.truncation)}`);
    }
  }
  return out;
}

if (require.main === module) main();
module.exports = { analyzeSeed };
