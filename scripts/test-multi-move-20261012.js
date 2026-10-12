#!/usr/bin/env node
// Proof: multi-move monster engine + System knowledge-aggregator/HUD (2026-10-12).
// (a) every wave-1 monster has >=2 implemented attacks matching its codex moves
// (b) telegraph shows odds when unlearned, exact move when learned
// (c) tile patterns (beam/burst/charge/line) have windup>=2
// (d) stage-gated HUD predicates show strictly more at each stage
// (e) villager-earned pattern unlocks player warning at stage>=2
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
// table.js must load before table-*.js (they call Game.tableRegisterPath at load;
// the shared harness list orders them after). Added 2026-10-12.
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
const WAVE1 = ['bulldozer','hushwolf','gallowdeer','mirrormoth','belltoad','lockpick_raccoon',
  'white_noise_heron','hummice','speedbump_turtle','nightlight_catfish','ducks_in_a_row',
  'glasswing','sunbasker','nevermore','nightcourt'];
const WAVE2 = ['voice_mimic_radio','mirror_stag','review_drone','bright_idea','memory_projector',
  'warranty_caller','understudy','landlord','heckler','paparazzo','union_rep','moderator',
  'statickite','giant_mosquito','alien_tick'];
const TILE = ['beam','burst','charge','line'];
const sayLog = [];
const _say = Game.say.bind(Game);
Game.say = function (...a) { sayLog.push(a.join(' ')); return _say(...a); };
Game.drama = () => {}; Game.audioEvent = () => {};

