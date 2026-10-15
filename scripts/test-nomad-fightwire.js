#!/usr/bin/env node
// Proof test: foreign-village encounters are wired into the road UI (nomad-fightwire 2026-10-15).
// The engine (villageEncounter staging, fightVillage real combat) existed but
// nothing in game code or UI called it. This proves the wiring: entering a
// leg stages the encounter, the road UI beat exposes the mood-gated actions,
// and every action routes to the right system honestly.
// Spec: docs/WORLD-REGIONS.md §6; docs/CANON.md (fights_real, hostile_gating).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '7', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

// Start the road with a known-region itinerary (same shape as the
// villagefight proof): global rank, hear trails, depart, enter leg 0.
function startRoad(Game) {
  Game.state.globalLive = true;
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region).slice(0, 3);
  for (const k of kin) Game.hearOfRegion(k.region, 'test');
  const r = Game.nomad.start();
  r.supplies = { food: 200000 };
  Game.nomad.enterLeg(0);
  Game.state.village.health = Game.state.village.health || {};
  for (const id of r.partyIds) Game.state.village.health[id] = 100;
  return r;
}
function captureSay(Game) {
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = (t) => { said.push(String(t)); try { return _say(t); } catch (e) { return t; } };
  return said;
}
const driveOk = (Game) => !!(Game.nomadDrive && typeof Game.nomadDrive.villageTap === 'function' &&
  typeof Game.nomadDrive.pendingVillageEncounter === 'function');

