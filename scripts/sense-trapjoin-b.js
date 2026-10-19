#!/usr/bin/env node
// scripts/sense-trapjoin-b.js — sense-test transcript capture for
// sim-trapjoin-b (SENSE-TESTING LAW: read the trapping transcripts).
//
// Runs seed 6624 (the high-engagement on-side seed: 3 duties, 2 joiner
// catches) with TRAPJOIN=1 and captures every narrated line about pits,
// traps, teaching, and joiners — the catches, the teachings, the welcomes.
// Judge meaning/coherence, never just counts.
//
// Output: evidence/2026-10-19/sense-trapjoin-b.txt
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 TRAPJOIN=1 node scripts/sense-trapjoin-b.js
'use strict';
const fs = require('fs');
const path = require('path');

(async () => {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const TJ = require('./policies/trapjoin');
  const { Game } = await loadGame({ seed: 6624, mode: 'leanwinter', fullTelemetry: true });
  await setupGame(Game);

  const lines = [];
  const oSay = Game.say ? Game.say.bind(Game) : null;
  const oTele = Game.tele ? Game.tele.bind(Game) : null;
  const KEY = /🪤|pit|trap|snare|teach|walks in|joined|Haven grows|trust/i;
  if (oSay) {
    Game.say = function (text) {
      try { if (KEY.test(String(text))) lines.push(`[d${((this.state || {}).scholar || {}).day || 0}] SAY: ${text}`); } catch (e) {}
      return oSay.apply(this, arguments);
    };
  }
  const TELEKEY = /^(pit_teach|pit_overhear|pit_lesson|npc_pit|npc_trap)$/;
  if (oTele) {
    Game.tele = function (t, d) {
      try {
        if (TELEKEY.test(t)) {
          const day = ((this.state || {}).scholar || {}).day || 0;
          lines.push(`[d${day}] TELE ${t}: ${JSON.stringify(d)}`);
        }
      } catch (e) {}
      return oTele.apply(this, arguments);
    };
  }

  // don't quietLog — we want the transcript; but suppress the per-tick noise
  // by keeping the say interceptor selective (above).
  const result = await runDays(Game, TJ.trapjoinLead, { days: 180 });
  const out = path.join(__dirname, '..', 'evidence', '2026-10-19', 'sense-trapjoin-b.txt');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const header = `sense-trapjoin-b — seed 6624, TRAPJOIN=1, ${result.days}d (${result.endReason})\n` +
    `Captured ${lines.length} trap/teach/join lines. Read for meaning, not counts.\n` +
    `=`.repeat(70) + `\n`;
  fs.writeFileSync(out, header + lines.join('\n') + '\n');
  console.log(`wrote ${out} (${lines.length} lines, ${result.days}d)`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
