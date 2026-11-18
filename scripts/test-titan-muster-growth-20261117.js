#!/usr/bin/env node
// test-titan-muster-growth-20261117.js — PROOF for the journey-deepening
// r236 one-short growth line.
//
// THE DEFECT (r235): a village one blade short of the 10-blade muster
// sits silent for weeks. The call is the ONLY moment quotas are re-read,
// and the policy sounds it once per link-count change — so trust that
// grows between calls (gifts +10, weekly tribute, funeral mend) sits
// unharvested until a new link forms. r235's 103601 called twice (d64,
// d73), gathered 6 allies + 3 Haven, and sat at exactly 9 blades for 27
// straight days. The war council computes the projection live, but
// nobody sits the council again — there is no signal that re-sounding
// the call would help.
//
// THE FIX (src/js/titans.js):
// - Game.titanMusterGrowth(titanId): PURE, DAWN-SAFE projection — what a
//   re-sounded call would bring NOW. Replays the call's per-link math
//   (refusal bars, trusted quota 6 else 2, already committed, free adults
//   from rosters AS THEY STAND) + the Haven two-tap pool (cap 3). No
//   roster generation, no RNG, no mutation. A never-generated roster
//   counts 0 (undercount, never overclaim).
// - titanMusterGrowthLine(day): dawn voice, once per growth, for a short
//   muster with harvestable > 0. Names the fire that warmed most + the
//   Haven volunteers if any. Dedupe lives on the muster
//   (muster._growthSaid); sounding the call or committing Haven re-arms
//   it (both verbs store the post-act harvestable).
//
// RED (before): Game.titanMusterGrowth is undefined; the dawn tick never
// says the growth line no matter how far trust climbs.
// GREEN (after): the cases below.
//
// Usage: node scripts/test-titan-muster-growth-20261117.js [seed...]
//   Defaults to seeds 90121 90122. Exit non-zero on any failed assert.
'use strict';
const path = require('path');
const assert = require('assert');
const REPO = process.env.MUSTER_REPO || path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

const GROWTH_KEY = 'The fires have warmed since the call';

function adultRoster(prefix, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ id: prefix + '_p' + i, name: 'Ember ' + i, age: 30, alive: true, health: 100, partner: null, children: [] });
  return out;
}

function link(id, other, trust) {
  return { id: 'link_' + id, primary: 'haven', subordinate: other, trust: trust, arrears: 0, history: [], status: 'active', theirSpeaker: null };
}

