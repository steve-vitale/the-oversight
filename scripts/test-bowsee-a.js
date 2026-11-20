#!/usr/bin/env node
// scripts/test-bowsee-a.js — proof test, arm sim-bowsee-a (finding #2590,
// serve half: departure-site seeing).
//
// Proves the DEPARTSEE seeing rule in villagerStageBow step 3
// (game.js): when a spear-holder attempts the departure bow craft,
// a party-mate's EQUIPPED bow visible at the departure site seeds
// lv[bow] = 1 for the crafter, exactly at the craft attempt. The
// crafter still needs materials and still faces the blind 35%
// craft roll; a blind success still teaches (PRACTICE). A spear in
// a mate's ranged slot does not count (volleyWeaponOf, the
// SPEARGATE read). Solo departures (no win-plan party) seed
// nothing. The mechanism draws no Math.random itself — verified
// statically over the block and by counting draws around the call.
// The duty is called DIRECTLY on a staged village (the
// proof-lootabilities-w3 pattern): Math.random is stubbed around
// each staging call so the 35% roll succeeds (0.01) or fails (0.99)
// deterministically, and restored right after.
//
// Usage: node scripts/test-bowsee-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
process.env.DAYS = '5';
process.env.SENSEEXPED = '1';
process.env.BOWOPEN = '1';
process.env.SPEARGATE = '1';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  // ---- 1. Static wiring ----
  const game = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  check('DEPARTSEE env gate read in villagerStageBow', /process\.env\.DEPARTSEE === '1'/.test(game));
  check('seeing block present (party-mate bow, weapon_see telemetry)', /DEPARTSEE \(sim-bowsee-a/.test(game) && /weapon_see/.test(game));
  const seeBlock = (game.split('DEPARTSEE (sim-bowsee-a')[1] || '').split("const LADDER = ['bow', 'crude_bow']")[0];
  check('seeing block reads the win-plan party + volleyWeaponOf', /winPlan/.test(seeBlock) && /volleyWeaponOf/.test(seeBlock));
  check('seeing block seeds lv[bow] = 1 only when the crafter lacks it', /\(lv\.bow \|\| 0\) < 1/.test(seeBlock) && /lv\.bow = 1/.test(seeBlock));
  // Strip full-line // comments before the draw check: the block's
  // own comment names Math.random ("no Math.random draw..."), which
  // is prose, not a draw. The check must read code, not comments.
  const seeCode = seeBlock.split('\n').filter(function (ln) { return ln.trim().indexOf('//') !== 0; }).join('\n');
  check('seeing block draws no Math.random (draw-neutral by construction)', seeCode.indexOf('Math.random') === -1 && !/\bR\s*\(/.test(seeCode));

  // ---- 2. Staged village (seed 31031, same pattern as test-bowknow-a.js) ----
  const g2 = await loadGame({ seed: 31031, mode: 'bowsee-stage' });
  const G = g2.Game;
  check('villagerStageBow callable', typeof G.villagerStageBow === 'function');
  if (typeof G.villagerStageBow !== 'function') { console.log('BOWSEE_FAILS ' + failed); process.exit(1); }
  const teleEvents = [];
  const origTele = G.tele;
  G.tele = function (t, d) { try { teleEvents.push({ t: t, d: d }); } catch (e) {} return origTele.apply(this, arguments); };
  const sayLines = [];
  const origSay = G.say;
  G.say = function () { try { sayLines.push(String(arguments[0] || '')); } catch (e) {} return origSay.apply(this, arguments); };
  await quietLog(async () => { await setupGame(G); });
  const v = G.state.village || {};
  const vessel = G.villagerId;
  const others = (v.roster || []).filter(function (id) { return id !== vessel; });
  check('roster has >=4 non-vessel villagers', others.length >= 4, others);
  const learner = others[0];
  const mate = others[1];
  const bystander = others[2];
  const person = function (vid) { return G.getPerson(vid); };
  const EQ = (globalThis.Scattering || {}).equipment;
  const resetVillager = function (vid) {
    const p = person(vid);
    p.items = []; p.equipped = {}; p.stashed = []; p.dead = false;
    if (v.away) delete v.away[vid];
    return p;
  };
  const setPile = function (mats) {
    const st = G.stashState();
    for (const m of ['wood', 'branch', 'stone', 'fiber', 'stick', 'vine', 'bark']) st.materials[m] = 0;
    Object.assign(st.materials, mats);
    try { st.weapons = []; } catch (e) {}
    return st.materials;
  };
  const equippedId = function (vid, slot) { const e = (person(vid).equipped || {})[slot]; return e ? (e.itemId || e.id || null) : null; };
  const setDepartsee = function (on) { if (on) process.env.DEPARTSEE = '1'; else delete process.env.DEPARTSEE; };
  // stage(roll): reset the staging counters, run villagerStageBow on
  // the learner with Math.random stubbed to `roll`, return the draws
  // consumed (the counting wrapper proves draw-neutrality).
  const stage = function (roll) {
    v.bowOpen = {}; v.bowOpenByVid = {};
    let draws = 0;
    const origRandom = Math.random;
    try {
      Math.random = function () { draws++; return roll; };
      const out = G.villagerStageBow(learner);
      return { out: out, draws: draws };
    } finally { Math.random = origRandom; }
  };
  const knowledgeOf = function (vid) { return (v.weaponCraft || {})[vid] || {}; };
  const seeTeleFor = function (vid) { return teleEvents.filter(function (e) { return e.t === 'weapon_see' && e.d && e.d.vid === vid; }); };
  const stageSource = function () { return ((v.bowOpenByVid || {})[learner] || {}).source || null; };
  const setPlan = function (holderVid, party) {
    v.winPlan = {};
    v.winPlan[holderVid] = { party: party.slice(), stage: 'hunt', target: 'audit', needWave: 4 };
  };
  const setSpearHolderWithBowMate = function () {
    resetVillager(learner);
    resetVillager(mate);
    resetVillager(bystander);
    v.weaponCraft = {};
    const lp = person(learner);
    lp.items = ['hunting_spear'];
    if (EQ) EQ.autoEquip(lp, G.data.items);
    const mp = person(mate);
    mp.items = ['bow'];
    if (EQ) EQ.autoEquip(mp, G.data.items);
    setPlan(learner, [mate]);
  };
  if (G.map) { G.map.px = v.px != null ? v.px : 4; G.map.py = v.py != null ? v.py : 4; }

  // M1: DEPARTSEE OFF — a bow-carrying party-mate seeds NOTHING.
  console.log('\n=== M1: flag off — no seeding at the departure craft (old behavior) ===');
  setDepartsee(false);
  setSpearHolderWithBowMate();
  setPile({ wood: 5, vine: 5 });
  teleEvents.length = 0; sayLines.length = 0;
  console.log('before: learner ranged=' + equippedId(learner, 'ranged') + ' mate ranged=' + equippedId(mate, 'ranged') + ' knows=' + JSON.stringify(knowledgeOf(learner)));
  const m1 = stage(0.01);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' draws=' + m1.draws);
  check('M1 learner holds the spear in the ranged slot', equippedId(learner, 'ranged') === 'hunting_spear', equippedId(learner, 'ranged'));
  check('M1 mate holds the bow in the ranged slot', equippedId(mate, 'ranged') === 'bow', equippedId(mate, 'ranged'));
  check('M1 flag off: learner bow knowledge stays 0', (knowledgeOf(learner).bow | 0) === 0, JSON.stringify(knowledgeOf(learner)));
  check('M1 flag off: staging records noSource (no craft attempted)', stageSource() === 'noSource', stageSource());
  check('M1 flag off: no weapon_see telemetry', seeTeleFor(learner).length === 0, JSON.stringify(seeTeleFor(learner)));
  check('M1 flag off: no seeing line spoken', !sayLines.some(function (s) { return /holds their bow up where/.test(s); }), JSON.stringify(sayLines));
  const offRecord = JSON.stringify(v.weaponCraft);

  // M2: DEPARTSEE ON — the same mate bow seeds the craft, which succeeds.
  console.log('\n=== M2: flag on — the mate bow seeds lv[bow], the craft succeeds ===');
  setDepartsee(true);
  setSpearHolderWithBowMate();
  setPile({ wood: 5, vine: 5 });
  teleEvents.length = 0; sayLines.length = 0;
  const m2 = stage(0.01);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' ranged=' + equippedId(learner, 'ranged') + ' seeTele=' + JSON.stringify(seeTeleFor(learner)) + ' draws=' + m2.draws);
  check('M2 flag on: learner gains bow knowledge (lv>=1; 2 after a blind success)', (knowledgeOf(learner).bow | 0) >= 1, JSON.stringify(knowledgeOf(learner)));
  check('M2 flag on: staging records crafted', stageSource() === 'crafted', stageSource());
  check('M2 flag on: the staged bow is seated in the ranged slot', equippedId(learner, 'ranged') === 'bow', equippedId(learner, 'ranged'));
  check('M2 flag on: weapon_see telemetry names learner + mate + departure site', seeTeleFor(learner).some(function (e) { return e.d.by === mate && e.d.item === 'bow' && e.d.site === 'departure'; }), JSON.stringify(seeTeleFor(learner)));
  check('M2 flag on: the seeing is witnessed aloud at home', sayLines.some(function (s) { return /holds their bow up where/.test(s); }), JSON.stringify(sayLines));
  check('M2 flag on: exactly one craft draw (the 35% roll — the seeing drew none)', m2.draws === 1, 'draws=' + m2.draws);

  // M3: flag off, repeat — byte-identical to M1 (the (f) control).
  console.log('\n=== M3: flag off repeat — byte-identical to M1 ===');
  setDepartsee(false);
  setSpearHolderWithBowMate();
  setPile({ wood: 5, vine: 5 });
  teleEvents.length = 0; sayLines.length = 0;
  const m3 = stage(0.01);
  check('M3 flag-off repeat: weaponCraft record identical to M1', JSON.stringify(v.weaponCraft) === offRecord, JSON.stringify(v.weaponCraft) + ' vs ' + offRecord);
  check('M3 flag-off repeat: learner still untaught, noSource again', (knowledgeOf(learner).bow | 0) === 0 && stageSource() === 'noSource', JSON.stringify(knowledgeOf(learner)) + ' ' + stageSource());
  check('M3 flag-off repeat: no weapon_see telemetry', seeTeleFor(learner).length === 0, JSON.stringify(seeTeleFor(learner)));

  // M4: DEPARTSEE ON, but the mate holds a SPEAR — no bow is seen.
  console.log('\n=== M4: flag on, mate holds a spear — nothing is seen ===');
  setDepartsee(true);
  setSpearHolderWithBowMate();
  const mp4 = person(mate);
  mp4.items = ['hunting_spear'];
  if (EQ) EQ.autoEquip(mp4, G.data.items);
  setPile({ wood: 5, vine: 5 });
  teleEvents.length = 0;
  const m4 = stage(0.01);
  console.log('after: mate ranged=' + equippedId(mate, 'ranged') + ' learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource());
  check('M4 mate holds the spear in the ranged slot', equippedId(mate, 'ranged') === 'hunting_spear', equippedId(mate, 'ranged'));
  check('M4 spear-mate seeds NOTHING (flag on)', (knowledgeOf(learner).bow | 0) === 0, JSON.stringify(knowledgeOf(learner)));
  check('M4 spear-mate: staging records noSource', stageSource() === 'noSource', stageSource());
  check('M4 spear-mate: no weapon_see telemetry', seeTeleFor(learner).length === 0, JSON.stringify(seeTeleFor(learner)));

  // M5: DEPARTSEE ON, mate bow visible, NO materials — seeded but noSource.
  console.log('\n=== M5: flag on, mate bow, no materials — seeded but no bow ===');
  setDepartsee(true);
  setSpearHolderWithBowMate();
  setPile({});
  teleEvents.length = 0;
  const m5 = stage(0.01);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' draws=' + m5.draws);
  check('M5 no-materials: lv[bow] is seeded to 1 anyway', (knowledgeOf(learner).bow | 0) === 1, JSON.stringify(knowledgeOf(learner)));
  check('M5 no-materials: staging records noSource (nothing to make it from)', stageSource() === 'noSource', stageSource());
  check('M5 no-materials: weapon_see still fired (the seeing happened)', seeTeleFor(learner).length === 1, JSON.stringify(seeTeleFor(learner)));
  check('M5 no-materials: ZERO Math.random draws (seeing draws none, no roll fires)', m5.draws === 0, 'draws=' + m5.draws);

  // M6: DEPARTSEE ON, mate bow, materials, FAILING roll — seeded but failed.
  console.log('\n=== M6: flag on, mate bow, materials, failing roll — seeded but failed ===');
  setDepartsee(true);
  setSpearHolderWithBowMate();
  setPile({ wood: 5, vine: 5 });
  teleEvents.length = 0;
  const m6 = stage(0.99);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' draws=' + m6.draws);
  check('M6 failing roll: lv[bow] stays 1 (seeded, not taught by success)', (knowledgeOf(learner).bow | 0) === 1, JSON.stringify(knowledgeOf(learner)));
  check('M6 failing roll: staging records craftedFail', stageSource() === 'craftedFail', stageSource());
  check('M6 failing roll: exactly one craft draw', m6.draws === 1, 'draws=' + m6.draws);

  // M7: DEPARTSEE ON, the plan is held by the MATE (learner is the
  // companion) — the companion-side lookup still seeds.
  console.log('\n=== M7: flag on, learner departs as the companion — plan lookup finds the mate ===');
  setDepartsee(true);
  setSpearHolderWithBowMate();
  setPlan(mate, [learner]);
  setPile({ wood: 5, vine: 5 });
  teleEvents.length = 0; sayLines.length = 0;
  const m7 = stage(0.01);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' seeTele=' + JSON.stringify(seeTeleFor(learner)));
  check('M7 companion-side: learner gains bow knowledge', (knowledgeOf(learner).bow | 0) >= 1, JSON.stringify(knowledgeOf(learner)));
  check('M7 companion-side: staging records crafted', stageSource() === 'crafted', stageSource());
  check('M7 companion-side: weapon_see names the mate as seer', seeTeleFor(learner).some(function (e) { return e.d.by === mate; }), JSON.stringify(seeTeleFor(learner)));

  // M8: DEPARTSEE ON, NO win-plan party (solo departure) — nothing seeds.
  console.log('\n=== M8: flag on, solo departure (no party) — nothing is seen ===');
  setDepartsee(true);
  setSpearHolderWithBowMate();
  v.winPlan = {};
  setPile({ wood: 5, vine: 5 });
  teleEvents.length = 0;
  const m8 = stage(0.01);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource());
  check('M8 solo departure: lv[bow] stays 0', (knowledgeOf(learner).bow | 0) === 0, JSON.stringify(knowledgeOf(learner)));
  check('M8 solo departure: staging records noSource', stageSource() === 'noSource', stageSource());
  check('M8 solo departure: no weapon_see telemetry', seeTeleFor(learner).length === 0, JSON.stringify(seeTeleFor(learner)));

  console.log('\nBOWSEE ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — FAILS: ' + fails.join('; ') : ''));
  process.exit(failed ? 1 : 0);
}

main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
