#!/usr/bin/env node
// test-mantle-memory-20261012.js — PROOF for the crisis-leg r4 blank:
//
// BEFORE (transcript-verified on crisis-succession sims, 2026-10-12): the
// successor's conversations went grief-silent 3 days after the bearer died
// defending the haven — villagers talked creek concerts and small talk while
// the mantle had just passed. Two gaps:
//   G1. t2LatelyEvent's mourning branch only fired while v.grief > 0 (3 days);
//       after that the lately topic vanished entirely — the village
//       conversationally forgot its dead bearer, though the fiction says
//       "the village remembers its own mantle-bearers" (ledger.js).
//   G2. convoWantNews's mourning line never named the dead: "everyone's
//       thinking about them" — filler next to lately lines that do name them.
//   G3. The acute mourning branch read v.corpses (always empty — corpses live
//       in state.corpses), so even during the 3 grief days the lately lines
//       fell back to the nameless "We lost someone" variants despite a fresh
//       named corpse on the ground.
//
// AFTER:
//   G1. The lineage's last entry — a bearer death with a cause — keeps the
//       mourning event alive up to 10 days (ordinary villager deaths keep the
//       3-day acute window).
//   G2. The mourning news line names the dead when the event carries a name.
//   G3. The acute branch reads the real corpse store, so fresh grief names
//       the dead from day one.
//
// Seeded PRNG, deterministic. Usage: node scripts/test-mantle-memory-20261012.js
//        SEED=7 node scripts/test-mantle-memory-20261012.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261012', 10);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED); // seeded BEFORE eval

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
function bearerFirst() {
  const c = (Game.data.villagers || []).find(x => x.id === Game.villagerId) || {};
  return first(c.name);
}

(async () => {
  await Game.init();
  console.log(`seed=${SEED}`);

  // ---------- G1. the mantle is remembered past the acute grief ----------
  console.log('\n-- G1. bearer death keeps the mourning event alive up to 10 days --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const oldBearer = Game.villagerId;
    const oldFirst = bearerFirst();
    Game.playerDeath('defending the haven'); // the real handler
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    ok('mantle passed to a new bearer', Game.villagerId !== oldBearer);

    // day 0: acute grief names the bearer
    let ev = Game.t2LatelyEvent(vid);
    ok('acute mourning names the bearer', ev && ev.kind === 'mourning' && ev.name === oldFirst,
      JSON.stringify(ev));

    // day 5: grief long decayed, the tail still names the bearer
    v.grief = 0;
    Game.state.scholar.day = 5;
    ev = Game.t2LatelyEvent(vid);
    ok('day-5 mourning still names the bearer (mantle memory)', ev && ev.kind === 'mourning' && ev.name === oldFirst && ev.bearer === true,
      JSON.stringify(ev));

    // the lately topic actually offers the mourning lines
    const lines = Game.t2gen_lately(vid) || [];
    ok('lately topic offers bearer-mourning lines', lines.some(l => l.includes(oldFirst)),
      lines.slice(0, 2).join(' | ').slice(0, 160));

    // day 12: the tail expires (death was day 1; window is since<=10)
    Game.state.scholar.day = 12;
    ev = Game.t2LatelyEvent(vid);
    ok('day-12 mourning expired', !(ev && ev.kind === 'mourning' && ev.name === oldFirst),
      JSON.stringify(ev));
  }

  // ---------- G1 control: ordinary villager deaths keep the 3-day window ----------
  console.log('\n-- G1 control. villager (non-bearer) death: 3-day window only --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const victim = ids[0];
    const vFirst = first((((Game.data.villagers || []).find(x => x.id === victim) || {}).name));
    const vid = ids[1];
    Game.registerDeath({ kind: 'villager', villagerId: victim, name: vFirst + ' Test', mx: 4, my: 4, cause: 'the fever' });
    let ev = Game.t2LatelyEvent(vid);
    ok('acute mourning fires for villager death', ev && ev.kind === 'mourning', JSON.stringify(ev));
    // no lineage entry for a villager death: the tail must NOT extend it
    const lin = Game.lineage() || [];
    const lastDeath = lin[lin.length - 1];
    ok('villager death leaves no bearer-death lineage entry', !lastDeath || !lastDeath.cause || !!lastDeath.outcome,
      lastDeath ? JSON.stringify(lastDeath).slice(0, 120) : 'lineage empty');
    v.grief = 0;
    Game.state.scholar.day = 5;
    ev = Game.t2LatelyEvent(vid);
    ok('day-5 villager mourning expired (no mantle tail)', !(ev && ev.kind === 'mourning'),
      JSON.stringify(ev));
  }

  // ---------- G2. the mourning news line names the dead ----------
  console.log('\n-- G2. convoWantNews mourning names the dead bearer --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const oldFirst = bearerFirst();
    Game.playerDeath('defending the haven');
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    v.memory = {};
    v.grief = 0; // past acute grief: the tail is what carries it
    Game.state.scholar.day = 6;
    const c = Game.convoGet(vid);
    c.want = { hook: 'morning', newsGiven: [] }; // morning-first order: memory, event, ...
    const line = Game.convoWantNews(vid);
    ok('mourning news names the bearer', typeof line === 'string' && line.includes(oldFirst),
      String(line).slice(0, 160));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
