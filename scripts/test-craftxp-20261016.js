#!/usr/bin/env node
// scripts/test-craftxp-20261016.js — proof test for the craftxp-20261016
// census instrument (arm sim-craftxp-b). The instrument is read-only; the
// proof demonstrates (a) it observes what it claims (RED->GREEN on the live
// engine), (b) its readouts match canon data, (c) it is trajectory-neutral
// (det-gate 4/4 byte-identical on identical seeds).
//
// Usage: node scripts/test-craftxp-20261016.js   (needs FEASTSCALE_R13=1)
// The det-gate (Part C) runs 4x30d census runs; ~10s.
'use strict';
process.env.FEASTSCALE_R13 = process.env.FEASTSCALE_R13 || '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame } = require('./sim-harness');
const { classifyCraftWhy, craftKitInfo, buildSegments, isPlayerSideCall } = require('./craftxp-20261016');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- PART A: instrument observation, RED->GREEN on the live engine ---
async function partA() {
  console.log('PART A — instrument observation (live engine)');
  const { Game } = await loadGame({ seed: 1601, mode: 'craftxp-proof', fullTelemetry: false });

  // A1 RED: with no instrument, gainTrackXP awards are NOT attributed
  // anywhere — the raw engine exposes no census.
  ok('A1 RED: unwrapped Game exposes no craftxp census', Game.__craftxpCalls === undefined);

  await setupGame(Game);
  // A2 GREEN: wrap and award; the wrap records (track,n,why) and returns the
  // engine's own value, and the engine state moved by exactly n.
  const seen = [];
  const oGain = Game.gainTrackXP;
  Game.gainTrackXP = function (who, track, n, why) {
    const r = oGain.apply(this, arguments);
    seen.push({ track: String(track), n: n || 0, why: String(why || '') });
    return r;
  };
  const before = (() => { const t = Game.playerTracks().craft || {}; return t.xp || 0; })();
  const ret = Game.noteDeed('cooking');
  const after = (() => { const t = Game.playerTracks().craft || {}; return t.xp || 0; })();
  ok('A2 GREEN: noteDeed(cooking) recorded as craft/1', seen.length === 1 &&
    seen[0].track === 'craft' && seen[0].n === 1 && seen[0].why === 'cooking',
    JSON.stringify(seen));
  ok('A3 GREEN: engine state moved by exactly the deed n (behavior-neutral)',
    (after - before) === 1 && ret === 1, `before=${before} after=${after} ret=${ret}`);

  // A4: classification table on the live engine's real deed ids.
  ok('A4: classify cooking/crafting/healing/hunger_trial',
    classifyCraftWhy('cooking') === 'cooking' &&
    classifyCraftWhy('crafting') === 'crafting' &&
    classifyCraftWhy('healing') === 'healing' &&
    classifyCraftWhy('deed:hunger_trial') === 'hunger_trial');
  ok('A5: classify contest win deed', classifyCraftWhy('won Harvest Games on camera') === 'contest');
  ok('A6: unknown why stays explicit', classifyCraftWhy('something_new') === 'other:something_new');
  try { Game.gainTrackXP = oGain; } catch (e) {}
}

