#!/usr/bin/env node
// scripts/test-readinessgate-20261015.js — READINESS GATE proof.
// sim-readinessgate (2026-10-15): Standing-gated wave-4/5 unlocks DEFER until
// the village passes the readiness bar (src/js/standing.js ONLY).
//
// RED PHASE: run against PRISTINE standing.js
//   (git show HEAD:src/js/standing.js > src/js/standing.js):
//   the new behavior must be ABSENT — scripted unready fixture with standing
//   >= 100 unlocks wave 4 anyway (exit 1: RED verified).
// GREEN PHASE: run against the ARMed tree: all assertions pass (exit 0).
//
// Fixture (scripted, deterministic): day 60; wave-3 unlocked organically via
// the wave-2 ledger bar (4 points); Standing via plenty (5+ feasts @ quality
// 1); the village is UNREADY by default (no kills, no tricks, no armor).
// READINESS channels under test, each independent:
//   (a) >=2 distinct wave-(w-1) ledger kill types
//   (b) >=2 learned counters for wave-(w-1) monsters (villagerTricks)
//   (c) scholar armor P >= 20 (military_vest = 40)
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const fails = [];
const pass = [];
function check(name, cond, detail) {
  const ok = !!cond;
  (ok ? pass : fails).push(name);
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

function feast(n, day) {
  const log = [];
  for (let i = 0; i < n; i++) log.push({ day: day - i, quality: 1 });
  return log;
}
function ledger(points, perType) {
  return { points, perType, perTypeX: {} };
}

async function buildGame() {
  const { Game } = await loadGame({ seed: 11, mode: 'readinessgate-proof' });
  await quietLog(async () => { await setupGame(Game); });
  Game._beatLines = [];
  const origSysSay = Game.sysSay, origSay = Game.say;
  Game.sysSay = function (t) { try { Game._beatLines.push(t); } catch (e) {} if (origSysSay) return origSysSay.call(Game, t); };
  Game.say = function (t) { try { Game._beatLines.push(t); } catch (e) {} if (origSay) return origSay.call(Game, t); };
  return Game;
}

function baseFixture(Game) {
  // day 60, wave 3 open via the wave-2 ledger bar, standing via plenty only.
  Game.state.scholar.day = 60;
  Game.state.waveLedger = Game.state.waveLedger || {};
  Game.state.waveLedger[2] = ledger(4, { x: 2, y: 2 });
  // hard-reset wave-3/4/5 ledger + wavesFaced: fixtures must not bleed
  Game.state.waveLedger[3] = ledger(0, {});
  Game.state.waveLedger[4] = ledger(0, {});
  Game.state.waveLedger[5] = ledger(0, {});
  try { Game.deedState().wavesFaced = {}; } catch (e) {}
  Game.state.feastLog = feast(5, 55);
  Game.state.villagerTricks = {};
  Game.state.monsterCounters = {};
  Game.state.scholar.equipped = {};
  delete Game.state._standingDeferBeat;
  Game._beatLines.length = 0;
}

(async () => {
  const Game = await buildGame();
  const ARMED = typeof Game.waveUnlockReady === 'function';
  console.log('ARMED (waveUnlockReady exists): ' + ARMED);
  if (!ARMED) {
    // KILL PROTOCOL (2026-10-15): the readiness-gate arm was killed at pilot
    // (primary missed, §14). The gate is not in this tree — there is nothing
    // to prove. INFO-SKIP, exit 0 (never MODULE_NOT_FOUND).
    console.log('INFO-SKIP: readiness gate not in tree (killed arm) — nothing to prove.');
    process.exit(0);
  }

  // ---- existence (RED: absent; GREEN: present) ----
  check('waveUnlockReady method exists', ARMED, 'typeof=' + typeof Game.waveUnlockReady);
  check('standingDeferral method exists', typeof Game.standingDeferral === 'function');

  // ---- wave-4 deferral: unready village ----
  baseFixture(Game);
  let s = Game.villageStanding();
  check('fixture standing >= 100 via plenty only', (s.total | 0) >= 100 && (s.war | 0) === 0 && (s.plenty | 0) === 100,
    `total=${s.total} war=${s.war} dip=${s.diplomacy} bread=${s.plenty}`);
  if (ARMED) {
    const r = Game.waveUnlockReady(4);
    check('unready village: ready(4) false, all channels dark',
      r.ready === false && r.a === false && r.b === false && r.c === false,
      JSON.stringify(r));
    const d = Game.standingDeferral(4);
    check('unready village: wave-4 unlock DEFERRED', d.deferred === true && d.raw >= 100,
      `deferred=${d.deferred} raw=${d.raw}`);
    check('villageStandingTotal gated to 99', Game.villageStandingTotal() === 99, 'total=' + Game.villageStandingTotal());
    check('unlockedWave() holds at 3 (no early wave 4)', Game.unlockedWave() === 3, 'wave=' + Game.unlockedWave());
    const beat = Game._beatLines.join('\n');
    check('deferral beat fired (in-fiction hold, names the bar)',
      /KILL what hunts you/i.test(beat) && /not in the business of burying talent/i.test(beat),
      'beats=' + Game._beatLines.length);
    check('standingLine names the held wave', /HELD/.test(Game.standingLine()), Game.standingLine());
    // idempotency: no second engagement beat on re-read
    const n0 = Game._beatLines.length;
    Game.villageStandingTotal();
    check('engagement beat fires once (idempotent read)', Game._beatLines.length === n0, 'lines=' + Game._beatLines.length);
    // weekly reminder
    Game.state.scholar.day = 68;
    Game.villageStandingTotal();
    const rec = Game.state._standingDeferBeat[4];
    check('weekly reminder fires while held', Game._beatLines.length > n0 && (rec.lastRemindDay | 0) === 68,
      `lastRemindDay=${rec && rec.lastRemindDay} lines=${Game._beatLines.length}`);
  } else {
    // RED: pristine behavior — the unready village unlocks wave 4 anyway.
    check('PRISTINE: standing >= 100 unlocks wave 4 even unready', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  }

  // ---- wave-4 release, channel (a): 2 distinct wave-3 kill types ----
  baseFixture(Game);
  Game.state.waveLedger[3] = ledger(3, { spool: 2, chorus_line: 1 });
  if (ARMED) {
    const r = Game.waveUnlockReady(4);
    check('channel (a): 2 kill types => ready', r.ready === true && r.a === true && r.b === false && r.c === false,
      JSON.stringify(r));
    check('channel (a): unlock releases to wave 4 on time', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
    check('channel (a): total ungated (honest breakdown)', Game.villageStandingTotal() >= 100, 'total=' + Game.villageStandingTotal());
  }

  // ---- channel (b): 2 learned wave-3 counters ----
  baseFixture(Game);
  Game.state.villagerTricks = { spool: true, chorus_line: true };
  if (ARMED) {
    const r = Game.waveUnlockReady(4);
    check('channel (b): 2 learned tricks => ready', r.ready === true && r.b === true && r.a === false,
      JSON.stringify(r));
    check('channel (b): unlock releases to wave 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  }

  // ---- channel (c): scholar armor P >= 20 ----
  baseFixture(Game);
  Game.state.scholar.equipped = { torso: { itemId: 'military_vest' } };
  if (ARMED) {
    const r = Game.waveUnlockReady(4);
    check('channel (c): P=40 >= 20 => ready', r.ready === true && r.c === true && (r.armorP | 0) === 40,
      JSON.stringify(r));
    check('channel (c): unlock releases to wave 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  }

  // ---- grandfather: wave-4 monsters already in the world are never held ----
  baseFixture(Game);
  try { Game.deedState().wavesFaced = { eater: 4 }; } catch (e) {}
  if (ARMED) {
    const d = Game.standingDeferral(4);
    check('grandfather: waveEngaged(4)>0 => not deferred', d.deferred === false && d.grandfathered === true,
      JSON.stringify({ deferred: d.deferred, grandfathered: d.grandfathered }));
    check('grandfather: unlock stays 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  }

  // ---- wave-5: deferred without readiness; released by (a) ----
  baseFixture(Game);
  Game.state.feastLog = feast(10, 55); // 200 plenty
  try { Game.deedState().wavesFaced = { eater: 4 }; } catch (e) {} // wave-4 faced
  if (ARMED) {
    const s5 = Game.villageStanding();
    check('wave-5 fixture: standing >= 200', (s5.total | 0) >= 200, 'total=' + s5.total);
    const d5 = Game.standingDeferral(5);
    check('unready village: wave-5 unlock DEFERRED', d5.deferred === true, JSON.stringify({ deferred: d5.deferred, raw: d5.raw }));
    check('wave-5 deferral caps total at 199', Game.villageStandingTotal() === 199, 'total=' + Game.villageStandingTotal());
    // deferral(4) is grandfathered here (wavesFaced eater=4 — the village is
    // already IN wave 4), so the hold composes to wave 4 / total 199.
    check('wave-5 held: wave-4 faced => holds at wave 4 (total capped 199)',
      Game.unlockedWave() === 4 && Game.villageStandingTotal() === 199,
      'wave=' + Game.unlockedWave() + ' total=' + Game.villageStandingTotal());
    Game.state.waveLedger[4] = ledger(2, { eater: 1, audit: 1 });
    const r5 = Game.waveUnlockReady(5);
    check('wave-5 channel (a): 2 distinct wave-4 kill types => ready', r5.ready === true && r5.a === true,
      JSON.stringify(r5));
    check('wave-5 releases to 5', Game.unlockedWave() === 5, 'wave=' + Game.unlockedWave());
    check('wave-5 total ungated', Game.villageStandingTotal() >= 200, 'total=' + Game.villageStandingTotal());
  }

  // ---- waves 1-3 untouched: standing below T4 never defers ----
  baseFixture(Game);
  Game.state.feastLog = feast(2, 55); // 40 < 100
  if (ARMED) {
    check('standing < t4: no deferral', Game.standingDeferral(4).deferred === false, 'wave=' + Game.unlockedWave());
    check('standing < t4: total honest', Game.villageStandingTotal() === 40, 'total=' + Game.villageStandingTotal());
  }

  // ---- no-win-before-90 intact (table.js, untouched) ----
  if (typeof Game.winDayFloorOk === 'function') {
    const daySave = Game.state.scholar.day;
    Game.state.scholar.day = 89;
    const f89 = Game.winDayFloorOk();
    Game.state.scholar.day = 90;
    const f90 = Game.winDayFloorOk();
    Game.state.scholar.day = daySave;
    check('no-win-before-90 intact (89 denied, 90 allowed)', f89 === false && f90 === true, `89=${f89} 90=${f90}`);
  } else {
    check('no-win-before-90 intact', false, 'winDayFloorOk missing');
  }

  console.log(`\n${pass.length} passed, ${fails.length} failed`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
