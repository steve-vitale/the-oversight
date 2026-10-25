#!/usr/bin/env node
// scripts/test-w5chain-sense.js — SENSE-ONLY replay for sim-w5chain-a.
// NON-MEASURED: narration replays never enter the census (the harness
// notes narration can shift trajectories). Purpose: capture ONE
// gate-relevant excerpt — the defer5 hold beat ("The fifth draft
// stays in the wings") in context — on the band seed that actually
// reaches capped >= 200 (73675: 37 defer5 days in the census).
// Seed 73675, tableseat-nowait substrate (LEANLINKRESCUE=1,
// TABLESEATNOWAIT=1), 135 days. Wraps Game.say AND Game.sysSay after
// setup (hold beats speak through sysSay); the wraps only record
// text and call the original, drawing no RNG.
// Usage: node scripts/test-w5chain-sense.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));

const HOLD_RE = /fifth draft stays in the wings/i;
const CTX_RE = /fifth draft|not bought with bread alone|stays in the wings|RATINGS ARE UP|armor the village|weapons in hands|learn their tricks|blood your fighters|next act is|Mirror Draft|Producers/i;

(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed: 73675, mode: 'w5chain-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const beats = [];
  const recent = [];
  const wrap = (name) => {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function (x) {
      try {
        const s = String(x);
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (CTX_RE.test(s)) { recent.push(`[d${day}] ${s.slice(0, 300)}`); if (recent.length > 14) recent.shift(); }
        if (HOLD_RE.test(s)) beats.push({ day, text: s.slice(0, 500), context: recent.slice(-6, -1) });
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  };
  wrap('say'); wrap('sysSay');
  await quietLog(async () => { await runDays(Game, tableseatNowait, { days: 135, manifest: undefined, sampleEvery: 30 }); });
  console.log(`=== w5chain sense replay: seed=73675 tableseat-nowait narration=on, ${beats.length} defer5 hold beats over 135d (NON-MEASURED) ===`);
  for (const b of beats.slice(0, 6)) {
    console.log(`\n--- d${b.day} ---`);
    for (const c of b.context) console.log('    ' + c);
    console.log('>>> ' + b.text);
  }
  if (!beats.length) console.log('(no defer5 hold beat fired in this replay)');
})().catch(e => { console.error('W5CHAIN SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
