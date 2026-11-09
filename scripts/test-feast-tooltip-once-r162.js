#!/usr/bin/env node
// test-feast-tooltip-once-r162.js — journey-endgame r162 proof: the surge
// arming beat explains the FEASTED buff in a ~200-char parenthetical.
// The pilot counted it 237 times in one seed's transcript (89702) — the
// same tooltip on every arming, a filler loop. The fix: say it once per
// KEEPSAKE; repeat armings of the same item keep the short form, and a
// new keepsake's first arming still states the honest buff terms
// (test-main67-beat-identity A-1 requires FEASTED on every item's
// devotion line). The arming itself is unchanged.
//
// RED on pre-fix code: the repeat-arming checks fail.
// GREEN after: 1st arming per item has it, repeats do not, surge still
// arms every time; the practice branch does not consume the one tooltip.
//
// Usage: node scripts/test-feast-tooltip-once-r162.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SEED = 20261109;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync(`grep -o 'src/js/[^\"'\"'\"']*\\.js' index.html | head -80`, { cwd: ROOT })
  .toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const said = [];
function freshGame() {
  said.length = 0;
  Game.say = function (t) { said.push(String(t)); };
  Game.sysSay = function () {};
  Game.audioEvent = function () {};
  Game.genRoster('Columbus, Ohio');
  let pick = Game.generatedRoster[0];
  for (const v of Game.generatedRoster) {
    const has = (v.items || []).some(id => { const d = (Game.data.items || []).find(i => i.id === id); return d && d.class === 'sentimental'; });
    if (has) { pick = v; break; }
  }
  const sentIds = (pick.items || []).filter(id => { const d = (Game.data.items || []).find(i => i.id === id); return d && d.class === 'sentimental'; });
  const funcIds = (pick.items || []).filter(id => { const d = (Game.data.items || []).find(i => i.id === id); return d && d.class !== 'sentimental'; });
  const chosen = [...funcIds.slice(0, 5 - Math.min(2, sentIds.length)), ...sentIds.slice(0, 2)].slice(0, 5);
  Game.newGame('Columbus, Ohio', null, pick.id, chosen.length === 5 ? chosen : null);
  Game.depart();
  const s = Game.state.scholar;
  s.mx = 4; s.my = 4; s.kcal = 3000; s.health = 100; s.trauma = 0;
  Game.state.systemArrived = true;
  Game.progState();
  return s;
}
function keepsakeIdx(s) {
  const inv = s.inventory || [];
  for (let i = 0; i < inv.length; i++) if (Game.isKeepsake(inv[i])) return i;
  return -1;
}
function keepsakeIdxs(s) {
  const out = [];
  const inv = s.inventory || [];
  for (let i = 0; i < inv.length; i++) if (Game.isKeepsake(inv[i])) out.push(i);
  return out;
}
const TIP = 'The next feast grants FEASTED';

