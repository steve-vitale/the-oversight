#!/usr/bin/env node
// scripts/sense-trapvoice-b.js — sense-test transcript capture for sim-trapvoice-b.
// Re-runs belongfeast/s41104 (the L2 scholar, 20 catches) on the FIXED tree with
// the FULL say log (day-stamped), then prints every trap-line window with ±8
// lines of surrounding dawn patter for human sense judgment.
// TOOLING ONLY.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');

const SEED = Number(process.env.SEED || 41104);
const POLICY = process.env.POLICY || 'belongfeast';
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-19', `sense-trapvoice-b-${POLICY}-s${SEED}.json`);

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'trapvoice-sense-' + POLICY });
  await setupGame(Game);
  const log = [];
  const oSay = Game.say;
  Game.say = function (msg) {
    let day = 0;
    try { day = (Game.state.scholar || {}).day || 0; } catch (e) {}
    try { log.push({ day, text: String(msg) }); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const base = POLICY_REGISTRY[POLICY];
  if (!base) throw new Error('unknown policy ' + POLICY);
  let result;
  await quietLog(async () => { result = await runDays(Game, base, { days: 180, sampleEvery: 10 }); });
  fs.writeFileSync(OUT, JSON.stringify({ seed: SEED, policy: POLICY, days: result.gameDays, endReason: result.endReason, log }, null, 2) + '\n');
  // Print trap-line windows.
  const isTrap = e => e.text.includes('🪤 TRAP:') || e.text.includes('sits empty');
  const idx = log.map((e, i) => isTrap(e) ? i : -1).filter(i => i >= 0);
  console.log(`seed ${SEED} ${POLICY}: ${result.gameDays}d, ${result.endReason}, ${log.length} say lines, ${idx.length} trap lines`);
  let shown = 0;
  for (const i of idx) {
    if (shown >= 6) break;
    // skip if this window overlaps the previous shown window
    shown++;
    console.log(`\n--- day ${log[i].day} (log #${i}) ---`);
    for (let j = Math.max(0, i - 8); j <= Math.min(log.length - 1, i + 3); j++) {
      const mark = j === i ? '>>> ' : '    ';
      console.log(`${mark}[d${log[j].day}] ${log[j].text.slice(0, 200)}`);
    }
  }
  console.log('\nfull log:', OUT);
}
main().catch(e => { console.error('SENSE FAILED:', e); process.exit(1); });
