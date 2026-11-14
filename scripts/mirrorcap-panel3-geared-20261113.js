// mirrorcap-panel3-geared-20261113.js — PANEL 3 (geared scholar) for sim-mirrorcap.
//
// Panel 2 (2026-11-13) was NO-GO on M2 with a FRESH UN-GEARED scholar:
// one Reunion hits 52-60/swing vs 100 HP no gear; the armed party dealt at
// most ~4% of one Reunion's HP. Steve's ruling (2026-11-13): test a geared
// scholar first — every test must reflect the average gear a player would
// actually have when they reach that content. This driver keeps panel 2's
// mechanics EXACTLY (waves 1-2 drawn naturally, wave 3 pinned Reunion,
// strike-first-live-monster driver, one process per seed) and changes ONLY
// the fixture: a GEARED scholar + party of 2 allies (party of 3 total —
// the fight-play census: 84% of fights start with three people, solo
// wave-3/4 kills 0/11) carrying the measured-average Gauntlet loadout from
// the geared census (scripts/geared-census-20261113.js, seeds 53001-53008),
// written into the prereg BEFORE the panel ran. Abilities are NOT staged:
// the driver plays strike-only exactly as panels 1-2 did (see prereg
// Limitations); the census records what abilities a contestant holds.
//
// mirrorcap-panel-20261113.js — FOLLOW-UP panel for sim-mirrorcap (panel 2).
//
// Panel 1 (2026-11-07, scripts/mirrorcap-panel-20261107.js) forced the FULL
// wave list ['buffering','sunback','reunion'] — a wave-3 beast on wave 1 for
// a fresh scholar — so only 2/16 chains ever reached the Reunion wave and
// M2 (armed wins >= 1 Reunion wave) failed on n=2, not on the cap. This
// driver keeps panel 1's fixture EXACTLY except for one fix: ONLY wave 3
// is forced to Reunion; waves 1-2 are drawn naturally, the way _contestArena
// draws them (pool = monsterWavePool(), wave = unlockedWave() = 4, hot 0
// for wave 1 / hot 1 for wave 2; one Math.random pick per wave). The draw
// is replicated here, in the driver, because the fixture sets
// state.arenaContest directly (the panel-1 leg-1a pattern) instead of
// going through _contestArena; the draw consumes RNG exactly as
// _contestArena would (2 picks, same candidate sets), so both arms draw
// the same waves 1-2 on identical seeds and the ONLY difference between
// arms is still the cap. A wave-1/2 draw that happens to BE a Reunion is
// kept (drawn naturally, not redrawn) and recorded in chain.waves;
// the M2 sample is the wave-3 Reunion.
//
// Fixture (panel 1, unchanged): unlockedWave -> 4 (gate bypassed in-test
// only; live pool asserted 58 incl. Reunion, excl. Herald — FAILS LOUDLY
// otherwise), staged scholar fresh 100 HP, no gear, partyN 4 (scholar + 3
// allies at Haven centre, roster trimmed to those 3), Gauntlet spec
// {waves: 3}, fights played to win with the arena-b driver (strike the
// first live monster each player turn, tbAdvance otherwise); no HP is
// nerfed anywhere.
//
// Arms: run the SAME script with REPO pointing at the pristine baseline
// tree (no cap code) vs this worktree (cap live). One process per seed
// so both arms start from identical RNG state. Seeds 91202-91217
// (panel-2 prereg band; freshness check in the prereg).
//
// Usage:
//   SEED=92102 ARM=armed REPO=/path/to/tree OUT=evidence/2026-11-13/perseed-mirrorcap-panel3-geared/armed-s92102.json \
//     node scripts/mirrorcap-panel3-geared-20261113.js
// Refuses to overwrite OUT. Exit 2 = fixture failure (wrong pool/party).
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');
const K = require(path.join(REPO, 'scripts', 'godpath', 'lib'));
const STAGE = require(path.join(REPO, 'scripts', 'stageally-instrument-20261106'));
const CAP = require(path.join(REPO, 'scripts', 'arena-capture-20261107'));

