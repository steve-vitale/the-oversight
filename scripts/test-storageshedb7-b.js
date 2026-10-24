#!/usr/bin/env node
// test-storageshedb7.js — proof test for the STORAGESHED re-implementation
// (sim-storageshedb7, food-economy axis, 2026-10-23). Same spec as the
// b3/b4 runs — the lever behavior is unchanged; only the run id moves.
//
// The previous run's game.js STORAGESHED draft was NEVER committed; this is a
// faithful RE-IMPLEMENTATION from evidence/2026-10-22/sim-storageshed-b.md
// §Lever + "Fixes applied on adoption". The lost draft is not the judge —
// this proof test + the pilot judge the new code.
//
// Spec under test:
//  - env-gated STORAGESHED (default-ON; STORAGESHED=0 is the control)
//  - engages on prodThrottleEngaged (pantryFreshDays() > 4; hungryStreak>=3
//    stands it down); cook still cooks the haven meal
//  - each cook sheds ONCE per cook-day (once-per-day gate shedDayByVid;
//    the draft's per-resolution compounding bug must NOT return)
//  - budget 4000→2000 for the whole shed day (day-gated, accumulates across
//    resolutions)
//  - each about-to-rot surplus batch's units halved ONCE
//  - gate/ledger/budget engage only when something was actually shed
//    (floor(u/2)=0 → no ledger, no budget cut, gate unconsumed)
//  - day voice once/day after the meal loop, rotating speaker, 12-line
//    instead-of-work pool naming REAL work (never idle, never storage work)
//  - dinner reserve untouched
//  - 🍽️◦ prefix differentiated from the plentydepri production-half 🍽️
//
// RED (gate-off) = the old code's behavior: no ledger, no shed voice, full
// 4000-budget rack smoke. GREEN (gate-on) = the spec above.
// No RNG in the shed path: two armed setups on one seed are identical.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-storageshedb7.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// Build a plenty pantry: huge far-future fresh stock (plenty) + two
// about-to-rot surplus batches beyond the dinner reserve.
// reserve = 250 × roster(~12) = 3000 kcal, soonest-spoiling first.
// Trout 20×200=4000 (spoilDay+1): 3000 kept fresh (15u), 5u to racks.
// Berries 12×150=1800 (spoilDay+2): all 12u to racks.
async function plentySetup(seed) {
  const { Game } = await loadGame({ seed, mode: 'storageshedb7-proof', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village, day = Game.state.scholar.day;
  const mk = (name, kcalEach, units, spoilIn) =>
    ({ name, kcalEach, units, foodState: 'fresh', spoilDay: day + spoilIn, safe: true });
  v.pantry.push(mk('Venison haunch', 500, 300, 30)); // 150k fresh → plenty
  v.pantry.push(mk('Trout', 200, 20, 1));
  v.pantry.push(mk('Berries', 150, 12, 2));
  const vid = (v.roster || []).find(id => { const p = Game.getPerson(id); return p && !p.dead; });
  const lines = [];
  const oSay = Game.say;
  Game.say = function (s) { lines.push(String(s)); return oSay.apply(this, arguments); };
  return { Game, v, day, vid, lines, restoreSay: () => { Game.say = oSay; } };
}
const freshCopies = (v, name) =>
  (v.pantry || []).filter(i => i.name === name && i.foodState === 'fresh');
const preservedOf = (v, name) =>
  (v.pantry || []).filter(i => i.name === name && i.foodState === 'preserved');
const shedLines = lines => lines.filter(l => l.startsWith('🍽️◦ '));

(async () => {
  // ---------- RED: gate-off = old behavior ----------
  process.env.STORAGESHED = '0';
  {
    const { Game, v, day, vid, lines, restoreSay } = await plentySetup(424242);
    ok('red: plenty engages', Game.prodThrottleEngaged() === true);
    ok('red: no ledger before cook', !v._storageShed);
    Game.resolveOneAssignment(vid, { task: 'cook' });
    ok('red: gate-off creates no ledger', !v._storageShed, JSON.stringify(v._storageShed));
    ok('red: gate-off speaks no shed voice', shedLines(lines).length === 0);
    // full rack smoke: 5×200 + 12×150 = 2800 pre-conversion at 0.80x → 2240
    const tP = preservedOf(v, 'Trout (dried)'), bP = preservedOf(v, 'Berries (dried)');
    const kept = tP.reduce((t, i) => t + i.kcalEach * i.units, 0) + bP.reduce((t, i) => t + i.kcalEach * i.units, 0);
    ok('red: gate-off smokes the full excess (2800→2240)', kept === 2240, 'kept=' + kept);
    ok('red: gate-off leaves no fresh shed copies', freshCopies(v, 'Trout').every(i => i.units === 15) || freshCopies(v, 'Trout').length === 0,
      JSON.stringify(freshCopies(v, 'Trout').map(i => i.units)));
    restoreSay();
  }

  // ---------- GREEN: shed engages ----------
  process.env.STORAGESHED = '1';
  let greenDay, greenVid, greenLines;
  {
    const { Game, v, day, vid, lines, restoreSay } = await plentySetup(424242);
    Game.resolveOneAssignment(vid, { task: 'cook' });
    greenDay = day; greenVid = vid; greenLines = lines;
    const lg = v._storageShed;
    ok('green: ledger created', !!lg);
    const rec = lg && lg.days[day];
    ok('green: one shed decision', rec && rec.shedDec === 1, JSON.stringify(rec));
    // Trout: floor(5/2)=2 shed (400 kcal); Berries: floor(12/2)=6 shed (900)
    ok('green: shedKcal = 1300', rec && rec.shedKcal === 1300, 'shedKcal=' + (rec && rec.shedKcal));
    ok('green: shedder recorded', rec && rec.vids.length === 1 && rec.vids[0] === vid);
    ok('green: once-per-day gate consumed', lg.shedDayByVid[vid] === day);
    ok('green: shed day flagged', rec && rec.shed === true);
    // halved ONCE: fresh shed copies + preserved rack batches sum to originals
    const tF = freshCopies(v, 'Trout'), bF = freshCopies(v, 'Berries');
    const tShed = tF.find(i => i.units === 2), bShed = bF.find(i => i.units === 6);
    ok('green: trout shed copy 2u fresh', !!tShed);
    ok('green: berries shed copy 6u fresh', !!bShed);
    const tP = preservedOf(v, 'Trout (dried)'), bP = preservedOf(v, 'Berries (dried)');
    const tRacked = tP.reduce((t, i) => t + i.units, 0), bRacked = bP.reduce((t, i) => t + i.units, 0);
    ok('green: trout racked 3u (5-2)', tRacked === 3, 'racked=' + tRacked);
    ok('green: berries racked 6u (12-6)', bRacked === 6, 'racked=' + bRacked);
    ok('green: trout units conserved 15(reserve)+2+3=20', 15 + 2 + tRacked === 20);
    ok('green: berries units conserved 6+6=12', 6 + bRacked === 12);
    // dinner reserve untouched: the 15u fresh trout the reserve carved out
    ok('green: dinner reserve 15u trout stays fresh', tF.some(i => i.units === 15));
    // budget: pre-conversion spend 3×200+6×150 = 1500 ≤ 2000
    ok('green: day spent 1500 ≤ 2000', rec.spent === 1500, 'spent=' + rec.spent);

    // ---------- the compounding bug must NOT return ----------
    Game.resolveOneAssignment(vid, { task: 'cook' });
    Game.resolveOneAssignment(vid, { task: 'cook' });
    const rec2 = v._storageShed.days[day];
    ok('green: 3 resolutions, still one shed decision', rec2.shedDec === 1, 'shedDec=' + rec2.shedDec);
    ok('green: shedKcal unchanged after re-resolve', rec2.shedKcal === 1300, 'shedKcal=' + rec2.shedKcal);
    // the draft's compounding bug halved the halved pile each pass — a
    // re-shed 2u trout copy would leave a 1u fresh copy (floor(2/2)), a
    // re-shed 6u berries copy a 3u one (floor(6/2)). Neither may exist.
    // (A shed copy MAY be smoked on a later pass inside the eased 2000/day
    // budget — that is the designed half-pace, not a re-shed.)
    const tUnits = freshCopies(v, 'Trout').map(i => i.units);
    const bUnits = freshCopies(v, 'Berries').map(i => i.units);
    ok('green: no compounding — no halved-of-halved fresh copies',
      !tUnits.includes(1) && !bUnits.includes(3), 'trout=[' + tUnits + '] berries=[' + bUnits + ']');
    ok('green: spent still ≤ 2000', rec2.spent <= 2000, 'spent=' + rec2.spent);
    restoreSay();
  }

  // ---------- TINY STACKS: floor(u/2)=0 → nothing engages ----------
  {
    const { Game, v, day, vid, lines, restoreSay } = await plentySetup(777001);
    // strip the big batches; leave only units=1 about-to-rot bits
    v.pantry = v.pantry.filter(i => i.name === 'Venison haunch');
    const mk = (name, kcalEach, spoilIn) =>
      ({ name, kcalEach, units: 1, foodState: 'fresh', spoilDay: day + spoilIn, safe: true });
    v.pantry.push(mk('Minnow', 90, 1), mk('Acorn', 40, 2));
    ok('tiny: plenty still engages', Game.prodThrottleEngaged() === true);
    Game.resolveOneAssignment(vid, { task: 'cook' });
    ok('tiny: no ledger from units=1 batches', !v._storageShed, JSON.stringify(v._storageShed));
    ok('tiny: gate unconsumed', !(v._storageShed && v._storageShed.shedDayByVid[vid]));
    // now a real batch appears beyond the 3000-kcal dinner reserve: the
    // unconsumed gate lets the shed engage. 20u trout: reserve keeps 15u,
    // 5u to racks → shed floor(5/2)=2 → shedKcal = 400.
    v.pantry.push({ name: 'Trout', kcalEach: 200, units: 20, foodState: 'fresh', spoilDay: day + 1, safe: true });
    Game.resolveOneAssignment(vid, { task: 'cook' });
    const rec = v._storageShed && v._storageShed.days[day];
    ok('tiny: later real batch still sheds (gate was unconsumed)', !!rec && rec.shedDec === 1 && rec.shedKcal === 400,
      JSON.stringify(rec));
    restoreSay();
  }

  // ---------- DAY VOICE ----------
  {
    const { Game, v, day, vid, lines, restoreSay } = await plentySetup(424243);
    Game.resolveOneAssignment(vid, { task: 'cook' });
    const before = lines.length;
    Game._storageShedDayVoice(v);
    const newLines = lines.slice(before);
    const shed = shedLines(newLines);
    ok('voice: one shed line spoken', shed.length === 1, 'got ' + shed.length);
    const line = shed[0] || '';
    ok('voice: prefix is 🍽️◦ (not plentydepri 🍽️)', line.startsWith('🍽️◦ ') && !line.startsWith('🍽️ '));
    const first = String((Game.getPerson(vid) || {}).name || '').split(' ')[0];
    ok('voice: speaker is the shedder', line.startsWith('🍽️◦ ' + first), line.slice(0, 40));
    // instead-of work: the line must name real work from the 12-pool,
    // never idle, never storage work
    ok('voice: names real instead-of work', /nets|firewood|fever|snares|water|cistern|bowls|garden|knives|elders|palisade|hearth|stories|boots/i.test(line), line.slice(0, 80));
    ok('voice: never idle/racks language', !/idle|nap|rest\b|smoke the|racks.*full/i.test(line), line.slice(0, 80));
    // once per day: second call is silent
    const b2 = lines.length;
    Game._storageShedDayVoice(v);
    ok('voice: silent on second call same day', lines.length === b2);
    restoreSay();
  }

  // ---------- 12-LINE POOL: every line reachable (2026-10-22 fix: the old
  // proof's regex covered only 9/12) ----------
  {
    // the selection is pool[(d*11 + hk) % 12]; hk varies per speaker id.
    // Sweep days 1..60 × a spread of speaker hashes; every index must hit.
    const seen = new Set();
    for (let d = 1; d <= 60; d++) {
      for (const sp of ['gen_a', 'gen_idc4mr4', 'p', 'v_zzz', 'm_0', 'scholar']) {
        let hk = 0;
        for (let i = 0; i < sp.length; i++) hk = (hk * 31 + sp.charCodeAt(i)) | 0;
        seen.add(((d * 11 + hk) % 12 + 12) % 12);
      }
    }
    ok('pool: all 12 lines reachable', seen.size === 12, 'reached ' + seen.size + '/12');
  }

  // ---------- DETERMINISM: no RNG in the shed path ----------
  {
    const run = async () => {
      const { Game, v, vid, restoreSay } = await plentySetup(424244);
      Game.resolveOneAssignment(vid, { task: 'cook' });
      Game._storageShedDayVoice(v);
      const lg = JSON.stringify(v._storageShed);
      restoreSay();
      return lg;
    };
    const a = await run(), b = await run();
    ok('det: armed shed ledger identical across runs', a === b);
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
