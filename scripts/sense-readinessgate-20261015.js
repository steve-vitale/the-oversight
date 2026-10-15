#!/usr/bin/env node
// scripts/sense-readinessgate-20261015.js — SENSE-TEST the deferral beat and
// post-release wave-4 content. Replays a deterministic seed/policy from the
// sweep (same harness, same seeds) with beat capture, then dumps the
// deferral beat, the release/wave-4 unlock beats, and the first wave-4
// fight transcript after release for human reading.
//   SEED=11 POLICY=leadfeast DAYS=110 node scripts/sense-readinessgate-20261015.js
// DAYS defaults to 180. Runs against the ARMED tree (the gate must be in).
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

const SEED = parseInt(process.env.SEED || '11', 10);
const POLICY = process.env.POLICY || 'leadfeast';
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  const base = POLICY === 'belongfeast' ? belongfeast : leadfeast;
  const { Game } = await loadGame({ seed: SEED, mode: `sense-readiness-${POLICY}` });
  await quietLog(async () => { await setupGame(Game); });
  const beats = [];
  const origSysSay = Game.sysSay, origSay = Game.say;
  const stamp = () => { try { return 'd' + ((Game.state.scholar || {}).day || 0); } catch (e) { return 'd?'; } };
  Game.sysSay = function (t) { try { beats.push({ day: stamp(), kind: 'sys', text: String(t).slice(0, 700) }); } catch (e) {} if (origSysSay) return origSysSay.call(Game, t); };
  Game.say = function (t) { try { beats.push({ day: stamp(), kind: 'say', text: String(t).slice(0, 700) }); } catch (e) {} if (origSay) return origSay.call(Game, t); };
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  const waves = [];
  policy.daily = (G, ctx) => {
    try { waves.push([((G.state.scholar || {}).day || 0), (typeof G.unlockedWave === 'function') ? (G.unlockedWave() | 0) : 1]); } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });
  let wave4Day = null;
  for (const [d, w] of waves) if (w >= 4 && wave4Day == null) wave4Day = d;
  console.log(`run: ${POLICY}/s${SEED} days=${result.days} ${result.endReason}`);
  console.log(`\n--- deferral / wave beats (sys) ---`);
  for (const b of beats) {
    if (b.kind !== 'sys') continue;
    if (/HELD|Mirror Draft|Producers|System's attention|System's eye|not in the business of burying|casting directives/i.test(b.text)) {
      console.log(`[${b.day}] ${b.text}`);
    }
  }
  console.log(`\n--- first wave-4 unlock area: combat-flavored beats near the unlock ---`);
  let unlockIdx = -1;
  for (let i = 0; i < beats.length; i++) {
    if (/wave 4|Wave 4|MIRROR DRAFT/i.test(beats[i].text)) { unlockIdx = i; break; }
  }
  if (unlockIdx >= 0) {
    for (const b of beats.slice(Math.max(0, unlockIdx - 2), unlockIdx + 8)) {
      console.log(`[${b.day}/${b.kind}] ${b.text.slice(0, 420)}`);
    }
  } else {
    console.log('(no wave-4 unlock beat in this window)');
  }
  console.log(`\n--- death lines in the 30d after a wave-4 unlock (holder story) ---`);
  let shown = 0;
  for (const b of beats) {
    const bd = parseInt(String(b.day).slice(1), 10);
    if (wave4Day != null && bd >= wave4Day && bd <= wave4Day + 30 && /died|slain|killed|buried|funeral/i.test(b.text) && shown < 12) {
      console.log(`[${b.day}/${b.kind}] ${b.text.slice(0, 420)}`);
      shown++;
    }
  }
  if (!shown) console.log('(no death lines in the window, or no wave-4 unlock)');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
