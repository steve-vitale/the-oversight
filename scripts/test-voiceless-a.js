#!/usr/bin/env node
// test-voiceless-a.js — proof test for the wave-5 armed-shortfall voice
// (arm sim-voiceless-a, run fleshout-20261112T2315Z, axis scale-onramp).
//
// THE GAP (evidence/2026-11-12/sim-pairarming-a.md §2-3): seed 190398
// holds a wave-5 pair for 19 days (d131-149) with armed 3-5 vs demand 6
// and never qualifies; the shortfall is entirely voiceless — nobody in
// the village notices or names the armed shortfall, the scholar dying
// twice, or the shut wave-5 door. A probe on THIS tree found the System
// hold beat fires ZERO times on 190398 (the deferral condition never
// binds there), so the gap is wider than the pairarming finding: no
// voice at all names the wave-5 block.
//
// THE BUILD (src/js/standing.js `_standingShortfallVoice`, hooked from
// game.js `villageBriefing`, scholar memorial in ledger.js
// `playerDeath`): when the wave-5 door is shut by the readiness
// deferral AND a pair holds (veterans >= 2) AND the armed bar is short,
// a living villager says so at the morning briefing in plain words —
// who blooded the beasts, how many hands carry weapons, how many the
// fifth draft waits for. A second line names scholars who died in the
// wild since the last voicing. Cadence: first firing + every 7 days.
// The speaker pick uses a dedicated mulberry32 stream (companionKillBeat
// convention) — the voice never consumes the main Math.random stream.
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. APIs — the methods the voice needs exist on the loaded game.
//   2. Fires under the staged pairarming conditions (deferred + pair
//      held + armed 4 of 6, day 131): returns true, one say line naming
//      both veterans, the armed count, and the demand; no wave-5 title.
//   3. Silence — stays silent when (a) not deferred, (b) armed >= 6,
//      (c) veterans < 2, (d) no living non-scholar speaker, (e) inside
//      the 7-day cadence.
//   4. Scholar churn — the churn line fires only for wild scholar deaths
//      since the last voicing (names them, counts them); deaths older
//      than the 7-day first-firing window and non-wild causes stay
//      unnamed; no death is named twice.
//   5. RNG neutrality — the speaker pick consumes no main-stream
//      Math.random: identical draws with and without the voice firing
//      (two fresh loads, same seed).
//   6. playerDeath memorial — a live scholar death writes the
//      scholar-only memorial entry (day, cause, name) the voice reads.
//   7. Hook — villageBriefing() fires the voice under the staged
//      condition and stays silent without it (the voice is wired, not
//      just written).
//   8. Sense — the fired lines are printed for a human read (MEASUREMENT
//      §4: transcripts over counts).
//
// Usage: node scripts/test-voiceless-a.js
'use strict';
const path = require('path');
const H = require('./sim-harness');

const SEEDS = [7, 42, 99];
let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

