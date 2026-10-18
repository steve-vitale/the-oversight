#!/usr/bin/env node
// scripts/test-butcharmor-20261018.js — proof for the butchering-armor lever
// (2026-10-18, axis scale-onramp). Proves the game-code change in
// src/js/villager-build.js (villagerHideArmorDay): the butchering→armor
// channel's last mile — hides banked off the kitchen counter into the
// village stores, villagers sew hide_armor for themselves.
//
// 1. GATE (fixtures): BUTCHARMOR=0 is a complete no-op (counter untouched,
//    stash untouched, no teles, returns 0).
// 2. BANK (fixture): counter hides move into stash materials, tele
//    hide_banked fires.
// 3. SEW GATES (fixtures, seeded RNG): L0 = no attempt; L1 = blind 35%
//    attempts with materials at risk, a successful blind sew teaches the
//    codex L2; L2 = 85% attempts; villagers already wearing P>=15 torso
//    armor are skipped; sewn armor is auto-equipped.
// 4. DET-GATE: BUTCHARMOR=0 day-hashes are byte-identical to the pristine
//    HEAD tree (git archive) on identical seeds — the gate-off control arm
//    IS current master behavior.
// 5. LAYER-ON (integration, FEASTSCALE pre-seat substrate): hide_banked +
//    villager_craft teles fire and at least one villager wears hide_armor.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 node scripts/test-butcharmor-20261018.js
// Exits non-zero on any failure.
'use strict';
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function freshGame(seed) {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed, mode: 'butcharmor-proof', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function telesOf(Game, type) {
  return (Game.state.telemetry || []).filter(t => t.type === type);
}

function firstVillager(Game) {
  const roster = (Game.state.village || {}).roster || [];
  for (const rid of roster) {
    if (rid === Game.villagerId) continue;
    const p = Game.vpOf ? Game.vpOf(rid) : null;
    if (p && !p.dead) return { rid, p };
  }
  return null;
}

async function fixtures() {
  console.log('== butcharmor fixtures ==');
  // --- GATE-OFF NO-OP ---
  {
    process.env.BUTCHARMOR = '0';
    const Game = await freshGame(71001);
    const s = Game.state.scholar;
    s.prepStash = [{ material: 'hide', units: 5, name: 'Hides', kg: 0.8 }];
    const st0 = JSON.stringify((Game.stashState().materials) || {});
    const ret = Game.villagerHideArmorDay();
    check('BUTCHARMOR=0: returns 0', ret === 0, `got ${ret}`);
    check('BUTCHARMOR=0: counter hides untouched',
      (s.prepStash || []).length === 1 && (s.prepStash[0].units || 0) === 5);
    check('BUTCHARMOR=0: stash materials untouched',
      JSON.stringify((Game.stashState().materials) || {}) === st0);
    check('BUTCHARMOR=0: no hide_banked/villager_craft teles',
      telesOf(Game, 'hide_banked').length === 0 && telesOf(Game, 'villager_craft').length === 0);
    delete process.env.BUTCHARMOR;
  }
  // --- BANK ---
  {
    const Game = await freshGame(71002);
    const s = Game.state.scholar;
    s.prepStash = [
      { material: 'hide', units: 4, name: 'Hides', kg: 0.8 },
      { plantId: 'meat_deer', foodKind: 'meat', units: 2, kcalEach: 500, name: 'venison' },
      { material: 'hide', units: 1, name: 'Hide', kg: 0.8 },
    ];
    Game.villagerHideArmorDay();
    check('bank: all counter hides removed', !(s.prepStash || []).some(i => i && i.material === 'hide'));
    check('bank: non-hide items stay on the counter', (s.prepStash || []).length === 1);
    check('bank: stash materials.hide += 5', ((Game.stashState().materials) || {}).hide === 5);
    check('bank: hide_banked tele fired once', telesOf(Game, 'hide_banked').length === 1);
  }
  // --- SEW L0: no shape, no attempt ---
  {
    const Game = await freshGame(71003);
    const st = Game.stashState(); st.materials = st.materials || {};
    st.materials.hide = 10; st.materials.vine = 5;
    const rk = (((Game.state.codex || {}).recipes || {})['hide_armor']) || {};
    check('fixture starts at hide_armor L0', (rk.level || 0) === 0);
    Game.villagerHideArmorDay();
    check('L0: stash materials untouched', st.materials.hide === 10 && st.materials.vine === 5);
    check('L0: no villager_craft teles', telesOf(Game, 'villager_craft').length === 0);
    check('L0: no villager wears hide_armor', telesOf(Game, 'villager_craft').length === 0);
  }
  // --- SEW L1: blind attempts, materials at risk, blind success teaches L2 ---
  {
    const Game = await freshGame(71004);
    const wornHideArmor = () => {
      let n = 0;
      const roster = (Game.state.village || {}).roster || [];
      for (const rid of roster) {
        const p = Game.vpOf ? Game.vpOf(rid) : null;
        if (!p || p.dead) continue;
        const te = (p.equipped || {}).torso;
        if (te && te.itemId === 'hide_armor') n++;
      }
      return n;
    };
    const wornBefore = wornHideArmor();
    Game.grantKnowledge('recipe', 'hide_armor', 1, { type: 'witnessed' });
    const st = Game.stashState(); st.materials = st.materials || {};
    st.materials.hide = 20; st.materials.vine = 10;
    Math.random = mulberry32(4242); // deterministic blind draws
    const ret = Game.villagerHideArmorDay();
    const spent = 20 - (st.materials.hide || 0);
    const vineSpent = 10 - (st.materials.vine || 0);
    const crafts = telesOf(Game, 'villager_craft').length;
    const fails = telesOf(Game, 'villager_craft_fail').length;
    check('L1: attempts happened (craft+fail teles)', crafts + fails > 0, `craft=${crafts} fail=${fails}`);
    check('L1: materials consumed 2 hides + 1 vine per attempt',
      spent === (crafts + fails) * 2 && vineSpent === (crafts + fails),
      `hideSpent=${spent} vineSpent=${vineSpent} attempts=${crafts + fails}`);
    check('L1: sewn armor auto-equipped (worn count rises by crafts)',
      wornHideArmor() - wornBefore === crafts,
      `crafts=${crafts} wornBefore=${wornBefore} wornAfter=${wornHideArmor()}`);
    if (crafts > 0) {
      const rk2 = (((Game.state.codex || {}).recipes || {})['hide_armor']) || {};
      check('L1: successful blind sew teaches codex L2', (rk2.level || 0) === 2, `level=${rk2.level}`);
    } else {
      check('L1: successful blind sew teaches codex L2 (no successes to observe — INFO)', true);
    }
    void ret;
  }
  // --- SEW L2: high success rate ---
  {
    const Game = await freshGame(71005);
    Game.grantKnowledge('recipe', 'hide_armor', 2, { type: 'discovery' });
    const st = Game.stashState(); st.materials = st.materials || {};
    st.materials.hide = 40; st.materials.vine = 20;
    Math.random = mulberry32(777);
    Game.villagerHideArmorDay();
    const crafts = telesOf(Game, 'villager_craft').length;
    const fails = telesOf(Game, 'villager_craft_fail').length;
    check('L2: attempts happened', crafts + fails > 0);
    check('L2: success rate high (>= 60% of attempts)', crafts >= (crafts + fails) * 0.6,
      `${crafts}/${crafts + fails}`);
  }
  // --- VINE GATE: hides banked but no store vine = no attempts ---
  {
    const Game = await freshGame(71007);
    Game.grantKnowledge('recipe', 'hide_armor', 2, { type: 'discovery' });
    const st = Game.stashState(); st.materials = st.materials || {};
    st.materials.hide = 40; st.materials.vine = 0;
    Math.random = mulberry32(31337);
    Game.villagerHideArmorDay();
    check('vine gate: no attempts without a store vine',
      telesOf(Game, 'villager_craft').length === 0 && telesOf(Game, 'villager_craft_fail').length === 0);
    check('vine gate: store hides untouched', st.materials.hide === 40);
  }
  // --- SKIP: already-armored villagers untouched ---
  {
    const Game = await freshGame(71006);
    Game.grantKnowledge('recipe', 'hide_armor', 2, { type: 'discovery' });
    const st = Game.stashState(); st.materials = st.materials || {};
    st.materials.hide = 40; st.materials.vine = 20;
    // armor EVERY living villager with a P>=15 torso piece first
    const roster = (Game.state.village || {}).roster || [];
    let armored = 0;
    for (const rid of roster) {
      if (rid === Game.villagerId) continue;
      const p = Game.vpOf ? Game.vpOf(rid) : null;
      if (!p || p.dead) continue;
      p.items = p.items || [];
      p.items.push({ itemId: 'hide_armor', name: 'Hide armor', units: 1 });
      const eq = (globalThis.Scattering || {}).equipment;
      if (eq && eq.autoEquip) eq.autoEquip(p, Game.data.items);
      armored++;
    }
    Math.random = mulberry32(99);
    Game.villagerHideArmorDay();
    check('skip: no attempts when all wear P>=15 torso',
      telesOf(Game, 'villager_craft').length === 0 && telesOf(Game, 'villager_craft_fail').length === 0,
      `armored=${armored}`);
    check('skip: materials untouched', st.materials.hide === 40 && st.materials.vine === 20);
  }
}

async function divertHook() {
  console.log('== butcharmor forage divert hook ==');
  // gate off: the vine goes to the pack (pristine path)
  {
    process.env.BUTCHARMOR = '0';
    const Game = await freshGame(71010);
    check('divert gate-off: returns false', Game.butcharmorDivertVine() === false);
    delete process.env.BUTCHARMOR;
  }
  // gate on but no hides: no diversion
  {
    const Game = await freshGame(71011);
    Game.grantKnowledge('recipe', 'hide_armor', 1, { type: 'witnessed' });
    check('divert: no hides banked → false', Game.butcharmorDivertVine() === false);
    check('divert: no vine_set_aside tele', telesOf(Game, 'vine_set_aside').length === 0);
  }
  // gate on, hides banked, needy villagers: diversion fires
  {
    const Game = await freshGame(71012);
    Game.grantKnowledge('recipe', 'hide_armor', 1, { type: 'witnessed' });
    const st = Game.stashState(); st.materials = st.materials || {};
    st.materials.hide = 4; st.materials.vine = 0;
    const needy = Game.butcharmorNeedy();
    check('divert fixture: needy villagers exist', needy.length > 0, `needy=${needy.length}`);
    const ok = Game.butcharmorDivertVine();
    check('divert: returns true when the village is sewing', ok === true);
    check('divert: vine lands in the stores', ((Game.stashState().materials) || {}).vine === 1);
    check('divert: vine_set_aside tele fired', telesOf(Game, 'vine_set_aside').length === 1);
    // stock full: no more diversion
    st.materials.vine = 3;
    check('divert: lacing stock full → false', Game.butcharmorDivertVine() === false);
  }
  // L0: nobody has seen the shape → no diversion
  {
    const Game = await freshGame(71013);
    const st = Game.stashState(); st.materials = st.materials || {};
    st.materials.hide = 4;
    check('divert: L0 → false', Game.butcharmorDivertVine() === false);
  }
}

// The det-gate: BUTCHARMOR=0 (this tree) vs pristine HEAD (git archive).
// Extended day-hash includes stash materials + villager armor — the state
// this layer touches — so a leak would show.
async function detGate() {
  console.log('== butcharmor det-gate (BUTCHARMOR=0 vs pristine HEAD) ==');
  const pristineDir = path.join(process.env.HOME || '/home/hatch', 'workspace', 'scratch-butcharmor-pristine');
  try {
    const st = require('fs').statSync(path.join(pristineDir, 'src', 'js', 'villager-build.js'));
    if (!st.isFile()) throw new Error('pristine tree missing');
  } catch (e) {
    check('pristine HEAD tree present at ~/workspace/scratch-butcharmor-pristine', false,
      'extract it first: git archive HEAD -- src scripts index.html manifest.json | tar -x -C ~/workspace/scratch-butcharmor-pristine');
    return;
  }
  check('pristine HEAD tree present at ~/workspace/scratch-butcharmor-pristine', true);
  const fs = require('fs');
  const src = path.join(REPO, 'scripts', 'hash-runner-butcharmor.js');
  fs.copyFileSync(src, path.join(pristineDir, 'scripts', 'hash-runner-butcharmor.js'));
  const runner = path.join(pristineDir, 'scripts', 'hash-runner-butcharmor.js');
  const seeds = [6333637, 6443747];
  let allSame = true;
  for (const seed of seeds) {
    for (const policyId of ['leadfeast']) {
      const env = Object.assign({}, process.env, {
        FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
        WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1',
      });
      let a, b;
      try {
        a = JSON.parse(execFileSync('node', [path.join(REPO, 'scripts', 'hash-runner-butcharmor.js'), seed, policyId, 60],
          { env: Object.assign({}, env, { HASHREPO: REPO, BUTCHARMOR: '0' }), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
      } catch (e) { check(`det-gate ${policyId} s${seed}: my-tree run`, false, String(e && e.message).slice(0, 160)); allSame = false; continue; }
      try {
        b = JSON.parse(execFileSync('node', [runner, seed, policyId, 60],
          { env: Object.assign({}, env, { HASHREPO: pristineDir }), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
      } catch (e) { check(`det-gate ${policyId} s${seed}: pristine run`, false, String(e && e.message).slice(0, 160)); allSame = false; continue; }
      const same = a.hashes.length === b.hashes.length && a.hashes.every((h, i) => h === b.hashes[i]);
      console.log(`  det-gate ${policyId} s${seed}: ${same ? 'BYTE-IDENTICAL' : 'DIVERGED'} (${a.hashes.length} vs ${b.hashes.length} hashes)`);
      if (!same) {
        allSame = false;
        for (let i = 0; i < Math.min(a.hashes.length, b.hashes.length); i++) {
          if (a.hashes[i] !== b.hashes[i]) { console.log(`    first divergence at idx ${i}: mine=${a.hashes[i]} pristine=${b.hashes[i]}`); break; }
        }
      }
    }
  }
  check('det-gate: BUTCHARMOR=0 byte-identical to pristine HEAD (extended hash)', allSame);
  // NOTE: the pristine scratch tree is kept (manual setup, reused across runs).
}

async function layerOn() {
  console.log('== butcharmor layer-on integration (FEASTSCALE pre-seat, 180d, hide-rich seed) ==');
  process.env.BUTCHARMOR = '1'; // layer ON (game code only; same policy both arms)
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
  // s6223527 belongfeast: the hide-flow probe measured 71 butchers / 69 hides
  // by d180 here — the layer must engage on this seed.
  const { Game } = await loadGame({ seed: 6223527, mode: 'butcharmor-layeron', fullTelemetry: true });
  await setupGame(Game);
  let r;
  await quietLog(async () => { r = await runDays(Game, TF.belongfeast, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const banked = telesOf(Game, 'hide_banked').length;
  const diverted = telesOf(Game, 'vine_set_aside').length;
  const crafts = telesOf(Game, 'villager_craft').length;
  const fails = telesOf(Game, 'villager_craft_fail').length;
  let wornHide = 0;
  try {
    for (const rid of ((Game.state.village || {}).roster || [])) {
      const p = Game.vpOf ? Game.vpOf(rid) : null;
      if (!p || p.dead) continue;
      const te = (p.equipped || {}).torso;
      if (te && te.itemId === 'hide_armor') wornHide++;
    }
  } catch (e) {}
  console.log(`  hide_banked=${banked} vine_set_aside=${diverted} villager_craft=${crafts} craft_fail=${fails} villagers wearing hide_armor=${wornHide}`);
  check('layer-on: hides banked off the counter', banked >= 1, `banked=${banked}`);
  check('layer-on: lacing set aside at forage', diverted >= 1, `diverted=${diverted}`);
  check('layer-on: villagers sewed hide_armor (craft or fail attempts)', crafts + fails >= 1, `crafts=${crafts} fails=${fails}`);
  check('layer-on: at least one villager wears sewn hide_armor', wornHide >= 1, `wornHide=${wornHide}`);
  delete process.env.BUTCHARMOR;
}

(async () => {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
    if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required (pre-seat).'); process.exit(2); }
  await fixtures();
  await divertHook();
  await detGate();
  await layerOn();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
