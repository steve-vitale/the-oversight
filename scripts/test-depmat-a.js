#!/usr/bin/env node
// scripts/test-depmat-a.js — proof test, arm sim-depmat-a (finding #2590,
// serve half: departure-site materials).
//
// Proves the DEPMAT trailhead-bundle rule in villagerStageBow step 3
// (game.js): when a spear-holder who KNOWS crude_bow attempts the
// departure craft and own pack + pile fall short on branch and/or
// vine, the shortfall (at most 1 branch + 1 vine) is gathered from
// the brush at the departure site and the pick proceeds. The 35% /
// 85% roll is untouched; a failed roll loses the site materials
// exactly like pile materials. The site never deducts from the
// pile (it was never in it). Crude_bow ONLY — a spear-holder who
// knows `bow` but not crude_bow gathers nothing. The mechanism
// draws no Math.random itself — verified statically over the block
// and by counting draws around the call. The duty is called
// DIRECTLY on a staged village (the proof-lootabilities-w3
// pattern): Math.random is stubbed around each staging call so the
// 35% roll succeeds (0.01) or fails (0.99) deterministically, and
// restored right after.
//
// Usage: node scripts/test-depmat-a.js
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
  check('DEPMAT env gate read in villagerStageBow', /process\.env\.DEPMAT === '1'/.test(game));
  check('site block present (trailhead bundle, weapon_craft_site telemetry)', /DEPMAT \(sim-depmat-a/.test(game) && /weapon_craft_site/.test(game));
  const siteBlock = (game.split('DEPMAT (sim-depmat-a')[1] || '').split('const rate = pick.level')[0];
  check('site block covers the crude_bow rung only (branch/vine)', /rid === 'crude_bow'/.test(siteBlock) && /m === 'branch' \|\| m === 'vine'/.test(siteBlock));
  check('site block never deducts the pile for the site portion', /fromSite/.test(siteBlock));
  // Strip full-line // comments before the draw check: the block's
  // own comment names Math.random ("no Math.random draw..."), which
  // is prose, not a draw. The check must read code, not comments.
  const siteCode = siteBlock.split('\n').filter(function (ln) { return ln.trim().indexOf('//') !== 0; }).join('\n');
  check('site block draws no Math.random (draw-neutral by construction)', siteCode.indexOf('Math.random') === -1 && !/\bR\s*\(/.test(siteCode));

  // ---- 2. Staged village (seed 31031, same pattern as test-bowsee-a.js) ----
  const g2 = await loadGame({ seed: 31031, mode: 'depmat-stage' });
  const G = g2.Game;
  check('villagerStageBow callable', typeof G.villagerStageBow === 'function');
  if (typeof G.villagerStageBow !== 'function') { console.log('DEPMAT_FAILS ' + failed); process.exit(1); }
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
  const siteTeleFor = function (vid) { return teleEvents.filter(function (e) { return e.t === 'weapon_craft_site' && e.d && e.d.vid === vid; }); };
  const stageSource = function () { return ((v.bowOpenByVid || {})[learner] || {}).source || null; };
  const setSpearHolderKnowing = function (knows) {
    resetVillager(learner);
    v.weaponCraft = {};
    v.weaponCraft[learner] = Object.assign({}, knows);
    const lp = person(learner);
    lp.items = ['hunting_spear'];
    if (EQ) EQ.autoEquip(lp, G.data.items);
  };
  if (G.map) { G.map.px = v.px != null ? v.px : 4; G.map.py = v.py != null ? v.py : 4; }

  // M1: DEPMAT OFF — knows crude_bow, empty pile: noSource, pile untouched.
  console.log('\n=== M1: flag off — knows crude_bow, empty pile: goes without (old behavior) ===');
  setDepmat(false);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({});
  teleEvents.length = 0; sayLines.length = 0;
  const m1 = stage(0.01);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' draws=' + m1.draws + ' pile=' + JSON.stringify(pileOf()));
  check('M1 learner holds the spear in the ranged slot', equippedId(learner, 'ranged') === 'hunting_spear', equippedId(learner, 'ranged'));
  check('M1 flag off: staging records noSource (nothing to make it from)', stageSource() === 'noSource', stageSource());
  check('M1 flag off: no site telemetry', siteTeleFor(learner).length === 0, JSON.stringify(siteTeleFor(learner)));
  check('M1 flag off: no trailhead line spoken', !sayLines.some(function (s) { return /snaps a green branch/.test(s); }), JSON.stringify(sayLines));
  check('M1 flag off: pile still empty (untouched)', pileOf().branch === 0 && pileOf().vine === 0, JSON.stringify(pileOf()));
  check('M1 flag off: ZERO Math.random draws (no pick, no roll)', m1.draws === 0, 'draws=' + m1.draws);
  const offRecord = JSON.stringify(v.weaponCraft);

  // M2: DEPMAT ON — same setup, succeeding roll: site gathers, crafts.
  console.log('\n=== M2: flag on — empty pile, succeeding roll: trailhead bundle serves ===');
  setDepmat(true);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({});
  teleEvents.length = 0; sayLines.length = 0;
  const m2 = stage(0.01);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' ranged=' + equippedId(learner, 'ranged') + ' siteTele=' + JSON.stringify(siteTeleFor(learner)) + ' draws=' + m2.draws + ' pile=' + JSON.stringify(pileOf()));
  check('M2 flag on: staging records crafted', stageSource() === 'crafted', stageSource());
  check('M2 flag on: the staged crude bow is seated in the ranged slot', equippedId(learner, 'ranged') === 'crude_bow', equippedId(learner, 'ranged'));
  check('M2 flag on: return carries depmatSite + siteMats branch/vine', m2.out.depmatSite === true && Array.isArray(m2.out.siteMats) && m2.out.siteMats.indexOf('branch') !== -1 && m2.out.siteMats.indexOf('vine') !== -1, JSON.stringify(m2.out));
  check('M2 flag on: weapon_craft_site telemetry names learner + crude_bow', siteTeleFor(learner).some(function (e) { return e.d.item === 'crude_bow'; }), JSON.stringify(siteTeleFor(learner)));
  check('M2 flag on: the gathering is witnessed aloud at home', sayLines.some(function (s) { return /snaps a green branch/.test(s); }), JSON.stringify(sayLines));
  check('M2 flag on: pile still empty (site never deducts the pile)', pileOf().branch === 0 && pileOf().vine === 0, JSON.stringify(pileOf()));
  check('M2 flag on: exactly one craft draw (the 35% roll — the site drew none)', m2.draws === 1, 'draws=' + m2.draws);

  // M3: DEPMAT OFF, repeat — byte-identical to M1 (the (f) control).
  console.log('\n=== M3: flag off repeat — byte-identical to M1 ===');
  setDepmat(false);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({});
  teleEvents.length = 0; sayLines.length = 0;
  const m3 = stage(0.01);
  check('M3 flag-off repeat: weaponCraft record identical to M1', JSON.stringify(v.weaponCraft) === offRecord, JSON.stringify(v.weaponCraft) + ' vs ' + offRecord);
  check('M3 flag-off repeat: learner still unserved, noSource again', (knowledgeOf(learner).crude_bow | 0) === 1 && stageSource() === 'noSource', JSON.stringify(knowledgeOf(learner)) + ' ' + stageSource());
  check('M3 flag-off repeat: no site telemetry', siteTeleFor(learner).length === 0, JSON.stringify(siteTeleFor(learner)));

  // M4: DEPMAT ON, knows `bow` ONLY (no crude_bow) — gathers nothing.
  console.log('\n=== M4: flag on, knows bow only — the crude-only rule: nothing is gathered ===');
  setDepmat(true);
  setSpearHolderKnowing({ bow: 1 });
  setPile({});
  teleEvents.length = 0;
  const m4 = stage(0.01);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' draws=' + m4.draws);
  check('M4 bow-only: staging records noSource (seasoned wood is not at the trailhead)', stageSource() === 'noSource', stageSource());
  check('M4 bow-only: no site telemetry', siteTeleFor(learner).length === 0, JSON.stringify(siteTeleFor(learner)));
  check('M4 bow-only: return carries no depmatSite', !m4.out.depmatSite, JSON.stringify(m4.out));
  check('M4 bow-only: ZERO Math.random draws (no pick fires)', m4.draws === 0, 'draws=' + m4.draws);

  // M5: DEPMAT ON, knows crude_bow, FAILING roll — site gathered, roll lost.
  console.log('\n=== M5: flag on, empty pile, failing roll — site gathered, craft failed ===');
  setDepmat(true);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({});
  teleEvents.length = 0;
  const m5 = stage(0.99);
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' source=' + stageSource() + ' draws=' + m5.draws + ' pile=' + JSON.stringify(pileOf()));
  check('M5 failing roll: staging records craftedFail', stageSource() === 'craftedFail', stageSource());
  check('M5 failing roll: site telemetry still fired (the gathering happened)', siteTeleFor(learner).length === 1, JSON.stringify(siteTeleFor(learner)));
  check('M5 failing roll: return carries depmatSite (site materials were spent)', m5.out.depmatSite === true, JSON.stringify(m5.out));
  check('M5 failing roll: pile never driven negative', pileOf().branch >= 0 && pileOf().vine >= 0, JSON.stringify(pileOf()));
  check('M5 failing roll: exactly one craft draw', m5.draws === 1, 'draws=' + m5.draws);

  // M6: DEPMAT ON, pile HOLDS branch + vine — the craft uses the pile, no site.
  console.log('\n=== M6: flag on, pile holds the materials — no site top-up ===');
  setDepmat(true);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({ branch: 3, vine: 3 });
  teleEvents.length = 0;
  const m6 = stage(0.01);
  console.log('after: source=' + stageSource() + ' pile=' + JSON.stringify(pileOf()) + ' siteTele=' + JSON.stringify(siteTeleFor(learner)));
  check('M6 pile-stocked: staging records crafted', stageSource() === 'crafted', stageSource());
  check('M6 pile-stocked: NO site telemetry (the site tops up only the shortfall)', siteTeleFor(learner).length === 0, JSON.stringify(siteTeleFor(learner)));
  check('M6 pile-stocked: return carries no depmatSite', !m6.out.depmatSite, JSON.stringify(m6.out));
  check('M6 pile-stocked: pile spent exactly 1 branch + 1 vine', pileOf().branch === 2 && pileOf().vine === 2, JSON.stringify(pileOf()));

  // M7: DEPMAT ON, pile holds branch but NO vine — the site supplies vine only.
  console.log('\n=== M7: flag on, pile has branch, no vine — site supplies vine only ===');
  setDepmat(true);
  setSpearHolderKnowing({ crude_bow: 1 });
  setPile({ branch: 3, vine: 0 });
  teleEvents.length = 0;
  const m7 = stage(0.01);
  console.log('after: source=' + stageSource() + ' pile=' + JSON.stringify(pileOf()) + ' siteTele=' + JSON.stringify(siteTeleFor(learner)));
  check('M7 vine-short only: staging records crafted', stageSource() === 'crafted', stageSource());
  check('M7 vine-short only: site telemetry names vine only', siteTeleFor(learner).length === 1 && siteTeleFor(learner)[0].d.mats.length === 1 && siteTeleFor(learner)[0].d.mats[0] === 'vine', JSON.stringify(siteTeleFor(learner)));
  check('M7 vine-short only: return siteMats is [vine]', Array.isArray(m7.out.siteMats) && m7.out.siteMats.length === 1 && m7.out.siteMats[0] === 'vine', JSON.stringify(m7.out));
  check('M7 vine-short only: pile spent exactly 1 branch, vine untouched at 0', pileOf().branch === 2 && pileOf().vine === 0, JSON.stringify(pileOf()));

  // M8: DEPMAT ON, knows crude_bow at level 2 — the learned 85% rate applies.
  console.log('\n=== M8: flag on, lv[crude_bow]=2, roll 0.50 — the learned rate serves ===');
  setDepmat(true);
  setSpearHolderKnowing({ crude_bow: 2 });
  setPile({});
  teleEvents.length = 0;
  const m8 = stage(0.50);
  console.log('after: source=' + stageSource() + ' ranged=' + equippedId(learner, 'ranged') + ' draws=' + m8.draws);
  check('M8 learned rate: roll 0.50 succeeds at 85% (would fail the blind 35%)', stageSource() === 'crafted', stageSource());
  check('M8 learned rate: site telemetry fired', siteTeleFor(learner).length === 1, JSON.stringify(siteTeleFor(learner)));
  check('M8 learned rate: exactly one craft draw', m8.draws === 1, 'draws=' + m8.draws);

  console.log('\nDEPMAT ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — FAILS: ' + fails.join('; ') : ''));
  process.exit(failed ? 1 : 0);
}

main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
