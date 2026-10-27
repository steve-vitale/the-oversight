#!/usr/bin/env node
// scripts/test-ammo-gap.js — Triage A4 (ammo pocketing + bolts + volley) proof.
// Modes:
//   node scripts/test-ammo-gap.js unit    — direct before/after checks, no long sim
//   node scripts/test-ammo-gap.js panel  — 8 seeds x 40 days, competent policy,
//                                          fieldFight census (baseline + after fix)
// Writes NOTHING into the repo; prints JSON-ish lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full src/js list
// in index.html order minus DOM-only files, window stub deleted before play).
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const AMMO_IDS = ['arrow', 'bolt', 'stone', 'fusion_cell', 'heartseeker_arrows'];
function ammoOf(items) {
  const out = {};
  for (const e of (items || [])) {
    const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (AMMO_IDS.includes(id)) out[id] = (out[id] || 0) + ((typeof e === 'string') ? 1 : (e.units || 1));
  }
  return out;
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
function rangedOf(Game, p) {
  try {
    const S = globalThis.Scattering.S || {};
    if (S.equipment && S.equipment.rangedWeaponOf) return S.equipment.rangedWeaponOf(p, Game.data.items);
  } catch (e) {}
  return (p.equipped || {}).ranged || null;
}
function weaponAmmoId(Game, rw) {
  if (!rw) return null;
  const id = rw.itemId || rw.id;
  const def = (Game.data.items || []).find(d => d.id === id);
  return (def && def.weapon && def.weapon.ammo) || null;
}
function stashStone(Game) {
  try { const st = Game.stashState ? Game.stashState() : null; return (st && st.materials && st.materials.stone) || 0; }
  catch (e) { return ((Game.state.village.stash || {}).materials || {}).stone || 0; }
}

async function unit() {
  const { Game } = await loadGame({ seed: 7, mode: 'ammo-gap-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const results = {};
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  console.log('fighter=' + vid + ' roster=' + roster.length);

  // --- A: departure gear-up with a bow, communal stone pile full, no arrows ---
  p.items = []; p.equipped = {};
  p.items.push({ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 0.6 });
  try { Game.stashState(); Game.state.village.stash.materials.stone = 200; } catch (e) {}
  const stoneBefore = stashStone(Game);
  try { Game.villagerGearUp(vid, true); } catch (e) { console.log('gearUp error: ' + e.message); }
  const rwA = rangedOf(Game, p);
  results.gearUpBow = { ranged: rwA ? (rwA.itemId || rwA.id) : null, ammo: ammoOf(p.items), stashStoneBefore: stoneBefore, stashStoneAfter: stashStone(Game) };
  console.log('GEARUP_BOW ' + JSON.stringify(results.gearUpBow));

  // --- B: same fighter, sling + communal stones ---
  p.items = [{ itemId: 'sling', name: 'Sling', units: 1, kg: 0.1 }]; p.equipped = {};
  try { Game.state.village.stash.materials.stone = 200; } catch (e) {}
  try { Game.villagerGearUp(vid, true); } catch (e) {}
  const rwB = rangedOf(Game, p);
  results.gearUpSling = { ranged: rwB ? (rwB.itemId || rwB.id) : null, ammo: ammoOf(p.items), stashStoneAfter: stashStone(Game) };
  console.log('GEARUP_SLING ' + JSON.stringify(results.gearUpSling));

  // --- C: volley engine check — bow + 5 arrows actually carried ---
  p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 0.6 },
    { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
  p.equipped = {};
  const mdef = (Game.data.monsters || []).find(m => m.id === 'bulldozer') || (Game.data.monsters || [])[0];
  let rec = null;
  try { rec = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  results.volleyWithAmmo = rec ? { outcome: rec.outcome, volley: rec.volley || null, ammoAfter: ammoOf(p.items) } : null;
  console.log('VOLLEY_WITH_AMMO ' + JSON.stringify(results.volleyWithAmmo));

  // --- D: crossbow + 0 bolts, communal stick/stone full — any bolt crafting? ---
  p.items = [{ itemId: 'crossbow', name: 'Crossbow', units: 1, kg: 1 }];
  p.equipped = {};
  try {
    Game.state.village.stash.materials.stone = 200;
    Game.state.village.stash.materials.stick = 200;
    Game.state.village.stash.materials.branch = 200;
  } catch (e) {}
  try { Game.villagerGearUp(vid, true); } catch (e) {}
  const rwD = rangedOf(Game, p);
  results.gearUpCrossbow = {
    ranged: rwD ? (rwD.itemId || rwD.id) : null,
    ammoId: weaponAmmoId(Game, rwD),
    ammo: ammoOf(p.items),
    hasNpcAmmoCraft: typeof Game.villagerAmmoCraftDay === 'function' || typeof Game.villagerAmmoCraft === 'function',
    hasNpcPocketAmmo: typeof Game.villagerPocketAmmo === 'function',
  };
  console.log('GEARUP_CROSSBOW ' + JSON.stringify(results.gearUpCrossbow));

  // --- E: crossbow volley with bolts carried proves the bolt leg of the engine ---
  p.items = [{ itemId: 'crossbow', name: 'Crossbow', units: 1, kg: 1 },
    { itemId: 'bolt', name: 'Crossbow bolt', units: 5, kg: 0.15 }];
  p.equipped = {};
  let rec2 = null;
  try { rec2 = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight2 error: ' + e.message); }
  results.volleyBolt = rec2 ? { outcome: rec2.outcome, volley: rec2.volley || null, ammoAfter: ammoOf(p.items) } : null;
  console.log('VOLLEY_BOLT ' + JSON.stringify(results.volleyBolt));

  const pocketed = (Object.values(results.gearUpBow.ammo).reduce((a, b) => a + b, 0) +
    Object.values(results.gearUpSling.ammo).reduce((a, b) => a + b, 0) +
    Object.values(results.gearUpCrossbow.ammo).reduce((a, b) => a + b, 0));
  console.log('SUMMARY pocketedByGearUp=' + pocketed +
    ' volleyShotsWithAmmo=' + ((results.volleyWithAmmo && results.volleyWithAmmo.volley && results.volleyWithAmmo.volley.shots) || 0) +
    ' volleyShotsBolt=' + ((results.volleyBolt && results.volleyBolt.volley && results.volleyBolt.volley.shots) || 0));
  return results;
}

function stashMats(Game) {
  try { const st = Game.stashState ? Game.stashState() : null; return (st && st.materials) || {}; }
  catch (e) { return ((Game.state.village.stash || {}).materials || {}); }
}

async function pocket() {
  const { Game } = await loadGame({ seed: 7, mode: 'ammo-gap-pocket' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  const fails = [];
  const check = (name, cond, detail) => console.log('  ' + (cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : '') + (cond ? '' : (fails.push(name), '')));
  const mdef = (Game.data.monsters || []).find(m => m.id === 'bulldozer') || (Game.data.monsters || [])[0];

  // A. sling: pocket 6 stones from the pile, ledger closes exactly.
  p.items = [{ itemId: 'sling', name: 'Sling', units: 1, kg: 0.1 }]; p.equipped = {}; p.stashed = [];
  try { const st = Game.stashState(); st.materials.stone = 200; } catch (e) {}
  Game.villagerGearUp(vid, true);
  const rA = Game.villagerPocketAmmo(vid);
  const mA = stashMats(Game);
  check('sling pockets 6 stones', (ammoOf(p.items).stone || 0) === 6, JSON.stringify(rA));
  check('sling pile ledger closes (200 -> 194)', mA.stone === 194, 'stone=' + mA.stone);
  // B. volley fires off the pocketed stones, spending exactly the shots.
  const recA = Game.fieldFight(vid, mdef, null, { allies: 1 });
  check('sling volley fires', recA && recA.volley && recA.volley.shots > 0, JSON.stringify(recA && recA.volley));
  check('volley spends exactly its shots', recA && (ammoOf(p.items).stone || 0) === 6 - recA.volley.shots, 'left=' + (ammoOf(p.items).stone || 0) + ' shots=' + recA.volley.shots);
  // C. bow with no stick in the pile: no craft, no consumption, no phantom arrows.
  p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 0.6 }]; p.equipped = {}; p.stashed = [];
  try { const st = Game.stashState(); st.materials.stone = 200; st.materials.stick = 0; st.materials.fiber = 0; } catch (e) {}
  Game.villagerGearUp(vid, true);
  const rC = Game.villagerPocketAmmo(vid);
  const mC = stashMats(Game);
  check('bow without stick crafts nothing', (ammoOf(p.items).arrow || 0) === 0 && rC.crafted === 0, JSON.stringify(rC));
  check('bow without stick consumes nothing', mC.stone === 200 && mC.stick === 0, JSON.stringify(mC));
  // D. crossbow with stick+stone: exactly one craft attempt, ledger exact either way.
  p.items = [{ itemId: 'crossbow', name: 'Crossbow', units: 1, kg: 1 }]; p.equipped = {}; p.stashed = [];
  try { const st = Game.stashState(); st.materials.stone = 200; st.materials.stick = 10; st.materials.fiber = 0; } catch (e) {}
  Game.villagerGearUp(vid, true);
  const rD = Game.villagerPocketAmmo(vid);
  const mD = stashMats(Game);
  check('crossbow attempts exactly one craft', rD.crafted === 1, JSON.stringify(rD));
  check('crossbow ledger exact (stick -2, stone -1)', mD.stick === 8 && mD.stone === 199, 'stick=' + mD.stick + ' stone=' + mD.stone);
  check('crossbow bolts are 0 or one batch of 5', (ammoOf(p.items).bolt || 0) === (rD.craftedOk ? 5 : 0), 'bolts=' + (ammoOf(p.items).bolt || 0) + ' ok=' + rD.craftedOk);
  // E. own stashed arrows move into the pack; pile untouched.
  p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 0.6 }];
  p.equipped = {}; p.stashed = [{ itemId: 'arrow', name: 'Arrow', units: 3, kg: 0.1 }];
  try { const st = Game.stashState(); st.materials.stone = 200; st.materials.stick = 0; } catch (e) {}
  Game.villagerGearUp(vid, true);
  const rE = Game.villagerPocketAmmo(vid);
  const mE = stashMats(Game);
  check('own stashed arrows pocketed', (ammoOf(p.items).arrow || 0) === 3, JSON.stringify(rE));
  check('own stash move leaves pile alone', mE.stone === 200, 'stone=' + mE.stone);
  // F. guard: fieldFight entry does NOT pocket (no mid-fight teleport).
  p.items = [{ itemId: 'sling', name: 'Sling', units: 1, kg: 0.1 }]; p.equipped = {}; p.stashed = [];
  try { Game.stashState().materials.stone = 200; } catch (e) {}
  const recF = Game.fieldFight(vid, mdef, null, { allies: 1 });
  check('fight entry pockets nothing (volley 0 shots)', recF && recF.volley && recF.volley.shots === 0, JSON.stringify(recF && recF.volley));
  check('fight entry leaves pile alone', stashMats(Game).stone === 200, 'stone=' + stashMats(Game).stone);
  // G. guard: player never pocketed by this path.
  const pileBefore = stashMats(Game).stone;
  const rG = Game.villagerPocketAmmo(Game.villagerId);
  check('player skipped', rG.pocketed === 0 && rG.crafted === 0 && stashMats(Game).stone === pileBefore, JSON.stringify(rG));
  console.log('POCKET_FAILS ' + fails.length + (fails.length ? ' ' + fails.join(',') : ''));
  if (fails.length) process.exitCode = 1;
}

async function panel() {
  const { competent } = require('./policies/competent');
  const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
  const days = 40;
  let tot = { fights: 0, rangedFights: 0, rangedWithAmmo: 0, volleyFires: 0, volleyShots: 0, pocketedAtGearUp: 0 };
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'ammo-gap-panel' });
    await quietLog(async () => { await setupGame(Game); });
    const census = { fights: 0, rangedFights: 0, rangedWithAmmo: 0, volleyFires: 0, volleyShots: 0, withAmmoByType: {}, volleyByType: {} };
    const orig = Game.fieldFight.bind(Game);
    Game.fieldFight = function (vid, mdef, m, opts) {
      const p = personOf(Game, vid);
      const before = ammoOf(p.items);
      const rw = rangedOf(Game, p);
      const ammoId = weaponAmmoId(Game, rw);
      const hadAmmo = ammoId ? (before[ammoId] || 0) : 0;
      let rec = null;
      try { rec = orig(vid, mdef, m, opts); } catch (e) { throw e; }
      census.fights++;
      if (rw) {
        census.rangedFights++;
        if (hadAmmo > 0) {
          census.rangedWithAmmo++;
          census.withAmmoByType[ammoId] = (census.withAmmoByType[ammoId] || 0) + 1;
        }
        if (rec && rec.volley && rec.volley.shots > 0) {
          census.volleyFires++; census.volleyShots += rec.volley.shots;
          census.volleyByType[ammoId] = (census.volleyByType[ammoId] || 0) + rec.volley.shots;
        }
      }
      return rec;
    };
    let res = null;
    try { res = await runDays(Game, competent, { days, manifest: { seed } }); } catch (e) { console.log('seed ' + seed + ' runDays error: ' + e.message); }
    // end-of-run pocket census: carried ammo across the whole roster
    let carried = 0;
    for (const vid of (Game.state.village.roster || [])) carried += Object.values(ammoOf(personOf(Game, vid).items)).reduce((a, b) => a + b, 0);
    const pile = stashStone(Game);
    const mats = stashMats(Game);
    console.log('SEED ' + seed + ' ' + JSON.stringify(census) + ' days=' + (res ? res.days : '?') + ' endReason=' + (res ? res.endReason : '?') + ' rosterCarriedAmmo=' + carried + ' pileStone=' + pile + ' pileStick=' + (mats.stick || 0) + ' pileFiber=' + (mats.fiber || 0));
    for (const k of Object.keys(tot)) tot[k] += census[k] || 0;
    tot.pocketedAtGearUp += 0; // gear-up pocketing is measured by the unit probe + carried census
  }
  console.log('PANEL_TOTAL ' + JSON.stringify(tot));
}

(async () => {
  const mode = process.argv[2] || 'unit';
  if (mode === 'panel') await panel();
  else if (mode === 'pocket') await pocket();
  else await unit();
})().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
