#!/usr/bin/env node
// test-scalecourt-climb-20261012.js — PROOF for the journey-scale r5 courtship fix.
//
// BLANK: scalecourt's courtship re-proposed covenant/trade to below-bar villages
// every 7 days. peer_binding_needs_courtship refuses those DETERMINISTICALLY
// ("X barely know Haven's name" — opinion < 10, no proposal, no -5): one run
// logged 59 identical prerequisite refusals and never did the climb the refusal
// text names ("walk to their fire and study their codex").
//
// BEFORE (POLICY_PATH=/tmp/scalecourt-before-r5.js): proposeCovenant IS called
//   for the opinion-5 village; no pilgrimage starts; studyVillageCodex never runs.
// AFTER (default POLICY_PATH): proposeCovenant is NOT called below the bar;
//   a codex pilgrimage starts (ctx._pilgrim); studying the codex fires and
//   opinion rises 5 -> 8 (+3, once).
//
// Usage:
//   POLICY_PATH=/tmp/scalecourt-before-r5.js node scripts/test-scalecourt-climb-20261012.js  # BEFORE (expect FAIL)
//   node scripts/test-scalecourt-climb-20261012.js                                          # AFTER (expect PASS)
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const POLICY_PATH = process.env.POLICY_PATH || path.join(ROOT, 'scripts', 'policies', 'scalecourt.js');

const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  ok: ${name}`); }
  else { failures++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  console.log('policy: ' + POLICY_PATH);
  const policyMod = require(POLICY_PATH);
  const BASE = policyMod.scalecourt || policyMod;
  const { Game } = await loadGame({ seed: 60003, mode: 'scalecourt-climb-proof' });
  Game.say = () => {}; Game.sysSay = () => {}; Game.audioEvent = () => {};
  await setupGame(Game);

  // ---- controlled scenario ----
  const st = Game.state;
  st.scholar.day = 30;
  st.scholar.hp = st.scholar.maxHp || 100;
  st.scholar.exiled = false;
  // fat pantry so the courtship gate (pantry > 12000) passes
  st.village.pantry = st.village.pantry || [];
  st.village.pantry.push({ name: 'proof grain', kcalEach: 50000, units: 1, spoils: 999 });
  // one ACTIVE link so courtship takes the peer-proposal branch (on a DIFFERENT village)
  const ms = Game.mshipState ? Game.mshipState() : null;
  const ovs0 = (st.otherVillages || []).filter(v => v && v.id !== 'haven');
  const otherId = (ovs0[1] || {}).id || 'village_1';
  if (ms) {
    ms.links = ms.links || [];
    ms.links.push({ id: 'proof-lead', kind: 'lead', status: 'active', primary: 'haven', subordinate: otherId, day: 1, trust: 50 });
  }
  // exactly ONE known village, opinion 5 (below the 10 bar), unstudied codex
  const ovs = (st.otherVillages || []).filter(v => v && v.id !== 'haven');
  const target = ovs[0];
  if (!target) { console.log('FAIL: no other villages generated'); process.exit(1); }
  for (const v of ovs) { v.rumored = false; v.generated = false; }
  // "exactly one known village": a village sitting in tiles the scholar has
  // already seen counts as known (knowsVillage) whatever its rumor flag, and
  // where villages land is map luck (origins-world 2026-10-14 put one at
  // (4,1), in sight of Haven). Keep only the target and the linked village.
  st.otherVillages = (st.otherVillages || []).filter(v => !v || v.id === 'haven' || v.id === target.id || v.id === otherId);
  target.rumored = true;
  target.opinion = 5;
  target._codexOpinionGiven = false;
  target.x = 6; target.y = 6;
  target.codex = target.codex || { plants: {}, techniques: {}, recipes: {}, animals: {} };
  // scholar at Haven
  Game.map.px = 4; Game.map.py = 4;

  // ---- spies ----
  const calls = { proposeCovenant: [], proposeTrade: [], study: [] };
  const _pc = Game.proposeCovenant, _pt = Game.proposeTrade, _sv = Game.studyVillageCodex;
  Game.proposeCovenant = function (vid) { calls.proposeCovenant.push(vid); return _pc.apply(this, arguments); };
  Game.proposeTrade = function (vid) { calls.proposeTrade.push(vid); return _pt.apply(this, arguments); };
  Game.studyVillageCodex = function (vid) { calls.study.push(vid); return _sv.apply(this, arguments); };

  const policy = Object.assign({}, BASE);
  policy.id = 'proof';
  const ctx = {};

  console.log('phase A: scholar at Haven, village at opinion 5 (below bar)');
  if (policy.setup) { try { policy.setup(Game, ctx); } catch (e) {} }
  // run ONLY the courtship half: call daily but stub competent's heavy half via
  // the policy's own daily — courtship runs inside it. (daily is fast enough.)
  try { if (policy.daily) policy.daily(Game, ctx); } catch (e) { console.log('  (daily threw: ' + e.message + ')'); }

  const proposedLow = calls.proposeCovenant.includes(target.id) || calls.proposeTrade.includes(target.id);
  const isBefore = /before/.test(POLICY_PATH);
  if (isBefore) {
    check('BEFORE: proposeCovenant called for the below-bar village (the spam)', proposedLow,
      'proposeCovenant calls: ' + JSON.stringify(calls.proposeCovenant));
    check('BEFORE: no pilgrimage started', !ctx._pilgrim, JSON.stringify(ctx._pilgrim));
    check('BEFORE: studyVillageCodex never called', calls.study.length === 0,
      JSON.stringify(calls.study));
  } else {
    check('AFTER: proposeCovenant NOT called for the below-bar village', !proposedLow,
      'calls: ' + JSON.stringify(calls.proposeCovenant.concat(calls.proposeTrade)));
    check('AFTER: codex pilgrimage started', !!(ctx._pilgrim && ctx._pilgrim.vid === target.id),
      JSON.stringify(ctx._pilgrim));
  }

  if (!isBefore) {
    console.log('phase B: scholar walks to their fire (teleport for determinism), study fires');
    Game.map.px = target.x; Game.map.py = target.y;
    const op0 = target.opinion;
    try { if (policy.daily) policy.daily(Game, ctx); } catch (e) { console.log('  (daily threw: ' + e.message + ')'); }
    check('AFTER: studyVillageCodex called at their fire', calls.study.includes(target.id),
      JSON.stringify(calls.study));
    check('AFTER: opinion rose (+3 climb verb)', (target.opinion || 0) === op0 + 3,
      `opinion ${op0} -> ${target.opinion}`);
    check('AFTER: codex marked given (once-only)', !!target._codexOpinionGiven);
  }

  console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL PASS');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