// Stage the pairarming conditions on a fresh game: standing capped >= 200
// (ledger wave-3 points 8 x 25 = 200 war), two living wave-4 killers,
// armed count controlled by stripping / handing out weapons.
// opts: { day, armed, veterans, scholarDeaths, roster }
//   armed: number of villagers to arm (0..6+); the scholar stays unarmed.
//   veterans: number of living roster veterans (0..2).
//   scholarDeaths: [{day, cause, name}] written to v.scholarDeaths.
//   roster: 'full' (default) or 'scholar-only'.
function stage(Game, opts) {
  opts = opts || {};
  const st = Game.state;
  const day = opts.day || 131;
  st.scholar.day = day;
  st.systemArrived = true;
  st._standingPeakWave = 0;
  st._shortfallVoice = undefined;
  // Roster: restore the full roster every stage (the scholar-only leg
  // shrinks it; without the restore every later leg would have no
  // speaker and fail for the wrong reason). Kept on the Game object so
  // it never leaks across seeds (a function-static would).
  if (!Game.__voicelessFullRoster) Game.__voicelessFullRoster = (st.village.roster || []).slice();
  st.village.roster = opts.roster === 'scholar-only' ? [Game.villagerId] : Game.__voicelessFullRoster.slice();
  // Standing: war 200 via ledger wave-3 points (8 x 25); no links/feasts.
  const led = Game.ledgerState();
  for (let w = 1; w <= 5; w++) { led[w].points = 0; led[w].perType = {}; led[w].perTypeX = {}; }
  if (opts.deferred !== false) led[3].points = 8;
  // Veterans: wave-4 kills in the log by living roster members.
  st.waveKillLog = [];
  const roster = (st.village.roster || []).filter(id => id !== Game.villagerId);
  const vets = roster.slice(0, opts.veterans == null ? 2 : opts.veterans);
  const mids = ['suburb', 'eulogy'];
  vets.forEach((vid, i) => st.waveKillLog.push({ by: vid, w: 4, mid: mids[i % mids.length], day: day - 1 }));
  // Armed: strip every weapon, then arm exactly opts.armed villagers
  // with a carried stone knife (carried weapons count: standing.js).
  const armedN = opts.armed == null ? 4 : opts.armed;
  const all = (st.village.roster || []).slice();
  all.forEach(vid => {
    if (vid === Game.villagerId) {
      st.scholar.inventory = [];
      st.scholar.equipped = {};
      return;
    }
    let vp = null;
    try { vp = Game.vpOf(vid); } catch (e) { vp = null; }
    if (!vp) return;
    vp.items = [];
    vp.equipped = {};
  });
  for (let i = 0; i < Math.min(armedN, roster.length); i++) {
    const vp = Game.vpOf(roster[i]);
    if (vp) vp.items = [{ itemId: 'stone_knife' }];
  }
  // Scholar deaths memorial (what playerDeath writes).
  st.village.scholarDeaths = (opts.scholarDeaths || []).slice();
  st.monsterCounters = {};
  return { vets, roster };
}

function captureSay(Game) {
  const lines = [];
  const orig = Game.say;
  Game.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string') lines.push(String(arg));
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  return lines;
}

