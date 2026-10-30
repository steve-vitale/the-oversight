// sweep-tier3watch-b.js — reproducible wrapper for the tier-3+ access watch
// re-read (backlog #1545). MEASUREMENT ONLY: runs scripts/balance-panel.js
// with the exact stashfetch-b panel spec (seeds 16101-16116, competent,
// 60 days) and extracts the per-seed goodGear metric from panel.json.gz.
// It does NOT re-implement the metric: the panel remains the instrument.
// Usage: node scripts/sweep-tier3watch-b.js [--out <panel-dir>]
//   (default out: evidence/2026-10-30/sim-tier3watch-b-panel)
// Writes: <panel-dir>-summary.json next to the panel dir (per-seed table,
// rate, Wilson 95% interval, validity, first tier-3+ grant per seed).
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? args[outIdx + 1] : 'evidence/2026-10-30/sim-tier3watch-b-panel';
const seeds = Array.from({ length: 16 }, (_, i) => 16101 + i);
function wilson(k, n, z = 1.96) {
  if (!n) return [null, null];
  const p = k / n, d = 1 + z * z / n;
  const c = (p + z * z / (2 * n)) / d;
  const h = (z / d) * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [Math.max(0, c - h), Math.min(1, c + h)];
}
const panelArgs = ['scripts/balance-panel.js', '--out', out, '--seeds', seeds.join(','),
  '--policies', 'competent', '--days', '60'];
console.log('Running: node ' + panelArgs.join(' '));
const run = spawnSync(process.execPath, panelArgs, { cwd: root, stdio: 'inherit' });
if (run.status !== 0) { console.error('PANEL FAILED'); process.exit(run.status || 1); }
const panel = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, out, 'panel.json.gz'))).toString('utf8'));
const rows = panel.rows.slice().sort((a, b) => a.row.seed - b.row.seed);
const perSeed = rows.map(r => {
  const grants = (r.gear && r.gear.grants || []).filter(g => g.who === 'player' && g.gear && g.tier >= 3);
  grants.sort((a, b) => a.day - b.day);
  const first = grants[0] || null;
  return { seed: r.row.seed, goodGear: r.metrics.goodGear,
    contestShowGear: r.metrics.contestShowGear, craftTradeGear: r.metrics.craftTradeGear,
    corpseGear: r.metrics.corpseGear, gameDays: r.row.gameDays, won: r.row.won,
    waveReach: r.row.waveReach, villageLost: !!r.row.villageLost,
    firstTier3: first ? { day: first.day, id: first.id, source: first.source, tier: first.tier, n: first.n } : null,
    observerErrors: (r.observerErrors || []).length };
});
const k = perSeed.filter(s => s.goodGear === 1).length;
const [lo, hi] = wilson(k, perSeed.length);
const summary = { spec: { seeds, policies: ['competent'], days: 60, metric: 'goodGear' },
  sourceHeadStart: panel.sourceHeadStart, sourceHeadEnd: panel.sourceHeadEnd,
  validity: panel.validity, rate: perSeed.length ? k / perSeed.length : null,
  count: k, n: perSeed.length, wilson95: [lo, hi], perSeed };
const summaryPath = path.join(root, out + '-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
console.log('\nPer-seed goodGear:');
for (const s of perSeed) console.log(`  ${s.seed}: ${s.goodGear} (contest/show ${s.contestShowGear}, craft/trade ${s.craftTradeGear}, corpse ${s.corpseGear})`);
console.log(`\nRate: ${k}/${perSeed.length} = ${summary.rate}  Wilson95: ${lo.toFixed(4)} to ${hi.toFixed(4)}`);
console.log('Summary: ' + summaryPath);
