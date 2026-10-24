#!/usr/bin/env node
// analyze-belongcost-b.js — belongfeast PD=1 cost DIAG analyzer (sim-belongcost-b, backlog #889).
// Measurement only, zero src/js changes. Reads evidence/2026-10-24/belongcost-b-corpus/,
// computes per belongfeast cell x kind excess (PD1-PD0 on identical seeds),
// attributes PD1 deaths in excess buckets to pre-registered chains C1-C4,
// and renders DIAG-GO iff attributed/excess >= 0.80 with excess > 0.
// Exit 2 on missing corpus or C1 freshness hit; exit 0 with verdict otherwise.
// Usage: [CORPUS_DIR=...] [OUT=...] node scripts/analyze-belongcost-b.js
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.env.CORPUS_DIR || path.join(__dirname, '..', 'evidence', '2026-10-24', 'belongcost-b-corpus');
const OUT = process.env.ANALYZER_OUT || path.join(__dirname, '..', 'evidence', '2026-10-24', 'belongcost-b-analyzer-report.txt');
const PILOT = [94101, 94102, 94103, 94104, 94105, 94106, 94107, 94108];
const TAKEN = [];
for (let s = 9250; s <= 9265; s++) TAKEN.push(s);
for (let s = 92801; s <= 92816; s++) TAKEN.push(s);
for (let s = 92831; s <= 92846; s++) TAKEN.push(s);
for (let s = 94001; s <= 94008; s++) TAKEN.push(s);
for (let s = 94011; s <= 94026; s++) TAKEN.push(s);
const CELLS = [ // [policy, side, dg]
  ['belongfeast', 'pd0', 'dg0'], ['belongfeast', 'pd1', 'dg0'],
  ['belongfeast', 'pd0', 'dg1'], ['belongfeast', 'pd1', 'dg1'],
  ['leadfeast', 'pd0', 'dg1'], ['leadfeast', 'pd1', 'dg1'],
];
const BUCKETS = ['starvation', 'dehydration', 'alien'];

function canonBucket(cause) {
  const c = String(cause || '').toLowerCase();
  if (c === 'starvation' || c === 'hunger') return 'starvation';
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  if (/^alien/.test(c)) return 'alien';
  return null;
}
function winText(row) {
  return ((row.sayWin || []).join(' ') + ' ' + (row.teleWin || []).join(' '));
}
// Chains pre-registered in evidence/2026-10-24/sim-belongcost-b.md BEFORE sweeping.
function classify(row) {
  const bucket = canonBucket(row.cause);
  if (!bucket) return { bucket: null, chain: null };
  const ctx = row.ctx || {};
  const win = winText(row);
  if (bucket === 'starvation') {
    if (ctx.freshDays != null && ctx.freshDays <= 1 && (ctx.hungry || 0) >= 1) return { bucket, chain: 'C1' };
    if ((ctx.depriDec7d || 0) > 0 && ctx.freshDays != null && ctx.freshDays <= 4) return { bucket, chain: 'C2' };
    return { bucket, chain: 'U' };
  }
  if (bucket === 'dehydration') {
    if (/water|thirst|drink/i.test(win)) return { bucket, chain: 'C3' };
    if (ctx.freshDays != null && ctx.freshDays <= 1 && (ctx.hungry || 0) >= 1) return { bucket, chain: 'C3' };
    return { bucket, chain: 'U' };
  }
  if (bucket === 'alien') {
    if (/alien|monster/i.test(win)) return { bucket, chain: 'C4' };
    return { bucket, chain: 'U' };
  }
  return { bucket, chain: 'U' };
}

