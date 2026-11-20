#!/usr/bin/env node
// scripts/test-evade-a.js — proof test, arm sim-evade-a (finding #2590,
// serve half, the evade wall).
//
// Proves the EVADEOBS rule in fieldFight's awareness early-return
// (fieldFights.js): an awareness-evade is a survived encounter, so it
// records one trick observation — exactly as the settlement below
// already promises for fled/driven-off/evaded survivals but the early
// return never reaches. Two evades of the same trick-bearing species
// teach the trick, the trick hold lifts, and the gate can seek. The
// evade still evades — the fix records, it does not force contact.
// Also proves DEPMATSCOPE: the trailhead bundle serves spear-holders
// only when the scope flag is on.
// The duty is called DIRECTLY on a staged village (the
// proof-lootabilities-w3 pattern): each fieldFight call takes
// opts.rng — the injected RNG fieldFight itself supports (RR =
// opts.rng || R) — returning a constant 0.01, so the awareness
// roll evades deterministically (evadeP >= 0.05 always) and every
// draw the call consumes is counted in the injected function.
// (Stubbing Math.random does NOT steer fieldFight: RR is the
// contest stream, not Math.random — the depmat staging half still
// stubs Math.random, because villagerStageBow rolls on it directly.)
//
// Usage: node scripts/test-evade-a.js
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
  const ff = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  const game = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  check('EVADEOBS env gate read in fieldFights.js', /process\.env\.EVADEOBS === '1'/.test(ff));
  const evadeBlock = (ff.split("rec.outcome = 'evade'")[1] || '').split('return rec')[0];
  check('observation call sits inside the awareness-evade early return', /noteVillagerTrickObservation/.test(evadeBlock) && /EVADEOBS/.test(evadeBlock) && /vid !== 'player'/.test(evadeBlock), evadeBlock.slice(0, 200));
  check('settlement observation call untouched (vFlee/mFlee/evade)', /rec\.outcome === 'vFlee' \|\| rec\.outcome === 'mFlee' \|\| rec\.outcome === 'evade'/.test(ff) && /noteVillagerTrickObservation\(vid, mdef\.id\)/.test(ff));
  check('DEPMATSCOPE env gate read in villagerStageBow', /process\.env\.DEPMATSCOPE === '1'/.test(game));
  const siteBlock = (game.split('DEPMAT (sim-depmat-a')[1] || '').split('const rate = pick.level')[0];
  check('scope condition gates the site block on spear-holders', /!depmatScopeOn \|\| isSpearHolder/.test(siteBlock), siteBlock.slice(0, 300));

  // ---- 2. Staged village (seed 31031, same pattern as test-depmat-a.js) ----
  const g2 = await loadGame({ seed: 31031, mode: 'evade-stage' });
  const G = g2.Game;
  check('fieldFight callable', typeof G.fieldFight === 'function');
  check('villageKnowsTrick callable', typeof G.villageKnowsTrick === 'function');
  if (typeof G.fieldFight !== 'function' || typeof G.villageKnowsTrick !== 'function') { console.log('EVADE_FAILS ' + failed); process.exit(1); }
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
  const person = function (vid) { return G.getPerson(vid); };
  const EQ = (globalThis.Scattering || {}).equipment;
  const influencer = (G.data.monsters || []).find(function (m) { return m.id === 'influencer'; });
  check('influencer def present (wave-4 trick-bearing)', !!influencer && influencer.wave === 4, influencer && influencer.wave);
  const obsOf = function (mid) { return ((G.state.villageCounterObs || {})[mid] || 0); };
  const resetObs = function () { G.state.villageCounterObs = {}; G.state.villagerTricks = {}; };
  const observedTele = function (mid) { return teleEvents.filter(function (e) { return e.t === 'counter_observed' && e.d && e.d.id === mid; }); };
  const discoveredTele = function (mid) { return teleEvents.filter(function (e) { return e.t === 'counter_discovered' && e.d && e.d.id === mid; }); };
  const setEvadeobs = function (on) { if (on) process.env.EVADEOBS = '1'; else delete process.env.EVADEOBS; };
  // A served lead, staged like the encounter: a geared fighter with a
  // hunting spear in the ranged slot, knowing crude_bow, tracking XP
  // past the cap, game_sense + tracker held — the veteran tracker the
  // probe measured (tracking 101-173, evadeP 0.48-0.76).
  const stageLead = function () {
    const p = person(learner);
    p.items = []; p.equipped = {}; p.stashed = []; p.dead = false;
    if (v.away) delete v.away[learner];
    v.weaponCraft = {};
    v.weaponCraft[learner] = { crude_bow: 1 };
    p.items = ['hunting_spear'];
    if (EQ) EQ.autoEquip(p, G.data.items);
    try {
      const ag = G.agencyOf ? G.agencyOf(learner) : null;
      if (ag) { ag.xp = ag.xp || {}; ag.xp[learner] = ag.xp[learner] || {}; ag.xp[learner].tracking = 101; ag.xp[learner].bravery = 15; }
    } catch (e) {}
    try {
      const st = G.agencyState ? G.agencyState() : null;
      if (st) { st.potential = st.potential || {}; }
    } catch (e) {}
    v.npcAbilities = v.npcAbilities || {};
    v.npcAbilities[learner] = ['game_sense', 'tracker'];
  };
  // evadeFight(): one awareness meeting with the injected RNG
  // returning 0.01 (below every evadeP, so the awareness check
  // evades), counting every draw the whole call consumes through
  // that injected stream. Returns {rec, draws}.
  const evadeFight = function (vid) {
    let draws = 0;
    const rng = function () { draws++; return 0.01; };
    const rec = G.fieldFight(vid, influencer, null, { awareness: true, rng: rng });
    return { rec: rec, draws: draws };
  };

  // M1: EVADEOBS OFF — two evades record nothing (the bug, reproduced).
  console.log('\n=== M1: flag off — two awareness-evades record 0 observations ===');
  setEvadeobs(false);
  resetObs();
  stageLead();
  teleEvents.length = 0; sayLines.length = 0;
  const m1a = evadeFight(learner);
  const m1b = evadeFight(learner);
  console.log('after: obs=' + obsOf('influencer') + ' known=' + G.villageKnowsTrick('influencer') + ' outcomes=' + m1a.rec.outcome + '/' + m1b.rec.outcome + ' rounds=' + m1a.rec.rounds + '/' + m1b.rec.rounds + ' observedTele=' + observedTele('influencer').length);
  check('M1 flag off: both meetings evade (rounds 0, no contact)', m1a.rec.outcome === 'evade' && m1b.rec.outcome === 'evade' && m1a.rec.rounds === 0 && m1b.rec.rounds === 0, JSON.stringify([m1a.rec.outcome, m1b.rec.outcome]));
  check('M1 flag off: 0 observations after two evades', obsOf('influencer') === 0, 'obs=' + obsOf('influencer'));
  check('M1 flag off: trick stays unknown', G.villageKnowsTrick('influencer') === false);
  check('M1 flag off: no counter_observed telemetry', observedTele('influencer').length === 0, JSON.stringify(observedTele('influencer')));
  const offDraws1 = m1a.draws;

  // M2: EVADEOBS ON — first evade obs 1, second evade obs 2 + trick learned.
  console.log('\n=== M2: flag on — two awareness-evades teach the trick ===');
  setEvadeobs(true);
  resetObs();
  stageLead();
  teleEvents.length = 0; sayLines.length = 0;
  const m2a = evadeFight(learner);
  console.log('after 1st: obs=' + obsOf('influencer') + ' known=' + G.villageKnowsTrick('influencer') + ' outcome=' + m2a.rec.outcome + ' observedTele=' + observedTele('influencer').length);
  check('M2 flag on: first evade still evades (rounds 0 — the fix records, it does not force contact)', m2a.rec.outcome === 'evade' && m2a.rec.rounds === 0, JSON.stringify(m2a.rec.outcome));
  check('M2 flag on: first evade records obs 1', obsOf('influencer') === 1, 'obs=' + obsOf('influencer'));
  check('M2 flag on: trick still unknown after one observation', G.villageKnowsTrick('influencer') === false);
  check('M2 flag on: one counter_observed telemetry after first evade', observedTele('influencer').length === 1, JSON.stringify(observedTele('influencer')));
  const onDraws1 = m2a.draws;
  const m2b = evadeFight(learner);
  console.log('after 2nd: obs=' + obsOf('influencer') + ' known=' + G.villageKnowsTrick('influencer') + ' outcome=' + m2b.rec.outcome + ' observedTele=' + observedTele('influencer').length + ' discoveredTele=' + discoveredTele('influencer').length);
  check('M2 flag on: second evade still evades (rounds 0)', m2b.rec.outcome === 'evade' && m2b.rec.rounds === 0, JSON.stringify(m2b.rec.outcome));
  check('M2 flag on: second evade records obs 2', obsOf('influencer') === 2, 'obs=' + obsOf('influencer'));
  check('M2 flag on: trick learned after two evades', G.villageKnowsTrick('influencer') === true);
  check('M2 flag on: villagerTricks holds the species', !!((G.state.villagerTricks || {}).influencer));
  check('M2 flag on: two counter_observed telemetry total', observedTele('influencer').length === 2, JSON.stringify(observedTele('influencer')));
  check('M2 flag on: one counter_discovered telemetry', discoveredTele('influencer').length === 1, JSON.stringify(discoveredTele('influencer')));
  check('M2 flag on: the counter is announced aloud', sayLines.some(function (s) { return /COUNTER LEARNED/.test(s); }), JSON.stringify(sayLines));
  const onDraws2 = m2b.draws;

  // M3: third evade — no double-count once the trick is known.
  console.log('\n=== M3: flag on — third evade records nothing more ===');
  teleEvents.length = 0;
  const m3 = evadeFight(learner);
  console.log('after 3rd: obs=' + obsOf('influencer') + ' known=' + G.villageKnowsTrick('influencer') + ' discoveredTele=' + discoveredTele('influencer').length);
  check('M3 third evade: still evades', m3.rec.outcome === 'evade' && m3.rec.rounds === 0);
  check('M3 third evade: obs stays 2 (already known — no double-count)', obsOf('influencer') === 2, 'obs=' + obsOf('influencer'));
  check('M3 third evade: no second counter_discovered telemetry', discoveredTele('influencer').length === 0, JSON.stringify(discoveredTele('influencer')));

  // M4: the 'player' vid takes no villager observation (his own
  // channel). The guard mirrors the settlement's own vid !== 'player'
  // exactly: a scholar fighting in the field under his villager id
  // records like any villager's survived encounter already does
  // today (the settlement's vFlee/mFlee/evade call has the same
  // guard), so no new asymmetry is introduced — the 'player' vid
  // is the one excluded from the villager path, here and there.
  console.log('\n=== M4: flag on — the \'player\' vid\'s evades take no villager observation ===');
  setEvadeobs(true);
  resetObs();
  teleEvents.length = 0;
  const m4a = evadeFight('player');
  const m4b = evadeFight('player');
  console.log('after: obs=' + obsOf('influencer') + ' outcomes=' + (m4a.rec && m4a.rec.outcome) + '/' + (m4b.rec && m4b.rec.outcome));
  check('M4 player evades: both meetings evade', m4a.rec && m4a.rec.outcome === 'evade' && m4b.rec && m4b.rec.outcome === 'evade');
  check('M4 player evades: 0 villager observations', obsOf('influencer') === 0, 'obs=' + obsOf('influencer'));
  check('M4 player evades: trick stays unknown', G.villageKnowsTrick('influencer') === false);

  // M5: DEPMATSCOPE — a non-spear villager gathers nothing with scope on.
  console.log('\n=== M5: scope — non-spear villager, flag on: no site supply; scope off: served ===');
  const setPile = function (mats) {
    const st = G.stashState();
    for (const m of ['wood', 'branch', 'stone', 'fiber', 'stick', 'vine', 'bark']) st.materials[m] = 0;
    Object.assign(st.materials, mats);
    try { st.weapons = []; } catch (e) {}
    return st.materials;
  };
  const stageSource = function () { return ((v.bowOpenByVid || {})[learner] || {}).source || null; };
  const siteTeleFor = function (vid) { return teleEvents.filter(function (e) { return e.t === 'weapon_craft_site' && e.d && e.d.vid === vid; }); };
  const stageNoSpear = function (roll) {
    v.bowOpen = {}; v.bowOpenByVid = {};
    const p = person(learner);
    p.items = []; p.equipped = {}; p.stashed = []; p.dead = false;
    if (v.away) delete v.away[learner];
    v.weaponCraft = {};
    v.weaponCraft[learner] = { crude_bow: 1 };
    let draws = 0;
    const origRandom = Math.random;
    try {
      Math.random = function () { draws++; return roll; };
      const out = G.villagerStageBow(learner);
      return { out: out, draws: draws };
    } finally { Math.random = origRandom; }
  };
  process.env.DEPMAT = '1';
  process.env.DEPMATSCOPE = '1';
  setPile({});
  teleEvents.length = 0;
  const m5a = stageNoSpear(0.01);
  console.log('scope on: source=' + stageSource() + ' siteTele=' + siteTeleFor(learner).length + ' draws=' + m5a.draws);
  check('M5 scope on: non-spear staging records noSource', stageSource() === 'noSource', stageSource());
  check('M5 scope on: no site telemetry', siteTeleFor(learner).length === 0, JSON.stringify(siteTeleFor(learner)));
  check('M5 scope on: return carries no depmatSite', !m5a.out.depmatSite, JSON.stringify(m5a.out));
  delete process.env.DEPMATSCOPE;
  setPile({});
  teleEvents.length = 0;
  const m5b = stageNoSpear(0.01);
  console.log('scope off: source=' + stageSource() + ' siteTele=' + siteTeleFor(learner).length);
  check('M5 scope off: same villager is served (unscoped recovery, unchanged)', stageSource() === 'crafted', stageSource());
  check('M5 scope off: site telemetry fires', siteTeleFor(learner).length === 1, JSON.stringify(siteTeleFor(learner)));
  delete process.env.DEPMAT;

  // M6: draw counts — the observation path draws nothing extra.
  console.log('\n=== M6: draws — first evade, flag off vs on ===');
  console.log('first-evade draws: off=' + offDraws1 + ' on=' + onDraws1 + '; second-evade draws on=' + onDraws2);
  check('M6 first evade: flag on draws exactly the flag-off count (telemetry draws nothing)', onDraws1 === offDraws1, 'off=' + offDraws1 + ' on=' + onDraws1);
  check('M6 second evade: the trick-learn evade draws the same count (say draws nothing)', onDraws2 === onDraws1, 'first-on=' + onDraws1 + ' second-on=' + onDraws2);

  setEvadeobs(false);
  console.log('\nEVADE ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — FAILS: ' + fails.join('; ') : ''));
  process.exit(failed ? 1 : 0);
}

main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
