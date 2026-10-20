#!/usr/bin/env node
// scripts/probe-spearfund-20261020.js — SPEARFUND probe (flesh-out loop arm
// sim-spearfund, axis scale-onramp, backlog #69 named next).
//
// buildfund r19 (KILLED AT PILOT) showed the gear recipe chain's first link
// never fires on the courtship road: 8/8 seeds x 180d never put a
// hunting_spear or hide_armor in the scholar's hands. Before building the
// acquisition layer, this probe measures which honest acquisition channels
// actually FIRE under the base courtship policy (leadcourt), so the layer
// drives the channel with the highest base rate instead of inventing one.
//
// Channels probed (daily census):
//   A. stash armory: hunting_spear deposited in stashState().weapons
//   B. villager carriers: any villager with hunting_spear equipped/carried/stashed
//   C. scholar inventory: hunting_spear in hand (and when first)
//   D. recipe level: scholar hunting_spear / hide_armor recipe level daily
//   E. contest grants: say-lines mentioning spear grants
//   F. loot: say-lines mentioning spear in corpse-loot context
//   G. hide_armor: hide_handling events (rawhide from stash/butcher)
//
// Usage:
//   node scripts/probe-spearfund-20261020.js
//   SEEDS="64001,64002" DAYS=60 node scripts/probe-spearfund-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function recipeLevel(Game, id) {
  try { return (((Game.state.codex || {}).recipes || {})[id] || {}).level || 0; } catch (e) { return 0; }
}
function stashWeapons(Game) {
  try {
    const st = Game.stashState ? Game.stashState() : null;
    return (st && st.weapons) || [];
  } catch (e) { return []; }
}
function scholarHasSpear(Game) {
  try {
    const inv = (Game.state.scholar || {}).inventory || [];
    return inv.some(i => i && (i.itemId === 'hunting_spear' || i.id === 'hunting_spear' || i.name === 'Hunting spear'));
  } catch (e) { return false; }
}
function villagerSpearCarriers(Game) {
  const out = [];
  try {
    const v = Game.state.village || {};
    for (const rid of (v.roster || [])) {
      const p = Game.getPerson ? Game.getPerson(rid) : null;
      if (!p || p.dead) continue;
      const eq = (p.equipped || {});
      const ids = [];
      for (const k of Object.keys(eq)) { const it = eq[k]; if (it && (it.itemId === 'hunting_spear' || it.id === 'hunting_spear')) ids.push('equipped:' + k); }
      for (const it of (p.items || [])) { const id = (it && (it.itemId || it.id)) || it; if (id === 'hunting_spear') ids.push('carried'); }
      for (const it of (p.stashed || [])) { const id = (it && (it.itemId || it.id)) || it; if (id === 'hunting_spear') ids.push('stashed'); }
      if (ids.length) out.push({ vid: rid, name: p.name || rid, where: ids.join(',') });
    }
  } catch (e) {}
  return out;
}

async function main() {
  const report = { seeds: SEEDS, days: DAYS, runs: [] };
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'spearfund-probe' });
    await setupGame(Game);
    const spearLines = [];
    const origSay = Game.say ? Game.say.bind(Game) : null;
    if (origSay) {
      Game.say = function (text, ...rest) {
        try { if (typeof text === 'string' && /spear/i.test(text)) spearLines.push({ d: gday(this), line: text.slice(0, 220) }); } catch (e) {}
        return origSay(text, ...rest);
      };
    }
    const first = { stashSpear: null, villagerSpear: null, scholarSpear: null, recipeL1: null, hideL1: null };
    const pileHistory = [];
    const policy = Object.assign({}, leadcourt, {
      daily(G, ctx) {
        try {
          const d = gday(G);
          const pile = stashWeapons(G).map(e => (e.itemId || e.id) + 'x' + (e.units || 1));
          if (d % 10 === 0) pileHistory.push({ d, pile });
          if (first.stashSpear == null && pile.some(p => p.startsWith('hunting_spear'))) first.stashSpear = d;
          const carriers = villagerSpearCarriers(G);
          if (first.villagerSpear == null && carriers.length) first.villagerSpear = { d, carriers };
          if (first.scholarSpear == null && scholarHasSpear(G)) first.scholarSpear = d;
          if (first.recipeL1 == null && recipeLevel(G, 'hunting_spear') >= 1) first.recipeL1 = d;
          if (first.hideL1 == null && recipeLevel(G, 'hide_armor') >= 1) first.hideL1 = d;
        } catch (e) {}
        if (leadcourt.daily) { try { leadcourt.daily(G, ctx); } catch (e) {} }
      },
    });
    const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 });
    report.runs.push({
      seed, days: result.days, endReason: result.endReason || null, first,
      finalSpearRecipe: recipeLevel(Game, 'hunting_spear'),
      finalHideRecipe: recipeLevel(Game, 'hide_armor'),
      finalPile: stashWeapons(Game).map(e => (e.itemId || e.id) + 'x' + (e.units || 1)),
      finalCarriers: villagerSpearCarriers(Game),
      scholarHadSpear: scholarHasSpear(Game),
      spearLines: spearLines.slice(0, 12),
      nSpearLines: spearLines.length,
      pileHistory,
    });
    console.log(`[s${seed}] d=${result.days} stashSpear@${first.stashSpear} vilSpear@${first.villagerSpear ? first.villagerSpear.d : null} scholarSpear@${first.scholarSpear} recipeL1@${first.recipeL1} hideL1@${first.hideL1} finalRecipe=${recipeLevel(Game, 'hunting_spear')}`);
  }
  const out = path.join(__dirname, '..', 'evidence', '2026-10-20', 'spearfund-probe.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 1));
  console.log('wrote', out);
}
main().catch(e => { console.error('PROBE FAIL', e); process.exit(2); });
