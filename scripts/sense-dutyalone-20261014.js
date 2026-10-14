#!/usr/bin/env node
// scripts/sense-dutyalone-20261014.js — SENSE-TESTING for the DUTYALONE arm.
// Reads real feast transcripts from an armed run and prints the duty's
// cause lines in context, so a human can judge meaning/coherence — not
// just counts. Kill-protocol degradation: INFO-SKIP if the layer is gone.
'use strict';
let DL = null;
try { DL = require('./policies/dutyalone'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: dutyalone layer deleted per kill protocol — see evidence/2026-10-14/sim-dutyalone-r15.md');
    process.exit(0);
  }
  throw e;
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

(async () => {
  const seed = parseInt(process.env.SEED || '44', 10);
  const { Game } = await loadGame({ seed, mode: 'dutyalone-sense', fullTelemetry: false });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { said.push({ day: (Game.state.scholar || {}).day || 0, text: String(t) }); };
  Game.feedback = function () {};
  let ctx = null;
  const base = DL.dutylead;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, c) => { ctx = c; if (origSetup) return origSetup(G, c); };
  await quietLog(async () => { await runDays(Game, policy, { days: 100, manifest: undefined, sampleEvery: 10 }); });
  console.log(`sense run: seed=${seed} days=${(Game.state.scholar || {}).day} dlFeasts=${ctx.dlFeasts || 0} allowFeasts=${ctx.fsFeasts || 0} defer=${ctx.dlDefer || 0}`);
  const dutyLines = said.filter(s => /duty fire burns/.test(s.text));
  const feastBeats = said.filter(s => /🍖 FEAST/.test(s.text));
  console.log(`\n-- duty cause lines (${dutyLines.length}) --`);
  for (const d of dutyLines.slice(0, 6)) {
    const beat = [...feastBeats].reverse().find(b => b.day <= d.day);
    console.log(`\n[day ${d.day}] ${d.text}`);
    if (beat) console.log(`  (preceding feast beat, day ${beat.day}: ${beat.text.slice(0, 200)})`);
  }
  console.log(`\n-- sample allowance feast beats (${feastBeats.length} total, first 3) --`);
  for (const b of feastBeats.slice(0, 3)) console.log(`[day ${b.day}] ${b.text.slice(0, 220)}`);
  try { origSay('sense done'); } catch (e) {}
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