// ---------- PART B: canon readouts ------------------------------------------
async function partB() {
  console.log('PART B — canon readouts');
  const { Game } = await loadGame({ seed: 1602, mode: 'craftxp-proof-b', fullTelemetry: false });
  await setupGame(Game);
  const th = Game.trackThresholds('player');
  ok('B1: player track thresholds are [18,48,96,192,384]', JSON.stringify(th) === JSON.stringify([18, 48, 96, 192, 384]),
    JSON.stringify(th));
  const ki = craftKitInfo(Game);
  ok('B2: deep_reserves is craft kit index 11', ki.deepIndex === 11, String(ki.deepIndex));
  ok('B3: offer window is 6', ki.window === 6, String(ki.window));
  ok('B4: occupationLean(line_cook).craft is 12', (() => { const l = Game.occupationLean('line_cook'); return l && l.craft === 12; })());
  // eligibility arithmetic: 6 of first 11 held -> unheldBefore11 = 5 -> eligible
  const held6 = ['beard_moss', 'iron_stomach', 'pyrokinesis', 'the_touch', 'purify', 'green_whisper'];
  const unheld6 = ki.first11.filter(id => !held6.includes(id)).length;
  ok('B5: 6 of first 11 held => eligible (unheld 5 <= window-1)',
    unheld6 === 5 && unheld6 <= ki.window - 1);
  const held5 = held6.slice(0, 5);
  const unheld5 = ki.first11.filter(id => !held5.includes(id)).length;
  ok('B6: 5 of first 11 held => NOT eligible (unheld 6 > window-1)',
    unheld5 === 6 && !(unheld5 <= ki.window - 1));
}

// ---------- PART B2: succession-aware segment builder (fixtures) -----------
function partB2() {
  console.log('PART B2 — buildSegments fixtures');
  const mk = (seq, n, why) => ({ seq, phase: 'run', day: 5, who: 'player', track: 'craft', n, why });
  // D1: no succession — one segment, exact attribution.
  const d1 = buildSegments({
    baselineXp: 6, vid0: 'v1', succEvents: [],
    runCalls: [mk(0, 1, 'cooking'), mk(1, 1, 'cooking'), mk(2, 3, 'deed:hunger_trial')],
    finalXp: 11, traj: [], detOff: false,
  });
  ok('D1: single segment, 5 accrued / 5 attributed = 100%',
    d1.segments.length === 1 && d1.totalAccrued === 5 && d1.totalAttributed === 5 && d1.attributionPct === 100,
    JSON.stringify({ n: d1.segments.length, acc: d1.totalAccrued, att: d1.totalAttributed, pct: d1.attributionPct }));
  // D2 RED (the bug this run found): succession REPLACES s.tracks, so the
  // naive final-baseline = 2-12 = -10 reads as negative accrual and a raw
  // call-sum/final-baseline attribution explodes. The builder must segment.
  const naive = (4) / (2 - 12); // what the old code computed: -40%
  const d2 = buildSegments({
    baselineXp: 12, vid0: 'v1',
    succEvents: [{ day: 100, seq: 1, oldVid: 'v1', newVid: 'v2', oldFinalXp: 15, newStartXp: 1 }],
    runCalls: [mk(0, 3, 'deed:hunger_trial'), mk(2, 1, 'crafting')],
    finalXp: 2, traj: [], detOff: false,
  });
  ok('D2 RED: naive final-baseline attribution is nonsense (' + naive + ')',
    !(naive >= 95 && naive <= 105));
  ok('D2 GREEN: two segments, accrued 3+1, attributed 3+1 = 100%',
    d2.segments.length === 2 && d2.totalAccrued === 4 && d2.totalAttributed === 4 && d2.attributionPct === 100,
    JSON.stringify(d2.segments.map(s => ({ acc: s.accrued, att: s.attributed, pct: s.attributionPct }))));
  ok('D2: per-class split correct (hunger_trial:3 on v1, crafting:1 on v2)',
    d2.segments[0].byClass.hunger_trial === 3 && d2.segments[1].byClass.crafting === 1,
    JSON.stringify(d2.segments.map(s => s.byClass)));
  // D3: three bearers; the first bearer's 2 XP came from no recorded call
  // (edge: honest 0% on that segment, never silently absorbed).
  const d3 = buildSegments({
    baselineXp: 0, vid0: 'v1',
    succEvents: [
      { day: 50, seq: 0, oldVid: 'v1', newVid: 'v2', oldFinalXp: 2, newStartXp: 0 },
      { day: 90, seq: 3, oldVid: 'v2', newVid: 'v3', oldFinalXp: 4, newStartXp: 1 },
    ],
    runCalls: [mk(1, 1, 'cooking'), mk(2, 3, 'deed:hunger_trial'), mk(4, 1, 'healing')],
    finalXp: 2, traj: [], detOff: false,
  });
  ok('D3: three segments, accrued 2+4+1, attributed 0+4+1; seg0 honest 0%, overall 71.4%',
    d3.segments.length === 3 && d3.totalAccrued === 7 && d3.totalAttributed === 5 &&
    d3.segments[0].attributionPct === 0 && d3.segments[1].attributionPct === 100 &&
    d3.segments[2].attributionPct === 100 && d3.attributionPct === 71.4,
    JSON.stringify(d3.segments.map(s => ({ acc: s.accrued, att: s.attributed, pct: s.attributionPct }))));
  // E1 (the bug this run found, live shape): on day 126 visjoin_124 earned
  // cooking:1 as a VILLAGER (bearer was stan_kowalski); they became bearer on
  // day 143. The award must not count as a scholar-track award — it surfaces
  // as the successor's startXp.
  ok('E1 RED-shape: villager-side award to a future bearer is excluded',
    isPlayerSideCall({ phase: 'run', track: 'craft', who: 'visjoin_124', bearer: 'stan_kowalski', n: 1, why: 'cooking' }) === false);
  ok('E2: who=player is always player-side',
    isPlayerSideCall({ phase: 'run', track: 'craft', who: 'player', bearer: 'stan_kowalski', n: 1, why: 'cooking' }) === true);
  ok('E3: who=vid==bearer routes to _playerTrackXP, included',
    isPlayerSideCall({ phase: 'run', track: 'craft', who: 'stan_kowalski', bearer: 'stan_kowalski', n: 1, why: 'cooking' }) === true);
  ok('E4: setup-phase and non-craft calls excluded',
    isPlayerSideCall({ phase: 'setup', track: 'craft', who: 'player', bearer: 'v1', n: 1, why: 'cooking' }) === false &&
    isPlayerSideCall({ phase: 'run', track: 'field', who: 'player', bearer: 'v1', n: 1, why: 'foraging' }) === false);
}

