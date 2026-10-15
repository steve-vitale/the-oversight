#!/usr/bin/env node
'use strict';
// scripts/test-standing-20261015.js — proof test for the standing-economy
// census instrument (scripts/standing-lib-20261015.js +
// scripts/standing-census-20261015.js), and for the PART A defer-beat
// prose rewrite (the wave-4 title must not be named before it is earned).
//
// Proves:
//   1. Pure census on constructed rows: shares/dominantSource/unlockRow/
//      gainTrace/censusRun/censusRoad/censusGo classify correctly.
//   2. Engine-read equivalence: the census sampler is wave4gate's
//      sampleGate (proven engine-read-equivalent); repeated reads of one
//      live state agree, and a run record assembled from live engine
//      samples attributes 100%.
//   3. Defer-beat knowledge gate (prose-only, no mechanics): pre-wave-3
//      the beat names neither "Mirror Draft" nor "Final Draft" (uses "the
//      next act"); post-wave-3 pre-wave-4 it names "the Final Draft" but
//      still never "Mirror Draft". The faced-experience bar and the
//      holding behavior are unchanged (29/29 readiness tests already pin
//      that — this test pins the words).
const assert = require('assert');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const G = require('./standing-lib-20261015');
const WG = require('./wave4gate-lib-20261015');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; failures.push(name + ' — ' + detail); console.log(`  FAIL ${name} — ${detail}`); }
}

function row(day, o) {
  return Object.assign({ day, gameDay: day, uw: 3, pts1: 5, pts2: 4,
    raw: 0, gated: 0, capped: 0, war: 0, diplomacy: 0, plenty: 0,
    warPts: 0, links: 0, feasts: 0, engaged3: 3, engaged4: 0,
    peak: 0, cfg: { bar2: 4, dN: 25, t4: 100, t5: 200, readyFacedW3: 3, readyFacedW4: 2 } }, o);
}
function runRec(seed, policyId, rows, unlockDay) {
  return { seed, policyId, gameDays: 180, endReason: 'horizon',
    rows, unlockDay, classification: { w4: { binding: 'unlocked' }, w5: { binding: 'unlocked' } },
    scaleRank: 'village', tableEver: false };
}

function setLedger(Game, wave, points, ids) {
  Game.ledgerState();
  const perType = {};
  let left = points;
  for (const id of ids) { const give = Math.min(2, left); perType[id] = give; left -= give; if (left <= 0) break; }
  Game.state.waveLedger[wave] = { points, perType, perTypeX: {} };
}
function setFeasts(Game, n) {
  Game.state.feastLog = [];
  for (let i = 0; i < n; i++) Game.state.feastLog.push({ day: 20 + i, quality: 1 });
}

