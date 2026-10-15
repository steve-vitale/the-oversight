#!/usr/bin/env node
// scripts/test-pathselect-20261015.js — proof for the PATHSELECT door
// chooser in scripts/policies/winpursuit.js (sim-pathselect, 2026-10-15,
// sim-findings #311).
//
// Substrate gates (asserted, never defaulted — #312 lesson):
//   FEASTSCALE_R13=1 — marks the table's food-thesis deed on the feast
//     road, so the table actually sits on seed 22 ~day 47. Without it the
//     table never sits and the proof tests nothing.
//   WINPURSUIT=1 is asserted per-phase inside the script (fail loudly).
//
// RED (the gap, on shipped code):
//   (R1) PATHSELECT unset → pickDoorOption returns options[0] even when
//        relay prices far above feared (the build-mismatched door). The
//        pristine drain cannot build-match — shown on the committed
//        9b25ccef layer too.
//   (R2) PATHSELECT unset → 70d leadfeast-s22 day hashes byte-identical
//        between the committed 9b25ccef layer and this tree's layer: the
//        chooser code does not perturb the landed drain when the gate is
//        off.
// GREEN (the mechanism works):
//   (G1) PATHSELECT=1 → pickDoorOption walks the max-standing door (relay
//        over feared), records ctx.pathDoors, ties keep registration order.
//   (G2) PATHSELECT=1 → non-door frames (challenge beats, downgrade) still
//        pick options[0].
//   (G3) PATHSELECT=1 → the 70d leadfeast-s22 run answers the modal
//        (tableAnswers>0) and walks a build-matched door recorded in
//        ctx.pathDoors.
// HONESTY: pathSelectOn()/layerOn() read the env exactly.
// DET: identical seeds byte-identical with both gates off.
// SMOKE=1: the proof fails loudly if policy.daily never ran.
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/test-pathselect-20261015.js
//   FEASTSCALE_R13=1 SMOKE=1 node scripts/test-pathselect-20261015.js
'use strict';
// #312: substrate flags are ASSERTED, never set for convenience.
if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('PROOF STOP: FEASTSCALE_R13=1 is required (substrate). The table never sits without it.');
  process.exit(2);
}
const fs = require('fs');
const path = require('path');
const WP = require('./policies/winpursuit');
const FS = require('./policies/feastscale');

// Baseline: the committed 9b25ccef layer (materialized at proof start,
// removed at proof end — never part of the commit).
const BASELINE_PATH = path.join(__dirname, 'policies', '_wbaseline-prooftmp.js');
fs.writeFileSync(BASELINE_PATH, fs.readFileSync('/tmp/winpursuit-9b25ccef.js', 'utf8'));
const WB = require('./policies/_wbaseline-prooftmp.js');

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; fails.push(name); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function syntheticDoor(tcFrame) {
  return {
    frame: tcFrame || 'the Table',
    options: [
      { id: 'path:feared', label: 'Walk the path of THE FEARED' },
      { id: 'path:indispensable', label: 'Walk the path of THE INDISPENSABLE' },
      { id: 'path:beloved', label: 'Walk the path of THE BELOVED' },
      { id: 'path:relay', label: 'Walk the path of THE RELAY' },
    ],
  };
}

// A fake Game exposing tableEarnedPaths with FIXED build pricing: relay
// strongest (deep-integration build), feared earned-but-weak.
function fakeGame(standing) {
  return {
    tableEarnedPaths() {
      return Object.keys(standing).map(id => ({ id, name: id.toUpperCase(), earned: true, strength: standing[id], why: 'synthetic' }));
    },
  };
}

