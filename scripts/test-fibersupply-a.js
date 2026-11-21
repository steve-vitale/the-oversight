#!/usr/bin/env node
// scripts/test-fibersupply-a.js — proof test, arm sim-fibersupply-a
// (finding #2590, fiber-supply DIAGNOSIS: why the communal pile never
// has fiber when a departure tries to craft arrows).
//
// Proves the FIBER instrument (scripts/fibersupply-driver-a.js)
// attributes correctly on a LIVE staged village — no game-code change
// in this arm, so every fixture is about the counters, not a lever:
//   (a) a deadfall resolution that lands fiber is recorded as a
//       `deadfall`-task event whose dFiber equals the pile delta
//       measured around that same call (attribution, not yield);
//   (b) a departure arrow-craft attempt records pile fiber
//       before/after with exactly -1 on the attempt;
//   (c) the daily census reads pile fiber and scholar personal fiber
//       as separate numbers (pile 3 / personal 5 stay distinct);
//   (d) a scholar craft('arrow') spends PERSONAL fiber and leaves
//       pile fiber unchanged (the two fiber economies never meet);
//   (e) a stashLog fiber line is captured by the ledger wrap;
//   (f) a say-line mentioning fiber is captured (sense-test feed).
//
// Usage: node scripts/test-fibersupply-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
process.env.SENSEEXPED = '1';
process.env.BOWOPEN = '1';
process.env.SPEARGATE = '1';
// DEPMAT / ROLL35 / AMMO deliberately UNSET: not on master (the ammo
// arm reverted them); this diag measures the pile on live master
// substrate. BOWKNOW / DEPARTSEE / EVADEOBS unset likewise.
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const REPO = path.join(__dirname, '..');
const FIBER = require('./fibersupply-driver-a.js');
const SEED = parseInt(process.env.SEED || '31031', 10) || 31031;

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  // ---- 1. Static wiring (the code census, re-checked) ----
  const game = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  check('deadfall branch yields fiber on a 50% roll into the pile',
    /const fiber = Math\.random\(\) < 0\.5 \? 1 : 0;/.test(game) &&
    /st\.materials\.fiber = \(st\.materials\.fiber \|\| 0\) \+ fiber;/.test(game));
  check('arrow recipe costs 1 fiber (stick 2 + stone 1 + fiber 1)',
    (() => { try { const r = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'recipes.json'), 'utf8')); const a = r.find(x => x.id === 'arrow'); return a && a.materials && a.materials.fiber === 1 && a.materials.stick === 2 && a.materials.stone === 1; } catch (e) { return false; } })());
  check('pocketAmmo deducts recipe materials from the pile before the roll',
    /for \(const \[m, need\] of Object\.entries\(recipe\.materials\)\) mats\[m\] -= need;/.test(game));
  check('scholar craft() draws from personal inventory only (no pile read)',
    (() => { const c = (game.split('    craft(recipeId) {')[1] || '').split('    },\n\n    // LEARN RECIPE')[0] || ''; return c.indexOf('stashState') === -1 && c.indexOf('const inv = this.state.scholar.inventory') !== -1; })());
  check('driver exports the fiber helpers', typeof FIBER.pileMats === 'function' && typeof FIBER.personalFiber === 'function' && typeof FIBER.installFiberWraps === 'function');

  // ---- 2. Staged village (seed 31031, same pattern as test-ammo-a.js) ----
  const g2 = await loadGame({ seed: SEED, mode: 'fibersupply-stage' });
  const G = g2.Game;
  check('villagerPocketAmmo callable', typeof G.villagerPocketAmmo === 'function');
  check('villagerStageBow callable', typeof G.villagerStageBow === 'function');
  check('resolveOneAssignment callable', typeof G.resolveOneAssignment === 'function');
  check('npcBatchTurn callable', typeof G.npcBatchTurn === 'function');
  check('craft callable', typeof G.craft === 'function');
  check('stashLog callable', typeof G.stashLog === 'function');
  if (typeof G.villagerPocketAmmo !== 'function' || typeof G.resolveOneAssignment !== 'function') { console.log('FIBERSUPPLY_FAILS ' + failed); process.exit(1); }
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

  // Install the fiber instrument on this live village.
  const ctx = { fiberCensus: [], fiberEvents: [], fiberCrafts: [], fiberSays: [], fiberStashLog: [], craftDayCalls: { weapon: 0, armor: 0 } };
  const wrapErrors = [];
  const installed = FIBER.installFiberWraps(G, ctx, wrapErrors);
  check('installFiberWraps installs without errors', wrapErrors.length === 0, wrapErrors.join(' | '));
  check('installFiberWraps returns an uninstall', installed && typeof installed.uninstall === 'function');

  const setPile = function (mats) {
    const st = G.stashState();
    for (const m of ['wood', 'branch', 'stone', 'fiber', 'stick', 'vine', 'bark']) st.materials[m] = 0;
    Object.assign(st.materials, mats);
    try { st.weapons = []; } catch (e) {}
    return st.materials;
  };
  const pileFiber = function () { return (G.stashState().materials.fiber || 0); };
  const scholarFiber = function () {
    let n = 0;
    for (const e of (G.state.scholar.inventory || [])) if (e && e.material === 'fiber') n += (e.units || 1);
    return n;
  };
  const setScholarFiber = function (n) {
    const inv = G.state.scholar.inventory || (G.state.scholar.inventory = []);
    for (let i = inv.length - 1; i >= 0; i--) if (inv[i] && inv[i].material === 'fiber') inv.splice(i, 1);
    if (n > 0) inv.push({ material: 'fiber', units: n, name: 'Plant fiber', kcalEach: 0, spoilDay: 9999, kg: 0.1 });
  };
  const resetVillager = function (vid) {
    const p = person(vid);
    p.items = []; p.equipped = {}; p.stashed = []; p.dead = false;
    if (v.away) delete v.away[vid];
    return p;
  };

  // ---- M2 (census separation — before the event fixtures, so the
  // pile/personal numbers are clean) ----
  console.log('\n=== M2: census reads pile fiber and personal fiber separately ===');
  setPile({ fiber: 3, stick: 6, stone: 10 });
  setScholarFiber(5);
  const pm = FIBER.pileMats(G);
  const pf = FIBER.personalFiber(G);
  console.log('pileMats=' + JSON.stringify(pm) + ' personalFiber=' + JSON.stringify(pf));
  check('M2 pileMats reads pile fiber 3', pm && pm.fiber === 3, JSON.stringify(pm));
  check('M2 personalFiber reads scholar fiber 5', pf && pf.scholar === 5, JSON.stringify(pf));
  check('M2 personalFiber reads villagers fiber 0 (nobody holds any)', pf && pf.villagers === 0, JSON.stringify(pf));
  check('M2 pile and personal stay distinct (3 != 5)', pm.fiber !== pf.scholar);

  // ---- M3 (deadfall attribution) ----
  console.log('\n=== M3: deadfall resolutions attribute their pile-fiber delta ===');
  setPile({ fiber: 0, stick: 0, stone: 0 });
  setScholarFiber(0);
  let fiberLanded = false;
  let attributionOk = true;
  let calls = 0;
  const assignRowsBefore = ctx.fiberEvents.length;
  for (let i = 0; i < 40 && !fiberLanded; i++) {
    const vid = others[i % others.length];
    v.assignments = v.assignments || {};
    v.assignments[vid] = { task: 'deadfall', assignedDay: (G.state.scholar || {}).day || 0, assignedPart: 0, via: 'test' };
    const before = pileFiber();
    const rowsBefore = ctx.fiberEvents.length;
    calls++;
    try { G.resolveOneAssignment(vid, { task: 'deadfall' }); } catch (e) { attributionOk = false; console.log('  resolveOneAssignment threw: ' + e.message); }
    const after = pileFiber();
    const newRows = ctx.fiberEvents.slice(rowsBefore);
    // Attribution: the rows this call pushed must sum to the measured delta.
    const sum = newRows.reduce(function (t, r) { return t + (r.dFiber || 0); }, 0);
    if (sum !== (after - before)) { attributionOk = false; console.log('  attribution mismatch on call ' + calls + ': rows sum ' + sum + ' vs measured ' + (after - before) + ' rows=' + JSON.stringify(newRows)); }
    if (after - before === 1) {
      fiberLanded = true;
      const r = newRows[newRows.length - 1];
      check('M3 landing row is a deadfall-task event', r && r.kind === 'assign' && r.task === 'deadfall', JSON.stringify(r));
      check('M3 landing row dFiber is exactly +1', r && r.dFiber === 1, JSON.stringify(r));
      check('M3 landing row carries pile before/after', r && r.pileBefore != null && r.pileBefore.fiber === before && r.pileAfter != null && r.pileAfter.fiber === after, JSON.stringify(r));
    }
  }
  console.log('deadfall calls=' + calls + ' events=' + (ctx.fiberEvents.length - assignRowsBefore) + ' fiberLanded=' + fiberLanded);
  check('M3 fiber landed within 40 deadfall resolutions (50% coin)', fiberLanded, 'calls=' + calls);
  check('M3 every call attributed exactly (rows sum == measured delta)', attributionOk);
  check('M3 deadfall hauls counter moved (Game._deadfallHauls)', (G._deadfallHauls || 0) >= calls - 2, '_deadfallHauls=' + G._deadfallHauls + ' calls=' + calls);

  // ---- M4 (pocketAmmo -1 fiber) ----
  console.log('\n=== M4: departure arrow-craft attempt costs exactly 1 pile fiber ===');
  const serveBow = function (roll) {
    resetVillager(learner);
    v.weaponCraft = {};
    v.weaponCraft[learner] = { crude_bow: 1 };
    v.ammoCraft = {};
    v.bowOpen = {}; v.bowOpenByVid = {};
    const lp = person(learner);
    lp.items = ['hunting_spear'];
    if (EQ) EQ.autoEquip(lp, G.data.items);
    setPile({ branch: 1, vine: 1 });
    const origRandom = Math.random;
    try { Math.random = function () { return roll; }; return G.villagerStageBow(learner); }
    finally { Math.random = origRandom; }
  };
  const s1 = serveBow(0.01);
  const rangedId = (function () { const e = (person(learner).equipped || {}).ranged; return e ? (e.itemId || e.id || null) : null; })();
  console.log('served: staged=' + s1.staged + ' ranged=' + rangedId);
  check('M4 staging served a crude bow (prerequisite)', s1.staged === true && rangedId === 'crude_bow', JSON.stringify(s1) + ' ranged=' + rangedId);
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const evBefore = ctx.fiberEvents.length;
  const fBefore = pileFiber();
  let out = null;
  const origRandom = Math.random;
  try { Math.random = function () { return 0.01; }; out = G.villagerPocketAmmo(learner); }
  finally { Math.random = origRandom; }
  const fAfter = pileFiber();
  console.log('pocket: crafted=' + out.crafted + ' ok=' + out.craftedOk + ' pileFiber ' + fBefore + ' -> ' + fAfter);
  check('M4 the craft attempt ran (crafted 1)', out.crafted === 1, JSON.stringify(out));
  check('M4 pile fiber dropped by exactly 1 on the attempt', fAfter === fBefore - 1, fBefore + ' -> ' + fAfter);
  const pocketRows = ctx.fiberEvents.slice(evBefore).filter(function (r) { return r.kind === 'pocketAmmo'; });
  check('M4 a pocketAmmo ledger row was recorded', pocketRows.length === 1, JSON.stringify(ctx.fiberEvents.slice(evBefore)));
  check('M4 pocketAmmo row dFiber is exactly -1', pocketRows[0] && pocketRows[0].dFiber === -1, JSON.stringify(pocketRows[0]));
  check('M4 pocketAmmo row carries pile before/after', pocketRows[0] && pocketRows[0].pileBefore.fiber === 1 && pocketRows[0].pileAfter.fiber === 0, JSON.stringify(pocketRows[0]));
  let carried = 0;
  for (const e of (person(learner).items || [])) { const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material)); if (eid === 'arrow') carried += (typeof e === 'string') ? 1 : (e.units || 1); }
  check('M4 the carrier holds 5 arrows after the successful craft', carried === 5, 'carried=' + carried);

  // ---- M5 (scholar craft spends personal fiber, pile untouched) ----
  console.log('\n=== M5: scholar craft(arrow) spends personal fiber, pile unchanged ===');
  try { if (G.grantKnowledge) G.grantKnowledge('recipe', 'arrow', 2, { type: 'discovery' }); } catch (e) {}
  G.state.codex = G.state.codex || {};
  G.state.codex.recipes = G.state.codex.recipes || {};
  G.state.codex.recipes.arrow = { level: 2 };
  const inv = G.state.scholar.inventory;
  for (let i = inv.length - 1; i >= 0; i--) { const e = inv[i]; if (e && (e.material === 'stick' || e.material === 'stone')) inv.splice(i, 1); }
  inv.push({ material: 'stick', units: 5, name: 'Stick', kcalEach: 0, spoilDay: 9999, kg: 0.1 });
  inv.push({ material: 'stone', units: 5, name: 'Stone', kcalEach: 0, spoilDay: 9999, kg: 0.3 });
  setScholarFiber(5);
  setPile({ fiber: 3, stick: 6, stone: 10 });
  const crBefore = ctx.fiberCrafts.length;
  const pBefore = pileFiber();
  const sBefore = scholarFiber();
  let made = null;
  const origRandom2 = Math.random;
  try { Math.random = function () { return 0.01; }; made = G.craft('arrow'); }
  finally { Math.random = origRandom2; }
  const pAfter = pileFiber();
  const sAfter = scholarFiber();
  console.log('craft: made=' + made + ' personal ' + sBefore + ' -> ' + sAfter + ' pile ' + pBefore + ' -> ' + pAfter);
  check('M5 scholar craft(arrow) succeeded', made === true, 'made=' + made);
  check('M5 personal fiber dropped by exactly 1', sAfter === sBefore - 1, sBefore + ' -> ' + sAfter);
  check('M5 pile fiber unchanged by the scholar craft', pAfter === pBefore, pBefore + ' -> ' + pAfter);
  const craftRows = ctx.fiberCrafts.slice(crBefore);
  check('M5 a fiberCrafts row was recorded', craftRows.length === 1, JSON.stringify(craftRows));
  check('M5 fiberCrafts row spends personal 1, pile delta 0', craftRows[0] && craftRows[0].fiberSpentPersonal === 1 && craftRows[0].pileFiberDelta === 0, JSON.stringify(craftRows[0]));

  // ---- M6 (stashLog + say capture) ----
  console.log('\n=== M6: stashLog fiber lines and fiber say-lines are captured ===');
  const slBefore = ctx.fiberStashLog.length;
  G.stashLog('take', 'Plant fiber', 1, learner);
  G.stashLog('take', 'Stone', 2, learner);
  check('M6 fiber stashLog line captured, stone line not', ctx.fiberStashLog.length === slBefore + 1 && ctx.fiberStashLog[ctx.fiberStashLog.length - 1].what === 'Plant fiber', JSON.stringify(ctx.fiberStashLog.slice(slBefore)));
  const sayBefore = ctx.fiberSays.length;
  G.say('Mara gathers deadfall — 2 sticks + 1 fiber. The pile grows.');
  G.say('Mara gathers deadfall — 2 sticks. The pile grows.');
  check('M6 fiber say-line captured, fiber-less line not', ctx.fiberSays.length === sayBefore + 1 && /fiber/.test(ctx.fiberSays[ctx.fiberSays.length - 1].line), JSON.stringify(ctx.fiberSays.slice(sayBefore)));

  // ---- M7 (craft-day wraps: no fiber, no rows, no errors) ----
  console.log('\n=== M7: villager craft-day wraps install and record zero fiber ===');
  const evBefore7 = ctx.fiberEvents.length;
  let wRet = null, aRet = null, wThrew = false, aThrew = false;
  try { wRet = (typeof G.villagerWeaponCraftDay === 'function') ? G.villagerWeaponCraftDay() : null; } catch (e) { wThrew = true; }
  try { aRet = (typeof G.villagerArmorCraftDay === 'function') ? G.villagerArmorCraftDay() : null; } catch (e) { aThrew = true; }
  console.log('weaponCraftDay=' + wRet + ' armorCraftDay=' + aRet + ' threw=' + wThrew + '/' + aThrew);
  check('M7 craft-day calls run without throwing', !wThrew && !aThrew);
  check('M7 no fiber event rows from the craft days (no fiber recipes)', ctx.fiberEvents.length === evBefore7, JSON.stringify(ctx.fiberEvents.slice(evBefore7)));
  check('M7 wrap errors stayed empty', wrapErrors.length === 0, wrapErrors.join(' | '));

  installed.uninstall();
  console.log('\nFIBERSUPPLY ' + (failed ? 'FAIL ' + failed + ': ' + fails.join('; ') : 'PASS ' + passed + '/' + passed));
  process.exit(failed ? 1 : 0);
}

main().catch(function (e) { console.error(e.stack); process.exit(1); });