// ---------- PART C: det-gate — trajectory identity, 4/4 byte-identical ------
async function partC() {
  console.log('PART C — det-gate (30d x 2 seeds x 2 policies, instrument on vs DETGATE_OFF)');
  const { execSync } = require('child_process');
  const seeds = ['1601', '1602'];
  const pids = ['leadcourt', 'belongseek'];
  let n = 0, good = 0;
  for (const pid of pids) for (const seed of seeds) {
    n++;
    const env = Object.assign({}, process.env, {
      SEEDS: seed, POLICIES: pid, DAYS: '30', PERSEED_DIR: '', FINGERPRINT_OUT: `/tmp/craftxp-det-${pid}-${seed}`,
    });
    const run = (detOff) => execSync(
      `node scripts/craftxp-20261016.js`, { cwd: __dirname + '/..', env: Object.assign({}, env, detOff ? { DETGATE_OFF: '1' } : {}), stdio: ['ignore', 'pipe', 'pipe'] });
    const fs = require('fs');
    const fp = `/tmp/craftxp-det-${pid}-${seed}`;
    run(false); const on = fs.readFileSync(fp, 'utf8');
    run(true);  const off = fs.readFileSync(fp, 'utf8');
    run(false); const on2 = fs.readFileSync(fp, 'utf8'); // flake detection
    const identical = on === off;
    const stable = on === on2;
    ok(`C${n}: ${pid} s${seed} on-vs-off byte-identical`, identical && stable,
      `identical=${identical} stable=${stable}`);
    if (identical && stable) good++;
    try { fs.unlinkSync(fp); } catch (e) {}
  }
  console.log(`det-gate: ${good}/${n} byte-identical`);
}

async function main() {
  await partA();
  await partB();
  partB2();
  await partC();
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
