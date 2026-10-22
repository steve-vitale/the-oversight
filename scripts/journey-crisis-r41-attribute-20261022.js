#!/usr/bin/env node
// journey-crisis-r41-attribute-20261022.js — r41 follow-up: WHO produces the
// extra inflow during famine windows? Wraps stockPantry and attributes every
// deposit to its harvester vid (opts.harvestShares) or its name tag.
// Compares depositor mix in famine vs non-famine windows, per seed.
// Usage: SEED=101 node scripts/journey-crisis-r41-attribute-20261022.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const ESTABLISH = 20, WINDOW_DAYS = 70;
const FAMINE_PC_KCAL = 1500;

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); }
  catch (e) { return 0; }
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-attr-r41', fullTelemetry: true });
  await setupGame(Game);
  const playerVid = (() => { try { return String(Game.villagerId || ''); } catch (e) { return ''; } })();

  const deposits = []; // {day, kcal, depositor, tag}
  const _sp = Game.stockPantry;
  Game.stockPantry = function (kcal, name, opts) {
    try {
      let dep = 'unknown';
      const hs = (opts && opts.harvestShares) || null;
      if (hs) {
        if (typeof hs === 'string') dep = hs;
        else if (Array.isArray(hs) && hs.length) dep = String(hs[0].vid || hs[0]);
        else if (typeof hs === 'object') dep = String(hs.vid || Object.keys(hs)[0] || 'unknown');
      }
      deposits.push({ day: dayOf(Game), kcal: Math.round(kcal || 0), depositor: String(dep).slice(0, 16), tag: String(name || '').slice(0, 40) });
    } catch (e) {}
    return _sp ? _sp.apply(this, arguments) : undefined;
  };

  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { console.log(JSON.stringify({ seed: SEED, abort: 'establish-over' })); return; }

  const dayDep = {}; // day -> {player, npc, unknown}
  const famDays = new Set();
  const endDay = ESTABLISH + WINDOW_DAYS;
  while (dayOf(Game) < endDay && !Game.over) {
    const d0 = dayOf(Game);
    const p0 = pantryKcal(Game), pop0 = livingRoster(Game).length;
    await runDays(Game, oracleV2, { days: 1 });
    if (Game.over) break;
    const d = dayOf(Game);
    const pc = pop0 > 0 ? p0 / pop0 : 0;
    if (pop0 > 1 && pc < FAMINE_PC_KCAL) famDays.add(d);
    const agg = { player: 0, npc: 0, unknown: 0 };
    for (const dep of deposits) {
      if (dep.day !== d0) continue;
      const k = dep.kcal;
      if (dep.depositor === 'player' || dep.depositor === playerVid) agg.player += k;
      else if (dep.depositor === 'unknown') agg.unknown += k;
      else agg.npc += k;
    }
    dayDep[d] = { ...agg, pop: pop0, famine: famDays.has(d) };
    if (livingRoster(Game).length <= 1) break;
  }

  // depositor tag breakdown for famine vs non-famine
  const tagMix = { famine: {}, nonfamine: {} };
  for (const dep of deposits) {
    if (dep.day <= ESTABLISH) continue;
    const key = famDays.has(dep.day) ? 'famine' : 'nonfamine';
    const who = (dep.depositor === 'player' || dep.depositor === playerVid) ? 'PLAYER' : (dep.depositor === 'unknown' ? 'UNK' : 'NPC');
    const tk = `${who}:${dep.tag}`;
    tagMix[key][tk] = (tagMix[key][tk] || 0) + dep.kcal;
  }
  const top = (m) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log(JSON.stringify({
    seed: SEED, playerVid,
    famineDays: [...famDays].sort((a, b) => a - b),
    dayDep,
    tagMixFamineTop: top(tagMix.famine),
    tagMixNonfamineTop: top(tagMix.nonfamine),
  }));
  E(`[DONE] seed ${SEED} famineDays=${famDays.size}`);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
