#!/usr/bin/env node
// analyze-journey-succession-r50-20261026.js — verdict table for succession r49.
// Reads evidence/2026-10-26/journey-succession-r50-<seed>.stdout.json (5 seeds:
// 26041-26042 day-5 regime, 26043-26045 mature regime) and prints: V1 vouch
// verdicts (mature seeds first), C1v2 call + convo-window coverage, C1v3
// transition-rule coverage, MG2v2 meal-line verdicts, A1v2 armor holder
// identity, the writer-site spike (trust moves vs same-day deed calls),
// over-cause, E1b mover-naming cross-tab, A1 armor transitions (bark counts
// per location per snapshot, gains/losses, UNACCOUNTED windows), S1
// bearer-own delta, M3v2b / M1 / M4 / MG2 / chain causes, and the transcript
// inventory for the people check. No game state is touched; this only reads
// run output.
// Usage: node scripts/analyze-journey-succession-r50-20261026.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-26');
const SEEDS = [26051, 26052, 26053, 26054, 26055];
const ARMOR_LOCS = ['scholarPack', 'scholarWorn', 'scholarPrepStash', 'pantry',
  'livingWorn', 'livingPack', 'deadWorn', 'deadPack', 'corpses', 'stashed'];
const recs = [];
for (const s of SEEDS) {
  const f = path.join(EVID, `journey-succession-r50-${s}.stdout.json`);
  if (!fs.existsSync(f)) { console.log(`SEED ${s}: MISSING ${f}`); continue; }
  recs.push(JSON.parse(fs.readFileSync(f, 'utf8')));
}
console.log('== REGIMES ==');
for (const r of recs) {
  console.log(`seed ${r.seed}: scripted=${r.death && r.death.scripted} deathDay=${r.death && r.death.day} cause=${r.death && r.death.cause} ${r.death && r.death.oldFirst} -> ${r.death && r.death.newFirst} trustMantle=${r.death && r.death.newTrust}`);
}
console.log('\n== V1 VOUCH SNAPSHOT (mature seeds first: eligibleAtDeath > 0) ==');
const byElig = [...recs].sort((a, b) => ((b.vouch45 && b.vouch45.eligibleAtDeath || []).length - (a.vouch45 && a.vouch45.eligibleAtDeath || []).length));
for (const r of byElig) {
  const v = r.vouch45 || {};
  console.log(`seed ${r.seed}: rule=${v.rule} verdict=${v.verdict} eligibleAtDeath=${JSON.stringify(v.eligibleAtDeath)} alivePostDeath=${JSON.stringify(v.alivePostDeath)} diedBetween=${JSON.stringify(v.diedBetween)} vouchLines=${v.vouchLines}`);
}
console.log('\n== C1v2 CALL + CONVO-WINDOW ATTRIBUTION ==');
for (const r of recs) {
  const cc = r.callCheck || {};
  const calls = r.officeCallMoves || [];
  const cw = r.convoWindowMoves || [];
  console.log(`seed ${r.seed}: callCheck ok=${cc.ok} dailyMoveDays=${cc.dailyMoveDays} callMoveDays=${cc.callMoveDays} convoWindowDays=${cc.convoWindowDays} convoCoveredDays=${JSON.stringify(cc.convoCoveredDays)} missing=${JSON.stringify(cc.missingDays)}`);
  for (const m of cw) {
    console.log(`    CONVO-WINDOW d${m.day} d+${m.dplus} ${m.bearerBefore}->${m.bearerAfter} ${m.from}->${m.to} (${m.delta >= 0 ? '+' : ''}${m.delta}) convoLines=${(m.convoLines || []).length}`);
    for (const ln of (m.convoLines || []).slice(0, 4)) console.log(`      | ${ln.slice(0, 160)}`);
  }
}
console.log('\n== S1 BEARER-OWN DELTA (carried) ==');
for (const r of recs) {
  const calls = r.officeCallMoves || [];
  const tm = calls.filter(m => !m.bearerChanged);
  const solo = tm.filter(m => m.soloOffice);
  const single = tm.filter(m => (m.movers || []).length === 1);
  const singleBearer = single.filter(m => m.bearerIsMover);
  const singleOther = single.filter(m => !m.bearerIsMover);
  const badSolo = solo.filter(m => Math.abs(m.delta) > 2);
  const missing = tm.filter(m => typeof m.bearerDeltaExact !== 'number');
  console.log(`seed ${r.seed}: trustMoves=${tm.length} soloOffice=${solo.length} soloDeltas=${JSON.stringify(solo.map(m => m.delta))} badSolo(|d|>2)=${badSolo.length} missingExact=${missing.length}`);
  console.log(`  single-mover: bearer=${singleBearer.length} other=${singleOther.length} (other-mover singles: ${JSON.stringify(singleOther.slice(0, 6).map(m => ({ day: m.day, delta: m.delta, movers: m.movers })))} )`);
}
console.log('\n== E1b MOVER-NAMING CROSS-TAB (r48) ==');
for (const r of recs) {
  const tm = (r.officeCallMoves || []).filter(m => !m.bearerChanged);
  const cls = (m) => {
    const n = (m.movers || []).length;
    if (n === 0) return 'solo';
    if (n === 1) return 'single';
    const tot = (m.movers || []).reduce((a, x) => a + Math.abs(x.delta), 0);
    const top = Math.max(...(m.movers || []).map(x => Math.abs(x.delta)));
    return (tot > 0 && top / tot >= 0.5) ? 'concentrated' : 'diffuse';
  };
  const tab = {};
  for (const m of tm) { const k = cls(m) + '|' + (m.e1bClass || '?'); tab[k] = (tab[k] || 0) + 1; }
  console.log(`seed ${r.seed}: ${JSON.stringify(tab)}`);
  const diffuse = tm.filter(m => cls(m) === 'diffuse');
  console.log(`  diffuse moves: ${diffuse.length}, of which mover-named=${diffuse.filter(m => m.e1bClass === 'mover-named').length} unnamed=${diffuse.filter(m => m.e1bClass === 'unnamed').length}`);
  const conc = tm.filter(m => cls(m) === 'concentrated' || cls(m) === 'single');
  console.log(`  concentrated+single moves: ${conc.length}, of which mover-named=${conc.filter(m => m.e1bClass === 'mover-named').length} unnamed=${conc.filter(m => m.e1bClass === 'unnamed').length}`);
  const topNamed = tm.filter(m => m.topMoverNamed === true).length;
  const topUnnamed = tm.filter(m => m.topMoverNamed === false).length;
  console.log(`  top-mover named: ${topNamed}, top-mover unnamed: ${topUnnamed} (of ${tm.length} trust moves)`);
  for (const m of tm.slice(0, 12)) {
    console.log(`    d${m.day} d+${m.dplus} ${m.from}->${m.to} (${m.delta >= 0 ? '+' : ''}${m.delta}) movers=${JSON.stringify((m.movers || []).map(x => x.id + ':' + x.delta))} named=${JSON.stringify(m.moverNamedMovers)} topNamed=${m.topMoverNamed} e1b=${m.e1bClass} oldEvent=${m.eventClass}`);
  }
}
console.log('\n== E1 EVENT-VS-DEED (carried for continuity) ==');
for (const r of recs) {
  const tm = (r.officeCallMoves || []).filter(m => !m.bearerChanged);
  const ec = { 'event-only': 0, 'deed-only': 0, both: 0, neither: 0 };
  for (const m of tm) if (ec[m.eventClass] !== undefined) ec[m.eventClass]++;
  console.log(`seed ${r.seed}: ${JSON.stringify(ec)}`);
}
console.log('\n== A1 ARMOR INTRADAY MAPS (bark_armor counts per location) ==');
for (const r of recs) {
  const maps = r.armorMaps || [];
  console.log(`seed ${r.seed}: ${maps.length} snapshots`);
  let prev = null;
  for (const a of maps) {
    const b = a.map.bark || {};
    const counts = {};
    let total = 0;
    for (const l of ARMOR_LOCS) { counts[l] = (b[l] || []).length; total += counts[l]; }
    const locs = a.map.locs || {};
    let armorTotal = 0;
    for (const l of ARMOR_LOCS) armorTotal += (locs[l] || []).length;
    let deltaNote = '';
    if (prev) {
      const gains = [], losses = [];
      for (const l of ARMOR_LOCS) {
        const d = counts[l] - (prev.counts[l] || 0);
        if (d > 0) gains.push(`${l}+${d}`);
        if (d < 0) losses.push(`${l}${d}`);
      }
      const totD = total - prev.total;
      if (totD !== 0 || gains.length || losses.length) deltaNote = ` | bark total ${prev.total}->${total} gains[${gains.join(',')}] losses[${losses.join(',')}]` + (totD < 0 ? '  <-- UNACCOUNTED DROP' : totD > 0 ? '  <-- UNACCOUNTED GAIN' : '');
    }
    console.log(`  ${a.at} d${a.day}: barkTotal=${total} armorTotal=${armorTotal} ${JSON.stringify(counts)}${deltaNote}`);
    prev = { counts, total };
  }
  // Full armor (non-bark) detail on the post-handoff snapshot, if any.
  const ph = maps.find(a => a.at === 'post-handoff');
  if (ph) {
    const locs = ph.map.locs || {};
    const nonBark = {};
    for (const l of ARMOR_LOCS) nonBark[l] = (locs[l] || []).filter(id => id !== 'bark_armor');
    console.log(`  post-handoff non-bark armor: ${JSON.stringify(nonBark)}`);
  }
}
console.log('\n== C1v3 TRANSITION RULE (r49) ==');
for (const r of recs) {
  const v3 = r.callCheckV3 || {};
  console.log(`seed ${r.seed}: transitions=${v3.transitions} byCall=${v3.coveredByCall} byConvoPrev=${v3.coveredByConvoPrev} missing=${JSON.stringify(v3.missing)} ok=${v3.ok}`);
}
console.log('\n== MG2v2 MEAL-LINE ONLY (r49) ==');
for (const r of recs) {
  console.log(`seed ${r.seed}: mg2(old)=${r.mg2} (viol=${(r.mealGateViolations || []).length}) mg2v2=${r.mg2v2} (violMeal=${(r.mealGateViolationsMeal || []).length}) auditDays=${(r.mealAudit || []).length}`);
  for (const mv of (r.mealGateViolationsMeal || []).slice(0, 4)) console.log(`  MEAL-VIOL d+${mv.dplus}: ${mv.vid} trust=${mv.trust} kcal=${mv.kcal}`);
}
console.log('\n== A1v2 ARMOR HOLDER IDENTITY (r49) ==');
for (const r of recs) {
  const maps = r.armorMaps || [];
  const pre = maps.find(a => a.at === 'pre-death');
  const ph = maps.find(a => a.at === 'post-handoff');
  const show = (label, a) => {
    if (!a) { console.log(`seed ${r.seed} ${label}: (no snapshot)`); return; }
    const m = a.map || {};
    console.log(`seed ${r.seed} ${label} d${a.day}: barkHolders=${JSON.stringify(m.barkHolders || {})} barkCorpse=${JSON.stringify(m.barkCorpseHolders || {})} focusAccess=${JSON.stringify(m.focusAccess || null)}`);
  };
  show('pre-death', pre);
  show('post-handoff', ph);
  if (pre && ph) {
    const preB = pre.map.barkHolders || {}, phB = ph.map.barkHolders || {};
    const preC = pre.map.barkCorpseHolders || {}, phC = ph.map.barkCorpseHolders || {};
    const tot = (o) => Object.values(o).reduce((a, x) => a + (typeof x === 'number' ? x : (x.worn || 0) + (x.pack || 0)), 0);
    console.log(`  bark holder totals pre=${tot(preB)}+corpse${tot(preC)} post=${tot(phB)}+corpse${tot(phC)}`);
  }
}
console.log('\n== WRITER-SITE SPIKE (r49, exploratory) ==');
for (const r of recs) {
  const deedsByDay = {};
  for (const d of (r.deedLedger || [])) (deedsByDay[d.day] = deedsByDay[d.day] || []).push(d.deed);
  const tm = (r.officeCallMoves || []).filter(m => !m.bearerChanged);
  const withDeed = tm.filter(m => (deedsByDay[m.day] || []).length > 0);
  const noDeed = tm.filter(m => (deedsByDay[m.day] || []).length === 0);
  const deedNames = {};
  for (const m of withDeed) for (const dn of (deedsByDay[m.day] || [])) deedNames[dn] = (deedNames[dn] || 0) + 1;
  console.log(`seed ${r.seed}: trustMoves=${tm.length} withSameDayDeed=${withDeed.length} noSameDayDeed=${noDeed.length} deedNames=${JSON.stringify(deedNames)}`);
  for (const m of noDeed.slice(0, 6)) console.log(`  NO-DEED d${m.day} d+${m.dplus} ${m.from}->${m.to} (${m.delta >= 0 ? '+' : ''}${m.delta}) movers=${JSON.stringify((m.movers || []).map(x => x.id + ':' + x.delta))}`);
}
console.log('\n== W1 MUTATION-SITE CLASSIFICATION (r50) ==');
// Classify each C1v3 daily transition (officeDaily consecutive pairs) by
// its covering call/convo window: bump-explained (>=1 bump entry for the
// bearer or a mover in the window), deed-explained (deedLedger entry on
// the entry day, no bump), direct-candidate (mover, no bump entry in the
// window), unexplained (solo, no bump, no deed). W1b: bump share among
// the r49-style no-deed transitions.
for (const r of recs) {
  const daily = r.officeDaily || [];
  const callByDay = {};
  for (const m of (r.officeCallMoves || [])) (callByDay[m.day] = callByDay[m.day] || []).push(m);
  const convoByDay = {};
  for (const m of (r.convoWindowMoves || [])) (convoByDay[m.day] = convoByDay[m.day] || []).push(m);
  const deedDays = new Set((r.deedLedger || []).map(d => d.day));
  const handoffDays = new Set((r.officeCallMoves || []).filter(m => m.bearerChanged).map(m => m.day));
  const classes = { bump: 0, deed: 0, direct: 0, handoff: 0, unexplained: 0 };
  const noDeed = { total: 0, bump: 0 };
  const details = [];
  for (let i = 1; i < daily.length; i++) {
    if (daily[i].office === daily[i - 1].office) continue;
    const entryDay = daily[i].day, prevDay = daily[i - 1].day;
    const cover = ((callByDay[entryDay] || []).filter(m => !m.bearerChanged)[0])
      || ((convoByDay[prevDay] || [])[0]) || null;
    const bearer = daily[i].bearer;
    let cls = 'unexplained';
    let bumpWhy = [], moverIds = [];
    if (cover) {
      const bumps = cover.bumpEntries || [];
      moverIds = (cover.movers || []).map(x => x.id);
      const relevant = bumps.filter(b => b.vid === bearer || moverIds.includes(b.vid));
      bumpWhy = relevant.map(b => `${b.vid}:${b.delta}${b.reason ? '(' + b.reason + ')' : '(no-reason)'}`);
      if (relevant.length > 0) cls = 'bump';
      else if (moverIds.length > 0) cls = 'direct';
      else if (deedDays.has(entryDay)) cls = 'deed';
      else cls = 'unexplained';
    } else if (handoffDays.has(entryDay)) cls = 'handoff';
    else if (deedDays.has(entryDay)) cls = 'deed';
    classes[cls]++;
    if (!deedDays.has(entryDay)) { noDeed.total++; if (cls === 'bump') noDeed.bump++; }
    if (cls === 'handoff') { /* handoffs are inheritance entries, not trust moves */ }
    details.push({ entryDay, prevDay, from: daily[i - 1].office, to: daily[i].office, delta: daily[i].office - daily[i - 1].office, cls, cover: cover ? (cover.bumpEntries ? 'call' : 'convo') : 'none', bumpWhy: bumpWhy.slice(0, 6), movers: moverIds });
  }
  const w1b = noDeed.total ? Math.round((noDeed.bump / noDeed.total) * 100) / 100 : null;
  const noDeedMoves = details.filter(d => d.cls !== 'handoff' && !(r.deedLedger || []).some(x => x.day === d.entryDay));
  const noDeedMovesBump = noDeedMoves.filter(d => d.cls === 'bump').length;
  const w1bMoves = noDeedMoves.length ? Math.round((noDeedMovesBump / noDeedMoves.length) * 100) / 100 : null;
  console.log(`seed ${r.seed}: transitions=${details.length} classes=${JSON.stringify(classes)} noDeed=${noDeed.total} noDeedBump=${noDeed.bump} W1b(strict, incl handoffs)=${w1b} W1b(trust-moves only)=${w1bMoves} (noDeedMoves=${noDeedMoves.length} bump=${noDeedMovesBump}) bumpLogTotal=${(r.bumpLog || []).length} bumpWithReason=${(r.bumpLog || []).filter(b => b.reason != null).length}`);
  for (const d of details) {
    if (d.cls !== 'bump') console.log(`  NON-BUMP entryD${d.entryDay} ${d.from}->${d.to} (${d.delta >= 0 ? '+' : ''}${d.delta}) cls=${d.cls} cover=${d.cover} movers=${JSON.stringify(d.movers)} bumpWhy=${JSON.stringify(d.bumpWhy)}`);
  }
  const reasonCounts = {};
  for (const b of (r.bumpLog || [])) { const k = b.reason || '(no-reason)'; reasonCounts[k] = (reasonCounts[k] || 0) + 1; }
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  console.log(`  bump reasons (top 12): ${JSON.stringify(topReasons)}`);
  const siteCounts = {};
  for (const b of (r.bumpLog || [])) { const k = b.site || '(no-site)'; siteCounts[k] = (siteCounts[k] || 0) + 1; }
  console.log(`  bump sites (top 8): ${JSON.stringify(Object.entries(siteCounts).sort((a, b) => b[1] - a[1]).slice(0, 8))}`);
}
console.log('\n== SOLO-CREEP LONG WINDOW (r50) ==');
for (const r of recs) {
  const deedDaysSolo = new Set((r.deedLedger || []).map(d => d.day));
  const solo = (r.officeCallMoves || []).filter(m => !m.bearerChanged && m.soloOffice);
  const wins = { '1-10': { n: 0, sum: 0 }, '11-20': { n: 0, sum: 0 }, '21-30': { n: 0, sum: 0 }, '31-45': { n: 0, sum: 0 }, '46+': { n: 0, sum: 0 } };
  for (const m of solo) {
    const dp = m.dplus;
    const w = dp <= 10 ? '1-10' : dp <= 20 ? '11-20' : dp <= 30 ? '21-30' : dp <= 45 ? '31-45' : '46+';
    wins[w].n++; wins[w].sum += m.delta;
  }
  const tot = solo.reduce((a, m) => a + m.delta, 0);
  const bumpSolo = solo.filter(m => (m.bumpEntries || []).some(b => b.vid === m.bearerAfter));
  console.log(`seed ${r.seed}: soloCount=${solo.length} soloCumDelta=${tot} windows=${JSON.stringify(wins)} soloWithBearerBump=${bumpSolo.length}/${solo.length}`);
  for (const m of solo.slice(0, 20)) {
    const bb = (m.bumpEntries || []).filter(b => b.vid === m.bearerAfter).map(b => `${b.delta}${b.reason ? '(' + b.reason + ')' : ''}`);
    console.log(`  SOLO d${m.day} d+${m.dplus} ${m.from}->${m.to} (${m.delta >= 0 ? '+' : ''}${m.delta}) bearerDeltaExact=${m.bearerDeltaExact} bearerBumps=${JSON.stringify(bb.slice(0, 4))} deedThatDay=${deedDaysSolo.has(m.day)}`);
  }
}
console.log('\n== OVER-CAUSE (r49) ==');
for (const r of recs) {
  const oc = r.overCause || {};
  console.log(`seed ${r.seed}: over=${oc.over} villageLost=${oc.villageLost} won=${oc.won} alive=${oc.alive} pantryEnd=${oc.pantryEnd}`);
  for (const ln of (oc.lastSay || [])) console.log(`  | ${ln.slice(0, 200)}`);
}
console.log('\n== BINDING METRICS ==');
for (const r of recs) {
  const f = r.funeral || {};
  console.log(`seed ${r.seed}: M3v2=${f.echoV2} M3v2b=${f.echoV2b} (bar >=2, excludedLoot=${f.echoV2bExcluded}) M1=${r.m1} M4=${r.m4} MG2=${r.mg2} (viol=${(r.mealGateViolations || []).length}) MG2v2=${r.mg2v2} (violMeal=${(r.mealGateViolationsMeal || []).length}) C1v3ok=${r.callCheckV3 && r.callCheckV3.ok} overCause=${r.overCause ? r.overCause.over : 'missing'} chainDeaths=${(r.chainDeaths || []).length} chainKnown=${(r.chainDeaths || []).filter(c => c.causeKnown).length} identityTrips=${(r.identityTrips || []).length} dayAdv=${r.dayAdv}`);
}
console.log('\n== TRANSCRIPTS (people check inventory) ==');
const tx = fs.readdirSync(EVID).filter(n => n.startsWith('journey-succession-r50-transcript-'));
console.log(`${tx.length} transcripts`);
for (const t of tx.sort()) console.log('  ' + t);
console.log('\n== VILLAGE END STATE ==');
for (const r of recs) {
  const last = (r.ledger || [])[(r.ledger || []).length - 1] || {};
  console.log(`seed ${r.seed}: ${r.death ? r.death.oldFirst + ' -> ' + r.death.newFirst : 'no death'} d${r.death ? r.death.day : '?'} trustMantle=${r.death ? r.death.newTrust : '?'} officeEnd=${r.trustVerdict ? r.trustVerdict.officeLast : '?'} villageMeanEnd=${r.trustVerdict ? r.trustVerdict.villageLast : '?'} pantryEnd=${r.pantryEnd} ledgerAlive=${last.alive} ledgerPantry=${last.pantryKcal}`);
}
