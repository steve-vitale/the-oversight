#!/usr/bin/env node
// scripts/w5death-audit-20261014.js — WAVE-5 UNLOCKER DEATH AUDIT.
//
// Diagnostic instrument (sim-findings #96 measurement blank):
//   "New measured wall: wave-5 survival after unlock — 0/6 wave-5 unlockers
//    reached the table on the 15-seed confirm; the one table reach (s303)
//    died there in a 7-deep succession chain. Candidate next arm."
//
// Runs the plentycost road (leadfeast policy, FEASTSCALE_R13=1) and attributes
// EVERY wave-5 unlocker's fate: seed, unlock day, death day/cause/location,
// succession depth at death, table reach, what killed the table-reacher.
//
// INSTRUMENT ONLY — zero game-code changes, zero policy-code changes.
// The playerDeath wrap and the daily audit wrapper are READ-ONLY: no RNG
// consumed, no state mutated, no Date.now. Trajectory-identical by
// construction (verified by the proof script's non-invasiveness check
// against evidence/2026-10-14/plentycost-sweep.json on gate-clean seeds).
//
// KNOWN ENGINE NON-DETERMINISM (evidence/2026-10-14/sim-entropy-r26.md):
// fight-heavy seeds (s44, s88 named) diverge invocation-to-invocation because
// timestamp-based villager IDs leak into contestEngine _cxSeed. Attribution
// days on those seeds carry a noise budget; the village-story reading
// (what kills unlockers) is robust, exact day numbers are not.
//
// Seeds: 11/22/33/44/55/66/77/88 (the plentycost road) + 303 (table-reacher
// deep dive). Horizon: 180d death-aware (runDays stops on Game.over /
// village-dead tail), per WIN-PATH HORIZON 180 (Steve 2026-10-13).
//
// Canon: docs/CANON.md read; wave law per src/js/game.js unlockedWave():
// wave 5 = standing >= 200 AND wave-4 faced. Table = progState().tableWaiting.
// Succession = ledger.js playerDeath -> lineage() (the dead bearers' roll).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88, 303];
const DAYS = 180;
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-14', 'w5death-audit.json');
const END_REASONS = ['village-lost', 'over-other', 'survived', 'pop-zero', 'village-dead'];

function monsterWave(Game, monsterId) {
  try {
    const md = (Game.data.monsters || []).find(m => m.id === monsterId);
    return md ? (md.wave || null) : null;
  } catch (e) { return null; }
}

function epithetOf(Game, px, py) {
  try { return Game.nodeEpithet ? Game.nodeEpithet(px, py) : '?'; }
  catch (e) { return '?'; }
}

