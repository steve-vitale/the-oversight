#!/usr/bin/env node
// analyze-homecoming-diag-b.js — scholarHomecoming sub-channel decomposition
// analyzer (sim-homecoming-diag-b). Reads the per-seed corpus, prints the
// per-cell attribution table, the funnel.share engagement-ledger contrast,
// guardrails (watch), wall numbers, and the DIAG verdict.
//
// Exit 0 = DIAG-GO, exit 1 = DIAG-NO-GO, exit 2 = killed-at-pilot / corpus
// incomplete. Verdict classes per the pre-registered §14 bar:
//   DIAG-GO iff the scholarHomecoming channel is FULLY attributed per cell
//   (sub-channels named, which throttle under PD=1 and which don't), the
//   engagement-ledger contrast with the funnel.share throttle is drawn,
//   and there are 0 unexplained cells.
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-23', 'perseed-homecoming-diag-b');
const CELLS = ['pd0dg0', 'pd0dg1', 'pd1dg0', 'pd1dg1'];
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = [];
for (let s = 92801; s <= 92816; s++) SEEDS.push(s);

const med = xs => { const s = xs.filter(x => x != null).slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const r0 = x => x == null ? null : Math.round(x);

function load(cell, policy) {
  const rows = [];
  const missing = [];
  for (const s of SEEDS) {
    const p = path.join(CORPUS, `homecoming-diag-b-${cell}-${policy}-s${s}.json`);
    if (!fs.existsSync(p)) { missing.push(s); continue; }
    try { rows.push(JSON.parse(fs.readFileSync(p, 'utf8'))); }
    catch (e) { missing.push(s + '!'); }
  }
  return { rows, missing };
}

function cellStats(rows) {
  const g = k => rows.map(r => r.extra.hc[k]);
  const e = k => rows.map(r => r.extra[k]);
  const hc = r => r.extra.hc;
  return {
    n: rows.length,
    glutDays: med(e('glutDays')),
    // scholarHomecoming sub-channels per glut-day
    deposit: med(g('depositPerGlutDay')),
    brought: med(g('broughtPerGlutDay')),
    kept: med(g('keptPerGlutDay')),
    keepRaise: med(g('keepRaisePerGlutDay')),
    decisions: med(g('decisionsPerGlutDay')),
    broughtPerDecision: med(rows.map(r => r.extra.hc.broughtPerDecision)),
    depositPerDecision: med(rows.map(r => r.extra.hc.depositPerDecision)),
    spoiled: med(rows.map(r => (r.extra.hc.spoiled || 0) / Math.max(1, r.extra.glutDays))),
    capStranded: med(rows.map(r => (r.extra.hc.capStranded || 0) / Math.max(1, r.extra.glutDays))),
    keepRaiseEvents: med(rows.map(r => r.extra.hc.keepRaiseEvents)),
    capDecisions: med(rows.map(r => r.extra.hc.capDecisions)),
    oldDecisions: med(rows.map(r => r.extra.hc.oldDecisions)),
    // funnel.share contrast (engagement ledgers)
    funnelShare: med(e('funnelSharePerGlutDay')),
    depriKcal: med(e('depriKcalPerGlutDay')),
    funnelShareEased: med(e('funnelShareEasedPerGlutDay')),
    easedKcal: med(rows.map(r => (r.easedKcal || 0) / Math.max(1, r.extra.glutDays))),
    // consumption context
    packEaten: med(rows.map(r => (r.extra.scholarPackEaten || 0) / Math.max(1, r.daysAlive))),
    pantryDrawn: med(rows.map(r => (r.extra.scholarPantryDrawn || 0) / Math.max(1, r.daysAlive))),
    trips: med(e('policyTrips')),
    donatedKcal: med(e('policyDonatedKcal')),
    // channel + attribution
    channel: med(rows.map(r => r.glutChannels.scholarHomecoming / Math.max(1, r.extra.glutDays))),
    attribution: med(e('attribution')),
    // guardrails / wall
    survival: med(rows.map(r => r.daysAlive)),
    starveDeaths: rows.reduce((t, r) => t + (r.extra.starveDeaths || 0), 0),
    villageDays: rows.reduce((t, r) => t + (r.villageDays || 0), 0),
    national: rows.reduce((t, r) => t + (r.national || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    win: rows.reduce((t, r) => t + (r.win || 0), 0),
    wave4: rows.reduce((t, r) => t + (r.extra.wave4 || 0), 0),
    wave5: rows.reduce((t, r) => t + (r.extra.wave5 || 0), 0),
    freshDays: med(rows.map(r => r.freshDaysMedian)),
    rot100d: med(e('rot100d')),
    deathFams: rows.map(r => Object.keys(r.deathCauses || {})),
  };
}

const report = { cells: {}, verdict: null, unexplained: [] };
let corpusOk = true;

for (const policy of POLICIES) {
  for (const dg of ['dg0', 'dg1']) {
    const c0 = 'pd0' + dg, c1 = 'pd1' + dg;
    const l0 = load(c0, policy), l1 = load(c1, policy);
    if (l0.missing.length || l1.missing.length) {
      console.log(`CORPUS INCOMPLETE ${policy}/${dg}: missing ${c0}=[${l0.missing}] ${c1}=[${l1.missing}]`);
      corpusOk = false;
    }
    const s0 = cellStats(l0.rows), s1 = cellStats(l1.rows);
    const D = (a, b) => (a == null || b == null) ? null : r0(b - a);
    const key = `${policy}/${dg}`;
    report.cells[key] = {
      n: [s0.n, s1.n],
      pd0: { deposit: r0(s0.deposit), brought: r0(s0.brought), kept: r0(s0.kept), keepRaise: r0(s0.keepRaise), decisions: s0.decisions, broughtPerDecision: r0(s0.broughtPerDecision), depositPerDecision: r0(s0.depositPerDecision), spoiled: r0(s0.spoiled), capStranded: r0(s0.capStranded), keepRaiseEvents: s0.keepRaiseEvents, glutDays: r0(s0.glutDays), channel: r0(s0.channel), attribution: s0.attribution },
      pd1: { deposit: r0(s1.deposit), brought: r0(s1.brought), kept: r0(s1.kept), keepRaise: r0(s1.keepRaise), decisions: s1.decisions, broughtPerDecision: r0(s1.broughtPerDecision), depositPerDecision: r0(s1.depositPerDecision), spoiled: r0(s1.spoiled), capStranded: r0(s1.capStranded), keepRaiseEvents: s1.keepRaiseEvents, glutDays: r0(s1.glutDays), channel: r0(s1.channel), attribution: s1.attribution },
      delta: { deposit: D(s0.deposit, s1.deposit), brought: D(s0.brought, s1.brought), kept: D(s0.kept, s1.kept), keepRaise: D(s0.keepRaise, s1.keepRaise), decisions: (s0.decisions != null && s1.decisions != null) ? +((s1.decisions - s0.decisions).toFixed(3)) : null, broughtPerDecision: D(s0.broughtPerDecision, s1.broughtPerDecision), depositPerDecision: D(s0.depositPerDecision, s1.depositPerDecision), glutDays: D(s0.glutDays, s1.glutDays) },
      // identity: deposit Δ should equal brought Δ − kept Δ − spoiled Δ (medians; tolerance for median-of-deltas)
      identity: { lhs: D(s0.deposit, s1.deposit), rhs: D(s0.brought, s1.brought) - D(s0.kept, s1.kept) - D(s0.spoiled, s1.spoiled) },
      // funnel.share engagement-ledger contrast
      funnel: {
        pd0: { share: r0(s0.funnelShare), depri: r0(s0.depriKcal), eased: r0(s0.funnelShareEased) },
        pd1: { share: r0(s1.funnelShare), depri: r0(s1.depriKcal), eased: r0(s1.funnelShareEased) },
        dShare: D(s0.funnelShare, s1.funnelShare), dDepri: D(s0.depriKcal, s1.depriKcal), dEased: D(s0.funnelShareEased, s1.funnelShareEased),
      },
      consumption: {
        pd0: { packEaten: r0(s0.packEaten), pantryDrawn: r0(s0.pantryDrawn), trips: s0.trips, donatedKcal: s0.donatedKcal },
        pd1: { packEaten: r0(s1.packEaten), pantryDrawn: r0(s1.pantryDrawn), trips: s1.trips, donatedKcal: s1.donatedKcal },
      },
      wall: {
        pd0: { national: s0.national, table: s0.table, win: s0.win, wave4: s0.wave4, wave5: s0.wave5, survival: s0.survival, rot100d: r0(s0.rot100d), freshDays: s0.freshDays },
        pd1: { national: s1.national, table: s1.table, win: s1.win, wave4: s1.wave4, wave5: s1.wave5, survival: s1.survival, rot100d: r0(s1.rot100d), freshDays: s1.freshDays },
      },
    };
  }
}

if (!corpusOk) {
  console.log('killed-at-pilot: corpus incomplete');
  process.exit(2);
}

// ---- print the per-cell attribution table ----
console.log('# scholarHomecoming sub-channel decomposition (median kcal per glut-day, PD=0 -> PD=1)');
for (const key of Object.keys(report.cells)) {
  const c = report.cells[key];
  console.log(`\n## ${key} (n=${c.n[0]}/${c.n[1]})`);
  console.log(`deposit : ${c.pd0.deposit} -> ${c.pd1.deposit} (Δ ${c.delta.deposit})   [channel: ${c.pd0.channel} -> ${c.pd1.channel}]`);
  console.log(`brought : ${c.pd0.brought} -> ${c.pd1.brought} (Δ ${c.delta.brought})   [supply side]`);
  console.log(`kept    : ${c.pd0.kept} -> ${c.pd1.kept} (Δ ${c.delta.kept})`);
  console.log(`keepRaise: ${c.pd0.keepRaise} -> ${c.pd1.keepRaise} (Δ ${c.delta.keepRaise})   [DG-side throttle; events ${c.pd0.keepRaiseEvents} -> ${c.pd1.keepRaiseEvents}]`);
  console.log(`spoiled : ${c.pd0.spoiled} -> ${c.pd1.spoiled} | capStranded: ${c.pd0.capStranded} -> ${c.pd1.capStranded}`);
  console.log(`decisions/gd: ${c.pd0.decisions} -> ${c.pd1.decisions} (Δ ${c.delta.decisions}) | brought/decision: ${c.pd0.broughtPerDecision} -> ${c.pd1.broughtPerDecision} (Δ ${c.delta.broughtPerDecision})`);
  console.log(`identity: deposit Δ ${c.identity.lhs} vs brought-kept-spoiled Δ ${c.identity.rhs}`);
  console.log(`funnel.share contrast — share/gd Δ ${c.funnel.dShare} | PD-side depri/gd ${c.funnel.pd0.depri} -> ${c.funnel.pd1.depri} (Δ ${c.funnel.dDepri}) | DG-side eased/gd ${c.funnel.pd0.eased} -> ${c.funnel.pd1.eased} (Δ ${c.funnel.dEased})`);
  console.log(`consumption — packEaten/d ${c.consumption.pd0.packEaten} -> ${c.consumption.pd1.packEaten} | pantryDrawn/d ${c.consumption.pd0.pantryDrawn} -> ${c.consumption.pd1.pantryDrawn} | trips ${c.consumption.pd0.trips} -> ${c.consumption.pd1.trips} | donatedKcal ${c.consumption.pd0.donatedKcal} -> ${c.consumption.pd1.donatedKcal}`);
  console.log(`wall — national ${c.wall.pd0.national} -> ${c.wall.pd1.national} | table ${c.wall.pd0.table} -> ${c.wall.pd1.table} | win ${c.wall.pd0.win} -> ${c.wall.pd1.win} | wave4 ${c.wall.pd0.wave4} -> ${c.wall.pd1.wave4} | wave5 ${c.wall.pd0.wave5} -> ${c.wall.pd1.wave5} | surv ${c.wall.pd0.survival} -> ${c.wall.pd1.survival}d | rot100d ${c.wall.pd0.rot100d} -> ${c.wall.pd1.rot100d}`);
}

// ---- DIAG verdict ----
let unexplained = [];
for (const [key, c] of Object.entries(report.cells)) {
  const dg = key.endsWith('/dg1') ? 1 : 0;
  // (a) keepRaise must be 0 on DG=0 by construction
  if (dg === 0 && (c.pd0.keepRaise !== 0 || c.pd1.keepRaise !== 0)) unexplained.push(key + ': keepRaise nonzero on DG=0');
  // (b) identity: deposit Δ within 25% of the sub-channel sum (median-of-deltas tolerance)
  const lhs = c.identity.lhs, rhs = c.identity.rhs;
  if (lhs != null && rhs != null && Math.abs(lhs) > 50 && Math.abs(lhs - rhs) > Math.abs(lhs) * 0.25 + 50)
    unexplained.push(`${key}: identity miss (deposit Δ ${lhs} vs sub-channel Δ ${rhs})`);
  // (c) channel attribution: hc.deposit must track the choke-point channel
  if (c.pd0.channel != null && c.pd0.deposit != null && Math.abs(c.pd0.channel - c.pd0.deposit) > Math.max(50, Math.abs(c.pd0.channel) * 0.1))
    unexplained.push(`${key}: pd0 channel/identity drift (${c.pd0.channel} vs ${c.pd0.deposit})`);
  if (c.pd1.channel != null && c.pd1.deposit != null && Math.abs(c.pd1.channel - c.pd1.deposit) > Math.max(50, Math.abs(c.pd1.channel) * 0.1))
    unexplained.push(`${key}: pd1 channel/identity drift (${c.pd1.channel} vs ${c.pd1.deposit})`);
}
report.unexplained = unexplained;
report.verdict = unexplained.length ? 'DIAG-NO-GO' : 'DIAG-GO';
console.log('\n# VERDICT: ' + report.verdict);
if (unexplained.length) for (const u of unexplained) console.log('UNEXPLAINED: ' + u);
const outPath = path.join(__dirname, '..', 'evidence', '2026-10-23', 'homecoming-diag-b-analyzer-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 1));
console.log('wrote ' + outPath);
process.exit(report.verdict === 'DIAG-GO' ? 0 : 1);
