#!/usr/bin/env node
// analyze-linkdissolve-b.js — attribution + verdict for sim-linkdissolve-b.
//
// Reads evidence/2026-10-20/perseed-linkdissolve-b/{armed,control}-{leadfeast,belongfeast}.json
// and, per paired run:
//   1. attributes every post-court realm-dissolution event to named cause
//      classes (PRIMARY GO gate: >=80% attributed, 0 unexplained);
//   2. judges the trim->upkeep secondary (S1 dose Pearson >= 0.6 on paired
//      deltas; S2 upkeep-driven class shift armed vs control);
//   3. prints wall numbers + the per-pair ledger.
//
// Cause classes (pre-registered): trust-below-bar, arrears-bar,
// link-broken, primary-realm-shrank, mercy-expired. Proximate mechanism
// note classes: upkeep {arrears,tribute,tended,pool,tariff}, leader-death
// {succession}, conquest-strain {revolt,sabotage}, crisis/demand
// {crisis,demand,call}, renegotiation {renegotiation}, break {broken}.
//
// Usage: node scripts/analyze-linkdissolve-b.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || 'evidence/2026-10-20/perseed-linkdissolve-b';
const FILES = {
  'leadfeast': ['control-leadfeast.json', 'armed-leadfeast.json'],
  'belongfeast': ['control-belongfeast.json', 'armed-belongfeast.json'],
};

function load(f) { return JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); }

// link array layout: [id, kind, other, trust, arrears, status, age, trib, conq, dir]
const I = { id: 0, kind: 1, other: 2, trust: 3, arrears: 4, status: 5, age: 6, trib: 7, conq: 8, dir: 9 };

function seasonedLink(l) {
  return l[I.status] === 'active' && l[I.age] >= 30 && (l[I.trust] >= 40 || l[I.conq] === 1);
}

// court-day polity links for a road, from a linkTraj entry's link array.
function courtPolityLinks(road, links, day) {
  if (road === 'lead' || road === 'conquest') {
    return links.filter(l => l[I.dir] === 'P' && seasonedLink(l));
  }
  if (road === 'belong') {
    return links.filter(l => l[I.dir] === 'S' && l[I.status] === 'active' &&
      l[I.trust] >= 50 && l[I.arrears] === 0 && l[I.age] >= 14);
  }
  if (road === 'covenant') {
    return links.filter(l => l[I.dir] === 'C' && seasonedLink(l));
  }
  if (road === 'trade') {
    return links.filter(l => l[I.dir] === 'T' && seasonedLink(l));
  }
  return [];
}

// traj entry at or just before day.
function trajAt(traj, day) {
  let best = null;
  for (const t of traj) { if (t.d <= day) best = t; else break; }
  return best;
}

function notesInWindow(linkHist, linkId, fromDay, toDay) {
  const h = (linkHist || []).find(x => x.id === linkId);
  if (!h) return [];
  return (h.history || []).filter(n => n.day > fromDay && n.day <= toDay).map(n => n.kind);
}

const UPKEEP_NOTES = new Set(['arrears', 'tribute', 'tended', 'pool', 'tariff']);