async function oneSeed(seed) {
  console.log('\n== seed ' + seed + ' ==');
  // §1 APIs.
  {
    const { Game } = await H.loadGame({ seed: seed, mode: 'competent', fullTelemetry: false });
    for (const m of ['standingDeferral', 'waveCombatReadiness', 'livingVeteranIds', '_standingShortfallVoice', 'mulberry32', '_hashStr', 'firstRef', 'getPerson', 'playerDeath', 'villageBriefing', 'ledgerState']) {
      check('api ' + m + ' exists', typeof Game[m] === 'function');
    }
  }
  // §2 + §3 + §4 + §7 on one live game, re-staged per leg.
  {
    const { Game } = await H.loadGame({ seed: seed, mode: 'competent', fullTelemetry: false });
    await H.setupGame(Game);
    const lines = captureSay(Game);
    // §2/§3: fires under the pairarming conditions.
    let st = stage(Game, { day: 131, armed: 4, veterans: 2 });
    let def5 = Game.standingDeferral(5);
    let rd5 = Game.waveCombatReadiness(5);
    check('staged: wave-5 deferred', !!(def5 && def5.deferred), JSON.stringify(def5));
    check('staged: pair held (veterans 2)', (rd5 && rd5.veterans) === 2, JSON.stringify(rd5));
    check('staged: armed 4 of 6', rd5 && rd5.armed === 4 && rd5.demand && rd5.demand.armed === 6, JSON.stringify(rd5));
    const before = lines.length;
    const fired = Game._standingShortfallVoice();
    check('voice fires under pairarming conditions', fired === true);
    check('voice emits exactly one line (no churn deaths staged)', lines.length - before === 1, 'emitted ' + (lines.length - before));
    const line = lines[lines.length - 1] || '';
    console.log('  line: ' + line);
    check('line names the armed shortfall (4 of 6)', /only 4 of us carry a weapon/.test(line) && /waits until 6 of us do/.test(line));
    check('line names both veterans by first name', st.vets.every(vid => {
      let fn = null;
      try { fn = Game.firstRef(vid); } catch (e) {}
      return fn && line.indexOf(fn) >= 0;
    }), 'vets=' + JSON.stringify(st.vets.map(vid => { try { return Game.firstRef(vid); } catch (e) { return null; } })));
    check('line never names the wave-5 title', !/Producers/i.test(line));
    check('line is a villager voice, not System voice', !/SYSTEM/i.test(line));
    // Cadence: same day again -> silent.
    const n0 = lines.length;
    check('cadence: silent on a repeat call the same day', Game._standingShortfallVoice() === false && lines.length === n0);
    // Cadence: day +3 -> silent; day +7 -> fires again.
    Game.state.scholar.day = 134;
    check('cadence: silent 3 days later', Game._standingShortfallVoice() === false && lines.length === n0);
    Game.state.scholar.day = 138;
    check('cadence: fires again 7 days later', Game._standingShortfallVoice() === true && lines.length === n0 + 1);
    // §4 silence legs (re-stage each).
    stage(Game, { day: 140, armed: 4, veterans: 2, deferred: false });
    let n = lines.length;
    check('silent (a): not deferred', Game._standingShortfallVoice() === false && lines.length === n);
    stage(Game, { day: 140, armed: 6, veterans: 2 });
    n = lines.length;
    check('silent (b): armed 6 of 6 meets the bar', Game._standingShortfallVoice() === false && lines.length === n);
    stage(Game, { day: 140, armed: 4, veterans: 1 });
    n = lines.length;
    check('silent (c): only 1 veteran, no pair held', Game._standingShortfallVoice() === false && lines.length === n);
    // (d) no living speaker: the condition holds but nobody can say it.
    // A scholar-only roster cannot hold a pair (veterans must be living
    // roster members), so the guard is tested on a fake context whose
    // readiness reads stage the condition while getPerson finds nobody.
    const stD = stage(Game, { day: 140, armed: 4, veterans: 2 });
    n = lines.length;
    const fake = {
      state: Game.state, villagerId: Game.villagerId,
      standingDeferral: () => ({ deferred: true }),
      waveCombatReadiness: () => ({ veterans: 2, armed: 4, demand: { armed: 6 }, short: ['weapons'] }),
      livingVeteranIds: () => stD.vets,
      getPerson: () => null,
      firstRef: Game.firstRef.bind(Game),
      mulberry32: Game.mulberry32.bind(Game),
      _hashStr: Game._hashStr.bind(Game),
      say: (t) => lines.push(String(t)),
      tele: () => {},
    };
    check('silent (d): condition holds but no living speaker', Game._standingShortfallVoice.call(fake) === false && lines.length === n);
    // §4 churn legs.
    stage(Game, {
      day: 140, armed: 4, veterans: 2,
      scholarDeaths: [
        { day: 135, cause: 'the wild', name: 'Kebede Balcha' },
        { day: 138, cause: 'the wild', name: 'Boris Kowalski' },
      ],
    });
    n = lines.length;
    check('churn: fires with wild scholar deaths staged', Game._standingShortfallVoice() === true && lines.length === n + 2, 'emitted ' + (lines.length - n));
    const churn = lines[lines.length - 1] || '';
    console.log('  churn: ' + churn);
    check('churn: names both dead scholars', /Kebede/.test(churn) && /Boris/.test(churn));
    check('churn: counts two', /2 scholars dead in the wild/.test(churn));
    // Same deaths must not be named twice: next firing (day +7) has no
    // new deaths -> one line only.
    Game.state.scholar.day = 147;
    n = lines.length;
    check('churn: no death named twice', Game._standingShortfallVoice() === true && lines.length === n + 1, 'emitted ' + (lines.length - n));
    // Old death (>7d before first firing) stays unnamed.
    stage(Game, {
      day: 160, armed: 4, veterans: 2,
      scholarDeaths: [{ day: 130, cause: 'the wild', name: 'Old Reader' }],
    });
    n = lines.length;
    check('churn: 30-day-old death not re-named on first firing', Game._standingShortfallVoice() === true && lines.length === n + 1, 'emitted ' + (lines.length - n));
    // Non-wild cause stays unnamed.
    stage(Game, {
      day: 170, armed: 4, veterans: 2,
      scholarDeaths: [{ day: 169, cause: 'starvation', name: 'Hungry Scholar' }],
    });
    n = lines.length;
    check('churn: non-wild cause not named', Game._standingShortfallVoice() === true && lines.length === n + 1, 'emitted ' + (lines.length - n));
    // §7 hook: villageBriefing fires the voice under the condition.
    stage(Game, { day: 180, armed: 4, veterans: 2 });
    n = lines.length;
    Game.villageBriefing();
    check('hook: villageBriefing fires the voice', lines.length === n + 1 && /fifth draft waits until 6 of us do/.test(lines[lines.length - 1] || ''), 'emitted ' + (lines.length - n));
    stage(Game, { day: 187, armed: 6, veterans: 2 });
    n = lines.length;
    Game.villageBriefing();
    check('hook: villageBriefing stays silent when armed', lines.length === n);
  }
  // §5 RNG neutrality: two fresh loads, same seed — draws after the voice
  // fires must equal draws with no voice call.
  {
    const a = await H.loadGame({ seed: seed, mode: 'competent', fullTelemetry: false });
    await H.setupGame(a.Game);
    stage(a.Game, { day: 131, armed: 4, veterans: 2 });
    const drawsA = [Math.random(), Math.random(), Math.random(), Math.random()];
    const b = await H.loadGame({ seed: seed, mode: 'competent', fullTelemetry: false });
    await H.setupGame(b.Game);
    stage(b.Game, { day: 131, armed: 4, veterans: 2 });
    captureSay(b.Game);
    const firedB = b.Game._standingShortfallVoice();
    const drawsB = [Math.random(), Math.random(), Math.random(), Math.random()];
    check('RNG: voice fires in the neutrality check', firedB === true);
    check('RNG: main-stream draws identical with/without the voice', drawsA.every((v, i) => v === drawsB[i]), 'A=' + drawsA.join(',') + ' B=' + drawsB.join(','));
  }
  // §6 playerDeath memorial: a live scholar death writes the entry.
  {
    const { Game } = await H.loadGame({ seed: seed, mode: 'competent', fullTelemetry: false });
    await H.setupGame(Game);
    const oldId = Game.villagerId;
    const oldName = ((Game.data.villagers || []).find(x => x.id === oldId) || {}).name || null;
    const day = Game.state.scholar.day || 0;
    const before = ((Game.state.village || {}).scholarDeaths || []).length;
    let threw = null;
    try { Game.playerDeath('the wild'); } catch (e) { threw = e; }
    const list = (Game.state.village || {}).scholarDeaths || [];
    check('memorial: playerDeath does not throw', threw === null, threw && threw.message);
    check('memorial: one entry added', list.length === before + 1, 'before=' + before + ' after=' + list.length);
    const e = list[list.length - 1] || {};
    check('memorial: entry names the dead scholar', e.name === oldName, 'name=' + e.name + ' want=' + oldName);
    check('memorial: entry carries the wild cause + day', e.cause === 'the wild' && e.day === day, JSON.stringify(e));
  }
}

async function main() {
  for (const seed of SEEDS) await oneSeed(seed);
  console.log('\nvoiceless-a: ' + pass + ' passed, ' + fail + ' failed' + (fail ? ' — ' + failures.join('; ') : ''));
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST FAIL', e); process.exit(1); });
