#!/usr/bin/env node
// Sense probe for sim-flowrate-b: capture food/economy beats from a live run
// and print a readable sample for the SENSE-TESTING LAW read.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const BEAT_RE = /feast|ration|hungr|starv|meal|cook|grumb|eat\b|eating|share|gave|give|food|dinner|breakfast|pantry|shelves|not the rot|smoke rack|spoiled|went bad|mutters/i;

(async () => {
  const { Game } = await loadGame({ seed: 4403, mode: 'flowrate-sense', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const gday = () => { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } };
  const origSay = Game.say.bind(Game);
  Game.say = function (text) {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '')
        .replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 280);
      if (BEAT_RE.test(s)) {
        beats.push({ day: gday(), text: s });
        if (beats.length > 3000) beats.splice(0, 500);
      }
    } catch (e) {}
    return origSay(text);
  };
  const pol = Object.assign({}, leadfeast);
  await quietLog(async () => { await runDays(Game, pol, { days: 60, sampleEvery: 30 }); });
  console.log(`captured ${beats.length} food beats over 60d`);
  // print a stratified sample: first 3, middle 3, last 3 + all spoil voicings
  const spoil = beats.filter(b => /spoiled|went bad|smoke rack/i.test(b.text));
  console.log(`\n-- spoil voicings (${spoil.length} total, showing up to 6) --`);
  const sShow = [...spoil.slice(0, 3), ...spoil.slice(-3)];
  for (const b of sShow) console.log(`d${b.day}: ${b.text}`);
  console.log('\n-- stratified sample --');
  const idx = [0, 1, 2, Math.floor(beats.length / 2) - 1, Math.floor(beats.length / 2), beats.length - 3, beats.length - 2, beats.length - 1]
    .filter(i => i >= 0 && i < beats.length);
  for (const i of [...new Set(idx)]) console.log(`d${beats[i].day}: ${beats[i].text}`);
})().catch(e => { console.error('SENSE PROBE CRASH:', e && e.stack || e); process.exit(2); });
