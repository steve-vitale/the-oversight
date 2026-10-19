#!/usr/bin/env node
// THROTTLEBEAT PROOF (fleshout-b, 2026-10-14, sim-throttlebeat).
//
// THE BLANK: the hunger-depth exemption shipped always-on (1a44a2c8:
// prodThrottleEngaged() returns false at progState().hungryStreak >= 3),
// but the pilot's safety evidence was NOT carried over: the
// v.throttleExemptDepth counter and the sense-tested "hungry eat first"
// narration beat. This arm re-lands exactly those two pieces ON TOP of
// the shipped always-on code: narration + counter ONLY, no behavior change.
//
// RED PHASE: `git diff src/js/game.js > ~/workspace/throttlebeat.patch &&
// git checkout HEAD -- src/js/game.js`, then MODE=red node this script —
// the exemption must be SILENT (no beat, no counter). Then
// `git apply ~/workspace/throttlebeat.patch` and MODE=green: all pass.
//
// Harness: mulberry32, SEED env override (default 20261014), full src/js
// module list in index.html order minus DOM-only files and drama.js,
// window stubbed for eval then deleted, Math.random seeded BEFORE eval.
// Never stubs Game.save.
const { loadGame } = require('./sim-harness');
const SEED = Number(process.env.SEED || 20261014);
let Game;


const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

const MODE = process.env.MODE === 'red' ? 'red' : 'green';
const expectBeat = MODE === 'green';
console.log(`MODE=${MODE} (exemption beat+counter ${expectBeat ? 'present' : 'absent — the stand-down must be silent'})`);

const said = [];
const freshItem = (name, kcal, daysLeft) => ({
  name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true,
  spoilDay: Game.state.scholar.day + daysLeft,
});

// one duty decision with an engaged pantry; returns the decision shape
function dutyDecision(Game, vid, v, pg, streak, task) {
  // Independent first-duty cases use distinct days. The same-day case below
  // separately proves one voice and all three ledger occurrences.
  Game.state.scholar.day += 1;
  v.pantry = [freshItem('Foraged food', 15000, 3)]; // ~10 fresh-days: engaged
  pg.hungryStreak = streak;
  v.throttleRedirects = 0; v.throttleExemptDepth = 0;
  said.length = 0;
  const a = { task };
  Game.resolveOneAssignment(vid, a);
  return {
    task: a.task,
    redirected: ['wood', 'water', 'stone'].includes(a.task),
    redirects: v.throttleRedirects || 0,
    exempt: v.throttleExemptDepth || 0,
    said: said.slice(),
  };
}

