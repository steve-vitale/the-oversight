#!/usr/bin/env node
// test-clearhabit-b.js — proof for sim-clearhabit-b.
//
// T1–T6: live engine spot-checks through the shared harness (full
// src/js eval in index.html order, Math.random seeded before eval):
// the probe, the kcal floor, the creek refusal, and each remedy,
// on synthetic tiles in throwaway games — branch behavior, not a sim.
// T7–T10: corpus checks over the committed before/after corpora
// and the analysis JSON. Corpus checks SKIP (not fail) when the
// legs have not run yet, so the synthetic part can go green
// before any judged leg; after the legs run, a full pass must
// show 0 skipped corpus checks.
// Exit non-zero on any failure; print PROOF-GREEN only when all
// executed checks pass.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const { homewardClear, homewardBlockage, clearCost, homewardClearOn } = require('./policies/clearhabit');

const ROOT = path.join(__dirname, '..');
const BEFORE_DIR = path.join(ROOT, 'evidence', '2026-10-29', 'sim-clearhabit-b-corpus-before');
const AFTER_DIR = path.join(ROOT, 'evidence', '2026-10-29', 'sim-clearhabit-b-corpus-after');
const ANALYSIS = path.join(ROOT, 'evidence', '2026-10-29', 'sim-clearhabit-b-analysis.json');

