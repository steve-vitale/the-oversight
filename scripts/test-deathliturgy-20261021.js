'use strict';
// DEATH-LITURGY FIX (2026-10-21) — RED->GREEN proof for three death-fiction blanks
// (findings backlog, arm fleshout-20261021T0015Z, axis scale-onramp).
//
// Blank (a): one death fires TWO cause lines ('died of thirst' + 'succumbed to
//   the fever') — the sickness tick narrates a death whose real cause was said
//   earlier in the same pass.
// Blank (b): villageEvent('death') fires TWICE for one death — registerDeath
//   fires it internally AND the vDie call sites fire it directly.
// Blank (c): 'The village is N now.' — a cryptic headcount after deaths
//   (starvation / wound / sickness lines).
//
// Usage: node scripts/test-deathliturgy-20261021.js        -> beat fixtures (RED->GREEN)
//        node scripts/test-deathliturgy-20261021.js --det   -> determinism gate
//        DET_LABEL=control|fixed node ... --det              -> digest arm for the gate
//
// Exit 0 = all blanks fixed (GREEN). Exit 1 = at least one blank present (RED).
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const fails = [];
function check(name, cond, detail) {
  console.log((cond ? '  PASS ' : '  FAIL ') + name + (cond ? '' : ' :: ' + detail));
  if (!cond) fails.push(name);
}

async function freshGame(seed, captured) {
  const { Game } = await quietLog(async () => loadGame({ seed, narration: true, mode: 'test-deathliturgy' }));
  await quietLog(async () => setupGame(Game));
  Game.map.px = 4; Game.map.py = 4; // at haven: the grief beats are presence-gated
  const orig = Game.say.bind(Game);
  Game.say = (m) => { captured.push(String(m)); return orig(m); };
  return Game;
}
function npcVid(Game) {
  return (Game.state.village.roster || []).find(id => id !== Game.villagerId);
}
function npcVid2(Game, not) {
  return (Game.state.village.roster || []).find(id => id !== Game.villagerId && id !== not);
}

// ---------- Blank (a): thirst death, then the sickness tick must not add a second cause line
async function blankA() {
  console.log('BLANK (a) — one death, one cause line');
  const captured = [];
  const Game = await freshGame(42421, captured);
  const v = Game.state.village;
  const vid = npcVid(Game);
  v.health = v.health || {};
  for (const id of (v.roster || [])) if (id !== Game.villagerId) v.health[id] = 100;
  v.health[vid] = 1;                    // one bad day from death
  v.water = { clean: 0, dirty: 0 };     // dry cistern
  v.sick = v.sick || {};
  v.sick[vid] = { name: 'gut rot', daysLeft: 5, severity: 1 }; // sick AND thirsty
  captured.length = 0;
  await quietLog(async () => Game.villageDrinks());
  const thirstSaid = captured.some(l => l.includes('died of thirst'));
  const deadAfterThirst = (Game.vpOf(vid) || {}).dead;
  await quietLog(async () => Game.villageSicknessTick());
  const feverLines = captured.filter(l => l.includes('succumbed to'));
  check('A1 thirst death registered through the real pipeline', thirstSaid && deadAfterThirst,
    'thirstSaid=' + thirstSaid + ' dead=' + deadAfterThirst + ' :: ' + captured.slice(-3).join(' | '));
  check('A2 sick record cleaned for the corpse', !v.sick[vid], 'sick record survived');
  check('A3 no second cause line for the same death', feverLines.length === 0,
    'got: ' + feverLines.join(' | '));
  console.log('  beats:');
  captured.filter(l => l.includes('💀')).forEach(l => console.log('    ' + l));
}

