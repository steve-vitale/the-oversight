#!/usr/bin/env node
'use strict';
// analyze-presubstrate-20261015.js — aggregates the presubstrate per-seed
// JSONs into the reachability table, verdicts, mortality shape, and the
// wincensus-substrate comparison. Read-only over evidence.
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-presubstrate');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
if (!recs.length) { console.error('no records'); process.exit(2); }

const n = recs.length;
const cnt = (fn) => recs.filter(fn).length;
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const dayList = (k) => recs.filter(r => r[k] != null).map(r => r[k]);

console.log(`# presubstrate census: ${n} runs (${cnt(r => r.policyId === 'leadfeast')} leadfeast, ${cnt(r => r.policyId === 'belongfeast')} belongfeast)`);
console.log('\n| seed | policy | days | end | arcII | arcIII | arcIV | reg | nat | realm | w3 | w4 | w5 | inv | sit | vest | ex | win |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of recs.sort((a, b) => a.seed - b.seed || (a.policyId < b.policyId ? -1 : 1))) {
  const p = r.policyId === 'leadfeast' ? 'lead' : 'belong';
  console.log(`| ${r.seed} | ${p} | ${r.gameDays} | ${r.endReason} | ${r.arc2Day ?? '-'} | ${r.arc3Day ?? '-'} | ${r.arc4Day ?? '-'} | ${r.regionalDay ?? '-'} | ${r.nationalDay ?? '-'} | ${r.realmDay ?? '-'}${r.realmShape ? '(' + r.realmShape + ')' : ''} | ${r.wave3Day ?? '-'} | ${r.wave4Day ?? '-'} | ${r.wave5Day ?? '-'} | ${r.invites} | ${r.sittings} | ${r.vestCount} | ${r.exiled} | ${r.wins} |`);
}

const row = (label, k, total) => console.log(`  ${label}: ${cnt(k)}/${total ?? n}`);
console.log('\n## reachability');
row('arc II', r => r.arc2Day != null);
row('arc III', r => r.arc3Day != null);
row('arc IV', r => r.arc4Day != null);
row('regional', r => r.regionalDay != null);
row('national', r => r.nationalDay != null);
row('four-realm', r => r.realmDay != null);
row('wave-3 unlock', r => r.wave3Day != null);
row('wave-4 unlock', r => r.wave4Day != null);
row('wave-5 unlock', r => r.wave5Day != null);
row('table invite', r => r.invites > 0);
row('table sitting', r => r.sittings > 0);
row('vests (any)', r => r.vestCount > 0);
row('exiled', r => r.exiled === 1);
row('wins', r => r.wins === 1);
console.log('  arcII days: ' + dayList('arc2Day').join(','));
console.log('  arcIII days: ' + dayList('arc3Day').join(','));
console.log('  arcIV days: ' + dayList('arc4Day').join(','));
console.log('  regional days: ' + dayList('regionalDay').join(','));
console.log('  national days: ' + dayList('nationalDay').join(','));
console.log('  realm days: ' + dayList('realmDay').join(',') + ' shapes: ' + recs.filter(r => r.realmDay != null).map(r => r.realmShape + (r.realmLed ? '/led' : '/sub')).join(','));
console.log('  wave3 days: ' + dayList('wave3Day').join(','));
console.log('  wave4 days: ' + dayList('wave4Day').join(','));
console.log('  wave5 days: ' + dayList('wave5Day').join(','));
console.log('  invite days (first): ' + dayList('inviteDay').join(','));
console.log('  total invites: ' + recs.reduce((t, r) => t + r.invites, 0) + ' total sittings: ' + recs.reduce((t, r) => t + r.sittings, 0));

console.log('\n## by policy');
for (const p of ['leadfeast', 'belongfeast']) {
  const rs = recs.filter(r => r.policyId === p);
  console.log(`  ${p}: n=${rs.length} nat=${cnt(r => r.policyId === p && r.nationalDay != null)} realm=${cnt(r => r.policyId === p && r.realmDay != null)} table=${cnt(r => r.policyId === p && r.invites > 0)} w4=${cnt(r => r.policyId === p && r.wave4Day != null)} w5=${cnt(r => r.policyId === p && r.wave5Day != null)} wins=${cnt(r => r.policyId === p && r.wins === 1)} medSurv=${med(rs.map(r => r.gameDays)).toFixed(1)}d`);
}

console.log('\n## survival');
const days = recs.map(r => r.gameDays);
console.log(`  median=${med(days).toFixed(1)}d max=${Math.max(...days)}d min=${Math.min(...days)}d`);
const endReasons = {};
for (const r of recs) endReasons[r.endReason] = (endReasons[r.endReason] || 0) + 1;
console.log('  endReasons: ' + JSON.stringify(endReasons));
const causes = {};
for (const r of recs) for (const [k, v] of Object.entries(r.deaths || {})) causes[k] = (causes[k] || 0) + v;
const ctot = Object.values(causes).reduce((a, b) => a + b, 0);
console.log('  death causes: ' + Object.entries(causes).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}(${ctot ? (100 * v / ctot).toFixed(0) : 0}%)`).join(' '));
// national/table-reachers who never won: what killed them?
const reachers = recs.filter(r => (r.nationalDay != null || r.invites > 0) && !r.wins);
console.log(`\n## national/table-reachers who never won: ${reachers.length}`);
for (const r of reachers) {
  const dc = Object.entries(r.deaths || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k}x${v}`).join(',');
  console.log(`  s${r.seed}/${r.policyId}: days=${r.gameDays} end=${r.endReason} nat=${r.nationalDay ?? '-'} inv=${r.invites} w4=${r.wave4Day ?? '-'} w5=${r.wave5Day ?? '-'} deaths=[${dc}] seat=${(r.seatDetail || {}).seat}`);
}
// seat detail of the invited-but-never-sat
console.log('\n## seat detail (final) for invited runs');
for (const r of recs.filter(r => r.invites > 0)) {
  const s = r.seatDetail || {};
  console.log(`  s${r.seed}/${r.policyId}: seat=${s.seat} w1=${s.w1} w2=${s.w2} w3=${s.w3} contests=${s.contestsN} crises=${s.crisesN} rank=${s.rank} stage=${s.stage} foodDeeds=${s.foodDeeds}`);
}
console.log('\n## wincensus-substrate comparison (same composition, seeds 11..88: nat 6/16, table 15/16 inv 0 sit, wins 0/16, w4 14/16, w5 5/16, med 120.5d, ex 0/16)');
console.log(`  presubstrate fresh seeds: nat ${cnt(r => r.nationalDay != null)}/16, table ${cnt(r => r.invites > 0)}/16 inv / ${cnt(r => r.sittings > 0)}/16 sit, wins ${cnt(r => r.wins === 1)}/16, w4 ${cnt(r => r.wave4Day != null)}/16, w5 ${cnt(r => r.wave5Day != null)}/16, med ${med(days).toFixed(1)}d, ex ${cnt(r => r.exiled === 1)}/16`);
