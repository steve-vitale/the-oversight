#!/usr/bin/env node
// scripts/test-geartier-a.js — sim-geartier-a FIXTURE MATRIX.
// Before/after proof for the Tangle Line accessory + the abilities pass.
// Pattern: fieldability-a audit (sim-harness loadGame + setupGame, roster
// leader+ally, HP 100, armor kit, machete+bow+arrows, shout-join,
// mulberry rng, 5 seeds per cell, scholar day 120).
// Cells (argv selects, default all): control, snare, bird, broadcast,
// mending. Each cell vs influencer 850 and audit 1100.
// - snare cell: leader carries tangle_line; the script calls
//   villagerGearUp(false) before the fight and asserts the line is in
//   an acc slot afterwards (slot competition is honest: if it is not
//   equipped, the cell reports EQUIP-FAIL, never a silent control).
// - bird/broadcast/mending cells: leader holds that ONE magic ability
//   (npcAbilities), no snare. Named metric per prereg P4.
// Exit 0 on a completed matrix (measurement, not a gate); prints a
// JUDGE table for the prereg thresholds. --out <path> writes JSON.
// Usage: node scripts/test-geartier-a.js [cells...] [--out <path>]
'use strict';
const fs = require('fs');
const { loadGame, setupGame } = require('./sim-harness');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const KIT_ARMOR = ['hide_armor', 'skull_helm', 'canvas_pants', 'work_gloves', 'good_boots'];
const WEAPONS = ['machete', 'bow'];
const CELLS = {
  control: {},
  snare: { snare: true },
  bird: { abils: ['bird_strike'] },
  broadcast: { aid: true, abils: ['live_broadcast'] },
  'control-aid': { aid: true },
  mending: { aid: true, leaderHp: 55, abils: ['mending_hands'] },
  'control-aid-hurt': { aid: true, leaderHp: 55 },
};
const BEASTS = [
  { mid: 'influencer', hp: 850 },
  { mid: 'audit', hp: 1100 },
];

function mean(a) { return a.length ? a.reduce((t, x) => t + x, 0) / a.length : 0; }
function med(a) { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; }

async function fightCell(cfg, beast, rngSeed) {
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'geartier-a', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  try { G.state.scholar.day = 120; } catch (e) {}
  // Food tier: verbs refuse on starving/tight; top the pantry up to secure.
  try {
    const tier = G.villageFoodTier ? G.villageFoodTier() : 'secure';
    if (tier === 'tight' || tier === 'starving') {
      const v = G.state.village || {};
      // villageFoodDays reads pantry kcal vs daily need; pantryAdd is the
      // honest top-up path if present, else direct pantry kcal field.
      if (typeof G.pantryAdd === 'function') G.pantryAdd(200000, 'geartier fixture top-up');
      else if (v.pantry != null && typeof v.pantry === 'object') v.pantry.kcal = (v.pantry.kcal || 0) + 200000;
    }
  } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (roster.length < 2) throw new Error('fewer than 2 roster villagers');
  const leader = roster[0], ally = roster[1];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    if (!vp) throw new Error('no villager record ' + vid);
    vp.items = WEAPONS.slice().concat(KIT_ARMOR);
    vp.items.push({ itemId: 'arrow', units: 5, name: 'arrow' });
    if (vid === leader && cfg.snare) vp.items.push('tangle_line');
    vp.equipped = {};
    vp.equipped.melee = { itemId: 'machete', name: 'machete' };
    vp.equipped.ranged = { itemId: 'bow', name: 'bow' };
    if (vid === leader && cfg.snare) vp.equipped.acc1 = { itemId: 'tangle_line', name: 'Tangle Line' };
  }
  if (cfg.abils) {
    const v = G.state.village || (G.state.village = {});
    v.npcAbilities = v.npcAbilities || {};
    v.npcAbilities[leader] = cfg.abils.slice();
    v.npcAbilities[ally] = [];
  }
  // Hunger gate for verbs: a fed fighter pays (hunger 0 + kcal/25 < 80).
  try {
    const needs = (G.state.village || {}).needs || {};
    needs[leader] = Object.assign({}, needs[leader], { hunger: 0, fear: 0 });
    G.state.village.needs = needs;
  } catch (e) {}
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {};
  vv.health[leader] = cfg.leaderHp || 100; vv.health[ally] = 100;
  // Gear-up check: fieldFight re-runs gearUp(false) at entry, which
  // rebuilds equipped from items. Verify the line survives that rebuild.
  let equippedSnare = false, tierAfter = null;
  try {
    if (G.villagerGearUp) G.villagerGearUp(leader, false);
    const vp = (G.data.villagers || []).find(x => x.id === leader) ||
               (G.data.background_survivors || []).find(x => x.id === leader);
    const eq = (vp && vp.equipped) || {};
    equippedSnare = ['acc1', 'acc2', 'acc3', 'acc4'].some(s => {
      const e = eq[s]; return e && ((e.itemId || e.id) === 'tangle_line');
    });
    tierAfter = G.villageFoodTier ? G.villageFoodTier() : null;
  } catch (e) {}
  const def = (G.data.monsters || []).find(m => m && m.id === beast.mid);
  if (!def) throw new Error('monster def not found: ' + beast.mid);
  const entity = { id: def.id, hp: beast.hp, maxHp: beast.hp, tx: 2, ty: 2 };
  const rec = G.fieldFight(leader, def, entity, { allies: 1, allyVids: [ally], allyFromStart: !!cfg.aid, rng: mulberry32(rngSeed) });
  const snareLines = (rec.log || []).filter(l => /[Tt]angle|snare/i.test(l));
  return { cfg: null, mid: beast.mid, hp: beast.hp, outcome: rec.outcome,
    rounds: rec.rounds, mDealt: rec.mDealt, vTaken: rec.vTaken,
    allyDealt: rec.allyDealt, allyTaken: rec.allyTaken || null,
    allyHpLeft: rec.allyHpLeft, vHpLeft: rec.vHpLeft,
    dpr: rec.rounds ? rec.mDealt / rec.rounds : 0,
    takenPerRound: rec.rounds ? rec.vTaken / rec.rounds : 0,
    snareSet: !!rec.snareSet, snareDamage: rec.snareDamage || 0,
    snareTicks: rec.snareTicks || 0, equippedSnare,
    equipFail: !!(cfg.snare && !equippedSnare),
    tierAfter, verbLines: (rec.log || []).filter(l =>
      /Birds|whistles up the birds|LIVE|Mending|presses the wound|knits/i.test(l)).slice(0, 4),
    snareLines: snareLines.slice(0, 6),
    log: rec.log || [] };
}

