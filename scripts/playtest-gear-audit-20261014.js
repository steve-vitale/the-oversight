#!/usr/bin/env node
// playtest-gear-audit-20261014.js — Endgame gear audit (Steve 2026-10-14).
// "Sounds like gear at that stage between weapons and armor isn't coming into play."
//
// Runs REAL engine tactical fights with different gear loadouts, 8+ seeds each.
// Pre-registered expectations (from theoretical curves):
//   A: wave-3 gavel — t2+P40 LOSES, t3+P64 WINS (gear flips wave 3)
//   B: wave-4 eater — t4+P64 LOSES (gear does NOT flip wave 4)
//   C: wave-4 eater — t4+P138 god-armor, marginal (theory: 8.7 vs 10.0 hits -> WIN barely)
//   D: wave-5 spoiler — t4+P138 LOSES (nothing flips wave 5)
//   E: wave-4 eater — t4+P64 + adrenaline_control (1.3x, real ability) —
//      tests whether ONE ability mult moves the needle vs pure gear
//
// Armor is set via test-only Game.armorBonus override (the real curve+pierce
// formula still runs in tbDamage; only the input P is fixed). Weapons are
// real items equipped in the melee slot.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ---- seeded RNG BEFORE eval (modules capture Math.random at load) ----
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '7', 10);
const rng = mulberry32(SEED);
Math.random = rng;
const resetRng = () => { Math.random = mulberry32(SEED); };

// ---- full module list in index.html order, minus DOM-only ----
const SKIP = new Set(['src/js/app.js', 'src/js/sprites.js', 'src/js/tile-scenes.js',
  'src/js/move-anim.js', 'src/js/drama.js']);
const MODULES = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .matchAll(/src\/js\/[^"]+\.js/g)].map(m => m[0]).filter(f => !SKIP.has(f));
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
for (const f of MODULES) {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL', f, e.message); process.exit(1); }
}
delete global.window;
const Game = globalThis.Scattering.Game;

// silence narration for speed
const _say = Game.say.bind(Game);
Game.say = () => {};
Game.sysSay = Game.sysSay || (() => {});
const _sysSay = (Game.sysSay || (() => {})).bind(Game);
Game.sysSay = () => {};

function flatGrid() { return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 'grass')); }

async function freshFight(mid, weaponId, armorP, seed, extra) {
  resetRng();
  // reseed with per-fight seed for variety across the 8 seeds
  Math.random = mulberry32(SEED * 100003 + seed * 7919);
  Game.genDetail = () => flatGrid();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.health = 100;
  s.mx = 4; s.my = 4;
  s.equipped = { melee: { itemId: weaponId } };
  // grant ammo for ranged test weapons
  if (weaponId === 'searcaster') {
    s.inventory = s.inventory || [];
    s.inventory.push({ material: 'fusion_cell', units: 99, name: 'Fusion cell' });
  }
  // test-only armor input: the real tbDamage curve+pierce still runs
  Game.armorBonus = () => armorP;
  if (extra && extra.ability) {
    s.abilities = s.abilities || [];
    s.abilities.push({ id: extra.ability, name: extra.ability, level: 1, xp: 0 });
  }
  // suppress signature-mechanic interference for the pure stat-check suites;
  // suite F tests mechanics separately
  Game.startCombat(mid);
  if (!Game.tbfight) {
    console.error(`FIGHT NOT STARTED for ${mid}: roster=${(Game.generatedRoster||[]).length} scholar=${!!Game.state.scholar} departed=${Game.state.scholar && Game.state.scholar.mx}`);
  }
  return Game.tbfight;
}

