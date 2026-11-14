// reunion-balance-sweep-20261114.js — STAGE-1 SWEEP for sim-reunion-balance.
//
// Plays ONE Reunion wave (full-HP entry, geared party of 3, cap 1 live in
// this tree) with the Reunion def scaled in-process by env vars H (HP
// factor) and D (damage factor). Calibration only — the sweep picks the
// (H, D) point; the full-chain panel (panel-3 driver) is the judge.
// Per the frozen prereg: grid H in {0.5,0.6,0.7} x D in {0.6,0.7,0.8,1.0},
// 8 seeds per point (86009-86016), win share + rounds + damage dealt/taken
// + per-fighter damage split (scholar strikes measured directly around
// tbPlayerStrike; allies = total - scholar).
//
// Usage:
//   SEED=86009 H=0.6 D=0.7 OUT=evidence/2026-11-14/perseed-reunion-balance-sweep/0.6x0.7-s86009.json \
//     node scripts/reunion-balance-sweep-20261114.js
// Refuses to overwrite OUT. Exit 2 = fixture failure (wrong pool/party).
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');
const K = require(path.join(REPO, 'scripts', 'godpath', 'lib'));
const STAGE = require(path.join(REPO, 'scripts', 'stageally-instrument-20261106'));
const CAP = require(path.join(REPO, 'scripts', 'arena-capture-20261107'));

const SEED = parseInt(process.env.SEED || '86009', 10) || 86009;
const H = parseFloat(process.env.H || '1');
const D = parseFloat(process.env.D || '1');
if (!(H > 0 && H <= 1) || !(D > 0 && D <= 1)) {
  console.error('SWEEP STOP: H and D must be in (0,1]. Got H=' + H + ' D=' + D);
  process.exit(3);
}
const LOADOUT = {
  scholar: { melee: 'machete', torso: 'wardens_cloak' },
  allies: { ranged: 'hunting_spear', torso: 'bark_armor' },
};
const outFile = process.env.OUT || path.join(REPO, 'evidence', '2026-11-14',
  'perseed-reunion-balance-sweep', H + 'x' + D + '-s' + SEED + '.json');
if (fs.existsSync(outFile)) {
  console.error('SWEEP STOP: refusing to overwrite ' + outFile);
  process.exit(3);
}

function monsterOf(f) {
  try { return (f.fighters || []).find(function (x) { return x && x.kind === 'monster'; }) || null; } catch (e) { return null; }
}
function pFighter(Game) {
  try { return Game.tbFighter ? Game.tbFighter('p') : null; } catch (e) { return null; }
}
function liveMonsterKey(Game) {
  try {
    const ms = (Game.tbfight.fighters || []).filter(function (x) { return x && x.kind === 'monster' && x.alive !== false && !x.fled; });
    return ms.length ? (ms[0].key || 'm_0') : null;
  } catch (e) { return null; }
}
function packCounts(Game) {
  const out = {};
  try {
    for (const x of (Game.tbfight.fighters || [])) {
      if (!x || x.kind !== 'monster') continue;
      const id = (x.mdef && x.mdef.id) || x.monsterId || x.id || '?';
      out[id] = (out[id] || 0) + 1;
    }
  } catch (e) {}
  return out;
}
function partyNOf(Game) {
  try {
    return (Game.tbfight.fighters || []).filter(function (x) {
      return x && (x.kind === 'player' || x.kind === 'villager') && x.alive !== false && !x.fled;
    }).length;
  } catch (e) { return -1; }
}
function hpFrac(f) {
  try {
    if (!f || f.maxHp == null || !f.maxHp) return null;
    return Math.round((f.hp / f.maxHp) * 1000) / 1000;
  } catch (e) { return null; }
}

function playWave(Game, cap, deathsBefore) {
  // Play to WIN: strike the first live monster each player turn.
  // Damage attribution: measure the Reunion's HP immediately around each
  // scholar strike (tbPlayerStrike is synchronous); ally damage during
  // tbAdvance is total - scholar. Returns {res, steps, scholarDmg}.
  let steps = 0;
  let scholarDmg = 0;
  while (steps++ < 600) {
    if (cap.t.deaths.length > deathsBefore) return { res: 'died', steps: steps, scholarDmg: scholarDmg };
    const f = Game.tbfight;
    if (!f || f.over) return { res: 'ended', steps: steps, scholarDmg: scholarDmg };
    if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
      const key = liveMonsterKey(Game);
      if (key) {
        const m = monsterOf(Game.tbfight);
        const hpBefore = m ? m.hp : null;
        try { Game.tbPlayerStrike(key); } catch (e) {}
        const m2 = monsterOf(Game.tbfight);
        const hpAfter = m2 ? m2.hp : null;
        if (hpBefore != null && hpAfter != null && hpAfter < hpBefore) scholarDmg += (hpBefore - hpAfter);
      } else { try { Game.tbPlayerWait(); } catch (e) {} }
      if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
        try { Game.tbAdvance(); } catch (e) {}
      }
    } else {
      try { Game.tbAdvance(); } catch (e) { return { res: 'stuck', steps: steps, scholarDmg: scholarDmg }; }
    }
  }
  return { res: 'guard', steps: steps, scholarDmg: scholarDmg };
}

