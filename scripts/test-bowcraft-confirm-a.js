#!/usr/bin/env node
// scripts/test-bowcraft-confirm-a.js — proof test, arm sim-bowcraft-confirm-a
// (finding #2597 / #2610). Clone of scripts/test-bowcraft-a.js re-pointed
// at the *-confirm-a instruments; the BOWCRAFT fix itself is LANDED on
// master (ef1c81094) and unchanged — this test proves the confirm
// instruments (window fix, analyzer selftest, control-leg identity,
// live smoke) before the confirm sweep.
//
// Proves the BOWCRAFT fix in villagerWeaponCraftDay (villager-build.js):
// (a) ranged-less villagers are served — a spear in the ranged slot is
//     NOT a ranged weapon (volleyWeaponOf), so a spear-armed villager
//     crafts BOW rungs only, never a second spear; weaponless villagers
//     keep the full ladder; volley-armed villagers are still skipped;
// (b) bow knowledge seeds from SEEING — a ladder weapon EQUIPPED by
//     another villager at home (same tile, visible in hand) teaches L1;
//     a bow in a pack or stash is NOT seen; the snapshot is taken before
//     the loop, so a same-day craft cannot seed a same-day attempt;
// (c) the spear leaves the ranged slot — a crafted bow auto-equips
//     into ranged and the spear moves to melee (the LANDED
//     MELEE-FIRST FALLBACK in equipment.js autoEquip — verified here,
//     NOT re-implemented);
// (d) control leg byte-identical — BOWCRAFT unset: spear-armed
//     villagers are skipped and no seeing-seeding happens (the old
//     duty, exactly as bowsource measured it: 0 attempts).
// The duty is called DIRECTLY on a staged village (the
// proof-lootabilities-w3 pattern): Math.random is stubbed to 0.01
// around each duty call so the L1 35% / L2 85% roll succeeds
// deterministically, and restored right after. The driver is then
// proven on a short LIVE smoke (1 seed, 5 days, competent policy,
// BOWCRAFT=1) and the live corpus is fed through the analyzer; a
// child process proves the BOWCRAFT-unset smoke (MODE=ctl) end to end.
//
// Usage: node scripts/test-bowcraft-confirm-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo (smoke corpora go to os.tmpdir());
// prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
process.env.DAYS = '5';
process.env.SENSEEXPED = '1'; // sweep substrate (landed successor to LAUNCHPARTY; see prereg)
process.env.BOWCRAFT = '1'; // the fix leg; direct-duty scenarios toggle this per case
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const REPO = path.join(__dirname, '..');
const drv = require('./bowcraft-driver-confirm-a');
const ana = require('./analyze-bowcraft-confirm-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// Child-process off-smoke (BOWCRAFT unset, MODE=ctl): stringified into
// a node -e run so the flag-off leg is proven end to end without a
// second harness in this process.
function offSmoke(driverPath) {
  const path = require('path');
  const { loadGame } = require(path.join(path.dirname(driverPath), 'sim-harness'));
  const d = require(driverPath);
  (async () => {
    try {
      const out = await d.oneRun(107002);
      console.log(JSON.stringify({
        bowcraftOn: out.bowcraftOn, bowcraftPresent: out.bowcraftPresent,
        errors: (out.instrumentErrors || []).length,
        censusRows: (out.bowCensus || []).length,
        baseline: !!out.bowBaseline,
        hasRangedlessCount: !!(out.bowBaseline && typeof out.bowBaseline.nRangedlessKnowsBow === 'number'),
      }));
    } catch (e) { console.log(JSON.stringify({ error: String(e && e.message || e) })); }
  })();
}

async function main() {
  // ---- 1. Static wiring ----
  const vb = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-build.js'), 'utf8');
  check('BOWCRAFT gate reads process.env in villagerWeaponCraftDay', /BOWCRAFT === '1'/.test(vb));
  check('BOW_RUNGS is bow + crude_bow only', /const BOW_RUNGS = \['bow', 'crude_bow'\]/.test(vb));
  check('seeing snapshot reads EQUIPPED gear only (same tile, visible)', /BOWCRAFT SEEING SNAPSHOT/.test(vb) && /Object\.values\(hp\.equipped/.test(vb));
  check('ranged-less read uses volleyWeaponOf (speargate rule)', /eq\.volleyWeaponOf && eq\.volleyWeaponOf\(p, defs\)/.test(vb));
  check('armed-but-ranged-less villagers get BOW_RUNGS', /if \(armed\) rungs = BOW_RUNGS;/.test(vb));
  check('pick loop reads the per-villager rungs, not the full ladder', /for \(const rid of rungs\)/.test(vb));
  check('duty still calls autoEquip after the craft (spear moves out)', /p\.items\.push\(\{ itemId: pick\.rid[\s\S]{0,400}eq\.autoEquip\(p, defs\)/.test(vb));

  // ---- 2. Live data agrees with the frozen lists ----
  const { Game } = await loadGame({ seed: 7, mode: 'bowcraft-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const liveRanged = (Game.data.items || []).filter(function (i) { return i.weapon && i.weapon.type === 'ranged'; }).map(function (i) { return i.id; }).sort();
  check('live items.json ranged set is the 8 ranged weapons', JSON.stringify(liveRanged) === JSON.stringify(['apex_bow', 'bow', 'crossbow', 'crude_bow', 'phase_sling', 'searcaster', 'sling', 'starfall_bow']),
    'live=' + JSON.stringify(liveRanged));
  const liveRecipes = {};
  for (const r of (Game.data.recipes || [])) if (r.id === 'bow' || r.id === 'crude_bow') liveRecipes[r.id] = r.materials;
  check('live bow recipe is wood 1 + vine 2', JSON.stringify(liveRecipes.bow) === JSON.stringify({ wood: 1, vine: 2 }), JSON.stringify(liveRecipes));
  check('live crude_bow recipe is branch 1 + vine 1', JSON.stringify(liveRecipes.crude_bow) === JSON.stringify({ branch: 1, vine: 1 }), JSON.stringify(liveRecipes));
  const liveSpear = (Game.data.items || []).find(function (i) { return i.id === 'hunting_spear'; });
  check('live hunting_spear is melee range 2 with no ammo', !!(liveSpear && liveSpear.weapon && liveSpear.weapon.type === 'melee' && liveSpear.weapon.range === 2 && !liveSpear.weapon.ammo),
    JSON.stringify(liveSpear && liveSpear.weapon));

  // ---- 3. Direct-duty scenarios (one staged village, seed 31031) ----
  // Fresh harness for the staged village (the unit loadGame above
  // was only for data reads; the duty scenarios run on their own).
  const g2 = await loadGame({ seed: 31031, mode: 'bowcraft-duty' });
  const G = g2.Game;
  check('villagerWeaponCraftDay callable', typeof G.villagerWeaponCraftDay === 'function');
  if (typeof G.villagerWeaponCraftDay !== 'function') { console.log('BOWCRAFT_FAILS ' + failed); process.exit(1); }
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
  const teacher = others[1];
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
  const craftTeleFor = function (vid) { return teleEvents.filter(function (e) { return e.t === 'weapon_craft' && e.d && e.d.vid === vid; }); };
  const setBowcraft = function (on) { if (on) process.env.BOWCRAFT = '1'; else delete process.env.BOWCRAFT; };
  const callDuty = function () {
    const origRandom = Math.random;
    try { Math.random = function () { return 0.01; }; return G.villagerWeaponCraftDay(); }
    finally { Math.random = origRandom; }
  };
  const knowledgeOf = function (vid) { return (v.weaponCraft || {})[vid] || {}; };
  const volleyOf = function (vid) {
    try { return EQ && EQ.volleyWeaponOf ? EQ.volleyWeaponOf(person(vid), G.data.items) : null; }
    catch (e) { return null; }
  };
  // Stand the player at haven so workbench narration is witnessed.
  if (G.map) { G.map.px = v.px != null ? v.px : 4; G.map.py = v.py != null ? v.py : 4; }

  // S1: SEEING seeds L1 (no materials — knowledge only, no attempt).
  console.log('\n=== S1: seeing an equipped bow seeds L1 (no materials) ===');
  setBowcraft(true);
  resetKnowledge();
  const tp = resetVillager(teacher);
  tp.items = ['bow'];
  if (EQ) EQ.autoEquip(tp, G.data.items);
  const lp = resetVillager(learner);
  setPile({});
  pinAllExcept([learner, teacher]);
  teleEvents.length = 0;
  console.log('before: teacher ranged=' + equippedId(teacher, 'ranged') + ' learner knows=' + JSON.stringify(knowledgeOf(learner)));
  callDuty();
  console.log('after: learner knows=' + JSON.stringify(knowledgeOf(learner)) + ' tele=' + JSON.stringify(craftTeleFor(learner)));
  check('S1 teacher holds the bow in the ranged slot', equippedId(teacher, 'ranged') === 'bow', equippedId(teacher, 'ranged'));
  check('S1 seeing seeds bow L1 on the learner', (knowledgeOf(learner).bow | 0) === 1, JSON.stringify(knowledgeOf(learner)));
  check('S1 no materials means no attempt (knowledge only)', craftTeleFor(learner).length === 0, JSON.stringify(craftTeleFor(learner)));

  // S2: SEEING -> CRAFT: same learner, now with bow materials.
  console.log('\n=== S2: seen bow + materials -> the learner crafts a bow ===');
  setPile({ wood: 1, vine: 2 });
  pinAllExcept([learner, teacher]);
  teleEvents.length = 0; sayLines.length = 0;
  const made2 = callDuty();
  console.log('duty returned: ' + made2 + ' tele=' + JSON.stringify(craftTeleFor(learner)) +
    ' equipped ranged=' + equippedId(learner, 'ranged') + ' pile=' + JSON.stringify(G.stashState().materials));
  check('S2 learner crafts a bow (tele ok)', craftTeleFor(learner).some(function (e) { return e.d.item === 'bow' && e.d.ok === true; }), JSON.stringify(craftTeleFor(learner)));
  check('S2 crafted bow is EQUIPPED in the ranged slot', equippedId(learner, 'ranged') === 'bow', equippedId(learner, 'ranged'));
  check('S2 pile paid the recipes.json bow cost (wood1+vine2)', G.stashState().materials.wood === 0 && G.stashState().materials.vine === 0, G.stashState().materials);
  check('S2 blind success teaches L2 (PRACTICE rule)', (knowledgeOf(learner).bow | 0) === 2, JSON.stringify(knowledgeOf(learner)));

  // S3: a bow in a PACK is not seen (call 1); once autoEquip seats
  // it, the next duty call sees it (call 2).
  console.log('\n=== S3: pack bow is not seen until it is in hand ===');
  setBowcraft(true);
  resetKnowledge();
  const tp3 = resetVillager(teacher);
  tp3.items = ['bow']; // in the pack, NOT equipped
  resetVillager(learner);
  setPile({});
  pinAllExcept([learner, teacher]);
  teleEvents.length = 0;
  console.log('before call 1: teacher ranged=' + equippedId(teacher, 'ranged') + ' (pack bow, not in hand)');
  callDuty();
  console.log('after call 1: teacher ranged=' + equippedId(teacher, 'ranged') + ' learner knows=' + JSON.stringify(knowledgeOf(learner)));
  check('S3 call 1: teacher autoEquips the pack bow during the duty', equippedId(teacher, 'ranged') === 'bow', equippedId(teacher, 'ranged'));
  check('S3 call 1: pack bow seeds NOTHING (snapshot was pre-loop)', (knowledgeOf(learner).bow | 0) === 0, JSON.stringify(knowledgeOf(learner)));
  callDuty();
  console.log('after call 2: learner knows=' + JSON.stringify(knowledgeOf(learner)));
  check('S3 call 2: the now-equipped bow IS seen (L1)', (knowledgeOf(learner).bow | 0) === 1, JSON.stringify(knowledgeOf(learner)));

  // S4: a bow in a STASH is not seen.
  console.log('\n=== S4: stash bow is not seen ===');
  setBowcraft(true);
  resetKnowledge();
  const tp4 = resetVillager(teacher);
  tp4.stashed = ['bow'];
  resetVillager(learner);
  setPile({});
  pinAllExcept([learner, teacher]);
  teleEvents.length = 0;
  callDuty();
  console.log('after: teacher equipped=' + JSON.stringify(tp4.equipped) + ' learner knows=' + JSON.stringify(knowledgeOf(learner)));
  check('S4 stash bow seeds NOTHING', (knowledgeOf(learner).bow | 0) === 0, JSON.stringify(knowledgeOf(learner)));

  // S5: SPEAR-ARMED villager crafts a bow; the spear moves to melee.
  console.log('\n=== S5: spear-armed villager crafts a bow, spear moves to melee ===');
  setBowcraft(true);
  resetKnowledge();
  const lp5 = resetVillager(learner);
  lp5.items = ['hunting_spear'];
  if (EQ) EQ.autoEquip(lp5, G.data.items);
  v.weaponCraft[learner] = { bow: 2 };
  setPile({ wood: 1, vine: 2 });
  pinAllExcept([learner]);
  teleEvents.length = 0;
  console.log('before: ranged=' + equippedId(learner, 'ranged') + ' melee=' + equippedId(learner, 'melee') +
    ' volley=' + JSON.stringify(volleyOf(learner) && (volleyOf(learner).itemId || volleyOf(learner).id)));
  check('S5 setup: spear sits in the ranged slot and volleys NOTHING', equippedId(learner, 'ranged') === 'hunting_spear' && !volleyOf(learner),
    { ranged: equippedId(learner, 'ranged'), volley: volleyOf(learner) });
  const made5 = callDuty();
  console.log('duty returned: ' + made5 + ' tele=' + JSON.stringify(craftTeleFor(learner)) +
    ' ranged=' + equippedId(learner, 'ranged') + ' melee=' + equippedId(learner, 'melee') +
    ' items=' + JSON.stringify((person(learner).items || []).map(function (e) { return (e && (e.itemId || e.id)) || e; })));
  check('S5 spear-armed villager crafts a bow (tele ok)', craftTeleFor(learner).some(function (e) { return e.d.item === 'bow' && e.d.ok === true; }), JSON.stringify(craftTeleFor(learner)));
  check('S5 crafted bow is EQUIPPED in the ranged slot', equippedId(learner, 'ranged') === 'bow', equippedId(learner, 'ranged'));
  check('S5 the spear MOVED to the melee slot (not deleted, not in ranged)', equippedId(learner, 'melee') === 'hunting_spear', equippedId(learner, 'melee'));
  check('S5 no second spear was crafted', !craftTeleFor(learner).some(function (e) { return e.d.item === 'hunting_spear'; }), JSON.stringify(craftTeleFor(learner)));

  // S6: spear-armed, knows ONLY the spear -> NO attempt (bow rungs only).
  console.log('\n=== S6: spear-armed villager never crafts a second spear ===');
  setBowcraft(true);
  resetKnowledge();
  const lp6 = resetVillager(learner);
  lp6.items = ['hunting_spear'];
  if (EQ) EQ.autoEquip(lp6, G.data.items);
  v.weaponCraft[learner] = { hunting_spear: 2 };
  setPile({ branch: 4, stone: 2, vine: 6, wood: 2 });
  pinAllExcept([learner]);
  teleEvents.length = 0;
  callDuty();
  console.log('after: ranged=' + equippedId(learner, 'ranged') + ' tele=' + JSON.stringify(craftTeleFor(learner)));
  check('S6 spear knowledge + spear materials -> still NO attempt', craftTeleFor(learner).length === 0, JSON.stringify(craftTeleFor(learner)));
  check('S6 kit unchanged (still just the one spear)', equippedId(learner, 'ranged') === 'hunting_spear' && equippedId(learner, 'melee') === null, equippedId(learner, 'ranged'));

  // S7: spear-armed, knows spear AND bow -> picks the BOW, not the spear.
  console.log('\n=== S7: spear-armed with both knowledges picks the bow ===');
  setBowcraft(true);
  resetKnowledge();
  const lp7 = resetVillager(learner);
  lp7.items = ['hunting_spear'];
  if (EQ) EQ.autoEquip(lp7, G.data.items);
  v.weaponCraft[learner] = { hunting_spear: 2, bow: 2 };
  setPile({ branch: 4, stone: 2, vine: 6, wood: 2 });
  pinAllExcept([learner]);
  teleEvents.length = 0;
  callDuty();
  console.log('after: tele=' + JSON.stringify(craftTeleFor(learner)) + ' ranged=' + equippedId(learner, 'ranged'));
  check('S7 the pick is the bow, never the spear', craftTeleFor(learner).length === 1 && craftTeleFor(learner)[0].d.item === 'bow' && craftTeleFor(learner)[0].d.ok === true,
    JSON.stringify(craftTeleFor(learner)));

  // S8: volley-armed villager is still skipped.
  console.log('\n=== S8: bow-armed villager is still skipped ===');
  setBowcraft(true);
  resetKnowledge();
  const lp8 = resetVillager(learner);
  lp8.items = ['bow'];
  if (EQ) EQ.autoEquip(lp8, G.data.items);
  v.weaponCraft[learner] = { bow: 2, crude_bow: 2 };
  setPile({ branch: 4, stone: 2, vine: 6, wood: 2 });
  pinAllExcept([learner]);
  teleEvents.length = 0;
  callDuty();
  console.log('after: ranged=' + equippedId(learner, 'ranged') + ' tele=' + JSON.stringify(craftTeleFor(learner)));
  check('S8 bow-armed villager makes NO attempt', craftTeleFor(learner).length === 0, JSON.stringify(craftTeleFor(learner)));

  // S9: CONTROL (BOWCRAFT unset) — the old duty, exactly as bowsource
  // measured it: spear-armed skipped, no seeing-seeding.
  console.log('\n=== S9: control leg (BOWCRAFT unset) — old behavior ===');
  setBowcraft(false);
  resetKnowledge();
  const lp9 = resetVillager(learner);
  lp9.items = ['hunting_spear'];
  if (EQ) EQ.autoEquip(lp9, G.data.items);
  v.weaponCraft[learner] = { bow: 2 };
  setPile({ wood: 1, vine: 2 });
  pinAllExcept([learner]);
  teleEvents.length = 0;
  callDuty();
  console.log('after S9a: ranged=' + equippedId(learner, 'ranged') + ' tele=' + JSON.stringify(craftTeleFor(learner)));
  check('S9a control: spear-armed villager is SKIPPED (no attempt)', craftTeleFor(learner).length === 0, JSON.stringify(craftTeleFor(learner)));
  const tp9 = resetVillager(teacher);
  tp9.items = ['bow'];
  if (EQ) EQ.autoEquip(tp9, G.data.items);
  resetVillager(learner);
  resetKnowledge(); // S9a left the learner's record at {bow:2, hunting_spear:1} — clear it, so any L1 after this call can only come from seeding
  setPile({});
  pinAllExcept([learner, teacher]);
  teleEvents.length = 0;
  callDuty();
  console.log('after S9b: teacher ranged=' + equippedId(teacher, 'ranged') + ' learner knows=' + JSON.stringify(knowledgeOf(learner)));
  check('S9b control: seeing seeds NOTHING when the flag is off', (knowledgeOf(learner).bow | 0) === 0, JSON.stringify(knowledgeOf(learner)));

  // S10: weaponless villager keeps the FULL ladder (spear first).
  console.log('\n=== S10: weaponless ladder order unchanged (spear first) ===');
  setBowcraft(true);
  resetKnowledge();
  resetVillager(learner);
  v.weaponCraft[learner] = { hunting_spear: 2, bow: 2 };
  setPile({ branch: 4, stone: 2, vine: 6, wood: 2 });
  pinAllExcept([learner]);
  teleEvents.length = 0;
  callDuty();
  console.log('after: tele=' + JSON.stringify(craftTeleFor(learner)));
  check('S10 weaponless with full knowledge crafts the SPEAR first', craftTeleFor(learner).length === 1 && craftTeleFor(learner)[0].d.item === 'hunting_spear' && craftTeleFor(learner)[0].d.ok === true,
    JSON.stringify(craftTeleFor(learner)));

  // S11: the 3-day cooldown still binds after a craft.
  console.log('\n=== S11: cooldown binds after a craft ===');
  setBowcraft(true);
  resetKnowledge();
  resetVillager(learner);
  v.weaponCraft[learner] = { bow: 2 };
  setPile({ wood: 2, vine: 4 });
  pinAllExcept([learner]);
  teleEvents.length = 0;
  callDuty();
  const firstCount = craftTeleFor(learner).length;
  console.log('after call 1: tele=' + JSON.stringify(craftTeleFor(learner)));
  check('S11 call 1 crafts a bow', firstCount === 1 && craftTeleFor(learner)[0].d.item === 'bow' && craftTeleFor(learner)[0].d.ok === true,
    JSON.stringify(craftTeleFor(learner)));
  resetVillager(learner); // back to weaponless, bow gone — but the cooldown stands
  v.weaponCraft[learner] = { bow: 2 };
  setPile({ wood: 1, vine: 2 });
  pinAllExcept([learner]);
  callDuty();
  console.log('after call 2 (same day): tele=' + JSON.stringify(craftTeleFor(learner)));
  check('S11 call 2 same day: NO second attempt (cooldown)', craftTeleFor(learner).length === 1, JSON.stringify(craftTeleFor(learner)));

  // ---- 4. LIVE smoke: 1 seed, 5 days, competent policy, BOWCRAFT=1 ----
  console.log('\n=== LIVE smoke (driver oneRun, BOWCRAFT=1) ===');
  setBowcraft(true);
  const out = await drv.oneRun(107001);
  check('smoke ran 5 days', out.days === 5 && out.gameDays >= 5, 'days=' + out.days + ' gameDays=' + out.gameDays);
  check('smoke instrument errors are 0', (out.instrumentErrors || []).length === 0, JSON.stringify(out.instrumentErrors));
  check('smoke ran with BOWCRAFT on (fix leg)', out.bowcraftOn === true && out.bowcraftPresent === true,
    JSON.stringify({ on: out.bowcraftOn, present: out.bowcraftPresent }));
  check('smoke ran with BOWOPEN off + SPEARGATE off (flag-off proof)', out.bowopenOn === false,
    JSON.stringify({ bowopenOn: out.bowopenOn }));
  check('smoke ran with SENSEEXPED on (landed substrate)', out.senseexpedOn === true && out.senseexpedPresent === true && out.launchpartyOn === false,
    JSON.stringify({ se: out.senseexpedOn, sep: out.senseexpedPresent, lp: out.launchpartyOn }));
  check('smoke baseline exists with a roster', !!out.bowBaseline && Array.isArray(out.bowBaseline.roster) && out.bowBaseline.roster.length > 0,
    'roster=' + (out.bowBaseline && out.bowBaseline.roster && out.bowBaseline.roster.length));
  check('smoke baseline carries the ranged-less counts',
    !!out.bowBaseline && typeof out.bowBaseline.nRangedlessKnowsBow === 'number' && typeof out.bowBaseline.nSpearArmedKnowsBow === 'number',
    JSON.stringify(out.bowBaseline && { rl: out.bowBaseline.nRangedlessKnowsBow, sp: out.bowBaseline.nSpearArmedKnowsBow }));
  check('smoke census rows carry the ranged-less counts',
    Array.isArray(out.bowCensus) && out.bowCensus.length >= 3 &&
    out.bowCensus.every(function (r) { return typeof r.nRangedlessKnowsBow === 'number' && typeof r.nSpearArmedKnowsBow === 'number'; }),
    'rows=' + (out.bowCensus && out.bowCensus.length));
  check('smoke bowEvents / bowKills / bowDeparts are arrays',
    Array.isArray(out.bowEvents) && Array.isArray(out.bowKills) && Array.isArray(out.bowDeparts),
    JSON.stringify({ ev: out.bowEvents && out.bowEvents.length, k: out.bowKills && out.bowKills.length, d: out.bowDeparts && out.bowDeparts.length }));
  const vfCraft = (out.teleCounts && out.teleCounts.weapon_craft) || 0;
  const drvCraft = (out.bowEvents || []).filter(function (e) { return e.type === 'weapon_craft'; }).length;
  check('tele wrap captures every weapon_craft VF counted', drvCraft === vfCraft, 'driver=' + drvCraft + ' vf=' + vfCraft);

  // ---- 5. Analyzer reads the LIVE smoke corpus ----
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-smoke-'));
  try {
    fs.writeFileSync(path.join(tmp, 'smoke.json'), JSON.stringify(out));
    const agg = ana.aggregate(tmp);
    check('analyzer accepts the live corpus (1 valid file)', agg.valid === 1 && agg.n === 1, JSON.stringify({ n: agg.n, v: agg.valid }));
    check('analyzer finds 0 instrument errors on the live corpus', agg.errors === 0, 'errors=' + agg.errors);
    check('analyzer records bowcraftOn true on the smoke corpus', agg.bowcraftOn['true'] === 1, JSON.stringify(agg.bowcraftOn));
    check('analyzer starting count equals the baseline bow total',
      agg.starting === (out.bowBaseline.villageBowTotal | 0), 'analyzer=' + agg.starting + ' baseline=' + out.bowBaseline.villageBowTotal);
    check('analyzer departure count equals the driver rows', agg.departs === (out.bowDeparts || []).length,
      'analyzer=' + agg.departs + ' driver=' + out.bowDeparts.length);
    const j = ana.judge(agg, agg);
    check('analyzer compare judge returns a verdict on the live corpus', j.verdict === 'GO' || j.verdict === 'NO-GO', j.verdict);
    check('analyzer compare judge has the four frozen bars', Array.isArray(j.bars) && j.bars.length === 4, JSON.stringify(j.bars.map(function (b) { return b.id; })));
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }

  // ---- 5b. Analyzer selftest (finding #2609 window fix) ----
  // The confirm analyzer's selftest must pass as a child process
  // (35 checks: the pilot's 30 + the 5 live-cadence checks proving
  // the [prevRowDay, rowDay] window attributes a day-D craft/loot
  // event first seen in the D+1 row). The pilot analyzer's selftest
  // is NOT re-run as the judge — the confirm instrument is the judge.
  console.log('\n=== Analyzer selftest (analyze-bowcraft-confirm-a --selftest) ===');
  let anaSelf = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-bowcraft-confirm-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    anaSelf = /35 passed, 0 failed/.test(anaOut);
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (35 passed, 0 failed — incl. the #2609 live-cadence fixture)', anaSelf === true, anaSelf === null ? 'no output' : 'see output above');

  // ---- 6. Child-process off-smoke (BOWCRAFT unset, MODE=ctl) ----
  console.log('\n=== Child off-smoke (BOWCRAFT unset) ===');
  let off = null;
  try {
    const env = Object.assign({}, process.env);
    delete env.BOWCRAFT;
    env.DAYS = '5'; env.SENSEEXPED = '1';
    env.VETREENGAGE = '1'; env.PARTYSIZE4 = '1'; env.FLEEREPAIR2 = '1'; env.FIGHTALLY2 = '1';
    const childOut = execFileSync(process.execPath, ['-e',
      '(' + offSmoke.toString() + ')(' + JSON.stringify(path.join(REPO, 'scripts', 'bowcraft-driver-confirm-a.js')) + ')'],
      { encoding: 'utf8', timeout: 240000, maxBuffer: 16 * 1024 * 1024, env: env });
    const lastLine = childOut.trim().split('\n').filter(Boolean).pop();
    off = JSON.parse(lastLine);
  } catch (e) {
    console.log('  (child off-smoke failed: ' + (e && e.message) + ')');
  }
  if (off && !off.error) {
    console.log('  off-smoke result: ' + JSON.stringify(off));
    check('off-smoke ran with BOWCRAFT off', off.bowcraftOn === false && off.bowcraftPresent === true, JSON.stringify(off));
    check('off-smoke instrument errors are 0', off.errors === 0, JSON.stringify(off));
    check('off-smoke census rows exist with the ranged-less counts', off.censusRows >= 3 && off.hasRangedlessCount === true, JSON.stringify(off));
  } else {
    check('off-smoke child ran and reported', false, off ? JSON.stringify(off) : 'no output');
  }

  console.log('BOWCRAFT_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('BOWCRAFT_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(function (e) { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
