#!/usr/bin/env node
// test-nomadwild-village.js — foreign-village encounters on a leg.
// RED: Game.nomadWild undefined (module absent).
// GREEN: village generates as people; trade/join narrate honestly;
// SENSE: transcripts read for meaning (villagers act like people).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('nomadwild-village');

async function main() {
  const Game = await K.load({ seed: 21, narration: true });
  K.newRun(Game);
  const NW = Game.nomadWild;
  T.ok('nomadWild loaded', !!NW);

  const roster = (Game.state.village.roster || []).slice(0, 3);
  Game.state.road = {
    active: true, partyIds: roster, supplies: 8000,
    legs: [{ regionId: 'eu_temperate' }], legIndex: 0,
  };

  T.section('generation');
  const v = NW.genLegVillage('eu_temperate');
  T.ok('village generated', !!v && !!v.name, JSON.stringify(v && v.name));
  T.ok('has a speaker with name+role', !!(v.speaker && v.speaker.name && v.speaker.role),
    JSON.stringify(v.speaker));
  T.ok('population 6-10', v.population >= 6 && v.population <= 10, String(v.population));
  T.ok('pantry stocked', (v.pantryKcal || 0) > 5000, String(v.pantryKcal));
  T.ok('mood starts wary (0)', NW.villageMood(v) === 0);
  T.ok('same village returned twice', NW.genLegVillage('eu_temperate') === v);

  T.section('trade');
  const sup0 = Game.state.road.supplies;
  const pan0 = v.pantryKcal;
  const tr = NW.tradeWith(v, 2000);
  T.ok('trade moves kcal through packs', Game.state.road.supplies === sup0 - 2000 + Math.round(2000 * 1.0),
    `before ${sup0} after ${Game.state.road.supplies}`);
  T.ok('village pantry decreased', v.pantryKcal < pan0, `${pan0} -> ${v.pantryKcal}`);
  T.ok('generous trade warms mood', NW.villageMood(v) === 1, String(NW.villageMood(v)));
  T.ok('trade narrates', tr.note === 'trade' || tr.note === 'trade + knowledge', tr.note);
  // Sense: the trade line must name the village and the speaker.
  const log = (Game.log || []).join('\n');
  T.ok('transcript names village', log.includes(v.name), 'village name in log');
  T.ok('transcript names speaker', log.includes(v.speaker.name), 'speaker name in log');

  T.section('trade refuses honestly when broke');
  Game.state.road.supplies = 100;
  const broke = NW.tradeWith(v, 5000);
  T.ok('insufficient-supplies trade blocked', broke.kcal === 0 && /haven't got/i.test((Game.log || []).join('\n').slice(-400)));

  T.section('join briefly');
  Game.state.road.supplies = 8000;
  const j = NW.joinVillage(v, 3);
  T.ok('join rests the party', j.note === 'rested' && j.days === 3, JSON.stringify(j));
  T.ok('join feeds packs', (j.kcal || 0) > 0, String(j.kcal));
  T.ok('hostile villages refuse', (() => { v.mood = -2; const r2 = NW.joinVillage(v, 2); v.mood = 0; return r2.note === 'refused'; })());

  T.done();
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
