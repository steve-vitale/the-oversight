#!/usr/bin/env node
// scripts/test-monsterknowledge-a.js — proof for sim-monsterknowledge-a
// (2026-10-27, flesh-out loop, axis scale-onramp, DIAG ONLY).
//
// Re-derives every summary number from the raw per-seed rows in
// evidence/2026-10-27/perseed-monsterknowledge-a/ (no trust in the
// sweep's own totals): G2 recorder neutrality per seed, baseline band
// vs the 1920Z table (diffs recomputed, reported — a base move is a
// reported delta, not a proof failure, provided the summary's diff
// matches the recomputation), knowledge E1..E7 totals per seed vs the
// summary's perSeedKnowledge, scan completeness, cost bar, and code
// citations for the inventory (each cited file must contain the cited
// symbol — a citation check, not a semantics proof; semantics are
// argued in the evidence file).
// Usage: node scripts/test-monsterknowledge-a.js [--dir <evidDir>]
// Exit 1 on any FAIL.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.argv.includes('--dir')
  ? process.argv[process.argv.indexOf('--dir') + 1]
  : path.join(REPO, 'evidence', '2026-10-27', 'perseed-monsterknowledge-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const BAND1816 = { wins: 2, nationalEver: 6, nationalFinal: 5, entered: 2, wave4: 6, wave5: 0, medianDays: 152, deaths: 307, starvation: 1 };
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function medianOf(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function loadRow(pid, seed) {
  return JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-${pid}.json`), 'utf8'));
}
const summary = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));
const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));

// --- G2 + bands, re-derived from rows ---
const rows = [];
for (const seed of SEEDS) for (const pid of ['baseline', 'armed']) rows.push(loadRow(pid, seed));
for (const seed of SEEDS) {
  const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
  const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
  check(`g2 seed ${seed} days/gameDays/ts/starvation identical`,
    c.days === a.days && c.gameDays === a.gameDays && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths,
    { c: [c.days, c.gameDays, c.ts, c.starvationDeaths], a: [a.days, a.gameDays, a.ts, a.starvationDeaths] });
  check(`g2 seed ${seed} faced identical`, JSON.stringify(c.faced) === JSON.stringify(a.faced));
  check(`g2 seed ${seed} kill-log identical`,
    JSON.stringify((c.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])));
}
function bandOf(pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  return {
    won: rs.reduce((t, r) => t + r.won, 0), medianDays: medianOf(rs.map(r => r.days)),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    table: rs.reduce((t, r) => t + r.table, 0), entered: rs.reduce((t, r) => t + r.entered, 0),
    wave4: wave(4), wave5: wave(5),
    starvation: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    deaths: rs.reduce((t, r) => t + r.deathTotal, 0),
  };
}
const baseBand = bandOf('baseline'), armedBand = bandOf('armed');
check('summary baseline band matches re-derivation', JSON.stringify({
  won: summary.baselineBand.won, medianDays: summary.baselineBand.medianDays,
  nationalEver: summary.baselineBand.nationalEver, nationalFinal: summary.baselineBand.nationalFinal,
  table: summary.baselineBand.table, entered: summary.baselineBand.entered,
  wave4: summary.baselineBand.wave4, wave5: summary.baselineBand.wave5,
  starvationTotal: summary.baselineBand.starvationTotal, deathTotal: summary.baselineBand.deathTotal,
}) === JSON.stringify({
  won: baseBand.won, medianDays: baseBand.medianDays, nationalEver: baseBand.nationalEver,
  nationalFinal: baseBand.nationalFinal, table: baseBand.table, entered: baseBand.entered,
  wave4: baseBand.wave4, wave5: baseBand.wave5, starvationTotal: baseBand.starvation,
  deathTotal: baseBand.deaths,
}), { summary: summary.baselineBand, rederived: baseBand });
const diff = {
  wins: baseBand.won - BAND1816.wins, nationalEver: baseBand.nationalEver - BAND1816.nationalEver,
  nationalFinal: baseBand.nationalFinal - BAND1816.nationalFinal, entered: baseBand.entered - BAND1816.entered,
  wave4: baseBand.wave4 - BAND1816.wave4, wave5: baseBand.wave5 - BAND1816.wave5,
  medianDays: baseBand.medianDays - BAND1816.medianDays, deaths: baseBand.deaths - BAND1816.deaths,
  starvation: baseBand.starvation - BAND1816.starvation,
};
check('summary diff vs 1920Z matches recomputation', JSON.stringify(summary.gates.diffVs1816) === JSON.stringify(diff), { summary: summary.gates.diffVs1816, rederived: diff });
console.log(`INFO rebaseline vs 1920Z: exact=${Object.values(diff).every(v => v === 0)} diff=${JSON.stringify(diff)} (a nonzero diff is a base move to explain in evidence, not a proof failure by itself)`);
check('cost bar starvation', armedBand.starvation <= baseBand.starvation + 2, { armed: armedBand.starvation, base: baseBand.starvation });
check('cost bar median', armedBand.medianDays >= 0.8 * baseBand.medianDays, { armed: armedBand.medianDays, base: baseBand.medianDays });
check('summary costBar matches', summary.gates.costBar.starvationOk === (armedBand.starvation <= baseBand.starvation + 2) && summary.gates.costBar.medianOk === (armedBand.medianDays >= 0.8 * baseBand.medianDays));

// --- Knowledge totals, re-derived independently from census rows ---
const sumK = {};
for (const k of summary.perSeedKnowledge) sumK[k.seed] = k;
for (const seed of SEEDS) {
  const row = rows.find(r => r.policy === 'armed' && r.seed === seed);
  const census = (row.monsterknowledge && row.monsterknowledge.census) || [];
  const eDays = { E1: 0, E2: 0, E3: 0, E4: 0, E5: 0, E6: 0, E7: 0, none: 0 };
  const eDaysW4 = { E1: 0, E2: 0, E3: 0, E4: 0, E5: 0, E6: 0, E7: 0, none: 0 };
  const eEvents = { E1: 0, E2: 0, E3: 0, E4: 0, E5: 0, E6: 0, E7: 0 };
  let monsterDays = 0, monsterDaysW4 = 0, unclassified = 0, musterDays = 0, threatDays = 0, e1MovingDays = 0, e1MovingDaysW4 = 0;
  const gossipActions = {};
  for (let ci = 0; ci < census.length; ci++) {
    const c = census[ci];
    const next = census[ci + 1] || null;
    for (const g of (c.gossip || [])) gossipActions[g.action || 'null'] = (gossipActions[g.action || 'null'] || 0) + 1;
    if (c.mustered) musterDays++;
    if (c.threat) threatDays++;
    const dayE4 = !!(c.mustered && c.threat);
    for (const m of (c.monsters || [])) {
      monsterDays++;
      const isW4 = (m.wave | 0) === 4;
      if (isW4) monsterDaysW4++;
      if (m.tx == null || m.ty == null || !m.type) unclassified++;
      const has = { E1: false, E2: false, E3: false, E4: dayE4, E5: false, E6: false, E7: false };
      let e1MovingDay = false;
      if (dayE4) eEvents.E4++;
      for (const rid of Object.keys(c.objectives || {})) {
        const o = c.objectives[rid];
        if (o.tx != null && o.ty != null && o.tx === m.tx && o.ty === m.ty) {
          has.E1 = true; eEvents.E1++;
          if (next) {
            const n0 = (c.nodes || {})[rid], n1 = (next.nodes || {})[rid];
            if (n0 && n1 && (n0[0] !== n1[0] || n0[1] !== n1[1])) {
              const d0 = cheb(n0[0], n0[1], m.tx, m.ty);
              const d1same = cheb(n1[0], n1[1], m.tx, m.ty);
              let d1next = d1same;
              const nm = (next.monsters || []).find(x => x.seq === m.seq && x.seq != null) || (next.monsters || []).find(x => x.type === m.type);
              if (nm) d1next = cheb(n1[0], n1[1], nm.tx, nm.ty);
              if ((d1same < d0) || (d1next < d0)) e1MovingDay = true;
            }
          }
        }
      }
      for (const g of (c.gossip || [])) {
        if (m.type && String(g.dims || '').indexOf(m.type) !== -1) { has.E2 = true; eEvents.E2++; }
      }
      if ((c.codexMonsters && Object.prototype.hasOwnProperty.call(c.codexMonsters, m.type)) || (c.faced && Object.prototype.hasOwnProperty.call(c.faced, m.type))) { has.E3 = true; eEvents.E3++; }
      if (m.mapSeen) { has.E5 = true; eEvents.E5++; }
      for (const rid of Object.keys(c.nodes || {})) {
        if (!c.eligible || c.eligible[rid] !== true) continue;
        const n = c.nodes[rid];
        if (n && n[0] === m.tx && n[1] === m.ty && !m.onPlayerTile) { has.E6 = true; eEvents.E6++; break; }
      }
      if (m.onPlayerTile) { has.E7 = true; eEvents.E7++; }
      if (e1MovingDay) { e1MovingDays++; if (isW4) e1MovingDaysW4++; }
      let any = false;
      for (const k of ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']) if (has[k]) { eDays[k]++; if (isW4) eDaysW4[k]++; any = true; }
      if (!any) { eDays.none++; if (isW4) eDaysW4.none++; }
    }
  }
  const sk = sumK[seed];
  check(`know seed ${seed} monsterDays`, sk.monsterDays === monsterDays, { summary: sk.monsterDays, rederived: monsterDays });
  check(`know seed ${seed} monsterDaysW4`, sk.monsterDaysW4 === monsterDaysW4, { summary: sk.monsterDaysW4, rederived: monsterDaysW4 });
  check(`know seed ${seed} eDays`, JSON.stringify(sk.eDays) === JSON.stringify(eDays), { summary: sk.eDays, rederived: eDays });
  check(`know seed ${seed} eDaysW4`, JSON.stringify(sk.eDaysW4) === JSON.stringify(eDaysW4), { summary: sk.eDaysW4, rederived: eDaysW4 });
  check(`know seed ${seed} eEvents`, JSON.stringify(sk.eEvents) === JSON.stringify(eEvents), { summary: sk.eEvents, rederived: eEvents });
  check(`know seed ${seed} unclassified=0`, sk.unclassified === 0 && unclassified === 0, { summary: sk.unclassified, rederived: unclassified });
  check(`know seed ${seed} scanComplete`, sk.scanComplete === true, { scanComplete: sk.scanComplete });
  check(`know seed ${seed} mk errs=0`, (sk.mkErrs | 0) === 0, { mkErrs: sk.mkErrs });
  check(`know seed ${seed} gossipActions match`, JSON.stringify(sk.gossipActions) === JSON.stringify(gossipActions), { summary: sk.gossipActions, rederived: gossipActions });
  check(`know seed ${seed} muster/threat days`, sk.musterDays === musterDays && sk.threatDays === threatDays, { summary: [sk.musterDays, sk.threatDays], rederived: [musterDays, threatDays] });
  check(`know seed ${seed} e1MovingDays`, sk.e1MovingDays === e1MovingDays && sk.e1MovingDaysW4 === e1MovingDaysW4, { summary: [sk.e1MovingDays, sk.e1MovingDaysW4], rederived: [e1MovingDays, e1MovingDaysW4] });
  // E1 detail sanity: every recorded E1 detail row must be a real
  // objective-target match on its day (spot re-derivation, not a
  // recount — the recount above already covers the totals).
  // NOTE (instrument): census day is scholar day, not run-day ordinal —
  // scholar day stalls at run start (days 2 and 4 each appear twice on
  // 73672/73673), so a detail row is matched by (day + vid + kind +
  // target), never by day alone.
  const matchRow = (d) => census.find(x => x.day === d.day && x.objectives[d.vid] && x.objectives[d.vid].kind === d.kind && x.objectives[d.vid].tx === d.tx && x.objectives[d.vid].ty === d.ty) || null;
  for (const d of (sk.e1Detail || [])) {
    const c = matchRow(d);
    const o = c && c.objectives[d.vid];
    check(`know seed ${seed} E1 detail d${d.day} ${d.vid} real match`, !!(o && o.tx === d.tx && o.ty === d.ty && o.kind === d.kind), { detail: d, objective: o || null });
  }
  // Moving-toward sanity: a detail row flagged moving must have a
  // changed node on the next census day.
  for (const d of (sk.e1Detail || []).filter(x => x.movingToward)) {
    const ci = census.findIndex(x => x.day === d.day && x.objectives[d.vid] && x.objectives[d.vid].kind === d.kind && x.objectives[d.vid].tx === d.tx && x.objectives[d.vid].ty === d.ty);
    const c = census[ci], nx = census[ci + 1];
    const moved = !!(c && nx && c.nodes[d.vid] && nx.nodes[d.vid] && (c.nodes[d.vid][0] !== nx.nodes[d.vid][0] || c.nodes[d.vid][1] !== nx.nodes[d.vid][1]));
    check(`know seed ${seed} E1 moving d${d.day} ${d.vid} node changed`, moved, { detail: d });
  }
}
check('summary scanComplete band', summary.knowledge.scanComplete === true, { scanComplete: summary.knowledge.scanComplete });
check('summary bandUnclassified=0', summary.knowledge.bandUnclassified === 0, { bandUnclassified: summary.knowledge.bandUnclassified });
check('summary machineGo matches components',
  summary.knowledge.machineGo === (summary.knowledge.scanComplete && summary.gates.g2Pass && summary.gates.corpusOk && summary.gates.costBar.starvationOk && summary.gates.costBar.medianOk));

// --- Citation checks: each inventory citation symbol exists in its file ---
const CITATIONS = [
  ['src/js/villager-objectives.js', 'objPick'],
  ['src/js/villager-objectives.js', 'objMaybeDepart'],
  ['src/js/villager-objectives.js', 'objAwayStep'],
  ['src/js/villager-objectives.js', 'objVisitTarget'],
  ['src/js/villager-mapmem.js', 'mapmemHaulCandidate'],
  ['src/js/villager-mapmem.js', 'mapmemHaulSites'],
  ['src/js/villager-agency.js', 'startExpedition'],
  ['src/js/villager-agency.js', 'expeditionMonster'],
  ['src/js/game.js', 'seedGossip'],
  ['src/js/game.js', 'monsterKnown'],
  ['src/js/waveLedger.js', 'monsterCounterKnown'],
  ['src/js/game.js', 'villagerMonsterTick'],
  ['src/js/game.js', 'wanderWorldMonsters'],
  ['src/js/game.js', 'worldTick'],
  ['src/js/game.js', 'playerMonster'],
  ['src/js/game.js', 'resolveWildMonsterEncounter'],
  ['src/js/game.js', 'compareMaps'],
  ['src/js/game.js', 'villageMapKnown'],
  ['src/js/game.js', 'mapSeen'],
  ['src/js/game.js', 'markSeen'],
  ['src/js/shelter.js', 'shelterThreatNearHaven'],
  ['src/js/shelter.js', 'shelterMusterCheck'],
  ['src/js/shelter.js', 'isSheltered'],
  ['src/js/havenGrowth.js', 'lingeringRaiders'],
  ['src/js/titans.js', 'Scouts correct their map'],
  ['src/js/finale-campaign.js', 'Scouts found the broadcast tower'],
  ['src/js/perceive.js', 'perceptionHints'],
  ['src/js/convoTopics.js', 'muster'],
  ['src/js/convo-wants.js', 'sightingNews'],
];
for (const [file, sym] of CITATIONS) {
  let ok = false;
  try { ok = fs.readFileSync(path.join(REPO, file), 'utf8').indexOf(sym) !== -1; } catch (e) { ok = false; }
  check(`citation ${file} contains ${sym}`, ok);
}
// Absence checks: no objPick branch reads worldMonsters; no
// worldMonsters reader feeds objPick/objMaybeDepart/objAwayStep.
{
  const objSrc = fs.readFileSync(path.join(REPO, 'src/js/villager-objectives.js'), 'utf8');
  check('absence: villager-objectives.js never calls worldMonsters', objSrc.indexOf('worldMonsters') === -1);
  const mapmemSrc = fs.readFileSync(path.join(REPO, 'src/js/villager-mapmem.js'), 'utf8');
  check('absence: villager-mapmem.js never calls worldMonsters', mapmemSrc.indexOf('worldMonsters') === -1);
  const agencySrc = fs.readFileSync(path.join(REPO, 'src/js/villager-agency.js'), 'utf8');
  check('absence: villager-agency.js never calls worldMonsters', agencySrc.indexOf('worldMonsters') === -1);
}

console.log(`\n=== test-monsterknowledge-a: ${pass} PASS, ${fail} FAIL ===`);
if (fail) process.exit(1);
