#!/usr/bin/env node
// test-gap-w4narr-spam.js — proof for gap phase2 W4-narration-rest spam gates.
//   #576/#636/#647 too-heavy: sayGated caps the class at 3 voiced/day.
//   #577 not-mid-fight: sayOncePerFight voices each refusal text once
//        per live fight, and again in a new fight.
//   #588/#721 water departures: the water line rotates through a 5-line
//        pool with no within-day repeat (FOODVOICE2 machinery).
// Uses scripts/sim-harness.js. Writes nothing into the repo.
'use strict';
const { loadGame, quietLog } = require('./sim-harness');
let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? '  -- ' + detail : '')); }
}
const textOf = (e) => String(e && e.text != null ? e.text : e);
async function main() {
  const { Game } = await loadGame({ seed: 20261024, mode: 'gap-w4narr-spam', narration: true });
  await quietLog(async () => {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  });
  const day = Game.state.scholar.day || 0;
  // #576/#636/#647: varying texts, one class key -> first 3 voiced only
  const base = Game.log.length;
  for (let i = 0; i < 5; i++) Game.sayGated('tooHeavy', 'Too heavy test ' + i + '. (Lighten your pack first.)', 3);
  const voiced = Game.log.slice(base).map(textOf);
  ok(voiced.filter(t => t.indexOf('Too heavy test') === 0).length === 3, 'sayGated caps class at 3/day', voiced.join(' | '));
  // next day the gate resets
  const saveDay = Game.state.scholar.day;
  Game.state.scholar.day = saveDay + 1;
  const base2 = Game.log.length;
  Game.sayGated('tooHeavy', 'Too heavy test next-day.', 3);
  ok(Game.log.slice(base2).map(textOf).some(t => t.indexOf('Too heavy test next-day') === 0), 'sayGated resets on a new day');
  Game.state.scholar.day = saveDay;
  // #577: once per fight per text
  const oldFight = Game.tbfight;
  Game.tbfight = { over: false };
  const b3 = Game.log.length;
  Game.sayOncePerFight('Not mid-fight — finish it first.');
  Game.sayOncePerFight('Not mid-fight — finish it first.');
  Game.sayOncePerFight('Not mid-fight — the barrier is the way out.');
  const fightVoiced = Game.log.slice(b3).map(textOf);
  ok(fightVoiced.filter(t => t === 'Not mid-fight — finish it first.').length === 1, 'same refusal voiced once per fight', fightVoiced.join(' | '));
  ok(fightVoiced.filter(t => t === 'Not mid-fight — the barrier is the way out.').length === 1, 'distinct refusal still audible in same fight');
  Game.tbfight = { over: false }; // a NEW fight object
  const b4 = Game.log.length;
  Game.sayOncePerFight('Not mid-fight — finish it first.');
  ok(Game.log.slice(b4).map(textOf).some(t => t === 'Not mid-fight — finish it first.'), 'new fight gets a fresh voice');
  Game.tbfight = oldFight;
  // #588/#721: water departures rotate
  const others = Game.state.village.roster.filter(id => id !== Game.villagerId).slice(0, 5);
  ok(others.length >= 5, 'five villagers available for departure test', String(others.length));
  const b5 = Game.log.length;
  for (const vid of others) {
    try { Game.objDepart(vid, { tx: 0, ty: 0, purpose: 'water', partsLeft: 1 }, 0, 0, true); } catch (e) { console.log('  objDepart error for ' + vid + ': ' + e.message); }
  }
  const deps = Game.log.slice(b5).map(textOf).filter(t => t.indexOf('heads out for water') >= 0);
  const quotes = deps.map(t => (t.match(/"[^"]+"/) || [''])[0]);
  ok(deps.length === 5, 'five water departures voiced', deps.join(' | '));
  ok(new Set(quotes).size === 5, 'five distinct water lines, no within-day repeat', quotes.join(' | '));
  ok(quotes.indexOf('"The well won\'t fill itself."') >= 0, 'classic well line still in the pool');
  console.log(fail ? `FAILURES: ${fail}` : `ALL PASS (${pass})`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