(async function () {
  const Game = await K.load({ seed: SEED, narration: true });

  // --- In-process scale (calibration only — the landed change scales at
  // spawn in startCombat; the def mutation here is contained to this
  // process and equivalent: HP rolls from mdef.hp, attacks resolve from
  // mdef.attacks via tbMoveKit). ---
  const rd = (Game.data.monsters || []).find(function (m) { return m.id === 'reunion'; });
  if (!rd) { console.error('SWEEP STOP: no reunion def'); process.exit(2); }
  const baseHp = rd.hp.slice();
  const baseAtk = rd.attack && rd.attack.damage ? rd.attack.damage.slice() : null;
  const baseAttacks = (rd.attacks || []).map(function (a) { return a.damage ? a.damage.slice() : null; });
  rd.hp = [Math.round(rd.hp[0] * H), Math.round(rd.hp[1] * H)];
  function scaleDmg(a) { if (a && a.damage) a.damage = [Math.round(a.damage[0] * D), Math.round(a.damage[1] * D)]; }
  scaleDmg(rd.attack);
  (rd.attacks || []).forEach(scaleDmg);

  Game.unlockedWave = function () { return 4; };
  const inst = STAGE.install(Game);
  const cap = CAP.install(Game);
  const t = inst.t;

  // --- Fixture: panel-3 fixture verbatim (geared scholar + 2 allies). ---
  K.newRun(Game);
  try { Game.state.scholar.day = 30; } catch (e) {}
  try {
    const s = Game.state.scholar;
    s.mx = 4; s.my = 4;
    if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
    const roster = ((Game.state.village || {}).roster || []).slice();
    const vpos = (Game.state.village || {}).positions || {};
    const spots = [{ mx: 3, my: 4 }, { mx: 5, my: 4 }];
    const chosen = roster.filter(function (rid) { return rid !== Game.villagerId; }).slice(0, 2);
    chosen.forEach(function (rid, i) { vpos[rid] = spots[i]; });
    Game.state.village.roster = chosen;
  } catch (e) {}

  function gearReadback(person) {
    const eq = (person && person.equipped) || {};
    const items = Game.data.items || [];
    let weaponBonus = 0, armorProtection = 0;
    Object.keys(eq).forEach(function (slot) {
      const raw = eq[slot];
      const id = (raw && (raw.itemId || raw.id)) || raw;
      if (!id) return;
      const def = items.find(function (i) { return i.id === id; });
      weaponBonus += (def && def.weapon && def.weapon.bonus) || 0;
      armorProtection += (def && def.armor && def.armor.protection) || 0;
    });
    return { weaponBonus: weaponBonus, armorProtection: armorProtection };
  }
  function equipScholar(itemId, slot) {
    const s = Game.state.scholar;
    s.inventory = s.inventory || [];
    s.inventory.push({ itemId: itemId, units: 1 });
    const idx = s.inventory.length - 1;
    Game.equip(idx, slot);
    if (!s.equipped || !s.equipped[slot] || (s.equipped[slot].itemId || s.equipped[slot].id) !== itemId) {
      console.error('SWEEP STOP: fixture failed — scholar equip ' + itemId + ' -> ' + slot + ' did not stick.');
      process.exit(2);
    }
  }
  function equipAlly(vid, itemId, slot) {
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
    if (!vp) { console.error('SWEEP STOP: fixture failed — ally ' + vid + ' has no person record.'); process.exit(2); }
    const def = (Game.data.items || []).find(function (i) { return i.id === itemId; });
    vp.equipped = vp.equipped || {};
    vp.equipped[slot] = { itemId: itemId, name: (def && def.name) || itemId };
    if (Array.isArray(vp.items)) vp.items.push({ itemId: itemId, units: 1 });
  }
  equipScholar(LOADOUT.scholar.melee, 'melee');
  equipScholar(LOADOUT.scholar.torso, 'torso');
  const scholarGear = gearReadback(Game.state.scholar);
  const allyGear = [];
  (Game.state.village.roster || []).forEach(function (rid) {
    equipAlly(rid, LOADOUT.allies.ranged, 'ranged');
    equipAlly(rid, LOADOUT.allies.torso, 'torso');
    allyGear.push({ id: rid, gear: gearReadback(Game.vpOf(rid)) });
  });
  const fixture = { loadout: LOADOUT, scholarGear: scholarGear, allyGear: allyGear,
    partyN: 3, scholarHp: (Game.state.scholar && Game.state.scholar.health) || null };

  const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : -1;
  let pool0 = [];
  try { pool0 = Game.monsterWavePool ? Game.monsterWavePool() : []; } catch (e) {}
  const poolOk = uw === 4 && pool0.length === 58 &&
    pool0.some(function (m) { return m.id === 'reunion'; }) &&
    !pool0.some(function (m) { return m.id === 'herald'; });
  if (!poolOk) {
    console.error('SWEEP STOP: fixture failed — unlockedWave()=' + uw + ' poolSize=' + pool0.length + ' (expected 4 / 58).');
    process.exit(2);
  }

  const deathsBefore = cap.t.deaths.length;
  const tbEndsBefore = cap.t.tbEnds.length;
  const rowsBefore = t.tbFights.length;
  try { Game.state.activeContest = { contestId: 'gauntlet' }; } catch (e) {}
  try { Game.state.arenaContest = { contestId: 'gauntlet', waves: ['reunion'], waveIdx: 0 }; } catch (e) {}

  K.fight(Game, 'reunion', { px: 5, py: 4, mx: 6, my: 4, party: true });
  const partyN = partyNOf(Game);
  if (partyN !== 3) {
    console.error('SWEEP STOP: fixture failed — partyN=' + partyN + ', expected 3.');
    process.exit(2);
  }
  const row = { seed: SEED, H: H, D: D, baseHp: baseHp, baseAtk: baseAtk, baseAttacks: baseAttacks,
    scaledHp: rd.hp.slice(), partyN: partyN, fixture: fixture,
    capConstant: (typeof Game.REUNION_ARENA_MIRROR_CAP === 'number') ? Game.REUNION_ARENA_MIRROR_CAP : null,
    reunionCountAtStart: (packCounts(Game).reunion || 0),
    scholarHpAtStart: hpFrac(pFighter(Game)) };
  if (!Game.tbfight || monsterOf(Game.tbfight) == null || (monsterOf(Game.tbfight).mdef || {}).id !== 'reunion') {
    row.outcome = 'no-arena';
  } else {
    const played = playWave(Game, cap, deathsBefore);
    row.outcome = played.res;
    row.steps = played.steps;
    row.scholarDmg = played.scholarDmg;
    const ends = cap.t.tbEnds.slice(tbEndsBefore);
    const endRec = ends.filter(function (e2) { return e2 && e2.arenaContest && e2.arenaContest.waveIdx === 0; }).pop();
    if (endRec) {
      const pf = (endRec.fighters || []).find(function (x) { return x && x.key === 'p'; });
      row.scholarHpAtEnd = hpFrac(pf);
      const mons = (endRec.fighters || []).filter(function (x) { return x && x.kind === 'monster'; });
      row.monstersAtEnd = mons.map(function (x) { return { id: x.monsterId, hpFrac: hpFrac(x), alive: x.alive, maxHp: x.maxHp, hp: x.hp }; });
      row.tbEndResult = endRec.result;
      const rm = row.monstersAtEnd[0];
      if (rm && rm.maxHp) {
        row.reunionDmgTaken = rm.maxHp - Math.max(0, rm.hp || 0);
        row.reunionDmgFrac = Math.round((row.reunionDmgTaken / rm.maxHp) * 1000) / 1000;
        row.allyDmg = Math.max(0, row.reunionDmgTaken - (row.scholarDmg || 0));
      }
      const allies = (endRec.fighters || []).filter(function (x) { return x && x.kind === 'villager'; });
      row.allyHpAtEnd = allies.map(function (x) { return { id: x.key, hpFrac: hpFrac(x), alive: x.alive }; });
    }
    const rows = t.tbFights.slice(rowsBefore).filter(function (r) { return r && r.mid === 'reunion'; });
    if (rows.length) { row.rowOutcome = rows[rows.length - 1].outcome; row.rounds = rows[rows.length - 1].rounds; }
    row.won = (row.tbEndResult === 'won');
  }
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}
  row.instrumentErrors = (t.instrumentErrors || []).concat(cap.t.instrumentErrors || []);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(row, null, 2));
  console.log('SWEEP seed=' + SEED + ' H=' + H + ' D=' + D + ' won=' + row.won +
    ' rounds=' + (row.rounds || '?') + ' dmgFrac=' + (row.reunionDmgFrac || '?') +
    ' scholarDmg=' + (row.scholarDmg || 0) + ' allyDmg=' + (row.allyDmg || 0) +
    ' instrumentErrors=' + row.instrumentErrors.length + ' -> ' + outFile);
  try { cap.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
