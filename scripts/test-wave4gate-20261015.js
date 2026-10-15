#!/usr/bin/env node
'use strict';
// scripts/test-wave4gate-20261015.js — proof test for the wave-4/5 gate audit
// instrument (scripts/wave4gate-lib-20261015.js + scripts/wave4gate-20261015.js).
//
// Proves the instrument reads the CURRENT gate honestly on constructed
// states, without a 16-run sweep: each scenario sets day / ledger points /
// wavesFaced / feast log on a real loaded game (no engine internals
// bypassed — the classifier calls the same Game.* functions the engine
// does), then asserts the expected binding-rung classification, then asserts
// sampler determinism (repeated reads of one state agree; the sampler does
// not move engine-visible state beyond what the engine itself does when it
// evaluates the gate).
//
// States (real wave-3 ids: redactor, gavel, spool; real wave-4 ids:
// congregation, strike; real wave-2 ids for the ledger):
//   S1 below-all      : day 20, pts2=0              -> w4 w3-day-floor
//   S2 ledger-bind    : day 30, pts2=2 (need 4)     -> w4 w3-ledger2
//   S3 standing-raw   : day 30, pts2=4, raw 0       -> w4 standing-raw
//   S4 defer-bind     : day 30, pts2=4, war 125, engaged3=1 -> w4 standing-defer4, uw=3
//   S5 unlocked       : day 30, pts2=4, war 100, engaged3=3 -> w4 unlocked, uw=4
//   S6 w5-raw         : S5 + war 150, engaged4=2     -> w5 standing-raw, uw=4
//   S7 w5-defer       : S5 + war 200, engaged4=1     -> w5 standing-defer5, uw=4
//   S8 w5-noface      : S5 + war 200, engaged4=0     -> w5 w4faced, uw=4
//   S9 plenty-road    : day 30, pts2=4, 5 feasts q>=1 -> w4 standing-raw (raw=100 exactly? plenty=100 -> gated>=100 -> unlocked)
// Note S9: 5 feasts x 20 = 100 >= t4 -> the plenty road UNLOCKS wave 4 when
// the deferral is satisfied (engaged3=3). This is a feature of the current
// gate worth pinning: bread alone can open the Mirror Draft.
//   S10 plenty-cap    : day 30, pts2=4, war 25 + 11 feasts (raw 245, capped
//     125) -> w5 standing-cap: raw met t5, the plenty cap holds gated at 199.
//     Bread alone cannot buy the fifth draft — by design.
const assert = require('assert');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { sampleGate, classifyGate, classifySample, cfgOf } = require('./wave4gate-lib-20261015');

const W3 = ['redactor', 'gavel', 'spool'];
const W4 = ['congregation', 'strike'];

function setLedger(Game, wave, points, ids) {
  Game.ledgerState();
  const perType = {};
  let left = points, i = 0;
  for (const id of ids) { const give = Math.min(2, left); perType[id] = give; left -= give; i++; if (left <= 0) break; }
  Game.state.waveLedger[wave] = { points, perType, perTypeX: {} };
}
function setFaced(Game, mids, wave) {
  const d = Game.deedState();
  d.wavesFaced = d.wavesFaced || {};
  for (const m of mids) d.wavesFaced[m] = wave;
}
function setDay(Game, day) { Game.state.scholar.day = day; }
function setFeasts(Game, n) {
  Game.state.feastLog = [];
  for (let i = 0; i < n; i++) Game.state.feastLog.push({ day: 20 + i, quality: 1 });
}

