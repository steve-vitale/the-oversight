#!/usr/bin/env node
// analyze-journey-succession-r54-20261027.js — verdict table for succession r53.
// Reads evidence/2026-10-27/journey-succession-r54-<seed>.stdout.json (5 seeds:
// 26101-26102 day-5 regime, 26103-26105 mature regime) and prints: V1 vouch
// verdicts (mature seeds first), C1v2 call + convo-window coverage, C1v3
// transition-rule coverage, MG2v2 meal-line verdicts, A1v2 armor holder
// identity, the writer-site spike (trust moves vs same-day deed calls),
// over-cause, E1b mover-naming cross-tab, A1 armor transitions (bark counts
// per location per snapshot, gains/losses, UNACCOUNTED windows), S1
// bearer-own delta, M3v2b / M1 / M4 / MG2 / chain causes, and the transcript
// inventory for the people check. No game state is touched; this only reads
// run output.
// Usage: node scripts/analyze-journey-succession-r53-20261027.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-27');
const SEEDS = [26101, 26102, 26103, 26104, 26105];
const ARMOR_LOCS = ['scholarPack', 'scholarWorn', 'scholarPrepStash', 'pantry',
  'livingWorn', 'livingPack', 'deadWorn', 'deadPack', 'corpses', 'stashed'];
const recs = [];
for (const s of SEEDS) {
  const f = path.join(EVID, `journey-succession-r54-${s}.stdout.json`);
  if (!fs.existsSync(f)) { console.log(`SEED ${s}: MISSING ${f}`); continue; }
  recs.push(JSON.parse(fs.readFileSync(f, 'utf8')));
}
console.log('== REGIMES ==');
for (const r of recs) {
  console.log(`seed ${r.seed}: scripted=${r.death && r.death.scripted} deathDay=${r.death && r.death.day} cause=${r.death && r.death.cause} ${r.death && r.death.oldFirst} -> ${r.death && r.death.newFirst} trustMantle=${r.death && r.death.newTrust}`);
}

