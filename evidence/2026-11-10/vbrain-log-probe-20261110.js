// vbrain-log-probe-20261110.js — dump the dawn-scorer log after a panel run.
// Usage: node evidence/2026-11-10/vbrain-log-probe-20261110.js <repoRoot> <outJson>
// Runs seed 84101, 30d, competent — the person-trust pin conditions — then
// dumps Game.vbrainLogs() and summarizes overrides: how often the dawn
// commitment overrode the core lottery pick, and to what kind.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2];
const OUT = process.argv[3];
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));

(async () => {
  const { Game } = await loadGame({ seed: 84101, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const policy = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  await runDays(Game, policy, { days: 30, quiet: true });
  const logs = (typeof Game.vbrainLogs === 'function') ? Game.vbrainLogs() : [];
  const byOverride = {};
  const byPick = {};
  const byCore = {};
  let overridden = 0, pickNeCore = 0;
  for (const e of logs) {
    byOverride[e.override || '(none)'] = (byOverride[e.override || '(none)'] || 0) + 1;
    byPick[e.pick || '(none)'] = (byPick[e.pick || '(none)'] || 0) + 1;
    byCore[e.corePick || '(none)'] = (byCore[e.corePick || '(none)'] || 0) + 1;
    if (e.override) overridden++;
    if (e.pick && e.corePick && e.pick !== e.corePick) pickNeCore++;
  }
  // Override kind breakdown: pick kind when overridden.
  const overridePicks = {};
  for (const e of logs) {
    if (e.override) overridePicks[e.pick || '(none)'] = (overridePicks[e.pick || '(none)'] || 0) + 1;
  }
  // Core pick -> final pick transitions for overridden entries.
  const transitions = {};
  for (const e of logs) {
    if (e.override) {
      const k = (e.corePick || '?') + '->' + (e.pick || '?');
      transitions[k] = (transitions[k] || 0) + 1;
    }
  }
  const summary = {
    repo: REPO, logEntries: logs.length, overridden, pickNeCore,
    byOverride, byPick, byCore, overridePicks, transitions,
  };
  fs.writeFileSync(OUT, JSON.stringify(logs));
  console.log('VBRAIN ' + JSON.stringify(summary));
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
