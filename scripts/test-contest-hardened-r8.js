#!/usr/bin/env node
// test-contest-hardened-r8.js — proof for lever 6 r8: the MAIN-EVENT beat.
//
// Blanks measured on pristine (scripts/sweep-contests-r8.js, 32x200d
// identical seeds):
//   B1: 17 of 20 hardened runs were PHASE-IDENTICAL to plain while the
//       System said "some of your old lines won't work. The tapes don't
//       lie." — the old byte-identical blank plus a lie.
//   B2: the stipulation/MAIN-EVENT beat phase was UNREACHABLE —
//       _cxInsertPhase shifted phase 0's nexts past the beat (phase 0 -> old
//       phase 1, beat orphaned at index 1), so its entry damage never applied.
//
// Lever: EVERY hardened variant (heat>=1) inserts a genuinely different,
// reachable beat phase at index 1. Kind selection is honest:
//   - 'no_repeat' only when the dossier really banned moves (br.banned > 0)
//   - otherwise the handicap beat (real entry cost, said aloud)
// First-timers (heat 0, wins 0) never reach the branch.
//
// RED-checked: R1/R2/R2c/R4/R4b/R7 fail on pristine; R3/R5/R6 pass on
// pristine (preserved behavior).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ROOT = path.resolve(__dirname, '..');
const SEED = parseInt(process.env.SEED || '424242', 10);
let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; } else { fail++; console.log('FAIL:', name); }
}
const sig = (phases) => JSON.stringify((phases || []).map(p =>
  ((p.choices || []).map(c => (c.label || '') + '~' + (c.sub || ''))).join('|')));

