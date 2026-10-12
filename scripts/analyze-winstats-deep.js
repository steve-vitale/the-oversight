#!/usr/bin/env node
// analyze-winstats-deep.js — analyze the deep win-stats campaign.
// Usage: node analyze-winstats-deep.js /tmp/ws-winseek.json ... 
'use strict';
const fs = require('fs');

const files = process.argv.slice(2);
let rows = [];
for (const f of files) {
  try {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    rows = rows.concat(d);
  } catch (e) { console.error('skip ' + f + ': ' + e.message); }
}
console.log('total runs:', rows.length);

const byPol = {};
for (const r of rows) {
  (byPol[r.policy] = byPol[r.policy] || []).push(r);
}

const F = (arr, f) => arr.filter(f).length;
const med = (arr) => {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

console.log('\n== PER-POLICY ==');
for (const [pol, rs] of Object.entries(byPol)) {
  const wins = rs.filter(r => r.won);
  const winDays = wins.map(r => r.days);
  const staged = rs.filter(r => r.tableFired && !r.won);
  console.log(`\n### ${pol} (n=${rs.length})`);
  console.log(`  won: ${wins.length}/${rs.length} (${(100 * wins.length / rs.length).toFixed(1)}%)` +
    (winDays.length ? ` | win days: min ${Math.min(...winDays)} med ${med(winDays)} max ${Math.max(...winDays)}` : ''));
  console.log(`  table fired (no win): ${staged.length} | lesser seat: ${F(rs, r => r.lesserDay > 0)} | full seat: ${F(rs, r => r.fullDay > 0)}`);
  console.log(`  regional/national/global: ${F(rs, r => r.rankDay.regional)}/${F(rs, r => r.rankDay.national)}/${F(rs, r => r.rankDay.global)}`);
  console.log(`  arc>=4: ${F(rs, r => r.maxArc >= 4)} | wave>=3: ${F(rs, r => r.maxWave >= 3)} | wave3faced>=3: ${F(rs, r => (r.faced[3] || 0) >= 3)}`);
  console.log(`  median/max days: ${med(rs.map(r => r.days))}/${Math.max(...rs.map(r => r.days))}`);
  const dc = {};
  for (const r of rs) for (const k of Object.keys(r.deathShare || {})) dc[k] = (dc[k] || 0) + r.deathShare[k];
  console.log(`  deaths: ${JSON.stringify(dc)}`);
}

console.log('\n== WINS DETAIL ==');
for (const r of rows.filter(r => r.won)) {
  console.log(`\n${r.policy} seed ${r.seed}: won day ${r.days} | table ${r.tablePath}/${r.tableBranch} (${r.tableAnswers} answers)`);
  console.log(`  rank days: ${JSON.stringify(r.rankDay)} | lesser: ${r.lesserDay} | arc: ${JSON.stringify(r.arcDay)}`);
  console.log(`  faced: w1:${r.faced[1]} w2:${r.faced[2]} w3:${r.faced[3]} | contests: ${r.contestsSurvived} | crises: ${r.crisesN} | successions: ${r.successions}`);
  console.log(`  abilities(${r.abilities.length}): ${r.abilities.join(', ')}`);
  console.log(`  synergies(${r.synergies.length}): ${r.synergies.join(', ')}`);
  console.log(`  integration: ${r.integration} slots: ${r.slots} | feast: ${r.feastUsed} | stage: ${r.stage} breadth: ${r.breadth}`);
  console.log(`  tribute: ${r.tributePaid} primacyBids: ${r.primacyBids} proposed: ${r.proposed}/${r.proposedPeer} links(H/S/P): ${r.linksHead}/${r.linksSub}/${r.linksPeer}`);
  console.log(`  vests: ${r.vests.join(',')} | counters: ${r.countersDiscovered} counterKills: ${r.counterKills} waveKills: ${r.waveKills}`);
}

console.log('\n== NEAR-WINS (table fired, no win) ==');
for (const r of rows.filter(r => r.tableFired && !r.won)) {
  console.log(`${r.policy} seed ${r.seed}: table day ${r.tableDay || '?'} (${r.tablePath || '?'}/${r.tableBranch || '?'}) ` +
    `died day ${r.days} (${r.endReason}) deaths:${r.deathN} ${JSON.stringify(r.deathShare)}`);
}

console.log('\n== OVERALL ==');
const wins = rows.filter(r => r.won);
console.log(`win rate: ${wins.length}/${rows.length} (${(100 * wins.length / rows.length).toFixed(1)}%)`);
const paths = {};
for (const r of wins) paths[(r.tablePath || '?') + '/' + (r.tableBranch || '?')] = (paths[(r.tablePath || '?') + '/' + (r.tableBranch || '?')] || 0) + 1;
console.log('winning paths:', JSON.stringify(paths));
