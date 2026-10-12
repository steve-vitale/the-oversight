#!/usr/bin/env node
// PROOF: nonverbal spoken lure (journey landing r5 2026-10-12).
// A pending betrayal invite in a NO-SHARED-LANGUAGE conversation used to
// surface ONLY as English menu labels the NPC never communicated in the
// fiction (the verbal spoken-lure block in startConvo is unreachable on the
// nonverbal early-return path) — the player could accept blind into an armed
// plot. Fixed: nvOpen shows the invitation as a stage-direction gesture
// beat (narration, not quoted speech — the no-English rule holds), once per
// pending, gesturing at the invite's spot.
//
// RED on pristine HEAD: opener lacks the gesture (0 gesture assertions pass).
// GREEN fixed: all 10 assertions pass.
//
// Usage: node scripts/test-landing-nv-lure-20261012.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 777;
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

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const day = (Game.state.scholar && Game.state.scholar.day) || 1;

  // --- nonverbal villager: force a foreign-only tongue ---
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const nvid = roster[0];
  const np = Game.getPerson(nvid);
  np.languages = { native: 'amharic', amharic: 2 };
  Game.state.scholar.languages = { english: 2 };
  const comm = Game.commLevel(nvid);
  ok(comm.level === 'none', 'setup: villager is nonverbal (comm.level none), got ' + comm.level);

  // pending invite on the nonverbal villager
  Game.inviteHistory(nvid).pending = { defId: 'traps', day };
  const r0 = Game.startConvo(nvid);
  const line = String(r0.line || '');
  console.log('--- nonverbal opener ---');
  console.log(line.slice(0, 500));
  console.log('------------------------');
  ok(/mime walking/i.test(line), 'nonverbal: opener contains the invitation gesture');
  ok(/the trap line/.test(line), 'nonverbal: gesture names the invite spot (the trap line)');
  ok(/^\(/.test(line.split('\n').find(l => /mime walking/i.test(l)) || ''), 'nonverbal: gesture is narration, not quoted NPC speech');
  ok(!/"Walk my trap line/i.test(line), 'nonverbal: the English invite label is NOT quoted as their speech');

  // once per pending: a second sitting must not re-gesture
  Game.endConvo(nvid, 'done');
  const r1 = Game.startConvo(nvid);
  ok(!/mime walking/i.test(String(r1.line || '')), 'nonverbal: gesture not repeated in a second sitting (once per pending)');
  Game.endConvo(nvid, 'done');

  // --- verbal control: the r4 spoken-lure fix still works ---
  const vvid = roster[1];
  const vp = Game.getPerson(vvid);
  vp.languages = { native: 'english', english: 2 };
  Game.inviteHistory(vvid).pending = { defId: 'show', day };
  const r2 = Game.startConvo(vvid);
  const vline = String(r2.line || '');
  ok(Game.commLevel(vvid).level === 'full', 'setup: control villager is verbal (full)');
  ok(/Come see what I found/i.test(vline), 'verbal: opener still speaks the lure (r4 fix intact)');
  ok(Game.inviteHistory(vvid).pending && Game.inviteHistory(vvid).pending.spoken === true, 'verbal: inv.spoken marked');
  Game.endConvo(vvid, 'done');

  // --- cross-path: nonverbal gesture marks spoken; later verbal sitting stays silent ---
  const nvid2 = roster[2];
  const np2 = Game.getPerson(nvid2);
  np2.languages = { native: 'amharic', amharic: 2 };
  Game.inviteHistory(nvid2).pending = { defId: 'air', day };
  Game.startConvo(nvid2); Game.endConvo(nvid2, 'done');
  np2.languages = { native: 'english', english: 2 }; // language learned later
  const r3 = Game.startConvo(nvid2);
  ok(!/Come get air with me/i.test(String(r3.line || '')), 'cross-path: lure not re-spoken verbally after the nonverbal gesture');
  Game.endConvo(nvid2, 'done');

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST ERROR:', e); process.exit(2); });
