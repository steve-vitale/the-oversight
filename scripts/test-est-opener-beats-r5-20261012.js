#!/usr/bin/env node
// Proof: opener-beat hygiene (journey establishment r5, 2026-10-12).
// Two sense-failures caught live in r5 transcripts:
//   A. PENDING-INVITE LURE GLUE — the pending-invite lure ("Come get air
//      with me. I need to think out loud.") was space-glued onto the want
//      opener ("We're down to 0 liters of clean water." ... "you and me?"
//      "Come get air with me...") — three discourse moves in one breath.
//      Fixed: the lure speaks as its own THEM beat after the opener.
//   B. VOICE-OPENER ON SELF-NAMING FAVOR HEADS — voiceLine prepended a
//      discourse opener ("The way I read it — ") onto an already self-naming
//      favor follow-up head ("Never mind the food I needed — ...").
//      Fixed: voiceLine never leads favor heads with an opener, and filters
//      dash-led closers on them.
// RED on pristine (invite glued; opener prepended), GREEN fixed.
// Usage: node scripts/test-est-opener-beats-r5-20261012.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 20261012;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const EXCLUDE = new Set(['app.js', 'sprites.js', 'tile-scenes.js', 'move-anim.js', 'drama.js']);
const files = [];
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const seen = new Set();
  for (const m of html.matchAll(/src="([^"]+)"/g)) {
    let f = m[1].split('?')[0];
    if (!f.endsWith('.js')) continue;
    const base = path.basename(f);
    if (EXCLUDE.has(base)) continue;
    if (seen.has(f)) continue;
    seen.add(f);
    files.push(f);
  }
}
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];

  // ---------- B. voiceLine on self-naming favor heads ----------
  // Force the voice path: every profile applies (p=1) and carries a marked
  // open fragment; Math.random stubbed to 0 so the open branch is taken.
  const V = Game.data.characterGen.voice || {};
  const savedP = {};
  for (const k of Object.keys(V.profiles || {})) {
    savedP[k] = V.profiles[k].p;
    V.profiles[k].p = 1;
    V.profiles[k].open = (V.profiles[k].open || []).concat(['ZZOPENMARK — ']);
    V.profiles[k].close = [];
  }
  const realRandom = Math.random;
  Math.random = () => 0;
  const heads = [
    '"About the food I needed — have you had a chance? Today\'s the day."',
    '"Never mind the food I needed — we got it handled. Thanks anyway."',
    '"You came through on the food I needed. I won\'t forget it."',
    '"You said you\'d help with the food I needed. ...It\'s done now. Forget it."',
    '"I asked Logan about the food I needed — Logan\'s gone. Still need hands. Are you in?"',
  ];
  for (const h of heads) {
    const out = Game.voiceLine(vid, h);
    const headStart = h.slice(1, h.indexOf(' ', 1) > 0 ? h.indexOf(' ', 1) : 4);
    check('voiceLine never prepends an opener onto favor head: ' + h.slice(1, 28) + '…',
      typeof out === 'string' && out.indexOf('ZZOPENMARK') === -1,
      'got: ' + out);
    // the head itself must survive intact (closers may still trail — allowed)
    check('favor head text survives voiceLine: ' + h.slice(1, 28) + '…',
      typeof out === 'string' && out.indexOf(h.slice(1, -1)) === 1,
      'got: ' + out);
  }
  Math.random = realRandom;
  for (const k of Object.keys(savedP)) V.profiles[k].p = savedP[k];

  // ---------- A. pending-invite lure as its own beat ----------
  // Force an acute hunger need -> ask_favor urgency 4 wins want selection.
  Game.npcNeeds(vid).hunger = 85;
  const bs = Game.betrayalState();
  bs.invites = bs.invites || {};
  bs.invites[vid] = { count: 0, accepted: 0, outcomes: [], pending: { defId: 'air', day: (Game.state.scholar || {}).day || 1 } };
  const r = require('./lib/conversation-playtest').openInvite(Game,vid);
  const them = (r.transcript || []).filter(e => e.who === 'them').map(e => String(e.text || ''));
  const LURE = 'Come get air with me';
  const lureEntries = them.filter(t => t.indexOf(LURE) !== -1);
  check('invite lure is spoken (present in transcript)', lureEntries.length >= 1,
    'them entries: ' + them.length);
  const opener = them[0] || '';
  check('invite lure is NOT glued onto the opener', opener.indexOf(LURE) === -1,
    'opener: ' + opener.slice(0, 140));
  check('invite lure stands as its own beat', lureEntries.some(t => t.trim() === '"Come get air with me. I need to think out loud."'),
    'lure entries: ' + JSON.stringify(lureEntries).slice(0, 160));
  check('opener still carries the favor ask', /spare|anything|can't keep going|liters|hunger|stomach/i.test(opener),
    'opener: ' + opener.slice(0, 120));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