// Fixture A (allied growth): Emberhold base-quota (trust 69, roster 8),
// Refusals (trust 10, NO roster — a refusing link whose roster the call
// never generates). The call brings 2 allied blades; Haven's commit
// takes up to 3 from the harness village roster.
async function runAlliedSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'muster-growth-proof' });
  await setupGame(Game);
  // FEED THE MUSTER: upkeep is 1000 kcal/blade/day, and a hungry muster
  // bleeds link trust −2/day — which would drag Emberhold back below the
  // trusted bar between the line and the harvest. Stock the scholar's
  // pack with finished food (100,000 kcal) so trust moves only when the
  // test moves it.
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.inventory = Game.state.scholar.inventory || [];
  Game.state.scholar.inventory.push({ id: 'test_loaf', name: 'Test loaf', kcalEach: 1000, units: 100 });
  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  const growthLines = () => said.filter(t => t.indexOf(GROWTH_KEY) !== -1);
  // r236 FIX (dawn-tail drain): the growth line no longer fires inside
  // titanDawnTick — game.js dawn calls it LAST, after the waiting
  // outings set out, so it names the pool a morning call would find.
  // Mirror that order here: tick, then the late-dawn line.
  const dawnTick = async () => {
    await quietLog(async () => { Game.titanDawnTick(); });
    await quietLog(async () => { Game.titanMusterGrowthLine(Game.state.scholar.day); });
  };

  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 60;
  Game.state.otherVillages = [
    { id: 'v_ember', name: 'Emberhold', population: 12, opinion: 20, day: 40, roster: adultRoster('v_ember', 8) },
    { id: 'v_refuse', name: 'Refusals', population: 20, opinion: 0, day: 0 },
  ];
  assert.strictEqual('roster' in Game.state.otherVillages[1], false, 'seed ' + seed + ': Refusals must start roster-less');
  const m = Game.mshipState();
  m.links = [link('ember', 'v_ember', 69), link('refuse', 'v_refuse', 10)];
  Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
  // Omen day 59 (not 55): the test day is frozen at 60, and the titan
  // escalation strikes whenever (day − o.day) % 5 === 0 — day 55 would
  // strike on EVERY dawn tick and cut a random link's trust −5, which
  // would drag Emberhold below the trusted bar between the line and the
  // harvest. Day 59 keeps the escalation quiet for the whole test.
  Game.state.titans.omens.herald = { stage: 2, day: 59 };
  Game.spawnWorldMonster('herald', 7, 4, { titan: true });

  // (G0) No muster yet: growth is null, dawn says no growth line.
  assert.strictEqual(Game.titanMusterGrowth('herald'), null, 'seed ' + seed + ': no muster -> growth null');
  await dawnTick();
  assert.strictEqual(growthLines().length, 0, 'seed ' + seed + ': no muster -> no growth line');

  // Sound the call: Emberhold answers 2 (base quota, trust 69 < 70).
  let muster;
  await quietLog(async () => { muster = Game.soundTitanCall('herald'); });
  assert.ok(muster, 'seed ' + seed + ': soundTitanCall must return a muster');
  assert.strictEqual((muster.allies || []).length, 2, 'seed ' + seed + ': call brings 2 allied blades');
  assert.strictEqual(Game.titanMusterReady('herald'), false, 'seed ' + seed + ': short muster is not ready');

  // Commit Haven's own (two-tap) so the Haven pool is known. The harness
  // village roster decides how many volunteers are free (0-3).
  let r1 = null, r2 = null;
  await quietLog(async () => { r1 = Game.titanCommitOwn('herald'); });
  await quietLog(async () => { if (r1 === 'confirm') r2 = Game.titanCommitOwn('herald'); });
  const havenN = (function () { try { return Game.titanHavenBlades(muster).length; } catch (e) { return -1; } })();
  assert.ok(havenN >= 0, 'seed ' + seed + ': haven blades readable, got ' + havenN);

  // (G1) Nothing grew yet: allied gain is 0 (harvestable is only the
  // uncommitted Haven pool, already announced by the call's re-arm) and
  // dawn stays silent.
  let g = Game.titanMusterGrowth('herald');
  assert.ok(g, 'seed ' + seed + ': growth must exist for a live muster');
  assert.strictEqual(g.harvestable, g.havenGain, 'seed ' + seed + ': no allied growth yet (harvestable ' + g.harvestable + ' == havenGain ' + g.havenGain + ')');
  assert.strictEqual(g.current, 2 + havenN, 'seed ' + seed + ': current counts allies + haven');
  await dawnTick();
  assert.strictEqual(growthLines().length, 0, 'seed ' + seed + ': no fresh growth -> no line');

  // (G5) The refusing link contributes 0: it has no generated roster, so
  // freeAdults is 0 — and it would refuse anyway.
  const refLink = (g.links || []).find(function (l) { return l.villageId === 'v_refuse'; });
  assert.ok(refLink, 'seed ' + seed + ': growth lists the refusing link');
  assert.strictEqual(refLink.wouldRefuse, true, 'seed ' + seed + ': trust 10 link would refuse');
  assert.strictEqual(refLink.gain, 0, 'seed ' + seed + ': refusing link gains 0');

  // (G2) Emberhold's trust crosses 70 (a gift lands): quota 2 -> 6,
  // free adults 6, gain 4. The dawn line fires ONCE, naming Emberhold.
  m.links[0].trust = 70;
  g = Game.titanMusterGrowth('herald');
  const ember = (g.links || []).find(function (l) { return l.villageId === 'v_ember'; });
  assert.ok(ember, 'seed ' + seed + ': growth lists Emberhold');
  assert.strictEqual(ember.quota, 6, 'seed ' + seed + ': trust 70 -> trusted quota 6');
  assert.strictEqual(ember.gain, 4, 'seed ' + seed + ': Emberhold gain is 4 (6 quota - 2 already, 6 free)');
  assert.strictEqual(g.harvestable, 4 + g.havenGain, 'seed ' + seed + ': harvestable is 4 + haven pool');
  assert.strictEqual(g.total, 2 + havenN + 4 + g.havenGain, 'seed ' + seed + ': projected total counts the growth');
  await dawnTick();
  assert.strictEqual(growthLines().length, 1, 'seed ' + seed + ': one growth line after trust crosses 70');
  assert.ok(/Emberhold would send 4 more/.test(growthLines()[0]), 'seed ' + seed + ': line names Emberhold + 4 more: ' + growthLines()[0]);
  assert.ok(/would stand at/.test(growthLines()[0]), 'seed ' + seed + ': line names the would-be total');

  // (G3) Second dawn, same state: no repeat (once per growth).
  await dawnTick();
  assert.strictEqual(growthLines().length, 1, 'seed ' + seed + ': second dawn does not repeat the line');

  // (G4) Sound the call again: the 4 blades arrive, and the dawn line
  // stays silent (harvest re-arms to the remaining Haven pool).
  // Pin the mechanism first: the muster stayed fed, so Emberhold's trust
  // is still 70 at harvest time (a hungry muster would have bled it
  // below the trusted bar and the call would bring nothing).
  assert.strictEqual(m.links[0].trust, 70, 'seed ' + seed + ': Emberhold trust still 70 at harvest time (muster fed)');
  await quietLog(async () => { muster = Game.soundTitanCall('herald'); });
  assert.strictEqual((muster.allies || []).length, 6, 'seed ' + seed + ': re-sounded call harvests the 4 blades');
  g = Game.titanMusterGrowth('herald');
  assert.strictEqual(g.harvestable, g.havenGain, 'seed ' + seed + ': after harvest, only the Haven pool remains');
  await dawnTick();
  assert.strictEqual(growthLines().length, 1, 'seed ' + seed + ': no new line after harvest');

  // (G4b) Fresh growth speaks again: a new trusted link forms.
  Game.state.otherVillages.push({ id: 'v_stone', name: 'Stonebridge', population: 20, opinion: 20, day: 0, roster: adultRoster('v_stone', 8) });
  m.links.push(link('stone', 'v_stone', 80));
  g = Game.titanMusterGrowth('herald');
  assert.strictEqual(g.harvestable, 6 + g.havenGain, 'seed ' + seed + ': new trusted link adds 6 harvestable');
  await dawnTick();
  assert.strictEqual(growthLines().length, 2, 'seed ' + seed + ': fresh growth speaks again');
  assert.ok(/Stonebridge would send 6 more/.test(growthLines()[1]), 'seed ' + seed + ': second line names Stonebridge + 6: ' + growthLines()[1]);

  // Harvest Stonebridge: the muster is ready (12 allies + haven >= 10).
  await quietLog(async () => { muster = Game.soundTitanCall('herald'); });
  assert.strictEqual(Game.titanMusterReady('herald'), true, 'seed ' + seed + ': muster ready after the second harvest');

  // (G6) Ready muster + fresh growth: a late link forms, but the line
  // stays silent — the march, not the line, owns a ready muster.
  Game.state.otherVillages.push({ id: 'v_late', name: 'Latecomers', population: 20, opinion: 20, day: 0, roster: adultRoster('v_late', 8) });
  m.links.push(link('late', 'v_late', 80));
  g = Game.titanMusterGrowth('herald');
  assert.ok(g.harvestable > 0, 'seed ' + seed + ': late link leaves harvestable > 0 (got ' + g.harvestable + ')');
  await dawnTick();
  assert.strictEqual(growthLines().length, 2, 'seed ' + seed + ': ready muster -> no growth line even with harvestable > 0');

  // (G7) Slain titan: growth is null, dawn stays silent.
  Game.state.titans.slain.herald = true;
  assert.strictEqual(Game.titanMusterGrowth('herald'), null, 'seed ' + seed + ': slain -> growth null');
  await dawnTick();
  assert.strictEqual(growthLines().length, 2, 'seed ' + seed + ': slain titan -> no new line');
  console.log(JSON.stringify({ seed, scenario: 'allied-growth', growthLines: growthLines().length, havenN: havenN }));
  return { seed, scenario: 'allied-growth' };
}