(async () => {
  Math.random = mulberry32(SEED);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^\"'\"'\"']*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  const said = [];
  Game.say = function () {}; Game.audioEvent = function () {};
  Game.sysSay = (t) => { said.push(String(t)); };
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 20;

  const base = Game.contestPool().find(c => c.id === 'riddle');
  if (!base) { console.log('SKIP: riddle not in pool'); process.exit(0); }
  const scaled = (variant) => Game._contestScaled(Object.assign({}, base), variant);
  const reset = () => { Game.state.cxAdapt = null; Game.state.codex = Game.state.codex || {}; Game.state.codex.contests = {}; };

  // Heat exactly 1: one win (derives heat 1, bumps to 2) then one loss cools to 1.
  reset();
  Game.contestLearn('riddle', 'won');
  Game._cxRecordOutcome({ contestId: 'riddle', participant: 'player', _approach: { 1: 0 } }, 'won');
  Game.contestLearn('riddle', 'lost');
  Game._cxRecordOutcome({ contestId: 'riddle', participant: 'player' }, 'lost');
  const h = Game._cxHeatFor('riddle');
  ok(h === 1, 'S0: win+loss -> heat exactly 1 (got ' + h + ')');

  const plainPh = Game.contestPlayable(scaled(null));
  said.length = 0;
  const hardPh = Game._cxApplyAdaptation(scaled('hardened'), Game.contestPlayable(scaled('hardened')));

  // R1: beat inserted at heat 1 (pristine: no beat below heat 2).
  ok(hardPh.length === plainPh.length + 1,
    `R1: MAIN-EVENT beat inserted at heat 1 (${plainPh.length} -> ${hardPh.length})`);
  // R2: genuinely different phases.
  ok(sig(hardPh) !== sig(plainPh), 'R2: hardened phases genuinely differ at heat 1');
  // R2c: the beat carries a real entry cost: dmg [4+2h, 8+3h], trauma 1+h.
  const beat = hardPh[1];
  const d0 = (beat.choices || [])[0] || {};
  const expDmg = [4 + 2 * h, 8 + 3 * h], expTr = 1 + h;
  ok(/MAIN EVENT|STIPULATION/.test(beat.text || ''), 'R2b: beat phase is the MAIN-EVENT/STIPULATION beat');
  ok(d0.do && d0.do.dmg && d0.do.dmg[0] === expDmg[0] && d0.do.dmg[1] === expDmg[1] && d0.do.trauma === expTr,
    `R2c: heat-1 handicap beat carries real cost [${expDmg}] dmg + ${expTr} trauma (got ${JSON.stringify(d0.do)})`);
  // R7: the beat is REACHABLE — phase 0 routes into it, it forwards to old phase 1.
  const p0nexts = (hardPh[0].choices || []).map(c => c.next);
  ok(p0nexts.every(n => n === 1 || typeof n === 'string'),
    'R7: phase-0 choices route INTO the beat (nexts=' + JSON.stringify(p0nexts) + ')');
  ok(d0.next === 2, 'R7b: beat forwards to old phase 1 (next=' + d0.next + ')');

  // R3 (preserved): first-timers play fair — no beat, no adaptation lines.
  reset();
  said.length = 0;
  const freshPh = Game._cxApplyAdaptation(scaled(null), Game.contestPlayable(scaled(null)));
  ok(freshPh.length === plainPh.length, 'R3: first-timer untouched (no beat inserted)');
  ok(!said.some(s => /MAIN EVENT|stipulation|studied the tapes|heat/i.test(s)),
    'R3b: no adaptation lines for first-timer');

  // R4 (honesty): the dishonest "old lines won't work" line is gone at heat 1.
  reset();
  Game.contestLearn('riddle', 'won');
  Game._cxRecordOutcome({ contestId: 'riddle', participant: 'player', _approach: { 1: 0 } }, 'won');
  Game.contestLearn('riddle', 'lost');
  Game._cxRecordOutcome({ contestId: 'riddle', participant: 'player' }, 'lost');
  said.length = 0;
  Game._cxApplyAdaptation(scaled('hardened'), Game.contestPlayable(scaled('hardened')));
  let all = said.join(' ');
  ok(!/some of your old lines won't work/.test(all), 'R4: dishonest "old lines" copy GONE');
  ok(/MAIN EVENT rules: the arena runs hotter/.test(all), 'R4b: honest MAIN-EVENT handicap line said');

  // R4b (honesty at heat 2, 1 win): pristine said "your winning moves stay
  // banned" with zero bans applied. Now: handicap + honest line.
  reset();
  Game.contestLearn('riddle', 'won');
  Game._cxRecordOutcome({ contestId: 'riddle', participant: 'player', _approach: { 1: 0 } }, 'won');
  ok(Game._cxHeatFor('riddle') === 2, 'S4: one win -> heat 2 (got ' + Game._cxHeatFor('riddle') + ')');
  said.length = 0;
  const hardH2 = Game._cxApplyAdaptation(scaled('hardened'), Game.contestPlayable(scaled('hardened')));
  all = said.join(' ');
  ok(hardH2.length === plainPh.length + 1, 'R4c: beat inserted at heat 2, 1 win');
  ok(!/your winning moves stay banned/i.test(all), 'R4d: no dishonest "moves stay banned" without bans');
  ok(/MAIN EVENT rules: the arena runs hotter/.test(all), 'R4e: honest handicap line at heat 2');

  // R5 (preserved): at 2+ wins the no_repeat beat fires with REAL bans.
  // boredom=3 -> 3%3=0 -> no_repeat (boredom=2 would be blind instead).
  reset();
  Game.contestLearn('riddle', 'won'); Game._cxRecordOutcome({ contestId: 'riddle', participant: 'player', _approach: { 1: 0 } }, 'won');
  Game.contestLearn('riddle', 'won'); Game._cxRecordOutcome({ contestId: 'riddle', participant: 'player', _approach: { 1: 0 } }, 'won');
  Game._cxAdapt().boredom['riddle'] = 3;
  said.length = 0;
  const hard2 = Game._cxApplyAdaptation(scaled('hardened'), Game.contestPlayable(scaled('hardened')));
  ok(hard2.length === plainPh.length + 1, 'R5: 2-win hardened gets the beat');
  ok(/greatest hits are BANNED/.test(said.join(' ')), 'R5b: real bans -> crowd-voted no_repeat line (honest)');
  // R5c: the beat is reachable here too.
  ok((hard2[0].choices || []).every(c => c.next === 1 || typeof c.next === 'string'),
    'R5c: beat reachable at 2 wins');

  // R6 (preserved): crowd-voted handicap still says the crowd voted.
  reset();
  Game.contestLearn('riddle', 'won'); Game._cxRecordOutcome({ contestId: 'riddle', participant: 'player', _approach: { 1: 0 } }, 'won');
  Game.contestLearn('riddle', 'won'); Game._cxRecordOutcome({ contestId: 'riddle', participant: 'player', _approach: { 1: 0 } }, 'won');
  Game._cxAdapt().boredom['riddle'] = 4; // 4 % 3 = 1 -> handicap
  said.length = 0;
  Game._cxApplyAdaptation(scaled('hardened'), Game.contestPlayable(scaled('hardened')));
  ok(/They've voted a HANDICAP/.test(said.join(' ')), 'R6: crowd-voted handicap keeps its line');

  // SENSE: no placeholder tokens in any new copy.
  ok(!/lorem|TODO|undefined|NaN|\[object/i.test(said.join('\n')), 'SENSE: no broken tokens');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
