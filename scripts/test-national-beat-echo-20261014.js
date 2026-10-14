#!/usr/bin/env node
// scripts/test-national-beat-echo-20261014.js — proof test for the
// journey-scale-r2 blank: the national beat (the court sat / the oath was
// sworn) never entered the village's social fabric — no villager ever
// mentioned the realm.
// RED: with nationalLive set and days passed, scaleDiscoveryDaily produces
// no villager echo of the court.
// GREEN: a shape-aware villager echo fires once, a few days after the beat.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SHAPE = process.env.SHAPE || 'lead';

(async () => {
  const { Game } = await loadGame({ seed: 21, mode: 'natbeat-echo-proof', fullTelemetry: false });
  const captured = [];
  const _say = Game.say;
  Game.say = function (s) { if (typeof s === 'string') captured.push(s); try { return _say.apply(this, arguments); } catch (e) {} };
  await setupGame(Game);
  const day = (Game.state.scholar || {}).day || 0;
  // simulate the post-beat state: the court sat 4 days ago on the LEAD road
  Game.state.nationalLive = true;
  Game.state.nationalDay = day - 4;
  Game.state.nationalShape = SHAPE;
  Game.state.nationalPrimary = 'village_2';
  // clear any prior scaleDiscover echoes so the beat echo is the signal
  for (let i = 0; i < 5; i++) {
    try { Game.state.scholar.day = day + i; } catch (e) {}
    try { Game.scaleDiscoveryDaily(); } catch (e) { /* ignore */ }
  }
  const echoes = captured.filter(s => /at the fire, not quite believing it/.test(s));
  const echoFires = (Game.state.scaleDiscover || {}).natBeatEcho;
  console.log(`shape=${SHAPE} echoLines=${echoes.length} natBeatEchoFired=${!!echoFires}`);
  if (!echoes.length) {
    console.log('RED (bug present): the village never mentions the court');
    process.exit(1);
  }
  // once-only: run 5 more days, assert no second echo
  const n0 = echoes.length;
  for (let i = 5; i < 10; i++) {
    try { Game.state.scholar.day = day + i; } catch (e) {}
    try { Game.scaleDiscoveryDaily(); } catch (e) {}
  }
  const echoes2 = captured.filter(s => /at the fire, not quite believing it/.test(s));
  if (echoes2.length !== n0) {
    console.log(`FAIL: echo fired more than once (${n0} -> ${echoes2.length})`);
    process.exit(2);
  }
  console.log('GREEN: sample: ' + echoes[0].slice(0, 160));
  process.exit(0);
})().catch(e => { console.error('FATAL', e && e.message); process.exit(3); });
