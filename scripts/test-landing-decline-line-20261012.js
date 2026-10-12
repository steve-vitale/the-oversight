#!/usr/bin/env node
// PROOF: decline-line honesty (journey landing r5 2026-10-12).
// When two villagers' invitation-declines land inside the run-ledger window,
// the verbatim decline line ("Another time, then...") gets run-blocked and
// sayLine fell back to the generic dry pool — "...Sorry, lost my train of
// thought." as the response to a direct "Not this time." is a non-sequitur.
// Fixed: declineLine() cycles decline-ACKNOWLEDGING alternates (canonical
// line when fresh, first un-ledgered alternate when blocked).
//
// RED on pristine HEAD: 2nd decline returns the dry line (2 FAIL).
// GREEN fixed: alternates acknowledge the decline (all PASS).
//
// Usage: node scripts/test-landing-decline-line-20261012.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 4242;
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
for (const m of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/src="([^"]+)"/g)) {
  const f = m[1].split('?')[0];
  if (!f.endsWith('.js')) continue;
  if (EXCLUDE.has(path.basename(f))) continue;
  eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
}
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}
const CANON = '"Another time, then." A small thing, pocketed.';
const ALTERNS = ['"Right — another time."', '"Fair enough. Rain check."', '"Suit yourself."'];
const DRY = /lost my train of thought|Never mind — go on|Actually, forget it/;

function trustOf(vid) { return ((Game.state.village.trust || {})[vid] ?? 10); }

function declineOnce(vid, defId) {
  const day = (Game.state.scholar && Game.state.scholar.day) || 1;
  Game.inviteHistory(vid).pending = { defId: defId || 'look', day };
  Game.startConvo(vid);
  const t0 = trustOf(vid);
  const r = Game.convoTurn(vid, 'betrayal:decline');
  const trustDelta = trustOf(vid) - t0; // before endConvo: its natural-end trust grant would mask the decline cost
  Game.endConvo(vid, 'done');
  return { line: String((r && r.line) || ''), trustDelta };
}

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);

  // 1st decline: canonical line, trust drops
  const d1 = declineOnce(roster[0]);
  console.log('decline1: ' + d1.line.slice(0, 80));
  ok(d1.line.indexOf('Another time, then') !== -1, 'first decline uses the canonical line');
  ok(d1.trustDelta === -1, 'decline still costs 1 trust (got ' + d1.trustDelta + ')');

  // 2nd decline (different villager, same run window): canonical is ledgered
  const d2 = declineOnce(roster[1]);
  console.log('decline2: ' + d2.line.slice(0, 80));
  ok(d2.line !== CANON, 'second decline does NOT parrot the canonical verbatim');
  ok(!DRY.test(d2.line), 'second decline does NOT fall back to a dry non-sequitur');
  ok(ALTERNS.some(a => d2.line.indexOf(a) !== -1), 'second decline acknowledges the decline (' + d2.line.slice(0, 60) + ')');

  // 3rd decline: cycles to a DIFFERENT alternate (no verbatim parrot chain)
  const d3 = declineOnce(roster[2]);
  console.log('decline3: ' + d3.line.slice(0, 80));
  ok(!DRY.test(d3.line), 'third decline still not a dry non-sequitur');
  ok(d3.line !== d2.line, 'third decline varies from the second (cycle, not parrot)');

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST ERROR:', e); process.exit(2); });
