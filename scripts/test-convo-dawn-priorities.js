#!/usr/bin/env node
// test-convo-dawn-priorities.js — VILLAGER-BRAIN Phase 4 social half.
//
// Proves convoSelectWant reads today's dawn commitment + top drive so the
// selected want (and opener) track the same priorities dawn chose.
//
// Cases (seed 20261108):
//   1. HAVEN_CHORE + safety  → warn_you (aligned); opener speaks.
//   2. VISIT + bonds         → just_company / seek_comfort (aligned).
//   3. FORAGE + food_security + live forage need → ask_favor (aligned).
//   4. FAILING CONTROL: same FORAGE setup with
//      Game.convoDawnPrioritiesDisabled = true → no dawn annotation and
//      selected want is NOT ask_favor (share_news wins on stale lastDay).
//
// Usage: node scripts/test-convo-dawn-priorities.js
// Exit 0 = pass, 1 = fail. No repo writes.
'use strict';
const path = require('path');
const repo = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));

const SEED = 20261108;

function out(o) { console.log(JSON.stringify(o)); }
function fail(msg, extra) {
  out(Object.assign({ pass: false, fail: msg }, extra || {}));
  process.exit(1);
}

function plantCommit(Game, vid, kind, drive) {
  const day = (Game.state.scholar || {}).day || 0;
  const v = Game.state.village;
  v.vbrain = v.vbrain || { commit: {}, logs: [], stats: {} };
  v.vbrain.commit = v.vbrain.commit || {};
  v.vbrain.commit[vid] = {
    kind, day, part: 0, scoreAtChoice: 2,
    vgoal: drive || null, vbrainSrc: 'test', winPlanAction: null, companion: null,
  };
  v.vgoals = v.vgoals || {};
  v.vgoals[vid] = { top: drive || null, sinceDay: day };
}

function prepConvo(Game, vid) {
  // Repeat meeting so first-meeting curious floor does not dominate.
  const c = Game.convoGet(vid);
  c.count = 3;
  c.lastDay = (Game.state.scholar || {}).day || 0; // share_news base weight 1
  c.seeds = [];
  c.want = null;
  // Grief floor (seek_taken → 3.1) would swamp dawn bias — this probe is
  // about commitment tracking, not Taking voice. Empty kin kills the want.
  const prevTaken = Game.takenKinOf;
  Game.takenKinOf = function () { return []; };
  Game._restoreTakenKinOf = prevTaken;
  // Clear unfinished-business pre-emptors.
  try {
    const v = Game.state.village;
    if (v.favorLedger) delete v.favorLedger[vid];
    if (v.promises) delete v.promises[vid];
  } catch (e) {}
  try {
    if (typeof Game.inviteHistory === 'function') {
      const h = Game.inviteHistory(vid);
      if (h && h.pocketed) h.pocketed.mentioned = true;
    }
  } catch (e) {}
}

