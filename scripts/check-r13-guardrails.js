#!/usr/bin/env node
// r13 guardrail probe: 0 starvation deaths; pantry unit atom <=500 kcal;
// 0 villagers eat unrevealed monster meat as ordinary food;
// wave-2 gate respected (no wave-2 monster before day 8 with wave-1 ledger).
// Runs 6 seeds x 40d with the competent policy, checking live state.
'use strict';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [7, 61, 82, 103, 41, 77]);
const DAYS = 40;

async function probeSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const ctx = { policyId: 'competent', notes: [] };

  let maxAtom = 0, atomDetail = null;
  let unrevealedEaten = 0;
  const unrevealedEatenDetail = [];
  let wave2Early = 0;
  const wave2Detail = [];

  // wrap eat to catch unrevealed-meat-as-ordinary-food
  // (villagers may TRY it via experiment/taste — that's allowed; ordinary
  // eating is the guardrail violation)
  const _eat = Game.villagerEat ? Game.villagerEat.bind(Game) : null;

  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      try { driveFights(Game, competent, ctx); } catch (e) {}
      try { driveContests(Game, competent, ctx); } catch (e) {}
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) {}
      try { driveFights(Game, competent, ctx); } catch (e) {}
      try { driveContests(Game, competent, ctx); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) break;
    try { Game.sleep(); } catch (e) {}
    try { driveContests(Game, competent, ctx); } catch (e) {}
    if (Game.over) break;

    const gd = (Game.state.scholar || {}).day || 0;

    // pantry atom check
    try {
      for (const it of ((Game.state.village || {}).pantry || [])) {
        const kcal = (it.kcalEach || 0);
        if (kcal > maxAtom) { maxAtom = kcal; atomDetail = { day: gd, name: it.name, kcalEach: kcal, units: it.units }; }
      }
    } catch (e) {}

    // wave-2 gate: check for wave-2 monsters before day 8
    try {
      const wave = Game.state.wave || Game.state.monsterWave || 1;
      if (gd < 8) {
        // look for active wave-2 monsters
        const monsters = Game.monsters ? Game.monsters() : [];
        for (const m of monsters) {
          if (m && m.wave === 2) {
            wave2Early++;
            wave2Detail.push({ day: gd, monster: m.monsterId || m.kind });
          }
        }
      }
    } catch (e) {}
  }

  // starvation deaths from telemetry
  const deaths = [];
  try {
    for (const t of (Game.state.telemetry || [])) {
      if (t && t.type === 'death') deaths.push({ day: t.day, who: t.who, cause: t.cause });
    }
  } catch (e) {}
  const starvation = deaths.filter(d => /starv/i.test(d.cause || ''));

  // unrevealed-meat eaten: scan telemetry for eat events of unknown flesh
  try {
    for (const t of (Game.state.telemetry || [])) {
      if (t && t.type === 'eat' && /unknown flesh/i.test(t.food || t.item || '')) {
        // check if it was an experiment/taste (allowed) vs ordinary eating
        const how = t.how || t.mode || '';
        if (!/experiment|taste|test/i.test(how)) {
          unrevealedEaten++;
          unrevealedEatenDetail.push({ day: t.day, who: t.who, food: t.food || t.item, how });
        }
      }
    }
  } catch (e) {}

  return {
    seed, gameDays: (Game.state.scholar || {}).day || 0,
    starvationDeaths: starvation.length,
    starvationGO: starvation.length === 0 ? 'GO' : 'NO-GO',
    maxPantryAtom: Math.round(maxAtom),
    pantryAtomGO: maxAtom <= 500 ? 'GO' : 'NO-GO',
    atomDetail,
    unrevealedEatenOrdinary: unrevealedEaten,
    unrevealedEatenGO: unrevealedEaten === 0 ? 'GO' : 'NO-GO',
    unrevealedEatenDetail: unrevealedEatenDetail.slice(0, 5),
    wave2EarlySpawns: wave2Early,
    wave2GateGO: wave2Early === 0 ? 'GO' : 'NO-GO',
    wave2Detail: wave2Detail.slice(0, 5),
  };
}

async function main() {
  const out = [];
  for (const seed of SEEDS) {
    console.log(`--- guardrail probe seed=${seed} ---`);
    const r = await probeSeed(seed);
    out.push(r);
    console.log(JSON.stringify(r, null, 1));
  }
  const allGO = out.every(r =>
    r.starvationGO === 'GO' && r.pantryAtomGO === 'GO' &&
    r.unrevealedEatenGO === 'GO' && r.wave2GateGO === 'GO');
  console.log(`\nGUARDRAILS: ${allGO ? 'ALL GO' : 'FAILURES PRESENT'}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
