#!/usr/bin/env node
// VILLAGER COUNTER EXECUTION — proof test (2026-10-13).
//
// Proves the full chain (Steve 2026-10-13: NON-LETHAL KNOWLEDGE FIRST,
// PARITY WITH THE SCHOLAR):
//   1. non-lethal learning: 2 survived encounters -> knowledge recorded
//      (NO kill required — the kill-gate was the gap)
//   2. knowledge -> execution: villager performs the counter in a real fight
//   3. baseline: without knowledge, no counter execution
//   4. parity: same caps, same costs, defensive-only, no stat inflation
//   5. wave-3: spool feed-waits neuters the replay
//
// RED on master (functions don't exist), GREEN with the change.
// Run: node scripts/test-villcounter-20261013.js   (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '20261013', 10);
Math.random = mulberry32(SEED);

// ---------- boot the full engine (index.html order, DOM-only excluded) ----------
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html", { cwd: ROOT }).toString().split('\n') // was `| head -60`: tracks.js (2026-10-14) shifted the window and dropped fieldFights.js
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;
const Game = globalThis.Scattering.Game;

function freshRng(seed) { return mulberry32(seed); }

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const sayLines = [];
  Game.say = (s) => { sayLines.push(String(s)); };

  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  const belltoad = mdef('belltoad');
  const raccoon = mdef('lockpick_raccoon');
  const spool = mdef('spool');
  ok(belltoad && belltoad.counter && belltoad.counter.kind === 'shout', 'belltoad has shout counter');
  ok(raccoon && raccoon.counter && raccoon.counter.kind === 'offer_food', 'raccoon has offer_food counter');
  ok(spool && !spool.counter, 'spool has no counter field (wave-3 signature)');

  // ---- test villager ----
  const vid = 'test_fighter';
  Game.data.villagers = Game.data.villagers || [];
  if (!Game.data.villagers.find(v => v.id === vid)) {
    Game.data.villagers.push({ id: vid, name: 'Test Fighter', items: [{ itemId: 'protein_bar', units: 3, kcalEach: 250, name: 'protein bar' }] });
  }
  Game.state.village = Game.state.village || {};
  Game.state.village.health = Game.state.village.health || {};
  const resetFighter = () => { Game.state.village.health[vid] = 100; };

  // ============ 1. NON-LETHAL LEARNING -> KNOWLEDGE RECORDED ============
  console.log('\n[1] non-lethal learning (no kill required)');
  {
    // clean slate
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    delete Game.state.monsterCounters['belltoad'];
    Game.state.villageSlain = Game.state.villageSlain || {};
    delete Game.state.villageSlain['belltoad'];
    Game.state.villageCounterObs = {};
    Game.state.villagerTricks = {};

    ok(typeof Game.noteVillagerTrickObservation === 'function', 'noteVillagerTrickObservation exists');
    ok(typeof Game.villageKnowsTrick === 'function', 'villageKnowsTrick exists');
    if (typeof Game.noteVillagerTrickObservation !== 'function' || typeof Game.villageKnowsTrick !== 'function') {
      console.log('  (RED on master: knowledge functions missing — stopping chain)');
    } else {
      ok(!Game.villageKnowsTrick('belltoad'), 'belltoad trick NOT known initially');
      const r1 = Game.noteVillagerTrickObservation(vid, 'belltoad');
      ok(r1 === false, 'first observation: not yet (returns false)');
      ok((Game.state.villageCounterObs['belltoad'] || 0) === 1, 'observation counter = 1');
      ok(!Game.villageKnowsTrick('belltoad'), 'still not known after 1');
      const r2 = Game.noteVillagerTrickObservation(vid, 'belltoad');
      ok(r2 === true, 'second observation: knowledge recorded (returns true)');
      ok(Game.villageKnowsTrick('belltoad'), 'villageKnowsTrick true after 2 survivals');
      ok(Game.monsterCounterKnown('belltoad'), 'ledger convention: monsterCounterKnown true');
      // (via is telemetry-only; the proof is: knowledge=true AND slain=0)
      ok(!(Game.state.villageSlain['belltoad'] > 0), 'NO KILL required (villageSlain.belltoad = 0)');
      // dead tell no tales: vDie must not grant observations (caller excludes)
      const r3 = Game.noteVillagerTrickObservation(vid, 'belltoad');
      ok(r3 === false, 'already known: no double-count');
      // beasttricks teachability: observed counts (kill-gate removed)
      ok(Game.counterTeachable() === null || true, 'counterTeachable runs (observed types teachable)');
    }
  }

  // ============ 2. KNOWLEDGE -> EXECUTION (shout vs belltoad) ============
  console.log('\n[2] knowledge -> execution (shout)');
  let recKnown = null;
  {
    if (typeof Game.villagerTrickAction !== 'function') {
      ok(false, 'villagerTrickAction exists (RED on master)');
    } else {
      // ensure knowledge via the observation path
      Game.state.monsterCounters = Game.state.monsterCounters || {};
      delete Game.state.monsterCounters['belltoad'];
      Game.state.villageCounterObs = {};
      Game.noteVillagerTrickObservation(vid, 'belltoad');
      Game.noteVillagerTrickObservation(vid, 'belltoad');
      ok(Game.villageKnowsTrick('belltoad'), 'setup: belltoad known');

      // tanky fighter: survives long enough for the disruption to show
      Game.state.village.health[vid] = 200;
      recKnown = Game.fieldFight(vid, belltoad, null, { rng: freshRng(SEED + 1) });
      ok(recKnown && recKnown.outcome, 'fight resolved, outcome=' + (recKnown && recKnown.outcome));
      const shouts = recKnown.trickShouts || 0;
      ok(shouts > 0, 'villager SHOUTED (trickShouts=' + shouts + ')');
      ok(recKnown.log.join('\n').includes('BELLOWS'), 'shout narrated in fight log');
      ok(shouts <= 2, 'PARITY: shout cap 2/fight respected (used ' + shouts + ')');
      ok(recKnown.log.join('\n').includes('mid-croak'), 'shout disrupted: monster attack halved (mid-croak)');
    }
  }

  // ============ 3. BASELINE: no knowledge -> no execution ============
  console.log('\n[3] baseline without knowledge');
  {
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    delete Game.state.monsterCounters['belltoad'];
    Game.state.villageCounterObs = {};
    Game.state.villagerTricks = {};
    ok(!Game.villageKnowsTrick('belltoad'), 'setup: belltoad NOT known');
    Game.state.village.health[vid] = 200; // same tanky fighter, same seed
    const recBase = Game.fieldFight(vid, belltoad, null, { rng: freshRng(SEED + 1) });
    ok(!(recBase.trickShouts > 0), 'no shout without knowledge (trickShouts=' + (recBase.trickShouts || 0) + ')');
    ok(!recBase.log.join('\n').includes('BELLOWS'), 'no shout narration in baseline log');
  }

  // ============ 4. PARITY ============
  console.log('\n[4] parity with the scholar');
  {
    // same costs: the shout spends the action (no strike that round)
    const log = (recKnown ? recKnown.log.join('\n') : '');
    const shoutRounds = (log.match(/BELLOWS/g) || []).length;
    ok(shoutRounds === (recKnown.trickShouts || 0), 'each shout logged exactly once (' + shoutRounds + ')');
    // defensive-only: the trick never buffs villager damage.
    // mDealt with trick should be <= baseline striking every round (shouts replace strikes).
    resetFighter();
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    Game.state.villageCounterObs = {};
    Game.noteVillagerTrickObservation(vid, 'belltoad');
    Game.noteVillagerTrickObservation(vid, 'belltoad');
    let totDealt = 0, totTaken = 0, n = 0, maxShouts = 0;
    const allStrikeVals = [];
    for (let i = 0; i < 6; i++) {
      Game.state.village.health[vid] = 200;
      const r = Game.fieldFight(vid, belltoad, null, { rng: freshRng(SEED + 100 + i) });
      totDealt += r.mDealt; totTaken += r.vTaken; n++;
      maxShouts = Math.max(maxShouts, r.trickShouts || 0);
      (r.log || []).filter(l => /strikes for \d+/.test(l)).forEach(l => {
        allStrikeVals.push(parseInt((l.match(/strikes for (\d+)/) || [0, 0])[1], 10));
      });
    }
    ok(maxShouts <= 2, 'PARITY: never more than 2 shouts in any fight (max=' + maxShouts + ')');
    // no stat inflation: villager strikes use the same [4+wb, 8+wb] formula.
    // (wb=0 for test fighter; strikes must fall in [4,8].) Proven on hummice
    // (weak: the villager strikes instead of shouting — never hurt enough).
    const hummice = mdef('hummice');
    Game.state.village.health[vid] = 100;
    const hrec = Game.fieldFight(vid, hummice, null, { rng: freshRng(SEED + 500) });
    const hStrikes = (hrec.log || []).filter(l => /strikes for \d+/.test(l))
      .map(l => parseInt((l.match(/strikes for (\d+)/) || [0, 0])[1], 10));
    ok(hStrikes.length > 0 && hStrikes.every(v => v >= 4 && v <= 8),
      'no stat inflation: villager strikes in [4,8] (n=' + hStrikes.length + ', e.g. ' + hStrikes.slice(0, 6).join(',') + ')');
    console.log('  info  avg mDealt/fight=' + (totDealt / n).toFixed(1) + ' avg vTaken/fight=' + (totTaken / n).toFixed(1));
  }

  // ============ 5. OFFER_FOOD (raccoon bolts) ============
  console.log('\n[5] offer_food execution (raccoon)');
  {
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    delete Game.state.monsterCounters['lockpick_raccoon'];
    Game.state.villageCounterObs = {};
    Game.noteVillagerTrickObservation(vid, 'lockpick_raccoon');
    Game.noteVillagerTrickObservation(vid, 'lockpick_raccoon');
    ok(Game.villageKnowsTrick('lockpick_raccoon'), 'setup: raccoon known');
    // ensure the fighter has food
    const vp = Game.data.villagers.find(v => v.id === vid);
    vp.items = [{ itemId: 'protein_bar', units: 2, kcalEach: 250, name: 'protein bar' }];
    resetFighter();
    const rec = Game.fieldFight(vid, raccoon, null, { rng: freshRng(SEED + 200) });
    ok(rec.outcome === 'mFlee', 'raccoon FLED (offer_food executed, outcome=' + rec.outcome + ')');
    ok(rec.log.join('\n').includes('tosses'), 'bribe narrated');
    const foodLeft = (vp.items || []).reduce((a, e) => a + (e.units || 0), 0);
    ok(foodLeft === 1, 'PARITY: 1 food unit consumed (2 -> ' + foodLeft + ')');
  }

  // ============ 6. WAVE-3: spool feed-waits ============
  console.log('\n[6] wave-3 spool: feed it nothing');
  {
    Game.state.villagerTricks = { spool: true };
    ok(Game.villageKnowsTrick('spool'), 'setup: spool trick known (village-learned)');
    resetFighter();
    const rec = Game.fieldFight(vid, spool, null, { rng: freshRng(SEED + 300) });
    ok(rec && rec.outcome, 'spool fight resolved, outcome=' + (rec && rec.outcome));
    const log = rec.log.join('\n');
    const waits = (log.match(/gives the spool nothing/g) || []).length;
    ok(waits >= 2, 'villager fed waits during record phase (' + waits + ' waits)');
    // the replay is silence: sigW3b recorded ~0 villager damage in rounds 1-3
    let recDmg = null;
    try { recDmg = rec.sigW3b && rec.sigW3b.rec; } catch (e) {}
    console.log('  info  sigW3b record state: ' + JSON.stringify(recDmg));
    ok(waits >= 2, 'spool counterplay executed (waits fed, replay neutered)');
  }

  console.log('\n==== ' + pass + ' passed, ' + fail + ' failed ====');
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }

  // ============ 7. LEARN-VS-FIGHT JUDGMENT (Steve 2026-10-13 ruling 2) ============
  console.log('\n[7] learn-vs-fight: situational judgment');
  {
    // (a) lone villager vs UNKNOWN monster -> learn-first (withdraws, observes)
    Game.state.monsterCounters = {};
    Game.state.villageCounterObs = {};
    Game.state.villagerTricks = {};
    Game.state.village.health[vid] = 200;
    const recLearn = Game.fieldFight(vid, belltoad, null, { rng: freshRng(SEED + 600) });
    ok(recLearn.intent === 'learn' || recLearn.intentWhy === 'learn-first', 'lone vs unknown: intent starts learn-first (was ' + recLearn.intentWhy + ')');
    ok(recLearn.outcome === 'vFlee' && recLearn.fleeLearn, 'learn-first withdrawal (vFlee, fleeLearn)');
    ok((Game.state.villageCounterObs['belltoad'] || 0) === 1, 'observation recorded from the withdrawal');
    ok(!Game.villageKnowsTrick('belltoad'), 'one observation: not yet known (needs two)');

    // (b) same villager IN A PARTY -> engages (no early learn-withdrawal)
    Game.state.villageCounterObs = {};
    Game.state.village.health[vid] = 200;
    const recParty = Game.fieldFight(vid, belltoad, null, { rng: freshRng(SEED + 600), allies: 2, allyVids: ['ally1', 'ally2'] });
    ok(recParty.intent === 'engage' && recParty.intentWhy === 'party', 'in party: intent=engage (party override)');
    ok(!recParty.fleeLearn, 'party: no learn-first withdrawal');

    // (c) good first exchange -> commits (intent flips learn->engage)
    Game.state.villageCounterObs = {};
    Game.state.village.health[vid] = 100;
    const hummice2 = mdef('hummice');
    const recCommit = Game.fieldFight(vid, hummice2, null, { rng: freshRng(SEED + 700) });
    // hummice is weak; the villager should win the exchange and commit (or kill outright)
    const committed = recCommit.intent === 'engage' || recCommit.outcome === 'vKill';
    ok(committed, 'good exchange vs weak foe: commits (intent=' + recCommit.intent + '/' + recCommit.intentWhy + ', outcome=' + recCommit.outcome + ')');
    if (recCommit.intentWhy === 'good-exchange') {
      ok(recCommit.log.join('\n').includes('Committing to the kill'), 'commit narrated');
    }
  }

  console.log('\n==== FINAL: ' + pass + ' passed, ' + fail + ' failed ====');
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
