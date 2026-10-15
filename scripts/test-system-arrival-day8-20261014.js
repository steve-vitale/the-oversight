#!/usr/bin/env node
// Journey landing r15 (2026-10-14): the System arrival fires on the sleep
// ending day 7 — the player wakes on day 8 (probe: scholar.day=8 when
// systemArrived flips). But systemArrivalBeats' opening beat said
// "Day 7. Dawn." — fiction off by one from the clock the player sees.
// RED: beats[0] says "Day 7". GREEN: beats[0] says "Day 8".
const { loadGame, setupGame } = require('./sim-harness');
async function main() {
  const lg = await loadGame({ seed: 45, fullTelemetry: true });
  const Game = lg.Game;
  await setupGame(Game);
  const beats = Game.systemArrivalBeats() || [];
  const first = beats[0] || {};
  const text = ((first.lines || [])[0] || {}).text || '';
  console.log('beat id:', first.id, '| kicker:', first.kicker);
  console.log('first line:', text);
  let fail = 0;
  if (/Day 8/.test(text)) console.log('PASS: opening beat says Day 8');
  else { console.log('FAIL: opening beat does not say Day 8'); fail++; }
  if (/Day 7/.test(text)) { console.log('FAIL: stale Day 7 text remains'); fail++; }
  else console.log('PASS: no stale Day 7 text');
  console.log(fail ? `\nRESULT: FAIL (${fail})` : '\nRESULT: PASS');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
