#!/usr/bin/env node
// scripts/test-promisedecay-arm.js — PROMISE DECAY arm (lever loop B, 2026-10-13).
//
// The core decay mechanic (D = clamp(round(20*trustAtBreak/50), 7, 60),
// trustAtBreak stamp, refusal lift in promiseHelp) already landed on master
// (blitz-succession, commit 8e70c94d) and is proven by
// scripts/test-blitz-succession.js. THIS script proves the three blanks that
// remained open after that landing:
//
//   1. AMENDS UNREACHABLE: a broken promise hits TRUST (-15), never rep dims —
//      so makeAmends' worstRepAxis gate (<= -15) never fires for a broken word
//      and the UI button (app.js, worstRepAxis gate) never shows. Steve's
//      "amends reopen immediately" was unreachable in real play. This script
//      proves a broken-promise amends path exists: makeAmends owns the broken
//      word directly, writes an 'amends' memory, and promiseHelp reopens the
//      same day.
//   2. RESET-NOT-STACK: a second break after amends stamps a fresh
//      promise_broken + fresh trustAtBreak; the most recent break governs D.
//   3. SUCCESSION: the broken promise "died with its maker" (canon,
//      conversation.js MEM_INH: "not yours to carry"). The promiseHelp refusal
//      must NOT fire for a successor bearer — only for the maker. Maker is
//      stamped on the promise_broken memory.
//
// RED PHASE: run this on the pre-change tree (git stash NOT allowed — use
// PRISTINE=1 like test-blitz-succession.js) and watch the new assertions fail;
// run on the worktree after the change and watch them pass. The D-formula and
// trustAtBreak-stamp assertions already pass pre-change (regression guard).
//
// Pre-registration (evidence header sim-promisedecay):
//   primary metric: refusal-lift timing vs D on instrumented broken promises
//     + amend reopening latency (must be same-day).
//   GO: refusal lifts within D±2 days on all instrumented cases AND amends
//     reopen same-day AND trust trajectories on identical seeds not degraded
//     beyond ±10% AND >=3 sense-tested transcripts judged coherent.
//   horizon 150d death-aware (sweep-compare), 8 seeds (11/22/33/44 x
//     competent/winseek).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const PRISTINE = process.env.PRISTINE === '1';

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '20261013', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
const PRISTINE_FILES = new Set(['src/js/game.js']);
function readSrc(f) {
  if (PRISTINE && PRISTINE_FILES.has(f)) return execSync('git show HEAD:' + f, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString();
  return fs.readFileSync(path.join(ROOT, f), 'utf8');
}
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
global.localStorage = {
  _s: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._s, k) ? this._s[k] : null; },
  setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; },
};
order.forEach(f => { eval(readSrc(f)); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;
console.log((PRISTINE ? '[PRISTINE — HEAD game.js]' : '[worktree]') + ' seed ' + SEED + ', ' + order.length + ' modules');

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const said = [];
  Game.say = (m) => { said.push(String(m)); };
  const S = () => Game.state.scholar;
  const V = () => Game.state.village;

  function breakPromiseWith(vid, trustLevel, keepableGoal) {
    const v = V();
    Game.data.villagers.find(x => x.id === vid).goal = keepableGoal || 'feed';
    v.trust = v.trust || {};
    const day0 = S().day;
    const p = Game.promiseHelp(vid);
    if (!(p && p.ok)) return null;
    v.trust[vid] = trustLevel;
    S().day = day0 + 8;
    Game.checkPromises('none', null); // 'none' matches no keep kind -> it rots
    const mem = (v.memory[vid] || []).filter(m => m.t === 'promise_broken').pop();
    return { mem, day0, breakDay: mem ? mem.day : day0 + 8 };
  }

  // ============ 0. regression guard: landed decay still works ============
  console.log('\n[decay] regression: stamp + formula + lift (landed, pre-change)');
  {
    const vid = Game.npcIds()[0];
    const b = breakPromiseWith(vid, 50);
    ok(!!b && !!b.mem, 'promise broke (instrumented)');
    ok(b && b.mem && b.mem.trustAtBreak === 50, 'trustAtBreak stamped (50)', 'got ' + (b && b.mem && b.mem.trustAtBreak));
    ok(Game.promiseDecayDays(50) === 20, 'D=20 for trustAtBreak 50');
    const vid2 = Game.npcIds()[1];
    const table = [[10, 7], [50, 20], [80, 32], [100, 40]];
    let ti = 0;
    for (const [t, D] of table) {
      const vt = Game.npcIds()[1 + (ti++)]; // fresh villager per row
      const c = breakPromiseWith(vt, t, 'protect');
      ok(c && c.mem, `break instrumented at trust ${t}`);
      ok(c && c.mem && c.mem.trustAtBreak === t, `trustAtBreak stamped (${t})`);
      S().day = c.breakDay + D - 1;
      ok(Game.promiseHelp(vt) === null, `refusal holds at D-1 (D=${D})`);
      S().day = c.breakDay + D;
      const r = Game.promiseHelp(vt);
      ok(r && r.ok, `refusal lifts at exactly D (${D})`);
    }
  }

  // ============ 1. AMENDS FOR A BROKEN PROMISE (the blank) ============
  console.log('\n[amends] broken-promise amends path exists and reopens same day');
  {
    const vid = Game.npcIds()[5];
    const v = V();
    const b = breakPromiseWith(vid, 45);
    ok(!!b && !!b.mem, 'break instrumented (trust 45)');
    // The pre-change world: worstRepAxis is null (breaks only move trust) —
    // the new canMakeAmends helper must be true anyway.
    ok(Game.worstRepAxis(vid) === null, 'no rep axis (precondition: breaks never touched rep)');
    ok(typeof Game.canMakeAmends === 'function', 'canMakeAmends helper exists');
    ok(Game.canMakeAmends(vid), 'canMakeAmends true for broken word without rep damage');
    const before = said.length;
    const am = Game.makeAmends(vid);
    ok(am && am.ok, 'makeAmends owns the broken word (no rep fabrication needed)');
    const mems = (v.memory[vid] || []).filter(m => m.t === 'amends');
    ok(mems.length > 0, "'amends' memory written");
    const amendsSaid = said.slice(before).join('\n');
    ok(/amends/i.test(amendsSaid) || /word|promise|vow/i.test(amendsSaid),
      'amends dialogue names the broken word (sense check)', amendsSaid.split('\n').pop());
    const r = Game.promiseHelp(vid);
    ok(r && r.ok, 'amends reopen the promise path same-day');
    // once-per-day cap still holds
    const am2 = Game.makeAmends(vid);
    ok(am2 === null, 'second amends same day still refused (contrition takes time)');
  }

  // ============ 2. RESET-NOT-STACK ============
  console.log('\n[multi] second break after amends resets D (no stacking)');
  {
    const vid = Game.npcIds()[6];
    const v = V();
    const b1 = breakPromiseWith(vid, 50); // D=20
    ok(!!b1 && !!b1.mem, 'first break instrumented (D=20)');
    Game.makeAmends(vid); // reopens the door
    // walk through it: make a SECOND promise, then break it at trust 80
    const p2 = Game.promiseHelp(vid);
    ok(p2 && p2.ok, 'second promise made after amends');
    v.trust[vid] = 80;
    S().day = (b1.breakDay || 0) + 12;
    Game.checkPromises('none', null);
    const mems = (v.memory[vid] || []).filter(m => m.t === 'promise_broken');
    const latest = mems[mems.length - 1];
    ok(mems.length >= 2, 'second break recorded as a new memory', 'count ' + mems.length);
    ok(latest && latest.trustAtBreak === 80, 'latest break stamps fresh trustAtBreak (80)', 'got ' + (latest && latest.trustAtBreak));
    ok(Game.promiseDecayDays(80) === 32, 'latest break governs D (32, not 20)');
    S().day = latest.day + 31;
    ok(Game.promiseHelp(vid) === null, 'refusal holds at D2-1 (32-1), not lifted by the old D=20 window');
    S().day = latest.day + 32;
    const r = Game.promiseHelp(vid);
    ok(r && r.ok, 'refusal lifts at the NEW D (32)');
  }

  // ============ 3. SUCCESSION: the broken promise died with its maker ============
  console.log('\n[succession] refusal does not bind the successor bearer');
  {
    const vid = Game.npcIds()[7];
    const v = V();
    const maker = Game.villagerId;
    const b = breakPromiseWith(vid, 60); // D=24
    ok(!!b && !!b.mem, 'break instrumented as maker (D=24)');
    ok(b.mem.maker === maker, 'promise_broken memory stamps the maker', 'got ' + b.mem.maker);
    const oldFirst = ((Game.data.villagers.find(x => x.id === maker) || {}).name || '').split(' ')[0];
    Game.playerDeath('the test wilds');
    const succ = Game.villagerId;
    ok(succ !== maker, 'mantle passed to a successor');
    const r = Game.promiseHelp(vid);
    ok(r && r.ok, 'successor is NOT refused for the predecessor\'s broken word');
    const succSaid = said.slice(-4).join('\n');
    ok(!/You said that before/.test(succSaid), 'no "you said that before" addressed to the wrong person');
    // the memory survives as bitterness — talk about it and the NPC remembers
    console.log('    succession note: memory persists (' + ((v.memory[vid] || []).filter(m => m.t === 'promise_broken').length) + ' promise_broken), refusal dead');
  }

  // ============ 4. TRUST-GRIEFING GUARD: amends is a start, not a repair ============
  console.log('\n[trust] amends contrition never exceeds the break penalty');
  {
    const vid = Game.npcIds()[8];
    const v = V();
    const b = breakPromiseWith(vid, 40);
    ok(!!b && !!b.mem, 'break instrumented (trust 40)');
    const afterBreak = v.trust[vid];
    ok(afterBreak === 25, 'break cost 15 trust (40 -> 25)', 'got ' + afterBreak);
    Game.makeAmends(vid);
    const afterAmends = v.trust[vid];
    ok(afterAmends > afterBreak, 'amends moves trust back up (contrition)');
    ok(afterAmends <= 40, 'amends never exceeds pre-break standing (no griefing laundering)', 'got ' + afterAmends);
  }

  // ============ 5. SENSE TRANSCRIPTS (printed for the assessor) ============
  console.log('\n[transcript] three sense-tested scenes:');
  {
    const vid = Game.npcIds()[9];
    Game.data.villagers.find(x => x.id === vid).goal = 'feed';
    V().trust = V().trust || {}; V().trust[vid] = 70;
    const d0 = S().day;
    Game.promiseHelp(vid); S().day = d0 + 8; Game.checkPromises('fight', null);
    const m0 = said.length;
    Game.promiseHelp(vid); // refused
    console.log('\n--- (1) refusal ---\n' + said.slice(m0).join('\n'));
    const m1 = said.length;
    Game.makeAmends(vid);
    console.log('\n--- (2) broken-word amends ---\n' + said.slice(m1).join('\n'));
    const m2 = said.length;
    S().day = d0 + 8 + 33; // decay window for trust 70 -> D=28 passed
    const pp = Game.promiseHelp(vid);
    console.log('\n--- (3) decay-lifted promise (' + (pp && pp.ok ? 'reopened' : 'still refused') + ') ---\n' + said.slice(m2).join('\n'));
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  if (failures.length) console.log('FAILURES:\n - ' + failures.join('\n - '));
  process.exit(fail ? 1 : 0);
})();