(async () => {
  await quietLog(async () => {
    console.log('== pure census (constructed rows) ==');
    // shares: exact fractions, and unattributable on raw=0
    {
      const sh = G.shares(row(50, { raw: 202, war: 100, diplomacy: 102, plenty: 0 }));
      check('shares war 100/202', Math.abs(sh.war - 100 / 202) < 1e-9, JSON.stringify(sh));
      check('shares dip 102/202', Math.abs(sh.diplomacy - 102 / 202) < 1e-9, JSON.stringify(sh));
      check('shares attributable', sh.attributable === true, JSON.stringify(sh));
      const sh0 = G.shares(row(50, { raw: 0 }));
      check('shares raw=0 unattributable', sh0.attributable === false, JSON.stringify(sh0));
      check('shares bread 100%', G.shares(row(50, { raw: 100, plenty: 100 })).plenty === 1, 'bread');
    }
    // dominantSource: majority vs hybrid vs unattributable
    {
      check('dominant dip (50.5% majority)', G.dominantSource(G.shares(row(1, { raw: 202, war: 100, diplomacy: 102, plenty: 0 }))) === 'diplomacy', 'war 49.5%/dip 50.5%');
      check('dominant bread', G.dominantSource(G.shares(row(1, { raw: 100, plenty: 100 }))) === 'plenty', 'bread');
      check('dominant dip', G.dominantSource(G.shares(row(1, { raw: 102, diplomacy: 102 }))) === 'diplomacy', 'dip');
      check('dominant hybrid', G.dominantSource(G.shares(row(1, { raw: 100, war: 40, diplomacy: 30, plenty: 30 }))) === 'hybrid', '40/30/30');
      check('dominant unattributable', G.dominantSource(G.shares(row(1, { raw: 0 }))) === 'unattributable', 'zero');
      check('dominant majority war', G.dominantSource(G.shares(row(1, { raw: 200, war: 150, plenty: 50 }))) === 'war', '75% war');
    }
    // unlockRow: closest row at-or-before unlock day
    {
      const rows = [row(50), row(55, { uw: 4 }), row(60, { uw: 4 })];
      const u = G.unlockRow(runRec(11, 'belongfeast', rows, { 4: 55 }));
      check('unlockRow picks d55', u && u.gameDay === 55, 'got ' + (u && u.gameDay));
      const u2 = G.unlockRow(runRec(11, 'leadfeast', rows, {})); // no unlockDay -> first uw>=4
      check('unlockRow falls back to first uw>=4 row', u2 && u2.gameDay === 55, 'got ' + (u2 && u2.gameDay));
    }
    // gainTrace: per-day deltas between consecutive rows
    {
      const rows = [row(50, { raw: 40, plenty: 40 }), row(55, { raw: 100, plenty: 100, feasts: 5 })];
      const tr = G.gainTrace(runRec(11, 'belongfeast', rows, { 4: 55 }));
      check('gainTrace one interval', tr.length === 1, 'len=' + tr.length);
      check('gainTrace dPlenty=12/day', Math.abs(tr[0].dPlenty - 12) < 1e-9, JSON.stringify(tr[0]));
      check('gainTrace dWar=0', tr[0].dWar === 0, JSON.stringify(tr[0]));
    }
    // censusRun: bread road — 5 feasts unlocks w4, cap binds w5
    {
      const rows = [
        row(50, { raw: 40, plenty: 40, feasts: 2, engaged3: 1 }),
        row(55, { raw: 100, plenty: 100, feasts: 5, engaged3: 3, uw: 4, gated: 100 }),
        row(120, { raw: 290, plenty: 240, feasts: 12, engaged3: 3, uw: 4, gated: 199, capped: 199 }),
      ];
      const cr = G.censusRun(runRec(44, 'belongfeast', rows, { 4: 55 }));
      check('censusRun w4 unlocked d55', cr.w4.unlocked && cr.w4.day === 55, JSON.stringify(cr.w4.day));
      check('censusRun dominant=plenty', cr.w4.dominant === 'plenty', cr.w4.dominant);
      check('censusRun feasts@unlock=5', cr.w4.feastsAtUnlock === 5, 'got ' + cr.w4.feastsAtUnlock);
      check('censusRun cap event at d120 (gated-at-199)', cr.capEvents.length === 1 && cr.capEvents[0].raw === 290 && cr.capEvents[0].capped === 199, JSON.stringify(cr.capEvents));
      check('censusRun capBoundW5', cr.capBoundW5 === true, 'capBoundW5=' + cr.capBoundW5);
    }
    // censusRun: war road — blood unlocks both
    {
      const rows = [
        row(90, { raw: 100, war: 100, warPts: 4, engaged3: 3, uw: 4, gated: 100 }),
        row(130, { raw: 225, capped: 225, war: 125, warPts: 5, engaged3: 3, engaged4: 2, uw: 5, gated: 225 }),
      ];
      const cr = G.censusRun(runRec(88, 'leadfeast', rows, { 4: 90, 5: 130 }));
      check('censusRun war road dominant=war', cr.w4.dominant === 'war', cr.w4.dominant);
      check('censusRun war road w5 unlocked', cr.w5.unlocked && cr.w5.day === 130, JSON.stringify(cr.w5));
      check('censusRun war road no cap events', cr.capEvents.length === 0, 'cap=' + cr.capEvents.length);
    }
    // censusRoad: aggregate — days-to-w4, shares, feasts median
    {
      const runs = [
        runRec(11, 'belongfeast', [row(40, { raw: 100, plenty: 100, feasts: 5, uw: 4 })], { 4: 43 }),
        runRec(22, 'belongfeast', [row(50, { raw: 100, plenty: 100, feasts: 6, uw: 4 })], { 4: 55 }),
        runRec(33, 'belongfeast', [row(90, { raw: 100, plenty: 100, feasts: 9, uw: 4 })], { 4: 92 }),
        runRec(44, 'belongfeast', [row(40, { raw: 20, plenty: 20, feasts: 1 })], {}), // died, no unlock
      ];
      const rd = G.censusRoad(runs, 'belongfeast');
      check('censusRoad w4 3/4', rd.w4Unlock === 3, 'got ' + rd.w4Unlock);
      check('censusRoad days-to-w4 [43,55,92]', JSON.stringify(rd.w4Days) === '[43,55,92]', JSON.stringify(rd.w4Days));
      check('censusRoad median 55', rd.w4Median === 55, 'got ' + rd.w4Median);
      check('censusRoad bread share mean 100%', Math.abs(rd.shareMeanAtUnlock.plenty - 1) < 1e-9, JSON.stringify(rd.shareMeanAtUnlock));
      check('censusRoad feasts median 6', rd.feastsMedian === 6, 'got ' + rd.feastsMedian);
      check('censusRoad attribution 100%', rd.attributionRate === 1, 'got ' + rd.attributionRate);
    }
    // censusGo: GO on full attribution, MISS on gap
    {
      const ok = runRec(11, 'belongfeast', [row(50, { raw: 100, plenty: 100, uw: 4 })], { 4: 55 });
      check('censusGo GO', G.censusGo([ok]).go === true, JSON.stringify(G.censusGo([ok])));
      const bad = runRec(22, 'leadfeast', [row(50, { uw: 4 })], { 4: 55 }); // unlocked but raw=0 -> unattributable
      const go2 = G.censusGo([ok, bad]);
      check('censusGo MISS on unattributed unlock', go2.go === false && go2.misses.length === 1 && go2.misses[0].miss === 'unattributed-unlock', JSON.stringify(go2));
    }

    console.log('== engine-read equivalence ==');
    // The census sampler IS wave4gate's sampleGate (same reference) — assert
    // the identity, then prove determinism + attribution on a live state.
    check('sampler identity: G.sampleGate === WG.sampleGate', G.sampleGate === WG.sampleGate, 'not identical');
    check('classifier identity: G.classifyGate === WG.classifyGate', G.classifyGate === WG.classifyGate, 'not identical');
    {
      const { Game } = await loadGame({ seed: 7, mode: 'standecon-test' });
      await setupGame(Game);
      Game.state.scholar.day = 30;
      setLedger(Game, 2, 4, ['x', 'y']);
      setFeasts(Game, 5);
      try { Game.deedState().wavesFaced = { redactor: 3, gavel: 3, spool: 3 }; } catch (e) {}
      const a = G.sampleGate(Game);
      const b = G.sampleGate(Game);
      check('sampler deterministic across repeated reads',
        JSON.stringify(a) === JSON.stringify(b), 'differs');
      check('sampler reads the 5-feast breakdown (war 0 / dip 0 / plenty 100)',
        a.war === 0 && a.diplomacy === 0 && a.plenty === 100 && a.raw === 100,
        `war=${a.war} dip=${a.diplomacy} pl=${a.plenty} raw=${a.raw}`);
      check('sampler gated releases to 100 with faced bar met', a.gated === 100 && a.uw === 4, `gated=${a.gated} uw=${a.uw}`);
      // a run record assembled from engine samples attributes 100%
      const rec = runRec(7, 'belongfeast', [
        Object.assign(a, { gameDay: 30 }),
        Object.assign(G.sampleGate(Game), { gameDay: 35 }),
      ], { 4: 30 });
      const cr = G.censusRun(rec);
      check('engine-sampled record attributes 100% (dominant=plenty)',
        cr.w4.unlocked && cr.w4.dominant === 'plenty' && cr.w4.shares.attributable,
        JSON.stringify(cr.w4));
    }

    console.log('== defer-beat knowledge gate (prose rewrite, SENSE-TESTING) ==');
    // Pre-wave-3: deferral binds on the bread road (raw>=t4 early). The
    // beat must name NEITHER "Mirror Draft" (wave 4, unearned) NOR "Final
    // Draft" (wave 3, unearned) — "the next act" discipline.
    {
      const { Game } = await loadGame({ seed: 9, mode: 'standecon-beat1' });
      await setupGame(Game);
      Game._beatLines = [];
      Game.sysSay = function (t) { try { Game._beatLines.push(String(t)); } catch (e) {} };
      Game.state.scholar.day = 20; // < dN(25): wave 3 not earned
      setLedger(Game, 2, 4, ['x', 'y']);
      setFeasts(Game, 5); // raw = 100 >= t4
      try { Game.deedState().wavesFaced = {}; } catch (e) {}
      const tot = Game.villageStandingTotal(); // fires the hold beat
      const beat = Game._beatLines.join('\n');
      check('pre-w3: defer hold bites (total 99)', tot === 99, 'total=' + tot);
      check('pre-w3: beat fired', /not for strangers/i.test(beat), 'no beat');
      check('pre-w3: does NOT name "Mirror Draft"', !/mirror draft/i.test(beat), beat.slice(0, 120));
      check('pre-w3: does NOT name "Final Draft"', !/final draft/i.test(beat), beat.slice(0, 120));
      check('pre-w3: uses "the next act"', /next act/i.test(beat), beat.slice(0, 120));
      check('pre-w3: keeps the faced bar ("more than one kind")', /more than one kind/i.test(beat), beat.slice(0, 120));
    }
    // Post-wave-3 pre-wave-4: may name "the Final Draft" (earned), never "Mirror Draft".
    {
      const { Game } = await loadGame({ seed: 10, mode: 'standecon-beat2' });
      await setupGame(Game);
      Game._beatLines = [];
      Game.sysSay = function (t) { try { Game._beatLines.push(String(t)); } catch (e) {} };
      Game.state.scholar.day = 66; // >= dN, pts2=4: wave 3 earned
      setLedger(Game, 2, 4, ['x', 'y']);
      setFeasts(Game, 5);
      try { Game.deedState().wavesFaced = { redactor: 3 }; } catch (e) {} // 1/3 faced: defer binds
      const tot = Game.villageStandingTotal();
      const beat = Game._beatLines.join('\n');
      check('post-w3: defer hold bites (total 99)', tot === 99, 'total=' + tot);
      check('post-w3: beat names "the Final Draft" (earned)', /final draft/i.test(beat), beat.slice(0, 160));
      check('post-w3: still never names "Mirror Draft"', !/mirror draft/i.test(beat), beat.slice(0, 160));
    }
    // The old text is gone from the codebase path that fired it.
    {
      const { Game } = await loadGame({ seed: 11, mode: 'standecon-beat3' });
      await setupGame(Game);
      Game._beatLines = [];
      Game.sysSay = function (t) { try { Game._beatLines.push(String(t)); } catch (e) {} };
      Game.state.scholar.day = 66;
      setLedger(Game, 2, 4, ['x', 'y']);
      setFeasts(Game, 5);
      try { Game.deedState().wavesFaced = { redactor: 3, gavel: 3 }; } catch (e) {} // 2/3: defer binds
      Game._beatLines.length = 0;
      Game.villageStandingTotal();
      const firstBeat = Game._beatLines.join('\n');
      Game._beatLines.length = 0;
      // reminder path (>7 days later): force by backdating the beat marker
      try { Game.state._standingDeferBeat[4] = 50; } catch (e) {}
      Game.villageStandingTotal();
      const reminder = Game._beatLines.join('\n');
      check('reminder names the count (f of n)', /2 of 3/i.test(reminder), reminder.slice(0, 160));
      check('reminder never names "Mirror Draft"', !/mirror draft/i.test(reminder), reminder.slice(0, 160));
      void firstBeat;
    }
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) console.log('FAILURES:\n  - ' + failures.join('\n  - '));
  if (fail) process.exit(1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
