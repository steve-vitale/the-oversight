#!/usr/bin/env node
// scripts/test-bowknow-a.js — proof test, arm sim-bowknow-a (finding #2590,
// serve half: bow-knowledge reach for spear-holders).
//
// Proves the BOWKNOW mentoring rule in villagerWeaponCraftDay
// (villager-build.js): a villager at home who KNOWS the bow
// (lv[bow] >= 1) teaches a spear-holder (armed, no volley-capable
// ranged weapon) — one learner per mentor per duty day, witnessed
// aloud when the scholar is home, `weapon_teach` telemetry. The
// learner still needs materials and still faces the blind 35%
// craft roll. The stash pile stays unseen; an equipped bow still
// seeds by seeing on both legs; flag unset = old behavior.
// The duty is called DIRECTLY on a staged village (the
// proof-lootabilities-w3 pattern): Math.random is stubbed to 0.01
// around each duty call so the L1 35% / L2 85% roll succeeds
// deterministically, and restored right after. No materials are
// staged (empty pile), so no craft fires — knowledge only.
//
// Usage: node scripts/test-bowknow-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
process.env.DAYS = '5';
process.env.SENSEEXPED = '1';
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
  const vb = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-build.js'), 'utf8');
  check('BOWKNOW env gate read in villagerWeaponCraftDay', /process\.env\.BOWKNOW === '1'/.test(vb));
  check('mentoring block present (mentors/learners, one per mentor)', /BOWKNOW \(sim-bowknow-a/.test(vb) && /const mentors = \[\];/.test(vb) && /const pairs = Math\.min\(mentors\.length, learners\.length\)/.test(vb));
  check('teaching emits weapon_teach telemetry + a witnessed line', /weapon_teach/.test(vb) && /showed .* how a bow is strung/.test(vb));
  const mentorBlock = (vb.split('BOWKNOW (sim-bowknow-a')[1] || '').split('for (const vid of home)')[0];
  check('stash stays unseen: mentoring block never reads a stash or pile', mentorBlock.indexOf('stashed') === -1 && mentorBlock.indexOf('stashState') === -1 && mentorBlock.indexOf('weapons') === -1);

  // ---- 2. Staged village (seed 31031, same pattern as test-bowcraft-a.js) ----
  const g2 = await loadGame({ seed: 31031, mode: 'bowknow-duty' });
  const G = g2.Game;
  check('villagerWeaponCraftDay callable', typeof G.villagerWeaponCraftDay === 'function');
  if (typeof G.villagerWeaponCraftDay !== 'function') { console.log('BOWKNOW_FAILS ' + failed); process.exit(1); }
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
  const mentor = others[1];
  const teacher = others[2];
  const person = function (vid) { return G.getPerson(vid); };
  const day = function () { return G.state.scholar.day; };
  const EQ = (globalThis.Scattering || {}).equipment;
  const resetVillager = function (vid) {
    const p = person(vid);
    p.items = []; p.equipped = {}; p.stashed = []; p.dead = false;
    if (v.away) delete v.away[vid];
    return p;
  };
  const resetKnowledge = function () { v.weaponCraft = {}; v.weaponCraftCd = {}; };
  const pinAllExcept = function (exceptList) {
    v.weaponCraftCd = v.weaponCraftCd || {};
    for (const rid of (v.roster || [])) {
      if (rid !== vessel && exceptList.indexOf(rid) === -1) v.weaponCraftCd[rid] = day();
    }
  };
  const setPile = function (mats) {
    const st = G.stashState();
    for (const m of ['wood', 'branch', 'stone', 'fiber', 'stick', 'vine', 'bark']) st.materials[m] = 0;
    Object.assign(st.materials, mats);
    return st.materials;
  };
  const equippedId = function (vid, slot) { const e = (person(vid).equipped || {})[slot]; return e ? (e.itemId || e.id || null) : null; };
  const setBowknow = function (on) { if (on) process.env.BOWKNOW = '1'; else delete process.env.BOWKNOW; };
  const callDuty = function () {
    const origRandom = Math.random;
    try { Math.random = function () { return 0.01; }; return G.villagerWeaponCraftDay(); }
    finally { Math.random = origRandom; }
  };
  const knowledgeOf = function (vid) { return (v.weaponCraft || {})[vid] || {}; };
  const teachTeleFor = function (vid) { return teleEvents.filter(function (e) { return e.t === 'weapon_teach' && e.d && e.d.vid === vid; }); };
  if (G.map) { G.map.px = v.px != null ? v.px : 4; G.map.py = v.py != null ? v.py : 4; }

  // M1: BOWKNOW OFF — a knower at home teaches NOBODY (old behavior).
  console.log('\n=== M1: flag off — no teaching (old behavior) ===');
  setBowknow(false);
  resetKnowledge();
  v.weaponCraft[mentor] = { bow: 1 }; // knows the bow, holds no bow
  const mp = resetVillager(mentor);
  const lp = resetVillager(learner);
  lp.items = ['hunting_spear'];
  if (EQ) EQ.autoEquip(lp, G.data.items);
  resetVillager(teacher);
  setPile({});
  pinAllExcept([learner, mentor, teacher]);
  teleEvents.length = 0; sayLines.length = 0;
  console.log('before: learner ranged=' + equippedId(learner, 'ranged') + ' knows=' + JSON.stringify(knowledgeOf(learner)) + ' mentor knows=' + JSON.stringify(knowledgeOf(mentor)));
  callDuty();
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' teachTele=' + JSON.stringify(teachTeleFor(learner)));
  check('M1 learner holds the spear in the ranged slot', equippedId(learner, 'ranged') === 'hunting_spear', equippedId(learner, 'ranged'));
  check('M1 flag off: learner bow knowledge stays 0', (knowledgeOf(learner).bow | 0) === 0, JSON.stringify(knowledgeOf(learner)));
  check('M1 flag off: no weapon_teach telemetry', teachTeleFor(learner).length === 0, JSON.stringify(teachTeleFor(learner)));
  check('M1 flag off: no teaching line spoken', !sayLines.some(function (s) { return /how a bow is strung/.test(s); }), JSON.stringify(sayLines));
  const offRecord = JSON.stringify(v.weaponCraft);

  // M2: BOWKNOW ON — the same knower teaches the same spear-holder.
  console.log('\n=== M2: flag on — the knower teaches the spear-holder ===');
  setBowknow(true);
  resetKnowledge();
  v.weaponCraft[mentor] = { bow: 1 };
  resetVillager(mentor);
  const lp2 = resetVillager(learner);
  lp2.items = ['hunting_spear'];
  if (EQ) EQ.autoEquip(lp2, G.data.items);
  resetVillager(teacher);
  setPile({});
  pinAllExcept([learner, mentor, teacher]);
  teleEvents.length = 0; sayLines.length = 0;
  callDuty();
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' teachTele=' + JSON.stringify(teachTeleFor(learner)) + ' say=' + JSON.stringify(sayLines));
  check('M2 flag on: learner gains bow L1', (knowledgeOf(learner).bow | 0) === 1, JSON.stringify(knowledgeOf(learner)));
  check('M2 flag on: weapon_teach telemetry names learner + mentor', teachTeleFor(learner).some(function (e) { return e.d.by === mentor && e.d.item === 'bow'; }), JSON.stringify(teachTeleFor(learner)));
  check('M2 flag on: teaching is witnessed aloud at home', sayLines.some(function (s) { return /how a bow is strung/.test(s); }), JSON.stringify(sayLines));

  // M3: flag off, repeat — byte-identical to M1 (the (e) control).
  console.log('\n=== M3: flag off repeat — byte-identical to M1 ===');
  setBowknow(false);
  resetKnowledge();
  v.weaponCraft[mentor] = { bow: 1 };
  resetVillager(mentor);
  const lp3 = resetVillager(learner);
  lp3.items = ['hunting_spear'];
  if (EQ) EQ.autoEquip(lp3, G.data.items);
  resetVillager(teacher);
  setPile({});
  pinAllExcept([learner, mentor, teacher]);
  teleEvents.length = 0; sayLines.length = 0;
  callDuty();
  check('M3 flag-off repeat: weaponCraft record identical to M1', JSON.stringify(v.weaponCraft) === offRecord, JSON.stringify(v.weaponCraft) + ' vs ' + offRecord);
  check('M3 flag-off repeat: learner still untaught', (knowledgeOf(learner).bow | 0) === 0, JSON.stringify(knowledgeOf(learner)));

  // M4: a bow in the COMMUNAL pile still seeds nothing (the pile
  // stays unseen). NOTE: a villager's PERSONAL stashed bow DOES
  // seed its owner by the landed own-hands rule — so the bow goes
  // in the communal weapons pile, not on any villager.
  console.log('\n=== M4: communal-pile bow is not seen, even with the flag on ===');
  setBowknow(true);
  resetKnowledge();
  resetVillager(teacher);
  resetVillager(learner);
  resetVillager(mentor);
  setPile({});
  try { G.stashState().weapons = [{ itemId: 'bow', units: 1 }]; } catch (e) {}
  pinAllExcept([learner, mentor, teacher]);
  teleEvents.length = 0;
  callDuty();
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' mentor knows=' + JSON.stringify(knowledgeOf(mentor)));
  check('M4 pile bow seeds NOTHING (flag on)', (knowledgeOf(learner).bow | 0) === 0, JSON.stringify(knowledgeOf(learner)));
  check('M4 no mentor exists from a pile bow', teachTeleFor(learner).length === 0, JSON.stringify(teachTeleFor(learner)));
  try { G.stashState().weapons = []; } catch (e) {}

  // M5: an EQUIPPED bow still seeds by seeing on BOTH legs.
  console.log('\n=== M5: equipped bow still seeds by seeing (both legs) ===');
  for (const on of [false, true]) {
    setBowknow(on);
    resetKnowledge();
    const tp5 = resetVillager(teacher);
    tp5.items = ['bow'];
    if (EQ) EQ.autoEquip(tp5, G.data.items);
    resetVillager(learner);
    resetVillager(mentor);
    setPile({});
    pinAllExcept([learner, mentor, teacher]);
    teleEvents.length = 0;
    callDuty();
    console.log('flag ' + (on ? 'on ' : 'off') + ': teacher ranged=' + equippedId(teacher, 'ranged') + ' learner knows=' + JSON.stringify(knowledgeOf(learner)));
    check('M5 flag ' + (on ? 'on' : 'off') + ': seeing seeds bow L1 on the learner', (knowledgeOf(learner).bow | 0) === 1, JSON.stringify(knowledgeOf(learner)));
  }

  console.log('\nBOWKNOW ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — FAILS: ' + fails.join('; ') : ''));
  process.exit(failed ? 1 : 0);
}

main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