function attributeDissolution(row, ev) {
  const dz = row.dissolve;
  const courtT = trajAt(dz.linkTraj, ev.courtDay);
  if (!courtT) return { attributed: false, reason: 'no-court-traj', dropouts: [] };
  const cLinks = courtPolityLinks(ev.road, courtT.links, ev.courtDay);
  // mercy/grace-hold detection: engine said polity at court but our bars say none
  const mercyHold = cLinks.length === 0 && courtT.eng !== '' && courtT.eng !== null;
  const dropouts = [];
  for (const cl of cLinks) {
    const dl = (ev.links || []).find(l => l[I.id] === cl[I.id]);
    if (!dl) { dropouts.push({ id: cl[I.id], other: cl[I.other], barFail: 'link-vanished', trustDrop: cl[I.trust] }); continue; }
    const notes = notesInWindow(dz.linkHist, cl[I.id], ev.courtDay, ev.day);
    const upkeepNoted = notes.some(k => UPKEEP_NOTES.has(k));
    const base = {
      id: cl[I.id], other: cl[I.other], kind: cl[I.kind], dir: cl[I.dir],
      courtTrust: cl[I.trust], dissTrust: dl[I.trust],
      trustDrop: cl[I.trust] - dl[I.trust],
      courtArrears: cl[I.arrears], dissArrears: dl[I.arrears],
      notes, upkeepNoted,
    };
    if (ev.road === 'belong') {
      // BELONG: the single Haven-subordinate link carries the road — a
      // still-good link whose polity failed names the primary's realm.
      let barFail;
      if (dl[I.status] !== 'active') barFail = 'link-broken';
      else if (dl[I.trust] < 50) barFail = 'trust-below-bar';
      else if (dl[I.arrears] > 0) barFail = 'arrears-bar';
      else barFail = 'primary-realm-shrank';
      dropouts.push(Object.assign(base, { barFail }));
    } else {
      // LEAD/COVENANT/TRADE: the polity is a COUNT of seasoned links —
      // only links that fell below the bar are dropouts; still-seasoned
      // links are not failures, there are just too few of them left.
      if (seasonedLink(dl)) continue;
      const barFail = dl[I.status] !== 'active' ? 'link-broken' : 'trust-below-bar';
      dropouts.push(Object.assign(base, { barFail }));
    }
  }
  if (mercyHold) {
    return {
      attributed: true, reason: 'mercy-hold', dropouts: [],
      primary: { barFail: 'mercy-expired', notes: [], upkeepNoted: false },
    };
  }
  const namedFails = new Set(['trust-below-bar', 'arrears-bar', 'link-broken', 'primary-realm-shrank', 'link-vanished', 'mercy-expired']);
  const unexplained = dropouts.filter(d => !namedFails.has(d.barFail));
  // primary = largest trust drop among named dropouts
  const named = dropouts.filter(d => namedFails.has(d.barFail));
  named.sort((a, b) => b.trustDrop - a.trustDrop);
  const primary = named[0] || null;
  return {
    attributed: unexplained.length === 0 && dropouts.length > 0,
    reason: unexplained.length ? 'unexplained:' + unexplained.map(d => d.barFail).join(',') : (dropouts.length ? 'ok' : 'no-dropouts'),
    dropouts, primary,
    upkeepDriven: !!primary && (primary.barFail === 'arrears-bar' ||
      (primary.barFail === 'trust-below-bar' && primary.upkeepNoted)),
  };
}

// post-court upkeep gaps (kcal) for a run.
function upkeepGaps(row) {
  const dz = row.dissolve;
  if (!dz) return { gapKcal: 0, tendGap: 0, tribGap: 0, poolGap: 0, skipWeeks: 0 };
  const courtDay = row.nationalDay || 0;
  const endDay = row.days || 0;
  // index upkeep calls by week+link
  const callsByWeekLink = {};
  for (const c of (dz.upkeepCalls || [])) {
    if (c.d < courtDay) continue;
    const w = Math.floor(c.d / 7);
    const k = w + '|' + c.ch + '|' + c.link;
    callsByWeekLink[k] = (callsByWeekLink[k] || 0) + c.paid;
  }
  const firstWeek = Math.floor(courtDay / 7), lastWeek = Math.floor(Math.max(courtDay, endDay - 1) / 7);
  let tendGap = 0, tribGap = 0, poolGap = 0, skipWeeks = 0;
  for (let w = firstWeek; w <= lastWeek; w++) {
    const t = trajAt(dz.linkTraj, Math.min(w * 7 + 6, endDay));
    if (!t) continue;
    const pLinks = t.links.filter(l => l[I.dir] === 'P' && l[I.status] === 'active');
    const sLinks = t.links.filter(l => l[I.dir] === 'S' && l[I.status] === 'active');
    const weekPantry = t.pantry;
    // tend: 1500/week per HOME-primary link
    for (const l of pLinks) {
      const paid = callsByWeekLink[w + '|tend|' + l[I.id]] || 0;
      tendGap += Math.max(0, 1500 - paid);
      if (paid === 0 && weekPantry < 20000) skipWeeks++;
    }
    // tribute (belong): owed/week on the Haven-subordinate link
    for (const l of sLinks) {
      const owed = l[I.trib] || 0;
      if (!owed) continue;
      const paid = callsByWeekLink[w + '|tribute|' + l[I.id]] || 0;
      tribGap += Math.max(0, owed - paid);
      if (paid === 0 && weekPantry < 2 * owed) skipWeeks++;
    }
    // pool: 2000/week while any covenant link poolLive — approximate via
    // upkeepDay pool payments on covenant-shaped runs
    const dayPaid = [0, 1, 2, 3, 4, 5, 6].reduce((s, dd) => {
      const m = dz.upkeepDay[w * 7 + dd]; return s + (m && m.pool ? m.pool : 0);
    }, 0);
    const hasCov = t.links.some(l => l[I.dir] === 'C' && l[I.status] === 'active');
    if (hasCov && (t.eng === 'covenant' || (dz.upkeepDay[w * 7] || {}).pool)) {
      poolGap += Math.max(0, 2000 - dayPaid);
    }
  }
  return { gapKcal: tendGap + tribGap + poolGap, tendGap, tribGap, poolGap, skipWeeks };
}