// ---------- Blank (b): one death = one village grief beat
async function blankB() {
  console.log('BLANK (b) — one death, one village beat');
  const captured = [];
  const Game = await freshGame(42422, captured);
  const vid = npcVid(Game);
  let beats = 0;
  const origVE = Game.villageEvent.bind(Game);
  Game.villageEvent = function (t, o) { if (t === 'death') beats++; return origVE(t, o); };
  // the real pipeline: lethal hurt routes through registerDeath, which fires
  // villageEvent('death') internally (corpses.js)
  await quietLog(async () => Game.hurtVillager(vid, 99999, 'monster', null));
  // then the vDie call-site pattern: pre-fix = the old unconditional line
  // (verbatim of the old call sites); post-fix = the guarded deathGriefBeat helper
  if (typeof Game.deathGriefBeat === 'function') Game.deathGriefBeat(vid);
  else Game.villageEvent('death');
  const dead = (Game.vpOf(vid) || {}).dead;
  const griefSaid = captured.filter(l => l.includes("Nobody's talking much")).length;
  check('B1 villager died through the real pipeline', !!dead, 'not dead');
  check('B2 villageEvent(death) fired exactly once', beats === 1, beats + ' beats fired');
  check('B3 grief line said exactly once', griefSaid === 1, griefSaid + ' grief lines');
  // static: the real call sites must use the guarded helper, not the raw event.
  // The helper's own body contains the single sanctioned raw call.
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
  const helperStart = src.indexOf('deathGriefBeat(vid) {');
  const helperEnd = src.indexOf('},', helperStart);
  const helperBody = src.slice(helperStart, helperEnd);
  const rawInHelper = (helperBody.match(/this\.villageEvent\('death'\)/g) || []).length;
  const srcNoHelper = src.slice(0, helperStart) + src.slice(helperEnd);
  const rawOutside = (srcNoHelper.match(/this\.villageEvent\('death'\)/g) || []).length;
  const helperUses = (srcNoHelper.match(/deathGriefBeat\(/g) || []).length;
  check('B4 game.js call sites route through deathGriefBeat',
    rawOutside === 0 && rawInHelper === 1 && helperUses >= 3,
    'raw outside helper=' + rawOutside + ' raw in helper=' + rawInHelper + ' helper uses=' + helperUses);
  const hg = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'havenGrowth.js'), 'utf8');
  check('B5 havenGrowth sortie site guarded too',
    !/this\.villageEvent\('death'\)/.test(hg) && /deathGriefBeat\(leader\)/.test(hg),
    'sortie site still fires the raw event');
}

// ---------- Blank (c): grief beats name the loss; no headcount
async function blankC() {
  console.log('BLANK (c) — grief, not headcount');
  const captured = [];
  const Game = await freshGame(42423, captured);
  const v = Game.state.village;
  const vid = npcVid(Game);
  (v.health = v.health || {})[vid] = 5;
  captured.length = 0;
  await quietLog(async () => Game.hurtFromStarvation(vid, 10));
  const line = captured.find(l => l.includes('starved'));
  check('C1 starvation line names the loss, no headcount',
    !!line && /💀/.test(line) && !/The village is \d+ now/.test(line),
    'got: ' + (line || '(none)'));
  // the shared grief renderer covers the wound and sickness sites too
  const g1 = typeof Game.griefLine === 'function'
    ? Game.griefLine(vid, 'Iman', ' is gone. The wound was too much.')
    : '💀 Iman is gone. The wound was too much. The village is 5 now.';
  const g2 = typeof Game.griefLine === 'function'
    ? Game.griefLine(vid, 'James', ' succumbed to the fever.')
    : '💀 James succumbed to the fever. The village is 1 now.';
  check('C2 wound coda is grief, not headcount',
    /💀/.test(g1) && /Iman/.test(g1) && !/The village is \d+ now/.test(g1), 'got: ' + g1);
  check('C3 sickness coda is grief, not headcount',
    /💀/.test(g2) && /James/.test(g2) && !/The village is \d+ now/.test(g2), 'got: ' + g2);
  console.log('  beats:');
  console.log('    ' + (line || '(none)'));
  console.log('    ' + g1);
  console.log('    ' + g2);
}

