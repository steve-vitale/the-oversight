#!/usr/bin/env node
// BEFORE transcript capture for the favor-system rebuild (2026-10-11).
// Dumps a full favor-want conversation transcript on current master code,
// so Steve can sense-read before/after. Deterministic via SEED.
// Run: node scripts/dump-favor-transcript-20261011.js > evidence/2026-10-11/favor-transcript-before.md
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
const SEED = parseInt(process.env.SEED || '20261011', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.state.scholar.kcal = 50000;
  const roster = () => (Game.state.village.roster || []).filter(id => id !== Game.villagerId);

  // Force a favor want: make the first villager hungry so ask_favor picks high.
  const vid = roster()[0];
  Game.npcNeeds(vid).hunger = 85;
  Game.state.village.convoSeeds = {};
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 30;

  console.log('# BEFORE transcript — favor want (seed ' + SEED + '), current master code\n');
  Game.startConvo(vid);
  const dump = (tag) => {
    const c = Game.convoGet(vid);
    console.log('--- ' + tag + ' (want=' + ((c.want && c.want.id) || '?') + ' stage=' + ((c.want && c.want.stage) || 0) + ') ---');
    for (const e of (c.transcript || []).slice(-6)) {
      console.log((e.who === 'you' ? 'YOU: ' : 'NPC: ') + e.text);
    }
    console.log('');
  };
  dump('opening');
  // Path: ask "how can I help?" repeatedly (the hostile repeat path), then commit-less leave
  const findChoice = (id) => (Game.convoChoices(vid) || []).find(x => x.id === id);
  // answer any hanging generic question first (want menu waits behind it)
  let gq = findChoice("gq:open:take") || findChoice("gq:open:unsure");
  if (gq) { Game.convoTurn(vid, gq.id); dump("after answering their question"); }
  let h = findChoice("dlg:help");
  if (h) { Game.convoTurn(vid, 'dlg:help'); dump('after "How can I help?" #1'); }
  let d = findChoice('dlg:details');
  if (d) { Game.convoTurn(vid, 'dlg:details'); dump('after "Tell me what\'s going on."'); }
  h = findChoice('dlg:help');
  if (h) { Game.convoTurn(vid, 'dlg:help'); dump('after "How can I help?" #2'); }
  d = findChoice('dlg:details');
  if (d) { Game.convoTurn(vid, 'dlg:details'); dump('after details #2'); }
  d = findChoice('dlg:details');
  if (d) { Game.convoTurn(vid, 'dlg:details'); dump('after details #3'); }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  console.log('FINAL: resolution=' + ((c.want && c.want.resolution) || '?'));
  console.log('seed planted: ' + JSON.stringify((Game.state.village.convoSeeds || {})[vid] || null));
  console.log('obligation tracked: ' + JSON.stringify((Game.state.village.promises || {})[vid] || null));
  // full transcript for the record
  console.log('\n## FULL TRANSCRIPT\n');
  for (const e of (c.transcript || [])) {
    console.log((e.who === 'you' ? 'YOU: ' : 'NPC: ') + e.text + '\n');
  }
})();
