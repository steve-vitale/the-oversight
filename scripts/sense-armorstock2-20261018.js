#!/usr/bin/env node
// scripts/sense-armorstock2-20261018.js — sense-test for the REBUILT
// quartermaster protocol (sim-armorstock2, 2026-10-18): one ARMORSTOCK=1 run
// on the seatdrive+VETREL substrate with full logging, grepping the
// transcript for the quartermaster beats (recovery / craft / succession /
// wear) and printing them in context. SENSE-TESTING LAW: a quartermaster
// beat must read as a person recovering and crafting armor, not a ledger
// line.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     VETREL=1 ARMORSTOCK=1 node scripts/sense-armorstock2-20261018.js [seed] [policy]
'use strict';
const AS = require('./policies/armorstock');
const { loadGame, setupGame, runDays } = require('./sim-harness');

const SEED = parseInt(process.argv[2] || '5102117', 10);
const POLICY = process.argv[3] || 'leadseat';

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'VETREL']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required.`);
  }
  if (process.env.SEATDRIVE === '0') throw new Error('SUBSTRATE STOP: SEATDRIVE must be default-ON.');
  if (process.env.ARMORSTOCK !== '1') throw new Error('SENSE STOP: ARMORSTOCK=1 required.');
}

(async () => {
  assertSubstrate();
  const base = POLICY === 'leadseat' ? AS.armorstock2Lead : AS.armorstock2Belong;
  const { Game } = await loadGame({ seed: SEED, mode: 'armorstock2-sense', fullTelemetry: false });
  await setupGame(Game);
  const sayLines = [];
  const oSay = Game.say;
  Game.say = function (m, ...rest) {
    try { sayLines.push(`d${Game.state.scholar.day}: ${String(m).slice(0, 240)}`); } catch (e) {}
    return oSay ? oSay.call(this, m, ...rest) : undefined;
  };
  // NOTE: no quietLog — we want the transcript.
  const result = await runDays(Game, base, { days: 180, manifest: undefined, sampleEvery: 30 });
  console.log(`seed=${SEED} policy=${POLICY} days=${result.days} end=${result.endReason} w4=${result.maxWaveUnlocked >= 4} won=${!!Game.won}`);
  const beats = sayLines.filter(l => /shouldn't rot with them|mantle passes|cut plates from the hide/i.test(l));
  console.log(`\n== QUARTERMASTER BEATS (${beats.length}) ==`);
  for (const b of beats.slice(0, 40)) console.log('  ' + b);
  console.log('\n== BEAT CONTEXT (2 before / 2 after) ==');
  for (const b of beats.slice(0, 12)) {
    const i = sayLines.indexOf(b);
    for (let j = Math.max(0, i - 2); j <= Math.min(sayLines.length - 1, i + 2); j++) {
      console.log((j === i ? '>>> ' : '    ') + sayLines[j]);
    }
    console.log('---');
  }
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
