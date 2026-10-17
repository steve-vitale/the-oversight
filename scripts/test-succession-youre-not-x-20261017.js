#!/usr/bin/env node
// test-succession-youre-not-x-20261017.js — PROOF for journey-succession r21.
//
// UNTESTED (r20, 2026-10-16): the "You're not X" beat in ledger.js playerDeath
// (the closeId >55-trust branch) had never fired in any sim — no villager
// ever cleared trust 55 by the kill day, so the beat was written but never
// exercised end-to-end.
//
// AFTER: with a living villager above trust 55 (toward the dead bearer), the
// real playerDeath handler fires the beat with the LIVING speaker's first
// name and the dead bearer's first name ("\"<Old>'s gone.\" <B> looks at you
// for a long moment. \"You're not <Old>.\" ..."). The weirdness-hunt 2026-10-10
// dead-speaker fix holds: a corpse with trust >55 cannot deliver the line.
// Negative control: nobody above 55 -> the beat stays silent.
//
// Seeded PRNG, deterministic. Usage: node scripts/test-succession-youre-not-x-20261017.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261017', 10);

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

const first = (n) => String(n || '').split(' ')[0];
function charName(id) {
  return (((Game.data.villagers || []).find(x => x.id === id)) || {}).name || id;
}
// capture say lines while running the real handler
function withCapturedSay(fn) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (t) { lines.push(String(t || '')); return orig ? orig.call(this, t) : undefined; };
  try { fn(); } finally { Game.say = orig; }
  return lines;
}

async function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.sysSay = () => {};
  Game.state.scholar.kcal = 50000;
  const v = Game.state.village;
  v.trust = v.trust || {};
  return (v.roster || []).filter(id => id !== Game.villagerId);
}

(async () => {
  await Game.init();
  console.log(`seed=${SEED}`);

  // ---------- T1. positive: living mourner above 55 delivers the beat ----------
  console.log('\n-- T1. high-trust living villager delivers "You\'re not X" --');
  {
    const ids = await freshGame();
    const v = Game.state.village;
    const oldId = Game.villagerId;
    const oldFirst = first(charName(oldId));
    const succ = ids[0], mourner = ids[1];
    const succFirst = first(charName(succ)), mournerFirst = first(charName(mourner));
    v.trust[succ] = 70;    // becomes the successor (highest)
    v.trust[mourner] = 65; // stays living, above the 55 bar
    for (const id of ids.slice(2)) v.trust[id] = 10;
    const lines = withCapturedSay(() => Game.playerDeath('the expedition'));
    ok('successor chosen is the 70-trust villager', Game.villagerId === succ, 'got ' + first(charName(Game.villagerId)));
    const beat = lines.find(l => /You're not /.test(l));
    ok('beat fires', !!beat, lines.slice(0, 3).join(' | ').slice(0, 120));
    if (beat) {
      ok('beat names the dead bearer', beat.includes(`"${oldFirst}'s gone."`), beat.slice(0, 160));
      ok('beat speaker is the living 65-trust mourner', beat.includes(`${mournerFirst} looks at you`), beat.slice(0, 160));
      ok('beat does NOT name the successor as speaker', !beat.includes(`${succFirst} looks at you`), 'misattributed');
      ok('mourner is alive on the roster', (v.roster || []).includes(mourner), 'dead speaker!');
    }
    ok('no other "You\'re not" lines', lines.filter(l => /You're not /.test(l)).length <= 1, 'double beat');
  }

  // ---------- T2. negative control: nobody above 55 -> silence ----------
  console.log('\n-- T2. nobody above 55: no beat --');
  {
    const ids = await freshGame();
    const v = Game.state.village;
    for (const id of ids) v.trust[id] = 10 + (ids.indexOf(id) % 5);
    const lines = withCapturedSay(() => Game.playerDeath('the expedition'));
    ok('beat silent', !lines.some(l => /You're not /.test(l)), lines.filter(l => /You're not /.test(l)).join(' ').slice(0, 120));
  }

  // ---------- T3. dead-speaker guard: only a corpse is above 55 ----------
  console.log('\n-- T3. corpse above 55 cannot deliver the beat (weirdness-hunt fix) --');
  {
    const ids = await freshGame();
    const v = Game.state.village;
    const deadId = ids[0];
    try { Game.removeVillager(deadId, 'killed'); } catch (e) {}
    // re-stamp the trust entry to mimic an unpruned map (the old bug shape)
    v.trust[deadId] = 80;
    const living = (v.roster || []).filter(id => id !== Game.villagerId);
    for (const id of living) v.trust[id] = 10;
    const deadFirst = first(charName(deadId));
    const lines = withCapturedSay(() => Game.playerDeath('the expedition'));
    const beat = lines.find(l => /You're not /.test(l));
    ok('beat silent when only a corpse clears 55', !beat, beat ? beat.slice(0, 160) : '');
    ok('dead id not on the living roster', !(v.roster || []).includes(deadId), 'still rostered');
    ok('dead first name never speaks', !lines.some(l => l.includes(`${deadFirst} looks at you`)), 'DEAD NEVER SPEAK violated');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
