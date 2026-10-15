#!/usr/bin/env node
// test-nomadwild-travel.js — travel events between legs.
// RED: Game.nomadWild undefined (module absent).
// GREEN: events fire with honest narration; sharpenTrail is guarded
// (works with and without the sibling's nomad-scenes).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('nomadwild-travel');

async function main() {
  const Game = await K.load({ seed: 33, narration: true });
  K.newRun(Game);
  const NW = Game.nomadWild;
  T.ok('nomadWild loaded', !!NW);

  const roster = (Game.state.village.roster || []).slice(0, 2);
  Game.state.road = {
    active: true, partyIds: roster, supplies: 6000,
    legs: [{ regionId: 'sa_amazon' }, { regionId: 'eu_temperate' }], legIndex: 0,
  };

  T.section('events fire');
  const kinds = new Set();
  for (let i = 0; i < 12; i++) {
    const ev = NW.travelEvent();
    T.ok('event has kind+note', !!ev.kind && !!ev.note, JSON.stringify(ev.kind));
    kinds.add(ev.kind);
  }
  T.ok('multiple event kinds seen', kinds.size >= 2, [...kinds].join(','));

  T.section('sharpenTrail guarded without sibling');
  delete Game.nomadScenes;
  const ev2 = NW.travelEvent(); // must not throw
  T.ok('no crash without nomad-scenes', !!ev2.kind);

  T.section('sharpenTrail called with sibling present');
  let sharpened = null;
  Game.nomadScenes = { sharpenTrail: (who) => { sharpened = who; } };
  // Force the stranger branch by stubbing random into [0.35, 0.7).
  const origRandom = Math.random;
  Math.random = () => 0.5;
  // Ensure there's a scattered kin to name (clear the run's own kin first).
  Game.state.world = Game.state.world || { kin: [] };
  Game.state.world.kin = [];
  Game.state.world.kin.push({ owner: 'x', name: 'Test Kin', relation: 'sister', region: 'eu_temperate', fate: 'scattered', found: false });
  const ev3 = NW.travelEvent();
  Math.random = origRandom;
  T.ok('stranger event names the kin', ev3.kind === 'stranger' && /Test Kin/.test(ev3.note), ev3.note.slice(0, 120));
  T.ok('sharpenTrail received the name', sharpened === 'Test Kin', String(sharpened));

  T.done();
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
