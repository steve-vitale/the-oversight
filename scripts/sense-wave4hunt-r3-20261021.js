#!/usr/bin/env node
// Sense-testing for sim-wave4hunt-r3: re-run the armed run with the most
// villager wave-4 kills with narration captured. Read the hunt-to-wave-4
// sequence; judge whether staged villagers behave like people. Quote lines.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 WAVE4HUNT_R3=1 \
//   SEED=64843 BASE=belongfeast node scripts/sense-wave4hunt-r3-20261021.js 2>&1 | tail -120
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));
const W4H3 = require(path.join(REPO, 'scripts', 'policies', 'wave4hunt-r3.js'));

const SEED = parseInt(process.env.SEED || '64843', 10);
const BASE = process.env.BASE || 'belongfeast';
const DAYS = 180;

async function main() {
  const narr = [];
  const { Game } = await loadGame({ seed: SEED, mode: 'wave4hunt-r3-sense', fullTelemetry: false });
  await setupGame(Game);

  // Install narration capture (do NOT silence).
  const oldSay = Game.say.bind(Game);
  const oldSys = Game.sysSay.bind(Game);
  Game.say = (m) => { try { narr.push(`D${(Game.state.scholar||{}).day||0} SAY: ${String(m).slice(0,160)}`); } catch (e) {} };
  Game.sysSay = (m) => { try { narr.push(`D${(Game.state.scholar||{}).day||0} SYS: ${String(m).slice(0,160)}`); } catch (e) {} };

  const policy = W4H3.armedFor(BASE);
  const ctx = {};
  const result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30, ctx });

  Game.say = oldSay; Game.sysSay = oldSys;

  // Filter to wave-4 / hunt / kill-relevant lines.
  const keys = [/wave-4/i, /wave 4/i, /hunt/i, /sortie/i, /THE /i, /slain/i, /kills/i, /down!/i, /yield/i, /break off/i, /companion/i, /w4h3/i, /retreat/i, /flees/i, /funeral/i, /body/i];
  const hits = narr.filter(l => keys.some(k => k.test(l)));
  console.log(`=== SENSE s${SEED}-${BASE} armed: narration hits ===`);
  console.log(`total narr lines: ${narr.length}, hits: ${hits.length}`);
  const late = hits.filter(l => { const m = l.match(/^D(\d+)/); return m && +m[1] >= 60; });
  console.log(`late (D60+) hits: ${late.length}`);
  for (const h of late) console.log(h);
  console.log('=== END ===');
  // Full narration to /tmp for grep (scratch, not the repo).
  require('fs').writeFileSync('/tmp/w4h3-sense-full.log', narr.join('\n'));
  console.log('endReason=' + result.endReason + ' days=' + ((Game.state.scholar||{}).day||0));
}
main().catch(e => { console.error('SENSE FAIL:', e && e.message); process.exit(1); });