function main() {
  const lines = [];
  const L = (s) => { lines.push(s); };
  L('# sim-belongcost-b DIAG attribution analyzer — ' + new Date().toISOString());
  L('substrate: FEASTSCALE_R13=1, SEATDRIVE=0, 100d death-aware, policies {belongfeast, leadfeast-dg1-control}, cells belongfeast {pd0,pd1}x{dg0,dg1} + leadfeast {pd0,pd1}x{dg1}');
  L('PRE-REG: DIAG-GO iff attributed/excess >= 0.80 AND excess > 0 (belongfeast cost kinds starvation/dehydration/alien); else DIAG-NO-GO.');
  if (!fs.existsSync(CORPUS)) { console.error('ANALYZER FAIL: corpus dir missing: ' + CORPUS); process.exit(2); }
  const data = {}; // key policy|side|dg -> [perSeed]
  for (const [pol, side, dg] of CELLS) {
    const key = `${pol}|${side}|${dg}`;
    data[key] = [];
    for (const s of PILOT) {
      const f = path.join(CORPUS, `belongcost-b-${side}-${dg}-${pol}-s${s}.json`);
      if (!fs.existsSync(f)) { console.error(`ANALYZER FAIL: missing per-seed file ${f}`); process.exit(2); }
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (j.seed !== s || j.policy !== pol) { console.error('ANALYZER FAIL: seed/policy mismatch in ' + f); process.exit(2); }
      if (TAKEN.includes(j.seed) || !PILOT.includes(j.seed)) { console.error('ANALYZER FAIL C1: seed in taken band or outside pilot band: ' + j.seed); process.exit(2); }
      if (!Array.isArray(j.deathRows)) { console.error('ANALYZER FAIL: deathRows missing (blind corpus) in ' + f); process.exit(2); }
      data[key].push(j);
    }
  }
  L('PASS C1 freshness: all 48 per-seed files in pilot band 94101-94108, none in taken blocks');
  L('PASS death-row retention: deathRows present on all 48 configs (corpus NOT blind)');
  // Totals per cell x bucket
  const totals = {}; // key -> bucket -> count
  const rowsBy = {}; // key -> bucket -> [rows]
  for (const key of Object.keys(data)) {
    totals[key] = {}; rowsBy[key] = {};
    for (const j of data[key]) {
      for (const r of (j.deathRows || [])) {
        const b = canonBucket(r.cause);
        if (!b) continue;
        totals[key][b] = (totals[key][b] || 0) + 1;
        (rowsBy[key][b] = rowsBy[key][b] || []).push({ seed: j.seed, row: r });
      }
    }
  }
  // Excess + attribution on belongfeast cells
  let E = 0, A = 0;
  const detail = [];
  for (const dg of ['dg0', 'dg1']) {
    for (const b of BUCKETS) {
      const c0 = totals[`belongfeast|pd0|${dg}`][b] || 0;
      const c1 = totals[`belongfeast|pd1|${dg}`][b] || 0;
      const ex = Math.max(0, c1 - c0);
      E += ex;
      const classified = (rowsBy[`belongfeast|pd1|${dg}`][b] || []).map(({ seed, row }) => ({ seed, row, cls: classify(row) }));
      const matched = classified.filter(x => x.cls.chain && x.cls.chain !== 'U');
      const attr = Math.min(ex, matched.length);
      A += attr;
      detail.push({ dg, bucket: b, c0, c1, ex, matched: matched.length, attr, classified });
    }
  }
  L('\n== EXCESS (belongfeast, PD1-PD0 on identical seeds, cost kinds only) ==');
  for (const d of detail) L(`belongfeast ${d.dg} ${d.bucket}: PD0 ${d.c0} -> PD1 ${d.c1} | excess ${d.ex} | chain-matched PD1 deaths ${d.matched} | attributed (capped) ${d.attr}`);
  L(`TOTAL excess E=${E}, attributed A=${A}, rate=${E ? (A / E).toFixed(3) : 'n/a (E=0)'}`);
  // Control contrast: leadfeast dg1
  L('\n== CONTROL CONTRAST (leadfeast dg1, same buckets) ==');
  for (const b of BUCKETS) {
    const c0 = totals[`leadfeast|pd0|dg1`][b] || 0;
    const c1 = totals[`leadfeast|pd1|dg1`][b] || 0;
    L(`leadfeast dg1 ${b}: PD0 ${c0} -> PD1 ${c1} | excess ${Math.max(0, c1 - c0)}`);
  }
  // Wall numbers per cell
  L('\n== SCALE WALL per cell (national / table+wins / wave>=4 / wave>=5 / survival median / max, out of 8) ==');
  for (const [pol, side, dg] of CELLS) {
    const rows = data[`${pol}|${side}|${dg}`];
    const nat = rows.filter(r => r.national).length;
    const tab = rows.filter(r => r.win).length;
    const w4 = rows.filter(r => (r.waveReach || []).includes(4)).length;
    const w5 = rows.filter(r => (r.waveReach || []).includes(5)).length;
    const days = rows.map(r => r.daysAlive).sort((a, b) => a - b);
    const med = days.length % 2 ? days[(days.length - 1) / 2] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
    L(`${side}-${dg} ${pol}: ${nat} / ${tab} / ${w4} / ${w5} / ${med}d / ${days[days.length - 1]}d`);
  }
  // Death-cause shares (all causes, pooled)
  L('\n== DEATH-CAUSE SHARES (pooled, all cells, raw cause strings) ==');
  const allCauses = {};
  for (const key of Object.keys(data)) for (const j of data[key]) for (const [c, n] of Object.entries(j.deathCauses || {})) allCauses[c] = (allCauses[c] || 0) + n;
  const tot = Object.values(allCauses).reduce((a, b) => a + b, 0);
  for (const [c, n] of Object.entries(allCauses).sort((a, b) => b[1] - a[1])) L(`  ${c}: ${((n / tot) * 100).toFixed(1)}% (${n})`);
  L(`  total deaths (counts): ${tot}`);
  // Per-death attribution table: belongfeast PD1 cost-kind rows
  L('\n== PER-DEATH ATTRIBUTION TABLE (belongfeast PD1, cost kinds only) ==');
  L('seed | dg | day | who | cause | chain | freshDays | pantryKcal | pop | hungry | depriDec7d | window quote (first matching line or first line)');
  for (const dg of ['dg0', 'dg1']) {
    for (const d of detail.filter(x => x.dg === dg)) {
      for (const { seed, row, cls } of d.classified) {
        const ctx = row.ctx || {};
        const win = [...(row.sayWin || []), ...(row.teleWin || [])];
        const q = win.length ? win[0] : '(silent window)';
        L(`${seed} | ${dg} | d${row.day} | ${row.whoName || row.who} | ${row.cause} | ${cls.chain} | ${ctx.freshDays} | ${ctx.pantryKcal} | ${ctx.pop} | ${ctx.hungry} | ${ctx.depriDec7d} | ${q}`);
      }
    }
  }
  const rate = E ? A / E : 0;
  const verdict = (E > 0 && rate >= 0.80) ? 'DIAG-GO' : 'DIAG-NO-GO';
  L('\n== VERDICT ==');
  if (E === 0) L('E=0: the pdvalue belongfeast excess did NOT reproduce on fresh seeds — nothing to attribute; verdict DIAG-NO-GO on the attribution claim (see pre-reg).');
  L(`VERDICT: ${verdict} — attributed ${A}/${E} = ${E ? rate.toFixed(3) : 'n/a'} (bar >= 0.80, E > 0 required).`);
  try { fs.writeFileSync(OUT, lines.join('\n') + '\n'); } catch (e) { console.error('ANALYZER WRITE FAIL', OUT, e.message); process.exit(2); }
  console.log(lines.join('\n'));
  return { E, A, rate, verdict, detail, totals };
}
if (require.main === module) { main(); }
module.exports = { canonBucket, classify, winText, PILOT, TAKEN, BUCKETS };