function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return NaN;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return (sxx > 0 && syy > 0) ? sxy / Math.sqrt(sxx * syy) : NaN;
}

function main() {
  const pairs = [];
  for (const policy of Object.keys(FILES)) {
    const c = load(FILES[policy][0]), a = load(FILES[policy][1]);
    for (let i = 0; i < c.rows.length; i++) {
      pairs.push({ policy, seed: c.rows[i].seed, control: c.rows[i], armed: a.rows[i] });
    }
  }
  console.log(`pairs: ${pairs.length}`);

  // ---- per-pair ledger ----
  console.log('\nseed policy | court(c/a) | diss(c/a) | trimK | gapK(c/a) | primary cause (armed)');
  let events = [], unexplained = 0, attributed = 0;
  const s1x = [], s1y = [];
  let armedDiss = 0, controlDiss = 0, armedUpkeepDriven = 0, controlUpkeepDriven = 0;
  for (const p of pairs) {
    const cg = upkeepGaps(p.control), ag = upkeepGaps(p.armed);
    const trimK = Math.round(((p.armed.sfeed || {}).trimKcal || 0) / 1000);
    s1x.push((p.armed.sfeed || {}).trimKcal || 0);
    s1y.push(ag.gapKcal - cg.gapKcal);
    const cD = (p.control.dissolve.dissolutions || []).length;
    const aD = (p.armed.dissolve.dissolutions || []).length;
    controlDiss += cD > 0 ? 1 : 0; armedDiss += aD > 0 ? 1 : 0;
    let aPrimary = '-';
    for (const ev of (p.armed.dissolve.dissolutions || [])) {
      const at = attributeDissolution(p.armed, ev);
      events.push({ seed: p.seed, policy: p.policy, arm: 'armed', ev, at });
      if (at.attributed) attributed++; else unexplained++;
      if (at.upkeepDriven) armedUpkeepDriven++;
      if (at.primary) aPrimary = `${at.primary.barFail}${at.primary.upkeepNoted ? '+upkeep' : ''}(${at.primary.other} ${at.primary.courtTrust}->${at.primary.dissTrust})`;
      else aPrimary = at.reason;
    }
    for (const ev of (p.control.dissolve.dissolutions || [])) {
      const at = attributeDissolution(p.control, ev);
      events.push({ seed: p.seed, policy: p.policy, arm: 'control', ev, at });
      if (at.attributed) attributed++; else unexplained++;
      if (at.upkeepDriven) controlUpkeepDriven++;
    }
    console.log(`${p.seed} ${p.policy.slice(0, 4)} | ${p.control.nationalDay}/${p.armed.nationalDay} | ${cD}/${aD} | ${trimK}k | ${Math.round(cg.gapKcal / 1000)}k/${Math.round(ag.gapKcal / 1000)}k | ${aPrimary}`);
  }

  // ---- honesty: polity agreement across the corpus ----
  let agreeN = 0, agreeBad = 0;
  for (const p of pairs) for (const row of [p.control, p.armed]) {
    agreeN += row.dissolve.agreeN || 0;
    agreeBad += row.dissolve.agreeBad || 0;
  }
  console.log(`\nHONESTY — polity agreement (instrument vs engine _havenPolity): ${agreeN - agreeBad}/${agreeN} dawn samples`);
  if (agreeBad > 0) console.log('  WARNING: agreement misses — bar replication diverges from the engine; attribution suspect');

  // ---- PRIMARY: attribution completeness ----
  const nEv = events.length;
  const attrShare = nEv ? attributed / nEv : NaN;
  console.log(`\nPRIMARY — dissolution events: ${nEv}, attributed: ${attributed}, unexplained: ${unexplained}`);
  console.log(`attribution share: ${isNaN(attrShare) ? 'n/a' : attrShare.toFixed(3)} (bar >= 0.80), unexplained == 0: ${unexplained === 0}`);
  console.log(`PRIMARY VERDICT: ${(attrShare >= 0.8 && unexplained === 0) ? 'GO' : 'NO-GO'}`);
  for (const e of events.filter(e => !e.at.attributed)) {
    console.log(`  UNATTRIBUTED seed=${e.seed} ${e.policy}/${e.arm} day=${e.ev.day} road=${e.ev.road}: ${e.at.reason}`);
    for (const d of (e.at.dropouts || [])) console.log(`    dropout ${d.other} barFail=${d.barFail} trust ${d.courtTrust}->${d.dissTrust} notes=[${d.notes.join(',')}]`);
  }

  // ---- SECONDARY S1: dose ----
  const r = pearson(s1x, s1y);
  console.log(`\nS1 — Pearson(trimKcal_armed, upkeepGap_armed-control): ${isNaN(r) ? 'n/a' : r.toFixed(3)} (bar >= 0.6)`);
  // ---- SECONDARY S2: class shift ----
  console.log(`S2 — upkeep-driven primary cause: armed ${armedUpkeepDriven}/${armedDiss} dissolved runs, control ${controlUpkeepDriven}/${controlDiss}`);
  console.log(`dissolved runs: armed ${armedDiss}/16, control ${controlDiss}/16`);

  // ---- cause-class census ----
  const census = {};
  for (const e of events) {
    const k = (e.at.primary ? e.at.primary.barFail : 'none') + '/' + e.arm;
    census[k] = (census[k] || 0) + 1;
  }
  console.log('\ncause-class census (class/arm):');
  for (const k of Object.keys(census).sort()) console.log(`  ${k}: ${census[k]}`);

  // ---- per-event detail (evidence narrative) ----
  console.log('\ndissolution event detail:');
  for (const e of events) {
    const p = e.at.primary;
    console.log(`  ${e.seed} ${e.policy}/${e.arm} d${e.ev.day} road=${e.ev.road} courtD${e.ev.courtDay} pantry=${e.ev.pantry}: ${e.at.attributed ? 'ATTRIBUTED' : 'UNATTRIBUTED(' + e.at.reason + ')'}` +
      (p ? ` primary=${p.barFail} ${p.other} trust ${p.courtTrust}->${p.dissTrust} arrears ${p.courtArrears}->${p.dissArrears} notes=[${p.notes.join(',')}]` : ''));
    for (const d of (e.at.dropouts || []).filter(d => d !== p)) {
      console.log(`    also: ${d.barFail} ${d.other} trust ${d.courtTrust}->${d.dissTrust} notes=[${d.notes.join(',')}]`);
    }
  }

  // ---- wall numbers ----
  let won = 0, natEnd = 0, natEver = 0, table = 0, w4 = 0, w5 = 0;
  const surv = [], deathCauses = {};
  for (const p of pairs) for (const row of [p.control, p.armed]) {
    if (row.won) won++;
    if (row.national) natEnd++;
    if (row.nationalDay > 0) natEver++;
    if (row.table) table++;
    if (row.maxWave >= 4) w4++;
    if (row.maxWave >= 5) w5++;
    surv.push(row.days);
    deathCauses[row.endReason] = (deathCauses[row.endReason] || 0) + 1;
  }
  surv.sort((a, b) => a - b);
  console.log(`\nwall (32 runs): won ${won}/32, national end ${natEnd}/32, ever ${natEver}/32, table ${table}/32, wave4 ${w4}/32, wave5 ${w5}/32, median ${surv[Math.floor(surv.length / 2)]}d, max ${surv[surv.length - 1]}d`);
  console.log('death causes:', JSON.stringify(deathCauses));
}

if (require.main === module) main();
module.exports = { attributeDissolution, upkeepGaps, courtPolityLinks, pearson };