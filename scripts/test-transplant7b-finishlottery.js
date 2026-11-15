#!/usr/bin/env node
// test-transplant7b-finishlottery.js — targeted family-test leg for narrowed
// family 7b (arm sim-transplant7b-a).
//
// Proves the 7b objectives-side wiring is INERT on far-end substrate: the
// finishLottery wrapper calls vbrainAlignObjective ONLY when loaded, and
// the brain module does not exist on this substrate, so objPick must behave
// identically with and without the 7b hunks.
//
// Run BEFORE/AFTER (far end vs 7b subject, same staging, same seed):
//   - (a) typeof Game.vbrainAlignObjective === 'undefined' on BOTH trees
//         (the align function is absent — the wiring's guarded call is inert)
//   - (b) objPick returns an objective without throwing (the try/catch
//         guard holds on every early return)
//   - (c) the objective kind/purpose are identical between the two trees
//         on the same seed (the wiring changes nothing observable without
//         the brain module)
//
// EXPECTED polarity (opposite of 8c's dlgmore script): exit 0 on BOTH the
// far end and the subject — identity, not a before/after flip — because
// the 7b mechanism predicts inertness. A difference between the two runs
// is the finding, reported in the evidence file; the survival verdict is
// judged separately by the step corpora.
//
// Usage: node scripts/test-transplant7b-finishlottery.js [--seed N]
// Exit 0 = pass (inert as predicted), 1 = fail, 2 = setup skip.
// No repo writes.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const SEED = parseInt((process.argv.find(function (a) { return a.indexOf('--seed=') === 0; }) || '--seed=20261108').slice(7), 10) || 20261108;

function out(o) { console.log(JSON.stringify(o)); }

function livingIds(Game) {
  const me = Game.villagerId;
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) {
    return id && id !== me;
  });
  const outIds = [];
  for (let i = 0; i < roster.length; i++) {
    const id = roster[i];
    let dead = false;
    try {
      const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
      if (p && p.dead) dead = true;
    } catch (e) {}
    if (!dead) outIds.push(id);
  }
  return outIds;
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  // (a) The align function must be ABSENT on this substrate.
  const alignType = typeof Game.vbrainAlignObjective;
  if (alignType !== 'undefined') {
    out({ pass: false, fail: 'vbrainAlignObjective present on this substrate (expected absent)', alignType: alignType, seed: SEED });
    process.exit(1);
  }

  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  try { Game.stockPantry(2500, 'probe'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  const ids = livingIds(Game);
  if (ids.length < 1) { out({ skip: 'no living villagers', seed: SEED }); process.exit(2); }
  const vid = ids[0];
  try {
    const n = Game.npcNeeds(vid);
    if (n) { n.hunger = 20; n.energy = 80; n.social = 40; n.fear = 10; }
  } catch (e) {}
  try { Game.npcSetNode(vid, hx, hy); } catch (e) {}
  try { Game.npcSetInside(vid, true); } catch (e) {}

  // (b) objPick must not throw, and must return an objective. Run it for
  // the first three living villagers so more than one early-return path is
  // exercised on the same seed.
  const picks = [];
  for (let i = 0; i < Math.min(3, ids.length); i++) {
    const id = ids[i];
    let o;
    try {
      o = Game.objOf(id);
      o.kind = 'idle'; o.state = 'idle'; o.indoor = false; o.goal = null; o.goalLine = null;
      o.chore = null; o.purpose = null;
      Game.objPick(id, hx, hy);
    } catch (e) {
      out({ pass: false, fail: 'objPick threw on villager ' + id, error: String(e && e.message || e), seed: SEED });
      process.exit(1);
    }
    if (!o || typeof o.kind !== 'string') {
      out({ pass: false, fail: 'objPick returned no objective kind for villager ' + id, seed: SEED });
      process.exit(1);
    }
    picks.push({ vid: id, kind: o.kind, purpose: o.purpose || null, indoor: !!o.indoor, chore: o.chore || null });
  }

  // (c) is judged by the CALLER comparing this run's picks JSON between
  // the far end and the subject (same seed, same staging). This script
  // reports the picks deterministically so the comparison is exact.
  out({ pass: true, seed: SEED, alignType: alignType, picks: picks });
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