// runInstrumentedSeed(seed) -> attribution row. Exported for the proof script.
async function runInstrumentedSeed(seed) {
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'w5death-leadfeast' });
  await setupGame(Game);
  const audit = {
    playerDeaths: [], unlockDay5: null, standingAtUnlock: null,
    tableDay: null, tableEver: false, nationalDays: 0, maxUnlocked: 1,
  };

  // --- playerDeath wrap: capture the kill context AT THE SOURCE, then call
  // through. Read-only (no RNG, no mutation, no Date.now) — zero gameplay
  // effect. tbfight is still the killing fight here (playerDeath('combat')
  // fires from tbEndCheck before tbfight is nulled).
  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    const rec = { day: null, cause: cause || '?', who: '?', depth: null, loc: null, fight: null };
    try {
      const s = Game.state.scholar || {};
      rec.day = s.day || 0;
      try { rec.who = String(Game.villagerId || '?'); } catch (e) {}
      try {
        const f = Game.tbfight;
        if (f && f.fighters) {
          rec.fight = {
            over: !!f.over,
            monsters: f.fighters
              .filter(x => x && x.kind === 'monster')
              .map(x => ({
                name: x.monsterName || x.name || x.monsterId || '?',
                monsterId: x.monsterId || null,
                wave: monsterWave(Game, x.monsterId),
                alive: x.alive !== false,
                fled: !!x.fled,
              })),
          };
        }
      } catch (e) { rec.fightErr = String((e && e.message) || e).slice(0, 80); }
      try {
        const px = Game.map.px, py = Game.map.py;
        rec.loc = { node: [px, py], epithet: epithetOf(Game, px, py), insideHaven: !!s.insideHaven };
      } catch (e) { rec.loc = { epithet: '?' }; }
    } catch (e) { rec.capErr = String((e && e.message) || e).slice(0, 80); }
    audit.playerDeaths.push(rec);
    try { origPD(cause); }
    finally {
      // lineage() is the dead-bearers' roll; the push happens inside
      // playerDeath, so length AFTER the call = this death's depth.
      try { rec.depth = Game.lineage().length; }
      catch (e) { rec.depth = audit.playerDeaths.length; }
    }
  };

  // --- daily audit wrapper: unlock day, table day, national days.
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily ? leadfeast.daily.bind(leadfeast) : null;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const uw = G.unlockedWave ? G.unlockedWave() : 1;
      if (uw > audit.maxUnlocked) audit.maxUnlocked = uw;
      if (uw >= 5 && audit.unlockDay5 == null) {
        audit.unlockDay5 = day;
        try { audit.standingAtUnlock = (G.villageStanding() || {}).total | 0; } catch (e) {}
      }
      try {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting && !audit.tableEver) { audit.tableEver = true; audit.tableDay = day; }
      } catch (e) {}
      try {
        const r = G.scaleRank ? G.scaleRank() : 'village';
        if (r === 'national' || r === 'global') audit.nationalDays++;
      } catch (e) {}
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  const ms = Date.now() - t0;

  let lineageLen = -1, arc = 1, won = false, legendRecorded = false, lineageDeaths = -1;
  try { lineageLen = Game.lineage().length; } catch (e) {}
  try { lineageDeaths = Game.lineage().filter(e => e && ('cause' in e)).length; } catch (e) {}
  try { legendRecorded = !!((Game.progState ? Game.progState() : {}).legendRecorded); } catch (e) {}
  try { arc = (Game.progState ? Game.progState() : {}).arc || 1; } catch (e) {}
  try { won = !!Game.won; } catch (e) {}

  return {
    seed, days: result.days, endReason: result.endReason, ms,
    maxUnlocked: audit.maxUnlocked, unlockDay5: audit.unlockDay5,
    standingAtUnlock: audit.standingAtUnlock,
    tableEver: audit.tableEver, tableDay: audit.tableDay,
    nationalDays: audit.nationalDays, arc, won,
    lineageLen, lineageDeaths, legendRecorded, playerDeaths: audit.playerDeaths,
  };
}

function printAttribution(row) {
  const u = row.unlockDay5 != null ? `unlocked d${row.unlockDay5} (stand ${row.standingAtUnlock})` : 'never unlocked';
  console.log(`seed ${row.seed}: ${row.days}d ${row.endReason} wave≤${row.maxUnlocked} ${u} table=${row.tableEver ? 'd' + row.tableDay : 'no'} nat=${row.nationalDays}d arc=${row.arc} deaths=${row.playerDeaths.length}`);
  for (const d of row.playerDeaths) {
    const after = row.unlockDay5 != null && d.day >= row.unlockDay5 ? ' [post-unlock]' : '';
    const monsters = d.fight ? d.fight.monsters.map(m => `${m.name}(w${m.wave == null ? '?' : m.wave}${m.alive ? '' : ',dead'}${m.fled ? ',fled' : ''})`).join(', ') : 'no-fight';
    const loc = d.loc ? `${d.loc.epithet}${d.loc.insideHaven ? ' @Haven' : ''}` : '?';
    console.log(`    depth ${d.depth} d${d.day} ${d.cause} — ${loc} — vs ${monsters}${after}`);
  }
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    console.log(`[w5death] seed ${seed} ...`);
    const row = await runInstrumentedSeed(seed);
    rows.push(row);
    printAttribution(row);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString(), seeds: SEEDS, days: DAYS, policy: 'leadfeast+FEASTSCALE_R13=1', rows }, null, 1));
  console.log(`wrote ${OUT}`);

  // wall numbers for the run report
  const nat = rows.filter(r => r.nationalDays > 0).length;
  const tab = rows.filter(r => r.tableEver).length;
  const won = rows.filter(r => r.won).length;
  const w4 = rows.filter(r => r.maxUnlocked >= 4).length;
  const w5 = rows.filter(r => r.maxUnlocked >= 5).length;
  const med = rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)];
  console.log(`WALL: national ${nat}/${rows.length} table ${tab}/${rows.length} won ${won}/${rows.length} wave4 ${w4}/${rows.length} wave5 ${w5}/${rows.length} medianDays ${med}`);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
module.exports = { runInstrumentedSeed, SEEDS, DAYS, END_REASONS };
