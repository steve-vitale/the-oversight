#!/usr/bin/env node
'use strict';
// analyze-winwall-20261016.js — aggregate the winwall sweep: wall numbers
// table, path distribution (per winning run, from beats), death shares.
// Usage: node scripts/analyze-winwall-20261016.js
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-winwall');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'winwall-beats');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const by = (side) => recs.filter(r => r.side === side);
const sum = (rs, f) => rs.reduce((a, r) => a + (r[f] | 0), 0);

// ---- wall numbers ----
console.log('== wall numbers ==');
console.log('metric          control armed  bar        verdict');
for (const side of ['control', 'armed']) {
  const rs = by(side);
  const n = rs.length;
  console.log(`${side}: n=${n} sittings=${sum(rs, 'sittings')} wins=${sum(rs, 'wins')} national=${sum(rs, 'national')}/${n} ` +
    `table=${sum(rs, 'table')}/${n} wave4=${sum(rs, 'wave4')}/${n} wave5=${sum(rs, 'wave5')}/${n} exiled=${sum(rs, 'exiled')}/${n} ` +
    `medianSurv(all)=${median(rs.map(r => r.gameDays)).toFixed(1)}d answers=${sum(rs, 'tableAnswers')} holds=${sum(rs, 'holds')}`);
}
// Schema-drift check: every file carries exact numeric national/table/wins/exiled.
let bad = 0;
for (const r of recs) {
  for (const k of ['national', 'table', 'wins', 'exiled', 'sittings']) {
    if (typeof r[k] !== 'number') { bad++; console.log(`SCHEMA-DRIFT: ${r.policyId}-${r.side}-s${r.seed} key ${k} = ${typeof r[k]}`); }
  }
}
console.log(`schema check: ${recs.length} files, ${bad} bad keys`);

// ---- path distribution (diagnostic): from the post-run tableState read;
// beats scan kept as cross-check ----
const pathOf = (r) => {
  if (r.winPath) return `${r.winPath}${r.winBranch ? '/' + r.winBranch : ''}`;
  const f = path.join(BEATS, `${r.policyId}-${r.side}-s${r.seed}.json`);
  if (!fs.existsSync(f)) return 'no-beats';
  let beats;
  try { beats = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return 'unparseable'; }
  const names = new Set();
  for (const b of beats) {
    const t = b.text.toLowerCase();
    const m = t.match(/path (?:of|called) (?:the )?([a-z]+)/);
    if (m) names.add(m[1]);
  }
  return names.size ? '[beats:' + [...names].join(',') + ']' : 'unseen';
};
console.log('\n== winning runs: path walked (diagnostic) ==');
const pathTally = {};
for (const r of by('armed').filter(x => x.wins)) {
  const p = pathOf(r);
  pathTally[p] = (pathTally[p] || 0) + 1;
  console.log(`  ${r.policyId} s${r.seed}: seatDay=${r.seatDay} seatKind=${r.seatKind} answers=${r.tableAnswers} path=${p}`);
}
console.log('path tally: ' + JSON.stringify(pathTally));

// ---- death-mode shares ----
console.log('\n== death modes ==');
for (const side of ['control', 'armed']) {
  const tally = {};
  for (const r of by(side)) for (const [k, v] of Object.entries(r.deaths || {})) tally[k] = (tally[k] || 0) + v;
  console.log(`${side}: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + 'x' + v).join(', ') || '(none)'}`);
}
// armed death modes vs control (guardrail: subset)
{
  const cModes = new Set(), aModes = new Set();
  for (const r of by('control')) for (const k of Object.keys(r.deaths || {})) cModes.add(k);
  for (const r of by('armed')) for (const k of Object.keys(r.deaths || {})) aModes.add(k);
  const novel = [...aModes].filter(k => !cModes.has(k));
  console.log('armed-only death modes (novel): ' + (novel.length ? novel.join(', ') : 'none'));
}
// per-seed control survived >= armed seatDay
{
  let met = 0, n = 0;
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c && r.seatDay) { n++; if (c.gameDays >= r.seatDay) met++; else console.log(`  SHORTFALL: ${r.policyId} s${r.seed} control survived d${c.gameDays} < armed seatDay d${r.seatDay}`); }
  }
  console.log(`control survived >= armed seatDay: ${met}/${n}`);
}
// wave5Day cross-check note
{
  const notes = recs.filter(r => /#375 edge/.test(r.waveSampleNote || ''));
  console.log(`\n#375-edge runs (harness max > daily sample): ${notes.length}` + (notes.length ? ' ' + notes.map(r => `${r.policyId}-${r.side}-s${r.seed}`).join(', ') : ''));
}
// matched non-winning medians
{
  const pairs = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c && !r.wins && !c.wins) pairs.push({ armed: r.gameDays, control: c.gameDays });
  }
  console.log(`matched non-winning pairs n=${pairs.length}: armed median ${median(pairs.map(p => p.armed)).toFixed(1)}d, control median ${median(pairs.map(p => p.control)).toFixed(1)}d`);
}
