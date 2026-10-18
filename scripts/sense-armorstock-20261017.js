#!/usr/bin/env node
// scripts/sense-armorstock-20261017.js — sense-test for the quartermaster
// protocol: one ARMORSTOCK=1 run with full logging, grepping the transcript
// for the quartermaster beats (recovery / craft / succession / reserve) and
// printing them in context. SENSE-TESTING LAW: an armor handoff must read as
// a person equipping another person (or a person holding the village's armor),
// not a stat shuffle.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     SEATDRIVE=0 ARMORSTOCK=1 node scripts/sense-armorstock-20261017.js [seed] [policy]
'use strict';
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const AS = require('./policies/armorstock');
const { loadGame, setupGame, runDays } = require('./sim-harness');

const SEED = parseInt(process.argv[2] || '4101117', 10);
const POLICY = process.argv[3] || 'leadfeast';

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required.`);
  }
  if (process.env.SEATDRIVE !== '0') throw new Error('SUBSTRATE STOP: SEATDRIVE must be 0.');
  if (process.env.ARMORSTOCK !== '1') throw new Error('SENSE STOP: ARMORSTOCK=1 required.');
}

(async () => {
  assertSubstrate();
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  const base = POLICY === 'leadfeast' ? SD.leadseat : SD.belongseat;
  const { Game } = await loadGame({ seed: SEED, mode: 'armorstock-sense', fullTelemetry: false });
  await setupGame(Game);
  const policy = AS.withArmorstock(base, 'sense', 'sense');
  const sayLines = [];
  const oSay = Game.say;
  Game.say = function (m, ...rest) {
    try { sayLines.push(`d${Game.state.scholar.day}: ${String(m).slice(0, 220)}`); } catch (e) {}
    return oSay ? oSay.call(this, m, ...rest) : undefined;
  };
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { SD.layerOn(); WD.layerOn(); if (oSetup) return oSetup(G, ctx); };
  // NOTE: no quietLog — we want the transcript.
  const result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 });
  console.log(`seed=${SEED} policy=${POLICY} days=${result.days} end=${result.endReason} w4=${result.maxWaveUnlocked >= 4}`);
  const beats = sayLines.filter(l => /quartermaster|mantle passes|hide armor|reserve/i.test(l));
  console.log(`\n== QUARTERMASTER BEATS (${beats.length}) ==`);
  for (const b of beats.slice(0, 40)) console.log('  ' + b);
  // armor-context lines around each beat (the 2 lines before/after in the log)
  console.log('\n== BEAT CONTEXT (2 before / 2 after) ==');
  for (const b of beats.slice(0, 10)) {
    const i = sayLines.indexOf(b);
    for (let j = Math.max(0, i - 2); j <= Math.min(sayLines.length - 1, i + 2); j++) {
      console.log((j === i ? '>>> ' : '    ') + sayLines[j]);
    }
    console.log('---');
  }
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