(async () => {
  Game = (await loadGame({ seed: SEED, narration: true })).Game;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.nearFire = () => true;
  Game.state.scholar.day = 10;
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  const v = Game.state.village;
  v.burnHistory = [1500, 1500, 1500, 1500, 1500, 1500, 1500];
  const pg = (typeof Game.progState === 'function') ? Game.progState() : {};

  console.log('== 1. THE HELPER: prodThrottleHungerExempt exists + gates exactly ==');
  const hasHelper = typeof Game.prodThrottleHungerExempt === 'function';
  if (expectBeat) {
    check('helper present on armed tree', hasHelper);
    if (hasHelper) {
      v.pantry = [freshItem('Foraged food', 15000, 3)]; // ~10 fresh-days
      for (const streak of [0, 1, 2]) {
        pg.hungryStreak = streak;
        check(`streak ${streak}: NOT exempt (redirect path unaffected)`, Game.prodThrottleHungerExempt() === false, 'streak=' + streak);
      }
      for (const streak of [3, 4]) {
        pg.hungryStreak = streak;
        check(`streak ${streak}: EXEMPT (pantry engaged, depth reached)`, Game.prodThrottleHungerExempt() === true, 'streak=' + streak);
      }
      // pantry thin: no exemption (the throttle never engaged anyway)
      v.pantry = [freshItem('Meager stores', 500, 1)]; // ~0.05 fresh-days
      pg.hungryStreak = 4;
      check('thin pantry at streak 4: NOT exempt (nothing to stand down)', Game.prodThrottleHungerExempt() === false);
      // helper is read-only: no RNG consumed, no village state changed
      v.pantry = [freshItem('Foraged food', 15000, 3)];
      pg.hungryStreak = 3;
      const before = JSON.stringify(v.pantry);
      Game.prodThrottleHungerExempt();
      check('helper is read-only (pantry bytes unchanged)', JSON.stringify(v.pantry) === before);
    }
  } else {
    check('helper absent on pristine tree (no stand-down naming)', !hasHelper);
  }

  console.log('== 2. THE STAND-DOWN DECISION: streak 3/4 with an engaged pantry ==');
  for (const streak of [3, 4]) {
    const d = dutyDecision(Game, vid, v, pg, streak, 'forage');
    check(`streak ${streak}: production continues (no redirect)`, !d.redirected && d.task === 'forage', 'a.task=' + d.task);
    check(`streak ${streak}: the redirect beat does NOT fire`, !d.said.some(s => /leaves the forage standing/.test(s)));
    if (expectBeat) {
      check(`[GREEN] streak ${streak}: exemption counted on the village ledger`, d.exempt === 1, 'exempt=' + d.exempt);
      const beat = d.said.filter(s => /hungry eat first/.test(s));
      check(`[GREEN] streak ${streak}: the "hungry eat first" beat fires`, beat.length === 1, 'said=' + d.said.length);
      check(`[GREEN] streak ${streak}: beat names what the villager keeps doing`, beat.some(s => /keeps working the forage/.test(s)));
      check(`[GREEN] streak ${streak}: beat is honest about the pantry state`, beat.some(s => /days of fresh/.test(s)));
      check(`[GREEN] streak ${streak}: beat is honest about the depth`, beat.some(s => /three days running/.test(s)));
    } else {
      check(`[RED] streak ${streak}: NO beat — the stand-down is silent`, !d.said.some(s => /hungry eat first/.test(s)));
      check(`[RED] streak ${streak}: NO counter — ledger untouched`, d.exempt === 0, 'exempt=' + d.exempt);
    }
  }

  console.log('== 3. ALL THREE FOOD DUTIES carry the beat (duty-name variants) ==');
  const want = { forage: /keeps working the forage/, garden: /keeps working the harvest/, fish: /keeps working the fish nets/ };
  for (const task of ['forage', 'garden', 'fish']) {
    const d = dutyDecision(Game, vid, v, pg, 3, task);
    if (expectBeat) {
      check(`[GREEN] ${task}: beat fires with the duty name`, d.said.some(s => want[task].test(s)) && d.exempt === 1,
        `exempt=${d.exempt}`);
    } else {
      check(`[RED] ${task}: silent, no counter`, d.exempt === 0 && !d.said.some(s => /hungry eat first/.test(s)));
    }
  }
  const dWood = dutyDecision(Game, vid, v, pg, 3, 'wood');
  check('non-food duty (wood) at streak 3: no beat, no counter', dWood.exempt === 0 && !dWood.said.some(s => /hungry eat first/.test(s)),
    `exempt=${dWood.exempt} task=${dWood.task}`);

  console.log('== 4. TRANSIENT HUNGER: streak 1/2 still redirects (no exemption) ==');
  for (const streak of [1, 2]) {
    const d = dutyDecision(Game, vid, v, pg, streak, 'forage');
    check(`streak ${streak}: redirect fires normally`, d.redirected && d.exempt === 0,
      `task=${d.task} exempt=${d.exempt}`);
    check(`streak ${streak}: exemption beat silent`, !d.said.some(s => /hungry eat first/.test(s)));
    check(`streak ${streak}: landed redirect beat fires`, d.said.some(s => /leaves the forage standing/.test(s)));
  }

  console.log('== 5. THE LEDGER ACCUMULATES while the daily voice stays single ==');
  Game.state.scholar.day += 1;
  v.pantry = [freshItem('Foraged food', 15000, 3)];
  pg.hungryStreak = 3;
  v.throttleExemptDepth = 0; said.length = 0;
  for (let i = 0; i < 3; i++) Game.resolveOneAssignment(vid, { task: 'forage' });
  const acc = v.throttleExemptDepth || 0;
  if (expectBeat) {
    check('[GREEN] three exempted duties -> ledger 3', acc === 3, 'exempt=' + acc);
    check('[GREEN] three same-day duties narrate one beat while counting all3', said.filter(s => /hungry eat first/.test(s)).length === 1);
  } else {
    check('[RED] three stand-downs -> ledger 0', acc === 0, 'exempt=' + acc);
    check('[RED] no beats narrated', said.filter(s => /hungry eat first/.test(s)).length === 0);
  }

  console.log('== 6. BEHAVIOR-INERT: the duty resolves identically except beat+counter ==');
  // Same decision shape: task unchanged, no redirect, no rotation advance.
  // The stand-down path is the landed path minus the redirect.
  const dInert = dutyDecision(Game, vid, v, pg, 3, 'forage');
  check('duty task preserved (production continues)', dInert.task === 'forage', 'task=' + dInert.task);
  check('no redirect counted', dInert.redirects === 0, 'redirects=' + dInert.redirects);

  console.log(fails.length === 0 ? '\nALL GREEN' : `\n${fails.length} FAILURES:\n- ${fails.join('\n- ')}`);
  process.exit(fails.length === 0 ? 0 : 1);
})();
