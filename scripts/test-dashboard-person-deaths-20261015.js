#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib');
const D = require('./sweep-dashboard');
const T = K.reporter('dashboard-person-deaths');
const current = D.summarize([{ days: 100, deaths: { 'player:combat': 1, 'villager:monster': 3, 'person:combat': 6, 'monster:villager combat': 20 }, personDeaths: { villager: { combat: 4 }, hostile: { combat: 2 } } }]);
T.ok('person and field deaths both count as villagers', current.deathTotals.villager === 7);
T.ok('a hostile human the bearer killed stays out of the villager total', current.deathTotals.hostile === 2);
T.ok('monsters killed by villagers remain other deaths', current.deaths.other['villager combat'] === 20);
T.ok('person deaths are not counted twice', current.deathTotals.person === 4 && current.deathTotals.other === 22);
const old = D.summarize([{ days: 100, deaths: { 'villager:monster': 3, 'person:combat': 4 } }]);
T.ok('older rows remain readable without the new split', old.deathTotals.villager === 7);
T.done();
