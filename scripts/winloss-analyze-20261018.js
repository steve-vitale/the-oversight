#!/usr/bin/env node
// winloss-analyze-20261018.js — aggregate the sim-winloss-a census.
// Reads evidence/2026-10-18/perseed-winloss-a/*.json, prints:
//   - loss-channel table with counts
//   - wall numbers (national / table / wave-4 / wave-5 / wins / median survival)
//   - reachability (wave-4/5, Arc, national/table)
//   - per-channel evidence digests (for lever-spec writing)
//   - instrument health (errors, unattributed, phantoms)
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-winloss-a');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
console.log(`runs: ${runs.length}`);

const chan = {};
const terminals = {};
let ierr = 0, phantoms = 0, unverif = 0;
let national = 0, table = 0, w4 = 0, w5 = 0, wins = 0;
let arc4 = 0;
const survivals = [];
for (const r of runs) {
  const rl = r.runLoss || {};
  const ch = rl.channel || '(none:' + (rl.terminal || '?') + ')';
  chan[ch] = (chan[ch] || 0) + 1;
  terminals[rl.terminal || '?'] = (terminals[rl.terminal || '?'] || 0) + 1;
  ierr += r.instrumentErrors | 0;
  phantoms += r.phantomDeaths | 0;
  unverif += r.unverifiableDeaths | 0;
  if (r.national) national++;
  if (r.table) table++;
  if ((r.maxWave | 0) >= 4) w4++;
  if ((r.maxWave | 0) >= 5) w5++;
  if (r.won) wins++;
  if ((r.maxArc | 0) >= 4) arc4++;
  survivals.push(r.gameDays | 0);
}
survivals.sort((a, b) => a - b);
const med = survivals.length ? survivals[Math.floor(survivals.length / 2)] : 0;

console.log('\n== TERMINALS ==');
for (const [t, n] of Object.entries(terminals).sort((a, b) => b[1] - a[1])) console.log(`  ${t}: ${n}`);
console.log('\n== LOSS CHANNELS ==');
for (const [c, n] of Object.entries(chan).sort((a, b) => b[1] - a[1])) console.log(`  ${c}: ${n}`);
console.log('\n== WALL NUMBERS ==');
console.log(`  national ${national}/${runs.length}  table ${table}/${runs.length}  wave-4 ${w4}/${runs.length}  wave-5 ${w5}/${runs.length}  wins ${wins}/${runs.length}  arc4 ${arc4}/${runs.length}  median-survival ${med}d (max ${survivals[survivals.length - 1]}d)`);
console.log('\n== INSTRUMENT HEALTH ==');
console.log(`  instrumentErrors=${ierr} phantomDeaths=${phantoms} unverifiableDeaths=${unverif}`);
const unattrib = runs.filter(r => !r.won && !(r.runLoss && r.runLoss.channel));
console.log(`  unattributed non-win runs: ${unattrib.length}`);
for (const r of unattrib) console.log(`    UNATTRIBUTED: ${r.policyId} s${r.seed} terminal=${(r.runLoss || {}).terminal}`);

console.log('\n== PER-CHANNEL EVIDENCE ==');
const byChan = {};
for (const r of runs) {
  const ch = (r.runLoss || {}).channel || '(none)';
  (byChan[ch] = byChan[ch] || []).push(r);
}
for (const [c, rs] of Object.entries(byChan).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n--- ${c} (${rs.length}) ---`);
  for (const r of rs) {
    const rl = r.runLoss || {};
    const ev = rl.evidence || {};
    let extra = '';
    if (rl.terminal === 'village-lost') {
      const lsd = ev.lastScholarDeath || {};
      extra = `lastScholar=${lsd.name || '?'} d${lsd.day || '?'} ${lsd.cause || '?'}->${lsd.channel || '?'} succ=${ev.successionCount} pantryEnd=${ev.pantryEnd} fw=${JSON.stringify(ev.finalWindowChannels || {})}`;
    } else if (rl.terminal === 'survived') {
      extra = `seat=${ev.finalSeat} worstBar=${JSON.stringify(ev.worstBar || {})} inviteRule=${ev.inviteRule || ''} w=${r.maxWave} nat=${r.national} invites=${r.tableInvites}`;
    }
    console.log(`  [${r.policyId} s${r.seed}] days=${r.gameDays} end=${r.endReason} won=${r.won} w=${r.maxWave} arc=${r.maxArc} deaths=${r.deathCount} ${extra}`);
  }
}
