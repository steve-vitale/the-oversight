#!/usr/bin/env node
// scripts/test-roll35-a.js — proof test, arm sim-roll35-a (finding #2590,
// serve half: the 35% blind craft roll on the spear-serve path).
//
// Proves the ROLL35 learned first-make rate in villagerStageBow step 3
// (game.js): at the departure crude_bow craft attempt, a SPEAR-HOLDER
// (the ranged slot holds a non-ammo weapon — the same spearSeen read
// the gate uses) faces 60% on the first make instead of the blind 35%;
// the learned 85% for a crafter who has actually made one (lv >= 2)
// is untouched, and everyone else (non-spear-holders, the `bow` rung)
// keeps the blind rate. The rate is a threshold swap on the SAME
// single Math.random() draw — zero new draws. The duty is called
// DIRECTLY on a staged village (the proof-lootabilities-w3 pattern):
// Math.random is stubbed around each staging call so the roll
// succeeds or fails deterministically, and restored right after.
//
// Usage: node scripts/test-roll35-a.js
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
  check('ROLL35 env gate read in villagerStageBow', /process\.env\.ROLL35 === '1'/.test(game));
  check('roll-rate block present (ROLL35 marker + 0.60 first-make rate)', /ROLL35 \(sim-roll35-a/.test(game) && /0\.60/.test(game));
  check('roll-rate block scopes to spear-holders (isSpearHolder read)', /isSpearHolder/.test(game));
  check('roll-rate block scopes to the crude_bow rung only', /pick\.rid === 'crude_bow'/.test(game));
  check('depmat anchor preserved (const rate = pick.level >= 2 ? 0.85 : 0.35)', /const rate = pick\.level >= 2 \? 0\.85 : 0\.35;/.test(game));
  // The roll block (ROLL35 marker -> the success draw) must add no
  // draw of its own: the rate is a threshold swap on the one draw
  // the craft already makes. Strip full-line // comments first: the
  // block's own comment names the draw ("same single draw"), which
  // is prose, not a draw.
  const rollBlock = (game.split('ROLL35 (sim-roll35-a')[1] || '').split('const success = Math.random()')[0];
  const rollCode = rollBlock.split('\n').filter(function (ln) { return ln.trim().indexOf('//') !== 0; }).join('\n');
  check('roll-rate block draws no Math.random (threshold swap only)', rollCode.indexOf('Math.random') === -1, rollCode.slice(0, 200));

  // ---- 2. Staged village (seed 31031, same pattern as test-depmat-a.js) ----
  const g2 = await loadGame({ seed: 31031, mode: 'roll35-stage' });
  const G = g2.Game;
  check('villagerStageBow callable', typeof G.villagerStageBow === 'function');
  if (typeof G.villagerStageBow !== 'function') { console.log('ROLL35_FAILS ' + failed); process.exit(1); }
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
  const pileOf = function () { const st = G.stashState(); return { branch: st.materials.branch || 0, vine: st.materials.vine || 0, wood: st.materials.wood || 0 }; };
  const equippedId = function (vid, slot) { const e = (person(vid).equipped || {})[slot]; return e ? (e.itemId || e.id || null) : null; };
  const setDepmat = function (on) { if (on) process.env.DEPMAT = '1'; else delete process.env.DEPMAT; };
  const setRoll35 = function (on) { if (on) process.env.ROLL35 = '1'; else delete process.env.ROLL35; };
  // stage(roll): reset the staging counters, run villagerStageBow on
  // the learner with Math.random stubbed to `roll`, return the draws
  // consumed (the counting wrapper proves draw-neutrality) + the
  // return object.
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
  const stageSource = function () { return ((v.bowOpenByVid || {})[learner] || {}).source || null; };
  const setSpearHolderKnowing = function (knows) {
    resetVillager(learner);
    v.weaponCraft = {};
    v.weaponCraft[learner] = Object.assign({}, knows);
    const lp = person(learner);
    lp.items = ['hunting_spear'];
    if (EQ) EQ.autoEquip(lp, G.data.items);
  };
  const setUnarmedKnowing = function (knows) {
    resetVillager(learner);
    v.weaponCraft = {};
    v.weaponCraft[learner] = Object.assign({}, knows);
    // Empty ranged slot: not a spear-holder, so the roll change must
    // not fire for this villager.
  };
  if (G.map) { G.map.px = v.px != null ? v.px : 4; G.map.py = v.py != null ? v.py : 4; }

  // M1: ROLL35 OFF — knows crude_bow, empty pile, DEPMAT on, roll 0.50:
  // the blind 35% fails (old behavior — the control).
  console.log('\n=== M1: flag off — roll 0.50 fails the blind 35% (old behavior) ===');
  setDepmat(true);
  setRoll35(false);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({});
  teleEvents.length = 0; sayLines.length = 0;
  const m1 = stage(0.50);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' draws=' + m1.draws + ' roll35Rate=' + m1.out.roll35Rate + ' pile=' + JSON.stringify(pileOf()));
  check('M1 learner holds the spear in the ranged slot', equippedId(learner, 'ranged') === 'hunting_spear', equippedId(learner, 'ranged'));
  check('M1 flag off: staging records craftedFail (0.50 >= 0.35)', stageSource() === 'craftedFail', stageSource());
  check('M1 flag off: return carries the blind rate 0.35', m1.out.roll35Rate === 0.35, JSON.stringify(m1.out));
  check('M1 flag off: exactly one craft draw', m1.draws === 1, 'draws=' + m1.draws);
  const offRecord = JSON.stringify(v.weaponCraft);

  // M2: ROLL35 ON — same setup, roll 0.50: the learned 60% serves.
  console.log('\n=== M2: flag on — roll 0.50 succeeds at the learned 60% ===');
  setDepmat(true);
  setRoll35(true);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({});
  teleEvents.length = 0; sayLines.length = 0;
  const m2 = stage(0.50);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' ranged=' + equippedId(learner, 'ranged') + ' draws=' + m2.draws + ' roll35Rate=' + m2.out.roll35Rate + ' pile=' + JSON.stringify(pileOf()));
  check('M2 flag on: staging records crafted (0.50 < 0.60)', stageSource() === 'crafted', stageSource());
  check('M2 flag on: the staged crude bow is seated in the ranged slot', equippedId(learner, 'ranged') === 'crude_bow', equippedId(learner, 'ranged'));
  check('M2 flag on: return carries roll35Rate 0.60', m2.out.roll35Rate === 0.60, JSON.stringify(m2.out));
  check('M2 flag on: the site still supplied (depmatSite + siteMats)', m2.out.depmatSite === true && Array.isArray(m2.out.siteMats), JSON.stringify(m2.out));
  check('M2 flag on: exactly one craft draw (same as flag-off)', m2.draws === 1 && m2.draws === m1.draws, 'draws=' + m2.draws);

  // M3: ROLL35 OFF, repeat — byte-identical to M1 (the (g) control).
  console.log('\n=== M3: flag off repeat — byte-identical to M1 ===');
  setDepmat(true);
  setRoll35(false);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({});
  teleEvents.length = 0; sayLines.length = 0;
  const m3 = stage(0.50);
  check('M3 flag-off repeat: weaponCraft record identical to M1', JSON.stringify(v.weaponCraft) === offRecord, JSON.stringify(v.weaponCraft) + ' vs ' + offRecord);
  check('M3 flag-off repeat: staging records craftedFail again', stageSource() === 'craftedFail', stageSource());
  check('M3 flag-off repeat: return carries the blind rate 0.35', m3.out.roll35Rate === 0.35, JSON.stringify(m3.out));

  // M4: ROLL35 ON, NON-spear-holder (empty ranged slot), roll 0.50:
  // the scoping — the blind 35% still fails.
  console.log('\n=== M4: flag on, non-spear-holder — the scoping: blind 35% still fails ===');
  setDepmat(true);
  setRoll35(true);
  setUnarmedKnowing({ crude_bow: 1 });
  setPile({});
  teleEvents.length = 0;
  const m4 = stage(0.50);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' draws=' + m4.draws + ' roll35Rate=' + m4.out.roll35Rate);
  check('M4 non-spear: ranged slot is empty (not a spear-holder)', equippedId(learner, 'ranged') === null, equippedId(learner, 'ranged'));
  check('M4 non-spear: staging records craftedFail (0.50 >= 0.35)', stageSource() === 'craftedFail', stageSource());
  check('M4 non-spear: return carries the blind rate 0.35', m4.out.roll35Rate === 0.35, JSON.stringify(m4.out));
  check('M4 non-spear: exactly one craft draw', m4.draws === 1, 'draws=' + m4.draws);

  // M5: ROLL35 ON, spear-holder crafting the `bow` rung, roll 0.50:
  // the crude-only rule — the blind 35% still fails.
  console.log('\n=== M5: flag on, spear-holder, bow rung — the crude-only rule: blind 35% still fails ===');
  setDepmat(true);
  setRoll35(true);
  setSpearHolderKnowing({ bow: 1, crude_bow: 1 });
  setPile({ wood: 3, vine: 3 });
  teleEvents.length = 0;
  const m5 = stage(0.50);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' draws=' + m5.draws + ' roll35Rate=' + m5.out.roll35Rate + ' pile=' + JSON.stringify(pileOf()));
  check('M5 bow rung: staging records craftedFail (0.50 >= 0.35)', stageSource() === 'craftedFail', stageSource());
  check('M5 bow rung: return carries the blind rate 0.35', m5.out.roll35Rate === 0.35, JSON.stringify(m5.out));
  check('M5 bow rung: no site supply (the pile covered the bow rung)', !m5.out.depmatSite, JSON.stringify(m5.out));
  check('M5 bow rung: exactly one craft draw', m5.draws === 1, 'draws=' + m5.draws);

  // M6: ROLL35 ON, spear-holder at lv[crude_bow]=2, roll 0.80: the
  // learned 85% is untouched — the roll succeeds.
  console.log('\n=== M6: flag on, lv[crude_bow]=2, roll 0.80 — the learned 85% is untouched ===');
  setDepmat(true);
  setRoll35(true);
  setSpearHolderKnowing({ crude_bow: 2 });
  setPile({});
  teleEvents.length = 0;
  const m6 = stage(0.80);
  console.log('after: source=' + stageSource() + ' ranged=' + equippedId(learner, 'ranged') + ' draws=' + m6.draws + ' roll35Rate=' + m6.out.roll35Rate);
  check('M6 learned rate: roll 0.80 succeeds at 85% (would fail the blind 35% and the 60%)', stageSource() === 'crafted', stageSource());
  check('M6 learned rate: return carries roll35Rate 0.85', m6.out.roll35Rate === 0.85, JSON.stringify(m6.out));
  check('M6 learned rate: exactly one craft draw', m6.draws === 1, 'draws=' + m6.draws);

  // M7: ROLL35 ON, lv1, roll 0.99 — fails even the learned rate; the
  // site materials are lost and the pile is never driven negative.
  console.log('\n=== M7: flag on, roll 0.99 — fails the learned 60%, pile never negative ===');
  setDepmat(true);
  setRoll35(true);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({});
  teleEvents.length = 0;
  const m7 = stage(0.99);
  console.log('after: source=' + stageSource() + ' draws=' + m7.draws + ' roll35Rate=' + m7.out.roll35Rate + ' pile=' + JSON.stringify(pileOf()));
  check('M7 failing roll: staging records craftedFail', stageSource() === 'craftedFail', stageSource());
  check('M7 failing roll: return carries roll35Rate 0.60', m7.out.roll35Rate === 0.60, JSON.stringify(m7.out));
  check('M7 failing roll: return still carries depmatSite (site materials were spent)', m7.out.depmatSite === true, JSON.stringify(m7.out));
  check('M7 failing roll: pile never driven negative', pileOf().branch >= 0 && pileOf().vine >= 0, JSON.stringify(pileOf()));
  check('M7 failing roll: exactly one craft draw', m7.draws === 1, 'draws=' + m7.draws);

  // M8: ROLL35 ON, lv1, roll 0.50, pile-STOCKED — the rate fires
  // without the site: the learned rate is not site-gated.
  console.log('\n=== M8: flag on, pile-stocked, roll 0.50 — the learned rate fires without the site ===');
  setDepmat(true);
  setRoll35(true);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({ branch: 3, vine: 3 });
  teleEvents.length = 0;
  const m8 = stage(0.50);
  console.log('after: source=' + stageSource() + ' ranged=' + equippedId(learner, 'ranged') + ' draws=' + m8.draws + ' roll35Rate=' + m8.out.roll35Rate + ' pile=' + JSON.stringify(pileOf()));
  check('M8 pile-stocked: staging records crafted (0.50 < 0.60)', stageSource() === 'crafted', stageSource());
  check('M8 pile-stocked: return carries roll35Rate 0.60', m8.out.roll35Rate === 0.60, JSON.stringify(m8.out));
  check('M8 pile-stocked: no site supply (the pile covered it)', !m8.out.depmatSite, JSON.stringify(m8.out));
  check('M8 pile-stocked: pile spent exactly 1 branch + 1 vine', pileOf().branch === 2 && pileOf().vine === 2, JSON.stringify(pileOf()));
  check('M8 pile-stocked: exactly one craft draw', m8.draws === 1, 'draws=' + m8.draws);

  console.log('\nROLL35 ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — FAILS: ' + fails.join('; ') : ''));
  process.exit(failed ? 1 : 0);
}

main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