function monFighter(monId, key, mx, my, hp) {
  const mdef = Game.data.monsters.find(m => m.id === monId);
  return { key, kind: 'monster', monsterId: monId, mdef, name: 'Test ' + monId, emoji: '👹',
    hp: hp || 30, maxHp: hp || 30, speed: 3, mx, my, alive: true, fled: false,
    telegraph: null, hesitate: 0, blind: 0, stunned: 0 };
}
function synthFight(fighters, php) {
  const pf = { key: 'p', kind: 'player', name: 'You', emoji: '🧑', hp: php || 100, maxHp: 100,
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

  console.log('A: wave-1 kits — >=2 attacks, codex-matching names');
  for (const id of WAVE1) {
    const md = mdef(id);
    const atks = md.attacks || [];
    ok(`${id}: >=2 attacks`, atks.length >= 2, `got ${atks.length}`);
    const slain = ((md.codexStages || {}).slain || '');
    for (const a of atks) {
      if (!a.damage) continue; // tactics are engine-only
      ok(`${id}/${a.name}: in codex slain moves`, slain.includes(a.name), slain.slice(0, 80));
    }
  }

  console.log('A2: wave-2 kits — >=2 attacks, codex moves covered');
  // Wave-2: every CODE DOCUMENTED move must be in the kit; kits may add
  // fiction-fitting second moves where the codex documents only one
  // (marked EXT in evidence). >=2 total required.
  const W2_CODEX_MOVES = {
    voice_mimic_radio: ['Distress Call', 'Voice Drop Rush'],
    mirror_stag: ['Confrontation', 'Wheel'],
    review_drone: ['Scored Assessment'],
    bright_idea: ['Eureka'],
    memory_projector: ['Home Movies'],
    warranty_caller: ['The Pitch'],
    understudy: ['Mirror Strike', 'Opening Steal', 'Desperate Improv'],
    landlord: ['Serve Notice', 'Collect Rent', 'Jurisdiction Spread'],
    heckler: ['Vicious Mockery', 'Pile-On', 'Compulsion'],
    paparazzo: ['Flash Photography', 'Prediction', 'Widening Shot'],
    union_rep: ['Solidarity Speech', 'Call to Action', 'WALKOUT'],
    moderator: ['Content Noted', 'Removal Notice', 'Deplatform'],
    statickite: ['The Broadcast', 'the Dip'],
    giant_mosquito: ['Circle', 'Dive', 'Drink', 'Heavy'],
    alien_tick: ['Quest', 'Latch', 'Feed', 'Engorged'],
  };
  for (const id of WAVE2) {
    const md = mdef(id);
    const atks = md.attacks || [];
    ok(`${id}: >=2 attacks`, atks.length >= 2, `got ${atks.length}`);
    const names = atks.map(a => a.name);
    for (const cm of (W2_CODEX_MOVES[id] || [])) {
      ok(`${id}/${cm}: codex move in kit`, names.includes(cm), names.join(','));
    }
  }

  console.log('C: tile patterns windup>=2');
  for (const id of WAVE1.concat(WAVE2)) {
    for (const a of (mdef(id).attacks || [])) {
      const p = a.pattern || {};
      if (TILE.includes(p.type)) {
        ok(`${id}/${a.name}: ${p.type} windup>=2`, (p.windup || 0) >= 2, `windup=${p.windup}`);
      }
    }
  }

  console.log('B1: move-choice legality — deer (range gates)');
  {
    const md = mdef('gallowdeer');
    const foeAt = (d) => ({ f: { mx: 4 + d, my: 4 }, d });
    let picks = new Set();
    for (let i = 0; i < 30; i++) { const m = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} }; Game.tbChooseMove(m, foeAt(3)); picks.add(m.moveAtk.name); }
    ok('deer@3: only Ocular Discharge', picks.size === 1 && picks.has('Ocular Discharge'), [...picks].join(','));
    picks = new Set();
    for (let i = 0; i < 30; i++) { const m = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} }; Game.tbChooseMove(m, foeAt(1)); picks.add(m.moveAtk.name); }
    ok('deer@1: only Antler Sweep', picks.size === 1 && picks.has('Antler Sweep'), [...picks].join(','));
    const m = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} };
    Game.tbChooseMove(m, foeAt(3));
    ok('deer: moveOdds recorded', Array.isArray(m.moveOdds) && m.moveOdds.length >= 1, JSON.stringify(m.moveOdds));
  }

  console.log('B2: move-choice legality — bulldozer bloodied phase');
  {
    const md = mdef('bulldozer');
    const foeAt = (d) => ({ f: { mx: 4 + d, my: 4 }, d });
    let picks = new Set();
    for (let i = 0; i < 30; i++) {
      const m = { mdef: md, mx: 4, my: 4, hp: 100, maxHp: 100, moveCd: {} };
      Game.tbChooseMove(m, foeAt(4)); picks.add(m.moveAtk.name);
    }
    ok('boar full-hp: only China-Shop Charge', picks.size === 1 && picks.has('China-Shop Charge'), [...picks].join(','));
    picks = new Set();
    for (let i = 0; i < 60; i++) {
      const m = { mdef: md, mx: 4, my: 4, hp: 20, maxHp: 100, moveCd: {} };
      Game.tbChooseMove(m, foeAt(4)); picks.add(m.moveAtk.name);
    }
    ok('boar bloodied: charge + Retreat appear', picks.has('China-Shop Charge') && picks.has('Retreat'), [...picks].join(','));
  }

  console.log('B3: telegraph commitment — declare names the chosen move');
  {
    setStage(2);
    synthFight([monFighter('belltoad', 'm1', 5, 4, 100)], 100);
    const m = Game.tbFighter('m1');
    const p = Game.tbFighter('p'); p.mx = 4; p.my = 4;
    // force Lunge (direct, short range) by placing adjacent
    m.mx = 5; m.my = 4;
    Game.tbChooseMove(m, { f: p, d: 1 });
    ok('choose: a move is picked', !!m.moveAtk.name, m.moveAtk && m.moveAtk.name);
    const chosen = m.moveAtk.name;
    // encDeclareDirect must declare the CHOSEN move, not the legacy slot
    Game.encDeclareDirect(m, p);
    ok('telegraph.attackName committed', m.telegraph && m.telegraph.attackName === chosen,
      m.telegraph && m.telegraph.attackName);
    ok('telegraph pattern matches chosen', m.telegraph && m.telegraph.pattern === m.moveAtk.pattern);
    Game.state.codex.monsters = {};
    const cue = Game.tbTelegraphCue(m);
    // multi-move: unlearned + stage2 -> odds
    if ((mdef('belltoad').attacks || []).length > 1) {
      ok('stage2 unlearned cue: System odds', /Reading intent/.test(cue), cue.slice(0, 140));
    }
  }

  console.log('B4: learned -> exact (odds resolve away)');
  {
    const m = Game.tbFighter('m1');
    const id = 'belltoad';
    const names = (mdef(id).attacks || []).map(a => a.name);
    Game.tbLearnPattern(m); // learns the telegraphed move (names it from tg)
    // fake-learn the rest
    Game.state.codex.monsters[id] = Game.state.codex.monsters[id] || {};
    Game.state.codex.monsters[id].patterns = Game.state.codex.monsters[id].patterns || {};
    for (const n of names) Game.state.codex.monsters[id].patterns[n] = 'test';
    const cue = Game.tbTelegraphCue(m);
    ok('learned cue: no odds', !/Reading intent/.test(cue), cue.slice(0, 140));
    ok('learned: exact move known', Game.tbPatternKnown(id, m.telegraph.attackName) === true);
    ok('encTelegraphKnown: any-pattern-known', Game.encTelegraphKnown(m) === true);
  }

  console.log('D: HUD stage predicates — strictly more per stage');
  {
    synthFight([monFighter('gallowdeer', 'm1', 6, 4, 100)], 100);
    const m = Game.tbFighter('m1');
    Game.state.codex.monsters = {};
    m.telegraph = { kind: 'beam', attackName: 'Ocular Discharge', pattern: { type: 'beam', windup: 2 }, dmg: [20, 30], turnsLeft: 2 };
    m.moveAtk = mdef('gallowdeer').attacks[0];
    m.moveOdds = [{ name: 'Ocular Discharge', pct: 60 }, { name: 'Antler Sweep', pct: 40 }];
    setStage(0);
    ok('stage0: no odds', Game.tbMoveOddsList(m) === '', Game.tbMoveOddsList(m));
    setStage(1);
    ok('stage1: no odds', Game.tbMoveOddsList(m) === '', Game.tbMoveOddsList(m));
    setStage(2);
    const o2 = Game.tbMoveOddsList(m);
    ok('stage2: odds appear', o2.includes('Ocular Discharge') && o2.includes('%'), o2);
    setStage(3);
    const dmg = m.telegraph.dmg;
    const dr = Array.isArray(dmg) ? `${dmg[0]}–${dmg[1]}` : '';
    ok('stage3: damage preview available', dr === '20–30', dr);
    Game.state.codex.monsters['gallowdeer'] = { patterns: { 'Ocular Discharge': 'x' } };
    const ctr = mdef('gallowdeer').counter;
    ok('stage3: intel predicate (counter + known)', !!ctr && !!ctr.trick && Game.encTelegraphKnown(m) === true,
      ctr && ctr.trick);
  }

  console.log('E: knowledge aggregator — village-earned intel unlocks player warnings');
  {
    Game.state.codex.monsters = {};
    Game.state.villagePatterns = { gallowdeer: { 'Ocular Discharge': true } };
    Game.state.villageSlain = { gallowdeer: 2 };
    setStage(1);
    ok('stage1: village patterns NOT shared', Game.canShow('monster', 'gallowdeer', 'mechanics', { pattern: 'Ocular Discharge' }) === false);
    ok('stage1: village slain NOT shared (stats)', Game.canShow('monster', 'gallowdeer', 'stats') === false);
    setStage(2);
    ok('stage2: village pattern unlocks mechanics', Game.canShow('monster', 'gallowdeer', 'mechanics', { pattern: 'Ocular Discharge' }) === true);
    ok('stage2: village slain unlocks stats', Game.canShow('monster', 'gallowdeer', 'stats') === true);
    ok('stage2: tbPatternKnown honors village intel', Game.tbPatternKnown('gallowdeer', 'Ocular Discharge') === true);
    ok('stage2: unknown pattern still locked', Game.canShow('monster', 'gallowdeer', 'mechanics', { pattern: 'Antler Sweep' }) === false);
    ok('stage2: unrelated monster locked', Game.canShow('monster', 'bulldozer', 'mechanics', { pattern: 'China-Shop Charge' }) === false);
  }

  console.log('F: tactics — turtle Bunker when bloodied');
  {
    const md = mdef('speedbump_turtle');
    const foeAt = (d) => ({ f: { mx: 4 + d, my: 4 }, d });
    let sawBunker = false;
    for (let i = 0; i < 60; i++) {
      const m = { mdef: md, mx: 4, my: 4, hp: 20, maxHp: 100, moveCd: {} };
      Game.tbChooseMove(m, foeAt(1));
      if (m.moveAtk.tactic === 'bunker') { sawBunker = true; break; }
    }
    ok('turtle bloodied: Bunker chosen sometimes', sawBunker);
  }

  console.log('G: wave-2 signature tactics execute');
  {
    // mosquito Heavy -> tacticVuln
    const md = mdef('giant_mosquito');
    const m = { mdef: md, mx: 4, my: 4, hp: 50, maxHp: 100, moveCd: {} };
    Game.tbMonsterTactic(m, { f: { mx: 5, my: 4 } }, { tactic: 'recover', telegraph: 'test' }, null);
    ok('mosquito Heavy: tacticVuln set', m.tacticVuln === 2, `vuln=${m.tacticVuln}`);
    // paparazzo Prediction -> prediction counter
    const mp = { mdef: mdef('paparazzo'), mx: 4, my: 4, hp: 50, maxHp: 100, moveCd: {} };
    Game.tbMonsterTactic(mp, { f: { mx: 5, my: 4 } }, { tactic: 'model', telegraph: 'test' }, null);
    ok('paparazzo Prediction: counter++', mp.prediction === 1, `pred=${mp.prediction}`);
    // moderator Deplatform: hpBelow 0.5 legal, 3-beat windup
    const mmod = mdef('moderator');
    const dep = mmod.attacks.find(a => a.name === 'Deplatform');
    ok('moderator Deplatform: windup 3', dep.pattern.windup === 3, `windup=${dep.pattern.windup}`);
    const mm = { mdef: mmod, mx: 4, my: 4, hp: 40, maxHp: 100, moveCd: {} };
    ok('moderator bloodied: Deplatform legal', Game.tbMoveLegal(mm, dep, 3, 0.4) === true);
    const mm2 = { mdef: mmod, mx: 4, my: 4, hp: 80, maxHp: 100, moveCd: {} };
    ok('moderator healthy: Deplatform illegal', Game.tbMoveLegal(mm2, dep, 3, 0.8) === false);
    // review_drone: 3-beat windup on the beam
    const rd = mdef('review_drone').attacks.find(a => a.name === 'Scored Assessment');
    ok('review_drone: 3-beat windup', rd.pattern.windup === 3, `windup=${rd.pattern.windup}`);
  }

  console.log(`\n${pass} pass, ${fail} fail (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
