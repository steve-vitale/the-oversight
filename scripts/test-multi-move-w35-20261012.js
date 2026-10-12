#!/usr/bin/env node
// Proof: wave 3-5 multi-move attack kits (2026-10-12).
// (a) every wave-3/4/5 monster has >=2 implemented attacks; every
//     codex-documented move is in the kit (EXT = fiction-fitting addition)
// (b) tile patterns (beam/burst/charge/line) have windup>=2
// (c) move-choice legality: firstTurn openers, bloodied phases, cooldowns
// (d) telegraph commits the chosen move; odds -> exact when learned
// (e) tactics execute (rally/reposition/withdraw/recover/model)
// (f) spoiler kit is minimal & bloodied-gated (hook owns the fight)
// (g) titan kits present, damage undiminished
// Multi-seed via SEED env.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261012', 10);
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ a >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(SEED); // seeded BEFORE eval: modules capture Math.random at load
global.window = global; // eval-time stub for equipment.js
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
const files = fs.readFileSync('/tmp/harness-list.txt', 'utf8').trim().split('\n');
const gameIdx = files.indexOf('src/js/game.js');
eval(fs.readFileSync(path.join(ROOT, files[gameIdx]), 'utf8'));
// node evals don't share the browser's global lexical scope: game.js's
// `const Game` is invisible to later modules' load-time code. Expose it.
global.Game = globalThis.Scattering.Game;
// table.js must load before table-*.js (they call Game.tableRegisterPath at load)
const tableIdx = files.indexOf('src/js/table.js');
if (tableIdx >= 0) eval(fs.readFileSync(path.join(ROOT, files[tableIdx]), 'utf8'));
files.forEach((f, i) => { if (i !== gameIdx && i !== tableIdx) eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; // runtime: sync combat path
Game.data = global.SCATTER_DATA;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}
const WAVE3 = ['redactor', 'gavel', 'focus_group', 'spool', 'chorus_line', 'terms_of_service', 'callback', 'buffering', 'ad_break'];
const WAVE4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater'];
const WAVE5 = ['cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'nielsen', 'finale', 'network_note'];
const W35 = WAVE3.concat(WAVE4, WAVE5);
const TILE = ['beam', 'burst', 'charge', 'line'];
// Every move the codex documents per monster (from codexStages.slain "Moves:").
const CODEX_MOVES = {
  redactor: ['Redact', 'Return'],
  gavel: ['Verdict', 'Accusation'],
  focus_group: ['Deliberation'],
  spool: ['Replay', 'Record'],
  chorus_line: ['Downbeat'],
  terms_of_service: ['Clause'],
  callback: ['Encore'],
  buffering: ['Catch Up'],
  ad_break: ['Sponsored Pause'],
  congregation: ['Absolution', 'Invitation'],
  strike: ['Walkout'],
  influencer: ['Ratio'],
  audit: ['Assessment'],
  reunion: ['Your Move'],
  suburb: ['Property Tax'],
  eulogy: ['Final Chapter'],
  algorithm: ['Engagement'],
  eater: ['Gorge', 'Smack-Rush'],
  cancellation: ['Under Review'],
  editor: ['Cut'],
  rerun: ['Take Twelve'],
  spoiler: ['Leaked Ending'],
  timeslot: ['Reschedule'],
  nielsen: ['Sweeps Week'],
  finale: ['Season Finale'],
  network_note: ['Just Fix It'],
};
Game.say = function () {}; Game.drama = () => {}; Game.audioEvent = () => {};

function monFighter(monId, key, mx, my, hp) {
  const mdef = Game.data.monsters.find(m => m.id === monId);
  return { key, kind: 'monster', monsterId: monId, mdef, name: 'Test ' + monId, emoji: '\u{1F479}',
    hp: hp || 100, maxHp: hp || 100, speed: 3, mx, my, alive: true, fled: false,
    telegraph: null, hesitate: 0, blind: 0, stunned: 0, moveCd: {} };
}
function synthFight(fighters, php) {
  const pf = { key: 'p', kind: 'player', name: 'You', emoji: '\u{1F9D1}', hp: php || 500, maxHp: 500,
    speed: 6, mx: 4, my: 4, alive: true, fled: false, moveLeft: 6, acted: false, aimed: false };
  const all = [pf, ...fighters];
  Game.tbfight = { fighters: all, over: false, round: 1, order: all.map(f => f.key), turnIdx: 0 };
  return pf;
}

(async () => {
  await Game.init();
  Game.state = Game.state || {};
  Game.state.scholar = Game.state.scholar || {};
  Game.state.codex = Game.state.codex || {};
  Game.state.systemArrived = true;
  const setStage = (n) => {
    Game.state.systemArrived = n > 0;
    Game.state.scholar.integration = n === 3 ? 90 : n === 2 ? 50 : n === 1 ? 10 : 5;
  };
  const mdef = (id) => Game.data.monsters.find(m => m.id === id);

  console.log('A: wave 3-5 kits — >=2 attacks, codex moves covered, attacks[0] is legacy');
  for (const id of W35) {
    const md = mdef(id);
    const atks = md.attacks || [];
    ok(`${id}: >=2 attacks`, atks.length >= 2, `got ${atks.length}`);
    ok(`${id}: attacks[0] is legacy attack`, atks[0] && atks[0].name === (md.attack || {}).name,
      `${atks[0] && atks[0].name} vs ${(md.attack || {}).name}`);
    const names = atks.map(a => a.name);
    for (const cm of (CODEX_MOVES[id] || [])) {
      ok(`${id}/${cm}: codex move in kit`, names.includes(cm), names.join(','));
    }
    // every damaging move has a telegraph (honesty rule)
    for (const a of atks) {
      if (a.damage) ok(`${id}/${a.name}: telegraph text`, typeof a.telegraph === 'string' && a.telegraph.length > 10, a.telegraph);
      else ok(`${id}/${a.name}: tactic telegraph text`, typeof a.telegraph === 'string' && a.telegraph.length > 10, a.telegraph);
    }
  }

  console.log('B: tile patterns windup>=2');
  for (const id of W35) {
    for (const a of (mdef(id).attacks || [])) {
      const p = a.pattern || {};
      if (TILE.includes(p.type)) {
        ok(`${id}/${a.name}: ${p.type} windup>=2`, (p.windup || 0) >= 2, `windup=${p.windup}`);
      }
    }
  }

  console.log('C1: firstTurn openers — gavel Accusation, congregation Invitation');
  {
    const foeAt = (d) => ({ f: { mx: 4 + d, my: 4 }, d });
    for (const [id, move] of [['gavel', 'Accusation'], ['congregation', 'Invitation'], ['focus_group', 'Cold Open']]) {
      const md = mdef(id);
      const atk = md.attacks.find(a => a.name === move);
      const m1 = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} };
      ok(`${id}/${move}: legal on turn 1`, Game.tbMoveLegal(m1, atk, 3, 1) === true);
      const m2 = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {}, moveTurnsUsed: 2 };
      ok(`${id}/${move}: illegal after turn 1`, Game.tbMoveLegal(m2, atk, 3, 1) === false);
    }
  }

  console.log('C2: bloodied phases — gavel Contempt, editor Director\'s Cut, timeslot Sweeps Stunt');
  {
    for (const [id, move, below] of [['gavel', 'Contempt', 0.5], ['editor', "Director's Cut", 0.35], ['timeslot', 'Sweeps Stunt', 0.4], ['spoiler', 'Post-Credits Scene', 0.5], ['finale', 'Cliffhanger', 99]]) {
      const md = mdef(id);
      const atk = md.attacks.find(a => a.name === move);
      if (!atk) { ok(`${id}/${move}: exists`, false, 'missing'); continue; }
      if (atk.condition && atk.condition.hpBelow != null) {
        const frac = atk.condition.hpBelow;
        const mLow = { mdef: md, mx: 4, my: 4, hp: 30, maxHp: 100, moveCd: {} };
        const mHigh = { mdef: md, mx: 4, my: 4, hp: 90, maxHp: 100, moveCd: {} };
        ok(`${id}/${move}: legal when bloodied`, Game.tbMoveLegal(mLow, atk, 3, 0.3) === true);
        ok(`${id}/${move}: illegal when healthy`, Game.tbMoveLegal(mHigh, atk, 3, 0.9) === false);
      } else {
        // cooldown-gated instead of bloodied
        ok(`${id}/${move}: has cooldown gate`, !!(atk.condition && atk.condition.cooldownTurns), JSON.stringify(atk.condition));
      }
    }
  }

  console.log('C3: cooldowns — redactor Return fires then rests');
  {
    const md = mdef('redactor');
    const ret = md.attacks.find(a => a.name === 'Return');
    const m = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} };
    Game.tbChooseMove(m, { f: { mx: 7, my: 4 }, d: 3 });
    // force Return by direct legality: fresh fighter, Return should be legal
    const fresh = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} };
    ok('redactor/Return: legal fresh', Game.tbMoveLegal(fresh, ret, 3, 1) === true);
    // simulate choosing it: cooldown set
    const m2 = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: { 'Return': 3 } };
    ok('redactor/Return: illegal on cooldown', Game.tbMoveLegal(m2, ret, 3, 1) === false);
    const m3 = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: { 'Return': 0 } };
    ok('redactor/Return: legal when cooldown expired', Game.tbMoveLegal(m3, ret, 3, 1) === true);
  }

  console.log('D: telegraph commitment + odds -> exact (redactor)');
  {
    setStage(2);
    synthFight([monFighter('redactor', 'm1', 5, 4, 200)], 500);
    const m = Game.tbFighter('m1');
    const p = Game.tbFighter('p'); p.mx = 4; p.my = 4;
    m.mx = 5; m.my = 4;
    Game.tbChooseMove(m, { f: p, d: 1 });
    ok('choose: a move is picked', !!m.moveAtk.name, m.moveAtk && m.moveAtk.name);
    const chosen = m.moveAtk.name;
    Game.encDeclareDirect(m, p);
    ok('telegraph.attackName committed', m.telegraph && m.telegraph.attackName === chosen,
      m.telegraph && m.telegraph.attackName);
    Game.state.codex.monsters = {};
    const cue = Game.tbTelegraphCue(m);
    ok('stage2 unlearned cue: System odds', /Reading intent/.test(cue), cue.slice(0, 140));
    // learn everything -> exact
    const names = (mdef('redactor').attacks || []).map(a => a.name);
    Game.state.codex.monsters['redactor'] = { patterns: {} };
    for (const n of names) Game.state.codex.monsters['redactor'].patterns[n] = 'test';
    const cue2 = Game.tbTelegraphCue(m);
    ok('learned cue: no odds', !/Reading intent/.test(cue2), cue2.slice(0, 140));
    ok('learned: exact move known', Game.tbPatternKnown('redactor', m.telegraph.attackName) === true);
  }

  console.log('E: tactics execute');
  {
    // rally: focus_group Second Take buffs allies
    const mf = { mdef: mdef('focus_group'), mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} };
    const ally = { key: 'a1', kind: 'monster', alive: true, fled: false, mx: 5, my: 5 };
    Game.tbfight = { fighters: [{ key: 'p', kind: 'player', alive: true }, mf, ally], over: false, round: 1 };
    Game.tbMonsterTactic(mf, { f: { mx: 6, my: 4 } }, { tactic: 'rally', telegraph: 'test' }, null);
    ok('Second Take: ally rallyBuff=2', ally.rallyBuff === 2, `rallyBuff=${ally.rallyBuff}`);
    // reposition: buffering Rewind moves (stub occupancy: no map in harness)
    const mb = { mdef: mdef('buffering'), mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} };
    const bx0 = mb.mx, by0 = mb.my;
    const _occ = Game.tbCanOccupy;
    Game.tbCanOccupy = () => true;
    Game.tbMonsterTactic(mb, { f: { mx: 6, my: 4 } }, { tactic: 'reposition', telegraph: 'test' }, null);
    ok('Rewind: monster moved', mb.mx !== bx0 || mb.my !== by0, `${bx0},${by0} -> ${mb.mx},${mb.my}`);
    // withdraw: strike Picket Line moves away
    const ms = { mdef: mdef('strike'), mx: 5, my: 4, hp: 100, maxHp: 100, moveCd: {}, speed: 1 };
    Game.tbMonsterTactic(ms, { f: { mx: 4, my: 4 } }, { tactic: 'withdraw', telegraph: 'test' }, null);
    Game.tbCanOccupy = _occ;
    ok('Picket Line: withdrew from foe', ms.mx > 5 || ms.my !== 4, `${ms.mx},${ms.my}`);
    // recover: ad_break Product Placement exposes
    const ma = { mdef: mdef('ad_break'), mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} };
    Game.tbMonsterTactic(ma, { f: { mx: 5, my: 4 } }, { tactic: 'recover', telegraph: 'test' }, null);
    ok('Product Placement: tacticVuln=2', ma.tacticVuln === 2, `vuln=${ma.tacticVuln}`);
    // model: spool Record / nielsen Overnight Ratings increment prediction
    const msp = { mdef: mdef('spool'), mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} };
    Game.tbMonsterTactic(msp, { f: { mx: 5, my: 4 } }, { tactic: 'model', telegraph: 'test' }, null);
    ok('Record: prediction++', msp.prediction === 1, `pred=${msp.prediction}`);
  }

  console.log('F: spoiler minimal kit — hook owns the fight');
  {
    const md = mdef('spoiler');
    ok('spoiler: exactly 2 moves (minimal)', (md.attacks || []).length === 2, (md.attacks || []).length);
    const pcs = md.attacks.find(a => a.name === 'Post-Credits Scene');
    ok('spoiler: Post-Credits Scene bloodied-gated', !!(pcs && pcs.condition && pcs.condition.hpBelow === 0.5),
      JSON.stringify(pcs && pcs.condition));
    const mLow = { mdef: md, mx: 4, my: 4, hp: 30, maxHp: 100, moveCd: {} };
    const mHigh = { mdef: md, mx: 4, my: 4, hp: 90, maxHp: 100, moveCd: {} };
    ok('spoiler: PCS illegal healthy (hook dominates)', Game.tbMoveLegal(mHigh, pcs, 3, 0.9) === false);
    ok('spoiler: PCS legal bloodied', Game.tbMoveLegal(mLow, pcs, 3, 0.3) === true);
  }

  console.log('G: titan kits — eater/nielsen/finale undiminished');
  {
    for (const id of ['eater', 'nielsen', 'finale']) {
      const md = mdef(id);
      const atks = md.attacks || [];
      ok(`${id}: titan has kit >=2`, atks.length >= 2, atks.length);
      const top = Math.max(...atks.filter(a => a.damage).map(a => a.damage[1]));
      const legTop = (md.attack.damage || [])[1] || 0;
      ok(`${id}: kit top damage >= legacy`, top >= legTop, `${top} vs ${legTop}`);
    }
    const eg = mdef('eater').attacks.find(a => a.name === 'Smack-Rush');
    ok('eater Smack-Rush: charge windup 2', eg.pattern.type === 'charge' && eg.pattern.windup === 2,
      JSON.stringify(eg.pattern));
  }

  console.log(`\n${pass} pass, ${fail} fail (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
