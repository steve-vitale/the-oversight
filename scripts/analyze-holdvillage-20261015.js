#!/usr/bin/env node
// scripts/analyze-holdvillage-20261015.js — census roll-up for the
// village-mortality instrument sweep. Reads
// evidence/2026-10-15/perseed-holdvillage/*.json (non-full) +
// sim-holdvillage-runs.json, prints: the attribution bar verdict (>=90%
// of national-hold village deaths attributed), the census table, family
// share totals, co-occurrence totals, pantry story aggregates, and the
// wall numbers (national/table/wins/wave-4-5/median/exiled).
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-holdvillage');
const RUNS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'sim-holdvillage-runs.json');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.endsWith('-full.json')).sort();
let diedHolding = 0, attributed = 0;
const fams = {};
const cooc = { raids: 0, successions: 0, contests: 0, snaps: 0, waves: 0 };
const modals = {};
let pantryMins = [];
console.log('== village-mortality census ==');
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const seed = r.seed, policy = r.policy;
  const p = r.packet;
  if (!p || !p.diedHolding) { console.log(`  ${policy} s${seed}: not a died-holding run (outside the census)`); continue; }
  diedHolding++;
  const a = p.attributed === true;
  if (a) attributed++;
  const s = p.deathShares || {};
  for (const fam of Object.keys(s.famCounts || {})) fams[fam] = (fams[fam] || 0) + (s.famCounts[fam] || 0);
  if (s.modalFamily) modals[s.modalFamily] = (modals[s.modalFamily] || 0) + 1;
  const c = p.cooccur || {};
  for (const k of Object.keys(cooc)) cooc[k] += ((c[k] || []).length || 0);
  if (p.pantry && p.pantry.readable && p.pantry.minPantryDays != null) pantryMins.push(p.pantry.minPantryDays);
  const ar = (p.polity && p.polity.totalArrears != null) ? ` arrears=${p.polity.totalArrears}` : '';
  const mt = (p.polity && p.polity.minTrust != null) ? ` minTrust=${p.polity.minTrust}` : '';
  console.log(`  ${policy} s${seed}: d${p.deathDay} ${p.endReason} attrib=${a ? 'YES' : 'NO'} modal=${s.modalFamily || '?'} ` +
    `shares=${JSON.stringify(s.famCounts || {})} pantryMin=${p.pantry && p.pantry.readable ? p.pantry.minPantryDays : '?'}d` +
    ` raids=${(c.raids || []).length} succ=${(c.successions || []).length} contest=${(c.contests || []).length} snap=${(c.snaps || []).length}${ar}${mt}`);
  if (!a) console.log(`    unattr evidence: ${(p.evidence || []).join(' // ')}`);
}
const rate = diedHolding ? attributed / diedHolding : null;
console.log(`\nATTRIBUTION: ${attributed}/${diedHolding} = ${rate == null ? 'n/a' : (rate * 100).toFixed(1) + '%'} (GO bar >=90%)`);
console.log('VERDICT: ' + (rate == null ? 'NO DIED-HOLDING RUNS — census empty' : rate >= 0.9 ? 'GO' : 'MISS'));
console.log(`\ndeath-family totals across died-holding runs: ${JSON.stringify(fams)}`);
console.log(`modal families: ${JSON.stringify(modals)}`);
console.log(`co-occurrence totals: ${JSON.stringify(cooc)}`);
if (pantryMins.length) {
  const mn = Math.min.apply(null, pantryMins), mx = Math.max.apply(null, pantryMins);
  const mean = pantryMins.reduce((t, x) => t + x, 0) / pantryMins.length;
  console.log(`pantry window-min (died-holding runs): min=${mn.toFixed(1)}d max=${mx.toFixed(1)}d mean=${mean.toFixed(1)}d n=${pantryMins.length}`);
}

if (fs.existsSync(RUNS)) {
  const rows = JSON.parse(fs.readFileSync(RUNS, 'utf8'));
  const n = rows.length;
  const nat = rows.filter(r => r.national).length;
  const table = rows.filter(r => r.table).length;
  const wins = rows.filter(r => r.won).length;
  const w4 = rows.filter(r => r.maxWave >= 4).length;
  const w5 = rows.filter(r => r.maxWave >= 5).length;
  const ex = rows.filter(r => r.exiled).length;
  const surv = rows.map(r => r.survivalDays).sort((a, b) => a - b);
  const med = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  console.log(`\n== wall numbers (${n} runs) ==`);
  console.log(`national ${nat}/${n} · table ${table}/${n} · wins ${wins}/${n} · wave-4 ${w4}/${n} · wave-5 ${w5}/${n} · median survival ${med}d · max ${surv[surv.length - 1] || 0}d · exiled ${ex}/${n}`);
  const byPol = {};
  for (const r of rows) {
    const k = r.policy;
    byPol[k] = byPol[k] || { n: 0, nat: 0, dh: 0 };
    byPol[k].n++; if (r.national) byPol[k].nat++; if (r.diedHolding) byPol[k].dh++;
  }
  console.log('by policy: ' + Object.keys(byPol).map(k => `${k} national=${byPol[k].nat}/${byPol[k].n} diedHolding=${byPol[k].dh}`).join(', '));
}
