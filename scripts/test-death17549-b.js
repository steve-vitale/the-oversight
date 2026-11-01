#!/usr/bin/env node
// test-death17549-b.js — PURE proof test for analyze-death17549-b.js.
// (sim-death17549-b; prereg: evidence/2026-11-01/sim-death17549-b-prereg.md.)
// No game load, no RNG, no file reads of real corpora: every case is a
// synthetic corpus built inline. Exit 0 on pass, 1 on any failure, and
// print "PASS <n>/<n>" on success.
'use strict';
const {
  analyze, pantryTrajectory, hungryStreak, successions, quotedFlows, sleepSlice, corporaIdentical,
} = require('./analyze-death17549-b');

let pass = 0, total = 0;
function check(name, cond, extra) {
  total++;
  if (cond) { pass++; }
  else { console.log('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// Build a synthetic corpus: decisions/evenings with pantry snaps, and a
// say stream whose seqs line up with the slice cuts the analyzer uses.
function synth(days) {
  // days: [{panM, panE, vessel, sayAfter: [lines]}] — sayAfter lines are the
  // sleep slice after that day (day field = that day).
  const decisions = [], evenings = [], sayLines = [];
  let seq = 0;
  days.forEach((d, i) => {
    const sayBefore = seq;
    decisions.push({ loopDay: i + 1, morning: { vesselId: d.vessel || 'v1', tile: 'haven' }, pantry: { kcal: d.panM, count: 1 } });
    (d.sayAfter || []).forEach((line) => { sayLines.push({ seq: seq++, day: i + 1, line }); });
    evenings.push({ loopDay: i + 1, tile: 'haven', kcal: 2000, pantry: { kcal: d.panE, count: 1 }, saySeqAtEvening: sayBefore, eveningOutcome: 'completed' });
    decisions[i].saySeqAtMorning = sayBefore;
  });
  // Morning seqs: decision[i].saySeqAtMorning must equal the seq at the START
  // of day i's daily, i.e. the end of the previous sleep slice. Rebuild:
  let s = 0;
  days.forEach((d, i) => {
    decisions[i].saySeqAtMorning = s;
    s += (d.sayAfter || []).length;
  });
  // Evening seqs: evening[i].saySeqAtEvening must equal the seq at the END of
  // day i's daily, i.e. the start of its sleep slice.
  s = 0;
  days.forEach((d, i) => {
    evenings[i].saySeqAtEvening = s;
    s += (d.sayAfter || []).length;
  });
  return { seed: 17549, policy: 'synthetic', endReason: 'survived', daysAlive: days.length, gameDays: days.length, deaths: [], decisions, evenings, sayLines };
}

// --- pantry trajectory: overnight + daytime deltas ---
{
  const c = synth([
    { panM: 1000, panE: 900 },
    { panM: 700, panE: 700 },
    { panM: 0, panE: 100 },
  ]);
  const t = pantryTrajectory(c);
  check('traj length', t.length === 3);
  check('traj day1 daytime', t[0].daytimeDelta === -100, t[0]);
  check('traj day2 overnight', t[1].overnightDelta === -200, t[1]);
  check('traj day3 overnight', t[2].overnightDelta === -700, t[2]);
  check('traj day3 daytime', t[2].daytimeDelta === 100, t[2]);
  check('traj first overnight null', t[0].overnightDelta === null);
}

// --- hungry streak: Day 1,2,3 + scattering; reset breaks it ---
{
  const c = synth([
    { panM: 500, panE: 500, sayAfter: ["⚠ Haven's pantry is empty. Day 1 of hunger."] },
    { panM: 0, panE: 0, sayAfter: ["⚠ Haven's pantry is empty. Day 2 of hunger."] },
    { panM: 0, panE: 0, sayAfter: ["⚠ Haven's pantry is empty. Day 3 of hunger.", "Haven couldn't hold. On the third hungry day, people started walking — in different directions. The scattering, again."] },
  ]);
  const h = hungryStreak(c);
  check('markers 3', h.markers.length === 3 && h.markers[2].n === 3, h.markers);
  check('gameOver scattering', h.gameOver.kind === 'scattering' && h.gameOver.loopDay === 3, h.gameOver);
  check('no resets', h.resets.length === 0);
}
{
  const c = synth([
    { panM: 500, panE: 500, sayAfter: ["⚠ Haven's pantry is empty. Day 1 of hunger."] },
    { panM: 900, panE: 900, sayAfter: ['Haven eats again. The hollow look fades.'] },
    { panM: 0, panE: 0, sayAfter: ["⚠ Haven's pantry is empty. Day 1 of hunger."] },
  ]);
  const h = hungryStreak(c);
  check('reset recorded', h.resets.length === 1 && h.resets[0] === 2, h.resets);
  check('second Day 1, not Day 2', h.markers.length === 2 && h.markers[1].n === 1, h.markers);
  check('no gameOver on reset corpus', h.gameOver.kind === 'none');
}

// --- game-over classification: extinction, no-successor, none ---
{
  const c = synth([
    { panM: 100, panE: 100, sayAfter: ['Nobody is left. Not scattered, not gone looking for food — dead, every one, and the fire has nobody left to warm. The village ends here.'] },
  ]);
  check('gameOver extinction', hungryStreak(c).gameOver.kind === 'extinction');
}
{
  const c = synth([
    { panM: 100, panE: 100, sayAfter: ['No one is left to pick up the Codex. The village dies out — quietly, the way villages do.'] },
  ]);
  check('gameOver no-successor', hungryStreak(c).gameOver.kind === 'no-successor');
}
{
  const c = synth([{ panM: 100, panE: 100, sayAfter: ['Village meal: +1000 kcal from the communal pantry.'] }]);
  check('gameOver none on survived', hungryStreak(c).gameOver.kind === 'none');
}
{
  // Scattering line must NOT be claimed when only a flashback mentions it.
  const c = synth([{ panM: 100, panE: 100, sayAfter: ['FLASHBACK — the scattering took the one person you were keeping alive.'] }]);
  check('flashback is not scattering', hungryStreak(c).gameOver.kind === 'none');
}

// --- successions ---
{
  const c = synth([
    { panM: 100, panE: 100, vessel: 'v1' },
    { panM: 100, panE: 100, vessel: 'v1' },
    { panM: 100, panE: 100, vessel: 'v2' },
    { panM: 100, panE: 100, vessel: 'v2' },
  ]);
  const s = successions(c);
  check('one succession day 3', s.length === 1 && s[0].loopDay === 3 && s[0].from === 'v1' && s[0].to === 'v2', s);
}

// --- quoted flows ---
{
  const c = synth([
    { panM: 100, panE: 100, sayAfter: [
      '🌿 Nikos returns from foraging the wilds: +582 kcal to the pantry.',
      '🧭 Devon is back from past the east (+7122 kcal for the pantry, 5 stories) (Ask them what they saw.)',
      "You keep a day's food (1995 kcal) and unload 390 kcal into Haven's pantry.",
      'Village meal: +1293 kcal, +1L water from the communal pantry. (Half ration — they don\'t trust you yet.)',
      "You keep a day's food (270 kcal) — nothing extra for the pantry this time.",
    ] },
  ]);
  const f = quotedFlows(c);
  check('forage 582', f.forage.length === 1 && f.forage[0].kcal === 582, f.forage);
  check('expedition 7122', f.expedition.length === 1 && f.expedition[0].kcal === 7122, f.expedition);
  check('unload 390', f.unload.length === 1 && f.unload[0].kcal === 390, f.unload);
  check('meal 1293', f.meals.length === 1 && f.meals[0].kcal === 1293, f.meals);
  check('keepOnly 1', f.keepOnly.length === 1, f.keepOnly);
}

// --- sleepSlice bounds: lines belong to the day whose sleep they are ---
{
  const c = synth([
    { panM: 100, panE: 100, sayAfter: ['night-one-line'] },
    { panM: 100, panE: 100, sayAfter: ['night-two-line'] },
  ]);
  const s1 = sleepSlice(c, 1).map((x) => x.line);
  const s2 = sleepSlice(c, 2).map((x) => x.line);
  check('slice 1', s1.length === 1 && s1[0] === 'night-one-line', s1);
  check('slice 2', s2.length === 1 && s2[0] === 'night-two-line', s2);
}

// --- corporaIdentical: same lines+decisions true, any difference false ---
{
  const a = synth([{ panM: 100, panE: 100, sayAfter: ['same line'] }]);
  const b = synth([{ panM: 100, panE: 100, sayAfter: ['same line'] }]);
  const d = synth([{ panM: 100, panE: 100, sayAfter: ['other line'] }]);
  check('identical true', corporaIdentical(a, b) === true);
  check('identical false on line diff', corporaIdentical(a, d) === false);
}

// --- analyze wiring on a synthetic corpus dir case (object form) ---
{
  const c = synth([
    { panM: 500, panE: 500, sayAfter: ["⚠ Haven's pantry is empty. Day 1 of hunger."] },
    { panM: 0, panE: 0, sayAfter: ["⚠ Haven's pantry is empty. Day 2 of hunger.", "Haven couldn't hold. On the third hungry day, people started walking."] },
  ]);
  c.deaths = [{ day: 1, kind: 'villager', who: 'x', cause: 'sickness', player: false }];
  const out = analyze(c);
  check('analyze endReason passthrough', out.endReason === 'survived');
  check('analyze deaths passthrough', out.deaths.length === 1);
  check('analyze markers', out.hungryMarkers.length === 2);
  check('analyze gameOver scattering', out.gameOver.kind === 'scattering');
  check('analyze traj', out.pantryTrajectory.length === 2);
}

console.log('PASS ' + pass + '/' + total);
process.exit(pass === total ? 0 : 1);