(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  let dailyCalls = 0;

  async function runWith(policy, seed, days) {
    const { Game } = await loadGame({ seed, mode: 'pathselect-proof', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    let runCtx = null;
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { dailyCalls++; hs.push(G.state.scholar.day + ':' + dayHash(G)); return base ? base(G, ctx) : undefined; };
    const oSetup = policy.setup;
    wrapped.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 30 }); });
    return { hs, runCtx, won: !!Game.won, Game };
  }

  console.log('HONESTY — env gates');
  delete process.env.WINPURSUIT; delete process.env.PATHSELECT;
  check('layerOn false when WINPURSUIT unset', WP.layerOn() === false);
  check('pathSelectOn false when PATHSELECT unset', WP.pathSelectOn() === false);
  process.env.WINPURSUIT = '1';
  check('layerOn true when WINPURSUIT=1', WP.layerOn() === true);
  check('pathSelectOn true when PATHSELECT=1', (process.env.PATHSELECT = '1', WP.pathSelectOn() === true));
  delete process.env.WINPURSUIT; delete process.env.PATHSELECT;

  console.log('RED — the pristine drain cannot build-match');
  {
    const tc = syntheticDoor();
    const G = fakeGame({ feared: 60, indispensable: 30, beloved: 40, relay: 92 });
    const pick = WP.pickDoorOption(G, {}, tc);
    check('RED: PATHSELECT unset → options[0] (feared) despite relay standing 92',
      pick.id === 'path:feared', 'picked=' + pick.id);
  }
  {
    // The committed 9b25ccef layer on the same synthetic door: same RED.
    const tc = syntheticDoor();
    const G = fakeGame({ feared: 60, relay: 92 });
    G.chooseTableOption = (id) => { G._picked = id; };
    G.state = { scholar: { tableChoices: tc } };
    G.over = false;
    // committed layer has no pickDoorOption export — drive its drain path
    // via daily with WINPURSUIT=1: it answers options[0].
    process.env.WINPURSUIT = '1';
    try { WB.leadpursuit.daily(G, {}); } catch (e) { /* base daily needs a real Game; the drain already recorded */ }
    delete process.env.WINPURSUIT;
    check('RED: committed 9b25ccef drain answers the first door (feared)',
      G._picked === 'path:feared', 'picked=' + G._picked);
  }
  {
    // Gate-off drain purity: 70d leadfeast s22, committed layer vs this
    // tree's layer with PATHSELECT unset — day hashes byte-identical.
    process.env.WINPURSUIT = '1';
    const a = await runWith(WB.leadpursuit, 22, 70);
    const b = await runWith(WP.leadpursuit, 22, 70);
    delete process.env.WINPURSUIT;
    const same = a.hs.length === b.hs.length && a.hs.every((h, i) => h === b.hs[i]);
    check('RED: PATHSELECT unset — drain byte-identical to committed layer (70d)', same,
      `lengths ${a.hs.length}/${b.hs.length}`);
    const aa = (a.runCtx && a.runCtx.tableAnswers) || 0, bb = (b.runCtx && b.runCtx.tableAnswers) || 0;
    check('RED: same table answers on both drains', aa === bb && aa > 0, `answers=${aa}/${bb}`);
  }

  console.log('GREEN — the chooser build-matches');
  process.env.PATHSELECT = '1';
  {
    const G = fakeGame({ feared: 60, indispensable: 30, beloved: 40, relay: 92 });
    const ctx = {};
    const pick = WP.pickDoorOption(G, ctx, syntheticDoor());
    check('GREEN: PATHSELECT=1 walks the max-standing door (relay)', pick.id === 'path:relay', 'picked=' + pick.id);
    check('GREEN: door choice recorded on ctx.pathDoors',
      Array.isArray(ctx.pathDoors) && ctx.pathDoors.length === 1 && ctx.pathDoors[0].walked === 'relay',
      JSON.stringify(ctx.pathDoors));
  }
  {
    // Tie keeps registration order — identical to the options[0] drain.
    const G = fakeGame({ feared: 80, relay: 80, beloved: 80 });
    const pick = WP.pickDoorOption(G, {}, syntheticDoor());
    check('GREEN: standing tie → registration order (feared)', pick.id === 'path:feared', 'picked=' + pick.id);
  }
  {
    // A path absent from the earned list can't be picked even if priced 0.
    const G = fakeGame({ feared: 60, relay: 92 }); // beloved/indispensable not earned
    const pick = WP.pickDoorOption(G, {}, syntheticDoor());
    check('GREEN: unearned options never picked (relay, not beloved)', pick.id === 'path:relay', 'picked=' + pick.id);
  }
  {
    // Non-door frames keep options[0]: challenge beat + downgrade modal.
    const G = fakeGame({ feared: 0, relay: 92 });
    const ctx = {};
    const beat = WP.pickDoorOption(G, ctx, { frame: 'the Table', options: [{ id: 'spend' }, { id: 'keep' }] });
    const down = WP.pickDoorOption(G, ctx, { frame: 'the Table', options: [{ id: 'downgrade:relay' }, { id: 'downgrade:witness' }] });
    check('GREEN: challenge beat keeps options[0]', beat.id === 'spend', 'picked=' + beat.id);
    check('GREEN: downgrade modal keeps options[0]', down.id === 'downgrade:relay', 'picked=' + down.id);
    check('GREEN: non-door frames recorded nothing on ctx.pathDoors', !ctx.pathDoors, JSON.stringify(ctx.pathDoors));
  }
  {
    // Gate off → options[0] again, nothing recorded.
    delete process.env.PATHSELECT;
    const G = fakeGame({ feared: 60, relay: 92 });
    const ctx = {};
    const pick = WP.pickDoorOption(G, ctx, syntheticDoor());
    check('GREEN: PATHSELECT unset mid-proof → options[0] again', pick.id === 'path:feared', 'picked=' + pick.id);
    check('GREEN: no telemetry when gate off', !ctx.pathDoors, JSON.stringify(ctx.pathDoors));
    process.env.PATHSELECT = '1';
  }
  delete process.env.PATHSELECT;

  console.log('GREEN — the armed layer drives the modal on a real run');
  process.env.WINPURSUIT = '1'; process.env.PATHSELECT = '1';
  {
    const r = await runWith(WP.leadpursuit, 22, 70);
    const answers = (r.runCtx && r.runCtx.tableAnswers) || 0;
    check('GREEN: armed layer answers the modal (tableAnswers>0)', answers > 0, `answers=${answers}`);
    const doors = (r.runCtx && r.runCtx.pathDoors) || [];
    check('GREEN: door choice recorded on the real run', doors.length > 0, `doors=${doors.length}`);
    let consistent = true;
    for (const d of doors) {
      const s = d.standing[d.walked] | 0;
      for (const o of d.offers) { if ((d.standing[o] | 0) > s) consistent = false; }
    }
    check('GREEN: every walked door was a max-standing door', consistent, JSON.stringify(doors.map(d => d.walked)));
  }
  delete process.env.WINPURSUIT; delete process.env.PATHSELECT;

  console.log('DET — both gates off, identical seeds byte-identical');
  {
    const a = await runWith(WP.leadpursuit, 11, 30);
    const b = await runWith(WP.leadpursuit, 11, 30);
    const same = a.hs.length === b.hs.length && a.hs.every((h, i) => h === b.hs[i]);
    check('DET: gates off — two identical 30d runs byte-identical', same, `lengths ${a.hs.length}/${b.hs.length}`);
  }

  if (process.env.SMOKE === '1') {
    check('SMOKE: policy.daily actually ran (instrument honesty)', dailyCalls > 0, `dailyCalls=${dailyCalls}`);
  }

  try { fs.unlinkSync(BASELINE_PATH); } catch (e) {}
  console.log(`\nproof pathselect: ${pass} pass, ${fail} fail${fail ? ' — FAILED: ' + fails.join(', ') : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { try { fs.unlinkSync(BASELINE_PATH); } catch (e2) {} console.error('PROOF CRASH:', e); process.exit(2); });