(async () => {
  await Game.init();

  // Mastery lane: 3 gifts at L3. Arm on day D, arm again on day D+1.
  console.log('-- mastery lane --');
  {
    const s = freshGame();
    Game.teachSentiment();
    s.trauma = 0;
    s.abilities = [{ id: 'a1', name: 'A1', level: 3, xp: 0 }, { id: 'a2', name: 'A2', level: 3, xp: 0 }, { id: 'a3', name: 'A3', level: 3, xp: 0 }];
    const idx = keepsakeIdx(s);
    ok('fresh game has a keepsake', idx >= 0);
    s.day = (s.day || 1) + 1;
    const m1 = Game.channelSentiment(idx);
    ok('1st arming carries the FEASTED tooltip', m1.includes(TIP), m1.slice(0, 140));
    ok('1st arming arms the surge', !!s.prog.feastSurge, String(s.prog.feastSurge));
    const surge1 = s.prog.feastSurge;
    s.day = (s.day || 1) + 1;
    const m2 = Game.channelSentiment(idx);
    ok('2nd arming drops the tooltip', !m2.includes(TIP), m2.slice(0, 140));
    ok('2nd arming still arms the surge', !!s.prog.feastSurge && s.prog.feastSurge === surge1, String(s.prog.feastSurge));
    ok('2nd arming keeps the short form', m2.includes('The feast was the weapon'), m2.slice(0, 140));
    s.day = (s.day || 1) + 1;
    const m3 = Game.channelSentiment(idx);
    ok('3rd arming still drops the tooltip', !m3.includes(TIP));
  }

  // Per-ITEM once: a NEW keepsake's first arming still states the honest
  // buff terms (test-main67-beat-identity A-1 requires FEASTED on every
  // item's devotion line). Arm item A twice, then item B once and twice.
  console.log('-- per-item once, new keepsake re-explains --');
  {
    const s = freshGame();
    Game.teachSentiment();
    s.trauma = 0;
    s.abilities = [{ id: 'a1', name: 'A1', level: 3, xp: 0 }, { id: 'a2', name: 'A2', level: 3, xp: 0 }, { id: 'a3', name: 'A3', level: 3, xp: 0 }];
    const idxs = keepsakeIdxs(s);
    ok('fresh game has 2 keepsakes', idxs.length >= 2, `got ${idxs.length}`);
    if (idxs.length >= 2) {
      s.day = (s.day || 1) + 1;
      const a1 = Game.channelSentiment(idxs[0]);
      ok('item A 1st arming carries the tooltip', a1.includes(TIP));
      s.day = (s.day || 1) + 1;
      const a2 = Game.channelSentiment(idxs[0]);
      ok('item A 2nd arming drops the tooltip', !a2.includes(TIP));
      s.day = (s.day || 1) + 1;
      const b1 = Game.channelSentiment(idxs[1]);
      ok('item B 1st arming carries the tooltip (honest terms per item)', b1.includes(TIP), b1.slice(0, 140));
      ok('item B 1st arming still arms the surge', !!s.prog.feastSurge);
      s.day = (s.day || 1) + 1;
      const b2 = Game.channelSentiment(idxs[1]);
      ok('item B 2nd arming drops the tooltip', !b2.includes(TIP));
    }
  }

  // Devotion lane: 0 mastered, resonance >= 35. Same once-behavior.
  console.log('-- devotion lane --');
  {
    const s = freshGame();
    Game.teachSentiment();
    s.trauma = 0;
    s.abilities = [{ id: 'w', name: 'W', level: 1, xp: 0 }];
    s.prog.surgeResonance = 40;
    const idx = keepsakeIdx(s);
    s.day = (s.day || 1) + 1;
    const m1 = Game.channelSentiment(idx);
    ok('devotion 1st arming carries the tooltip', m1.includes(TIP), m1.slice(0, 140));
    ok('devotion 1st arming arms the surge', !!s.prog.feastSurge);
    s.day = (s.day || 1) + 1;
    const m2 = Game.channelSentiment(idx);
    ok('devotion 2nd arming drops the tooltip', !m2.includes(TIP), m2.slice(0, 140));
    ok('devotion 2nd arming keeps the short form', m2.includes('The feast was the weapon'));
  }

  // Practice branch must NOT consume the one tooltip: channel for
  // practice first, then arm — the arming still explains the buff.
  console.log('-- practice does not consume the tooltip --');
  {
    const s = freshGame();
    Game.teachSentiment();
    s.trauma = 0;
    s.abilities = [{ id: 'w', name: 'W', level: 1, xp: 0 }];
    s.prog.surgeResonance = 0;
    const idx = keepsakeIdx(s);
    s.day = (s.day || 1) + 1;
    const mp = Game.channelSentiment(idx);
    ok('practice branch fires (no surge)', mp.includes('practice') && !s.prog.feastSurge, mp.slice(0, 120));
    s.abilities = [{ id: 'a1', name: 'A1', level: 3, xp: 0 }, { id: 'a2', name: 'A2', level: 3, xp: 0 }, { id: 'a3', name: 'A3', level: 3, xp: 0 }];
    s.day = (s.day || 1) + 1;
    const m1 = Game.channelSentiment(idx);
    ok('arming after practice still carries the tooltip', m1.includes(TIP), m1.slice(0, 140));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