function fightOver() { return !Game.tbfight || Game.tbfight.over; }
function P() { return Game.tbfight ? Game.tbFighter('p') : null; }
function foe() {
  if (!Game.tbfight) return null;
  return (Game.tbfight.fighters || []).filter(x => (x.kind === 'monster' || x.kind === 'hostile') && x.alive && !x.fled)[0];
}
// TURN HYGIENE: strike -> endTurn (only if still player turn); wait -> nothing (auto-advances)
function endTurn() {
  if (fightOver()) return;
  if (!Game.tbIsPlayerTurn()) return;
  const p = P(); if (!p) return; p.moveLeft = 0; p.acted = true;
  Game.tbAfterPlayerAction();
}
function playerAct(policy) {
  if (fightOver() || !Game.tbIsPlayerTurn()) return;
  const p = P(), t = foe();
  if (!p) return;
  // CONTROL POLICY: open with control abilities, then strike
  if (policy === 'control' && p._ctrlTurn === undefined) p._ctrlTurn = 0;
  if (policy === 'control') {
    const used = [];
    const tryAbil = (aid, action) => {
      try {
        if (Game.hasAbility && Game.hasAbility(aid) && !used.includes(aid)) {
          const r = Game.activateAbility(aid + '.' + action, t ? t.key : null);
          if (r !== false && r !== null && r !== undefined) { used.push(aid); return true; }
        }
      } catch (e) {}
      return false;
    };
    if (p._ctrlTurn === 0) {
      if (tryAbil('fear_aura', 'loom')) { p._ctrlTurn++; endTurn(); return; }
    }
    if (p._ctrlTurn <= 1) {
      if (tryAbil('pocket_sand', 'throw_sand')) { p._ctrlTurn++; endTurn(); return; }
    }
    if (p._ctrlTurn <= 2) {
      if (tryAbil('scream_cheese', 'scream')) { p._ctrlTurn++; endTurn(); return; }
    }
    p._ctrlTurn++;
  }
  if (!t) { endTurn(); return; }
  const w0 = Game.equippedWeapon();
  const d = Math.max(Math.abs(p.mx - t.mx), Math.abs(p.my - t.my));
  // KITING: searcaster range 8 — shoot and retreat
  if (policy === 'kite') {
    const w = w0;
    const range = w.range || 1;
    if (d <= range) {
      // in range: back off if monster is close, else shoot
      if (d <= 3) {
        const ax = Math.min(7, Math.max(1, p.mx - Math.sign(t.mx - p.mx)));
        const ay = Math.min(7, Math.max(1, p.my - Math.sign(t.my - p.my)));
        try { Game.tbPlayerMove(ax, ay); } catch (e) {}
        endTurn(); return;
      }
      Game.tbPlayerStrike(t.key);
      endTurn(); return;
    }
    // out of range: shouldn't happen with range 8, but close in
    const dx = Math.sign(t.mx - p.mx), dy = Math.sign(t.my - p.my);
    const nx = Math.min(7, Math.max(1, p.mx + dx)), ny = Math.min(7, Math.max(1, p.my + dy));
    try { Game.tbPlayerMove(nx, ny); } catch (e) {}
    endTurn(); return;
  }
  const w = w0;
  if (d <= (w.range || 1)) {
    Game.tbPlayerStrike(t.key);
    endTurn();
  } else {
    // step closer (interior tiles only)
    const dx = Math.sign(t.mx - p.mx), dy = Math.sign(t.my - p.my);
    const nx = Math.min(7, Math.max(1, p.mx + dx)), ny = Math.min(7, Math.max(1, p.my + dy));
    try { Game.tbPlayerMove(nx, ny); } catch (e) {}
    endTurn();
  }
}

function fightOne(mid, weaponId, armorP, seed, extra) {
  return (async () => {
    await freshFight(mid, weaponId, armorP, seed, extra);
    const policy = (extra && extra.policy) || 'strike';
    // instrument ability uses (shared across fights; cleared per suite)
    if (!Game._gearAbilUses) Game._gearAbilUses = {};
    const abilUses = Game._gearAbilUses;
    const _act = Game.activateAbility ? Game.activateAbility.bind(Game) : null;
    if (_act && !Game._gearAuditWrapped) {
      Game._gearAuditWrapped = true;
      Game.activateAbility = function (key, tgt) {
        const aid = String(key).split('.')[0];
        Game._gearAbilUses[aid] = (Game._gearAbilUses[aid] || 0) + 1;
        return _act(key, tgt);
      };
    }
    // grant control abilities for the control policy
    if (policy === 'control') {
      const s = Game.state.scholar;
      for (const aid of ['fear_aura', 'pocket_sand', 'scream_cheese']) {
        if (!s.abilities.some(a => a.id === aid)) s.abilities.push({ id: aid, name: aid, level: 1, xp: 0 });
      }
    }
    let rounds = 0, pdmg = 0, mdmg = 0;
    const m0 = foe() ? foe().hp : 0;
    let lastMhp = m0, lastPhp = 100;
    while (!fightOver() && rounds < 60) {
      rounds++;
      playerAct(policy);
      // safety: if it's somehow still player turn with no progress, wait
      if (!fightOver() && Game.tbIsPlayerTurn()) { try { Game.tbPlayerWait(); } catch (e) { endTurn(); } }
      const t = foe();
      const p = P();
      const php = p ? p.hp : 0;
      if (t) {
        if (t.hp < lastMhp) pdmg += (lastMhp - t.hp);
        lastMhp = t.hp;
      } else {
        pdmg += lastMhp; lastMhp = 0;
      }
      if (php < lastPhp) mdmg += (lastPhp - php);
      lastPhp = php;
      if (fightOver()) break;
    }
    const f = Game.tbfight;
    let outcome = 'timeout';
    const pEnd = P();
    if (!f) {
      // engine cleared the fight: infer from last known state
      outcome = lastPhp > 0 && lastMhp <= 0 ? 'win' : (lastPhp <= 0 ? 'die' : 'fled-or-stall');
    } else if (f.over) {
      const pAlive = P() && P().hp > 0;
      const foeAlive = foe() && foe().alive;
      if (pAlive && !foeAlive) outcome = 'win';
      else if (!pAlive) outcome = 'die';
      else if (pAlive && foeAlive) outcome = 'fled-or-stall';
    } else if (P() && P().hp <= 0) outcome = 'die';
    return { outcome, rounds, pdmg: Math.round(pdmg), mdmg: Math.round(mdmg), abilUses };
  })();
}