function selectWithFrozenRng(Game, vid) {
  const real = Math.random;
  Math.random = () => 0;
  let want = null;
  try { want = Game.convoSelectWant(vid); }
  finally { Math.random = real; }
  return want;
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.convoSelectWant !== 'function') fail('convoSelectWant missing');
  if (typeof Game.convoDawnPriorities !== 'function') fail('convoDawnPriorities missing');
  if (typeof Game.vbrainCommit !== 'function') fail('vbrainCommit missing');

  const v = Game.state.village;
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  if (!ids.length) fail('empty roster');
  const vid = ids[0];

  // Healthy body, full pantry/water baseline — favors off unless a case
  // deliberately empties the pantry.
  try {
    const n = Game.npcNeeds(vid);
    if (n) { n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10; }
  } catch (e) {}
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  v.trust = v.trust || {}; v.trust[vid] = 20;

  // ---- Case 1: safety chore day → warn_you ----
  prepConvo(Game, vid);
  plantCommit(Game, vid, 'HAVEN_CHORE', 'safety');
  const dawn1 = Game.convoDawnPriorities(vid);
  if (!dawn1 || dawn1.kind !== 'HAVEN_CHORE' || dawn1.drive !== 'safety') {
    fail('dawn priorities miss HAVEN_CHORE/safety', { dawn1 });
  }
  if (!dawn1.preferred || dawn1.preferred.indexOf('warn_you') === -1) {
    fail('safety preferred missing warn_you', { dawn1 });
  }
  const w1 = selectWithFrozenRng(Game, vid);
  if (!w1 || w1.id !== 'warn_you' || !w1.dawn || !w1.dawn.aligned) {
    fail('HAVEN_CHORE/safety should select warn_you', { w1 });
  }
  const open1 = Game.convoWantOpener(vid, w1);
  if (!open1 || !open1.line || open1.wantId !== 'warn_you') {
    fail('warn_you opener missing', { open1 });
  }

  // LEAVE + safety: both maps put warn_you first (sanity on kind map).
  prepConvo(Game, vid);
  plantCommit(Game, vid, 'LEAVE', 'safety');
  const w1b = selectWithFrozenRng(Game, vid);
  if (!w1b || w1b.id !== 'warn_you' || !w1b.dawn || !w1b.dawn.aligned) {
    fail('LEAVE/safety should select warn_you', { w1b });
  }

  // ---- Case 2: VISIT + bonds → company/comfort ----
  prepConvo(Game, vid);
  plantCommit(Game, vid, 'VISIT', 'bonds');
  const w2 = selectWithFrozenRng(Game, vid);
  const socialOk = w2 && (w2.id === 'just_company' || w2.id === 'seek_comfort');
  if (!socialOk || !w2.dawn || !w2.dawn.aligned) {
    fail('VISIT/bonds should select company or comfort', { w2 });
  }
  const open2 = Game.convoWantOpener(vid, w2);
  if (!open2 || !open2.line || open2.wantId !== w2.id) {
    fail('social opener missing', { open2, id: w2 && w2.id });
  }

  // ---- Case 3: FORAGE + food_security + live need → ask_favor ----
  // Stale lastDay gives share_news base 3; stacked dawn bias still lifts
  // ask_favor (2+2+2) above it — same substrate as the failing control.
  prepConvo(Game, vid);
  Game.convoGet(vid).lastDay = ((Game.state.scholar || {}).day || 0) - 5;
  try {
    // Empty pantry so forage_help need is live (urgency 2).
    if (typeof Game.stockPantry === 'function') Game.stockPantry(0, 'test');
    else v.pantryKcal = 0;
    v.pantry = [];
    v.pantryKcal = 0;
  } catch (e) {}
  const need = Game.convoFindFavorNeed(vid);
  if (!need || need.kind !== 'forage_help') {
    fail('expected forage_help need for food case', { need });
  }
  plantCommit(Game, vid, 'FORAGE', 'food_security');
  const w3 = selectWithFrozenRng(Game, vid);
  if (!w3 || w3.id !== 'ask_favor' || !w3.dawn || !w3.dawn.aligned) {
    fail('FORAGE/food_security should select ask_favor', { w3, need });
  }
  // Attach want so opener can store the favor instance.
  Game.convoGet(vid).want = { id: w3.id, def: w3.def, stage: 0 };
  const open3 = Game.convoWantOpener(vid, w3);
  if (!open3 || !open3.line || open3.wantId !== 'ask_favor') {
    fail('ask_favor opener missing', { open3 });
  }

  // ---- Case 4: FAILING CONTROL — no dawn read → not ask_favor ----
  // Identical forage need + FORAGE/food_security + stale lastDay, dawn off.
  // share_news (3) beats unboosted ask_favor (2).
  prepConvo(Game, vid);
  Game.convoGet(vid).lastDay = ((Game.state.scholar || {}).day || 0) - 5;
  plantCommit(Game, vid, 'FORAGE', 'food_security');
  Game.convoDawnPrioritiesDisabled = true;
  const dawnOff = Game.convoDawnPriorities(vid);
  if (dawnOff != null) fail('disabled dawn priorities should be null', { dawnOff });
  const w4 = selectWithFrozenRng(Game, vid);
  Game.convoDawnPrioritiesDisabled = false;
  if (!w4 || w4.dawn) fail('control select must not annotate dawn', { w4 });
  if (w4.id === 'ask_favor') {
    fail('control without dawn read must not pick ask_favor', { w4 });
  }
  if (w4.id !== 'share_news') {
    fail('control expected share_news (stale lastDay weight 3)', { w4 });
  }

  // Static seam: select path must call the dawn reader.
  const src = require('fs').readFileSync(path.join(repo, 'src/js/convo-wants.js'), 'utf8');
  if (!/convoDawnPriorities\(vid\)/.test(src) || !/dawnBoosts\[id\]/.test(src)) {
    fail('convoSelectWant missing dawn bias wiring');
  }

  out({
    pass: true,
    seed: SEED,
    cases: {
      safety: { want: w1.id, opener: open1.line.slice(0, 60), dawn: w1.dawn },
      bonds: { want: w2.id, opener: open2.line.slice(0, 60), dawn: w2.dawn },
      food: { want: w3.id, opener: open3.line.slice(0, 60), dawn: w3.dawn },
      control: { want: w4.id, dawn: w4.dawn || null },
    },
  });
})().catch(e => {
  fail('threw', { err: String(e && e.stack || e) });
});
