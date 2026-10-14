#!/usr/bin/env node
// scripts/analyze-trustgain-20261014.js — census analysis for the evidence file.
// Reads evidence/2026-10-14/trustgain-perseed/*.json and prints the ranked
// census, the succession correction, link-trust vs villager-trust, and the
// progressive-efficiency table.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-14', 'trustgain-perseed');

const rows = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json') || f.includes('-i2')) continue;
  rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}
console.log(`combos: ${rows.length}`);
// Note: per-seed channel rows already carry STRICT scholar scoping
// (vid == scholar on that day), computed by the sweep.

// 1. r30 correction: current-scholar trust<30 share vs lineage
let lt30days = 0, totalDays = 0, maxTrust = 0;
const trustEnds = [];
for (const r of rows) {
  for (const t of (r.trajectory || [])) {
    if (t.trust == null) continue;
    totalDays++;
    if (t.trust < 30) lt30days++;
    if (t.trust > maxTrust) maxTrust = t.trust;
  }
  if (r.scholarTrustEnd != null) trustEnds.push(r.scholarTrustEnd);
}
trustEnds.sort((a, b) => a - b);
console.log(`\n== SCHOLAR-LINEAGE TRUST (succession-aware) ==`);
console.log(`trust<30 scholar-day share: ${(lt30days / Math.max(1, totalDays)).toFixed(4)} (${lt30days}/${totalDays})`);
console.log(`max trust seen: ${maxTrust}; trustEnd median: ${trustEnds[Math.floor(trustEnds.length / 2)]}, p10: ${trustEnds[Math.floor(trustEnds.length * 0.1)]}, values: ${trustEnds.join(',')}`);
// successions per combo
console.log(`successions/combo: ${rows.map(r => r.successions).join(',')}`);

// 2. scholar-scoped ranked channels
const agg = {};
for (const r of rows) for (const c of r.channels) {
  const ch = c.channel === 'other:_contestVerdict' ? 'gain:contest-verdict' : c.channel;
  const e = agg[ch] || (agg[ch] = { channel: ch, fires: 0, gain: 0, drain: 0, sGain: 0, sDrain: 0, sFires: 0, combos: 0 });
  e.fires += c.fires; e.gain += c.gainTotal; e.drain += c.drainTotal;
  e.sGain += c.scholarGain; e.sDrain += c.scholarDrain; e.sFires += c.scholarFires;
  if (c.fires > 0) e.combos++;
}
const vd = rows.reduce((t, r) => t + r.villageDays, 0);
const ranked = Object.values(agg).sort((a, b) => b.sGain - a.sGain);
console.log(`\n== SCHOLAR-SCOPED GAINS (per 100 village-days, ${vd} vd total) ==`);
for (const c of ranked.filter(c => c.sGain > 0).slice(0, 16)) {
  console.log(`  ${c.channel}: scholar +${c.sGain.toFixed(0)} (${(c.sGain / vd * 100).toFixed(2)}/100vd) x${c.sFires} | village +${c.gain.toFixed(0)} x${c.fires} | ${c.combos}/${rows.length} combos`);
}
console.log(`\n== SCHOLAR DRAINS ==`);
for (const c of ranked.filter(c => c.sDrain < 0).sort((a, b) => a.sDrain - b.sDrain).slice(0, 8)) {
  console.log(`  ${c.channel}: scholar ${c.sDrain.toFixed(0)} | village ${c.drain.toFixed(0)}`);
}
// 3. progressive efficiency
const pe = {};
for (const r of rows) for (const p of (r.progressive || [])) {
  const e = pe[p.channel] || (pe[p.channel] = { c: 0, b: 0, s: 0 });
  e.c += p.calls; e.b += p.baseTotal; e.s += p.scaledTotal;
}
console.log(`\n== PROGRESSIVE EFFICIENCY (applied/base) ==`);
for (const k of Object.keys(pe).sort((a, b) => pe[b].s - pe[a].s).slice(0, 10)) {
  const e = pe[k];
  console.log(`  ${k}: x${e.c} base ${e.b} -> applied ${e.s} (eff ${(e.s / Math.max(1, e.b)).toFixed(2)})`);
}
// 4. link trust (separate currency)
const lg = {};
for (const r of rows) for (const l of (r.linkGains || [])) {
  const e = lg[l.caller] || (lg[l.caller] = { fires: 0, applied: 0 });
  e.fires += l.fires; e.applied += l.applied;
}
console.log(`\n== LINK-TRUST GAINS (separate currency) ==`);
for (const k of Object.keys(lg).sort((a, b) => lg[b].applied - lg[a].applied)) {
  console.log(`  ${k}: +${lg[k].applied} x${lg[k].fires}`);
}
// 5. reasons for the top scholar channels
console.log(`\n== TOP REASONS (bumpTrust reason strings) ==`);
const reasons = {};
for (const r of rows) for (const c of r.channels) {
  for (const [k, n] of Object.entries(c.reasons || {})) {
    reasons[k] = reasons[k] || { n: 0, ch: {} };
    reasons[k].n += n; reasons[k].ch[c.channel] = (reasons[k].ch[c.channel] || 0) + n;
  }
}
for (const k of Object.keys(reasons).sort((a, b) => reasons[b].n - reasons[a].n).slice(0, 20)) {
  console.log(`  "${k}": x${reasons[k].n} (${Object.entries(reasons[k].ch).map(([c, n]) => c + ':' + n).join(', ')})`);
}
