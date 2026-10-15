#!/usr/bin/env node
// Proof test: foreign-village fights resolve through REAL combat (nomad-wild 2026-10-15).
// Steve's law: villager fights are played blow-by-blow with real stats and real
// behaviors — never a single outcome table. This proves fightVillage() routes
// through fieldFight honestly: real rounds, real attack data, real wounds,
// real deaths on the road.
// Spec: docs/WORLD-REGIONS.md §6; docs/CANON.md (fights_real).
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

function startRoad(Game) {
  Game.state.globalLive = true;
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region).slice(0, 3);
  for (const k of kin) Game.hearOfRegion(k.region, 'test');
  const r = Game.nomad.start();
  r.supplies = { food: 200000 };
  Game.nomad.enterLeg(0);
  // deterministic full health for the party
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

async function main() {
  // ================= LAYER 1: real combat integration =================
  {
    const { Game } = await loadGame({ seed: SEED });
    await setupGame(Game, 'Columbus, Ohio');
    const W = Game.nomadWild;
    ok(!!W && typeof W.fightVillage === 'function', 'nomadWild.fightVillage loaded');

    const said = captureSay(Game);
    const road = startRoad(Game);
    const party = road.partyIds.slice();
    ok(party.length >= 2, 'party mustered (' + party.length + ' walkers)');

    // Wrap fieldFight: capture every duel's inputs and record.
    const seen = [];
    const _ff = Game.fieldFight.bind(Game);
    Game.fieldFight = (vid, mdef, m, opts) => {
      const snap = JSON.parse(JSON.stringify(mdef));
      const rec = _ff(vid, mdef, m, opts);
      seen.push({ vid, mdef: snap, rec });
      return rec;
    };

    const village = W.genLegVillage();
    village.population = 6; // -> 3 defenders
    village.mood = -2; // hostile: they fight
    Game.state.moralLedger = Game.state.moralLedger || {};
    const foodBefore = road.supplies.food;
    const pantryBefore = village.pantryKcal;
    const raidsBefore = (Game.state.moralLedger && Game.state.moralLedger.raids) || 0;

    const res = W.fightVillage(village);

    console.log('== L1: real combat, not a table ==');
    ok(seen.length >= 1, 'fieldFight entered (' + seen.length + ' duels)');
    ok(seen.every(s => s.rec && s.rec.rounds > 0), 'every duel ran real rounds (' + seen.map(s => s.rec.rounds).join(',') + ')');
    ok(seen.every(s => s.rec && Array.isArray(s.rec.log) && s.rec.log.length >= 2), 'every duel logged its blows');
    const atkNames = seen.map(s => (s.mdef.attack && s.mdef.attack.name) || '?');
    ok(seen.every(s => s.mdef.attack && Array.isArray(s.mdef.attack.damage) && s.mdef.attack.name !== 'attack'),
      'defenders carry REAL attack data, not the generic fallback (' + atkNames.join(', ') + ')');
    ok(seen.every(s => typeof s.vid === 'string' && party.includes(s.vid)),
      'fighters fight as themselves (' + seen.map(s => s.vid).join(', ') + ')');
    const learned = ((Game.state.villagePatterns || {})['leg_defender']) || {};
    ok(Object.keys(learned).some(k => k !== 'attack'),
      'the village learned a real move (villagePatterns: ' + Object.keys(learned).join(',') + ')');

    console.log('== L1: outcome honesty ==');
    const duelOutcomes = seen.map(s => s.rec.outcome);
    const allWon = seen.length > 0 && duelOutcomes.every(o => o === 'vKill' || o === 'mFlee');
    ok(res.won === allWon, 'won matches the duels [' + duelOutcomes.join(',') + '] -> won=' + res.won);
    ok(Array.isArray(res.duels) && res.duels.length === seen.length, 'duel record returned (' + (res.duels || []).length + ')');

    console.log('== L1: wounds and deaths persist ==');
    let woundsOk = true;
    for (const s of seen) {
      const after = (Game.state.village.health || {})[s.vid];
      const expect = s.rec.outcome === 'vDie' ? 0 : Math.max(0, Math.round(s.rec.vHpLeft));
      if (after !== expect) { woundsOk = false; console.log('    wound mismatch for ' + s.vid + ': health=' + after + ' expected=' + expect); }
    }
    ok(woundsOk, "each fighter's health carries exactly what the rounds did");
    const deaths = seen.filter(s => s.rec.outcome === 'vDie');
    const fallenIds = (road.fallen || []).map(f => f.id);
    ok(deaths.every(s => !road.partyIds.includes(s.vid) && fallenIds.includes(s.vid)),
      'fallen fighters leave the party and enter the fallen (' + deaths.length + ' deaths this fight)');
    for (const s of seen) {
      if (s.rec.outcome !== 'vDie') ok(road.partyIds.includes(s.vid), 'survivor still walks: ' + s.vid);
    }

    console.log('== L1: road state ==');
    if (res.won) {
      const gained = road.supplies.food - foodBefore;
      ok(gained >= 4000 && gained <= 8000, 'raid takes 4000-8000 kcal (+' + gained + ')');
      ok(village.pantryKcal === pantryBefore - gained, 'village pantry actually lost it');
      ok(((Game.state.moralLedger || {}).raids || 0) === raidsBefore + 1, 'the ledger remembers the raid');
    } else {
      const lost = foodBefore - road.supplies.food;
      ok(lost === Math.round(foodBefore * 0.25), 'driven off costs a quarter of the packs (-' + lost + ')');
    }
    ok(W.villageMood(village) === -2, 'village remembers (mood -2)');

    console.log('== L1: transcript ==');
    const t = said.join('\n');
    ok(/doesn't run/.test(t) && t.includes(village.name), 'the meeting beat names the village');
    ok(res.won ? /yields/.test(t) : /drive you off/.test(t), 'the outcome beat narrates honestly');
    console.log('--- fight transcript (sense-check) ---');
    for (const line of said) console.log('    | ' + line);
    console.log('--- duel log sample ---');
    if (seen[0]) for (const line of seen[0].rec.log.slice(0, 6)) console.log('    > ' + line);
  }

  // ================= LAYER 2: deterministic bookkeeping (scripted records) =================
  {
    const { Game } = await loadGame({ seed: SEED + 1 });
    await setupGame(Game, 'Columbus, Ohio');
    const W = Game.nomadWild;
    const road = startRoad(Game);
    const party = road.partyIds.slice();
    Game.state.moralLedger = {};

    const script = [];
    Game.fieldFight = (vid, mdef, m, opts) => script.shift() || { outcome: 'vKill', rounds: 3, vTaken: 10, vHpLeft: 90, mDealt: 60, log: ['scripted'] };

    console.log('== L2: forced win ==');
    const v1 = W.genLegVillage(); v1.population = 6; v1.mood = -2;
    const f1 = road.supplies.food, p1 = v1.pantryKcal;
    for (let i = 0; i < 4; i++) script.push({ outcome: 'vKill', rounds: 3, vTaken: 10, vHpLeft: 90, mDealt: 60, log: ['scripted'] });
    const r1 = W.fightVillage(v1);
    ok(r1.won === true && r1.note === 'raid', 'all duels won -> raid');
    ok(r1.kcal >= 4000 && r1.kcal <= 8000 && road.supplies.food === f1 + r1.kcal, 'supplies grow by the take (+' + r1.kcal + ')');
    ok(v1.pantryKcal === p1 - r1.kcal, 'village pantry drained by the take');
    ok(Game.state.moralLedger.raids === 1, 'moral ledger counts the raid');
    ok(W.villageMood(v1) === -2, 'mood -2 after raid');

    console.log('== L2: death on the road ==');
    const v2 = W.genLegVillage(); v2.population = 6; v2.mood = -2;
    const doomed = road.partyIds[0];
    const bearerDied = doomed === road.bearerId;
    const oldBearer = Game.villagerId;
    script.push({ outcome: 'vDie', rounds: 5, vTaken: 100, vHpLeft: 0, mDealt: 20, log: ['scripted'] });
    const r2 = W.fightVillage(v2);
    ok(r2.won === false, 'a fallen fighter breaks the line -> driven off');
    ok(!road.partyIds.includes(doomed), 'the fallen leaves the party');
    ok((road.fallen || []).some(f => f.id === doomed && /raiding/.test(f.cause)), 'fallen recorded with cause');
    ok(Game.state.village.health[doomed] === 0, 'health 0 for the fallen');
    if (bearerDied) ok(Game.villagerId !== oldBearer || !road.partyIds.length, 'the mantle passed (or the road ended)');
    else ok(Game.villagerId === oldBearer, 'bearer untouched when a companion falls');

    console.log('== L2: driven off breaks the line ==');
    const v3 = W.genLegVillage(); v3.population = 6; v3.mood = -2;
    const f3 = road.supplies.food;
    let calls = 0;
    Game.fieldFight = () => { calls++; return { outcome: 'vFlee', rounds: 4, vTaken: 25, vHpLeft: 75, mDealt: 10, log: ['scripted'] }; };
    const r3 = W.fightVillage(v3);
    ok(calls === 1, 'one lost duel ends the fight (' + calls + ' duels)');
    ok(r3.won === false && r3.note === 'driven off', 'driven off');
    ok(road.supplies.food === f3 - Math.round(f3 * 0.25), 'quarter of packs lost');
  }

  // ================= LAYER 3: encounter + hostile gating =================
  {
    const { Game } = await loadGame({ seed: SEED + 2 });
    await setupGame(Game, 'Columbus, Ohio');
    const W = Game.nomadWild;
    const road = startRoad(Game);
    captureSay(Game);

    console.log('== L3: encounter ==');
    const v = W.genLegVillage();
    const e1 = W.villageEncounter(v);
    ok(e1.village === v && v.met === true, 'the meeting is staged and remembered');
    ok(JSON.stringify(e1.actions) === JSON.stringify(['trade', 'join', 'fight', 'leave']),
      'wary village offers trade/join/fight/leave');
    v.mood = -2;
    const e2 = W.villageEncounter(v);
    ok(JSON.stringify(e2.actions) === JSON.stringify(['fight', 'leave']), 'hostile village: fight or leave only');
    const f0 = road.supplies.food;
    const tr = W.tradeWith(v, 1000);
    ok(tr.note === 'hostile' && tr.kcal === 0 && road.supplies.food === f0, 'hostile villages would rather bleed than barter');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS FAILURE:', e); process.exit(2); });
