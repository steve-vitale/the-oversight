#!/usr/bin/env node
// test-succession-bearername-20261016.js — PROOF for journey-succession r20.
//
// REGRESSION (found by this run): crisis-r8 (2026-10-12) replaced the r4
// bearer-naming (String(recorded name).split(' ')[0]) with knowledge-gated
// firstRef() in t2LatelyEvent's mourning branches to fix the "Since A
// died..." stranger-truncation bug. Side effect: a pre-System bearer death
// mourned "the man in his 20s" — hiding the player's own prior incarnation's
// name from the player. The dead bearer isn't a stranger: the player WAS
// them, and the lineage is the village's canonical memory of its
// mantle-bearers ("the village remembers its own mantle-bearers", ledger.js).
//
// AFTER: bearer deaths (lineage entry with cause, no outcome) resolve the
// mourning name from the recorded true name (lineage last.name / corpse
// name); stranger villager deaths keep the firstRef path (r8's fix intact,
// never "A"); the 'the scholar' fallback can't render "Since the died...".
//
// Seeded PRNG, deterministic. Usage: node scripts/test-succession-bearername-20261016.js
//        SEED=7 node scripts/test-succession-bearername-20261016.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261016', 10);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED); // seeded BEFORE eval (load-time capture)

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
});
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.sysSay = () => {};
  Game.state.scholar.kcal = 50000;
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.convoSeeds = {};
  v.sick = {};
  v.memory = {};
  return (v.roster || []).filter(id => id !== Game.villagerId);
}
const first = (n) => String(n || '').split(' ')[0];

(async () => {
  await Game.init();
  console.log(`seed=${SEED}`);

  // ---------- B1. pre-System bearer death: named, not descriptor ----------
  console.log('\n-- B1. pre-System bearer death mourns the true name --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const oldId = Game.villagerId;
    const oldFirst = first(((Game.data.villagers || []).find(x => x.id === oldId) || {}).name);
    Game.playerDeath('defending the haven');
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    ok('mantle passed', Game.villagerId !== oldId);
    let ev = Game.t2LatelyEvent(vid);
    ok('acute mourning uses the bearer\'s true name', ev && ev.kind === 'mourning' && ev.name === oldFirst, JSON.stringify(ev));
    ok('name is not a descriptor', ev && !/^the (man|woman|person)/i.test(ev.name || ''), JSON.stringify(ev));
    // day 5: the mantle-memory tail also names them
    v.grief = 0;
    Game.state.scholar.day = 5;
    ev = Game.t2LatelyEvent(vid);
    ok('day-5 tail names the bearer', ev && ev.kind === 'mourning' && ev.name === oldFirst && ev.bearer === true, JSON.stringify(ev));
    // the actual line text reads with the name
    const lines = Game.t2gen_lately(vid) || [];
    ok('lately lines carry the name', lines.some(l => l.includes(oldFirst)), lines.slice(0, 2).join(' | ').slice(0, 160));
  }

  // ---------- B2. stranger villager death pre-System: r8 fix intact ----------
  console.log('\n-- B2. stranger villager death: descriptor, never "A" (r8 intact) --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const victim = ids[0];
    const vid = ids[1];
    // registerDeath with a knowledge-gated descriptor name (the wild-death path)
    const desc = Game.displayName(victim);
    Game.registerDeath({ kind: 'villager', villagerId: victim, name: desc, mx: 4, my: 4, cause: 'the fever' });
    const ev = Game.t2LatelyEvent(vid);
    ok('acute mourning fires', ev && ev.kind === 'mourning', JSON.stringify(ev));
    ok('no bare-"A" truncation', ev && !/(^|\s)A(\s|$)/.test(' ' + (ev.name || '') + ' '), JSON.stringify(ev));
    ok('no "Since the died" class rendering', ev && !/^(the|a|an)$/i.test(ev.name || ''), JSON.stringify(ev));
    const lines = Game.t2gen_lately(vid) || [];
    ok('no line starts a death-sentence with bare A', !lines.some(l => /Since A died|about A,/.test(l)), lines.slice(0, 2).join(' | ').slice(0, 160));
  }

  // ---------- B3. post-System bearer death: still named (unchanged behavior) ----------
  console.log('\n-- B3. post-System bearer death: named (unchanged) --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const oldId = Game.villagerId;
    const oldFirst = first(((Game.data.villagers || []).find(x => x.id === oldId) || {}).name);
    Game.state.systemArrived = true; // the System labels everyone
    Game.playerDeath('the expedition');
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    v.grief = 0;
    Game.state.scholar.day = 6;
    const ev = Game.t2LatelyEvent(vid);
    ok('post-System tail names the bearer', ev && ev.kind === 'mourning' && ev.name === oldFirst && ev.bearer === true, JSON.stringify(ev));
  }

  // ---------- B4. successor's own conversations carry the death ----------
  console.log('\n-- B4. successor hears the mourning news by name --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const oldFirst = first(((Game.data.villagers || []).find(x => x.id === Game.villagerId) || {}).name);
    Game.playerDeath('defending the haven');
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    v.memory = {};
    v.grief = 0;
    Game.state.scholar.day = 6;
    const c = Game.convoGet(vid);
    c.want = { hook: 'morning', newsGiven: [] }; // morning-first order: memory, event, ...
    const line = Game.convoWantNews(vid);
    ok('mourning news names the bearer', typeof line === 'string' && line.includes(oldFirst), String(line).slice(0, 160));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