// Fixture B (Haven growth): one base-quota link (2 blades) + a Haven
// village roster with 3 free volunteers. The dawn line must name Haven
// when fresh Haven growth appears.
async function runHavenSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'muster-growth-proof-haven' });
  await setupGame(Game);
  // FEED THE MUSTER (see fixture A): upkeep is 1000 kcal/blade/day.
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.inventory = Game.state.scholar.inventory || [];
  Game.state.scholar.inventory.push({ id: 'test_loaf', name: 'Test loaf', kcalEach: 1000, units: 100 });
  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  const growthLines = () => said.filter(t => t.indexOf(GROWTH_KEY) !== -1);
  // r236 FIX (dawn-tail drain): see fixture A — tick, then the late-dawn line.
  const dawnTick = async () => {
    await quietLog(async () => { Game.titanDawnTick(); });
    await quietLog(async () => { Game.titanMusterGrowthLine(Game.state.scholar.day); });
  };

  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 60;
  // Haven roster: the scholar + 3 free volunteers. isMember/isEngaged read
  // this roster, so the fabricated ids volunteer like real villagers.
  const me = Game.villagerId;
  Game.state.village = Game.state.village || {};
  Game.state.village.roster = [me, 'hv_a', 'hv_b', 'hv_c'];
  Game.state.otherVillages = [
    { id: 'v_ember', name: 'Emberhold', population: 12, opinion: 20, day: 40, roster: adultRoster('v_ember', 8) },
  ];
  const m = Game.mshipState();
  m.links = [link('ember', 'v_ember', 69)];
  Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
  // Omen day 59 — see fixture A: a frozen test day with (day − o.day)
  // % 5 === 0 would let the escalation strike on every dawn tick.
  Game.state.titans.omens.herald = { stage: 2, day: 59 };
  Game.spawnWorldMonster('herald', 7, 4, { titan: true });

  let muster;
  await quietLog(async () => { muster = Game.soundTitanCall('herald'); });
  assert.strictEqual((muster.allies || []).length, 2, 'seed ' + seed + ': short muster holds 2 allied blades');
  // The call's re-arm stores the post-call harvestable: the Haven pool.
  const vols = (function () { try { return Game.titanVolunteers().length; } catch (e) { return -1; } })();
  assert.strictEqual(vols, 3, 'seed ' + seed + ': 3 Haven volunteers free, got ' + vols);
  let g = Game.titanMusterGrowth('herald');
  assert.strictEqual(g.havenGain, 3, 'seed ' + seed + ': havenGain is 3');
  assert.strictEqual(g.harvestable, 3, 'seed ' + seed + ': harvestable is the Haven pool');
  // Dawn stays silent: the player was just told (by the commit button +
  // the call) Haven can send its own. The line speaks only on FRESH growth.
  await dawnTick();
  assert.strictEqual(growthLines().length, 0, 'seed ' + seed + ': no line for growth already announced by the call');
  // Commit Haven's 3 (two-tap): the pool empties, _growthSaid re-arms to 0.
  let r1 = null, r2 = null;
  await quietLog(async () => { r1 = Game.titanCommitOwn('herald'); });
  await quietLog(async () => { if (r1 === 'confirm') r2 = Game.titanCommitOwn('herald'); });
  assert.strictEqual(Game.titanHavenBlades(muster).length, 3, 'seed ' + seed + ': Haven committed 3');
  g = Game.titanMusterGrowth('herald');
  assert.strictEqual(g.harvestable, 0, 'seed ' + seed + ': after commit, harvestable is 0');
  // Fresh growth on both sides: Emberhold crosses 70, and one committed
  // blade is lost (the way a death would free the volunteer pool) — drop
  // hv_c from the muster AND from the committed map, so they volunteer again.
  muster.haven = muster.haven.slice(0, 2);
  try { delete ((Game.state.village || {}).titanCommitted || {}).hv_c; } catch (e) {}
  m.links[0].trust = 70;
  g = Game.titanMusterGrowth('herald');
  assert.strictEqual(g.harvestable, 5, 'seed ' + seed + ': fresh growth is 4 allied + 1 Haven = 5 (got ' + g.harvestable + ')');
  await dawnTick();
  assert.strictEqual(growthLines().length, 1, 'seed ' + seed + ': one growth line for the fresh growth');
  assert.ok(/Emberhold would send 4 more/.test(growthLines()[0]), 'seed ' + seed + ': line names Emberhold + 4: ' + growthLines()[0]);
  assert.ok(/Haven has 1 volunteer free/.test(growthLines()[0]), 'seed ' + seed + ': line names the Haven volunteer: ' + growthLines()[0]);
  console.log(JSON.stringify({ seed, scenario: 'haven-growth', growthLines: growthLines().length }));
  return { seed, scenario: 'haven-growth' };
}

(async () => {
  const seeds = process.argv.slice(2).map(Number).filter(Boolean);
  const list = seeds.length ? seeds : [90121, 90122];
  const results = [];
  results.push(await runAlliedSeed(list[0]));
  results.push(await runHavenSeed(list[1] || list[0]));
  console.log('ALL test-titan-muster-growth PASS: ' + JSON.stringify(results));
})().catch(function (e) { console.error('FAIL test-titan-muster-growth: ' + (e && e.stack || e)); process.exit(1); });
