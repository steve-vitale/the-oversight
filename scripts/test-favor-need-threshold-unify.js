#!/usr/bin/env node
// test-favor-need-threshold-unify.js — VILLAGER-BRAIN Phase 4 residual.
//
// Proves favor-need selection and liveness share one threshold vocabulary,
// and that personality (npcTemper) is a consideration on the scan.
//
// Cases (seed 20261108):
//   1. Mid-band hunger=60: selection and liveness AGREE (no need / not live).
//   2. FAILING CONTROL: Game.convoFavorNeedLegacySplit = true restores the
//      old looser liveness cutoffs → same hunger=60 is live while selection
//      still finds nothing (the double standard).
//   3. Personality: fear=65 — steady finds nothing; anxious finds stay_close
//      (temper lowers the shared fear gate); liveness matches selection.
//   4. Acute hunger=85: both sides agree food_share is present.
//
// Usage: node scripts/test-favor-need-threshold-unify.js
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

function setTemper(Game, vid, temper) {
  const person = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
  if (person) {
    person.personality = person.personality || {};
    person.personality.temperament = temper;
  }
  const chars = (Game.data && Game.data.villagers) || [];
  const ch = chars.find(x => x && x.id === vid);
  if (ch) {
    ch.personality = ch.personality || {};
    ch.personality.temperament = temper;
  }
}

function clearBody(Game, vid) {
  const v = Game.state.village;
  try {
    const n = Game.npcNeeds(vid);
    if (n) { n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10; }
  } catch (e) {}
  v.health = v.health || {};
  v.health[vid] = 100;
  try { if (v.sick) delete v.sick[vid]; } catch (e) {}
  try { if (v.favorLedger) delete v.favorLedger[vid]; } catch (e) {}
  try { if (v.promises) delete v.promises[vid]; } catch (e) {}
  try { if (v.favorDeclined) delete v.favorDeclined[vid]; } catch (e) {}
}

function plantAskedFavor(Game, vid, kind) {
  const v = Game.state.village;
  v.favorLedger = v.favorLedger || {};
  const favor = {
    id: 'favor-test-' + kind + '-' + vid,
    vid, kind, state: 'asked',
    short: kind, task: kind,
    deadline: ((Game.state.scholar || {}).day || 0) + 2,
    askedDay: (Game.state.scholar || {}).day || 0,
  };
  v.favorLedger[vid] = favor;
  return favor;
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.convoFindFavorNeed !== 'function') fail('convoFindFavorNeed missing');
  if (typeof Game.convoFavorNeedLive !== 'function') fail('convoFavorNeedLive missing');
  if (typeof Game.convoFavorNeedPresent !== 'function') fail('convoFavorNeedPresent missing');
  if (typeof Game.convoFavorNeedGate !== 'function') fail('convoFavorNeedGate missing');

  const v = Game.state.village;
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  if (!ids.length) fail('empty roster');
  const vid = ids[0];

  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  Game.convoFavorNeedLegacySplit = false;

  // --- 1. Mid-band hunger: selection and liveness agree (unified) ---
  clearBody(Game, vid);
  setTemper(Game, vid, 'steady');
  Game.npcNeeds(vid).hunger = 60;
  const midNeed = Game.convoFindFavorNeed(vid);
  const midFavor = plantAskedFavor(Game, vid, 'food_share');
  const midLive = Game.convoFavorNeedLive(midFavor);
  if (midNeed != null) fail('mid-band hunger should not select food_share', { midNeed });
  if (midLive !== false) fail('mid-band hunger should not stay live under shared gate', { midLive });
  out({ case: 'mid_band_agree', hunger: 60, selected: midNeed, live: midLive, ok: true });

  // --- 2. Failing control: legacy liveness split disagrees ---
  Game.convoFavorNeedLegacySplit = true;
  const legacyNeed = Game.convoFindFavorNeed(vid);
  const legacyLive = Game.convoFavorNeedLive(midFavor);
  Game.convoFavorNeedLegacySplit = false;
  if (legacyNeed != null) fail('legacy control selection should still miss mid-band', { legacyNeed });
  if (legacyLive !== true) fail('legacy control must show old live-at-50 double standard', { legacyLive });
  if (!(legacyNeed == null && legacyLive === true)) {
    fail('failing control did not demonstrate selection-vs-liveness split', { legacyNeed, legacyLive });
  }
  out({ case: 'legacy_split_control', hunger: 60, selected: legacyNeed, live: legacyLive, doubleStandard: true, ok: true });

  // --- 3. Personality consideration on stay_close ---
  clearBody(Game, vid);
  Game.npcNeeds(vid).fear = 65;

  setTemper(Game, vid, 'steady');
  const steadyGate = Game.convoFavorNeedGate('stay_close', vid);
  const steadyNeed = Game.convoFindFavorNeed(vid);
  const steadyFavor = plantAskedFavor(Game, vid, 'stay_close');
  const steadyLive = Game.convoFavorNeedLive(steadyFavor);
  if (steadyNeed != null) fail('steady at fear=65 should not select stay_close', { steadyNeed, steadyGate });
  if (steadyLive !== false) fail('steady at fear=65 should not keep stay_close live', { steadyLive, steadyGate });

  setTemper(Game, vid, 'anxious');
  const anxiousGate = Game.convoFavorNeedGate('stay_close', vid);
  const anxiousNeed = Game.convoFindFavorNeed(vid);
  const anxiousFavor = plantAskedFavor(Game, vid, 'stay_close');
  const anxiousLive = Game.convoFavorNeedLive(anxiousFavor);
  if (!anxiousNeed || anxiousNeed.kind !== 'stay_close') {
    fail('anxious at fear=65 should select stay_close via temper gate', { anxiousNeed, anxiousGate });
  }
  if (anxiousLive !== true) fail('anxious stay_close must stay live with selection', { anxiousLive, anxiousGate });
  if (!(anxiousGate && anxiousGate.delta > 0 && anxiousGate.gate < steadyGate.gate)) {
    fail('anxious temper must lower stay_close gate vs steady', { anxiousGate, steadyGate });
  }
  if (!anxiousNeed.personality || anxiousNeed.personality.temper !== 'anxious') {
    fail('selected need must annotate personality consideration', { personality: anxiousNeed.personality });
  }
  out({
    case: 'personality_stay_close',
    fear: 65,
    steady: { gate: steadyGate.gate, selected: steadyNeed, live: steadyLive },
    anxious: { gate: anxiousGate.gate, delta: anxiousGate.delta, selected: anxiousNeed.kind, live: anxiousLive },
    ok: true,
  });

  // --- 4. Acute hunger: both sides agree food_share ---
  clearBody(Game, vid);
  setTemper(Game, vid, 'steady');
  Game.npcNeeds(vid).hunger = 85;
  const acuteNeed = Game.convoFindFavorNeed(vid);
  const acuteFavor = plantAskedFavor(Game, vid, 'food_share');
  const acuteLive = Game.convoFavorNeedLive(acuteFavor);
  if (!acuteNeed || acuteNeed.kind !== 'food_share') fail('hunger=85 should select food_share', { acuteNeed });
  if (acuteLive !== true) fail('hunger=85 food_share must be live', { acuteLive });
  out({ case: 'acute_agree', hunger: 85, selected: acuteNeed.kind, live: acuteLive, ok: true });

  out({
    pass: true,
    seed: SEED,
    vid,
    sharedGate: true,
    personalityConsideration: true,
    legacyControlShowsDoubleStandard: true,
  });
})().catch(e => {
  console.error(e && e.stack || e);
  process.exit(1);
});