async function main() {
  const args = process.argv.slice(2);
  let outPath = null;
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0) { outPath = args[outIdx + 1]; args.splice(outIdx, 2); }
  const wanted = args.length ? args.filter(a => CELLS[a]) : Object.keys(CELLS);
  if (!wanted.length) { console.error('no known cells requested'); process.exit(2); }
  const results = {};
  for (const name of wanted) {
    const cfg = CELLS[name];
    const cells = [];
    for (const beast of BEASTS) {
      for (let s = 0; s < 5; s++) {
        // PAIRED seeds: identical across cells (beast + index only), so
        // post-vs-pre and cell-vs-cell comparisons share RNG streams.
        const c = await fightCell(cfg, beast, 9100 + s * 131 + beast.hp);
        c.cfg = name;
        cells.push(c);
      }
    }
    const kills = cells.filter(c => c.outcome === 'vKill').length;
    const drives = cells.filter(c => c.outcome === 'mFlee').length;
    const line = { cell: name, n: cells.length, kills, drives,
      outcomes: cells.map(c => c.outcome).join('/'),
      mDealtMean: +mean(cells.map(c => c.mDealt)).toFixed(1),
      mDealtMed: +med(cells.map(c => c.mDealt)).toFixed(1),
      roundsMed: med(cells.map(c => c.rounds)),
      rounds: cells.map(c => c.rounds).join(','),
      dprMed: +med(cells.map(c => c.dpr)).toFixed(1),
      takenPerRoundMed: +med(cells.map(c => c.takenPerRound)).toFixed(1),
      allyDealtMean: +mean(cells.map(c => c.allyDealt)).toFixed(1),
      allyHpLeftMed: med(cells.map(c => c.allyHpLeft).filter(x => x != null)),
      snareSet: cells.filter(c => c.snareSet).length,
      snareDamageMean: +mean(cells.map(c => c.snareDamage)).toFixed(1),
      equipFail: cells.filter(c => c.equipFail).length,
      cells };
    results[name] = line;
    console.log(`${name}: n=${line.n} kills=${kills} drives=${drives} outcomes=${line.outcomes} mDealtMean=${line.mDealtMean} roundsMed=${line.roundsMed} rounds=${line.rounds} dprMed=${line.dprMed} taken/R=${line.takenPerRoundMed} allyDealtMean=${line.allyDealtMean} allyHpLeftMed=${line.allyHpLeftMed} snareSet=${line.snareSet}/10 snareDmgMean=${line.snareDamageMean} equipFail=${line.equipFail}`);
  }
  // Judge vs control (prereg P1/P4), when control is in the run.
  if (results.control) {
    const ctl = results.control;
    for (const name of wanted) {
      if (name === 'control') continue;
      const r = results[name];
      const dPct = ctl.mDealtMean ? ((r.mDealtMean - ctl.mDealtMean) / ctl.mDealtMean * 100) : 0;
      console.log(`JUDGE ${name} vs control: mDealt ${r.mDealtMean} vs ${ctl.mDealtMean} (${dPct >= 0 ? '+' : ''}${dPct.toFixed(0)}%), roundsMed ${r.roundsMed} vs ${ctl.roundsMed}, taken/R ${r.takenPerRoundMed} vs ${ctl.takenPerRoundMed}, allyDealt ${r.allyDealtMean} vs ${ctl.allyDealtMean}`);
    }
  }
  if (outPath) {
    // EPERM flap (container write denials, intermittent): retry, never fake.
    let lastErr = null;
    for (let i = 0; i < 6; i++) {
      try { fs.writeFileSync(outPath, JSON.stringify(results, null, 2)); lastErr = null; break; }
      catch (e) { lastErr = e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000); }
    }
    if (lastErr) throw lastErr;
  }
  // Full transcripts for sense-testing, to stdout (no file write, so the
  // EPERM flap cannot eat them): first cell of every requested cell.
  for (const name of wanted) {
    const t = results[name].cells[0];
    console.log(`--- TRANSCRIPT ${name} (first cell, ${t.mid} ${t.hp}) ---`);
    console.log(t.log.join('\n'));
  }
}
main().catch(e => { console.error('GEARTIER FIXTURE FAILED:', e && e.stack || e); process.exit(1); });