async function fresh() {
  const { Game } = await loadGame({ seed: 7, mode: 'wave4gate-test' });
  await setupGame(Game);
  return Game;
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name} — ${detail}`); }
}

(async () => {
  await quietLog(async () => {
    // S1: below everything
    {
      const G = await fresh();
      setDay(G, 20);
      const c = classifyGate(G);
      check('S1 w4 binding=w3-day-floor', c.w4.binding === 'w3-day-floor', JSON.stringify(c.w4));
      check('S1 uw=1', c.uw === 1, 'uw=' + c.uw);
    }
    // S2: ledger binds
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 2, ['voice_mimic_radio', 'mirror_stag']);
      const c = classifyGate(G);
      check('S2 w4 binding=w3-ledger2', c.w4.binding === 'w3-ledger2', JSON.stringify(c.w4));
      check('S2 numbers pts2=2/need=4', c.w4.pts2 === 2 && c.w4.need2 === 4, JSON.stringify(c.w4));
    }
    // S3: raw standing binds
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag', 'review_drone']);
      const c = classifyGate(G);
      // ledger points a:2,b:2 -> 4 total: the w3 rung is met, standing is not
      check('S3 w4 binding=standing-raw', c.w4.binding === 'standing-raw', JSON.stringify(c.w4));
      check('S3 numbers raw=0 gated=0 t4=100', c.w4.raw === 0 && c.w4.gated === 0 && c.w4.t4 === 100, JSON.stringify(c.w4));
      check('S3 uw=3', c.uw === 3, 'uw=' + c.uw);
    }
    // S4: raw meets the bar but the faced-experience deferral holds it
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag', 'review_drone']);
      setLedger(G, 3, 5, ['redactor', 'gavel', 'spool']); // 5 pts -> war 125
      setFaced(G, ['redactor'], 3); // engaged3=1 < 3
      const s = sampleGate(G);
      check('S4 raw=125', s.raw === 125, 'raw=' + s.raw);
      check('S4 gated held at 99', s.gated === 99, 'gated=' + s.gated);
      const c = classifyGate(G);
      check('S4 w4 binding=standing-defer4', c.w4.binding === 'standing-defer4', JSON.stringify(c.w4));
      check('S4 uw=3 (not 4)', c.uw === 3, 'uw=' + c.uw);
      check('S4 rd4 faced=1 need=3', c.w4.engaged3 === 1 && c.w4.need3 === 3, JSON.stringify(c.w4));
      // release: face 3 distinct w3 types -> the same state opens wave 4
      setFaced(G, W3, 3);
      const c2 = classifyGate(G);
      check('S4b facing 3 w3 types releases wave 4', c2.w4.unlocked && c2.uw === 4,
        'uw=' + c2.uw + ' binding=' + c2.w4.binding);
    }
    // S5: everything met -> unlocked
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag', 'review_drone']);
      setLedger(G, 3, 4, ['redactor', 'gavel', 'spool']); // war 100
      setFaced(G, W3, 3);
      const c = classifyGate(G);
      check('S5 w4 unlocked', c.w4.unlocked && c.w4.binding === 'unlocked', JSON.stringify(c.w4));
      check('S5 uw=4', c.uw === 4, 'uw=' + c.uw);
      // sampler determinism on this state
      const a = JSON.stringify(sampleGate(G));
      const b = JSON.stringify(sampleGate(G));
      check('S5 sampler deterministic', a === b, 'differ');
    }
    // S6: wave 5 — standing raw binds
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag', 'review_drone']);
      setLedger(G, 3, 6, ['redactor', 'gavel', 'spool']); // war 150
      setFaced(G, W3, 3);
      setFaced(G, W4, 4); // engaged4=2: faced, defer5 ready
      const c = classifyGate(G);
      check('S6 uw=4', c.uw === 4, 'uw=' + c.uw);
      check('S6 w5 binding=standing-raw', !c.w5.unlocked && c.w5.binding === 'standing-raw', JSON.stringify(c.w5));
      check('S6 numbers raw=150 t5=200', c.w5.raw === 150 && c.w5.t5 === 200, JSON.stringify(c.w5));
    }
    // S7: wave 5 — raw meets bar, defer5 holds at 199
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag', 'review_drone']);
      setLedger(G, 3, 8, ['redactor', 'gavel', 'spool']); // war 200
      setFaced(G, W3, 3);
      setFaced(G, ['congregation'], 4); // engaged4=1 < 2
      const s = sampleGate(G);
      check('S7 raw=200 gated=199', s.raw === 200 && s.gated === 199, `raw=${s.raw} gated=${s.gated}`);
      const c = classifyGate(G);
      check('S7 uw=4', c.uw === 4, 'uw=' + c.uw);
      check('S7 w5 binding=standing-defer5', !c.w5.unlocked && c.w5.binding === 'standing-defer5', JSON.stringify(c.w5));
    }
    // S8: wave 5 — standing met but wave 4 never faced
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag', 'review_drone']);
      setLedger(G, 3, 8, ['redactor', 'gavel', 'spool']); // war 200
      setFaced(G, W3, 3);
      // engaged4 = 0: no wave-4 monster ever stood on the grid
      const c = classifyGate(G);
      check('S8 uw=4 (standing alone opens w4)', c.uw === 4, 'uw=' + c.uw);
      check('S8 w5 binding=w4faced', !c.w5.unlocked && c.w5.binding === 'w4faced', JSON.stringify(c.w5));
    }
    // S9: the plenty road — 5 major feasts = 100 standing, opens wave 4
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag', 'review_drone']);
      setFeasts(G, 5);
      setFaced(G, W3, 3);
      const s = sampleGate(G);
      check('S9 plenty=100 raw=100', s.plenty === 100 && s.raw === 100, `plenty=${s.plenty} raw=${s.raw}`);
      const c = classifyGate(G);
      check('S9 w4 unlocked on the plenty road', c.w4.unlocked && c.uw === 4, JSON.stringify(c.w4));
      // but the plenty CAP holds wave 5: even 20 feasts can't buy it alone
      setFeasts(G, 20);
      const s2 = sampleGate(G);
      check('S9 plenty cap: raw=400 but gated<=199', s2.raw === 400 && s2.gated <= 199, `raw=${s2.raw} gated=${s2.gated}`);
      check('S9 w5 still closed (cap)', !classifyGate(G).w5.unlocked, 'w5 opened?!');
    }
    // S10: wave 5 — raw meets t5 on bread, the plenty cap holds gated at 199
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag', 'review_drone']);
      setLedger(G, 3, 1, ['redactor']); // war 25
      setFeasts(G, 11); // plenty 220
      setFaced(G, W3, 3);
      setFaced(G, W4, 4); // engaged4=2: defer5 ready
      const s = sampleGate(G);
      check('S10 raw=245 capped=125 gated=199', s.raw === 245 && s.capped === 125 && s.gated === 199,
        `raw=${s.raw} capped=${s.capped} gated=${s.gated}`);
      const c = classifyGate(G);
      check('S10 uw=4 (cap does not block wave 4)', c.uw === 4, 'uw=' + c.uw);
      check('S10 w5 binding=standing-cap', !c.w5.unlocked && c.w5.binding === 'standing-cap', JSON.stringify(c.w5));
    }
    // classifySample/classifyGate equivalence: the pure function over a
    // stored row must agree with the live-state classifier.
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag', 'review_drone']);
      setLedger(G, 3, 5, ['redactor', 'gavel', 'spool']);
      setFaced(G, ['redactor'], 3);
      const live = classifyGate(G);
      const s = sampleGate(G);
      const pure = classifySample(s, s.cfg);
      check('equiv: pure w4 binding matches live', pure.w4.binding === live.w4.binding,
        `${pure.w4.binding} vs ${live.w4.binding}`);
      check('equiv: pure w5 binding matches live', pure.w5.binding === live.w5.binding,
        `${pure.w5.binding} vs ${live.w5.binding}`);
    }
    // instrument honesty: repeated reads don't move engine-visible state
    {
      const G = await fresh();
      setDay(G, 30);
      setLedger(G, 2, 4, ['voice_mimic_radio', 'mirror_stag']);
      const uwBefore = G.unlockedWave();
      const hash0 = [ghash(G)].join();
      sampleGate(G); sampleGate(G); sampleGate(G);
      const uwAfter = G.unlockedWave();
      const hash1 = [ghash(G)].join();
      check('honesty: uw unchanged by 3 sampler rounds', uwBefore === uwAfter, `${uwBefore} -> ${uwAfter}`);
      check('honesty: coarse state hash unchanged', hash0 === hash1, `${hash0} -> ${hash1}`);
    }
  });
  console.log(fail ? `\nRESULT: ${fail} FAILURES, ${pass} passes` : `\nRESULT: all ${pass} checks pass`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

function ghash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, G0(Game)].join('|');
  } catch (e) { return 'ERR'; }
}
function G0(Game) {
  try { return (Game.unlockedWave ? Game.unlockedWave() : 0) + ':' +
    (((Game.villageStanding ? Game.villageStanding() : null) || {}).total | 0); } catch (e) { return 'x'; }
}