// ---------- Determinism gate: fiction-only change ----------------------------
// Paired seeds drive the changed code paths; the scrubbed state digest must be
// byte-identical control-vs-fixed. Exclusions (intended fiction surface):
//   Game.log text (the say-log — liturgy rewrites it),
//   state.village.awayNews text (death lines queue there when away),
//   state.village.needs + state.village.grief (the grief beat's fear/social
//     bump now applies once per death instead of twice — the dedupe itself).
// Everything else (roster, health, pantry, corpses, telemetry, fallen) must match.
function canon(o, seen, depth) {
  if (depth > 40) return '"<deep>"';
  if (o === null || o === undefined) return 'null';
  if (typeof o === 'function') return '"<fn>"';
  if (typeof o !== 'object') return JSON.stringify(o);
  if (seen.has(o)) return '"<cycle>"';
  seen.add(o);
  if (Array.isArray(o)) return '[' + o.map(x => canon(x, seen, depth + 1)).join(',') + ']';
  return '{' + Object.keys(o).sort().map(k => {
    if (k === 'needs' || k === 'grief' || k === 'awayNews') return null; // intended fiction surface
    return JSON.stringify(k) + ':' + canon(o[k], seen, depth + 1);
  }).filter(Boolean).join(',') + '}';
}
function stateDigest(Game) {
  const seen = new Set();
  const h = crypto.createHash('sha256');
  h.update(canon(Game.state, seen, 0));
  h.update('|loglen=' + (Game.log || []).length);
  return h.digest('hex');
}
async function driveChangedPaths(Game) {
  const v = Game.state.village;
  Game.map.px = 4; Game.map.py = 4;
  const vid = npcVid(Game);
  const vid2 = npcVid2(Game, vid);
  // (a)+(b-internal): thirst death of a sick villager, then the sickness tick
  v.health = v.health || {};
  for (const id of (v.roster || [])) if (id !== Game.villagerId) v.health[id] = 100;
  v.health[vid] = 1;
  v.water = { clean: 0, dirty: 0 };
  v.sick = v.sick || {};
  v.sick[vid] = { name: 'gut rot', daysLeft: 5, severity: 1 };
  await quietLog(async () => Game.villageDrinks());
  await quietLog(async () => Game.villageSicknessTick());
  // (c) starvation line
  (v.health[vid2] = 5);
  await quietLog(async () => Game.hurtFromStarvation(vid2, 10));
  // (b) vDie pattern: real pipeline then the call-site beat
  const vid3 = npcVid2(Game, vid2);
  if (vid3 && !(Game.vpOf(vid3) || {}).dead) {
    await quietLog(async () => Game.hurtVillager(vid3, 99999, 'monster', null));
    if (typeof Game.deathGriefBeat === 'function') Game.deathGriefBeat(vid3);
  }
}
async function detGate() {
  const label = process.env.DET_LABEL || 'run';
  const seeds = [42421, 42422, 42423, 42424, 42425, 42426, 42427, 42428];
  const out = [];
  for (const seed of seeds) {
    const { Game } = await quietLog(async () => loadGame({ seed, narration: false, mode: 'test-deathliturgy-det' }));
    await quietLog(async () => setupGame(Game));
    await driveChangedPaths(Game);
    out.push({ seed, digest: stateDigest(Game) });
  }
  const p = path.join(__dirname, 'det-deathliturgy-' + label + '.json');
  fs.writeFileSync(p, JSON.stringify(out, null, 1));
  console.log('wrote ' + p + ' (' + out.length + ' seeds)');
}

async function main() {
  if (process.argv.includes('--det')) { await detGate(); return; }
  console.log('== death-liturgy RED->GREEN fixtures ==');
  await blankA();
  await blankB();
  await blankC();
  console.log(fails.length ? ('\nRESULT: RED — ' + fails.length + ' blank(s) present: ' + fails.join(', '))
                          : '\nRESULT: GREEN — all three blanks fixed');
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
