#!/usr/bin/env node
// S1 (r12): sim-opt npcNodeTravel equivalence — OLD vs NEW game.js must
// produce byte-identical world state across a scripted 12-part scenario.
// Isolates the 6f538cd4 change (travelingWith hoist + dead temp/goal
// removal): compares git 6f538cd4^:src/js/game.js vs 6f538cd4:src/js/game.js
// (both predate this run's away-ledger fix, so any diff is the sim-opt's).
//
// Run: GAMEJS=/tmp/game-old.js node scripts/test-travel-r12-simopt.js
//      GAMEJS=<new>            node scripts/test-travel-r12-simopt.js
//      then diff the two canonical dumps. (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '7', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const GAMEJS = process.env.GAMEJS || 'src/js/game.js';
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => {
  const p = (f === 'src/js/game.js') ? GAMEJS : path.join(ROOT, f);
  const src = p.startsWith('/') ? fs.readFileSync(p, 'utf8') : fs.readFileSync(p, 'utf8');
  eval(src);
});
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;
Game.say = () => {};

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  const rs = (v.roster || []).filter(id => id !== Game.villagerId);
  // one party member: exercises the hoisted withYouAll with non-trivial party
  Game.partyState().party.push(rs[0]);
  // prime EVERYONE with a ready forage objective to an adjacent node
  rs.forEach((id, i) => {
    const o = Game.objOf(id);
    o.kind = 'FORAGE'; o.purpose = 'forage'; o.state = 'ready'; o.indoor = false;
    const dx = (i % 2 === 0) ? 1 : -1, dy = (i % 3 === 0) ? 1 : 0;
    o.tx = Math.min(8, Math.max(0, hx + dx)); o.ty = Math.min(8, Math.max(0, hy + dy));
    if (o.tx === hx && o.ty === hy) o.tx = Math.min(8, hx + 1);
    o.partsLeft = 3 + (i % 3); o.tightness = 0;
  });
  // 12 parts, day/night cycling — departures, returns, door drift all fire
  for (let i = 0; i < 12; i++) { Game.dayPart = i % 4; Game.npcNodeTravel(); }
  // canonical dump
  const canon = {
    positions: v.positions || {},
    away: v.away || {},
    npcInside: v.npcInside || {},
    pantryKcal: (v.pantry || []).reduce((a, p) => a + (p.kcalEach || 0) * (p.units || 1), 0),
    trust: v.trust || {},
    objs: {},
    nodes: {},
  };
  for (const id of rs) {
    const o = Game.objOf(id);
    canon.objs[id] = [o.kind, o.state, o.purpose, o.tx, o.ty].join('|');
    try { const n = Game.npcNode(id); canon.nodes[id] = n.nx + ',' + n.ny; } catch (e) { canon.nodes[id] = '?'; }
  }
  canon.explorerNews = v.explorerNews || {};
  console.log(JSON.stringify(canon));
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
