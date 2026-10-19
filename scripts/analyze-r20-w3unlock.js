#!/usr/bin/env node
// analyze-r20-w3unlock.js — r20 wave-3 kill-gate reachability summary.
// Reads per-seed JSONs (journey-deepening-r20-*.json) and prints the
// pre-registered metric table: unlock-by-day-80 (R1), kill economy (R2),
// roster deaths (§14c co-primary), carry (M6).
// Usage: node scripts/analyze-r20-w3unlock.js evidence/2026-10-19 [prefix]
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || 'evidence/2026-10-19';
const prefix = process.argv[3] || 'journey-deepening-r20-competent-';
const files = fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.json'));

const rows = [];
for (const f of files) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { console.log('SKIP', f, e.message); continue; }
  const wlog = j.waveLog || [];
  const unlock = wlog.find(e => (e.wave | 0) >= 3 && !(e.probe));
  const w2 = j.wave2 || {};
  const killsByType = w2.killsByType || {};
  const totalPts = Object.values(killsByType).reduce((a, b) => a + (b | 0), 0);
  const killedTypes = Object.keys(killsByType).filter(k => (killsByType[k] | 0) > 0).length;
  const faced = (w2.distinctFaced != null) ? w2.distinctFaced : ((w2.facedList || []).length);
  const deaths = j.deaths || [];
  const COMBAT_CAUSES = new Set(['combat', 'villager combat', 'monster', 'ambush']);
  const rosterCombat = deaths.filter(d => COMBAT_CAUSES.has(String(d.cause || ''))).length;
  const expedition = deaths.filter(d => String(d.cause || '') === 'expedition').length;
  const dh = j.deathHonesty || {};
  const scholarDeaths = Array.isArray(dh.playerDeaths) ? dh.playerDeaths.length : (dh.playerDeaths | 0);
  rows.push({
    seed: j.seed, policy: j.policy, days: j.maxGameDay, end: j.endReason,
    w2pts: totalPts, faced, killedTypes,
    unlockDay: unlock ? unlock.day : null,
    unlockBy80: unlock && unlock.day <= 80 ? 'Y' : 'n',
    rosterCombatDeaths: rosterCombat, expeditionDeaths: expedition,
    totalDeaths: deaths.length, scholarDead: scholarDeaths,
    byType: w2,
    killAttribution: j.killAttribution || null,
  });
}
rows.sort((a, b) => String(a.policy).localeCompare(String(b.policy)) || (a.seed - b.seed));

console.log('seed   policy       days end            w2pts faced killT unlockDay <=80 combatD expedD totalD scholarD');
for (const r of rows) {
  console.log(String(r.seed).padEnd(7),
    String(r.policy).padEnd(12),
    String(r.days).padEnd(4),
    String(r.end || '?').padEnd(14).slice(0, 14),
    String(r.w2pts).padEnd(5),
    String(r.faced).padEnd(5),
    String(r.killedTypes).padEnd(5),
    String(r.unlockDay == null ? '-' : r.unlockDay).padEnd(9),
    String(r.unlockBy80).padEnd(4),
    String(r.rosterCombatDeaths).padEnd(7),
    String(r.expeditionDeaths).padEnd(6),
    String(r.totalDeaths).padEnd(6),
    r.scholarDead);
}
// Per-policy verdicts
for (const pol of [...new Set(rows.map(r => r.policy))]) {
  const ps = rows.filter(r => r.policy === pol);
  const n = ps.length;
  const unlocked = ps.filter(r => r.unlockDay != null && r.unlockDay <= 80).length;
  const avgPts = (ps.reduce((a, r) => a + r.w2pts, 0) / n).toFixed(1);
  console.log(`\n[${pol}] R1 unlock-by-80: ${unlocked}/${n} (GO bar >=3/8 on competent)`);
  console.log(`[${pol}] R2 mean w2 pts: ${avgPts}`);
  console.log(`[${pol}] faced-vs-killed per seed: ` + ps.map(r => `${r.seed}:${r.faced}f/${r.killedTypes}k`).join(' '));
}
// Facing-without-killing detail
console.log('\nby-type faced-but-0-pts (per seed):');
for (const r of rows) {
  const bt = (r.byType && r.byType.byType) || {};
  const gap = Object.keys(bt).filter(id => bt[id].faced && !(bt[id].ledgerPts > 0));
  if (gap.length) console.log(`  ${r.seed}/${r.policy}: ${gap.join(', ')}`);
}
