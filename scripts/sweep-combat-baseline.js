#!/usr/bin/env node
// scripts/sweep-combat-baseline.js — lever 1 (combat & death share) baseline.
// Before/after on identical seeds via sweep-compare; combat extra metrics.
'use strict';
const { runComparison, printTable } = require('./sweep-compare');

const SEEDS = [7, 42, 99, 101, 202, 303, 404, 505, 606, 707, 808, 909, 1001, 1111, 1212, 1313];
const POLICIES = ['competent', 'winseek'];
const DAYS = 200;

function extraMetrics(Game, result) {
  const out = {};
  let s = {}, sch = {};
  try { s = Game.state || {}; sch = s.scholar || {}; } catch (e) {}
  out.trauma = Math.round(+(sch.trauma || 0));
  out.scholarHP = Math.round(+(sch.hp || 0));
  out.pop = ((s.village || {}).roster || []).length;
  try { out.ledgerW2 = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(2) | 0) : -1; }
  catch (e) { out.ledgerW2 = -1; }
  try { const w = sch.worn || sch.armor || sch.equipment || {}; out.armorPieces = Object.keys(w).length; }
  catch (e) { out.armorPieces = -1; }
  try { const ck = s.counterKnown || sch.counterKnown || {}; out.counters = Array.isArray(ck) ? ck.length : Object.keys(ck).length; }
  catch (e) { out.counters = -1; }
  try {
    const items = (sch.items || []).concat(((s.village || {}).stash || [])).concat((sch.pack || []));
    out.traps = items.filter(i => /trap/i.test(String((i && (i.id || i.name)) || ''))).length;
  } catch (e) { out.traps = -1; }
  // villager combat deaths vs player deaths
  let vilCombat = 0, playerCombat = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || '');
      if (/villager combat/.test(k)) vilCombat++;
      else if (/^(combat|monster)$/.test(k)) playerCombat++;
    }
  } catch (e) {}
  out.vilCombatDeaths = vilCombat;
  out.playerCombatDeaths = playerCombat;
  return out;
}

if (require.main === module) {
  (async () => {
    const report = await runComparison({
      label: process.env.LEVER || 'combat-baseline',
      seeds: SEEDS, policies: POLICIES, days: DAYS, extraMetrics,
    });
    printTable(report);
    const fs = require('fs');
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1)); console.log('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}
module.exports = { SEEDS, POLICIES, DAYS, extraMetrics };
