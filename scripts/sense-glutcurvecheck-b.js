#!/usr/bin/env node
// sense-glutcurvecheck-b.js — transcript dump for the SENSE-TESTING read.
//
// Runs one armed seed (the gluttiest control config, leadfeast 8805) and
// dumps the governor's voice beat plus surrounding econ lines, so the
// sense read can judge whether the beat reads as a villager choice
// ("honest foraging practice") or System spam.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 \
//   node scripts/sense-glutcurvecheck-b.js [seed] [days]
// Writes evidence/2026-10-20/glutcurvecheck-sense.txt (once, on purpose).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
const SEED = parseInt(process.argv[2] || '8805', 10);
const DAYS = parseInt(process.argv[3] || '90', 10);
const OUT = 'evidence/2026-10-20/glutcurvecheck-sense.txt';

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'glutcurvecheck-sense', fullTelemetry: false });
  await setupGame(Game);
  const W = attachProbe(Game);
  W.sfeed = { govCalls: 0, trimCalls: 0, trimKcal: 0, days: {} };
  const o = Game.surplusFeedGovernor;
  if (typeof o === 'function') Game.surplusFeedGovernor = function (v, give) {
    const r = o.apply(this, arguments);
    try {
      W.sfeed.govCalls++;
      if (r < give) {
        W.sfeed.trimCalls++; W.sfeed.trimKcal += (give - r);
        const d = dayOf(Game);
        const cell = W.sfeed.days[d] || (W.sfeed.days[d] = { trimCalls: 0, trimKcal: 0 });
        cell.trimCalls++; cell.trimKcal += (give - r);
      }
    } catch (e) {}
    return r;
  };
  await runDays(Game, leadfeast, { days: DAYS, manifest: null });

  const lines = [];
  lines.push(`# glutcurvecheck sense — armed SURPLUSFEED=1, leadfeast seed ${SEED}, ${DAYS}d`);
  lines.push(`# trim: ${Math.round(W.sfeed.trimKcal)} kcal over ${Object.keys(W.sfeed.days).length}d (${W.sfeed.trimCalls} trims / ${W.sfeed.govCalls} gov calls)`);
  lines.push('');
  // governor beats + context (2 lines before/after)
  const beatIdx = [];
  W.sayLines.forEach((s, i) => { if (/groaning pantry shelves|No point hauling/i.test(s.line)) beatIdx.push(i); });
  lines.push(`# governor voice beats: ${beatIdx.length}`);
  for (const i of beatIdx) {
    lines.push('--- beat context ---');
    for (let j = Math.max(0, i - 2); j <= Math.min(W.sayLines.length - 1, i + 2); j++) {
      lines.push(`[d${W.sayLines[j].day}] ${W.sayLines[j].line}`);
    }
  }
  lines.push('');
  lines.push('# all captured econ lines mentioning surplus/pantry-full/throttle/glut on trim days');
  const trimDays = new Set(Object.keys(W.sfeed.days).map(Number));
  for (const s of W.sayLines) {
    if (trimDays.has(s.day) && /pantry|surplus|glut|throttl|fresh/i.test(s.line)) {
      lines.push(`[d${s.day}] ${s.line}`);
    }
  }
  fs.mkdirSync('evidence/2026-10-20', { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n') + '\n');
  console.log(`wrote ${OUT} (${beatIdx.length} governor beats, ${lines.length} lines)`);
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
