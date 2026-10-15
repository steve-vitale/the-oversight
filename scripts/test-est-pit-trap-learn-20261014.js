#!/usr/bin/env node
// Journey ESTABLISHMENT r4 blank — PIT_TRAP UNLEARNABLE proof test (2026-10-14).
//
// Blank: pit_trap (the only fat-bearer trap: wild_boar) had NO learning path.
// The witnessed-catch grant (game.js:3250) only fires for a trap already set,
// but craft() enforces L1+ knowledge — so no one could ever set the first one.
// No book granted it, no village codex carried it, no teacher taught it. The
// whole boar-retrieval beat (goring risk, L3 spear-from-above, 96-tick dig)
// was written machinery that could never fire. The R3 harness's RENDER_LADDER
// knob confirmed the consequence: 0 raw fat on 4 seeds x 40 days.
//
// Fix (src/data/books.json): trappers_handbook (the field book for trappers,
// reachable via ruin shelves in the wild — 2026-10-10 TRAP REACHABILITY)
// grants pit_trap at read. Description updated to match.
//
// RED on pristine (PRISTINE=1): the book's unlocks lack pit_trap; readBook
//   leaves codex.recipes.pit_trap unset; craft('pit_trap') refuses.
// GREEN fixed: readBook grants pit_trap L3; craft('pit_trap') builds the trap.
//
// Usage: node scripts/test-est-pit-trap-learn-20261014.js
//        PRISTINE=1 node scripts/test-est-pit-trap-learn-20261014.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const PRISTINE = process.env.PRISTINE === '1';

// SEED BEFORE EVAL — modules capture Math.random at load.
let _s = 424242;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
global.fetch = (f) => Promise.resolve({
  json: () => {
    if (PRISTINE && /books\.json$/.test(f)) {
      return Promise.resolve(JSON.parse(execSync('git show HEAD:src/data/books.json', { cwd: ROOT }).toString('utf8')));
    }
    return Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  }
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const files = [];
for (const line of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n')) {
  const m = /src\/js\/[^\"]*\.js/.exec(line);
  if (m && !/app\.js|tile-scenes\.js|move-anim\.js|drama\.js|sprites\.js/.test(m[0])) files.push(m[0]);
}
for (const f of files) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

async function main() {
  console.log((PRISTINE ? 'PRISTINE (expect RED)' : 'FIXED (expect GREEN)') + ' — pit_trap learnable via trappers_handbook');
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const book = (Game.data.books || []).find(b => b.id === 'trappers_handbook');
  ok(!!book, 'trappers_handbook exists in data');
  const grantsPit = book && (book.unlocks.recipes || []).includes('pit_trap');
  ok(!!grantsPit, 'trappers_handbook unlocks include pit_trap (data)');

  // No recipe knowledge at start (non-hunter scholar).
  const before = ((Game.state.codex.recipes || {}).pit_trap || {}).level || 0;
  ok(before === 0, 'pit_trap unknown before reading (level ' + before + ')');

  Game.readBook('trappers_handbook');
  const after = ((Game.state.codex.recipes || {}).pit_trap || {}).level || 0;
  ok(after >= 1, 'readBook grants pit_trap (level ' + after + ')');

  // The craft gate (L1+) opens: 2 sticks -> a real pit trap tool. Craft has an
  // 85% success roll, so a real player retries — the test allows 3 attempts.
  try {
    let held = false, r = null;
    for (let i = 0; i < 3 && !held; i++) {
      const inv = Game.state.scholar.inventory;
      inv.push({ material: 'stick', units: 2, unit: 'stick', name: 'Stick', kcalEach: 0, spoilDay: 9999 });
      r = Game.craft('pit_trap');
      held = (Game.state.scholar.tools || []).some(t => t && t.recipeId === 'pit_trap');
    }
    ok(!!r && held, 'craft(pit_trap) builds the trap after learning');
  } catch (e) { ok(false, 'craft(pit_trap) threw: ' + (e && e.message)); }

  console.log('RESULT: ' + pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