const SEED = parseInt(process.env.SEED || '92102', 10) || 92102;
const ARM = process.env.ARM || 'armed';
// PANEL 2 FIXTURE FIX: only wave 3 is forced. Waves 1-2 are drawn below
// (drawWaves, the _contestArena pattern); 'reunion' is pinned at index 2.
const REUNION_WAVE_IDX = 2;
// GEARED FIXTURE — measured-average Gauntlet loadout from the geared census
// (see prereg for sources). Slots are item ids; 'melee'/'ranged' route by
// the isRangedWeapon rule (spears are ranged), 'torso' is armor.
// DERIVED FROM THE CENSUS (2026-11-13, seeds 53001-53008, 150d):
//   scholar: machete (melee, bonus 35) + wardens_cloak (torso, protection 25)
//     — day>=50 median wBonus 35, median armor 28; machete alone is the
//     median single weapon, wardens_cloak the mode torso (141/586 days).
//   allies (each): hunting_spear (ranged, bonus 30 — no ammo field, so no
//     quiver staging is needed) + bark_armor (torso, protection 15)
//     — ally median wBonus 30, mode torso bark_armor (146/362); the
//     Gauntlet-day party member Stan carries exactly stone_knife +
//     crude_bow + bark_armor, and hunting_spear alone (30) is the
//     ammo-free route to the same median 30.
//   Scholar HP 100 (median 100 at Gauntlet); party of 3 (scholar + 2).
const LOADOUT = {
  scholar: { melee: 'machete', torso: 'wardens_cloak' },
  allies: { ranged: 'hunting_spear', torso: 'bark_armor' },
};
const outFile = process.env.OUT || path.join(REPO, 'evidence', '2026-11-13', 'perseed-mirrorcap-panel3-geared', ARM + '-s' + SEED + '.json');
if (fs.existsSync(outFile)) { console.error('PANEL STOP: refusing to overwrite ' + outFile); process.exit(3); }

// drawWaves(Game, pool) — replicate _contestArena's beast picks for waves
// 1-2 (contests.js): wave i draws from pool.filter(m.wave <= wave + hot)
// with wave = unlockedWave() = 4, hot = (i > 0 ? 1 : 0); variant is not
// hardened and the fresh run has no rival dossier, so no other heat.
// One Math.random pick per wave, exactly as _contestArena consumes them.
// Wave 3 is pinned to 'reunion' by the fixture, not drawn.
function drawWaves(Game, pool) {
  const wave = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1;
  const waves = [];
  for (let i = 0; i < 3; i++) {
    if (i === REUNION_WAVE_IDX) { waves.push('reunion'); continue; }
    const hot = (i > 0 ? 1 : 0);
    const cands = pool.filter(function (m) { return (m.wave || 1) <= wave + hot; });
    const src = cands.length ? cands : pool;
    waves.push(src[Math.floor(Math.random() * src.length)].id);
  }
  return waves;
}

function monsterOf(f) {
  try { return (f.fighters || []).find(function (x) { return x && x.kind === 'monster'; }) || null; } catch (e) { return null; }
}
function midOf(f) {
  const m = monsterOf(f);
  return m ? ((m.mdef && m.mdef.id) || m.monsterId || m.id || null) : null;
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

function playWave(Game, cap, deathsBefore, mid) {
  // Play to WIN: strike the first live monster each player turn.
  // Returns {res, steps} with res in chained|ended|died|guard|stuck.
  let steps = 0;
  while (steps++ < 600) {
    if (cap.t.deaths.length > deathsBefore) return { res: 'died', steps: steps };
    const f = Game.tbfight;
    if (!f || f.over) return { res: 'ended', steps: steps };
    if (midOf(f) !== mid) return { res: 'chained', steps: steps };
    if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
      const key = liveMonsterKey(Game);
      if (key) { try { Game.tbPlayerStrike(key); } catch (e) {} }
      else { try { Game.tbPlayerWait(); } catch (e) {} }
      if (Game.tbfight && !Game.tbfight.over && midOf(Game.tbfight) === mid &&
          Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
        try { Game.tbAdvance(); } catch (e) {}
      }
    } else {
      try { Game.tbAdvance(); } catch (e) { return { res: 'stuck', steps: steps }; }
    }
  }
  return { res: 'guard', steps: steps };
}