console.log('\n== INH SUCCESSOR INHERITANCE (r54 headline) ==');
function inhClass(r) {
  const inh = r.inh || {};
  const pre = inh.succPre || {};
  const post = inh.succPost || {};
  const ded = (a) => [...new Set(a || [])];
  const postInv = ded(((post.inv && post.inv.pack) || []).concat((post.inv && post.inv.worn) || []));
  const preInv = ded((pre.invPack || []).concat(pre.invWorn || []));
  const postPlants = post.codexPlants || [];
  const postSkills = post.codexSkills || [];
  const preHad = preInv.length > 0 || (pre.plantKnow || []).length > 0 || (pre.skills || []).length > 0;
  const keptInv = postInv.filter(x => preInv.includes(x)).length;
  const kept = (inh.keptPlants || []).length + (inh.keptSkills || []).length + keptInv;
  const got = (inh.inheritedPlants || []).length + (inh.inheritedSkills || []).length + (inh.transferredIds || []).length;
  if (!inh.readable) return 'unreadable';
  if (postInv.length === 0 && postPlants.length === 0 && postSkills.length === 0 && preHad) return 'blank/reset';
  if (got > 0 && kept === 0) return 'inherited';
  if (kept > 0 && got === 0) return 'own-life';
  return 'mixed';
}
for (const r of recs) {
  const inh = r.inh || {};
  const pre = inh.succPre || {};
  const post = inh.succPost || {};
  const d = r.death || {};
  const ded2 = (a) => [...new Set(a || [])];
  const postInv = ded2(((post.inv && post.inv.pack) || []).concat((post.inv && post.inv.worn) || []));
  const preInv = ded2((pre.invPack || []).concat(pre.invWorn || []));
  console.log(`seed ${r.seed}: class=${inhClass(r)} readable=${!!inh.readable} scripted=${!!inh.scripted} ${d.oldFirst} -> ${d.newFirst}`);
  console.log(`  succPre: pack=${JSON.stringify(ded2(pre.invPack))} worn=${JSON.stringify(ded2(pre.invWorn))} plants=${JSON.stringify(pre.plantKnow || [])} skills=${JSON.stringify(pre.skills || [])} abilities=${JSON.stringify(pre.abilities || [])} trust=${pre.trust}`);
  if (r.inhCorpse) console.log(`  bearerCorpse@handoff: found=${r.inhCorpse.found} items=${JSON.stringify(r.inhCorpse.items || [])}`);
  if (r.inhCorpseD3) console.log(`  bearerCorpse@d+3: found=${r.inhCorpseD3.found} items=${JSON.stringify(r.inhCorpseD3.items || [])}`);
  console.log(`  succPost: inv=${JSON.stringify(postInv)} plants=${JSON.stringify(post.codexPlants || [])} skills=${JSON.stringify(post.codexSkills || [])} abilities=${JSON.stringify(post.abilities || [])} trust=${post.trust}`);
  if (inh.deadBearerPre) {
    const db = inh.deadBearerPre;
    console.log(`  deadPre: inv=${JSON.stringify(db.inv.pack.concat(db.inv.worn))} plants=${JSON.stringify(db.codexPlants)} skills=${JSON.stringify(db.codexSkills)} abilities=${JSON.stringify(db.abilities)} trust=${db.trust}`);
    console.log(`  deadPre sentimental flags: ${JSON.stringify(db.sentimental || {})}`);
  } else console.log('  deadPre: null (organic path — dead-bearer side unavailable)');
  console.log(`  keptPlants=${JSON.stringify(inh.keptPlants || [])} inheritedPlants=${JSON.stringify(inh.inheritedPlants || [])} keptSkills=${JSON.stringify(inh.keptSkills || [])} inheritedSkills=${JSON.stringify(inh.inheritedSkills || [])}`);
  console.log(`  disposition@handoff: transferred=${JSON.stringify(inh.transferredIds || [])} vanished=${JSON.stringify(inh.vanishedIds || [])} distinct=${inh.deadPreDistinctN}`);
  if (r.inhD3) {
    const d3 = r.inhD3;
    console.log(`  disposition@d+${d3.dplus}: transferred=${JSON.stringify(d3.disposition.filter(x => x.presentSuccessor).map(x => x.id))} vanished=${JSON.stringify(d3.disposition.filter(x => x.vanished).map(x => x.id))}`);
    for (const x of d3.disposition) console.log(`    ${x.id}: preN=${x.preN} succ=${x.succPackN + x.succWornN} corpse=${x.corpseN} pantry=${x.pantryN} living=${x.livingPackN + x.livingWornN} prep=${x.prepStashN} stashed=${x.stashedN} vanished=${x.vanished}`);
  }
  console.log(`  parity: equal=${r.parity && r.parity.equal} inheritedAbilities=${JSON.stringify((r.parity && r.parity.inherited) || [])}`);
}
console.log('\n== INH POOLED ==');
{
  const cls = {};
  for (const r of recs) cls[inhClass(r)] = (cls[inhClass(r)] || 0) + 1;
  console.log(`classes: ${JSON.stringify(cls)}`);
  const scr = recs.filter(r => r.inh && r.inh.scripted);
  const vanAll = [];
  for (const r of recs) for (const id of (r.inh && r.inh.vanishedIds) || []) vanAll.push(`${r.seed}:${id}`);
  const vanD3 = [];
  for (const r of recs) if (r.inhD3) for (const x of r.inhD3.disposition.filter(y => y.vanished)) vanD3.push(`${r.seed}:${x.id}`);
  console.log(`scripted seeds with full dead-bearer side: ${scr.length}/${recs.length}`);
  console.log(`vanished@handoff: ${vanAll.length ? vanAll.join(', ') : 'none'}`);
  console.log(`vanished@d+3: ${vanD3.length ? vanD3.join(', ') : 'none'}`);
}

console.log('\n== V1 VOUCH SNAPSHOT (mature seeds first: eligibleAtDeath > 0) ==');
const byElig = [...recs].sort((a, b) => ((b.vouch45 && b.vouch45.eligibleAtDeath || []).length - (a.vouch45 && a.vouch45.eligibleAtDeath || []).length));
for (const r of byElig) {
  const v = r.vouch45 || {};
  console.log(`seed ${r.seed}: rule=${v.rule} verdict=${v.verdict} eligibleAtDeath=${JSON.stringify(v.eligibleAtDeath)} alivePostDeath=${JSON.stringify(v.alivePostDeath)} diedBetween=${JSON.stringify(v.diedBetween)} vouchLines=${v.vouchLines}`);
}
console.log('\n== C1v2 (DROPPED r51 — r50 was its final run; C1v3 below is the transition rule) ==');
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