async function suite(name, mid, weaponId, armorP, seeds, extra, expect) {
  Game._gearAbilUses = {};
  const res = [];
  for (let s = 0; s < seeds; s++) res.push(await fightOne(mid, weaponId, armorP, s, extra));
  const wins = res.filter(r => r.outcome === 'win').length;
  const dies = res.filter(r => r.outcome === 'die').length;
  const other = res.length - wins - dies;
  const avgR = (res.reduce((a, r) => a + r.rounds, 0) / res.length).toFixed(1);
  const avgP = Math.round(res.reduce((a, r) => a + r.pdmg, 0) / res.length);
  const avgM = Math.round(res.reduce((a, r) => a + r.mdmg, 0) / res.length);
  const abil = Game._gearAbilUses || {};
  const abilStr = Object.keys(abil).length ? ` | abil ${JSON.stringify(abil)}` : '';
  // per-fight abilUses no longer used (shared object instead)
  const ok = expect ? (expect === 'WIN' ? wins >= seeds * 0.75 : dies >= seeds * 0.75) : null;
  console.log(`${ok === null ? '  ' : ok ? 'OK' : 'FAIL'} ${name}: win ${wins}/${seeds} die ${dies}/${seeds} other ${other} | avg rounds ${avgR} | dealt ${avgP} took ${avgM}${abilStr}${expect ? ` (expect ${expect})` : ''}`);
  return { name, wins, dies, other, avgR, avgP, avgM, expect, ok };
}

(async () => {
  await Game.init();
  const SEEDS = 8;
  console.log(`seed base ${SEED}, ${SEEDS} seeds per suite\n`);
  const out = [];
  // A: wave 3 gear flip
  out.push(await suite('A1 w3 gavel t2+P40', 'gavel', 'hardlight_knife', 40, SEEDS, null, 'LOSE'));
  out.push(await suite('A2 w3 gavel t3+P64', 'gavel', 'phase_blade', 64, SEEDS, null, 'WIN'));
  // B/C: wave 4 — gear does not flip
  out.push(await suite('B w4 eater t4+P64', 'eater', 'searcaster', 64, SEEDS, null, 'LOSE'));
  out.push(await suite('C w4 eater t4+P138', 'eater', 'searcaster', 138, SEEDS, null, 'WIN'));
  // D: wave 5 — nothing flips
  out.push(await suite('D w5 spoiler t4+P138', 'spoiler', 'searcaster', 138, SEEDS, null, 'LOSE'));
  // E: one real ability mult on top of t4
  out.push(await suite('E w4 eater t4+P64+adrenaline', 'eater', 'searcaster', 64, SEEDS, { ability: 'adrenaline_control' }, null));
  // G: control policy — do the 3 control abilities flip what gear can't?
  out.push(await suite('G w4 eater t4+P64+CONTROL', 'eater', 'searcaster', 64, SEEDS, { policy: 'control' }, null));
  // H: wave 3 with control — does control also flip wave 3?
  out.push(await suite('H w3 gavel t2+P40+CONTROL', 'gavel', 'hardlight_knife', 40, SEEDS, { policy: 'control' }, null));
  // I: kiting — searcaster range 8, shoot and retreat vs wave 4
  out.push(await suite('I w4 eater searcaster+P64+KITE', 'eater', 'searcaster', 64, SEEDS, { policy: 'kite' }, null));
  out.push(await suite('F w1 bulldozer bare', 'bulldozer', null, 0, SEEDS, null, null));
  out.push(await suite('F2 w1 bulldozer t1+P20', 'bulldozer', 'stone_knife', 20, SEEDS, null, 'WIN'));

  const fails = out.filter(o => o.ok === false);
  console.log(`\n${out.length} suites, ${fails.length} expectation mismatches`);
  if (fails.length) { console.log('MISMATCHES:', fails.map(f => f.name).join(', ')); process.exit(1); }
})().catch(e => { console.error('HARNESS CRASH', e); process.exit(2); });