(async function () {
  const Game = await K.load({ seed: SEED, narration: true });

  // --- Fixture: bypass ONLY the unlock gate (gauntlet-sweep pattern). ---
  Game.unlockedWave = function () { return 4; };
  const mdefs = {};
  try { for (const m of (Game.data.monsters || [])) mdefs[m.id] = m; } catch (e) {}

  const inst = STAGE.install(Game);
  const cap = CAP.install(Game);
  const t = inst.t;

  // Stage the chain: fresh run, scholar at Haven centre, exactly 3 allies
  // adjacent, roster trimmed to those 3 (gauntlet-sweep stageChain).
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


  // --- Geared fixture: equip scholar + allies with the census loadout. ---
  function gearReadback(person) {
    // Resolve equipped slots against Game.data.items (the same defs the
    // combat code reads): total weapon bonus + total armor protection.
    const eq = (person && person.equipped) || {};
    const items = Game.data.items || [];
    let weaponBonus = 0, armorProtection = 0;
    const slots = {};
    Object.keys(eq).forEach(function (slot) {
      const raw = eq[slot];
      const id = (raw && (raw.itemId || raw.id)) || raw;
      if (!id) return;
      const def = items.find(function (i) { return i.id === id; });
      slots[slot] = { itemId: String(id), weaponBonus: (def && def.weapon && def.weapon.bonus) || 0, armorProtection: (def && def.armor && def.armor.protection) || 0 };
      weaponBonus += slots[slot].weaponBonus;
      armorProtection += slots[slot].armorProtection;
    });
    return { weaponBonus: weaponBonus, armorProtection: armorProtection, slots: slots };
  }
  function equipScholar(itemId, slot) {
    // Real equip path: item into the scholar's inventory, then Game.equip.
    // NOTE: Game.equip returns null on SUCCESS as well as on refusal
    // (game.js equip ends `return null`), so the return value cannot
    // distinguish them — verify via the equipped map only.
    const s = Game.state.scholar;
    s.inventory = s.inventory || [];
    s.inventory.push({ itemId: itemId, units: 1 });
    const idx = s.inventory.length - 1;
    Game.equip(idx, slot);
    if (!s.equipped || !s.equipped[slot] || (s.equipped[slot].itemId || s.equipped[slot].id) !== itemId) {
      console.error('PANEL STOP: fixture failed — scholar equip ' + itemId + ' -> ' + slot + ' did not stick. Not measuring the wrong fixture.');
      process.exit(2);
    }
  }
  function equipAlly(vid, itemId, slot) {
    // Villagers carry person.items / person.equipped (villager-build.js);
    // the combat code reads vp.equipped. Stage the same shape Game.equip
    // writes for the scholar, and mirror the item into the person's items.
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
    if (!vp) {
      console.error('PANEL STOP: fixture failed — ally ' + vid + ' has no person record.');
      process.exit(2);
    }
    const def = (Game.data.items || []).find(function (i) { return i.id === itemId; });
    vp.equipped = vp.equipped || {};
    vp.equipped[slot] = { itemId: itemId, name: (def && def.name) || itemId };
    if (Array.isArray(vp.items)) vp.items.push({ itemId: itemId, units: 1 });
    const rb = gearReadback(vp);
    if (!vp.equipped[slot] || (vp.equipped[slot].itemId || vp.equipped[slot].id) !== itemId) {
      console.error('PANEL STOP: fixture failed — ally equip ' + itemId + ' -> ' + slot + ' did not stick.');
      process.exit(2);
    }
    return rb;
  }
  if (!LOADOUT.scholar || !LOADOUT.scholar.melee || !LOADOUT.scholar.torso ||
      !LOADOUT.allies || !LOADOUT.allies.ranged || !LOADOUT.allies.torso) {
    console.error('PANEL STOP: fixture failed — LOADOUT is not set (census has not reported). Refusing to run with an invented loadout.');
    process.exit(2);
  }
  // Scholar: melee weapon + torso armor via the real equip path.
  equipScholar(LOADOUT.scholar.melee, 'melee');
  equipScholar(LOADOUT.scholar.torso, 'torso');
  const scholarGear = gearReadback(Game.state.scholar);
  // Allies: same loadout each, via the person record.
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
    console.error('PANEL STOP: fixture failed — unlockedWave()=' + uw + ' poolSize=' + pool0.length +
      ' hasReunion=' + pool0.some(function (m) { return m.id === 'reunion'; }) +
      ' hasHerald=' + pool0.some(function (m) { return m.id === 'herald'; }) +
      ' (expected 4 / 58 / true / false). Not measuring the wrong pool.');
    process.exit(2);
  }

  const deathsBefore = cap.t.deaths.length;
  const tbEndsBefore = cap.t.tbEnds.length;
  const rowsBefore = t.tbFights.length;
  // PANEL 2: draw waves 1-2 naturally (_contestArena pattern), pin wave 3.
  const WAVES = drawWaves(Game, pool0);
  const chain = { seed: SEED, arm: ARM, waves: WAVES.slice(), partyN: null, perWave: [], outcome: null, deaths: [], fixture: fixture,
    capConstant: (typeof Game.REUNION_ARENA_MIRROR_CAP === 'number') ? Game.REUNION_ARENA_MIRROR_CAP : null };

  try { Game.state.activeContest = { contestId: 'gauntlet' }; } catch (e) {}
  try { Game.state.arenaContest = { contestId: 'gauntlet', waves: WAVES.slice(), waveIdx: 0 }; } catch (e) {}
  // Wave 1 starts through the real startCombat (K.fight); the chain to
  // waves 2-3 runs through the real tbEnd -> _contestArenaAfter hook.
  // No HP is nerfed anywhere — real fights, played to win.
  K.fight(Game, WAVES[0], { px: 5, py: 4, mx: 6, my: 4, party: true });
  chain.partyN = partyNOf(Game);
  if (chain.partyN !== 3) {
    console.error('PANEL STOP: fixture failed — partyN=' + chain.partyN + ', expected 3 (scholar + 2 allies). Not measuring the wrong party.');
    process.exit(2);
  }
  if (!Game.tbfight || midOf(Game.tbfight) !== WAVES[0]) {
    chain.outcome = 'no-arena';
  } else {
    for (let w = 0; w < 3; w++) {
      const mid = WAVES[w];
      const waveRec = { waveIdx: w, mid: mid, packAtStart: packCounts(Game),
        reunionCountAtStart: (packCounts(Game).reunion || 0),
        partyN: partyNOf(Game),
        scholarHpAtStart: hpFrac(pFighter(Game)) };
      if (!Game.tbfight || Game.tbfight.over || midOf(Game.tbfight) !== mid) {
        waveRec.outcome = 'not-live';
        chain.perWave.push(waveRec);
        break;
      }
      const played = playWave(Game, cap, deathsBefore, mid);
      waveRec.outcome = played.res;
      waveRec.steps = played.steps;
      const ends = cap.t.tbEnds.slice(tbEndsBefore);
      const endRec = ends.filter(function (e2) { return e2 && e2.arenaContest && e2.arenaContest.waveIdx === w; }).pop();
      if (endRec) {
        const pf = (endRec.fighters || []).find(function (x) { return x && x.key === 'p'; });
        waveRec.scholarHpAtEnd = hpFrac(pf);
        const mons = (endRec.fighters || []).filter(function (x) { return x && x.kind === 'monster'; });
        waveRec.monstersAtEnd = mons.map(function (x) { return { id: x.monsterId, hpFrac: hpFrac(x), alive: x.alive }; });
        waveRec.tbEndResult = endRec.result;
      }
      const rows = t.tbFights.slice(rowsBefore).filter(function (r) { return r && r.mid === mid; });
      if (rows.length) { waveRec.rowOutcome = rows[rows.length - 1].outcome; waveRec.rowRounds = rows[rows.length - 1].rounds; }
      chain.perWave.push(waveRec);
      if (played.res === 'died' || played.res === 'ended' || played.res === 'guard' || played.res === 'stuck') break;
    }
    const newDeaths = cap.t.deaths.slice(deathsBefore);
    chain.deaths = newDeaths.map(function (d) {
      return { scholarId: d.scholarId, causeArg: d.causeArg, waveIdx: (d.arenaContest || {}).waveIdx, day: d.day };
    });
    const w2 = chain.perWave[2];
    chain.outcome = chain.deaths.length ? 'died' :
      (w2 && (w2.outcome === 'chained' || (w2.outcome === 'ended' && w2.tbEndResult === 'won')) ? 'won' :
      (chain.perWave.some(function (x) { return x.outcome === 'ended' && x.tbEndResult === 'routed'; }) ? 'routed' :
      'other:' + JSON.stringify(chain.perWave.map(function (x) { return x.outcome + '/' + (x.tbEndResult || '?'); }))));
    chain.reunionWave = w2 ? { reached: w2.outcome !== 'not-live', outcome: w2.outcome,
      reunionCount: w2.reunionCountAtStart, partyN: w2.partyN,
      scholarHpAtStart: w2.scholarHpAtStart, scholarHpAtEnd: w2.scholarHpAtEnd || null,
      tbEndResult: w2.tbEndResult || null } : { reached: false };
  }
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  try { Game.state.arenaContest = null; } catch (e) {}
  try { Game.state.activeContest = null; } catch (e) {}
  chain.instrumentErrors = (t.instrumentErrors || []).concat(cap.t.instrumentErrors || []);
  // Sense-testing transcript: the last 40 narration lines, so a Reunion
  // wave can be read for meaning (does the single mirror still read as
  // the Reunion?) instead of judged from counts alone.
  try {
    chain.logTail = (Game.log || []).slice(-40).map(function (e) {
      if (e == null) return null;
      if (typeof e === 'string') return e;
      return String(e.text != null ? e.text : (e.msg != null ? e.msg : e));
    });
  } catch (e) { chain.logTail = []; }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(chain, null, 2));
  console.log('PANEL CHAIN seed=' + SEED + ' arm=' + ARM + ' outcome=' + chain.outcome +
    ' reunionWave=' + JSON.stringify(chain.reunionWave) +
    ' instrumentErrors=' + chain.instrumentErrors.length + ' -> ' + outFile);
  try { cap.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
