#!/usr/bin/env node
// sense-waterwatch-20261015.js — SENSE-TESTING LAW read for the cistern-watch.
// Seed 55 (the #291 trajectory: 16-day 0/0 cistern, day-12 scholar
// ranging-dehydration death), armed, 40 days. Prints every 🪣 beat with
// surrounding say-context, plus the dehydration aftermath, for a human read:
// does the watch read as a person deciding, or as a knob?
'use strict';
process.env.WATERWATCH = '1';
const WW = require('./policies/waterwatch.js');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installRangeDehy } = require('./rangedehy-lib-20261015');
const { belongseek } = require('./policies/belongseek');

async function main() {
  const seed = parseInt(process.env.SEED || '55', 10);
  const days = parseInt(process.env.DAYS || '40', 10);
  const { Game } = await loadGame({ seed, mode: 'ww-sense', fullTelemetry: false });
  await setupGame(Game);
  const track = installRangeDehy(Game);
  const policy = WW.waterwatch(belongseek);
  // capture says with day stamps
  const says = [];
  const osay = Game.say.bind(Game);
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  Game.say = function (m) {
    try { says.push({ day: gday(), text: String(m).slice(0, 220) }); } catch (e) {}
    return osay(m);
  };
  await quietLog(async () => { await runDays(Game, policy, { days }); });
  const fin = track.finalize();
  console.log('=== dehydration deaths:', fin.nDehydration, 'thirst deaths:',
    (says.filter(s => /died of thirst/.test(s.text)).length));
  const st = WW.wwState(Game);
  console.log('=== watch ledger: dehyDeathSeen=' + st.dehyDeathSeen + ' deathName=' + st.deathName + ' beats=' + st.totalBeats);
  // every watch beat with +/- 3 lines of context
  const beats = says.map((s, i) => ({ s, i })).filter(({ s }) => s.text.indexOf('🪣') === 0);
  console.log('=== ' + beats.length + ' watch beats in context ===');
  for (const { s, i } of beats) {
    console.log(`--- day ${s.day} ---`);
    for (let j = Math.max(0, i - 3); j <= Math.min(says.length - 1, i + 3); j++) {
      const mark = j === i ? '>>>' : '   ';
      console.log(`${mark} [d${says[j].day}] ${says[j].text}`);
    }
  }
  // dehydration aftermath (sense: does the village react like people?)
  for (const a of (fin.aftermaths || []).slice(0, 2)) {
    console.log(`=== aftermath (death day ${a.day}) ===`);
    for (const l of a.lines.slice(0, 12)) console.log('    ' + l);
  }
  delete process.env.WATERWATCH;
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