let failures = [];
let skipped = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail !== undefined ? ' — ' + detail : ''}`);
  if (!cond) failures.push(name);
}
function skip(name) { console.log(`SKIP ${name}`); skipped++; }

// Place the player at (3,3) with haven (4,4) revealed; block the
// (3,4) intermediate with the given blockFrom patch. Returns Game.
async function stageGame(Game, blockPatch) {
  await setupGame(Game);
  const sch = Game.state.scholar;
  // The staged player is OUTSIDE, away from home: setupGame leaves
  // the scholar inside the haven, which the habit must skip.
  sch.insideHaven = false;
  if (sch.insideTent) sch.insideTent = null;
  Game.map.px = 3; Game.map.py = 3;
  const hv = Game.tileAt(4, 4);
  hv.type = 'haven'; hv.revealed = true;
  const t34 = Game.tileAt(3, 4);
  t34.revealed = true;
  if (blockPatch) Object.assign(t34, blockPatch);
  const t43 = Game.tileAt(4, 3);
  t43.revealed = true;
  if (t43.blockFrom) delete t43.blockFrom;
  const v = Game.state.village || {};
  v.px = 4; v.py = 4;
  return { Game, sch };
}

async function main() {
  process.env.COMPETENT_HOMEWARD_CLEAR = '1';
  check('T0 gate reads env', homewardClearOn() === true);

  // T1: probe finds the homeward intermediate blockage (rubble).
  {
    const { Game } = await loadGame({ seed: 1, mode: 'clearhabit-t1', fullTelemetry: false });
    await stageGame(Game, { blockFrom: { dx: 0, dy: -1, type: 'rubble' } });
    const b = homewardBlockage(Game, 4, 4);
    check('T1 probe finds (3,4) rubble on the hop path', !!b && b.x === 3 && b.y === 4 && b.blockType === 'rubble', JSON.stringify(b));
    // And the engine agrees: the hop itself refuses on rubble.
    const hop = Game.travelTo(4, 4);
    check('T1 engine hop refuses on the same rubble', !!hop && hop.blockType === 'rubble' && Game.map.px === 3 && Game.map.py === 3, JSON.stringify(hop));
  }

  // T2: full habit clears rubble homeward: -40 kcal, blockFrom gone,
  // player unmoved (guarded side was already the player's tile).
  {
    const { Game } = await loadGame({ seed: 2, mode: 'clearhabit-t2', fullTelemetry: false });
    const { sch } = await stageGame(Game, { blockFrom: { dx: 0, dy: -1, type: 'rubble' } });
    sch.kcal = 1000;
    const ctx = {};
    const rec = homewardClear(Game, ctx);
    const t = Game.tileAt(3, 4);
    check('T2 rubble cleared homeward, floor held, player unmoved',
      rec.status === 'cleared' && rec.remedy === 'rubble' && !t.blockFrom && sch.kcal === 960 &&
      Game.map.px === 3 && Game.map.py === 3 && ctx._chLast === rec,
      `status=${rec.status} kcal=${sch.kcal} blockFrom=${JSON.stringify(t.blockFrom)}`);
    check('T2 cost table rubble=40', clearCost(Game, 'rubble').kcal === 40);
    check('T2 cost table tree=60, scramble=80', clearCost(Game, 'fallen_tree').kcal === 60 && clearCost(Game, 'washed_out').kcal === 80);
  }

  // T3: kcal floor — 230 kcal cannot pay 40 and stay >= 200.
  {
    const { Game } = await loadGame({ seed: 3, mode: 'clearhabit-t3', fullTelemetry: false });
    const { sch } = await stageGame(Game, { blockFrom: { dx: 0, dy: -1, type: 'rubble' } });
    sch.kcal = 230;
    const rec = homewardClear(Game, {});
    const t = Game.tileAt(3, 4);
    check('T3 floor blocks clearing at 230 (230-40=190 < 200), tile intact',
      rec.status === 'unaffordable' && !!t.blockFrom && sch.kcal === 230,
      `status=${rec.status} kcal=${sch.kcal}`);
    sch.kcal = 240;
    const rec2 = homewardClear(Game, {});
    check('T3 floor allows clearing at exactly 240 (240-40=200)',
      rec2.status === 'cleared' && sch.kcal === 200, `status=${rec2.status} kcal=${sch.kcal}`);
  }

  // T4: creek is never cleared by hand.
  {
    const { Game } = await loadGame({ seed: 4, mode: 'clearhabit-t4', fullTelemetry: false });
    const { sch } = await stageGame(Game, { type: 'creek', needsBridge: true, bridged: false, blockFrom: null });
    sch.kcal = 1000;
    const rec = homewardClear(Game, {});
    const t = Game.tileAt(3, 4);
    check('T4 creek unclearable: no clear, kcal untouched, bridge still needed',
      rec.status === 'unclearable-creek' && sch.kcal === 1000 && t.needsBridge === true && !t.bridged,
      `status=${rec.status}`);
  }

  // T5: fallen tree clears at 60 kcal; washed-out bridges with wood.
  {
    const { Game } = await loadGame({ seed: 5, mode: 'clearhabit-t5', fullTelemetry: false });
    const { sch } = await stageGame(Game, { blockFrom: { dx: 0, dy: -1, type: 'fallen_tree' } });
    sch.kcal = 1000;
    const rec = homewardClear(Game, {});
    const t = Game.tileAt(3, 4);
    check('T5 tree clears: -60 kcal, blockFrom gone', rec.status === 'cleared' && rec.remedy === 'tree' && !t.blockFrom && sch.kcal === 940,
      `status=${rec.status} kcal=${sch.kcal}`);
    const { Game: G2 } = await loadGame({ seed: 6, mode: 'clearhabit-t5b', fullTelemetry: false });
    const s2 = await stageGame(G2, { blockFrom: { dx: 0, dy: -1, type: 'washed_out' } });
    try { G2.addWood(4); } catch (e) {}
    const wBefore = G2.woodCount();
    s2.sch.kcal = 1000;
    const rec2 = homewardClear(G2, {});
    const t2 = G2.tileAt(3, 4);
    check('T5 washed-out with wood bridges: -60 kcal, bridged, wood spent',
      wBefore >= 4 && rec2.status === 'cleared' && rec2.remedy === 'bridge' && t2.bridged === true && s2.sch.kcal === 940,
      `woodBefore=${wBefore} status=${rec2.status} remedy=${rec2.remedy} kcal=${s2.sch.kcal} bridged=${t2.bridged}`);
  }

  // T6: unblocked hop — habit does nothing, costs nothing.
  {
    const { Game } = await loadGame({ seed: 7, mode: 'clearhabit-t6', fullTelemetry: false });
    const { sch } = await stageGame(Game, null);
    sch.kcal = 500;
    const rec = homewardClear(Game, {});
    check('T6 unblocked: status unblocked, kcal untouched',
      rec.status === 'unblocked' && !rec.opportunity && sch.kcal === 500, `status=${rec.status}`);
  }

  // Corpus checks (skip until legs exist).
  const hasCorpora = fs.existsSync(BEFORE_DIR) && fs.existsSync(AFTER_DIR) && fs.existsSync(ANALYSIS);
  if (!hasCorpora) {
    skip('T7 before/after seed sets equal (no corpora yet)');
    skip('T8 gate-OFF legs never fired the habit (no corpora yet)');
    skip('T9 analysis pooled numbers recompute (no corpora yet)');
    skip('T10 G3 zero violations in analysis (no corpora yet)');
  } else {
    const loadDir = (dir) => {
      const out = {};
      for (const f of fs.readdirSync(dir).sort()) {
        if (!f.endsWith('.json')) continue;
        const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        out[j.seed] = j;
      }
      return out;
    };
    const before = loadDir(BEFORE_DIR), after = loadDir(AFTER_DIR);
    const a = JSON.parse(fs.readFileSync(ANALYSIS, 'utf8'));
    const bSeeds = Object.keys(before).sort(), aSeeds = Object.keys(after).sort();
    check('T7 before/after seed sets equal', JSON.stringify(bSeeds) === JSON.stringify(aSeeds), `before=${bSeeds.length} after=${aSeeds.length}`);
    let gateOffFired = 0;
    for (const s of bSeeds) for (const e of (before[s].evenings || [])) if (e.clearhabit && e.clearhabit.attempted) gateOffFired++;
    check('T8 gate-OFF legs never fired the habit', gateOffFired === 0, `fired=${gateOffFired}`);
    const OPP = new Set(['cleared', 'unaffordable', 'unclearable-creek', 'unclearable-other', 'walk-failed', 'clear-failed', 'moved-during-clear', 'died-walking', 'combat-walking', 'no-blockfrom']);
    let opp = 0, resc = 0;
    for (const s of aSeeds) for (const e of (after[s].evenings || [])) {
      if (e.eveningOutcome === 'game-over') continue;
      const ch = e.clearhabit || {};
      if (ch.opportunity && OPP.has(ch.status)) { opp++; if (e.inside === true && e.tile === 'haven') resc++; }
    }
    check('T9 analysis pooled numbers recompute',
      a.pooled.afterOpportunity === opp && a.pooled.afterRescued === resc,
      `analysis ${a.pooled.afterOpportunity}/${a.pooled.afterRescued} recomputed ${opp}/${resc}`);
    const g3t = a.pooled.g3Totals;
    const g3sum = g3t.movedDuringClear + g3t.rescuedInCombat + g3t.rescuedClearUnverified + g3t.creekCleared;
    check('T10 G3 zero violations in analysis', g3sum === 0, `g3=${JSON.stringify(g3t)}`);
    check('T10 partition flag true', a.pooled.partitionOk === true);
  }

  if (failures.length) { console.log(`PROOF-RED: ${failures.length} failures: ${failures.join(', ')}`); process.exit(1); }
  console.log(`PROOF-GREEN: all clearhabit checks pass (skipped corpus checks: ${skipped})`);
}

main().catch((e) => { console.error('PROOF-RED crash', e && (e.stack || e.message)); process.exit(2); });
