#!/usr/bin/env node
'use strict';
const T = require('./lib').reporter('garden-coverage-observer');
const C = require('../lib/garden-coverage');
const person = id => ({ id, known: true, nominalKcal: 2000 });
const book = (kcal = 2000) => ({ a: { harvestKcal: { a: kcal }, harvestNourishment: { a: kcal } }, b: { harvestKcal: { a: kcal }, harvestNourishment: { a: kcal } } });
const people = [person('a'), person('b')];
let result = C.coverage(people, people, book());
T.ok('real source must reach each eater, including the harvester', result.harvesters[0].minimumNominalFraction === 1);
result = C.coverage(people, people, { a: book().a });
T.ok('one full diner cannot stand for a whole village', result.harvesters[0].minimumNominalFraction === 0);
result = C.coverage(people, [person('a')], { a: book().a });
T.ok('death or departure cannot erase an unfed mouth', result.required.length === 2 && !result.rosterStable && result.harvesters[0].minimumNominalFraction === 0);
result = C.coverage(people, [...people, person('c')], book());
T.ok('arrivals remain visible in the denominator', result.required.length === 3 && !result.rosterStable && result.harvesters[0].minimumNominalFraction === 0);
result = C.coverage(people, people, book(300));
T.ok('a 300-kcal contribution is distinct from a nominal daily diet', result.harvesters[0].minimumNominalFraction === 0.15);
result = C.coverage(people, [...people, { id: 'unknown', known: false }], book());
T.ok('unknown residents prevent a numeric daily-diet claim', result.unknown.includes('unknown') && result.harvesters[0].minimumNominalFraction === null);
result = C.coverage(people, people, { a: { harvestKcal: { a: 2000 }, harvestNourishment: { a: 0 } } });
T.ok('consumed food without nourishment is not feeding credit', result.harvesters[0].mouthsWithIntake === 0);
result = C.coverage(people, people, { a: { kcal: 5000, nourishment: 5000 } });
T.ok('anonymous production cannot become another persons harvest', result.harvesters.length === 0);
result = C.coverage(people, [person('a')], book(), [people]);
T.ok('a death during settlement is visible even if the mouth was present before meals', !result.rosterStable && result.required.length === 2);
result = C.coverage(people, people, { b: book().b });
T.ok('feeding other people is measured separately from feeding oneself', result.harvesters[0].minimumOtherNominalFraction === 1 && result.harvesters[0].minimumNominalFraction === 0);
const G = { data: { villagers: people.map(p => ({ id: p.id, kcalPerDay: 2000 })) }, villagerId: 'a',
  state: { scholar: { day: 7 }, village: { roster: ['a', 'b'], harvestIntake: { 7: book() } } },
  villageEats() {}, endDay() { this.villageEats(); this.state.scholar.day++; return 'dawn'; } };
const before = JSON.stringify(G.state), observed = C.install(G);
T.ok('installation writes no game state', JSON.stringify(G.state) === before);
T.ok('closure retains original return and records the correct eaten day', G.endDay() === 'dawn' && observed.days[0].day === 7 && observed.days[0].closed && observed.days[0].rosterStable && !observed.errors.length);
G.state.village.harvestIntake[7].a.harvestKcal.a = 0;
T.ok('closed receipts are detached from the rolling game book', observed.days[0].book.a.harvestKcal.a === 2000);
const summarize = require('../garden-coverage-report').summarize;
const panel = { sourcesStable: true, policies: ['maker'], seeds: [7], rows: [{ row: { policy: 'maker', seed: 7 }, warnings: [],
  gardenCoverage: { errors: [], days: [{ day: 7, closed: true, dawn: people, before: people, atMeal: people, after: people,
    book: { a: { harvestNourishment: { a: 2000 } }, b: { harvestNourishment: { b: 2000 } } } }] } }] };
T.ok('the report cannot pool separate harvesters into one whole-village day', summarize(panel).policies[0].allAny === 0);
panel.rows.push(panel.rows[0]);
let rejected = false; try { summarize(panel); } catch (e) { rejected = /Incomplete/.test(e.message); }
T.ok('incomplete or duplicated report cohorts fail closed', rejected);
panel.rows.pop(); panel.rows[0].gardenCoverage.errors.push('sample failed');
rejected = false; try { summarize(panel); } catch (e) { rejected = /Invalid observation/.test(e.message); }
T.ok('observer errors prevent a coverage report', rejected);
panel.rows[0].gardenCoverage.errors = [];
panel.rows[0].gardenCoverage.days[0].book = {};
rejected = false; try { summarize(panel); } catch (e) { rejected = /unknown/.test(e.message); }
T.ok('a source with no observed intake cannot report zero coverage as a finding', rejected);
T.done();
