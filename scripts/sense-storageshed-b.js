#!/usr/bin/env node
// sense-storageshed-b.js — SENSE-TESTING for the STORAGESHED day voice.
// Runs one armed seed, captures every shed voice line + the surrounding
// day-stream, and prints them for a human read: does the voice name real
// instead-of work? Does it verbatim-loop? Do villagers read like people?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 STORAGESHED=1 SEED=9101 DAYS=60
//   POLICY=leadfeast node scripts/sense-storageshed-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEED = parseInt(process.env.SEED || '9101', 10);
const DAYS = parseInt(process.env.DAYS || '60', 10);
const POLICY = (process.env.POLICY || 'leadfeast') === 'belongfeast' ? belongfeast : leadfeast;

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-storageshed', fullTelemetry: false });
  await setupGame(Game);
  const shedLines = [], dayStream = [];
  const oSay = Game.say;
  Game.say = function (s) {
    try {
      const t = String(s);
      if (/^🍽️ /.test(t)) shedLines.push({ day: (Game.state.scholar || {}).day, line: t });
      dayStream.push({ day: (Game.state.scholar || {}).day, line: t });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await runDays(Game, POLICY, { days: DAYS, manifest: null });
  Game.say = oSay;
  console.log(`=== SHED VOICE LINES (${shedLines.length}) ===`);
  for (const s of shedLines) console.log(`day ${s.day}: ${s.line}`);
  const uniq = new Set(shedLines.map(s => s.line));
  console.log(`unique lines: ${uniq.size}/${shedLines.length}`);
  // consecutive-day repeats?
  let repeats = 0;
  for (let i = 1; i < shedLines.length; i++)
    if (shedLines[i].line === shedLines[i - 1].line) repeats++;
  console.log(`consecutive-day verbatim repeats: ${repeats}`);
  // sample: days around the first 2 shed voices, full stream
  const sampleDays = [...new Set(shedLines.slice(0, 2).map(s => s.day))];
  console.log(`=== DAY STREAM SAMPLE (days ${sampleDays.join(',')}) ===`);
  for (const d of sampleDays) {
    console.log(`--- day ${d} ---`);
    for (const s of dayStream.filter(x => x.day === d).slice(0, 40)) console.log(s.line);
  }
  // ledger summary
  const lg = (Game.state.village || {})._storageShed;
  if (lg) {
    const days = Object.keys(lg.days || {});
    console.log(`ledger: ${days.length} shed days, vids seen: ${[...new Set(days.flatMap(d => (lg.days[d] || {}).vids || []))].length}`);
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