async function main() {
  // ================= LAYER 1: staging on leg entry =================
  {
    const { Game } = await loadGame({ seed: SEED });
    await setupGame(Game, 'Columbus, Ohio');
    ok(driveOk(Game), 'nomadDrive exposes villageTap + pendingVillageEncounter (the wire exists)');
    const road = startRoad(Game); // enterLeg(0) stages the encounter
    const enc = Game.nomadDrive.pendingVillageEncounter();
    ok(!!enc && typeof enc.villageName === 'string' && enc.villageName.length > 2,
      'entering a leg stages a foreign-village encounter (' + (enc && enc.villageName) + ')');
    ok(enc && enc.actions.join(',') === 'trade,join,fight,leave',
      'wary village offers all four actions: ' + (enc && enc.actions.join(',')));
    ok(enc && typeof enc.moodLabel === 'string' && enc.moodLabel.length > 0,
      'encounter carries a mood label for the beat (' + (enc && enc.moodLabel) + ')');
  }

  // ================= LAYER 2: trade routes honestly =================
  {
    const { Game } = await loadGame({ seed: SEED + 1 });
    await setupGame(Game, 'Columbus, Ohio');
    const road = startRoad(Game);
    const W = Game.nomadWild;
    // Warm village -> trade rate 1.4x on a 1000 kcal offer: honest +400.
    road.legs[0].encounterOpen.village.mood = 2;
    let tradeRes = null;
    const _t = W.tradeWith.bind(W);
    W.tradeWith = (v, k) => { tradeRes = _t(v, k); return tradeRes; };
    const before = road.supplies.food;
    Game.nomadDrive.villageTap('trade');
    const after = road.supplies.food;
    ok(!!tradeRes && String(tradeRes.note).indexOf('trade') === 0,
      'trade routes into nomadWild.tradeWith (note: ' + (tradeRes && tradeRes.note) + ')');
    ok(tradeRes && after - before === tradeRes.kcal,
      'supplies change exactly what tradeWith reported (' + (after - before) + ' kcal)');
    ok(!Game.nomadDrive.pendingVillageEncounter(), 'encounter closes after the trade');
  }

  // ================= LAYER 3: join routes into the rest beat =================
  {
    const { Game } = await loadGame({ seed: SEED + 2 });
    await setupGame(Game, 'Columbus, Ohio');
    const road = startRoad(Game);
    const W = Game.nomadWild;
    let joinRes = null;
    const _j = W.joinVillage.bind(W);
    W.joinVillage = (v, d) => { joinRes = _j(v, d); return joinRes; };
    const before = road.supplies.food;
    Game.nomadDrive.villageTap('join');
    const after = road.supplies.food;
    ok(!!joinRes && joinRes.note === 'rested' && joinRes.days === 3,
      'join routes into nomadWild.joinVillage (' + (joinRes && joinRes.days) + ' days)');
    ok(joinRes && after - before === joinRes.kcal && joinRes.kcal > 0,
      'rest fills the packs honestly (+' + (after - before) + ' kcal)');
    ok(!Game.nomadDrive.pendingVillageEncounter(), 'encounter closes after the rest');
  }

  // ================= LAYER 4: fight routes into real combat =================
  {
    const { Game } = await loadGame({ seed: SEED + 3 });
    await setupGame(Game, 'Columbus, Ohio');
    const road = startRoad(Game);
    const W = Game.nomadWild;
    const encVillage = road.legs[0].encounterOpen.village;
    let fightCalled = 0, fightArg = null;
    const _f = W.fightVillage.bind(W);
    W.fightVillage = (v) => { fightCalled++; fightArg = v; return _f(v); };
    const duels = [];
    const _ff = Game.fieldFight.bind(Game);
    Game.fieldFight = (vid, mdef, m, opts) => {
      const snap = JSON.parse(JSON.stringify(mdef));
      const rec = _ff(vid, mdef, m, opts);
      duels.push({ vid, mdef: snap, rec });
      return rec;
    };
    Game.nomadDrive.villageTap('fight');
    ok(fightCalled === 1 && fightArg === encVillage,
      'fight routes into nomadWild.fightVillage with the encounter village');
    ok(duels.length >= 1 && duels.every(d => d.rec && Array.isArray(d.mdef.attack.damage)),
      'fight resolved through REAL fieldFight duels (' + duels.length + '), never an outcome table');
    ok(road.legs[0].encounterOpen === null || !Game.nomadDrive.pendingVillageEncounter(),
      'encounter closes after the fight');
  }

  // ================= LAYER 5: leave walks away =================
  {
    const { Game } = await loadGame({ seed: SEED + 4 });
    await setupGame(Game, 'Columbus, Ohio');
    const road = startRoad(Game);
    const said = captureSay(Game);
    const vname = road.legs[0].encounterOpen.village.name;
    const before = road.supplies.food;
    Game.nomadDrive.villageTap('leave');
    const after = road.supplies.food;
    ok(said.some(s => s.indexOf(vname) >= 0), 'leave narrates the walk-away (' + vname + ')');
    ok(after === before, 'leave costs nothing');
    ok(!Game.nomadDrive.pendingVillageEncounter(), 'encounter closes after leaving');
  }

  // ================= LAYER 6: hostile gating =================
  {
    const { Game } = await loadGame({ seed: SEED + 5 });
    await setupGame(Game, 'Columbus, Ohio');
    const road = startRoad(Game);
    const W = Game.nomadWild;
    const leg = road.legs[0];
    leg.encounterOpen.village.mood = -2;
    leg.encounterOpen = null; // let it re-stage at the new mood
    Game.nomadDrive.stageVillageEncounter(leg); // re-stage at hostile mood
    const enc = Game.nomadDrive.pendingVillageEncounter();
    ok(enc && enc.actions.join(',') === 'fight,leave',
      'hostile village offers only fight/leave: ' + (enc && enc.actions.join(',')));
    const said = captureSay(Game);
    const before = road.supplies.food;
    Game.nomadDrive.villageTap('trade'); // trade is not among the actions
    ok(road.supplies.food === before, 'hostile trade is refused — no calories move');
    ok(!Game.nomadDrive.pendingVillageEncounter(), 'encounter closes after the refusal');
  }

  // ================= LAYER 7: depart clears the open encounter =================
  {
    const { Game } = await loadGame({ seed: SEED + 6 });
    await setupGame(Game, 'Columbus, Ohio');
    const road = startRoad(Game);
    const said = captureSay(Game);
    ok(!!Game.nomadDrive.pendingVillageEncounter(), 'encounter is open on the leg');
    Game.nomad.departLeg();
    ok(!Game.nomadDrive.pendingVillageEncounter(), 'departing the leg clears the encounter');
    ok(said.some(s => s.indexOf('walk past') >= 0), 'walking past narrates the forfeited chance');
  }

  console.log(`\nfightwire: ${pass} passed, ${fail} failed, 0 todo (phase 0)`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