console.log('\n== W1d DONATION-JOIN (r53: TIGHTENED subset binds, POOLED headline) ==');
let poolTight = 0, poolTightDon = 0;
// Recompute each C1v3 daily transition with a direct donation join: the
// covering call's own donationLines (Donated X. Trust +N voice). Single
// label with donation precedence; overlap bump∩donation counted separately.
// r51 subset: r50 direct, or solo-office on a deed day (deed-day solo) —
// reported for continuity. TIGHTENED subset (binds): r50 direct, or
// solo-office with r50 class deed — the r51 26065 artifact (bump-classified
// but sitting on a deed day) is excluded by the deed-class requirement.
for (const r of recs) {
  const daily = r.officeDaily || [];
  const callByDay = {};
  for (const m of (r.officeCallMoves || [])) (callByDay[m.day] = callByDay[m.day] || []).push(m);
  const convoByDay = {};
  for (const m of (r.convoWindowMoves || [])) (convoByDay[m.day] = convoByDay[m.day] || []).push(m);
  const deedDays = new Set((r.deedLedger || []).map(d => d.day));
  const handoffDays = new Set((r.officeCallMoves || []).filter(m => m.bearerChanged).map(m => m.day));
  const labels = { donation: 0, bump: 0, deed: 0, direct: 0, handoff: 0, unexplained: 0 };
  let overlap = 0, subsetTotal = 0, subsetDonation = 0;
  let tightTotal = 0, tightDonation = 0;
  const subsetDetail = [];
  for (let i = 1; i < daily.length; i++) {
    if (daily[i].office === daily[i - 1].office) continue;
    const entryDay = daily[i].day, prevDay = daily[i - 1].day;
    const cover = ((callByDay[entryDay] || []).filter(m => !m.bearerChanged)[0])
      || ((convoByDay[prevDay] || [])[0]) || null;
    const bearer = daily[i].bearer;
    const bumps = (cover && cover.bumpEntries) || [];
    const moverIds = (cover && cover.movers || []).map(x => x.id);
    const hasBump = bumps.some(b => b.vid === bearer || moverIds.includes(b.vid));
    const hasDonation = ((cover && cover.donationLines) || []).length > 0;
    let r50cls = 'unexplained';
    if (cover) {
      if (hasBump) r50cls = 'bump';
      else if (moverIds.length > 0) r50cls = 'direct';
      else if (deedDays.has(entryDay)) r50cls = 'deed';
      else r50cls = 'unexplained';
    } else if (handoffDays.has(entryDay)) r50cls = 'handoff';
    else if (deedDays.has(entryDay)) r50cls = 'deed';
    const isSoloDeedDay = cover && cover.soloOffice && deedDays.has(entryDay);
    const inSubset = (r50cls === 'direct') || isSoloDeedDay;
    const inTight = (r50cls === 'direct') || (cover && cover.soloOffice && r50cls === 'deed');
    if (hasBump && hasDonation) overlap++;
    const label = hasDonation ? 'donation' : r50cls;
    labels[label]++;
    if (inSubset) {
      subsetTotal++;
      if (hasDonation) subsetDonation++;
      subsetDetail.push({ entryDay, from: daily[i - 1].office, to: daily[i].office, r50cls, hasDonation, donationLines: ((cover && cover.donationLines) || []).slice(0, 2) });
    }
    if (inTight) {
      tightTotal++; poolTight++;
      if (hasDonation) { tightDonation++; poolTightDon++; }
    }
  }
  const w1d = subsetTotal ? Math.round((subsetDonation / subsetTotal) * 100) / 100 : null;
  const w1dTight = tightTotal ? Math.round((tightDonation / tightTotal) * 100) / 100 : null;
  console.log(`seed ${r.seed}: transitions labels=${JSON.stringify(labels)} bump∩donation=${overlap} r51-subset(direct+deed-day-solo)=${subsetTotal} subsetWithDonation=${subsetDonation} W1d(r51)=${w1d} TIGHTENED(direct+deed-class-solo)=${tightTotal} tightWithDonation=${tightDonation} W1d-tight(BINDS)=${w1dTight}`);
  for (const d of subsetDetail) console.log(`  SUBSET entryD${d.entryDay} ${d.from}->${d.to} r50=${d.r50cls} donation=${d.hasDonation} lines=${JSON.stringify(d.donationLines)}`);
}
console.log(`POOLED W1d-tight: ${poolTightDon}/${poolTight} = ${poolTight ? Math.round((poolTightDon / poolTight) * 100) / 100 : 'n/a (empty subset band)'}`);
console.log('\n== DEED-THIN (r51, exploratory) ==');
// Post-death deeds vs pantry level on the deed day (nearest officeDaily
// entry on or before the deed day; thin < 15000 kcal). Also deeds d+1–10
// vs d+11–45, and the pantry trajectory per seed.
for (const r of recs) {
  const daily = (r.officeDaily || []).filter(d => typeof d.pantryKcal === 'number');
  const deathDay = (r.death && r.death.day) || 0;
  const byBand = { thin: 0, fed: 0, unknown: 0 };
  const byWindow = { 'd+1-10': 0, 'd+11-45': 0, 'other': 0 };
  const deedRows = [];
  for (const d of (r.deedLedger || [])) {
    let pantry = null, dp = d.day - deathDay;
    let best = null;
    for (const od of daily) if (od.day <= d.day && (!best || od.day > best.day)) best = od;
    if (best) pantry = best.pantryKcal;
    const band = pantry == null ? 'unknown' : (pantry < 15000 ? 'thin' : 'fed');
    byBand[band]++;
    const win = dp >= 1 && dp <= 10 ? 'd+1-10' : (dp >= 11 && dp <= 45 ? 'd+11-45' : 'other');
    byWindow[win]++;
    deedRows.push({ day: d.day, dplus: dp, deed: d.deed, pantry, band });
  }
  const pans = daily.map(d => d.pantryKcal);
  const traj = pans.length ? `first=${pans[0]} min=${Math.min(...pans)} last=${pans[pans.length - 1]}` : 'no-pantry-daily';
  console.log(`seed ${r.seed}: deeds=${(r.deedLedger || []).length} byBand=${JSON.stringify(byBand)} byWindow=${JSON.stringify(byWindow)} pantryTrajectory(${traj}) pantryEnd=${r.pantryEnd}`);
  for (const row of deedRows.slice(0, 30)) console.log(`  DEED d${row.day} d+${row.dplus} ${row.deed} pantry=${row.pantry} band=${row.band}`);
}
console.log('\n== DEED-TRIGGER (r52, finding bar) ==');
// Contrast deed days vs no-deed days on the five gates, per seed, from
// deedContext snapshots. A gate is "closed" on a day when: teachablePairs
// === 0 (nothing to teach), kcalGateOpen === false (policy holds surplus),
// hallGated === true (donations blocked), packKcal === 0 (nothing to give).
// For teachPlant deeds, targetKnowsBefore === true would mean a redundant
// lesson; for donate deeds, kcalGateOpen === false at call time would mean
// the policy donated below its own gate (a policy-behavior finding).
for (const r of recs) {
  const ctx = r.deedContext || [];
  const deedDays = new Set((r.deedLedger || []).map(d => d.day));
  const split = (arr) => {
    if (!arr.length) return 'n/a';
    const nums = arr.filter(x => typeof x === 'number');
    if (!nums.length) return 'n/a';
    const mean = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 10) / 10;
    return `mean=${mean} min=${Math.min(...nums)} max=${Math.max(...nums)} n=${nums.length}`;
  };
  const deedCtx = ctx.filter(c => deedDays.has(c.day));
  const noDeedCtx = ctx.filter(c => !deedDays.has(c.day));
  const share = (arr, pred) => arr.length ? Math.round(arr.filter(pred).length / arr.length * 100) / 100 : null;
  console.log(`seed ${r.seed}: deedContextDays=${ctx.length} deedDays=${deedCtx.length} noDeedDays=${noDeedCtx.length} totalDeeds=${(r.deedLedger || []).length}`);
  console.log(`  DEED days: teachablePairs[${split(deedCtx.map(c => c.teachablePairs))}] kcalGateOpen=${share(deedCtx, c => c.kcalGateOpen === true)} hallGated=${share(deedCtx, c => c.hallGated === true)} packKcal[${split(deedCtx.map(c => c.packKcal))}] pantry[${split(deedCtx.map(c => c.pantryKcal))}]`);
  console.log(`  NO-DEED days: teachablePairs[${split(noDeedCtx.map(c => c.teachablePairs))}] kcalGateOpen=${share(noDeedCtx, c => c.kcalGateOpen === true)} hallGated=${share(noDeedCtx, c => c.hallGated === true)} packKcal[${split(noDeedCtx.map(c => c.packKcal))}] pantry[${split(noDeedCtx.map(c => c.pantryKcal))}]`);
  console.log(`  NO-DEED closed-gate shares: teachablePairs=0:${share(noDeedCtx, c => c.teachablePairs === 0)} kcalGateClosed:${share(noDeedCtx, c => c.kcalGateOpen === false)} hallGated:${share(noDeedCtx, c => c.hallGated === true)} packEmpty:${share(noDeedCtx, c => c.packKcal === 0)}`);
  const byDeed = {};
  for (const d of (r.deedLedger || [])) {
    const b = (byDeed[d.deed] = byDeed[d.deed] || { calls: 0, args: {}, targetKnowsTrue: 0, targetKnowsFalse: 0, kcalGateOpen: 0, kcalGateClosed: 0, hallGated: 0 });
    b.calls++;
    const a = JSON.stringify((d.argsJson || []).slice(0, 2));
    b.args[a] = (b.args[a] || 0) + 1;
    if (d.deed === 'teachPlant') {
      if (d.targetKnowsBefore === true) b.targetKnowsTrue++;
      else if (d.targetKnowsBefore === false) b.targetKnowsFalse++;
    }
    if (d.deed === 'donateToPantry') {
      if (d.kcalGateOpen === true) b.kcalGateOpen++;
      else if (d.kcalGateOpen === false) b.kcalGateClosed++;
      if (d.hallGated === true) b.hallGated++;
    }
  }
  for (const k of Object.keys(byDeed)) console.log(`  DEED ${k}: ${JSON.stringify(byDeed[k])}`);
  if ((r.deedLedger || []).length === 0) {
    console.log(`  ZERO-DEED seed: closed-gate verdict — teachablePairs=0 on ${share(noDeedCtx, c => c.teachablePairs === 0)} of days, kcalGateClosed on ${share(noDeedCtx, c => c.kcalGateOpen === false)}, hallGated on ${share(noDeedCtx, c => c.hallGated === true)}, packEmpty on ${share(noDeedCtx, c => c.packKcal === 0)}`);
  }
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
console.log('\\n== DEED-CALLER (r53, finding bar) ==');
// Path classifier on the r53 caller instrument. site = first post-wrapper
// frame; stackHead = first 4 post-wrapper frames (function names kept).
// haul-donate: donateSurplus called via donateHaul (forage-haul path).
// gated-donate: donateSurplus with NO donateHaul frame (daily gated call,
// maxTransfers 1). haul-teach: haulTeachingMoment via learnFromShowing.
// teachRound: the policy's own lesson loop. convo-talk: talk functions.
function deedPath(d) {
  const head = (d.stackHead || []).join(' ');
  const raw = (d.siteRaw || '') + ' ' + head;
  if (/teachRound/.test(raw)) return 'teachRound';
  if (/haulTeachingMoment/.test(head)) return 'haul-teach';
  if (/learnFromShowing/.test(head)) return 'showing-teach';
  if (/donateHaul/.test(head)) return 'haul-donate';
  if (/donateSurplus/.test(head)) return 'gated-donate';
  if (/holdConversation|talkRound|deepTalk/.test(raw)) return 'convo-talk';
  return 'other:' + (d.site || 'no-site');
}
let bandTeachNew = 0, bandTeachKnown = 0, bandTeachNull = 0;
for (const r of recs) {
  const deeds = r.deedLedger || [];
  const byPath = {};
  for (const d of deeds) { const k = d.deed + ':' + deedPath(d); byPath[k] = (byPath[k] || 0) + 1; }
  console.log(`seed ${r.seed}: deeds=${deeds.length} byPath=${JSON.stringify(byPath)}`);
  const teach = deeds.filter(d => d.deed === 'teachPlant');
  const tk = { true: 0, false: 0, null: 0 };
  for (const d of teach) tk[d.targetKnowsBefore === true ? 'true' : d.targetKnowsBefore === false ? 'false' : 'null']++;
  bandTeachNew += tk.false; bandTeachKnown += tk.true; bandTeachNull += tk.null;
  console.log(`  teachPlant: total=${teach.length} knowsBefore true=${tk.true} FALSE(new)=${tk.false} null=${tk.null}`);
  for (const d of teach.filter(d => d.targetKnowsBefore === false)) console.log(`  TEACH-NEW d${d.day} vid=${d.vid} path=${deedPath(d)} site=${d.site}`);
  // Per-day path census: deedContext days joined to that day's deeds by path.
  const deedsByDay = {};
  for (const d of deeds) (deedsByDay[d.day] = deedsByDay[d.day] || []).push(d);
  const ctxDays = r.deedContext || [];
  // Census on DISTINCT days: deedContext can repeat a calendar day (a
  // runDays call advancing 0 day-parts) and skip others (2-day advances),
  // so counting per ctx entry double-counts deeds on repeated days
  // (26082: 19 entry-count vs 15 distinct deed days). Death-day (d+0)
  // deeds and post-window deeds are outside the census by design.
  const ctxDaySet = new Set(ctxDays.map(c => c.day));
  const deedDays = Object.keys(deedsByDay).map(Number).filter(d => ctxDaySet.has(d));
  const noDeedDays = [...ctxDaySet].filter(d => !(deedsByDay[d] || []).length);
  const pathDays = {};
  for (const d of deedDays) for (const dd of deedsByDay[d]) pathDays[deedPath(dd)] = (pathDays[deedPath(dd)] || 0) + 1;
  console.log(`  census days: deedDays=${deedDays.length} noDeedDays=${noDeedDays.length} deedsByPathOnDeedDays=${JSON.stringify(pathDays)}`);
  const unmapped = deeds.filter(d => deedPath(d).startsWith('other:'));
  if (unmapped.length) console.log(`  UNMAPPED deeds=${unmapped.length}: ${JSON.stringify(unmapped.slice(0, 5).map(d => ({ deed: d.deed, site: d.site, head: (d.stackHead || []).slice(0, 2) })))}`);
}
console.log(`BAND TEACH-NEW: targetKnowsBefore=false total=${bandTeachNew} (known=${bandTeachKnown} null=${bandTeachNull})`);
console.log('\\n== STAGING RATE (r53: mature regime is an aspiration, not a guarantee) ==');
const young = recs.filter(r => SEEDS.indexOf(r.seed) < 2);
const mature = recs.filter(r => SEEDS.indexOf(r.seed) >= 2);
const rate = (xs) => `${xs.filter(r => r.death && r.death.scripted).length}/${xs.length} scripted (organic ${xs.filter(r => r.death && !r.death.scripted).length})`;
console.log(`young (day-5): ${rate(young)}; mature (day-40 aspiration): ${rate(mature)}`);
for (const r of recs) console.log(`seed ${r.seed}: scripted=${r.death && r.death.scripted} deathDay=${r.death && r.death.day}`);
console.log('\\n== BINDING METRICS ==');
for (const r of recs) {
  const f = r.funeral || {};
  console.log(`seed ${r.seed}: M3v2=${f.echoV2} M3v2b=${f.echoV2b} (bar >=2, excludedLoot=${f.echoV2bExcluded}) M1=${r.m1} M4=${r.m4} MG2=${r.mg2} (viol=${(r.mealGateViolations || []).length}) MG2v2=${r.mg2v2} (violMeal=${(r.mealGateViolationsMeal || []).length}) C1v3ok=${r.callCheckV3 && r.callCheckV3.ok} overCause=${r.overCause ? r.overCause.over : 'missing'} chainDeaths=${(r.chainDeaths || []).length} chainKnown=${(r.chainDeaths || []).filter(c => c.causeKnown).length} identityTrips=${(r.identityTrips || []).length} dayAdv=${r.dayAdv}`);
}
console.log('\n== TRANSCRIPTS (people check inventory) ==');
const tx = fs.readdirSync(EVID).filter(n => n.startsWith('journey-succession-r53-transcript-'));
console.log(`${tx.length} transcripts`);
for (const t of tx.sort()) console.log('  ' + t);
console.log('\n== VILLAGE END STATE ==');
for (const r of recs) {
  const last = (r.ledger || [])[(r.ledger || []).length - 1] || {};
  console.log(`seed ${r.seed}: ${r.death ? r.death.oldFirst + ' -> ' + r.death.newFirst : 'no death'} d${r.death ? r.death.day : '?'} trustMantle=${r.death ? r.death.newTrust : '?'} officeEnd=${r.trustVerdict ? r.trustVerdict.officeLast : '?'} villageMeanEnd=${r.trustVerdict ? r.trustVerdict.villageLast : '?'} pantryEnd=${r.pantryEnd} ledgerAlive=${last.alive} ledgerPantry=${last.pantryKcal}`);
}
