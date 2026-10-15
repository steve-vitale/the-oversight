#!/usr/bin/env node
// scripts/analyze-succhain-20261015.js — census roll-up for the succhain
// instrument sweep. Reads evidence/2026-10-15/perseed-succhain/*.json +
// sim-succhain-runs.json, prints: the attribution bar verdict (>=90% of
// young-national chains attributed), chain table, cause-family tally,
// co-occurrence counts, rank-fall counts, and the wall numbers.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-succhain');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.endsWith('-full.json')).sort();
let totChains = 0, totAttrib = 0, totLens = 0;
const byLen = {};
const fams = {};
const cooc = { snaps: 0, raids: 0, tributeShorts: 0 };
let rankFell = 0, rankKept = 0;
const natRuns = [], chainRuns = [];
console.log('== chain census ==');
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const seed = r.seed, policy = r.policy;
  const hasWindow = !!r.window;
  if (hasWindow) natRuns.push(`${policy} s${seed}`);
  const chainArr = (r.chains && Array.isArray(r.chains.chains)) ? r.chains.chains : [];
  for (const c of chainArr) {
    totChains++; totLens += c.length;
    byLen[c.length] = (byLen[c.length] || 0) + 1;
    if (c.impact.attributed) totAttrib++;
    for (const d of c.deaths) {
      fams[d.family] = (fams[d.family] || 0) + 1;
    }
    cooc.snaps += c.impact.snapsInChain || 0;
    cooc.raids += c.impact.raidsInChain || 0;
    cooc.tributeShorts += c.impact.tributeShortsInChain || 0;
    if (c.impact.rankFell7d) rankFell++; else rankKept++;
    chainRuns.push(`${policy} s${seed} d${c.firstDay}->${c.lastDay} len=${c.length} gaps=[${c.gaps.join(',')}]`);
    console.log(`  ${policy} s${seed}: d${c.firstDay}->d${c.lastDay} len=${c.length} gaps=[${c.gaps.join(',')}] attrib=${c.impact.attributed} rank7d=${c.impact.rank7dAfter}${c.impact.rankFell7d ? ' FELL' : ''}`);
    console.log(`    causes: ${c.impact.causeSeq}`);
  }
}
console.log(`\nnational-reaching runs: ${natRuns.length} [${natRuns.join(', ')}]`);
console.log(`chains in young windows: ${totChains}; attributed: ${totAttrib}/${totChains} (${totChains ? (100 * totAttrib / totChains).toFixed(1) : '-'}%)`);
console.log(`chain lengths: ${JSON.stringify(byLen)} (mean ${(totChains ? (totLens / totChains).toFixed(2) : '-')})`);
console.log(`bearer death families: ${JSON.stringify(fams)}`);
console.log(`co-occurrence across chains: snaps=${cooc.snaps} raids=${cooc.raids} tributeShorts=${cooc.tributeShorts}`);
console.log(`rank 7d after last death: fell=${rankFell} kept=${rankKept}`);

// wall numbers from the run summary
const runs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evidence', '2026-10-15', 'sim-succhain-runs.json'), 'utf8'));
const med = (rs, k) => { const v = rs.map(r => r[k] || 0).sort((a, b) => a - b); return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2; };
console.log('\n== wall numbers ==');
console.log(`runs: ${runs.length}; national: ${runs.filter(r => r.national).length}; table: ${runs.filter(r => r.table).length}; won: ${runs.filter(r => r.won).length}; exiled: ${runs.filter(r => r.exiled).length}`);
console.log(`wave-4+: ${runs.filter(r => r.maxWave >= 4).length}; wave-5: ${runs.filter(r => r.maxWave >= 5).length}; median survival: ${med(runs, 'days')}d; max: ${Math.max(...runs.map(r => r.days))}d`);
for (const p of ['leadfeast', 'belongfeast', 'leadfeast-winpursuit']) {
  const rs = runs.filter(r => r.policy === p);
  if (!rs.length) continue;
  console.log(`  ${p}: n=${rs.length} nat=${rs.filter(r => r.national).length} chains=${rs.reduce((t, r) => t + (r.nChains || 0), 0)} table=${rs.filter(r => r.table).length} won=${rs.filter(r => r.won).length} med=${med(rs, 'days')}d`);
}
